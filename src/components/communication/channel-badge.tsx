import { cn } from '@/lib/utils'
import { CHANNEL_LABELS } from '@/lib/communication'
import type { NotificationChannel } from '@/types/communication'
import { Mail, MessageSquare, Smartphone } from 'lucide-react'

const channelIcons = {
  sms: Smartphone,
  email: Mail,
  in_app: MessageSquare,
}

const channelTones = {
  sms: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  email: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  in_app: 'bg-teal-500/10 text-teal-700 dark:text-teal-400',
}

export function ChannelBadge({ channel, className }: { channel: NotificationChannel; className?: string }) {
  const Icon = channelIcons[channel]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        channelTones[channel],
        className,
      )}
    >
      <Icon className="size-3" />
      {CHANNEL_LABELS[channel]}
    </span>
  )
}
