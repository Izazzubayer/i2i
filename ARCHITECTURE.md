# i2i Platform Architecture

## System Overview

The i2i platform is a modern, single-page web application built with Next.js 14 (App Router) that provides enterprise-grade AI image processing capabilities.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Component Library**: ShadCN/UI (Radix UI primitives)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form (can be added)
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **API Routes**: Next.js API Routes
- **Runtime**: Node.js 18+
- **File Processing**: Built-in FormData handling
- **AI Integration**: Ready for external AI services

## Architecture Patterns

### 1. Single-Page Application (SPA)
- All functionality on one page
- Modal/drawer-based workflows
- Minimal navigation, maximum efficiency

### 2. State Management (Zustand)
```
Global State
├── Batch Data (current processing batch)
├── UI State (drawers open/closed)
├── Theme State (dark mode)
└── Processing State (logs, progress)
```

### 3. Component Hierarchy
```
App Layout
└── ThemeProvider
    └── TooltipProvider
        ├── Header (fixed)
        ├── Main Content (scrollable)
        │   ├── UploadSection
        │   ├── ProcessingPanel (conditional)
        │   └── ImageGallery (conditional)
        ├── RetouchDrawer (modal)
        └── SummaryDrawer (modal)
```

## Data Flow

### Upload Flow
```
User Action → UploadSection
    ↓
FormData → API Route (/api/upload)
    ↓
Batch Created → Store Update
    ↓
ProcessingPanel Rendered
    ↓
Simulated AI Processing (useEffect)
    ↓
Images Updated → Gallery Rendered
```

### Retouch Flow
```
Gallery → Edit Button Click
    ↓
openRetouchDrawer(image)
    ↓
RetouchDrawer Opens
    ↓
User Enters Instructions → Submit
    ↓
API Call (/api/retouch/:id)
    ↓
Image Updated → Gallery Refreshes
```

### Export Flow
```
Processing Complete → Auto-open SummaryDrawer
    ↓
User Reviews Stats & Summary
    ↓
Export Action (Download or DAM)
    ↓
ZIP Created (jszip) or DAM Upload
    ↓
Success Notification
```

## State Schema

```typescript
interface BatchData {
  id: string                    // Unique batch identifier
  totalImages: number           // Total uploaded
  processedCount: number        // Successfully processed
  approvedCount: number         // User approved
  retouchCount: number          // Marked for retouch
  failedCount: number           // Failed processing
  images: ProcessedImage[]      // Array of images
  logs: LogEntry[]              // Processing logs
  instructions: string          // User instructions
  summary: string               // AI-generated summary
  status: BatchStatus           // Current status
  progress: number              // 0-100 percentage
}

interface ProcessedImage {
  id: string
  originalName: string
  originalUrl: string
  processedUrl: string
  status: ImageStatus
  instruction?: string
  timestamp: Date
}

interface LogEntry {
  id: string
  message: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning'
}
```

## API Architecture

### RESTful Endpoints

```
POST   /api/upload               Upload batch
GET    /api/status/:batchId      Get processing status
POST   /api/retouch/:imageId     Retouch single image
GET    /api/results/:batchId     Get batch results
POST   /api/export               Export batch
```

### Request/Response Flow

**Upload Request**:
```typescript
FormData {
  images: File[]
  instructions: string | File
}
```

**Upload Response**:
```typescript
{
  batchId: string
  message: string
  imageCount: number
}
```

## Component Architecture

### Atomic Design Principles

**Atoms** (components/ui/)
- Button, Input, Card, Badge, etc.
- Reusable, stateless primitives
- ShadCN/UI components

**Molecules** (composed primitives)
- Form groups, stat cards
- Contained within feature components

**Organisms** (components/)
- Header, UploadSection, ProcessingPanel
- ImageGallery, RetouchDrawer, SummaryDrawer
- Complete, functional sections

**Pages** (app/)
- Main page composition
- Layout structure

### Component Props Pattern

```typescript
// Each major component follows this pattern
interface ComponentProps {
  // Explicit props (if needed)
}

export default function Component() {
  // Zustand store access
  const { state, actions } = useStore()
  
  // Local state (UI only)
  const [localState, setLocalState] = useState()
  
  // Effects for side effects
  useEffect(() => {
    // subscriptions, timers, etc.
  }, [deps])
  
  // Event handlers
  const handleAction = () => {}
  
  // Render
  return (...)
}
```

## Performance Optimizations

### 1. Code Splitting
- Automatic with Next.js
- Dynamic imports for heavy components

### 2. Image Optimization
- Next.js Image component
- Lazy loading
- Responsive sizes

