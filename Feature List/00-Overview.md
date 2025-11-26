# i2i Platform - Overview & Sitemap

**Version:** 1.0  
**Last Updated:** November 26, 2025  
**Platform:** Next.js 14 (App Router) with TypeScript

---

## Table of Contents

The complete documentation is divided into the following sections:

1. **00-Overview.md** (this file) - Application sitemap and overview
2. **01-Folder-Structure.md** - Complete directory mapping
3. **02-Authentication.md** - Sign up, sign in, password reset
4. **03-User-Management.md** - Profile, password management, account deletion
5. **04-Billing.md** - Billing & subscription features
6. **05-Image-Processing-Workflow.md** - Upload, process, results
7. **06-Orders-Management.md** - Orders list, single order features
8. **07-Portfolio-Contact-FAQ.md** - Portfolio, contact, FAQ
9. **08-Notifications.md** - Email and in-app notifications
10. **09-Technical-Architecture.md** - State management, API client
11. **10-API-Integration.md** - External APIs (storage, email, payment)
12. **11-LLM-Integration.md** - LLM providers (OpenAI, Claude)
13. **12-DAM-Integration.md** - DAM platforms integration
14. **13-Security.md** - Authentication setup & security
15. **14-Deployment.md** - Deployment guides & database schema
16. **15-Environment-Variables.md** - Environment configuration

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

## Feature Categories

### Functional Features (F)
- Authentication (Sign Up, Sign In)
- User Profile Management
- Account Deletion
- Image Processing Workflow (Upload, Process, Results)
- Orders Management
- Reprocessing
- Download & Export
- Contact Us
- FAQ
- Notifications

### Non-Functional Features (NF)
- Orders Statistics
- Portfolio Gallery
- Billing & Subscription (UI ready, payment integration needed)
- How It Works
- API Documentation
- Legal Pages

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Component Library**: ShadCN/UI (Radix UI primitives)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **API Routes**: Next.js API Routes
- **Runtime**: Node.js 18+
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3 / Cloudinary
- **Email**: SendGrid / AWS SES
- **Payment**: Stripe

### External Services
- **LLM Providers**: OpenAI (GPT-4, GPT-4 Vision), Anthropic (Claude)
- **DAM Platforms**: Creative Force, Dalim, Shopify, Facebook, Instagram, GlobalEdit, Custom
- **Cloud Storage**: AWS S3, Cloudinary
- **Rate Limiting**: Upstash Redis

---

## Platform Goals

1. **AI-Powered Image Processing**: Leverage LLM capabilities to understand and execute complex image processing instructions
2. **Seamless DAM Integration**: Connect with major DAM platforms for streamlined asset management
3. **User-Friendly Interface**: Intuitive UI/UX with drag-and-drop, real-time progress, and smart defaults
4. **Scalable Architecture**: Built to handle enterprise-level workloads
5. **Security First**: NextAuth.js authentication, rate limiting, input validation
6. **Multi-Model Support**: Flexible LLM provider integration (OpenAI, Claude, and more)

---

## Quick Navigation

### For Developers
- [Folder Structure](./01-Folder-Structure.md) - Understand the codebase organization
- [Technical Architecture](./09-Technical-Architecture.md) - State management and API patterns
- [Security](./13-Security.md) - Authentication and security best practices
- [Deployment](./14-Deployment.md) - Deploy to Vercel or Docker

### For Product Managers
- [Image Processing Workflow](./05-Image-Processing-Workflow.md) - Core feature specifications
- [Orders Management](./06-Orders-Management.md) - Order handling and reprocessing
- [User Management](./03-User-Management.md) - Account features

### For Integration Teams
- [LLM Integration](./11-LLM-Integration.md) - AI model setup
- [DAM Integration](./12-DAM-Integration.md) - Connect to DAM platforms
- [API Integration](./10-API-Integration.md) - External services setup

---

## Project Status

### ✅ Completed
- Core UI components (ShadCN/UI)
- State management (Zustand)
- Basic authentication flow
- Image upload interface
- Processing panel
- Gallery views

### 🚧 In Progress
- LLM integration
- DAM connections
- Order management
- Reprocessing workflow

### 📋 Planned
- Payment integration (Stripe)
- Email notifications (SendGrid)
- Advanced analytics
- Mobile responsive improvements
- Multi-language support

---

## Getting Started

1. **Setup**: Follow [Environment Variables](./15-Environment-Variables.md) to configure your `.env.local`
2. **Architecture**: Review [Technical Architecture](./09-Technical-Architecture.md) to understand the system
3. **Development**: Check [Folder Structure](./01-Folder-Structure.md) to navigate the codebase
4. **Deploy**: Use [Deployment Guide](./14-Deployment.md) for production setup

---

**Next:** [Folder Structure →](./01-Folder-Structure.md)

