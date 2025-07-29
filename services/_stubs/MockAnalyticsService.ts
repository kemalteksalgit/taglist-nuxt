/**
 * STUB: Mock Analytics Service
 * TODO: Connect to real analytics API endpoints
 */

export interface AnalyticsDashboardConfig {
  timeRange: string
  metrics: string[]
  chartType: string
}

export interface TimeSeriesData {
  timestamp: string
  value: number
  label: string
}

export interface AnalyticsData {
  revenue: TimeSeriesData[]
  users: TimeSeriesData[]
  sales: TimeSeriesData[]
  traffic: TimeSeriesData[]
}

export class MockAnalyticsService {
  
  async getDashboardData(config: AnalyticsDashboardConfig): Promise<AnalyticsData> {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('TODO API: Replace with real analytics endpoint', config)
    
    // Generate mock time series data
    const now = new Date()
    const data: AnalyticsData = {
      revenue: [],
      users: [],
      sales: [],
      traffic: []
    }
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const timestamp = date.toISOString().split('T')[0]!
      
      data.revenue.push({
        timestamp,
        value: Math.floor(Math.random() * 10000) + 5000,
        label: 'Günlük Gelir'
      })
      
      data.users.push({
        timestamp,
        value: Math.floor(Math.random() * 500) + 100,
        label: 'Aktif Kullanıcı'
      })
      
      data.sales.push({
        timestamp,
        value: Math.floor(Math.random() * 50) + 10,
        label: 'Satış Sayısı'
      })
      
      data.traffic.push({
        timestamp,
        value: Math.floor(Math.random() * 1000) + 200,
        label: 'Sayfa Görüntüleme'
      })
    }
    
    return data
  }
  
  async getRealtimeMetrics() {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('TODO API: Replace with real realtime metrics endpoint')
    
    return {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      onlineListings: Math.floor(Math.random() * 20) + 5,
      activeBids: Math.floor(Math.random() * 10) + 2,
      revenue24h: Math.floor(Math.random() * 5000) + 2000
    }
  }
  
  async generateReport(type: string, dateRange: { start: string, end: string }) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('TODO API: Replace with real report generation endpoint', { type, dateRange })
    
    return {
      reportId: `report_${Date.now()}`,
      status: 'generated',
      downloadUrl: '#',
      createdAt: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const advancedAnalyticsService = new MockAnalyticsService()
