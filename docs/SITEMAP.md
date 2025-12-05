# i2i Platform - Site Map & Project Structure

> **Last Updated**: 2024  
> **Framework**: Next.js 14 (App Router)  
> **Language**: TypeScript

This document provides a comprehensive overview of the project structure, routes, components, and their relationships.

---

## 📁 Project Structure

```
i2i/
├── app/                          # Next.js App Router (all routes)
│   ├── layout.tsx                # Root layout (ThemeProvider, TooltipProvider)
│   ├── page.tsx                  # Homepage router (switches between PageChat/PageDefault/PageEnterprise)
│   ├── globals.css               # Global styles
│   │
│   ├── PageChat.tsx              # Chat-style homepage (currently active)
│   ├── PageDefault.tsx           # Default upload-based homepage
│   ├── PageEnterprise.tsx        # Enterprise dashboard homepage
│   │
│   ├── api/                      # API Routes (Backend)
│   │   ├── upload/route.ts       # POST /api/upload - Upload images & instructions
│   │   ├── status/[batchId]/route.ts  # GET /api/status/:batchId - Get processing status
│   │   ├── retouch/[imageId]/route.ts # POST /api/retouch/:imageId - Retouch image
│   │   ├── results/[batchId]/route.ts # GET /api/results/:batchId - Get batch results
│   │   ├── export/route.ts       # POST /api/export - Export batch
│   │   └── dam/upload/route.ts   # POST /api/dam/upload - Send to DAM
│   │
│   ├── processing/               # Processing pages
│   │   ├── page.tsx              # /processing - Redirects to batch or home
│   │   └── [batchId]/page.tsx    # /processing/:batchId - Batch processing view
│   │
│   ├── portfolio/                # Portfolio
│   │   └── page.tsx              # /portfolio - Portfolio gallery
│   │
│   ├── orders/                   # Orders
│   │   ├── page.tsx              # /orders - Orders list
│   │   └── [orderId]/page.tsx    # /orders/:orderId - Order details
│   │
│   ├── account/                  # User account
│   │   ├── page.tsx              # /account - Account dashboard
│   │   ├── security/page.tsx     # /account/security - Security settings
│   │   └── notifications/page.tsx # /account/notifications - Notification settings
│   │
│   ├── billing/page.tsx          # /billing - Billing & subscription
│   ├── pricing/page.tsx          # /pricing - Pricing plans
│   ├── how-i2i-works/page.tsx   # /how-i2i-works - How it works page
│   ├── integrations/page.tsx    # /integrations - DAM integrations
│   ├── support/page.tsx          # /support - Support page
│   ├── faq/page.tsx             # /faq - FAQ page
│   ├── api-docs/page.tsx        # /api-docs - API documentation
│   ├── legal/page.tsx           # /legal - Legal information
│   ├── terms/page.tsx            # /terms - Terms of service
│   │
│   └── auth/                     # Authentication pages
│       ├── sign-in/page.tsx      # /sign-in - Sign in
│       ├── sign-up/page.tsx      # /sign-up - Sign up
│       ├── forgot-password/page.tsx  # /forgot-password - Password reset request
│       ├── reset-password/page.tsx    # /reset-password - Reset password
│       ├── verify-email/page.tsx       # /verify-email - Email verification
│       └── resend-verification/page.tsx # /resend-verification - Resend verification
│
├── components/                   # React Components
│   ├── ui/                       # ShadCN UI Components (reusable primitives)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── slider.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── tooltip.tsx
│   │   └── ... (other UI primitives)
│   │
│   ├── Header.tsx                # Public header (used on homepage)
│   ├── AuthenticatedNav.tsx      # Authenticated user navigation
│   │
│   ├── UploadSection.tsx         # Image & instruction upload component
│   ├── ProcessingPanel.tsx       # Processing status display
│   ├── ImageGallery.tsx          # Processed images grid
│   ├── RetouchDrawer.tsx         # Image retouch drawer
│   ├── SummaryDrawer.tsx         # Batch summary & export drawer
│   ├── InstructionChat.tsx       # Instruction chat component
│   │
│   ├── DamConnectDialog.tsx      # DAM connection dialog
│   ├── IntegrationConnectDialog.tsx # Integration connection dialog
│   │
│   ├── portfolio/                # Portfolio components
│   │   ├── BeforeAfterSlider.tsx
│   │   ├── PortfolioModal.tsx
│   │   └── PlaceholderImage.tsx
│   │
│   ├── aceternity/                # Aceternity UI components
│   │   ├── animated-beam.tsx
│   │   ├── grid-background.tsx
│   │   └── spotlight.tsx
│   │
│   └── ThemeProvider.tsx         # Theme context provider
│
├── lib/                          # Utilities & Core Logic
│   ├── store.ts                  # Zustand global state management
│   ├── api.ts                    # API client functions
│   └── utils.ts                  # Helper utilities (formatFileSize, etc.)
│
└── public/                       # Static Assets
    ├── favicon.ico
    └── logos/                    # Brand logos & integration icons
```

