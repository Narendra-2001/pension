import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FileSearch,
  Headphones,
  Shield,
  User,
  UserCog,
  Wallet,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { showcaseImages } from '@/assets/media'
import { userRoles } from '@/data/mock-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

const roleIds = userRoles.map((r) => r.id) as Array<
  'pensioner' | 'admin' | 'accounts' | 'recovery' | 'audit' | 'helpdesk'
>

type RoleId = (typeof roleIds)[number]

type RoleTheme = {
  color: string
  heading: string
  body: string
  iconWrap: string
  link: string
  eyebrow: string
}

const roleConfig: Record<
  RoleId,
  { icon: typeof User; image: string; shortLabel: string; theme: RoleTheme }
> = {
  pensioner: {
    icon: User,
    image: showcaseImages.verification,
    shortLabel: 'Pensioner',
    theme: {
      color: '#c5193c',
      heading: 'text-white',
      body: 'text-white/85',
      iconWrap: 'bg-white/15 text-white ring-1 ring-white/25',
      link: 'text-white/95 hover:text-white',
      eyebrow: 'text-white/70',
    },
  },
  admin: {
    icon: UserCog,
    image: showcaseImages.admin,
    shortLabel: 'Admin',
    theme: {
      color: '#f5f5f7',
      heading: 'text-foreground',
      body: 'text-muted-foreground',
      iconWrap: 'bg-foreground text-background',
      link: 'text-icy-blue-600 hover:text-icy-blue-700',
      eyebrow: 'text-icy-blue-500',
    },
  },
  accounts: {
    icon: Wallet,
    image: showcaseImages.reports,
    shortLabel: 'Accounts',
    theme: {
      color: '#0a1628',
      heading: 'text-white',
      body: 'text-white/80',
      iconWrap: 'bg-white/10 text-white ring-1 ring-white/20',
      link: 'text-icy-blue-300 hover:text-icy-blue-200',
      eyebrow: 'text-white/70',
    },
  },
  recovery: {
    icon: FileSearch,
    image: showcaseImages.recovery,
    shortLabel: 'Recovery',
    theme: {
      color: '#e8e8ed',
      heading: 'text-foreground',
      body: 'text-muted-foreground',
      iconWrap: 'bg-foreground text-background',
      link: 'text-icy-blue-600 hover:text-icy-blue-700',
      eyebrow: 'text-icy-blue-500',
    },
  },
  audit: {
    icon: Shield,
    image: showcaseImages.reports,
    shortLabel: 'Audit',
    theme: {
      color: '#6d28d9',
      heading: 'text-white',
      body: 'text-white/85',
      iconWrap: 'bg-white/15 text-white ring-1 ring-white/25',
      link: 'text-white/95 hover:text-white',
      eyebrow: 'text-white/70',
    },
  },
  helpdesk: {
    icon: Headphones,
    image: showcaseImages.verification,
    shortLabel: 'Helpdesk',
    theme: {
      color: '#ffffff',
      heading: 'text-foreground',
      body: 'text-muted-foreground',
      iconWrap: 'bg-foreground text-background',
      link: 'text-icy-blue-600 hover:text-icy-blue-700',
      eyebrow: 'text-icy-blue-500',
    },
  },
}

function colorLuminance(hex: string) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

const COPY_VIEWPORT_CLASS = 'roles-atv-copy-viewport'

