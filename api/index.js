/**
 * Central API export file
 * Import all API modules from here for cleaner imports
 */

// Auth APIs
export { default as authAPI } from './auth/auth'
export * from './auth/auth'

// Orders APIs
export { default as ordersAPI } from './orders/orders'
export * from './orders/orders'

// Users APIs
export { default as usersAPI } from './users/users'
export * from './users/users'

// Config
export { default as apiClient, BASE_URL } from './config'

