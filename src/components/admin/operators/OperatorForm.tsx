import { useEffect, useMemo, useState } from 'react';
import {
  applyTemplate,
  draftFromOperator,
  draftToPayload,
  emptyOperatorDraft,
  normalizePhoneInput,
  validateOperatorDraft,
} from '../../../domain/operators/operators';
import type { OperatorDraft } from '../../../domain/operators/operators';
import type { OperatorDto, OperatorCreateInput } from '../../../domain/operators/operators';
import type { OperatorCatalog } from './api-client';
import { IconReact } from '../../ui/IconReact';

export interface OperatorDraftResult {
  draft: OperatorDraft;
  /** Payload ready for POST/PUT — always normalized, never the raw draft. */
  payload: OperatorCreateInput;
  errors: Record<string, string>;
}

interface OperatorFormProps {
  catalog: OperatorCatalog;
  /** Present when editing; absent when creating. */
  operator?: OperatorDto | null;
  services: Array<{ id: string; name: string }>;
  busy?: boolean;
  serverErrors?: Record<string, string[]> | null;
  onSubmit: (payload: OperatorCreateInput) => void;
  onCancel: () => void;
  /** Optional ready-made template applied immediately (from the empty state). */
  templateKey?: string | null;
}

/**
 * Create/edit drawer body. The draft mirrors the server schema exactly, so every
 * rejection the server can produce has a matching local message: the form
 * explains Persian-digit phones, inverted shifts and unknown roles before the
 * request leaves the device, and re-renders the server's own wording when it
 * disagrees.
 */
