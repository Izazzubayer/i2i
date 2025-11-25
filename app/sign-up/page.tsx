'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, Building, ArrowRight, Loader2, Sparkles, Phone, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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

interface FormErrors {
  username?: string
  email?: string
  phone?: string
  company?: string
  password?: string
  confirmPassword?: string
  captcha?: string
  terms?: string
}

export default function SignUpPage() {
  const router = useRouter()
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    agree: false,
    captcha: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  const handleChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    setFormState(prev => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
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

  const handleCheckboxChange = (field: 'agree' | 'captcha') => (checked: boolean) => {
    setFormState(prev => ({ ...prev, [field]: checked }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    )
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Username validation
    if (!formState.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formState.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formState.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Email validation
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formState.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation (optional)
    if (formState.phone && !validatePhone(formState.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Company validation
    if (!formState.company.trim()) {
      newErrors.company = 'Company name is required'
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
    if (!formState.agree) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)
    setMessage('Creating your account...')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate sending verification email
      setMessage('Verification email sent! Please check your inbox.')
      toast.success('Account created! Verification email sent to ' + formState.email)

      // In a real app, you would redirect to a "check your email" page
      setTimeout(() => {
        router.push('/sign-in?verified=false')
      }, 2000)
    } catch (error) {
      setMessage('')
      toast.error('Something went wrong. Please try again.')
      setIsLoading(false)
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

        <section className="flex-1 w-full">
          <Card className="border-muted shadow-lg shadow-primary/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription className="text-sm">Create your account to get started</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm">Username</Label>
                  <div className="relative">
                    <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="johndoe"
                      className={`pl-9 h-9 text-sm ${errors.username ? 'border-destructive' : ''}`}
                      value={formState.username}
                      onChange={handleChange('username')}
                      required
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
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
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 (555) 123-4567"
                        className={`pl-9 h-9 text-sm ${errors.phone ? 'border-destructive' : ''}`}
                        value={formState.phone}
                        onChange={handleChange('phone')}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-sm">Company name</Label>
                    <div className="relative">
                      <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Acme Studio"
                        className={`pl-9 h-9 text-sm ${errors.company ? 'border-destructive' : ''}`}
                        value={formState.company}
                        onChange={handleChange('company')}
                        required
                      />
                    </div>
                    {errors.company && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.company}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm">Password</Label>
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
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
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
                      <span className="text-sm font-normal">I'm not a robot</span>
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
                      id="agree"
                      checked={formState.agree}
                      onCheckedChange={(checked) => handleCheckboxChange('agree')(Boolean(checked))}
                      required
                    />
                    <span className="text-xs leading-tight">
                      I agree to the{' '}
                      <Link href="/legal" className="font-semibold text-primary hover:underline">
                        Terms
                      </Link>
                      {' '}&{' '}
                      <Link href="/legal" className="font-semibold text-primary hover:underline">
                        Privacy
                      </Link>
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
                      onClick={() => {
                        // Dummy - non-functional
                        toast.info('Google sign-up coming soon')
                      }}
                    >
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
    </div>
  )
}

