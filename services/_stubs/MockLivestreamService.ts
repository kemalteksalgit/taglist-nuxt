/**
 * STUB: Mock Livestream Service  
 * TODO: Connect to real WebSocket streaming endpoints
 */

export interface StreamData {
  id: string
  title: string
  sellerName: string
  sellerAvatar: string
  sellerRating: number
  viewers: number
  duration: number
  isLive: boolean
  products: StreamProduct[]
}

export interface StreamProduct {
  id: string
  name: string
  price: number
  image: string
  hasAuction: boolean
  currentBid?: number
}

export interface BidData {
  productId: string
  amount: number
  userId: string
  timestamp: string
}

export class MockLivestreamService {
  private mockTimer: NodeJS.Timeout | null = null
  private mockViewers = 0
  
  async getStreamData(streamId: string): Promise<StreamData> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('TODO API: Replace with real livestream data endpoint', { streamId })
    
    return {
      id: streamId,
      title: `Canlı Satış - İkinci El Elektronik - Stream ${streamId}`,
      sellerName: 'Ahmet Satıcı',
      sellerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
      sellerRating: 4.8,
      viewers: Math.floor(Math.random() * 100) + 20,
      duration: Math.floor(Math.random() * 3600) + 300, // 5min to 1hour
      isLive: true,
      products: [
        {
          id: '1',
          name: 'iPhone 13 Pro - Temiz',
          price: 25000,
          image: 'https://picsum.photos/300/300?random=1',
          hasAuction: true,
          currentBid: 24500
        },
        {
          id: '2', 
          name: 'MacBook Air M2',
          price: 35000,
          image: 'https://picsum.photos/300/300?random=2',
          hasAuction: false
        },
        {
          id: '3',
          name: 'AirPods Pro 2. Nesil',
          price: 3500,
          image: 'https://picsum.photos/300/300?random=3',
          hasAuction: true,
          currentBid: 3200
        }
      ]
    }
  }
  
  async placeBid(streamId: string, productId: string, amount: number): Promise<BidData> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('TODO API: Replace with real bid placement endpoint', { 
      streamId, 
      productId, 
      amount 
    })
    
    const bidData: BidData = {
      productId,
      amount,
      userId: 'current-user-id',
      timestamp: new Date().toISOString()
    }
    
    // Mock success response
    return bidData
  }
  
  startMockTimer() {
    // Mock viewer count changes for demo
    this.mockTimer = setInterval(() => {
      this.mockViewers = Math.floor(Math.random() * 100) + 20
    }, 10000)
  }
  
  stopMockTimer() {
    if (this.mockTimer) {
      clearInterval(this.mockTimer)
      this.mockTimer = null
    }
  }
  
  async joinStream(streamId: string) {
    console.log('TODO WebSocket: Connect to real streaming channel', { streamId })
    
    // Mock WebSocket connection
    return {
      status: 'connected',
      channel: `stream_${streamId}`,
      message: 'Mock WebSocket connection established'
    }
  }
  
  async leaveStream(streamId: string) {
    console.log('TODO WebSocket: Disconnect from streaming channel', { streamId })
    
    return {
      status: 'disconnected',
      message: 'Mock WebSocket connection closed'
    }
  }
}

// Export singleton instance
export const mockLivestreamService = new MockLivestreamService()
