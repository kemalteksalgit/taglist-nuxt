// services/SearchService.ts
// AI Smart Search with Semantic + Typo Tolerance
// Hybrid scoring: 0.5*BM25 + 0.5*cosine similarity

export interface SearchProduct {
  id: string
  title: string
  brand: string
  tags: string[]
  category: string
  description: string
  price: number
  media: string[]
  popularity: number
  embedding?: number[]
}

export interface SearchQuery {
  q: string
  limit?: number
  offset?: number
  category?: string
  priceRange?: { min: number; max: number }
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'popularity'
}

export interface SearchResult {
  products: SearchProduct[]
  total: number
  query: string
  suggestions?: string[]
  facets?: {
    categories: Array<{ name: string; count: number }>
    brands: Array<{ name: string; count: number }>
    priceRanges: Array<{ range: string; count: number }>
  }
  timing?: {
    total: number
    embedding: number
    search: number
  }
}

export interface SearchStats {
  totalQueries: number
  averageLatency: number
  p95Latency: number
  ctr: number
  noResultsRate: number
}

// Simulated embedding service (would use actual model in production)
export class EmbeddingService {
  private static instance: EmbeddingService
  private embeddingCache = new Map<string, number[]>()

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService()
    }
    return EmbeddingService.instance
  }

  // Mock embedding generation (would use e5-small or similar in production)
  async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = text.toLowerCase().trim()
    
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!
    }

    // Simulate embedding generation delay
    await new Promise(resolve => setTimeout(resolve, 10))

    // Generate deterministic mock embedding based on text content
    const embedding = this.textToEmbedding(text)
    this.embeddingCache.set(cacheKey, embedding)
    return embedding
  }

  private textToEmbedding(text: string): number[] {
    // Simple deterministic embedding based on character frequencies
    // In production, this would be replaced with actual model inference
    const embedding = new Array(384).fill(0) // e5-small dimension
    const words = text.toLowerCase().split(/\W+/)
    
    words.forEach((word, index) => {
      for (let i = 0; i < word.length && i < embedding.length; i++) {
        const charCode = word.charCodeAt(i)
        embedding[i] += Math.sin(charCode * (index + 1)) * 0.1
      }
    })

    // Normalize vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0)
  }

  // Calculate cosine similarity between embeddings
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      const aVal = a[i]!
      const bVal = b[i]!
      dotProduct += aVal * bVal
      normA += aVal * aVal
      normB += bVal * bVal
    }

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

// Fuzzy string matching for typo tolerance
export class FuzzyMatcher {
  // Levenshtein distance with maximum edit distance of 2
  static editDistance(a: string, b: string, maxDistance: number = 2): number {
    if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

    const matrix: number[][] = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0))
    
    for (let i = 0; i <= a.length; i++) {
      matrix[i]![0] = i
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0]![j] = j
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i]![j] = matrix[i - 1]![j - 1]!
        } else {
          matrix[i]![j] = Math.min(
            matrix[i - 1]![j]! + 1,     // deletion
            matrix[i]![j - 1]! + 1,     // insertion
            matrix[i - 1]![j - 1]! + 1  // substitution
          )
        }
        
        // Early termination if distance exceeds threshold
        if (matrix[i]![j]! > maxDistance) {
          return maxDistance + 1
        }
      }
    }

    return matrix[a.length]![b.length]!
  }

  // Calculate fuzzy similarity score (0-1)
  static fuzzySimilarity(query: string, target: string): number {
    const maxLen = Math.max(query.length, target.length)
    if (maxLen === 0) return 1

    const distance = this.editDistance(query.toLowerCase(), target.toLowerCase())
    return Math.max(0, 1 - distance / maxLen)
  }

  // Find best fuzzy matches in a list of terms
  static findBestMatches(query: string, terms: string[], threshold: number = 0.6): Array<{term: string, score: number}> {
    return terms
      .map(term => ({
        term,
        score: this.fuzzySimilarity(query, term)
      }))
      .filter(match => match.score >= threshold)
      .sort((a, b) => b.score - a.score)
  }
}

