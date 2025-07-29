<script setup lang="ts">
const route = useRoute()
const chatId = route.params.id

useHead({
  title: `Sohbet - TagList`,
  meta: [
    { name: 'description', content: 'TagList mesajlaşma sistemi. Güvenli sohbet ortamı.' }
  ]
})

const chatData = ref({
  id: chatId,
  user: {
    name: 'Ahmet K.',
    avatar: '👤',
    isOnline: true
  },
  product: {
    name: 'iPhone 15 Pro Max',
    price: '45.000₺',
    image: '📱'
  },
  messages: [
    {
      id: 1,
      sender: 'other',
      message: 'Merhaba, bu ürün hala satılık mı?',
      time: '14:30',
      isRead: true,
      isFile: false
    },
    {
      id: 2,
      sender: 'me',
      message: 'Evet, hala satılık. İlginiz için teşekkürler.',
      time: '14:32',
      isRead: true,
      isFile: false
    }
  ]
})

const newMessage = ref('')
const showQuickMessages = ref(false)
const showReportModal = ref(false)

// Quick message templates
const quickMessages = [
  'Merhaba, bu ürün hala satılık mı?',
  'Pazarlık yapabilir miyiz?',
  'Ürünün durumu nasıl?',
  'Ne zaman teslim edebilirsiniz?',
  'Garantisi var mı?',
  'Kargo ücreti ne kadar?',
  'Daha detaylı fotoğraf gönderebilir misiniz?',
  'İlgileniyorum, görüşebilir miyiz?'
]

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatData.value.messages.push({
      id: Date.now(),
      sender: 'me',
      message: newMessage.value,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      isFile: false
    })
    newMessage.value = ''
    showQuickMessages.value = false
  }
}

const sendQuickMessage = (message: string) => {
  newMessage.value = message
  sendMessage()
}

const sendFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,application/pdf,.doc,.docx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      chatData.value.messages.push({
        id: Date.now(),
        sender: 'me',
        message: `📎 ${file.name} gönderildi`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        isFile: true
      })
    }
  }
  input.click()
}

const reportUser = () => {
  showReportModal.value = true
}

const submitReport = (reason: string) => {
  console.log('Kullanıcı şikayet edildi:', reason)
  showReportModal.value = false
  alert('Şikayetiniz alındı. İnceleme süreci başlatıldı.')
}

const goBack = () => {
  navigateTo('/messages')
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <!-- Chat Header -->
      <div class="bg-white shadow-lg border-b p-4">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="flex items-center space-x-3">
              <div class="text-3xl">{{ chatData.user.avatar }}</div>
              <div>
                <h2 class="font-semibold text-gray-900">{{ chatData.user.name }}</h2>
                <p class="text-sm text-green-600" v-if="chatData.user.isOnline">🟢 Çevrimiçi</p>
              </div>
            </div>
          </div>
          
          <!-- Product Info with Report Button -->
          <div class="flex items-center space-x-3 bg-blue-50 rounded-lg p-3">
            <span class="text-2xl">{{ chatData.product.image }}</span>
            <div>
              <p class="font-medium text-blue-900">{{ chatData.product.name }}</p>
              <p class="text-sm text-blue-600">{{ chatData.product.price }}</p>
            </div>
            <button @click="reportUser" class="ml-auto p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Şikayet Et">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="max-w-4xl mx-auto p-4">
        <div class="bg-white rounded-xl shadow-lg h-96 flex flex-col">
          <!-- Messages List -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              v-for="message in chatData.messages"
              :key="message.id"
              :class="[
                'flex',
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  message.sender === 'me'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900',
                  message.isFile ? 'border-2 border-dashed border-gray-300' : ''
                ]"
              >
                <p class="text-sm">{{ message.message }}</p>
                <p :class="[
                  'text-xs mt-1',
                  message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                ]">
                  {{ message.time }}
                </p>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="border-t p-4">
            <!-- Quick Messages -->
            <div v-if="showQuickMessages" class="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Hazır Mesajlar:</h4>
              <div class="space-y-2">
                <button
                  v-for="quickMsg in quickMessages"
                  :key="quickMsg"
                  @click="sendQuickMessage(quickMsg)"
                  class="block w-full text-left text-sm p-2 bg-white rounded hover:bg-blue-50 transition-colors"
                >
                  {{ quickMsg }}
                </button>
              </div>
            </div>

            <div class="flex space-x-2">
              <!-- Quick Messages Toggle -->
              <button
                @click="showQuickMessages = !showQuickMessages"
                class="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Hazır Mesajlar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </button>

              <!-- File Upload -->
              <button
                @click="sendFile"
                class="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Dosya Gönder"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </button>

              <!-- Message Input -->
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="Mesajınızı yazın..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Send Button -->
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 grid grid-cols-2 gap-4">
          <button 
            @click="sendQuickMessage('Ürünün detaylı fotoğraflarını gönderebilir misiniz?')"
            class="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all"
          >
            <div class="text-2xl mb-2">📸</div>
            <p class="text-sm font-medium text-gray-700">Fotoğraf İste</p>
          </button>
          <button 
            @click="sendQuickMessage('Bu ürün için teklif yapmak istiyorum.')"
            class="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all"
          >
            <div class="text-2xl mb-2">💰</div>
            <p class="text-sm font-medium text-gray-700">Teklif Yap</p>
          </button>
        </div>

        <!-- Report Modal -->
        <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Kullanıcıyı Şikayet Et</h3>
            <div class="space-y-3">
              <button 
                @click="submitReport('spam')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🚫 Spam veya Yanıltıcı İçerik
              </button>
              <button 
                @click="submitReport('inappropriate')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ⚠️ Uygunsuz Davranış
              </button>
              <button 
                @click="submitReport('fake')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🚨 Sahte Ürün/Dolandırıcılık
              </button>
              <button 
                @click="submitReport('harassment')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                😠 Taciz veya Hakaret
              </button>
            </div>
            <div class="flex space-x-3 mt-6">
              <button 
                @click="showReportModal = false"
                class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
  </NuxtLayout>
