import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'

import { showcaseImages } from '@/assets/media'
import { Button } from '@/components/ui/button'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

gsap.registerPlugin(ScrollTrigger)

const showcaseCards = [
  {
    id: 'admin',
    label: 'Admin Dashboard',
    image: showcaseImages.admin,
    rest: { x: -420, y: -260, scale: 0.62 },
    tilt: { rotationX: 16, rotationY: -28, rotationZ: -5 },
  },
  {
    id: 'verification',
    label: 'Verification',
    image: showcaseImages.verification,
    rest: { x: 420, y: -240, scale: 0.62 },
    tilt: { rotationX: 14, rotationY: 30, rotationZ: 6 },
  },
  {
    id: 'recovery',
    label: 'Recovery Cases',
    image: showcaseImages.recovery,
    rest: { x: -400, y: 260, scale: 0.58 },
    tilt: { rotationX: -12, rotationY: -22, rotationZ: 4 },
  },
  {
    id: 'reports',
    label: 'Reports',
    image: showcaseImages.reports,
    rest: { x: 400, y: 280, scale: 0.58 },
    tilt: { rotationX: -10, rotationY: 26, rotationZ: -4 },
  },
]

const FOCUS = { x: 0, y: 60, scale: 1.22 }
const FOCUS_TILT = { rotationX: 4, rotationY: 0, rotationZ: 0 }

function ShowcaseCard({
  label,
  image,
  index,
}: {
  label: string
  image: string
  index: number
}) {
  return (
    <div
      data-showcase-card={index}
      className="showcase-card pointer-events-none absolute left-1/2 top-1/2"
    >
      <div
        data-showcase-tilt={index}
        className="showcase-tilt relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="showcase-card-frame overflow-hidden rounded-[1.25rem] bg-white shadow-[0_32px_64px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.06)] sm:rounded-[1.75rem]">
          <img
            src={image}
            alt={label}
            className="aspect-[4/3] w-full object-cover"
            loading={index < 2 ? 'eager' : 'lazy'}
            draggable={false}
          />
        </div>
        <span
          data-showcase-label={index}
          className="showcase-card-label absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-foreground shadow-sm backdrop-blur-sm sm:text-xs"
        >
          {label}
        </span>
      </div>
    </div>
  )
}

