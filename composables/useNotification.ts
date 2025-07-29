// composables/useNotification.ts
import { ref, reactive } from 'vue'

export interface NotificationOptions {
  duration?: number
  closable?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  showIcon?: boolean
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration: number
  closable: boolean
  position: string
  showIcon: boolean
  timestamp: number
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const addNotification = (
    type: Notification['type'],
    title: string,
    message?: string,
    options: NotificationOptions = {}
  ) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      duration: options.duration ?? 5000,
      closable: options.closable ?? true,
      position: options.position ?? 'top-right',
      showIcon: options.showIcon ?? true,
      timestamp: Date.now()
    }

    notifications.value.push(notification)

    // Auto remove notification
    if (notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }

    return notification.id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    notifications.value.splice(0)
  }

  const success = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification('success', title, message, options)
  }

  const error = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification('error', title, message, options)
  }

  const warning = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification('warning', title, message, options)
  }

  const info = (title: string, message?: string, options?: NotificationOptions) => {
    return addNotification('info', title, message, options)
  }

  return {
    notifications: readonly(notifications),
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}

// Global notification instance
const globalNotification = useNotification()

// Plugin for providing $notification globally
export default defineNuxtPlugin(() => {
  return {
    provide: {
      notification: globalNotification
    }
  }
})
