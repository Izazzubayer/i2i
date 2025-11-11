import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface UploadResponse {
  batchId: string
  message: string
  imageCount: number
}

export interface StatusResponse {
  progress: number
  status: string
  logs: Array<{ message: string; timestamp: string; type: string }>
}

export interface RetouchRequest {
  imageId: string
  instruction: string
}

export interface ExportRequest {
  batchId: string
  type: 'download' | 'dam'
  damUrl?: string
}

export interface DamUploadRequest {
  imageIds: string[]
  damConfig: any
  batchId: string
}

export const apiClient = {
  upload: async (images: File[], instructions: string | File): Promise<UploadResponse> => {
    const formData = new FormData()
    
    images.forEach(image => {
      formData.append('images', image)
    })
    
    if (typeof instructions === 'string') {
      formData.append('instructions', instructions)
    } else {
      formData.append('instructionFile', instructions)
    }

    const { data } = await api.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    return data
  },

  getStatus: async (batchId: string): Promise<StatusResponse> => {
    const { data } = await api.get<StatusResponse>(`/status/${batchId}`)
    return data
  },

  retouch: async (imageId: string, instruction: string): Promise<{ success: boolean; processedUrl: string }> => {
    const { data } = await api.post(`/retouch/${imageId}`, { instruction })
    return data
  },

  getResults: async (batchId: string) => {
    const { data } = await api.get(`/results/${batchId}`)
    return data
  },

  export: async (request: ExportRequest) => {
    const { data } = await api.post('/export', request, {
      responseType: request.type === 'download' ? 'blob' : 'json',
    })
    return data
  },

  uploadToDAM: async (request: DamUploadRequest) => {
    const { data } = await api.post('/dam/upload', request)
    return data
  },
}

export default apiClient

