import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ClipboardList, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

import { LifeCertificateStatusBadge } from '@/components/admin/verification/life-certificate-status-badge'
import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'
import { fetchLifeCertificateSubmissionsByStatus } from '@/data/life-certificate-api'
import { matchesListSearch } from '@/lib/list-search'
import { formatVerificationDisplayDate } from '@/lib/verification-dates'
import type { LifeCertificateReviewStatus, LifeCertificateSubmission } from '@/types/life-certificate-review'

interface VerificationRecordsPageProps {
  status: Extract<LifeCertificateReviewStatus, 'approved' | 'rejected'>
}

const PAGE_COPY: Record<
  VerificationRecordsPageProps['status'],
  { title: string; description: string; emptyTitle: string; emptyDescription: string }
> = {
  approved: {
    title: 'Approved Verifications',
    description: 'Historical record of approved life certificate verifications',
    emptyTitle: 'No approved verifications',
    emptyDescription: 'Approved life certificate submissions will appear here.',
  },
  rejected: {
    title: 'Rejected Verifications',
    description: 'Rejected submissions that may require follow-up or resubmission',
    emptyTitle: 'No rejected verifications',
    emptyDescription: 'Rejected life certificate submissions will appear here.',
  },
}

export function VerificationRecordsPage({ status }: VerificationRecordsPageProps) {
  const copy = PAGE_COPY[status]
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['life-certificate-submissions', status],
    queryFn: () => fetchLifeCertificateSubmissionsByStatus(status),
  })

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return []
    return submissions.filter((submission) =>
      matchesListSearch(search, [
        submission.id,
        submission.ppoNumber,
        submission.pensionerName,
        submission.method,
        submission.reviewedBy,
      ]),
    )
  }, [submissions, search])

  const columns = useMemo<ColumnDef<LifeCertificateSubmission>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Submission ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">{row.original.id}</span>
        ),
      },
      { accessorKey: 'ppoNumber', header: 'PPO' },
      { accessorKey: 'pensionerName', header: 'Pensioner' },
      { accessorKey: 'method', header: 'Method' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <LifeCertificateStatusBadge status={row.original.status} />,
      },
      { accessorKey: 'submittedAt', header: 'Submitted' },
      { accessorKey: 'updatedAt', header: 'Last Updated' },
      ...(status === 'approved'
        ? [
            {
              accessorKey: 'nextVerificationDueDate',
              header: 'Next Due',
              cell: ({ row }: { row: { original: LifeCertificateSubmission } }) =>
                row.original.nextVerificationDueDate
                  ? formatVerificationDisplayDate(row.original.nextVerificationDueDate)
                  : '—',
            } satisfies ColumnDef<LifeCertificateSubmission>,
          ]
        : []),
      {
        accessorKey: 'reviewedBy',
        header: 'Reviewed By',
        cell: ({ row }) => row.original.reviewedBy ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="rounded-full" asChild>
            <Link to="/admin/tasks/life-certificate/$id" params={{ id: row.original.id }}>
              <Eye className="mr-1 size-3.5" /> View
            </Link>
          </Button>
        ),
      },
    ],
    [status],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <AdminListPageHeader
        title={copy.title}
        count={filteredSubmissions.length}
        description={copy.description}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          status === 'rejected' ? (
            <Button variant="outline" className="h-10 rounded-lg px-4 shadow-sm" asChild>
              <Link to="/admin/tasks" search={{ type: 'life_certificate' }}>
                <ClipboardList className="mr-1.5 size-4" />
                Review pending
              </Link>
            </Button>
          ) : undefined
        }
      />

      {filteredSubmissions.length ? (
        <DataListView
          columns={columns}
          data={filteredSubmissions}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(submission, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={submission.id}
              subtitle={`${submission.pensionerName} · ${submission.ppoNumber}`}
              badges={<LifeCertificateStatusBadge status={submission.status} />}
              fields={[
                { label: 'Method', value: submission.method },
                { label: 'Submitted', value: submission.submittedAt },
                { label: 'Last Updated', value: submission.updatedAt },
                ...(status === 'approved' && submission.nextVerificationDueDate
                  ? [
                      {
                        label: 'Next Due',
                        value: formatVerificationDisplayDate(submission.nextVerificationDueDate),
                      },
                    ]
                  : []),
                { label: 'Reviewed By', value: submission.reviewedBy ?? '—' },
              ]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                  <Link to="/admin/tasks/life-certificate/$id" params={{ id: submission.id }}>
                    <Eye className="mr-1 size-3.5" /> View Submission
                  </Link>
                </Button>
              }
            />
          )}
        />
      ) : (
        <EmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
      )}
    </div>
  )
}
