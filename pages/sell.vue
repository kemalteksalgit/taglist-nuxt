<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <Icon name="heroicons:plus" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'İlan Düzenle' : 'İlan Ver' }}
            </h1>
            <p class="text-gray-600">
              {{ isEditMode ? 'Ürün bilgilerinizi güncelleyin' : 'Ürününüzü satışa çıkarın' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <form @submit.prevent="submitListing" :key="formKey" class="space-y-8">
        <!-- Ürün Bilgileri -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Icon name="heroicons:information-circle" class="w-5 h-5 mr-2 text-blue-600" />
            Ürün Bilgileri
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ürün Başlığı *
              </label>
              <input
                v-model="form.title"
                :key="`title-${formKey}`"
                type="text"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Ürününüzün başlığını yazın"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                v-model="form.category"
                :key="`category-${formKey}`"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              >
                <option value="">Kategori seçin</option>
                <option value="electronics">Elektronik</option>
                <option value="giyim">Giyim & Aksesuar</option>
                <option value="ev-yasam">Ev & Yaşam</option>
                <option value="vehicles">Otomobil</option>
                <option value="emlak">Emlak</option>
                <option value="hobi">Hobi & Oyuncak</option>
                <option value="spor">Spor & Outdoor</option>
                <option value="kitap">Kitap & Dergi</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Durum *
              </label>
              <select
                v-model="form.condition"
                :key="`condition-${formKey}`"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              >
                <option value="">Durum seçin</option>
                <option value="new">Sıfır</option>
                <option value="excellent">Mükemmel</option>
                <option value="good">İyi</option>
                <option value="fair">Orta</option>
                <option value="poor">Eski</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Fiyat *
              </label>
              <div class="relative">
                <input
                  v-model="form.price"
                  :key="`price-${formKey}`"
                  type="number"
                  required
                  min="0"
                  class="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  placeholder="0"
                />
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <span class="text-gray-500 text-sm font-medium">₺</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pazarlık
              </label>
              <div class="flex items-center space-x-6">
                <label class="flex items-center">
                  <input
                    v-model="form.negotiable"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">Pazarlık açık</span>
                </label>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                v-model="form.description"
                :key="`description-${formKey}`"
                required
                rows="5"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900"
                placeholder="Ürününüzü detaylı bir şekilde açıklayın..."
              ></textarea>
              <p class="text-sm text-gray-500 mt-1">
                {{ form.description.length }}/1000 karakter
              </p>
            </div>
          </div>
        </div>

        <!-- Fotoğraflar -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Icon name="heroicons:camera" class="w-5 h-5 mr-2 text-blue-600" />
            Fotoğraflar
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              v-for="(photo, index) in form.photos"
              :key="index"
              class="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group"
            >
              <img
                :src="photo.url"
                :alt="photo.name"
                class="w-full h-full object-cover"
              />
              <button
                @click="removePhoto(index)"
                type="button"
                class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </div>
            
            <label
              v-if="form.photos.length < 8"
              class="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Icon name="heroicons:plus" class="w-8 h-8 text-gray-400 mb-2" />
              <span class="text-sm text-gray-500">Fotoğraf Ekle</span>
              <input
                type="file"
                multiple
                accept="image/*"
                @change="handlePhotoUpload"
                class="hidden"
              />
            </label>
          </div>
          
          <p class="text-sm text-gray-500 mt-4">
            En fazla 8 fotoğraf yükleyebilirsiniz. İlk fotoğraf kapak fotoğrafı olacaktır.
          </p>
        </div>

        <!-- Konum -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Icon name="heroicons:map-pin" class="w-5 h-5 mr-2 text-blue-600" />
            Konum
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                İl *
              </label>
              <select
                v-model="form.city"
                :key="`city-${formKey}`"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              >
                <option value="">İl seçin</option>
                <option value="istanbul">İstanbul</option>
                <option value="ankara">Ankara</option>
                <option value="izmir">İzmir</option>
                <option value="bursa">Bursa</option>
                <option value="antalya">Antalya</option>
                <option value="adana">Adana</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                İlçe *
              </label>
              <select
                v-model="form.district"
                :key="`district-${formKey}`"
                required
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              >
                <option value="">İlçe seçin</option>
                <option value="kadikoy">Kadıköy</option>
                <option value="besiktas">Beşiktaş</option>
                <option value="sisli">Şişli</option>
                <option value="uskudar">Üsküdar</option>
              </select>
            </div>
          </div>
        </div>

        <!-- İletişim -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Icon name="heroicons:phone" class="w-5 h-5 mr-2 text-blue-600" />
            İletişim Bilgileri
          </h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası
              </label>
              <input
                v-model="form.phone"
                :key="`phone-${formKey}`"
                type="tel"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div class="flex items-center space-x-6">
              <label class="flex items-center">
                <input
                  v-model="form.showPhone"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Telefon numaramı göster</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.allowMessages"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Mesaj almaya açığım</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Şartlar ve Koşullar -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-start space-x-3">
            <input
              v-model="form.acceptTerms"
              type="checkbox"
              required
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <div class="text-sm text-gray-700">
              <a href="/terms" class="text-blue-600 hover:underline">Kullanım Şartları</a>'nı ve 
              <a href="/privacy" class="text-blue-600 hover:underline">Gizlilik Politikası</a>'nı okudum, kabul ediyorum.
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            class="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
          >
            Taslak Kaydet
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ isEditMode ? 'İlanı Güncelle' : 'İlanı Yayınla' }}
          </button>
        </div>
      </form>
    </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Client-side reactive check
