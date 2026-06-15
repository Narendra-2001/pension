import { motion } from 'framer-motion'

import { featurePosterImages } from '@/assets/media'
import { features } from '@/data/mock-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

type Feature = (typeof features)[number]

function FeatureCard({ feature, featureIndex }: { feature: Feature; featureIndex: number }) {
  const image = featurePosterImages[featureIndex]

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-icy-blue-50/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative aspect-video overflow-hidden border-b border-border/40">
        <img
          src={image}
          alt={feature.title}
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="relative p-5">
        <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </div>
  )
}

function VerticalMarqueeColumn({
  items,
  startIndex,
  direction = 'up',
  duration = 28,
  className,
}: {
  items: Feature[]
  startIndex: number
  direction?: 'up' | 'down'
  duration?: number
  className?: string
}) {
  const doubled = [...items, ...items]

  return (
    <div
      className={cn(
        'marquee-column relative w-full min-w-0 overflow-hidden',
        direction === 'down' && 'flex flex-col justify-end',
        className,
      )}
    >
      <motion.div
        className="flex flex-col gap-5"
        animate={{
          y: direction === 'up' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((feature, i) => {
          const featureIndex = startIndex + (i % items.length)
          return (
            <FeatureCard
              key={`${feature.title}-${i}`}
              feature={feature}
              featureIndex={featureIndex}
            />
          )
        })}
      </motion.div>
    </div>
  )
}

export function FeaturesSection() {
  const ref = useScrollReveal<HTMLDivElement>({ stagger: 0.12, y: 24 })

  const columnOne = features.slice(0, 3)
  const columnTwo = features.slice(3, 6)
  const columnThree = features.slice(6)

  return (
    <section id="features" className="section-padding w-full overflow-hidden">
      <div ref={ref} className="w-full">
        <div className="reveal-item mb-14 text-center sm:mb-16">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-border sm:w-14" aria-hidden />
            <p className="text-sm font-medium text-icy-blue-500">
              // Platform Capabilities //
            </p>
            <span className="h-px w-10 bg-border sm:w-14" aria-hidden />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything You Need for{' '}
            <span className="text-gradient">Pension Operations</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A comprehensive suite of tools designed for government pension departments.
          </p>
        </div>

        <div className="reveal-item grid w-full grid-cols-3 gap-5 lg:gap-6 xl:gap-8 max-lg:hidden">
          <VerticalMarqueeColumn items={columnOne} startIndex={0} direction="up" duration={18} className="h-[780px]" />
          <VerticalMarqueeColumn items={columnTwo} startIndex={3} direction="down" duration={16} className="h-[780px]" />
          <VerticalMarqueeColumn items={columnThree} startIndex={6} direction="up" duration={20} className="h-[780px]" />
        </div>

        <div className="reveal-item w-full lg:hidden">
          <VerticalMarqueeColumn items={features} startIndex={0} direction="up" duration={22} className="h-[520px]" />
        </div>
      </div>
    </section>
  )
}
