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
      />
      <!-- Video Overlay Gradient -->
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>
    </div>

    <!-- TOP: Money-First Header -->
    <div class="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4">
      <div class="flex items-center justify-between">
        <!-- Left: Product Price Info -->
        <div class="flex items-center space-x-4">
          <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <div class="text-white text-xs font-medium">💰 Mevcut Fiyat</div>
            <div class="text-white text-2xl font-bold">{{ formatPrice(auctionState.currentPrice) }}</div>
          </div>
          
          <div class="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <div class="text-green-100 text-xs">📈 Toplam Değer</div>
            <div class="text-green-100 text-lg font-bold">{{ formatPrice(auctionState.totalValue) }}</div>
          </div>

          <div v-if="auctionState.instantBuyPrice" class="bg-red-500/20 backdrop-blur-sm rounded-lg px-3 py-2">
            <div class="text-red-100 text-xs">⚡ Hemen Al</div>
            <div class="text-red-100 text-lg font-bold">{{ formatPrice(auctionState.instantBuyPrice) }}</div>
          </div>
        </div>

        <!-- Right: Live Stats -->
        <div class="flex items-center space-x-3">
          <div class="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
            <div class="text-white text-xs">💎 Teklif Sayısı</div>
            <div class="text-white text-lg font-bold">{{ auctionState.totalBids }}</div>
          </div>
          
          <button @click="$emit('close')" class="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- BOTTOM: Money Action Panel -->
    <div class="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
      <!-- Quick Money Actions -->
      <div class="flex items-center space-x-3 mb-4">
        <!-- Instant Bid Buttons -->
        <div class="flex space-x-2">
          <button
            v-for="amount in quickBidAmounts.slice(0, 3)"
            :key="amount"
            @click="quickBid(amount)"
            class="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {{ formatPrice(amount) }}
          </button>
        </div>

        <!-- Custom Bid Button -->
        <button 
          @click="showBidModal = true"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors"
        >
          💰 Özel Teklif
        </button>

        <!-- Instant Buy Button -->
        <button 
          v-if="auctionState.instantBuyPrice"
          @click="handleInstantBuy"
          class="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors"
        >
          ⚡ {{ formatPrice(auctionState.instantBuyPrice) }} Hemen Al
        </button>
      </div>

      <!-- Money Messages Input -->
      <div class="flex items-center space-x-3">
        <div class="flex-1 relative">
          <input
            v-model="messageText"
            type="text"
            placeholder="💸 Para ile mesaj gönder (min 5₺)..."
            class="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-green-400"
            @keyup.enter="sendMoneyMessage"
          />
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <input
              v-model="messageAmount"
              type="number"
              min="5"
              placeholder="₺"
              class="w-16 px-2 py-1 bg-green-600/30 border border-green-400/50 rounded text-white text-sm placeholder-green-200"
            />
          </div>
        </div>
        
        <button 
          @click="sendMoneyMessage"
          :disabled="!canSendMoneyMessage"
          class="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
        >
          💸 Gönder
        </button>
      </div>
    </div>

    <!-- RIGHT PANEL: Live Money Feed -->
    <div class="absolute top-16 right-4 bottom-32 w-80 z-20">
      <div class="h-full bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 flex flex-col">
        <!-- Feed Header -->
        <div class="p-4 border-b border-white/20">
          <div class="flex items-center justify-between">
            <h3 class="text-white font-bold">💰 Canlı Para Akışı</h3>
            <div class="text-green-400 text-sm font-mono">{{ formatPrice(auctionState.currentPrice) }}</div>
          </div>
          
          <!-- Top Bidders Mini -->
          <div class="mt-2 flex space-x-2">
            <div 
              v-for="bidder in topBidders.slice(0, 3)" 
              :key="bidder.userId"
              class="flex-1 bg-yellow-500/20 rounded px-2 py-1"
            >
              <div class="text-yellow-100 text-xs font-bold">{{ bidder.userName }}</div>
              <div class="text-yellow-200 text-xs">{{ formatPrice(bidder.totalSpent) }}</div>
            </div>
          </div>
        </div>

        <!-- Live Bids Feed -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- Real Bids Only -->
          <div 
            v-for="bid in liveBids.slice(0, 20)" 
            :key="bid.id"
            :class="[
              'p-3 rounded-lg border-l-4 transition-all',
              bid.isInstantBuy 
                ? 'bg-red-500/20 border-red-400' 
                : bid.status === 'winning' 
                  ? 'bg-green-500/20 border-green-400'
                  : 'bg-blue-500/20 border-blue-400'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <img :src="bid.userAvatar" :alt="bid.userName" class="w-6 h-6 rounded-full" />
                <span class="text-white font-medium text-sm">{{ bid.userName }}</span>
                <span v-if="bid.isInstantBuy" class="text-red-400 text-xs">⚡</span>
              </div>
              <div class="text-right">
                <div class="text-white font-bold">{{ formatPrice(bid.amount) }}</div>
                <div class="text-gray-300 text-xs">{{ formatTime(bid.timestamp) }}</div>
              </div>
            </div>
          </div>

          <!-- Money Messages -->
          <div 
            v-for="offer in monetaryOffers.slice(0, 10)" 
            :key="offer.id"
            :class="[
              'p-3 rounded-lg border-l-4 transition-all',
              offer.highlighted 
                ? 'bg-yellow-500/20 border-yellow-400' 
                : 'bg-purple-500/20 border-purple-400'
            ]"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-white font-medium text-sm">{{ offer.userName }}</span>
              <span class="text-yellow-400 font-bold text-sm">{{ formatPrice(offer.amount) }}</span>
            </div>
            <p class="text-gray-200 text-sm">{{ offer.message }}</p>
            <div class="text-gray-400 text-xs mt-1">{{ formatTime(offer.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bid Modal -->
    <LivestreamBidModal 
      v-if="showBidModal"
      :product="productData"
      @close="showBidModal = false"
      @place-bid="handlePlaceBid"
    />

    <!-- Success/Error Messages -->
    <div v-if="statusMessage" class="absolute top-20 left-1/2 transform -translate-x-1/2 z-40">
      <div :class="[
        'px-6 py-3 rounded-lg font-bold text-white',
        statusMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]">
        {{ statusMessage.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLiveAuction } from '~/composables/useLiveAuction'

// Props
const props = defineProps<{
  streamData: {
    id: string
    videoUrl: string
    seller: any
    product: any
  }
}>()

// Emits
const emit = defineEmits(['close'])

// Live auction composable - MONEY ONLY
const {
  auctionState,
  liveBids,
  monetaryOffers,
  userBidState,
  topBidders,
  placeBid,
  instantBuy,
  sendMonetaryOffer,
  formatPrice
} = useLiveAuction(props.streamData.id)

// UI State
const showBidModal = ref(false)
const messageText = ref('')
const messageAmount = ref(5) // Minimum 5 TL for messages
const statusMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

// Quick bid amounts - calculated based on current price
const quickBidAmounts = computed(() => {
  const current = auctionState.currentPrice
  const increment = auctionState.minimumIncrement
  
  return [
    current + increment,
    current + (increment * 2),
    current + (increment * 5),
    Math.round(current * 1.25),
    Math.round(current * 1.5),
    Math.round(current * 2)
  ].filter((amount, index, arr) => arr.indexOf(amount) === index)
   .sort((a, b) => a - b)
   .slice(0, 6)
})

// Product data for modal
const productData = computed(() => ({
  id: props.streamData.product?.id || 'live-product',
  name: props.streamData.product?.name || 'Canlı Açık Artırma',
  image: props.streamData.product?.image || '/placeholder-product.jpg',
  currentBid: auctionState.currentPrice,
  auctionEnd: auctionState.endsAt
}))

// Can send money message
const canSendMoneyMessage = computed(() => {
  return messageText.value.trim().length > 0 && 
         messageAmount.value >= 5 && 
         messageAmount.value <= 10000
})

// Quick bid action
const quickBid = async (amount: number) => {
  try {
    await placeBid(amount, 'card') // Default to card payment
    showStatus('success', `${formatPrice(amount)} teklif verildi!`)
  } catch (error: any) {
    showStatus('error', error?.message || 'Teklif verilemedi')
  }
}

// Handle instant buy
const handleInstantBuy = async () => {
  try {
    await instantBuy('card')
    showStatus('success', 'Ürün başarıyla satın alındı!')
    // Close auction or redirect
  } catch (error: any) {
    showStatus('error', error?.message || 'Satın alma başarısız')
  }
}

// Handle place bid from modal
const handlePlaceBid = async (bidData: any) => {
  try {
    await placeBid(bidData.amount, bidData.paymentMethod)
    showBidModal.value = false
    showStatus('success', `${formatPrice(bidData.amount)} teklif verildi!`)
  } catch (error: any) {
    showStatus('error', error?.message || 'Teklif verilemedi')
  }
}

// Send money message
const sendMoneyMessage = async () => {
  if (!canSendMoneyMessage.value) return
  
  try {
    await sendMonetaryOffer(messageAmount.value, messageText.value, 'question')
    showStatus('success', `${formatPrice(messageAmount.value)} ile mesaj gönderildi!`)
    messageText.value = ''
    messageAmount.value = 5
  } catch (error: any) {
    showStatus('error', error?.message || 'Mesaj gönderilemedi')
  }
}

// Show status message
const showStatus = (type: 'success' | 'error', text: string) => {
  statusMessage.value = { type, text }
  setTimeout(() => {
    statusMessage.value = null
  }, 3000)
}

// Format time
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Initialize auction
onMounted(() => {
  // Set initial auction state
  auctionState.currentPrice = props.streamData.product?.startingPrice || 100
  auctionState.instantBuyPrice = props.streamData.product?.buyNowPrice || auctionState.currentPrice * 3
  auctionState.minimumIncrement = 50
})
</script>

<style scoped>
/* Custom scrollbar for feed */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
