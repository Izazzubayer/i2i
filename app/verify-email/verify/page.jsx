'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function VerifyEmailHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error', 'expired'
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please request a new verification email.')
      return
    }

    // Verify email via API
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email?token=${token}`)
        const data = await response.json()
        
        if (response.ok && data.verified) {
          setStatus('success')
          setMessage('Email verified successfully! Redirecting to your workspace...')
          
          // Redirect to product after 2 seconds
          setTimeout(() => {
            router.push('/upload')
          }, 2000)
        } else if (response.status === 410) {
          setStatus('error')
          setMessage('This verification link has expired. Please request a new verification email.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed. The link may be invalid or expired.')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-background px-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-64 max-w-3xl rounded-full bg-primary/10 blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-muted shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1 text-center">
            {status === 'verifying' && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <CardTitle className="text-2xl">Verifying your email</CardTitle>
                <CardDescription className="text-base">
                  Please wait while we verify your email address...
                </CardDescription>
              </>
            )}
            
            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  Email Verified!
                </CardTitle>
                <CardDescription className="text-base">
                  {message}
                </CardDescription>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-base">
                  {message}
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{message}</span>
                </div>
                {email && (
                  <p className="text-center text-sm text-muted-foreground">
                    Verifying: <span className="font-medium">{email}</span>
                  </p>
                )}
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Your account is now active!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        You'll be redirected to your workspace in a moment...
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Verification failed
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => router.push('/verify-email?email=' + encodeURIComponent(email || ''))}
                  >
                    Request New Verification Email
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/sign-in')}
                  >
                    Go to Sign In
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyEmailHandler />
    </Suspense>
  )
}
