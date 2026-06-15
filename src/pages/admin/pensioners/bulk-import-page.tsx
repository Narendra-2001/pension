import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  XCircle,
} from 'lucide-react'
import { useCallback, useState } from 'react'
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
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { confirmBulkImport, processBulkImport } from '@/data/admin-api'
import {
  BULK_IMPORT_STEPS,
  createDemoImportFile,
  downloadBulkImportTemplate,
} from '@/lib/bulk-import-demo'
import { cn } from '@/lib/utils'
import type { BulkImportResult } from '@/types/pensioner'

type ImportPhase = 'upload' | 'processing' | 'preview' | 'done'

const IMPORT_PHASE_STEPS = [
  { id: 'upload', label: 'Upload', description: 'Choose file' },
  { id: 'processing', label: 'Extract', description: 'AI mapping' },
  { id: 'preview', label: 'Review', description: 'Validate rows' },
  { id: 'done', label: 'Complete', description: 'Import done' },
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

export function BulkImportPage() {
  const [phase, setPhase] = useState<ImportPhase>('upload')
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<BulkImportResult | null>(null)

  const processMutation = useMutation({
    mutationFn: processBulkImport,
    onSuccess: (data) => {
      setResult(data)
      setPhase('preview')
      setProgress(100)
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (ids: string[]) => confirmBulkImport(ids),
    onSuccess: (data) => {
      setPhase('done')
      toast.success(`Successfully imported ${data.imported} pensioners`)
    },
  })

  const handleFileSelect = useCallback(
    async (file: File) => {
      setFileName(file.name)
      setPhase('processing')
      setProgress(0)

      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 12, 90))
      }, 200)

      try {
        await processMutation.mutateAsync(file.name)
      } finally {
        clearInterval(interval)
      }
    },
    [processMutation],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect],
  )

  const handleImport = () => {
    if (!result) return
    const validIds = result.records.filter((r) => r.isValid).map((r) => r.id)
    confirmMutation.mutate(validIds)
  }

  const handleDemoImport = () => {
    handleFileSelect(createDemoImportFile())
    toast.success('Demo file loaded', {
      description: 'Processing sample CSV — same flow as a real upload.',
    })
  }

  return (
    <AdminPageShell>
      <AdminDetailHero
        title="Bulk Import Pensioners"
        subtitle="Upload Excel, CSV, or PDF files for AI-powered data extraction"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="rounded-full" onClick={handleDemoImport}>
              <Sparkles className="size-4" /> Try Demo Import
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={downloadBulkImportTemplate}>
              <Download className="size-4" /> Sample CSV
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/admin/pensioners"><ArrowLeft className="size-4" /> Back</Link>
            </Button>
          </div>
        }
      />

      <AdminProcessStepper steps={IMPORT_PHASE_STEPS} currentStep={importPhaseStep(phase)} />

      {phase === 'upload' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
              <h3 className="text-lg font-semibold">Upload Pensioner Data</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Supports .xlsx, .csv, and .pdf files
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {[
                  { ext: '.xlsx', icon: FileSpreadsheet },
                  { ext: '.csv', icon: FileText },
                  { ext: '.pdf', icon: FileText },
                ].map(({ ext, icon: Icon }) => (
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
                      <span><Icon className="size-4" /> {ext.toUpperCase()}</span>
                    </Button>
                  </label>
                ))}
              </div>
              <p className="mt-6 max-w-md text-center text-xs text-muted-foreground">
                New here? Click <strong>Try Demo Import</strong> to run the full flow with sample data,
                or download <strong>Sample CSV</strong> to see the expected column format (opens in Excel).
              </p>
            </CardContent>
          </Card>

          <AdminIllustrationPanel
            imageSrc={featurePensionerManagement}
            alt="Bulk pensioner import"
            title="AI-powered column mapping"
            description="Upload a spreadsheet or document — fields are auto-mapped, validated, and duplicate-checked before you confirm the import."
          />

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">How bulk import works</CardTitle>
              <CardDescription>
                Upload a spreadsheet or document — AI maps columns, validates rows, and flags issues before you confirm.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {BULK_IMPORT_STEPS.map(({ step, title, description }, index) => (
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
              <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Sparkles className="size-4" /> AI data extraction in progress...
              </p>
            </div>
            <Progress value={progress} className="mx-auto max-w-md" />
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Field Mapping</span>
              <span>Validation</span>
              <span>Duplicate Detection</span>
            </div>
          </CardContent>
        </Card>
      )}

      {(phase === 'preview' || phase === 'done') && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Records" value={result.totalRecords} icon={FileSpreadsheet} />
            <StatCard title="Valid Records" value={result.validRecords} icon={CheckCircle2} />
            <StatCard title="Invalid Records" value={result.invalidRecords} icon={XCircle} />
            <StatCard title="Duplicate Records" value={result.duplicateRecords} icon={Copy} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Extracted Records Preview</CardTitle>
              <CardDescription>Review auto-mapped fields before import</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={adminTableStyles.wrap}>
                <Table>
                  <TableHeader>
                    <TableRow className={adminTableStyles.headerRow}>
                      <TableHead className={adminTableStyles.headCell}>Row</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Name</TableHead>
                      <TableHead className={adminTableStyles.headCell}>PPO</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Department</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Bank</TableHead>
                      <TableHead className={adminTableStyles.headCell}>Status</TableHead>
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
                        <TableCell className={adminTableStyles.bodyCell}>
                          {record.personal.firstName} {record.personal.lastName}
                        </TableCell>
                        <TableCell className={cn(adminTableStyles.bodyCell, 'font-mono text-xs')}>
                          {record.service.ppoNumber}
                        </TableCell>
                        <TableCell className={adminTableStyles.bodyCell}>{record.service.department}</TableCell>
                        <TableCell className={adminTableStyles.bodyCell}>{record.bank.bankName}</TableCell>
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
                  {result.validRecords} valid records ready to import. Invalid and duplicate records will be skipped.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setPhase('upload'); setResult(null) }}>
                  Re-upload
                </Button>
                <Button
                  className="rounded-full"
                  onClick={handleImport}
                  disabled={confirmMutation.isPending || result.validRecords === 0}
                >
                  Confirm Import ({result.validRecords})
                </Button>
              </div>
            </div>
          )}

          {phase === 'done' && (
            <Card className={cn('border-emerald-500/30 bg-emerald-500/5')}>
              <CardContent className="flex items-center gap-4 py-6">
                <CheckCircle2 className="size-10 text-emerald-600" />
                <div>
                  <h3 className="font-semibold">Import Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    Pensioner records have been created with Pending Activation status.
                  </p>
                </div>
                <Button className="ml-auto" asChild>
                  <Link to="/admin/pensioners">View Pensioners</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </AdminPageShell>
  )
}
