<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">💰 Canlı Açık Artırma Analytics</h1>
        <p class="text-gray-600 mt-2">Sadece gerçek para akışı ve finansal metrikler</p>
      </div>

      <!-- Key Money Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Revenue -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Toplam Gelir</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatPrice(analytics.totalRevenue) }}</p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-green-600 font-medium">+{{ analytics.revenueGrowth }}%</span>
              <span class="text-gray-500 ml-2">son 24 saat</span>
            </div>
          </div>
        </div>

        <!-- Average Bid Value -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:chart-bar" class="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Ortalama Teklif</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatPrice(analytics.averageBidValue) }}</p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-blue-600 font-medium">{{ analytics.totalBids }}</span>
              <span class="text-gray-500 ml-2">toplam teklif</span>
            </div>
          </div>
        </div>

        <!-- Conversion Rate -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:arrow-trending-up" class="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Dönüşüm Oranı</p>
              <p class="text-2xl font-bold text-gray-900">{{ analytics.conversionRate.toFixed(1) }}%</p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-purple-600 font-medium">{{ analytics.completedSales }}</span>
              <span class="text-gray-500 ml-2">tamamlanan satış</span>
            </div>
          </div>
        </div>

        <!-- Active Bidders -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="heroicons:users" class="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Aktif Teklif Verenler</p>
              <p class="text-2xl font-bold text-gray-900">{{ analytics.activeBidders }}</p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-orange-600 font-medium">{{ formatPrice(analytics.averageSpendPerUser) }}</span>
              <span class="text-gray-500 ml-2">kullanıcı başına</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Chart & Top Spenders -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Revenue Timeline -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💹 Gelir Akışı (Son 24 Saat)</h3>
          <div class="space-y-4">
            <div 
              v-for="period in revenueTimeline" 
              :key="period.hour"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="text-sm text-gray-600">{{ period.hour }}:00</div>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-500 h-2 rounded-full" 
                    :style="{ width: `${(period.revenue / maxHourlyRevenue) * 100}%` }"
                  ></div>
                </div>
              </div>
              <div class="text-sm font-bold text-gray-900">{{ formatPrice(period.revenue) }}</div>
            </div>
          </div>
        </div>

        <!-- Top Money Spenders -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 En Çok Para Harcayanlar</h3>
          <div class="space-y-3">
            <div 
              v-for="(spender, index) in topSpenders" 
              :key="spender.userId"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  ]">
                    {{ index + 1 }}
                  </div>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ spender.userName }}</div>
                  <div class="text-sm text-gray-500">{{ spender.totalBids }} teklif</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-bold text-gray-900">{{ formatPrice(spender.totalSpent) }}</div>
                <div class="text-sm text-gray-500">ortalama {{ formatPrice(spender.averageBid) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Auctions Money Status -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🔴 Aktif Açık Artırmalar</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevcut Fiyat</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Gelir</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teklif Sayısı</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif Kullanıcı</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan Süre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="auction in liveAuctions" :key="auction.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img :src="auction.productImage" :alt="auction.productName" class="w-10 h-10 rounded-lg object-cover" />
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ auction.productName }}</div>
                      <div class="text-sm text-gray-500">ID: {{ auction.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-green-600">{{ formatPrice(auction.currentPrice) }}</div>
                  <div class="text-xs text-gray-500">başlangıç: {{ formatPrice(auction.startingPrice) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ formatPrice(auction.totalRevenue) }}</div>
                  <div class="text-xs text-gray-500">{{ ((auction.totalRevenue / auction.startingPrice - 1) * 100).toFixed(1) }}% artış</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ auction.totalBids }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ auction.activeBidders }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatTimeRemaining(auction.endsAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    auction.status === 'active' ? 'bg-green-100 text-green-800' :
                    auction.status === 'ending_soon' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  ]">
                    {{ auction.status === 'active' ? 'Aktif' : auction.status === 'ending_soon' ? 'Bitiyor' : 'Bitti' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Payment Methods -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💳 Ödeme Yöntemleri</h3>
          <div class="space-y-3">
            <div v-for="method in paymentMethods" :key="method.type" class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div :class="[
                  'w-3 h-3 rounded-full',
                  method.type === 'card' ? 'bg-blue-500' :
                  method.type === 'bank' ? 'bg-green-500' : 'bg-purple-500'
                ]"></div>
                <span class="text-sm text-gray-600">{{ method.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-bold">{{ formatPrice(method.totalAmount) }}</div>
                <div class="text-xs text-gray-500">{{ method.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction Status -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 İşlem Durumu</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Başarılı İşlemler</span>
              <div class="text-right">
                <div class="text-sm font-bold text-green-600">{{ formatPrice(transactionStats.successful) }}</div>
                <div class="text-xs text-gray-500">{{ transactionStats.successfulCount }} işlem</div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Bekleyen İşlemler</span>
              <div class="text-right">
                <div class="text-sm font-bold text-yellow-600">{{ formatPrice(transactionStats.pending) }}</div>
                <div class="text-xs text-gray-500">{{ transactionStats.pendingCount }} işlem</div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Başarısız İşlemler</span>
              <div class="text-right">
                <div class="text-sm font-bold text-red-600">{{ formatPrice(transactionStats.failed) }}</div>
                <div class="text-xs text-gray-500">{{ transactionStats.failedCount }} işlem</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Refund Analytics -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🔄 İade Analizi</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Toplam İade</span>
              <div class="text-right">
                <div class="text-sm font-bold">{{ formatPrice(refundStats.totalAmount) }}</div>
                <div class="text-xs text-gray-500">{{ refundStats.count }} iade</div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">İade Oranı</span>
              <div class="text-sm font-bold">{{ refundStats.rate }}%</div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Ortalama İade Süresi</span>
              <div class="text-sm font-bold">{{ refundStats.averageTime }}h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Analytics data - ALL MONEY-FOCUSED
const analytics = ref({
  totalRevenue: 245750,
  averageBidValue: 425,
  conversionRate: 8.5,
  activeBidders: 127,
  totalBids: 578,
  completedSales: 49,
  averageSpendPerUser: 1935,
  revenueGrowth: 12.5
})

// Revenue timeline (hourly)
const revenueTimeline = ref([
  { hour: 0, revenue: 5250 },
  { hour: 1, revenue: 3100 },
  { hour: 2, revenue: 1950 },
  { hour: 3, revenue: 2200 },
  { hour: 4, revenue: 3800 },
  { hour: 5, revenue: 4150 },
  { hour: 6, revenue: 6200 },
  { hour: 7, revenue: 8900 },
  { hour: 8, revenue: 12500 },
  { hour: 9, revenue: 15200 },
  { hour: 10, revenue: 18750 },
  { hour: 11, revenue: 22100 },
  { hour: 12, revenue: 25300 },
  { hour: 13, revenue: 21800 },
  { hour: 14, revenue: 19650 },
  { hour: 15, revenue: 17200 },
  { hour: 16, revenue: 20100 },
  { hour: 17, revenue: 23450 },
  { hour: 18, revenue: 27800 },
  { hour: 19, revenue: 31200 },
  { hour: 20, revenue: 28900 },
  { hour: 21, revenue: 25600 },
  { hour: 22, revenue: 19300 },
  { hour: 23, revenue: 14750 }
])

// Top spenders
const topSpenders = ref([
  { userId: '1', userName: 'Ahmet Kaya', totalSpent: 15750, totalBids: 37, averageBid: 425 },
  { userId: '2', userName: 'Zeynep Demir', totalSpent: 12300, totalBids: 29, averageBid: 424 },
  { userId: '3', userName: 'Mehmet Özkan', totalSpent: 9850, totalBids: 22, averageBid: 448 },
  { userId: '4', userName: 'Ayşe Yılmaz', totalSpent: 8200, totalBids: 19, averageBid: 432 },
  { userId: '5', userName: 'Fatma Şahin', totalSpent: 7600, totalBids: 18, averageBid: 422 }
])

// Live auctions
const liveAuctions = ref([
  {
    id: 'live_001',
    productName: 'iPhone 14 Pro Max',
    productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
    currentPrice: 18500,
    startingPrice: 12000,
    totalRevenue: 145200,
    totalBids: 67,
    activeBidders: 23,
    endsAt: new Date(Date.now() + 45 * 60 * 1000),
    status: 'active'
  },
  {
    id: 'live_002',
    productName: 'MacBook Pro M2',
    productImage: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100',
    currentPrice: 25400,
    startingPrice: 18000,
    totalRevenue: 189600,
    totalBids: 42,
    activeBidders: 15,
    endsAt: new Date(Date.now() + 12 * 60 * 1000),
    status: 'ending_soon'
  }
])

// Payment methods analytics
const paymentMethods = ref([
  { type: 'card', name: 'Kredi/Banka Kartı', totalAmount: 167250, percentage: 68 },
  { type: 'bank', name: 'Banka Transferi', totalAmount: 58650, percentage: 24 },
  { type: 'wallet', name: 'Dijital Cüzdan', totalAmount: 19850, percentage: 8 }
])

// Transaction status
const transactionStats = ref({
  successful: 215600,
  successfulCount: 387,
  pending: 18200,
  pendingCount: 26,
  failed: 11950,
  failedCount: 19
})

// Refund analytics
const refundStats = ref({
  totalAmount: 8750,
  count: 12,
  rate: 2.1,
  averageTime: 4.5
})

// Computed values
const maxHourlyRevenue = computed(() => {
  return Math.max(...revenueTimeline.value.map(p => p.revenue))
})

// Format price
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format time remaining
const formatTimeRemaining = (endDate: Date) => {
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  
  if (diff <= 0) return 'Bitti'
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}s ${minutes % 60}dk`
  }
  return `${minutes}dk`
}

// SEO
useSeoMeta({
  title: 'Live Auction Analytics - TagList Admin',
  description: 'Real-money live auction analytics and financial metrics dashboard',
  robots: 'noindex, nofollow'
})
</script>
