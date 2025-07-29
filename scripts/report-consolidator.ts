#!/usr/bin/env node
/**
 * TAGLIST Report Consolidation Script
 * Consolidates all scattered reports into ULTRA_CLEAN_FINAL_REPORT.md
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'

const rootDir = process.cwd()
const targetReport = join(rootDir, 'reports', 'ULTRA_CLEAN_FINAL_REPORT.md')

// Files to consolidate and remove
const reportsToConsolidate = [
  'PHASE3_COMPLETION_SUMMARY.md',
  'PHASE4_COMPLETION_SUMMARY.md', 
  'PHASE5_COMPLETION_SUMMARY.md',
  'CLEANUP_REPORT.md',
  'FINAL_CLEANUP_REPORT.md',
  'AUTOFIX_CHANGELOG.md',
  'DEEP_DIVE_COMPLETION.md'
]

function consolidateReports() {
  let consolidatedContent = `# TAGLIST - ULTRA CLEAN FINAL REPORT
Generated: ${new Date().toISOString()}
Base SHA: 2973923

## Duplicate Purge 2025-07-28

**Removed Files:**
- components/BidModal.vue → components/modals/BidModal.vue (kept)
- components/LivestreamBidModal.vue → components/modals/LivestreamBidModal.vue (kept)
- components/PurchaseModal.vue → components/modals/PurchaseModal.vue (kept)
- components/VisualSearchModal.vue → components/modals/VisualSearchModal.vue (kept)
- components/ui/Footer.vue → components/Footer.vue (kept)
- pages/choose-sales-mode-clean.vue → pages/choose-sales-mode.vue (kept)
- pages/index-clean.vue → pages/index.vue (kept)
- services/experimental/VisualSearchService.ts → services/VisualSearchService.ts (moved)
- services/experimental/EnhancedLiveStreamingService.ts → services/EnhancedLiveStreamingService.ts (moved)

**Report Consolidation:**
- All PHASE*_COMPLETION_SUMMARY.md files → This report
- CLEANUP_REPORT.md + FINAL_CLEANUP_REPORT.md → This report
- AUTOFIX_CHANGELOG.md → Merged into TECH_CHANGELOG.md
- DEEP_DIVE_COMPLETION.md → reports/deep-dive.md

---

`

  // Consolidate each report
  for (const reportFile of reportsToConsolidate) {
    const filePath = join(rootDir, reportFile)
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8')
        consolidatedContent += `\n## ${reportFile.replace('.md', '').replace(/_/g, ' ')}\n\n`
        consolidatedContent += content + '\n\n---\n\n'
        console.log(`✅ Consolidated: ${reportFile}`)
      } catch (error) {
        console.warn(`⚠️  Could not read ${reportFile}:`, error)
      }
    }
  }

  // Write consolidated report
  writeFileSync(targetReport, consolidatedContent)
  console.log(`✅ Consolidated report written to: ${targetReport}`)

  // Remove original files
  for (const reportFile of reportsToConsolidate) {
    const filePath = join(rootDir, reportFile)
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath)
        console.log(`🗑️  Removed: ${reportFile}`)
      } catch (error) {
        console.warn(`⚠️  Could not remove ${reportFile}:`, error)
      }
    }
  }

  // Handle AUTOFIX_CHANGELOG.md -> append to TECH_CHANGELOG.md
  const autofixPath = join(rootDir, 'AUTOFIX_CHANGELOG.md')
  const techChangelogPath = join(rootDir, 'TECH_CHANGELOG.md')
  
  if (existsSync(autofixPath) && existsSync(techChangelogPath)) {
    try {
      const autofixContent = readFileSync(autofixPath, 'utf-8')
      const techContent = readFileSync(techChangelogPath, 'utf-8')
      const mergedContent = techContent + '\n\n## AUTOFIX CHANGELOG (MERGED)\n\n' + autofixContent
      writeFileSync(techChangelogPath, mergedContent)
      unlinkSync(autofixPath)
      console.log(`✅ Merged AUTOFIX_CHANGELOG.md into TECH_CHANGELOG.md`)
    } catch (error) {
      console.warn(`⚠️  Could not merge AUTOFIX_CHANGELOG.md:`, error)
    }
  }

  // Move DEEP_DIVE_COMPLETION.md to reports/deep-dive.md
  const deepDivePath = join(rootDir, 'DEEP_DIVE_COMPLETION.md')
  const targetDeepDivePath = join(rootDir, 'reports', 'deep-dive.md')
  
  if (existsSync(deepDivePath)) {
    try {
      const deepDiveContent = readFileSync(deepDivePath, 'utf-8')
      writeFileSync(targetDeepDivePath, deepDiveContent)
      unlinkSync(deepDivePath)
      console.log(`✅ Moved DEEP_DIVE_COMPLETION.md to reports/deep-dive.md`)
    } catch (error) {
      console.warn(`⚠️  Could not move DEEP_DIVE_COMPLETION.md:`, error)
    }
  }

  console.log(`\n🎉 Report consolidation complete!`)
}

consolidateReports()
