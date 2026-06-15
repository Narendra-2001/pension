import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Eye, Plus, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { useCommunicationPortal } from '@/components/communication/communication-portal-context'
import { NoticePdfPreviewDialog } from '@/components/communication/notice-pdf-preview-dialog'
import { NoticeStatusBadge } from '@/components/communication/notice-status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  downloadNoticeApi,
  fetchNotices,
  resendNoticeApi,
} from '@/data/communication-api'
import { NOTICE_TYPE_LABELS } from '@/lib/communication'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { NoticeStatus, OfficialNotice } from '@/types/communication'

export function NoticeHistoryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { basePath, permissions } = useCommunicationPortal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | NoticeStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()
  const [previewNotice, setPreviewNotice] = useState<OfficialNotice | null>(null)

  const { data: notices, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: fetchNotices,
  })

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendNoticeApi(id, user?.name ?? 'Admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      queryClient.invalidateQueries({ queryKey: ['notice-dashboard-stats'] })
      toast.success('Notice resent successfully')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const downloadMutation = useMutation({
    mutationFn: (id: string) => downloadNoticeApi(id, user?.name ?? 'Admin'),
    onSuccess: () => toast.success('Notice download recorded'),
  })

  const filtered = useMemo(() => {
    if (!notices) return []
    return notices.filter((n) => {
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      return matchesListSearch(search, [
        n.id,
        n.ppoNumber,
        n.pensionerName,
        NOTICE_TYPE_LABELS[n.noticeType],
      ])
    })
  }, [notices, search, statusFilter])

  const columns = useMemo<ColumnDef<OfficialNotice>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Notice ID',
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
      },
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      {
        accessorKey: 'noticeType',
        header: 'Notice Type',
        cell: ({ row }) => (
          <span className="text-xs">{NOTICE_TYPE_LABELS[row.original.noticeType]}</span>
        ),
      },
      {
        accessorKey: 'generatedAt',
        header: 'Generated Date',
        cell: ({ row }) => format(new Date(row.original.generatedAt), 'dd MMM yyyy'),
      },
      {
        accessorKey: 'status',
        header: 'Delivery Status',
        cell: ({ row }) => <NoticeStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate({ href: `${basePath}/notices/${row.original.id}` })}>
              <Eye className="mr-1 size-3.5" /> View
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPreviewNotice(row.original)}>
              <Download className="mr-1 size-3.5" /> PDF
            </Button>
            {permissions.canSendNotice && (
              <Button variant="ghost" size="sm" className="rounded-full" disabled={resendMutation.isPending} onClick={() => resendMutation.mutate(row.original.id)}>
                <RefreshCw className="mr-1 size-3.5" /> Resend
              </Button>
            )}
          </div>
        ),
      },
    ],
    [basePath, navigate, permissions.canSendNotice, resendMutation],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Notice History"
        description="View, download, and resend official pension notices"
        action={
          permissions.canCreateNotice ? (
            <Button className="rounded-full" onClick={() => navigate({ href: `${basePath}/notices/create` })}>
              <Plus className="mr-1.5 size-4" /> Generate Notice
            </Button>
          ) : undefined
        }
      />

      <AdminListPageHeader
        title="All Notices"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID, PPO, name..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={statusFilter !== 'all' ? 1 : 0}
            title="Filter notices"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      {!filtered.length ? (
        <EmptyState title="No notices found" description="Generate a notice to get started" />
      ) : (
        <DataListView
          columns={columns}
          data={filtered}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(notice, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={notice.id}
              subtitle={`${notice.ppoNumber} · ${format(new Date(notice.generatedAt), 'dd MMM yyyy')}`}
              badges={<NoticeStatusBadge status={notice.status} />}
              fields={[
                { label: 'Pensioner', value: notice.pensionerName },
                { label: 'Type', value: NOTICE_TYPE_LABELS[notice.noticeType] },
              ]}
              action={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => navigate({ href: `${basePath}/notices/${notice.id}` })}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPreviewNotice(notice)}>
                    PDF
                  </Button>
                </div>
              }
            />
          )}
        />
      )}

      <NoticePdfPreviewDialog
        notice={previewNotice}
        open={!!previewNotice}
        onOpenChange={(open) => !open && setPreviewNotice(null)}
        onDownload={() => previewNotice && downloadMutation.mutate(previewNotice.id)}
      />
    </motion.div>
  )
}
