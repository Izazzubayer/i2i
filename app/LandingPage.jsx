'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Zap, Shield, Clock, Users, Star, TrendingUp, Building2, Rocket, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process thousands of images in minutes with our AI-powered engine.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance with industry standards.'
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Automate your image processing workflow and focus on what matters.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with shared workspaces and projects.'
  },
  {
    icon: Star,
    title: 'Premium Quality',
    description: 'Get professional-grade results with our advanced AI models.'
  },
  {
    icon: TrendingUp,
    title: 'Scale Effortlessly',
    description: 'Grow from hundreds to millions of images without limits.'
  }
]

const stats = [
  { value: '10M+', label: 'Images Processed' },
  { value: '50K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' }
]

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    monthlyPrice: 19,
    yearlyPrice: 190,
    images: 500,
    tokens: 10000,
    icon: Zap,
    popular: false,
    features: [
      { name: 'AI Image Processing', included: true },
      { name: '500 images/month', included: true },
      { name: '10,000 tokens/month', included: true },
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
    images: 1000,
    tokens: 25000,
    icon: Rocket,
    popular: true,
    features: [
      { name: 'AI Image Processing', included: true },
      { name: '1,000 images/month', included: true },
      { name: '25,000 tokens/month', included: true },
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
    images: 5000,
    tokens: 100000,
    icon: Building2,
    popular: false,
    features: [
      { name: 'AI Image Processing', included: true },
      { name: '5,000 images/month', included: true },
      { name: '100,000 tokens/month', included: true },
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

export default function LandingPage() {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user from localStorage if available
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    }
  }, [])

  const getPrice = (plan) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice
  }

  const getSavings = (plan) => {
    const yearlyTotal = plan.yearlyPrice
    const monthlyTotal = plan.monthlyPrice * 12
    return monthlyTotal - yearlyTotal
  }

  const handleCheckout = async (plan) => {
    if (plan.name === 'Enterprise') {
      router.push('/support')
      return
    }

    setLoadingPlan(plan.name)
    try {
      const billingPeriod = isYearly ? 'yearly' : 'monthly'
      const planKey = plan.name.toLowerCase()
      
      const response = await apiClient.createCheckoutSession(
        planKey,
        billingPeriod,
        user?.userId || null,
        user?.email || null
      )

      if (response.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url
      } else {
        toast.error('Failed to create checkout session')
        setLoadingPlan(null)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error.message || 'Failed to start checkout. Please try again.')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900" />
        <div className="container relative px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Badge variant="secondary" className="mb-8 bg-zinc-200 text-zinc-900">
              AI-Powered Image Processing
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-7xl">
              Save Money on AI
              <span className="block text-zinc-600 dark:text-zinc-400">with Studio-Quality Shots</span>
            </h1>
            <p className="mb-8 text-xl text-zinc-600 dark:text-zinc-400 md:text-2xl">
              Professional image processing powered by AI. Remove backgrounds, enhance quality, and automate your workflow.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200" asChild>
                <Link href="/upload">
                  Start Processing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-300 dark:border-zinc-700" asChild>
                <Link href="/portfolio">
                  View Examples
                </Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="container px-4 py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="container px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center mb-16"
          >
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
              Trusted by Industry Leaders
            </p>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 md:text-4xl mb-3">
              In partnership with the world&apos;s most innovative companies
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              Join thousands of leading brands that trust us with their image processing needs
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 items-center justify-items-center max-w-6xl mx-auto">
            {[
              { name: 'Shopify', slug: 'shopify', color: '96BF48' },
              { name: 'IKEA', slug: 'ikea', color: '0058A3' },
              { name: 'Adidas', slug: 'adidas', color: '000000' },
              { name: 'H&M', slug: 'handm', color: 'DA291C', fallback: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg' },
              { name: 'Microsoft', slug: 'microsoft', color: '0078D4', fallback: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
              { name: 'Oracle', slug: 'oracle', color: 'F80000', fallback: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
              { name: 'Amazon', slug: 'amazonaws', color: 'FF9900', fallback: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
              { name: 'Meta', slug: 'meta', color: '0081FB' },
              { name: 'Netflix', slug: 'netflix', color: 'E50914' },
              { name: 'Spotify', slug: 'spotify', color: '1DB954' },
              { name: 'Formula 1', slug: 'formula1', color: 'E10600', fallback: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg' },
              { name: 'Tesla', slug: 'tesla', color: 'CC0000' },
              { name: 'Nike', slug: 'nike', color: '000000' },
              { name: 'Toyota', slug: 'toyota', color: 'EB0A1E', fallback: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg' },
              { name: 'Zara', slug: 'zara', color: '000000', fallback: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg' },
            ].map((company, index) => (
              <motion.div
                key={company.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                whileHover={{ scale: 1.1, y: -4 }}
                className="group flex items-center justify-center h-20 md:h-24 w-full p-4 rounded-xl bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all duration-300 grayscale hover:grayscale-0 opacity-70 hover:opacity-100"
              >
                <Image
                  src={company.fallback || `https://cdn.simpleicons.org/${company.slug}/${company.color}`}
                  alt={`${company.name} logo`}
                  width={120}
                  height={48}
                  className="h-10 md:h-12 w-auto object-contain max-w-[120px]"
                  unoptimized
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50 md:text-5xl">
              Everything You Need
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Powerful features to streamline your image processing workflow
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                      <feature.icon className="h-6 w-6 text-zinc-50 dark:text-zinc-900" />
                    </div>
                    <CardTitle className="text-zinc-900 dark:text-zinc-50">{feature.title}</CardTitle>
                    <CardDescription className="text-zinc-600 dark:text-zinc-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="container px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-50 md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              Choose the plan that fits your needs
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${!isYearly ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <span className={`text-sm font-medium ${isYearly ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Save up to 17%
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-16">
            <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <Card className={`h-full flex flex-col ${plan.popular ? 'border-2 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800'}`}>
                    <CardHeader className="text-center pb-2 pt-8">
                      <div className={`mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center ${
                        plan.popular 
                          ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900' 
                          : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                      }`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <CardTitle className="text-2xl text-zinc-900 dark:text-zinc-50">{plan.name}</CardTitle>
                      <CardDescription className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Price */}
                      <div className="text-center mb-6">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">${getPrice(plan)}</span>
                          <span className="text-zinc-600 dark:text-zinc-400">/{isYearly ? 'year' : 'month'}</span>
                        </div>
                        {isYearly && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Save ${getSavings(plan)}/year
                          </p>
                        )}
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                          {plan.images.toLocaleString()} images/month
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                          {plan.tokens.toLocaleString()} tokens/month
                        </p>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        className={`mb-6 w-full ${plan.popular ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => handleCheckout(plan)}
                        disabled={loadingPlan === plan.name}
                      >
                        {loadingPlan === plan.name ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>

                      {/* Features List */}
                      <div className="space-y-3 flex-1">
                        {plan.features.map((feature) => (
                          <div key={feature.name} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-zinc-400 dark:text-zinc-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm leading-relaxed ${
                              feature.included 
                                ? 'text-zinc-600 dark:text-zinc-400' 
                                : 'text-zinc-400 dark:text-zinc-600'
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-200" />
        <div className="container relative px-4 py-20 text-center md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-4 text-4xl font-bold text-zinc-50 dark:text-zinc-900 md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-zinc-200 dark:text-zinc-700">
              Join thousands of businesses already using i2i to transform their images
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="bg-zinc-50 text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="underline" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
