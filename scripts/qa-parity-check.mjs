import fs from 'node:fs';

const requiredFiles = [
  'public/index.html',
  'public/assets/css/styles.min.css',
  'public/assets/css/mobile.min.css',
  'public/assets/js/app.min.js',
  'public/assets/js/mobile-app.min.js',
  'public/assets/img/dg-logo-128.webp',
  'public/assets/img/division2-logo-white-2-1086.webp',
  'public/data/builds.json',
  'public/data/resources.json',
  'public/division-2/index.html',
  'public/division-2/builds/index.html',
  'public/division-2/tools/index.html',
  'public/division-2/tools/vendor-reset/index.html',
  'public/division-2/tools/expertise-cost-tracker/index.html',
  'public/division-2/tools/exotic-source-tracker/index.html',
  'public/division-2/tools/gearset-matrix/index.html'
];

const requiredHomeText = [
  'global-search',
  'shd-terminal',
  'Mission Control',
  'Agent Backpack',
  'vendor-countdown-mini',
  'server-status-card',
  'resources-grid',
  'builds-grid',
  'submit'
];

const bannedHomeText = [
  'Delta',
  'Needs source',
  'Source watcher',
  'DivGaming curated reference; validate'
];

function fail(message) {
  console.error(`QA FAIL: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
}

const home = fs.existsSync('public/index.html') ? fs.readFileSync('public/index.html', 'utf8') : '';

for (const text of requiredHomeText) {
  if (!home.includes(text)) fail(`Production homepage marker missing: ${text}`);
}

for (const text of bannedHomeText) {
  if (home.includes(text)) fail(`Banned public homepage text found: ${text}`);
}

if (!home.includes('/divgaming-astro-staging/manifest.json')) fail('Manifest is not staged under base path.');
if (!home.includes('noindex, nofollow')) fail('Staging home is not noindex.');
if (!fs.readFileSync('package.json', 'utf8').includes('>=24')) fail('Node 24 engine missing.');

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('QA PASS: production homepage markers, required assets/routes, staging base, and public text checks passed.');
