<template>
  <button 
    @click="goBack" 
    class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 group"
    :class="buttonClasses"
  >
    <Icon :name="iconName" class="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'white' | 'dark' | 'transparent'
  to?: string
  iconName?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  to: undefined,
  iconName: 'heroicons:arrow-left'
})

const router = useRouter()

const buttonClasses = computed(() => {
  switch (props.variant) {
    case 'white':
      return 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
    case 'dark':
      return 'bg-gray-800 text-white hover:bg-gray-700'
    case 'transparent':
      return 'bg-transparent text-gray-600 hover:bg-gray-100'
    default:
      return 'bg-white/10 hover:bg-white/20 text-white'
  }
})

const goBack = () => {
  if (props.to) {
    router.push(props.to)
  } else {
    router.back()
  }
}
</script>
