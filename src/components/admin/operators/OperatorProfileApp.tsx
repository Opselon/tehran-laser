import { useCallback, useMemo, useState } from 'react';
import type {
  OperatorAgendaItem,
  OperatorCapabilities,
  OperatorCreateInput,
} from '../../../domain/operators/operators';
import {
  formatPercent,
  formatPhone,
  formatToman,
  operatorStatusOf,
  workdaysLabel,
} from '../../../domain/operators/operators';
import type { OperatorCatalog, OperatorDetailResponse, IssuedAccountResponse } from './api-client';
import {
  ApiClientError,
  archiveOperator,
  assignBookingOperator,
  fetchOperator,
  issueAccount,
  restoreOperator,
  setOperatorActive,
  updateOperator,
} from './api-client';
import { OperatorForm } from './OperatorForm';
import { AccountDialog } from './OperatorDialogs';
import { useToasts } from './useRoster';
import { IconReact } from '../../ui/IconReact';
import { formatJalaliDate, formatJalaliDateLong } from '../../../lib/datetime/jalali';

interface OperatorProfileAppProps {
  initial: OperatorDetailResponse;
  catalog: OperatorCatalog;
  services: Array<{ id: string; name: string }>;
  capabilities: OperatorCapabilities;
}

type TabKey = 'performance' | 'agenda' | 'profile';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'performance', label: 'عملکرد', icon: 'chart' },
  { key: 'agenda', label: 'برنامه امروز', icon: 'calendar' },
  { key: 'profile', label: 'پروفایل و دسترسی', icon: 'users' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: 'در انتظار تأیید',
  confirmed: 'تأییدشده',
  completed: 'انجام‌شده',
  cancelled: 'لغوشده',
  no_show: 'عدم حضور',
  rejected: 'ردشده',
};

/**
 * Operator profile island: performance, today's agenda and the profile/account
 * panel. It re-reads the whole detail after every mutation, because a shift or
 * status change also moves the KPIs, the coverage and the assignable pool.
 */
