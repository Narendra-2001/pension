import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'

import { pricingPlans } from '@/data/mock-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const ref = useScrollReveal<HTMLDivElement>({ stagger: 0.1 })

  return (
    <section id="pricing" className="section-padding section-alt">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="reveal-item mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-icy-blue-500">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Plans for Every{' '}
            <span className="text-gradient">Organization</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'reveal-item relative flex flex-col rounded-3xl border p-8',
                plan.highlighted
                  ? 'border-icy-blue-500/50 bg-gradient-to-b from-gunmetal-950 to-regal-navy-900 text-white shadow-xl glow-blue'
                  : 'card-surface',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-icy-blue-500 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.period && (
                  <span className={cn('text-sm', plan.highlighted ? 'text-gray-400' : 'text-muted-foreground')}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={cn('mt-3 text-sm', plan.highlighted ? 'text-gray-400' : 'text-muted-foreground')}>
                {plan.description}
              </p>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className={cn('mt-0.5 size-4 shrink-0', plan.highlighted ? 'text-icy-blue-400' : 'text-icy-blue-500')} />
                    <span className={plan.highlighted ? 'text-gray-300' : 'text-muted-foreground'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  'mt-8 rounded-2xl',
                  plan.highlighted
                    ? 'bg-white text-gunmetal-950 hover:bg-gray-100'
                    : 'bg-foreground text-background hover:bg-foreground/90',
                )}
                variant={plan.highlighted ? 'default' : 'default'}
                asChild
              >
                <Link to="/login">
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
