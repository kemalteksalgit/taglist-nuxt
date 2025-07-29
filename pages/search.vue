<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Search Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Arama</h1>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <input
                v-model="searchQuery"
                @keypress.enter="performSearch"
                type="search"
                placeholder="Ne arıyorsunuz?"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              @click="performSearch"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ara
            </button>
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="hasSearched" class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-lg font-medium text-gray-900">
                {{ filteredResults.length }} ürün bulundu
              </p>
            </div>
            
            <div class="flex items-center gap-4">
              <select v-model="sortBy" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="relevance">En İlgili</option>
                <option value="newest">En Yeni</option>
                <option value="price-low">Fiyat (Düşük → Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek → Düşük)</option>
                <option value="distance">Mesafe</option>
              </select>
              
              <div class="flex items-center gap-2">
                <button
                  @click="viewMode = 'grid'"
                  :class="['p-2 rounded', viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600']"
                >
                  <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="['p-2 rounded', viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600']"
                >
                  <Icon name="heroicons:list-bullet" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Filters Sidebar -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold text-gray-800">Filtreler</h3>
                  <button @click="clearFilters" class="text-sm text-blue-600 hover:text-blue-800">
                    Temizle
                  </button>
                </div>
                
                <!-- Category Filter -->
                <div class="mb-6">
                  <h4 class="font-medium text-gray-700 mb-3">Kategori</h4>
                  <div class="space-y-2">
                    <label v-for="category in availableCategories" :key="category.slug" class="flex items-center">
                      <input
                        type="checkbox"
                        :value="category.slug"
                        v-model="filters.categories"
                        class="mr-2"
                      >
                      <span class="text-sm text-gray-600">{{ category.name }} ({{ category.count }})</span>
                    </label>
                  </div>
                </div>

                <!-- Price Range -->
                <div class="mb-6">
                  <h4 class="font-medium text-gray-700 mb-3">Fiyat Aralığı</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      v-model="filters.minPrice"
                      class="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                    <input
                      type="number"
                      placeholder="Max"
                      v-model="filters.maxPrice"
                      class="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Results Grid -->
            <div class="lg:col-span-3">
              <!-- Results -->
              <div v-if="sortedResults.length > 0" :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'">
                <ProductCard
                  v-for="product in paginatedResults"
                  :key="product.id"
                  :product="product"
                  :view-mode="viewMode"
                />
              </div>

              <!-- No Results -->
              <div v-else class="text-center py-12">
                <Icon name="heroicons:magnifying-glass-minus" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Sonuç bulunamadı</h3>
                <p class="text-gray-600 mb-6">
                  "{{ currentSearchQuery }}" için herhangi bir ürün bulunamadı.
                </p>
                <button @click="clearFilters" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Filtreleri Temizle
                </button>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="mt-8 flex justify-center">
                <nav class="flex items-center space-x-2">
                  <button
                    @click="currentPage--"
                    :disabled="currentPage === 1"
                    class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="heroicons:chevron-left" class="w-5 h-5" />
                  </button>
                  
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    :class="['px-3 py-2 rounded-lg border',
                             page === currentPage ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50']"
                  >
                    {{ page }}
                  </button>
                  
                  <button
                    @click="currentPage++"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="heroicons:chevron-right" class="w-5 h-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <!-- No Search Yet -->
        <div v-else class="text-center py-16">
          <Icon name="heroicons:magnifying-glass" class="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Ne arıyorsunuz?</h2>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            Milyonlarca ürün arasından istediğinizi bulun. Marka, model veya kategori ile arama yapabilirsiniz.
          </p>
          
          <!-- Popular Categories -->
          <div class="max-w-4xl mx-auto">
            <h3 class="text-lg font-semibold text-gray-800 mb-6">Popüler Kategoriler</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <NuxtLink
                v-for="category in popularCategories"
                :key="category.slug"
                :to="`/category/${category.slug}`"
                class="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div class="text-3xl mb-2">{{ category.icon }}</div>
                <h4 class="font-medium text-gray-800 text-sm">{{ category.name }}</h4>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Get search query from URL
