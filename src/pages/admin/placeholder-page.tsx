import type { LucideIcon } from 'lucide-react'
import { Construction } from 'lucide-react'

import { PageHeader } from '@/components/admin/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: LucideIcon
}

export function PlaceholderPage({ title, description, icon: Icon = Construction }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Icon className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This module is configured in the navigation. Full functionality with mock data integration coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
