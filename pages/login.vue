<template>
  <NuxtLayout name="auth">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo ve Başlık -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
          <Icon name="heroicons:tag" class="h-8 w-8 text-white" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Hesabınıza Giriş Yapın</h2>
        <p class="text-gray-600">TagList'e hoş geldiniz</p>
      </div>

      <!-- Giriş Formu -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
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
                class="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Şifrenizi girin"
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
          </div>

          <!-- Beni Hatırla ve Şifremi Unuttum -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Beni hatırla</span>
            </label>
            <NuxtLink
              to="/forgot-password"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Şifremi unuttum
            </NuxtLink>
          </div>

          <!-- Giriş Butonu -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Icon v-if="isLoading" name="heroicons:arrow-path" class="animate-spin h-5 w-5 mr-2" />
            {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </form>

        <!-- Sosyal Giriş -->
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
              @click="loginWithGoogle"
              class="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Icon name="logos:google-icon" class="h-5 w-5" />
              <span class="ml-2">Google</span>
            </button>
            <button
              @click="loginWithFacebook"
              class="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Icon name="logos:facebook" class="h-5 w-5" />
              <span class="ml-2">Facebook</span>
            </button>
          </div>
        </div>

        <!-- Kayıt Ol Linki -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Hesabınız yok mu?
            <NuxtLink
              to="/register"
              class="font-medium text-blue-600 hover:text-blue-800 ml-1"
            >
              Hemen kayıt olun
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Güvenlik Bilgisi -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-center">
          <Icon name="heroicons:shield-check" class="h-5 w-5 text-blue-600 mr-2" />
          <p class="text-sm text-blue-800">
            Bilgileriniz SSL ile şifrelenir ve güvenle korunur.
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

const authStore = useAuthStore()
const { $notification } = useNuxtApp()

// SEO
useHead({
  title: 'Giriş Yap - TagList',
  meta: [
    { name: 'description', content: 'TagList hesabınıza giriş yapın. Güvenli ve hızlı giriş.' }
  ]
})

// Form state
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const isLoading = ref(false)

// Methods
const handleLogin = async () => {
  isLoading.value = true
  
  try {
    // Use auth store for login
    const result = await authStore.login({
      email: form.value.email,
      password: form.value.password,
      rememberMe: form.value.rememberMe
    })
    
    if (result.success) {
      $notification.success('Login Successful', 'Welcome back to TagList!')
      await navigateTo('/')
    } else {
      $notification.error('Login Failed', result.error || 'Please check your credentials.')
    }
    
  } catch (error) {
    console.error('Login error:', error)
    $notification.error('Login Failed', 'Please check your credentials and try again.')
  } finally {
    isLoading.value = false
  }
}

const loginWithGoogle = () => {
  // Google OAuth işlemi
  $notification.info('Coming Soon', 'Google login feature will be available soon!')
}

const loginWithFacebook = () => {
  // Facebook OAuth işlemi
  $notification.info('Coming Soon', 'Facebook login feature will be available soon!')
}

// Sayfa koruması - zaten giriş yapmış kullanıcıları yönlendir
onMounted(() => {
  // TODO: Implement user redirect after auth store is ready
})
</script>

<style scoped>
/* Component specific styles */
</style>