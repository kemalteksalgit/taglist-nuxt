<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">📞 İletişim</h1>
        <p class="text-xl opacity-90">Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız</p>
      </div>
    </div>

    <!-- Contact Options -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Form -->
        <div class="bg-white p-8 rounded-lg shadow-sm">
          <h2 class="text-2xl font-bold mb-6 text-gray-900">Bize Mesaj Gönderin</h2>
          <form @submit.prevent="submitForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adınızı ve soyadınızı girin"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="E-posta adresinizi girin"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Konu</label>
              <select
                v-model="form.subject"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Konu seçiniz</option>
                <option value="technical">Teknik Destek</option>
                <option value="account">Hesap Sorunları</option>
                <option value="payment">Ödeme İşlemleri</option>
                <option value="complaint">Şikayet</option>
                <option value="suggestion">Öneri</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mesajınız</label>
              <textarea
                v-model="form.message"
                required
                rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Mesajınızı detaylı olarak yazın..."
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">Mesaj Gönder</span>
              <span v-else>Gönderiliyor...</span>
            </button>
          </form>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Quick Contact -->
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <h3 class="text-xl font-bold mb-6 text-gray-900">Hızlı İletişim</h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">📞</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Telefon</h4>
                  <p class="text-gray-600">0850 123 45 67</p>
                  <p class="text-sm text-gray-500">Hafta içi 09:00 - 18:00</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">📧</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">E-posta</h4>
                  <p class="text-gray-600">info@taglist.com</p>
                  <p class="text-sm text-gray-500">24 saat içinde yanıt</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">💬</span>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Canlı Destek</h4>
                  <p class="text-gray-600">7/24 Aktif</p>
                  <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Canlı Desteği Başlat →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Office Address -->
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <h3 class="text-xl font-bold mb-6 text-gray-900">Ofis Adresimiz</h3>
            <div class="space-y-2 text-gray-600">
              <p class="font-semibold text-gray-900">TagList Teknoloji A.Ş.</p>
              <p>Maslak Mahallesi, Büyükdere Caddesi</p>
              <p>No: 123, Kat: 15</p>
              <p>34485 Sarıyer / İstanbul</p>
              <p class="pt-2">
                <span class="font-medium">Vergi No:</span> 1234567890
              </p>
            </div>
          </div>

          <!-- Social Media -->
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <h3 class="text-xl font-bold mb-6 text-gray-900">Sosyal Medya</h3>
            <div class="flex space-x-4">
              <a href="#" class="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                📘
              </a>
              <a href="#" class="w-12 h-12 bg-blue-400 text-white rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors">
                🐦
              </a>
              <a href="#" class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors">
                📷
              </a>
              <a href="#" class="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors">
                📺
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Link -->
    <div class="bg-blue-50 py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Aradığınızı Bulamadınız mı?</h3>
        <p class="text-gray-600 mb-6">
          Sık sorulan sorular bölümümüzde cevabınızı bulabilirsiniz
        </p>
        <NuxtLink 
          to="/help" 
          class="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          <span class="mr-2">❓</span>
          Yardım Merkezini Ziyaret Et
        </NuxtLink>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue'

useHead({
  title: 'İletişim - TagList',
  meta: [
    { name: 'description', content: 'TagList ile iletişime geçin. Telefon, e-posta ve canlı destek seçenekleri.' }
  ]
})

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)

const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    // Here you would typically send the form data to your backend
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated API call
    
    // Show success message
    alert('Mesajınız başarıyla gönderildi! 24 saat içinde size geri dönüş yapacağız.')
    
    // Reset form
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    alert('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
