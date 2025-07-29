<!-- AI Smart Search Page with advanced filtering and analytics -->

<template>
  <div class="search-page min-h-screen bg-gray-50">
    <!-- Search Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4">
          <!-- Back Button -->
          <button
            @click="$router.go(-1)"
            class="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          </button>

          <!-- Search Bar -->
          <div class="flex-1 max-w-3xl">
            <SmartSearchBar
              :auto-focus="!hasInitialQuery"
              :show-preview="false"
              :show-debug="isDebugMode"
              @search="handleSearch"
              @clear="handleClear"
              @visual-search="handleVisualSearch"
              @voice-search="handleVoiceSearch"
            />
          </div>

          <!-- Settings -->
          <button
            @click="showSettings = !showSettings"
            class="flex-shrink-0 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Welcome State -->
      <div v-if="!searchQuery && !isLoading" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">AI-Powered Search</h2>
          <p class="text-gray-600 mb-8">
            Search smarter with AI. Find products using natural language, handle typos automatically, and get personalized results.
          </p>
          
          <!-- Popular Searches -->
          <div class="text-left">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Popular Searches</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="popular in popularSearches"
                :key="popular"
                @click="performPopularSearch(popular)"
                class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                {{ popular }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <SearchResults
        v-if="searchQuery"
        :results="searchResults"
        :is-loading="isLoading"
        :show-debug="isDebugMode"
        @select-product="handleProductSelect"
        @search-suggestion="handleSuggestionClick"
        @filters-change="handleFiltersChange"
        @sort-change="handleSortChange"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { SearchResult, SearchQuery } from '~/services/SearchService'

// Meta
definePageMeta({
  title: 'AI Smart Search - Taglist',
  description: 'Search products with AI-powered semantic search, typo tolerance, and smart suggestions'
})

// State
const searchQuery = ref('')
const searchResults = ref<SearchResult | null>(null)
const isLoading = ref(false)
const showSettings = ref(false)
const isDebugMode = ref(false)

const popularSearches = ref([
  'iPhone 15', 'Samsung Galaxy', 'MacBook', 'Nike shoes', 
  'Adidas sneakers', 'gaming laptop', 'wireless headphones', 'smart watch'
])

// Route handling
const route = useRoute()
const router = useRouter()

const hasInitialQuery = computed(() => {
  return !!(route.query.q as string)?.trim()
})

// Methods
const handleSearch = async (query: string, results: SearchResult) => {
  searchQuery.value = query
  searchResults.value = results
  
  // Update URL
  await router.push({
    path: '/search',
    query: { q: query }
  })
}

const handleClear = () => {
  searchQuery.value = ''
  searchResults.value = null
  router.push('/search')
}

const handleProductSelect = (product: any) => {
  router.push(`/product/${product.id}`)
}

const handleSuggestionClick = (suggestion: string) => {
  searchQuery.value = suggestion
  performSearch(suggestion)
}

const handleFiltersChange = (filters: any) => {
  if (searchQuery.value) {
    performSearch(searchQuery.value, filters)
  }
}

const handleSortChange = (sortBy: string) => {
  if (searchQuery.value) {
    performSearch(searchQuery.value, { sortBy })
  }
}

const handlePageChange = (page: number) => {
  if (searchQuery.value) {
    const offset = (page - 1) * 20
    performSearch(searchQuery.value, { offset, limit: 20 })
  }
}

const handleVisualSearch = () => {
  console.log('Visual search coming in Phase 3!')
}

const handleVoiceSearch = (transcript: string) => {
  searchQuery.value = transcript
  performSearch(transcript)
}

const performPopularSearch = (query: string) => {
  searchQuery.value = query
  performSearch(query)
}

const performSearch = async (query: string, options: any = {}) => {
  isLoading.value = true

  try {
    const searchQuery: SearchQuery = {
      q: query,
      limit: options.limit || 20,
      offset: options.offset || 0,
      sortBy: options.sortBy || 'relevance',
      ...options
    }

    const response = await $fetch<any>('/api/search', {
      method: 'POST',
      body: searchQuery
    })

    if (response.success) {
      searchResults.value = response.data
      
      // Update URL
      await router.push({
        path: '/search',
        query: { q: query }
      })
    }
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Handle initial query from URL
  const initialQuery = route.query.q as string
  if (initialQuery?.trim()) {
    searchQuery.value = initialQuery
    await performSearch(initialQuery)
  }
})
</script>

<style scoped>
.search-page {
  position: relative;
}

@media (max-width: 640px) {
  .search-page {
    padding-top: 0;
  }
}
</style>
