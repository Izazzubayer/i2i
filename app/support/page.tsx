"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

const faqs = [
  {
    question: 'How do I track processing progress?',
    answer: 'Visit the Orders section and open a job to see live progress and step-by-step logs.',
  },
  {
    question: 'Can I re-download completed assets?',
    answer: 'Yes. Open any completed order and click “Download All” or select specific assets.',
  },
  {
    question: 'How do I increase my credit limit?',
    answer: 'Navigate to Billing & Subscription to upgrade your plan or purchase additional credits.',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">
              Access the help center or create a support request for the production team.
            </p>
          </div>
          <Button variant="outline">Open Help Center</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Ticket</CardTitle>
              <CardDescription>Our team will follow up within one business day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Subject" />
              <Textarea placeholder="Describe your request..." className="min-h-[160px]" />
              <Button>Submit Ticket</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
              <CardDescription>Quick answers to the most frequent requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <p className="font-medium">{faq.question}</p>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
