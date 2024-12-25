const migrations = {
  '1.0': data => data,
  '0.0': data => {
    return {
      version: '1.0',
      notes: data.notes || [],
      activity_records: data.activity_records || [],
      labeled_buckets: data.labeled_buckets || []
    }
  }
}

export const CURRENT_DATA_VERSION = Object.keys(migrations).sort().at(-1)

export function migrateData(data) {
  if (!data) return null

  const currentVersion = data.version || '0.0'
  const versions = Object.keys(migrations).sort()
  const startIdx = versions.indexOf(currentVersion)
  let migratedData = data

  // Apply migrations sequentially
  for (let i = startIdx; i < versions.length; i++) {
    const version = versions[i]
    migratedData = migrations[version](migratedData)
  }

  return migratedData
}
