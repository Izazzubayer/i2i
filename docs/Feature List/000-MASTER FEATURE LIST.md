# i2i Platform - Comprehensive Feature & Technical Documentation

**Version:** 1.0  
**Last Updated:** November 26, 2025  
**Platform:** Next.js 14 (App Router) with TypeScript

---

## Table of Contents

1. [Application Sitemap](#application-sitemap)
2. [Folder & File Structure](#folder--file-structure)
3. [Feature Specifications](#feature-specifications)
4. [Technical Architecture](#technical-architecture)
5. [API Integration Guide](#api-integration-guide)
6. [LLM Integration](#llm-integration)
7. [DAM Integration](#dam-integration)
8. [Authentication & Security](#authentication--security)
9. [State Management](#state-management)
10. [Deployment & Scaling](#deployment--scaling)

---

## Application Sitemap

```
i2i Platform
│
├── Public Pages (Unauthenticated)
│   ├── Homepage (/)
│   ├── Sign In (/sign-in)
│   ├── Sign Up (/sign-up)
│   ├── Portfolio (/portfolio)
│   ├── Resources (/resources) [How It Works]
│   ├── API Documentation (/api-docs)
│   ├── Support (/support) [Contact Us + FAQ]
│   └── Legal (/legal) [Terms, Privacy, Release Notes]
│
├── Authenticated Pages
│   ├── Image Processing Workflow (/dashboard or /)
│   │   ├── Upload Interface
│   │   ├── Processing View
│   │   └── Results Gallery
│   │
│   ├── Orders (/orders)
│   │   ├── Orders List View
│   │   └── Single Order (/orders/[orderId])
│   │       ├── Gallery View
│   │       ├── Action Log
│   │       ├── Reprocess Interface
│   │       └── DAM Export
│   │
│   ├── Account Management (/account)
│   │   ├── Profile (/account)
│   │   ├── Security (/account/security)
│   │   └── Notifications (/account/notifications)
│   │
│   ├── Billing (/billing)
│   │   ├── Current Plan
│   │   ├── Payment Methods
│   │   └── Payment History
│   │
│   └── Tokens (/tokens) [Credit Management]
│
└── API Endpoints (/api/*)
    ├── Authentication
    ├── Image Processing
    ├── DAM Integration
    └── User Management
```

---

## Folder & File Structure

### Complete Directory Mapping

```
/Users/izaz/Documents/i2i/
│
├── app/                                    # Next.js 14 App Router
│   │
│   ├── (public)/                          # Public route group
│   │   ├── page.tsx                       # Homepage (Landing)
│   │   ├── sign-in/page.tsx              # Sign In Feature [1.2]
│   │   ├── sign-up/page.tsx              # Sign Up Feature [1.1]
│   │   ├── portfolio/page.tsx            # Portfolio Gallery [NF]
│   │   ├── resources/page.tsx            # How It Works [NF]
│   │   ├── api-docs/page.tsx             # API Documentation [NF]
│   │   ├── support/page.tsx              # Contact Us + FAQ [F]
│   │   └── legal/page.tsx                # Terms, Privacy [NF]
│   │
│   ├── (authenticated)/                   # Protected routes
│   │   ├── dashboard/                    # IPW - Main Processing [F]
│   │   │   └── page.tsx
│   │   │
│   │   ├── orders/                       # Orders Management [F]
│   │   │   ├── page.tsx                  # Orders List [2.1-2.6]
│   │   │   └── [orderId]/               # Single Order [3.1-3.6]
│   │   │       └── page.tsx
│   │   │
│   │   ├── processing/                   # Alternative IPW location
│   │   │   ├── page.tsx
│   │   │   └── [batchId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── account/                      # Account Management [2]
│   │   │   ├── page.tsx                  # Profile [2.1]
│   │   │   ├── security/                 # Password Mgmt [2.2]
│   │   │   │   └── page.tsx
│   │   │   └── notifications/            # Notification Prefs [2.1]
│   │   │       └── page.tsx
│   │   │
│   │   ├── billing/                      # Billing & Subscription [3]
│   │   │   └── page.tsx
│   │   │
│   │   └── tokens/                       # Token/Credit Management
│   │       └── page.tsx
│   │
│   ├── api/                              # Backend API Routes
│   │   ├── auth/                         # Authentication [1]
│   │   │   ├── signin/route.ts
│   │   │   ├── signup/route.ts
│   │   │   ├── signout/route.ts
│   │   │   └── reset-password/route.ts
│   │   │
│   │   ├── upload/                       # Image Upload [IPW.1]
│   │   │   └── route.ts
│   │   │
│   │   ├── status/                       # Processing Status
│   │   │   └── [batchId]/
│   │   │       └── route.ts
│   │   │
│   │   ├── retouch/                      # Image Retouch [3.3]
│   │   │   └── [imageId]/
│   │   │       └── route.ts
│   │   │
│   │   ├── results/                      # Results Retrieval
│   │   │   └── [batchId]/
│   │   │       └── route.ts
│   │   │
│   │   ├── export/                       # Download & Export [3.4]
│   │   │   └── route.ts
│   │   │
│   │   ├── dam/                          # DAM Integration [DAM]
│   │   │   ├── upload/route.ts
│   │   │   ├── connect/route.ts
│   │   │   └── disconnect/route.ts
│   │   │
│   │   ├── orders/                       # Order Management
│   │   │   ├── route.ts                  # List orders
│   │   │   └── [orderId]/route.ts        # Single order
│   │   │
│   │   ├── user/                         # User Management [2]
│   │   │   ├── profile/route.ts
│   │   │   ├── password/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   └── delete/route.ts           # Account Deletion [4]
│   │   │
│   │   ├── billing/                      # Billing APIs [3]
│   │   │   ├── plans/route.ts
│   │   │   ├── payment-methods/route.ts
│   │   │   └── history/route.ts
│   │   │
│   │   ├── contact/                      # Contact Form [Contact Us]
│   │   │   └── route.ts
│   │   │
│   │   └── llm/                          # LLM Processing
│   │       ├── process/route.ts
│   │       ├── chat/route.ts             # Instruction Assistant
│   │       └── summarize/route.ts
│   │
│   ├── layout.tsx                        # Root Layout
│   ├── globals.css                       # Global Styles
│   └── page.tsx                          # Root Page (redirects)
│
├── components/                           # React Components
│   │
│   ├── auth/                            # Authentication Components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── AuthProvider.tsx
│   │
│   ├── dashboard/                       # Dashboard Components
│   │   ├── UploadSection.tsx           # Upload Interface [IPW.1]
│   │   ├── ProcessingPanel.tsx         # Processing Status
│   │   ├── ImageGallery.tsx            # Results Gallery [3.1]
│   │   ├── InstructionChat.tsx         # AI Chat for Instructions
│   │   ├── RetouchDrawer.tsx           # Retouch Interface [3.3]
│   │   └── SummaryDrawer.tsx           # Results Summary
│   │
│   ├── orders/                          # Orders Components
│   │   ├── OrdersList.tsx              # Orders Table
│   │   ├── OrderCard.tsx               # Single Order Card
│   │   ├── ActionLog.tsx               # Action Log [3.2]
│   │   └── OrderStats.tsx              # Statistics [1]
│   │
│   ├── dam/                             # DAM Components
│   │   ├── DamConnectDialog.tsx        # DAM Setup Dialog
│   │   ├── DamProviderList.tsx         # Provider Selection
│   │   └── DamExportDialog.tsx         # Export to DAM
│   │
│   ├── account/                         # Account Components
│   │   ├── ProfileForm.tsx             # Profile Editor [2.1]
│   │   ├── PasswordForm.tsx            # Password Change [2.2]
│   │   ├── NotificationSettings.tsx    # Notification Prefs
│   │   └── DeleteAccountDialog.tsx     # Account Deletion [4]
│   │
│   ├── billing/                         # Billing Components
│   │   ├── PlanSelector.tsx            # Plan Selection
│   │   ├── PaymentMethodForm.tsx       # Payment Methods
│   │   └── PaymentHistory.tsx          # History Table
│   │
│   ├── layout/                          # Layout Components
│   │   ├── Header.tsx                  # Main Navigation
│   │   ├── AuthenticatedNav.tsx        # Auth User Nav
│   │   ├── Footer.tsx                  # Footer
│   │   └── Sidebar.tsx                 # Side Navigation
│   │
│   ├── ui/                              # ShadCN UI Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── checkbox.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   │
│   ├── aceternity/                      # Custom Animation Components
│   │   ├── animated-beam.tsx
│   │   ├── grid-background.tsx
│   │   └── spotlight.tsx
│   │
│   └── ThemeProvider.tsx               # Dark Mode Provider
│
├── lib/                                 # Utilities & Helpers
│   ├── api.ts                          # API Client (Axios)
│   ├── store.ts                        # Zustand State Management
│   ├── utils.ts                        # Helper Functions
│   ├── auth.ts                         # Auth Utilities
│   ├── validation.ts                   # Form Validation
│   └── constants.ts                    # App Constants
│
├── hooks/                               # Custom React Hooks
│   ├── useAuth.ts                      # Authentication Hook
│   ├── useUpload.ts                    # Upload Management
│   ├── useOrders.ts                    # Orders Management
│   └── useDam.ts                       # DAM Integration
│
├── types/                               # TypeScript Definitions
│   ├── index.ts                        # Main Types
│   ├── api.ts                          # API Types
│   ├── user.ts                         # User Types
│   └── dam.ts                          # DAM Types
│
├── services/                            # External Service Integrations
│   ├── llm/                            # LLM Service
│   │   ├── openai.ts                   # OpenAI Integration
│   │   ├── anthropic.ts                # Claude Integration
│   │   └── index.ts                    # LLM Factory
│   │
│   ├── dam/                            # DAM Services
│   │   ├── creative-force.ts
│   │   ├── dalim.ts
│   │   ├── shopify.ts
│   │   ├── facebook.ts
│   │   ├── instagram.ts
│   │   └── custom.ts
│   │
│   ├── storage/                        # Cloud Storage
│   │   ├── s3.ts                       # AWS S3
│   │   ├── cloudinary.ts               # Cloudinary
│   │   └── index.ts
│   │
│   ├── email/                          # Email Service
│   │   ├── sendgrid.ts
│   │   └── templates/
│   │       ├── welcome.ts
│   │       ├── order-complete.ts
│   │       └── password-reset.ts
│   │
│   └── payment/                        # Payment Processing
│       ├── stripe.ts
│       └── webhooks.ts
│
├── middleware.ts                        # Next.js Middleware (Auth)
├── next.config.js                       # Next.js Configuration
├── tailwind.config.ts                   # Tailwind Configuration
├── tsconfig.json                        # TypeScript Config
├── package.json                         # Dependencies
└── .env.local                          # Environment Variables
```

---

## Feature Specifications

### 1. Authentication System [Features 1.1 - 1.2]

**Files:**
- `app/sign-up/page.tsx`
- `app/sign-in/page.tsx`
- `app/api/auth/*/route.ts`
- `components/auth/*`

#### 1.1 Sign Up (FUNCTIONAL)

**Implementation Location:** `app/sign-up/page.tsx`

**Logic Flow:**
```typescript
User fills form → Validation → API Call → Email Verification → Database Entry
```

**Required Fields:**
- Name (text input with validation)
- Email (validated email format)
- Password (min 8 chars, complexity check)
- Re-enter Password (match validation)
- Company Name (optional)
- Captcha (reCAPTCHA v3 or hCaptcha)

**Authentication Providers:**
- Google OAuth (NextAuth.js)
- Microsoft OAuth (NextAuth.js)

**API Endpoint:** `POST /api/auth/signup`

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

**Process:**
1. Frontend validates inputs
2. Submit to `/api/auth/signup`
3. Backend validates captcha
4. Hash password (bcrypt)
5. Create user record (database)
6. Send verification email
7. Return success message
8. User checks email for verification link

**Email Integration:**
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

#### 1.2 Sign In (FUNCTIONAL)

**Implementation Location:** `app/sign-in/page.tsx`

**Required Fields:**
- Email address
- Password
- Remember Me (checkbox)
- Forget Password (link → modal/page)
- Admin Sign In (separate route)

**API Endpoint:** `POST /api/auth/signin`

**Authentication Flow:**
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

**Forget Password Flow:**
1. User clicks "Forget Password"
2. Modal/dialog appears
3. User enters email
4. API sends reset link: `POST /api/auth/reset-password`
5. Email contains time-limited token
6. User clicks link → Reset password page
7. Enter new password (with confirmation)
8. Password updated → Redirect to sign in

---

### 2. User Profile Management [Feature 2]

**Files:**
- `app/account/page.tsx`
- `app/account/security/page.tsx`
- `app/account/notifications/page.tsx`
- `components/account/*`

#### 2.1 User Management (FUNCTIONAL)

**Implementation Location:** `app/account/page.tsx`

**Editable Fields:**
- Name (text input)
- Avatar (image upload with preview)
- Company Name (text input)
- Notification Preferences (toggle switches)
  - Email notifications ON/OFF
  - Order completion notifications
  - Marketing emails
  - System alerts

**API Endpoints:**
- `GET /api/user/profile` - Fetch user data
- `PUT /api/user/profile` - Update profile
- `POST /api/user/avatar` - Upload avatar

**Avatar Upload Logic:**
```typescript
// components/account/ProfileForm.tsx
const handleAvatarUpload = async (file: File) => {
  // Validate file
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    toast.error('File too large. Max 5MB')
    return
  }

  // Upload to cloud storage
  const formData = new FormData()
  formData.append('avatar', file)
  
  const { data } = await api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  setAvatarUrl(data.avatarUrl)
  toast.success('Avatar updated')
}
```

#### 2.2 Password Management (FUNCTIONAL)

**Implementation Location:** `app/account/security/page.tsx`

**Required Fields:**
- Current Password (password input)
- New Password (password input with strength indicator)
- Re-enter New Password (match validation)
- Save Button

**API Endpoint:** `PUT /api/user/password`

**Security Logic:**
```typescript
// app/api/user/password/route.ts
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await request.json()

  // Fetch user from database
  const user = await db.user.findUnique({ where: { id: session.user.id } })

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid current password' }, { status: 400 })
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 12)

  // Update in database
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash }
  })

  // Send email notification
  await sendEmail({
    to: user.email,
    template: 'password-changed',
    data: { name: user.name }
  })

  return NextResponse.json({ success: true })
}
```

---

### 3. Billing & Subscription [Feature 3 - NON-FUNCTIONAL]

**Implementation Location:** `app/billing/page.tsx`

**Components:**
- Current Plan Display
- Upgrade Options
- Payment Methods (Add/Edit)
- Payment History Table

**API Integration:**
```typescript
// services/payment/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(userId: string, priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer: userId,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`
  })
  
  return session.url
}

export async function getPaymentHistory(customerId: string) {
  const charges = await stripe.charges.list({
    customer: customerId,
    limit: 100
  })
  
  return charges.data.map(charge => ({
    id: charge.id,
    amount: charge.amount / 100,
    date: new Date(charge.created * 1000),
    status: charge.status,
    plan: charge.description
  }))
}
```

---

### 4. Account Deletion [Feature 4 - FUNCTIONAL]

**Implementation Location:** `components/account/DeleteAccountDialog.tsx`

**Process:**
1. User navigates to account settings
2. Clicks "Delete Account" button
3. Confirmation dialog appears
4. User must re-enter password
5. Final confirmation checkbox
6. API call to delete account
7. Soft delete (mark as deleted in DB)
8. All orders/data tagged as deleted
9. User logged out
10. Redirect to homepage

**API Endpoint:** `DELETE /api/user/delete`

**Soft Delete Logic:**
```typescript
// app/api/user/delete/route.ts
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { password } = await request.json()

  // Verify password
  const user = await db.user.findUnique({ where: { id: session.user.id } })
  const isValid = await bcrypt.compare(password, user.passwordHash)
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
  }

  // Soft delete - mark as deleted, keep records for audit
  await db.user.update({
    where: { id: user.id },
    data: {
      deletedAt: new Date(),
      status: 'DELETED',
      email: `deleted_${user.id}@deleted.com` // Prevent email reuse
    }
  })

  // Tag all related data
  await db.order.updateMany({
    where: { userId: user.id },
    data: { status: 'DELETED' }
  })

  // Send confirmation email
  await sendEmail({
    to: user.email,
    template: 'account-deleted',
    data: { name: user.name }
  })

  return NextResponse.json({ success: true })
}
```

---

### 5. Image Processing Workflow (IPW) [Feature: Home]

**Implementation Location:** `app/page.tsx` or `app/dashboard/page.tsx`

**Components:**
- `UploadSection.tsx` - Upload interface
- `InstructionChat.tsx` - AI instruction assistant
- `ProcessingPanel.tsx` - Status & logs
- `ImageGallery.tsx` - Results display

#### 5.1 Upload Images (FUNCTIONAL)

**Methods:**
1. Click to browse files
2. Drag & drop
3. Paste from clipboard

**Validation:**
```typescript
// lib/validation.ts
export const imageValidation = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
  maxSize: 50 * 1024 * 1024, // 50MB per image
  maxFiles: 100, // Max 100 images per batch
  
  validate: (file: File) => {
    if (!imageValidation.allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}`)
    }
    
    if (file.size > imageValidation.maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
    }
    
    return true
  }
}
```

**Upload Logic:**
```typescript
// components/dashboard/UploadSection.tsx
const handleUpload = async (files: File[]) => {
  setUploading(true)
  
  try {
    // Validate all files
    files.forEach(file => imageValidation.validate(file))
    
    // Create form data
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    
    // Add instructions
    if (instructionText) {
      formData.append('instructions', instructionText)
    } else if (instructionFile) {
      formData.append('instructionFile', instructionFile)
    }
    
    // Upload
    const response = await apiClient.upload(files, instructionText || instructionFile)
    
    // Create batch in store
    createBatch(response.batchId, instructionText, files.length)
    
    // Navigate to processing view
    router.push(`/processing/${response.batchId}`)
    
  } catch (error) {
    toast.error(error.message)
  } finally {
    setUploading(false)
  }
}
```

#### 5.2 Upload Attachment/Documents (FUNCTIONAL)

**Allowed Formats:**
- PDF (.pdf)
- Word (.doc, .docx)
- Text (.txt)

**Restriction:** One file at a time (can be changed)

**Logic:**
```typescript
// components/dashboard/InstructionChat.tsx
const handleFileUpload = async (file: File) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    toast.error('Only PDF, DOC, DOCX, and TXT files allowed')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    toast.error('File too large. Max 10MB')
    return
  }
  
  setInstructionFile(file)
  onFileChange(file)
  toast.success(`${file.name} attached`)
}
```

#### 5.3 Prompt/Instructions (FUNCTIONAL)

**Features:**
- Text input (textarea)
- AI chat assistant
- File attachment alternative
- Real-time character count

**Action Buttons:**
- Send (submit prompt)
- Selection (select specific images)
- Remove (clear input/files)
- Confirmation (finalize and start)

**AI Assistant Integration:**
See [LLM Integration](#llm-integration) section below.

---

### 6. Orders Management [Feature: Orders]

**Implementation Location:** 
- `app/orders/page.tsx` (List)
- `app/orders/[orderId]/page.tsx` (Single)

#### 6.1 Orders Statistics (NON-FUNCTIONAL)

**Display:**
- Total Images Processed
- Images In Process
- Images Completed
- Total Credits Used

#### 6.2 Client Orders (FUNCTIONAL)

**Table Columns:**
- Order Name (clickable → single order)
- Number of Images (display only)
- Time of Order Generation (timestamp)
- Size (MB/GB) (calculated)
- View Button (navigate to order)
- Download Button (download zip)

**API Endpoint:** `GET /api/orders`

**Response:**
```typescript
interface Order {
  id: string
  name: string
  imageCount: number
  createdAt: Date
  size: number // bytes
  status: 'processing' | 'completed' | 'failed'
  thumbnailUrl: string
}
```

#### 6.3 Single Order View (FUNCTIONAL)

**Implementation Location:** `app/orders/[orderId]/page.tsx`

**Features:**

##### 6.3.1 Preview Gallery (NON-FUNCTIONAL)
- Mac OS style gallery
- Icon list view with popup
- Grid view
- Lightbox on click

##### 6.3.2 Action Log (FUNCTIONAL)

**Log Entries:**
- Client Prompt (original instruction)
- Processing Time (per image)
- LLM Used (model name)
- Attached PDF (if any)
- Reprocessing Time
- Reprocess Prompts

**Implementation:**
```typescript
// components/orders/ActionLog.tsx
interface LogEntry {
  id: string
  type: 'upload' | 'process' | 'reprocess' | 'download' | 'export'
  message: string
  timestamp: Date
  imageId?: string
  prompt?: string
  llmModel?: string
  processingTime?: number
  attachments?: string[]
}

// Display log with clickable entries
{logs.map(log => (
  <div
    key={log.id}
    onClick={() => log.imageId && selectImage(log.imageId)}
    className="cursor-pointer hover:bg-muted"
  >
    <div className="flex justify-between">
      <span>{log.message}</span>
      <span>{log.timestamp.toLocaleTimeString()}</span>
    </div>
    {log.prompt && <div className="text-sm text-muted-foreground">{log.prompt}</div>}
  </div>
))}
```

##### 6.3.3 Reprocess (FUNCTIONAL)

**Modes:**
- Single Image → Single Prompt
- Multiple Images → Multiple Prompts (individual)
- **Note:** Cannot upload new documents during reprocess

**Implementation:**
```typescript
// app/api/retouch/[imageId]/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { instruction } = await request.json()
  const { imageId } = params

  // Fetch original image
  const image = await db.image.findUnique({ where: { id: imageId } })
  
  // Log reprocess action
  await db.actionLog.create({
    data: {
      orderId: image.orderId,
      imageId,
      type: 'REPROCESS',
      prompt: instruction,
      timestamp: new Date()
    }
  })

  // Queue for LLM processing
  await queueImageProcessing({
    imageId,
    imageUrl: image.processedUrl || image.originalUrl,
    instruction,
    isReprocess: true
  })

  return NextResponse.json({ success: true, status: 'queued' })
}
```

##### 6.3.4 Download (FUNCTIONAL)

**Options:**
- Download complete order (ZIP)
- Download single image
- Download selected images

**Implementation:**
```typescript
// app/api/export/route.ts
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  const { orderid, imageIds } = await request.json()

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { images: true }
  })

  // Filter images if specific IDs provided
  const imagesToDownload = imageIds 
    ? order.images.filter(img => imageIds.includes(img.id))
    : order.images

  // Create ZIP
  const zip = new JSZip()
  
  // Add summary
  zip.file('SUMMARY.txt', generateSummary(order))
  
  // Add images
  for (const image of imagesToDownload) {
    const response = await fetch(image.processedUrl)
    const blob = await response.blob()
    zip.file(image.originalName, blob)
  }

  // Generate ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' })

  // Return as download
  return new NextResponse(zipBlob, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${order.name}.zip"`
    }
  })
}
```

##### 6.3.5 Delete (FUNCTIONAL)

**Options:**
- Delete complete order
- Delete single image
- Delete selected images

**Confirmation Required:** Yes (dialog)

##### 6.3.6 Prompt Entry (FUNCTIONAL)

**Features:**
- Text input
- Send button
- Confirmation button
- Version selection (from action log)

---

### 7. Portfolio [Feature: Portfolio - NON-FUNCTIONAL]

**Implementation Location:** `app/portfolio/page.tsx`

**Categories:**
- Apparel
- Footwear
- Accessories
- Jewellery
- Perfume & Cosmetics
- Furniture
- Homewares
- Electronics

**Layout:**
- Grid of categories
- Each category has example images
- Before/After comparisons
- "Try It Now" button → IPW

---

### 8. Contact Us & Support [Feature: Contact Us - FUNCTIONAL]

**Implementation Location:** `app/support/page.tsx`

**Contact Form Fields:**
- User Name
- Email Address
- Subject Line
- Query/Message (textarea)
- Submit Button

**API Endpoint:** `POST /api/contact`

**Logic:**
```typescript
// app/api/contact/route.ts
export async function POST(request: NextRequest) {
  const { name, email, subject, message } = await request.json()

  // Store in database
  await db.contactSubmission.create({
    data: { name, email, subject, message, createdAt: new Date() }
  })

  // Send to support team
  await sendEmail({
    to: process.env.SUPPORT_EMAIL,
    subject: `Contact Form: ${subject}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  })

  // Send confirmation to user
  await sendEmail({
    to: email,
    template: 'contact-confirmation',
    data: { name }
  })

  return NextResponse.json({ success: true })
}
```

**In-App Notification:**
```typescript
toast.success('Message sent! We will get back to you within 24 hours.')
```

**Set Up Meeting (Future Release):**
- Calendar integration (Calendly/Cal.com)
- Available time slots
- Automatic scheduling

---

### 9. FAQ [Feature: FAQ - FUNCTIONAL]

**Implementation Location:** `app/support/page.tsx` (same as Contact)

**Format:** Collapsible accordion (ShadCN Accordion)

**Categories:**
- General Topics (Who uses, how to use)
- User Account Management
- IPW & Orders
- Billing & Payment
- Notifications
- Security & Privacy
- Contact Information

**Implementation:**
```typescript
// components/support/FAQ.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is i2i Platform?',
        a: 'i2i is an AI-powered image processing platform...'
      },
      // ...
    ]
  },
  // ...
]

export function FAQ() {
  return (
    <div className="space-y-8">
      {faqData.map(category => (
        <div key={category.category}>
          <h3>{category.category}</h3>
          <Accordion type="single" collapsible>
            {category.questions.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  )
}
```

---

### 10. Notifications [Feature: Notifications - FUNCTIONAL]

**Implementation Location:** 
- System: Email service
- In-app: Toast notifications (Sonner)

#### 10.1 System Notifications (Email)

**Triggers:**
- Order completed
- Order failed/errors
- New release updates
- Maintenance alerts
- Promotional offers
- New blog posts
- Password changed
- Account deletion
- Contact form response

**Implementation:**
```typescript
// services/email/templates/order-complete.ts
export const orderCompleteTemplate = (data: {
  userName: string
  orderName: string
  imageCount: number
  orderUrl: string
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Your Order is Ready! 🎉</h2>
    <p>Hi ${data.userName},</p>
    <p>Good news! Your order "<strong>${data.orderName}</strong>" with ${data.imageCount} images has been processed successfully.</p>
    <p><a href="${data.orderUrl}" class="button">View Results</a></p>
    <p>Thank you for using i2i Platform!</p>
  </div>
</body>
</html>
`
```

#### 10.2 In-App Notifications

**Method:** Sonner toast notifications (vanishing popups)

**Triggers:**
- Account changes (profile updated, password changed)
- Upload confirmed
- Processing started
- Download initiated
- DAM transfer complete
- Reprocessing confirmed

**Implementation:**
```typescript
import { toast } from 'sonner'

// Success
toast.success('Profile updated successfully')

// Error
toast.error('Upload failed. Please try again.')

// Loading
toast.loading('Processing images...')

// Custom
toast.custom((t) => (
  <div className="flex items-center gap-3">
    <CheckCircle2 className="h-5 w-5 text-green-500" />
    <div>
      <p className="font-semibold">Order Complete!</p>
      <p className="text-sm">10 images processed</p>
    </div>
  </div>
))
```

---

## Technical Architecture

### State Management (Zustand)

**Store Location:** `lib/store.ts`

**State Structure:**
```typescript
interface AppState {
  // User State
  user: User | null
  isAuthenticated: boolean
  
  // Batch Processing State
  batch: BatchData | null
  
  // Orders State
  orders: Order[]
  currentOrder: Order | null
  
  // UI State
  summaryDrawerOpen: boolean
  retouchDrawerOpen: boolean
  selectedImageForRetouch: ProcessedImage | null
  
  // DAM State
  damConnections: DamConnection[]
  activeDamConnection: DamConnection | null
  
  // Theme
  darkMode: boolean
  
  // Actions
  setUser: (user: User) => void
  createBatch: (id: string, instructions: string, imageCount: number) => void
  updateBatchProgress: (progress: number, status?: BatchStatus) => void
  addLog: (message: string, type?: LogEntry['type']) => void
  updateImageStatus: (imageId: string, status: ImageStatus) => void
  // ... more actions
}
```

**Usage:**
```typescript
// In components
import { useStore } from '@/lib/store'

function MyComponent() {
  const { batch, updateBatchProgress } = useStore()
  
  useEffect(() => {
    if (batch) {
      updateBatchProgress(50)
    }
  }, [batch])
}
```

### API Client (Axios)

**Location:** `lib/api.ts`

**Setup:**
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## API Integration Guide

### External APIs

#### 1. Cloud Storage (AWS S3 / Cloudinary)

**Purpose:** Store uploaded and processed images

**Setup (S3):**
```typescript
// services/storage/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const key = `uploads/${Date.now()}-${filename}`
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'private'
  }))
  
  // Return public URL or signed URL
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }),
    { expiresIn: 3600 * 24 * 7 } // 7 days
  )
  
  return url
}

