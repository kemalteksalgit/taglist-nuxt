<template>
  <div class="relative w-full max-w-2xl mx-auto">
    <!-- Search Input -->
    <div class="relative">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        :placeholder="currentPlaceholder"
        class="w-full px-4 py-3 pl-12 pr-16 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-lg"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      >
      
      <!-- Search Icon -->
      <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
        <div v-if="isSearching" class="animate-spin text-purple-500">🤖</div>
        <div v-else class="text-gray-400">🔍</div>
      </div>

      <!-- AI Toggle -->
      <button @click="toggleAIMode" 
              :class="[
                'absolute right-12 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all',
                aiMode ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]">
        <span class="text-sm">🤖</span>
      </button>

      <!-- Clear Button -->
      <button v-if="searchQuery" 
              @click="clearSearch"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
        ✕
      </button>
    </div>

    <!-- AI-Powered Suggestions Dropdown -->
    <div v-if="showSuggestions && (suggestions.length || isSearching)" 
         class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
      
      <!-- Loading State -->
      <div v-if="isSearching" class="p-4 flex items-center justify-center">
        <div class="flex items-center gap-3">
          <div class="animate-spin text-2xl">🤖</div>
          <span class="text-gray-600">AI is analyzing your search...</span>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-else class="max-h-96 overflow-y-auto">
        <!-- Intent Detection -->
        <div v-if="detectedIntent" class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div class="flex items-center gap-2 mb-1">
            <span>🎯</span>
            <span class="font-semibold text-gray-800">I think you're looking for:</span>
          </div>
          <p class="text-sm text-gray-700">{{ detectedIntent.description }}</p>
          <div class="flex gap-2 mt-2">
            <button v-for="action in detectedIntent.suggestedActions" :key="action.label"
                    @click="applyAction(action)"
                    class="bg-white px-3 py-1 rounded-full text-xs font-medium text-purple-600 hover:bg-purple-100 transition-colors">
              {{ action.label }}
            </button>
          </div>
        </div>

        <!-- Smart Suggestions -->
        <div v-if="suggestions.length" class="divide-y divide-gray-100">
          <div v-for="(suggestion, index) in suggestions" :key="suggestion.id"
               :class="[
                 'p-3 cursor-pointer transition-colors',
                 selectedIndex === index ? 'bg-purple-50' : 'hover:bg-gray-50'
               ]"
               @click="selectSuggestion(suggestion)"
               @mouseenter="selectedIndex = index">
            
            <!-- Suggestion Content -->
            <div class="flex items-center gap-3">
              <!-- Type Icon -->
              <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                   :class="getSuggestionIconClass(suggestion.type)">
                {{ getSuggestionIcon(suggestion.type) }}
              </div>
              
              <!-- Content -->
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-800">{{ suggestion.text }}</span>
                  <span v-if="suggestion.aiScore" 
                        class="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-semibold">
                    {{ Math.round(suggestion.aiScore * 100) }}% match
                  </span>
                </div>
                
                <!-- Metadata -->
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span v-if="suggestion.category">📂 {{ suggestion.category }}</span>
                  <span v-if="suggestion.count">{{ suggestion.count }} results</span>
                  <span v-if="suggestion.trending" class="text-red-500">🔥 Trending</span>
                </div>
                
                <!-- AI Insights -->
                <div v-if="suggestion.aiInsight" class="mt-2 p-2 bg-blue-50 rounded-lg">
                  <div class="text-xs text-blue-600 font-medium mb-1">AI Insight:</div>
                  <div class="text-xs text-blue-700">{{ suggestion.aiInsight }}</div>
                </div>
              </div>
              
              <!-- Quick Actions -->
              <div class="flex items-center gap-1">
                <button v-if="suggestion.type === 'product'"
                        @click.stop="quickView(suggestion)"
                        class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  👁️
                </button>
                <button @click.stop="saveSuggestion(suggestion)"
                        class="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  💾
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Popular Searches -->
        <div v-if="!searchQuery && popularSearches.length" class="p-3 border-t">
          <div class="flex items-center gap-2 mb-3">
            <span>🔥</span>
            <span class="font-semibold text-gray-800">Popular Right Now</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button v-for="search in popularSearches" :key="search"
                    @click="selectPopularSearch(search)"
                    class="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm transition-colors">
              {{ search }}
            </button>
          </div>
        </div>

        <!-- AI Recommendations -->
        <div v-if="!searchQuery && aiRecommendations.length" class="p-3 border-t">
          <div class="flex items-center gap-2 mb-3">
            <span>🤖</span>
            <span class="font-semibold text-gray-800">AI Recommendations</span>
          </div>
          <div class="space-y-2">
            <div v-for="rec in aiRecommendations" :key="rec.id"
                 @click="selectRecommendation(rec)"
                 class="p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow">
              <div class="font-medium text-gray-800">{{ rec.title }}</div>
              <div class="text-sm text-gray-600">{{ rec.reason }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Filters -->
    <div v-if="showFilters" class="mt-3 flex flex-wrap gap-2">
      <button v-for="filter in activeFilters" :key="filter.id"
              @click="removeFilter(filter)"
              class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-purple-200 transition-colors">
        {{ filter.label }}
        <span class="text-xs">✕</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SearchSuggestion {
  id: string
  text: string
  type: 'product' | 'category' | 'brand' | 'user' | 'search' | 'ai'
  category?: string
  count?: number
  trending?: boolean
  aiScore?: number
  aiInsight?: string
  metadata?: Record<string, any>
}

interface DetectedIntent {
  type: string
  description: string
  suggestedActions: { label: string; action: string }[]
}

interface AIRecommendation {
  id: string
  title: string
  reason: string
  query: string
}

interface SearchFilter {
  id: string
  label: string
  type: string
  value: any
}

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const showSuggestions = ref(false)
const selectedIndex = ref(-1)
const isSearching = ref(false)
const aiMode = ref(true)
const showFilters = ref(false)

// Suggestions data
const suggestions = ref<SearchSuggestion[]>([])
const detectedIntent = ref<DetectedIntent>()
const popularSearches = ref(['iPhone 14', 'Nike Ayakkabı', 'Vintage Gömlek', 'Gaming Laptop', 'Antika Saat'])
const aiRecommendations = ref<AIRecommendation[]>([])
const activeFilters = ref<SearchFilter[]>([])

// Placeholder animation
const placeholders = [
  'Search with AI intelligence...',
  'Try "vintage leather jacket"',
  'Find "gaming setup under 5000₺"',
  'Look for "trending sneakers"',
  'Discover "handmade jewelry"'
]
const currentPlaceholder = ref(placeholders[0])

// Events
const emit = defineEmits<{
  search: [query: string, filters: SearchFilter[]]
  suggestion: [suggestion: SearchSuggestion]
  intent: [intent: DetectedIntent]
}>()

// Lifecycle
onMounted(() => {
  animatePlaceholder()
  loadAIRecommendations()
})

// Methods
const handleInput = async () => {
  if (searchQuery.value.length >= 2) {
    isSearching.value = true
    showSuggestions.value = true
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    await loadSuggestions()
    isSearching.value = false
  } else {
    suggestions.value = []
    detectedIntent.value = undefined
    showSuggestions.value = searchQuery.value.length === 0
  }
  selectedIndex.value = -1
}

const handleFocus = () => {
  showSuggestions.value = true
  showFilters.value = true
}

const handleBlur = () => {
  // Delay hiding to allow clicks on suggestions
  setTimeout(() => {
    showSuggestions.value = false
    showFilters.value = false
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showSuggestions.value || !suggestions.value.length) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length) {
        const suggestion = suggestions.value[selectedIndex.value]
        if (suggestion) {
          selectSuggestion(suggestion)
        }
      } else {
        performSearch()
      }
      break
    case 'Escape':
      showSuggestions.value = false
      searchInput.value?.blur()
      break
  }
}

