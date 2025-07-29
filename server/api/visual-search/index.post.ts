// server/api/visual-search/index.post.ts
// Visual Search API Endpoint

import { visualSearchService } from '~/services/VisualSearchService'
import type { VisualSearchQuery } from '~/services/VisualSearchService'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  try {
    // Parse request body
    const body = await readBody(event)
    
    // Validate request
    if (!body.imageData && !body.imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image data or URL is required'
      })
    }

    // Prepare search query
    const query: VisualSearchQuery = {
      imageData: body.imageData,
      imageUrl: body.imageUrl,
      cropBox: body.cropBox,
      filters: {
        category: body.filters?.category,
        priceRange: body.filters?.priceRange,
        brand: body.filters?.brand,
        color: body.filters?.color
      },
      limit: body.limit || 20,
      threshold: body.threshold || 0.3
    }

    // Perform visual search
    const results = await visualSearchService.search(query)

    // Add request timing
    const processingTime = Date.now() - startTime
    const enhancedTiming = {
      ...results.timing,
      apiProcessing: processingTime
    }

    // Log analytics (in production, you'd store this in a database)
    console.log('Visual search completed:', {
      processingTime,
      resultsCount: results.products.length,
      detectedObjects: results.detectedObjects?.length || 0,
      dominantColors: results.dominantColors?.length || 0
    })

    return {
      success: true,
      data: {
        ...results,
        timing: enhancedTiming
      },
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        processingTime
      }
    }

  } catch (error) {
    console.error('Visual search failed:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Visual search failed',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})

function generateRequestId(): string {
  return `vs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
