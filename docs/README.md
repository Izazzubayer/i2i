# i2i - AI Image Processing Platform

A modern, enterprise-grade web application for batch image processing using AI. Built with Next.js, React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Drag & Drop Upload**: Easy image and instruction file uploads
- **AI Processing**: Automated batch image processing with real-time progress tracking
- **Live Processing Logs**: Monitor AI processing with detailed logs
- **Image Gallery**: Review processed images with intuitive grid layout
- **Smart Retouch**: AI-powered image refinement with custom instructions
- **Export Options**: Download as ZIP or connect to your DAM system
- **Dark Mode**: Beautiful dark mode support
- **Responsive Design**: Optimized for all device sizes
- **Smooth Animations**: Polished UI with Framer Motion animations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd i2i
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
i2i/
├── app/
│   ├── api/              # API routes
│   │   ├── upload/       # Image upload endpoint
│   │   ├── status/       # Processing status endpoint
│   │   ├── retouch/      # Image retouch endpoint
│   │   ├── results/      # Results retrieval endpoint
│   │   └── export/       # Export endpoint
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # ShadCN UI components
│   ├── Header.tsx        # Application header
│   ├── UploadSection.tsx # Upload interface
│   ├── ProcessingPanel.tsx # Processing status
│   ├── ImageGallery.tsx  # Image grid
│   ├── RetouchDrawer.tsx # Retouch interface
│   └── SummaryDrawer.tsx # Summary & export
├── lib/
│   ├── store.ts          # Zustand state management
│   ├── api.ts            # API client
│   └── utils.ts          # Utility functions
├── public/               # Static assets
└── package.json
```

## 🎯 Usage

### 1. Upload Images
- Drag and drop images or click to browse
- Upload instruction file (PDF, DOC, TXT) or enter text manually
- Click "Start Processing"

### 2. Monitor Processing
- Watch real-time progress bar
- View processing logs
- See statistics for processed images

### 3. Review & Retouch
- Browse processed images in grid view
- Approve images or mark for retouch
- Use AI retouch drawer for refinements

### 4. Export
- Download all images as ZIP with summary
- Connect to your DAM system
- Start a new batch

## 🔧 API Endpoints

### Upload Images
```
POST /api/upload
Body: FormData with images and instructions
Response: { batchId, message, imageCount }
```

### Get Processing Status
```
GET /api/status/:batchId
Response: { progress, status, logs }
```

### Retouch Image
```
POST /api/retouch/:imageId
Body: { instruction: string }
Response: { success, processedUrl }
```

### Get Results
```
GET /api/results/:batchId
Response: { batchId, images[], summary }
```

### Export Batch
```
POST /api/export
Body: { type: "download" | "dam", batchId, damUrl? }
Response: { success, message }
```

## 🎨 Customization

### Theme
Modify `tailwind.config.ts` and `app/globals.css` to customize colors and styles.

### Components
All UI components are in `components/ui/` and can be customized using the ShadCN/UI CLI.

## 📝 Development

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## 🚀 Deployment

This application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** containers
- Any Node.js hosting platform

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 🔐 Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# AI Service API
NEXT_PUBLIC_AI_API_URL=your_ai_service_url
AI_API_KEY=your_api_key

# Storage
STORAGE_BUCKET=your_storage_bucket
STORAGE_ACCESS_KEY=your_access_key

# Database (if needed)
DATABASE_URL=your_database_url
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [ShadCN/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand)

## 📞 Support

For support, email izazzubayer@gmail.com or open an issue on GitHub.

---

Built with ❤️ by developers with 600 years of combined experience 😉

