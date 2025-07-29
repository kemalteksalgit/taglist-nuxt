/**
 * Comprehensive Type Definitions for Live Streaming and Social Commerce
 */

// Basic Stream Configuration
export interface StreamConfig {
  video: {
    width: number
    height: number
    frameRate: number
    bitrate?: number
  }
  audio: {
    bitrate: number
    sampleRate: number
    channels?: number
  }
  quality: StreamQuality
}

export type StreamQuality = 'low' | 'medium' | 'high' | 'ultra'

export type StreamStatus = 'idle' | 'starting' | 'live' | 'paused' | 'ending' | 'ended'

// Stream Metrics and Analytics
export interface StreamMetrics {
  currentViewers: number
  peakViewers: number
  totalViews: number
  avgWatchTime: number
  engagement: {
    chatMessages: number
    reactions: number
    shares: number
    purchases: number
  }
}

export interface StreamAnalytics {
  duration: number
  currentViewers: number
  peakViewers: number
  totalViews: number
  avgWatchTime: number
  engagement: {
    chatRate: number
    reactionRate: number
    participationRate: number
  }
  revenue: {
    totalSales: number
    topProducts: StreamProduct[]
    conversionRate: number
  }
  audience: {
    demographics: AudienceDemographics
    loyaltyDistribution: Record<string, number>
    engagementBySegment: EngagementBySegment
  }
}

export interface AudienceDemographics {
  ageGroups: Record<string, number>
  locations: Record<string, number>
  devices: Record<string, number>
  languages: Record<string, number>
}

export interface EngagementBySegment {
  newUsers: number
  returningUsers: number
  subscribers: number
  vipUsers: number
}

// Chat and Messaging
export interface ChatMessage {
  id: string
  userId: string
  username: string
  content: string
  timestamp: Date
  type: 'text' | 'emoji' | 'gif' | 'sticker' | 'system'
  replyTo?: string
  reactions: MessageReaction[]
  isHighlighted?: boolean
  isPinned?: boolean
  moderationStatus?: 'approved' | 'pending' | 'rejected'
}

export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
}

// Viewer Interactions
export interface ViewerInteraction {
  id: string
  userId: string
  type: 'join' | 'leave' | 'chat' | 'reaction' | 'purchase' | 'share' | 'follow'
  timestamp: Date
  data?: any
}

export interface StreamReaction {
  id: string
  type: 'like' | 'love' | 'wow' | 'fire' | 'crown' | 'gift'
  userId: string
  timestamp: Date
  position?: { x: number; y: number }
  animated: boolean
}

export interface StreamCollaboration {
  id: string
  type: 'co_host' | 'guest_interview' | 'product_demo' | 'expert_review' | 'customer_testimonial'
  participants: {
    userId: string
    username: string
    role: 'host' | 'co_host' | 'guest'
    joinedAt?: Date
    permissions: CollaboratorPermission[]
  }[]
  startTime?: Date
  endTime?: Date
  status: 'pending' | 'active' | 'ended'
}

// Products and Commerce
export interface StreamProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  brand?: string
  inStock: boolean
  stockCount?: number
  variants?: ProductVariant[]
  tags: string[]
  rating?: number
  reviewCount?: number
  specifications?: Record<string, any>
  streamSpecific?: {
    showcaseTime?: number
    specialPrice?: number
    timeLeft?: number
    exclusiveOffer?: boolean
  }
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
  inStock: boolean
  image?: string
}

// Stream Events
export interface StreamEvent {
  id: string
  type: 'start' | 'end' | 'pause' | 'resume' | 'viewer_join' | 'viewer_leave' | 'chat' | 'reaction' | 'product_showcase' | 'collaboration_start' | 'collaboration_end'
  timestamp: Date
  userId?: string
  data?: any
}

// Moderation
export interface StreamModerationSettings {
  autoModerationEnabled: boolean
  bannedWords: string[]
  chatSlowMode: number
  subscriberOnlyChat: boolean
  moderatorOnlyChat: boolean
  allowLinks: boolean
  allowEmojis: boolean
  allowGifs: boolean
  maxMessageLength: number
  spamProtection: boolean
}

