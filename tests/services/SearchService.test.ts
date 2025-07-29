// tests/services/SearchService.test.ts
// Comprehensive test suite for AI Smart Search functionality

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SearchService, EmbeddingService, FuzzyMatcher, BM25Scorer } from '~/services/SearchService'

describe('SearchService', () => {
  let searchService: SearchService

  beforeEach(() => {
    searchService = new SearchService()
  })

  describe('Basic Search Functionality', () => {
    it('should initialize with mock data', async () => {
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const result = await searchService.search({ q: 'iPhone' })
      expect(result.products).toBeDefined()
      expect(result.total).toBeGreaterThan(0)
      expect(result.query).toBe('iPhone')
    })

    it('should handle empty queries', async () => {
      const result = await searchService.search({ q: '' })
      expect(result.products).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should return search timing information', async () => {
      const result = await searchService.search({ q: 'test' })
      expect(result.timing).toBeDefined()
      expect(result.timing!.total).toBeGreaterThan(0)
      expect(result.timing!.embedding).toBeGreaterThan(0)
      expect(result.timing!.search).toBeGreaterThan(0)
    })

    it('should update search statistics', async () => {
      const initialStats = searchService.getStats()
      const initialQueries = initialStats.totalQueries

      await searchService.search({ q: 'test query' })
      
      const updatedStats = searchService.getStats()
      expect(updatedStats.totalQueries).toBe(initialQueries + 1)
      expect(updatedStats.averageLatency).toBeGreaterThan(0)
    })
  })

  describe('Hybrid Search Scoring', () => {
    it('should find exact matches with high relevance', async () => {
      const result = await searchService.search({ q: 'iPhone 15 Pro Max' })
      expect(result.products).toHaveLength(1)
      expect(result.products[0]!.title).toBe('iPhone 15 Pro Max')
    })

    it('should handle partial matches', async () => {
      const result = await searchService.search({ q: 'iPhone' })
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products[0]!.title).toContain('iPhone')
    })

    it('should handle brand searches', async () => {
      const result = await searchService.search({ q: 'Apple' })
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.brand === 'Apple')).toBe(true)
    })

    it('should handle category filtering', async () => {
      const result = await searchService.search({ 
        q: 'phone', 
        category: 'Electronics' 
      })
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.category === 'Electronics')).toBe(true)
    })

    it('should handle price range filtering', async () => {
      const result = await searchService.search({ 
        q: 'product', 
        priceRange: { min: 1000, max: 50000 } 
      })
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every(p => p.price >= 1000 && p.price <= 50000)).toBe(true)
    })
  })

  describe('Sorting and Pagination', () => {
    it('should sort by price low to high', async () => {
      const result = await searchService.search({ 
        q: 'product', 
        sortBy: 'price_low' 
      })
      
      if (result.products.length > 1) {
        for (let i = 1; i < result.products.length; i++) {
          expect(result.products[i]!.price).toBeGreaterThanOrEqual(result.products[i-1]!.price)
        }
      }
    })

    it('should sort by price high to low', async () => {
      const result = await searchService.search({ 
        q: 'product', 
        sortBy: 'price_high' 
      })
      
      if (result.products.length > 1) {
        for (let i = 1; i < result.products.length; i++) {
          expect(result.products[i]!.price).toBeLessThanOrEqual(result.products[i-1]!.price)
        }
      }
    })

    it('should handle pagination', async () => {
      const page1 = await searchService.search({ q: 'product', limit: 2, offset: 0 })
      const page2 = await searchService.search({ q: 'product', limit: 2, offset: 2 })
      
      expect(page1.products).toHaveLength(2)
      expect(page2.products.length).toBeGreaterThanOrEqual(0)
      
      if (page2.products.length > 0) {
        expect(page1.products[0]!.id).not.toBe(page2.products[0]!.id)
      }
    })

    it('should respect limit parameter', async () => {
      const result = await searchService.search({ q: 'product', limit: 3 })
      expect(result.products.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Faceted Search', () => {
    it('should generate category facets', async () => {
      const result = await searchService.search({ q: 'product' })
      expect(result.facets).toBeDefined()
      expect(result.facets!.categories).toBeDefined()
      expect(result.facets!.categories.length).toBeGreaterThan(0)
    })

    it('should generate brand facets', async () => {
      const result = await searchService.search({ q: 'product' })
      expect(result.facets!.brands).toBeDefined()
      expect(result.facets!.brands.length).toBeGreaterThan(0)
    })

    it('should generate price range facets', async () => {
      const result = await searchService.search({ q: 'product' })
      expect(result.facets!.priceRanges).toBeDefined()
      expect(result.facets!.priceRanges.length).toBeGreaterThan(0)
    })

    it('should have consistent facet counts', async () => {
      const result = await searchService.search({ q: 'product' })
      
      const totalFromCategories = result.facets!.categories.reduce((sum, cat) => sum + cat.count, 0)
      expect(totalFromCategories).toBeLessThanOrEqual(result.total)
    })
  })

  describe('Product Management', () => {
    it('should add new products to search index', async () => {
      const newProduct = {
        id: 'test-product',
        title: 'Test Product',
        brand: 'Test Brand',
        tags: ['test', 'product'],
        category: 'Test Category',
        description: 'A test product for testing',
        price: 999,
        media: ['test.jpg'],
        popularity: 50
      }

      await searchService.addProduct(newProduct)
      
      const result = await searchService.search({ q: 'Test Product' })
      expect(result.products.some(p => p.id === 'test-product')).toBe(true)
    })

    it('should remove products from search index', async () => {
      // First add a product
      const newProduct = {
        id: 'removable-product',
        title: 'Removable Product',
        brand: 'Test Brand',
        tags: ['removable'],
        category: 'Test Category',
        description: 'A product to be removed',
        price: 500,
        media: ['removable.jpg'],
        popularity: 30
      }

      await searchService.addProduct(newProduct)
      
      // Verify it exists
      let result = await searchService.search({ q: 'Removable Product' })
      expect(result.products.some(p => p.id === 'removable-product')).toBe(true)

      // Remove it
      searchService.removeProduct('removable-product')
      
      // Verify it's gone
      result = await searchService.search({ q: 'Removable Product' })
      expect(result.products.some(p => p.id === 'removable-product')).toBe(false)
    })
  })

  describe('Performance Metrics', () => {
    it('should track P95 latency', async () => {
      // Perform multiple searches to populate latency history
      for (let i = 0; i < 10; i++) {
        await searchService.search({ q: `test ${i}` })
      }

      const stats = searchService.getStats()
      expect(stats.p95Latency).toBeGreaterThan(0)
      expect(stats.p95Latency).toBeGreaterThanOrEqual(stats.averageLatency)
    })

    it('should track no results rate', async () => {
      const initialStats = searchService.getStats()
      
      // Perform a search that should return no results
      await searchService.search({ q: 'nonexistentproductxyz123' })
      
      const updatedStats = searchService.getStats()
      expect(updatedStats.noResultsRate).toBeGreaterThanOrEqual(initialStats.noResultsRate)
    })
  })
})

describe('EmbeddingService', () => {
  let embeddingService: EmbeddingService

  beforeEach(() => {
    embeddingService = EmbeddingService.getInstance()
  })

  describe('Embedding Generation', () => {
    it('should generate consistent embeddings for same text', async () => {
      const text = 'iPhone 15 Pro Max'
      const embedding1 = await embeddingService.generateEmbedding(text)
      const embedding2 = await embeddingService.generateEmbedding(text)
      
      expect(embedding1).toEqual(embedding2)
      expect(embedding1).toHaveLength(384) // e5-small dimension
    })

    it('should generate different embeddings for different text', async () => {
      const embedding1 = await embeddingService.generateEmbedding('iPhone')
      const embedding2 = await embeddingService.generateEmbedding('Samsung')
      
      expect(embedding1).not.toEqual(embedding2)
    })

    it('should normalize embeddings', async () => {
      const embedding = await embeddingService.generateEmbedding('test text')
      
      // Calculate magnitude
      const magnitude = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0))
      expect(magnitude).toBeCloseTo(1, 5) // Should be normalized to unit vector
    })

    it('should cache embeddings', async () => {
      const text = 'cached text'
      
      // First call should generate
      const start1 = performance.now()
      await embeddingService.generateEmbedding(text)
      const time1 = performance.now() - start1

      // Second call should be cached
      const start2 = performance.now()
      await embeddingService.generateEmbedding(text)
      const time2 = performance.now() - start2

      expect(time2).toBeLessThan(time1) // Cached should be faster
    })
  })

  describe('Cosine Similarity', () => {
    it('should return 1 for identical vectors', () => {
      const vector = [1, 0, 0, 1]
      const similarity = embeddingService.cosineSimilarity(vector, vector)
      expect(similarity).toBeCloseTo(1, 5)
    })

    it('should return 0 for orthogonal vectors', () => {
      const vector1 = [1, 0, 0, 0]
      const vector2 = [0, 1, 0, 0]
      const similarity = embeddingService.cosineSimilarity(vector1, vector2)
      expect(similarity).toBeCloseTo(0, 5)
    })

    it('should handle different length vectors', () => {
      const vector1 = [1, 0, 0]
      const vector2 = [1, 0, 0, 0]
      const similarity = embeddingService.cosineSimilarity(vector1, vector2)
      expect(similarity).toBe(0)
    })

    it('should handle zero vectors', () => {
      const vector1 = [0, 0, 0]
      const vector2 = [1, 1, 1]
      const similarity = embeddingService.cosineSimilarity(vector1, vector2)
      expect(similarity).toBe(0)
    })
  })
})

