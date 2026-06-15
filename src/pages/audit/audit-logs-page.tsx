import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Eye, Filter, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { DataListView } from '@/components/admin/shared/data-list-view'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { AuditLogDetailDialog } from '@/components/audit/audit-log-detail-dialog'
import { AuditModuleBadge } from '@/components/audit/audit-module-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchSystemAuditLogs } from '@/data/audit-api'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_MODULE_LABELS,
  formatAuditChange,
} from '@/lib/audit'
import { AUDIT_ACTION_ICONS, getAuditActionToneClasses } from '@/lib/audit-ui'
import type { AuditAction, AuditModule, SystemAuditEntry } from '@/types/audit'
import { cn } from '@/lib/utils'

export function AuditLogsPage() {
  const [moduleFilter, setModuleFilter] = useState<AuditModule | 'all'>('all')
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<SystemAuditEntry | null>(null)

  const { data: logs, isLoading } = useQuery({
    queryKey: ['system-audit-logs', moduleFilter, actionFilter, search],
    queryFn: () =>
      fetchSystemAuditLogs({
        module: moduleFilter,
        action: actionFilter,
        search: search || undefined,
      }),
  })

  const activeFilterCount =
    (moduleFilter !== 'all' ? 1 : 0) + (actionFilter !== 'all' ? 1 : 0) + (search ? 1 : 0)

  const clearFilters = () => {
    setModuleFilter('all')
    setActionFilter('all')
    setSearch('')
  }

  const columns = useMemo<ColumnDef<SystemAuditEntry>[]>(
    () => [
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs tabular-nums">
            {format(new Date(row.original.timestamp), 'dd MMM yyyy, hh:mm a')}
          </span>
        ),
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => <AuditModuleBadge module={row.original.module} />,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => {
          const ActionIcon = AUDIT_ACTION_ICONS[row.original.action]
          return (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-md',
                  getAuditActionToneClasses(row.original.action),
                )}
              >
                <ActionIcon className="size-3" />
              </span>
              {AUDIT_ACTION_LABELS[row.original.action]}
            </span>
          )
        },
      },
      {
        accessorKey: 'entityLabel',
        header: 'Entity',
        cell: ({ row }) => (
          <div className="min-w-[10rem]">
            <p className="truncate text-sm font-medium">
              {row.original.entityLabel ?? row.original.entityType}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">{row.original.entityId}</p>
          </div>
        ),
      },
      {
        id: 'change',
        header: 'Old → New Value',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatAuditChange(row.original.oldValue, row.original.newValue)}
          </span>
        ),
      },
      {
        accessorKey: 'user',
        header: 'User',
        cell: ({ row }) => (
          <div>
            <p className="text-sm">{row.original.user}</p>
            <p className="text-[10px] text-muted-foreground">{row.original.userRole}</p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={() => setSelectedEntry(row.original)}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [],
  )

  const handleExport = () => {
    if (!logs?.length) {
      toast.error('No audit logs to export')
      return
    }
    const header = 'ID,Timestamp,Module,Action,Entity,Entity ID,Old Value,New Value,User,Role,Department,Remarks\n'
    const rows = logs
      .map((e) =>
        [
          e.id,
          e.timestamp,
          e.module,
          e.action,
          e.entityLabel ?? e.entityType,
          e.entityId,
          e.oldValue ?? '',
          e.newValue ?? '',
          e.user,
          e.userRole,
          e.department ?? '',
          e.remarks ?? '',
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit logs exported')
  }

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="System Audit Logs"
        description="Immutable audit trail — every user action with old/new values, actor details, and timestamps"
        meta={
          logs && (
            <Badge variant="secondary" className="font-normal">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </Badge>
          )
        }
        action={
          <Button variant="outline" className="rounded-lg" onClick={handleExport}>
            <Download className="mr-1.5 size-4" /> Export CSV
          </Button>
        }
      />

      <Card className="admin-card mb-4">
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entity, remarks, values..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg pl-9"
              />
            </div>
            <Select value={moduleFilter} onValueChange={(v) => setModuleFilter(v as AuditModule | 'all')}>
              <SelectTrigger className="w-full rounded-lg sm:w-44">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {Object.entries(AUDIT_MODULE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as AuditAction | 'all')}>
              <SelectTrigger className="w-full rounded-lg sm:w-44">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" className="shrink-0 rounded-lg" onClick={clearFilters}>
                <X className="mr-1 size-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <DataListView
        columns={columns}
        data={logs ?? []}
        pageSize={15}
        renderCard={(entry) => {
          const ActionIcon = AUDIT_ACTION_ICONS[entry.action]
          return (
            <Card
              key={entry.id}
              className="cursor-pointer rounded-xl border-border/70 transition-all hover:border-border hover:shadow-sm"
              onClick={() => setSelectedEntry(entry)}
            >
              <CardContent className="flex gap-3 p-4">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    getAuditActionToneClasses(entry.action),
                  )}
                >
                  <ActionIcon className="size-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{AUDIT_ACTION_LABELS[entry.action]}</span>
                    <AuditModuleBadge module={entry.module} />
                  </div>
                  <p className="text-sm">{entry.entityLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAuditChange(entry.oldValue, entry.newValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.user} · {format(new Date(entry.timestamp), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        }}
      />

      <AuditLogDetailDialog
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </motion.div>
  )
}
