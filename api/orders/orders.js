import apiClient, { BASE_URL } from '../config'
import axios from 'axios'

/**
 * Orders API endpoints
 */

/**
 * Start a new order
 * @returns {Promise} API response with orderId, orderNumber, orderName, status, createdAt
 */
export const startOrder = async () => {
  try {
    console.log('📦 Start Order API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.post('/api/v1/orders/start', {}, {
      headers: {
        'Accept': 'text/plain',
      },
    })
    
    console.log('✅ Start Order Response received')
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Start Order API error:', error)
    throw error
  }
}

/**
 * Get all orders with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.pageNumber - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 50)
 * @param {string} params.statusLookupId - Status lookup ID (optional)
 * @returns {Promise} API response with orders array, totalCount, pageNumber, pageSize
 */
export const getOrders = async (params = {}) => {
  try {
    const queryParams = {
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 50,
      ...(params.statusLookupId && { statusLookupId: params.statusLookupId }),
    }
    
    const response = await apiClient.get('/api/v1/orders', { 
      params: queryParams,
      headers: {
        'Accept': 'text/plain',
      },
    })
    
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Process an order (upload image and prompt)
 * @param {Object} processData - Process order data
 * @param {string} processData.orderId - Order ID (required)
 * @param {File} processData.image - Image file to upload (required)
 * @param {string} processData.prompt - Prompt text (optional)
 * @returns {Promise} API response with order processing details
 */
export const processOrder = async (processData) => {
  try {
    console.log('📦 Process Order API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 OrderId:', processData.orderId)
    console.log('📤 Image:', processData.image?.name || 'No image')
    console.log('📤 Prompt:', processData.prompt || '(empty)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (!processData.orderId) {
      throw {
        message: 'OrderId is required. Call /start first to get an OrderId.',
        status: 400,
      }
    }
    
    if (!processData.image) {
      throw {
        message: 'Image is required.',
        status: 400,
      }
    }
    
    // Create FormData for multipart/form-data
    const formData = new FormData()
    formData.append('OrderId', processData.orderId)
    formData.append('Image', processData.image)
    if (processData.prompt) {
      formData.append('Prompt', processData.prompt)
    }
    
    // Get auth token for manual header setting
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    // Use axios directly for multipart/form-data
    const processResponse = await axios.post(
      `${BASE_URL}/api/v1/orders/process`,
      formData,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'text/plain',
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    
    // Convert to same format as apiClient response
    const response = {
      status: processResponse.status,
      data: processResponse.data,
    }
    
    console.log('✅ Process Order Response received')
    console.log('📥 Response Status:', response.status)
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Process Order API error:', error)
    
    // Handle axios errors
    if (error.response) {
      const { status, data } = error.response
      let errorMessage = 'An error occurred'
      
      if (data?.error) {
        errorMessage = data.error
      } else if (data?.Message) {
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
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} API response with order details
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/api/v1/orders/${orderId}`, {
      headers: {
        'Accept': 'text/plain',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get order details with inputs, images, and versions
 * @param {string} orderId - Order ID
 * @param {Object} params - Query parameters
 * @param {number} params.expirationMinutes - Expiration minutes for URLs (default: 60)
 * @returns {Promise} API response with full order details
 */
export const getOrderDetails = async (orderId, params = {}) => {
  try {
    const queryParams = {
      expirationMinutes: params.expirationMinutes || 60,
    }
    
    const response = await apiClient.get(`/api/v1/orders/${orderId}/details`, {
      params: queryParams,
      headers: {
        'Accept': 'text/plain',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Confirm an order
 * @param {string} orderId - Order ID
 * @returns {Promise} API response with confirmation details
 */
export const confirmOrder = async (orderId) => {
  try {
    console.log('📦 Confirm Order API Call')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📤 OrderId:', orderId)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const response = await apiClient.post(`/api/v1/orders/${orderId}/confirm`, {}, {
      headers: {
        'Accept': 'text/plain',
      },
    })
    
    console.log('✅ Confirm Order Response received')
    console.log('📥 Response Data:', JSON.stringify(response.data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return response.data
  } catch (error) {
    console.error('❌ Confirm Order API error:', error)
    throw error
  }
}

/**
 * Get order statistics
 * @returns {Promise} API response with order stats
 */
export const getOrderStats = async () => {
  try {
    const response = await apiClient.get('/api/v1/orders/stats', {
      headers: {
        'Accept': 'text/plain',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Export all order functions as default object
export default {
  startOrder,
  getOrders,
  processOrder,
  getOrderById,
  getOrderDetails,
  confirmOrder,
  getOrderStats,
}

