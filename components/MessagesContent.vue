<script setup>
// State
const searchQuery = ref('')
const selectedConversation = ref(null)
const newMessage = ref('')
const conversations = ref([
  {
    id: 1,
    user: {
      id: 'user1',
      name: 'Ahmet Yılmaz',
      avatar: 'https://i.pravatar.cc/50?img=1',
      lastSeen: '2 dk önce',
      status: 'online'
    },
    lastMessage: 'Bu ürünü satıyor musunuz hala?',
    time: '14:30',
    unreadCount: 2,
    productContext: {
      id: 'prod1',
      name: 'iPhone 13 Pro Max',
      price: '15.000',
      image: 'https://picsum.photos/60/60?random=1'
    }
  },
  {
    id: 2,
    user: {
      id: 'user2',
      name: 'Ayşe Kaya',
      avatar: 'https://i.pravatar.cc/50?img=2',
      lastSeen: '5 dk önce',
      status: 'away'
    },
    lastMessage: 'Fiyat konusunda pazarlık olur mu?',
    time: '13:45',
    unreadCount: 0,
    productContext: {
      id: 'prod2',
      name: 'MacBook Air M2',
      price: '22.000',
      image: 'https://picsum.photos/60/60?random=2'
    }
  },
  {
    id: 3,
    user: {
      id: 'user3',
      name: 'Mehmet Demir',
      avatar: 'https://i.pravatar.cc/50?img=3',
      lastSeen: '1 saat önce',
      status: 'offline'
    },
    lastMessage: 'Teşekkürler, düşüneyim.',
    time: '12:20',
    unreadCount: 0,
    productContext: {
      id: 'prod3',
      name: 'Samsung Galaxy S23',
      price: '12.500',
      image: 'https://picsum.photos/60/60?random=3'
    }
  }
])

const messages = ref([
  {
    id: 'msg1',
    content: 'Merhaba, bu ürünü satıyor musunuz hala?',
    time: '14:25',
    senderId: 'user1'
  },
  {
    id: 'msg2',
    content: 'Evet hala satılık. Hangi konuda bilgi almak istiyorsunuz?',
    time: '14:27',
    senderId: 'current-user'
  },
  {
    id: 'msg3',
    content: 'Bu ürünü satıyor musunuz hala?',
    time: '14:30',
    senderId: 'user1'
  }
])

// Computed
const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  return conversations.value.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const selectConversation = (conversation) => {
  selectedConversation.value = conversation
  conversation.unreadCount = 0
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  const message = {
    id: 'msg' + Date.now(),
    content: newMessage.value.trim(),
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    senderId: 'current-user'
  }
  
  messages.value.push(message)
  newMessage.value = ''
  
  // Auto response
  setTimeout(() => {
    const responses = [
      'Anladım, düşünmem lazım.',
      'Fiyat konusunda esnek olabilirim.',
      'Ne zaman buluşabiliriz?',
      'Ürünü görmeye gelebilirsiniz.'
    ]
    const response = {
      id: 'msg' + Date.now(),
      content: responses[Math.floor(Math.random() * responses.length)],
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      senderId: selectedConversation.value.user.id
    }
    messages.value.push(response)
  }, 1500)
}

const sendQuickReply = (content) => {
  const message = {
    id: 'msg' + Date.now(),
    content,
    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    senderId: 'current-user'
  }
  
  messages.value.push(message)
}

// Action methods
const viewProfile = () => {
  alert(`${selectedConversation.value?.user.name} kullanıcısının profili görüntüleniyor...`)
}

const viewListings = () => {
  alert(`${selectedConversation.value?.user.name} kullanıcısının ilanları görüntüleniyor...`)
}

const reportUser = () => {
  if (confirm(`${selectedConversation.value?.user.name} kullanıcısını şikayet etmek istediğinizden emin misiniz?`)) {
    alert('Şikayetiniz alındı. İnceleme süreci başlatıldı.')
  }
}

const goToProduct = () => {
  alert(`${selectedConversation.value?.productContext.name} ürünü sayfasına yönlendiriliyor...`)
}

const startNewChat = () => {
  alert('Yeni mesaj özelliği yakında aktif olacak!')
}

const toggleEmoji = () => {
  // Simple emoji insertion
  const emojis = ['😊', '👍', '❤️', '🔥', '💯', '🤝', '👌', '🙏']
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
  newMessage.value += randomEmoji
}

