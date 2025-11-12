"use client"

import { useState } from 'react'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketing, setMarketing] = useState(false)
  const [blog, setBlog] = useState(false)
  const [notificationMethod, setNotificationMethod] = useState('email')

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast.success('Notification preferences saved')
  }

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
                  Receive email notifications for important updates and activities.
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
            <CardTitle>Marketing & Blog Notifications</CardTitle>
            <CardDescription>
              Choose to receive marketing communications and blog updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="marketing" className="font-medium cursor-pointer">
                  Marketing
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Product releases, feature updates, promotional offers, and case studies.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={marketing}
                onCheckedChange={setMarketing}
              />
            </div>

            <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
              <div className="flex-1">
                <Label htmlFor="blog" className="font-medium cursor-pointer">
                  Blog
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified about new blog posts, tutorials, and industry insights.
                </p>
              </div>
              <Switch
                id="blog"
                checked={blog}
                onCheckedChange={setBlog}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Delivery Method</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-method">Delivery Method</Label>
              <Select value={notificationMethod} onValueChange={setNotificationMethod}>
                <SelectTrigger id="notification-method">
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="app">In-App</SelectItem>
                  <SelectItem value="both">Both Email & In-App</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Notifications will be delivered via your selected method.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </div>
    </div>
  )
}
