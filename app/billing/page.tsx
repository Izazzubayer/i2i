"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const invoices = [
  { id: 'INV-2025-004', date: 'Nov 01, 2025', amount: '$49.00', status: 'Paid' },
  { id: 'INV-2025-003', date: 'Oct 01, 2025', amount: '$49.00', status: 'Paid' },
  { id: 'INV-2025-002', date: 'Sep 01, 2025', amount: '$49.00', status: 'Paid' },
]

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Review your current plan, manage payment methods, and download invoices.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Upgrade or downgrade whenever your workflow changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">Pro Plan</Badge>
                <span className="text-2xl font-bold">$49 / month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Includes 1,000 monthly credits, unlimited collaborators, and access to API endpoints.
              </p>
              <div className="flex gap-2">
                <Button>Upgrade to Enterprise</Button>
                <Button variant="outline">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 08/27</p>
              </div>
              <Button variant="outline" className="w-full">Update Card</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Download PDF copies for your finance team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <p className="font-medium">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{invoice.amount}</span>
                  <Badge variant="secondary">{invoice.status}</Badge>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
