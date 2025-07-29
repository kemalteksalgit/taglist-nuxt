<template>
  <div v-if="showOnboarding" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-lg">
    <div class="max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-in fade-in duration-500">
      
      <!-- Progress Indicator -->
      <div class="flex justify-center mb-8">
        <div class="flex space-x-2">
          <div v-for="i in 3" :key="i" 
               :class="[
                 'w-3 h-3 rounded-full transition-all duration-300',
                 currentStep >= i ? 'bg-blue-600 scale-110' : 'bg-gray-300'
               ]" />
        </div>
      </div>

      <!-- Step 1: Welcome -->
      <div v-if="currentStep === 1" class="text-center space-y-6 animate-in slide-in-from-right duration-300">
        <div class="text-6xl mb-4 animate-bounce">👋</div>
        <h1 class="text-3xl font-bold text-gray-900">TagList'e Hoş Geldiniz!</h1>
        <p class="text-xl text-gray-600 max-w-lg mx-auto">
          Türkiye'nin en yenilikçi alışveriş platformunda 3 farklı deneyim sizi bekliyor.
        </p>
      </div>

      <!-- Step 2: Shopping Style Preference -->
      <div v-if="currentStep === 2" class="space-y-6 animate-in slide-in-from-right duration-300">
        <div class="text-center mb-8">
          <div class="text-5xl mb-4">🎯</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">
            Hangi alışveriş tarzı seni heyecanlandırıyor?
          </h2>
          <p class="text-gray-600">Tercihine göre ana sayfa ve öneriler kişiselleştirilecek</p>
        </div>

        <div class="grid gap-4">
          <button 
            v-for="style in shoppingStyles" 
            :key="style.id"
            @click="selectStyle(style.id)"
            :class="[
              'p-6 rounded-2xl border-2 transition-all duration-300 text-left group',
              selectedStyle === style.id 
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            ]">
            <div class="flex items-center space-x-4">
              <div class="text-3xl">{{ style.icon }}</div>
              <div class="flex-1">
                <h3 class="font-semibold text-lg text-gray-900">{{ style.title }}</h3>
                <p class="text-gray-600 text-sm">{{ style.description }}</p>
              </div>
              <div v-if="selectedStyle === style.id" 
                   class="text-blue-600 animate-in zoom-in duration-200">
                ✓
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Step 3: User Type Selection -->
      <div v-if="currentStep === 3" class="space-y-6 animate-in slide-in-from-right duration-300">
        <div class="text-center mb-8">
          <div class="text-5xl mb-4">👤</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Sen nasıl bir kullanıcısın?</h2>
          <p class="text-gray-600">Rolüne uygun özellikler ve paneller göstereceğiz</p>
        </div>

        <div class="grid gap-4">
          <button 
            v-for="type in userTypes" 
            :key="type.id"
            @click="selectUserType(type.id)"
            :class="[
              'p-6 rounded-2xl border-2 transition-all duration-300 text-left group',
              selectedUserType === type.id 
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
            ]">
            <div class="flex items-center space-x-4">
              <div class="text-3xl">{{ type.icon }}</div>
              <div class="flex-1">
                <h3 class="font-semibold text-lg text-gray-900">{{ type.title }}</h3>
                <p class="text-gray-600 text-sm">{{ type.description }}</p>
              </div>
              <div v-if="selectedUserType === type.id" 
                   class="text-purple-600 animate-in zoom-in duration-200">
                ✓
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-12">
        <button 
          v-if="currentStep > 1"
          @click="previousStep"
          class="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
          ← Geri
        </button>
        <div v-else></div>

        <button 
          @click="nextStep"
          :disabled="!canProceed"
          :class="[
            'px-8 py-3 rounded-xl font-semibold transition-all duration-300',
            canProceed 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          ]">
          {{ currentStep === 3 ? 'Başlayalım! 🚀' : 'Devam Et →' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Modern User Onboarding Component - 2025 UX Standards

interface ShoppingStyle {
  id: string
  title: string
  description: string
  icon: string
}

interface UserType {
  id: string
  title: string
  description: string
  icon: string
}

// State
const showOnboarding = ref(true)
const currentStep = ref(1)
const selectedStyle = ref<string>('')
const selectedUserType = ref<string>('')

// Data
const shoppingStyles: ShoppingStyle[] = [
  {
    id: 'classic',
    title: 'Klasik Alışveriş',
    description: 'Rahat tempoyla ürün incelerim, karşılaştırırım ve sepete eklerim',
    icon: '🛒'
  },
  {
    id: 'live',
    title: 'Canlı Yayın Heyecanı',
    description: 'Satıcılarla sohbet ederek, canlı gösterimlerle alışveriş yapmayı severim',
    icon: '📺'
  },
  {
    id: 'auction',
    title: 'Açık Artırma Tutkusu',
    description: 'Rekabetçi tekliflerle eşsiz ürünleri kazanmak beni heyecanlandırır',
    icon: '⚡'
  }
]

const userTypes: UserType[] = [
  {
    id: 'buyer',
    title: 'Alıcı',
    description: 'Ürün satın almak ve keşfetmek istiyorum',
    icon: '🛍️'
  },
  {
    id: 'seller',
    title: 'Satıcı',
    description: 'Ürün satmak ve müşterilerle etkileşim kurmak istiyorum',
    icon: '💼'
  },
  {
    id: 'both',
    title: 'İkisi de',
    description: 'Hem alış hem satış yapmayı planlıyorum',
    icon: '🔄'
  }
]

// Computed
const canProceed = computed(() => {
  if (currentStep.value === 1) return true
  if (currentStep.value === 2) return selectedStyle.value !== ''
  if (currentStep.value === 3) return selectedUserType.value !== ''
  return false
})

// Methods
const selectStyle = (styleId: string) => {
  selectedStyle.value = styleId
}

const selectUserType = (typeId: string) => {
  selectedUserType.value = typeId
}

const nextStep = () => {
  if (!canProceed.value) return
  
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    completeOnboarding()
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeOnboarding = () => {
  // Save user preferences
  const preferences = {
    shoppingStyle: selectedStyle.value,
    userType: selectedUserType.value,
    onboardingCompleted: true,
    completedAt: new Date().toISOString()
  }
  
  // Store in localStorage for persistence
  localStorage.setItem('taglist-user-preferences', JSON.stringify(preferences))
  
  // Close onboarding
  showOnboarding.value = false
  
  // Navigate based on preferred style
  const navigationMap = {
    classic: '/shop',
    live: '/live',
    auction: '/live'
  }
  
  const targetRoute = navigationMap[selectedStyle.value as keyof typeof navigationMap] || '/'
  navigateTo(targetRoute)
  
  // Show success toast
  showToast('Hoş geldin! Deneyimin kişiselleştirildi 🎉', 'success')
}

const showToast = (message: string, type: 'success' | 'info' = 'info') => {
  // Implementation would integrate with global toast system
  console.log(`Toast: ${message} (${type})`)
}

// Check if onboarding should be shown
onMounted(() => {
  const savedPreferences = localStorage.getItem('taglist-user-preferences')
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences)
    if (preferences.onboardingCompleted) {
      showOnboarding.value = false
    }
  }
})
</script>

<style scoped>
/* Custom animations for smooth onboarding experience */
@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: animate-in 0.3s ease-out;
}

@keyframes slide-in-from-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-from-right {
  animation: slide-in-from-right 0.3s ease-out;
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.zoom-in {
  animation: zoom-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fade-in 0.5s ease-out;
}
</style>
