import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { FooterStarfield } from '@/components/effects/footer-starfield'
import { FooterWatermark } from '@/components/effects/footer-watermark'

const benefits = [
  'Automated pension recovery workflows',
  'Real-time audit trails & compliance',
  'Multi-role dashboards for every department',
  'AI-powered anomaly detection',
  'Secure government-grade infrastructure',
  '24/7 system availability & support',
]

const stats = [
  { value: '50K+', label: 'Pensioners managed' },
  { value: '500+', label: 'Recovery cases processed' },
  { value: '99.9%', label: 'Data accuracy rate' },
]

const quickAccessLinks = [
  [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
  ],
  [
    { label: 'Dashboard', href: '/dashboard-preview' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#' },
  ],
]

const footerBounce = { type: 'spring' as const, stiffness: 260, damping: 16, mass: 0.9 }
const footerBounceSoft = { type: 'spring' as const, stiffness: 200, damping: 20, mass: 1 }

export function Footer() {
  return (
    <footer className="w-full">
      <motion.div
        className="footer-shell relative w-full overflow-hidden bg-black"
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, mass: 1.1 }}
      >
        {/* CTA + stats */}
        <div className="relative z-10 w-full px-6 pt-16 pb-12 sm:px-8 sm:pt-20 sm:pb-16 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid w-full gap-12 sm:gap-16 lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={footerBounce}
            >
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                Ready to modernize pension management?{' '}
                <span className="text-[#60a5fa]">Join 500+ organizations.</span>
              </h2>
              <ul className="mt-10 space-y-4">
                {benefits.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -16, y: 8 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...footerBounceSoft, delay: index * 0.05 }}
                    className="flex items-center gap-3.5"
                  >
                    <span className="footer-check-icon flex size-[22px] shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3.5 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium text-white sm:text-base">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...footerBounce, delay: 0.08 }}
              className="flex flex-col justify-center lg:items-end"
            >
              <div className="grid w-full max-w-md grid-cols-2 gap-x-8 gap-y-10 sm:max-w-lg lg:max-w-none lg:grid-cols-2">
                {stats.slice(0, 2).map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 24, scale: 0.92 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...footerBounce, delay: 0.12 + index * 0.06 }}
                  >
                    <p className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm text-white/50">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                className="mt-10"
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...footerBounce, delay: 0.24 }}
              >
                <p className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                  {stats[2].value}
                </p>
                <p className="mt-2 text-sm text-white/50">{stats[2].label}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom bar — CodeGuide 3D style */}
        <div className="footer-bottom relative pb-11 sm:pb-[45px]">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <FooterStarfield />

            <div className="footer-glow absolute inset-x-0 bottom-0">
              <svg
                className="h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 1440 500"
                fill="none"
              >
                <defs>
                  <radialGradient
                    id="footerGlow"
                    cx="50%"
                    cy="100%"
                    r="65%"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
                    <stop offset="45%" stopColor="rgba(59,130,246,0.12)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                  </radialGradient>
                  <linearGradient id="footerGlowLine" x1="0" y1="0" x2="1440" y2="0">
                    <stop offset="0%" stopColor="rgba(59,130,246,0)" />
                    <stop offset="50%" stopColor="rgba(96,165,250,0.35)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                  </linearGradient>
                </defs>
                <rect width="1440" height="500" fill="url(#footerGlow)" />
                <rect y="480" width="1440" height="2" fill="url(#footerGlowLine)" />
              </svg>
            </div>
          </div>

          <motion.div
            className="relative z-[1]"
            initial={{ opacity: 0, y: 36, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 140, damping: 12, mass: 1.2 }}
          >
            <FooterWatermark text="PENSIONFLOW" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...footerBounceSoft, delay: 0.1 }}
            className="relative z-10 flex w-full flex-col gap-12 px-6 pt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-[60px] sm:px-8 sm:pt-10 lg:px-12 xl:px-16 2xl:px-20"
          >
            <div>
              <Link to="/" className="inline-flex items-center gap-5 text-white">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-icy-blue-500 to-icy-blue-600 shadow-lg glow-blue sm:size-16">
                  <span className="text-base font-bold text-white sm:text-lg">PF</span>
                </div>
                <span className="text-3xl font-bold tracking-tight sm:text-4xl">
                  PensionFlow <span className="text-icy-blue-400">AI</span>
                </span>
              </Link>
              <p className="mt-5 text-sm text-white/50">
                © 2026 PensionFlow AI. All rights reserved.
              </p>
            </div>

            <div className="flex flex-wrap justify-between gap-10 sm:gap-[60px]">
              {quickAccessLinks.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-2">
                  <span
                    className={`mb-2 text-base font-semibold text-white ${colIndex === 1 ? 'opacity-0 max-sm:hidden' : ''}`}
                  >
                    Quick Access
                  </span>
                  <ul className="flex flex-col gap-2">
                    {column.map((link) => (
                      <li key={link.label}>
                        {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                          <Link
                            to={link.href}
                            className="text-base capitalize text-white/70 transition-colors hover:text-white"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="text-base capitalize text-white/70 transition-colors hover:text-white"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  )
}
