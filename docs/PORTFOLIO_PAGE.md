# Portfolio Page - Implementation Guide

## Overview

The Portfolio page showcases i2i's image processing capabilities across 8 different product categories. It features interactive before/after comparisons, category filtering, and a comprehensive modal view for detailed inspection.

---

## Features

### 1. Hero Section
- **Animated Introduction**: Gradient text effects and smooth fade-in animations
- **Statistics Display**: Shows platform metrics (10M+ images processed, 8 categories, etc.)
- **Call-to-Action**: Prominent buttons for "Try It Now" and "How It Works"

### 2. Category Navigation
- **8 Product Categories**:
  - Apparel (fashion photography)
  - Footwear (product shots)
  - Accessories (watches, bags)
  - Jewellery (luxury items)
  - Perfume & Cosmetics (beauty products)
  - Furniture (interior design)
  - Homewares (home decor)
  - Electronics (tech products)

- **Sticky Navigation**: Tabs remain visible while scrolling
- **Visual Indicators**: Icons and gradient colors for each category
- **Category Descriptions**: Contextual information appears when selected

### 3. Interactive Image Comparisons
- **Before/After Slider**: Drag to compare original vs processed images
- **Auto-Animation**: Slider animates automatically on hover
- **Responsive Touch**: Works on mobile devices with touch gestures
- **Visual Labels**: "Before" and "After" badges on images

### 4. Portfolio Grid
- **Responsive Layout**: 
  - 1 column on mobile
  - 2 columns on tablet
  - 3 columns on desktop
- **Hover Effects**: Cards lift and show overlay on hover
- **Tag Display**: Enhancement tags visible on each item
- **Smooth Filtering**: Animated transitions when switching categories

### 5. Modal Detail View
- **Full Image Comparison**: Larger before/after slider
- **Enhancement Details**: Shows all AI models and techniques applied
- **Processing Information**: Time, models used, enhancements count
- **Download Options**: Download before, after, or both images
- **Share Functionality**: Native share API with clipboard fallback
- **Feature List**: Key capabilities demonstrated in the example

---

## Component Structure

```
app/portfolio/page.tsx                    # Main portfolio page
├── components/portfolio/
│   ├── BeforeAfterSlider.tsx            # Image comparison component
│   ├── PortfolioModal.tsx               # Detail view modal
│   └── PlaceholderImage.tsx             # Development placeholders
```

---

## BeforeAfterSlider Component

### Props
```typescript
interface BeforeAfterSliderProps {
  beforeImage: string       // URL to before image
  afterImage: string        // URL to after image
  isHovered?: boolean       // Auto-animate when true
}
```

### Features
- **Draggable Slider**: Click and drag to compare
- **Touch Support**: Works on mobile devices
- **Auto-Animation**: Slides automatically when hovered
- **Position Control**: Maintains slider position during drag
- **Visual Feedback**: Handle with move icon
- **Labels**: Before/After badges on images

### Usage
```tsx
<BeforeAfterSlider
  beforeImage="/path/to/before.jpg"
  afterImage="/path/to/after.jpg"
  isHovered={isCardHovered}
/>
```

---

## PortfolioModal Component

### Props
```typescript
interface PortfolioModalProps {
  item: PortfolioItem | null  // Selected portfolio item
  onClose: () => void          // Close handler
}
```

### Features
- **Full-Screen Overlay**: Dark backdrop with blur
- **Responsive Layout**: Two-column grid on desktop, stacked on mobile
- **Share Functionality**: Native share API or clipboard
- **Download Options**: Individual or combined downloads
- **Processing Details**: Shows AI models and techniques
- **CTA Section**: Direct link to start processing

---

## Data Structure

### Portfolio Item
```typescript
interface PortfolioItem {
  id: number
  category: string
  title: string
  before: string              // Before image URL
  after: string               // After image URL
  tags: string[]              // Enhancement tags
}
```

### Category Definition
```typescript
interface Category {
  id: string
  name: string
  icon: LucideIcon
  color: string               // Tailwind gradient classes
  description?: string        // Category description
}
```

---

## Styling & Animations

### Framer Motion Animations

**Hero Section**:
```tsx
// Fade in from bottom
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

**Category Filtering**:
```tsx
// Smooth category switch
<AnimatePresence mode="wait">
  <motion.div
    key={selectedCategory}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  />
</AnimatePresence>
```

**Card Hover**:
```tsx
// Scale and lift on hover
onHoverStart={() => setHoveredCard(item.id)}
onHoverEnd={() => setHoveredCard(null)}
```

### Custom CSS Classes

```css
/* Grid pattern background */
.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

---

## Adding Portfolio Items

### Step 1: Prepare Images
1. Upload before/after images to cloud storage (S3, Cloudinary, etc.)
2. Optimize images (WebP format, ~800x600px recommended)
3. Get public URLs for both images

### Step 2: Add to portfolioItems Array
```typescript
const portfolioItems = [
  {
    id: 17,  // Unique ID
    category: 'apparel',  // Must match category ID
    title: 'Summer Dress Collection',
    before: '/portfolio/apparel-before-3.jpg',
    after: '/portfolio/apparel-after-3.jpg',
    tags: ['Color Correction', 'Background Blur', 'Detail Enhancement']
  }
]
```

