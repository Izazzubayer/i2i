# Authentication System

**Features 1.1 - 1.2: Sign Up, Sign In, Password Reset**

This document details the authentication system implementation for the i2i platform.

---

## Implementation Files

- `app/sign-up/page.tsx` - Sign up page
- `app/sign-in/page.tsx` - Sign in page
- `app/api/auth/*/route.ts` - Authentication API routes
- `components/auth/*` - Authentication components
- `middleware.ts` - Route protection

---

## 1.1 Sign Up (FUNCTIONAL)

### Implementation Location
**File:** `app/sign-up/page.tsx`

### Logic Flow
```typescript
User fills form → Validation → API Call → Email Verification → Database Entry
```

### Required Fields

| Field | Type | Validation |
|-------|------|------------|
| Name | Text input | Min 2 chars, max 50 chars |
| Email | Email input | Valid email format |
| Password | Password input | Min 8 chars, complexity check |
| Re-enter Password | Password input | Must match password |
| Company Name | Text input | Optional |
| Captcha | reCAPTCHA v3 | Required |

### Authentication Providers

1. **Email/Password** (CredentialsProvider)
2. **Google OAuth** (GoogleProvider)
3. **Microsoft OAuth** (MicrosoftProvider)

### API Endpoint

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```typescript
interface SignUpRequest {
  name: string
  email: string
  password: string
  companyName?: string
  captchaToken: string
}
```

**Response:**
```typescript
interface SignUpResponse {
  success: boolean
  message: string
  requiresVerification: boolean
}
```

### Process Flow

1. **Frontend Validation**
   - Check all required fields
   - Validate email format
   - Check password strength
   - Verify password match
   - Validate captcha token

2. **Submit to API** (`/api/auth/signup`)
   - Send form data with captcha token

3. **Backend Processing**
   - Validate captcha with Google reCAPTCHA API
   - Check if email already exists
   - Hash password using bcrypt (12 rounds)
   - Create user record in database
   - Generate email verification token
   - Send verification email

4. **User Verification**
   - User receives email with verification link
   - Click link to verify account
   - Redirect to sign in page

5. **Success Response**
   - Display success message
   - Inform user to check email
   - Provide link to sign in

### Email Integration

```typescript
// services/email/sendgrid.ts
await sendEmail({
  to: user.email,
  template: 'email-verification',
  data: {
    name: user.name,
    verificationLink: `${baseUrl}/verify-email?token=${token}`
  }
})
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Security Measures

1. **Captcha Protection** - Prevent bot registrations
2. **Email Verification** - Confirm email ownership
3. **Password Hashing** - Bcrypt with 12 rounds
4. **Rate Limiting** - Limit sign up attempts per IP
5. **Input Sanitization** - Prevent SQL injection and XSS

---

## 1.2 Sign In (FUNCTIONAL)

### Implementation Location
**File:** `app/sign-in/page.tsx`

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| Email | Email input | Registered email address |
| Password | Password input | User password |
| Remember Me | Checkbox | Extend session duration |

### Additional Features

- **Forget Password Link** - Opens password reset modal
- **Admin Sign In Button** - Separate route for admin users

### API Endpoint

**Endpoint:** `POST /api/auth/signin`

**Request Body:**
```typescript
interface SignInRequest {
  email: string
  password: string
  rememberMe?: boolean
}
```

### Authentication Flow (NextAuth.js)

```typescript
// Using NextAuth.js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import MicrosoftProvider from 'next-auth/providers/microsoft'

