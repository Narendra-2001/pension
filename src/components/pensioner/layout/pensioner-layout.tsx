import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'

import { AppShellLayout } from '@/components/admin/layout/app-shell-layout'
import { pensionerNavGroups } from '@/components/pensioner/layout/pensioner-nav'
import { useAuth } from '@/providers/auth-provider'

export function PensionerLayout() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  useEffect(() => {
    if (!pensionerId) return
    void queryClient.refetchQueries({ queryKey: ['pensioner-dashboard', pensionerId] })
    void queryClient.refetchQueries({ queryKey: ['pensioner-verification', pensionerId] })
  }, [pathname, pensionerId, queryClient])

  return (
    <AppShellLayout
      portal="pensioner"
      navGroups={pensionerNavGroups}
      title="PensionFlow"
      subtitle="Pensioner Portal"
      homeHref="/pensioner/dashboard"
      markLabel="PF"
    />
  )
}
