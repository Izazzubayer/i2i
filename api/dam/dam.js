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
 * Test a DAM connection
 * @param {Object} testData - Test connection data
 * @param {string} testData.systemCode - System code (e.g., "Shopify")
 * @param {string} testData.shopDomain - Shop domain
 * @param {string} testData.accessToken - Access token
 * @param {string} testData.apiVersion - API version
 * @returns {Promise} API response
 */
export const testDamConnection = async (testData) => {
  try {
    console.log('🔌 Test DAM Connection API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Test Data:', JSON.stringify(testData, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.post('/api/v1/dam/connections/test', testData)
    
    console.log('✅ Test DAM Connection Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Check if the test was successful
    const responseData = response.data
    if (responseData && responseData.isSuccess === false) {
      // Test failed - throw error with the message from API
      const errorMessage = responseData.message || 'Test connection failed'
      const error = new Error(errorMessage)
      error.data = responseData
      error.errorCode = responseData.errorCode
      throw error
    }
    
    return responseData
  } catch (error) {
    console.error('❌ Test DAM Connection API error:', error)
    throw error
  }
}

/**
 * Get DAM connections
 * @returns {Promise} API response with connections array
 */
export const getDamConnections = async () => {
  try {
    console.log('🔌 Get DAM Connections API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.get('/api/v1/dam/connections')
    
    console.log('✅ Get DAM Connections Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Get DAM Connections API error:', error)
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

/**
 * Update DAM connection status (activate/deactivate/delete)
 * @param {Object} statusData - Status update data
 * @param {string} statusData.connectionId - Connection ID
 * @param {boolean} statusData.isActive - Active status
 * @param {boolean} statusData.isDeleted - Deleted status
 * @returns {Promise} API response
 */
export const updateDamConnectionStatus = async (statusData) => {
  try {
    console.log('🔌 Update DAM Connection Status API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 Status Data:', JSON.stringify(statusData, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.put('/api/v1/dam/connections/isactive', statusData)
    
    console.log('✅ Update DAM Connection Status Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Update DAM Connection Status API error:', error)
    throw error
  }
}

// Export all DAM functions as default object
export default {
  getDamSystems,
  testDamConnection,
  getDamConnections,
  createDamConnection,
  updateDamConnectionStatus,
}

