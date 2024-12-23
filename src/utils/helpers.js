import { DATE_FORMAT_OPTIONS } from './constants'

export default {
  formatDateTime: date => {
    if (!date) return '-'
    try {
      const dateObj = new Date(date)
      return dateObj.toLocaleString(undefined, DATE_FORMAT_OPTIONS)
    } catch (e) {
      console.error('Invalid date:', e)
      return 'Invalid Date'
    }
  }
}
