import { Link } from '@tanstack/react-router'
import { useListViewMode } from '@/hooks/use-list-view-mode'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Heart } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { getVerificationStatusVariant, StatusPill } from '@/components/pensioner/shared/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createDemiseReport, fetchDemiseReports } from '@/data/pensioner-api'
import { invalidateDemiseWorkflowQueries } from '@/lib/demise-queries'
import { matchesListSearch } from '@/lib/list-search'
import type { DemiseReport } from '@/types/pensioner-portal'

const demiseSchema = z.object({
  dateOfDeath: z.string().min(1, 'Date of death is required'),
  placeOfDeath: z.string().min(3, 'Place of death is required'),
  remarks: z.string().optional(),
})

export function DemiseReportingPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: reports, isLoading } = useQuery({
    queryKey: ['pensioner-demise'],
    queryFn: fetchDemiseReports,
  })

  const form = useForm({
    resolver: zodResolver(demiseSchema),
    defaultValues: { dateOfDeath: '', placeOfDeath: '', remarks: '' },
  })

  const submitMutation = useMutation({
    mutationFn: createDemiseReport,
    onSuccess: () => {
      invalidateDemiseWorkflowQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: ['pensioner-demise'] })
      toast.success('Demise report submitted', {
        description: 'Your report is under review by the pension authority.',
      })
      form.reset()
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    submitMutation.mutate({
      ...values,
      remarks: values.remarks ?? '',
      certificateFileName: 'death_certificate.pdf',
    })
  })

  const filteredReports = useMemo(() => {
    if (!reports) return []
    return reports.filter((report) =>
      matchesListSearch(search, [
        report.id,
        report.dateOfDeath,
        report.placeOfDeath,
        report.status,
        report.remarks,
      ]),
    )
  }, [reports, search])

  const reportColumns = useMemo<ColumnDef<DemiseReport>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Report ID',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      },
      { accessorKey: 'dateOfDeath', header: 'Date of Death' },
      { accessorKey: 'placeOfDeath', header: 'Place' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill
            label={row.original.status.replace('_', ' ')}
            variant={getVerificationStatusVariant(row.original.status)}
          />
        ),
      },
      { accessorKey: 'submittedAt', header: 'Submitted' },
    ],
    [],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <PageHeader
        variant="admin"
        title="Demise Reporting"
        description="Report demise of pensioner for family pension processing"
      />

      <Card className="admin-card mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Nominee? Use the dedicated Nominee Portal</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Nominees should not use the pensioner account. Access via OTP verification with PPO and mobile number.
            </p>
          </div>
          <Button className="rounded-full shrink-0" asChild>
            <Link to="/nominee/login">Nominee Portal</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="admin-card mb-6 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="flex items-start gap-3 p-4">
          <Heart className="size-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This form is for nominees or family members to report the demise of a pensioner.
            Please upload the death certificate and provide accurate details.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-card">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Submit Demise Report</h3>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dateOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Death</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placeOfDeath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Death</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City, State" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Death Certificate</FormLabel>
                  <Input type="file" accept=".pdf,.jpg,.png" className="rounded-xl" />
                </FormItem>
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="rounded-xl" placeholder="Additional information..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-xl" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <AdminListPageHeader
            title="Report History"
            count={filteredReports.length}
            description="Previously submitted demise reports"
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search"
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            className="mb-4"
          />

          {filteredReports.length ? (
            <DataListView
              columns={reportColumns}
              data={filteredReports}
              pageSize={6}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={false}
              renderCard={(report, serialNo) => (
                <ListRecordCard
                  serialNo={serialNo}
                  title={report.id}
                  subtitle={report.dateOfDeath}
                  badges={
                    <StatusPill
                      label={report.status.replace('_', ' ')}
                      variant={getVerificationStatusVariant(report.status)}
                    />
                  }
                  fields={[
                    { label: 'Place', value: report.placeOfDeath },
                    { label: 'Submitted', value: report.submittedAt },
                    { label: 'Remarks', value: report.remarks || '—' },
                  ]}
                />
              )}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No reports submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
