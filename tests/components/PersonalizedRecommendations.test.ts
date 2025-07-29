// tests/components/PersonalizedRecommendations.test.ts
// Comprehensive tests for Personalized Recommendations Component

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PersonalizedRecommendations from '~/components/PersonalizedRecommendations.vue'

// Mock the personalization service
vi.mock('~/services/PersonalizationService', () => ({
  PersonalizationService: vi.fn(() => ({
    getRecommendations: vi.fn().mockResolvedValue({
      userId: 'user123',
      recommendations: [
        {
          productId: 'product1',
          score: 0.95,
          reason: 'Based on your recent purchases',
          algorithm: 'collaborative_filtering',
          confidence: 0.9,
          metadata: {
            category: 'Electronics',
            brand: 'Apple',
            price: 999
          }
        },
        {
          productId: 'product2',
          score: 0.87,
          reason: 'Similar users also liked',
          algorithm: 'content_based',
          confidence: 0.8,
          metadata: {
            category: 'Electronics',
            brand: 'Samsung',
            price: 799
          }
        }
      ],
      timestamp: new Date(),
      context: 'homepage',
      algorithm: 'hybrid',
      confidence: 0.88,
      explanation: 'Recommendations based on your browsing history and preferences',
      segments: ['tech_enthusiast', 'premium_buyer']
    }),
    getUserProfile: vi.fn().mockReturnValue({
      id: 'user123',
      preferences: {
        categories: ['Electronics'],
        brands: ['Apple'],
        priceRange: { min: 500, max: 2000 },
        colors: ['Black', 'White']
      },
      created: new Date(),
      lastActive: new Date(),
      segment: 'premium',
      personality: {
        traits: [
          { name: 'tech_savvy', score: 0.9 },
          { name: 'brand_loyal', score: 0.8 }
        ],
        preferences: {
          novelty: 0.7,
          quality: 0.9,
          price_sensitivity: 0.3
        }
      }
    }),
    getUserAnalytics: vi.fn().mockReturnValue({
      userId: 'user123',
      totalBehaviors: 156,
      behaviorBreakdown: {
        view: 100,
        like: 30,
        share: 10,
        purchase: 16
      },
      averagePrice: 750,
      totalSpent: 12000,
      favoriteCategories: ['Electronics', 'Fashion'],
      favoriteBrands: ['Apple', 'Nike'],
      conversionRate: 0.15,
      engagementScore: 0.8,
      loyaltyScore: 0.7
    }),
    updateUserPreferences: vi.fn().mockResolvedValue(true),
    trackBehavior: vi.fn().mockReturnValue(true)
  }))
}))

// Mock product data
const mockProducts = [
  {
    id: 'product1',
    title: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 999,
    image: '/iphone15.jpg',
    category: 'Electronics',
    colors: ['Black', 'White', 'Gold'],
    rating: 4.8,
    reviews: 1250
  },
  {
    id: 'product2',
    title: 'Galaxy S24',
    brand: 'Samsung',
    price: 799,
    image: '/galaxy-s24.jpg',
    category: 'Electronics',
    colors: ['Black', 'Blue'],
    rating: 4.6,
    reviews: 890
  }
]

// Mock stores
vi.mock('~/stores/products', () => ({
  useProductsStore: vi.fn(() => ({
    getProductById: vi.fn((id: string) => 
      mockProducts.find(p => p.id === id)
    ),
    searchProducts: vi.fn().mockResolvedValue({
      products: mockProducts,
      total: 2
    })
  }))
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'user123', name: 'Test User' },
    isLoggedIn: true
  }))
}))

