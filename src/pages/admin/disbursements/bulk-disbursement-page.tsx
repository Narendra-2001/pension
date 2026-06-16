import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  IndianRupee,
  Loader2,
  PenLine,
  Sparkles,
  Upload,
  XCircle,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { adminTableStyles } from '@/components/admin/shared/admin-table-styles'
import {
  AdminDetailHero,
  AdminIllustrationPanel,
  AdminPageShell,
  AdminProcessStepper,
} from '@/components/admin/shared/admin-detail-ui'
import { StatCard } from '@/components/admin/shared/stat-card'
import featurePensionerManagement from '@/assets/features/feature-pensioner-management.png'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { confirmBulkDisbursementBatch, processBulkDisbursement } from '@/data/admin-api'
import { formatCurrency } from '@/data/pensioner-mock-data'
import {
  BULK_DISBURSEMENT_STEPS,
  createDemoDisbursementFile,
  downloadBulkDisbursementTemplate,
} from '@/lib/bulk-disbursement-demo'
import { buildPaymentMonthOptions } from '@/lib/disbursement-schema'
import { cn } from '@/lib/utils'
import type { BulkDisbursementResult } from '@/types/disbursement'

type ImportPhase = 'upload' | 'processing' | 'preview' | 'done'

const IMPORT_PHASE_STEPS = [
  { id: 'upload', label: 'Month & Upload', description: 'Choose period and file' },
  { id: 'processing', label: 'Validate', description: 'Match pensioners' },
  { id: 'preview', label: 'Review', description: 'Check amounts' },
  { id: 'done', label: 'Complete', description: 'Payments posted' },
]

function importPhaseStep(phase: ImportPhase): number {
  switch (phase) {
    case 'upload':
      return 1
    case 'processing':
      return 2
    case 'preview':
      return 3
    case 'done':
      return 4
    default:
      return 1
  }
}

