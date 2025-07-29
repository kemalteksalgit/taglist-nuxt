<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64" alt="Profile" class="w-16 h-16 rounded-full">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Hoş geldin, {{ user.name }}!</h1>
              <p class="text-gray-600">Son giriş: {{ formatDate(user.lastLogin) }}</p>
            </div>
          </div>
          <div class="flex space-x-4">
            <NuxtLink to="/sell" class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
              + Yeni İlan
            </NuxtLink>
            <NuxtLink to="/profile" class="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Profili Düzenle
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">📝</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Aktif İlanlarım</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.activeListings }}</p>
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
              <p class="text-sm text-gray-600">Bu Ay Satış</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatPrice(stats.monthlySales) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">👀</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Toplam Görüntüleme</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalViews }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">⭐</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Değerlendirme</p>
              <p class="text-2xl font-bold text-gray-900">{{ user.rating }}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Recent Activity -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900">Son Aktiviteler</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center"
                         :class="getActivityColor(activity.type)">
                      <span class="text-sm">{{ getActivityIcon(activity.type) }}</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{{ activity.message }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(activity.date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Listings -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">Aktif İlanlarım</h2>
              <NuxtLink to="/my-listings" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Tümünü Gör →
              </NuxtLink>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="listing in activeListings"
                  :key="listing.id"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex space-x-4">
                    <img :src="listing.image" :alt="listing.title" class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ listing.title }}</h3>
                      <p class="text-lg font-bold text-green-600">{{ formatPrice(listing.price) }} TL</p>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-xs text-gray-500">{{ listing.views }} görüntüleme</span>
                        <span class="text-xs px-2 py-1 rounded-full"
                              :class="getStatusColor(listing.status)">
                          {{ listing.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div class="space-y-3">
              <NuxtLink to="/sell" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span class="text-xl">➕</span>
                <span class="font-medium">Yeni İlan Ver</span>
              </NuxtLink>
              <NuxtLink to="/messages" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span class="text-xl">💬</span>
                <div class="flex-1 flex items-center justify-between">
                  <span class="font-medium">Mesajlar</span>
                  <span v-if="unreadMessages > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {{ unreadMessages }}
                  </span>
                </div>
              </NuxtLink>
              <NuxtLink to="/favorites" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span class="text-xl">❤️</span>
                <span class="font-medium">Favorilerim</span>
              </NuxtLink>
              <NuxtLink to="/wallet" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span class="text-xl">💳</span>
                <span class="font-medium">Cüzdanım</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Performance Chart -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Bu Ay Performans</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">İlan Görüntüleme</span>
                  <span class="font-medium">85%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" style="width: 85%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Mesaj Yanıt Oranı</span>
                  <span class="font-medium">92%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 92%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Satış Başarı Oranı</span>
                  <span class="font-medium">78%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-500 h-2 rounded-full" style="width: 78%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Favorites -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Son Beğendiklerim</h3>
            <div class="space-y-3">
              <div
                v-for="favorite in recentFavorites"
                :key="favorite.id"
                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <img :src="favorite.image" :alt="favorite.title" class="w-12 h-12 object-cover rounded">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ favorite.title }}</p>
                  <p class="text-sm font-bold text-green-600">{{ formatPrice(favorite.price) }} TL</p>
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

<script setup>
import { ref } from 'vue'

useHead({
  title: 'Dashboard - TagList',
  meta: [
    { name: 'description', content: 'TagList kullanıcı dashboard. İlanlarınızı yönetin ve performansınızı takip edin.' }
  ]
})

// Mock user data
const user = ref({
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  rating: 4.8,
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
})

const stats = ref({
  activeListings: 12,
  monthlySales: 15750,
  totalViews: 2840,
  totalSales: 47
})

const unreadMessages = ref(3)

const recentActivities = ref([
  {
    id: 1,
    type: 'sale',
    message: 'iPhone 13 Pro ilanınız satıldı',
    date: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 2,
    type: 'message',
    message: 'MacBook Pro ilanınız için yeni bir mesaj aldınız',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 3,
    type: 'view',
    message: 'PlayStation 5 ilanınız 50. görüntülemeye ulaştı',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 4,
    type: 'listing',
    message: 'Yeni ilanınız onaylandı ve yayınlandı',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
])

const activeListings = ref([
  {
    id: 1,
    title: 'iPhone 14 Pro 256GB',
    price: 28500,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
    views: 127,
    status: 'Aktif'
  },
  {
    id: 2,
    title: 'MacBook Pro M2',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100',
    views: 89,
    status: 'Aktif'
  },
  {
    id: 3,
    title: 'PlayStation 5',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=100',
    views: 203,
    status: 'Beklemede'
  },
  {
    id: 4,
    title: 'Canon EOS R5',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=100',
    views: 67,
    status: 'Aktif'
  }
])

const recentFavorites = ref([
  {
    id: 1,
    title: 'Vintage Gibson Guitar',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100'
  },
  {
    id: 2,
    title: 'BMW M3 2020',
    price: 850000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100'
  },
  {
    id: 3,
    title: 'Rolex Submariner',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
  }
])

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getActivityColor = (type) => {
  switch (type) {
    case 'sale': return 'bg-green-100 text-green-600'
    case 'message': return 'bg-blue-100 text-blue-600'
    case 'view': return 'bg-purple-100 text-purple-600'
    case 'listing': return 'bg-yellow-100 text-yellow-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'sale': return '💰'
    case 'message': return '💬'
    case 'view': return '👀'
    case 'listing': return '📝'
    default: return '📋'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Aktif': return 'bg-green-100 text-green-800'
    case 'Beklemede': return 'bg-yellow-100 text-yellow-800'
    case 'Satıldı': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
