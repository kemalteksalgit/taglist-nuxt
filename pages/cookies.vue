<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">🍪 Çerez Politikası</h1>
        <p class="text-xl opacity-90">Web sitemizde çerezleri nasıl kullandığımız</p>
        <p class="text-sm opacity-75 mt-4">Son güncellenme: 25 Temmuz 2025</p>
      </div>
    </div>

    <!-- Cookie Settings Card -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">🔧 Çerez Ayarları</h2>
        <p class="text-gray-600 mb-6">
          Hangi çerez türlerini kabul etmek istediğinizi seçebilirsiniz. Zorunlu çerezler site işlevselliği için gereklidir.
        </p>
        
        <div class="space-y-4">
          <!-- Essential Cookies -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-semibold text-gray-900">Zorunlu Çerezler</h3>
              <p class="text-sm text-gray-600">Site işlevselliği için gerekli</p>
            </div>
            <div class="bg-green-500 text-white px-3 py-1 rounded text-sm">
              Zorunlu
            </div>
          </div>

          <!-- Analytics Cookies -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-semibold text-gray-900">Analitik Çerezler</h3>
              <p class="text-sm text-gray-600">Site performansını analiz etmek için</p>
            </div>
            <label class="flex items-center">
              <input v-model="cookieSettings.analytics" type="checkbox" class="mr-2" />
              <span class="text-sm">Kabul Et</span>
            </label>
          </div>

          <!-- Marketing Cookies -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-semibold text-gray-900">Pazarlama Çerezleri</h3>
              <p class="text-sm text-gray-600">Kişiselleştirilmiş reklamlar için</p>
            </div>
            <label class="flex items-center">
              <input v-model="cookieSettings.marketing" type="checkbox" class="mr-2" />
              <span class="text-sm">Kabul Et</span>
            </label>
          </div>

          <!-- Functionality Cookies -->
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 class="font-semibold text-gray-900">İşlevsellik Çerezleri</h3>
              <p class="text-sm text-gray-600">Gelişmiş site özellikleri için</p>
            </div>
            <label class="flex items-center">
              <input v-model="cookieSettings.functionality" type="checkbox" class="mr-2" />
              <span class="text-sm">Kabul Et</span>
            </label>
          </div>
        </div>

        <div class="flex space-x-4 mt-6">
          <button 
            @click="saveSettings"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ayarları Kaydet
          </button>
          <button 
            @click="acceptAll"
            class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Tümünü Kabul Et
          </button>
          <button 
            @click="rejectAll"
            class="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Zorunlu Dışında Reddet
          </button>
        </div>
      </div>
    </div>

    <!-- Cookie Information -->
    <div class="max-w-4xl mx-auto px-4 pb-16">
      <div class="bg-white rounded-lg shadow-sm p-8">
        
        <!-- What are Cookies -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Çerez Nedir?</h2>
          <p class="text-gray-600 mb-4">
            Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınız tarafından cihazınızda saklanan 
            küçük metin dosyalarıdır. Bu dosyalar, web sitesinin çalışması, güvenliğin sağlanması 
            ve kullanıcı deneyiminin iyileştirilmesi için kullanılır.
          </p>
          <p class="text-gray-600">
            TagList olarak, size daha iyi bir deneyim sunmak ve web sitemizi geliştirmek için 
            çerezleri kullanıyoruz.
          </p>
        </section>

        <!-- Types of Cookies -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Çerez Türleri</h2>
          
          <div class="space-y-6">
            <!-- Essential Cookies -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-red-600 text-sm">⚡</span>
                </span>
                Zorunlu Çerezler
              </h3>
              <p class="text-gray-600 mb-3">
                Web sitesinin temel işlevlerinin çalışması için gerekli olan çerezlerdir. 
                Bu çerezler olmadan site düzgün çalışmaz.
              </p>
              <div class="bg-gray-50 p-3 rounded">
                <h4 class="font-medium mb-2">Örnekler:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Oturum yönetimi (giriş durumunuz)</li>
                  <li>• Güvenlik token'ları</li>
                  <li>• Site dili ve tema tercihleri</li>
                  <li>• Sepet içeriği</li>
                </ul>
              </div>
            </div>

            <!-- Analytics Cookies -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-blue-600 text-sm">📊</span>
                </span>
                Analitik Çerezler
              </h3>
              <p class="text-gray-600 mb-3">
                Web sitesi trafiğini analiz etmek ve kullanıcı davranışlarını anlamak için kullanılır. 
                Bu veriler anonim olarak toplanır.
              </p>
              <div class="bg-gray-50 p-3 rounded">
                <h4 class="font-medium mb-2">Sağlayıcılar:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Google Analytics</li>
                  <li>• Hotjar (kullanıcı davranış analizi)</li>
                  <li>• TagList iç analitik sistemi</li>
                </ul>
              </div>
            </div>

            <!-- Marketing Cookies -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-green-600 text-sm">📢</span>
                </span>
                Pazarlama Çerezleri
              </h3>
              <p class="text-gray-600 mb-3">
                Size daha uygun reklamlar göstermek ve pazarlama kampanyalarının etkinliğini 
                ölçmek için kullanılır.
              </p>
              <div class="bg-gray-50 p-3 rounded">
                <h4 class="font-medium mb-2">Kullanım Alanları:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Kişiselleştirilmiş reklamlar</li>
                  <li>• Retargeting kampanyaları</li>
                  <li>• Sosyal medya entegrasyonu</li>
                  <li>• A/B test çalışmaları</li>
                </ul>
              </div>
            </div>

            <!-- Functionality Cookies -->
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-purple-600 text-sm">⚙️</span>
                </span>
                İşlevsellik Çerezleri
              </h3>
              <p class="text-gray-600 mb-3">
                Web sitesinin gelişmiş özelliklerini kullanabilmeniz ve tercihlerinizi 
                hatırlayabilmesi için kullanılır.
              </p>
              <div class="bg-gray-50 p-3 rounded">
                <h4 class="font-medium mb-2">Özellikler:</h4>
                <ul class="text-sm text-gray-600 space-y-1">
                  <li>• Konum bazlı hizmetler</li>
                  <li>• Canlı destek widget'ı</li>
                  <li>• Video oynatıcı tercihleri</li>
                  <li>• Dil ve bölge ayarları</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Cookie Management -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Çerezleri Nasıl Kontrol Edebilirsiniz?</h2>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-900 mb-2">🔧 TagList Ayarları</h4>
              <p class="text-sm text-blue-800 mb-3">
                Bu sayfadaki ayarlar panelinden çerez tercihlerinizi yönetebilirsiniz.
              </p>
              <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Yukarıdaki Ayarlara Git ↑
              </button>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-2">🌐 Tarayıcı Ayarları</h4>
              <p class="text-sm text-gray-600 mb-3">
                Tarayıcınızın ayarlarından tüm çerezleri engelleyebilir veya silebilirsiniz.
              </p>
              <ul class="text-xs text-gray-500 space-y-1">
                <li>• Chrome: Ayarlar > Gizlilik ve güvenlik</li>
                <li>• Firefox: Ayarlar > Gizlilik ve Güvenlik</li>
                <li>• Safari: Tercihler > Gizlilik</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Third Party Cookies -->
        <section class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Üçüncü Taraf Çerezleri</h2>
          <p class="text-gray-600 mb-4">
            Web sitemizde kullandığımız bazı üçüncü taraf servislerin çerezleri:
          </p>
          
          <div class="overflow-x-auto">
            <table class="w-full border border-gray-200 rounded-lg">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold">Servis</th>
                  <th class="px-4 py-3 text-left font-semibold">Amaç</th>
                  <th class="px-4 py-3 text-left font-semibold">Süre</th>
                  <th class="px-4 py-3 text-left font-semibold">Gizlilik</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr>
                  <td class="px-4 py-3">Google Analytics</td>
                  <td class="px-4 py-3">Site analizi</td>
                  <td class="px-4 py-3">2 yıl</td>
                  <td class="px-4 py-3">
                    <a href="#" class="text-blue-600 text-sm">Politika</a>
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3">Google Ads</td>
                  <td class="px-4 py-3">Reklamcılık</td>
                  <td class="px-4 py-3">30 gün</td>
                  <td class="px-4 py-3">
                    <a href="#" class="text-blue-600 text-sm">Politika</a>
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3">Facebook Pixel</td>
                  <td class="px-4 py-3">Sosyal medya reklamları</td>
                  <td class="px-4 py-3">180 gün</td>
                  <td class="px-4 py-3">
                    <a href="#" class="text-blue-600 text-sm">Politika</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Contact -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">İletişim</h2>
          <p class="text-gray-600 mb-4">
            Çerez politikası hakkında sorularınız için bizimle iletişime geçebilirsiniz:
          </p>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-gray-700"><strong>E-posta:</strong> privacy@taglist.com</p>
            <p class="text-gray-700"><strong>Telefon:</strong> 0850 123 45 67</p>
          </div>
        </section>

      </div>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue'

useHead({
  title: 'Çerez Politikası - TagList',
  meta: [
    { name: 'description', content: 'TagList çerez politikası. Web sitemizde çerezleri nasıl kullandığımız ve yönettiğimiz.' }
  ]
})

const cookieSettings = ref({
  analytics: false,
  marketing: false,
  functionality: false
})

const saveSettings = () => {
  // Here you would save the cookie preferences
  localStorage.setItem('taglist_cookie_preferences', JSON.stringify(cookieSettings.value))
  alert('Çerez tercihleriniz kaydedildi!')
}

const acceptAll = () => {
  cookieSettings.value = {
    analytics: true,
    marketing: true,
    functionality: true
  }
  saveSettings()
}

const rejectAll = () => {
  cookieSettings.value = {
    analytics: false,
    marketing: false,
    functionality: false
  }
  saveSettings()
}

// Load saved preferences on mount
onMounted(() => {
  const saved = localStorage.getItem('taglist_cookie_preferences')
  if (saved) {
    cookieSettings.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
