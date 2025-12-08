import apiClient, { BASE_URL } from '../config'
import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, microsoftProvider } from '@/lib/firebase'

/**
 * Authentication API endpoints
 */

/**
 * Sign up a new user
 * @param {Object} signupData - User signup data
 * @param {string} signupData.email - User email
 * @param {string} signupData.password - User password
 * @param {string} signupData.displayName - User display name
 * @param {string} signupData.phoneNo - User phone number (optional, send empty string if not provided)
 * @param {string} signupData.companyName - Company name
 * @param {boolean} signupData.termsAndCondition - Terms and conditions acceptance
 * @returns {Promise} API response
 */
export const signup = async (signupData) => {
  try {
    console.log('📝 Sign Up API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Signup Data:', {
      email: signupData.email,
      displayName: signupData.displayName, 
      companyName: signupData.companyName,
      phoneNo: signupData.phoneNo || '(empty)',
      termsAndCondition: signupData.termsAndCondition,
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // For signup, don't send Authorization header (user is not authenticated yet)
    // Use axios directly to bypass the interceptor
    const signupPayload = {
      email: signupData.email,
      password: signupData.password,
      displayName: signupData.displayName,
      phoneNo: signupData.phoneNo || '', // Send empty string if not provided
      companyName: signupData.companyName,
      termsAndCondition: signupData.termsAndCondition,
    }
    
    const signupResponse = await axios.post(
      `${BASE_URL}/api/v1/Auth/signup`,
      signupPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )
    
    // Convert to same format as apiClient response
    const response = {
      status: signupResponse.status,
      data: signupResponse.data,
    }
    
    console.log('✅ Signup Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // API response structure:
    // {
    //   "success": true,
    //   "code": "OK",
    //   "message": "Account created successfully",
    //   "data": {
    //     "userId": "...",
    //     "accessToken": "...",
    //     "refreshToken": "...",
    //     "email": "...",
    //     "displayName": "...",
    //     "expiresAt": "..."
    //   }
    // }
    
    const apiResponse = response.data
    
    // Don't store user data during signup - email is not verified yet
    // User data will be stored only after email verification is successful
    // This prevents the account from appearing in navbar before verification
    if (apiResponse.success && apiResponse.data) {
      // Clear any existing user data and tokens to ensure clean state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        
        // Trigger storage change event to update navbar
        window.dispatchEvent(new Event('localStorageChange'))
        console.log('🧹 Cleared user data - email verification required')
      }
    }
    
    return apiResponse
  } catch (error) {
    console.error('❌ Signup API error:', error)
    
    // Handle axios errors (since we're using axios directly)
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      // Extract error message
      let errorMessage = 'An error occurred'
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      }
      
      // Throw in same format as apiClient
      throw {
        message: errorMessage,
        status: status,
        data: data,
        code: data?.Code || data?.code,
      }
    } else if (error.request) {
      // Request made but no response received
      throw {
        message: 'Network error.  Please check your connection.',
        status: null,
      }
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        status: null,
      }
    }
  }
}

/**
 * Sign in user
 * @param {Object} signinData - User signin data
 * @param {string} signinData.email - User email
 * @param {string} signinData.password - User password
 * @returns {Promise} API response
 */
