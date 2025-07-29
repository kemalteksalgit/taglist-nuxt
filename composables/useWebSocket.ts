// composables/useWebSocket.ts
import type { Ref } from 'vue'

export interface WebSocketMessage {
  type: string
  data: any
  timestamp: number
  id?: string
}

export interface WebSocketOptions {
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  debug?: boolean
  ultraLowLatency?: boolean // Feature flag for ultra-low latency mode
  binaryProtocol?: boolean
  compression?: boolean
}

export interface WebSocketState {
  connected: boolean
  connecting: boolean
  error: string | null
  lastHeartbeat: number
}

export const useWebSocket = (url?: string, options: WebSocketOptions = {}) => {
  const config = useRuntimeConfig()
  const wsUrl = url || config.public.wsUrl
  
  const {
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    debug = false
  } = options

  // State
  const state = reactive<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastHeartbeat: 0
  })

  // WebSocket instance
  let ws: WebSocket | null = null
  let reconnectCount = 0
  let heartbeatTimer: NodeJS.Timeout | null = null
  let reconnectTimer: NodeJS.Timeout | null = null

  // Message listeners
  const listeners = new Map<string, Set<Function>>()

  // Connect to WebSocket
  const connect = () => {
    if (state.connecting || state.connected) return

    state.connecting = true
    state.error = null

    try {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        if (debug) console.log('WebSocket connected')
        state.connected = true
        state.connecting = false
        state.error = null
        reconnectCount = 0
        
        // Start heartbeat
        startHeartbeat()
        
        // Emit connect event
        emit('connect', { timestamp: Date.now() })
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          if (debug) console.log('WebSocket message received:', message)
          
          // Handle heartbeat response
          if (message.type === 'pong') {
            state.lastHeartbeat = Date.now()
            return
          }
          
          // Emit to listeners
          emit(message.type, message.data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        if (debug) console.log('WebSocket disconnected:', event.code, event.reason)
        state.connected = false
        state.connecting = false
        
        // Stop heartbeat
        stopHeartbeat()
        
        // Emit disconnect event
        emit('disconnect', { code: event.code, reason: event.reason })
        
        // Attempt reconnection if not intentional close
        if (event.code !== 1000 && reconnectCount < reconnectAttempts) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        state.error = 'WebSocket connection error'
        state.connecting = false
        
        emit('error', { error })
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      state.error = 'Failed to establish connection'
      state.connecting = false
    }
  }

  // Disconnect WebSocket
  const disconnect = () => {
    if (ws) {
      ws.close(1000, 'Intentional disconnect')
      ws = null
    }
    stopHeartbeat()
    clearReconnectTimer()
  }

  // Send message
  const send = (type: string, data: any) => {
    if (!state.connected || !ws) {
      console.warn('WebSocket not connected, cannot send message')
      return false
    }

    try {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        id: generateId()
      }
      
      ws.send(JSON.stringify(message))
      if (debug) console.log('WebSocket message sent:', message)
      return true
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      return false
    }
  }

  // Listen for specific message types
  const on = (type: string, callback: Function) => {
    if (!listeners.has(type)) {
      listeners.set(type, new Set())
    }
    listeners.get(type)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const typeListeners = listeners.get(type)
      if (typeListeners) {
        typeListeners.delete(callback)
        if (typeListeners.size === 0) {
          listeners.delete(type)
        }
      }
    }
  }

  // Remove listener
  const off = (type: string, callback?: Function) => {
    if (callback) {
      const typeListeners = listeners.get(type)
      if (typeListeners) {
        typeListeners.delete(callback)
        if (typeListeners.size === 0) {
          listeners.delete(type)
        }
      }
    } else {
      listeners.delete(type)
    }
  }

  // Emit to listeners
  const emit = (type: string, data: any) => {
    const typeListeners = listeners.get(type)
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in WebSocket listener:', error)
        }
      })
    }
  }

  // Start heartbeat
  const startHeartbeat = () => {
    if (heartbeatTimer) return
    
    heartbeatTimer = setInterval(() => {
      if (state.connected && ws) {
        send('ping', { timestamp: Date.now() })
        
        // Check if heartbeat is overdue
        const now = Date.now()
        if (state.lastHeartbeat > 0 && now - state.lastHeartbeat > heartbeatInterval * 2) {
          console.warn('Heartbeat timeout, reconnecting...')
          disconnect()
          scheduleReconnect()
        }
      }
    }, heartbeatInterval)
  }

  // Stop heartbeat
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // Schedule reconnection
  const scheduleReconnect = () => {
    if (reconnectCount >= reconnectAttempts) {
      state.error = 'Max reconnection attempts reached'
      return
    }

    clearReconnectTimer()
    reconnectCount++
    
    if (debug) console.log(`Scheduling reconnection attempt ${reconnectCount}/${reconnectAttempts}`)
    
    reconnectTimer = setTimeout(() => {
      connect()
    }, reconnectInterval * Math.pow(2, reconnectCount - 1)) // Exponential backoff
  }

  // Clear reconnect timer
  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  // Auto-connect when client-side
  onMounted(() => {
    if (process.client) {
      connect()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
    listeners.clear()
  })

  // Handle page visibility changes
  if (process.client) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden, reduce activity
        stopHeartbeat()
      } else {
        // Page visible, resume activity
        if (state.connected) {
          startHeartbeat()
        } else {
          connect()
        }
      }
    })
  }

  return {
    // State (readonly)
    state: readonly(state),
    
    // Methods
    connect,
    disconnect,
    send,
    on,
    off,
    
    // Computed helpers
    isConnected: computed(() => state.connected),
    isConnecting: computed(() => state.connecting),
    hasError: computed(() => !!state.error)
  }
}
