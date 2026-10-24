const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'tools');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');

console.log(`Inspecting ${files.length} tools...`);

const summary = {
  hasResultsBox: [],
  hasResultBox: [],
  hasPrintableArea: [],
  hasReceiptPaper: [],
  hasOutputsCol: [],
  hasGeneratorPreview: [],
  hasHtmlPreview: [],
  hasPrintButton: [],
  missingPrintButton: []
};

files.forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  
  if (c.includes('class="results-box"') || c.includes("class='results-box'")) summary.hasResultsBox.push(f);
  if (c.includes('class="result-box"') || c.includes("class='result-box'")) summary.hasResultBox.push(f);
  if (c.includes('printable-area')) summary.hasPrintableArea.push(f);
  if (c.includes('receipt-paper')) summary.hasReceiptPaper.push(f);
  if (c.includes('calc-outputs-col')) summary.hasOutputsCol.push(f);
  if (c.includes('generator-preview')) summary.hasGeneratorPreview.push(f);
  if (c.includes('generator-html-preview')) summary.hasHtmlPreview.push(f);
  
  const hasPrint = c.includes('window.print') || c.includes('btn-print') || c.includes('btn-print-result');
  if (hasPrint) {
    summary.hasPrintButton.push(f);
  } else {
    summary.missingPrintButton.push(f);
  }
});

console.log('ResultsBox count:', summary.hasResultsBox.length);
console.log('ResultBox (singular) count:', summary.hasResultBox.length);
console.log('PrintableArea count:', summary.hasPrintableArea.length);
console.log('ReceiptPaper count:', summary.hasReceiptPaper.length);
console.log('OutputsCol count:', summary.hasOutputsCol.length);
console.log('GeneratorPreview count:', summary.hasGeneratorPreview.length);
console.log('Missing Print Button count:', summary.missingPrintButton.length, summary.missingPrintButton);