export const signin = async (signinData) => {
  try {
    console.log('🔐 Sign In API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Signin Data:', {
      email: signinData.email,
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.post('/api/v1/Auth/signin', {
      email: signinData.email,
      password: signinData.password,
    })
    
    console.log('✅ Signin Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // API response structure (similar to signup):
    // {
    //   "success": true,
    //   "code": "OK",
    //   "message": "Sign in successful",
    //   "data": {
    //     "userId": "...",
    //     "accessToken": "...",
    //     "refreshToken": "...",
    //     "email": "...",
    //     "displayName": "...",
    //     "expiresAt": "..."
    //   }
    // }
    
    const apiResponse = response.data
    
    console.log('🔍 Signin: Processing API response', {
      success: apiResponse?.success,
      hasData: !!apiResponse?.data,
      dataKeys: apiResponse?.data ? Object.keys(apiResponse.data) : [],
      fullResponse: JSON.stringify(apiResponse, null, 2)
    })
    
    // Store user data and tokens if signin was successful
    // IMPORTANT: If user can sign in successfully, assume they are verified
    // Only skip storing if API explicitly says email is NOT verified
    if (apiResponse && apiResponse.success && apiResponse.data) {
      // Check if API explicitly says email is NOT verified
      const explicitlyNotVerified = apiResponse.data.isVerified === false || 
                                    apiResponse.data.emailVerified === false
      
      console.log('🔍 Signin: Verification check', { explicitlyNotVerified })
      
      // If not explicitly unverified, assume verified (successful signin = verified)
      // Only skip storing if API explicitly says not verified
      if (!explicitlyNotVerified) {
        const userData = {
          userId: apiResponse.data.userId,
          email: apiResponse.data.email,
          displayName: apiResponse.data.displayName || apiResponse.data.email?.split('@')[0] || 'User',
          companyId: apiResponse.data.CompanyId || apiResponse.data.companyId,
          expiresAt: apiResponse.data.expiresAt,
          isVerified: true, // Set to true since signin was successful
        }
        
        console.log('💾 Signin: Preparing to store user data', userData)
        
        // Store in localStorage
        if (typeof window !== 'undefined') {
          try {
            // Store access token - check multiple possible field names
            const accessToken = apiResponse.data.accessToken || 
                               apiResponse.data.token || 
                               apiResponse.data.access_token ||
                               apiResponse.data.authToken
            if (accessToken) {
              localStorage.setItem('authToken', accessToken)
              console.log('✅ Signin: Stored accessToken', accessToken.substring(0, 20) + '...')
            } else {
              console.warn('⚠️ Signin: No accessToken in response. Available keys:', Object.keys(apiResponse.data))
              console.warn('⚠️ Signin: Full data object:', apiResponse.data)
            }
            
            // Store refresh token - check multiple possible field names
            const refreshToken = apiResponse.data.refreshToken || 
                                apiResponse.data.refresh_token
            if (refreshToken) {
              localStorage.setItem('refreshToken', refreshToken)
              console.log('✅ Signin: Stored refreshToken')
            }
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('✅ Signin: Stored user data:', JSON.stringify(userData, null, 2))
            
            // Verify storage
            const storedToken = localStorage.getItem('authToken')
            const storedUser = localStorage.getItem('user')
            console.log('🔍 Signin: Verification after storage', {
              hasToken: !!storedToken,
              hasUser: !!storedUser,
              tokenLength: storedToken?.length || 0
            })
            
            // Trigger custom event to notify other components
            window.dispatchEvent(new Event('localStorageChange'))
            console.log('🔄 Signin: Triggered localStorageChange event')
          } catch (storageError) {
            console.error('❌ Signin: Error storing in localStorage:', storageError)
          }
        } else {
          console.warn('⚠️ Signin: window is undefined, cannot store in localStorage')
        }
      } else {
        // Email explicitly not verified - clear any existing user data
        console.log('⚠️ Signin: Email not verified - clearing data')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          window.dispatchEvent(new Event('localStorageChange'))
          console.log('🧹 Signin: Cleared user data - email not verified')
        }
      }
    } else {
      console.warn('⚠️ Signin: API response not successful or missing data', {
        hasResponse: !!apiResponse,
        success: apiResponse?.success,
        hasData: !!apiResponse?.data
      })
    }
    
    return apiResponse
  } catch (error) {
    console.error('❌ Signin API error:', error)
    throw error
  }
}

/**
 * Sign out user
 * @returns {Promise} API response
 */
export const signout = async () => {
  try {
    const response = await apiClient.post('/api/v1/Auth/signout')
    
    // Clear all authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Trigger storage change event
      window.dispatchEvent(new Event('localStorageChange'))
    }
    
    return response.data
  } catch (error) {
    // Clear all data even if API call fails
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Trigger storage change event
      window.dispatchEvent(new Event('localStorageChange'))
    }
    throw error
  }
}

