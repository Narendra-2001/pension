import { useId } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface AdminSparklineProps {
  data: number[]
  color?: string
  className?: string
  height?: number
}

interface SparkPoint {
  x: number
  y: number
}

function toPoints(data: number[], width: number, height: number): SparkPoint[] {
  if (data.length === 0) return []

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 3
  const plotHeight = height - padding * 2
  const step = data.length > 1 ? width / (data.length - 1) : 0

  return data.map((value, index) => ({
    x: index * step,
    y: height - padding - ((value - min) / range) * plotHeight,
  }))
}

/** Smooth cubic-bezier path (Catmull-Rom style) for a polished dashboard sparkline. */
function buildSmoothPath(points: SparkPoint[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  const tension = 0.35
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }

  return path
}

function buildAreaPath(linePath: string, width: number, height: number): string {
  if (!linePath) return ''
  return `${linePath} L ${width.toFixed(2)} ${height.toFixed(2)} L 0 ${height.toFixed(2)} Z`
}

export function AdminSparkline({
  data,
  color = '#3b82f6',
  className,
  height = 36,
}: AdminSparklineProps) {
  const gradientId = useId()
  const width = 120
  const points = toPoints(data, width, height)
  const linePath = buildSmoothPath(points)
  const areaPath = buildAreaPath(linePath, width, height)

  return (
    <div className={cn('admin-sparkline w-full overflow-hidden', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="55%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath && (
          <path d={areaPath} fill={`url(#${gradientId})`} />
        )}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        )}
      </svg>
    </div>
  )
}
