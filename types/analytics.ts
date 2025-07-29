/**
 * Advanced Analytics & Business Intelligence Type Definitions
 * Comprehensive type system for data analytics, business intelligence, and predictive modeling
 */

export interface AnalyticsConfig {
  id: string
  name: string
  dataRetentionDays: number
  samplingRate: number
  realTimeEnabled: boolean
  trackingEnabled: boolean
  privacySettings: PrivacySettings
  integrations: AnalyticsIntegration[]
  customDimensions: CustomDimension[]
  goals: AnalyticsGoal[]
}

export interface PrivacySettings {
  anonymizeIPs: boolean
  respectDoNotTrack: boolean
  cookieConsentRequired: boolean
  dataProcessingConsent: boolean
  retentionPeriod: number
  excludeInternalTraffic: boolean
}

export interface AnalyticsIntegration {
  id: string
  name: string
  type: 'google_analytics' | 'mixpanel' | 'amplitude' | 'custom'
  apiKey: string
  configuration: Record<string, any>
  enabled: boolean
}

export interface CustomDimension {
  id: string
  name: string
  scope: 'hit' | 'session' | 'user' | 'product'
  type: 'text' | 'number' | 'boolean' | 'date'
  required: boolean
  defaultValue?: any
}

export interface AnalyticsGoal {
  id: string
  name: string
  type: 'destination' | 'duration' | 'pages_per_session' | 'event' | 'revenue'
  conditions: GoalCondition[]
  value?: number
  active: boolean
}

export interface GoalCondition {
  dimension: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex'
  value: string | number
  caseSensitive?: boolean
}

export interface MetricData {
  id: string
  name: string
  value: number
  previousValue?: number
  change?: number
  changePercent?: number
  trend: 'up' | 'down' | 'stable'
  unit: string
  format: 'number' | 'currency' | 'percentage' | 'duration'
  timestamp: Date
  metadata?: Record<string, any>
  icon?: string
  trendData?: Array<{ x: Date | string | number; y: number }>
}

export interface BusinessMetrics {
  period: { start: Date; end: Date }
  sales: SalesAnalytics
  users: UserBehaviorAnalytics
  products: ProductAnalytics
  marketing: MarketingAnalytics
  performance: PerformanceMetrics
  predictions: Record<string, any>
  insights: AnalyticsInsight[]
  generatedAt: Date
}

export interface SalesAnalytics {
  totalRevenue: number
  revenueGrowth: number
  averageOrderValue: number
  conversionRate: number
  refundRate: number
  grossMargin: number
  netProfit: number
  salesByChannel: Record<string, number>
  salesByProduct: ProductSales[]
  salesByRegion: RegionSales[]
  salesFunnel: SalesFunnelData
  revenueForecasting: RevenueForecasting
}

export interface UserBehaviorAnalytics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  userGrowthRate: number
  sessionDuration: number
  bounceRate: number
  pageViews: number
  sessionsPerUser: number
  userRetention: RetentionData
  userSegments: UserSegment[]
  churnRate: number
  lifetimeValue: number
}

export interface ProductAnalytics {
  totalProducts: number
  topSellingProducts: ProductPerformance[]
  productViews: Record<string, number>
  productConversions: Record<string, number>
  inventoryTurnover: number
  productMargins: Record<string, number>
  categoryPerformance: CategoryPerformance[]
  productRecommendationEffectiveness: number
  crossSellRate: number
  upSellRate: number
}

export interface MarketingAnalytics {
  campaignPerformance: CampaignPerformance[]
  channelAttribution: ChannelAttribution[]
  customerAcquisitionCost: number
  returnOnAdSpend: number
  organicTraffic: number
  paidTraffic: number
  socialMediaMetrics: SocialMediaMetrics
  emailMarketingMetrics: EmailMarketingMetrics
  contentPerformance: ContentPerformance[]
  brandAwareness: BrandAwarenessMetrics
}

export interface PerformanceMetrics {
  pageLoadTime: number
  serverResponseTime: number
  errorRate: number
  uptime: number
  throughput: number
  cacheHitRate: number
  databasePerformance: DatabaseMetrics
  apiPerformance: APIMetrics
  mobilePerformance: MobileMetrics
  coreWebVitals: CoreWebVitals
}

