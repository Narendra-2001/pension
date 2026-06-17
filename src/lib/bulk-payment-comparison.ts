import { addMonths, format, parse, subMonths } from 'date-fns'

import { formatCurrency } from '@/data/pensioner-mock-data'
import type {
  MonthlyPaymentAccountChange,
  MonthlyPaymentAccountSample,
  MonthlyPaymentAccountSummary,
  MonthlyPaymentChangeCategory,
  MonthlyPaymentForecast,
} from '@/types/disbursement'

function hashMonth(month: string): number {
  let hash = 0
  for (let i = 0; i < month.length; i += 1) {
    hash = (hash * 31 + month.charCodeAt(i)) >>> 0
  }
  return hash
}

function seededValue(seed: number, min: number, max: number): number {
  const normalized = (seed % 10_000) / 10_000
  return Math.round(min + normalized * (max - min))
}

export function getPreviousPaymentMonth(paymentMonth: string): string {
  const parsed = parse(paymentMonth, 'MMMM yyyy', new Date())
  return format(subMonths(parsed, 1), 'MMMM yyyy')
}

export function getNextPaymentMonth(paymentMonth: string): string {
  const parsed = parse(paymentMonth, 'MMMM yyyy', new Date())
  return format(addMonths(parsed, 1), 'MMMM yyyy')
}

const CHANGE_META: Record<
  MonthlyPaymentChangeCategory,
  { label: string; description: string; direction: 'add' | 'remove' | 'amount' }
> = {
  new_pensioner: {
    label: 'New pensioners activated',
    description: 'Fresh activations and onboarding completions added to the payment roll',
    direction: 'add',
  },
  family_pension: {
    label: 'Family pension commenced',
    description: 'Nominee or family pension cases activated after demise processing',
    direction: 'add',
  },
  reactivation: {
    label: 'Reactivated accounts',
    description: 'Suspended or held accounts restored after verification or LC clearance',
    direction: 'add',
  },
  deceased: {
    label: 'Deceased removed',
    description: 'Accounts stopped after demise intimation and verification',
    direction: 'remove',
  },
  suspended: {
    label: 'Suspended / withheld',
    description: 'Payments paused for LC failure, verification hold, or compliance flags',
    direction: 'remove',
  },
  dr_revision: {
    label: 'DR revision impact',
    description: 'Dearness Relief revision — payout increase on existing accounts (no new accounts)',
    direction: 'amount',
  },
  medical_allowance_revision: {
    label: 'Medical allowance revision',
    description: 'Annual medical allowance hike — payout increase on existing accounts (no new accounts)',
    direction: 'amount',
  },
  correction: {
    label: 'Registry corrections',
    description: 'Duplicate removals, PPO merges, and data reconciliation adjustments',
    direction: 'add',
  },
}

const SAMPLE_NAMES = [
  ['PPO123456', 'Ramesh Kumar Sharma'],
  ['PPO555001', 'Priya Nair'],
  ['PPO789012', 'Geeta Verma'],
  ['PPO100045', 'Suresh Patel'],
  ['PPO100112', 'Lakshmi Reddy'],
  ['PPO100203', 'Vikram Singh'],
] as const

