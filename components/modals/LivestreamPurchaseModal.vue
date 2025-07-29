<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" @click="$emit('close')">
    <div 
      class="bg-white rounded-2xl w-full max-w-md mx-4 p-6 transform transition-all duration-300"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900">Satın Al</h3>
        <button 
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Icon name="mdi:close" class="w-5 h-5" />
        </button>
      </div>

      <!-- Product Info -->
      <div class="mb-6">
        <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <img 
            :src="product.image" 
            :alt="product.name"
            class="w-20 h-20 object-cover rounded-lg"
          >
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 mb-2">{{ product.name }}</h4>
            <div class="flex items-center space-x-2">
              <span class="text-2xl font-bold text-green-600">{{ formatPrice(product.price) }}</span>
              <span v-if="product.originalPrice" class="text-gray-500 line-through text-sm">
                {{ formatPrice(product.originalPrice) }}
              </span>
            </div>
            <div class="flex items-center space-x-4 mt-2">
              <span class="text-orange-600 text-sm">{{ product.stock }} adet kaldı</span>
              <span v-if="hasDiscount" class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                %{{ discountPercentage }} İndirim
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quantity Selector -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Adet</label>
        <div class="flex items-center space-x-3">
          <button
            @click="quantity = Math.max(1, quantity - 1)"
            :disabled="quantity <= 1"
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:minus" class="w-5 h-5" />
          </button>
          <span class="text-xl font-semibold text-gray-900 min-w-[3rem] text-center">{{ quantity }}</span>
          <button
            @click="quantity = Math.min(product.stock, quantity + 1)"
            :disabled="quantity >= product.stock"
            class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="mdi:plus" class="w-5 h-5" />
          </button>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Maksimum {{ product.stock }} adet sipariş verebilirsiniz
        </div>
      </div>

      <!-- Live Exclusive Offer -->
      <div class="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-2 mb-2">
          <Icon name="mdi:lightning-bolt" class="w-5 h-5 text-red-600" />
          <span class="font-semibold text-red-700">Canlı Yayın Özel Fiyatı</span>
        </div>
        <div class="text-sm text-red-600">
          Bu fiyat sadece canlı yayında geçerlidir. Kaçırmayın!
        </div>
        <div v-if="timeRemaining > 0" class="text-xs text-orange-600 font-mono mt-1">
          {{ formatTimeRemaining() }} süre kaldı
        </div>
      </div>

      <!-- Delivery Options -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Teslimat Seçeneği</label>
        <div class="space-y-2">
          <label 
            v-for="option in deliveryOptions"
            :key="option.id"
            class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'border-blue-500 bg-blue-50': selectedDelivery === option.id }"
          >
            <input 
              v-model="selectedDelivery" 
              :value="option.id" 
              type="radio" 
              class="text-blue-600 focus:ring-blue-500"
            >
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ option.name }}</div>
              <div class="text-sm text-gray-600">{{ option.description }}</div>
              <div class="text-sm font-semibold text-green-600">{{ option.price === 0 ? 'Ücretsiz' : formatPrice(option.price) }}</div>
            </div>
            <div class="text-sm text-gray-500">{{ option.duration }}</div>
          </label>
        </div>
      </div>

      <!-- Price Summary -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Ürün Fiyatı</span>
            <span class="font-medium">{{ formatPrice(product.price * quantity) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Kargo</span>
            <span class="font-medium text-green-600">
              {{ selectedDeliveryOption?.price === 0 ? 'Ücretsiz' : formatPrice(selectedDeliveryOption?.price || 0) }}
            </span>
          </div>
          <div v-if="hasDiscount" class="flex justify-between text-red-600">
            <span>Canlı Yayın İndirimi</span>
            <span>-{{ formatPrice(totalDiscount) }}</span>
          </div>
          <hr class="my-2">
          <div class="flex justify-between text-lg font-bold">
            <span>Toplam</span>
            <span class="text-green-600">{{ formatPrice(totalPrice) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-3">Ödeme Yöntemi</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="method in paymentMethods"
            :key="method.id"
            @click="selectedPayment = method.id"
            :class="[
              'p-3 border-2 rounded-lg transition-colors text-center',
              selectedPayment === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <Icon :name="method.icon" class="w-6 h-6 mx-auto mb-1" />
            <div class="text-sm font-medium">{{ method.name }}</div>
          </button>
        </div>
      </div>

      <!-- Purchase Actions -->
      <div class="flex space-x-3">
        <button
          @click="$emit('close')"
          class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          İptal
        </button>
        <button
          @click="confirmPurchase"
          :disabled="!selectedDelivery || !selectedPayment || isPurchasing"
          class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="isPurchasing" name="mdi:loading" class="w-5 h-5 inline mr-2 animate-spin" />
          <Icon v-else name="mdi:cart-check" class="w-5 h-5 inline mr-2" />
          <span v-if="isPurchasing">İşlem Yapılıyor...</span>
          <span v-else>{{ formatPrice(totalPrice) }} Öde</span>
        </button>
      </div>

      <!-- Security Notice -->
      <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center space-x-2 text-green-700">
          <Icon name="mdi:shield-check" class="w-4 h-4" />
          <span class="text-xs">Güvenli ödeme ile korumalısınız. 14 gün iade garantisi.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props & Emits
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm-purchase'])

// Reactive data
const quantity = ref(1)
const selectedDelivery = ref('standard')
const selectedPayment = ref('card')
const isPurchasing = ref(false)
const timeRemaining = ref(15 * 60) // 15 minutes in seconds

// Delivery options
const deliveryOptions = [
  {
    id: 'standard',
    name: 'Standart Kargo',
    description: 'Ücretsiz kargo',
    price: 0,
    duration: '2-3 gün'
  },
  {
    id: 'express',
    name: 'Hızlı Kargo',
    description: 'Aynı gün teslimat',
    price: 15,
    duration: '3-6 saat'
  }
]

// Payment methods
const paymentMethods = [
  {
    id: 'card',
    name: 'Kredi Kartı',
    icon: 'mdi:credit-card'
  },
  {
    id: 'wallet',
    name: 'TagList Cüzdan',
    icon: 'mdi:wallet'
  }
]

// Computed values
const hasDiscount = computed(() => {
  return props.product.originalPrice && props.product.originalPrice > props.product.price
})

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(((props.product.originalPrice - props.product.price) / props.product.originalPrice) * 100)
})

const totalDiscount = computed(() => {
  if (!hasDiscount.value) return 0
  return (props.product.originalPrice - props.product.price) * quantity.value
})

const selectedDeliveryOption = computed(() => {
  return deliveryOptions.find(opt => opt.id === selectedDelivery.value)
})

const totalPrice = computed(() => {
  const productTotal = props.product.price * quantity.value
  const deliveryPrice = selectedDeliveryOption.value?.price || 0
  return productTotal + deliveryPrice
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price || 0) + ' TL'
}

const formatTimeRemaining = () => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const confirmPurchase = async () => {
  if (!selectedDelivery.value || !selectedPayment.value || isPurchasing.value) return
  
  isPurchasing.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const purchaseData = {
      productId: props.product.id,
      quantity: quantity.value,
      totalPrice: totalPrice.value,
      deliveryOption: selectedDeliveryOption.value,
      paymentMethod: selectedPayment.value,
      timestamp: new Date()
    }
    
    emit('confirm-purchase', purchaseData)
  } catch (error) {
    console.error('Purchase failed:', error)
    // Handle error
  } finally {
    isPurchasing.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Countdown timer for live offer
  const timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
  
  onUnmounted(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped>
/* Custom radio button styling */
input[type="radio"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

input[type="radio"]:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Animate the security badge */
.bg-green-50 {
  animation: subtle-pulse 2s infinite;
}

@keyframes subtle-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}
</style>
