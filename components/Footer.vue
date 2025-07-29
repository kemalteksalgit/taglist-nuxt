<template>
  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div>
          <div class="text-2xl font-bold mb-4">TagList</div>
          <p class="text-gray-400 mb-4">
            Türkiye'nin ilk canlı yayın e-ticaret platformu. Güvenli alışveriş, canlı video deneyimi.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">📘</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">📸</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">🐦</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">📺</a>
          </div>
        </div>

        <!-- Sales Modes -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Alışveriş Modları</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/shop" class="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                <span>🛒</span>
                <span>Klasik Mağaza</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/live" class="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                <span>📺</span>
                <span>Canlı Yayın Alışverişi</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/explore" class="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                <span>🔍</span>
                <span>Ürün Keşfet</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/go-live" class="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                <span>📹</span>
                <span>Canlı Yayın Başlat</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Destek</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/help" class="text-gray-400 hover:text-white transition-colors">
                Yardım Merkezi
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/how-it-works" class="text-gray-400 hover:text-white transition-colors">
                Nasıl Çalışır?
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/safety" class="text-gray-400 hover:text-white transition-colors">
                Güvenlik
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-gray-400 hover:text-white transition-colors">
                İletişim
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Yasal</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/terms" class="text-gray-400 hover:text-white transition-colors">
                Kullanım Şartları
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="text-gray-400 hover:text-white transition-colors">
                Gizlilik Politikası
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cookies" class="text-gray-400 hover:text-white transition-colors">
                Çerez Politikası
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-800 mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-gray-400 text-sm">
            © 2025 TagList. Tüm hakları saklıdır.
          </div>
          
          <!-- Sales Mode Reminder -->
          <div class="mt-4 md:mt-0">
            <div class="text-sm text-gray-400 flex items-center space-x-4">
              <span>Alışveriş Modları:</span>
              <span class="flex items-center space-x-1">
                <span>🛒</span>
                <span>Klasik</span>
              </span>
              <span class="flex items-center space-x-1">
                <span>📺</span>
                <span>Canlı</span>
              </span>
              <span class="flex items-center space-x-1">
                <span>🏆</span>
                <span>Açık Artırma (sadece canlıda)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component with sales mode reminders
</script>
