/**
 * Date utility functions
 */

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`
  }
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  if (minutes === 0) {
    return `${wholeHours}h`
  }
  return `${wholeHours}h ${minutes}m`
}

export function getDaysUntil(dateString: string): number {
  try {
    const target = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)
    const diff = target.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
}

export function getDaysSince(dateString: string): number {
  try {
    const start = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    const diff = today.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
}

export function isOverdue(dateString: string): boolean {
  return getDaysUntil(dateString) < 0
}

export function getProgressPercentage(startDate: string, endDate: string): number {
  try {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()

    const total = end - start
    const elapsed = now - start

    if (total <= 0) return 0
    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100))
    return Math.round(percentage)
  } catch {
    return 0
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}
