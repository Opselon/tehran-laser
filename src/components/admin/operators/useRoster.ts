import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OperatorDto, OperatorListMeta } from '../../../domain/operators/operators';
import type { OperatorStatus } from '../../../domain/operators/catalog';
import type { RoleKey } from '../../../domain/rbac/rbac.types';
import {
  ApiClientError,
  archiveOperator,
  createOperator,
  deleteOperatorPermanently,
  fetchRoster,
  issueAccount,
  reorderOperators,
  restoreOperator,
  setOperatorActive,
  updateOperator,
} from './api-client';
import type { IssuedAccountResponse, RosterFilters, RosterResponse } from './api-client';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
}

interface UseRosterOptions {
  initial: RosterResponse;
  /** Search is debounced; tests and very small rosters can set this to 0. */
  debounceMs?: number;
}

interface RosterState {
  items: OperatorDto[];
  meta: OperatorListMeta;
  today: RosterResponse['today'];
  capabilities: RosterResponse['capabilities'];
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current.slice(-2), { id, tone, message }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4200),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of map.values()) clearTimeout(timer);
      map.clear();
    };
  }, []);

  return { toasts, push, dismiss };
}

/** Client-side mirror of the server's summary, used for instant optimistic
 *  recounts. The authoritative meta arrives with the next fetch. */
function summarize(items: OperatorDto[], todayWeekday: number, previous: OperatorListMeta): OperatorListMeta {
  const meta: OperatorListMeta = {
    total: items.length,
    active: 0,
    archived: 0,
    onShiftToday: 0,
    linkedAccounts: 0,
    roles: {},
  };
  for (const operator of items) {
    if (operator.archivedAt) meta.archived += 1;
    else if (operator.active) {
      meta.active += 1;
      if (operator.workdays.includes(todayWeekday)) meta.onShiftToday += 1;
    }
    if (operator.account) meta.linkedAccounts += 1;
    meta.roles[operator.roleKey] = (meta.roles[operator.roleKey] ?? 0) + 1;
  }
  void previous;
  return meta;
}

