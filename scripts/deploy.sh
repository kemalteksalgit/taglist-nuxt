#!/bin/bash

# TagList Deploy Script
# Bu script uygulamayı çeşitli platformlara deploy eder

set -e

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Deploy platform'u
PLATFORM=${1:-"help"}

# Hata yakalama
error_exit() {
    echo -e "${RED}❌ Hata: $1${NC}" >&2
    exit 1
}

success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warn_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Yardım mesajı
show_help() {
    echo "🚀 TagList Deploy Script"
    echo "========================"
    echo ""
    echo "Kullanım: ./scripts/deploy.sh [platform]"
    echo ""
    echo "Desteklenen platformlar:"
    echo "  vercel     - Vercel'e deploy"
    echo "  netlify    - Netlify'ye deploy"
    echo "  docker     - Docker image oluştur"
    echo "  pm2        - PM2 ile local deploy"
    echo "  static     - Statik dosyalar generate et"
    echo "  help       - Bu yardım mesajını göster"
    echo ""
    echo "Örnekler:"
    echo "  ./scripts/deploy.sh vercel"
    echo "  ./scripts/deploy.sh docker"
    echo "  DOCKER_TAG=v2.0.0 ./scripts/deploy.sh docker"
    echo ""
}

# Build kontrolü
check_build() {
    if [ ! -d ".output" ]; then
        warn_msg "Build bulunamadı. Build işlemi başlatılıyor..."
        ./scripts/build.sh || error_exit "Build başarısız!"
    else
        info_msg "Mevcut build kullanılıyor"
    fi
}

# Git kontrolü
check_git_status() {
    if git diff --quiet && git diff --cached --quiet; then
        success_msg "Git working directory temiz"
    else
        warn_msg "Git working directory'de değişiklikler var"
        read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Vercel deploy
deploy_vercel() {
    info_msg "Vercel'e deploy ediliyor..."
    
    if ! command -v vercel &> /dev/null; then
        error_exit "Vercel CLI yüklü değil! npm i -g vercel"
    fi
    
    check_build
    
    # Vercel konfigürasyonu
    cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "nuxt.config.ts",
      "use": "@nuxtjs/vercel-builder"
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "headers": {
        "Cache-Control": "no-cache"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF
    
    # Deploy
    vercel deploy --prod || error_exit "Vercel deploy başarısız!"
    
    success_msg "Vercel deploy başarılı!"
}

# Netlify deploy
deploy_netlify() {
    info_msg "Netlify'ye deploy ediliyor..."
    
    if ! command -v netlify &> /dev/null; then
        error_exit "Netlify CLI yüklü değil! npm i -g netlify-cli"
    fi
    
    check_build
    
    # Netlify konfigürasyonu
    cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_ENV = "production"
  NITRO_PRESET = "netlify"

[[redirects]]
  from = "/sw.js"
  to = "/sw.js"
  status = 200
  headers = {Cache-Control = "no-cache"}

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = ".output/server"
EOF
    
    # Deploy
    netlify deploy --prod --dir=.output/public || error_exit "Netlify deploy başarısız!"
    
    success_msg "Netlify deploy başarılı!"
}

# Docker deploy
deploy_docker() {
    info_msg "Docker image oluşturuluyor..."
    
    if ! command -v docker &> /dev/null; then
        error_exit "Docker yüklü değil!"
    fi
    
    DOCKER_TAG=${DOCKER_TAG:-"taglist:latest"}
    
    # Dockerfile oluştur
    cat > Dockerfile << EOF
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Package files'ları kopyala
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Source code'u kopyala
COPY . .

# Build
RUN npm run build

# Production image
FROM node:18-alpine AS runtime

WORKDIR /app

# Build çıktısını kopyala
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Production dependencies
RUN npm ci --only=production && npm cache clean --force

# User oluştur
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nuxt -u 1001
USER nuxt

# Port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start
CMD ["node", ".output/server/index.mjs"]
EOF
    
    # .dockerignore oluştur
    cat > .dockerignore << EOF
node_modules
.nuxt
.output
.git
.gitignore
README.md
.env
.env.*
coverage
tests
*.log
.DS_Store
EOF
    
    # Docker build
    docker build -t $DOCKER_TAG . || error_exit "Docker build başarısız!"
    
    success_msg "Docker image oluşturuldu: $DOCKER_TAG"
    
    # Opsiyonel: Docker run örneği
    echo ""
    echo "🐳 Docker container'ı çalıştırmak için:"
    echo "   docker run -p 3000:3000 $DOCKER_TAG"
    echo ""
}

# PM2 deploy
deploy_pm2() {
    info_msg "PM2 ile deploy ediliyor..."
    
    if ! command -v pm2 &> /dev/null; then
        error_exit "PM2 yüklü değil! npm i -g pm2"
    fi
    
    check_build
    
    # PM2 ecosystem dosyası
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'taglist',
      port: 3000,
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G'
    }
  ]
}
EOF
    
    # Log klasörü oluştur
    mkdir -p logs
    
    # PM2 start
    pm2 start ecosystem.config.js || error_exit "PM2 start başarısız!"
    pm2 save || warn_msg "PM2 save başarısız"
    
    success_msg "PM2 deploy başarılı!"
    
    echo ""
    echo "📊 PM2 izleme komutları:"
    echo "   pm2 status"
    echo "   pm2 logs taglist"
    echo "   pm2 restart taglist"
    echo "   pm2 stop taglist"
    echo ""
}

# Statik generate
generate_static() {
    info_msg "Statik dosyalar generate ediliyor..."
    
    # Nuxt generate
    export NITRO_PRESET=static
    npm run generate || error_exit "Static generate başarısız!"
    
    success_msg "Statik dosyalar oluşturuldu: .output/public/"
    
    echo ""
    echo "📁 Statik dosyalar:"
    echo "   .output/public/ klasörünü web sunucunuza yükleyin"
    echo ""
    echo "🌐 Test için:"
    echo "   npx serve .output/public"
    echo ""
}

# Ana fonksiyon
main() {
    case $PLATFORM in
        "vercel")
            deploy_vercel
            ;;
        "netlify")
            deploy_netlify
            ;;
        "docker")
            deploy_docker
            ;;
        "pm2")
            deploy_pm2
            ;;
        "static")
            generate_static
            ;;
        "help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Bilinmeyen platform: $PLATFORM${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Git status kontrolü (help hariç)
if [ "$PLATFORM" != "help" ]; then
    check_git_status
fi

# Script çalıştır
main
