<!-- components/SmartSearchBar.vue -->
<!-- AI-powered search with autocomplete, suggestions, and analytics -->

<template>
  <div class="smart-search-container relative" ref="searchContainer">
    <!-- Main Search Input -->
    <div class="search-input-wrapper relative">
      <div 
        class="search-input flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
        :class="{ 'ring-2 ring-blue-500 border-blue-500': isActive }"
      >
        <div class="flex items-center pl-4">
          <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          placeholder="Search with AI: 'iPhone 15', 'running shoes'..."
          class="flex-1 px-3 py-3 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400"
          autocomplete="off"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeyDown"
          @paste="onPaste"
        />

        <!-- Search Options -->
        <div class="flex items-center space-x-2 pr-2">
          <!-- Voice Search (Future Enhancement) -->
          <button
            v-if="showVoiceSearch && browserSupportsVoice"
            type="button"
            class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            @click="toggleVoiceSearch"
            :disabled="isListening"
          >
            <Icon 
              :name="isListening ? 'heroicons:stop' : 'heroicons:microphone'" 
              class="w-4 h-4"
              :class="{ 'text-red-500 animate-pulse': isListening }"
            />
          </button>

          <!-- Visual Search (Future Enhancement) -->
          <button
            v-if="showVisualSearch"
            type="button"
            class="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            @click="$emit('visual-search')"
          >
            <Icon name="heroicons:camera" class="w-4 h-4" />
          </button>

          <!-- Clear Button -->
          <button
            v-if="query.length > 0"
            type="button"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors"
            @click="clearSearch"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>

          <!-- Search Button -->
          <button
            type="button"
            class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            :disabled="!query.trim() || isSearching"
            @click="performSearch"
          >
            <Icon 
              v-if="isSearching" 
              name="heroicons:arrow-path" 
              class="w-4 h-4 animate-spin" 
            />
            <span v-else class="text-sm font-medium">Search</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search Suggestions Dropdown -->
    <div
      v-if="showSuggestions && (suggestions.length > 0 || isLoadingSuggestions)"
      class="suggestions-dropdown absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden"
    >
      <!-- Loading State -->
      <div v-if="isLoadingSuggestions" class="p-4">
        <div class="flex items-center space-x-2">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin text-blue-500" />
          <span class="text-sm text-gray-500">Finding suggestions...</span>
        </div>
      </div>

      <!-- Suggestions List -->
      <div v-else class="py-2">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="suggestion"
          class="suggestion-item px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
          :class="{ 'bg-blue-50': index === selectedSuggestionIndex }"
          @click="selectSuggestion(suggestion)"
          @mouseenter="selectedSuggestionIndex = index"
        >
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-gray-400" />
          <span class="text-gray-900">{{ suggestion }}</span>
          <span v-if="query" class="text-xs text-gray-400 ml-auto">AI suggested</span>
        </div>

        <!-- No Suggestions -->
        <div v-if="suggestions.length === 0 && query.length >= 2" class="px-4 py-3 text-sm text-gray-500">
          No suggestions found. Try a different search term.
        </div>

        <!-- Popular Searches Footer -->
        <div v-if="suggestions.length > 0" class="border-t border-gray-100 px-4 py-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400">AI-powered suggestions</span>
            <div class="flex items-center space-x-1 text-xs text-gray-400">
              <Icon name="heroicons:cpu-chip" class="w-3 h-3" />
              <span>Smart Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results Preview (Optional) -->
    <div
      v-if="showPreview && previewResults.length > 0"
      class="preview-dropdown absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-40 max-h-80 overflow-hidden"
    >
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900">Quick Preview</h3>
          <button
            @click="showPreview = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="max-h-64 overflow-y-auto">
        <div
          v-for="result in previewResults.slice(0, 4)"
          :key="result.id"
          class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
          @click="$emit('select-result', result)"
        >
          <div class="flex items-center space-x-3">
            <img 
              :src="result.media[0] || '/placeholder.jpg'"
              :alt="result.title"
              class="w-12 h-12 object-cover rounded-lg"
            />
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 truncate">{{ result.title }}</h4>
              <p class="text-xs text-gray-500">{{ result.brand }}</p>
              <p class="text-sm font-semibold text-blue-600">{{ formatPrice(result.price) }}₺</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Performance Indicator (Debug Mode) -->
    <div v-if="showDebug && lastSearchTiming" class="mt-2 text-xs text-gray-500">
      Search completed in {{ lastSearchTiming.total.toFixed(0) }}ms 
      (Embedding: {{ lastSearchTiming.embedding.toFixed(0) }}ms, 
      Search: {{ lastSearchTiming.search.toFixed(0) }}ms)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { SearchQuery, SearchResult } from '~/services/SearchService'

// Props
interface Props {
  placeholder?: string
  showVoiceSearch?: boolean
  showVisualSearch?: boolean
  showPreview?: boolean
  showDebug?: boolean
  autoFocus?: boolean
  category?: string
  priceRange?: { min: number; max: number }
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search with AI...',
  showVoiceSearch: true,
  showVisualSearch: true,
  showPreview: true,
  showDebug: false,
  autoFocus: false
})

// Emits
const emit = defineEmits<{
  'search': [query: string, results: SearchResult]
  'select-result': [result: any]
  'visual-search': []
  'voice-search': [transcript: string]
  'clear': []
}>()

