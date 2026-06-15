import { PageHeader } from '@/components/admin/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'

interface SuperAdminPlaceholderPageProps {
  title: string
  description: string
}

export function SuperAdminPlaceholderPage({ title, description }: SuperAdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Super Admin module — configure {title.toLowerCase()} across the entire platform.
        </CardContent>
      </Card>
    </div>
  )
}
