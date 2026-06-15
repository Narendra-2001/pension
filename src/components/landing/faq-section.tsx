import { faqItems } from '@/data/mock-data'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function FaqSection() {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <section id="faq" className="section-padding">
      <div ref={ref} className="mx-auto max-w-3xl">
        <div className="reveal-item mb-12 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-icy-blue-500">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked{' '}
            <span className="text-gradient">Questions</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="reveal-item space-y-3">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-6 shadow-sm data-[state=open]:border-icy-blue-200"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