</template>
})

const newMessage = ref('')
const showQuickMessages = ref(false)
const showReportModal = ref(false)

// Quick message templates
const quickMessages = [
  'Merhaba, bu ürün hala satılık mı?',
  'Pazarlık yapabilir miyiz?',
  'Ürünün durumu nasıl?',
  'Ne zaman teslim edebilirsiniz?',
  'Garantisi var mı?',
  'Kargo ücreti ne kadar?',
  'Daha detaylı fotoğraf gönderebilir misiniz?',
  'İlgileniyorum, görüşebilir miyiz?'
]

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatData.value.messages.push({
      id: Date.now(),
      sender: 'me',
      message: newMessage.value,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      isFile: false
    })
    newMessage.value = ''
    showQuickMessages.value = false
  }
}

const sendQuickMessage = (message: string) => {
  newMessage.value = message
  sendMessage()
}

const sendFile = () => {
  // Dosya gönderme işlemi
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,application/pdf,.doc,.docx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      chatData.value.messages.push({
        id: Date.now(),
        sender: 'me',
        message: `📎 ${file.name} gönderildi`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        isFile: true
      })
    }
  }
  input.click()
}

const reportUser = () => {
  showReportModal.value = true
}

const submitReport = (reason: string) => {
  console.log('Kullanıcı şikayet edildi:', reason)
  showReportModal.value = false
  // Toast bildirimi göster
  alert('Şikayetiniz alındı. İnceleme süreci başlatıldı.')
}

const goBack = () => {
  navigateTo('/messages')
}
</script>
        <div class="mt-6 grid grid-cols-2 gap-4">
          <button 
            @click="sendQuickMessage('Ürünün detaylı fotoğraflarını gönderebilir misiniz?')"
            class="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all"
          >
            <div class="text-2xl mb-2">📸</div>
            <p class="text-sm font-medium text-gray-700">Fotoğraf İste</p>
          </button>
          <button 
            @click="sendQuickMessage('Bu ürün için teklif yapmak istiyorum.')"
            class="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all"
          >
            <div class="text-2xl mb-2">💰</div>
            <p class="text-sm font-medium text-gray-700">Teklif Yap</p>
          </button>
        </div>

        <!-- Report Modal -->
        <div v-if="showReportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Kullanıcıyı Şikayet Et</h3>
            <div class="space-y-3">
              <button 
                @click="submitReport('spam')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🚫 Spam veya Yanıltıcı İçerik
              </button>
              <button 
                @click="submitReport('inappropriate')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ⚠️ Uygunsuz Davranış
              </button>
              <button 
                @click="submitReport('fake')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🚨 Sahte Ürün/Dolandırıcılık
              </button>
              <button 
                @click="submitReport('harassment')"
                class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                😠 Taciz veya Hakaret
              </button>
            </div>
            <div class="flex space-x-3 mt-6">
              <button 
                @click="showReportModal = false"
                class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatData.value.messages.push({
      id: Date.now(),
      sender: 'me',
      message: newMessage.value,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      isFile: false
    })
    newMessage.value = ''
    showQuickMessages.value = false
  }
}

