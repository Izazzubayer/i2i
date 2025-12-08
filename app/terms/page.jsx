'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  Shield, 
  AlertCircle,
  Mail,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Last Updated: November 27, 2025</span>
                </div>
                <Badge variant="outline">Version 1.0</Badge>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Please read these Terms of Service carefully before using the i2i platform.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Link href="/privacy">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Privacy Policy</p>
                    <p className="text-xs text-muted-foreground">Data handling</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/support">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Contact Support</p>
                    <p className="text-xs text-muted-foreground">Get help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-orange-800 dark:text-orange-300 mb-1">
                  Important Notice
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  By accessing or using the i2i platform, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </span>
              Acceptance of Terms
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service (&quot;Terms&quot;) govern your access to and use of the i2i platform 
                  (&quot;Service&quot;), operated by i2i Inc. (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). 
                  By creating an account, accessing our API, or using any part of the Service, you agree to 
                  comply with these Terms.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms apply to all users, including but not limited to individuals, organizations, 
                  API consumers, and enterprise clients. Additional terms may apply to specific features, 
                  services, or enterprise agreements.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </span>
              Description of Service
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  i2i is an enterprise-grade AI-powered image processing platform that provides:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>AI-driven image enhancement, background removal, and retouching services</li>
                  <li>Batch processing capabilities for multiple images</li>
                  <li>Integration with Digital Asset Management (DAM) platforms including Creative Force, 
                      Dalim, Shopify, Facebook, Instagram, GlobalEdit, and custom solutions</li>
                  <li>RESTful API access for programmatic image processing</li>
                  <li>FTP/SFTP delivery options for processed images</li>
                  <li>Cloud storage integration (AWS S3, Cloudinary)</li>
                  <li>AI models including GPT, Gemini, and proprietary algorithms (NanoBanana, Seedream, Reve)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any aspect of the Service at any 
                  time, with or without notice. We will make reasonable efforts to notify users of significant 
                  changes.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </span>
              User Accounts and Registration
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">3.1 Account Creation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To use the Service, you must create an account by providing accurate and complete information. 
                  You may register using:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Email and password (credential-based authentication)</li>
                  <li>Google OAuth 2.0</li>
                  <li>Microsoft Azure AD OAuth 2.0</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">3.2 Account Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for 
                  all activities that occur under your account. You must:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Use a strong, unique password</li>
                  <li>Not share your account credentials with others</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Secure your API keys and treat them as passwords</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">3.3 Account Eligibility</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 18 years old to use the Service. By creating an account, you represent 
                  and warrant that you meet this age requirement and have the legal capacity to enter into 
                  these Terms.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                4
              </span>
              Subscription Plans and Billing
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">4.1 Subscription Tiers</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Free Tier - $0/month</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>100 images per month</li>
                      <li>Basic image processing</li>
                      <li>Standard support</li>
                      <li>7-day order history</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Pro Tier - $49/month</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>1,000 images per month</li>
                      <li>Advanced image processing</li>
                      <li>Priority support</li>
                      <li>90-day order history</li>
                      <li>DAM integration</li>
                      <li>API access (1,000 requests/hour)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-muted">
                    <h4 className="font-semibold mb-2">Enterprise Tier - $199/month</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Unlimited images</li>
                      <li>All features in Pro</li>
                      <li>Dedicated support</li>
                      <li>Unlimited order history</li>
                      <li>Custom integrations</li>
                      <li>99.9% uptime SLA guarantee</li>
                      <li>White-label option</li>
                      <li>API access (10,000 requests/hour)</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">4.2 Payment Terms</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Subscriptions are billed monthly or annually in advance via Stripe. By providing payment 
                  information, you authorize us to charge your payment method for all fees incurred. You are 
                  responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Providing accurate and current billing information</li>
                  <li>Promptly updating payment methods if they expire or are cancelled</li>
                  <li>All applicable taxes and fees</li>
                  <li>All charges incurred under your account</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">4.3 Refund Policy</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All subscription fees are non-refundable except as required by law or as explicitly stated 
                  in these Terms. If you cancel your subscription, you will retain access to paid features 
                  until the end of your current billing period.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">4.4 Plan Changes and Cancellation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may upgrade, downgrade, or cancel your subscription at any time through your account 
                  settings. Plan changes take effect at the start of the next billing cycle. Upgrades are 
                  prorated; downgrades take effect at renewal.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                5
              </span>
              Acceptable Use Policy
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">5.1 Permitted Use</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may use the Service only for lawful purposes and in accordance with these Terms. 
                  Permitted uses include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Processing images you own or have rights to use</li>
                  <li>Commercial use of processed images within your subscription limits</li>
                  <li>Integration with your business systems via our API</li>
                  <li>Exporting processed images to your DAM or storage systems</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">5.2 Prohibited Activities</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree NOT to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Upload images containing illegal, harmful, or offensive content</li>
                  <li>Process images you do not own or have permission to use</li>
                  <li>Violate any intellectual property rights</li>
                  <li>Reverse engineer, decompile, or attempt to extract the source code of the Service</li>
                  <li>Use the Service to compete with or replicate our offerings</li>
                  <li>Exceed rate limits or abuse API access</li>
                  <li>Share or resell your account access</li>
                  <li>Transmit viruses, malware, or malicious code</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Bypass security measures or access controls</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">5.3 Content Restrictions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may not upload or process images that contain:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Illegal, fraudulent, or deceptive content</li>
                  <li>Content that infringes on intellectual property rights</li>
                  <li>Offensive, abusive, or hateful material</li>
                  <li>Violent, graphic, or disturbing imagery</li>
                  <li>Content that violates privacy rights</li>
                  <li>Spam or unsolicited promotional material</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                6
              </span>
              Intellectual Property Rights
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">6.1 Your Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You retain all ownership rights to the images you upload (&quot;Your Content&quot;). By 
                  uploading content to the Service, you grant us a limited, non-exclusive, worldwide license to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Store, process, and display Your Content as necessary to provide the Service</li>
                  <li>Use AI models to analyze and enhance Your Content</li>
                  <li>Create derivative works (processed images) at your request</li>
                  <li>Transfer Your Content to your designated DAM or storage systems</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  This license terminates when you delete Your Content or close your account, except for 
                  content you have publicly shared or distributed.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">6.2 Our Intellectual Property</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Service, including its software, algorithms, user interface, and documentation, is owned 
                  by i2i Inc. and protected by copyright, trademark, and other intellectual property laws. 
                  You may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Copy, modify, or create derivative works of the Service</li>
                  <li>Use our trademarks, logos, or branding without permission</li>
                  <li>Remove or alter any proprietary notices</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">6.3 Processed Images</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You own all processed images generated by the Service. We do not claim ownership of your 
                  processed images. However, you acknowledge that the processing algorithms and AI models used 
                  remain our proprietary technology.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                7
              </span>
              Privacy and Data Protection
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. Our collection, use, and protection of your personal 
                  information is governed by our Privacy Policy. Key points include:
                </p>

                <h3 className="font-semibold text-lg">7.1 Data Collection</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Account information (email, name, payment details)</li>
                  <li>Uploaded images and processing instructions</li>
                  <li>Usage data and analytics</li>
                  <li>API access logs and request metadata</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">7.2 Data Usage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use your data to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide and improve the Service</li>
                  <li>Process images using AI models</li>
                  <li>Communicate with you about your account and the Service</li>
                  <li>Comply with legal obligations</li>
                  <li>Detect and prevent fraud and abuse</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">7.3 Data Retention</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Uploaded images and processed results are retained according to your subscription tier:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Free Tier: 7 days</li>
                  <li>Pro Tier: 90 days</li>
                  <li>Enterprise Tier: Unlimited (until account deletion)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  You can request deletion of your data at any time by contacting support or using the account 
                  deletion feature.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">7.4 Data Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>End-to-end encryption for data in transit (TLS/SSL)</li>
                  <li>Encryption at rest for stored images</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>SOC 2 compliance</li>
                  <li>Role-based access controls</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                8
              </span>
              API Usage Terms
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">8.1 API Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  API access is available to Pro and Enterprise tier subscribers. You must:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Include your API key in the Authorization header of all requests</li>
                  <li>Keep your API keys secure and confidential</li>
                  <li>Rotate API keys if they are compromised</li>
                  <li>Not share API keys between different applications or users</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">8.2 Rate Limits</h3>
                <p className="text-muted-foreground leading-relaxed">
                  API usage is subject to rate limits based on your subscription:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Pro Tier: 1,000 requests per hour</li>
                  <li>Enterprise Tier: 10,000 requests per hour</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Exceeding rate limits may result in temporary throttling. Contact us for custom rate limits.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">8.3 API Availability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We strive for 99.9% uptime for Enterprise tier customers. While we aim for continuous 
                  availability, the API may be temporarily unavailable for maintenance, updates, or 
                  unforeseen issues.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                9
              </span>
              Termination and Account Deletion
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">9.1 Termination by You</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may terminate your account at any time through the account settings page. Upon 
                  termination:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Your subscription will be cancelled</li>
                  <li>You will lose access to the Service at the end of your billing period</li>
                  <li>Your data will be deleted according to our retention policy</li>
                  <li>You may export your data before deletion</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">9.2 Termination by Us</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We may suspend or terminate your account if you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Violate these Terms or our Acceptable Use Policy</li>
                  <li>Fail to pay fees when due</li>
                  <li>Use the Service in a way that could harm us or other users</li>
                  <li>Engage in fraudulent or illegal activity</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  We will provide reasonable notice before termination unless immediate termination is 
                  necessary to prevent harm.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">9.3 Effect of Termination</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upon termination, all licenses granted to you will immediately cease. Sections of these 
                  Terms that by their nature should survive termination will survive, including provisions 
                  regarding intellectual property, disclaimers, indemnification, and limitations of liability.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                10
              </span>
              Disclaimers and Limitations of Liability
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">10.1 Service Disclaimer</h3>
                <p className="text-muted-foreground leading-relaxed uppercase font-semibold">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES 
                  OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We disclaim all warranties, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                  <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                  <li>Warranties regarding the accuracy or reliability of AI-generated results</li>
                  <li>Warranties that defects will be corrected</li>
                </ul>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">10.2 Limitation of Liability</h3>
                <p className="text-muted-foreground leading-relaxed uppercase font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This includes damages for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                  <li>Unauthorized access to or use of our servers or your data</li>
                  <li>Interruption or cessation of transmission to or from the Service</li>
                  <li>Bugs, viruses, or harmful code transmitted through the Service</li>
                  <li>Errors or inaccuracies in content or data</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Our total liability for any claims related to the Service is limited to the amount you paid 
                  us in the 12 months preceding the claim.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">10.3 AI Model Limitations</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-generated results may not always meet your expectations. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>AI processing is not perfect and may produce unexpected results</li>
                  <li>You are responsible for reviewing and validating all processed images</li>
                  <li>We do not guarantee specific outcomes or quality levels</li>
                  <li>Results may vary based on input quality and instructions</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                11
              </span>
              Indemnification
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless i2i Inc., its officers, directors, 
                  employees, and agents from and against any claims, liabilities, damages, losses, and 
                  expenses (including reasonable attorney fees) arising out of or in any way connected with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of another party</li>
                  <li>Your content or any content uploaded through your account</li>
                  <li>Any claim that your content infringes upon intellectual property rights</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                12
              </span>
              Changes to Terms
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you of material 
                  changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                  <li>Posting the updated Terms on our website</li>
                  <li>Updating the &quot;Last Updated&quot; date at the top of this page</li>
                  <li>Sending an email notification to your registered email address</li>
                  <li>Displaying an in-app notification upon your next login</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Your continued use of the Service after changes are posted constitutes your acceptance of 
                  the updated Terms. If you do not agree to the changes, you must stop using the Service and 
                  close your account.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                13
              </span>
              Governing Law and Dispute Resolution
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">13.1 Governing Law</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of 
                  Delaware, United States, without regard to its conflict of law provisions.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">13.2 Dispute Resolution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Any disputes arising out of or relating to these Terms or the Service shall be resolved 
                  through:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Informal negotiation: Contact us at legal@i2i.ai to attempt resolution</li>
                  <li>Mediation: If informal negotiation fails, disputes will be submitted to mediation</li>
                  <li>Arbitration: Unresolved disputes will be settled by binding arbitration in accordance 
                      with the Commercial Arbitration Rules of the American Arbitration Association</li>
                </ol>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">13.3 Class Action Waiver</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to bring claims only in your individual capacity and not as a plaintiff or class 
                  member in any purported class or representative proceeding.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                14
              </span>
              General Provisions
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-lg">14.1 Entire Agreement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms, together with our Privacy Policy and any other legal notices published by us, 
                  constitute the entire agreement between you and i2i Inc. regarding the Service.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">14.2 Severability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision will 
                  be limited or eliminated to the minimum extent necessary so that these Terms will otherwise 
                  remain in full force and effect.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">14.3 No Waiver</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver 
                  of those rights.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">14.4 Assignment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You may not assign or transfer these Terms or your rights under them without our prior 
                  written consent. We may assign these Terms without restriction.
                </p>

                <div className="border-t my-4" />

                <h3 className="font-semibold text-lg">14.5 Force Majeure</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We shall not be liable for any failure or delay in performance due to circumstances beyond 
                  our reasonable control, including acts of God, natural disasters, war, terrorism, riots, 
                  labor disputes, or governmental actions.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                15
              </span>
              Contact Information
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <a href="mailto:legal@i2i.ai" className="text-primary hover:underline">
                        legal@i2i.ai
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">For legal and compliance inquiries</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Support</p>
                      <a href="mailto:support@i2i.ai" className="text-primary hover:underline">
                        support@i2i.ai
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">For technical support and questions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Mailing Address</p>
                      <p className="text-sm text-muted-foreground">
                        i2i Inc.<br />
                        Legal Department<br />
                        1234 Innovation Drive<br />
                        San Francisco, CA 94102<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Acknowledgment */}
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Acknowledgment</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    BY USING THE i2i PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO 
                    BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THE 
                    SERVICE.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Last Updated: November 27, 2025 | Version 1.0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-4 justify-center mt-12 pt-8 border-t">
          <Link href="/privacy">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </Button>
          </Link>
          <Link href="/support">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="gap-2">
              Get Started
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

