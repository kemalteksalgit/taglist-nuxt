// composables/useInventory.ts
export interface InventoryItem {
  id: string
  productId: string
  quantity: number
  reserved: number
  sold: number
  available: number
  location?: string
  sku?: string
  lastUpdated: string
  version: number // For optimistic locking
}

export interface InventoryReservation {
  id: string
  productId: string
  userId: string
  quantity: number
  expiresAt: string
  status: 'active' | 'expired' | 'completed' | 'cancelled'
  createdAt: string
}

export interface InventoryOperation {
  type: 'reserve' | 'release' | 'purchase' | 'restock'
  productId: string
  quantity: number
  userId?: string
  reason?: string
  metadata?: Record<string, any>
}

export const useInventory = () => {
  const { $fetch } = useNuxtApp()
  const ws = useWebSocket()
  const { send, on } = ws

  // State
  const inventoryItems = ref<Map<string, InventoryItem>>(new Map())
  const reservations = ref<Map<string, InventoryReservation>>(new Map())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Real-time inventory updates
  on('inventory_updated', (data: { productId: string; inventory: InventoryItem }) => {
    inventoryItems.value.set(data.productId, data.inventory)
  })

  on('reservation_created', (data: InventoryReservation) => {
    reservations.value.set(data.id, data)
  })

  on('reservation_expired', (data: { reservationId: string }) => {
    const reservation = reservations.value.get(data.reservationId)
    if (reservation) {
      reservation.status = 'expired'
    }
  })

  // Get inventory for a product
  const getInventory = async (productId: string): Promise<InventoryItem | null> => {
    try {
      // Check cache first
      if (inventoryItems.value.has(productId)) {
        return inventoryItems.value.get(productId)!
      }

      const inventory = await ($fetch as any)(`/api/inventory/${productId}`)
      inventoryItems.value.set(productId, inventory)
      return inventory
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  // Check availability with buffer
  const checkAvailability = async (productId: string, requestedQuantity: number): Promise<boolean> => {
    const inventory = await getInventory(productId)
    if (!inventory) return false

    const available = inventory.quantity - inventory.reserved - inventory.sold
    return available >= requestedQuantity
  }

  // Purchase product
  const purchaseProduct = async (productId: string, quantity: number = 1) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await ($fetch as any)(`/api/inventory/${productId}/purchase`, {
        method: 'POST',
        body: {
          quantity
        }
      })

      // Update local inventory
      const currentInventory = inventoryItems.value.get(productId)
      if (currentInventory) {
        inventoryItems.value.set(productId, {
          ...currentInventory,
          available: currentInventory.available - quantity,
          sold: currentInventory.sold + quantity,
          lastUpdated: new Date().toISOString()
        })
      }

      return response
    } catch (err) {
      error.value = (err as Error).message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Get product activity
  const getProductActivity = async (productId: string) => {
    try {
      const response = await ($fetch as any)(`/api/products/${productId}/activity`)
      return response.activities || []
    } catch (err) {
      console.error('Failed to get product activity:', err)
      return []
    }
  }

  // Reserve inventory with race condition protection
  const reserveInventory = async (
    productId: string, 
    quantity: number, 
    userId: string,
    ttlMinutes: number = 15
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> => {
    isLoading.value = true
    error.value = null

    try {
      // Get current inventory with version for optimistic locking
      const inventory = await getInventory(productId)
      if (!inventory) {
        throw new Error('Product not found')
      }

      // Check availability
      const available = inventory.quantity - inventory.reserved - inventory.sold
      if (available < quantity) {
        return {
          success: false,
          error: `Only ${available} items available`
        }
      }

      // Attempt reservation via API with optimistic locking
      const result = await ($fetch as any)('/api/inventory/reserve', {
        method: 'POST',
        body: {
          productId,
          quantity,
          userId,
          ttlMinutes,
          version: inventory.version // For optimistic locking
        }
      })

      if (result.success) {
        // Update local cache
        const updatedInventory = { ...inventory }
        updatedInventory.reserved += quantity
        updatedInventory.available = updatedInventory.quantity - updatedInventory.reserved - updatedInventory.sold
        updatedInventory.version += 1
        inventoryItems.value.set(productId, updatedInventory)

        // Store reservation
        const reservation: InventoryReservation = {
          id: result.reservationId,
          productId,
          userId,
          quantity,
          expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
          status: 'active',
          createdAt: new Date().toISOString()
        }
        reservations.value.set(result.reservationId, reservation)

        // Set up auto-cleanup timer
        setTimeout(() => {
          const res = reservations.value.get(result.reservationId)
          if (res && res.status === 'active') {
            releaseReservation(result.reservationId)
          }
        }, ttlMinutes * 60 * 1000)

        return {
          success: true,
          reservationId: result.reservationId
        }
      } else {
        return {
          success: false,
          error: result.error || 'Reservation failed'
        }
      }

    } catch (err: any) {
      // Handle race condition errors
      if (err.code === 'INVENTORY_CONFLICT') {
        // Refresh inventory and retry once
        inventoryItems.value.delete(productId)
        const freshInventory = await getInventory(productId)
        
        if (freshInventory) {
          const available = freshInventory.quantity - freshInventory.reserved - freshInventory.sold
          if (available >= quantity) {
            // Retry once with fresh data
            return reserveInventory(productId, quantity, userId, ttlMinutes)
          }
        }
        
        return {
          success: false,
          error: 'Item no longer available due to concurrent purchase'
        }
      }

      error.value = err.message
      return {
        success: false,
        error: err.message
      }
    } finally {
      isLoading.value = false
    }
  }

  // Release reservation
  const releaseReservation = async (reservationId: string): Promise<boolean> => {
    try {
      const reservation = reservations.value.get(reservationId)
      if (!reservation || reservation.status !== 'active') {
        return false
      }

      const result = await ($fetch as any)(`/api/inventory/reservations/${reservationId}/release`, {
        method: 'POST'
      })

      if (result.success) {
        // Update reservation status
        reservation.status = 'cancelled'

        // Update inventory cache
        const inventory = inventoryItems.value.get(reservation.productId)
        if (inventory) {
          inventory.reserved -= reservation.quantity
          inventory.available = inventory.quantity - inventory.reserved - inventory.sold
          inventory.version += 1
        }

        return true
      }

      return false
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  // Complete purchase (convert reservation to sale)
  const completePurchase = async (
    reservationId: string,
    orderId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const reservation = reservations.value.get(reservationId)
      if (!reservation || reservation.status !== 'active') {
        return {
          success: false,
          error: 'Invalid or expired reservation'
        }
      }

      const result = await ($fetch as any)(`/api/inventory/reservations/${reservationId}/complete`, {
        method: 'POST',
        body: { orderId }
      })

      if (result.success) {
        // Update reservation
        reservation.status = 'completed'

        // Update inventory
        const inventory = inventoryItems.value.get(reservation.productId)
        if (inventory) {
          inventory.reserved -= reservation.quantity
          inventory.sold += reservation.quantity
          inventory.available = inventory.quantity - inventory.reserved - inventory.sold
          inventory.version += 1
        }

        return { success: true }
      }

      return {
        success: false,
        error: result.error || 'Purchase completion failed'
      }

    } catch (err: any) {
      error.value = err.message
      return {
        success: false,
        error: err.message
      }
    }
  }

  // Batch operations for multiple items
  const batchReserve = async (
    items: Array<{ productId: string; quantity: number }>,
    userId: string,
    ttlMinutes: number = 15
  ): Promise<{ 
    success: boolean; 
    reservations: Array<{ productId: string; reservationId?: string; error?: string }>
    allOrNothing?: boolean
  }> => {
    const results: Array<{ productId: string; reservationId?: string; error?: string }> = []
    const successful: string[] = []

    try {
      // First pass: check all availability
      for (const item of items) {
        const available = await checkAvailability(item.productId, item.quantity)
        if (!available) {
          // If any item is not available, fail the entire batch
          return {
            success: false,
            reservations: [{ 
              productId: item.productId, 
              error: 'Insufficient inventory for batch operation' 
            }],
            allOrNothing: true
          }
        }
      }

      // Second pass: reserve all items
      for (const item of items) {
        const result = await reserveInventory(item.productId, item.quantity, userId, ttlMinutes)
        
        if (result.success) {
          results.push({ 
            productId: item.productId, 
            reservationId: result.reservationId 
          })
          if (result.reservationId) {
            successful.push(result.reservationId)
          }
        } else {
          // Rollback all successful reservations
          for (const reservationId of successful) {
            await releaseReservation(reservationId)
          }
          
          return {
            success: false,
            reservations: [{ 
              productId: item.productId, 
              error: result.error 
            }]
          }
        }
      }

      return {
        success: true,
        reservations: results
      }

    } catch (err: any) {
      // Rollback any successful reservations
      for (const reservationId of successful) {
        await releaseReservation(reservationId)
      }

      return {
        success: false,
        reservations: [{ 
          productId: 'batch', 
          error: err.message 
        }]
      }
    }
  }

  // Real-time inventory monitoring
  const subscribeToInventoryUpdates = (productIds: string[]) => {
    send('subscribe_inventory', { productIds })
  }

  const unsubscribeFromInventoryUpdates = (productIds: string[]) => {
    send('unsubscribe_inventory', { productIds })
  }

  // Get user's active reservations
  const getUserReservations = (userId: string): InventoryReservation[] => {
    return Array.from(reservations.value.values())
      .filter(res => res.userId === userId && res.status === 'active')
  }

  // Cleanup expired reservations
  const cleanupExpiredReservations = () => {
    const now = new Date()
    
    for (const [id, reservation] of reservations.value.entries()) {
      if (reservation.status === 'active' && new Date(reservation.expiresAt) < now) {
        releaseReservation(id)
      }
    }
  }

  // Set up periodic cleanup
  if (process.client) {
    setInterval(cleanupExpiredReservations, 60000) // Every minute
  }

  return {
    // State
    inventoryItems: readonly(inventoryItems),
    reservations: readonly(reservations),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Methods
    getInventory,
    checkAvailability,
    purchaseProduct,
    getProductActivity,
    reserveInventory,
    releaseReservation,
    completePurchase,
    batchReserve,
    subscribeToInventoryUpdates,
    unsubscribeFromInventoryUpdates,
    getUserReservations,
    cleanupExpiredReservations
  }
}
