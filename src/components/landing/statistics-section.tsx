import { useCounter } from '@/hooks/use-counter'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

const stats = [
  { end: 50, suffix: 'K+', label: 'Pensioners', prefix: '' },
  { end: 500, suffix: '+', label: 'Recovery Cases', prefix: '' },
  { end: 99.9, suffix: '%', label: 'Accuracy', prefix: '', decimals: 1 },
  { end: 24, suffix: '/7', label: 'Availability', prefix: '' },
]

function StatCard({
  end,
  suffix,
  prefix,
  decimals,
  label,
}: {
  end: number
  suffix: string
  prefix: string
  decimals?: number
  label: string
}) {
  const { ref, display } = useCounter(end, { suffix, prefix, decimals })

  return (
    <div className="reveal-item card-surface p-8 text-center">
      <span ref={ref} className="text-4xl font-extrabold tracking-tight text-icy-blue-500 md:text-5xl">
        {display}
      </span>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

export function StatisticsSection() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section className="section-padding section-alt border-y border-border">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="reveal-item mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted at <span className="text-gradient">Scale</span>
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
