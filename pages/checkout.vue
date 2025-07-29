<!-- One-Page Checkout - Lightning Fast Payment Flow -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
    <div class="max-w-4xl mx-auto px-4 py-8">
      
      <!-- Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Icon name="heroicons:check" class="w-4 h-4 text-white" />
            </div>
            <span class="text-sm text-green-400">Sepet</span>
          </div>
          <div class="w-12 h-0.5 bg-green-500"></div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <span class="text-white font-semibold text-sm">2</span>
            </div>
            <span class="text-sm text-blue-400">Ödeme</span>
          </div>
          <div class="w-12 h-0.5 bg-gray-600"></div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span class="text-gray-400 font-semibold text-sm">3</span>
            </div>
            <span class="text-sm text-gray-400">Tamamlandı</span>
          </div>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        
        <!-- Order Summary -->
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 class="text-2xl font-bold mb-6">Sipariş Özeti</h2>
          
          <div class="space-y-4 mb-6">
            <div v-for="item in cartItems" :key="item.id" 
                 class="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
              <img :src="item.image" :alt="item.name" 
                   class="w-16 h-16 rounded-lg object-cover">
              <div class="flex-1">
                <h3 class="font-semibold">{{ item.name }}</h3>
                <p class="text-sm text-gray-400">{{ item.quantity }} adet</p>
              </div>
              <span class="font-bold text-lg">₺{{ item.price.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="border-t border-white/10 pt-4 space-y-2">
            <div class="flex justify-between">
              <span>Ara Toplam</span>
              <span>₺{{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span>Kargo</span>
              <span class="text-green-400">Ücretsiz</span>
            </div>
            <div class="flex justify-between text-xl font-bold border-t border-white/10 pt-2">
              <span>Toplam</span>
              <span>₺{{ total.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Form -->
        <div class="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 class="text-2xl font-bold mb-6">Ödeme Bilgileri</h2>

          <!-- Express Payment Options -->
          <div class="mb-6 space-y-3">
            <button @click="payWithApplePay" 
                    v-if="isApplePayAvailable"
                    class="w-full h-12 bg-black hover:bg-gray-900 rounded-xl flex items-center justify-center space-x-2 transition-colors">
              <Icon name="simple-icons:applepay" class="w-6 h-6 text-white" />
              <span class="text-white font-semibold">Apple Pay ile Öde</span>
            </button>
            
            <button @click="payWithGooglePay" 
                    v-if="isGooglePayAvailable"
                    class="w-full h-12 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center space-x-2 transition-colors">
              <Icon name="simple-icons:googlepay" class="w-6 h-6 text-white" />
              <span class="text-white font-semibold">Google Pay ile Öde</span>
            </button>

            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/20"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 px-2 text-gray-400">
                  veya kart ile öde
                </span>
              </div>
            </div>
          </div>

          <!-- Card Payment Form -->
          <form @submit.prevent="processPayment" class="space-y-4">
            
            <!-- Shipping Address -->
            <div class="space-y-3">
              <h3 class="font-semibold text-lg">Teslimat Adresi</h3>
              
              <div class="grid grid-cols-2 gap-3">
                <input v-model="shippingAddress.firstName" 
                       type="text" 
                       placeholder="Ad" 
                       required
                       class="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <input v-model="shippingAddress.lastName" 
                       type="text" 
                       placeholder="Soyad" 
                       required
                       class="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              
              <input v-model="shippingAddress.address" 
                     type="text" 
                     placeholder="Adres" 
                     required
                     class="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              
              <div class="grid grid-cols-2 gap-3">
                <input v-model="shippingAddress.city" 
                       type="text" 
                       placeholder="Şehir" 
                       required
                       class="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <input v-model="shippingAddress.postalCode" 
                       type="text" 
                       placeholder="Posta Kodu" 
                       required
                       pattern="[0-9]{5}"
                       class="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>

            <!-- Payment Method -->
            <div class="space-y-3">
              <h3 class="font-semibold text-lg">Kart Bilgileri</h3>
              
              <input v-model="paymentData.cardNumber" 
                     type="text" 
                     placeholder="Kart Numarası" 
                     required
                     maxlength="19"
                     @input="formatCardNumber"
                     class="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              
              <div class="grid grid-cols-2 gap-3">
                <input v-model="paymentData.expiryDate" 
                       type="text" 
                       placeholder="AA/YY" 
                       required
                       maxlength="5"
                       @input="formatExpiryDate"
                       class="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <input v-model="paymentData.cvv" 
                       type="text" 
                       placeholder="CVV" 
                       required
                       maxlength="4"
                       inputmode="numeric"
                       class="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              
              <input v-model="paymentData.cardName" 
                     type="text" 
                     placeholder="Kart Üzerindeki İsim" 
                     required
                     class="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <!-- Save Card Option -->
            <label class="flex items-center space-x-3 cursor-pointer">
              <input v-model="saveCard" 
                     type="checkbox" 
                     class="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-2">
              <span class="text-sm text-gray-300">Kartımı güvenli şekilde kaydet (1-tık ödeme)</span>
            </label>

            <!-- Security Info -->
            <div class="flex items-center space-x-2 text-sm text-gray-400 bg-white/5 rounded-xl p-3">
              <Icon name="heroicons:shield-check" class="w-5 h-5 text-green-400" />
              <span>256-bit SSL şifreleme ile güvenli ödeme</span>
            </div>

            <!-- Payment Button -->
            <button type="submit" 
                    :disabled="isProcessing"
                    class="w-full h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2">
              <Icon v-if="isProcessing" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
              <Icon v-else name="heroicons:lock-closed" class="w-5 h-5" />
              <span>
                {{ isProcessing ? 'İşleniyor...' : `₺${total.toLocaleString()} Öde` }}
              </span>
            </button>

          </form>

        </div>
      </div>

      <!-- Trust Badges -->
      <div class="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
        <div class="flex items-center space-x-1">
          <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-400" />
          <span>SSL Güvenli</span>
        </div>
        <div class="flex items-center space-x-1">
          <Icon name="heroicons:clock" class="w-4 h-4 text-blue-400" />
          <span>24 Saat Teslimat</span>
        </div>
        <div class="flex items-center space-x-1">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 text-purple-400" />
          <span>Kolay İade</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// One-Page Checkout - Target: ≤25s completion time (guest)

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
}

interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
}

// State Management
const cartItems = ref<CartItem[]>([
  {
    id: '1',
    name: 'iPhone 14 Pro Max',
    price: 45000,
    quantity: 1,
    image: '/api/placeholder/64/64'
  },
  {
    id: '2',
    name: 'AirPods Pro',
    price: 3500,
    quantity: 1,
    image: '/api/placeholder/64/64'
  }
])

const shippingAddress = ref<ShippingAddress>({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: ''
})

const paymentData = ref<PaymentData>({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: ''
})

const saveCard = ref(false)
const isProcessing = ref(false)

// Payment Method Detection
const isApplePayAvailable = ref(false)
const isGooglePayAvailable = ref(false)

// Computed Values
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const total = computed(() => subtotal.value) // Free shipping

// Payment Processing
async function processPayment() {
  isProcessing.value = true
  
  try {
    // Validate form data
    if (!validatePaymentData()) {
      return
    }

    // Process payment (integration with payment gateway)
    const paymentResult = await processSecurePayment({
      amount: total.value,
      currency: 'TRY',
      card: paymentData.value,
      shipping: shippingAddress.value,
      saveCard: saveCard.value
    })

    if (paymentResult.success) {
      // Redirect to success page
      await navigateTo(`/checkout/success?orderId=${paymentResult.orderId}`)
    } else {
      throw new Error('Payment processing failed')
    }

  } catch (error) {
    console.error('Payment failed:', error)
    // Show error message
    alert('Ödeme işlemi başarısız. Lütfen tekrar deneyin.')
  } finally {
    isProcessing.value = false
  }
}

async function payWithApplePay() {
  try {
    // Apple Pay implementation
    const paymentRequest = {
      countryCode: 'TR',
      currencyCode: 'TRY',
      total: {
        label: 'TagList',
        amount: total.value.toString()
      }
    }
    
    // Process Apple Pay
    const session = new (window as any).ApplePaySession(3, paymentRequest)
    session.begin()
    
  } catch (error) {
    console.error('Apple Pay failed:', error)
  }
}

async function payWithGooglePay() {
  try {
    // Google Pay implementation
    const paymentRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        }
      }],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: total.value.toString(),
        currencyCode: 'TRY'
      }
    }
    
    // Process Google Pay
    // Payment processing logic here
    
  } catch (error) {
    // Google Pay failed
  }
}

