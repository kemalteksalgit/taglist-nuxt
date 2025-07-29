<template>
  <div v-if="viewMode === 'grid'" class="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <NuxtLink :to="`/product/${product.id}`" class="block">
      <div class="relative overflow-hidden rounded-t-lg">
        <img 
          :src="product.image" 
          :alt="product.title" 
          class="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
          loading="lazy"
        >
        
        <!-- Condition Badge -->
        <div class="absolute top-2 right-2">
          <span :class="getConditionBadgeClass(product.condition)">
            {{ product.condition }}
          </span>
        </div>
        
        <!-- Discount Badge -->
        <div v-if="product.originalPrice && product.originalPrice > product.price" class="absolute top-2 left-2">
          <span class="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            %{{ Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) }} İndirim
          </span>
        </div>
        
        <!-- Favorite Button -->
        <button 
          @click.prevent="toggleFavorite"
          class="absolute bottom-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Icon 
            :name="product.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" 
            :class="['w-5 h-5', product.isFavorite ? 'text-red-500' : 'text-gray-600']" 
          />
        </button>
      </div>
      
      <div class="p-4">
        <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">{{ product.title }}</h3>
        
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-2xl font-bold text-blue-600">{{ formatPrice(product.price) }}</p>
            <p v-if="product.originalPrice && product.originalPrice > product.price" 
               class="text-sm text-gray-500 line-through">
              {{ formatPrice(product.originalPrice) }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center text-sm text-gray-500 mb-2">
          <Icon name="mdi:map-marker" class="w-4 h-4 mr-1" />
          {{ product.location }}
        </div>
        
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center text-gray-500">
            <Icon name="mdi:eye" class="w-4 h-4 mr-1" />
            {{ product.views }} görüntüleme
          </div>
          <div class="flex items-center">
            <img :src="product.seller.avatar" :alt="product.seller.name" class="w-6 h-6 rounded-full mr-2">
            <div class="flex items-center">
              <Icon name="mdi:star" class="w-4 h-4 text-yellow-500 mr-1" />
              <span class="text-gray-600">{{ product.seller.rating }}</span>
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
  
  <!-- List View -->
  <div v-else class="card hover:shadow-lg transition-all duration-300">
    <NuxtLink :to="`/product/${product.id}`" class="flex">
      <div class="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-l-lg">
        <img 
          :src="product.image" 
          :alt="product.title" 
          class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          loading="lazy"
        >
        
        <!-- Condition Badge -->
        <div class="absolute top-2 right-2">
          <span :class="getConditionBadgeClass(product.condition)">
            {{ product.condition }}
          </span>
        </div>
      </div>
      
      <div class="flex-1 p-4">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 mb-2 text-lg">{{ product.title }}</h3>
            
            <div class="flex items-center mb-2">
              <p class="text-2xl font-bold text-blue-600 mr-4">{{ formatPrice(product.price) }}</p>
              <p v-if="product.originalPrice && product.originalPrice > product.price" 
                 class="text-sm text-gray-500 line-through">
                {{ formatPrice(product.originalPrice) }}
              </p>
              <span v-if="product.originalPrice && product.originalPrice > product.price" 
                    class="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                %{{ Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) }} İndirim
              </span>
            </div>
            
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <Icon name="mdi:map-marker" class="w-4 h-4 mr-1" />
              {{ product.location }}
              <span class="mx-2">•</span>
              <Icon name="mdi:eye" class="w-4 h-4 mr-1" />
              {{ product.views }} görüntüleme
            </div>
            
            <div class="flex items-center text-sm">
              <img :src="product.seller.avatar" :alt="product.seller.name" class="w-6 h-6 rounded-full mr-2">
              <span class="text-gray-600 mr-2">{{ product.seller.name }}</span>
              <div class="flex items-center">
                <Icon name="mdi:star" class="w-4 h-4 text-yellow-500 mr-1" />
                <span class="text-gray-600">{{ product.seller.rating }}</span>
              </div>
            </div>
          </div>
          
          <button 
            @click.prevent="toggleFavorite"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4"
          >
            <Icon 
              :name="product.isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" 
              :class="['w-6 h-6', product.isFavorite ? 'text-red-500' : 'text-gray-600']" 
            />
          </button>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: number
  title: string
  price: number
  originalPrice?: number
  condition: string
  location: string
  image: string
  views: number
  isFavorite: boolean
  seller: {
    name: string
    rating: number
    avatar: string
  }
}

interface Props {
  product: Product
  viewMode: 'grid' | 'list'
}

const props = defineProps<Props>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(price)
}

const getConditionBadgeClass = (condition: string) => {
  const classes = {
    'Sıfır': 'bg-green-500 text-white',
    'Sıfıra Yakın': 'bg-green-400 text-white',
    'Çok İyi': 'bg-blue-500 text-white',
    'İyi': 'bg-blue-400 text-white',
    'Orta': 'bg-yellow-500 text-white',
    'Kötü': 'bg-red-500 text-white'
  }
  
  return `${classes[condition as keyof typeof classes] || 'bg-gray-500 text-white'} px-2 py-1 rounded text-xs font-semibold`
}

const toggleFavorite = () => {
  // In a real app, this would make an API call
  props.product.isFavorite = !props.product.isFavorite
  
  // Show toast notification
  if (props.product.isFavorite) {
    console.log('Favorilere eklendi')
  } else {
    console.log('Favorilerden çıkarıldı')
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