/**
 * Verify email
 * @param {Object} verifyData - Email verification data
 * @param {string} verifyData.token - Verification token
 * @returns {Promise} API response
 */
export const verifyEmail = async (verifyData) => {
  try {
    // Log the token and request format
    console.log('🔐 Verify Email API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Token received:', verifyData.token)
    console.log('📤 Token type:', typeof verifyData.token)
    console.log('📤 Token length:', verifyData.token?.length || 0)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const requestPayload = {
      token: verifyData.token,
    }
    
    console.log('📦 Request Payload:', JSON.stringify(requestPayload, null, 2))
    console.log('🌐 Request URL:', `${BASE_URL}/api/v1/Auth/verify-email`)
    console.log('📋 Request Method: POST')
    console.log('📋 Content-Type: application/json')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // For verify-email, don't send Authorization header (user might not be authenticated yet)
    // Create a separate axios instance without the interceptor to avoid adding auth token
    const verifyResponse = await axios.post(
      `${BASE_URL}/api/v1/Auth/verify-email`,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain', // Match Swagger's accept header
        },
      }
    )
    
    // Convert to same format as apiClient response
    const response = {
      status: verifyResponse.status,
      data: verifyResponse.data,
    }
    
    console.log('✅ Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // API response structure:
    // {
    //   "success": true,
    //   "code": "OK",
    //   "message": "Email verified successfully",
    //   "data": {
    //     "userId": "...",
    //     "email": "...",
    //     "isVerified": true
    //   }
    // }
    
    const apiResponse = response.data
    
    // Store user data ONLY after email verification is successful
    // This ensures user account only appears in navbar after verification
    if (apiResponse.success && apiResponse.data) {
      // Store tokens first (needed for fetching full profile)
      if (typeof window !== 'undefined') {
        // Store tokens if provided
        if (apiResponse.data.accessToken) {
          localStorage.setItem('authToken', apiResponse.data.accessToken)
          console.log('💾 Stored accessToken')
        }
        if (apiResponse.data.refreshToken) {
          localStorage.setItem('refreshToken', apiResponse.data.refreshToken)
          console.log('💾 Stored refreshToken')
        }
        // Also check for token field (alternative format)
        if (apiResponse.data.token) {
          localStorage.setItem('authToken', apiResponse.data.token)
          console.log('💾 Stored token')
        }
      }
      
      // Create initial user data from verification API response
      let userData = {
        userId: apiResponse.data.userId,
        email: apiResponse.data.email,
        displayName: apiResponse.data.displayName || apiResponse.data.email?.split('@')[0] || 'User',
        isVerified: true, // Email is verified, so set to true
        companyId: apiResponse.data.CompanyId || apiResponse.data.companyId,
        expiresAt: apiResponse.data.expiresAt,
      }
      
      console.log('💾 Initial user data from verification API:', JSON.stringify(userData, null, 2))
      
      // Try to fetch full profile to get companyName, phoneNo, etc.
      // This ensures we have all user data after verification
      try {
        // Import getProfile dynamically to avoid circular dependency
        const { getProfile } = await import('../users/users')
        
        // Only fetch if we have a token
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        if (token) {
          console.log('📥 Fetching full user profile after verification...')
          const profileResponse = await getProfile()
          
          // Merge profile data with verification data
          if (profileResponse.success && profileResponse.data) {
            const profileData = profileResponse.data
            userData = {
              ...userData,
              displayName: profileData.displayName || userData.displayName,
              companyName: profileData.companyName || profileData.company || '',
              phoneNo: profileData.phoneNo || profileData.phone || '',
              avatar: profileData.avatarUrl || profileData.avatar || profileData.profilePicture || '',
              // Keep verification data
              isVerified: true,
              userId: profileData.userId || userData.userId,
              email: profileData.email || userData.email,
              companyId: profileData.CompanyId || profileData.companyId || userData.companyId,
            }
            console.log('✅ Full profile fetched and merged:', JSON.stringify(userData, null, 2))
          }
        }
      } catch (profileError) {
        console.warn('⚠️ Could not fetch full profile after verification (will use basic data):', profileError)
        // Continue with basic user data if profile fetch fails
      }
      
      // Store complete user data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Trigger custom event to notify other components (navbar will update)
        window.dispatchEvent(new Event('localStorageChange'))
        
        console.log('✅ User data stored in localStorage after email verification')
        console.log('💾 Final stored user:', JSON.stringify(userData, null, 2))
      }
    }
    
    return apiResponse
  } catch (error) {
    console.error('❌ Verify email API error:', error)
    
    // Handle axios errors (since we're using axios directly)
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      // Extract error message
      let errorMessage = 'An error occurred'
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      }
      
      console.error('❌ Error details:', {
        message: errorMessage,
        status: status,
        code: data?.Code || data?.code,
        data: data,
      })
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Clear localStorage when verification fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        window.dispatchEvent(new Event('localStorageChange'))
        console.log('🧹 Cleared user data - verification failed')
      }
      
      // Throw in same format as apiClient
      throw {
        message: errorMessage,
        status: status,
        data: data,
        code: data?.Code || data?.code,
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response received:', error.request)
      throw {
        message: 'Network error. Please check your connection.',
        status: null,
      }
    } else {
      // Something else happened
      console.error('❌ Error setting up request:', error.message)
      throw {
        message: error.message || 'An unexpected error occurred',
        status: null,
      }
    }
  }
}

