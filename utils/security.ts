// utils/security.ts

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (process.server) {
    // Server-side HTML sanitization using string replacement
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
  }
  
  // Client-side sanitization
  if (typeof window !== 'undefined' && (window as any).DOMPurify) {
    return (window as any).DOMPurify.sanitize(html)
  }
  
  // Fallback sanitization - remove all HTML tags
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Validates and sanitizes user input
 */
export function validateInput(input: string, type: 'email' | 'text' | 'url' | 'phone' = 'text'): {
  isValid: boolean
  sanitized: string
  errors: string[]
} {
  const errors: string[] = []
  let sanitized = input.trim()

  // Basic sanitization
  sanitized = sanitized.replace(/[<>]/g, '')

  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(sanitized)) {
        errors.push('Invalid email format')
      }
      break
    
    case 'url':
      try {
        new URL(sanitized)
      } catch {
        errors.push('Invalid URL format')
      }
      break
    
    case 'phone':
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/
      if (!phoneRegex.test(sanitized)) {
        errors.push('Invalid phone number format')
      }
      break
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  }
}

/**
 * Generates CSRF token
 */
export function generateCSRFToken(): string {
  if (process.server) {
    return Buffer.from(Math.random().toString()).toString('base64')
  }
  
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validates CSRF token
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken && token.length >= 32
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (validAttempts.length >= this.maxAttempts) {
      return false
    }
    
    // Record new attempt
    validAttempts.push(now)
    this.attempts.set(identifier, validAttempts)
    
    return true
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }
}

/**
 * Secure storage utility with encryption
 */
export class SecureStorage {
  private key: string
  
  constructor() {
    this.key = this.getOrGenerateKey()
  }
  
  private getOrGenerateKey(): string {
    if (process.server) return 'server-key'
    
    let key = localStorage.getItem('_app_key')
    if (!key) {
      key = this.generateSecureKey()
      localStorage.setItem('_app_key', key)
    }
    return key
  }
  
  private generateSecureKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  private async encrypt(data: string): Promise<string> {
    if (process.server) {
      // Simple base64 for server-side (implement proper encryption in production)
      return Buffer.from(data).toString('base64')
    }
    
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      
      // Import key
      const keyBuffer = encoder.encode(this.key.slice(0, 32))
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      )
      
      // Encrypt
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        dataBuffer
      )
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv)
      combined.set(new Uint8Array(encrypted), iv.length)
      
      return Array.from(combined, byte => byte.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.error('Encryption failed:', error)
      return btoa(data) // Fallback to base64
    }
  }
  
  private async decrypt(encryptedData: string): Promise<string> {
    if (process.server) {
      try {
        return Buffer.from(encryptedData, 'base64').toString()
      } catch {
        return ''
      }
    }
    
    try {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      
      // Convert hex string back to bytes
      const combined = new Uint8Array(
        encryptedData.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
      )
      
      if (combined.length < 12) {
        throw new Error('Invalid encrypted data')
      }
      
      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)
      
      // Import key
      const keyBuffer = encoder.encode(this.key.slice(0, 32))
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      )
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encrypted
      )
      
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      try {
        return atob(encryptedData) // Fallback to base64
      } catch {
        return ''
      }
    }
  }
  
  async setItem(key: string, value: string): Promise<void> {
    if (process.client) {
      const encrypted = await this.encrypt(value)
      localStorage.setItem(key, encrypted)
    }
  }
  
  async getItem(key: string): Promise<string | null> {
    if (process.client) {
      const encrypted = localStorage.getItem(key)
      if (!encrypted) return null
      return this.decrypt(encrypted)
    }
    return null
  }
  
  removeItem(key: string): void {
    if (process.client) {
      localStorage.removeItem(key)
    }
  }
}

// Global rate limiter instances
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000) // 100 requests per minute

// Global secure storage instance
export const secureStorage = new SecureStorage()
