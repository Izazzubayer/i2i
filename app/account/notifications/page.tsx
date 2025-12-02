"use client"

import { useState } from 'react'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function NotificationsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderCompleted, setOrderCompleted] = useState(true)
  const [orderFailed, setOrderFailed] = useState(true)
  const [releaseUpdates, setReleaseUpdates] = useState(true)
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true)
  const [promotionalNotifications, setPromotionalNotifications] = useState(false)
  const [blogPublication, setBlogPublication] = useState(false)
  const [passwordChanges, setPasswordChanges] = useState(true)
  const [contactUsResponse, setContactUsResponse] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">
            Configure how you receive notifications and updates.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>
              Enable or disable email notifications for important updates and activities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="email-notifications" className="font-medium cursor-pointer">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Master toggle for all email notifications. Disable this to turn off all email notifications.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Notifications</CardTitle>
            <CardDescription>
              Get notified about your order status and processing updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="order-completed" className="font-medium cursor-pointer">
                  Order Completed
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive notifications when your order is successfully completed.
                </p>
              </div>
              <Switch
                id="order-completed"
                checked={orderCompleted}
                onCheckedChange={setOrderCompleted}
                disabled={!emailNotifications}
              />
            </div>

            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="order-failed" className="font-medium cursor-pointer">
                  Order Failed/Errors
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified immediately when an order fails or encounters errors.
                </p>
              </div>
              <Switch
                id="order-failed"
                checked={orderFailed}
                onCheckedChange={setOrderFailed}
                disabled={!emailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System & Updates</CardTitle>
            <CardDescription>
              Stay informed about platform updates and system maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="release-updates" className="font-medium cursor-pointer">
                  New Release Updates
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Be notified about new features, improvements, and platform releases.
                </p>
              </div>
              <Switch
                id="release-updates"
                checked={releaseUpdates}
                onCheckedChange={setReleaseUpdates}
                disabled={!emailNotifications}
              />
            </div>

            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="maintenance-alerts" className="font-medium cursor-pointer">
                  Maintenance Alerts
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive alerts about scheduled maintenance and system downtime.
                </p>
              </div>
              <Switch
                id="maintenance-alerts"
                checked={maintenanceAlerts}
                onCheckedChange={setMaintenanceAlerts}
                disabled={!emailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing & Content</CardTitle>
            <CardDescription>
              Choose to receive promotional communications and content updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="promotional" className="font-medium cursor-pointer">
                  Promotional Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive special offers, discounts, and promotional announcements.
                </p>
              </div>
              <Switch
                id="promotional"
                checked={promotionalNotifications}
                onCheckedChange={setPromotionalNotifications}
                disabled={!emailNotifications}
              />
            </div>

            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="blog-publication" className="font-medium cursor-pointer">
                  Publication of Blogs
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when new blog posts, tutorials, and articles are published.
                </p>
              </div>
              <Switch
                id="blog-publication"
                checked={blogPublication}
                onCheckedChange={setBlogPublication}
                disabled={!emailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account & Security</CardTitle>
            <CardDescription>
              Security-related notifications and account activity alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="password-changes" className="font-medium cursor-pointer">
                  Password Changes
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive notifications when your password is changed for security purposes.
                </p>
              </div>
              <Switch
                id="password-changes"
                checked={passwordChanges}
                onCheckedChange={setPasswordChanges}
                disabled={!emailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support & Communication</CardTitle>
            <CardDescription>
              Notifications related to support requests and communications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="contact-us-response" className="font-medium cursor-pointer">
                  Response to "Contact us"
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when you receive a response to your contact us inquiries.
                </p>
              </div>
              <Switch
                id="contact-us-response"
                checked={contactUsResponse}
                onCheckedChange={setContactUsResponse}
                disabled={!emailNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
