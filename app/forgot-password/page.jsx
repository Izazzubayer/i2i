'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/api/auth/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      // Call forgot password API
      const response = await requestPasswordReset({
        email: email.trim(),
      })

      // Check if request was successful
      if (response.success || response.status === 200) {
        toast.success(response.message || 'Password reset email sent! Check your inbox.')
        setIsSubmitted(true)
      } else {
        throw new Error(response.message || 'Failed to send password reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      
      // Handle different error cases
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (error?.status === 404) {
        errorMessage = error?.message || 'Email not found. Please check your email address.'
      } else if (error?.status === 400) {
        errorMessage = error?.message || 'Invalid email address. Please try again.'
      } else if (error?.status === 429) {
        errorMessage = error?.message || 'Too many requests. Please wait a moment and try again.'
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.Message) {
        errorMessage = error.data.Message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
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
                We&apos;ve sent a password reset link to
              </CardDescription>
              <p className="text-sm font-medium text-primary mt-2">{email}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend email
                </Button>

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => router.push('/sign-in')}
                >
                  Back to sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="border-t pt-6 text-center text-sm text-muted-foreground">
                <p className="mb-2">Didn&apos;t receive the email?</p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Wait a few minutes and try again</li>
                </ul>
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
            <ShieldCheck className="h-4 w-4" />
            Secure password reset
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Forgot your password?
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              No worries! Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>• Secure password reset</span>
            <span>• Email verification required</span>
            <span>• Link expires in 1 hour</span>
          </div>
        </section>

        <section className="flex-1 w-full">
          <Card className="border-muted shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Reset password</CardTitle>
              <CardDescription>
                Enter your email address to receive a password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
                <Link href="/sign-in" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4" />
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