export async function deleteImage(key: string): Promise<void> {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  }))
}
```

**Setup (Cloudinary):**
```typescript
// services/storage/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(
  file: Buffer,
  filename: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'i2i-uploads',
        public_id: filename,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(file)
  })
}
```

#### 2. Email Service (SendGrid / AWS SES)

**Setup (SendGrid):**
```typescript
// services/email/sendgrid.ts
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail(params: {
  to: string
  subject?: string
  template?: string
  data?: Record<string, any>
  html?: string
}) {
  const { to, subject, template, data, html } = params
  
  let emailContent = html
  
  if (template) {
    // Load template
    const templateFn = await import(`./templates/${template}`)
    emailContent = templateFn.default(data)
  }
  
  await sgMail.send({
    to,
    from: process.env.FROM_EMAIL!,
    subject: subject || 'i2i Platform Notification',
    html: emailContent
  })
}
```

#### 3. Payment Processing (Stripe)

**Setup:**
```typescript
// services/payment/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Create customer
export async function createCustomer(email: string, name: string) {
  return await stripe.customers.create({ email, name })
}

// Create subscription
export async function createSubscription(
  customerId: string,
  priceId: string
) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  })
}

// Webhook handling
export async function handleWebhook(
  rawBody: string,
  signature: string
) {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
  
  switch (event.type) {
    case 'customer.subscription.created':
      // Handle subscription created
      break
    case 'invoice.payment_succeeded':
      // Handle payment success
      break
    case 'invoice.payment_failed':
      // Handle payment failure
      break
  }
}
```

---

## LLM Integration

### Overview

The platform integrates with multiple LLM providers for:
1. **Image Processing Instructions** - Understanding user prompts
2. **Instruction Chat Assistant** - Helping users refine instructions
3. **Summary Generation** - Creating order summaries
4. **Image Analysis** - Understanding image content

### Supported LLM Providers

#### 1. OpenAI (GPT-4, GPT-4 Vision)

**Setup:**
```typescript
// services/llm/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Text generation
export async function generateText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an AI assistant for an image processing platform. Help users create clear, actionable image processing instructions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
  
  return response.choices[0].message.content || ''
}

