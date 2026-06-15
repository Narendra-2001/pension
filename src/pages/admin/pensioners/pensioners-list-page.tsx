import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Download, Plus, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { PensionerTable } from '@/components/admin/pensioners/pensioner-table'
import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { EmptyState, TableSkeleton } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { exportPensionersCsv, fetchPensioners, removePensioner } from '@/data/admin-api'

export function PensionersListPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [verificationStatus, setVerificationStatus] = useState('all')
  const [pensionType, setPensionType] = useState('all')
  const [viewMode, setViewMode] = useListViewMode()

  const filters = useMemo(
    () => ({ search, status, verificationStatus, pensionType }),
    [search, status, verificationStatus, pensionType],
  )

  const { data, isLoading } = useQuery({
    queryKey: ['pensioners', filters],
    queryFn: () => fetchPensioners(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: removePensioner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pensioners'] })
      toast.success('Pensioner deleted successfully')
    },
    onError: () => toast.error('Failed to delete pensioner'),
  })

  const handleExport = () => {
    if (!data?.length) {
      toast.error('No data to export')
      return
    }
    const csv = exportPensionersCsv(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pensioners_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded')
  }

  const activeFilterCount =
    (status !== 'all' ? 1 : 0) +
    (verificationStatus !== 'all' ? 1 : 0) +
    (pensionType !== 'all' ? 1 : 0)

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title="All Pensioners"
        count={data?.length ?? 0}
        description="Manage and monitor all registered pensioners"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <>
            <Button variant="outline" className="h-10 rounded-lg px-4 shadow-sm" onClick={handleExport}>
              <Download className="size-4" />
              Export
            </Button>
            <Button variant="outline" className="h-10 rounded-lg px-4 shadow-sm" asChild>
              <Link to="/admin/pensioners/bulk-import">
                <Upload className="size-4" />
                Import
              </Link>
            </Button>
            <Button className="h-10 rounded-lg px-4 shadow-sm" asChild>
              <Link to="/admin/pensioners/add">
                <Plus className="size-4" />
                Add Pensioner
              </Link>
            </Button>
          </>
        }
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter pensioners"
            onClear={() => {
              setStatus('all')
              setVerificationStatus('all')
              setPensionType('all')
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="pensioner-status-filter">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="pensioner-status-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_activation">Pending Activation</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pensioner-verification-filter">Verification</Label>
              <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                <SelectTrigger id="pensioner-verification-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pensioner-type-filter">Pension Type</Label>
              <Select value={pensionType} onValueChange={setPensionType}>
                <SelectTrigger id="pensioner-type-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Pension Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="superannuation">Superannuation</SelectItem>
                  <SelectItem value="family_pension">Family Pension</SelectItem>
                  <SelectItem value="voluntary_retirement">Voluntary Retirement</SelectItem>
                  <SelectItem value="compassionate">Compassionate</SelectItem>
                  <SelectItem value="disability">Disability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : data?.length ? (
        <PensionerTable
          data={data}
          onDelete={(id) => deleteMutation.mutate(id)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
        />
      ) : (
        <EmptyState
          title="No pensioners found"
          description="Try adjusting your search or filters, or add a new pensioner."
          action={
            <Button asChild>
              <Link to="/admin/pensioners/add">Add Pensioner</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