// BM25 scoring implementation
export class BM25Scorer {
  private k1: number = 1.5
  private b: number = 0.75
  private avgDocLength: number = 0
  private docFrequencies = new Map<string, number>()
  private totalDocs: number = 0

  constructor(documents: SearchProduct[]) {
    this.buildIndex(documents)
  }

  private buildIndex(documents: SearchProduct[]): void {
    this.totalDocs = documents.length
    const docLengths: number[] = []
    const termDocCounts = new Map<string, number>()

    // Build document frequencies
    documents.forEach(doc => {
      const text = `${doc.title} ${doc.brand} ${doc.description} ${doc.tags.join(' ')}`
      const words = this.tokenize(text)
      const uniqueWords = new Set(words)
      
      docLengths.push(words.length)
      
      uniqueWords.forEach(word => {
        termDocCounts.set(word, (termDocCounts.get(word) || 0) + 1)
      })
    })

    // Calculate average document length
    this.avgDocLength = docLengths.reduce((sum, len) => sum + len, 0) / docLengths.length

    // Store document frequencies
    this.docFrequencies = termDocCounts
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
  }

  // Calculate BM25 score for a document given a query
  score(query: string, document: SearchProduct): number {
    const queryTerms = this.tokenize(query)
    const docText = `${document.title} ${document.brand} ${document.description} ${document.tags.join(' ')}`
    const docTerms = this.tokenize(docText)
    const docLength = docTerms.length

    // Count term frequencies in document
    const termFreqs = new Map<string, number>()
    docTerms.forEach(term => {
      termFreqs.set(term, (termFreqs.get(term) || 0) + 1)
    })

    let score = 0

    queryTerms.forEach(term => {
      const tf = termFreqs.get(term) || 0
      const df = this.docFrequencies.get(term) || 0
      
      if (tf > 0 && df > 0) {
        const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5))
        const tfComponent = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength)))
        score += idf * tfComponent
      }
    })

    return score
  }
}

// Main search service
export class SearchService {
  private products: SearchProduct[] = []
  private bm25Scorer?: BM25Scorer
  private embeddingService: EmbeddingService
  private queryStats: SearchStats = {
    totalQueries: 0,
    averageLatency: 0,
    p95Latency: 0,
    ctr: 0,
    noResultsRate: 0
  }
  private latencyHistory: number[] = []

  constructor() {
    this.embeddingService = EmbeddingService.getInstance()
    this.initializeMockData()
  }

  // Initialize with mock product data (would load from actual database)
  private async initializeMockData(): Promise<void> {
    this.products = [
      {
        id: '1',
        title: 'iPhone 15 Pro Max',
        brand: 'Apple',
        tags: ['phone', 'smartphone', 'ios', 'premium'],
        category: 'Electronics',
        description: 'Latest iPhone with A17 Pro chip and titanium design',
        price: 59999,
        media: ['iphone15pro.jpg'],
        popularity: 95,
        embedding: await this.embeddingService.generateEmbedding('iPhone 15 Pro Max Apple smartphone premium')
      },
      {
        id: '2',
        title: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        tags: ['phone', 'android', 'galaxy', 'premium'],
        category: 'Electronics',
        description: 'Premium Android phone with S Pen and AI features',
        price: 54999,
        media: ['galaxys24.jpg'],
        popularity: 88,
        embedding: await this.embeddingService.generateEmbedding('Samsung Galaxy S24 Ultra Android phone premium')
      },
      {
        id: '3',
        title: 'MacBook Air M3',
        brand: 'Apple',
        tags: ['laptop', 'macbook', 'apple', 'ultrabook'],
        category: 'Computers',
        description: 'Lightweight laptop with M3 chip and all-day battery',
        price: 44999,
        media: ['macbookair.jpg'],
        popularity: 92,
        embedding: await this.embeddingService.generateEmbedding('MacBook Air M3 Apple laptop ultrabook')
      },
      {
        id: '4',
        title: 'Nike Air Jordan 1',
        brand: 'Nike',
        tags: ['shoes', 'sneakers', 'basketball', 'retro'],
        category: 'Fashion',
        description: 'Classic basketball sneakers with premium leather',
        price: 899,
        media: ['airjordan1.jpg'],
        popularity: 85,
        embedding: await this.embeddingService.generateEmbedding('Nike Air Jordan 1 shoes sneakers basketball')
      },
      {
        id: '5',
        title: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        tags: ['shoes', 'running', 'boost', 'comfort'],
        category: 'Fashion',
        description: 'Premium running shoes with Boost cushioning',
        price: 749,
        media: ['ultraboost.jpg'],
        popularity: 78,
        embedding: await this.embeddingService.generateEmbedding('Adidas Ultraboost 22 running shoes comfort')
      }
    ]

    // Build BM25 index after products are loaded
    this.bm25Scorer = new BM25Scorer(this.products)
  }

