import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Check, Edit, KeyRound, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchRoles, updateRolePermissions } from '@/data/superadmin-api'
import { useListViewMode } from '@/hooks/use-list-view-mode'
import type { RoleDefinition } from '@/types/superadmin'
import { cn } from '@/lib/utils'

const ALL_PERMISSIONS = [
  'Manage all users',
  'Configure departments',
  'System settings',
  'View all reports',
  'Manage roles',
  'Override workflows',
  'Security policies',
  'Audit log access',
  'Manage pensioners',
  'Approve activations',
  'Review life certificates',
  'Manage suspensions',
  'Profile update review',
  'Pension reports',
  'Bulk import',
  'Process payments',
  'Reconcile accounts',
  'Create recovery cases',
  'Approve installments',
  'Financial reports',
  'Disbursement notices',
  'Track installments',
  'Send recovery notices',
  'Update case status',
  'Recovery reports',
  'Document management',
  'View audit logs',
  'Compliance reports',
  'Approve recoveries',
  'Flag anomalies',
  'Export audit data',
  'Module trail access',
  'View pensioner profiles',
  'Create support tickets',
  'Assist with documents',
  'Escalate issues',
  'FAQ management',
  'Grievance handling',
]

export function RolesPermissionsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()
  const [editing, setEditing] = useState<RoleDefinition | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const { data: roles, isLoading } = useQuery({
    queryKey: ['superadmin-roles'],
    queryFn: fetchRoles,
  })

  const saveMutation = useMutation({
    mutationFn: () => updateRolePermissions(editing!.id, selectedPermissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-roles'] })
      setEditing(null)
      toast.success('Role permissions updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const filteredRoles = useMemo(() => {
    if (!roles) return []
    const q = search.trim().toLowerCase()
    if (!q) return roles
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.permissions.some((p) => p.toLowerCase().includes(q)),
    )
  }, [roles, search])

  const openEdit = (role: RoleDefinition) => {
    setEditing(role)
    setSelectedPermissions([...role.permissions])
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  const columns = useMemo<ColumnDef<RoleDefinition>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Role',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            <span className="font-medium">{row.original.name}</span>
            {row.original.isSystemRole && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                System
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.description}</span>
        ),
      },
      {
        id: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.permissions.length} permissions</span>
        ),
      },
      {
        accessorKey: 'userCount',
        header: 'Users',
        cell: ({ row }) => row.original.userCount,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => openEdit(row.original)}
            disabled={row.original.id === 'super_admin'}
          >
            <Edit className="mr-1 size-3.5" /> Edit Permissions
          </Button>
        ),
      },
    ],
    [],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title="Roles & Permissions"
        count={filteredRoles.length}
        description="Define RBAC policies for all user roles"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <Card className="border-primary/10 bg-primary/[0.02]">
        <CardContent className="flex items-start gap-3 py-4">
          <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm text-muted-foreground">
            System roles are pre-defined templates. Super Admin permissions are locked. Editing a
            role updates the permission set for all users assigned to that role.
          </div>
        </CardContent>
      </Card>

      <DataListView
        columns={columns}
        data={filteredRoles}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={false}
        renderCard={(role, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={role.name}
            subtitle={role.description}
            badges={
              role.isSystemRole ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                  System
                </span>
              ) : undefined
            }
            fields={[
              { label: 'Permissions', value: `${role.permissions.length} assigned` },
              { label: 'Users', value: role.userCount },
            ]}
            action={
              role.id !== 'super_admin' ? (
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(role)}>
                  <Edit className="mr-1 size-3.5" /> Edit Permissions
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Permissions locked</span>
              )
            }
          />
        )}
      />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Permissions — {editing?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_PERMISSIONS.map((permission) => {
              const checked = selectedPermissions.includes(permission)
              const isOriginal = editing?.permissions.includes(permission)
              return (
                <label
                  key={permission}
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors',
                    checked ? 'border-primary/30 bg-primary/5' : 'border-border/60 hover:bg-muted/40',
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => togglePermission(permission)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{permission}</p>
                    {isOriginal && checked && (
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600">
                        <Check className="size-3" /> Currently assigned
                      </p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || selectedPermissions.length === 0}
            >
              Save Permissions ({selectedPermissions.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
