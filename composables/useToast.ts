// composables/useToast.ts
import { readonly } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

// Global composable
export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      duration: toast.duration ?? 5000
    }
    
    // Use direct array mutation for reactivity
    toasts.value = [...toasts.value, newToast]
    
    // Auto remove after duration
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(newToast.id)
      }, newToast.duration)
    }
    
    return newToast.id
  }

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const clearAll = () => {
    toasts.value = []
  }

  const success = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', title, message, ...options })
  }

  const error = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', title, message, ...options })
  }

  const warning = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', title, message, ...options })
  }

  const info = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', title, message, ...options })
  }

  return {
    toasts: readonly(toasts),
    success,
    error,
    warning,
    info,
    addToast,
    removeToast,
    clearAll
  }
}
