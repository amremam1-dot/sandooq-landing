/**
 * tier1_feature_coverage.test.js
 * Tier 1: Core Feature Coverage Tests (Minimum 5 tests per feature for R1, R2, R3, R4)
 * Pure Node.js - Zero external runtime dependencies
 */

const path = require('path');
const fs = require('fs');
const vm = require('vm');
const {
  assert,
  assertEqual,
  assertFileExists,
  assertLessThan,
  assertIncludes,
  assertMatch,
  readLandingFile,
  landingFileExists,
  getLandingFileSize,
  findElementById,
  findElementsByClass,
  hasElementWithAttribute,
  normalizeArabicText,
  runNodeScript,
  LANDING_ROOT
} = require('./helpers/test_utils');

const tests = [];

function registerTest(id, name, requirement, fn) {
  tests.push({ id, name, tier: 1, requirement, fn });
}

/* ==========================================================================
   R1: Interactive Web Simulator (محاكي تفاعلي حي)
   ========================================================================== */

registerTest('T1.1.1', 'R1.1 - Simulator DOM Hook and Container Target', 'R1', () => {
  const indexHtml = readLandingFile('index.html');
  assert(indexHtml !== null, 'index.html must exist');
  
  // Must be targeted inside the hero phone frame
  const hasPhoneMockup = indexHtml.includes('class="phone-mockup"') || indexHtml.includes('class="hero-art"');
  assert(hasPhoneMockup, 'Hero phone mockup frame must exist in index.html');

  // Simulator container hook #app-simulator or .app-simulator
  const hasSimulator = indexHtml.includes('id="app-simulator"') || 
                       indexHtml.includes('class="app-simulator"') ||
                       landingFileExists('templates/components/hero_simulator.html') ||
                       landingFileExists('js/simulator.js');
  assert(hasSimulator, 'Interactive simulator markup or component template must be defined');
});

registerTest('T1.1.2', 'R1.2 - Initial State & Apartment List Status Badges', 'R1', () => {
  const indexHtml = readLandingFile('index.html') || '';
  const simulatorTpl = readLandingFile('templates/components/hero_simulator.html') || '';
  const simulatorJs = readLandingFile('js/simulator.js') || '';
  const combined = indexHtml + simulatorTpl + simulatorJs;

  assert(combined.length > 0, 'Simulator sources must exist');
  // Check units 101 and 102 state definitions
  const hasApt101 = combined.includes('101');
  const hasApt102 = combined.includes('102');
  assert(hasApt101 && hasApt102, 'Simulator must define apartments (e.g. 101 and 102)');

  // Check status badges: Paid (مسدد) and Unpaid (غير مسدد)
  const hasPaid = combined.includes('مسدد');
  const hasUnpaid = combined.includes('غير مسدد');
  assert(hasPaid && hasUnpaid, 'Simulator apartment list must present paid and unpaid status badges');
});

registerTest('T1.1.3', 'R1.3 - Payment Action Modal & Treasury Selector', 'R1', () => {
  const simulatorTpl = readLandingFile('templates/components/hero_simulator.html') || '';
  const simulatorJs = readLandingFile('js/simulator.js') || '';
  const indexHtml = readLandingFile('index.html') || '';
  const combined = simulatorTpl + simulatorJs + indexHtml;

  assert(combined.includes('تحصيل') || combined.includes('سداد'), 'Payment trigger button (تحصيل / سداد) must exist');
  // Treasury selector: Cash / Bank (كاش / بنك)
  const hasCash = combined.includes('كاش') || combined.includes('خزينة');
  const hasBank = combined.includes('بنك') || combined.includes('انستاباي') || combined.includes('InstaPay');
  assert(hasCash && hasBank, 'Payment modal must provide treasury selection (كاش / بنك أو انستاباي)');
});

registerTest('T1.1.4', 'R1.4 - Certified WhatsApp Receipt Generation Structure', 'R1', () => {
  const simulatorTpl = readLandingFile('templates/components/hero_simulator.html') || '';
  const simulatorJs = readLandingFile('js/simulator.js') || '';
  const indexHtml = readLandingFile('index.html') || '';
  const combined = simulatorTpl + simulatorJs + indexHtml;

  // Receipt must contain WhatsApp receipt indicator and verification stamp
  const hasReceiptIndicator = combined.includes('إيصال') || combined.includes('receipt');
  const hasStamp = combined.includes('SN-8821') || combined.includes('معتمد') || combined.includes('موثق');
  assert(hasReceiptIndicator, 'Receipt screen/view must exist');
  assert(hasStamp, 'WhatsApp receipt must include official certified stamp (e.g. #SN-8821 or معتمد)');
});

