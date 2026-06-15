import { motion } from 'framer-motion'
import { Shield, Users, FileCheck, TrendingUp } from 'lucide-react'

const items = [
  { icon: Shield, label: 'Secure Access', x: '10%', y: '15%' },
  { icon: Users, label: '50K+ Pensioners', x: '70%', y: '20%' },
  { icon: FileCheck, label: 'Verified', x: '15%', y: '65%' },
  { icon: TrendingUp, label: '99.9% Accuracy', x: '65%', y: '70%' },
]

export function AuthIllustration() {
  return (
    <div className="relative hidden h-full overflow-hidden lg:block">
      <div className="mesh-gradient absolute inset-0" />
      <FloatingParticles count={25} />

      <div className="relative z-10 flex h-full flex-col justify-center p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold tracking-tight">
            Secure Government
            <br />
            <span className="text-gradient">Pension Platform</span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Access your pension dashboard with enterprise-grade security and
            role-based permissions.
          </p>
        </motion.div>

        <div className="relative mt-16 h-64">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              className="absolute flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-md"
              style={{ left: item.x, top: item.y }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            >
              <item.icon className="size-5 text-icy-blue-500" />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <div className="size-32 rounded-full border border-icy-blue-200 bg-icy-blue-50" />
          </motion.div>
          <div className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-icy-blue-500 to-icy-blue-600 shadow-xl glow-blue">
            <span className="text-xl font-bold text-white">PF</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FloatingParticles({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-1 rounded-full bg-icy-blue-500/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -20, 0] }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  )
}
