// stores/livestream.ts
import { defineStore } from 'pinia'

export interface LiveStream {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl?: string // Canlı yayın video URL'i
  seller: {
    id: string
    name: string
    avatar: string
    followers: number
    rating: number
  }
  status: 'live' | 'scheduled' | 'ended'
  startTime: string
  endTime?: string
  viewers: number
  maxViewers: number
  products: Array<{
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    stock: number
    isAuction: boolean
    auctionEnd?: string
    currentBid?: number
    minBid?: number
  }>
  stats: {
    totalViews: number
    likes: number
    shares: number
    comments: number
    sales: number
    revenue: number
  }
  settings: {
    allowComments: boolean
    allowGifts: boolean
    isPrivate: boolean
    recordStream: boolean
    enableNotifications: boolean
  }
}

export interface LiveMessage {
  id: string
  streamId: string
  user: {
    id: string
    username: string
    avatar?: string
    isVerified: boolean
  }
  text: string
  type: 'message' | 'gift' | 'purchase' | 'bid' | 'system'
  timestamp: string
  metadata?: {
    giftType?: string
    giftValue?: number
    productId?: string
    bidAmount?: number
    purchaseAmount?: number
  }
}

export interface Gift {
  id: string
  name: string
  emoji: string
  price: number
  category: 'popular' | 'premium' | 'special'
  animation?: string
}