function buildNarrativeSummary(summary: Omit<MonthlyPaymentAccountSummary, 'narrativeSummary' | 'forecast'>): string {
  const { paymentMonth, previousMonth, currentMonthAccounts, previousMonthAccounts, netAccountChange, changes } =
    summary
  const isIncrease = netAccountChange >= 0
  const direction = isIncrease ? 'increased' : 'decreased'
  const absChange = Math.abs(netAccountChange)

  const additions = changes.filter(
    (c) => CHANGE_META[c.category].direction === 'add' && c.accountDelta > 0,
  )
  const removals = changes.filter((c) => c.accountDelta < 0)
  const payoutOnly = changes.filter((c) => CHANGE_META[c.category].direction === 'amount')

  const additionParts = additions.map(
    (c) => `${formatAccountCount(c.accountDelta)} from ${c.label.toLowerCase()}`,
  )
  const removalParts = removals.map(
    (c) => `${formatAccountCount(Math.abs(c.accountDelta))} due to ${c.label.toLowerCase()}`,
  )
  const payoutParts = payoutOnly.map((c) => c.label.toLowerCase())

  let narrative = `${paymentMonth} will pay ${formatAccountCount(currentMonthAccounts)} accounts`

  if (netAccountChange === 0) {
    narrative += `, unchanged from ${previousMonth} (${formatAccountCount(previousMonthAccounts)} accounts).`
  } else {
    narrative += `, ${direction} by ${formatAccountCount(absChange)} from ${previousMonth} (${formatAccountCount(previousMonthAccounts)} accounts).`
  }

  if (isIncrease) {
    const reasons: string[] = []
    if (additionParts.length > 0) {
      reasons.push(`new accounts: ${additionParts.join(', ')}`)
    }
    if (removalParts.length > 0) {
      reasons.push(`offset by removals: ${removalParts.join(', ')}`)
    }
    if (payoutParts.length > 0) {
      reasons.push(`payout also rises from ${payoutParts.join(' and ')} on existing accounts`)
    }
    if (reasons.length > 0) {
      narrative += ` Increase driven by ${reasons.join('; ')}.`
    }
  } else {
    const reasons: string[] = []
    if (removalParts.length > 0) {
      reasons.push(removalParts.join(', '))
    }
    if (additionParts.length > 0) {
      reasons.push(`partially offset by ${additionParts.join(', ')}`)
    }
    if (reasons.length > 0) {
      narrative += ` Decrease because ${reasons.join('; ')}.`
    }
  }

  return narrative
}

function buildNextMonthForecast(
  paymentMonth: string,
  currentMonthAccounts: number,
  seed: number,
): MonthlyPaymentForecast {
  const nextMonth = getNextPaymentMonth(paymentMonth)
  const projectedNewPensioners = seededValue(seed + 20, 10_000, 18_000)
  const projectedFamilyPension = seededValue(seed + 21, 2_000, 4_500)
  const projectedDeceased = seededValue(seed + 22, 3_000, 5_500)
  const projectedSuspended = seededValue(seed + 23, 1_500, 3_500)
  const projectedReactivations = seededValue(seed + 24, 800, 2_500)
  const projectedNetAccountChange =
    projectedNewPensioners +
    projectedFamilyPension +
    projectedReactivations -
    projectedDeceased -
    projectedSuspended
  const projectedAccountTotal = currentMonthAccounts + projectedNetAccountChange
  const avgNetPayout = seededValue(seed + 7, 42_000, 48_000)
  const projectedDrDelta = seededValue(seed + 25, 0, 80_000_000)
  const projectedMedicalDelta = seededValue(seed + 26, 0, 45_000_000)
  const newAccountPayout = (projectedNewPensioners + projectedFamilyPension) * avgNetPayout
  const projectedPayoutIncrease = newAccountPayout + projectedDrDelta + projectedMedicalDelta

  const changeWord = projectedNetAccountChange >= 0 ? 'rise' : 'fall'
  const summary = `Forecast for ${nextMonth}: expect ~${formatAccountCount(projectedNewPensioners)} new pensioner activations and ~${formatAccountCount(projectedFamilyPension)} family pension cases. Net accounts will ${changeWord} by ~${formatAccountCount(Math.abs(projectedNetAccountChange))} to ~${formatAccountCount(projectedAccountTotal)} total, with estimated payout increase of ${formatCurrency(projectedPayoutIncrease)} including DR and medical allowance impacts.`

  return {
    nextMonth,
    projectedNewPensioners,
    projectedFamilyPension,
    projectedNetAccountChange,
    projectedAccountTotal,
    projectedPayoutIncrease,
    summary,
  }
}

