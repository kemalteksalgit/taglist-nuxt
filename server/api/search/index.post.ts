// server/api/search/index.post.ts
// AI Smart Search API endpoint with caching and analytics

import { searchService, type SearchQuery, type SearchResult } from '~/services/SearchService'

// Response caching for performance
const searchCache = new Map<string, { result: SearchResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Search analytics tracking
const searchAnalytics = {
  totalQueries: 0,
  popularQueries: new Map<string, number>(),
  noResultQueries: new Set<string>(),
  avgResponseTime: 0,
  responseTimeHistory: [] as number[]
}

export default defineEventHandler(async (event) => {
  const startTime = performance.now()
  
  try {
    const body = await readBody(event)
    const query: SearchQuery = {
      q: body.q?.trim() || '',
      limit: Math.min(body.limit || 20, 100), // Cap at 100 results
      offset: Math.max(body.offset || 0, 0),
      category: body.category || undefined,
      priceRange: body.priceRange || undefined,
      sortBy: body.sortBy || 'relevance'
    }

    // Validate query
    if (!query.q || query.q.length < 1) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: 'Search query is required and must be at least 1 character',
        data: null
      }
    }

    if (query.q.length > 100) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: 'Search query must be less than 100 characters',
        data: null
      }
    }

    // Check cache first
    const cacheKey = JSON.stringify(query)
    const cached = searchCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const responseTime = performance.now() - startTime
      
      return {
        success: true,
        data: {
          ...cached.result,
          timing: {
            ...cached.result.timing,
            total: responseTime
          },
          cached: true
        },
        meta: {
          query: query.q,
          total: cached.result.total,
          responseTime
        }
      }
    }

    // Perform search
    const result = await searchService.search(query)
    const responseTime = performance.now() - startTime

    // Cache successful results
    if (result.products.length > 0) {
      searchCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })

      // Clean cache if it gets too large
      if (searchCache.size > 1000) {
        const entries = Array.from(searchCache.entries())
        entries
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, 500)
          .forEach(([key]) => searchCache.delete(key))
      }
    }

    // Update analytics
    updateSearchAnalytics(query.q, result.products.length === 0, responseTime)

    // Set appropriate headers
    setHeader(event, 'Cache-Control', 'public, max-age=300') // 5 minutes client cache
    setHeader(event, 'X-Search-Results', result.total.toString())
    setHeader(event, 'X-Response-Time', responseTime.toFixed(2))

    return {
      success: true,
      data: {
        ...result,
        cached: false
      },
      meta: {
        query: query.q,
        total: result.total,
        responseTime
      }
    }

  } catch (error) {
    const responseTime = performance.now() - startTime
    
    console.error('Search error:', error)
    
    setResponseStatus(event, 500)
    return {
      success: false,
      error: 'Internal search error occurred',
      data: null,
      meta: {
        responseTime
      }
    }
  }
})

function updateSearchAnalytics(query: string, noResults: boolean, responseTime: number): void {
  searchAnalytics.totalQueries++
  
  // Track popular queries
  const normalizedQuery = query.toLowerCase().trim()
  searchAnalytics.popularQueries.set(
    normalizedQuery,
    (searchAnalytics.popularQueries.get(normalizedQuery) || 0) + 1
  )

  // Track no-result queries
  if (noResults) {
    searchAnalytics.noResultQueries.add(normalizedQuery)
  }

  // Update response time metrics
  searchAnalytics.responseTimeHistory.push(responseTime)
  if (searchAnalytics.responseTimeHistory.length > 1000) {
    searchAnalytics.responseTimeHistory.shift()
  }

  searchAnalytics.avgResponseTime = 
    searchAnalytics.responseTimeHistory.reduce((sum, time) => sum + time, 0) / 
    searchAnalytics.responseTimeHistory.length
}
