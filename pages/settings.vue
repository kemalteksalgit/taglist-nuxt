<script setup>
// SEO
useHead({
  title: 'Ayarlar - TagList',
  meta: [
    { name: 'description', content: 'TagList hesap ayarları, bildirimler ve güvenlik.' }
  ]
})

// State
const activeTab = ref('account')
const isLoading = ref(false)

// Settings tabs
const settingsTabs = ref([
  { id: 'account', name: 'Hesap Bilgileri', icon: '👤', description: 'Profil ve kişisel bilgiler' },
  { id: 'notifications', name: 'Bildirimler', icon: '🔔', description: 'E-posta ve push bildirimleri' },
  { id: 'privacy', name: 'Gizlilik & Güvenlik', icon: '🔒', description: 'Güvenlik ve veri ayarları' },
  { id: 'business', name: 'Satıcı Ayarları', icon: '🏢', description: 'İşletme ve satış ayarları' },
  { id: 'payment', name: 'Ödeme', icon: '💳', description: 'Ödeme yöntemleri ve fatura' },
  { id: 'preferences', name: 'Tercihler', icon: '⚙️', description: 'Uygulama tercihleri' }
])

// User data
const userData = ref({
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  phone: '+90 555 123 45 67',
  avatar: 'https://i.pravatar.cc/150?img=1',
  location: 'İstanbul, Türkiye',
  birthDate: '1990-05-15',
  gender: 'male'
})

// Notification settings
const notifications = ref({
  email: {
    newMessages: true,
    productUpdates: true,
    promotions: false,
    newsletter: true
  },
  push: {
    newMessages: true,
    bids: true,
    sales: true,
    promotions: false
  },
  sms: {
    important: true,
    marketing: false
  }
})

// Privacy settings
const privacy = ref({
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  allowMessages: true,
  twoFactorAuth: false
})

// Business settings
const business = ref({
  businessName: '',
  taxNumber: '',
  businessType: 'individual',
  businessAddress: '',
  autoResponse: false,
  businessHours: {
    enabled: false,
    start: '09:00',
    end: '18:00'
  }
})

// Methods
const saveSettings = async (section) => {
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert(`${section} ayarları kaydedildi!`)
  } catch (error) {
    alert('Ayarlar kaydedilirken bir hata oluştu.')
  } finally {
    isLoading.value = false
  }
}

const uploadAvatar = () => {
  alert('Profil fotoğrafı yükleme özelliği yakında aktif olacak!')
}

const exportData = () => {
  alert('Verileriniz hazırlanıyor...')
}

