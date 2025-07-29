<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">Nasıl Çalışır?</h1>
        <p class="text-xl opacity-90">TagList'te alım-satım işlemleri çok kolay!</p>
      </div>
    </div>

    <!-- Steps Section -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Step 1 -->
        <div class="text-center">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl">📝</span>
          </div>
          <h3 class="text-xl font-bold mb-4 text-gray-900">1. Kayıt Ol</h3>
          <p class="text-gray-600">
            Ücretsiz hesap oluştur ve TagList ailesine katıl. Email doğrulaması ile güvenliğini sağla.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="text-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl">📸</span>
          </div>
          <h3 class="text-xl font-bold mb-4 text-gray-900">2. İlan Ver</h3>
          <p class="text-gray-600">
            Satmak istediğin ürünün fotoğraflarını çek, bilgilerini gir ve ilanını yayınla.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="text-center">
          <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl">💬</span>
          </div>
          <h3 class="text-xl font-bold mb-4 text-gray-900">3. İletişim Kur</h3>
          <p class="text-gray-600">
            Alıcılarla güvenli mesajlaşma sistemi üzerinden iletişim kur ve pazarlık yap.
          </p>
        </div>

        <!-- Step 4 -->
        <div class="text-center">
          <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl">🤝</span>
          </div>
          <h3 class="text-xl font-bold mb-4 text-gray-900">4. Satış Tamamla</h3>
          <p class="text-gray-600">
            Anlaştığın fiyat ve teslimat şekliyle satışını tamamla. Güvenli ödeme seçenekleri mevcut.
          </p>
        </div>
      </div>
    </div>

    <!-- For Buyers Section -->
    <div class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Alıcılar İçin</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🔍</span>
            </div>
            <h3 class="text-lg font-bold mb-2">Ürün Ara</h3>
            <p class="text-gray-600">İstediğin ürünü kategoriler veya arama ile bul</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">❤️</span>
            </div>
            <h3 class="text-lg font-bold mb-2">Favorile</h3>
            <p class="text-gray-600">Beğendiğin ürünleri favorilerine ekle</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🛒</span>
            </div>
            <h3 class="text-lg font-bold mb-2">Güvenle Al</h3>
            <p class="text-gray-600">Güvenli ödeme sistemi ile satın al</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Safety Tips -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Güvenlik İpuçları</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-xl font-bold mb-4 text-green-600">✅ Yapılması Gerekenler</h3>
          <ul class="space-y-2 text-gray-600">
            <li>• Ürünü teslim almadan önce kontrol et</li>
            <li>• Güvenilir ödeme yöntemlerini kullan</li>
            <li>• Satıcının profilini ve yorumlarını incele</li>
            <li>• Buluşma için güvenli mekanları tercih et</li>
            <li>• TagList mesajlaşma sistemini kullan</li>
          </ul>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-xl font-bold mb-4 text-red-600">❌ Yapılmaması Gerekenler</h3>
          <ul class="space-y-2 text-gray-600">
            <li>• Ürünü görmeden ödeme yapma</li>
            <li>• Şüpheli linklere tıklama</li>
            <li>• Kişisel bilgilerini paylaşma</li>
            <li>• Platform dışı iletişim kurma</li>
            <li>• Çok ucuz fiyatlara aldanma</li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
useHead({
  title: 'Nasıl Çalışır - TagList',
  meta: [
    { name: 'description', content: 'TagList nasıl çalışır? Alım-satım işlemlerinin adımlarını öğrenin.' }
  ]
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
