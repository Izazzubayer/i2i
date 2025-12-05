'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Zap, Shield, Clock, Users, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import AuthenticatedNav from '@/components/AuthenticatedNav'

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
    price: '$19',
    period: '/month',
    description: 'Perfect for individuals',
    features: [
      '500 credits/month',
      'Basic processing',
      'Email support',
      'API access'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'Best for growing teams',
    features: [
      '1,000 credits/month',
      'Advanced processing',
      'Priority support',
      'Full API access',
      'Team collaboration',
      'Custom integrations'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited credits',
      'Premium processing',
      'Dedicated support',
      'SLA guarantee',
      'Custom solutions',
      'White-label options'
    ],
    popular: false
  }
]

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      if (typeof window === 'undefined') return
      
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      // User is authenticated if they have either a token OR user data (for verified users)
      setIsAuthenticated(!!(token || user))
    }

    // Initial check
    checkAuth()

    // Listen for storage changes (works across tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        checkAuth()
      }
    }

    // Custom event for same-tab storage changes
    const handleCustomStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorageChange', handleCustomStorageChange)
    // Also check on focus (in case user logged in another tab)
    window.addEventListener('focus', checkAuth)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorageChange', handleCustomStorageChange)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {isAuthenticated ? <AuthenticatedNav /> : <Header />}

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
            <Badge variant="secondary" className="mb-4">
              AI-Powered Image Processing
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-7xl">
              Transform Your Images
              <span className="block text-zinc-600 dark:text-zinc-400">In Seconds</span>
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
                <img
                  src={company.fallback || `https://cdn.simpleicons.org/${company.slug}/${company.color}`}
                  alt={`${company.name} logo`}
                  className="h-10 md:h-12 w-auto object-contain max-w-[120px]"
                  loading="lazy"
                  onError={(e) => {
                    if (company.fallback && e.target.src !== company.fallback) {
                      e.target.src = company.fallback
                    }
                  }}
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
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Choose the plan that fits your needs
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
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
                <Card className={`h-full ${plan.popular ? 'border-2 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl text-zinc-900 dark:text-zinc-50">{plan.name}</CardTitle>
                    <CardDescription className="text-zinc-600 dark:text-zinc-400">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">{plan.price}</span>
                      <span className="text-zinc-600 dark:text-zinc-400">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className={`mb-6 w-full ${plan.popular ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/sign-up">
                        Get Started
                      </Link>
                    </Button>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="container px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="i2i Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">i2i</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                AI-powered image processing for modern businesses
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="/upload" className="hover:text-zinc-900 dark:hover:text-zinc-50">Upload</Link></li>
                <li><Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-50">Pricing</Link></li>
                <li><Link href="/portfolio" className="hover:text-zinc-900 dark:hover:text-zinc-50">Portfolio</Link></li>
                <li><Link href="/api-docs" className="hover:text-zinc-900 dark:hover:text-zinc-50">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="/how-i2i-works" className="hover:text-zinc-900 dark:hover:text-zinc-50">How it Works</Link></li>
                <li><Link href="/support" className="hover:text-zinc-900 dark:hover:text-zinc-50">Support</Link></li>
                <li><Link href="/faq" className="hover:text-zinc-900 dark:hover:text-zinc-50">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-50">Terms</Link></li>
                <li><Link href="/legal" className="hover:text-zinc-900 dark:hover:text-zinc-50">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <p>&copy; 2025 i2i. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