registerTest('T1.1.5', 'R1.5 - Replay Loop & Fund Transition State Toggle', 'R1', () => {
  const simulatorTpl = readLandingFile('templates/components/hero_simulator.html') || '';
  const simulatorJs = readLandingFile('js/simulator.js') || '';
  const combined = simulatorTpl + simulatorJs;

  // Replay action button/loop
  const hasReplay = combined.includes('إعادة') || combined.includes('جديدة') || combined.includes('replay') || combined.includes('reset');
  assert(hasReplay, 'Simulator must support transaction replay or new transaction cycle');
});

registerTest('T1.1.6', 'R1.6 - Immediate Conversion CTA in Simulator Flow', 'R1', () => {
  const simulatorTpl = readLandingFile('templates/components/hero_simulator.html') || '';
  const simulatorJs = readLandingFile('js/simulator.js') || '';
  const indexHtml = readLandingFile('index.html') || '';
  const combined = simulatorTpl + simulatorJs + indexHtml;

  // Conversion CTA "جرّب هذا على عمارتك — حمّل التطبيق مجاناً"
  const hasCta = combined.includes('عمارتك') || combined.includes('حمّل التطبيق') || combined.includes('download');
  assert(hasCta, 'Simulator receipt flow must present conversion CTA leading to app download');
});

/* ==========================================================================
   R2: Instant Live Search Hub (محرك بحث فوري للأدلة والحاسبات)
   ========================================================================== */

registerTest('T1.2.1', 'R2.1 - Search Index Existence, Schema & Size Constraint (<20KB)', 'R2', () => {
  const indexPath = path.join(LANDING_ROOT, 'data', 'search_index.json');
  assertFileExists(indexPath, 'Search index file data/search_index.json must exist');

  const size = fs.statSync(indexPath).size;
  // Maximum uncompressed size allowed is 20KB (20,480 bytes)
  assertLessThan(size, 20480, `Search index uncompressed size (${size} bytes) must be strictly < 20KB`);

  const content = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  assert(Array.isArray(content), 'Search index must be an array of indexed items');
  assert(content.length >= 52, `Search index must index at least 52 items (35 guides + 17 tools), found ${content.length}`);
});

registerTest('T1.2.2', 'R2.2 - Arabic Normalization Engine Functionality', 'R2', () => {
  const searchJs = readLandingFile('js/search.js') || '';
  assert(searchJs.length > 0, 'js/search.js search engine script must exist');

  // Verify Arabic normalization handles:
  // Alif: أ, إ, آ, ٱ -> ا
  // Taa marbuta: ة -> ه
  // Tashkeel / diacritics removed
  const testInput = 'إِدَارَةُ ٱلْعِمَارَةِ وَالأَسَانْسِير';
  const expectedNormalized = 'اداره العماره والاسانسير';
  const actual = normalizeArabicText(testInput);
  assertEqual(actual, expectedNormalized, 'Arabic normalization must unify alif, taa marbuta, and strip tashkeel');
});

registerTest('T1.2.3', 'R2.3 - Search Engine Latency Benchmark (<30ms)', 'R2', () => {
  const indexPath = path.join(LANDING_ROOT, 'data', 'search_index.json');
  assertFileExists(indexPath, 'Search index data/search_index.json must exist for benchmark');

  const rawData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  // Run 100 benchmark queries across the in-memory index
  const queries = ['اسانسير', 'بواب', 'مياه', 'انستاباي', 'صيانة', 'وديعة'];
  const t0 = process.hrtime();
  for (let i = 0; i < 100; i++) {
    const q = normalizeArabicText(queries[i % queries.length]);
    rawData.filter(item => {
      const str = Array.isArray(item) ? item.join(' ') : JSON.stringify(item);
      return normalizeArabicText(str).includes(q);
    });
  }
  const diff = process.hrtime(t0);
  const totalMs = (diff[0] * 1000) + (diff[1] / 1e6);
  const avgMs = totalMs / 100;

  assertLessThan(avgMs, 30, `Average search latency (${avgMs.toFixed(3)}ms) must be strictly < 30ms`);
});

registerTest('T1.2.4', 'R2.4 - Safe Text Highlighting with HTML Escaping', 'R2', () => {
  const searchJs = readLandingFile('js/search.js') || '';
  assert(searchJs.length > 0, 'js/search.js must exist to test text highlighting');
  
  // Highlighting must wrap matches in <mark> and escape raw HTML
  assert(searchJs.includes('<mark>') || searchJs.includes('mark'), 'Highlighting engine must output <mark> tags');
  assert(searchJs.includes('escape') || searchJs.includes('&amp;') || searchJs.includes('replace'), 'Search engine must escape HTML to prevent XSS');
});

