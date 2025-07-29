<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">🛡️ Güvenli Alışveriş</h1>
        <p class="text-xl opacity-90">TagList'te güvenliğiniz bizim önceliğimiz</p>
      </div>
    </div>

    <!-- Security Features -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Güvenlik Önlemlerimiz</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-sm text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🔐</span>
          </div>
          <h3 class="text-xl font-bold mb-4">SSL Şifreleme</h3>
          <p class="text-gray-600">Tüm verileriniz 256-bit SSL şifreleme ile korunur</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">✅</span>
          </div>
          <h3 class="text-xl font-bold mb-4">Kimlik Doğrulama</h3>
          <p class="text-gray-600">Tüm kullanıcılar kimlik doğrulama sürecinden geçer</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm text-center">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🚨</span>
          </div>
          <h3 class="text-xl font-bold mb-4">24/7 Moderasyon</h3>
          <p class="text-gray-600">Platform sürekli izlenir ve şüpheli aktiviteler engellenir</p>
        </div>
      </div>
    </div>

    <!-- Safety Guidelines -->
    <div class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Güvenlik Kuralları</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- For Sellers -->
          <div>
            <h3 class="text-2xl font-bold mb-6 text-blue-600">Satıcılar İçin</h3>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Gerçek Fotoğraflar Kullanın</h4>
                  <p class="text-gray-600">Ürününüzün gerçek fotoğraflarını yükleyin</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Doğru Bilgi Verin</h4>
                  <p class="text-gray-600">Ürün açıklamalarında dürüst olun</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Güvenli Buluşma</h4>
                  <p class="text-gray-600">Halka açık yerlerde buluşun</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Platform Üzerinden İletişim</h4>
                  <p class="text-gray-600">TagList mesajlaşma sistemini kullanın</p>
                </div>
              </div>
            </div>
          </div>

          <!-- For Buyers -->
          <div>
            <h3 class="text-2xl font-bold mb-6 text-purple-600">Alıcılar İçin</h3>
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Ürünü İnceleyin</h4>
                  <p class="text-gray-600">Satın almadan önce ürünü detaylı inceleyin</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Satıcı Profilini Kontrol Edin</h4>
                  <p class="text-gray-600">Satıcının geçmiş yorumlarını okuyun</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Güvenli Ödeme</h4>
                  <p class="text-gray-600">Güvenilir ödeme yöntemlerini tercih edin</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <span class="text-green-500 text-xl">✓</span>
                <div>
                  <h4 class="font-semibold">Şüpheli Durumları Bildirin</h4>
                  <p class="text-gray-600">Anormal durumları hemen bildirin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Section -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h3 class="text-2xl font-bold text-red-800 mb-4">Şüpheli Durum mu?</h3>
        <p class="text-red-700 mb-6">
          Dolandırıcılık, sahte ürün veya şüpheli davranış gözlemlediyseniz hemen bildirin.
        </p>
        <button class="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
          🚨 Şikayet Et
        </button>
      </div>
    </div>

    <!-- Emergency Contact -->
    <div class="bg-gray-800 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="text-2xl font-bold mb-4">Acil Durum İletişim</h3>
        <p class="text-gray-300 mb-6">7/24 güvenlik ekibimizle iletişime geçebilirsiniz</p>
        <div class="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
          <div class="flex items-center space-x-2">
            <span>📞</span>
            <span>0850 123 45 67</span>
          </div>
          <div class="flex items-center space-x-2">
            <span>📧</span>
            <span>guvenlik@taglist.com</span>
          </div>
          <div class="flex items-center space-x-2">
            <span>💬</span>
            <span>Canlı Destek (24/7)</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
useHead({
  title: 'Güvenli Alışveriş - TagList',
  meta: [
    { name: 'description', content: 'TagList güvenlik önlemleri ve güvenli alışveriş rehberi.' }
  ]
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
