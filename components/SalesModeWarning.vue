<template>
  <!-- Sales Mode Warning Banner -->
  <div v-if="shouldShowWarning" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-400" />
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-red-800">
          {{ warningTitle }}
        </h3>
        <div class="mt-2 text-sm text-red-700">
          <p>{{ warningMessage }}</p>
        </div>
        <div class="mt-4">
          <div class="flex space-x-4">
            <button 
              @click="goToCorrectMode"
              class="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
            >
              {{ correctModeText }}
            </button>
            <button 
              @click="dismissWarning"
              class="bg-transparent px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Warning type to determine the message
  warningType?: 'auction-blocked' | 'wrong-mode' | 'mode-confusion' | null
  
  // Current sales mode context
  currentMode?: 'shop' | 'live' | 'explore' | 'unknown'
  
  // Whether user tried to access auction outside live
  attemptedAuction?: boolean
  
  // Custom warning message override
  customMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  warningType: null,
  currentMode: 'unknown',
  attemptedAuction: false,
  customMessage: ''
})

// Warning visibility
const isVisible = ref(true)

// Computed warning content
const shouldShowWarning = computed(() => {
  return isVisible.value && (props.warningType !== null || props.customMessage)
})

const warningTitle = computed(() => {
  switch (props.warningType) {
    case 'auction-blocked':
      return '⚠️ Açık Artırma Engellendi'
    case 'wrong-mode':
      return '⚠️ Yanlış Satış Modu'
    case 'mode-confusion':
      return '⚠️ Mod Karışıklığı'
    default:
      return '⚠️ Dikkat'
  }
})

const warningMessage = computed(() => {
  if (props.customMessage) return props.customMessage
  
  switch (props.warningType) {
    case 'auction-blocked':
      return 'Açık artırma özelliği sadece canlı video yayınları sırasında kullanılabilir. Klasik mağaza modunda açık artırma bulunmaz.'
    case 'wrong-mode':
      return `Şu anda ${getModeDisplayName(props.currentMode)} modundasınız. Aradığınız özellik farklı bir satış modunda olabilir.`
    case 'mode-confusion':
      return 'TagList\'te 3 farklı satış modu bulunur. Her modun kendine özgü özellikleri vardır ve karıştırılmaması gerekir.'
    default:
      return 'Satış modu ile ilgili bir uyarı var.'
  }
})

const correctModeText = computed(() => {
  switch (props.warningType) {
    case 'auction-blocked':
      return 'Canlı Yayına Git'
    case 'wrong-mode':
      return 'Doğru Modu Seç'
    case 'mode-confusion':
      return 'Modları Öğren'
    default:
      return 'Çözüm'
  }
})

// Helper function to get mode display name
const getModeDisplayName = (mode: string) => {
  switch (mode) {
    case 'shop': return 'Klasik Mağaza'
    case 'live': return 'Canlı Yayın'
    case 'explore': return 'Ürün Keşfet'
    default: return 'Bilinmeyen'
  }
}

// Actions
const goToCorrectMode = () => {
  switch (props.warningType) {
    case 'auction-blocked':
      navigateTo('/live')
      break
    case 'wrong-mode':
    case 'mode-confusion':
      navigateTo('/choose-sales-mode')
      break
    default:
      navigateTo('/choose-sales-mode')
  }
}

const dismissWarning = () => {
  isVisible.value = false
  
  // Analytics tracking
  if (process.client && (window as any).gtag) {
    (window as any).gtag('event', 'warning_dismissed', {
      warning_type: props.warningType,
      current_mode: props.currentMode
    })
  }
}

// Auto-dismiss after 10 seconds for non-critical warnings
onMounted(() => {
  if (props.warningType !== 'auction-blocked') {
    setTimeout(() => {
      if (isVisible.value) {
        dismissWarning()
      }
    }, 10000)
  }
})
</script>
