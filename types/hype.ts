// types/hype.ts
// TypeScript definitions for BBM-level hype system

export interface HypeEvent {
  id: string
  type: 'bid_war' | 'price_drop' | 'time_pressure' | 'social_proof' | 'scarcity' | 'battle_invite'
  intensity: 'low' | 'medium' | 'high' | 'extreme'
  message: string
  action?: string
  duration?: number
  vibration?: boolean | number[]
  targetUsers?: string[]
  globalImpact?: number
  crossBorderAppeal?: boolean
}

export interface BehaviorMetrics {
  engagementScore: number
  tensionLevel: number
  competitiveness: number
  socialProof: number
  urgencyFactor: number
  viralPotential: number
}

export interface GlobalTension {
  level: number
  regions: RegionTension[]
  peakHours: number[]
  trendingItems: string[]
  competitionHeat: number
}

export interface RegionTension {
  region: string
  level: number
  participants: number
  averageBid: number
  culturalFactors: string[]
}

export interface BattleParticipant {
  id: string
  username: string
  avatar?: string
  color: string
  currentBid: number
  bidCount: number
  totalSpent: number
  wins: number
  streak: number
  hitRate: number
  powerLevel: number
  isActive: boolean
  bidTrend: 'up' | 'down' | 'stable'
  country?: string
  timezone?: string
  preferredLanguage?: string
}

export interface SmartNudge {
  id: string
  type: 'price_alert' | 'time_pressure' | 'social_proof' | 'scarcity' | 'battle_invitation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  personalized: boolean
  triggers: NudgeTrigger[]
  content: NudgeContent
  timing: NudgeTiming
  effectiveness: number
}

export interface NudgeTrigger {
  condition: string
  threshold: number
  operator: 'gt' | 'lt' | 'eq' | 'between'
  value: number | string
}

export interface NudgeContent {
  title: string
  message: string
  emoji: string
  action?: string
  visual?: 'pulse' | 'glow' | 'shake' | 'bounce'
  sound?: boolean
  haptic?: boolean
}

export interface NudgeTiming {
  delay: number
  duration: number
  maxFrequency: number
  cooldown: number
  timeZoneAware: boolean
}

export interface GlobalDropEvent {
  id: string
  name: string
  startTime: Date
  endTime: Date
  regions: string[]
  items: DropItem[]
  hypeMultiplier: number
  crossBorderFeatures: CrossBorderFeature[]
}

export interface DropItem {
  id: string
  name: string
  category: string
  startingPrice: number
  expectedHype: number
  exclusivity: 'common' | 'rare' | 'legendary' | 'mythic'
  regionalVariations: Record<string, any>
}

export interface CrossBorderFeature {
  type: 'translation' | 'currency' | 'shipping' | 'cultural_adaptation'
  enabled: boolean
  config: Record<string, any>
}

export interface AuctionState {
  id: string
  title: string
  description: string
  currentBid: number
  startingBid: number
  reservePrice: number
  timeRemaining: number
  bidders: number
  totalBids: number
  status: 'live' | 'ending_soon' | 'battle' | 'ended'
  hypeLevel: number
  tensionMetrics: BehaviorMetrics
  participants: BattleParticipant[]
  globalData: {
    regions: string[]
    totalParticipants: number
    averageBidIncrease: number
    socialShares: number
  }
}

export interface HypeEngineConfig {
  tensionThresholds: {
    low: number
    medium: number
    high: number
    extreme: number
  }
  nudgeFrequency: {
    perHour: number
    maxConcurrent: number
    cooldownMinutes: number
  }
  battleModeSettings: {
    minParticipants: number
    durationMinutes: number
    tensionMultiplier: number
  }
  globalFeatures: {
    crossBorderEnabled: boolean
    realTimeTranslation: boolean
    currencyConversion: boolean
    culturalAdaptation: boolean
  }
}

// Event types for WebSocket communication
export interface WebSocketEvents {
  // Bidding events
  'bid:placed': { auctionId: string; userId: string; amount: number; timestamp: number }
  'bid:war:detected': { auctionId: string; participants: string[]; intensity: number }
  'bid:war:escalated': { auctionId: string; newLevel: number; topBidders: BattleParticipant[] }
  
  // Battle mode events
  'battle:started': { auctionId: string; participants: BattleParticipant[]; duration: number }
  'battle:joined': { auctionId: string; participant: BattleParticipant }
  'battle:ended': { auctionId: string; winner: BattleParticipant; results: any }
  
  // Hype and tension events
  'tension:update': { global: number; regional: RegionTension[]; timestamp: number }
  'hype:surge': { auctionId: string; level: number; triggers: string[] }
  'nudge:trigger': { userId: string; nudge: SmartNudge; context: any }
  
  // Global events
  'drop:night:start': { event: GlobalDropEvent; affectedAuctions: string[] }
  'global:competition': { ranking: any[]; stats: any; leaderboard: any[] }
  'cross:border:activity': { fromRegion: string; toRegion: string; activity: any }
}

// Analytics and tracking types
export interface HypeAnalytics {
  sessionData: {
    userId: string
    sessionStart: Date
    pageViews: string[]
    interactions: InteractionEvent[]
    conversions: ConversionEvent[]
  }
  behaviorPatterns: {
    bidFrequency: number
    averageSessionDuration: number
    preferredCategories: string[]
    responseToNudges: number
    competitiveScore: number
  }
  engagementMetrics: {
    timeToFirstBid: number
    bidWarParticipation: number
    battleModeUsage: number
    socialSharing: number
    returnVisits: number
  }
}

export interface InteractionEvent {
  type: 'bid' | 'watch' | 'share' | 'nudge_click' | 'battle_join'
  timestamp: Date
  context: Record<string, any>
  value?: number
}

export interface ConversionEvent {
  type: 'auction_won' | 'high_value_bid' | 'battle_victory' | 'social_share'
  timestamp: Date
  value: number
  metadata: Record<string, any>
}

// Mobile-specific types for enhanced experience
export interface MobileHypeFeatures {
  hapticFeedback: {
    enabled: boolean
    patterns: Record<string, number[]>
    intensity: 'light' | 'medium' | 'heavy'
  }
  pushNotifications: {
    enabled: boolean
    types: string[]
    timing: 'immediate' | 'smart' | 'scheduled'
  }
  gestureControls: {
    swipeTooBid: boolean
    shakeToActivate: boolean
    longPressActions: boolean
  }
  offlineMode: {
    enabled: boolean
    cacheStrategy: string
    syncOnReconnect: boolean
  }
}
