<template>
  <!-- Floating Seller Panel - Only visible during live streams -->
  <div v-if="isSellerMode && isLivestreaming" 
       class="fixed top-20 right-4 z-40 w-80 animate-in slide-in-from-right duration-500">
    
    <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span class="font-semibold text-sm">CANLI</span>
          </div>
          <button @click="togglePanel" 
                  class="text-white/80 hover:text-white transition-colors">
            <svg v-if="!isMinimized" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div v-if="!isMinimized" class="mt-2">
          <h3 class="font-bold text-lg">Satıcı Paneli</h3>
          <p class="text-white/80 text-sm">{{ currentMode === 'auction' ? 'Açık Artırma' : 'Canlı Satış' }} Modu</p>
        </div>
      </div>

      <!-- Panel Content -->
      <div v-if="!isMinimized" class="p-4 space-y-4">
        
        <!-- Live Stats -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-blue-50 rounded-xl p-3 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ stats.viewers }}</div>
            <div class="text-xs text-gray-600">👥 İzleyici</div>
          </div>
          <div class="bg-green-50 rounded-xl p-3 text-center">
            <div class="text-2xl font-bold text-green-600">{{ stats.sales.toLocaleString('tr-TR') }}₺</div>
            <div class="text-xs text-gray-600">💰 Satış</div>
          </div>
        </div>

        <!-- Mode-Specific Content -->
        <div v-if="currentMode === 'auction'" class="space-y-3">
          <!-- Auction Controls -->
          <div class="bg-orange-50 rounded-xl p-3">
            <h4 class="font-semibold text-sm text-orange-800 mb-2">🏆 Aktif Artırma</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Mevcut Teklif:</span>
                <span class="font-bold text-orange-600">{{ currentBid.toLocaleString('tr-TR') }}₺</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Teklif Sayısı:</span>
                <span class="font-semibold">{{ bidCount }}</span>
              </div>
              <div v-if="lastBidder" class="flex justify-between text-sm">
                <span class="text-gray-600">Son Teklif:</span>
                <span class="font-semibold text-green-600">{{ lastBidder.name }}</span>
              </div>
            </div>
          </div>

          <!-- Auction Timer Control -->
          <div class="bg-red-50 rounded-xl p-3">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-sm text-red-800">⏰ Süre Kontrolü</h4>
              <span class="text-lg font-bold text-red-600">{{ formatTime(auctionTimeLeft) }}</span>
            </div>
            <div class="flex space-x-2">
              <button @click="extendAuction" 
                      class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 rounded-lg transition-colors">
                +30sn
              </button>
              <button @click="endAuction" 
                      class="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg transition-colors">
                Bitir
              </button>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3">
          <!-- Live Commerce Controls -->
          <div class="bg-purple-50 rounded-xl p-3">
            <h4 class="font-semibold text-sm text-purple-800 mb-2">📦 Ürün Satışı</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Satılan Ürün:</span>
                <span class="font-bold text-purple-600">{{ stats.itemsSold }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Sepete Eklenen:</span>
                <span class="font-semibold">{{ stats.cartAdds }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat & Engagement -->
        <div class="bg-gray-50 rounded-xl p-3">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-sm text-gray-800">💬 Sohbet</h4>
            <div class="flex items-center space-x-1">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-xs text-gray-600">{{ unreadMessages }} yeni</span>
            </div>
          </div>
          <div class="space-y-1 max-h-20 overflow-y-auto text-xs">
            <div v-for="message in recentMessages" :key="message.id" 
                 class="p-1 bg-white rounded text-gray-700">
              <strong>{{ message.user }}:</strong> {{ message.text }}
            </div>
          </div>
          <button @click="openFullChat" 
                  class="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 rounded-lg transition-colors">
            Sohbeti Aç
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-2">
          <h4 class="font-semibold text-sm text-gray-800">⚡ Hızlı Aksiyonlar</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="shareProduct" 
                    class="bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-lg transition-colors">
              📱 Paylaş
            </button>
            <button @click="showProduct" 
                    class="bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded-lg transition-colors">
              📸 Göster
            </button>
            <button v-if="currentMode !== 'auction'" @click="startAuction" 
                    class="bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 rounded-lg transition-colors">
              🏆 Artırma
            </button>
            <button @click="endStream" 
                    class="bg-red-500 hover:bg-red-600 text-white text-xs py-2 rounded-lg transition-colors">
              🔴 Bitir
            </button>
          </div>
        </div>

      </div>

      <!-- Minimized View -->
      <div v-else class="p-2">
        <div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{{ stats.viewers }} izleyici</span>
          <span>•</span>
          <span>{{ stats.sales.toLocaleString('tr-TR') }}₺</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Modern Seller Dashboard Panel - 2025 Live Commerce UX

interface SellerStats {
  viewers: number
  sales: number
  itemsSold: number
  cartAdds: number
}

interface ChatMessage {
  id: string
  user: string
  text: string
  timestamp: number
}

interface Bidder {
  id: string
  name: string
}

interface Props {
  isSellerMode: boolean
  isLivestreaming: boolean
  currentMode: 'live' | 'auction'
  stats: SellerStats
  currentBid?: number
  bidCount?: number
  lastBidder?: Bidder
  auctionTimeLeft?: number
  unreadMessages: number
  recentMessages: ChatMessage[]
}

const props = withDefaults(defineProps<Props>(), {
  currentBid: 0,
  bidCount: 0,
  auctionTimeLeft: 0
})

// Emits
const emit = defineEmits<{
  extendAuction: [seconds: number]
  endAuction: []
  startAuction: []
  endStream: []
  shareProduct: []
  showProduct: []
  openFullChat: []
}>()

// State
const isMinimized = ref(false)

// Methods
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const togglePanel = () => {
  isMinimized.value = !isMinimized.value
}

const extendAuction = () => {
  emit('extendAuction', 30)
}

const endAuction = () => {
  emit('endAuction')
}

const startAuction = () => {
  emit('startAuction')
}

const endStream = () => {
  if (confirm('Canlı yayını sonlandırmak istediğinize emin misiniz?')) {
    emit('endStream')
  }
}

const shareProduct = () => {
  emit('shareProduct')
}

const showProduct = () => {
  emit('showProduct')
}

const openFullChat = () => {
  emit('openFullChat')
}

// Auto-minimize when many unread messages
watch(() => props.unreadMessages, (newCount) => {
  if (newCount > 10 && !isMinimized.value) {
    // Pulse notification
    const panel = document.querySelector('[data-seller-panel]')
    if (panel) {
      panel.classList.add('animate-pulse')
      setTimeout(() => panel.classList.remove('animate-pulse'), 2000)
    }
  }
})
</script>

<style scoped>
@keyframes slide-in-from-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-from-right {
  animation: slide-in-from-right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Custom scrollbar for chat */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
