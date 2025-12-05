import apiClient, { BASE_URL } from '../config'
import axios from 'axios'

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
    
    // Store user data and tokens if signup was successful
    if (apiResponse.success && apiResponse.data) {
      const userData = {
        userId: apiResponse.data.userId,
        email: apiResponse.data.email,
        displayName: apiResponse.data.displayName,
        companyId: apiResponse.data.CompanyId,
        expiresAt: apiResponse.data.expiresAt,
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
    
    // Store user data and tokens if signin was successful
    if (apiResponse.success && apiResponse.data) {
      const userData = {
        userId: apiResponse.data.userId,
        email: apiResponse.data.email,
        displayName: apiResponse.data.displayName || apiResponse.data.email?.split('@')[0] || 'User',
        companyId: apiResponse.data.CompanyId || apiResponse.data.companyId,
        expiresAt: apiResponse.data.expiresAt,
        isVerified: apiResponse.data.isVerified !== undefined ? apiResponse.data.isVerified : true,
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
    
    // Store user data if provided in response
    if (apiResponse.success && apiResponse.data) {
      // Get existing user data from localStorage (from signup)
      let existingUserData = {}
      if (typeof window !== 'undefined') {
        const existingUser = localStorage.getItem('user')
        if (existingUser) {
          try {
            existingUserData = JSON.parse(existingUser)
            console.log('📋 Existing user data found (from signup):', existingUserData)
          } catch (e) {
            console.warn('Could not parse existing user data:', e)
          }
        }
      }
      
      // Merge verification data with existing user data (from signup)
      // Preserve all signup data (displayName, companyId, expiresAt, etc.)
      const userData = {
        ...existingUserData, // Keep existing data from signup
        userId: apiResponse.data.userId || existingUserData.userId,
        email: apiResponse.data.email || existingUserData.email,
        displayName: existingUserData.displayName || apiResponse.data.email?.split('@')[0] || 'User',
        isVerified: apiResponse.data.isVerified !== undefined ? apiResponse.data.isVerified : true,
        // Preserve signup data
        companyId: existingUserData.companyId,
        expiresAt: existingUserData.expiresAt,
      }
      
      console.log('💾 Merged user data (signup + verification):', JSON.stringify(userData, null, 2))
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
        
        // If token is provided separately, store it
        if (apiResponse.data.token) {
          localStorage.setItem('authToken', apiResponse.data.token)
        }
        
        // Trigger custom event to notify other components
        window.dispatchEvent(new Event('localStorageChange'))
        
        console.log('💾 User data stored in localStorage')
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

// Export all auth functions as default object
const authAPI = {
  signup,
  signin,
  signout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  refreshToken,
}

export default authAPI

