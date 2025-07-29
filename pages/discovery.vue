<!-- pages/discovery.vue -->
<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="discovery-header">
      <div class="header-content">
        <h1 class="discovery-title">
          <span class="title-icon">✨</span>
          Discover
        </h1>
        <p class="discovery-subtitle">
          Personalized finds just for you
        </p>
      </div>
      
      <!-- Real-time indicators -->
      <div class="discovery-indicators">
        <div class="indicator" :class="{ active: isLiveUpdating }">
          <div class="indicator-dot"></div>
          <span>Live Updates</span>
        </div>
        <div class="last-update">
          Updated {{ formatTimeAgo(lastUpdate) }}
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="discovery-loading">
      <LoadingSpinner />
      <p>Personalizing your feed...</p>
    </div>

    <!-- Discovery feeds -->
    <div v-else class="discovery-feeds">
      <TransitionGroup 
        name="feed" 
        tag="div" 
        class="feeds-container"
      >
        <div
          v-for="feed in feeds"
          :key="feed.id"
          class="discovery-feed"
          :class="`feed-${feed.type}`"
        >
          <!-- Feed header -->
          <div class="feed-header">
            <div class="feed-title-section">
              <h2 class="feed-title">{{ feed.title }}</h2>
              <p v-if="feed.subtitle" class="feed-subtitle">
                {{ feed.subtitle }}
              </p>
            </div>
            
            <div class="feed-meta">
              <div class="confidence-indicator">
                <div 
                  class="confidence-bar"
                  :style="{ width: `${feed.metadata.confidence * 100}%` }"
                ></div>
              </div>
              <button 
                class="refresh-btn"
                @click="refreshFeed(feed.id)"
                :disabled="refreshing.includes(feed.id)"
              >
                <svg class="refresh-icon" :class="{ spinning: refreshing.includes(feed.id) }" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Personalization info -->
          <div v-if="feed.metadata.personalizations.length > 0" class="personalization-info">
            <div class="personalization-tags">
              <span 
                v-for="factor in feed.metadata.personalizations.slice(0, 2)"
                :key="factor.type"
                class="personalization-tag"
                :title="factor.description"
              >
                {{ getPersonalizationEmoji(factor.type) }}
                {{ factor.description.split(' ').slice(0, 3).join(' ') }}
              </span>
            </div>
          </div>

          <!-- Feed items -->
          <div class="feed-items">
            <div 
              v-for="item in feed.items"
              :key="item.id"
              class="discovery-item"
              @click="viewItem(item)"
              @mouseenter="onItemHover(item)"
              @mouseleave="onItemLeave(item)"
            >
              <!-- Item image -->
              <div class="item-image-container">
                <img 
                  :src="item.image" 
                  :alt="item.title"
                  class="item-image"
                  loading="lazy"
                >
                
                <!-- Live indicator -->
                <div v-if="item.auction.isLive" class="live-indicator">
                  <div class="live-dot"></div>
                  LIVE
                </div>
                
                <!-- Hype level -->
                <div class="hype-indicator" :class="`hype-${item.auction.hypeLevel}`">
                  <div class="hype-flames">
                    <span v-for="n in Math.min(item.auction.hypeLevel, 5)" :key="n">🔥</span>
                  </div>
                </div>
                
                <!-- Time remaining -->
                <div class="time-remaining" :class="{ urgent: item.auction.timeRemaining < 3600 }">
                  {{ formatTimeRemaining(item.auction.timeRemaining) }}
                </div>
              </div>

              <!-- Item content -->
              <div class="item-content">
                <h3 class="item-title">{{ item.title }}</h3>
                
                <!-- Price -->
                <div class="item-price">
                  <span class="current-price">{{ formatPrice(item.price.current) }}</span>
                  <span v-if="item.price.original" class="original-price">
                    {{ formatPrice(item.price.original) }}
                  </span>
                </div>
                
                <!-- Auction info -->
                <div class="auction-info">
                  <span class="bidders">{{ item.auction.bidders }} bidders</span>
                  <div class="seller-info">
                    <span class="seller-name">{{ item.seller.username }}</span>
                    <span v-if="item.seller.isVerified" class="verified-badge">✓</span>
                  </div>
                </div>
                
                <!-- Personalization score -->
                <div class="personalization-score">
                  <div class="score-bar">
                    <div 
                      class="score-fill"
                      :style="{ width: `${item.personalizedScore}%` }"
                    ></div>
                  </div>
                  <span class="score-text">{{ item.personalizedScore }}% match</span>
                </div>
                
                <!-- Reasoning -->
                <div v-if="item.reasoning.length > 0" class="item-reasoning">
                  <div class="reasoning-tags">
                    <span 
                      v-for="reason in item.reasoning.slice(0, 2)"
                      :key="reason"
                      class="reasoning-tag"
                    >
                      {{ reason }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="item-actions">
                <button
                  v-for="action in item.actions.slice(0, 3)"
                  :key="action.type"
                  class="action-btn"
                  :class="`action-${action.type}`"
                  @click.stop="performAction(action, item)"
                >
                  {{ getActionEmoji(action.type) }}
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Load more -->
          <div v-if="feed.metadata.totalItems > feed.items.length" class="load-more">
            <button 
              class="load-more-btn"
              @click="loadMoreItems(feed.id)"
              :disabled="loadingMore.includes(feed.id)"
            >
              <LoadingSpinner v-if="loadingMore.includes(feed.id)" size="small" />
              <span v-else>Load More ({{ feed.metadata.totalItems - feed.items.length }} remaining)</span>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Floating action button -->
    <div class="fab-container">
      <button class="fab" @click="showPreferences = true" title="Customize your feed">
        <svg viewBox="0 0 24 24">
          <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11.03L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11.03L19.5,12L19.43,12.97L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z" />
        </svg>
      </button>
    </div>

    <!-- Preferences modal -->
    <Modal v-model="showPreferences" title="Customize Your Feed">
      <div class="preferences-content">
        <h3>Personalization Preferences</h3>
        <div class="preference-group">
          <label>Favorite Categories</label>
          <div class="category-chips">
            <button
              v-for="category in availableCategories"
              :key="category"
              class="category-chip"
              :class="{ active: selectedCategories.includes(category) }"
              @click="toggleCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
        
        <div class="preference-group">
          <label>Price Range</label>
          <div class="price-range">
            <input 
              v-model="priceRange.min" 
              type="number" 
              placeholder="Min"
              class="price-input"
            >
            <span>-</span>
            <input 
              v-model="priceRange.max" 
              type="number" 
              placeholder="Max"
              class="price-input"
            >
          </div>
        </div>
        
        <div class="preference-actions">
          <button class="btn-secondary" @click="showPreferences = false">
            Cancel
          </button>
          <button class="btn-primary" @click="savePreferences">
            Save Preferences
          </button>
        </div>
      </div>
    </Modal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAIDiscovery } from '~/composables/useAIDiscovery'
