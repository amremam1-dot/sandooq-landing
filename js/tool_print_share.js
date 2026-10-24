/**
 * Sandooq El-Amara — Universal Tool Print & WhatsApp Share Engine
 * Features:
 * 1. 100% Isolated Clean Document Printing (Zero Webpage Elements / Zero Ads / Zero Chrome)
 * 2. Professional WhatsApp Message Formatter (Bold headers, clean separators, labeled bullet points)
 * 3. Automatic binding to all 70 tool pages
 */
(function() {
  'use strict';

  function getCleanDate() {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getToolTitle() {
    const h1 = document.querySelector('h1');
    if (h1) {
      return h1.innerText.replace(/[\n\r]+/g, ' ').trim();
    }
    return document.title.split('|')[0].trim();
  }

  function extractStats() {
    const stats = [];

    // 1. Result items (.result-item)
    const items = document.querySelectorAll('.result-item');
    if (items.length > 0) {
      items.forEach(el => {
        const labelEl = el.querySelector('.result-label');
        const valEl = el.querySelector('.result-value');
        if (labelEl && valEl) {
          const valText = valEl.innerText.trim();
          if (valText && valText !== '—') {
            stats.push({
              label: labelEl.innerText.replace(/:$/, '').trim(),
              value: valText,
              isHighlight: el.classList.contains('highlight')
            });
          }
        }
      });
      if (stats.length > 0) return stats;
    }

    // 2. Breakdown rows (.breakdown-row)
    const rows = document.querySelectorAll('.breakdown-row');
    if (rows.length > 0) {
      rows.forEach(r => {
        const span = r.querySelector('span');
        const strong = r.querySelector('strong');
        if (span && strong) {
          stats.push({
            label: span.innerText.replace(/:$/, '').trim(),
            value: strong.innerText.trim(),
            isHighlight: false
          });
        }
      });
    }

    // 3. Totals and highlights
    const totalSelectors = [
      { id: 'perUnitFeeVal', label: 'اشتراك الشقة الشهري المقترح' },
      { id: 'grandTotalVal', label: 'إجمالي الميزانية المستهدفة' },
      { id: 'totalDebtDisplay', label: 'إجمالي المتأخرات المستحقة' },
      { id: 'costPerUnitDisplay', label: 'حصة الشقة الواحدة في المشروع' },
      { id: 'resPointValue', label: 'قيمة النقطة المرجحة' },
      { id: 'resTotalPoints', label: 'إجمالي عدد النقاط' },
      { id: 'resNetPayout', label: 'صافي مستحقات نهاية الخدمة' }
    ];

    totalSelectors.forEach(ts => {
      const el = document.getElementById(ts.id);
      if (el && el.innerText.trim() && el.innerText.trim() !== '—') {
        stats.push({
          label: ts.label,
          value: el.innerText.trim(),
          isHighlight: true
        });
      }
    });

    return stats;
  }

  function extractTableRows() {
    const tableRows = [];
    const tbody = document.querySelector('table tbody, #tableBody');
    if (tbody) {
      const trs = tbody.querySelectorAll('tr');
      trs.forEach(tr => {
        const tds = tr.querySelectorAll('td, th');
        if (tds.length >= 2) {
          const name = tds[0].innerText.trim();
          const val = tds[tds.length - 1].innerText.trim() || tds[tds.length - 2].innerText.trim();
          if (name && val) {
            tableRows.push({ name, val });
          }
        }
      });
    }
    return tableRows;
  }

  function extractDocText() {
    // 1. Generator preview
    const preview = document.getElementById('generator-preview');
    if (preview && preview.innerText && preview.innerText.trim().length > 20) {
      return preview.innerText.trim();
    }

    // 2. Specific doc previews in original tools
    const specificIds = [
      'asmDocPreview', 'bylawDocPreview', 'mcDocPreview', 
      'noticeDocPreview', 'hoDocPreview', 'rcDocPreview', 
      'clearanceDocPreview', 'whatsappMessage', 'projectNoticeBox'
    ];
    for (const id of specificIds) {
      const el = document.getElementById(id);
      if (el && el.innerText && el.innerText.trim().length > 20) {
        return el.innerText.trim();
      }
    }

    // 3. Fallback to textarea
    const ta = document.querySelector('.preview-textarea, textarea.result-text');
    if (ta && ta.value && ta.value.trim().length > 20) {
      return ta.value.trim();
    }

    return '';
  }

  function extractHtmlTable() {
    const htmlPreview = document.getElementById('generator-html-preview');
    if (htmlPreview && htmlPreview.innerHTML && htmlPreview.innerHTML.trim().length > 20) {
      return htmlPreview.innerHTML.trim();
    }
    const schedTable = document.querySelector('.printable-area table, table.breakdown-table');
    if (schedTable) {
      return schedTable.outerHTML;
    }
    return '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- BUILD ISOLATED PRINT DOCUMENT ---
  function buildIsolatedPrintHtml(title, stats, docText, htmlTable) {
    const dateStr = getCleanDate();
    const isReceipt = !!document.querySelector('.receipt-paper');

    if (isReceipt) {
      const receiptPaper = document.querySelector('.receipt-paper');
      return `
        <div class="receipt-container">
          ${receiptPaper ? receiptPaper.innerHTML : ''}
        </div>
      `;
    }

    let statsRowsHtml = '';
    if (stats && stats.length > 0) {
      statsRowsHtml = `
        <table class="stat-table">
          <thead>
            <tr>
              <th style="width: 50%;">البند / البيان المحاسبي</th>
              <th style="width: 50%;">القيمة المحسوبة المعتمدة</th>
            </tr>
          </thead>
          <tbody>
            ${stats.map(s => `
              <tr class="${s.isHighlight ? 'highlight' : ''}">
                <th>${escapeHtml(s.label)}</th>
                <td>${escapeHtml(s.value)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    let docHtml = '';
    if (docText) {
      docHtml = `
        <div style="margin-top: 18px;">
          <h3 style="font-size: 11pt; font-weight: 800; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
            نص الوثيقة / المحضر المعتمد:
          </h3>
          <div class="doc-text-block">${escapeHtml(docText)}</div>
        </div>
      `;
    }

    let tableHtml = '';
    if (htmlTable) {
      tableHtml = `
        <div style="margin-top: 18px;">
          ${htmlTable}
        </div>
      `;
    }

    return `
      <div class="print-doc-header">
        <div class="print-header-row">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 26pt;">🏢</span>
            <div>
              <div class="print-brand">صندوق العمارة (Sandooq El-Amara)</div>
              <div class="print-tagline">المنصة المعتمدة لإدارة العقارات وحسابات اتحادات الشاغلين</div>
            </div>
          </div>
          <div class="print-meta">
            <div><strong>تاريخ الاستخراج:</strong> ${dateStr}</div>
            <div><strong>طبيعة المستند:</strong> وثيقة رسمية معتمدة</div>
            <div><strong>المرجع الإلكتروني:</strong> sandoqalemara.com</div>
          </div>
        </div>
        <div class="print-title-box">
          <div class="print-title">${escapeHtml(title)}</div>
        </div>
      </div>

      <div class="print-body">
        ${statsRowsHtml}
        ${tableHtml}
        ${docHtml}
      </div>

      <div class="print-doc-footer">
        <div class="sig-grid">
          <div class="sig-box">
            <span>توقيع المستلم / الساكن</span>
            <div class="sig-space"></div>
          </div>
          <div class="sig-box">
            <span>اعتماد أمين الصندوق</span>
            <div class="sig-space"></div>
          </div>
          <div class="sig-box">
            <span>ختم اتحاد الشاغلين / العقار</span>
            <div class="sig-space"></div>
          </div>
        </div>
        <div class="watermark">
          تم استخراج هذا التقرير آلياً عبر منصة صندوق العمارة (sandoqalemara.com) — حسابات دقيقة صالحة للاعتماد والمراجعة المحاسبية.
        </div>
      </div>
    `;
  }

  // --- PRINT ISOLATION IN IFRAME (Zero Webpage Elements Leak) ---
  function printIsolatedDocument() {
    const title = getToolTitle();
    const stats = extractStats();
    const docText = extractDocText();
    const htmlTable = extractHtmlTable();

    const bodyContent = buildIsolatedPrintHtml(title, stats, docText, htmlTable);

    let iframe = document.getElementById('sandooq-print-sandbox-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'sandooq-print-sandbox-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '-9999px';
      iframe.style.bottom = '-9999px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 16mm 14mm 16mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Cairo', system-ui, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif;
      background: #ffffff;
      color: #0f172a;
      line-height: 1.65;
      font-size: 10.5pt;
      direction: rtl;
      padding: 0;
    }
    .print-doc-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .print-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-brand {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
    }
    .print-tagline {
      font-size: 8.5pt;
      color: #475569;
      margin-top: 2px;
    }
    .print-meta {
      text-align: left;
      font-size: 9pt;
      color: #334155;
      line-height: 1.45;
    }
    .print-title-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 4px;
      text-align: center;
      margin-top: 12px;
    }
    .print-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
    }
    .stat-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
    }
    .stat-table th, .stat-table td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      font-size: 10pt;
      text-align: right;
    }
    .stat-table th {
      background: #f8fafc;
      font-weight: 700;
      width: 45%;
      color: #334155;
    }
    .stat-table td {
      font-weight: 800;
      color: #0f172a;
    }
    .stat-table tr.highlight th,
    .stat-table tr.highlight td {
      background: #f1f5f9;
      font-size: 11pt;
      border: 2px solid #0f172a;
      color: #0f172a;
    }
    .doc-text-block {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 10.5pt;
      line-height: 1.8;
      border: 1px solid #94a3b8;
      border-radius: 6px;
      padding: 16px;
      background: #ffffff;
      margin: 12px 0;
      page-break-inside: auto;
    }
    .print-doc-footer {
      margin-top: 26px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      page-break-inside: avoid;
    }
    .sig-grid {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 20px;
    }
    .sig-box {
      flex: 1;
      text-align: center;
      border-top: 1px dashed #64748b;
      padding-top: 6px;
      font-size: 9pt;
      font-weight: 700;
      color: #334155;
    }
    .sig-space {
      height: 35px;
    }
    .watermark {
      text-align: center;
      font-size: 8pt;
      color: #64748b;
      margin-top: 18px;
      padding-top: 6px;
      border-top: 1px dotted #e2e8f0;
    }
    .receipt-container {
      max-width: 650px;
      margin: 0 auto;
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    table th, table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      font-size: 9.5pt;
    }
    table th {
      background: #f1f5f9;
      font-weight: 700;
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
  }

  // --- WHATSAPP FORMATTING ENGINE ---
  function formatWhatsAppMessage() {
    const title = getToolTitle();
    const stats = extractStats();
    const docText = extractDocText();
    const tableRows = extractTableRows();
    const dateStr = getCleanDate();
    const currentUrl = window.location.href.split('?')[0];

    // Case 1: Full Document / Contract / Minutes / Inspection
    if (docText && docText.length > 50) {
      let formattedDoc = docText
        .replace(/^([أ-ي]+:)/gm, '*$1*') // Bold section starts
        .replace(/(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً):/g, '*$1:*')
        .replace(/(⚡ عداد الكهرباء|💧 عداد المياه|🔥 عداد الغاز):/g, '*$1:*');

      let msg = `*🏢 صندوق العمارة — وثيقة رسمية معتمدة*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📜 *${title}*\n`;
      msg += `📅 *التاريخ:* ${dateStr}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      msg += `${formattedDoc}\n\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `✍️ *الاعتماد والتوقيعات:*\n`;
      msg += `• توقيع الطرف المستلم: ....................\n`;
      msg += `• توقيع أمين الصندوق: ....................\n`;
      msg += `• خاتم اتحاد الشاغلين: ....................\n\n`;
      msg += `📲 *محرر آلياً عبر منصة صندوق العمارة:*\n`;
      msg += `🔗 ${currentUrl}`;
      return msg;
    }

    // Case 2: Calculation Report
    let msg = `*🏢 تقرير معتمد — صندوق العمارة*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 *${title}*\n`;
    msg += `📅 *التاريخ:* ${dateStr}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `📋 *ملخص النتائج المحسوبة:*\n`;

    if (stats.length > 0) {
      stats.forEach(s => {
        const icon = s.isHighlight ? '✅' : '🔹';
        msg += `${icon} *${s.label}:* ${s.value}\n`;
      });
    }

    if (tableRows.length > 0 && tableRows.length <= 15) {
      msg += `\n📑 *التفصيل حسب الأدوار / البنود:*\n`;
      tableRows.forEach(tr => {
        msg += `▫️ *${tr.name}:* ${tr.val}\n`;
      });
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💡 *ملاحظة محاسبية:* مستخرج وفقاً للمعايير واللوائح المعتمدة لإدارة العقارات.\n\n`;
    msg += `📲 *تم الحساب بواسطة تطبيق صندوق العمارة:*\n`;
    msg += `🔗 ${currentUrl}\n\n`;
    msg += `📱 *لإدارة حسابات عمارتك بالذكاء الاصطناعي وصوت "عم أمين":*\n`;
    msg += `حمّل التطبيق مجاناً: https://sandoqalemara.com`;

    return msg;
  }

  function shareOnWhatsApp() {
    const text = formatWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }

  // --- SHORTCUT (Ctrl + P) SUPPORT VIA BEFOREPRINT STAGE ---
  let printStage = null;
  window.addEventListener('beforeprint', function() {
    const title = getToolTitle();
    const stats = extractStats();
    const docText = extractDocText();
    const htmlTable = extractHtmlTable();

    const printHtml = buildIsolatedPrintHtml(title, stats, docText, htmlTable);

    printStage = document.getElementById('sandooq-isolated-print-stage');
    if (!printStage) {
      printStage = document.createElement('div');
      printStage.id = 'sandooq-isolated-print-stage';
      document.body.appendChild(printStage);
    }
    printStage.innerHTML = printHtml;
    document.body.classList.add('sandooq-printing-active');
  });

  window.addEventListener('afterprint', function() {
    document.body.classList.remove('sandooq-printing-active');
    if (printStage) {
      printStage.innerHTML = '';
    }
  });

  // --- AUTO-BINDING TO BUTTONS ON DOM LOAD ---
  function initBindings() {
    // 1. Bind print buttons
    const printSelectors = [
      '#btn-print-result',
      '#printPettyBtn',
      '.btn-print',
      'button[onclick*="window.print"]'
    ];

    printSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => {
        if (btn.dataset.printBound) return;
        btn.dataset.printBound = 'true';
        if (btn.getAttribute('onclick')?.includes('window.print')) {
          btn.removeAttribute('onclick');
        }
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          printIsolatedDocument();
        });
      });
    });

    // 2. Bind WhatsApp buttons
    const waSelectors = [
      '#btn-share-whatsapp',
      '#btnShareCalcWhatsApp',
      '#btnShareWhatsApp',
      '#copyWhatsAppBtn',
      '#copyElecWaBtn',
      '#copyWaterWaBtn',
      '#copyRoofWaBtn',
      '#copyDepWaBtn',
      '#copyCctvWaBtn',
      '#copyCommWaBtn',
      '#copyPettyWaBtn',
      '.btn-whatsapp-action',
      '.btn-whatsapp'
    ];

    waSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => {
        if (btn.dataset.waBound) return;
        btn.dataset.waBound = 'true';
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          shareOnWhatsApp();
        });
      });
    });
  }

  // Expose globally
  window.sandooqPrintReport = printIsolatedDocument;
  window.sandooqShareWhatsApp = shareOnWhatsApp;
  window.sandooqFormatWhatsApp = formatWhatsAppMessage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBindings);
  } else {
    initBindings();
  }
})();
