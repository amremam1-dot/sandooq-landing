const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const toolsDir = path.join(rootDir, 'tools');
const stylesPath = path.join(rootDir, 'styles.css');

console.log('=== Step 1: Update styles.css with Master Universal Print Stylesheet ===');

const masterPrintCss = `
/* ==========================================================================
   Sandooq El-Amara — Universal Professional Print Stylesheet (@media print)
   Isolates tool reports, calculations, and documents for clean, paper-ready printing.
   Completely removes all website chrome, navigation, headers, footers, side rails,
   Google ads, input forms, buttons, guides, and background colors.
   ========================================================================== */

/* Hidden on screen, visible only during print */
.print-official-header,
.print-official-footer {
  display: none !important;
}

@media print {
  /* 1. Page Geometry & Universal Clean Reset */
  @page {
    size: A4 portrait;
    margin: 12mm 15mm 15mm 15mm;
  }

  *,
  *::before,
  *::after {
    background: transparent !important;
    color: #0f172a !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  html,
  body {
    background: #ffffff !important;
    color: #0f172a !important;
    font-family: 'Cairo', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.6 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    direction: rtl !important;
  }

  /* 2. COMPLETELY HIDE ALL SITE CHROME, NAVIGATION, ADS, FORMS, AND FOOTERS */
  header,
  footer,
  nav,
  aside,
  .site-header,
  .site-footer,
  .footer-col,
  .footer-copy,
  .breadcrumb-nav,
  .breadcrumb,
  .ad-rail,
  .ad-rail-right,
  .ad-rail-left,
  .ad-rail-sticky,
  .ad-label,
  .ad-mobile-banner,
  .page-with-ads-layout > aside,
  ins.adsbygoogle,
  .menu-toggle,
  .theme-toggle-btn,
  .search-trigger-btn,
  #searchModal,
  .search-modal,
  .search-container,
  .calc-container > nav,
  .calc-hero-header,
  .section-header,
  .lead-text,
  .eyebrow,
  .calc-container > div:first-of-type,
  .calc-inputs,
  .calc-inputs-col,
  .calc-grid > div:first-child:not(.calc-outputs-col):not(.results-box):not(.result-box):not(.printable-area),
  .form-group,
  .form-control,
  input,
  select,
  textarea:not(.preview-textarea),
  .months-selector,
  .calc-guide-content,
  .guide-article-box,
  article,
  .faq-item,
  .cta-banner,
  .app-promo,
  .btn-action-wrap,
  .btn-action,
  .btn,
  button,
  .alert,
  .copy-feedback,
  #copyAlert,
  #copyNoticeAlert,
  [data-no-print],
  .no-print {
    display: none !important;
  }

  /* 3. FLATTEN CONTAINERS SO ONLY OUTPUT TAKES 100% WIDTH */
  .page-with-ads-layout,
  main,
  section,
  .calc-container,
  .calc-card,
  .calc-grid,
  .calc-outputs-col,
  .results-box,
  .result-box,
  .printable-area,
  .receipt-paper {
    display: block !important;
    position: static !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    background: #ffffff !important;
    color: #0f172a !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  /* Hide the heading 📊 النتائج والتقرير الفوري */
  .calc-outputs-col > h3,
  .results-box > h3 {
    display: none !important;
  }

  /* 4. OFFICIAL PRINT HEADER (Displayed on top of paper) */
  .print-official-header {
    display: block !important;
    width: 100% !important;
    border-bottom: 2px solid #0f172a !important;
    padding-bottom: 12px !important;
    margin-bottom: 16px !important;
  }

  .print-header-top {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 8px !important;
  }

  .print-logo-box {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }

  .print-logo-icon {
    font-size: 22pt !important;
  }

  .print-org-title {
    font-size: 14pt !important;
    font-weight: 800 !important;
    margin: 0 !important;
    color: #0f172a !important;
  }

  .print-sub-title {
    font-size: 9pt !important;
    color: #475569 !important;
    display: block !important;
    margin-top: 2px !important;
  }

  .print-meta-box {
    text-align: left !important;
    font-size: 9pt !important;
    color: #334155 !important;
    line-height: 1.4 !important;
  }

  .print-doc-title-bar {
    background: #f1f5f9 !important;
    border: 1px solid #cbd5e1 !important;
    padding: 8px 12px !important;
    border-radius: 4px !important;
    text-align: center !important;
    margin-top: 6px !important;
  }

  .print-doc-title {
    font-size: 12.5pt !important;
    font-weight: 800 !important;
    margin: 0 !important;
    color: #0f172a !important;
  }

  /* 5. STATS & BREAKDOWN SUMMARY */
  .result-item,
  .breakdown-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
    color: #0f172a !important;
    padding: 8px 12px !important;
    margin-bottom: 6px !important;
    border-radius: 4px !important;
    page-break-inside: avoid !important;
  }

  .result-label,
  .breakdown-row span {
    color: #334155 !important;
    font-size: 10pt !important;
    font-weight: 600 !important;
  }

  .result-value,
  .breakdown-row strong,
  .result-total {
    color: #0f172a !important;
    font-weight: 800 !important;
    font-size: 11pt !important;
  }

  .result-item.highlight,
  .result-total {
    background: #e2e8f0 !important;
    border: 2px solid #0f172a !important;
    font-weight: 800 !important;
  }

  /* 6. GENERATED DOCUMENT & PREVIEW TEXT */
  .preview-textarea,
  #generator-preview,
  #asmDocPreview,
  #bylawDocPreview,
  #mcDocPreview,
  #noticeDocPreview,
  #hoDocPreview,
  #rcDocPreview,
  #clearanceDocPreview,
  .whatsapp-preview-box {
    display: block !important;
    width: 100% !important;
    background: #ffffff !important;
    color: #0f172a !important;
    font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif !important;
    font-size: 10.5pt !important;
    line-height: 1.8 !important;
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
    border: 1px solid #94a3b8 !important;
    border-radius: 6px !important;
    padding: 16px !important;
    margin-top: 12px !important;
    white-space: pre-wrap !important;
    page-break-inside: auto !important;
  }

  /* 7. HTML TABLES (E.G. SCHEDULES, SPECIFICATIONS) */
  #generator-html-preview,
  .printable-area table,
  table {
    display: block !important;
    width: 100% !important;
    margin-top: 12px !important;
    page-break-inside: auto !important;
  }

  table {
    display: table !important;
    width: 100% !important;
    border-collapse: collapse !important;
    border: 1px solid #cbd5e1 !important;
  }

  table th,
  table td {
    border: 1px solid #cbd5e1 !important;
    padding: 6px 10px !important;
    font-size: 9.5pt !important;
    color: #0f172a !important;
    text-align: right !important;
  }

  table th {
    background: #f1f5f9 !important;
    font-weight: 700 !important;
  }

  /* 8. RECEIPT PAPER SPECIAL FORMATTING */
  .receipt-paper {
    display: block !important;
    position: static !important;
    width: 100% !important;
    max-width: 650px !important;
    margin: 20px auto !important;
    padding: 24px !important;
    border: 2px solid #0f172a !important;
    border-radius: 8px !important;
    background: #ffffff !important;
    color: #0f172a !important;
    page-break-inside: avoid !important;
  }

  /* 9. OFFICIAL SIGNATURES FOOTER */
  .print-official-footer {
    display: block !important;
    margin-top: 28px !important;
    padding-top: 14px !important;
    border-top: 1px solid #cbd5e1 !important;
    page-break-inside: avoid !important;
  }

  .print-signatures-grid {
    display: flex !important;
    justify-content: space-between !important;
    gap: 16px !important;
    margin-top: 20px !important;
    text-align: center !important;
  }

  .print-sig-col {
    flex: 1 !important;
    border-top: 1px dashed #64748b !important;
    padding-top: 8px !important;
    font-size: 9.5pt !important;
    font-weight: 700 !important;
    color: #334155 !important;
  }

  .sig-space {
    height: 36px !important;
  }

  .print-watermark {
    text-align: center !important;
    font-size: 8.5pt !important;
    color: #64748b !important;
    margin-top: 18px !important;
    border-top: 1px dotted #e2e8f0 !important;
    padding-top: 8px !important;
  }
}
`;

