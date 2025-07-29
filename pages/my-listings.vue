<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">İlanlarım</h1>
              <p class="mt-2 text-gray-600">Yayınladığınız ürünleri yönetin</p>
            </div>
            <NuxtLink 
              to="/sell" 
              class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              + Yeni İlan
            </NuxtLink>
          </div>
        </div>

        <!-- Under Construction Message -->
        <div class="bg-white rounded-lg shadow-sm p-12 text-center">
          <div class="max-w-md mx-auto">
            <div class="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span class="text-4xl">🚧</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Sayfa Hazırlanıyor</h2>
            <p class="text-gray-600 mb-6">
              İlanlarım sayfası şu anda geliştirme aşamasında. Yakında burada tüm ilanlarınızı yönetebileceksiniz.
            </p>
            <div class="space-y-3 text-sm text-gray-500">
              <div class="flex items-center justify-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                İlan listeleme
              </div>
              <div class="flex items-center justify-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                İlan düzenleme
              </div>
              <div class="flex items-center justify-center">
                <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                İstatistikler
              </div>
              <div class="flex items-center justify-center">
                <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Mesajlar
              </div>
            </div>
            <div class="mt-8 flex space-x-4 justify-center">
              <NuxtLink 
                to="/dashboard" 
                class="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Dashboard'a Dön
              </NuxtLink>
              <NuxtLink 
                to="/sell" 
                class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yeni İlan Ver
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'İlanlarım - TagList',
  description: 'Yayınladığınız ürün ilanlarını yönetin ve takip edin.'
})
</script>