import type { DiscoveryFeed, DiscoveryItem, DiscoveryAction } from '~/composables/useAIDiscovery'

// Composables
const { 
  feeds, 
  isLoading, 
  lastUpdate,
  initializeDiscovery,
  refreshDiscoveryFeeds,
  processRealTimeSignal 
} = useAIDiscovery()

// Reactive state
const refreshing = ref<string[]>([])
const loadingMore = ref<string[]>([])
const hoveredItem = ref<string | null>(null)
const showPreferences = ref(false)
const isLiveUpdating = ref(true)

// Preferences
const selectedCategories = ref(['Fashion', 'Electronics', 'Home'])
const priceRange = ref({ min: 100, max: 5000 })
const availableCategories = ['Fashion', 'Electronics', 'Home', 'Sports', 'Art', 'Books', 'Music', 'Games']

// Initialize discovery on mount
onMounted(async () => {
  await initializeDiscovery()
  startRealTimeTracking()
})

// Real-time tracking
const startRealTimeTracking = () => {
  // Track scroll behavior
  let scrollTimeout: NodeJS.Timeout
  const handleScroll = () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      processRealTimeSignal({
        type: 'scroll',
        target: 'discovery_page',
        intensity: 0.7,
        timestamp: new Date()
      })
    }, 100)
  }

  // Track page visibility
  const handleVisibilityChange = () => {
    if (document.hidden) {
      processRealTimeSignal({
        type: 'pause',
        target: 'discovery_page',
        duration: Date.now(),
        intensity: 1.0,
        timestamp: new Date()
      })
    }
  }

  window.addEventListener('scroll', handleScroll)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })
}

