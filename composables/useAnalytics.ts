// composables/useAnalytics.ts
export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  label?: string
  value?: number
  properties?: Record<string, any>
}

export interface UserSession {
  sessionId: string
  userId?: string
  startTime: Date
  lastActivity: Date
  pageViews: number
  events: AnalyticsEvent[]
  device: {
    type: 'mobile' | 'tablet' | 'desktop'
    os: string
    browser: string
    screenResolution: string
  }
  location: {
    country?: string
    city?: string
    timezone: string
  }
}

export const useAnalytics = () => {
  const session = ref<UserSession | null>(null)
  const config = useRuntimeConfig()

  // Initialize session
  const initSession = () => {
    if (process.client) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      session.value = {
        sessionId,
        startTime: new Date(),
        lastActivity: new Date(),
        pageViews: 0,
        events: [],
        device: {
          type: getDeviceType(),
          os: getOS(),
          browser: getBrowser(),
          screenResolution: `${screen.width}x${screen.height}`
        },
        location: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }

      // Store session in localStorage
      localStorage.setItem('taglist_session', JSON.stringify(session.value))
    }
  }

  // Track page view
  const trackPageView = (path: string, title?: string) => {
    if (!session.value) return

    session.value.pageViews++
    session.value.lastActivity = new Date()

    const event: AnalyticsEvent = {
      event: 'page_view',
      category: 'navigation',
      action: 'view',
      label: path,
      properties: {
        title: title || document.title,
        path,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
      }
    }

    trackEvent(event)

    // Update session in localStorage
    if (process.client) {
      localStorage.setItem('taglist_session', JSON.stringify(session.value))
    }
  }

  // Track custom event
  const trackEvent = (event: AnalyticsEvent) => {
    if (!session.value) return

    session.value.events.push({
      ...event,
      properties: {
        ...event.properties,
        sessionId: session.value.sessionId,
        timestamp: new Date().toISOString()
      }
    })

    // Send to analytics service
    sendToAnalytics(event)
  }

  // E-commerce tracking
  const trackPurchase = (transactionId: string, items: Array<{
    itemId: string
    itemName: string
    category: string
    price: number
    quantity: number
  }>, totalValue: number) => {
    trackEvent({
      event: 'purchase',
      category: 'ecommerce',
      action: 'purchase',
      label: transactionId,
      value: totalValue,
      properties: {
        transactionId,
        items,
        totalValue,
        currency: 'TRY'
      }
    })
  }

  // Product interaction tracking
  const trackProductView = (productId: string, productName: string, category: string, price: number) => {
    trackEvent({
      event: 'view_item',
      category: 'ecommerce',
      action: 'view',
      label: productName,
      value: price,
      properties: {
        productId,
        productName,
        category,
        price,
        currency: 'TRY'
      }
    })
  }

  const trackAddToFavorites = (productId: string, productName: string, category: string) => {
    trackEvent({
      event: 'add_to_favorites',
      category: 'ecommerce',
      action: 'favorite',
      label: productName,
      properties: {
        productId,
        productName,
        category
      }
    })
  }

  const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent({
      event: 'search',
      category: 'engagement',
      action: 'search',
      label: searchTerm,
      value: resultsCount,
      properties: {
        searchTerm,
        resultsCount
      }
    })
  }

  // Livestream tracking
  const trackLivestreamJoin = (streamId: string, streamTitle: string, sellerId: string) => {
    trackEvent({
      event: 'livestream_join',
      category: 'livestream',
      action: 'join',
      label: streamTitle,
      properties: {
        streamId,
        streamTitle,
        sellerId
      }
    })
  }

  const trackLivestreamPurchase = (streamId: string, productId: string, productName: string, price: number) => {
    trackEvent({
      event: 'livestream_purchase',
      category: 'livestream',
      action: 'purchase',
      label: productName,
      value: price,
      properties: {
        streamId,
        productId,
        productName,
        price,
        currency: 'TRY'
      }
    })
  }

  const trackLivestreamGift = (streamId: string, giftId: string, giftName: string, giftValue: number) => {
    trackEvent({
      event: 'livestream_gift',
      category: 'livestream',
      action: 'gift',
      label: giftName,
      value: giftValue,
      properties: {
        streamId,
        giftId,
        giftName,
        giftValue,
        currency: 'TRY'
      }
    })
  }

  // User behavior tracking
  const trackUserRegistration = (method: 'email' | 'social' | 'phone') => {
    trackEvent({
      event: 'user_registration',
      category: 'user',
      action: 'register',
      label: method,
      properties: {
        method
      }
    })
  }

  const trackUserLogin = (method: 'email' | 'social' | 'phone') => {
    trackEvent({
      event: 'user_login',
      category: 'user',
      action: 'login',
      label: method,
      properties: {
        method
      }
    })
  }

  // Performance tracking
  const trackPerformance = () => {
    if (process.client && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      trackEvent({
        event: 'performance',
        category: 'technical',
        action: 'timing',
        label: 'page_load',
        value: Math.round(navigation.loadEventEnd - navigation.fetchStart),
        properties: {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
          firstPaint: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0),
          firstContentfulPaint: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
          networkType: (navigator as any).connection?.effectiveType || 'unknown'
        }
      })
    }
  }

  // Error tracking
  const trackError = (error: Error, context?: string) => {
    trackEvent({
      event: 'error',
      category: 'technical',
      action: 'error',
      label: error.message,
      properties: {
        errorMessage: error.message,
        errorStack: error.stack,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    })
  }

  // Send data to analytics service
  const sendToAnalytics = async (event: AnalyticsEvent) => {
    try {
      // Send to your analytics service (Google Analytics, custom API, etc.)
      if (config.public.apiBase) {
        await $fetch(`${config.public.apiBase}/analytics/track`, {
          method: 'POST',
          body: event
        })
      }

      // Google Analytics 4 tracking (if gtag is available)
      if (process.client && typeof (globalThis as any).gtag !== 'undefined') {
        (globalThis as any).gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          custom_parameters: event.properties
        })
      }
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }

  // Utility functions
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (process.client) {
      const width = window.innerWidth
      if (width < 768) return 'mobile'
      if (width < 1024) return 'tablet'
      return 'desktop'
    }
    return 'desktop'
  }

  const getOS = (): string => {
    if (process.client) {
      const userAgent = navigator.userAgent
      if (userAgent.includes('Windows')) return 'Windows'
      if (userAgent.includes('Mac')) return 'macOS'
      if (userAgent.includes('Linux')) return 'Linux'
      if (userAgent.includes('Android')) return 'Android'
      if (userAgent.includes('iOS')) return 'iOS'
    }
    return 'Unknown'
  }

  const getBrowser = (): string => {
    if (process.client) {
      const userAgent = navigator.userAgent
      if (userAgent.includes('Chrome')) return 'Chrome'
      if (userAgent.includes('Firefox')) return 'Firefox'
      if (userAgent.includes('Safari')) return 'Safari'
      if (userAgent.includes('Edge')) return 'Edge'
    }
    return 'Unknown'
  }

  // Session management
  const updateUserInfo = (userId: string) => {
    if (session.value) {
      session.value.userId = userId
      if (process.client) {
        localStorage.setItem('taglist_session', JSON.stringify(session.value))
      }
    }
  }

  const endSession = () => {
    if (session.value) {
      trackEvent({
        event: 'session_end',
        category: 'user',
        action: 'session',
        label: 'end',
        properties: {
          sessionDuration: new Date().getTime() - session.value.startTime.getTime(),
          pageViews: session.value.pageViews,
          totalEvents: session.value.events.length
        }
      })

      session.value = null
      if (process.client) {
        localStorage.removeItem('taglist_session')
      }
    }
  }

  // Initialize on composable creation
  if (process.client && !session.value) {
    // Try to restore session from localStorage
    const storedSession = localStorage.getItem('taglist_session')
    if (storedSession) {
      try {
        session.value = JSON.parse(storedSession)
        session.value!.lastActivity = new Date()
      } catch (error) {
        initSession()
      }
    } else {
      initSession()
    }
  }

  return {
    session: readonly(session),
    trackPageView,
    trackEvent,
    trackPurchase,
    trackProductView,
    trackAddToFavorites,
    trackSearch,
    trackLivestreamJoin,
    trackLivestreamPurchase,
    trackLivestreamGift,
    trackUserRegistration,
    trackUserLogin,
    trackPerformance,
    trackError,
    updateUserInfo,
    endSession
  }
}

// Global error handler
if (process.client) {
  window.addEventListener('error', (event) => {
    const analytics = useAnalytics()
    analytics.trackError(event.error, 'global_error_handler')
  })

  window.addEventListener('unhandledrejection', (event) => {
    const analytics = useAnalytics()
    analytics.trackError(new Error(event.reason), 'unhandled_promise_rejection')
  })
}
