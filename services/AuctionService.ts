// Live Auction Service - Single Source of Truth (SSOT)
// Handles: Anti-Sniping, Auto-Bid, Winner Payment Flow, Seller Panel

export interface AuctionConfig {
  antiSniping: {
    enabled: boolean
    triggerThreshold: number // seconds
    extendWindow: number // seconds
    maxExtensions?: number
  }
  autoBid: {
    enabled: boolean
    minIncrement: number // Turkish Lira
  }
  payment: {
    deadline: number // minutes
    maxFallbackLevels: number
    escrowThreshold: number // Turkish Lira
  }
}

export interface BidData {
  id: string
  auctionId: string
  userId: string
  userName: string
  amount: number
  timestamp: number
  isProxy: boolean
  maxBudget?: number
}

export interface AuctionState {
  id: string
  productId: string
  sellerId: string
  status: 'pending' | 'active' | 'extended' | 'ended' | 'paid' | 'unsold'
  startTime: number
  endTime: number
  currentBid: number
  minIncrement: number
  highestBidder?: string
  bids: BidData[]
  activeViewers: number
  extensionCount: number
  paymentDeadline?: number
  winner?: {
    userId: string
    amount: number
    paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'timeout'
  }
  fallbackQueue?: Array<{
    userId: string
    amount: number
    notified: boolean
  }>
}

export interface AutoBidSettings {
  userId: string
  auctionId: string
  maxBudget: number
  isActive: boolean
  currentProxyBid?: number
}

// Default configuration
const DEFAULT_CONFIG: AuctionConfig = {
  antiSniping: {
    enabled: true,
    triggerThreshold: 10, // seconds
    extendWindow: 30, // seconds
    maxExtensions: 5
  },
  autoBid: {
    enabled: true,
    minIncrement: 10 // ₺10 minimum increment
  },
  payment: {
    deadline: 10, // minutes
    maxFallbackLevels: 3,
    escrowThreshold: 5000 // ₺5000+
  }
}

class AuctionService {
  private auctions = new Map<string, AuctionState>()
  private autoBidSettings = new Map<string, AutoBidSettings>()
  private config: AuctionConfig = DEFAULT_CONFIG
  private wsChannel: any = null
  private listeners = new Map<string, Function[]>()

  constructor(wsChannel?: any) {
    this.wsChannel = wsChannel
    this.setupEventListeners()
  }

  // Configuration Management
  updateConfig(newConfig: Partial<AuctionConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.emit('configUpdated', this.config)
  }

  getConfig(): AuctionConfig {
    return { ...this.config }
  }

  // Auction State Management
  createAuction(auctionData: {
    id: string
    productId: string
    sellerId: string
    startTime: number
    duration: number
    startingBid: number
    minIncrement?: number
  }): AuctionState {
    const auction: AuctionState = {
      id: auctionData.id,
      productId: auctionData.productId,
      sellerId: auctionData.sellerId,
      status: 'pending',
      startTime: auctionData.startTime,
      endTime: auctionData.startTime + auctionData.duration,
      currentBid: auctionData.startingBid,
      minIncrement: auctionData.minIncrement || this.config.autoBid.minIncrement,
      bids: [],
      activeViewers: 0,
      extensionCount: 0
    }

    this.auctions.set(auction.id, auction)
    this.emit('auctionCreated', auction)
    return auction
  }

  getAuction(auctionId: string): AuctionState | undefined {
    return this.auctions.get(auctionId)
  }

  startAuction(auctionId: string): boolean {
    const auction = this.auctions.get(auctionId)
    if (!auction || auction.status !== 'pending') return false

    auction.status = 'active'
    this.auctions.set(auctionId, auction)
    this.emit('auctionStarted', auction)
    this.scheduleAuctionEnd(auctionId)
    return true
  }

