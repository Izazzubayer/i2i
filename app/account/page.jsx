"use client"

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Upload, Trash2, AlertTriangle, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { getProfile, updateProfile, uploadAvatar, deleteAccount } from '@/api/users/users'
import { useRouter } from 'next/navigation'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function AccountPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phoneNo, setPhoneNo] = useState('')
  const [avatar, setAvatar] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState('')
  const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 1 })
  const [completedCrop, setCompletedCrop] = useState(null)
  const imgRef = useRef(null)
  const [isOAuthUser, setIsOAuthUser] = useState(false)
  const [authProvider, setAuthProvider] = useState(null)

  // Check email verification status and fetch user profile
  useEffect(() => {
    const checkVerificationAndFetchProfile = async () => {
      try {
        setIsLoading(true)
        
        // First, check verification status from localStorage
        const localUser = localStorage.getItem('user')
        const authToken = localStorage.getItem('authToken')
        let localUserData = null
        let localIsVerified = false
        
        if (localUser) {
          try {
            localUserData = JSON.parse(localUser)
            localIsVerified = localUserData.isVerified === true // Only true if explicitly set to true
            
            // If authProvider is missing but user has avatar from OAuth (Google/Microsoft typically provide photoURL)
            // or if we can infer from other data, set it
            if (!localUserData.authProvider && localUserData.avatar && localUserData.avatar.includes('googleusercontent.com')) {
              localUserData.authProvider = 'google'
              localStorage.setItem('user', JSON.stringify(localUserData))
              console.log('🔍 Detected Google user from avatar URL, added authProvider')
            } else if (!localUserData.authProvider && localUserData.avatar && localUserData.avatar.includes('live.com')) {
              localUserData.authProvider = 'microsoft'
              localStorage.setItem('user', JSON.stringify(localUserData))
              console.log('🔍 Detected Microsoft user from avatar URL, added authProvider')
            }
          } catch (e) {
            console.error('Error parsing local user data:', e)
          }
        }
        
        // If user has auth token, they must be verified (token is only given after verification)
        // So trust localStorage if it says verified, or if token exists
        if (localIsVerified || authToken) {
          setIsVerified(true)
          console.log('✅ User is verified (from localStorage or token)')
        }
        
        // Fetch profile from API
        try {
          const response = await getProfile()
          
          // Extract user data from API response
          let userData = null
          if (response.success && response.data) {
            userData = response.data
          } else if (response.data) {
            userData = response.data
          }
          
          if (userData) {
            // Check verification status from API (but trust localStorage if it says verified)
            const apiIsVerified = userData.isVerified === true || 
                                 userData.emailVerified === true
            
            // Only update verification status if API explicitly says verified
            // If API doesn't have the field, trust localStorage/token
            if (apiIsVerified) {
              setIsVerified(true)
            } else if (!localIsVerified && !authToken) {
              // Only show unverified if localStorage says false AND no token exists
              setIsVerified(false)
              toast.error('Please verify your email to access your profile')
              router.push(`/check-email?email=${encodeURIComponent(userData.email || localUserData?.email || '')}`)
              return
            }
            
            // Check if user is OAuth (Google/Microsoft) - check API response first, then localStorage
            const apiAuthProvider = userData.authProvider || userData.provider || userData.loginProvider
            const localAuthProvider = localUserData?.authProvider
            const detectedProvider = apiAuthProvider || localAuthProvider
            
            // OAuth users: google, microsoft, or any provider that's not 'email' or 'password'
            const isOAuth = detectedProvider && 
                           (detectedProvider.toLowerCase() === 'google' || 
                            detectedProvider.toLowerCase() === 'microsoft' ||
                            (detectedProvider.toLowerCase() !== 'email' && detectedProvider.toLowerCase() !== 'password'))
            
            setIsOAuthUser(isOAuth)
            setAuthProvider(detectedProvider)
            console.log('🔍 Auth Provider Detection:', { apiAuthProvider, localAuthProvider, detectedProvider, isOAuth })
            
            // Set user data
            setUsername(userData.displayName || userData.username || userData.name || '')
            setEmail(userData.email || '')
            setCompanyName(userData.companyName || userData.company || '')
            setPhoneNo(userData.phoneNo || userData.phone || '')
            // Use same priority as Navbar: avatarUrl -> avatar -> profilePicture
            const avatarValue = userData.avatarUrl || userData.avatar || userData.profilePicture || ''
            setAvatar(avatarValue)
            
            // IMPORTANT: Update localStorage with ALL profile data from API
            // This ensures companyName, phoneNo, and other fields are stored
            // CRITICAL: Always preserve authProvider from localStorage if API doesn't provide it
            const finalAuthProvider = detectedProvider || localUserData?.authProvider || 
              // Fallback: Check avatar URL for OAuth indicators
              (userData.avatarUrl && userData.avatarUrl.includes('googleusercontent.com') ? 'google' : null) ||
              (userData.avatarUrl && userData.avatarUrl.includes('live.com') ? 'microsoft' : null) ||
              (userData.avatar && userData.avatar.includes('googleusercontent.com') ? 'google' : null) ||
              (userData.avatar && userData.avatar.includes('live.com') ? 'microsoft' : null)
            
            const updatedUserData = {
              ...(localUserData || {}),
              userId: userData.userId || localUserData?.userId,
              email: userData.email || localUserData?.email,
              displayName: userData.displayName || userData.username || userData.name || localUserData?.displayName,
              companyName: userData.companyName || userData.company || localUserData?.companyName || '',
              phoneNo: userData.phoneNo || userData.phone || localUserData?.phoneNo || '',
              avatar: userData.avatarUrl || userData.avatar || userData.profilePicture || localUserData?.avatar || '',
              avatarUrl: userData.avatarUrl || userData.avatar || userData.profilePicture || localUserData?.avatarUrl || '',
              isVerified: apiIsVerified !== undefined ? apiIsVerified : (localUserData?.isVerified || true),
              companyId: userData.CompanyId || userData.companyId || localUserData?.companyId,
              expiresAt: userData.expiresAt || localUserData?.expiresAt,
              // CRITICAL: Always preserve authProvider - prioritize detected, then localStorage, then fallback detection
              authProvider: finalAuthProvider,
            }
            
            // Update detection based on final authProvider
            const finalIsOAuth = finalAuthProvider && 
              (finalAuthProvider.toLowerCase() === 'google' || 
               finalAuthProvider.toLowerCase() === 'microsoft' ||
               (finalAuthProvider.toLowerCase() !== 'email' && finalAuthProvider.toLowerCase() !== 'password'))
            
            setIsOAuthUser(finalIsOAuth)
            setAuthProvider(finalAuthProvider)
            console.log('🔍 Final Auth Provider Detection:', { finalAuthProvider, finalIsOAuth, detectedProvider, localAuthProvider })
            
            localStorage.setItem('user', JSON.stringify(updatedUserData))
            console.log('💾 Updated localStorage with full profile data:', JSON.stringify(updatedUserData, null, 2))
            
            // Trigger storage change event to update navbar
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('localStorageChange'))
            }
          } else {
          // If API doesn't return data, use localStorage
          if (localUserData) {
            if (!localIsVerified && !authToken) {
              setIsVerified(false)
              toast.error('Please verify your email to access your profile')
              router.push(`/check-email?email=${encodeURIComponent(localUserData.email || '')}`)
              return
            }
            
            // Check if OAuth user from localStorage
            let localAuthProvider = localUserData.authProvider
            
            // If authProvider is missing, try to detect from avatar URL
            if (!localAuthProvider) {
              if (localUserData.avatar && localUserData.avatar.includes('googleusercontent.com')) {
                localAuthProvider = 'google'
                localUserData.authProvider = 'google'
                localStorage.setItem('user', JSON.stringify(localUserData))
                console.log('🔍 Detected Google user from avatar URL, added authProvider')
              } else if (localUserData.avatar && localUserData.avatar.includes('live.com')) {
                localAuthProvider = 'microsoft'
                localUserData.authProvider = 'microsoft'
                localStorage.setItem('user', JSON.stringify(localUserData))
                console.log('🔍 Detected Microsoft user from avatar URL, added authProvider')
              }
            }
            
            const isOAuth = localAuthProvider && 
                           (localAuthProvider.toLowerCase() === 'google' || 
                            localAuthProvider.toLowerCase() === 'microsoft' ||
                            (localAuthProvider.toLowerCase() !== 'email' && localAuthProvider.toLowerCase() !== 'password'))
            setIsOAuthUser(isOAuth)
            setAuthProvider(localAuthProvider)
            
            setUsername(localUserData.displayName || localUserData.name || '')
            setEmail(localUserData.email || '')
            setCompanyName(localUserData.companyName || '')
            setPhoneNo(localUserData.phoneNo || localUserData.phone || '')
            // Use same priority as Navbar: avatarUrl -> avatar -> profilePicture
            setAvatar(localUserData.avatarUrl || localUserData.avatar || localUserData.profilePicture || '')
          }
          }
        } catch (apiError) {
          console.error('Error fetching profile from API:', apiError)
          
          // Check if it's an auth error
          if (apiError?.status === 401) {
            // Token might be invalid or expired
            console.warn('⚠️ 401 Unauthorized - checking token')
            const currentToken = localStorage.getItem('authToken')
            if (!currentToken) {
              toast.error('Please sign in to view your profile')
              router.push('/sign-in')
              return
            } else {
              // Token exists but API rejected it - might be expired
              toast.error('Session expired. Please sign in again.')
              // Clear invalid token
              localStorage.removeItem('authToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
              router.push('/sign-in')
              return
            }
          }
          
          // If API fails but user has token or localStorage says verified, still show profile
          if (localIsVerified || authToken) {
            console.log('⚠️ API failed but user is verified, using localStorage data')
            if (localUserData) {
              // Check if OAuth user from localStorage
              let localAuthProvider = localUserData.authProvider
              
              // If authProvider is missing, try to detect from avatar URL
              if (!localAuthProvider) {
                if (localUserData.avatar && localUserData.avatar.includes('googleusercontent.com')) {
                  localAuthProvider = 'google'
                  localUserData.authProvider = 'google'
                  localStorage.setItem('user', JSON.stringify(localUserData))
                  console.log('🔍 Detected Google user from avatar URL, added authProvider')
                } else if (localUserData.avatar && localUserData.avatar.includes('live.com')) {
                  localAuthProvider = 'microsoft'
                  localUserData.authProvider = 'microsoft'
                  localStorage.setItem('user', JSON.stringify(localUserData))
                  console.log('🔍 Detected Microsoft user from avatar URL, added authProvider')
                }
              }
              
              const isOAuth = localAuthProvider && 
                             (localAuthProvider.toLowerCase() === 'google' || 
                              localAuthProvider.toLowerCase() === 'microsoft' ||
                              (localAuthProvider.toLowerCase() !== 'email' && localAuthProvider.toLowerCase() !== 'password'))
              setIsOAuthUser(isOAuth)
              setAuthProvider(localAuthProvider)
              
              setUsername(localUserData.displayName || localUserData.name || '')
              setEmail(localUserData.email || '')
              setCompanyName(localUserData.companyName || '')
              setPhoneNo(localUserData.phoneNo || localUserData.phone || '')
              // Use same priority as Navbar: avatarUrl -> avatar -> profilePicture
              setAvatar(localUserData.avatarUrl || localUserData.avatar || localUserData.profilePicture || '')
              // Show warning but don't block the user
              toast.warning('Using cached profile data. Some information may be outdated.')
            }
          } else {
            // Only show error if not verified
            toast.error('Failed to load profile. Please try again.')
          }
        }
      } catch (error) {
        console.error('Error in checkVerificationAndFetchProfile:', error)
        toast.error('Failed to load profile. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    checkVerificationAndFetchProfile()
  }, [router])

  // Sync avatar with localStorage changes (for Navbar sync)
  useEffect(() => {
    const syncAvatar = () => {
      if (typeof window !== 'undefined') {
        try {
          const localUser = localStorage.getItem('user')
          if (localUser) {
            const userData = JSON.parse(localUser)
            const syncedAvatar = userData.avatarUrl || userData.avatar || userData.profilePicture || ''
            // Only update if different to avoid unnecessary re-renders
            if (syncedAvatar && syncedAvatar !== avatar && !avatarPreview) {
              setAvatar(syncedAvatar)
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }
    }

    // Initial sync
    syncAvatar()

    // Listen for localStorage changes
    const handleStorageChange = () => {
      syncAvatar()
    }

    window.addEventListener('localStorageChange', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [avatar, avatarPreview])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }
      
      // Check file type - explicitly allow JPG, PNG, and GIF
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      
      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)
      
      if (!isValidType) {
        toast.error('Please upload a JPG, PNG, or GIF image file')
        return
      }
      
      // Open crop dialog instead of directly setting preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setCropImageSrc(reader.result)
        setCropDialogOpen(true)
        // Reset crop to square - will be properly set in onImageLoad
        setCrop({ unit: '%', width: 80, aspect: 1 })
        setCompletedCrop(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget
    
    // Calculate square crop based on the smaller dimension of the displayed image
    const displayMinDimension = Math.min(width, height)
    const cropSize = displayMinDimension * 0.8 // 80% of smallest display dimension
    
    // Center the square crop on the displayed image
    const cropX = (width - cropSize) / 2
    const cropY = (height - cropSize) / 2
    
    setCrop({
      unit: 'px',
      width: cropSize,
      height: cropSize,
      aspect: 1,
      x: cropX,
      y: cropY,
    })
  }

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const pixelRatio = window.devicePixelRatio

    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    ctx.drawImage(
      image,
      cropX,
      cropY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty')
        }
        resolve(blob)
      }, 'image/png', 1.0)
    })
  }

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error('Please select a crop area')
      return
    }

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop)
      
      // Convert blob to file
      const file = new File([croppedBlob], 'avatar.png', { type: 'image/png' })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
        setAvatarFile(file)
        setCropDialogOpen(false)
        setCropImageSrc('')
        toast.success('Image cropped successfully')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error cropping image:', error)
      toast.error('Failed to crop image. Please try again.')
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      // Clear local state
      setAvatar('')
      setAvatarPreview('')
      setAvatarFile(null)
      
      // Update localStorage
      const localUser = localStorage.getItem('user')
      if (localUser) {
        try {
          const userData = JSON.parse(localUser)
          userData.avatar = ''
          userData.avatarUrl = ''
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          console.error('Error updating localStorage:', error)
        }
      }
      
      // Update profile on backend (send empty avatar)
      try {
        await updateProfile({ avatar: '', avatarUrl: '' })
        toast.success('Avatar removed successfully')
      } catch (error) {
        console.error('Error removing avatar from backend:', error)
        // Still show success since local state is cleared
        toast.success('Avatar removed (local)')
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast.error('Failed to remove avatar. Please try again.')
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // First, upload avatar if a new file was selected
      if (avatarFile) {
        try {
          const avatarResponse = await uploadAvatar(avatarFile)
          
          // Extract avatar URL from response
          // Response structure: { success: true, data: { avatarUrl: "..." } }
          let newAvatarUrl = ''
          if (avatarResponse.success && avatarResponse.data?.avatarUrl) {
            newAvatarUrl = avatarResponse.data.avatarUrl
          } else if (avatarResponse.data?.avatarUrl) {
            newAvatarUrl = avatarResponse.data.avatarUrl
          } else if (avatarResponse.avatarUrl) {
            newAvatarUrl = avatarResponse.avatarUrl
          }
          
          if (newAvatarUrl) {
            setAvatar(newAvatarUrl)
            
            // Update localStorage immediately with new avatar URL
            const localUser = localStorage.getItem('user')
            if (localUser) {
              try {
                const userData = JSON.parse(localUser)
                userData.avatar = newAvatarUrl
                userData.avatarUrl = newAvatarUrl
                localStorage.setItem('user', JSON.stringify(userData))
                
                // Trigger storage change event to update navbar
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('localStorageChange'))
                }
              } catch (e) {
                console.error('Error updating localStorage with avatar:', e)
              }
            }
          }
          
          // Clear the file after successful upload
          setAvatarFile(null)
          setAvatarPreview('')
          
          toast.success(avatarResponse.message || 'Avatar uploaded successfully')
        } catch (avatarError) {
          console.error('Error uploading avatar:', avatarError)
          toast.error('Failed to upload avatar. Profile will still be updated.')
          // Continue with profile update even if avatar upload fails
        }
      }
      
      // Then, update profile information
      // Ensure displayName is not empty (required field)
      if (!username.trim()) {
        toast.error('Username/Display Name is required')
        setIsSaving(false)
        return
      }
      
      // Prepare phone number - send null if empty to avoid validation error
      const phoneNumber = phoneNo.trim() || null
      
      const response = await updateProfile({
        displayName: username.trim(),
        phoneNo: phoneNumber, // Send null if empty to avoid format validation error
        companyName: companyName.trim() || '', // Send empty string if not provided
      })

      // Check if update was successful
      if (response.success || response.status === 200) {
        // Update localStorage with new data
        const localUser = localStorage.getItem('user')
        if (localUser) {
          try {
            const userData = JSON.parse(localUser)
            userData.displayName = username.trim()
            userData.companyName = companyName.trim()
            userData.phoneNo = phoneNo.trim() || ''
            
            // Update avatar URL if it was updated
            if (avatar) {
              userData.avatar = avatar
            }
            
            localStorage.setItem('user', JSON.stringify(userData))
            
            // Trigger storage change event
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('localStorageChange'))
            }
          } catch (e) {
            console.error('Error updating localStorage:', e)
          }
        }
        
        toast.success(response.message || 'Profile updated successfully')
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      
      // Handle different error cases
      let errorMessage = 'Failed to save profile. Please try again.'
      
      if (error?.status === 400) {
        // Check for validation errors - check Details first (common in .NET APIs)
        const validationErrors = error?.data?.Details || error?.data?.details || 
                                 error?.data?.errors || error?.data?.Errors || 
                                 error?.data?.validationErrors || error?.data?.ValidationErrors
        
        if (validationErrors) {
          // Format validation errors for display
          const errorMessages = []
          if (Array.isArray(validationErrors)) {
            errorMessages.push(...validationErrors)
          } else if (typeof validationErrors === 'object') {
            // Handle object with field names as keys
            Object.keys(validationErrors).forEach(field => {
              const fieldErrors = Array.isArray(validationErrors[field]) 
                ? validationErrors[field] 
                : [validationErrors[field]]
              fieldErrors.forEach(err => {
                if (err) {
                  // Format field name nicely (e.g., PhoneNo -> Phone Number)
                  const formattedField = field === 'PhoneNo' ? 'Phone Number' : 
                                        field === 'DisplayName' ? 'Display Name' : 
                                        field === 'CompanyName' ? 'Company Name' : field
                  errorMessages.push(`${formattedField}: ${err}`)
                }
              })
            })
          }
          
          if (errorMessages.length > 0) {
            errorMessage = `Validation errors:\n${errorMessages.join('\n')}`
          } else {
            errorMessage = error?.message || error?.data?.Message || 'Invalid data. Please check your input and try again.'
          }
        } else {
          errorMessage = error?.message || error?.data?.Message || 'Invalid data. Please check your input and try again.'
        }
      } else if (error?.status === 401) {
        // Check if token exists
        const currentToken = localStorage.getItem('authToken')
        if (!currentToken) {
          errorMessage = 'Please sign in to update your profile'
          // Clear user data and redirect to sign in
          localStorage.removeItem('user')
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          setTimeout(() => {
            router.push('/sign-in')
          }, 2000)
        } else {
          errorMessage = error?.message || 'Session expired. Please sign in again.'
          // Clear invalid token and redirect
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          setTimeout(() => {
            router.push('/sign-in')
          }, 2000)
        }
      } else if (error?.status === 403) {
        errorMessage = error?.message || 'You do not have permission to update this profile.'
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.Message) {
        errorMessage = error.data.Message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    // Check if confirmation text is correct
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion')
      return
    }

    if (!email) {
      toast.error('Email not found. Cannot delete account.')
      return
    }

    try {
      setIsDeleting(true)
      toast.loading('Deleting your account...')
      
      // Call delete account API
      await deleteAccount(email)
      
      // Clear all local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Trigger storage change event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('localStorageChange'))
      }
      
      toast.dismiss()
      toast.success('Account deleted successfully')
      setDeleteDialogOpen(false)
      setDeleteConfirmText('')
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (error) {
      console.error('Delete account error:', error)
      setIsDeleting(false)
      toast.dismiss()
      
      let errorMessage = 'Failed to delete account. Please try again.'
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.Message) {
        errorMessage = error.data.Message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      
      toast.error(errorMessage)
    }
  }

  const handleExportData = () => {
    toast.info('Data export feature coming soon')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
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

  // If not verified, show verification required message
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10 space-y-8 max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <Mail className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-2xl">Email Verification Required</CardTitle>
              <CardDescription className="text-base">
                Please verify your email address to access your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Verification Required
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      You need to verify your email address before you can access your profile settings.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => router.push(`/check-email?email=${encodeURIComponent(email || '')}`)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Check Verification Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
                {/* Use same priority as Navbar: avatarUrl -> avatar -> profilePicture, with preview override */}
                <AvatarImage src={avatarPreview || avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                  {username ? username.substring(0, 2).toUpperCase() : email ? email.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Change Avatar
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={!avatar && !avatarPreview}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Avatar
                  </Button>
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
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Username
              </Label>
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
              <Label htmlFor="companyName">
                Company Name
              </Label>
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

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNo">
                Phone Number
              </Label>
              <Input
                id="phoneNo"
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="Enter your phone number (optional)"
              />
              <p className="text-xs text-muted-foreground">
                Your phone number (optional). Leave empty if you don't want to provide it.
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
                      setPhoneNo(userData.phoneNo || userData.phone || '')
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
              <Dialog 
                open={deleteDialogOpen} 
                onOpenChange={(open) => {
                  setDeleteDialogOpen(open)
                  if (!open) {
                    setDeleteConfirmText('')
                    setIsDeleting(false)
                  }
                }}
              >
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
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      disabled={isDeleting}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setDeleteDialogOpen(false)
                        setDeleteConfirmText('')
                      }}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Account'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Your Avatar</DialogTitle>
            <DialogDescription>
              Adjust the crop area to select the portion of your image you want to use as your avatar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {cropImageSrc && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={50}
                  minHeight={50}
                  className="max-h-[60vh]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={cropImageSrc}
                    onLoad={onImageLoad}
                    style={{ maxWidth: '100%', maxHeight: '60vh' }}
                  />
                </ReactCrop>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setCropDialogOpen(false)
                  setCropImageSrc('')
                  setCrop({ unit: '%', width: 90, aspect: 1 })
                  setCompletedCrop(null)
                  // Reset file input
                  const fileInput = document.getElementById('avatar-upload')
                  if (fileInput) {
                    fileInput.value = ''
                  }
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCropComplete}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
