<template>
  <NuxtLayout>
    <div class="min-h-screen bg-black text-white">
      <!-- Live Stream Header -->
      <div class="bg-gradient-to-r from-red-600 to-pink-600 py-4">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <NuxtLink to="/live" class="text-white hover:text-red-200 transition-colors">
                ← Geri
              </NuxtLink>
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span class="font-bold text-lg">CANLI YAYIN</span>
              </div>
            </div>
            <div class="flex items-center space-x-4 text-sm">
              <span>👥 {{ streamData.viewers }} izleyici</span>
              <span>⏰ {{ formatDuration(streamData.duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Stream Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-0 h-screen">
        
        <!-- Video Stream (Main) -->
        <div class="lg:col-span-3 bg-black relative">
          <div class="aspect-video bg-gray-800 relative">
            <!-- Video Player Placeholder -->
            <div class="w-full h-full flex items-center justify-center">
              <div class="text-center">
                <div class="text-6xl mb-4">📺</div>
                <h2 class="text-2xl font-bold mb-2">{{ streamData.title }}</h2>
                <p class="text-gray-300">Canlı yayın ID: {{ streamId }}</p>
              </div>
            </div>
            
            <!-- Stream Controls -->
            <div class="absolute bottom-4 left-4 right-4">
              <div class="bg-black bg-opacity-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <img
                      :src="streamData.sellerAvatar"
                      :alt="streamData.sellerName"
                      class="w-10 h-10 rounded-full"
                    >
                    <div>
                      <div class="font-semibold">{{ streamData.sellerName }}</div>
                      <div class="text-sm text-gray-300 flex items-center space-x-1">
                        <span>⭐</span>
                        <span>{{ streamData.sellerRating }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Volume Control -->
                  <div class="flex items-center space-x-2">
                    <button @click="toggleMute" class="text-white hover:text-gray-300">
                      <span v-if="isMuted">🔇</span>
                      <span v-else>🔊</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Showcase (Below Video) -->
          <div class="p-6">
            <h3 class="text-xl font-bold mb-4">Gösterilen Ürünler</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="product in streamData.products"
                :key="product.id"
                class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                @click="viewProduct(product.id)"
              >
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-full aspect-square object-cover rounded-lg mb-2"
                >
                <h4 class="font-semibold text-sm">{{ product.name }}</h4>
                <p class="text-green-400 font-bold">₺{{ product.price.toLocaleString('tr-TR') }}</p>
                
                <!-- Auction Badge -->
                <div v-if="product.hasAuction" class="mt-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                  🏆 Açık Artırma: ₺{{ product.currentBid.toLocaleString('tr-TR') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat & Interaction Sidebar -->
        <div class="lg:col-span-1 bg-gray-900 border-l border-gray-700 flex flex-col">
          
          <!-- Chat Header -->
          <div class="p-4 border-b border-gray-700">
            <h3 class="font-bold text-lg">Canlı Sohbet</h3>
            <p class="text-sm text-gray-400">{{ chatMessages.length }} mesaj</p>
          </div>

          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="text-sm"
            >
              <div class="flex items-start space-x-2">
                <img
                  :src="message.userAvatar"
                  :alt="message.userName"
                  class="w-6 h-6 rounded-full"
                >
                <div>
                  <span class="font-semibold text-blue-400">{{ message.userName }}:</span>
                  <span class="text-gray-300">{{ message.text }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="p-4 border-t border-gray-700">
            <div class="flex space-x-2">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="Mesaj yazın..."
                class="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
              <button
                @click="sendMessage"
                class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="p-4 border-t border-gray-700 space-y-2">
            <button
              v-if="streamData.hasActiveAuction"
              @click="openBidModal"
              class="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              🏆 Teklif Ver
            </button>
            <button
              @click="quickPurchase"
              class="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              💳 Hızlı Satın Al
            </button>
            <button
              @click="shareStream"
              class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              📤 Paylaş
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { mockLivestreamService } from '~/services/_stubs/MockLivestreamService'

// Get the stream ID from route params
const route = useRoute()
const streamId = route.params.id

// SEO and Meta Tags
useSeoMeta({
  title: `Canlı Yayın ${streamId} | TagList`,
  description: 'Canlı video yayınında satıcıyla gerçek zamanlı sohbet edin ve ürünleri hemen satın alın.',
  keywords: 'canlı yayın, live shopping, gerçek zamanlı alışveriş, video commerce',
  ogTitle: `Canlı Yayın - TagList`,
  ogDescription: 'Canlı video yayınında alışveriş yapın'
})

// Reactive state
const isMuted = ref(false)
const newMessage = ref('')
const isLoading = ref(true)

// Stream data - fetched from mock service
const streamData = ref({
  id: streamId,
  title: 'Yükleniyor...',
  sellerName: '',
  sellerAvatar: '',
  sellerRating: 0,
  viewers: 0,
  duration: 0,
  isLive: false,
  products: []
})

// Chat messages
const chatMessages = ref([
  {
    id: 1,
    userName: 'Ali_K',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
    text: 'Bu telefon gerçekten güzel görünüyor!'
  },
  {
    id: 2,
    userName: 'Ayşe_M',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b776?w=50',
    text: 'Fiyat çok iyi, hemen alıyorum'
  },
  {
    id: 3,
    userName: 'Mehmet_S',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
    text: 'Kargo ücreti var mı?'
  }
])

// Methods
const loadStreamData = async () => {
  try {
    isLoading.value = true
    const data = await mockLivestreamService.getStreamData(streamId)
    streamData.value = data
    
    // Join the stream
    await mockLivestreamService.joinStream(streamId)
  } catch (error) {
    console.error('Failed to load stream data:', error)
  } finally {
    isLoading.value = false
  }
}

const placeBid = async (amount) => {
  try {
    // Find the first product with auction
    const auctionProduct = streamData.value.products.find(p => p.hasAuction)
    if (auctionProduct) {
      await mockLivestreamService.placeBid(streamId, auctionProduct.id, amount)
      // Update local state optimistically
      auctionProduct.currentBid = amount
    }
  } catch (error) {
    console.error('Failed to place bid:', error)
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatMessages.value.push({
      id: Date.now(),
      userName: 'Sen',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
      text: newMessage.value
    })
    newMessage.value = ''
  }
}

const viewProduct = (productId) => {
  // In live stream context, we can view products
  navigateTo(`/product/${productId}`)
}

const openBidModal = () => {
  // Auction is allowed because we're in livestream context
}

const quickPurchase = () => {
  // Quick purchase functionality
}

const shareStream = () => {
  // Share functionality
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(async () => {
  // Load stream data and establish WebSocket connection for live chat and updates
  await loadStreamData()
  mockLivestreamService.startMockTimer()
})

onUnmounted(() => {
  // Clean up WebSocket connections
  mockLivestreamService.stopMockTimer()
  mockLivestreamService.leaveStream(streamId)
})
</script>

<style scoped>
/* Add any livestream-specific styles here */
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