// Feed management
const refreshFeed = async (feedId: string) => {
  refreshing.value.push(feedId)
  try {
    await refreshDiscoveryFeeds(true)
  } finally {
    refreshing.value = refreshing.value.filter(id => id !== feedId)
  }
}

const loadMoreItems = async (feedId: string) => {
  loadingMore.value.push(feedId)
  try {
    // Load more items for specific feed
    await new Promise(resolve => setTimeout(resolve, 1000)) // Loading simulation
  } finally {
    loadingMore.value = loadingMore.value.filter(id => id !== feedId)
  }
}

// Item interactions
const viewItem = (item: any) => {
  processRealTimeSignal({
    type: 'click',
    target: `item_${item.id}`,
    intensity: 1.0,
    timestamp: new Date()
  })
  
  // Navigate to item page
  navigateTo(`/product/${item.id}`)
}

const onItemHover = (item: any) => {
  hoveredItem.value = item.id
  processRealTimeSignal({
    type: 'hover',
    target: `item_${item.id}`,
    intensity: 0.5,
    timestamp: new Date()
  })
}

const onItemLeave = (item: any) => {
  hoveredItem.value = null
}

const performAction = async (action: DiscoveryAction, item: any) => {
  processRealTimeSignal({
    type: 'click',
    target: `action_${action.type}_${item.id}`,
    intensity: 1.0,
    timestamp: new Date()
  })

  switch (action.type) {
    case 'bid':
      // Navigate to bidding
      navigateTo(`/product/${item.id}?action=bid`)
      break
    case 'save':
      // Add to favorites
      break
    case 'watch':
      // Start watching
      navigateTo(`/product/${item.id}`)
      break
    case 'follow':
      // Follow seller
      break
    case 'notify':
      // Set notification
      break
  }
}

// Preferences
const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}

const savePreferences = async () => {
  // Save user preferences
  
  // Refresh feeds with new preferences
  await refreshDiscoveryFeeds(true)
  showPreferences.value = false
}

// Utilities
const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

const formatTimeRemaining = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const getPersonalizationEmoji = (type: string) => {
  const emojis: Record<string, string> = {
    behavior: '🧠',
    preference: '❤️',
    timing: '⏰',
    location: '📍',
    social: '👥'
  }
  return emojis[type] || '✨'
}

const getActionEmoji = (type: string) => {
  const emojis: Record<string, string> = {
    bid: '💰',
    save: '❤️',
    watch: '👁️',
    follow: '➕',
    notify: '🔔',
    share: '📤'
  }
  return emojis[type] || '👆'
}

// SEO
useHead({
  title: 'Discover - TagList',
  meta: [
    { name: 'description', content: 'Discover personalized products with AI-powered recommendations on TagList' }
  ]
})
</script>

<style scoped>
.discovery-container {
  @apply min-h-screen bg-gray-50 pb-20;
}

.discovery-header {
  @apply bg-white border-b sticky top-0 z-10 px-4 py-6;
}

.header-content {
  @apply max-w-6xl mx-auto;
}

.discovery-title {
  @apply text-3xl font-bold text-gray-900 flex items-center gap-3;
}

.title-icon {
  @apply text-4xl;
}

.discovery-subtitle {
  @apply text-gray-600 mt-2;
}

.discovery-indicators {
  @apply flex items-center justify-between mt-4 max-w-6xl mx-auto;
}

.indicator {
  @apply flex items-center gap-2 text-sm text-gray-500;
}

.indicator.active .indicator-dot {
  @apply bg-green-500;
  animation: pulse 2s infinite;
}

.indicator-dot {
  @apply w-2 h-2 bg-gray-300 rounded-full;
}

.last-update {
  @apply text-sm text-gray-500;
}

.discovery-loading {
  @apply flex flex-col items-center justify-center py-20;
}

.discovery-feeds {
  @apply max-w-6xl mx-auto px-4 py-6;
}

.feeds-container {
  @apply space-y-12;
}

.discovery-feed {
  @apply bg-white rounded-xl shadow-sm border p-6;
}

.feed-header {
  @apply flex items-start justify-between mb-4;
}

.feed-title-section {
  @apply flex-1;
}

.feed-title {
  @apply text-2xl font-bold text-gray-900;
}

