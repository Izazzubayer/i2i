'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, Clock, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0) return

    setIsResending(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Verification email sent!')
      setCountdown(60) // 60 second cooldown
    } catch (error) {
      toast.error('Failed to send email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckStatus = async () => {
    // Simulate checking verification status
    toast.info('Checking verification status...')
    // In real app, this would check with the backend
    // For demo, we'll just show a message
    setTimeout(() => {
      toast.info('Email not verified yet. Please check your inbox.')
    }, 1000)
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-background via-background to-background lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-3xl rounded-full bg-primary/10 blur-3xl" />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16"
      >
        <Card className="border-muted shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent a verification link to
            </CardDescription>
            {email && (
              <p className="text-sm font-medium text-primary">{email}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">What to do next</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Open your email inbox</li>
                    <li>Look for an email from i2i</li>
                    <li>Click the verification link in the email</li>
                    <li>You&apos;ll see a verification page with a loader</li>
                    <li>Once verified, you&apos;ll be automatically redirected to your workspace</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20 p-4">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  Can&apos;t find the email?
                </p>
                <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Wait a few minutes and try again</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
              >
                {isResending ? (
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
                    Resend verification email
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCheckStatus}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                I&apos;ve verified my email
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

            <div className="border-t pt-6 text-center text-sm text-muted-foreground">
              <p className="mb-2">Need help?</p>
              <Link href="/support" className="font-semibold text-primary hover:underline">
                Contact support
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

