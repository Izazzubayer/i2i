"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { TrendingUp, Check, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'

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

const plans = [
  { name: 'Starter', price: '$19', credits: 500, features: ['Basic processing', 'Email support'] },
  { name: 'Pro', price: '$49', credits: 1000, features: ['Advanced processing', 'Priority support', 'API access'], current: true },
  { name: 'Enterprise', price: '$149', credits: 5000, features: ['All Pro features', 'Dedicated support', 'Custom integrations'] },
]

export default function TokensPage() {
  const router = useRouter()
  const usagePercentage = (currentPlan.usedCredits / currentPlan.monthlyCredits) * 100
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)

  const currentPlanData = plans.find(p => p.current)
  const isDowngrade = selectedPlan && currentPlanData && selectedPlan.credits < currentPlanData.credits

  const handlePlanClick = (plan: typeof plans[0]) => {
    setSelectedPlan(plan)
    setConfirmDialogOpen(true)
  }

  const handleConfirmChange = () => {
    if (!selectedPlan) return
    
    if (isDowngrade) {
      toast.success(`Downgrade to ${selectedPlan.name} plan initiated. Changes will take effect at the end of your billing cycle.`)
    } else {
      toast.success(`Upgrading to ${selectedPlan.name} plan. Redirecting to billing...`)
      router.push('/billing')
    }
    setConfirmDialogOpen(false)
    setSelectedPlan(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold leading-tight">Usage Status & Credits</h1>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Monitor your plan usage and upgrade for more credits.
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
                <Button className="w-full" onClick={() => router.push('/billing')}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="leading-tight">Available Plans</CardTitle>
            <CardDescription className="leading-relaxed">
              Upgrade your plan to get more monthly credits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent = plan.current
                return (
                  <div 
                    key={plan.name} 
                    className={`relative border rounded-lg p-5 transition-all ${
                      isCurrent 
                        ? 'border-2 border-primary bg-primary/5' 
                        : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground shadow-sm">
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    <div className="text-center mb-4 pt-2">
                      <h3 className="font-bold text-lg leading-tight">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold leading-tight">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {plan.credits.toLocaleString()} credits/month
                      </p>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t">
                      {isCurrent ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handlePlanClick(plan)}
                        >
                          {plan.name === 'Starter' ? 'Downgrade' : 'Upgrade'} to {plan.name}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
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

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={(open) => {
          setConfirmDialogOpen(open)
          if (!open) setSelectedPlan(null)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 leading-tight">
                {isDowngrade ? (
                  <>
                    <ArrowDown className="h-5 w-5 text-orange-500" />
                    Confirm Downgrade
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-5 w-5 text-green-500" />
                    Confirm Upgrade
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="leading-relaxed">
                {isDowngrade 
                  ? 'Please review the changes before downgrading your plan.'
                  : 'Please review the changes before upgrading your plan.'
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlan && (
              <div className="py-4 space-y-4">
                {/* Plan Change Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                    <p className="font-semibold">{currentPlanData?.name}</p>
                    <p className="text-sm text-muted-foreground">{currentPlanData?.price}/month</p>
                    <p className="text-xs text-muted-foreground mt-1">{currentPlanData?.credits.toLocaleString()} credits</p>
                  </div>
                  <div className={`p-4 border-2 rounded-lg ${isDowngrade ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-green-500 bg-green-50 dark:bg-green-950/20'}`}>
                    <p className="text-xs text-muted-foreground mb-1">New Plan</p>
                    <p className="font-semibold">{selectedPlan.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedPlan.price}/month</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedPlan.credits.toLocaleString()} credits</p>
                  </div>
                </div>

                {/* Warning for downgrade */}
                {isDowngrade && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-700 dark:text-orange-400">Important Notice</p>
                      <p className="text-orange-600 dark:text-orange-300 leading-relaxed mt-1">
                        Downgrading will reduce your monthly credits from {currentPlanData?.credits.toLocaleString()} to {selectedPlan.credits.toLocaleString()}. 
                        This change will take effect at the start of your next billing cycle.
                      </p>
                    </div>
                  </div>
                )}

                {/* Benefits for upgrade */}
                {!isDowngrade && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="font-medium text-green-700 dark:text-green-400 text-sm mb-2">What you&apos;ll get:</p>
                    <ul className="space-y-1">
                      {selectedPlan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-300">
                          <Check className="h-4 w-4 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-sm text-green-600 dark:text-green-300">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span>{selectedPlan.credits.toLocaleString()} credits per month</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setConfirmDialogOpen(false)
                  setSelectedPlan(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmChange}
                className={isDowngrade ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                {isDowngrade ? 'Confirm Downgrade' : 'Confirm Upgrade'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
