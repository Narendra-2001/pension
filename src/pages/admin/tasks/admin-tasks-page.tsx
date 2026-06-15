import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { AlertTriangle, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { TaskStatusBadge } from '@/components/admin/tasks/task-status-badge'
import { TaskTypeBadge } from '@/components/admin/tasks/task-type-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchAdminTaskCounts, fetchAdminTasks } from '@/data/admin-tasks-api'
import type { AdminTask, AdminTaskType } from '@/types/admin-task'

type TypeFilter = AdminTaskType | 'all'

const TYPE_FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'profile_update', label: 'Profile Update' },
  { value: 'life_certificate', label: 'Life Certificate' },
  { value: 'activation', label: 'Activation' },
  { value: 'grievance', label: 'Grievance' },
  { value: 'demise', label: 'Demise' },
  { value: 'restoration', label: 'Restoration' },
]

interface AdminTasksPageProps {
  initialType?: TypeFilter
}

export function AdminTasksPage({ initialType = 'all' }: AdminTasksPageProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialType)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: counts } = useQuery({
    queryKey: ['admin-task-counts'],
    queryFn: fetchAdminTaskCounts,
    refetchOnMount: 'always',
  })

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['admin-tasks', typeFilter, statusFilter, search],
    queryFn: () =>
      fetchAdminTasks({
        type: typeFilter,
        pendingOnly: statusFilter === 'pending',
        search: search || undefined,
      }),
    refetchOnMount: 'always',
  })

  const columns = useMemo<ColumnDef<AdminTask>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Task ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">{row.original.id}</span>
        ),
      },
      { accessorKey: 'ppoNumber', header: 'PPO' },
      { accessorKey: 'pensionerName', header: 'Pensioner' },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <TaskTypeBadge type={row.original.type} />,
      },
      {
        accessorKey: 'summary',
        header: 'Summary',
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
            {row.original.summary}
          </span>
        ),
      },
      {
        accessorKey: 'statusLabel',
        header: 'Status',
        cell: ({ row }) => (
          <TaskStatusBadge label={row.original.statusLabel} isPending={row.original.isPending} />
        ),
      },
      {
        accessorKey: 'priority',
        header: 'SLA',
        cell: ({ row }) =>
          row.original.priority === 'urgent' ? (
            <Badge variant="outline" className="gap-1 border-red-500/30 bg-red-500/10 text-red-700">
              <AlertTriangle className="size-3" /> Urgent
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Normal</span>
          ),
      },
      { accessorKey: 'submittedAt', header: 'Submitted' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" className="rounded-full" asChild>
            <Link to={row.original.detailHref}>
              <Eye className="mr-1 size-3.5" /> View
            </Link>
          </Button>
        ),
      },
    ],
    [],
  )

  const getTypeCount = (type: TypeFilter) => {
    if (!counts) return 0
    if (type === 'all') return counts.total
    return counts[type]
  }

  const typeFilterOptions = useMemo(
    () =>
      TYPE_FILTER_OPTIONS.map((option) => {
        const count = getTypeCount(option.value)
        return {
          value: option.value,
          label: option.value === 'all' ? option.label : `${option.label} (${count})`,
        }
      }),
    [counts],
  )

  const activeFilterCount =
    (typeFilter !== 'all' ? 1 : 0) + (statusFilter !== 'pending' ? 1 : 0)

  const displayCount = tasks?.length ?? counts?.total ?? 0
  const description =
    typeFilter === 'life_certificate'
      ? 'Review pending life certificate submissions'
      : 'Manage and review pending administrative tasks'

  if (isLoading && !tasks) return <PageLoadingSkeleton />

  return (
    <div>
      <AdminListPageHeader
        title="Work Queue"
        count={displayCount}
        description={description}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter tasks"
            onClear={() => {
              setTypeFilter('all')
              setStatusFilter('pending')
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="task-type-filter">Task Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as TypeFilter)}
              >
                <SelectTrigger id="task-type-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Task Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {typeFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'pending' | 'all')}
              >
                <SelectTrigger id="task-status-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="pending">Pending only</SelectItem>
                  <SelectItem value="all">All statuses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      {tasks?.length ? (
        <DataListView
          columns={columns}
          data={tasks}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(task, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={task.id}
              subtitle={`${task.pensionerName} · ${task.ppoNumber}`}
              badges={
                <>
                  <TaskTypeBadge type={task.type} />
                  <TaskStatusBadge label={task.statusLabel} isPending={task.isPending} />
                  {task.priority === 'urgent' && (
                    <Badge variant="outline" className="gap-1 border-red-500/30 bg-red-500/10 text-red-700">
                      <AlertTriangle className="size-3" /> Urgent
                    </Badge>
                  )}
                </>
              }
              fields={[
                { label: 'Summary', value: task.summary },
                { label: 'Submitted', value: task.submittedAt },
              ]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                  <Link to={task.detailHref}>
                    <Eye className="mr-1 size-3.5" /> View Task
                  </Link>
                </Button>
              }
            />
          )}
        />
      ) : (
        <EmptyState
          title={statusFilter === 'pending' ? 'All caught up!' : 'No tasks found'}
          description={
            statusFilter === 'pending'
              ? 'No pending tasks require your action right now.'
              : 'Try adjusting your filters or search query.'
          }
          action={
            statusFilter === 'all' ? undefined : (
              <Button variant="outline" className="rounded-full" onClick={() => setStatusFilter('all')}>
                Show all statuses
              </Button>
            )
          }
        />
      )}
    </div>
  )
}
