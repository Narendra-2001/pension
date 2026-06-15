import { Children, cloneElement, isValidElement, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  type PieSectorDataItem,
} from 'recharts'

import { AdminSparkline } from '@/components/admin/shared/admin-sparkline'
import { cn } from '@/lib/utils'

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: '8px',
    border: '1px solid var(--border)',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
    fontSize: '12px',
    background: '#ffffff',
  },
}

export const adminStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

export const adminStaggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

export function AdminFadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AdminChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
  icon?: LucideIcon
  tone?: ChartCardTone
  delay?: number
}

export type ChartCardTone = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'slate'

const CHART_CARD_TONES: Record<ChartCardTone, { icon: string }> = {
  blue: { icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400' },
  green: { icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' },
  amber: { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  violet: { icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400' },
  rose: { icon: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' },
  slate: { icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400' },
}

export function AdminChartCard({
  title,
  description,
  children,
  className,
  action,
  icon: Icon,
  tone = 'blue',
  delay = 0,
}: AdminChartCardProps) {
  const styles = CHART_CARD_TONES[tone]

  return (
    <motion.div
      variants={adminStaggerItem}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={cn(
        'admin-card group flex flex-col overflow-hidden rounded-xl border border-border bg-card py-0',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                styles.icon,
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="admin-card-title">{title}</h3>
            {description && <p className="admin-card-desc">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  )
}

export type AdminIconTone = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'slate' | 'teal'

const ADMIN_ICON_TONES: Record<
  AdminIconTone,
  { bg: string; icon: string; spark: string; ring: string }
> = {
  blue: {
    bg: 'bg-sky-100 dark:bg-sky-950/60',
    icon: 'text-sky-600 dark:text-sky-400',
    spark: '#3b82f6',
    ring: 'ring-sky-100/80',
  },
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    icon: 'text-emerald-600 dark:text-emerald-400',
    spark: '#10b981',
    ring: 'ring-emerald-100/80',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    icon: 'text-amber-600 dark:text-amber-400',
    spark: '#f59e0b',
    ring: 'ring-amber-100/80',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-950/60',
    icon: 'text-violet-600 dark:text-violet-400',
    spark: '#8b5cf6',
    ring: 'ring-violet-100/80',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    icon: 'text-rose-600 dark:text-rose-400',
    spark: '#ef4444',
    ring: 'ring-rose-100/80',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    icon: 'text-slate-600 dark:text-slate-400',
    spark: '#64748b',
    ring: 'ring-slate-100/80',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-950/60',
    icon: 'text-teal-600 dark:text-teal-400',
    spark: '#14b8a6',
    ring: 'ring-teal-100/80',
  },
}

const ADMIN_ICON_3D: Record<
  AdminIconTone,
  { gradient: string; shadow: string; icon: string }
> = {
  blue: {
    gradient: 'bg-gradient-to-br from-sky-300 via-sky-500 to-blue-700',
    shadow: 'inset_0_1px_0_rgba(255,255,255,0.4)',
    icon: 'text-white drop-shadow-sm',
  },
  green: {
    gradient: 'bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-800',
    shadow: 'inset_0_1px_0_rgba(255,255,255,0.4)',
    icon: 'text-white drop-shadow-sm',
  },
  amber: {
    gradient: 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700',
    shadow: 'inset_0_1px_0_rgba(255,255,255,0.4)',
    icon: 'text-white drop-shadow-sm',
  },
  violet: {
    gradient: 'bg-gradient-to-br from-violet-300 via-violet-500 to-violet-800',
    shadow: 'inset_0_1px_0_rgba(255,255,255,0.4)',
    icon: 'text-white drop-shadow-sm',
  },
  rose: {
    gradient: 'bg-gradient-to-br from-rose-300 via-rose-500 to-rose-800',
    shadow: 'inset_0_1px_0_rgba(255,255,255,0.4)',
    icon: 'text-white drop-shadow-sm',
  },
  slate: {
    gradient: 'bg-gradient-to-br from-slate-300 via-slate-500 to-slate-700',
    shadow: 'inset_0_1px_0_rgba(255,255,255,0.35)',
    icon: 'text-white drop-shadow-sm',
  },
  teal: {
    gradient: 'bg-gradient-to-br from-teal-300 via-teal-500 to-teal-800',
    shadow: 'inset_0_1px_0_rgba(255,255,255,0.4)',
    icon: 'text-white drop-shadow-sm',
  },
}

type AdminIcon3DSize = 'sm' | 'md' | 'lg'

const ADMIN_ICON_3D_SIZES: Record<AdminIcon3DSize, { box: string; icon: string }> = {
  sm: { box: 'size-9', icon: 'size-4' },
  md: { box: 'size-11', icon: 'size-5' },
  lg: { box: 'size-10', icon: 'size-[18px]' },
}

export function AdminIcon3D({
  icon: Icon,
  tone = 'blue',
  size = 'md',
  className,
}: {
  icon: LucideIcon
  tone?: AdminIconTone
  size?: AdminIcon3DSize
  className?: string
}) {
  const styles = ADMIN_ICON_3D[tone]
  const dimensions = ADMIN_ICON_3D_SIZES[size]

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        dimensions.box,
        styles.gradient,
        styles.shadow,
        className,
      )}
    >
      <Icon className={cn(dimensions.icon, styles.icon)} strokeWidth={1.75} />
    </div>
  )
}

interface AdminHeroMetricProps {
  label: string
  value: ReactNode
  hint?: string
  trend?: string
  trendUp?: boolean
  icon?: LucideIcon
  iconTone?: AdminIconTone
  sparklineData?: number[]
  delay?: number
  className?: string
}

export function AdminHeroMetric({
  label,
  value,
  hint,
  trend,
  trendUp = true,
  icon: Icon,
  iconTone = 'blue',
  sparklineData,
  delay = 0,
  className,
}: AdminHeroMetricProps) {
  const tone = ADMIN_ICON_TONES[iconTone]

  return (
    <motion.div
      variants={adminStaggerItem}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={cn('admin-hero-metric group flex flex-col', className)}
    >
      <div className="relative flex items-start justify-between gap-3">
        <p className="admin-metric-label min-w-0 flex-1">{label}</p>
        {Icon && (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-inset transition-transform duration-300 group-hover:scale-105',
              tone.bg,
              tone.icon,
              tone.ring,
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <p className="admin-metric-value">{value}</p>

      {(hint || trend) && (
        <p className="admin-metric-footnote">
          {trend && (
            <span className={cn('font-medium', trendUp ? 'text-emerald-600' : 'text-rose-500')}>
              {trend}
            </span>
          )}
          {trend && hint && <span className="text-muted-foreground"> · </span>}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </p>
      )}

      {sparklineData && (
        <div className="mt-3 h-9 w-full">
          <AdminSparkline data={sparklineData} color={tone.spark} height={36} />
        </div>
      )}
    </motion.div>
  )
}

interface AdminStatChipProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  iconTone?: AdminIconTone
  icon3d?: boolean
  className?: string
}

export function AdminStatChip({
  label,
  value,
  icon: Icon,
  iconTone = 'blue',
  icon3d = false,
  className,
}: AdminStatChipProps) {
  const tone = ADMIN_ICON_TONES[iconTone]

  return (
    <div
      className={cn(
        'flex min-w-[9.5rem] shrink-0 items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5',
        className,
      )}
    >
      {Icon &&
        (icon3d ? (
          <AdminIcon3D icon={Icon} tone={iconTone} size="sm" />
        ) : (
          <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tone.bg)}>
            <Icon className={cn('size-4', tone.icon)} strokeWidth={1.75} />
          </div>
        ))}
      <div className="min-w-0">
        <p className="admin-stat-label">{label}</p>
        <p className="admin-stat-value">{value}</p>
      </div>
    </div>
  )
}

interface AdminHorizontalMarqueeProps {
  children: ReactNode
  className?: string
  duration?: number
  icon3d?: boolean
}

function withIcon3dChildren(children: ReactNode, icon3d: boolean): ReactNode {
  if (!icon3d) return children

  return Children.map(children, (child) => {
    if (!isValidElement<{ icon3d?: boolean; children?: ReactNode }>(child)) return child

    if (child.type === AdminStatChip) {
      return cloneElement(child, { icon3d: true })
    }

    if (child.props.children) {
      return cloneElement(child, {
        children: withIcon3dChildren(child.props.children, icon3d),
      })
    }

    return child
  })
}

export function AdminHorizontalMarquee({
  children,
  className,
  duration = 28,
  icon3d = false,
}: AdminHorizontalMarqueeProps) {
  const content = withIcon3dChildren(children, icon3d)

  return (
    <div className={cn('admin-marquee relative mb-8 overflow-hidden', className)}>
      <div
        className="admin-marquee-track flex w-max gap-2"
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 gap-2">{content}</div>
        <div className="flex shrink-0 gap-2" aria-hidden="true">
          {content}
        </div>
      </div>
    </div>
  )
}

interface AdminVerticalMarqueeProps {
  children: ReactNode
  className?: string
  duration?: number
  icon3d?: boolean
}

export function AdminVerticalMarquee({
  children,
  className,
  duration = 22,
  icon3d = false,
}: AdminVerticalMarqueeProps) {
  const content = withIcon3dChildren(children, icon3d)

  return (
    <div className={cn('admin-marquee-vertical relative mb-8 h-[4.25rem] w-full overflow-hidden', className)}>
      <div
        className="admin-marquee-vertical-track flex w-full flex-col gap-2"
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        <div className="flex w-full shrink-0 flex-col gap-2">{content}</div>
        <div className="flex w-full shrink-0 flex-col gap-2" aria-hidden="true">
          {content}
        </div>
      </div>
    </div>
  )
}

export function AdminSectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="admin-section-title">{title}</h2>
        {description && <p className="admin-section-desc">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function AdminDonutCenter({
  total,
  label = 'Total',
}: {
  total: string | number
  label?: string
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <p className="text-[11px] font-normal text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-medium tabular-nums text-foreground">{total}</p>
    </div>
  )
}

const STYLED_DONUT_PALETTE = ['#6d28d9', '#3b82f6', '#38bdf8', '#c4b5fd', '#818cf8', '#a5b4fc']

export interface AdminDonutDatum {
  name: string
  value: number
  fill?: string
}

function StyledDonutSector(props: PieSectorDataItem & { isActive?: boolean; index?: number }) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = '#6d28d9',
    isActive,
  } = props

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={isActive ? outerRadius + 5 : outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={10}
      stroke="var(--card)"
      strokeWidth={4}
      style={{
        filter: isActive ? 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.08))' : undefined,
        transition: 'filter 0.2s ease',
      }}
    />
  )
}

function StyledDonutTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; payload?: AdminDonutDatum & { percent: string } }>
}) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload
  if (!item) return null

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{item.name}</p>
      <p className="mt-0.5 tabular-nums text-muted-foreground">
        {item.value.toLocaleString('en-IN')} · {item.percent}%
      </p>
    </div>
  )
}