export interface AnalyticsInsight {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'warning' | 'trend' | 'anomaly' | 'recommendation'
  category: 'sales' | 'users' | 'products' | 'marketing' | 'performance' | 'operations'
  importance: number // 0-1
  confidence: number // 0-1
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  metrics: string[]
  recommendations: string[]
  evidenceData: any[]
  generatedAt: Date
  source: 'manual' | 'automated' | 'ml_model'
}

export interface PredictiveModel {
  id: string
  name: string
  description: string
  type: 'regression' | 'classification' | 'clustering' | 'time_series' | 'neural_network'
  algorithm: string
  features: ModelFeature[]
  target: string
  performance: ModelPerformanceMetrics
  status: 'training' | 'trained' | 'deployed' | 'deprecated' | 'error'
  version: string
  createdAt: Date
  lastTrained: Date
  lastEvaluated: Date
  hyperparameters: Record<string, any>
  trainingData: DatasetInfo
  validationData: DatasetInfo
}

export interface ModelFeature {
  name: string
  type: 'numerical' | 'categorical' | 'text' | 'datetime' | 'boolean'
  importance: number
  transformation?: string
  encoding?: string
  missing_strategy?: 'drop' | 'mean' | 'median' | 'mode' | 'constant'
}

export interface ModelPerformanceMetrics {
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  auc?: number
  mse?: number
  mae?: number
  rmse?: number
  rSquared?: number
  confusionMatrix?: number[][]
  rocCurve?: { fpr: number[]; tpr: number[] }
  featureImportance?: Record<string, number>
}

export interface DatasetInfo {
  size: number
  features: number
  startDate: Date
  endDate: Date
  quality: DataQualityMetrics
}

export interface DataQualityMetrics {
  completeness: number
  accuracy: number
  consistency: number
  timeliness: number
  validity: number
  uniqueness: number
}

export interface ReportData {
  id: string
  title: string
  type: 'dashboard' | 'summary' | 'detailed' | 'executive'
  format: 'json' | 'pdf' | 'excel' | 'csv'
  sections: ReportSection[]
  filters: ReportFilter[]
  schedule?: ReportSchedule
  recipients: string[]
  generatedAt: Date
  period: { start: Date; end: Date }
  metadata: Record<string, any>
}

export interface ReportSection {
  id: string
  title: string
  type: 'chart' | 'table' | 'metric' | 'insight' | 'text' | 'image'
  content: any
  visualization?: ChartConfig
  position: { row: number; column: number; span?: number }
  visible: boolean
}

export interface ReportFilter {
  dimension: string
  operator: string
  value: any
  label: string
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string
  timezone: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
}

export interface DashboardConfig {
  id: string
  name: string
  description?: string
  layout: 'grid' | 'flexible' | 'tabs'
  widgets: DashboardWidget[]
  filters: DashboardFilter[]
  refreshInterval: number
  sharing: SharingConfig
  permissions: PermissionConfig
  createdAt: Date
  lastUpdated: Date
  createdBy: string
  tags: string[]
}

export interface DashboardWidget {
  id: string
  type: 'metric_card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table' | 'map' | 'gauge' | 'funnel'
  title: string
  description?: string
  position: WidgetPosition
  config: WidgetConfig
  dataSource: DataSourceConfig
  filters?: WidgetFilter[]
  style?: WidgetStyle
  interactions?: WidgetInteraction[]
}

