<template>
  <NuxtLayout>
    <div class="min-h-screen bg-black text-white relative overflow-hidden">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-r from-purple-900 via-pink-900 to-red-900">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-20">
        <div class="text-center text-white">
          <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            See It. Try It. Own It.
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-purple-100">
            The world's most intelligent visual commerce platform
          </p>
          
          <!-- Quick Actions -->
          <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button @click="openVisualSearch" 
                    class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl flex items-center gap-3">
              <span class="text-2xl">👁️</span>
              Visual Search
            </button>
            <button @click="openARTryOn" 
                    class="bg-gradient-to-r from-pink-600 to-red-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-2xl flex items-center gap-3">
              <span class="text-2xl">🕶️</span>
              AR Try-On
            </button>
            <button @click="openAIDiscovery" 
                    class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl flex items-center gap-3">
              <span class="text-2xl">🤖</span>
              AI Discovery
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Elements -->
      <div class="absolute top-20 left-10 animate-bounce">
        <div class="w-16 h-16 bg-purple-500 bg-opacity-30 rounded-full"></div>
      </div>
      <div class="absolute bottom-20 right-10 animate-pulse">
        <div class="w-20 h-20 bg-pink-500 bg-opacity-20 rounded-full"></div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="max-w-7xl mx-auto px-4 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Revolutionary Shopping Experience</h2>
        <p class="text-xl text-gray-600">Powered by AI, enhanced by AR, personalized for you</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Visual Search Feature -->
        <div class="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <span class="text-6xl text-white group-hover:scale-110 transition-transform duration-300">📸</span>
            </div>
            <div class="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold text-purple-600">
              AI Powered
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Visual Search</h3>
            <p class="text-gray-600 mb-4">
              Upload any photo and instantly find similar items in our marketplace. 
              AI understands style, color, and brand to deliver perfect matches.
            </p>
            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Instant object detection
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Style & color matching
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Shop-the-look suggestions
              </div>
            </div>
            <button @click="openVisualSearch" 
                    class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all">
              Try Visual Search
            </button>
          </div>
        </div>

        <!-- AR Try-On Feature -->
        <div class="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
              <span class="text-6xl text-white group-hover:scale-110 transition-transform duration-300">👓</span>
            </div>
            <div class="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold text-pink-600">
              AR Ready
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">AR Try-On</h3>
            <p class="text-gray-600 mb-4">
              Try on clothes, accessories, and eyewear virtually using advanced AR technology. 
              See how items look on you before buying.
            </p>
            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Real-time virtual fitting
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Smart size recommendations
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Social try-on with friends
              </div>
            </div>
            <button @click="openARTryOn" 
                    class="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all">
              Start AR Try-On
            </button>
          </div>
        </div>

        <!-- AI Discovery Feature -->
        <div class="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
              <span class="text-6xl text-white group-hover:scale-110 transition-transform duration-300">🧠</span>
            </div>
            <div class="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
              Personalized
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">AI Discovery</h3>
            <p class="text-gray-600 mb-4">
              Discover products tailored to your style, preferences, and behavior. 
              AI learns from your interactions to show you exactly what you'll love.
            </p>
            <div class="space-y-2 mb-4">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Personalized recommendations
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Behavior-based learning
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                Real-time adaptation
              </div>
            </div>
            <button @click="openAIDiscovery" 
                    class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all">
              Explore AI Discovery
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Demo Section -->
    <div class="bg-gradient-to-r from-gray-900 to-black text-white py-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">See It In Action</h2>
          <p class="text-xl text-gray-300">Experience the future of shopping</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Demo Video/Image -->
          <div class="relative">
            <div class="aspect-video bg-gradient-to-br from-purple-800 to-pink-800 rounded-2xl overflow-hidden shadow-2xl">
              <div class="absolute inset-0 flex items-center justify-center">
                <button @click="playDemo" 
                        class="bg-white bg-opacity-20 hover:bg-opacity-30 p-6 rounded-full transition-all">
                  <span class="text-4xl">▶️</span>
                </button>
              </div>
              <div class="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded text-sm">
                Live AR Try-On Demo
              </div>
            </div>
          </div>

          <!-- Demo Features -->
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">1️⃣</span>
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2">Upload or Snap</h3>
                <p class="text-gray-300">Take a photo or upload an image of any item you want to find or try on.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">2️⃣</span>
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2">AI Analysis</h3>
                <p class="text-gray-300">Our AI instantly identifies objects, style, colors, and finds similar items in real-time.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-xl">3️⃣</span>
              </div>
              <div>
                <h3 class="text-xl font-bold mb-2">Try & Buy</h3>
                <p class="text-gray-300">Use AR to virtually try on items and purchase with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-white py-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-purple-600 mb-2">95%</div>
            <div class="text-gray-600">Search Accuracy</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-pink-600 mb-2">60%</div>
            <div class="text-gray-600">Return Reduction</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-blue-600 mb-2">3x</div>
            <div class="text-gray-600">Engagement Boost</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-green-600 mb-2">50M+</div>
            <div class="text-gray-600">Visual Searches</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-20">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Shopping?</h2>
        <p class="text-xl mb-8 text-purple-100">
          Join millions discovering the future of commerce with AI-powered visual search and AR try-on.
        </p>
        <div class="flex flex-col md:flex-row gap-4 justify-center">
          <button @click="openVisualSearch" 
                  class="bg-white text-purple-600 py-4 px-8 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl">
            Start Visual Search
          </button>
          <button @click="navigateTo('/discovery')" 
                  class="bg-black bg-opacity-30 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-opacity-40 transition-all border-2 border-white border-opacity-30">
            Explore Marketplace
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Visual Search Modal -->
      <div v-if="showVisualSearch" 
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" 
           @click="closeVisualSearch">
        <VisualSearchModal @close="closeVisualSearch" @product-selected="handleProductSelected" />
      </div>

      <!-- AR Try-On Interface -->
      <div v-if="showARTryOn">
        <ARTryOnInterface @close="closeARTryOn" @product-added="handleProductAdded" />
      </div>

      <!-- AI Insights Panel -->
      <AIInsightsPanel v-if="showAIInsights" 
                       :is-visible="showAIInsights"
                       :current-analysis="currentAIAnalysis"
                       @close="closeAIInsights" />
    </Teleport>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VisualSearchModal from '~/components/modals/VisualSearchModal.vue'
