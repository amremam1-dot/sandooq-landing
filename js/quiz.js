/**
 * ============================================================================
 * Sandooq El-Amara — Building Needs Diagnostic Quiz Engine (R3)
 * Flow: Step 1 (Size) -> Step 2 (Challenge) -> Step 3 (Tailored Recommendation)
 * Architecture: 4x4 Decision Matrix with 16 Custom Outcomes & Dual Conversion CTAs
 * Pure Vanilla JavaScript (Zero Dependencies)
 * ============================================================================
 */

(function () {
  'use strict';

  var quizState = {
    currentStep: 1,
    selectedSize: null,
    selectedChallenge: null
  };

  // 1. The 4x4 Combinatorial Exhaustion Matrix (16 Tailored Recommendations)
  var matrix = {
    // Under 10 units (عمارة صغيرة)
    'under10_arrears': {
      badge: 'الباقة المباشرة: إدارة ودية بدون حرج',
      title: 'منظومة إيصالات واتساب المباشرة للمباني العائلية',
      subtitle: 'مصممة خصيصاً للعمارات الصغيرة لإنهاء إحراج المطالبات اليدوية فوراً',
      impact: 'يقضي على الحرج بين الجيران تماماً، ويجعل التحصيل رسمياً بضغطة زر واحدة على واتساب.',
      features: [
        'إصدار إيصالات سداد واتساب فورية ومعتمدة برقم تسلسلي',
        'كشف حساب شهري مبسط يشارك في جروب العمارة بدون تعقيد',
        'سجل ديون تلقائي يوثق الشهور السابقة غير المسددة',
        'تشغيل كامل ومجاني بنسبة 100% دون أي رسوم اشتراك'
      ]
    },
    'under10_maintenance': {
      badge: 'الباقة الخفيفة: ضبط نثريات الحارس',
      title: 'منظومة إدارة عهدة البواب والمشتريات السريعة',
      subtitle: 'تسوية شهرية دقيقة للنظافة ولمبات السلم دون فواتير ضائعة',
      impact: 'يوفر عليك عناء تجميع فواتير السباكة والكهرباء، ويحسب المتبقي مع الحارس تلقائياً.',
      features: [
        'تسجيل عهدة البواب النقدية مع استخراج سند صرف فوري',
        'الإدخال الصوتي بالعامية المصرية مع عم أمين لتسجيل المشتريات',
        'إرفاق صور إيصالات وفواتير الشراء بالكاميرا',
        'إقفال دوري لمصروفات النثريات وإظهار الرصيد الفعلي للصندوق'
      ]
    },
    'under10_bills': {
      badge: 'الباقة العادلة: تقسيم المرافق البسيط',
      title: 'حاسبة التوزيع العادل لفواتير المياه والكهرباء',
      subtitle: 'حساب نصيب كل شقة بدقة رياضية وشفافية مطلقة',
      impact: 'يمنع أي خلاف عائلي حول عدالة فاتورة المياه أو كارت الكهرباء المشترك.',
      features: [
        'حاسبة تقسيم فاتورة المياه المجمعة مع استثناء الدور الأرضي',
        'متابعة رصيد كارت كهرباء السلم والتنبيه قبل نفاد الشحن',
        'توزيع تكلفة صيانة موتور المياه بالتساوي',
        'تصدير كشف حساب مقروء بصيغة PDF لمشاركته مع السكان'
      ]
    },
    'under10_paperwork': {
      badge: 'الباقة الرقمية: أرشفة السجلات المبسطة',
      title: 'الأرشيف السحابي والمحلي الذكي للعمارات الصغيرة',
      subtitle: 'وداعاً للدفاتر الورقية المتناثرة والكشاكيل المفقودة',
      impact: 'ينظم حسابات عمارتك بالكامل في هاتفك، مع حفظ أوفلاين لا يحتاج إنترنت مستمر.',
      features: [
        '8 تقارير محاسبية بنقرة زر بدون أي خبرة مالية سابقة',
        'نسخ احتياطي فوري على الهاتف واستعادة آمنة',
        'استيراد شيت إكسيل الموجود حالياً بضغطة زر',
        'حماية الحسابات بكلمة مرور خاصة لأمين الصندوق'
      ]
    },

    // 10 to 25 units (عمارة متوسطة)
    '10to25_arrears': {
      badge: 'المنظومة القياسية: التحصيل الحازم وبوابة الساكن',
      title: 'منظومة التحصيل الحازم وبوابة الساكن الرقمية',
      subtitle: 'أفضل حل للعمارات المتوسطة لضبط التدفق النقدي للصندوق بانتظام',
      impact: 'يرفع نسبة التحصيل إلى 95% خلال أول شهر ويقضي على تأخر الاشتراكات.',
      features: [
        'بوابة الساكن الذكية بكود سري لكل شقة لمعاينة السجل المالي',
        'مطالبات واتساب آلية قبل موعد السداد بيومين',
        'كشف متأخرات معتمد مقاس A4 PDF جاهز للتعليق في مدخل العمارة',
        'مسار سداد فوري يدعم الكاش وإنستاباي والتحويلات البنكية'
      ]
    },
    '10to25_maintenance': {
      badge: 'المنظومة الاحترافية: هندسة الصيانة الدورية',
      title: 'منظومة عقود صيانة الأسانسير وضبط عهدة البواب',
      subtitle: 'إدارة متكاملة لصيانة المصعد والنظافة وميزانيات الطوارئ',
      impact: 'يوفر ما يصل إلى 20% من تكاليف الصيانة عبر توثيق العقود وتفادي الأعطال المفاجئة.',
      features: [
        'جدول صيانة دورية للمصاعد ومواتير المياه مع تنبيهات الاستحقاق',
        'حساب عهدة الحارس المنفصل مع إغلاق شهري تلقائي',
        'توثيق عقود شركات الصيانة وضمانات قطع الغيار',
        'صندوق طوارئ منفصل لحالات الأعطال الجسيمة'
      ]
    },
    '10to25_bills': {
      badge: 'المنظومة الهندسية: التوزيع الدقيق لفواتير الخدمات',
      title: 'منظومة التوزيع الهندسي العادل وحاسبات المرافق',
      subtitle: 'معادلات معتمدة قانونياً لحساب فروق الاستهلاك والمصاعد',
      impact: 'ينهي النزاعات الشهرية حول فواتير الكهرباء والمياه بين أدوار العمارة المختلفة.',
      features: [
        'حاسبة نصيب المتر المربع للمساحات المتفاوتة والشقق الدوبلكس',
        'توزيع استهلاك عداد المياه المشترك وخصم الأدوار المعفاة',
        'إشعارات فورية بنصيب كل شقة في الفواتير الدورية',
        'مولد بوسترات ولوحات إعلانات المصعد بباركود QR'
      ]
    },
    '10to25_paperwork': {
      badge: 'منظومة الشفافية: التقارير الـ 8 والجمعية العمومية',
      title: 'منظومة الأرشفة الرقمية والتقارير المالية الـ 8',
      subtitle: 'جاهزية كاملة لعرض الحسابات أمام السكان في أي لحظة وبكل فخر',
      impact: 'يوفر أكثر من 15 ساعة شهرياً كانت تضيع في مطابقة الحسابات اليدوية.',
      features: [
        'تقرير مالي سنوي مفصل جاهز للطباعة والقراءة في الجمعية العمومية',
        'استيراد وتصدير إكسيل متطور مع درع تراجع Undo ومطابقة بالذكاء الاصطناعي',
        'مساعد عم أمين الذكي لتوليد ردود محاسبية شافية للسكان',
        'مزامنة سحابية فورية تضمن عدم ضياع أي سجل في حال تغيير الهاتف'
      ]
    },

    // Over 25 units (برج أو عقار كبير)
    'over25_arrears': {
      badge: 'منظومة الأبراج: التحصيل المالي المؤتمت متعدد الخزائن',
      title: 'منظومة الأبراج الكبرى للتحصيل والرقابة المالية المشددة',
      subtitle: 'حلول قوية مصممة لتحمل مئات الوحدات والاشتراكات المتعددة',
      impact: 'يحكم الرقابة على مئات الآلاف من الجنيهات ويمنع أي تسريب مالي بنسبة 100%.',
      features: [
        'دعم الخزائن المتعددة (خزينة نقدية، حساب بنكي، وإنستاباي منفصل)',
        'تصدير كشوفات المتأخرات المجمعة وفلترة الشقق الشاغرة والمغلقة',
        'إرسال إيصالات واتساب مجمعة بضغطة زر واحدة',
        'تقارير أرصدة تفصيلية مقسمة حسب المداخل أو الأدوار'
      ]
    },
    'over25_maintenance': {
      badge: 'منظومة الأبراج: إدارة أصول العقار والمشروعات',
      title: 'منظومة إدارة المشروعات الكبرى وعقود الصيانة الثقيلة',
      subtitle: 'عمرات المصاعد، عزل الأسطح، وإدارة طواقم الأمن والحراسة',
      impact: 'ينظم ميزانيات المشروعات الكبرى ويضمن جمع الودائع الاستثمارية بشفافية.',
      features: [
        'حسابات مستقلة للمشاريع الكبرى (وديعة الصيانة، عزل السطح، واجهات)',
        'إدارة عهد نقدية متعددة لأكثر من حارس أو مشرف أمن',
        'سجل شامل لفواتير الصيانة مع إرفاق صور أذون الصرف والتوريد',
        'تقارير تدفقات نقدية تفصيلية للجان إدارة العقار'
      ]
    },
    'over25_bills': {
      badge: 'منظومة الأبراج: الحسابات التجارية والتوزيع المركب',
      title: 'منظومة توزيع المرافق للأبراج والمحلات والمكاتب',
      subtitle: 'حسابات دقيقة تفصل بين الاستخدام السكني والتجاري والإداري',
      impact: 'يضمن عدالة الفواتير بين المحلات التجارية والشقق السكنية في العقار.',
      features: [
        'معادلات وزن استهلاك الكهرباء والمصاعد حسب نوع النشاط والمساحة',
        'حاسبة متطورة لحساب فروق عدادات الكهرباء التجارية والكروت',
        'إدارة فواتير المياه المجمعة ذات القيمة العالية مع إثباتات العدادات',
        'لوحة معلومات مركزية لعرض كفاءة استهلاك مرافق البرج'
      ]
    },
    'over25_paperwork': {
      badge: 'منظومة المؤسسات: الرقابة والتدقيق المحاسبي المتقدم',
      title: 'منظومة التدقيق المحاسبي والسجلات المالية المعتمدة',
      subtitle: 'أعلى درجات الأمان المالي والأرشفة الرقمية المتوافقة مع القانون',
      impact: 'يجعل التدقيق المالي سهلاً ومحكماً، ويحمي مجلس الإدارة من أي مساءلة قانونية.',
      features: [
        'سجل حركات مالي مفصل غير قابل للتلاعب مع توثيق وقت كل عملية',
        'تكامل كامل مع برامج إكسيل عبر تصدير 3 شيتات موحدة بضغطة زر',
        'أرشفة سحابية مشفرة ومحمية ببروتوكولات بنكية متطورة',
        'تقارير محاسبية معتمدة تتوافق مع لوائح اتحادات الشاغلين والقانون المصري'
      ]
    },

    // Compound / Mall (مجمع سكني أو كمبوند أو مول)
    'compound_arrears': {
      badge: 'منظومة المجمعات: إدارة الاشتراكات المركزية وبوابات الدفع',
      title: 'المنظومة الشاملة لإدارة اشتراكات الكمبوندات والمولات',
      subtitle: 'إدارة متقدمة لآلاف الوحدات مع بوابات دفع ورسائل رسمية',
      impact: 'يسرع وتيرة التدفقات المالية للمشروع ويضمن الالتزام بالودائع السنوية.',
      features: [
        'إدارة متعددة الصلاحيات (أمين صندوق، محاسب، مشرف، مراجع)',
        'بوابة دفع إلكتروني وسداد بنكي مع ربط الإيصالات برقم الوحدة',
        'نظام مطالبات رسمي عبر واتساب والبريد الإلكتروني بكود مشفر',
        'لوحة مؤشرات أداء KPI حية لنسب التحصيل اليومية والشهرية'
      ]
    },
    'compound_maintenance': {
      badge: 'منظومة المجمعات: إدارة أصول المرافق وأطقم الصيانة',
      title: 'منظومة إدارة مرافق المجمعات وعقود المقاولين',
      subtitle: 'شبكات الري، كاميرات المراقبة، اللاندسكيب، والمولدات الكهربائية',
      impact: 'يقلل تكاليف تشغيل وصيانة الكمبوند بنسبة تصل إلى 25% مع إحكام الرقابة.',
      features: [
        'أوامر تشغيل وصيانة رقمية لأطقم الخدمات الفنية وحراس البوابات',
        'إدارة عقود مقاولي النظافة والزراعة ومصاعد المجمع',
        'صناديق نقدية منفصلة لكل قطاع أو مبنى داخل الكمبوند',
        'سجل تاريخ صيانة شامل لكل أصل من أصول المجمع'
      ]
    },
    'compound_bills': {
      badge: 'منظومة المجمعات: قياس ومحاسبة استهلاك البنية التحتية',
      title: 'منظومة التوزيع المتطورة لاستهلاك البنية التحتية والمرافق',
      subtitle: 'تقسيم فواتير أعمدة الإنارة، محطات الرفع، وشبكات المياه المركزية',
      impact: 'توزيع شفاف تماماً ومقنع لكافة الملاك والمستثمرين دون أي لبس.',
      features: [
        'معادلات هندسية لتقسيم استهلاك الخدمات المشتركة حسب نسب التملك',
        'حاسبة استهلاك المحلات التجارية والأنشطة عالية الكثافة',
        'تنبيهات فورية عند وجود تسريب أو ارتفاع غير طبيعي في الاستهلاك',
        'تقارير استهلاك بيئية ومالية شاملة لمجلس إدارة الكمبوند'
      ]
    },
    'compound_paperwork': {
      badge: 'منظومة المجمعات: الحوكمة المؤسسية والربط السحابي الكامل',
      title: 'منظومة الحوكمة المالية وأرشفة الجمعيات العمومية للمجمعات',
      subtitle: 'إدارة توثيقية واحترافية تليق بأكبر المشروعات العقارية والتجارية',
      impact: 'حوكمة مؤسسية كاملة ترضي مجالس الأمناء ومراجعي الحسابات القانونيين.',
      features: [
        'تقارير مالية وختامية مدققة تدعم شيتات إكسيل المعقدة مع درع Undo',
        'أرشفة رقمية مشفرة لقرارات الجمعيات العمومية وعقود الموردين',
        'استشارات حسابية وفنية ذكية على مدار الساعة مع عم أمين AI',
        'تصدير شامل لجميع بيانات المشروع بصيغ PDF و Excel و CSV في ثوانٍ'
      ]
    }
  };

  // 2. Controller Functions
  function initQuiz() {
    var quizSection = document.getElementById('diagnostic-quiz');
    if (!quizSection) return;

    var step1 = document.getElementById('quiz-step-1');
    var step2 = document.getElementById('quiz-step-2');
    var step3 = document.getElementById('quiz-step-3');
    var stepperItems = quizSection.querySelectorAll('[data-step-indicator]');

    var sizeOptions = quizSection.querySelectorAll('[data-size]');
    var challengeOptions = quizSection.querySelectorAll('[data-challenge]');
    var backBtn = quizSection.querySelector('[data-action="back-to-step-1"]');
    var resetBtn = quizSection.querySelector('[data-action="reset-quiz"]');
    var simulatorBtn = quizSection.querySelector('[data-action="try-simulator"]');
    var sizeSummary = document.getElementById('quiz-summary-size');

    var SIZE_LABELS = {
      'under10': '🏠 عمارة صغيرة (<10 شقق)',
      '10to25': '🏢 عمارة متوسطة (10-25 شقة)',
      'over25': '🏙️ برج كبير (>25 شقة)',
      'compound': '🏰 كمبوند / مجمع سكني'
    };

    function setStep(step) {
      quizState.currentStep = step;

      // Update stepper UI
      stepperItems.forEach(function (el) {
        var num = parseInt(el.getAttribute('data-step-indicator'), 10);
        if (num === step) {
          el.classList.add('active');
          el.classList.remove('completed');
        } else if (num < step) {
          el.classList.add('completed');
          el.classList.remove('active');
        } else {
          el.classList.remove('active', 'completed');
        }
      });

      // Update step visibility
      if (step === 1) {
        step1.style.display = 'block';
        step1.classList.add('is-active');
        step2.style.display = 'none';
        step2.classList.remove('is-active');
        step3.style.display = 'none';
        step3.classList.remove('is-active');
      } else if (step === 2) {
        step1.style.display = 'none';
        step1.classList.remove('is-active');
        step2.style.display = 'block';
        step2.classList.add('is-active');
        step3.style.display = 'none';
        step3.classList.remove('is-active');
        if (sizeSummary && quizState.selectedSize) {
          sizeSummary.textContent = SIZE_LABELS[quizState.selectedSize] || '';
        }
      } else if (step === 3) {
        step1.style.display = 'none';
        step1.classList.remove('is-active');
        step2.style.display = 'none';
        step2.classList.remove('is-active');
        step3.style.display = 'block';
        step3.classList.add('is-active');
        renderRecommendation();
      }
    }

    function renderRecommendation() {
      var key = quizState.selectedSize + '_' + quizState.selectedChallenge;
      var outcome = matrix[key] || matrix['10to25_arrears'];

      var badgeEl = document.getElementById('rec-package-badge');
      var titleEl = document.getElementById('rec-title');
      var subtitleEl = document.getElementById('rec-subtitle');
      var impactEl = document.getElementById('rec-impact-text');
      var featuresListEl = document.getElementById('rec-features-list');

      if (badgeEl) badgeEl.textContent = outcome.badge;
      if (titleEl) titleEl.textContent = outcome.title;
      if (subtitleEl) subtitleEl.textContent = outcome.subtitle;
      if (impactEl) impactEl.textContent = outcome.impact;

      if (featuresListEl && outcome.features) {
        var html = '';
        for (var i = 0; i < outcome.features.length; i++) {
          html += '<li><span class="feat-bullet">✓</span> <span>' + outcome.features[i] + '</span></li>';
        }
        featuresListEl.innerHTML = html;
      }
    }

    // Step 1: Size Selection
    sizeOptions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeOptions.forEach(function (b) {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        this.classList.add('selected');
        this.setAttribute('aria-checked', 'true');
        quizState.selectedSize = this.getAttribute('data-size');
        setStep(2);
      });
    });

    // Step 2: Challenge Selection
    challengeOptions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        challengeOptions.forEach(function (b) {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        this.classList.add('selected');
        this.setAttribute('aria-checked', 'true');
        quizState.selectedChallenge = this.getAttribute('data-challenge');
        setStep(3);
      });
    });

    // Back to Step 1
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        setStep(1);
      });
    }

    // Reset Quiz
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetQuiz();
      });
    }

    function resetQuiz() {
      quizState.currentStep = 1;
      quizState.selectedSize = null;
      quizState.selectedChallenge = null;
      sizeOptions.forEach(function (b) {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      challengeOptions.forEach(function (b) {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      setStep(1);
    }

    // Try Simulator Cross-Feature Anchor (T3.1)
    if (simulatorBtn) {
      simulatorBtn.addEventListener('click', function (e) {
        var target = document.getElementById('app-simulator') || document.querySelector('.phone-mockup');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.remove('sim-highlight-pulse');
          void target.offsetWidth; // Trigger reflow for animation restart
          target.classList.add('sim-highlight-pulse');
          if (typeof target.focus === 'function') target.focus();
        }
      });
    }

    // Initialize step 1
    setStep(1);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initQuiz);
    } else {
      initQuiz();
    }
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      matrix: matrix,
      quizState: quizState
    };
  }
})();
