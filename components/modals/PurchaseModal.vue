<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="close">
    <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold">Satın Al</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon name="mdi:close" size="24" />
        </button>
      </div>
      
      <!-- Product Info -->
      <div v-if="product" class="space-y-4">
        <div class="flex items-center space-x-4">
          <img
            :src="product.image"
            :alt="product.name"
            class="w-20 h-20 object-cover rounded-lg"
          >
          <div class="flex-1">
            <h4 class="font-semibold line-clamp-2">{{ product.name }}</h4>
            <p class="text-2xl font-bold text-green-600">{{ formatPrice(product.price) }}</p>
            <p class="text-sm text-gray-600">Stok: {{ product.stock }} adet</p>
          </div>
        </div>

        <!-- Stock Warning -->
        <div v-if="product.stock <= 3 && product.stock > 0" class="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div class="flex items-center">
            <Icon name="mdi:alert" class="text-orange-600 mr-2" />
            <p class="text-sm text-orange-800">
              <span class="font-medium">Son {{ product.stock }} adet!</span> 
              Hızlı ol, stok tükenmek üzere.
            </p>
          </div>
        </div>

        <div v-else-if="product.stock === 0" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="flex items-center">
            <Icon name="mdi:close-circle" class="text-red-600 mr-2" />
            <p class="text-sm text-red-800">
              <span class="font-medium">Stokta yok!</span> 
              Ürün şu anda mevcut değil.
            </p>
          </div>
        </div>
        
        <!-- Quantity Selection -->
        <div v-if="product.stock > 0">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Adet
            <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center space-x-3">
            <button
              @click="decreaseQuantity"
              :disabled="quantity <= 1"
              class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="mdi:minus" />
            </button>
            <input
              v-model="quantity"
              type="number"
              :min="1"
              :max="product.stock"
              class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
              @input="validateQuantity"
            >
            <button
              @click="increaseQuantity"
              :disabled="quantity >= product.stock"
              class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="mdi:plus" />
            </button>
          </div>
          <p v-if="quantityError" class="mt-1 text-sm text-red-600">{{ quantityError }}</p>
        </div>

        <!-- Real-time activity -->
        <div v-if="recentActivity.length > 0" class="bg-gray-50 rounded-lg p-3">
          <p class="text-sm font-medium text-gray-700 mb-2">Son Aktivite:</p>
          <div class="space-y-1 max-h-20 overflow-y-auto">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="flex justify-between text-xs text-gray-600"
            >
              <span>{{ activity.type === 'purchase' ? '🛒' : '👀' }} {{ activity.userName }}</span>
              <span>{{ formatTime(activity.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Birim Fiyat:</span>
              <span class="text-sm">{{ formatPrice(product.price) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Adet:</span>
              <span class="text-sm">{{ quantity }}</span>
            </div>
            <div v-if="product.originalPrice && product.originalPrice > product.price" class="flex justify-between text-green-600">
              <span class="text-sm">İndirim:</span>
              <span class="text-sm">-{{ formatPrice((product.originalPrice - product.price) * quantity) }}</span>
            </div>
            <hr class="my-2">
            <div class="flex justify-between font-semibold text-lg">
              <span>Toplam:</span>
              <span class="text-green-600">{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="bg-blue-50 rounded-lg p-3">
          <div class="flex items-start">
            <Icon name="mdi:truck-delivery" class="text-blue-600 mr-2 mt-0.5" />
            <div class="text-sm text-blue-800">
              <p class="font-medium">Ücretsiz Kargo</p>
              <p>Tahmini teslimat: 1-3 iş günü</p>
            </div>
          </div>
        </div>

        <!-- Live Stream Context -->
        <div v-if="isLivestream" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="flex items-center">
            <div class="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            <p class="text-sm text-red-800">
              <span class="font-medium">Canlı Yayın Fırsatı!</span> 
              Bu fiyat sadece yayın süresince geçerli.
            </p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            @click="close"
            class="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            İptal
          </button>
          <button
            @click="submitPurchase"
            :disabled="!canPurchase || isLoading"
            class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Icon v-if="isLoading" name="mdi:loading" class="animate-spin mr-2" />
            {{ isLoading ? 'İşlem Yapılıyor...' : 'Satın Al' }}
          </button>
        </div>

        <!-- Add to Cart Option -->
        <button
          @click="addToCart"
          :disabled="product.stock === 0 || isLoading"
          class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🛒 Favorilere Ekle
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  stock: number
  category?: string
}

interface Activity {
  id: string
  type: 'purchase' | 'view'
  userName: string
  timestamp: string
}

const props = defineProps<{
  show: boolean
  product: Product | null
  isLivestream?: boolean
}>()

const emit = defineEmits<{
  close: []
  purchase: [data: {
    productId: string
    quantity: number
    totalPrice: number
  }]
  addToCart: [productId: string]
}>()

// Composables
const { purchaseProduct, getProductActivity } = useInventory()
const { handleError } = useErrorHandler()
const authStore = useAuthStore()

// State
const quantity = ref(1)
const isLoading = ref(false)
const quantityError = ref('')
const recentActivity = ref<Activity[]>([])

// Computed
const totalPrice = computed(() => {
  if (!props.product) return 0
  return props.product.price * quantity.value
})

const canPurchase = computed(() => {
  return props.product && 
         props.product.stock > 0 && 
         quantity.value > 0 && 
         quantity.value <= props.product.stock &&
         !quantityError.value
})

// Methods
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR').format(price) + ' TL'
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return 'az önce'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}d önce`
  } else {
    return `${Math.floor(diff / 3600000)}s önce`
  }
}

const increaseQuantity = () => {
  if (props.product && quantity.value < props.product.stock) {
    quantity.value++
    validateQuantity()
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
    validateQuantity()
  }
}

const validateQuantity = () => {
  quantityError.value = ''
  
  if (!props.product) return
  
  if (quantity.value < 1) {
    quantityError.value = 'Minimum 1 adet seçmelisiniz'
    quantity.value = 1
    return
  }
  
  if (quantity.value > props.product.stock) {
    quantityError.value = `Maksimum ${props.product.stock} adet mevcut`
    quantity.value = props.product.stock
    return
  }
}

const submitPurchase = async () => {
  if (!canPurchase.value || !props.product) return
  
  isLoading.value = true
  
  try {
    await purchaseProduct(props.product.id, quantity.value)
    
    emit('purchase', {
      productId: props.product.id,
      quantity: quantity.value,
      totalPrice: totalPrice.value
    })
    
    close()
  } catch (error: any) {
    handleError(error as Error, { action: 'purchase_product' })
    
    if (error?.message?.includes('insufficient_stock')) {
      quantityError.value = 'Yeterli stok yok'
      // Refresh product data
      await loadProductActivity()
    } else if (error?.message?.includes('reserved')) {
      quantityError.value = 'Ürün başka bir kullanıcı tarafından rezerve edildi'
    } else {
      // Use basic error message since $toast is not available
      console.error('Satın alma işlemi başarısız:', error)
    }
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  if (!props.product || isLoading.value) return
  
  try {
    emit('addToCart', props.product.id)
    console.log('Ürün favorilere eklendi!')
  } catch (error) {
    handleError(error as Error, { action: 'add_to_cart' })
    console.error('Favorilere eklenemedi:', error)
  }
}

const close = () => {
  emit('close')
  quantity.value = 1
  quantityError.value = ''
}

const loadProductActivity = async () => {
  if (!props.product) return
  
  try {
    const activity = await getProductActivity(props.product.id)
    recentActivity.value = activity.slice(0, 5) // Show last 5 activities
  } catch (error) {
    handleError(error as Error, { action: 'load_product_activity' })
    // Continue without activity data
  }
}

// Watchers
watch(() => props.show, (newShow) => {
  if (newShow && props.product) {
    quantity.value = 1
    validateQuantity()
    loadProductActivity()
  }
})

watch(() => quantity.value, validateQuantity)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
