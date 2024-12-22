import { openDB } from 'idb'
import { toast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { AppContent } from '@/utils/dto'

const fileName = 'notes-dashboard.json'
let fileHandle

async function getFileHandle() {
  try {
    if (fileHandle) return fileHandle

    const storedHandle = await getStoredFileHandle()
    if (storedHandle) {
      fileHandle = storedHandle
      return fileHandle
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
    toast.error(`Error getting file handle: ${error.message}`)
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
    await db.put('handles', handle, 'notes-dashboard')
  } catch (error) {
    toast.error(`Error storing file handle: ${error.message}`)
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
    return await db.get('handles', 'notes-dashboard')
  } catch (error) {
    toast.error(`Error getting stored file handle: ${error.message}`)
    throw error
  }
}

// TODO:
export async function saveData(data) {
  try {
    const json = JSON.stringify(data)
    const blob = new Blob([json], { type: 'application/json' })

    const handle = await getFileHandle()
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
  } catch (error) {
    toast.error(`Error saving data: ${error.message}`)
    throw error
  }
}

export async function loadData() {
  try {
    const handle = await getFileHandle()
    const file = await handle.getFile()
    const text = await file.text()
    return JSON.parse(text)
  } catch (error) {
    toast.error(`Error loading data: ${error.message}`)
    throw error
  }
}
