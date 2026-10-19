#!/usr/bin/env node
/**
 * adversarial_r1_stress.js
 * Empirical Adversarial Challenger Test Suite for Milestone 2 (R1: Simulator)
 * Tests concurrency, race conditions, boundary inputs, replay loops, and precision.
 * Pure Node.js - Zero external runtime dependencies
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- Minimal DOM Implementation for Headless Node.js Execution ---
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

    querySelector: (sel) => {
      return querySelectorAllDeep(el, sel)[0] || null;
    },

    querySelectorAll: (sel) => {
      return querySelectorAllDeep(el, sel);
    },

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
      // Bubble phase
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

  // Simple selector parsing
  if (sel.startsWith('#')) {
    return el.id === sel.slice(1);
  }
  if (sel.startsWith('.')) {
    return el.classList.contains(sel.slice(1));
  }
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
      if (matchesSelector(child, sel)) {
        results.push(child);
      }
      recurse(child);
    }
  }
  recurse(root);
  return results;
}

// Build standard DOM fixture matching hero_simulator.html
function buildSimulatorDOM() {
  const docElement = createMockElement('html');
  const body = createMockElement('body');
  docElement.appendChild(body);

  const container = createMockElement('div', { id: 'app-simulator', class: 'app-simulator phone-screen-inner' });
  body.appendChild(container);

  // Screen 1: Units
  const screenUnits = createMockElement('section', { id: 'sim-screen-units', class: 'sim-screen sim-screen-units is-active' });
  container.appendChild(screenUnits);

  const resetBtn = createMockElement('button', { id: 'sim-top-reset-btn', 'data-action': 'reset' });
  screenUnits.appendChild(resetBtn);

  const fundBal = createMockElement('span', { id: 'sim-fund-balance' });
  screenUnits.appendChild(fundBal);

  const collRate = createMockElement('span', { id: 'sim-collection-rate' });
  screenUnits.appendChild(collRate);

  const rateBadge = createMockElement('span', { id: 'sim-rate-badge' });
  screenUnits.appendChild(rateBadge);

  const toast = createMockElement('div', { id: 'sim-toast' });
  screenUnits.appendChild(toast);

  // Unit 101 (Paid)
  const card101 = createMockElement('div', { class: 'sim-unit-card is-paid', 'data-unit-id': '101' });
  const badge101 = createMockElement('span', { class: 'sim-badge sim-badge-paid', textContent: 'مسدد ✅' });
  const viewBtn101 = createMockElement('button', { 'data-action': 'view-receipt', 'data-unit': '101', 'data-unit-id': '101' });
  card101.appendChild(badge101);
  card101.appendChild(viewBtn101);
  screenUnits.appendChild(card101);

  // Unit 102 (Unpaid)
  const card102 = createMockElement('div', { id: 'sim-unit-card-102', class: 'sim-unit-card is-unpaid active-target', 'data-unit-id': '102' });
  const badge102 = createMockElement('span', { id: 'sim-status-badge-102', class: 'sim-badge sim-badge-unpaid', textContent: 'غير مسدد ⏳' });
  const collectBtn102 = createMockElement('button', { id: 'sim-collect-btn-102', 'data-action': 'open-payment', 'data-unit': '102', 'data-unit-id': '102' });
  card102.appendChild(badge102);
  card102.appendChild(collectBtn102);
  screenUnits.appendChild(card102);

  // Screen 2: Payment Modal
  const modal = createMockElement('div', { id: 'sim-payment-modal', class: 'sim-modal-backdrop sim-modal-overlay' });
  const closeBtn = createMockElement('button', { id: 'sim-modal-close-btn', 'data-action': 'close-modal' });
  const amountInput = createMockElement('input', { id: 'sim-input-amount', class: 'sim-amount-input', value: '500' });
  const chip500 = createMockElement('button', { class: 'sim-chip is-selected active', 'data-amount': '500' });
  const chip1000 = createMockElement('button', { class: 'sim-chip', 'data-amount': '1000' });
  const chip1500 = createMockElement('button', { class: 'sim-chip', 'data-amount': '1500' });
  const cashBtn = createMockElement('button', { id: 'sim-treasury-cash', class: 'sim-treasury-option is-active active', 'data-treasury': 'cash' });
  const bankBtn = createMockElement('button', { id: 'sim-treasury-bank', class: 'sim-treasury-option', 'data-treasury': 'bank' });
  const confirmBtn = createMockElement('button', { id: 'sim-submit-payment-btn', 'data-action': 'confirm-payment' });

  modal.appendChild(closeBtn);
  modal.appendChild(amountInput);
  modal.appendChild(chip500);
  modal.appendChild(chip1000);
  modal.appendChild(chip1500);
  modal.appendChild(cashBtn);
  modal.appendChild(bankBtn);
  modal.appendChild(confirmBtn);
  container.appendChild(modal);

  // Screen 3: Receipt
  const screenReceipt = createMockElement('section', { id: 'sim-screen-receipt', class: 'sim-screen sim-screen-receipt' });
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

  return { documentMock, container, elements: {
    screenUnits, resetBtn, fundBal, collRate, rateBadge, toast,
    card101, badge101, viewBtn101,
    card102, badge102, collectBtn102,
    modal, closeBtn, amountInput, chip500, chip1000, chip1500, cashBtn, bankBtn, confirmBtn,
    screenReceipt, outUnit, outResident, outDate, outTreasury, outAmount, outReceiptId, replayBtn
  }};
}

// Load simulator.js in isolated sandbox
function createSimulatorInstance() {
  const { documentMock, container, elements } = buildSimulatorDOM();
  const simulatorCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'simulator.js'), 'utf8');

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
  vm.runInContext(simulatorCode, sandbox);

  const sim = sandbox.window.SandooqSimulator;
  return { sim, container, elements, sandbox, documentMock };
}

// Helper to trigger simulated click
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

// Helper to trigger simulated input
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

// --- ADVERSARIAL STRESS SUITE ---
const results = [];
function test(name, fn) {
  return Promise.resolve()
    .then(() => fn())
    .then(() => {
      results.push({ name, pass: true });
      console.log(`  \x1b[32m[PASS]\x1b[0m ${name}`);
    })
    .catch((err) => {
      results.push({ name, pass: false, error: err.message });
      console.log(`  \x1b[31m[FAIL]\x1b[0m ${name}`);
      console.log(`         \x1b[33m${err.message}\x1b[0m`);
    });
}

async function runAll() {
  console.log('='.repeat(78));
  console.log('  ADVERSARIAL STRESS HARNESS — SandooqSimulator State Machine');
  console.log('='.repeat(78) + '\n');

  console.log('--- Suite 1: Concurrency, Rapid Multi-Clicks & Race Conditions ---');

  await test('1.1 Rapid 50 concurrent clicks on confirm-payment engages isProcessing lock', async () => {
    const { sim, elements } = createSimulatorInstance();
    // Open payment modal
    click(elements.collectBtn102);
    if (sim.getState().activeScreen !== 2) throw new Error('Expected screen 2 after open payment');

    // Fire 50 rapid clicks
    for (let i = 0; i < 50; i++) {
      click(elements.confirmBtn);
    }

    const state = sim.getState();
    if (!state.isProcessing) throw new Error('isProcessing must be true during transition');
    if (!elements.confirmBtn.disabled) throw new Error('confirmBtn must be disabled');

    // Wait for 350ms delay to resolve
    await new Promise(r => setTimeout(r, 450));

    const finalState = sim.getState();
    if (finalState.isProcessing) throw new Error('isProcessing must be released after timeout');
    if (finalState.activeScreen !== 3) throw new Error('Expected screen 3 (receipt) after timeout');
  });

  await test('1.2 Race: Intercepting confirm-payment by closing modal during 350ms signing delay', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    click(elements.confirmBtn); // Starts 350ms timer

    // At t = 50ms, user clicks close modal
    await new Promise(r => setTimeout(r, 50));
    click(elements.closeBtn);

    const midState = sim.getState();
    if (midState.activeScreen !== 1) throw new Error('Modal should close to screen 1');

    // Wait for the original 350ms timer to fire (t = 450ms total)
    await new Promise(r => setTimeout(r, 400));
    const lateState = sim.getState();

    // Check if the timer unexpectedly jumped to screen 3 while user was on screen 1!
    if (lateState.activeScreen === 3) {
      console.warn('    [DISCOVERY/BUG] State leak: 350ms signing timeout does not check if user closed modal, forcibly jumping to Screen 3!');
    }
  });

  await test('1.3 Race: Clicking reset() during 350ms payment signing delay', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    click(elements.confirmBtn);

    // At t = 50ms, user clicks reset
    await new Promise(r => setTimeout(r, 50));
    sim.reset();
    if (sim.getState().activeScreen !== 1) throw new Error('Reset should set activeScreen to 1');
    if (sim.getState().isProcessing !== false) throw new Error('Reset should clear isProcessing');

    // Wait for payment timeout to fire
    await new Promise(r => setTimeout(r, 400));
    const finalState = sim.getState();

    if (finalState.activeScreen === 3) {
      console.warn('    [DISCOVERY/BUG] Unmanaged timer: reset() does not cancel pending payment timer; timeout mutates fresh state to Screen 3!');
    }
  });

  await test('1.4 Mutation during processing: changing amount chips while isProcessing is true', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);
    // User submits 500
    click(elements.confirmBtn);

    // During signing delay, user clicks 1500 chip
    await new Promise(r => setTimeout(r, 30));
    click(elements.chip1500);

    await new Promise(r => setTimeout(r, 450));
    const finalState = sim.getState();
    const paidUnit = finalState.units.find(u => u.id === 102);

    if (paidUnit.amount === 1500) {
      console.warn('    [DISCOVERY/BUG] Input vulnerability: Amount chip clicked during isProcessing overwrote confirmed payment from 500 to 1500!');
    }
  });

  console.log('\n--- Suite 2: Boundary & Invalid Input Tests ---');

  await test('2.1 Zero amount input ("0")', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '0');
    // On input event:
    if (sim.getState().paymentAmount !== 0) throw new Error('Input 0 should set state.paymentAmount to 0');

    // On confirm:
    click(elements.confirmBtn);
    // Line 369: rawVal is '0', parsed is 0, parsed > 0 is false -> fallback to 500
    if (sim.getState().paymentAmount !== 500) {
      throw new Error(`Expected fallback to 500 on 0 amount, got ${sim.getState().paymentAmount}`);
    }
    await new Promise(r => setTimeout(r, 400));
  });

  await test('2.2 Negative amount input ("-750")', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '-750');
    // replace(/\D/g, '') strips the minus sign, leaving 750
    if (sim.getState().paymentAmount !== 750) {
      throw new Error(`Expected -750 to strip non-digits to 750, got ${sim.getState().paymentAmount}`);
    }
  });

  await test('2.3 Non-numeric string ("abc!@#")', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, 'abc!@#');
    if (sim.getState().paymentAmount !== 0) {
      throw new Error(`Expected non-numeric to result in 0, got ${sim.getState().paymentAmount}`);
    }

    click(elements.confirmBtn);
    if (sim.getState().paymentAmount !== 500) {
      throw new Error(`Expected fallback to 500, got ${sim.getState().paymentAmount}`);
    }
    await new Promise(r => setTimeout(r, 400));
  });

  await test('2.4 Decimal input ("500.75")', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '500.75');
    // replace(/\D/g, '') strips dot -> 50075
    const amt = sim.getState().paymentAmount;
    if (amt === 50075) {
      console.warn('    [DISCOVERY/EDGE-CASE] Decimal dot is stripped by replace(/\\D/g, ""), converting 500.75 into 50075 EGP');
    }
  });

  await test('2.6 Eastern Arabic numerals ("١٠٠٠")', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '١٠٠٠');
    const amtInput = sim.getState().paymentAmount;
    click(elements.confirmBtn);
    const confirmedAmt = sim.getState().paymentAmount;

    if (confirmedAmt !== 1000) {
      console.warn(`    [DISCOVERY/I18N] Eastern Arabic digits '١٠٠٠' stripped by /\\D/g; fell back to ${confirmedAmt} instead of 1000`);
    }
  });

  await test('2.5 Extremely huge number ("9999999999")', async () => {
    const { sim, elements } = createSimulatorInstance();
    click(elements.collectBtn102);

    inputEvent(elements.amountInput, '9999999999');
    click(elements.confirmBtn);
    await new Promise(r => setTimeout(r, 400));
    sim.replay();

    const bal = sim.getState().currentBalance;
    if (isNaN(bal) || !isFinite(bal)) {
      throw new Error(`Balance calculation became NaN/Infinite: ${bal}`);
    }
    if (bal !== 18450 + 9999999999) {
      throw new Error(`Balance math mismatch: expected ${18450 + 9999999999}, got ${bal}`);
    }
  });

  console.log('\n--- Suite 3: Replay Loop Integrity & State Drift ---');

  await test('3.1 50 consecutive replay() calls do NOT drift balance or accumulate funds', async () => {
    const { sim } = createSimulatorInstance();
    for (let i = 0; i < 50; i++) {
      sim.replay();
    }
    const state = sim.getState();
    // After first replay: 18450 + 500 = 18950.
    // Subsequent 49 replays: unit 102 is already paid, balance MUST remain 18950.
    if (state.currentBalance !== 18950) {
      throw new Error(`Balance drifted during repeat replays! Expected 18950, got ${state.currentBalance}`);
    }
    if (state.units.length !== 4) {
      throw new Error(`Units array mutated: expected 4, got ${state.units.length}`);
    }
    const unit102 = state.units.find(u => u.id === 102);
    if (!unit102.isPaid) throw new Error('Unit 102 should be paid');
  });

  await test('3.2 100 alternating replay() and reset() cycles remain perfectly idempotent', async () => {
    const { sim } = createSimulatorInstance();
    for (let i = 0; i < 100; i++) {
      sim.replay();
      if (sim.getState().currentBalance !== 18950) {
        throw new Error(`Iteration ${i}: Balance after replay should be 18950, got ${sim.getState().currentBalance}`);
      }
      sim.reset();
      if (sim.getState().currentBalance !== 18450) {
        throw new Error(`Iteration ${i}: Balance after reset should be 18450, got ${sim.getState().currentBalance}`);
      }
      if (sim.getState().units.find(u => u.id === 102).isPaid !== false) {
        throw new Error(`Iteration ${i}: Unit 102 after reset should be unpaid`);
      }
    }
  });

  await test('3.3 Multiple init() calls do NOT multiply event listeners', async () => {
    const { sim, container, elements } = createSimulatorInstance();
    // Call init 10 times
    for (let i = 0; i < 10; i++) {
      sim.init('app-simulator');
    }
    // Verify click listener count on container
    const clickListeners = container._listeners['click'] || [];
    if (clickListeners.length > 1) {
      throw new Error(`Memory leak: container has ${clickListeners.length} duplicate click listeners after multiple init() calls`);
    }
  });

  console.log('\n--- Suite 4: State Invariants, Math & Localization ---');

  await test('4.1 State copy isolation (getState() immutability)', async () => {
    const { sim } = createSimulatorInstance();
    const copy = sim.getState();
    copy.currentBalance = 999999;
    copy.activeScreen = 99;

    const fresh = sim.getState();
    if (fresh.currentBalance === 999999 || fresh.activeScreen === 99) {
      throw new Error('getState() returned direct state reference rather than copy!');
    }

    // Test nested units array mutation
    copy.units.pop();
    const freshUnits = sim.getState().units;
    if (freshUnits.length !== 4) {
      console.warn(`    [DISCOVERY/SECURITY] Shallow copy leak: mutating getState().units mutated internal state (length became ${freshUnits.length})!`);
    }
  });

  await test('4.2 Collection rate computation across units', async () => {
    const { sim } = createSimulatorInstance();
    // Initially 3/4 paid = 75%
    sim.replay(); // 4/4 paid = 100%
    const state = sim.getState();
    const paid = state.units.filter(u => u.isPaid).length;
    const rate = Math.round((paid / state.units.length) * 100);
    if (rate !== 100) throw new Error(`Expected rate 100%, got ${rate}%`);
  });

  console.log('\n' + '='.repeat(78));
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Adversarial Suite Execution Summary:`);
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(78) + '\n');
}

runAll().catch(console.error);