import ARTryOnInterface from '~/components/ARTryOnInterface.vue'
import AIInsightsPanel from '~/components/AIInsightsPanel.vue'

// Page Meta
useHead({
  title: 'TagList - Visual Commerce Revolution',
  meta: [
    { 
      name: 'description', 
      content: 'Experience the future of shopping with AI-powered visual search, AR try-on, and personalized discovery. See it, try it, own it.' 
    },
    { 
      property: 'og:title', 
      content: 'TagList - See It, Try It, Own It' 
    },
    { 
      property: 'og:description', 
      content: 'The world\'s most intelligent visual commerce platform with AI search and AR try-on' 
    }
  ]
})

// Component State
const showVisualSearch = ref(false)
const showARTryOn = ref(false)
const showAIInsights = ref(false)
const currentAIAnalysis = ref<any>(null)

// Modal Controls
const openVisualSearch = () => {
  showVisualSearch.value = true
}

const closeVisualSearch = () => {
  showVisualSearch.value = false
}

const openARTryOn = () => {
  showARTryOn.value = true
}

const closeARTryOn = () => {
  showARTryOn.value = false
}

const openAIDiscovery = () => {
  navigateTo('/discovery')
}

const openAIInsights = () => {
  showAIInsights.value = true
}

const closeAIInsights = () => {
  showAIInsights.value = false
}

// Event Handlers
const handleProductSelected = (productId: string) => {
  closeVisualSearch()
  navigateTo(`/product/${productId}`)
}

const handleProductAdded = (productId: string) => {
  // Show success notification
}

const playDemo = () => {
  // Implement demo video playback
}

// Analytics tracking
const trackFeatureUsage = (feature: string) => {
  // Track with analytics service
}

// Watch for feature usage
watch(showVisualSearch, (newValue) => {
  if (newValue) trackFeatureUsage('visual_search')
})

watch(showARTryOn, (newValue) => {
  if (newValue) trackFeatureUsage('ar_tryon')
})
</script>
