# Edge Cases Documentation - Home Page

**Platform**: i2i - AI Image Processing Platform  
**Version**: 1.0  
**Last Updated**: October 31, 2025

This document outlines all possible edge cases, error scenarios, and their solutions for the home page of the i2i platform.

---

## Table of Contents

1. [Upload Section Edge Cases](#1-upload-section-edge-cases)
2. [Processing Panel Edge Cases](#2-processing-panel-edge-cases)
3. [Image Gallery Edge Cases](#3-image-gallery-edge-cases)
4. [Retouch Drawer Edge Cases](#4-retouch-drawer-edge-cases)
5. [Summary Drawer Edge Cases](#5-summary-drawer-edge-cases)
6. [State Management Edge Cases](#6-state-management-edge-cases)
7. [UI/UX Edge Cases](#7-uiux-edge-cases)
8. [Network & Performance Edge Cases](#8-network--performance-edge-cases)

---

## 1. Upload Section Edge Cases

### 1.1 No Images Uploaded

**Scenario**: User clicks "Continue" without uploading any images.

**When it occurs**: User tries to proceed with empty image selection.

**Current behavior**: Button displays error toast "Please upload at least one image" and processing doesn't start.

**Expected behavior**: Same as current.

**Solution**: 
```typescript
// UploadSection.tsx line 81-84
if (images.length === 0) {
  toast.error('Please upload at least one image')
  return
}
```

**Priority**: High  
**Status**: ✅ Handled

---

### 1.2 Missing Instructions

**Scenario**: User uploads images but provides no instructions (neither file nor text).

**When it occurs**: Instruction file is null and instruction text is empty/whitespace only.

**Current behavior**: Button displays error toast "Please provide instructions" and processing doesn't start.

**Expected behavior**: Same as current.

**Solution**:
```typescript
// UploadSection.tsx line 86-89
if (!instructionFile && !instructionText.trim()) {
  toast.error('Please provide instructions')
  return
}
```

**Priority**: High  
**Status**: ✅ Handled

---

### 1.3 Invalid File Type Upload

**Scenario**: User tries to upload unsupported file formats.

**When it occurs**: User selects files with extensions not in the allowed list.

**Current behavior**: React Dropzone rejects the files silently based on accept configuration.

**Expected behavior**: Show clear error message listing supported formats.

**Solution**:
```typescript
// Add onDropRejected handler in UploadSection.tsx
const onDropImages = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
  if (rejectedFiles.length > 0) {
    toast.error(`Invalid file type. Supported: PNG, JPG, JPEG, WEBP`)
  }
  setImages(prev => [...prev, ...acceptedFiles])
}, [])
```

**Priority**: High  
**Status**: 🔄 Partial (needs explicit rejection handler)

---

### 1.4 File Size Exceeds Limit

**Scenario**: User uploads images that are too large (>10MB per file).

**When it occurs**: Individual file size exceeds defined threshold.

**Current behavior**: No explicit size validation in client code.

**Expected behavior**: Reject oversized files with clear error message.

**Solution**:
```typescript
// Add maxSize to dropzone config
useDropzone({
  onDrop: onDropImages,
  accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  maxSize: 10 * 1024 * 1024, // 10MB
  multiple: true,
  onDropRejected: (files) => {
    const oversized = files.filter(f => f.errors.some(e => e.code === 'file-too-large'))
    if (oversized.length > 0) {
      toast.error(`${oversized.length} file(s) exceed 10MB limit`)
    }
  }
})
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 1.5 Duplicate File Names

**Scenario**: User uploads multiple files with the same name.

**When it occurs**: Multiple files selected have identical filenames.

**Current behavior**: Files are added to array with potential key conflicts.

**Expected behavior**: Either warn user or automatically rename duplicates.

**Solution**:
```typescript
// In onDropImages handler
const onDropImages = useCallback((acceptedFiles: File[]) => {
  const existingNames = new Set(images.map(f => f.name))
  const duplicates = acceptedFiles.filter(f => existingNames.has(f.name))
  
  if (duplicates.length > 0) {
    toast.warning(`${duplicates.length} duplicate filename(s) detected - they will be renamed`)
  }
  
  // Add files with renamed duplicates
  const processedFiles = acceptedFiles.map(file => {
    if (existingNames.has(file.name)) {
      const timestamp = Date.now()
      const newName = `${file.name.split('.')[0]}_${timestamp}.${file.name.split('.').pop()}`
      return new File([file], newName, { type: file.type })
    }
    return file
  })
  
  setImages(prev => [...prev, ...processedFiles])
}, [images])
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 1.6 Too Many Files at Once

**Scenario**: User tries to upload 500+ images simultaneously.

**When it occurs**: Drag and drop a folder with hundreds of images.

**Current behavior**: All files are accepted, potentially causing browser memory issues.

**Expected behavior**: Limit to reasonable batch size (e.g., 100 images) with warning.

**Solution**:
```typescript
const MAX_IMAGES = 100

const onDropImages = useCallback((acceptedFiles: File[]) => {
  const totalAfterAdd = images.length + acceptedFiles.length
  
  if (totalAfterAdd > MAX_IMAGES) {
    toast.error(`Maximum ${MAX_IMAGES} images allowed per batch`)
    const remainingSlots = MAX_IMAGES - images.length
    if (remainingSlots > 0) {
      toast.info(`Adding first ${remainingSlots} images`)
      setImages(prev => [...prev, ...acceptedFiles.slice(0, remainingSlots)])
    }
    return
  }
  
  setImages(prev => [...prev, ...acceptedFiles])
  toast.success(`${acceptedFiles.length} image(s) added`)
}, [images])
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 1.7 Network Interruption During Upload

**Scenario**: Internet connection drops while uploading files.

**When it occurs**: Upload API call fails due to network error.

**Current behavior**: Error is caught and generic error toast shown.

**Expected behavior**: Specific network error message with retry option.

**Solution**:
```typescript
// In handleProceed function
try {
  const response = await apiClient.upload(images, instructions)
  // ... success handling
} catch (error) {
  console.error('Upload failed:', error)
  
  if (error.message.includes('NetworkError') || error.code === 'ECONNREFUSED') {
    toast.error('Network error', {
      description: 'Please check your connection and try again',
      action: {
        label: 'Retry',
        onClick: () => handleProceed()
      }
    })
  } else {
    toast.error('Upload failed. Please try again.')
  }
  
  setUploadProgress(0)
} finally {
  setUploading(false)
}
```

**Priority**: High  
**Status**: 🔄 Partial (generic error handling exists)

---

### 1.8 Corrupted File Upload

**Scenario**: User uploads a corrupted or invalid image file.

**When it occurs**: File has image extension but is not a valid image.

**Current behavior**: File is accepted initially, may fail during processing.

**Expected behavior**: Validate file integrity before upload.

**Solution**:
```typescript
// Add file validation
const validateImageFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(false)
    reader.readAsDataURL(file)
  })
}

const onDropImages = useCallback(async (acceptedFiles: File[]) => {
  const validFiles = []
  const invalidFiles = []
  
  for (const file of acceptedFiles) {
    const isValid = await validateImageFile(file)
    if (isValid) {
      validFiles.push(file)
    } else {
      invalidFiles.push(file.name)
    }
  }
  
  if (invalidFiles.length > 0) {
    toast.error(`${invalidFiles.length} corrupted file(s) detected and skipped`)
  }
  
  if (validFiles.length > 0) {
    setImages(prev => [...prev, ...validFiles])
    toast.success(`${validFiles.length} image(s) added`)
  }
}, [])
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 1.9 Instruction File Parsing Error

**Scenario**: Uploaded instruction file (PDF/DOC) cannot be read.

**When it occurs**: File is corrupt or uses unsupported encoding.

**Current behavior**: File is accepted, content may not be extracted.

**Expected behavior**: Show error and prompt for manual text entry.

**Solution**:
```typescript
// Add file reading validation
const onDropInstructions = useCallback(async (acceptedFiles: File[]) => {
  if (acceptedFiles[0]) {
    try {
      // Attempt to read file
      const text = await acceptedFiles[0].text()
      if (!text || text.trim().length === 0) {
        toast.warning('File appears empty. Please enter instructions manually.')
      }
      setInstructionFile(acceptedFiles[0])
      toast.success('Instruction file added')
    } catch (error) {
      toast.error('Cannot read file. Please enter instructions manually.', {
        description: 'The file format may not be supported'
      })
    }
  }
}, [])
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 1.10 Browser Storage/Memory Limits

**Scenario**: Browser runs out of memory with too many large images.

**When it occurs**: Multiple large files create blob URLs exceeding memory.

**Current behavior**: Browser may crash or become unresponsive.

**Expected behavior**: Limit preview generation, revoke blob URLs properly.

**Solution**:
```typescript
// In image list rendering
useEffect(() => {
  // Cleanup blob URLs when component unmounts
  return () => {
    images.forEach(file => {
      URL.revokeObjectURL(URL.createObjectURL(file))
    })
  }
}, [images])

// Create preview URL on demand only
const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map())

const getPreviewUrl = (file: File) => {
  if (!previewUrls.has(file.name)) {
    const url = URL.createObjectURL(file)
    setPreviewUrls(prev => new Map(prev).set(file.name, url))
  }
  return previewUrls.get(file.name)!
}
```

**Priority**: High  
**Status**: 🔄 Partial (URLs revoked on load, but not managed efficiently)

---

### 1.11 Upload Progress Stuck at 90%

**Scenario**: Progress bar reaches 90% and stops updating.

**When it occurs**: API response delayed or interval not cleared.

**Current behavior**: Progress stays at 90% until API responds.

**Expected behavior**: Add timeout and loading indicator.

**Solution**:
```typescript
// Add timeout to upload
const UPLOAD_TIMEOUT = 30000 // 30 seconds

const handleProceed = async () => {
  setShowSummaryDialog(false)
  setUploading(true)
  setUploadProgress(0)

  const timeoutId = setTimeout(() => {
    toast.warning('Upload is taking longer than expected...', {
      description: 'Please wait or check your connection'
    })
  }, UPLOAD_TIMEOUT)

  try {
    // ... upload logic
    clearTimeout(timeoutId)
  } catch (error) {
    clearTimeout(timeoutId)
    // ... error handling
  }
}
```

**Priority**: Medium  
**Status**: 🔄 Partial (no timeout mechanism)

---

### 1.12 Disabled Instruction Textarea Not Clear

**Scenario**: User uploads instruction file, textarea becomes disabled.

**When it occurs**: Instruction file is present.

**Current behavior**: Textarea is disabled but not visually distinct.

**Expected behavior**: Clear visual indication that textarea is disabled.

**Solution**:
```typescript
// Update Textarea component
<Textarea
  placeholder={
    instructionFile 
      ? "Instructions from file will be used" 
      : "Enter processing instructions here..."
  }
  value={instructionText}
  onChange={(e) => setInstructionText(e.target.value)}
  className={`min-h-[120px] resize-none ${instructionFile ? 'opacity-50 cursor-not-allowed' : ''}`}
  disabled={!!instructionFile}
/>
```

**Priority**: Low  
**Status**: 🔄 Partial (disabled but needs better styling)

---

## 2. Processing Panel Edge Cases

### 2.1 Processing Interrupted by Browser Close

**Scenario**: User closes browser tab/window while processing.

**When it occurs**: Tab closed during active batch processing.

**Current behavior**: Processing state lost, no recovery on return.

**Expected behavior**: Save state to localStorage, offer to resume on return.

**Solution**:
```typescript
// Add persistence middleware to Zustand store
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... existing store
    }),
    {
      name: 'i2i-storage',
      partialize: (state) => ({
        batch: state.batch,
        // Don't persist drawers open state
      }),
    }
  )
)

