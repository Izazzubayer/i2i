import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiClient = {
  upload: async (images, instructions) => {
    const formData = new FormData()
    
    images.forEach(image => {
      formData.append('images', image)
    })
    
    if (typeof instructions === 'string') {
      formData.append('instructions', instructions)
    } else {
      formData.append('instructionFile', instructions)
    }

    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    return data
  },

  getStatus: async (batchId) => {
    const { data } = await api.get(`/status/${batchId}`)
    return data
  },

  retouch: async (imageId, instruction) => {
    const { data } = await api.post(`/retouch/${imageId}`, { instruction })
    return data
  },

  getResults: async (batchId) => {
    const { data } = await api.get(`/results/${batchId}`)
    return data
  },

  export: async (request) => {
    const { data } = await api.post('/export', request, {
      responseType: request.type === 'download' ? 'blob' : 'json',
    })
    return data
  },

  uploadToDAM: async (request) => {
    const { data } = await api.post('/dam/upload', request) 
    return data
  },
}

export default apiClient

