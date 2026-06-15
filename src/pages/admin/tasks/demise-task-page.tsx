import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DemisePageWrapper } from '@/components/demise/demise-page-wrapper'
import { Button } from '@/components/ui/button'
import { fetchDemiseIntimation } from '@/data/demise-api'
import { DemiseDetailPage } from '@/pages/demise/demise-detail-page'

interface DemiseTaskPageProps {
  reportId: string
}

export function DemiseTaskPage({ reportId }: DemiseTaskPageProps) {
  const navigate = useNavigate()

  const { data: intimation, isLoading } = useQuery({
    queryKey: ['demise-intimation', reportId],
    queryFn: () => fetchDemiseIntimation(reportId),
  })

  if (isLoading) return <PageLoadingSkeleton />

  if (!intimation) {
    return (
      <div>
        <Button variant="outline" className="mb-6 rounded-full" asChild>
          <Link to="/admin/tasks" search={{ type: 'demise' }}>
            <ArrowLeft className="mr-1.5 size-4" /> Back to Work Queue
          </Link>
        </Button>
        <EmptyState title="Report not found" description="This demise report may have been processed or removed." />
      </div>
    )
  }

  return (
    <DemisePageWrapper>
      <div className="mb-4">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate({ href: `/admin/demise/requests/${reportId}` })}
        >
          Open in Demise Module
        </Button>
      </div>
      <DemiseDetailPage intimationId={reportId} />
    </DemisePageWrapper>
  )
}