// On app mount, check for incomplete batch
useEffect(() => {
  const { batch } = useStore.getState()
  if (batch && batch.status === 'processing') {
    const shouldResume = confirm(
      'Found incomplete batch. Would you like to resume processing?'
    )
    if (shouldResume) {
      // Resume processing
    } else {
      resetBatch()
    }
  }
}, [])
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 2.2 API Timeout During Processing

**Scenario**: AI processing API doesn't respond within expected time.

**When it occurs**: Individual image processing exceeds timeout threshold.

**Current behavior**: Currently using simulated processing with fixed interval.

**Expected behavior**: Implement timeout and retry mechanism.

**Solution**:
```typescript
const processImageWithTimeout = async (
  imageId: string, 
  timeout = 30000
): Promise<string> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Processing timeout')), timeout)
  })
  
  const processingPromise = apiClient.processImage(imageId)
  
  try {
    return await Promise.race([processingPromise, timeoutPromise])
  } catch (error) {
    if (error.message === 'Processing timeout') {
      addLog(`Image ${imageId} processing timeout - retrying...`, 'warning')
      // Retry once
      return await apiClient.processImage(imageId)
    }
    throw error
  }
}
```

**Priority**: High  
**Status**: ❌ Not handled (mock API only)

---

### 2.3 Log Overflow

**Scenario**: Processing generates hundreds of log entries, causing UI slowdown.

**When it occurs**: Large batch with verbose logging (500+ images).

**Current behavior**: All logs stored in state array, rendered in scrollable div.

