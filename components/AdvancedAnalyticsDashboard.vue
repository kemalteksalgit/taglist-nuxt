<template>
  <div class="analytics-dashboard">
    <!-- Dashboard Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">{{ (dashboard && dashboard.name) || 'Business Analytics' }}</h1>
        <p class="dashboard-description">{{ (dashboard && dashboard.description) || 'Comprehensive business intelligence and analytics dashboard' }}</p>
      </div>
      
      <div class="header-actions">
        <div class="date-picker">
          <select v-model="selectedTimeframe" @change="updateTimeframe" class="timeframe-select">
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        <button @click="refreshDashboard" class="refresh-btn" :disabled="isLoading">
          <Icon name="refresh" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </button>
        
        <button @click="showExportModal = true" class="export-btn">
          <Icon name="download" />
          Export
        </button>
        
        <button @click="showSettingsModal = true" class="settings-btn">
          <Icon name="settings" />
          Settings
        </button>
      </div>
    </div>

    <!-- Real-time Alerts -->
    <div v-if="activeAlerts.length > 0" class="alerts-section">
      <div v-for="alert in activeAlerts" :key="alert.id" 
           :class="['alert', `alert-${alert.type}`]">
        <div class="alert-content">
          <Icon :name="getAlertIcon(alert.type)" class="alert-icon" />
          <div class="alert-text">
            <h4>{{ alert.title }}</h4>
            <p>{{ alert.message }}</p>
          </div>
        </div>
        <button @click="acknowledgeAlert(alert.id)" class="alert-dismiss">
          <Icon name="x" />
        </button>
      </div>
    </div>

    <!-- Key Performance Indicators -->
    <div class="kpi-section">
      <div class="kpi-grid">
        <div class="kpi-card" v-for="kpi in keyMetrics" :key="kpi.id">
          <div class="kpi-header">
            <h3>{{ kpi.name }}</h3>
            <Icon :name="kpi.icon || 'bar-chart'" class="kpi-icon" />
          </div>
          <div class="kpi-value">
            <span class="value">{{ formatMetricValue(kpi.value, kpi.format) }}</span>
            <div v-if="kpi.change !== undefined" 
                 :class="['change', kpi.change >= 0 ? 'positive' : 'negative']">
              <Icon :name="kpi.change >= 0 ? 'trending-up' : 'trending-down'" class="trend-icon" />
              <span>{{ Math.abs(kpi.changePercent || 0).toFixed(1) }}%</span>
            </div>
          </div>
          <div class="kpi-trend">
            <MiniChart
              :data="kpi.trendData"
              type="line"
              :color="(kpi.change && kpi.change >= 0) ? '#10b981' : '#ef4444'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Filters -->
    <div v-if="dashboard && dashboard.filters && dashboard.filters.length > 0" class="filters-section">
      <div class="filters-container">
        <div v-for="filter in dashboard.filters" :key="filter.id" class="filter-item">
          <label :for="filter.id" class="filter-label">{{ filter.name }}</label>
          
          <!-- Single Select Filter -->
          <select v-if="filter.type === 'single_select'" 
                  :id="filter.id" 
                  v-model="filterValues[filter.id]"
                  @change="applyFilters"
                  class="filter-select">
            <option v-for="option in filter.options" 
                    :key="option.value" 
                    :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <!-- Multi Select Filter -->
          <div v-else-if="filter.type === 'multi_select'" class="multi-select">
            <button @click="toggleMultiSelect(filter.id)" class="multi-select-trigger">
              {{ getMultiSelectLabel(filter) }}
              <Icon name="chevron-down" />
            </button>
            <div v-if="openMultiSelects.includes(filter.id)" class="multi-select-dropdown">
              <label v-for="option in filter.options" :key="option.value" class="checkbox-label">
                <input type="checkbox" 
                       :value="option.value"
                       v-model="filterValues[filter.id]"
                       @change="applyFilters" />
                {{ option.label }}
              </label>
            </div>
          </div>

          <!-- Date Range Filter -->
          <div v-else-if="filter.type === 'date_range'" class="date-range-filter">
            <input type="date" 
                   v-model="filterValues[filter.id + '_start']"
                   @change="applyFilters"
                   class="date-input" />
            <span class="date-separator">to</span>
            <input type="date" 
                   v-model="filterValues[filter.id + '_end']"
                   @change="applyFilters"
                   class="date-input" />
          </div>

          <!-- Text Filter -->
          <input v-else-if="filter.type === 'text'"
                 type="text"
                 :id="filter.id"
                 v-model="filterValues[filter.id]"
                 @input="debounceFilter"
                 :placeholder="`Filter by ${filter.name.toLowerCase()}`"
                 class="filter-input" />
        </div>
      </div>
    </div>

    <!-- Dashboard Widgets Grid -->
    <div class="widgets-grid" :class="(dashboard && dashboard.layout) || 'grid'">
      <div v-for="widget in visibleWidgets" 
           :key="widget.id" 
           :class="['widget-container', getWidgetClasses(widget)]"
           :style="getWidgetStyle(widget)">
        
        <!-- Widget Header -->
        <div class="widget-header">
          <h3 class="widget-title">{{ widget.title }}</h3>
          <div class="widget-actions">
            <button @click="refreshWidget(widget.id)" 
                    class="widget-action-btn"
                    :disabled="widgetLoading[widget.id]">
              <Icon name="refresh" :class="{ 'animate-spin': widgetLoading[widget.id] }" />
            </button>
            <button @click="showWidgetMenu(widget.id)" class="widget-action-btn">
              <Icon name="more-vertical" />
            </button>
          </div>
        </div>

        <!-- Widget Content -->
        <div class="widget-content">
          <template v-if="widgetLoading[widget.id]">
            <!-- Loading State -->
            <div class="widget-loading">
              <div class="loading-spinner"></div>
              <p>Loading data...</p>
            </div>
          </template>

          <template v-else-if="widgetErrors[widget.id]">
            <!-- Error State -->
            <div class="widget-error">
              <Icon name="alert-circle" class="error-icon" />
              <p>{{ widgetErrors[widget.id] }}</p>
              <button @click="refreshWidget(widget.id)" class="retry-btn">Retry</button>
            </div>
          </template>

          <template v-else-if="widget.type === 'metric_card'">
            <!-- Metric Card Widget -->
            <div class="metric-widget">
              <div class="metric-primary">
                <span class="metric-value">{{ formatMetricValue((widgetData[widget.id] && widgetData[widget.id].value) || 0, widget.config?.format) }}</span>
                <span v-if="widgetData[widget.id] && widgetData[widget.id].unit" class="metric-unit">{{ widgetData[widget.id].unit }}</span>
              </div>
              <div v-if="widgetData[widget.id] && widgetData[widget.id].change !== undefined" class="metric-change">
                <Icon :name="widgetData[widget.id].change >= 0 ? 'trending-up' : 'trending-down'" 
                      :class="['trend-icon', widgetData[widget.id].change >= 0 ? 'positive' : 'negative']" />
                <span :class="widgetData[widget.id].change >= 0 ? 'positive' : 'negative'">
                  {{ Math.abs((widgetData[widget.id] && widgetData[widget.id].changePercent) || 0).toFixed(1) }}%
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="isChartWidget(widget.type)">
            <!-- Chart Widgets -->
            <div class="chart-widget">
              <AdvancedChart 
                :type="widget.type"
                :data="widgetData[widget.id]"
                :config="widget.config"
                :style="widget.style"
                @dataPointClick="handleChartClick"
                @chartInteraction="handleChartInteraction" />
            </div>
          </template>

          <template v-else-if="widget.type === 'table'">
            <!-- Table Widget -->
            <div class="table-widget">
              <AdvancedTable 
                :data="widgetData[widget.id]"
                :columns="widget.config.columns"
                :sortable="widget.config.sortable"
                :filterable="widget.config.filterable"
                :pagination="widget.config.pagination"
                @rowClick="handleTableRowClick"
                @sort="handleTableSort" />
            </div>
          </template>

          <template v-else-if="widget.type === 'map'">
            <!-- Map Widget -->
            <div class="map-widget">
              <AnalyticsMap 
                :data="widgetData[widget.id]"
                :config="widget.config"
                @regionClick="handleMapClick" />
            </div>
          </template>

          <template v-else-if="widget.type === 'funnel'">
            <!-- Funnel Widget -->
            <div class="funnel-widget">
              <FunnelChart 
                :data="widgetData[widget.id]"
                :config="widget.config"
                @stageClick="handleFunnelClick" />
            </div>
          </template>

          <template v-else-if="widget.type === 'gauge'">
            <!-- Gauge Widget -->
            <div class="gauge-widget">
              <GaugeChart 
                :value="(widgetData[widget.id] && widgetData[widget.id].value) || 0"
                :min="widget.config.min || 0"
                :max="widget.config.max || 100"
                :target="widget.config.target"
                :thresholds="widget.config.thresholds" />
            </div>
          </template>

          <template v-else>
            <!-- Default fallback -->
            <div class="widget-placeholder">
              <p>Widget type "{{ widget.type }}" is not supported yet.</p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Insights Panel -->
    <div v-if="insights.length > 0" class="insights-section">
      <h2 class="insights-title">AI-Generated Insights</h2>
      <div class="insights-grid">
        <div v-for="insight in insights.slice(0, 6)" :key="insight.id" class="insight-card">
          <div class="insight-header">
            <div :class="['insight-type', `type-${insight.type}`]">
              <Icon :name="getInsightIcon(insight.type)" />
              {{ insight.type.replace('_', ' ').toUpperCase() }}
            </div>
            <div :class="['insight-importance', `importance-${insight.impact}`]">
              {{ insight.impact.toUpperCase() }}
            </div>
          </div>
          <h3 class="insight-title">{{ insight.title }}</h3>
          <p class="insight-description">{{ insight.description }}</p>
          <div class="insight-metrics">
            <span v-for="metric in insight.metrics" :key="metric" class="insight-metric">
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
          <button @click="showInsightDetails(insight)" class="insight-details-btn">
            View Details
          </button>
        </div>
      </div>
    </div>

    <!-- Real-time Data Feed -->
    <div class="realtime-section">
      <h2 class="realtime-title">Real-time Analytics</h2>
      <div class="realtime-grid">
        <div class="realtime-card">
          <h3>Active Users</h3>
          <div class="realtime-value">{{ realtimeData.activeUsers }}</div>
          <div class="realtime-trend">
            <Icon name="users" class="realtime-icon" />
            <span>{{ realtimeData.currentSessions }} sessions</span>
          </div>
        </div>
        
        <div class="realtime-card">
          <h3>Conversion Rate</h3>
          <div class="realtime-value">{{ (realtimeData.conversionRate * 100).toFixed(2) }}%</div>
          <div class="realtime-trend">
            <Icon name="target" class="realtime-icon" />
            <span>Live tracking</span>
          </div>
        </div>
        
        <div class="realtime-card">
          <h3>Average Order Value</h3>
          <div class="realtime-value">${{ realtimeData.averageOrderValue.toFixed(2) }}</div>
          <div class="realtime-trend">
            <Icon name="dollar-sign" class="realtime-icon" />
            <span>Current period</span>
          </div>
        </div>
        
        <div class="realtime-card">
          <h3>Top Products</h3>
          <div class="top-products-list">
            <div v-for="product in realtimeData.topProducts.slice(0, 3)" 
                 :key="product.id" 
                 class="top-product-item">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-sales">{{ product.sales }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <Modal v-if="showExportModal" @close="showExportModal = false">
      <div class="export-modal">
        <h2>Export Dashboard</h2>
        <div class="export-options">
          <label class="export-option">
            <input type="radio" v-model="exportFormat" value="pdf" />
            <span>PDF Report</span>
          </label>
          <label class="export-option">
            <input type="radio" v-model="exportFormat" value="excel" />
            <span>Excel Workbook</span>
          </label>
          <label class="export-option">
            <input type="radio" v-model="exportFormat" value="csv" />
            <span>CSV Data</span>
          </label>
          <label class="export-option">
            <input type="radio" v-model="exportFormat" value="json" />
            <span>JSON Data</span>
          </label>
        </div>
        
        <div class="export-settings">
          <label class="setting-item">
            <input type="checkbox" v-model="exportSettings.includeCharts" />
            <span>Include Charts</span>
          </label>
          <label class="setting-item">
            <input type="checkbox" v-model="exportSettings.includeInsights" />
            <span>Include AI Insights</span>
          </label>
          <label class="setting-item">
            <input type="checkbox" v-model="exportSettings.includeRawData" />
            <span>Include Raw Data</span>
          </label>
        </div>
        
        <div class="export-actions">
          <button @click="showExportModal = false" class="cancel-btn">Cancel</button>
          <button @click="exportDashboard" 
                  :disabled="exporting" 
                  class="export-confirm-btn">
            <Icon v-if="exporting" name="loader" class="animate-spin" />
            {{ exporting ? 'Exporting...' : 'Export' }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Settings Modal -->
    <Modal v-if="showSettingsModal" @close="showSettingsModal = false">
      <div class="settings-modal">
        <h2>Dashboard Settings</h2>
        
        <!-- General Settings -->
        <div class="settings-section">
          <h3>General</h3>
          <div class="setting-item">
            <label for="dashboard-name">Dashboard Name</label>
            <input type="text" 
                   id="dashboard-name" 
                   v-model="dashboardSettings.name" 
                   class="setting-input" />
          </div>
          <div class="setting-item">
            <label for="refresh-interval">Auto Refresh (seconds)</label>
            <select id="refresh-interval" 
                    v-model="dashboardSettings.refreshInterval" 
                    class="setting-select">
              <option value="0">Manual</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
              <option value="900">15 minutes</option>
            </select>
          </div>
        </div>

        <!-- Widget Settings -->
        <div class="settings-section">
          <h3>Widgets</h3>
          <div class="widget-settings-list">
            <div v-for="widget in (dashboard && dashboard.widgets) || []" :key="widget.id" class="widget-setting-item">
              <div class="widget-info">
                <h4>{{ widget.title }}</h4>
                <p>{{ widget.type.replace('_', ' ').toUpperCase() }}</p>
              </div>
              <div class="widget-controls">
                <label class="toggle">
                  <input type="checkbox" 
                         v-model="widgetVisibility[widget.id]"
                         @change="updateWidgetVisibility" />
                  <span class="toggle-slider"></span>
                </label>
                <button @click="editWidget(widget)" class="edit-widget-btn">
                  <Icon name="edit" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Alert Settings -->
        <div class="settings-section">
          <h3>Alerts</h3>
          <div class="alert-settings">
            <label class="setting-item">
              <input type="checkbox" v-model="dashboardSettings.enableAlerts" />
              <span>Enable Real-time Alerts</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" v-model="dashboardSettings.emailAlerts" />
              <span>Email Notifications</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" v-model="dashboardSettings.soundAlerts" />
              <span>Sound Notifications</span>
            </label>
          </div>
        </div>

        <div class="settings-actions">
          <button @click="resetSettings" class="reset-btn">Reset to Default</button>
          <div class="action-group">
            <button @click="showSettingsModal = false" class="cancel-btn">Cancel</button>
            <button @click="saveSettings" class="save-btn">Save Settings</button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Insight Details Modal -->
    <Modal v-if="selectedInsight" @close="selectedInsight = null">
      <div class="insight-details-modal">
        <h2>{{ selectedInsight.title }}</h2>
        <div class="insight-meta">
          <span class="insight-category">{{ selectedInsight.category.toUpperCase() }}</span>
          <span class="insight-importance">{{ selectedInsight.impact.toUpperCase() }} IMPACT</span>
          <span class="insight-confidence">{{ (selectedInsight.confidence * 100).toFixed(0) }}% Confidence</span>
        </div>
        
        <div class="insight-description">
          <p>{{ selectedInsight.description }}</p>
        </div>
        
        <div v-if="selectedInsight.recommendations?.length" class="insight-recommendations">
          <h3>Recommendations</h3>
          <ul>
            <li v-for="recommendation in selectedInsight.recommendations" :key="recommendation">
              {{ recommendation }}
            </li>
          </ul>
        </div>
        
        <div v-if="selectedInsight.evidenceData?.length" class="insight-evidence">
          <h3>Supporting Data</h3>
          <div class="evidence-charts">
            <!-- Evidence visualizations would go here -->
          </div>
        </div>
        
        <div class="insight-actions">
          <button @click="selectedInsight = null" class="close-btn">Close</button>
          <button @click="applyInsightRecommendations" class="apply-btn">Apply Recommendations</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { advancedAnalyticsService } from '~/services/AdvancedAnalyticsService'
import type { 
  DashboardConfig, 
  DashboardWidget, 
  AnalyticsInsight, 
  RealTimeAnalytics,
  MetricData,
  AnalyticsAlert 
} from '~/types/analytics'

// Props
interface Props {
  dashboardId?: string
  config?: DashboardConfig
  timeframe?: string
  filters?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  dashboardId: 'default',
  timeframe: '30d',
  filters: () => ({})
})

