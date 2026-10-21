import type { CoverageResponse, OperatorCatalog } from './api-client';
import { IconReact } from '../../ui/IconReact';

interface CoveragePanelProps {
  catalog: OperatorCatalog;
  coverage: CoverageResponse | null;
  loading: boolean;
  weekday: number;
  todayWeekday: number;
  onChangeWeekday: (weekday: number) => void;
}

/**
 * Shift coverage for one clinic weekday. Answers the operational question the
 * roster grid cannot: "at 14:00 on Tuesday, how many operators are actually
 * here?" — merged windows, a 24-slot heat strip and the names behind each block.
 */
export function CoveragePanel({ catalog, coverage, loading, weekday, todayWeekday, onChangeWeekday }: CoveragePanelProps) {
  const segments = coverage?.segments ?? [];
  const hourly = coverage?.hourly ?? new Array<number>(24).fill(0);
  const maxCount = Math.max(1, ...segments.map((segment) => segment.count));
  const maxHour = Math.max(1, ...hourly);
  const peak = Math.max(0, ...hourly);
  const dayLabel = catalog.workdays.find((day) => day.index === weekday)?.label ?? '';

  return (
    <section className="ops-coverage" aria-labelledby="ops-coverage-title">
      <div className="ops-section-head">
        <IconReact name="clock" size={16} />
        <h3 id="ops-coverage-title">پوشش شیفت</h3>
        <span className="ops-count">
          {loading ? 'در حال محاسبه…' : `${segments.length} بازهٔ پوشش`}
        </span>
        <p>
          برای هر روز هفته، بازه‌هایی که حداقل یک اپراتور فعال حاضر است. عدد کنار هر نوار، تعداد اپراتور هم‌زمان در آن بازه است.
        </p>
      </div>

      <div className="ops-coverage__days" role="group" aria-label="انتخاب روز هفته">
        {catalog.workdays.map((day) => (
          <button
            key={day.index}
            type="button"
            className="ops-coverage__day"
            aria-pressed={weekday === day.index}
            onClick={() => onChangeWeekday(day.index)}
            title={day.label}
          >
            {day.short}
            {day.index === todayWeekday && <span aria-hidden="true"> •</span>}
          </button>
        ))}
      </div>

      <div className="ops-coverage__bars">
        {segments.length === 0 ? (
          <p className="ops-hint">
            {loading ? 'در حال بارگذاری…' : `برای ${dayLabel} هیچ شیفت فعالی ثبت نشده است. روزهای کاری و ساعت شیفت اپراتورها را بررسی کنید.`}
          </p>
        ) : (
          segments.map((segment) => (
            <div
              className="ops-coverage__seg"
              key={`${segment.start}-${segment.end}`}
              title={segment.operators.join('، ')}
            >
              <b>
                {segment.start}–{segment.end}
              </b>
              <span className="ops-coverage__track">
                <span
                  className="ops-coverage__fill"
                  style={{ width: `${Math.max(6, Math.round((segment.count / maxCount) * 100))}%` }}
                />
              </span>
              <span>{toPersian(segment.count)}</span>
            </div>
          ))
        )}
      </div>

      <div>
        <div className="ops-heat" aria-label="پوشش ساعتی" role="img">
          {hourly.map((count, hour) => (
            <span
              key={hour}
              className="ops-heat__slot"
              data-level={level(count, maxHour)}
              title={`${String(hour).padStart(2, '0')}:۰۰ — ${toPersian(count)} اپراتور`}
            />
          ))}
        </div>
        <div className="ops-heat__axis" aria-hidden="true">
          <span>۰۰</span>
          <span>۰۶</span>
          <span>۱۲</span>
          <span>۱۸</span>
          <span>۲۳</span>
        </div>
      </div>

      {coverage && coverage.roster.length > 0 && (
        <p className="ops-hint">
          حاضر در {dayLabel}: {coverage.roster.map((entry) => `${entry.displayName} (${entry.shiftStart}–${entry.shiftEnd})`).join('، ')}
          {peak === 0 ? ' — هیچ ساعتی پوشش ندارد.' : ` — اوج پوشش ${toPersian(peak)} اپراتور هم‌زمان.`}
        </p>
      )}
    </section>
  );
}

function level(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  const ratio = count / Math.max(1, max);
  if (ratio <= 0.34) return 1;
  if (ratio <= 0.67) return 2;
  if (ratio < 1) return 3;
  return 4;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
function toPersian(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}