describe('PersonalizedRecommendations', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(PersonalizedRecommendations, {
      props: {
        userId: 'user123',
        context: 'homepage',
        limit: 10
      },
      global: {
        stubs: {
          'NuxtImg': true,
          'Icon': true,
          'ProductCard': true,
          'RecommendationSection': true
        }
      }
    })
  })

  describe('Component Initialization', () => {
    it('should render correctly', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.personalized-recommendations').exists()).toBe(true)
    })

    it('should initialize with correct props', () => {
      expect(wrapper.vm.userId).toBe('user123')
      expect(wrapper.vm.context).toBe('homepage')
      expect(wrapper.vm.limit).toBe(10)
    })

    it('should load recommendations on mount', async () => {
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.recommendations.length).toBeGreaterThan(0)
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Recommendations Loading', () => {
    it('should display loading state', async () => {
      await wrapper.setData({ isLoading: true })
      
      expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    })

    it('should handle successful recommendation load', async () => {
      await wrapper.vm.loadRecommendations()
      
      expect(wrapper.vm.recommendations.length).toBe(2)
      expect(wrapper.vm.recommendationData).toBeTruthy()
      expect(wrapper.vm.recommendationData.algorithm).toBe('hybrid')
      expect(wrapper.vm.recommendationData.confidence).toBe(0.88)
    })

    it('should handle empty recommendations', async () => {
      const mockService = wrapper.vm.personalizationService
      mockService.getRecommendations.mockResolvedValueOnce({
        userId: 'user123',
        recommendations: [],
        timestamp: new Date(),
        context: 'homepage',
        algorithm: 'fallback',
        confidence: 0.1
      })
      
      await wrapper.vm.loadRecommendations()
      
      expect(wrapper.vm.recommendations.length).toBe(0)
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('should handle recommendation loading error', async () => {
      const mockService = wrapper.vm.personalizationService
      mockService.getRecommendations.mockRejectedValueOnce(new Error('Service unavailable'))
      
      await wrapper.vm.loadRecommendations()
      
      expect(wrapper.vm.error).toContain('Service unavailable')
      expect(wrapper.vm.isLoading).toBe(false)
    })
  })

  describe('Recommendation Sections', () => {
    beforeEach(async () => {
      await wrapper.vm.loadRecommendations()
    })

    it('should group recommendations by algorithm', () => {
      const sections = wrapper.vm.recommendationSections
      
      expect(sections).toBeTruthy()
      expect(Object.keys(sections).length).toBeGreaterThan(0)
      expect(sections['collaborative_filtering']).toBeTruthy()
      expect(sections['content_based']).toBeTruthy()
    })

    it('should display section titles correctly', () => {
      const sectionTitles = wrapper.findAll('.recommendation-section h3')
      
      expect(sectionTitles.length).toBeGreaterThan(0)
      expect(sectionTitles[0].text()).toContain('Based on')
    })

    it('should show recommendation reasons', () => {
      const reasons = wrapper.findAll('.recommendation-reason')
      
      expect(reasons.length).toBeGreaterThan(0)
      expect(reasons[0].text()).toContain('Based on your recent purchases')
    })

    it('should display confidence scores', () => {
      const confidenceScores = wrapper.findAll('.confidence-score')
      
      expect(confidenceScores.length).toBeGreaterThan(0)
      expect(confidenceScores[0].text()).toMatch(/\d+%/)
    })
  })

  describe('User Preferences Management', () => {
    it('should load user profile', async () => {
      await wrapper.vm.loadUserProfile()
      
      expect(wrapper.vm.userProfile).toBeTruthy()
      expect(wrapper.vm.userProfile.preferences.categories).toContain('Electronics')
      expect(wrapper.vm.userProfile.segment).toBe('premium')
    })

    it('should display user preferences', async () => {
      await wrapper.vm.loadUserProfile()
      
      expect(wrapper.find('.user-preferences').exists()).toBe(true)
      expect(wrapper.find('.preference-categories').exists()).toBe(true)
      expect(wrapper.find('.preference-brands').exists()).toBe(true)
      expect(wrapper.find('.price-range').exists()).toBe(true)
    })

    it('should allow editing preferences', async () => {
      await wrapper.setData({ 
        showPreferencesEditor: true,
        editablePreferences: {
          categories: ['Electronics', 'Fashion'],
          brands: ['Apple', 'Nike'],
          priceRange: { min: 100, max: 3000 },
          colors: ['Black', 'White', 'Red']
        }
      })
      
      const preferencesEditor = wrapper.find('.preferences-editor')
      expect(preferencesEditor.exists()).toBe(true)
      
      const categoryInputs = wrapper.findAll('input[name="categories"]')
      expect(categoryInputs.length).toBeGreaterThan(0)
    })

    it('should save updated preferences', async () => {
      await wrapper.setData({
        editablePreferences: {
          categories: ['Electronics', 'Fashion'],
          brands: ['Apple', 'Nike'],
          priceRange: { min: 200, max: 4000 },
          colors: ['Black', 'Red']
        }
      })
      
      await wrapper.vm.savePreferences()
      
      expect(wrapper.vm.personalizationService.updateUserPreferences).toHaveBeenCalled()
      expect(wrapper.vm.showPreferencesEditor).toBe(false)
    })
  })

  describe('User Analytics Dashboard', () => {
    it('should load user analytics', async () => {
      await wrapper.vm.loadUserAnalytics()
      
      expect(wrapper.vm.userAnalytics).toBeTruthy()
      expect(wrapper.vm.userAnalytics.totalBehaviors).toBe(156)
      expect(wrapper.vm.userAnalytics.conversionRate).toBe(0.15)
    })

    it('should display analytics charts', async () => {
      await wrapper.setData({ showAnalytics: true })
      await wrapper.vm.loadUserAnalytics()
      
      expect(wrapper.find('.analytics-dashboard').exists()).toBe(true)
      expect(wrapper.find('.behavior-chart').exists()).toBe(true)
      expect(wrapper.find('.spending-chart').exists()).toBe(true)
    })

    it('should show behavior breakdown', async () => {
      await wrapper.vm.loadUserAnalytics()
      
      const behaviorBreakdown = wrapper.vm.userAnalytics.behaviorBreakdown
      expect(behaviorBreakdown.view).toBe(100)
      expect(behaviorBreakdown.like).toBe(30)
      expect(behaviorBreakdown.purchase).toBe(16)
    })

    it('should calculate engagement metrics', async () => {
      await wrapper.vm.loadUserAnalytics()
      
      expect(wrapper.vm.userAnalytics.engagementScore).toBe(0.8)
      expect(wrapper.vm.userAnalytics.loyaltyScore).toBe(0.7)
      expect(wrapper.vm.userAnalytics.conversionRate).toBe(0.15)
    })
  })

  describe('Recommendation Interactions', () => {
    beforeEach(async () => {
      await wrapper.vm.loadRecommendations()
    })

    it('should track recommendation view', async () => {
      const productCard = wrapper.find('.product-card')
      
      await productCard.trigger('mouseenter')
      
      expect(wrapper.vm.personalizationService.trackBehavior).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'view_recommendation',
          productId: 'product1'
        })
      )
    })

    it('should track recommendation click', async () => {
      const productCard = wrapper.find('.product-card')
      
      await productCard.trigger('click')
      
      expect(wrapper.vm.personalizationService.trackBehavior).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'click_recommendation',
          productId: 'product1'
        })
      )
    })

    it('should handle like/unlike actions', async () => {
      const likeBtn = wrapper.find('.like-btn')
      
      await likeBtn.trigger('click')
      
      expect(wrapper.vm.personalizationService.trackBehavior).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'like',
          productId: expect.any(String)
        })
      )
    })

    it('should provide feedback on recommendations', async () => {
      await wrapper.vm.provideFeedback('product1', 'helpful')
      
      expect(wrapper.vm.personalizationService.trackBehavior).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'feedback',
          productId: 'product1',
          metadata: { feedback: 'helpful' }
        })
      )
    })
  })

  describe('Recommendation Filtering', () => {
    beforeEach(async () => {
      await wrapper.vm.loadRecommendations()
    })

    it('should filter by category', async () => {
      await wrapper.vm.filterRecommendations({ category: 'Electronics' })
      
      const filteredProducts = wrapper.vm.filteredRecommendations
      filteredProducts.forEach((product: any) => {
        expect(product.category).toBe('Electronics')
      })
    })

    it('should filter by price range', async () => {
      await wrapper.vm.filterRecommendations({ 
        priceRange: { min: 500, max: 1000 } 
      })
      
      const filteredProducts = wrapper.vm.filteredRecommendations
      filteredProducts.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(500)
        expect(product.price).toBeLessThanOrEqual(1000)
      })
    })

    it('should filter by brand', async () => {
      await wrapper.vm.filterRecommendations({ brand: 'Apple' })
      
      const filteredProducts = wrapper.vm.filteredRecommendations
      filteredProducts.forEach((product: any) => {
        expect(product.brand).toBe('Apple')
      })
    })

    it('should clear filters', async () => {
      await wrapper.setData({
        activeFilters: { category: 'Electronics', brand: 'Apple' }
      })
      
      await wrapper.vm.clearFilters()
      
      expect(wrapper.vm.activeFilters).toEqual({})
      expect(wrapper.vm.filteredRecommendations.length).toBe(wrapper.vm.recommendations.length)
    })
  })

  describe('Personalization Settings', () => {
    it('should toggle personalization on/off', async () => {
      await wrapper.setData({ personalizationEnabled: true })
      
      await wrapper.vm.togglePersonalization()
      
      expect(wrapper.vm.personalizationEnabled).toBe(false)
    })

    it('should adjust recommendation frequency', async () => {
      await wrapper.vm.setRecommendationFrequency('weekly')
      
      expect(wrapper.vm.recommendationSettings.frequency).toBe('weekly')
    })

    it('should enable/disable recommendation types', async () => {
      await wrapper.vm.toggleRecommendationType('trending', false)
      
      expect(wrapper.vm.recommendationSettings.types.trending).toBe(false)
    })

    it('should reset personalization data', async () => {
      await wrapper.vm.resetPersonalizationData()
      
      expect(wrapper.vm.recommendations).toEqual([])
      expect(wrapper.vm.userProfile).toBeNull()
      expect(wrapper.vm.userAnalytics).toBeNull()
    })
  })

  describe('Privacy Controls', () => {
    it('should show privacy settings', async () => {
      await wrapper.setData({ showPrivacySettings: true })
      
      expect(wrapper.find('.privacy-settings').exists()).toBe(true)
      expect(wrapper.find('.data-usage-info').exists()).toBe(true)
    })

    it('should allow data deletion', async () => {
      await wrapper.vm.deleteUserData()
      
      // Should show confirmation dialog
      expect(wrapper.vm.showDeleteConfirmation).toBe(true)
    })

    it('should export user data', async () => {
      const exportData = await wrapper.vm.exportUserData()
      
      expect(exportData).toBeTruthy()
      expect(exportData.profile).toBeTruthy()
      expect(exportData.behaviors).toBeTruthy()
      expect(exportData.recommendations).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should handle service unavailable', async () => {
      const mockService = wrapper.vm.personalizationService
      mockService.getRecommendations.mockRejectedValue(new Error('Service unavailable'))
      
      await wrapper.vm.loadRecommendations()
      
      expect(wrapper.vm.error).toContain('Service unavailable')
      expect(wrapper.find('.error-fallback').exists()).toBe(true)
    })

    it('should show fallback recommendations', async () => {
      const mockService = wrapper.vm.personalizationService
      mockService.getRecommendations.mockResolvedValue({
        userId: 'user123',
        recommendations: [],
        algorithm: 'fallback'
      })
      
      await wrapper.vm.loadRecommendations()
      
      expect(wrapper.find('.fallback-recommendations').exists()).toBe(true)
    })

    it('should handle network errors gracefully', async () => {
      const mockService = wrapper.vm.personalizationService
      mockService.getRecommendations.mockRejectedValue(new Error('Network error'))
      
      await wrapper.vm.loadRecommendations()
      
      expect(wrapper.vm.isOffline).toBe(true)
      expect(wrapper.find('.offline-message').exists()).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should lazy load recommendations', async () => {
      await wrapper.vm.loadMoreRecommendations()
      
      expect(wrapper.vm.recommendations.length).toBeGreaterThan(2)
    })

    it('should implement infinite scroll', async () => {
      const scrollContainer = wrapper.find('.recommendations-container')
      
      await scrollContainer.trigger('scroll', {
        target: { scrollTop: 1000, scrollHeight: 1200, clientHeight: 600 }
      })
      
      expect(wrapper.vm.loadMoreRecommendations).toHaveBeenCalled()
    })

    it('should cache recommendations', async () => {
      await wrapper.vm.loadRecommendations()
      const firstLoad = Date.now()
      
      await wrapper.vm.loadRecommendations()
      const secondLoad = Date.now()
      
      expect(secondLoad - firstLoad).toBeLessThan(100) // Should be much faster
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const recommendationCards = wrapper.findAll('[aria-label]')
      expect(recommendationCards.length).toBeGreaterThan(0)
    })

    it('should support keyboard navigation', async () => {
      const firstCard = wrapper.find('.product-card')
      
      await firstCard.trigger('keydown', { key: 'Enter' })
      // Should trigger click action
      
      await firstCard.trigger('keydown', { key: ' ' })
      // Should trigger like action
    })

    it('should provide screen reader announcements', () => {
      const announcements = wrapper.findAll('[aria-live]')
      expect(announcements.length).toBeGreaterThan(0)
    })
  })

  describe('Component Lifecycle', () => {
    it('should clean up on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      
      wrapper.unmount()
      
      expect(clearIntervalSpy).toHaveBeenCalled()
    })

    it('should refresh recommendations on prop changes', async () => {
      const loadSpy = vi.spyOn(wrapper.vm, 'loadRecommendations')
      
      await wrapper.setProps({ context: 'product_page' })
      
      expect(loadSpy).toHaveBeenCalled()
    })

    it('should handle user login/logout', async () => {
      await wrapper.vm.handleUserChange('new_user_456')
      
      expect(wrapper.vm.userId).toBe('new_user_456')
      expect(wrapper.vm.recommendations).toEqual([])
    })
  })
})
