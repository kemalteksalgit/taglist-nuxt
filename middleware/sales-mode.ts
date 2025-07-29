// Sales Mode Enforcement Middleware
// Ensures auction features are only accessible during live streams

export default defineNuxtRouteMiddleware((to, from) => {
  // Check if user is trying to access standalone auction
  if (to.path === '/auction' || to.path.startsWith('/auction/')) {
    console.warn('🚫 Auction access blocked: Auctions only available during live streams')
    
    // Redirect to sales mode chooser with warning
    return navigateTo('/choose-sales-mode?warning=auction-blocked')
  }

  // Check for auction-related query parameters outside live context
  if (to.query.auction && !to.path.startsWith('/live')) {
    console.warn('🚫 Auction parameter blocked: Not in live context')
    
    // Remove auction parameter and redirect
    const cleanQuery = { ...to.query }
    delete cleanQuery.auction
    
    return navigateTo({
      path: to.path,
      query: cleanQuery
    })
  }

  // Enforce clean separation between modes
  const salesModePages = {
    shop: ['/shop'],
    live: ['/live', '/go-live'],
    explore: ['/explore', '/categories', '/search']
  }

  // Log current sales mode for debugging
  for (const [mode, paths] of Object.entries(salesModePages)) {
    if (paths.some(path => to.path.startsWith(path))) {
      console.log(`📍 User in ${mode} mode: ${to.path}`)
      break
    }
  }

  // Allow navigation
  return
})
