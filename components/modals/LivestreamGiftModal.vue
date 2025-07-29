<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50" @click="$emit('close')">
    <div 
      class="bg-white rounded-t-2xl w-full max-w-md mx-4 mb-0 p-6 transform transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900">Hediye Gönder</h3>
        <button 
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Icon name="mdi:close" class="w-5 h-5" />
        </button>
      </div>

      <!-- Seller Info -->
      <div class="flex items-center space-x-3 mb-6 p-3 bg-blue-50 rounded-lg">
        <img 
          :src="seller.avatar" 
          :alt="seller.name"
          class="w-12 h-12 rounded-full"
        >
        <div>
          <div class="font-semibold text-gray-900">{{ seller.name }}</div>
          <div class="text-sm text-gray-600">Canlı yayında</div>
        </div>
      </div>

      <!-- Gift Categories -->
      <div class="mb-4">
        <div class="flex space-x-2 mb-4">
          <button
            v-for="category in giftCategories"
            :key="category.id"
            @click="activeCategory = category.id"
            :class="[
              'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
              activeCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Gifts Grid -->
      <div class="grid grid-cols-3 gap-3 mb-6 max-h-64 overflow-y-auto">
        <div
          v-for="gift in filteredGifts"
          :key="gift.id"
          @click="selectGift(gift)"
          :class="[
            'border-2 rounded-lg p-3 cursor-pointer transition-all text-center',
            selectedGift?.id === gift.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          ]"
        >
          <div class="text-3xl mb-2">{{ gift.emoji }}</div>
          <div class="text-sm font-medium text-gray-900">{{ gift.name }}</div>
          <div class="text-xs text-gray-600">{{ formatPrice(gift.price) }}</div>
        </div>
      </div>

      <!-- Selected Gift Info -->
      <div v-if="selectedGift" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-3">
          <div class="text-4xl">{{ selectedGift.emoji }}</div>
          <div class="flex-1">
            <div class="font-semibold text-gray-900">{{ selectedGift.name }}</div>
            <div class="text-sm text-gray-600">{{ selectedGift.description }}</div>
            <div class="text-lg font-bold text-blue-600 mt-1">{{ formatPrice(selectedGift.price) }}</div>
          </div>
        </div>
      </div>

      <!-- Quantity Selector -->
      <div v-if="selectedGift" class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Adet</label>
        <div class="flex items-center space-x-3">
          <button
            @click="quantity = Math.max(1, quantity - 1)"
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Icon name="mdi:minus" class="w-5 h-5" />
          </button>
          <span class="text-xl font-semibold text-gray-900 min-w-[2rem] text-center">{{ quantity }}</span>
          <button
            @click="quantity = Math.min(99, quantity + 1)"
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Icon name="mdi:plus" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Total & Send Button -->
      <div v-if="selectedGift" class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span class="font-medium text-gray-900">Toplam Tutar</span>
          <span class="text-xl font-bold text-blue-600">{{ formatPrice(selectedGift.price * quantity) }}</span>
        </div>

        <button
          @click="sendGift"
          :disabled="!selectedGift"
          class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="mdi:gift" class="w-5 h-5 inline mr-2" />
          Hediye Gönder
        </button>
      </div>

      <!-- No Selection State -->
      <div v-else class="text-center py-8 text-gray-500">
        <Icon name="mdi:gift-outline" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Göndermek istediğiniz hediyeyi seçin</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props & Emits
const props = defineProps({
  seller: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'send-gift'])

// Reactive data
const activeCategory = ref('popular')
const selectedGift = ref(null)
const quantity = ref(1)

// Gift categories
const giftCategories = [
  { id: 'popular', name: 'Popüler' },
  { id: 'premium', name: 'Premium' },
  { id: 'special', name: 'Özel' }
]

// Available gifts
const gifts = [
  // Popular gifts
  { 
    id: 1, 
    name: 'Kalp', 
    emoji: '❤️', 
    price: 5, 
    category: 'popular',
    description: 'Sevginizi gösterin'
  },
  { 
    id: 2, 
    name: 'Gül', 
    emoji: '🌹', 
    price: 10, 
    category: 'popular',
    description: 'Güzel bir gül hediyesi'
  },
  { 
    id: 3, 
    name: 'Yıldız', 
    emoji: '⭐', 
    price: 15, 
    category: 'popular',
    description: 'Parlak bir yıldız'
  },
  { 
    id: 4, 
    name: 'Alkış', 
    emoji: '👏', 
    price: 8, 
    category: 'popular',
    description: 'Harika performans!'
  },
  { 
    id: 5, 
    name: 'Ateş', 
    emoji: '🔥', 
    price: 12, 
    category: 'popular',
    description: 'Çok ateşli!'
  },
  { 
    id: 6, 
    name: 'Thumbs Up', 
    emoji: '👍', 
    price: 7, 
    category: 'popular',
    description: 'Süper!'
  },

  // Premium gifts
  { 
    id: 7, 
    name: 'Elmas', 
    emoji: '💎', 
    price: 100, 
    category: 'premium',
    description: 'Değerli elmas hediyesi'
  },
  { 
    id: 8, 
    name: 'Taç', 
    emoji: '👑', 
    price: 150, 
    category: 'premium',
    description: 'Kraliyet tacı'
  },
  { 
    id: 9, 
    name: 'Roket', 
    emoji: '🚀', 
    price: 200, 
    category: 'premium',
    description: 'Uzaya doğru!'
  },
  { 
    id: 10, 
    name: 'Şampanya', 
    emoji: '🍾', 
    price: 75, 
    category: 'premium',
    description: 'Kutlama zamanı'
  },

  // Special gifts
  { 
    id: 11, 
    name: 'Unicorn', 
    emoji: '🦄', 
    price: 300, 
    category: 'special',
    description: 'Efsanevi unicorn'
  },
  { 
    id: 12, 
    name: 'Lüks Araba', 
    emoji: '🏎️', 
    price: 500, 
    category: 'special',
    description: 'Lüks spor araba'
  },
  { 
    id: 13, 
    name: 'Yat', 
    emoji: '🛥️', 
    price: 1000, 
    category: 'special',
    description: 'Lüks yat hediyesi'
  }
]

// Computed
const filteredGifts = computed(() => {
  return gifts.filter(gift => gift.category === activeCategory.value)
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
}

const selectGift = (gift) => {
  selectedGift.value = gift
  quantity.value = 1
}

const sendGift = () => {
  if (!selectedGift.value) return
  
  const giftData = {
    ...selectedGift.value,
    quantity: quantity.value,
    totalPrice: selectedGift.value.price * quantity.value,
    recipient: props.seller
  }
  
  emit('send-gift', giftData)
}
</script>

<style scoped>
/* Custom scrollbar for gifts grid */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
