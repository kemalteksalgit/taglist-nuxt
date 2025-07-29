<template>
  <NuxtLayout name="auth">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo ve Başlık -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
          <Icon name="heroicons:user-plus" class="h-8 w-8 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Hesap Oluşturun</h2>
        <p class="text-gray-600">TagList'e katılın ve alışverişe başlayın</p>
      </div>

      <!-- Kayıt Formu -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Ad Soyad -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                Ad
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Adınız"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                Soyad
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Soyadınız"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:envelope" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <!-- Telefon -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Telefon Numarası
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:phone" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="05XX XXX XX XX"
              />
            </div>
          </div>

          <!-- Şifre -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:lock-closed" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="En az 8 karakter"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" 
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                />
              </button>
            </div>
            <!-- Şifre Gücü Göstergesi -->
            <div class="mt-2">
              <div class="flex space-x-1">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  class="h-1 flex-1 rounded-full"
                  :class="getPasswordStrengthColor(i)"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ passwordStrengthText }}</p>
            </div>
          </div>

          <!-- Şifre Tekrar -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:lock-closed" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                :class="{ 'border-red-300': form.confirmPassword && !passwordsMatch }"
                placeholder="Şifrenizi tekrar girin"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showConfirmPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" 
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                />
              </button>
            </div>
            <p v-if="form.confirmPassword && !passwordsMatch" class="text-red-500 text-xs mt-1">
              Şifreler eşleşmiyor
            </p>
          </div>

          <!-- Şartlar ve Koşullar -->
          <div class="flex items-start space-x-3">
            <input
              id="acceptTerms"
              v-model="form.acceptTerms"
              type="checkbox"
              required
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label for="acceptTerms" class="text-sm text-gray-700">
              <a href="/terms" class="text-blue-600 hover:underline">Kullanım Şartları</a>'nı ve 
              <a href="/privacy" class="text-blue-600 hover:underline">Gizlilik Politikası</a>'nı okudum, kabul ediyorum.
            </label>
          </div>

          <!-- Pazarlama İzni -->
          <div class="flex items-start space-x-3">
            <input
              id="marketingConsent"
              v-model="form.marketingConsent"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            />
            <label for="marketingConsent" class="text-sm text-gray-700">
              Kampanya ve fırsatlardan haberdar olmak istiyorum. (İsteğe bağlı)
            </label>
          </div>

          <!-- Kayıt Ol Butonu -->
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin h-5 w-5 mr-2" />
            {{ isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur' }}
          </button>
        </form>

        <!-- Sosyal Kayıt -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500">veya</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              @click="registerWithGoogle"
              class="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Icon name="logos:google-icon" class="h-5 w-5" />
              <span class="ml-2">Google</span>
            </button>
            <button
              @click="registerWithFacebook"
              class="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Icon name="logos:facebook" class="h-5 w-5" />
              <span class="ml-2">Facebook</span>
            </button>
          </div>
        </div>

        <!-- Giriş Yap Linki -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Zaten hesabınız var mı?
            <NuxtLink
              to="/login"
              class="font-medium text-blue-600 hover:text-blue-800 ml-1"
            >
              Giriş yapın
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed } from 'vue'

// SEO
useHead({
  title: 'Kayıt Ol - TagList',
  meta: [
    { name: 'description', content: 'TagList\'e ücretsiz kayıt olun. Hızlı ve güvenli kayıt işlemi.' }
  ]
})

// Form state
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  marketingConsent: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

// Computed properties
const passwordsMatch = computed(() => {
  return form.value.password === form.value.confirmPassword
})

const passwordStrength = computed(() => {
  const password = form.value.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return strength
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
    case 1: return 'Zayıf şifre'
    case 2: return 'Orta güçlükte şifre'
    case 3: return 'Güçlü şifre'
    case 4: return 'Çok güçlü şifre'
    default: return ''
  }
})

const isFormValid = computed(() => {
  return form.value.firstName &&
         form.value.lastName &&
         form.value.email &&
         form.value.phone &&
         form.value.password &&
         form.value.confirmPassword &&
         passwordsMatch.value &&
         form.value.acceptTerms &&
         passwordStrength.value >= 2
})

// Methods
const getPasswordStrengthColor = (index) => {
  if (passwordStrength.value >= index) {
    switch (passwordStrength.value) {
      case 1: return 'bg-red-400'
      case 2: return 'bg-yellow-400'
      case 3: return 'bg-blue-400'
      case 4: return 'bg-green-400'
      default: return 'bg-gray-200'
    }
  }
  return 'bg-gray-200'
}

const submitForm = async () => {
  if (!isFormValid.value) return
  
  try {
    loading.value = true
    
    // Registration logic
    // await registerUser(form.value)
    
    await navigateTo('/login?registered=true')
  } catch (error) {
    // Handle registration error
  } finally {
    loading.value = false
  }
}

const registerWithGoogle = () => {
  // Google OAuth işlemi
  alert('Google ile kayıt özelliği yakında!')
}

const registerWithFacebook = () => {
  // Facebook OAuth işlemi
  alert('Facebook ile kayıt özelliği yakında!')
}
</script>

<style scoped>
/* Component specific styles */
</style>