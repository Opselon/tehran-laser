/** Notification abstraction (contract §49, §50, §51, §210).
 *
 *  Design rules:
 *  - Primary operations (booking creation / confirmation) must never fail because a
 *    notification channel was slow or unreachable.
 *  - Channels are isolated: Telegram error does not throw out of booking flow.
 *  - Deduplication is atomic in D1: a duplicate event is ignored via dedupe_key.
 *  - Secrets (bot token, chat id) stay server-side, read from private settings or env.
 */

import { one, run } from '../db/query';
import type { Queryable } from '../db/query';
import { getSettingValue } from './repositories';

export type NotificationChannel = 'telegram' | 'whatsapp';

export interface NotificationPayload {
  eventType: 'booking.created' | 'booking.confirmed' | 'booking.rejected' | 'booking.cancelled' | 'booking.rescheduled';
  bookingId: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  pricingCategory: 'male' | 'female';
  startsAtIso: string;
  quotedAmount: number;
  discountAmount: number;
  currency: string;
  rejectionReason?: string | null;
}

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<{ ok: boolean; error?: string }>;
}

/* ── Telegram Provider ────────────────────────────────────────── */

export class TelegramProvider implements NotificationProvider {
  readonly channel = 'telegram' as const;

  constructor(
    private readonly botToken: string,
    private readonly chatId: string,
  ) {}

  async send(payload: NotificationPayload): Promise<{ ok: boolean; error?: string }> {
    const text = formatTelegramMessage(payload);
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

function formatTelegramMessage(p: NotificationPayload): string {
  const titles: Record<NotificationPayload['eventType'], string> = {
    'booking.created': '🔔 <b>رزرو جدید ثبت شد</b>',
    'booking.confirmed': '✅ <b>رزرو تأیید شد</b>',
    'booking.rejected': '❌ <b>رزرو رد شد</b>',
    'booking.cancelled': '🚫 <b>رزرو لغو شد</b>',
    'booking.rescheduled': '🔄 <b>زمان رزرو تغییر کرد</b>',
  };

  const categoryLabel = p.pricingCategory === 'female' ? 'بانوان' : 'آقایان';
  const priceFormatted = (p.quotedAmount - p.discountAmount).toLocaleString('fa-IR');

  let msg = `${titles[p.eventType]}

<b>کد رهگیری:</b> <code>${escapeHtml(p.reference)}</code>
<b>مشتری:</b> ${escapeHtml(p.customerName)} (${escapeHtml(p.customerPhone)})
<b>خدمت:</b> ${escapeHtml(p.serviceName)} (${categoryLabel})
<b>زمان (UTC):</b> ${p.startsAtIso}
<b>مبلغ نهایی:</b> ${priceFormatted} ${escapeHtml(p.currency)}`;

  if (p.rejectionReason) {
    msg += `\n<b>علت رد:</b> ${escapeHtml(p.rejectionReason)}`;
  }

  return msg;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── WhatsApp Provider Abstraction (§51) ───────────────────────── */

export class WhatsAppProvider implements NotificationProvider {
  readonly channel = 'whatsapp' as const;

  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  async send(payload: NotificationPayload): Promise<{ ok: boolean; error?: string }> {
    // Contract §51: vendor-agnostic HTTP call; disabled until clinic configures a provider.
    if (!this.apiUrl || !this.apiKey) {
      return { ok: false, error: 'سرویس‌دهنده واتس‌اپ تنظیم نشده است.' };
    }
    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

/* ── Dispatch Service ─────────────────────────────────────────── */

export async function dispatchNotification(
  db: Queryable,
  payload: NotificationPayload,
  channel: NotificationChannel,
): Promise<void> {
  const dedupeKey = `${payload.eventType}:${payload.bookingId}:${channel}`;
  const nowIso = new Date().toISOString();

  // Deduplication check: if an event with this key exists, don't duplicate (§163).
  const existing = await one<{ id: string; status: string }>(
    db,
    `SELECT id, status FROM notification_events WHERE dedupe_key = ?`,
    dedupeKey,
  );
  if (existing) return;

  const eventId = crypto.randomUUID();
  await run(
    db,
    `INSERT INTO notification_events (id, dedupe_key, event_type, booking_id, channel, status, attempts, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', 0, ?)`,
    eventId,
    dedupeKey,
    payload.eventType,
    payload.bookingId,
    channel,
    nowIso,
  );

  let provider: NotificationProvider | null = null;

  if (channel === 'telegram') {
    const [enabled, token, chatId] = await Promise.all([
      getSettingValue(db, 'telegram_enabled'),
      getSettingValue(db, 'telegram_bot_token'),
      getSettingValue(db, 'telegram_chat_id'),
    ]);
    if (enabled === 'true' && token && chatId) {
      provider = new TelegramProvider(token, chatId);
    }
  } else if (channel === 'whatsapp') {
    const [enabled, url, key] = await Promise.all([
      getSettingValue(db, 'whatsapp_enabled'),
      getSettingValue(db, 'whatsapp_api_url'),
      getSettingValue(db, 'whatsapp_api_key'),
    ]);
    if (enabled === 'true' && url && key) {
      provider = new WhatsAppProvider(url, key);
    }
  }

  if (!provider) {
    // Channel not enabled or credentials not configured — mark as not sent without error.
    await run(
      db,
      `UPDATE notification_events SET status = 'failed', last_error = 'سرویس‌دهنده فعال یا تنظیم نشده است.', attempts = 1 WHERE id = ?`,
      eventId,
    );
    return;
  }

  const result = await provider.send(payload);
  const finishIso = new Date().toISOString();

  if (result.ok) {
    await run(
      db,
      `UPDATE notification_events SET status = 'sent', sent_at = ?, attempts = attempts + 1 WHERE id = ?`,
      finishIso,
      eventId,
    );
  } else {
    await run(
      db,
      `UPDATE notification_events SET status = 'failed', last_error = ?, attempts = attempts + 1 WHERE id = ?`,
      (result.error ?? 'خطای نامشخص').slice(0, 500),
      eventId,
    );
  }
}
