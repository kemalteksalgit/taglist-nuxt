<template>
  <div class="fixed inset-0 bg-black z-50 flex flex-col">
    <!-- Header -->
    <div class="bg-black bg-opacity-80 text-white p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="$emit('close')" 
                class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors">
          <span class="text-xl">←</span>
        </button>
        <div>
          <h2 class="font-bold">AR Try-On</h2>
          <p class="text-sm text-gray-300">{{ currentProduct?.title || 'Virtual Fitting' }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Recording Button -->
        <button v-if="arTryOn.state.currentSession" 
                @click="toggleRecording"
                :class="[
                  'p-3 rounded-full font-semibold transition-all flex items-center gap-2',
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                ]">
          <span>{{ isRecording ? '⏹️' : '📹' }}</span>
          <span class="text-sm">{{ isRecording ? 'Stop' : 'Record' }}</span>
        </button>

        <!-- Screenshot -->
        <button @click="takeScreenshot" 
                class="bg-white bg-opacity-20 text-white hover:bg-opacity-30 p-3 rounded-full transition-colors">
          <span class="text-xl">📸</span>
        </button>

        <!-- Settings -->
        <button @click="showSettings = !showSettings" 
                class="bg-white bg-opacity-20 text-white hover:bg-opacity-30 p-3 rounded-full transition-colors">
          <span class="text-xl">⚙️</span>
        </button>
      </div>
    </div>

    <!-- Main AR View -->
    <div class="flex-1 relative">
      <!-- Video Feed -->
      <video ref="arTryOn.videoRef" 
             class="w-full h-full object-cover" 
             autoplay 
             muted 
             playsinline></video>
      
      <!-- AR Canvas Overlay -->
      <canvas ref="arTryOn.canvasRef" 
              class="absolute inset-0 w-full h-full pointer-events-none"
              :width="canvasWidth"
              :height="canvasHeight"></canvas>

      <!-- Performance Indicator -->
      <div class="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
        {{ Math.round(arTryOn.state.performance.fps) }} FPS
      </div>

      <!-- AR Overlays -->
      <div v-if="arTryOn.state.currentSession" class="absolute inset-0 pointer-events-none">
        <div v-for="overlay in arTryOn.state.currentSession.overlays" :key="overlay.id"
             v-show="overlay.isVisible"
             class="absolute pointer-events-auto"
             :style="getOverlayPosition(overlay.position)">
          
          <!-- Price Tag -->
          <div v-if="overlay.type === 'price_tag'" 
               class="bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg shadow-lg">
            <div class="font-bold">₺{{ overlay.content.price?.toLocaleString() }}</div>
            <div v-if="overlay.content.discount" class="text-sm text-yellow-400">
              {{ overlay.content.discount }}% off
            </div>
          </div>

          <!-- Brand Badge -->
          <div v-else-if="overlay.type === 'brand_badge'" 
               class="bg-white bg-opacity-90 text-black px-3 py-1 rounded-full shadow-lg">
            <span class="font-semibold text-sm">{{ overlay.content.brand }}</span>
          </div>

          <!-- Size Indicator -->
          <div v-else-if="overlay.type === 'size_indicator'" 
               class="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div class="font-bold">{{ overlay.content.size }}</div>
            <div class="text-sm">{{ overlay.content.fit }}</div>
            <div class="text-xs opacity-80">{{ Math.round(overlay.content.confidence * 100) }}% confidence</div>
          </div>

          <!-- Fit Analysis -->
          <div v-else-if="overlay.type === 'fit_analysis'" 
               class="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs">
            <div class="font-semibold text-sm mb-1">Fit Analysis</div>
            <div class="text-xs space-y-1">
              <div>Shoulder: {{ overlay.content.shoulder || 'Perfect' }}</div>
              <div>Length: {{ overlay.content.length || 'Good' }}</div>
              <div>Overall: {{ overlay.content.overall || 'Great fit!' }}</div>
            </div>
          </div>

          <!-- Social Reactions -->
          <div v-else-if="overlay.type === 'social_reaction'" 
               class="bg-purple-500 text-white px-3 py-2 rounded-lg shadow-lg">
            <div class="flex items-center gap-2">
              <span>{{ overlay.content.emoji }}</span>
              <span class="text-sm">{{ overlay.content.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="!arTryOn.state.isInitialized" 
           class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
        <div class="text-center text-white">
          <div class="animate-spin text-6xl mb-4">🤖</div>
          <h3 class="text-xl font-bold mb-2">Initializing AR Try-On</h3>
          <p class="text-gray-300">Setting up camera and AR engine...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" 
           class="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
        <div class="text-center text-white max-w-md">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-bold mb-2">AR Not Available</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <button @click="retryInitialization" 
                  class="bg-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="bg-black bg-opacity-80 text-white p-4">
      <!-- Product Selection -->
      <div v-if="!currentProduct" class="mb-4">
        <h3 class="font-semibold mb-3">Select Item to Try On</h3>
        <div class="flex gap-3 overflow-x-auto pb-2">
          <button v-for="product in availableProducts" :key="product.id"
                  @click="selectProduct(product)"
                  class="flex-shrink-0 bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-colors">
            <img :src="product.images[0]" :alt="product.title" 
                 class="w-16 h-16 object-cover rounded mb-2">
            <div class="text-sm text-center">{{ product.title.slice(0, 20) }}...</div>
          </button>
        </div>
      </div>

      <!-- Current Product Controls -->
      <div v-else class="space-y-4">
        <!-- Product Info -->
        <div class="flex items-center gap-4">
          <img :src="currentProduct.images[0]" :alt="currentProduct.title" 
               class="w-12 h-12 object-cover rounded">
          <div class="flex-1">
            <h4 class="font-semibold">{{ currentProduct.title }}</h4>
            <p class="text-sm text-gray-300">{{ currentProduct.brand }} • ₺{{ currentProduct.price.toLocaleString() }}</p>
          </div>
        </div>

        <!-- Size Selection -->
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Size:</span>
          <div class="flex gap-2">
            <button v-for="size in availableSizes" :key="size"
                    @click="changeSize(size)"
                    :class="[
                      'px-3 py-1 rounded font-semibold text-sm transition-colors',
                      selectedSize === size ? 'bg-white text-black' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    ]">
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Color Selection -->
        <div v-if="availableColors.length > 1" class="flex items-center gap-4">
          <span class="text-sm font-medium">Color:</span>
          <div class="flex gap-2">
            <button v-for="color in availableColors" :key="color.name"
                    @click="changeColor(color.value)"
                    :class="[
                      'w-8 h-8 rounded-full border-2 transition-all',
                      selectedColor === color.value ? 'border-white scale-110' : 'border-gray-400'
                    ]"
                    :style="{ backgroundColor: color.value }"></button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button @click="addToCart" 
                  class="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <span>🛒</span>
            Add to Cart
          </button>
          <button @click="shareTryOn" 
                  class="bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
            <span>📤</span>
            Share
          </button>
          <button @click="startSocialTryOn" 
                  class="bg-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center gap-2">
            <span>👥</span>
            Try with Friends
          </button>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" 
         class="absolute top-16 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg min-w-64">
      <h3 class="font-semibold mb-3">AR Settings</h3>
      
      <div class="space-y-3">
        <!-- Quality -->
        <div>
          <label class="text-sm mb-1 block">Quality</label>
          <select v-model="arSettings.quality" 
                  @change="updateARQuality"
                  class="w-full bg-white bg-opacity-20 text-white p-2 rounded">
            <option value="high">High (Best quality)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="low">Low (Performance)</option>
          </select>
        </div>

        <!-- Overlays -->
        <div>
          <label class="text-sm mb-2 block">Show Overlays</label>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="arSettings.showPrice" @change="toggleOverlay('price_tag')">
              <span class="text-sm">Price tags</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="arSettings.showBrand" @change="toggleOverlay('brand_badge')">
              <span class="text-sm">Brand badges</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="arSettings.showFit" @change="toggleOverlay('fit_analysis')">
              <span class="text-sm">Fit analysis</span>
            </label>
          </div>
        </div>

        <!-- Mirror Mode -->
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="arSettings.mirrorMode" @change="toggleMirrorMode">
            <span class="text-sm">Mirror mode</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Social Try-On Participants -->
    <div v-if="socialSession" 
         class="absolute bottom-32 left-4 space-y-2">
      <div class="bg-black bg-opacity-80 text-white p-3 rounded-lg">
        <h4 class="font-semibold text-sm mb-2">Trying on with friends</h4>
        <div class="flex -space-x-2">
          <img v-for="participant in socialSession.participants" :key="participant"
               :src="`/api/placeholder/32/32`" 
               :alt="participant"
               class="w-8 h-8 rounded-full border-2 border-white">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useARTryOn } from '~/composables/useARTryOn'

