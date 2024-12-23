# Bucket List

A Vue.js application for managing tasks and activities.

## Data Storage

The application uses IndexedDB for persistent storage. Your data is stored locally in your browser and persists between sessions.

### Import/Export

- Use the Export button to download a backup of your data
- Use the Import button to restore from a backup file
- Backups are saved as JSON files with timestamp in the filename

### Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run serve`
4. Build for production: `npm run build`

### Browser Support

- Requires a modern browser with IndexedDB support
- File System Access API support is optional (used only for backup/restore)
