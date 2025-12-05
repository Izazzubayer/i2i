import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create((set, get) => ({
  batch: null,
  summaryDrawerOpen: false,
  retouchDrawerOpen: false,
  selectedImageForRetouch: null,
  darkMode: false,
  damConnections: [],
  activeDamConnection: null,

  createBatch: (id, instructions, imageCount) => {
    const images = Array.from({ length: imageCount }, (_, i) => ({
      id: `img-${i}`,
      originalName: `image-${i + 1}.jpg`,
      originalUrl: '',
      processedUrl: '',
      status: 'processing',
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

    const log = {
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
      img.id === imageId ? { ...img, status: 'approved' } : img
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
      img.id === imageId ? { ...img, status: 'needs-retouch' } : img
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
    const newConnection = {
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

