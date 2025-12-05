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
 * @param {Object} userData - Updated user data
 * @returns {Promise} API response
 */
export const updateUser = async (userData) => {
  try {
    const response = await apiClient.put('/api/v1/Users/me', userData)
    return response.data
  } catch (error) {
    throw error
  }
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
 * @param {File} avatarFile - Avatar image file
 * @returns {Promise} API response
 */
export const uploadAvatar = async (avatarFile) => {
  try {
    const formData = new FormData()
    formData.append('avatar', avatarFile)
    
    const response = await apiClient.post('/api/v1/Users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Export all user functions as default object
export default {
  getProfile,
  getCurrentUser,
  getUserById,
  updateUser,
  changePassword,
  uploadAvatar,
}