**Expected behavior**: Limit logs to recent N entries, paginate older ones.

**Solution**:
```typescript
const MAX_LOGS = 100

const addLog: (message: string, type?: LogEntry['type']) => void = (message, type = 'info') => {
  const { batch } = get()
  if (!batch) return

  const log: LogEntry = {
    id: `log-${Date.now()}`,
    message,
    timestamp: new Date(),
    type,
  }

  set({
    batch: {
      ...batch,
      logs: [...batch.logs, log].slice(-MAX_LOGS), // Keep only last 100
    },
  })
}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 2.4 Progress Bar Calculation Error

**Scenario**: Progress percentage exceeds 100% or shows negative.

**When it occurs**: Race condition in concurrent status updates.

**Current behavior**: No bounds checking on progress value.

**Expected behavior**: Clamp progress between 0-100.

**Solution**:
```typescript
updateBatchProgress: (progress, status) => {
  const { batch } = get()
  if (!batch) return

  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress))

  set({
    batch: {
      ...batch,
      progress: clampedProgress,
      ...(status && { status }),
    },
  })
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 2.5 Concurrent Batch Processing

**Scenario**: User starts new batch while previous one is still processing.

**When it occurs**: "New Project" clicked during active processing.

**Current behavior**: Confirmation dialog shown, batch can be reset.

**Expected behavior**: Same as current, but could save previous batch to history.

**Solution**:
```typescript
// In page.tsx
const handleNewProject = () => {
  if (batch) {
    if (batch.status === 'processing') {
      const confirmed = confirm(
        'Processing is still in progress. Starting a new project will stop the current one. Continue?'
      )
      if (confirmed) {
        resetBatch()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (confirm('Start a new project? This will clear the current batch.')) {
      resetBatch()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
```

**Priority**: Medium  
**Status**: 🔄 Partial (needs status-aware messaging)

---

### 2.6 Processing State Sync Issues

**Scenario**: UI shows different status than actual processing state.

**When it occurs**: Multiple components update state simultaneously.

**Current behavior**: Zustand manages state synchronously, should be consistent.

**Expected behavior**: Ensure atomic updates for critical operations.

**Solution**:
```typescript
// Use atomic updates for critical state changes
updateImageStatus: (imageId, status, processedUrl) => {
  set((state) => {
    if (!state.batch) return state

    const updatedImages = state.batch.images.map(img =>
      img.id === imageId
        ? { ...img, status, ...(processedUrl && { processedUrl }) }
        : img
    )

    const processedCount = updatedImages.filter(img => 
      img.status === 'completed' || img.status === 'approved'
    ).length

    return {
      batch: {
        ...state.batch,
        images: updatedImages,
        processedCount,
      },
    }
  })
}
```

**Priority**: Medium  
**Status**: ✅ Handled (Zustand uses immutable updates)

---

### 2.7 Network Disconnection Mid-Processing

**Scenario**: Internet drops while processing batch.

**When it occurs**: Network connectivity lost during API calls.

**Current behavior**: Mock processing continues (no real API).

**Expected behavior**: Detect offline, pause processing, resume when online.

**Solution**:
```typescript
// Add network status monitoring
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  const handleOnline = () => {
    setIsOnline(true)
    toast.success('Connection restored - resuming processing')
  }
  
  const handleOffline = () => {
    setIsOnline(false)
    toast.error('Connection lost - processing paused', {
      duration: Infinity,
    })
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [])

// In processing logic
if (!isOnline) {
  clearInterval(processingInterval)
  addLog('Processing paused - waiting for connection', 'warning')
  return
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 2.8 Panel Collapse During Active Processing

**Scenario**: User collapses processing panel while actively processing.

**When it occurs**: Collapse button clicked during processing.

**Current behavior**: Panel content hidden but processing continues.

**Expected behavior**: Keep essential status visible when collapsed.

**Solution**:
```typescript
// Show mini status bar when collapsed and processing
{!isExpanded && batch.status === 'processing' && (
  <div className="mt-4 flex items-center justify-between rounded-lg border bg-card p-4">
    <div className="flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      <span className="text-sm font-medium">Processing...</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {batch.processedCount} / {batch.totalImages}
      </span>
      <Progress value={batch.progress} className="w-24 h-2" />
    </div>
  </div>
)}
```

**Priority**: Low  
**Status**: ❌ Not handled

---

## 3. Image Gallery Edge Cases

### 3.1 Empty Gallery State

**Scenario**: No images have been processed yet.

**When it occurs**: Gallery component renders before any image completes.

**Current behavior**: Gallery doesn't render (conditional based on processedUrl).

**Expected behavior**: Same as current - only show when images are ready.

**Solution**:
```typescript
// In page.tsx line 66
{batch.images.some(img => img.processedUrl) && (
  <ImageGallery />
)}
```

**Priority**: Low  
**Status**: ✅ Handled

---

### 3.2 Image Loading Failure

**Scenario**: Processed image URL returns 404 or fails to load.

**When it occurs**: Image deleted from storage or invalid URL.

**Current behavior**: Next.js Image component shows broken image placeholder.

**Expected behavior**: Show custom error state with retry option.

**Solution**:
```typescript
// Add error handling to Image component
const [imageError, setImageError] = useState(false)

{imageError ? (
  <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted p-4">
    <XCircle className="h-8 w-8 text-red-500" />
    <p className="text-sm text-muted-foreground">Failed to load</p>
    <Button 
      size="sm" 
      variant="outline"
      onClick={() => setImageError(false)}
    >
      Retry
    </Button>
  </div>
) : (
  <Image
    src={image.processedUrl}
    alt={image.originalName}
    fill
    className="object-cover"
    onError={() => setImageError(true)}
  />
)}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 3.3 Broken Image URLs

**Scenario**: Mock image service (Picsum) down or URL malformed.

**When it occurs**: External image service unavailable.

**Current behavior**: Images fail to load.

**Expected behavior**: Fallback to placeholder or local thumbnail.

**Solution**:
```typescript
// Use fallback URL
const getImageWithFallback = (url: string, fallback: string) => {
  return url || fallback || '/placeholder-image.png'
}

<Image
  src={getImageWithFallback(image.processedUrl, '/placeholder.png')}
  alt={image.originalName}
  fill
  className="object-cover"
  onError={(e) => {
    e.currentTarget.src = '/placeholder.png'
  }}
/>
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 3.4 Bulk Selection Memory Limit

**Scenario**: User selects all 100 images for bulk operation.

**When it occurs**: Large Set of selected IDs created.

**Current behavior**: Set stores all IDs, operations iterate through them.

**Expected behavior**: Limit bulk operations or batch them.

**Solution**:
```typescript
const MAX_BULK_SELECTION = 50

