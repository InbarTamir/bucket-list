const migrations = {
  '1.0': data => data, // Current version - no changes needed
  '0.0': data => {
    // Convert from unversioned data to version 1.0
    return {
      version: '1.0', // Add version field
      notes: data.notes || [], // Ensure arrays exist
      activity_records: data.activity_records || [],
      labeled_buckets: data.labeled_buckets || []
    }
  }
}

export function migrateData(data) {
  if (!data) return null

  const currentVersion = data.version || '0.0'
  const versions = Object.keys(migrations).sort()
  const targetVersion = versions[versions.length - 1]

  if (currentVersion === targetVersion) {
    return data
  }

  console.log(`Migrating data from version ${currentVersion} to ${targetVersion}`)
  return migrations[targetVersion](data)
}
