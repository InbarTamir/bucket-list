import Vue from 'vue'

async function showError(message) {
  Vue.$toast.error(message)
}

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

function getBackupFileName() {
  const date = new Date().toISOString().split('T')[0]
  return `bucket-list-backup-${date}.json`
}
