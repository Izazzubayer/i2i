"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Check, X, Zap, Building2, Rocket, HelpCircle, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    monthlyPrice: 19,
    yearlyPrice: 190,
    credits: 500,
    icon: Zap,
    popular: false,
    features: [
      { name: 'AI Image Processing', included: true },
      { name: '500 credits/month', included: true },
      { name: 'Basic background removal', included: true },
      { name: 'Standard quality output', included: true },
      { name: 'Email support', included: true },
      { name: '48h response time', included: true },
      { name: 'API access', included: false },
      { name: 'Priority processing', included: false },
      { name: 'Custom integrations', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro',
    description: 'Best for growing businesses and teams',
    monthlyPrice: 49,
    yearlyPrice: 490,
    credits: 1000,
    icon: Rocket,
    popular: true,
    features: [
      { name: 'AI Image Processing', included: true },
      { name: '1,000 credits/month', included: true },
      { name: 'Advanced background removal', included: true },
      { name: 'High quality output', included: true },
      { name: 'Priority email support', included: true },
      { name: '24h response time', included: true },
      { name: 'API access', included: true },
      { name: 'Priority processing', included: true },
      { name: 'Custom integrations', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    monthlyPrice: 149,
    yearlyPrice: 1490,
    credits: 5000,
    icon: Building2,
    popular: false,
    features: [
      { name: 'AI Image Processing', included: true },
      { name: '5,000 credits/month', included: true },
      { name: 'Premium background removal', included: true },
      { name: 'Ultra-high quality output', included: true },
      { name: 'Dedicated support channel', included: true },
      { name: '4h response time', included: true },
      { name: 'Full API access', included: true },
      { name: 'Priority processing', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
  },
]

const comparisonFeatures = [
  { 
    category: 'Processing',
    features: [
      { name: 'Monthly credits', starter: '500', pro: '1,000', enterprise: '5,000' },
      { name: 'Image quality', starter: 'Standard', pro: 'High', enterprise: 'Ultra-high' },
      { name: 'Processing speed', starter: 'Standard', pro: 'Priority', enterprise: 'Priority' },
      { name: 'Batch processing', starter: 'Up to 50', pro: 'Up to 200', enterprise: 'Unlimited' },
      { name: 'File formats', starter: 'JPG, PNG', pro: 'JPG, PNG, WebP', enterprise: 'All formats' },
    ]
  },
  {
    category: 'Features',
    features: [
      { name: 'Background removal', starter: 'Basic', pro: 'Advanced', enterprise: 'Premium' },
      { name: 'Image enhancement', starter: true, pro: true, enterprise: true },
      { name: 'Color correction', starter: false, pro: true, enterprise: true },
      { name: 'Custom presets', starter: false, pro: true, enterprise: true },
      { name: 'White-label exports', starter: false, pro: false, enterprise: true },
    ]
  },
  {
    category: 'Integration',
    features: [
      { name: 'API access', starter: false, pro: true, enterprise: true },
      { name: 'API rate limit', starter: '-', pro: '100 req/min', enterprise: '1000 req/min' },
      { name: 'Webhooks', starter: false, pro: true, enterprise: true },
      { name: 'Custom integrations', starter: false, pro: false, enterprise: true },
      { name: 'SSO/SAML', starter: false, pro: false, enterprise: true },
    ]
  },
  {
    category: 'Support',
    features: [
      { name: 'Support channel', starter: 'Email', pro: 'Email + Chat', enterprise: 'Dedicated' },
      { name: 'Response time', starter: '48h', pro: '24h', enterprise: '4h' },
      { name: 'Onboarding', starter: 'Self-serve', pro: 'Guided', enterprise: 'White-glove' },
      { name: 'Account manager', starter: false, pro: false, enterprise: true },
      { name: 'SLA guarantee', starter: false, pro: false, enterprise: true },
    ]
  },
]

const faqs = [
  {
    question: 'What are credits and how do they work?',
    answer: 'Credits are our unit of processing. Each image processed uses 1 credit. Your credits reset at the start of each billing cycle. Unused credits do not roll over to the next month.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes! You can upgrade your plan at any time and the changes take effect immediately. When downgrading, the change will take effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens if I run out of credits?',
    answer: 'If you run out of credits, you can either wait until your next billing cycle when they reset, or upgrade to a higher plan for more credits. We\'ll notify you when you\'re running low.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans come with a 14-day free trial. No credit card required to start. You\'ll have full access to all features included in your chosen plan during the trial.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), as well as PayPal. Enterprise customers can also pay via invoice with NET-30 terms.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'You can cancel your subscription at any time from your account settings. You\'ll continue to have access until the end of your current billing period.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a full refund within the first 7 days of your subscription if you\'re not satisfied. After that, we provide prorated refunds for annual plans only.',
  },
  {
    question: 'What\'s included in Enterprise support?',
    answer: 'Enterprise customers get a dedicated account manager, priority support with 4-hour response time, custom onboarding, and direct access to our engineering team for integrations.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)

  const getPrice = (plan: typeof plans[0]) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice
  }

  const getSavings = (plan: typeof plans[0]) => {
    const yearlyTotal = plan.yearlyPrice
    const monthlyTotal = plan.monthlyPrice * 12
    return monthlyTotal - yearlyTotal
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Choose the plan that&apos;s right for you
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Start with a 14-day free trial. No credit card required. 
              Scale as you grow with flexible pricing options.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Save up to 17%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-lg scale-105 z-10' 
                    : 'border hover:border-muted-foreground/30 transition-colors'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-md px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2 pt-8">
                    <div className={`mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center ${
                      plan.popular 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="leading-relaxed">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold">${getPrice(plan)}</span>
                        <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
                      </div>
                      {isYearly && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Save ${getSavings(plan)}/year
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.credits.toLocaleString()} credits/month
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className={`w-full mb-6 ${plan.popular ? '' : 'variant-outline'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => {
                        if (plan.name === 'Enterprise') {
                          router.push('/support')
                        } else {
                          router.push('/sign-up')
                        }
                      }}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    {/* Features List */}
                    <div className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <div key={feature.name} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm leading-relaxed ${
                            feature.included ? '' : 'text-muted-foreground/60'
                          }`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Compare all features
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              A detailed breakdown of what&apos;s included in each plan to help you make the right choice.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-4 min-w-[120px]">
                    <span className="font-semibold">Starter</span>
                    <p className="text-sm text-muted-foreground font-normal">$19/mo</p>
                  </th>
                  <th className="text-center py-4 px-4 min-w-[120px] bg-primary/5 rounded-t-lg">
                    <span className="font-semibold">Pro</span>
                    <p className="text-sm text-muted-foreground font-normal">$49/mo</p>
                  </th>
                  <th className="text-center py-4 px-4 min-w-[120px]">
                    <span className="font-semibold">Enterprise</span>
                    <p className="text-sm text-muted-foreground font-normal">$149/mo</p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((category) => (
                  <>
                    <tr key={category.category} className="border-b bg-muted/50">
                      <td colSpan={4} className="py-3 px-4 font-semibold text-sm uppercase tracking-wide">
                        {category.category}
                      </td>
                    </tr>
                    {category.features.map((feature, idx) => (
                      <tr key={`${category.category}-${idx}`} className="border-b">
                        <td className="py-3 px-4 text-sm">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          {typeof feature.starter === 'boolean' ? (
                            feature.starter ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.starter}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center bg-primary/5">
                          {typeof feature.pro === 'boolean' ? (
                            feature.pro ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.pro}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {typeof feature.enterprise === 'boolean' ? (
                            feature.enterprise ? (
                              <Check className="h-5 w-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-sm">{feature.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mb-4">
              <HelpCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Join thousands of businesses already using i2i to transform their image workflows.
              Start your free trial today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/sign-up')}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/support')}>
                Contact Sales
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need a custom plan? <a href="/support" className="underline hover:text-foreground transition-colors">Contact our sales team</a> for 
              tailored solutions for your organization.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

