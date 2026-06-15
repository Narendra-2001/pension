import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { GrievancePriorityBadge } from '@/components/grievance/grievance-priority-badge'
import { GrievanceStatusBadge } from '@/components/grievance/grievance-status-badge'
import { TaskTypeBadge } from '@/components/admin/tasks/task-type-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchGrievanceTicket } from '@/data/grievance-api'
import { formatGrievanceDateTime, GRIEVANCE_CATEGORY_LABELS } from '@/lib/grievance'

interface GrievanceTaskPageProps {
  ticketId: string
}

export function GrievanceTaskPage({ ticketId }: GrievanceTaskPageProps) {
  const navigate = useNavigate()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['grievance-ticket', ticketId],
    queryFn: () => fetchGrievanceTicket(ticketId),
  })

  if (isLoading || !ticket) return <PageLoadingSkeleton />

  return (
    <div>
      <PageHeader
        variant="admin"
        title={ticket.id}
        description={ticket.subject}
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/admin/tasks" search={{ type: 'grievance' }}>
                <ArrowLeft className="mr-1.5 size-4" /> Back to Work Queue
              </Link>
            </Button>
            <Button className="rounded-full" onClick={() => navigate({ href: `/admin/grievance/tickets/${ticketId}` })}>
              <ExternalLink className="mr-1.5 size-4" /> Open in Helpdesk
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-2">
        <TaskTypeBadge type="grievance" />
        <GrievanceStatusBadge status={ticket.status} />
        <GrievancePriorityBadge priority={ticket.priority} />
      </div>

      <Card className="admin-card">
        <CardHeader><CardTitle className="text-base">Grievance Details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><p className="text-muted-foreground">Pensioner</p><p className="font-medium">{ticket.pensionerName}</p></div>
            <div><p className="text-muted-foreground">PPO Number</p><p className="font-mono">{ticket.ppoNumber}</p></div>
            <div><p className="text-muted-foreground">Category</p><p className="font-medium">{GRIEVANCE_CATEGORY_LABELS[ticket.category]}</p></div>
            <div><p className="text-muted-foreground">Created</p><p>{formatGrievanceDateTime(ticket.createdAt)}</p></div>
          </div>
          <div><p className="text-muted-foreground">Description</p><p>{ticket.description}</p></div>
          {ticket.resolution && (
            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
              <p className="font-medium text-emerald-800 dark:text-emerald-200">Resolution</p>
              <p className="mt-1 text-emerald-700 dark:text-emerald-300">{ticket.resolution.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
