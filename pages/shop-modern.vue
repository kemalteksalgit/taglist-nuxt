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
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      <!-- Modern Hero Section -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div class="absolute inset-0 opacity-20">
          <div class="w-full h-full" style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;"></div>
        </div>
        
        <div class="relative pt-20 pb-16">
          <div class="max-w-6xl mx-auto px-6">
            
            <!-- Header Content -->
            <div class="text-center mb-12">
              <div class="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <h1 class="text-5xl font-bold text-white mb-4">TagList Mağaza</h1>
              <p class="text-xl text-white/80 max-w-2xl mx-auto">Modern alışveriş deneyimi ile binlerce ürün arasından istediğinizi bulun</p>
            </div>
            
            <!-- Search Bar -->
            <div class="max-w-2xl mx-auto mb-8">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Ürün, marka veya kategori ara..."
                  @keyup.enter="performSearch"
                  class="w-full px-6 py-4 pl-14 pr-20 text-gray-900 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                >
                <svg class="absolute left-5 top-5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <button @click="performSearch" class="absolute right-3 top-3 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                  Ara
                </button>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-white/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
                <div class="text-3xl font-bold text-white">1,245</div>
                <div class="text-white/80">Aktif İlan</div>
              </div>
              <div class="bg-white/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
                <div class="text-3xl font-bold text-white">24/7</div>
                <div class="text-white/80">Müşteri Desteği</div>
              </div>
              <div class="bg-white/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
                <div class="text-3xl font-bold text-white">⭐ 4.8</div>
                <div class="text-white/80">Müşteri Memnuniyeti</div>
              </div>
              <div class="bg-white/20 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20">
                <div class="text-3xl font-bold text-white">🚚</div>
                <div class="text-white/80">Hızlı Kargo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        
        <!-- Categories -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Kategoriler</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectedCategory = category.id"
              :class="[
                'p-4 rounded-2xl text-center transition-all duration-200 hover:scale-105',
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              ]"
            >
              <div class="text-2xl mb-2">{{ category.icon }}</div>
              <div class="font-medium text-sm">{{ category.name }}</div>
              <div :class="selectedCategory === category.id ? 'text-blue-200' : 'text-gray-500'" class="text-xs">{{ category.count }}</div>
            </button>
          </div>
        </div>

        <!-- Filters & Controls -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Price Filter -->
              <select v-model="selectedPriceRange" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option v-for="range in priceRanges" :key="range.id" :value="range.id">{{ range.name }}</option>
              </select>
              
              <!-- Sort -->
              <select v-model="sortBy" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option v-for="option in sortOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
              </select>
              
              <!-- Clear Filters -->
              <button @click="clearFilters" class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Filtreleri Temizle
              </button>
            </div>
            
            <!-- View Mode -->
            <div class="flex items-center space-x-2">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Ürünler</h2>
            <div class="text-gray-600">{{ filteredProducts.length }} ürün bulundu</div>
          </div>
          
          <div :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              :class="[
                'bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100',
                viewMode === 'list' ? 'flex items-center p-4' : ''
              ]"
            >
              <!-- Product Image -->
              <div :class="viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'relative'">
                <img
                  :src="product.image"
                  :alt="product.title"
                  :class="viewMode === 'list' ? 'w-full h-full object-cover rounded-xl' : 'w-full h-48 object-cover'"
                >
                
                <!-- Badges & Actions (Grid View) -->
                <div v-if="viewMode === 'grid'" class="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <span v-if="product.badge" :class="[
                    'px-3 py-1 text-xs font-medium rounded-full backdrop-blur-md',
                    product.badge === 'İndirim' ? 'bg-red-500/90 text-white' :
                    product.badge === 'Yeni' ? 'bg-green-500/90 text-white' :
                    product.badge === 'Öne Çıkan' ? 'bg-purple-500/90 text-white' : 'bg-blue-500/90 text-white'
                  ]">
                    {{ product.badge }}
                  </span>
                  <button @click="toggleFavorite(product)" class="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <svg :class="product.isFavorite ? 'text-red-500' : 'text-gray-400'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Product Info -->
              <div :class="viewMode === 'list' ? 'flex-1 ml-6' : 'p-6'">
                <div :class="viewMode === 'list' ? 'flex items-start justify-between' : ''">
                  <div :class="viewMode === 'list' ? 'flex-1' : ''">
                    <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ product.title }}</h3>
                    <p class="text-sm text-gray-600 mb-3">{{ product.seller }}</p>
                    
                    <!-- Rating -->
                    <div class="flex items-center space-x-2 mb-3">
                      <div class="flex space-x-1">
                        <svg v-for="i in 5" :key="i" :class="i <= Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                      <span class="text-sm text-gray-600">{{ product.rating }} ({{ product.reviews }})</span>
                    </div>
                    
                    <!-- Price -->
                    <div class="flex items-center space-x-2 mb-4">
                      <span class="text-2xl font-bold text-blue-600">{{ product.price.toLocaleString() }} ₺</span>
                      <span v-if="product.originalPrice" class="text-lg text-gray-400 line-through">{{ product.originalPrice.toLocaleString() }} ₺</span>
                      <span v-if="product.discount" class="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">%{{ product.discount }} İndirim</span>
                    </div>
                  </div>
                  
                  <!-- Actions -->
                  <div :class="viewMode === 'list' ? 'flex flex-col space-y-2 ml-4' : 'flex space-x-2'">
                    <button
                      @click="addToCart(product)"
                      :class="[
                        'px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2',
                        product.isInCart
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                      </svg>
                      <span>{{ product.isInCart ? 'Sepette' : 'Sepete Ekle' }}</span>
                    </button>
                    
                    <button
                      @click="buyNow(product)"
                      class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      <span>Hemen Al</span>
                    </button>
                    
                    <button v-if="viewMode === 'list'" @click="toggleFavorite(product)" class="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                      <svg :class="product.isFavorite ? 'text-red-500' : 'text-gray-400'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                      </svg>
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