// Reactive data
const dashboard = ref<DashboardConfig | null>(null)
const isLoading = ref(false)
const widgetLoading = reactive<Record<string, boolean>>({})
const widgetErrors = reactive<Record<string, string>>({})
const widgetData = reactive<Record<string, any>>({})
const insights = ref<AnalyticsInsight[]>([])
const realtimeData = ref<RealTimeAnalytics>({
  activeUsers: 0,
  currentSessions: 0,
  conversionRate: 0,
  averageOrderValue: 0,
  topProducts: [],
  trafficSources: {},
  userFlow: [],
  alerts: []
})

// UI state
const selectedTimeframe = ref(props.timeframe)
const filterValues = reactive<Record<string, any>>({})
const openMultiSelects = ref<string[]>([])
const activeAlerts = ref<AnalyticsAlert[]>([])
const selectedInsight = ref<AnalyticsInsight | null>(null)

// Modal states
const showExportModal = ref(false)
const showSettingsModal = ref(false)
const exporting = ref(false)

// Export settings
const exportFormat = ref('pdf')
const exportSettings = reactive({
  includeCharts: true,
  includeInsights: true,
  includeRawData: false
})

// Dashboard settings
const dashboardSettings = reactive({
  name: '',
  refreshInterval: 60,
  enableAlerts: true,
  emailAlerts: false,
  soundAlerts: true
})

