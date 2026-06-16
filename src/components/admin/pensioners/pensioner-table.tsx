import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { PensionerAvatar } from '@/components/admin/shared/admin-detail-ui'
import { DataListView } from '@/components/admin/shared/data-list-view'
import type { ViewMode } from '@/components/admin/shared/view-mode-toggle'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { SortableHeader } from '@/components/admin/shared/data-table'
import { ActivationBadge, PensionTypeBadge, StatusBadge, VerificationBadge } from '@/components/admin/shared/status-badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PensionerListItem } from '@/types/pensioner'

interface PensionerTableProps {
  data: PensionerListItem[]
  onDelete: (id: string) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  showViewToggle?: boolean
}

export function createPensionerColumns(onDelete: (id: string) => void): ColumnDef<PensionerListItem>[] {
  return [
    {
      accessorKey: 'ppoNumber',
      header: ({ column }) => <SortableHeader column={column}>PPO Number</SortableHeader>,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('ppoNumber')}</span>,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Pensioner Name</SortableHeader>,
      cell: ({ row }) => {
        const pensioner = row.original
        return (
          <span className="flex items-center gap-2">
            <PensionerAvatar
              name={pensioner.name}
              ppo={pensioner.ppoNumber}
              gender={pensioner.gender}
              className="size-6 ring-1 ring-border/60"
            />
            <span className="font-medium">{pensioner.name}</span>
          </span>
        )
      },
    },
    {
      accessorKey: 'mobileNumber',
      header: 'Mobile Number',
    },
    {
      accessorKey: 'pensionType',
      header: 'Pension Type',
      cell: ({ row }) => <PensionTypeBadge type={row.getValue('pensionType')} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Verification',
      cell: ({ row }) => <VerificationBadge status={row.getValue('verificationStatus')} />,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableHeader column={column}>Created Date</SortableHeader>,
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString('en-IN'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const pensioner = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/admin/pensioners/$id" params={{ id: pensioner.ppoNumber }}>
                  <Eye className="size-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/pensioners/$id/edit" params={{ id: pensioner.ppoNumber }}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Pensioner</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {pensioner.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => onDelete(pensioner.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

function PensionerActionsMenu({
  pensioner,
  onDelete,
  compact = false,
}: {
  pensioner: PensionerListItem
  onDelete: (id: string) => void
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link to="/admin/pensioners/$id" params={{ id: pensioner.ppoNumber }}>
            <Eye className="mr-1 size-3.5" /> View
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link to="/admin/pensioners/$id/edit" params={{ id: pensioner.ppoNumber }}>
            <Pencil className="mr-1 size-3.5" /> Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="rounded-full">
              <Trash2 className="mr-1 size-3.5" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pensioner</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {pensioner.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(pensioner.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/admin/pensioners/$id" params={{ id: pensioner.ppoNumber }}>
            <Eye className="size-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/admin/pensioners/$id/edit" params={{ id: pensioner.ppoNumber }}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Pensioner</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {pensioner.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(pensioner.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PensionerTable({
  data,
  onDelete,
  viewMode,
  onViewModeChange,
  showViewToggle = true,
}: PensionerTableProps) {
  const columns = createPensionerColumns(onDelete)

  return (
    <DataListView
      columns={columns}
      data={data}
      pageSize={10}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      showViewToggle={showViewToggle}
      renderCard={(pensioner, serialNo) => (
        <ListRecordCard
          serialNo={serialNo}
          title={
            <span className="flex items-center gap-2">
              <PensionerAvatar
                name={pensioner.name}
                ppo={pensioner.ppoNumber}
                gender={pensioner.gender}
                className="size-8 ring-1 ring-border/60"
              />
              <span>{pensioner.name}</span>
            </span>
          }
          subtitle={pensioner.ppoNumber}
          badges={
            <>
              <StatusBadge status={pensioner.status} />
              <VerificationBadge status={pensioner.verificationStatus} />
            </>
          }
          fields={[
            { label: 'Mobile', value: pensioner.mobileNumber },
            { label: 'Pension Type', value: <PensionTypeBadge type={pensioner.pensionType} /> },
            {
              label: 'Created',
              value: new Date(pensioner.createdAt).toLocaleDateString('en-IN'),
            },
          ]}
          action={<PensionerActionsMenu pensioner={pensioner} onDelete={onDelete} compact />}
        />
      )}
    />
  )
}

export function PendingActivationTable({
  data,
  onResendSms,
  onResendEmail,
  onActivate,
  viewMode,
  onViewModeChange,
  showViewToggle = true,
}: {
  data: PensionerListItem[]
  onResendSms: (id: string) => void
  onResendEmail: (id: string) => void
  onActivate: (id: string) => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  showViewToggle?: boolean
}) {
  const columns: ColumnDef<PensionerListItem>[] = [
    {
      accessorKey: 'ppoNumber',
      header: 'PPO Number',
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('ppoNumber')}</span>,
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'mobileNumber', header: 'Mobile' },
    { accessorKey: 'emailAddress', header: 'Email' },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString('en-IN'),
    },
    {
      accessorKey: 'activationStatus',
      header: 'Activation Status',
      cell: ({ row }) => <ActivationBadge status={row.getValue('activationStatus')} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="flex flex-wrap gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onResendSms(p.id)}>
              Resend SMS
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onResendEmail(p.id)}>
              Resend Email
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={() => onActivate(p.id)}>
              Activate
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link to="/admin/pensioners/$id" params={{ id: p.ppoNumber }}>
                View
              </Link>
            </Button>
          </div>
        )
      },
    },
  ]

  const activationActions = (p: PensionerListItem) => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="rounded-full" onClick={() => onResendSms(p.id)}>
        Resend SMS
      </Button>
      <Button variant="outline" size="sm" className="rounded-full" onClick={() => onResendEmail(p.id)}>
        Resend Email
      </Button>
      <Button size="sm" className="rounded-full" onClick={() => onActivate(p.id)}>
        Activate
      </Button>
      <Button variant="ghost" size="sm" className="rounded-full" asChild>
        <Link to="/admin/pensioners/$id" params={{ id: p.ppoNumber }}>
          View
        </Link>
      </Button>
    </div>
  )

  return (
    <DataListView
      columns={columns}
      data={data}
      pageSize={10}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      showViewToggle={showViewToggle}
      renderCard={(pensioner, serialNo) => (
        <ListRecordCard
          serialNo={serialNo}
          title={pensioner.name}
          subtitle={pensioner.ppoNumber}
          badges={<ActivationBadge status={pensioner.activationStatus} />}
          fields={[
            { label: 'Mobile', value: pensioner.mobileNumber },
            { label: 'Email', value: pensioner.emailAddress ?? '—' },
            {
              label: 'Created',
              value: new Date(pensioner.createdAt).toLocaleDateString('en-IN'),
            },
          ]}
          action={activationActions(pensioner)}
        />
      )}
    />
  )
}
