<template>
  <div class="social-commerce-livestream" :class="streamStateClass">
    <!-- Main Stream Container -->
    <div class="stream-container">
      <!-- Video Stream Area -->
      <div class="video-section" ref="videoSection">
        <div class="video-wrapper">
          <video 
            ref="videoElement"
            :class="['stream-video', { 'picture-in-picture': isPictureInPicture }]"
            autoplay
            muted
            playsinline
            @loadedmetadata="onVideoLoaded"
            @error="onVideoError"
          />
          
          <!-- Stream Overlay -->
          <div class="stream-overlay">
            <!-- Live Indicator -->
            <div class="live-indicator" v-if="isLive">
              <span class="live-dot"></span>
              <span class="live-text">LIVE</span>
              <span class="viewer-count">{{ formatNumber(currentViewers) }}</span>
            </div>

            <!-- Product Showcase Overlay -->
            <div 
              v-if="showcasedProduct" 
              class="product-showcase-overlay"
              :class="{ 'animated': productShowcaseAnimation }"
            >
              <div class="product-card">
                <img :src="showcasedProduct.images[0]" :alt="showcasedProduct.name" />
                <div class="product-info">
                  <h3>{{ showcasedProduct.name }}</h3>
                  <div class="price">
                    <span class="current-price">${{ showcasedProduct.price }}</span>
                    <span v-if="showcasedProduct.originalPrice" class="original-price">
                      ${{ showcasedProduct.originalPrice }}
                    </span>
                  </div>
                  <button 
                    @click="purchaseProduct(showcasedProduct)"
                    class="buy-now-btn"
                    :disabled="!showcasedProduct.inStock"
                  >
                    {{ showcasedProduct.inStock ? 'Buy Now' : 'Out of Stock' }}
                  </button>
                </div>
                <button @click="closeProductShowcase" class="close-showcase">
                  <Icon name="x" />
                </button>
              </div>
            </div>

            <!-- Reactions Overlay -->
            <div class="reactions-overlay">
              <div 
                v-for="reaction in activeReactions" 
                :key="reaction.id"
                class="reaction-animation"
                :style="getReactionStyle(reaction)"
              >
                {{ getReactionEmoji(reaction.type) }}
              </div>
            </div>

            <!-- Collaboration Indicator -->
            <div v-if="activeCollaboration" class="collaboration-indicator">
              <div class="collaborators">
                <div 
                  v-for="participant in activeCollaboration.participants"
                  :key="participant.userId"
                  class="collaborator"
                >
                  <img :src="participant.avatar" :alt="participant.username" />
                  <span>{{ participant.username }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stream Controls -->
          <div class="stream-controls" v-if="isStreamer">
            <button @click="toggleCamera" class="control-btn">
              <Icon :name="cameraEnabled ? 'camera' : 'camera-off'" />
            </button>
            <button @click="toggleMicrophone" class="control-btn">
              <Icon :name="microphoneEnabled ? 'mic' : 'mic-off'" />
            </button>
            <button @click="toggleScreenShare" class="control-btn">
              <Icon :name="screenSharing ? 'monitor-x' : 'monitor'" />
            </button>
            <button @click="showProductSelector" class="control-btn">
              <Icon name="shopping-bag" />
            </button>
            <button @click="openStreamSettings" class="control-btn">
              <Icon name="settings" />
            </button>
          </div>
        </div>

        <!-- Stream Quality Indicator -->
        <div class="quality-indicator">
          <div class="quality-dots">
            <div 
              v-for="i in 5" 
              :key="i"
              class="quality-dot"
              :class="{ 'active': i <= streamQualityLevel }"
            ></div>
          </div>
          <span class="quality-text">{{ streamQualityText }}</span>
        </div>
      </div>

      <!-- Interactive Sidebar -->
      <div class="interactive-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- Sidebar Toggle -->
        <button @click="toggleSidebar" class="sidebar-toggle">
          <Icon :name="sidebarCollapsed ? 'chevron-left' : 'chevron-right'" />
        </button>

        <!-- Tab Navigation -->
        <div class="sidebar-tabs">
          <button 
            v-for="tab in sidebarTabs" 
            :key="tab.id"
            @click="activeSidebarTab = tab.id"
            class="sidebar-tab"
            :class="{ 'active': activeSidebarTab === tab.id }"
          >
            <Icon :name="tab.icon" />
            <span>{{ tab.label }}</span>
            <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Chat Section -->
        <div v-if="activeSidebarTab === 'chat'" class="chat-section">
          <div class="chat-header">
            <h3>Live Chat</h3>
            <div class="chat-controls">
              <button @click="toggleChatSettings" class="chat-control-btn">
                <Icon name="settings" />
              </button>
              <button @click="clearChat" class="chat-control-btn" v-if="isModerator">
                <Icon name="trash-2" />
              </button>
            </div>
          </div>

          <div class="chat-messages" ref="chatMessages">
            <div 
              v-for="message in chatMessages" 
              :key="message.id"
              class="chat-message"
              :class="getChatMessageClass(message)"
            >
              <div class="message-header">
                <span class="username" :style="getUsernameStyle(message.userId)">
                  {{ message.username }}
                </span>
                <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
                <div class="message-actions" v-if="canModerateMessage(message)">
                  <button @click="pinMessage(message)" v-if="!message.isPinned">
                    <Icon name="pin" />
                  </button>
                  <button @click="deleteMessage(message)">
                    <Icon name="trash-2" />
                  </button>
                </div>
              </div>
              <div class="message-content">
                <span v-if="message.replyTo" class="reply-to">
                  Replying to {{ getMessageAuthor(message.replyTo) }}
                </span>
                <div class="message-text" v-html="formatMessageContent(message.content)"></div>
                <div v-if="message.reactions.length" class="message-reactions">
                  <button 
                    v-for="reaction in message.reactions"
                    :key="reaction.emoji"
                    @click="toggleMessageReaction(message, reaction.emoji)"
                    class="reaction-btn"
                    :class="{ 'user-reacted': hasUserReacted(reaction, currentUser.id) }"
                  >
                    {{ reaction.emoji }} {{ reaction.count }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-section">
            <div v-if="chatSettings.slowMode" class="slow-mode-indicator">
              Slow mode: {{ chatSettings.slowModeDelay }}s
            </div>
            <div class="chat-input-wrapper">
              <input 
                v-model="chatMessage"
                @keydown.enter="sendChatMessage"
                @input="onChatInput"
                placeholder="Type a message..."
                class="chat-input"
                :disabled="!canSendMessage"
                :maxlength="chatSettings.maxLength"
              />
              <button @click="showEmojiPicker" class="emoji-btn">
                <Icon name="smile" />
              </button>
              <button @click="sendChatMessage" class="send-btn" :disabled="!chatMessage.trim()">
                <Icon name="send" />
              </button>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div v-if="activeSidebarTab === 'products'" class="products-section">
          <div class="products-header">
            <h3>Featured Products</h3>
            <div class="products-filter">
              <select v-model="selectedProductCategory" @change="filterProducts">
                <option value="">All Categories</option>
                <option v-for="category in productCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <div class="products-list">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="product-item"
              :class="{ 'showcased': product.id === showcasedProduct?.id }"
            >
              <div class="product-image">
                <img :src="product.images[0]" :alt="product.name" />
                <div v-if="product.streamSpecific?.exclusiveOffer" class="exclusive-badge">
                  Exclusive
                </div>
              </div>
              <div class="product-details">
                <h4>{{ product.name }}</h4>
                <div class="product-price">
                  <span class="current-price">${{ product.price }}</span>
                  <span v-if="product.originalPrice" class="original-price">
                    ${{ product.originalPrice }}
                  </span>
                  <span v-if="product.discount" class="discount">
                    -{{ product.discount }}%
                  </span>
                </div>
                <div class="product-actions">
                  <button 
                    @click="showcaseProduct(product)"
                    class="showcase-btn"
                    v-if="isStreamer"
                  >
                    Showcase
                  </button>
                  <button 
                    @click="addToCart(product)"
                    class="add-to-cart-btn"
                    :disabled="!product.inStock"
                  >
                    {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reactions Section -->
        <div v-if="activeSidebarTab === 'reactions'" class="reactions-section">
          <div class="reactions-header">
            <h3>Reactions</h3>
          </div>
          <div class="reaction-buttons">
            <button 
              v-for="reaction in availableReactions"
              :key="reaction.type"
              @click="sendReaction(reaction.type)"
              class="reaction-btn large"
              :class="{ 'cooldown': reactionCooldowns[reaction.type] }"
            >
              <span class="reaction-emoji">{{ reaction.emoji }}</span>
              <span class="reaction-label">{{ reaction.label }}</span>
              <span v-if="reactionCooldowns[reaction.type]" class="cooldown-timer">
                {{ reactionCooldowns[reaction.type] }}s
              </span>
            </button>
          </div>
        </div>

        <!-- Analytics Section (for streamers) -->
        <div v-if="activeSidebarTab === 'analytics' && isStreamer" class="analytics-section">
          <div class="analytics-header">
            <h3>Live Analytics</h3>
          </div>
          <div class="analytics-grid">
            <div class="metric-card">
              <div class="metric-value">{{ currentViewers }}</div>
              <div class="metric-label">Current Viewers</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ peakViewers }}</div>
              <div class="metric-label">Peak Viewers</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ formatDuration(streamDuration) }}</div>
              <div class="metric-label">Stream Duration</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${{ totalRevenue }}</div>
              <div class="metric-label">Revenue</div>
            </div>
          </div>
          
          <div class="engagement-chart">
            <h4>Engagement Over Time</h4>
            <canvas ref="engagementChart" width="300" height="150"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Panel -->
    <div v-if="isMobile" class="mobile-bottom-panel">
      <div class="mobile-tabs">
        <button 
          v-for="tab in mobileTabs"
          :key="tab.id"
          @click="activeMobileTab = tab.id"
          class="mobile-tab"
          :class="{ 'active': activeMobileTab === tab.id }"
        >
          <Icon :name="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
      
      <div class="mobile-content">
        <!-- Mobile chat -->
        <div v-if="activeMobileTab === 'chat'" class="mobile-chat">
          <!-- Simplified chat for mobile -->
        </div>
        
        <!-- Mobile products -->
        <div v-if="activeMobileTab === 'products'" class="mobile-products">
          <!-- Product carousel for mobile -->
        </div>
      </div>
    </div>

    <!-- Modals and Overlays -->
    
    <!-- Product Purchase Modal -->
    <Modal v-if="showPurchaseModal" @close="closePurchaseModal" class="purchase-modal">
      <div class="purchase-content">
        <h2>Purchase {{ selectedProduct?.name }}</h2>
        <div class="product-summary">
          <img :src="selectedProduct?.images[0]" :alt="selectedProduct?.name" />
          <div class="product-info">
            <h3>{{ selectedProduct?.name }}</h3>
            <p class="price">${{ selectedProduct?.price }}</p>
            <div class="quantity-selector">
              <label>Quantity:</label>
              <div class="quantity-controls">
                <button @click="decreaseQuantity">-</button>
                <span>{{ purchaseQuantity }}</span>
                <button @click="increaseQuantity">+</button>
              </div>
            </div>
          </div>
        </div>
        <div class="purchase-actions">
          <button @click="confirmPurchase" class="confirm-purchase-btn">
            Confirm Purchase - ${{ totalPurchaseAmount }}
          </button>
          <button @click="closePurchaseModal" class="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </Modal>

    <!-- Stream Settings Modal -->
    <Modal v-if="showStreamSettings" @close="closeStreamSettings" class="settings-modal">
      <div class="settings-content">
        <h2>Stream Settings</h2>
        <div class="settings-tabs">
          <button 
            v-for="tab in settingsTabs"
            :key="tab.id"
            @click="activeSettingsTab = tab.id"
            class="settings-tab"
            :class="{ 'active': activeSettingsTab === tab.id }"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="settings-panel">
          <!-- Quality Settings -->
          <div v-if="activeSettingsTab === 'quality'" class="quality-settings">
            <div class="setting-group">
              <label>Video Quality</label>
              <select v-model="streamConfig.quality" @change="updateStreamQuality">
                <option value="low">Low (480p)</option>
                <option value="medium">Medium (720p)</option>
                <option value="high">High (1080p)</option>
                <option value="ultra">Ultra (1440p)</option>
              </select>
            </div>
            <div class="setting-group">
              <label>Frame Rate</label>
              <select v-model="streamConfig.video.frameRate" @change="updateStreamQuality">
                <option value="24">24 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </select>
            </div>
          </div>
          
          <!-- Moderation Settings -->
          <div v-if="activeSettingsTab === 'moderation'" class="moderation-settings">
            <div class="setting-group">
              <label>
                <input 
                  v-model="moderationSettings.autoModerationEnabled" 
                  type="checkbox"
                  @change="updateModerationSettings"
                />
                Auto Moderation
              </label>
            </div>
            <div class="setting-group">
              <label>Slow Mode (seconds)</label>
              <input 
                v-model.number="moderationSettings.slowMode"
                type="number"
                min="0"
                max="300"
                @change="updateModerationSettings"
              />
            </div>
            <div class="setting-group">
              <label>
                <input 
                  v-model="moderationSettings.subscriberOnlyChat" 
                  type="checkbox"
                  @change="updateModerationSettings"
                />
                Subscriber Only Chat
              </label>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Collaboration Invite Modal -->
    <Modal v-if="showCollaborationInvite" @close="closeCollaborationInvite">
      <div class="collaboration-invite">
        <h2>Collaboration Invite</h2>
        <p>{{ pendingCollaboration?.inviterName }} invited you to join their stream as {{ pendingCollaboration?.role }}</p>
        <div class="collaboration-actions">
          <button @click="acceptCollaboration" class="accept-btn">Accept</button>
          <button @click="declineCollaboration" class="decline-btn">Decline</button>
        </div>
      </div>
    </Modal>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <LoadingSpinner />
      <p>{{ loadingMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { enhancedLiveStreamingService } from '~/services/EnhancedLiveStreamingService'
import type { 
  StreamProduct, 
  ChatMessage, 
  StreamReaction, 
  StreamConfig,
  StreamAnalytics,
  StreamCollaboration
} from '~/types/streaming'

// Component Props
interface Props {
  streamId?: string
  isStreamer?: boolean
  autoJoin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isStreamer: false,
  autoJoin: true
})

// Reactive State
const route = useRoute()
const videoElement = ref<HTMLVideoElement>()
const videoSection = ref<HTMLElement>()
const chatMessagesContainer = ref<HTMLElement>()
const engagementChart = ref<HTMLCanvasElement>()

// Stream State
const isLive = ref(false)
const isLoading = ref(false)
const loadingMessage = ref('')
const currentViewers = ref(0)
const peakViewers = ref(0)
const streamDuration = ref(0)
const totalRevenue = ref(0)
const streamQualityLevel = ref(3)

// UI State
const sidebarCollapsed = ref(false)
const activeSidebarTab = ref('chat')
const activeMobileTab = ref('chat')
const isPictureInPicture = ref(false)
const isMobile = computed(() => window.innerWidth < 768)

// Stream Controls
const cameraEnabled = ref(true)
const microphoneEnabled = ref(true)
const screenSharing = ref(false)
const streamConfig = ref<StreamConfig>({
  video: { width: 1920, height: 1080, frameRate: 30 },
  audio: { bitrate: 128000, sampleRate: 48000 },
  quality: 'high'
})

// Chat System
const chatMessage = ref('')
const chatMessagesData = ref<ChatMessage[]>([])
const chatSettings = ref({
  slowMode: false,
  slowModeDelay: 5,
  maxLength: 200,
  subscriberOnly: false
})

// Products
const showcasedProduct = ref<StreamProduct | null>(null)
const selectedProduct = ref<StreamProduct | null>(null)
const filteredProducts = ref<StreamProduct[]>([])
const selectedProductCategory = ref('')
const productCategories = ref<string[]>([])
const showPurchaseModal = ref(false)
const purchaseQuantity = ref(1)
const productShowcaseAnimation = ref(false)

// Reactions
const activeReactions = ref<StreamReaction[]>([])
const reactionCooldowns = ref<Record<string, number>>({})
const availableReactions = ref([
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'crown', emoji: '👑', label: 'Crown' },
  { type: 'gift', emoji: '🎁', label: 'Gift' }
])