---

## 🗺️ Route Mapping

### Public Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` → `PageChat.tsx` | Homepage (chat interface) |
| `/pricing` | `app/pricing/page.tsx` | Pricing plans |
| `/portfolio` | `app/portfolio/page.tsx` | Portfolio gallery |
| `/how-i2i-works` | `app/how-i2i-works/page.tsx` | How i2i works (6-step process) |
| `/faq` | `app/faq/page.tsx` | FAQ page |
| `/support` | `app/support/page.tsx` | Support page |
| `/api-docs` | `app/api-docs/page.tsx` | API documentation |
| `/legal` | `app/legal/page.tsx` | Legal information |
| `/terms` | `app/terms/page.tsx` | Terms of service |

### Authentication Routes

| Route | File | Description |
|-------|------|-------------|
| `/sign-in` | `app/sign-in/page.tsx` | Sign in page |
| `/sign-up` | `app/sign-up/page.tsx` | Sign up page |
| `/forgot-password` | `app/forgot-password/page.tsx` | Password reset request |
| `/reset-password` | `app/reset-password/page.tsx` | Reset password form |
| `/verify-email` | `app/verify-email/page.tsx` | Email verification |
| `/resend-verification` | `app/resend-verification/page.tsx` | Resend verification email |

### Authenticated Routes

| Route | File | Description |
|-------|------|-------------|
| `/processing` | `app/processing/page.tsx` | Redirects to batch or home |
| `/processing/:batchId` | `app/processing/[batchId]/page.tsx` | Batch processing view |
| `/orders` | `app/orders/page.tsx` | Orders list |
| `/orders/:orderId` | `app/orders/[orderId]/page.tsx` | Order details |
| `/account` | `app/account/page.tsx` | Account dashboard |
| `/account/security` | `app/account/security/page.tsx` | Security settings |
| `/account/notifications` | `app/account/notifications/page.tsx` | Notification settings |
| `/billing` | `app/billing/page.tsx` | Billing & subscription |
| `/integrations` | `app/integrations/page.tsx` | DAM integrations |

### API Routes

| Route | Method | File | Description |
|-------|--------|------|-------------|
| `/api/upload` | POST | `app/api/upload/route.ts` | Upload images & instructions |
| `/api/status/:batchId` | GET | `app/api/status/[batchId]/route.ts` | Get processing status |
| `/api/retouch/:imageId` | POST | `app/api/retouch/[imageId]/route.ts` | Retouch image |
| `/api/results/:batchId` | GET | `app/api/results/[batchId]/route.ts` | Get batch results |
| `/api/export` | POST | `app/api/export/route.ts` | Export batch |
| `/api/dam/upload` | POST | `app/api/dam/upload/route.ts` | Send to DAM |

---

## 🔗 Component Relationships

### Homepage Flow

```
app/page.tsx (Router)
    ├── PageChat.tsx (Current)
    │   ├── Header.tsx
    │   ├── UploadSection.tsx → router.push('/processing/:batchId')
    │   └── InstructionChat.tsx
    │
    ├── PageDefault.tsx
    │   ├── Header.tsx
    │   ├── UploadSection.tsx → router.push('/processing/:batchId')
    │   ├── ProcessingPanel.tsx
    │   └── ImageGallery.tsx
    │
    └── PageEnterprise.tsx
        └── (Enterprise dashboard)
```

### Processing Flow

```
/processing/:batchId
    └── app/processing/[batchId]/page.tsx
        ├── Uses: useStore() from lib/store.ts
        ├── Displays: ProcessingPanel.tsx (if processing)
        ├── Displays: ImageGallery.tsx (if completed)
        ├── Opens: RetouchDrawer.tsx (on retouch)
        └── Opens: SummaryDrawer.tsx (on completion)
```

### Navigation Components

**Header.tsx** (Public)
- Links to: `/`, `/pricing`, `/portfolio`
- Dropdown: `/how-i2i-works`, `/api-docs`, `/faq`, `/support`
- Actions: `/sign-in`, `/sign-up`

**AuthenticatedNav.tsx** (Authenticated)
- Links to: `/`, `/orders`, `/portfolio`, `/support`
- Dropdown: `/account`, `/account/security`, `/account/notifications`, `/billing`, `/integrations`