export function buildMonthlyPaymentAccountSummary(paymentMonth: string): MonthlyPaymentAccountSummary {
  const seed = hashMonth(paymentMonth)
  const previousMonth = getPreviousPaymentMonth(paymentMonth)

  const previousMonthAccounts = seededValue(seed, 485_000, 510_000)
  const rawAccountChange = seededValue(seed + 1, 35_000, 62_000)
  const netAccountChange = seed % 6 === 0 ? -rawAccountChange : rawAccountChange
  const currentMonthAccounts = previousMonthAccounts + netAccountChange
  const changePercent = Number(((netAccountChange / previousMonthAccounts) * 100).toFixed(1))

  const newPensioners = seededValue(seed + 2, 12_000, 20_000)
  const familyPension = seededValue(seed + 3, 2_500, 5_500)
  const reactivations = seededValue(seed + 4, 1_200, 3_800)
  const deceased = seededValue(seed + 5, 3_500, 6_500)
  const suspended = seededValue(seed + 6, 1_800, 4_200)
  const corrections = netAccountChange - (newPensioners + familyPension + reactivations - deceased - suspended)

  const avgNetPayout = seededValue(seed + 7, 42_000, 48_000)
  const previousMonthPayout = previousMonthAccounts * avgNetPayout
  const drPayoutDelta = seededValue(seed + 8, 180_000_000, 320_000_000)
  const medicalPayoutDelta = seededValue(seed + 9, 45_000_000, 95_000_000)
  const newAccountsPayout = (newPensioners + familyPension) * avgNetPayout
  const currentMonthPayout = previousMonthPayout + drPayoutDelta + medicalPayoutDelta + newAccountsPayout

  const accountChanges: Array<{ category: MonthlyPaymentChangeCategory; accountDelta: number; payoutDelta?: number }> = [
    { category: 'new_pensioner', accountDelta: newPensioners, payoutDelta: newPensioners * avgNetPayout },
    { category: 'family_pension', accountDelta: familyPension, payoutDelta: familyPension * avgNetPayout },
    { category: 'reactivation', accountDelta: reactivations, payoutDelta: reactivations * avgNetPayout },
    { category: 'deceased', accountDelta: -deceased, payoutDelta: -(deceased * avgNetPayout) },
    { category: 'suspended', accountDelta: -suspended, payoutDelta: -(suspended * avgNetPayout) },
    { category: 'correction', accountDelta: corrections },
    {
      category: 'dr_revision',
      accountDelta: 0,
      payoutDelta: drPayoutDelta,
    },
    {
      category: 'medical_allowance_revision',
      accountDelta: 0,
      payoutDelta: medicalPayoutDelta,
    },
  ]

  const changes: MonthlyPaymentAccountChange[] = accountChanges.map((item, index) => {
    const meta = CHANGE_META[item.category]
    return {
      id: `${item.category}-${index}`,
      category: item.category,
      label: meta.label,
      description: meta.description,
      accountDelta: item.accountDelta,
      payoutDelta: item.payoutDelta,
    }
  })

  const samples: MonthlyPaymentAccountSample[] = SAMPLE_NAMES.slice(0, 6).map(([ppo, name], index) => {
    const categories: MonthlyPaymentChangeCategory[] = [
      'new_pensioner',
      'family_pension',
      'dr_revision',
      'medical_allowance_revision',
      'deceased',
      'reactivation',
    ]
    const category = categories[index]!
    const meta = CHANGE_META[category]
    return {
      ppoNumber: ppo,
      pensionerName: name,
      category,
      reason: meta.description.split('—')[0]?.trim() ?? meta.label,
    }
  })

  const baseSummary = {
    paymentMonth,
    previousMonth,
    previousMonthAccounts,
    currentMonthAccounts,
    netAccountChange,
    changePercent,
    previousMonthPayout,
    currentMonthPayout,
    netPayoutChange: currentMonthPayout - previousMonthPayout,
    changes,
    samples,
  }

  return {
    ...baseSummary,
    narrativeSummary: buildNarrativeSummary(baseSummary),
    forecast: buildNextMonthForecast(paymentMonth, currentMonthAccounts, seed),
  }
}

export function formatAccountCount(value: number): string {
  return value.toLocaleString('en-IN')
}

export { CHANGE_META }