// Collaboration
const activeCollaboration = ref<StreamCollaboration | null>(null)
const showCollaborationInvite = ref(false)
const pendingCollaboration = ref<any>(null)

// Moderation
const isModerator = ref(false)
const moderationSettings = ref({
  autoModerationEnabled: true,
  slowMode: 0,
  subscriberOnlyChat: false
})

// Settings
const showStreamSettings = ref(false)
const activeSettingsTab = ref('quality')

// Current User
const currentUser = ref({
  id: 'user123',
  username: 'ViewerUser',
  isSubscriber: false,
  loyaltyLevel: 'regular'
})

// Computed Properties
const streamStateClass = computed(() => ({
  'is-live': isLive.value,
  'is-loading': isLoading.value,
  'sidebar-collapsed': sidebarCollapsed.value,
  'mobile': isMobile.value
}))

const streamQualityText = computed(() => {
  const levels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent']
  return levels[streamQualityLevel.value - 1] || 'Unknown'
})

const totalPurchaseAmount = computed(() => {
  return selectedProduct.value ? selectedProduct.value.price * purchaseQuantity.value : 0
})

const canSendMessage = computed(() => {
  if (chatSettings.value.subscriberOnly && !currentUser.value.isSubscriber) {
    return false
  }
  return true
})

