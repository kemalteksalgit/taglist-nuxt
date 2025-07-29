<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" @click="$emit('close')">
    <div 
      class="bg-white rounded-2xl w-full max-w-md mx-4 p-6 transform transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900">Teklif Ver</h3>
        <button 
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Icon name="mdi:close" class="w-5 h-5" />
        </button>
      </div>

      <!-- Product Info -->
      <div class="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <img 
          :src="product.image" 
          :alt="product.name"
          class="w-16 h-16 object-cover rounded-lg"
        >
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900">{{ product.name }}</h4>
          <div class="flex items-center space-x-2 mt-1">
            <span class="text-green-600 font-bold">{{ formatPrice(product.currentBid) }}</span>
            <span class="text-xs text-gray-500">güncel teklif</span>
          </div>
          <div class="text-sm text-orange-600 font-mono">
            {{ formatCountdown(product.auctionEnd) }} kaldı
          </div>
        </div>
      </div>

      <!-- Current Bid Status -->
      <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-green-700 font-medium">💰 En Yüksek Teklif</span>
          <span class="text-xl font-bold text-green-800">{{ formatPrice(product.currentBid) }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-green-600">Minimum artış: {{ formatPrice(minBidIncrement) }}</span>
          <span class="text-blue-600 font-mono">⏰ {{ formatCountdown(product.auctionEnd) }}</span>
        </div>
        <div class="mt-2 text-xs text-gray-600">
          💡 Yeni teklifiniz en az <span class="font-bold text-green-700">{{ formatPrice(minBidAmount) }}</span> olmalıdır
        </div>
      </div>

      <!-- Quick Bid Amounts -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">🚀 Hızlı Teklif Seçenekleri</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="amount in quickBidAmounts"
            :key="amount"
            @click="bidAmount = amount"
            :class="[
              'p-3 rounded-lg border-2 transition-all font-bold text-sm',
              bidAmount === amount 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
            ]"
          >
            {{ formatPrice(amount) }}
            <div class="text-xs font-normal opacity-75">
              +{{ formatPrice(amount - product.currentBid) }}
            </div>
          </button>
        </div>
      </div>

      <!-- Bid Amount Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Teklif Miktarı (TL)</label>
        <div class="relative">
          <input
            v-model="bidAmount"
            type="number"
            :min="minBidAmount"
            :step="bidIncrement"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-semibold"
            :class="{ 
              'border-red-500': bidAmount < minBidAmount && bidAmount > 0,
              'border-green-500': bidAmount >= minBidAmount
            }"
            placeholder="Teklif miktarını girin"
          >
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">TL</div>
        </div>
        <div v-if="bidAmount < minBidAmount && bidAmount > 0" class="text-red-500 text-xs mt-1">
          Minimum teklif miktarı {{ formatPrice(minBidAmount) }}
        </div>
      </div>

      <!-- Quick Bid Buttons -->
      <div class="grid grid-cols-3 gap-2 mb-6">
        <button
          v-for="increment in quickIncrements"
          :key="increment"
          @click="bidAmount = product.currentBid + increment"
          class="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          +{{ formatPrice(increment) }}
        </button>
      </div>

      <!-- Auto Bid Toggle -->
      <div class="border border-gray-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between mb-3">
          <span class="font-medium text-gray-900">Otomatik Teklif</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              v-model="autoBidEnabled" 
              type="checkbox" 
              class="sr-only peer"
            >
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div v-if="autoBidEnabled" class="space-y-3">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Maksimum Otomatik Teklif</label>
            <input
              v-model="maxAutoBid"
              type="number"
              :min="bidAmount"
              :step="bidIncrement"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="En yüksek otomatik teklif"
            >
          </div>
          <p class="text-xs text-gray-500">
            Sistem, belirlediğiniz limite kadar otomatik olarak teklif verecek
          </p>
        </div>
      </div>

      <!-- Bid Actions -->
      <div class="flex space-x-3">
        <button
          @click="$emit('close')"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          İptal
        </button>
        <button
          @click="placeBid"
          :disabled="!isValidBid || isPlacingBid"
          class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isPlacingBid">Teklif Veriliyor...</span>
          <span v-else>{{ formatPrice(bidAmount) }} Teklif Ver</span>
        </button>
      </div>

      <!-- Bid History (small preview) -->
      <div class="mt-6 border-t pt-4">
        <h4 class="text-sm font-medium text-gray-900 mb-3">Son Teklifler</h4>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div 
            v-for="bid in recentBids" 
            :key="bid.id"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center space-x-2">
              <img :src="bid.avatar" :alt="bid.bidder" class="w-6 h-6 rounded-full">
              <span class="text-gray-600">{{ bid.bidder }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-gray-900">{{ formatPrice(bid.amount) }}</span>
              <span class="text-xs text-gray-500">{{ formatTime(bid.time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props & Emits
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'place-bid'])

// Reactive data
const bidAmount = ref(0)
const autoBidEnabled = ref(false)
const maxAutoBid = ref(0)
const isPlacingBid = ref(false)
const currentTime = ref(new Date())

// Computed values
const bidIncrement = computed(() => {
  // Dynamic increment based on current bid
  const current = props.product.currentBid
  if (current < 1000) return 50
  if (current < 5000) return 100
  if (current < 10000) return 250
  if (current < 50000) return 500
  return 1000
})

const minBidAmount = computed(() => {
  return props.product.currentBid + bidIncrement.value
})

const minBidIncrement = computed(() => {
  return bidIncrement.value
})

// Quick bid amounts - smart money-based suggestions
const quickBidAmounts = computed(() => {
  const current = props.product.currentBid
  const min = minBidAmount.value
  
  return [
    min, // Minimum bid
    min + bidIncrement.value, // Small jump
    min + (bidIncrement.value * 3), // Medium jump
    Math.round(current * 1.25), // 25% increase - psychological jump
    Math.round(current * 1.5), // 50% increase - serious bid
    Math.round(current * 2) // Double - aggressive bid
  ].filter((amount, index, arr) => arr.indexOf(amount) === index) // Remove duplicates
   .sort((a, b) => a - b) // Sort ascending
   .slice(0, 6) // Limit to 6 options
})

const quickIncrements = computed(() => {
  const base = bidIncrement.value
  return [base, base * 2, base * 5]
})

const isValidBid = computed(() => {
  return bidAmount.value >= minBidAmount.value && bidAmount.value > 0
})

// Mock recent bids
const recentBids = ref([
  {
    id: 1,
    bidder: 'Ahmet K.',
    amount: props.product.currentBid,
    time: new Date(Date.now() - 2 * 60 * 1000),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32'
  },
  {
    id: 2,
    bidder: 'Zeynep T.',
    amount: props.product.currentBid - 500,
    time: new Date(Date.now() - 5 * 60 * 1000),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b522?w=32'
  },
  {
    id: 3,
    bidder: 'Mehmet A.',
    amount: props.product.currentBid - 1000,
    time: new Date(Date.now() - 8 * 60 * 1000),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32'
  }
])

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price || 0) + ' TL'
}

