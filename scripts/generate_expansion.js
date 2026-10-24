#!/usr/bin/env node

/**
 * ============================================================================
 * Sandooq El-Amara — Master Content & Tools Expansion Engine
 * Generates 50 New Interactive Tools & 81 New Comprehensive Guides
 * Updates search_index.json, tools/index.html, guides/index.html, sitemap.xml
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LANDING_DIR = path.resolve(__dirname, '..');
const TOOLS_DIR = path.join(LANDING_DIR, 'tools');
const GUIDES_DIR = path.join(LANDING_DIR, 'guides');
const DATA_DIR = path.join(LANDING_DIR, 'data');

// 1. Load Modular Data Files
const toolsPart1 = require('./data_tools_expansion_part1.js');
const toolsPart2 = require('./data_tools_expansion_part2.js');
const allNewTools = [...toolsPart1, ...toolsPart2];

const guidesPart1 = require('./data_guides_expansion_part1.js');
const guidesPart2 = require('./data_guides_expansion_part2.js');
const guidesPart3 = require('./data_guides_expansion_part3.js');
const autoGuidesPath = path.join(__dirname, 'data_guides_auto.js');
const autoGuides = fs.existsSync(autoGuidesPath) ? require(autoGuidesPath) : [];
const allNewGuides = [...guidesPart1, ...guidesPart2, ...guidesPart3, ...autoGuides];

console.log(`Loaded ${allNewTools.length} new tools definitions.`);
console.log(`Loaded ${allNewGuides.length} new guides definitions.`);

// Common HTML Head template
function getHeadHtml(title, desc, canonicalUrl, ogType = 'website') {
  return `  <!-- Google AdSense Verification & Loader -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4640495425873996" crossorigin="anonymous"></script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-R8XXF32BFW"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-R8XXF32BFW');
  </script>

  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | صندوق العمارة</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Alternate Languages (hreflang) -->
  <link rel="alternate" hreflang="ar" href="${canonicalUrl}" />
  <link rel="alternate" hreflang="en" href="https://sandoqalemara.com/en/${canonicalUrl.includes('/tools/') ? 'tools/' : 'guides/'}" />
  <link rel="alternate" hreflang="x-default" href="https://sandoqalemara.com/" />

  <!-- Open Graph -->
  <meta property="og:type" content="${ogType}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="https://sandoqalemara.com/assets/sandooq-logo.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Favicon & Styles -->
  <link rel="icon" href="../favicon.ico" sizes="48x48" />
  <link rel="icon" type="image/png" sizes="48x48" href="../assets/favicon-48x48.png" />
  <link rel="icon" type="image/png" sizes="96x96" href="../assets/favicon-96x96.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="../assets/sandooq-logo.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png" />
  <link rel="stylesheet" href="../styles.css" />`;
}

// 2. Generate Tool Page HTML
function generateToolHtml(tool) {
  const canonicalUrl = `https://sandoqalemara.com/tools/${tool.slug}.html`;
  const isGen = !!tool.isGenerator;

  let formFieldsHtml = '';
  (tool.inputs || []).forEach(inp => {
    formFieldsHtml += `          <div class="form-group">\n            <label for="${inp.id}">${inp.label}</label>\n`;
    if (inp.type === 'select') {
      formFieldsHtml += `            <select id="${inp.id}">\n`;
      inp.options.forEach(opt => {
        const sel = opt === inp.default ? ' selected' : '';
        formFieldsHtml += `              <option value="${opt}"${sel}>${opt}</option>\n`;
      });
      formFieldsHtml += `            </select>\n`;
    } else if (inp.type === 'textarea') {
      formFieldsHtml += `            <textarea id="${inp.id}" rows="3">${inp.default || ''}</textarea>\n`;
    } else {
      const minAttr = inp.min !== undefined ? ` min="${inp.min}"` : '';
      const maxAttr = inp.max !== undefined ? ` max="${inp.max}"` : '';
      formFieldsHtml += `            <input type="${inp.type}" id="${inp.id}" value="${inp.default || ''}"${minAttr}${maxAttr} />\n`;
    }
    formFieldsHtml += `          </div>\n`;
  });

  let resultItemsHtml = '';
  (tool.resultFields || []).forEach(rf => {
    const hlClass = rf.isHighlight ? ' highlight' : '';
    resultItemsHtml += `            <div class="result-item${hlClass}">\n              <span class="result-label">${rf.label}</span>\n              <span class="result-value" id="res-${rf.id}">—</span>\n            </div>\n`;
  });

  let faqsHtml = '';
  (tool.faqs || []).forEach(f => {
    faqsHtml += `        <div class="faq-item" style="margin-bottom:18px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">\n          <h4 style="color:var(--text-main); font-size:1.1rem; margin-bottom:6px;">❓ ${f.q}</h4>\n          <p style="color:var(--text-light); line-height:1.7;">${f.a}</p>\n        </div>\n`;
  });

  // Client-side execution script
  const scriptContent = `
    (function() {
      const inputsList = ${JSON.stringify(tool.inputs.map(i => i.id))};
      function getInputs() {
        const data = {};
        const dateDisplays = document.querySelectorAll('.print-date-display');
      dateDisplays.forEach(el => {
        el.innerText = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
      });

      inputsList.forEach(id => {
          const el = document.getElementById(id);
          if (el) data[id] = el.value;
        });
        return data;
      }

      function calculate() {
        const inputs = getInputs();
        try {
          const calcFn = function(inputs) {
            ${tool.calcLogic}
          };
          const res = calcFn(inputs);
          if (!res) return;

          ${tool.resultFields.map(rf => `
          const el_${rf.id} = document.getElementById('res-${rf.id}');
          if (el_${rf.id} && res['${rf.id}'] !== undefined) {
            el_${rf.id}.innerText = res['${rf.id}'];
          }
          `).join('\n')}

          ${isGen ? `
          const previewEl = document.getElementById('generator-preview');
          if (previewEl) {
            previewEl.innerText = res.outputText || '';
          }
          const htmlPreviewEl = document.getElementById('generator-html-preview');
          if (htmlPreviewEl && res.previewHtml) {
            htmlPreviewEl.innerHTML = res.previewHtml;
          }
          ` : ''}

          window._lastCalcOutput = res;
        } catch(e) {
          console.error('Calculation error:', e);
        }
      }

      inputsList.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', calculate);
          el.addEventListener('change', calculate);
        }
      });

      calculate();

            // Action Buttons
      const btnCopy = document.getElementById('btn-copy-result');
      if (btnCopy) {
        btnCopy.addEventListener('click', function() {
          if (window.sandooqFormatWhatsApp) {
            const text = window.sandooqFormatWhatsApp();
            navigator.clipboard.writeText(text).then(() => {
              const old = btnCopy.innerText;
              btnCopy.innerText = '✅ تم نسخ التقرير المنسق!';
              setTimeout(() => { btnCopy.innerText = old; }, 2000);
            });
          } else {
            const out = window._lastCalcOutput;
            if (!out) return;
            const text = ${isGen ? 'out.outputText || ""' : 'JSON.stringify(out, null, 2)'};
            navigator.clipboard.writeText(text).then(() => {
              const old = btnCopy.innerText;
              btnCopy.innerText = '✅ تم النسخ بنجاح!';
              setTimeout(() => { btnCopy.innerText = old; }, 2000);
            });
          }
        });
      }

      const btnWa = document.getElementById('btn-share-whatsapp');
      if (btnWa) {
        btnWa.addEventListener('click', function(e) {
          e.preventDefault();
          if (window.sandooqShareWhatsApp) {
            window.sandooqShareWhatsApp();
          }
        });
      }

      const btnPrint = document.getElementById('btn-print-result');
      if (btnPrint) {
        btnPrint.addEventListener('click', function(e) {
          e.preventDefault();
          if (window.sandooqPrintReport) {
            window.sandooqPrintReport();
          } else {
            window.print();
          }
        });
      }
    })();
  `;

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
${getHeadHtml(tool.title, tool.desc, canonicalUrl, 'website')}

  <style>
    .calc-container { max-width: 1000px; margin: 40px auto 80px; padding: 0 24px; }
    .calc-card { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 36px 32px; box-shadow: var(--shadow-md); margin-top: 24px; }
    .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 28px; }
    @media (max-width: 820px) { .calc-grid { grid-template-columns: 1fr; } }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 700; margin-bottom: 8px; font-size: 0.95rem; color: var(--text-main); }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 16px; background: var(--card-bg-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-main); font-family: inherit; font-size: 1rem; transition: var(--transition); box-sizing: border-box; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
    .results-box { background: linear-gradient(145deg, rgba(30, 58, 138, 0.2), rgba(16, 185, 129, 0.15)); border: 1px solid var(--primary-light); border-radius: var(--radius-md); padding: 28px; display: flex; flex-direction: column; gap: 16px; }
    .result-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px dashed var(--border-color); }
    .result-item.highlight { border-bottom: none; background: var(--card-bg); padding: 18px 20px; border-radius: var(--radius-sm); border: 1px solid var(--secondary-color); }
    .result-label { font-weight: 700; color: var(--text-muted); font-size: 0.95rem; }
    .result-item.highlight .result-label { color: var(--text-main); font-size: 1.1rem; }
    .result-value { font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
    .result-item.highlight .result-value { font-size: 1.6rem; color: var(--secondary-color); }
    .preview-textarea { width: 100%; min-height: 220px; padding: 14px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-main); font-family: monospace; font-size: 0.95rem; line-height: 1.6; resize: vertical; white-space: pre-wrap; }
    .btn-action-wrap { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
    .btn-action { flex: 1; min-width: 140px; padding: 12px 18px; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.95rem; cursor: pointer; text-align: center; border: none; font-family: inherit; transition: var(--transition); display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
    .btn-primary-action { background: var(--primary-color); color: #fff; }
    .btn-primary-action:hover { background: var(--primary-light); }
    .btn-whatsapp-action { background: #25D366; color: #fff; }
    .btn-whatsapp-action:hover { background: #1ebc59; }
    .btn-secondary-action { background: var(--card-bg-subtle); color: var(--text-main); border: 1px solid var(--border-color); }
    .calc-guide-content { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 40px; margin-top: 50px; font-size: 1.05rem; line-height: 1.85; color: var(--text-light); }
    .calc-guide-content h2 { font-size: 1.5rem; color: var(--text-main); margin-top: 32px; margin-bottom: 14px; border-bottom: 2px solid var(--border-color); padding-bottom: 8px; }
    .calc-guide-content h3 { font-size: 1.25rem; color: var(--primary-light); margin-top: 24px; margin-bottom: 12px; }
    .breadcrumb-nav { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px; }
    .breadcrumb-nav a { color: var(--primary-light); }
  </style>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "${tool.title}",
    "url": "${canonicalUrl}",
    "description": "${tool.desc}",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EGP"
    }
  }
  </script>
</head>
<body>
  <!-- Header will be injected by build_landing.js -->
  <header class="site-header"></header>

  <main>
    <section class="calc-container">
      <nav class="breadcrumb-nav">
        <a href="../index.html">الرئيسية</a> &gt; 
        <a href="index.html">الأدوات المجانية</a> &gt; 
        <span>${tool.shortTitle}</span>
      </nav>

      <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
        <span style="font-size:2.8rem;">${tool.icon}</span>
        <div>
          <h1 style="font-size:2rem; font-weight:800; color:var(--text-main); margin:0 0 6px;">${tool.title}</h1>
          <p style="color:var(--text-muted); margin:0;">أداة تفاعلية مجانية 100% لحساب وتنظيم شؤون العقار بدقة وسرعة.</p>
        </div>
      </div>

      <div class="calc-card">
        <div class="calc-grid">
          <!-- Inputs Column -->
          <div class="calc-inputs-col">
            <h3 style="font-size:1.25rem; color:var(--primary-light); margin-bottom:18px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
              ⚙️ البيانات والمدخلات
            </h3>
${formFieldsHtml}
          </div>

          <!-- Output / Preview Column -->
          <div class="calc-outputs-col">
            <h3 style="font-size:1.25rem; color:var(--secondary-color); margin-bottom:18px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
              📊 النتائج والتقرير الفوري
            </h3>
            <div class="results-box">
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
                  <h1 class="print-doc-title">${tool.title}</h1>
                </div>
              </div>
${resultItemsHtml}
              ${isGen ? `
              <div id="generator-html-preview"></div>
              <div style="margin-top:10px;">
                <label style="display:block; font-weight:700; margin-bottom:6px; color:var(--text-main); font-size:0.9rem;">نص الوثيقة الرسمي المعتمد:</label>
                <div id="generator-preview" class="preview-textarea"></div>
              </div>
              ` : ''}

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
              </div>

              <div class="btn-action-wrap">
                <button type="button" class="btn-action btn-primary-action" id="btn-copy-result">📋 نسخ التقرير</button>
                <button type="button" class="btn-action btn-whatsapp-action" id="btn-share-whatsapp">💬 مشاركة واتساب</button>
                <button type="button" class="btn-action btn-secondary-action" id="btn-print-result">🖨️ طباعة</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Educational SEO Guide & FAQs -->
      <article class="calc-guide-content">
        <h2>دليل الاستخدام والأساس الهندسي والقانوني للأداة</h2>
        <p>${tool.desc}</p>
        <p>تعتمد هذه الأداة على القواعد المحاسبية والهندسية المعتمدة في قانون البناء الموحد المصري واللوائح المنظمة لإدارة اتحادات الشاغلين لحفظ حقوق جميع السكان ومنع النزاعات المالية المشتركة.</p>

        <h3>نصائح ذهبية لإدارة أفضل لعقارتكم:</h3>
        <ul>
          <li><strong>التوثيق الفوري:</strong> لا تعتمد على الاتفاقات الشفوية بين الجيران؛ احرص دائماً على استخراج نسخ ورقية موقعة ومشاركتها في سجلات العمارة.</li>
          <li><strong>الشفافية الكاملة:</strong> مشاركة التقارير المالية الدورية بانتظام عبر تطبيق صندوق العمارة يرفع نسبة التزام السكان بالسداد إلى أكثر من 95%.</li>
          <li><strong>الصندوق الوقائي:</strong> تخصيص نسبة لا تقل عن 10% من الاشتراكات لمواجهة الطوارئ يجنبكم طلب سلفيات مفاجئة من الشقق.</li>
        </ul>

        <h2>الأسئلة الشائعة حول ${tool.shortTitle}</h2>
${faqsHtml}

        <div style="margin-top:40px; background:linear-gradient(135deg, rgba(30,58,138,0.25), rgba(16,185,129,0.15)); border:1px solid var(--primary-light); border-radius:var(--radius-md); padding:30px; text-align:center;">
          <h3 style="font-size:1.4rem; color:var(--text-main); margin-bottom:10px;">جرّب تطبيق "صندوق العمارة" الكامل على هاتفك مجاناً</h3>
          <p style="color:var(--text-light); max-width:700px; margin:0 auto 20px;">أدر حسابات عقارك، عهدة البواب، سندات القبض، ومتابعة متأخرات الشقق بالذكاء الاصطناعي وصوت "عم أمين".</p>
          <a href="../download.html" class="btn btn-primary" style="display:inline-block; padding:12px 28px; border-radius:30px; text-decoration:none; font-weight:700;">تحميل التطبيق الآن للأندرويد</a>
        </div>
      </article>
    </section>
  </main>

  <!-- Footer will be injected by build_landing.js -->
  <footer class="site-footer"></footer>

  <!-- Universal Print & WhatsApp Share Engine -->
  <script src="../js/tool_print_share.js"></script>
  <script>${scriptContent}</script>
</body>
</html>`;
}

// 3. Generate Guide Page HTML
function generateGuideHtml(guide) {
  const canonicalUrl = `https://sandoqalemara.com/guides/${guide.slug}.html`;

  let sectionsHtml = '';
  (guide.sections || []).forEach(sec => {
    sectionsHtml += `      <h2>${sec.h2}</h2>\n`;
    if (sec.h3) sectionsHtml += `      <h3>${sec.h3}</h3>\n`;
    const paragraphs = (sec.content || '').split('\n').filter(Boolean);
    paragraphs.forEach(p => {
      if (p.startsWith('- ')) {
        sectionsHtml += `      <ul style="padding-right:24px; margin-bottom:14px;"><li style="margin-bottom:6px;">${p.substring(2)}</li></ul>\n`;
      } else {
        sectionsHtml += `      <p>${p}</p>\n`;
      }
    });
  });

  let faqsHtml = '';
  let faqSchemaList = [];
  (guide.faqs || []).forEach(f => {
    faqsHtml += `      <div class="faq-item" style="margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:14px;">\n        <h4 style="color:var(--text-main); font-size:1.15rem; margin-bottom:8px;">❓ ${f.q}</h4>\n        <p style="color:var(--text-light); line-height:1.8;">${f.a}</p>\n      </div>\n`;
    faqSchemaList.push({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    });
  });

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
${getHeadHtml(guide.title, guide.desc, canonicalUrl, 'article')}

  <style>
    .guide-container { max-width: 900px; margin: 40px auto 80px; padding: 0 24px; }
    .guide-article { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 44px 36px; box-shadow: var(--shadow-md); }
    .guide-article h1 { font-size: 2.2rem; font-weight: 800; color: var(--text-main); line-height: 1.35; margin-bottom: 16px; }
    .guide-meta { display: flex; gap: 16px; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; }
    .guide-article h2 { font-size: 1.5rem; color: var(--primary-light); margin: 36px 0 16px; padding-bottom: 8px; border-bottom: 2px solid rgba(59, 130, 246, 0.2); }
    .guide-article h3 { font-size: 1.22rem; color: var(--text-main); margin: 24px 0 10px; }
    .guide-article p, .guide-article li { font-size: 1.02rem; color: var(--text-light); line-height: 1.85; margin-bottom: 14px; }
    .guide-article ul, .guide-article ol { padding-right: 24px; margin-bottom: 20px; }
    .callout-box { background: var(--card-bg-subtle); border-right: 4px solid var(--primary-light); padding: 20px 24px; border-radius: var(--radius-md); margin: 28px 0; }
    .breadcrumb-nav { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 20px; }
    .breadcrumb-nav a { color: var(--primary-light); }
  </style>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "${guide.title}",
        "description": "${guide.desc}",
        "image": "https://sandoqalemara.com/assets/sandooq-logo.png",
        "author": { "@type": "Organization", "name": "صندوق العمارة" },
        "publisher": { "@type": "Organization", "name": "صندوق العمارة", "logo": { "@type": "ImageObject", "url": "https://sandoqalemara.com/assets/sandooq-logo.png" } },
        "mainEntityOfPage": { "@type": "WebPage", "@id": "${canonicalUrl}" }
      },
      {
        "@type": "FAQPage",
        "mainEntity": ${JSON.stringify(faqSchemaList)}
      }
    ]
  }
  </script>
</head>
<body>
  <!-- Header will be injected by build_landing.js -->
  <header class="site-header"></header>

  <main>
    <div class="guide-container">
      <nav class="breadcrumb-nav">
        <a href="../index.html">الرئيسية</a> &gt; 
        <a href="index.html">أدلة الإدارة</a> &gt; 
        <span>${guide.shortTitle}</span>
      </nav>

      <article class="guide-article">
        <h1>${guide.title}</h1>
        <div class="guide-meta">
          <span>📅 تم التحديث: أكتوبر 2026</span>
          <span>⏱️ ${guide.readTime || '8 دقائق قراءة'}</span>
          <span>🏷️ ${guide.category || 'إدارة عقارات'}</span>
        </div>

        <div class="callout-box">
          <p style="margin:0; font-weight:700; color:var(--text-main);">💡 خلاصة الدليل السريعة:</p>
          <p style="margin:6px 0 0; color:var(--text-light); font-size:0.95rem;">${guide.desc}</p>
        </div>

${sectionsHtml}

        <h2 style="margin-top:40px;">الأسئلة الشائعة حول الموضوع</h2>
${faqsHtml}

        <div style="margin-top:40px; background:linear-gradient(135deg, rgba(30,58,138,0.25), rgba(16,185,129,0.15)); border:1px solid var(--primary-light); border-radius:var(--radius-md); padding:32px; text-align:center;">
          <h3 style="font-size:1.35rem; color:var(--text-main); margin-bottom:10px;">إدارة عمارة ذكية وسهلة مع "صندوق العمارة"</h3>
          <p style="color:var(--text-light); max-width:650px; margin:0 auto 20px;">وداعاً لحسابات الورقة والقلم ومشاكل تحصيل المتأخرات.. نظّم مصاريف عمارتك بضغطة زر من موبايلك.</p>
          <a href="../download.html" class="btn btn-primary" style="display:inline-block; padding:12px 28px; border-radius:30px; text-decoration:none; font-weight:700;">حمّل تطبيق صندوق العمارة مجاناً</a>
        </div>
      </article>
    </div>
  </main>

  <!-- Footer will be injected by build_landing.js -->
  <footer class="site-footer"></footer>
</body>
</html>`;
}

// 4. Main Generator Routine
function main() {
  console.log('--- Step 1: Writing 50 New Tool HTML Files ---');
  let toolsCount = 0;
  allNewTools.forEach(tool => {
    const filePath = path.join(TOOLS_DIR, `${tool.slug}.html`);
    const content = generateToolHtml(tool);
    fs.writeFileSync(filePath, content, 'utf8');
    toolsCount++;
  });
  console.log(`Successfully generated ${toolsCount} tools.`);

  console.log('--- Step 2: Writing 81 New Guide HTML Files ---');
  let guidesCount = 0;
  allNewGuides.forEach(guide => {
    const filePath = path.join(GUIDES_DIR, `${guide.slug}.html`);
    const content = generateGuideHtml(guide);
    fs.writeFileSync(filePath, content, 'utf8');
    guidesCount++;
  });
  console.log(`Successfully generated ${guidesCount} guides.`);

  console.log('--- Step 3: Updating search_index.json ---');
  const searchIndexPath = path.join(DATA_DIR, 'search_index.json');
  let existingIndex = [];
  if (fs.existsSync(searchIndexPath)) {
    try {
      existingIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
    } catch(e) {
      existingIndex = [];
    }
  }

  const existingSlugs = new Set(existingIndex.map(item => item[1]));

  allNewTools.forEach(tool => {
    const slugRel = `tools/${tool.slug}`;
    if (!existingSlugs.has(slugRel)) {
      existingIndex.push([
        tool.title,
        slugRel,
        tool.desc.substring(0, 75) + '...',
        1, // Type: 1 = tool
        tool.icon || '🧮',
        tool.keywords || ''
      ]);
      existingSlugs.add(slugRel);
    }
  });

  allNewGuides.forEach(guide => {
    const slugRel = `guides/${guide.slug}`;
    if (!existingSlugs.has(slugRel)) {
      existingIndex.push([
        guide.title,
        slugRel,
        guide.desc.substring(0, 75) + '...',
        0, // Type: 0 = guide
        '📑',
        guide.keywords || ''
      ]);
      existingSlugs.add(slugRel);
    }
  });

  fs.writeFileSync(searchIndexPath, JSON.stringify(existingIndex), 'utf8');
  console.log(`Updated search_index.json. Total entries now: ${existingIndex.length}`);

  console.log('--- Step 4: Updating tools/index.html & guides/index.html ---');
  updateToolsHub();
  updateGuidesHub();

  console.log('--- Step 5: Updating sitemap.xml ---');
  updateSitemap();

  console.log('--- Step 6: Triggering build_landing.js compiler ---');
  execSync('node scripts/build_landing.js', { cwd: LANDING_DIR, stdio: 'inherit' });

  console.log('=== All 120 Guides and 70 Tools Expanded and Compiled Successfully! ===');
}

// 5. Update Tools Index Hub
function updateToolsHub() {
  const hubPath = path.join(TOOLS_DIR, 'index.html');
  if (!fs.existsSync(hubPath)) return;
  let content = fs.readFileSync(hubPath, 'utf8');

  // Update title and counter
  content = content.replace(/20 أداة/g, '70 أداة');
  content = content.replace(/\(20 أداة تفاعلية\)/g, '(70 أداة تفاعلية)');

  // Update Category Filter Buttons
  const toolsCatBarHtml = `<div class="categories-bar" id="toolCategoryFilter">
        <button class="cat-btn active" data-filter="all">🛠️ كافة الأدوات (70)</button>
        <button class="cat-btn" data-filter="finance">💵 المالية والميزانيات</button>
        <button class="cat-btn" data-filter="law">⚖️ العقود والنماذج القانونية</button>
        <button class="cat-btn" data-filter="water">💧 السباكة وشبكات المياه</button>
        <button class="cat-btn" data-filter="elevator">🛗 المصاعد والأسانسير</button>
        <button class="cat-btn" data-filter="energy">⚡ الكهرباء والطاقة والشواحن</button>
        <button class="cat-btn" data-filter="maintenance">🛠️ التشطيبات والواجهات</button>
        <button class="cat-btn" data-filter="security">🛡️ الأمن وإدارة السكان</button>
      </div>`;
  content = content.replace(/<div\s+class=["']categories-bar["']\s+id=["']toolCategoryFilter["']>[\s\S]*?<\/div>/i, toolsCatBarHtml);

  // Collect all tool files in tools/
  const toolFiles = fs.readdirSync(TOOLS_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
  let cardsHtml = '';

  toolFiles.sort().forEach(file => {
    const slug = path.basename(file, '.html');
    const fPath = path.join(TOOLS_DIR, file);
    const html = fs.readFileSync(fPath, 'utf8');
    const mTitle = html.match(/<title>([^<|]+)/i);
    const mDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const title = mTitle ? mTitle[1].trim() : slug;
    const desc = mDesc ? mDesc[1].trim() : '';

    let cat = 'maintenance';
    let icon = '🧮';
    if (slug.includes('water') || slug.includes('pump') || slug.includes('drain') || slug.includes('leak') || slug.includes('sewage') || slug.includes('tank')) {
      cat = 'water';
      icon = '💧';
    } else if (slug.includes('elevator')) {
      cat = 'elevator';
      icon = '🛗';
    } else if (slug.includes('electric') || slug.includes('solar') || slug.includes('ev-') || slug.includes('sensor') || slug.includes('generator-fuel') || slug.includes('lighting') || slug.includes('battery')) {
      cat = 'energy';
      icon = '⚡';
    } else if (slug.includes('bylaws') || slug.includes('notice') || slug.includes('contract') || slug.includes('election') || slug.includes('meeting') || slug.includes('dispute') || slug.includes('inspection') || slug.includes('guard') || slug.includes('settlement') || slug.includes('permit') || slug.includes('incident') || slug.includes('assembly') || slug.includes('legal')) {
      cat = 'law';
      icon = '⚖️';
    } else if (slug.includes('fee') || slug.includes('arrears') || slug.includes('deposit') || slug.includes('budget') || slug.includes('cash') || slug.includes('receipt') || slug.includes('handover') || slug.includes('sinking') || slug.includes('penalty') || slug.includes('burn') || slug.includes('yield') || slug.includes('depreciation') || slug.includes('splitter')) {
      cat = 'finance';
      icon = '💵';
    } else if (slug.includes('cctv') || slug.includes('fire') || slug.includes('card-log') || slug.includes('survey') || slug.includes('delivery') || slug.includes('parking') || slug.includes('lost') || slug.includes('whatsapp') || slug.includes('visitor')) {
      cat = 'security';
      icon = '🛡️';
    } else {
      cat = 'maintenance';
      icon = '🛠️';
    }

    cardsHtml += `      <article class="tool-hub-card" data-category="${cat}">
        <div>
          <div class="tool-icon-box">${icon}</div>
          <h2>${title}</h2>
          <p>${desc}</p>
        </div>
        <a href="${file}" class="button primary" style="width: 100%; text-align: center; margin-top: auto;">
          فتح الأداة مجاناً ↗
        </a>
      </article>\n\n`;
  });

  const gridRegex = /(<div\s+class=["']tools-hub-grid["'][^>]*>)[\s\S]*?(<\/div>\s*<\/main>)/i;
  if (gridRegex.test(content)) {
    content = content.replace(gridRegex, `$1\n\n${cardsHtml}    $2`);
    fs.writeFileSync(hubPath, content, 'utf8');
    console.log(`Updated tools/index.html with ${toolFiles.length} tool cards.`);
  } else {
    console.warn('Could not match tools-hub-grid in tools/index.html');
  }
}

// 6. Update Guides Index Hub
function updateGuidesHub() {
  const hubPath = path.join(GUIDES_DIR, 'index.html');
  if (!fs.existsSync(hubPath)) return;
  let content = fs.readFileSync(hubPath, 'utf8');

  // Update title and counter
  content = content.replace(/39 دليلاً/g, '120 دليلاً');
  content = content.replace(/39 دليلاً عملياً/g, '120 دليلاً عملياً');

  // Update Category Filter Buttons
  const guidesCatBarHtml = `<div class="categories-bar" id="guideCategoryFilter">
        <button class="cat-btn active" data-filter="all">📚 كافة الأدلة (120)</button>
        <button class="cat-btn" data-filter="law">⚖️ الشق القانوني والنزاعات</button>
        <button class="cat-btn" data-filter="finance">📊 المالية والمحاسبة</button>
        <button class="cat-btn" data-filter="water">💧 السباكة والصرف والمياه</button>
        <button class="cat-btn" data-filter="elevator">⚡ المصاعد والطاقة والكهرباء</button>
        <button class="cat-btn" data-filter="maintenance">🛠️ الهندسة والسلامة والترميم</button>
        <button class="cat-btn" data-filter="security">🛡️ الأمن والسلامة والحراسة</button>
        <button class="cat-btn" data-filter="garage">🅿️ الجراجات واللاندسكيب</button>
        <button class="cat-btn" data-filter="collection">📱 الجيرة الطيبة والكومباوند</button>
      </div>`;
  content = content.replace(/<div\s+class=["']categories-bar["']\s+id=["']guideCategoryFilter["']>[\s\S]*?<\/div>/i, guidesCatBarHtml);

  const guideFiles = fs.readdirSync(GUIDES_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');
  let cardsHtml = '';

  guideFiles.sort().forEach(file => {
    const slug = path.basename(file, '.html');
    const fPath = path.join(GUIDES_DIR, file);
    const html = fs.readFileSync(fPath, 'utf8');
    const mTitle = html.match(/<title>([^<|]+)/i);
    const mDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const title = mTitle ? mTitle[1].trim() : slug;
    const desc = mDesc ? mDesc[1].trim() : '';

    let cat = 'maintenance';
    let catBadge = '🛠️ صيانة وتشغيل';
    let icon = '📖';

    if (slug.includes('law') || slug.includes('court') || slug.includes('heirs') || slug.includes('reconciliation') || slug.includes('seizing') || slug.includes('dispute') || slug.includes('occupants') || slug.includes('bylaws') || slug.includes('notice') || slug.includes('pet-ownership') || slug.includes('cell-tower') || slug.includes('heritage')) {
      cat = 'law';
      catBadge = '⚖️ الشق القانوني والنزاعات';
      icon = '⚖️';
    } else if (slug.includes('budget') || slug.includes('fund') || slug.includes('report') || slug.includes('deposit') || slug.includes('bank') || slug.includes('tax') || slug.includes('petty-cash') || slug.includes('audit') || slug.includes('currency') || slug.includes('debt') || slug.includes('contingency')) {
      cat = 'finance';
      catBadge = '📊 المالية والمحاسبة';
      icon = '💵';
    } else if (slug.includes('water') || slug.includes('pump') || slug.includes('drain') || slug.includes('leak') || slug.includes('sewage') || slug.includes('tank') || slug.includes('filtration') || slug.includes('riser') || slug.includes('harvesting')) {
      cat = 'water';
      catBadge = '💧 السباكة والصرف والمياه';
      icon = '💧';
    } else if (slug.includes('elevator') || slug.includes('electric') || slug.includes('solar') || slug.includes('power') || slug.includes('ev-') || slug.includes('generator') || slug.includes('surge') || slug.includes('inverter') || slug.includes('satellite') || slug.includes('energy-audit')) {
      cat = 'elevator';
      catBadge = '⚡ المصاعد والطاقة والكهرباء';
      icon = '🛗';
    } else if (slug.includes('cctv') || slug.includes('guard') || slug.includes('fire') || slug.includes('security') || slug.includes('access') || slug.includes('burglary') || slug.includes('emergency') || slug.includes('insurance') || slug.includes('pest')) {
      cat = 'security';
      catBadge = '🛡️ الأمن والسلامة والحراسة';
      icon = '🛡️';
    } else if (slug.includes('garage') || slug.includes('parking') || slug.includes('garden') || slug.includes('scooter') || slug.includes('barrier') || slug.includes('delivery-blocking')) {
      cat = 'garage';
      catBadge = '🅿️ الجراجات واللاندسكيب';
      icon = '🅿️';
    } else {
      cat = 'collection';
      catBadge = '📱 الجيرة الطيبة والكومباوند';
      icon = '🏢';
    }

    cardsHtml += `      <article class="guide-hub-card" data-category="${cat}">
        <div>
          <span class="guide-meta-badge">${catBadge}</span>
          <div class="guide-icon-box">${icon}</div>
          <h2>${title}</h2>
          <p>${desc}</p>
        </div>
        <a href="${file}" class="button primary" style="width: 100%; text-align: center; margin-top: auto;">
          قراءة الدليل كاملاً ↗
        </a>
      </article>\n\n`;
  });

  const gridRegex = /(<div\s+class=["']guides-hub-grid["'][^>]*>)[\s\S]*?(<\/div>\s*<\/main>)/i;
  if (gridRegex.test(content)) {
    content = content.replace(gridRegex, `$1\n\n${cardsHtml}    $2`);
    fs.writeFileSync(hubPath, content, 'utf8');
    console.log(`Updated guides/index.html with ${guideFiles.length} guide cards.`);
  } else {
    console.warn('Could not match guides-hub-grid in guides/index.html');
  }
}

// 7. Update Sitemap.xml
function updateSitemap() {
  const sitemapPath = path.join(LANDING_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');

  const today = new Date().toISOString().slice(0, 10);
  let newEntries = '';

  const addUrl = (loc) => {
    if (!sitemap.includes(loc)) {
      newEntries += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }
  };

  allNewTools.forEach(t => addUrl(`https://sandoqalemara.com/tools/${t.slug}.html`));
  allNewGuides.forEach(g => addUrl(`https://sandoqalemara.com/guides/${g.slug}.html`));

  if (newEntries) {
    sitemap = sitemap.replace('</urlset>', `${newEntries}</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log('sitemap.xml updated with new pages.');
  }
}

main();