function ShowcaseMobile() {
  const ref = useScrollReveal<HTMLDivElement>({ stagger: 0.12, y: 48 })

  return (
    <div ref={ref} className="mx-auto max-w-lg space-y-8 px-6 lg:hidden">
      <div className="reveal-item text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-icy-blue-500">
          Product Showcase
        </p>
        <h2 className="text-3xl font-bold tracking-tight">
          Powerful Dashboards for{' '}
          <span className="text-gradient">Every Role</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Four purpose-built workspaces — admin oversight, verification queues,
          recovery pipelines, and compliance reports — all in one platform.
        </p>
        <Button variant="outline" className="mt-6 rounded-full" asChild>
          <Link to="/dashboard-preview">
            Explore dashboards
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {showcaseCards.map((card, i) => (
          <div
            key={card.id}
            className="reveal-item overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <img
              src={card.image}
              alt={card.label}
              className="aspect-square w-full object-cover"
              loading={i < 2 ? 'eager' : 'lazy'}
            />
            <p className="px-3 py-2 text-center text-xs font-semibold">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShowcaseDesktop() {
  const pinWrapRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = pinWrapRef.current
    const pin = pinRef.current
    if (!wrap || !pin) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const mm = window.matchMedia('(min-width: 1024px)')
    if (!mm.matches) return

    const cards = gsap.utils.toArray<HTMLElement>('[data-showcase-card]', pin)
    const tilts = gsap.utils.toArray<HTMLElement>('[data-showcase-tilt]', pin)
    const labels = gsap.utils.toArray<HTMLElement>('[data-showcase-label]', pin)
    const cardCount = showcaseCards.length

    const ctx = gsap.context(() => {
      gsap.set(centerRef.current, { opacity: 1, y: 0, filter: 'blur(0px)' })

      cards.forEach((card, i) => {
        const config = showcaseCards[i]
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: config.rest.x,
          y: config.rest.y,
          scale: config.rest.scale,
          opacity: 0.55,
          zIndex: 1,
          force3D: true,
        })
      })

      tilts.forEach((tilt, i) => {
        const config = showcaseCards[i]
        gsap.set(tilt, {
          rotationX: config.tilt.rotationX,
          rotationY: config.tilt.rotationY,
          rotationZ: config.tilt.rotationZ,
          transformPerspective: 1400,
          transformOrigin: '50% 50%',
          force3D: true,
        })
      })

      labels.forEach((label) => {
        gsap.set(label, { opacity: 0.7, y: 0 })
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: `+=${cardCount * 75 + 40}%`,
          pin: pin,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      for (let i = 0; i < cardCount; i++) {
        const config = showcaseCards[i]
        const card = cards[i]
        const tilt = tilts[i]
        const label = labels[i]
        const step = 0.08 + i * 0.82
        const hold = step + 0.34
        const exit = step + 0.5

        if (i > 0) {
          const prev = i - 1
          tl.to(
            cards[prev],
            {
              x: showcaseCards[prev].rest.x,
              y: showcaseCards[prev].rest.y,
              scale: showcaseCards[prev].rest.scale,
              opacity: 0.45,
              zIndex: 1,
              duration: 0.28,
              ease: 'none',
            },
            step - 0.05,
          )
          tl.to(
            tilts[prev],
            {
              rotationX: showcaseCards[prev].tilt.rotationX,
              rotationY: showcaseCards[prev].tilt.rotationY,
              rotationZ: showcaseCards[prev].tilt.rotationZ,
              duration: 0.28,
              ease: 'none',
            },
            step - 0.05,
          )
          tl.to(labels[prev], { opacity: 0.55, duration: 0.2, ease: 'none' }, step - 0.05)
        }

        cards.forEach((other, j) => {
          if (j === i) return
          tl.to(
            other,
            { opacity: 0.28, scale: showcaseCards[j].rest.scale * 0.92, duration: 0.22, ease: 'none' },
            step,
          )
        })

        tl.to(
          centerRef.current,
          { opacity: 0, filter: 'blur(10px)', y: -24, duration: 0.22, ease: 'none' },
          step,
        )
        tl.to(
          card,
          {
            x: FOCUS.x,
            y: FOCUS.y,
            scale: FOCUS.scale,
            opacity: 1,
            zIndex: 20,
            duration: 0.38,
            ease: 'none',
          },
          step,
        )
        tl.to(
          tilt,
          {
            rotationX: FOCUS_TILT.rotationX,
            rotationY: FOCUS_TILT.rotationY,
            rotationZ: FOCUS_TILT.rotationZ,
            duration: 0.38,
            ease: 'none',
          },
          step,
        )
        tl.to(label, { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, step + 0.2)

        tl.to(
          centerRef.current,
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.24, ease: 'none' },
          exit,
        )
        tl.to(
          card,
          {
            x: config.rest.x,
            y: config.rest.y,
            scale: config.rest.scale,
            opacity: 0.55,
            zIndex: 2,
            duration: 0.32,
            ease: 'none',
          },
          exit,
        )
        tl.to(
          tilt,
          {
            rotationX: config.tilt.rotationX,
            rotationY: config.tilt.rotationY,
            rotationZ: config.tilt.rotationZ,
            duration: 0.32,
            ease: 'none',
          },
          exit,
        )
        tl.to(label, { opacity: 0.7, duration: 0.2, ease: 'none' }, exit)

        cards.forEach((other, j) => {
          if (j === i) return
          tl.to(
            other,
            {
              opacity: 0.55,
              scale: showcaseCards[j].rest.scale,
              duration: 0.22,
              ease: 'none',
            },
            hold,
          )
        })
      }
    }, pin)

    const handleResize = () => ScrollTrigger.refresh()
    mm.addEventListener('change', handleResize)
    window.addEventListener('resize', handleResize)

    return () => {
      mm.removeEventListener('change', handleResize)
      window.removeEventListener('resize', handleResize)
      ctx.revert()
    }
  }, [])

  return (
    <div ref={pinWrapRef} className="relative hidden min-h-screen lg:block">
      <div ref={pinRef} className="showcase-stage relative min-h-screen overflow-hidden bg-white">
        <div
          ref={centerRef}
          className="showcase-center absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center will-change-[opacity,transform,filter]"
        >
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-icy-blue-500">
            Product Showcase
          </p>
          <h2 className="max-w-2xl text-[2.75rem] font-bold leading-[1.08] tracking-tight xl:text-[3.5rem]">
            Powerful dashboards for{' '}
            <span className="text-gradient">every role.</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Admin oversight, verification queues, recovery pipelines, and
            compliance reports — four purpose-built workspaces in one platform.
          </p>
          <div className="mt-8">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-foreground/20 px-8 text-base font-medium hover:bg-foreground hover:text-background"
              asChild
            >
              <Link to="/dashboard-preview">
                Explore dashboards
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="showcase-cards-layer absolute inset-0 z-20">
          {showcaseCards.map((card, i) => (
            <ShowcaseCard
              key={card.id}
              label={card.label}
              image={card.image}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProductShowcase() {
  return (
    <section id="showcase" className="overflow-hidden bg-white">
      <ShowcaseDesktop />
      <div className="section-padding lg:hidden">
        <ShowcaseMobile />
      </div>
    </section>
  )
}
