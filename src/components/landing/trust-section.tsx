import { useCounter } from '@/hooks/use-counter'
import { LogoMarquee } from '@/components/effects/logo-marquee'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

const metrics = [
  { end: 50000, suffix: '+', label: 'Pensioners Managed', prefix: '' },
  { end: 99.9, suffix: '%', label: 'System Accuracy', prefix: '', decimals: 1 },
  { end: 500, suffix: '+', label: 'Recovery Cases', prefix: '' },
]

function MetricCard({
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
    <div className="reveal-item text-center">
      <span ref={ref} className="text-3xl font-bold tracking-tight text-icy-blue-500 md:text-4xl">
        {display}
      </span>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function TrustSection() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section className="section-padding section-alt border-y border-border">
      <div ref={ref} className="mx-auto max-w-7xl">
        <p className="reveal-item mb-10 text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by Government Organizations
        </p>

        <div className="reveal-item mb-16">
          <LogoMarquee />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </div>
    </section>
  )
}
