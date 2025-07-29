<!-- components/VisualSearchUpload.vue -->
<!-- Advanced Visual Search with Camera, Upload and Crop functionality -->

<template>
  <div class="visual-search-container">
    <!-- Main Upload Area -->
    <div class="upload-section">
      <div 
        class="upload-dropzone"
        :class="{ 'dragover': isDragOver, 'processing': isProcessing }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelect"
        >
        
        <div v-if="!selectedImage && !isProcessing" class="upload-prompt">
          <Icon name="camera" class="upload-icon" />
          <h3>Visual Search ile Ürün Bul</h3>
          <p>Fotoğraf çek, yükle veya sürükle-bırak</p>
          
          <div class="upload-buttons">
            <button 
              @click.stop="openCamera" 
              class="btn-camera"
              :disabled="!cameraSupported"
            >
              <Icon name="camera" />
              Kamera
            </button>
            <button @click.stop="triggerFileInput" class="btn-upload">
              <Icon name="upload" />
              Yükle
            </button>
          </div>
        </div>

        <div v-else-if="isProcessing" class="processing-state">
          <LoadingSpinner size="large" />
          <p>Görsel analiz ediliyor...</p>
          <div class="processing-steps">
            <div class="step" :class="{ active: currentStep >= 1 }">
              <span class="step-number">1</span>
              <span>Görsel yükleniyor</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 2 }">
              <span class="step-number">2</span>
              <span>Nesneler tespit ediliyor</span>
            </div>
            <div class="step" :class="{ active: currentStep >= 3 }">
              <span class="step-number">3</span>
              <span>Benzer ürünler bulunuyor</span>
            </div>
          </div>
        </div>

        <div v-else-if="selectedImage" class="image-preview">
          <div class="image-container">
            <img 
              ref="previewImage"
              :src="selectedImage" 
              alt="Selected image"
              @load="onImageLoad"
            >
            
            <!-- Crop overlay if cropping is enabled -->
            <div 
              v-if="showCropOverlay" 
              class="crop-overlay"
              @mousedown="startCrop"
              @mousemove="updateCrop"
              @mouseup="endCrop"
            >
              <div 
                class="crop-box"
                :style="cropBoxStyle"
              ></div>
            </div>

            <!-- Detected objects overlay -->
            <div v-if="detectedObjects.length > 0" class="objects-overlay">
              <div 
                v-for="object in detectedObjects"
                :key="object.label"
                class="detected-object"
                :style="getObjectBoundingBoxStyle(object)"
                @click="searchByObject(object)"
              >
                <span class="object-label">
                  {{ object.label }} ({{ Math.round(object.confidence * 100) }}%)
                </span>
              </div>
            </div>
          </div>

          <div class="image-actions">
            <button @click="toggleCrop" class="btn-action">
              <Icon name="crop" />
              {{ showCropOverlay ? 'Kırpmayı İptal Et' : 'Kırp' }}
            </button>
            <button @click="retakePhoto" class="btn-action">
              <Icon name="refresh" />
              Yeniden Çek
            </button>
            <button @click="searchImage" class="btn-search" :disabled="isSearching">
              <Icon name="search" />
              Ara
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera Modal -->
    <Modal v-if="showCamera" @close="closeCamera" size="large">
      <template #header>
        <h3>Kamera ile Fotoğraf Çek</h3>
      </template>
      
      <template #body>
        <div class="camera-container">
          <video 
            ref="videoElement"
            autoplay
            playsinline
            class="camera-video"
          ></video>
          
          <canvas 
            ref="canvasElement"
            class="hidden"
          ></canvas>
          
          <div class="camera-controls">
            <button @click="switchCamera" class="btn-switch" v-if="cameras.length > 1">
              <Icon name="switch-camera" />
            </button>
            
            <button @click="capturePhoto" class="btn-capture">
              <div class="capture-button"></div>
            </button>
            
            <button @click="toggleFlash" class="btn-flash" :class="{ active: flashEnabled }">
              <Icon name="flash" />
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Search Filters -->
    <div v-if="selectedImage" class="search-filters">
      <h4>Arama Filtreleri</h4>
      <div class="filter-grid">
        <div class="filter-group">
          <label>Kategori</label>
          <select v-model="searchFilters.category">
            <option value="">Tümü</option>
            <option value="Electronics">Elektronik</option>
            <option value="Fashion">Moda</option>
            <option value="Home">Ev & Bahçe</option>
            <option value="Sports">Spor</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Fiyat Aralığı</label>
          <div class="price-range">
            <input 
              v-model="searchFilters.priceRange.min" 
              type="number" 
              placeholder="Min"
            >
            <span>-</span>
            <input 
              v-model="searchFilters.priceRange.max" 
              type="number" 
              placeholder="Max"
            >
          </div>
        </div>

        <div class="filter-group">
          <label>Marka</label>
          <input 
            v-model="searchFilters.brand" 
            type="text" 
            placeholder="Marka ara..."
          >
        </div>

        <div class="filter-group">
          <label>Benzerlik Eşiği</label>
          <input 
            v-model="searchFilters.threshold" 
            type="range" 
            min="0.1" 
            max="1" 
            step="0.1"
            class="threshold-slider"
          >
          <span class="threshold-value">{{ Math.round(searchFilters.threshold * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- Dominant Colors Display -->
    <div v-if="dominantColors.length > 0" class="color-analysis">
      <h4>Tespit Edilen Renkler</h4>
      <div class="color-palette">
        <div 
          v-for="color in dominantColors"
          :key="color.hex"
          class="color-item"
          @click="searchByColor(color)"
        >
          <div 
            class="color-swatch"
            :style="{ backgroundColor: color.hex }"
          ></div>
          <div class="color-info">
            <span class="color-name">{{ color.name }}</span>
            <span class="color-percentage">{{ Math.round(color.percentage) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Extracted Text Display -->
    <div v-if="extractedText.length > 0" class="text-analysis">
      <h4>Tespit Edilen Metin</h4>
      <div class="text-tags">
        <span 
          v-for="text in extractedText"
          :key="text"
          class="text-tag"
          @click="searchByText(text)"
        >
          {{ text }}
        </span>
      </div>
    </div>

    <!-- Performance Stats -->
    <div v-if="searchTiming" class="performance-stats">
      <details>
        <summary>Performans İstatistikleri</summary>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Toplam Süre</span>
            <span class="stat-value">{{ Math.round(searchTiming.total) }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Görsel İşleme</span>
            <span class="stat-value">{{ Math.round(searchTiming.imageProcessing) }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Özellik Çıkarma</span>
            <span class="stat-value">{{ Math.round(searchTiming.featureExtraction) }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Benzerlik Hesaplama</span>
            <span class="stat-value">{{ Math.round(searchTiming.similarity) }}ms</span>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { visualSearchService, type VisualSearchQuery, type VisualSearchResult, type DetectedObject, type ColorInfo } from '~/services/VisualSearchService'

// Props
interface Props {
  autoSearch?: boolean
  maxFileSize?: number
  allowedTypes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  autoSearch: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: () => ['image/jpeg', 'image/png', 'image/webp']
})

// Emits
const emit = defineEmits<{
  results: [results: VisualSearchResult]
  error: [error: string]
}>()

// Reactive state
const fileInput = ref<HTMLInputElement>()
const previewImage = ref<HTMLImageElement>()
const videoElement = ref<HTMLVideoElement>()
const canvasElement = ref<HTMLCanvasElement>()

const selectedImage = ref<string>('')
const isProcessing = ref(false)
const isSearching = ref(false)
const currentStep = ref(0)
const isDragOver = ref(false)
const showCamera = ref(false)
const showCropOverlay = ref(false)
const cameraSupported = ref(false)
const flashEnabled = ref(false)

const detectedObjects = ref<DetectedObject[]>([])
const dominantColors = ref<ColorInfo[]>([])
const extractedText = ref<string[]>([])
const searchTiming = ref<any>(null)

const cameras = ref<MediaDeviceInfo[]>([])
const currentCameraIndex = ref(0)
const videoStream = ref<MediaStream | null>(null)

// Crop functionality
const cropBox = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})
const isCropping = ref(false)

// Search filters
const searchFilters = ref({
  category: '',
  priceRange: { min: 0, max: 100000 },
  brand: '',
  threshold: 0.3
})

// Computed properties
const cropBoxStyle = computed(() => ({
  left: `${cropBox.value.x}px`,
  top: `${cropBox.value.y}px`,
  width: `${cropBox.value.width}px`,
  height: `${cropBox.value.height}px`
}))

// Lifecycle hooks
onMounted(async () => {
  await checkCameraSupport()
  await loadAvailableCameras()
})

onUnmounted(() => {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop())
  }
})

// Camera support and management
async function checkCameraSupport() {
  cameraSupported.value = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
}

async function loadAvailableCameras() {
  if (!cameraSupported.value) return
  
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    cameras.value = devices.filter(device => device.kind === 'videoinput')
  } catch (error) {
    console.error('Failed to load cameras:', error)
  }
}

async function openCamera() {
  if (!cameraSupported.value) {
    emit('error', 'Kamera bu cihazda desteklenmiyor')
    return
  }

  showCamera.value = true
  
  try {
    await startVideoStream()
  } catch (error) {
    console.error('Camera access failed:', error)
    emit('error', 'Kameraya erişim başarısız')
    closeCamera()
  }
}

async function startVideoStream() {
  if (!videoElement.value) return

  const constraints = {
    video: {
      deviceId: cameras.value[currentCameraIndex.value]?.deviceId,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  }

  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop())
  }

  videoStream.value = await navigator.mediaDevices.getUserMedia(constraints)
  videoElement.value.srcObject = videoStream.value
}

function closeCamera() {
  showCamera.value = false
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop())
    videoStream.value = null
  }
}