const widgetVisibility = reactive<Record<string, boolean>>({})

// Auto-refresh
let refreshInterval: NodeJS.Timeout | null = null

// Computed properties
const keyMetrics = computed(() => {
  const metrics: MetricData[] = []
  
  // Add key business metrics
  if (realtimeData.value) {
    metrics.push({
      id: 'active-users',
      name: 'Active Users',
      value: realtimeData.value.activeUsers,
      trend: 'up',
      unit: 'users',
      format: 'number',
      timestamp: new Date(),
      icon: 'users',
      trendData: generateTrendData(),
      change: 12,
      changePercent: 15.3
    })
    
    metrics.push({
      id: 'conversion-rate',
      name: 'Conversion Rate',
      value: realtimeData.value.conversionRate * 100,
      trend: 'up',
      unit: '%',
      format: 'percentage',
      timestamp: new Date(),
      icon: 'target',
      trendData: generateTrendData(),
      change: 2.1,
      changePercent: 8.7
    })
    
    metrics.push({
      id: 'revenue',
      name: 'Revenue',
      value: realtimeData.value.averageOrderValue * realtimeData.value.activeUsers * 0.1,
      trend: 'up',
      unit: '$',
      format: 'currency',
      timestamp: new Date(),
      icon: 'dollar-sign',
      trendData: generateTrendData(),
      change: 1250,
      changePercent: 22.4
    })
    
    metrics.push({
      id: 'avg-order-value',
      name: 'Avg Order Value',
      value: realtimeData.value.averageOrderValue,
      trend: 'down',
      unit: '$',
      format: 'currency',
      timestamp: new Date(),
      icon: 'shopping-cart',
      trendData: generateTrendData(),
      change: -5.2,
      changePercent: -3.1
    })
  }
  
  return metrics
})

