#!/usr/bin/env node
/**
 * challenger_adversarial_m2.js
 * Independent Adversarial Challenger Suite for Milestone 2 (R1: Web Simulator)
 * Authored by: Challenger 1 (Empirical Challenger)
 * Tests race conditions, timer cancellations, input lockdown during processing,
 * numeral normalization, DOM isolation, and CSS specificity.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- Minimal DOM Mock for Headless Execution ---
function createMockElement(tag, attrs = {}) {
  const listeners = {};
  const children = [];
  const classListSet = new Set((attrs.class || '').split(/\s+/).filter(Boolean));

  const el = {
    tagName: tag.toUpperCase(),
    nodeType: 1,
    id: attrs.id || '',
    attributes: { ...attrs },
    style: {},
    _value: attrs.value !== undefined ? String(attrs.value) : '',
    get value() { return this._value; },
    set value(v) { this._value = (v === null || v === undefined) ? '' : String(v); },
    disabled: false,
    textContent: attrs.textContent || '',
    innerHTML: attrs.innerHTML || '',
    children,
    parentNode: null,

    classList: {
      add: (...cls) => cls.forEach(c => classListSet.add(c)),
      remove: (...cls) => cls.forEach(c => classListSet.delete(c)),
      contains: (c) => classListSet.has(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) classListSet.add(c); else classListSet.delete(c);
          return force;
        }
        if (classListSet.has(c)) { classListSet.delete(c); return false; }
        classListSet.add(c); return true;
      },
      toString: () => Array.from(classListSet).join(' ')
    },

    getAttribute: (name) => {
      if (name === 'class') return Array.from(classListSet).join(' ');
      if (name === 'id') return el.id;
      if (name === 'value') return el.value;
      return el.attributes[name] !== undefined ? el.attributes[name] : null;
    },

    setAttribute: (name, val) => {
      const sVal = String(val);
      el.attributes[name] = sVal;
      if (name === 'id') el.id = sVal;
      if (name === 'class') {
        classListSet.clear();
        sVal.split(/\s+/).filter(Boolean).forEach(c => classListSet.add(c));
      }
      if (name === 'value') el.value = sVal;
    },

    removeAttribute: (name) => {
      delete el.attributes[name];
      if (name === 'class') classListSet.clear();
    },

    appendChild: (child) => {
      child.parentNode = el;
      children.push(child);
      return child;
    },

    querySelector: (sel) => querySelectorAllDeep(el, sel)[0] || null,
    querySelectorAll: (sel) => querySelectorAllDeep(el, sel),

    closest: (sel) => {
      let cur = el;
      while (cur) {
        if (matchesSelector(cur, sel)) return cur;
        cur = cur.parentNode;
      }
      return null;
    },

    addEventListener: (type, fn) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },

    removeEventListener: (type, fn) => {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter(f => f !== fn);
    },

    dispatchEvent: (event) => {
      event.target = el;
      event.currentTarget = el;
      let cur = el;
      while (cur) {
        if (cur._listeners && cur._listeners[event.type]) {
          for (const fn of cur._listeners[event.type]) {
            fn(event);
            if (event._stopped) return;
          }
        }
        cur = cur.parentNode;
      }
    },

    scrollIntoView: () => {}
  };

  el._listeners = listeners;
  return el;
}

function matchesSelector(el, sel) {
  if (!el || el.nodeType !== 1) return false;
  sel = sel.trim();
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) return el.classList.contains(sel.slice(1));
  if (sel.startsWith('[') && sel.endsWith(']')) {
    const inner = sel.slice(1, -1);
    if (inner.includes('=')) {
      const [attr, rawVal] = inner.split('=');
      const val = rawVal.replace(/^["']|["']$/g, '');
      return el.getAttribute(attr.trim()) === val;
    }
    return el.getAttribute(inner.trim()) !== null;
  }
  return el.tagName.toLowerCase() === sel.toLowerCase();
}

function querySelectorAllDeep(root, sel) {
  const results = [];
  function recurse(node) {
    if (!node || !node.children) return;
    for (const child of node.children) {
      if (matchesSelector(child, sel)) results.push(child);
      recurse(child);
    }
  }
  recurse(root);
  return results;
}

function buildSimulatorDOM() {
  const body = createMockElement('body');
  const docElement = createMockElement('html');

  const container = createMockElement('div', { id: 'app-simulator', class: 'sandooq-simulator' });
  body.appendChild(container);

  // Screen 1: Units
  const screenUnits = createMockElement('div', { id: 'sim-screen-units', class: 'sim-screen' });
  const resetBtn = createMockElement('button', { id: 'sim-top-reset-btn', 'data-action': 'reset' });
  const fundBal = createMockElement('span', { id: 'sim-fund-balance' });
  const collRate = createMockElement('span', { id: 'sim-collection-rate' });
  const rateBadge = createMockElement('span', { id: 'sim-rate-badge' });
  const toast = createMockElement('div', { id: 'sim-toast' });

  // Apt 101
  const card101 = createMockElement('div', { id: 'sim-unit-card-101', class: 'sim-unit-card is-paid' });
  const badge101 = createMockElement('span', { id: 'sim-status-badge-101', class: 'sim-badge sim-badge-paid' });
  const viewBtn101 = createMockElement('button', { id: 'sim-collect-btn-101', 'data-action': 'view-receipt', 'data-unit': '101' });
  card101.appendChild(badge101);
  card101.appendChild(viewBtn101);

  // Apt 102
  const card102 = createMockElement('div', { id: 'sim-unit-card-102', class: 'sim-unit-card is-unpaid' });
  const badge102 = createMockElement('span', { id: 'sim-status-badge-102', class: 'sim-badge sim-badge-unpaid' });
  const collectBtn102 = createMockElement('button', { id: 'sim-collect-btn-102', 'data-action': 'open-payment', 'data-unit': '102' });
  card102.appendChild(badge102);
  card102.appendChild(collectBtn102);

  screenUnits.appendChild(resetBtn);
  screenUnits.appendChild(fundBal);
  screenUnits.appendChild(collRate);
  screenUnits.appendChild(rateBadge);
  screenUnits.appendChild(card101);
  screenUnits.appendChild(card102);
  container.appendChild(screenUnits);
  container.appendChild(toast);

  // Screen 2: Payment Modal
  const modal = createMockElement('div', { id: 'sim-payment-modal', class: 'sim-modal' });
  const backdrop = createMockElement('div', { class: 'sim-modal-backdrop', 'data-action': 'close-modal' });
  const closeBtn = createMockElement('button', { id: 'sim-modal-close-btn', class: 'sim-btn-close', 'data-action': 'close-modal' });
  const amountInput = createMockElement('input', { id: 'sim-input-amount', class: 'sim-amount-input', value: '500' });
  const chip500 = createMockElement('button', { class: 'sim-chip', 'data-amount': '500' });
  const chip1000 = createMockElement('button', { class: 'sim-chip', 'data-amount': '1000' });
  const chip1500 = createMockElement('button', { class: 'sim-chip', 'data-amount': '1500' });
  const cashBtn = createMockElement('button', { id: 'sim-treasury-cash', class: 'sim-treasury-option', 'data-treasury': 'cash' });
  const bankBtn = createMockElement('button', { id: 'sim-treasury-bank', class: 'sim-treasury-option', 'data-treasury': 'bank' });
  const confirmBtn = createMockElement('button', { id: 'sim-submit-payment-btn', 'data-action': 'confirm-payment' });

  modal.appendChild(backdrop);
  modal.appendChild(closeBtn);
  modal.appendChild(amountInput);
  modal.appendChild(chip500);
  modal.appendChild(chip1000);
  modal.appendChild(chip1500);
  modal.appendChild(cashBtn);
  modal.appendChild(bankBtn);
  modal.appendChild(confirmBtn);
  container.appendChild(modal);

  // Screen 3: WhatsApp Receipt
  const screenReceipt = createMockElement('div', { id: 'sim-screen-receipt', class: 'sim-screen' });
  const outUnit = createMockElement('span', { id: 'sim-out-unit' });
  const outResident = createMockElement('span', { id: 'sim-out-resident' });
  const outDate = createMockElement('span', { id: 'sim-out-date' });
  const outTreasury = createMockElement('span', { id: 'sim-out-treasury' });
  const outAmount = createMockElement('span', { id: 'sim-out-amount' });
  const outReceiptId = createMockElement('span', { id: 'sim-out-receipt-id' });
  const replayBtn = createMockElement('button', { id: 'sim-replay-loop-btn', 'data-action': 'replay' });

  screenReceipt.appendChild(outUnit);
  screenReceipt.appendChild(outResident);
  screenReceipt.appendChild(outDate);
  screenReceipt.appendChild(outTreasury);
  screenReceipt.appendChild(outAmount);
  screenReceipt.appendChild(outReceiptId);
  screenReceipt.appendChild(replayBtn);
  container.appendChild(screenReceipt);

  const documentMock = {
    documentElement: docElement,
    body,
    getElementById: (id) => {
      if (id === 'app-simulator') return container;
      return querySelectorAllDeep(container, '#' + id)[0] || null;
    },
    querySelector: (sel) => querySelectorAllDeep(body, sel)[0] || null,
    querySelectorAll: (sel) => querySelectorAllDeep(body, sel),
    addEventListener: (type, fn) => {
      if (!body._listeners[type]) body._listeners[type] = [];
      body._listeners[type].push(fn);
    },
    removeEventListener: (type, fn) => {
      if (!body._listeners[type]) return;
      body._listeners[type] = body._listeners[type].filter(f => f !== fn);
    },
    readyState: 'complete'
  };

  return {
    documentMock,
    container,
    elements: {
      screenUnits, resetBtn, fundBal, collRate, rateBadge, toast,
      card101, badge101, viewBtn101,
      card102, badge102, collectBtn102,
      modal, backdrop, closeBtn, amountInput, chip500, chip1000, chip1500, cashBtn, bankBtn, confirmBtn,
      screenReceipt, outUnit, outResident, outDate, outTreasury, outAmount, outReceiptId, replayBtn
    }
  };
}

function createSimulatorInstance() {
  const { documentMock, container, elements } = buildSimulatorDOM();
  const simPath = path.join(__dirname, '..', 'js', 'simulator.js');
  const code = fs.readFileSync(simPath, 'utf8');

  const sandbox = {
    window: {},
    document: documentMock,
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    Date: global.Date,
    Number: global.Number,
    parseInt: global.parseInt,
    isNaN: global.isNaN,
    Math: global.Math,
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };
  sandbox.global = sandbox.window;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = documentMock;

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  return { sim: sandbox.window.SandooqSimulator, container, elements, sandbox, documentMock };
}

function click(el) {
  const event = {
    type: 'click',
    target: el,
    currentTarget: el,
    preventDefault: () => {},
    stopPropagation: () => {},
    _stopped: false
  };
  el.dispatchEvent(event);
}

function inputEvent(el, val) {
  el.value = val;
  const event = {
    type: 'input',
    target: el,
    currentTarget: el,
    preventDefault: () => {},
    stopPropagation: () => {},
    _stopped: false
  };
  el.dispatchEvent(event);
}

const tests = [];
let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  tests.push({ desc, fn });
}

async function run() {
  console.log('='.repeat(78));
  console.log('  CHALLENGER 1 EMPIRICAL ADVERSARIAL AUDIT — Milestone 2 Remediation');
  console.log('='.repeat(78) + '\n');

  // Group 1: Race conditions & Timer cancellation
  it('ADV-1.1: Clicking modal backdrop during payment delay cancels timer and prevents screen jump', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102); // screen 2
    click(elements.confirmBtn); // starts 350ms delay
    if (!sim.getState().isProcessing) throw new Error('isProcessing must be true');

    // Click backdrop at 60ms
    await new Promise(r => setTimeout(r, 60));
    click(elements.backdrop);

    if (sim.getState().activeScreen !== 1) throw new Error('Clicking backdrop should close to screen 1');
    if (sim.getState().isProcessing) throw new Error('isProcessing must be cleared after cancel');

    // Wait 400ms for original timer to expire
    await new Promise(r => setTimeout(r, 400));
    if (sim.getState().activeScreen === 3) throw new Error('Phantom jump! Timer fired and jumped to receipt screen');
    if (sim.getState().activeScreen !== 1) throw new Error('Screen must stay at 1');
  });

  it('ADV-1.2: Calling setScreen(1) during payment delay cancels timer and prevents screen jump', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    click(elements.confirmBtn);

    await new Promise(r => setTimeout(r, 50));
    sim.setScreen(1);

    await new Promise(r => setTimeout(r, 400));
    if (sim.getState().activeScreen !== 1) throw new Error('setScreen(1) did not stay at 1');
    if (sim.getState().isProcessing) throw new Error('isProcessing not cleared');
  });

  it('ADV-1.3: Calling replay() during payment delay aborts in-flight signing cleanly', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    click(elements.confirmBtn);

    await new Promise(r => setTimeout(r, 50));
    sim.replay();

    if (sim.getState().activeScreen !== 1) throw new Error('Replay should return to screen 1');
    if (sim.getState().isProcessing) throw new Error('Replay should clear isProcessing');

    await new Promise(r => setTimeout(r, 400));
    if (sim.getState().activeScreen !== 1) throw new Error('Dangling timer jumped screen after replay');
  });

  it('ADV-1.4: Confirm button state is properly restored if modal is closed and reopened during delay', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    click(elements.confirmBtn);

    await new Promise(r => setTimeout(r, 40));
    click(elements.closeBtn);

    // Reopen modal immediately
    click(elements.collectBtn102);
    if (sim.getState().activeScreen !== 2) throw new Error('Modal did not reopen');
    if (sim.getState().isProcessing) throw new Error('isProcessing remains locked');
    if (elements.confirmBtn.disabled) throw new Error('Confirm button is still disabled after reopen');
  });

  // Group 2: Lockdown during isProcessing
  it('ADV-2.1: Manual input typing is completely ignored while isProcessing is true', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    click(elements.confirmBtn); // initial 500

    await new Promise(r => setTimeout(r, 30));
    inputEvent(elements.amountInput, '99999');

    // Amount must not update
    if (sim.getState().paymentAmount !== 500) {
      throw new Error(`Amount changed during isProcessing! Got ${sim.getState().paymentAmount}`);
    }

    await new Promise(r => setTimeout(r, 400));
    if (sim.getState().units.find(u => u.id === 102).amount !== 500) {
      throw new Error('Paid unit recorded mutated amount from blocked input');
    }
  });

  it('ADV-2.2: Treasury option selection (cash vs bank) is ignored while isProcessing is true', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102); // default cash
    click(elements.confirmBtn);

    await new Promise(r => setTimeout(r, 30));
    click(elements.bankBtn);

    if (sim.getState().treasury !== 'cash') {
      throw new Error(`Treasury changed during isProcessing! Got ${sim.getState().treasury}`);
    }

    await new Promise(r => setTimeout(r, 400));
    if (sim.getState().units.find(u => u.id === 102).treasury !== 'cash') {
      throw new Error('Paid unit recorded mutated treasury from blocked click');
    }
  });

  it('ADV-2.3: Preset chips (500/1000/1500) are completely ignored while isProcessing is true', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    click(elements.confirmBtn); // 500

    await new Promise(r => setTimeout(r, 30));
    click(elements.chip1000);
    click(elements.chip1500);

    if (sim.getState().paymentAmount !== 500) {
      throw new Error(`Preset chip mutated paymentAmount during isProcessing! Got ${sim.getState().paymentAmount}`);
    }

    await new Promise(r => setTimeout(r, 400));
    if (sim.getState().units.find(u => u.id === 102).amount !== 500) {
      throw new Error('Paid unit recorded mutated preset amount');
    }
  });

  // Group 3: Arabic and Persian Numeral Normalization
  it('ADV-3.1: Normalizes pure Eastern Arabic digits (١٠٠٠, ٥٠٠, ١٥٠٠)', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '١٠٠٠');
    if (sim.getState().paymentAmount !== 1000) throw new Error(`Expected 1000, got ${sim.getState().paymentAmount}`);

    inputEvent(elements.amountInput, '١٥٠٠');
    if (sim.getState().paymentAmount !== 1500) throw new Error(`Expected 1500, got ${sim.getState().paymentAmount}`);

    inputEvent(elements.amountInput, '٥٠٠');
    if (sim.getState().paymentAmount !== 500) throw new Error(`Expected 500, got ${sim.getState().paymentAmount}`);
  });

  it('ADV-3.2: Normalizes Persian digits (۱۰۰۰, ۱۵۰۰, ۵۰۰)', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '۱۰۰۰');
    if (sim.getState().paymentAmount !== 1000) throw new Error(`Expected 1000, got ${sim.getState().paymentAmount}`);

    inputEvent(elements.amountInput, '۱۵۰۰');
    if (sim.getState().paymentAmount !== 1500) throw new Error(`Expected 1500, got ${sim.getState().paymentAmount}`);
  });

  it('ADV-3.3: Normalizes mixed Arabic and Western digits (١500, 10٠0)', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '١500');
    if (sim.getState().paymentAmount !== 1500) throw new Error(`Expected 1500, got ${sim.getState().paymentAmount}`);

    inputEvent(elements.amountInput, '10٠0');
    if (sim.getState().paymentAmount !== 1000) throw new Error(`Expected 1000, got ${sim.getState().paymentAmount}`);
  });

  it('ADV-3.4: Handles Arabic text, currency symbols, and zero fallback safely', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '١٢٠٠ ج.م');
    if (sim.getState().paymentAmount !== 1200) throw new Error(`Expected 1200, got ${sim.getState().paymentAmount}`);

    inputEvent(elements.amountInput, '٠');
    if (sim.getState().paymentAmount !== 0) throw new Error('Input ٠ should be 0');
    click(elements.confirmBtn);
    if (sim.getState().paymentAmount !== 500) throw new Error('0 amount must fallback to 500 on confirm');
    await new Promise(r => setTimeout(r, 400));
  });

  // Group 4: Deep Copy & Isolation
  it('ADV-4.1: getState() deep-clones units array preventing external mutation', async () => {
    const { sim } = createSimulatorInstance();
    const st1 = sim.getState();
    st1.units[1].resident = 'Attacker Name';
    st1.units.length = 0;

    const st2 = sim.getState();
    if (st2.units.length !== 4) throw new Error('Internal units array was emptied via external reference!');
    if (st2.units[1].resident === 'Attacker Name') throw new Error('Internal resident name was modified via shallow copy!');
  });

  // Group 5: CSS Specificity & DOM Architecture Audit
  it('ADV-5.1: styles.css contains high-specificity rules for light-theme active chips and treasury', async () => {
    const cssPath = path.join(__dirname, '..', 'styles.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    if (!css.includes('body.light-theme .sim-chip.is-selected')) {
      throw new Error('Missing body.light-theme .sim-chip.is-selected in styles.css');
    }
    if (!css.includes('body.light-theme .sim-treasury-option.is-active')) {
      throw new Error('Missing body.light-theme .sim-treasury-option.is-active in styles.css');
    }
    if (!css.includes('body.light-theme .sim-prompt-banner')) {
      throw new Error('Missing body.light-theme .sim-prompt-banner in styles.css');
    }
    if (!css.includes(':focus-visible')) {
      throw new Error('Missing :focus-visible accessibility indicators in styles.css');
    }
  });

  it('ADV-5.2: hero_simulator.html and index.html place .sim-live-badge outside overflow-hidden containers', async () => {
    const tplPath = path.join(__dirname, '..', 'templates', 'components', 'hero_simulator.html');
    const tpl = fs.readFileSync(tplPath, 'utf8');
    if (tpl.includes('<div class="sim-live-badge">')) {
      throw new Error('hero_simulator.html still contains nested .sim-live-badge inside component template');
    }

    const idxPath = path.join(__dirname, '..', 'index.html');
    const idx = fs.readFileSync(idxPath, 'utf8');
    // Ensure simulator script appears exactly once
    const scriptMatches = idx.match(/<script[^>]*simulator\.js/g) || [];
    if (scriptMatches.length !== 1) {
      throw new Error(`Expected exactly 1 simulator.js script tag in index.html, found ${scriptMatches.length}`);
    }
  });

  // Run all
  for (const t of tests) {
    try {
      await t.fn();
      passCount++;
      console.log(`  \x1b[32m[PASS]\x1b[0m ${t.desc}`);
    } catch (e) {
      failCount++;
      console.log(`  \x1b[31m[FAIL]\x1b[0m ${t.desc}`);
      console.log(`         \x1b[33m${e.message}\x1b[0m`);
    }
  }

  console.log('\n' + '='.repeat(78));
  console.log(`Challenger Summary: Total ${tests.length} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log('='.repeat(78) + '\n');

  if (failCount > 0) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