const sidebarTabs = computed(() => [
  { id: 'chat', icon: 'message-circle', label: 'Chat', count: chatMessages.value.length },
  { id: 'products', icon: 'shopping-bag', label: 'Products', count: filteredProducts.value.length },
  { id: 'reactions', icon: 'smile', label: 'Reactions' },
  ...(props.isStreamer ? [{ id: 'analytics', icon: 'bar-chart', label: 'Analytics' }] : [])
])

const mobileTabs = computed(() => [
  { id: 'chat', icon: 'message-circle', label: 'Chat' },
  { id: 'products', icon: 'shopping-bag', label: 'Shop' },
  { id: 'reactions', icon: 'smile', label: 'React' }
])

const settingsTabs = computed(() => [
  { id: 'quality', label: 'Quality' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'notifications', label: 'Notifications' }
])

// Methods
const initializeStream = async () => {
  try {
    isLoading.value = true
    loadingMessage.value = 'Connecting to stream...'

    await enhancedLiveStreamingService.initializeStreaming(streamConfig.value)
    
    if (props.streamId) {
      await joinStream(props.streamId)
    }

    setupEventListeners()
    
  } catch (error) {
    console.error('Failed to initialize stream:', error)
    // Handle error
  } finally {
    isLoading.value = false
  }
}

