// tests/services/AuctionService.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import AuctionService, { type AuctionConfig, type BidData } from '../../services/AuctionService'

// Mock WebSocket
const mockWsChannel = {
  emit: vi.fn(),
  on: vi.fn(),
  connected: true,
  disconnect: vi.fn()
}

describe('AuctionService', () => {
  let auctionService: AuctionService
  let mockConfig: AuctionConfig
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    mockConfig = {
      antiSniping: {
        enabled: true,
        triggerThreshold: 10,
        extendWindow: 30,
        maxExtensions: 5
      },
      autoBid: {
        enabled: true,
        minIncrement: 10
      },
      payment: {
        deadline: 10,
        maxFallbackLevels: 3,
        escrowThreshold: 5000
      }
    }
    
    auctionService = new AuctionService(mockWsChannel)
    auctionService.updateConfig(mockConfig)
  })
  
  afterEach(() => {
    auctionService.destroy()
    vi.useRealTimers()
  })

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = { antiSniping: { enabled: false, triggerThreshold: 5, extendWindow: 15 } }
      
      auctionService.updateConfig(newConfig)
      const config = auctionService.getConfig()
      
      expect(config.antiSniping.enabled).toBe(false)
      expect(config.antiSniping.triggerThreshold).toBe(5)
      expect(config.autoBid.enabled).toBe(true) // Should preserve other settings
    })

    it('should emit configUpdated event', () => {
      const listener = vi.fn()
      auctionService.on('configUpdated', listener)
      
      const newConfig = { antiSniping: { enabled: false, triggerThreshold: 5, extendWindow: 15 } }
      auctionService.updateConfig(newConfig)
      
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        antiSniping: expect.objectContaining({ enabled: false })
      }))
    })
  })

  describe('Auction Lifecycle', () => {
    it('should create auction successfully', () => {
      const auctionData = {
        id: 'auction-1',
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 300000, // 5 minutes
        startingBid: 100
      }
      
      const auction = auctionService.createAuction(auctionData)
      
      expect(auction.id).toBe('auction-1')
      expect(auction.status).toBe('pending')
      expect(auction.currentBid).toBe(100)
      expect(auction.minIncrement).toBe(10)
      expect(auction.bids).toEqual([])
    })

    it('should start auction and schedule end', () => {
      const auctionData = {
        id: 'auction-1',
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 300000,
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      const success = auctionService.startAuction('auction-1')
      
      expect(success).toBe(true)
      
      const auction = auctionService.getAuction('auction-1')
      expect(auction?.status).toBe('active')
    })

    it('should not start non-existent auction', () => {
      const success = auctionService.startAuction('non-existent')
      expect(success).toBe(false)
    })

    it('should not start already active auction', () => {
      const auctionData = {
        id: 'auction-1',
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 300000,
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      auctionService.startAuction('auction-1')
      
      const secondStart = auctionService.startAuction('auction-1')
      expect(secondStart).toBe(false)
    })
  })

  describe('Bidding System', () => {
    let auctionId: string

    beforeEach(() => {
      auctionId = 'auction-1'
      const auctionData = {
        id: auctionId,
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 300000,
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      auctionService.startAuction(auctionId)
    })

    it('should place valid bid successfully', () => {
      const bidData = {
        auctionId,
        userId: 'user-1',
        userName: 'Test User',
        amount: 120,
        isProxy: false
      }
      
      const result = auctionService.placeBid(bidData)
      
      expect(result.success).toBe(true)
      expect(result.bid).toBeDefined()
      expect(result.auction?.currentBid).toBe(120)
      expect(result.auction?.highestBidder).toBe('user-1')
    })

    it('should reject bid below minimum', () => {
      const bidData = {
        auctionId,
        userId: 'user-1',
        userName: 'Test User',
        amount: 105, // Below minimum increment
        isProxy: false
      }
      
      const result = auctionService.placeBid(bidData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Minimum bid is 110₺')
    })

    it('should reject bid on non-existent auction', () => {
      const bidData = {
        auctionId: 'non-existent',
        userId: 'user-1',
        userName: 'Test User',
        amount: 120,
        isProxy: false
      }
      
      const result = auctionService.placeBid(bidData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Auction not found')
    })

    it('should emit bidPlaced event', () => {
      const listener = vi.fn()
      auctionService.on('bidPlaced', listener)
      
      const bidData = {
        auctionId,
        userId: 'user-1',
        userName: 'Test User',
        amount: 120,
        isProxy: false
      }
      
      auctionService.placeBid(bidData)
      
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        bid: expect.objectContaining({ amount: 120 }),
        auction: expect.objectContaining({ currentBid: 120 })
      }))
    })

    it('should broadcast bid via WebSocket', () => {
      const bidData = {
        auctionId,
        userId: 'user-1',
        userName: 'Test User',
        amount: 120,
        isProxy: false
      }
      
      auctionService.placeBid(bidData)
      
      expect(mockWsChannel.emit).toHaveBeenCalledWith(
        `auction:${auctionId}`,
        expect.objectContaining({
          type: 'bid_placed'
        })
      )
    })
  })

  describe('Anti-Sniping Logic', () => {
    let auctionId: string

    beforeEach(() => {
      auctionId = 'auction-1'
      const auctionData = {
        id: auctionId,
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 30000, // 30 seconds for testing
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      auctionService.startAuction(auctionId)
    })

    it('should extend auction when bid placed in last 10 seconds', () => {
      // Fast forward to 25 seconds (5 seconds left)
      vi.advanceTimersByTime(25000)
      
      const listener = vi.fn()
      auctionService.on('auctionExtended', listener)
      
      const bidData = {
        auctionId,
        userId: 'user-1',
        userName: 'Test User',
        amount: 120,
        isProxy: false
      }
      
      const result = auctionService.placeBid(bidData)
      
      expect(result.success).toBe(true)
      expect(result.auction?.status).toBe('extended')
      expect(result.auction?.extensionCount).toBe(1)
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        auctionId,
        extensionCount: 1
      }))
    })

    it('should not extend auction beyond max extensions', () => {
      // Set max extensions to 1
      auctionService.updateConfig({
        antiSniping: { ...mockConfig.antiSniping, maxExtensions: 1 }
      })
      
      // Fast forward and place first bid (should extend)
      vi.advanceTimersByTime(25000)
      auctionService.placeBid({
        auctionId,
        userId: 'user-1',
        userName: 'Test User 1',
        amount: 120,
        isProxy: false
      })
      
      // Fast forward again and place second bid (should not extend)
      vi.advanceTimersByTime(25000)
      const result = auctionService.placeBid({
        auctionId,
        userId: 'user-2',
        userName: 'Test User 2',
        amount: 140,
        isProxy: false
      })
      
      expect(result.auction?.extensionCount).toBe(1) // Still 1, not extended again
    })

    it('should not extend when anti-sniping disabled', () => {
      auctionService.updateConfig({
        antiSniping: { ...mockConfig.antiSniping, enabled: false }
      })
      
      vi.advanceTimersByTime(25000)
      
      const result = auctionService.placeBid({
        auctionId,
        userId: 'user-1',
        userName: 'Test User',
        amount: 120,
        isProxy: false
      })
      
      expect(result.auction?.status).toBe('active') // Not extended
      expect(result.auction?.extensionCount).toBe(0)
    })
  })

  describe('Auto-Bid (Proxy Bid) System', () => {
    let auctionId: string

    beforeEach(() => {
      auctionId = 'auction-1'
      const auctionData = {
        id: auctionId,
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 300000,
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      auctionService.startAuction(auctionId)
    })

    it('should setup auto-bid successfully', () => {
      const settings = {
        userId: 'user-1',
        auctionId,
        maxBudget: 500,
        isActive: true
      }
      
      const success = auctionService.setupAutoBid(settings)
      expect(success).toBe(true)
    })

    it('should not setup auto-bid for non-existent auction', () => {
      const settings = {
        userId: 'user-1',
        auctionId: 'non-existent',
        maxBudget: 500,
        isActive: true
      }
      
      const success = auctionService.setupAutoBid(settings)
      expect(success).toBe(false)
    })

    it('should place auto-bid when another user bids', () => {
      // Setup auto-bid for user-1
      auctionService.setupAutoBid({
        userId: 'user-1',
        auctionId,
        maxBudget: 500,
        isActive: true
      })
      
      const listener = vi.fn()
      auctionService.on('autoBidPlaced', listener)
      
      // User-2 places manual bid
      auctionService.placeBid({
        auctionId,
        userId: 'user-2',
        userName: 'Manual Bidder',
        amount: 120,
        isProxy: false
      })
      
      // Should trigger auto-bid from user-1
      expect(listener).toHaveBeenCalled()
      
      const auction = auctionService.getAuction(auctionId)
      expect(auction?.currentBid).toBe(130) // Auto-bid should be 120 + 10
      expect(auction?.highestBidder).toBe('user-1')
    })

    it('should not exceed max budget in auto-bid', () => {
      // Setup auto-bid with low budget
      auctionService.setupAutoBid({
        userId: 'user-1',
        auctionId,
        maxBudget: 125, // Only allows one auto-bid
        isActive: true
      })
      
      // Place manual bid that triggers auto-bid
      auctionService.placeBid({
        auctionId,
        userId: 'user-2',
        userName: 'Manual Bidder',
        amount: 120,
        isProxy: false
      })
      
      // Auto-bid should place 130
      let auction = auctionService.getAuction(auctionId)
      expect(auction?.currentBid).toBe(130)
      
      // Another manual bid
      auctionService.placeBid({
        auctionId,
        userId: 'user-2',
        userName: 'Manual Bidder',
        amount: 140,
        isProxy: false
      })
      
      // No more auto-bids (would exceed budget)
      auction = auctionService.getAuction(auctionId)
      expect(auction?.currentBid).toBe(140)
      expect(auction?.highestBidder).toBe('user-2')
    })

    it('should disable auto-bid', () => {
      auctionService.setupAutoBid({
        userId: 'user-1',
        auctionId,
        maxBudget: 500,
        isActive: true
      })
      
      const success = auctionService.disableAutoBid('user-1', auctionId)
      expect(success).toBe(true)
      
      // Manual bid should not trigger auto-bid
      auctionService.placeBid({
        auctionId,
        userId: 'user-2',
        userName: 'Manual Bidder',
        amount: 120,
        isProxy: false
      })
      
      const auction = auctionService.getAuction(auctionId)
      expect(auction?.currentBid).toBe(120) // No auto-bid placed
    })

    it('should not auto-bid when feature disabled', () => {
      auctionService.updateConfig({
        autoBid: { ...mockConfig.autoBid, enabled: false }
      })
      
      auctionService.setupAutoBid({
        userId: 'user-1',
        auctionId,
        maxBudget: 500,
        isActive: true
      })
      
      auctionService.placeBid({
        auctionId,
        userId: 'user-2',
        userName: 'Manual Bidder',
        amount: 120,
        isProxy: false
      })
      
      const auction = auctionService.getAuction(auctionId)
      expect(auction?.currentBid).toBe(120) // No auto-bid
    })
  })

  describe('Seller Controls', () => {
    let auctionId: string

    beforeEach(() => {
      auctionId = 'auction-1'
      const auctionData = {
        id: auctionId,
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 300000,
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      auctionService.startAuction(auctionId)
    })

    it('should get seller metrics', () => {
      // Place some bids first
      auctionService.placeBid({
        auctionId,
        userId: 'user-1',
        userName: 'Test User 1',
        amount: 120,
        isProxy: false
      })
      
      const metrics = auctionService.getSellerMetrics(auctionId)
      
      expect(metrics).toBeDefined()
      expect(metrics?.highestBid).toBe(120)
      expect(metrics?.totalBids).toBe(1)
      expect(metrics?.timeLeft).toBeGreaterThan(0)
    })

    it('should return null for non-existent auction metrics', () => {
      const metrics = auctionService.getSellerMetrics('non-existent')
      expect(metrics).toBeNull()
    })

    it('should apply seller discount', () => {
      auctionService.placeBid({
        auctionId,
        userId: 'user-1',
        userName: 'Test User',
        amount: 200,
        isProxy: false
      })
      
      const listener = vi.fn()
      auctionService.on('sellerDiscountApplied', listener)
      
      const success = auctionService.applySellerDiscount(auctionId, 10) // 10% discount
      
      expect(success).toBe(true)
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        auctionId,
        originalBid: 200,
        discountPercent: 10
      }))
    })

    it('should end auction early by seller', () => {
      const success = auctionService.endAuctionEarly(auctionId, 'seller-1')
      expect(success).toBe(true)
      
      const auction = auctionService.getAuction(auctionId)
      expect(auction?.status).toBe('ended')
    })

    it('should not allow non-seller to end auction', () => {
      const success = auctionService.endAuctionEarly(auctionId, 'different-seller')
      expect(success).toBe(false)
    })
  })

  describe('Payment Processing', () => {
    let auctionId: string

    beforeEach(() => {
      auctionId = 'auction-1'
      const auctionData = {
        id: auctionId,
        productId: 'product-1',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 1000, // Short duration for testing
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      auctionService.startAuction(auctionId)
      
      // Place winning bid
      auctionService.placeBid({
        auctionId,
        userId: 'winner',
        userName: 'Winner',
        amount: 200,
        isProxy: false
      })
    })

    it('should create winner and payment deadline when auction ends', () => {
      const listener = vi.fn()
      auctionService.on('auctionEnded', listener)
      
      // Fast forward past auction end
      vi.advanceTimersByTime(2000)
      
      expect(listener).toHaveBeenCalled()
      
      const auction = auctionService.getAuction(auctionId)
      expect(auction?.status).toBe('ended')
      expect(auction?.winner).toBeDefined()
      expect(auction?.winner?.userId).toBe('winner')
      expect(auction?.paymentDeadline).toBeDefined()
    })

    it('should mark auction as unsold when no bids', () => {
      // Create auction without bids
      const noeBidAuctionId = 'no-bid-auction'
      const auctionData = {
        id: noeBidAuctionId,
        productId: 'product-2',
        sellerId: 'seller-1',
        startTime: Date.now(),
        duration: 1000,
        startingBid: 100
      }
      
      auctionService.createAuction(auctionData)
      auctionService.startAuction(noeBidAuctionId)
      
      const listener = vi.fn()
      auctionService.on('auctionUnsold', listener)
      
      // Fast forward past auction end
      vi.advanceTimersByTime(2000)
      
      expect(listener).toHaveBeenCalled()
      
      const auction = auctionService.getAuction(noeBidAuctionId)
      expect(auction?.status).toBe('unsold')
    })
  })

  describe('WebSocket Integration', () => {
    it('should handle WebSocket connection events', () => {
      const listener = vi.fn()
      auctionService.on('wsConnected', listener)
      
      // Simulate WebSocket connect event
      const connectCallback = mockWsChannel.on.mock.calls.find(call => call[0] === 'connect')?.[1]
      if (connectCallback) {
        connectCallback()
      }
      
      expect(listener).toHaveBeenCalled()
    })

    it('should start polling fallback on disconnect', () => {
      const listener = vi.fn()
      auctionService.on('wsDisconnected', listener)
      
      // Mock fetch for polling
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ auction: { id: 'test' } })
      })
      
      // Simulate WebSocket disconnect
      const disconnectCallback = mockWsChannel.on.mock.calls.find(call => call[0] === 'disconnect')?.[1]
      if (disconnectCallback) {
        disconnectCallback()
      }
      
      expect(listener).toHaveBeenCalled()
    })
  })

  describe('Event System', () => {
    it('should add and remove event listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      auctionService.on('testEvent', listener1)
      auctionService.on('testEvent', listener2)
      
      // Trigger event
      auctionService['emit']('testEvent', 'test data')
      
      expect(listener1).toHaveBeenCalledWith('test data')
      expect(listener2).toHaveBeenCalledWith('test data')
      
      // Remove one listener
      auctionService.off('testEvent', listener1)
      
      // Trigger again
      auctionService['emit']('testEvent', 'test data 2')
      
      expect(listener1).toHaveBeenCalledTimes(1) // Should not be called again
      expect(listener2).toHaveBeenCalledWith('test data 2')
    })
  })

  describe('Cleanup', () => {
    it('should cleanup resources on destroy', () => {
      auctionService.destroy()
      
      expect(mockWsChannel.disconnect).toHaveBeenCalled()
      
      // Events should not work after destroy
      const listener = vi.fn()
      auctionService.on('testEvent', listener)
      auctionService['emit']('testEvent', 'test')
      
      expect(listener).not.toHaveBeenCalled()
    })
  })
})