export interface LivestreamState {
  currentStream: LiveStream | null
  activeStreams: LiveStream[]
  upcomingStreams: LiveStream[]
  myStreams: LiveStream[]
  messages: Map<string, LiveMessage[]> // streamId -> messages
  gifts: Gift[]
  isLive: boolean
  isLoading: boolean
  error: string | null
  viewerCount: number
  streamSettings: {
    cameraEnabled: boolean
    micEnabled: boolean
    selectedCamera: string
    selectedMic: string
    quality: 'low' | 'medium' | 'high'
    title: string
    description: string
    category: string
    isPrivate: boolean
  }
  streamStats: {
    duration: number
    viewers: number
    messages: number
    gifts: number
    sales: number
    revenue: number
  }
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export const useLivestreamStore = defineStore('livestream', {
  state: (): LivestreamState => ({
    currentStream: null,
    activeStreams: [],
    upcomingStreams: [],
    myStreams: [],
    messages: new Map(),
    gifts: [
      // Popular gifts
      { id: '1', name: 'Kalp', emoji: '❤️', price: 5, category: 'popular' },
      { id: '2', name: 'Alkış', emoji: '👏', price: 10, category: 'popular' },
      { id: '3', name: 'Çiçek', emoji: '🌹', price: 15, category: 'popular' },
      { id: '4', name: 'Yıldız', emoji: '⭐', price: 20, category: 'popular' },
      
      // Premium gifts
      { id: '5', name: 'Altın Kalp', emoji: '💛', price: 50, category: 'premium' },
      { id: '6', name: 'Elmas', emoji: '💎', price: 100, category: 'premium' },
      { id: '7', name: 'Kraliyet Tacı', emoji: '👑', price: 200, category: 'premium' },
      { id: '8', name: 'Roket', emoji: '🚀', price: 500, category: 'premium' },
      
      // Special gifts
      { id: '9', name: 'Süper Araba', emoji: '🏎️', price: 1000, category: 'special' },
      { id: '10', name: 'Özel Uçak', emoji: '✈️', price: 2000, category: 'special' }
    ],
    isLive: false,
    isLoading: false,
    error: null,
    viewerCount: 0,
    streamSettings: {
      cameraEnabled: true,
      micEnabled: true,
      selectedCamera: '',
      selectedMic: '',
      quality: 'medium',
      title: '',
      description: '',
      category: '',
      isPrivate: false
    },
    streamStats: {
      duration: 0,
      viewers: 0,
      messages: 0,
      gifts: 0,
      sales: 0,
      revenue: 0
    },
    connectionStatus: 'disconnected'
  }),

  getters: {
    liveStreamCount: (state) => state.activeStreams.length,
    
    totalViewers: (state) => 
      state.activeStreams.reduce((total, stream) => total + stream.viewers, 0),
    
    currentStreamProducts: (state) => state.currentStream?.products || [],
    
    streamMessages: (state) => (streamId: string) => 
      state.messages.get(streamId) || [],
    
    giftsByCategory: (state) => (category: string) =>
      state.gifts.filter(gift => gift.category === category),

    isConnected: (state) => state.connectionStatus === 'connected'
  },

  actions: {
    // Check if user is stream owner
    isStreamOwner(streamId: string, authStore?: any) {
      const stream = this.activeStreams.find(s => s.id === streamId) || 
                     this.myStreams.find(s => s.id === streamId)
      return stream?.seller.id === authStore?.user?.id
    },

    // Initialize WebSocket connection
    initializeConnection(wsInstance?: any) {
      // Accept WebSocket instance from component
      const ws = wsInstance
      if (!ws) return

      this.connectionStatus = 'connecting'

      // Setup WebSocket event listeners
      ws.on('connected', () => {
        this.connectionStatus = 'connected'
      })

      ws.on('disconnected', () => {
        this.connectionStatus = 'disconnected'
      })

      ws.on('error', () => {
        this.connectionStatus = 'error'
      })

      // Listen for stream events
      ws.on('stream_message', (data: any) => {
        this.addMessage(data.streamId, data.message)
      })

      ws.on('stream_viewer_update', (data: any) => {
        this.updateViewerCount(data.streamId, data.count)
      })

      ws.on('stream_product_update', (data: any) => {
        this.updateProduct(data.streamId, data.product)
      })

      ws.on('stream_ended', (data: any) => {
        this.handleStreamEnded(data.streamId)
      })
    },

    // Add message to stream
    addMessage(streamId: string, message: LiveMessage) {
      const messages = this.messages.get(streamId) || []
      messages.push(message)
      
      // Keep only last 100 messages for performance
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100)
      }
      
      this.messages.set(streamId, messages)
      this.streamStats.messages++
    },

    // Update viewer count
    updateViewerCount(streamId: string, count: number) {
      if (this.currentStream?.id === streamId) {
        this.viewerCount = count
        this.currentStream.viewers = count
        this.streamStats.viewers = Math.max(this.streamStats.viewers, count)
      }

      // Update in active streams
      const stream = this.activeStreams.find(s => s.id === streamId)
      if (stream) {
        stream.viewers = count
        stream.maxViewers = Math.max(stream.maxViewers, count)
      }
    },

    // Update product in stream
    updateProduct(streamId: string, updatedProduct: any) {
      if (this.currentStream?.id === streamId) {
        const productIndex = this.currentStream.products.findIndex(p => p.id === updatedProduct.id)
        if (productIndex !== -1) {
          this.currentStream.products[productIndex] = { ...this.currentStream.products[productIndex], ...updatedProduct }
        }
      }
    },

    // Handle stream ended
    handleStreamEnded(streamId: string) {
      if (this.currentStream?.id === streamId) {
        this.currentStream.status = 'ended'
        this.isLive = false
      }

      // Update in active streams
      const streamIndex = this.activeStreams.findIndex(s => s.id === streamId)
      if (streamIndex !== -1 && this.activeStreams[streamIndex]) {
        this.activeStreams[streamIndex].status = 'ended'
        // Move to ended streams or remove from active
        this.activeStreams.splice(streamIndex, 1)
      }
    },
    // Fetch active streams
    async fetchActiveStreams() {
      this.isLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data
        this.activeStreams = [
          {
            id: '1',
            title: 'Teknoloji Ürünleri Mega İndirim! iPhone, MacBook ve Daha Fazlası',
            description: 'En güncel teknoloji ürünlerinde inanılmaz fırsatlar',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
            seller: {
              id: 'seller1',
              name: 'TechStore İstanbul',
              avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50',
              followers: 12500,
              rating: 4.8
            },
            status: 'live',
            startTime: new Date(Date.now() - 3600000).toISOString(),
            viewers: 1247,
            maxViewers: 1500,
            products: [
              {
                id: 'p1',
                name: 'iPhone 14 Pro Max 256GB',
                price: 28500,
                originalPrice: 35000,
                image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
                stock: 3,
                isAuction: false
              },
              {
                id: 'p2',
                name: 'MacBook Pro M2',
                price: 45000,
                image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200',
                stock: 2,
                isAuction: true,
                auctionEnd: new Date(Date.now() + 1800000).toISOString(),
                currentBid: 42000,
                minBid: 40000
              }
            ],
            stats: {
              totalViews: 15420,
              likes: 892,
              shares: 45,
              comments: 234,
              sales: 8,
              revenue: 185000
            },
            settings: {
              allowComments: true,
              allowGifts: true,
              isPrivate: false,
              recordStream: true,
              enableNotifications: true
            }
          }
        ]
      } catch (error) {
        this.error = 'Canlı yayınlar yüklenirken hata oluştu'
      } finally {
        this.isLoading = false
      }
    },