const joinStream = async (streamId: string) => {
  try {
    await enhancedLiveStreamingService.addViewer({
      id: currentUser.value.id,
      username: currentUser.value.username,
      isSubscriber: currentUser.value.isSubscriber,
      loyaltyLevel: currentUser.value.loyaltyLevel as any
    })
    
    isLive.value = true
  } catch (error) {
    console.error('Failed to join stream:', error)
  }
}

const setupEventListeners = () => {
  enhancedLiveStreamingService.on('streamStarted', onStreamStarted)
  enhancedLiveStreamingService.on('streamEnded', onStreamEnded)
  enhancedLiveStreamingService.on('chatMessage', onChatMessage)
  enhancedLiveStreamingService.on('reaction', onReaction)
  enhancedLiveStreamingService.on('productShowcase', onProductShowcase)
  enhancedLiveStreamingService.on('collaborationInvite', onCollaborationInvite)
  enhancedLiveStreamingService.on('viewerJoined', updateViewerCount)
  enhancedLiveStreamingService.on('qualityOptimized', onQualityOptimized)
}

const onStreamStarted = (data: any) => {
  isLive.value = true
  streamDuration.value = 0
  
  // Start duration timer
  setInterval(() => {
    streamDuration.value += 1000
  }, 1000)
}

const onStreamEnded = (data: any) => {
  isLive.value = false
  // Handle stream end
}

