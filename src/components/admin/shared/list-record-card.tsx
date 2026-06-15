import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  FolderOpen,
  Hash,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Shield,
  Tag,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ListRecordCardField {
  label: string
  value: ReactNode
}

interface ListRecordCardProps {
  serialNo?: number
  title: ReactNode
  subtitle?: ReactNode
  badges?: ReactNode
  fields?: ListRecordCardField[]
  action?: ReactNode
  className?: string
}

const FIELD_ICONS: Record<string, LucideIcon> = {
  Summary: FileText,
  Submitted: Calendar,
  Created: Calendar,
  Updated: Clock,
  'Last Login': Clock,
  Pensioner: User,
  'Assigned To': Users,
  'Issue Type': Tag,
  Mobile: Phone,
  Email: Mail,
  Contact: Mail,
  Place: MapPin,
  Department: Building2,
  Role: Shield,
  Permissions: Shield,
  Remarks: FileText,
  PPO: CreditCard,
  Outstanding: IndianRupee,
  Amount: Wallet,
  'Excess Case': FolderOpen,
  Status: Tag,
  Type: Tag,
  Category: FolderOpen,
  Priority: ArrowUpRight,
  Channel: Mail,
  Module: FolderOpen,
}

const FIELD_TILE_TONES = [
  {
    tile: 'bg-sky-50/80 ring-sky-100/80 dark:bg-sky-950/25 dark:ring-sky-900/40',
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  {
    tile: 'bg-emerald-50/80 ring-emerald-100/80 dark:bg-emerald-950/25 dark:ring-emerald-900/40',
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    tile: 'bg-violet-50/80 ring-violet-100/80 dark:bg-violet-950/25 dark:ring-violet-900/40',
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    tile: 'bg-amber-50/80 ring-amber-100/80 dark:bg-amber-950/25 dark:ring-amber-900/40',
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    tile: 'bg-rose-50/80 ring-rose-100/80 dark:bg-rose-950/25 dark:ring-rose-900/40',
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  {
    tile: 'bg-teal-50/80 ring-teal-100/80 dark:bg-teal-950/25 dark:ring-teal-900/40',
    icon: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  },
] as const

function formatFieldValue(value: ReactNode): ReactNode {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(parsed)
    }
  }

  return value
}

function isRecordId(value: ReactNode): boolean {
  return typeof value === 'string' && /^[A-Z]{2,}[\w-]*\d{4}/.test(value)
}

function isPersonName(value: ReactNode): boolean {
  return typeof value === 'string' && /^[\p{L}\s.'-]+$/u.test(value.trim()) && value.trim().includes(' ')
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function SubtitleContent({ subtitle }: { subtitle: ReactNode }) {
  if (typeof subtitle === 'string' && subtitle.includes(' · ')) {
    const [primary, secondary] = subtitle.split(' · ', 2)

    return (
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-border/40">
          <User className="size-3 shrink-0 text-primary/70" strokeWidth={2} />
          <span className="truncate">{primary}</span>
        </span>
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border/40">
          <Hash className="size-3 shrink-0 text-muted-foreground/70" strokeWidth={2} />
          <span className="truncate">{secondary}</span>
        </span>
      </div>
    )
  }

  if (typeof subtitle === 'string' && isPersonName(subtitle)) {
    return (
      <p className="mt-0.5 truncate text-sm font-medium text-muted-foreground">{subtitle}</p>
    )
  }

  return (
    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
  )
}

function getFieldIcon(label: string): LucideIcon {
  return FIELD_ICONS[label] ?? FileText
}

function getFieldTone(index: number) {
  return FIELD_TILE_TONES[index % FIELD_TILE_TONES.length]
}

export function ListRecordCard({
  serialNo,
  title,
  subtitle,
  badges,
  fields,
  action,
  className,
}: ListRecordCardProps) {
  const hasFields = Boolean(fields?.length)
  const showAvatar = typeof subtitle === 'string' && isPersonName(subtitle)

  return (
    <article
      className={cn(
        'list-record-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_4px_12px_rgba(59,130,246,0.08),0_16px_40px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative px-4 pb-3.5 pt-4">
        <div className="flex items-start gap-3">
          {showAvatar && (
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-icy-blue-600 text-sm font-bold text-white shadow-md shadow-primary/20 ring-2 ring-background"
              aria-hidden
            >
              {getInitials(subtitle as string)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  'line-clamp-2 leading-snug text-foreground',
                  isRecordId(title)
                    ? 'font-mono text-[13px] font-bold tracking-tight'
                    : 'text-[15px] font-semibold tracking-tight',
                )}
              >
                {title}
              </h3>

              {serialNo !== undefined && (
                <span
                  className="shrink-0 rounded-lg bg-muted/80 px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums text-muted-foreground"
                  aria-label={`Serial number ${serialNo}`}
                >
                  #{String(serialNo).padStart(2, '0')}
                </span>
              )}
            </div>

            {subtitle && <SubtitleContent subtitle={subtitle} />}
          </div>
        </div>

        {badges && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">{badges}</div>
        )}
      </div>

      {hasFields && (
        <div className="flex-1 px-4 pb-4">
          <dl
            className={cn(
              'grid gap-2',
              fields!.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
            )}
          >
            {fields!.map((field, index) => {
              const Icon = getFieldIcon(field.label)
              const tone = getFieldTone(index)
              const isSummary = field.label.toLowerCase() === 'summary'
              const isWide = isSummary || fields!.length % 2 === 1 && index === fields!.length - 1

              return (
                <div
                  key={`${field.label}-${index}`}
                  className={cn(
                    'relative overflow-hidden rounded-xl p-3 ring-1 ring-inset transition-colors duration-200 group-hover:ring-border/60',
                    tone.tile,
                    isWide && fields!.length > 1 && 'col-span-2',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                        {field.label}
                      </dt>
                      <dd
                        className={cn(
                          'mt-1 text-sm font-semibold leading-snug text-foreground',
                          isSummary ? 'line-clamp-2' : 'truncate',
                        )}
                      >
                        {formatFieldValue(field.value)}
                      </dd>
                    </div>

                    <div
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-lg',
                        tone.icon,
                      )}
                    >
                      <Icon className="size-3.5" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              )
            })}
          </dl>
        </div>
      )}

      {action && (
        <div className="mt-auto border-t border-border/40 bg-muted/15 px-4 py-3">
          <div className="list-record-card-action">{action}</div>
        </div>
      )}
    </article>
  )
}
