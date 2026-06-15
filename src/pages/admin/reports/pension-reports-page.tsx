import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Download, FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataTable } from '@/components/admin/shared/data-table'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  fetchDrRevisionReport,
  fetchGrossPensionReport,
  fetchNetPensionReport,
  fetchPensionComponentReport,
  fetchRecoveryDeductionReport,
} from '@/data/pension-structure-api'
import { formatPensionCurrency } from '@/lib/pension-structure'
import type { PensionComponentHistoryEntry, PensionComponentReportRow, PensionReportRow } from '@/types/pension-structure'

export function PensionReportsPage() {
  const [activeTab, setActiveTab] = useState('components')

  const { data: componentReport, isLoading: loadingComponents } = useQuery({
    queryKey: ['pension-report-components'],
    queryFn: fetchPensionComponentReport,
  })

  const { data: grossReport, isLoading: loadingGross } = useQuery({
    queryKey: ['pension-report-gross'],
    queryFn: fetchGrossPensionReport,
  })

  const { data: netReport, isLoading: loadingNet } = useQuery({
    queryKey: ['pension-report-net'],
    queryFn: fetchNetPensionReport,
  })

  const { data: drReport, isLoading: loadingDr } = useQuery({
    queryKey: ['pension-report-dr'],
    queryFn: fetchDrRevisionReport,
  })

  const { data: recoveryReport, isLoading: loadingRecovery } = useQuery({
    queryKey: ['pension-report-recovery'],
    queryFn: fetchRecoveryDeductionReport,
  })

  const isLoading = loadingComponents || loadingGross || loadingNet || loadingDr || loadingRecovery

  const componentColumns = useMemo<ColumnDef<PensionComponentReportRow>[]>(
    () => [
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'componentName', header: 'Component' },
      { accessorKey: 'componentType', header: 'Type' },
      { accessorKey: 'category', header: 'Category' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => formatPensionCurrency(row.original.amount),
      },
      { accessorKey: 'effectiveDate', header: 'Effective Date' },
      { accessorKey: 'status', header: 'Status' },
    ],
    [],
  )

  const pensionColumns = useMemo<ColumnDef<PensionReportRow>[]>(
    () => [
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'pensionerName', header: 'Pensioner' },
      { accessorKey: 'pensionType', header: 'Type' },
      {
        accessorKey: 'basicPension',
        header: 'Basic',
        cell: ({ row }) => formatPensionCurrency(row.original.basicPension),
      },
      {
        accessorKey: 'dearnessRelief',
        header: 'DR',
        cell: ({ row }) => formatPensionCurrency(row.original.dearnessRelief),
      },
      {
        accessorKey: 'grossPension',
        header: 'Gross',
        cell: ({ row }) => formatPensionCurrency(row.original.grossPension),
      },
      {
        accessorKey: 'netPension',
        header: 'Net',
        cell: ({ row }) => (
          <span className="font-semibold">{formatPensionCurrency(row.original.netPension)}</span>
        ),
      },
    ],
    [],
  )

  const drColumns = useMemo<ColumnDef<PensionComponentHistoryEntry>[]>(
    () => [
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'componentName', header: 'Component' },
      {
        accessorKey: 'oldValue',
        header: 'Old Value',
        cell: ({ row }) => formatPensionCurrency(row.original.oldValue),
      },
      {
        accessorKey: 'newValue',
        header: 'New Value',
        cell: ({ row }) => formatPensionCurrency(row.original.newValue),
      },
      { accessorKey: 'effectiveDate', header: 'Effective Date' },
      { accessorKey: 'reason', header: 'Reason' },
      { accessorKey: 'changedBy', header: 'Changed By' },
    ],
    [],
  )

  const handleExport = (reportName: string) => {
    toast.success(`${reportName} exported`, { description: 'Demo CSV download triggered' })
  }

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title="Pension Reports"
        description="Component-level pension reports derived from the calculation engine"
        actions={
          <Button className="rounded-full" onClick={() => handleExport(activeTab)}>
            <Download className="size-4" />
            Export Report
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="components" className="rounded-lg">Component Report</TabsTrigger>
          <TabsTrigger value="gross" className="rounded-lg">Gross Pension</TabsTrigger>
          <TabsTrigger value="net" className="rounded-lg">Net Pension</TabsTrigger>
          <TabsTrigger value="dr" className="rounded-lg">DR Revision</TabsTrigger>
          <TabsTrigger value="recovery" className="rounded-lg">Recovery Deduction</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="mt-4">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                Pension Component Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={componentReport ?? []} columns={componentColumns} searchKey="ppoNumber" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gross" className="mt-4">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Gross Pension Report</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={grossReport ?? []} columns={pensionColumns} searchKey="ppoNumber" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="net" className="mt-4">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Net Pension Report</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={netReport ?? []} columns={pensionColumns} searchKey="ppoNumber" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dr" className="mt-4">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">DR Revision Report</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={drReport ?? []} columns={drColumns} searchKey="ppoNumber" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="mt-4">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Recovery Deduction Report</CardTitle></CardHeader>
            <CardContent>
              <DataTable data={recoveryReport ?? []} columns={componentColumns} searchKey="ppoNumber" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
