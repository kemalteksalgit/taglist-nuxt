import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PersonalizationService } from '~/services/PersonalizationService'
import type { UserBehavior } from '~/types/personalization'

describe('PersonalizationService', () => {
  let service: PersonalizationService

  beforeEach(() => {
    vi.useFakeTimers()
    service = new PersonalizationService()
  })

  describe('Profile Management', () => {
    it('should create user profile', async () => {
      const profile = await service.createUserProfile('user123')
      
      expect(profile).toBeDefined()
      expect(profile.id).toBe('user123')
      expect(profile.preferences).toBeDefined()
      expect(profile.lastActive).toBeDefined()
    })

    it('should update lastActive with fake timers', async () => {
      const profile = await service.createUserProfile('user123')
      const initialTime = profile.lastActive
      
      // Advance time by 1 hour
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000)
      
      // Track behavior to update lastActive
      const behavior: UserBehavior = {
        userId: 'user123',
        action: 'view',
        timestamp: new Date(),
        productId: 'prod1'
      }
      service.trackBehavior(behavior)
      const updatedProfile = service.getUserProfile('user123')
      
      expect(updatedProfile?.lastActive.getTime()).toBeGreaterThan(initialTime.getTime())
    })
  })

  describe('Behavior Tracking', () => {
    it('should track user behavior', async () => {
      await service.createUserProfile('user123')
      
      const behavior: UserBehavior = {
        userId: 'user123',
        action: 'view',
        timestamp: new Date(),
        productId: 'prod1',
        metadata: { source: 'homepage' }
      }
      
      service.trackBehavior(behavior)
      const profile = service.getUserProfile('user123')
      
      expect(profile?.lastActive).toBeDefined()
    })
  })

  describe('Recommendations', () => {
    it('should get basic recommendations', async () => {
      await service.createUserProfile('user123')
      
      const recommendations = await service.getRecommendations('user123', 'homepage', 5)
      
      expect(recommendations).toBeDefined()
      expect(recommendations.products).toBeInstanceOf(Array)
      expect(recommendations.userId).toBe('user123')
      expect(recommendations.context).toBe('homepage')
    })
  })

  describe('Analytics', () => {
    it('should get user analytics', async () => {
      await service.createUserProfile('user123')
      
      const analytics = service.getAnalytics('user123')
      
      expect(analytics).toBeDefined()
      expect(analytics?.profileCompleteness).toBeGreaterThanOrEqual(0)
      expect(analytics?.profileCompleteness).toBeLessThanOrEqual(100)
    })
  })
})