export interface ModerationAction {
  id: string
  type: 'warn' | 'timeout' | 'ban' | 'delete_message' | 'pin_message'
  targetUserId: string
  moderatorId: string
  reason: string
  timestamp: Date
  duration?: number
  messageId?: string
}

// Stream Collaboration
export interface StreamCollaborationType {
  type: 'co_host' | 'guest_interview' | 'product_demo' | 'expert_review' | 'customer_testimonial'
  permissions: CollaboratorPermission[]
  maxDuration?: number
  requiresApproval: boolean
}

export interface CollaboratorPermission {
  action: 'share_screen' | 'control_camera' | 'moderate_chat' | 'showcase_products' | 'access_analytics'
  granted: boolean
}

// Interactive Features
export interface StreamPoll {
  id: string
  question: string
  options: PollOption[]
  startTime: Date
  endTime?: Date
  totalVotes: number
  isActive: boolean
  results?: PollResults
}

export interface PollOption {
  id: string
  text: string
  votes: number
  voters: string[]
}

export interface PollResults {
  totalParticipants: number
  options: Array<{
    option: PollOption
    percentage: number
  }>
  demographics?: Record<string, any>
}

export interface StreamQuiz {
  id: string
  title: string
  questions: QuizQuestion[]
  currentQuestionIndex: number
  participants: QuizParticipant[]
  prizes?: StreamPrize[]
  isActive: boolean
  timePerQuestion: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  points: number
  timeLimit: number
}

export interface QuizParticipant {
  userId: string
  username: string
  score: number
  answers: QuizAnswer[]
  rank?: number
}

export interface QuizAnswer {
  questionId: string
  selectedOption: number
  isCorrect: boolean
  timeToAnswer: number
  points: number
}

export interface StreamPrize {
  id: string
  name: string
  description: string
  value: number
  type: 'product' | 'discount' | 'gift_card' | 'exclusive_access'
  quantity: number
  requirements?: PrizeRequirements
}

export interface PrizeRequirements {
  minWatchTime?: number
  minEngagement?: number
  subscriberOnly?: boolean
  loyaltyLevel?: string
  purchaseRequired?: boolean
}

// Stream Scheduling
export interface StreamSchedule {
  id: string
  title: string
  description: string
  scheduledStart: Date
  estimatedDuration: number
  category: string
  tags: string[]
  products?: StreamProduct[]
  collaborators?: StreamCollaborator[]
  isPublic: boolean
  maxViewers?: number
  reminderSettings: ReminderSettings
  recurrence?: RecurrencePattern
}

export interface StreamCollaborator {
  userId: string
  username: string
  role: 'co_host' | 'guest'
  confirmedAt?: Date
  permissions: CollaboratorPermission[]
}

export interface ReminderSettings {
  enabled: boolean
  intervals: number[] // minutes before start
  channels: ('email' | 'push' | 'sms')[]
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly'
  interval: number
  daysOfWeek?: number[]
  endDate?: Date
  maxOccurrences?: number
}

// Stream Recording and Highlights
export interface StreamRecording {
  id: string
  streamId: string
  startTime: Date
  endTime: Date
  duration: number
  fileUrl: string
  thumbnailUrl: string
  title: string
  description?: string
  isPublic: boolean
  viewCount: number
  highlights: StreamHighlight[]
}

export interface StreamHighlight {
  id: string
  title: string
  startTime: number
  endTime: number
  type: 'product_showcase' | 'funny_moment' | 'important_announcement' | 'collaboration'
  thumbnailUrl?: string
  engagement: {
    likes: number
    shares: number
    comments: number
  }
}

// Monetization
export interface StreamMonetization {
  subscriptions: SubscriptionTier[]
  donations: DonationSettings
  productSales: ProductSalesSettings
  sponsorships: SponsorshipSettings
  advertisements: AdSettings
}

export interface SubscriptionTier {
  id: string
  name: string
  price: number
  duration: 'monthly' | 'yearly'
  benefits: SubscriptionBenefit[]
  badgeUrl?: string
  color?: string
}

export interface SubscriptionBenefit {
  type: 'ad_free' | 'exclusive_content' | 'priority_chat' | 'custom_emotes' | 'early_access'
  description: string
}

