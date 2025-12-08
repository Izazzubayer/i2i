'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  MapPin,
  Clock,
  HelpCircle,
  Bug,
  Lightbulb,
  Briefcase,
  User,
  RefreshCw,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry', icon: MessageSquare },
  { value: 'support', label: 'Technical Support', icon: HelpCircle },
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb },
  { value: 'sales', label: 'Sales & Enterprise', icon: Briefcase },
  { value: 'other', label: 'Other', icon: User },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Image Captcha state
  const [captcha, setCaptcha] = useState({ 
    images: [],
    correctImage: '',
    selectedImage: '',
    question: ''
  })
  const [captchaError, setCaptchaError] = useState(false)
  
  // Generate image captcha
  const generateCaptcha = () => {
    // Simulated image URLs - in production, these would come from your backend
    const allImages = [
      { id: 'cat', label: 'Cat', emoji: '🐱' },
      { id: 'dog', label: 'Dog', emoji: '🐶' },
      { id: 'bird', label: 'Bird', emoji: '🐦' },
      { id: 'car', label: 'Car', emoji: '🚗' },
      { id: 'tree', label: 'Tree', emoji: '🌳' },
      { id: 'house', label: 'House', emoji: '🏠' },
      { id: 'sun', label: 'Sun', emoji: '☀️' },
      { id: 'star', label: 'Star', emoji: '⭐' },
    ]
    
    // Select 4 random images
    const shuffled = [...allImages].sort(() => 0.5 - Math.random())
    const selectedImages = shuffled.slice(0, 4)
    const correctImage = selectedImages[Math.floor(Math.random() * selectedImages.length)]
    
    setCaptcha({
      images: selectedImages,
      correctImage: correctImage.id,
      selectedImage: '',
      question: `Select the ${correctImage.label.toLowerCase()}`
    })
    setCaptchaError(false)
  }
  
  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.inquiryType || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Image Captcha validation
    if (!captcha.selectedImage || captcha.selectedImage !== captcha.correctImage) {
      setCaptchaError(true)
      toast.error('Please select the correct image')
      generateCaptcha() // Generate new captcha on failure
      return
    }

    setIsSubmitting(true)
    setCaptchaError(false)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real app, you would send this to your API
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      setIsSubmitted(true)
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      
      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          inquiryType: '',
          subject: '',
          message: '',
        })
        generateCaptcha() // Generate new captcha
        setIsSubmitted(false)
      }, 5000)
    } catch (error) {
      toast.error('Failed to send message. Please try again or email us directly.')
      console.error('Contact form error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
              <p className="text-muted-foreground text-lg">
                Your message has been sent successfully. Our team will get back to you within 24-48 hours.
              </p>
            </div>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Send Another Message
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question or need help? We&apos;re here to assist you. Fill out the form below or reach out through our other channels.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:support@i2i.ai" className="text-primary hover:underline">
                  support@i2i.ai
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  For general inquiries and support
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:sales@i2i.ai" className="text-primary hover:underline">
                  sales@i2i.ai
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  For enterprise inquiries and partnerships
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Monday - Friday</p>
                  <p className="text-muted-foreground">9:00 AM - 6:00 PM EST</p>
                  <p className="text-muted-foreground mt-3">
                    Extended hours available for Pro and Enterprise customers
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="/faq" className="block text-sm text-primary hover:underline">
                  Frequently Asked Questions
                </a>
                <a href="/api-docs" className="block text-sm text-primary hover:underline">
                  API Documentation
                </a>
                <a href="/support" className="block text-sm text-primary hover:underline">
                  Support Center
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                    />
                  </div>

                  {/* Inquiry Type */}
                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">Inquiry Type *</Label>
                    <Select
                      value={formData.inquiryType}
                      onValueChange={(value) => handleChange('inquiryType', value)}
                      required
                    >
                      <SelectTrigger id="inquiryType">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of your inquiry (optional)"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Please provide as much detail as possible to help us assist you better.
                    </p>
                  </div>

                  {/* Image Captcha */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Verification *
                    </Label>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">{captcha.question}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {captcha.images.map((image) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => {
                              setCaptcha(prev => ({ ...prev, selectedImage: image.id }))
                              setCaptchaError(false)
                            }}
                            className={`p-6 border-2 rounded-lg transition-all hover:scale-105 ${
                              captcha.selectedImage === image.id
                                ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50'
                            } ${captchaError ? 'border-red-500' : ''}`}
                          >
                            <div className="text-5xl mb-2">{image.emoji}</div>
                            <div className="text-xs text-muted-foreground">{image.label}</div>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={generateCaptcha}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          New Challenge
                        </Button>
                        {captchaError && (
                          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            Incorrect selection. Please try again.
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select the correct image to verify you&apos;re human and prevent spam.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Send className="h-4 w-4" />
                        </motion.div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <HelpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Response Time</p>
                    <p>
                      We typically respond within 24-48 hours during business days. 
                      For urgent matters, please indicate &quot;Urgent&quot; in your subject line.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