const toggleImageSelection = (imageId: string) => {
  const newSelected = new Set(selectedImages)
  
  if (!newSelected.has(imageId) && newSelected.size >= MAX_BULK_SELECTION) {
    toast.warning(`Maximum ${MAX_BULK_SELECTION} images can be selected at once`)
    return
  }
  
  if (newSelected.has(imageId)) {
    newSelected.delete(imageId)
  } else {
    newSelected.add(imageId)
  }
  setSelectedImages(newSelected)
}
```

**Priority**: Low  
**Status**: ❌ Not handled

---

### 3.5 Filter Shows No Results

**Scenario**: User filters by status that has zero images.

**When it occurs**: Filtering by "Needs Retouch" when all are approved.

**Current behavior**: Empty grid shown.

**Expected behavior**: Show empty state message.

**Solution**:
```typescript
// In ImageGallery after filteredImages definition
{filteredImages.length === 0 ? (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
    <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
    <h3 className="text-lg font-semibold mb-2">No images found</h3>
    <p className="text-sm text-muted-foreground">
      No images match the current filter: {filterMode}
    </p>
    <Button 
      variant="outline" 
      className="mt-4"
      onClick={() => setFilterMode('all')}
    >
      Clear Filter
    </Button>
  </div>
) : (
  // ... existing grid
)}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 3.6 Status Update Race Conditions

**Scenario**: Multiple rapid clicks on approve/retouch buttons.

**When it occurs**: User rapidly clicks status buttons.

**Current behavior**: Each click updates state, potential conflicts.

**Expected behavior**: Debounce status updates, show loading state.

**Solution**:
```typescript
// Add loading state per image
const [updatingImages, setUpdatingImages] = useState<Set<string>>(new Set())

const handleApprove = async (image: ProcessedImage) => {
  if (updatingImages.has(image.id)) return
  
  setUpdatingImages(prev => new Set(prev).add(image.id))
  
  try {
    approveImage(image.id)
    await new Promise(resolve => setTimeout(resolve, 300)) // Debounce
    toast.success('Image approved')
  } finally {
    setUpdatingImages(prev => {
      const next = new Set(prev)
      next.delete(image.id)
      return next
    })
  }
}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 3.7 Hover Overlay Not Showing on Mobile

**Scenario**: Touch devices don't have hover state.

**When it occurs**: User on mobile/tablet tries to access image actions.

**Current behavior**: Actions only visible on hover (desktop).

**Expected behavior**: Show actions always on touch devices or add tap gesture.

**Solution**:
```typescript
// Detect touch device
const [isTouchDevice, setIsTouchDevice] = useState(false)

useEffect(() => {
  setIsTouchDevice('ontouchstart' in window)
}, [])

// Always show actions on touch devices
{(hoveredImage === image.id || isTouchDevice) && image.status !== 'processing' && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 backdrop-blur-sm"
  >
    {/* ... action buttons */}
  </motion.div>
)}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 3.8 Memory Leak from Many Image Previews

**Scenario**: 100 images loaded, each with blob URL or external image.

**When it occurs**: Large batch processed, all images stay in memory.

**Current behavior**: All images rendered simultaneously.

**Expected behavior**: Implement virtual scrolling for large galleries.

**Solution**:
```typescript
// Use react-window for virtualization
import { FixedSizeGrid } from 'react-window'

const VirtualizedGallery = () => {
  const columnCount = 3
  const rowCount = Math.ceil(filteredImages.length / columnCount)
  
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex
    if (index >= filteredImages.length) return null
    
    const image = filteredImages[index]
    return (
      <div style={style}>
        {/* Image card content */}
      </div>
    )
  }
  
  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={350}
      height={800}
      rowCount={rowCount}
      rowHeight={400}
      width={1200}
    >
      {Cell}
    </FixedSizeGrid>
  )
}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 3.9 View Mode Switch During Selection

**Scenario**: User switches from grid to list view with images selected.

**When it occurs**: View mode button clicked while selections active.

**Current behavior**: Selections preserved, layout changes.

**Expected behavior**: Same as current (working correctly).

**Solution**: No changes needed - selection Set persists across views.

**Priority**: Low  
**Status**: ✅ Handled

---

### 3.10 DAM Upload with No Connection

**Scenario**: User clicks "Upload to DAM" without configuring connection.

**When it occurs**: No DAM config exists in state.

**Current behavior**: Error toast shown, DAM dialog opened.

**Expected behavior**: Same as current.

**Solution**:
```typescript
// Line 107-111 in ImageGallery.tsx
if (!config) {
  toast.error('No DAM connection configured')
  setDamDialogOpen(true)
  return
}
```

**Priority**: High  
**Status**: ✅ Handled

---

## 4. Retouch Drawer Edge Cases

### 4.1 Opening Drawer with Invalid Image

**Scenario**: Drawer opened with null or undefined image.

**When it occurs**: State corruption or timing issue.

**Current behavior**: Drawer may open with no content.

**Expected behavior**: Validate image before opening drawer.

**Solution**:
```typescript
// In ImageGallery
const handleRetouch = (image: ProcessedImage) => {
  if (!image || !image.id) {
    toast.error('Invalid image selected')
    return
  }
  openRetouchDrawer(image)
}

