// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: true,
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxt/image'
  ],
  
  // App configuration
  app: {
    head: {
      title: 'TagList - Türkiye\'nin En Güvenilir İkinci El Platformu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Türkiye\'nin en güvenilir ikinci el eşya alım-satım platformu. Elektronik, vasıta, giyim ve daha fazlası!' },
        { name: 'keywords', content: 'ikinci el, alım satım, elektronik, araba, telefon, bilgisayar, giyim' },
        { name: 'author', content: 'TagList Team' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'TagList' },
        { property: 'og:locale', content: 'tr_TR' },
        { name: 'twitter:site', content: '@taglist_tr' },
        { name: 'twitter:creator', content: '@taglist_tr' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' }
      ]
    }
  },
  
  // Google Fonts
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700, 800]
    },
    display: 'swap',
    preload: true
  },
  
  // CSS Configuration
  css: [
    '~/assets/css/main.css'
  ],
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },
  
  // Performance optimizations
  nitro: {
    compressPublicAssets: true,
    minify: true
  },
  
  // Build optimizations
  build: {
    transpile: ['@nuxt/icon']
  },
  
  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    apiSecret: process.env.NUXT_API_SECRET,
    
    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://taglist.com.tr',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'wss://ws.taglist.com.tr'
    }
  },
  
  // Vite configuration
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router'],
            'livestream': ['~/components/LivestreamViewer.vue', '~/components/modals/LivestreamGiftModal.vue', '~/components/modals/LivestreamBidModal.vue', '~/components/modals/LivestreamPurchaseModal.vue']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  },
  
  // Experimental features
  experimental: {
    payloadExtraction: false,
    viewTransition: true
  }
})
