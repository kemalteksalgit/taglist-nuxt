<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <!-- Hero Section -->
      <section class="relative py-20 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div class="relative max-w-6xl mx-auto px-4 text-center">
          <div class="mb-8">
            <span class="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
              <div class="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
              CANLI YAYIN
            </span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Türkiye'nin İlk<br>
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Canlı Yayın
            </span><br>
            E-ticaret Platformu
          </h1>
          
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Tüm alışveriş ve açık artırmalar <strong>canlı yayında!</strong><br>
            Satıcılarla anında sohbet et, ürünleri canlı gör, gerçek zamanlı teklif ver.
          </p>
          
          <!-- Live Stats -->
          <div class="flex justify-center items-center gap-8 mb-10 text-sm md:text-base">
            <div class="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span class="font-semibold text-gray-700">{{ liveViewers.toLocaleString() }} canlı izleyici</span>
            </div>
            <div class="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span class="font-semibold text-gray-700">{{ activeBids }} aktif teklif</span>
            </div>
            <div class="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <div class="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
              <span class="font-semibold text-gray-700">{{ liveStreamers }} canlı satıcı</span>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="joinLiveStream" class="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105">
              <div class="w-3 h-3 bg-white rounded-full mr-3 animate-ping inline-block"></div>
              Canlı Yayına Katıl
            </button>
            <NuxtLink to="/register" class="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105">
              Ücretsiz Üye Ol
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-800 mb-4">Nasıl Çalışır?</h2>
            <p class="text-xl text-gray-600">5 basit adımda canlı alışveriş deneyimi</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div class="text-center group" v-for="(step, index) in howItWorksSteps" :key="index">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span class="text-white font-bold text-xl">{{ index + 1 }}</span>
              </div>
              <h3 class="font-semibold text-gray-800 mb-2">{{ step.title }}</h3>
              <p class="text-sm text-gray-600">{{ step.description }}</p>
            </div>
          </div>
          
          <div class="text-center mt-12">
            <button @click="showHowItWorks" class="text-blue-600 hover:text-blue-700 font-semibold">
              Detaylı Rehberi İzle →
            </button>
          </div>
        </div>
      </section>

      <!-- Platform Differences -->
      <section class="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-800 mb-4">TagList Farkı</h2>
            <p class="text-xl text-gray-600">Geleneksel e-ticaretten çok daha fazlası</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(feature, index) in platformFeatures" :key="index" class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <span class="text-3xl">{{ feature.icon }}</span>
              </div>
              <h3 class="text-2xl font-semibold text-gray-800 mb-4">{{ feature.title }}</h3>
              <p class="text-gray-600 leading-relaxed mb-6">{{ feature.description }}</p>
              <div class="text-sm text-blue-600 font-semibold">{{ feature.benefit }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Demo Preview -->
      <section class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-800 mb-4">Canlı Yayın Önizlemesi</h2>
            <p class="text-xl text-gray-600">Şu anda aktif olan canlı yayınlara göz atın</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(stream, index) in liveStreams" :key="index" class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
              <div class="relative">
                <div class="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div class="text-center text-white">
                    <div class="text-4xl mb-2">{{ stream.productIcon }}</div>
                    <div class="font-semibold">{{ stream.productName }}</div>
                  </div>
                </div>
                <div class="absolute top-3 left-3">
                  <span class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                    <div class="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
                    CANLI
                  </span>
                </div>
                <div class="absolute top-3 right-3">
                  <span class="bg-black/50 text-white px-2 py-1 rounded text-xs">{{ stream.viewers }} izleyici</span>
                </div>
              </div>
              <div class="p-6 text-white">
                <h3 class="font-semibold mb-2">{{ stream.title }}</h3>
                <p class="text-2xl font-bold text-green-400 mb-3">{{ stream.price }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-300">{{ stream.seller }}</span>
                  <button class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Katıl
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-12">
            <NuxtLink to="/live" class="inline-flex items-center bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors">
              Tüm Canlı Yayınları Gör
              <span class="ml-2">📺</span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div class="max-w-4xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-800 mb-4">Sıkça Sorulan Sorular</h2>
            <p class="text-xl text-gray-600">TagList hakkında merak ettikleriniz</p>
          </div>
          
          <div class="space-y-4">
            <div v-for="(faq, index) in faqs" :key="index" class="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button 
                @click="toggleFAQ(index)"
                class="w-full px-6 py-6 text-left hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <span class="font-semibold text-gray-800">{{ faq.question }}</span>
                <span class="text-2xl text-gray-400" :class="{ 'transform rotate-180': faq.isOpen }">↓</span>
              </button>
              <div v-show="faq.isOpen" class="px-6 pb-6">
                <p class="text-gray-600 leading-relaxed">{{ faq.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-4xl font-bold mb-6">Hemen Başlayın!</h2>
          <p class="text-xl mb-10 opacity-90">
            TagList ile canlı alışverişin keyfini çıkarın. Güvenli, hızlı ve eğlenceli!
          </p>
          
          <div class="flex flex-col sm:flex-row gap-6 justify-center">
            <NuxtLink to="/register" class="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg">
              <span class="mr-2">🚀</span>
              Ücretsiz Üye Ol
            </NuxtLink>
            <NuxtLink to="/sell" class="border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
              <span class="mr-2">📺</span>
              Canlı Yayın Başlat
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup>
// SEO and Meta Tags
useSeoMeta({
  title: 'TagList - Türkiye\'nin İlk Canlı Yayın E-ticaret Platformu',
  description: 'Tüm alışveriş ve açık artırmalar canlı yayında! Satıcılarla anında sohbet et, ürünleri canlı gör, gerçek zamanlı teklif ver.',
  keywords: 'canlı yayın, e-ticaret, açık artırma, live streaming, online alışveriş, gerçek zamanlı',
  ogTitle: 'TagList - Canlı Yayın E-ticaret',
  ogDescription: 'Türkiye\'nin ilk canlı yayın odaklı e-ticaret platformu. Tüm alışverişler canlı yayında!',
  twitterCard: 'summary_large_image'
})

// Reactive data
const liveViewers = ref(2847)
const activeBids = ref(156)
const liveStreamers = ref(24)

// How it works steps
const howItWorksSteps = ref([
  {
    title: "Keşfet",
    description: "Canlı yayınları keşfet ve ilgini çeken ürünleri bul"
  },
  {
    title: "İzle",
    description: "Ürünü canlı yayında detaylıca gör ve incele"
  },
  {
    title: "Sohbet Et",
    description: "Satıcıyla anlık sohbet et, sorularını sor"
  },
  {
    title: "Teklif Ver",
    description: "Gerçek zamanlı teklif ver ve açık artırmaya katıl"
  },
  {
    title: "Satın Al",
    description: "Güvenli ödeme ile satın alımını tamamla"
  }
])

// Platform features
const platformFeatures = ref([
  {
    icon: "📺",
    title: "Canlı Yayın Alışverişi",
    description: "Ürünleri satın almadan önce canlı yayında gör, satıcıyla konuş, gerçek zamanlı sorular sor.",
    benefit: "% 90 daha güvenilir alışveriş"
  },
  {
    icon: "⚡",
    title: "Gerçek Zamanlı Açık Artırma",
    description: "Canlı teklif verme sistemi ile heyecan dolu açık artırmalara katıl, en iyi fiyatları yakala.",
    benefit: "% 40 daha uygun fiyatlar"
  },
  {
    icon: "💬",
    title: "Anında İletişim",
    description: "Satıcılarla anlık sohbet et, ürün hakkında detaylı bilgi al, pazarlık yap.",
    benefit: "% 100 şeffaf alışveriş"
  }
])

// Live streams mock data
const liveStreams = ref([
  {
    productIcon: "📱",
    productName: "iPhone 14 Pro",
    title: "iPhone 14 Pro Max 256GB",
    price: "₺45,000",
    viewers: "234",
    seller: "TechMaster"
  },
  {
    productIcon: "💻",
    productName: "MacBook Air",
    title: "MacBook Air M2 2023",
    price: "₺28,500",
    viewers: "189",
    seller: "AppleStore"
  },
  {
    productIcon: "👟",
    productName: "Nike Air Jordan",
    title: "Air Jordan 1 Retro High",
    price: "₺3,200",
    viewers: "156",
    seller: "SneakerHead"
  }
])

// FAQ data
const faqs = ref([
  {
    question: "Canlı yayın alışverişi nasıl çalışır?",
    answer: "Satıcılar ürünlerini canlı yayında tanıtır, siz de gerçek zamanlı olarak ürünü görür, sorular sorabilir ve satın alabilirsiniz. Geleneksel e-ticaretten çok daha güvenilir ve etkileşimli bir deneyim sunar.",
    isOpen: false
  },
  {
    question: "Canlı açık artırmalara nasıl katılabilirim?",
    answer: "Açık artırma sayfasından canlı yayına katılın, gerçek zamanlı olarak teklif verin. Sistem otomatik olarak en yüksek teklifi takip eder ve size bildirim gönderir.",
    isOpen: false
  },
  {
    question: "Ödeme güvenliği nasıl sağlanıyor?",
    answer: "Tüm ödemeler SSL şifreli altyapı ile korunur. Ödemeniz escrow sisteminde bekletilir ve ürünü teslim aldıktan sonra satıcıya aktarılır.",
    isOpen: false
  },
  {
    question: "Ürün iade politikası nedir?",
    answer: "Canlı yayında gördüğünüz ürün açıklamaya uygun değilse 14 gün içinde koşulsuz iade edebilirsiniz. İade masrafları tarafımızdan karşılanır.",
    isOpen: false
  },
  {
    question: "Satıcı olmak için neler gerekiyor?",
    answer: "Kimlik doğrulaması yaptırın, satacağınız ürünleri ekleyin ve canlı yayın için uygun bir ortam hazırlayın. Detaylı satıcı rehberimizi inceleyebilirsiniz.",
    isOpen: false
  }
])

// Methods
const joinLiveStream = () => {
  navigateTo('/live')
}

const showHowItWorks = () => {
  navigateTo('/how-it-works')
}

const toggleFAQ = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}

// Update live stats every 3 seconds
onMounted(() => {
  setInterval(() => {
    liveViewers.value += Math.floor(Math.random() * 10) - 5
    activeBids.value += Math.floor(Math.random() * 6) - 3
    liveStreamers.value += Math.floor(Math.random() * 4) - 2
    
    // Keep values in reasonable range
    if (liveViewers.value < 2000) liveViewers.value = 2000
    if (liveViewers.value > 5000) liveViewers.value = 5000
    if (activeBids.value < 100) activeBids.value = 100
    if (activeBids.value > 300) activeBids.value = 300
    if (liveStreamers.value < 15) liveStreamers.value = 15
    if (liveStreamers.value > 50) liveStreamers.value = 50
  }, 3000)
})
</script>
