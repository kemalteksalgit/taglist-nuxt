<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">📺 Canlı Yayına Başla</h1>
            <p class="text-gray-600 mt-2">Ürünlerinizi canlı yayında tanıtın ve satışlarınızı artırın</p>
          </div>
          <div v-if="isLive" class="flex items-center space-x-3">
            <div class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
              CANLI YAYINDA
            </div>
            <span class="text-gray-600">👥 {{ currentViewers }} izleyici</span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Setup Panel -->
        <div class="lg:col-span-2">
          <!-- Camera Setup -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">📷 Kamera Ayarları</h2>
            
            <!-- Camera Preview -->
            <div class="relative bg-black rounded-lg overflow-hidden mb-4">
              <video 
                ref="previewVideo"
                class="w-full h-64 object-cover"
                :class="{ 'mirror': true }"
                autoplay
                muted
                playsinline
              />
              
              <!-- Camera Controls Overlay -->
              <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div class="flex space-x-2">
                  <button
                    @click="toggleCamera"
                    :class="[
                      'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                      cameraEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    ]"
                  >
                    <Icon :name="cameraEnabled ? 'mdi:video' : 'mdi:video-off'" class="w-6 h-6" />
                  </button>
                  <button
                    @click="toggleMic"
                    :class="[
                      'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                      micEnabled ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    ]"
                  >
                    <Icon :name="micEnabled ? 'mdi:microphone' : 'mdi:microphone-off'" class="w-6 h-6" />
                  </button>
                </div>
                
                <div class="flex space-x-2">
                  <button
                    @click="switchCamera"
                    class="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Icon name="mdi:camera-flip" class="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Camera/Mic Selection -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Kamera</label>
                <select v-model="selectedCamera" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option v-for="camera in availableCameras" :key="camera.deviceId" :value="camera.deviceId">
                    {{ camera.label || `Kamera ${camera.deviceId.slice(0, 8)}` }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mikrofon</label>
                <select v-model="selectedMic" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option v-for="mic in availableMics" :key="mic.deviceId" :value="mic.deviceId">
                    {{ mic.label || `Mikrofon ${mic.deviceId.slice(0, 8)}` }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Stream Settings -->
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">⚙️ Yayın Ayarları</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Yayın Başlığı</label>
                <input
                  v-model="streamTitle"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yayınınızın başlığını girin"
                  maxlength="100"
                >
                <div class="text-xs text-gray-500 mt-1">{{ streamTitle.length }}/100 karakter</div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  v-model="streamDescription"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yayınınızı kısaca açıklayın"
                  maxlength="500"
                ></textarea>
                <div class="text-xs text-gray-500 mt-1">{{ streamDescription.length }}/500 karakter</div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select v-model="streamCategory" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Kategori seçin</option>
                    <option value="electronics">Elektronik</option>
                    <option value="fashion">Moda</option>
                    <option value="home">Ev & Dekorasyon</option>
                    <option value="sports">Spor</option>
                    <option value="books">Kitap</option>
                    <option value="toys">Oyuncak</option>
                    <option value="automotive">Otomotiv</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Görünürlük</label>
                  <select v-model="streamVisibility" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="public">Herkese Açık</option>
                    <option value="followers">Sadece Takipçiler</option>
                    <option value="private">Özel</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Controls (when streaming) -->
          <div v-if="isLive" class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">🎛️ Yayın Kontrolleri</h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                @click="highlightProduct"
                class="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
              >
                <Icon name="mdi:star" class="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div class="text-sm font-medium">Ürün Vurgula</div>
              </button>
              
              <button
                @click="startAuction"
                class="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors text-center"
              >
                <Icon name="mdi:gavel" class="w-6 h-6 mx-auto mb-2 text-red-600" />
                <div class="text-sm font-medium">Açık Artırma</div>
              </button>
              
              <button
                @click="showOfferModal"
                class="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center"
              >
                <Icon name="mdi:tag" class="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div class="text-sm font-medium">Özel Teklif</div>
              </button>
              
              <button
                @click="endStream"
                class="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
              >
                <Icon name="mdi:stop" class="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div class="text-sm font-medium">Yayını Bitir</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Products for Stream -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">🛍️ Yayın Ürünleri</h3>
            
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="product in selectedProducts"
                :key="product.id"
                class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                :class="{ 'border-blue-500 bg-blue-50': product.id === highlightedProduct }"
              >
                <img :src="product.image" :alt="product.name" class="w-12 h-12 object-cover rounded">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</div>
                  <div class="text-sm text-green-600 font-semibold">{{ formatPrice(product.price) }}</div>
                </div>
                <div class="flex flex-col space-y-1">
                  <button
                    @click="highlightedProduct = product.id"
                    :class="[
                      'text-xs px-2 py-1 rounded transition-colors',
                      product.id === highlightedProduct
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]"
                  >
                    Vurgula
                  </button>
                  <button
                    @click="removeProduct(product.id)"
                    class="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            </div>

            <button
              @click="showProductSelector = true"
              class="w-full mt-4 border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Ürün Ekle
            </button>
          </div>

          <!-- Stream Stats (when live) -->
          <div v-if="isLive" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">📊 Canlı İstatistikler</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">İzleyici</span>
                <span class="font-semibold">{{ currentViewers }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Toplam İzlenme</span>
                <span class="font-semibold">{{ totalViews }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Yorumlar</span>
                <span class="font-semibold">{{ commentCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Beğeniler</span>
                <span class="font-semibold">{{ likeCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Satış</span>
                <span class="font-semibold text-green-600">{{ formatPrice(salesAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Go Live Button -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <button
              v-if="!isLive"
              @click="startStream"
              :disabled="!canGoLive"
              class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="mdi:broadcast" class="w-6 h-6 inline mr-2" />
              Canlı Yayına Başla
            </button>
            
            <div v-else class="text-center">
              <div class="text-gray-600 mb-2">Yayın süresi</div>
              <div class="text-2xl font-bold text-red-600">{{ formatDuration(streamDuration) }}</div>
            </div>

            <!-- Pre-live Checklist -->
            <div v-if="!isLive" class="mt-4 space-y-2">
              <div class="flex items-center space-x-2 text-sm">
                <Icon :name="cameraEnabled ? 'mdi:check-circle' : 'mdi:circle-outline'" 
                      :class="cameraEnabled ? 'text-green-600' : 'text-gray-400'" />
                <span :class="cameraEnabled ? 'text-green-600' : 'text-gray-600'">Kamera aktif</span>
              </div>
              <div class="flex items-center space-x-2 text-sm">
                <Icon :name="micEnabled ? 'mdi:check-circle' : 'mdi:circle-outline'" 
                      :class="micEnabled ? 'text-green-600' : 'text-gray-400'" />
                <span :class="micEnabled ? 'text-green-600' : 'text-gray-600'">Mikrofon aktif</span>
              </div>
              <div class="flex items-center space-x-2 text-sm">
                <Icon :name="streamTitle.length > 0 ? 'mdi:check-circle' : 'mdi:circle-outline'" 
                      :class="streamTitle.length > 0 ? 'text-green-600' : 'text-gray-400'" />
                <span :class="streamTitle.length > 0 ? 'text-green-600' : 'text-gray-600'">Başlık girildi</span>
              </div>
              <div class="flex items-center space-x-2 text-sm">
                <Icon :name="selectedProducts.length > 0 ? 'mdi:check-circle' : 'mdi:circle-outline'" 
                      :class="selectedProducts.length > 0 ? 'text-green-600' : 'text-gray-400'" />
                <span :class="selectedProducts.length > 0 ? 'text-green-600' : 'text-gray-600'">Ürün eklendi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Selector Modal -->
    <ProductSelectorModal
      v-if="showProductSelector"
      :selected-products="selectedProducts"
      @close="showProductSelector = false"
      @products-selected="addProducts"
    />
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// SEO
useSeoMeta({
  title: 'Canlı Yayına Başla - TagList',
  meta: [
    { name: 'description', content: 'TagList ile canlı yayına başlayın. Ürünlerinizi tanıtın ve satışlarınızı artırın.' }
  ]
})

// Reactive data
const previewVideo = ref(null)
const isLive = ref(false)
const cameraEnabled = ref(true)
const micEnabled = ref(true)
const selectedCamera = ref('')
const selectedMic = ref('')
const availableCameras = ref([])
const availableMics = ref([])

// Stream settings
const streamTitle = ref('')
const streamDescription = ref('')
const streamCategory = ref('')
const streamVisibility = ref('public')

// Products
const selectedProducts = ref([
  {
    id: 1,
    name: 'iPhone 14 Pro Max 256GB',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
    price: 28500
  },
  {
    id: 2,
    name: 'MacBook Pro M2 14"',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100',
    price: 18500
  }
])
const highlightedProduct = ref(null)
const showProductSelector = ref(false)

// Live stats
const currentViewers = ref(0)
const totalViews = ref(0)
const commentCount = ref(0)
const likeCount = ref(0)
const salesAmount = ref(0)
const streamDuration = ref(0)

// Computed
const canGoLive = computed(() => {
  return cameraEnabled.value && 
         micEnabled.value && 
         streamTitle.value.length > 0 && 
         selectedProducts.value.length > 0
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

const initializeCamera = async () => {
  try {
    // Get available devices
    const devices = await navigator.mediaDevices.enumerateDevices()
    availableCameras.value = devices.filter(device => device.kind === 'videoinput')
    availableMics.value = devices.filter(device => device.kind === 'audioinput')
    
    // Set default devices
    if (availableCameras.value.length > 0) {
      selectedCamera.value = availableCameras.value[0].deviceId
    }
    if (availableMics.value.length > 0) {
      selectedMic.value = availableMics.value[0].deviceId
    }
    
    // Start camera preview
    await startCameraPreview()
  } catch (error) {
    console.error('Camera initialization failed:', error)
  }
}

const startCameraPreview = async () => {
  try {
    const constraints = {
      video: {
        deviceId: selectedCamera.value ? { exact: selectedCamera.value } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: {
        deviceId: selectedMic.value ? { exact: selectedMic.value } : undefined
      }
    }
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    if (previewVideo.value) {
      previewVideo.value.srcObject = stream
    }
  } catch (error) {
    console.error('Failed to start camera preview:', error)
  }
}

const toggleCamera = () => {
  cameraEnabled.value = !cameraEnabled.value
  if (previewVideo.value && previewVideo.value.srcObject) {
    const tracks = previewVideo.value.srcObject.getVideoTracks()
    tracks.forEach(track => {
      track.enabled = cameraEnabled.value
    })
  }
}

const toggleMic = () => {
  micEnabled.value = !micEnabled.value
  if (previewVideo.value && previewVideo.value.srcObject) {
    const tracks = previewVideo.value.srcObject.getAudioTracks()
    tracks.forEach(track => {
      track.enabled = micEnabled.value
    })
  }
}

const switchCamera = async () => {
  const currentIndex = availableCameras.value.findIndex(cam => cam.deviceId === selectedCamera.value)
  const nextIndex = (currentIndex + 1) % availableCameras.value.length
  selectedCamera.value = availableCameras.value[nextIndex].deviceId
  await startCameraPreview()
}

const startStream = async () => {
  if (!canGoLive.value) return
  
  try {
    // Here you would start the actual live stream
    // For demo purposes, we'll just simulate it
    isLive.value = true
    currentViewers.value = Math.floor(Math.random() * 50) + 10
    
    // Start duration timer
    const durationInterval = setInterval(() => {
      streamDuration.value++
    }, 1000)
    
    // Simulate live stats updates
    const statsInterval = setInterval(() => {
      currentViewers.value += Math.floor(Math.random() * 10) - 5
      currentViewers.value = Math.max(0, currentViewers.value)
      totalViews.value += Math.floor(Math.random() * 5)
      commentCount.value += Math.floor(Math.random() * 3)
      likeCount.value += Math.floor(Math.random() * 5)
      
      if (Math.random() > 0.8) { // 20% chance of sale
        salesAmount.value += Math.floor(Math.random() * 5000) + 1000
      }
    }, 5000)
    
    // Store intervals for cleanup
    window.streamIntervals = { durationInterval, statsInterval }
    
  } catch (error) {
    console.error('Failed to start stream:', error)
  }
}

const endStream = () => {
  isLive.value = false
  
  // Clear intervals
  if (window.streamIntervals) {
    clearInterval(window.streamIntervals.durationInterval)
    clearInterval(window.streamIntervals.statsInterval)
    delete window.streamIntervals
  }
  
  // Reset stats
  streamDuration.value = 0
  currentViewers.value = 0
  
  // Redirect to stream analytics or summary page
  navigateTo('/dashboard')
}

const highlightProduct = () => {
  if (selectedProducts.value.length > 0) {
    const currentIndex = selectedProducts.value.findIndex(p => p.id === highlightedProduct.value)
    const nextIndex = (currentIndex + 1) % selectedProducts.value.length
    highlightedProduct.value = selectedProducts.value[nextIndex].id
  }
}

const startAuction = () => {
  // Open auction modal or start auction for highlighted product
  alert('Açık artırma başlatıldı!')
}

const showOfferModal = () => {
  // Show special offer modal
  alert('Özel teklif modalı açılacak!')
}

const addProducts = (products) => {
  selectedProducts.value.push(...products)
  showProductSelector.value = false
}

const removeProduct = (productId) => {
  const index = selectedProducts.value.findIndex(p => p.id === productId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  }
  
  if (highlightedProduct.value === productId) {
    highlightedProduct.value = null
  }
}

// Lifecycle
onMounted(() => {
  initializeCamera()
})

onUnmounted(() => {
  // Clean up camera stream
  if (previewVideo.value && previewVideo.value.srcObject) {
    const tracks = previewVideo.value.srcObject.getTracks()
    tracks.forEach(track => track.stop())
  }
  
  // Clean up intervals
  if (window.streamIntervals) {
    clearInterval(window.streamIntervals.durationInterval)
    clearInterval(window.streamIntervals.statsInterval)
    delete window.streamIntervals
  }
})
</script>

<style scoped>
.mirror {
  transform: scaleX(-1);
}

/* Hide video controls */
video::-webkit-media-controls {
  display: none !important;
}

video::-moz-media-controls {
  display: none !important;
}

/* Custom scrollbar for products list */
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
