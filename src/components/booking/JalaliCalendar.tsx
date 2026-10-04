import { useMemo } from 'react';
import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js';
import { IconReact } from '../ui/IconReact';
import { addDays, isoDayOf, persianWeekIndex } from './booking-shared';

const WEEKDAY_HEADS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

const MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function fa(n: number): string {
  return String(n).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

interface CalendarMonth {
  key: string;
  label: string;
  weeks: Array<Array<string | null>>;
}

interface JalaliCalendarProps {
  /** Selectable days, as local YYYY-MM-DD strings. */
  selectableDates: string[];
  /** Selected day — also decides which month is shown. */
  selectedDate: string;
  onSelect: (isoDate: string) => void;
  /** Shown when the clinic has no bookable day in range. */
  closedNote: string;
}

/**
 * Jalali month pager restricted to days the clinic can actually book.
 * Only months containing a selectable day are reachable, so a visitor can
 * never page into a dead month.
 */
export function JalaliCalendar({ selectableDates, selectedDate, onSelect, closedNote }: JalaliCalendarProps) {
  const months = useMemo<CalendarMonth[]>(() => {
    const byKey = new Map<string, CalendarMonth>();
    const selectable = new Set(selectableDates);

    for (const iso of selectableDates) {
      const d = new Date(`${iso}T00:00:00Z`);
      const j = toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      const key = `${j.jy}-${j.jm}`;
      if (!byKey.has(key)) {
        byKey.set(key, { key, label: `${MONTH_NAMES[j.jm - 1] ?? ''} ${fa(j.jy)}`, weeks: [] });
      }
    }

    for (const month of byKey.values()) {
      const [jyRaw, jmRaw] = month.key.split('-');
      const jy = Number(jyRaw);
      const jm = Number(jmRaw);
      const first = toGregorian(jy, jm, 1);
      const firstIso = `${first.gy}-${String(first.gm).padStart(2, '0')}-${String(first.gd).padStart(2, '0')}`;
      const offset = persianWeekIndex(firstIso);

      const grid: Array<string | null> = new Array(offset).fill(null);
      const length = jalaaliMonthLength(jy, jm);
      for (let i = 0; i < length; i++) {
        const dayIso = isoDayOf(addDays(new Date(`${firstIso}T00:00:00Z`), i));
        grid.push(selectable.has(dayIso) ? dayIso : null);
      }
      while (grid.length % 7 !== 0) grid.push(null);

      const weeks: Array<string | null>[] = [];
      for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));
      month.weeks = weeks;
    }

    return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [selectableDates]);

  const monthKeys = months.map((m) => m.key);
  const firstKey = monthKeys[0] ?? '';
  const selectedKey = (() => {
    if (!selectedDate) return firstKey;
    const d = new Date(`${selectedDate}T00:00:00Z`);
    const j = toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    return `${j.jy}-${j.jm}`;
  })();
  const visibleKey = monthKeys.includes(selectedKey) ? selectedKey : firstKey;
  const month = months.find((m) => m.key === visibleKey);
  const index = monthKeys.indexOf(visibleKey);

  if (!month) {
    return (
      <div className="calendar-empty">
        <IconReact name="calendar" size={30} label="تقویم" />
        <p>{closedNote}</p>
      </div>
    );
  }

  return (
    <div className="jalali-calendar">
      <div className="calendar-head">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => {
            /* Month keys are Jalali ("1405-8"), but onSelect must emit an ISO
               date — emitting the key would make the parent's
               selectableDates.includes() check fail and wipe the selection.
               Jump to the first selectable ISO day inside the target month. */
            const prev = months[index - 1];
            if (!prev) return;
            const firstSelectable = prev.weeks
              .flat()
              .find((iso): iso is string => iso !== null && iso !== undefined);
            if (firstSelectable) onSelect(firstSelectable);
          }}
          aria-label="ماه قبل"
          disabled={index <= 0}
        >
          <IconReact name="chevronRight" size={18} />
        </button>
        <span className="calendar-month-label" aria-live="polite">
          {month.label}
        </span>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => {
            /* See the "ماه قبل" handler: emit an ISO date, never the month key. */
            const next = months[index + 1];
            if (!next) return;
            const firstSelectable = next.weeks
              .flat()
              .find((iso): iso is string => iso !== null && iso !== undefined);
            if (firstSelectable) onSelect(firstSelectable);
          }}
          aria-label="ماه بعد"
          disabled={index >= monthKeys.length - 1}
        >
          <IconReact name="chevronLeft" size={18} />
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_HEADS.map((w, i) => (
          <span key={i} className={`calendar-wd ${i === 6 ? 'is-friday-head' : ''}`}>
            {w}
          </span>
        ))}
      </div>

      <div className="calendar-body">
        {month.weeks.map((week, wi) => (
          <div className="calendar-week" key={wi}>
            {week.map((iso, di) => {
              if (!iso) return <span key={di} className="calendar-cell is-empty" aria-hidden="true" />;
              const dayNum = Number(iso.slice(-2));
              const isFriday = persianWeekIndex(iso) === 6;
              const selected = selectedDate === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  className={`calendar-day ${isFriday ? 'is-friday' : ''} ${selected ? 'selected' : ''}`}
                  onClick={() => onSelect(iso)}
                  aria-pressed={selected}
                  aria-label={iso}
                  dir="ltr"
                >
                  {fa(dayNum)}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
