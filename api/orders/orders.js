import apiClient from '../config'

/**
 * Orders API endpoints
 * Placeholder for future order-related API calls
 */

/**
 * Get all orders
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/v1/Orders', { params })
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} API response
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/api/v1/Orders/${orderId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Create new order
 * @param {Object} orderData - Order data
 * @returns {Promise} API response
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/api/v1/Orders', orderData)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Update order
 * @param {string} orderId - Order ID
 * @param {Object} orderData - Updated order data
 * @returns {Promise} API response
 */
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await apiClient.put(`/api/v1/Orders/${orderId}`, orderData)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * Delete order
 * @param {string} orderId - Order ID
 * @returns {Promise} API response
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await apiClient.delete(`/api/v1/Orders/${orderId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Export all order functions as default object
export default {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
}

