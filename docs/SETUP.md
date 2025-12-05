# Quick Setup Guide for i2i Platform

## Prerequisites

- Node.js 18+ and npm installed
- Basic knowledge of React and TypeScript

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- ShadCN/UI components
- Zustand (state management)
- Framer Motion (animations)
- And more...

### 2. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure Explained

```
i2i/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API routes
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── ui/               # Reusable UI primitives
│   ├── Header.tsx        # Top navigation
│   ├── UploadSection.tsx # File upload UI
│   ├── ProcessingPanel.tsx # Status display
│   ├── ImageGallery.tsx  # Image grid
│   ├── RetouchDrawer.tsx # Edit drawer
│   └── SummaryDrawer.tsx # Export drawer
│
├── lib/                   # Utilities
│   ├── store.ts          # Global state (Zustand)
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
│
└── public/               # Static files
```

## Key Features & How They Work

### 1. Upload System
- **Component**: `UploadSection.tsx`
- **State**: Managed by Zustand store
- **API**: `/api/upload` - Handles file uploads
- Drag & drop powered by `react-dropzone`

### 2. Processing Pipeline
- **Component**: `ProcessingPanel.tsx`
- **Flow**: Upload → Process → Display results
- Simulates AI processing with mock delays
- Real-time progress updates

### 3. Image Gallery
- **Component**: `ImageGallery.tsx`
- Responsive 3-column grid
- Hover effects with Framer Motion
- Status badges for each image

### 4. Retouch System
- **Component**: `RetouchDrawer.tsx`
- Opens from gallery on "Edit" click
- Sends instructions to `/api/retouch/:imageId`
- Updates image in-place

### 5. Export Options
- **Component**: `SummaryDrawer.tsx`
- Download as ZIP with `jszip`
- DAM integration ready
- Auto-opens when processing completes

## State Management

Uses Zustand for global state:

```typescript
// Access state in any component
import { useStore } from '@/lib/store'

function MyComponent() {
  const { batch, addLog, updateImageStatus } = useStore()
  // Use state and actions
}
```

## API Routes (Mock Implementation)

All routes return mock data for development:

- `POST /api/upload` - Upload images
- `GET /api/status/:batchId` - Check progress
- `POST /api/retouch/:imageId` - Retouch image
- `GET /api/results/:batchId` - Get results
- `POST /api/export` - Export batch

**To integrate real AI:**
Replace mock logic in `/app/api/*` with actual service calls.

## Styling

- **Framework**: Tailwind CSS
- **Components**: ShadCN/UI (customizable)
- **Theme**: Defined in `tailwind.config.ts`
- **Dark Mode**: Toggle in header (state in Zustand)

To customize colors:
1. Edit `app/globals.css` CSS variables
2. Or modify `tailwind.config.ts`

## Animation System

Framer Motion handles all animations:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## Common Tasks

### Add a new UI component
```bash
# ShadCN components can be added via CLI if needed
# Or create manually in components/ui/
```

### Modify upload limits
Edit `NEXT_PUBLIC_MAX_FILE_SIZE` in `.env.local`

### Change theme colors
Edit CSS variables in `app/globals.css`

### Add new API endpoint
Create route handler in `app/api/your-endpoint/route.ts`

## Troubleshooting

### Images not loading?
- Check if you're using placeholder URLs (Picsum)
- Replace with real storage URLs in production

### Dark mode not working?
- Ensure `useEffect` in `page.tsx` is running
- Check if `darkMode` state updates in Zustand

### Build errors?
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps for Production

1. **Replace Mock APIs** with real AI services
2. **Add Authentication** (NextAuth.js recommended)
3. **Configure Storage** (AWS S3, Cloudinary, etc.)
4. **Add Database** for batch persistence
5. **Implement Real-time Updates** with WebSockets
6. **Add Error Boundaries** for better error handling
7. **Set up Monitoring** (Sentry, LogRocket, etc.)
8. **Configure CDN** for image delivery
9. **Add Unit Tests** (Jest, React Testing Library)
10. **Set up CI/CD** (GitHub Actions, Vercel)

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ShadCN/UI](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

## Support

For questions or issues, refer to the main README.md or contact the development team.

---

Happy coding! 🚀

