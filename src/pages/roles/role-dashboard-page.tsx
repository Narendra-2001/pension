import { Link } from '@tanstack/react-router'
import { ArrowLeft, LogOut } from 'lucide-react'

import { PageHeader } from '@/components/admin/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { roleLabel } from '@/lib/auth'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/types/auth'

interface RoleDashboardPageProps {
  role: UserRole
  title: string
  description: string
}

export function RoleDashboardPage({ role, title, description }: RoleDashboardPageProps) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={logout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
        <PageHeader
          title={title}
          description={description}
        />

        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-icy-blue-500">
              {roleLabel(role)} Workspace
            </p>
            <h2 className="mt-2 text-xl font-semibold">{title}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Demo workspace for the {roleLabel(role).toLowerCase()} role. Pension Admin portal is fully
              available — sign in as <strong>pensionadmin</strong> from the login page.
            </p>
            <Button className="mt-6 rounded-xl bg-icy-blue-500 hover:bg-icy-blue-600" asChild>
              <Link to="/login">Switch Role</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
