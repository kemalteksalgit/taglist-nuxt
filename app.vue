<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// Global app configuration
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Initialize auth from storage on app start
onMounted(() => {
  authStore.initAuth()
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.btn-primary {
  @apply px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors;
}

.card {
  @apply bg-white rounded-lg shadow-md border border-gray-200;
}

.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
</style>