export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Validate credentials
        const user = await validateUser(credentials)
        if (user) return user
        return null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      return session
    }
  }
}
```

### Sign In Process

1. **User Input**
   - Enter email and password
   - Optional: Check "Remember Me"

2. **Client-Side Validation**
   - Verify email format
   - Check password is not empty

3. **Submit Credentials**
   - Send to NextAuth.js sign in endpoint

4. **Server-Side Validation**
   - Fetch user from database
   - Verify email is verified
   - Check account status (not deleted/suspended)
   - Compare password hash using bcrypt

5. **Session Creation**
   - Generate JWT token
   - Set session cookie
   - Set expiration (30 days or session-based)

6. **Redirect**
   - Redirect to dashboard or callback URL

### OAuth Flow

1. **Click Google/Microsoft Button**
2. **Redirect to Provider**
3. **User Authorizes**
4. **Return to App with Token**
5. **Create or Update User**
6. **Create Session**
7. **Redirect to Dashboard**

---

## Password Reset (Forget Password)

### Implementation Location
**Component:** `components/auth/ResetPasswordForm.tsx`  
**API:** `app/api/auth/reset-password/route.ts`

### Forget Password Flow

1. **User Clicks "Forget Password"**
   - Modal/dialog appears on sign in page

2. **Enter Email**
   - User enters registered email address
   - Submit form

3. **API Request** (`POST /api/auth/reset-password`)
   ```typescript
   {
     email: "user@example.com"
   }
   ```

4. **Backend Processing**
   - Verify email exists in database
   - Generate time-limited reset token (1 hour expiry)
   - Store token in database with expiry
   - Send email with reset link

5. **Email with Reset Link**
   ```typescript
   await sendEmail({
     to: email,
     template: 'password-reset',
     data: {
       name: user.name,
       resetLink: `${baseUrl}/reset-password?token=${token}`
     }
   })
   ```

6. **User Clicks Link**
   - Opens reset password page
   - Token validated

7. **Reset Password Page**
   - Enter new password
   - Re-enter new password
   - Password strength indicator
   - Submit button

8. **Submit New Password** (`POST /api/auth/reset-password/confirm`)
   ```typescript
   {
     token: "reset-token-here",
     newPassword: "NewPassword123!"
   }
   ```

9. **Backend Processing**
   - Validate token (not expired, not used)
   - Validate password strength
   - Hash new password (bcrypt)
   - Update user password in database
   - Invalidate reset token
   - Send confirmation email

10. **Success**
    - Display success message
    - Redirect to sign in page

### Security Measures

1. **Token Expiry** - Tokens expire after 1 hour
2. **Single Use** - Tokens can only be used once
3. **Rate Limiting** - Limit reset requests per email
4. **Email Confirmation** - Notify user of password change
5. **No Email Enumeration** - Same response whether email exists or not

---

## Session Management

### JWT Token Structure

```typescript
interface JWTToken {
  id: string          // User ID
  email: string       // User email
  name: string        // User name
  iat: number         // Issued at timestamp
  exp: number         // Expiration timestamp
}
```

### Session Duration

- **Regular Session**: 7 days
- **Remember Me**: 30 days
- **Admin Session**: 24 hours

### Session Security

1. **HTTP-Only Cookies** - Cannot be accessed via JavaScript
2. **Secure Flag** - Only transmitted over HTTPS
3. **SameSite=Lax** - CSRF protection
4. **Token Rotation** - Refresh token on each request

---

## Error Handling

### Sign Up Errors

| Error | Message | Action |
|-------|---------|--------|
| Email exists | "Email already registered" | Redirect to sign in |
| Invalid captcha | "Captcha verification failed" | Re-display captcha |
| Weak password | "Password doesn't meet requirements" | Show requirements |
| Server error | "Something went wrong. Try again." | Log error, retry |

### Sign In Errors

| Error | Message | Action |
|-------|---------|--------|
| Invalid credentials | "Invalid email or password" | Allow retry |
| Email not verified | "Please verify your email first" | Send verification |
| Account deleted | "Account has been deleted" | No retry |
| Account suspended | "Account suspended. Contact support." | Show contact |

---

## Testing Checklist

### Sign Up
- [ ] All fields validate correctly
- [ ] Password strength requirements work
- [ ] Password match validation
- [ ] Captcha validation
- [ ] Email uniqueness check
- [ ] Verification email sent
- [ ] OAuth providers work
- [ ] Error messages display correctly

### Sign In
- [ ] Valid credentials allow login
- [ ] Invalid credentials show error
- [ ] Remember me extends session
- [ ] OAuth sign in works
- [ ] Forgot password flow works
- [ ] Email verification required
- [ ] Deleted accounts cannot sign in

### Security
- [ ] Passwords are hashed
- [ ] Tokens are secure
- [ ] Rate limiting works
- [ ] CSRF protection enabled
- [ ] Session cookies secure

---

## Environment Variables Required

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Captcha
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Email
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@i2i-platform.com
```

---

**Previous:** [← Folder Structure](./01-Folder-Structure.md) | **Next:** [User Management →](./03-User-Management.md)

