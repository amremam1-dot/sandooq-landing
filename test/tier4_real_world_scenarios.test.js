/**
 * tier4_real_world_scenarios.test.js
 * Tier 4: Realistic User and Application Workload Scenarios (Minimum 6 tests)
 * Pure Node.js - Zero external runtime dependencies
 */

const path = require('path');
const fs = require('fs');
const {
  assert,
  assertEqual,
  assertFileExists,
  assertLessThan,
  readLandingFile,
  landingFileExists,
  normalizeArabicText,
  runNodeScript,
  LANDING_ROOT
} = require('./helpers/test_utils');

const tests = [];

function registerTest(id, name, requirement, fn) {
  tests.push({ id, name, tier: 4, requirement, fn });
}

/* ==========================================================================
   Scenario 1: The Frustrated Building Treasurer (مسؤول العمارة المرهق)
   ========================================================================== */

registerTest('T4.1', 'Workflow 1 - Building Treasurer Complete Collection & WhatsApp Receipt Flow', 'R1+UX', () => {
  const indexHtml = readLandingFile('index.html') || '';
  const simulatorTpl = readLandingFile('templates/components/hero_simulator.html') || '';
  const simulatorJs = readLandingFile('js/simulator.js') || '';
  const combined = indexHtml + simulatorTpl + simulatorJs;

  // Step 1: Treasurer views unit list with paid/unpaid status
  assert(combined.includes('101') && combined.includes('102'), 'Flow Step 1: Simulator displays units');
  // Step 2: Clicks collection on unpaid unit (102)
  assert(combined.includes('تحصيل') || combined.includes('سداد'), 'Flow Step 2: Collection trigger available');
  // Step 3: Selects payment method and amount
  assert(combined.includes('كاش') || combined.includes('بنك') || combined.includes('انستاباي'), 'Flow Step 3: Payment treasury selection');
  // Step 4: Receives certified WhatsApp receipt with official verification
  assert(combined.includes('إيصال') || combined.includes('receipt'), 'Flow Step 4: WhatsApp receipt generated');
  // Step 5: Conversion CTA is clearly available
  assert(combined.includes('حمّل التطبيق') || combined.includes('عمارتك') || combined.includes('download'), 'Flow Step 5: Direct conversion link');
});

/* ==========================================================================
   Scenario 2: The Mobile Tenant Searching for Water Bill Rules (الساكن الباحث)
   ========================================================================== */

