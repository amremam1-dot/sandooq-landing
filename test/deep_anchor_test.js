const fs = require('fs');
const path = require('path');

const LANDING_ROOT = path.resolve(__dirname, '..');

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

const htmlFiles = getHtmlFiles(LANDING_ROOT);
const anchorMap = new Map(); // targetFile -> Set(anchors)

for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(LANDING_ROOT, file).replace(/\\/g, '/');
  const matches = [...content.matchAll(/<a\b[^>]*\bhref=["']([^"']*)["']/gi)];

  for (const m of matches) {
    const href = m[1].trim();
    if (!href.includes('#')) continue;
    const [pathPart, anchor] = href.split('#');
    if (!anchor || anchor === 'top') continue;

    let targetDisk;
    if (!pathPart) {
      targetDisk = file;
    } else if (pathPart.startsWith('/')) {
      targetDisk = path.join(LANDING_ROOT, pathPart.slice(1));
    } else {
      targetDisk = path.join(path.dirname(file), pathPart);
    }

    if (fs.existsSync(targetDisk) && fs.statSync(targetDisk).isDirectory()) {
      targetDisk = path.join(targetDisk, 'index.html');
    } else if (!fs.existsSync(targetDisk) && fs.existsSync(targetDisk + '.html')) {
      targetDisk = targetDisk + '.html';
    }

    const relTarget = path.relative(LANDING_ROOT, targetDisk).replace(/\\/g, '/');
    if (!anchorMap.has(relTarget)) anchorMap.set(relTarget, new Set());
    anchorMap.get(relTarget).add({ anchor, source: relFile, href });
  }
}

console.log(`Found ${anchorMap.size} target files with anchor references:`);

let brokenCount = 0;
for (const [targetFile, anchorSet] of anchorMap.entries()) {
  const targetAbs = path.join(LANDING_ROOT, targetFile);
  if (!fs.existsSync(targetAbs)) {
    console.error(`Target file does not exist: ${targetFile}`);
    brokenCount += anchorSet.size;
    continue;
  }
  const content = fs.readFileSync(targetAbs, 'utf8');
  const ids = new Set([...content.matchAll(/\bid=["']([^"']+)["']/gi)].map(m => m[1]));
  const names = new Set([...content.matchAll(/\bname=["']([^"']+)["']/gi)].map(m => m[1]));

  console.log(`\nChecking target file: ${targetFile} (referenced by ${anchorSet.size} unique anchors)`);
  for (const item of anchorSet) {
    const exists = ids.has(item.anchor) || names.has(item.anchor);
    if (!exists) {
      console.error(`  [BROKEN] Anchor #${item.anchor} not found in ${targetFile}! Source: ${item.source} (href="${item.href}")`);
      brokenCount++;
    } else {
      console.log(`  [OK] #${item.anchor} found in ${targetFile}`);
    }
  }
}

console.log(`\n================================`);
console.log(`Total Broken Anchors: ${brokenCount}`);
console.log(`================================`);
process.exit(brokenCount > 0 ? 1 : 0);
