import { Link } from '@tanstack/react-router'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { useMemo, useState } from 'react'

import { BulkPaymentMonthComparison } from '@/components/admin/disbursements/bulk-payment-month-comparison'
import { AdminDetailHero, AdminPageShell } from '@/components/admin/shared/admin-detail-ui'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildPaymentMonthOptions } from '@/lib/disbursement-schema'

export function PaymentMonthComparisonPage() {
  const monthOptions = useMemo(() => buildPaymentMonthOptions(), [])
  const [paymentMonth, setPaymentMonth] = useState(monthOptions[0] ?? 'July 2026')

  return (
    <AdminPageShell>
      <AdminDetailHero
        title="Who gets paid this month?"
        subtitle="Month-over-month account and payout changes before you post disbursements"
        badges={
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <Select value={paymentMonth} onValueChange={setPaymentMonth}>
              <SelectTrigger
                id="comparison-payment-month"
                className="h-8 w-[11rem] border-0 bg-transparent px-0 shadow-none focus:ring-0"
              >
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/disbursements/bulk">
              <ArrowLeft className="size-4" /> Bulk Monthly Payment
            </Link>
          </Button>
        }
      />

      <BulkPaymentMonthComparison paymentMonth={paymentMonth} showForecast />
    </AdminPageShell>
  )
}
