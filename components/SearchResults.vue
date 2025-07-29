<!-- components/SearchResults.vue -->
<!-- Smart search results with facets, sorting, and analytics -->

<template>
  <div class="search-results-container">
    <!-- Search Header -->
    <div class="search-header mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="search-info">
          <h1 class="text-xl font-semibold text-gray-900">
            Search Results
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            <span v-if="results">
              {{ results.total.toLocaleString() }} results found for 
              <span class="font-medium">"{{ results.query }}"</span>
              <span v-if="results.timing" class="text-gray-400 ml-2">
                ({{ results.timing.total.toFixed(0) }}ms)
              </span>
            </span>
            <span v-else class="animate-pulse">Searching...</span>
          </p>
        </div>

        <!-- Sort Options -->
        <div class="search-controls flex items-center space-x-4">
          <div class="sort-selector">
            <label class="text-sm text-gray-600 mr-2">Sort by:</label>
            <select
              v-model="sortBy"
              @change="onSortChange"
              class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>

          <!-- View Toggle -->
          <div class="view-toggle flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-1 rounded text-sm transition-colors',
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1 rounded text-sm transition-colors',
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <Icon name="heroicons:list-bullet" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Search Suggestions -->
      <div v-if="results?.suggestions && results.suggestions.length > 0" class="mt-4">
        <p class="text-sm text-gray-600 mb-2">Did you mean:</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="suggestion in results.suggestions"
            :key="suggestion"
            @click="$emit('search-suggestion', suggestion)"
            class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <div class="search-content flex flex-col lg:flex-row gap-6">
      <!-- Facets Sidebar -->
      <aside class="search-facets w-full lg:w-64 flex-shrink-0">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <h3 class="font-medium text-gray-900 mb-4">Filters</h3>

          <!-- Categories -->
          <div v-if="results?.facets?.categories.length" class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Categories</h4>
            <div class="space-y-2">
              <label
                v-for="category in results.facets.categories"
                :key="category.name"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="category.name"
                  v-model="selectedCategories"
                  @change="onFiltersChange"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">{{ category.name }}</span>
                <span class="text-xs text-gray-400">({{ category.count }})</span>
              </label>
            </div>
          </div>

          <!-- Brands -->
          <div v-if="results?.facets?.brands.length" class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Brands</h4>
            <div class="space-y-2">
              <label
                v-for="brand in results.facets.brands.slice(0, showAllBrands ? -1 : 5)"
                :key="brand.name"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="brand.name"
                  v-model="selectedBrands"
                  @change="onFiltersChange"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">{{ brand.name }}</span>
                <span class="text-xs text-gray-400">({{ brand.count }})</span>
              </label>
            </div>
            <button
              v-if="results.facets.brands.length > 5"
              @click="showAllBrands = !showAllBrands"
              class="text-sm text-blue-600 hover:text-blue-700 mt-2"
            >
              {{ showAllBrands ? 'Show Less' : `Show All (${results.facets.brands.length})` }}
            </button>
          </div>

          <!-- Price Range -->
          <div v-if="results?.facets?.priceRanges.length" class="mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
            <div class="space-y-2">
              <label
                v-for="priceRange in results.facets.priceRanges"
                :key="priceRange.range"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  :value="priceRange.range"
                  v-model="selectedPriceRange"
                  @change="onFiltersChange"
                  class="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">{{ priceRange.range }}</span>
                <span class="text-xs text-gray-400">({{ priceRange.count }})</span>
              </label>
            </div>
          </div>

          <!-- Clear Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Clear All Filters
          </button>
        </div>
      </aside>

      <!-- Main Results -->
      <main class="search-main flex-1">
        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="i in 12"
            :key="i"
            class="animate-pulse"
          >
            <div class="bg-gray-200 aspect-square rounded-lg mb-3"></div>
            <div class="bg-gray-200 h-4 rounded mb-2"></div>
            <div class="bg-gray-200 h-3 rounded w-2/3"></div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="results && results.products.length === 0" class="text-center py-12">
          <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p class="text-gray-600 mb-6">
            We couldn't find any products matching "{{ results.query }}".
          </p>
          <div class="space-y-3">
            <p class="text-sm text-gray-500">Try:</p>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Checking your spelling</li>
              <li>• Using fewer keywords</li>
              <li>• Using more general terms</li>
              <li>• Browsing categories instead</li>
            </ul>
          </div>
        </div>

        <!-- Results Grid -->
        <div v-else-if="results">
          <!-- Grid View -->
          <div 
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <ProductCard
              v-for="product in results.products"
              :key="product.id"
              :product="transformSearchProductToProduct(product)"
              :view-mode="'grid'"
              @click="$emit('select-product', product)"
              class="hover:shadow-lg transition-shadow duration-200"
            />
          </div>

          <!-- List View -->
          <div v-else class="space-y-4">
            <div
              v-for="product in results.products"
              :key="product.id"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              @click="$emit('select-product', product)"
            >
              <div class="flex items-center space-x-4">
                <img
                  :src="product.media[0] || '/placeholder.jpg'"
                  :alt="product.title"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 truncate">{{ product.title }}</h3>
                  <p class="text-sm text-gray-600">{{ product.brand }}</p>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="text-lg font-semibold text-blue-600">{{ formatPrice(product.price) }}₺</span>
                    <div class="flex items-center space-x-1">
                      <div class="flex">
                        <Icon
                          v-for="i in 5"
                          :key="i"
                          name="heroicons:star"
                          :class="[
                            'w-4 h-4',
                            i <= 4 ? 'text-yellow-400' : 'text-gray-300'
                          ]"
                          fill="currentColor"
                        />
                      </div>
                      <span class="text-xs text-gray-500">(4.0)</span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 mt-2 line-clamp-2">{{ product.description }}</p>
                </div>
                <div class="flex-shrink-0">
                  <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="results.total > pageSize" class="mt-8 flex justify-center">
            <nav class="flex items-center space-x-2">
              <button
                :disabled="currentPage <= 1"
                @click="changePage(currentPage - 1)"
                class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div class="flex items-center space-x-1">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  :class="[
                    'px-3 py-2 text-sm rounded-lg',
                    page === currentPage
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                :disabled="currentPage >= totalPages"
                @click="changePage(currentPage + 1)"
                class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </main>
    </div>

    <!-- Search Analytics (Debug Mode) -->
    <div v-if="showDebug && results?.timing" class="mt-8 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Search Performance</h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Total Time:</span>
          <span class="font-mono ml-2">{{ results.timing.total.toFixed(2) }}ms</span>
        </div>
        <div>
          <span class="text-gray-600">Embedding:</span>
          <span class="font-mono ml-2">{{ results.timing.embedding.toFixed(2) }}ms</span>
        </div>
        <div>
          <span class="text-gray-600">Search:</span>
          <span class="font-mono ml-2">{{ results.timing.search.toFixed(2) }}ms</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-gray-500">
        Fresh search result
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SearchResult } from '~/services/SearchService'

