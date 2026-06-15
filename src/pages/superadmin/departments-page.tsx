import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Building2, Edit, Plus, Trash2 } from 'lucide-react'
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
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from '@/data/superadmin-api'
import { useListViewMode } from '@/hooks/use-list-view-mode'
import type { DepartmentRecord, DepartmentStatus } from '@/types/superadmin'
import { cn } from '@/lib/utils'

const departmentSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(6),
  name: z.string().min(2, 'Name is required'),
  headOfDepartment: z.string().min(2, 'Head of department is required'),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().min(10, 'Valid phone required'),
  status: z.enum(['active', 'inactive']),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

function StatusBadge({ status }: { status: DepartmentStatus }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase',
        status === 'active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground',
      )}
    >
      {status}
    </span>
  )
}

export function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useListViewMode()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DepartmentRecord | null>(null)

  const filters = useMemo(() => ({ search, status: statusFilter }), [search, statusFilter])

  const { data: departments, isLoading } = useQuery({
    queryKey: ['superadmin-departments', filters],
    queryFn: () => fetchDepartments(filters),
  })

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      code: '',
      name: '',
      headOfDepartment: '',
      contactEmail: '',
      contactPhone: '',
      status: 'active',
    },
  })

  const saveMutation = useMutation({
    mutationFn: (values: DepartmentFormData) =>
      editing ? updateDepartment(editing.id, values) : createDepartment(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-departments'] })
      setDialogOpen(false)
      setEditing(null)
      form.reset()
      toast.success(editing ? 'Department updated' : 'Department created')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-departments'] })
      toast.success('Department removed')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({
      code: '',
      name: '',
      headOfDepartment: '',
      contactEmail: '',
      contactPhone: '',
      status: 'active',
    })
    setDialogOpen(true)
  }

  const openEdit = (dept: DepartmentRecord) => {
    setEditing(dept)
    form.reset({
      code: dept.code,
      name: dept.name,
      headOfDepartment: dept.headOfDepartment,
      contactEmail: dept.contactEmail,
      contactPhone: dept.contactPhone,
      status: dept.status,
    })
    setDialogOpen(true)
  }

  const columns = useMemo<ColumnDef<DepartmentRecord>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">{row.original.code}</span>
        ),
      },
      { accessorKey: 'name', header: 'Department Name' },
      { accessorKey: 'headOfDepartment', header: 'Head' },
      { accessorKey: 'adminCount', header: 'Admins' },
      { accessorKey: 'pensionerCount', header: 'Pensioners' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => openEdit(row.original)}>
              <Edit className="mr-1 size-3.5" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-destructive hover:text-destructive"
              onClick={() => deleteMutation.mutate(row.original.id)}
            >
              <Trash2 className="mr-1 size-3.5" /> Remove
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation],
  )

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title="Departments"
        count={departments?.length ?? 0}
        description="Configure government departments on the platform"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search departments"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <Button className="h-10 rounded-lg px-4 shadow-sm" onClick={openCreate}>
            <Plus className="size-4" />
            Add Department
          </Button>
        }
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter departments"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="dept-status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="dept-status-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      {departments?.length === 0 ? (
        <EmptyState title="No departments found" description="Try adjusting your search or filters" />
      ) : (
        <DataListView
          columns={columns}
          data={departments ?? []}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(dept, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={dept.name}
              subtitle={dept.code}
              badges={<StatusBadge status={dept.status} />}
              fields={[
                { label: 'Head', value: dept.headOfDepartment },
                { label: 'Admins', value: dept.adminCount },
                { label: 'Pensioners', value: dept.pensionerCount },
                { label: 'Contact', value: dept.contactEmail },
              ]}
              action={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(dept)}>
                    <Edit className="mr-1 size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-destructive"
                    onClick={() => deleteMutation.mutate(dept.id)}
                  >
                    <Trash2 className="mr-1 size-3.5" /> Remove
                  </Button>
                </div>
              }
            />
          )}
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              {editing ? 'Edit Department' : 'Add Department'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. FIN" className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="headOfDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Head of Department</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {editing ? 'Save Changes' : 'Create Department'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
