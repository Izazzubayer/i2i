import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ImageStatus = 'processing' | 'completed' | 'needs-retouch' | 'approved' | 'failed'
export type BatchStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed'

export interface ProcessedImage {
  id: string
  originalName: string
  originalUrl: string
  processedUrl: string
  status: ImageStatus
  instruction?: string
  timestamp: Date
}

export interface DamConnection {
  id: string
  name: string
  provider: string
  apiUrl: string
  workspace: string
  isConnected: boolean
  lastSync?: Date
  config: any // Full DAM config
}

export interface LogEntry {
  id: string
  message: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning'
}

export interface BatchData {
  id: string
  totalImages: number
  processedCount: number
  approvedCount: number
  retouchCount: number
  failedCount: number
  images: ProcessedImage[]
  logs: LogEntry[]
  instructions: string
  summary: string
  status: BatchStatus
  progress: number
}

interface AppState {
  batch: BatchData | null
  summaryDrawerOpen: boolean
  retouchDrawerOpen: boolean
  selectedImageForRetouch: ProcessedImage | null
  darkMode: boolean
  damConnections: DamConnection[]
  activeDamConnection: DamConnection | null
  
  // Actions
  createBatch: (id: string, instructions: string, imageCount: number) => void
  updateBatchProgress: (progress: number, status?: BatchStatus) => void
  addLog: (message: string, type?: LogEntry['type']) => void
  updateImageStatus: (imageId: string, status: ImageStatus, processedUrl?: string) => void
  setSummary: (summary: string) => void
  toggleSummaryDrawer: (open?: boolean) => void
  openRetouchDrawer: (image: ProcessedImage) => void
  closeRetouchDrawer: () => void
  resetBatch: () => void
  toggleDarkMode: () => void
  approveImage: (imageId: string) => void
  markForRetouch: (imageId: string) => void
  
  // DAM Actions
  addDamConnection: (config: any) => void
  removeDamConnection: (id: string) => void
  setActiveDamConnection: (connection: DamConnection | null) => void
  updateDamConnection: (id: string, updates: Partial<DamConnection>) => void
}

export const useStore = create<AppState>((set, get) => ({
  batch: null,
  summaryDrawerOpen: false,
  retouchDrawerOpen: false,
  selectedImageForRetouch: null,
  darkMode: false,
  damConnections: [],
  activeDamConnection: null,

  createBatch: (id, instructions, imageCount) => {
    const images: ProcessedImage[] = Array.from({ length: imageCount }, (_, i) => ({
      id: `img-${i}`,
      originalName: `image-${i + 1}.jpg`,
      originalUrl: '',
      processedUrl: '',
      status: 'processing' as ImageStatus,
      timestamp: new Date(),
    }))

    set({
      batch: {
        id,
        totalImages: imageCount,
        processedCount: 0,
        approvedCount: 0,
        retouchCount: 0,
        failedCount: 0,
        images,
        logs: [],
        instructions,
        summary: '',
        status: 'processing',
        progress: 0,
      },
    })
  },

  updateBatchProgress: (progress, status) => {
    const { batch } = get()
    if (!batch) return

    set({
      batch: {
        ...batch,
        progress,
        ...(status && { status }),
      },
    })
  },

  addLog: (message, type = 'info') => {
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
        logs: [...batch.logs, log],
      },
    })
  },

  updateImageStatus: (imageId, status, processedUrl) => {
    const { batch } = get()
    if (!batch) return

    const updatedImages = batch.images.map(img =>
      img.id === imageId
        ? { ...img, status, ...(processedUrl && { processedUrl }) }
        : img
    )

    const processedCount = updatedImages.filter(img => 
      img.status === 'completed' || img.status === 'approved'
    ).length

    set({
      batch: {
        ...batch,
        images: updatedImages,
        processedCount,
      },
    })
  },

  setSummary: (summary) => {
    const { batch } = get()
    if (!batch) return

    set({
      batch: {
        ...batch,
        summary,
      },
    })
  },

  toggleSummaryDrawer: (open) => {
    set(state => ({
      summaryDrawerOpen: open !== undefined ? open : !state.summaryDrawerOpen,
    }))
  },

  openRetouchDrawer: (image) => {
    set({
      selectedImageForRetouch: image,
      retouchDrawerOpen: true,
    })
  },

  closeRetouchDrawer: () => {
    set({
      retouchDrawerOpen: false,
      selectedImageForRetouch: null,
    })
  },

  resetBatch: () => {
    set({
      batch: null,
      summaryDrawerOpen: false,
      retouchDrawerOpen: false,
      selectedImageForRetouch: null,
    })
  },

  toggleDarkMode: () => {
    set(state => ({ darkMode: !state.darkMode }))
  },

  approveImage: (imageId) => {
    const { batch } = get()
    if (!batch) return

    const updatedImages = batch.images.map(img =>
      img.id === imageId ? { ...img, status: 'approved' as ImageStatus } : img
    )

    const approvedCount = updatedImages.filter(img => img.status === 'approved').length

    set({
      batch: {
        ...batch,
        images: updatedImages,
        approvedCount,
      },
    })
  },

  markForRetouch: (imageId) => {
    const { batch } = get()
    if (!batch) return

    const updatedImages = batch.images.map(img =>
      img.id === imageId ? { ...img, status: 'needs-retouch' as ImageStatus } : img
    )

    const retouchCount = updatedImages.filter(img => img.status === 'needs-retouch').length

    set({
      batch: {
        ...batch,
        images: updatedImages,
        retouchCount,
      },
    })
  },

  // DAM Actions
  addDamConnection: (config) => {
    const { damConnections } = get()
    const newConnection: DamConnection = {
      id: `dam-${Date.now()}`,
      name: `${config.provider} - ${config.workspace}`,
      provider: config.provider,
      apiUrl: config.apiUrl,
      workspace: config.workspace,
      isConnected: true,
      lastSync: new Date(),
      config,
    }

    set({
      damConnections: [...damConnections, newConnection],
      activeDamConnection: newConnection,
    })
  },

  removeDamConnection: (id) => {
    const { damConnections, activeDamConnection } = get()
    const updated = damConnections.filter(conn => conn.id !== id)
    
    set({
      damConnections: updated,
      activeDamConnection: activeDamConnection?.id === id ? null : activeDamConnection,
    })
  },

  setActiveDamConnection: (connection) => {
    set({ activeDamConnection: connection })
  },

  updateDamConnection: (id, updates) => {
    const { damConnections, activeDamConnection } = get()
    const updated = damConnections.map(conn =>
      conn.id === id ? { ...conn, ...updates } : conn
    )

    set({
      damConnections: updated,
      activeDamConnection: activeDamConnection?.id === id 
        ? { ...activeDamConnection, ...updates }
        : activeDamConnection,
    })
  },
}))