const isClient = ref(false)
const formKey = ref(0) // Force form refresh

// Edit mode logic - only works on client
const isEditMode = computed(() => isClient.value && !!route.query.edit)
const editProductId = computed(() => isClient.value ? route.query.edit : null)

// SEO
useHead({
  title: isEditMode.value ? 'İlan Düzenle - TagList' : 'İlan Ver - TagList',
  meta: [
    { name: 'description', content: isEditMode.value ? 'İlanınızı düzenleyin' : 'TagList\'te kolayca ilan verin. Ürününüzü satışa çıkarın.' }
  ]
})

// Form data - initialize with client-side check
const form = ref({
  title: '',
  category: '',
  condition: '',
  price: '',
  negotiable: false,
  description: '',
  photos: [],
  city: '',
  district: '',
  phone: '',
  showPhone: true,
  allowMessages: true,
  acceptTerms: false
})

// Client-side form initialization
const isClientReady = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.title && 
         form.value.category && 
         form.value.condition && 
         form.value.price && 
         form.value.description && 
         form.value.city && 
         form.value.district && 
         form.value.acceptTerms
})

// Methods
const handlePhotoUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (form.value.photos.length < 8) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.photos.push({
          name: file.name,
          url: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removePhoto = (index) => {
  form.value.photos.splice(index, 1)
}

const submitListing = () => {
  if (isFormValid.value) {
    if (isEditMode.value) {
      // Güncelleme işlemi
      alert('İlanınız başarıyla güncellendi!')
    } else {
      // Yeni ilan oluşturma işlemi
      alert('İlanınız başarıyla yayınlandı!')
    }
    navigateTo('/profile')
  }
}

// Mock product data - gerçek uygulamada API'den gelecek
const mockProducts = {
  '1': {
    title: 'iPhone 13 Pro Max 256GB',
    category: 'electronics',
    condition: 'excellent',
    price: '35000',
    negotiable: true,
    description: 'Temiz kullanılmış iPhone 13 Pro Max. Tüm aksesuarları mevcut. Garantisi devam ediyor.',
    photos: [
      { name: 'iphone1.jpg', url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300' }
    ],
    city: 'istanbul',
    district: 'kadikoy',
    phone: '+90 532 123 45 67',
    showPhone: true,
    allowMessages: true
  },
  '2': {
    title: 'MacBook Pro M2 16"',
    category: 'electronics',
    condition: 'good',
    price: '55000',
    negotiable: false,
    description: 'MacBook Pro M2 16 inç. Çok az kullanılmış, performans mükemmel.',
    photos: [
      { name: 'macbook1.jpg', url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300' }
    ],
    city: 'istanbul',
    district: 'kadikoy',
    phone: '+90 532 123 45 67',
    showPhone: true,
    allowMessages: true
  },
  '3': {
    title: 'BMW 320i 2020 Model',
    category: 'vehicles',
    condition: 'excellent',
    price: '750000',
    negotiable: true,
    description: '2020 model BMW 320i. Bakımlı, hasarsız. Tüm bakımları zamanında yapılmış.',
    photos: [
      { name: 'bmw1.jpg', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300' }
    ],
    city: 'istanbul',
    district: 'kadikoy',
    phone: '+90 532 123 45 67',
    showPhone: true,
    allowMessages: true
  }
}

// Load product data for editing
const loadProductData = async () => {
  if (!isClient.value) return
  
  if (isEditMode.value && editProductId.value) {
    const productData = mockProducts[editProductId.value]
    if (productData) {
      // Form'u mevcut ürün verileriyle doldur
      await nextTick() // DOM'un hazır olmasını bekle
      
      // Reset form first, then assign
      Object.keys(form.value).forEach(key => {
        if (productData.hasOwnProperty(key)) {
          form.value[key] = productData[key]
        }
      })
      
      form.value.acceptTerms = true // Edit mode'da terms zaten kabul edilmiş sayılır
      isClientReady.value = true
      formKey.value++ // Force form refresh
      console.log('Product data loaded:', productData.title) // Debug
    }
  } else {
    isClientReady.value = true
  }
}

// Initialize component
onMounted(async () => {
  isClient.value = true
  await nextTick()
  setTimeout(() => {
    loadProductData()
  }, 100) // Small delay to ensure client hydration
})

// Watch route changes for client-side navigation
watch(() => route.query.edit, () => {
  if (isClient.value) {
    setTimeout(() => {
      loadProductData()
    }, 50)
  }
}, { immediate: false })
</script>

<style scoped>
/* Component specific styles */
</style>