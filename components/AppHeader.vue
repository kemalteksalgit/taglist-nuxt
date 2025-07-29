<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TagList
          </div>
        </NuxtLink>

        <!-- Sales Mode Navigation -->
                <!-- Mode Selection Links -->
        <div class="hidden md:flex items-center space-x-6">
          <!-- Sales Mode Chooser Link -->
          <NuxtLink to="/choose-sales-mode" class="flex items-center space-x-2 px-3 py-2 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors border border-yellow-300">
            <span>❓</span>
            <span class="font-semibold">Hangi Mod?</span>
          </NuxtLink>
          
          <div class="w-px h-6 bg-gray-300"></div>
          
          <NuxtLink to="/shop" class="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors"
                    :class="currentSalesMode === 'shop' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:text-blue-600'">
            <span>🛒</span>
            <span class="font-medium">Klasik Mağaza</span>
          </NuxtLink>
          
          <NuxtLink to="/live" class="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors"
                    :class="currentSalesMode === 'live' ? 'bg-purple-100 text-purple-800' : 'text-gray-700 hover:text-purple-600'">
            <span>📺</span>
            <span class="font-medium">Canlı Yayın</span>
          </NuxtLink>
          
          <NuxtLink to="/explore" class="flex items-center space-x-2 px-3 py-2 rounded-md transition-colors"
                    :class="currentSalesMode === 'browse' ? 'bg-green-100 text-green-800' : 'text-gray-700 hover:text-green-600'">
            <span>🔍</span>
            <span class="font-medium">Keşfet</span>
          </NuxtLink>
        </div>

        <!-- User Actions -->
        <div class="flex items-center space-x-3">
          <!-- Search -->
          <button class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
            <span class="text-xl">🔍</span>
          </button>

          <!-- Cart (only visible in shop mode) -->
          <NuxtLink 
            v-if="showCartIcon"
            to="/basket" 
            class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all relative"
          >
            <span class="text-xl">🛒</span>
            <span v-if="cartCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ cartCount }}
            </span>
          </NuxtLink>

          <!-- Messages -->
          <NuxtLink to="/messages" class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
            <span class="text-xl">💬</span>
          </NuxtLink>

          <!-- User Menu -->
          <div class="relative" v-if="user">
            <button 
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <img :src="user.avatar" :alt="user.name" class="w-8 h-8 rounded-full">
              <span class="hidden md:block text-sm font-medium">{{ user.name }}</span>
            </button>

            <!-- User Dropdown -->
            <div 
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
            >
              <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                👤 Profil
              </NuxtLink>
              <NuxtLink to="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                📊 Panel
              </NuxtLink>
              <NuxtLink to="/go-live" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                📹 Canlı Yayın Başlat
              </NuxtLink>
              <NuxtLink to="/sell" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                💰 Ürün Sat
              </NuxtLink>
              <div class="border-t my-2"></div>
              <NuxtLink to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                ⚙️ Ayarlar
              </NuxtLink>
              <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                🚪 Çıkış
              </button>
            </div>
          </div>

          <!-- Login/Register (if not logged in) -->
          <div v-else class="flex items-center space-x-2">
            <NuxtLink to="/login" class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
              Giriş
            </NuxtLink>
            <NuxtLink to="/register" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Üye Ol
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Mode Indicator Banner -->
    <div v-if="showModeIndicator" :class="modeIndicatorClass">
      <div class="max-w-7xl mx-auto px-4 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ currentModeIcon }}</span>
            <div>
              <div class="font-semibold">{{ currentModeTitle }}</div>
              <div class="text-sm opacity-75">{{ currentModeDescription }}</div>
            </div>
          </div>
          
          <!-- Mode Switcher -->
          <div class="flex items-center space-x-2 text-sm">
            <span class="opacity-75">Değiştir:</span>
            <NuxtLink 
              v-for="mode in availableModes" 
              :key="mode.path"
              :to="mode.path"
              class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-all"
            >
              {{ mode.icon }} {{ mode.name }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Critical Auction Warning -->
    <div v-if="showAuctionWarning" class="bg-yellow-500 text-black">
      <div class="max-w-7xl mx-auto px-4 py-2">
        <div class="flex items-center justify-center space-x-2 text-sm font-medium">
          <span>⚠️</span>
          <span>AÇIK ARTIRMA sadece canlı yayın sırasında kullanılabilir</span>
          <NuxtLink to="/live" class="underline hover:no-underline">
            📺 Canlı Yayınlara Git
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

// User authentication state
const user = ref({
  name: 'John Doe',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
})

// UI state
const showUserMenu = ref(false)
const cartCount = ref(3) // Cart item count

// Current sales mode detection
const currentSalesMode = computed(() => {
  const path = route.path
  
  if (path === '/shop' || path.startsWith('/product/') || path === '/basket') {
    return 'shop'
  } else if (path === '/live' || path.startsWith('/livestream/') || path.startsWith('/live-auction/')) {
    return 'live'
  } else if (path === '/explore' || path === '/categories' || path.startsWith('/category/')) {
    return 'browse'
  }
  
  return null
})

// Show cart icon only in shop mode or neutral pages
const showCartIcon = computed(() => {
  return currentSalesMode.value === 'shop' || currentSalesMode.value === null
})

// Mode indicator display
const showModeIndicator = computed(() => {
  return currentSalesMode.value !== null
})

const showAuctionWarning = computed(() => {
  // Show warning on auction-related pages that shouldn't exist
  return route.path.includes('auction') && !route.path.startsWith('/live-auction/')
})

const currentModeIcon = computed(() => {
  const icons = {
    shop: '🛒',
    live: '📺',
    browse: '🔍'
  }
  return icons[currentSalesMode.value] || ''
})

const currentModeTitle = computed(() => {
  const titles = {
    shop: 'Klasik Alışveriş Modu',
    live: 'Canlı Yayın Modu',
    browse: 'Keşfet Modu'
  }
  return titles[currentSalesMode.value] || ''
})

const currentModeDescription = computed(() => {
  const descriptions = {
    shop: 'Sepete ekle, istediğin zaman satın al',
    live: 'Canlı video ile alışveriş, açık artırma sadece burada',
    browse: 'Ürünleri keşfet ve kategorilere göz at'
  }
  return descriptions[currentSalesMode.value] || ''
})

const modeIndicatorClass = computed(() => {
  const classes = {
    shop: 'bg-blue-600 text-white',
    live: 'bg-red-600 text-white',
    browse: 'bg-purple-600 text-white'
  }
  return classes[currentSalesMode.value] || 'bg-gray-600 text-white'
})

const availableModes = computed(() => {
  const all = [
    { path: '/shop', icon: '🛒', name: 'Mağaza' },
    { path: '/live', icon: '📺', name: 'Canlı' },
    { path: '/explore', icon: '🔍', name: 'Keşfet' }
  ]
  
  return all.filter(mode => mode.path !== route.path)
})

// Methods
const logout = () => {
  user.value = null
  showUserMenu.value = false
  navigateTo('/login')
}

// Close user menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})
</script>
