import { openDB } from 'idb'
import { migrateData } from './migrations'

const DB_NAME = 'bucket-list-db'
const STORE_NAME = 'app-data'
const DB_VERSION = 1
const MAX_SIZE_MB = 50 // Maximum size in megabytes
const REQUIRED_FIELDS = ['notes', 'activity_records', 'labeled_buckets']
export const CURRENT_DATA_VERSION = '1.0'

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // Only create store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

function validateData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format')
  }

  for (const field of REQUIRED_FIELDS) {
    if (!Array.isArray(data[field])) {
      throw new Error(`Missing or invalid ${field} array`)
    }
  }
  return true
}

function validateDataVersion(data) {
  if (!data.version) {
    // Add version to older data format
    data.version = CURRENT_DATA_VERSION
  }
  return data
}

export async function saveToIndexedDB(data) {
  try {
    validateData(data)
    const versionedData = validateDataVersion(data)
    // Check data size before saving
    const size = new Blob([JSON.stringify(versionedData)]).size / (1024 * 1024)
    if (size > MAX_SIZE_MB) {
      throw new Error(`Data size (${Math.round(size)}MB) exceeds limit (${MAX_SIZE_MB}MB)`)
    }

    const db = await getDB()
    await db.put(STORE_NAME, versionedData, 'app-state')
    console.log(`Data saved to IndexedDB successfully (${Math.round(size * 100) / 100}MB)`)
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error)
    throw new Error('Failed to save data to browser storage')
  }
}

export async function loadFromIndexedDB() {
  try {
    const db = await getDB()
    const data = await db.get(STORE_NAME, 'app-state')
    if (data) {
      const migratedData = migrateData(data)
      return validateDataVersion(migratedData)
    }
    return null
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error)
    return null
  }
}

export async function isIndexedDBAvailable() {
  try {
    const db = await getDB()
    return !!db
  } catch {
    return false
  }
}
