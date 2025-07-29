// composables/useHypeEngine.ts
// The core behavior-shifting engine for BBM-level engagement

export interface HypeEvent {
  id: string
  type: 'bid_war' | 'stock_alert' | 'time_pressure' | 'social_proof' | 'exclusive_drop'
  intensity: 'low' | 'medium' | 'high' | 'extreme'
  message: string
  action?: string
  duration: number
  sound?: string
  vibration?: boolean
  targetUsers?: string[]
}

export interface TensionMoment {
  trigger: 'seconds_left' | 'outbid' | 'stock_low' | 'viewer_surge' | 'competitor_joined'
  threshold: number
  effect: 'pulse' | 'shake' | 'glow' | 'countdown' | 'battle_mode'
  intensity: number
}

export const useHypeEngine = () => {
  // Global tension state
  const currentTension = ref(0) // 0-100 scale
  const activeEvents = ref<HypeEvent[]>([])
  const battleMode = ref(false)
  const soundEnabled = ref(true)
  
  // Real-time metrics that drive hype
  const liveMetrics = reactive({
    concurrentBidders: 0,
    avgBidTime: 0, // milliseconds
    priceVelocity: 0, // price increase per minute
    viewerGrowthRate: 0,
    chatVelocity: 0, // messages per minute
    stockDepletion: 0 // percentage
  })

  // Smart nudge system
  const createSmartNudge = (auctionId: string, context: any): HypeEvent => {
    const { timeLeft, currentBid, stockLeft, bidders, viewers } = context
    
    let intensity: HypeEvent['intensity'] = 'low'
    let message = ''
    let type: HypeEvent['type'] = 'social_proof'
    
    // AI-driven tension calculation
    if (timeLeft < 30 && bidders > 5) {
      intensity = 'extreme'
      type = 'bid_war'
      message = `🔥 SAVAŞ MODU! ${bidders} kişi son 30 saniyede! Hemen teklif ver!`
    } else if (stockLeft <= 2) {
      intensity = 'high'
      type = 'stock_alert'
      message = `⚡ SON ${stockLeft} ADET! ${viewers} kişi izliyor!`
    } else if (timeLeft < 120) {
      intensity = 'medium'
      type = 'time_pressure'
      message = `⏰ ${timeLeft}s kaldı! Şu anki teklif: ${formatPrice(currentBid)}`
    } else if (bidders > 10) {
      intensity = 'medium'
      type = 'social_proof'
      message = `👥 ${bidders} aktif teklif veren! Sen de katıl!`
    }

    return {
      id: generateId(),
      type,
      intensity,
      message,
      duration: intensity === 'extreme' ? 8000 : 5000,
      sound: intensity === 'extreme' ? 'battle' : 'nudge',
      vibration: intensity === 'extreme' || intensity === 'high'
    }
  }

  // Battle mode activation for high-stakes moments
  const activateBattleMode = (auction: any) => {
    battleMode.value = true
    currentTension.value = 100
    
    const battleEvent: HypeEvent = {
      id: generateId(),
      type: 'bid_war',
      intensity: 'extreme',
      message: `⚔️ BATTLE MODE! Top ${Math.min(auction.bidders, 3)} yarışıyor!`,
      duration: 15000,
      sound: 'battle_theme',
      vibration: true
    }
    
    addHypeEvent(battleEvent)
    
    // Visual battle interface
    return {
      topBidders: getTopBidders(auction.id, 3),
      battleTimer: 30, // seconds
      prizeMultiplier: calculatePrizeBonus(auction)
    }
  }

  // Dynamic price tension effects
  const createPriceTension = (oldPrice: number, newPrice: number, timeLeft: number) => {
    const increase = newPrice - oldPrice
    const increasePercent = (increase / oldPrice) * 100
    
    if (increasePercent > 20 && timeLeft < 60) {
      return {
        effect: 'price_explosion',
        message: `💥 %${increasePercent.toFixed(1)} artış! Fiyat patlıyor!`,
        animation: 'shake-explosion',
        duration: 3000
      }
    } else if (increasePercent > 10) {
      return {
        effect: 'price_surge',
        message: `📈 Hızlı artış! +${formatPrice(increase)}`,
        animation: 'pulse-green',
        duration: 2000
      }
    }
    
    return null
  }

  // Global drop night coordinator
  const initializeDropNight = (theme: string, duration: number) => {
    const dropEvent: HypeEvent = {
      id: `drop_night_${Date.now()}`,
      type: 'exclusive_drop',
      intensity: 'extreme',
      message: `🌃 GLOBAL DROP NIGHT: ${theme.toUpperCase()}`,
      duration: duration * 1000,
      sound: 'drop_night_anthem'
    }
    
    // Enable special features during drop night
    return {
      event: dropEvent,
      features: {
        globalChat: true,
        crossStreamReactions: true,
        specialBadges: true,
        bonusRewards: true,
        influencerRooms: true
      }
    }
  }

  // Real-time competitor tracking
  const trackCompetitors = (auctionId: string) => {
    return {
      activeRivals: computed(() => 
        liveMetrics.concurrentBidders > 3 ? 'high' : 
        liveMetrics.concurrentBidders > 1 ? 'medium' : 'low'
      ),
      
      rivalAlert: (newBidder: any) => {
        if (liveMetrics.concurrentBidders >= 5) {
          addHypeEvent({
            id: generateId(),
            type: 'bid_war',
            intensity: 'high',
            message: `🎯 ${newBidder.username} yarışa katıldı! Rakip sayısı: ${liveMetrics.concurrentBidders}`,
            duration: 4000
          })
        }
      }
    }
  }

  // Smart inventory pressure
  const createInventoryPressure = (stockLeft: number, totalViews: number) => {
    const viewerToStockRatio = totalViews / stockLeft
    
    if (viewerToStockRatio > 100 && stockLeft <= 5) {
      return {
        pressure: 'extreme',
        message: `🚨 CRITICAL: ${stockLeft} kaldı, ${totalViews} kişi izliyor!`,
        effect: 'red_pulse',
        urgency: 'immediate'
      }
    } else if (viewerToStockRatio > 50) {
      return {
        pressure: 'high',
        message: `⚠️ ${stockLeft} adet - ${Math.floor(viewerToStockRatio)} kişiye 1 ürün düşüyor`,
        effect: 'orange_glow',
        urgency: 'high'
      }
    }
    
    return null
  }

  // Emotional attachment system
  const createClaimedBadge = (userAction: string, productId: string) => {
    const badges = {
      'fastest_bid': '⚡ Fastest Gun',
      'battle_winner': '👑 Battle Champion', 
      'last_second': '🕐 Last Second Hero',
      'big_spender': '💎 High Roller',
      'loyal_bidder': '🔥 Auction Warrior'
    }
    
    return {
      badge: badges[userAction as keyof typeof badges],
      timestamp: Date.now(),
      productTitle: getProductTitle(productId),
      shareable: true,
      rarity: calculateRarity(userAction)
    }
  }

  // Cross-border hype mechanics
  const createGlobalTension = (countryStats: any) => {
    const topCountries = Object.entries(countryStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
    
    return {
      globalRanking: topCountries,
      internationalChallenge: topCountries.length > 1,
      message: topCountries.length > 1 ? 
        `🌍 GLOBAL BATTLE: ${topCountries.map(([country]) => country).join(' vs ')}` :
        '🌍 Expanding globally...'
    }
  }

  // Utility functions
  const addHypeEvent = (event: HypeEvent) => {
    activeEvents.value.push(event)
    
    // Auto-remove after duration
    setTimeout(() => {
      const index = activeEvents.value.findIndex(e => e.id === event.id)
      if (index > -1) {
        activeEvents.value.splice(index, 1)
      }
    }, event.duration)
    
    // Update global tension
    updateTension(event.intensity)
  }

  const updateTension = (intensity: HypeEvent['intensity']) => {
    const tensionMap = { low: 10, medium: 25, high: 50, extreme: 100 }
    const newLevel = Math.min(100, currentTension.value + tensionMap[intensity])
    
    // Gradually decay tension
    currentTension.value = newLevel
    setTimeout(() => {
      currentTension.value = Math.max(0, currentTension.value - tensionMap[intensity] / 2)
    }, 10000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price)
  }

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  const getTopBidders = (auctionId: string, count: number) => {
    // This would fetch from auction store
    return []
  }

  const calculatePrizeBonus = (auction: any) => {
    return Math.min(2.0, 1 + (auction.bidders * 0.1))
  }

  const getProductTitle = (productId: string) => {
    // This would fetch from products store
    return 'Product'
  }

  const calculateRarity = (action: string) => {
    const rarityMap = {
      'fastest_bid': 'common',
      'battle_winner': 'rare',
      'last_second': 'epic',
      'big_spender': 'legendary',
      'loyal_bidder': 'rare'
    }
    return rarityMap[action as keyof typeof rarityMap] || 'common'
  }

  return {
    // State
    currentTension: readonly(currentTension),
    activeEvents: readonly(activeEvents),
    battleMode: readonly(battleMode),
    liveMetrics: readonly(liveMetrics),
    
    // Hype creation methods
    createSmartNudge,
    activateBattleMode,
    createPriceTension,
    initializeDropNight,
    trackCompetitors,
    createInventoryPressure,
    createClaimedBadge,
    createGlobalTension,
    
    // Management
    addHypeEvent,
    updateTension,
    
    // Settings
    soundEnabled
  }
}
