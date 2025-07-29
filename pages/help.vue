<template>
  <NuxtLayout>
    <div class="bg-gray-50">
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-4xl font-bold mb-4">🎯 Yardım Merkezi</h1>
          <p class="text-xl opacity-90">Size nasıl yardımcı olabiliriz?</p>
          
          <!-- Quick Search -->
          <div class="mt-8 max-w-2xl mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Aradığınız konuyu yazın..."
              class="w-full px-6 py-4 pl-12 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Popüler Konular</h2>
        <button 
          @click="scrollToPopularTopics"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          📋 Popüler Konular
        </button>
      </div>
      <div id="popular-topics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="topic in popularTopics"
          :key="topic.id"
          @click="selectTopic(topic)"
          class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-lg" :class="topic.bgColor">
              <span class="text-2xl">{{ topic.icon }}</span>
            </div>
            <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {{ topic.title }}
            </h3>
            <p class="text-sm text-gray-500 mt-2">{{ topic.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Sık Sorulan Sorular</h2>
        <div class="max-w-4xl mx-auto">
          <div
            v-for="(faq, index) in filteredFAQs"
            :key="index"
            class="border border-gray-200 rounded-lg mb-4"
          >
            <button
              @click="toggleFAQ(index)"
              class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <span class="font-semibold text-gray-900">{{ faq.question }}</span>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-5 h-5 text-gray-500 transition-transform"
                :class="{ 'rotate-180': faq.isOpen }"
              />
            </button>
            <div v-if="faq.isOpen" class="px-6 pb-4">
              <p class="text-gray-600">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Options -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center mb-12 text-gray-900">İletişim Seçenekleri</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-lg shadow-sm text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">💬</span>
          </div>
          <h3 class="text-xl font-bold mb-4">Canlı Destek</h3>
          <p class="text-gray-600 mb-6">7/24 canlı destek hizmetimizle anında yardım alın</p>
          <button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Canlı Desteği Başlat
          </button>
        </div>
        <div class="bg-white p-8 rounded-lg shadow-sm text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📧</span>
          </div>
          <h3 class="text-xl font-bold mb-4">E-posta Desteği</h3>
          <p class="text-gray-600 mb-6">24 saat içinde yanıtlıyoruz</p>
          <button class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            E-posta Gönder
          </button>
        </div>
        <div class="bg-white p-8 rounded-lg shadow-sm text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📞</span>
          </div>
          <h3 class="text-xl font-bold mb-4">Telefon Desteği</h3>
          <p class="text-gray-600 mb-6">Hafta içi 09:00 - 18:00</p>
          <button class="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            0850 123 45 67
          </button>
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed } from 'vue'

useHead({
  title: 'Yardım Merkezi - TagList',
  meta: [
    { name: 'description', content: 'TagList yardım merkezi. Sık sorulan sorular ve destek seçenekleri.' }
  ]
})

const searchQuery = ref('')

const popularTopics = ref([
  {
    id: 1,
    title: 'İlan Verme',
    description: 'Nasıl ilan verebilirim?',
    icon: '📝',
    bgColor: 'bg-blue-100'
  },
  {
    id: 2,
    title: 'Ödeme İşlemleri',
    description: 'Güvenli ödeme seçenekleri',
    icon: '💳',
    bgColor: 'bg-green-100'
  },
  {
    id: 3,
    title: 'Hesap Yönetimi',
    description: 'Hesap ayarları ve güvenlik',
    icon: '👤',
    bgColor: 'bg-purple-100'
  },
  {
    id: 4,
    title: 'Teknik Sorunlar',
    description: 'Site ve uygulama sorunları',
    icon: '⚙️',
    bgColor: 'bg-orange-100'
  }
])

const faqs = ref([
  {
    question: 'TagList üyeliği ücretsiz mi?',
    answer: 'Evet, TagList üyeliği tamamen ücretsizdir. İlan verme ve satın alma işlemleri için herhangi bir üyelik ücreti alınmaz.',
    isOpen: false
  },
  {
    question: 'İlan nasıl verebilirim?',
    answer: 'Giriş yaptıktan sonra "Ürün Sat" butonuna tıklayın. Ürününüzün fotoğraflarını yükleyin, bilgilerini girin ve ilanınızı yayınlayın.',
    isOpen: false
  },
  {
    question: 'Ödeme güvenli mi?',
    answer: 'Evet, tüm ödeme işlemleri SSL şifreleme ile korunur. Güvenli ödeme yöntemlerini kullanmanızı öneriyoruz.',
    isOpen: false
  },
  {
    question: 'İlanım neden yayınlanmadı?',
    answer: 'İlanınız moderasyon sürecindedir. Yasalara ve topluluk kurallarına uygun ilanlar 24 saat içinde yayınlanır.',
    isOpen: false
  },
  {
    question: 'Mesajlarıma nasıl erişebilirim?',
    answer: 'Üst menüdeki "Mesajlar" bölümünden tüm alıcı ve satıcılarla olan konuşmalarınızı görebilirsiniz.',
    isOpen: false
  },
  {
    question: 'Hesabımı nasıl silebilirim?',
    answer: 'Ayarlar sayfasından "Hesabı Sil" seçeneğini kullanabilirsiniz. Bu işlem geri alınamaz.',
    isOpen: false
  }
])

const filteredFAQs = computed(() => {
  if (!searchQuery.value) return faqs.value
  
  return faqs.value.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const toggleFAQ = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}

const selectTopic = (topic) => {
  // Navigate to specific topic or open chat with topic
  console.log('Selected topic:', topic)
}

const scrollToPopularTopics = () => {
  const element = document.getElementById('popular-topics')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