// In RetouchDrawer
if (!selectedImageForRetouch) {
  return null
}
```

**Priority**: High  
**Status**: 🔄 Partial (needs explicit validation)

---

### 4.2 Retouch API Failure

**Scenario**: AI retouch request fails or times out.

**When it occurs**: Network error or API service down.

**Current behavior**: Error caught in try-catch, toast shown.

**Expected behavior**: Show specific error with retry option.

**Solution**:
```typescript
// In RetouchDrawer handleApplyRetouch
try {
  const response = await apiClient.retouch(selectedImageForRetouch.id, retouchInstruction)
  // ... success handling
} catch (error) {
  console.error('Retouch failed:', error)
  
  if (error.code === 'TIMEOUT') {
    toast.error('Request timed out', {
      description: 'The AI service is taking too long',
      action: {
        label: 'Retry',
        onClick: () => handleApplyRetouch()
      }
    })
  } else if (error.code === 'NETWORK_ERROR') {
    toast.error('Network error', {
      description: 'Please check your connection'
    })
  } else {
    toast.error('Retouch failed', {
      description: error.message || 'Please try again'
    })
  }
  
  setIsProcessing(false)
}
```

**Priority**: High  
**Status**: 🔄 Partial (basic error handling)

---

### 4.3 Empty Instruction Submission

**Scenario**: User clicks "Apply Retouch" with empty instruction field.

**When it occurs**: Textarea is empty or whitespace only.

**Current behavior**: No validation shown.

**Expected behavior**: Prevent submission, show validation error.

**Solution**:
```typescript
// In RetouchDrawer
const handleApplyRetouch = async () => {
  if (!retouchInstruction.trim()) {
    toast.error('Please enter retouch instructions')
    return
  }
  
  if (retouchInstruction.length < 10) {
    toast.warning('Please provide more detailed instructions')
    return
  }
  
  // ... proceed with retouch
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 4.4 Concurrent Retouch Requests

**Scenario**: User opens retouch drawer for another image while first is processing.

**When it occurs**: Rapid retouch requests on multiple images.

**Current behavior**: New drawer replaces previous, first request may still be pending.

**Expected behavior**: Either queue requests or block until current completes.

**Solution**:
```typescript
// Track processing images
const [processingRetouches, setProcessingRetouches] = useState<Set<string>>(new Set())

const handleRetouch = (image: ProcessedImage) => {
  if (processingRetouches.has(image.id)) {
    toast.info('This image is already being retouched')
    return
  }
  openRetouchDrawer(image)
}

const handleApplyRetouch = async () => {
  setProcessingRetouches(prev => new Set(prev).add(selectedImageForRetouch.id))
  
  try {
    // ... retouch logic
  } finally {
    setProcessingRetouches(prev => {
      const next = new Set(prev)
      next.delete(selectedImageForRetouch.id)
      return next
    })
  }
}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 4.5 Drawer State Persistence

**Scenario**: User closes drawer, instruction text remains in state.

**When it occurs**: Drawer closed without clearing local state.

**Current behavior**: Instruction text may persist when reopening for different image.

**Expected behavior**: Clear instruction when drawer closes.

**Solution**:
```typescript
// In RetouchDrawer
useEffect(() => {
  if (!retouchDrawerOpen) {
    // Clear instruction when drawer closes
    setRetouchInstruction('')
  }
}, [retouchDrawerOpen])

// Or clear when image changes
useEffect(() => {
  setRetouchInstruction('')
}, [selectedImageForRetouch?.id])
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 4.6 Drawer Opens During Page Navigation

**Scenario**: Drawer state persists across page refreshes if using persist middleware.

**When it occurs**: Page refresh while drawer is open.

**Current behavior**: Drawer closed on refresh (state not persisted).

**Expected behavior**: Same as current.

**Solution**: Already handled - drawer state not included in persist partialize.

**Priority**: Low  
**Status**: ✅ Handled

---

## 5. Summary Drawer Edge Cases

### 5.1 Opening Before Processing Completes

**Scenario**: User manually opens summary drawer during processing.

**When it occurs**: If drawer control exposed before completion.

**Current behavior**: Drawer auto-opens only on completion.

**Expected behavior**: Allow manual open but show incomplete status.

**Solution**:
```typescript
// In SummaryDrawer, check batch status
{batch?.status !== 'completed' && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertTitle>Processing In Progress</AlertTitle>
    <AlertDescription>
      Summary will be available once all images are processed.
      {batch?.processedCount} / {batch?.totalImages} complete.
    </AlertDescription>
  </Alert>
)}
```

**Priority**: Low  
**Status**: ❌ Not handled

---

### 5.2 ZIP Download Failure

**Scenario**: Creating ZIP file fails due to memory or file access issues.

**When it occurs**: Large batch or browser limitations.

**Current behavior**: Error in download process.

**Expected behavior**: Show progress, handle errors gracefully.

**Solution**:
```typescript
// In SummaryDrawer handleDownload
const handleDownloadAll = async () => {
  if (!batch) return
  
  setIsExporting(true)
  const totalFiles = batch.images.length + 1 // +1 for summary
  let processed = 0
  
  try {
    const zip = new JSZip()
    
    // Add files with progress tracking
    for (const image of batch.images) {
      try {
        const response = await fetch(image.processedUrl)
        const blob = await response.blob()
        zip.file(image.originalName, blob)
        processed++
        
        // Update progress
        toast.loading(`Preparing download: ${processed}/${totalFiles}`, {
          id: 'zip-progress'
        })
      } catch (error) {
        console.error(`Failed to add ${image.originalName}:`, error)
        toast.warning(`Skipped ${image.originalName} - download failed`)
      }
    }
    
    // Generate ZIP with progress
    const content = await zip.generateAsync(
      { type: 'blob' },
      (metadata) => {
        const percent = metadata.percent.toFixed(0)
        toast.loading(`Creating ZIP: ${percent}%`, { id: 'zip-progress' })
      }
    )
    
    // Trigger download
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch-${batch.id}.zip`
    link.click()
    URL.revokeObjectURL(url)
    
    toast.success('Download complete!', { id: 'zip-progress' })
  } catch (error) {
    console.error('Export failed:', error)
    toast.error('Failed to create download', {
      id: 'zip-progress',
      description: 'Try downloading images individually'
    })
  } finally {
    setIsExporting(false)
  }
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 5.3 Large Batch ZIP Creation

**Scenario**: 100 large images cause browser to freeze during ZIP creation.

**When it occurs**: Memory-intensive ZIP generation.

**Current behavior**: Synchronous operation blocks UI.

**Expected behavior**: Use Web Worker for ZIP creation.

