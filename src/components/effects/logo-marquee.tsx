import { trustLogos } from '@/data/mock-data'

export function LogoMarquee() {
  const logos = [...trustLogos, ...trustLogos]

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="animate-marquee flex w-max gap-12">
        {logos.map((logo, i) => (
          <div
            key={`${logo}-${i}`}
            className="flex h-12 shrink-0 items-center gap-3 rounded-2xl border border-border bg-white px-6 shadow-sm"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-icy-blue-50 text-xs font-bold text-icy-blue-600">
              {logo.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </div>
            <span className="whitespace-nowrap text-sm font-medium text-foreground">
              {logo}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
