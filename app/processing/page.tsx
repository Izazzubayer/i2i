'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AuthenticatedNav from '@/components/AuthenticatedNav'
import {
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Folder,
  ArrowLeftRight,
  Download,
  CheckCircle,
  Wand2,
  Trash2,
  Send,
  FileText,
  MoreVertical,
  RotateCcw,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Folder {
  id: string
  name: string
  visuals: number
  status: string
  children?: Folder[]
}

const projects: Folder[] = [
  {
    id: 'project-a',
    name: 'Project A',
    visuals: 118,
    status: 'Active',
    children: [
      { id: 'project-a-folder-1', name: 'Campaign Visuals', visuals: 45, status: 'Active' },
      { id: 'project-a-folder-2', name: 'Product Shots', visuals: 38, status: 'Active' },
      { id: 'project-a-folder-3', name: 'Social Media', visuals: 35, status: 'Review' },
    ],
  },
  {
    id: 'project-b',
    name: 'Project B',
    visuals: 64,
    status: 'Review',
    children: [
      { id: 'project-b-folder-1', name: 'Website Assets', visuals: 32, status: 'Review' },
      { id: 'project-b-folder-2', name: 'Marketing Materials', visuals: 32, status: 'Review' },
    ],
  },
  {
    id: 'project-c',
    name: 'Project C',
    visuals: 32,
    status: 'Planning',
    children: [
      { id: 'project-c-folder-1', name: 'Initial Concepts', visuals: 32, status: 'Planning' },
    ],
  },
]

interface ImageVersion {
  id: string
  prompt: string
  processedUrl: string
  timestamp: string
  actor: string
}

interface ProcessedImage {
  id: string
  name: string
  status: string
  processedAt: string
  originalUrl: string
  processedUrl: string
  versions: ImageVersion[]
  currentVersionId: string
  folderId: string
}

const processedImages: ProcessedImage[] = [
  {
    id: 'img-1',
    name: 'city-center_raw.jpg',
    status: 'ready',
    processedAt: 'Processed at 15:22:29 PM',
    originalUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
    currentVersionId: 'v3',
    folderId: 'project-a-folder-1',
    versions: [
      {
        id: 'v1',
        prompt: 'Apply cinematic tone; ensure brand palette (deep blues, neutral highlights)',
        processedUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=70',
        timestamp: '14:01',
        actor: 'i2i Automations',
      },
      {
        id: 'v2',
        prompt: 'Enhance contrast and saturation, maintain architectural details',
        processedUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=75',
        timestamp: '14:30',
        actor: 'Eileen Chen',
      },
      {
        id: 'v3',
        prompt: 'Apply cinematic tone; ensure brand palette (deep blues, neutral highlights). Maintain detail in architecture and skin tones.',
        processedUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
        timestamp: '15:22',
        actor: 'Eileen Chen',
      },
    ],
  },
  {
    id: 'img-2',
    name: 'nordic-landscape_raw.jpg',
    status: 'ready',
    processedAt: 'Processed at 15:22:29 PM',
    originalUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80',
    currentVersionId: 'v2',
    folderId: 'project-a-folder-1',
    versions: [
      {
        id: 'v1',
        prompt: 'Natural color grading with cool tones',
        processedUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=70',
        timestamp: '14:01',
        actor: 'i2i Automations',
      },
      {
        id: 'v2',
        prompt: 'Enhance natural lighting, boost greens and blues',
        processedUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80',
        timestamp: '15:22',
        actor: 'Eileen Chen',
      },
    ],
  },
  {
    id: 'img-3',
    name: 'forest-sunrise_raw.jpg',
    status: 'ready',
    processedAt: 'Processed at 15:22:29 PM',
    originalUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    currentVersionId: 'v1',
    folderId: 'project-a-folder-2',
    versions: [
      {
        id: 'v1',
        prompt: 'Warm sunrise tones, enhance golden hour glow',
        processedUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
        timestamp: '14:01',
        actor: 'i2i Automations',
      },
    ],
  },
  {
    id: 'img-4',
    name: 'brand-flatlay_raw.jpg',
    status: 'needs-retouch',
    processedAt: 'Processed at 14:18:04 PM',
    originalUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80',
    currentVersionId: 'v2',
    folderId: 'project-a-folder-3',
    versions: [
      {
        id: 'v1',
        prompt: 'Clean white background, enhance product details',
        processedUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=70',
        timestamp: '14:01',
        actor: 'i2i Automations',
      },
      {
        id: 'v2',
        prompt: 'Add branded LUT + lift shadows',
        processedUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80',
        timestamp: '14:58',
        actor: 'i2i Automations',
      },
    ],
  },
]

interface ActivityLogEntry {
  id: string
  time: string
  actor: string
  action: string
  imageId?: string
  prompt?: string
  versionId?: string
  canRevert?: boolean
}

const activityLog: ActivityLogEntry[] = [
  {
    id: 'log-1',
    time: '15:22',
    actor: 'Eileen Chen',
    action: 'Prompt applied',
    imageId: 'img-1',
    prompt: 'Apply cinematic tone; ensure brand palette (deep blues, neutral highlights). Maintain detail in architecture and skin tones.',
    versionId: 'v3',
    canRevert: true,
  },
  {
    id: 'log-2',
    time: '14:58',
    actor: 'i2i Automations',
    action: 'Retouch completed',
    imageId: 'img-4',
    prompt: 'Add branded LUT + lift shadows',
    versionId: 'v2',
    canRevert: true,
  },
  {
    id: 'log-3',
    time: '14:30',
    actor: 'Eileen Chen',
    action: 'Prompt applied',
    imageId: 'img-1',
    prompt: 'Enhance contrast and saturation, maintain architectural details',
    versionId: 'v2',
    canRevert: true,
  },
  {
    id: 'log-4',
    time: '14:17',
    actor: 'Eileen Chen',
    action: 'Prompt submitted',
    imageId: 'img-4',
    prompt: 'Add branded LUT + lift shadows',
    versionId: 'v2',
    canRevert: true,
  },
  {
    id: 'log-5',
    time: '15:22',
    actor: 'Eileen Chen',
    action: 'Prompt applied',
    imageId: 'img-2',
    prompt: 'Enhance natural lighting, boost greens and blues',
    versionId: 'v2',
    canRevert: true,
  },
  {
    id: 'log-6',
    time: '14:01',
    actor: 'i2i Automations',
    action: 'Initial processing',
    imageId: 'img-1',
    prompt: 'Apply cinematic tone; ensure brand palette (deep blues, neutral highlights)',
    versionId: 'v1',
    canRevert: true,
  },
]

export default function ProcessingOverviewPage() {
  const [activeProject, setActiveProject] = useState(projects[0].id)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([projects[0].id]))
  const [selectedImageId, setSelectedImageId] = useState(processedImages[0].id)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [compareSlider, setCompareSlider] = useState(50)
  const [promptNotes, setPromptNotes] = useState(
    'Apply cinematic tone; ensure brand palette (deep blues, neutral highlights). Maintain detail in architecture and skin tones.'
  )
  const [isDragging, setIsDragging] = useState(false)
  const comparisonRef = useRef<HTMLDivElement>(null)
  const [revertDialogOpen, setRevertDialogOpen] = useState(false)
  const [revertImageId, setRevertImageId] = useState<string | null>(null)
  const [images, setImages] = useState<ProcessedImage[]>(processedImages)

  const filteredImages = useMemo(() => {
    if (activeFolder) {
      // Show images from selected folder
      return images.filter((img) => img.folderId === activeFolder)
    }
    // If no folder selected, show images from active project's folders
    const project = projects.find((p) => p.id === activeProject)
    if (project?.children) {
      const folderIds = project.children.map((f) => f.id)
      return images.filter((img) => folderIds.includes(img.folderId))
    }
    // Fallback: show all images
    return images
  }, [activeFolder, activeProject, images])

  const selectedImage = useMemo(
    () => filteredImages.find((image) => image.id === selectedImageId) ?? filteredImages[0],
    [selectedImageId, filteredImages]
  )

  // Update selected image when filtered images change
  useEffect(() => {
    if (filteredImages.length > 0) {
      const currentImageExists = filteredImages.some((img) => img.id === selectedImageId)
      if (!currentImageExists) {
        setSelectedImageId(filteredImages[0].id)
      }
    }
  }, [filteredImages, selectedImageId])

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleFolderSelect = (folderId: string) => {
    setActiveFolder(folderId)
    // Reset selection when switching folders
    setSelectedImages(new Set())
    // Select first image in new folder if available
    const folderImages = images.filter((img) => img.folderId === folderId)
    if (folderImages.length > 0) {
      setSelectedImageId(folderImages[0].id)
    }
  }

  const handleRevert = (imageId: string, entry: ActivityLogEntry) => {
    setRevertImageId(imageId)
    setRevertDialogOpen(true)
  }

  const handleSelectVersion = (imageId: string, versionId: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === imageId) {
          const version = img.versions.find((v) => v.id === versionId)
          if (version) {
            return {
              ...img,
              currentVersionId: versionId,
              processedUrl: version.processedUrl,
            }
          }
        }
        return img
      })
    )
    setRevertDialogOpen(false)
    setRevertImageId(null)
  }

  const allSelected = selectedImages.size === filteredImages.length && filteredImages.length > 0

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(new Set(filteredImages.map((img) => img.id)))
    } else {
      setSelectedImages(new Set())
    }
  }

  const toggleSelection = (imageId: string, checked: boolean) => {
    setSelectedImages((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(imageId)
      } else {
        next.delete(imageId)
      }
      return next
    })
  }

  const updateComparePosition = useCallback(
    (clientX: number) => {
      if (!comparisonRef.current) return
      const rect = comparisonRef.current.getBoundingClientRect()
      const offset = clientX - rect.left
      const ratio = Math.min(Math.max(offset / rect.width, 0), 1)
      setCompareSlider(ratio * 100)
    },
    []
  )

  const beginDragging = useCallback(
    (clientX: number) => {
      updateComparePosition(clientX)
      setIsDragging(true)
      document.body.style.userSelect = 'none'
    },
    [updateComparePosition]
  )

  useEffect(() => {
    if (!isDragging) {
      document.body.style.userSelect = ''
      return
    }

    const handleMove = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      updateComparePosition(clientX)
      if ('touches' in event) {
        event.preventDefault()
      }
    }

    const handleUp = () => {
      setIsDragging(false)
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleUp)
    window.addEventListener('touchcancel', handleUp)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
      window.removeEventListener('touchcancel', handleUp)
      document.body.style.userSelect = ''
    }
  }, [isDragging, updateComparePosition])

  const handleHandlePointerDown = (
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    event.preventDefault()
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    beginDragging(clientX)
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px]">
          <aside className="space-y-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Projects</p>
              <h1 className="text-2xl font-semibold tracking-tight">Image Processing Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">Interactive workspace for Project ABC.</p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Folders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {projects.map((project) => {
                  const isExpanded = expandedFolders.has(project.id)
                  const hasChildren = project.children && project.children.length > 0

                  return (
                    <div key={project.id} className="space-y-1">
                      <div className="flex items-center gap-1">
                        {hasChildren && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFolderExpansion(project.id)
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        {!hasChildren && <div className="w-6" />}
                        <button
                          onClick={() => {
                            setActiveProject(project.id)
                            setActiveFolder(null)
                            if (hasChildren && !isExpanded) {
                              toggleFolderExpansion(project.id)
                            }
                          }}
                          className={`flex-1 rounded-lg border px-3 py-2 text-left transition ${activeProject === project.id && !activeFolder
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-muted hover:border-foreground/40 hover:bg-muted/60'
                            }`}
                        >
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Folder className="h-4 w-4" />
                            {project.name}
                          </div>
                          <p className={`text-xs ${activeProject === project.id && !activeFolder ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {project.visuals} visuals · {project.status}
                          </p>
                        </button>
                      </div>

                      {isExpanded && hasChildren && (
                        <div className="relative ml-6 space-y-1">
                          {/* Main vertical line connecting all children to parent */}
                          <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-muted-foreground/40" />

                          {project.children?.map((child, index) => {
                            const isChildActive = activeFolder === child.id
                            const isLast = index === (project.children?.length ?? 0) - 1

                            return (
                              <div key={child.id} className="relative pl-4">
                                {/* Horizontal line connecting child to main vertical line */}
                                <div className="absolute left-0 top-1/2 w-4 h-[1.5px] bg-muted-foreground/40 -translate-y-1/2" />

                                {/* Hide vertical line below last item */}
                                {isLast && (
                                  <div className="absolute left-0 top-1/2 bottom-0 w-[1.5px] bg-background" />
                                )}

                                <button
                                  onClick={() => handleFolderSelect(child.id)}
                                  className={`w-full rounded-lg border px-3 py-2 text-left transition relative z-10 ${isChildActive
                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                    : 'border-muted hover:border-foreground/40 hover:bg-muted/60'
                                    }`}
                                >
                                  <div className="flex items-center gap-2 text-sm font-medium">
                                    <Folder className="h-4 w-4" />
                                    {child.name}
                                  </div>
                                  <p className={`text-xs ${isChildActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                    {child.visuals} visuals · {child.status}
                                  </p>
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

          </aside>

          <section className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  Before & After Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  ref={comparisonRef}
                  className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted cursor-ew-resize"
                >
                  <Image
                    src={selectedImage.originalUrl}
                    alt="Original visual"
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden rounded-xl"
                    style={{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }}
                  >
                    <Image
                      src={selectedImage.processedUrl}
                      alt="Processed visual"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white/90"
                    style={{ left: `${compareSlider}%` }}
                    onMouseDown={handleHandlePointerDown}
                    onTouchStart={handleHandlePointerDown}
                    role="presentation"
                  >
                    <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1 rounded-full bg-white p-2 shadow-lg transition duration-150 group-active:bg-white">
                      <div className="h-4 w-1 rounded bg-muted-foreground/40" />
                      <div className="h-4 w-1 rounded bg-muted-foreground/40" />
                    </div>
                  </div>
                  <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    Raw
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    Completed
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">Gallery</h3>
                  <p className="text-sm text-muted-foreground">Select visuals to approve, retouch, or export.</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                      aria-label="Select all visuals"
                    />
                    Select all
                  </label>
                  <span>{selectedImages.size} selected</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled={selectedImages.size === 0}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Retouch
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={selectedImages.size === 0}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={selectedImages.size === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={selectedImages.size === 0}>
                        <Send className="mr-2 h-4 w-4" />
                        Send to DAM
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={selectedImages.size === 0} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-3">
                  {filteredImages.map((image) => {
                    const isSelected = selectedImages.has(image.id)
                    const isActive = image.id === selectedImageId

                    return (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageId(image.id)}
                        className={`group relative w-44 shrink-0 overflow-hidden rounded-xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'border-primary ring-2 ring-primary/20' : 'border-muted hover:border-foreground/40'
                          }`}
                      >
                        <div className="relative aspect-[4/3] bg-muted">
                          <Image
                            src={image.processedUrl}
                            alt={image.name}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute left-3 top-3 rounded-full bg-white/95 p-1 shadow">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => toggleSelection(image.id, Boolean(checked))}
                              aria-label={`Select ${image.name}`}
                              className="h-4 w-4"
                            />
                          </div>
                          <div className="absolute right-3 top-3">
                            <Badge
                              variant={image.status === 'needs-retouch' ? 'destructive' : 'secondary'}
                              className="capitalize shadow-sm"
                            >
                              {image.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 p-4">
                          <p className="truncate text-sm font-semibold text-foreground">{image.name}</p>
                          <p className="text-xs text-muted-foreground">{image.processedAt}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </section>

          <aside className="hidden xl:block space-y-6">
            <Card className="select-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Activity Log</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Immutable audit trail of edits, approvals, downloads, and DAM transfers.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  <div className="divide-y">
                    {activityLog
                      .filter((entry) => entry.prompt && entry.imageId)
                      .map((entry) => (
                        <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                          <div className="flex flex-col gap-1 min-w-[48px]">
                            <Badge variant="outline" className="justify-center text-xs font-semibold">
                              {entry.time}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => entry.imageId && handleRevert(entry.imageId, entry)}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Revert
                            </Button>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground italic">&quot;{entry.prompt}&quot;</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Prompt / SOP Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={promptNotes}
                  onChange={(event) => setPromptNotes(event.target.value)}
                  rows={6}
                  className="resize-none text-sm"
                  aria-label="Prompt instructions"
                />
                <div className="flex flex-col gap-2">
                  <Button className="w-full" variant="secondary">
                    Apply to Selected ({selectedImages.size})
                  </Button>
                  <Button variant="ghost" className="w-full text-sm text-primary">
                    Upload new PDF / SOP
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied instructions are versioned per batch and can be rolled back if needed.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Project ABC · Last synched 15:25 PM · Demo workspace</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders">Back to orders</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/">New Project</Link>
            </Button>
          </div>
        </footer>
      </main>

      {/* Revert Version Dialog */}
      <Dialog open={revertDialogOpen} onOpenChange={setRevertDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Revert to Previous Version</DialogTitle>
            <DialogDescription>
              Select which version of the image you want to restore. Each version includes the prompt used to generate it.
            </DialogDescription>
          </DialogHeader>

          {revertImageId && (() => {
            const image = images.find((img) => img.id === revertImageId)
            if (!image) return null

            return (
              <div className="space-y-4">
                <div className="text-sm font-medium">Image: {image.name}</div>
                <div className="grid gap-4 md:grid-cols-2 max-h-[60vh] overflow-y-auto">
                  {image.versions.map((version) => {
                    const isCurrent = version.id === image.currentVersionId
                    return (
                      <div
                        key={version.id}
                        className={`relative rounded-lg border-2 p-3 transition ${isCurrent
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50 cursor-pointer'
                          }`}
                        onClick={() => !isCurrent && handleSelectVersion(image.id, version.id)}
                      >
                        {isCurrent && (
                          <Badge className="absolute right-2 top-2">Current</Badge>
                        )}
                        <div className="relative aspect-video mb-3 rounded overflow-hidden bg-muted">
                          <Image
                            src={version.processedUrl}
                            alt={`Version ${version.id}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {version.timestamp}
                            </span>
                            <span>{version.actor}</span>
                          </div>
                          <div className="rounded bg-muted/50 p-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Prompt:</p>
                            <p className="text-xs text-foreground italic">&quot;{version.prompt}&quot;</p>
                          </div>
                          {!isCurrent && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectVersion(image.id, version.id)
                              }}
                            >
                              <RotateCcw className="h-3 w-3 mr-2" />
                              Restore this version
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevertDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatusTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: string
  tone?: string
  icon?: React.ReactNode
}) {
  return (
    <Card className="border-muted/80">
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={`flex items-center gap-2 text-2xl font-semibold ${tone}`}>
          {value}
          {icon}
        </span>
      </CardContent>
    </Card>
  )
}

