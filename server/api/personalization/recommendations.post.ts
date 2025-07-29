// server/api/personalization/recommendations.post.ts
// Personalized Recommendations API Endpoint

import { personalizationService } from '~/services/PersonalizationService'
import type { PersonalizationQuery } from '~/services/PersonalizationService'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  try {
    // Parse request body
    const body = await readBody(event)
    
    // Validate request
    if (!body.userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Prepare personalization query
    const query: PersonalizationQuery = {
      userId: body.userId,
      context: {
        page: body.context?.page || 'unknown',
        category: body.context?.category,
        searchQuery: body.context?.searchQuery,
        previousProducts: body.context?.previousProducts
      },
      limit: body.limit || 20,
      includeReasoning: body.includeReasoning !== false
    }

    // Get personalized recommendations
    const results = await personalizationService.getPersonalizedRecommendations(query)

    // Add request timing
    const processingTime = Date.now() - startTime
    const enhancedTiming = {
      ...results.timing,
      apiProcessing: processingTime
    }

    // Log analytics
    console.log('Personalization completed:', {
      userId: body.userId,
      processingTime,
      resultsCount: results.products.length,
      confidence: results.confidence,
      segments: results.segments
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
        processingTime,
        cacheInfo: {
          cached: false,
          ttl: 300 // 5 minutes
        }
      }
    }

  } catch (error) {
    console.error('Personalization failed:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Personalization failed',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})

function generateRequestId(): string {
  return `pr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