const loadSuggestions = async () => {
  // Simulate AI-powered suggestion loading
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      text: searchQuery.value,
      type: 'search',
      count: 142,
      aiScore: 0.95,
      aiInsight: 'This search has high conversion rates in your demographic'
    },
    {
      id: '2',
      text: 'iPhone 14 Pro Max',
      type: 'product',
      category: 'Electronics',
      trending: true,
      aiScore: 0.88,
      aiInsight: 'Similar users often purchase this item'
    },
    {
      id: '3',
      text: 'Electronics',
      type: 'category',
      count: 1205,
      aiScore: 0.75
    }
  ]

  suggestions.value = mockSuggestions

  // Detect intent
  if (searchQuery.value.includes('ucuz') || searchQuery.value.includes('cheap')) {
    detectedIntent.value = {
      type: 'price_conscious',
      description: 'You seem to be looking for budget-friendly options',
      suggestedActions: [
        { label: 'Show deals', action: 'filter_deals' },
        { label: 'Sort by price', action: 'sort_price' },
        { label: 'Show discounts', action: 'filter_discounts' }
      ]
    }
  }
}

const loadAIRecommendations = () => {
  aiRecommendations.value = [
    {
      id: '1',
      title: 'Trending in your location',
      reason: 'Popular items in Istanbul this week',
      query: 'trending istanbul'
    },
    {
      id: '2',
      title: 'Based on your history',
      reason: 'You often buy electronics',
      query: 'electronics new arrivals'
    }
  ]
}

const selectSuggestion = (suggestion: SearchSuggestion) => {
  searchQuery.value = suggestion.text
  showSuggestions.value = false
  emit('suggestion', suggestion)
  performSearch()
}

const performSearch = () => {
  emit('search', searchQuery.value, activeFilters.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  suggestions.value = []
  detectedIntent.value = undefined
  searchInput.value?.focus()
}

const toggleAIMode = () => {
  aiMode.value = !aiMode.value
}

const applyAction = (action: { label: string; action: string }) => {
  console.log('Applying action:', action)
}

const quickView = (suggestion: SearchSuggestion) => {
  console.log('Quick view:', suggestion)
}

const saveSuggestion = (suggestion: SearchSuggestion) => {
  console.log('Saving suggestion:', suggestion)
}

const selectPopularSearch = (search: string) => {
  searchQuery.value = search
  showSuggestions.value = false
  performSearch()
}

const selectRecommendation = (rec: AIRecommendation) => {
  searchQuery.value = rec.query
  showSuggestions.value = false
  performSearch()
}

const removeFilter = (filter: SearchFilter) => {
  activeFilters.value = activeFilters.value.filter(f => f.id !== filter.id)
  performSearch()
}

const getSuggestionIcon = (type: string): string => {
  const icons = {
    product: '📦',
    category: '📂',
    brand: '🏷️',
    user: '👤',
    search: '🔍',
    ai: '🤖'
  }
  return icons[type as keyof typeof icons] || '🔍'
}

const getSuggestionIconClass = (type: string): string => {
  const classes = {
    product: 'bg-blue-100 text-blue-600',
    category: 'bg-green-100 text-green-600',
    brand: 'bg-yellow-100 text-yellow-600',
    user: 'bg-purple-100 text-purple-600',
    search: 'bg-gray-100 text-gray-600',
    ai: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-600'
}

const animatePlaceholder = () => {
  let index = 0
  setInterval(() => {
    index = (index + 1) % placeholders.length
    currentPlaceholder.value = placeholders[index]
  }, 3000)
}
</script>