### State Management Flow

```
lib/store.ts (Zustand)
    ├── batch: BatchData | null
    ├── summaryDrawerOpen: boolean
    ├── retouchDrawerOpen: boolean
    ├── selectedImageForRetouch: ProcessedImage | null
    └── darkMode: boolean

Used by:
    ├── PageChat.tsx
    ├── PageDefault.tsx
    ├── ProcessingPanel.tsx
    ├── ImageGallery.tsx
    ├── RetouchDrawer.tsx
    └── SummaryDrawer.tsx
```

---

## 🔄 Navigation Flow

### User Journey

1. **Landing** → `/` (PageChat)
   - User sees chat interface
   - Can upload images via drag & drop
   - Can add instructions via chat

2. **Upload** → `UploadSection.tsx` or `PageChat.tsx`
   - Images uploaded via `/api/upload`
   - Batch created in store
   - Redirects to `/processing/:batchId`

3. **Processing** → `/processing/:batchId`
   - Shows `ProcessingPanel.tsx` with progress
   - Displays real-time logs
   - Updates via `/api/status/:batchId`

4. **Results** → `/processing/:batchId` (completed)
   - Shows `ImageGallery.tsx` with processed images
   - Can open `RetouchDrawer.tsx` for edits
   - Can open `SummaryDrawer.tsx` for export

5. **Export** → `SummaryDrawer.tsx`
   - Download via `/api/export`
   - Send to DAM via `/api/dam/upload`

### Authentication Flow

```
/sign-in → / (after login)
/sign-up → /verify-email → / (after verification)
/forgot-password → /reset-password → /sign-in
```

---

## 📦 Key Dependencies

### Core Libraries
- **Next.js 14** - Framework (App Router)
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Framer Motion** - Animations

### UI Libraries
- **ShadCN/UI** - Component primitives
- **Lucide React** - Icons
- **React Icons** - Additional icons
- **Sonner** - Toast notifications
- **React Dropzone** - File uploads

---

## 🎯 Key Files to Know

### Entry Points
- `app/layout.tsx` - Root layout, wraps all pages
- `app/page.tsx` - Homepage router (switches between page styles)

### Core Components
- `components/Header.tsx` - Public navigation
- `components/AuthenticatedNav.tsx` - Authenticated navigation
- `components/UploadSection.tsx` - File upload interface
- `components/ProcessingPanel.tsx` - Processing status
- `components/ImageGallery.tsx` - Image grid display

### State & API
- `lib/store.ts` - Global state (Zustand)
- `lib/api.ts` - API client functions
- `lib/utils.ts` - Utility functions

### Styling
- `app/globals.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration
- `components/ThemeProvider.tsx` - Theme management

---

## 🔌 API Integration Points

### Upload Flow
```
UploadSection.tsx
    → lib/api.ts (upload function)
    → POST /api/upload
    → Creates batch in store
    → Redirects to /processing/:batchId
```

### Processing Flow
```
ProcessingPanel.tsx
    → lib/api.ts (getStatus function)
    → GET /api/status/:batchId
    → Updates store with progress
    → Displays logs & progress
```

### Retouch Flow
```
RetouchDrawer.tsx
    → lib/api.ts (retouch function)
    → POST /api/retouch/:imageId
    → Updates image in store
    → Refreshes gallery
```

### Export Flow
```
SummaryDrawer.tsx
    → lib/api.ts (export function)
    → POST /api/export
    → Downloads ZIP or sends to DAM
```

---

## 📝 Notes for Developers

1. **Homepage Switching**: Change `PAGE_STYLE` in `app/page.tsx` to switch between chat/default/enterprise views

2. **State Management**: All global state is in `lib/store.ts` using Zustand. Access via `useStore()` hook

3. **API Routes**: All API routes are in `app/api/` and follow Next.js 14 App Router conventions

4. **Components**: Reusable UI components are in `components/ui/` (ShadCN). Feature components are in `components/`

5. **Routing**: Next.js 14 App Router uses file-based routing. Folders in `app/` become routes

6. **Authentication**: Currently uses mock authentication. Replace with real auth provider as needed

7. **Styling**: Uses Tailwind CSS with custom theme. Dark mode supported via `ThemeProvider`

---

## 🚀 Quick Reference

**Start Development**: `npm run dev`  
**Build**: `npm run build`  
**Main Entry**: `app/page.tsx`  
**State**: `lib/store.ts`  
**API Client**: `lib/api.ts`  
**Styles**: `app/globals.css` + `tailwind.config.ts`

---

*For detailed implementation guides, see: `ARCHITECTURE.md`, `SETUP.md`, `QUICKSTART.md`*

