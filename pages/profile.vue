<script setup>
// SEO
useHead({
  title: 'Profilim - TagList',
  meta: [
    { name: 'description', content: 'TagList kullanıcı profili, ilanlar ve hesap yönetimi.' }
  ]
})

// State
const activeTab = ref('overview')
const isEditing = ref(false)

// Mock user data
const user = ref({
  id: 1,
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  avatar: 'https://i.pravatar.cc/200?img=1',
  location: 'İstanbul, Kadıköy',
  phone: '+90 555 123 45 67',
  memberSince: '2019',
  rating: 4.8,
  reviews: 156,
  totalProducts: 24,
  activeProducts: 8,
  soldProducts: 16,
  totalEarnings: '45,250',
  verified: true,
  isOnline: true
})

const stats = ref([
  { label: 'Toplam İlan', value: user.value.totalProducts, icon: '📦', color: 'blue' },
  { label: 'Aktif İlan', value: user.value.activeProducts, icon: '🔥', color: 'green' },
  { label: 'Satılan', value: user.value.soldProducts, icon: '✅', color: 'purple' },
  { label: 'Toplam Kazanç', value: user.value.totalEarnings + ' ₺', icon: '💰', color: 'yellow' },
])

const tabs = ref([
  { id: 'overview', name: 'Genel Bakış', icon: '📊' },
  { id: 'active', name: 'Aktif İlanlar', icon: '🔥', count: 8 },
  { id: 'sold', name: 'Satılanlar', icon: '✅', count: 16 },
  { id: 'reviews', name: 'Değerlendirmeler', icon: '⭐', count: 156 },
  { id: 'settings', name: 'Ayarlar', icon: '⚙️' }
])

const recentProducts = ref([
  {
    id: 1,
    title: 'iPhone 13 Pro Max 256GB',
    price: '35,000',
    image: 'https://picsum.photos/300/200?random=1',
    status: 'active',
    views: 245,
    favorites: 18
  },
  {
    id: 2,
    title: 'MacBook Pro M2 16"',
    price: '55,000',
    image: 'https://picsum.photos/300/200?random=2',
    status: 'sold',
    views: 189,
    favorites: 12
  },
  {
    id: 3,
    title: 'BMW 320i 2020 Model',
    price: '750,000',
    image: 'https://picsum.photos/300/200?random=3',
    status: 'active',
    views: 567,
    favorites: 45
  }
])

// Methods
const editProfile = () => {
  isEditing.value = !isEditing.value
}

const saveProfile = () => {
  isEditing.value = false
  // Save logic here
  alert('Profil bilgileri güncellendi!')
}

const goToSettings = () => {
  navigateTo('/settings')
}

const viewAllProducts = () => {
  navigateTo('/my-listings')
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      <!-- Modern Profile Header -->
      <div class="relative">
        <!-- Background Pattern -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div class="absolute inset-0 opacity-20">
          <div class="w-full h-full" style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;"></div>
        </div>
        
        <div class="relative pt-20 pb-16">
          <div class="max-w-6xl mx-auto px-6">
            
            <!-- Profile Card -->
            <div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div class="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
                
                <!-- Avatar Section -->
                <div class="relative">
                  <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                    <img
                      :src="user.avatar"
                      :alt="user.name"
                      class="w-full h-full rounded-full object-cover bg-white"
                    >
                  </div>
                  
                  <!-- Online Status -->
                  <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  
                  <!-- Camera Button -->
                  <button 
                    @click="editProfile"
                    class="absolute bottom-2 right-8 w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center hover:scale-110"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </button>
                </div>

                <!-- Profile Info -->
                <div class="flex-1 text-center lg:text-left">
                  <div class="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                    <h1 class="text-3xl font-bold text-gray-900">{{ user.name }}</h1>
                    <div v-if="user.verified" class="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center" title="Doğrulanmış Hesap">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <p class="text-gray-600 mb-4 flex items-center justify-center lg:justify-start">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {{ user.location }}
                  </p>
                  
                  <!-- Rating & Stats -->
                  <div class="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
                    <div class="flex items-center space-x-2">
                      <div class="flex space-x-1">
                        <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.floor(user.rating) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                      <span class="text-sm font-medium text-gray-900">{{ user.rating }}</span>
                      <span class="text-sm text-gray-500">({{ user.reviews }} değerlendirme)</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ user.memberSince }} yılından beri üye
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-wrap justify-center lg:justify-start gap-3">
                    <button 
                      @click="editProfile"
                      class="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 hover:scale-105"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      <span>Profili Düzenle</span>
                    </button>
                    
                    <button 
                      @click="goToSettings"
                      class="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>Ayarlar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="stat in stats" 
            :key="stat.label"
            class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' : 'bg-yellow-100'
              ]">
                {{ stat.icon }}
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
                <p class="text-sm text-gray-600">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-6xl mx-auto px-6 py-12">
        
        <!-- Modern Tab Navigation -->
        <div class="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 mb-8">
          <div class="flex overflow-x-auto">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <span class="text-lg">{{ tab.icon }}</span>
              <span>{{ tab.name }}</span>
              <span v-if="tab.count" class="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">{{ tab.count }}</span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
          
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-8">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-gray-900">Son İlanlarım</h2>
              <button 
                @click="viewAllProducts"
                class="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>Tümünü Gör</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="product in recentProducts"
                :key="product.id"
                class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-100"
              >
                <div class="relative">
                  <img
                    :src="product.image"
                    :alt="product.title"
                    class="w-full h-48 object-cover"
                  >
                  <div class="absolute top-3 right-3">
                    <span :class="[
                      'px-3 py-1 text-xs font-medium rounded-full backdrop-blur-md',
                      product.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                    ]">
                      {{ product.status === 'active' ? 'Aktif' : 'Satıldı' }}
                    </span>
                  </div>
                </div>
                
                <div class="p-6">
                  <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ product.title }}</h3>
                  <p class="text-2xl font-bold text-blue-600 mb-3">{{ product.price }} ₺</p>
                  
                  <div class="flex items-center justify-between text-sm text-gray-500">
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <span>{{ product.views }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      <span>{{ product.favorites }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Other tabs content -->
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">{{ tabs.find(t => t.id === activeTab)?.icon }}</span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ tabs.find(t => t.id === activeTab)?.name }}</h3>
            <p class="text-gray-500">Bu bölüm yakında aktif olacak.</p>
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