describe('FuzzyMatcher', () => {
  describe('Edit Distance', () => {
    it('should calculate edit distance correctly', () => {
      expect(FuzzyMatcher.editDistance('kitten', 'sitting')).toBe(3)
      expect(FuzzyMatcher.editDistance('hello', 'hello')).toBe(0)
      expect(FuzzyMatcher.editDistance('', 'hello')).toBe(5)
      expect(FuzzyMatcher.editDistance('hello', '')).toBe(5)
    })

    it('should respect maximum distance threshold', () => {
      const distance = FuzzyMatcher.editDistance('very different string', 'completely unrelated', 2)
      expect(distance).toBeGreaterThan(2)
    })

    it('should handle identical strings', () => {
      expect(FuzzyMatcher.editDistance('identical', 'identical')).toBe(0)
    })
  })

  describe('Fuzzy Similarity', () => {
    it('should return 1 for identical strings', () => {
      const similarity = FuzzyMatcher.fuzzySimilarity('hello', 'hello')
      expect(similarity).toBe(1)
    })

    it('should return 0 for completely different strings', () => {
      const similarity = FuzzyMatcher.fuzzySimilarity('', 'hello')
      expect(similarity).toBe(0)
    })

    it('should handle case insensitivity', () => {
      const similarity = FuzzyMatcher.fuzzySimilarity('Hello', 'hello')
      expect(similarity).toBe(1)
    })

    it('should calculate reasonable similarity for typos', () => {
      const similarity = FuzzyMatcher.fuzzySimilarity('iphone', 'iPhoen') // Common typo
      expect(similarity).toBeGreaterThan(0.7)
    })
  })

  describe('Best Matches', () => {
    const terms = ['iPhone', 'Samsung', 'MacBook', 'iPad', 'iMac']

    it('should find exact matches', () => {
      const matches = FuzzyMatcher.findBestMatches('iPhone', terms)
      expect(matches[0]!.term).toBe('iPhone')
      expect(matches[0]!.score).toBe(1)
    })

    it('should find fuzzy matches', () => {
      const matches = FuzzyMatcher.findBestMatches('iPhoen', terms) // Typo
      expect(matches.length).toBeGreaterThan(0)
      expect(matches[0]!.term).toBe('iPhone')
      expect(matches[0]!.score).toBeGreaterThan(0.6)
    })

    it('should respect threshold', () => {
      const matches = FuzzyMatcher.findBestMatches('xyz', terms, 0.8)
      expect(matches).toHaveLength(0)
    })

    it('should sort by score descending', () => {
      const matches = FuzzyMatcher.findBestMatches('Mac', terms)
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i]!.score).toBeLessThanOrEqual(matches[i-1]!.score)
      }
    })
  })
})

