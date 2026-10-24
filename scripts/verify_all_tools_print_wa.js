const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'tools');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');

console.log(`Auditing all ${files.length} tools for Print, WhatsApp & Script Engine...`);

let missingPrint = [];
let missingWhatsApp = [];
let missingScript = [];

files.forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  const hasPrint = c.includes('btn-print') || c.includes('window.print') || c.includes('sandooqPrintReport');
  const hasWa = c.includes('btn-share-whatsapp') || c.includes('btn-whatsapp') || c.includes('btnShareCalcWhatsApp') || c.includes('copyWhatsAppBtn') || c.includes('copyElecWaBtn') || c.includes('copyWaterWaBtn') || c.includes('copyRoofWaBtn') || c.includes('copyDepWaBtn') || c.includes('copyCctvWaBtn') || c.includes('copyCommWaBtn') || c.includes('copyPettyWaBtn') || c.includes('copyWhatsAppMessage') || c.includes('copyProjectNotice') || c.includes('sandooqShareWhatsApp');
  const hasScript = c.includes('tool_print_share.js');

  if (!hasPrint) missingPrint.push(f);
  if (!hasWa) missingWhatsApp.push(f);
  if (!hasScript) missingScript.push(f);
});

console.log(`Missing Print Button: ${missingPrint.length} ${JSON.stringify(missingPrint)}`);
console.log(`Missing WhatsApp Button: ${missingWhatsApp.length} ${JSON.stringify(missingWhatsApp)}`);
console.log(`Missing tool_print_share.js: ${missingScript.length} ${JSON.stringify(missingScript)}`);

if (missingPrint.length === 0 && missingWhatsApp.length === 0 && missingScript.length === 0) {
  console.log('\n🎉 SUCCESS: All 70 tools have Print buttons, WhatsApp buttons, and tool_print_share.js included!');
} else {
  process.exit(1);
}
