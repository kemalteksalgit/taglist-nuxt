<script setup>
// SEO
useHead({
  title: 'Mağaza - TagList',
  meta: [
    { name: 'description', content: 'TagList modern e-ticaret mağazası. En iyi ürünleri keşfedin.' }
  ]
})

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedPriceRange = ref('all')
const sortBy = ref('newest')
const viewMode = ref('grid') // grid or list
const isLoading = ref(false)

// Categories
const categories = ref([
  { id: 'all', name: 'Tümü', icon: '🏪', count: 1245 },
  { id: 'electronics', name: 'Elektronik', icon: '📱', count: 324 },
  { id: 'fashion', name: 'Moda', icon: '👕', count: 289 },
  { id: 'home', name: 'Ev & Yaşam', icon: '🏠', count: 156 },
  { id: 'automotive', name: 'Otomotiv', icon: '🚗', count: 78 },
  { id: 'sports', name: 'Spor', icon: '⚽', count: 112 },
  { id: 'books', name: 'Kitap', icon: '📚', count: 89 }
])

// Price ranges
const priceRanges = ref([
  { id: 'all', name: 'Tüm Fiyatlar', min: 0, max: Infinity },
  { id: 'under100', name: '100₺ Altı', min: 0, max: 100 },
  { id: '100-500', name: '100₺ - 500₺', min: 100, max: 500 },
  { id: '500-1000', name: '500₺ - 1000₺', min: 500, max: 1000 },
  { id: 'over1000', name: '1000₺ Üzeri', min: 1000, max: Infinity }
])

// Sort options
const sortOptions = ref([
  { id: 'newest', name: 'En Yeni' },
  { id: 'oldest', name: 'En Eski' },
  { id: 'price-low', name: 'Fiyat: Düşük-Yüksek' },
  { id: 'price-high', name: 'Fiyat: Yüksek-Düşük' },
  { id: 'popular', name: 'En Popüler' }
])

// Featured products
const featuredProducts = ref([
  {
    id: 1,
    title: 'iPhone 14 Pro Max 256GB',
    price: 42000,
    originalPrice: 45000,
    image: 'https://picsum.photos/400/300?random=1',
    seller: 'TechStore',
    rating: 4.9,
    reviews: 124,
    discount: 7,
    badge: 'Öne Çıkan',
    isFavorite: false,
    isInCart: false
  },
  {
    id: 2,
    title: 'MacBook Air M2 13"',
    price: 28000,
    originalPrice: 30000,
    image: 'https://picsum.photos/400/300?random=2',
    seller: 'AppleStore',
    rating: 4.8,
    reviews: 89,
    discount: 7,
    badge: 'Hızlı Kargo',
    isFavorite: true,
    isInCart: false
  },
  {
    id: 3,
    title: 'Samsung Galaxy S24 Ultra',
    price: 35000,
    originalPrice: null,
    image: 'https://picsum.photos/400/300?random=3',
    seller: 'GalaxyWorld',
    rating: 4.7,
    reviews: 156,
    discount: 0,
    badge: 'Yeni',
    isFavorite: false,
    isInCart: true
  },
  {
    id: 4,
    title: 'Sony WH-1000XM5 Kulaklık',
    price: 8500,
    originalPrice: 9500,
    image: 'https://picsum.photos/400/300?random=4',
    seller: 'AudioTech',
    rating: 4.9,
    reviews: 78,
    discount: 11,
    badge: 'İndirim',
    isFavorite: false,
    isInCart: false
  }
])

// All products (for search/filter)
const allProducts = ref([...featuredProducts.value])

