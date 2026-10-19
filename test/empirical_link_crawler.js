/**
 * empirical_link_crawler.js
 * Comprehensive Empirical Link & Integrity Verification Harness
 * Challenger 2 (Milestone 1)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { URL } = require('url');

const LANDING_ROOT = path.resolve(__dirname, '..');
const SITEMAP_PATH = path.join(LANDING_ROOT, 'sitemap.xml');

// Data structures
const findings = {
  scannedFiles: 0,
  elementsScanned: 0,
  internalLinks: 0,
  externalLinks: 0,
  anchorsChecked: 0,
  brokenDiskTargets: [],
  brokenAnchors: [],
  caseMismatches: [],
  unrenderedPlaceholders: [],
  privacyAudit: {
    scanned: 0,
    broken: []
  },
  sitemapAudit: {
    total: 0,
    success: 0,
    failures: []
  }
};

// 1. Collect all HTML files
function getHtmlFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'templates'].includes(entry.name)) continue;
      files = files.concat(getHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

// Case sensitivity verifier
// Verifies on disk whether each segment of resolved path matches exact case in the filesystem
function verifyExactCase(root, relativePath) {
  const segments = relativePath.split(/[/\\]/).filter(Boolean);
  let currentDir = root;
  for (const segment of segments) {
    if (!fs.existsSync(currentDir)) return false;
    const entries = fs.readdirSync(currentDir);
    const exactMatch = entries.find(e => e === segment);
    if (!exactMatch) {
      // Check if case-insensitive match exists
      const ciMatch = entries.find(e => e.toLowerCase() === segment.toLowerCase());
      if (ciMatch) {
        return { ok: false, expected: ciMatch, actual: segment };
      }
      return false; // Does not exist
    }
    currentDir = path.join(currentDir, exactMatch);
  }
  return { ok: true };
}

// Cache file contents and DOM ids
const domCache = new Map();

function getDomInfo(filePath) {
  if (domCache.has(filePath)) return domCache.get(filePath);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const ids = new Set();
  const names = new Set();

  // Match id="..."
  const idRegex = /\bid=["']([^"']+)["']/gi;
  let m;
  while ((m = idRegex.exec(content)) !== null) {
    ids.add(m[1]);
  }

  // Match name="..." on a or input
  const nameRegex = /<(?:a|input|button)\b[^>]*\bname=["']([^"']+)["']/gi;
  while ((m = nameRegex.exec(content)) !== null) {
    names.add(m[1]);
  }

  const info = { content, ids, names };
  domCache.set(filePath, info);
  return info;
}

const ignoredSchemes = [
  'http:', 'https:', 'mailto:', 'tel:', 'javascript:', 'data:', 'sms:', 'ipn:'
];

// Scan an HTML file
function scanHtml(filePath) {
  const relFile = path.relative(LANDING_ROOT, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  findings.scannedFiles++;

  // Check unrendered template tags
  const placeholderRegex = /\{\{[A-Z0-9_]+\}\}|<!--\s*COMPONENT:\s*[A-Z0-9_]+\s*-->/g;
  let pMatch;
  while ((pMatch = placeholderRegex.exec(content)) !== null) {
    findings.unrenderedPlaceholders.push({
      file: relFile,
      match: pMatch[0],
      index: pMatch.index
    });
  }

  // Match tags
  const patterns = [
    { tag: 'a', attr: 'href', regex: /<a\b[^>]*\bhref=["']([^"']+)["']/gi },
    { tag: 'link', attr: 'href', regex: /<link\b[^>]*\bhref=["']([^"']+)["']/gi },
    { tag: 'img', attr: 'src', regex: /<img\b[^>]*\bsrc=["']([^"']+)["']/gi },
    { tag: 'img', attr: 'srcset', regex: /<img\b[^>]*\bsrcset=["']([^"']+)["']/gi },
    { tag: 'script', attr: 'src', regex: /<script\b[^>]*\bsrc=["']([^"']+)["']/gi },
    { tag: 'source', attr: 'src', regex: /<source\b[^>]*\bsrc=["']([^"']+)["']/gi },
    { tag: 'source', attr: 'srcset', regex: /<source\b[^>]*\bsrcset=["']([^"']+)["']/gi }
  ];

  for (const { tag, attr, regex } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      findings.elementsScanned++;
      const rawVal = match[1];

      // If srcset, split into entries
      const urls = attr === 'srcset' 
        ? rawVal.split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean)
        : [rawVal];

      for (const url of urls) {
        processUrl(relFile, filePath, tag, attr, url);
      }
    }
  }
}

function processUrl(relFile, absFile, tag, attr, url) {
  const isPrivacy = relFile === 'privacy/index.html';
  if (isPrivacy) findings.privacyAudit.scanned++;

  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('#top')) {
    return;
  }

  for (const s of ignoredSchemes) {
    if (trimmed.toLowerCase().startsWith(s)) {
      findings.externalLinks++;
      return;
    }
  }

  findings.internalLinks++;

  // Separate path from fragment and query
  const [withoutFrag, frag] = trimmed.split('#');
  const [cleanPath, query] = withoutFrag.split('?');

  let targetDiskPath;
  let targetFile = cleanPath;

  if (!cleanPath) {
    // Self-referential anchor, e.g. href="#features"
    targetDiskPath = absFile;
  } else if (cleanPath.startsWith('/')) {
    // Root relative
    targetDiskPath = path.join(LANDING_ROOT, cleanPath.slice(1));
  } else {
    // Document relative
    targetDiskPath = path.join(path.dirname(absFile), cleanPath);
  }

  // Handle directory or extensionless paths
  let resolvedFilePath = targetDiskPath;
  if (!cleanPath) {
    resolvedFilePath = absFile;
  } else if (fs.existsSync(targetDiskPath) && fs.statSync(targetDiskPath).isDirectory()) {
    resolvedFilePath = path.join(targetDiskPath, 'index.html');
  } else if (!fs.existsSync(targetDiskPath)) {
    if (fs.existsSync(targetDiskPath + '.html')) {
      resolvedFilePath = targetDiskPath + '.html';
    } else if (fs.existsSync(path.join(targetDiskPath, 'index.html'))) {
      resolvedFilePath = path.join(targetDiskPath, 'index.html');
    }
  }

  // 1. Verify existence on disk
  if (!fs.existsSync(resolvedFilePath)) {
    const error = {
      source: relFile,
      tag,
      attr,
      url,
      resolvedTarget: path.relative(LANDING_ROOT, resolvedFilePath).replace(/\\/g, '/')
    };
    findings.brokenDiskTargets.push(error);
    if (isPrivacy) findings.privacyAudit.broken.push(error);
    return;
  }

  // 2. Case sensitivity check
  if (cleanPath) {
    const relFromRoot = path.relative(LANDING_ROOT, resolvedFilePath);
    const caseResult = verifyExactCase(LANDING_ROOT, relFromRoot);
    if (caseResult && !caseResult.ok) {
      findings.caseMismatches.push({
        source: relFile,
        url,
        expectedCase: caseResult.expected,
        actualCase: caseResult.actual
      });
    }
  }

  // 3. Anchor target check
  if (frag) {
    findings.anchorsChecked++;
    const dom = getDomInfo(resolvedFilePath);
    if (dom) {
      const decodedFrag = decodeURIComponent(frag);
      const anchorExists = dom.ids.has(frag) || 
                           dom.ids.has(decodedFrag) || 
                           dom.names.has(frag) || 
                           dom.names.has(decodedFrag) ||
                           frag === 'top' || frag === '';

      if (!anchorExists) {
        const error = {
          source: relFile,
          targetFile: path.relative(LANDING_ROOT, resolvedFilePath).replace(/\\/g, '/'),
          anchor: frag,
          url
        };
        findings.brokenAnchors.push(error);
        if (isPrivacy) findings.privacyAudit.broken.push(error);
      }
    }
  }
}

// Ephemeral HTTP Server for Sitemap & Canonical test
async function testSitemapHttp() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    findings.sitemapAudit.failures.push({ url: 'sitemap.xml', reason: 'Missing sitemap.xml' });
    return;
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  findings.sitemapAudit.total = urls.length;

  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath;
    if (reqPath === '/' || reqPath === '') {
      filePath = path.join(LANDING_ROOT, 'index.html');
    } else if (reqPath.endsWith('/')) {
      filePath = path.join(LANDING_ROOT, reqPath.slice(1), 'index.html');
    } else {
      filePath = path.join(LANDING_ROOT, reqPath.slice(1));
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', async () => {
      const port = server.address().port;
      for (const loc of urls) {
        const parsed = new URL(loc);
        const reqPath = parsed.pathname;

        const res = await new Promise((r) => {
          const req = http.get(`http://127.0.0.1:${port}${reqPath}`, (response) => {
            const status = response.statusCode;
            let body = '';
            response.on('data', chunk => { body += chunk; });
            response.on('end', () => {
              r({ status, size: body.length });
            });
          });
          req.on('error', err => r({ status: 0, error: err.message }));
        });

        if (res.status === 200 && res.size > 0) {
          findings.sitemapAudit.success++;
        } else {
          findings.sitemapAudit.failures.push({
            url: loc,
            path: reqPath,
            status: res.status,
            size: res.size
          });
        }
      }

      server.close(() => resolve());
    });
  });
}

async function run() {
  console.log('--- Starting Empirical Link & Integrity Crawl ---');
  const htmlFiles = getHtmlFiles(LANDING_ROOT);
  console.log(`Found ${htmlFiles.length} HTML files.`);

  for (const file of htmlFiles) {
    scanHtml(file);
  }

  await testSitemapHttp();

  console.log('--- Crawl Results Summary ---');
  console.log(`Scanned HTML Files:         ${findings.scannedFiles}`);
  console.log(`Total Elements Scanned:     ${findings.elementsScanned}`);
  console.log(`Internal Links Verified:    ${findings.internalLinks}`);
  console.log(`External Links Skipped:     ${findings.externalLinks}`);
  console.log(`Anchors (#) Checked:        ${findings.anchorsChecked}`);
  console.log(`Unrendered Placeholders:    ${findings.unrenderedPlaceholders.length}`);
  console.log(`Broken Disk Targets:        ${findings.brokenDiskTargets.length}`);
  console.log(`Broken Anchors:             ${findings.brokenAnchors.length}`);
  console.log(`Case Mismatches:            ${findings.caseMismatches.length}`);
  console.log(`Privacy Page Broken Links:  ${findings.privacyAudit.broken.length} (out of ${findings.privacyAudit.scanned} scanned)`);
  console.log(`Sitemap Canonical Tested:   ${findings.sitemapAudit.success}/${findings.sitemapAudit.total} passed`);

  if (findings.unrenderedPlaceholders.length > 0) {
    console.log('\n[!] UNRENDERED PLACEHOLDERS:');
    console.log(JSON.stringify(findings.unrenderedPlaceholders, null, 2));
  }

  if (findings.brokenDiskTargets.length > 0) {
    console.log('\n[!] BROKEN DISK TARGETS:');
    console.log(JSON.stringify(findings.brokenDiskTargets, null, 2));
  }

  if (findings.brokenAnchors.length > 0) {
    console.log('\n[!] BROKEN ANCHORS:');
    console.log(JSON.stringify(findings.brokenAnchors, null, 2));
  }

  if (findings.caseMismatches.length > 0) {
    console.log('\n[!] CASE MISMATCHES:');
    console.log(JSON.stringify(findings.caseMismatches, null, 2));
  }

  if (findings.sitemapAudit.failures.length > 0) {
    console.log('\n[!] SITEMAP FAILURES:');
    console.log(JSON.stringify(findings.sitemapAudit.failures, null, 2));
  }

  const isApproved = findings.brokenDiskTargets.length === 0 &&
                     findings.brokenAnchors.length === 0 &&
                     findings.caseMismatches.length === 0 &&
                     findings.unrenderedPlaceholders.length === 0 &&
                     findings.privacyAudit.broken.length === 0 &&
                     findings.sitemapAudit.failures.length === 0;

  console.log(`\n================ FINAL VERDICT ================`);
  console.log(isApproved ? 'VERDICT: APPROVE' : 'VERDICT: REJECT');
  console.log(`===============================================`);

  process.exit(isApproved ? 0 : 1);
}

run().catch(err => {
  console.error('Crawler crashed:', err);
  process.exit(1);
});
