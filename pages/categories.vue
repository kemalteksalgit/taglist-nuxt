<template>
  <NuxtLayout>
    <div class="bg-gray-50">
      <!-- Hero Section -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900">Kategoriler</h1>
            <p class="mt-2 text-gray-600">İhtiyacınız olan her şeyi kategoriler halinde keşfedin</p>
          </div>
        
        <!-- Search Bar -->
        <div class="mt-8 max-w-2xl mx-auto">
          <div class="relative">
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Kategori ara..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          @click="goToCategory(category.slug)"
          class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-lg" :class="category.bgColor">
              <Icon :name="category.icon" class="w-6 h-6" :class="category.iconColor" />
            </div>
            <h3 class="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {{ category.name }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">{{ category.count }} ilan</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Searches -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white rounded-lg p-8 shadow-sm">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Popüler Aramalar</h2>
        <div class="flex flex-wrap gap-3">
          <span
            v-for="search in popularSearches"
            :key="search"
            @click="searchForTerm(search)"
            class="px-4 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm cursor-pointer transition-colors"
          >
            {{ search }}
          </span>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-sm text-center">
          <div class="text-3xl font-bold text-blue-600">15,000+</div>
          <div class="text-gray-600 mt-1">Aktif İlan</div>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-sm text-center">
          <div class="text-3xl font-bold text-green-600">50,000+</div>
          <div class="text-gray-600 mt-1">Kayıtlı Kullanıcı</div>
        </div>
        <div class="bg-white rounded-lg p-6 shadow-sm text-center">
          <div class="text-3xl font-bold text-purple-600">25</div>
          <div class="text-gray-600 mt-1">Ana Kategori</div>
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed } from 'vue'

// Meta tags for SEO
useHead({
  title: 'Kategoriler - TagList',
  meta: [
    { name: 'description', content: 'TagList kategorilerini keşfedin. İhtiyacınız olan her şeyi kategoriler halinde bulun.' }
  ]
})

// Reactive data
const searchQuery = ref('')

const categories = ref([
  { id: 1, name: 'Elektronik', slug: 'elektronik', count: 2500, icon: 'heroicons:computer-desktop', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 2, name: 'Moda & Giyim', slug: 'moda-giyim', count: 3200, icon: 'heroicons:user', bgColor: 'bg-pink-100', iconColor: 'text-pink-600' },
  { id: 3, name: 'Ev & Yaşam', slug: 'ev-yasam', count: 1800, icon: 'heroicons:home', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  { id: 4, name: 'Otomobil', slug: 'otomobil', count: 950, icon: 'heroicons:truck', bgColor: 'bg-red-100', iconColor: 'text-red-600' },
  { id: 5, name: 'Spor & Outdoor', slug: 'spor-outdoor', count: 720, icon: 'heroicons:trophy', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  { id: 6, name: 'Kitap & Dergi', slug: 'kitap-dergi', count: 1100, icon: 'heroicons:book-open', bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { id: 7, name: 'Müzik & Enstrüman', slug: 'muzik-enstruman', count: 450, icon: 'heroicons:musical-note', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: 8, name: 'Oyuncak', slug: 'oyuncak', count: 890, icon: 'heroicons:puzzle-piece', bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
  { id: 9, name: 'Saat & Aksesuar', slug: 'saat-aksesuar', count: 650, icon: 'heroicons:clock', bgColor: 'bg-teal-100', iconColor: 'text-teal-600' },
  { id: 10, name: 'Bahçe & Yapı Market', slug: 'bahce-yapi', count: 420, icon: 'heroicons:wrench-screwdriver', bgColor: 'bg-lime-100', iconColor: 'text-lime-600' },
  { id: 11, name: 'Sanat & Antika', slug: 'sanat-antika', count: 280, icon: 'heroicons:paint-brush', bgColor: 'bg-rose-100', iconColor: 'text-rose-600' },
  { id: 12, name: 'Hobi & Zanaat', slug: 'hobi-zanaat', count: 360, icon: 'heroicons:scissors', bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600' }
])

const popularSearches = ref([
  'iPhone', 'MacBook', 'PlayStation', 'Ayakkabı', 'Çanta', 
  'Koltuk', 'Masa', 'Araba', 'Bisiklet', 'Kitap'
])

// Computed properties
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  return categories.value.filter(category =>
    category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const goToCategory = (slug) => {
  navigateTo(`/category/${slug}`)
}

const searchForTerm = (term) => {
  navigateTo(`/search?q=${encodeURIComponent(term)}`)
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
