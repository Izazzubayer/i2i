'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { signin, googleSignIn, microsoftSignIn } from '@/api/auth/auth'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [staySignedIn, setStaySignedIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showPasswordResetSuccess, setShowPasswordResetSuccess] = useState(false)

  // Load saved credentials on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('savedEmail')
      const savedPassword = localStorage.getItem('savedPassword')
      const savedStaySignedIn = localStorage.getItem('staySignedIn') === 'true'
      
      // Load saved credentials if they exist (even if staySignedIn was cleared on signout)
      if (savedEmail) {
        setEmail(savedEmail)
        console.log('📧 Loaded saved email:', savedEmail)
      }
      
      if (savedPassword) {
        setPassword(savedPassword)
        console.log('🔑 Loaded saved password')
      }
      
      // Set checkbox state if preference was saved
      if (savedStaySignedIn) {
        setStaySignedIn(true)
      }
    }
  }, []) // Run only on mount

  useEffect(() => {
    if (searchParams.get('passwordReset') === 'true') {
      setShowPasswordResetSuccess(true)
      toast.success('Password reset successfully! You can now sign in with your new password.')
    }
  }, [searchParams])

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }
    
    setIsLoading(true)
    setMessage('Authenticating with i2i...')

    try {
      // Call signin API
      const response = await signin({
        email: email.trim(),
        password: password,
      })

      // Check if signin was successful
      if (response.success && response.data) {
        // User data and tokens are already stored in localStorage by the API function
        // Now move them to sessionStorage if "keep me signed in" is not checked
        console.log('✅ Sign-in page: Signin successful - checking storage')
        
        const storage = staySignedIn ? localStorage : sessionStorage
        
        // Move tokens and user data to appropriate storage
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken')
          const refreshToken = localStorage.getItem('refreshToken')
          const user = localStorage.getItem('user')
          
          if (token && user) {
            if (staySignedIn) {
              // Keep in localStorage (already there)
              console.log('💾 Keeping session in localStorage (persistent)')
            } else {
              // Move to sessionStorage (temporary)
              console.log('💾 Moving session to sessionStorage (temporary)')
              sessionStorage.setItem('authToken', token)
              if (refreshToken) {
                sessionStorage.setItem('refreshToken', refreshToken)
              }
              sessionStorage.setItem('user', user)
              
              // Clear from localStorage
              localStorage.removeItem('authToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
            }
            
            // Store preference
            storage.setItem('staySignedIn', staySignedIn.toString())
            
            // Always save email and password if "keep me signed in" is checked
            // This allows auto-fill even after signout
            if (staySignedIn) {
              localStorage.setItem('savedEmail', email.trim())
              localStorage.setItem('savedPassword', password)
              localStorage.setItem('staySignedIn', 'true')
              console.log('💾 Saved email and password for next sign-in')
            } else {
              // Clear saved credentials if "keep me signed in" is not checked
              localStorage.removeItem('savedEmail')
              localStorage.removeItem('savedPassword')
              localStorage.removeItem('staySignedIn')
              console.log('🧹 Cleared saved credentials')
            }
          }
        }
        
        // Verify data was stored
        const token = storage.getItem('authToken')
        const user = storage.getItem('user')
        console.log('🔍 Sign-in page: Storage check', { 
          storageType: staySignedIn ? 'localStorage' : 'sessionStorage',
          hasToken: !!token, 
          hasUser: !!user,
          tokenPreview: token ? token.substring(0, 20) + '...' : null,
        })
        
        if (!token || !user) {
          console.error('❌ Sign-in page: Data not found in storage after signin!')
          toast.error('Sign in successful but data not stored. Please try again.')
          setIsLoading(false)
          return
        }
        
        setMessage('Success! Redirecting to your workspace...')
        toast.success('Signed in successfully!')
        
        // Trigger storage change event to update navbar immediately
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('localStorageChange'))
          console.log('🔄 Sign-in page: Triggered localStorageChange event')
        }
        
        // Redirect to home page with hard navigation to ensure navbar updates
        setTimeout(() => {
          console.log('🔄 Sign-in page: Redirecting to home...')
          window.location.href = '/'
        }, 1500)
      } else {
        throw new Error(response.message || 'Sign in failed')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
      
      // Handle different error cases
      let errorMessage = 'Sign in failed. Please check your credentials and try again.'
      
      if (error?.status === 401) {
        errorMessage = error?.message || 'Invalid email or password. Please try again.'
      } else if (error?.status === 403) {
        errorMessage = error?.message || 'Your account is not verified. Please check your email.'
      } else if (error?.status === 404) {
        errorMessage = error?.message || 'Account not found. Please check your email address.'
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.Message) {
        errorMessage = error.data.Message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      
      setMessage('')
      toast.error(errorMessage)
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
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <section className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Secure access
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Sign in to your i2i workspace
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Manage batches, review results, and track image and token usage from a single dashboard. Use your work email to continue.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>• Enterprise-grade security</span>
            <span>• Single sign-on ready</span>
            <span>• Role-based controls</span>
          </div>
        </section>

        <section className="flex-1 w-full">
          <Card className="border-muted shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              {showPasswordResetSuccess && (
                <div className="mb-5 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Password reset successful!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        You can now sign in with your new password.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
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
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
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
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={staySignedIn}
                      onCheckedChange={(checked) => {
                        const isChecked = Boolean(checked)
                        setStaySignedIn(isChecked)
                        
                        // If user unchecks "keep me signed in", clear saved credentials
                        if (!isChecked && typeof window !== 'undefined') {
                          localStorage.removeItem('savedEmail')
                          localStorage.removeItem('savedPassword')
                          localStorage.removeItem('staySignedIn')
                          console.log('🧹 Cleared saved credentials - keep me signed in unchecked')
                        }
                      }}
                    />
                    Keep me signed in
                  </label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>

                {/* Social Sign-in Options */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or sign in with
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isGoogleLoading || isLoading}
                      onClick={async () => {
                        setIsGoogleLoading(true)
                        setMessage('Signing in with Google...')
                        try {
                          const response = await googleSignIn()
                          
                          if (response.success && response.data) {
                            console.log('✅ Google sign-in successful - User data stored')
                            setMessage('Success! Redirecting to your workspace...')
                            toast.success('Signed in with Google successfully!')
                            
                            // Wait a moment for localStorage to be fully written, then trigger event
                            setTimeout(() => {
                              if (typeof window !== 'undefined') {
                                // Double-check that data is in localStorage
                                const token = localStorage.getItem('authToken')
                                const user = localStorage.getItem('user')
                                console.log('🔍 Google sign-in: Verifying localStorage', { hasToken: !!token, hasUser: !!user })
                                
                                // Trigger localStorageChange event to update navbar immediately
                                window.dispatchEvent(new Event('localStorageChange'))
                                console.log('🔄 Google sign-in: Triggered localStorageChange event')
                              }
                            }, 100)
                            
                            // Redirect to home page with hard navigation to ensure navbar updates
                            setTimeout(() => {
                              window.location.href = '/'
                            }, 1200)
                          } else {
                            throw new Error(response.message || 'Google sign in failed')
                          }
                        } catch (error) {
                          console.error('Google sign in error:', error)
                          setIsGoogleLoading(false)
                          
                          let errorMessage = 'Google sign in failed. Please try again.'
                          if (error?.message) {
                            errorMessage = error.message
                          } else if (error?.data?.Message) {
                            errorMessage = error.data.Message
                          } else if (error?.data?.message) {
                            errorMessage = error.data.message
                          }
                          
                          setMessage('')
                          toast.error(errorMessage)
                        }
                      }}
                    >
                      {isGoogleLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Google
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isMicrosoftLoading || isLoading || isGoogleLoading}
                      onClick={async () => {
                        setIsMicrosoftLoading(true)
                        setMessage('Signing in with Microsoft...')
                        try {
                          const response = await microsoftSignIn()
                          
                          if (response.success && response.data) {
                            console.log('✅ Microsoft sign-in successful - User data stored')
                            setMessage('Success! Redirecting to your workspace...')
                            toast.success('Signed in with Microsoft successfully!')
                            
                            // Wait a moment for localStorage to be fully written, then trigger event
                            setTimeout(() => {
                              if (typeof window !== 'undefined') {
                                // Double-check that data is in localStorage
                                const token = localStorage.getItem('authToken')
                                const user = localStorage.getItem('user')
                                console.log('🔍 Microsoft sign-in: Verifying localStorage', { hasToken: !!token, hasUser: !!user })
                                
                                // Trigger localStorageChange event to update navbar immediately
                                window.dispatchEvent(new Event('localStorageChange'))
                                console.log('🔄 Microsoft sign-in: Triggered localStorageChange event')
                              }
                            }, 100)
                            
                            // Redirect to home page with hard navigation to ensure navbar updates
                            setTimeout(() => {
                              window.location.href = '/'
                            }, 1200)
                          } else {
                            throw new Error(response.message || 'Microsoft sign in failed')
                          }
                        } catch (error) {
                          console.error('Microsoft sign in error:', error)
                          setIsMicrosoftLoading(false)
                          
                          let errorMessage = 'Microsoft sign in failed. Please try again.'
                          if (error?.message) {
                            errorMessage = error.message
                          } else if (error?.data?.Message) {
                            errorMessage = error.data.Message
                          } else if (error?.data?.message) {
                            errorMessage = error.data.message
                          }
                          
                          setMessage('')
                          toast.error(errorMessage)
                        }
                      }}
                    >
                      {isMicrosoftLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="none">
                            <path d="M0 0h11.5v11.5H0V0z" fill="#F25022" />
                            <path d="M11.5 0H23v11.5H11.5V0z" fill="#7FBA00" />
                            <path d="M0 11.5h11.5V23H0V11.5z" fill="#00A4EF" />
                            <path d="M11.5 11.5H23V23H11.5V11.5z" fill="#FFB900" />
                          </svg>
                          Microsoft
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue to dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {message && (
                  <p className="text-center text-sm text-muted-foreground">{message}</p>
                )}
              </form>

              <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
                New to i2i?{' '}
                <Link href="/sign-up" className="font-semibold text-primary hover:underline">
                  Create your account
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </motion.main>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}

