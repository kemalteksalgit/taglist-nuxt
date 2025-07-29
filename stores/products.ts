// stores/products.ts
import { defineStore } from 'pinia'

export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory?: string
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
  brand?: string
  location: {
    city: string
    district: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  seller: {
    id: string
    name: string
    avatar?: string
    rating: number
    reviewCount: number
    isVerified: boolean
    responseTime: string
  }
  specifications?: Record<string, string>
  tags: string[]
  status: 'active' | 'sold' | 'inactive' | 'pending'
  views: number
  likes: number
  isLiked: boolean
  isFavorited: boolean
  deliveryOptions: ('pickup' | 'shipping' | 'both')[]
  shippingPrice?: number
  isNegotiable: boolean
  createdAt: string
  updatedAt: string
  expiresAt?: string
  isPromoted: boolean
  isUrgent: boolean
  stats: {
    impressions: number
    clicks: number
    messages: number
  }
}

export interface ProductFilters {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  condition?: string[]
  location?: string
  brand?: string
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular' | 'nearest'
  search?: string
  isPromoted?: boolean
  deliveryOptions?: string[]
}

export interface ProductsState {
  products: Product[]
  favorites: Product[]
  myProducts: Product[]
  searchResults: Product[]
  featuredProducts: Product[]
  isLoading: boolean
  error: string | null
  filters: ProductFilters
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  categories: Array<{
    id: string
    name: string
    icon: string
    count: number
    subcategories: Array<{
      id: string
      name: string
      count: number
    }>
  }>
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    favorites: [],
    myProducts: [],
    searchResults: [],
    featuredProducts: [],
    isLoading: false,
    error: null,
    filters: {},
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: true
    },
    categories: [
      {
        id: 'electronics',
        name: 'Elektronik',
        icon: 'mdi:laptop',
        count: 1250,
        subcategories: [
          { id: 'phones', name: 'Cep Telefonu', count: 450 },
          { id: 'computers', name: 'Bilgisayar', count: 320 },
          { id: 'tablets', name: 'Tablet', count: 180 },
          { id: 'audio', name: 'Ses Sistemleri', count: 200 },
          { id: 'gaming', name: 'Oyun Konsolları', count: 100 }
        ]
      },
      {
        id: 'vehicles',
        name: 'Vasıta',
        icon: 'mdi:car',
        count: 890,
        subcategories: [
          { id: 'cars', name: 'Otomobil', count: 650 },
          { id: 'motorcycles', name: 'Motosiklet', count: 120 },
          { id: 'trucks', name: 'Ticari Araçlar', count: 80 },
          { id: 'boats', name: 'Deniz Araçları', count: 40 }
        ]
      },
      {
        id: 'fashion',
        name: 'Moda & Giyim',
        icon: 'mdi:tshirt-crew',
        count: 760,
        subcategories: [
          { id: 'women-clothing', name: 'Kadın Giyim', count: 350 },
          { id: 'men-clothing', name: 'Erkek Giyim', count: 250 },
          { id: 'shoes', name: 'Ayakkabı', count: 160 }
        ]
      },
      {
        id: 'home',
        name: 'Ev & Bahçe',
        icon: 'mdi:home',
        count: 580,
        subcategories: [
          { id: 'furniture', name: 'Mobilya', count: 280 },
          { id: 'decoration', name: 'Dekorasyon', count: 150 },
          { id: 'garden', name: 'Bahçe', count: 150 }
        ]
      }
    ]
  }),

  getters: {
    filteredProducts: (state) => {
      let products = [...state.products]

      // Apply filters
      if (state.filters.category) {
        products = products.filter(p => p.category === state.filters.category)
      }

      if (state.filters.minPrice !== undefined) {
        products = products.filter(p => p.price >= state.filters.minPrice!)
      }

      if (state.filters.maxPrice !== undefined) {
        products = products.filter(p => p.price <= state.filters.maxPrice!)
      }

      if (state.filters.condition?.length) {
        products = products.filter(p => state.filters.condition!.includes(p.condition))
      }

      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase()
        products = products.filter(p => 
          p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      }

      // Apply sorting
      switch (state.filters.sortBy) {
        case 'price-low':
          products.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          products.sort((a, b) => b.price - a.price)
          break
        case 'popular':
          products.sort((a, b) => b.views - a.views)
          break
        case 'oldest':
          products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        default: // newest
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      return products
    },

    favoriteProducts: (state) => state.favorites,

    totalFavorites: (state) => state.favorites.length,

    categoryProducts: (state) => (categoryId: string) => {
      return state.products.filter(p => p.category === categoryId)
    },

    productById: (state) => (id: string) => {
      return state.products.find(p => p.id === id) || 
             state.featuredProducts.find(p => p.id === id) ||
             state.myProducts.find(p => p.id === id)
    }
  },

  actions: {
    // Fetch products
    async fetchProducts(filters?: ProductFilters) {
      this.isLoading = true
      this.error = null

      try {
        // Apply filters
        if (filters) {
          this.filters = { ...this.filters, ...filters }
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))

        // Mock products data
        const mockProducts: Product[] = Array.from({ length: 20 }, (_, i) => {
          const titles = [
            'iPhone 14 Pro Max 256GB Uzay Grisi',
            'MacBook Pro M2 13" 8GB 256GB',
            'Samsung Galaxy S23 Ultra 512GB',
            'AirPods Pro 2. Nesil',
            'iPad Air 5. Nesil 64GB Wi-Fi',
            'PlayStation 5 Digital Edition',
            'Nintendo Switch OLED Model',
            'Apple Watch Series 8 45mm',
            'Sony WH-1000XM5 Kulaklık',
            'Dyson V15 Detect Süpürge'
          ]
          const categories = ['electronics', 'vehicles', 'fashion', 'home']
          const conditions: Array<'new' | 'like-new' | 'good' | 'fair' | 'poor'> = ['new', 'like-new', 'good', 'fair', 'new']
          const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya']
          const districts = ['Kadıköy', 'Beşiktaş', 'Şişli', 'Ümraniye']
          
          return {
            id: `product-${i + 1}`,
            title: titles[i % titles.length] || `Ürün ${i + 1}`,
            description: 'Mükemmel durumda, orijinal kutusu ile birlikte. Hiç hasar yok, temiz kullanım.',
            price: Math.floor(Math.random() * 50000) + 1000,
            originalPrice: Math.floor(Math.random() * 60000) + 1200,
            images: [
              `https://images.unsplash.com/photo-${1560472354 + i}?w=400`,
              `https://images.unsplash.com/photo-${1560472355 + i}?w=400`
            ],
            category: categories[i % categories.length] || 'electronics',
            condition: conditions[i % conditions.length] || 'good',
            location: {
              city: cities[i % cities.length] || 'İstanbul',
              district: districts[i % districts.length] || 'Kadıköy'
            },
            seller: {
              id: `seller-${i + 1}`,
              name: ['Ahmet Y.', 'Mehmet K.', 'Ayşe S.', 'Fatma T.'][i % 4] || 'Satıcı',
              rating: 4 + Math.random(),
              reviewCount: Math.floor(Math.random() * 100) + 10,
              isVerified: Math.random() > 0.3,
              responseTime: ['1 saat içinde', '2 saat içinde', '1 gün içinde'][i % 3] || '1 saat içinde'
            },
            tags: ['temiz', 'orijinal', 'garantili', 'acil'],
            status: 'active',
            views: Math.floor(Math.random() * 1000) + 50,
            likes: Math.floor(Math.random() * 100) + 5,
            isLiked: Math.random() > 0.7,
            isFavorited: Math.random() > 0.8,
            deliveryOptions: ['pickup', 'shipping'] as any,
            shippingPrice: Math.floor(Math.random() * 50) + 10,
            isNegotiable: Math.random() > 0.5,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            isPromoted: Math.random() > 0.8,
            isUrgent: Math.random() > 0.9,
            stats: {
              impressions: Math.floor(Math.random() * 5000) + 100,
              clicks: Math.floor(Math.random() * 500) + 10,
              messages: Math.floor(Math.random() * 50) + 1
            }
          }
        })

        this.products = mockProducts
        this.pagination.total = 200 // Mock total
        this.pagination.hasMore = this.pagination.page * this.pagination.limit < this.pagination.total

      } catch (error) {
        this.error = 'Ürünler yüklenirken hata oluştu'
        console.error('Fetch products error:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Fetch featured products
    async fetchFeaturedProducts() {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        // Take first 8 products as featured
        this.featuredProducts = this.products.slice(0, 8)
      } catch (error) {
        console.error('Fetch featured products error:', error)
      }
    },

    // Search products
    async searchProducts(query: string) {
      this.isLoading = true
      this.filters.search = query

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600))

        this.searchResults = this.filteredProducts.slice(0, 10)
      } catch (error) {
        this.error = 'Arama sırasında hata oluştu'
      } finally {
        this.isLoading = false
      }
    },

    // Toggle favorite
    async toggleFavorite(productId: string) {
      const product = this.productById(productId)
      if (!product) return

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300))

        const isFavorited = this.favorites.some(p => p.id === productId)
        
        if (isFavorited) {
          this.favorites = this.favorites.filter(p => p.id !== productId)
          product.isFavorited = false
        } else {
          this.favorites.push(product)
          product.isFavorited = true
        }

      } catch (error) {
        console.error('Toggle favorite error:', error)
      }
    },

    // Toggle like
    async toggleLike(productId: string) {
      const product = this.productById(productId)
      if (!product) return

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200))

        if (product.isLiked) {
          product.likes--
          product.isLiked = false
        } else {
          product.likes++
          product.isLiked = true
        }

      } catch (error) {
        console.error('Toggle like error:', error)
      }
    },

    // Update filters
    updateFilters(newFilters: Partial<ProductFilters>) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.page = 1 // Reset to first page
    },

    // Clear filters
    clearFilters() {
      this.filters = {}
      this.pagination.page = 1
    },

    // Load more products
    async loadMore() {
      if (!this.pagination.hasMore || this.isLoading) return

      this.pagination.page++
      await this.fetchProducts()
    },

    // Create new product
    async createProduct(productData: Partial<Product>) {
      this.isLoading = true

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const newProduct: Product = {
          id: Date.now().toString(),
          title: productData.title || '',
          description: productData.description || '',
          price: productData.price || 0,
          images: productData.images || [],
          category: productData.category || '',
          condition: productData.condition || 'good',
          location: productData.location || { city: '', district: '' },
          seller: {
            id: 'current-user',
            name: 'Ben',
            rating: 0,
            reviewCount: 0,
            isVerified: false,
            responseTime: '1 gün içinde'
          },
          tags: productData.tags || [],
          status: 'active',
          views: 0,
          likes: 0,
          isLiked: false,
          isFavorited: false,
          deliveryOptions: productData.deliveryOptions || ['pickup'],
          isNegotiable: productData.isNegotiable || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPromoted: false,
          isUrgent: false,
          stats: {
            impressions: 0,
            clicks: 0,
            messages: 0
          }
        }

        this.myProducts.unshift(newProduct)
        return { success: true, product: newProduct }

      } catch (error) {
        this.error = 'Ürün oluşturulurken hata oluştu'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Update product
    async updateProduct(productId: string, updates: Partial<Product>) {
      try {
        const productIndex = this.myProducts.findIndex(p => p.id === productId)
        if (productIndex !== -1) {
          const currentProduct = this.myProducts[productIndex]
          const updatedProduct = { ...currentProduct, ...updates } as Product
          this.myProducts[productIndex] = updatedProduct
          return { success: true }
        }
        return { success: false, error: 'Ürün bulunamadı' }
      } catch (error) {
        return { success: false, error: 'Ürün güncellenirken hata oluştu' }
      }
    },

    // Delete product
    async deleteProduct(productId: string) {
      try {
        this.myProducts = this.myProducts.filter(p => p.id !== productId)
        return { success: true }
      } catch (error) {
        return { success: false, error: 'Ürün silinirken hata oluştu' }
      }
    }
  }
})
