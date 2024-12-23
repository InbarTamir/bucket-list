import { openDB } from 'idb'
import Vue from 'vue'
import 'vue-toastification/dist/index.css'

const fileName = 'content.json'
let fileHandle

async function showError(message) {
  Vue.$toast.error(message)
}

async function getFileHandle(userInitiated = false) {
  try {
    if (fileHandle) return fileHandle

    const storedHandle = await getStoredFileHandle()
    if (storedHandle) {
      fileHandle = storedHandle
      return fileHandle
    }

    if (!userInitiated) {
      throw new Error('File access requires user interaction')
    }

    if ('showSaveFilePicker' in window) {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }
        ]
      })
      await storeFileHandle(fileHandle)
      return fileHandle
    } else {
      throw new Error('File System Access API is not supported in this browser.')
    }
  } catch (error) {
    await showError(`Error getting file handle: ${error.message}`)
    throw error
  }
}

async function storeFileHandle(handle) {
  try {
    const db = await openDB('file-handles', 1, {
      upgrade(db) {
        db.createObjectStore('handles')
      }
    })
    await db.put('handles', handle, 'bucket-list')
  } catch (error) {
    await showError(`Error storing file handle: ${error.message}`)
    throw error
  }
}

async function getStoredFileHandle() {
  try {
    const db = await openDB('file-handles', 1, {
      upgrade(db) {
        db.createObjectStore('handles')
      }
    })
    return await db.get('handles', 'bucket-list')
  } catch (error) {
    await showError(`Error getting stored file handle: ${error.message}`)
    throw error
  }
}

async function tryFetchFile() {
  try {
    // Try to load content.template.json for new installations
    const basePath = process.env.NODE_ENV === 'production' ? '/bucket-list' : ''
    const response = await fetch(`${basePath}/content.template.json`)
    if (!response.ok) throw new Error('Failed to fetch content.template.json')
    return await response.json()
  } catch (error) {
    console.log('Template load failed:', error)
    return null
  }
}

// Remove original saveData and loadData functions
// Keep only backup-related functions
export async function downloadBackup(data) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = getBackupFileName()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function uploadBackup() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async e => {
      const file = e.target.files[0]
      if (!file) return reject(new Error('No file selected'))

      try {
        const text = await file.text()
        resolve(JSON.parse(text))
      } catch (error) {
        reject(new Error('Invalid backup file'))
      }
    }

    input.click()
  })
}

// Helper function
function getBackupFileName() {
  const date = new Date().toISOString().split('T')[0]
  return `bucket-list-backup-${date}.json`
}
