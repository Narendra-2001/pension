import type { QueryClient } from '@tanstack/react-query'

/** Invalidate all React Query caches tied to demise submissions and admin work queue. */
export function invalidateDemiseWorkflowQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
  queryClient.invalidateQueries({ queryKey: ['admin-task-counts'] })
  queryClient.invalidateQueries({ queryKey: ['pending-admin-task-count'] })
  queryClient.invalidateQueries({ queryKey: ['demise-intimations'] })
  queryClient.invalidateQueries({ queryKey: ['demise-dashboard-stats'] })
  queryClient.invalidateQueries({ queryKey: ['nominee-demise'] })
  queryClient.invalidateQueries({ queryKey: ['demise-reports'] })
}
