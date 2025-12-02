'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, RefreshCw, Clock, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Verification email sent!')
      setIsSubmitted(true)
      setCountdown(60) // 60 second cooldown
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Verification email sent!')
      setCountdown(60)
    } catch (error) {
      toast.error('Failed to send email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-background via-background to-background lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-3xl rounded-full bg-primary/10 blur-3xl" />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center"
      >
        <section className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Mail className="h-4 w-4" />
            Email verification
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Resend verification email
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Didn&apos;t receive the verification email? Enter your email address and we&apos;ll send you a new one.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>• Check your spam folder</span>
            <span>• Verify email address</span>
            <span>• Link expires in 24 hours</span>
          </div>
        </section>

        <section className="flex-1 w-full">
          <Card className="border-muted shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Resend verification</CardTitle>
              <CardDescription>
                {isSubmitted 
                  ? 'We\'ve sent a new verification email. Check your inbox.'
                  : 'Enter your email address to receive a new verification link.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="pl-9"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend verification email
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Email sent!</p>
                        <p className="text-sm text-muted-foreground">{email}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResend}
                    disabled={isLoading || countdown > 0}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : countdown > 0 ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Resend in {countdown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend again
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => router.push('/sign-in')}
                  >
                    Continue to sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
                <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </motion.main>
    </div>
  )
}