// Computed
const filteredProducts = computed(() => {
  let products = allProducts.value

  // Category filter
  if (selectedCategory.value !== 'all') {
    // Filter by category logic
  }

  // Search filter
  if (searchQuery.value) {
    products = products.filter(product =>
      product.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Sort
  switch (sortBy.value) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      products.sort((a, b) => b.price - a.price)
      break
    case 'popular':
      products.sort((a, b) => b.rating - a.rating)
      break
  }

  return products
})

// Methods
const toggleFavorite = (product) => {
  product.isFavorite = !product.isFavorite
  if (product.isFavorite) {
    showToast('Favorilere eklendi', 'success')
  } else {
    showToast('Favorilerden çıkarıldı', 'info')
  }
}

const addToCart = (product) => {
  product.isInCart = !product.isInCart
  if (product.isInCart) {
    showToast('Sepete eklendi', 'success')
  } else {
    showToast('Sepetten çıkarıldı', 'info')
  }
}

const buyNow = (product) => {
  showToast(`${product.title} satın alınıyor...`, 'info')
  // Redirect to checkout
}

const showToast = (message, type) => {
  // Toast notification logic
  alert(message)
}

const performSearch = () => {
  // Search logic
}

const clearFilters = () => {
  selectedCategory.value = 'all'
  selectedPriceRange.value = 'all'
  searchQuery.value = ''
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
      
      <!-- Clean Header -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">🛍️ TagList Mağaza</h1>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">En kaliteli ürünleri keşfedin, güvenle alışveriş yapın</p>
          </div>
          
          <!-- Search Bar -->
          <div class="max-w-xl mx-auto mt-8">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Ürün, marka ara..."
                @keyup.enter="performSearch"
                class="w-full px-4 py-3 pl-11 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
              <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <button @click="performSearch" class="absolute right-2 top-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                Ara
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-lg p-4 text-center border shadow-sm">
            <div class="text-2xl font-bold text-blue-600">1,245</div>
            <div class="text-sm text-gray-600">Aktif İlan</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center border shadow-sm">
            <div class="text-2xl font-bold text-green-600">24/7</div>
            <div class="text-sm text-gray-600">Destek</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center border shadow-sm">
            <div class="text-2xl font-bold text-yellow-600">4.8 ⭐</div>
            <div class="text-sm text-gray-600">Puan</div>
          </div>
          <div class="bg-white rounded-lg p-4 text-center border shadow-sm">
            <div class="text-2xl font-bold text-purple-600">🚚</div>
            <div class="text-sm text-gray-600">Hızlı Kargo</div>
          </div>
        </div>
        
        <!-- Categories -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Kategoriler</h2>
          <div class="grid grid-cols-3 md:grid-cols-7 gap-3">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectedCategory = category.id"
              :class="[
                'p-3 rounded-lg text-center transition-all hover:scale-105',
                selectedCategory === category.id
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="text-lg mb-1">{{ category.icon }}</div>
              <div class="text-xs font-medium">{{ category.name }}</div>
              <div class="text-xs text-gray-500">{{ category.count }}</div>
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-700 font-medium">Fiyat:</label>
              <select v-model="selectedPriceRange" class="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500">
                <option v-for="range in priceRanges" :key="range.id" :value="range.id">{{ range.name }}</option>
              </select>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-700 font-medium">Sıralama:</label>
              <select v-model="sortBy" class="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500">
                <option v-for="option in sortOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
              </select>
            </div>
            
            <button @click="clearFilters" class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50">
              Temizle
            </button>
            
            <div class="ml-auto flex items-center gap-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-2 rounded-md',
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                ]"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-2 rounded-md',
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                ]"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Ürünler</h2>
            <span class="text-sm text-gray-600">{{ filteredProducts.length }} ürün</span>
          </div>
        </div>
        
        <!-- Products Grid -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
          >
            <!-- Product Image -->
            <div class="relative aspect-square">
              <img
                :src="product.image"
                :alt="product.title"
                class="w-full h-full object-cover"
              />
              
              <!-- Badge -->
              <span v-if="product.badge" :class="[
                'absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full',
                product.badge === 'İndirim' ? 'bg-red-100 text-red-700' :
                product.badge === 'Yeni' ? 'bg-green-100 text-green-700' :
                product.badge === 'Öne Çıkan' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              ]">
                {{ product.badge }}
              </span>
              
              <!-- Favorite Button -->
              <button @click="toggleFavorite(product)" class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <svg :class="product.isFavorite ? 'text-red-500' : 'text-gray-400'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
            
            <!-- Product Info -->
            <div class="p-4">
              <h3 class="font-medium text-gray-900 mb-1 line-clamp-2">{{ product.title }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ product.seller }}</p>
              
              <!-- Rating -->
              <div class="flex items-center gap-1 mb-2">
                <div class="flex">
                  <svg v-for="i in 5" :key="i" :class="i <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <span class="text-xs text-gray-500">{{ product.rating }} ({{ product.reviews }})</span>
              </div>
              
              <!-- Price -->
              <div class="flex items-center gap-2 mb-3">
                <span class="text-lg font-bold text-gray-900">{{ product.price.toLocaleString() }}₺</span>
                <span v-if="product.originalPrice" class="text-sm text-gray-500 line-through">{{ product.originalPrice.toLocaleString() }}₺</span>
                <span v-if="product.discount" class="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-%{{ product.discount }}</span>
              </div>
              
              <!-- Actions -->
              <div class="flex gap-2">
                <button
                  @click="addToCart(product)"
                  :class="[
                    'flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    product.isInCart
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  ]"
                >
                  {{ product.isInCart ? '✓ Sepette' : 'Sepete Ekle' }}
                </button>
                
                <button
                  @click="buyNow(product)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Hemen Al
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Products List -->
        <div v-else class="space-y-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start gap-4">
              <!-- Product Image -->
              <div class="w-24 h-24 flex-shrink-0">
                <img
                  :src="product.image"
                  :alt="product.title"
                  class="w-full h-full object-cover rounded-md"
                />
              </div>
              
              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900 mb-1">{{ product.title }}</h3>
                    <p class="text-sm text-gray-600 mb-2">{{ product.seller }}</p>
                    
                    <!-- Rating -->
                    <div class="flex items-center gap-1 mb-2">
                      <div class="flex">
                        <svg v-for="i in 5" :key="i" :class="i <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                      <span class="text-xs text-gray-500">{{ product.rating }} ({{ product.reviews }})</span>
                    </div>
                    
                    <!-- Price -->
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-bold text-gray-900">{{ product.price.toLocaleString() }}₺</span>
                      <span v-if="product.originalPrice" class="text-sm text-gray-500 line-through">{{ product.originalPrice.toLocaleString() }}₺</span>
                      <span v-if="product.discount" class="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">-%{{ product.discount }}</span>
                    </div>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex items-center gap-2 ml-4">
                    <button @click="toggleFavorite(product)" class="p-2 rounded-md hover:bg-gray-100 transition-colors">
                      <svg :class="product.isFavorite ? 'text-red-500' : 'text-gray-400'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                    
                    <button
                      @click="addToCart(product)"
                      :class="[
                        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        product.isInCart
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      ]"
                    >
                      {{ product.isInCart ? '✓ Sepette' : 'Sepete Ekle' }}
                    </button>
                    
                    <button
                      @click="buyNow(product)"
                      class="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Hemen Al
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