.feed-subtitle {
  @apply text-gray-600 mt-1;
}

.feed-meta {
  @apply flex items-center gap-3;
}

.confidence-indicator {
  @apply w-16 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.confidence-bar {
  @apply h-full bg-gradient-to-r from-yellow-400 to-green-500 transition-all duration-300;
}

.refresh-btn {
  @apply p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors;
}

.refresh-icon {
  @apply w-5 h-5;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

.personalization-info {
  @apply mb-4;
}

.personalization-tags {
  @apply flex gap-2 flex-wrap;
}

.personalization-tag {
  @apply bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm;
}

.feed-items {
  @apply grid gap-6;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.discovery-item {
  @apply bg-gray-50 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg;
}

.item-image-container {
  @apply relative;
}

.item-image {
  @apply w-full h-48 object-cover;
}

.live-indicator {
  @apply absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1;
}

.live-dot {
  @apply w-2 h-2 bg-white rounded-full;
  animation: pulse 1s infinite;
}

.hype-indicator {
  @apply absolute top-3 right-3;
}

.hype-flames {
  @apply flex;
}

.time-remaining {
  @apply absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm;
}

.time-remaining.urgent {
  @apply bg-red-500;
  animation: pulse 2s infinite;
}

.item-content {
  @apply p-4;
}

.item-title {
  @apply font-semibold text-gray-900 mb-2;
}

.item-price {
  @apply flex items-center gap-2 mb-2;
}

.current-price {
  @apply text-lg font-bold text-gray-900;
}

.original-price {
  @apply text-sm text-gray-500 line-through;
}

.auction-info {
  @apply flex items-center justify-between text-sm text-gray-600 mb-3;
}

.seller-info {
  @apply flex items-center gap-1;
}

.verified-badge {
  @apply text-blue-500;
}

.personalization-score {
  @apply flex items-center gap-2 mb-3;
}

.score-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.score-fill {
  @apply h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300;
}

.score-text {
  @apply text-xs text-gray-600;
}

.item-reasoning {
  @apply mb-3;
}

.reasoning-tags {
  @apply flex gap-1 flex-wrap;
}

.reasoning-tag {
  @apply bg-green-50 text-green-700 px-2 py-1 rounded text-xs;
}

.item-actions {
  @apply flex gap-2 p-4 pt-0;
}

.action-btn {
  @apply px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1;
}

.action-bid {
  @apply bg-orange-500 text-white hover:bg-orange-600;
}

.action-save {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.action-watch {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.action-follow {
  @apply bg-green-500 text-white hover:bg-green-600;
}

.action-notify {
  @apply bg-purple-500 text-white hover:bg-purple-600;
}

.load-more {
  @apply mt-6 text-center;
}

.load-more-btn {
  @apply px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50;
}

.fab-container {
  @apply fixed bottom-6 right-6 z-20;
}

.fab {
  @apply w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110;
}

.fab svg {
  @apply w-6 h-6;
}

.preferences-content {
  @apply space-y-6;
}

.preference-group {
  @apply space-y-3;
}

.preference-group label {
  @apply block text-sm font-medium text-gray-900;
}

.category-chips {
  @apply flex gap-2 flex-wrap;
}

.category-chip {
  @apply px-3 py-2 rounded-lg border text-sm transition-colors;
}

.category-chip.active {
  @apply bg-blue-500 text-white border-blue-500;
}

.category-chip:not(.active) {
  @apply bg-white text-gray-700 border-gray-300 hover:bg-gray-50;
}

.price-range {
  @apply flex items-center gap-3;
}

.price-input {
  @apply flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.preference-actions {
  @apply flex gap-3 justify-end pt-4 border-t;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300;
}

/* Animations */
.feed-enter-active,
.feed-leave-active {
  transition: all 0.3s ease;
}

.feed-enter-from,
.feed-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive design */
@media (max-width: 768px) {
  .discovery-header {
    @apply px-4 py-4;
  }
  
  .discovery-title {
    @apply text-2xl;
  }
  
  .feed-items {
    grid-template-columns: 1fr;
  }
  
  .discovery-item {
    @apply hover:scale-100;
  }
  
  .fab-container {
    @apply bottom-4 right-4;
  }
  
  .fab {
    @apply w-12 h-12;
  }
}
</style>