const sendQuickMessage = (message: string) => {
  newMessage.value = message
  sendMessage()
}

const sendFile = () => {
  // Dosya gönderme işlemi
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,application/pdf,.doc,.docx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      chatData.value.messages.push({
        id: Date.now(),
        sender: 'me',
        message: `📎 ${file.name} gönderildi`,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        isFile: true
      })
    }
  }
  input.click()
}

const reportUser = () => {
  showReportModal.value = true
}

const submitReport = (reason: string) => {
  console.log('Kullanıcı şikayet edildi:', reason)
  showReportModal.value = false
  // Toast bildirimi göster
  alert('Şikayetiniz alındı. İnceleme süreci başlatıldı.')
}

const goBack = () => {
  navigateTo('/messages')
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <!-- Chat Header -->
      <div class="bg-white shadow-lg border-b p-4">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="flex items-center space-x-3">
              <div class="text-3xl">{{ chatData.user.avatar }}</div>
              <div>
                <h2 class="font-semibold text-gray-900">{{ chatData.user.name }}</h2>
                <p class="text-sm text-green-600" v-if="chatData.user.isOnline">🟢 Çevrimiçi</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 bg-blue-50 rounded-lg p-3">
            <span class="text-2xl">{{ chatData.product.image }}</span>
            <div>
              <p class="font-medium text-blue-900">{{ chatData.product.name }}</p>
              <p class="text-sm text-blue-600">{{ chatData.product.price }}</p>
            </div>
            <button @click="reportUser" class="ml-auto p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Şikayet Et">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="max-w-4xl mx-auto p-4">
        <div class="bg-white rounded-xl shadow-lg h-96 flex flex-col">
          <!-- Messages List -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              v-for="message in chatData.messages"
              :key="message.id"
              :class="[
                'flex',
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              ]"
            >
              <div
                :class="[
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  message.sender === 'me'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900',
                  message.isFile ? 'border-2 border-dashed border-gray-300' : ''
                ]"
              >
                <p class="text-sm">{{ message.message }}</p>
                <p :class="[
                  'text-xs mt-1',
                  message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                ]">
                  {{ message.time }}
                </p>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="border-t p-4">
            <!-- Quick Messages -->
            <div v-if="showQuickMessages" class="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Hazır Mesajlar:</h4>
              <div class="space-y-2">
                <button
                  v-for="quickMsg in quickMessages"
                  :key="quickMsg"
                  @click="sendQuickMessage(quickMsg)"
                  class="block w-full text-left text-sm p-2 bg-white rounded hover:bg-blue-50 transition-colors"
                >
                  {{ quickMsg }}
                </button>
              </div>
            </div>

            <div class="flex space-x-2">
              <!-- Quick Messages Toggle -->
              <button
                @click="showQuickMessages = !showQuickMessages"
                class="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Hazır Mesajlar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </button>

              <!-- File Upload -->
              <button
                @click="sendFile"
                class="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                title="Dosya Gönder"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                </svg>
              </button>

              <!-- Message Input -->
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="Mesajınızı yazın..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              
              <!-- Send Button -->
              <button
                @click="sendMessage"
                :disabled="!newMessage.trim()"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 grid grid-cols-2 gap-4">
          <button class="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all">
            <div class="text-2xl mb-2">�</div>
            <p class="text-sm font-medium text-gray-700">Fotoğraf Gönder</p>
          </button>
          <button class="bg-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-all">
            <div class="text-2xl mb-2">💰</div>
            <p class="text-sm font-medium text-gray-700">Teklif Yap</p>
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
