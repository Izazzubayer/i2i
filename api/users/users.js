import apiClient from '../config'

/**
 * Users API endpoints
 * Placeholder for future user-related API calls
 */

/**
 * Get current user profile
 * @returns {Promise} API response
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/v1/Users/me')
    return response.data
  } catch (error) {
    throw error
  }
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
  getCurrentUser,
  getUserById,
  updateUser,
  changePassword,
  uploadAvatar,
}

