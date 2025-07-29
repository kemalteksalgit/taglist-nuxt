<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900">❤️ Favorilerim</h1>
        <p class="text-gray-600 mt-2">Beğendiğiniz ürünleri buradan takip edin</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            v-for="filter in filters"
            :key="filter.id"
            @click="activeFilter = filter.id"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeFilter === filter.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ filter.name }}
            <span v-if="filter.count" class="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {{ filter.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">❤️</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Toplam Favori</p>
              <p class="text-2xl font-bold text-gray-900">{{ favorites.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">💰</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Ortalama Fiyat</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatPrice(averagePrice) }} TL</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">📊</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Bu Hafta Eklenen</p>
              <p class="text-2xl font-bold text-gray-900">{{ recentlyAdded }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Favorites Grid -->
      <div v-if="filteredFavorites.length > 0" class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ getFilterTitle() }}
          </h2>
          <div class="flex items-center space-x-3">
            <!-- Sort Options -->
            <select v-model="sortBy" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="date">En Son Eklenen</option>
              <option value="price-low">Fiyat: Düşük → Yüksek</option>
              <option value="price-high">Fiyat: Yüksek → Düşük</option>
              <option value="name">İsim (A-Z)</option>
            </select>
            
            <!-- View Toggle -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-2 rounded text-sm',
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                ]"
              >
                <span class="text-lg">⚏</span>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-2 rounded text-sm',
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                ]"
              >
                <span class="text-lg">☰</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="favorite in sortedFavorites"
            :key="favorite.id"
            class="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div class="relative">
              <img :src="favorite.image" :alt="favorite.title" class="w-full h-48 object-cover">
              
              <!-- Favorite Badge -->
              <div class="absolute top-3 right-3">
                <button
                  @click="toggleFavorite(favorite.id)"
                  class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                >
                  <span class="text-red-500">❤️</span>
                </button>
              </div>

              <!-- Status Badge -->
              <div class="absolute bottom-3 left-3">
                <span :class="getStatusColor(favorite.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ favorite.status }}
                </span>
              </div>
            </div>

            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ favorite.title }}</h3>
              <p class="text-2xl font-bold text-green-600 mb-2">{{ formatPrice(favorite.price) }} TL</p>
              
              <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>📍 {{ favorite.location }}</span>
                <span>⏰ {{ formatDate(favorite.addedDate) }}</span>
              </div>

              <div class="flex space-x-2">
                <NuxtLink
                  :to="`/product/${favorite.id}`"
                  class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  İlanı Gör
                </NuxtLink>
                <button
                  @click="contactSeller(favorite)"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  💬
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="space-y-4">
          <div
            v-for="favorite in sortedFavorites"
            :key="favorite.id"
            class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <img :src="favorite.image" :alt="favorite.title" class="w-20 h-20 object-cover rounded-lg">
            
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 mb-1">{{ favorite.title }}</h3>
              <p class="text-lg font-bold text-green-600 mb-1">{{ formatPrice(favorite.price) }} TL</p>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>📍 {{ favorite.location }}</span>
                <span>⏰ {{ formatDate(favorite.addedDate) }}</span>
                <span :class="getStatusColor(favorite.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ favorite.status }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <button
                @click="toggleFavorite(favorite.id)"
                class="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <span class="text-red-500">❤️</span>
              </button>
              <button
                @click="contactSeller(favorite)"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                💬 Mesaj
              </button>
              <NuxtLink
                :to="`/product/${favorite.id}`"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                İlanı Gör
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
        <span class="text-6xl mb-4 block">💔</span>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Henüz favori ürününüz yok</h3>
        <p class="text-gray-600 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek buradan takip edebilirsiniz.</p>
        <NuxtLink
          to="/"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
        >
          Ürünleri Keşfet
        </NuxtLink>
      </div>

      <!-- Price Alert Section -->
      <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">💡 Fiyat Alarmı</h3>
        <p class="text-gray-600 mb-4">Favori ürünlerinizin fiyatı düştüğünde bildirim alın.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in priceAlerts"
            :key="item.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <img :src="item.image" :alt="item.title" class="w-12 h-12 object-cover rounded">
              <div>
                <h4 class="font-medium text-gray-900 text-sm">{{ item.title }}</h4>
                <p class="text-sm text-gray-600">Hedef: {{ formatPrice(item.targetPrice) }} TL</p>
              </div>
            </div>
            <button class="text-red-500 hover:text-red-700">
              <span class="text-lg">🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed } from 'vue'