/**
 * Request password reset
 * @param {Object} resetData - Password reset data
 * @param {string} resetData.email - User email
 * @returns {Promise} API response
 */
export const requestPasswordReset = async (resetData) => {
  try {
    console.log('🔐 Forgot Password API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Email:', resetData.email)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // For forgot-password, don't send Authorization header (user is not authenticated)
    // Use axios directly to bypass the interceptor
    const resetPayload = {
      email: resetData.email,
    }
    
    const resetResponse = await axios.post(
      `${BASE_URL}/api/v1/Auth/forgot-password`,
      resetPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )
    
    // Convert to same format as apiClient response
    const response = {
      status: resetResponse.status,
      data: resetResponse.data,
    }
    
    console.log('✅ Forgot Password Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Forgot Password API error:', error)
    
    // Handle axios errors (since we're using axios directly)
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      // Extract error message
      let errorMessage = 'An error occurred'
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      }
      
      // Throw in same format as apiClient
      throw {
        message: errorMessage,
        status: status,
        data: data,
        code: data?.Code || data?.code,
      }
    } else if (error.request) {
      // Request made but no response received
      throw {
        message: 'Network error. Please check your connection.',
        status: null,
      }
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        status: null,
      }
    }
  }
}

/**
 * Reset password
 * @param {Object} resetData - Password reset data
 * @param {string} resetData.resetToken - Reset token from URL
 * @param {string} resetData.newPassword - New password
 * @returns {Promise} API response
 */
export const resetPassword = async (resetData) => {
  try {
    console.log('🔐 Reset Password API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Reset Token:', resetData.resetToken)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // For reset-password, don't send Authorization header (user is not authenticated)
    // Use axios directly to bypass the interceptor
    const resetPayload = {
      resetToken: resetData.resetToken,
      newPassword: resetData.newPassword,
    }
    
    const resetResponse = await axios.post(
      `${BASE_URL}/api/v1/Auth/reset-password`,
      resetPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )
    
    // Convert to same format as apiClient response
    const response = {
      status: resetResponse.status,
      data: resetResponse.data,
    }
    
    console.log('✅ Reset Password Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Reset Password API error:', error)
    
    // Handle axios errors (since we're using axios directly)
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      // Extract error message
      let errorMessage = 'An error occurred'
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      }
      
      // Throw in same format as apiClient
      throw {
        message: errorMessage,
        status: status,
        data: data,
        code: data?.Code || data?.code,
      }
    } else if (error.request) {
      // Request made but no response received
      throw {
        message: 'Network error. Please check your connection.',
        status: null,
      }
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        status: null,
      }
    }
  }
}