function RoleCopyPanel({ roleId, animated = true }: { roleId: RoleId; animated?: boolean }) {
  const role = userRoles.find((r) => r.id === roleId)!
  const config = roleConfig[roleId]
  const theme = config.theme
  const Icon = config.icon

  const content = (
    <div data-role-copy className="max-w-[400px]">
      <div className={cn('mb-8 flex size-14 items-center justify-center rounded-[1.1rem]', theme.iconWrap)}>
        <Icon className="size-7" strokeWidth={1.65} />
      </div>
      <h3 className={cn('text-[2rem] font-bold leading-[1.1] tracking-tight xl:text-[2.5rem]', theme.heading)}>
        {role.title}.
      </h3>
      <p className={cn('mt-5 text-[19px] leading-[1.55] xl:text-[21px]', theme.body)}>{role.description}</p>
      <a
        href="#roles"
        className={cn('mt-6 inline-flex items-center gap-1.5 text-[17px] font-medium transition-colors', theme.link)}
      >
        Learn more
        <span aria-hidden className="text-[1.35em] leading-none">
          ›
        </span>
      </a>
    </div>
  )

  if (!animated) return content

  return (
    <motion.div
      key={roleId}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  )
}

function RoleSlideFrame({
  activeRole,
  onSelectRole,
  stageRef,
}: {
  activeRole: RoleId
  onSelectRole: (id: RoleId) => void
  stageRef: React.RefObject<HTMLDivElement | null>
}) {
  const activeTitle = userRoles.find((r) => r.id === activeRole)!.title

  return (
    <div className="roles-atv-frame relative ml-auto w-full">
      <div className="roles-atv-tv relative overflow-hidden rounded-xl bg-black p-[2px] shadow-[0_40px_80px_rgba(0,0,0,0.22),0_16px_40px_rgba(0,0,0,0.12)]">
        <div
          ref={stageRef}
          className="roles-slide-stage relative aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-neutral-950"
        >
          {roleIds.map((roleId, i) => {
            const role = userRoles.find((r) => r.id === roleId)!
            return (
              <img
                key={roleId}
                data-role-slide={i}
                src={roleConfig[roleId].image}
                alt={role.title}
                className="roles-slide-image absolute inset-0 size-full object-cover object-center will-change-[clip-path,transform]"
                draggable={false}
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            )
          })}

          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/15 via-transparent to-black/45" />

          <div
            data-role-pills
            className="absolute right-6 top-5 z-20 flex gap-1 rounded-full border border-white/20 bg-black/35 p-1 shadow-[0_8px_28px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
          >
            {roleIds.map((roleId) => {
              const isActive = activeRole === roleId
              return (
                <button
                  key={roleId}
                  type="button"
                  onClick={() => onSelectRole(roleId)}
                  className={cn(
                    'relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 sm:px-4 sm:text-[13px]',
                    isActive ? 'text-black' : 'text-white/90 hover:text-white',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="roles-slide-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{roleConfig[roleId].shortLabel}</span>
                </button>
              )
            })}
          </div>

          <div className="pointer-events-none absolute bottom-8 left-8 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRole}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[1.65rem] font-bold tracking-tight text-white drop-shadow-sm xl:text-[1.85rem]">
                  {activeTitle}
                </p>
                <p className="mt-1 text-sm font-medium text-white/75">Role dashboard</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function applyWipeLayers(layers: HTMLElement[], position: number) {
  const currentIndex = Math.floor(position)
  const frac = position - currentIndex

  layers.forEach((layer, i) => {
    if (i < currentIndex) {
      gsap.set(layer, { clipPath: 'inset(0 0 100% 0)', zIndex: 1 })
      return
    }
    if (i > currentIndex + 1) {
      gsap.set(layer, { clipPath: 'inset(100% 0 0 0)', zIndex: 1 })
      return
    }
    if (i === currentIndex) {
      gsap.set(layer, {
        clipPath: `inset(0 0 ${frac * 100}% 0)`,
        zIndex: 2,
      })
      return
    }
    if (i === currentIndex + 1) {
      gsap.set(layer, {
        clipPath: `inset(${(1 - frac) * 100}% 0 0 0)`,
        zIndex: 3,
      })
    }
  })
}

function RolesAtvDesktop() {
  const [activeRole, setActiveRole] = useState<RoleId>('pensioner')
  const [eyebrowClass, setEyebrowClass] = useState(roleConfig.pensioner.theme.eyebrow)
  const pinWrapRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const bgTrackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const copyViewportRef = useRef<HTMLDivElement>(null)
  const copyTrackRef = useRef<HTMLDivElement>(null)
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)
  const activeIndexRef = useRef(0)

  const roleCount = roleIds.length
  const maxIndex = roleCount - 1

  const applyScrollProgress = (progress: number) => {
    const pin = pinRef.current
    const bgTrack = bgTrackRef.current
    const stage = stageRef.current
    const copyTrack = copyTrackRef.current
    const copyViewport = copyViewportRef.current
    if (!pin || !bgTrack || !stage || !copyTrack || !copyViewport) return

    const copyHeight = copyViewport.offsetHeight
    if (!copyHeight) return

    const position = Math.min(maxIndex, progress * maxIndex)
    const roundedIndex = Math.min(maxIndex, Math.round(position))

    const bgLayers = gsap.utils.toArray<HTMLElement>('[data-role-bg]', bgTrack)
    const slides = gsap.utils.toArray<HTMLImageElement>('[data-role-slide]', stage)
    const copyPanels = gsap.utils.toArray<HTMLElement>('[data-role-copy-panel]', copyTrack)
    const pills = pin.querySelector('[data-role-pills]') as HTMLElement | null

    applyWipeLayers(bgLayers, position)
    applyWipeLayers(slides, position)
    applyWipeLayers(copyPanels, position)

    slides.forEach((slide) => {
      gsap.set(slide, { y: 0, scale: 1.03 })
    })

    if (pills) {
      const hex = roleConfig[roleIds[roundedIndex]].theme.color
      const isLight = colorLuminance(hex) > 0.72
      gsap.set(pills, {
        backgroundColor: isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.2)',
        borderColor: isLight ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.3)',
      })
    }

    if (roundedIndex !== activeIndexRef.current) {
      activeIndexRef.current = roundedIndex
      setActiveRole(roleIds[roundedIndex])
      setEyebrowClass(roleConfig[roleIds[roundedIndex]].theme.eyebrow)
    }
  }

  const scrollToRole = (id: RoleId) => {
    const st = scrollTriggerRef.current
    if (!st) {
      setActiveRole(id)
      setEyebrowClass(roleConfig[id].theme.eyebrow)
      return
    }
    const index = roleIds.indexOf(id)
    const targetProgress = index / maxIndex
    const scrollPos = st.start + (st.end - st.start) * targetProgress
    window.scrollTo({ top: scrollPos, behavior: 'smooth' })
  }

  useEffect(() => {
    const wrap = pinWrapRef.current
    const pin = pinRef.current
    const bgTrack = bgTrackRef.current
    const stage = stageRef.current
    const copyTrack = copyTrackRef.current
    const copyViewport = copyViewportRef.current
    if (!wrap || !pin || !bgTrack || !stage || !copyTrack || !copyViewport) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      applyScrollProgress(0)
      return
    }

    const mm = window.matchMedia('(min-width: 1024px)')
    if (!mm.matches) return

    const initWipe = () => {
      const bgLayers = gsap.utils.toArray<HTMLElement>('[data-role-bg]', bgTrack)
      const slides = gsap.utils.toArray<HTMLImageElement>('[data-role-slide]', stage)
      const copyPanels = gsap.utils.toArray<HTMLElement>('[data-role-copy-panel]', copyTrack)

      bgLayers.forEach((layer, i) => {
        gsap.set(layer, {
          backgroundColor: roleConfig[roleIds[i]].theme.color,
          clipPath: i === 0 ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
          zIndex: i === 0 ? 3 : 1,
        })
      })

      slides.forEach((slide, i) => {
        gsap.set(slide, {
          y: 0,
          scale: 1.03,
          clipPath: i === 0 ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
          zIndex: i === 0 ? 3 : 1,
        })
      })

      copyPanels.forEach((panel, i) => {
        gsap.set(panel, {
          clipPath: i === 0 ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
          zIndex: i === 0 ? 3 : 1,
        })
      })
    }

    initWipe()

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: `+=${maxIndex * 100}%`,
        pin: pin,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyScrollProgress(self.progress),
      })
      scrollTriggerRef.current = st
    }, pin)

    const handleResize = () => {
      initWipe()
      ScrollTrigger.refresh()
      const st = scrollTriggerRef.current
      if (st) applyScrollProgress(st.progress)
    }

    mm.addEventListener('change', handleResize)
    window.addEventListener('resize', handleResize)

    requestAnimationFrame(() => {
      initWipe()
      ScrollTrigger.refresh()
      const st = scrollTriggerRef.current
      if (st) applyScrollProgress(st.progress)
    })

    return () => {
      mm.removeEventListener('change', handleResize)
      window.removeEventListener('resize', handleResize)
      scrollTriggerRef.current = null
      ctx.revert()
    }
  }, [])

  return (
    <div ref={pinWrapRef} className="roles-atv-pin-wrap relative hidden lg:block">
      <div ref={pinRef} className="roles-atv-pin relative h-screen overflow-hidden">
        <div ref={bgTrackRef} className="roles-atv-bg-track pointer-events-none absolute inset-0 z-0">
          {roleIds.map((roleId, i) => (
            <div
              key={roleId}
              data-role-bg={i}
              className="absolute inset-0 will-change-[clip-path]"
              style={{ backgroundColor: roleConfig[roleId].theme.color }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto grid h-full max-w-[1320px] grid-cols-[minmax(0,38%)_minmax(0,62%)]">
          <div className="flex flex-col justify-center px-10 py-12 xl:px-14">
            <p className={cn('mb-8 shrink-0 text-sm font-medium uppercase tracking-[0.25em] transition-colors duration-300', eyebrowClass)}>
              Role-Based Access
            </p>
            <div ref={copyViewportRef} className={cn('overflow-hidden', COPY_VIEWPORT_CLASS)}>
              <div ref={copyTrackRef} className="roles-atv-copy-track relative">
                {roleIds.map((roleId, i) => (
                  <div
                    key={roleId}
                    data-role-copy-panel={i}
                    className={cn('absolute inset-x-0 top-0 flex items-center', COPY_VIEWPORT_CLASS)}
                  >
                    <RoleCopyPanel roleId={roleId} animated={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="roles-atv-display-col flex items-center justify-end py-12 pl-8 pr-0">
            <RoleSlideFrame
              activeRole={activeRole}
              onSelectRole={scrollToRole}
              stageRef={stageRef}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RolesSlideMobile() {
  const [activeRole, setActiveRole] = useState<RoleId>('pensioner')
  const ref = useScrollReveal<HTMLDivElement>({ stagger: 0.08, y: 36 })

  return (
    <div ref={ref} className="px-6 lg:hidden">
      <div className="reveal-item mb-6">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-icy-blue-500">
          Role-Based Access
        </p>
        <AnimatePresence mode="wait">
          <RoleCopyPanel key={activeRole} roleId={activeRole} />
        </AnimatePresence>
      </div>

      <div className="reveal-item roles-mobile-scroll -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
        {roleIds.map((roleId) => (
          <button
            key={roleId}
            type="button"
            onClick={() => setActiveRole(roleId)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
              activeRole === roleId
                ? 'bg-foreground text-background'
                : 'border border-border bg-white text-muted-foreground',
            )}
          >
            {roleConfig[roleId].shortLabel}
          </button>
        ))}
      </div>

      <div className="reveal-item overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-black/10">
        <img
          src={roleConfig[activeRole].image}
          alt={userRoles.find((r) => r.id === activeRole)!.title}
          className="aspect-[16/10] w-full object-cover object-top"
        />
      </div>
    </div>
  )
}

export function UserRolesSection() {
  return (
    <section id="roles">
      <RolesAtvDesktop />
      <div className="section-padding bg-white pb-16 pt-8 lg:hidden">
        <RolesSlideMobile />
      </div>
    </section>
  )
}
