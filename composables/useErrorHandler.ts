// composables/useErrorHandler.ts
import { useToast } from '~/composables/useToast'

export interface ErrorInfo {
  id: string
  message: string
  stack?: string
  timestamp: string
  userId?: string
  url: string
  userAgent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'api' | 'ui' | 'auth' | 'payment' | 'network' | 'validation' | 'unknown'
  context?: Record<string, any>
  handled: boolean
}

export interface ErrorState {
  errors: ErrorInfo[]
  globalError: ErrorInfo | null
  isOffline: boolean
  retryQueue: Array<{ fn: Function; attempts: number; maxAttempts: number }>
}

export const useErrorHandler = () => {
  const route = useRoute()
  const { state: wsState } = useWebSocket()
  
  // State
  const errorState = reactive<ErrorState>({
    errors: [],
    globalError: null,
    isOffline: false,
    retryQueue: []
  })

  // Generate error ID
  const generateErrorId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  // Categorize error based on message/type
  const categorizeError = (error: Error | string): ErrorInfo['category'] => {
    const message = typeof error === 'string' ? error : error.message
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('fetch') || lowerMessage.includes('network')) return 'network'
    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized')) return 'auth'
    if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) return 'payment'
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) return 'validation'
    if (lowerMessage.includes('api') || lowerMessage.includes('server')) return 'api'
    return 'unknown'
  }

  // Determine severity
  const determineSeverity = (error: Error | string, category: ErrorInfo['category']): ErrorInfo['severity'] => {
    const message = typeof error === 'string' ? error : error.message
    
    // Critical errors
    if (category === 'payment' || message.includes('critical') || message.includes('security')) {
      return 'critical'
    }
    
    // High severity
    if (category === 'auth' || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'high'
    }
    
    // Medium severity
    if (category === 'api' || category === 'network') {
      return 'medium'
    }
    
    // Low severity
    return 'low'
  }

  // Handle error with context
  const handleError = (
    error: Error | string,
    context?: Record<string, any>,
    shouldThrow = false
  ): ErrorInfo => {
    const authStore = useAuthStore()
    
    const errorInfo: ErrorInfo = {
      id: generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: new Date().toISOString(),
      userId: authStore.user?.id,
      url: route.fullPath,
      userAgent: process.client ? navigator.userAgent : 'server',
      severity: 'medium',
      category: 'unknown',
      context,
      handled: true
    }

    // Categorize and set severity
    errorInfo.category = categorizeError(error)
    errorInfo.severity = determineSeverity(error, errorInfo.category)

    // Add to error list
    errorState.errors.push(errorInfo)

    // Set as global error if critical
    if (errorInfo.severity === 'critical') {
      errorState.globalError = errorInfo
    }

    // Log to console in development
    if (process.dev) {
      console.error('Error handled:', errorInfo)
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      reportError(errorInfo)
    }

    // Show user notification based on severity
    showErrorNotification(errorInfo)

    // Throw if requested
    if (shouldThrow) {
      throw error
    }

    return errorInfo
  }

  // Handle API errors specifically
  const handleApiError = (error: any, endpoint?: string) => {
    let message = 'An error occurred'
    let category: ErrorInfo['category'] = 'api'
    let severity: ErrorInfo['severity'] = 'medium'

    if (error.status) {
      switch (error.status) {
        case 400:
          message = error.data?.message || 'Bad request'
          category = 'validation'
          severity = 'low'
          break
        case 401:
          message = 'You need to log in to continue'
          category = 'auth'
          severity = 'high'
          // Auto-redirect to login
          const authStore = useAuthStore()
          authStore.logout()
          break
        case 403:
          message = 'You don\'t have permission to perform this action'
          category = 'auth'
          severity = 'high'
          break
        case 404:
          message = 'The requested resource was not found'
          severity = 'low'
          break
        case 409:
          message = error.data?.message || 'Conflict occurred'
          category = 'validation'
          severity = 'medium'
          break
        case 429:
          message = 'Too many requests. Please slow down.'
          severity = 'medium'
          break
        case 500:
          message = 'Internal server error. Please try again later.'
          severity = 'high'
          break
        case 503:
          message = 'Service temporarily unavailable'
          severity = 'high'
          break
        default:
          message = error.data?.message || `Request failed with status ${error.status}`
      }
    } else if (error.message) {
      message = error.message
    }

    return handleError(new Error(message), {
      endpoint,
      status: error.status,
      data: error.data
    })
  }

  // Handle network errors
  const handleNetworkError = (error: any) => {
    let message = 'Network error occurred'
    
    if (!navigator.onLine) {
      errorState.isOffline = true
      message = 'You are currently offline'
    } else if (error.message?.includes('timeout')) {
      message = 'Request timed out. Please check your connection.'
    } else if (error.message?.includes('fetch')) {
      message = 'Unable to connect to server'
    }

    return handleError(new Error(message), { 
      originalError: error.message,
      isOffline: !navigator.onLine 
    })
  }

  // Show user-friendly error notification
  const showErrorNotification = (errorInfo: ErrorInfo) => {
    // This would integrate with your toast/notification system
    if (process.client) {
      const { $toast } = useNuxtApp()
      
      let title = 'Error'
      let type = 'error'
      
      switch (errorInfo.severity) {
        case 'critical':
          title = 'Critical Error'
          type = 'error'
          break
        case 'high':
          title = 'Error'
          type = 'error'
          break
        case 'medium':
          title = 'Warning'
          type = 'warning'
          break
        case 'low':
          title = 'Notice'
          type = 'info'
          break
      }

      // Show toast notification
      const toast = useToast()
      if (toast) {
        const toastOptions = {
          title,
          message: errorInfo.message,
          type,
          duration: errorInfo.severity === 'critical' ? 10000 : 5000
        }
        
        switch(type) {
          case 'error':
            toast.error(title, errorInfo.message, { duration: toastOptions.duration })
            break
          case 'warning':
            toast.warning(title, errorInfo.message, { duration: toastOptions.duration })
            break
          case 'info':
            toast.info(title, errorInfo.message, { duration: toastOptions.duration })
            break
          default:
            toast.error(title, errorInfo.message, { duration: toastOptions.duration })
        }
      }
    }
  }

  // Report error to external service
  const reportError = async (errorInfo: ErrorInfo) => {
    try {
      // Only report medium+ severity errors
      if (errorInfo.severity === 'low') return

      await $fetch('/api/errors/report', {
        method: 'POST',
        body: {
          ...errorInfo,
          // Remove sensitive data
          stack: process.env.NODE_ENV === 'development' ? errorInfo.stack : undefined
        }
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  // Retry mechanism for failed operations
  const retry = async <T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2
  ): Promise<T> => {
    let lastError: any

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxAttempts) {
          handleError(error as Error, { 
            attemptCount: attempt,
            maxAttempts,
            operation: operation.name || 'anonymous'
          })
          break
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }

    throw lastError
  }

  // Clear errors
  const clearErrors = () => {
    errorState.errors = []
    errorState.globalError = null
  }

  const clearError = (errorId: string) => {
    errorState.errors = errorState.errors.filter(e => e.id !== errorId)
    if (errorState.globalError?.id === errorId) {
      errorState.globalError = null
    }
  }

  // Get errors by category
  const getErrorsByCategory = (category: ErrorInfo['category']) => {
    return errorState.errors.filter(e => e.category === category)
  }

  // Get errors by severity
  const getErrorsBySeverity = (severity: ErrorInfo['severity']) => {
    return errorState.errors.filter(e => e.severity === severity)
  }

  // Global error handler setup
  if (process.client) {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new Error(event.reason))
      event.preventDefault()
    })

    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      handleError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    // Monitor online/offline status
    window.addEventListener('online', () => {
      errorState.isOffline = false
      // Process retry queue
      processRetryQueue()
    })

    window.addEventListener('offline', () => {
      errorState.isOffline = true
    })
  }

  // Process retry queue when back online
  const processRetryQueue = async () => {
    if (errorState.isOffline) return

    const queue = [...errorState.retryQueue]
    errorState.retryQueue = []

    for (const item of queue) {
      try {
        await item.fn()
      } catch (error) {
        item.attempts++
        if (item.attempts < item.maxAttempts) {
          errorState.retryQueue.push(item)
        } else {
          handleError(error as Error, { retriesExhausted: true })
        }
      }
    }
  }

  // Add to retry queue
  const addToRetryQueue = (fn: Function, maxAttempts = 3) => {
    errorState.retryQueue.push({ fn, attempts: 0, maxAttempts })
  }

  return {
    // State
    errorState: readonly(errorState),
    
    // Error handlers
    handleError,
    handleApiError,
    handleNetworkError,
    
    // Utilities
    retry,
    clearErrors,
    clearError,
    getErrorsByCategory,
    getErrorsBySeverity,
    addToRetryQueue,
    
    // Computed
    hasErrors: computed(() => errorState.errors.length > 0),
    hasCriticalErrors: computed(() => 
      errorState.errors.some(e => e.severity === 'critical')
    ),
    isOffline: computed(() => errorState.isOffline)
  }
}
