"use client"

import { useState } from 'react'
import Image from 'next/image'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { CreditCard, Download, Plus, Check, Calendar, Package, Loader2, Search, Filter, FileText, ExternalLink, ChevronDown, ChevronUp, MoreVertical, Printer } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const plans = [
  { name: 'Starter', price: '$19', credits: 500, features: ['Basic processing', 'Email support'] },
  { name: 'Pro', price: '$49', credits: 1000, features: ['Advanced processing', 'Priority support', 'API access'], current: true },
  { name: 'Enterprise', price: '$149', credits: 5000, features: ['All Pro features', 'Dedicated support', 'Custom integrations'] },
]

// Type removed
const invoices = [
  { 
    id: 'INV-2025-004',
    date: new Date('2025-11-01'),
    amount: 49.00,
    status: 'Paid',
    paymentMethod: 'Visa',
    paymentMethodLast4: '4242',
    plan: 'Pro',
    period: { start: new Date('2025-11-01'), end: new Date('2025-11-30') },
    pdf: '#',
    credits: 1000,
    description: 'Pro Plan - November 2025',
  },
  { 
    id: 'INV-2025-003',
    date: new Date('2025-10-01'),
    amount: 49.00,
    status: 'Paid',
    paymentMethod: 'Visa',
    paymentMethodLast4: '4242',
    plan: 'Pro',
    period: { start: new Date('2025-10-01'), end: new Date('2025-10-31') },
    pdf: '#',
    credits: 1000,
    description: 'Pro Plan - October 2025',
  },
  { 
    id: 'INV-2025-002',
    date: new Date('2025-09-01'),
    amount: 49.00,
    status: 'Paid',
    paymentMethod: 'Mastercard',
    paymentMethodLast4: '5555',
    plan: 'Pro',
    period: { start: new Date('2025-09-01'), end: new Date('2025-09-30') },
    pdf: '#',
    credits: 1000,
    description: 'Pro Plan - September 2025',
  },
  { 
    id: 'INV-2025-001',
    date: new Date('2025-08-15'),
    amount: 49.00,
    status: 'Paid',
    paymentMethod: 'Mastercard',
    paymentMethodLast4: '5555',
    plan: 'Pro',
    period: { start: new Date('2025-08-15'), end: new Date('2025-08-31') },
    pdf: '#',
    credits: 1000,
    description: 'Pro Plan - August 2025 (Partial)',
  },
  { 
    id: 'INV-2025-000',
    date: new Date('2025-07-01'),
    amount: 19.00,
    status: 'Refunded',
    paymentMethod: 'Amex',
    paymentMethodLast4: '0005',
    plan: 'Starter',
    period: { start: new Date('2025-07-01'), end: new Date('2025-07-31') },
    pdf: '#',
    credits: 500,
    description: 'Starter Plan - July 2025',
  },
]

const paymentMethods = [
  { 
    id: '1',
    type: 'Visa',
    last4: '4242',
    expiry: '08/27',
    isActive: true,
    activePeriods: [{ start: 'Nov 01, 2025', end: null }]
  },
  { 
    id: '2',
    type: 'Mastercard',
    last4: '5555',
    expiry: '12/26',
    isActive: false,
    activePeriods: [
      { start: 'Jun 01, 2025', end: 'Oct 31, 2025' }
    ]
  },
  { 
    id: '3',
    type: 'Amex',
    last4: '0005',
    expiry: '03/28',
    isActive: false,
    activePeriods: [
      { start: 'Jan 01, 2025', end: 'May 31, 2025' }
    ]
  },
  { 
    id: '4',
    type: 'Discover',
    last4: '6011',
    expiry: '09/27',
    isActive: false,
    activePeriods: [
      { start: 'Aug 01, 2024', end: 'Dec 31, 2024' }
    ]
  },
]

// Card brand logo URLs - using local files
const getCardLogoUrl = (type) => {
  const logos = {
    Visa: '/logos/visa.png',
    Mastercard: '/logos/mastercard.png',
    Amex: '/logos/amex.png',
    Discover: '/logos/discover.png',
  }
  return logos[type]
}

