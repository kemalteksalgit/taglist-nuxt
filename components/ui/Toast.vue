<!-- components/ui/Toast.vue -->
<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
        enter-active-class="transform transition duration-300 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transform transition duration-200 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center p-4 rounded-lg shadow-lg max-w-sm w-full"
          :class="getToastClass(toast.type)"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            <Icon 
              :name="getToastIcon(toast.type)" 
              class="w-6 h-6"
              :class="getIconClass(toast.type)"
            />
          </div>

          <!-- Content -->
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium" :class="getTitleClass(toast.type)">
              {{ toast.title }}
            </p>
            <p v-if="toast.message" class="text-sm" :class="getMessageClass(toast.type)">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close Button -->
          <button
            @click="removeToast(toast.id)"
            class="ml-4 flex-shrink-0 rounded-md p-1.5 transition-colors"
            :class="getCloseButtonClass(toast.type)"
          >
            <Icon name="mdi:close" class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type Toast } from '~/composables/useToast'

// Use global toast state
const { toasts, removeToast } = useToast()

const getToastClass = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border border-green-200'
    case 'error':
      return 'bg-red-50 border border-red-200'
    case 'warning':
      return 'bg-yellow-50 border border-yellow-200'
    case 'info':
      return 'bg-blue-50 border border-blue-200'
    default:
      return 'bg-white border border-gray-200'
  }
}

const getToastIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'mdi:check-circle'
    case 'error':
      return 'mdi:alert-circle'
    case 'warning':
      return 'mdi:alert'
    case 'info':
      return 'mdi:information'
    default:
      return 'mdi:information'
  }
}

const getIconClass = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

const getTitleClass = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    case 'info':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}

const getMessageClass = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-700'
    case 'error':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    case 'info':
      return 'text-blue-700'
    default:
      return 'text-gray-700'
  }
}

const getCloseButtonClass = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'text-green-500 hover:bg-green-100'
    case 'error':
      return 'text-red-500 hover:bg-red-100'
    case 'warning':
      return 'text-yellow-500 hover:bg-yellow-100'
    case 'info':
      return 'text-blue-500 hover:bg-blue-100'
    default:
      return 'text-gray-500 hover:bg-gray-100'
  }
}
</script>

<style scoped>
/* Optional: Custom toast animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
