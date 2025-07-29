<template>
  <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span class="text-2xl">👁️</span>
          </div>
          <div>
            <h2 class="text-2xl font-bold">Visual Search</h2>
            <p class="text-purple-100">Find anything you see, instantly</p>
          </div>
        </div>
        <button @click="$emit('close')" 
                class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors">
          <span class="text-xl">✕</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      <!-- Upload Section -->
      <div v-if="!visualSearch.state.currentImage" class="space-y-6">
        <!-- Upload Methods -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Camera Capture -->
          <button @click="captureFromCamera" 
                  class="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
            <div class="text-center">
              <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
              <h3 class="font-semibold text-gray-800 mb-1">Take Photo</h3>
              <p class="text-sm text-gray-600">Use your camera to snap a picture</p>
            </div>
          </button>

          <!-- File Upload -->
          <label class="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group cursor-pointer">
            <div class="text-center">
              <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">🖼️</div>
              <h3 class="font-semibold text-gray-800 mb-1">Upload Image</h3>
              <p class="text-sm text-gray-600">Select from your gallery</p>
            </div>
            <input type="file" accept="image/*" @change="handleFileUpload" class="hidden">
          </label>

          <!-- Screenshot -->
          <button @click="pasteFromClipboard" 
                  class="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
            <div class="text-center">
              <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
              <h3 class="font-semibold text-gray-800 mb-1">Paste Screenshot</h3>
              <p class="text-sm text-gray-600">Paste from clipboard</p>
            </div>
          </button>
        </div>

        <!-- Recent Searches -->
        <div v-if="visualSearch.state.searchHistory.length" class="space-y-3">
          <h3 class="font-semibold text-gray-800">Recent Visual Searches</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="search in visualSearch.state.searchHistory.slice(0, 4)" :key="search.timestamp.getTime()"
                 @click="searchFromHistory(search)"
                 class="relative group cursor-pointer">
              <img :src="search.image" :alt="search.query" 
                   class="w-full h-24 object-cover rounded-lg group-hover:shadow-lg transition-shadow">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                <span class="text-white opacity-0 group-hover:opacity-100 font-semibold">{{ search.results }} results</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analysis & Results -->
      <div v-else class="space-y-6">
        <!-- Image Analysis -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Original Image -->
          <div class="space-y-3">
            <h3 class="font-semibold text-gray-800">Your Image</h3>
            <div class="relative">
              <img :src="visualSearch.state.currentImage" alt="Search image" 
                   class="w-full h-64 object-cover rounded-xl shadow-lg">
              
              <!-- Object Detection Overlays -->
              <div v-if="visualSearch.state.analysis?.objects" 
                   class="absolute inset-0">
                <div v-for="obj in visualSearch.state.analysis.objects" :key="obj.name"
                     class="absolute border-2 border-yellow-400 bg-yellow-400 bg-opacity-20 rounded"
                     :style="getObjectBoundingBox(obj.bbox)">
                  <div class="absolute -top-6 left-0 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-semibold">
                    {{ obj.name }} ({{ Math.round(obj.confidence * 100) }}%)
                  </div>
                </div>
              </div>
              
              <!-- Loading Overlay -->
              <div v-if="visualSearch.state.isAnalyzing" 
                   class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                <div class="text-center text-white">
                  <div class="animate-spin text-4xl mb-2">🤖</div>
                  <p>AI is analyzing your image...</p>
                </div>
              </div>
            </div>

            <!-- Analysis Results -->
            <div v-if="visualSearch.state.analysis" class="space-y-3">
              <!-- Detected Objects -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">Detected Items</h4>
                <div class="space-y-2">
                  <div v-for="obj in visualSearch.state.analysis.objects" :key="obj.name"
                       class="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <span class="font-medium">{{ obj.name }}</span>
                      <span class="text-sm text-gray-600 ml-2">{{ obj.category }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {{ Math.round(obj.confidence * 100) }}%
                      </span>
                      <button @click="searchSpecificObject(obj)" 
                              class="text-purple-600 hover:text-purple-700 text-sm">
                        Search →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Style Analysis -->
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-2">Style Analysis</h4>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">Aesthetic:</span>
                    <div class="flex gap-1">
                      <span v-for="aesthetic in visualSearch.state.analysis.style.aesthetic" :key="aesthetic"
                            class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        {{ aesthetic }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">Colors:</span>
                    <div class="flex gap-1">
                      <span v-for="color in visualSearch.state.analysis.style.colors" :key="color"
                            class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {{ color }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Results -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-800">Similar Items Found</h3>
              <button @click="showFilters = !showFilters" 
                      class="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1">
                <span>🔧</span>
                Filters
              </button>
            </div>

            <!-- Filters -->
            <div v-if="showFilters" class="bg-gray-50 p-4 rounded-lg space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <!-- Price Range -->
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">Price Range</label>
                  <select v-model="filters.priceRange" class="w-full p-2 border rounded text-sm">
                    <option :value="null">Any Price</option>
                    <option :value="[0, 500]">Under ₺500</option>
                    <option :value="[500, 1500]">₺500 - ₺1,500</option>
                    <option :value="[1500, 5000]">₺1,500 - ₺5,000</option>
                    <option :value="[5000, Infinity]">Over ₺5,000</option>
                  </select>
                </div>

                <!-- Similarity -->
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">Similarity</label>
                  <select v-model="filters.similarity" class="w-full p-2 border rounded text-sm">
                    <option :value="0">Any Match</option>
                    <option :value="0.5">50%+ Similar</option>
                    <option :value="0.7">70%+ Similar</option>
                    <option :value="0.9">90%+ Similar</option>
                  </select>
                </div>
              </div>
              <button @click="applyFilters" 
                      class="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 transition-colors">
                Apply Filters
              </button>
            </div>

            <!-- Loading Results -->
            <div v-if="visualSearch.state.isSearching" class="text-center py-8">
              <div class="animate-pulse space-y-3">
                <div class="w-full h-32 bg-gray-200 rounded-lg"></div>
                <div class="w-full h-32 bg-gray-200 rounded-lg"></div>
                <div class="w-full h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>

            <!-- Results Grid -->
            <div v-else-if="visualSearch.state.results.length" class="space-y-4 max-h-96 overflow-y-auto">
              <div v-for="result in visualSearch.state.results" :key="result.id"
                   class="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div class="flex gap-4">
                  <!-- Product Image -->
                  <img :src="result.product.images[0]" :alt="result.product.title"
                       class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
                  
                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between mb-2">
                      <h4 class="font-semibold text-gray-800 truncate">{{ result.product.title }}</h4>
                      <div class="flex items-center gap-1 text-sm">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {{ Math.round(result.confidence * 100) }}% match
                        </span>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-purple-600 font-bold">₺{{ result.product.price.toLocaleString() }}</span>
                      <span class="text-sm text-gray-600">{{ result.product.brand }}</span>
                      <span class="bg-gray-100 px-2 py-1 rounded-full text-xs">{{ result.matchType }}</span>
                    </div>

                    <!-- Similarity Breakdown -->
                    <div class="grid grid-cols-4 gap-2 mb-3">
                      <div class="text-center">
                        <div class="text-xs text-gray-600">Color</div>
                        <div class="text-sm font-semibold">{{ Math.round(result.similarity.color * 100) }}%</div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-600">Style</div>
                        <div class="text-sm font-semibold">{{ Math.round(result.similarity.style * 100) }}%</div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-600">Pattern</div>
                        <div class="text-sm font-semibold">{{ Math.round(result.similarity.pattern * 100) }}%</div>
                      </div>
                      <div class="text-center">
                        <div class="text-xs text-gray-600">Material</div>
                        <div class="text-sm font-semibold">{{ Math.round(result.similarity.material * 100) }}%</div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                      <button @click="viewProduct(result.product)" 
                              class="flex-1 bg-purple-600 text-white py-2 px-3 rounded font-semibold hover:bg-purple-700 transition-colors text-sm">
                        View Details
                      </button>
                      <button @click="tryOnProduct(result.product)" 
                              class="bg-pink-600 text-white py-2 px-3 rounded font-semibold hover:bg-pink-700 transition-colors text-sm">
                        Try On
                      </button>
                      <button @click="shareResult(result)" 
                              class="bg-gray-100 text-gray-700 py-2 px-3 rounded font-semibold hover:bg-gray-200 transition-colors text-sm">
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Results -->
            <div v-else-if="!visualSearch.state.isSearching && !visualSearch.state.isAnalyzing" 
                 class="text-center py-8 text-gray-600">
              <div class="text-4xl mb-2">🔍</div>
              <p>No similar items found. Try adjusting your filters or search with a different image.</p>
            </div>
          </div>
        </div>

        <!-- Smart Suggestions -->
        <div v-if="visualSearch.smartSuggestions.value.length" class="space-y-3">
          <h3 class="font-semibold text-gray-800">Smart Suggestions</h3>
          <div class="flex flex-wrap gap-2">
            <button v-for="suggestion in visualSearch.smartSuggestions.value" :key="suggestion"
                    @click="searchWithSuggestion(suggestion)"
                    class="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-2 rounded-full text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition-colors">
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Complete the Look -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
          <h3 class="font-semibold text-gray-800 mb-3">Complete the Look</h3>
          <button @click="getCompleteOutfit" 
                  class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2">
            <span>✨</span>
            Find Matching Items
          </button>
        </div>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="border-t p-4 bg-gray-50">
      <div class="flex justify-between items-center">
        <button v-if="visualSearch.state.currentImage" 
                @click="startOver" 
                class="text-gray-600 hover:text-gray-700 font-medium">
          ← New Search
        </button>
        <div v-else></div>
        
        <div class="flex gap-2">
          <button v-if="visualSearch.state.results.length" 
                  @click="saveSearch" 
                  class="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
            Save Search
          </button>
          <button @click="$emit('close')" 
                  class="bg-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useVisualSearch } from '~/composables/useVisualSearch'
import { useARTryOn } from '~/composables/useARTryOn'

const emit = defineEmits<{
  close: []
  productSelected: [productId: string]
}>()

const visualSearch = useVisualSearch()
const arTryOn = useARTryOn()

const showFilters = ref(false)
const filters = reactive({
  priceRange: null as [number, number] | null,
  brand: [] as string[],
  availability: 'all' as string,
  similarity: 0 as number
})

// File Upload
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    await visualSearch.uploadImage(target.files[0])
  }
}

// Camera Capture
const captureFromCamera = async () => {
  try {
    await visualSearch.captureFromCamera()
  } catch (error) {
    console.error('Camera capture failed:', error)
    alert('Camera access failed. Please check permissions.')
  }
}

// Clipboard Paste
const pasteFromClipboard = async () => {
  try {
    const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
    if (permission.state === 'granted' || permission.state === 'prompt') {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const file = new File([blob], 'clipboard-image.png', { type })
            await visualSearch.uploadImage(file)
            return
          }
        }
      }
    }
    alert('No image found in clipboard')
  } catch (error) {
    console.error('Clipboard access failed:', error)
    alert('Clipboard access failed. Please upload an image instead.')
  }
}

// Search Actions
const searchFromHistory = async (search: any) => {
  await visualSearch.searchFromScreenshot(search.image)
}

const searchSpecificObject = async (obj: any) => {
  console.log('Searching for specific object:', obj)
}

const searchWithSuggestion = async (suggestion: string) => {
  console.log('Searching with suggestion:', suggestion)
}

// Filter Actions
const applyFilters = () => {
  visualSearch.applyFilters(filters)
}

// Product Actions
const viewProduct = (product: any) => {
  emit('productSelected', product.id)
  navigateTo(`/product/${product.id}?ref=visual_search`)
}

const tryOnProduct = async (product: any) => {
  emit('close')
  await arTryOn.startTryOn(product)
}

const shareResult = async (result: any) => {
  await visualSearch.shareVisualSearch(result.id)
}

// Utility Functions
const getObjectBoundingBox = (bbox: readonly [number, number, number, number]) => {
  const [x, y, width, height] = bbox
  return {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`
  }
}

const getCompleteOutfit = async () => {
  const outfit = await visualSearch.getCompleteOutfit()
  console.log('Complete outfit:', outfit)
}

const startOver = () => {
  visualSearch.resetSearch()
}

const saveSearch = () => {
  console.log('Saving search...')
}
</script>