export function useRoster({ initial, debounceMs = 320 }: UseRosterOptions) {
  const [state, setState] = useState<RosterState>(initial);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<OperatorStatus | 'all'>('all');
  const [role, setRole] = useState<RosterFilters['role']>('all');
  const [sort, setSort] = useState('order');
  const [weekday, setWeekday] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { toasts, push, dismiss } = useToasts();

  const requestSeq = useRef(0);
  const firstRender = useRef(true);

  const buildFilters = useCallback((): RosterFilters => {
    return {
      ...(query.trim() ? { q: query.trim() } : {}),
      ...(status !== 'all' ? { status } : {}),
      ...(role && role !== 'all' ? { role } : {}),
      sort,
      ...(weekday !== null ? { weekday } : {}),
    };
  }, [query, status, role, sort, weekday]);

  const load = useCallback(
    async (filters: RosterFilters, options: { quiet?: boolean } = {}) => {
      const seq = ++requestSeq.current;
      if (!options.quiet) setLoading(true);
      setError(null);
      try {
        const data = await fetchRoster(filters);
        if (seq !== requestSeq.current) return; // a newer request won
        setState({
          items: data.items,
          meta: data.meta,
          today: data.today,
          capabilities: data.capabilities,
        });
      } catch (err) {
        if (seq !== requestSeq.current) return;
        setError(err instanceof ApiClientError ? err.message : 'بارگذاری فهرست تیم ناموفق بود.');
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [],
  );

  // Debounced refetch whenever a filter changes. The first render keeps the SSR
  // payload (already the unfiltered first page) without a duplicate request.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (!query && status === 'all' && role === 'all' && sort === 'order' && weekday === null) return;
    }
    const timer = setTimeout(() => {
      void load(buildFilters());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [buildFilters, debounceMs, load]);

  const refresh = useCallback(() => load(buildFilters(), { quiet: true }), [load, buildFilters]);

  /** Replace one operator in place (or prepend a new one), then recount. */
  const upsert = useCallback((operator: OperatorDto) => {
    setState((current) => {
      const exists = current.items.some((item) => item.id === operator.id);
      const items = exists
        ? current.items.map((item) => (item.id === operator.id ? operator : item))
        : [operator, ...current.items];
      return { ...current, items, meta: summarize(items, current.today.weekday, current.meta) };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setState((current) => {
      const items = current.items.filter((item) => item.id !== id);
      return { ...current, items, meta: summarize(items, current.today.weekday, current.meta) };
    });
  }, []);

  const run = useCallback(
    async <T,>(id: string, action: () => Promise<T>, successMessage?: string): Promise<T | null> => {
      setPendingId(id);
      try {
        const result = await action();
        if (successMessage) push('success', successMessage);
        return result;
      } catch (err) {
        push('error', err instanceof ApiClientError ? err.message : 'عملیات انجام نشد.');
        return null;
      } finally {
        setPendingId(null);
      }
    },
    [push],
  );

  const create = useCallback(
    async (payload: Parameters<typeof createOperator>[0]) => {
      setPendingId('new');
      try {
        const { operator } = await createOperator(payload);
        upsert(operator);
        push('success', `${operator.displayName} با کد ${operator.code} به تیم اضافه شد.`);
        return operator;
      } catch (err) {
        throw err;
      } finally {
        setPendingId(null);
      }
    },
    [push, upsert],
  );

  const update = useCallback(
    async (id: string, payload: Parameters<typeof updateOperator>[1]) => {
      const result = await run(id, () => updateOperator(id, payload), 'پروفایل به‌روزرسانی شد.');
      if (result?.operator) upsert(result.operator);
      return result?.operator ?? null;
    },
    [run, upsert],
  );

  const toggleActive = useCallback(
    async (operator: OperatorDto) => {
      const result = await run(
        operator.id,
        () => setOperatorActive(operator.id, !operator.active),
        operator.active ? `${operator.displayName} غیرفعال شد.` : `${operator.displayName} فعال شد.`,
      );
      if (result?.operator) upsert(result.operator);
      return result?.operator ?? null;
    },
    [run, upsert],
  );

  const archive = useCallback(
    async (operator: OperatorDto) => {
      const result = await run(
        operator.id,
        () => archiveOperator(operator.id),
        `${operator.displayName} بایگانی شد؛ سابقه جلسات حفظ می‌شود.`,
      );
      if (result) {
        setState((current) => {
          const items = current.items.map((item) =>
            item.id === operator.id
              ? { ...item, archivedAt: new Date().toISOString(), active: false, status: 'archived' as const }
              : item,
          );
          return { ...current, items, meta: summarize(items, current.today.weekday, current.meta) };
        });
      }
      return Boolean(result);
    },
    [run],
  );

  const restore = useCallback(
    async (operator: OperatorDto) => {
      const result = await run(
        operator.id,
        () => restoreOperator(operator.id),
        `${operator.displayName} بازیابی شد.`,
      );
      if (result?.operator) upsert(result.operator);
      return result?.operator ?? null;
    },
    [run, upsert],
  );

  const destroy = useCallback(
    async (operator: OperatorDto) => {
      const result = await run(
        operator.id,
        () => deleteOperatorPermanently(operator.id),
        `${operator.displayName} برای همیشه حذف شد.`,
      );
      if (result) remove(operator.id);
      return Boolean(result);
    },
    [run, remove],
  );

  const move = useCallback(
    async (operator: OperatorDto, direction: -1 | 1) => {
      const ordered = [...state.items].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = ordered.findIndex((item) => item.id === operator.id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= ordered.length) return false;
      const swapped = ordered[index]!;
      ordered[index] = ordered[target]!;
      ordered[target] = swapped;
      const order = ordered.map((item, position) => ({ id: item.id, sortOrder: (position + 1) * 10 }));
      const optimistic = new Map(order.map((entry) => [entry.id, entry.sortOrder]));
      setState((current) => ({
        ...current,
        items: current.items
          .map((item) => ({ ...item, sortOrder: optimistic.get(item.id) ?? item.sortOrder }))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }));
      const result = await run(operator.id, () => reorderOperators(order), 'چیدمان ذخیره شد.');
      if (!result) {
        // Roll back to the server's truth rather than leaving a false order.
        await refresh();
        return false;
      }
      setState((current) => ({
        ...current,
        items: result.items,
        meta: result.meta ?? summarize(result.items, current.today.weekday, current.meta),
      }));
      return true;
    },
    [state.items, run, refresh],
  );

  const createAccount = useCallback(
    async (
      operator: OperatorDto,
      payload: { email?: string | undefined; role?: RoleKey | undefined; password?: string | undefined },
    ) => {
      setPendingId(`account:${operator.id}`);
      try {
        const result: IssuedAccountResponse = await issueAccount(operator.id, payload);
        if (result.operator) upsert(result.operator);
        push(
          'success',
          result.account.mode === 'created'
            ? 'حساب ورود ساخته شد؛ رمز موقت فقط یک بار نمایش داده می‌شود.'
            : 'رمز عبور بازنشانی شد؛ نشست‌های قبلی بسته شدند.',
        );
        return result;
      } catch (err) {
        throw err;
      } finally {
        setPendingId(null);
      }
    },
    [push, upsert],
  );

  const counts = useMemo(
    () => ({
      all: state.meta.total,
      active: state.meta.active,
      inactive: state.items.filter((item) => !item.archivedAt && !item.active).length,
      archived: state.meta.archived,
    }),
    [state.items, state.meta],
  );

  const resetFilters = useCallback(() => {
    setQuery('');
    setStatus('all');
    setRole('all');
    setSort('order');
    setWeekday(null);
  }, []);

  const filtersActive = query.trim() !== '' || status !== 'all' || role !== 'all' || weekday !== null;

  return {
    ...state,
    toasts,
    pushToast: push,
    dismissToast: dismiss,
    query,
    setQuery,
    status,
    setStatus,
    role,
    setRole,
    sort,
    setSort,
    weekday,
    setWeekday,
    loading,
    error,
    pendingId,
    counts,
    filtersActive,
    resetFilters,
    refresh,
    create,
    update,
    toggleActive,
    archive,
    restore,
    destroy,
    move,
    createAccount,
  };
}

export type RosterController = ReturnType<typeof useRoster>;
