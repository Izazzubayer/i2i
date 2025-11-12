"use client"

import { useState } from 'react'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { CreditCard, Download, Plus, Check } from 'lucide-react'

const plans = [
  { name: 'Starter', price: '$19', credits: 500, features: ['Basic processing', 'Email support'] },
  { name: 'Pro', price: '$49', credits: 1000, features: ['Advanced processing', 'Priority support', 'API access'], current: true },
  { name: 'Enterprise', price: '$149', credits: 5000, features: ['All Pro features', 'Dedicated support', 'Custom integrations'] },
]

const invoices = [
  { id: 'INV-2025-004', date: 'Nov 01, 2025', amount: '$49.00', status: 'Paid', pdf: '#' },
  { id: 'INV-2025-003', date: 'Oct 01, 2025', amount: '$49.00', status: 'Paid', pdf: '#' },
  { id: 'INV-2025-002', date: 'Sep 01, 2025', amount: '$49.00', status: 'Paid', pdf: '#' },
]

const paymentMethods = [
  { id: '1', type: 'Visa', last4: '4242', expiry: '08/27', default: true },
]

export default function BillingPage() {
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const currentPlan = plans.find(p => p.current) || plans[1]

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice ${invoiceId}`)
  }

  const handleAddPaymentMethod = () => {
    toast.success('Payment method added successfully')
    setAddPaymentDialogOpen(false)
  }

  const handleUpgrade = (planName: string) => {
    toast.success(`Upgrading to ${planName} plan`)
    setUpgradeDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing history.
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>View your current plan details and usage status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-base px-4 py-1">
                {currentPlan.name} Plan
              </Badge>
              <span className="text-2xl font-bold">{currentPlan.price} / month</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Plan Status: <span className="text-green-600">Active</span></p>
              <p className="text-sm text-muted-foreground">
                Includes {currentPlan.credits.toLocaleString()} monthly credits
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 pt-2">
              <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Upgrade Plan</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upgrade Your Plan</DialogTitle>
                    <DialogDescription>
                      Choose a plan that best fits your needs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-4">
                    {plans.filter(p => !p.current).map((plan) => (
                      <div key={plan.name} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold">{plan.name} Plan</p>
                            <p className="text-sm text-muted-foreground">{plan.credits.toLocaleString()} credits/month</p>
                          </div>
                          <p className="text-xl font-bold">{plan.price}/mo</p>
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleUpgrade(plan.name)}
                        >
                          Upgrade to {plan.name}
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods for subscriptions.</CardDescription>
                </div>
                <Dialog open={addPaymentDialogOpen} onOpenChange={setAddPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a new credit or debit card to your account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input id="card-name" placeholder="John Doe" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddPaymentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPaymentMethod}>Add Card</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{method.type} ending in {method.last4}</p>
                      <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                    </div>
                    {method.default && (
                      <Badge variant="secondary" className="ml-2">Default</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download your payment receipts and invoices.</CardDescription>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
