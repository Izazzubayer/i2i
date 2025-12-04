"use client"

import { useState } from 'react'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle, 
  Book, 
  Video, 
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Zap,
  Shield,
  CreditCard,
  Upload,
  Download,
  Settings,
  Users
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    questions: [
      {
        question: 'How do I get started with i2i?',
        answer: 'Sign up for a free account, choose your plan, and start uploading images. You can process up to 10 images in your first trial. Our AI will guide you through the process with natural language instructions.'
      },
      {
        question: 'What file formats do you support?',
        answer: 'We support JPG, PNG, TIFF, WebP, and RAW formats (CR2, NEF, ARW). Maximum file size is 50MB per image. For batch processing, you can upload up to 100 images at once.'
      },
      {
        question: 'How long does image processing take?',
        answer: 'Most images are processed within 2-5 minutes depending on complexity. Batch jobs may take longer. You\'ll receive real-time updates and can track progress in your Orders dashboard.'
      },
      {
        question: 'Can I try i2i before purchasing?',
        answer: 'Yes! Sign up for a free account and get 10 free image credits to test our service. No credit card required for the trial.'
      }
    ]
  },
  {
    category: 'Billing & Plans',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and wire transfers for enterprise accounts. All payments are processed securely through Stripe.'
      },
      {
        question: 'Can I change my plan at any time?',
        answer: 'Yes, you can upgrade or downgrade your plan anytime from the Billing page. Changes take effect immediately, and we\'ll prorate any charges or credits.'
      },
      {
        question: 'Do unused credits roll over?',
        answer: 'Yes, with annual plans, unused credits roll over to the next month. Monthly plan credits expire at the end of each billing cycle. Enterprise plans have custom rollover policies.'
      },
      {
        question: 'What is your refund policy?',
        answer: 'We offer a 30-day money-back guarantee for new customers. If you\'re not satisfied, contact support for a full refund. Credits already used will be deducted from the refund amount.'
      }
    ]
  },
  {
    category: 'Image Processing',
    icon: Upload,
    questions: [
  {
    question: 'How do I track processing progress?',
        answer: 'Visit the Orders section and open a job to see live progress and step-by-step logs. You\'ll also receive email notifications when processing is complete.'
      },
      {
        question: 'What AI models do you use?',
        answer: 'We use a combination of GPT-4 Vision, Gemini Pro Vision, and proprietary models including NanoBanana, Seedream, and Reve for different processing tasks to ensure the best results.'
      },
      {
        question: 'Can I request revisions?',
        answer: 'Yes! Each processed image includes a "Request Retouch" option. Describe what you\'d like changed, and we\'ll reprocess it at no additional cost (one free revision per image).'
      },
      {
        question: 'Do you support batch processing?',
        answer: 'Absolutely! Upload up to 100 images at once. You can apply the same instructions to all images or customize instructions for each one.'
      }
    ]
  },
  {
    category: 'Downloads & Delivery',
    icon: Download,
    questions: [
  {
    question: 'Can I re-download completed assets?',
        answer: 'Yes. Open any completed order and click "Download All" or select specific assets. Files are stored for 90 days, with extended storage available for Pro and Enterprise plans.'
      },
      {
        question: 'What download formats are available?',
        answer: 'You can download in the original format or convert to JPG, PNG, TIFF, or WebP. Choose your preferred format and quality settings before downloading.'
  },
  {
        question: 'Do you offer FTP/SFTP delivery?',
        answer: 'Yes! Enterprise plans include automated FTP/SFTP delivery to your servers. Configure your delivery settings in the Integrations page.'
      },
      {
        question: 'Can I integrate with my DAM system?',
        answer: 'Yes, we integrate with major DAM systems including Adobe Experience Manager, Cloudinary, Bynder, and more. Check our Integrations page for the full list.'
      }
    ]
  },
  {
    category: 'Account & Security',
    icon: Shield,
    questions: [
      {
        question: 'Is my data secure?',
        answer: 'Yes. We use bank-grade encryption (AES-256) for data at rest and TLS 1.3 for data in transit. We\'re SOC 2 Type II certified and GDPR compliant.'
      },
      {
        question: 'Who can access my images?',
        answer: 'Only you and authorized team members can access your images. Our AI processes images automatically without human review. Images are deleted from our servers after 90 days unless you have extended storage.'
      },
      {
        question: 'Can I add team members?',
        answer: 'Yes! Pro and Enterprise plans support multiple users. Invite team members from the Account Settings page and assign roles with different permission levels.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Account Settings > Security and click "Delete Account". This will permanently delete all your data. You can export your data before deletion.'
      }
    ]
  },
  {
    category: 'API & Integrations',
    icon: Settings,
    questions: [
      {
        question: 'Do you have an API?',
        answer: 'Yes! We offer a comprehensive RESTful API for all plans. Visit the API Documentation page to get started. API keys can be generated from your account dashboard.'
      },
      {
        question: 'What integrations do you support?',
        answer: 'We integrate with Shopify, WooCommerce, Adobe Creative Cloud, Dropbox, Google Drive, Slack, and many more. Check our Integrations page for the complete list.'
      },
      {
        question: 'Can I automate my workflow?',
        answer: 'Yes! Use our API, webhooks, or Zapier integration to automate image uploads, processing, and delivery. Enterprise plans include custom workflow automation.'
      },
      {
        question: 'What are the API rate limits?',
        answer: 'Standard plans: 1,000 requests/hour. Pro plans: 10,000 requests/hour. Enterprise plans have custom rate limits based on your needs.'
      }
    ]
  }
]

