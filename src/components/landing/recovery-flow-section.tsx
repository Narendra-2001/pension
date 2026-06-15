import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'

import { recoveryFlowImages } from '@/assets/media'
import { recoveryFlowSteps } from '@/data/mock-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

gsap.registerPlugin(ScrollTrigger)

const stepHeadlines = [
  'Excess pension found.',
  'Recovery case created.',
  'Multi-level approval.',
  'Structured installments.',
  'Recovery complete.',
]

const stepBodies = [
  'AI reconciliation scans every pension payment in real time — flagging overpayments before they slip through, with a full audit trail from the first alert.',
  'Supporting documents attach automatically and a recovery case opens in seconds, so your team moves from detection to action without manual data entry.',
  'Accounts officers and audit teams sign off in sequence — every approval logged, timestamped, and ready for compliance review at any time.',
  'Repayment plans split into clear installments with automated SMS and email reminders, keeping pensioners informed and collections on schedule.',
  'Cases close with exported documentation — reconciliation reports, approval history, and payment records bundled for your audit team.',
]

/** Full 360° Y spin per step + subtle X tilt for depth */
const stepSpin = (index: number) => ({
  start: { rotationY: 0, rotationX: 14 - index * 2 },
  end: { rotationY: 360, rotationX: -14 + index * 2 },
})

