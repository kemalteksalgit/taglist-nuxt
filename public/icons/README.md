# PWA Icons

Bu klasörde PWA uygulaması için gerekli icon dosyaları bulunmalıdır.

## Gerekli Icon Boyutları:

### Android/Chrome
- icon-72x72.png
- icon-96x96.png  
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### iOS/Safari
- apple-touch-icon-57x57.png
- apple-touch-icon-60x60.png
- apple-touch-icon-72x72.png
- apple-touch-icon-76x76.png
- apple-touch-icon-114x114.png
- apple-touch-icon-120x120.png
- apple-touch-icon-144x144.png
- apple-touch-icon-152x152.png
- apple-touch-icon-180x180.png

### Windows
- mstile-70x70.png
- mstile-144x144.png
- mstile-150x150.png
- mstile-310x150.png
- mstile-310x310.png

### Diğer
- favicon-16x16.png
- favicon-32x32.png
- favicon-48x48.png
- badge-72x72.png (notification badge)

## Icon Oluşturma Araçları:

1. **Online Generators:**
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://favicon.io/

2. **CLI Tools:**
   ```bash
   npm install -g pwa-asset-generator
   pwa-asset-generator logo.svg ./icons
   ```

## Manifest.json Güncellemesi:

Icon dosyaları oluşturulduktan sonra manifest.json dosyasındaki icon referanslarının doğru olduğundan emin olun.

## Kalite Standartları:

- SVG formatında master logo kullanın
- Minimum 512x512 çözünürlük
- Şeffaf arka plan yerine düz renk tercih edin
- Icon'lar kare (1:1) oranında olmalı
- PNG formatı önerilen format
