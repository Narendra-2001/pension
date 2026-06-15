import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

export function useCounter(
  end: number,
  options?: { duration?: number; decimals?: number; suffix?: string; prefix?: string },
) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(`${options?.prefix ?? ''}0${options?.suffix ?? ''}`)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obj = { value: 0 }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          if (hasAnimated.current) return
          hasAnimated.current = true

          gsap.to(obj, {
            value: end,
            duration: options?.duration ?? 2,
            ease: 'power2.out',
            onUpdate: () => {
              const val =
                options?.decimals !== undefined
                  ? obj.value.toFixed(options.decimals)
                  : Math.floor(obj.value).toLocaleString()
              setDisplay(`${options?.prefix ?? ''}${val}${options?.suffix ?? ''}`)
            },
          })
        },
      })
    }, el)

    return () => ctx.revert()
  }, [end, options?.duration, options?.decimals, options?.suffix, options?.prefix])

  return { ref, display }
}