const formatCountdown = (endTime) => {
  const now = currentTime.value
  const diff = endTime - now
  
  if (diff <= 0) return 'Bitti'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (hours > 0) {
    return `${hours}s ${minutes}d ${seconds}sn`
  } else if (minutes > 0) {
    return `${minutes}d ${seconds}sn`
  } else {
    return `${seconds}sn`
  }
}

const formatTime = (time) => {
  const now = new Date()
  const diff = now - time
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return 'Az önce'
  if (minutes < 60) return `${minutes}d önce`
  
  const hours = Math.floor(minutes / 60)
  return `${hours}s önce`
}

const placeBid = async () => {
  if (!isValidBid.value || isPlacingBid.value) return
  
  isPlacingBid.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const bidData = {
      productId: props.product.id,
      amount: bidAmount.value,
      autoBidEnabled: autoBidEnabled.value,
      maxAutoBid: maxAutoBid.value,
      timestamp: new Date()
    }
    
    emit('place-bid', bidData)
  } catch (error) {
    console.error('Bid placement failed:', error)
    // Handle error
  } finally {
    isPlacingBid.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Set initial bid amount to minimum
  bidAmount.value = minBidAmount.value
  maxAutoBid.value = minBidAmount.value * 2
  
  // Update time every second
  const timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
  
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})
</script>

<style scoped>
/* Custom number input styling */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Scrollbar for bid history */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
