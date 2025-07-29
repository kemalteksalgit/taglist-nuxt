<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-  } catch (error) {
    // Still offline - connection check failed
  } finally {e rounded-2xl shadow-xl p-8 text-center">
      <!-- Offline Icon -->
      <div class="mx-auto w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.4 4.4 0 003 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 17l4-4 4 4m-4-5v9" />
        </svg>
      </div>

      <!-- Title -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">
        İnternet Bağlantısı Yok
      </h1>

      <!-- Description -->
      <p class="text-gray-600 mb-8 leading-relaxed">
        Şu anda çevrimdışısınız. İnternet bağlantınızı kontrol edip tekrar deneyin.
        TagList uygulaması çevrimiçi olduğunuzda otomatik olarak güncellenecektir.
      </p>

      <!-- Cached Content Notice -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-center mb-2">
          <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium text-blue-800">Çevrimdışı İçerik</span>
        </div>
        <p class="text-sm text-blue-700">
          Daha önce görüntülediğiniz bazı sayfalar çevrimdışı olarak kullanılabilir.
        </p>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <!-- Retry Button -->
        <button
          @click="checkConnection"
          :disabled="isChecking"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isChecking" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isChecking ? 'Kontrol Ediliyor...' : 'Bağlantıyı Tekrar Dene' }}
        </button>

        <!-- Go to Home -->
        <button
          @click="goToHome"
          class="w-full btn-secondary"
        >
          Ana Sayfaya Git
        </button>

        <!-- Back Button -->
        <button
          @click="goBack"
          class="w-full text-gray-600 hover:text-gray-800 transition-colors py-2"
        >
          Geri Dön
        </button>
      </div>

      <!-- Connection Status -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="flex items-center justify-center space-x-2">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
          <span class="text-sm text-gray-500">Çevrimdışı</span>
        </div>
      </div>

      <!-- App Info -->
      <div class="mt-6 text-xs text-gray-400">
        TagList PWA v2.0.0
      </div>
    </div>

    <!-- Background Animation -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Meta tags
useHead({
  title: 'Çevrimdışı - TagList',
  meta: [
    { name: 'description', content: 'TagList çevrimdışı sayfası. İnternet bağlantınızı kontrol edin.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// State
const isChecking = ref(false)

// Connection check
const checkConnection = async () => {
  isChecking.value = true
  
  try {
    // Service Worker'dan connection status kontrolü
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CHECK_CONNECTION'
      })
    }
    
    // Basit network kontrolü
    const response = await fetch('/', { 
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    
    if (response.ok) {
      // Bağlantı var, ana sayfaya yönlendir
      await navigateTo('/')
    } else {
      throw new Error('Network response was not ok')
    }
  } catch (error) {
    // Hata mesajı gösterebiliriz
  } finally {
    isChecking.value = false
  }
}

// Navigation functions
const goToHome = () => {
  navigateTo('/')
}

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

// Online/offline event listeners
onMounted(() => {
  if (typeof window !== 'undefined') {
    // Online event listener
    const handleOnline = () => {
      navigateTo('/')
    }
    
    // Offline event listener
    const handleOffline = () => {
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Cleanup
    onUnmounted(() => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })
  }
})

// Service Worker message listener
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CONNECTION_STATUS') {
        if (event.data.online) {
          navigateTo('/')
        }
      }
    })
  }
})
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@media (prefers-reduced-motion: reduce) {
  .animate-blob,
  .animate-pulse,
  .animate-spin {
    animation: none;
  }
}
</style>
