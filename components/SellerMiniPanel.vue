<template>
  <Teleport to="body">
    <!-- Seller Mini Panel - Draggable Overlay for Live Streams -->
    <div v-if="isVisible && auctionMetrics" 
         ref="panelRef"
         class="fixed z-50 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-4 min-w-[320px] max-w-[400px] shadow-2xl"
         :style="{ 
           left: position.x + 'px', 
           top: position.y + 'px',
           cursor: isDragging ? 'grabbing' : 'grab'
         }"
         @mousedown="startDrag"
         @touchstart="startDrag">
      
      <!-- Header with Drag Handle -->
      <div class="flex items-center justify-between mb-4 text-white">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h3 class="font-bold text-lg">Müzayede Kontrolü</h3>
        </div>
        <button @click="minimize" 
                class="text-white/70 hover:text-white transition-colors p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
      </div>

      <!-- Live Metrics Grid -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Active Viewers -->
        <div class="bg-blue-500/20 rounded-xl p-3 border border-blue-400/30">
          <div class="flex items-center space-x-2 mb-1">
            <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="text-blue-400 text-xs font-medium">İzleyici</span>
          </div>
          <div class="text-white text-xl font-bold">{{ auctionMetrics.activeViewers }}</div>
        </div>

        <!-- Highest Bid -->
        <div class="bg-green-500/20 rounded-xl p-3 border border-green-400/30">
          <div class="flex items-center space-x-2 mb-1">
            <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span class="text-green-400 text-xs font-medium">En Yüksek</span>
          </div>
          <div class="text-white text-xl font-bold">{{ formatCurrency(auctionMetrics.highestBid) }}</div>
        </div>

        <!-- Time Left -->
        <div class="bg-orange-500/20 rounded-xl p-3 border border-orange-400/30">
          <div class="flex items-center space-x-2 mb-1">
            <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-orange-400 text-xs font-medium">Kalan Süre</span>
          </div>
          <div class="text-white text-xl font-bold">{{ formatTimeLeft(auctionMetrics.timeLeft) }}</div>
        </div>

        <!-- Total Bids -->
        <div class="bg-purple-500/20 rounded-xl p-3 border border-purple-400/30">
          <div class="flex items-center space-x-2 mb-1">
            <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span class="text-purple-400 text-xs font-medium">Teklif</span>
          </div>
          <div class="text-white text-xl font-bold">{{ auctionMetrics.totalBids }}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="space-y-3">
        <h4 class="text-white font-semibold text-sm mb-2">Hızlı Aksiyonlar</h4>
        
        <!-- Discount Button -->
        <button @click="applyDiscount"
                :disabled="isProcessing"
                class="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span>%5 İndirim Uygula</span>
        </button>

        <!-- Switch Next Item -->
        <button @click="switchNextItem"
                :disabled="isProcessing"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span>Sonraki Ürün</span>
        </button>

        <!-- End Auction -->
        <button @click="confirmEndAuction"
                :disabled="isProcessing"
                class="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          <span>Müzayedeyi Bitir</span>
        </button>
      </div>

      <!-- Extension Count Indicator -->
      <div v-if="auctionMetrics.extensionCount > 0" 
           class="mt-4 p-2 bg-orange-500/20 rounded-lg border border-orange-400/30">
        <div class="flex items-center space-x-2 text-orange-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium">
            {{ auctionMetrics.extensionCount }} uzatma yapıldı
          </span>
        </div>
      </div>
    </div>

    <!-- Minimized State -->
    <div v-else-if="isMinimized"
         class="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-2xl cursor-pointer transition-colors duration-200"
         @click="restore">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Müzayedeyi Bitir</h3>
        <p class="text-gray-600 mb-6">
          Müzayedeyi erken bitirmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div class="flex space-x-3">
          <button @click="showConfirmModal = false"
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-4 rounded-xl transition-colors duration-200">
            İptal
          </button>
          <button @click="endAuction"
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors duration-200">
            Bitir
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { auctionService } from '~/services/AuctionService'

interface Props {
  auctionId: string
  sellerId: string
  initialPosition?: { x: number; y: number }
}

const props = withDefaults(defineProps<Props>(), {
  initialPosition: () => ({ x: 20, y: 100 })
})

// State
const isVisible = ref(true)
const isMinimized = ref(false)
const isDragging = ref(false)
const isProcessing = ref(false)
const showConfirmModal = ref(false)
const position = ref(props.initialPosition)
const panelRef = ref<HTMLElement>()

// Auction metrics (reactive)
const auctionMetrics = ref<ReturnType<typeof auctionService.getSellerMetrics>>(null)

