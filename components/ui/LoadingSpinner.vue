<!-- components/ui/LoadingSpinner.vue -->
<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div 
      class="loading-spinner"
      :class="[
        sizeClass,
        colorClass
      ]"
      :style="{ borderTopColor: color }"
    ></div>
    <span v-if="text" class="ml-3 text-sm font-medium" :class="textColorClass">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  text?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: '#3b82f6'
})

const containerClass = computed(() => {
  if (props.fullscreen) {
    return 'fixed inset-0 bg-white bg-opacity-75 z-50'
  }
  return 'py-8'
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-4 h-4 border'
    case 'lg': return 'w-10 h-10 border-4'
    case 'xl': return 'w-12 h-12 border-4'
    default: return 'w-6 h-6 border-2'
  }
})

const colorClass = computed(() => {
  return 'border-gray-300 rounded-full animate-spin'
})

const textColorClass = computed(() => {
  return 'text-gray-600'
})
</script>
