/**
 * Storage utility with IndexedDB fallback for large data
 * Handles QuotaExceededError gracefully by falling back to IndexedDB
 */

const DB_NAME = 'i2i-storage'
const DB_VERSION = 1
const STORE_NAME = 'pendingData'

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// Store data with sessionStorage fallback to IndexedDB
export const setPendingOrder = async (data) => {
  const dataString = JSON.stringify(data)
  const key = 'pendingOrder'
  
  try {
    // Try sessionStorage first (faster, but limited size)
    sessionStorage.setItem(key, dataString)
    // Clear any IndexedDB entry if sessionStorage succeeded
    try {
      const db = await initDB()
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await store.delete(key)
    } catch (e) {
      // Ignore IndexedDB errors if sessionStorage worked
    }
  } catch (error) {
    // QuotaExceededError or other storage errors
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      try {
        // Fallback to IndexedDB for large data
        const db = await initDB()
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        await new Promise((resolve, reject) => {
          const request = store.put(dataString, key)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
        
        // Store a flag in sessionStorage to indicate data is in IndexedDB
        sessionStorage.setItem(`${key}_source`, 'indexeddb')
      } catch (dbError) {
        console.error('Failed to store in IndexedDB:', dbError)
        throw new Error('Failed to store order data. Please try with fewer images.')
      }
    } else {
      throw error
    }
  }
}

// Get data from sessionStorage or IndexedDB
export const getPendingOrder = async () => {
  const key = 'pendingOrder'
  
  // Check if data is in IndexedDB
  const source = sessionStorage.getItem(`${key}_source`)
  
  if (source === 'indexeddb') {
    try {
      const db = await initDB()
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      
      return new Promise((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => {
          const data = request.result
          if (data) {
            resolve(JSON.parse(data))
          } else {
            resolve(null)
          }
        }
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to read from IndexedDB:', error)
      return null
    }
  } else {
    // Try sessionStorage
    try {
      const data = sessionStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to read from sessionStorage:', error)
      return null
    }
  }
}

// Remove data from both storage locations
export const removePendingOrder = async () => {
  const key = 'pendingOrder'
  
  // Remove from sessionStorage
  try {
    sessionStorage.removeItem(key)
    sessionStorage.removeItem(`${key}_source`)
  } catch (e) {
    // Ignore errors
  }
  
  // Remove from IndexedDB
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    await new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    // Ignore errors
  }
}
