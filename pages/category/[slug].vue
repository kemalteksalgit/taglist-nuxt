<template>
  <NuxtLayout>
    <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li><NuxtLink to="/" class="hover:text-blue-600">Ana Sayfa</NuxtLink></li>
          <li><Icon name="mdi:chevron-right" class="w-4 h-4" /></li>
          <li><NuxtLink to="/categories" class="hover:text-blue-600">Kategoriler</NuxtLink></li>
          <li><Icon name="mdi:chevron-right" class="w-4 h-4" /></li>
          <li class="text-gray-800 font-medium">{{ categoryData.name }}</li>
        </ol>
      </nav>

      <!-- Category Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center mb-4">
          <div class="text-5xl mr-4">{{ categoryData.icon }}</div>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">{{ categoryData.name }}</h1>
            <p class="text-gray-600 mt-2">{{ categoryData.description }}</p>
            <div class="flex items-center mt-2 text-sm text-gray-500">
              <Icon name="mdi:tag" class="w-4 h-4 mr-1" />
              <span>{{ filteredProducts.length }} ürün bulundu</span>
            </div>
          </div>
        </div>

        <!-- Subcategories -->
        <div class="flex flex-wrap gap-2 mt-6">
          <button
            @click="selectedSubcategory = null"
            :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', 
                     selectedSubcategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          >
            Tümü
          </button>
          <button
            v-for="sub in categoryData.subcategories"
            :key="sub"
            @click="selectedSubcategory = sub"
            :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                     selectedSubcategory === sub ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          >
            {{ sub }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Filters Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h3 class="font-semibold text-gray-800 mb-4">Filtreler</h3>
            
            <!-- Price Range -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-700 mb-3">Fiyat Aralığı</h4>
              <div class="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  v-model="filters.minPrice"
                  class="input-field text-sm"
                >
                <input
                  type="number"
                  placeholder="Max"
                  v-model="filters.maxPrice"
                  class="input-field text-sm"
                >
              </div>
            </div>

            <!-- Condition -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-700 mb-3">Durum</h4>
              <div class="space-y-2">
                <label v-for="condition in conditions" :key="condition" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="condition"
                    v-model="filters.conditions"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-600">{{ condition }}</span>
                </label>
              </div>
            </div>

            <!-- Location -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-700 mb-3">Şehir</h4>
              <select v-model="filters.city" class="input-field text-sm w-full">
                <option value="">Tüm Şehirler</option>
                <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>

            <!-- Clear Filters -->
            <button @click="clearFilters" class="w-full btn-secondary text-sm">
              Filtreleri Temizle
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="lg:col-span-3">
          <!-- Sort and View Options -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">Sıralama:</span>
                <select v-model="sortBy" class="input-field text-sm">
                  <option value="newest">En Yeni</option>
                  <option value="price-low">Fiyat (Düşük → Yüksek)</option>
                  <option value="price-high">Fiyat (Yüksek → Düşük)</option>
                  <option value="popular">Popüler</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="viewMode = 'grid'"
                  :class="['p-2 rounded', viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600']"
                >
                  <Icon name="mdi:view-grid" class="w-5 h-5" />
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="['p-2 rounded', viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600']"
                >
                  <Icon name="mdi:view-list" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Products -->
          <div v-if="sortedProducts.length > 0" :class="viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'">
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
              :view-mode="viewMode"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <Icon name="mdi:package-variant-remove" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Ürün bulunamadı</h3>
            <p class="text-gray-600 mb-4">Arama kriterlerinizi değiştirip tekrar deneyin.</p>
            <button @click="clearFilters" class="btn-primary">
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
                <Icon name="mdi:chevron-left" class="w-5 h-5" />
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
                <Icon name="mdi:chevron-right" class="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// SEO
useSeoMeta({
  title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Kategorisi - TagList`,
  description: `${slug} kategorisindeki en iyi ikinci el ürünleri keşfedin. Güvenilir satıcılar, uygun fiyatlar.`,
})

// Reactive data
const selectedSubcategory = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 12

const filters = reactive({
  minPrice: null as number | null,
  maxPrice: null as number | null,
  conditions: [] as string[],
  city: ''
})

// Static data
const conditions = ['Sıfır', 'Sıfıra Yakın', 'Çok İyi', 'İyi', 'Orta', 'Kötü']
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep']

// Category data
const categoryData = computed(() => {
  const categories = {
    elektronik: {
      name: 'Elektronik',
      icon: '📱',
      description: 'Telefon, bilgisayar, tablet ve elektronik aksesuarlar',
      subcategories: ['Telefon', 'Bilgisayar', 'Tablet', 'Kulaklık', 'Kamera', 'Oyun Konsolu', 'TV', 'Ses Sistemi']
    },
    vasita: {
      name: 'Vasıta',
      icon: '🚗',
      description: 'Otomobil, motosiklet ve diğer taşıtlar',
      subcategories: ['Otomobil', 'Motosiklet', 'Ticari Araç', 'Tarım Makinesi', 'Deniz Araçları']
    },
    giyim: {
      name: 'Giyim & Aksesuar',
      icon: '👔',
      description: 'Kadın, erkek ve çocuk giyim',
      subcategories: ['Kadın Giyim', 'Erkek Giyim', 'Çocuk Giyim', 'Ayakkabı', 'Çanta', 'Saat', 'Takı']
    }
  }
  
  return categories[slug as keyof typeof categories] || categories.elektronik
})

// Sample products data
const allProducts = ref([
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
    seller: {
      name: 'Ahmet Y.',
      rating: 4.8,
      avatar: '/api/placeholder/50/50'
    }
  },
  {
    id: 2,
    title: 'MacBook Pro M2 14" 512GB',
    price: 28000,
    originalPrice: 35000,
    condition: 'Sıfıra Yakın',
    location: 'Ankara, Çankaya',
    image: '/api/placeholder/400/300',
    category: 'elektronik',
    subcategory: 'Bilgisayar',
    createdAt: '2024-01-14',
    views: 189,
    isFavorite: false,
    seller: {
      name: 'Mehmet K.',
      rating: 4.9,
      avatar: '/api/placeholder/50/50'
    }
  },
  {
    id: 3,
    title: 'iPad Air 5. Nesil 256GB',
    price: 12000,
    originalPrice: 15000,
    condition: 'İyi',
    location: 'İzmir, Bornova',
    image: '/api/placeholder/400/300',
    category: 'elektronik',
    subcategory: 'Tablet',
    createdAt: '2024-01-13',
    views: 167,
    isFavorite: true,
    seller: {
      name: 'Ayşe M.',
      rating: 4.7,
      avatar: '/api/placeholder/50/50'
    }
  },
  {
    id: 4,
    title: 'Sony WH-1000XM4 Kulaklık',
    price: 1800,
    originalPrice: 2500,
    condition: 'Çok İyi',
    location: 'Bursa, Nilüfer',
    image: '/api/placeholder/400/300',
    category: 'elektronik',
    subcategory: 'Kulaklık',
    createdAt: '2024-01-12',
    views: 98,
    isFavorite: false,
    seller: {
      name: 'Can T.',
      rating: 4.6,
      avatar: '/api/placeholder/50/50'
    }
  },
  {
    id: 5,
    title: 'Canon EOS R6 Body',
    price: 15000,
    originalPrice: 20000,
    condition: 'İyi',
    location: 'Antalya, Muratpaşa',
    image: '/api/placeholder/400/300',
    category: 'elektronik',
    subcategory: 'Kamera',
    createdAt: '2024-01-11',
    views: 234,
    isFavorite: false,
    seller: {
      name: 'Fatma A.',
      rating: 4.8,
      avatar: '/api/placeholder/50/50'
    }
  },
  {
    id: 6,
    title: 'PlayStation 5 + 2 Kol',
    price: 8500,
    originalPrice: 10000,
    condition: 'Çok İyi',
    location: 'İstanbul, Beşiktaş',
    image: '/api/placeholder/400/300',
    category: 'elektronik',
    subcategory: 'Oyun Konsolu',
    createdAt: '2024-01-10',
    views: 312,
    isFavorite: true,
    seller: {
      name: 'Emre S.',
      rating: 4.9,
      avatar: '/api/placeholder/50/50'
    }
  }
])

// Computed properties
const filteredProducts = computed(() => {
  return allProducts.value.filter(product => {
    // Category filter
    if (product.category !== slug) return false
    
    // Subcategory filter
    if (selectedSubcategory.value && product.subcategory !== selectedSubcategory.value) return false
    
    // Price filter
    if (filters.minPrice && product.price < filters.minPrice) return false
    if (filters.maxPrice && product.price > filters.maxPrice) return false
    
    // Condition filter
    if (filters.conditions.length > 0 && !filters.conditions.includes(product.condition)) return false
    
    // City filter
    if (filters.city && !product.location.includes(filters.city)) return false
    
    return true
  })
})

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value]
  
  switch (sortBy.value) {
    case 'price-low':
      return products.sort((a, b) => a.price - b.price)
    case 'price-high':
      return products.sort((a, b) => b.price - a.price)
    case 'popular':
      return products.sort((a, b) => b.views - a.views)
    case 'newest':
    default:
      return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
})

const totalPages = computed(() => Math.ceil(sortedProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedProducts.value.slice(start, start + itemsPerPage)
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
const clearFilters = () => {
  filters.minPrice = null
  filters.maxPrice = null
  filters.conditions = []
  filters.city = ''
  selectedSubcategory.value = null
  currentPage.value = 1
}

// Watch for filter changes
watch([filters, selectedSubcategory], () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors;
}
</style>