export function OperatorProfileApp({
  initial,
  catalog,
  services,
  capabilities,
}: OperatorProfileAppProps) {
  const [detail, setDetail] = useState<OperatorDetailResponse>(initial);
  const [tab, setTab] = useState<TabKey>('performance');
  const [editing, setEditing] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const { toasts, push, dismiss } = useToasts();

  const operator = detail.operator;
  const status = operatorStatusOf(operator);

  const reload = useCallback(async () => {
    try {
      const fresh = await fetchOperator(operator.id);
      setDetail(fresh);
    } catch (err) {
      push(
        'error',
        err instanceof ApiClientError ? err.message : 'بارگذاری مجدد پروفایل ناموفق بود.',
      );
    }
  }, [operator.id, push]);

  const run = useCallback(
    async (action: () => Promise<unknown>, message: string) => {
      setBusy(true);
      try {
        await action();
        await reload();
        push('success', message);
        return true;
      } catch (err) {
        push('error', err instanceof ApiClientError ? err.message : 'عملیات انجام نشد.');
        return false;
      } finally {
        setBusy(false);
      }
    },
    [reload, push],
  );

  const submitEdit = async (payload: OperatorCreateInput) => {
    setServerErrors(null);
    try {
      await updateOperator(operator.id, payload);
      setEditing(false);
      await reload();
      push('success', 'پروفایل به‌روزرسانی شد.');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerErrors(err.fields);
        push('error', err.message);
      }
    }
  };

  const assign = async (item: OperatorAgendaItem) => {
    setAssigning(item.id);
    try {
      await assignBookingOperator(item.id, operator.id);
      await reload();
      push('success', `جلسه ${item.reference} به ${operator.displayName} تخصیص یافت.`);
    } catch (err) {
      push('error', err instanceof ApiClientError ? err.message : 'تخصیص جلسه ناموفق بود.');
    } finally {
      setAssigning(null);
    }
  };

  const totals = detail.stats.totals;
  const servicesSold = detail.stats.topServices;

  return (
    <div className="ops-shell ops-profile">
      <a className="ops-back" href="/admin/operators">
        <IconReact name="arrowRight" size={15} />
        بازگشت به فهرست تیم
      </a>

      {/* ── Identity hero ─────────────────────────────────────────── */}
      <section className="ops-profile__hero" aria-labelledby="op-profile-name">
        <div className="ops-profile__identity">
          <div
            className="ops-avatar ops-avatar--lg"
            style={{
              background: `linear-gradient(150deg, ${operator.avatarColor}, rgba(10, 16, 24, 0.9))`,
            }}
            aria-hidden="true"
          >
            {operator.initials}
          </div>
          <div className="ops-profile__name">
            <h1 id="op-profile-name">{operator.displayName}</h1>
            <p>
              {operator.title} · {operator.roleLabel}
            </p>
            <div className="ops-profile__badges">
              <span className={`ops-status ops-status--${status}`}>
                <span className="ops-status__dot" aria-hidden="true" />
                {status === 'active' ? 'فعال' : status === 'inactive' ? 'غیرفعال' : 'بایگانی‌شده'}
              </span>
              <span className="ops-code">{operator.code}</span>
              {operator.account ? (
                <span className="ops-status ops-status--active" title="حساب ورود دارد">
                  <IconReact name="lock" size={11} /> حساب فعال
                </span>
              ) : (
                <span className="ops-status ops-status--inactive">بدون حساب ورود</span>
              )}
              <span className="ops-status ops-status--archived">
                {workdaysLabel(operator.workdays)}
              </span>
            </div>
          </div>
        </div>

        <div className="ops-hero__actions">
          {capabilities.canWrite && status !== 'archived' && (
            <button
              type="button"
              className="ops-btn ops-btn--primary"
              onClick={() => setEditing(true)}
            >
              <IconReact name="edit" size={15} /> ویرایش پروفایل
            </button>
          )}
          {capabilities.canManageAccounts && status !== 'archived' && (
            <button type="button" className="ops-btn" onClick={() => setAccountOpen(true)}>
              <IconReact name="lock" size={15} /> {operator.account ? 'بازنشانی رمز' : 'صدور حساب'}
            </button>
          )}
          {capabilities.canWrite && status !== 'archived' && (
            <button
              type="button"
              className="ops-btn ops-btn--ghost"
              disabled={busy}
              onClick={() =>
                void run(
                  () => setOperatorActive(operator.id, !operator.active),
                  operator.active ? 'اپراتور غیرفعال شد.' : 'اپراتور فعال شد.',
                )
              }
            >
              {operator.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
            </button>
          )}
          {capabilities.canWrite && status !== 'archived' && (
            <button
              type="button"
              className="ops-btn ops-btn--danger"
              disabled={busy}
              onClick={() => {
                if (
                  confirm(`پروفایل ${operator.displayName} بایگانی شود؟ سابقه جلسات حفظ می‌شود.`)
                ) {
                  void run(() => archiveOperator(operator.id), 'پروفایل بایگانی شد.');
                }
              }}
            >
              بایگانی
            </button>
          )}
          {capabilities.canWrite && status === 'archived' && (
            <button
              type="button"
              className="ops-btn ops-btn--primary"
              disabled={busy}
              onClick={() => void run(() => restoreOperator(operator.id), 'پروفایل بازیابی شد.')}
            >
              <IconReact name="refresh" size={15} /> بازیابی
            </button>
          )}
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="ops-tabs" role="tablist" aria-label="بخش‌های پروفایل">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            id={`tab-${entry.key}`}
            aria-selected={tab === entry.key}
            aria-controls={`panel-${entry.key}`}
            className="ops-tab"
            onClick={() => setTab(entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/* ── Performance ──────────────────────────────────────────── */}
      {tab === 'performance' && (
        <div
          role="tabpanel"
          id="panel-performance"
          aria-labelledby="tab-performance"
          className="ops-panel"
        >
          <div className="ops-section-head">
            <IconReact name="chart" size={16} />
            <h3>عملکرد ۳۰ روز گذشته</h3>
            <span className="ops-count">
              {formatJalaliDate(detail.stats.range.from)} تا{' '}
              {formatJalaliDate(detail.stats.range.to)}
            </span>
            <p>درآمد فقط از جلسات تکمیل‌شده و پس از کسر تخفیف محاسبه می‌شود.</p>
          </div>

          <div className="ops-metrics">
            <Metric label="جلسات انجام‌شده" value={fa(totals.sessions)} />
            <Metric label="درآمد" value={formatToman(totals.revenue)} />
            <Metric label="میانگین هر جلسه" value={formatToman(totals.averageTicket)} />
            <Metric label="جلسات پیش‌رو" value={fa(totals.upcoming)} />
            <Metric label="کمیسیون تخمینی" value={formatToman(totals.commission)} />
            <Metric label="بهره‌وری شیفت" value={formatPercent(totals.utilization)} />
            <Metric label="نرخ تکمیل" value={formatPercent(totals.completionRate)} />
            <Metric label="مراجع یکتا" value={fa(totals.uniqueClients)} />
          </div>

          <DailyChart daily={detail.stats.daily} />

          {detail.stats.ranking.total > 0 && (
            <p className="ops-hint">
              رتبه درآمدی در بازه: <b>{fa(detail.stats.ranking.position)}</b> از{' '}
              {fa(detail.stats.ranking.total)} اپراتور
              {detail.stats.ranking.position === 1 ? ' — بیشترین درآمد این بازه.' : '.'}
            </p>
          )}

          {servicesSold.length > 0 && (
            <div className="ops-services-list">
              <span className="ops-hint">پرفروش‌ترین خدمات</span>
              {servicesSold.map((service) => (
                <div className="ops-service-row" key={service.serviceId}>
                  <IconReact name="sparkles" size={13} />
                  <span>{service.name}</span>
                  <em>
                    {fa(service.sessions)} جلسه · {formatToman(service.revenue)}
                  </em>
                </div>
              ))}
            </div>
          )}

          {detail.stats.insights.length > 0 && (
            <div className="ops-insights">
              {detail.stats.insights.map((insight, index) => (
                <div key={index} className={`ops-insight ops-insight--${insight.tone}`}>
                  <IconReact
                    name={
                      insight.tone === 'warn'
                        ? 'warning'
                        : insight.tone === 'good'
                          ? 'checkCircle'
                          : 'info'
                    }
                    size={14}
                  />
                  <span>{insight.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Agenda ───────────────────────────────────────────────── */}
      {tab === 'agenda' && (
        <div role="tabpanel" id="panel-agenda" aria-labelledby="tab-agenda" className="ops-panel">
          <div className="ops-section-head">
            <IconReact name="calendar" size={16} />
            <h3>برنامه {formatJalaliDateLong(detail.today.localDate)}</h3>
            <span className="ops-count">{fa(detail.agenda.length)} جلسه</span>
            <p>جلسات امروز این اپراتور و جلسات بدون مسئول که می‌توانید به او بسپارید.</p>
          </div>

          {detail.agenda.length === 0 ? (
            <p className="ops-hint">برای امروز جلسه‌ای به این اپراتور تخصیص نیافته است.</p>
          ) : (
            <div className="ops-agenda">
              {detail.agenda.map((item) => (
                <AgendaRow key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="ops-section-head" style={{ marginTop: 6 }}>
            <IconReact name="walkin" size={16} />
            <h3>جلسات بدون اپراتور</h3>
            <span className="ops-count">{fa(detail.unassigned.length)} مورد</span>
          </div>

          {detail.unassigned.length === 0 ? (
            <p className="ops-hint">همه جلسات امروز مسئول دارند.</p>
          ) : (
            <div className="ops-agenda">
              {detail.unassigned.map((item) => (
                <div className="ops-agenda__item" key={item.id}>
                  <div className="ops-agenda__time">
                    {clock(item.startsAt)}
                    <small>تا {clock(item.endsAt)}</small>
                  </div>
                  <div className="ops-agenda__body">
                    <strong>{item.serviceName}</strong>
                    <span>
                      {item.customerName} · {STATUS_LABEL[item.status] ?? item.status} ·{' '}
                      {item.reference}
                    </span>
                  </div>
                  {capabilities.canWrite && status === 'active' && (
                    <button
                      type="button"
                      className="ops-btn ops-btn--sm ops-btn--primary"
                      disabled={assigning === item.id}
                      onClick={() => void assign(item)}
                      aria-busy={assigning === item.id}
                    >
                      تخصیص
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Profile ──────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" className="ops-panel">
          <div className="ops-section-head">
            <IconReact name="users" size={16} />
            <h3>اطلاعات پروفایل</h3>
          </div>

          <div className="ops-metrics">
            <Metric label="کد اپراتور" value={operator.code} ltr />
            <Metric label="شماره تماس" value={formatPhone(operator.phone)} />
            <Metric label="ایمیل" value={operator.email ?? '—'} ltr />
            <Metric label="ساعت شیفت" value={`${operator.shiftStart} – ${operator.shiftEnd}`} ltr />
            <Metric label="روزهای کاری" value={workdaysLabel(operator.workdays)} />
            <Metric label="کمیسیون" value={formatPercent(operator.commissionPercent)} />
            <Metric label="هدف ماهانه" value={formatToman(operator.monthlyTarget)} />
            <Metric label="خدمات متصل" value={fa(operator.serviceIds.length)} />
          </div>

          {operator.bio && <p className="ops-hint">{operator.bio}</p>}

          <div className="ops-section-head" style={{ marginTop: 6 }}>
            <IconReact name="lock" size={16} />
            <h3>حساب ورود</h3>
          </div>

          {operator.account ? (
            <div className="ops-insight ops-insight--good">
              <IconReact name="checkCircle" size={14} />
              <span>
                ورود با <b dir="ltr">{operator.account.email}</b> · نقش{' '}
                {operator.account.roles.join(' · ')}
                {operator.account.lastSeenAt
                  ? ` · آخرین فعالیت ${clock(operator.account.lastSeenAt)}`
                  : ' · هنوز وارد نشده'}
              </span>
            </div>
          ) : (
            <div className="ops-insight ops-insight--info">
              <IconReact name="info" size={14} />
              <span>این اپراتور حساب ورود ندارد. برای ثبت جلسه توسط خودش، حساب صادر کنید.</span>
            </div>
          )}

          <div className="ops-section-head" style={{ marginTop: 6 }}>
            <IconReact name="sparkles" size={16} />
            <h3>خدمات قابل اجرا</h3>
          </div>
          {operator.serviceIds.length === 0 ? (
            <p className="ops-hint">هنوز خدمتی به این پروفایل وصل نشده است.</p>
          ) : (
            <div className="ops-services-list">
              {operator.serviceIds.map((id) => (
                <div className="ops-service-row" key={id}>
                  <IconReact name="check" size={13} />
                  <span>{services.find((service) => service.id === id)?.name ?? id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Drawer: edit ─────────────────────────────────────────── */}
      {editing && (
        <>
          <div className="ops-drawer-scrim" onClick={() => setEditing(false)} role="presentation" />
          <aside
            className="ops-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="op-edit-title"
          >
            <div className="ops-drawer__head">
              <div className="ops-drawer__title">
                <h2 id="op-edit-title">ویرایش {operator.displayName}</h2>
                <p>تغییر شیفت یا نقش، بلافاصله روی برنامه و پوشش شیفت اثر می‌گذارد.</p>
              </div>
              <button
                type="button"
                className="ops-drawer__close"
                onClick={() => setEditing(false)}
                aria-label="بستن"
              >
                <IconReact name="x" size={18} />
              </button>
            </div>
            <div className="ops-drawer__body">
              <OperatorForm
                catalog={catalog}
                services={services}
                operator={operator}
                busy={busy}
                serverErrors={serverErrors}
                onSubmit={(payload) => void submitEdit(payload)}
                onCancel={() => setEditing(false)}
              />
            </div>
          </aside>
        </>
      )}

      {/* ── Account ──────────────────────────────────────────────── */}
      {accountOpen && (
        <AccountDialog
          operator={operator}
          catalog={catalog}
          busy={busy}
          onClose={() => setAccountOpen(false)}
          onSubmit={async (payload): Promise<IssuedAccountResponse> => {
            setBusy(true);
            try {
              const result = await issueAccount(operator.id, payload);
              push(
                'success',
                result.account.mode === 'created' ? 'حساب ورود ساخته شد.' : 'رمز عبور بازنشانی شد.',
              );
              await reload();
              return result;
            } catch (err) {
              push('error', err instanceof ApiClientError ? err.message : 'صدور حساب ناموفق بود.');
              throw err;
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      <div className="ops-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`ops-toast ops-toast--${toast.tone}`}
            onClick={() => dismiss(toast.id)}
          >
            <IconReact
              name={
                toast.tone === 'success'
                  ? 'checkCircle'
                  : toast.tone === 'error'
                    ? 'warning'
                    : 'info'
              }
              size={16}
            />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────── */

function Metric({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="ops-metric">
      <div className="ops-metric__k">{label}</div>
      <div
        className="ops-metric__v"
        dir={ltr ? 'ltr' : undefined}
        style={ltr ? { textAlign: 'right' } : undefined}
      >
        {value}
      </div>
    </div>
  );
}

function AgendaRow({ item }: { item: OperatorAgendaItem }) {
  return (
    <div className="ops-agenda__item">
      <div className="ops-agenda__time">
        {clock(item.startsAt)}
        <small>تا {clock(item.endsAt)}</small>
      </div>
      <div className="ops-agenda__body">
        <strong>{item.serviceName}</strong>
        <span>
          {item.customerName} · {formatPhone(item.customerPhone)}
        </span>
        <span>
          {STATUS_LABEL[item.status] ?? item.status} · {item.reference} ·{' '}
          {formatToman(item.quotedAmount)}
        </span>
      </div>
    </div>
  );
}

/** 30-day revenue bars. Rendered as SVG so it stays crisp and needs no library. */
function DailyChart({
  daily,
}: {
  daily: Array<{ date: string; sessions: number; revenue: number }>;
}) {
  const width = 320;
  const height = 118;
  const padX = 4;
  const padBottom = 18;
  const max = Math.max(1, ...daily.map((point) => point.revenue));
  const barWidth = Math.max(2, (width - padX * 2) / Math.max(1, daily.length) - 1.5);

  const points = useMemo(() => daily, [daily]);

  return (
    <div>
      <svg
        className="ops-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`نمودار درآمد ${daily.length} روز گذشته`}
        preserveAspectRatio="none"
      >
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padX}
            x2={width - padX}
            y1={(height - padBottom) * (1 - ratio)}
            y2={(height - padBottom) * (1 - ratio)}
            stroke="rgba(148,163,184,0.14)"
            strokeWidth={0.6}
          />
        ))}
        {points.map((point, index) => {
          const usable = height - padBottom;
          const barHeight = point.revenue > 0 ? Math.max(2, (point.revenue / max) * usable) : 0;
          const x = padX + index * ((width - padX * 2) / points.length);
          return (
            <g key={point.date}>
              <rect
                className={
                  point.revenue === max && max > 0
                    ? 'ops-chart__bar ops-chart__bar--peak'
                    : 'ops-chart__bar'
                }
                x={x}
                y={usable - barHeight}
                width={barWidth}
                height={barHeight}
                rx={1.5}
              >
                <title>{`${formatJalaliDate(point.date)} — ${point.sessions} جلسه — ${point.revenue.toLocaleString('fa-IR')} تومان`}</title>
              </rect>
            </g>
          );
        })}
        <text className="ops-chart__axis" x={padX} y={height - 5}>
          {shortDate(points[0]?.date)}
        </text>
        <text className="ops-chart__axis" x={width / 2 - 14} y={height - 5}>
          {shortDate(points[Math.floor(points.length / 2)]?.date)}
        </text>
        <text className="ops-chart__axis" x={width - padX - 30} y={height - 5}>
          {shortDate(points[points.length - 1]?.date)}
        </text>
      </svg>
      {max === 0 && (
        <p className="ops-hint">
          در این بازه درآمدی ثبت نشده است؛ نمودار پس از اولین جلسه تکمیل‌شده پر می‌شود.
        </p>
      )}
    </div>
  );
}

function shortDate(date: string | undefined): string {
  if (!date) return '';
  // Jalali month/day keeps the axis readable for a Persian clinic; the full
  // Gregorian date stays in each bar's <title> for anyone inspecting the data.
  const [jy, jm, jd] = formatJalaliDate(date).split('/');
  void jy;
  return `${jm}/${jd}`;
}

function clock(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return '—';
  }
}

function fa(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}
