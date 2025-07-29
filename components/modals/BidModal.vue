<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="close">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold">Teklif Ver</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>
      
      <!-- Product Info -->
      <div v-if="auction" class="space-y-4">
        <div class="flex items-center space-x-4">
          <img
            :src="auction.image"
            :alt="auction.title"
            class="w-16 h-16 object-cover rounded-lg"
          >
          <div class="flex-1">
            <h4 class="font-semibold line-clamp-2">{{ auction.title }}</h4>
            <p class="text-sm text-gray-600">Güncel: {{ formatPrice(currentBid) }}</p>
            <p class="text-xs text-red-600">{{ bidders }} kişi teklif veriyor</p>
          </div>
        </div>

        <!-- Real-time bid updates -->
        <div v-if="recentBids.length > 0" class="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
          <p class="text-sm font-medium text-gray-700 mb-2">Son Teklifler:</p>
          <div class="space-y-1">
            <div 
              v-for="bid in recentBids" 
              :key="bid.id"
              class="flex justify-between text-xs"
              :class="bid.isOwn ? 'text-blue-600 font-medium' : 'text-gray-600'"
            >
              <span>{{ bid.bidderName }}</span>
              <span>{{ formatPrice(bid.amount) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Bid Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Teklif Miktarı (TL)
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="bidAmount"
            type="number"
            :min="minBidAmount"
            step="100"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
            :placeholder="`En az ${formatPrice(minBidAmount)}`"
            :class="{ 'border-red-500': bidError }"
          >
          <p v-if="bidError" class="mt-1 text-sm text-red-600">{{ bidError }}</p>
        </div>
        
        <!-- Quick Bid Buttons -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="increment in quickIncrements"
            :key="increment"
            @click="setBidAmount(currentBid + increment)"
            class="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            +{{ formatPrice(increment) }}
          </button>
        </div>

        <!-- Bid Progress -->
        <div class="bg-gray-100 rounded-lg p-3">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Başlangıç</span>
            <span>Hedef</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              class="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
              :style="{ width: `${Math.min((currentBid / auction.targetPrice) * 100, 100)}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ formatPrice(auction.startingPrice) }}</span>
            <span>{{ formatPrice(auction.targetPrice) }}</span>
          </div>
        </div>

        <!-- Auto-bid Option -->
        <div class="bg-blue-50 rounded-lg p-3">
          <label class="flex items-center">
            <input 
              v-model="enableAutoBid" 
              type="checkbox" 
              class="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="ml-2 text-sm font-medium text-blue-800">Otomatik Teklif</span>
          </label>
          <p class="text-xs text-blue-600 mt-1">
            Size karşı verilen tekliflere otomatik olarak karşılık verir
          </p>
          <div v-if="enableAutoBid" class="mt-2">
            <input
              v-model="maxAutoBid"
              type="number"
              :min="parseInt(bidAmount) || minBidAmount"
              class="w-full px-3 py-2 border border-blue-300 rounded text-sm"
              placeholder="Maksimum otomatik teklif"
            >
          </div>
        </div>

        <!-- Time Warning -->
        <div v-if="timeRemaining < 300000" class="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div class="flex items-center">
            <Icon name="mdi:clock-alert" class="text-orange-600 mr-2" />
            <p class="text-sm text-orange-800">
              <span class="font-medium">Dikkat:</span> 
              Açık artırma {{ formatTimeRemaining(auction.endTime) }} sonra bitiyor!
            </p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            @click="close"
            class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            İptal
          </button>
          <button
            @click="submitBid"
            :disabled="!canSubmitBid || isLoading"
            class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Icon v-if="isLoading" name="mdi:loading" class="animate-spin mr-2" />
            {{ isLoading ? 'Gönderiliyor...' : 'Teklif Ver' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuction } from '~/composables/useAuction'

interface Auction {
  id: string
  title: string
  image: string
  currentBid: number
  startingPrice: number
  targetPrice: number
  minIncrement: number
  endTime: string | Date
  bidCount: number
}

interface Bid {
  id: string
  amount: number
  bidderName: string
  timestamp: string
  isOwn: boolean
}

const props = defineProps<{
  show: boolean
  auction: Auction | null
}>()

const emit = defineEmits<{
  close: []
  submit: [data: {
    auctionId: string
    amount: number
    enableAutoBid: boolean
    maxAutoBid?: number
  }]
}>()

// Composables
const { placeBid, getAuctionBids } = useAuction()
const { handleError } = useErrorHandler()
const authStore = useAuthStore()

// State
const bidAmount = ref('')
const enableAutoBid = ref(false)
const maxAutoBid = ref('')
const isLoading = ref(false)
const bidError = ref('')
const currentBid = ref(0)
const bidders = ref(0)
const recentBids = ref<Bid[]>([])
const timeRemaining = ref(0)

// Computed
const minBidAmount = computed(() => {
  if (!props.auction) return 0
  return currentBid.value + props.auction.minIncrement
})

const quickIncrements = computed(() => {
  if (!props.auction) return []
  const base = props.auction.minIncrement
  return [base, base * 5, base * 10]
})

const canSubmitBid = computed(() => {
  const amount = parseInt(bidAmount.value)
  return amount && amount >= minBidAmount.value && !bidError.value
})

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
}

const formatTimeRemaining = (endTime: string | Date) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Sona erdi'
  
  const minutes = Math.floor(diff / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  if (minutes > 0) {
    return `${minutes}d ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

const setBidAmount = (amount: number) => {
  bidAmount.value = amount.toString()
  validateBid()
}

const validateBid = () => {
  bidError.value = ''
  const amount = parseInt(bidAmount.value)
  
  if (!amount) {
    bidError.value = 'Teklif miktarı gerekli'
    return
  }
  
  if (amount < minBidAmount.value) {
    bidError.value = `Minimum teklif ${formatPrice(minBidAmount.value)}`
    return
  }
  
  if (amount > 10000000) {
    bidError.value = 'Teklif çok yüksek'
    return
  }
}

const submitBid = async () => {
  if (!canSubmitBid.value || !props.auction) return
  
  isLoading.value = true
  bidError.value = ''
  
  try {
    const bidData = {
      auctionId: props.auction.id,
      amount: parseInt(bidAmount.value),
      enableAutoBid: enableAutoBid.value,
      maxAutoBid: maxAutoBid.value ? parseInt(maxAutoBid.value) : undefined
    }
    
    await placeBid(bidData.auctionId, bidData.amount, {
      enableAutoBid: bidData.enableAutoBid,
      maxAutoBid: bidData.maxAutoBid
    })
    
    emit('submit', bidData)
    close()
  } catch (error: any) {
    handleError(error as Error, { action: 'submit_bid' })
    
    if (error?.message?.includes('outbid')) {
      bidError.value = 'Başka bir kullanıcı daha yüksek teklif verdi'
      // Refresh current bid
      await loadAuctionData()
    } else if (error?.message?.includes('ended')) {
      bidError.value = 'Açık artırma sona erdi'
    } else {
      bidError.value = 'Teklif verilemedi. Lütfen tekrar deneyin.'
    }
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  emit('close')
  bidAmount.value = ''
  enableAutoBid.value = false
  maxAutoBid.value = ''
  bidError.value = ''
}

const loadAuctionData = async () => {
  if (!props.auction) return
  
  try {
    const bids = await getAuctionBids(props.auction.id)
    recentBids.value = bids.slice(0, 5) // Show last 5 bids
    
    if (bids.length > 0) {
      currentBid.value = bids[0].amount
      bidders.value = new Set(bids.map((b: any) => b.bidderName)).size
    } else {
      currentBid.value = props.auction.currentBid
      bidders.value = props.auction.bidCount || 0
    }
  } catch (error) {
    handleError(error as Error, { action: 'load_auction_data' })
    // Fallback to props data
    currentBid.value = props.auction.currentBid
    bidders.value = props.auction.bidCount || 0
  }
}

const updateTimeRemaining = () => {
  if (props.auction) {
    const now = new Date()
    const end = new Date(props.auction.endTime)
    timeRemaining.value = end.getTime() - now.getTime()
  }
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow && props.auction) {
    loadAuctionData()
    setBidAmount(minBidAmount.value)
    
    // Update time every second
    const timer = setInterval(updateTimeRemaining, 1000)
    
    // Cleanup on close
    watch(() => props.show, (showAgain) => {
      if (!showAgain) {
        clearInterval(timer)
      }
    })
  }
})

watch(() => bidAmount.value, validateBid)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