**Solution**:
```typescript
// Create zip-worker.ts
// zip-worker.ts
self.onmessage = async (e) => {
  const { images, batchId, summary } = e.data
  const zip = new JSZip()
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const response = await fetch(image.processedUrl)
    const blob = await response.blob()
    zip.file(image.originalName, blob)
    
    // Report progress
    self.postMessage({ type: 'progress', current: i + 1, total: images.length })
  }
  
  zip.file('summary.txt', summary)
  
  const content = await zip.generateAsync({ type: 'blob' })
  self.postMessage({ type: 'complete', blob: content })
}

// In component
const worker = new Worker(new URL('./zip-worker.ts', import.meta.url))

worker.postMessage({ images: batch.images, batchId: batch.id, summary: batch.summary })

worker.onmessage = (e) => {
  if (e.data.type === 'progress') {
    toast.loading(`${e.data.current}/${e.data.total} files added`)
  } else if (e.data.type === 'complete') {
    // Download blob
  }
}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 5.4 DAM Connection Errors

**Scenario**: DAM service authentication fails or is unavailable.

**When it occurs**: Invalid credentials or service downtime.

**Current behavior**: Error shown in toast.

**Expected behavior**: Detailed error with troubleshooting steps.

**Solution**:
```typescript
// In DamConnectDialog connection test
const testConnection = async (config: DamConfig) => {
  try {
    const response = await fetch(config.apiUrl + '/health', {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key - please check your credentials')
      } else if (response.status === 403) {
        throw new Error('Access denied - check workspace permissions')
      } else {
        throw new Error(`Connection failed (${response.status})`)
      }
    }
    
    return true
  } catch (error) {
    toast.error('Connection test failed', {
      description: error.message,
      action: {
        label: 'Help',
        onClick: () => window.open('/docs/dam-setup', '_blank')
      }
    })
    return false
  }
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 5.5 Summary Editing Conflicts

**Scenario**: User edits summary, then batch processes more images generating new summary.

**When it occurs**: User-edited summary overwritten by system.

**Current behavior**: System summary overwrites user edits.

**Expected behavior**: Detect user edits, prompt before overwriting.

**Solution**:
```typescript
// Track if summary was user-edited
const [summaryEdited, setSummaryEdited] = useState(false)
const [originalSummary, setOriginalSummary] = useState('')

const handleSummaryChange = (newSummary: string) => {
  setSummaryEdited(true)
  // Update store
}

// In ProcessingPanel when setting summary
if (summaryEdited) {
  const shouldOverwrite = confirm(
    'You have edited the summary. Overwrite with new AI-generated summary?'
  )
  if (!shouldOverwrite) return
}

setSummary(newAiSummary)
setSummaryEdited(false)
```

**Priority**: Low  
**Status**: ❌ Not handled

---

### 5.6 Export While Processing

**Scenario**: User tries to export before all images are processed.

**When it occurs**: Summary drawer opened manually during processing.

**Current behavior**: Export buttons available even if processing incomplete.

**Expected behavior**: Disable export until processing complete.

**Solution**:
```typescript
// In SummaryDrawer
const canExport = batch?.status === 'completed' && batch.processedCount === batch.totalImages

<Button
  onClick={handleDownloadAll}
  disabled={!canExport || isExporting}
  className="w-full"
>
  {!canExport && (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  )}
  Download All as ZIP
</Button>
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

## 6. State Management Edge Cases

### 6.1 Multiple Batch Creations

**Scenario**: createBatch called multiple times rapidly.

**When it occurs**: Bug or user rapidly clicking upload.

**Current behavior**: Each call creates new batch, overwriting previous.

**Expected behavior**: Prevent multiple concurrent batch creations.

**Solution**:
```typescript
// Add flag to prevent concurrent batch creation
let isCreatingBatch = false

createBatch: (id, instructions, imageCount) => {
  if (isCreatingBatch) {
    console.warn('Batch creation already in progress')
    return
  }
  
  isCreatingBatch = true
  
  const images: ProcessedImage[] = Array.from({ length: imageCount }, (_, i) => ({
    // ... image creation
  }))

  set({
    batch: {
      // ... batch data
    },
  })
  
  isCreatingBatch = false
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 6.2 Stale State After Page Refresh

**Scenario**: User refreshes page, state doesn't reflect latest backend data.

**When it occurs**: Page reload with persistent state.

**Current behavior**: No persistence middleware active.

**Expected behavior**: Either clear state or sync with backend.

**Solution**:
```typescript
// Add persistence with rehydration check
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'i2i-storage',
      onRehydrateStorage: () => (state) => {
        // Validate rehydrated state
        if (state?.batch) {
          const age = Date.now() - new Date(state.batch.images[0]?.timestamp || 0).getTime()
          const hourInMs = 60 * 60 * 1000
          
          if (age > hourInMs) {
            // State too old, clear it
            state.resetBatch()
            toast.info('Previous session expired')
          }
        }
      },
    }
  )
)
```

**Priority**: Medium  
**Status**: ❌ Not handled (no persistence active)

---

### 6.3 Race Conditions in State Updates

**Scenario**: Multiple async operations update same state property simultaneously.

**When it occurs**: Concurrent image status updates.

**Current behavior**: Zustand handles updates sequentially.

**Expected behavior**: Same as current.

**Solution**: Already handled by Zustand's synchronous state updates.

**Priority**: Low  
**Status**: ✅ Handled

---

### 6.4 Memory Management with Large Batches

**Scenario**: 500+ image batch causes memory issues in state.

**When it occurs**: Very large batch stored entirely in memory.

**Current behavior**: All data kept in memory.

**Expected behavior**: Implement pagination or lazy loading for large batches.

**Solution**:
```typescript
// Split batch into pages
interface BatchData {
  // ... existing fields
  currentPage: number
  pageSize: number
  totalPages: number
}

// Only load current page of images
const getCurrentPageImages = () => {
  const start = batch.currentPage * batch.pageSize
  const end = start + batch.pageSize
  return batch.images.slice(start, end)
}

// Add pagination actions
loadNextPage: () => { /* ... */ }
loadPreviousPage: () => { /* ... */ }
```

**Priority**: Low  
**Status**: ❌ Not handled

---

### 6.5 Browser Storage Quota Exceeded

**Scenario**: localStorage quota exceeded when persisting large batch data.

**When it occurs**: Large batch with many logs persisted.

**Current behavior**: No persistence active, wouldn't occur.

**Expected behavior**: Handle quota errors gracefully.

**Solution**:
```typescript
// In persist middleware
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'i2i-storage',
    onRehydrateStorage: () => (state) => {
      // ... rehydration
    },
    partialize: (state) => ({
      batch: {
        ...state.batch,
        logs: state.batch?.logs.slice(-50), // Only keep last 50 logs
        images: state.batch?.images.map(img => ({
          ...img,
          originalUrl: '', // Don't persist large blob URLs
        })),
      },
    }),
  }
)

// Catch quota errors
try {
  localStorage.setItem(key, value)
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    toast.warning('Storage limit reached - some data may not persist')
    // Clear old data
    localStorage.clear()
  }
}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 6.6 State Corruption from Invalid Data

**Scenario**: API returns malformed data that breaks store schema.

**When it occurs**: API error or unexpected response format.

**Current behavior**: May cause TypeScript errors or runtime issues.

**Expected behavior**: Validate data before setting state.

**Solution**:
```typescript
// Add validation helpers
const validateImage = (img: any): img is ProcessedImage => {
  return (
    typeof img.id === 'string' &&
    typeof img.originalName === 'string' &&
    typeof img.status === 'string' &&
    ['processing', 'completed', 'needs-retouch', 'approved', 'failed'].includes(img.status)
  )
}

updateImageStatus: (imageId, status, processedUrl) => {
  // Validate status
  const validStatuses: ImageStatus[] = ['processing', 'completed', 'needs-retouch', 'approved', 'failed']
  if (!validStatuses.includes(status)) {
    console.error('Invalid image status:', status)
    return
  }
  
  const { batch } = get()
  if (!batch) return
  
  // ... rest of update logic
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

## 7. UI/UX Edge Cases

### 7.1 Dark Mode Toggle During Operations

**Scenario**: User toggles dark mode while upload/processing in progress.

**When it occurs**: Theme toggle clicked during active operations.

**Current behavior**: Theme changes immediately, animations continue.

**Expected behavior**: Same as current (working correctly).

**Solution**: No changes needed - theme transitions are smooth and don't interfere.

**Priority**: Low  
**Status**: ✅ Handled

---

### 7.2 Responsive Layout on Small Screens

**Scenario**: Gallery layout breaks on very small devices (<320px).

**When it occurs**: Old mobile devices or extreme browser zoom.

**Current behavior**: Grid may overflow or break.

**Expected behavior**: Single column layout on very small screens.

**Solution**:
```typescript
// Add XS breakpoint to gallery grid
<div className={
  viewMode === 'grid' 
    ? 'grid gap-6 grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
    : 'space-y-4'
}>
```

**Priority**: Low  
**Status**: 🔄 Partial (good but could be more explicit)

---

### 7.3 Animation Performance with Many Elements

**Scenario**: 100+ images animating in simultaneously causes jank.

**When it occurs**: Large batch completes, gallery renders all at once.

**Current behavior**: Staggered animation with 0.05s delay per item.

**Expected behavior**: Limit concurrent animations or disable for large batches.

**Solution**:
```typescript
// Disable stagger for large galleries
const shouldAnimate = filteredImages.length < 50

{filteredImages.map((image, index) => (
  <motion.div
    key={image.id}
    initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : {}}
    animate={{ opacity: 1, scale: 1 }}
    transition={shouldAnimate ? { delay: index * 0.05 } : {}}
  >
    {/* card content */}
  </motion.div>
))}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 7.4 Keyboard Navigation Incomplete

**Scenario**: User tries to navigate app using only keyboard.

**When it occurs**: Accessibility-focused users or keyboard-only navigation.

**Current behavior**: Basic tab navigation works, but some features missing.

**Expected behavior**: Full keyboard navigation with shortcuts.

**Solution**:
```typescript
// Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // ESC to close drawers
    if (e.key === 'Escape') {
      if (retouchDrawerOpen) closeRetouchDrawer()
      if (summaryDrawerOpen) toggleSummaryDrawer(false)
    }
    
    // Ctrl/Cmd + A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && batch) {
      e.preventDefault()
      toggleSelectAll()
    }
    
    // Delete to remove selected
    if (e.key === 'Delete' && selectedImages.size > 0) {
      // Handle deletion
    }
  }
  
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [retouchDrawerOpen, summaryDrawerOpen, selectedImages, batch])
```

**Priority**: Medium  
**Status**: 🔄 Partial (basic tab navigation works)

---

### 7.5 Screen Reader Compatibility

**Scenario**: Screen reader users can't understand image states.

**When it occurs**: ARIA labels missing or insufficient.

**Current behavior**: Some ARIA support from ShadCN components.

**Expected behavior**: Comprehensive ARIA labels and live regions.

**Solution**:
```typescript
// Add ARIA attributes
<div 
  role="img" 
  aria-label={`${image.originalName}, status: ${image.status}`}
  className="relative bg-muted"
