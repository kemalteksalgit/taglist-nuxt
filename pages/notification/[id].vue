<script setup lang="ts">
const route = useRoute()
const notificationId = route.params.id

// SEO
useHead({
  title: `Bildirim Detayı - TagList`,
  meta: [
    { name: 'description', content: 'TagList bildirim detayları ve işlemler.' }
  ]
})

// Sample notification data
const notificationData = ref({
  id: notificationId,
  type: 'sale',
  icon: '💰',
  title: 'Ürününüz satıldı!',
  message: 'iPhone 15 Pro Max başarıyla satıldı.',
  time: '10 dakika önce',
  details: {
    product: {
      name: 'iPhone 15 Pro Max',
      price: '45.000₺',
      buyer: 'Mehmet S.',
      saleDate: '29 Temmuz 2025, 14:30'
    },
    transaction: {
      amount: '45.000₺',
      commission: '2.250₺',
      netAmount: '42.750₺',
      paymentMethod: 'Kredi Kartı'
    }
  }
})

const goBack = () => {
  navigateTo('/messages')
}

const viewProduct = () => {
  // Ürün detayına git
  navigateTo('/product/123')
}

const contactBuyer = () => {
  // Alıcı ile mesajlaşma sayfasına git
  navigateTo('/chat/456')
}

const downloadInvoice = () => {
  // Fatura indir
  console.log('Downloading invoice...')
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <button @click="goBack" class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-lg font-semibold text-gray-900">Bildirim Detayı</h1>
            <div></div>
          </div>

          <!-- Notification Info -->
          <div class="flex items-center space-x-4 mb-4">
            <div class="text-4xl">{{ notificationData.icon }}</div>
            <div class="flex-1">
              <h2 class="text-xl font-bold text-gray-900">{{ notificationData.title }}</h2>
              <p class="text-gray-600 mt-1">{{ notificationData.message }}</p>
              <p class="text-sm text-gray-500 mt-2">{{ notificationData.time }}</p>
            </div>
          </div>
        </div>

        <!-- Sale Details -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📦 Satış Detayları</h3>
          
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Ürün:</span>
              <span class="font-medium text-gray-900">{{ notificationData.details.product.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Satış Fiyatı:</span>
              <span class="font-bold text-green-600">{{ notificationData.details.product.price }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Alıcı:</span>
              <span class="font-medium text-gray-900">{{ notificationData.details.product.buyer }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Satış Tarihi:</span>
              <span class="text-gray-900">{{ notificationData.details.product.saleDate }}</span>
            </div>
          </div>
        </div>

        <!-- Transaction Details -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💳 Ödeme Detayları</h3>
          
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Brüt Tutar:</span>
              <span class="font-medium text-gray-900">{{ notificationData.details.transaction.amount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Komisyon (5%):</span>
              <span class="text-red-600">-{{ notificationData.details.transaction.commission }}</span>
            </div>
            <div class="border-t pt-2">
              <div class="flex justify-between">
                <span class="text-gray-900 font-semibold">Net Kazanç:</span>
                <span class="font-bold text-green-600 text-lg">{{ notificationData.details.transaction.netAmount }}</span>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Ödeme Yöntemi:</span>
              <span class="text-gray-900">{{ notificationData.details.transaction.paymentMethod }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="contactBuyer"
            class="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>💬</span>
            <span>Alıcı ile Mesajlaş</span>
          </button>
          
          <button
            @click="viewProduct"
            class="w-full bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>👁️</span>
            <span>Ürünü Görüntüle</span>
          </button>
          
          <button
            @click="downloadInvoice"
            class="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>📄</span>
            <span>Fatura İndir</span>
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
