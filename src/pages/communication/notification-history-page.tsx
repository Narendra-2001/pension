import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { ChannelBadge } from '@/components/communication/channel-badge'
import { DeliveryStatusBadge } from '@/components/communication/delivery-status-badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchNotifications } from '@/data/communication-api'
import { NOTIFICATION_EVENT_LABELS } from '@/lib/communication'
import { matchesListSearch } from '@/lib/list-search'
import type { DeliveryStatus, NotificationChannel, SystemNotification } from '@/types/communication'
import { cn } from '@/lib/utils'

export function NotificationHistoryPage() {
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<'all' | NotificationChannel>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: fetchNotifications,
  })

  const filtered = useMemo(() => {
    if (!notifications) return []
    return notifications.filter((n) => {
      if (channelFilter !== 'all' && n.channel !== channelFilter) return false
      if (statusFilter !== 'all' && n.status !== statusFilter) return false
      return matchesListSearch(search, [
        n.id,
        n.ppoNumber,
        n.pensionerName,
        NOTIFICATION_EVENT_LABELS[n.eventType],
        n.title,
      ])
    })
  }, [notifications, search, channelFilter, statusFilter])

  const columns = useMemo<ColumnDef<SystemNotification>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Notification ID',
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
      },
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      {
        accessorKey: 'eventType',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-xs">{NOTIFICATION_EVENT_LABELS[row.original.eventType]}</span>
        ),
      },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ row }) => <ChannelBadge channel={row.original.channel} />,
      },
      {
        accessorKey: 'sentAt',
        header: 'Sent Date',
        cell: ({ row }) => format(new Date(row.original.sentAt), 'dd MMM yyyy, hh:mm a'),
      },
      {
        accessorKey: 'status',
        header: 'Delivery Status',
        cell: ({ row }) => <DeliveryStatusBadge status={row.original.status} />,
      },
      {
        id: 'read',
        header: 'Read Status',
        cell: ({ row }) => (
          <span className={cn('text-xs', row.original.read ? 'text-muted-foreground' : 'font-medium text-foreground')}>
            {row.original.read ? 'Read' : 'Unread'}
          </span>
        ),
      },
    ],
    [],
  )

  const activeFilterCount = (channelFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Notification History"
        description="Track SMS, email, and in-app notification delivery and read status"
      />

      <AdminListPageHeader
        title="All Notifications"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search notifications..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter notifications"
            onClear={() => {
              setChannelFilter('all')
              setStatusFilter('all')
            }}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as typeof channelFilter)}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ListFiltersPopover>
        }
      />

      {!filtered.length ? (
        <EmptyState icon={<Bell className="size-7 text-muted-foreground" />} title="No notifications" description="Notifications will appear when business events are triggered" />
      ) : (
        <DataListView
          columns={columns}
          data={filtered}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(notif, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={notif.title}
              subtitle={`${notif.ppoNumber} · ${format(new Date(notif.sentAt), 'dd MMM yyyy')}`}
              badges={
                <>
                  <ChannelBadge channel={notif.channel} />
                  <DeliveryStatusBadge status={notif.status} />
                </>
              }
              fields={[
                { label: 'Event', value: NOTIFICATION_EVENT_LABELS[notif.eventType] },
                { label: 'Message', value: notif.message },
              ]}
            />
          )}
        />
      )}
    </motion.div>
  )
}
