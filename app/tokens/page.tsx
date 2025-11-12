"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { TrendingUp, Zap } from 'lucide-react'

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

const currentPlan = {
  name: 'Pro Plan',
  monthlyCredits: 1000,
  usedCredits: 750,
  remainingCredits: 250,
  status: 'Active',
}

export default function TokensPage() {
  const usagePercentage = (currentPlan.usedCredits / currentPlan.monthlyCredits) * 100

  const handlePurchase = (credits: number, price: string) => {
    toast.success(`Purchasing ${credits} credits for ${price}`)
  }

  const handleUpgrade = () => {
    toast.info('Redirecting to upgrade page')
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold">Usage Status & Credits</h1>
          <p className="text-muted-foreground">
            Monitor your plan usage and purchase additional credits.
          </p>
        </div>

        {/* Usage Status Counter */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>Your current subscription plan information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-2xl font-bold">{currentPlan.name}</p>
                </div>
                <Badge className="bg-green-600">{currentPlan.status}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Credits</span>
                  <span className="font-medium">{currentPlan.monthlyCredits.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used Credits</span>
                  <span className="font-medium">{currentPlan.usedCredits.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Credits</span>
                  <span className="font-medium text-green-600">{currentPlan.remainingCredits.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Status</CardTitle>
              <CardDescription>Track your credit usage for the current billing period.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage Progress</span>
                  <span className="font-medium">{Math.round(usagePercentage)}%</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{currentPlan.usedCredits.toLocaleString()} used</span>
                  <span>{currentPlan.monthlyCredits.toLocaleString()} total</span>
                </div>
              </div>
              <div className="pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade Plan / Purchase Credits
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Purchase Credits</DialogTitle>
                      <DialogDescription>
                        Buy additional credits or upgrade your plan for more monthly credits.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-4">
                      {packages.map((pkg) => (
                        <div key={pkg.credits} className="flex items-center justify-between border rounded-lg p-4">
                          <div>
                            <p className="font-semibold">{pkg.credits} Credits</p>
                            <p className="text-sm text-muted-foreground">{pkg.price}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(pkg.credits, pkg.price)}
                          >
                            Purchase
                          </Button>
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <Button variant="outline" className="w-full" onClick={handleUpgrade}>
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Additional Credits</CardTitle>
            <CardDescription>
              Buy credit packages to top up your account for additional processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.credits} className={pkg.popular ? 'border-blue-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{pkg.credits} credits</CardTitle>
                      {pkg.popular && <Badge variant="secondary">Most Popular</Badge>}
                    </div>
                    <CardDescription>One-time purchase</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">{pkg.price}</div>
                    <Button
                      className="w-full"
                      onClick={() => handlePurchase(pkg.credits, pkg.price)}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Usage */}
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
                <span className="font-semibold text-destructive">-{entry.credits} credits</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