### 3. State Updates
- Zustand uses React's useState under the hood
- Selective re-renders via selectors
- Immutable updates

### 4. Animation Performance
- Framer Motion optimized for GPU
- Transform and opacity animations
- Will-change hints

## Security Considerations

### Current (Development)
- Client-side file validation
- Type checking
- CORS enabled for development

### Production Requirements
- File type validation on server
- File size limits enforced
- Virus scanning for uploads
- Authentication & authorization
- Rate limiting
- Input sanitization
- HTTPS only
- CSP headers

## Scalability Considerations

### Horizontal Scaling
- Stateless API routes
- External state storage (Redis)
- Queue-based processing

### Vertical Scaling
- Worker threads for processing
- Batch job queues
- CDN for assets

### Database (Future)
```sql
CREATE TABLE batches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status VARCHAR(20),
  created_at TIMESTAMP,
  ...
);

CREATE TABLE images (
  id UUID PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  original_url TEXT,
  processed_url TEXT,
  status VARCHAR(20),
  ...
);
```

## Error Handling

### Client-Side
```typescript
try {
  await apiCall()
  toast.success('Success!')
} catch (error) {
  console.error(error)
  toast.error('Failed. Please try again.')
  addLog(error.message, 'error')
}
```

### Server-Side
```typescript
export async function POST(request: NextRequest) {
  try {
    // processing
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    )
  }
}
```

## Testing Strategy

### Unit Tests
- Components with React Testing Library
- Utility functions with Jest
- Store actions and state

### Integration Tests
- API routes with Supertest
- Component interactions
- User flows (Cypress/Playwright)

### E2E Tests
- Complete workflows
- Cross-browser testing
- Mobile responsiveness

## Monitoring & Observability

### Logging
```typescript
// Structured logging
logger.info('Batch created', {
  batchId,
  imageCount,
  userId,
  timestamp,
})
```

### Metrics
- Upload success rate
- Processing time per image
- API response times
- Error rates

### Alerts
- Failed processing > threshold
- API errors > threshold
- Storage capacity warnings

## Deployment Architecture

### Vercel (Recommended)
```
User → Vercel Edge Network
       ↓
    Next.js App (Serverless)
       ↓
    ├── Static Assets (CDN)
    ├── API Routes (Lambdas)
    └── External Services
        ├── AI Processing API
        ├── Cloud Storage (S3)
        └── Database (Postgres)
```

### Docker
```
nginx (reverse proxy)
    ↓
Next.js Container
    ↓
    ├── Redis (sessions)
    ├── PostgreSQL (data)
    └── S3 (storage)
```

## Future Enhancements

### Phase 2
- [ ] User authentication (NextAuth.js)
- [ ] Real-time WebSocket updates
- [ ] Batch history and search
- [ ] Advanced image editor
- [ ] Collaborative features

### Phase 3
- [ ] Multi-user teams
- [ ] Role-based access control
- [ ] Usage analytics dashboard
- [ ] API for external integrations
- [ ] Mobile apps (React Native)

### Phase 4
- [ ] AI model customization
- [ ] Batch scheduling
- [ ] Webhook notifications
- [ ] Advanced reporting
- [ ] White-label solution

## Development Workflow

### Local Development
```bash
git checkout -b feature/new-feature
npm run dev
# Make changes, test
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create PR
```

### Code Review
- TypeScript type safety
- ESLint checks
- Component structure
- Performance implications
- Security considerations

### Deployment
```
PR Merged → Main
    ↓
CI/CD Pipeline
    ↓
    ├── Run Tests
    ├── Build Check
    ├── Deploy Staging
    ↓
Manual Approval
    ↓
Deploy Production
```

## Documentation Standards

### Code Comments
```typescript
/**
 * Uploads images and instructions to start batch processing
 * @param images - Array of image files
 * @param instructions - Text or file with processing instructions
 * @returns Promise with batch ID and metadata
 */
export async function uploadBatch(
  images: File[],
  instructions: string | File
): Promise<UploadResponse>
```

### Component Documentation
```typescript
/**
 * ProcessingPanel Component
 * 
 * Displays real-time processing status, logs, and statistics
 * for the current batch. Auto-scrolls logs and shows progress.
 * 
 * Features:
 * - Real-time progress bar
 * - Live processing logs
 * - Batch statistics
 * - AI-generated summary (on completion)
 * 
 * @example
 * <ProcessingPanel />
 */
```

## Contributing Guidelines

1. Follow existing code structure
2. Maintain TypeScript types
3. Use Tailwind for styling
4. Write meaningful commit messages
5. Update documentation
6. Add tests for new features

---

This architecture document should evolve with the platform. Update it when making significant changes.

