import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserAvatarSrc } from '@/lib/user-avatars'
import type { AppUser } from '@/types/auth'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  user?: AppUser | null
  name: string
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({ user, name, className, fallbackClassName }: UserAvatarProps) {
  const src = getUserAvatarSrc(user)
  const initial = name.charAt(0).toUpperCase()

  return (
    <Avatar className={className}>
      {src ? <AvatarImage src={src} alt={name} className="object-cover object-center" /> : null}
      <AvatarFallback className={cn(fallbackClassName)}>{initial}</AvatarFallback>
    </Avatar>
  )
}
