<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
    <div class="flex flex-col min-h-screen">
      <!-- Top Header -->
      <header class="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div class="px-4 py-3">
          <div class="flex items-center justify-between">
            <!-- Left: Logo and Back Button -->
            <div class="flex items-center space-x-4">
              <button 
                v-if="showBackButton" 
                @click="goBack"
                class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <div class="text-2xl font-bold">
                🏷️ <span class="text-blue-400">TagList</span>
              </div>
            </div>

            <!-- Center: Mode Selector -->
            <div class="flex bg-white/10 rounded-xl p-1">
              <button
                v-for="mode in salesModes"
                :key="mode.id"
                @click="switchSalesMode(mode.id)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  currentSalesMode === mode.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                ]"
              >
                {{ mode.icon }} {{ mode.name }}
              </button>
            </div>

            <!-- Right: Messages, Cart, Profile -->
            <div class="flex items-center space-x-3">
              <!-- Messages & Notifications -->
              <NuxtLink to="/messages" class="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full text-xs flex items-center justify-center">5</span>
              </NuxtLink>

              <!-- Cart -->
              <NuxtLink to="/basket" class="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center">1</span>
              </NuxtLink>

              <!-- Profile Menu -->
              <div class="relative">
                <button 
                  @click.stop="toggleUserMenu" 
                  class="flex items-center space-x-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold">M</span>
                  </div>
                </button>

                <!-- User Menu Dropdown -->
                <div 
                  v-if="showUserMenu"
                  ref="userMenuRef"
                  class="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg text-gray-900 z-50"
                >
                  <div class="p-2">
                    <NuxtLink to="/profile" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors">👤 Profil</NuxtLink>
                    <NuxtLink to="/settings" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors">⚙️ Ayarlar</NuxtLink>
                    <NuxtLink to="/help" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors">❓ Yardım</NuxtLink>
                    <div class="border-t border-gray-200 my-2"></div>
                    <button @click="logout" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      🚪 Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-x-hidden">
        <slot />
      </main>

      <!-- Toast Notifications -->
      <div class="fixed top-4 right-4 z-50 space-y-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'bg-white rounded-lg shadow-lg border p-4 flex items-center justify-between min-w-80 transform transition-all duration-300',
            toast.type === 'success' ? 'border-green-200 text-green-800' :
            toast.type === 'error' ? 'border-red-200 text-red-800' :
            'border-blue-200 text-blue-800'
          ]"
        >
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>
          <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

// Core reactive state
const currentSalesMode = ref<'shop' | 'live' | 'auction'>('shop')
const showUserMenu = ref(false)
const userMenuRef = ref()
const toasts = ref<any[]>([])

// Sales modes
const salesModes = [
  {
    id: 'shop',
    name: 'Mağaza',
    icon: '🛍️'
  },
  {
    id: 'live',
    name: 'Canlı',
    icon: '📺'
  },
  {
    id: 'auction',
    name: 'Açık Artırma',
    icon: '⚡'
  }
]

// Computed properties
const showBackButton = computed(() => {
  const route = useRoute()
  return route.name !== 'index'
})

// Navigation and mode switching
const goBack = () => {
  history.back()
}

const switchSalesMode = (mode: string) => {
  const validMode = (mode === 'shop' || mode === 'live' || mode === 'auction') ? mode : 'shop'
  currentSalesMode.value = validMode
  
  // Route mapping for different modes
  const routes = {
    shop: '/shop',
    live: '/live', 
    auction: '/auction'
  }
  
  navigateTo(routes[validMode])
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = () => {
  // Navigate to home
  navigateTo('/')
  
  // Show logout toast
  addToast('Başarıyla çıkış yaptınız', 'info')
}

// Toast management
const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const id = Math.random().toString(36).substr(2, 9)
  toasts.value.push({ id, type, message })
  
  // Auto-remove after 5 seconds
  setTimeout(() => removeToast(id), 5000)
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Handle clicks outside user menu
const handleClickOutside = (event: Event) => {
  if (showUserMenu.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

// Load user preferences on mount
onMounted(() => {
  if (process.client) {
    // Add click outside listener
    document.addEventListener('click', handleClickOutside)
  }
})

// Cleanup
onBeforeUnmount(() => {
  if (process.client) {
    document.removeEventListener('click', handleClickOutside)
  }
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