function switchCamera() {
  currentCameraIndex.value = (currentCameraIndex.value + 1) % cameras.value.length
  startVideoStream()
}

function toggleFlash() {
  flashEnabled.value = !flashEnabled.value
  if (videoStream.value) {
    const track = videoStream.value.getVideoTracks()[0]
    if (track && 'applyConstraints' in track) {
      track.applyConstraints({
        advanced: [{ torch: flashEnabled.value } as any]
      }).catch(() => {
        // Flash not supported
        flashEnabled.value = false
      })
    }
  }
}

function capturePhoto() {
  if (!videoElement.value || !canvasElement.value) return

  const video = videoElement.value
  const canvas = canvasElement.value
  const ctx = canvas.getContext('2d')!

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  ctx.drawImage(video, 0, 0)
  
  selectedImage.value = canvas.toDataURL('image/jpeg', 0.8)
  closeCamera()

  if (props.autoSearch) {
    searchImage()
  }
}

// File handling
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDragOver() {
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

async function processFile(file: File) {
  // Validate file
  if (!props.allowedTypes.includes(file.type)) {
    emit('error', 'Desteklenmeyen dosya formatı')
    return
  }

  if (file.size > props.maxFileSize) {
    emit('error', 'Dosya boyutu çok büyük')
    return
  }

  // Convert to base64
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
    if (props.autoSearch) {
      searchImage()
    }
  }
  reader.readAsDataURL(file)
}

