const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'tools');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');

let modifiedCount = 0;

const ctaBannerHtml = `
      <!-- App Download CTA Banner -->
      <div class="tool-app-cta-banner no-print">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="../assets/sandooq-logo.png" alt="صندوق العمارة" width="42" height="42" style="border-radius: 10px; flex-shrink: 0;" />
          <div>
            <strong style="color: var(--text-main); font-size: 1.02rem; display: block;">عاوز تدير حسابات العمارة ومصروفاتها بدون وجع دماغ؟</strong>
            <span style="color: var(--text-muted); font-size: 0.88rem;">تطبيق صندوق العمارة يسجل اشتراكات الشقق، يرسل إيصالات واتساب تلقائياً، ويعمل بدون إنترنت.</span>
          </div>
        </div>
        <a href="../download.html" class="button primary" style="padding: 9px 20px; font-size: 0.9rem; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
          تحميل التطبيق مجاناً 📥
        </a>
      </div>`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add Download button into btn-action-wrap if not present
  if (content.includes('btn-action-wrap') && !content.includes('btn-download-action') && !content.includes('../download.html" class="btn-action')) {
    content = content.replace(/(<div\s+class=["']btn-action-wrap["']>[\s\S]*?)(<\/div>)/i, (match, p1, p2) => {
      return `${p1}  <a href="../download.html" class="btn-action btn-download-action" title="تحميل تطبيق صندوق العمارة مجاناً">تحميل التطبيق مجاناً 📲</a>\n          ${p2}`;
    });
    changed = true;
  }

  // 2. In the 4 legacy tools, check for their specific button wrappers
  if (!content.includes('btn-download-action') && !content.includes('tool-app-cta-banner')) {
    if (content.includes('id="btnShareCalcWhatsApp"') && !content.includes('تحميل تطبيق صندوق العمارة')) {
      content = content.replace(/(<div\s+style=["'][^"']*grid-template-columns:\s*1fr\s+1fr[^"']*["']>[\s\S]*?)(<\/div>)/i, (match, p1, p2) => {
        return `${p1.replace('grid-template-columns: 1fr 1fr', 'grid-template-columns: 1fr 1fr 1fr')}  <a href="../download.html" class="btn-download-action" style="display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; text-decoration: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.88rem; font-family: inherit;">📲 تحميل التطبيق</a>\n            ${p2}`;
      });
      changed = true;
    }
  }

  // 3. Add App Download CTA Banner before calc-guide-content or at the end of calc-card if not already present
  if (!content.includes('tool-app-cta-banner') && !content.includes('tool-app-cta-banner')) {
    if (content.includes('<div class="calc-guide-content">')) {
      content = content.replace('<div class="calc-guide-content">', `${ctaBannerHtml}\n\n    <div class="calc-guide-content">`);
      changed = true;
    } else if (content.includes('</main>')) {
      content = content.replace('</main>', `  ${ctaBannerHtml}\n  </main>`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedCount++;
  }
});

// 4. Update tools hub index.html
const hubPath = path.join(dir, 'index.html');
if (fs.existsSync(hubPath)) {
  let hubContent = fs.readFileSync(hubPath, 'utf8');
  if (!hubContent.includes('tool-app-cta-banner')) {
    hubContent = hubContent.replace(/<\/p>\s*<\/div>\s*<div class=["']search-filter-wrap["']/i, (match) => {
      return `</p>\n\n${ctaBannerHtml}\n    </div>\n\n    <div class="search-filter-wrap"`;
    });
    fs.writeFileSync(hubPath, hubContent, 'utf8');
    console.log('✅ Added banner to tools/index.html');
  }
}

// 5. Update EN tools hub
const enHubPath = path.join(__dirname, '..', 'en', 'tools', 'index.html');
if (fs.existsSync(enHubPath)) {
  let enHubContent = fs.readFileSync(enHubPath, 'utf8');
  if (!enHubContent.includes('tool-app-cta-banner')) {
    const enBannerHtml = `
      <!-- App Download CTA Banner -->
      <div class="tool-app-cta-banner no-print">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="../../assets/sandooq-logo.png" alt="Sandooq El-Amara" width="42" height="42" style="border-radius: 10px; flex-shrink: 0;" />
          <div>
            <strong style="color: var(--text-main); font-size: 1.02rem; display: block;">Want to automate your property collections and expenses?</strong>
            <span style="color: var(--text-muted); font-size: 0.88rem;">Sandooq El-Amara handles dues, generates instant WhatsApp receipts, and works 100% offline.</span>
          </div>
        </div>
        <a href="../../en/download.html" class="button primary" style="padding: 9px 20px; font-size: 0.9rem; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
          Download Free App 📥
        </a>
      </div>`;
    enHubContent = enHubContent.replace(/<\/p>\s*<\/div>\s*<div class=["']search-filter-wrap["']/i, (match) => {
      return `</p>\n\n${enBannerHtml}\n    </div>\n\n    <div class="search-filter-wrap"`;
    });
    fs.writeFileSync(enHubPath, enHubContent, 'utf8');
    console.log('✅ Added banner to en/tools/index.html');
  }
}

console.log(`Updated ${modifiedCount} of ${files.length} tool files with Download Button & CTA Banner.`);

