<template>
  <NuxtLayout name="auth">
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <NuxtLink to="/" class="flex items-center justify-center space-x-3 mb-8">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">TL</span>
          </div>
          <span class="text-3xl font-bold text-gray-800">TagList</span>
        </NuxtLink>
        
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900">🔐 Şifre Sıfırla</h2>
          <p class="mt-2 text-gray-600">
            Hesabınız için yeni bir şifre belirleyin
          </p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <div v-if="!isValidToken" class="text-center">
          <div class="text-red-500 text-6xl mb-4">❌</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Geçersiz Bağlantı</h3>
          <p class="text-gray-600 mb-6">
            Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. 
            Lütfen yeni bir şifre sıfırlama talebinde bulunun.
          </p>
          <NuxtLink 
            to="/auth/forgot-password" 
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Yeni Bağlantı Talep Et
          </NuxtLink>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <!-- New Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Yeni Şifre
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="En az 8 karakter"
                :class="{ 'border-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span v-if="showPassword">👁️</span>
                <span v-else>🙈</span>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            
            <!-- Password Strength -->
            <div class="mt-2">
              <div class="text-xs text-gray-500 mb-1">Şifre gücü:</div>
              <div class="flex space-x-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1 flex-1 rounded"
                  :class="passwordStrength >= i ? getStrengthColor(passwordStrength) : 'bg-gray-200'"
                ></div>
              </div>
              <div class="text-xs mt-1" :class="getStrengthTextColor(passwordStrength)">
                {{ getStrengthText(passwordStrength) }}
              </div>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Şifreyi Onayla
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Şifrenizi tekrar girin"
                :class="{ 'border-red-500': errors.confirmPassword }"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span v-if="showConfirmPassword">👁️</span>
                <span v-else>🙈</span>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Password Requirements -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Şifre gereksinimleri:</h4>
            <ul class="text-xs text-gray-600 space-y-1">
              <li class="flex items-center">
                <span :class="form.password.length >= 8 ? 'text-green-500' : 'text-gray-400'">
                  {{ form.password.length >= 8 ? '✅' : '⭕' }}
                </span>
                <span class="ml-2">En az 8 karakter</span>
              </li>
              <li class="flex items-center">
                <span :class="/[A-Z]/.test(form.password) ? 'text-green-500' : 'text-gray-400'">
                  {{ /[A-Z]/.test(form.password) ? '✅' : '⭕' }}
                </span>
                <span class="ml-2">En az bir büyük harf</span>
              </li>
              <li class="flex items-center">
                <span :class="/[a-z]/.test(form.password) ? 'text-green-500' : 'text-gray-400'">
                  {{ /[a-z]/.test(form.password) ? '✅' : '⭕' }}
                </span>
                <span class="ml-2">En az bir küçük harf</span>
              </li>
              <li class="flex items-center">
                <span :class="/\d/.test(form.password) ? 'text-green-500' : 'text-gray-400'">
                  {{ /\d/.test(form.password) ? '✅' : '⭕' }}
                </span>
                <span class="ml-2">En az bir rakam</span>
              </li>
            </ul>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || passwordStrength < 2"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Şifreyi Değiştir</span>
            <span v-else class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Değiştiriliyor...
            </span>
          </button>
        </form>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <span class="text-green-500 text-xl">✅</span>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Şifre Başarıyla Değiştirildi!</h3>
              <div class="mt-2 text-sm text-green-700">
                <p>{{ successMessage }}</p>
              </div>
              <div class="mt-4">
                <NuxtLink 
                  to="/auth/login" 
                  class="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Giriş Yap
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="text-center text-xs text-gray-500">
        <p>
          Güvenliğiniz için şifrenizi kimseyle paylaşmayın ve düzenli olarak değiştirin.
        </p>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const token = route.query.token

useHead({
  title: 'Şifre Sıfırla - TagList',
  meta: [
    { name: 'description', content: 'TagList şifre sıfırlama sayfası. Yeni şifrenizi belirleyin.' }
  ]
})

// Reactive data
const form = ref({
  password: '',
  confirmPassword: ''
})

const errors = ref({})
const isLoading = ref(false)
const successMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isValidToken = ref(true)

// Computed
const passwordStrength = computed(() => {
  const password = form.value.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

// Methods
const getStrengthColor = (strength) => {
  switch (strength) {
    case 1: return 'bg-red-500'
    case 2: return 'bg-orange-500'
    case 3: return 'bg-yellow-500'
    case 4: return 'bg-green-500'
    default: return 'bg-gray-200'
  }
}

const getStrengthTextColor = (strength) => {
  switch (strength) {
    case 1: return 'text-red-600'
    case 2: return 'text-orange-600'
    case 3: return 'text-yellow-600'
    case 4: return 'text-green-600'
    default: return 'text-gray-500'
  }
}

const getStrengthText = (strength) => {
  switch (strength) {
    case 1: return 'Çok zayıf'
    case 2: return 'Zayıf'
    case 3: return 'Orta'
    case 4: return 'Güçlü'
    default: return 'Çok zayıf'
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.password) {
    errors.value.password = 'Şifre gereklidir'
    return false
  }
  
  if (form.value.password.length < 8) {
    errors.value.password = 'Şifre en az 8 karakter olmalıdır'
    return false
  }
  
  if (passwordStrength.value < 2) {
    errors.value.password = 'Şifre çok zayıf, lütfen daha güçlü bir şifre seçin'
    return false
  }
  
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Şifre onayı gereklidir'
    return false
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Şifreler eşleşmiyor'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Success
    successMessage.value = 'Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.'
    
    // Reset form
    form.value = {
      password: '',
      confirmPassword: ''
    }
    
  } catch (error) {
    errors.value.password = 'Bir hata oluştu. Lütfen tekrar deneyin.'
  } finally {
    isLoading.value = false
  }
}

const validateToken = () => {
  // Simulate token validation
  if (!token || token.length < 10) {
    isValidToken.value = false
  }
}

onMounted(() => {
  validateToken()
})
</script>

<style scoped>
/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