const emit = defineEmits<{
  close: []
  productAdded: [productId: string]
}>()

const arTryOn = useARTryOn()

// Component State
const showSettings = ref(false)
const isRecording = ref(false)
const error = ref<string | null>(null)
const canvasWidth = ref(1280)
const canvasHeight = ref(720)

// Product Data
const currentProduct = ref<any>(null)
const selectedSize = ref('M')
const selectedColor = ref('#000000')

const availableProducts = ref([
  {
    id: '1',
    title: 'Classic Black Leather Jacket',
    brand: 'Urban Style',
    price: 2500,
    images: ['/api/placeholder/300/400'],
    category: 'clothing',
    ar: {
      model3D: '/models/jacket.glb',
      textures: ['/textures/black-leather.jpg'],
      sizingData: {},
      supportedFeatures: [],
      anchorPoints: []
    }
  },
  {
    id: '2',
    title: 'Ray-Ban Aviator Sunglasses',
    brand: 'Ray-Ban',
    price: 850,
    images: ['/api/placeholder/300/200'],
    category: 'eyewear',
    ar: {
      model3D: '/models/sunglasses.glb',
      textures: ['/textures/gold-aviator.jpg'],
      sizingData: {},
      supportedFeatures: [],
      anchorPoints: []
    }
  }
])