// Props
interface Props {
  results?: SearchResult | null
  isLoading?: boolean
  showDebug?: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'select-product': [product: any]
  'search-suggestion': [suggestion: string]
  'filters-change': [filters: any]
  'sort-change': [sortBy: string]
  'page-change': [page: number]
}>()

// Reactive state
const sortBy = ref('relevance')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedCategories = ref<string[]>([])
const selectedBrands = ref<string[]>([])
const selectedPriceRange = ref<string>('')
const showAllBrands = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

// Computed
const hasActiveFilters = computed(() => {
  return selectedCategories.value.length > 0 ||
         selectedBrands.value.length > 0 ||
         selectedPriceRange.value !== ''
})

const totalPages = computed(() => {
  if (!props.results) return 0
  return Math.ceil(props.results.total / pageSize.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // Ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1) // Ellipsis
      pages.push(total)
    }
  }

  return pages
})

// Methods
const transformSearchProductToProduct = (searchProduct: any) => {
  return {
    id: searchProduct.id,
    title: searchProduct.title,
    price: searchProduct.price,
    brand: searchProduct.brand,
    condition: 'new' as const,
    location: 'Turkey',
    image: searchProduct.media[0] || '/placeholder.jpg',
    views: Math.floor(Math.random() * 1000), // Mock data
    likes: Math.floor(Math.random() * 100),   // Mock data
    isFavorite: false,
    seller: {
      id: 'search-seller',
      name: searchProduct.brand,
      avatar: '/default-avatar.jpg',
      rating: 4.5,
      verified: true
    }
  }
}

const onSortChange = () => {
  emit('sort-change', sortBy.value)
}

const onFiltersChange = () => {
  const filters = {
    categories: selectedCategories.value,
    brands: selectedBrands.value,
    priceRange: selectedPriceRange.value
  }
  emit('filters-change', filters)
}

const clearFilters = () => {
  selectedCategories.value = []
  selectedBrands.value = []
  selectedPriceRange.value = ''
  onFiltersChange()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR').format(price)
}

// Watch for results changes to reset pagination
watch(() => props.results, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .search-facets {
    order: 2;
  }
  
  .search-main {
    order: 1;
  }
}

@media (max-width: 640px) {
  .search-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
