// Sales Mode Enforcement Plugin
// Globally enforces sales flow separation rules

export default defineNuxtPlugin(() => {
  const router = useRouter()
  
  // Global navigation guard
  router.beforeEach((to, from) => {
    // Block standalone auction access
    if (to.path === '/auction' || to.path.startsWith('/auction/')) {
      console.warn('🚫 AUCTION ACCESS BLOCKED: Auctions only available during live streams')
      
      // Show user-friendly error and redirect
      if (process.client) {
        alert('⚠️ Açık artırma sadece canlı yayın sırasında kullanılabilir!\n\nCanlı yayın sayfasına yönlendiriliyorsunuz.')
      }
      
      return navigateTo('/choose-sales-mode?error=auction-standalone-blocked')
    }

    // Block auction parameters outside live context
    if (to.query.auction && !to.path.startsWith('/live')) {
      console.warn('🚫 AUCTION PARAMETER BLOCKED: Not in live context')
      
      const cleanQuery = { ...to.query }
      delete cleanQuery.auction
      
      return navigateTo({
        path: to.path,
        query: cleanQuery
      })
    }

    // Log current sales mode for debugging/analytics
    const salesModes = {
      shop: ['/shop'],
      live: ['/live', '/go-live'],
      explore: ['/explore', '/categories', '/search'],
      chooser: ['/choose-sales-mode']
    }

    for (const [mode, paths] of Object.entries(salesModes)) {
      if (paths.some(path => to.path.startsWith(path))) {
        // Track mode switching analytics
        if (process.client && (window as any).gtag) {
          (window as any).gtag('event', 'sales_mode_switch', {
            mode: mode,
            path: to.path,
            from_path: from.path
          })
        }
        break
      }
    }

    return true
  })

  // Add global sales mode checker function
  return {
    provide: {
      checkSalesMode: (currentPath: string) => {
        const modes = {
          isShop: currentPath.startsWith('/shop'),
          isLive: currentPath.startsWith('/live'),
          isExplore: currentPath.startsWith('/explore'),
          canAuction: currentPath.startsWith('/live'), // Only in live streams
          mustChoose: currentPath === '/choose-sales-mode'
        }
        
        return modes
      },
      
      enforceAuctionRule: () => {
        const route = useRoute()
        if (!route.path.startsWith('/live')) {
          console.error('🚫 AUCTION ENFORCEMENT: Feature only available during live streams')
          return false
        }
        return true
      }
    }
  }
})