describe('BM25Scorer', () => {
  const mockProducts = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max',
      brand: 'Apple',
      description: 'Latest iPhone with advanced features',
      tags: ['phone', 'smartphone', 'apple'],
      category: 'Electronics',
      price: 59999,
      media: [],
      popularity: 95
    },
    {
      id: '2',
      title: 'Samsung Galaxy S24',
      brand: 'Samsung',
      description: 'Android smartphone with great camera',
      tags: ['phone', 'android', 'samsung'],
      category: 'Electronics',
      price: 54999,
      media: [],
      popularity: 88
    }
  ]

  let bm25Scorer: BM25Scorer

  beforeEach(() => {
    bm25Scorer = new BM25Scorer(mockProducts)
  })

  describe('Scoring', () => {
    it('should score exact matches higher', () => {
      const score1 = bm25Scorer.score('iPhone', mockProducts[0]!)
      const score2 = bm25Scorer.score('Samsung', mockProducts[0]!)
      
      expect(score1).toBeGreaterThan(score2)
    })

    it('should return 0 for no matches', () => {
      const score = bm25Scorer.score('nonexistent', mockProducts[0]!)
      expect(score).toBe(0)
    })

    it('should handle multi-word queries', () => {
      const score = bm25Scorer.score('iPhone Pro', mockProducts[0]!)
      expect(score).toBeGreaterThan(0)
    })

    it('should score based on term frequency', () => {
      // Create a product with repeated terms
      const productWithRepeats = {
        ...mockProducts[0]!,
        title: 'iPhone iPhone iPhone Pro',
        description: 'iPhone device with iPhone features'
      }
      
      const scoreRepeats = bm25Scorer.score('iPhone', productWithRepeats)
      const scoreNormal = bm25Scorer.score('iPhone', mockProducts[0]!)
      
      expect(scoreRepeats).toBeGreaterThan(scoreNormal)
    })
  })

  describe('Index Building', () => {
    it('should handle empty product list', () => {
      expect(() => new BM25Scorer([])).not.toThrow()
    })

    it('should tokenize text correctly', () => {
      // This test verifies tokenization indirectly through scoring
      const score = bm25Scorer.score('15', mockProducts[0]!) // Should find "15" in "iPhone 15"
      expect(score).toBeGreaterThan(0)
    })
  })
})