let cssContent = fs.readFileSync(stylesPath, 'utf8');
if (!cssContent.includes('Universal Professional Print Stylesheet')) {
  cssContent += '\n' + masterPrintCss;
  fs.writeFileSync(stylesPath, cssContent, 'utf8');
  console.log('✅ styles.css updated with universal print stylesheet.');
} else {
  // Replace existing print stylesheet block if updating
  const startIdx = cssContent.indexOf('/* ==========================================================================\n   Sandooq El-Amara — Universal Professional Print Stylesheet');
  if (startIdx !== -1) {
    cssContent = cssContent.slice(0, startIdx).trim() + '\n\n' + masterPrintCss;
    fs.writeFileSync(stylesPath, cssContent, 'utf8');
    console.log('✅ styles.css refreshed with latest universal print stylesheet.');
  }
}

console.log('\n=== Step 2: Update generate_expansion.js for 50 Expansion Tools ===');

const genExpPath = path.join(__dirname, 'generate_expansion.js');
let genExpContent = fs.readFileSync(genExpPath, 'utf8');

// Check if print header already exists in template
if (!genExpContent.includes('print-official-header')) {
  // We want to add .print-official-header at the top of results-box
  // and .print-official-footer at the bottom of results-box
  const targetResultsBox = `<div class="results-box">`;
  const replacementResultsBox = `<div class="results-box">
              <div class="print-official-header">
                <div class="print-header-top">
                  <div class="print-logo-box">
                    <span class="print-logo-icon">🏢</span>
                    <div>
                      <h2 class="print-org-title">صندوق العمارة — Sandooq El-Amara</h2>
                      <span class="print-sub-title">المنصة المعتمدة لإدارة العقارات وحسابات اتحادات الشاغلين</span>
                    </div>
                  </div>
                  <div class="print-meta-box">
                    <div class="print-meta-item"><span>تاريخ الاستخراج:</span> <strong class="print-date-display">2026-10-24</strong></div>
                    <div class="print-meta-item"><span>طبيعة المستند:</span> <strong>وثيقة رسمية معتمدة</strong></div>
                  </div>
                </div>
                <div class="print-doc-title-bar">
                  <h1 class="print-doc-title">\${tool.title}</h1>
                </div>
              </div>`;

  genExpContent = genExpContent.replace(targetResultsBox, replacementResultsBox);

  // And add footer right before closing results-box
  const targetEndResultsBox = `<div class="btn-action-wrap">
                <button type="button" class="btn-action btn-primary-action" id="btn-copy-result">📋 نسخ التقرير</button>
                <button type="button" class="btn-action btn-whatsapp-action" id="btn-share-whatsapp">💬 مشاركة واتساب</button>
                <button type="button" class="btn-action btn-secondary-action" id="btn-print-result">🖨️ طباعة</button>
              </div>
            </div>`;

  const replacementEndResultsBox = `<div class="print-official-footer">
                <div class="print-signatures-grid">
                  <div class="print-sig-col">
                    <span>توقيع المستلم / الساكن</span>
                    <div class="sig-space"></div>
                  </div>
                  <div class="print-sig-col">
                    <span>اعتماد أمين الصندوق</span>
                    <div class="sig-space"></div>
                  </div>
                  <div class="print-sig-col">
                    <span>ختم اتحاد الشاغلين / العقار</span>
                    <div class="sig-space"></div>
                  </div>
                </div>
                <p class="print-watermark">تم استخراج هذا التقرير آلياً عبر منصة صندوق العمارة (sandoqalemara.com) — وثيقة صالحة للاعتماد والمراجعة المحاسبية.</p>
              </div>

              <div class="btn-action-wrap">
                <button type="button" class="btn-action btn-primary-action" id="btn-copy-result">📋 نسخ التقرير</button>
                <button type="button" class="btn-action btn-whatsapp-action" id="btn-share-whatsapp">💬 مشاركة واتساب</button>
                <button type="button" class="btn-action btn-secondary-action" id="btn-print-result">🖨️ طباعة</button>
              </div>
            </div>`;

  genExpContent = genExpContent.replace(targetEndResultsBox, replacementEndResultsBox);

  // Add date updater in client script
  genExpContent = genExpContent.replace(
    `inputsList.forEach(id => {`,
    `const dateDisplays = document.querySelectorAll('.print-date-display');
      dateDisplays.forEach(el => {
        el.innerText = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
      });

      inputsList.forEach(id => {`
  );

  fs.writeFileSync(genExpPath, genExpContent, 'utf8');
  console.log('✅ generate_expansion.js updated with print header, footer, and date synchronization.');
}