/**
 * Refresh authentication token
 * @returns {Promise} API response
 */
export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/api/v1/Auth/refresh-token')
    
    // Update token if provided
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
    }
    
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Resend verification email
 * @param {Object} resendData - Resend verification email data
 * @param {string} resendData.email - User email
 * @returns {Promise} API response
 */
export const resendVerificationEmail = async (resendData) => {
  try {
    console.log('📧 Resend Verification Email API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Email:', resendData.email)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // For resend-verification-email, don't send Authorization header (user might not be authenticated yet)
    // Use axios directly to bypass the interceptor
    const resendPayload = {
      email: resendData.email,
    }
    
    const resendResponse = await axios.post(
      `${BASE_URL}/api/v1/Auth/resend-verification-email`,
      resendPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )
    
    // Convert to same format as apiClient response
    const response = {
      status: resendResponse.status,
      data: resendResponse.data,
    }
    
    console.log('✅ Resend Verification Email Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Resend Verification Email API error:', error)
    
    // Handle axios errors (since we're using axios directly)
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      // Extract error message
      let errorMessage = 'An error occurred'
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      }
      
      // Throw in same format as apiClient
      throw {
        message: errorMessage,
        status: status,
        data: data,
        code: data?.Code || data?.code,
      }
    } else if (error.request) {
      // Request made but no response received
      throw {
        message: 'Network error. Please check your connection.',
        status: null,
      }
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
        status: null,
      }
    }
  }
}

/**
 * Google Sign In
 * Authenticates user with Google and sends idToken to backend
 * @returns {Promise} API response
 */