// Vision analysis
export async function analyzeImage(
  imageUrl: string,
  instruction: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this image and determine how to apply these instructions: ${instruction}`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: 500
  })
  
  return response.choices[0].message.content || ''
}

// Generate summary
export async function generateOrderSummary(order: {
  imageCount: number
  instructions: string
  processedCount: number
  failedCount: number
}): Promise<string> {
  const prompt = `
    Generate a professional summary for an image processing order:
    - Total Images: ${order.imageCount}
    - Successfully Processed: ${order.processedCount}
    - Failed: ${order.failedCount}
    - Instructions: ${order.instructions}
    
    Provide a concise summary highlighting the results and any notable details.
  `
  
  return await generateText(prompt)
}
```

#### 2. Anthropic (Claude)

**Setup:**
```typescript
// services/llm/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function generateText(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })
  
  return response.content[0].text
}

export async function analyzeImageWithClaude(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  instruction: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: `Analyze this image and provide guidance on: ${instruction}`
          }
        ]
      }
    ]
  })
  
  return response.content[0].text
}
```

#### 3. LLM Factory Pattern

**Unified Interface:**
```typescript
// services/llm/index.ts
export interface LLMProvider {
  generateText(prompt: string): Promise<string>
  analyzeImage(imageUrl: string, instruction: string): Promise<string>
  generateSummary(data: any): Promise<string>
}

export class LLMFactory {
  private static providers: Map<string, LLMProvider> = new Map()
  
  static register(name: string, provider: LLMProvider) {
    this.providers.set(name, provider)
  }
  
  static getProvider(name: string): LLMProvider {
    const provider = this.providers.get(name)
    if (!provider) throw new Error(`Provider ${name} not found`)
    return provider
  }
}

// Register providers
LLMFactory.register('openai', {
  generateText: openaiGenerateText,
  analyzeImage: openaiAnalyzeImage,
  generateSummary: generateOrderSummary
})

LLMFactory.register('anthropic', {
  generateText: anthropicGenerateText,
  analyzeImage: analyzeImageWithClaude,
  generateSummary: anthropicGenerateSummary
})

// Usage
const llm = LLMFactory.getProvider(process.env.LLM_PROVIDER || 'openai')
const response = await llm.generateText('Help me with image processing')
```

### API Endpoints for LLM

**Chat Assistant:**
```typescript
// app/api/llm/chat/route.ts
export async function POST(request: NextRequest) {
  const { message, conversationHistory } = await request.json()
  
  const llm = LLMFactory.getProvider('openai')
  
  const response = await llm.generateText(`
    Conversation History:
    ${conversationHistory.map((m: any) => `${m.role}: ${m.content}`).join('\n')}
    
    User: ${message}
    
    Provide helpful guidance for image processing instructions.
  `)
  
  return NextResponse.json({ response })
}
```

**Process Images:**
```typescript
// app/api/llm/process/route.ts
export async function POST(request: NextRequest) {
  const { imageUrls, instruction } = await request.json()
  
  const llm = LLMFactory.getProvider(process.env.LLM_PROVIDER || 'openai')
  
  // Analyze first image to understand requirements
  const analysis = await llm.analyzeImage(imageUrls[0], instruction)
  
  // Process all images based on analysis
  const results = await Promise.all(
    imageUrls.map(async (url) => {
      // Apply image processing based on LLM guidance
      return await processImageWithGuidance(url, analysis)
    })
  )
  
  return NextResponse.json({ results, analysis })
}
```

**Generate Summary:**
```typescript
// app/api/llm/summarize/route.ts
export async function POST(request: NextRequest) {
  const { orderId } = await request.json()
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { images: true, logs: true }
  })
  
  const llm = LLMFactory.getProvider('openai')
  const summary = await llm.generateSummary({
    imageCount: order.images.length,
    instructions: order.instructions,
    processedCount: order.images.filter(i => i.status === 'COMPLETED').length,
    failedCount: order.images.filter(i => i.status === 'FAILED').length,
    logs: order.logs
  })
  
  // Save summary
  await db.order.update({
    where: { id: orderId },
    data: { summary }
  })
  
  return NextResponse.json({ summary })
}
```

---

## DAM Integration

### Supported DAM Platforms

1. **Creative Force**
2. **Dalim**
3. **Spin Me**
4. **Facebook**
5. **Instagram**
6. **Shopify**
7. **GlobalEdit**
8. **Custom (via API)**

### DAM Connection Architecture

**Storage:** `lib/store.ts` (Zustand)

```typescript
interface DamConnection {
  id: string
  name: string
  provider: string
  apiUrl: string
  workspace: string
  isConnected: boolean
  lastSync?: Date
  config: DamConfig
}

interface DamConfig {
  authType: 'oauth' | 'api-key' | 'basic'
  credentials: any
  targetFolder: string
  createSubfolders: boolean
  subfolderPattern: string
  addMetadata: boolean
  customMetadata: Record<string, string>
  setPermissions: boolean
  visibility: 'private' | 'public' | 'restricted'
  autoTag: boolean
  autoVersion: boolean
  notifyOnComplete: boolean
  webhookUrl?: string
}
```

### DAM Service Implementations

#### 1. Creative Force

```typescript
// services/dam/creative-force.ts
import axios from 'axios'

export class CreativeForceDAM {
  private apiUrl: string
  private apiKey: string
  
  constructor(config: DamConfig) {
    this.apiUrl = config.apiUrl
    this.apiKey = config.credentials.apiKey
  }
  
  async authenticate(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/v1/auth/validate`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      })
      return response.status === 200
    } catch {
      return false
    }
  }
  
  async uploadImage(imageUrl: string, metadata: any): Promise<string> {
    // Download image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(imageResponse.data)
    
    // Upload to Creative Force
    const formData = new FormData()
    formData.append('file', new Blob([imageBuffer]))
    formData.append('metadata', JSON.stringify(metadata))
    
    const response = await axios.post(
      `${this.apiUrl}/api/v1/assets/upload`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    return response.data.assetUrl
  }
  
  async uploadBatch(images: Array<{url: string, metadata: any}>): Promise<any> {
    const results = await Promise.allSettled(
      images.map(img => this.uploadImage(img.url, img.metadata))
    )
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    }
  }
}
```

#### 2. Shopify

```typescript
// services/dam/shopify.ts
export class ShopifyDAM {
  private shopUrl: string
  private accessToken: string
  
