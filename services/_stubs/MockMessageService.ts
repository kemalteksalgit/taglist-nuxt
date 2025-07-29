/**
 * STUB: Mock Message Service
 * TODO: Connect to real messaging API endpoints
 */

export interface User {
  id: string
  name: string
  avatar: string
  online: boolean
}

export interface Message {
  id: string
  content: string
  time: string
  senderId: string
  type: 'text' | 'image' | 'product'
  productId?: string
}

export interface Conversation {
  id: string
  user: User
  lastMessage: Message
  unreadCount: number
  product?: {
    id: string
    name: string
    image: string
  }
}

export interface MessageStore {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
}

export class MockMessageService {
  
  async getConversations(): Promise<Conversation[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    console.log('TODO API: Replace with real conversations endpoint')
    
    return [
      {
        id: '1',
        user: {
          id: 'user1',
          name: 'Mehmet Alıcı',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
          online: true
        },
        lastMessage: {
          id: 'msg1',
          content: 'Ürün hala satılık mı?',
          time: new Date(Date.now() - 300000).toISOString(), // 5 min ago
          senderId: 'user1',
          type: 'text'
        },
        unreadCount: 2,
        product: {
          id: 'product1',
          name: 'iPhone 13 Pro',
          image: 'https://picsum.photos/300/300?random=1'
        }
      },
      {
        id: '2',
        user: {
          id: 'user2',
          name: 'Ayşe Satıcı',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse',
          online: false
        },
        lastMessage: {
          id: 'msg2',
          content: 'Teşekkürler, güzel bir alışveriş oldu!',
          time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          senderId: 'user2',
          type: 'text'
        },
        unreadCount: 0,
        product: {
          id: 'product2',
          name: 'MacBook Air',
          image: 'https://picsum.photos/300/300?random=2'
        }
      },
      {
        id: '3',
        user: {
          id: 'user3',
          name: 'Ali Kullanıcı',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ali',
          online: true
        },
        lastMessage: {
          id: 'msg3',
          content: 'Kargo ne zaman gelir?',
          time: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          senderId: 'user3',
          type: 'text'
        },
        unreadCount: 1
      }
    ]
  }
  
  async getMessages(conversationId: string): Promise<Message[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('TODO API: Replace with real messages endpoint', { conversationId })
    
    // Mock conversation messages
    return [
      {
        id: 'msg1',
        content: 'Merhaba, ürünle ilgili sorum var.',
        time: new Date(Date.now() - 900000).toISOString(), // 15 min ago
        senderId: 'user1',
        type: 'text'
      },
      {
        id: 'msg2',
        content: 'Tabii, sorabilirsin. Nasıl yardımcı olabilirim?',
        time: new Date(Date.now() - 600000).toISOString(), // 10 min ago
        senderId: 'current-user',
        type: 'text'
      },
      {
        id: 'msg3',
        content: 'Ürün hala satılık mı?',
        time: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        senderId: 'user1',
        type: 'text'
      }
    ]
  }
  
  async sendMessage(conversationId: string, content: string, type: 'text' | 'image' = 'text'): Promise<Message> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('TODO API: Replace with real send message endpoint', { 
      conversationId, 
      content, 
      type 
    })
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      content,
      time: new Date().toISOString(),
      senderId: 'current-user',
      type
    }
    
    return newMessage
  }
  
  async createConversation(userId: string, productId?: string): Promise<Conversation> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('TODO API: Replace with real create conversation endpoint', { 
      userId, 
      productId 
    })
    
    return {
      id: `conv_${Date.now()}`,
      user: {
        id: userId,
        name: 'Yeni Kullanıcı',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        online: true
      },
      lastMessage: {
        id: `msg_${Date.now()}`,
        content: 'Konuşma başlatıldı',
        time: new Date().toISOString(),
        senderId: 'current-user',
        type: 'text'
      },
      unreadCount: 0
    }
  }
  
  async markAsRead(conversationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('TODO API: Replace with real mark as read endpoint', { conversationId })
  }
}

// Export singleton instance
export const mockMessageService = new MockMessageService()
