"use client"

import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'

const notificationPreferences = [
  {
    title: 'Processing Updates',
    description: 'Email me when a job completes or fails.',
    enabled: true,
  },
  {
    title: 'Weekly Usage Summary',
    description: 'Monday recap of credits used and remaining.',
    enabled: true,
  },
  {
    title: 'Product Announcements',
    description: 'Major releases and best-practice guides.',
    enabled: false,
  },
  {
    title: 'Security Alerts',
    description: 'Receive a notification when a new device signs in.',
    enabled: true,
  },
]

const connectedApps = [
  { name: 'Slack Workspace', detail: 'notifications@studio.slack.com', status: 'Active' },
  { name: 'Zapier Automation', detail: 'Order summary to Google Sheets', status: 'Active' },
]

const damSettings = {
  provider: 'Bynder DAM',
  workspaceUrl: 'https://studio-assets.bynder.com',
  status: 'Connected',
  lastSync: '15 minutes ago',
}

const badgeClassByStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'cursor-default bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200 hover:bg-green-100'
    case 'connected':
      return 'cursor-default bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 hover:bg-blue-100'
    case 'disconnected':
      return 'cursor-default bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 hover:bg-red-100'
    default:
      return 'cursor-default bg-muted text-foreground hover:bg-muted'
  }
}

const activeSessions = [
  { device: 'MacBook Pro · Chrome', location: 'Brooklyn, USA', lastActive: '2 minutes ago' },
  { device: 'iPhone 15 · Safari', location: 'Brooklyn, USA', lastActive: '2 hours ago' },
]

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, security preferences, integrations, and compliance settings.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="inline-flex h-10 flex-wrap items-center gap-1 rounded-lg bg-muted p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Login & Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="dam">DAM Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Shared internally with collaborators on your team.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <Input defaultValue="Creative Producer" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" defaultValue="john@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Time Zone</label>
                  <Input defaultValue="GMT-04:00 (Eastern Time)" />
                </div>
                <div className="md:col-span-2">
                  <Button>Save Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Login & Security</CardTitle>
                <CardDescription>Update your password and enable two-factor authentication.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="md:col-span-2">
                  <Button>Update Password</Button>
                </div>
                <div className="md:col-span-2 flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to require a one-time code at sign-in.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Apps</CardTitle>
                <CardDescription>Manage integrations that sync orders, notifications, or assets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedApps.map((app) => (
                  <div key={app.name} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-sm text-muted-foreground">{app.detail}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={badgeClassByStatus(app.status)}>{app.status}</Badge>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline">Add Integration</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dam" className="space-y-6">
            <div className="flex justify-end">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add DAM
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>DAM Settings</CardTitle>
                <CardDescription>
                  Configure where processed assets are delivered after each order completes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="cursor-default hover:bg-secondary">
                    {damSettings.provider}
                  </Badge>
                  <Badge className={badgeClassByStatus(damSettings.status)}>{damSettings.status}</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workspace URL</label>
                  <Input defaultValue={damSettings.workspaceUrl} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <Input placeholder="••••••••••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination Folder</label>
                  <Input defaultValue="/2025/Product Launch" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Last successful sync {damSettings.lastSync}. Update credentials if your DAM workspace recently rotated keys.
                </p>
                <div className="flex gap-2">
                  <Button>Save DAM Settings</Button>
                  <Button variant="outline">Disconnect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how your team receives updates about processing activity and product news.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationPreferences.map((pref) => (
                  <div key={pref.title} className="flex items-start justify-between gap-4 border rounded-lg p-4">
                    <div>
                      <p className="font-medium">{pref.title}</p>
                      <p className="text-sm text-muted-foreground">{pref.description}</p>
                    </div>
                    <Switch defaultChecked={pref.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>Sign out of any sessions you no longer recognize.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.device} className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                      <p className="font-medium">{session.device}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.location} · Last active {session.lastActive}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>
                  Export all current orders and request permanent deletion of your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Download a full data export before submitting a deletion request. This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">Export Data</Button>
                  <Button variant="destructive">Delete Workspace</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
