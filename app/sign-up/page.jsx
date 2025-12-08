'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, Building, ArrowRight, Loader2, Sparkles, Phone, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
<<<<<<< HEAD
import { signup, googleSignIn } from '@/api/auth/auth'
=======
import { signup } from '@/api/auth/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
>>>>>>> cd5d5b04e3f7c391522f24cb391db7defb200a9f

export default function SignUpPage() {
  const router = useRouter()
  const [formState, setFormState] = useState({
    displayName: '',
    email: '',
    phoneNo: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    termsAndCondition: false,
    captcha: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  const [openModal, setOpenModal] = useState(null) // 'terms' or 'privacy' or null

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormState(prev => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Update password strength indicators
    if (field === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      })
    }
  }

  const handleCheckboxChange = (field) => (checked) => {
    setFormState(prev => ({ ...prev, [field]: checked }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    if (!phone) return true // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    )
  }

  const validateForm = () => {
    const newErrors = {}

    // Display Name validation
    if (!formState.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    } else if (formState.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters'
    }

    // Email validation
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formState.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (optional)
    if (formState.phoneNo && !validatePhone(formState.phoneNo)) {
      newErrors.phoneNo = 'Please enter a valid phone number'
    }

    // Company validation
    if (!formState.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    // Password validation
    if (!formState.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formState.password)) {
      newErrors.password = 'Password does not meet requirements'
    }

    // Confirm password validation
    if (!formState.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // CAPTCHA validation
    if (!formState.captcha) {
      newErrors.captcha = 'Please complete the CAPTCHA verification'
    }

    // Terms validation
    if (!formState.termsAndCondition) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)
    setMessage('Creating your account...')

    try {
      // Prepare signup data according to API requirements
      const signupData = {
        email: formState.email.trim(),
        password: formState.password,
        displayName: formState.displayName.trim(),
        phoneNo: formState.phoneNo.trim() || '', // Send empty string if not provided
        companyName: formState.companyName.trim(),
        termsAndCondition: formState.termsAndCondition,
      }

      // Call signup API
      const response = await signup(signupData)

      // Check if signup was successful
      if (response.success && response.data) {
        // User data and tokens are already stored in localStorage by the API function
        console.log('✅ Signup successful - User data stored')
        
        // Success
        setMessage('Verification email sent! Please check your inbox.')
        toast.success('Account created successfully! Verification email sent to ' + formState.email)

        // Redirect to check email page
        setTimeout(() => {
          router.push(`/check-email?email=${encodeURIComponent(formState.email)}`)
        }, 2000)
      } else {
        throw new Error(response.message || 'Signup failed')
      }
    } catch (error) {
      // Handle API errors
      setMessage('')
      const errorMessage = error?.message || error?.data?.message || 'Something went wrong. Please try again.'
      toast.error(errorMessage)
      setIsLoading(false)
      
      // Log error for debugging
      console.error('Signup error:', error)
    }
  }

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)

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
            <Sparkles className="h-4 w-4" />
            Get started in minutes
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Create your i2i account
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Upload, process, and deliver production-ready visuals at scale. Well spin up a workspace so your team can collaborate instantly.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ 100 free images and 2,000 tokens on day one</li>
            <li>✓ Collaboration-ready workspaces</li>
            <li>✓ SOC2 & GDPR compliant infrastructure</li>
          </ul>
        </section>

        <section className="flex-1 w-full">
          <Card className="border-muted shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription className="text-sm">Create your account to get started</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Display Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-sm">Display Name <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="displayName"
                      placeholder="John Doe"
                      className={`pl-9 h-9 text-sm ${errors.displayName ? 'border-destructive' : ''}`}
                      value={formState.displayName}
                      onChange={handleChange('displayName')}
                      required
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.displayName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className={`pl-9 h-9 text-sm ${errors.email ? 'border-destructive' : ''}`}
                      value={formState.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Row 2: Phone & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm">
                      Phone <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phoneNo"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 (555) 123-4567"
                        className={`pl-9 h-9 text-sm ${errors.phoneNo ? 'border-destructive' : ''}`}
                        value={formState.phoneNo}
                        onChange={handleChange('phoneNo')}
                      />
                    </div>
                    {errors.phoneNo && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phoneNo}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="text-sm">Company name <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Acme Studio"
                        className={`pl-9 h-9 text-sm ${errors.companyName ? 'border-destructive' : ''}`}
                        value={formState.companyName}
                        onChange={handleChange('companyName')}
                        required
                      />
                    </div>
                    {errors.companyName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.companyName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm">Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Create password"
                        className={`pl-9 h-9 text-sm ${errors.password ? 'border-destructive' : isPasswordStrong ? 'border-green-500' : ''}`}
                        value={formState.password}
                        onChange={handleChange('password')}
                        required
                      />
                    </div>
                    {formState.password && (
                      <div className="grid grid-cols-5 gap-1 mt-1.5">
                        {Object.values(passwordStrength).map((met, idx) => (
                          <div
                            key={idx}
                            className={`h-1 rounded-full ${met ? 'bg-green-600' : 'bg-muted'}`}
                            title={['8+ chars', 'Uppercase', 'Lowercase', 'Number', 'Special'][idx]}
                          />
                        ))}
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                    {formState.password && !isPasswordStrong && (
                      <p className="text-xs text-muted-foreground">
                        Min 8 chars, uppercase, lowercase, number, special char
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        className={`pl-9 h-9 text-sm ${errors.confirmPassword ? 'border-destructive' : formState.confirmPassword && formState.password === formState.confirmPassword ? 'border-green-500' : ''}`}
                        value={formState.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        required
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                    {formState.confirmPassword && formState.password === formState.confirmPassword && !errors.confirmPassword && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>


                {/* Dummy reCAPTCHA */}
                <div className="space-y-1.5">
                  <div className="inline-flex items-center justify-between rounded border border-muted bg-background p-3 shadow-sm" style={{ width: '304px' }}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="captcha"
                        checked={formState.captcha}
                        onCheckedChange={(checked) => handleCheckboxChange('captcha')(Boolean(checked))}
                      />
                      <span className="text-sm font-normal">I&apos;m not a robot</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <svg className="h-8 w-8" viewBox="0 0 256 256" fill="none">
                        <rect width="256" height="256" fill="none" />
                        <path d="M128 24L32 80L128 136L224 80L128 24Z" fill="#4285F4" />
                        <path d="M128 136L32 80L32 176L128 232L128 136Z" fill="#34A853" />
                        <path d="M128 136L224 80L224 176L128 232L128 136Z" fill="#FBBC04" />
                        <path d="M128 136L128 232L224 176L224 80L128 136Z" fill="#EA4335" opacity="0.7" />
                      </svg>
                      <div className="flex flex-col items-center -mt-1">
                        <span className="text-[9px] text-muted-foreground leading-tight">reCAPTCHA</span>
                        <div className="flex gap-1 text-[8px] text-muted-foreground leading-tight">
                          <a href="#" className="hover:underline">Privacy</a>
                          <span>-</span>
                          <a href="#" className="hover:underline">Terms</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  {errors.captcha && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.captcha}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-1.5">
                  <label className={`flex items-center gap-2 text-sm p-2.5 rounded-md border ${errors.terms ? 'border-destructive' : 'border-muted'}`}>
                    <Checkbox
                      id="termsAndCondition"
                      checked={formState.termsAndCondition}
                      onCheckedChange={(checked) => handleCheckboxChange('termsAndCondition')(Boolean(checked))}
                      required
                    />
                    <span className="text-xs leading-tight">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setOpenModal('terms')
                        }}
                        className="font-semibold text-primary hover:underline"
                      >
                        Terms
                      </button>
                      {' '}&{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setOpenModal('privacy')
                        }}
                        className="font-semibold text-primary hover:underline"
                      >
                        Privacy
                      </button>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.terms}
                    </p>
                  )}
                </div>

                {/* Social Sign-in Options */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or sign up with
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
                        setMessage('Signing up with Google...')
                        try {
                          const response = await googleSignIn()
                          
                          if (response.success && response.data) {
                            console.log('✅ Google sign-up successful - User data stored')
                            setMessage('Success! Redirecting to your workspace...')
                            toast.success('Signed up with Google successfully!')
                            
                            // Redirect to home page
                            setTimeout(() => {
                              router.push('/')
                              router.refresh() // Refresh to update navbar
                            }, 1000)
                          } else {
                            throw new Error(response.message || 'Google sign up failed')
                          }
                        } catch (error) {
                          console.error('Google sign up error:', error)
                          setIsGoogleLoading(false)
                          
                          let errorMessage = 'Google sign up failed. Please try again.'
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
                          Signing up...
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
                      onClick={() => {
                        // Dummy - non-functional
                        toast.info('Microsoft sign-up coming soon')
                      }}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="none">
                        <path d="M0 0h11.5v11.5H0V0z" fill="#F25022" />
                        <path d="M11.5 0H23v11.5H11.5V0z" fill="#7FBA00" />
                        <path d="M0 11.5h11.5V23H0V11.5z" fill="#00A4EF" />
                        <path d="M11.5 11.5H23V23H11.5V11.5z" fill="#FFB900" />
                      </svg>
                      Microsoft
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
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

      {/* Terms and Privacy Modal */}
      <Dialog open={openModal !== null} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {openModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </DialogTitle>
            <DialogDescription>
              {openModal === 'terms' 
                ? 'Please read these terms carefully before using the i2i platform.'
                : 'How we collect, process, and store your data.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-6 text-sm text-muted-foreground">
              {openModal === 'terms' ? (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
                    <p className="leading-relaxed">
                      These Terms of Service (&quot;Terms&quot;) govern your access to and use of the i2i platform 
                      (&quot;Service&quot;), operated by i2i Inc. By creating an account, accessing our API, or using 
                      any part of the Service, you agree to comply with these Terms.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h3>
                    <p className="leading-relaxed mb-2">
                      i2i is an enterprise-grade AI-powered image processing platform that provides:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>AI-driven image enhancement, background removal, and retouching services</li>
                      <li>Batch processing capabilities for multiple images</li>
                      <li>Integration with Digital Asset Management (DAM) platforms</li>
                      <li>RESTful API access for programmatic image processing</li>
                      <li>Cloud storage integration (AWS S3, Cloudinary)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">3. User Accounts and Registration</h3>
                    <p className="leading-relaxed mb-2">
                      To use the Service, you must create an account by providing accurate and complete information. 
                      You are responsible for maintaining the confidentiality of your account credentials and for all 
                      activities that occur under your account.
                    </p>
                    <p className="leading-relaxed">
                      You must be at least 18 years old to use the Service.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">4. Subscription Plans and Billing</h3>
                    <p className="leading-relaxed mb-2">
                      Subscriptions are billed monthly or annually in advance. By providing payment information, 
                      you authorize us to charge your payment method for all fees incurred. All subscription fees 
                      are non-refundable except as required by law.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">5. Acceptable Use Policy</h3>
                    <p className="leading-relaxed mb-2">You agree NOT to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Upload images containing illegal, harmful, or offensive content</li>
                      <li>Process images you do not own or have permission to use</li>
                      <li>Violate any intellectual property rights</li>
                      <li>Reverse engineer, decompile, or attempt to extract the source code</li>
                      <li>Exceed rate limits or abuse API access</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">6. Intellectual Property Rights</h3>
                    <p className="leading-relaxed mb-2">
                      You retain all ownership rights to the images you upload. By uploading content, you grant us 
                      a limited, non-exclusive license to store, process, and display Your Content as necessary to 
                      provide the Service.
                    </p>
                    <p className="leading-relaxed">
                      You own all processed images generated by the Service. The Service, including its software and 
                      algorithms, is owned by i2i Inc. and protected by intellectual property laws.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">7. Privacy and Data Protection</h3>
                    <p className="leading-relaxed">
                      Your privacy is important to us. Our collection, use, and protection of your personal 
                      information is governed by our Privacy Policy. We implement industry-standard security measures 
                      including encryption, security audits, and SOC 2 compliance.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">8. Termination</h3>
                    <p className="leading-relaxed">
                      You may terminate your account at any time. We may suspend or terminate your account if you 
                      violate these Terms. Upon termination, you will lose access to the Service and your data will 
                      be deleted according to our retention policy.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">9. Disclaimers and Limitations</h3>
                    <p className="leading-relaxed mb-2">
                      THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. 
                      We disclaim all warranties, including warranties of merchantability, fitness for a particular 
                      purpose, and non-infringement.
                    </p>
                    <p className="leading-relaxed">
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                      SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">10. Changes to Terms</h3>
                    <p className="leading-relaxed">
                      We reserve the right to modify these Terms at any time. We will notify you of material changes 
                      by posting the updated Terms on our website and updating the &quot;Last Updated&quot; date. Your 
                      continued use of the Service after changes are posted constitutes your acceptance of the updated Terms.
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                      Last Updated: November 27, 2025 | Version 1.0
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      For questions about these Terms, contact us at{' '}
                      <a href="mailto:legal@i2i.ai" className="text-primary hover:underline">legal@i2i.ai</a>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">1. Introduction</h3>
                    <p className="leading-relaxed">
                      This Privacy Policy explains how i2i Inc. (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, 
                      uses, and protects your personal information when you use the i2i platform. We are committed to 
                      protecting your privacy and handling your data with care.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">2. Information We Collect</h3>
                    <p className="leading-relaxed mb-2">We collect the following types of information:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Account Information:</strong> Email address, name, phone number, company name, and payment details</li>
                      <li><strong>Content:</strong> Images you upload and processing instructions you provide</li>
                      <li><strong>Usage Data:</strong> How you interact with the Service, API usage, and analytics</li>
                      <li><strong>Device Information:</strong> IP address, browser type, device identifiers, and operating system</li>
                      <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to improve your experience</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">3. How We Use Your Information</h3>
                    <p className="leading-relaxed mb-2">We use your information to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Provide and improve the Service</li>
                      <li>Process images using AI models according to your instructions</li>
                      <li>Communicate with you about your account, billing, and the Service</li>
                      <li>Send you updates, newsletters, and marketing communications (with your consent)</li>
                      <li>Detect and prevent fraud, abuse, and security threats</li>
                      <li>Comply with legal obligations and enforce our Terms of Service</li>
                      <li>Analyze usage patterns to improve our services</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">4. Data Sharing and Disclosure</h3>
                    <p className="leading-relaxed mb-2">
                      We do not sell your personal information. We may share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Service Providers:</strong> With trusted third-party service providers who help us operate the Service (e.g., cloud storage, payment processing)</li>
                      <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                      <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                      <li><strong>To Protect Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">5. Data Retention</h3>
                    <p className="leading-relaxed mb-2">
                      We retain your data according to your subscription tier:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Free Tier:</strong> Images and processed results retained for 7 days</li>
                      <li><strong>Pro Tier:</strong> Images and processed results retained for 90 days</li>
                      <li><strong>Enterprise Tier:</strong> Unlimited retention until account deletion</li>
                    </ul>
                    <p className="leading-relaxed mt-2">
                      Account information is retained until you delete your account. You can request deletion of your 
                      data at any time by contacting support.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">6. Data Security</h3>
                    <p className="leading-relaxed mb-2">
                      We implement industry-standard security measures to protect your data:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>End-to-end encryption for data in transit (TLS/SSL)</li>
                      <li>Encryption at rest for stored images and sensitive data</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>SOC 2 compliance</li>
                      <li>Role-based access controls</li>
                      <li>Secure authentication and API key management</li>
                    </ul>
                    <p className="leading-relaxed mt-2">
                      However, no method of transmission over the Internet or electronic storage is 100% secure. 
                      While we strive to protect your data, we cannot guarantee absolute security.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">7. Your Rights and Choices</h3>
                    <p className="leading-relaxed mb-2">You have the right to:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Access:</strong> Request a copy of your personal information</li>
                      <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                      <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                      <li><strong>Portability:</strong> Request your data in a portable format</li>
                      <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                      <li><strong>Restrict Processing:</strong> Request limitations on how we process your data</li>
                    </ul>
                    <p className="leading-relaxed mt-2">
                      To exercise these rights, contact us at{' '}
                      <a href="mailto:privacy@i2i.ai" className="text-primary hover:underline">privacy@i2i.ai</a> or 
                      use the settings in your account.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">8. Cookies and Tracking Technologies</h3>
                    <p className="leading-relaxed">
                      We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage, 
                      and provide personalized content. You can control cookies through your browser settings, but 
                      disabling cookies may affect the functionality of the Service.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">9. International Data Transfers</h3>
                    <p className="leading-relaxed">
                      Your information may be transferred to and processed in countries other than your country of 
                      residence. These countries may have different data protection laws. We ensure appropriate 
                      safeguards are in place to protect your data in accordance with this Privacy Policy.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">10. Children&apos;s Privacy</h3>
                    <p className="leading-relaxed">
                      The Service is not intended for individuals under 18 years of age. We do not knowingly collect 
                      personal information from children. If we become aware that we have collected information from 
                      a child, we will delete it immediately.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">11. Changes to This Privacy Policy</h3>
                    <p className="leading-relaxed">
                      We may update this Privacy Policy from time to time. We will notify you of material changes by 
                      posting the updated policy on our website, updating the &quot;Last Updated&quot; date, and sending an 
                      email notification to your registered email address.
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Contact Us</h3>
                    <p className="leading-relaxed mb-2">
                      If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <ul className="list-none space-y-1 ml-4">
                      <li>
                        <strong>Email:</strong>{' '}
                        <a href="mailto:privacy@i2i.ai" className="text-primary hover:underline">privacy@i2i.ai</a>
                      </li>
                      <li>
                        <strong>Legal:</strong>{' '}
                        <a href="mailto:legal@i2i.ai" className="text-primary hover:underline">legal@i2i.ai</a>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-4">
                      Last Updated: November 27, 2025 | Version 1.0
                    </p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

