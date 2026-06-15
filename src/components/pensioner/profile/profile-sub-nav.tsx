import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ClipboardList, Eye, Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'

const profileTabs = [
  { label: 'View Profile', href: '/pensioner/profile', icon: Eye },
  { label: 'Request Update', href: '/pensioner/profile/request', icon: Pencil },
  { label: 'My Requests', href: '/pensioner/profile/requests', icon: ClipboardList },
]

interface ProfileSubNavProps {
  activePath: string
}

export function ProfileSubNav({ activePath }: ProfileSubNavProps) {
  return (
    <nav className="mx-auto mb-6 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-border/60 bg-muted/20 p-1.5 shadow-sm backdrop-blur-sm">
      {profileTabs.map((tab) => {
        const isActive = activePath === tab.href
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="pensioner-profile-sub-nav"
                className="absolute inset-0 rounded-xl bg-card shadow-sm ring-1 ring-border/60"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <tab.icon className="relative size-4 shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
            <span className="relative hidden sm:inline">{tab.label}</span>
            <span className="relative sm:hidden">{tab.label.split(' ').pop()}</span>
          </Link>
        )
      })}
    </nav>
  )
}