export interface WidgetPosition {
  x: number
  y: number
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export interface WidgetConfig {
  metric: string
  timeframe: string
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max' | 'median'
  comparison?: 'previous_period' | 'previous_year' | 'baseline'
  target?: number
  thresholds?: Threshold[]
  formatting?: FormattingOptions
  format?: 'number' | 'currency' | 'percentage' | 'duration'
  columns?: any[]
  sortable?: boolean
  filterable?: boolean
  pagination?: any
  min?: number
  max?: number
}

export interface DataSourceConfig {
  type: 'analytics' | 'database' | 'api' | 'file'
  connection: string
  query?: string
  parameters?: Record<string, any>
  cacheDuration?: number
  refreshStrategy?: 'manual' | 'scheduled' | 'real_time'
}

export interface WidgetFilter {
  dimension: string
  operator: string
  value: any
  required: boolean
}

export interface WidgetStyle {
  colors?: string[]
  theme?: 'light' | 'dark' | 'auto'
  fontSize?: number
  fontFamily?: string
  borderRadius?: number
  padding?: number
  backgroundColor?: string
  borderColor?: string
}

export interface WidgetInteraction {
  type: 'click' | 'hover' | 'drill_down' | 'filter'
  action: 'navigate' | 'filter_dashboard' | 'show_tooltip' | 'open_modal'
  target?: string
  parameters?: Record<string, any>
}

export interface Threshold {
  value: number
  color: string
  operator: 'greater_than' | 'less_than' | 'equal_to'
  label?: string
}

export interface FormattingOptions {
  prefix?: string
  suffix?: string
  decimals?: number
  thousandsSeparator?: string
  decimalSeparator?: string
  showAsPercentage?: boolean
  currency?: string
}

export interface DashboardFilter {
  id: string
  name: string
  type: 'date_range' | 'single_select' | 'multi_select' | 'text' | 'number_range'
  dimension: string
  options?: FilterOption[]
  defaultValue?: any
  required: boolean
  position: 'top' | 'sidebar' | 'inline'
}

export interface FilterOption {
  label: string
  value: any
  selected?: boolean
}

export interface SharingConfig {
  public: boolean
  allowedUsers?: string[]
  allowedRoles?: string[]
  shareUrl?: string
  embedUrl?: string
  expiresAt?: Date
}

export interface PermissionConfig {
  owner: string
  editors: string[]
  viewers: string[]
  publicAccess: 'none' | 'view' | 'edit'
}

export interface AlertRule {
  id: string
  name: string
  description?: string
  metric: string
  condition: AlertCondition
  threshold: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
  frequency: 'real_time' | 'hourly' | 'daily'
  notifications: NotificationConfig[]
  cooldown: number
  createdAt: Date
  lastTriggered?: Date
  createdBy: string
  message?: string
}

export interface AlertCondition {
  operator: 'greater_than' | 'less_than' | 'equal_to' | 'change_percent' | 'anomaly'
  timeframe: string
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max'
  comparison?: 'previous_period' | 'baseline' | 'threshold'
}

export interface NotificationConfig {
  type: 'email' | 'sms' | 'slack' | 'webhook' | 'push'
  target: string
  template?: string
  enabled: boolean
}

export interface DataVisualization {
  id: string
  type: ChartType
  title: string
  config: ChartConfig
  data: ChartData
  interactions: ChartInteraction[]
  style: ChartStyle
}

export type ChartType = 
  | 'line' | 'area' | 'bar' | 'column' | 'pie' | 'donut'
  | 'scatter' | 'bubble' | 'heatmap' | 'treemap'
  | 'funnel' | 'waterfall' | 'gauge' | 'radar'
  | 'sankey' | 'network' | 'geographic'

export interface ChartConfig {
  xAxis: AxisConfig
  yAxis: AxisConfig
  legend: LegendConfig
  tooltip: TooltipConfig
  zoom: ZoomConfig
  animation: AnimationConfig
  responsive: boolean
}

export interface AxisConfig {
  title: string
  type: 'category' | 'value' | 'time' | 'log'
  min?: number
  max?: number
  format?: string
  gridLines: boolean
  labels: LabelConfig
}

export interface LabelConfig {
  show: boolean
  rotation?: number
  format?: string
  color?: string
  fontSize?: number
}

export interface LegendConfig {
  show: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  align: 'start' | 'center' | 'end'
  orientation: 'horizontal' | 'vertical'
}

export interface TooltipConfig {
  show: boolean
  format?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
}

export interface ZoomConfig {
  enabled: boolean
  type: 'x' | 'y' | 'xy'
  rangeSelector: boolean
}

export interface AnimationConfig {
  enabled: boolean
  duration: number
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface ChartData {
  series: DataSeries[]
  categories?: string[]
  metadata?: Record<string, any>
}

export interface DataSeries {
  name: string
  data: DataPoint[]
  color?: string
  type?: ChartType
  yAxis?: number
  visible?: boolean
}

export interface DataPoint {
  x: string | number | Date
  y: number
  label?: string
  color?: string
  metadata?: Record<string, any>
}

export interface ChartInteraction {
  type: 'click' | 'hover' | 'selection'
  handler: string
  parameters?: Record<string, any>
}

export interface ChartStyle {
  colors: string[]
  backgroundColor?: string
  borderColor?: string
  fontSize?: number
  fontFamily?: string
  width?: number
  height?: number
}

export interface MarketTrends {
  industry: IndustryTrend[]
  competitors: CompetitorTrend[]
  keywords: KeywordTrend[]
  sentiment: SentimentTrend
  forecasts: TrendForecast[]
  generatedAt: Date
}

export interface IndustryTrend {
  category: string
  growth: number
  volume: number
  trend: 'rising' | 'falling' | 'stable'
  confidence: number
  timeframe: string
}

export interface CompetitorTrend {
  name: string
  marketShare: number
  growth: number
  sentiment: number
  visibility: number
  strengths: string[]
  weaknesses: string[]
}

export interface KeywordTrend {
  keyword: string
  volume: number
  difficulty: number
  trend: 'rising' | 'falling' | 'stable'
  opportunity: number
  position?: number
}

export interface SentimentTrend {
  overall: number
  positive: number
  negative: number
  neutral: number
  sources: SentimentSource[]
}

export interface SentimentSource {
  source: string
  sentiment: number
  volume: number
  influence: number
}

export interface TrendForecast {
  metric: string
  prediction: number
  confidence: number
  timeframe: string
  factors: string[]
}

export interface CustomerSegment {
  id: string
  name: string
  description: string
  size: number
  characteristics: SegmentCharacteristic[]
  behavior: SegmentBehavior
  value: SegmentValue
  trends: SegmentTrend[]
  recommendations: string[]
}

export interface SegmentCharacteristic {
  dimension: string
  value: any
  weight: number
  significance: number
}

export interface SegmentBehavior {
  averageOrderValue: number
  frequency: number
  recency: number
  channels: Record<string, number>
  products: Record<string, number>
  lifecycle: string
}

export interface SegmentValue {
  lifetime: number
  current: number
  potential: number
  risk: number
  opportunity: number
}

export interface SegmentTrend {
  metric: string
  direction: 'up' | 'down' | 'stable'
  rate: number
  timeframe: string
}

export interface RevenueForecasting {
  models: ForecastModel[]
  predictions: RevenuePrediction[]
  scenarios: ForecastScenario[]
  accuracy: ForecastAccuracy
  confidence: number
  generatedAt: Date
}

export interface ForecastModel {
  name: string
  type: 'linear' | 'exponential' | 'seasonal' | 'arima' | 'neural_network'
  accuracy: number
  features: string[]
  weight: number
}

export interface RevenuePrediction {
  period: string
  value: number
  range: { min: number; max: number }
  confidence: number
  factors: PredictionFactor[]
}

export interface PredictionFactor {
  name: string
  impact: number
  direction: 'positive' | 'negative'
  confidence: number
}

export interface ForecastScenario {
  name: string
  description: string
  probability: number
  impact: number
  predictions: Record<string, number>
}

export interface ForecastAccuracy {
  mape: number // Mean Absolute Percentage Error
  rmse: number // Root Mean Square Error
  mae: number  // Mean Absolute Error
  r2: number   // R-squared
}

export interface CompetitiveAnalysis {
  competitors: CompetitorProfile[]
  marketPosition: MarketPosition
  opportunities: MarketOpportunity[]
  threats: MarketThreat[]
  recommendations: CompetitiveRecommendation[]
  generatedAt: Date
  period: { start: Date; end: Date }
}

export interface CompetitorProfile {
  name: string
  marketShare: number
  revenue: number
  growth: number
  strengths: string[]
  weaknesses: string[]
  strategies: string[]
  products: CompetitorProduct[]
  pricing: PricingStrategy
  marketing: MarketingStrategy
  sentiment: number
}

export interface CompetitorProduct {
  name: string
  category: string
  price: number
  features: string[]
  rating: number
  marketShare: number
}

export interface PricingStrategy {
  model: 'premium' | 'competitive' | 'value' | 'penetration'
  averagePrice: number
  discounting: number
  bundling: boolean
}

export interface MarketingStrategy {
  channels: Record<string, number>
  budget: number
  reach: number
  engagement: number
  conversion: number
}

export interface MarketPosition {
  rank: number
  marketShare: number
  brandStrength: number
  competitiveAdvantage: string[]
  differentiators: string[]
  threats: string[]
}

export interface MarketOpportunity {
  area: string
  size: number
  difficulty: number
  timeframe: string
  requirements: string[]
  expectedROI: number
}

export interface MarketThreat {
  source: string
  impact: number
  probability: number
  timeframe: string
  mitigation: string[]
}

export interface CompetitiveRecommendation {
  category: string
  action: string
  priority: number
  impact: number
  effort: number
  timeframe: string
  requirements: string[]
}

// Additional supporting types
export interface ProductSales {
  id: string
  name: string
  category: string
  units: number
  revenue: number
  margin: number
  growth: number
}

export interface RegionSales {
  region: string
  revenue: number
  units: number
  growth: number
  marketShare: number
}

export interface SalesFunnelData {
  stages: FunnelStage[]
  conversionRates: number[]
  dropOffPoints: DropOffPoint[]
}

export interface FunnelStage {
  name: string
  users: number
  conversions: number
  rate: number
}

export interface DropOffPoint {
  stage: string
  dropOffRate: number
  reasons: string[]
  recommendations: string[]
}

export interface RetentionData {
  cohorts: RetentionCohort[]
  overall: number
  bySegment: Record<string, number>
  trends: RetentionTrend[]
}

export interface RetentionCohort {
  period: string
  users: number
  retained: number[]
  rates: number[]
}

export interface RetentionTrend {
  period: string
  rate: number
  change: number
}

export interface UserSegment {
  id: string
  name: string
  size: number
  characteristics: Record<string, any>
  behavior: UserSegmentBehavior
  value: number
}

export interface UserSegmentBehavior {
  sessionDuration: number
  pageViews: number
  conversionRate: number
  churnRate: number
  lifetimeValue: number
}

export interface ProductPerformance {
  id: string
  name: string
  views: number
  sales: number
  revenue: number
  margin: number
  rating: number
  reviews: number
}

export interface CategoryPerformance {
  name: string
  products: number
  sales: number
  revenue: number
  growth: number
  margin: number
}

export interface CampaignPerformance {
  id: string
  name: string
  type: string
  channel: string
  impressions: number
  clicks: number
  conversions: number
  cost: number
  revenue: number
  roi: number
}

export interface ChannelAttribution {
  channel: string
  firstClick: number
  lastClick: number
  linear: number
  timeDecay: number
  positionBased: number
}

export interface SocialMediaMetrics {
  followers: number
  engagement: number
  reach: number
  impressions: number
  clicks: number
  shares: number
  mentions: number
  sentiment: number
}

export interface EmailMarketingMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  conversions: number
  revenue: number
}

export interface ContentPerformance {
  id: string
  title: string
  type: string
  views: number
  engagement: number
  shares: number
  conversions: number
  timeOnPage: number
}

export interface BrandAwarenessMetrics {
  unaided: number
  aided: number
  consideration: number
  preference: number
  loyalty: number
  netPromoterScore: number
}

export interface DatabaseMetrics {
  queryTime: number
  connectionCount: number
  lockWaits: number
  deadlocks: number
  cacheHitRate: number
  diskUsage: number
}

export interface APIMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  availability: number
  latency: LatencyMetrics
}

export interface LatencyMetrics {
  p50: number
  p90: number
  p95: number
  p99: number
}

export interface MobileMetrics {
  crashRate: number
  appStartTime: number
  batteryUsage: number
  memoryUsage: number
  networkUsage: number
}

export interface CoreWebVitals {
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  firstContentfulPaint: number
  timeToInteractive: number
}

export interface RealTimeAnalytics {
  activeUsers: number
  currentSessions: number
  conversionRate: number
  averageOrderValue: number
  topProducts: Array<{ id: string; name: string; sales: number }>
  trafficSources: Record<string, number>
  userFlow: UserFlowData[]
  alerts: AnalyticsAlert[]
}

export interface UserFlowData {
  step: string
  users: number
  dropOffRate: number
  averageTime: number
  conversionRate: number
}

export interface AnalyticsAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  title: string
  message: string
  timestamp: Date
  metric: string
  threshold: number
  currentValue: number
  acknowledged: boolean
}
