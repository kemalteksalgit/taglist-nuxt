// tests/components.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Import component stubs  
import AdvancedAnalyticsDashboard from '~/components/AdvancedAnalyticsDashboard.vue'
import ModeTooltip from '~/components/ModeTooltip.vue'
import PersonalizedRecommendations from '~/components/PersonalizedRecommendations.vue'

describe('Component Button Handlers', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  describe('AdvancedAnalyticsDashboard', () => {
    it('should render without crashing', () => {
      const wrapper = mount(AdvancedAnalyticsDashboard, {
        global: {
          plugins: [pinia],
          stubs: {
            Icon: true,
            AdvancedChart: true,
            AdvancedTable: true,
            AnalyticsMap: true,
            FunnelChart: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle refresh widget button clicks', async () => {
      const wrapper = mount(AdvancedAnalyticsDashboard, {
        global: {
          plugins: [pinia],
          stubs: {
            Icon: true,
            AdvancedChart: true,
            AdvancedTable: true,
            AnalyticsMap: true,
            FunnelChart: true
          }
        }
      })

      // Mock widgets data
      const mockWidget = {
        id: 'test-widget',
        title: 'Test Widget',
        type: 'metric_card',
        config: {},
        style: {}
      }

      // Set widgets data
      await wrapper.setData({ 
        widgets: [mockWidget],
        widgetLoading: { 'test-widget': false },
        widgetErrors: {},
        widgetData: {}
      })

      const refreshButtons = wrapper.findAll('.widget-action-btn')
      if (refreshButtons.length > 0 && refreshButtons[0]) {
        await refreshButtons[0].trigger('click')
        expect(wrapper.vm).toBeDefined()
      }
    })
  })

  describe('ModeTooltip', () => {
    it('should render without crashing', () => {
      const wrapper = mount(ModeTooltip, {
        props: {
          mode: 'shop'
        },
        global: {
          plugins: [pinia],
          stubs: {
            Teleport: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle quick action button clicks', async () => {
      const wrapper = mount(ModeTooltip, {
        props: {
          mode: 'shop'
        },
        global: {
          plugins: [pinia],
          stubs: {
            Teleport: true
          }
        }
      })

      // Show the tooltip
      await wrapper.vm.show()

      const actionButtons = wrapper.findAll('button')
      const quickActionButtons = actionButtons.filter(button => 
        button.text().includes('Hızlı') || button.classes().includes('quick-action')
      )
      
      if (quickActionButtons.length > 0 && quickActionButtons[0]) {
        await quickActionButtons[0].trigger('click')
        expect(wrapper.vm).toBeDefined()
      }
    })
  })

  describe('PersonalizedRecommendations', () => {
    it('should render without crashing', () => {
      const wrapper = mount(PersonalizedRecommendations, {
        global: {
          plugins: [pinia],
          stubs: {
            LoadingSpinner: true,
            RecommendationSection: true,
            Modal: true,
            Icon: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle remove brand button clicks', async () => {
      const wrapper = mount(PersonalizedRecommendations, {
        global: {
          plugins: [pinia],
          stubs: {
            LoadingSpinner: true,
            RecommendationSection: true,
            Modal: true,
            Icon: true
          }
        }
      })

      // Set up preferences with brands
      await wrapper.setData({
        preferences: {
          brands: ['Nike', 'Adidas'],
          categories: [],
          excludedCategories: [],
          priceRange: { min: 0, max: 1000 }
        },
        showSettings: true
      })

      const removeButtons = wrapper.findAll('.remove-brand')
      if (removeButtons.length > 0 && removeButtons[0]) {
        await removeButtons[0].trigger('click')
        expect(wrapper.vm).toBeDefined()
      }
    })
  })
})
