<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4">Ürünleri Keşfet</h1>
            <p class="text-xl opacity-90">Binlerce ürün arasından size en uygun olanı bulun</p>
          </div>
          
          <!-- Search Bar -->
          <div class="max-w-2xl mx-auto">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Ne arıyorsunuz?"
                class="w-full px-6 py-4 pl-14 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30"
                @keyup.enter="performSearch"
              >
              <div class="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              <button
                @click="performSearch"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all"
              >
                Ara
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters -->
      <section class="py-8 bg-white shadow-sm">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <!-- Category Filter -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ category.icon }} {{ category.name }}
              </button>
            </div>
            
            <!-- Sort & View Options -->
            <div class="flex items-center space-x-4">
              <select
                v-model="sortBy"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">En Yeni</option>
                <option value="price-low">Fiyat: Düşük-Yüksek</option>
                <option value="price-high">Fiyat: Yüksek-Düşük</option>
                <option value="popular">En Popüler</option>
              </select>
              
              <div class="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'p-2 transition-all',
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  ⊞
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'p-2 transition-all',
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Grid -->
      <section class="py-12">
        <div class="max-w-6xl mx-auto px-4">
          <!-- Results Info -->
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold">{{ filteredProducts.length }} ürün bulundu</h2>
            <div class="text-sm text-gray-600">
              Sayfa {{ currentPage }} / {{ Math.ceil(filteredProducts.length / itemsPerPage) }}
            </div>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div class="relative">
                <img
                  :src="product.image"
                  :alt="product.title"
                  class="w-full h-48 object-cover"
                >
                <button
                  @click="toggleFavorite(product.id)"
                  class="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all"
                >
                  <span :class="product.isFavorite ? 'text-red-500' : 'text-gray-400'">❤️</span>
                </button>
                <div class="absolute bottom-3 left-3">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getConditionStyle(product.condition)
                  ]">
                    {{ product.condition }}
                  </span>
                </div>
              </div>
              
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ product.title }}</h3>
                <p class="text-green-600 font-bold text-lg mb-2">{{ formatPrice(product.price) }}</p>
                <p class="text-sm text-gray-500 mb-3">📍 {{ product.location }}</p>
                
                <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>👁️ {{ product.views }}</span>
                  <span>📅 {{ formatDate(product.createdAt) }}</span>
                </div>
                
                <NuxtLink
                  :to="`/product/${product.id}`"
                  class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-center block"
                >
                  İncele
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="space-y-4">
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div class="flex items-center space-x-6">
                <div class="relative">
                  <img
                    :src="product.image"
                    :alt="product.title"
                    class="w-32 h-32 object-cover rounded-lg"
                  >
                  <span :class="[
                    'absolute bottom-2 left-2 px-2 py-1 text-xs font-medium rounded-full',
                    getConditionStyle(product.condition)
                  ]">
                    {{ product.condition }}
                  </span>
                </div>
                
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ product.title }}</h3>
                  <p class="text-gray-600 mb-3">{{ product.description }}</p>
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📍 {{ product.location }}</span>
                    <span>👁️ {{ product.views }} görüntüleme</span>
                    <span>📅 {{ formatDate(product.createdAt) }}</span>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="text-2xl font-bold text-green-600 mb-4">{{ formatPrice(product.price) }}</p>
                  <div class="space-y-2">
                    <NuxtLink
                      :to="`/product/${product.id}`"
                      class="block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-center"
                    >
                      İncele
                    </NuxtLink>
                    <button
                      @click="toggleFavorite(product.id)"
                      :class="[
                        'block w-full py-2 px-6 rounded-lg font-medium transition-all',
                        product.isFavorite
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      {{ product.isFavorite ? '❤️ Favoride' : '🤍 Favoriye Ekle' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-center items-center space-x-2 mt-12">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Önceki
            </button>
            
            <div class="flex space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Sonraki →
            </button>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Ürünleri Keşfet - TagList',
  description: 'TagList\'te binlerce ikinci el ürün arasından aradığınızı bulun. En uygun fiyatlarla güvenli alışveriş.'
})

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('newest')
const viewMode = ref('grid')
const currentPage = ref(1)
const itemsPerPage = 20

const categories = ref([
  { id: 'all', name: 'Tümü', icon: '🔍' },
  { id: 'electronics', name: 'Elektronik', icon: '📱' },
  { id: 'vehicles', name: 'Araç', icon: '🚗' },
  { id: 'fashion', name: 'Moda', icon: '👔' },
  { id: 'home', name: 'Ev', icon: '🏠' },
  { id: 'hobby', name: 'Hobi', icon: '🎮' }
])

// Mock products data
const products = ref([
  {
    id: 1,
    title: 'iPhone 13 Pro Max 256GB Space Gray',
    description: 'Çok temiz kullanılmış, orijinal kutusu ile birlikte',
    price: 35000,
    condition: 'Çok İyi',
    location: 'İstanbul, Kadıköy',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
    views: 1250,
    createdAt: new Date('2024-01-15'),
    isFavorite: false
  },
  {
    id: 2,
    title: 'BMW 320i 2020 Model',
    description: 'Az kilometreli, bakımlı, hasarsız araç',
    price: 750000,
    condition: 'Çok İyi',
    location: 'Ankara, Çankaya',
    category: 'vehicles',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    views: 2340,
    createdAt: new Date('2024-01-14'),
    isFavorite: true
  },
  {
    id: 3,
    title: 'MacBook Pro M2 16" 512GB',
    description: 'Garantili, sıfır ayarında laptop',
    price: 55000,
    condition: 'Sıfır Ayarında',
    location: 'İzmir, Konak',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    views: 890,
    createdAt: new Date('2024-01-13'),
    isFavorite: false
  },
  {
    id: 4,
    title: 'Nike Air Jordan 1 High OG',
    description: 'Orijinal, temiz ayakkabı',
    price: 8500,
    condition: 'İyi',
    location: 'Bursa, Nilüfer',
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
    views: 456,
    createdAt: new Date('2024-01-12'),
    isFavorite: false
  },
  {
    id: 5,
    title: 'PlayStation 5 Console',
    description: 'Sıfır kutusunda, 2 kol ile birlikte',
    price: 18000,
    condition: 'Sıfır',
    location: 'İstanbul, Beşiktaş',
    category: 'hobby',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    views: 1890,
    createdAt: new Date('2024-01-11'),
    isFavorite: true
  },
  {
    id: 6,
    title: 'Koltuk Takımı 3+2+1',
    description: 'Temiz, bakımlı koltuk takımı',
    price: 12000,
    condition: 'İyi',
    location: 'Antalya, Muratpaşa',
    category: 'home',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    views: 567,
    createdAt: new Date('2024-01-10'),
    isFavorite: false
  }
])

// Computed properties
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }

  // Sort products
  switch (sortBy.value) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'popular':
      filtered.sort((a, b) => b.views - a.views)
      break
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const getConditionStyle = (condition) => {
  const styles = {
    'Sıfır': 'bg-green-100 text-green-800',
    'Sıfır Ayarında': 'bg-green-100 text-green-800',
    'Çok İyi': 'bg-blue-100 text-blue-800',
    'İyi': 'bg-yellow-100 text-yellow-800',
    'Orta': 'bg-orange-100 text-orange-800'
  }
  return styles[condition] || 'bg-gray-100 text-gray-800'
}

const toggleFavorite = (productId) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    product.isFavorite = !product.isFavorite
  }
}

const performSearch = () => {
  currentPage.value = 1
}

// Watch for filter changes to reset pagination
watch([selectedCategory, sortBy], () => {
  currentPage.value = 1
})
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
