import axios from 'axios'

// Base URL for the API
export const BASE_URL = 'http://192.168.1.248:8007'

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Request interceptor (for adding auth tokens, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor (for handling errors globally)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          // Optionally redirect to login
        }
      }
      
      // Return error with message
      // Handle different API error response formats
      let errorMessage = 'An error occurred'
      
      // Check for various error message formats (case-insensitive)
      // Priority: Message (uppercase) > message (lowercase) > error > Error
      if (data?.Message) {
        errorMessage = data.Message
      } else if (data?.message) {
        errorMessage = data.message
      } else if (data?.error) {
        errorMessage = data.error
      } else if (data?.Error) {
        errorMessage = data.Error
      } else if (typeof data === 'string') {
        errorMessage = data
      } else if (data?.data?.Message) {
        errorMessage = data.data.Message
      } else if (data?.data?.message) {
        errorMessage = data.data.message
      }
      
      // Log error for debugging
      console.error('API Error Response:', {
        status,
        code: data?.Code || data?.code,
        message: errorMessage,
        data: data
      })
      
      return Promise.reject({
        message: errorMessage,
        status,
        data,
        code: data?.Code || data?.code, // Include error code if available
      })
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: null,
      })
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: null,
      })
    }
  }
)

export default apiClient