interface AdminStyledDonutChartProps {
  data: AdminDonutDatum[]
  centerLabel?: string
  animationDelay?: number
  className?: string
}

export function AdminStyledDonutChart({
  data,
  centerLabel = 'Total',
  animationDelay = 0,
  className,
}: AdminStyledDonutChartProps) {
  const chartId = useId().replace(/:/g, '')
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.fill ?? STYLED_DONUT_PALETTE[index % STYLED_DONUT_PALETTE.length],
    percent: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
  }))

  return (
    <motion.div
      className={cn('admin-styled-donut flex items-center gap-5 sm:gap-8', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative mx-auto h-48 w-48 shrink-0 sm:mx-0 sm:h-52 sm:w-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {chartData.map((item, index) => (
                <linearGradient
                  key={item.name}
                  id={`${chartId}-grad-${index}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor={item.fill} stopOpacity={1} />
                  <stop offset="100%" stopColor={item.fill} stopOpacity={0.72} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="56%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={4}
              shape={(props) => (
                <StyledDonutSector
                  {...props}
                  fill={
                    chartData[props.index ?? 0]?.fill
                      ? `url(#${chartId}-grad-${props.index ?? 0})`
                      : props.fill
                  }
                />
              )}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              animationBegin={animationDelay * 1000 + 200}
              animationDuration={1100}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={`url(#${chartId}-grad-${index})`}
                  style={{
                    opacity:
                      activeIndex === undefined || activeIndex === index ? 1 : 0.35,
                    transition: 'opacity 0.2s ease',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<StyledDonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <AdminDonutCenter total={total.toLocaleString('en-IN')} label={centerLabel} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3.5 py-1">
        {chartData.map((item, index) => {
          const isActive = activeIndex === index

          return (
            <button
              key={item.name}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(undefined)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-left transition-opacity duration-200',
                activeIndex !== undefined && !isActive && 'opacity-45',
              )}
            >
              <span
                className={cn(
                  'size-2.5 shrink-0 rounded-full shadow-sm transition-transform duration-200',
                  isActive && 'scale-125',
                )}
                style={{ backgroundColor: item.fill }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-normal text-foreground">
                {item.name}
              </span>
              <span className="shrink-0 text-sm font-normal tabular-nums text-muted-foreground">
                {item.percent}%
              </span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

export interface AdminLineSeries {
  dataKey: string
  name: string
  color: string
}

function MultiLineChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm"
      style={{ fontSize: '12px' }}
    >
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-normal text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-medium tabular-nums text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface AdminAnimatedLineChartProps {
  data: Record<string, string | number>[]
  series: AdminLineSeries[]
  xDataKey?: string
  animationDelay?: number
  showLegend?: boolean
  className?: string
}

export function AdminAnimatedLineChart({
  data,
  series,
  xDataKey = 'month',
  animationDelay = 0,
  showLegend = series.length > 1,
  className,
}: AdminAnimatedLineChartProps) {
  const [activeSeries, setActiveSeries] = useState<string | undefined>(undefined)
  const chartId = useId().replace(/:/g, '')
  const isSingleSeries = series.length === 1

  return (
    <motion.div
      className={cn('admin-line-chart', className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: animationDelay,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 0 }}>
            <defs>
              {series.map((line) => (
                <linearGradient
                  key={line.dataKey}
                  id={`${chartId}-${line.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={line.color}
                    stopOpacity={isSingleSeries ? 0.32 : 0.22}
                  />
                  <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(148, 163, 184, 0.12)"
            />
            <XAxis
              dataKey={xDataKey}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip content={<MultiLineChartTooltip />} />
            {showLegend && (
              <Legend
                iconType="plainline"
                iconSize={14}
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                onMouseEnter={(entry) => setActiveSeries(String(entry.dataKey))}
                onMouseLeave={() => setActiveSeries(undefined)}
              />
            )}
            {series.map((line, index) => {
              const isHighlighted =
                activeSeries === undefined || activeSeries === line.dataKey
              const showFill = isSingleSeries || activeSeries === line.dataKey

              return (
                <Area
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={isHighlighted ? 2.25 : 1.5}
                  fill={showFill ? `url(#${chartId}-${line.dataKey})` : 'transparent'}
                  fillOpacity={showFill ? 1 : 0}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: 'var(--card)',
                    fill: line.color,
                  }}
                  strokeOpacity={isHighlighted ? 1 : 0.35}
                  animationBegin={animationDelay * 1000 + 150 + index * 120}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

interface OnboardingMonthDatum {
  month: string
  count: number
}

interface OnboardingChannelDatum {
  channel: string
  count: number
  color: string
}

interface OnboardingDepartmentDatum {
  department: string
  count: number
}

interface AdminOnboardingInsightsProps {
  monthlyData: OnboardingMonthDatum[]
  channels: OnboardingChannelDatum[]
  topDepartments: OnboardingDepartmentDatum[]
  animationDelay?: number
  className?: string
}

export function AdminOnboardingInsights({
  monthlyData,
  channels,
  topDepartments,
  animationDelay = 0,
  className,
}: AdminOnboardingInsightsProps) {
  const totalYtd = monthlyData.reduce((sum, item) => sum + item.count, 0)
  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const avgMonthly = Math.round(totalYtd / monthlyData.length)
  const peakMonth = monthlyData.reduce((best, item) =>
    item.count > best.count ? item : best,
  )
  const momChange = previousMonth
    ? Math.round(((currentMonth.count - previousMonth.count) / previousMonth.count) * 100)
    : 0
  const channelTotal = channels.reduce((sum, item) => sum + item.count, 0)
  const maxDepartmentCount = Math.max(...topDepartments.map((item) => item.count), 1)

  const summaryStats = [
    {
      label: 'YTD total',
      value: totalYtd.toLocaleString('en-IN'),
      hint: 'This calendar year',
    },
    {
      label: `${currentMonth?.month ?? 'This month'}`,
      value: currentMonth?.count.toLocaleString('en-IN') ?? '0',
      hint: `${momChange >= 0 ? '+' : ''}${momChange}% vs last month`,
      trendUp: momChange >= 0,
    },
    {
      label: 'Monthly avg',
      value: avgMonthly.toLocaleString('en-IN'),
      hint: 'Across all months',
    },
    {
      label: 'Peak month',
      value: peakMonth.count.toLocaleString('en-IN'),
      hint: peakMonth.month,
    },
  ]

  return (
    <div className={cn('admin-onboarding-insights mt-5 border-t border-border/30 pt-4', className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: animationDelay + 0.5 + index * 0.06,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-lg border border-border bg-muted/20 px-3 py-2.5"
          >
            <p className="admin-stat-label">{stat.label}</p>
            <p className="admin-metric-value">{stat.value}</p>
            <p
              className={cn(
                'mt-0.5 text-[10px]',
                stat.trendUp === undefined
                  ? 'text-muted-foreground'
                  : stat.trendUp
                    ? 'font-medium text-emerald-600'
                    : 'font-medium text-rose-500',
              )}
            >
              {stat.hint}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationDelay + 0.75, duration: 0.35 }}
          className="rounded-lg border border-border bg-muted/15 p-3.5"
        >
          <p className="text-xs font-normal text-foreground/90">Onboarding sources</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">How new pensioners were added this year</p>
          <div className="mt-3 space-y-3">
            {channels.map((channel) => {
              const percent = channelTotal > 0 ? Math.round((channel.count / channelTotal) * 100) : 0
              return (
                <div key={channel.channel}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className="truncate text-muted-foreground">{channel.channel}</span>
                    <span className="shrink-0 tabular-nums font-medium text-foreground">
                      {channel.count.toLocaleString('en-IN')} · {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: channel.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{
                        delay: animationDelay + 0.85,
                        duration: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationDelay + 0.82, duration: 0.35 }}
          className="rounded-lg border border-border bg-muted/15 p-3.5"
        >
          <p className="text-xs font-normal text-foreground/90">Top departments</p>
          <p className="mt-0.5 text-xs font-normal text-muted-foreground">Highest onboarding volume this year</p>
          <div className="mt-3 space-y-2.5">
            {topDepartments.map((item, index) => (
              <div key={item.department} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-medium text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                    <span className="truncate font-medium text-foreground">{item.department}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {item.count.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted/60">
                    <motion.div
                      className="h-full rounded-full bg-primary/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / maxDepartmentCount) * 100}%` }}
                      transition={{
                        delay: animationDelay + 0.9 + index * 0.05,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
