'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Home,
  ListChecks,
  Code2,
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

const projects = [
  { id: 'project-a', name: 'Project A', visuals: 118, status: 'Active' },
  { id: 'project-b', name: 'Project B', visuals: 64, status: 'Review' },
  { id: 'project-c', name: 'Project C', visuals: 32, status: 'Planning' },
]

const processedImages = [
  {
    id: 'img-1',
    name: 'city-center_raw.jpg',
    status: 'ready',
    processedAt: 'Processed at 15:22:29 PM',
    originalUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'img-2',
    name: 'nordic-landscape_raw.jpg',
    status: 'ready',
    processedAt: 'Processed at 15:22:29 PM',
    originalUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'img-3',
    name: 'forest-sunrise_raw.jpg',
    status: 'ready',
    processedAt: 'Processed at 15:22:29 PM',
    originalUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'img-4',
    name: 'brand-flatlay_raw.jpg',
    status: 'needs-retouch',
    processedAt: 'Processed at 14:18:04 PM',
    originalUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=60',
    processedUrl: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80',
  },
]

const activityLog = [
  {
    id: 'log-1',
    time: '15:22',
    actor: 'Eileen Chen',
    action: 'Approved 2 visuals for export',
  },
  {
    id: 'log-2',
    time: '14:58',
    actor: 'i2i Automations',
    action: 'Completed retouch: “Add branded LUT + lift shadows”',
  },
  {
    id: 'log-3',
    time: '14:17',
    actor: 'Eileen Chen',
    action: 'Submitted retouch instruction for “brand-flatlay_raw.jpg”',
  },
  {
    id: 'log-4',
    time: '14:01',
    actor: 'i2i Automations',
    action: 'Batch “Project A — Campaign visuals” completed processing',
  },
]

export default function ProcessingOverviewPage() {
  const [activeProject, setActiveProject] = useState(projects[0].id)
  const [selectedImageId, setSelectedImageId] = useState(processedImages[0].id)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [compareSlider, setCompareSlider] = useState(50)
  const [promptNotes, setPromptNotes] = useState(
    'Apply cinematic tone; ensure brand palette (deep blues, neutral highlights). Maintain detail in architecture and skin tones.'
  )
  const [isDragging, setIsDragging] = useState(false)
  const comparisonRef = useRef<HTMLDivElement>(null)

  const selectedImage = useMemo(
    () => processedImages.find((image) => image.id === selectedImageId) ?? processedImages[0],
    [selectedImageId]
  )

  const allSelected = selectedImages.size === processedImages.length

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(new Set(processedImages.map((img) => img.id)))
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
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <div className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 p-2 text-white">
              <ImageIcon className="h-4 w-4" />
            </div>
            <span>i2i</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="text-muted-foreground transition hover:text-foreground">
              <Home className="mr-2 inline-block h-4 w-4 align-text-bottom" />
              Home
            </Link>
            <Link href="/orders" className="text-muted-foreground transition hover:text-foreground">
              <ListChecks className="mr-2 inline-block h-4 w-4 align-text-bottom" />
              My Orders
            </Link>
            <Link href="/api-docs" className="text-muted-foreground transition hover:text-foreground">
              <Code2 className="mr-2 inline-block h-4 w-4 align-text-bottom" />
              API
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full px-4 py-8 lg:w-3/4">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr_320px]">
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
              <CardContent className="space-y-2">
                {projects.map((project) => {
                  const isActive = project.id === activeProject
                  return (
                    <button
                      key={project.id}
                      onClick={() => setActiveProject(project.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                        isActive
                          ? 'border-transparent bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white shadow-sm'
                          : 'border-muted hover:border-foreground/40 hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Folder className="h-4 w-4" />
                        {project.name}
                      </div>
                      <p className={`text-xs ${isActive ? 'text-blue-50/90' : 'text-muted-foreground'}`}>
                        {project.visuals} visuals · {project.status}
                      </p>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

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
                    {activityLog.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                        <Badge variant="outline" className="min-w-[48px] justify-center text-xs font-semibold">
                          {entry.time}
                        </Badge>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{entry.actor}</p>
                          <p className="text-sm text-muted-foreground">{entry.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
                </div>
              </div>

              <ScrollArea className="w-full">
                <div className="flex gap-3 pb-3">
                {processedImages.map((image) => {
                  const isSelected = selectedImages.has(image.id)
                  const isActive = image.id === selectedImageId

                  return (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageId(image.id)}
                      className={`group relative w-44 shrink-0 overflow-hidden rounded-xl border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive ? 'border-blue-600 ring-2 ring-blue-200' : 'border-muted hover:border-foreground/40'
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

          <aside className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full gap-2" disabled={selectedImages.size === 0}>
                  <Wand2 className="h-4 w-4" />
                  Retouch
                </Button>
                <Button variant="outline" className="w-full gap-2" disabled={selectedImages.size === 0}>
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button variant="outline" className="w-full gap-2" disabled={selectedImages.size === 0}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="w-full gap-2" disabled={selectedImages.size === 0}>
                  <Send className="h-4 w-4" />
                  Send to DAM
                </Button>
                <Button variant="destructive" className="w-full gap-2" disabled={selectedImages.size === 0}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <p className="pt-1 text-xs text-muted-foreground">
                  Select one or more visuals to enable actions.
                </p>
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

