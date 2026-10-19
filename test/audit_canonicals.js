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
      files.push(full);
    }
  }
  return files;
}

const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf8');
const sitemapUrls = new Set([...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim()));

const htmlFiles = getHtmlFiles(LANDING_ROOT);

let canonicalMismatches = [];
let missingCanonicalTag = [];

for (const file of htmlFiles) {
  const relFile = path.relative(LANDING_ROOT, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const canonicalMatch = content.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i) ||
                         content.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["']/i);

  if (!canonicalMatch) {
    missingCanonicalTag.push(relFile);
    continue;
  }

  const canonicalUrl = canonicalMatch[1].trim();

  // If this file is expected to be in sitemap, does the canonical match?
  const isSpecial = ['404.html', 'delete-account.html', 'delete.html', 'gied8r2cfkneni4luy6b0lh5uu7ux8.html'].includes(relFile);
  if (!isSpecial) {
    if (!sitemapUrls.has(canonicalUrl)) {
      canonicalMismatches.push({
        file: relFile,
        canonicalUrl,
        reason: 'Canonical URL in HTML is not in sitemap.xml'
      });
    }
  }
}

console.log('--- Canonical Audit ---');
console.log('Pages missing <link rel="canonical">:');
console.log(missingCanonicalTag);
console.log('Canonical mismatches:');
console.log(canonicalMismatches);
