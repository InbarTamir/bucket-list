import { openDB } from 'idb'
import Vue from 'vue'
import 'vue-toastification/dist/index.css'

const fileName = 'content.json'
let fileHandle

async function showError(message) {
  Vue.$toast.error(message)
}

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

export async function saveData(data) {
  try {
    const json = JSON.stringify(data)
    const blob = new Blob([json], { type: 'application/json' })

    const handle = await getFileHandle()
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
  } catch (error) {
    await showError(`Error saving data: ${error.message}`)
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
    await showError(`Error loading data: ${error.message}`)
    throw error
  }
}
