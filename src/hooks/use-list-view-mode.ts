import { useState } from 'react'

import type { ViewMode } from '@/components/admin/shared/view-mode-toggle'
import { MOBILE_BREAKPOINT, useIsMobile } from '@/hooks/use-mobile'

function getInitialViewMode(defaultMode: ViewMode): ViewMode {
  if (typeof window === 'undefined') return defaultMode
  return window.innerWidth < MOBILE_BREAKPOINT ? 'card' : defaultMode
}

export function useListViewMode(defaultMode: ViewMode = 'table') {
  const isMobile = useIsMobile()
  const [viewMode, setViewMode] = useState<ViewMode>(() => getInitialViewMode(defaultMode))

  const effectiveViewMode: ViewMode =
    isMobile && viewMode === 'table' ? 'card' : viewMode

  return [effectiveViewMode, setViewMode] as const
}
