/**
 * kreed.top Build Script
 * 功能：
 *   1. 注入 _baseline 目录下的基线代码（GA 等）
 *   2. 部署到 Cloudflare Pages
 *
 * 用法：
 *   node build.js              — 仅构建（注入基线，不部署）
 *   node build.js --deploy    — 构建 + 部署
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── 基线注入 ──────────────────────────────────────────────────────────────

/**
 * Inject baseline content at <!-- inject:baseline:xxx --> markers.
 * @param {string} htmlContent - Raw HTML file content
 * @param {string} baselineDir - Path to _baseline directory
 * @returns {string} HTML with injections applied
 */
function injectBaselines(htmlContent, baselineDir) {
  return htmlContent.replace(
    /<!-- inject:baseline:(\S+) -->/g,
    function(match, baselineName) {
      const filePath = path.join(baselineDir, baselineName + '.html');
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      console.warn(`  [build] WARNING: baseline not found: ${filePath}`);
      return match; // leave marker in place if file missing
    }
  );
}

/**
 * Process all HTML files in a directory tree.
 * @param {string} rootDir - Root directory to scan
 * @param {string} baselineDir - _baseline directory path
 * @returns {string[]} List of processed files
 */
function processHtmlFiles(rootDir, baselineDir) {
  const processed = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '_baseline') continue;  // skip baseline dir itself
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const injected = injectBaselines(raw, baselineDir);
        fs.writeFileSync(fullPath, injected);
        processed.push(path.relative(rootDir, fullPath));
      }
    }
  }

  walk(rootDir);
  return processed;
}

// ── 构建 ──────────────────────────────────────────────────────────────────

const ROOT_DIR    = __dirname;
const BASELINE_DIR = path.join(ROOT_DIR, '_baseline');
const DEPLOY      = process.argv.includes('--deploy');

console.log('\n=== kreed.top Build ===');
console.log(`Baseline dir: ${BASELINE_DIR}`);

// 1. Inject baselines
console.log('\n[1/2] Injecting baselines...');
const files = processHtmlFiles(ROOT_DIR, BASELINE_DIR);
if (files.length === 0) {
  console.log('  No HTML files to process.');
} else {
  console.log(`  Processed ${files.length} file(s):`);
  files.forEach(f => console.log(`    + ${f}`));
}

// 2. Deploy
if (DEPLOY) {
  console.log('\n[2/2] Deploying to Cloudflare Pages...');
  const env = { ...process.env };
  env.CLOUDFLARE_API_TOKEN = 'REMOVED_SECRET';

  try {
    execSync('npx wrangler pages deploy . --project-name=kreed-top --branch=main --commit-dirty=true', {
      cwd: ROOT_DIR,
      env,
      stdio: 'inherit'
    });
    console.log('Deployment complete.');
  } catch (e) {
    console.error('Deployment failed. Check the error above.');
    process.exit(1);
  }
} else {
  console.log('\n[skip] Deployment skipped (no --deploy flag).');
  console.log('  Run `node build.js --deploy` to build and deploy.\n');
}

console.log('=== Build Done ===\n');
