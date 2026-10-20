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

  // 1b. English 4x4 Combinatorial Exhaustion Matrix
  var matrixEn = {
    'under10_arrears': {
      badge: 'Direct Plan: Friendly Collection Without Friction',
      title: 'Direct WhatsApp Receipt System for Family Buildings',
      subtitle: 'Tailored for smaller properties to eliminate manual collection awkwardness immediately',
      impact: 'Completely eliminates awkwardness with neighbors and makes collection professional via WhatsApp.',
      features: [
        'Issue official serialized WhatsApp payment receipts with timestamps',
        'Simple monthly operating statements shared with residents',
        'Automated arrears registry documenting overdue previous months',
        '100% free trial with zero upfront subscription obligations'
      ]
    },
    'under10_maintenance': {
      badge: 'Light Plan: Gatekeeper Supplies Tracking',
      title: 'Petty Cash & Fast Supplies Management System',
      subtitle: 'Accurate monthly settlement for stair cleaning, bulbs, and minor plumbing',
      impact: 'Saves you the hassle of collecting scattered receipts and automatically reconciles gatekeeper cash advances.',
      features: [
        'Record cash advances with instant digital disbursement vouchers',
        'Voice input with Uncle Amin to log daily supplies on the go',
        'Attach receipt photos directly via mobile camera',
        'Periodic petty cash closing showing verified cash in hand'
      ]
    },
    'under10_bills': {
      badge: 'Fair Plan: Simple Utility Allocation',
      title: 'Fair Shared Water & Staircase Electricity Splitter',
      subtitle: 'Mathematical precision and complete transparency across all units',
      impact: 'Prevents heated disputes over water meter bills and shared hallway power cards.',
      features: [
        'Master water meter bill splitter with ground-floor exemption toggle',
        'Hallway electricity card balance tracking and top-up alerts',
        'Equal water pump maintenance cost distribution',
        'Export clear, readable PDF balance sheets to share with owners'
      ]
    },
    'under10_paperwork': {
      badge: 'Digital Plan: Streamlined Archive',
      title: 'Smart Cloud & Local Archive for Small Buildings',
      subtitle: 'Say goodbye to scattered paper notebooks and lost ledgers',
      impact: 'Organizes all building finances directly on your phone, with offline storage that requires no permanent internet.',
      features: [
        '8 accounting reports in one tap without prior financial experience',
        'Instant local backups with safe Google Cloud synchronization',
        'Import existing Excel spreadsheets in one click',
        'Passcode protection for treasurer security and privacy'
      ]
    },
    '10to25_arrears': {
      badge: 'Standard Plan: Firm Collection & Resident Portal',
      title: 'Firm Collection System & Digital Resident Portal',
      subtitle: 'The ideal solution for medium buildings to stabilize monthly cash flow',
      impact: 'Boosts collection rates to 95% within the first month and eliminates delayed subscriptions.',
      features: [
        'Smart Resident Portal with unique secret PIN per apartment',
        'Automated WhatsApp payment reminders 2 days before the due date',
        'Certified A4 printable arrears sheet for the building entrance board',
        'Multi-channel payment logging: Cash, InstaPay, and Bank Transfers'
      ]
    },
    '10to25_maintenance': {
      badge: 'Professional Plan: Preventive Maintenance Engineering',
      title: 'Elevator Maintenance Contracts & Petty Cash Control',
      subtitle: 'Integrated management for elevator contracts, cleaning, and contingency funds',
      impact: 'Saves up to 20% on maintenance costs by documenting contractor warranties and avoiding sudden breakdowns.',
      features: [
        'Scheduled preventive maintenance calendar for elevators & water pumps',
        'Isolated gatekeeper cash advance accounts with monthly closing',
        'Contractor agreement documentation and spare parts warranty tracking',
        'Dedicated contingency emergency fund for major repairs'
      ]
    },
    '10to25_bills': {
      badge: 'Engineering Plan: Precise Utility Allocation',
      title: 'Engineering Fair Distribution & Utility Calculators',
      subtitle: 'Certified formulas for consumption differentials and elevator services',
      impact: 'Permanently ends monthly arguments between different floors over electricity and water bills.',
      features: [
        'Fair allocation calculator for shared water meters based on floor and residents',
        'Fair elevator maintenance distribution excluding non-beneficiary floors',
        'Color A4 notice posters for hallway announcements and billing rules',
        'Itemized monthly utility audit report exportable to Excel'
      ]
    },
    '10to25_paperwork': {
      badge: 'Board Plan: Comprehensive Financial Ledger',
      title: 'General Ledger System & Certified General Assembly Reports',
      subtitle: 'Complete institutional transparency before the annual owners association meeting',
      impact: 'Transforms financial records into audit-proof annual statements ready for official board meetings.',
      features: [
        'Automated general ledger (Paper Ledger replica) in A4 printable PDF',
        'Annual financial report with revenue, expenditures, and opening/closing balances',
        'AI-assisted Excel import (.xlsx) with column auto-matching and undo',
        'Official handover protocol generator for outgoing treasurers'
      ]
    },
    'over25_arrears': {
      badge: 'Executive Plan: High-Rise Arrears Protocol',
      title: 'High-Volume Collection Protocol & Legal Notice Center',
      subtitle: 'Engineered for large towers and multi-entrance buildings',
      impact: 'Maintains tight financial discipline across 25+ apartments without manual bookkeeping overhead.',
      features: [
        'Batch generation of digital WhatsApp claim cards with direct payment link',
        'Official legal payment notice generator compliant with Egyptian HOA laws',
        'Multi-treasury separation (Cash box, CIB, Banque Misr, InstaPay)',
        'Real-time collection analytics with floor-by-floor breakdown'
      ]
    },
    'over25_maintenance': {
      badge: 'Enterprise Plan: Capital Facility Management',
      title: 'Capital Projects & Independent Maintenance Reserves',
      subtitle: 'Total financial separation between operating expenses and major structural overhauls',
      impact: 'Protects reserve funds and manages major renovation tenders with per-square-meter equity.',
      features: [
        'Independent project accounts for facade restoration and elevator modernization',
        'Per-square-meter quota calculator based on apartment surface area',
        'Vendor quotation comparison matrix and progress milestone disbursements',
        'Separate mosque and community hall treasury management'
      ]
    },
    'over25_bills': {
      badge: 'Multi-Rate Plan: Dynamic High-Rise Splitter',
      title: 'Commercial & Residential Consumption Differential System',
      subtitle: 'Separating ground-floor commercial shops, clinics, and residential apartments',
      impact: 'Applies fair commercial load multipliers so residential tenants do not subsidize commercial businesses.',
      features: [
        'Commercial shop vs residential unit maintenance fee calculator',
        'Shared central air-conditioning and water pump sub-meter calculations',
        'Automatic late payment interest and penalty assessment configuration',
        'Multi-currency / multi-account bank statement reconciliation'
      ]
    },
    'over25_paperwork': {
      badge: 'Institutional Plan: Enterprise Audit & Cloud Sync',
      title: 'Enterprise HOA Cloud Governance & Audit Trail',
      subtitle: 'Full financial compliance, multi-admin roles, and tamper-proof logging',
      impact: 'Provides bank-grade accounting transparency for board of directors and legal auditors.',
      features: [
        'Role-based access: Chairman, Treasurer, Auditor, and Resident View',
        'Encrypted cloud synchronization across multiple smartphones and tablets',
        'Complete audit trail of every receipt, payment, and expense adjustment',
        'Instant export to executive PDF dashboards and formatted Excel workbooks'
      ]
    },
    'compound_arrears': {
      badge: 'Compound Plan: Master Collection & Gate Access',
      title: 'Master HOA Revenue & Resident Gate Coordination',
      subtitle: 'High-level financial control for gated compounds, villas, and mixed-use malls',
      impact: 'Automates recurring community fees, arrears enforcement, and resident clearance certificates.',
      features: [
        'Comprehensive master billing schedule for maintenance, security, and gardening',
        'Resident clearance certificate generator for unit sales and tenant move-outs',
        'Automated bulk WhatsApp billing notifications with direct InstaPay links',
        'Legal arrears escalation tracking with formal registry documentation'
      ]
    },
    'compound_maintenance': {
      badge: 'Infrastructure Plan: Large-Scale Facility Assets',
      title: 'Infrastructure Asset Management & Security Contingency',
      subtitle: 'Centralized control for generators, gates, landscaping, and CCTV networks',
      impact: 'Monitors ongoing facility contracts and guarantees vendor SLA delivery across the entire compound.',
      features: [
        'Contractor service agreements tracker with automated renewal reminders',
        'Petty cash advance tracking across multiple site supervisors and security guards',
        'Emergency infrastructure reserve fund with multi-signature expenditure logs',
        'Asset depreciation and equipment warranty management'
      ]
    },
    'compound_bills': {
      badge: 'District Plan: Area-Weighted Utility Matrix',
      title: 'Area-Weighted Utility Matrix & Central Infrastructure Allocation',
      subtitle: 'Equitable allocation for street lighting, irrigation pumps, and security gatehouses',
      impact: 'Calculates precise unit shares based on land area, built-up area, and usage classification.',
      features: [
        'Surface area proportioning formula for common grounds maintenance',
        'Irrigation and landscape water consumption splitting',
        'Dedicated generator fuel and emergency power cost allocation',
        'Monthly comparative utility consumption variance analysis'
      ]
    },
    'compound_paperwork': {
      badge: 'Master Governance: Institutional Compliance',
      title: 'Institutional HOA Governance & Certified Financial Reporting',
      subtitle: 'Boardroom-ready financial reporting compliant with regulatory property statutes',
      impact: 'Prepares institutional balance sheets, budget projections, and audited statements with zero manual error.',
      features: [
        'Comprehensive annual budget forecasting with variance analysis',
        'Board of Directors executive summary with financial KPI graphs',
        'Full bilingual report export (Arabic / English) for multinational residents',
        'Complete cloud synchronization with enterprise data retention'
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

    var isEn = document.documentElement && document.documentElement.lang === 'en';
    var SIZE_LABELS = {
      'under10': isEn ? '🏠 Small Building (<10 units)' : '🏠 عمارة صغيرة (<10 شقق)',
      '10to25': isEn ? '🏢 Medium Building (10-25 units)' : '🏢 عمارة متوسطة (10-25 شقة)',
      'over25': isEn ? '🏙️ Large Tower (>25 units)' : '🏙️ برج كبير (>25 شقة)',
      'compound': isEn ? '🏰 Residential Compound / Mall' : '🏰 كمبوند / مجمع سكني'
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
      var activeMatrix = isEn ? matrixEn : matrix;
      var outcome = activeMatrix[key] || activeMatrix['10to25_arrears'];

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