  // Main search method with hybrid scoring
  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = performance.now()
    
    try {
      // Generate query embedding
      const embeddingStart = performance.now()
      const queryEmbedding = await this.embeddingService.generateEmbedding(query.q)
      const embeddingTime = performance.now() - embeddingStart

      // Perform hybrid search
      const searchStart = performance.now()
      const results = await this.performHybridSearch(query, queryEmbedding)
      const searchTime = performance.now() - searchStart

      const totalTime = performance.now() - startTime

      // Update statistics
      this.updateStats(totalTime, results.products.length === 0)

      return {
        ...results,
        timing: {
          total: totalTime,
          embedding: embeddingTime,
          search: searchTime
        }
      }
    } catch (error) {
      this.updateStats(performance.now() - startTime, true)
      throw error
    }
  }

  private async performHybridSearch(query: SearchQuery, queryEmbedding: number[]): Promise<SearchResult> {
    if (!this.bm25Scorer) {
      throw new Error('Search index not initialized')
    }

    // Score all products with hybrid approach
    const scoredProducts = this.products.map(product => {
      // BM25 score (traditional text search)
      const bm25Score = this.bm25Scorer!.score(query.q, product)
      
      // Semantic similarity score
      const semanticScore = product.embedding 
        ? this.embeddingService.cosineSimilarity(queryEmbedding, product.embedding)
        : 0

      // Fuzzy matching for typo tolerance
      const fuzzyScores = [
        FuzzyMatcher.fuzzySimilarity(query.q, product.title),
        FuzzyMatcher.fuzzySimilarity(query.q, product.brand),
        ...product.tags.map(tag => FuzzyMatcher.fuzzySimilarity(query.q, tag))
      ]
      const maxFuzzyScore = Math.max(...fuzzyScores)

      // Hybrid score: 0.5*BM25 + 0.3*semantic + 0.2*fuzzy
      const hybridScore = (bm25Score * 0.5) + (semanticScore * 0.3) + (maxFuzzyScore * 0.2)

      // Boost by popularity
      const popularityBoost = 1 + (product.popularity / 100) * 0.1

      return {
        ...product,
        score: hybridScore * popularityBoost,
        bm25Score,
        semanticScore,
        fuzzyScore: maxFuzzyScore
      }
    })

    // Filter by category if specified
    const filteredProducts = query.category
      ? scoredProducts.filter(p => p.category.toLowerCase() === query.category!.toLowerCase())
      : scoredProducts

    // Filter by price range if specified
    const priceFilteredProducts = query.priceRange
      ? filteredProducts.filter(p => 
          p.price >= query.priceRange!.min && p.price <= query.priceRange!.max
        )
      : filteredProducts

    // Sort by relevance or specified criteria
    const sortedProducts = this.sortProducts(priceFilteredProducts, query.sortBy || 'relevance')

    // Apply pagination
    const offset = query.offset || 0
    const limit = query.limit || 20
    const paginatedProducts = sortedProducts.slice(offset, offset + limit)

    // Generate suggestions for typos
    const suggestions = this.generateSuggestions(query.q)

    // Generate facets
    const facets = this.generateFacets(filteredProducts)

    return {
      products: paginatedProducts.map(p => {
        const { score, bm25Score, semanticScore, fuzzyScore, ...product } = p
        return product
      }),
      total: sortedProducts.length,
      query: query.q,
      suggestions,
      facets
    }
  }

  private sortProducts(products: any[], sortBy: string): any[] {
    switch (sortBy) {
      case 'price_low':
        return products.sort((a, b) => a.price - b.price)
      case 'price_high':
        return products.sort((a, b) => b.price - a.price)
      case 'popularity':
        return products.sort((a, b) => b.popularity - a.popularity)
      case 'relevance':
      default:
        return products.sort((a, b) => b.score - a.score)
    }
  }

  private generateSuggestions(query: string): string[] {
    // Find potential typo corrections
    const allTerms = new Set<string>()
    this.products.forEach(product => {
      allTerms.add(product.title)
      allTerms.add(product.brand)
      product.tags.forEach(tag => allTerms.add(tag))
    })

    const suggestions = FuzzyMatcher.findBestMatches(
      query, 
      Array.from(allTerms), 
      0.5
    ).slice(0, 3).map(match => match.term)

    return suggestions
  }

  private generateFacets(products: any[]): SearchResult['facets'] {
    const categories = new Map<string, number>()
    const brands = new Map<string, number>()
    const priceRanges = new Map<string, number>()

    products.forEach(product => {
      // Count categories
      categories.set(product.category, (categories.get(product.category) || 0) + 1)
      
      // Count brands
      brands.set(product.brand, (brands.get(product.brand) || 0) + 1)
      
      // Count price ranges
      const priceRange = this.getPriceRange(product.price)
      priceRanges.set(priceRange, (priceRanges.get(priceRange) || 0) + 1)
    })

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      brands: Array.from(brands.entries()).map(([name, count]) => ({ name, count })),
      priceRanges: Array.from(priceRanges.entries()).map(([range, count]) => ({ range, count }))
    }
  }

  private getPriceRange(price: number): string {
    if (price < 100) return '0-100₺'
    if (price < 500) return '100-500₺'
    if (price < 1000) return '500-1000₺'
    if (price < 5000) return '1000-5000₺'
    if (price < 10000) return '5000-10000₺'
    return '10000₺+'
  }

  private updateStats(latency: number, noResults: boolean): void {
    this.queryStats.totalQueries++
    
    // Update latency tracking
    this.latencyHistory.push(latency)
    if (this.latencyHistory.length > 1000) {
      this.latencyHistory.shift() // Keep only last 1000 queries
    }

    // Update average latency
    this.queryStats.averageLatency = this.latencyHistory.reduce((sum, lat) => sum + lat, 0) / this.latencyHistory.length

    // Update P95 latency
    const sortedLatencies = [...this.latencyHistory].sort((a, b) => a - b)
    const p95Index = Math.floor(sortedLatencies.length * 0.95)
    this.queryStats.p95Latency = sortedLatencies[p95Index] || 0

    // Update no results rate
    if (noResults) {
      this.queryStats.noResultsRate = (this.queryStats.noResultsRate * (this.queryStats.totalQueries - 1) + 1) / this.queryStats.totalQueries
    } else {
      this.queryStats.noResultsRate = (this.queryStats.noResultsRate * (this.queryStats.totalQueries - 1)) / this.queryStats.totalQueries
    }
  }

  // Get search performance statistics
  getStats(): SearchStats {
    return { ...this.queryStats }
  }

  // Add products to search index (for dynamic updates)
  async addProduct(product: Omit<SearchProduct, 'embedding'>): Promise<void> {
    const productWithEmbedding = {
      ...product,
      embedding: await this.embeddingService.generateEmbedding(
        `${product.title} ${product.brand} ${product.description} ${product.tags.join(' ')}`
      )
    }

    this.products.push(productWithEmbedding)
    
    // Rebuild BM25 index
    this.bm25Scorer = new BM25Scorer(this.products)
  }

  // Remove product from search index
  removeProduct(productId: string): void {
    this.products = this.products.filter(p => p.id !== productId)
    
    // Rebuild BM25 index
    this.bm25Scorer = new BM25Scorer(this.products)
  }
}

// Export singleton instance
export const searchService = new SearchService()

export default SearchService
