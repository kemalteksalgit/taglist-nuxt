// server/api/personalization/behavior.post.ts
// User Behavior Tracking API Endpoint

import { personalizationService } from '~/services/PersonalizationService'
import type { BehaviorEvent } from '~/services/PersonalizationService'

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody(event)
    
    // Validate request
    if (!body.userId || !body.type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and event type are required'
      })
    }

    // Validate event type
    const validEventTypes = ['view', 'search', 'save', 'share', 'purchase', 'bid', 'click', 'scroll', 'filter']
    if (!validEventTypes.includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid event type'
      })
    }

    // Prepare behavior event (excluding id and timestamp which are generated in the service)
    const behaviorEvent: Omit<BehaviorEvent, 'id' | 'timestamp'> = {
      userId: body.userId,
      type: body.type,
      productId: body.productId,
      query: body.query,
      category: body.category,
      brand: body.brand,
      price: body.price,
      sessionId: body.sessionId || generateSessionId(),
      context: {
        source: body.context?.source || 'unknown',
        device: body.context?.device || 'web',
        location: body.context?.location,
        duration: body.context?.duration,
        scrollDepth: body.context?.scrollDepth
      },
      metadata: body.metadata || {}
    }

    // Track the behavior
    await personalizationService.trackBehavior(behaviorEvent)

    // Log for analytics
    console.log('Behavior tracked:', {
      userId: body.userId,
      type: body.type,
      productId: body.productId,
      category: body.category
    })

    return {
      success: true,
      message: 'Behavior tracked successfully',
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('Behavior tracking failed:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Behavior tracking failed',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})

function generateRequestId(): string {
  return `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
