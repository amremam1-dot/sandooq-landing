const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'tools');

const targetTools = [
  'building-bylaws-generator.html',
  'assembly-minutes-generator.html',
  'treasury-handover-generator.html',
  'legal-notice-generator.html',
  'maintenance-contract-generator.html',
  'resident-directory-card-generator.html',
  'guard-settlement-calculator.html',
  'preventive-maintenance-scheduler.html',
  'maintenance-budget-planner.html',
  'building-arrears-calculator.html'
];

targetTools.forEach(filename => {
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add WhatsApp share button if missing
  if (!content.includes('btn-share-whatsapp') && !content.includes('btnShareCalcWhatsApp') && !content.includes('btnShareWhatsApp') && !content.includes('id="btn-whatsapp-action"')) {
    // 1. Look for existing print button
    const printBtnRegex = /(<button[^>]*class=["'][^"']*(btn-action|btn)[^"']*["'][^>]*>[\s\S]*?طباعة[\s\S]*?<\/button>)/i;
    if (printBtnRegex.test(content)) {
      content = content.replace(printBtnRegex, `<button type="button" class="btn-action btn-whatsapp-action" id="btn-share-whatsapp" style="margin-left: 8px;">إرسال واتساب 📲</button>\n          $1`);
      modified = true;
    } else if (content.includes('copyProjectNotice()')) {
      content = content.replace(
        `<button type="button" onclick="copyProjectNotice()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الإعلان 📋</button>`,
        `<button type="button" class="btn btn-whatsapp-action" id="btn-share-whatsapp" style="padding: 4px 10px; font-size: 0.85rem; background: #25d366; color: #fff;">إرسال واتساب 📲</button>
              <button type="button" onclick="copyProjectNotice()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الإعلان 📋</button>`
      );
      modified = true;
    } else if (content.includes('copyWhatsAppMessage()')) {
      content = content.replace(
        `<button type="button" onclick="copyWhatsAppMessage()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الرسالة 📋</button>`,
        `<button type="button" class="btn btn-whatsapp-action" id="btn-share-whatsapp" style="padding: 4px 10px; font-size: 0.85rem; background: #25d366; color: #fff;">إرسال واتساب 📲</button>
              <button type="button" onclick="copyWhatsAppMessage()" class="btn" style="padding: 4px 10px; font-size: 0.85rem; background: var(--secondary-color); color: #fff;">نسخ الرسالة 📋</button>`
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added WhatsApp button to: ${filename}`);
  } else {
    console.log(`ℹ️ Already has WhatsApp button: ${filename}`);
  }
});

console.log('\nButtons audit finished.');
