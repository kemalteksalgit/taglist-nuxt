<!-- components/RecommendationSection.vue -->
<!-- Individual Recommendation Section Component -->

<template>
  <div class="recommendation-section">
    <!-- Section Header -->
    <div class="section-header">
      <div class="header-content">
        <h3>{{ title }}</h3>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="header-actions">
        <button 
          v-if="viewAllEnabled" 
          @click="$emit('view-all')"
          class="btn-view-all"
        >
          Tümünü Gör
          <Icon name="arrow-right" />
        </button>
        
        <div class="view-toggle">
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
      </div>
    </div>

    <!-- Products Container -->
    <div 
      class="products-container"
      :class="{ 
        'grid-view': viewMode === 'grid',
        'list-view': viewMode === 'list',
        [`category-${category}`]: category
      }"
    >
      <div 
        v-for="product in displayProducts"
        :key="product.id"
        class="product-item"
        @click="handleProductClick(product)"
      >
        <!-- Product Image -->
        <div class="product-image-container">
          <img 
            :src="product.image" 
            :alt="product.title"
            class="product-image"
            loading="lazy"
          >
          
          <!-- AI Badge -->
          <div v-if="showAIBadge" class="ai-badge">
            <Icon name="sparkles" />
            <span>AI</span>
          </div>
          
          <!-- Personality Score -->
          <div v-if="showPersonalityScore" class="personality-score">
            <div class="score-circle">
              <span>{{ Math.round(product.personalityScore * 100) }}%</span>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="quick-actions">
            <button 
              @click.stop="handleSaveProduct(product)"
              class="action-btn save-btn"
              :class="{ saved: isProductSaved(product.id) }"
            >
              <Icon :name="isProductSaved(product.id) ? 'heart-filled' : 'heart'" />
            </button>
            
            <button 
              @click.stop="handleShareProduct(product)"
              class="action-btn share-btn"
            >
              <Icon name="share" />
            </button>
            
            <button 
              v-if="showReasoningBtn"
              @click.stop="showReasoning(product)"
              class="action-btn reasoning-btn"
            >
              <Icon name="info" />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <div class="product-header">
            <h4 class="product-title">{{ product.title }}</h4>
            <span class="product-brand">{{ product.brand }}</span>
          </div>
          
          <div class="product-price">
            <span class="current-price">{{ formatPrice(product.price) }}</span>
            <span 
              v-if="(product as any).originalPrice && (product as any).originalPrice > product.price"
              class="original-price"
            >
              {{ formatPrice((product as any).originalPrice) }}
            </span>
          </div>

          <!-- Recommendation Reasons -->
          <div v-if="product.reasons.length > 0" class="recommendation-reasons">
            <div class="reasons-header">
              <Icon name="lightbulb" />
              <span>Neden öneriyoruz?</span>
            </div>
            <div class="reasons-list">
              <span 
                v-for="reason in product.reasons.slice(0, maxReasonsDisplay)"
                :key="reason"
                class="reason-tag"
              >
                {{ reason }}
              </span>
              <button 
                v-if="product.reasons.length > maxReasonsDisplay"
                @click.stop="showAllReasons(product)"
                class="more-reasons"
              >
                +{{ product.reasons.length - maxReasonsDisplay }} daha
              </button>
            </div>
          </div>

          <!-- Product Tags -->
          <div v-if="product.tags.length > 0" class="product-tags">
            <span 
              v-for="tag in product.tags.slice(0, 3)"
              :key="tag"
              class="product-tag"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Product Metadata -->
          <div class="product-metadata">
            <div class="metadata-item">
              <Icon name="eye" />
              <span>{{ formatNumber(product.metadata.viewedBy) }}</span>
            </div>
            <div class="metadata-item">
              <Icon name="heart" />
              <span>{{ formatNumber(product.metadata.likedBy) }}</span>
            </div>
            <div class="metadata-item">
              <Icon name="star" />
              <span>{{ product.metadata.averageRating.toFixed(1) }}</span>
            </div>
            <div v-if="product.metadata.freshness > 0.8" class="metadata-item freshness">
              <Icon name="clock" />
              <span>Yeni</span>
            </div>
          </div>

          <!-- Similarity Scores (Debug Mode) -->
          <div v-if="showDebugInfo" class="debug-scores">
            <div class="score-item">
              <span class="score-label">Benzerlik:</span>
              <span class="score-value">{{ (product.similarityScore * 100).toFixed(1) }}%</span>
            </div>
            <div class="score-item">
              <span class="score-label">Trend:</span>
              <span class="score-value">{{ (product.trendingScore * 100).toFixed(1) }}%</span>
            </div>
            <div class="score-item">
              <span class="score-label">Kişilik:</span>
              <span class="score-value">{{ (product.personalityScore * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreProducts" class="load-more-container">
        <button 
          @click="loadMoreProducts"
          class="btn-load-more"
          :disabled="loadingMore"
        >
          <LoadingSpinner v-if="loadingMore" size="small" />
          <span v-else>Daha Fazla Göster</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="products.length === 0" class="empty-state">
      <Icon name="package" class="empty-icon" />
      <h4>Henüz öneri bulunamadı</h4>
      <p>Daha fazla ürün görüntüleyerek AI önerilerimizi geliştirin</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PersonalizedProduct } from '~/services/PersonalizationService'

// Props
interface Props {
  title: string
  subtitle?: string
  products: PersonalizedProduct[]
  category?: string
  viewAllEnabled?: boolean
  showAIBadge?: boolean
  showPersonalityScore?: boolean
  showReasoningBtn?: boolean
  showDebugInfo?: boolean
  maxReasonsDisplay?: number
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  viewAllEnabled: true,
  showAIBadge: true,
  showPersonalityScore: false,
  showReasoningBtn: true,
  showDebugInfo: false,
  maxReasonsDisplay: 2,
  itemsPerPage: 8
})

// Emits
const emit = defineEmits<{
  'product-click': [product: PersonalizedProduct]
  'product-save': [product: PersonalizedProduct]
  'product-share': [product: PersonalizedProduct]
  'view-all': []
  'show-reasoning': [product: PersonalizedProduct]
  'show-all-reasons': [product: PersonalizedProduct]
}>()

// Reactive state
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const loadingMore = ref(false)
const savedProducts = ref<Set<string>>(new Set())

// Computed properties
const displayProducts = computed(() => {
  const start = 0
  const end = currentPage.value * props.itemsPerPage
  return props.products.slice(start, end)
})

const hasMoreProducts = computed(() => {
  return props.products.length > currentPage.value * props.itemsPerPage
})

// Methods
function handleProductClick(product: PersonalizedProduct) {
  emit('product-click', product)
}

function handleSaveProduct(product: PersonalizedProduct) {
  if (savedProducts.value.has(product.id)) {
    savedProducts.value.delete(product.id)
  } else {
    savedProducts.value.add(product.id)
  }
  emit('product-save', product)
}

function handleShareProduct(product: PersonalizedProduct) {
  emit('product-share', product)
}

function showReasoning(product: PersonalizedProduct) {
  emit('show-reasoning', product)
}

function showAllReasons(product: PersonalizedProduct) {
  emit('show-all-reasons', product)
}

function isProductSaved(productId: string): boolean {
  return savedProducts.value.has(productId)
}

async function loadMoreProducts() {
  loadingMore.value = true
  
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  currentPage.value++
  loadingMore.value = false
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>

<style scoped>
.recommendation-section {
  width: 100%;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.header-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-view-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-view-all:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.view-toggle {
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

/* Products Container */
.products-container {
  position: relative;
}

.products-container.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.products-container.list-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Product Item */
.product-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.list-view .product-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

/* Product Image */
.product-image-container {
  position: relative;
  overflow: hidden;
}

.grid-view .product-image-container {
  aspect-ratio: 1;
}

.list-view .product-image-container {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 8px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-item:hover .product-image {
  transform: scale(1.05);
}

/* Badges and Overlays */
.ai-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.personality-score {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
}

.quick-actions {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-item:hover .quick-actions {
  opacity: 1;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.save-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
}

.save-btn:hover,
.save-btn.saved {
  background: #ef4444;
  color: white;
}

.share-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
}

.share-btn:hover {
  background: #3b82f6;
  color: white;
}

.reasoning-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #6b7280;
}

.reasoning-btn:hover {
  background: #8b5cf6;
  color: white;
}

/* Product Info */
.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-view .product-info {
  flex: 1;
  padding: 0;
}

.product-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-title {
  margin: 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-brand {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.current-price {
  color: #059669;
  font-size: 1.125rem;
  font-weight: 700;
}

.original-price {
  color: #9ca3af;
  font-size: 0.875rem;
  text-decoration: line-through;
}

/* Recommendation Reasons */
.recommendation-reasons {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 0.75rem;
}

.reasons-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #0369a1;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reasons-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reason-tag {
  padding: 0.25rem 0.5rem;
  background: white;
  color: #0369a1;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #bae6fd;
}

.more-reasons {
  padding: 0.25rem 0.5rem;
  background: none;
  border: 1px dashed #0369a1;
  border-radius: 9999px;
  color: #0369a1;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-reasons:hover {
  background: #0369a1;
  color: white;
}

/* Product Tags */
.product-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.product-tag {
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Product Metadata */
.product-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.metadata-item.freshness {
  color: #059669;
  font-weight: 600;
}

.metadata-item svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Debug Scores */
.debug-scores {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #fef3c7;
  border-radius: 4px;
  border: 1px solid #fbbf24;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.score-label {
  font-size: 0.625rem;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-value {
  font-weight: 600;
  color: #92400e;
  font-size: 0.75rem;
}

/* Load More */
.load-more-container {
  grid-column: 1 / -1;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Category-specific styling */
.category-trending .product-item {
  border-color: #f59e0b;
}

.category-trending .product-item:hover {
  border-color: #d97706;
}

.category-history .product-item {
  border-color: #10b981;
}

.category-history .product-item:hover {
  border-color: #059669;
}

.category-collaborative .product-item {
  border-color: #8b5cf6;
}

.category-collaborative .product-item:hover {
  border-color: #7c3aed;
}

.category-personality .product-item {
  border-color: #ef4444;
}

.category-personality .product-item:hover {
  border-color: #dc2626;
}

.category-discovery .product-item {
  border-color: #3b82f6;
}

.category-discovery .product-item:hover {
  border-color: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .products-container.grid-view {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  
  .list-view .product-item {
    flex-direction: column;
    text-align: center;
  }
  
  .list-view .product-image-container {
    width: 100%;
    height: 200px;
  }
  
  .product-metadata {
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  .debug-scores {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .products-container.grid-view {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    opacity: 1;
    position: static;
    flex-direction: row;
    justify-content: center;
    margin-top: 0.5rem;
  }
  
  .product-info {
    padding: 0.75rem;
  }
}
</style>