  constructor(config: DamConfig) {
    this.shopUrl = config.apiUrl
    this.accessToken = config.credentials.accessToken
  }
  
  async uploadProductImage(
    productId: string,
    imageUrl: string,
    position: number = 1
  ): Promise<any> {
    const response = await axios.post(
      `${this.shopUrl}/admin/api/2024-01/products/${productId}/images.json`,
      {
        image: {
          src: imageUrl,
          position,
          alt: 'Processed by i2i Platform'
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.data.image
  }
  
  async createProduct(data: {
    title: string
    images: string[]
    vendor?: string
    product_type?: string
  }): Promise<any> {
    const response = await axios.post(
      `${this.shopUrl}/admin/api/2024-01/products.json`,
      {
        product: {
          title: data.title,
          vendor: data.vendor,
          product_type: data.product_type,
          images: data.images.map((url, i) => ({
            src: url,
            position: i + 1
          }))
        }
      },
      {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.data.product
  }
}
```

#### 3. Facebook / Instagram

```typescript
// services/dam/facebook.ts
export class FacebookDAM {
  private accessToken: string
  private pageId: string
  
  constructor(config: DamConfig) {
    this.accessToken = config.credentials.accessToken
    this.pageId = config.workspace // Page ID
  }
  
  async uploadPhoto(imageUrl: string, caption?: string): Promise<any> {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${this.pageId}/photos`,
      {
        url: imageUrl,
        caption,
        access_token: this.accessToken
      }
    )
    
    return response.data
  }
  
  async uploadToInstagram(imageUrl: string, caption?: string): Promise<any> {
    const instagramAccountId = await this.getInstagramAccountId()
    
    // Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
      {
        image_url: imageUrl,
        caption,
        access_token: this.accessToken
      }
    )
    
    const creationId = containerResponse.data.id
    
    // Publish media
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
      {
        creation_id: creationId,
        access_token: this.accessToken
      }
    )
    
    return publishResponse.data
  }
  
  private async getInstagramAccountId(): Promise<string> {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${this.pageId}`,
      {
        params: {
          fields: 'instagram_business_account',
          access_token: this.accessToken
        }
      }
    )
    
    return response.data.instagram_business_account.id
  }
}
```

#### 4. Custom DAM (Generic)

```typescript
// services/dam/custom.ts
export class CustomDAM {
  private config: DamConfig
  
  constructor(config: DamConfig) {
    this.config = config
  }
  
  async uploadImage(imageUrl: string, metadata: any): Promise<any> {
    // Download image first
    const imageResponse = await axios.get(imageUrl, { 
      responseType: 'arraybuffer'  
    })
    
    // Prepare upload
    const formData = new FormData()
    formData.append('file', new Blob([imageResponse.data]))
    formData.append('folder', this.config.targetFolder)
    
    if (this.config.addMetadata) {
      formData.append('metadata', JSON.stringify({
        ...this.config.customMetadata,
        ...metadata,
        uploadedFrom: 'i2i Platform',
        uploadDate: new Date().toISOString()
      }))
    }
    
    // Prepare headers based on auth type
    const headers: any = { 'Content-Type': 'multipart/form-data' }
    
    if (this.config.authType === 'api-key') {
      headers['X-API-Key'] = this.config.credentials.apiKey
    } else if (this.config.authType === 'bearer') {
      headers['Authorization'] = `Bearer ${this.config.credentials.token}`
    } else if (this.config.authType === 'basic') {
      const auth = Buffer.from(
        `${this.config.credentials.username}:${this.config.credentials.password}`
      ).toString('base64')
      headers['Authorization'] = `Basic ${auth}`
    }
    
    // Upload
    const response = await axios.post(
      `${this.config.apiUrl}/upload`,
      formData,
      { headers }
    )
    
    // Webhook notification
    if (this.config.notifyOnComplete && this.config.webhookUrl) {
      await this.sendWebhook(response.data)
    }
    
    return response.data
  }
  
  private async sendWebhook(data: any): Promise<void> {
    try {
      await axios.post(this.config.webhookUrl!, {
        event: 'upload_complete',
        timestamp: new Date().toISOString(),
        data
      })
    } catch (error) {
      console.error('Webhook notification failed:', error)
    }
  }
}
```

### DAM Factory

```typescript
// services/dam/index.ts
export class DAMFactory {
  static create(provider: string, config: DamConfig): any {
    switch (provider.toLowerCase()) {
      case 'creative-force':
        return new CreativeForceDAM(config)
      case 'shopify':
        return new ShopifyDAM(config)
      case 'facebook':
      case 'instagram':
        return new FacebookDAM(config)
      case 'custom':
      default:
        return new CustomDAM(config)
    }
  }
}

// Usage
const damClient = DAMFactory.create('shopify', damConfig)
await damClient.uploadImage(imageUrl, metadata)
```

### DAM API Endpoint

```typescript
// app/api/dam/upload/route.ts
import { DAMFactory } from '@/services/dam'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageIds, damConnectionId } = await request.json()

  // Get DAM connection config
  const connection = await db.damConnection.findUnique({
    where: { id: damConnectionId, userId: session.user.id }
  })

  if (!connection) {
    return NextResponse.json({ error: 'DAM connection not found' }, { status: 404 })
  }

  // Get images
  const images = await db.image.findMany({
    where: {
      id: { in: imageIds },
      order: {
        userId: session.user.id
      }
    }
  })

  // Create DAM client
  const damClient = DAMFactory.create(connection.provider, connection.config)

  // Upload images
  const results = []
  for (const image of images) {
    try {
      const result = await damClient.uploadImage(image.processedUrl, {
        originalName: image.originalName,
        orderId: image.orderId,
        processedAt: image.updatedAt
      })
      
      results.push({ imageId: image.id, status: 'success', damUrl: result.url })
      
      // Log action
      await db.actionLog.create({
        data: {
          orderId: image.orderId,
          imageId: image.id,
          type: 'DAM_EXPORT',
          message: `Exported to ${connection.provider}`,
          timestamp: new Date()
        }
      })
    } catch (error: any) {
      results.push({ imageId: image.id, status: 'failed', error: error.message })
    }
  }

  // Update last sync
  await db.damConnection.update({
    where: { id: connection.id },
    data: { lastSync: new Date() }
  })

  return NextResponse.json({
    success: true,
    results,
    successCount: results.filter(r => r.status === 'success').length,
    failedCount: results.filter(r => r.status === 'failed').length
  })
}
```

---

## Authentication & Security

### Authentication Setup (NextAuth.js)

**Installation:**
```bash
npm install next-auth @next-auth/prisma-adapter bcrypt
```

**Configuration:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import MicrosoftProvider from 'next-auth/providers/microsoft'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        if (user.status === 'DELETED') {
          throw new Error('Account has been deleted')
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email first')
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/sign-in',
    signOut: '/',
    error: '/sign-in',
    verifyRequest: '/verify-email'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Protected Routes (Middleware)

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const isAuthPage = request.nextUrl.pathname.startsWith('/sign-in') || 
                     request.nextUrl.pathname.startsWith('/sign-up')

  const isProtectedRoute = [
    '/dashboard',
    '/orders',
    '/account',
    '/billing',
    '/tokens'
  ].some(route => request.nextUrl.pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to sign in
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/account/:path*',
    '/billing/:path*',
    '/tokens/:path*',
    '/sign-in',
    '/sign-up'
  ]
}
```

### Security Best Practices

1. **Input Validation**
```typescript
// lib/validation.ts
import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  companyName: z.string().optional()
})

export const imageUploadSchema = z.object({
  file: z.custom<File>((file) => file instanceof File),
  maxSize: z.number().max(50 * 1024 * 1024) // 50MB
})
```

2. **Rate Limiting**
```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`
  
  const requests = await redis.incr(key)
  
  if (requests === 1) {
    await redis.expire(key, window)
  }
  
  const remaining = Math.max(0, limit - requests)
  
  return {
    success: requests <= limit,
    remaining
  }
}

// Usage in API routes
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success, remaining } = await rateLimit(ip, 10, 60)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() }
      }
    )
  }
  
  // Continue with request
}
```

3. **CORS Configuration**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.ALLOWED_ORIGIN || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' }
        ]
      }
    ]
  }
}
```

