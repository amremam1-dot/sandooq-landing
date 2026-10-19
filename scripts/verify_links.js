#!/usr/bin/env node

/**
 * =============================================================================
 * Sandooq El-Amara — Link & Asset Integrity Verification Suite
 * =============================================================================
 * Target: sandooq-landing (90 HTML files, 86 Sitemap URLs)
 * Runtime: 100% Native Node.js (Zero external dependencies)
 *
 * Capabilities:
 *  1. Scans all 90 HTML files for:
 *     - <a href="...">
 *     - <link href="...">
 *     - <img src="..."> & <img srcset="...">
 *     - <script src="...">
 *     - <source srcset="...">
 *  2. Validates that every internal path resolves to a valid existing file on disk.
 *  3. Verifies that all 86 canonical sitemap URLs in sitemap.xml:
 *     - Map to existing local files on disk.
 *     - Return HTTP 200 OK via an integrated ephemeral HTTP test server.
 *  4. Provides clear exit code (0 = Clean, 1 = Failures detected).
 *
 * Usage:
 *  node scripts/verify_links.js
 *  node scripts/verify_links.js --quiet
 *  node scripts/verify_links.js --json
 *  node scripts/verify_links.js --no-server
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const SCRIPT_DIR = __dirname;
const LANDING_DIR = path.resolve(SCRIPT_DIR, '..');
const SITEMAP_PATH = path.join(LANDING_DIR, 'sitemap.xml');

// Parse CLI Flags
const args = process.argv.slice(2);
const IS_QUIET = args.includes('--quiet');
const IS_JSON = args.includes('--json');
const SKIP_SERVER = args.includes('--no-server');
const SHOW_HELP = args.includes('--help') || args.includes('-h');

if (SHOW_HELP) {
  console.log(`
Usage: node verify_links.js [options]

Options:
  --quiet        Suppress verbose scanning output, print only summary
  --json         Emit machine-readable JSON output for CI/CD pipelines
  --no-server    Skip ephemeral HTTP 200 server test (disk existence only)
  --help, -h     Show this help message
`);
  process.exit(0);
}

// ANSI Terminal Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const ignoredSchemes = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'javascript:',
  'data:',
  'ipn:',
  'sms:'
];

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=UTF-8',
  '.webmanifest': 'application/manifest+json'
};

// 1. Recursive HTML File Collector
function getHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '.git' && entry.name !== 'node_modules' && entry.name !== 'templates') {
        results = results.concat(getHtmlFiles(fullPath));
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// 2. Line Number Resolver
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// 3. Scan Single HTML File
function scanHtmlFile(filePath) {
  const relPath = path.relative(LANDING_DIR, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const items = [];

  const patterns = [
    { tag: 'a', attr: 'href', regex: /<a\b[^>]*\bhref=["']([^"']+)["']/gi },
    { tag: 'link', attr: 'href', regex: /<link\b[^>]*\bhref=["']([^"']+)["']/gi },
    { tag: 'img', attr: 'src', regex: /<img\b[^>]*\bsrc=["']([^"']+)["']/gi },
    { tag: 'script', attr: 'src', regex: /<script\b[^>]*\bsrc=["']([^"']+)["']/gi },
    { tag: 'source', attr: 'srcset', regex: /<source\b[^>]*\bsrcset=["']([^"']+)["']/gi },
    { tag: 'img', attr: 'srcset', regex: /<img\b[^>]*\bsrcset=["']([^"']+)["']/gi }
  ];

  for (const { tag, attr, regex } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const line = getLineNumber(content, match.index);
      const rawVal = match[1];

      if (attr === 'srcset') {
        const parts = rawVal.split(',');
        for (const p of parts) {
          const candidate = p.trim().split(/\s+/)[0];
          if (candidate) {
            items.push({
              sourceFile: relPath,
              sourceAbs: filePath,
              line,
              tag,
              attr,
              url: candidate
            });
          }
        }
      } else {
        items.push({
          sourceFile: relPath,
          sourceAbs: filePath,
          line,
          tag,
          attr,
          url: rawVal
        });
      }
    }
  }

  return items;
}

// 4. Resolve & Validate Target Path on Disk
function validateInternalTarget(item) {
  const raw = item.url.trim();
  const clean = raw.split('#')[0].split('?')[0].trim();
  if (!clean) return { valid: true, isExternal: false, isEmpty: true };

  for (const scheme of ignoredSchemes) {
    if (clean.toLowerCase().startsWith(scheme)) {
      return { valid: true, isExternal: true, scheme };
    }
  }

  let resolvedPath;
  if (clean.startsWith('/')) {
    // Root-relative link
    resolvedPath = path.join(LANDING_DIR, clean.slice(1));
  } else {
    // Document-relative link
    resolvedPath = path.join(path.dirname(item.sourceAbs), clean);
  }

  let exists = fs.existsSync(resolvedPath);
  if (!exists && (clean.endsWith('/') || !path.extname(clean))) {
    const tryIndex = path.join(resolvedPath, 'index.html');
    if (fs.existsSync(tryIndex)) {
      exists = true;
      resolvedPath = tryIndex;
    } else {
      const tryHtml = resolvedPath + '.html';
      if (fs.existsSync(tryHtml)) {
        exists = true;
        resolvedPath = tryHtml;
      }
    }
  }

  return {
    valid: exists,
    isExternal: false,
    targetDiskPath: resolvedPath,
    relDiskTarget: path.relative(LANDING_DIR, resolvedPath).replace(/\\/g, '/')
  };
}

// 5. Ephemeral HTTP Test Server for Sitemap Verification
async function verifySitemapHttp(sitemapUrls) {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath;
    if (reqPath === '/' || reqPath === '') {
      filePath = path.join(LANDING_DIR, 'index.html');
    } else if (reqPath.endsWith('/')) {
      filePath = path.join(LANDING_DIR, reqPath.slice(1), 'index.html');
    } else {
      filePath = path.join(LANDING_DIR, reqPath.slice(1));
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', async () => {
      const port = server.address().port;
      const results = [];

      for (const loc of sitemapUrls) {
        const u = new URL(loc);
        const reqPath = u.pathname;

        const resResult = await new Promise((r) => {
          const req = http.get(`http://127.0.0.1:${port}${reqPath}`, (res) => {
            const status = res.statusCode;
            res.resume();
            r({ url: loc, path: reqPath, status, ok: status === 200 });
          });
          req.on('error', (err) => {
            r({ url: loc, path: reqPath, status: 0, error: err.message, ok: false });
          });
        });
        results.push(resResult);
      }

      server.close(() => resolve(results));
    });
  });
}

// 6. Main Runner
async function main() {
  const startTime = Date.now();

  if (!IS_JSON && !IS_QUIET) {
    console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}     Sandooq El-Amara — Link & Asset Verification Suite         ${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);
  }

  // Phase 1: Collect HTML files
  const htmlFiles = getHtmlFiles(LANDING_DIR);
  if (!IS_JSON && !IS_QUIET) {
    console.log(`[1/3] Discovered ${colors.bold}${htmlFiles.length}${colors.reset} HTML pages in sandooq-landing`);
  }

  // Phase 2: Link & Asset Audit
  let totalElements = 0;
  let externalCount = 0;
  let internalCount = 0;
  const brokenLinks = [];
  const tagBreakdown = { a: 0, link: 0, img: 0, script: 0, source: 0 };

  for (const file of htmlFiles) {
    const items = scanHtmlFile(file);
    for (const item of items) {
      totalElements++;
      if (tagBreakdown[item.tag] !== undefined) tagBreakdown[item.tag]++;

      const val = validateInternalTarget(item);
      if (val.isExternal) {
        externalCount++;
      } else if (!val.isEmpty) {
        internalCount++;
        if (!val.valid) {
          brokenLinks.push({
            file: item.sourceFile,
            line: item.line,
            tag: item.tag,
            attr: item.attr,
            url: item.url,
            resolvedTarget: val.relDiskTarget
          });
        }
      }
    }
  }

  if (!IS_JSON && !IS_QUIET) {
    console.log(`[2/3] Scanned ${colors.bold}${totalElements}${colors.reset} elements across ${htmlFiles.length} pages:`);
    console.log(`      - <a href>: ${tagBreakdown.a} | <link href>: ${tagBreakdown.link} | <img src>: ${tagBreakdown.img}`);
    console.log(`      - <script src>: ${tagBreakdown.script} | <source/img srcset>: ${tagBreakdown.source}`);
    console.log(`      - Internal targets verified: ${colors.bold}${internalCount}${colors.reset}`);
    console.log(`      - External URLs bypassed: ${colors.dim}${externalCount}${colors.reset}`);
  }

  // Phase 3: Sitemap.xml Verification
  if (!IS_JSON && !IS_QUIET) {
    console.log(`\n[3/3] Auditing sitemap.xml canonical routes...`);
  }

  if (!fs.existsSync(SITEMAP_PATH)) {
    if (IS_JSON) {
      console.log(JSON.stringify({ error: `sitemap.xml missing at ${SITEMAP_PATH}` }, null, 2));
    } else {
      console.error(`${colors.red}CRITICAL: sitemap.xml not found at ${SITEMAP_PATH}${colors.reset}`);
    }
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

  let sitemapHttpResults = [];
  if (!SKIP_SERVER) {
    sitemapHttpResults = await verifySitemapHttp(sitemapUrls);
  } else {
    // Disk-only fallback check
    sitemapHttpResults = sitemapUrls.map((loc) => {
      const u = new URL(loc);
      let p = u.pathname;
      let targetFile = p === '/' || p === '' ? 'index.html' : p.endsWith('/') ? p.slice(1) + 'index.html' : p.slice(1);
      const exists = fs.existsSync(path.join(LANDING_DIR, targetFile));
      return { url: loc, path: p, status: exists ? 200 : 404, ok: exists };
    });
  }

  const failedSitemap = sitemapHttpResults.filter((r) => !r.ok);
  const isClean = brokenLinks.length === 0 && failedSitemap.length === 0;
  const durationMs = Date.now() - startTime;

  // JSON Output Mode
  if (IS_JSON) {
    console.log(
      JSON.stringify(
        {
          success: isClean,
          durationMs,
          totalPages: htmlFiles.length,
          totalElementsScanned: totalElements,
          internalLinksChecked: internalCount,
          externalLinksIgnored: externalCount,
          tagBreakdown,
          sitemapTotal: sitemapUrls.length,
          sitemapFailures: failedSitemap,
          brokenLinksCount: brokenLinks.length,
          brokenLinks
        },
        null,
        2
      )
    );
    process.exit(isClean ? 0 : 1);
  }

  // Terminal Pretty-Printed Report
  console.log(`\n${colors.bold}----------------------- AUDIT SUMMARY -----------------------${colors.reset}`);
  console.log(`Duration: ${durationMs}ms | Pages: ${htmlFiles.length} | Sitemap URLs: ${sitemapUrls.length}`);

  if (brokenLinks.length === 0) {
    console.log(`${colors.green}✓ All ${internalCount} internal links and assets resolve cleanly on disk.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Detected ${brokenLinks.length} broken internal link/asset reference(s):${colors.reset}`);
    brokenLinks.forEach((b, idx) => {
      console.log(`  ${idx + 1}. [${b.file}:${b.line}] <${b.tag} ${b.attr}="${b.url}">`);
      console.log(`     -> Expected file on disk: ${colors.yellow}${b.resolvedTarget}${colors.reset}`);
    });
  }

  if (failedSitemap.length === 0) {
    console.log(`${colors.green}✓ All ${sitemapUrls.length} canonical sitemap URLs returned HTTP 200 OK.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Detected ${failedSitemap.length} failing sitemap URL(s):${colors.reset}`);
    failedSitemap.forEach((f) => {
      console.log(`  - ${f.url} (Status: ${f.status || 'ERROR'} | Route: ${f.path})`);
    });
  }

  console.log(`${colors.bold}-------------------------------------------------------------${colors.reset}`);
  console.log(
    `Exit Status: ${isClean ? colors.green + '0 (CLEAN - READY FOR PRODUCTION)' : colors.red + '1 (FAILURES DETECTED)'}${colors.reset}\n`
  );

  process.exit(isClean ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
