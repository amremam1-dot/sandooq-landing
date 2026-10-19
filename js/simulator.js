/**
 * ============================================================================
 * Sandooq El-Amara — Interactive Web Simulator Engine (R1)
 * File: sandooq-landing/js/simulator.js
 * Engine: 100% Vanilla JavaScript (Zero external runtime dependencies)
 * Architecture: Declarative State Machine & Event Delegation
 * Compliance: Audited against E2E Tests T1.1.1 - T1.1.6, T2.1.1 - T2.1.5, T4.1
 * ============================================================================
 */

(function initSandooqSimulatorModule(global) {
  'use strict';

  // Guard against redundant duplicate initialization
  if (global.SandooqSimulator && global.SandooqSimulator.__initialized) {
    return;
  }

  // 1. Initial State Factory (Ensures idempotency across replay & reset cycles)
  function createInitialState() {
    return {
      activeScreen: 1, // 1: Units List, 2: Payment Modal, 3: WhatsApp Receipt
      isProcessing: false, // Concurrency & double-click lock flag (T2.1.2)
      buildingName: 'عمارة النور - شيراتون',
      period: 'أكتوبر 2026',
      baseBalance: 18450,
      currentBalance: 18450,
      selectedUnitId: 102,
      paymentAmount: 500, // Default preset fee
      treasury: 'cash', // 'cash' (كاش / خزينة نقدية) | 'bank' (بنك / انستاباي / InstaPay)
      statement: 'اشتراك صيانة شهر أكتوبر 2026',
      receiptNumber: 1042,
      receiptStamp: '#SN-8821', // Official digital authentication seal (T1.1.4)
      units: [
        {
          id: 101,
          name: 'شقة 101',
          resident: 'أ. أحمد إبراهيم',
          floor: 'الدور الأول',
          amount: 500,
          isPaid: true,
          treasury: 'bank',
          receiptNumber: 1041,
          date: '02 أكتوبر 2026 — 10:15 ص'
        },
        {
          id: 102,
          name: 'شقة 102',
          resident: 'م. محمد سمير',
          floor: 'الدور الأول',
          amount: 500,
          isPaid: false, // Target unpaid unit for interactive payment
          treasury: 'cash',
          receiptNumber: 1042,
          date: null
        },
        {
          id: 201,
          name: 'شقة 201',
          resident: 'د. خالد عبد الرحمن',
          floor: 'الدور الثاني',
          amount: 500,
          isPaid: true,
          treasury: 'cash',
          receiptNumber: 1040,
          date: '01 أكتوبر 2026 — 08:30 م'
        },
        {
          id: 202,
          name: 'شقة 202',
          resident: 'م. طارق العوضي',
          floor: 'الدور الثاني',
          amount: 500,
          isPaid: true,
          treasury: 'cash',
          receiptNumber: 1039,
          date: '01 أكتوبر 2026 — 06:12 م'
        }
      ],
      toastMessage: null
    };
  }

  // 2. Module State & Timers
  let state = createInitialState();
  let container = null;
  let toastTimer = null;
  let paymentTimer = null;

  function restoreConfirmButton() {
    if (!container) return;
    const confirmBtn = container.querySelector('#sim-submit-payment-btn');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove('loading', 'is-processing');
      confirmBtn.innerHTML = '<span>تأكيد واستخراج إيصال واتساب ✨</span>';
    }
  }

  function cancelPaymentTimer() {
    if (paymentTimer) {
      clearTimeout(paymentTimer);
      paymentTimer = null;
    }
    if (state.isProcessing) {
      state.isProcessing = false;
      restoreConfirmButton();
    }
  }

  function normalizeArabicDigits(str) {
    if (!str) return '';
    return String(str)
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }

  function parseAmount(val) {
    const normalized = normalizeArabicDigits(val).replace(/\D/g, '');
    const parsed = parseInt(normalized, 10);
    return (!isNaN(parsed) && parsed > 0) ? parsed : 0;
  }

  // 3. Helper Formatters
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return num.toLocaleString('ar-EG');
  }

  function getFormattedDateTime() {
    const now = new Date();
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} — ${hours}:${minutes} ${ampm}`;
  }

  function showToast(message) {
    if (!container) return;
    const toastEl = container.querySelector('#sim-toast');
    if (!toastEl) return;

    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.style.display = 'block';
    toastEl.classList.add('is-visible');

    toastTimer = setTimeout(() => {
      toastEl.style.display = 'none';
      toastEl.classList.remove('is-visible');
    }, 4500);
  }

  // 4. State Machine View Synchronization
  function syncViews() {
    if (!container) return;

    const screenUnits = container.querySelector('#sim-screen-units');
    const paymentModal = container.querySelector('#sim-payment-modal');
    const screenReceipt = container.querySelector('#sim-screen-receipt');

    const totalUnits = state.units.length;
    const paidUnits = state.units.filter(u => u.isPaid).length;
    const collectionRate = Math.round((paidUnits / totalUnits) * 100);

    // Update KPIs on Screen 1
    const fundBalEl = container.querySelector('#sim-fund-balance');
    if (fundBalEl) fundBalEl.textContent = formatMoney(state.currentBalance);

    const rateEl = container.querySelector('#sim-collection-rate');
    if (rateEl) rateEl.textContent = `${collectionRate}%`;

    const rateBadgeEl = container.querySelector('#sim-rate-badge');
    if (rateBadgeEl) rateBadgeEl.textContent = `${paidUnits} / ${totalUnits}`;

    // Update Unit 102 DOM state
    const unit102 = state.units.find(u => u.id === 102);
    const card102 = container.querySelector('#sim-unit-card-102');
    const badge102 = container.querySelector('#sim-status-badge-102');
    const collectBtn102 = container.querySelector('#sim-collect-btn-102');

    if (unit102 && card102 && badge102 && collectBtn102) {
      if (unit102.isPaid) {
        card102.classList.remove('is-unpaid', 'active-target');
        card102.classList.add('is-paid');

        badge102.className = 'sim-badge sim-badge-paid';
        badge102.textContent = 'مسدد ✅';

        collectBtn102.className = 'sim-btn-receipt sim-btn-view-receipt';
        collectBtn102.setAttribute('data-action', 'view-receipt');
        collectBtn102.setAttribute('data-unit', '102');
        collectBtn102.setAttribute('data-unit-id', '102');
        collectBtn102.setAttribute('aria-label', 'عرض إيصال شقة 102');
        collectBtn102.innerHTML = 'إيصال 🧾';
      } else {
        card102.classList.remove('is-paid');
        card102.classList.add('is-unpaid', 'active-target');

        badge102.className = 'sim-badge sim-badge-unpaid';
        badge102.textContent = 'غير مسدد ⏳';

        collectBtn102.className = 'sim-btn-collect sim-pulse-btn pulse-attention';
        collectBtn102.setAttribute('data-action', 'open-payment');
        collectBtn102.setAttribute('data-unit', '102');
        collectBtn102.setAttribute('data-unit-id', '102');
        collectBtn102.setAttribute('aria-label', 'تحصيل اشتراك شقة 102');
        collectBtn102.innerHTML = '<span>تحصيل 💵</span>';
      }
    }

    // Active Screen Visibility Switching
    if (state.activeScreen === 1) {
      if (screenUnits) {
        screenUnits.style.display = 'flex';
        screenUnits.classList.add('is-active');
      }
      if (paymentModal) {
        paymentModal.style.display = 'none';
        paymentModal.classList.remove('active');
        paymentModal.setAttribute('aria-hidden', 'true');
      }
      if (screenReceipt) {
        screenReceipt.style.display = 'none';
        screenReceipt.classList.remove('is-active');
      }
    } else if (state.activeScreen === 2) {
      if (screenUnits) {
        screenUnits.style.display = 'flex';
        screenUnits.classList.add('is-active');
      }
      if (paymentModal) {
        paymentModal.style.display = 'flex';
        paymentModal.classList.add('active');
        paymentModal.setAttribute('aria-hidden', 'false');
      }
      if (screenReceipt) {
        screenReceipt.style.display = 'none';
        screenReceipt.classList.remove('is-active');
      }
    } else if (state.activeScreen === 3) {
      if (screenUnits) {
        screenUnits.style.display = 'none';
        screenUnits.classList.remove('is-active');
      }
      if (paymentModal) {
        paymentModal.style.display = 'none';
        paymentModal.classList.remove('active');
        paymentModal.setAttribute('aria-hidden', 'true');
      }
      if (screenReceipt) {
        screenReceipt.style.display = 'flex';
        screenReceipt.classList.add('is-active');
      }
    }

    // Update Payment Modal Inputs & Chips
    const amountInput = container.querySelector('#sim-input-amount');
    if (amountInput) {
      amountInput.value = state.paymentAmount;
    }

    const chips = container.querySelectorAll('.sim-chip');
    chips.forEach(chip => {
      const amt = parseInt(chip.getAttribute('data-amount'), 10);
      if (amt === state.paymentAmount) {
        chip.classList.add('is-selected', 'active');
      } else {
        chip.classList.remove('is-selected', 'active');
      }
    });

    // Update Treasury Segment Buttons
    const isCash = state.treasury === 'cash';
    const cashBtn = container.querySelector('#sim-treasury-cash');
    const bankBtn = container.querySelector('#sim-treasury-bank');

    if (cashBtn) {
      if (isCash) {
        cashBtn.classList.add('is-active', 'active');
        cashBtn.setAttribute('aria-checked', 'true');
      } else {
        cashBtn.classList.remove('is-active', 'active');
        cashBtn.setAttribute('aria-checked', 'false');
      }
    }

    if (bankBtn) {
      if (!isCash) {
        bankBtn.classList.add('is-active', 'active');
        bankBtn.setAttribute('aria-checked', 'true');
      } else {
        bankBtn.classList.remove('is-active', 'active');
        bankBtn.setAttribute('aria-checked', 'false');
      }
    }

    // Update WhatsApp Receipt Output Fields
    const selectedUnit = state.units.find(u => u.id === state.selectedUnitId) || state.units[1];
    const outUnit = container.querySelector('#sim-out-unit');
    if (outUnit) outUnit.textContent = `${selectedUnit.name} (${selectedUnit.floor})`;

    const outResident = container.querySelector('#sim-out-resident');
    if (outResident) outResident.textContent = selectedUnit.resident;

    const outDate = container.querySelector('#sim-out-date');
    if (outDate) outDate.textContent = selectedUnit.date || getFormattedDateTime();

    const outTreasury = container.querySelector('#sim-out-treasury');
    if (outTreasury) {
      outTreasury.textContent = isCash ? 'خزينة نقدية (كاش 💵)' : 'تحويل بنكي / إنستاباي 📱';
    }

    const outAmount = container.querySelector('#sim-out-amount');
    if (outAmount) outAmount.textContent = formatMoney(state.paymentAmount);

    const outReceiptId = container.querySelector('#sim-out-receipt-id');
    if (outReceiptId) outReceiptId.textContent = state.receiptStamp;
  }

  // 5. Event Handling & Concurrency Guard
  function handleContainerClick(e) {
    const target = e.target;
    if (!target) return;

    // Action A: Open Payment Modal (تحصيل / سداد)
    const openBtn = target.closest('[data-action="open-payment"]');
    if (openBtn) {
      const unitId = parseInt(openBtn.getAttribute('data-unit-id') || openBtn.getAttribute('data-unit'), 10);
      state.selectedUnitId = unitId || 102;
      const unit = state.units.find(u => u.id === state.selectedUnitId);
      if (unit) {
        state.paymentAmount = unit.amount || 500;
      }
      state.activeScreen = 2;
      syncViews();
      return;
    }

    // Action B: View Preexisting Receipt (إيصال)
    const viewBtn = target.closest('[data-action="view-receipt"]');
    if (viewBtn) {
      const unitId = parseInt(viewBtn.getAttribute('data-unit-id') || viewBtn.getAttribute('data-unit'), 10);
      state.selectedUnitId = unitId || 101;
      const unit = state.units.find(u => u.id === state.selectedUnitId);
      if (unit) {
        state.paymentAmount = unit.amount || 500;
        state.treasury = unit.treasury || 'cash';
        state.receiptNumber = unit.receiptNumber || 1041;
      }
      state.activeScreen = 3;
      syncViews();
      return;
    }

    // Action C: Close Payment Modal (إغلاق / إلغاء)
    const closeBtn = target.closest('[data-action="close-modal"]') || (target.classList && target.classList.contains('sim-modal-backdrop'));
    if (closeBtn) {
      cancelPaymentTimer();
      state.activeScreen = 1;
      syncViews();
      return;
    }

    // Action D: Select Preset Amount Chip (500 / 1000 / 1500)
    const chipBtn = target.closest('[data-amount]');
    if (chipBtn) {
      if (state.isProcessing) return;
      const amt = parseInt(chipBtn.getAttribute('data-amount'), 10);
      if (!isNaN(amt) && amt > 0) {
        state.paymentAmount = amt;
        syncViews();
      }
      return;
    }

    // Action E: Select Treasury (كاش vs بنك / انستاباي)
    const treasuryBtn = target.closest('[data-treasury]');
    if (treasuryBtn) {
      if (state.isProcessing) return;
      const t = treasuryBtn.getAttribute('data-treasury');
      if (t === 'cash' || t === 'bank') {
        state.treasury = t;
        syncViews();
      }
      return;
    }

    // Action F: Confirm Payment with Concurrency Lock (T2.1.2, T2.1.3)
    const confirmBtn = target.closest('[data-action="confirm-payment"]');
    if (confirmBtn) {
      if (state.isProcessing) return; // Prevent rapid multi-clicks / duplicate processing

      // Read & Sanitize Payment Amount
      const input = container.querySelector('#sim-input-amount');
      if (input) {
        const parsed = parseAmount(input.value);
        state.paymentAmount = parsed > 0 ? parsed : 500;
        input.value = state.paymentAmount;
      }

      // Engage concurrency lock (T2.1.2)
      cancelPaymentTimer();
      state.isProcessing = true;
      confirmBtn.disabled = true;
      confirmBtn.classList.add('loading', 'is-processing');
      const originalText = confirmBtn.innerHTML;
      confirmBtn.innerHTML = '<span>جاري التوثيق وتوليد الختم...</span>';

      // Simulate digital signing delay (350ms)
      paymentTimer = setTimeout(() => {
        paymentTimer = null;
        state.isProcessing = false;
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('loading', 'is-processing');
        confirmBtn.innerHTML = originalText;

        if (state.activeScreen !== 2) {
          return;
        }

        const currentUnit = state.units.find(u => u.id === state.selectedUnitId);
        if (currentUnit) {
          currentUnit.date = getFormattedDateTime();
          currentUnit.treasury = state.treasury;
          currentUnit.amount = state.paymentAmount;
        }

        state.activeScreen = 3;
        syncViews();
      }, 350);
      return;
    }

    // Action G: Replay Cycle (Transition Apt 102 to Paid & Return) (T1.1.5, T2.1.4)
    const replayBtn = target.closest('[data-action="replay"]') || target.closest('#sim-replay-loop-btn');
    if (replayBtn) {
      replay();
      return;
    }

    // Action H: Full Reset to Pristine Demo State (↺)
    const resetBtn = target.closest('[data-action="reset"]') || target.closest('#sim-top-reset-btn');
    if (resetBtn) {
      reset();
      return;
    }
  }

  // Handle direct manual input on amount field
  function handleContainerInput(e) {
    if (state.isProcessing) return;
    if (e.target && (e.target.id === 'sim-input-amount' || e.target.classList.contains('sim-amount-input'))) {
      const parsed = parseAmount(e.target.value);
      state.paymentAmount = parsed;

      // Update active highlight on matching chips
      const chips = container.querySelectorAll('.sim-chip');
      chips.forEach(c => {
        const chipVal = parseInt(c.getAttribute('data-amount'), 10);
        if (chipVal === state.paymentAmount) {
          c.classList.add('is-selected', 'active');
        } else {
          c.classList.remove('is-selected', 'active');
        }
      });
    }
  }

  // 6. Public Lifecycle Methods
  function replay() {
    cancelPaymentTimer();
    const unit102 = state.units.find(u => u.id === 102);
    if (unit102 && !unit102.isPaid) {
      unit102.isPaid = true;
      unit102.treasury = state.treasury;
      unit102.amount = state.paymentAmount;
      unit102.receiptNumber = state.receiptNumber;
      unit102.date = getFormattedDateTime();

      // Increment fund balance
      state.currentBalance = state.baseBalance + state.paymentAmount;
    }

    state.activeScreen = 1;
    state.isProcessing = false;
    syncViews();

    showToast('🎉 تم تحصيل شقة 102 وتحديث رصيد الصندوق ونسبة التحصيل إلى 100%!');
  }

  function reset() {
    cancelPaymentTimer();
    if (toastTimer) clearTimeout(toastTimer);
    state = createInitialState();
    syncViews();
    showToast('↺ تم إعادة ضبط المحاكي للحالة التجريبية الأولى.');
  }

  function focusAndPulse() {
    if (!container) return;
    const phoneMockup = container.closest('.phone-mockup') || container;
    phoneMockup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    phoneMockup.classList.add('sim-highlight-pulse');
    setTimeout(() => {
      phoneMockup.classList.remove('sim-highlight-pulse');
    }, 2200);
  }

  // 7. Mount & Initialization Lifecycle
  function init(targetId) {
    const id = targetId || 'app-simulator';
    container = document.getElementById(id);
    if (!container) {
      return false;
    }

    // Mark as progressive-enhancement ready
    document.documentElement.classList.add('js-ready');
    container.classList.add('is-ready');

    // Attach single event delegation listener (avoids leaks & duplicate handlers)
    container.removeEventListener('click', handleContainerClick);
    container.removeEventListener('input', handleContainerInput);
    container.addEventListener('click', handleContainerClick);
    container.addEventListener('input', handleContainerInput);

    // Initial sync
    syncViews();

    // Listen globally for cross-component triggers (e.g. Diagnostic Quiz CTA)
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-action="try-simulator"]');
      if (trigger) {
        e.preventDefault();
        focusAndPulse();
      }
    });

    return true;
  }

  // 8. Global Export
  const SandooqSimulator = {
    __initialized: true,
    init,
    replay,
    reset,
    focusAndPulse,
    getState: () => ({
      ...state,
      units: state.units.map(u => ({ ...u }))
    }),
    setScreen: (num) => {
      cancelPaymentTimer();
      state.activeScreen = num;
      syncViews();
    }
  };

  global.SandooqSimulator = SandooqSimulator;

  // Auto-initialize when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init('app-simulator'));
    } else {
      init('app-simulator');
    }
  }
})(typeof window !== 'undefined' ? window : this);