const onChatMessage = (message: ChatMessage) => {
  chatMessages.value.push(message)
  
  // Scroll to bottom
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
}

const onReaction = (reaction: StreamReaction) => {
  activeReactions.value.push(reaction)
  
  // Remove reaction after animation
  setTimeout(() => {
    const index = activeReactions.value.findIndex(r => r.id === reaction.id)
    if (index > -1) {
      activeReactions.value.splice(index, 1)
    }
  }, 3000)
}

const onProductShowcase = (data: any) => {
  showcasedProduct.value = data.product
  productShowcaseAnimation.value = true
  
  setTimeout(() => {
    productShowcaseAnimation.value = false
  }, 1000)
}

const onCollaborationInvite = (invite: any) => {
  pendingCollaboration.value = invite
  showCollaborationInvite.value = true
}

const updateViewerCount = () => {
  const analytics = enhancedLiveStreamingService.getStreamAnalytics()
  currentViewers.value = analytics.currentViewers
  peakViewers.value = analytics.peakViewers
  totalRevenue.value = analytics.revenue.totalSales
}

const onQualityOptimized = (data: any) => {
  // Update quality indicator
  updateQualityIndicator()
}

// Chat Methods
const sendChatMessage = async () => {
  if (!chatMessage.value.trim()) return
  
  try {
    await enhancedLiveStreamingService.sendChatMessage({
      userId: currentUser.value.id,
      username: currentUser.value.username,
      content: chatMessage.value,
      type: 'text'
    })
    
    chatMessage.value = ''
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const sendReaction = async (type: string) => {
  if (reactionCooldowns.value[type]) return
  
  try {
    await enhancedLiveStreamingService.addReaction({
      userId: currentUser.value.id,
      type: type as any
    })
    
    // Apply cooldown
    reactionCooldowns.value[type] = 3
    const countdown = setInterval(() => {
      reactionCooldowns.value[type]--
      if (reactionCooldowns.value[type] <= 0) {
        delete reactionCooldowns.value[type]
        clearInterval(countdown)
      }
    }, 1000)
    
  } catch (error) {
    console.error('Failed to send reaction:', error)
  }
}

// Product Methods
const showcaseProduct = async (product: StreamProduct) => {
  if (!props.isStreamer) return
  
  try {
    await enhancedLiveStreamingService.showcaseProduct(product.id, 60000)
  } catch (error) {
    console.error('Failed to showcase product:', error)
  }
}

const purchaseProduct = (product: StreamProduct) => {
  selectedProduct.value = product
  purchaseQuantity.value = 1
  showPurchaseModal.value = true
}

const confirmPurchase = async () => {
  if (!selectedProduct.value) return
  
  try {
    // Handle purchase logic
    showPurchaseModal.value = false
    selectedProduct.value = null
    purchaseQuantity.value = 1
  } catch (error) {
    console.error('Purchase failed:', error)
  }
}

// UI Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleCamera = async () => {
  cameraEnabled.value = !cameraEnabled.value
  // Implementation for camera toggle
}

const toggleMicrophone = async () => {
  microphoneEnabled.value = !microphoneEnabled.value
  // Implementation for microphone toggle
}

const toggleScreenShare = async () => {
  screenSharing.value = !screenSharing.value
  // Implementation for screen sharing
}

const updateStreamQuality = async () => {
  try {
    await enhancedLiveStreamingService.optimizeStreamQuality()
    updateQualityIndicator()
  } catch (error) {
    console.error('Failed to update quality:', error)
  }
}

const updateQualityIndicator = () => {
  // Implementation for quality indicator update
  streamQualityLevel.value = Math.floor(Math.random() * 5) + 1
}

// Utility Methods
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getReactionEmoji = (type: string): string => {
  const reaction = availableReactions.value.find(r => r.type === type)
  return reaction?.emoji || '👍'
}

const getReactionStyle = (reaction: StreamReaction) => {
  return {
    left: reaction.position ? `${reaction.position.x}px` : 'auto',
    top: reaction.position ? `${reaction.position.y}px` : 'auto'
  }
}

// Component Lifecycle
onMounted(async () => {
  await initializeStream()
})

onUnmounted(() => {
  // Cleanup event listeners and resources
  enhancedLiveStreamingService.off('streamStarted', onStreamStarted)
  enhancedLiveStreamingService.off('streamEnded', onStreamEnded)
  enhancedLiveStreamingService.off('chatMessage', onChatMessage)
  enhancedLiveStreamingService.off('reaction', onReaction)
  enhancedLiveStreamingService.off('productShowcase', onProductShowcase)
  enhancedLiveStreamingService.off('collaborationInvite', onCollaborationInvite)
})

// Watch for route changes
watch(() => route.params.streamId, (newStreamId) => {
  if (newStreamId && typeof newStreamId === 'string') {
    joinStream(newStreamId)
  }
})

// Additional Methods (fixing TypeScript errors)

// Video event handlers
const onVideoLoaded = () => {
  console.log('Video loaded')
}

const onVideoError = (error: Event) => {
  console.error('Video error:', error)
}

// Product showcase methods
const closeProductShowcase = () => {
  showcasedProduct.value = null
  productShowcaseAnimation.value = false
}

const showProductSelector = () => {
  // Implementation for product selector
  console.log('Showing product selector')
}

// Stream settings methods
const openStreamSettings = () => {
  showStreamSettings.value = true
}

const closeStreamSettings = () => {
  showStreamSettings.value = false
}

// Chat methods
const toggleChatSettings = () => {
  // Toggle chat settings panel
  console.log('Toggle chat settings')
}

const clearChat = () => {
  if (isModerator.value) {
    chatMessagesData.value = []
  }
}

const getChatMessageClass = (message: ChatMessage) => {
  return {
    'moderator': message.isModerator,
    'subscriber': message.isSubscriber,
    'pinned': message.isPinned
  }
}

const getUsernameStyle = (userId: string) => {
  // Return user-specific styling
  return { color: '#60A5FA' }
}

const canModerateMessage = (message: ChatMessage) => {
  return isModerator.value && message.userId !== currentUser.value.id
}

const pinMessage = (message: ChatMessage) => {
  message.isPinned = true
}

const deleteMessage = (message: ChatMessage) => {
  const index = chatMessagesData.value.findIndex(m => m.id === message.id)
  if (index > -1) {
    chatMessagesData.value.splice(index, 1)
  }
}

const getMessageAuthor = (messageId: string) => {
  const message = chatMessagesData.value.find(m => m.id === messageId)
  return message?.username || 'Unknown'
}

const formatMessageContent = (content: string) => {
  // Basic HTML formatting for messages
  return content.replace(/\n/g, '<br>')
}

const toggleMessageReaction = (message: ChatMessage, emoji: string) => {
  // Toggle reaction on message
  console.log('Toggle reaction:', emoji, 'on message:', message.id)
}

const hasUserReacted = (reaction: any, userId: string) => {
  return reaction.users?.includes(userId) || false
}

const onChatInput = (event: Event) => {
  // Handle chat input events
  const target = event.target as HTMLInputElement
  chatMessage.value = target.value
}

const showEmojiPicker = () => {
  // Show emoji picker
  console.log('Show emoji picker')
}

// Product methods
const filterProducts = () => {
  // Filter products by category
  console.log('Filtering products by:', selectedProductCategory.value)
}

const addToCart = (product: StreamProduct) => {
  selectedProduct.value = product
  showPurchaseModal.value = true
}

// Purchase modal methods
const closePurchaseModal = () => {
  showPurchaseModal.value = false
  selectedProduct.value = null
}

const decreaseQuantity = () => {
  if (purchaseQuantity.value > 1) {
    purchaseQuantity.value--
  }
}

const increaseQuantity = () => {
  purchaseQuantity.value++
}

// Moderation methods
const updateModerationSettings = () => {
  console.log('Updating moderation settings:', moderationSettings.value)
}

// Collaboration methods
const closeCollaborationInvite = () => {
  showCollaborationInvite.value = false
  pendingCollaboration.value = null
}

const acceptCollaboration = () => {
  console.log('Collaboration accepted')
  closeCollaborationInvite()
}

const declineCollaboration = () => {
  console.log('Collaboration declined')
  closeCollaborationInvite()
}

// Computed properties that were missing
const chatMessages = computed(() => chatMessagesData.value)
</script>

<style scoped lang="postcss">
.social-commerce-livestream {
  @apply h-screen bg-gray-900 text-white overflow-hidden;
}

.stream-container {
  @apply flex h-full;
}

.video-section {
  @apply flex-1 relative bg-black;
}

.video-wrapper {
  @apply relative w-full h-full;
}

.stream-video {
  @apply w-full h-full object-cover;
}

.stream-overlay {
  @apply absolute inset-0 pointer-events-none;
}

.live-indicator {
  @apply absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-sm font-semibold;
}

.live-dot {
  @apply w-2 h-2 bg-white rounded-full animate-pulse;
}

.product-showcase-overlay {
  @apply absolute bottom-20 right-4 bg-white text-black p-4 rounded-lg shadow-lg max-w-xs pointer-events-auto;
  animation: slideInRight 0.5s ease-out;
}

.product-showcase-overlay.animated {
  animation: pulse 1s ease-in-out;
}

.reactions-overlay {
  @apply absolute inset-0;
}

.reaction-animation {
  @apply absolute text-2xl pointer-events-none;
  animation: reactionFloat 3s ease-out forwards;
}

.stream-controls {
  @apply absolute bottom-4 left-4 flex gap-2;
}

.control-btn {
  @apply bg-black/50 p-3 rounded-full hover:bg-black/70 transition-colors pointer-events-auto;
}

.quality-indicator {
  @apply absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded text-sm;
}

.quality-dots {
  @apply flex gap-1;
}

.quality-dot {
  @apply w-2 h-2 bg-gray-600 rounded-full;
}

.quality-dot.active {
  @apply bg-green-500;
}

.interactive-sidebar {
  @apply w-80 bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300;
}

.interactive-sidebar.collapsed {
  @apply w-16;
}

.sidebar-toggle {
  @apply p-3 border-b border-gray-700 hover:bg-gray-700;
}

.sidebar-tabs {
  @apply border-b border-gray-700;
}

.sidebar-tab {
  @apply w-full p-3 flex items-center gap-2 hover:bg-gray-700 border-b border-gray-700/50;
}

.sidebar-tab.active {
  @apply bg-blue-600 text-white;
}

.tab-count {
  @apply ml-auto bg-blue-500 text-xs px-2 py-1 rounded-full;
}

.chat-section {
  @apply flex-1 flex flex-col;
}

.chat-messages {
  @apply flex-1 overflow-y-auto p-4 space-y-3;
}

.chat-message {
  @apply text-sm;
}

.chat-message.highlighted {
  @apply bg-yellow-500/20 p-2 rounded;
}

.message-header {
  @apply flex items-center gap-2 mb-1;
}

.username {
  @apply font-semibold;
}

.timestamp {
  @apply text-xs text-gray-400;
}

.chat-input-section {
  @apply border-t border-gray-700 p-4;
}

.chat-input-wrapper {
  @apply flex gap-2;
}

.chat-input {
  @apply flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400;
}

.products-section {
  @apply flex-1 flex flex-col;
}

.products-list {
  @apply flex-1 overflow-y-auto p-4 space-y-4;
}

.product-item {
  @apply bg-gray-700 rounded-lg p-3;
}

.product-item.showcased {
  @apply ring-2 ring-blue-500;
}

.product-image {
  @apply relative mb-2;
}

.product-image img {
  @apply w-full h-32 object-cover rounded;
}

.exclusive-badge {
  @apply absolute top-2 right-2 bg-red-500 text-xs px-2 py-1 rounded;
}

.reactions-section {
  @apply flex-1 p-4;
}

.reaction-buttons {
  @apply grid grid-cols-2 gap-3;
}

.reaction-btn.large {
  @apply bg-gray-700 p-4 rounded-lg text-center hover:bg-gray-600 transition-colors;
}

.reaction-emoji {
  @apply text-2xl block mb-1;
}

.analytics-section {
  @apply flex-1 p-4;
}

.analytics-grid {
  @apply grid grid-cols-2 gap-4 mb-6;
}

.metric-card {
  @apply bg-gray-700 p-4 rounded-lg text-center;
}

.metric-value {
  @apply text-2xl font-bold mb-1;
}

.metric-label {
  @apply text-sm text-gray-400;
}

.mobile-bottom-panel {
  @apply fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700;
}

.mobile-tabs {
  @apply flex;
}

.mobile-tab {
  @apply flex-1 p-3 text-center;
}

.mobile-tab.active {
  @apply bg-blue-600;
}

.loading-overlay {
  @apply absolute inset-0 bg-black/75 flex flex-col items-center justify-center;
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes reactionFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1.5);
    opacity: 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .stream-container {
    @apply flex-col;
  }
  
  .interactive-sidebar {
    @apply hidden;
  }
  
  .video-section {
    @apply h-64;
  }
}
</style>
