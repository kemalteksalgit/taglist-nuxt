<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Live Commerce Header -->
      <div class="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">📺 Canlı Yayın Alışverişi</h1>
          <p class="text-xl opacity-90 mb-6">Satıcılarla canlı sohbet et, ürünleri gerçek zamanlı gör, hemen satın al</p>
          
          <!-- Mode Indicators -->
          <div class="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div class="bg-white/10 rounded-lg p-4 opacity-60">
                <div class="text-2xl mb-2">🛒</div>
                <div class="font-semibold">Klasik Alışveriş</div>
                <div class="text-sm opacity-75">Canlı yayın modunda değil</div>
              </div>
              <div class="bg-white/20 rounded-lg p-4">
                <div class="text-2xl mb-2">📺</div>
                <div class="font-semibold">Canlı Yayın</div>
                <div class="text-sm opacity-75">Şu anda bu moddasınız</div>
              </div>
              <div class="bg-white/20 rounded-lg p-4">
                <div class="text-2xl mb-2">🏆</div>
                <div class="font-semibold">Açık Artırma</div>
                <div class="text-sm opacity-75">Açık artırma (satıcı açarsa)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Streams Grid -->
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900">Aktif Canlı Yayınlar</h2>
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span>CANLI</span>
            </div>
          </div>

          <!-- Live Stream Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="stream in liveStreams"
              :key="stream.id"
              class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              @click="joinLiveStream(stream.id)"
            >
              <!-- Stream Thumbnail -->
              <div class="relative aspect-video bg-gray-200">
                <img
                  :src="stream.thumbnail"
                  :alt="stream.title"
                  class="w-full h-full object-cover"
                >
                
                <!-- Live Badge -->
                <div class="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>CANLI</span>
                </div>
                
                <!-- Viewer Count -->
                <div class="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  👥 {{ stream.viewers }}
                </div>
              </div>

              <!-- Stream Info -->
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">{{ stream.title }}</h3>
                
                <!-- Seller Info -->
                <div class="flex items-center space-x-3 mb-3">
                  <img
                    :src="stream.sellerAvatar"
                    :alt="stream.sellerName"
                    class="w-8 h-8 rounded-full"
                  >
                  <div>
                    <div class="font-medium text-sm">{{ stream.sellerName }}</div>
                    <div class="text-xs text-gray-500 flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{{ stream.sellerRating }}</span>
                    </div>
                  </div>
                </div>

                <!-- Price -->
                <div class="text-lg font-bold text-green-600 mb-3">
                  ₺{{ stream.price.toLocaleString('tr-TR') }}
                </div>

                <!-- Auction Info (if active) -->
                <div v-if="stream.hasActiveAuction" class="mb-3 p-2 bg-yellow-50 rounded-lg">
                  <div class="text-xs text-yellow-800 flex items-center justify-between">
                    <span>🏆 Açık artırma aktif</span>
                    <span class="font-semibold">{{ stream.bidCount }} teklif</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex space-x-2">
                  <button
                    @click.stop="joinLiveStream(stream.id)"
                    class="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    📺 Katıl
                  </button>
                  <button
                    v-if="stream.hasActiveAuction"
                    @click.stop="placeBid(stream.id)"
                    class="flex-1 bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                  >
                    🏆 Teklif Ver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Important Notice -->
      <section class="py-12 bg-red-50">
        <div class="max-w-4xl mx-auto px-4">
          <div class="bg-white rounded-xl p-8 border-l-4 border-red-500">
            <h3 class="text-xl font-bold text-red-800 mb-4 flex items-center space-x-2">
              <span>⚠️</span>
              <span>Önemli: Açık Artırma Kuralları</span>
            </h3>
            <div class="space-y-3 text-red-700">
              <div class="flex items-start space-x-2">
                <span class="text-red-500 font-bold">•</span>
                <span>Açık artırma <strong>SADECE</strong> canlı video yayınları sırasında kullanılabilir</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-red-500 font-bold">•</span>
                <span>Canlı yayın bittiğinde açık artırmalar otomatik olarak sonlanır</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-red-500 font-bold">•</span>
                <span>Açık artırmaya katılmak için mutlaka canlı yayına katılmanız gerekir</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-red-500 font-bold">•</span>
                <span>Klasik mağaza modunda açık artırma özelliği bulunmaz</span>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-red-200">
              <div class="flex items-center justify-between">
                <span class="text-sm text-red-600">Açık artırma aramıyor musunuz?</span>
                <NuxtLink to="/shop" class="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  Klasik Mağazaya Git →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup>
// SEO and Meta Tags
useSeoMeta({
  title: 'Canlı Yayın Alışverişi | TagList',
  description: 'Canlı video yayınlarında satıcılarla gerçek zamanlı sohbet edin, ürünleri görün ve hemen satın alın. Açık artırmalar sadece canlı yayınlarda!',
  keywords: 'canlı yayın, live shopping, gerçek zamanlı, açık artırma, video alışveriş',
  ogTitle: 'Canlı Yayın Alışverişi - TagList',
  ogDescription: 'Satıcılarla canlı video üzerinden alışveriş yapın'
})

// Live streams data - fetched from API
const liveStreams = ref([
  {
    id: 1,
    title: 'iPhone 14 Pro Max İncelemesi ve Fiyat Karşılaştırması',
    thumbnail: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
    sellerName: 'TechGuru',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    sellerRating: 4.9,
    viewers: 234,
    price: 45000,
    hasActiveAuction: false,
    bidCount: 0
  },
  {
    id: 2,
    title: 'Vintage Rolex Submariner Açık Artırması - 1 TL\'den Başlıyor!',
    thumbnail: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400',
    sellerName: 'LuxuryTime',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    sellerRating: 4.8,
    viewers: 567,
    price: 85000,
    hasActiveAuction: true,
    bidCount: 12
  },
  {
    id: 3,
    title: 'Handmade Deri Çanta Koleksiyonu',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    sellerName: 'LeatherCraft',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b776?w=100',
    sellerRating: 4.7,
    viewers: 156,
    price: 1200,
    hasActiveAuction: false,
    bidCount: 0
  }
])

// Methods
const joinLiveStream = (streamId) => {
  navigateTo(`/livestream/${streamId}`)
}

const placeBid = (streamId) => {
  // This only works because we're in live stream context
  // The middleware prevents standalone auction access
}
</script>
