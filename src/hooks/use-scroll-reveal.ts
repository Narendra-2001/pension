import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal<T extends HTMLElement>(
  options?: { y?: number; stagger?: number; start?: string },
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = el.querySelectorAll('.reveal-item')
    const targets = children.length > 0 ? children : [el]

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: options?.y ?? 60,
        opacity: 0,
        duration: 0.8,
        stagger: options?.stagger ?? 0.1,
        ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: options?.start ?? 'top 85%',
          once: true,
        },
      })
    }, el)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [options?.y, options?.stagger, options?.start])

  return ref
}

export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: () => speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, el)

    return () => ctx.revert()
  }, [speed])

  return ref
}