>
  <Image src={image.processedUrl} alt={image.originalName} />
  <span className="sr-only">
    Processed image {image.originalName}, 
    status {image.status}, 
    processed at {new Date(image.timestamp).toLocaleString()}
  </span>
</div>

// Add live region for processing updates
<div role="status" aria-live="polite" className="sr-only">
  {batch?.status === 'processing' && `Processing ${batch.processedCount} of ${batch.totalImages} images`}
</div>
```

**Priority**: High  
**Status**: 🔄 Partial (needs improvement)

---

### 7.6 Touch vs Mouse Interactions

**Scenario**: Different behavior on touch vs mouse devices.

**When it occurs**: Touch-specific gestures not working.

**Current behavior**: Hover effects don't work on touch.

**Expected behavior**: Touch-optimized interactions.

**Solution**: See Edge Case 3.7 for hover solution.

**Priority**: High  
**Status**: ❌ Not handled

---

### 7.7 Long File Names Overflow

**Scenario**: Image with very long filename breaks card layout.

**When it occurs**: Filename exceeds container width.

**Current behavior**: Filename truncated with ellipsis.

**Expected behavior**: Same as current (working).

**Solution**:
```typescript
// Already handled with truncate class
<h3 className="mb-1 truncate font-medium">
  {image.originalName}
</h3>
```

**Priority**: Low  
**Status**: ✅ Handled

---

### 7.8 Tooltip Overflow on Screen Edges

**Scenario**: Tooltip content gets cut off at viewport edges.

**When it occurs**: Image card near edge, tooltip opens.

**Current behavior**: Radix UI tooltips auto-position.

**Expected behavior**: Same as current (working).

**Solution**: Already handled by Radix UI TooltipPrimitive.

**Priority**: Low  
**Status**: ✅ Handled

---

## 8. Network & Performance Edge Cases

### 8.1 Slow Network Conditions

**Scenario**: User on 3G connection, images load very slowly.

**When it occurs**: Slow network or high latency.

**Current behavior**: Images load sequentially as browser fetches them.

**Expected behavior**: Show loading skeletons, prioritize visible images.

**Solution**:
```typescript
// Add loading states
const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

<Card className="overflow-hidden">
  <div className="relative aspect-[4/3] bg-muted">
    {!image.processedUrl || loadingImages.has(image.id) ? (
      <div className="flex h-full items-center justify-center">
        <div className="space-y-2 w-full p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ) : (
      <Image
        src={image.processedUrl}
        alt={image.originalName}
        fill
        loading="lazy"
        onLoadingComplete={() => {
          setLoadingImages(prev => {
            const next = new Set(prev)
            next.delete(image.id)
            return next
          })
        }}
      />
    )}
  </div>
</Card>
```

**Priority**: High  
**Status**: 🔄 Partial (Next.js Image optimizes but no skeleton)

---

### 8.2 Offline Mode Handling

**Scenario**: User goes completely offline.

**When it occurs**: No internet connection.

**Current behavior**: Operations fail with generic errors.

**Expected behavior**: Show offline banner, queue operations for retry.

**Solution**:
```typescript
// Add offline detection
const [isOffline, setIsOffline] = useState(!navigator.onLine)