function RecoveryScreenMockup({ index }: { index: number }) {
  const step = recoveryFlowSteps[index]
  const image = recoveryFlowImages[index]
  const nextImage = index < recoveryFlowSteps.length - 1 ? recoveryFlowImages[index + 1] : null

  return (
    <div
      data-recovery-card={index}
      className="recovery-screen pointer-events-none absolute top-[2%] w-[92%] max-w-[540px] will-change-transform"
      style={{ left: '50%' }}
    >
      <div
        data-recovery-tilt={index}
        className="recovery-tilt relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_40px_80px_rgba(0,0,0,0.14),0_16px_40px_rgba(0,0,0,0.08)] sm:rounded-[2rem]">
          <img
            src={image}
            alt={step.title}
            className="aspect-square w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
            draggable={false}
          />
        </div>

        {nextImage && (
          <div
            data-recovery-peek={index}
            className="absolute -bottom-[14%] -left-[8%] w-[68%] overflow-hidden rounded-2xl shadow-[0_24px_56px_rgba(0,0,0,0.16)] sm:-bottom-[16%] sm:rounded-3xl"
            aria-hidden
          >
            <img
              src={nextImage}
              alt=""
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function RecoveryFlowMobile() {
  return (
    <div className="space-y-10 lg:hidden">
      {recoveryFlowSteps.map((step, i) => (
        <div
          key={step.title}
          className="recovery-mobile-item"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <h3 className="text-2xl font-bold text-icy-blue-600">{stepHeadlines[i]}</h3>
          <p className="mt-3 text-base leading-relaxed text-foreground">{stepBodies[i]}</p>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-[0_20px_48px_rgba(0,0,0,0.1)]">
            <img
              src={recoveryFlowImages[i]}
              alt={step.title}
              className="aspect-square w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function RecoveryFlowDesktop() {
  const pinWrapRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const headlineRefs = useRef<(HTMLHeadingElement | null)[]>([])
  const bodyRefs = useRef<(HTMLParagraphElement | null)[]>([])

  useEffect(() => {
    const wrap = pinWrapRef.current
    const pin = pinRef.current
    const stack = stackRef.current
    if (!wrap || !pin || !stack) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const mm = window.matchMedia('(min-width: 1024px)')
    if (!mm.matches) return

    const cards = gsap.utils.toArray<HTMLElement>('[data-recovery-card]', pin)
    const tilts = gsap.utils.toArray<HTMLElement>('[data-recovery-tilt]', pin)
    const peeks = gsap.utils.toArray<HTMLElement>('[data-recovery-peek]', pin)
    const headlines = headlineRefs.current.filter(Boolean) as HTMLHeadingElement[]
    const bodies = bodyRefs.current.filter(Boolean) as HTMLParagraphElement[]
    const stepCount = recoveryFlowSteps.length

    const ctx = gsap.context(() => {
      gsap.set(headlines[0], { opacity: 1, y: 0, filter: 'blur(0px)' })
      gsap.set(bodies[0], { opacity: 1, y: 0, filter: 'blur(0px)' })
      gsap.set(headlines.slice(1), { opacity: 0, y: 56, filter: 'blur(10px)' })
      gsap.set(bodies.slice(1), { opacity: 0, y: 44, filter: 'blur(8px)' })

      cards.forEach((card, i) => {
        gsap.set(card, {
          xPercent: -50,
          y: 0,
          scale: i === 0 ? 1 : 0.75,
          opacity: i === 0 ? 1 : 0,
          zIndex: i === 0 ? 10 : 1,
          force3D: true,
        })
      })

      tilts.forEach((tilt, i) => {
        const range = stepSpin(i)
        gsap.set(tilt, {
          rotationY: range.start.rotationY,
          rotationX: range.start.rotationX,
          transformPerspective: 1600,
          transformOrigin: '50% 50%',
          force3D: true,
        })
      })

      peeks.forEach((peek, i) => {
        gsap.set(peek, {
          rotation: -16,
          rotationX: -12,
          rotationY: 6,
          y: 0,
          opacity: i === 0 ? 0.95 : 0,
          transformOrigin: '50% 85%',
          transformPerspective: 1600,
          force3D: true,
        })
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: `+=${stepCount * 110}%`,
          pin: pin,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      for (let i = 0; i < stepCount; i++) {
        const range = stepSpin(i)
        const tilt = tilts[i]
        const card = cards[i]
        const peek = peeks[i] as HTMLElement | undefined

        if (i === 0) {
          tl.fromTo(
            tilt,
            { rotationY: range.start.rotationY, rotationX: range.start.rotationX },
            { rotationY: range.end.rotationY, rotationX: range.end.rotationX, ease: 'none', duration: 0.85 },
            0,
          )
          if (peek) {
            tl.fromTo(
              peek,
              { rotation: -16, rotationX: -12, rotationY: 0 },
              { rotation: -8, rotationX: -6, rotationY: 180, ease: 'none', duration: 0.85 },
              0,
            )
          }
          continue
        }

        const trans = i - 0.18

        tl.to(
          headlines[i - 1],
          { opacity: 0, y: -64, filter: 'blur(12px)', duration: 0.38, ease: 'none' },
          trans,
        )
        tl.to(
          bodies[i - 1],
          { opacity: 0, y: -48, filter: 'blur(10px)', duration: 0.38, ease: 'none' },
          trans + 0.04,
        )
        tl.fromTo(
          headlines[i],
          { opacity: 0, y: 72, filter: 'blur(12px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.44, ease: 'none' },
          trans + 0.08,
        )
        tl.fromTo(
          bodies[i],
          { opacity: 0, y: 56, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.44, ease: 'none' },
          trans + 0.14,
        )

        const prevCard = cards[i - 1]
        const prevTilt = tilts[i - 1]
        const prevPeek = peeks[i - 1] as HTMLElement | undefined

        tl.to(
          prevCard,
          { y: -160, scale: 0.78, opacity: 0, duration: 0.48, ease: 'none' },
          trans,
        )
        tl.to(
          prevTilt,
          { rotationY: 420, rotationX: -22, duration: 0.48, ease: 'none' },
          trans,
        )
        if (prevPeek) {
          tl.to(
            prevPeek,
            {
              rotation: 12,
              rotationX: -32,
              rotationY: 240,
              y: -110,
              opacity: 0,
              duration: 0.44,
              ease: 'none',
            },
            trans,
          )
        }

        tl.fromTo(
          card,
          { y: 150, scale: 0.65, opacity: 0, zIndex: 2 },
          { y: 0, scale: 1, opacity: 1, zIndex: 10, duration: 0.85, ease: 'none' },
          trans,
        )

        tl.fromTo(
          tilt,
          { rotationY: 0, rotationX: range.start.rotationX },
          { rotationY: 360, rotationX: range.end.rotationX, duration: 0.85, ease: 'none' },
          trans,
        )

        if (peek) {
          tl.fromTo(
            peek,
            { rotation: -34, rotationX: -22, rotationY: -90, opacity: 0, y: 70 },
            { rotation: -8, rotationX: -6, rotationY: 180, opacity: 0.95, y: 0, duration: 0.85, ease: 'none' },
            trans,
          )
        }
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
    <div ref={pinWrapRef} className="relative hidden lg:block">
      <div ref={pinRef} className="relative min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-[1200px] items-center px-8 xl:px-12">
          <div className="grid w-full grid-cols-2 items-center gap-12 xl:gap-20">
            <div className="relative min-h-[300px] xl:min-h-[340px]">
              {recoveryFlowSteps.map((_, i) => (
                <div
                  key={recoveryFlowSteps[i].title}
                  className="recovery-text-panel pointer-events-none absolute inset-0 flex flex-col justify-center pr-4"
                >
                  <h3
                    ref={(el) => {
                      headlineRefs.current[i] = el
                    }}
                    className="will-change-[transform,opacity,filter] text-[2rem] font-bold leading-[1.15] tracking-tight text-icy-blue-600 xl:text-[2.75rem]"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    {stepHeadlines[i]}
                  </h3>
                  <p
                    ref={(el) => {
                      bodyRefs.current[i] = el
                    }}
                    className="will-change-[transform,opacity,filter] mt-5 max-w-md text-lg leading-[1.55] text-foreground xl:text-[1.35rem] xl:leading-[1.5]"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    {stepBodies[i]}
                  </p>
                </div>
              ))}
            </div>

            <div ref={stackRef} className="recovery-stack relative mx-auto aspect-square w-full max-w-[580px]">
              {recoveryFlowSteps.map((_, i) => (
                <RecoveryScreenMockup key={recoveryFlowSteps[i].title} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecoveryFlowSection() {
  const headerRef = useScrollReveal<HTMLDivElement>({ stagger: 0.12, y: 40 })

  return (
    <section id="recovery-flow" className="overflow-hidden bg-white">
      <div className="section-padding pb-12 lg:pb-0">
        <div ref={headerRef} className="mx-auto max-w-7xl">
          <div className="reveal-item mx-auto mb-12 max-w-2xl text-center lg:mb-16">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-icy-blue-500">
              Recovery Flow
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Intelligent{' '}
              <span className="text-gradient">Recovery Pipeline</span>
            </h2>
          </div>
        </div>

        <RecoveryFlowDesktop />
        <div className="mx-auto max-w-7xl px-6 lg:hidden">
          <RecoveryFlowMobile />
        </div>
      </div>
    </section>
  )
}
