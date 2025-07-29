<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Product Images and Info -->
      <section class="py-8">
        <div class="max-w-6xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              <!-- Product Images -->
              <div>
                <div class="mb-4">
                  <img
                    :src="product.images[selectedImageIndex]"
                    :alt="product.title"
                    class="w-full h-96 object-cover rounded-lg shadow-md"
                  >
                </div>
                <div class="flex space-x-2 overflow-x-auto">
                  <img
                    v-for="(image, index) in product.images"
                    :key="index"
                    :src="image"
                    :alt="`${product.title} ${index + 1}`"
                    @click="selectedImageIndex = index"
                    :class="[
                      'w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all',
                      selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    ]"
                  >
                </div>
              </div>

              <!-- Product Info -->
              <div>
                <div class="mb-4">
                  <span class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {{ product.category }}
                  </span>
                </div>
                
                <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.title }}</h1>
                
                <div class="flex items-center mb-6">
                  <span class="text-4xl font-bold text-green-600">{{ formatPrice(product.price) }}</span>
                  <span v-if="product.originalPrice" class="ml-3 text-xl text-gray-500 line-through">
                    {{ formatPrice(product.originalPrice) }}
                  </span>
                </div>

                <!-- Condition and Details -->
                <div class="mb-6">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-gray-600">Durum:</span>
                      <span class="ml-2 font-semibold" :class="getConditionColor(product.condition)">
                        {{ product.condition }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-600">Marka:</span>
                      <span class="ml-2 font-semibold">{{ product.brand }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Konum:</span>
                      <span class="ml-2 font-semibold">{{ product.location }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">İlan No:</span>
                      <span class="ml-2 font-semibold">#{{ product.id }}</span>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col space-y-3 mb-6">
                  <button class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center">
                    <span class="text-xl mr-2">💬</span>
                    Satıcıyla İletişime Geç
                  </button>
                  <div class="grid grid-cols-2 gap-3">
                    <button class="bg-blue-100 text-blue-700 py-3 px-4 rounded-lg font-semibold hover:bg-blue-200 transition-all flex items-center justify-center">
                      <span class="mr-2">❤️</span>
                      Favorilere Ekle
                    </button>
                    <button class="bg-orange-100 text-orange-700 py-3 px-4 rounded-lg font-semibold hover:bg-orange-200 transition-all flex items-center justify-center">
                      <span class="mr-2">📢</span>
                      Paylaş
                    </button>
                  </div>
                </div>

                <!-- Seller Info -->
                <div class="border-t pt-6">
                  <h3 class="text-lg font-semibold mb-4">Satıcı Bilgileri</h3>
                  <div class="flex items-center">
                    <img
                      :src="product.seller.avatar"
                      :alt="product.seller.name"
                      class="w-12 h-12 rounded-full mr-4"
                    >
                    <div>
                      <h4 class="font-semibold">{{ product.seller.name }}</h4>
                      <div class="flex items-center text-sm text-gray-600">
                        <span class="flex items-center mr-4">
                          ⭐ {{ product.seller.rating }} ({{ product.seller.reviews }} değerlendirme)
                        </span>
                        <span>📅 {{ product.seller.memberSince }} tarihinden beri üye</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Product Description -->
      <section class="py-8">
        <div class="max-w-6xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-6">Ürün Açıklaması</h2>
            <div class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ product.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Comments Section -->
      <section class="py-8">
        <div class="max-w-6xl mx-auto px-4">
          <div class="bg-white rounded-2xl shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-6">Yorumlar ({{ comments.length }})</h2>
            
            <!-- Comment Form -->
            <div class="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-semibold mb-4">Yorum Yap</h3>
              <div class="mb-4">
                <div class="flex items-center space-x-1 mb-2">
                  <span class="text-sm text-gray-600">Değerlendirme:</span>
                  <div class="flex">
                    <button
                      v-for="star in 5"
                      :key="star"
                      @click="newComment.rating = star"
                      :class="[
                        'text-2xl transition-colors',
                        star <= newComment.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                      ]"
                    >
                      ⭐
                    </button>
                  </div>
                </div>
              </div>
              <textarea
                v-model="newComment.text"
                placeholder="Yorumunuzu yazın..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              ></textarea>
              <button
                @click="submitComment"
                :disabled="!newComment.text.trim() || newComment.rating === 0"
                class="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Yorum Gönder
              </button>
            </div>

            <!-- Comments List -->
            <div class="space-y-6">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <div class="flex items-start space-x-4">
                  <img
                    :src="comment.user.avatar"
                    :alt="comment.user.name"
                    class="w-10 h-10 rounded-full"
                  >
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <h4 class="font-semibold">{{ comment.user.name }}</h4>
                      <div class="flex">
                        <span
                          v-for="star in 5"
                          :key="star"
                          :class="[
                            'text-sm',
                            star <= comment.rating ? 'text-yellow-400' : 'text-gray-300'
                          ]"
                        >
                          ⭐
                        </span>
                      </div>
                      <span class="text-sm text-gray-500">{{ formatDate(comment.date) }}</span>
                    </div>
                    <p class="text-gray-700">{{ comment.text }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Comments State -->
            <div v-if="comments.length === 0" class="text-center py-8">
              <div class="text-4xl mb-4">💬</div>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Henüz yorum yok</h3>
              <p class="text-gray-600">Bu ürün hakkında ilk yorumu siz yapın!</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section class="py-8">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-2xl font-bold mb-8">Benzer Ürünler</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="relatedProduct in relatedProducts"
              :key="relatedProduct.id"
              class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                :src="relatedProduct.image"
                :alt="relatedProduct.title"
                class="w-full h-48 object-cover"
              >
              <div class="p-4">
                <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">{{ relatedProduct.title }}</h3>
                <p class="text-green-600 font-bold text-lg">{{ formatPrice(relatedProduct.price) }}</p>
                <p class="text-sm text-gray-500">{{ relatedProduct.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'iPhone 13 Pro Max 256GB - TagList',
  description: 'iPhone 13 Pro Max 256GB Space Gray - Temiz kullanılmış, orijinal kutusu ile birlikte'
})

// Reactive data
const selectedImageIndex = ref(0)

const newComment = ref({
  rating: 0,
  text: ''
})

// Mock product data
const product = ref({
  id: 12345,
  title: 'iPhone 13 Pro Max 256GB Space Gray',
  price: 35000,
  originalPrice: 42000,
  condition: 'Çok İyi',
  brand: 'Apple',
  category: 'Elektronik > Cep Telefonu',
  location: 'İstanbul, Kadıköy',
  description: `Merhaba,

iPhone 13 Pro Max 256GB Space Gray modelini satıyorum. 

Telefon çok temiz kullanılmıştır, ekranında hiçbir çizik veya kırık yoktur. Kameralarda da herhangi bir sorun bulunmamaktadır.

Ürün özellikleri:
- 256GB dahili hafıza
- Pro kamera sistemi
- ProMotion teknolojisi
- Face ID
- 5G desteği

Kutu içeriği:
- iPhone 13 Pro Max
- Orijinal kutu
- Lightning kablo
- Şarj adaptörü
- Kullanım kılavuzu

Cihazın pil sağlığı %89'dur. Garanti süresi dolmuştur ancak Apple servisinde kontrol ettirebilirsiniz.

Takas yapmıyorum, sadece nakit satış.

İlgilenen arkadaşlar mesaj atabilir.`,
  images: [
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600'
  ],
  seller: {
    name: 'Mehmet Yılmaz',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 4.8,
    reviews: 142,
    memberSince: '2019'
  }
})

const comments = ref([
  {
    id: 1,
    user: {
      name: 'Ayşe Kaya',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
    },
    rating: 5,
    text: 'Çok güzel bir telefon, açıklamasındaki gibi gerçekten temiz. Satıcı da çok ilgili, teşekkürler!',
    date: new Date('2024-01-15')
  },
  {
    id: 2,
    user: {
      name: 'Ali Demir',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    rating: 4,
    text: 'Telefon güzel ama pil sağlığı biraz düşük. Yine de fiyatına göre makul.',
    date: new Date('2024-01-10')
  }
])

const relatedProducts = ref([
  {
    id: 1,
    title: 'iPhone 13 Pro 128GB Blue',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
    location: 'İstanbul, Beşiktaş'
  },
  {
    id: 2,
    title: 'iPhone 14 256GB Purple',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300',
    location: 'Ankara, Çankaya'
  },
  {
    id: 3,
    title: 'Samsung Galaxy S23 Ultra',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300',
    location: 'İzmir, Konak'
  },
  {
    id: 4,
    title: 'iPhone 12 Pro Max 512GB',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300',
    location: 'Bursa, Nilüfer'
  }
])

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(price)
}

const getConditionColor = (condition) => {
  const colors = {
    'Sıfır': 'text-green-600',
    'Çok İyi': 'text-blue-600',
    'İyi': 'text-yellow-600',
    'Orta': 'text-orange-600',
    'Kötü': 'text-red-600'
  }
  return colors[condition] || 'text-gray-600'
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const submitComment = () => {
  if (!newComment.value.text.trim() || newComment.value.rating === 0) return
  
  const comment = {
    id: Date.now(),
    user: {
      name: 'Siz', // In real app, this would come from auth
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    },
    rating: newComment.value.rating,
    text: newComment.value.text,
    date: new Date()
  }
  
  comments.value.unshift(comment)
  
  // Reset form
  newComment.value = {
    rating: 0,
    text: ''
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
