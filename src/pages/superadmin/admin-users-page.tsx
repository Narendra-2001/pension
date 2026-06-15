import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  fetchDepartments,
  updateAdminUser,
} from '@/data/superadmin-api'
import { useListViewMode } from '@/hooks/use-list-view-mode'
import { roleLabel } from '@/lib/auth'
import type { UserRole } from '@/types/auth'
import type { AdminUserRecord, AdminUserStatus } from '@/types/superadmin'
import { cn } from '@/lib/utils'

const OFFICER_ROLES: Exclude<UserRole, 'pensioner'>[] = [
  'super_admin',
  'pension_admin',
  'accounts',
  'recovery',
  'audit',
  'helpdesk',
]

const adminUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  mobile: z.string().min(10, 'Valid mobile number required'),
  role: z.enum(['super_admin', 'pension_admin', 'accounts', 'recovery', 'audit', 'helpdesk']),
  departmentId: z.string().min(1, 'Department is required'),
  status: z.enum(['active', 'inactive', 'locked']),
})

type AdminUserFormData = z.infer<typeof adminUserSchema>

function StatusBadge({ status }: { status: AdminUserStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase',
        status === 'active' && 'bg-emerald-500/10 text-emerald-700',
        status === 'inactive' && 'bg-muted text-muted-foreground',
        status === 'locked' && 'bg-rose-500/10 text-rose-700',
      )}
    >
      {status}
    </span>
  )
}

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useListViewMode()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUserRecord | null>(null)

  const filters = useMemo(
    () => ({ search, role: roleFilter, departmentId: departmentFilter, status: statusFilter }),
    [search, roleFilter, departmentFilter, statusFilter],
  )

  const { data: users, isLoading } = useQuery({
    queryKey: ['superadmin-admin-users', filters],
    queryFn: () => fetchAdminUsers(filters),
  })

  const { data: departments } = useQuery({
    queryKey: ['superadmin-departments'],
    queryFn: () => fetchDepartments(),
  })

  const departmentMap = useMemo(
    () => new Map(departments?.map((d) => [d.id, d.name]) ?? []),
    [departments],
  )

  const form = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      mobile: '',
      role: 'pension_admin',
      departmentId: '',
      status: 'active',
    },
  })

  const saveMutation = useMutation({
    mutationFn: (values: AdminUserFormData) =>
      editing ? updateAdminUser(editing.id, values) : createAdminUser(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-admin-users'] })
      setDialogOpen(false)
      setEditing(null)
      form.reset()
      toast.success(editing ? 'Admin user updated' : 'Admin user created')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-admin-users'] })
      toast.success('Admin user removed')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      username: '',
      name: '',
      email: '',
      mobile: '',
      role: 'pension_admin',
      departmentId: departments?.[0]?.id ?? '',
      status: 'active',
    })
    setDialogOpen(true)
  }

  const openEdit = (user: AdminUserRecord) => {
    setEditing(user)
    form.reset({
      username: user.username,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      departmentId: user.departmentId,
      status: user.status,
    })
    setDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<AdminUserRecord>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.username}</span>,
      },
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => roleLabel(row.original.role),
      },
      {
        accessorKey: 'departmentId',
        header: 'Department',
        cell: ({ row }) => departmentMap.get(row.original.departmentId) ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) =>
          row.original.lastLogin
            ? format(new Date(row.original.lastLogin), 'dd MMM yyyy, HH:mm')
            : '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => openEdit(row.original)}>
              <Edit className="mr-1 size-3.5" /> Edit
            </Button>
            {row.original.role !== 'super_admin' && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-destructive hover:text-destructive"
                onClick={() => deleteMutation.mutate(row.original.id)}
              >
                <Trash2 className="mr-1 size-3.5" /> Remove
              </Button>
            )}
          </div>
        ),
      },
    ],
    [departmentMap, deleteMutation],
  )

  const activeFilterCount =
    (roleFilter !== 'all' ? 1 : 0) +
    (departmentFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0)

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title="Admin Users"
        count={users?.length ?? 0}
        description="Create and manage pension admin and officer accounts"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <Button className="h-10 rounded-lg px-4 shadow-sm" onClick={openCreate}>
            <Plus className="size-4" />
            Add Admin User
          </Button>
        }
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter admin users"
            onClear={() => {
              setRoleFilter('all')
              setDepartmentFilter('all')
              setStatusFilter('all')
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="admin-role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="admin-role-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All roles</SelectItem>
                  {OFFICER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-dept-filter">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger id="admin-dept-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All departments</SelectItem>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="admin-status-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      {users?.length === 0 ? (
        <EmptyState title="No admin users found" description="Try adjusting your search or filters" />
      ) : (
        <DataListView
          columns={columns}
          data={users ?? []}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(user, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={user.name}
              subtitle={user.username}
              badges={<StatusBadge status={user.status} />}
              fields={[
                { label: 'Role', value: roleLabel(user.role) },
                { label: 'Department', value: departmentMap.get(user.departmentId) ?? '—' },
                { label: 'Email', value: user.email },
                {
                  label: 'Last Login',
                  value: user.lastLogin
                    ? format(new Date(user.lastLogin), 'dd MMM yyyy')
                    : 'Never',
                },
              ]}
              action={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(user)}>
                    <Edit className="mr-1 size-3.5" /> Edit
                  </Button>
                  {user.role !== 'super_admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-destructive"
                      onClick={() => deleteMutation.mutate(user.id)}
                    >
                      <Trash2 className="mr-1 size-3.5" /> Remove
                    </Button>
                  )}
                </div>
              }
            />
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Admin User' : 'Add Admin User'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={editing?.role === 'super_admin'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={editing?.role === 'super_admin'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OFFICER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {roleLabel(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="locked">Locked</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {editing ? 'Save Changes' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
