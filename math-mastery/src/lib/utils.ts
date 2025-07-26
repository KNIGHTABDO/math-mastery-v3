import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'dd MMMM yyyy à HH:mm', { locale: fr })
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true, 
    locale: fr 
  })
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9 -]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-') // Supprimer tirets multiples
    .trim()
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getChapterColor(chapter: string) {
  const colors = {
    analyse: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    algebre: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    geometrie: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    probabilites: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  }
  return colors[chapter as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function getTypeIcon(type: string) {
  const icons = {
    cours: '📘',
    exercice: '📝',
    quiz: '📊',
    video: '🎬'
  }
  return icons[type as keyof typeof icons] || '📄'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function parseHashtags(text: string) {
  return text.match(/#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g) || []
}

export function parseLatex(text: string) {
  // Remplacer les expressions LaTeX simples
  return text
    .replace(/\$\$(.*?)\$\$/g, '<div class="math-display">$1</div>')
    .replace(/\$(.*?)\$/g, '<span class="math-inline">$1</span>')
}

export function validatePassword(password: string) {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      minLength: password.length < minLength,
      hasUpperCase: !hasUpperCase,
      hasLowerCase: !hasLowerCase,
      hasNumbers: !hasNumbers,
      hasSpecialChar: !hasSpecialChar
    }
  }
}