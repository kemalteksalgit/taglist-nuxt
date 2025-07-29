<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group">
    <!-- AI Recommendation Badge -->
    <div v-if="recommendation" class="relative">
      <div class="absolute top-2 left-2 z-10">
        <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <span>🤖</span>
          {{ recommendation.reason }}
        </div>
      </div>
      
      <!-- Confidence Score -->
      <div class="absolute top-2 right-2 z-10">
        <div class="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-semibold">
          {{ Math.round(recommendation.confidence * 100) }}% match
        </div>
      </div>
    </div>

    <!-- Product Image -->
    <div class="relative overflow-hidden rounded-t-lg">
      <img
        :src="product.images?.[0] || '/api/placeholder/300/200'"
        :alt="product.title"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      >
      
      <!-- Hype Level Indicator -->
      <div v-if="product.hypeLevel" class="absolute bottom-2 left-2">
        <div class="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <span class="animate-pulse">🔥</span>
          {{ product.hypeLevel.toUpperCase() }}
        </div>
      </div>

      <!-- Live Auction Indicator -->
      <div v-if="product.isLive" class="absolute top-2 left-1/2 transform -translate-x-1/2">
        <div class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
          <span class="w-2 h-2 bg-white rounded-full"></span>
          CANLI
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div class="flex gap-2">
          <button @click="addToFavorites" class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
            ❤️
          </button>
          <button @click="quickView" class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
            👁️
          </button>
          <button @click="shareProduct" class="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
            📤
          </button>
        </div>
      </div>
    </div>

    <!-- Product Details -->
    <div class="p-4">
      <!-- Title and Category -->
      <div class="mb-2">
        <h3 class="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {{ product.title }}
        </h3>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="bg-gray-100 px-2 py-1 rounded-full">{{ product.category }}</span>
          <span v-if="product.brand" class="text-gray-500">• {{ product.brand }}</span>
        </div>
      </div>

      <!-- AI Analysis Insights -->
      <div v-if="aiAnalysis" class="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div class="text-xs text-gray-600 mb-1">AI Insights:</div>
        <div class="flex flex-wrap gap-1">
          <span v-for="insight in aiAnalysis.insights.slice(0, 3)" :key="insight"
                class="bg-white px-2 py-1 rounded-full text-xs text-gray-700">
            {{ insight }}
          </span>
        </div>
      </div>

      <!-- Pricing -->
      <div class="mb-3">
        <div v-if="product.isAuction" class="space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Mevcut Teklif:</span>
            <span class="font-bold text-green-600">₺{{ product.currentBid?.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Başlangıç:</span>
            <span class="text-sm text-gray-500">₺{{ product.startingBid?.toLocaleString() }}</span>
          </div>
          <div v-if="product.timeLeft" class="text-xs text-red-600 font-semibold">
            {{ formatTimeLeft(product.timeLeft) }}
          </div>
        </div>
        <div v-else class="flex items-center justify-between">
          <span class="text-2xl font-bold text-green-600">₺{{ product.price?.toLocaleString() }}</span>
          <div v-if="product.originalPrice && product.price && product.originalPrice > product.price" class="text-right">
            <div class="text-sm text-gray-500 line-through">₺{{ product.originalPrice.toLocaleString() }}</div>
            <div class="text-xs text-red-600 font-semibold">
              {{ Math.round((1 - product.price / product.originalPrice) * 100) }}% İndirim
            </div>
          </div>
        </div>
      </div>

      <!-- Seller Info -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <img :src="product.seller?.avatar || '/api/placeholder/24/24'" 
               :alt="product.seller?.name"
               class="w-6 h-6 rounded-full">
          <span class="text-sm text-gray-600">{{ product.seller?.name }}</span>
          <div v-if="product.seller?.rating" class="flex items-center gap-1">
            <span class="text-yellow-500">⭐</span>
            <span class="text-xs text-gray-600">{{ product.seller.rating.toFixed(1) }}</span>
          </div>
        </div>
        <div class="text-xs text-gray-500">{{ product.location }}</div>
      </div>

      <!-- Interaction Stats -->
      <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1">
            👁️ {{ product.views || 0 }}
          </span>
          <span class="flex items-center gap-1">
            ❤️ {{ product.likes || 0 }}
          </span>
          <span v-if="product.bidCount" class="flex items-center gap-1">
            🔥 {{ product.bidCount }} teklif
          </span>
        </div>
        <div class="text-xs text-gray-500">
          {{ formatRelativeTime(product.createdAt) }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button v-if="product.isAuction"
                @click="placeBid"
                class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2">
          <span>🔥</span>
          Teklif Ver
        </button>
        <button v-else
                @click="addToCart"
                class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2">
          <span>🛒</span>
          Sepete Ekle
        </button>
        
        <!-- AI-Powered Quick Buy -->
        <button v-if="recommendation?.type === 'urgent' || product.hypeLevel === 'high'"
                @click="quickBuy"
                class="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
          ⚡
        </button>
      </div>

      <!-- AI Recommendation Details -->
      <div v-if="recommendation?.details" class="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
        <div class="text-xs text-gray-600 mb-1">Why this matches you:</div>
        <div class="text-sm text-gray-700">{{ recommendation.details }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: string
  title: string
  category: string
  brand?: string
  price?: number
  originalPrice?: number
  currentBid?: number
  startingBid?: number
  isAuction: boolean
  isLive?: boolean
  images: string[]
  seller: {
    name: string
    avatar?: string
    rating?: number
  }
  location: string
  views?: number
  likes?: number
  bidCount?: number
  timeLeft?: number
  createdAt: string
  hypeLevel?: 'low' | 'medium' | 'high' | 'extreme'
}

interface AIRecommendation {
  reason: string
  confidence: number
  type: 'trending' | 'personalized' | 'urgent' | 'similar'
  details?: string
}

interface AIAnalysis {
  insights: string[]
  categories: string[]
  tags: string[]
}

interface Props {
  product: Product
  recommendation?: AIRecommendation
  aiAnalysis?: AIAnalysis
}

const props = defineProps<Props>()

// Actions
const addToFavorites = () => {
  console.log('Adding to favorites:', props.product.id)
}

const quickView = () => {
  console.log('Quick view:', props.product.id)
}

const shareProduct = () => {
  console.log('Sharing:', props.product.id)
}

const placeBid = () => {
  navigateTo(`/auction/${props.product.id}`)
}

const addToCart = () => {
  console.log('Adding to cart:', props.product.id)
}

const quickBuy = () => {
  console.log('Quick buy:', props.product.id)
}

// Utilities
const formatTimeLeft = (timeLeft: number) => {
  const hours = Math.floor(timeLeft / 3600000)
  const minutes = Math.floor((timeLeft % 3600000) / 60000)
  
  if (hours > 0) {
    return `${hours}s ${minutes}d kaldı`
  }
  return `${minutes}d kaldı`
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} gün önce`
  } else if (diffHours > 0) {
    return `${diffHours} saat önce`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} dakika önce`
  }
}
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
