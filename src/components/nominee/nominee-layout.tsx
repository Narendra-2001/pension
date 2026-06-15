import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, HelpCircle, LogOut, Phone } from 'lucide-react'

import { NomineeBackground } from '@/components/nominee/nominee-background'
import { Button } from '@/components/ui/button'
import { redirectToLogin } from '@/lib/auth'
import { clearNomineeSession, getNomineeSession } from '@/lib/nominee-auth'

export function NomineeLayout() {
  const session = getNomineeSession()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isLoginPage = pathname.endsWith('/login')

  const handleLogout = () => {
    clearNomineeSession()
    redirectToLogin()
  }

  return (
    <div className="nominee-portal relative flex min-h-screen flex-col">
      <NomineeBackground />

      <header className="relative z-10 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-icy-blue-200/60 to-transparent" />
        <div className="flex w-full items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8 xl:px-12">
          <Link to="/nominee/login" className="group flex items-center gap-3">
            <motion.div
              className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-icy-blue-500 to-indigo-600 text-white shadow-md glow-blue"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Heart className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-400" />
            </motion.div>
            <div>
              <p className="text-sm font-bold tracking-tight">Nominee Portal</p>
              <p className="text-[11px] text-muted-foreground">Demise Intimation Service</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {session && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden items-center gap-2 rounded-full border border-icy-blue-200/60 bg-icy-blue-50/80 px-3 py-1.5 dark:border-icy-blue-900/40 dark:bg-icy-blue-950/30 sm:flex"
              >
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-foreground">
                  {session.nomineeName}
                  <span className="mx-1.5 text-muted-foreground">·</span>
                  PPO {session.ppoNumber}
                </span>
              </motion.div>
            )}
            {session ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-icy-blue-200/60 hover:bg-icy-blue-50 dark:border-icy-blue-900/40 dark:hover:bg-icy-blue-950/30"
                onClick={handleLogout}
              >
                <LogOut className="mr-1.5 size-3.5" /> Logout
              </Button>
            ) : !isLoginPage ? (
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link to="/nominee/login">Login</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10 w-full min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="flex w-full flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-icy-blue-500" />
              Need help? Contact pension helpline
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Phone className="size-3.5 text-icy-blue-500" />
              1800-XXX-XXXX (Toll Free)
            </span>
          </div>
          <p>Government of India · Pension Disbursement Portal</p>
        </div>
      </footer>
    </div>
  )
}