export interface DonationSettings {
  enabled: boolean
  minAmount: number
  maxAmount: number
  suggestedAmounts: number[]
  showDonorName: boolean
  readDonations: boolean
  goals?: DonationGoal[]
}

export interface DonationGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: Date
  reward?: string
}

export interface ProductSalesSettings {
  commissionRate: number
  exclusiveDiscounts: boolean
  flashSales: boolean
  bundleDeals: boolean
  loyaltyProgram?: LoyaltyProgram
}

export interface LoyaltyProgram {
  name: string
  tiers: LoyaltyTier[]
  pointsPerPurchase: number
  pointsPerDollar: number
  bonusEvents: LoyaltyBonus[]
}

export interface LoyaltyTier {
  name: string
  minPoints: number
  benefits: string[]
  badge?: string
  color?: string
}

export interface LoyaltyBonus {
  event: 'stream_attendance' | 'chat_participation' | 'product_review' | 'referral'
  points: number
  maxPerDay?: number
}

export interface SponsorshipSettings {
  enabled: boolean
  rates: SponsorshipRate[]
  categories: string[]
  disclosure: string
}

export interface SponsorshipRate {
  type: 'banner' | 'product_mention' | 'dedicated_segment' | 'overlay'
  duration: number
  price: number
  maxPerStream?: number
}

export interface AdSettings {
  enabled: boolean
  frequency: number
  types: ('pre_roll' | 'mid_roll' | 'post_roll' | 'banner' | 'overlay')[]
  skipable: boolean
  skipTime?: number
  categories: string[]
}

// Notifications
export interface StreamNotification {
  id: string
  type: 'stream_starting' | 'stream_ending' | 'new_follower' | 'donation' | 'subscription' | 'milestone'
  title: string
  message: string
  timestamp: Date
  userId?: string
  data?: any
  isRead: boolean
}

// Social Features
export interface SocialInteraction {
  type: 'follow' | 'unfollow' | 'share' | 'like' | 'comment' | 'tag'
  fromUserId: string
  toUserId?: string
  streamId?: string
  timestamp: Date
  data?: any
}

export interface StreamShare {
  id: string
  streamId: string
  sharedBy: string
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'discord' | 'whatsapp'
  timestamp: Date
  clickCount: number
  conversionCount: number
}

// Technical Configuration
export interface StreamTechnicalConfig {
  rtmp: RTMPConfig
  webrtc: WebRTCConfig
  cdn: CDNConfig
  recording: RecordingConfig
  transcoding: TranscodingConfig
}

export interface RTMPConfig {
  enabled: boolean
  serverUrl: string
  streamKey: string
  maxBitrate: number
  keyframeInterval: number
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[]
  maxBitrate: number
  codecPreferences: string[]
  adaptiveBitrate: boolean
}

export interface CDNConfig {
  provider: string
  regions: string[]
  cacheSettings: CacheSettings
}

export interface CacheSettings {
  ttl: number
  edgeCaching: boolean
  compressionEnabled: boolean
}

export interface RecordingConfig {
  enabled: boolean
  quality: StreamQuality
  format: 'mp4' | 'webm' | 'hls'
  storageLocation: string
  autoDelete: boolean
  retentionDays: number
}

export interface TranscodingConfig {
  enabled: boolean
  qualities: StreamQuality[]
  codecSettings: CodecSettings
}

export interface CodecSettings {
  video: {
    codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1'
    profile: string
    level: string
  }
  audio: {
    codec: 'aac' | 'opus' | 'mp3'
    bitrate: number
    sampleRate: number
  }
}

// Error Handling
export interface StreamError {
  code: string
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  component: string
  stack?: string
  context?: any
}

// Performance Monitoring
export interface StreamPerformance {
  latency: number
  bitrate: number
  frameRate: number
  dropRate: number
  bufferHealth: number
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor'
  timestamp: Date
}

// State Management
export interface StreamState {
  status: StreamStatus
  config: StreamConfig
  metrics: StreamMetrics
  currentProduct?: StreamProduct
  activePolls: StreamPoll[]
  activeQuiz?: StreamQuiz
  collaborators: StreamCollaborator[]
  moderationActive: boolean
  recordingActive: boolean
  errors: StreamError[]
  performance: StreamPerformance
}
