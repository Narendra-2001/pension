import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { PendingActivationTable } from '@/components/admin/pensioners/pensioner-table'
import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { EmptyState, TableSkeleton } from '@/components/admin/shared/empty-state'
import { matchesListSearch } from '@/lib/list-search'
import {
  activateManually,
  fetchPendingActivations,
  resendActivationEmail,
  resendActivationSms,
} from '@/data/admin-api'

export function PendingActivationsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()

  const { data, isLoading } = useQuery({
    queryKey: ['pending-activations'],
    queryFn: fetchPendingActivations,
  })

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((pensioner) =>
      matchesListSearch(search, [
        pensioner.name,
        pensioner.ppoNumber,
        pensioner.mobileNumber,
        pensioner.emailAddress,
      ]),
    )
  }, [data, search])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pending-activations'] })

  const smsMutation = useMutation({
    mutationFn: resendActivationSms,
    onSuccess: () => {
      invalidate()
      toast.success('Activation SMS sent successfully')
    },
  })

  const emailMutation = useMutation({
    mutationFn: resendActivationEmail,
    onSuccess: () => {
      invalidate()
      toast.success('Activation email sent successfully')
    },
  })

  const activateMutation = useMutation({
    mutationFn: activateManually,
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['pensioners'] })
      toast.success('Pensioner activated manually')
    },
  })

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title="Pending Activations"
        count={filteredData.length}
        description="Pensioners who have not yet activated their accounts"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filteredData.length ? (
        <PendingActivationTable
          data={filteredData}
          onResendSms={(id) => smsMutation.mutate(id)}
          onResendEmail={(id) => emailMutation.mutate(id)}
          onActivate={(id) => activateMutation.mutate(id)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
        />
      ) : (
        <EmptyState
          icon={<UserCheck className="size-7 text-muted-foreground" />}
          title="No pending activations"
          description="All pensioner accounts have been activated."
        />
      )}
    </div>
  )
}