// Edge cases and error scenarios
describe('AuctionService Edge Cases', () => {
  let auctionService: AuctionService

  beforeEach(() => {
    auctionService = new AuctionService()
  })

  afterEach(() => {
    auctionService.destroy()
  })

  it('should handle concurrent bids gracefully', () => {
    const auctionData = {
      id: 'concurrent-auction',
      productId: 'product-1',
      sellerId: 'seller-1',
      startTime: Date.now(),
      duration: 300000,
      startingBid: 100
    }
    
    auctionService.createAuction(auctionData)
    auctionService.startAuction('concurrent-auction')
    
    // Simulate multiple concurrent bids
    const results = [
      auctionService.placeBid({
        auctionId: 'concurrent-auction',
        userId: 'user-1',
        userName: 'User 1',
        amount: 120,
        isProxy: false
      }),
      auctionService.placeBid({
        auctionId: 'concurrent-auction',
        userId: 'user-2',
        userName: 'User 2',
        amount: 130,
        isProxy: false
      }),
      auctionService.placeBid({
        auctionId: 'concurrent-auction',
        userId: 'user-3',
        userName: 'User 3',
        amount: 125, // Lower than current bid
        isProxy: false
      })
    ]
    
    // First two should succeed, third should fail
    expect(results[0]?.success).toBe(true)
    expect(results[1]?.success).toBe(true)
    expect(results[2]?.success).toBe(false)
    
    const auction = auctionService.getAuction('concurrent-auction')
    expect(auction?.currentBid).toBe(130)
    expect(auction?.highestBidder).toBe('user-2')
  })

  it('should handle invalid auction states', () => {
    // Try to bid on non-active auction
    const auctionData = {
      id: 'inactive-auction',
      productId: 'product-1',
      sellerId: 'seller-1',
      startTime: Date.now(),
      duration: 300000,
      startingBid: 100
    }
    
    auctionService.createAuction(auctionData)
    // Don't start the auction
    
    const result = auctionService.placeBid({
      auctionId: 'inactive-auction',
      userId: 'user-1',
      userName: 'User 1',
      amount: 120,
      isProxy: false
    })
    
    expect(result.success).toBe(false)
    expect(result.error).toBe('Auction not active')
  })

  it('should handle missing WebSocket gracefully', () => {
    const serviceWithoutWS = new AuctionService()
    
    const auctionData = {
      id: 'no-ws-auction',
      productId: 'product-1',
      sellerId: 'seller-1',
      startTime: Date.now(),
      duration: 300000,
      startingBid: 100
    }
    
    serviceWithoutWS.createAuction(auctionData)
    serviceWithoutWS.startAuction('no-ws-auction')
    
    // Should not throw error when placing bid without WebSocket
    const result = serviceWithoutWS.placeBid({
      auctionId: 'no-ws-auction',
      userId: 'user-1',
      userName: 'User 1',
      amount: 120,
      isProxy: false
    })
    
    expect(result.success).toBe(true)
    serviceWithoutWS.destroy()
  })
})