const deleteAccount = () => {
  if (confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?')) {
    alert('Hesap silme işlemi başlatıldı.')
  }
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      
      <!-- Modern Header -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
        <div class="absolute inset-0 opacity-20">
          <div class="w-full h-full" style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;"></div>
        </div>
        
        <div class="relative pt-20 pb-16">
          <div class="max-w-6xl mx-auto px-6 text-center">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h1 class="text-4xl font-bold text-white mb-4">Ayarlar</h1>
            <p class="text-xl text-white/80">Hesabınızı ve tercihlerinizi yönetin</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        
        <!-- Settings Navigation -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1">
            <button
              v-for="tab in settingsTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'p-4 rounded-xl text-left transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ tab.icon }}</span>
                <div>
                  <h3 class="font-semibold">{{ tab.name }}</h3>
                  <p :class="activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'" class="text-sm">{{ tab.description }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          
          <!-- Account Settings -->
          <div v-if="activeTab === 'account'" class="space-y-8">
            <div class="flex items-center space-x-4 mb-8">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">👤</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Hesap Bilgileri</h2>
                <p class="text-gray-600">Profil ve kişisel bilgilerinizi güncelleyin</p>
              </div>
            </div>

            <!-- Profile Photo -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">Profil Fotoğrafı</h3>
              <div class="flex items-center space-x-6">
                <div class="relative">
                  <img :src="userData.avatar" :alt="userData.name" class="w-20 h-20 rounded-full object-cover">
                  <button @click="uploadAvatar" class="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                    <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    </svg>
                  </button>
                </div>
                <div>
                  <p class="text-sm text-gray-600 mb-2">JPG, PNG veya GIF dosyası seçin (Max: 5MB)</p>
                  <button @click="uploadAvatar" class="text-blue-600 hover:text-blue-700 text-sm font-medium">Fotoğraf Yükle</button>
                </div>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">Kişisel Bilgiler</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                  <input v-model="userData.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                  <input v-model="userData.email" type="email" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input v-model="userData.phone" type="tel" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Konum</label>
                  <input v-model="userData.location" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
              <div class="mt-6">
                <button @click="saveSettings('hesap')" :disabled="isLoading" class="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {{ isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Notifications Settings -->
          <div v-if="activeTab === 'notifications'" class="space-y-8">
            <div class="flex items-center space-x-4 mb-8">
              <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">🔔</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Bildirim Ayarları</h2>
                <p class="text-gray-600">Hangi bildirimleri almak istediğinizi seçin</p>
              </div>
            </div>

            <!-- Email Notifications -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">E-posta Bildirimleri</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Yeni Mesajlar</p>
                    <p class="text-sm text-gray-600">Yeni mesaj aldığınızda e-posta gönder</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="notifications.email.newMessages" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Ürün Güncellemeleri</p>
                    <p class="text-sm text-gray-600">İlanlarınız hakkında bildirimler</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="notifications.email.productUpdates" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Push Notifications -->
            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">Push Bildirimleri</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Anında Mesajlar</p>
                    <p class="text-sm text-gray-600">Yeni mesajlar için push bildirimi</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="notifications.push.newMessages" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              <div class="mt-6">
                <button @click="saveSettings('bildirimler')" :disabled="isLoading" class="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {{ isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Privacy Settings -->
          <div v-if="activeTab === 'privacy'" class="space-y-8">
            <div class="flex items-center space-x-4 mb-8">
              <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">🔒</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Gizlilik & Güvenlik</h2>
                <p class="text-gray-600">Hesap güvenliği ve gizlilik ayarları</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">Hesap Güvenliği</h3>
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">İki Faktörlü Doğrulama</p>
                    <p class="text-sm text-gray-600">Hesabınız için ek güvenlik katmanı</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="privacy.twoFactorAuth" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div class="pt-4 border-t border-gray-200">
                  <button @click="exportData" class="text-blue-600 hover:text-blue-700 font-medium mr-6">Verilerimi İndir</button>
                  <button @click="deleteAccount" class="text-red-600 hover:text-red-700 font-medium">Hesabı Sil</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Business Settings -->
          <div v-if="activeTab === 'business'" class="space-y-8">
            <div class="flex items-center space-x-4 mb-8">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">🏢</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Satıcı Ayarları</h2>
                <p class="text-gray-600">İşletme ve satış ayarlarınızı yönetin</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">İşletme Bilgileri</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">İşletme Adı</label>
                  <input v-model="business.businessName" type="text" placeholder="Şirket veya mağaza adı" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Vergi Numarası</label>
                  <input v-model="business.taxNumber" type="text" placeholder="11 haneli vergi numarası" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">İşletme Türü</label>
                  <select v-model="business.businessType" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="individual">Bireysel Satıcı</option>
                    <option value="company">Şirket</option>
                    <option value="sole">Şahıs Şirketi</option>
                  </select>
                </div>
              </div>
              
              <div class="mt-6 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Otomatik Yanıt</p>
                    <p class="text-sm text-gray-600">Mesajlara otomatik yanıt gönder</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="business.autoResponse" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div class="mt-6">
                <button @click="saveSettings('işletme')" :disabled="isLoading" class="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {{ isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Payment Settings -->
          <div v-if="activeTab === 'payment'" class="space-y-8">
            <div class="flex items-center space-x-4 mb-8">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">💳</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Ödeme Ayarları</h2>
                <p class="text-gray-600">Ödeme yöntemleri ve fatura bilgileri</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">Banka Hesabı</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Banka Adı</label>
                  <select class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Banka Seçiniz</option>
                    <option>Ziraat Bankası</option>
                    <option>İş Bankası</option>
                    <option>Garanti BBVA</option>
                    <option>Akbank</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                  <input type="text" placeholder="TR00 0000 0000 0000 0000 0000 00" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
              
              <div class="mt-6">
                <button @click="saveSettings('ödeme')" :disabled="isLoading" class="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {{ isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Preferences Settings -->
          <div v-if="activeTab === 'preferences'" class="space-y-8">
            <div class="flex items-center space-x-4 mb-8">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span class="text-2xl">⚙️</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">Uygulama Tercihleri</h2>
                <p class="text-gray-600">Kişisel tercih ve görünüm ayarları</p>
              </div>
            </div>

            <div class="bg-gray-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold mb-4">Görünüm Ayarları</h3>
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                  <select class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Türkçe</option>
                    <option>English</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Para Birimi</label>
                  <select class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Türk Lirası (₺)</option>
                    <option>US Dollar ($)</option>
                    <option>Euro (€)</option>
                  </select>
                </div>
                
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Koyu Tema</p>
                    <p class="text-sm text-gray-600">Gece modu kullan</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div class="mt-6">
                <button @click="saveSettings('tercihler')" :disabled="isLoading" class="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {{ isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Fallback for non-implemented sections -->
          <div v-else-if="!['account', 'notifications', 'privacy', 'business', 'payment', 'preferences'].includes(activeTab)" class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="text-3xl">{{ settingsTabs.find(t => t.id === activeTab)?.icon }}</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ settingsTabs.find(t => t.id === activeTab)?.name }}</h3>
            <p class="text-gray-600">Bu bölüm yakında aktif olacak.</p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
