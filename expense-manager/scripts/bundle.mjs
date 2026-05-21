// Build script: bundles Vite output into single HTML for Apps Script
// Usage: node scripts/bundle.mjs

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

console.log('📦 Building React app...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

const distIndex = resolve(root, 'dist', 'index.html');
if (!existsSync(distIndex)) {
  console.error('❌ dist/index.html not found. Build failed.');
  process.exit(1);
}

let html = readFileSync(distIndex, 'utf-8');

// vite-plugin-singlefile already inlines everything,
// but let's ensure Google Fonts link is embedded
// (it'll remain as external link since we can't inline Google Fonts CSS easily)

console.log('✅ Build complete!');
console.log(`📄 Output: dist/index.html`);

// Also create a copy for Apps Script deployment
const gasOutput = resolve(root, 'gas', 'Index.html');
writeFileSync(gasOutput, html);
console.log(`📄 Apps Script HTML: gas/Index.html`);
console.log('');
console.log('🚀 Deployment steps:');
console.log('   1. Mở https://script.google.com');
console.log('   2. Tạo project mới');
console.log('   3. Copy nội dung gas/Code.gs vào Code.gs');
console.log('   4. Tạo file Index.html, copy nội dung gas/Index.html vào');
console.log('   5. Cập nhật SPREADSHEET_ID trong Code.gs');
console.log('   6. Deploy > New deployment > Web app');