    // Join stream
    async joinStream(streamId: string, wsInstance?: any, authStore?: any) {
      try {
        this.isLoading = true
        this.connectionStatus = 'connecting'

        const ws = wsInstance
        if (!ws) {
          throw new Error('WebSocket connection not available')
        }

        // Find the stream
        const stream = this.activeStreams.find(s => s.id === streamId)
        if (!stream) {
          throw new Error('Stream not found')
        }

        // Join via WebSocket
        const joinResult = await ws.send('join_stream', { 
          streamId,
          userId: authStore?.user?.id 
        })

        if (!joinResult) {
          throw new Error('Failed to join stream')
        }

        this.currentStream = stream
        this.connectionStatus = 'connected'
        
        // Initialize messages for this stream if not exists
        if (!this.messages.has(streamId)) {
          this.messages.set(streamId, [])
        }

        // Load initial messages
        await this.loadStreamMessages(streamId)
        
        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to join stream'
        this.error = errorMessage
        this.connectionStatus = 'error'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Leave stream
    leaveStream(wsInstance?: any, authStore?: any) {
      if (this.currentStream) {
        const ws = wsInstance
        if (ws) {
          ws.send('leave_stream', { 
            streamId: this.currentStream.id,
            userId: authStore?.user?.id 
          })
        }

        this.currentStream = null
        this.connectionStatus = 'disconnected'
      }
    },

    // Start streaming
    async startStream(settings: Partial<LivestreamState['streamSettings']>) {
      this.isLoading = true
      try {
        // Update settings
        this.streamSettings = { ...this.streamSettings, ...settings }
        
        // Simulate stream start
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const newStream: LiveStream = {
          id: Date.now().toString(),
          title: this.streamSettings.title,
          description: this.streamSettings.description,
          thumbnail: '/api/stream-thumbnail/' + Date.now(),
          seller: {
            id: 'current-user',
            name: 'Ben',
            avatar: '',
            followers: 0,
            rating: 0
          },
          status: 'live',
          startTime: new Date().toISOString(),
          viewers: 0,
          maxViewers: 0,
          products: [],
          stats: {
            totalViews: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            sales: 0,
            revenue: 0
          },
          settings: {
            allowComments: true,
            allowGifts: true,
            isPrivate: this.streamSettings.isPrivate,
            recordStream: true,
            enableNotifications: true
          }
        }
        
        this.myStreams.unshift(newStream)
        this.currentStream = newStream
        this.isLive = true
        
        // Start stream stats tracking
        this.startStatsTracking()
        
        return { success: true, stream: newStream }
      } catch (error) {
        this.error = 'Yayın başlatılırken hata oluştu'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // End stream
    async endStream() {
      if (!this.isLive || !this.currentStream) return
      
      try {
        this.currentStream.status = 'ended'
        this.currentStream.endTime = new Date().toISOString()
        this.isLive = false
        
        // Stop stats tracking
        this.stopStatsTracking()
        
        // Save stream stats
        await this.saveStreamStats()
        
        return { success: true }
      } catch (error) {
        this.error = 'Yayın sonlandırılırken hata oluştu'
        return { success: false, error: this.error }
      }
    },

    // Send message
    async sendMessage(text: string, wsInstance?: any, authStore?: any) {
      if (!this.currentStream) return { success: false, error: 'No active stream' }
      
      try {
        if (!authStore?.user) {
          return { success: false, error: 'Please login to send messages' }
        }

        const ws = wsInstance
        if (!ws) {
          throw new Error('WebSocket connection not available')
        }

        const message: LiveMessage = {
          id: Date.now().toString(),
          streamId: this.currentStream.id,
          user: {
            id: authStore.user.id,
            username: authStore.user.username,
            avatar: authStore.user.avatar,
            isVerified: authStore.user.isVerified || false
          },
          text,
          type: 'message',
          timestamp: new Date().toISOString()
        }

        // Send via WebSocket
        const success = ws.send('stream_message', {
          streamId: this.currentStream.id,
          message
        })

        if (success) {
          // Add to local messages immediately for better UX
          this.addMessage(this.currentStream.id, message)
          return { success: true }
        } else {
          throw new Error('Failed to send message')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
        return { success: false, error: errorMessage }
      }
    },

    // Send gift
    async sendGift(giftId: string, quantity: number = 1, authStore?: any) {
      if (!this.currentStream) return
      
      try {
        const gift = this.gifts.find(g => g.id === giftId)
        if (!gift) return { success: false, error: 'Hediye bulunamadı' }
        
        const totalPrice = gift.price * quantity
        
        const message: LiveMessage = {
          id: Date.now().toString(),
          streamId: this.currentStream.id,
          user: {
            id: authStore?.user?.id || 'anonymous',
            username: authStore?.user?.username || 'Anonim',
            avatar: authStore?.user?.avatar,
            isVerified: authStore.user?.isVerified || false
          },
          text: `${quantity}x ${gift.name} hediye gönderdi`,
          type: 'gift',
          timestamp: new Date().toISOString(),
          metadata: {
            giftType: gift.name,
            giftValue: totalPrice
          }
        }
        
        this.addMessage(this.currentStream.id, message)
        this.streamStats.gifts++
        this.streamStats.revenue += totalPrice
        
        return { success: true }
      } catch (error) {
        return { success: false, error: 'Hediye gönderilemedi' }
      }
    },

    // Place bid
    async placeBid(productId: string, amount: number, authStore?: any) {
      if (!this.currentStream) return
      
      try {
        const product = this.currentStream.products.find(p => p.id === productId)
        if (!product || !product.isAuction) {
          return { success: false, error: 'Ürün bulunamadı veya açık artırma değil' }
        }
        
        if (amount <= (product.currentBid || product.minBid || 0)) {
          return { success: false, error: 'Teklif mevcut tekliften yüksek olmalı' }
        }
        
        product.currentBid = amount
        
        const message: LiveMessage = {
          id: Date.now().toString(),
          streamId: this.currentStream.id,
          user: {
            id: authStore.user?.id || 'anonymous',
            username: authStore.user?.username || 'Anonim',
            avatar: authStore.user?.avatar,
            isVerified: authStore.user?.isVerified || false
          },
          text: `${product.name} için ${amount}₺ teklif verdi`,
          type: 'bid',
          timestamp: new Date().toISOString(),
          metadata: {
            productId,
            bidAmount: amount
          }
        }
        
        this.addMessage(this.currentStream.id, message)
        
        return { success: true }
      } catch (error) {
        return { success: false, error: 'Teklif verilemedi' }
      }
    },

    // Purchase product
    async purchaseProduct(productId: string, quantity: number = 1, authStore?: any) {
      if (!this.currentStream) return
      
      try {
        const product = this.currentStream.products.find(p => p.id === productId)
        if (!product) {
          return { success: false, error: 'Ürün bulunamadı' }
        }
        
        if (product.stock < quantity) {
          return { success: false, error: 'Yeterli stok yok' }
        }
        
        const totalPrice = product.price * quantity
        
        product.stock -= quantity
        
        const message: LiveMessage = {
          id: Date.now().toString(),
          streamId: this.currentStream.id,
          user: {
            id: authStore.user?.id || 'anonymous',
            username: authStore.user?.username || 'Anonim',
            avatar: authStore.user?.avatar,
            isVerified: authStore.user?.isVerified || false
          },
          text: `${product.name} satın aldı`,
          type: 'purchase',
          timestamp: new Date().toISOString(),
          metadata: {
            productId,
            purchaseAmount: totalPrice
          }
        }
        
        this.addMessage(this.currentStream.id, message)
        this.streamStats.sales++
        this.streamStats.revenue += totalPrice
        
        return { success: true }
      } catch (error) {
        return { success: false, error: 'Satın alma başarısız' }
      }
    },

    // Load stream messages
    async loadStreamMessages(streamId: string) {
      try {
        // Simulate loading previous messages
        const mockMessages: LiveMessage[] = [
          {
            id: '1',
            streamId,
            user: { id: '1', username: 'TechFan', isVerified: true },
            text: 'Harika fiyatlar! 👏',
            type: 'message',
            timestamp: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: '2',
            streamId,
            user: { id: '2', username: 'ShoppingStar', isVerified: false },
            text: 'Bu fırsatı kaçırmam',
            type: 'message',
            timestamp: new Date(Date.now() - 240000).toISOString()
          }
        ]
        
        // Clear existing messages for this stream and add mock messages
        this.messages.set(streamId, mockMessages)
      } catch (error) {
        console.error('Load messages error:', error)
      }
    },

    // Update stream settings
    updateStreamSettings(settings: Partial<LivestreamState['streamSettings']>) {
      this.streamSettings = { ...this.streamSettings, ...settings }
    },

    // Start stats tracking
    startStatsTracking() {
      if (typeof window !== 'undefined') {
        (window as any).streamStatsInterval = setInterval(() => {
          this.streamStats.duration += 1
          // Simulate viewer fluctuation
          if (Math.random() > 0.7) {
            this.streamStats.viewers += Math.floor(Math.random() * 5) - 2
            this.streamStats.viewers = Math.max(0, this.streamStats.viewers)
          }
        }, 1000)
      }
    },

    // Stop stats tracking
    stopStatsTracking() {
      if (typeof window !== 'undefined' && (window as any).streamStatsInterval) {
        clearInterval((window as any).streamStatsInterval)
        delete (window as any).streamStatsInterval
      }
    },

    // Save stream stats
    async saveStreamStats() {
      try {
        // Simulate API call to save stats
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('Stream stats saved:', this.streamStats)
      } catch (error) {
        console.error('Save stats error:', error)
      }
    },

    // Add product to stream
    addProductToStream(product: any) {
      if (this.currentStream) {
        this.currentStream.products.push({
          id: product.id,
          name: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0],
          stock: 1,
          isAuction: false
        })
      }
    },

    // Remove product from stream
    removeProductFromStream(productId: string) {
      if (this.currentStream) {
        this.currentStream.products = this.currentStream.products.filter(p => p.id !== productId)
      }
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})
