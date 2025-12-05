# Folder & File Structure

**Complete Directory Mapping for i2i Platform**

This document provides a comprehensive overview of the project's folder structure, with each file mapped to its corresponding feature.

---

## Directory Tree

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

## File Organization Principles

### 1. **Route-Based Organization** (`app/` directory)
- Pages are organized by routes using Next.js 14 App Router
- Route groups `(public)` and `(authenticated)` separate unauthenticated and authenticated pages
- Each route has its own `page.tsx` file

### 2. **Component Organization** (`components/` directory)
- **Feature-based folders**: Components grouped by feature (auth, dashboard, orders, etc.)
- **UI primitives**: Reusable ShadCN/UI components in `ui/` folder
- **Layout components**: Shared layout components in `layout/` folder

### 3. **API Organization** (`app/api/` directory)
- RESTful structure with resource-based folders
- Each endpoint has a `route.ts` file
- Dynamic routes use bracket notation `[param]`

### 4. **Service Layer** (`services/` directory)
- External service integrations separated by service type
- Each service has its own folder with multiple provider implementations
- Factory pattern for multi-provider support

### 5. **Shared Utilities** (`lib/`, `hooks/`, `types/`)
- **lib/**: Utility functions, API client, state management
- **hooks/**: Custom React hooks for reusable logic
- **types/**: TypeScript definitions for type safety

---

## Key Files and Their Purpose

### Core Application Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers (Theme, Auth, Toast) |
| `app/page.tsx` | Root page (redirects based on auth status) |
| `app/globals.css` | Global styles and Tailwind directives |
| `middleware.ts` | Route protection and authentication checks |

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration (images, redirects, headers) |
| `tailwind.config.ts` | Tailwind CSS customization (colors, animations) |
| `tsconfig.json` | TypeScript compiler options |
| `components.json` | ShadCN/UI component configuration |
| `.env.local` | Environment variables (not in repo) |

### State Management

| File | Purpose |
|------|---------|
| `lib/store.ts` | Zustand global state store |
| `lib/api.ts` | Axios API client with interceptors |
| `lib/utils.ts` | Helper functions (cn, formatters) |
| `lib/validation.ts` | Zod schemas for form validation |

---

## Component Dependencies

### Upload Flow
```
UploadSection.tsx
├── InstructionChat.tsx (AI assistance)
├── ProcessingPanel.tsx (status display)
└── ImageGallery.tsx (results)
    ├── RetouchDrawer.tsx (reprocess)
    └── SummaryDrawer.tsx (export)
```

### Orders Flow
```
OrdersList.tsx (list view)
└── OrderCard.tsx
    └── Single Order Page
        ├── ImageGallery.tsx
        ├── ActionLog.tsx
        └── DamExportDialog.tsx
```

### Account Flow
```
Account Page
├── ProfileForm.tsx
├── NotificationSettings.tsx
└── Security Page
    ├── PasswordForm.tsx
    └── DeleteAccountDialog.tsx
```

---

## API Routes Mapping

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Image Processing
- `POST /api/upload` - Upload images
- `GET /api/status/[batchId]` - Get processing status
- `POST /api/retouch/[imageId]` - Reprocess image
- `GET /api/results/[batchId]` - Get results
- `POST /api/export` - Export/download

### Orders
- `GET /api/orders` - List user orders
- `GET /api/orders/[orderId]` - Get single order
- `DELETE /api/orders/[orderId]` - Delete order

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password
- `DELETE /api/user/delete` - Delete account

### DAM
- `POST /api/dam/connect` - Connect DAM
- `POST /api/dam/upload` - Upload to DAM
- `DELETE /api/dam/disconnect` - Disconnect DAM

### LLM
- `POST /api/llm/chat` - Chat with AI assistant
- `POST /api/llm/process` - Process with LLM
- `POST /api/llm/summarize` - Generate summary

---

## Service Integrations

### LLM Services (`services/llm/`)
- `openai.ts` - OpenAI GPT-4 and GPT-4 Vision
- `anthropic.ts` - Anthropic Claude
- `index.ts` - LLM Factory pattern for multi-provider support

### DAM Services (`services/dam/`)
- `creative-force.ts` - Creative Force integration
- `shopify.ts` - Shopify integration
- `facebook.ts` - Facebook/Instagram integration
- `custom.ts` - Generic DAM integration
- `index.ts` - DAM Factory pattern

### Storage Services (`services/storage/`)
- `s3.ts` - AWS S3 integration
- `cloudinary.ts` - Cloudinary integration
- `index.ts` - Storage abstraction layer

### Email Services (`services/email/`)
- `sendgrid.ts` - SendGrid email service
- `templates/` - Email templates (HTML)

### Payment Services (`services/payment/`)
- `stripe.ts` - Stripe payment integration
- `webhooks.ts` - Stripe webhook handlers

---

**Previous:** [← Overview](./00-Overview.md) | **Next:** [Authentication →](./02-Authentication.md)