// Card brand logo component using actual logos from web
const CardLogo = ({ type }) => {
  return (
    <div className="relative h-8 w-12 flex items-center justify-center">
      <Image
        src={getCardLogoUrl(type)}
        alt={`${type} logo`}
        width={48}
        height={32}
        className="object-contain"
        unoptimized
      />
    </div>
  )
}

export default function BillingPage() {
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [methods, setMethods] = useState(paymentMethods)
  const [confirmActiveDialogOpen, setConfirmActiveDialogOpen] = useState(false)
  const [selectedMethodId, setSelectedMethodId] = useState(null)
  const [cvv, setCvv] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false)
  const currentPlan = plans.find(p => p.current) || plans[1]

  const handleSetActiveClick = (methodId) => {
    setSelectedMethodId(methodId)
    setCvv('')
    setConfirmActiveDialogOpen(true)
  }

  const handleConfirmSetActive = async () => {
    if (!selectedMethodId) return
    
    if (!cvv.trim()) {
      toast.error('Please enter your CVV to verify the card')
      return
    }

    if (cvv.length < 3) {
      toast.error('CVV must be at least 3 digits')
      return
    }

    setIsVerifying(true)

    // Simulate CVV verification
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsVerifying(false)

    setMethods(prev => {
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      return prev.map(method => {
        if (method.id === selectedMethodId) {
          // Set this card as active and add new active period
          const lastPeriod = method.activePeriods[method.activePeriods.length - 1]
          const updatedPeriods = lastPeriod?.end 
            ? [...method.activePeriods, { start: now, end: null }]
            : method.activePeriods.map((p, idx) => 
                idx === method.activePeriods.length - 1 ? { ...p, end: null } : p
              )
          return { ...method, isActive: true, activePeriods: updatedPeriods }
        } else if (method.isActive) {
          // Set previously active card as inactive and end its active period
          const updatedPeriods = method.activePeriods.map((p, idx) => 
            idx === method.activePeriods.length - 1 && !p.end 
              ? { ...p, end: now }
              : p
          )
          return { ...method, isActive: false, activePeriods: updatedPeriods }
        }
        return method
      })
    })
    const method = methods.find(m => m.id === selectedMethodId)
    toast.success(`${method?.type} •••• ${method?.last4} is now active`)
    setConfirmActiveDialogOpen(false)
    setSelectedMethodId(null)
    setCvv('')
  }

  const handleDownloadInvoice = (invoiceId) => {
    toast.success(`Downloading invoice ${invoiceId}`)
  }

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setInvoiceDetailsOpen(true)
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === '' || 
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const totalSpent = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0)
  const thisMonthSpent = invoices
    .filter(i => i.status === 'Paid' && i.date.getMonth() === new Date().getMonth() && i.date.getFullYear() === new Date().getFullYear())
    .reduce((sum, i) => sum + i.amount, 0)
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(i => i.status === 'Paid').length

  const handleAddPaymentMethod = () => {
    toast.success('Payment method added successfully')
    setAddPaymentDialogOpen(false)
  }

  const handleUpgrade = (planName) => {
    toast.success(`Upgrading to ${planName} plan`)
    setUpgradeDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold leading-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Manage your subscription, payment methods, and billing history.
          </p>
        </div>

        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="plan">
              Active Plan
            </TabsTrigger>
            <TabsTrigger value="payment">
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="history">
              Billing History
            </TabsTrigger>
          </TabsList>

          {/* Active Plan Tab */}
          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="leading-tight">Current Plan</CardTitle>
                <CardDescription className="leading-relaxed">View your current plan details and usage status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-base px-4 py-1">
                    {currentPlan.name} Plan
                  </Badge>
                  <span className="text-2xl font-bold">{currentPlan.price} / month</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-relaxed">Plan Status</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-relaxed">Monthly Credits</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentPlan.credits.toLocaleString()} credits included
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-relaxed">Billing Cycle</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">Monthly</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-relaxed">Next Billing Date</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">December 1, 2025</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3 leading-tight">Plan Features</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {currentPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 leading-relaxed">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Upgrade Plan</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle className="leading-tight">Choose Your Plan</DialogTitle>
                        <DialogDescription className="leading-relaxed">
                          Select the plan that best fits your needs. Your current plan is highlighted.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4 md:grid-cols-3">
                        {plans.map((plan) => {
                          const isCurrent = plan.current
                          const isDowngrade = plan.name === 'Starter' && currentPlan.name !== 'Starter'
                          const isUpgrade = !isCurrent && !isDowngrade
                          return (
                            <div 
                              key={plan.name} 
                              className={`relative border rounded-lg p-5 transition-all ${
                                isCurrent 
                                  ? 'border-2 border-primary bg-primary/5 ring-2 ring-primary/20' 
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
                              {plan.name === 'Pro' && !isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm">
                                    Popular
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
                                ) : isDowngrade ? (
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                      toast.warning('Please contact support to downgrade your plan')
                                      setUpgradeDialogOpen(false)
                                    }}
                                  >
                                    Downgrade
                                  </Button>
                                ) : (
                                  <Button
                                    className="w-full"
                                    onClick={() => handleUpgrade(plan.name)}
                                  >
                                    Upgrade to {plan.name}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground leading-relaxed">
                            <p>Need a custom plan for your team?</p>
                          </div>
                          <Button variant="link" className="p-0 h-auto" onClick={() => {
                            toast.info('Contact sales at sales@i2i.com')
                            setUpgradeDialogOpen(false)
                          }}>
                            Contact Sales
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={() => toast.warning('Cancellation feature coming soon')}>
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="leading-tight">Payment Methods</CardTitle>
                    <CardDescription className="leading-relaxed">Manage your payment methods for subscriptions and billing.</CardDescription>
                  </div>
                  <Dialog open={addPaymentDialogOpen} onOpenChange={setAddPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
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
                            <Input id="cvv" placeholder="123" type="password" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card-name">Cardholder Name</Label>
                          <Input id="card-name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-address">Billing Address</Label>
                          <Input id="billing-address" placeholder="123 Main St" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="San Francisco" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input id="zip" placeholder="94102" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select>
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="us">United States</SelectItem>
                              <SelectItem value="uk">United Kingdom</SelectItem>
                              <SelectItem value="ca">Canada</SelectItem>
                              <SelectItem value="au">Australia</SelectItem>
                            </SelectContent>
                          </Select>
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
              <CardContent className="space-y-4">
                {methods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payment methods added yet.</p>
                    <p className="text-sm mt-2">Add a payment method to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active Card */}
                    {methods
                      .filter(method => method.isActive)
                      .map((method) => (
                        <div 
                          key={method.id} 
                          className="border-2 border-primary rounded-lg p-5 bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <CardLogo type={method.type} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-lg">{method.type} •••• {method.last4}</p>
                                  <Badge className="bg-green-600 text-white">Active</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                                {method.activePeriods.map((period, idx) => (
                                  <div key={idx} className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      Active since {period.start}
                                      {period.end && ` until ${period.end}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toast.warning('Remove card feature coming soon')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {/* Inactive Cards */}
                    {methods
                      .filter(method => !method.isActive)
                      .map((method) => (
                        <div 
                          key={method.id} 
                          className="border rounded-lg p-5 bg-muted/30 hover:bg-muted/50 transition-colors opacity-75"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex-shrink-0 opacity-60">
                                <CardLogo type={method.type} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{method.type} •••• {method.last4}</p>
                                  <Badge variant="secondary" className="bg-gray-500 text-white">Inactive</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                                <div className="mt-2 space-y-1">
                                  {method.activePeriods.map((period, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        Was active from {period.start} to {period.end || 'present'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSetActiveClick(method.id)}
                              >
                                Set Active
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toast.warning('Remove card feature coming soon')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confirm Set Active Dialog */}
            <Dialog open={confirmActiveDialogOpen} onOpenChange={(open) => {
              setConfirmActiveDialogOpen(open)
              if (!open) {
                setCvv('')
                setSelectedMethodId(null)
              }
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verify Card to Set Active</DialogTitle>
                  <DialogDescription>
                    {selectedMethodId && (() => {
                      const method = methods.find(m => m.id === selectedMethodId)
                      const currentActive = methods.find(m => m.isActive)
                      return (
                        <>
                          Please verify your <strong>{method?.type} •••• {method?.last4}</strong> card to set it as active.
                          {currentActive && (
                            <span className="block mt-2 text-sm">
                              This will deactivate <strong>{currentActive.type} •••• {currentActive.last4}</strong>.
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {selectedMethodId && (() => {
                    const method = methods.find(m => m.id === selectedMethodId)
                    return (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <CardLogo type={method?.type || 'Visa'} />
                            </div>
                            <div>
                              <p className="font-medium">{method?.type} •••• {method?.last4}</p>
                              <p className="text-sm text-muted-foreground">Expires {method?.expiry}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="verify-cvv">CVV</Label>
                          <Input
                            id="verify-cvv"
                            type="password"
                            placeholder="Enter CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            autoComplete="off"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter the 3-4 digit security code on the back of your card
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setConfirmActiveDialogOpen(false)
                      setSelectedMethodId(null)
                      setCvv('')
                    }}
                    disabled={isVerifying}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmSetActive}
                    disabled={isVerifying || !cvv.trim()}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Set Active'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* Main Billing History Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="leading-tight">Billing History</CardTitle>
                    <CardDescription className="leading-relaxed">View and manage your payment receipts and invoices.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info('Exporting all invoices...')}>
                      <Download className="mr-2 h-4 w-4" />
                      Export All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Invoice List */}
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No invoices found</p>
                    <p className="text-sm mt-2">
                      {searchQuery || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Your invoices will appear here once you have billing activity'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {filteredInvoices.map((invoice) => {
                        const statusColors = {
                          Paid: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
                          Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800',
                          Failed: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
                          Refunded: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800',
                        }
                        return (
                          <div 
                            key={invoice.id} 
                            className="group border rounded-lg p-4 hover:bg-muted/50 transition-all cursor-pointer"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 rounded-lg bg-muted group-hover:bg-muted-foreground/10 transition-colors">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <p className="font-semibold leading-tight">{invoice.id}</p>
                                    <Badge variant="outline" className={statusColors[invoice.status]}>
                                      {invoice.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground leading-relaxed">
                                    <span>{format(invoice.date, 'MMM dd, yyyy')}</span>
                                    <span>•</span>
                                    <span>{invoice.plan} Plan</span>
                                    <span>•</span>
                                    <span className="text-xs">{invoice.paymentMethod} •••• {invoice.paymentMethodLast4}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-semibold text-lg leading-tight">${invoice.amount.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{invoice.credits.toLocaleString()} credits</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDownloadInvoice(invoice.id)
                                    }}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                      </span>
                      {filteredInvoices.length < invoices.length && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSearchQuery('')
                          setStatusFilter('all')
                        }}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Invoice Details Dialog */}
            <Dialog open={invoiceDetailsOpen} onOpenChange={setInvoiceDetailsOpen}>
              <DialogContent className="max-w-2xl">
                {selectedInvoice && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="leading-tight">
                        {selectedInvoice.id}
                      </DialogTitle>
                      <DialogDescription className="leading-relaxed">
                        Invoice dated {format(selectedInvoice.date, 'MMMM dd, yyyy')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Amount</p>
                          <p className="text-2xl font-bold leading-tight">${selectedInvoice.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Status</p>
                          <Badge variant="outline" className={
                            selectedInvoice.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800' :
                            selectedInvoice.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800' :
                            selectedInvoice.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800' :
                            'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800'
                          }>
                            {selectedInvoice.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Plan</p>
                          <p className="text-lg font-semibold leading-tight">{selectedInvoice.plan}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Billing Period</p>
                          <p className="text-sm leading-relaxed">
                            {format(selectedInvoice.period.start, 'MMM dd, yyyy')} - {format(selectedInvoice.period.end, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Credits Included</p>
                          <p className="text-sm font-semibold leading-relaxed">{selectedInvoice.credits.toLocaleString()} credits</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Payment Method</p>
                          <div className="flex items-center gap-2">
                            <CardLogo type={selectedInvoice.paymentMethod} />
                            <span className="text-sm leading-relaxed">{selectedInvoice.paymentMethod} •••• {selectedInvoice.paymentMethodLast4}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Date</p>
                          <p className="text-sm leading-relaxed">{format(selectedInvoice.date, 'MMMM dd, yyyy')}</p>
                        </div>
                      </div>
                      {selectedInvoice.description && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1.5 leading-tight">Description</p>
                          <p className="text-sm leading-relaxed">{selectedInvoice.description}</p>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button variant="outline" onClick={() => {
                        toast.info('Printing invoice...')
                      }}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button onClick={() => setInvoiceDetailsOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
