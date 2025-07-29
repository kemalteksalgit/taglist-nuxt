// composables/useAuction.ts
export interface AuctionItem {
  id: string
  title: string
  description: string
  images: string[]
  startingPrice: number
  currentBid: number
  bidIncrement: number
  reservePrice?: number
  buyNowPrice?: number
  startTime: string
  endTime: string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  sellerId: string
  category: string
  condition: string
  bidHistory: AuctionBid[]
  watchers: string[]
  inventory: {
    quantity: number
    reserved: number
    sold: number
  }
}

export interface AuctionBid {
  id: string
  auctionId: string
  userId: string
  username: string
  amount: number
  timestamp: string
  isAutoBid: boolean
  maxBid?: number
  status: 'active' | 'outbid' | 'winning' | 'won'
}

export interface AuctionEvent {
  type: 'bid_placed' | 'auction_started' | 'auction_ended' | 'time_extended' | 'bid_retracted'
  auctionId: string
  data: any
  timestamp: string
}

export const useAuction = (auctionId?: string) => {
  const { $fetch } = useNuxtApp()
  const authStore = useAuthStore()
  const ws = useWebSocket()
  const { state: wsState, send, on, off } = ws
  
  // State
  const auction = ref<AuctionItem | null>(null)
  const bids = ref<AuctionBid[]>([])
  const isLoading = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const timeRemaining = ref(0)
  const isWatching = ref(false)
  
  // Auto-bid settings
  const autoBidEnabled = ref(false)
  const maxAutoBid = ref(0)
  
  // Bidding state
  const isBidding = ref(false)
  const lastBidAttempt = ref<Date | null>(null)
  const bidCooldown = 2000 // 2 seconds between bids
  
  // For compatibility
  const auctionData = auction

  // Computed
  const currentHighestBid = computed(() => {
    if (!bids.value.length) return auction.value?.startingPrice || 0
    return Math.max(...bids.value.map(bid => bid.amount))
  })

  const minimumBid = computed(() => {
    return currentHighestBid.value + (auction.value?.bidIncrement || 1)
  })

  const userHighestBid = computed(() => {
    if (!authStore.user?.id) return null
    const userBids = bids.value.filter(bid => bid.userId === authStore.user!.id)
    return userBids.length > 0 ? Math.max(...userBids.map(bid => bid.amount)) : 0
  })

  const isUserWinning = computed(() => {
    if (!authStore.user?.id || !bids.value.length) return false
    const highestBid = bids.value.reduce((prev, current) => 
      current.amount > prev.amount ? current : prev
    )
    return highestBid.userId === authStore.user.id
  })

  const canBid = computed(() => {
    if (!auction.value || !authStore.user?.id) return false
    if (auction.value.sellerId === authStore.user.id) return false
    if (auction.value.status !== 'live') return false
    if (Date.now() > new Date(auction.value.endTime).getTime()) return false
    
    // Check cooldown
    if (lastBidAttempt.value) {
      const timeSinceLastBid = Date.now() - lastBidAttempt.value.getTime()
      if (timeSinceLastBid < bidCooldown) return false
    }
    
    return true
  })

  // Fetch auction data
  const fetchAuction = async (id: string) => {
    try {
      isLoading.value = true
      error.value = null
      
      const data = await ($fetch as any)(`/api/auctions/${id}`)
      auction.value = data
      bids.value = data.bidHistory || []
      
      // Check if user is watching
      if (authStore.user?.id && auction.value) {
        isWatching.value = auction.value.watchers.includes(authStore.user.id)
      }
      
      // Subscribe to real-time updates
      if (wsState.connected) {
        subscribe(id)
      }
      
    } catch (err: any) {
      error.value = err.message || 'Failed to load auction'
      console.error('Auction load error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Auction actions
  const placeBid = async (auctionId: string, amount: number, options?: { enableAutoBid?: boolean; maxAutoBid?: number }) => {
    if (!authStore.isAuthenticated) {
      throw new Error('Must be logged in to place bids')
    }

    // Validate bid amount
    const auction = auctionData.value
    if (!auction) {
      throw new Error('Auction not found')
    }

    if (amount <= auction.currentBid) {
      throw new Error('Bid must be higher than current bid')
    }

    if (amount < auction.currentBid + auction.bidIncrement) {
      throw new Error(`Minimum bid increment is ${auction.bidIncrement}`)
    }

    try {
      loading.value = true
      
      const response = await ($fetch as any)(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        body: {
          amount,
          maxBid: options?.maxAutoBid || amount,
          enableAutoBid: options?.enableAutoBid || false
        }
      })

      // Update local state with new bid
      const newBid: AuctionBid = {
        id: response.bid.id,
        auctionId,
        userId: authStore.user!.id,
        username: authStore.user!.username,
        amount,
        timestamp: new Date().toISOString(),
        isAutoBid: options?.enableAutoBid || false,
        maxBid: options?.maxAutoBid,
        status: 'active'
      }

      // Update auction current bid and add to history
      if (auction) {
        auction.currentBid = amount
        auction.bidHistory = auction.bidHistory.map(bid =>
          bid.status === 'winning' ? { ...bid, status: 'outbid' } : bid
        )
        auction.bidHistory.push({ ...newBid, status: 'winning' })
        bids.value = auction.bidHistory
      }

      lastBidAttempt.value = new Date()
      
    } catch (error) {
      console.error('Failed to place bid:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Get auction bids
  const getAuctionBids = async (auctionId: string) => {
    try {
      const response = await ($fetch as any)(`/api/auctions/${auctionId}/bids`)
      return response.bids || []
    } catch (error) {
      console.error('Failed to get auction bids:', error)
      return []
    }
  }

  // Auto-bid functionality
  const enableAutoBid = (maxAmount: number) => {
    if (!auction.value || !authStore.user) return

    autoBidEnabled.value = true
    maxAutoBid.value = maxAmount

    // Subscribe to other bids for auto-bidding
    const unsubscribeAutoBid = on('bid_placed', async (data: AuctionEvent) => {
      if (data.auctionId !== auction.value?.id) return
      if (data.data.userId === authStore.user?.id) return
      if (!autoBidEnabled.value) return

      const newBid = data.data.amount
      const nextBid = newBid + (auction.value?.bidIncrement || 1)

      if (nextBid <= maxAutoBid.value && canBid.value) {
        try {
          await placeBid(auction.value.id, nextBid, { enableAutoBid: true, maxAutoBid: maxAutoBid.value })
        } catch (error) {
          console.warn('Auto-bid failed:', error)
        }
      }
    })

    // Store unsubscribe function for cleanup
    onUnmounted(unsubscribeAutoBid)
  }

  const disableAutoBid = () => {
    autoBidEnabled.value = false
    maxAutoBid.value = 0
  }

  // Watch/unwatch auction
  const toggleWatch = async () => {
    if (!auction.value || !authStore.user?.id) return
    
    try {
      isWatching.value = !isWatching.value
      
      // Update watchers list
      if (authStore.user?.id) {
        if (isWatching.value) {
          auction.value.watchers.push(authStore.user.id)
        } else {
          auction.value.watchers = auction.value.watchers.filter(
            id => id !== authStore.user!.id
          )
        }
      }
      
    } catch (err: any) {
      error.value = err.message
    }
  }

  // Subscribe to real-time auction updates
  const subscribe = (auctionId: string) => {
    // Basic subscription - implementation may vary based on WebSocket API
    try {
      send('subscribe', {
        channel: `auction:${auctionId}`
      })
    } catch (error) {
      console.warn('Failed to subscribe to auction updates:', error)
    }

    // Handle real-time events
    const unsubscribe = on('auction_update', (data: AuctionEvent) => {
      if (data.auctionId !== auctionId) return

      switch (data.type) {
        case 'bid_placed':
          // Add new bid to history
          const bidData = data.data
          bids.value.push(bidData)
          
          // Update auction current bid
          if (auction.value) {
            auction.value.currentBid = bidData.amount
          }
          break

        case 'auction_ended':
          if (auction.value) {
            auction.value.status = 'ended'
          }
          break

        case 'time_extended':
          if (auction.value) {
            auction.value.endTime = data.data.newEndTime
          }
          break
      }
    })

    // Cleanup on unmount
    onUnmounted(() => {
      unsubscribe()
      send('unsubscribe', {
        channel: `auction:${auctionId}`
      })
    })
  }

  // Timer countdown
  const startTimer = () => {
    const updateTimer = () => {
      if (!auction.value) return
      
      const endTime = new Date(auction.value.endTime).getTime()
      const now = Date.now()
      const remaining = Math.max(0, endTime - now)
      
      timeRemaining.value = remaining
      
      if (remaining === 0 && auction.value.status === 'live') {
        auction.value.status = 'ended'
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    onUnmounted(() => clearInterval(interval))
  }

  // Initialize auction if ID provided
  if (auctionId) {
    onMounted(() => {
      fetchAuction(auctionId)
      startTimer()
    })
  }

  // Watch for WebSocket connection
  watch(() => wsState.connected, (connected) => {
    if (connected && auctionId) {
      subscribe(auctionId)
    }
  })

  return {
    // State
    auction: readonly(auction),
    bids: readonly(bids),
    isLoading: readonly(isLoading),
    loading: readonly(loading),
    error: readonly(error),
    timeRemaining: readonly(timeRemaining),
    isWatching: readonly(isWatching),
    autoBidEnabled: readonly(autoBidEnabled),
    maxAutoBid: readonly(maxAutoBid),
    isBidding: readonly(isBidding),

    // Computed
    currentHighestBid: readonly(currentHighestBid),
    minimumBid: readonly(minimumBid),
    userHighestBid: readonly(userHighestBid),
    isUserWinning: readonly(isUserWinning),
    canBid: readonly(canBid),

    // Actions
    fetchAuction,
    placeBid,
    getAuctionBids,
    enableAutoBid,
    disableAutoBid,
    toggleWatch,
    subscribe,
    startTimer
  }
}
