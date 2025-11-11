'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, Building, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function SignUpPage() {
  const router = useRouter()
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    company: '',
    password: '',
    agree: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage('Creating your workspace...')

    setTimeout(() => {
      setIsLoading(false)
      setMessage('Account created! Redirecting you to the dashboard.')
      router.push('/dashboard')
    }, 1400)
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-background via-background to-background lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-3xl rounded-full bg-primary/10 blur-3xl" />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center"
      >
        <section className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Get started in minutes
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Create your i2i account
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Upload, process, and deliver production-ready visuals at scale. We’ll spin up a workspace so your team can collaborate instantly.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ 2,000 free credits on day one</li>
            <li>✓ Collaboration-ready workspaces</li>
            <li>✓ SOC2 & GDPR compliant infrastructure</li>
          </ul>
        </section>

        <section className="flex-1">
          <Card className="border-muted shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Join the beta</CardTitle>
              <CardDescription>Tell us a little about you to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <div className="relative">
                    <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Ada Lovelace"
                      className="pl-9"
                      value={formState.fullName}
                      onChange={handleChange('fullName')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="pl-9"
                      value={formState.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder="Acme Studio"
                      className="pl-9"
                      value={formState.company}
                      onChange={handleChange('company')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Create a secure password"
                      className="pl-9"
                      value={formState.password}
                      onChange={handleChange('password')}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use at least 8 characters with a mix of letters and numbers.
                  </p>
                </div>

                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={formState.agree}
                    onCheckedChange={(checked) =>
                      setFormState(prev => ({ ...prev, agree: Boolean(checked) }))
                    }
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/legal" className="font-semibold text-primary hover:underline">
                      Terms & Privacy
                    </Link>
                    .
                  </span>
                </label>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up workspace...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {message && (
                  <p className="text-center text-sm text-muted-foreground">{message}</p>
                )}
              </form>

              <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                  Sign in instead
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </motion.main>
    </div>
  )
}

