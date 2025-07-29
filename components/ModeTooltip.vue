<template>
  <Teleport to="body">
    <div v-if="isVisible" 
         class="fixed top-24 right-6 z-40 max-w-sm animate-in slide-in-from-right duration-500">
      
      <!-- Mode Tooltip Card -->
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 space-y-4">
        
        <!-- Header with Mode Icon & Close -->
        <div v-if="modeConfig" class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
              {{ modeConfig.icon }}
            </div>
            <div>
              <h3 class="font-bold text-lg text-gray-900">{{ modeConfig.title }}</h3>
              <p class="text-sm text-gray-600">{{ modeConfig.subtitle }}</p>
            </div>
          </div>
          <button @click="dismiss" 
                  class="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Features List -->
        <div v-if="modeConfig" class="space-y-3">
          <p class="text-gray-700 text-sm font-medium">Bu modda neler yapabilirsin:</p>
          <ul class="space-y-2">
            <li v-for="feature in modeConfig.features" :key="feature"
                class="flex items-center space-x-2 text-sm text-gray-600">
              <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>

        <!-- Quick Actions -->
        <div v-if="modeConfig" class="space-y-2">
          <p class="text-gray-700 text-sm font-medium">Hızlı başlangıç:</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="action in modeConfig.quickActions" 
                    :key="action.label"
                    @click="handleQuickAction(action)"
                    class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-colors duration-200">
              {{ action.icon }} {{ action.label }}
            </button>
          </div>
        </div>

        <!-- Auto-dismiss timer -->
        <div class="w-full bg-gray-200 rounded-full h-1">
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-100 ease-linear"
               :style="{ width: `${(timeLeft / autoHideDuration) * 100}%` }"></div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// Modern Mode Tooltip - 2025 UX Micro-Education System

interface QuickAction {
  label: string
  icon: string
  action: string
  route?: string
}

interface ModeConfig {
  icon: string
  title: string
  subtitle: string
  features: string[]
  quickActions: QuickAction[]
}

interface Props {
  mode: 'shop' | 'live' | 'auction'
  autoHide?: boolean
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoHide: true,
  duration: 8000
})

// State
const isVisible = ref(false)
const timeLeft = ref(props.duration)
const autoHideDuration = props.duration

// Mode Configurations
const modeConfigs: Record<string, ModeConfig> = {
  shop: {
    icon: '🛒',
    title: 'Klasik Mağaza Modu',
    subtitle: 'Rahat alışveriş deneyimi',
    features: [
      'Ürünleri sepete ekle ve sonra satın al',
      'Fiyat karşılaştırması yap',
      'Detaylı ürün incelemeleri oku',
      'Favori listelerini oluştur'
    ],
    quickActions: [
      { label: 'Ürün Ara', icon: '🔍', action: 'search' },
      { label: 'Kategoriler', icon: '📂', action: 'navigate', route: '/categories' },
      { label: 'Sepetim', icon: '🛒', action: 'navigate', route: '/basket' }
    ]
  },
  live: {
    icon: '📺',
    title: 'Canlı Yayın Modu',
    subtitle: 'Gerçek zamanlı alışveriş',
    features: [
      'Satıcıyla canlı sohbet et',
      'Ürün gösterimlerini izle',
      'Anlık sorular sor',
      'Canlı teklifler ver'
    ],
    quickActions: [
      { label: 'Aktif Yayınlar', icon: '🔴', action: 'navigate', route: '/live' },
      { label: 'Yayın Takvimi', icon: '📅', action: 'schedule' },
      { label: 'Sohbet Başlat', icon: '💬', action: 'chat' }
    ]
  },
  auction: {
    icon: '⚡',
    title: 'Açık Artırma Modu',
    subtitle: 'Yalnızca canlı yayında aktif',
    features: [
      'Gerçek zamanlı teklif ver',
      'Otomatik teklif sistemi kur',
      'Son saniye rekabeti yaşa',
      'Kazandığın ürünleri gör'
    ],
    quickActions: [
      { label: 'Aktif Artırmalar', icon: '🏆', action: 'navigate', route: '/live' },
      { label: 'Teklif Geçmişi', icon: '📊', action: 'history' },
      { label: 'Oto-Teklif Ayarla', icon: '🤖', action: 'auto-bid' }
    ]
  }
}

// Computed
const modeConfig = computed(() => modeConfigs[props.mode] || modeConfigs.shop)

// Auto-hide timer
let autoHideTimer: NodeJS.Timeout | null = null
let countdownTimer: NodeJS.Timeout | null = null

const startAutoHide = () => {
  if (!props.autoHide) return
  
  // Start countdown
  countdownTimer = setInterval(() => {
    timeLeft.value -= 100
    if (timeLeft.value <= 0) {
      dismiss()
    }
  }, 100)
  
  // Auto-hide after duration
  autoHideTimer = setTimeout(() => {
    dismiss()
  }, props.duration)
}

const stopAutoHide = () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = null
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// Methods
const show = () => {
  isVisible.value = true
  timeLeft.value = autoHideDuration
  startAutoHide()
}

const dismiss = () => {
  isVisible.value = false
  stopAutoHide()
}

const handleQuickAction = (action: QuickAction) => {
  switch (action.action) {
    case 'navigate':
      if (action.route) {
        navigateTo(action.route)
      }
      break
    case 'search':
      // Trigger search modal or focus search input
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
      searchInput?.focus()
      break
    case 'schedule':
      // Show live stream schedule
      // Implementation depends on schedule component
      break
    case 'chat':
      // Open chat interface
      // Implementation depends on chat system
      break
    case 'history':
      // Show bid history
      navigateTo('/profile?tab=bids')
      break
    case 'auto-bid':
      // Open auto-bid settings
      // Implementation depends on auto-bid component
      break
  }
  
  dismiss()
}

// Expose methods for parent components
defineExpose({
  show,
  dismiss
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoHide()
})
</script>

<style scoped>
@keyframes slide-in-from-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-from-right {
  animation: slide-in-from-right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
