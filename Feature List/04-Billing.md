# Billing & Subscription

**Feature 3: Billing, Payment Methods, Subscription Management (NON-FUNCTIONAL)**

This document covers the billing and subscription features for the i2i platform, including payment processing via Stripe.

---

## Implementation Status

**Status:** NON-FUNCTIONAL (UI Ready, Backend Integration Needed)

The UI components are implemented, but payment processing integration with Stripe requires:
- Stripe account setup
- API key configuration
- Webhook endpoints
- Testing with Stripe test mode

---

## Implementation Files

- `app/billing/page.tsx` - Billing dashboard
- `components/billing/*` - Billing components
- `app/api/billing/*` - Billing API routes
- `services/payment/stripe.ts` - Stripe integration

---

## Features Overview

### 1. Current Plan Display
- Show active subscription tier
- Display remaining credits/tokens
- Show renewal date
- Usage statistics

### 2. Payment Methods
- Add credit/debit cards
- Manage saved payment methods
- Set default payment method
- Remove payment methods

### 3. Plan Upgrades
- View available plans
- Compare plan features
- Upgrade/downgrade subscription
- Calculate prorated charges

### 4. Payment History
- Transaction history table
- Download invoices
- View payment status
- Filter by date range

---

## Subscription Plans

### Free Tier
- **Price:** $0/month
- **Credits:** 100 images/month
- **Features:**
  - Basic image processing
  - Standard support
  - 7-day order history

### Pro Tier
- **Price:** $49/month
- **Credits:** 1,000 images/month
- **Features:**
  - Advanced image processing
  - Priority support
  - 90-day order history
  - DAM integration
  - API access

### Enterprise Tier
- **Price:** $199/month
- **Credits:** Unlimited
- **Features:**
  - Everything in Pro
  - Dedicated support
  - Unlimited order history
  - Custom integrations
  - SLA guarantee
  - White-label option

---

## Stripe Integration

### Setup

```typescript
// services/payment/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Create customer
export async function createCustomer(email: string, name: string) {
  return await stripe.customers.create({ 
    email, 
    name,
    metadata: {
      platform: 'i2i'
    }
  })
}

// Create checkout session for subscription
export async function createCheckoutSession(
  userId: string, 
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: userId,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId
    }
  })
  
  return session.url
}

// Create subscription
export async function createSubscription(
  customerId: string,
  priceId: string
) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent']
  })
}

// Update subscription (upgrade/downgrade)
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations'
  })
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
) {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId)
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
  }
}

// Get payment history
export async function getPaymentHistory(customerId: string) {
  const charges = await stripe.charges.list({
    customer: customerId,
    limit: 100
  })
  
  return charges.data.map(charge => ({
    id: charge.id,
    amount: charge.amount / 100, // Convert cents to dollars
    currency: charge.currency.toUpperCase(),
    date: new Date(charge.created * 1000),
    status: charge.status,
    description: charge.description,
    receiptUrl: charge.receipt_url
  }))
}

// Get invoices
export async function getInvoices(customerId: string) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 100
  })
  
  return invoices.data.map(invoice => ({
    id: invoice.id,
    number: invoice.number,
    amount: invoice.amount_paid / 100,
    status: invoice.status,
    date: new Date(invoice.created * 1000),
    pdfUrl: invoice.invoice_pdf
  }))
}
```

---

## API Endpoints

### Get Current Plan
```typescript
// app/api/billing/current/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true
    }
  })

  return NextResponse.json({
    plan: user.subscription?.plan || 'free',
    status: user.subscription?.status || 'active',
    creditsRemaining: user.subscription?.creditsRemaining || 0,
    renewalDate: user.subscription?.currentPeriodEnd
  })
}
```

### Create Checkout Session
```typescript
// app/api/billing/checkout/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { priceId } = await request.json()

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  // Create or get Stripe customer
  let stripeCustomerId = user.stripeCustomerId
  if (!stripeCustomerId) {
    const customer = await createCustomer(user.email, user.name)
    stripeCustomerId = customer.id
    
    await db.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id }
    })
  }

  // Create checkout session
  const checkoutUrl = await createCheckoutSession(
    stripeCustomerId,
    priceId,
    `${process.env.NEXTAUTH_URL}/billing?success=true`,
    `${process.env.NEXTAUTH_URL}/billing?canceled=true`
  )

  return NextResponse.json({ url: checkoutUrl })
}
```

### Payment Methods
```typescript
// app/api/billing/payment-methods/route.ts

// List payment methods
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  const paymentMethods = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: 'card'
  })

  return NextResponse.json({
    paymentMethods: paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === user.defaultPaymentMethodId
    }))
  })
}

// Delete payment method
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { paymentMethodId } = await request.json()

  await stripe.paymentMethods.detach(paymentMethodId)

  return NextResponse.json({ success: true })
}
```

### Payment History
```typescript
// app/api/billing/history/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  const history = await getPaymentHistory(user.stripeCustomerId)

  return NextResponse.json({ history })
}
```

---

## Webhook Handling

### Setup Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object)
      break
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break
    
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
    
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object)
      break
    
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
    
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!user) return

  // Create subscription record
  await db.subscription.create({
    data: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      plan: determinePlanTier(subscription.items.data[0].price.id),
      creditsRemaining: getCreditsForPlan(subscription.items.data[0].price.id)
    }
  })

  // Send welcome email
  await sendEmail({
    to: user.email,
    template: 'subscription-created',
    data: { name: user.name, plan: determinePlanTier(subscription.items.data[0].price.id) }
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Log successful payment
  // Send receipt email
  // Update credits if applicable
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Notify user of failed payment
  // Send email with payment update link
}
```

---

## UI Components

### Plan Selector

```typescript
// components/billing/PlanSelector.tsx
const plans = [
  {
    name: 'Free',
    price: 0,
    credits: 100,
    features: ['Basic processing', 'Standard support', '7-day history']
  },
  {
    name: 'Pro',
    price: 49,
    priceId: 'price_pro_monthly',
    credits: 1000,
    features: ['Advanced processing', 'Priority support', '90-day history', 'DAM integration']
  },
  {
    name: 'Enterprise',
    price: 199,
    priceId: 'price_enterprise_monthly',
    credits: 'Unlimited',
    features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA']
  }
]

export function PlanSelector() {
  const handleUpgrade = async (priceId: string) => {
    const { data } = await api.post('/billing/checkout', { priceId })
    window.location.href = data.url
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {plans.map(plan => (
        <Card key={plan.name}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              ${plan.price}
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleUpgrade(plan.priceId)}
              className="w-full mt-4"
            >
              Upgrade to {plan.name}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

## Environment Variables

```env
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from Stripe Dashboard)
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
```

---

## Testing Checklist

### Payment Flow
- [ ] Stripe checkout session creates successfully
- [ ] Payment methods save correctly
- [ ] Subscription activates after payment
- [ ] Credits added to account
- [ ] Receipt email sent

### Subscription Management
- [ ] Can upgrade plan
- [ ] Can downgrade plan (with proration)
- [ ] Can cancel subscription
- [ ] Renewal happens automatically
- [ ] Failed payment handled gracefully

### Webhooks
- [ ] Webhook signature validates
- [ ] All event types handled
- [ ] Database updates correctly
- [ ] Email notifications sent

---

**Previous:** [← User Management](./03-User-Management.md) | **Next:** [Image Processing Workflow →](./05-Image-Processing-Workflow.md)

