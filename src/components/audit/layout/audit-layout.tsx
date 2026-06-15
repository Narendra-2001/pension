import { AppShellLayout } from '@/components/admin/layout/app-shell-layout'
import { auditMobilePriority, auditNavGroups } from '@/components/audit/layout/audit-nav'

export function AuditLayout() {
  return (
    <AppShellLayout
      portal="audit"
      navGroups={auditNavGroups}
      title="PensionFlow"
      subtitle="Audit Portal"
      homeHref="/audit/dashboard"
      markLabel="PF"
      mobileNavPriority={auditMobilePriority}
    />
  )
}
