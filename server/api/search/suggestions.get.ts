// server/api/search/suggestions.get.ts
// Search suggestions and autocomplete API

import { searchService } from '~/services/SearchService'

// Popular queries cache for autocomplete
const popularQueries = [
  'iPhone', 'Samsung', 'MacBook', 'Nike', 'Adidas',
  'phone', 'laptop', 'shoes', 'headphones', 'watch',
  'gaming', 'electronics', 'fashion', 'sports', 'tech'
]

const suggestionCache = new Map<string, string[]>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchTerm = (query.q as string)?.trim() || ''

  try {
    // Return empty for very short queries
    if (searchTerm.length < 2) {
      return {
        success: true,
        data: {
          suggestions: popularQueries.slice(0, 8),
          type: 'popular'
        }
      }
    }

    // Check cache first
    const cacheKey = searchTerm.toLowerCase()
    const cached = suggestionCache.get(cacheKey)
    if (cached) {
      return {
        success: true,
        data: {
          suggestions: cached,
          type: 'cached'
        }
      }
    }

    // Generate suggestions
    const suggestions = await generateSuggestions(searchTerm)
    
    // Cache results
    suggestionCache.set(cacheKey, suggestions)
    
    // Clean cache periodically
    if (suggestionCache.size > 500) {
      suggestionCache.clear()
    }

    setHeader(event, 'Cache-Control', 'public, max-age=1800') // 30 minutes

    return {
      success: true,
      data: {
        suggestions,
        type: 'generated'
      }
    }

  } catch (error) {
    console.error('Suggestions error:', error)
    
    return {
      success: false,
      error: 'Failed to generate suggestions',
      data: {
        suggestions: [],
        type: 'error'
      }
    }
  }
})

async function generateSuggestions(searchTerm: string): Promise<string[]> {
  const suggestions = new Set<string>()
  
  // Add fuzzy matches from popular queries
  popularQueries.forEach(popular => {
    if (popular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calculateSimilarity(searchTerm.toLowerCase(), popular.toLowerCase()) > 0.6) {
      suggestions.add(popular)
    }
  })

  // Add prefix matches (most relevant)
  popularQueries.forEach(popular => {
    if (popular.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      suggestions.add(popular)
    }
  })

  // Get suggestions from search service
  try {
    const searchResult = await searchService.search({ q: searchTerm, limit: 5 })
    
    // Add product titles and brands as suggestions
    searchResult.products.forEach(product => {
      suggestions.add(product.title)
      suggestions.add(product.brand)
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
          suggestions.add(tag)
        }
      })
    })

    // Add API suggestions if available
    if (searchResult.suggestions) {
      searchResult.suggestions.forEach(suggestion => suggestions.add(suggestion))
    }
  } catch (error) {
    console.error('Error getting search suggestions:', error)
  }

  // Convert to array and limit results
  return Array.from(suggestions)
    .filter(suggestion => 
      suggestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      calculateSimilarity(searchTerm.toLowerCase(), suggestion.toLowerCase()) > 0.5
    )
    .sort((a, b) => {
      // Sort by relevance: exact prefix matches first, then by similarity
      const aStarts = a.toLowerCase().startsWith(searchTerm.toLowerCase())
      const bStarts = b.toLowerCase().startsWith(searchTerm.toLowerCase())
      
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      const aSim = calculateSimilarity(searchTerm.toLowerCase(), a.toLowerCase())
      const bSim = calculateSimilarity(searchTerm.toLowerCase(), b.toLowerCase())
      
      return bSim - aSim
    })
    .slice(0, 8)
}

function calculateSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1

  const distance = levenshteinDistance(a, b)
  return Math.max(0, 1 - distance / maxLen)
}

function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0))
  
  for (let i = 0; i <= a.length; i++) matrix[i]![0] = i
  for (let j = 0; j <= b.length; j++) matrix[0]![j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j - 1]! + 1
        )
      }
    }
  }

  return matrix[a.length]![b.length]!
}
