import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Eye, EyeOff, Lock, LogOut, Shield } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  changePensionerPassword,
  fetchPensionerSettingsData,
  savePensionerSettings,
} from '@/data/pensioner-api'
import { useAuth } from '@/providers/auth-provider'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function SettingsPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['pensioner-settings'],
    queryFn: fetchPensionerSettingsData,
  })

  const settingsMutation = useMutation({
    mutationFn: savePensionerSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pensioner-settings'] })
      toast.success('Settings saved')
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const handlePasswordChange = passwordForm.handleSubmit(async (values) => {
    if (!user?.username) return
    await changePensionerPassword(user.username, values.newPassword)
    toast.success('Password changed successfully')
    passwordForm.reset()
  })

  const handleLogout = () => {
    logout()
  }

  if (isLoading || !settings) return <PageLoadingSkeleton />

  return (
    <div>
      <PageHeader variant="admin" title="Settings" description="Manage your account preferences" />

      <div className="space-y-6 max-w-2xl">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="size-4" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            className="rounded-xl pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="rounded-xl">Update Password</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailNotifications' as const, label: 'Email Notifications' },
              { key: 'smsNotifications' as const, label: 'SMS Notifications' },
              { key: 'pushNotifications' as const, label: 'Push Notifications' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <Label htmlFor={item.key}>{item.label}</Label>
                <Switch
                  id={item.key}
                  checked={settings[item.key]}
                  onCheckedChange={(checked) =>
                    settingsMutation.mutate({ [item.key]: checked })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4" /> Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) =>
                  settingsMutation.mutate({ twoFactorEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button variant="destructive" className="rounded-xl w-full sm:w-auto" onClick={handleLogout}>
          <LogOut className="mr-2 size-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
