/**
 * Message Store - Pinia store for messaging functionality
 * Integrates with MockMessageService for data management
 */
import { defineStore } from 'pinia'
import { mockMessageService } from '~/services/_stubs/MockMessageService'
import type { Conversation, Message, User } from '~/services/_stubs/MockMessageService'

export const useMessageStore = defineStore('messages', () => {
  // State
  const conversations = ref<Conversation[]>([])
  const selectedConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')

  // Getters
  const filteredConversations = computed(() => {
    if (!searchQuery.value) return conversations.value
    
    return conversations.value.filter(conv =>
      conv.user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const unreadCount = computed(() => {
    return conversations.value.reduce((total, conv) => total + conv.unreadCount, 0)
  })

  const isConversationSelected = computed(() => {
    return selectedConversation.value !== null
  })

  // Actions
  const loadConversations = async () => {
    try {
      isLoading.value = true
      conversations.value = await mockMessageService.getConversations()
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      isLoading.value = false
    }
  }

  const selectConversation = async (conversation: Conversation) => {
    try {
      selectedConversation.value = conversation
      isLoading.value = true
      
      // Load messages for this conversation
      messages.value = await mockMessageService.getMessages(conversation.id)
      
      // Mark as read
      await mockMessageService.markAsRead(conversation.id)
      conversation.unreadCount = 0
      
    } catch (error) {
      console.error('Failed to select conversation:', error)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (content: string, type: 'text' | 'image' = 'text') => {
    if (!selectedConversation.value) return

    try {
      const newMessage = await mockMessageService.sendMessage(
        selectedConversation.value.id, 
        content, 
        type
      )
      
      // Add to local messages
      messages.value.push(newMessage)
      
      // Update conversation's last message
      selectedConversation.value.lastMessage = newMessage
      
      // Move conversation to top
      const index = conversations.value.findIndex(c => c.id === selectedConversation.value!.id)
      if (index > 0) {
        const conversation = conversations.value[index]
        if (conversation) {
          conversations.value.splice(index, 1)
          conversations.value.unshift(conversation)
        }
      }
      
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const createNewConversation = async (userId: string, productId?: string) => {
    try {
      const newConversation = await mockMessageService.createConversation(userId, productId)
      conversations.value.unshift(newConversation)
      await selectConversation(newConversation)
      return newConversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      return null
    }
  }

  const clearSelectedConversation = () => {
    selectedConversation.value = null
    messages.value = []
  }

  const updateSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  // Format utilities
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Az önce'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} saat önce`
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  return {
    // State
    conversations,
    selectedConversation,
    messages,
    isLoading,
    searchQuery,
    
    // Getters
    filteredConversations,
    unreadCount,
    isConversationSelected,
    
    // Actions
    loadConversations,
    selectConversation,
    sendMessage,
    createNewConversation,
    clearSelectedConversation,
    updateSearchQuery,
    formatTime
  }
})
