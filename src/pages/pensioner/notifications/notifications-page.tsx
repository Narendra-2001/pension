import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Download, FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { NoticePdfPreviewDialog } from '@/components/communication/notice-pdf-preview-dialog'
import { NoticeStatusBadge } from '@/components/communication/notice-status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { downloadNoticeApi } from '@/data/communication-api'
import { fetchNotifications, fetchOfficialNotices, markNotificationAsRead } from '@/data/pensioner-api'
import { NOTICE_TYPE_LABELS } from '@/lib/communication'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { OfficialNotice } from '@/types/communication'
import type { PensionerNotification } from '@/types/pensioner-portal'
import { cn } from '@/lib/utils'

const typeLabels: Record<string, string> = {
  verification_reminder: 'Verification',
  pension_update: 'Pension',
  recovery_notice: 'Recovery',
  document_request: 'Document',
  system_announcement: 'System',
  suspension_notice: 'Suspension',
  restoration_update: 'Restoration',
}

type TabValue = 'unread' | 'read' | 'notices'

const notificationTabs: {
  value: TabValue
  label: string
  icon?: typeof FileText
}[] = [
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'notices', label: 'Official Notices', icon: FileText },
]

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const [selected, setSelected] = useState<PensionerNotification | null>(null)
  const [previewNotice, setPreviewNotice] = useState<OfficialNotice | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<TabValue>('unread')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['pensioner-notifications'],
    queryFn: fetchNotifications,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const { data: officialNotices, isLoading: noticesLoading } = useQuery({
    queryKey: ['pensioner-official-notices', pensionerId],
    queryFn: () => fetchOfficialNotices(pensionerId),
    enabled: !!pensionerId,
  })

  useEffect(() => {
    if (!pensionerId) return
    void queryClient.refetchQueries({ queryKey: ['pensioner-dashboard', pensionerId] })
    void queryClient.refetchQueries({ queryKey: ['pensioner-verification', pensionerId] })
  }, [pensionerId, queryClient])

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pensioner-notifications'] }),
  })

  const handleOpen = (notif: PensionerNotification) => {
    setSelected(notif)
    if (!notif.read) markReadMutation.mutate(notif.id)
  }

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  const filteredNotifications = useMemo(() => {
    if (!notifications) return []
    return notifications.filter((notif) => {
      if (activeTab === 'unread' && notif.read) return false
      if (activeTab === 'read' && !notif.read) return false
      if (activeTab === 'notices') return false
      return matchesListSearch(search, [
        notif.title,
        notif.message,
        typeLabels[notif.type] ?? notif.type,
      ])
    })
  }, [notifications, search, activeTab])

  const filteredNotices = useMemo(() => {
    if (!officialNotices || activeTab !== 'notices') return []
    return officialNotices.filter((notice) =>
      matchesListSearch(search, [
        notice.id,
        notice.ppoNumber,
        NOTICE_TYPE_LABELS[notice.noticeType],
      ]),
    )
  }, [officialNotices, search, activeTab])

  const columns = useMemo<ColumnDef<PensionerNotification>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
            {typeLabels[row.original.type] ?? row.original.type}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <span className={cn('font-medium', !row.original.read && 'text-foreground')}>
            {row.original.title}
          </span>
        ),
      },
      {
        accessorKey: 'message',
        header: 'Message',
        cell: ({ row }) => (
          <span className="line-clamp-1 text-muted-foreground">{row.original.message}</span>
        ),
      },
      {
        accessorKey: 'timestamp',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.timestamp), 'dd MMM yyyy, hh:mm a'),
      },
      {
        id: 'read',
        header: 'Status',
        cell: ({ row }) =>
          row.original.read ? (
            <CheckCheck className="size-4 text-muted-foreground" />
          ) : (
            <span className="size-2 rounded-full bg-primary" />
          ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={() => handleOpen(row.original)}>
            View
          </Button>
        ),
      },
    ],
    [],
  )

  const noticeColumns = useMemo<ColumnDef<OfficialNotice>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Notice ID',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      },
      {
        accessorKey: 'noticeType',
        header: 'Type',
        cell: ({ row }) => NOTICE_TYPE_LABELS[row.original.noticeType],
      },
      {
        accessorKey: 'generatedAt',
        header: 'Date',
        cell: ({ row }) => format(new Date(row.original.generatedAt), 'dd MMM yyyy'),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <NoticeStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPreviewNotice(row.original)}>
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={async () => {
                await downloadNoticeApi(row.original.id, user?.name ?? 'Pensioner')
                setPreviewNotice(row.original)
                toast.success('Notice opened for download')
              }}
            >
              <Download className="mr-1 size-3.5" /> Download
            </Button>
          </div>
        ),
      },
    ],
    [user?.name],
  )

  if (isLoading || noticesLoading) return <PageLoadingSkeleton />

  const displayData = activeTab === 'notices' ? filteredNotices : filteredNotifications
  const displayColumns = activeTab === 'notices' ? noticeColumns : columns

  return (
    <div>
      <AdminListPageHeader
        title="Notification Center"
        count={displayData.length}
        description="Unread alerts, read history, and downloadable official notices"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <nav className="mx-auto mb-6 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-border/60 bg-muted/20 p-1.5 shadow-sm backdrop-blur-sm">
        {notificationTabs.map((tab) => {
          const isActive = activeTab === tab.value
          const Icon = tab.icon
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="notifications-sub-nav"
                  className="absolute inset-0 rounded-xl bg-card shadow-sm ring-1 ring-border/60"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              {Icon && (
                <Icon className="relative size-4 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              )}
              <span className="relative">
                {tab.value === 'unread' && unreadCount > 0
                  ? `${tab.label} (${unreadCount})`
                  : tab.label}
              </span>
            </button>
          )
        })}
      </nav>

      {!displayData.length ? (
        <EmptyState
          icon={activeTab === 'notices' ? <FileText className="size-7 text-muted-foreground" /> : <Bell className="size-7 text-muted-foreground" />}
          title={activeTab === 'notices' ? 'No official notices' : 'No notifications'}
          description={activeTab === 'unread' ? "You're all caught up!" : 'Nothing to show in this tab'}
        />
      ) : activeTab === 'notices' ? (
        <DataListView
          columns={noticeColumns}
          data={filteredNotices}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(notice, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={NOTICE_TYPE_LABELS[notice.noticeType]}
              subtitle={`${notice.id} · ${format(new Date(notice.generatedAt), 'dd MMM yyyy')}`}
              badges={<NoticeStatusBadge status={notice.status} />}
              fields={[{ label: 'PPO', value: notice.ppoNumber }]}
              action={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => setPreviewNotice(notice)}>
                    View Notice
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPreviewNotice(notice)}>
                    <Download className="size-3.5" />
                  </Button>
                </div>
              }
            />
          )}
        />
      ) : (
        <DataListView
          columns={displayColumns as ColumnDef<PensionerNotification>[]}
          data={filteredNotifications}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(notif, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={notif.title}
              subtitle={format(new Date(notif.timestamp), 'dd MMM yyyy, hh:mm a')}
              badges={
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {typeLabels[notif.type] ?? notif.type}
                </span>
              }
              fields={[{ label: 'Message', value: notif.message }]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" onClick={() => handleOpen(notif)}>
                  {notif.read ? 'View' : 'View unread'}
                </Button>
              }
              className={cn(!notif.read && 'border-primary/20 bg-primary/[0.03]')}
            />
          )}
        />
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{selected?.message}</p>
          {selected?.details && (
            <div className="mt-2">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {selected.title.toLowerCase().includes('rejected') ? 'Reason for rejection' : 'Details'}
              </p>
              <p className="rounded-xl bg-muted/50 p-3 text-sm">{selected.details}</p>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="rounded-xl" onClick={() => setSelected(null)}>
              Close
            </Button>
            {selected?.actionHref && selected.actionLabel && (
              <Button className="rounded-xl" asChild onClick={() => setSelected(null)}>
                <Link
                  to={
                    selected.actionHref?.includes('start') ||
                    selected.actionHref?.includes('resubmit')
                      ? '/pensioner/verification/start'
                      : '/pensioner/verification'
                  }
                  search={
                    selected.actionHref?.includes('resubmit') ? { mode: 'resubmit' as const } : {}
                  }
                >
                  {selected.actionLabel}
                </Link>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <NoticePdfPreviewDialog
        notice={previewNotice}
        open={!!previewNotice}
        onOpenChange={(open) => !open && setPreviewNotice(null)}
        onDownload={() => previewNotice && downloadNoticeApi(previewNotice.id, user?.name ?? 'Pensioner')}
      />
    </div>
  )
}