export function OperatorForm({
  catalog,
  operator,
  services,
  busy = false,
  serverErrors = null,
  onSubmit,
  onCancel,
  templateKey = null,
}: OperatorFormProps) {
  const [draft, setDraft] = useState<OperatorDraft>(() => {
    if (operator) return draftFromOperator(operator);
    const base = emptyOperatorDraft();
    return templateKey ? applyTemplate(base, resolveTemplate(catalog, templateKey)) : base;
  });
  const [touched, setTouched] = useState(false);

  // If the dialog switches to a different operator (or closes and reopens for a
  // new one), rebuild the draft instead of keeping the previous person's edits.
  useEffect(() => {
    setDraft(operator ? draftFromOperator(operator) : freshDraft(catalog, templateKey));
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operator?.id, templateKey]);

  const localErrors = useMemo(() => validateOperatorDraft(draft), [draft]);
  const errors = useMemo(() => mergeErrors(localErrors, serverErrors), [localErrors, serverErrors]);
  const role = catalog.roles.find((entry) => entry.key === draft.roleKey);
  const phonePreview = normalizePhoneInput(draft.phone);

  const update = <K extends keyof OperatorDraft>(key: K, value: OperatorDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setTouched(true);
  };

  const toggleService = (id: string) => {
    update(
      'serviceIds',
      draft.serviceIds.includes(id) ? draft.serviceIds.filter((entry) => entry !== id) : [...draft.serviceIds, id],
    );
  };

  const toggleWorkday = (index: number) => {
    update(
      'workdays',
      draft.workdays.includes(index) ? draft.workdays.filter((entry) => entry !== index) : [...draft.workdays, index],
    );
  };

  const applyRole = (key: OperatorDraft['roleKey']) => {
    const definition = catalog.roles.find((entry) => entry.key === key);
    setDraft((current) => ({
      ...current,
      roleKey: key,
      title: current.title || definition?.defaultTitle || current.title,
      avatarColor: current.avatarColor || definition?.accent || current.avatarColor,
    }));
    setTouched(true);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (Object.keys(localErrors).length > 0) return;
    onSubmit(draftToPayload(draft));
  };

  const showErrors = touched || Boolean(serverErrors);

  return (
    <form className="ops-form" onSubmit={submit} noValidate>
      <fieldset className="ops-fieldset">
        <legend>هویت اپراتور</legend>

        <div className="ops-grid-2">
          <div className="ops-field">
            <label htmlFor="op-name">
              نام و نام خانوادگی <span>اجباری</span>
            </label>
            <input
              id="op-name"
              className="ops-input"
              value={draft.displayName}
              onChange={(event) => update('displayName', event.target.value)}
              placeholder="مثلاً دکتر سارا محمدی"
              maxLength={80}
              autoComplete="name"
              aria-invalid={showErrors && Boolean(errors.displayName)}
              aria-describedby={errors.displayName ? 'op-name-err' : undefined}
            />
            {showErrors && errors.displayName && (
              <span className="ops-error" id="op-name-err">
                {errors.displayName}
              </span>
            )}
          </div>

          <div className="ops-field">
            <label htmlFor="op-phone">
              شماره تماس <span>اجباری</span>
            </label>
            <input
              id="op-phone"
              className="ops-input"
              value={draft.phone}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              aria-invalid={showErrors && Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'op-phone-err' : 'op-phone-hint'}
            />
            {showErrors && errors.phone ? (
              <span className="ops-error" id="op-phone-err">
                {errors.phone}
              </span>
            ) : (
              <span className="ops-hint" id="op-phone-hint">
                {phonePreview ? `ذخیره می‌شود: ${phonePreview}` : 'ارقام فارسی هم پشتیبانی می‌شود.'}
              </span>
            )}
          </div>
        </div>

        <div className="ops-field">
          <label htmlFor="op-email">ایمیل</label>
          <input
            id="op-email"
            className="ops-input"
            value={draft.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="sara@tehranlaser.ir"
            inputMode="email"
            dir="ltr"
            autoComplete="email"
            aria-invalid={showErrors && Boolean(errors.email)}
            aria-describedby={errors.email ? 'op-email-err' : undefined}
          />
          {showErrors && errors.email && (
            <span className="ops-error" id="op-email-err">
              {errors.email}
            </span>
          )}
        </div>

        <div className="ops-field">
          <label htmlFor="op-title">عنوان شغلی</label>
          <input
            id="op-title"
            className="ops-input"
            value={draft.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder={role?.defaultTitle ?? 'اپراتور دستگاه لیزر'}
            maxLength={80}
            aria-invalid={showErrors && Boolean(errors.title)}
            aria-describedby={errors.title ? 'op-title-err' : undefined}
          />
          {showErrors && errors.title && (
            <span className="ops-error" id="op-title-err">
              {errors.title}
            </span>
          )}
        </div>

        <div className="ops-field">
          <label htmlFor="op-bio">معرفی کوتاه</label>
          <textarea
            id="op-bio"
            className="ops-textarea"
            value={draft.bio}
            onChange={(event) => update('bio', event.target.value)}
            placeholder="تخصص، تجربه و گواهی‌ها (اختیاری)"
            maxLength={600}
            aria-describedby="op-bio-hint"
          />
          <span className="ops-hint" id="ops-bio-hint">
            {draft.bio.trim().length} از ۶۰۰ حرف
          </span>
        </div>
      </fieldset>

      <fieldset className="ops-fieldset">
        <legend>نقش بالینی</legend>
        <div className="ops-roles" role="group" aria-label="نقش بالینی">
          {catalog.roles.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className="ops-role-option"
              aria-pressed={draft.roleKey === entry.key}
              onClick={() => applyRole(entry.key)}
            >
              <strong>{entry.label}</strong>
              <span>{entry.hint}</span>
            </button>
          ))}
        </div>
        {showErrors && errors.roleKey && <span className="ops-error">{errors.roleKey}</span>}
      </fieldset>

      <fieldset className="ops-fieldset">
        <legend>برنامه کاری</legend>

        <div className="ops-field">
          <label>روزهای حضور در کلینیک</label>
          <div className="ops-weekdays" role="group" aria-label="روزهای کاری">
            {catalog.workdays.map((day) => (
              <button
                key={day.index}
                type="button"
                className="ops-weekday"
                aria-pressed={draft.workdays.includes(day.index)}
                onClick={() => toggleWorkday(day.index)}
                title={day.label}
              >
                {day.short}
              </button>
            ))}
          </div>
          {showErrors && errors.workdays && <span className="ops-error">{errors.workdays}</span>}
        </div>

        <div className="ops-grid-2">
          <div className="ops-field">
            <label htmlFor="op-start">شروع شیفت</label>
            <input
              id="op-start"
              className="ops-input"
              type="time"
              value={draft.shiftStart}
              onChange={(event) => update('shiftStart', event.target.value)}
              dir="ltr"
              aria-invalid={showErrors && Boolean(errors.shift)}
              aria-describedby={errors.shift ? 'op-shift-err' : undefined}
            />
          </div>
          <div className="ops-field">
            <label htmlFor="op-end">پایان شیفت</label>
            <input
              id="op-end"
              className="ops-input"
              type="time"
              value={draft.shiftEnd}
              onChange={(event) => update('shiftEnd', event.target.value)}
              dir="ltr"
              aria-invalid={showErrors && Boolean(errors.shift)}
              aria-describedby={errors.shift ? 'op-shift-err' : undefined}
            />
          </div>
        </div>
        {showErrors && errors.shift && (
          <span className="ops-error" id="op-shift-err">
            {errors.shift}
          </span>
        )}

        <div className="ops-presets" role="group" aria-label="الگوهای شیفت">
          {catalog.shifts.map((shift) => (
            <button
              key={shift.label}
              type="button"
              className="ops-preset"
              onClick={() => {
                setDraft((current) => ({ ...current, shiftStart: shift.start, shiftEnd: shift.end }));
                setTouched(true);
              }}
            >
              {shift.label} ({toPersian(shift.start)}–{toPersian(shift.end)})
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="ops-fieldset">
        <legend>خدمات قابل اجرا</legend>
        {services.length === 0 ? (
          <p className="ops-hint">هنوز خدمتی ثبت نشده است؛ می‌توانید بعداً از پروفایل اپراتور خدمات را وصل کنید.</p>
        ) : (
          <div className="ops-services" role="group" aria-label="خدمات">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                className="ops-service"
                aria-pressed={draft.serviceIds.includes(service.id)}
                onClick={() => toggleService(service.id)}
              >
                <IconReact name={draft.serviceIds.includes(service.id) ? 'check' : 'plus'} size={15} />
                <span>{service.name}</span>
              </button>
            ))}
          </div>
        )}
        {showErrors && errors.serviceIds && <span className="ops-error">{errors.serviceIds}</span>}
        <span className="ops-hint">{draft.serviceIds.length} خدمت انتخاب شده — در پیشنهاد اپراتور برای آن خدمات دیده می‌شود.</span>
      </fieldset>

      <fieldset className="ops-fieldset">
        <legend>هدف مالی و کمیسیون</legend>

        <div className="ops-grid-2">
          <div className="ops-field">
            <label htmlFor="op-commission">کمیسیون (٪)</label>
            <input
              id="op-commission"
              className="ops-input"
              type="number"
              min={0}
              max={100}
              step={1}
              value={draft.commissionPercent}
              onChange={(event) => update('commissionPercent', Number(event.target.value))}
              aria-invalid={showErrors && Boolean(errors.commissionPercent)}
              aria-describedby={errors.commissionPercent ? 'op-commission-err' : undefined}
            />
            {showErrors && errors.commissionPercent && (
              <span className="ops-error" id="op-commission-err">
                {errors.commissionPercent}
              </span>
            )}
          </div>
          <div className="ops-field">
            <label htmlFor="op-target">هدف ماهانه (تومان)</label>
            <input
              id="op-target"
              className="ops-input"
              type="number"
              min={0}
              step={1000}
              value={draft.monthlyTarget}
              onChange={(event) => update('monthlyTarget', Number(event.target.value))}
              aria-invalid={showErrors && Boolean(errors.monthlyTarget)}
              aria-describedby={errors.monthlyTarget ? 'op-target-err' : undefined}
            />
            {showErrors && errors.monthlyTarget && (
              <span className="ops-error" id="op-target-err">
                {errors.monthlyTarget}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="ops-fieldset">
        <legend>ظاهر پروفایل</legend>
        <div className="ops-colors" role="group" aria-label="رنگ آواتار">
          {catalog.accents.map((accent) => (
            <button
              key={accent.hex}
              type="button"
              className="ops-color"
              style={{ backgroundColor: accent.hex }}
              aria-pressed={draft.avatarColor === accent.hex}
              aria-label={accent.label}
              title={accent.label}
              onClick={() => update('avatarColor', accent.hex)}
            />
          ))}
        </div>
      </fieldset>

      <div className="ops-switch-row">
        <div className="ops-switch-row__text">
          <strong>فعال در برنامه‌ریزی</strong>
          <span>اپراتورهای غیرفعال در پیشنهاد شیفت و نوبت‌دهی دیده نمی‌شوند.</span>
        </div>
        <button
          type="button"
          className="ops-switch"
          role="switch"
          aria-checked={draft.active}
          aria-label="فعال در برنامه‌ریزی"
          onClick={() => update('active', !draft.active)}
        />
      </div>

      <div className="ops-drawer__foot">
        <button type="button" className="ops-btn ops-btn--ghost" onClick={onCancel} disabled={busy}>
          انصراف
        </button>
        <button type="submit" className="ops-btn ops-btn--primary" disabled={busy} aria-busy={busy}>
          <IconReact name={busy ? 'refresh' : 'check'} size={16} />
          {operator ? 'ذخیره تغییرات' : 'افزودن به تیم'}
        </button>
      </div>
    </form>
  );
}

function freshDraft(catalog: OperatorCatalog, templateKey: string | null): OperatorDraft {
  const base = emptyOperatorDraft();
  return templateKey ? applyTemplate(base, resolveTemplate(catalog, templateKey)) : base;
}

function resolveTemplate(catalog: OperatorCatalog, templateKey: string | null) {
  const template = catalog.templates.find((entry) => entry.key === templateKey);
  if (!template) {
    return {
      roleKey: 'laser_technician' as const,
      workdays: [0, 1, 2, 3, 4, 5],
      shiftStart: '09:00',
      shiftEnd: '20:00',
      commissionPercent: 10,
    };
  }
  return {
    roleKey: template.roleKey,
    workdays: template.workdays,
    shiftStart: template.shiftStart,
    shiftEnd: template.shiftEnd,
    commissionPercent: template.commissionPercent,
  };
}

/** Local checks win when both exist: they are per-keystroke and match the server. */
function mergeErrors(
  local: Record<string, string>,
  server: Record<string, string[]> | null,
): Record<string, string> {
  const merged: Record<string, string> = { ...local };
  if (server) {
    for (const [field, messages] of Object.entries(server)) {
      if (messages.length > 0 && !merged[field]) merged[field] = messages[0]!;
    }
  }
  return merged;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
function toPersian(value: string): string {
  return value.replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}
