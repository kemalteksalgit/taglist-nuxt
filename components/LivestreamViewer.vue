<template>
  <div class="fixed inset-0 bg-black z-50 overflow-hidden">
    <!-- Live Video Background -->
    <div class="absolute inset-0">
      <video 
        v-if="streamData?.videoUrl"
        ref="liveVideo"
        class="w-full h-full object-cover"
        :src="streamData.videoUrl"
        autoplay
        muted
        playsinline
        @error="handleVideoError"
        @loadstart="handleVideoLoadStart"
        @canplay="handleVideoCanPlay"
      />
      <!-- Video yok/yüklenmemiş durumu -->
      <div v-else class="w-full h-full bg-black flex items-center justify-center">
        <div class="text-center text-white">
          <Icon name="mdi:video-off" class="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p>Video henüz mevcut değil</p>
        </div>
      </div>
      <!-- Video Loading Overlay -->
      <div v-if="isVideoLoading" class="absolute inset-0 bg-black/80 flex items-center justify-center">
        <div class="text-center text-white">
          <LoadingSpinner class="mb-4" />
          <p>Canlı yayın yükleniyor...</p>
        </div>
      </div>
      <!-- Video Error Overlay -->
      <div v-if="videoError" class="absolute inset-0 bg-black/80 flex items-center justify-center">
        <div class="text-center text-white">
          <Icon name="mdi:alert-circle" class="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p class="mb-4">Video yüklenirken hata oluştu</p>
          <button @click="retryVideo" class="btn-primary">Tekrar Dene</button>
        </div>
      </div>
      <!-- Video Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
    </div>

    <!-- Top Bar -->
    <div v-if="streamData" class="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
      <!-- Left Side: Seller Info -->
      <div class="flex items-center space-x-3">
        <img 
          :src="streamData.seller.avatar" 
          :alt="streamData.seller.name"
          class="w-10 h-10 rounded-full border-2 border-white"
          @error="handleAvatarError"
        >
        <div>
          <div class="text-white font-semibold text-sm">{{ streamData.seller.name }}</div>
          <div class="flex items-center space-x-2">
            <div class="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1"></div>
              LIVE
            </div>
            <span class="text-white/80 text-xs">{{ formatViewerCount(streamData.viewers) }} izleyici</span>
          </div>
        </div>
      </div>

      <!-- Right Side: Close Button -->
      <button 
        @click="closeLivestream"
        class="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
      >
        <Icon name="mdi:close" class="w-5 h-5" />
      </button>
    </div>

    <!-- Connection Status Indicator -->
    <div v-if="!isConnected" class="absolute top-20 left-4 right-4 z-20">
      <div class="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm text-center">
        <Icon name="mdi:wifi-off" class="w-4 h-4 inline mr-2" />
        Bağlantı problemi yaşanıyor...
      </div>
    </div>

    <!-- Real-time Notifications -->
    <div class="absolute top-32 left-4 right-4 z-20 space-y-2">
      <TransitionGroup name="notification" tag="div">
        <div 
          v-for="notification in recentNotifications"
          :key="notification.id"
          class="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm"
          :class="getNotificationClass(notification.type)"
        >
          <Icon :name="notification.icon" class="w-4 h-4 inline mr-2" />
          {{ notification.message }}
        </div>
      </TransitionGroup>
    </div>

    <!-- Right Side: Chat & Reactions -->
    <div class="absolute right-4 top-32 bottom-32 w-72 flex flex-col space-y-4 z-20">
      <!-- Live Chat -->
      <div class="flex-1 bg-black/20 backdrop-blur-sm rounded-lg p-3 overflow-hidden">
        <div class="h-full overflow-y-auto space-y-2">
          <div 
            v-for="message in chatMessages"
            :key="message.id"
            class="text-white text-sm leading-relaxed"
          >
            <span class="font-semibold text-blue-300">{{ message.user }}:</span>
            <span class="ml-1">{{ message.text }}</span>
          </div>
        </div>
      </div>

      <!-- Reaction Buttons -->
      <div class="flex space-x-2">
        <button 
          v-for="reaction in quickReactions"
          :key="reaction.emoji"
          @click="sendReaction(reaction)"
          class="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl hover:bg-black/50 transition-all transform hover:scale-110 active:scale-95"
        >
          {{ reaction.emoji }}
        </button>
      </div>

      <!-- Gift/Badge Button -->
      <button 
        @click="showGifts = true"
        class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
      >
        <Icon name="mdi:gift" class="w-4 h-4 inline mr-1" />
        Hediye Gönder
      </button>
    </div>

    <!-- Bottom Product Carousel -->
    <div class="absolute bottom-0 left-0 right-0 z-30 p-4">
      <!-- Sales Progress Bar -->
      <div class="mb-4 bg-black/30 backdrop-blur-sm rounded-lg p-3">
        <div class="flex items-center justify-between text-white text-sm mb-2">
          <span>Satış Hedefi</span>
          <span>{{ soldProducts }}/{{ totalProducts }} ürün satıldı</span>
        </div>
        <div class="w-full bg-black/30 rounded-full h-2">
          <div 
            class="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${(soldProducts / totalProducts) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Product Carousel -->
      <div class="flex space-x-3 overflow-x-auto pb-2">
        <div 
          v-for="product in liveProducts"
          :key="product.id"
          class="flex-shrink-0 bg-black/50 backdrop-blur-sm rounded-lg p-3 w-64"
          :class="product.id === currentProduct?.id ? 'ring-2 ring-yellow-400' : ''"
        >
          <div class="flex space-x-3">
            <img 
              :src="product.image" 
              :alt="product.name"
              class="w-16 h-16 object-cover rounded-lg"
            >
            <div class="flex-1 min-w-0">
              <h4 class="text-white font-semibold text-sm truncate">{{ product.name }}</h4>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-green-400 font-bold text-lg">{{ formatPrice(product.price) }}</span>
                <span v-if="product.originalPrice" class="text-gray-400 line-through text-sm">
                  {{ formatPrice(product.originalPrice) }}
                </span>
              </div>
              
              <!-- Stock & Timer -->
              <div class="flex items-center justify-between mt-2">
                <span class="text-orange-400 text-xs">{{ product.stock }} adet kaldı</span>
                <div v-if="product.auctionEnd" class="text-red-400 text-xs font-mono">
                  {{ formatCountdown(product.auctionEnd) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-2 mt-3">
            <button 
              @click="buyNow(product)"
              :disabled="product.stock === 0"
              class="bg-green-600 text-white py-2 px-3 rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              <Icon name="mdi:cart-plus" class="w-4 h-4 inline mr-1" />
              {{ product.stock > 0 ? 'Satın Al' : 'Tükendi' }}
            </button>
            <button 
              v-if="product.isAuction"
              @click="placeBid(product)"
              class="bg-red-600 text-white py-2 px-3 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors"
            >
              <Icon name="mdi:gavel" class="w-4 h-4 inline mr-1" />
              Teklif Ver
            </button>
            <button 
              v-else
              @click="addToCart(product)"
              class="bg-blue-600 text-white py-2 px-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
            >
              <Icon name="mdi:heart" class="w-4 h-4 inline mr-1" />
              Favorile
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Input -->
    <div class="absolute bottom-4 left-4 right-80 z-30">
      <div class="flex space-x-2">
        <input 
          v-model="commentText"
          @keyup.enter="sendComment"
          type="text"
          placeholder="Yorum yap..."
          class="flex-1 bg-black/30 backdrop-blur-sm text-white placeholder-white/60 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
        <button 
          @click="sendComment"
          :disabled="!commentText.trim()"
          class="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <Icon name="mdi:send" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Floating Reactions -->
    <div class="absolute inset-0 pointer-events-none z-25">
      <TransitionGroup name="floating-reaction" tag="div">
        <div 
          v-for="reaction in floatingReactions"
          :key="reaction.id"
          class="absolute text-4xl animate-ping"
          :style="{ 
            left: reaction.x + 'px', 
            top: reaction.y + 'px',
            animationDuration: reaction.duration + 'ms'
          }"
        >
          {{ reaction.emoji }}
        </div>
      </TransitionGroup>
    </div>

    <!-- Gift Modal -->
    <LivestreamGiftModal 
      v-if="showGifts && streamData"
      :seller="streamData.seller"
      @close="showGifts = false"
      @send-gift="sendGift"
    />

    <!-- Bid Modal -->
    <LivestreamBidModal
      v-if="showBidModal"
      :product="bidProduct"
      @close="showBidModal = false"
      @place-bid="handleBidSubmit"
    />

    <!-- Purchase Confirmation -->
    <LivestreamPurchaseModal
      v-if="showPurchaseModal"
      :product="purchaseProduct"
      @close="showPurchaseModal = false"
      @confirm-purchase="handlePurchaseConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import LivestreamGiftModal from '~/components/modals/LivestreamGiftModal.vue'
import LivestreamBidModal from '~/components/modals/LivestreamBidModal.vue'
import LivestreamPurchaseModal from '~/components/modals/LivestreamPurchaseModal.vue'

// Props
const props = defineProps<{
  streamId: string
}>()

// Composables
const ws = useWebSocket()
const { handleError, handleNetworkError } = useErrorHandler()
const livestreamStore = useLivestreamStore()
const authStore = useAuthStore()

// State
const liveVideo = ref<HTMLVideoElement | null>(null)
const commentText = ref('')
const showGifts = ref(false)
const showBidModal = ref(false)
const showPurchaseModal = ref(false)
const bidProduct = ref<any>(null)
const purchaseProduct = ref<any>(null)
const currentTime = ref(new Date())
const isVideoLoading = ref(true)
const videoError = ref(false)
const isConnected = ref(true)

// Stream data from store
const streamData = computed(() => livestreamStore.currentStream)
const chatMessages = computed(() => livestreamStore.streamMessages(props.streamId))

// Local state
const floatingReactions = ref<Array<{
  id: string
  emoji: string
  x: number
  y: number
  duration: number
}>>([])

const recentNotifications = ref<Array<{
  id: string
  message: string
  icon: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
}>>([])

// Quick reactions
const quickReactions = [
  { emoji: '❤️', name: 'heart' },
  { emoji: '👏', name: 'clap' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '😍', name: 'love' },
  { emoji: '👍', name: 'thumbs_up' }
]

// Computed properties
const liveProducts = computed(() => streamData.value?.products || [])
const currentProduct = computed(() => liveProducts.value[0])
const totalProducts = computed(() => liveProducts.value.length)
const soldProducts = computed(() => 
  liveProducts.value.reduce((acc, product) => acc + (product.stock === 0 ? 1 : 0), 0)
)

// WebSocket event handlers
const setupWebSocketListeners = () => {
  if (!ws) return

  // Listen for stream events
  ws.on('stream_message', (data: any) => {
    if (data.streamId === props.streamId) {
      addChatMessage(data.message)
    }
  })

  ws.on('stream_reaction', (data: any) => {
    if (data.streamId === props.streamId) {
      showFloatingReaction(data.reaction, data.position)
    }
  })

  ws.on('stream_gift', (data: any) => {
    if (data.streamId === props.streamId) {
      addNotification(`${data.senderName} hediye gönderdi`, 'mdi:gift', 'success')
    }
  })

  ws.on('stream_purchase', (data: any) => {
    if (data.streamId === props.streamId) {
      addNotification(`${data.buyerName} ürün satın aldı`, 'mdi:shopping', 'success')
      updateProductStock(data.productId, data.newStock)
    }
  })

  ws.on('stream_bid', (data: any) => {
    if (data.streamId === props.streamId) {
      addNotification(`${data.bidderName} teklif verdi`, 'mdi:gavel', 'info')
      updateProductBid(data.productId, data.newBid)
    }
  })

  ws.on('stream_ended', (data: any) => {
    if (data.streamId === props.streamId) {
      addNotification('Canlı yayın sona erdi', 'mdi:broadcast-off', 'warning')
      setTimeout(closeLivestream, 3000)
    }
  })

  ws.on('connection_lost', () => {
    isConnected.value = false
    addNotification('Bağlantı kesildi', 'mdi:wifi-off', 'error')
  })

  ws.on('connection_restored', () => {
    isConnected.value = true
    addNotification('Bağlantı yeniden kuruldu', 'mdi:wifi', 'success')
  })
}

// Video event handlers
const handleVideoLoadStart = () => {
  isVideoLoading.value = true
  videoError.value = false
}

const handleVideoCanPlay = () => {
  isVideoLoading.value = false
  videoError.value = false
}

const handleVideoError = (event: Event) => {
  isVideoLoading.value = false
  videoError.value = true
  handleError(new Error('Video stream error'), {
    streamId: props.streamId,
    videoEvent: event
  })
}

const handleAvatarError = (event: Event) => {
  // Replace with default avatar
  const img = event.target as HTMLImageElement
  img.src = '/images/default-avatar.png'
}

const retryVideo = () => {
  if (liveVideo.value) {
    isVideoLoading.value = true
    videoError.value = false
    liveVideo.value.load()
  }
}

// Chat and interaction methods
const sendComment = async () => {
  if (!commentText.value.trim() || !authStore.user) return

  try {
    // Send via WebSocket
    const success = ws.send('stream_message', {
      streamId: props.streamId,
      message: {
        id: generateId(),
        user: authStore.user.username,
        text: commentText.value.trim(),
        timestamp: new Date().toISOString()
      }
    })

    if (success) {
      commentText.value = ''
    } else {
      throw new Error('Failed to send message')
    }
  } catch (error) {
    handleError(error as Error, { action: 'send_comment' })
  }
}

const sendReaction = async (reaction: { emoji: string; name: string }) => {
  try {
    // Create floating effect immediately for better UX
    const position = {
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50
    }
    
    showFloatingReaction(reaction.emoji, position)

    // Send to server
    ws.send('stream_reaction', {
      streamId: props.streamId,
      reaction: reaction.emoji,
      position,
      userId: authStore.user?.id
    })
  } catch (error) {
    handleError(error as Error, { action: 'send_reaction' })
  }
}

const sendGift = async (gift: any) => {
  try {
    const success = ws.send('stream_gift', {
      streamId: props.streamId,
      giftId: gift.id,
      senderId: authStore.user?.id,
      senderName: authStore.user?.username
    })

    if (success) {
      showGifts.value = false
      addNotification(`${gift.name} hediyesi gönderildi`, 'mdi:gift', 'success')
    }
  } catch (error) {
    handleError(error as Error, { action: 'send_gift' })
  }
}

// Product interaction methods
const buyNow = async (product: any) => {
  if (!authStore.user) {
    addNotification('Satın almak için giriş yapın', 'mdi:account', 'warning')
    return
  }

  if (product.stock === 0) {
    addNotification('Ürün stokta yok', 'mdi:alert', 'error')
    return
  }

  purchaseProduct.value = product
  showPurchaseModal.value = true
}

const placeBid = (product: any) => {
  if (!authStore.user) {
    addNotification('Teklif vermek için giriş yapın', 'mdi:account', 'warning')
    return
  }

  if (!product.isAuction) {
    addNotification('Bu ürün açık artırma değil', 'mdi:alert', 'error')
    return
  }

  bidProduct.value = product
  showBidModal.value = true
}

const addToCart = async (product: any) => {
  try {
    // Add to cart logic here
    addNotification('Ürün favorilere eklendi', 'mdi:heart', 'success')
  } catch (error) {
    handleError(error as Error, { action: 'add_to_cart' })
  }
}

const handleBidSubmit = async (bidData: any) => {
  try {
    const success = ws.send('stream_bid', {
      streamId: props.streamId,
      productId: bidData.productId,
      bidAmount: bidData.amount,
      bidderId: authStore.user?.id,
      bidderName: authStore.user?.username
    })

    if (success) {
      showBidModal.value = false
      addNotification('Teklif başarıyla verildi', 'mdi:gavel', 'success')
    }
  } catch (error) {
    handleError(error as Error, { action: 'place_bid' })
  }
}

const handlePurchaseConfirm = async (purchaseData: any) => {
  try {
    const success = ws.send('stream_purchase', {
      streamId: props.streamId,
      productId: purchaseData.productId,
      quantity: purchaseData.quantity,
      buyerId: authStore.user?.id,
      buyerName: authStore.user?.username
    })

    if (success) {
      showPurchaseModal.value = false
      addNotification('Satın alma başarılı!', 'mdi:check-circle', 'success')
    }
  } catch (error) {
    handleError(error as Error, { action: 'purchase_product' })
  }
}

// Helper methods
const addChatMessage = (message: any) => {
  // This would be handled by the livestream store
  livestreamStore.addMessage(props.streamId, message)
}

const addNotification = (message: string, icon: string, type: 'info' | 'success' | 'warning' | 'error') => {
  const notification = {
    id: generateId(),
    message,
    icon,
    type,
    timestamp: Date.now()
  }
  
  recentNotifications.value.unshift(notification)
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    recentNotifications.value = recentNotifications.value.filter(n => n.id !== notification.id)
  }, 5000)
}

