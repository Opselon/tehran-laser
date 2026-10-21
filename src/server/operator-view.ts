/**
 * Server-side view assembly for the team pages.
 *
 * Both /admin/operators and /admin/operators/[id] need the same closed
 * vocabulary (roles, accents, templates, shifts, RBAC matrix) and the same
 * service options. Building them in one place keeps the SSR payload of the two
 * pages identical to what the island expects, and means a new role or accent
 * never has to be added twice.
 */

import type { Queryable } from '../db/query';
import { listAdminServices } from './repositories';
import { listOperators, listTeamRoles } from './operators';
import type { OperatorDto } from '../domain/operators/operators';
import {
  coverageSegments,
  hourlyCoverage,
  roleOptions,
  summarizeOperators,
  todayWeekday,
} from '../domain/operators/operators';
import {
  OPERATOR_ACCENTS,
  OPERATOR_SORTS,
  OPERATOR_SORT_LABELS,
  OPERATOR_STATUSES,
  OPERATOR_STATUS_LABELS,
  OPERATOR_TEMPLATES,
  SHIFT_PRESETS,
  WORKDAYS,
  workdayLabel,
} from '../domain/operators/catalog';
import { localDateOf } from '../lib/datetime/timezone';

export async function loadOperatorCatalog(db: Queryable) {
  const teamRoles = await listTeamRoles(db);
  return {
    roles: roleOptions(),
    workdays: [...WORKDAYS],
    accents: OPERATOR_ACCENTS,
    templates: OPERATOR_TEMPLATES,
    shifts: SHIFT_PRESETS,
    statuses: OPERATOR_STATUSES.map((key) => ({ key, label: OPERATOR_STATUS_LABELS[key] })),
    sorts: OPERATOR_SORTS.map((key) => ({ key, label: OPERATOR_SORT_LABELS[key] })),
    teamRoles,
  };
}

export async function loadServiceOptions(db: Queryable): Promise<Array<{ id: string; name: string }>> {
  const services = await listAdminServices(db);
  return services.map((service) => ({ id: service.id, name: service.name }));
}

export interface RosterViewPayload {
  initial: {
    items: OperatorDto[];
    meta: ReturnType<typeof summarizeOperators>;
    today: { weekday: number; label: string; localDate: string };
    capabilities: { canWrite: boolean; canManageAccounts: boolean; currentUserId: string | null };
  };
  initialCoverage: {
    weekday: number;
    label: string;
    segments: ReturnType<typeof coverageSegments>;
    hourly: number[];
    roster: Array<{
      id: string;
      displayName: string;
      initials: string;
      avatarColor: string;
      roleLabel: string;
      shiftStart: string;
      shiftEnd: string;
    }>;
  };
}

/** Assemble the first page + today's coverage for SSR. */
export async function buildRosterView(options: {
  db: Queryable;
  timezone: string;
  canWrite: boolean;
  canManageAccounts: boolean;
  currentUserId: string | null;
  now?: Date;
}): Promise<RosterViewPayload> {
  const { db, timezone, canWrite, canManageAccounts, currentUserId } = options;
  const now = options.now ?? new Date();
  const todayIndex = todayWeekday(timezone, now);
  const localDate = localDateOf(now.toISOString(), timezone);

  let operators: OperatorDto[] = [];
  try {
    operators = await listOperators(db, { status: 'all', sort: 'order' }, now);
  } catch (error) {
    console.error('[operators] failed to load SSR roster:', error);
  }

  const activeToday = operators.filter((operator) => operator.active && operator.workdays.includes(todayIndex));

  return {
    initial: {
      items: operators,
      meta: summarizeOperators(operators, todayIndex),
      today: { weekday: todayIndex, label: workdayLabel(todayIndex), localDate },
      capabilities: { canWrite, canManageAccounts, currentUserId },
    },
    initialCoverage: {
      weekday: todayIndex,
      label: workdayLabel(todayIndex),
      segments: coverageSegments(operators, todayIndex),
      hourly: hourlyCoverage(operators, todayIndex),
      roster: activeToday.map((operator) => ({
        id: operator.id,
        displayName: operator.displayName,
        initials: operator.initials,
        avatarColor: operator.avatarColor,
        roleLabel: operator.roleLabel,
        shiftStart: operator.shiftStart,
        shiftEnd: operator.shiftEnd,
      })),
    },
  };
}
