import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  radius: number
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
  driftX: number
  driftY: number
}

function createStars(width: number, height: number): Star[] {
  if (width <= 0 || height <= 0) return []

  const count = Math.max(60, Math.floor((width * height) / 4500))

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.5 + Math.random() * 1.6,
    baseOpacity: 0.25 + Math.random() * 0.55,
    twinkleSpeed: 0.01 + Math.random() * 0.025,
    twinklePhase: Math.random() * Math.PI * 2,
    driftX: (Math.random() - 0.5) * 0.12,
    driftY: (Math.random() - 0.5) * 0.08,
  }))
}

export function FooterStarfield() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId = 0
    let stars: Star[] = []

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width <= 0 || height <= 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      stars = createStars(width, height)
    }

    const draw = () => {
      const width = container.clientWidth
      const height = container.clientHeight

      if (width <= 0 || height <= 0 || stars.length === 0) {
        resize()
        animationId = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        star.twinklePhase += star.twinkleSpeed
        star.x += star.driftX
        star.y += star.driftY

        if (star.x < 0) star.x = width
        if (star.x > width) star.x = 0
        if (star.y < 0) star.y = height
        if (star.y > height) star.y = 0

        const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5
        const opacity = Math.min(1, star.baseOpacity * twinkle)

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} aria-hidden className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