describe('Search Performance', () => {
  let searchService: SearchService

  beforeEach(() => {
    searchService = new SearchService()
  })

  it('should complete searches within acceptable latency', async () => {
    const start = performance.now()
    await searchService.search({ q: 'iPhone' })
    const duration = performance.now() - start

    // Should complete within 200ms for mock data
    expect(duration).toBeLessThan(200)
  })

  it('should handle concurrent searches', async () => {
    const queries = ['iPhone', 'Samsung', 'MacBook', 'Nike', 'Adidas']
    
    const promises = queries.map(q => searchService.search({ q }))
    const results = await Promise.all(promises)
    
    expect(results).toHaveLength(5)
    results.forEach((result, index) => {
      expect(result.query).toBe(queries[index])
      expect(result.timing).toBeDefined()
    })
  })

  it('should maintain performance with complex queries', async () => {
    const complexQuery = 'iPhone 15 Pro Max 256GB Space Black with AppleCare'
    
    const start = performance.now()
    const result = await searchService.search({ 
      q: complexQuery,
      category: 'Electronics',
      priceRange: { min: 50000, max: 70000 },
      sortBy: 'relevance',
      limit: 50
    })
    const duration = performance.now() - start

    expect(duration).toBeLessThan(300) // Allow more time for complex queries
    expect(result.products).toBeDefined()
    expect(result.timing!.total).toBeGreaterThan(0)
  })
})

describe('Search Integration', () => {
  it('should integrate all search components correctly', async () => {
    const searchService = new SearchService()
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100))

    const result = await searchService.search({
      q: 'iPhone Pro',
      limit: 10,
      sortBy: 'relevance'
    })

    // Verify all components are working together
    expect(result.products).toBeDefined()
    expect(result.total).toBeGreaterThan(0)
    expect(result.facets).toBeDefined()
    expect(result.timing).toBeDefined()
    expect(result.suggestions).toBeDefined()

    // Verify performance tracking
    const stats = searchService.getStats()
    expect(stats.totalQueries).toBeGreaterThan(0)
    expect(stats.averageLatency).toBeGreaterThan(0)
  })
})
