#!/bin/bash

# List of pages that should use the default layout
pages=(
  "categories.vue"
  "favorites.vue" 
  "sell.vue"
  "messages.vue"
  "go-live.vue"
  "help.vue"
  "privacy.vue"
  "how-it-works.vue"
  "discovery.vue"
  "livestream.vue"
  "visual-commerce.vue"
  "contact.vue"
  "search.vue"
  "dashboard.vue"
  "wallet.vue"
  "terms.vue"
  "cookies.vue"
  "safety.vue"
  "live.vue"
)

# Function to wrap page with NuxtLayout
wrap_with_layout() {
  local file="$1"
  echo "Processing $file..."
  
  # Check if file already has NuxtLayout
  if grep -q "NuxtLayout" "$file"; then
    echo "  -> Already has NuxtLayout, skipping"
    return
  fi
  
  # Create backup
  cp "$file" "${file}.backup"
  
  # Replace first <template> with <template><NuxtLayout>
  # and ensure the file ends with </NuxtLayout></template>
  sed -i '' '1s/<template>/<template>\n  <NuxtLayout>/' "$file"
  
  # Find the last </template> and add </NuxtLayout> before it
  sed -i '' '$s|</template>|  </NuxtLayout>\n</template>|' "$file"
  
  echo "  -> Converted to use NuxtLayout"
}

# Process each page
for page in "${pages[@]}"; do
  if [ -f "pages/$page" ]; then
    wrap_with_layout "pages/$page"
  else
    echo "Warning: pages/$page not found"
  fi
done

echo "Layout conversion complete!"