// Form Helpers
function formatCardNumber(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  
  const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
  paymentData.value.cardNumber = formattedValue
}

function formatExpiryDate(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  
  paymentData.value.expiryDate = value
}

function validatePaymentData(): boolean {
  // Basic validation
  if (!shippingAddress.value.firstName || !shippingAddress.value.lastName) {
    alert('Lütfen ad ve soyad bilgilerini girin.')
    return false
  }
  
  if (!paymentData.value.cardNumber || paymentData.value.cardNumber.replace(/\s/g, '').length < 16) {
    alert('Lütfen geçerli bir kart numarası girin.')
    return false
  }
  
  if (!paymentData.value.expiryDate || !paymentData.value.cvv) {
    alert('Lütfen kart bilgilerini tamamlayın.')
    return false
  }
  
  return true
}

async function processSecurePayment(data: any) {
  // Mock payment processing - replace with actual payment gateway
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    success: true,
    orderId: crypto.randomUUID(),
    transactionId: crypto.randomUUID()
  }
}

// Initialize payment methods
onMounted(() => {
  // Check for Apple Pay availability
  if ((window as any).ApplePaySession) {
    isApplePayAvailable.value = (window as any).ApplePaySession.canMakePayments()
  }
  
  // Check for Google Pay availability
  if ((window as any).google?.payments?.api) {
    isGooglePayAvailable.value = true
  }
})

// SEO
useHead({
  title: 'Ödeme - TagList',
  meta: [
    { name: 'description', content: 'Güvenli ve hızlı ödeme ile alışverişinizi tamamlayın.' }
  ]
})
</script>
