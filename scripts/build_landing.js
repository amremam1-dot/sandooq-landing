#!/usr/bin/env node

/**
 * ============================================================================
 * Sandooq El-Amara — Production Static Landing Page Compiler
 * Target: sandooq-landing (Compiles templates/ into 88+ static HTML pages)
 * Engine: 100% Native Node.js (Built-in 'fs' and 'path' ONLY - Zero Dependencies)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// 1. Path Configuration
const LANDING_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(LANDING_DIR, 'templates');
const COMPONENTS_DIR = path.join(TEMPLATES_DIR, 'components');

// 2. Exclusion Rules
const IGNORED_DIRS = new Set([
  'templates',
  'scripts',
  'assets',
  'manuals',
  'data',
  'node_modules',
  '.git',
  '.well-known',
  'test'
]);

const IGNORED_FILES = new Set([
  'gied8r2cfkneni4luy6b0lh5uu7ux8.html' // Google site verification token (1-line raw string)
]);

// 3. CLI Arguments
const args = process.argv.slice(2);
const IS_CHECK_MODE = args.includes('--check');
const IS_DRY_RUN = args.includes('--dry-run') || IS_CHECK_MODE;
const IS_VERBOSE = args.includes('--verbose');

// 4. ANSI Colors for Terminal Output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

// 5. Template Loader
function loadTemplates() {
  const templates = {};
  if (!fs.existsSync(TEMPLATES_DIR)) {
    throw new Error(`Templates directory not found: ${TEMPLATES_DIR}`);
  }

  // Mandatory / Primary Templates
  const templateFiles = {
    HEADER: ['header.html'],
    HEADER_EN: ['header_en.html', 'header.html'],
    FOOTER: ['footer.html'],
    FOOTER_EN: ['footer_en.html', 'footer.html'],
    HEAD_META: ['head_meta.html', 'head-common.html'],
    SCRIPTS: ['scripts.html', 'scripts-common.html']
  };

  for (const [key, candidates] of Object.entries(templateFiles)) {
    let found = false;
    for (const candidate of candidates) {
      const p = path.join(TEMPLATES_DIR, candidate);
      if (fs.existsSync(p)) {
        templates[key] = fs.readFileSync(p, 'utf8');
        found = true;
        break;
      }
    }
    if (!found) {
      // Allow optional templates
      templates[key] = null;
    }
  }

  // Load Components from templates/components/
  const components = {};
  if (fs.existsSync(COMPONENTS_DIR)) {
    const compFiles = fs.readdirSync(COMPONENTS_DIR);
    for (const file of compFiles) {
      if (file.endsWith('.html')) {
        const compName = path.basename(file, '.html').toUpperCase();
        components[compName] = fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf8');
      }
    }
  }

  return { templates, components };
}

// 6. Recursive HTML File Discovery
function discoverHtmlFiles(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relToLanding = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      results = results.concat(discoverHtmlFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (IGNORED_FILES.has(entry.name)) {
        continue;
      }
      results.push({
        fullPath,
        relPath: relToLanding,
        dirRel: path.dirname(relToLanding).replace(/\\/g, '/'),
        filename: entry.name
      });
    }
  }
  return results;
}

// 7. Context & BASE_PATH Resolution
function computeContext(fileInfo) {
  const dir = fileInfo.dirRel;
  let basePath;
  if (dir === '.' || dir === '') {
    basePath = '.';
  } else {
    const depth = dir.split('/').filter(Boolean).length;
    basePath = Array(depth).fill('..').join('/');
  }

  const rel = fileInfo.relPath;
  const isEnglish = rel.startsWith('en/') || rel === 'en';
  const cleanRelNoLang = isEnglish ? rel.replace(/^en\/?/, '') : rel;

  // Language Root & Section URLs
  const langRoot = isEnglish ? `${basePath}/en` : basePath;
  const urlHome = isEnglish ? `${basePath}/en/` : `${basePath}/`;
  const urlTools = isEnglish ? `${basePath}/en/tools/` : `${basePath}/tools/`;
  const urlGuides = isEnglish ? `${basePath}/en/guides/` : `${basePath}/guides/`;
  const urlSolutions = isEnglish ? `${basePath}/en/solutions/` : `${basePath}/solutions/`;
  const urlBilling = `${langRoot}/billing.html`;
  const urlAbout = `${langRoot}/about.html`;
  const urlContact = `${langRoot}/contact.html`;
  const urlDownload = `${langRoot}/download.html`;
  const urlSecurity = `${langRoot}/security.html`;
  const urlPrivacy = `${langRoot}/privacy.html`;
  const urlTerms = `${langRoot}/terms.html`;
  const urlUpdates = `${langRoot}/updates.html`;
  const urlThanks = `${langRoot}/thanks.html`;
  const urlTreasurer = `${langRoot}/for-building-treasurer.html`;
  const urlOwner = `${langRoot}/for-property-owner.html`;
  const urlDeleteAccount = `${langRoot}/delete-account.html`;
  const urlManualPage = `${langRoot}/manual.html`;
  const urlBookPage = `${langRoot}/book.html`;
  const urlBookPdf = `${basePath}/manuals/Dostor_ElAmara_Luxury_Edition.pdf`;
  const urlManual = isEnglish ? `${basePath}/manuals/Sandooq_ElAmara_User_Manual_EN.pdf` : `${basePath}/manuals/Sandooq_ElAmara_User_Manual_AR.pdf`;
  const urlManualAr = `${basePath}/manuals/Sandooq_ElAmara_User_Manual_AR.pdf`;
  const urlManualEn = `${basePath}/manuals/Sandooq_ElAmara_User_Manual_EN.pdf`;

  let langSwitchHref;
  let hreflangAr;
  let hreflangEn;
  const hreflangDefault = 'https://sandoqalemara.com/';

  if (isEnglish) {
    const cleanAr = (cleanRelNoLang === '' || cleanRelNoLang === 'index.html') ? '' : cleanRelNoLang;
    const arFileOnDisk = path.join(LANDING_DIR, cleanAr || 'index.html');
    if (fs.existsSync(arFileOnDisk)) {
      langSwitchHref = cleanAr ? `${basePath}/${cleanAr}` : `${basePath}/`;
      hreflangAr = cleanAr ? `https://sandoqalemara.com/${cleanAr}` : 'https://sandoqalemara.com/';
    } else {
      langSwitchHref = `${basePath}/`;
      hreflangAr = 'https://sandoqalemara.com/';
    }
    hreflangEn = `https://sandoqalemara.com/${rel.replace(/\/index\.html$/, '/').replace(/^index\.html$/, '')}`;
  } else {
    const cleanRel = (rel === 'index.html' || rel === '') ? '' : rel;
    const enFileOnDisk = path.join(LANDING_DIR, 'en', cleanRel || 'index.html');
    if (fs.existsSync(enFileOnDisk)) {
      langSwitchHref = cleanRel ? `${basePath}/en/${cleanRel}` : `${basePath}/en/`;
      hreflangEn = cleanRel ? `https://sandoqalemara.com/en/${cleanRel}` : 'https://sandoqalemara.com/en/';
    } else {
      // Smart Section Fallback to prevent 404
      if (cleanRel.startsWith('tools/')) {
        langSwitchHref = `${basePath}/en/tools/`;
        hreflangEn = 'https://sandoqalemara.com/en/tools/';
      } else if (cleanRel.startsWith('guides/')) {
        langSwitchHref = `${basePath}/en/guides/`;
        hreflangEn = 'https://sandoqalemara.com/en/guides/';
      } else if (cleanRel.startsWith('solutions/')) {
        langSwitchHref = `${basePath}/en/solutions/`;
        hreflangEn = 'https://sandoqalemara.com/en/solutions/';
      } else {
        langSwitchHref = `${basePath}/en/`;
        hreflangEn = 'https://sandoqalemara.com/en/';
      }
    }
    hreflangAr = cleanRel ? `https://sandoqalemara.com/${cleanRel}` : 'https://sandoqalemara.com/';
  }

  const activeNav = {
    ACTIVE_HOME: '',
    ACTIVE_TOOLS: '',
    ACTIVE_GUIDES: '',
    ACTIVE_SOLUTIONS: '',
    ACTIVE_BILLING: '',
    ACTIVE_ABOUT: '',
    ACTIVE_CONTACT: '',
    ACTIVE_DOWNLOAD: '',
    ACTIVE_BOOK: ''
  };

  if (cleanRelNoLang === 'index.html' || cleanRelNoLang === '') {
    activeNav.ACTIVE_HOME = 'active';
  } else if (cleanRelNoLang.startsWith('tools/')) {
    activeNav.ACTIVE_TOOLS = 'active';
  } else if (cleanRelNoLang.startsWith('guides/')) {
    activeNav.ACTIVE_GUIDES = 'active';
  } else if (cleanRelNoLang.startsWith('solutions/')) {
    activeNav.ACTIVE_SOLUTIONS = 'active';
  } else if (cleanRelNoLang === 'billing.html' || cleanRelNoLang === 'billing-easy.html') {
    activeNav.ACTIVE_BILLING = 'active';
  } else if (cleanRelNoLang === 'about.html') {
    activeNav.ACTIVE_ABOUT = 'active';
  } else if (cleanRelNoLang === 'contact.html') {
    activeNav.ACTIVE_CONTACT = 'active';
  } else if (cleanRelNoLang === 'download.html') {
    activeNav.ACTIVE_DOWNLOAD = 'active';
  } else if (cleanRelNoLang === 'book.html' || cleanRelNoLang === 'dostor-elamara.html') {
    activeNav.ACTIVE_BOOK = 'active';
  }

  return {
    BASE_PATH: basePath,
    LANG_ROOT: langRoot,
    URL_HOME: urlHome,
    URL_TOOLS: urlTools,
    URL_GUIDES: urlGuides,
    URL_SOLUTIONS: urlSolutions,
    URL_BILLING: urlBilling,
    URL_ABOUT: urlAbout,
    URL_CONTACT: urlContact,
    URL_DOWNLOAD: urlDownload,
    URL_SECURITY: urlSecurity,
    URL_PRIVACY: urlPrivacy,
    URL_TERMS: urlTerms,
    URL_UPDATES: urlUpdates,
    URL_THANKS: urlThanks,
    URL_TREASURER: urlTreasurer,
    URL_OWNER: urlOwner,
    URL_DELETE_ACCOUNT: urlDeleteAccount,
    URL_MANUAL_PAGE: urlManualPage,
    URL_BOOK_PAGE: urlBookPage,
    URL_BOOK: urlBookPage,
    URL_BOOK_PDF: urlBookPdf,
    URL_MANUAL: urlManual,
    URL_MANUAL_AR: urlManualAr,
    URL_MANUAL_EN: urlManualEn,
    LANG_SWITCH_HREF: langSwitchHref,
    HREFLANG_AR: hreflangAr,
    HREFLANG_EN: hreflangEn,
    HREFLANG_DEFAULT: hreflangDefault,
    APP_NAME: isEnglish ? 'Sandooq El-Amara' : 'صندوق العمارة',
    ...activeNav
  };
}

// 8. Template String Interpolation
function interpolate(templateStr, context) {
  if (!templateStr) return '';
  let result = templateStr;
  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value !== undefined && value !== null ? value : '');
  }
  return result;
}

// 9. Component Expansion Engine
function expandComponents(htmlContent, context, loadedComponents, isEnglish = false) {
  let result = htmlContent;

  const effectiveComponents = {};
  for (const [name, tpl] of Object.entries(loadedComponents)) {
    if (name.endsWith('_EN')) {
      if (isEnglish) {
        const baseName = name.replace(/_EN$/, '');
        effectiveComponents[baseName] = tpl;
      }
    } else {
      if (!effectiveComponents[name]) {
        effectiveComponents[name] = tpl;
      }
    }
  }

  for (const [compName, rawCompTemplate] of Object.entries(effectiveComponents)) {
    if (!rawCompTemplate) continue;

    const compiledComp = interpolate(rawCompTemplate, context).trim();

    // Pattern 1: Boundary wrapped
    const boundaryRegex = new RegExp(
      `<!--\\s*COMPONENT:\\s*${compName}\\s*-->[\\s\\S]*?<!--\\s*\\/COMPONENT:\\s*${compName}\\s*-->`,
      'gi'
    );

    // Pattern 2: Single marker
    const singleRegex = new RegExp(
      `<!--\\s*COMPONENT:\\s*${compName}\\s*-->`,
      'gi'
    );

    if (boundaryRegex.test(result)) {
      result = result.replace(boundaryRegex, compiledComp);
    } else if (singleRegex.test(result)) {
      result = result.replace(singleRegex, compiledComp);
    } else if (compName === 'HERO_SIMULATOR') {
      const existingSimulatorRegex = /(?:\s*<!--[^\n]*Interactive Android Web Simulator[^\n]*-->)*\s*<div\s+id=["']app-simulator["'][\s\S]*?<\/div>(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)/i;
      if (existingSimulatorRegex.test(result)) {
        result = result.replace(existingSimulatorRegex, `\n            <!-- Sandooq El-Amara — Interactive Android Web Simulator Component (R1) -->\n${compiledComp}`);
      }
    }
  }

  return result;
}

// 10. Single Page Compilation Engine
function compilePage(rawContent, fileInfo, templates, components) {
  // Respect explicit ignore tag or special standalone layout files
  if (rawContent.includes('<!-- SANDOOG_IGNORE_BUILD -->')) {
    return rawContent;
  }
  if (fileInfo.filename === 'billing-easy.html') {
    // Preserve custom layout for seniors
    return rawContent;
  }

  const context = computeContext(fileInfo);
  let compiled = rawContent;

  const isEnglish = fileInfo.relPath.startsWith('en/') || fileInfo.relPath === 'en';
  if (isEnglish) {
    compiled = compiled.replace(/<html(?:\s+[^>]*)?>/i, '<html lang="en" dir="ltr">');
  } else {
    compiled = compiled.replace(/<html(?:\s+[^>]*)?>/i, '<html lang="ar" dir="rtl">');
  }

  // Step A: Expand Components in Templates (e.g. SEARCH_MODAL inside header)
  let headerTpl = isEnglish ? (templates.HEADER_EN || templates.HEADER) : templates.HEADER;
  if (headerTpl) {
    headerTpl = expandComponents(headerTpl, context, components, isEnglish);
  }

  // Step B: Inject HEADER
  if (headerTpl) {
    const compiledHeader = interpolate(headerTpl, context).trim();
    const headerBoundaryRegex = /<!--\s*TEMPLATE:\s*HEADER\s*-->[\s\S]*?<!--\s*\/TEMPLATE:\s*HEADER\s*-->/i;
    const rawHeaderRegex = /<header\s+class=["'][^"']*site-header[^"']*["'][\s\S]*?<\/header>/i;

    const replacement = `<!-- TEMPLATE: HEADER -->\n${compiledHeader}\n<!-- /TEMPLATE: HEADER -->`;

    if (headerBoundaryRegex.test(compiled)) {
      compiled = compiled.replace(headerBoundaryRegex, replacement);
    } else if (rawHeaderRegex.test(compiled)) {
      compiled = compiled.replace(rawHeaderRegex, replacement);
    }
  }

  // Step C: Inject FOOTER
  const footerRawTpl = isEnglish ? (templates.FOOTER_EN || templates.FOOTER) : templates.FOOTER;
  if (footerRawTpl) {
    const compiledFooter = interpolate(footerRawTpl, context).trim();
    const footerBoundaryRegex = /<!--\s*TEMPLATE:\s*FOOTER\s*-->[\s\S]*?<!--\s*\/TEMPLATE:\s*FOOTER\s*-->/i;
    const rawFooterRegex = /<footer\s+class=["'][^"']*site-footer[^"']*["'][\s\S]*?(?:<\/footer>|(?=<!-- Declarative WebMCP Tools)|(?=<form id="webmcp)|(?=<script\b))/i;

    const replacement = `<!-- TEMPLATE: FOOTER -->\n${compiledFooter}\n<!-- /TEMPLATE: FOOTER -->`;

    if (footerBoundaryRegex.test(compiled)) {
      compiled = compiled.replace(footerBoundaryRegex, replacement);
    } else if (rawFooterRegex.test(compiled)) {
      compiled = compiled.replace(rawFooterRegex, replacement);
    }
  }

  // Step D: Inject SCRIPTS (if marker exists)
  if (templates.SCRIPTS) {
    const compiledScripts = interpolate(templates.SCRIPTS, context).trim();
    const scriptsBoundaryRegex = /<!--\s*TEMPLATE:\s*SCRIPTS\s*-->[\s\S]*?<!--\s*\/TEMPLATE:\s*SCRIPTS\s*-->/i;
    const rawScriptsRegex = /<script\s+src=["'][^"']*script\.js["'][^>]*><\/script>(?:\s*<script\s+src=["'][^"']*js\/(?:simulator|search|quiz)\.js["'][^>]*><\/script>)*/i;

    const replacement = `<!-- TEMPLATE: SCRIPTS -->\n${compiledScripts}\n<!-- /TEMPLATE: SCRIPTS -->`;

    if (scriptsBoundaryRegex.test(compiled)) {
      compiled = compiled.replace(scriptsBoundaryRegex, replacement);
    } else if (rawScriptsRegex.test(compiled)) {
      compiled = compiled.replace(rawScriptsRegex, replacement);
    }
  }

  // Step E: Inject HEAD_META (if marker exists)
  if (templates.HEAD_META) {
    const compiledHeadMeta = interpolate(templates.HEAD_META, context).trim();
    const headMetaBoundaryRegex = /<!--\s*TEMPLATE:\s*HEAD_META\s*-->[\s\S]*?<!--\s*\/TEMPLATE:\s*HEAD_META\s*-->/i;

    if (headMetaBoundaryRegex.test(compiled)) {
      const replacement = `<!-- TEMPLATE: HEAD_META -->\n${compiledHeadMeta}\n<!-- /TEMPLATE: HEAD_META -->`;
      compiled = compiled.replace(headMetaBoundaryRegex, replacement);
    }
  }

  // Step E2: Ensure Reciprocal Hreflang & OpenGraph Meta Tags
  if (!fileInfo.filename.includes('404')) {
    const hreflangBlock = `  <!-- Alternate Languages (hreflang) -->\n  <link rel="alternate" hreflang="ar" href="${context.HREFLANG_AR}" />\n  <link rel="alternate" hreflang="en" href="${context.HREFLANG_EN}" />\n  <link rel="alternate" hreflang="x-default" href="${context.HREFLANG_DEFAULT}" />`;

    // Strip legacy/duplicate hreflang tags if any
    compiled = compiled.replace(/\s*<!--\s*Alternate Languages \(hreflang\)\s*-->[\s\S]*?<link\s+rel=["']alternate["']\s+hreflang=["']x-default["'][^>]*>/gi, '');
    compiled = compiled.replace(/\s*<link\s+rel=["']alternate["']\s+hreflang=["'][^"']*["'][^>]*>/gi, '');

    // Insert after canonical link or before </head>
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(compiled)) {
      compiled = compiled.replace(/(<link\s+rel=["']canonical["'][^>]*>)/i, `$1\n\n${hreflangBlock}`);
    } else if (/<\/head>/i.test(compiled)) {
      compiled = compiled.replace(/<\/head>/i, `${hreflangBlock}\n</head>`);
    }
  }

  // Ensure OpenGraph image dimensions for rich preview cards (WhatsApp / Facebook)
  if (/<meta\s+property=["']og:image["'][^>]*>/i.test(compiled) && !/og:image:width/i.test(compiled)) {
    compiled = compiled.replace(
      /(<meta\s+property=["']og:image["'][^>]*>)/i,
      `$1\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="630" />`
    );
  }

  // Step E3: Ensure Google AdSense Ownership Verification Script in <head>
  const adSenseScriptTag = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4640495425873996" crossorigin="anonymous"></script>';
  if (!compiled.includes('ca-pub-4640495425873996')) {
    if (/<head(?:\s+[^>]*)?>/i.test(compiled)) {
      compiled = compiled.replace(/(<head(?:\s+[^>]*)?>)/i, `$1\n  <!-- Google AdSense Verification & Loader -->\n  ${adSenseScriptTag}`);
    }
  }

  // Step F: Expand Body Components (HERO_SIMULATOR, SEARCH_HUB, DIAGNOSTIC_QUIZ)
  compiled = expandComponents(compiled, context, components, isEnglish);

  // Step G: Ensure relative links are cleanly resolved in subdirectories (privacy, guides, tools, etc.)
  if (context.BASE_PATH && context.BASE_PATH !== '.') {
    const bp = context.BASE_PATH;
    compiled = compiled.replace(/href="styles\.css"/g, `href="${bp}/styles.css"`);
    compiled = compiled.replace(/href="favicon\.ico"/g, `href="${bp}/favicon.ico"`);
    compiled = compiled.replace(/href="assets\//g, `href="${bp}/assets/`);
    compiled = compiled.replace(/src="assets\//g, `src="${bp}/assets/`);
    compiled = compiled.replace(/srcset="assets\//g, `srcset="${bp}/assets/`);
    compiled = compiled.replace(/href="delete-account\.html"/g, `href="${context.URL_DELETE_ACCOUNT}"`);
    compiled = compiled.replace(/src="script\.js"/g, `src="${bp}/script.js"`);
  }

  // Step H: Utility Content Pages Ad Rails & Mobile Banner Layout (Non-Intrusive Monetization)
  const cleanRelNoLang = isEnglish ? fileInfo.relPath.replace(/^en\/?/, '') : fileInfo.relPath;
  const isIndividualTool = cleanRelNoLang.startsWith('tools/') && cleanRelNoLang !== 'tools/' && cleanRelNoLang !== 'tools/index.html';
  const isIndividualGuide = cleanRelNoLang.startsWith('guides/') && cleanRelNoLang !== 'guides/' && cleanRelNoLang !== 'guides/index.html';
  const isIndividualSolution = cleanRelNoLang.startsWith('solutions/') && cleanRelNoLang !== 'solutions/' && cleanRelNoLang !== 'solutions/index.html';
  const isManual = cleanRelNoLang === 'manual.html';
  const isTargetAdPage = isIndividualTool || isIndividualGuide || isIndividualSolution || isManual;

  // 1. Unwrap existing AD_LAYOUT boundary if previously compiled to guarantee clean idempotency
  const existingAdLayoutRegex = /<!--\s*TEMPLATE:\s*AD_LAYOUT\s*-->[\s\S]*?(<main\b[\s\S]*?<\/main>)[\s\S]*?<!--\s*\/TEMPLATE:\s*AD_LAYOUT\s*-->/i;
  if (existingAdLayoutRegex.test(compiled)) {
    compiled = compiled.replace(existingAdLayoutRegex, '$1');
  }
  compiled = compiled.replace(/\s*<!--\s*TEMPLATE:\s*AD_MOBILE_BOTTOM\s*-->[\s\S]*?<!--\s*\/TEMPLATE:\s*AD_MOBILE_BOTTOM\s*-->/gi, '');

  // 2. Wrap if target ad page
  if (isTargetAdPage) {
    const rawRailRight = isEnglish ? (components.AD_RAIL_RIGHT_EN || components.AD_RAIL_RIGHT) : components.AD_RAIL_RIGHT;
    const rawRailLeft = isEnglish ? (components.AD_RAIL_LEFT_EN || components.AD_RAIL_LEFT) : components.AD_RAIL_LEFT;
    const rawMobileBottom = isEnglish ? (components.AD_MOBILE_BOTTOM_EN || components.AD_MOBILE_BOTTOM) : components.AD_MOBILE_BOTTOM;

    if (rawRailRight && rawRailLeft && rawMobileBottom) {
      const compiledRailRight = interpolate(rawRailRight, context).trim();
      const compiledRailLeft = interpolate(rawRailLeft, context).trim();
      const compiledMobileBottom = interpolate(rawMobileBottom, context).trim();

      const mainRegex = /(<main\b[\s\S]*?)(<\/main>)/i;
      const match = compiled.match(mainRegex);
      if (match) {
        let mainBody = match[1].trimEnd();
        const mobileAdBlock = `\n\n  <!-- TEMPLATE: AD_MOBILE_BOTTOM -->\n${compiledMobileBottom}\n  <!-- /TEMPLATE: AD_MOBILE_BOTTOM -->\n`;

        // Place mobile ad in high-visibility position: directly after calculator card or before first section in guides
        if (isIndividualTool && /(<\/div>\s*(?:<!--[^\n]*-->\s*)*)(?=<div\s+class=["'](?:calc-guide-content|quick-guide-card|printable-area|help-section))/i.test(mainBody)) {
          mainBody = mainBody.replace(/(<\/div>\s*(?:<!--[^\n]*-->\s*)*)(?=<div\s+class=["'](?:calc-guide-content|quick-guide-card|printable-area|help-section))/i, `$1${mobileAdBlock}\n`);
        } else if ((isIndividualGuide || isIndividualSolution || isManual) && /(?=<h2\b)/i.test(mainBody)) {
          mainBody = mainBody.replace(/(?=<h2\b)/i, `${mobileAdBlock}\n`);
        } else {
          mainBody = `${mainBody}${mobileAdBlock}`;
        }

        const mainWithMobileAd = `${mainBody}\n${match[2]}`;
        const wrapped = `<!-- TEMPLATE: AD_LAYOUT -->\n<div class="page-with-ads-layout">\n  <!-- TEMPLATE: AD_RAIL_RIGHT -->\n${compiledRailRight}\n  <!-- /TEMPLATE: AD_RAIL_RIGHT -->\n\n${mainWithMobileAd}\n\n  <!-- TEMPLATE: AD_RAIL_LEFT -->\n${compiledRailLeft}\n  <!-- /TEMPLATE: AD_RAIL_LEFT -->\n</div>\n<!-- /TEMPLATE: AD_LAYOUT -->`;
        compiled = compiled.replace(mainRegex, wrapped);
      }
    }
  }

  return compiled;
}

// 11. Post-Compilation Validation Assertions
function validateCompiledOutput(compiledHtml, relPath) {
  // 1. Assert no unexpanded placeholders
  const placeholderMatches = compiledHtml.match(/{{\s*[\w_]+\s*}}/g);
  if (placeholderMatches) {
    throw new Error(`Unexpanded placeholder(s) in ${relPath}: ${placeholderMatches.join(', ')}`);
  }

  // 2. Assert no uncompiled component placeholder leaks
  const componentMatches = compiledHtml.match(/<!--\s*COMPONENT:\s*[\w_]+\s*-->/g);
  if (componentMatches) {
    throw new Error(`Uncompiled component placeholder leak in ${relPath}: ${componentMatches.join(', ')}`);
  }

  // 3. Assert balanced boundary markers
  const markers = ['HEADER', 'FOOTER', 'SCRIPTS', 'HEAD_META', 'AD_LAYOUT', 'AD_RAIL_RIGHT', 'AD_RAIL_LEFT', 'AD_MOBILE_BOTTOM'];
  for (const m of markers) {
    const openCount = (compiledHtml.match(new RegExp(`<!--\\s*TEMPLATE:\\s*${m}\\s*-->`, 'gi')) || []).length;
    const closeCount = (compiledHtml.match(new RegExp(`<!--\\s*\/TEMPLATE:\\s*${m}\\s*-->`, 'gi')) || []).length;
    if (openCount !== closeCount) {
      throw new Error(`Mismatched boundary markers for TEMPLATE:${m} in ${relPath} (open: ${openCount}, close: ${closeCount})`);
    }
  }

  // 4. Assert HTML basic structure
  if (!/<!doctype\s+html>/i.test(compiledHtml) || !/<\/html>/i.test(compiledHtml)) {
    throw new Error(`Corrupted HTML document structure in ${relPath}`);
  }
}

// 12. Main Execution Routine
function main() {
  const startTime = Date.now();
  console.log(`${colors.bold}${colors.cyan}=== Sandooq El-Amara Landing Compiler ===${colors.reset}`);
  console.log(`${colors.dim}Target directory: ${LANDING_DIR}${colors.reset}\n`);

  let templates, components;
  try {
    const loaded = loadTemplates();
    templates = loaded.templates;
    components = loaded.components;
  } catch (err) {
    console.error(`${colors.red}[FATAL] Could not load templates: ${err.message}${colors.reset}`);
    process.exit(1);
  }

  const loadedTplCount = Object.values(templates).filter(Boolean).length;
  const loadedCompCount = Object.keys(components).length;
  console.log(`Loaded ${colors.green}${loadedTplCount}${colors.reset} templates and ${colors.green}${loadedCompCount}${colors.reset} components.`);

  const files = discoverHtmlFiles(LANDING_DIR);
  console.log(`Discovered ${colors.bold}${files.length}${colors.reset} HTML pages for compilation.\n`);

  let modifiedCount = 0;
  let unchangedCount = 0;
  const errors = [];

  for (const file of files) {
    try {
      const rawContent = fs.readFileSync(file.fullPath, 'utf8');
      const compiled = compilePage(rawContent, file, templates, components);

      validateCompiledOutput(compiled, file.relPath);

      if (compiled !== rawContent) {
        modifiedCount++;
        if (IS_VERBOSE) {
          console.log(`  ${colors.yellow}MODIFIED${colors.reset} ${file.relPath}`);
        }
        if (!IS_DRY_RUN) {
          fs.writeFileSync(file.fullPath, compiled, 'utf8');
        }
      } else {
        unchangedCount++;
        if (IS_VERBOSE) {
          console.log(`  ${colors.dim}UNCHANGED${colors.reset} ${file.relPath}`);
        }
      }
    } catch (err) {
      errors.push({ file: file.relPath, error: err.message });
      console.error(`  ${colors.red}ERROR${colors.reset} ${file.relPath}: ${err.message}`);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`\n${colors.bold}=== Compilation Summary ===${colors.reset}`);
  console.log(`Total Pages:   ${files.length}`);
  console.log(`Modified:      ${colors.yellow}${modifiedCount}${colors.reset}`);
  console.log(`Unchanged:     ${colors.green}${unchangedCount}${colors.reset}`);
  console.log(`Errors:        ${errors.length > 0 ? colors.red + errors.length + colors.reset : colors.green + '0' + colors.reset}`);
  console.log(`Duration:      ${colors.cyan}${duration}ms${colors.reset}`);

  if (IS_CHECK_MODE && modifiedCount > 0) {
    console.error(`\n${colors.red}[CHECK FAILED] ${modifiedCount} file(s) require re-compilation.${colors.reset}`);
    process.exit(1);
  }

  if (errors.length > 0) {
    console.error(`\n${colors.red}[BUILD FAILED] ${errors.length} error(s) occurred during compilation.${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.bold}${colors.green}✓ Compilation finished successfully!${colors.reset}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  discoverHtmlFiles,
  computeContext,
  interpolate,
  expandComponents,
  compilePage,
  validateCompiledOutput
};
