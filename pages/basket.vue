<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Modern Header with breadcrumb -->
      <div class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <NuxtLink to="/" class="hover:text-blue-600">Ana Sayfa</NuxtLink>
            <span>/</span>
            <span class="text-gray-900 font-medium">Sepetim</span>
          </nav>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Sepetim</h1>
                <p class="text-gray-600" v-if="isClient && cartItems.length > 0">{{ cartItems.length }} ürün</p>
              </div>
            </div>
            <!-- Security badges -->
            <div class="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
                <span>Güvenli Ödeme</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:truck" class="w-4 h-4 text-blue-500" />
                <span>Hızlı Teslimat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <div v-if="isClient && cartItems.length === 0" class="max-w-2xl mx-auto px-4 py-16">
        <div class="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="heroicons:shopping-bag" class="w-12 h-12 text-gray-400" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Sepetiniz henüz boş</h2>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            Binlerce ürün arasından size uygun olanları seçin ve sepetinize ekleyin!
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <NuxtLink
              to="/explore"
              class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Ürünleri Keşfet
            </NuxtLink>
            <NuxtLink
              to="/categories"
              class="border border-gray-300 text-gray-700 py-3 px-8 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Kategoriler
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="!isClient" class="max-w-2xl mx-auto px-4 py-16">
        <div class="bg-white rounded-3xl shadow-lg p-12 text-center">
          <div class="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-6"></div>
          <div class="h-6 bg-gray-200 rounded animate-pulse mb-3 max-w-xs mx-auto"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse max-w-md mx-auto"></div>
        </div>
      </div>

      <!-- Cart Content -->
      <div v-else-if="isClient && cartItems.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Left Column: Cart Items & Options -->
          <div class="flex-1 space-y-6">
            
            <!-- Quick Actions Bar -->
            <div class="bg-white rounded-2xl shadow-sm border p-4">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-center space-x-4">
                  <button
                    @click="selectAll"
                    class="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <input type="checkbox" :checked="allSelected" class="rounded border-gray-300">
                    <span>Tümünü Seç</span>
                  </button>
                  <button
                    @click="removeSelected"
                    :disabled="selectedItems.length === 0"
                    class="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400 transition-colors"
                  >
                    Seçilenleri Sil ({{ selectedItems.length }})
                  </button>
                </div>
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-600">Toplam: {{ cartItems.length }} ürün</span>
                  <span class="text-lg font-bold text-green-600">{{ formatPrice(subtotal) }}</span>
                </div>
              </div>
            </div>

            <!-- Cart Items -->
            <div class="space-y-3">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all p-6"
              >
                <div class="flex items-start space-x-4">
                  <!-- Selection checkbox -->
                  <input
                    v-model="selectedItems"
                    :value="item.id"
                    type="checkbox"
                    class="mt-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  
                  <!-- Product Image -->
                  <div class="relative flex-shrink-0">
                    <img
                      :src="item.product.image"
                      :alt="item.product.title"
                      class="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                    >
                    <span :class="[
                      'absolute -top-2 -right-2 px-2 py-1 text-xs font-medium rounded-full',
                      getConditionStyle(item.product.condition)
                    ]">
                      {{ item.product.condition }}
                    </span>
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div class="flex-1">
                        <h3 class="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                          {{ item.product.title }}
                        </h3>
                        <p class="text-gray-600 text-sm mb-3 line-clamp-1">
                          {{ item.product.description }}
                        </p>
                        
                        <!-- Seller info -->
                        <div class="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <div class="flex items-center space-x-1">
                            <Icon name="heroicons:map-pin" class="w-4 h-4" />
                            <span>{{ item.product.location }}</span>
                          </div>
                          <div class="flex items-center space-x-1">
                            <Icon name="heroicons:user" class="w-4 h-4" />
                            <span>{{ item.seller.name }}</span>
                          </div>
                          <div class="flex items-center space-x-1">
                            <Icon name="heroicons:star" class="w-4 h-4 text-yellow-400" />
                            <span>{{ item.seller.rating }}</span>
                          </div>
                        </div>

                        <!-- Mobile quantity and price -->
                        <div class="sm:hidden">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                              <button
                                @click="updateQuantity(item.id, item.quantity - 1)"
                                :disabled="item.quantity <= 1"
                                class="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center"
                              >
                                <Icon name="heroicons:minus" class="w-4 h-4" />
                              </button>
                              <span class="font-semibold min-w-[2rem] text-center">{{ item.quantity }}</span>
                              <button
                                @click="updateQuantity(item.id, item.quantity + 1)"
                                class="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                              >
                                <Icon name="heroicons:plus" class="w-4 h-4" />
                              </button>
                            </div>
                            <div class="text-right">
                              <p class="font-bold text-lg text-green-600">{{ formatPrice(item.product.price * item.quantity) }}</p>
                              <p v-if="item.quantity > 1" class="text-sm text-gray-500">{{ formatPrice(item.product.price) }} × {{ item.quantity }}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Desktop quantity and price -->
                      <div class="hidden sm:flex flex-col items-end space-y-4">
                        <div class="flex items-center space-x-3">
                          <button
                            @click="updateQuantity(item.id, item.quantity - 1)"
                            :disabled="item.quantity <= 1"
                            class="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center"
                          >
                            <Icon name="heroicons:minus" class="w-4 h-4" />
                          </button>
                          <span class="font-semibold min-w-[2rem] text-center">{{ item.quantity }}</span>
                          <button
                            @click="updateQuantity(item.id, item.quantity + 1)"
                            class="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                          >
                            <Icon name="heroicons:plus" class="w-4 h-4" />
                          </button>
                        </div>
                        <div class="text-right">
                          <p class="font-bold text-xl text-green-600">{{ formatPrice(item.product.price * item.quantity) }}</p>
                          <p v-if="item.quantity > 1" class="text-sm text-gray-500">{{ formatPrice(item.product.price) }} × {{ item.quantity }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div class="flex items-center space-x-3">
                        <button
                          @click="addToFavorites(item.id)"
                          class="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Icon name="heroicons:heart" class="w-4 h-4" />
                          <span>Favorile</span>
                        </button>
                        <button
                          @click="contactSeller(item.seller)"
                          class="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Icon name="heroicons:chat-bubble-left" class="w-4 h-4" />
                          <span>Mesaj</span>
                        </button>
                      </div>
                      <button
                        @click="removeFromCart(item.id)"
                        class="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                        <span>Kaldır</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping Options -->
            <div class="bg-white rounded-2xl shadow-sm border p-6">
              <h3 class="text-xl font-semibold mb-4 flex items-center">
                <Icon name="heroicons:truck" class="w-5 h-5 mr-2 text-blue-600" />
                Teslimat Seçenekleri
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  v-for="option in shippingOptions"
                  :key="option.id"
                  :class="[
                    'flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all',
                    selectedShipping === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input
                    v-model="selectedShipping"
                    type="radio"
                    :value="option.id"
                    class="sr-only"
                  >
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <h4 class="font-semibold text-gray-900">{{ option.name }}</h4>
                      <span :class="[
                        'text-sm font-medium',
                        option.price > 0 ? 'text-gray-900' : 'text-green-600'
                      ]">
                        {{ option.price > 0 ? formatPrice(option.price) : 'Ücretsiz' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">{{ option.description }}</p>
                    <p class="text-xs text-blue-600 font-medium">{{ option.duration }}</p>
                  </div>
                  <div v-if="selectedShipping === option.id" class="ml-3">
                    <Icon name="heroicons:check-circle" class="w-5 h-5 text-blue-600" />
                  </div>
                </label>
              </div>
            </div>

            <!-- Delivery Address -->
            <div class="bg-white rounded-2xl shadow-sm border p-6">
              <h3 class="text-xl font-semibold mb-4 flex items-center">
                <Icon name="heroicons:home" class="w-5 h-5 mr-2 text-purple-600" />
                Teslimat Adresi
              </h3>
              
              <div class="space-y-4 mb-4">
                <div
                  v-for="address in deliveryAddresses"
                  :key="address.id"
                  :class="[
                    'border-2 rounded-xl p-4 cursor-pointer transition-all',
                    selectedAddress === address.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                  @click="selectedAddress = address.id"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <h4 class="font-semibold text-gray-900">{{ address.title }}</h4>
                        <span v-if="address.isDefault" class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                          Varsayılan
                        </span>
                      </div>
                      <p class="text-gray-600 text-sm mb-1">{{ address.name }}</p>
                      <p class="text-gray-600 text-sm mb-1">{{ address.address }}</p>
                      <p class="text-gray-600 text-sm mb-2">{{ address.district }}, {{ address.city }} {{ address.zipCode }}</p>
                      <p class="text-gray-600 text-sm">📞 {{ address.phone }}</p>
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                      <div v-if="selectedAddress === address.id">
                        <Icon name="heroicons:check-circle" class="w-6 h-6 text-purple-600" />
                      </div>
                      <button
                        @click.stop="editAddress(address.id)"
                        class="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Düzenle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                @click="showAddAddressModal = true"
                class="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all flex items-center justify-center space-x-2"
              >
                <Icon name="heroicons:plus" class="w-5 h-5" />
                <span>Yeni Adres Ekle</span>
              </button>
            </div>

            <!-- Billing Address -->
            <div class="bg-white rounded-2xl shadow-sm border p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-semibold flex items-center">
                  <Icon name="heroicons:document-text" class="w-5 h-5 mr-2 text-indigo-600" />
                  Fatura Adresi
                </h3>
                <label class="flex items-center">
                  <input
                    v-model="billingAddressSame"
                    type="checkbox"
                    class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  >
                  <span class="ml-2 text-sm text-gray-600">Teslimat adresi ile aynı</span>
                </label>
              </div>
              
              <div v-if="!billingAddressSame" class="space-y-4">
                <div
                  v-for="address in deliveryAddresses"
                  :key="`billing-${address.id}`"
                  :class="[
                    'border-2 rounded-xl p-4 cursor-pointer transition-all',
                    selectedBillingAddress === address.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                  @click="selectedBillingAddress = address.id"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h4 class="font-semibold text-gray-900 mb-1">{{ address.title }}</h4>
                      <p class="text-gray-600 text-sm">{{ address.name }}</p>
                      <p class="text-gray-600 text-sm">{{ address.address }}, {{ address.district }}, {{ address.city }}</p>
                    </div>
                    <div v-if="selectedBillingAddress === address.id">
                      <Icon name="heroicons:check-circle" class="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 flex items-center">
                  <Icon name="heroicons:information-circle" class="w-4 h-4 mr-2" />
                  Fatura adresi olarak teslimat adresi kullanılacak
                </p>
              </div>
            </div>
          </div>

          <!-- Right Column: Order Summary -->
          <div class="lg:w-96">
            <div class="bg-white rounded-2xl shadow-sm border p-6 sticky top-8">
              <h3 class="text-xl font-semibold mb-6 flex items-center">
                <Icon name="heroicons:document-text" class="w-5 h-5 mr-2 text-green-600" />
                Sipariş Özeti
              </h3>
              
              <div class="space-y-4 mb-6">
                <div class="flex justify-between text-gray-600">
                  <span>Ürünler ({{ cartItems.length }})</span>
                  <span>{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span :class="selectedShippingOption?.price > 0 ? 'text-gray-900' : 'text-green-600'">
                    {{ selectedShippingOption?.price > 0 ? formatPrice(selectedShippingOption.price) : 'Ücretsiz' }}
                  </span>
                </div>
                <div v-if="discount > 0" class="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{{ formatPrice(discount) }}</span>
                </div>
                <div class="border-t border-gray-200 pt-4">
                  <div class="flex justify-between text-lg font-bold">
                    <span>Toplam</span>
                    <span class="text-green-600">{{ formatPrice(total) }}</span>
                  </div>
                </div>
              </div>

              <!-- Coupon Section -->
              <div class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                  <Icon name="heroicons:ticket" class="w-4 h-4 mr-2 text-purple-600" />
                  İndirim Kuponu
                </h4>
                <div class="flex space-x-2">
                  <input
                    v-model="couponCode"
                    type="text"
                    placeholder="Kupon kodunu girin"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                  <button
                    @click="applyCoupon"
                    :disabled="!couponCode.trim()"
                    class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Uygula
                  </button>
                </div>
                <p class="text-xs text-gray-600 mt-2">Mevcut kuponlar: WELCOME10, SAVE20</p>
              </div>

              <!-- Payment Method -->
              <div class="mb-6">
                <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                  <Icon name="heroicons:credit-card" class="w-4 h-4 mr-2 text-blue-600" />
                  Ödeme Yöntemi
                </h4>
                <div class="space-y-3">
                  <label
                    v-for="method in paymentMethods"
                    :key="method.id"
                    :class="[
                      'flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all',
                      selectedPayment === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    ]"
                  >
                    <input
                      v-model="selectedPayment"
                      type="radio"
                      :value="method.id"
                      class="sr-only"
                    >
                    <div class="flex items-center space-x-3 flex-1">
                      <span class="text-xl">{{ method.icon }}</span>
                      <div>
                        <h5 class="font-medium text-gray-900">{{ method.name }}</h5>
                        <p class="text-sm text-gray-600">{{ method.description }}</p>
                      </div>
                    </div>
                    <div v-if="selectedPayment === method.id">
                      <Icon name="heroicons:check-circle" class="w-5 h-5 text-blue-600" />
                    </div>
                  </label>
                </div>
              </div>

              <!-- Checkout Validation -->
              <div v-if="!isCheckoutValid" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 class="text-sm font-semibold text-red-800 mb-2 flex items-center">
                  <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 mr-2" />
                  Eksik Bilgiler
                </h4>
                <ul class="text-sm text-red-700 space-y-1">
                  <li v-if="!selectedShipping">• Teslimat yöntemi seçin</li>
                  <li v-if="!selectedAddress">• Teslimat adresi seçin</li>
                  <li v-if="!billingAddressSame && !selectedBillingAddress">• Fatura adresi seçin</li>
                  <li v-if="!selectedPayment">• Ödeme yöntemi seçin</li>
                </ul>
              </div>

              <!-- Checkout Button -->
              <button
                @click="proceedToCheckout"
                :disabled="!isCheckoutValid || isProcessing"
                class="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4"
              >
                <span v-if="!isProcessing" class="flex items-center">
                  <Icon name="heroicons:credit-card" class="w-5 h-5 mr-2" />
                  {{ isCheckoutValid ? `Siparişi Onayla - ${formatPrice(total)}` : 'Bilgileri Tamamlayın' }}
                </span>
                <span v-else class="flex items-center">
                  <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
                  İşleniyor...
                </span>
              </button>

              <!-- Security & Guarantee -->
              <div class="space-y-3">
                <div class="flex items-center space-x-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <Icon name="heroicons:shield-check" class="w-4 h-4" />
                  <span>256-bit SSL ile güvenli ödeme</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                  <Icon name="heroicons:arrow-uturn-left" class="w-4 h-4" />
                  <span>14 gün içinde iade hakkı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// SEO
useSeoMeta({
  title: 'Sepetim - TagList',
  description: 'TagList sepetinizi yönetin ve güvenli ödeme ile satın alımınızı tamamlayın.'
})

// Client-side check
const isClient = ref(false)

// Reactive data
const selectedShipping = ref('standard')
const selectedPayment = ref('card')
const selectedAddress = ref(1) // Default to first address
const selectedBillingAddress = ref(1)
const billingAddressSame = ref(true)
const couponCode = ref('')
const isProcessing = ref(false)
const selectedItems = ref([])
const showAddAddressModal = ref(false)

const cartItems = ref([
  {
    id: 1,
    quantity: 1,
    product: {
      id: 1,
      title: 'iPhone 13 Pro Max 256GB Space Gray',
      description: 'Çok temiz kullanılmış, orijinal kutusu ile birlikte. Garantisi devam ediyor.',
      price: 35000,
      condition: 'Çok İyi',
      location: 'İstanbul, Kadıköy',
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200'
    },
    seller: {
      name: 'Ahmet Yılmaz',
      rating: 4.8
    }
  },
  {
    id: 2,
    quantity: 1,
    product: {
      id: 2,
      title: 'MacBook Pro M2 16" 512GB',
      description: 'Garantili, sıfır ayarında laptop. Kutusunda tüm aksesuarlar mevcut.',
      price: 55000,
      condition: 'Sıfır Ayarında',
      location: 'İzmir, Konak',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200'
    },
    seller: {
      name: 'Zehra Demir',
      rating: 4.9
    }
  },
  {
    id: 3,
    quantity: 2,
    product: {
      id: 3,
      title: 'Apple Watch Series 8 45mm',
      description: 'Hiç kullanılmamış, hediye olarak alınmış.',
      price: 8500,
      condition: 'Sıfır',
      location: 'Ankara, Çankaya',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200'
    },
    seller: {
      name: 'Mehmet Özkan',
      rating: 4.7
    }
  }
])

const deliveryAddresses = ref([
  {
    id: 1,
    title: 'Ev Adresim',
    name: 'Ahmet Yılmaz',
    phone: '+90 532 123 45 67',
    address: 'Moda Caddesi No:15 Daire:4',
    district: 'Kadıköy',
    city: 'İstanbul',
    zipCode: '34710',
    isDefault: true
  },
  {
    id: 2,
    title: 'İş Adresim',
    name: 'Ahmet Yılmaz',
    phone: '+90 532 123 45 67',
    address: 'Levent Plaza Kat:12 No:45',
    district: 'Şişli',
    city: 'İstanbul',
    zipCode: '34330',
    isDefault: false
  },
  {
    id: 3,
    title: 'Anne Evi',
    name: 'Fatma Yılmaz',
    phone: '+90 533 987 65 43',
    address: 'Bağdat Caddesi No:123 Kat:3',
    district: 'Maltepe',
    city: 'İstanbul',
    zipCode: '34840',
    isDefault: false
  }
])

const shippingOptions = ref([
  {
    id: 'standard',
    name: 'Standart Kargo',
    description: 'Ekonomik seçenek, güvenli teslimat',
    price: 25,
    duration: '3-5 iş günü'
  },
  {
    id: 'fast',
    name: 'Hızlı Kargo',
    description: 'Öncelikli işlem, hızlı teslimat',
    price: 45,
    duration: '1-2 iş günü'
  },
  {
    id: 'express',
    name: 'Express Teslimat',
    description: 'Aynı gün/ertesi gün teslimat',
    price: 85,
    duration: 'Aynı gün'
  },
  {
    id: 'pickup',
    name: 'Mağazadan Teslim Al',
    description: 'Ücretsiz teslim alma, anında hazır',
    price: 0,
    duration: 'Anında'
  }
])

const paymentMethods = ref([
  {
    id: 'card',
    name: 'Kredi/Banka Kartı',
    description: 'Visa, Mastercard, Troy kabul edilir',
    icon: '💳'
  },
  {
    id: 'installment',
    name: 'Taksitli Ödeme',
    description: '2-12 aya varan taksit seçenekleri',
    icon: '📊'
  },
  {
    id: 'transfer',
    name: 'Banka Havalesi/EFT',
    description: 'Havale ile ödeme, 2% indirim',
    icon: '🏦'
  },
  {
    id: 'wallet',
    name: 'Dijital Cüzdan',
    description: 'Papara, BKM Express, Tosla',
    icon: '📱'
  }
])

// Computed properties
const subtotal = computed(() => {
  if (!isClient.value || !cartItems.value) return 0
  return cartItems.value.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  )
})

const selectedShippingOption = computed(() => {
  if (!isClient.value || !shippingOptions.value || !selectedShipping.value) return null
  return shippingOptions.value.find(option => option.id === selectedShipping.value)
})

const discount = computed(() => {
  if (!isClient.value) return 0
  let discountAmount = 0
  
  // Coupon discounts
  if (couponCode.value === 'WELCOME10') {
    discountAmount += Math.min(subtotal.value * 0.1, 5000) // Max 50₺
  } else if (couponCode.value === 'SAVE20') {
    discountAmount += Math.min(subtotal.value * 0.2, 10000) // Max 100₺
  }
  
  // Bank transfer discount
  if (selectedPayment.value === 'transfer') {
    discountAmount += subtotal.value * 0.02 // 2% discount
  }
  
  return discountAmount
})

const total = computed(() => {
  if (!isClient.value) return 0
  return Math.max(0, subtotal.value + (selectedShippingOption.value?.price || 0) - discount.value)
})

const allSelected = computed(() => {
  if (!isClient.value || !cartItems.value || !selectedItems.value) return false
  return selectedItems.value.length === cartItems.value.length && cartItems.value.length > 0
})

const isCheckoutValid = computed(() => {
  if (!isClient.value) return false
  return selectedShipping.value && 
         selectedAddress.value && 
         (billingAddressSame.value || selectedBillingAddress.value) && 
         selectedPayment.value
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const getConditionStyle = (condition) => {
  const styles = {
    'Sıfır': 'bg-green-100 text-green-800 border border-green-200',
    'Sıfır Ayarında': 'bg-green-100 text-green-800 border border-green-200',
    'Çok İyi': 'bg-blue-100 text-blue-800 border border-blue-200',
    'İyi': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Orta': 'bg-orange-100 text-orange-800 border border-orange-200'
  }
  return styles[condition] || 'bg-gray-100 text-gray-800 border border-gray-200'
}

const updateQuantity = (itemId, newQuantity) => {
  const item = cartItems.value.find(item => item.id === itemId)
  if (item && newQuantity >= 1) {
    item.quantity = newQuantity
  }
}

const removeFromCart = (itemId) => {
  const index = cartItems.value.findIndex(item => item.id === itemId)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    // Remove from selected items as well
    const selectedIndex = selectedItems.value.indexOf(itemId)
    if (selectedIndex > -1) {
      selectedItems.value.splice(selectedIndex, 1)
    }
  }
}

const selectAll = () => {
  if (allSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = cartItems.value.map(item => item.id)
  }
}

const removeSelected = () => {
  if (selectedItems.value.length === 0) return
  
  if (confirm(`${selectedItems.value.length} ürünü sepetinizden kaldırmak istediğinizden emin misiniz?`)) {
    cartItems.value = cartItems.value.filter(item => !selectedItems.value.includes(item.id))
    selectedItems.value = []
  }
}

const addToFavorites = (itemId) => {
  // Add to favorites logic
  alert('Ürün favorilerinize eklendi!')
}

const contactSeller = (seller) => {
  // Contact seller logic
  alert(`${seller.name} ile mesajlaşma başlatılacak.`)
}

const applyCoupon = () => {
  const code = couponCode.value.trim().toUpperCase()
  
  if (!code) {
    alert('Lütfen bir kupon kodu girin!')
    return
  }
  
  if (code === 'WELCOME10') {
    alert('🎉 %10 indirim kuponu başarıyla uygulandı! (Max 50₺)')
  } else if (code === 'SAVE20') {
    alert('🎉 %20 indirim kuponu başarıyla uygulandı! (Max 100₺)')
  } else {
    alert('❌ Geçersiz kupon kodu! Mevcut kuponlar: WELCOME10, SAVE20')
    couponCode.value = ''
  }
}

const editAddress = (addressId) => {
  // Edit address logic
  alert(`Adres düzenleme özelliği yakında eklenecek (Adres ID: ${addressId})`)
}

const addNewAddress = () => {
  // Add new address logic
  showAddAddressModal.value = true
  alert('Yeni adres ekleme modalı açılacak')
}

const proceedToCheckout = async () => {
  if (!isCheckoutValid.value) {
    alert('⚠️ Lütfen eksik bilgileri tamamlayın!')
    return
  }
  
  if (cartItems.value.length === 0) {
    alert('Sepetinizde ürün bulunmuyor!')
    return
  }
  
  // Get selected addresses
  const deliveryAddress = deliveryAddresses.value.find(addr => addr.id === selectedAddress.value)
  const billingAddress = billingAddressSame.value 
    ? deliveryAddress 
    : deliveryAddresses.value.find(addr => addr.id === selectedBillingAddress.value)
  
  // Confirmation dialog with full order details
  const confirmMessage = `
🛒 SİPARİŞ ONAYLAMA
━━━━━━━━━━━━━━━━━━━━

📦 Ürünler: ${cartItems.value.length} adet
💰 Toplam: ${formatPrice(total.value)}

📍 Teslimat Adresi:
${deliveryAddress?.title} - ${deliveryAddress?.name}
${deliveryAddress?.address}
${deliveryAddress?.district}, ${deliveryAddress?.city}

🚚 Teslimat: ${selectedShippingOption.value?.name} (${selectedShippingOption.value?.duration})
💳 Ödeme: ${paymentMethods.value.find(p => p.id === selectedPayment.value)?.name}

Siparişinizi onaylıyor musunuz?`

  if (!confirm(confirmMessage)) {
    return
  }
  
  isProcessing.value = true
  
  try {
    // Simulate order processing with steps
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create detailed order
    const orderNumber = 'TL' + Date.now().toString().slice(-6)
    const orderData = {
      orderNumber,
      items: cartItems.value.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity
      })),
      subtotal: subtotal.value,
      shipping: {
        method: selectedShippingOption.value?.name,
        cost: selectedShippingOption.value?.price || 0,
        duration: selectedShippingOption.value?.duration
      },
      discount: discount.value,
      total: total.value,
      deliveryAddress,
      billingAddress,
      paymentMethod: paymentMethods.value.find(p => p.id === selectedPayment.value)?.name,
      coupon: couponCode.value || null,
      createdAt: new Date().toLocaleString('tr-TR')
    }
    
    // Success message with tracking info
    alert(`✅ SİPARİŞ BAŞARIYLA OLUŞTURULDU!

📋 Sipariş No: ${orderData.orderNumber}
� Tarih: ${orderData.createdAt}

�📦 Ürünler: ${orderData.items.length} adet
💰 Toplam: ${formatPrice(orderData.total)}

� Teslimat Adresi: ${orderData.deliveryAddress.title}
� Teslimat Süresi: ${orderData.shipping.duration}

📱 SMS ile kargo takip kodu gönderilecek
📧 E-posta ile sipariş detayları gönderildi

Siparişinizi "Profil > Siparişlerim" bölümünden takip edebilirsiniz.`)
    
    // Save to localStorage for demo purposes
    const existingOrders = JSON.parse(localStorage.getItem('taglist_orders') || '[]')
    existingOrders.unshift(orderData)
    localStorage.setItem('taglist_orders', JSON.stringify(existingOrders))
    
    // Clear cart
    cartItems.value = []
    selectedItems.value = []
    couponCode.value = ''
    
    // Redirect to profile orders
    await navigateTo('/profile?tab=orders')
    
  } catch (error) {
    alert('❌ Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    console.error('Order creation error:', error)
  } finally {
    isProcessing.value = false
  }
}

// Initialize component
onMounted(() => {
  isClient.value = true
  // Initialize selected items to select all by default
  selectedItems.value = cartItems.value.map(item => item.id)
})
</script>
