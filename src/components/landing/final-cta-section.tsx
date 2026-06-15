import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'

import { FloatingParticles } from '@/components/effects/floating-particles'
import { Button } from '@/components/ui/button'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'

export function FinalCtaSection() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-icy-blue-50 via-white to-white" />
      <FloatingParticles count={20} />

      <div ref={ref} className="section-padding relative z-10">
        <div className="reveal-item mx-auto max-w-4xl text-center">
          <motion.h2
            className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready To Modernize{' '}
            <span className="text-gradient">Pension Management?</span>
          </motion.h2>
          <p className="reveal-item mx-auto mt-6 max-w-xl text-muted-foreground">
            Join government organizations already transforming their pension operations
            with PensionFlow AI.
          </p>

          <div className="reveal-item mt-10 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="rounded-2xl bg-foreground px-8 text-background hover:bg-foreground/90"
              asChild
            >
              <Link to="/login">
                Start Free Trial
                <ArrowRight />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl border-icy-blue-500 bg-white px-8 text-icy-blue-500 hover:bg-icy-blue-50"
              asChild
            >
              <Link to="/dashboard-preview">
                <Calendar />
                Schedule Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
