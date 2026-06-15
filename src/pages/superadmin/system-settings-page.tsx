import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Save, Settings } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { fetchSystemSettings, updateSystemSettings } from '@/data/superadmin-api'
import type { SystemSetting } from '@/types/superadmin'

export function SystemSettingsPage() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Record<string, string | boolean | number>>({})
  const [dirtyCategories, setDirtyCategories] = useState<Set<string>>(new Set())

  const { data: settings, isLoading } = useQuery({
    queryKey: ['superadmin-settings'],
    queryFn: fetchSystemSettings,
  })

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string | boolean | number> = {}
      settings.forEach((s) => {
        initial[s.id] = s.value
      })
      setDraft(initial)
      setDirtyCategories(new Set())
    }
  }, [settings])

  const grouped = useMemo(() => {
    if (!settings) return []
    const map = new Map<string, SystemSetting[]>()
    settings.forEach((s) => {
      const list = map.get(s.category) ?? []
      list.push(s)
      map.set(s.category, list)
    })
    return Array.from(map.entries())
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: (category: string) => {
      const categorySettings = settings?.filter((s) => s.category === category) ?? []
      const updates = categorySettings.map((s) => ({
        id: s.id,
        value: draft[s.id],
      }))
      return updateSystemSettings(updates)
    },
    onSuccess: (_, category) => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-settings'] })
      setDirtyCategories((prev) => {
        const next = new Set(prev)
        next.delete(category)
        return next
      })
      toast.success(`${category} settings saved`)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateValue = (id: string, value: string | boolean | number, category: string) => {
    setDraft((prev) => ({ ...prev, [id]: value }))
    setDirtyCategories((prev) => new Set(prev).add(category))
  }

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        variant="admin"
        title="System Settings"
        description="Global platform configuration and integrations"
      />

      {grouped.map(([category, categorySettings]) => (
        <Card key={category} className="admin-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="size-4 text-primary" />
                {category}
              </CardTitle>
              <CardDescription>
                {category === 'General' && 'Platform identity and localization defaults'}
                {category === 'Security' && 'Authentication, sessions, and access policies'}
                {category === 'Pension Operations' && 'Life certificate and disbursement rules'}
                {category === 'Integrations' && 'External service connections'}
                {category === 'Compliance' && 'Regulatory and data retention policies'}
              </CardDescription>
            </div>
            {dirtyCategories.has(category) && (
              <Button
                size="sm"
                className="shrink-0 rounded-full"
                onClick={() => saveMutation.mutate(category)}
                disabled={saveMutation.isPending}
              >
                <Save className="mr-1.5 size-3.5" />
                Save
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {categorySettings.map((setting) => (
              <div
                key={setting.id}
                className="flex flex-col gap-3 border-b border-border/40 pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <Label htmlFor={setting.id} className="text-sm font-medium">
                    {setting.label}
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <div className="w-full shrink-0 sm:w-56">
                  {setting.type === 'boolean' && (
                    <Switch
                      id={setting.id}
                      checked={Boolean(draft[setting.id])}
                      onCheckedChange={(checked) => updateValue(setting.id, checked, category)}
                    />
                  )}
                  {setting.type === 'text' && (
                    <Input
                      id={setting.id}
                      value={String(draft[setting.id] ?? '')}
                      onChange={(e) => updateValue(setting.id, e.target.value, category)}
                    />
                  )}
                  {setting.type === 'number' && (
                    <Input
                      id={setting.id}
                      type="number"
                      value={Number(draft[setting.id] ?? 0)}
                      onChange={(e) => updateValue(setting.id, Number(e.target.value), category)}
                    />
                  )}
                  {setting.type === 'select' && (
                    <Select
                      value={String(draft[setting.id] ?? '')}
                      onValueChange={(value) => updateValue(setting.id, value, category)}
                    >
                      <SelectTrigger id={setting.id}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {setting.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  )
}
