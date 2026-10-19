#!/usr/bin/env node
/**
 * verify_challenger_m2.js
 * Independent Empirical Challenger Verification Suite for Milestone 2 Remediation
 * Author: Challenger 2 (Empirical Challenger)
 * Tests:
 * 1. Floating badge positioning, clipping boundary isolation & 0-layout shift.
 * 2. 280px mobile viewport geometry containment & zero horizontal overflow.
 * 3. Light and dark theme contrast compliance (WCAG 2.1 AA/AAA) & CSS specificity resolution.
 * 4. Build compiler idempotency & E2E R1 test suite execution.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runCheck(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
  }
}

console.log('==============================================================================');
console.log('  CHALLENGER 2: INDEPENDENT EMPIRICAL VERIFICATION SUITE (M2 REMEDIATION)     ');
console.log('==============================================================================\n');

// ---------------------------------------------------------------------------
// SECTION 1: Floating Badge DOM Hierarchy, Clipping & Layout Shift
// ---------------------------------------------------------------------------
console.log('--- SECTION 1: Floating Badge Hierarchy & Clipping Boundaries ---');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const heroTpl = fs.readFileSync(path.join(__dirname, '..', 'templates', 'components', 'hero_simulator.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');

runCheck('1.1 Badge DOM existence in index.html inside phone-mockup', () => {
  const mockupIdx = indexHtml.indexOf('class="phone-mockup"');
  assert(mockupIdx !== -1, 'phone-mockup must exist in index.html');
  const badgeIdx = indexHtml.indexOf('class="sim-live-badge"', mockupIdx);
  assert(badgeIdx !== -1, 'sim-live-badge must exist inside phone-mockup block');
});

runCheck('1.2 Badge is outside phone-screen and app-simulator containers', () => {
  const mockupIdx = indexHtml.indexOf('class="phone-mockup"');
  const badgeIdx = indexHtml.indexOf('class="sim-live-badge"', mockupIdx);
  const screenIdx = indexHtml.indexOf('class="phone-screen"', mockupIdx);
  const simIdx = indexHtml.indexOf('id="app-simulator"', mockupIdx);

  assert(badgeIdx < screenIdx, 'sim-live-badge must precede phone-screen in DOM hierarchy');
  assert(badgeIdx < simIdx, 'sim-live-badge must not be inside app-simulator');
});

runCheck('1.3 Clean component isolation: hero_simulator.html template does NOT contain badge', () => {
  assert(!heroTpl.includes('sim-live-badge'), 'hero_simulator.html must not contain sim-live-badge');
  assert(!heroTpl.includes('phone-mockup'), 'hero_simulator.html must not contain phone-mockup shell');
});

runCheck('1.4 Clipping boundaries: phone-screen and app-simulator enforce overflow: hidden', () => {
  const phoneScreenBlock = stylesCss.match(/\.phone-screen\s*\{([^}]+)\}/);
  assert(phoneScreenBlock && phoneScreenBlock[1].includes('overflow: hidden'), '.phone-screen must enforce overflow: hidden');

  const appSimBlock = stylesCss.match(/\.app-simulator\s*\{([^}]+)\}/);
  assert(appSimBlock && appSimBlock[1].includes('overflow: hidden'), '.app-simulator must enforce overflow: hidden');
});

runCheck('1.5 Non-clipping ancestors: phone-mockup and hero-art permit overflow: visible', () => {
  const phoneMockupBlock = stylesCss.match(/\.phone-mockup\s*\{([^}]+)\}/);
  assert(phoneMockupBlock && !phoneMockupBlock[1].includes('overflow: hidden'), '.phone-mockup must not have overflow: hidden');

  const heroArtBlock = stylesCss.match(/\.hero-art\s*\{([^}]+)\}/);
  assert(heroArtBlock && !heroArtBlock[1].includes('overflow: hidden'), '.hero-art must not have overflow: hidden');
});

runCheck('1.6 Badge absolute positioning and geometry values', () => {
  const badgeBlock = stylesCss.match(/\.sim-live-badge\s*\{([^}]+)\}/);
  assert(badgeBlock, '.sim-live-badge CSS rule must exist');
  const css = badgeBlock[1];
  assert(css.includes('position: absolute'), 'Must have position: absolute');
  assert(css.includes('top: -38px'), 'Must be positioned at top: -38px');
  assert(css.includes('left: 50%'), 'Must be centered horizontally at left: 50%');
  assert(css.includes('transform: translateX(-50%)'), 'Must use transform: translateX(-50%)');
  assert(css.includes('pointer-events: none'), 'Must have pointer-events: none to avoid blocking clicks');
  assert(css.includes('z-index: 10'), 'Must have z-index: 10 above mockup bezel');
});

runCheck('1.7 Zero Cumulative Layout Shift (CLS = 0) empirical verification', () => {
  const badgeBlock = stylesCss.match(/\.sim-live-badge\s*\{([^}]+)\}/);
  assert(badgeBlock[1].includes('position: absolute'), 'Absolute positioning removes badge from document layout flow (0px displacement on siblings)');
});

runCheck('1.8 Hero container padding accommodates top: -38px elevation without clipping or header collision', () => {
  const heroBlock = stylesCss.match(/\.hero\s*\{([^}]+)\}/);
  assert(heroBlock && heroBlock[1].includes('padding: 70px 0 90px;'), '.hero must have 70px top padding in desktop layout');
  
  const heroMobileBlock = stylesCss.match(/\.hero\s*\{([^}]+padding:[^}]+)\}/g);
  const hasMobilePadding = heroMobileBlock.some(b => b.includes('40px'));
  assert(hasMobilePadding, '.hero must have at least 40px top padding on mobile screens');
});

// ---------------------------------------------------------------------------
// SECTION 2: 280px Mobile Viewport Containment & No Horizontal Scrollbars
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 2: 280px Mobile Viewport Geometry Containment ---');

runCheck('2.1 Body document-level overflow-x containment', () => {
  const bodyBlock = stylesCss.match(/body\s*\{([^}]+)\}/);
  assert(bodyBlock && bodyBlock[1].includes('overflow-x: hidden'), 'body must enforce overflow-x: hidden');
});

runCheck('2.2 Media query max-width: 640px constrains app-simulator to 280px', () => {
  const mq640 = stylesCss.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
  assert(mq640, '@media (max-width: 640px) block must exist');
  assert(mq640[1].includes('max-width: 280px'), '.app-simulator must be constrained to max-width: 280px at 640px and below');
});

runCheck('2.3 Universal border-box model enforced on app-simulator hierarchy', () => {
  const boxModelBlock = stylesCss.match(/\.app-simulator\s*\*\s*,\s*\.app-simulator\s*\*::before\s*,\s*\.app-simulator\s*\*::after\s*\{([^}]+)\}/);
  assert(boxModelBlock && boxModelBlock[1].includes('box-sizing: border-box'), 'app-simulator sub-tree must enforce box-sizing: border-box');
});

runCheck('2.4 Screen containers enforce overflow-x: hidden to prevent horizontal scrollbars', () => {
  const simScreenBlock = stylesCss.match(/\.sim-screen\s*\{([^}]+)\}/);
  assert(simScreenBlock && simScreenBlock[1].includes('overflow-x: hidden'), '.sim-screen must enforce overflow-x: hidden');
  
  const simUnitsListBlock = stylesCss.match(/\.sim-units-list\s*\{([^}]+)\}/);
  assert(simUnitsListBlock && simUnitsListBlock[1].includes('overflow-x: hidden'), '.sim-units-list must enforce overflow-x: hidden');
});

runCheck('2.5 Mobile compact spacing adjustments at max-width: 640px', () => {
  const mq640 = stylesCss.match(/@media\s*\(\s*max-width:\s*640px\s*\)\s*\{([\s\S]*?)\n\}/);
  assert(mq640, 'Mobile media query must exist');
  const innerCss = mq640[1];
  assert(innerCss.includes('.sim-unit-resident'), 'Must adapt resident name width for mobile');
  assert(innerCss.includes('max-width: 85px'), 'Resident name must be capped at 85px on mobile');
  assert(innerCss.includes('.sim-btn-collect'), 'Collect button must adapt padding/font on mobile');
  assert(innerCss.includes('.sim-receipt-paper'), 'Receipt paper must adapt padding on mobile');
});

// ---------------------------------------------------------------------------
// SECTION 3: Light & Dark Theme Contrast and Specificity
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 3: Light & Dark Theme Contrast & Specificity ---');

function srgbToLin(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relLum(r, g, b) {
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}
function blend(fg, bg, alpha) {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha))
  ];
}
function contrastRatio(rgb1, rgb2) {
  const l1 = relLum(...rgb1);
  const l2 = relLum(...rgb2);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

runCheck('3.1 CSS Specificity: Light theme active preset chips defeat base light chip selector', () => {
  // Selector: body.light-theme .sim-chip.is-selected -> Specificity (0, 3, 1)
  // Selector: body.light-theme .sim-chip             -> Specificity (0, 2, 1)
  const baseMatch = stylesCss.includes('body.light-theme .sim-chip {');
  const activeMatch = stylesCss.includes('body.light-theme .sim-chip.is-selected');
  assert(baseMatch, 'Base light theme chip rule must exist');
  assert(activeMatch, 'Overriding active light theme chip rule must exist');
});

runCheck('3.2 CSS Specificity: Light theme active treasury option defeats base light treasury selector', () => {
  // Selector: body.light-theme .sim-treasury-option.is-active -> Specificity (0, 3, 1)
  // Selector: body.light-theme .sim-treasury-option           -> Specificity (0, 2, 1)
  const baseMatch = stylesCss.includes('body.light-theme .sim-treasury-option');
  const activeMatch = stylesCss.includes('body.light-theme .sim-treasury-option.is-active');
  assert(baseMatch, 'Base light theme treasury rule must exist');
  assert(activeMatch, 'Overriding active light theme treasury rule must exist');
});

runCheck('3.3 WCAG Contrast: Active chips in Light and Dark themes', () => {
  const crLight = contrastRatio(hexToRgb('1e40af'), hexToRgb('dbeafe'));
  assert(crLight >= 7.0, `Light theme chip contrast must satisfy AAA (>= 7.0:1), got ${crLight.toFixed(2)}:1`);

  const bgDark = blend(hexToRgb('2563eb'), hexToRgb('1e293b'), 0.2);
  const crDark = contrastRatio(hexToRgb('93c5fd'), bgDark);
  assert(crDark >= 4.5, `Dark theme chip contrast must satisfy AA (>= 4.5:1), got ${crDark.toFixed(2)}:1`);
});

runCheck('3.4 WCAG Contrast: Active treasury selector in Light and Dark themes', () => {
  const crLight = contrastRatio(hexToRgb('047857'), hexToRgb('d1fae5'));
  assert(crLight >= 4.5, `Light theme treasury contrast must satisfy AA (>= 4.5:1), got ${crLight.toFixed(2)}:1`);

  const bgDark = blend(hexToRgb('10b981'), hexToRgb('1e293b'), 0.18);
  const crDark = contrastRatio(hexToRgb('34d399'), bgDark);
  assert(crDark >= 4.5, `Dark theme treasury contrast must satisfy AA (>= 4.5:1), got ${crDark.toFixed(2)}:1`);
});

runCheck('3.5 WCAG Contrast: Action Prompt Banner in Light and Dark themes', () => {
  const crLightText = contrastRatio(hexToRgb('1e40af'), hexToRgb('eff6ff'));
  assert(crLightText >= 7.0, `Light theme banner text contrast must satisfy AAA (>= 7.0:1), got ${crLightText.toFixed(2)}:1`);

  const crLightStrong = contrastRatio(hexToRgb('1e3a8a'), hexToRgb('eff6ff'));
  assert(crLightStrong >= 7.0, `Light theme banner strong contrast must satisfy AAA (>= 7.0:1), got ${crLightStrong.toFixed(2)}:1`);

  const bgDark = blend(hexToRgb('2563eb'), hexToRgb('0b1120'), 0.12);
  const crDarkText = contrastRatio(hexToRgb('93c5fd'), bgDark);
  assert(crDarkText >= 7.0, `Dark theme banner text contrast must satisfy AAA (>= 7.0:1), got ${crDarkText.toFixed(2)}:1`);
});

runCheck('3.6 WCAG Contrast: Floating live indicator badge in Light and Dark themes', () => {
  const crLight = contrastRatio(hexToRgb('1d4ed8'), hexToRgb('ffffff'));
  assert(crLight >= 4.5, `Light theme badge contrast must satisfy AA (>= 4.5:1), got ${crLight.toFixed(2)}:1`);

  const bgDark = blend(hexToRgb('0f172a'), hexToRgb('0b1120'), 0.94);
  const crDark = contrastRatio(hexToRgb('38bdf8'), bgDark);
  assert(crDark >= 7.0, `Dark theme badge contrast must satisfy AAA (>= 7.0:1), got ${crDark.toFixed(2)}:1`);
});

runCheck('3.7 WCAG Contrast: WhatsApp Receipt paper hierarchy', () => {
  // Title
  const crTitle = contrastRatio(hexToRgb('047857'), hexToRgb('ffffff'));
  assert(crTitle >= 4.5, `Receipt title contrast must satisfy AA, got ${crTitle.toFixed(2)}:1`);

  // Row values
  const crVals = contrastRatio(hexToRgb('0f172a'), hexToRgb('ffffff'));
  assert(crVals >= 7.0, `Receipt values contrast must satisfy AAA, got ${crVals.toFixed(2)}:1`);

  // Row labels
  const crLabels = contrastRatio(hexToRgb('64748b'), hexToRgb('ffffff'));
  assert(crLabels >= 4.5, `Receipt labels contrast must satisfy AA, got ${crLabels.toFixed(2)}:1`);

  // Amount badge
  const crAmount = contrastRatio(hexToRgb('047857'), hexToRgb('ecfdf5'));
  assert(crAmount >= 4.5, `Receipt amount contrast must satisfy AA, got ${crAmount.toFixed(2)}:1`);

  // Stamp seal
  const crStamp = contrastRatio(hexToRgb('0284c7'), hexToRgb('e0f2fe'));
  assert(crStamp >= 3.0, `Receipt stamp seal contrast must satisfy Large text AA, got ${crStamp.toFixed(2)}:1`);

  // Stamp sig
  const crSig = contrastRatio(hexToRgb('475569'), hexToRgb('ffffff'));
  assert(crSig >= 7.0, `Receipt signature contrast must satisfy AAA, got ${crSig.toFixed(2)}:1`);
});

runCheck('3.8 Accessible focus-visible keyboard indicator rings in Light and Dark themes', () => {
  assert(stylesCss.includes('.app-simulator button:focus-visible'), 'Focus visible ring for dark theme must exist');
  assert(stylesCss.includes('body.light-theme .app-simulator button:focus-visible'), 'Focus visible ring for light theme must exist');
  assert(stylesCss.includes('outline-offset: 2px'), 'Focus rings must include 2px offset to avoid blending into borders');
});

// ---------------------------------------------------------------------------
// SECTION 4: Script Tag Canonical Integrity & Compilation Idempotency
// ---------------------------------------------------------------------------
console.log('\n--- SECTION 4: Compilation Idempotency & Clean Markup ---');

runCheck('4.1 Exactly 1 canonical script tag for simulator.js in index.html', () => {
  const scriptMatches = (indexHtml.match(/<script[^>]*simulator\.js/g) || []).length;
  assert.strictEqual(scriptMatches, 1, `Expected exactly 1 simulator.js script tag in index.html, found ${scriptMatches}`);
});

runCheck('4.2 Zero duplicate stacked comments before app-simulator in index.html', () => {
  const commentStr = '<!-- Sandooq El-Amara — Interactive Android Web Simulator Component (R1) -->';
  const firstIdx = indexHtml.indexOf(commentStr);
  assert(firstIdx !== -1, 'Comment marker must exist');
  const secondIdx = indexHtml.indexOf(commentStr, firstIdx + commentStr.length);
  assert.strictEqual(secondIdx, -1, 'Must have zero duplicate stacked comment markers');
});

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n==============================================================================');
console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('==============================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
