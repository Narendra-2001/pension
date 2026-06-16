import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowBigRight, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { workflowVideos } from '@/assets/media'
import { HeroFlowVisual } from '@/components/landing/hero-flow-visual'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const headlineWords = ['Modern', 'Pension', 'Management', 'Platform']

export function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false)
  const demoVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = demoVideoRef.current
    if (!video) return

    if (demoOpen) {
      video.currentTime = 0
      void video.play().catch(() => undefined)
      return
    }

    video.pause()
  }, [demoOpen])

  return (
    <section className="relative overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0 mesh-gradient" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-icy-blue-200/60 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8 lg:pb-28 lg:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              size="lg"
              className="group h-auto rounded-full bg-foreground py-3 pl-6 pr-3 text-background shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:bg-foreground/90"
              asChild
            >
              <Link to="/login">
                <span className="text-sm font-semibold sm:text-base">Get Started Today</span>
                <span className="ml-3 flex size-8 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform group-hover:translate-x-0.5">
                  <ArrowBigRight className="size-4 fill-icy-blue-500 text-icy-blue-500" strokeWidth={1.5} />
                </span>
              </Link>
            </Button>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]"
          >
            {headlineWords.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className={[
                  'inline-block',
                  i === headlineWords.length - 1 ? 'text-gradient' : '',
                ].join(' ')}
              >
                {word}
                {i < headlineWords.length - 1 ? '\u00A0' : ''}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Tell us what you need — verify pensioners, process life certificates, recover
            overpayments, or track compliance. PensionFlow turns each request into a guided,
            auditable workflow.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          <HeroFlowVisual />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl border-icy-blue-200 bg-white px-6 hover:bg-icy-blue-50"
              >
                Watch Demo
                <ArrowRight className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-4xl">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Register Pensioner Demo</DialogTitle>
                <DialogDescription className="sr-only">
                  Walkthrough of registering a pensioner in PensionFlow.
                </DialogDescription>
              </DialogHeader>
              <div className="aspect-video bg-black">
                <video
                  ref={demoVideoRef}
                  src={workflowVideos.registerPensionerCapture}
                  className="size-full"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label="Register pensioner demo video"
                />
              </div>
            </DialogContent>
          </Dialog>
          <p className="text-sm text-muted-foreground">
            14-day free trial · No credit card required
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3 sm:gap-6"
        >
          {[
            {
              step: '01',
              title: 'Register & Verify',
              desc: 'Officers onboard pensioners with AI cross-checks against service records.',
            },
            {
              step: '02',
              title: 'Process & Disburse',
              desc: 'Life certificates, payments, and documents flow through one secure system.',
            },
            {
              step: '03',
              title: 'Recover & Report',
              desc: 'Excess payments are detected, recovered, and logged for full compliance.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.1 + i * 0.1 }}
              className="rounded-2xl border border-border/60 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-icy-blue-500">
                Step {item.step}
              </span>
              <h3 className="mt-2 text-sm font-semibold sm:text-base">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
