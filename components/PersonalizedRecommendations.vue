<!-- components/PersonalizedRecommendations.vue -->
<!-- AI-Powered Personalized Product Recommendations -->

<template>
  <div class="personalized-recommendations">
    <!-- Header Section -->
    <div class="recommendations-header">
      <div class="header-content">
        <h2>Sizin İçin Öneriler</h2>
        <p v-if="userSegments.length > 0" class="user-segments">
          Profil: 
          <span 
            v-for="segment in userSegments" 
            :key="segment"
            class="segment-tag"
          >
            {{ getSegmentName(segment) }}
          </span>
        </p>
      </div>
      
      <div class="header-actions">
        <button 
          @click="refreshRecommendations" 
          class="btn-refresh"
          :disabled="isLoading"
        >
          <Icon name="refresh" :class="{ spinning: isLoading }" />
          Yenile
        </button>
        
        <button @click="showSettings = true" class="btn-settings">
          <Icon name="settings" />
          Ayarlar
        </button>
      </div>
    </div>

    <!-- Recommendation Quality Indicators -->
    <div v-if="recommendationMeta" class="quality-indicators">
      <div class="indicator">
        <Icon name="target" />
        <span>Güven: {{ Math.round(recommendationMeta.confidence * 100) }}%</span>
      </div>
      <div class="indicator">
        <Icon name="clock" />
        <span>Güncellik: {{ Math.round(recommendationMeta.freshness * 100) }}%</span>
      </div>
      <div class="indicator">
        <Icon name="variety" />
        <span>Çeşitlilik: {{ Math.round(recommendationMeta.diversity * 100) }}%</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <LoadingSpinner size="large" />
      <p>Kişiselleştirilmiş öneriler hazırlanıyor...</p>
      <div class="processing-info">
        <div class="process-step" :class="{ active: loadingStep >= 1 }">
          <span class="step-dot"></span>
          <span>Profil analizi</span>
        </div>
        <div class="process-step" :class="{ active: loadingStep >= 2 }">
          <span class="step-dot"></span>
          <span>Davranış değerlendirmesi</span>
        </div>
        <div class="process-step" :class="{ active: loadingStep >= 3 }">
          <span class="step-dot"></span>
          <span>AI öneriler</span>
        </div>
        <div class="process-step" :class="{ active: loadingStep >= 4 }">
          <span class="step-dot"></span>
          <span>Sıralama optimizasyonu</span>
        </div>
      </div>
    </div>

    <!-- Recommendations Categories -->
    <div v-else class="recommendations-content">
      
      <!-- Trending for You -->
      <RecommendationSection
        v-if="trendingProducts.length > 0"
        title="Sizin İçin Trend"
        subtitle="Kişisel zevkinize uygun popüler ürünler"
        :products="trendingProducts"
        category="trending"
        @product-click="handleProductClick"
        @product-save="handleProductSave"
      />

      <!-- Based on Your History -->
      <RecommendationSection
        v-if="historyBasedProducts.length > 0"
        title="Geçmiş Davranışlarınıza Göre"
        subtitle="Daha önce baktığınız ürünlere benzer öneriler"
        :products="historyBasedProducts"
        category="history"
        @product-click="handleProductClick"
        @product-save="handleProductSave"
      />

      <!-- Similar Users Also Liked -->
      <RecommendationSection
        v-if="collaborativeProducts.length > 0"
        title="Benzer Kullanıcıların Beğendikleri"
        subtitle="Size benzer zevklere sahip kullanıcıların favorileri"
        :products="collaborativeProducts"
        category="collaborative"
        @product-click="handleProductClick"
        @product-save="handleProductSave"
      />

      <!-- Personality Match -->
      <RecommendationSection
        v-if="personalityProducts.length > 0"
        title="Kişiliğinize Özel"
        subtitle="Kişilik analizinize göre seçilmiş ürünler"
        :products="personalityProducts"
        category="personality"
        @product-click="handleProductClick"
        @product-save="handleProductSave"
      />

      <!-- Discovery Zone -->
      <RecommendationSection
        v-if="discoveryProducts.length > 0"
        title="Keşif Alanı"
        subtitle="İlginizi çekebilecek yeni kategoriler"
        :products="discoveryProducts"
        category="discovery"
        @product-click="handleProductClick"
        @product-save="handleProductSave"
      />

    </div>

    <!-- Recommendation Reasoning Modal -->
    <Modal v-if="showReasoning" @close="showReasoning = false" size="medium">
      <template #header>
        <h3>Neden Bu Ürünü Öneriyoruz?</h3>
      </template>
      
      <template #body>
        <div v-if="selectedProductReasoning" class="reasoning-content">
          <div class="product-summary">
            <img :src="selectedProductReasoning.product.image" :alt="selectedProductReasoning.product.title">
            <div class="product-info">
              <h4>{{ selectedProductReasoning.product.title }}</h4>
              <p class="brand">{{ selectedProductReasoning.product.brand }}</p>
              <p class="price">{{ formatPrice(selectedProductReasoning.product.price) }}</p>
            </div>
          </div>

          <div class="reasoning-list">
            <div 
              v-for="reason in selectedProductReasoning.reasons" 
              :key="reason"
              class="reason-item"
            >
              <Icon name="check-circle" class="reason-icon" />
              <span>{{ reason }}</span>
            </div>
          </div>

          <div class="personality-match">
            <h5>Kişilik Uyumu</h5>
            <div class="match-bar">
              <div 
                class="match-fill"
                :style="{ width: `${selectedProductReasoning.product.personalityScore * 100}%` }"
              ></div>
            </div>
            <span class="match-percentage">
              {{ Math.round(selectedProductReasoning.product.personalityScore * 100) }}% uyumlu
            </span>
          </div>

          <div class="recommendation-metadata">
            <h5>Öneri Detayları</h5>
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="label">Benzerlik Skoru</span>
                <span class="value">{{ (selectedProductReasoning.product.similarityScore * 100).toFixed(1) }}%</span>
              </div>
              <div class="metadata-item">
                <span class="label">Trend Skoru</span>
                <span class="value">{{ (selectedProductReasoning.product.trendingScore * 100).toFixed(1) }}%</span>
              </div>
              <div class="metadata-item">
                <span class="label">Görüntülenme</span>
                <span class="value">{{ selectedProductReasoning.product.metadata.viewedBy.toLocaleString() }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Beğeni</span>
                <span class="value">{{ selectedProductReasoning.product.metadata.likedBy.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Settings Modal -->
    <Modal v-if="showSettings" @close="showSettings = false" size="large">
      <template #header>
        <h3>Kişiselleştirme Ayarları</h3>
      </template>
      
      <template #body>
        <div class="settings-content">
          <div class="settings-section">
            <h4>Tercih Edilen Kategoriler</h4>
            <div class="category-preferences">
              <label 
                v-for="category in availableCategories" 
                :key="category"
                class="category-checkbox"
              >
                <input 
                  type="checkbox" 
                  :value="category"
                  v-model="preferences.categories"
                >
                <span>{{ category }}</span>
              </label>
            </div>
          </div>

          <div class="settings-section">
            <h4>Fiyat Aralığı</h4>
            <div class="price-range-setting">
              <div class="range-inputs">
                <input 
                  v-model="preferences.priceRange.min" 
                  type="number" 
                  placeholder="Min fiyat"
                >
                <span>-</span>
                <input 
                  v-model="preferences.priceRange.max" 
                  type="number" 
                  placeholder="Max fiyat"
                >
              </div>
              <div class="range-slider">
                <input 
                  type="range" 
                  :min="0" 
                  :max="100000" 
                  :step="100"
                  v-model="preferences.priceRange.min"
                >
                <input 
                  type="range" 
                  :min="0" 
                  :max="100000" 
                  :step="100"
                  v-model="preferences.priceRange.max"
                >
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h4>Tercih Edilen Markalar</h4>
            <div class="brand-preferences">
              <input 
                v-model="newBrand" 
                type="text" 
                placeholder="Marka ekle..."
                @keyup.enter="addBrand"
              >
              <div class="brand-tags">
                <span 
                  v-for="brand in preferences.brands" 
                  :key="brand"
                  class="brand-tag"
                >
                  {{ brand }}
                  <button @click="removeBrand(brand)" class="remove-brand">×</button>
                </span>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h4>Hariç Tutulacaklar</h4>
            <div class="exclusion-settings">
              <div class="exclusion-group">
                <label>Hariç Tutulacak Kategoriler</label>
                <select v-model="newExcludedCategory">
                  <option value="">Kategori seçin...</option>
                  <option v-for="cat in availableCategories" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>
                <button @click="addExcludedCategory" :disabled="!newExcludedCategory">
                  Ekle
                </button>
                <div class="excluded-items">
                  <span 
                    v-for="cat in preferences.excludedCategories"
                    :key="cat"
                    class="excluded-item"
                  >
                    {{ cat }}
                    <button @click="removeExcludedCategory(cat)">×</button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-actions">
            <button @click="savePreferences" class="btn-save">
              Tercihleri Kaydet
            </button>
            <button @click="resetPreferences" class="btn-reset">
              Sıfırla
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Performance Analytics -->
    <div v-if="showAnalytics && analytics" class="analytics-section">
      <details>
        <summary>Kişiselleştirme Performansı</summary>
        <div class="analytics-content">
          <div class="analytics-grid">
            <div class="analytics-item">
              <h5>Profil Tamamlanma</h5>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${analytics.profileCompleteness * 100}%` }"
                ></div>
              </div>
              <span>{{ Math.round(analytics.profileCompleteness * 100) }}%</span>
            </div>

            <div class="analytics-item">
              <h5>Toplam Etkileşim</h5>
              <span class="big-number">{{ analytics.behaviorSummary.totalEvents.toLocaleString() }}</span>
            </div>

            <div class="analytics-item">
              <h5>Son 7 Gün Aktivitesi</h5>
              <span class="big-number">{{ analytics.behaviorSummary.recentActivity.toLocaleString() }}</span>
            </div>
          </div>

          <div class="top-categories">
            <h5>En Çok İlgilenilen Kategoriler</h5>
            <div class="category-scores">
              <div 
                v-for="cat in analytics.topCategories.slice(0, 5)" 
                :key="cat.category"
                class="category-score"
              >
                <span class="category-name">{{ cat.category }}</span>
                <div class="score-bar">
                  <div 
                    class="score-fill"
                    :style="{ width: `${cat.score * 100}%` }"
                  ></div>
                </div>
                <span class="score-value">{{ (cat.score * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <div class="timing-info">
            <h5>İşlem Süreleri</h5>
            <div class="timing-grid">
              <div class="timing-item">
                <span class="timing-label">Toplam</span>
                <span class="timing-value">{{ Math.round(timing?.total || 0) }}ms</span>
              </div>
              <div class="timing-item">
                <span class="timing-label">Profilleme</span>
                <span class="timing-value">{{ Math.round(timing?.profiling || 0) }}ms</span>
              </div>
              <div class="timing-item">
                <span class="timing-label">Öneri Üretme</span>
                <span class="timing-value">{{ Math.round(timing?.recommendation || 0) }}ms</span>
              </div>
              <div class="timing-item">
                <span class="timing-label">Sıralama</span>
                <span class="timing-value">{{ Math.round(timing?.ranking || 0) }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { personalizationService, type PersonalizedProduct, type PersonalizationQuery, type PersonalizedResult } from '~/services/PersonalizationService'

// Props
interface Props {
  userId: string
  context?: {
    page: string
    category?: string
    searchQuery?: string
  }
  autoRefresh?: boolean
  showAnalytics?: boolean
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: true,
  showAnalytics: false,
  limit: 20
})

// Emits
const emit = defineEmits<{
  productClick: [product: PersonalizedProduct]
  productSave: [product: PersonalizedProduct]
  preferenceUpdate: [preferences: any]
}>()

// Reactive state
const isLoading = ref(false)
const loadingStep = ref(0)
const recommendations = ref<PersonalizedProduct[]>([])
const userSegments = ref<string[]>([])
const recommendationMeta = ref<any>(null)
const timing = ref<any>(null)
const analytics = ref<any>(null)

const showReasoning = ref(false)
const showSettings = ref(false)
const selectedProductReasoning = ref<any>(null)

// User preferences
const preferences = ref({
  categories: [] as string[],
  brands: [] as string[],
  priceRange: { min: 0, max: 100000 },
  excludedCategories: [] as string[],
  excludedBrands: [] as string[]
})

const newBrand = ref('')
const newExcludedCategory = ref('')

const availableCategories = [
  'Electronics', 'Fashion', 'Home', 'Sports', 'Books', 
  'Beauty', 'Automotive', 'Toys', 'Health', 'Garden'
]

// Computed properties
const trendingProducts = computed(() => 
  recommendations.value.filter((p: PersonalizedProduct) => p.trendingScore > 0.7)
)

const historyBasedProducts = computed(() => 
  recommendations.value.filter((p: PersonalizedProduct) => 
    p.reasons.some((r: string) => r.includes('viewing history') || r.includes('similar interests'))
  )
)

const collaborativeProducts = computed(() => 
  recommendations.value.filter((p: PersonalizedProduct) => 
    p.reasons.some((r: string) => r.includes('similar users') || r.includes('users with similar'))
  )
)

const personalityProducts = computed(() => 
  recommendations.value.filter((p: PersonalizedProduct) => 
    p.personalityScore > 0.8 && p.reasons.some((r: string) => r.includes('style') || r.includes('personality'))
  )
)

const discoveryProducts = computed(() => 
  recommendations.value.filter((p: PersonalizedProduct) => 
    p.reasons.some((r: string) => r.includes('discover') || r.includes('new')) || 
    p.personalityScore < 0.6
  )
)

// Lifecycle
onMounted(async () => {
  await loadRecommendations()
  if (props.showAnalytics) {
    await loadAnalytics()
  }
})

// Watch for prop changes
watch(() => props.context, async () => {
  if (props.autoRefresh) {
    await loadRecommendations()
  }
})

// Methods
async function loadRecommendations() {
  isLoading.value = true
  loadingStep.value = 1
  
  try {
    // Step 1: Profiling
    await new Promise(resolve => setTimeout(resolve, 300))
    loadingStep.value = 2
    
    // Step 2: Behavior analysis
    await new Promise(resolve => setTimeout(resolve, 200))
    loadingStep.value = 3
    
    // Step 3: Generate recommendations
    const query: PersonalizationQuery = {
      userId: props.userId,
      context: props.context || { page: 'home' },
      limit: props.limit,
      includeReasoning: true
    }
    
    const result: PersonalizedResult = await personalizationService.getPersonalizedRecommendations(query)
    
    loadingStep.value = 4
    
    // Step 4: Ranking optimization
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Update state
    recommendations.value = result.products
    userSegments.value = result.segments
    recommendationMeta.value = {
      confidence: result.confidence,
      freshness: result.freshness,
      diversity: result.diversity
    }
    timing.value = result.timing
    
  } catch (error) {
    console.error('Failed to load recommendations:', error)
  } finally {
    isLoading.value = false
    loadingStep.value = 0
  }
}

async function loadAnalytics() {
  try {
    analytics.value = personalizationService.getAnalytics(props.userId)
  } catch (error) {
    console.error('Failed to load analytics:', error)
  }
}

async function refreshRecommendations() {
  await loadRecommendations()
}

function handleProductClick(product: PersonalizedProduct) {
  // Track user behavior
  trackBehavior('click', product)
  
  // Show reasoning modal
  selectedProductReasoning.value = {
    product,
    reasons: product.reasons
  }
  showReasoning.value = true
  
  emit('productClick', product)
}

function handleProductSave(product: PersonalizedProduct) {
  // Track user behavior
  trackBehavior('save', product)
  
  emit('productSave', product)
}

async function trackBehavior(type: string, product: PersonalizedProduct) {
  try {
    await personalizationService.trackBehavior({
      userId: props.userId,
      type: type as any,
      productId: product.id,
      category: product.category,
      brand: product.brand,
      price: product.price,
      sessionId: getSessionId(),
      context: {
        source: 'recommendations',
        device: 'web',
        ...props.context
      }
    })
  } catch (error) {
    console.error('Failed to track behavior:', error)
  }
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('sessionId')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}

function getSegmentName(segment: string): string {
  const segmentNames: Record<string, string> = {
    'bargain_hunter': 'Fırsat Avcısı',
    'luxury_buyer': 'Lüks Alıcı',
    'tech_enthusiast': 'Teknoloji Meraklısı',
    'fashion_forward': 'Moda Takipçisi',
    'new_user': 'Yeni Kullanıcı',
    'general_user': 'Genel Kullanıcı'
  }
  return segmentNames[segment] || segment
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Preference management
function addBrand() {
  if (newBrand.value.trim() && !preferences.value.brands.includes(newBrand.value.trim())) {
    preferences.value.brands.push(newBrand.value.trim())
    newBrand.value = ''
  }
}

function removeBrand(brand: string) {
  const index = preferences.value.brands.indexOf(brand)
  if (index > -1) {
    preferences.value.brands.splice(index, 1)
  }
}

function addExcludedCategory() {
  if (newExcludedCategory.value && !preferences.value.excludedCategories.includes(newExcludedCategory.value)) {
    preferences.value.excludedCategories.push(newExcludedCategory.value)
    newExcludedCategory.value = ''
  }
}

function removeExcludedCategory(category: string) {
  const index = preferences.value.excludedCategories.indexOf(category)
  if (index > -1) {
    preferences.value.excludedCategories.splice(index, 1)
  }
}

async function savePreferences() {
  try {
    // Here you would save preferences to the backend
    console.log('Saving preferences:', preferences.value)
    
    emit('preferenceUpdate', preferences.value)
    showSettings.value = false
    
    // Refresh recommendations with new preferences
    await loadRecommendations()
  } catch (error) {
    console.error('Failed to save preferences:', error)
  }
}

function resetPreferences() {
  preferences.value = {
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 100000 },
    excludedCategories: [],
    excludedBrands: []
  }
}
</script>

<style scoped>
.personalized-recommendations {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* Header */
.recommendations-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.75rem;
  font-weight: 700;
}

.user-segments {
  margin: 0;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.segment-tag {
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-refresh,
.btn-settings {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-refresh:hover,
.btn-settings:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Quality Indicators */
.quality-indicators {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.indicator svg {
  color: #3b82f6;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-container p {
  margin: 1rem 0;
  color: #6b7280;
  font-size: 1.125rem;
}

.processing-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.process-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.process-step.active {
  color: #3b82f6;
  font-weight: 500;
}

.step-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #e5e7eb;
  transition: background 0.3s ease;
}

.process-step.active .step-dot {
  background: #3b82f6;
}

/* Recommendations Content */
.recommendations-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Modal Content */
.reasoning-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-summary {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.product-summary img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.product-info .brand {
  margin: 0 0 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.product-info .price {
  margin: 0;
  color: #059669;
  font-weight: 600;
  font-size: 1.125rem;
}

.reasoning-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reason-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0f9ff;
  border-radius: 6px;
}

.reason-icon {
  color: #0ea5e9;
  flex-shrink: 0;
}

.personality-match h5 {
  margin: 0 0 0.75rem 0;
  color: #374151;
}

.match-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.match-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.match-percentage {
  display: block;
  margin-top: 0.5rem;
  text-align: center;
  font-weight: 600;
  color: #10b981;
}

.recommendation-metadata h5 {
  margin: 0 0 1rem 0;
  color: #374151;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.metadata-item .label {
  color: #6b7280;
  font-size: 0.875rem;
}

.metadata-item .value {
  font-weight: 600;
  color: #1f2937;
}

/* Settings Content */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.category-preferences {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.price-range-setting {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-inputs input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.range-slider {
  display: flex;
  gap: 0.5rem;
}

.range-slider input {
  flex: 1;
}

.brand-preferences {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand-preferences input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.brand-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.brand-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.remove-brand {
  background: none;
  border: none;
  color: #1d4ed8;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.exclusion-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exclusion-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.exclusion-group label {
  font-weight: 500;
  color: #374151;
}

.exclusion-group select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.excluded-items {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.excluded-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-save,
.btn-reset {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-save:hover {
  background: #2563eb;
}

.btn-reset {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-reset:hover {
  background: #f9fafb;
}

/* Analytics Section */
.analytics-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.analytics-section summary {
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.analytics-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.analytics-item h5 {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.big-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.category-scores {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-score {
  display: grid;
  grid-template-columns: 120px 1fr 50px;
  gap: 0.75rem;
  align-items: center;
}

.category-name {
  font-size: 0.875rem;
  color: #374151;
}

.score-bar {
  height: 0.375rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: #10b981;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.score-value {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.timing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.timing-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.timing-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timing-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

/* Responsive Design */
@media (max-width: 768px) {
  .personalized-recommendations {
    padding: 0.5rem;
  }
  
  .recommendations-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quality-indicators {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .processing-info {
    max-width: none;
  }
  
  .metadata-grid {
    grid-template-columns: 1fr;
  }
  
  .category-preferences {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .category-score {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .timing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
