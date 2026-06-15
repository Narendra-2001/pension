import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useDemisePortal } from '@/components/demise/demise-portal-context'
import { Button } from '@/components/ui/button'
import { fetchDeceasedProfiles } from '@/data/demise-api'
import { formatDemiseCurrency } from '@/lib/demise'
import { matchesListSearch } from '@/lib/list-search'
import type { DeceasedPensionerProfile } from '@/types/demise'

export function DeceasedPensionersPage() {
  const navigate = useNavigate()
  const { basePath } = useDemisePortal()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['deceased-profiles'],
    queryFn: fetchDeceasedProfiles,
  })

  const filtered = useMemo(() => {
    if (!profiles) return []
    return profiles.filter((p) =>
      matchesListSearch(search, [
        p.id,
        p.ppoNumber,
        p.pensionerName,
        p.department,
        p.recoveryStatus,
        p.familyPensionStatus,
      ]),
    )
  }, [profiles, search])

  const columns = useMemo<ColumnDef<DeceasedPensionerProfile>[]>(
    () => [
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'pensionerName', header: 'Pensioner Name' },
      { accessorKey: 'dateOfDeath', header: 'Date of Death' },
      { accessorKey: 'demiseApprovalDate', header: 'Approval Date' },
      {
        accessorKey: 'excessPensionAmount',
        header: 'Excess Pension',
        cell: ({ row }) => formatDemiseCurrency(row.original.excessPensionAmount),
      },
      { accessorKey: 'recoveryStatus', header: 'Recovery Status' },
      { accessorKey: 'familyPensionStatus', header: 'Family Pension' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => navigate({ href: `${basePath}/deceased/${row.original.id}` })}
          >
            <Eye className="mr-1 size-3.5" /> View
          </Button>
        ),
      },
    ],
    [basePath, navigate],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Deceased Pensioners"
        description="Read-only profiles of pensioners with approved demise — excess pension, recovery, and family pension status"
      />

      <AdminListPageHeader
        title="Deceased Profiles"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by PPO, name..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        className="mb-4"
      />

      <DataListView
        columns={columns}
        data={filtered}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={false}
        renderCard={(profile, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={profile.pensionerName}
            subtitle={profile.ppoNumber}
            fields={[
              { label: 'Date of Death', value: profile.dateOfDeath },
              { label: 'Excess Pension', value: formatDemiseCurrency(profile.excessPensionAmount) },
              { label: 'Recovery', value: profile.recoveryStatus },
              { label: 'Family Pension', value: profile.familyPensionStatus },
            ]}
            action={
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => navigate({ href: `${basePath}/deceased/${profile.id}` })}
              >
                View Profile
              </Button>
            }
          />
        )}
      />
    </motion.div>
  )
}
