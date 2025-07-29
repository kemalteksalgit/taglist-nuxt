<!-- components/ui/ImageGallery.vue -->
<template>
  <div class="relative">
    <!-- Main Image Display -->
    <div class="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
      <img 
        :src="currentImage" 
        :alt="alt"
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        @load="onImageLoad"
        @error="onImageError"
      >
      
      <!-- Loading State -->
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="md" />
      </div>
      
      <!-- Navigation Arrows -->
      <button
        v-if="images.length > 1 && showArrows"
        @click="previousImage"
        class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all backdrop-blur-sm"
        :class="{ 'opacity-50 cursor-not-allowed': currentIndex === 0 }"
      >
        <Icon name="mdi:chevron-left" class="w-6 h-6" />
      </button>
      
      <button
        v-if="images.length > 1 && showArrows"
        @click="nextImage"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all backdrop-blur-sm"
        :class="{ 'opacity-50 cursor-not-allowed': currentIndex === images.length - 1 }"
      >
        <Icon name="mdi:chevron-right" class="w-6 h-6" />
      </button>
      
      <!-- Image Counter -->
      <div v-if="images.length > 1 && showCounter" class="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
      
      <!-- Fullscreen Button -->
      <button
        v-if="allowFullscreen"
        @click="openFullscreen"
        class="absolute top-2 right-2 w-10 h-10 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all backdrop-blur-sm"
      >
        <Icon name="mdi:fullscreen" class="w-6 h-6" />
      </button>
    </div>

    <!-- Thumbnail Navigation -->
    <div v-if="images.length > 1 && showThumbnails" class="mt-4">
      <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="setCurrentImage(index)"
          class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
          :class="[
            currentIndex === index 
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <img 
            :src="image" 
            :alt="`Thumbnail ${index + 1}`"
            class="w-full h-full object-cover"
          >
        </button>
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <Modal 
      v-model="isFullscreenOpen" 
      size="full" 
      :show-header="false"
      :close-on-backdrop="true"
    >
      <div class="relative h-screen flex items-center justify-center bg-black">
        <img 
          :src="currentImage" 
          :alt="alt"
          class="max-w-full max-h-full object-contain"
        >
        
        <!-- Fullscreen Navigation -->
        <button
          v-if="images.length > 1"
          @click="previousImage"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm"
        >
          <Icon name="mdi:chevron-left" class="w-8 h-8" />
        </button>
        
        <button
          v-if="images.length > 1"
          @click="nextImage"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm"
        >
          <Icon name="mdi:chevron-right" class="w-8 h-8" />
        </button>
        
        <!-- Close Button -->
        <button
          @click="closeFullscreen"
          class="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 text-white rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all backdrop-blur-sm"
        >
          <Icon name="mdi:close" class="w-8 h-8" />
        </button>
        
        <!-- Image Info -->
        <div class="absolute bottom-4 left-4 right-4 text-center text-white">
          <p class="text-lg font-medium">{{ alt }}</p>
          <p class="text-sm opacity-75 mt-1">{{ currentIndex + 1 }} / {{ images.length }}</p>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  alt?: string
  showArrows?: boolean
  showThumbnails?: boolean
  showCounter?: boolean
  allowFullscreen?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Product image',
  showArrows: true,
  showThumbnails: true,
  showCounter: true,
  allowFullscreen: true,
  autoPlay: false,
  autoPlayInterval: 3000
})

const currentIndex = ref(0)
const isLoading = ref(false)
const isFullscreenOpen = ref(false)
let autoPlayTimer: NodeJS.Timeout | null = null

const currentImage = computed(() => {
  return props.images[currentIndex.value] || '/images/placeholder.jpg'
})

const setCurrentImage = (index: number) => {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  } else if (props.autoPlay) {
    currentIndex.value = 0 // Loop back to first image
  }
}

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else if (props.autoPlay) {
    currentIndex.value = props.images.length - 1 // Loop to last image
  }
}

const openFullscreen = () => {
  isFullscreenOpen.value = true
}

const closeFullscreen = () => {
  isFullscreenOpen.value = false
}

const onImageLoad = () => {
  isLoading.value = false
}

const onImageError = () => {
  isLoading.value = false
  console.error('Failed to load image:', currentImage.value)
}

// Auto play functionality
const startAutoPlay = () => {
  if (props.autoPlay && props.images.length > 1) {
    autoPlayTimer = setInterval(() => {
      nextImage()
    }, props.autoPlayInterval)
  }
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (isFullscreenOpen.value) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        previousImage()
        break
      case 'ArrowRight':
        e.preventDefault()
        nextImage()
        break
      case 'Escape':
        e.preventDefault()
        closeFullscreen()
        break
    }
  }
}

// Watch for image changes
watch(currentIndex, () => {
  isLoading.value = true
})

// Watch for autoPlay changes
watch(() => props.autoPlay, (newValue) => {
  if (newValue) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  if (props.autoPlay) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopAutoPlay()
})

// Pause autoplay on hover
const pauseAutoPlay = () => {
  if (props.autoPlay) {
    stopAutoPlay()
  }
}

const resumeAutoPlay = () => {
  if (props.autoPlay) {
    startAutoPlay()
  }
}

// Expose methods for parent components
defineExpose({
  currentIndex: readonly(currentIndex),
  setCurrentImage,
  nextImage,
  previousImage,
  openFullscreen,
  closeFullscreen
})
</script>
