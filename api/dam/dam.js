import apiClient from '../config'

/**
 * DAM (Digital Asset Management) API endpoints
 */

/**
 * Get available DAM systems
 * @param {Object} options - Query options
 * @param {boolean} options.onlyActive - Only return active systems (default: true)
 * @returns {Promise} API response with systems array
 */
export const getDamSystems = async (options = {}) => {
  try {
    const { onlyActive = true } = options
    
    console.log('🔌 Get DAM Systems API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Query params:', { onlyActive })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.get('/api/v1/dam/systems', {
      params: {
        onlyActive: onlyActive
      }
    })
    
    console.log('✅ Get DAM Systems Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Get DAM Systems API error:', error)
    throw error
  }
}

/**
 * Create a DAM connection
 * @param {Object} connectionData - Connection data
 * @returns {Promise} API response
 */
export const createDamConnection = async (connectionData) => {
  try {
    console.log('🔌 Create DAM Connection API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Connection Data:', JSON.stringify(connectionData, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.post('/api/v1/dam/connections', connectionData)
    
    console.log('✅ Create DAM Connection Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Create DAM Connection API error:', error)
    throw error
  }
}

// Export all DAM functions as default object
export default {
  getDamSystems,
  createDamConnection,
}