function onImageLoad() {
  // Reset crop box when new image loads
  cropBox.value = { x: 0, y: 0, width: 0, height: 0 }
}

function retakePhoto() {
  selectedImage.value = ''
  detectedObjects.value = []
  dominantColors.value = []
  extractedText.value = []
  searchTiming.value = null
  showCropOverlay.value = false
}

// Crop functionality
function toggleCrop() {
  showCropOverlay.value = !showCropOverlay.value
  if (showCropOverlay.value) {
    // Initialize crop box to center 50% of image
    const img = previewImage.value!
    const rect = img.getBoundingClientRect()
    const centerX = rect.width * 0.25
    const centerY = rect.height * 0.25
    const size = Math.min(rect.width, rect.height) * 0.5
    
    cropBox.value = {
      x: centerX,
      y: centerY,
      width: size,
      height: size
    }
  }
}

function startCrop(event: MouseEvent) {
  if (!showCropOverlay.value) return
  
  isCropping.value = true
  const rect = previewImage.value!.getBoundingClientRect()
  cropBox.value.x = event.clientX - rect.left
  cropBox.value.y = event.clientY - rect.top
  cropBox.value.width = 0
  cropBox.value.height = 0
}

function updateCrop(event: MouseEvent) {
  if (!isCropping.value || !showCropOverlay.value) return
  
  const rect = previewImage.value!.getBoundingClientRect()
  const currentX = event.clientX - rect.left
  const currentY = event.clientY - rect.top
  
  cropBox.value.width = currentX - cropBox.value.x
  cropBox.value.height = currentY - cropBox.value.y
}

function endCrop() {
  isCropping.value = false
}

// Visual search
async function searchImage() {
  if (!selectedImage.value) return

  isSearching.value = true
  isProcessing.value = true
  currentStep.value = 1

  try {
    // Prepare search query
    const query: VisualSearchQuery = {
      imageData: selectedImage.value,
      filters: {
        category: searchFilters.value.category || undefined,
        priceRange: searchFilters.value.priceRange.min > 0 || searchFilters.value.priceRange.max < 100000 
          ? searchFilters.value.priceRange 
          : undefined,
        brand: searchFilters.value.brand || undefined
      },
      threshold: searchFilters.value.threshold,
      limit: 20
    }

    // Add crop box if cropping is active
    if (showCropOverlay.value && cropBox.value.width > 0 && cropBox.value.height > 0) {
      const img = previewImage.value!
      const rect = img.getBoundingClientRect()
      
      query.cropBox = {
        x: cropBox.value.x / rect.width,
        y: cropBox.value.y / rect.height,
        width: cropBox.value.width / rect.width,
        height: cropBox.value.height / rect.height
      }
    }

    currentStep.value = 2
    
    // Perform visual search
    const results = await visualSearchService.search(query)
    
    currentStep.value = 3
    
    // Update UI with results
    detectedObjects.value = results.detectedObjects || []
    dominantColors.value = results.dominantColors || []
    extractedText.value = results.extractedText || []
    searchTiming.value = results.timing

    // Emit results to parent
    emit('results', results)

  } catch (error) {
    console.error('Visual search failed:', error)
    emit('error', 'Görsel arama başarısız')
  } finally {
    isSearching.value = false
    isProcessing.value = false
    currentStep.value = 0
  }
}

