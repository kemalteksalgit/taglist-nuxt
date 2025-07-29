<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900">💳 Cüzdanım</h1>
        <p class="text-gray-600 mt-2">Bakiyenizi yönetin ve işlem geçmişinizi takip edin</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Wallet Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Main Balance Card -->
        <div class="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-semibold mb-2">Ana Bakiye</h2>
              <p class="text-4xl font-bold">{{ formatPrice(wallet.balance) }} TL</p>
            </div>
            <div class="text-right">
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                <span class="text-2xl">💎</span>
              </div>
              <p class="text-sm opacity-90">Güvenli Ödeme</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm opacity-90">Bu Ay Kazanç</p>
              <p class="text-xl font-semibold">{{ formatPrice(wallet.monthlyEarnings) }} TL</p>
            </div>
            <div>
              <p class="text-sm opacity-90">Bekleyen Ödemeler</p>
              <p class="text-xl font-semibold">{{ formatPrice(wallet.pendingPayments) }} TL</p>
            </div>
          </div>

          <div class="flex space-x-3">
            <button
              @click="showAddMoney = true"
              class="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Para Yükle
            </button>
            <button
              @click="showWithdraw = true"
              class="border border-white border-opacity-30 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Para Çek
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
            <div class="space-y-3">
              <button
                @click="showTransfer = true"
                class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span class="text-2xl">💸</span>
                <div class="text-left">
                  <p class="font-medium text-gray-900">Para Transferi</p>
                  <p class="text-sm text-gray-600">Başka kullanıcıya gönder</p>
                </div>
              </button>
              
              <button class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span class="text-2xl">🎯</span>
                <div class="text-left">
                  <p class="font-medium text-gray-900">Güvenli Ödeme</p>
                  <p class="text-sm text-gray-600">Korumalı alışveriş</p>
                </div>
              </button>
              
              <button class="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span class="text-2xl">📱</span>
                <div class="text-left">
                  <p class="font-medium text-gray-900">QR Ödeme</p>
                  <p class="text-sm text-gray-600">Hızlı ödeme yap</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Security Info -->
          <div class="bg-green-50 rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <span class="text-green-600 text-xl">🔒</span>
              <div>
                <h4 class="font-semibold text-green-900">Güvenli Cüzdan</h4>
                <p class="text-sm text-green-700">256-bit SSL şifreleme ile korunuyor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">📈</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Toplam Kazanç</p>
              <p class="text-xl font-bold text-gray-900">{{ formatPrice(wallet.totalEarnings) }} TL</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">💳</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Toplam Harcama</p>
              <p class="text-xl font-bold text-gray-900">{{ formatPrice(wallet.totalSpent) }} TL</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">🔄</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Bu Ay İşlem</p>
              <p class="text-xl font-bold text-gray-900">{{ wallet.monthlyTransactions }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span class="text-2xl">⭐</span>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Cashback</p>
              <p class="text-xl font-bold text-gray-900">{{ formatPrice(wallet.cashback) }} TL</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Son İşlemler</h2>
            <div class="flex space-x-2">
              <select v-model="transactionFilter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="all">Tümü</option>
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
                <option value="transfer">Transfer</option>
              </select>
              <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                📊 Rapor Al
              </button>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="transaction in filteredTransactions"
              :key="transaction.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center"
                     :class="getTransactionColor(transaction.type)">
                  <span class="text-xl">{{ getTransactionIcon(transaction.type) }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ transaction.description }}</h3>
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{{ formatDate(transaction.date) }}</span>
                    <span>•</span>
                    <span>{{ transaction.reference }}</span>
                  </div>
                </div>
              </div>
              
              <div class="text-right">
                <p class="font-bold" :class="getAmountColor(transaction.type)">
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ formatPrice(transaction.amount) }} TL
                </p>
                <p class="text-sm text-gray-500">{{ transaction.status }}</p>
              </div>
            </div>
          </div>
          
          <div class="mt-6 text-center">
            <button class="text-blue-600 hover:text-blue-800 font-medium">
              Daha Fazla Göster →
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Ödeme Yöntemleri</h2>
          <button
            @click="showAddCard = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + Kart Ekle
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="card in paymentMethods"
            :key="card.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl">{{ getCardIcon(card.type) }}</span>
              <span class="text-sm px-2 py-1 rounded-full"
                    :class="card.isDefault ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'">
                {{ card.isDefault ? 'Varsayılan' : 'Standart' }}
              </span>
            </div>
            <p class="font-semibold text-gray-900">**** **** **** {{ card.lastFour }}</p>
            <p class="text-sm text-gray-600">{{ card.expiryDate }}</p>
            <div class="flex space-x-2 mt-3">
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Düzenle
              </button>
              <button class="text-red-600 hover:text-red-800 text-sm font-medium">
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    
    <!-- Add Money Modal -->
    <div v-if="showAddMoney" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Para Yükle</h3>
        <form @submit.prevent="addMoney" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Miktar (TL)</label>
            <input
              v-model="addMoneyForm.amount"
              type="number"
              min="10"
              max="10000"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
            <select
              v-model="addMoneyForm.paymentMethod"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option v-for="card in paymentMethods" :key="card.id" :value="card.id">
                {{ getCardIcon(card.type) }} **** {{ card.lastFour }}
              </option>
            </select>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Para Yükle
            </button>
            <button
              type="button"
              @click="showAddMoney = false"
              class="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Withdraw Money Modal -->
    <div v-if="showWithdraw" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Para Çek</h3>
        <form @submit.prevent="withdrawMoney" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Miktar (TL)</label>
            <input
              v-model="withdrawForm.amount"
              type="number"
              :max="wallet.balance"
              min="50"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <p class="text-sm text-gray-500 mt-1">Maksimum: {{ formatPrice(wallet.balance) }} TL</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Banka Hesabı</label>
            <select
              v-model="withdrawForm.bankAccount"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Hesap seçin</option>
              <option value="ziraat">Ziraat Bankası - ***4567</option>
              <option value="garanti">Garanti BBVA - ***8901</option>
            </select>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-sm text-yellow-800">
              <span class="font-medium">Not:</span> Para çekme işlemi 1-3 iş günü sürebilir.
            </p>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Para Çek
            </button>
            <button
              type="button"
              @click="showWithdraw = false"
              class="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed } from 'vue'

