import { format, parseISO } from 'date-fns'
import type { LucideIcon } from 'lucide-react'
import {
  BadgeIndianRupee,
  HeartPulse,
  Minus,
  Percent,
  Receipt,
  RefreshCw,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { PENSION_COMPONENT_CATALOG, PENSION_COMPONENT_CATEGORY_LABELS } from '@/lib/pension-structure'
import type {
  PensionComponentCategory,
  PensionComponentHistoryEntry,
  PensionComponentKind,
} from '@/types/pension-structure'

interface ComponentKindVisual {
  icon: LucideIcon
  dot: string
  iconBg: string
  badge: string
}

const CATEGORY_VISUALS: Record<PensionComponentCategory, ComponentKindVisual> = {
  core: {
    icon: Wallet,
    dot: 'bg-violet-500 ring-violet-500/20',
    iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  },
  allowance: {
    icon: HeartPulse,
    dot: 'bg-sky-500 ring-sky-500/20',
    iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  },
  adjustment: {
    icon: RefreshCw,
    dot: 'bg-amber-500 ring-amber-500/20',
    iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
  deduction: {
    icon: Minus,
    dot: 'bg-rose-500 ring-rose-500/20',
    iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  },
}

const KIND_ICON_OVERRIDES: Partial<Record<PensionComponentKind, LucideIcon>> = {
  basic_pension: BadgeIndianRupee,
  dearness_relief: Percent,
  special_allowance: Star,
  income_tax: Receipt,
  recovery_deduction: TrendingDown,
  arrears: TrendingUp,
}

export function getComponentKindVisual(kind: PensionComponentKind): ComponentKindVisual & {
  categoryLabel: string
  isCredit: boolean
} {
  const catalog = PENSION_COMPONENT_CATALOG[kind]
  const base = CATEGORY_VISUALS[catalog.category]

  return {
    ...base,
    icon: KIND_ICON_OVERRIDES[kind] ?? base.icon,
    categoryLabel: PENSION_COMPONENT_CATEGORY_LABELS[catalog.category],
    isCredit: catalog.isCredit,
  }
}

export function groupHistoryByMonth(
  entries: PensionComponentHistoryEntry[],
): { label: string; entries: PensionComponentHistoryEntry[] }[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const groups = new Map<string, PensionComponentHistoryEntry[]>()

  for (const entry of sorted) {
    const label = format(parseISO(entry.timestamp), 'MMMM yyyy')
    const existing = groups.get(label)
    if (existing) {
      existing.push(entry)
    } else {
      groups.set(label, [entry])
    }
  }

  return Array.from(groups.entries()).map(([label, groupEntries]) => ({
    label,
    entries: groupEntries,
  }))
}

export function getHistoryDeltaTone(delta: number, isCredit: boolean) {
  if (delta === 0) {
    return {
      label: 'No change',
      badge: 'bg-muted text-muted-foreground',
      value: 'text-muted-foreground',
    }
  }

  const favorable = isCredit ? delta > 0 : delta < 0

  if (favorable) {
    return {
      label: isCredit ? 'Increase' : 'Reduction',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
      value: 'text-emerald-700 dark:text-emerald-300',
    }
  }

  return {
    label: isCredit ? 'Decrease' : 'Increase',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
    value: 'text-rose-700 dark:text-rose-300',
  }
}
