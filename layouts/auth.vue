<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
    <!-- Minimal Header for Auth Pages -->
    <header class="flex justify-between items-center p-4">
      <NuxtLink to="/" class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">TL</span>
        </div>
        <span class="text-2xl font-bold text-gray-800">TagList</span>
      </NuxtLink>
      
      <BackButton variant="transparent" to="/" />
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <slot />
    </main>

    <!-- Minimal Footer -->
    <footer class="text-center py-6 text-gray-500 text-sm">
      <p>© 2024 TagList. Tüm hakları saklıdır.</p>
    </footer>
  </div>
</template>