// Initialize
onMounted(() => {
  if (conversations.value.length > 0) {
    selectConversation(conversations.value[0])
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div class="max-w-6xl mx-auto p-6">
      <div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
        <div class="flex h-[calc(100vh-6rem)]">
          
          <!-- Conversations Sidebar -->
          <div class="w-80 border-r border-gray-200/50 flex flex-col">
            <!-- Header -->
            <div class="p-6 border-b border-gray-200/50 bg-white/60">
              <div class="flex items-center justify-between mb-4">
                <h1 class="text-xl font-bold text-gray-900">Mesajlar</h1>
                <button 
                  @click="startNewChat"
                  class="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  title="Yeni Mesaj"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span class="text-sm font-medium hidden sm:block">Yeni</span>
                </button>
              </div>
              
              <!-- Search -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Kişi ara..."
                  class="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                >
                <svg class="w-4 h-4 absolute left-3 top-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>

            <!-- Conversations List -->
            <div class="flex-1 overflow-y-auto">
              <div
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                @click="selectConversation(conversation)"
                class="p-4 mx-3 my-2 rounded-2xl cursor-pointer transition-all hover:bg-white/80"
                :class="{
                  'bg-blue-500 text-white': selectedConversation?.id === conversation.id,
                  'bg-white/50': selectedConversation?.id !== conversation.id
                }"
              >
                <div class="flex items-center space-x-3">
                  <!-- Avatar -->
                  <div class="relative">
                    <img
                      :src="conversation.user.avatar"
                      :alt="conversation.user.name"
                      class="w-12 h-12 rounded-full object-cover"
                    >
                    <div 
                      class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      :class="{
                        'bg-green-500 animate-pulse': conversation.user.status === 'online',
                        'bg-yellow-500': conversation.user.status === 'away',
                        'bg-gray-400': conversation.user.status === 'offline'
                      }"
                      :title="conversation.user.status === 'online' ? 'Çevrimiçi' : conversation.user.status === 'away' ? 'Uzakta' : 'Çevrimdışı'"
                    ></div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold truncate" 
                          :class="selectedConversation?.id === conversation.id ? 'text-white' : 'text-gray-900'">
                        {{ conversation.user.name }}
                      </h3>
                      <span class="text-sm" 
                            :class="selectedConversation?.id === conversation.id ? 'text-blue-100' : 'text-gray-500'">
                        {{ conversation.time }}
                      </span>
                    </div>
                    
                    <!-- Product Context -->
                    <div class="flex items-center space-x-2 mt-1 mb-2">
                      <img 
                        :src="conversation.productContext.image" 
                        :alt="conversation.productContext.name"
                        class="w-6 h-6 rounded object-cover"
                      >
                      <span class="text-xs font-medium" 
                            :class="selectedConversation?.id === conversation.id ? 'text-blue-100' : 'text-blue-600'">
                        {{ conversation.productContext.name }}
                      </span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <p class="text-sm truncate" 
                         :class="selectedConversation?.id === conversation.id ? 'text-blue-100' : 'text-gray-600'">
                        {{ conversation.lastMessage }}
                      </p>
                      <span v-if="conversation.unreadCount > 0"
                            class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                        {{ conversation.unreadCount }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Area -->
          <div class="flex-1 flex flex-col" v-if="selectedConversation">
            <!-- Chat Header -->
            <div class="p-6 border-b border-gray-200/50 bg-white/60">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <img
                    :src="selectedConversation.user.avatar"
                    :alt="selectedConversation.user.name"
                    class="w-12 h-12 rounded-full object-cover"
                  >
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">{{ selectedConversation.user.name }}</h2>
                    <p class="text-sm text-gray-500">{{ selectedConversation.user.lastSeen }}</p>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex items-center space-x-2">
                  <button 
                    @click="viewProfile"
                    class="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="text-sm font-medium hidden sm:block">Profil</span>
                  </button>
                  <button 
                    @click="viewListings"
                    class="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                    <span class="text-sm font-medium hidden sm:block">İlanlar</span>
                  </button>
                  <button 
                    @click="reportUser"
                    class="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span class="text-sm font-medium hidden sm:block">Şikayet</span>
                  </button>
                </div>
              </div>
              
              <!-- Product Context Card -->
              <div class="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div class="flex items-center space-x-3">
                  <img 
                    :src="selectedConversation.productContext.image" 
                    :alt="selectedConversation.productContext.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  >
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ selectedConversation.productContext.name }}</h4>
                    <p class="text-lg font-bold text-blue-600">{{ selectedConversation.productContext.price }} ₺</p>
                  </div>
                  <button 
                    @click="goToProduct"
                    class="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <span>İlana Git</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 13l3 3 7-7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4">
              <div
                v-for="message in messages"
                :key="message.id"
                class="flex"
                :class="message.senderId === 'current-user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl"
                  :class="message.senderId === 'current-user' 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'"
                >
                  <p class="text-sm">{{ message.content }}</p>
                  <p class="text-xs mt-1 opacity-70">{{ message.time }}</p>
                </div>
              </div>
            </div>

            <!-- Quick Replies -->
            <div class="px-6 py-3 border-t border-gray-200/50 bg-white/60">
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="reply in ['Evet, müsait', 'Fiyat konuşalım', 'Yarın buluşalım', 'Detay gönderir misiniz?']"
                  :key="reply"
                  @click="sendQuickReply(reply)"
                  class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {{ reply }}
                </button>
              </div>
            </div>

            <!-- Message Input -->
            <div class="p-6 border-t border-gray-200/50 bg-white/60">
              <div class="flex items-center space-x-4">
                <div class="flex-1 relative">
                  <input
                    v-model="newMessage"
                    type="text"
                    placeholder="Mesajınızı yazın..."
                    @keyup.enter="sendMessage"
                    class="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                  <button 
                    @click="toggleEmoji"
                    class="absolute right-2 top-2 p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                    title="Emoji Ekle"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                </div>
                <button
                  @click="sendMessage"
                  :disabled="!newMessage.trim()"
                  class="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex-1 flex items-center justify-center bg-gray-50/50">
            <div class="text-center">
              <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Mesajlaşmaya başlayın</h3>
              <p class="text-gray-500">Bir konuşma seçin veya yeni mesaj gönderin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
