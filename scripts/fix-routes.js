#!/usr/bin/env node

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Routes that we've already manually updated
const ALREADY_UPDATED = [
  'pdf/compress',
  'pdf/merge',
  'image/resize',
  'image/convert',
  'image/compress',
  'video/compress'
];

// Pattern replacements to apply
const PATTERNS = [
  {
    name: 'Add FileService import',
    search: /^(import.*from ['"]next\/server['"];?\s*\n)/m,
    replace: '$1import { FileService, AppError } from \'@/lib/file-service\';\n',
    condition: (content) => !content.includes('FileService')
  },
  {
    name: 'Replace direct file path resolution',
    search: /const\s+inputPath\s*=\s*join\s*\(\s*UPLOAD_DIR\s*,\s*fileId\s*\)/g,
    replace: `// Resolve input file path using FileService
    const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }`
  },
  {
    name: 'Replace upload dir constants',
    search: /const\s+UPLOAD_DIR\s*=\s*join\s*\(\s*process\.cwd\(\)\s*,\s*['"]uploads['"]\s*\)/g,
    replace: '// FileService handles directory paths'
  },
  {
    name: 'Replace output dir constants', 
    search: /const\s+OUTPUT_DIR\s*=\s*join\s*\(\s*process\.cwd\(\)\s*,\s*['"]outputs['"]\s*\)/g,
    replace: '// FileService handles directory paths'
  },
  {
    name: 'Replace output path generation',
    search: /const\s+outputPath\s*=\s*join\s*\(\s*OUTPUT_DIR\s*,\s*([^)]+)\)/g,
    replace: 'const outputPath = FileService.generateOutputPath(outputFileId, $1)'
  }
];

async function findRouteFiles() {
  const toolsDir = join(projectRoot, 'src', 'app', 'api', 'tools');
  const routes = [];

  async function scanDirectory(dir, category = '') {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const newCategory = category ? `${category}/${entry.name}` : entry.name;
          await scanDirectory(fullPath, newCategory);
        } else if (entry.name === 'route.ts') {
          const routePath = category;
          if (routePath && !ALREADY_UPDATED.includes(routePath)) {
            routes.push({
              path: routePath,
              file: fullPath
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dir}:`, error.message);
    }
  }

  await scanDirectory(toolsDir);
  return routes;
}

async function updateRouteFile(routeFile) {
  try {
    let content = await readFile(routeFile.file, 'utf-8');
    let changed = false;
    const changes = [];

    // Apply each pattern
    for (const pattern of PATTERNS) {
      if (pattern.condition && !pattern.condition(content)) {
        continue;
      }

      const originalContent = content;
      content = content.replace(pattern.search, pattern.replace);
      
      if (content !== originalContent) {
        changed = true;
        changes.push(pattern.name);
      }
    }

    // Special handling for file path resolution in GET methods
    if (content.includes('join(UPLOAD_DIR, fileId)') && !content.includes('FileService.resolveFilePath')) {
      content = content.replace(
        /const\s+inputPath\s*=\s*join\s*\(\s*UPLOAD_DIR\s*,\s*fileId\s*\)/g,
        `const inputPath = await FileService.resolveFilePath(fileId);
    if (!inputPath) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }`
      );
      changed = true;
      changes.push('Fixed GET method file resolution');
    }

    if (changed) {
      await writeFile(routeFile.file, content, 'utf-8');
      console.log(`✅ Updated ${routeFile.path}`);
      console.log(`   Changes: ${changes.join(', ')}`);
      return true;
    } else {
      console.log(`⏭️  Skipped ${routeFile.path} (no changes needed)`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Failed to update ${routeFile.path}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Batch updating processing routes with FileService...\n');

  const routes = await findRouteFiles();
  console.log(`Found ${routes.length} routes to check:\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const route of routes) {
    const result = await updateRouteFile(route);
    if (result === true) {
      updated++;
    } else if (result === false) {
      skipped++;
    } else {
      failed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Updated: ${updated} routes`);
  console.log(`⏭️  Skipped: ${skipped} routes`);
  console.log(`❌ Failed: ${failed} routes`);

  if (updated > 0) {
    console.log('\n✨ Routes have been updated to use FileService!');
    console.log('🔍 Please review the changes and test the affected routes.');
  }

  console.log('\n📝 Next steps:');
  console.log('1. Review the updated files for any syntax errors');
  console.log('2. Test the routes individually');
  console.log('3. Run `npm run lint` to check for any TypeScript errors');
  console.log('4. Start the development server and verify functionality');
}

main().catch(console.error);