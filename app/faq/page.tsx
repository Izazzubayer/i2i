"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqData = {
  general: [
    {
      question: "Who uses i2i?",
      answer: "i2i is designed for photographers, designers, marketing teams, e-commerce businesses, and anyone who needs professional image processing and enhancement. Our platform is ideal for individuals and teams looking to streamline their image workflow and improve visual content quality."
    },
    {
      question: "How do I use i2i?",
      answer: "Using i2i is simple: 1) Sign up for an account, 2) Upload your images through the dashboard, 3) Select your processing preferences, 4) Submit your order, and 5) Download your enhanced images once processing is complete. You can track all your orders in real-time through the processing page."
    },
    {
      question: "What types of images can I process?",
      answer: "i2i supports a wide range of image formats including JPEG, PNG, TIFF, and RAW files. You can process product photos, portraits, landscapes, architectural images, and more. Our AI-powered processing works with various image types and sizes."
    },
    {
      question: "How long does processing take?",
      answer: "Processing time varies depending on the number of images and the complexity of your order. Typically, small batches (1-10 images) are processed within a few minutes, while larger batches may take 15-30 minutes. You'll receive a notification once your order is complete."
    },
    {
      question: "Is there a limit to how many images I can process?",
      answer: "Processing limits depend on your subscription plan. Free plans have lower limits, while Pro and Enterprise plans offer higher batch limits and priority processing. Check your plan details in the billing section for specific limits."
    }
  ],
  accountManagement: [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Sign Up' button on the homepage. You'll need to provide your email address, create a password, and verify your email. Once verified, you can start using i2i immediately."
    },
    {
      question: "How do I reset my password?",
      answer: "If you've forgotten your password, click 'Forgot Password' on the sign-in page. Enter your email address, and you'll receive a password reset link. Click the link in the email to create a new password."
    },
    {
      question: "Can I change my email address?",
      answer: "Yes, you can update your email address in the Account Settings page. After changing your email, you'll need to verify the new address before it becomes active."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to Account Settings and scroll to the 'Delete Account' section. Follow the prompts to permanently delete your account and all associated data. This action cannot be undone."
    },
    {
      question: "How do I update my profile information?",
      answer: "You can update your profile information, including name, company, and preferences, in the Account Settings page. Changes are saved automatically."
    }
  ],
  ipwOrders: [
    {
      question: "What is IPW?",
      answer: "IPW stands for Image Processing Workflow. It's our comprehensive system for managing image processing orders from upload to delivery. The IPW allows you to track orders, view processing status, and manage your image batches efficiently."
    },
    {
      question: "How do I place an order?",
      answer: "To place an order: 1) Navigate to the upload section, 2) Select or drag and drop your images, 3) Configure processing settings and preferences, 4) Review your order summary, and 5) Submit the order. You'll receive an order ID to track progress."
    },
    {
      question: "How do I track my order status?",
      answer: "You can track your order status in the Orders page or the Processing page. Each order shows real-time status updates including: pending, processing, completed, or failed. You'll also receive email notifications at key stages."
    },
    {
      question: "What happens if my order fails?",
      answer: "If an order fails, you'll receive a notification with error details. Common issues include unsupported file formats, corrupted files, or processing errors. You can retry the order or contact support for assistance. Credits are typically refunded for failed orders."
    },
    {
      question: "Can I cancel an order?",
      answer: "Orders can be cancelled if they haven't started processing yet. Once processing begins, orders cannot be cancelled. Check your order status in the Orders page to see if cancellation is available."
    },
    {
      question: "How long are completed orders stored?",
      answer: "Completed orders and processed images are stored in your account for 90 days. After this period, files may be archived. We recommend downloading your processed images promptly to ensure you have permanent copies."
    }
  ],
  billingPayment: [
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. Enterprise customers may also arrange for invoicing and wire transfers."
    },
    {
      question: "How does billing work?",
      answer: "Billing is subscription-based with monthly or annual plans. You're charged at the beginning of each billing cycle. Usage-based charges (if applicable) are added to your next invoice. You can view your billing history in the Billing section."
    },
    {
      question: "Can I change my subscription plan?",
      answer: "Yes, you can upgrade or downgrade your plan at any time in the Billing section. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle."
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "If you exceed your plan's processing limits, you'll need to upgrade your plan or purchase additional credits. You'll receive notifications when approaching your limits to help you plan accordingly."
    },
    {
      question: "How do I update my payment method?",
      answer: "You can update your payment method in the Billing section under 'Payment Methods'. Add, edit, or remove payment methods as needed. Your default payment method is used for automatic renewals."
    },
    {
      question: "Can I get a refund?",
      answer: "Refunds are available for unused portions of subscriptions within 30 days of purchase, subject to our refund policy. Processing credits are generally non-refundable once used, but failed orders are automatically refunded."
    }
  ],
  notifications: [
    {
      question: "How do I manage my notification preferences?",
      answer: "You can manage all notification preferences in the Account > Notifications page. Toggle individual notification types on or off, including order updates, system alerts, promotional emails, and more."
    },
    {
      question: "What types of notifications will I receive?",
      answer: "You can receive notifications for: order completion, order failures/errors, new release updates, maintenance alerts, promotional offers, blog publications, password changes, and responses to contact inquiries."
    },
    {
      question: "Can I disable all notifications?",
      answer: "Yes, you can disable all email notifications using the master toggle in the Notifications settings. However, we recommend keeping critical notifications (like order status) enabled for important updates."
    },
    {
      question: "How do I change my notification delivery method?",
      answer: "Currently, notifications are delivered via email. In-app notifications are coming soon. You can manage which types of notifications you receive in the Notifications settings page."
    }
  ],
  securityPrivacy: [
    {
      question: "How secure is my data?",
      answer: "We take security seriously. All data is encrypted in transit (SSL/TLS) and at rest. We use industry-standard security practices including secure authentication, regular security audits, and compliance with data protection regulations."
    },
    {
      question: "What data do you collect?",
      answer: "We collect account information (email, name), usage data (orders, processing history), and payment information (processed securely through payment providers). We do not sell your personal data to third parties."
    },
    {
      question: "How long do you store my images?",
      answer: "Processed images are stored for 90 days after order completion. Original uploads are deleted after processing unless you explicitly request retention. You can download your images at any time during the storage period."
    },
    {
      question: "Who has access to my images?",
      answer: "Only you have access to your images. Our processing systems access images temporarily for processing purposes only. We do not share, sell, or use your images for any purpose other than providing the service you've requested."
    },
    {
      question: "How do I report a security concern?",
      answer: "If you discover a security vulnerability or have concerns, please contact our security team immediately through the Contact page or email security@i2i.com. We take all security reports seriously and respond promptly."
    },
    {
      question: "Do you comply with GDPR and other privacy regulations?",
      answer: "Yes, we comply with GDPR, CCPA, and other applicable privacy regulations. You have the right to access, modify, or delete your personal data at any time through your account settings or by contacting support."
    }
  ],
  contact: [
    {
      question: "How do I contact support?",
      answer: "You can contact support through the Contact page on our website. Fill out the contact form with your inquiry, and our team will respond within 24-48 hours. For urgent issues, use the priority support option if available on your plan."
    },
    {
      question: "What are your support hours?",
      answer: "Standard support is available Monday-Friday, 9 AM - 6 PM EST. Pro and Enterprise plan customers receive extended support hours. Emergency support may be available for critical issues."
    },
    {
      question: "Can I schedule a demo or consultation?",
      answer: "Yes! Enterprise customers can schedule a personalized demo or consultation. Contact our sales team through the Contact page or email sales@i2i.com to arrange a meeting."
    },
    {
      question: "Where can I find API documentation?",
      answer: "API documentation is available in the API Docs section of your account. This includes endpoints, authentication methods, code examples, and integration guides for developers."
    },
    {
      question: "How do I report a bug or suggest a feature?",
      answer: "You can report bugs or suggest features through the Contact page. Select 'Bug Report' or 'Feature Request' as your inquiry type. Our product team reviews all submissions regularly."
    }
  ]
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold leading-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground leading-relaxed mt-2">
            Find answers to common questions about i2i. If you can&apos;t find what you&apos;re looking for, please contact our support team.
          </p>
        </div>

        {/* General Topics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">General Topics</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.general.map((item, index) => (
              <AccordionItem key={index} value={`general-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* User Account Management */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">User Account Management</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.accountManagement.map((item, index) => (
              <AccordionItem key={index} value={`account-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* IPW & Orders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">IPW & Orders</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.ipwOrders.map((item, index) => (
              <AccordionItem key={index} value={`ipw-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Billing & Payment */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Billing & Payment</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.billingPayment.map((item, index) => (
              <AccordionItem key={index} value={`billing-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.notifications.map((item, index) => (
              <AccordionItem key={index} value={`notifications-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Security & Privacy */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Security & Privacy</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.securityPrivacy.map((item, index) => (
              <AccordionItem key={index} value={`security-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.contact.map((item, index) => (
              <AccordionItem key={index} value={`contact-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-6 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <a 
            href="/support" 
            className="inline-flex items-center text-primary hover:underline font-medium"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  )
}

