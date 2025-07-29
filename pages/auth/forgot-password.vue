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
          <h2 class="text-3xl font-bold text-gray-900">🔑 Şifremi Unuttum</h2>
          <p class="mt-2 text-gray-600">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
          </p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ornek@email.com"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Şifre Sıfırlama Bağlantısı Gönder</span>
            <span v-else class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gönderiliyor...
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
              <h3 class="text-sm font-medium text-green-800">E-posta Gönderildi!</h3>
              <div class="mt-2 text-sm text-green-700">
                <p>{{ successMessage }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <NuxtLink 
            to="/auth/login" 
            class="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            ← Giriş sayfasına dön
          </NuxtLink>
        </div>
      </div>

      <!-- Additional Help -->
      <div class="bg-blue-50 rounded-lg p-6">
        <h3 class="font-semibold text-blue-900 mb-2">Yardıma mı ihtiyacınız var?</h3>
        <div class="text-sm text-blue-800 space-y-2">
          <p>• E-posta adresinizi doğru yazdığınızdan emin olun</p>
          <p>• Spam klasörünüzü kontrol etmeyi unutmayın</p>
          <p>• E-posta gelmezse 5 dakika sonra tekrar deneyin</p>
        </div>
        <div class="mt-4">
          <NuxtLink 
            to="/contact" 
            class="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Hala sorun yaşıyorsanız bizimle iletişime geçin →
          </NuxtLink>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="text-center text-xs text-gray-500">
        <p>
          Güvenliğiniz için şifre sıfırlama bağlantısı 24 saat geçerlidir.<br>
          Bu işlemi siz yapmadıysanız e-postayı görmezden gelebilirsiniz.
        </p>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue'

useHead({
  title: 'Şifremi Unuttum - TagList',
  meta: [
    { name: 'description', content: 'TagList şifre sıfırlama sayfası. E-posta adresinizle şifrenizi sıfırlayın.' }
  ]
})

// Reactive data
const form = ref({
  email: ''
})

const errors = ref({})
const isLoading = ref(false)
const successMessage = ref('')

// Methods
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.email) {
    errors.value.email = 'E-posta adresi gereklidir'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Geçerli bir e-posta adresi girin'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isLoading.value = true
  successMessage.value = ''
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Success
    successMessage.value = `${form.value.email} adresine şifre sıfırlama bağlantısı gönderildi. E-postanızı kontrol edin.`
    
    // Reset form
    form.value.email = ''
    
  } catch (error) {
    errors.value.email = 'Bir hata oluştu. Lütfen tekrar deneyin.'
  } finally {
    isLoading.value = false
  }
}
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