export function BulkDisbursementPage() {
  const monthOptions = useMemo(() => buildPaymentMonthOptions(), [])
  const [paymentMonth, setPaymentMonth] = useState(monthOptions[0] ?? 'July 2026')
  const [phase, setPhase] = useState<ImportPhase>('upload')
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<BulkDisbursementResult | null>(null)

  const processMutation = useMutation({
    mutationFn: ({ file, month }: { file: string; month: string }) =>
      processBulkDisbursement(file, month),
    onSuccess: (data) => {
      setResult(data)
      setPhase('preview')
      setProgress(100)
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (preview: BulkDisbursementResult) => {
      const validIds = preview.records.filter((record) => record.isValid).map((record) => record.id)
      return confirmBulkDisbursementBatch({
        paymentMonth: preview.paymentMonth,
        recordIds: validIds,
        preview,
      })
    },
    onSuccess: (data) => {
      setPhase('done')
      toast.success(`Posted ${data.processed} monthly payments`, {
        description: `Total net disbursement: ${formatCurrency(data.totalNetAmount)}`,
      })
    },
  })

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!paymentMonth) {
        toast.error('Select a payment month before uploading')
        return
      }

      setFileName(file.name)
      setPhase('processing')
      setProgress(0)

      const interval = setInterval(() => {
        setProgress((value) => Math.min(value + 12, 90))
      }, 200)

      try {
        await processMutation.mutateAsync({ file: file.name, month: paymentMonth })
      } finally {
        clearInterval(interval)
      }
    },
    [paymentMonth, processMutation],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const handleConfirm = () => {
    if (!result) return
    confirmMutation.mutate(result)
  }

  const handleDemoUpload = () => {
    handleFileSelect(createDemoDisbursementFile())
    toast.success('Demo payment file loaded', {
      description: 'Processing sample CSV for the selected month.',
    })
  }

  return (
    <AdminPageShell>
      <AdminDetailHero
        title="Bulk Monthly Payment"
        subtitle="Upload a disbursement file to post monthly pension credits in batch"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-full" asChild>
              <Link to="/admin/disbursements/manual">
                <PenLine className="size-4" /> Manual Entry
              </Link>
            </Button>
            <Button type="button" variant="secondary" className="rounded-full" onClick={handleDemoUpload}>
              <Sparkles className="size-4" /> Try Demo Upload
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={downloadBulkDisbursementTemplate}>
              <Download className="size-4" /> Sample CSV
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/admin/dashboard"><ArrowLeft className="size-4" /> Back</Link>
            </Button>
          </div>
        }
      />

      <AdminProcessStepper steps={IMPORT_PHASE_STEPS} currentStep={importPhaseStep(phase)} />

      {phase === 'upload' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Payment month</CardTitle>
              <CardDescription>
                All rows in the uploaded file will be posted against this disbursement period.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-sm">
              <Label htmlFor="payment-month">Month</Label>
              <Select value={paymentMonth} onValueChange={setPaymentMonth}>
                <SelectTrigger id="payment-month" className="mt-2">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card
            className="admin-upload-zone border-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <CardContent className="flex flex-col items-center justify-center py-16">
              <motion.div
                className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Upload className="size-8 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold">Upload Monthly Payment File</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Supports .csv and .xlsx disbursement files for {paymentMonth}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {['.csv', '.xlsx'].map((ext) => (
                  <label key={ext} className="cursor-pointer">
                    <input
                      type="file"
                      accept={ext}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(file)
                      }}
                    />
                    <Button variant="outline" className="gap-2" asChild>
                      <span>
                        <FileSpreadsheet className="size-4" /> {ext.toUpperCase()}
                      </span>
                    </Button>
                  </label>
                ))}
              </div>
              <p className="mt-6 max-w-lg text-center text-xs text-muted-foreground">
                Expected columns: PPO Number, Gross Pension, Recovery Amount, Deductions, Net Pension,
                UTR Reference, Credit Date, Status.
              </p>
            </CardContent>
          </Card>

          <AdminIllustrationPanel
            imageSrc={featurePensionerManagement}
            alt="Bulk monthly pension disbursement"
            title="Batch NEFT disbursement"
            description="Match pensioners by PPO, validate net amounts, flag duplicate months, and post credits with UTR references in one workflow."
          />

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">How bulk monthly payment works</CardTitle>
              <CardDescription>
                Upload the monthly disbursement register — the system validates and posts payments to pensioner accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {BULK_DISBURSEMENT_STEPS.map(({ step, title, description }, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                    className="rounded-xl border border-border/60 bg-muted/30 p-4 transition-colors hover:border-primary/20 hover:bg-primary/[0.03]"
                  >
                    <div className="mb-2 flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {step}
                    </div>
                    <h4 className="font-medium">{title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {phase === 'processing' && (
        <Card className="admin-card">
          <CardContent className="space-y-6 py-12 text-center">
            <Loader2 className="mx-auto size-10 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold">Processing {fileName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Validating PPO matches and {paymentMonth} payment rows...
              </p>
            </div>
            <Progress value={progress} className="mx-auto max-w-md" />
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>PPO Lookup</span>
              <span>Amount Check</span>
              <span>Duplicate Month</span>
            </div>
          </CardContent>
        </Card>
      )}

      {(phase === 'preview' || phase === 'done') && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Payment Month" value={result.paymentMonth} icon={FileSpreadsheet} />
            <StatCard title="Total Rows" value={result.totalRecords} icon={FileSpreadsheet} />
            <StatCard title="Valid Rows" value={result.validRecords} icon={CheckCircle2} />
            <StatCard title="Invalid Rows" value={result.invalidRecords} icon={XCircle} />
            <StatCard
              title="Net Disbursement"
              value={formatCurrency(result.totalNetAmount)}
              icon={IndianRupee}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disbursement Preview — {result.paymentMonth}</CardTitle>
              <CardDescription>Review matched pensioners and payment amounts before posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={adminTableStyles.wrap}>
                <Table>
                  <TableHeader>
                    <TableRow className={adminTableStyles.headerRow}>
                      <TableHead className={adminTableStyles.headCell}>Row</TableHead>
                      <TableHead className={adminTableStyles.headCell}>PPO</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Pensioner</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Gross</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Net</TableHead>
                      <TableHead className={adminTableStyles.headCell}>UTR</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Status</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Validation</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.records.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className={adminTableStyles.bodyRow}
                        style={{ '--table-row-index': index } as React.CSSProperties}
                      >
                        <TableCell className={adminTableStyles.bodyCell}>{record.rowNumber}</TableCell>
                        <TableCell className={cn(adminTableStyles.bodyCell, 'font-mono text-xs')}>
                          {record.ppoNumber}
                        </TableCell>
                        <TableCell className={adminTableStyles.bodyCell}>{record.pensionerName}</TableCell>
                        <TableCell className={adminTableStyles.bodyCell}>
                          {formatCurrency(record.grossPension)}
                        </TableCell>
                        <TableCell className={adminTableStyles.bodyCell}>
                          {formatCurrency(record.netPension)}
                        </TableCell>
                        <TableCell className={cn(adminTableStyles.bodyCell, 'font-mono text-xs')}>
                          {record.utrReference}
                        </TableCell>
                        <TableCell className={adminTableStyles.bodyCell}>
                          <Badge variant="outline" className="capitalize">
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={adminTableStyles.bodyCell}>
                          {record.isValid ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600">Valid</Badge>
                          ) : record.isDuplicate ? (
                            <Badge className="bg-amber-500/10 text-amber-600">Duplicate</Badge>
                          ) : (
                            <Badge variant="destructive">Invalid</Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(adminTableStyles.bodyCell, 'max-w-[200px] truncate text-xs text-destructive')}
                        >
                          {record.errors.join(', ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {phase === 'preview' && (
            <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-600" />
                <p className="text-sm">
                  {result.validRecords} payments ready for {result.paymentMonth}. Invalid and duplicate rows will be skipped.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setPhase('upload'); setResult(null) }}>
                  Re-upload
                </Button>
                <Button
                  className="rounded-full"
                  onClick={handleConfirm}
                  disabled={confirmMutation.isPending || result.validRecords === 0}
                >
                  Post Payments ({result.validRecords})
                </Button>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <Card className={cn('border-emerald-500/30 bg-emerald-500/5')}>
              <CardContent className="flex items-center gap-4 py-6">
                <CheckCircle2 className="size-10 text-emerald-600" />
                <div>
                  <h3 className="font-semibold">Disbursement Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.validRecords} pension credits posted for {result.paymentMonth}. Pensioners have been notified.
                  </p>
                </div>
                <Button className="ml-auto" variant="outline" asChild>
                  <Link to="/admin/reports/pension">View Reports</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </AdminPageShell>
  )
}
