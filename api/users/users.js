import apiClient from '../config'

/**
 * Users API endpoints
 * Placeholder for future user-related API calls
 */

/**
 * Get user profile
 * Requires Authorization Bearer token
 * @returns {Promise} API response
 */
export const getProfile = async () => {
  try {
    console.log('👤 Get User Profile API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.get('/api/v1/Users/profile')
    
    console.log('✅ Profile Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Get Profile API error:', error)
    throw error
  }
}

/**
 * Get current user profile (alias for getProfile)
 * @returns {Promise} API response
 */
export const getCurrentUser = async () => {
  return getProfile()
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise} API response
 */
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/api/v1/Users/${userId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Update user profile
 * Requires Authorization Bearer token
 * @param {Object} userData - Updated user data
 * @param {string} userData.displayName - User display name
 * @param {string} userData.phoneNo - User phone number
 * @param {string} userData.companyName - Company name
 * @returns {Promise} API response
 */
export const updateProfile = async (userData) => {
  try {
    console.log('📝 Update Profile API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Prepare the request payload
    // displayName is required, phoneNo and companyName are optional
    const payload = {
      displayName: (userData.displayName !== undefined && userData.displayName !== null) 
        ? userData.displayName.trim() 
        : '',
    }
    
    // Only include phoneNo if it has a value (API validates format even for empty strings)
    const trimmedPhoneNo = (userData.phoneNo !== undefined && userData.phoneNo !== null) 
      ? userData.phoneNo.trim() 
      : ''
    if (trimmedPhoneNo) {
      payload.phoneNo = trimmedPhoneNo
    } else {
      // Send null for empty phone number instead of empty string to avoid validation error
      payload.phoneNo = null
    }
    
    // Include companyName (can be empty string)
    payload.companyName = (userData.companyName !== undefined && userData.companyName !== null) 
      ? userData.companyName.trim() 
      : ''
    
    console.log('📤 Profile Data:', {
      displayName: payload.displayName,
      phoneNo: payload.phoneNo || '(empty)',
      companyName: payload.companyName,
    })
    console.log('📤 Full Payload:', JSON.stringify(payload, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.put('/api/v1/Users/profile', payload)
    
    console.log('✅ Update Profile Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Update Profile API error:', error)
    
    // Log detailed validation errors if available
    if (error?.data) {
      console.error('📋 Validation Error Details:', JSON.stringify(error.data, null, 2))
      
      // Check for common validation error formats
      if (error.data.errors) {
        console.error('🔍 Field Validation Errors:', error.data.errors)
      }
      if (error.data.Errors) {
        console.error('🔍 Field Validation Errors (capitalized):', error.data.Errors)
      }
      if (error.data.validationErrors) {
        console.error('🔍 Validation Errors:', error.data.validationErrors)
      }
      if (error.data.ValidationErrors) {
        console.error('🔍 Validation Errors (capitalized):', error.data.ValidationErrors)
      }
    }
    
    throw error
  }
}

/**
 * Update user profile (alias for updateProfile)
 * @param {Object} userData - Updated user data
 * @returns {Promise} API response
 */
export const updateUser = async (userData) => {
  return updateProfile(userData)
}

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise} API response
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/api/v1/Users/change-password', passwordData)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Upload user avatar
 * Requires Authorization Bearer token
 * @param {File} avatarFile - Avatar image file
 * @returns {Promise} API response
 */
export const uploadAvatar = async (avatarFile) => {
  try {
    console.log('📤 Upload Avatar API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 File name:', avatarFile.name)
    console.log('📤 File size:', avatarFile.size, 'bytes')
    console.log('📤 File type:', avatarFile.type)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const formData = new FormData()
    formData.append('AvatarFile', avatarFile) // Field name must be 'AvatarFile' as per API
    
    const response = await apiClient.put('/api/v1/Users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'text/plain',
      },
    })
    
    console.log('✅ Upload Avatar Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Upload Avatar API error:', error)
    throw error
  }
}

/**
 * Delete user account
 * Requires Authorization Bearer token
 * @param {string} email - User email address
 * @returns {Promise} API response
 */
export const deleteAccount = async (email) => {
  try {
    console.log('🗑️ Delete Account API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Email:', email)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // URL encode the email to handle special characters like @
    const encodedEmail = encodeURIComponent(email)
    
    const response = await apiClient.delete(`/api/v1/Users/${encodedEmail}`)
    
    console.log('✅ Delete Account Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Delete Account API error:', error)
    throw error
  }
}

// Export all user functions as default object
export default {
  getProfile,
  getCurrentUser,
  getUserById,
  updateProfile,
  updateUser,
  changePassword,
  uploadAvatar,
  deleteAccount,
}