export const googleSignIn = async () => {
  try {
    console.log('🔐 Google Sign In API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Sign in with Google using Firebase
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Get the ID token
    const idToken = await user.getIdToken()
    
    console.log('✅ Google Sign In Successful')
    console.log('📤 User Info:', {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid,
    })
    console.log('📤 ID Token:', idToken)
    console.log('📤 ID Token Length:', idToken.length)
    console.log('📤 ID Token Type:', typeof idToken)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Call backend API with the idToken
    const response = await axios.post(
      `${BASE_URL}/api/v1/Auth/google-signin`,
      {
        idToken: idToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )
    
    console.log('📥 Backend Response Status:', response.status)
    console.log('📥 Backend Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const apiResponse = response.data
    
    // Store user data and tokens if signin was successful
    if (apiResponse.success && apiResponse.data) {
      const userData = {
        userId: apiResponse.data.userId,
        email: apiResponse.data.email || user.email,
        displayName: apiResponse.data.displayName || user.displayName || user.email?.split('@')[0] || 'User',
        companyId: apiResponse.data.CompanyId || apiResponse.data.companyId,
        expiresAt: apiResponse.data.expiresAt,
        isVerified: true, // Google sign-in means email is verified
        avatar: user.photoURL || apiResponse.data.avatar || '',
        authProvider: 'google', // Mark as OAuth user
      }
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        // Store access token
        if (apiResponse.data.accessToken) {
          localStorage.setItem('authToken', apiResponse.data.accessToken)
          console.log('💾 Stored accessToken')
        }
        
        // Store refresh token
        if (apiResponse.data.refreshToken) {
          localStorage.setItem('refreshToken', apiResponse.data.refreshToken)
          console.log('💾 Stored refreshToken')
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('💾 Stored user data:', JSON.stringify(userData, null, 2))
        
        // Trigger custom event to notify other components
        window.dispatchEvent(new Event('localStorageChange'))
        console.log('🔄 Triggered localStorageChange event')
      }
    }
    
    return apiResponse
  } catch (error) {
    console.error('❌ Google Sign In error:', error)
    
    // Handle Firebase errors
    if (error.code) {
      console.error('Firebase Error Code:', error.code)
      console.error('Firebase Error Message:', error.message)
      
      let errorMessage = 'Google sign in failed. Please try again.'
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled. Please try again.'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      throw {
        message: errorMessage,
        status: null,
        code: error.code,
      }
    }
    
    // Handle axios errors (backend API errors)
    if (error.response) {
      const { status, data } = error.response
      
      let errorMessage = 'An error occurred'
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      }
      
      throw {
        message: errorMessage,
        status: status,
        data: data,
        code: data?.Code || data?.code,
      }
    } else if (error.request) {
      throw {
        message: 'Network error. Please check your connection.',
        status: null,
      }
    } else {
      throw {
        message: error.message || 'An unexpected error occurred',
        status: null,
      }
    }
  }
}

/**
 * Microsoft Sign In
 * Authenticates user with Microsoft and sends idToken to backend
 * @returns {Promise} API response
 */
export const microsoftSignIn = async () => {
  try {
    console.log('🔐 Microsoft Sign In API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Sign in with Microsoft using Firebase
    const result = await signInWithPopup(auth, microsoftProvider)
    const user = result.user
    
    // Get the ID token
    const idToken = await user.getIdToken()
    
    console.log('✅ Microsoft Sign In Successful')
    console.log('📤 User Info:', {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      uid: user.uid,
    })
    console.log('📤 ID Token:', idToken)
    console.log('📤 ID Token Length:', idToken.length)
    console.log('📤 ID Token Type:', typeof idToken)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Call backend API with the idToken
    const response = await axios.post(
      `${BASE_URL}/api/v1/Auth/microsoft-signin`,
      {
        idToken: idToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )
    
    console.log('📥 Backend Response Status:', response.status)
    console.log('📥 Backend Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const apiResponse = response.data
    
    // Store user data and tokens if signin was successful
    if (apiResponse.success && apiResponse.data) {
      const userData = {
        userId: apiResponse.data.userId,
        email: apiResponse.data.email || user.email,
        displayName: apiResponse.data.displayName || user.displayName || user.email?.split('@')[0] || 'User',
        companyId: apiResponse.data.CompanyId || apiResponse.data.companyId,
        expiresAt: apiResponse.data.expiresAt,
        isVerified: true, // Microsoft sign-in means email is verified
        avatar: user.photoURL || apiResponse.data.avatar || '',
        authProvider: 'microsoft', // Mark as OAuth user
      }
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        // Store access token
        if (apiResponse.data.accessToken) {
          localStorage.setItem('authToken', apiResponse.data.accessToken)
          console.log('💾 Stored accessToken')
        }
        
        // Store refresh token
        if (apiResponse.data.refreshToken) {
          localStorage.setItem('refreshToken', apiResponse.data.refreshToken)
          console.log('💾 Stored refreshToken')
        }
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('💾 Stored user data:', JSON.stringify(userData, null, 2))
        
        // Trigger custom event to notify other components
        window.dispatchEvent(new Event('localStorageChange'))
        console.log('🔄 Triggered localStorageChange event')
      }
    }
    
    return apiResponse
  } catch (error) {
    console.error('❌ Microsoft Sign In error:', error)
    
    // Handle Firebase errors
    if (error.code) {
      console.error('Firebase Error Code:', error.code)
      console.error('Firebase Error Message:', error.message)
      
      let errorMessage = 'Microsoft sign in failed. Please try again.'
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign in was cancelled. Please try again.'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      throw {
        message: errorMessage,
        status: null,
        code: error.code,
      }
    }
    
    // Handle axios errors (backend API errors)
    if (error.response) {
      const { status, data } = error.response
      
      let errorMessage = 'An error occurred'
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      }
      
      throw {
        message: errorMessage,
        status: status,
        data: data,
        code: data?.Code || data?.code,
      }
    } else if (error.request) {
      throw {
        message: 'Network error. Please check your connection.',
        status: null,
      }
    } else {
      throw {
        message: error.message || 'An unexpected error occurred',
        status: null,
      }
    }
  }
}

// Export all auth functions as default object
const authAPI = {
  signup,
  signin,
  signout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  resendVerificationEmail,
  googleSignIn,
  microsoftSignIn,
}

export default authAPI

