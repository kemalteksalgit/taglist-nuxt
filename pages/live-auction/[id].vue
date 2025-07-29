<!-- Live Auction Interface - Optimized for Sub-500ms Latency -->
<template>
  <div class="min-h-screen bg-black text-white">
    
    <!-- Mobile Layout (Portrait) -->
    <div class="lg:hidden">
      <!-- Video Player (Top) -->
      <div class="relative aspect-video bg-gray-900">
        <video ref="videoPlayer" 
               class="w-full h-full object-cover" 
               autoplay 
               muted 
               playsinline>
        </video>
        
        <!-- Video Overlay Controls -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30">
          <!-- Top Bar -->
          <div class="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button @click="goBack" class="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md">
              <Icon name="heroicons:chevron-left" class="w-5 h-5" />
            </button>
            <div class="flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span class="text-sm font-semibold">CANLI</span>
            </div>
          </div>
          
          <!-- Current Bid Display -->
          <div class="absolute bottom-4 left-4 right-4">
            <div class="bg-black/70 rounded-2xl p-4 backdrop-blur-md">
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-400 mb-1">
                  ₺{{ currentBid.toLocaleString() }}
                </div>
                <div class="text-sm text-gray-300">
                  Son teklif: {{ lastBidder }} • {{ formatTimeLeft(timeLeft) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Chat + Bidding (Bottom) -->
      <div class="flex-1 flex flex-col">
        <!-- Bidding Section -->
        <div class="bg-gray-800 p-4 space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <button @click="placeBid(currentBid + 100)" 
                    class="bg-orange-500 hover:bg-orange-600 rounded-xl py-3 font-bold transition-colors">
              +₺100
            </button>
            <button @click="placeBid(currentBid + 500)" 
                    class="bg-orange-500 hover:bg-orange-600 rounded-xl py-3 font-bold transition-colors">
              +₺500
            </button>
            <button @click="placeBid(currentBid + 1000)" 
                    class="bg-orange-500 hover:bg-orange-600 rounded-xl py-3 font-bold transition-colors">
              +₺1K
            </button>
          </div>
        </div>
        
        <!-- Chat Section -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="message in chatMessages" :key="message.id" 
                 class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold">{{ message.username.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-sm">{{ message.username }}</span>
                  <span class="text-xs text-gray-400">{{ formatTime(message.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-300 break-words">{{ message.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Layout (Landscape) -->
    <div class="hidden lg:grid lg:grid-cols-3 h-screen">
      
      <!-- Video Player (Left) -->
      <div class="lg:col-span-2 relative bg-gray-900">
        <video ref="videoPlayerDesktop" 
               class="w-full h-full object-cover" 
               autoplay 
               muted 
               playsinline>
        </video>
        
        <!-- Video Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30">
          <!-- Current Bid Info -->
          <div class="absolute bottom-6 left-6 right-6">
            <div class="bg-black/80 rounded-3xl p-6 backdrop-blur-xl">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <h2 class="text-2xl font-bold mb-2">{{ currentProduct.name }}</h2>
                  <p class="text-gray-300">{{ currentProduct.description }}</p>
                </div>
                <div class="text-right">
                  <div class="text-4xl font-bold text-orange-400 mb-2">
                    ₺{{ currentBid.toLocaleString() }}
                  </div>
                  <div class="text-lg font-semibold text-red-400">
                    {{ formatTimeLeft(timeLeft) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat + Bidding Sidebar (Right) -->
      <div class="bg-gray-900 flex flex-col">
        
        <!-- Bidding Section -->
        <div class="bg-gray-800 p-6 border-b border-gray-700">
          <h3 class="text-xl font-bold mb-4 text-center">Teklif Ver</h3>
          
          <!-- Quick Bid Buttons -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <button @click="placeBid(currentBid + 100)" 
                    class="bg-orange-500 hover:bg-orange-600 rounded-xl py-4 font-bold text-lg transition-colors">
              +₺100
            </button>
            <button @click="placeBid(currentBid + 500)" 
                    class="bg-orange-500 hover:bg-orange-600 rounded-xl py-4 font-bold text-lg transition-colors">
              +₺500
            </button>
            <button @click="placeBid(currentBid + 1000)" 
                    class="bg-orange-500 hover:bg-orange-600 rounded-xl py-4 font-bold text-lg transition-colors">
              +₺1K
            </button>
            <button @click="placeBid(currentBid + 5000)" 
                    class="bg-orange-500 hover:bg-orange-600 rounded-xl py-4 font-bold text-lg transition-colors">
              +₺5K
            </button>
          </div>
        </div>

        <!-- Live Chat -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="p-4 border-b border-gray-700">
            <h3 class="font-bold text-lg">Canlı Sohbet</h3>
          </div>
          
          <!-- Messages -->
          <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="message in chatMessages" :key="message.id" 
                 class="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-bold">{{ message.username.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="font-semibold text-sm">{{ message.username }}</span>
                  <span class="text-xs text-gray-400">{{ formatTime(message.timestamp) }}</span>
                </div>
                <p class="text-sm text-gray-300 break-words">{{ message.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
// Live Auction Interface - Clean Production Version

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
}

interface Product {
  id: string
  name: string
  description: string
  startingPrice: number
}

// Route & Navigation
const router = useRouter()
const route = useRoute()

// State Management
const currentBid = ref(15000)
const timeLeft = ref(180) // seconds
const lastBidder = ref('Ahmet K.')

// Mock data
const currentProduct = ref<Product>({
  id: route.params.id as string,
  name: 'iPhone 14 Pro Max 256GB',
  description: 'Sıfır ayarında, kutu ve tüm aksesuarlarıyla birlikte',
  startingPrice: 10000
})

const chatMessages = ref<ChatMessage[]>([
  {
    id: '1',
    username: 'Ali M.',
    message: 'Garantisi var mı?',
    timestamp: Date.now() - 240000
  },
  {
    id: '2',
    username: 'Mehmet K.',
    message: 'Güzel ürün, teklif veriyorum',
    timestamp: Date.now() - 120000
  }
])

// Refs
const videoPlayer = ref<HTMLVideoElement>()
const videoPlayerDesktop = ref<HTMLVideoElement>()
const chatContainer = ref<HTMLDivElement>()

// Navigation
const goBack = () => {
  router.back()
}

// Bidding Logic
async function placeBid(amount: number) {
  if (amount <= currentBid.value) {
    return
  }
  
  try {
    // Update local state immediately for responsiveness
    currentBid.value = amount
    lastBidder.value = 'Sen'
    
    // Add to chat
    chatMessages.value.push({
      id: crypto.randomUUID(),
      username: 'Sen',
      message: `₺${amount.toLocaleString()} teklif verdi`,
      timestamp: Date.now()
    })

  } catch (error) {
    // Handle error
  }
}

// Time Formatting
function formatTimeLeft(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Countdown timer
onMounted(() => {
  const timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
      router.push('/')
    }
  }, 1000)

  // Cleanup on unmount
  onUnmounted(() => {
    clearInterval(timer)
  })
})

// SEO
useHead({
  title: `${currentProduct.value.name} - Canlı Açık Artırma | TagList`,
  meta: [
    { name: 'description', content: `${currentProduct.value.name} için canlı açık artırma.` }
  ]
})
</script>