// Drag functionality
let dragStart = { x: 0, y: 0 }
let panelStart = { x: 0, y: 0 }

const startDrag = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  isDragging.value = true

  const clientX = 'touches' in event ? event.touches[0]?.clientX || 0 : event.clientX
  const clientY = 'touches' in event ? event.touches[0]?.clientY || 0 : event.clientY

  dragStart = { x: clientX, y: clientY }
  panelStart = { ...position.value }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  const clientX = 'touches' in event ? event.touches[0]?.clientX || 0 : event.clientX
  const clientY = 'touches' in event ? event.touches[0]?.clientY || 0 : event.clientY

  const deltaX = clientX - dragStart.x
  const deltaY = clientY - dragStart.y

  // Calculate new position with bounds checking
  const newX = Math.max(0, Math.min(window.innerWidth - 320, panelStart.x + deltaX))
  const newY = Math.max(0, Math.min(window.innerHeight - 200, panelStart.y + deltaY))

  position.value = { x: newX, y: newY }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

// Panel controls
const minimize = () => {
  isVisible.value = false
  isMinimized.value = true
}

const restore = () => {
  isVisible.value = true
  isMinimized.value = false
}

// Quick actions
const applyDiscount = async () => {
  if (isProcessing.value) return

  isProcessing.value = true
  try {
    const success = auctionService.applySellerDiscount(props.auctionId, 5)
    if (success) {
      // Show success notification
      addToast({
        type: 'success',
        title: '%5 indirim uygulandı'
      })
    } else {
      throw new Error('İndirim uygulanamadı')
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'İndirim uygulanırken hata oluştu'
    })
  } finally {
    isProcessing.value = false
  }
}

const switchNextItem = async () => {
  if (isProcessing.value) return

  isProcessing.value = true
  try {
    // Emit event for parent component to handle
    emit('switchNextItem')
    addToast({
      type: 'info',
      title: 'Sonraki ürüne geçiliyor...'
    })
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Ürün değiştirilemedi'
    })
  } finally {
    isProcessing.value = false
  }
}

const confirmEndAuction = () => {
  showConfirmModal.value = true
}

const endAuction = async () => {
  showConfirmModal.value = false
  if (isProcessing.value) return

  isProcessing.value = true
  try {
    const success = auctionService.endAuctionEarly(props.auctionId, props.sellerId)
    if (success) {
      addToast({
        type: 'success',
        title: 'Müzayede sonlandırıldı'
      })
      emit('auctionEnded')
    } else {
      throw new Error('Müzayede sonlandırılamadı')
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Müzayede sonlandırılırken hata oluştu'
    })
  } finally {
    isProcessing.value = false
  }
}

// Formatting utilities
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatTimeLeft = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  } else if (minutes > 0) {
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
  } else {
    return `${seconds}s`
  }
}

// Real-time metrics updates
const updateMetrics = () => {
  auctionMetrics.value = auctionService.getSellerMetrics(props.auctionId)
}

// Setup real-time updates
let metricsInterval: NodeJS.Timeout

onMounted(() => {
  // Initial metrics load
  updateMetrics()

  // Update metrics every 1 second
  metricsInterval = setInterval(updateMetrics, 1000)

  // Listen for auction events
  auctionService.on('bidPlaced', (data: any) => {
    if (data.auction.id === props.auctionId) {
      updateMetrics()
    }
  })

  auctionService.on('auctionExtended', (data: any) => {
    if (data.auctionId === props.auctionId) {
      updateMetrics()
      addToast({
        type: 'info',
        title: `Müzayede ${data.extendWindow}s uzatıldı!`
      })
    }
  })

  auctionService.on('sellerDiscountApplied', (data: any) => {
    if (data.auctionId === props.auctionId) {
      updateMetrics()
    }
  })
})

onUnmounted(() => {
  // Cleanup
  if (metricsInterval) {
    clearInterval(metricsInterval)
  }
  
  // Remove event listeners
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})

// Emits
const emit = defineEmits<{
  switchNextItem: []
  auctionEnded: []
}>()

// Composables
const { addToast } = useToast()
</script>

<style scoped>
/* Ensure panel stays on top and is accessible */
.fixed {
  pointer-events: auto;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  :deep(.min-w-\[320px\]) {
    min-width: 280px;
  }
  
  :deep(.max-w-\[400px\]) {
    max-width: calc(100vw - 40px);
  }
  
  :deep(.grid-cols-2) {
    grid-template-columns: 1fr 1fr;
  }
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