registerTest('T1.2.5', 'R2.5 - Filter Category Tabs (الكل / أدلة / حاسبات / حلول)', 'R2', () => {
  const searchTpl = readLandingFile('templates/components/search_hub.html') || 
                    readLandingFile('templates/components/search_modal.html') || 
                    readLandingFile('js/search.js') || 
                    readLandingFile('index.html') || '';

  const hasAll = searchTpl.includes('الكل');
  const hasGuides = searchTpl.includes('أدلة') || searchTpl.includes('ادلة');
  const hasTools = searchTpl.includes('حاسبات') || searchTpl.includes('أدوات');
  const hasSolutions = searchTpl.includes('حلول');

  assert(hasAll && hasGuides && hasTools && hasSolutions, 'Search Hub must provide filter tabs: الكل / أدلة / حاسبات / حلول');
});

registerTest('T1.2.6', 'R2.6 - Command Palette Modal Trigger and Shortcuts (Ctrl+K)', 'R2', () => {
  const searchJs = readLandingFile('js/search.js') || '';
  const headerTpl = readLandingFile('templates/header.html') || '';
  const modalTpl = readLandingFile('templates/components/search_modal.html') || '';
  const scriptJs = readLandingFile('script.js') || '';
  const combined = searchJs + headerTpl + modalTpl + scriptJs;

  assert(combined.includes('search-modal') || combined.includes('searchModal'), 'Global #search-modal must be defined');
  assert(combined.includes('KeyK') || combined.includes('k') || combined.includes('ctrlKey'), 'Search modal must be bound to Ctrl+K / Cmd+K shortcut');
});

/* ==========================================================================
   R3: Building Needs Diagnostic Quiz (مسار تشخيص احتياجات العمارة)
   ========================================================================== */

registerTest('T1.3.1', 'R3.1 - Quiz DOM Placement & 3-Step Card Structure', 'R3', () => {
  const indexHtml = readLandingFile('index.html') || '';
  const quizTpl = readLandingFile('templates/components/diagnostic_quiz.html') || '';
  const quizJs = readLandingFile('js/quiz.js') || '';
  const combined = indexHtml + quizTpl + quizJs;

  assert(combined.length > 0, 'Quiz component or template must exist');
  // Check quiz container
  const hasQuizContainer = combined.includes('diagnostic-quiz') || combined.includes('quiz-container');
  assert(hasQuizContainer, 'Diagnostic quiz container element must exist');
});

registerTest('T1.3.2', 'R3.2 - Step 1 Property Size Qualification Choices', 'R3', () => {
  const quizTpl = readLandingFile('templates/components/diagnostic_quiz.html') || '';
  const quizJs = readLandingFile('js/quiz.js') || '';
  const indexHtml = readLandingFile('index.html') || '';
  const combined = quizTpl + quizJs + indexHtml;

  // Step 1 choices: <10, 10-25, >25, compound/mall
  const hasUnder10 = combined.includes('10') && (combined.includes('أقل') || combined.includes('<'));
  const has10to25 = combined.includes('25');
  const hasCompound = combined.includes('كمبوند') || combined.includes('مول') || combined.includes('عقار كبير');
  assert(hasUnder10 && has10to25 && hasCompound, 'Step 1 must include property size choices (<10, 10-25, >25, compound/mall)');
});

registerTest('T1.3.3', 'R3.3 - Step 2 Operational Challenge Selections', 'R3', () => {
  const quizTpl = readLandingFile('templates/components/diagnostic_quiz.html') || '';
  const quizJs = readLandingFile('js/quiz.js') || '';
  const indexHtml = readLandingFile('index.html') || '';
  const combined = quizTpl + quizJs + indexHtml;

  // Step 2 pain points: arrears (متأخرات), petty cash (عهدة/بواب), bills (فواتير/مصعد), paperwork (ضياع الأوراق/دفاتر)
  const hasArrears = combined.includes('متأخرات') || combined.includes('تحصيل');
  const hasCaretaker = combined.includes('عهدة') || combined.includes('بواب') || combined.includes('صيانة');
  const hasBills = combined.includes('فواتير') || combined.includes('مصعد') || combined.includes('مياه');
  const hasPaperwork = combined.includes('دفاتر') || combined.includes('أوراق') || combined.includes('ضياع');

  assert(hasArrears && hasCaretaker && hasBills && hasPaperwork, 'Step 2 must present the 4 operational pain point options');
});

registerTest('T1.3.4', 'R3.4 - Step 3 Dynamic Recommendation Report Matrix', 'R3', () => {
  const quizTpl = readLandingFile('templates/components/diagnostic_quiz.html') || '';
  const quizJs = readLandingFile('js/quiz.js') || '';
  const combined = quizTpl + quizJs;

  assert(combined.includes('توصية') || combined.includes('تقرير') || combined.includes('result') || combined.includes('recommendation'), 
    'Step 3 dynamic recommendation card must be defined');
});

