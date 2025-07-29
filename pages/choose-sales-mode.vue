<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Hangi Alışveriş Modunu Tercih Ediyorsunuz?
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          TagList'te 3 farklı alışveriş deneyimi var. Sizin için en uygun olanı seçin:
        </p>
      </div>

      <!-- Sales Mode Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        <!-- Classic E-Commerce -->
        <button 
          class="w-full bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-blue-500 hover:shadow-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all group"
          @click="navigateToMode('shop')"
          aria-label="Klasik mağaza alışveriş modunu seç">
          <div class="text-center">
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Klasik Mağaza</h3>
            <p class="text-gray-600 mb-6">
              Geleneksel online alışveriş. Ürünleri incele, sepete ekle, istediğin zaman satın al.
            </p>
            
            <!-- Features -->
            <div class="space-y-2 mb-6">
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Sepet fonksiyonu</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Ürün karşılaştırma</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">İstediğin zaman satın al</span>
              </div>
            </div>

            <!-- Action Text -->
            <div class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold group-hover:bg-blue-700 group-focus:bg-blue-700 transition-colors">
              Mağazaya Git
            </div>
          </div>
        </button>

        <!-- Live Commerce -->
        <button 
          class="w-full bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-purple-500 hover:shadow-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all group"
          @click="navigateToMode('live')"
          aria-label="Canlı yayın alışveriş modunu seç">
          <div class="text-center">
            <div class="text-6xl mb-4">📺</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Canlı Yayın Alışveriş</h3>
            <p class="text-gray-600 mb-6">
              Satıcılarla canlı video üzerinden sohbet et, gerçek zamanlı ürün gösterisi izle.
            </p>
            
            <!-- Features -->
            <div class="space-y-2 mb-6">
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Canlı video gösterim</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Satıcıyla sohbet</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Hızlı satın alma</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-yellow-600">
                <span>🏆</span>
                <span class="text-sm">Açık artırma mevcut</span>
              </div>
            </div>

            <!-- Action Text -->
            <div class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold group-hover:bg-purple-700 group-focus:bg-purple-700 transition-colors">
              Canlı Yayınları İzle
            </div>
          </div>
        </button>

        <!-- Product Discovery -->
        <button 
          class="w-full bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-green-500 hover:shadow-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all group"
          @click="navigateToMode('explore')"
          aria-label="Ürün keşfet modunu seç">
          <div class="text-center">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">Ürün Keşfet</h3>
            <p class="text-gray-600 mb-6">
              Kişiselleştirilmiş öneriler, trend ürünler ve özel fırsatları keşfet.
            </p>
            
            <!-- Features -->
            <div class="space-y-2 mb-6">
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Kişisel öneriler</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Trend ürünler</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Özel kampanyalar</span>
              </div>
              <div class="flex items-center justify-center space-x-2 text-green-600">
                <span>✅</span>
                <span class="text-sm">Akıllı filtreleme</span>
              </div>
            </div>

            <!-- Action Text -->
            <div class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold group-hover:bg-green-700 group-focus:bg-green-700 transition-colors">
              Ürünleri Keşfet
            </div>
          </div>
        </button>

      </div>

      <!-- User Help Section -->
      <div class="bg-blue-50 rounded-xl p-6 mb-8 text-center">
        <h3 class="text-lg font-semibold text-blue-800 mb-3">� İpucu</h3>
        <p class="text-blue-700">
          Her alışveriş modu farklı deneyimler sunar. İstediğiniz zaman modlar arasında geçiş yapabilirsiniz.
        </p>
      </div>

      <!-- Quick Navigation -->
      <div class="text-center">
        <div class="text-gray-600 mb-4">Hızlı erişim:</div>
        <div class="flex justify-center space-x-4">
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-800 font-semibold">
            Ana Sayfa
          </NuxtLink>
          <span class="text-gray-400">|</span>
          <NuxtLink to="/help" class="text-blue-600 hover:text-blue-800 font-semibold">
            Yardım
          </NuxtLink>
          <span class="text-gray-400">|</span>
          <NuxtLink to="/how-it-works" class="text-blue-600 hover:text-blue-800 font-semibold">
            Nasıl Çalışır?
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Sales Mode Chooser Page - Clean user interface for mode selection
// 
// DEVELOPER NOTES (not visible to users):
// - Enforces sales mode separation: Classic Shop, Live Commerce, Product Discovery
// - Auction features only available during live streams (handled in live.vue)
// - Each mode has dedicated pages and UI flows
// - Navigation middleware enforces mode separation rules

// SEO
useSeoMeta({
  title: 'Alışveriş Modu Seçin | TagList',
  description: 'TagList\'te 3 farklı alışveriş modu: Klasik Mağaza, Canlı Yayın Alışveriş, ve Ürün Keşfet. Sizin için en uygun modunu seçin.',
  keywords: 'satış modu, klasik mağaza, canlı yayın, açık artırma, online alışveriş',
})

// Navigation functions
const navigateToMode = (mode: string) => {
  // Navigate to selected mode
  switch (mode) {
    case 'shop':
      navigateTo('/shop')
      break
    case 'live':
      navigateTo('/live')
      break
    case 'explore':
      navigateTo('/explore')
      break
    default:
      navigateTo('/')
  }
}
</script>