  // 1. ANTI-SNIPING LOGIC
  placeBid(bidData: Omit<BidData, 'id' | 'timestamp'>): {
    success: boolean
    bid?: BidData
    auction?: AuctionState
    error?: string
  } {
    const auction = this.auctions.get(bidData.auctionId)
    if (!auction) {
      return { success: false, error: 'Auction not found' }
    }

    if (auction.status !== 'active') {
      return { success: false, error: 'Auction not active' }
    }

    const now = Date.now()
    const timeLeft = auction.endTime - now

    // Validate bid amount
    const minBid = auction.currentBid + auction.minIncrement
    if (bidData.amount < minBid) {
      return { 
        success: false, 
        error: `Minimum bid is ${minBid.toLocaleString('tr-TR')}₺` 
      }
    }

    // Create bid record
    const bid: BidData = {
      ...bidData,
      id: crypto.randomUUID(),
      timestamp: now
    }

    // Anti-sniping check
    if (this.config.antiSniping.enabled && 
        timeLeft <= this.config.antiSniping.triggerThreshold * 1000 &&
        auction.extensionCount < (this.config.antiSniping.maxExtensions || 999)) {
      
      // Extend auction
      auction.endTime += this.config.antiSniping.extendWindow * 1000
      auction.extensionCount++
      auction.status = 'extended'
      
      this.emit('auctionExtended', {
        auctionId: auction.id,
        newEndTime: auction.endTime,
        extensionCount: auction.extensionCount,
        triggerBid: bid
      })
    }

    // Update auction state
    auction.currentBid = bidData.amount
    auction.highestBidder = bidData.userId
    auction.bids.push(bid)

    // Process auto-bid responses
    this.processAutoBidResponses(auction, bid)

    this.auctions.set(auction.id, auction)
    this.emit('bidPlaced', { bid, auction })

    // Broadcast via WebSocket
    if (this.wsChannel) {
      this.wsChannel.emit(`auction:${auction.id}`, {
        type: 'bid_placed',
        bid,
        auction: this.sanitizeAuctionForBroadcast(auction)
      })
    }

    return { success: true, bid, auction }
  }

  // 2. AUTO-BID (PROXY BID) LOGIC
  setupAutoBid(settings: Omit<AutoBidSettings, 'currentProxyBid'>): boolean {
    const auction = this.auctions.get(settings.auctionId)
    if (!auction || auction.status !== 'active') return false

    const key = `${settings.userId}:${settings.auctionId}`
    const autoBidSettings: AutoBidSettings = {
      ...settings,
      currentProxyBid: auction.currentBid,
      isActive: true
    }

    this.autoBidSettings.set(key, autoBidSettings)
    this.emit('autoBidSetup', autoBidSettings)
    return true
  }

  private processAutoBidResponses(auction: AuctionState, triggerBid: BidData): void {
    if (!this.config.autoBid.enabled) return

    // Find active auto-bidders
    const autoBidders = Array.from(this.autoBidSettings.values())
      .filter(settings => 
        settings.auctionId === auction.id && 
        settings.isActive &&
        settings.userId !== triggerBid.userId &&
        settings.maxBudget > auction.currentBid
      )
      .sort((a, b) => b.maxBudget - a.maxBudget) // Highest budget first

    for (const autoBidder of autoBidders) {
      const nextBid = auction.currentBid + auction.minIncrement
      
      if (nextBid <= autoBidder.maxBudget && nextBid > (autoBidder.currentProxyBid || 0)) {
        // Place auto-bid
        const autoBid: BidData = {
          id: crypto.randomUUID(),
          auctionId: auction.id,
          userId: autoBidder.userId,
          userName: `Proxy Bid`, // Will be resolved from user data
          amount: nextBid,
          timestamp: Date.now() + 100, // Slight delay to ensure order
          isProxy: true,
          maxBudget: autoBidder.maxBudget
        }

        auction.currentBid = nextBid
        auction.highestBidder = autoBidder.userId
        auction.bids.push(autoBid)
        
        // Update proxy settings
        autoBidder.currentProxyBid = nextBid
        this.autoBidSettings.set(`${autoBidder.userId}:${auction.id}`, autoBidder)

        this.emit('autoBidPlaced', { autoBid, auction })

        // Only one auto-bid per trigger
        break
      }
    }
  }

