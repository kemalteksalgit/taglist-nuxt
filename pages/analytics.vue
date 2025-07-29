<template>
  <div class="analytics-page">
    <Head>
      <title>Advanced Analytics - Business Intelligence</title>
      <meta name="description" content="Comprehensive business analytics, insights, and intelligence dashboard" />
    </Head>

    <!-- Page Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">Advanced Analytics</h1>
          <p class="page-description">
            Comprehensive business intelligence, predictive analytics, and data-driven insights
          </p>
        </div>
        
        <div class="header-actions">
          <button @click="refreshAllData" class="btn btn-secondary" :disabled="isLoading">
            <Icon name="refresh" :class="{ 'animate-spin': isLoading }" />
            Refresh Data
          </button>
          
          <button @click="showCreateDashboard = true" class="btn btn-primary">
            <Icon name="plus" />
            Create Dashboard
          </button>
          
          <button @click="showReportBuilder = true" class="btn btn-primary">
            <Icon name="file-text" />
            Generate Report
          </button>
        </div>
      </div>
    </div>

    <!-- Analytics Navigation Tabs -->
    <div class="analytics-nav">
      <div class="container">
        <nav class="tab-navigation">
          <button v-for="tab in analyticsTabs" 
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="['tab-button', { 'active': activeTab === tab.id }]">
            <Icon :name="tab.icon" />
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <div class="container">
        
        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'" class="tab-panel">
          <AdvancedAnalyticsDashboard 
            :dashboard-id="selectedDashboard"
            :timeframe="selectedTimeframe"
            :filters="dashboardFilters" />
        </div>

        <!-- Insights Tab -->
        <div v-if="activeTab === 'insights'" class="tab-panel">
          <div class="insights-container">
            <div class="insights-header">
              <h2>AI-Generated Insights</h2>
              <div class="insights-filters">
                <select v-model="insightsFilter" @change="loadInsights" class="filter-select">
                  <option value="all">All Categories</option>
                  <option value="sales">Sales</option>
                  <option value="users">Users</option>
                  <option value="products">Products</option>
                  <option value="marketing">Marketing</option>
                  <option value="performance">Performance</option>
                </select>
                
                <select v-model="insightsType" @change="loadInsights" class="filter-select">
                  <option value="all">All Types</option>
                  <option value="opportunity">Opportunities</option>
                  <option value="warning">Warnings</option>
                  <option value="trend">Trends</option>
                  <option value="anomaly">Anomalies</option>
                  <option value="recommendation">Recommendations</option>
                </select>
              </div>
            </div>
            
            <div class="insights-grid">
              <div v-for="insight in insights" :key="insight.id" class="insight-card">
                <div class="insight-header">
                  <div :class="['insight-type', `type-${insight.type}`]">
                    <Icon :name="getInsightIcon(insight.type)" />
                    {{ insight.type.replace('_', ' ').toUpperCase() }}
                  </div>
                  <div :class="['insight-impact', `impact-${insight.impact}`]">
                    {{ insight.impact.toUpperCase() }}
                  </div>
                </div>
                
                <h3 class="insight-title">{{ insight.title }}</h3>
                <p class="insight-description">{{ insight.description }}</p>
                
                <div class="insight-metrics">
                  <span v-for="metric in insight.metrics" :key="metric" class="metric-tag">
                    {{ metric }}
                  </span>
                </div>
                
                <div class="insight-confidence">
                  <span class="confidence-label">Confidence:</span>
                  <div class="confidence-bar">
                    <div class="confidence-fill" :style="{ width: `${insight.confidence * 100}%` }"></div>
                  </div>
                  <span class="confidence-value">{{ (insight.confidence * 100).toFixed(0) }}%</span>
                </div>
                
                <div class="insight-actions">
                  <button @click="viewInsightDetails(insight)" class="btn btn-sm btn-secondary">
                    View Details
                  </button>
                  <button v-if="insight.recommendations?.length" 
                          @click="applyRecommendations(insight)" 
                          class="btn btn-sm btn-primary">
                    Apply Recommendations
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Predictions Tab -->
        <div v-if="activeTab === 'predictions'" class="tab-panel">
          <div class="predictions-container">
            <div class="predictions-header">
              <h2>Predictive Analytics</h2>
              <div class="predictions-controls">
                <select v-model="predictionTimeframe" @change="loadPredictions" class="filter-select">
                  <option value="7">Next 7 Days</option>
                  <option value="30">Next 30 Days</option>
                  <option value="90">Next 90 Days</option>
                  <option value="365">Next Year</option>
                </select>
              </div>
            </div>
            
            <div class="predictions-grid">
              <div v-for="(prediction, key) in predictions" :key="key" class="prediction-card">
                <h3 class="prediction-title">{{ formatPredictionTitle(key) }}</h3>
                
                <div class="prediction-value">
                  <span class="value">{{ formatPredictionValue(prediction.value, key) }}</span>
                  <div class="confidence-indicator">
                    <span class="confidence-label">{{ (prediction.confidence * 100).toFixed(0) }}% confidence</span>
                  </div>
                </div>
                
                <div class="prediction-range">
                  <span class="range-label">Expected Range:</span>
                  <span class="range-value">
                    {{ formatPredictionValue(prediction.range.min, key) }} - 
                    {{ formatPredictionValue(prediction.range.max, key) }}
                  </span>
                </div>
                
                <div class="prediction-factors">
                  <h4>Key Factors:</h4>
                  <div class="factors-list">
                    <div v-for="factor in prediction.factors" :key="factor.name" class="factor-item">
                      <span class="factor-name">{{ factor.name.replace('_', ' ') }}</span>
                      <div :class="['factor-impact', factor.direction]">
                        <Icon :name="factor.direction === 'positive' ? 'trending-up' : 'trending-down'" />
                        {{ Math.abs(factor.impact * 100).toFixed(0) }}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="prediction-chart">
                  <PredictionChart :data="prediction" :type="key" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Segments Tab -->
        <div v-if="activeTab === 'segments'" class="tab-panel">
          <div class="segments-container">
            <div class="segments-header">
              <h2>Customer Segmentation</h2>
              <button @click="showSegmentBuilder = true" class="btn btn-primary">
                <Icon name="plus" />
                Create Segment
              </button>
            </div>
            
            <div class="segments-grid">
              <div v-for="segment in customerSegments" :key="segment.id" class="segment-card">
                <div class="segment-header">
                  <h3 class="segment-name">{{ segment.name }}</h3>
                  <div class="segment-size">{{ segment.size.toLocaleString() }} customers</div>
                </div>
                
                <p class="segment-description">{{ segment.description }}</p>
                
                <div class="segment-metrics">
                  <div class="metric-item">
                    <span class="metric-label">Avg Order Value</span>
                    <span class="metric-value">${{ segment.behavior.averageOrderValue.toFixed(2) }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Frequency</span>
                    <span class="metric-value">{{ segment.behavior.frequency.toFixed(1) }}/month</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Lifetime Value</span>
                    <span class="metric-value">${{ segment.value.lifetime.toFixed(0) }}</span>
                  </div>
                </div>
                
                <div class="segment-characteristics">
                  <h4>Key Characteristics:</h4>
                  <div class="characteristics-list">
                    <span v-for="char in segment.characteristics.slice(0, 3)" 
                          :key="char.dimension" 
                          class="characteristic-tag">
                      {{ char.dimension }}: {{ char.value }}
                    </span>
                  </div>
                </div>
                
                <div class="segment-actions">
                  <button @click="viewSegmentDetails(segment)" class="btn btn-sm btn-secondary">
                    View Details
                  </button>
                  <button @click="targetSegment(segment)" class="btn btn-sm btn-primary">
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports Tab -->
        <div v-if="activeTab === 'reports'" class="tab-panel">
          <div class="reports-container">
            <div class="reports-header">
              <h2>Analytics Reports</h2>
              <button @click="showReportBuilder = true" class="btn btn-primary">
                <Icon name="file-plus" />
                Generate Report
              </button>
            </div>
            
            <div class="reports-list">
              <div v-for="report in reports" :key="report.id" class="report-item">
                <div class="report-content">
                  <h3 class="report-title">{{ report.title }}</h3>
                  <p class="report-meta">
                    {{ report.type.toUpperCase() }} • 
                    Generated {{ formatDate(report.generatedAt) }} •
                    {{ report.format.toUpperCase() }}
                  </p>
                  <p class="report-description">
                    Report covering {{ formatDate(report.period.start) }} to {{ formatDate(report.period.end) }}
                  </p>
                </div>
                
                <div class="report-actions">
                  <button @click="downloadReport(report)" class="btn btn-sm btn-secondary">
                    <Icon name="download" />
                    Download
                  </button>
                  <button @click="viewReport(report)" class="btn btn-sm btn-primary">
                    <Icon name="eye" />
                    View
                  </button>
                  <button @click="shareReport(report)" class="btn btn-sm btn-secondary">
                    <Icon name="share" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Models Tab -->
        <div v-if="activeTab === 'models'" class="tab-panel">
          <div class="models-container">
            <div class="models-header">
              <h2>ML Models</h2>
              <button @click="showModelBuilder = true" class="btn btn-primary">
                <Icon name="cpu" />
                Train Model
              </button>
            </div>
            
            <div class="models-grid">
              <div v-for="model in mlModels" :key="model.id" class="model-card">
                <div class="model-header">
                  <h3 class="model-name">{{ model.name }}</h3>
                  <div :class="['model-status', model.status]">
                    <Icon :name="getModelStatusIcon(model.status)" />
                    {{ model.status.toUpperCase() }}
                  </div>
                </div>
                
                <p class="model-description">{{ model.description }}</p>
                
                <div class="model-metrics">
                  <div class="metric-item">
                    <span class="metric-label">Accuracy</span>
                    <span class="metric-value">{{ (model.performance.accuracy * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Type</span>
                    <span class="metric-value">{{ model.type.replace('_', ' ') }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Last Trained</span>
                    <span class="metric-value">{{ formatDate(model.lastTrained) }}</span>
                  </div>
                </div>
                
                <div class="model-performance">
                  <h4>Performance Metrics:</h4>
                  <div class="performance-grid">
                    <div v-if="model.performance.precision" class="performance-item">
                      <span class="performance-label">Precision</span>
                      <span class="performance-value">{{ (model.performance.precision * 100).toFixed(1) }}%</span>
                    </div>
                    <div v-if="model.performance.recall" class="performance-item">
                      <span class="performance-label">Recall</span>
                      <span class="performance-value">{{ (model.performance.recall * 100).toFixed(1) }}%</span>
                    </div>
                    <div v-if="model.performance.f1Score" class="performance-item">
                      <span class="performance-label">F1 Score</span>
                      <span class="performance-value">{{ (model.performance.f1Score * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                </div>
                
                <div class="model-actions">
                  <button @click="viewModelDetails(model)" class="btn btn-sm btn-secondary">
                    View Details
                  </button>
                  <button v-if="model.status === 'trained'" 
                          @click="deployModel(model)" 
                          class="btn btn-sm btn-primary">
                    Deploy
                  </button>
                  <button v-if="model.status === 'deployed'" 
                          @click="retrainModel(model)" 
                          class="btn btn-sm btn-warning">
                    Retrain
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Report Builder Modal -->
    <Modal v-if="showReportBuilder" @close="showReportBuilder = false">
      <div class="report-builder">
        <h2>Generate Analytics Report</h2>
        
        <form @submit.prevent="generateReport" class="report-form">
          <div class="form-group">
            <label for="report-title">Report Title</label>
            <input type="text" 
                   id="report-title" 
                   v-model="reportConfig.title" 
                   class="form-input" 
                   required />
          </div>
          
          <div class="form-group">
            <label for="report-type">Report Type</label>
            <select id="report-type" v-model="reportConfig.type" class="form-select" required>
              <option value="summary">Executive Summary</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="operational">Operational Report</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="report-period">Time Period</label>
            <div class="date-range">
              <input type="date" v-model="reportConfig.startDate" class="form-input" required />
              <span class="date-separator">to</span>
              <input type="date" v-model="reportConfig.endDate" class="form-input" required />
            </div>
          </div>
          
          <div class="form-group">
            <label>Include Sections</label>
            <div class="checkbox-group">
              <label v-for="section in availableSections" :key="section.id" class="checkbox-label">
                <input type="checkbox" 
                       :value="section.id" 
                       v-model="reportConfig.sections" />
                {{ section.label }}
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="report-format">Format</label>
            <select id="report-format" v-model="reportConfig.format" class="form-select">
              <option value="pdf">PDF Document</option>
              <option value="excel">Excel Workbook</option>
              <option value="csv">CSV Data</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showReportBuilder = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="generatingReport" class="btn btn-primary">
              <Icon v-if="generatingReport" name="loader" class="animate-spin" />
              {{ generatingReport ? 'Generating...' : 'Generate Report' }}
            </button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Segment Builder Modal -->
    <Modal v-if="showSegmentBuilder" @close="showSegmentBuilder = false">
      <div class="segment-builder">
        <h2>Create Customer Segment</h2>
        
        <form @submit.prevent="createSegment" class="segment-form">
          <div class="form-group">
            <label for="segment-name">Segment Name</label>
            <input type="text" 
                   id="segment-name" 
                   v-model="segmentConfig.name" 
                   class="form-input" 
                   required />
          </div>
          
          <div class="form-group">
            <label for="segment-description">Description</label>
            <textarea id="segment-description" 
                      v-model="segmentConfig.description" 
                      class="form-textarea"
                      rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>Segmentation Criteria</label>
            <div class="criteria-builder">
              <div v-for="(criterion, index) in segmentConfig.criteria" 
                   :key="index" 
                   class="criterion-item">
                <select v-model="criterion.dimension" class="form-select">
                  <option value="age">Age</option>
                  <option value="location">Location</option>
                  <option value="purchase_frequency">Purchase Frequency</option>
                  <option value="order_value">Average Order Value</option>
                  <option value="last_purchase">Last Purchase</option>
                </select>
                
                <select v-model="criterion.operator" class="form-select">
                  <option value="equals">Equals</option>
                  <option value="greater_than">Greater Than</option>
                  <option value="less_than">Less Than</option>
                  <option value="contains">Contains</option>
                </select>
                
                <input type="text" 
                       v-model="criterion.value" 
                       class="form-input" 
                       placeholder="Value" />
                
                <button type="button" 
                        @click="removeSegmentCriterion(index)" 
                        class="btn btn-sm btn-danger">
                  <Icon name="x" />
                </button>
              </div>
              
              <button type="button" 
                      @click="addSegmentCriterion" 
                      class="btn btn-sm btn-secondary">
                <Icon name="plus" />
                Add Criterion
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="showSegmentBuilder = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="creatingSegment" class="btn btn-primary">
              <Icon v-if="creatingSegment" name="loader" class="animate-spin" />
              {{ creatingSegment ? 'Creating...' : 'Create Segment' }}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { advancedAnalyticsService } from '~/services/_stubs/MockAnalyticsService'
import type { 
  AnalyticsInsight, 
  CustomerSegment, 
  ReportData, 
  PredictiveModel
} from '~/types/analytics'

// Meta
definePageMeta({
  title: 'Advanced Analytics',
  description: 'Business intelligence and analytics dashboard'
})

// Reactive data
const isLoading = ref(false)
const activeTab = ref('dashboard')
const selectedDashboard = ref('default')
const selectedTimeframe = ref('30d')
const dashboardFilters = reactive({})

// Tab navigation
const analyticsTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'bar-chart-2' },
  { id: 'insights', label: 'AI Insights', icon: 'lightbulb' },
  { id: 'predictions', label: 'Predictions', icon: 'trending-up' },
  { id: 'segments', label: 'Segments', icon: 'users' },
  { id: 'reports', label: 'Reports', icon: 'file-text' },
  { id: 'models', label: 'ML Models', icon: 'cpu' }
]

// Data
const insights = ref<AnalyticsInsight[]>([])
const predictions = ref<Record<string, any>>({})
const customerSegments = ref<CustomerSegment[]>([])
const reports = ref<ReportData[]>([])
const mlModels = ref<PredictiveModel[]>([])

// Filters
const insightsFilter = ref('all')
const insightsType = ref('all')
const predictionTimeframe = ref('30')

// Modal states
const showReportBuilder = ref(false)
const showSegmentBuilder = ref(false)
const showCreateDashboard = ref(false)
const showModelBuilder = ref(false)

// Report builder
const generatingReport = ref(false)
const reportConfig = reactive({
  title: '',
  type: 'summary',
  startDate: '',
  endDate: '',
  sections: [] as string[],
  format: 'pdf'
})

const availableSections = [
  { id: 'overview', label: 'Executive Overview' },
  { id: 'metrics', label: 'Key Metrics' },
  { id: 'trends', label: 'Trends Analysis' },
  { id: 'segments', label: 'Customer Segments' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'recommendations', label: 'Recommendations' }
]

// Segment builder
const creatingSegment = ref(false)
const segmentConfig = reactive({
  name: '',
  description: '',
  criteria: [{ dimension: 'age', operator: 'greater_than', value: '' }]
})

// Methods
const refreshAllData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      loadInsights(),
      loadPredictions(),
      loadCustomerSegments(),
      loadReports(),
      loadModels()
    ])
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isLoading.value = false
  }
}

const loadInsights = async () => {
  try {
    const params = new URLSearchParams({
      category: insightsFilter.value === 'all' ? '' : insightsFilter.value,
      type: insightsType.value === 'all' ? '' : insightsType.value,
      limit: '20'
    })
    
    const response = await $fetch(`/api/analytics/insights?${params}`)
    insights.value = response
  } catch (error) {
    console.error('Error loading insights:', error)
  }
}

const loadPredictions = async () => {
  try {
    const params = new URLSearchParams({
      predictDays: predictionTimeframe.value
    })
    
    const response = await $fetch(`/api/analytics/predictions?${params}`)
    predictions.value = response
  } catch (error) {
    console.error('Error loading predictions:', error)
  }
}

const loadCustomerSegments = async () => {
  try {
    const response = await $fetch('/api/analytics/segments')
    customerSegments.value = response
  } catch (error) {
    console.error('Error loading customer segments:', error)
  }
}

const loadReports = async () => {
  try {
    const response = await $fetch('/api/analytics/reports')
    reports.value = response
  } catch (error) {
    console.error('Error loading reports:', error)
  }
}

const loadModels = async () => {
  try {
    const response = await $fetch('/api/analytics/models')
    mlModels.value = response
  } catch (error) {
    console.error('Error loading models:', error)
  }
}

const generateReport = async () => {
  generatingReport.value = true
  try {
    const reportData = {
      title: reportConfig.title,
      type: reportConfig.type,
      period: {
        start: new Date(reportConfig.startDate),
        end: new Date(reportConfig.endDate)
      },
      sections: reportConfig.sections,
      format: reportConfig.format,
      includeInsights: true,
      includeRecommendations: true
    }
    
    const response = await $fetch('/api/analytics/reports', {
      method: 'POST',
      body: reportData
    })
    
    // Add to reports list
    reports.value.unshift(response)
    
    showReportBuilder.value = false
    
    // Reset form
    Object.assign(reportConfig, {
      title: '',
      type: 'summary',
      startDate: '',
      endDate: '',
      sections: [],
      format: 'pdf'
    })
    
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    generatingReport.value = false
  }
}

const createSegment = async () => {
  creatingSegment.value = true
  try {
    const response = await $fetch('/api/analytics/segments', {
      method: 'POST',
      body: segmentConfig
    })
    
    // Add to segments list
    customerSegments.value.unshift(response)
    
    showSegmentBuilder.value = false
    
    // Reset form
    Object.assign(segmentConfig, {
      name: '',
      description: '',
      criteria: [{ dimension: 'age', operator: 'greater_than', value: '' }]
    })
    
  } catch (error) {
    console.error('Error creating segment:', error)
  } finally {
    creatingSegment.value = false
  }
}

const addSegmentCriterion = () => {
  segmentConfig.criteria.push({ dimension: 'age', operator: 'greater_than', value: '' })
}

const removeSegmentCriterion = (index: number) => {
  segmentConfig.criteria.splice(index, 1)
}

// Utility functions
const getInsightIcon = (type: string) => {
  const icons = {
    opportunity: 'trending-up',
    warning: 'alert-triangle',
    trend: 'activity',
    anomaly: 'alert-circle',
    recommendation: 'lightbulb'
  }
  return icons[type as keyof typeof icons] || 'lightbulb'
}

const getModelStatusIcon = (status: string) => {
  const icons = {
    training: 'loader',
    trained: 'check-circle',
    deployed: 'play-circle',
    error: 'x-circle'
  }
  return icons[status as keyof typeof icons] || 'circle'
}

const formatPredictionTitle = (key: string) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const formatPredictionValue = (value: number, type: string) => {
  if (type.includes('revenue') || type.includes('value')) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }
  if (type.includes('rate') || type.includes('percent')) {
    return `${(value * 100).toFixed(1)}%`
  }
  return new Intl.NumberFormat('en-US').format(value)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Event handlers
const viewInsightDetails = (insight: AnalyticsInsight) => {
  console.log('View insight details:', insight.id)
}

const applyRecommendations = (insight: AnalyticsInsight) => {
  console.log('Apply recommendations for insight:', insight.id)
}

const viewSegmentDetails = (segment: CustomerSegment) => {
  console.log('View segment details:', segment.id)
}

const targetSegment = (segment: CustomerSegment) => {
  console.log('Target segment:', segment.id)
}

const downloadReport = (report: ReportData) => {
  console.log('Download report:', report.id)
}

const viewReport = (report: ReportData) => {
  console.log('View report:', report.id)
}

const shareReport = (report: ReportData) => {
  console.log('Share report:', report.id)
}

const viewModelDetails = (model: PredictiveModel) => {
  console.log('View model details:', model.id)
}

const deployModel = (model: PredictiveModel) => {
  console.log('Deploy model:', model.id)
}

const retrainModel = (model: PredictiveModel) => {
  console.log('Retrain model:', model.id)
}

// Initialize data
onMounted(() => {
  refreshAllData()
  
  // Set default date range for report
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  reportConfig.startDate = thirtyDaysAgo.toISOString().split('T')[0]!
  reportConfig.endDate = today.toISOString().split('T')[0]!
})
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.page-description {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.analytics-nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0;
}

.tab-navigation {
  display: flex;
  gap: 0;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button:hover {
  color: #374151;
  background: #f9fafb;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.tab-content {
  padding: 2rem 0;
}

.tab-panel {
  min-height: 600px;
}

/* Insights Styles */
.insights-container {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.insights-header h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
}

.insights-filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.insight-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.insight-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
}

.insight-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-opportunity {
  background: #d1fae5;
  color: #065f46;
}

.type-warning {
  background: #fef3c7;
  color: #92400e;
}

.type-trend {
  background: #dbeafe;
  color: #1e40af;
}

.insight-impact {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.impact-high {
  background: #fee2e2;
  color: #991b1b;
}

.impact-medium {
  background: #fef3c7;
  color: #92400e;
}

.impact-low {
  background: #f3f4f6;
  color: #374151;
}

.insight-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.insight-description {
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.insight-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.metric-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.insight-confidence {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.confidence-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.confidence-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.confidence-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.insight-actions {
  display: flex;
  gap: 0.75rem;
}

/* Button Styles */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-warning {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-separator {
  color: #6b7280;
  font-weight: 500;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Modal content styles */
.report-builder,
.segment-builder {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
}

.report-builder h2,
.segment-builder h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .tab-navigation {
    flex-wrap: wrap;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .date-range {
    flex-direction: column;
    align-items: stretch;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }
}

/* Animation classes */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
