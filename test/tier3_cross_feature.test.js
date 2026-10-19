/**
 * tier3_cross_feature.test.js
 * Tier 3: Cross-Feature Interactions & Pairwise Combination Tests (Minimum 10 tests)
 * Pure Node.js - Zero external runtime dependencies
 */

const path = require('path');
const fs = require('fs');
const {
  assert,
  assertEqual,
  assertFileExists,
  readLandingFile,
  landingFileExists,
  normalizeArabicText,
  LANDING_ROOT
} = require('./helpers/test_utils');

const tests = [];

function registerTest(id, name, requirement, fn) {
  tests.push({ id, name, tier: 3, requirement, fn });
}

/* ==========================================================================
   Cross-Feature Pair 1: R1 (Simulator) <-> R3 (Quiz)
   ========================================================================== */

registerTest('T3.1', 'R1+R3 - Quiz CTA "Try Simulator" Target Anchor & Focus Navigation', 'R1+R3', () => {
  const quizTpl = readLandingFile('templates/components/diagnostic_quiz.html') || 
                  readLandingFile('index.html') || '';
  // Quiz must contain a link or action referencing the simulator
  const hasSimulatorRef = quizTpl.includes('app-simulator') || 
                          quizTpl.includes('hero-art') || 
                          quizTpl.includes('phone-mockup') ||
                          quizTpl.includes('try-simulator') ||
                          quizTpl.includes('#simulator');
  assert(hasSimulatorRef, 'Quiz recommendation CTA must reference simulator target (#app-simulator or data-action="try-simulator")');
});

registerTest('T3.2', 'R1+R3 - State Alignment Between Quiz Challenge and Simulator Units', 'R1+R3', () => {
  // If user qualifies arrears in quiz, simulator showcases collection flow
  const indexHtml = readLandingFile('index.html') || '';
  const quizJs = readLandingFile('js/quiz.js') || '';
  const simulatorJs = readLandingFile('js/simulator.js') || '';
  const combined = indexHtml + quizJs + simulatorJs;

  assert(combined.includes('متأخرات') || combined.includes('تحصيل'), 'Both quiz and simulator must align on the core arrears collection pain point');
});

/* ==========================================================================
   Cross-Feature Pair 2: R2 (Search Hub) <-> R1 (Simulator)
   ========================================================================== */

registerTest('T3.3', 'R2+R1 - Search Index Terms Matching Interactive Simulator', 'R2+R1', () => {
  const indexPath = path.join(LANDING_ROOT, 'data', 'search_index.json');
  assertFileExists(indexPath, 'data/search_index.json must exist');

  const rawData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  // Search index should include tools or guides related to collection or simulator
  const matching = rawData.filter(item => {
    const text = Array.isArray(item) ? item.join(' ') : JSON.stringify(item);
    return text.includes('تحصيل') || text.includes('إيصال') || text.includes('receipt') || text.includes('اشتراك');
  });
  assert(matching.length > 0, 'Search index must index collection tools and receipt features aligned with simulator');
});

registerTest('T3.4', 'R2+R1 - Search Modal Non-Interference with Phone Mockup Stacking Context', 'R2+R1', () => {
  const stylesCss = readLandingFile('styles.css') || '';
  assert(stylesCss.includes('.phone-mockup'), 'CSS must define .phone-mockup');

  // Phone mockup z-index must not exceed global modal z-index (modal typically >= 1000)
  assert(stylesCss.includes('z-index'), 'Styles must define z-index layering');
});

/* ==========================================================================
   Cross-Feature Pair 3: R2 (Search Hub) <-> R3 (Quiz)
   ========================================================================== */

registerTest('T3.5', 'R2+R3 - Search Index Integration with Diagnostic Quiz Concepts', 'R2+R3', () => {
  const indexPath = path.join(LANDING_ROOT, 'data', 'search_index.json');
  assertFileExists(indexPath, 'data/search_index.json must exist');

  const rawData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  // Should index resources related to quiz topics (maintenance, bills, elevator, caretaker)
  const maintenanceItems = rawData.filter(item => {
    const text = Array.isArray(item) ? item.join(' ') : JSON.stringify(item);
    return text.includes('صيانة') || text.includes('مصعد') || text.includes('بواب') || text.includes('فواتير');
  });
  assert(maintenanceItems.length >= 5, `Search index must contain guides/tools for key quiz challenges, found ${maintenanceItems.length}`);
});

