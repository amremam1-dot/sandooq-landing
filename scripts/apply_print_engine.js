const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const toolsDir = path.join(rootDir, 'tools');
const stylesPath = path.join(rootDir, 'styles.css');
const genExpPath = path.join(__dirname, 'generate_expansion.js');

console.log('=== Step 1: Update styles.css with Absolute Print Isolation Rules ===');

const absolutePrintCss = `
/* ==========================================================================
   Sandooq El-Amara — Absolute Print Isolation Rules
   Guarantees 0% website chrome leak during print preview & output.
   ========================================================================== */
#sandooq-isolated-print-stage {
  display: none !important;
}

@media print {
  body.sandooq-printing-active > *:not(#sandooq-isolated-print-stage) {
    display: none !important;
  }
  
  body.sandooq-printing-active #sandooq-isolated-print-stage {
    display: block !important;
    position: static !important;
    width: 100% !important;
    background: #ffffff !important;
    color: #0f172a !important;
    margin: 0 !important;
    padding: 0 !important;
  }
}
`;

let cssContent = fs.readFileSync(stylesPath, 'utf8');
if (!cssContent.includes('Absolute Print Isolation Rules')) {
  cssContent += '\n' + absolutePrintCss;
  fs.writeFileSync(stylesPath, cssContent, 'utf8');
  console.log('✅ Added Absolute Print Isolation Rules to styles.css');
}

console.log('\n=== Step 2: Update generate_expansion.js for 50 Expansion Tools ===');
let genExpContent = fs.readFileSync(genExpPath, 'utf8');

// Update action buttons in generate_expansion.js to use window.sandooqPrintReport and window.sandooqShareWhatsApp
const oldActionButtonsBlock = `      // Action Buttons
      const btnCopy = document.getElementById('btn-copy-result');
      if (btnCopy) {
        btnCopy.addEventListener('click', function() {
          const out = window._lastCalcOutput;
          if (!out) return;
          const text = \${isGen ? 'out.outputText || ""' : \`
            Object.entries(out).map(([k,v]) => k + ': ' + v).join('\\\\n')
          \`};
          navigator.clipboard.writeText(text).then(() => {
            const old = btnCopy.innerText;
            btnCopy.innerText = '✅ تم النسخ بنجاح!';
            setTimeout(() => { btnCopy.innerText = old; }, 2000);
          });
        });
      }

      const btnWa = document.getElementById('btn-share-whatsapp');
      if (btnWa) {
        btnWa.addEventListener('click', function() {
          const out = window._lastCalcOutput;
          if (!out) return;
          const text = encodeURIComponent(\${isGen ? 'out.outputText || ""' : \`
            'نتائج \${tool.shortTitle}:\\\\n' + Object.values(out).slice(0,4).join('\\\\n') + '\\\\n\\\\nعبر تطبيق صندوق العمارة: https://sandoqalemara.com/tools/\${tool.slug}.html'
          \`});
          window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
        });
      }

      const btnPrint = document.getElementById('btn-print-result');
      if (btnPrint) {
        btnPrint.addEventListener('click', function() {
          window.print();
        });
      }`;

const newActionButtonsBlock = `      // Action Buttons
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
            const text = \${isGen ? 'out.outputText || ""' : 'JSON.stringify(out, null, 2)'};
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
      }`;

if (genExpContent.includes('const btnWa = document.getElementById(\'btn-share-whatsapp\');')) {
  // Replace the action buttons logic
  const actionRegex = /\/\/\s*Action Buttons[\s\S]*?btnPrint\.addEventListener\('click'[\s\S]*?\}\);\s*\}/;
  if (actionRegex.test(genExpContent)) {
    genExpContent = genExpContent.replace(actionRegex, newActionButtonsBlock);
    console.log('✅ Replaced action buttons block in generate_expansion.js');
  }
}

// Ensure tool_print_share.js script tag is injected in the HTML returned by generate_expansion.js
if (!genExpContent.includes('tool_print_share.js')) {
  genExpContent = genExpContent.replace(
    '  <script>\n    (function() {\n      const inputsList',
    '  <script src="../js/tool_print_share.js"></script>\n  <script>\n    (function() {\n      const inputsList'
  );
  console.log('✅ Added tool_print_share.js script tag to generate_expansion.js');
}

fs.writeFileSync(genExpPath, genExpContent, 'utf8');

console.log('\n=== Step 3: Upgrade 20 Original Tools with tool_print_share.js ===');

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

  // Add tool_print_share.js before closing </body> if not present
  if (!content.includes('tool_print_share.js')) {
    content = content.replace('</body>', '  <script src="../js/tool_print_share.js"></script>\n</body>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Injected tool_print_share.js into: ${filename}`);
  } else {
    console.log(`ℹ️ Already has tool_print_share.js: ${filename}`);
  }
});

console.log('\nAll tools successfully wired to Universal Print & WhatsApp Engine.');
