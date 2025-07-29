// composables/useSEO.ts
export interface SEOOptions {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  locale?: string
  alternateLanguages?: Array<{ locale: string; url: string }>
  canonicalUrl?: string
  robots?: string
  jsonLd?: Record<string, any>
}

export const useSEO = (options: SEOOptions = {}) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  
  const defaultTitle = 'TagList - Türkiye\'nin En Güvenilir İkinci El Platformu'
  const defaultDescription = 'Türkiye\'nin en büyük ikinci el platformunda binlerce ürün sizi bekliyor. Güvenli, uygun fiyatlı ve çevre dostu alışveriş.'
  const defaultImage = `${config.public.siteUrl}/images/taglist-og.jpg`
  const currentUrl = `${config.public.siteUrl}${route.fullPath}`

  const seoData = reactive({
    title: options.title || defaultTitle,
    description: options.description || defaultDescription,
    keywords: options.keywords || 'ikinci el, alışveriş, pazaryeri, elektronik, mobilya, giyim, araç, türkiye',
    image: options.image || defaultImage,
    url: options.url || currentUrl,
    type: options.type || 'website',
    author: options.author || 'TagList Team',
    locale: options.locale || 'tr_TR',
    canonicalUrl: options.canonicalUrl || currentUrl,
    robots: options.robots || 'index, follow'
  })

  // Update document title
  const updateTitle = (newTitle: string, includeBase = true) => {
    const title = includeBase && newTitle !== defaultTitle 
      ? `${newTitle} - TagList` 
      : newTitle
    
    seoData.title = title
    useHead({ title })
  }

  // Update meta tags
  const updateMeta = () => {
    useHead({
      title: seoData.title,
      meta: [
        // Basic meta tags
        { name: 'description', content: seoData.description },
        { name: 'keywords', content: seoData.keywords },
        { name: 'author', content: seoData.author },
        { name: 'robots', content: seoData.robots },

        // Open Graph
        { property: 'og:title', content: seoData.title },
        { property: 'og:description', content: seoData.description },
        { property: 'og:image', content: seoData.image },
        { property: 'og:url', content: seoData.url },
        { property: 'og:type', content: seoData.type },
        { property: 'og:site_name', content: 'TagList' },
        { property: 'og:locale', content: seoData.locale },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@taglist_tr' },
        { name: 'twitter:creator', content: '@taglist_tr' },
        { name: 'twitter:title', content: seoData.title },
        { name: 'twitter:description', content: seoData.description },
        { name: 'twitter:image', content: seoData.image },

        // Additional meta tags
        { name: 'theme-color', content: '#3b82f6' },
        { name: 'msapplication-TileColor', content: '#3b82f6' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'canonical', href: seoData.canonicalUrl },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    })

    // Add alternate language links if provided
    if (options.alternateLanguages?.length) {
      const alternateLinks = options.alternateLanguages.map(alt => ({
        rel: 'alternate',
        hreflang: alt.locale,
        href: alt.url
      }))
      
      useHead({
        link: alternateLinks
      })
    }
  }

  // Generate JSON-LD structured data
  const generateJsonLd = (type: string, data: Record<string, any>) => {
    const baseJsonLd = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    }

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(baseJsonLd)
        }
      ]
    })
  }

  // Product-specific SEO
  const setProductSEO = (product: any) => {
    const productTitle = `${product.title} - ${product.price}₺`
    const productDescription = `${product.description.substring(0, 160)}... ${product.location.city}, ${product.location.district} konumunda satışta.`
    const productImage = product.images?.[0] || defaultImage
    
    updateTitle(productTitle)
    seoData.description = productDescription
    seoData.image = productImage
    seoData.type = 'product'
    seoData.keywords = `${product.title}, ${product.category}, ${product.brand || ''}, ikinci el, ${product.location.city}`
    
    updateMeta()

    // Product JSON-LD
    generateJsonLd('Product', {
      name: product.title,
      description: product.description,
      image: product.images,
      brand: product.brand || 'Belirsiz',
      category: product.category,
      condition: product.condition,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'TRY',
        availability: product.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Person',
          name: product.seller.name,
          address: {
            '@type': 'PostalAddress',
            addressLocality: product.location.city,
            addressCountry: 'TR'
          }
        }
      },
      aggregateRating: product.seller.rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.seller.rating,
        reviewCount: product.seller.reviewCount
      } : undefined
    })
  }

  // Category-specific SEO
  const setCategorySEO = (category: any, products: any[]) => {
    const categoryTitle = `${category.name} - İkinci El ${category.name} Ürünleri`
    const categoryDescription = `İkinci el ${category.name.toLowerCase()} ürünlerinde en uygun fiyatlar TagList'te. ${products.length}+ ürün arasından seçim yapın.`
    
    updateTitle(categoryTitle)
    seoData.description = categoryDescription
    seoData.keywords = `${category.name}, ikinci el ${category.name.toLowerCase()}, ${category.name.toLowerCase()} al sat`
    
    updateMeta()

    // Category JSON-LD
    generateJsonLd('CollectionPage', {
      name: categoryTitle,
      description: categoryDescription,
      url: seoData.url,
      numberOfItems: products.length,
      about: {
        '@type': 'Thing',
        name: category.name
      }
    })
  }

  // User profile SEO
  const setProfileSEO = (user: any) => {
    const profileTitle = `${user.fullName} - TagList Profili`
    const profileDescription = `${user.fullName} kullanıcısının TagList profili. ${user.stats.totalSales} satış, ${user.stats.rating} puan ortalaması.`
    
    updateTitle(profileTitle)
    seoData.description = profileDescription
    seoData.image = user.avatar || defaultImage
    seoData.type = 'profile'
    
    updateMeta()

    // Profile JSON-LD
    generateJsonLd('ProfilePage', {
      name: user.fullName,
      description: user.profile.bio || profileDescription,
      image: user.avatar,
      url: seoData.url,
      mainEntity: {
        '@type': 'Person',
        name: user.fullName,
        description: user.profile.bio,
        image: user.avatar,
        address: user.profile.location ? {
          '@type': 'PostalAddress',
          addressLocality: user.profile.location
        } : undefined
      }
    })
  }

  // Livestream SEO
  const setLivestreamSEO = (stream: any) => {
    const streamTitle = `🔴 ${stream.title} - Canlı Yayın`
    const streamDescription = `${stream.seller.name} tarafından yapılan canlı yayını izleyin. ${stream.products.length} ürün, ${stream.viewers} izleyici.`
    
    updateTitle(streamTitle)
    seoData.description = streamDescription
    seoData.image = stream.thumbnail
    seoData.type = 'article'
    seoData.keywords = `canlı yayın, ${stream.seller.name}, online alışveriş, canlı satış`
    
    updateMeta()

    // Livestream JSON-LD
    generateJsonLd('VideoObject', {
      name: stream.title,
      description: stream.description,
      thumbnailUrl: stream.thumbnail,
      uploadDate: stream.startTime,
      duration: stream.endTime ? `PT${Math.floor((new Date(stream.endTime).getTime() - new Date(stream.startTime).getTime()) / 1000)}S` : undefined,
      embedUrl: `${config.public.siteUrl}/livestream/${stream.id}`,
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WatchAction',
          userInteractionCount: stream.viewers
        }
      ]
    })
  }

  // Search results SEO
  const setSearchSEO = (query: string, resultCount: number) => {
    const searchTitle = `"${query}" Arama Sonuçları`
    const searchDescription = `"${query}" aramanız için ${resultCount} sonuç bulundu. En uygun fiyatlı ikinci el ürünleri TagList'te keşfedin.`
    
    updateTitle(searchTitle)
    seoData.description = searchDescription
    seoData.keywords = `${query}, ikinci el, arama, ${query} al sat`
    
    updateMeta()
  }

  // Initialize SEO
  updateMeta()

  // Custom JSON-LD for homepage
  if (route.path === '/') {
    generateJsonLd('WebSite', {
      name: 'TagList',
      description: defaultDescription,
      url: config.public.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${config.public.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      },
      sameAs: [
        'https://facebook.com/taglist',
        'https://twitter.com/taglist_tr',
        'https://instagram.com/taglist_tr'
      ]
    })

    // Organization JSON-LD
    generateJsonLd('Organization', {
      name: 'TagList',
      description: 'Türkiye\'nin en güvenilir ikinci el eşya alım-satım platformu',
      url: config.public.siteUrl,
      logo: `${config.public.siteUrl}/images/logo.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+90-850-123-4567',
        contactType: 'customer service',
        availableLanguage: 'Turkish'
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'TR',
        addressLocality: 'İstanbul'
      }
    })
  }

  return {
    seoData: readonly(seoData),
    updateTitle,
    updateMeta,
    generateJsonLd,
    setProductSEO,
    setCategorySEO,
    setProfileSEO,
    setLivestreamSEO,
    setSearchSEO
  }
}
