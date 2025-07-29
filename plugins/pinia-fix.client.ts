// Pinia Store Plugin - Fix for hasOwnProperty error
// This plugin ensures proper object serialization and hydration

import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  // Fix for Pinia hydration errors
  const pinia = nuxtApp.$pinia as Pinia
  
  if (process.client && pinia) {
    // Client-side hydration fixes
    nuxtApp.hook('app:created', () => {
      try {
        // Ensure all store objects have proper prototype
        Object.keys(pinia.state.value).forEach(storeId => {
          const storeState = pinia.state.value[storeId]
          if (storeState && typeof storeState === 'object') {
            // Fix objects that lack hasOwnProperty
            fixObjectPrototype(storeState)
          }
        })
      } catch (error) {
        console.warn('Pinia state fix failed:', error)
      }
    })
  }
})

// Recursively fix objects that don't have hasOwnProperty
function fixObjectPrototype(obj: any): void {
  if (!obj || typeof obj !== 'object') return
  
  // If object doesn't have hasOwnProperty, recreate it with proper prototype
  if (!obj.hasOwnProperty) {
    try {
      const keys = Object.keys(obj)
      const fixed: Record<string, any> = {}
      keys.forEach(key => {
        fixed[key] = obj[key]
      })
      Object.assign(obj, fixed)
      Object.setPrototypeOf(obj, Object.prototype)
    } catch (error) {
      console.warn('Failed to fix object prototype:', error)
    }
  }
  
  // Recursively fix nested objects
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      fixObjectPrototype(obj[key])
    }
  })
}
