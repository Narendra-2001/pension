import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { testimonials } from '@/data/mock-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 8000

function StarRating({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-amber-400 text-amber-400" strokeWidth={0} />
      ))}
    </div>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  featured = false,
}: {
  quote: string
  author: string
  role: string
  avatar: string
  featured?: boolean
}) {
  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 text-background shadow-[0_32px_80px_rgba(0,0,0,0.18)] sm:p-10 lg:p-12">
        <Quote
          className="pointer-events-none absolute -right-4 -top-2 size-32 text-white/[0.06] sm:size-40"
          strokeWidth={1}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-icy-blue-500/20 via-transparent to-transparent" />

        <div className="relative">
          <StarRating className="mb-6" />
          <blockquote className="text-xl font-medium leading-[1.55] tracking-tight sm:text-2xl lg:text-[1.65rem] lg:leading-[1.5]">
            &ldquo;{quote}&rdquo;
          </blockquote>

          <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-8">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold ring-1 ring-white/15 backdrop-blur-sm">
              {avatar}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{author}</p>
              <p className="truncate text-sm text-white/65">{role}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-surface flex h-full flex-col p-6">
      <StarRating className="mb-4" />
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-icy-blue-50 text-xs font-bold text-icy-blue-600">
          {avatar}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{author}</p>
          <p className="truncate text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const ref = useScrollReveal<HTMLDivElement>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const count = testimonials.length
  const active = testimonials[activeIndex]

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % count) + count) % count)
    },
    [count],
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (isPaused) return

    intervalRef.current = setInterval(goNext, AUTOPLAY_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [goNext, isPaused])

  return (
    <section
      className="section-padding section-alt border-y border-border"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsPaused(false)
        }
      }}
    >
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="reveal-item grid items-start gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-icy-blue-500">
              Testimonials
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What Officers{' '}
              <span className="text-gradient">Are Saying</span>
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Real outcomes from pension departments that moved from manual workflows to
              a unified, auditable platform.
            </p>

            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
              <div className="text-center">
                <p className="text-3xl font-extrabold tracking-tight text-foreground">4.9</p>
                <StarRating className="mt-1 justify-center" />
              </div>
              <div className="h-10 w-px bg-border" />
              <p className="max-w-[11rem] text-sm leading-snug text-muted-foreground">
                Average rating from officers across{' '}
                <span className="font-semibold text-foreground">12+ departments</span>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {testimonials.map((t, i) => {
                const isActive = i === activeIndex
                return (
                  <button
                    key={t.author}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`View testimonial from ${t.author}`}
                    aria-pressed={isActive}
                    className={cn(
                      'inline-flex items-center gap-2.5 rounded-full border px-3 py-2 text-left transition-all duration-300',
                      isActive
                        ? 'border-foreground bg-foreground text-background shadow-md'
                        : 'border-border bg-card text-muted-foreground hover:border-icy-blue-200 hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        isActive ? 'bg-white/15 text-background' : 'bg-icy-blue-50 text-icy-blue-600',
                      )}
                    >
                      {t.avatar}
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-sm font-medium">{t.author}</span>
                      <span
                        className={cn(
                          'block truncate text-xs',
                          isActive ? 'text-background/70' : 'text-muted-foreground',
                        )}
                      >
                        {t.role.split(',')[0]}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-icy-blue-200 hover:bg-icy-blue-50"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonial"
                className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:border-icy-blue-200 hover:bg-icy-blue-50"
              >
                <ChevronRight className="size-5" />
              </button>
              <div className="ml-1 flex items-center gap-1.5" role="tablist" aria-label="Testimonial slides">
                {testimonials.map((t, i) => (
                  <button
                    key={t.author}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      i === activeIndex ? 'w-7 bg-icy-blue-500' : 'w-2 bg-border hover:bg-icy-blue-200',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="reveal-item relative min-h-[320px] lg:min-h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <TestimonialCard {...active} featured />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="reveal-item mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials
            .filter((_, i) => i !== activeIndex)
            .slice(0, 3)
            .map((t) => (
              <TestimonialCard key={t.author} {...t} />
            ))}
        </div>
      </div>
    </section>
  )
}