// Search by specific features
function searchByObject(object: DetectedObject) {
  // Add object category to filters and search again
  searchFilters.value.category = object.category
  searchImage()
}

function searchByColor(color: ColorInfo) {
  // This would add color filter in a full implementation
  console.log('Search by color:', color.name)
  // For now, just search again with current filters
  searchImage()
}

function searchByText(text: string) {
  // This would add text search in a full implementation
  console.log('Search by text:', text)
  // For now, just search again with current filters
  searchImage()
}

// Utility functions
function getObjectBoundingBoxStyle(object: DetectedObject) {
  const img = previewImage.value
  if (!img) return {}

  const rect = img.getBoundingClientRect()
  
  return {
    left: `${object.boundingBox.x * rect.width}px`,
    top: `${object.boundingBox.y * rect.height}px`,
    width: `${object.boundingBox.width * rect.width}px`,
    height: `${object.boundingBox.height * rect.height}px`
  }
}
</script>

<style scoped>
.visual-search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

/* Upload Section */
.upload-section {
  margin-bottom: 2rem;
}

.upload-dropzone {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.upload-dropzone:hover,
.upload-dropzone.dragover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-dropzone.processing {
  border-color: #f59e0b;
  background: #fffbeb;
}

.hidden {
  display: none;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
  color: #6b7280;
}

.upload-prompt h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.upload-prompt p {
  margin: 0;
  color: #6b7280;
}

.upload-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-camera,
.btn-upload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-camera {
  background: #3b82f6;
  color: white;
}

.btn-camera:hover:not(:disabled) {
  background: #2563eb;
}

.btn-camera:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-upload {
  background: #10b981;
  color: white;
}

.btn-upload:hover {
  background: #059669;
}

/* Processing State */
.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.processing-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.step.active {
  color: #3b82f6;
  font-weight: 500;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  font-size: 0.75rem;
  font-weight: 600;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

/* Image Preview */
.image-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-container {
  position: relative;
  display: flex;
  justify-content: center;
}

.image-container img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: crosshair;
}

.crop-box {
  position: absolute;
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

.objects-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.detected-object {
  position: absolute;
  border: 2px solid #10b981;
  border-radius: 4px;
  pointer-events: auto;
  cursor: pointer;
}

.object-label {
  position: absolute;
  top: -1.5rem;
  left: 0;
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.image-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action,
.btn-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: #f3f4f6;
}

.btn-search {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-search:hover:not(:disabled) {
  background: #2563eb;
}

.btn-search:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

/* Camera Modal */
.camera-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.camera-video {
  width: 100%;
  border-radius: 8px;
}

.camera-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
}

.btn-switch,
.btn-flash {
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-switch:hover,
.btn-flash:hover {
  background: #e5e7eb;
}

.btn-flash.active {
  background: #fbbf24;
  color: white;
}

.btn-capture {
  width: 4rem;
  height: 4rem;
  border: 4px solid white;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  position: relative;
}

.capture-button {
  width: 100%;
  height: 100%;
  background: #ef4444;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.btn-capture:hover .capture-button {
  background: #dc2626;
  transform: scale(0.9);
}

/* Search Filters */
.search-filters {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.search-filters h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-group select,
.filter-group input[type="text"],
.filter-group input[type="number"] {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-range input {
  flex: 1;
}

.threshold-slider {
  width: 100%;
}

.threshold-value {
  text-align: center;
  font-weight: 500;
  color: #3b82f6;
}

/* Color Analysis */
.color-analysis,
.text-analysis {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.color-analysis h4,
.text-analysis h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.color-palette {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.color-swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.color-percentage {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Text Analysis */
.text-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.text-tag {
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.text-tag:hover {
  background: #dbeafe;
}

/* Performance Stats */
.performance-stats {
  margin-top: 1.5rem;
}

.performance-stats summary {
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  padding: 0.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 6px;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

/* Responsive Design */
@media (max-width: 768px) {
  .visual-search-container {
    padding: 0.5rem;
  }
  
  .upload-buttons {
    flex-direction: column;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .image-actions {
    flex-direction: column;
  }
  
  .color-palette {
    justify-content: center;
  }
  
  .camera-controls {
    gap: 1rem;
  }
}
</style>
