"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

const notifications = [
  {
    title: 'Processing Updates',
    description: 'Email me when a job finishes or encounters an error.',
    enabled: true,
  },
  {
    title: 'Weekly Usage Summary',
    description: 'Receive a Monday recap of credits used and remaining.',
    enabled: true,
  },
  {
    title: 'Marketing Announcements',
    description: 'Product releases, feature updates, and case studies.',
    enabled: false,
  },
]

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Select which alerts your team should receive about processing activity.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>
              Toggle individual streams to customize how you stay informed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-4 border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
