import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OperatorDto, OperatorCreateInput } from '../../../domain/operators/operators';
import { formatToman } from '../../../domain/operators/operators';
import type { OperatorRoleKey, OperatorStatus } from '../../../domain/operators/catalog';
import type { CoverageResponse, OperatorCatalog, RosterResponse } from './api-client';
import { ApiClientError, fetchCoverage } from './api-client';
import { useRoster } from './useRoster';
import { OperatorCard } from './OperatorCard';
import { OperatorForm } from './OperatorForm';
import { AccountDialog, ConfirmDialog } from './OperatorDialogs';
import { CoveragePanel } from './CoveragePanel';
import { IconReact } from '../../ui/IconReact';

interface OperatorsAppProps {
  initial: RosterResponse;
  catalog: OperatorCatalog;
  services: Array<{ id: string; name: string }>;
  initialCoverage: CoverageResponse | null;
}

type DrawerState =
  { mode: 'create'; templateKey: string | null } | { mode: 'edit'; operator: OperatorDto } | null;

type ConfirmState =
  | { kind: 'archive'; operator: OperatorDto }
  | { kind: 'restore'; operator: OperatorDto }
  | { kind: 'delete'; operator: OperatorDto }
  | null;

const STATUS_TABS: Array<{ key: OperatorStatus | 'all'; label: string }> = [
  { key: 'all', label: 'همه' },
  { key: 'active', label: 'فعال' },
  { key: 'inactive', label: 'غیرفعال' },
  { key: 'archived', label: 'بایگانی' },
];

/**
 * Team hub island.
 *
 * SSR already supplied the first page, the catalog and today's coverage, so the
 * page is interactive before hydration finishes. Every mutation goes through
 * `useRoster`, which talks to the real API and replaces local state with the
 * server's DTO — there is no client-side source of truth to drift.
 */
