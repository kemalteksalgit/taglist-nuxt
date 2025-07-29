<template>
  <NuxtLayout>
    <div class="product-container">
    <div v-if="pending" class="loading-state">
      <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-center mt-4">Loading product...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <h1>Product Not Found</h1>
      <p>{{ error.message }}</p>
      <button @click="$router.back()" class="btn-secondary">Go Back</button>
    </div>
    <div v-else-if="product" class="product-content">
      <!-- Product Header -->
      <div class="product-header">
        <button @click="$router.back()" class="back-btn">
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          Back
        </button>
        
        <div class="header-actions">
          <button class="share-btn" @click="shareProduct">
            <Icon name="mdi:share-variant" class="w-5 h-5" />
          </button>
          <button 
            class="favorite-btn" 
            :class="{ active: isFavorited }" 
            @click="toggleFavorite"
          >
            <Icon 
              :name="isFavorited ? 'mdi:heart' : 'mdi:heart-outline'" 
              class="w-5 h-5"
            />
          </button>
        </div>
      </div>

      <!-- Product Images -->
      <div class="product-images">
        <div class="main-image-container">
          <img 
            :src="selectedImage" 
            :alt="product.title"
            class="main-image"
          />
          
          <button 
            v-if="product.images.length > 1"
            @click="previousImage"
            class="nav-btn nav-btn-left"
          >
            <Icon name="mdi:chevron-left" class="w-6 h-6" />
          </button>
          
          <button 
            v-if="product.images.length > 1"
            @click="nextImage"
            class="nav-btn nav-btn-right"
          >
            <Icon name="mdi:chevron-right" class="w-6 h-6" />
          </button>

          <!-- Image Counter -->
          <div v-if="product.images.length > 1" class="image-counter">
            {{ selectedImageIndex + 1 }} / {{ product.images.length }}
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <div class="title-section">
          <h1 class="product-title">{{ product.title }}</h1>
          <div class="product-id">ID: {{ product.id }}</div>
        </div>

        <!-- Price Section -->
        <div class="price-section">
          <div class="current-price">
            <span class="price-label">Price</span>
            <span class="price-amount">{{ formatPrice(product.price) }}</span>
          </div>
        </div>

        <!-- Buy Now Section -->
        <div class="buy-now-section">
          <button class="buy-now-btn" @click="buyNow">
            <Icon name="mdi:flash" class="w-5 h-5" />
            Buy Now - {{ formatPrice(product.price) }}
          </button>
        </div>

        <!-- Description -->
        <div class="description-section">
          <h3>Description</h3>
          <p>{{ product.description }}</p>
        </div>
      </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
interface Product {
  id: string
  title: string
  description: string
  price: number
  images: string[]
}

// Composables
const route = useRoute()
const router = useRouter()

// State
const product = ref<Product | null>(null)
const selectedImageIndex = ref(0)
const pending = ref(true)
const error = ref<Error | null>(null)
const isFavorited = ref(false)

// Computed
const selectedImage = computed(() => {
  return product.value?.images[selectedImageIndex.value] || ''
})

// Methods
const fetchProduct = async () => {
  try {
    pending.value = true
    error.value = null
    
    const productId = route.params.id as string
    await new Promise(resolve => setTimeout(resolve, 500))
    
    product.value = {
      id: productId,
      title: 'Vintage Leather Jacket',
      description: 'Beautiful vintage leather jacket in excellent condition.',
      price: 250,
      images: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600',
        'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600'
      ]
    }
  } catch (err) {
    error.value = err as Error
  } finally {
    pending.value = false
  }
}

const shareProduct = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: product.value?.title,
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  } catch (err) {
    console.error('Share failed:', err)
  }
}

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
}

const previousImage = () => {
  if (product.value && product.value.images.length > 1) {
    selectedImageIndex.value = selectedImageIndex.value === 0 
      ? product.value.images.length - 1 
      : selectedImageIndex.value - 1
  }
}

const nextImage = () => {
  if (product.value && product.value.images.length > 1) {
    selectedImageIndex.value = selectedImageIndex.value === product.value.images.length - 1 
      ? 0 
      : selectedImageIndex.value + 1
  }
}

const buyNow = async () => {
  if (product.value) {
    await router.push('/dashboard')
  }
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Lifecycle
onMounted(() => {
  fetchProduct()
})

// SEO
useHead({
  title: computed(() => product.value?.title || 'Product'),
  meta: [
    { name: 'description', content: computed(() => product.value?.description || '') }
  ]
})
</script>

<style scoped>
.product-container {
  @apply max-w-4xl mx-auto p-4 space-y-6;
}

.loading-state {
  @apply text-center py-12;
}

.error-state {
  @apply text-center py-12 space-y-4;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors;
}

.product-header {
  @apply flex items-center justify-between p-4 bg-white rounded-lg shadow-sm;
}

.back-btn {
  @apply flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors;
}

.header-actions {
  @apply flex items-center gap-3;
}

.share-btn, .favorite-btn {
  @apply p-2 text-gray-600 hover:text-gray-800 transition-colors;
}

.favorite-btn.active {
  @apply text-red-500;
}

.product-images {
  @apply bg-white rounded-lg overflow-hidden shadow-sm;
}

.main-image-container {
  @apply relative aspect-square bg-gray-100;
}

.main-image {
  @apply w-full h-full object-cover;
}

.nav-btn {
  @apply absolute top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors;
}

.nav-btn-left {
  @apply left-4;
}

.nav-btn-right {
  @apply right-4;
}

.image-counter {
  @apply absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm;
}

.product-info {
  @apply bg-white rounded-lg p-6 space-y-6;
}

.title-section {
  @apply space-y-3;
}

.product-title {
  @apply text-3xl font-bold text-gray-900;
}

.product-id {
  @apply text-sm text-gray-500;
}

.price-section {
  @apply flex items-end gap-4;
}

.current-price {
  @apply flex flex-col;
}

.price-label {
  @apply text-sm text-gray-600;
}

.price-amount {
  @apply text-2xl font-bold text-green-600;
}

.buy-now-section {
  @apply border-t pt-6;
}

.buy-now-btn {
  @apply w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors;
}

.description-section {
  @apply border-t pt-6;
}

.description-section h3 {
  @apply text-xl font-semibold mb-4;
}
</style>
