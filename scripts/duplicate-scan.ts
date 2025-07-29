#!/usr/bin/env node
/**
 * TAGLIST Duplicate Guard Script
 * Prevents duplicate/forbidden filenames from being committed
 */

import { readFileSync, statSync } from 'fs'
import { join } from 'path'

// Forbidden patterns (case-insensitive regex)
const FORBIDDEN_PATTERNS = [
  /\.(clean|clean2|copy|bak|old|new|A|M)\.(vue|ts|js|md)$/i,
  /(phase[0-9]+|completion|summary|cleanup|autofix|deep[-_]?dive)\.(md|txt)$/i,
  /duplicate|backup|temp|tmp/i
]

// Allowed exceptions
const ALLOWED_EXCEPTIONS = [
  'reports/deep-dive.md',
  'reports/ULTRA_CLEAN_FINAL_REPORT.md'
]

function checkFile(filePath: string): { isValid: boolean; reason?: string } {
  // Check if file is in allowed exceptions
  if (ALLOWED_EXCEPTIONS.some(exception => filePath.includes(exception))) {
    return { isValid: true }
  }

  // Check against forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(filePath)) {
      return { 
        isValid: false, 
        reason: `File "${filePath}" matches forbidden pattern: ${pattern.source}` 
      }
    }
  }

  return { isValid: true }
}

function main() {
  const args = process.argv.slice(2)
  const failOnDuplicate = args.includes('--fail-on-dup')

  console.log('🔍 Scanning for duplicate/forbidden filenames...')

  let foundViolations = false

  // Check staged files (git diff --cached --name-status)
  try {
    const { execSync } = require('child_process')
    const stagedFiles = execSync('git diff --cached --name-status', { encoding: 'utf-8' })
      .split('\n')
      .filter(line => line.trim())
      .filter(line => /^[ARM]/.test(line)) // Added, Renamed, Modified
      .map(line => line.split('\t').pop())
      .filter(Boolean)

    for (const filePath of stagedFiles) {
      const check = checkFile(filePath!)
      if (!check.isValid) {
        console.error(`❌ VIOLATION: ${check.reason}`)
        foundViolations = true
      }
    }

    if (!foundViolations) {
      console.log('✅ No forbidden filenames found in staged files')
    }

  } catch (error) {
    console.warn('⚠️ Could not check staged files:', (error as Error).message)
  }

  if (failOnDuplicate && foundViolations) {
    console.error('\n❌ Commit blocked due to forbidden filenames.')
    console.log('💡 Suggestion: Consolidate reports into reports/ULTRA_CLEAN_FINAL_REPORT.md')
    process.exit(1)
  }

  if (foundViolations) {
    console.warn('\n⚠️  Found violations but not failing due to --fail-on-dup not set')
  }

  console.log('🎉 Duplicate guard check complete!')
}

main()
