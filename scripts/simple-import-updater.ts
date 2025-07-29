#!/usr/bin/env node
/**
 * TAGLIST Import Path Updater
 * Updates import paths after file moves and duplicate removals
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, extname } from 'path'

// Import path mappings after duplicate purge
const importMappings = {
  // Components moved to modals/
  '@/components/BidModal': '@/components/modals/BidModal',
  '~/components/BidModal': '~/components/modals/BidModal',
  '../BidModal': '../modals/BidModal',
  './BidModal': './modals/BidModal',
  
  '@/components/LivestreamBidModal': '@/components/modals/LivestreamBidModal',
  '~/components/LivestreamBidModal': '~/components/modals/LivestreamBidModal',
  '../LivestreamBidModal': '../modals/LivestreamBidModal',
  './LivestreamBidModal': './modals/LivestreamBidModal',
  
  '@/components/PurchaseModal': '@/components/modals/PurchaseModal',
  '~/components/PurchaseModal': '~/components/modals/PurchaseModal',
  '../PurchaseModal': '../modals/PurchaseModal',
  './PurchaseModal': './modals/PurchaseModal',
  
  '@/components/VisualSearchModal': '@/components/modals/VisualSearchModal',
  '~/components/VisualSearchModal': '~/components/modals/VisualSearchModal',
  '../VisualSearchModal': '../modals/VisualSearchModal',
  './VisualSearchModal': './modals/VisualSearchModal',
  
  // Footer path cleanup
  '@/components/ui/Footer': '@/components/Footer',
  '~/components/ui/Footer': '~/components/Footer',
  '../ui/Footer': '../Footer',
  './ui/Footer': './Footer'
}

function getAllFiles(dir: string): string[] {
  const files: string[] = []
  const items = readdirSync(dir)
  
  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory() && !['node_modules', 'dist', '.nuxt', '.output'].includes(item)) {
      files.push(...getAllFiles(fullPath))
    } else if (stat.isFile() && ['.ts', '.vue', '.js'].includes(extname(item))) {
      files.push(fullPath)
    }
  }
  
  return files
}

function updateImportsInFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8')
    let updated = false
    
    // Update imports using regex patterns
    for (const [oldPath, newPath] of Object.entries(importMappings)) {
      // Handle various import patterns
      const patterns = [
        // import statements
        new RegExp(`(import\\s+[^'"]*)['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g'),
        new RegExp(`(import\\s+[^'"]*)['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.vue(['"])`, 'g'),
        // dynamic imports
        new RegExp(`(import\\()['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g'),
        new RegExp(`(import\\()['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.vue(['"])`, 'g')
      ]
      
      patterns.forEach(pattern => {
        const newContent = content.replace(pattern, (match, prefix, quote) => {
          const isVueExtension = match.includes('.vue')
          const replacement = isVueExtension ? `${newPath}.vue` : newPath
          updated = true
          console.log(`  📝 ${filePath}: ${oldPath} → ${newPath}`)
          return `${prefix}'${replacement}'`
        })
        content = newContent
      })
    }
    
    if (updated) {
      writeFileSync(filePath, content)
      return true
    }
    
    return false
  } catch (error) {
    console.warn(`⚠️  Could not process ${filePath}:`, (error as Error).message)
    return false
  }
}

function updateImports() {
  console.log('🔄 Starting import path updates...')
  
  const rootDir = process.cwd()
  const directories = ['components', 'pages', 'composables', 'services', 'stores', 'plugins', 'middleware', 'utils', 'server', 'tests', 'layouts']
  
  let allFiles: string[] = []
  
  // Collect files from all directories
  for (const dir of directories) {
    const dirPath = join(rootDir, dir)
    if (existsSync(dirPath)) {
      allFiles.push(...getAllFiles(dirPath))
    }
  }
  
  // Also check root files
  const rootFiles = readdirSync(rootDir)
    .filter(file => ['.ts', '.vue', '.js'].includes(extname(file)))
    .map(file => join(rootDir, file))
  
  allFiles.push(...rootFiles)
  
  console.log(`📁 Found ${allFiles.length} files to process`)
  
  let updatedCount = 0
  
  for (const filePath of allFiles) {
    if (updateImportsInFile(filePath)) {
      updatedCount++
    }
  }
  
  console.log(`✅ Updated imports in ${updatedCount} files`)
}

// Run the updater
updateImports()