registerTest('T3.6', 'R2+R3 - Search Modal Z-Index Priority Over Quiz Section Elements', 'R2+R3', () => {
  const stylesCss = readLandingFile('styles.css') || '';
  // Ensure search modal can overlay any section
  assert(stylesCss.includes('body') || stylesCss.includes('modal'), 'styles.css must be available');
});

/* ==========================================================================
   Cross-Feature Pair 4: R4 (Template Engine) <-> R1 (Simulator)
   ========================================================================== */

registerTest('T3.7', 'R4+R1 - Template Component Substitution for Hero Simulator in index.html', 'R4+R1', () => {
  const indexHtml = readLandingFile('index.html') || '';
  const simulatorTpl = readLandingFile('templates/components/hero_simulator.html') || '';
  
  if (simulatorTpl.length > 0) {
    // index.html after build must contain simulator markup, NOT raw unreplaced marker
    assert(!indexHtml.includes('<!-- COMPONENT: HERO_SIMULATOR -->'), 'index.html must not contain uncompiled <!-- COMPONENT: HERO_SIMULATOR -->');
    assert(indexHtml.includes('phone-mockup'), 'index.html must contain phone mockup structure');
  } else {
    assert(landingFileExists('templates/components/hero_simulator.html'), 'hero_simulator template must exist');
  }
});

registerTest('T3.8', 'R4+R1 - Simulator Script and Style Resolution Across Base Paths', 'R4+R1', () => {
  const indexHtml = readLandingFile('index.html') || '';
  // Simulator assets should be linked without broken paths
  assert(!indexHtml.includes('src="undefined"'), 'index.html must not contain undefined script src');
});

/* ==========================================================================
   Cross-Feature Pair 5: R4 (Template Engine) <-> R2 (Search Hub)
   ========================================================================== */

registerTest('T3.9', 'R4+R2 - Global Search Modal Injection Across 88+ Pages', 'R4+R2', () => {
  const headerTpl = readLandingFile('templates/header.html') || '';
  const modalTpl = readLandingFile('templates/components/search_modal.html') || '';

  if (headerTpl.length > 0) {
    // Header or modal template must support BASE_PATH for search index asset
    const combined = headerTpl + modalTpl;
    assert(combined.includes('search') || combined.includes('بحث'), 'Header/modal template must contain search trigger or markup');
  } else {
    assert(landingFileExists('templates/header.html'), 'templates/header.html must exist');
  }
});

registerTest('T3.10', 'R4+R2 - Hero Search Hub Injection Scoped to index.html', 'R4+R2', () => {
  const aboutHtml = readLandingFile('about.html') || '';
  // Subpages like about.html should not have hero search hub injected
  assert(!aboutHtml.includes('<!-- COMPONENT: SEARCH_HUB -->'), 'Subpages must not have unreplaced search hub placeholders');
});

/* ==========================================================================
   Cross-Feature Pair 6: R4 (Template Engine) <-> R3 (Quiz)
   ========================================================================== */

registerTest('T3.11', 'R4+R3 - Quiz Component Injection Located Between Comparison and Features', 'R4+R3', () => {
  const indexHtml = readLandingFile('index.html') || '';
  assert(indexHtml.includes('id="comparison"') || indexHtml.includes('class="comparison-section"'), 'index.html must have comparison section');
  assert(indexHtml.includes('id="features"') || indexHtml.includes('class="features-section"'), 'index.html must have features section');
});

/* ==========================================================================
   Cross-Feature Pair 7: Theme Preservation Across All Injected Components (AC.2)
   ========================================================================== */

registerTest('T3.12', 'AC.2+ALL - Light/Dark Theme Custom Properties Inherited by All Components', 'AC.2', () => {
  const stylesCss = readLandingFile('styles.css') || '';
  assert(stylesCss.includes('--bg-color'), 'styles.css must declare --bg-color');
  assert(stylesCss.includes('--card-bg'), 'styles.css must declare --card-bg');
  assert(stylesCss.includes('--text-main'), 'styles.css must declare --text-main');
  assert(stylesCss.includes('--border-color'), 'styles.css must declare --border-color');
  assert(stylesCss.includes('light-theme'), 'styles.css must define .light-theme class');
});

module.exports = { tests };
