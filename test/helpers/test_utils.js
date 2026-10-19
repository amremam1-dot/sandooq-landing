/**
 * test_utils.js - Lightweight test assertion and DOM/HTML analysis primitives
 * Pure Node.js - Zero external runtime dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LANDING_ROOT = path.resolve(__dirname, '..', '..');

// Assertion primitives
function assert(condition, message) {
  if (!condition) {
    const err = new Error(message || 'Assertion failed');
    err.name = 'AssertionError';
    throw err;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const err = new Error(`${message || 'assertEqual failed'}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    err.name = 'AssertionError';
    err.expected = expected;
    err.actual = actual;
    throw err;
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const err = new Error(`${message || 'assertDeepEqual failed'}: Expected ${expectedStr}, got ${actualStr}`);
    err.name = 'AssertionError';
    err.expected = expected;
    err.actual = actual;
    throw err;
  }
}

function assertMatch(text, regex, message) {
  if (!regex.test(text)) {
    const err = new Error(`${message || 'assertMatch failed'}: Pattern ${regex} not found in text`);
    err.name = 'AssertionError';
    throw err;
  }
}

function assertFileExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    const err = new Error(`${message || 'File not found'}: ${filePath}`);
    err.name = 'AssertionError';
    throw err;
  }
}

function assertLessThan(actual, limit, message) {
  if (actual >= limit) {
    const err = new Error(`${message || 'assertLessThan failed'}: Expected ${actual} < ${limit}`);
    err.name = 'AssertionError';
    throw err;
  }
}

function assertIncludes(haystack, needle, message) {
  if (!haystack || !haystack.includes(needle)) {
    const err = new Error(`${message || 'assertIncludes failed'}: Did not find ${JSON.stringify(needle)} in target`);
    err.name = 'AssertionError';
    throw err;
  }
}

// File and path helpers
function readLandingFile(relativePath) {
  const fullPath = path.join(LANDING_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function landingFileExists(relativePath) {
  return fs.existsSync(path.join(LANDING_ROOT, relativePath));
}

function getLandingFileSize(relativePath) {
  const fullPath = path.join(LANDING_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return -1;
  return fs.statSync(fullPath).size;
}

// Lightweight HTML DOM inspection helpers (Pure Node regex/string based)
function findElementById(html, id) {
  const regex = new RegExp(`<([a-zA-Z0-9-]+)[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
  const match = html.match(regex);
  if (!match) {
    // Check self-closing or empty tag
    const selfMatch = html.match(new RegExp(`<([a-zA-Z0-9-]+)[^>]*id=["']${id}["'][^>]*\\/?>`, 'i'));
    if (selfMatch) {
      return { tag: selfMatch[1], outerHTML: selfMatch[0], innerHTML: '', id };
    }
    return null;
  }
  return { tag: match[1], outerHTML: match[0], innerHTML: match[2], id };
}

function findElementsByClass(html, className) {
  const results = [];
  const regex = new RegExp(`<([a-zA-Z0-9-]+)[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'gi');
  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push({ tag: match[1], outerHTML: match[0] });
  }
  return results;
}

function hasElementWithAttribute(html, attr, val) {
  if (val === undefined) {
    const regex = new RegExp(`\\b${attr}(?:=["'][^"']*["'])?`, 'i');
    return regex.test(html);
  }
  const regex = new RegExp(`\\b${attr}=["']${val}["']`, 'i');
  return regex.test(html);
}

function extractAllLinks(html) {
  const links = [];
  const regex = /<(?:a|link)[^>]+href=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function extractAllAssetSources(html) {
  const sources = [];
  const regex = /<(?:img|script|source)[^>]+(?:src|srcset)=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    sources.push(match[1]);
  }
  return sources;
}

// Reference Arabic Normalization algorithm for expected-output derivation
function normalizeArabicText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel/diacritics
    .replace(/\u0640/g, '')                // Remove tatweel/kashida
    .replace(/[إأآٱ]/g, 'ا')               // Normalize alif variants
    .replace(/ة/g, 'ه')                    // Normalize taa marbuta
    .replace(/[ىيئ]/g, 'ي')                // Normalize yaa and yeh variants
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()) // Arabic to Western numerals
    .toLowerCase()
    .trim();
}

// Script runner helper
function runNodeScript(scriptPath, args = [], cwd = LANDING_ROOT) {
  try {
    const fullPath = path.isAbsolute(scriptPath) ? scriptPath : path.join(LANDING_ROOT, scriptPath);
    if (!fs.existsSync(fullPath)) {
      return { status: 127, stdout: '', stderr: `Script not found: ${fullPath}` };
    }
    const stdout = execSync(`node "${fullPath}" ${args.join(' ')}`, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
      timeout: 15000
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      status: err.status || 1,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : err.message
    };
  }
}

module.exports = {
  LANDING_ROOT,
  assert,
  assertEqual,
  assertDeepEqual,
  assertMatch,
  assertFileExists,
  assertLessThan,
  assertIncludes,
  readLandingFile,
  landingFileExists,
  getLandingFileSize,
  findElementById,
  findElementsByClass,
  hasElementWithAttribute,
  extractAllLinks,
  extractAllAssetSources,
  normalizeArabicText,
  runNodeScript
};
