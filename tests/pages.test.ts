// tests/pages.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Import page components
import IndexPage from '~/pages/index.vue'
import ExplorePage from '~/pages/explore.vue'
import FavoritesPage from '~/pages/favorites.vue'
import DashboardPage from '~/pages/dashboard.vue'
import MyListingsPage from '~/pages/my-listings.vue'

describe('Page Components', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  describe('Index Page', () => {
    it('should render without crashing', () => {
      const wrapper = mount(IndexPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should have register and sell buttons', () => {
      const wrapper = mount(IndexPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })
      
      const registerButton = wrapper.find('[to="/register"]')
      const sellButton = wrapper.find('[to="/sell"]')
      
      expect(registerButton.exists()).toBe(true)
      expect(sellButton.exists()).toBe(true)
    })
  })

  describe('Explore Page', () => {
    it('should render without crashing', () => {
      const wrapper = mount(ExplorePage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            ProductCard: true,
            Icon: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle pagination buttons without throwing', async () => {
      const wrapper = mount(ExplorePage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            ProductCard: true,
            Icon: true
          }
        }
      })

      // Test pagination buttons exist and can be clicked
      const nextButton = wrapper.find('button:contains("Sonraki")')
      const prevButton = wrapper.find('button:contains("Önceki")')
      
      if (nextButton.exists()) {
        await nextButton.trigger('click')
        expect(wrapper.vm).toBeDefined()
      }
      
      if (prevButton.exists()) {
        await prevButton.trigger('click')
        expect(wrapper.vm).toBeDefined()
      }
    })
  })

  describe('Favorites Page', () => {
    it('should render without crashing', () => {
      const wrapper = mount(FavoritesPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle toggle favorite without throwing', async () => {
      const wrapper = mount(FavoritesPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })

      // Set up some mock data
      wrapper.vm.favorites = [
        {
          id: '1',
          title: 'Test Product',
          price: 100,
          image: '/test.jpg',
          location: 'Test Location',
          status: 'active',
          addedDate: new Date().toISOString()
        }
      ]

      await wrapper.vm.$nextTick()

      // Find and click favorite button
      const favoriteButtons = wrapper.findAll('button:contains("❤️")')
      if (favoriteButtons.length > 0) {
        await favoriteButtons[0].trigger('click')
        expect(wrapper.vm).toBeDefined()
      }
    })
  })

  describe('Dashboard Page', () => {
    it('should render without crashing', () => {
      const wrapper = mount(DashboardPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should have navigation links', () => {
      const wrapper = mount(DashboardPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })

      const sellLink = wrapper.find('[to="/sell"]')
      const profileLink = wrapper.find('[to="/profile"]')
      const messagesLink = wrapper.find('[to="/messages"]')
      
      expect(sellLink.exists()).toBe(true)
      expect(profileLink.exists()).toBe(true)
      expect(messagesLink.exists()).toBe(true)
    })
  })

  describe('My Listings Page', () => {
    it('should render without crashing', () => {
      const wrapper = mount(MyListingsPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should show under construction message', () => {
      const wrapper = mount(MyListingsPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })

      expect(wrapper.text()).toContain('Sayfa Hazırlanıyor')
    })

    it('should have navigation buttons', () => {
      const wrapper = mount(MyListingsPage, {
        global: {
          plugins: [pinia],
          stubs: {
            NuxtLayout: true,
            NuxtLink: true,
            Icon: true
          }
        }
      })

      const dashboardLink = wrapper.find('[to="/dashboard"]')
      const sellLink = wrapper.find('[to="/sell"]')
      
      expect(dashboardLink.exists()).toBe(true)
      expect(sellLink.exists()).toBe(true)
    })
  })
})