### Step 3: Tag Guidelines
Choose from common enhancement tags:
- Background Removal
- Color Enhancement
- Shadow Correction
- Wrinkle Removal
- Detail Sharpening
- Texture Enhancement
- Reflection Add
- Sparkle Enhancement
- Lighting Adjustment
- Professional Finish

---

## Production Considerations

### Image Optimization
```typescript
// Use Next.js Image component for automatic optimization
import Image from 'next/image'

<Image
  src={item.after}
  alt="After processing"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority  // For above-the-fold images
/>
```

### Performance
- **Lazy Loading**: Images load as user scrolls
- **Progressive Loading**: Blur placeholder → full image
- **Code Splitting**: Modal loads only when needed
- **Optimized Animations**: GPU-accelerated transforms

### SEO Optimization
```tsx
// Add metadata in page.tsx
export const metadata = {
  title: 'Portfolio - i2i Platform',
  description: 'Explore our portfolio of AI-processed product images across 8 categories',
  openGraph: {
    images: ['/portfolio/og-image.jpg']
  }
}
```

---

## Placeholder Images (Development)

For development, use the placeholder image generator:

```typescript
import { getPlaceholderImage } from '@/components/portfolio/PlaceholderImage'

const portfolioItems = [
  {
    id: 1,
    category: 'apparel',
    title: 'Test Item',
    before: getPlaceholderImage({ category: 'apparel', type: 'before' }),
    after: getPlaceholderImage({ category: 'apparel', type: 'after' }),
    tags: ['Test']
  }
]
```

**Replace with real images in production!**

---

## Mobile Optimization

### Responsive Breakpoints
- **Mobile**: Single column, simplified navigation
- **Tablet** (768px+): Two columns, sticky tabs
- **Desktop** (1024px+): Three columns, full features

### Touch Interactions
- Swipe gestures on slider
- Touch-friendly tap targets (min 44x44px)
- Smooth scroll behavior
- Reduced motion support

---

## Accessibility

### ARIA Labels
```tsx
<button aria-label="Close portfolio modal">
  <X className="h-5 w-5" />
</button>
```

### Keyboard Navigation
- Tab through all interactive elements
- Escape key closes modal
- Enter/Space activates buttons
- Arrow keys navigate categories

### Screen Readers
- Alt text on all images
- Semantic HTML structure
- Focus management in modal
- Status announcements

---

## Testing Checklist

### Functionality
- [ ] Category filtering works correctly
- [ ] Before/after slider is draggable
- [ ] Auto-animation triggers on hover
- [ ] Modal opens and closes properly
- [ ] Share functionality works (or falls back to clipboard)
- [ ] Download buttons trigger correctly
- [ ] "Try It Now" links to dashboard
- [ ] Responsive layout works on all screen sizes

### Performance
- [ ] Images load progressively
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts during load
- [ ] Lazy loading works as expected
- [ ] Modal doesn't cause performance issues

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Focus management in modal
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets are appropriately sized

---

## Future Enhancements

### Planned Features
1. **Video Comparisons**: Show processing animation
2. **360° View**: Rotate products
3. **Zoom Functionality**: Inspect details
4. **Filter by Tags**: Multiple tag selection
5. **Sort Options**: By date, popularity, category
6. **Search**: Find specific examples
7. **Related Examples**: Show similar transformations
8. **Client Testimonials**: Add social proof
9. **Download Stats**: Track popular downloads
10. **CMS Integration**: Manage content dynamically

### API Integration
```typescript
// Future: Fetch from CMS/API
async function getPortfolioItems(category?: string) {
  const response = await fetch(`/api/portfolio?category=${category}`)
  return response.json()
}
```

---

## Maintenance

### Adding New Categories
1. Add category to `categories` array
2. Choose appropriate icon from Lucide
3. Define gradient colors
4. Add description
5. Create sample portfolio items

### Updating Images
1. Upload new images to storage
2. Update URLs in `portfolioItems` array
3. Update tags if enhancements changed
4. Test before/after comparison
5. Verify modal display

### Content Updates
- Review quarterly for relevance
- Update based on user feedback
- Add new examples as capabilities expand
- Remove outdated examples

---

## Troubleshooting

### Slider Not Working
- Check image URLs are valid
- Verify images loaded successfully
- Ensure mouse/touch events not blocked
- Check z-index of slider handle

### Images Not Loading
- Verify image URLs are accessible
- Check CORS settings if external URLs
- Ensure Next.js Image domains configured
- Check network tab for errors

### Modal Not Opening
- Verify state management (`selectedItem`)
- Check `onClose` handler is defined
- Ensure no z-index conflicts
- Check console for errors

---

## Support

For questions or issues:
- Email: support@i2i-platform.com
- Documentation: /docs
- GitHub Issues: (if applicable)

---

**Last Updated**: November 26, 2025  
**Version**: 1.0  
**Status**: Production Ready