const availableSizes = computed(() => {
  if (!currentProduct.value) return []
  if (currentProduct.value.category === 'clothing') return ['XS', 'S', 'M', 'L', 'XL']
  if (currentProduct.value.category === 'eyewear') return ['Small', 'Medium', 'Large']
  return []
})

const availableColors = computed(() => {
  if (!currentProduct.value) return []
  return [
    { name: 'Black', value: '#000000' },
    { name: 'Brown', value: '#8B4513' },
    { name: 'Navy', value: '#000080' }
  ]
})

const socialSession = computed(() => {
  return arTryOn.state.socialSessions.find(s => s.isActive)
})

// AR Settings
const arSettings = reactive({
  quality: 'high',
  showPrice: true,
  showBrand: true,
  showFit: true,
  mirrorMode: false
})

// Lifecycle
onMounted(async () => {
  try {
    await arTryOn.initializeAR()
    
    // Set canvas dimensions
    const video = arTryOn.videoRef.value
    if (video) {
      video.addEventListener('loadedmetadata', () => {
        canvasWidth.value = video.videoWidth
        canvasHeight.value = video.videoHeight
      })
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'AR initialization failed'
  }
})

onUnmounted(() => {
  arTryOn.stopTryOn()
})

// Product Actions
const selectProduct = async (product: any) => {
  currentProduct.value = product
  await arTryOn.startTryOn(product)
}

const changeSize = (size: string) => {
  selectedSize.value = size
  arTryOn.adjustSize(size)
}

const changeColor = (color: string) => {
  selectedColor.value = color
  arTryOn.changeColor(color)
}

const addToCart = async () => {
  if (!currentProduct.value) return
  
  await arTryOn.addToCart()
  emit('productAdded', currentProduct.value.id)
}

// Recording & Sharing
const toggleRecording = () => {
  isRecording.value = !isRecording.value
  
  if (arTryOn.state.currentSession) {
    // Use type assertion to bypass readonly constraint
    const session = arTryOn.state.currentSession as any
    session.recording = {
      isRecording: isRecording.value,
      duration: 0
    }
  }
}

const takeScreenshot = async () => {
  if (!arTryOn.canvasRef.value) return
  
  const canvas = arTryOn.canvasRef.value
  const dataURL = canvas.toDataURL('image/png')
  
  // Save screenshot
  const link = document.createElement('a')
  link.download = 'ar-tryon.png'
  link.href = dataURL
  link.click()
}

const shareTryOn = async () => {
  if (!arTryOn.canvasRef.value) return
  
  const canvas = arTryOn.canvasRef.value
  canvas.toBlob(async (blob) => {
    if (blob) {
      const file = new File([blob], 'ar-tryon.png', { type: 'image/png' })
      await arTryOn.shareTrayon(URL.createObjectURL(blob))
    }
  })
}

const startSocialTryOn = async () => {
  // Mock friend IDs - in real app, this would show a friend picker
  const friendIds = ['friend1', 'friend2']
  await arTryOn.startSocialTryOn(friendIds)
}

// Settings
const updateARQuality = () => {
  (arTryOn.state.performance as any).quality = arSettings.quality as 'low' | 'medium' | 'high'
}

const toggleOverlay = (overlayType: string) => {
  if (!arTryOn.state.currentSession) return
  
  const overlay = arTryOn.state.currentSession.overlays.find(o => o.type === overlayType)
  if (overlay) {
    (overlay as any).isVisible = arSettings[overlayType.replace('_', '') as keyof typeof arSettings] as boolean
  }
}

const toggleMirrorMode = () => {
  // Implement mirror mode logic
  console.log('Mirror mode:', arSettings.mirrorMode)
}

// Utility Functions
const getOverlayPosition = (position: { x: number; y: number; z: number }) => {
  return {
    left: `${position.x * 100}%`,
    top: `${position.y * 100}%`,
    transform: 'translate(-50%, -50%)'
  }
}

const retryInitialization = async () => {
  error.value = null
  try {
    await arTryOn.initializeAR()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'AR initialization failed'
  }
}
</script>
