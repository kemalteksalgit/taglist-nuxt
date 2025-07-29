<template>
  <!-- FOMO Alert for Live Auctions -->
  <Teleport to="body">
    <div v-if="isVisible && shouldShowFomo" 
         class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-500">
      
      <div class="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-white/20">
        
        <!-- Header with urgency indicator -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span class="font-bold text-sm uppercase tracking-wide">Son Saniyeler!</span>
          </div>
          <button @click="dismiss" class="text-white/80 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Main FOMO Message -->
        <div class="space-y-3">
          <h3 class="text-xl font-bold leading-tight">
            {{ currentBid.toLocaleString('tr-TR') }}₺ → {{ suggestedBid.toLocaleString('tr-TR') }}₺
          </h3>
          <p class="text-white/90 text-sm">
            Fiyatı <strong>{{ bidIncrement.toLocaleString('tr-TR') }}₺</strong> artır, kazanma şansını katla!
          </p>
          
          <!-- Countdown Timer -->
          <div class="flex items-center space-x-2 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">
              Kalan süre: <span class="font-bold text-yellow-300">{{ formatTime(timeLeft) }}</span>
            </span>
          </div>

          <!-- Current Leader Info -->
          <div v-if="currentLeader" class="flex items-center space-x-2 text-sm bg-white/20 rounded-lg p-2">
            <div class="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">
              🏆
            </div>
            <span class="text-white/90">
              <strong>{{ currentLeader.name }}</strong> önde gidiyor
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3 mt-6">
          <button @click="quickBid" 
                  class="flex-1 bg-white text-orange-600 py-3 px-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            🚀 Hızla Artır
          </button>
          <button @click="openBidModal" 
                  class="flex-1 bg-white/20 text-white py-3 px-4 rounded-xl font-medium hover:bg-white/30 transition-all duration-200 border border-white/30">
            ⚡ Özel Teklif
          </button>
        </div>

        <!-- Social Proof -->
        <div class="mt-4 flex items-center justify-center space-x-4 text-xs text-white/80">
          <div class="flex items-center space-x-1">
            <span>👥</span>
            <span>{{ activeViewers }} kişi izliyor</span>
          </div>
          <div class="flex items-center space-x-1">
            <span>🔥</span>
            <span>{{ totalBids }} teklif verildi</span>
          </div>
        </div>

        <!-- Auto-bid Option -->
        <div v-if="!hasAutoBid" class="mt-4 p-3 bg-white/10 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <p class="font-medium">Otomatik teklif</p>
              <p class="text-white/70 text-xs">Max. bütçen kadar otomatik artır</p>
            </div>
            <button @click="setupAutoBid"
                    class="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
              Aktifleştir
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// FOMO Component for Live Auctions - 2025 UX Engagement System

interface Bidder {
  id: string
  name: string
  avatar?: string
}

interface Props {
  auctionId: string
  currentBid: number
  timeLeft: number // seconds
  activeViewers: number
  totalBids: number
  currentLeader?: Bidder
  minimumIncrement?: number
  isLastMinute?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minimumIncrement: 50,
  isLastMinute: false
})

// Emits
const emit = defineEmits<{
  placeBid: [amount: number]
  openBidModal: []
  setupAutoBid: [maxAmount: number]
}>()

// State
const isVisible = ref(false)
const hasAutoBid = ref(false)

// Computed
const bidIncrement = computed(() => {
  // Smart increment calculation based on current bid
  if (props.currentBid < 1000) return 50
  if (props.currentBid < 5000) return 100
  if (props.currentBid < 10000) return 250
  return 500
})

const suggestedBid = computed(() => {
  return props.currentBid + bidIncrement.value
})

const shouldShowFomo = computed(() => {
  // Show FOMO in last 60 seconds or when in last minute mode
  return props.timeLeft <= 60 || props.isLastMinute
})

// Methods
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const quickBid = () => {
  emit('placeBid', suggestedBid.value)
  // Show success feedback
  showBidFeedback()
}

const openBidModal = () => {
  emit('openBidModal')
  dismiss()
}

const setupAutoBid = () => {
  // Simple auto-bid setup - in real app this would open a modal
  const maxAmount = suggestedBid.value * 2
  emit('setupAutoBid', maxAmount)
  hasAutoBid.value = true
}

const showBidFeedback = () => {
  // Visual feedback for successful bid
  const button = document.querySelector('[data-quick-bid]') as HTMLElement
  if (button) {
    button.style.transform = 'scale(1.1)'
    setTimeout(() => {
      button.style.transform = 'scale(1)'
    }, 200)
  }
}

const show = () => {
  if (shouldShowFomo.value) {
    isVisible.value = true
  }
}

const dismiss = () => {
  isVisible.value = false
}

// Watch for auction changes
watch(() => props.timeLeft, (newTime) => {
  if (newTime <= 60 && !isVisible.value) {
    show()
  }
  if (newTime <= 0) {
    dismiss()
  }
})

watch(() => props.currentBid, () => {
  // Show FOMO when someone else bids in last minute
  if (shouldShowFomo.value && !isVisible.value) {
    show()
  }
})

// Auto-show when component mounts if conditions are met
onMounted(() => {
  if (shouldShowFomo.value) {
    setTimeout(() => show(), 1000) // Delay for better UX
  }
})

// Expose methods
defineExpose({
  show,
  dismiss
})
</script>

<style scoped>
@keyframes slide-in-from-bottom {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.slide-in-from-bottom {
  animation: slide-in-from-bottom 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