const visibleWidgets = computed(() => {
  return dashboard.value?.widgets?.filter(widget => 
    widgetVisibility[widget.id] !== false
  ) || []
})

// Methods
const loadDashboard = async () => {
  try {
    isLoading.value = true
    
    if (props.config) {
      dashboard.value = props.config
    } else {
      // Load dashboard configuration
      dashboard.value = await loadDashboardConfig(props.dashboardId)
    }
    
    // Initialize widget visibility
    dashboard.value?.widgets?.forEach(widget => {
      if (!(widget.id in widgetVisibility)) {
        widgetVisibility[widget.id] = true
      }
    })
    
    // Load dashboard data
    await Promise.all([
      loadWidgetsData(),
      loadInsights(),
      loadRealTimeData()
    ])
    
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

const loadDashboardConfig = async (dashboardId: string): Promise<DashboardConfig> => {
  // Mock dashboard configuration
  return {
    id: dashboardId,
    name: 'Business Analytics Dashboard',
    description: 'Comprehensive view of business performance',
    layout: 'grid',
    widgets: [
      {
        id: 'revenue-chart',
        type: 'line_chart',
        title: 'Revenue Trend',
        position: { x: 0, y: 0, width: 8, height: 4 },
        config: {
          metric: 'revenue',
          timeframe: selectedTimeframe.value,
          granularity: 'day'
        },
        dataSource: {
          type: 'analytics',
          connection: 'main'
        }
      },
      {
        id: 'user-acquisition',
        type: 'bar_chart',
        title: 'User Acquisition by Channel',
        position: { x: 8, y: 0, width: 4, height: 4 },
        config: {
          metric: 'user_acquisition',
          timeframe: selectedTimeframe.value
        },
        dataSource: {
          type: 'analytics',
          connection: 'main'
        }
      },
      {
        id: 'conversion-funnel',
        type: 'funnel',
        title: 'Conversion Funnel',
        position: { x: 0, y: 4, width: 6, height: 4 },
        config: {
          metric: 'conversion_funnel',
          timeframe: selectedTimeframe.value
        },
        dataSource: {
          type: 'analytics',
          connection: 'main'
        }
      },
      {
        id: 'geographic-sales',
        type: 'map',
        title: 'Sales by Region',
        position: { x: 6, y: 4, width: 6, height: 4 },
        config: {
          metric: 'sales_by_region',
          timeframe: selectedTimeframe.value
        },
        dataSource: {
          type: 'analytics',
          connection: 'main'
        }
      }
    ],
    filters: [
      {
        id: 'channel',
        name: 'Marketing Channel',
        type: 'multi_select',
        dimension: 'channel',
        options: [
          { label: 'Organic Search', value: 'organic' },
          { label: 'Paid Search', value: 'paid_search' },
          { label: 'Social Media', value: 'social' },
          { label: 'Email', value: 'email' },
          { label: 'Direct', value: 'direct' }
        ],
        defaultValue: [],
        required: false,
        position: 'top'
      },
      {
        id: 'product_category',
        name: 'Product Category',
        type: 'single_select',
        dimension: 'category',
        options: [
          { label: 'All Categories', value: 'all' },
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Books', value: 'books' },
          { label: 'Home & Garden', value: 'home_garden' }
        ],
        defaultValue: 'all',
        required: false,
        position: 'top'
      }
    ],
    refreshInterval: 30000,
    sharing: {
      public: false,
      allowedUsers: [],
      allowedRoles: ['admin', 'analyst']
    },
    permissions: {
      owner: 'current_user',
      editors: [],
      viewers: [],
      publicAccess: 'none'
    },
    createdAt: new Date(),
    lastUpdated: new Date(),
    createdBy: 'current_user',
    tags: ['business', 'analytics', 'dashboard']
  }
}

const loadWidgetsData = async () => {
  if (!dashboard.value?.widgets) return
  
  for (const widget of dashboard.value.widgets) {
    try {
      widgetLoading[widget.id] = true
      widgetErrors[widget.id] = ''
      
      const data = await loadWidgetData(widget)
      widgetData[widget.id] = data
      
    } catch (error) {
      console.error(`Error loading widget ${widget.id}:`, error)
      widgetErrors[widget.id] = 'Failed to load data'
    } finally {
      widgetLoading[widget.id] = false
    }
  }
}

const loadWidgetData = async (widget: DashboardWidget) => {
  // Mock data generation based on widget type
  switch (widget.type) {
    case 'line_chart':
      return generateTimeSeriesData(30)
    case 'bar_chart':
      return generateBarChartData()
    case 'pie_chart':
      return generatePieChartData()
    case 'funnel':
      return generateFunnelData()
    case 'table':
      return generateTableData()
    case 'map':
      return generateMapData()
    case 'metric_card':
      return generateMetricData()
    default:
      return null
  }
}

const loadInsights = async () => {
  try {
    const period = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
    
    insights.value = await advancedAnalyticsService.generateInsights(period)
  } catch (error) {
    console.error('Error loading insights:', error)
    insights.value = []
  }
}

const loadRealTimeData = async () => {
  try {
    realtimeData.value = advancedAnalyticsService.getRealTimeAnalytics()
    activeAlerts.value = realtimeData.value.alerts || []
  } catch (error) {
    console.error('Error loading real-time data:', error)
  }
}

const refreshDashboard = async () => {
  await loadDashboard()
}

const refreshWidget = async (widgetId: string) => {
  const widget = dashboard.value?.widgets?.find(w => w.id === widgetId)
  if (!widget) return
  
  try {
    widgetLoading[widgetId] = true
    widgetErrors[widgetId] = ''
    
    const data = await loadWidgetData(widget)
    widgetData[widgetId] = data
    
  } catch (error) {
    console.error(`Error refreshing widget ${widgetId}:`, error)
    widgetErrors[widgetId] = 'Failed to refresh data'
  } finally {
    widgetLoading[widgetId] = false
  }
}

const updateTimeframe = async () => {
  await loadWidgetsData()
  await loadInsights()
}

const applyFilters = async () => {
  // Apply filters and reload data
  await loadWidgetsData()
}

const debounceFilter = debounce(applyFilters, 500)

const formatMetricValue = (value: number, format?: string) => {
  if (typeof value !== 'number' || isNaN(value)) return '0'
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
      return new Intl.NumberFormat('en-US').format(value)
    default:
      return value.toString()
  }
}

const exportDashboard = async () => {
  try {
    exporting.value = true
    
    const reportConfig = {
      type: 'summary' as const,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      sections: ['overview', 'metrics', 'charts'],
      includeInsights: exportSettings.includeInsights,
      includeRecommendations: true,
      format: exportFormat.value as 'json' | 'pdf' | 'excel'
    }
    
    const report = await advancedAnalyticsService.generateReport(reportConfig)
    
    // Trigger download
    downloadReport(report, exportFormat.value)
    
    showExportModal.value = false
  } catch (error) {
    console.error('Error exporting dashboard:', error)
  } finally {
    exporting.value = false
  }
}

const downloadReport = (report: any, format: string) => {
  // Mock download functionality
  const blob = new Blob([JSON.stringify(report, null, 2)], { 
    type: 'application/json' 
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dashboard-report.${format}`
  a.click()
  URL.revokeObjectURL(url)
}

const acknowledgeAlert = (alertId: string) => {
  const index = activeAlerts.value.findIndex((alert: AnalyticsAlert) => alert.id === alertId)
  if (index > -1) {
    activeAlerts.value.splice(index, 1)
  }
}

const showInsightDetails = (insight: AnalyticsInsight) => {
  selectedInsight.value = insight
}

const applyInsightRecommendations = () => {
  // Implement recommendation application logic
  console.log('Applying recommendations for insight:', selectedInsight.value?.id)
  selectedInsight.value = null
}

// Widget interaction handlers
const handleChartClick = (data: any) => {
  console.log('Chart clicked:', data)
}

const handleChartInteraction = (interaction: any) => {
  console.log('Chart interaction:', interaction)
}

const handleTableRowClick = (row: any) => {
  console.log('Table row clicked:', row)
}

const handleTableSort = (column: string, direction: 'asc' | 'desc') => {
  console.log('Table sorted:', column, direction)
}

const handleMapClick = (region: any) => {
  console.log('Map region clicked:', region)
}

const handleFunnelClick = (stage: any) => {
  console.log('Funnel stage clicked:', stage)
}

// Utility functions
const generateTrendData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    x: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
    y: Math.random() * 100 + 50
  }))
}

const generateTimeSeriesData = (days: number) => {
  return {
    series: [{
      name: 'Revenue',
      data: Array.from({ length: days }, (_, i) => ({
        x: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000),
        y: Math.random() * 10000 + 5000
      }))
    }]
  }
}

const generateBarChartData = () => {
  return {
    series: [{
      name: 'Users',
      data: [
        { x: 'Organic', y: Math.floor(Math.random() * 1000) + 500 },
        { x: 'Paid Search', y: Math.floor(Math.random() * 800) + 300 },
        { x: 'Social', y: Math.floor(Math.random() * 600) + 200 },
        { x: 'Email', y: Math.floor(Math.random() * 400) + 100 },
        { x: 'Direct', y: Math.floor(Math.random() * 300) + 150 }
      ]
    }]
  }
}

const generatePieChartData = () => {
  return {
    series: [35, 25, 20, 12, 8],
    labels: ['Desktop', 'Mobile', 'Tablet', 'Smart TV', 'Other']
  }
}

const generateFunnelData = () => {
  return {
    stages: [
      { name: 'Visitors', value: 10000, rate: 100 },
      { name: 'Product Views', value: 5000, rate: 50 },
      { name: 'Add to Cart', value: 1500, rate: 15 },
      { name: 'Checkout', value: 800, rate: 8 },
      { name: 'Purchase', value: 600, rate: 6 }
    ]
  }
}

const generateTableData = () => {
  return {
    columns: ['Product', 'Sales', 'Revenue', 'Growth'],
    rows: Array.from({ length: 10 }, (_, i) => ({
      product: `Product ${i + 1}`,
      sales: Math.floor(Math.random() * 1000) + 100,
      revenue: Math.floor(Math.random() * 50000) + 10000,
      growth: (Math.random() * 40 - 20).toFixed(1) + '%'
    }))
  }
}

const generateMapData = () => {
  return {
    regions: [
      { code: 'US', name: 'United States', value: 45000, color: '#10b981' },
      { code: 'CA', name: 'Canada', value: 12000, color: '#3b82f6' },
      { code: 'GB', name: 'United Kingdom', value: 25000, color: '#8b5cf6' },
      { code: 'DE', name: 'Germany', value: 18000, color: '#f59e0b' },
      { code: 'FR', name: 'France', value: 15000, color: '#ef4444' }
    ]
  }
}

const generateMetricData = () => {
  return {
    value: Math.floor(Math.random() * 10000) + 1000,
    change: Math.random() * 20 - 10,
    changePercent: Math.random() * 30 - 15,
    unit: '$'
  }
}

// Helper functions
const isChartWidget = (type: string) => {
  return ['line_chart', 'bar_chart', 'pie_chart', 'area_chart', 'scatter'].includes(type)
}

const getWidgetClasses = (widget: DashboardWidget) => {
  return [`widget-${widget.type}`, `widget-size-${widget.position.width}x${widget.position.height}`]
}

const getWidgetStyle = (widget: DashboardWidget) => {
  if (dashboard.value?.layout === 'grid') {
    return {
      gridColumn: `span ${widget.position.width}`,
      gridRow: `span ${widget.position.height}`
    }
  }
  return {
    left: `${widget.position.x}px`,
    top: `${widget.position.y}px`,
    width: `${widget.position.width}px`,
    height: `${widget.position.height}px`
  }
}

const getAlertIcon = (type: string) => {
  const icons = {
    info: 'info',
    warning: 'alert-triangle',
    critical: 'alert-circle'
  }
  return icons[type as keyof typeof icons] || 'info'
}

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

const toggleMultiSelect = (filterId: string) => {
  const index = openMultiSelects.value.indexOf(filterId)
  if (index > -1) {
    openMultiSelects.value.splice(index, 1)
  } else {
    openMultiSelects.value.push(filterId)
  }
}

const getMultiSelectLabel = (filter: any) => {
  const selected = filterValues[filter.id] || []
  if (selected.length === 0) return 'Select options'
  if (selected.length === 1) return filter.options?.find((opt: any) => opt.value === selected[0])?.label
  return `${selected.length} options selected`
}

// Additional missing methods
const showWidgetMenu = (widgetId: string) => {
  console.log('Show widget menu for:', widgetId)
}

const updateWidgetVisibility = () => {
  // Update widget visibility and refresh layout
  console.log('Widget visibility updated')
}

const editWidget = (widget: DashboardWidget) => {
  console.log('Edit widget:', widget.id)
}

const saveSettings = () => {
  console.log('Save dashboard settings')
  showSettingsModal.value = false
}

const resetSettings = () => {
  console.log('Reset dashboard settings to default')
}

// Utility function for debouncing
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Setup auto-refresh
const setupAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  if (dashboardSettings.refreshInterval > 0) {
    refreshInterval = setInterval(() => {
      loadRealTimeData()
    }, dashboardSettings.refreshInterval * 1000)
  }
}

// Lifecycle hooks
onMounted(async () => {
  await loadDashboard()
  setupAutoRefresh()
  
  // Set up real-time updates
  advancedAnalyticsService.on('realTimeUpdate', (data: RealTimeAnalytics) => {
    realtimeData.value = data
  })
  
  advancedAnalyticsService.on('alertTriggered', (alert: AnalyticsAlert) => {
    activeAlerts.value.push(alert)
  })
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Watch for timeframe changes
watch(selectedTimeframe, updateTimeframe)

// Watch for refresh interval changes
watch(() => dashboardSettings.refreshInterval, setupAutoRefresh)
</script>

<style lang="postcss" scoped>
.analytics-dashboard {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.dashboard-header {
  @apply bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4;
  @apply flex items-center justify-between;
}

.header-content h1 {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.header-content p {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1;
}

.header-actions {
  @apply flex items-center space-x-4;
}

.timeframe-select,
.refresh-btn,
.export-btn,
.settings-btn {
  @apply px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600;
  @apply bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300;
  @apply hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors;
  @apply flex items-center space-x-2;
}

.alerts-section {
  @apply px-6 py-4 space-y-2;
}

.alert {
  @apply flex items-center justify-between p-4 rounded-lg;
}

.alert-warning {
  @apply bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800;
}

.alert-critical {
  @apply bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800;
}

.alert-info {
  @apply bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800;
}

.kpi-section {
  @apply px-6 py-4;
}

.kpi-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.kpi-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.kpi-header {
  @apply flex items-center justify-between mb-4;
}

.kpi-header h3 {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400;
}

.kpi-value {
  @apply flex items-center justify-between mb-2;
}

.kpi-value .value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.change.positive {
  @apply text-green-600 dark:text-green-400;
}

.change.negative {
  @apply text-red-600 dark:text-red-400;
}

.filters-section {
  @apply px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
}

.filters-container {
  @apply flex flex-wrap items-center gap-4;
}

.filter-item {
  @apply flex flex-col space-y-1;
}

.filter-label {
  @apply text-xs font-medium text-gray-600 dark:text-gray-400;
}

.filter-select,
.filter-input {
  @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md;
  @apply bg-white dark:bg-gray-700 text-gray-900 dark:text-white;
  @apply focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.widgets-grid {
  @apply p-6 grid gap-6;
  grid-template-columns: repeat(12, 1fr);
}

.widget-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
  @apply flex flex-col overflow-hidden;
}

.widget-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.widget-actions {
  @apply flex items-center space-x-2;
}

.widget-action-btn {
  @apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
  @apply text-gray-600 dark:text-gray-400;
}

.widget-content {
  @apply flex-1 p-4;
}

.widget-loading,
.widget-error {
  @apply flex flex-col items-center justify-center h-full min-h-[200px];
  @apply text-gray-500 dark:text-gray-400;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4;
}

.insights-section {
  @apply px-6 py-8;
}

.insights-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-6;
}

.insights-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.insight-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.insight-header {
  @apply flex items-center justify-between mb-3;
}

.insight-type {
  @apply px-2 py-1 rounded-full text-xs font-medium uppercase;
}

.type-opportunity {
  @apply bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400;
}

.type-warning {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400;
}

.type-trend {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400;
}

.realtime-section {
  @apply px-6 py-8 bg-gray-50 dark:bg-gray-900/50;
}

.realtime-title {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-6;
}

.realtime-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.realtime-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

.realtime-card h3 {
  @apply text-sm font-medium text-gray-600 dark:text-gray-400 mb-2;
}

.realtime-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.realtime-trend {
  @apply flex items-center text-sm text-gray-600 dark:text-gray-400;
}

.realtime-icon {
  @apply w-4 h-4 mr-2;
}

/* Modal styles */
.export-modal,
.settings-modal,
.insight-details-modal {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6;
}

.export-modal h2,
.settings-modal h2,
.insight-details-modal h2 {
  @apply text-xl font-bold text-gray-900 dark:text-white mb-6;
}

.export-options,
.alert-settings {
  @apply space-y-3 mb-6;
}

.export-option,
.setting-item {
  @apply flex items-center space-x-3;
}

.export-actions,
.settings-actions,
.insight-actions {
  @apply flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700;
}

.cancel-btn,
.close-btn {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md;
  @apply text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700;
}

.export-confirm-btn,
.save-btn,
.apply-btn {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-header {
    @apply flex-col items-start space-y-4;
  }
  
  .header-actions {
    @apply w-full justify-between;
  }
  
  .kpi-grid {
    @apply grid-cols-1;
  }
  
  .widgets-grid {
    @apply grid-cols-1;
  }
  
  .insights-grid {
    @apply grid-cols-1;
  }
  
  .realtime-grid {
    @apply grid-cols-1;
  }
}

/* Animation for real-time updates */
@keyframes pulse-update {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.realtime-card:hover {
  animation: pulse-update 2s infinite;
}

/* Chart container styling */
.chart-widget,
.metric-widget,
.table-widget,
.map-widget,
.funnel-widget,
.gauge-widget {
  @apply h-full min-h-[300px];
}

/* Loading states */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