// Reactive state
const query = ref('')
const isActive = ref(false)
const isSearching = ref(false)
const isLoadingSuggestions = ref(false)
const isListening = ref(false)
const showSuggestions = ref(false)
const showPreview = ref(false)
const selectedSuggestionIndex = ref(-1)
const suggestions = ref<string[]>([])
const previewResults = ref<any[]>([])
const lastSearchTiming = ref<any>(null)

// Refs
const searchContainer = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()

// Computed
const browserSupportsVoice = computed(() => {
  return typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
})

// Debounced suggestion loading
let suggestionTimeout: NodeJS.Timeout | null = null

// Methods
const onInput = () => {
  selectedSuggestionIndex.value = -1
  
  if (suggestionTimeout) {
    clearTimeout(suggestionTimeout)
  }

  if (query.value.length >= 2) {
    suggestionTimeout = setTimeout(loadSuggestions, 300)
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
}

const onFocus = () => {
  isActive.value = true
  if (query.value.length >= 2) {
    showSuggestions.value = true
    loadSuggestions()
  } else if (query.value.length === 0) {
    // Show popular searches
    loadSuggestions()
  }
}

const onBlur = () => {
  // Delay to allow clicking on suggestions
  setTimeout(() => {
    isActive.value = false
    showSuggestions.value = false
    showPreview.value = false
  }, 150)
}

const onKeyDown = (event: KeyboardEvent) => {
  if (showSuggestions.value && suggestions.value.length > 0) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.min(
          selectedSuggestionIndex.value + 1,
          suggestions.value.length - 1
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
        break
      case 'Enter':
        event.preventDefault()
        if (selectedSuggestionIndex.value >= 0) {
          selectSuggestion(suggestions.value[selectedSuggestionIndex.value]!)
        } else {
          performSearch()
        }
        break
      case 'Escape':
        showSuggestions.value = false
        showPreview.value = false
        searchInput.value?.blur()
        break
    }
  } else if (event.key === 'Enter') {
    performSearch()
  }
}

const onPaste = () => {
  // Small delay to allow paste to complete
  setTimeout(() => {
    if (query.value.length >= 2) {
      loadSuggestions()
    }
  }, 50)
}

const loadSuggestions = async () => {
  if (isLoadingSuggestions.value) return

  isLoadingSuggestions.value = true
  
  try {
    const response = await $fetch<any>('/api/search/suggestions', {
      method: 'GET',
      query: { q: query.value }
    })

    if (response.success) {
      suggestions.value = response.data.suggestions
      showSuggestions.value = true
    }
  } catch (error) {
    console.error('Failed to load suggestions:', error)
    suggestions.value = []
  } finally {
    isLoadingSuggestions.value = false
  }
}

const selectSuggestion = (suggestion: string) => {
  query.value = suggestion
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
  performSearch()
}

const performSearch = async () => {
  if (!query.value.trim() || isSearching.value) return

  isSearching.value = true
  showSuggestions.value = false
  showPreview.value = false

  try {
    const searchQuery: SearchQuery = {
      q: query.value.trim(),
      category: props.category,
      priceRange: props.priceRange,
      limit: props.showPreview ? 20 : 50
    }

    const response = await $fetch<any>('/api/search', {
      method: 'POST',
      body: searchQuery
    })

    if (response.success) {
      const result = response.data
      lastSearchTiming.value = result.timing

      if (props.showPreview && result.products.length > 0) {
        previewResults.value = result.products
        showPreview.value = true
      }

      emit('search', query.value, result)
    }
  } catch (error) {
    console.error('Search failed:', error)
    // Show error toast or notification
  } finally {
    isSearching.value = false
  }
}

const clearSearch = () => {
  query.value = ''
  suggestions.value = []
  previewResults.value = []
  showSuggestions.value = false
  showPreview.value = false
  lastSearchTiming.value = null
  selectedSuggestionIndex.value = -1
  emit('clear')
  searchInput.value?.focus()
}

const toggleVoiceSearch = () => {
  if (!browserSupportsVoice.value) return

  if (isListening.value) {
    // Stop listening (implementation needed)
    isListening.value = false
  } else {
    // Start voice recognition (implementation needed)
    startVoiceRecognition()
  }
}

const startVoiceRecognition = () => {
  if (!browserSupportsVoice.value) return

  const recognition = new (window as any).webkitSpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'tr-TR' // Turkish, adjust as needed

  recognition.onstart = () => {
    isListening.value = true
  }

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    query.value = transcript
    emit('voice-search', transcript)
    performSearch()
  }

  recognition.onerror = () => {
    isListening.value = false
  }

  recognition.onend = () => {
    isListening.value = false
  }

  recognition.start()
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR').format(price)
}

// Click outside handler
const handleClickOutside = (event: Event) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showSuggestions.value = false
    showPreview.value = false
    isActive.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  if (props.autoFocus) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (suggestionTimeout) {
    clearTimeout(suggestionTimeout)
  }
})

// Expose methods for parent components
defineExpose({
  focus: () => searchInput.value?.focus(),
  clear: clearSearch,
  search: performSearch
})
</script>

<style scoped>
.smart-search-container {
  max-width: 100%;
}

.search-input-wrapper {
  position: relative;
  z-index: 10;
}

.suggestions-dropdown,
.preview-dropdown {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-item {
  transition: all 0.15s ease;
}

.suggestion-item:hover {
  background-color: #f9fafb;
}

/* Mobile responsive adjustments */
@media (max-width: 640px) {
  .search-input {
    border-radius: 1rem;
  }
  
  .suggestions-dropdown,
  .preview-dropdown {
    border-radius: 1rem;
    margin-top: 0.5rem;
  }
}
</style>
