"use client"

import { useState } from 'react'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function AccountPage() {
  const [username, setUsername] = useState('johndoe')
  const [email, setEmail] = useState('john@example.com')
  const [avatar, setAvatar] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    // In a real app, this would save to the backend
    toast.success('Profile updated successfully')
    if (avatarFile) {
      setAvatar(avatarPreview)
      setAvatarFile(null)
    }
  }

  const handleDeleteAccount = () => {
    // In a real app, this would delete the account
    toast.error('Account deletion is not implemented in this demo')
    setDeleteDialogOpen(false)
  }

  const handleExportData = () => {
    toast.info('Data export feature coming soon')
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground">
            Manage your profile information and account settings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              View or change your username, email, and profile photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                  {username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Change Avatar
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {avatarPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAvatarPreview('')
                        setAvatarFile(null)
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              <p className="text-xs text-muted-foreground">
                This is your unique identifier. You can change it at any time.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <p className="text-xs text-muted-foreground">
                This is the email address associated with your account.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveProfile}>Save Changes</Button>
              <Button variant="outline" onClick={() => {
                setUsername('johndoe')
                setEmail('john@example.com')
                setAvatarPreview('')
                setAvatarFile(null)
              }}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* DAM Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Connect to Your DAM</CardTitle>
            <CardDescription>
              Connect your Digital Asset Management system to automatically sync processed images.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dam-select">Select Your DAM</Label>
              <Select defaultValue="">
                <SelectTrigger id="dam-select">
                  <SelectValue placeholder="Choose a DAM provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bynder">Bynder</SelectItem>
                  <SelectItem value="adobe">Adobe Experience Manager</SelectItem>
                  <SelectItem value="cloudinary">Cloudinary</SelectItem>
                  <SelectItem value="brandfolder">Brandfolder</SelectItem>
                  <SelectItem value="canto">Canto</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dam-url">Workspace URL</Label>
              <Input
                id="dam-url"
                placeholder="https://your-workspace.dam.com"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dam-username">Username / API Key</Label>
              <Input
                id="dam-username"
                placeholder="Enter your username or API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dam-password">Password / API Secret</Label>
              <Input
                id="dam-password"
                type="password"
                placeholder="Enter your password or API secret"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="save-dam-credentials" />
              <Label htmlFor="save-dam-credentials" className="text-sm cursor-pointer font-normal">
                Save DAM login info for future use
              </Label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => toast.success('DAM connection saved successfully')}>
                Connect to DAM
              </Button>
              <Button variant="outline" onClick={() => toast.info('Testing connection...')}>
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Account Deletion</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Warning: This action cannot be undone</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This will permanently delete your account, all your orders, images, and data. 
                  We recommend exporting your data before proceeding.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportData}>
                Export Data
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      Are you absolutely sure? This will permanently delete your account and all associated data. 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      To confirm, please type <strong className="text-foreground">DELETE</strong> in the field below:
                    </p>
                    <Input
                      id="delete-confirm"
                      placeholder="Type DELETE to confirm"
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
