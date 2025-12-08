# API Structure

This directory contains all API-related code organized by feature/module.

## Structure

```
api/
├── config.js          # Base API configuration (axios instance, interceptors)
├── index.js           # Central export file for all APIs
├── auth/
│   └── auth.js        # Authentication APIs (signup, signin, etc.)
├── orders/
│   └── orders.js      # Orders APIs
└── users/
    └── users.js       # Users APIs
```

## Base Configuration

The base URL is configured in `api/config.js`:
- **Base URL**: `http://192.168.1.248:8007`

The axios instance includes:
- Automatic token injection from localStorage
- Global error handling
- Request/response interceptors

## Usage

### Import APIs

```javascript
// Import specific API
import { signup, signin } from '@/api/auth/auth'

// Or import from central index
import { authAPI, ordersAPI } from '@/api'
```

### Example: Sign Up

```javascript
import { signup } from '@/api/auth/auth'

const handleSignup = async () => {
  try {
    const signupData = {
      email: 'user@example.com',
      password: 'password123',
      displayName: 'John Doe',
      phoneNo: '', // Empty string if not provided
      companyName: 'Company Name',
      termsAndCondition: true
    }
    
    const response = await signup(signupData)
    console.log('Signup successful:', response)
  } catch (error) {
    console.error('Signup failed:', error.message)
  }
}
```

## API Endpoints

### Authentication (`/api/auth/auth.js`)

- `signup(signupData)` - POST `/api/v1/Auth/signup`
- `signin(signinData)` - POST `/api/v1/Auth/signin`
- `signout()` - POST `/api/v1/Auth/signout`
- `verifyEmail(verifyData)` - POST `/api/v1/Auth/verify-email`
- `requestPasswordReset(resetData)` - POST `/api/v1/Auth/forgot-password`
- `resetPassword(resetData)` - POST `/api/v1/Auth/reset-password`
- `refreshToken()` - POST `/api/v1/Auth/refresh-token`

### Orders (`/api/orders/orders.js`)

- `getOrders(params)` - GET `/api/v1/Orders`
- `getOrderById(orderId)` - GET `/api/v1/Orders/:id`
- `createOrder(orderData)` - POST `/api/v1/Orders`
- `updateOrder(orderId, orderData)` - PUT `/api/v1/Orders/:id`
- `deleteOrder(orderId)` - DELETE `/api/v1/Orders/:id`

### Users (`/api/users/users.js`)

- `getCurrentUser()` - GET `/api/v1/Users/me`
- `getUserById(userId)` - GET `/api/v1/Users/:id`
- `updateUser(userData)` - PUT `/api/v1/Users/me`
- `changePassword(passwordData)` - POST `/api/v1/Users/change-password`
- `uploadAvatar(avatarFile)` - POST `/api/v1/Users/avatar`

## Error Handling

All API functions throw errors that can be caught and handled:

```javascript
try {
  const response = await signup(data)
} catch (error) {
  // error.message - User-friendly error message
  // error.status - HTTP status code (if available)
  // error.data - Full error response data
  console.error(error.message)
}
```

## Adding New APIs

1. Create a new file in the appropriate folder (e.g., `api/products/products.js`)
2. Import `apiClient` from `../config`
3. Export your API functions
4. Add exports to `api/index.js`

Example:

```javascript
// api/products/products.js
import apiClient from '../config'

export const getProducts = async () => {
  const response = await apiClient.get('/api/v1/Products')
  return response.data
}
```