const contactMethods = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    availability: 'Available 24/7',
    action: 'Start Chat',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'support@i2i.ai',
    availability: 'Response within 4 hours',
    action: 'Send Email',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: '+1 (555) 123-4567',
    availability: 'Mon-Fri, 9AM-6PM EST',
    action: 'Call Now',
    color: 'text-purple-600 dark:text-purple-400'
  }
]

const resources = [
  {
    icon: Book,
    title: 'Documentation',
    description: 'Complete guides and tutorials',
    link: '/api-docs',
    color: 'bg-blue-500'
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Step-by-step video guides',
    link: '#',
    color: 'bg-red-500'
  },
  {
    icon: FileText,
    title: 'Blog & Articles',
    description: 'Tips, tricks, and best practices',
    link: '/how-i2i-works',
    color: 'bg-green-500'
  },
  {
    icon: Users,
    title: 'Community Forum',
    description: 'Connect with other users',
    link: '#',
    color: 'bg-purple-500'
  }
]

const ticketStatuses = [
  { label: 'Open', value: 'open', color: 'bg-blue-500' },
  { label: 'In Progress', value: 'in-progress', color: 'bg-yellow-500' },
  { label: 'Resolved', value: 'resolved', color: 'bg-green-500' }
]

export default function SupportPage() {
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketCategory, setTicketCategory] = useState('')
  const [ticketPriority, setTicketPriority] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketCategory || !ticketMessage) {
      toast.error('Please fill in all required fields')
      return
    }

    // In production, this would submit to an API
    toast.success('Support ticket submitted successfully! We\'ll respond within 4 hours.')
    
    // Reset form
    setTicketSubject('')
    setTicketCategory('')
    setTicketPriority('')
    setTicketMessage('')
  }

  const filteredFaqs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-10 space-y-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">How can we help you?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant answers, submit a support ticket, or connect with our team
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for answers..."
                className="pl-12 h-14 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">&lt; 4 hrs</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-muted-foreground">Support Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Methods */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card key={method.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className={`p-3 rounded-full bg-muted w-fit ${method.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{method.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{method.availability}</span>
                        </div>
                      </div>
                      <Button className="w-full">{method.action}</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="faq">
              <HelpCircle className="mr-2 h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="ticket">
              <MessageSquare className="mr-2 h-4 w-4" />
              Submit Ticket
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Book className="mr-2 h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-8">
            <div className="space-y-8">
              {filteredFaqs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try a different search term or browse all categories
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaqs.map((category) => {
                  const Icon = category.icon
                  return (
                    <Card key={category.category}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <CardTitle>{category.category}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {category.questions.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                              <AccordionTrigger className="text-left">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Submit Ticket Tab */}
          <TabsContent value="ticket" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>
                  Our support team will respond within 4 hours during business hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="api">API Support</SelectItem>
                        <SelectItem value="account">Account Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={ticketPriority} onValueChange={setTicketPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General question</SelectItem>
                      <SelectItem value="medium">Medium - Issue affecting work</SelectItem>
                      <SelectItem value="high">High - Urgent issue</SelectItem>
                      <SelectItem value="critical">Critical - Service down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[200px]"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include any error messages, screenshots, or relevant details
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={handleSubmitTicket} className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTicketSubject('')
                      setTicketCategory('')
                      setTicketPriority('')
                      setTicketMessage('')
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2">
              {resources.map((resource) => {
                const Icon = resource.icon
                return (
                  <Card key={resource.title} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${resource.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {resource.description}
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={resource.link} className="gap-2">
                              View {resource.title}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Additional Resources */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/api-docs" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">API Documentation</p>
                        <p className="text-sm text-muted-foreground">Complete API reference and guides</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  
                  <Link href="/pricing" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pricing & Plans</p>
                        <p className="text-sm text-muted-foreground">Compare plans and features</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link href="/portfolio" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Portfolio Examples</p>
                        <p className="text-sm text-muted-foreground">See what i2i can do</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Banner */}
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-semibold">All Systems Operational</p>
                  <p className="text-sm text-muted-foreground">Last checked: Just now</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="#" className="gap-2">
                  View Status Page
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Still need help?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our support team is available 24/7 to assist you. Get in touch and we&apos;ll respond as quickly as possible.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Start Live Chat
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:support@i2i.ai" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
