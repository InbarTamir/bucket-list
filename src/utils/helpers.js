export default {
  formatDateTime: date => {
    if (!date) return '-'
    try {
      const dateObj = new Date(date)
      return dateObj.toLocaleString()
    } catch (e) {
      console.error('Invalid date:', e)
      return 'Invalid Date'
    }
  }
}
