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
    FOOTER: ['footer.html'],
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

  const activeNav = {
    ACTIVE_HOME: '',
    ACTIVE_TOOLS: '',
    ACTIVE_GUIDES: '',
    ACTIVE_SOLUTIONS: '',
    ACTIVE_BILLING: '',
    ACTIVE_ABOUT: '',
    ACTIVE_CONTACT: '',
    ACTIVE_DOWNLOAD: ''
  };

  const rel = fileInfo.relPath;
  if (rel === 'index.html') {
    activeNav.ACTIVE_HOME = 'active';
  } else if (rel.startsWith('tools/')) {
    activeNav.ACTIVE_TOOLS = 'active';
  } else if (rel.startsWith('guides/')) {
    activeNav.ACTIVE_GUIDES = 'active';
  } else if (rel.startsWith('solutions/')) {
    activeNav.ACTIVE_SOLUTIONS = 'active';
  } else if (rel === 'billing.html' || rel === 'billing-easy.html') {
    activeNav.ACTIVE_BILLING = 'active';
  } else if (rel === 'about.html') {
    activeNav.ACTIVE_ABOUT = 'active';
  } else if (rel === 'contact.html') {
    activeNav.ACTIVE_CONTACT = 'active';
  } else if (rel === 'download.html') {
    activeNav.ACTIVE_DOWNLOAD = 'active';
  }

  return {
    BASE_PATH: basePath,
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
function expandComponents(htmlContent, context, loadedComponents) {
  let result = htmlContent;

  for (const [compName, rawCompTemplate] of Object.entries(loadedComponents)) {
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

  // Step A: Expand Components in Templates (e.g. SEARCH_MODAL inside header)
  let headerTpl = templates.HEADER;
  if (headerTpl) {
    headerTpl = expandComponents(headerTpl, context, components);
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
  if (templates.FOOTER) {
    const compiledFooter = interpolate(templates.FOOTER, context).trim();
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

    if (scriptsBoundaryRegex.test(compiled)) {
      const replacement = `<!-- TEMPLATE: SCRIPTS -->\n${compiledScripts}\n<!-- /TEMPLATE: SCRIPTS -->`;
      compiled = compiled.replace(scriptsBoundaryRegex, replacement);
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

  // Step F: Expand Body Components (HERO_SIMULATOR, SEARCH_HUB, DIAGNOSTIC_QUIZ)
  compiled = expandComponents(compiled, context, components);

  // Step G: Ensure relative links are cleanly resolved in subdirectories (privacy, guides, tools, etc.)
  if (context.BASE_PATH === '..') {
    compiled = compiled.replace(/href="styles\.css"/g, 'href="../styles.css"');
    compiled = compiled.replace(/href="favicon\.ico"/g, 'href="../favicon.ico"');
    compiled = compiled.replace(/href="assets\//g, 'href="../assets/');
    compiled = compiled.replace(/src="assets\//g, 'src="../assets/');
    compiled = compiled.replace(/srcset="assets\//g, 'srcset="../assets/');
    compiled = compiled.replace(/href="delete-account\.html"/g, 'href="../delete-account.html"');
    compiled = compiled.replace(/src="script\.js"/g, 'src="../script.js"');
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
  const markers = ['HEADER', 'FOOTER', 'SCRIPTS', 'HEAD_META'];
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
