import { vi, beforeAll, afterAll } from 'vitest'
import type { ComponentMountingOptions } from '@vue/test-utils'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useHead: vi.fn(),
  useMeta: vi.fn(),
  useRoute: vi.fn(() => ({
    path: '/',
    params: {},
    query: {},
    fullPath: '/',
    name: 'index'
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  })),
  navigateTo: vi.fn(),
  useState: vi.fn(),
  useFetch: vi.fn(),
  useLazyFetch: vi.fn(),
  useAsyncData: vi.fn(),
  useCookie: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({
    public: {
      apiBase: 'http://localhost:3000/api',
      appName: 'TagList',
      appVersion: '2.0.0'
    }
  })),
  definePageMeta: vi.fn()
}))

// Mock Pinia
vi.mock('pinia', () => ({
  defineStore: vi.fn(),
  createPinia: vi.fn(),
  setActivePinia: vi.fn()
}))

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: vi.fn().mockResolvedValue({}),
    ready: Promise.resolve({}),
    controller: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
})

// Mock HTMLCanvasElement and Canvas API for testing
global.HTMLCanvasElement = class HTMLCanvasElement {
  constructor() {
    this.width = 300
    this.height = 150
  }
  
  width = 300
  height = 150
  
  getContext() {
    return {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(this.width * this.height * 4),
        width: this.width,
        height: this.height
      })),
      putImageData: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      canvas: this
    }
  }
  
  toDataURL() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  }
  
  toBlob(callback: BlobCallback) {
    callback(new Blob(['test'], { type: 'image/png' }))
  }
} as any

// Mock ImageData constructor
global.ImageData = class ImageData {
  data: Uint8ClampedArray
  width: number
  height: number
  
  constructor(data: Uint8ClampedArray | number, widthOrHeight?: number, height?: number) {
    if (typeof data === 'number') {
      this.width = data
      this.height = widthOrHeight || data
      this.data = new Uint8ClampedArray(this.width * this.height * 4)
    } else {
      this.data = data
      this.width = widthOrHeight!
      this.height = height!
    }
  }
} as any

// Mock Image constructor
global.Image = class Image {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  width = 100
  height = 100
  
  set src(value: string) {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
} as any

// Mock fetch for API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
  })
) as any

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock navigator with Camera API
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }],
      getVideoTracks: () => [{ stop: vi.fn() }],
      getAudioTracks: () => [{ stop: vi.fn() }]
    }))
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
})

// Global test configuration
export const globalMountOptions: ComponentMountingOptions<any> = {
  global: {
    stubs: {
      NuxtLink: true,
      ClientOnly: true
    },
    mocks: {
      $t: (key: string) => key,
      $router: {
        push: vi.fn(),
        replace: vi.fn()
      },
      $route: {
        path: '/',
        params: {},
        query: {}
      }
    }
  }
}

// Console cleanup
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