  disableAutoBid(userId: string, auctionId: string): boolean {
    const key = `${userId}:${auctionId}`
    const settings = this.autoBidSettings.get(key)
    if (!settings) return false

    settings.isActive = false
    this.autoBidSettings.set(key, settings)
    this.emit('autoBidDisabled', { userId, auctionId })
    return true
  }

  // 3. WINNER & PAYMENT FLOW
  private async endAuction(auctionId: string): Promise<void> {
    const auction = this.auctions.get(auctionId)
    if (!auction || auction.status === 'ended') return

    auction.status = 'ended'
    
    if (auction.highestBidder && auction.bids.length > 0) {
      // Set winner and payment deadline
      auction.winner = {
        userId: auction.highestBidder,
        amount: auction.currentBid,
        paymentStatus: 'pending'
      }
      
      auction.paymentDeadline = Date.now() + (this.config.payment.deadline * 60 * 1000)
      
      // Create fallback queue from other bidders
      auction.fallbackQueue = auction.bids
        .filter(bid => bid.userId !== auction.highestBidder)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, this.config.payment.maxFallbackLevels)
        .map(bid => ({
          userId: bid.userId,
          amount: bid.amount,
          notified: false
        }))

      this.auctions.set(auctionId, auction)
      this.emit('auctionEnded', auction)
      
      // Start payment processing
      await this.processWinnerPayment(auctionId)
    } else {
      // No bids - mark as unsold
      auction.status = 'unsold'
      this.auctions.set(auctionId, auction)
      this.emit('auctionUnsold', auction)
    }
  }

  private async processWinnerPayment(auctionId: string): Promise<void> {
    const auction = this.auctions.get(auctionId)
    if (!auction?.winner) return

    auction.winner.paymentStatus = 'processing'
    this.auctions.set(auctionId, auction)

    try {
      // Attempt payment with 3-DS 2.0
      const paymentResult = await this.attemptPayment(
        auction.winner.userId,
        auction.winner.amount,
        auction.winner.amount >= this.config.payment.escrowThreshold
      )

      if (paymentResult.success) {
        auction.winner.paymentStatus = 'paid'
        auction.status = 'paid'
        this.emit('paymentSuccessful', { auctionId, winner: auction.winner })
      } else {
        throw new Error(paymentResult.error || 'Payment failed')
      }
    } catch (error) {
      auction.winner.paymentStatus = 'failed'
      this.emit('paymentFailed', { auctionId, winner: auction.winner, error })
      
      // Start fallback process
      await this.processFallbackPayments(auctionId)
    }

    this.auctions.set(auctionId, auction)
  }

  private async processFallbackPayments(auctionId: string): Promise<void> {
    const auction = this.auctions.get(auctionId)
    if (!auction?.fallbackQueue) return

    for (const fallback of auction.fallbackQueue) {
      if (!fallback.notified) {
        fallback.notified = true
        this.emit('fallbackPaymentOffered', {
          auctionId,
          userId: fallback.userId,
          amount: fallback.amount,
          deadline: Date.now() + (this.config.payment.deadline * 60 * 1000)
        })

        // Wait for user response (would be handled via separate API call)
        // For now, just mark as processed
        break
      }
    }

    // If no fallbacks succeed, mark as unsold
    if (auction.fallbackQueue.every(f => f.notified)) {
      auction.status = 'unsold'
      this.emit('auctionUnsold', auction)
    }

    this.auctions.set(auctionId, auction)
  }

  private async attemptPayment(
    userId: string, 
    amount: number, 
    useEscrow: boolean = false
  ): Promise<{ success: boolean, error?: string }> {
    // Mock payment processing - would integrate with actual payment provider
    try {
      // Simulate 3-DS 2.0 flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 85% success rate simulation
      const success = Math.random() > 0.15
      
      if (!success) {
        throw new Error('Payment provider declined')
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown payment error'
      }
    }
  }

  // 4. SELLER MINI PANEL
  getSellerMetrics(auctionId: string): {
    activeViewers: number
    highestBid: number
    timeLeft: number
    extensionCount: number
    totalBids: number
  } | null {
    const auction = this.auctions.get(auctionId)
    if (!auction) return null

    return {
      activeViewers: auction.activeViewers,
      highestBid: auction.currentBid,
      timeLeft: Math.max(0, auction.endTime - Date.now()),
      extensionCount: auction.extensionCount,
      totalBids: auction.bids.length
    }
  }

  applySellerDiscount(auctionId: string, discountPercent: number): boolean {
    const auction = this.auctions.get(auctionId)
    if (!auction || auction.status !== 'active') return false

    const discountAmount = Math.floor(auction.currentBid * (discountPercent / 100))
    const newMinBid = Math.max(0, auction.currentBid - discountAmount)

    // Emit discount event
    this.emit('sellerDiscountApplied', {
      auctionId,
      originalBid: auction.currentBid,
      discountPercent,
      newMinBid
    })

    return true
  }

  endAuctionEarly(auctionId: string, sellerId: string): boolean {
    const auction = this.auctions.get(auctionId)
    if (!auction || auction.sellerId !== sellerId || auction.status !== 'active') {
      return false
    }

    auction.status = 'ended'
    this.auctions.set(auctionId, auction)
    this.endAuction(auctionId)
    return true
  }

  // Utility Methods
  private scheduleAuctionEnd(auctionId: string): void {
    const auction = this.auctions.get(auctionId)
    if (!auction) return

    const delay = auction.endTime - Date.now()
    if (delay > 0) {
      setTimeout(() => this.endAuction(auctionId), delay)
    }
  }

  private sanitizeAuctionForBroadcast(auction: AuctionState): Partial<AuctionState> {
    // Remove sensitive data for public broadcast
    return {
      id: auction.id,
      productId: auction.productId,
      status: auction.status,
      endTime: auction.endTime,
      currentBid: auction.currentBid,
      minIncrement: auction.minIncrement,
      activeViewers: auction.activeViewers,
      extensionCount: auction.extensionCount
    }
  }

  private setupEventListeners(): void {
    // WebSocket connection handling
    if (this.wsChannel) {
      this.wsChannel.on('connect', () => {
        this.emit('wsConnected')
      })

      this.wsChannel.on('disconnect', () => {
        this.emit('wsDisconnected')
        // Start polling fallback
        this.startPollingFallback()
      })
    }
  }

  private startPollingFallback(): void {
    // 3-second polling fallback when WebSocket fails
    const pollInterval = setInterval(async () => {
      if (this.wsChannel?.connected) {
        clearInterval(pollInterval)
        return
      }

      // Poll auction updates via HTTP
      for (const [auctionId] of this.auctions) {
        try {
          const response = await fetch(`/api/auctions/${auctionId}/status`)
          const data = await response.json()
          
          if (data.auction) {
            this.auctions.set(auctionId, data.auction)
            this.emit('auctionUpdated', data.auction)
          }
        } catch (error) {
          // Continue polling
        }
      }
    }, 3000)
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  // Cleanup
  destroy(): void {
    // Clear all listeners first
    this.listeners.clear()
    this.auctions.clear()
    this.autoBidSettings.clear()
    if (this.wsChannel) {
      this.wsChannel.disconnect()
    }
  }
}

// Export singleton instance
export const auctionService = new AuctionService()

// Feature flags for configuration
export const AUCTION_FEATURES = {
  antiSnipingEnabled: true,
  autoBidEnabled: true,
  fallbackPaymentEnabled: true,
  escrowEnabled: true
} as const

export default AuctionService
