export const TIME_BUCKETS = [
  { min: 0, max: 15, title: 'Up to 15 mins' },
  { min: 16, max: 30, title: 'Up to 30 mins' },
  { min: 31, max: 60, title: 'Up to 1 hour' },
  { min: 61, max: 120, title: 'Up to 2 hours' },
  { min: 121, max: Infinity, title: 'Over 2 hours' }
]

export const DATE_FORMAT_OPTIONS = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
}
