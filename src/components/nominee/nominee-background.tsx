import { motion } from 'framer-motion'

export function NomineeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Layered aurora + soft dotted grid */}
      <div className="nominee-aurora absolute inset-0" />
      <div className="nominee-grid absolute inset-0 opacity-70" />

      {/* Drifting colour orbs */}
      <motion.div
        className="absolute -left-28 top-24 size-80 rounded-full bg-icy-blue-300/25 blur-[90px] dark:bg-icy-blue-600/20"
        animate={{ x: [0, 40, 0], y: [0, -24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 top-52 size-64 rounded-full bg-indigo-300/25 blur-[80px] dark:bg-indigo-700/20"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-16 left-1/3 size-56 rounded-full bg-icy-blue-200/30 blur-[80px] dark:bg-icy-blue-900/30"
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <FloatingParticles />
    </div>
  )
}

function FloatingParticles() {
  const dots = [
    { left: '8%', top: '20%', delay: 0, size: 'size-1.5' },
    { left: '92%', top: '24%', delay: 0.8, size: 'size-1' },
    { left: '15%', top: '70%', delay: 1.4, size: 'size-2' },
    { left: '80%', top: '66%', delay: 0.4, size: 'size-1.5' },
    { left: '46%', top: '10%', delay: 2, size: 'size-1' },
    { left: '64%', top: '86%', delay: 1.2, size: 'size-1.5' },
    { left: '30%', top: '40%', delay: 2.4, size: 'size-1' },
    { left: '88%', top: '46%', delay: 0.6, size: 'size-1' },
  ]

  return (
    <>
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className={`absolute ${dot.size} rounded-full bg-icy-blue-400/50 shadow-[0_0_8px_rgba(56,189,248,0.6)] dark:bg-icy-blue-400/40`}
          style={{ left: dot.left, top: dot.top }}
          animate={{ opacity: [0.15, 0.75, 0.15], y: [0, -18, 0] }}
          transition={{
            duration: 4 + i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: dot.delay,
          }}
        />
      ))}
    </>
  )
}