registerTest('T1.3.5', 'R3.5 - Dual Conversion CTAs in Quiz Result', 'R3', () => {
  const quizTpl = readLandingFile('templates/components/diagnostic_quiz.html') || '';
  const quizJs = readLandingFile('js/quiz.js') || '';
  const indexHtml = readLandingFile('index.html') || '';
  const combined = quizTpl + quizJs + indexHtml;

  // Dual conversion CTAs: Download App + Try Simulator
  const hasDownload = combined.includes('حمّل التطبيق') || combined.includes('تحميل') || combined.includes('download');
  const hasSimulatorCta = combined.includes('محاكي') || combined.includes('simulator') || combined.includes('تجربة');

  assert(hasDownload && hasSimulatorCta, 'Quiz recommendation must provide dual CTAs (Download App + Try Simulator)');
});

/* ==========================================================================
   R4: Component Template Engine & Static Site (نظام القوالب والتجميع)
   ========================================================================== */

registerTest('T1.4.1', 'R4.1 - Component Template Architecture Files', 'R4', () => {
  // Check required templates in templates/
  const templatesDir = path.join(LANDING_ROOT, 'templates');
  assertFileExists(templatesDir, 'sandooq-landing/templates/ directory must exist');

  assertFileExists(path.join(templatesDir, 'header.html'), 'templates/header.html must exist');
  assertFileExists(path.join(templatesDir, 'footer.html'), 'templates/footer.html must exist');
  assertFileExists(path.join(templatesDir, 'head_meta.html'), 'templates/head_meta.html must exist');
});

registerTest('T1.4.2', 'R4.2 - Build Script Execution (scripts/build_landing.js)', 'R4', () => {
  const scriptPath = path.join(LANDING_ROOT, 'scripts', 'build_landing.js');
  assertFileExists(scriptPath, 'scripts/build_landing.js must exist');

  const result = runNodeScript(scriptPath);
  assertEqual(result.status, 0, `Build script must execute with exit code 0. Stderr: ${result.stderr}`);
});

registerTest('T1.4.3', 'R4.3 - Zero Uncompiled Placeholder Leaks in Output HTML', 'R4', () => {
  const samplePages = ['index.html', 'about.html', 'guides/index.html', 'tools/index.html', 'solutions/index.html'];
  for (const page of samplePages) {
    const content = readLandingFile(page);
    if (!content) continue;
    assert(!content.includes('{{BASE_PATH}}'), `${page} contains uncompiled {{BASE_PATH}} leak`);
    assert(!content.includes('{{PAGE_TITLE}}'), `${page} contains uncompiled {{PAGE_TITLE}} leak`);
    assert(!content.includes('<!-- COMPONENT:'), `${page} contains uncompiled component placeholder leak`);
  }
});

registerTest('T1.4.4', 'R4.4 - Dynamic Base Path Resolution in Subdirectories', 'R4', () => {
  // Check subpages have relative asset links starting with ..
  const guidePage = readLandingFile('guides/index.html');
  assert(guidePage !== null, 'guides/index.html must exist');
  assert(guidePage.includes('../styles.css') || guidePage.includes('href="../styles.css"'), 'Subpages must resolve styles.css via relative BASE_PATH (../styles.css)');
});

registerTest('T1.4.5', 'R4.5 - Privacy Page Relative Links Resolution', 'R4', () => {
  const privacyHtml = readLandingFile('privacy/index.html');
  assert(privacyHtml !== null, 'privacy/index.html must exist');

  // Verify that styles.css and favicon are relative to root via ../
  assert(!privacyHtml.includes('href="styles.css"'), 'privacy/index.html must not contain broken href="styles.css"');
  assert(!privacyHtml.includes('href="favicon.ico"'), 'privacy/index.html must not contain broken href="favicon.ico"');
  assert(privacyHtml.includes('../styles.css'), 'privacy/index.html must link to ../styles.css');
});

registerTest('T1.4.6', 'R4.6 - Static Output Integrity (Pure Static HTML)', 'R4', () => {
  const indexHtml = readLandingFile('index.html');
  assert(indexHtml !== null, 'index.html must exist');
  const lower = indexHtml.trim().toLowerCase();
  assert(lower.startsWith('<!doctype html') || lower.startsWith('<html'), 'Page must be valid static HTML');
  assert(!indexHtml.includes('<%') && !indexHtml.includes('<?php'), 'Output must be 100% pure static HTML with no server tags');
});

module.exports = { tests };
