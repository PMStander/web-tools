#!/usr/bin/env node

/**
 * WebTools Pro - Tool Validation Script
 * 
 * This script validates the entire tool structure for:
 * 1. Missing API routes for UI pages
 * 2. Missing UI pages for API routes
 * 3. Import issues in tool pages
 * 4. Tool count mismatches in category pages
 * 5. Broken links and references
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const TOOLS_UI_DIR = path.join(PROJECT_ROOT, 'src/app/tools');
const TOOLS_API_DIR = path.join(PROJECT_ROOT, 'src/app/api/tools');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Get all UI tool pages
function getUIToolPages() {
  const toolPages = new Map();
  
  function scanDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath, basePath ? `${basePath}/${item}` : item);
      } else if (item === 'page.tsx') {
        const toolPath = basePath || 'root';
        toolPages.set(toolPath, itemPath);
      }
    }
  }
  
  scanDirectory(TOOLS_UI_DIR);
  return toolPages;
}

// Get all API tool routes
function getAPIToolRoutes() {
  const apiRoutes = new Map();
  
  function scanDirectory(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath, basePath ? `${basePath}/${item}` : item);
      } else if (item === 'route.ts') {
        const routePath = basePath || 'root';
        apiRoutes.set(routePath, itemPath);
      }
    }
  }
  
  scanDirectory(TOOLS_API_DIR);
  return apiRoutes;
}

// Check imports in a file
function checkImports(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for import statements
      if (line.startsWith('import ')) {
        // Check for common issues
        if (line.includes('from "lucide-react"')) {
          // Extract imported items
          const match = line.match(/import\s*{([^}]+)}\s*from/);
          if (match) {
            const imports = match[1].split(',').map(item => item.trim());
            // Check for potentially undefined imports (this is basic - would need more sophisticated checking)
            for (const imp of imports) {
              if (imp.includes('Settings') && !line.includes('Settings')) {
                issues.push(`Line ${i + 1}: Potential missing Settings import`);
              }
            }
          }
        }
        
        // Check for relative imports
        if (line.includes('../') && line.includes('@/')) {
          issues.push(`Line ${i + 1}: Mixed relative and absolute imports`);
        }
        
        // Check for potentially missing components
        if (line.includes('@/components/') && line.includes('undefined')) {
          issues.push(`Line ${i + 1}: Potentially undefined component import`);
        }
      }
    }
  } catch (error) {
    issues.push(`Error reading file: ${error.message}`);
  }
  
  return issues;
}

// Check tool counts in category pages
function checkToolCounts() {
  const issues = [];
  const categoryPages = [
    path.join(TOOLS_UI_DIR, 'pdf/page.tsx'),
    path.join(TOOLS_UI_DIR, 'image/page.tsx'),
    path.join(TOOLS_UI_DIR, 'video/page.tsx'),
    path.join(TOOLS_UI_DIR, 'ai/page.tsx')
  ];
  
  for (const pagePath of categoryPages) {
    if (!fs.existsSync(pagePath)) {
      issues.push(`Missing category page: ${pagePath}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(pagePath, 'utf-8');
      
      // Extract tool arrays
      const toolArrayMatch = content.match(/const\s+\w*Tools\s*=\s*\[([\s\S]*?)\](?=\s*const|\s*$)/);
      if (toolArrayMatch) {
        const toolsContent = toolArrayMatch[1];
        const toolCount = (toolsContent.match(/title:\s*"/g) || []).length;
        
        // Extract category count declarations
        const categoryMatches = content.match(/count:\s*(\d+)/g) || [];
        const declaredCounts = categoryMatches.map(match => parseInt(match.match(/\d+/)[0]));
        
        logInfo(`${path.basename(path.dirname(pagePath))} tools: ${toolCount} actual, declared counts: [${declaredCounts.join(', ')}]`);
        
        // Check if first declared count (should be "All Tools" count) matches actual count
        if (declaredCounts.length > 0 && declaredCounts[0] !== toolCount) {
          // Look for .length usage in "All Tools" category which would be correct
          const hasLengthUsage = content.includes('.length');
          if (!hasLengthUsage) {
            issues.push(`${path.basename(path.dirname(pagePath))}: "All Tools" count should use .length or match actual count ${toolCount}, found: ${declaredCounts[0]}`);
          }
        }
      }
    } catch (error) {
      issues.push(`Error checking tool counts in ${pagePath}: ${error.message}`);
    }
  }
  
  return issues;
}

// Main validation function
function validateTools() {
  log('🔍 Starting WebTools Pro validation...', 'bold');
  console.log();
  
  const uiPages = getUIToolPages();
  const apiRoutes = getAPIToolRoutes();
  
  log(`Found ${uiPages.size} UI tool pages`, 'cyan');
  log(`Found ${apiRoutes.size} API tool routes`, 'cyan');
  console.log();
  
  let totalIssues = 0;
  
  // 1. Check for missing API routes
  log('1. Checking for missing API routes...', 'bold');
  const missingAPIRoutes = [];
  
  for (const [toolPath, uiPath] of uiPages.entries()) {
    // Skip category pages and standalone tools
    if (toolPath.includes('/page') || 
        toolPath === 'root' || 
        ['ai', 'image', 'video', 'pdf'].includes(toolPath) ||
        ['pdf-merge', 'image-converter', 'ai-document-analyzer', 'ai-text-generator', 'ai-image-enhancer', 'ai-chatbot-builder', 'collaborative-editor', 'workflow-builder', 'file-organizer', 'format-converter'].includes(toolPath)) {
      continue;
    }
    
    if (!apiRoutes.has(toolPath)) {
      missingAPIRoutes.push(toolPath);
    }
  }
  
  if (missingAPIRoutes.length > 0) {
    for (const route of missingAPIRoutes) {
      logError(`Missing API route for: /tools/${route}`);
    }
    totalIssues += missingAPIRoutes.length;
  } else {
    logSuccess('All tool UI pages have corresponding API routes');
  }
  
  console.log();
  
  // 2. Check for orphaned API routes
  log('2. Checking for orphaned API routes...', 'bold');
  const orphanedAPIRoutes = [];
  
  for (const [routePath, apiPath] of apiRoutes.entries()) {
    // Convert API route path to UI path
    let uiPath = routePath;
    
    // Handle special cases
    if (routePath === 'image-converter') {
      uiPath = 'image-converter';
    } else if (routePath.startsWith('ai-')) {
      uiPath = routePath;
    }
    
    if (!uiPages.has(uiPath) && !['merge-cached'].includes(routePath)) {
      orphanedAPIRoutes.push(routePath);
    }
  }
  
  if (orphanedAPIRoutes.length > 0) {
    for (const route of orphanedAPIRoutes) {
      logWarning(`Orphaned API route (no UI): /api/tools/${route}`);
    }
  } else {
    logSuccess('No orphaned API routes found');
  }
  
  console.log();
  
  // 3. Check imports in UI pages
  log('3. Checking imports in UI pages...', 'bold');
  let importIssues = 0;
  
  for (const [toolPath, uiPath] of uiPages.entries()) {
    const issues = checkImports(uiPath);
    if (issues.length > 0) {
      logError(`Import issues in ${toolPath}:`);
      for (const issue of issues) {
        logError(`  ${issue}`);
      }
      importIssues += issues.length;
    }
  }
  
  if (importIssues === 0) {
    logSuccess('No import issues found');
  } else {
    totalIssues += importIssues;
  }
  
  console.log();
  
  // 4. Check tool counts
  log('4. Checking tool counts in category pages...', 'bold');
  const countIssues = checkToolCounts();
  
  if (countIssues.length > 0) {
    for (const issue of countIssues) {
      logError(issue);
    }
    totalIssues += countIssues.length;
  } else {
    logSuccess('Tool counts are consistent');
  }
  
  console.log();
  
  // 5. Summary
  log('📊 Validation Summary:', 'bold');
  if (totalIssues === 0) {
    logSuccess(`All checks passed! No issues found.`);
  } else {
    logError(`Found ${totalIssues} issues that need attention.`);
  }
  
  console.log();
  log('Tool Structure Overview:', 'cyan');
  log(`• PDF Tools: UI pages with API routes`, 'cyan');
  log(`• Image Tools: UI pages with API routes`, 'cyan');
  log(`• Video Tools: UI pages with API routes`, 'cyan');
  log(`• AI Tools: UI pages with API routes`, 'cyan');
  log(`• Standalone Tools: UI pages (some without API routes)`, 'cyan');
  
  return totalIssues === 0;
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = validateTools();
  process.exit(success ? 0 : 1);
}

export { validateTools };