#!/usr/bin/env node
/**
 * Deploy script: Bundle → Clasp push → Git sync to GitHub
 * Usage: npm run deploy
 *
 * Flow:
 *  1. Build + bundle (vite → singlefile → gas/Index.html)
 *  2. Push to Google Apps Script (clasp push)
 *  3. Copy source to monorepo, sanitize secrets, commit & push to GitHub
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const MONOREPO_PATH = 'c:\\NodeJS\\_temp_repo';
const PROJECT_FOLDER = 'expense-manager';
const DEST = path.join(MONOREPO_PATH, PROJECT_FOLDER);

function run(cmd, cwd) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: cwd || process.cwd() });
}

function log(msg) {
  console.log(`\n${'='.repeat(50)}\n🔹 ${msg}\n${'='.repeat(50)}`);
}

// ── Step 1: Bundle ──────────────────────────────────────────────────
log('Step 1/4: Build & Bundle');
run('node scripts/bundle.mjs');

// ── Step 2: Clasp push ─────────────────────────────────────────────
log('Step 2/4: Push to Google Apps Script');
run('npx @google/clasp push');

// ── Step 3: Sync to monorepo ────────────────────────────────────────
log('Step 3/4: Sync to GitHub monorepo');

// Check monorepo exists
if (!fs.existsSync(path.join(MONOREPO_PATH, '.git'))) {
  console.log('⚠️  Monorepo not found. Cloning...');
  run(`git clone https://github.com/HaiHoangColpal/code-personal-project.git "${MONOREPO_PATH}"`);
}

// Pull latest
run('git checkout main', MONOREPO_PATH);
run('git pull origin main', MONOREPO_PATH);

// Switch to feature branch (or create)
try {
  run('git checkout feature/expense-manager', MONOREPO_PATH);
  run('git pull origin feature/expense-manager', MONOREPO_PATH);
} catch {
  run('git checkout -b feature/expense-manager', MONOREPO_PATH);
}

// Robocopy source → monorepo (exclude build artifacts, secrets, deps)
const robocopyCmd = [
  'robocopy',
  `"${process.cwd()}"`,
  `"${DEST}"`,
  '/E /MIR',                                   // mirror entire tree
  '/XD node_modules dist .git',                // skip dirs
  '/XF .clasp.json tsconfig.app.tsbuildinfo Config.gs',  // skip files (secrets)
].join(' ');
try {
  run(robocopyCmd);
} catch (e) {
  // Robocopy exit codes 0-7 are success, 8+ are errors
  if (e.status >= 8) throw e;
}

// Config.gs chứa secrets, đã nằm trong .gitignore → không cần sanitize
console.log('🔒 Secrets tách riêng trong Config.gs (gitignored)');

// ── Step 4: Git commit & push ───────────────────────────────────────
log('Step 4/4: Git commit & push');

run('git add -A', MONOREPO_PATH);

// Check if there are changes to commit
try {
  execSync('git diff --cached --quiet', { cwd: MONOREPO_PATH });
  console.log('✅ No changes to commit. GitHub is already up to date.');
} catch {
  // There are staged changes
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const msg = `deploy: expense-manager update (${timestamp})`;
  run(`git commit -m "${msg}"`, MONOREPO_PATH);
  run('git push origin feature/expense-manager', MONOREPO_PATH);
  console.log('✅ Pushed to GitHub: feature/expense-manager');
}

console.log('\n🎉 Deploy hoàn tất! GAS + GitHub đã đồng bộ.\n');
