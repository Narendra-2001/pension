import { AppShellLayout } from '@/components/admin/layout/app-shell-layout'
import { superAdminBrand, superAdminNavItems } from '@/components/superadmin/layout/superadmin-nav'

export function SuperAdminLayout() {
  return (
    <AppShellLayout
      portal="superadmin"
      navItems={superAdminNavItems}
      title={superAdminBrand.title}
      subtitle={superAdminBrand.subtitle}
      homeHref="/superadmin/dashboard"
      markLabel={superAdminBrand.markLabel}
    />
  )
}