const showFloatingReaction = (emoji: string, position: { x: number; y: number }) => {
  const reaction = {
    id: generateId(),
    emoji,
    x: position.x,
    y: position.y,
    duration: 2000
  }
  
  floatingReactions.value.push(reaction)
  
  setTimeout(() => {
    floatingReactions.value = floatingReactions.value.filter(r => r.id !== reaction.id)
  }, reaction.duration)
}

const updateProductStock = (productId: string, newStock: number) => {
  const product = liveProducts.value.find(p => p.id === productId)
  if (product) {
    product.stock = newStock
  }
}

const updateProductBid = (productId: string, newBid: number) => {
  const product = liveProducts.value.find(p => p.id === productId)
  if (product && product.isAuction) {
    product.currentBid = newBid
  }
}

const getNotificationClass = (type: string) => {
  switch (type) {
    case 'success': return 'border-l-4 border-green-500'
    case 'warning': return 'border-l-4 border-yellow-500'
    case 'error': return 'border-l-4 border-red-500'
    default: return 'border-l-4 border-blue-500'
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
}

const formatViewerCount = (count: number) => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

const formatCountdown = (endTime: string | Date) => {
  const now = currentTime.value
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return '00:00'
  
  const minutes = Math.floor(diff / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const closeLivestream = () => {
  // Leave the stream
  if (ws && streamData.value) {
    ws.send('leave_stream', { streamId: props.streamId })
  }
  
  // Navigate back
  navigateTo('/live')
}

// Lifecycle
onMounted(async () => {
  try {
    // Join the livestream
    await livestreamStore.joinStream(props.streamId)
    
    // Setup WebSocket listeners
    setupWebSocketListeners()
    
    // Start timer for countdowns
    const timer = setInterval(() => {
      currentTime.value = new Date()
    }, 1000)
    
    // Cleanup timer on unmount
    onUnmounted(() => {
      clearInterval(timer)
    })
    
  } catch (error) {
    handleError(error as Error, { action: 'join_stream' })
  }
})

onUnmounted(() => {
  // Leave stream when component unmounts
  if (livestreamStore.currentStream) {
    livestreamStore.leaveStream()
  }
})
</script>

<style scoped>
/* Scrollbar styling for chat */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.floating-reaction-enter-active {
  transition: all 2s ease-out;
}

.floating-reaction-enter-from {
  opacity: 1;
  transform: translateY(0);
}

.floating-reaction-enter-to {
  opacity: 0;
  transform: translateY(-200px) rotate(360deg);
}

/* Product carousel horizontal scroll */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>