console.log('\n=== Step 3: Upgrade 20 Original Tools ===');

const origTools = [
  'building-fee-calculator.html', 'receipt-generator.html', 'building-arrears-calculator.html',
  'maintenance-budget-planner.html', 'elevator-cost-calculator.html', 'staircase-electricity-calculator.html',
  'water-bill-splitter.html', 'roof-waterproofing-calculator.html', 'maintenance-deposit-calculator.html',
  'guard-settlement-calculator.html', 'cctv-security-calculator.html', 'commercial-unit-fee-calculator.html',
  'petty-cash-tracker.html', 'preventive-maintenance-scheduler.html', 'building-bylaws-generator.html',
  'assembly-minutes-generator.html', 'treasury-handover-generator.html', 'legal-notice-generator.html',
  'maintenance-contract-generator.html', 'resident-directory-card-generator.html'
];

origTools.forEach(filename => {
  const filePath = path.join(toolsDir, filename);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Remove buggy inline @media print { body * { visibility: hidden; } ... }
  const buggyPrintRegex = /@media\s+print\s*\{\s*body\s*\*\s*\{\s*visibility:\s*hidden;\s*\}[\s\S]*?\n\s*\}/g;
  if (buggyPrintRegex.test(content)) {
    content = content.replace(buggyPrintRegex, '/* Inline @media print replaced by unified master print engine in styles.css */');
    modified = true;
  }

  // 2. Extract tool title from <h1> or <title>
  const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  let toolTitle = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'تقرير صندوق العمارة';

  const printHeaderHtml = `
            <div class="print-official-header">
              <div class="print-header-top">
                <div class="print-logo-box">
                  <span class="print-logo-icon">🏢</span>
                  <div>
                    <h2 class="print-org-title">صندوق العمارة — Sandooq El-Amara</h2>
                    <span class="print-sub-title">المنصة المعتمدة لإدارة العقارات وحسابات اتحادات الشاغلين</span>
                  </div>
                </div>
                <div class="print-meta-box">
                  <div class="print-meta-item"><span>تاريخ الاستخراج:</span> <strong class="print-date-display">2026-10-24</strong></div>
                  <div class="print-meta-item"><span>طبيعة المستند:</span> <strong>وثيقة رسمية معتمدة</strong></div>
                </div>
              </div>
              <div class="print-doc-title-bar">
                <h1 class="print-doc-title">${toolTitle}</h1>
              </div>
            </div>`;

  const printFooterHtml = `
            <div class="print-official-footer">
              <div class="print-signatures-grid">
                <div class="print-sig-col">
                  <span>توقيع المستلم / الساكن</span>
                  <div class="sig-space"></div>
                </div>
                <div class="print-sig-col">
                  <span>اعتماد أمين الصندوق</span>
                  <div class="sig-space"></div>
                </div>
                <div class="print-sig-col">
                  <span>ختم اتحاد الشاغلين / العقار</span>
                  <div class="sig-space"></div>
                </div>
              </div>
              <p class="print-watermark">تم استخراج هذا التقرير آلياً عبر منصة صندوق العمارة (sandoqalemara.com) — وثيقة صالحة للاعتماد والمراجعة المحاسبية.</p>
            </div>`;

  // 3. Inject print header & footer inside the printable container if not already present
  if (!content.includes('print-official-header')) {
    if (content.includes('class="results-box"')) {
      content = content.replace(/(<div[^>]*class=["']results-box["'][^>]*>)/i, `$1\n${printHeaderHtml}\n`);
      // Add footer before closing of results-box
      content = content.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<!--\s*Educational|\s*<!--\s*Educational|\s*<\/section>)/i, `\n${printFooterHtml}\n$1`);
      modified = true;
    } else if (content.includes('class="result-box"')) {
      content = content.replace(/(<div[^>]*class=["']result-box["'][^>]*>)/i, `$1\n${printHeaderHtml}\n`);
      content = content.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<!--\s*Features|\s*<!--\s*App Highlight|\s*<\/section>)/i, `\n${printFooterHtml}\n$1`);
      modified = true;
    } else if (content.includes('class="printable-area"')) {
      content = content.replace(/(<div[^>]*class=["'][^"']*printable-area[^"']*["'][^>]*>)/i, `$1\n${printHeaderHtml}\n`);
      content = content.replace(/(<\/div>\s*<\/div>\s*<!--\s*Educational|\s*<\/section>)/i, `\n${printFooterHtml}\n$1`);
      modified = true;
    } else if (content.includes('class="receipt-paper"')) {
      // Receipt generator has its own header, but we add print-date-display
      content = content.replace(/(<div[^>]*class=["']receipt-paper["'][^>]*>)/i, `$1\n<div class="print-date-display" style="display:none;"></div>\n`);
      modified = true;
    }
  }

  // 4. Missing print button injection
  if (filename === 'building-arrears-calculator.html' && !content.includes('window.print()')) {
    content = content.replace(
      `<button type="button" onclick="copyWhatsAppMessage()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الرسالة 📋</button>`,
      `<button type="button" onclick="copyWhatsAppMessage()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الرسالة 📋</button>
              <button type="button" onclick="window.print()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--primary-light); color: #fff;">طباعة كشف المتأخرات 🖨️</button>`
    );
    modified = true;
  }

  if (filename === 'maintenance-budget-planner.html' && !content.includes('window.print()')) {
    content = content.replace(
      `<button type="button" onclick="copyProjectNotice()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الإعلان 📋</button>`,
      `<button type="button" onclick="copyProjectNotice()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الإعلان 📋</button>
              <button type="button" onclick="window.print()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--primary-light); color: #fff;">طباعة مقايسة المشروع 🖨️</button>`
    );
    modified = true;
  }

  if (filename === 'petty-cash-tracker.html' && !content.includes('window.print()')) {
    content = content.replace(
      `<button id="copyPettyWaBtn" class="btn-action btn-whatsapp-action">إرسال بيان التصفية 📲</button>`,
      `<button id="copyPettyWaBtn" class="btn-action btn-whatsapp-action">إرسال بيان التصفية 📲</button>
            <button id="printPettyBtn" type="button" onclick="window.print()" class="btn-action btn-secondary-action">طباعة محضر التصفية 🖨️</button>`
    );
    modified = true;
  }

  // 5. Add date script if missing
  if (!content.includes('print-date-display')) {
    const dateScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const dates = document.querySelectorAll('.print-date-display');
      dates.forEach(function(el) {
        el.innerText = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
      });
    });
  </script>`;
    content = content.replace('</body>', `${dateScript}\n</body>`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated original tool: ${filename}`);
  } else {
    console.log(`ℹ️ Already up-to-date: ${filename}`);
  }
});

console.log('\nPrint engine applied successfully.');
