import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { FaqSection } from '@/components/landing/faq-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HeroSection } from '@/components/landing/hero-section'
import { ProductShowcase } from '@/components/landing/product-showcase'
import { RecoveryFlowSection } from '@/components/landing/recovery-flow-section'
import { StatisticsSection } from '@/components/landing/statistics-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { TrustSection } from '@/components/landing/trust-section'
import { UserRolesSection } from '@/components/landing/user-roles-section'
import { WorkflowSection } from '@/components/landing/workflow-section'

export function LandingPage() {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <ProductShowcase />
        <WorkflowSection />
        <RecoveryFlowSection />
        <UserRolesSection />
        <StatisticsSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}
