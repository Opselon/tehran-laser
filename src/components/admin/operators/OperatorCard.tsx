import type { OperatorDto } from '../../../domain/operators/operators';
import {
  formatPercent,
  formatPhone,
  formatToman,
  operatorStatusOf,
  shiftMinutes,
  workdaysLabel,
} from '../../../domain/operators/operators';
import { IconReact } from '../../ui/IconReact';

interface OperatorCardProps {
  operator: OperatorDto;
  todayWeekday: number;
  canWrite: boolean;
  canManageAccounts: boolean;
  busy: boolean;
  /** True when this card is first/last in the manual order. */
  isFirst: boolean;
  isLast: boolean;
  onEdit: (operator: OperatorDto) => void;
  onAccount: (operator: OperatorDto) => void;
  onToggleActive: (operator: OperatorDto) => void;
  onArchive: (operator: OperatorDto) => void;
  onRestore: (operator: OperatorDto) => void;
  onMove: (operator: OperatorDto, direction: -1 | 1) => void;
}

const FA_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

/**
 * One roster card. It shows the four numbers a clinic manager actually asks
 * about — who is on shift today, how many sessions they delivered, what they
 * brought in, and how full their shift was — plus the exact next action.
 */
export function OperatorCard({
  operator,
  todayWeekday,
  canWrite,
  canManageAccounts,
  busy,
  isFirst,
  isLast,
  onEdit,
  onAccount,
  onToggleActive,
  onArchive,
  onRestore,
  onMove,
}: OperatorCardProps) {
  const status = operatorStatusOf(operator);
  const onShiftToday = !operator.archivedAt && operator.active && operator.workdays.includes(todayWeekday);
  const statusLabel = status === 'active' ? 'فعال' : status === 'inactive' ? 'غیرفعال' : 'بایگانی';

  return (
    <article
      className={`ops-card ops-card--${status}`}
      aria-label={`${operator.displayName} — ${operator.roleLabel}`}
    >
      <div className="ops-card__top">
        <div
          className="ops-avatar"
          style={{ background: `linear-gradient(150deg, ${operator.avatarColor}, ${shade(operator.avatarColor)})` }}
          aria-hidden="true"
        >
          {operator.initials}
        </div>

        <div className="ops-card__id">
          <div className="ops-card__name">
            <a href={`/admin/operators/${operator.id}`}>{operator.displayName}</a>
            <span className={`ops-status ops-status--${status}`}>
              <span className="ops-status__dot" aria-hidden="true" />
              {statusLabel}
            </span>
            {onShiftToday && (
              <span className="ops-status ops-status--active" title="امروز در شیفت">
                شیفت امروز
              </span>
            )}
          </div>
          <div className="ops-card__role">
            <span>{operator.roleLabel}</span>
            <span className="ops-code">{operator.code}</span>
            {operator.title && <span>· {operator.title}</span>}
          </div>
        </div>
      </div>

      <div className="ops-card__meta">
        <div className="ops-card__meta-row">
          <IconReact name="phone" size={14} />
          <span dir="ltr">{formatPhone(operator.phone)}</span>
        </div>
        <div className="ops-card__meta-row">
          <IconReact name="clock" size={14} />
          <span>
            {operator.shiftStart}–{operator.shiftEnd} · {Math.round(shiftMinutes(operator) / 60)} ساعت
          </span>
        </div>
        <div className="ops-card__meta-row">
          <span className="ops-days" title={workdaysLabel(operator.workdays)}>
            {FA_DAYS.map((label, index) => (
              <span
                key={label + index}
                className={[
                  'ops-day',
                  operator.workdays.includes(index) ? 'ops-day--on' : '',
                  index === todayWeekday ? 'ops-day--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`${label}${operator.workdays.includes(index) ? ' (حاضر)' : ''}`}
              >
                {label}
              </span>
            ))}
          </span>
          <span className="ops-card__account">
            {operator.account ? (
              <>
                <IconReact name="lock" size={12} /> <b dir="ltr">{operator.account.email}</b>
              </>
            ) : (
              'بدون حساب ورود'
            )}
          </span>
        </div>
      </div>

      <div className="ops-card__stats">
        <div className="ops-stat">
          <span className="ops-stat__k">جلسات انجام‌شده</span>
          <span className="ops-stat__v">{formatPercentNumber(operator.stats.sessions)}</span>
        </div>
        <div className="ops-stat">
          <span className="ops-stat__k">درآمد ثبت‌شده</span>
          <span className="ops-stat__v" title={`${operator.stats.revenue.toLocaleString('fa-IR')} تومان`}>
            {formatToman(operator.stats.revenue)}
          </span>
        </div>
        <div className="ops-stat">
          <span className="ops-stat__k">بهره‌وری شیفت</span>
          <span className="ops-stat__v">{formatPercent(operator.stats.utilization)}</span>
          <span className="ops-meter" aria-hidden="true">
            <span style={{ width: `${Math.max(3, operator.stats.utilization)}%` }} />
          </span>
        </div>
      </div>

      <div className="ops-card__actions">
        {canWrite && status !== 'archived' && (
          <button type="button" className="ops-btn ops-btn--sm" onClick={() => onEdit(operator)} disabled={busy}>
            <IconReact name="edit" size={14} /> ویرایش
          </button>
        )}
        {canManageAccounts && status !== 'archived' && (
          <button type="button" className="ops-btn ops-btn--sm" onClick={() => onAccount(operator)} disabled={busy}>
            <IconReact name="lock" size={14} /> {operator.account ? 'بازنشانی رمز' : 'صدور حساب'}
          </button>
        )}
        {canWrite && status !== 'archived' && (
          <button type="button" className="ops-btn ops-btn--sm ops-btn--ghost" onClick={() => onToggleActive(operator)} disabled={busy}>
            {operator.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
          </button>
        )}
        {canWrite && status !== 'archived' && (
          <button type="button" className="ops-btn ops-btn--sm ops-btn--danger" onClick={() => onArchive(operator)} disabled={busy}>
            بایگانی
          </button>
        )}
        {canWrite && status === 'archived' && (
          <button type="button" className="ops-btn ops-btn--sm ops-btn--primary" onClick={() => onRestore(operator)} disabled={busy}>
            <IconReact name="refresh" size={14} /> بازیابی
          </button>
        )}

        {canWrite && status !== 'archived' && (
          <span style={{ marginInlineStart: 'auto', display: 'inline-flex', gap: 4 }}>
            <button
              type="button"
              className="ops-btn ops-btn--sm ops-btn--ghost"
              onClick={() => onMove(operator, -1)}
              disabled={busy || isFirst}
              aria-label="جابه‌جایی به قبل"
              title="جابه‌جایی به قبل"
            >
              <IconReact name="chevronRight" size={14} />
            </button>
            <button
              type="button"
              className="ops-btn ops-btn--sm ops-btn--ghost"
              onClick={() => onMove(operator, 1)}
              disabled={busy || isLast}
              aria-label="جابه‌جایی به بعد"
              title="جابه‌جایی به بعد"
            >
              <IconReact name="chevronLeft" size={14} />
            </button>
          </span>
        )}

        <a className="ops-btn ops-btn--sm ops-btn--ghost" href={`/admin/operators/${operator.id}`}>
          پروفایل
          <IconReact name="arrowLeft" size={14} />
        </a>
      </div>
    </article>
  );
}

/** Darken a hex accent for the avatar gradient's second stop. */
function shade(hex: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return '#0b1220';
  const value = match[1]!;
  const channels = [0, 2, 4].map((offset) => Math.round(parseInt(value.slice(offset, offset + 2), 16) * 0.55));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function formatPercentNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}
