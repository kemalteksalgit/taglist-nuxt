// composables/usePWA.ts
export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAUpdateInfo {
  updateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  waitingWorker: ServiceWorker | null
}

export const usePWA = () => {
  const isInstalled = ref(false)
  const isInstallable = ref(false)
  const installPrompt = ref<PWAInstallPrompt | null>(null)
  const updateInfo = ref<PWAUpdateInfo>({
    updateAvailable: false,
    registration: null,
    waitingWorker: null
  })
  const isOnline = ref(true)
  const connectionType = ref<string>('unknown')

  // Check if app is already installed
  const checkInstallStatus = () => {
    if (process.client) {
      // Check for standalone mode (iOS Safari)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      
      // Check for PWA mode
      const isPWA = (window.navigator as any).standalone === true || isStandalone
      
      isInstalled.value = isPWA
    }
  }

  // Handle install prompt
  const handleInstallPrompt = () => {
    if (process.client) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        installPrompt.value = e as any
        isInstallable.value = true
      })

      // Handle successful installation
      window.addEventListener('appinstalled', () => {
        isInstalled.value = true
        isInstallable.value = false
        installPrompt.value = null
        
        // Track installation
        const analytics = useAnalytics()
        analytics.trackEvent({
          event: 'pwa_install',
          category: 'pwa',
          action: 'install',
          label: 'successful'
        })
      })
    }
  }

  // Install PWA
  const installPWA = async () => {
    if (!installPrompt.value) return { success: false, error: 'Install prompt not available' }

    try {
      await installPrompt.value.prompt()
      const choiceResult = await installPrompt.value.userChoice

      if (choiceResult.outcome === 'accepted') {
        return { success: true }
      } else {
        return { success: false, error: 'User dismissed install prompt' }
      }
    } catch (error) {
      return { success: false, error: 'Install failed' }
    }
  }

  // Service Worker management
  const registerServiceWorker = async () => {
    if (process.client && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        updateInfo.value.registration = registration

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                updateInfo.value.updateAvailable = true
                updateInfo.value.waitingWorker = newWorker
                
                // Show update notification
                showUpdateNotification()
              }
            })
          }
        })

        return { success: true, registration }
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return { success: false, error }
      }
    }
    
    return { success: false, error: 'Service Worker not supported' }
  }

  // Update app
  const updateApp = () => {
    if (updateInfo.value.waitingWorker) {
      updateInfo.value.waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      
      // Listen for controlling change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }

  // Show update notification
  const showUpdateNotification = () => {
    // You can integrate with your toast/notification system here
    console.log('App update available!')
    
    // Track update available
    const analytics = useAnalytics()
    analytics.trackEvent({
      event: 'pwa_update_available',
      category: 'pwa',
      action: 'update',
      label: 'available'
    })
  }

  // Network status monitoring
  const monitorNetworkStatus = () => {
    if (process.client) {
      const updateOnlineStatus = () => {
        isOnline.value = navigator.onLine
        
        // Get connection info if available
        const connection = (navigator as any).connection
        if (connection) {
          connectionType.value = connection.effectiveType || 'unknown'
        }
      }

      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      
      // Initial check
      updateOnlineStatus()
      
      // Cleanup
      onUnmounted(() => {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
      })
    }
  }

  // Offline data management
  const cacheData = async (key: string, data: any) => {
    if (process.client && 'caches' in window) {
      try {
        const cache = await caches.open('taglist-data-v1')
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        })
        await cache.put(key, response)
        return { success: true }
      } catch (error) {
        return { success: false, error }
      }
    }
    return { success: false, error: 'Cache API not supported' }
  }

  const getCachedData = async (key: string) => {
    if (process.client && 'caches' in window) {
      try {
        const cache = await caches.open('taglist-data-v1')
        const response = await cache.match(key)
        
        if (response) {
          const data = await response.json()
          return { success: true, data }
        }
        
        return { success: false, error: 'No cached data found' }
      } catch (error) {
        return { success: false, error }
      }
    }
    return { success: false, error: 'Cache API not supported' }
  }

  // Share API
  const shareContent = async (shareData: {
    title?: string
    text?: string
    url?: string
    files?: File[]
  }) => {
    if (process.client && navigator.share) {
      try {
        await navigator.share(shareData)
        
        // Track share
        const analytics = useAnalytics()
        analytics.trackEvent({
          event: 'content_share',
          category: 'engagement',
          action: 'share',
          label: shareData.title || 'unknown'
        })
        
        return { success: true }
      } catch (error) {
        const err = error as any
        if (err?.name !== 'AbortError') {
          return { success: false, error }
        }
        return { success: false, error: 'Share cancelled' }
      }
    }
    
    // Fallback for browsers without native share
    if (process.client && shareData.url) {
      try {
        await navigator.clipboard.writeText(shareData.url)
        return { success: true, method: 'clipboard' }
      } catch (error) {
        return { success: false, error: 'Share not supported' }
      }
    }
    
    return { success: false, error: 'Share not supported' }
  }

  // Background sync for offline actions
  const scheduleBackgroundSync = async (tag: string, data: any) => {
    if (process.client && 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        
        // Store data for sync
        await cacheData(`sync-${tag}`, data)
        
        // Register background sync
        await (registration as any).sync?.register(tag)
        
        return { success: true }
      } catch (error) {
        return { success: false, error }
      }
    }
    
    return { success: false, error: 'Background sync not supported' }
  }

  // App shortcuts management
  const addShortcut = (shortcut: {
    name: string
    url: string
    iconUrl?: string
  }) => {
    // This would typically involve updating the manifest dynamically
    // For now, we'll just track the intent
    const analytics = useAnalytics()
    analytics.trackEvent({
      event: 'shortcut_add',
      category: 'pwa',
      action: 'shortcut',
      label: shortcut.name
    })
  }

  // Battery status (where supported)
  const getBatteryInfo = async () => {
    if (process.client && 'getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        
        return {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        }
      } catch (error) {
        return null
      }
    }
    
    return null
  }

  // Notification permission and scheduling
  const requestNotificationPermission = async () => {
    if (process.client && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  const showNotification = async (title: string, options?: NotificationOptions) => {
    if (process.client && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        return registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          ...options
        })
      } else {
        return new Notification(title, options)
      }
    }
  }

  // Initialize PWA features
  const initPWA = async () => {
    checkInstallStatus()
    handleInstallPrompt()
    monitorNetworkStatus()
    await registerServiceWorker()
  }

  // Lifecycle
  onMounted(() => {
    if (process.client) {
      initPWA()
    }
  })

  return {
    // State
    isInstalled: readonly(isInstalled),
    isInstallable: readonly(isInstallable),
    updateInfo: readonly(updateInfo),
    isOnline: readonly(isOnline),
    connectionType: readonly(connectionType),
    
    // Methods
    installPWA,
    updateApp,
    cacheData,
    getCachedData,
    shareContent,
    scheduleBackgroundSync,
    addShortcut,
    getBatteryInfo,
    requestNotificationPermission,
    showNotification
  }
}