const initialSearchQuery = route.query.q as string || ''

// Reactive data
const searchQuery = ref(initialSearchQuery)
const currentSearchQuery = ref(initialSearchQuery)
const hasSearched = ref(!!initialSearchQuery)
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('relevance')
const currentPage = ref(1)
const itemsPerPage = 12

const filters = reactive({
  categories: [] as string[],
  minPrice: null as number | null,
  maxPrice: null as number | null,
  conditions: [] as string[],
  city: '',
  nearMe: false
})

// Static data
const popularCategories = [
  { name: 'Elektronik', slug: 'elektronik', icon: '📱' },
  { name: 'Vasıta', slug: 'vasita', icon: '🚗' },
  { name: 'Giyim', slug: 'giyim', icon: '👔' },
  { name: 'Ev & Bahçe', slug: 'ev-bahce', icon: '🏠' },
  { name: 'Hobi', slug: 'hobi', icon: '🎮' },
  { name: 'Spor', slug: 'spor', icon: '⚽' }
]

// Sample search results
const searchResults = ref([
  {
    id: 1,
    title: 'iPhone 14 Pro Max 256GB',
    price: 35000,
    originalPrice: 42000,
    condition: 'Çok İyi',
    location: 'İstanbul, Kadıköy',
    image: '/api/placeholder/400/300',
    category: 'elektronik',
    subcategory: 'Telefon',
    createdAt: '2024-01-15',
    views: 245,
    isFavorite: false,
    seller: { name: 'Ahmet Y.', rating: 4.8, avatar: '/api/placeholder/50/50' }
  }
])

// Computed
const availableCategories = computed(() => {
  const categoryCount: Record<string, number> = {}
  searchResults.value.forEach(product => {
    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1
  })
  
  return popularCategories.map(cat => ({
    ...cat,
    count: categoryCount[cat.slug] || 0
  })).filter(cat => cat.count > 0)
})

const filteredResults = computed(() => {
  return searchResults.value.filter(product => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false
    
    // Price filter
    if (filters.minPrice && product.price < filters.minPrice) return false
    if (filters.maxPrice && product.price > filters.maxPrice) return false
    
    return true
  })
})

const sortedResults = computed(() => {
  const results = [...filteredResults.value]
  
  switch (sortBy.value) {
    case 'newest':
      return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'price-low':
      return results.sort((a, b) => a.price - b.price)
    case 'price-high':
      return results.sort((a, b) => b.price - a.price)
    default: // relevance
      return results
  }
})

const totalPages = computed(() => Math.ceil(sortedResults.value.length / itemsPerPage))
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedResults.value.slice(start, start + itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const performSearch = () => {
  if (!searchQuery.value.trim()) return
  
  currentSearchQuery.value = searchQuery.value
  hasSearched.value = true
  currentPage.value = 1
  
  // Update URL
  router.push({ query: { q: searchQuery.value } })
}

const clearFilters = () => {
  filters.categories = []
  filters.minPrice = null
  filters.maxPrice = null
  filters.conditions = []
  filters.city = ''
  filters.nearMe = false
  currentPage.value = 1
}

// SEO
useSeoMeta({
  title: initialSearchQuery ? `"${initialSearchQuery}" Arama Sonuçları - TagList` : 'Arama - TagList',
  description: initialSearchQuery ? `"${initialSearchQuery}" için arama sonuçları. En iyi fiyatlarla ikinci el ürünler.` : 'TagList\'te milyonlarca ürün arasından aradığınızı bulun.'
})

// Perform initial search if query exists
if (initialSearchQuery) {
  performSearch()
}

// Watch for filter changes
watch([filters, sortBy], () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
/* Search page styles */
.search-page {
  position: relative;
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .search-page {
    padding-top: 0;
  }
}
</style>