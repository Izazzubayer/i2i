"use client"

import { useState, useEffect } from 'react'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getProfile } from '@/api/users/users'

export default function AccountPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const response = await getProfile()
        
        // Extract user data from API response
        // Adjust these field names based on actual API response structure
        if (response.success && response.data) {
          const userData = response.data
          setUsername(userData.displayName || userData.username || userData.name || '')
          setEmail(userData.email || '')
          setCompanyName(userData.companyName || userData.company || '')
          setAvatar(userData.avatar || userData.profilePicture || '')
        } else if (response.data) {
          // If response structure is different
          const userData = response.data
          setUsername(userData.displayName || userData.username || userData.name || '')
          setEmail(userData.email || '')
          setCompanyName(userData.companyName || userData.company || '')
          setAvatar(userData.avatar || userData.profilePicture || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile. Please try again.')
        
        // Fallback to localStorage data if API fails
        const localUser = localStorage.getItem('user')
        if (localUser) {
          try {
            const userData = JSON.parse(localUser)
            setUsername(userData.displayName || userData.name || '')
            setEmail(userData.email || '')
            setCompanyName(userData.companyName || '')
          } catch (e) {
            console.error('Error parsing local user data:', e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleAvatarChange = (e) => {
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
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement update profile API call
      // For now, just show success message
      toast.success('Profile updated successfully')
      if (avatarFile) {
        setAvatar(avatarPreview)
        setAvatarFile(null)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = () => {
    // In a real appthis would delete the account
    toast.error('Account deletion is not implemented in this demo')
    setDeleteDialogOpen(false)
  }

  const handleExportData = () => {
    toast.info('Data export feature coming soon')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AuthenticatedNav />
        <div className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
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
                  {username ? username.substring(0, 2).toUpperCase() : email ? email.substring(0, 2).toUpperCase() : 'U'}
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
            <div className="space-y-2 opacity-60">
              <Label htmlFor="email" className="cursor-not-allowed">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled
                className="cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                This is the email address associated with your account. Email cannot be changed.
              </p>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
              />
              <p className="text-xs text-muted-foreground">
                The name of your company or organization.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} disabled={isSaving || isLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Reset to original values from API
                  const localUser = localStorage.getItem('user')
                  if (localUser) {
                    try {
                      const userData = JSON.parse(localUser)
                      setUsername(userData.displayName || userData.name || '')
                      setEmail(userData.email || '')
                      setCompanyName(userData.companyName || '')
                    } catch (e) {
                      console.error('Error parsing local user data:', e)
                    }
                  }
                  setAvatarPreview('')
                  setAvatarFile(null)
                }}
                disabled={isLoading}
              >
                Reset
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
                      To confirmplease type <strong className="text-foreground">DELETE</strong> in the field below:
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