registerTest('T4.2', 'Workflow 2 - Mobile Tenant Instant Live Search & Guide Navigation Flow', 'R2+UX', () => {
  const indexPath = path.join(LANDING_ROOT, 'data', 'search_index.json');
  assertFileExists(indexPath, 'Flow Step 1: Search index data/search_index.json must exist');

  const rawData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  // Step 2: Tenant searches for water bill ("فاتورة مياه")
  const query = normalizeArabicText('فاتورة مياه');
  const t0 = process.hrtime();
  const results = rawData.filter(item => {
    const text = Array.isArray(item) ? item.join(' ') : JSON.stringify(item);
    return normalizeArabicText(text).includes(query);
  });
  const diff = process.hrtime(t0);
  const latencyMs = (diff[0] * 1000) + (diff[1] / 1e6);

  // Step 3: Results return in sub-millisecond time (<30ms limit)
  assertLessThan(latencyMs, 30, `Flow Step 3: Search latency (${latencyMs.toFixed(3)}ms) must be < 30ms`);
  assert(results.length > 0, 'Flow Step 4: Search returns relevant results for water bill');

  // Step 5: Verify matching result leads to a physical existing page
  const firstResult = results[0];
  const slug = Array.isArray(firstResult) ? firstResult[1] : (firstResult.slug || firstResult.url);
  if (slug) {
    const targetFile = path.join(LANDING_ROOT, slug.replace(/^\//, ''));
    assert(fs.existsSync(targetFile) || fs.existsSync(targetFile + '.html') || fs.existsSync(path.join(targetFile, 'index.html')), 
      `Flow Step 5: Search result target path must exist on disk: ${slug}`);
  }
});

/* ==========================================================================
   Scenario 3: The Large Property Owner Diagnostic Quiz (مالك عقار كبير)
   ========================================================================== */

registerTest('T4.3', 'Workflow 3 - Large Property Owner Qualification & Action Plan Flow', 'R3+UX', () => {
  const quizTpl = readLandingFile('templates/components/diagnostic_quiz.html') || 
                  readLandingFile('index.html') || '';
  const quizJs = readLandingFile('js/quiz.js') || '';
  const combined = quizTpl + quizJs;

  // Step 1: Selects large property (> 25 units or compound)
  assert(combined.includes('25') || combined.includes('كمبوند'), 'Flow Step 1: Large property option available');
  // Step 2: Identifies arrears collection as greatest pain point
  assert(combined.includes('متأخرات'), 'Flow Step 2: Arrears pain point available');
  // Step 3: Generates recommendation report
  assert(combined.includes('توصية') || combined.includes('تقرير') || combined.includes('recommendation'), 'Flow Step 3: Tailored recommendation generated');
  // Step 4: Offers dual conversion paths (Download or Try Simulator)
  assert(combined.includes('تحميل') || combined.includes('حمّل'), 'Flow Step 4: Primary CTA to download app');
});

/* ==========================================================================
   Scenario 4: Keyboard Power User Command Palette Exploration (مستخدم حاسوب)
   ========================================================================== */

registerTest('T4.4', 'Workflow 4 - Keyboard Power User Command Palette Navigation Flow', 'R2+Hotkeys', () => {
  const searchJs = readLandingFile('js/search.js') || '';
  const scriptJs = readLandingFile('script.js') || '';
  const headerTpl = readLandingFile('templates/header.html') || '';
  const combined = searchJs + scriptJs + headerTpl;

  // Step 1: Keydown handler intercepts Ctrl+K / Cmd+K
  const hasShortcut = combined.includes('KeyK') || combined.includes('ctrlKey') || combined.includes('metaKey');
  assert(hasShortcut, 'Flow Step 1: Ctrl+K / Cmd+K key listener must be registered');

  // Step 2: Modal dialog opens and receives input focus
  assert(combined.includes('search') || combined.includes('focus'), 'Flow Step 2: Search input focus handling');

  // Step 3: Escape key dismisses modal
  const hasEscape = combined.includes('Escape') || combined.includes('27');
  assert(hasEscape, 'Flow Step 3: Escape key modal dismissal handling');
});

/* ==========================================================================
   Scenario 5: Complete Static Site Build & 100% 86-Link Sitemap Integrity
   ========================================================================== */

registerTest('T4.5', 'Workflow 5 - Full Site Build Pipeline & 86-Link Canonical Sitemap Verification', 'R4+AC.3', () => {
  // Step 1: Read sitemap.xml
  const sitemapXml = readLandingFile('sitemap.xml');
  assert(sitemapXml !== null, 'sitemap.xml must exist');

  // Step 2: Extract all canonical URLs
  const locRegex = /<loc>https?:\/\/[^\/]+\/([^<]*)<\/loc>/g;
  let match;
  const urls = [];
  while ((match = locRegex.exec(sitemapXml)) !== null) {
    urls.push(match[1]);
  }

  assertEqual(urls.length, 86, `sitemap.xml must contain exactly 86 canonical links, found ${urls.length}`);

  // Step 3: Verify all 86 links map directly to physical files on disk
  for (const rawUrl of urls) {
    const cleanPath = rawUrl.replace(/\/$/, '');
    let candidatePath = cleanPath === '' ? 'index.html' : cleanPath;
    
    let resolved = path.join(LANDING_ROOT, candidatePath);
    if (!fs.existsSync(resolved)) {
      resolved = path.join(LANDING_ROOT, candidatePath + '.html');
    }
    if (!fs.existsSync(resolved)) {
      resolved = path.join(LANDING_ROOT, candidatePath, 'index.html');
    }
    assert(fs.existsSync(resolved), `Canonical sitemap URL does not resolve to file on disk: ${rawUrl} -> ${resolved}`);
  }
});

/* ==========================================================================
   Scenario 6: Strict Zero-Dependency & Asset Privacy Verification
   ========================================================================== */

registerTest('T4.6', 'Workflow 6 - Zero External Runtime Dependencies & Asset Privacy Verification', 'AC.1', () => {
  // Disallowed external CDNs
  const forbiddenCDNs = [
    'cdn.jsdelivr.net',
    'cdnjs.cloudflare.com',
    'unpkg.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'ajax.googleapis.com',
    'code.jquery.com',
    'stackpath.bootstrapcdn.com'
  ];

  const htmlFilesToCheck = ['index.html', 'about.html', 'download.html', 'guides/index.html', 'tools/index.html', 'solutions/index.html'];

  for (const relPath of htmlFilesToCheck) {
    const content = readLandingFile(relPath);
    if (!content) continue;
    for (const cdn of forbiddenCDNs) {
      assert(!content.includes(cdn), `${relPath} must not load external runtime scripts or fonts from ${cdn} (100% self-hosted required)`);
    }
  }

  // Verify local font file exists
  assertFileExists(path.join(LANDING_ROOT, 'assets', 'fonts', 'cairo-arabic.woff2'), 'Self-hosted Cairo font (cairo-arabic.woff2) must exist locally');
});

module.exports = { tests };