export function OperatorsApp({ initial, catalog, services, initialCoverage }: OperatorsAppProps) {
  const roster = useRoster({ initial });
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [accountFor, setAccountFor] = useState<OperatorDto | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [coverage, setCoverage] = useState<CoverageResponse | null>(initialCoverage);
  const [coverageWeekday, setCoverageWeekday] = useState(
    initialCoverage?.weekday ?? initial.today.weekday,
  );
  const [coverageLoading, setCoverageLoading] = useState(false);

  const canWrite = roster.capabilities.canWrite;
  const canManageAccounts = roster.capabilities.canManageAccounts;

  const totals = useMemo(() => {
    return roster.items.reduce(
      (acc, operator) => {
        acc.sessions += operator.stats.sessions;
        acc.revenue += operator.stats.revenue;
        acc.upcoming += operator.stats.upcoming;
        return acc;
      },
      { sessions: 0, revenue: 0, upcoming: 0 },
    );
  }, [roster.items]);

  const loadCoverage = useCallback(
    async (weekday: number) => {
      setCoverageWeekday(weekday);
      setCoverageLoading(true);
      try {
        const data = await fetchCoverage(weekday);
        setCoverage(data);
      } catch {
        roster.pushToast('error', 'محاسبه پوشش شیفت ناموفق بود.');
      } finally {
        setCoverageLoading(false);
      }
    },
    [roster],
  );

  // Refresh coverage after any roster mutation: adding a person with a Saturday
  // shift must change the Saturday chart immediately.
  const rosterFingerprint = roster.items
    .map(
      (operator) =>
        `${operator.id}:${operator.active}:${operator.archivedAt ?? ''}:${operator.shiftStart}-${operator.shiftEnd}:${operator.workdays.join('.')}`,
    )
    .join('|');

  useEffect(() => {
    if (!coverage) return;
    let cancelled = false;
    setCoverageLoading(true);
    fetchCoverage(coverageWeekday)
      .then((data) => {
        if (!cancelled) setCoverage(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setCoverageLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterFingerprint, coverageWeekday]);

  const openCreate = (templateKey: string | null = null) => {
    setServerErrors(null);
    setDrawer({ mode: 'create', templateKey });
  };

  const openEdit = (operator: OperatorDto) => {
    setServerErrors(null);
    setDrawer({ mode: 'edit', operator });
  };

  const closeDrawer = () => {
    setDrawer(null);
    setServerErrors(null);
  };

  const submitDraft = async (payload: OperatorCreateInput) => {
    setServerErrors(null);
    try {
      if (drawer?.mode === 'edit') {
        const updated = await roster.update(drawer.operator.id, payload);
        if (updated) closeDrawer();
      } else {
        await roster.create(payload);
        closeDrawer();
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setServerErrors(err.fields);
        roster.pushToast('error', err.message);
      } else {
        roster.pushToast('error', 'ثبت اپراتور ناموفق بود.');
      }
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const operator = confirm.operator;
    let ok = false;
    if (confirm.kind === 'archive') ok = await roster.archive(operator);
    if (confirm.kind === 'restore') ok = Boolean(await roster.restore(operator));
    if (confirm.kind === 'delete') ok = await roster.destroy(operator);
    if (ok) setConfirm(null);
  };

  const visibleItems = roster.items;
  const isTrulyEmpty = roster.meta.total === 0 && !roster.filtersActive && !roster.loading;

  return (
    <div className="ops-shell">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="ops-hero" aria-labelledby="ops-title">
        <div className="ops-hero__main">
          <span className="ops-hero__eyebrow">
            <IconReact name="users" size={13} />
            تیم درمان و اپراتورها
          </span>
          <h1 className="ops-hero__title" id="ops-title">
            هر زمان که خواستید، اپراتور جدید اضافه کنید
          </h1>
          <p className="ops-hero__sub">
            پروفایل کامل هر اپراتور — نقش بالینی، خدمات قابل اجرا، روزهای کاری، شیفت، کمیسیون و حساب
            ورود — از همین‌جا ساخته می‌شود. فهرست تیم از پیش تعیین‌شده نیست؛ خالی بودن آن یک وضعیت
            عادی است، نه خطا.
          </p>
          <div className="ops-hero__today">
            <span>
              امروز: <b>{roster.today.label}</b> — {roster.today.localDate}
            </span>
            <span>
              در شیفت امروز: <b>{fa(roster.meta.onShiftToday)}</b> نفر
            </span>
            {roster.meta.linkedAccounts > 0 && (
              <span>
                حساب ورود فعال: <b>{fa(roster.meta.linkedAccounts)}</b>
              </span>
            )}
          </div>
        </div>

        <div className="ops-hero__actions">
          {canWrite && (
            <button type="button" className="ops-btn ops-btn--primary" onClick={() => openCreate()}>
              <IconReact name="plus" size={17} />
              افزودن اپراتور
            </button>
          )}
          <button
            type="button"
            className="ops-btn"
            onClick={() => void roster.refresh()}
            aria-busy={roster.loading}
          >
            <IconReact name={roster.loading ? 'refresh' : 'chart'} size={16} />
            به‌روزرسانی
          </button>
          <a className="ops-btn ops-btn--ghost" href="/admin/schedule">
            <IconReact name="calendar" size={16} />
            ساعات کاری
          </a>
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="ops-kpis">
        <div className="ops-kpi" style={{ ['--kpi-tone' as string]: 'var(--ops-good)' }}>
          <span className="ops-kpi__label">
            <IconReact name="users" size={13} /> اعضای تیم
          </span>
          <span className="ops-kpi__value">{fa(roster.meta.total)}</span>
          <span className="ops-kpi__hint">
            {fa(roster.meta.active)} فعال · {fa(roster.meta.archived)} بایگانی
          </span>
        </div>
        <div className="ops-kpi" style={{ ['--kpi-tone' as string]: 'var(--ops-info)' }}>
          <span className="ops-kpi__label">
            <IconReact name="clock" size={13} /> شیفت امروز
          </span>
          <span className="ops-kpi__value">
            {fa(roster.meta.onShiftToday)}
            <small>از {fa(roster.meta.active)}</small>
          </span>
          <span className="ops-kpi__hint">بر اساس روز کاری و ساعت شیفت</span>
        </div>
        <div className="ops-kpi" style={{ ['--kpi-tone' as string]: 'var(--gold-300)' }}>
          <span className="ops-kpi__label">
            <IconReact name="checkCircle" size={13} /> جلسات انجام‌شده
          </span>
          <span className="ops-kpi__value">{fa(totals.sessions)}</span>
          <span className="ops-kpi__hint">{fa(totals.upcoming)} جلسه پیش‌رو</span>
        </div>
        <div className="ops-kpi" style={{ ['--kpi-tone' as string]: 'var(--gold-400)' }}>
          <span className="ops-kpi__label">
            <IconReact name="cash" size={13} /> درآمد ثبت‌شده
          </span>
          <span
            className="ops-kpi__value"
            style={{ fontSize: '1.02rem' }}
            title={`${totals.revenue.toLocaleString('fa-IR')} تومان`}
          >
            {formatToman(totals.revenue)}
          </span>
          <span className="ops-kpi__hint">جلسات تکمیل‌شده، پس از تخفیف</span>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="ops-toolbar">
        <div className="ops-search">
          <IconReact name="search" size={16} />
          <input
            type="search"
            value={roster.query}
            onChange={(event) => roster.setQuery(event.target.value)}
            placeholder="جستجوی نام، کد، شماره تماس یا ایمیل…"
            aria-label="جستجوی اپراتور"
            enterKeyHint="search"
          />
          {roster.query && (
            <button
              type="button"
              className="ops-search__clear"
              onClick={() => roster.setQuery('')}
              aria-label="پاک کردن جستجو"
            >
              <IconReact name="x" size={14} />
            </button>
          )}
        </div>

        <div className="ops-chips" role="group" aria-label="فیلتر وضعیت">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="ops-chip"
              aria-pressed={roster.status === tab.key}
              onClick={() => roster.setStatus(tab.key)}
            >
              {tab.label}
              <small>{fa(roster.counts[tab.key])}</small>
            </button>
          ))}
        </div>

        <div className="ops-toolbar__row">
          <label className="ops-select">
            نقش
            <select
              value={roster.role ?? 'all'}
              onChange={(event) => roster.setRole(event.target.value as OperatorRoleKey | 'all')}
              aria-label="فیلتر نقش"
            >
              <option value="all">همه نقش‌ها</option>
              {catalog.roles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className="ops-select">
            ترتیب
            <select
              value={roster.sort}
              onChange={(event) => roster.setSort(event.target.value)}
              aria-label="ترتیب فهرست"
            >
              {catalog.sorts.map((sort) => (
                <option key={sort.key} value={sort.key}>
                  {sort.label}
                </option>
              ))}
            </select>
          </label>

          {roster.filtersActive && (
            <button
              type="button"
              className="ops-btn ops-btn--sm ops-btn--ghost"
              onClick={roster.resetFilters}
            >
              <IconReact name="x" size={13} />
              پاک کردن فیلترها
            </button>
          )}

          <span className="ops-count">
            {roster.loading ? 'در حال بارگذاری…' : `${fa(visibleItems.length)} اپراتور`}
          </span>
        </div>
      </div>

      {roster.error && (
        <div className="dashboard-inline-error" role="alert">
          <IconReact name="warning" size={16} />
          <span>{roster.error}</span>
          <button type="button" onClick={() => void roster.refresh()}>
            تلاش دوباره
          </button>
        </div>
      )}

      {/* ── Roster + coverage ────────────────────────────────────── */}
      {isTrulyEmpty ? (
        <EmptyState
          catalog={catalog}
          canWrite={canWrite}
          onPick={(key) => openCreate(key)}
          onBlank={() => openCreate()}
        />
      ) : (
        <div className="ops-layout">
          <div>
            {roster.loading && visibleItems.length === 0 ? (
              <div className="ops-roster" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <div className="ops-skeleton" key={index} style={{ height: 210 }} />
                ))}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="ops-empty">
                <div className="ops-empty__icon">
                  <IconReact name="search" size={22} />
                </div>
                <h3>اپراتوری با این فیلترها پیدا نشد</h3>
                <p>
                  عبارت جستجو را کوتاه‌تر کنید یا فیلترها را پاک کنید. اگر تیم واقعاً خالی است، از
                  دکمه افزودن اپراتور شروع کنید.
                </p>
                <div className="ops-hero__actions" style={{ justifyContent: 'center' }}>
                  <button type="button" className="ops-btn" onClick={roster.resetFilters}>
                    پاک کردن فیلترها
                  </button>
                  {canWrite && (
                    <button
                      type="button"
                      className="ops-btn ops-btn--primary"
                      onClick={() => openCreate()}
                    >
                      <IconReact name="plus" size={16} /> افزودن اپراتور
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="ops-roster">
                {visibleItems.map((operator, index) => (
                  <OperatorCard
                    key={operator.id}
                    operator={operator}
                    todayWeekday={roster.today.weekday}
                    canWrite={canWrite}
                    canManageAccounts={canManageAccounts}
                    busy={roster.pendingId === operator.id}
                    isFirst={index === 0}
                    isLast={index === visibleItems.length - 1}
                    onEdit={openEdit}
                    onAccount={setAccountFor}
                    onToggleActive={(entry) => void roster.toggleActive(entry)}
                    onArchive={(entry) => setConfirm({ kind: 'archive', operator: entry })}
                    onRestore={(entry) => setConfirm({ kind: 'restore', operator: entry })}
                    onMove={(entry, direction) => void roster.move(entry, direction)}
                  />
                ))}
              </div>
            )}
          </div>

          <CoveragePanel
            catalog={catalog}
            coverage={coverage}
            loading={coverageLoading}
            weekday={coverageWeekday}
            todayWeekday={roster.today.weekday}
            onChangeWeekday={(weekday) => void loadCoverage(weekday)}
          />
        </div>
      )}

      {/* ── Drawer ───────────────────────────────────────────────── */}
      {drawer && (
        <>
          <div className="ops-drawer-scrim" onClick={closeDrawer} role="presentation" />
          <aside
            className="ops-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ops-drawer-title"
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeDrawer();
            }}
          >
            <div className="ops-drawer__head">
              <div className="ops-drawer__title">
                <h2 id="ops-drawer-title">
                  {drawer.mode === 'edit'
                    ? `ویرایش ${drawer.operator.displayName}`
                    : 'اپراتور جدید'}
                </h2>
                <p>
                  {drawer.mode === 'edit'
                    ? 'تغییرات بلافاصله روی برنامه شیفت و پیشنهاد نوبت اثر می‌گذارد.'
                    : 'فقط نام و شماره تماس اجباری است؛ بقیه را می‌توانید بعداً کامل کنید.'}
                </p>
              </div>
              <button
                type="button"
                className="ops-drawer__close"
                onClick={closeDrawer}
                aria-label="بستن"
              >
                <IconReact name="x" size={18} />
              </button>
            </div>
            <div className="ops-drawer__body">
              <OperatorForm
                catalog={catalog}
                services={services}
                operator={drawer.mode === 'edit' ? drawer.operator : null}
                busy={
                  roster.pendingId === 'new' ||
                  roster.pendingId === (drawer.mode === 'edit' ? drawer.operator.id : '')
                }
                serverErrors={serverErrors}
                templateKey={drawer.mode === 'create' ? drawer.templateKey : null}
                onSubmit={(payload) => void submitDraft(payload)}
                onCancel={closeDrawer}
              />
            </div>
          </aside>
        </>
      )}

      {/* ── Account dialog ───────────────────────────────────────── */}
      {accountFor && (
        <AccountDialog
          operator={accountFor}
          catalog={catalog}
          busy={roster.pendingId === `account:${accountFor.id}`}
          onClose={() => setAccountFor(null)}
          onSubmit={async (payload) => {
            const result = await roster.createAccount(accountFor, payload);
            // Keep the dialog open: it is now showing the one-time password.
            setAccountFor({
              ...accountFor,
              account: result.operator?.account ?? accountFor.account,
            });
            return result;
          }}
        />
      )}

      {/* ── Confirm dialog ───────────────────────────────────────── */}
      {confirm && (
        <ConfirmDialog
          title={
            confirm.kind === 'archive'
              ? `بایگانی ${confirm.operator.displayName}؟`
              : confirm.kind === 'restore'
                ? `بازیابی ${confirm.operator.displayName}؟`
                : `حذف قطعی ${confirm.operator.displayName}؟`
          }
          body={
            confirm.kind === 'archive' ? (
              <>
                پروفایل از فهرست فعال و نوبت‌دهی خارج می‌شود و حساب ورودش غیرفعال می‌گردد.{' '}
                <b>سابقه جلسات و پرونده بالینی حفظ می‌شود</b> و هر زمان می‌توانید بازیابی کنید.
              </>
            ) : confirm.kind === 'restore' ? (
              <>
                پروفایل دوباره فعال می‌شود. اگر شماره تماس این اپراتور در این فاصله به فرد دیگری
                داده شده باشد، بازیابی با پیام خطا متوقف می‌شود.
              </>
            ) : (
              <>
                این عملیات برگشت‌پذیر نیست و فقط برای پروفایلی مجاز است که هیچ جلسه‌ای نداشته باشد.
                حساب ورود و نقش‌های آن هم حذف می‌شوند.
              </>
            )
          }
          confirmLabel={
            confirm.kind === 'archive'
              ? 'بایگانی کن'
              : confirm.kind === 'restore'
                ? 'بازیابی کن'
                : 'حذف قطعی'
          }
          tone={confirm.kind === 'restore' ? 'primary' : 'danger'}
          busy={roster.pendingId === confirm.operator.id}
          onConfirm={() => void runConfirm()}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Toasts ───────────────────────────────────────────────── */}
      <div className="ops-toasts" role="status" aria-live="polite">
        {roster.toasts.map((toast) => (
          <div
            key={toast.id}
            className={`ops-toast ops-toast--${toast.tone}`}
            onClick={() => roster.dismissToast(toast.id)}
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

/* ── Empty state ─────────────────────────────────────────────────────── */

function EmptyState({
  catalog,
  canWrite,
  onPick,
  onBlank,
}: {
  catalog: OperatorCatalog;
  canWrite: boolean;
  onPick: (templateKey: string) => void;
  onBlank: () => void;
}) {
  return (
    <div className="ops-empty">
      <div className="ops-empty__icon">
        <IconReact name="users" size={26} />
      </div>
      <h3>هنوز هیچ اپراتوری ثبت نشده است</h3>
      <p>
        کلینیک از این لحظه تیم ندارد و این کاملاً طبیعی است — هر وقت خواستید اولین نفر را اضافه
        کنید. با یک الگوی آماده شروع کنید یا فرم خالی را باز کنید؛ بعداً همه‌چیز قابل ویرایش است.
      </p>

      {canWrite ? (
        <div className="ops-templates">
          {catalog.templates.map((template) => (
            <button
              key={template.key}
              type="button"
              className="ops-template"
              onClick={() => onPick(template.key)}
            >
              <IconReact name="plus" size={18} />
              <span className="ops-template__body">
                <strong>{template.label}</strong>
                <span>{template.description}</span>
              </span>
            </button>
          ))}
          <button type="button" className="ops-template" onClick={onBlank}>
            <IconReact name="edit" size={18} />
            <span className="ops-template__body">
              <strong>فرم خالی</strong>
              <span>همه فیلدها را خودتان تعیین کنید</span>
            </span>
          </button>
        </div>
      ) : (
        <p className="ops-hint">برای افزودن اپراتور به مجوز «مدیریت تیم اپراتور» نیاز دارید.</p>
      )}
    </div>
  );
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
function fa(value: number): string {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}