useHead({
  title: 'Favorilerim - TagList',
  meta: [
    { name: 'description', content: 'TagList favori ürünlerinizi takip edin ve fiyat alarmları kurun.' }
  ]
})

// Data
const activeFilter = ref('all')
const viewMode = ref('grid')
const sortBy = ref('date')

const filters = ref([
  { id: 'all', name: 'Tümü', count: 12 },
  { id: 'available', name: 'Satılık', count: 8 },
  { id: 'sold', name: 'Satılmış', count: 3 },
  { id: 'price-alert', name: 'Fiyat Alarmı', count: 5 }
])

// User favorites data
const favorites = ref([
  {
    id: 1,
    title: 'iPhone 14 Pro Max 256GB Deep Purple',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    location: 'Kadıköy, İstanbul',
    addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'Satılık',
    category: 'Elektronik'
  },
  {
    id: 2,
    title: 'MacBook Pro M2 13inch Space Gray',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    location: 'Beşiktaş, İstanbul',
    addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'Satılık',
    category: 'Elektronik'
  },
  {
    id: 3,
    title: 'BMW 320i 2019 Model',
    price: 750000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    location: 'Sarıyer, İstanbul',
    addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'Satılmış',
    category: 'Vasıta'
  },
  {
    id: 4,
    title: 'Rolex Submariner Date',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    location: 'Nişantaşı, İstanbul',
    addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'Satılık',
    category: 'Aksesuar'
  },
  {
    id: 5,
    title: 'PlayStation 5 Digital Edition',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    location: 'Üsküdar, İstanbul',
    addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'Satılık',
    category: 'Oyun & Hobi'
  },
  {
    id: 6,
    title: 'Canon EOS R5 Full Frame',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
    location: 'Şişli, İstanbul',
    addedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'Satılık',
    category: 'Fotoğraf & Kamera'
  }
])

const priceAlerts = ref([
  {
    id: 1,
    title: 'iPhone 14 Pro Max',
    currentPrice: 42000,
    targetPrice: 38000,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100'
  },
  {
    id: 2,
    title: 'MacBook Pro M2',
    currentPrice: 35000,
    targetPrice: 32000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100'
  }
])

// Computed
const filteredFavorites = computed(() => {
  switch (activeFilter.value) {
    case 'available':
      return favorites.value.filter(item => item.status === 'Satılık')
    case 'sold':
      return favorites.value.filter(item => item.status === 'Satılmış')
    case 'price-alert':
      return favorites.value.filter(item => 
        priceAlerts.value.some(alert => alert.id === item.id)
      )
    default:
      return favorites.value
  }
})

const sortedFavorites = computed(() => {
  const sorted = [...filteredFavorites.value]
  
  switch (sortBy.value) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'tr'))
    case 'date':
    default:
      return sorted.sort((a, b) => b.addedDate - a.addedDate)
  }
})

const averagePrice = computed(() => {
  if (favorites.value.length === 0) return 0
  const total = favorites.value.reduce((sum, item) => sum + item.price, 0)
  return Math.round(total / favorites.value.length)
})

const recentlyAdded = computed(() => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return favorites.value.filter(item => item.addedDate > oneWeekAgo).length
})

// Methods
const getFilterTitle = () => {
  const filter = filters.value.find(f => f.id === activeFilter.value)
  return filter ? filter.name : 'Tüm Favoriler'
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Satılık':
      return 'bg-green-100 text-green-800'
    case 'Satılmış':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price)
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Bugün'
  if (days === 1) return 'Dün'
  if (days < 7) return `${days} gün önce`
  
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}

const toggleFavorite = (id) => {
  const index = favorites.value.findIndex(item => item.id === id)
  if (index !== -1) {
    favorites.value.splice(index, 1)
    // Update filter counts
    filters.value.forEach(filter => {
      if (filter.count > 0) filter.count--
    })
  }
}

const contactSeller = (item) => {
  // Navigate to messages with this product
  navigateTo(`/messages?product=${item.id}`)
}
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
