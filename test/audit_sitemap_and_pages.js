const fs = require('fs');
const path = require('path');

const LANDING_ROOT = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(LANDING_ROOT, 'sitemap.xml');

function getHtmlFiles(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!['.git', 'node_modules', 'templates'].includes(f.name)) {
        files = files.concat(getHtmlFiles(full));
      }
    } else if (f.isFile() && f.name.endsWith('.html')) {
      files.push(path.relative(LANDING_ROOT, full).replace(/\\/g, '/'));
    }
  }
  return files;
}

const allHtmls = getHtmlFiles(LANDING_ROOT);
console.log(`Total HTML files found: ${allHtmls.length}`);

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
const sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
console.log(`Total Sitemap URLs: ${sitemapUrls.length}`);

// Map sitemap URL path to file
const sitemapMappedFiles = sitemapUrls.map(loc => {
  const u = new URL(loc);
  let p = u.pathname;
  if (p === '/' || p === '') return 'index.html';
  if (p.endsWith('/')) return p.slice(1) + 'index.html';
  return p.slice(1);
});

// Check if all sitemap mapped files exist
let missingFromDisk = 0;
for (let i = 0; i < sitemapUrls.length; i++) {
  const file = sitemapMappedFiles[i];
  const diskPath = path.join(LANDING_ROOT, file);
  if (!fs.existsSync(diskPath)) {
    console.error(`Sitemap URL ${sitemapUrls[i]} points to non-existent file: ${file}`);
    missingFromDisk++;
  }
}
console.log(`Missing from disk: ${missingFromDisk}`);

// Check which HTML files are not in sitemap
const sitemapFileSet = new Set(sitemapMappedFiles);
const unindexedFiles = allHtmls.filter(f => !sitemapFileSet.has(f));
console.log('HTML files not directly in sitemap.xml:', unindexedFiles);