useHead({
  title: 'Cüzdanım - TagList',
  meta: [
    { name: 'description', content: 'TagList cüzdan sayfanız. Bakiyenizi yönetin ve güvenli ödemeler yapın.' }
  ]
})

// Data
const showAddMoney = ref(false)
const showWithdraw = ref(false)
const showTransfer = ref(false)
const showAddCard = ref(false)
const transactionFilter = ref('all')

const wallet = ref({
  balance: 2750.50,
  monthlyEarnings: 1520.00,
  pendingPayments: 380.00,
  totalEarnings: 15420.00,
  totalSpent: 8930.00,
  monthlyTransactions: 24,
  cashback: 127.50
})

const addMoneyForm = ref({
  amount: '',
  paymentMethod: ''
})

const withdrawForm = ref({
  amount: '',
  bankAccount: ''
})

const transactions = ref([
  {
    id: 1,
    type: 'income',
    description: 'iPhone 14 Pro satış geliri',
    amount: 28500,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reference: '#TL-001234',
    status: 'Tamamlandı'
  },
  {
    id: 2,
    type: 'expense',
    description: 'MacBook Pro M2 satın alma',
    amount: 35000,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reference: '#TL-001235',
    status: 'Tamamlandı'
  },
  {
    id: 3,
    type: 'transfer',
    description: 'Para yükleme (Kredi Kartı)',
    amount: 1000,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reference: '#TL-001236',
    status: 'Tamamlandı'
  },
  {
    id: 4,
    type: 'income',
    description: 'PlayStation 5 satış geliri',
    amount: 12000,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    reference: '#TL-001237',
    status: 'Tamamlandı'
  },
  {
    id: 5,
    type: 'expense',
    description: 'Güvenli Ödeme Komisyonu',
    amount: 25,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    reference: '#TL-001238',
    status: 'Tamamlandı'
  }
])

const paymentMethods = ref([
  {
    id: 1,
    type: 'visa',
    lastFour: '4567',
    expiryDate: '12/26',
    isDefault: true
  },
  {
    id: 2,
    type: 'mastercard',
    lastFour: '8901',
    expiryDate: '08/25',
    isDefault: false
  }
])

// Computed
const filteredTransactions = computed(() => {
  if (transactionFilter.value === 'all') return transactions.value
  return transactions.value.filter(t => t.type === transactionFilter.value)
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getTransactionColor = (type) => {
  switch (type) {
    case 'income': return 'bg-green-100 text-green-600'
    case 'expense': return 'bg-red-100 text-red-600'
    case 'transfer': return 'bg-blue-100 text-blue-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getTransactionIcon = (type) => {
  switch (type) {
    case 'income': return '↗️'
    case 'expense': return '↙️'
    case 'transfer': return '💳'
    default: return '💰'
  }
}

const getAmountColor = (type) => {
  switch (type) {
    case 'income': return 'text-green-600'
    case 'expense': return 'text-red-600'
    case 'transfer': return 'text-blue-600'
    default: return 'text-gray-900'
  }
}

const getCardIcon = (type) => {
  switch (type) {
    case 'visa': return '💳'
    case 'mastercard': return '💳'
    default: return '💳'
  }
}

const addMoney = () => {
  // Simulate adding money
  wallet.value.balance += parseFloat(addMoneyForm.value.amount)
  
  // Add transaction record
  transactions.value.unshift({
    id: Date.now(),
    type: 'transfer',
    description: 'Para yükleme (Kredi Kartı)',
    amount: parseFloat(addMoneyForm.value.amount),
    date: new Date(),
    reference: `#TL-${Math.random().toString().substr(2, 6)}`,
    status: 'Tamamlandı'
  })
  
  showAddMoney.value = false
  addMoneyForm.value = { amount: '', paymentMethod: '' }
  
  alert('Para başarıyla yüklendi!')
}

const withdrawMoney = () => {
  const amount = parseFloat(withdrawForm.value.amount)
  
  if (amount > wallet.value.balance) {
    alert('Yetersiz bakiye!')
    return
  }
  
  // Simulate withdrawing money
  wallet.value.balance -= amount
  
  // Add transaction record
  transactions.value.unshift({
    id: Date.now(),
    type: 'expense',
    description: 'Para çekme işlemi',
    amount: amount,
    date: new Date(),
    reference: `#TL-${Math.random().toString().substr(2, 6)}`,
    status: 'İşlemde'
  })
  
  showWithdraw.value = false
  withdrawForm.value = { amount: '', bankAccount: '' }
  
  alert('Para çekme talebi oluşturuldu!')
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