---

## Environment Variables

Create `.env.local` file:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/i2i_db

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=openai

# Cloud Storage (S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=i2i-uploads

# Cloud Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (SendGrid)
SENDGRID_API_KEY=SG...
FROM_EMAIL=noreply@i2i-platform.com
SUPPORT_EMAIL=support@i2i-platform.com

# Payment (Stripe)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Captcha
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Sentry (Optional)
SENTRY_DSN=https://...
```

---

## Deployment & Scaling

### Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Configure `vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

3. **Deploy:**
```bash
vercel --prod
```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/i2i
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=i2i
      - POSTGRES_PASSWORD=postgres

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Database Schema (Prisma)

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?
  avatar        String?
  companyName   String?
  role          Role      @default(USER)
  status        Status    @default(ACTIVE)
  
  emailNotifications Boolean @default(true)
  
  orders        Order[]
  damConnections DamConnection[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  
  @@index([email])
}

enum Role {
  USER
  ADMIN
}

enum Status {
  ACTIVE
  SUSPENDED
  DELETED
}

model Order {
  id           String   @id @default(cuid())
  name         String
  instructions String
  summary      String?
  status       OrderStatus
  
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  
  images       Image[]
  logs         ActionLog[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([userId, status])
}

enum OrderStatus {
  UPLOADING
  PROCESSING
  COMPLETED
  FAILED
  DELETED
}

model Image {
  id           String      @id @default(cuid())
  originalName String
  originalUrl  String
  processedUrl String?
  status       ImageStatus
  instruction  String?
  size         Int
  
  orderId      String
  order        Order       @relation(fields: [orderId], references: [id])
  
  logs         ActionLog[]
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  @@index([orderId, status])
}

enum ImageStatus {
  UPLOADING
  PROCESSING
  COMPLETED
  NEEDS_RETOUCH
  APPROVED
  FAILED
}

model ActionLog {
  id        String   @id @default(cuid())
  type      LogType
  message   String
  prompt    String?
  llmModel  String?
  processingTime Int?
  
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  
  imageId   String?
  image     Image?   @relation(fields: [imageId], references: [id])
  
  timestamp DateTime @default(now())
  
  @@index([orderId])
}

enum LogType {
  UPLOAD
  PROCESS
  REPROCESS
  DOWNLOAD
  DAM_EXPORT
  DELETE
}

model DamConnection {
  id         String   @id @default(cuid())
  name       String
  provider   String
  apiUrl     String
  workspace  String
  isConnected Boolean @default(true)
  config     Json
  
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  
  lastSync   DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([userId])
}
```

---

## Summary

This comprehensive documentation covers:

✅ **Complete Sitemap** - All pages and navigation flow  
✅ **Folder Structure** - Every file mapped to features  
✅ **Feature Specifications** - Detailed implementation for each feature  
✅ **API Architecture** - All endpoints with examples  
✅ **LLM Integration** - OpenAI, Anthropic, and multi-provider setup  
✅ **DAM Integration** - 8+ platforms with code examples  
✅ **Authentication** - NextAuth.js with OAuth providers  
✅ **Security** - Best practices, rate limiting, validation  
✅ **State Management** - Zustand setup and patterns  
✅ **Deployment** - Vercel and Docker configurations  
✅ **Database Schema** - Complete Prisma schema  

### Next Steps for Implementation:

1. **Setup Database** - Initialize PostgreSQL and run Prisma migrations
2. **Configure Environment** - Add all required API keys
3. **Implement Authentication** - Complete NextAuth.js setup
4. **Build Core Features** - Start with IPW (upload → process → results)
5. **Integrate LLM** - Connect OpenAI or Claude
6. **Add DAM Support** - Implement priority DAM platforms
7. **Testing** - Unit, integration, and E2E tests
8. **Deploy** - Push to Vercel or Docker

---

**Document Version:** 1.0  
**Platform:** Next.js 14, TypeScript, React 18  
**State Management:** Zustand  
**UI Framework:** ShadCN/UI + Tailwind CSS  
**Authentication:** NextAuth.js  

For questions or updates, contact: support@i2i-platform.com
