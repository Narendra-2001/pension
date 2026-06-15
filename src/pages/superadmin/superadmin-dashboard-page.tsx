import { Link } from '@tanstack/react-router'
import { Building2, ChevronRight, Crown, KeyRound, Shield, Users } from 'lucide-react'

import {
  AdminChartCard,
  AdminHeroMetric,
  AdminHorizontalMarquee,
  AdminSectionHeading,
  AdminStatChip,
} from '@/components/admin/shared/admin-analytics-ui'
import { AdminDashboardShell } from '@/components/admin/shared/admin-dashboard-shell'
import { PageHeader } from '@/components/admin/shared/page-header'
import { Button } from '@/components/ui/button'
import { sparklinePattern } from '@/lib/sparkline-data'

const quickLinks = [
  { label: 'Admin Users', href: '/superadmin/admin-users', icon: Users },
  { label: 'Departments', href: '/superadmin/departments', icon: Building2 },
  { label: 'Roles & Permissions', href: '/superadmin/roles', icon: KeyRound },
  { label: 'Security', href: '/superadmin/security', icon: Shield },
]

const roleAccounts = [
  { role: 'Pension Admin', user: 'pensionadmin', scope: 'Pensioner onboarding & operations' },
  { role: 'Accounts Officer', user: 'accounts', scope: 'Disbursements & reconciliation' },
  { role: 'Recovery Officer', user: 'recovery', scope: 'Recovery case management' },
  { role: 'Audit Officer', user: 'audit', scope: 'Compliance & audit trails' },
  { role: 'Helpdesk', user: 'helpdesk', scope: 'Citizen support tickets' },
]

export function SuperAdminDashboardPage() {
  return (
    <AdminDashboardShell>
      <PageHeader
        variant="admin"
        title="Dashboard"
        description="System-wide governance — departments, roles, admins, and platform configuration"
        className="mb-6"
        action={
          <Button className="rounded-lg px-5" asChild>
            <Link to="/superadmin/admin-users">
              <Users className="mr-1.5 size-4" />
              Add admin user
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminHeroMetric
          label="Departments"
          value={12}
          trend="+2 this quarter"
          icon={Building2}
          iconTone="blue"
          sparklineData={sparklinePattern('trendUp')}
          delay={0.05}
        />
        <AdminHeroMetric
          label="Admin users"
          value={48}
          hint="Across all departments"
          icon={Users}
          iconTone="green"
          sparklineData={sparklinePattern('trendUpAlt')}
          delay={0.1}
        />
        <AdminHeroMetric
          label="Active roles"
          value={6}
          hint="Officer role templates"
          icon={KeyRound}
          iconTone="violet"
          sparklineData={sparklinePattern('wave')}
          delay={0.15}
        />
        <AdminHeroMetric
          label="Security policies"
          value={9}
          hint="Enforced platform-wide"
          icon={Shield}
          iconTone="amber"
          sparklineData={sparklinePattern('moderate')}
          delay={0.2}
        />
      </div>

      <AdminSectionHeading
        title="Platform snapshot"
        description="Governance metrics across the pension system"
      />
      <AdminHorizontalMarquee duration={30} icon3d className="mb-8">
        <AdminStatChip label="Departments" value={12} icon={Building2} iconTone="blue" />
        <AdminStatChip label="Admin users" value={48} icon={Users} iconTone="green" />
        <AdminStatChip label="Active roles" value={6} icon={KeyRound} iconTone="violet" />
        <AdminStatChip label="Security policies" value={9} icon={Shield} iconTone="amber" />
        <AdminStatChip label="Managed accounts" value={5} icon={Crown} iconTone="teal" />
      </AdminHorizontalMarquee>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Super Admin vs Pension Admin"
          description="Separate roles with different responsibilities"
          icon={Crown}
          tone="blue"
          delay={0.2}
        >
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <p className="font-semibold">Super Admin (you)</p>
              <p className="mt-1 text-muted-foreground">
                Configures the platform — departments, admin accounts, roles, permissions, system settings,
                and security policies.
              </p>
            </div>
            <div className="rounded-xl border border-sky-200/60 bg-sky-50/40 p-4 dark:border-sky-800/40 dark:bg-sky-950/20">
              <p className="font-semibold">Pension Admin</p>
              <p className="mt-1 text-muted-foreground">
                Runs day-to-day pension operations — onboarding pensioners, verifications, activations,
                suspensions, and reports.
              </p>
              <p className="mt-2 font-mono text-xs text-sky-600 dark:text-sky-400">
                Demo login: pensionadmin / Admin@123
              </p>
            </div>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Managed role accounts"
          description="Demo officer accounts provisioned by Super Admin"
          icon={Users}
          tone="violet"
          delay={0.25}
        >
          <div className="divide-y divide-border/40">
            {roleAccounts.map((account) => (
              <div key={account.user} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{account.role}</p>
                  <p className="truncate text-xs text-muted-foreground">{account.scope}</p>
                </div>
                <code className="shrink-0 rounded-lg bg-muted px-2 py-0.5 font-mono text-[10px]">
                  {account.user}
                </code>
              </div>
            ))}
          </div>
        </AdminChartCard>
      </div>

      <AdminSectionHeading
        title="Quick actions"
        description="Common governance tasks"
      />
      <AdminHorizontalMarquee duration={34} className="mb-2">
        {quickLinks.map((link) => (
          <Button
            key={link.href}
            variant="outline"
            className="h-auto shrink-0 justify-start gap-3 rounded-lg border-border bg-card px-4 py-3 hover:bg-muted/40"
            asChild
          >
            <Link to={link.href}>
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <link.icon className="size-4" />
              </span>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          </Button>
        ))}
      </AdminHorizontalMarquee>

      <div className="mt-6 flex justify-end">
        <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
          <Link to="/superadmin/settings">
            System settings
            <ChevronRight className="ml-0.5 size-4" />
          </Link>
        </Button>
      </div>
    </AdminDashboardShell>
  )
}
