import { AlertTriangle, Banknote, Building2, Calendar, Copy, Hash, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { resolvePensionerRef } from '@/data/admin-mock-data'
import { formatCurrency } from '@/data/pensioner-mock-data'
import { applyDemoDisbursementFixes, buildSuggestedDisbursementDraft, validateBulkDisbursementRecord } from '@/lib/bulk-disbursement-validation'
import { cn } from '@/lib/utils'
import type { BulkDisbursementRecord, BulkDisbursementResult } from '@/types/disbursement'
import type { PensionStatement } from '@/types/pensioner-portal'

const STATUS_OPTIONS: { value: PensionStatement['status']; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

type BulkDisbursementEditSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: BulkDisbursementRecord | null
  result: BulkDisbursementResult | null
  onSave: (recordId: string, updates: Partial<BulkDisbursementRecord>) => void
}

function AmountField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          id={id}
          type="number"
          min={0}
          step="1"
          className="pl-7 tabular-nums"
          value={value}
          onChange={(event) => onChange(event.target.valueAsNumber || 0)}
        />
      </div>
    </div>
  )
}

export function BulkDisbursementEditSheet({
  open,
  onOpenChange,
  record,
  result,
  onSave,
}: BulkDisbursementEditSheetProps) {
  const [draft, setDraft] = useState<Partial<BulkDisbursementRecord>>({})

  useEffect(() => {
    if (!record) return
    setDraft(buildSuggestedDisbursementDraft(record))
  }, [record])

  const hadDemoSuggestions = useMemo(() => {
    if (!record) return false
    const suggested = buildSuggestedDisbursementDraft(record)
    return (
      suggested.ppoNumber !== record.ppoNumber ||
      suggested.netPension !== record.netPension
    )
  }, [record])

  const mergedRecord = useMemo(() => {
    if (!record) return null
    return { ...record, ...draft } as BulkDisbursementRecord
  }, [record, draft])

  const recordsForValidation = useMemo(() => {
    if (!mergedRecord || !result) return []
    return result.records.map((row) => (row.id === mergedRecord.id ? mergedRecord : row))
  }, [mergedRecord, result])

  const liveValidation = useMemo(() => {
    if (!mergedRecord || !result) return null
    return validateBulkDisbursementRecord(mergedRecord, result.paymentMonth, recordsForValidation)
  }, [mergedRecord, result, recordsForValidation])

  const resolvedPensioner = useMemo(() => {
    const ppo = draft.ppoNumber ?? record?.ppoNumber
    if (!ppo) return undefined
    return resolvePensionerRef(ppo)
  }, [draft.ppoNumber, record?.ppoNumber])

  const expectedNet = useMemo(() => {
    const gross = draft.grossPension ?? record?.grossPension ?? 0
    const recovery = draft.recoveryAmount ?? record?.recoveryAmount ?? 0
    const deductions = draft.deductions ?? record?.deductions ?? 0
    return Math.max(0, gross - recovery - deductions)
  }, [draft, record])

  const issueTone = record?.isDuplicate
    ? 'amber'
    : 'rose'

  const handleAmountChange = (field: 'grossPension' | 'recoveryAmount' | 'deductions', value: number) => {
    setDraft((current) => {
      const gross = field === 'grossPension' ? value : current.grossPension ?? record?.grossPension ?? 0
      const recovery = field === 'recoveryAmount' ? value : current.recoveryAmount ?? record?.recoveryAmount ?? 0
      const deductions = field === 'deductions' ? value : current.deductions ?? record?.deductions ?? 0
      return {
        ...current,
        [field]: value,
        netPension: Math.max(0, gross - recovery - deductions),
      }
    })
  }

  const handleSave = () => {
    if (!record || !mergedRecord) return

    const fixedRecord = applyDemoDisbursementFixes(mergedRecord)
    const recordsForSave =
      result?.records.map((row) => (row.id === fixedRecord.id ? fixedRecord : row)) ?? []

    const validation = validateBulkDisbursementRecord(
      fixedRecord,
      result?.paymentMonth ?? '',
      recordsForSave,
    )

    onSave(record.id, {
      ...fixedRecord,
      ...validation,
    })

    if (validation.isValid) {
      toast.success('Row updated and validated', {
        description: `Row ${record.rowNumber} is ready for ${result?.paymentMonth}.`,
      })
      onOpenChange(false)
      return
    }

    toast.error('Row still has issues', {
      description: validation.errors[0],
    })
  }

  if (!record || !result) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden border-l-4 border-l-primary/40 p-0 sm:max-w-lg"
      >
        <SheetHeader className="relative shrink-0 border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-muted/30 px-6 py-6 text-left">
          <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-3xl" aria-hidden />
          <div className="relative space-y-3 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wide">
                Row {record.rowNumber}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wide',
                  issueTone === 'amber'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
                )}
              >
                {record.isDuplicate ? 'Duplicate' : 'Needs correction'}
              </Badge>
            </div>
            <SheetTitle className="text-xl font-bold tracking-tight">
              Edit disbursement row
            </SheetTitle>
            <SheetDescription className="text-sm leading-relaxed">
              Correct this entry for <span className="font-medium text-foreground">{result.paymentMonth}</span> before posting the batch.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/15 px-6 py-6">
          {hadDemoSuggestions && (
            <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                Suggested fixes applied from the linked pensioner — review and save when ready.
              </p>
            </div>
          )}

          {liveValidation && liveValidation.errors.length > 0 && (
            <div className="mb-5 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Validation issues</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {liveValidation.errors.map((error) => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Pensioner match</h3>
                  <p className="text-xs text-muted-foreground">Fix the PPO to link the correct account</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-ppo">PPO number</Label>
                  <div className="relative">
                    <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="edit-ppo"
                      className="pl-9 font-mono text-sm"
                      value={draft.ppoNumber ?? ''}
                      onChange={(event) => setDraft((current) => ({ ...current, ppoNumber: event.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-3 py-2.5 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Matched pensioner</p>
                  <p className="mt-1 font-medium">
                    {resolvedPensioner
                      ? [resolvedPensioner.personal.firstName, resolvedPensioner.personal.lastName].filter(Boolean).join(' ')
                      : 'No pensioner matched yet'}
                  </p>
                  {resolvedPensioner && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {resolvedPensioner.service.department} · {resolvedPensioner.bank.bankName}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Banknote className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Payment amounts</h3>
                  <p className="text-xs text-muted-foreground">Net must equal gross minus recovery and deductions</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AmountField
                  id="edit-gross"
                  label="Gross pension"
                  value={draft.grossPension ?? 0}
                  onChange={(value) => handleAmountChange('grossPension', value)}
                />
                <AmountField
                  id="edit-recovery"
                  label="Recovery"
                  value={draft.recoveryAmount ?? 0}
                  onChange={(value) => handleAmountChange('recoveryAmount', value)}
                />
                <AmountField
                  id="edit-deductions"
                  label="Deductions"
                  value={draft.deductions ?? 0}
                  onChange={(value) => handleAmountChange('deductions', value)}
                />
                <AmountField
                  id="edit-net"
                  label="Net pension"
                  value={draft.netPension ?? 0}
                  onChange={(value) => setDraft((current) => ({ ...current, netPension: value }))}
                />
              </div>
              <div className="mt-4 rounded-lg bg-muted/40 px-3 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expected net</span>
                  <span className="font-semibold tabular-nums text-primary">{formatCurrency(expectedNet)}</span>
                </div>
                {Math.abs(expectedNet - (draft.netPension ?? 0)) > 0.01 && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                    <Copy className="size-3.5" />
                    Net differs from calculated amount
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Bank credit details</h3>
                  <p className="text-xs text-muted-foreground">UTR and credit date for this payment</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-utr">UTR reference</Label>
                  <Input
                    id="edit-utr"
                    className="font-mono text-sm"
                    value={draft.utrReference ?? ''}
                    onChange={(event) => setDraft((current) => ({ ...current, utrReference: event.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-credit-date">Credit date</Label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="edit-credit-date"
                        type="date"
                        className="pl-9"
                        value={draft.creditDate ?? ''}
                        onChange={(event) => setDraft((current) => ({ ...current, creditDate: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={draft.status ?? 'paid'}
                      onValueChange={(value: PensionStatement['status']) =>
                        setDraft((current) => ({ ...current, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <SheetFooter className="shrink-0 border-t border-border/60 bg-background px-6 py-4">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-full" onClick={handleSave}>
              Save changes
            </Button>
          </div>
          {liveValidation?.isValid && (
            <p className="mt-3 text-center text-xs text-muted-foreground sm:text-right">
              All checks pass — this row will be included when you post payments.
            </p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
