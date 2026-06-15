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
import { FamilyPensionStatusBadge } from '@/components/demise/family-pension-status-badge'
import { Button } from '@/components/ui/button'
import { fetchFamilyPensionApplications } from '@/data/demise-api'
import { matchesListSearch } from '@/lib/list-search'
import type { FamilyPensionApplication } from '@/types/demise'

export function FamilyPensionListPage() {
  const navigate = useNavigate()
  const { basePath } = useDemisePortal()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['family-pension-applications'],
    queryFn: fetchFamilyPensionApplications,
  })

  const filtered = useMemo(() => {
    if (!applications) return []
    return applications.filter((app) =>
      matchesListSearch(search, [
        app.id,
        app.ppoNumber,
        app.pensionerName,
        app.nomineeName,
        app.status,
        app.demiseIntimationId,
      ]),
    )
  }, [applications, search])

  const columns = useMemo<ColumnDef<FamilyPensionApplication>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Application ID',
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
      },
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'pensionerName', header: 'Deceased Pensioner' },
      { accessorKey: 'nomineeName', header: 'Nominee' },
      { accessorKey: 'relationship', header: 'Relationship' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <FamilyPensionStatusBadge status={row.original.status} />,
      },
      { accessorKey: 'submittedAt', header: 'Submitted' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => navigate({ href: `${basePath}/family-pension/${row.original.id}` })}
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
        title="Family Pension Cases"
        description="Review and process family pension applications initiated after demise approval"
      />

      <AdminListPageHeader
        title="Applications"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applications..."
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
        renderCard={(app, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={app.id}
            subtitle={`${app.nomineeName} · ${app.ppoNumber}`}
            badges={<FamilyPensionStatusBadge status={app.status} />}
            fields={[
              { label: 'Deceased', value: app.pensionerName },
              { label: 'Relationship', value: app.relationship },
              { label: 'Submitted', value: app.submittedAt },
            ]}
            action={
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => navigate({ href: `${basePath}/family-pension/${app.id}` })}
              >
                View Details
              </Button>
            }
          />
        )}
      />
    </motion.div>
  )
}
