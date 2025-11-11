"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const packages = [
  { credits: 250, price: '$25', popular: false },
  { credits: 750, price: '$70', popular: true },
  { credits: 1500, price: '$130', popular: false },
]

const usage = [
  { id: 'ORD-2024-001', name: 'Product Catalog 2024', credits: 120 },
  { id: 'ORD-2024-002', name: 'Marketing Campaign', credits: 45 },
  { id: 'ORD-2024-003', name: 'Social Media Content', credits: 30 },
]

export default function TokensPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tokens & Credits</h1>
            <p className="text-muted-foreground">
              Monitor remaining credits and purchase top-ups for your next batch of jobs.
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-base px-4 py-1">
            250 credits remaining
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.credits} className={pkg.popular ? 'border-blue-500' : ''}>
              <CardHeader>
                <CardTitle>{pkg.credits} credits</CardTitle>
                <CardDescription>Includes priority processing for large batches.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold">{pkg.price}</div>
                {pkg.popular && <Badge variant="secondary">Most Popular</Badge>}
                <Button className="w-full">Purchase</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Usage</CardTitle>
            <CardDescription>Credits applied to recent orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usage.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <p className="font-medium">{entry.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.id}</p>
                </div>
                <span className="font-semibold">-{entry.credits} credits</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
