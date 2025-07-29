// server/api/search/analytics.get.ts
// Search analytics and performance monitoring API

import { searchService } from '~/services/SearchService'

export default defineEventHandler(async (event) => {
  try {
    // Get search service statistics
    const stats = searchService.getStats()
    
    // Calculate additional metrics
    const performanceGrade = calculatePerformanceGrade(stats)
    const healthStatus = getHealthStatus(stats)

    setHeader(event, 'Cache-Control', 'private, max-age=60') // 1 minute cache

    return {
      success: true,
      data: {
        performance: {
          totalQueries: stats.totalQueries,
          averageLatency: Math.round(stats.averageLatency * 100) / 100,
          p95Latency: Math.round(stats.p95Latency * 100) / 100,
          targetLatency: 150, // P95 target in ms
          grade: performanceGrade
        },
        quality: {
          clickThroughRate: Math.round(stats.ctr * 10000) / 100, // Convert to percentage
          noResultsRate: Math.round(stats.noResultsRate * 10000) / 100,
          targetCTR: 25, // Target CTR in percentage
          targetNoResults: 5 // Target no-results rate in percentage
        },
        health: {
          status: healthStatus,
          lastUpdated: new Date().toISOString(),
          uptime: '99.9%', // Would be calculated from actual monitoring
          errors: 0 // Would be tracked from error logs
        },
        features: {
          semanticSearch: true,
          typoTolerance: true,
          autoComplete: true,
          facetedSearch: true,
          hybridScoring: true,
          embedding: 'mock-e5-small', // Would be actual model name
          searchEngine: 'custom-hybrid'
        }
      }
    }

  } catch (error) {
    console.error('Analytics error:', error)
    
    setResponseStatus(event, 500)
    return {
      success: false,
      error: 'Failed to retrieve analytics',
      data: null
    }
  }
})

function calculatePerformanceGrade(stats: any): string {
  const p95Target = 150 // ms
  const p95Score = Math.max(0, (p95Target - stats.p95Latency) / p95Target)
  
  const noResultsTarget = 0.05 // 5%
  const noResultsScore = Math.max(0, (noResultsTarget - stats.noResultsRate) / noResultsTarget)
  
  const overallScore = (p95Score * 0.7) + (noResultsScore * 0.3)
  
  if (overallScore >= 0.9) return 'A+'
  if (overallScore >= 0.8) return 'A'
  if (overallScore >= 0.7) return 'B+'
  if (overallScore >= 0.6) return 'B'
  if (overallScore >= 0.5) return 'C'
  return 'D'
}

function getHealthStatus(stats: any): 'healthy' | 'warning' | 'critical' {
  // Critical if P95 latency > 300ms or no-results rate > 20%
  if (stats.p95Latency > 300 || stats.noResultsRate > 0.2) {
    return 'critical'
  }
  
  // Warning if P95 latency > 150ms or no-results rate > 10%
  if (stats.p95Latency > 150 || stats.noResultsRate > 0.1) {
    return 'warning'
  }
  
  return 'healthy'
}
