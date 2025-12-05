# 🚀 Quick Start Guide - i2i Platform

Get up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18 or higher (`node --version`)
- ✅ npm or yarn package manager
- ✅ A modern web browser
- ✅ Terminal/Command prompt access

## Installation (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```
This will install all required packages. Takes about 1-2 minutes.

### Step 2: Start Development Server
```bash
npm run dev
```
Wait for "Ready" message showing local URL.

### Step 3: Open in Browser
Navigate to: **http://localhost:3000**

That's it! 🎉

## First Time User Flow

### 1. Upload Images
- Drag & drop images into the **Images** card
- Or click to browse your files
- Supported: PNG, JPG, JPEG, WEBP

### 2. Add Instructions
Choose one option:
- **Option A**: Upload a PDF/DOC with instructions
- **Option B**: Type instructions directly in the text area

Example instructions:
```
Replace background with solid white
Enhance colors and brightness
Remove any shadows
Sharpen image details
```

### 3. Start Processing
- Click the big blue "Start Processing" button
- Watch the progress bar fill up
- See live logs of AI processing

### 4. Review Results
- Processed images appear in the gallery below
- Hover over any image to see action buttons:
  - ✅ **Check mark**: Approve image
  - ✏️ **Edit**: Open retouch drawer
  - 👁️ **Eye**: View full size

### 5. Retouch (Optional)
If an image needs adjustments:
- Click the Edit button
- Enter specific instructions
- Click "Apply Retouch"
- Image updates automatically

### 6. Export
When processing completes:
- Summary drawer auto-opens
- Review batch statistics
- Choose export option:
  - **Download All**: Gets ZIP file with images + summary
  - **Connect to DAM**: Upload to your system

### 7. Start New Batch
Click "Start New Batch" to process more images!

## Quick Tips

### 💡 Pro Tips
- Upload up to 100 images per batch
- Be specific in instructions for better results
- Use dark mode toggle (moon icon) for comfort
- All data is processed locally (mock mode)

### ⌨️ Keyboard Shortcuts (Future)
- `/` - Focus search
- `r` - Open retouch
- `e` - Open export
- `Esc` - Close drawers

## Troubleshooting

### Port Already in Use?
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
# Or use different port
npm run dev -- -p 3001
```

### Dependencies Won't Install?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Images Not Showing?
- This is normal in development (using placeholder images)
- Real AI processing requires API integration
- See DEPLOYMENT.md for production setup

### Build Fails?
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## What's Happening Under the Hood?

### Mock AI Processing
Currently, the app simulates AI processing:
- Progress updates every 2 seconds
- Uses placeholder images (Lorem Picsum)
- Generates mock summaries

### Ready for Production?
To integrate real AI:
1. Replace API mocks in `/app/api/*` routes
2. Add your AI service credentials
3. Configure cloud storage (S3, Cloudinary)
4. See DEPLOYMENT.md for full guide

## Project Structure Quick Reference

```
i2i/
├── app/
│   ├── api/           → Backend endpoints
│   ├── page.tsx       → Main application
│   └── layout.tsx     → App wrapper
├── components/        → React components
│   ├── ui/           → Reusable UI elements
│   └── *.tsx         → Feature components
├── lib/
│   ├── store.ts      → State management
│   ├── api.ts        → API client
│   └── utils.ts      → Helper functions
└── public/           → Static files
```

## Next Steps

### For Developers
1. Read **ARCHITECTURE.md** - Understand system design
2. Read **SETUP.md** - Detailed development guide
3. Read **DEPLOYMENT.md** - Production deployment

### For Designers
1. Customize theme in `app/globals.css`
2. Modify components in `components/`
3. Update Tailwind config in `tailwind.config.ts`

### For Product Managers
1. Review feature set in **README.md**
2. Check roadmap in **ARCHITECTURE.md**
3. Plan AI integration strategy

## Common Questions

**Q: Is this production-ready?**
A: UI is production-ready. Backend needs real AI integration.

**Q: Can I customize the design?**
A: Yes! All styling is in Tailwind CSS. Easy to customize.

**Q: How do I add authentication?**
A: Recommend NextAuth.js. See DEPLOYMENT.md.

**Q: What AI services are supported?**
A: Any! Just implement the API routes with your service.

**Q: Is there a limit on image size?**
A: Default 10MB per image. Configurable in `.env`.

**Q: Can I deploy this for free?**
A: Yes! Vercel's free tier is perfect for this.

## Getting Help

- 📖 **Documentation**: Check other .md files in root
- 🐛 **Issues**: Open GitHub issue
- 💬 **Questions**: Email izazzubayer@gmail.com
- 🎮 **Discord**: Join Next.js Discord for framework help

## Success Indicators

You'll know it's working when:
- ✅ Dev server runs without errors
- ✅ You can upload images
- ✅ Processing starts automatically
- ✅ Progress bar moves
- ✅ Images appear in gallery
- ✅ You can download results

## Performance Expectations

### Development Mode
- Initial load: ~1-2 seconds
- Image upload: Instant
- Processing: 2 seconds per image (simulated)
- Gallery render: Instant

### Production Mode (with real AI)
- Processing: Depends on AI service
- Typical: 5-30 seconds per image
- Can be optimized with batch processing

## Congratulations! 🎉

You're now running a professional AI image processing platform!

Explore the features, customize the design, and integrate real AI when ready.

Happy coding! 👨‍💻👩‍💻

---

**Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**

