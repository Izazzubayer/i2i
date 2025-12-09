"use client"

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { changePassword } from '@/api/users/users'

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial
  }

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      toast.error('Please enter your current password')
      return
    }
    if (!newPassword) {
      toast.error('Please enter a new password')
      return
    }
    if (!validatePassword(newPassword)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setIsLoading(true)
    try {
      const response = await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword,
      })

      // Check if change was successful
      if (response.success || response.status === 200) {
        toast.success(response.message || 'Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        throw new Error(response.message || 'Failed to update password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      
      // Handle different error cases
      let errorMessage = 'Failed to update password. Please try again.'
      
      if (error?.status === 400) {
        // Check for validation errors
        const validationErrors = error?.data?.Details || error?.data?.details || 
                                 error?.data?.errors || error?.data?.Errors
        if (validationErrors) {
          const errorMessages = []
          if (typeof validationErrors === 'object') {
            Object.keys(validationErrors).forEach(field => {
              const fieldErrors = Array.isArray(validationErrors[field]) 
                ? validationErrors[field] 
                : [validationErrors[field]]
              fieldErrors.forEach(err => {
                if (err) errorMessages.push(err)
              })
            })
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n')
          } else {
            errorMessage = error?.message || error?.data?.Message || 'Invalid data. Please check your input and try again.'
          }
        } else {
          errorMessage = error?.message || error?.data?.Message || 'Invalid data. Please check your input and try again.'
        }
      } else if (error?.status === 401) {
        errorMessage = error?.message || 'Current password is incorrect. Please try again.'
      } else if (error?.status === 403) {
        errorMessage = error?.message || 'You do not have permission to change the password.'
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.Message) {
        errorMessage = error.data.Message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Login & Security</h1>
          <p className="text-muted-foreground">
            Change your password to keep your account secure.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password. Make sure it&apos;s strong and unique.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {newPassword && !validatePassword(newPassword) && (
                <p className="text-xs text-destructive">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && validatePassword(newPassword) && (
                <p className="text-xs text-green-600">Passwords match</p>
              )}
            </div>

            <div className="pt-2">
              <Button onClick={handleChangePassword} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
