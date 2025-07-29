<script setup lang="ts">
import { ref, computed } from 'vue'

// SEO
useHead({
  title: 'Mesajlar & Bildirimler - TagList',
  meta: [
    { name: 'description', content: 'TagList mesajlaşma ve bildirim sistemi. Alıcılar ve satıcılarla güvenli mesajlaşma, önemli bildirimleri takip etme.' }
  ]
})

// Reactive state
const activeTab = ref<'messages' | 'notifications'>('messages')

// Sample data
const messages = ref([
  {
    id: 1,
    sender: 'Ahmet K.',
    avatar: '👤',
    lastMessage: 'Ürün hala satılık mı?',
    time: '2 dakika önce',
    unread: true,
    product: 'iPhone 15 Pro Max'
  },
  {
    id: 2,
    sender: 'Zeynep A.',
    avatar: '👩',
    lastMessage: 'Pazarlık yapabilir miyiz?',
    time: '1 saat önce',
    unread: true,
    product: 'Samsung Galaxy S24'
  },
  {
    id: 3,
    sender: 'Mehmet S.',
    avatar: '👨',
    lastMessage: 'Teşekkürler, güzel bir alışveriş oldu.',
    time: '3 saat önce',
    unread: false,
    product: 'MacBook Air M2'
  }
])

const notifications = ref([
  {
    id: 1,
    type: 'sale',
    icon: '💰',
    title: 'Ürününüz satıldı!',
    message: 'iPhone 15 Pro Max başarıyla satıldı.',
    time: '10 dakika önce',
    unread: true
  },
  {
    id: 2,
    type: 'bid',
    icon: '⚡',
    title: 'Yeni teklif aldınız',
    message: 'Samsung Galaxy S24 için 15.000₺ teklif aldınız.',
    time: '30 dakika önce',
    unread: true
  },
  {
    id: 3,
    type: 'system',
    icon: '🔔',
    title: 'Profil güncellendi',
    message: 'Profil bilgileriniz başarıyla güncellendi.',
    time: '2 saat önce',
    unread: false
  },
  {
    id: 4,
    type: 'warning',
    icon: '⚠️',
    title: 'İlan süresi bitiyor',
    message: 'MacBook Pro ilanınızın süresi 2 gün içinde bitecek.',
    time: '5 saat önce',
    unread: false
  }
])

// Computed
const unreadMessagesCount = computed(() => messages.value.filter(m => m.unread).length)
const unreadNotificationsCount = computed(() => notifications.value.filter(n => n.unread).length)

// Methods
const switchTab = (tab: 'messages' | 'notifications') => {
  console.log('Switching to tab:', tab)
  activeTab.value = tab
}

const markAsRead = (type: 'message' | 'notification', id: number) => {
  console.log('Marking as read:', type, id)
  if (type === 'message') {
    const message = messages.value.find(m => m.id === id)
    if (message) {
      message.unread = false
      console.log('Message marked as read:', message)
    }
  } else {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.unread = false
      console.log('Notification marked as read:', notification)
    }
  }
}

const openChat = (messageId: number) => {
  console.log('Opening chat for message ID:', messageId)
  markAsRead('message', messageId)
  // Chat sayfasına yönlendir
  navigateTo(`/chat/${messageId}`)
}

const openNotification = (notificationId: number) => {
  console.log('Opening notification ID:', notificationId)
  markAsRead('notification', notificationId)
  // Bildirim detay sayfasına yönlendir
  navigateTo(`/notification/${notificationId}`)
}

const createNewMessage = () => {
  console.log('Creating new message')
  // Yeni mesaj oluşturma sayfasına yönlendirme
  navigateTo('/messages/new')
}

const toggleNotifications = () => {
  console.log('Opening notification settings')
  // Bildirim ayarları sayfasına yönlendirme
  navigateTo('/settings/notifications')
}
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Mesajlar & Bildirimler</h1>
          
          <!-- Tab Navigation -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="switchTab('messages')"
              :class="[
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all active:scale-95',
                activeTab === 'messages'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              ]"
            >
              💬 Mesajlar
              <span v-if="unreadMessagesCount > 0" class="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {{ unreadMessagesCount }}
              </span>
            </button>
            
            <button
              @click="switchTab('notifications')"
              :class="[
                'flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all active:scale-95',
                activeTab === 'notifications'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              ]"
            >
              🔔 Bildirimler
              <span v-if="unreadNotificationsCount > 0" class="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {{ unreadNotificationsCount }}
              </span>
            </button>
          </div>
        </div>

        <!-- Messages Tab -->
        <div v-if="activeTab === 'messages'" class="space-y-4">
          <div v-if="messages.length === 0" class="bg-white rounded-xl shadow-lg p-8 text-center">
            <div class="text-6xl mb-4">💬</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Henüz mesajınız yok</h3>
            <p class="text-gray-600">Ürün satın aldığınızda veya sattığınızda mesajlar burada görünecek.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="message in messages"
              :key="message.id"
              @click="openChat(message.id)"
              :class="[
                'bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-l-4 active:scale-[0.98]',
                message.unread ? 'border-l-blue-500' : 'border-l-transparent'
              ]"
            >
              <div class="flex items-center space-x-4">
                <div class="text-3xl">{{ message.avatar }}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="font-semibold text-gray-900 truncate">{{ message.sender }}</h3>
                    <span class="text-sm text-gray-500">{{ message.time }}</span>
                  </div>
                  <p class="text-sm text-blue-600 mb-1">{{ message.product }}</p>
                  <p :class="['text-sm truncate', message.unread ? 'font-medium text-gray-900' : 'text-gray-600']">
                    {{ message.lastMessage }}
                  </p>
                </div>
                <div v-if="message.unread" class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div v-if="activeTab === 'notifications'" class="space-y-4">
          <div v-if="notifications.length === 0" class="bg-white rounded-xl shadow-lg p-8 text-center">
            <div class="text-6xl mb-4">🔔</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Henüz bildiriminiz yok</h3>
            <p class="text-gray-600">Önemli güncellemeler ve aktiviteler burada görünecek.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              @click="openNotification(notification.id)"
              :class="[
                'bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-l-4 active:scale-[0.98]',
                notification.unread ? 'border-l-red-500' : 'border-l-transparent'
              ]"
            >
              <div class="flex items-center space-x-4">
                <div class="text-3xl flex-shrink-0">{{ notification.icon }}</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <h3 :class="['truncate', notification.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700']">
                      {{ notification.title }}
                    </h3>
                    <span class="text-sm text-gray-500 flex-shrink-0 ml-2">{{ notification.time }}</span>
                  </div>
                  <p :class="['text-sm', notification.unread ? 'text-gray-700' : 'text-gray-600']">
                    {{ notification.message }}
                  </p>
                </div>
                <div v-if="notification.unread" class="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="createNewMessage"
              class="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all active:scale-95"
            >
              <span class="text-2xl">✉️</span>
              <span class="font-medium text-blue-900">Yeni Mesaj</span>
            </button>
            <button 
              @click="toggleNotifications"
              class="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all active:scale-95"
            >
              <span class="text-2xl">🔕</span>
              <span class="font-medium text-gray-700">Bildirim Ayarları</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
