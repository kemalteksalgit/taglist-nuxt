<!-- pages/visual-search.vue -->
<!-- Visual Search Main Page with Personalized Results -->

<template>
  <div class="visual-search-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Görsel Arama</h1>
        <p>Fotoğraf ile ürün bul, AI destekli akıllı arama</p>
      </div>
      
      <div class="header-stats" v-if="searchStats">
        <div class="stat-item">
          <Icon name="search" />
          <span>{{ searchStats.totalSearches.toLocaleString() }} arama</span>
        </div>
        <div class="stat-item">
          <Icon name="clock" />
          <span>{{ searchStats.averageTime }}ms ortalama</span>
        </div>
        <div class="stat-item">
          <Icon name="target" />
          <span>{{ Math.round(searchStats.successRate * 100) }}% başarı</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      
      <!-- Visual Search Upload Component -->
      <div class="upload-section">
        <VisualSearchUpload
          :auto-search="true"
          :max-file-size="10485760"
          @results="handleSearchResults"
          @error="handleSearchError"
        />
      </div>

      <!-- Search Results Section -->
      <div v-if="searchResults" class="results-section">
        
        <!-- Results Header -->
        <div class="results-header">
          <div class="results-info">
            <h2>Arama Sonuçları</h2>
            <p>{{ searchResults.total }} ürün bulundu</p>
            
            <div class="search-quality" v-if="searchResults.timing">
              <div class="quality-indicator">
                <Icon name="zap" />
                <span>{{ Math.round(searchResults.timing.total) }}ms</span>
              </div>
              <div class="quality-indicator" v-if="searchResults.similarityScores">
                <Icon name="target" />
                <span>{{ Math.round(getAverageSimilarity() * 100) }}% benzerlik</span>
              </div>
            </div>
          </div>

          <div class="results-actions">
            <div class="view-options">
              <button 
                @click="viewMode = 'grid'"
                :class="{ active: viewMode === 'grid' }"
                class="view-btn"
              >
                <Icon name="grid" />
              </button>
              <button 
                @click="viewMode = 'list'"
                :class="{ active: viewMode === 'list' }"
                class="view-btn"
              >
                <Icon name="list" />
              </button>
            </div>

            <select v-model="sortBy" class="sort-select">
              <option value="similarity">Benzerlik</option>
              <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
              <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
              <option value="popularity">Popülerlik</option>
              <option value="newest">En Yeni</option>
            </select>
          </div>
        </div>

        <!-- Detected Objects -->
        <div v-if="searchResults.detectedObjects && searchResults.detectedObjects.length > 0" class="detected-objects">
          <h3>Tespit Edilen Nesneler</h3>
          <div class="objects-grid">
            <div 
              v-for="object in searchResults.detectedObjects"
              :key="object.label"
              class="object-card"
              @click="filterByObject(object)"
            >
              <div class="object-info">
                <span class="object-label">{{ object.label }}</span>
                <span class="object-confidence">{{ Math.round(object.confidence * 100) }}%</span>
                <span class="object-category">{{ object.category }}</span>
              </div>
              <button class="filter-btn">
                <Icon name="filter" />
                Filtrele
              </button>
            </div>
          </div>
        </div>

        <!-- Color Analysis -->
        <div v-if="searchResults.dominantColors && searchResults.dominantColors.length > 0" class="color-analysis">
          <h3>Renk Analizi</h3>
          <div class="colors-container">
            <div 
              v-for="color in searchResults.dominantColors"
              :key="color.hex"
              class="color-item"
              @click="filterByColor(color)"
            >
              <div 
                class="color-swatch"
                :style="{ backgroundColor: color.hex }"
              ></div>
              <div class="color-details">
                <span class="color-name">{{ color.name }}</span>
                <span class="color-percentage">{{ Math.round(color.percentage) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Search Results Grid -->
        <div class="visual-results">
          <div 
            class="results-grid"
            :class="{ 
              'grid-view': viewMode === 'grid',
              'list-view': viewMode === 'list'
            }"
          >
            <div 
              v-for="product in sortedProducts"
              :key="product.id"
              class="result-item"
              @click="viewProduct(product)"
            >
              <!-- Product Image -->
              <div class="product-image-container">
                <img 
                  :src="product.image" 
                  :alt="product.title"
                  class="product-image"
                >
                
                <!-- Similarity Badge -->
                <div class="similarity-badge">
                  <span>{{ Math.round(product.similarity * 100) }}%</span>
                </div>

                <!-- Matched Features -->
                <div v-if="product.matchedFeatures.length > 0" class="matched-features">
                  <div 
                    v-for="feature in product.matchedFeatures.slice(0, 2)"
                    :key="feature"
                    class="feature-tag"
                  >
                    {{ getFeatureName(feature) }}
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                  <button 
                    @click.stop="saveProduct(product)"
                    class="action-btn"
                    :class="{ saved: isSaved(product.id) }"
                  >
                    <Icon :name="isSaved(product.id) ? 'heart-filled' : 'heart'" />
                  </button>
                  <button @click.stop="shareProduct(product)" class="action-btn">
                    <Icon name="share" />
                  </button>
                </div>
              </div>

              <!-- Product Info -->
              <div class="product-info">
                <h4 class="product-title">{{ product.title }}</h4>
                <p class="product-brand">{{ product.brand }}</p>
                <div class="product-price">{{ formatPrice(product.price) }}</div>
                
                <!-- Visual Features -->
                <div class="visual-features">
                  <div class="feature-group" v-if="product.visualFeatures.colors.length > 0">
                    <span class="feature-label">Renkler:</span>
                    <span class="feature-values">{{ product.visualFeatures.colors.slice(0, 2).join(', ') }}</span>
                  </div>
                  <div class="feature-group" v-if="product.visualFeatures.objects.length > 0">
                    <span class="feature-label">Nesneler:</span>
                    <span class="feature-values">{{ product.visualFeatures.objects.slice(0, 2).join(', ') }}</span>
                  </div>
                </div>

                <!-- Similarity Details -->
                <div class="similarity-details">
                  <div class="similarity-bar">
                    <div 
                      class="similarity-fill"
                      :style="{ width: `${product.similarity * 100}%` }"
                    ></div>
                  </div>
                  <span class="similarity-text">
                    {{ Math.round(product.similarity * 100) }}% benzer
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Results -->
          <div v-if="hasMoreResults" class="load-more-section">
            <button 
              @click="loadMoreResults"
              class="btn-load-more"
              :disabled="loadingMore"
            >
              <LoadingSpinner v-if="loadingMore" size="small" />
              <span v-else>Daha Fazla Sonuç</span>
            </button>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="searchResults.products.length === 0" class="no-results">
          <Icon name="search-x" class="no-results-icon" />
          <h3>Sonuç Bulunamadı</h3>
          <p>Bu görsel için eşleşen ürün bulunamadı. Farklı bir görsel deneyin.</p>
          <button @click="resetSearch" class="btn-reset">
            Yeni Arama Yap
          </button>
        </div>
      </div>

      <!-- Personalized Recommendations -->
      <div v-if="!searchResults" class="recommendations-section">
        <PersonalizedRecommendations
          :user-id="userId"
          :context="{ page: 'visual-search' }"
          :show-analytics="false"
          @product-click="(product: any) => viewProduct(product)"
        />
      </div>

      <!-- Popular Visual Searches -->
      <div class="popular-searches">
        <h3>Popüler Görsel Aramalar</h3>
        <div class="popular-grid">
          <div 
            v-for="search in popularSearches"
            :key="search.id"
            class="popular-item"
            @click="usePopularSearch(search)"
          >
            <img :src="search.image" :alt="search.label">
            <div class="popular-info">
              <span class="popular-label">{{ search.label }}</span>
              <span class="popular-count">{{ search.count }} arama</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Search Tips Modal -->
    <Modal v-if="showTips" @close="showTips = false" size="large">
      <template #header>
        <h3>Görsel Arama İpuçları</h3>
      </template>
      
      <template #body>
        <div class="tips-content">
          <div class="tip-section">
            <h4>📸 En İyi Fotoğraf için:</h4>
            <ul>
              <li>Ürünü merkeze yerleştirin</li>
              <li>İyi aydınlatma kullanın</li>
              <li>Düz açı tercih edin</li>
              <li>Arka plan sade olsun</li>
            </ul>
          </div>

          <div class="tip-section">
            <h4>🎯 Daha İyi Sonuçlar için:</h4>
            <ul>
              <li>Ürünün marka logosunu dahil edin</li>
              <li>Karakteristik özellikler görünsün</li>
              <li>Çoklu açıdan çekim yapın</li>
              <li>Yüksek çözünürlük kullanın</li>
            </ul>
          </div>

          <div class="tip-section">
            <h4>⚡ Desteklenen Kategoriler:</h4>
            <ul>
              <li>Elektronik (telefon, laptop, tablet)</li>
              <li>Moda (ayakkabı, çanta, giyim)</li>
              <li>Ev Eşyası (mobilya, dekorasyon)</li>
              <li>Spor & Outdoor (ekipman, giyim)</li>
            </ul>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Help Button -->
    <button @click="showTips = true" class="help-btn">
      <Icon name="help" />
      <span>İpuçları</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { visualSearchService } from '~/services/VisualSearchService'
import type { VisualSearchResult, VisualProduct, DetectedObject, ColorInfo } from '~/services/VisualSearchService'

// Meta tags
definePageMeta({
  title: 'Görsel Arama - TagList',
  description: 'Fotoğraf ile ürün bulun. AI destekli görsel arama teknolojisi.',
  layout: 'default'
})

// Router
const router = useRouter()

// Reactive state
const searchResults = ref<VisualSearchResult | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('similarity')
const currentPage = ref(1)
const itemsPerPage = ref(20)
const loadingMore = ref(false)
const savedProducts = ref<Set<string>>(new Set())
const showTips = ref(false)

const userId = ref('user1') // Would come from auth
const searchStats = ref<any>(null)

// Mock popular searches
const popularSearches = ref([
  { id: '1', image: '/popular-phone.jpg', label: 'Akıllı Telefon', count: 1250 },
  { id: '2', image: '/popular-sneaker.jpg', label: 'Spor Ayakkabı', count: 890 },
  { id: '3', image: '/popular-laptop.jpg', label: 'Laptop', count: 750 },
  { id: '4', image: '/popular-watch.jpg', label: 'Akıllı Saat', count: 630 },
  { id: '5', image: '/popular-bag.jpg', label: 'Çanta', count: 520 },
  { id: '6', image: '/popular-headphone.jpg', label: 'Kulaklık', count: 480 }
])

// Computed properties
const sortedProducts = computed(() => {
  if (!searchResults.value?.products) return []
  
  const products = [...searchResults.value.products]
  
  switch (sortBy.value) {
    case 'similarity':
      return products.sort((a, b) => b.similarity - a.similarity)
    case 'price-asc':
      return products.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return products.sort((a, b) => b.price - a.price)
    case 'popularity':
      return products.sort((a, b) => b.matchedFeatures.length - a.matchedFeatures.length)
    case 'newest':
      return products.sort((a, b) => Math.random() - 0.5) // Mock sorting
    default:
      return products
  }
})

const hasMoreResults = computed(() => {
  return searchResults.value && 
         searchResults.value.products.length > currentPage.value * itemsPerPage.value
})

// Lifecycle
onMounted(async () => {
  try {
    const stats = visualSearchService.getStats()
    searchStats.value = stats
  } catch (error) {
    console.error('Failed to load search stats:', error)
  }
})

// Methods
function handleSearchResults(results: VisualSearchResult) {
  searchResults.value = results
  currentPage.value = 1
}

function handleSearchError(error: string) {
  console.error('Search error:', error)
  // Show toast notification
}

function viewProduct(product: VisualProduct) {
  router.push(`/product/${product.id}`)
}

function saveProduct(product: VisualProduct) {
  if (savedProducts.value.has(product.id)) {
    savedProducts.value.delete(product.id)
  } else {
    savedProducts.value.add(product.id)
  }
}

function shareProduct(product: VisualProduct) {
  const url = `${window.location.origin}/product/${product.id}`
  
  if (navigator.share) {
    navigator.share({
      title: product.title,
      text: `${product.brand} - ${product.title}`,
      url
    })
  } else {
    navigator.clipboard.writeText(url)
    // Show toast: "Link kopyalandı"
  }
}

function isSaved(productId: string): boolean {
  return savedProducts.value.has(productId)
}

function filterByObject(object: DetectedObject) {
  // Implement object-based filtering
  console.log('Filter by object:', object.label)
}

function filterByColor(color: ColorInfo) {
  // Implement color-based filtering
  console.log('Filter by color:', color.name)
}

function getFeatureName(feature: string): string {
  const featureNames: Record<string, string> = {
    'object_match': 'Nesne',
    'color_match': 'Renk',
    'text_match': 'Metin',
    'visual_features': 'Görsel'
  }
  return featureNames[feature] || feature
}

function getAverageSimilarity(): number {
  if (!searchResults.value?.similarityScores) return 0
  const scores = searchResults.value.similarityScores
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

async function loadMoreResults() {
  loadingMore.value = true
  
  // Simulate loading more results
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  currentPage.value++
  loadingMore.value = false
}

function resetSearch() {
  searchResults.value = null
  currentPage.value = 1
}

function usePopularSearch(search: any) {
  // Simulate using a popular search image
  console.log('Using popular search:', search.label)
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}
</script>

<style scoped>
.visual-search-page {
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 1rem 2rem;
  text-align: center;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header-content p {
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
  opacity: 0.9;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.upload-section {
  margin-bottom: 3rem;
}

/* Results Section */
.results-section {
  margin-bottom: 3rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.results-info h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.75rem;
  font-weight: 700;
}

.results-info p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

.search-quality {
  display: flex;
  gap: 1rem;
}

.quality-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
}

.results-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-options {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 0.5rem;
  background: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.view-btn:hover {
  background: #f9fafb;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
}

/* Detected Objects */
.detected-objects {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.detected-objects h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.objects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.object-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.object-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.object-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.object-label {
  font-weight: 600;
  color: #1f2937;
}

.object-confidence {
  font-size: 0.875rem;
  color: #059669;
  font-weight: 500;
}

.object-category {
  font-size: 0.75rem;
  color: #6b7280;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #2563eb;
}

/* Color Analysis */
.color-analysis {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.color-analysis h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.colors-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.color-swatch {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.color-percentage {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Visual Results */
.visual-results {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.results-grid.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.results-grid.list-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.list-view .result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

/* Product Image */
.product-image-container {
  position: relative;
}

.grid-view .product-image-container {
  aspect-ratio: 1;
}

.list-view .product-image-container {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.result-item:hover .product-image {
  transform: scale(1.05);
}

/* Similarity Badge */
.similarity-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* Matched Features */
.matched-features {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feature-tag {
  padding: 0.25rem 0.5rem;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(10px);
}

/* Quick Actions */
.quick-actions {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-item:hover .quick-actions {
  opacity: 1;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: #3b82f6;
  color: white;
}

.action-btn.saved {
  background: #ef4444;
  color: white;
}

/* Product Info */
.product-info {
  padding: 1rem;
}

.list-view .product-info {
  flex: 1;
  padding: 0;
}

.product-title {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

.product-brand {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.product-price {
  color: #059669;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

/* Visual Features */
.visual-features {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.feature-group {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.feature-label {
  color: #6b7280;
  font-weight: 500;
}

.feature-values {
  color: #374151;
}

/* Similarity Details */
.similarity-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.similarity-bar {
  flex: 1;
  height: 0.25rem;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.similarity-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.similarity-text {
  font-size: 0.75rem;
  color: #059669;
  font-weight: 600;
  white-space: nowrap;
}

/* Load More */
.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-load-more {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #374151;
}

.btn-load-more:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-load-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.no-results h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
}

.no-results p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.btn-reset {
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-reset:hover {
  background: #2563eb;
}

/* Recommendations Section */
.recommendations-section {
  margin-bottom: 3rem;
}

/* Popular Searches */
.popular-searches {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  margin-bottom: 3rem;
}

.popular-searches h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.popular-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.popular-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.popular-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.popular-info {
  text-align: center;
}

.popular-label {
  display: block;
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.popular-count {
  display: block;
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Tips Modal */
.tips-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tip-section h4 {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
}

.tip-section ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #4b5563;
}

.tip-section li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* Help Button */
.help-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
  z-index: 10;
}

.help-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 15px 35px -5px rgba(59, 130, 246, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0.5rem 1.5rem;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .header-stats {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .main-content {
    padding: 1rem 0.5rem;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .results-actions {
    justify-content: space-between;
  }
  
  .objects-grid {
    grid-template-columns: 1fr;
  }
  
  .colors-container {
    justify-content: center;
  }
  
  .results-grid.grid-view {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  
  .list-view .result-item {
    flex-direction: column;
    text-align: center;
  }
  
  .list-view .product-image-container {
    width: 100%;
    height: 200px;
  }
  
  .popular-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .help-btn {
    bottom: 1rem;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .results-grid.grid-view {
    grid-template-columns: 1fr;
  }
  
  .popular-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions {
    opacity: 1;
    position: static;
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>