useEffect(() => {
  const handleOnline = () => setIsOffline(false)
  const handleOffline = () => setIsOffline(true)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [])

// Show offline banner
{isOffline && (
  <div className="fixed top-0 left-0 right-0 z-50 bg-destructive p-3 text-center text-destructive-foreground">
    <AlertCircle className="inline-block mr-2 h-4 w-4" />
    You are offline. Some features may not work.
  </div>
)}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 8.3 Concurrent API Requests

**Scenario**: Multiple API calls made simultaneously.

**When it occurs**: User triggers multiple actions quickly.

**Current behavior**: Each request handled independently.

**Expected behavior**: Implement request queue or rate limiting.

**Solution**:
```typescript
// Add request queue
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private pending = 0
  private maxConcurrent = 3
  
  async add<T>(fn: () => Promise<T>): Promise<T> {
    while (this.pending >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.pending++
    try {
      return await fn()
    } finally {
      this.pending--
    }
  }
}

const requestQueue = new RequestQueue()

// Use in API calls
export const apiClient = {
  async processImage(id: string) {
    return requestQueue.add(() => 
      fetch(`/api/process/${id}`).then(r => r.json())
    )
  },
}
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

### 8.4 Memory Leaks from Event Listeners

**Scenario**: Event listeners not cleaned up on unmount.

**When it occurs**: Component unmounts without cleanup.

**Current behavior**: Most effects have cleanup functions.

**Expected behavior**: All effects properly cleaned up.

**Solution**:
```typescript
// Audit all useEffect hooks
useEffect(() => {
  // Event listener setup
  const handler = () => { /* ... */ }
  window.addEventListener('event', handler)
  
  // ALWAYS return cleanup
  return () => {
    window.removeEventListener('event', handler)
  }
}, [deps])

// Audit interval/timeout cleanup
useEffect(() => {
  const interval = setInterval(() => { /* ... */ }, 1000)
  
  return () => {
    clearInterval(interval)
  }
}, [deps])
```

**Priority**: High  
**Status**: ✅ Handled (most effects have cleanup)

---

### 8.5 Browser Compatibility Issues

**Scenario**: Features not working in older browsers.

**When it occurs**: IE11, old Safari, etc.

**Current behavior**: Modern JS/CSS used, may not work in old browsers.

**Expected behavior**: Polyfills for critical features or browser warning.

**Solution**:
```typescript
// Add browser detection
const isOldBrowser = () => {
  const ua = navigator.userAgent
  return (
    ua.indexOf('MSIE') !== -1 || 
    ua.indexOf('Trident/') !== -1 ||
    /Safari\/(\d+)/.test(ua) && parseInt(RegExp.$1) < 12
  )
}

// Show warning
useEffect(() => {
  if (isOldBrowser()) {
    toast.warning('Your browser may not support all features', {
      description: 'Please upgrade to a modern browser for the best experience',
      duration: 10000,
    })
  }
}, [])
```

**Priority**: Low  
**Status**: ❌ Not handled

---

### 8.6 Large File Upload Performance

**Scenario**: Uploading 100 x 10MB images (1GB total).

**When it occurs**: User uploads maximum batch of large files.

**Current behavior**: All files sent in single FormData request.

**Expected behavior**: Chunk uploads or use resumable upload protocol.

**Solution**:
```typescript
// Implement chunked upload
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks

const uploadInChunks = async (file: File) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)
    
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkIndex', i.toString())
    formData.append('totalChunks', totalChunks.toString())
    formData.append('fileName', file.name)
    
    await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData,
    })
    
    // Update progress
    const progress = ((i + 1) / totalChunks) * 100
    setUploadProgress(progress)
  }
}
```

**Priority**: High  
**Status**: ❌ Not handled

---

### 8.7 Image Processing Timeout

**Scenario**: AI service takes > 60 seconds per image.

**When it occurs**: Complex processing or service overload.

**Current behavior**: Mock processing uses fixed 2-second interval.

**Expected behavior**: Configurable timeout with retry logic.

**Solution**: See Edge Case 2.2 for timeout implementation.

**Priority**: High  
**Status**: ❌ Not handled (mock API)

---

### 8.8 CORS Errors with External Images

**Scenario**: Loading images from external sources causes CORS errors.

**When it occurs**: Image URLs point to different domains.

**Current behavior**: Using Picsum (CORS-enabled) for mocks.

**Expected behavior**: Proxy images through API or use CORS-enabled storage.

**Solution**:
```typescript
// Create API proxy endpoint
// app/api/image-proxy/route.ts
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return new Response('Missing URL', { status: 400 })
  }
  
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    return new Response(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    return new Response('Failed to fetch image', { status: 500 })
  }
}

// Use proxy in Image component
<Image 
  src={`/api/image-proxy?url=${encodeURIComponent(image.processedUrl)}`}
  alt={image.originalName}
/>
```

**Priority**: Medium  
**Status**: ❌ Not handled

---

## Summary

### High Priority Issues (26)
- Invalid file type with explicit error
- File size limit enforcement
- Too many files limit
- Network interruption with retry
- Corrupted file validation
- Browser memory management
- Processing state persistence
- API timeout handling
- Progress bar bounds checking
- Network disconnection detection
- Image loading failure handling
- Hover on touch devices
- Retouch drawer validation
- Empty instruction validation
- Retouch API error handling
- ZIP download error handling
- DAM connection errors
- Multiple batch prevention
- State data validation
- Screen reader improvements
- Slow network optimization
- Offline mode detection
- Memory leak prevention
- Large file chunked upload
- Processing timeout
- Network interruption recovery

### Medium Priority Issues (18)
- Duplicate filename handling
- Upload progress timeout
- Log overflow limiting
- Status update race conditions
- Memory leak in gallery
- Empty filter results
- Concurrent retouch prevention
- Retouch drawer state cleanup
- Large ZIP with Web Worker
- Summary editing conflicts
- State age validation
- Browser storage quota
- Animation performance
- Keyboard navigation
- Concurrent request queue
- CORS image proxy
- Processing panel mini status
- Export during processing

### Low Priority Issues (11)
- Disabled textarea styling
- Empty gallery state
- Bulk selection limit
- View mode selection preservation
- DAM drawer state
- Dark mode during operations
- Responsive XS screens
- Long filename truncation
- Tooltip positioning
- Browser compatibility warning
- Summary before completion

### Status Summary
- ✅ Handled: 11 edge cases
- 🔄 Partial: 13 edge cases
- ❌ Not Handled: 31 edge cases

---

## Implementation Recommendations

### Phase 1 (Critical - Implement First)
1. File validation (type, size, corruption)
2. Upload limits and chunking
3. Error handling with retry mechanisms
4. State persistence and recovery
5. Network status monitoring

### Phase 2 (Important - Implement Soon)
1. Touch device optimization
2. Loading states and skeletons
3. Memory management improvements
4. Accessibility enhancements
5. Performance optimizations

### Phase 3 (Nice to Have)
1. Advanced keyboard shortcuts
2. Request queuing
3. Browser compatibility checks
4. Additional UI polish
5. Extended error recovery

---

**Document End**

