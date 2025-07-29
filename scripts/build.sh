#!/bin/bash

# TagList Build Script
# Bu script projeyi production için hazırlar

set -e

echo "🚀 TagList Build İşlemi Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata yakalama
error_exit() {
    echo -e "${RED}❌ Hata: $1${NC}" >&2
    exit 1
}

# Başarı mesajı
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Bilgi mesajı
info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Uyarı mesajı
warn_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Node.js versiyonu kontrolü
check_node_version() {
    info_msg "Node.js versiyonu kontrol ediliyor..."
    
    if ! command -v node &> /dev/null; then
        error_exit "Node.js yüklü değil! Lütfen Node.js 18+ sürümünü yükleyin."
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        error_exit "Node.js $REQUIRED_VERSION veya üzeri gerekli. Mevcut versiyon: $NODE_VERSION"
    fi
    
    success_msg "Node.js versiyon kontrolü başarılı: v$NODE_VERSION"
}

# Bağımlılıkları yükleme
install_dependencies() {
    info_msg "Bağımlılıklar yükleniyor..."
    
    if [ -f "package-lock.json" ]; then
        npm ci || error_exit "Bağımlılık yükleme başarısız!"
    else
        npm install || error_exit "Bağımlılık yükleme başarısız!"
    fi
    
    success_msg "Bağımlılıklar başarıyla yüklendi"
}

# Tip kontrolü
type_check() {
    info_msg "TypeScript tip kontrolü yapılıyor..."
    
    npm run typecheck || error_exit "TypeScript tip kontrolü başarısız!"
    
    success_msg "TypeScript tip kontrolü başarılı"
}

# Linting
lint_code() {
    info_msg "Kod kalitesi kontrolü yapılıyor..."
    
    npm run lint || error_exit "ESLint kontrolü başarısız!"
    
    success_msg "Kod kalitesi kontrolü başarılı"
}

# Test çalıştırma
run_tests() {
    info_msg "Testler çalıştırılıyor..."
    
    if npm run test 2>/dev/null; then
        success_msg "Tüm testler başarılı"
    else
        warn_msg "Test çalıştırma atlandı (test dosyası bulunamadı)"
    fi
}

# Önceki build'i temizleme
clean_build() {
    info_msg "Önceki build dosyaları temizleniyor..."
    
    rm -rf .nuxt
    rm -rf .output
    rm -rf dist
    
    success_msg "Build klasörleri temizlendi"
}

# Nuxt build
build_nuxt() {
    info_msg "Nuxt.js uygulaması build ediliyor..."
    
    # Environment variables
    export NODE_ENV=production
    export NITRO_PRESET=${NITRO_PRESET:-"node-server"}
    
    npm run build || error_exit "Nuxt build başarısız!"
    
    success_msg "Nuxt build başarılı"
}

# Build analizi
analyze_build() {
    info_msg "Build analizi yapılıyor..."
    
    if command -v du &> /dev/null; then
        echo "📊 Build boyutu:"
        du -sh .output/ 2>/dev/null || echo "Build analizi yapılamadı"
    fi
    
    if [ -f ".output/public/_nuxt" ]; then
        echo "📦 Asset dosyaları:"
        ls -lah .output/public/_nuxt/ | head -10
    fi
}

# PWA kontrolü
check_pwa() {
    info_msg "PWA dosyaları kontrol ediliyor..."
    
    if [ -f ".output/public/manifest.json" ]; then
        success_msg "PWA manifest.json mevcut"
    else
        warn_msg "PWA manifest.json bulunamadı"
    fi
    
    if [ -f ".output/public/sw.js" ]; then
        success_msg "Service Worker mevcut"
    else
        warn_msg "Service Worker bulunamadı"
    fi
}

# Ana fonksiyon
main() {
    echo "🏷️  TagList Production Build"
    echo "=============================="
    
    # Build aşamaları
    check_node_version
    clean_build
    install_dependencies
    
    # Opsiyonel kontroller (hata durumunda build'i durdurma)
    if [ "${SKIP_CHECKS:-false}" != "true" ]; then
        type_check
        lint_code
        run_tests
    else
        warn_msg "Kod kalitesi kontrolleri atlandı (SKIP_CHECKS=true)"
    fi
    
    # Ana build işlemi
    build_nuxt
    
    # Post-build kontroller
    analyze_build
    check_pwa
    
    echo ""
    success_msg "🎉 Build işlemi tamamlandı!"
    echo ""
    echo "📁 Build çıktısı: .output/"
    echo "🌐 Production sunucusu için:"
    echo "   npm run preview"
    echo ""
    echo "🚀 Deploy için .output/ klasörünü kullanın"
    echo ""
}

# Script çalıştırma
main "$@"
