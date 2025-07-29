<!-- components/ui/NotificationContainer.vue -->
<template>
  <Teleport to="body">
    <div 
      v-for="position in uniquePositions"
      :key="position"
      :class="getPositionClass(position)"
      class="fixed z-50 space-y-2 pointer-events-none"
    >
      <TransitionGroup
        :enter-active-class="getEnterClass(position)"
        :enter-from-class="getEnterFromClass(position)"
        enter-to-class="transform opacity-100 scale-100"
        :leave-active-class="getLeaveClass(position)"
        :leave-from-class="getLeaveFromClass(position)"
        :leave-to-class="getLeaveToClass(position)"
        move-class="transition-all duration-300"
      >
        <div
          v-for="notification in getNotificationsByPosition(position)"
          :key="notification.id"
          :class="getNotificationClass(notification.type)"
          class="max-w-sm w-full bg-white rounded-lg shadow-lg border pointer-events-auto"
        >
          <div class="p-4">
            <div class="flex items-start">
              <!-- Icon -->
              <div v-if="notification.showIcon" class="flex-shrink-0">
                <Icon 
                  :name="getIcon(notification.type)" 
                  :class="getIconColor(notification.type)"
                  class="w-5 h-5"
                />
              </div>

              <!-- Content -->
              <div class="ml-3 w-0 flex-1">
                <p :class="getTitleColor(notification.type)" class="text-sm font-medium">
                  {{ notification.title }}
                </p>
                <p v-if="notification.message" class="mt-1 text-sm text-gray-500">
                  {{ notification.message }}
                </p>
              </div>

              <!-- Close button -->
              <div v-if="notification.closable" class="ml-4 flex-shrink-0 flex">
                <button
                  @click="removeNotification(notification.id)"
                  class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Progress bar for timed notifications -->
          <div 
            v-if="notification.duration > 0"
            class="h-1 bg-gray-200 rounded-b-lg overflow-hidden"
          >
            <div 
              :class="getProgressColor(notification.type)"
              class="h-full transition-all ease-linear"
              :style="{ 
                width: '100%',
                animation: `shrink ${notification.duration}ms linear forwards`
              }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotification } from '~/composables/useNotification'

const { notifications, removeNotification } = useNotification()

const uniquePositions = computed(() => {
  return [...new Set(notifications.value.map(n => n.position))]
})

const getNotificationsByPosition = (position: string) => {
  return notifications.value.filter(n => n.position === position)
}

const getPositionClass = (position: string) => {
  const classes = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }
  return classes[position as keyof typeof classes] || classes['top-right']
}

const getEnterClass = (position: string) => {
  return 'transform transition duration-300 ease-out'
}

const getEnterFromClass = (position: string) => {
  if (position.includes('right')) {
    return 'translate-x-full opacity-0 scale-95'
  } else if (position.includes('left')) {
    return '-translate-x-full opacity-0 scale-95'
  } else {
    return '-translate-y-2 opacity-0 scale-95'
  }
}

const getLeaveClass = (position: string) => {
  return 'transform transition duration-200 ease-in'
}

const getLeaveFromClass = (position: string) => {
  return 'opacity-100 scale-100'
}

const getLeaveToClass = (position: string) => {
  if (position.includes('right')) {
    return 'translate-x-full opacity-0 scale-95'
  } else if (position.includes('left')) {
    return '-translate-x-full opacity-0 scale-95'
  } else {
    return '-translate-y-2 opacity-0 scale-95'
  }
}

const getNotificationClass = (type: string) => {
  const classes = {
    success: 'border-green-200',
    error: 'border-red-200',
    warning: 'border-yellow-200',
    info: 'border-blue-200'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIcon = (type: string) => {
  const icons = {
    success: 'heroicons:check-circle',
    error: 'heroicons:x-circle',
    warning: 'heroicons:exclamation-triangle',
    info: 'heroicons:information-circle'
  }
  return icons[type as keyof typeof icons] || icons.info
}

const getIconColor = (type: string) => {
  const colors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return colors[type as keyof typeof colors] || colors.info
}

const getTitleColor = (type: string) => {
  const colors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }
  return colors[type as keyof typeof colors] || colors.info
}

const getProgressColor = (type: string) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }
  return colors[type as keyof typeof colors] || colors.info
}
</script>

<style scoped>
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
