/**
 * Sandooq El-Amara — 50 New Interactive Tools Definitions (Part 2: Tools 39 - 70)
 * Clean Vanilla JS Architecture, Real Engineering / Financial / Legal Calculations
 */

module.exports = [
  // ==========================================
  // GROUP 3: حاسبات ومولدات الكهرباء والطاقة والمصاعد (8 أدوات: 39 - 46)
  // ==========================================
  {
    slug: 'solar-power-roi-calculator',
    title: 'حاسبة الجدوى الاقتصادية للطاقة الشمسية لخدمات العقار وتكلفة التركيب',
    shortTitle: 'حاسبة طاقة شمسية لخدمات العمارة',
    desc: 'احسب عدد الألواح الشمسية المطلوبة لتشغيل مصعد العقار وإنارة السلم وموتور المياه، مع التكلفة التقديرية وفترة استرداد رأس المال بالسنوات.',
    icon: '☀️',
    category: 'طاقة وكهرباء',
    keywords: 'طاقة شمسية الواح شمسية انارة سلم كهرباء مصعد عداد تبادلي طاقة نظيفة عمارة استرداد تكلفة',
    inputs: [
      { id: 'monthlyElecBill', label: 'متوسط فاتورة كهرباء الخدمات الشهرية (ج)', type: 'number', default: '2800' },
      { id: 'systemType', label: 'نوع نظام الطاقة الشمسية', type: 'select', options: ['نظام متصل بالشبكة (On-Grid / عداد تبادلي - الأوفر اقتصادياً)', 'نظام هجين مع بطاريات ليثيوم (Hybrid - يعمل أثناء انقطاع الكهرباء)'], default: 'نظام متصل بالشبكة (On-Grid / عداد تبادلي - الأوفر اقتصادياً)' },
      { id: 'flatsCount', label: 'عدد شقق العمارة المشاركة', type: 'number', default: '10' }
    ],
    calcLogic: `
      const bill = parseFloat(inputs.monthlyElecBill) || 1000;
      const flats = parseInt(inputs.flatsCount) || 1;
      const isHybrid = inputs.systemType.includes('Hybrid');

      // تقدير الكيلووات المطلوب: كل 1000 جنيه فاتورة تعادل تقريباً محطة 1.5 - 2 كيلووات
      const kwCapacity = Math.max(3, Math.round((bill / 600) * 10) / 10);
      const panelsCount = Math.ceil(kwCapacity * 1000 / 550); // ألواح 550 واط

      const costPerKw = isHybrid ? 38000 : 25000; // تكلفة الكيلووات شاملا الإنفرتر والتركيب
      const totalSystemCost = Math.round(kwCapacity * costPerKw);
      const annualSavings = bill * 12;
      const paybackYears = (totalSystemCost / annualSavings).toFixed(1);
      const sharePerFlat = Math.round(totalSystemCost / flats);

      return {
        recCapacity: kwCapacity + ' كيلووات (kW)',
        panelsNeeded: panelsCount + ' لوح شمسي (قدرة 550W)',
        totalCost: totalSystemCost.toLocaleString() + ' ج',
        sharePerFlat: sharePerFlat.toLocaleString() + ' ج/شقة',
        payback: paybackYears + ' سنة (فترة الاسترداد)',
        roiDesc: 'بعد مرور ' + paybackYears + ' سنة، تصبح كهرباء المصعد والسلم وموتور المياه مجانية بالكامل لمدة 20 سنة إضافية (عمر الألواح الافتراضي 25 سنة).'
      };
    `,
    resultFields: [
      { label: 'سعة المحطة المطلوبة', id: 'recCapacity', isHighlight: false },
      { label: 'عدد الألواح المقترحة', id: 'panelsNeeded', isHighlight: false },
      { label: 'إجمالي تكلفة المحطة بالتركيب', id: 'totalCost', isHighlight: true },
      { label: 'نصيب الشقة الواحدة', id: 'sharePerFlat', isHighlight: false },
      { label: 'فترة استرداد رأس المال', id: 'payback', isHighlight: true }
    ],
    faqs: [
      { q: 'ما الفرق بين نظام On-Grid و Hybrid في طاقة العمارة؟', a: 'نظام On-Grid أقل تكلفة بنسبة 40% ويربط بالعداد التبادلي لخصم الفاتورة ولكنه يفصل وقت انقطاع التيار للأمان، بينما الـ Hybrid يضم بطاريات لتشغيل المصعد والإنارة حتى أثناء تخفيف الأحمال.' }
    ]
  },

  {
    slug: 'ev-charger-electricity-calculator',
    title: 'حاسبة استهلاك وتكلفة كهرباء شاحن السيارة الكهربائية بالجراج',
    shortTitle: 'حاسبة شواحن السيارات الكهربائية بالجراج',
    desc: 'احسب استهلاك شاحن السيارة الكهربائية (Wallbox) بالكيلووات/ساعة، وافصل تكلفته شهرياً بدقة عن عداد خدمات العمارة المشترك.',
    icon: '🚗',
    category: 'طاقة وكهرباء',
    keywords: 'شاحن سيارة كهربائية جراج عمارة wallbox كيلووات كارت كهرباء خدمات حساب شحن تسلا ev',
    inputs: [
      { id: 'chargerKw', label: 'قدرة الشاحن (كيلووات)', type: 'select', options: ['7.4 كيلووات (أحادي الطور 1-Phase - الأكثر شيوعاً)', '11 كيلووات (ثلاثي الطور 3-Phase - شحن متوسط)', '22 كيلووات (شاحن سريع 3-Phase)'], default: '7.4 كيلووات (أحادي الطور 1-Phase - الأكثر شيوعاً)' },
      { id: 'weeklyHours', label: 'متوسط ساعات الشحن أسبوعياً', type: 'number', default: '20' },
      { id: 'kwhRate', label: 'سعر الكيلووات التجاري/الخدمي (ج)', type: 'number', default: '2.14' }
    ],
    calcLogic: `
      let kw = 7.4;
      if (inputs.chargerKw.includes('11')) kw = 11;
      else if (inputs.chargerKw.includes('22')) kw = 22;

      const hrs = parseFloat(inputs.weeklyHours) || 10;
      const rate = parseFloat(inputs.kwhRate) || 2.0;

      const weeklyKwh = kw * hrs;
      const monthlyKwh = weeklyKwh * 4.3;
      const monthlyCost = Math.round(monthlyKwh * rate);
      const submeterSubCost = 1200; // تكلفة تركيب عداد فرعي ديجيتال

      return {
        monthlyUnits: Math.round(monthlyKwh) + ' ك.و.س/شهرياً',
        costDue: monthlyCost.toLocaleString() + ' ج/شهرياً',
        submeterTip: 'تكلفة عداد ديجيتال فرعي مستقل للشاحن: حوالي ' + submeterSubCost + ' جنيه، وتعتبر إلزامية لحساب صاحب السيارة بدقة دون ظلم باقي الجيران.',
        electricalSafety: kw > 7.4 ? '⚠️ تنبيه كهربائي: شواحن 11kW و22kW تتطلب كابل نحاس معزول 10مم أو 16مم متصل مباشرة باللوحة الرئيسية مع قاطع تفاضلي RCD Type-B لحماية العمارة من الحريق.' : '✅ شاحن 7.4kW آمن لمعظم شبكات العمارات بكابل 6مم وقاطع 32 أمبير.'
      };
    `,
    resultFields: [
      { label: 'الاستهلاك الشهري التقديري', id: 'monthlyUnits', isHighlight: false },
      { label: 'المبلغ المستحق على مالك السيارة شهرياً', id: 'costDue', isHighlight: true }
    ],
    faqs: [
      { q: 'هل يجوز للساكن شحن سيارته من فيشة السلم العادية؟', a: 'ممنوع تماماً وخطير هندسياً، لأن الفيش العادية مصممة لـ 10-16 أمبير فقط واستمرار سحب 32 أمبير عليها يسبب ذوبان الأسلاك واشتعال لوحة الخدمات.' }
    ]
  },

  {
    slug: 'generator-fuel-cost-calculator',
    title: 'حاسبة تكلفة تشغيل وصيانة مولد الطوارئ (الديزل) وتوزيع استهلاك الوقود',
    shortTitle: 'حاسبة تشغيل مولد الديزل والوقود',
    desc: 'احسب استهلاك السولار لمولد الكهرباء الاحتياطي بالعقار بالساعة وتكلفة الزيوت والفلاتر وتوزيع فاتورة التشغيل بعدد ساعات الطوارئ.',
    icon: '⛽',
    category: 'طاقة وكهرباء',
    keywords: 'مولد كهرباء ديزل سولار انقطاع كهرباء تشغيل مولد مصعد طوارئ تكلفة لتر سولار عمارة',
    inputs: [
      { id: 'genKva', label: 'قدرة المولد (KVA)', type: 'select', options: ['15 KVA (إنارة سلم وموتور مياه)', '30 KVA (تشغيل مصعد + موتور + سلم)', '50 KVA (تشغيل مصعدين + مواتير + خدمات كاملة)'], default: '30 KVA (تشغيل مصعد + موتور + سلم)' },
      { id: 'outageHours', label: 'ساعات التشغيل خلال الشهر', type: 'number', default: '35' },
      { id: 'dieselPrice', label: 'سعر لتر السولار (ج)', type: 'number', default: '13.5' },
      { id: 'flatsCount', label: 'عدد الشقق المشاركة بالخدمة', type: 'number', default: '12' }
    ],
    calcLogic: `
      let burnRatePerHour = 6.0; // لتر بالساعة لمولد 30 KVA بحمل 75%
      if (inputs.genKva.includes('15')) burnRatePerHour = 3.5;
      else if (inputs.genKva.includes('50')) burnRatePerHour = 9.5;

      const hrs = parseFloat(inputs.outageHours) || 10;
      const price = parseFloat(inputs.dieselPrice) || 13.5;
      const flats = parseInt(inputs.flatsCount) || 1;

      const totalLiters = hrs * burnRatePerHour;
      const fuelCost = totalLiters * price;
      const maintenanceFund = hrs * 25; // مخصص زيوت وفلاتر وصيانة دورية
      const grandTotal = Math.round(fuelCost + maintenanceFund);
      const perFlat = Math.round(grandTotal / flats);

      return {
        litersUsed: Math.round(totalLiters) + ' لتر سولار',
        fuelBill: Math.round(fuelCost).toLocaleString() + ' ج (تكلفة وقود)',
        maintReserve: Math.round(maintenanceFund).toLocaleString() + ' ج (صيانة وزيوت)',
        totalExpense: grandTotal.toLocaleString() + ' ج',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة',
        safetyTip: 'يجب تخزين السولار في براميل حديدية محكمة بعيداً عن غرفة المحولات، وتشغيل المولد أسبوعياً لمدة 10 دقائق لتسخين المحرك وشحن بطارية المارش.'
      };
    `,
    resultFields: [
      { label: 'إجمالي استهلاك الوقود', id: 'litersUsed', isHighlight: false },
      { label: 'تكلفة السولار الفعلي', id: 'fuelBill', isHighlight: false },
      { label: 'إجمالي التكلفة شاملة الصيانة', id: 'totalExpense', isHighlight: true },
      { label: 'حصة كل شقة هذا الشهر', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'كم لتر سولار يستهلك مولد 30 KVA بالساعة؟', a: 'يستهلك ما بين 5 إلى 7 لترات في الساعة حسب نسبة الحمل (Load Factor) وعدد الأجهزة المتصلة وقت انقطاع التيار.' }
    ]
  },

  {
    slug: 'elevator-power-consumption-calculator',
    title: 'حاسبة استهلاك الأسانسير الفعلي من الكهرباء وعدد الرحلات اليومية',
    shortTitle: 'حاسبة استهلاك الأسانسير للكهرباء',
    desc: 'احسب كم كيلووات يستهلكه مصعد العمارة شهرياً وتكلفته في الفاتورة بحسب قدرة الموتور (كيلووات/حصان) وعدد الأدوار والرحلات.',
    icon: '🛗',
    category: 'طاقة وكهرباء',
    keywords: 'كهرباء اسانسير استهلاك مصعد فاتورة كهرباء خدمات موتور مصعد انفرتر رحلات اسانسير',
    inputs: [
      { id: 'motorKw', label: 'قدرة ماكينة المصعد', type: 'select', options: ['5.5 كيلووات / 7.5 حصان (مصعد 4-5 أفراد تقليدي)', '7.5 كيلووات / 10 حصان (مصعد 6-8 أفراد عمارة عالية)', '4.0 كيلووات (ماكينة بدون تروس Gearless حديثة)'], default: '5.5 كيلووات / 7.5 حصان (مصعد 4-5 أفراد تقليدي)' },
      { id: 'tripsPerDay', label: 'متوسط عدد رحلات المصعد يومياً', type: 'number', default: '120' },
      { id: 'tripSeconds', label: 'متوسط مدة الرحلة (ثواني)', type: 'number', default: '35' },
      { id: 'hasInverter', label: 'هل الكنترول مزود بجهاز إنفرتر (VVVF)؟', type: 'select', options: ['نعم، مزود بإنفرتر (موفر للطاقة)', 'لا، كنترول عادي بسرعتين (تقليدي)'], default: 'لا، كنترول عادي بسرعتين (تقليدي)' }
    ],
    calcLogic: `
      let kw = 5.5;
      if (inputs.motorKw.includes('7.5')) kw = 7.5;
      else if (inputs.motorKw.includes('4.0')) kw = 4.0;

      const trips = parseFloat(inputs.tripsPerDay) || 100;
      const sec = parseFloat(inputs.tripSeconds) || 30;
      const isInverter = inputs.hasInverter.includes('نعم');

      // ساعات التشغيل الفعلي يومياً
      const runningHoursDaily = (trips * sec) / 3600;
      let monthlyKwh = runningHoursDaily * kw * 30 * 0.7; // 0.7 معامل تحميل متوسط
      if (isInverter) monthlyKwh *= 0.65; // الإنفرتر يوفر 35% من تيار البدء والحركة

      const tariff = 2.14; // شريحة خدمات
      const monthlyCost = Math.round(monthlyKwh * tariff);

      return {
        dailyRunningTime: runningHoursDaily.toFixed(1) + ' ساعة حركة صافية يومياً',
        monthlyUnits: Math.round(monthlyKwh) + ' كيلووات.ساعة/شهر',
        estimatedBill: monthlyCost.toLocaleString() + ' ج/شهرياً',
        savingsPotential: isInverter ? 'النظام الحالي موفر ومجهز بإنفرتر.' : 'تركيب إنفرتر سيوفر لعقارتكم حوالي ' + Math.round(monthlyCost * 0.35) + ' ج شهرياً ويحمي الماكينة من النتشة.',
        standbyPower: 'استهلاك الكنترول وشاشة الباب والإضاءة في وضع الاستعداد: حوالي 40-60 ك.و.س شهرياً إضافية.'
      };
    `,
    resultFields: [
      { label: 'ساعات التشغيل الفعلي', id: 'dailyRunningTime', isHighlight: false },
      { label: 'الاستهلاك الشهري بالكيلووات', id: 'monthlyUnits', isHighlight: false },
      { label: 'تكلفة كهرباء المصعد الشهرية', id: 'estimatedBill', isHighlight: true }
    ],
    faqs: [
      { q: 'كم تبلغ نسبة كهرباء الأسانسير من إجمالي فاتورة خدمات العمارة؟', a: 'تمثل كهرباء المصعد عادةً ما بين 60% إلى 75% من إجمالي فاتورة كارت السلم والخدمات في المباني السكنية المتوسطة.' }
    ]
  },

  {
    slug: 'elevator-cable-sheave-wear-calculator',
    title: 'حاسبة ومؤشر استهلاك وايرات وطارات المصعد وتحديد موعد التغيير',
    shortTitle: 'حاسبة فحص تآكل وايرات وطارات المصعد',
    desc: 'أداة تقييم أمان وايرات الجر (Cables) وطارة الماكينة: احسب نسبة هبوط الحبال في المجاري وتحديد ما إذا كان الأسانسير في مرحلة خطر تستوجب التغيير.',
    icon: '⚙️',
    category: 'طاقة وكهرباء',
    keywords: 'وايرات مصعد حبال اسانسير طارة ماكينة تاكل الوايرات كشف امان اسانسير تغيير حبال جر',
    inputs: [
      { id: 'cablesAge', label: 'عمر وايرات المصعد الحالية (بالسنوات)', type: 'number', default: '5', min: 1, max: 25 },
      { id: 'dailyTrips', label: 'كثافة الاستخدام اليومي', type: 'select', options: ['خفيفة (عمارة 4-6 شقق)', 'متوسطة (عمارة 8-14 شقة)', 'عالية / برج تجاري (أكثر من 15 شقة وعيادات)'], default: 'متوسطة (عمارة 8-14 شقة)' },
      { id: 'visibleFlaws', label: 'الملاحظات البصرية عند فحص الواير', type: 'select', options: ['سليم ولا توجد شعيرات مقطوعة', 'ظهور صدأ خفيف أو بودرة حمراء مع شعيرات معدودة', 'شعيرات مقطوعة واضحة ونحافة ملحوظة في قطر الواير'], default: 'ظهور صدأ خفيف أو بودرة حمراء مع شعيرات معدودة' }
    ],
    calcLogic: `
      const age = parseFloat(inputs.cablesAge) || 1;
      let score = age * 10;
      if (inputs.dailyTrips.includes('عالية')) score += 30;
      else if (inputs.dailyTrips.includes('متوسطة')) score += 15;

      if (inputs.visibleFlaws.includes('شعيرات مقطوعة')) score += 40;
      else if (inputs.visibleFlaws.includes('صدأ خفيف')) score += 20;

      let status = 'آمن ومستقر';
      let action = 'فحص دوري عادي كل 6 أشهر مع التشحيم بالزيت الموصى به.';
      if (score >= 65 && score < 85) {
        status = 'تنبيه: اقتراب انتهاء العمر الافتراضي';
        action = 'يجب قياس قطر الواير بكوليس ورنيه (Vernier) والتجهيز المالي لتغيير طقم الحبال خلال 3-6 أشهر.';
      } else if (score >= 85) {
        status = '🚨 خطر حرج: إيقاف فوري وتغيير إلزامي';
        action = 'يجب إيقاف المصعد واستبدال طقم الوايرات وفحص طارة الجر (Sheave) فوراً منعاً لانزلاق الصاعدة أو انقطاع الحبل.';
      }

      const estCost = 14000; // طقم وايرات إيطالي مع مصنعية التركيب

      return {
        wearIndex: Math.min(100, score) + '% (مؤشر الاستهلاك الإجمالي)',
        safetyStatus: status,
        recommendedAction: action,
        costEstimate: estCost.toLocaleString() + ' ج (تكلفة طقم وايرات معتمد شامل المصنعية)',
        legalStandard: 'وفقاً للكود المصري للمصاعد، يُلزم بتغيير الواير فور انخفاض قطره بنسبة 10% أو وجود أكثر من 6 شعيرات مقطوعة في لفة حبل واحدة.'
      };
    `,
    resultFields: [
      { label: 'مؤشر استهلاك الوايرات', id: 'wearIndex', isHighlight: false },
      { label: 'تقييم السلامة والأمان', id: 'safetyStatus', isHighlight: true },
      { label: 'الإجراء الهندسي العاجل', id: 'recommendedAction', isHighlight: false }
    ],
    faqs: [
      { q: 'ما سبب ظهور بودرة حمراء على وايرات الأسانسير؟', a: 'البودرة الحمراء تدل على تآكل النواة الداخلية للواير بسبب جفاف التزييت والاحتكاك المباشر بين أسلاك الفولاذ، وهي علامة إنذار لقرب تلف الحبل.' }
    ]
  },

  {
    slug: 'smart-lock-rfid-cost-calculator',
    title: 'حاسبة مقايسة تركيب كالون مغناطيسي وكروت ذكية لباب العمارة',
    shortTitle: 'حاسبة الكالون المغناطيسي وكروت الدخول',
    desc: 'احسب تكلفة تحويل باب العمارة الحديدي إلى نظام ذكي: كالون كهرومغناطيسي، باور سبلاي احتياطي، ماكينة قفل هيدروليك، وحصة الشقة.',
    icon: '🚪',
    category: 'طاقة وكهرباء',
    keywords: 'كالون مغناطيسي باب عمارة ماكينة هيدروليك كروت ذكية rfid لوحة تحكم دخول باور سبلاي بطارية طوارئ',
    inputs: [
      { id: 'gateType', label: 'حجم ونوع باب العمارة', type: 'select', options: ['باب حديد فردة واحدة قياسي', 'باب حديد ضلفتين كبير (مدخل رئيسي)', 'باب زجاج سيكوريت'], default: 'باب حديد فردة واحدة قياسي' },
      { id: 'batteryBackup', label: 'تجهيز بطارية طوارئ (تعمل عند انقطاع الكهرباء)', type: 'select', options: ['نعم، باور سبلاي مع بطارية 12V 7A (موصى به)', 'لا، كالون عادي بدون بطارية'], default: 'نعم، باور سبلاي مع بطارية 12V 7A (موصى به)' },
      { id: 'fobsCount', label: 'عدد الميداليات والكروت المطلوبة للعمارة', type: 'number', default: '30' },
      { id: 'flatsCount', label: 'عدد شقق العمارة', type: 'number', default: '10' }
    ],
    calcLogic: `
      const fobs = parseInt(inputs.fobsCount) || 20;
      const flats = parseInt(inputs.flatsCount) || 1;
      const isTwoLeaves = inputs.gateType.includes('ضلفتين');
      const hasBattery = inputs.batteryBackup.includes('نعم');

      const magnetCost = isTwoLeaves ? 3200 : 1700; // مغناطيس 280-350 كجم
      const powerCost = hasBattery ? 1800 : 900;
      const hydraulicDoorCloser = 1200; // ذراع هيدروليكي أوتوماتيكي
      const keypadRfidReader = 1100; // لوحة أرقام سرية وكروت خارجية
      const exitButton = 250;
      const cardsCost = fobs * 35;
      const installLabor = 1500;

      const grandTotal = magnetCost + powerCost + hydraulicDoorCloser + keypadRfidReader + exitButton + cardsCost + installLabor;
      const perFlat = Math.round(grandTotal / flats);

      return {
        hardwareCost: (magnetCost + powerCost + hydraulicDoorCloser + keypadRfidReader + exitButton).toLocaleString() + ' ج',
        cardsTotalCost: cardsCost.toLocaleString() + ' ج (' + fobs + ' ميدالية وكارت)',
        laborCost: installLabor.toLocaleString() + ' ج (تأسيس وتوصيل وضمان)',
        totalProjectCost: grandTotal.toLocaleString() + ' ج',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة',
        safetyRule: 'يجب ضبط الكالون ليعمل بنظام (Fail-Safe) أي يفتح تلقائياً عند انقطاع الكهرباء التام أو إنذار الحريق لتمكين السكان من الخروج في الطوارئ.'
      };
    `,
    resultFields: [
      { label: 'تكلفة الأجهزة والمغناطيس', id: 'hardwareCost', isHighlight: false },
      { label: 'إجمالي المقايسة شاملة الكروت والتركيب', id: 'totalProjectCost', isHighlight: true },
      { label: 'نصيب كل شقة بالعمارة', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'ماذا يحدث للكالون المغناطيسي عند انقطاع الكهرباء؟', a: 'إذا كان مزوداً ببطارية طوارئ (UPS 12V) يستمر في العمل لمدة 8 إلى 12 ساعة، وبدون بطارية يفتح تلقائياً للأمان.' }
    ]
  },

  {
    slug: 'stair-motion-sensor-savings-calculator',
    title: 'حاسبة وفر استبدال مفاتيح السلم بحساسات حركة رادار (Radar Sensors)',
    shortTitle: 'حاسبة وفر حساسات إضاءة السلم',
    desc: 'احسب التوفير المالي المحقق عند استبدال لمبات السلم القديمة والتايمر بمصابيح ليد ذكية تعمل بمستشعرات الحركة الرادارية.',
    icon: '💡',
    category: 'طاقة وكهرباء',
    keywords: 'حساسات حركة حساس رادار لمبات ليد سلم توفير كهرباء السلم تايمر السلم انارة ذكية عمارة',
    inputs: [
      { id: 'floors', label: 'عدد أدوار العقار', type: 'number', default: '6' },
      { id: 'lampsPerFloor', label: 'عدد اللمبات في كل دور + المدخل', type: 'number', default: '2' },
      { id: 'currentLampsWatt', label: 'نوع وقدرة اللمبات الحالية', type: 'select', options: ['لمبات ليد عادية تُترك مضاءة ليلاً (12 واط)', 'لمبات صفراء قديمة / موفرة قديمة (25-40 واط)', 'تايمر ميكانيكي قديم يعلق ويستهلك مستمراً'], default: 'لمبات ليد عادية تُترك مضاءة ليلاً (12 واط)' }
    ],
    calcLogic: `
      const f = parseInt(inputs.floors) || 5;
      const lampsPerFloor = parseInt(inputs.lampsPerFloor) || 2;
      const totalLamps = f * lampsPerFloor + 2; // +2 للمدخل الخارجي

      let oldWatt = 15;
      let burningHoursDaily = 12; // تترك طوال الليل
      if (inputs.currentLampsWatt.includes('40')) { oldWatt = 35; burningHoursDaily = 14; }
      else if (inputs.currentLampsWatt.includes('تايمر')) { oldWatt = 20; burningHoursDaily = 10; }

      const oldKwhMonthly = (totalLamps * oldWatt * burningHoursDaily * 30) / 1000;
      
      // نظام الحساس الذكي (لمبة 9 واط تضيء فقط 1.5 ساعة تراكمياً لكل دور عند المرور)
      const newKwhMonthly = (totalLamps * 9 * 1.5 * 30) / 1000;
      const kwhSaved = Math.max(0, oldKwhMonthly - newKwhMonthly);
      const monthlySavingsCash = Math.round(kwhSaved * 2.14);
      const annualSavingsCash = monthlySavingsCash * 12;

      // تكلفة تركيب لمبات ليد برادار مدمج (سعر اللمبة بالدواية حوالي 160 ج)
      const upgradeCost = totalLamps * 160;
      const paybackMonths = Math.max(1, Math.round((upgradeCost / monthlySavingsCash) * 10) / 10);

      return {
        lampsCount: totalLamps + ' مصباح إضاءة',
        monthlySaving: monthlySavingsCash.toLocaleString() + ' ج/شهرياً',
        annualSaving: annualSavingsCash.toLocaleString() + ' ج/سنوياً',
        projectCost: upgradeCost.toLocaleString() + ' ج (شراء وتركيب)',
        paybackTime: paybackMonths + ' شهر (استرداد ثمن اللمبات بالكامل)',
        recom: 'حساسات الرادار (Microwave Radar) تعمل بكفاءة حتى لو وُضعت اللمبة داخل زجاج الفانوس وتغطي مدى 360 درجة، وهي أفضل بمراحل من حساسات الأشعة (PIR).'
      };
    `,
    resultFields: [
      { label: 'إجمالي لمبات السلم والمدخل', id: 'lampsCount', isHighlight: false },
      { label: 'الوفر المالي الشهري', id: 'monthlySaving', isHighlight: true },
      { label: 'الوفر المالي السنوي المتوقع', id: 'annualSaving', isHighlight: false },
      { label: 'فترة استرداد تكلفة التركيب', id: 'paybackTime', isHighlight: true }
    ],
    faqs: [
      { q: 'هل تحتاج لمبات حساسات الرادار لتعديل أسلاك السلم؟', a: 'لا على الإطلاق، يتم إلغاء تايمر السلم وتوصيل الكهرباء المباشرة 220V للدوايات، وتركيب لمبة الرادار الذكية مكان اللمبة القديمة مباشرة دون أي تكسير.' }
    ]
  },

  {
    slug: 'emergency-lighting-battery-calculator',
    title: 'حاسبة زمن تشغيل بطاريات كشافات الطوارئ وتكلفة تجهيز السلالم',
    shortTitle: 'حاسبة كشافات وبطاريات طوارئ السلم',
    desc: 'احسب سعة البطارية (أمبير/ساعة) المطلوبة لتغذية إضاءة السلم وبوابة العمارة أثناء انقطاع الكهرباء لمدة ساعتين إلى 4 ساعات بأمان.',
    icon: '🔋',
    category: 'طاقة وكهرباء',
    keywords: 'كشاف طوارئ بطارية سلم انقطاع كهرباء شحن بطاريات ليد طوارئ تجهيز سلم عمارة',
    inputs: [
      { id: 'floorsCount', label: 'عدد الأدوار المطلوب إنارتها بالطوارئ', type: 'number', default: '6' },
      { id: 'backupHours', label: 'عدد ساعات التشغيل المستهدفة', type: 'number', default: '3' },
      { id: 'solutionType', label: 'نوع الحل المفضل', type: 'select', options: ['كشافات طوارئ مستقلة قابلة للشحن في كل دور', 'نظام مركزي: إنفرتر + بطارية عمومية للسلالم'], default: 'كشافات طوارئ مستقلة قابلة للشحن في كل دور' }
    ],
    calcLogic: `
      const f = parseInt(inputs.floorsCount) || 5;
      const hrs = parseFloat(inputs.backupHours) || 2;
      const isCentral = inputs.solutionType.includes('مركزي');

      let totalCost = 0;
      let specs = '';
      if (!isCentral) {
        // كشاف طوارئ ليد ليثيوم لكل دور + المدخل (سعر الكشاف 350 ج)
        const units = f + 1;
        totalCost = units * 380;
        specs = units + ' كشاف ليد بطارية ليثيوم مدمجة (قدرة 3-4 ساعات إضاءة).';
      } else {
        // إنفرتر صغير 1000 واط مع بطارية جل 100Ah
        totalCost = 14500;
        specs = 'إنفرتر 12V/1000W نقي + بطارية جل 100Ah لتغذية شبكة إنارة السلم بالكامل.';
      }

      return {
        solutionSpecs: specs,
        totalEstimate: totalCost.toLocaleString() + ' ج',
        sharePerFlat: Math.round(totalCost / Math.max(1, f * 2)).toLocaleString() + ' ج/شقة (بافتراض شقتين بالدور)',
        maintenanceAdvice: 'للحفاظ على بطاريات الطوارئ، يجب فصل التيار عنها وتفريغها شهرياً ثم إعادة شحنها حتى لا تفقد سعتها الكيميائية.'
      };
    `,
    resultFields: [
      { label: 'المواصفات الهندسية', id: 'solutionSpecs', isHighlight: false },
      { label: 'إجمالي المقايسة التقديرية', id: 'totalEstimate', isHighlight: true },
      { label: 'حصة الشقة المقترحة', id: 'sharePerFlat', isHighlight: false }
    ],
    faqs: [
      { q: 'أيهما أفضل: كشاف مستقل لكل دور أم إنفرتر مركزي للسلم؟', a: 'الكشافات المستقلة أرخص وأسهل في التركيب دون الحاجة لشبكة أسلاك إضافية، بينما الإنفرتر المركزي يعطي إضاءة أقوى ويغذي كاميرات المراقبة والكالون المغناطيسي في آن واحد.' }
    ]
  },

  // ==========================================
  // GROUP 4: حاسبات ومولدات التشطيبات والواجهات (8 أدوات: 47 - 54)
  // ==========================================
  {
    slug: 'building-facade-painting-calculator',
    title: 'حاسبة تكلفة دهان واجهة العمارة وسقالات العمل وحصة الشقة',
    shortTitle: 'حاسبة دهان وتشطيب واجهة العمارة',
    desc: 'احسب كمية وخامات دهان الواجهات الخارجية (سافيتو / جرافياتو / بلاستيك مطاطي)، وتكلفة السقالات والعمالة وحصة كل شقة حسب الدور أو المساحة.',
    icon: '🎨',
    category: 'تشطيب وترميم',
    keywords: 'دهان واجهة جرافياتو سافيتو سقالات خارجية تشطيب واجهات ترميم عمارة حصة شقة تكلفة',
    inputs: [
      { id: 'facadeWidth', label: 'عرض واجهة العمارة (متر)', type: 'number', default: '14' },
      { id: 'floorsCount', label: 'عدد الأدوار السكنية + الأرضي', type: 'number', default: '6' },
      { id: 'paintType', label: 'نوع خامة الدهان المعتمدة', type: 'select', options: ['جرافياتو أكريليك / سافيتو ناعم (مقاوم للشمس)', 'دهان مطاطي واجهات عازل (Elastomeric)', 'بياض محارة ملون عادي'], default: 'جرافياتو أكريليك / سافيتو ناعم (مقاوم للشمس)' },
      { id: 'flatsTotal', label: 'إجمالي عدد الشقق في العقار', type: 'number', default: '12' }
    ],
    calcLogic: `
      const w = parseFloat(inputs.facadeWidth) || 10;
      const f = parseInt(inputs.floorsCount) || 5;
      const flats = parseInt(inputs.flatsTotal) || 1;

      const height = f * 3.2;
      const grossArea = w * height;
      const netArea = Math.round(grossArea * 0.8); // استبعاد مساحات الشبابيك والبلكونات

      let ratePerMeter = 160;
      if (inputs.paintType.includes('مطاطي')) ratePerMeter = 210;
      else if (inputs.paintType.includes('بياض محارة')) ratePerMeter = 110;

      const scaffoldingCost = Math.round(grossArea * 30);
      const paintAndLabor = Math.round(netArea * ratePerMeter);
      const repairsAndPutty = Math.round(netArea * 35); // معالجة شروخ وسيلر مائي
      const total = scaffoldingCost + paintAndLabor + repairsAndPutty;
      const perFlat = Math.round(total / flats);

      return {
        surfaceArea: netArea + ' م² (المساحة الصافية للدهان)',
        scaffolding: scaffoldingCost.toLocaleString() + ' ج (إيجار وتركيب سقالات أمان)',
        totalCost: total.toLocaleString() + ' ج',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة',
        recom: 'يجب إلزام المقاول بعمل طبقة أساس (سيلر مائي مقاوم للقلويات) قبل الجرافياتو مع اشتراط توريد براميل معتمدة ذات تواريخ إنتاج حديثة.'
      };
    `,
    resultFields: [
      { label: 'المساحة الصافية المطلوب دهانها', id: 'surfaceArea', isHighlight: false },
      { label: 'تكلفة السقالات وتأمين العمل', id: 'scaffolding', isHighlight: false },
      { label: 'إجمالي مقايسة تجديد الواجهة', id: 'totalCost', isHighlight: true },
      { label: 'حصة كل شقة بالتساوي', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'هل يشارك صاحب الشقة الخلفية في دهان الواجهة الأمامية للعمارة؟', a: 'نعم قانوناً، لأن الواجهة الخارجية جزء مشترك يرفع من القيمة السوقية للعقار ككل، وتلتزم كل الشقق بالمساهمة في تجديدها.' }
    ]
  },

  {
    slug: 'entrance-marble-finishing-calculator',
    title: 'حاسبة تكلفة تجديد وتشطيب مدخل العمارة بالرخام والديكور والإضاءة',
    shortTitle: 'حاسبة تشطيب مدخل العمارة بالرخام',
    desc: 'احسب مقايسة تجديد مدخل العقار: تكسية الحوائط والأرضيات بالرخام (جلالة / بريشيا / كرارة)، والمرايا، وباب السيكوريت، وحصة الشقة.',
    icon: '🏛️',
    category: 'تشطيب وترميم',
    keywords: 'تشطيب مدخل رخام جلالة ارضيات مدخل عمارة مرايات سقف جبس بورد تجديد مدخل تكلفة شقة',
    inputs: [
      { id: 'entranceArea', label: 'مساحة أرضية المدخل (متر مربع)', type: 'number', default: '35' },
      { id: 'marbleType', label: 'نوع الرخام المختار للحوائط والأرضيات', type: 'select', options: ['رخام مصري فاخر (جلالة سادة / صني فص)', 'رخام إسباني / إيطالي (بريشيا / ديلكاتو / كرارة)', 'سيراميك وبورسلين واجهات حديث'], default: 'رخام مصري فاخر (جلالة سادة / صني فص)' },
      { id: 'includeDecor', label: 'تجهيزات ديكورية إضافية', type: 'select', options: ['شامل مرايا وبانوهات وسقف معلق سبوتات', 'رخام وتشطيب قياسي فقط'], default: 'شامل مرايا وبانوهات وسقف معلق سبوتات' },
      { id: 'flatsCount', label: 'عدد الشقق المشاركة', type: 'number', default: '12' }
    ],
    calcLogic: `
      const area = parseFloat(inputs.entranceArea) || 20;
      const flats = parseInt(inputs.flatsCount) || 1;
      const wallArea = area * 2.8; // مساحة حوائط تقريبية للمدخل بارتفاع 3 أمتار
      
      let marbleRate = 650; // للمتر توريد وتركيب وجلي وتلميع
      if (inputs.marbleType.includes('إسباني')) marbleRate = 1450;
      else if (inputs.marbleType.includes('بورسلين')) marbleRate = 450;

      const flooringCost = Math.round(area * marbleRate);
      const wallsCost = Math.round(wallArea * (marbleRate * 0.85));
      const decorCost = inputs.includeDecor.includes('شامل') ? 14000 : 3000;
      const lightingAndPainting = 6500;
      const total = flooringCost + wallsCost + decorCost + lightingAndPainting;
      const perFlat = Math.round(total / flats);

      return {
        flooringTotal: flooringCost.toLocaleString() + ' ج (أرضيات ودرج)',
        wallsTotal: wallsCost.toLocaleString() + ' ج (تجاليد الحوائط الرخام)',
        decorLighting: (decorCost + lightingAndPainting).toLocaleString() + ' ج (ديكور وإضاءة)',
        grandTotalCost: total.toLocaleString() + ' ج',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة',
        advice: 'يجب اشتراط تثبيت رخام الحوائط بالطريقة الميكانيكية بالكانات والمسامير الصلب، وتجنب اللصق بالمونة فقط لمنع سقوط البلاطات مستقبلاً.'
      };
    `,
    resultFields: [
      { label: 'أرضيات ودرج المدخل', id: 'flooringTotal', isHighlight: false },
      { label: 'تجاليد الحوائط بالرخام', id: 'wallsTotal', isHighlight: false },
      { label: 'إجمالي المقايسة الشاملة', id: 'grandTotalCost', isHighlight: true },
      { label: 'نصيب كل شقة بالعمارة', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'ما أفضل رخام يتحمل الاستخدام الكثيف لمدخل العمارة؟', a: 'يُفضل رخام الجلالة فص أو الصني المحروق للأرضيات لأنه صلب ومقاوم للاحتكاك، أو الجرانيت الرمادي/الأسود عند عتبات الباب الرئيسي.' }
    ]
  },

  {
    slug: 'crack-depth-risk-assessor',
    title: 'أداة تقييم خطورة شروخ الحوائط والخرسانة وتحديد نوع الإصلاح المطلوب',
    shortTitle: 'أداة تقييم خطورة شروخ المبنى',
    desc: 'أداة هندسية لتشخيص شروخ العمارة: ميز بين الشروخ السطحية في المحارة، والشروخ الإنشائية الخطيرة بالأعمدة والكمرات، مع توصية الإخلاء أو الترميم.',
    icon: '🏚️',
    category: 'تشطيب وترميم',
    keywords: 'شروخ العمارة شرخ عمود شرخ كمرة ترميم خرسانة صدأ حديد فحص انشائي تقرير هندسي خطورة شروخ',
    inputs: [
      { id: 'crackLocation', label: 'مكان الشرخ الظاهر', type: 'select', options: ['في عمود خرساني أو أسفل الكمرة مباشرة', 'شرخ مائل بزاوية 45 درجة بجانب فتحات النوافذ والأبواب', 'شروخ أفقية رفيعة في حوائط المحارة والدهان فقط', 'تساقط قشرة خرسانية وظهور حديد تسليح مصدي بالبلكونة أو السقف'], default: 'شرخ مائل بزاوية 45 درجة بجانب فتحات النوافذ والأبواب' },
      { id: 'crackWidth', label: 'سُمك وعرض الشرخ بالتقريب', type: 'select', options: ['شرخ شعري دقيق (أقل من 1 ملليمتر)', 'شرخ متوسط (من 1 إلى 3 ملليمتر)', 'شرخ متسع وعميق (أكثر من 4 ملليمترات ونافذ بالناحية الأخرى)'], default: 'شرخ متوسط (من 1 إلى 3 ملليمتر)' },
      { id: 'isWidening', label: 'هل الشرخ يتسع مع الوقت ويتحرك؟', type: 'select', options: ['نعم، ملحوظ زيادته وتوسعه شهرياً', 'ثابت منذ شهور أو سنوات ولا يتغير'], default: 'ثابت منذ شهور أو سنوات ولا يتغير' }
    ],
    calcLogic: `
      let riskLevel = 'منخفض (سطحي)';
      let remedy = 'معالجة عادية بمعجون شروخ بوليمري وشريط ألياف فايبر جلاس وإعادة الدهان.';
      
      const loc = inputs.crackLocation;
      const width = inputs.crackWidth;
      const widening = inputs.isWidening.includes('نعم');

      if (loc.includes('عمود') || loc.includes('حديد تسليح') || width.includes('متسع') || widening) {
        if (loc.includes('عمود') || width.includes('متسع')) {
          riskLevel = '🚨 حرج جداً (إنشائي يمس سلامة الهيكل)';
          remedy = 'يجب فوراً انتداب استشاري ترميم خرسانات من نقابة المهندسين وعمل صلب مؤقت للكمرات؛ يحظر إخفاء الشرخ بالمعجون!';
        } else {
          riskLevel = '⚠️ متوسط إلى مرتفع (هبوط تربة أو إجهاد قَص)';
          remedy = 'تركيب بقج جبسية لمراقبة حركة الشرخ (Tell-Tale)، والتأكد من عدم وجود تسريب مياه صرف يهدد الأساسات.';
        }
      }

      return {
        evaluatedRisk: riskLevel,
        actionRequired: remedy,
        urgentAction: widening ? '⚠️ التحذير الأهم: حركة الشرخ المستمرة تعني وجود هبوط غير متماثل بالتربة أو زيادة أحمال خطيرة بالدور العلوي.' : 'الشرخ مستقر حالياً، وينصح بتوثيقه بصور مؤرخة كل 3 أشهر.',
        legalStep: 'في حال الشروخ الإنشائية، يلزم قانون البناء 119 أمين الاتحاد بإخطار إدارة التنظيم بالحي لمعاينة لجنة المنشآت الآيلة للسقوط.'
      };
    `,
    resultFields: [
      { label: 'مستوى الخطورة الإنشائية', id: 'evaluatedRisk', isHighlight: true },
      { label: 'التوصية الفنية والإصلاح', id: 'actionRequired', isHighlight: false }
    ],
    faqs: [
      { q: 'متى يكون الشرخ المائل بزاوية 45 درجة خطيراً؟', a: 'الشروخ المائلة بزاوية 45 درجة تعبر عن إجهادات قَص ناتجة عن هبوط في أحد أركان الأساسات أو وجود حفريات لعقار مجاور، ويجب كشف أسباب الهبوط أولاً.' }
    ]
  },

  {
    slug: 'garbage-chute-cleaning-cost-calculator',
    title: 'حاسبة تكلفة صيانة وتنظيف وتطهير مجرى القمامة أو براميل المدخل',
    shortTitle: 'حاسبة صيانة وتطهير مجرى القمامة',
    desc: 'احسب تكلفة الغسيل الكيميائي وإبادة الصراصير لمجرى القمامة (Chute) بالعمارة، أو مقارنة تكلفة إغلاقه واستبداله بحاويات صحية مفصولة.',
    icon: '🗑️',
    category: 'تشطيب وترميم',
    keywords: 'مجرى قمامة chute تنظيف دكت القمامة حشرات صراصير رائحة كريهة غسيل كيماوي عمارة',
    inputs: [
      { id: 'floorsCount', label: 'عدد أدوار العقار', type: 'number', default: '8' },
      { id: 'serviceType', label: 'الإجراء المطلوب لمجرى القمامة', type: 'select', options: ['تطهير وغسيل كيميائي سنوي دوري', 'إغلاق ولحام مجرى القمامة نهائياً (موصى به صحياً)', 'تركيب رشاشات غسيل مياه وباب هواء محكم'], default: 'إغلاق ولحام مجرى القمامة نهائياً (موصى به صحياً)' },
      { id: 'flatsTotal', label: 'عدد شقق العمارة', type: 'number', default: '16' }
    ],
    calcLogic: `
      const f = parseInt(inputs.floorsCount) || 6;
      const flats = parseInt(inputs.flatsTotal) || 1;
      
      let estCost = 4500;
      let desc = '';
      if (inputs.serviceType.includes('إغلاق')) {
        estCost = f * 400 + 1200; // لحام الأبواب ودهانها + براميل مجمعة بالبدروم
        desc = 'إغلاق أبواب المجرى بجميع الأدوار بلحام حديد وإلغاء مصدر الحشرات والروائح الكريهة نهائياً.';
      } else if (inputs.serviceType.includes('تطهير')) {
        estCost = f * 350 + 1500;
        desc = 'فرك جدران المجرى بحبال متدلية ومواد كاوية ودهان مبيد حشري متبقي الأثر.';
      } else {
        estCost = f * 800 + 4000;
        desc = 'تأسيس خط مياه ومحابس أوتوماتيكية للغسيل الذاتي.';
      }

      const perFlat = Math.round(estCost / flats);

      return {
        actionDesc: desc,
        totalCost: estCost.toLocaleString() + ' ج',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة',
        healthBenefit: '90% من العمارات الحديثة تلغي مجاري القمامة وتلزم البواب بجمع الأكياس من أمام الشقق في مواعيد محددة لضمان بيئة نظيفة بلا صراصير وفئران.'
      };
    `,
    resultFields: [
      { label: 'الخطة المنفذة', id: 'actionDesc', isHighlight: false },
      { label: 'إجمالي المقايسة', id: 'totalCost', isHighlight: true },
      { label: 'حصة كل شقة', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'لماذا تنصح معظم شركات الإدارة بإلغاء مجرى القمامة في العمارة؟', a: 'لأنه بؤرة رئيسية لتكاثر الصراصير الألمانية والفئران، وينقل الروائح الكريهة بين الأدوار ويشكل خطراً كبيراً في حال إلقاء سجائر مشتعلة تسبب حريقاً بالبدروم.' }
    ]
  },

  {
    slug: 'intercom-installation-cost-calculator',
    title: 'حاسبة مقايسة شبكة الإنتركم الصوتي/المرئي وتوزيع سعر الشقة والسماعة',
    shortTitle: 'حاسبة مقايسة شبكة الإنتركم',
    desc: 'احسب تكلفة تركيب أو تجديد شبكة الإنتركم الداخلي للعمارة (صوتي أو فيديو بشاشة)، وسعر اللوحة الرئيسية والأسلاك وسماعة كل دور.',
    icon: '📟',
    category: 'تشطيب وترميم',
    keywords: 'انتركم صوتي مرئي كاميرا شاشة سماعة انتركم صيانة لوحة باب عمارة تمديد اسلاك تكلفة',
    inputs: [
      { id: 'intercomType', label: 'نوع نظام الإنتركم المفضل', type: 'select', options: ['إنتركم صوتي كلاسيكي (سماعة بزر فتح الباب)', 'إنتركم مرئي بشاشة فيديو ملونة (Video Door Phone)', 'إنتركم ذكي IP متصل بالواي فاي والموبايل'], default: 'إنتركم صوتي كلاسيكي (سماعة بزر فتح الباب)' },
      { id: 'flatsCount', label: 'عدد الشقق المطلوب توصيلها بالشبكة', type: 'number', default: '10' },
      { id: 'floorsCount', label: 'ارتفاع العمارة (عدد الأدوار)', type: 'number', default: '5' }
    ],
    calcLogic: `
      const flats = parseInt(inputs.flatsCount) || 8;
      const f = parseInt(inputs.floorsCount) || 4;

      let handsetRate = 450; // سعر سماعة صوتية عادية
      let panelBase = 3500; // لوحة خارجية وباور ومغلاق
      let wirePerMeter = 14;

      if (inputs.intercomType.includes('مرئي')) {
        handsetRate = 1850; // شاشة ألوان 4.3 بوصة
        panelBase = 7500; // لوحة معدنية بكاميرا رؤية ليلية
        wirePerMeter = 22; // كابل شبكة UTP معزول
      } else if (inputs.intercomType.includes('IP')) {
        handsetRate = 2600;
        panelBase = 11000;
        wirePerMeter = 28;
      }

      const totalWireMeters = (f * 15) + (flats * 10);
      const wiringCost = Math.round(totalWireMeters * wirePerMeter);
      const handsetsTotal = flats * handsetRate;
      const laborCost = Math.round(flats * 300 + 1200);
      const grandTotal = panelBase + wiringCost + handsetsTotal + laborCost;
      const perFlat = Math.round(grandTotal / flats);

      return {
        panelAndPower: panelBase.toLocaleString() + ' ج (اللوحة والمحولات المشتركة)',
        handsetsCost: handsetsTotal.toLocaleString() + ' ج (إجمالي سماعات الشقق)',
        wiringAndLabor: (wiringCost + laborCost).toLocaleString() + ' ج (أسلاك ومصنعية فني)',
        totalProjectCost: grandTotal.toLocaleString() + ' ج',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة',
        recom: 'يجب عزل أسلاك الإنتركم في خراطيم مستقلة بعيداً عن كابلات الكهرباء 220V لتفادي التشويش والزنّة الصوتية في المكالمات.'
      };
    `,
    resultFields: [
      { label: 'اللوحة والباور سبلاي المشترك', id: 'panelAndPower', isHighlight: false },
      { label: 'إجمالي المقايسة الشاملة بالتركيب', id: 'totalProjectCost', isHighlight: true },
      { label: 'حصة كل شقة بالسماعة', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'ما أفضل ماركات الإنتركم المعتمدة في السوق المصري؟', a: 'أورمت (Urmet) وتيرانيو (Terraneo) الإيطالي، أو فارفيزا (Farfisa)، بالإضافة للأنظمة الصينية المعتمدة مثل هيكفيجن (Hikvision) للإنتركم المرئي.' }
    ]
  },

  {
    slug: 'building-signage-rules-fee-calculator',
    title: 'حاسبة ومحدد رسوم يافطات العيادات والمحلات وإشغال واجهة العمارة',
    shortTitle: 'حاسبة رسوم يافطات واجهة العمارة',
    desc: 'احسب الرسم العادل لتعليق لافتات وإعلانات العيادات والمكاتب والمحلات على واجهة العمارة ومدخلها، واستهلاك الكهرباء المشترك.',
    icon: '🪧',
    category: 'تشطيب وترميم',
    keywords: 'يافطة عيادة لافتة محل واجهة عمارة اشغال واجهة رسوم يافطة كهرباء يافطة اتحاد شاغلين',
    inputs: [
      { id: 'signWidthMeters', label: 'عرض اليافطة (متر)', type: 'number', default: '2.5' },
      { id: 'signHeightMeters', label: 'ارتفاع اليافطة (متر)', type: 'number', default: '1.2' },
      { id: 'isIlluminated', label: 'هل اليافطة مضاءة متصلة بكهرباء العمارة؟', type: 'select', options: ['نعم، مضاءة ليد ومتصلة بالعداد المشترك', 'مضاءة ولكن متصلة بعداد الوحدة الخاص بها', 'يافطة صامتة بدون إضاءة'], default: 'نعم، مضاءة ليد ومتصلة بالعداد المشترك' },
      { id: 'unitType', label: 'نوع النشاط', type: 'select', options: ['عيادة طبية / مكتب محاماة أو محاسبة', 'محل تجاري بالدور الأرضي', 'صيدلية أو معمل تحاليل'], default: 'عيادة طبية / مكتب محاماة أو محاسبة' }
    ],
    calcLogic: `
      const w = parseFloat(inputs.signWidthMeters) || 1;
      const h = parseFloat(inputs.signHeightMeters) || 1;
      const area = w * h;

      let baseFeePerMeterMonthly = 120; // رسم انتفاع بالواجهة المشتركة
      if (inputs.unitType.includes('محل') || inputs.unitType.includes('صيدلية')) baseFeePerMeterMonthly = 180;

      let monthlyRental = Math.round(area * baseFeePerMeterMonthly);
      let powerCost = 0;
      if (inputs.isIlluminated.includes('متصلة بالعداد المشترك')) {
        powerCost = 150; // متوسط استهلاك ليد 8 ساعات ليلاً
      }

      const totalMonthlyFee = monthlyRental + powerCost;
      const annualTotal = totalMonthlyFee * 12;

      return {
        signAreaM2: area.toFixed(2) + ' م²',
        facadeRentalMonthly: monthlyRental.toLocaleString() + ' ج/شهرياً (مقابل حق استغلال الواجهة المشتركة)',
        powerCharge: powerCost > 0 ? (powerCost + ' ج/شهر (كهرباء إنارة)') : '0 ج (على عداد الوحدة الخاص)',
        totalMonthlyDue: totalMonthlyFee.toLocaleString() + ' ج/شهرياً',
        annualRevenueForFund: annualTotal.toLocaleString() + ' ج/سنوياً (إيراد إضافي لصندوق العمارة)',
        rule: 'تشترط اللائحة الداخلية عدم حجب رؤية أو تهوية شقق الجيران، والالتزام بمقاس موحد وألوان راقية تناسب الطابع المعماري للعمارة.'
      };
    `,
    resultFields: [
      { label: 'مساحة اللافتة', id: 'signAreaM2', isHighlight: false },
      { label: 'المبلغ الشهري المستحق لصندوق العمارة', id: 'totalMonthlyDue', isHighlight: true },
      { label: 'الإيراد السنوي الإضافي للصندوق', id: 'annualRevenueForFund', isHighlight: false }
    ],
    faqs: [
      { q: 'هل يحق لاتحاد الشاغلين تحصيل رسوم على يافطة الطبيب أو المحامي بالواجهة؟', a: 'نعم، الواجهة الخارجية والمدخل ملكية مشتركة لجميع الملاك وليست ملكاً خاصاً للوحدة، ويحق للجمعية العمومية تقرير رسم انتفاع معقول يوجه لصندوق الصيانة.' }
    ]
  },

  {
    slug: 'perimeter-lighting-cost-calculator',
    title: 'حاسبة إنارة سور ومدخل العمارة بالليد وكشافات الحماية الخارجية',
    shortTitle: 'حاسبة إنارة السور وكشافات الأمان',
    desc: 'احسب عدد كشافات الليد المقاومة للمطر (IP65) لإنارة سور وبوابة ومدخل العقار، واستهلاك الكهرباء وتكلفة التأسيس وحصة الشقة.',
    icon: '💡',
    category: 'تشطيب وترميم',
    keywords: 'انارة سور كشافات واجهة كشاف ليد خارجي حماية عمارة اضاءة مدخل توفير كهرباء',
    inputs: [
      { id: 'perimeterMeters', label: 'طول السور والواجهة المطلوب إنارتها (متر)', type: 'number', default: '28' },
      { id: 'floodlightWatt', label: 'قدرة الكشاف المقترحة', type: 'select', options: ['كشافات ليد 30 واط (إضاءة هادئة ديكورية)', 'كشافات ليد 50 واط IP65 (إضاءة أمان ساطعة)', 'كشافات ليد 100 واط (كاشفة للمدخل والشارع)'], default: 'كشافات ليد 50 واط IP65 (إضاءة أمان ساطعة)' },
      { id: 'hasDaylightSensor', label: 'نظام تشغيل الإضاءة', type: 'select', options: ['خلية ضوئية أوتوماتيكية (Photocell - تضيء عند الغروب تلقائياً)', 'مفتاح يدوي مع البواب', 'تايمر رقمي بمواعيد محددة'], default: 'خلية ضوئية أوتوماتيكية (Photocell - تضيء عند الغروب تلقائياً)' },
      { id: 'flatsCount', label: 'عدد شقق العمارة', type: 'number', default: '10' }
    ],
    calcLogic: `
      const meters = parseFloat(inputs.perimeterMeters) || 20;
      const flats = parseInt(inputs.flatsCount) || 1;
      const count = Math.max(3, Math.ceil(meters / 6)); // كشاف كل 6 أمتار

      let watt = 50;
      let floodlightPrice = 450;
      if (inputs.floodlightWatt.includes('30')) { watt = 30; floodlightPrice = 320; }
      else if (inputs.floodlightWatt.includes('100')) { watt = 100; floodlightPrice = 750; }

      const photocellCost = 350;
      const wiringAndPipes = count * 220;
      const labor = count * 180;
      const grandTotal = (count * floodlightPrice) + photocellCost + wiringAndPipes + labor;

      const monthlyKwh = (count * watt * 10 * 30) / 1000; // 10 ساعات تشغيل ليلي
      const monthlyPowerCost = Math.round(monthlyKwh * 2.14);
      const perFlat = Math.round(grandTotal / flats);

      return {
        recommendedLights: count + ' كشافات ليد خارجية معزولة (IP65)',
        totalInstallCost: grandTotal.toLocaleString() + ' ج (شامل الخلية والأسلاك والمصنعية)',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة',
        monthlyPowerExpense: monthlyPowerCost + ' ج/شهرياً (كهرباء إضافية للفاتورة)',
        securityAdvice: 'إنارة السور والمدخل تقلل من محاولات التسلل والسرقة بنسبة 80% وتمنح كاميرات المراقبة صورة ليلية نقية وملونة.'
      };
    `,
    resultFields: [
      { label: 'عدد الكشافات الموصى بها', id: 'recommendedLights', isHighlight: false },
      { label: 'إجمالي تكلفة التركيب والتأسيس', id: 'totalInstallCost', isHighlight: true },
      { label: 'نصيب كل شقة', id: 'sharePerFlat', isHighlight: true },
      { label: 'تكلفة الكهرباء الشهرية للكشافات', id: 'monthlyPowerExpense', isHighlight: false }
    ],
    faqs: [
      { q: 'ما فائدة تركيب خلية ضوئية (Photocell) لإنارة سور العمارة؟', a: 'الخلية تقيس شدة ضوء النهار وتغلق الكشافات تلقائياً مع شروق الشمس وتضيئها عند المغرب، مما يمنع نسيان الأنوار مضاءة نهاراً ويوفر 50% من الكهرباء.' }
    ]
  },

  {
    slug: 'roof-shed-pergola-cost-calculator',
    title: 'حاسبة تكلفة بناء مظلة أو برجولة مشتركة بالسطح وتوزيع حصصها',
    shortTitle: 'حاسبة برجولة ومظلة السطح المشتركة',
    desc: 'احسب مقايسة إنشاء برجولة خشبية أو حديد مع قرميد أو قماش مشدود على سطح العمارة لجلسات السكان وتوزيع التكلفة على المشتركين.',
    icon: '⛱️',
    category: 'تشطيب وترميم',
    keywords: 'برجولة سطح مظلة خشب حديد جلسة روف قرميد بلاستيك تكلفة روف عمارة مشاركة ملاك',
    inputs: [
      { id: 'pergolaAreaM2', label: 'مساحة البرجولة المطلوبة (متر مربع)', type: 'number', default: '24' },
      { id: 'pergolaMaterial', label: 'خامة وهيكل البرجولة', type: 'select', options: ['هيكل حديد مدهون إلكتروستاتيك + تغطية قرميد بلاستيك تركي', 'خشب موسكي/عزيزي معالج للأمطار والشمس', 'شاسيه خفيف + قماش PVC معزول (أقل تكلفة)'], default: 'هيكل حديد مدهون إلكتروستاتيك + تغطية قرميد بلاستيك تركي' },
      { id: 'participatingFlats', label: 'عدد الشقق المشاركة في المشروع', type: 'number', default: '6' }
    ],
    calcLogic: `
      const area = parseFloat(inputs.pergolaAreaM2) || 16;
      const flats = parseInt(inputs.participatingFlats) || 1;

      let rate = 1400; // حديد وقرميد بلاستيك
      if (inputs.pergolaMaterial.includes('خشب')) rate = 2200;
      else if (inputs.pergolaMaterial.includes('قماش PVC')) rate = 850;

      const baseStructureCost = Math.round(area * rate);
      const lightingAndSockets = 3500; // سبوتات ومخارج كهرباء
      const floorTileProtect = 2500; // حماية عزل السطح أسفل القواعد
      const grandTotal = baseStructureCost + lightingAndSockets + floorTileProtect;
      const perFlat = Math.round(grandTotal / flats);

      return {
        areaM2: area + ' م²',
        totalPergolaCost: grandTotal.toLocaleString() + ' ج',
        sharePerFlat: perFlat.toLocaleString() + ' ج/شقة مشتركة',
        roofWarning: '⚠️ تنبيه هندسي حاسم: يحظر حظر دق مسامير أو تثبيت أرجل البرجولة بتخريم طبقة العزل المائي للسطح مباشرة؛ يجب صب قواعد خرسانية عائمة (Bases) فوق البلاط لتفادي تسريب مياه الأمطار للشقة السفلية.'
      };
    `,
    resultFields: [
      { label: 'مساحة المظلة', id: 'areaM2', isHighlight: false },
      { label: 'إجمالي المقايسة والتجهيز', id: 'totalPergolaCost', isHighlight: true },
      { label: 'حصة كل شقة مشاركة فقط', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'هل يجوز إجبار الشقق غير الراغبة على دفع ثمن برجولة السطح؟', a: 'لا يجوز، البرجولة عمل ترفيهي تحسيني وليست من أعمال الصيانة الإلزامية لحفظ المبنى، وتكون التكلفة حصرياً على الشقق الراغبة في المشاركة والاستفادة منها.' }
    ]
  },

  // ==========================================
  // GROUP 5: حاسبات التمويل المتقدم ومحاكيات الودائع (8 أدوات: 55 - 62)
  // ==========================================
  {
    slug: 'maintenance-deposit-erosion-simulator',
    title: 'محاكي تآكل وديعة الصيانة مع التضخم ومعدل نفاد الصندوق بالسنوات',
    shortTitle: 'محاكي تآكل وديعة صيانة العمارة',
    desc: 'احسب كم سنة تصمد وديعة الصيانة المودعة بالبنك قبل أن تتآكل تماماً بفعل التضخم وزيادة أسعار الصيانة السنوية ومقدار الاشتراك الشهري الإلزامي.',
    icon: '📉',
    category: 'مالية وودائع',
    keywords: 'وديعة صيانة تآكل الوديعة تضخم مالي فوائد بنكية نفاد الصندوق ميزانية عمارة حساب صيانة',
    inputs: [
      { id: 'depositBalance', label: 'رصيد وديعة العمارة الحالي بالبنك (ج)', type: 'number', default: '250000' },
      { id: 'bankInterestRate', label: 'عائد الفائدة السنوية للشهادة / الوديعة (%)', type: 'number', default: '19.0' },
      { id: 'annualExpense', label: 'إجمالي مصاريف الصيانة السنوية للعقار (ج)', type: 'number', default: '75000' },
      { id: 'inflationRate', label: 'معدل التضخم السنوي المتوقع لأسعار قطع الغيار (%)', type: 'number', default: '15.0' },
      { id: 'flatsCount', label: 'عدد شقق العمارة', type: 'number', default: '10' }
    ],
    calcLogic: `
      let balance = parseFloat(inputs.depositBalance) || 100000;
      const rate = (parseFloat(inputs.bankInterestRate) || 15) / 100;
      let expense = parseFloat(inputs.annualExpense) || 50000;
      const infl = (parseFloat(inputs.inflationRate) || 10) / 100;
      const flats = parseInt(inputs.flatsCount) || 1;

      let years = 0;
      const maxYears = 25;
      while (balance > 0 && years < maxYears) {
        const interest = balance * rate;
        balance = balance + interest - expense;
        expense = expense * (1 + infl);
        years++;
      }

      const annualDeficitYear1 = Math.round(expense - (parseFloat(inputs.depositBalance) * rate));
      const monthlyDeficitPerFlat = Math.max(0, Math.round((annualDeficitYear1 / 12) / flats));

      return {
        survivalYears: balance <= 0 ? (years + ' سنوات تقريباً حتى النفاد التام') : ('أكثر من ' + maxYears + ' سنة (وضع مالي آمن)'),
        annualDeficit: annualDeficitYear1 > 0 ? (annualDeficitYear1.toLocaleString() + ' ج عجز سنوي') : 'فائض مالي مستمر',
        requiredMonthlyFee: monthlyDeficitPerFlat > 0 ? (monthlyDeficitPerFlat.toLocaleString() + ' ج/شهر لكل شقة') : '0 ج (عائد الوديعة يغطي حالياً)',
        strategy: balance <= 0 ? '⚠️ الاعتماد على عوائد الوديعة فقط دون تحصيل اشتراك شهري سيؤدي لإفلاس الصندوق سريعاً! يجب فرض اشتراك شهري لمجابهة التضخم وحفظ أصل الوديعة للطوارئ.' : '✅ أصل الوديعة محمي ومستقر.'
      };
    `,
    resultFields: [
      { label: 'المدى الزمني قبل نفاد الرصيد', id: 'survivalYears', isHighlight: true },
      { label: 'العجز السنوي في السنة الأولى', id: 'annualDeficit', isHighlight: false },
      { label: 'الاشتراك الشهري الواجب تحصيله لحماية الأصل', id: 'requiredMonthlyFee', isHighlight: true }
    ],
    faqs: [
      { q: 'هل يجوز الصرف من أصل وديعة الصيانة المودعة بالبنك؟', a: 'الأصل الهندسي والمالي يحظر المساس بأصل الوديعة إلا في الكوارث الإنشائية الكبرى، ويجب أن تغطي الفوائد أو الاشتراكات الشهرية مصاريف التشغيل العادية.' }
    ]
  },

  {
    slug: 'installment-late-penalty-calculator',
    title: 'حاسبة غرامات التأخير المشروطة وحوافز السداد المبكر لاشتراك العمارة',
    shortTitle: 'حاسبة غرامات التأخير وحوافز السداد',
    desc: 'احسب غرامات التأخير الشهرية المقررة باللائحة الداخلية على الشقق المماطلة، وحساب نسبة الخصم التشجيعي للسكان الملتزمين بالسداد السنوي مقدماً.',
    icon: '⚖️',
    category: 'مالية وودائع',
    keywords: 'غرامة تاخير اشتراك عمارة حافز سداد مبكر مماطلة تحصيل سداد سنوي خصم اشتراك',
    inputs: [
      { id: 'monthlySub', label: 'قيمة الاشتراك الشهري للشقة (ج)', type: 'number', default: '400' },
      { id: 'lateMonths', label: 'عدد الشهور المتأخرة على الشقة', type: 'number', default: '5' },
      { id: 'penaltyPerMonth', label: 'غرامة التأخير الشهرية طبقاً للائحة العقار (ج)', type: 'number', default: '50' },
      { id: 'earlyDiscountPercent', label: 'نسبة خصم السداد السنوي مقدماً (كاش)', type: 'number', default: '10' }
    ],
    calcLogic: `
      const sub = parseFloat(inputs.monthlySub) || 300;
      const lateM = parseInt(inputs.lateMonths) || 1;
      const pen = parseFloat(inputs.penaltyPerMonth) || 0;
      const discPercent = parseFloat(inputs.earlyDiscountPercent) || 0;

      const principalArrears = sub * lateM;
      // غرامة تأخير متصاعدة
      const totalPenalties = pen * lateM;
      const grandTotalDue = principalArrears + totalPenalties;

      // حساب السداد السنوي مقدماً
      const annualFull = sub * 12;
      const discountVal = Math.round(annualFull * (discPercent / 100));
      const discountedAnnual = annualFull - discountVal;

      return {
        principalAmount: principalArrears.toLocaleString() + ' ج (أصل المتأخرات)',
        penaltyAmount: totalPenalties.toLocaleString() + ' ج (غرامات تأخير معتمدة)',
        totalLateDue: grandTotalDue.toLocaleString() + ' ج (المبلغ المطلوب سداده فوراً)',
        annualIncentive: discountedAnnual.toLocaleString() + ' ج فقط عند سداد سنة مقدماً (وفر ' + discountVal + ' ج)',
        legalBasis: 'تطبيق غرامات التأخير يكون صحيحاً وملزماً إذا كانت منصوصاً عليها صراحة في لائحة النظام الداخلي المقرة من الجمعية العمومية.'
      };
    `,
    resultFields: [
      { label: 'أصل المتأخرات غير المسددة', id: 'principalAmount', isHighlight: false },
      { label: 'إجمالي الغرامات المستحقة', id: 'penaltyAmount', isHighlight: false },
      { label: 'إجمالي المطلوب من الساكن المتأخر', id: 'totalLateDue', isHighlight: true },
      { label: 'حافز السداد السنوي مقدماً (خصم سنوي)', id: 'annualIncentive', isHighlight: false }
    ],
    faqs: [
      { q: 'هل غرامات التأخير على اشتراك العمارة جائزة قانوناً؟', a: 'نعم، تعتبر بمثابة بند جزائي (شرط جزائي) لتعويض الصندوق عن اضطراره للاستدانة أو تعطل الخدمات بسبب امتناع الساكن، بشرط اعتمادها باللائحة.' }
    ]
  },

  {
    slug: 'property-depreciation-reserve-calculator',
    title: 'حاسبة مخصص الإهلاك الدوري للأصول الثابتة (المصعد، المواتير، البوابات)',
    shortTitle: 'حاسبة مخصص إهلاك أصول العمارة',
    desc: 'نظام محاسبي متقدم لأمناء الصناديق: احسب الاستقطاع الشهري الواجب تجنيبه لإهلاك ماكينة المصعد وطلمبات المياه ودهان السلالم لتفادي طلب مبالغ مفاجئة.',
    icon: '📊',
    category: 'مالية وودائع',
    keywords: 'مخصص اهلاك اصول ثابتة ماكينة مصعد موتور مياه عمرة تجديد صندوق طوارئ محاسبة عمارة',
    inputs: [
      { id: 'elevatorValue', label: 'تكلفة تجديد ماكينة وكنترول المصعد (ج)', type: 'number', default: '120000' },
      { id: 'elevatorLifeYears', label: 'العمر الافتراضي المتبقي للمصعد (سنوات)', type: 'number', default: '8' },
      { id: 'pumpsValue', label: 'تكلفة استبدال مواتير المياه والسباكة (ج)', type: 'number', default: '25000' },
      { id: 'pumpsLifeYears', label: 'العمر الافتراضي للمواتير (سنوات)', type: 'number', default: '5' },
      { id: 'flatsCount', label: 'عدد شقق العمارة', type: 'number', default: '10' }
    ],
    calcLogic: `
      const elVal = parseFloat(inputs.elevatorValue) || 100000;
      const elLife = Math.max(1, parseFloat(inputs.elevatorLifeYears) || 5);
      const pmVal = parseFloat(inputs.pumpsValue) || 20000;
      const pmLife = Math.max(1, parseFloat(inputs.pumpsLifeYears) || 3);
      const flats = parseInt(inputs.flatsCount) || 1;

      const elevatorDepMonthly = Math.round((elVal / elLife) / 12);
      const pumpsDepMonthly = Math.round((pmVal / pmLife) / 12);
      const totalDepMonthly = elevatorDepMonthly + pumpsDepMonthly;
      const perFlatMonthly = Math.round(totalDepMonthly / flats);

      return {
        monthlyReserveTotal: totalDepMonthly.toLocaleString() + ' ج/شهرياً (مخصص إهلاك عام)',
        elevatorShare: elevatorDepMonthly.toLocaleString() + ' ج/شهر (للمصعد)',
        pumpsShare: pumpsDepMonthly.toLocaleString() + ' ج/شهر (لمواتير المياه)',
        sharePerFlat: perFlatMonthly.toLocaleString() + ' ج/شهر لكل شقة',
        benefit: 'بإضافة هذا المبلغ (' + perFlatMonthly + ' ج) للاشتراك الشهري وادخاره بحساب بنكي منفصل، لن تضطر العمارة أبداً لجمع سلفة مفاجئة بمبالغ ضخمة عند حدوث أي عمرة كبرى.'
      };
    `,
    resultFields: [
      { label: 'إجمالي مخصص الإهلاك الشهري للعقار', id: 'monthlyReserveTotal', isHighlight: true },
      { label: 'نصيب كل شقة الواجب إضافته للاشتراك', id: 'sharePerFlat', isHighlight: true }
    ],
    faqs: [
      { q: 'ما الفرق بين مخصص الإهلاك وصندوق الطوارئ؟', a: 'مخصص الإهلاك مخصص لاستبدال أصول معروفة العمر الافتراضي بدقة (مثل انتهاء عمر الماكينة بعد 10 سنوات)، بينما صندوق الطوارئ مخصص للأعطال المفاجئة غير المتوقعة.' }
    ]
  },

  {
    slug: 'emergency-cash-burn-rate-calculator',
    title: 'حاسبة معدل الحرق النقدي وأشهر الأمان المالي المتبقية لصندوق العمارة',
    shortTitle: 'حاسبة معدل الحرق النقدي وأشهر الأمان',
    desc: 'مؤشر أمان مالي فوري: احسب كم شهراً تستطيع خزانة العمارة الصمود والاستمرار في دفع مرتب البواب والكهرباء والصيانة في حال توقف السكان عن السداد.',
    icon: '⏱️',
    category: 'مالية وودائع',
    keywords: 'حرق نقدي رصيد خزينة امان مالي افلاس صندوق عمارة عجز سيولة اشتراكات بواب كهرباء',
    inputs: [
      { id: 'currentCashBalance', label: 'الرصيد النقدي الحالي المتاح بالخزينة والبنك (ج)', type: 'number', default: '32000' },
      { id: 'monthlyFixedBurn', label: 'إجمالي الالتزامات الشهرية الثابتة الحتمية (ج)', type: 'number', default: '8500' },
      { id: 'expectedCollections', label: 'المتوسط الشهري للتحصيلات الفعلية المتوقعة (ج)', type: 'number', default: '5000' }
    ],
    calcLogic: `
      const cash = parseFloat(inputs.currentCashBalance) || 0;
      const burn = parseFloat(inputs.monthlyFixedBurn) || 1;
      const income = parseFloat(inputs.expectedCollections) || 0;

      const netBurnMonthly = Math.max(0, burn - income);
      let runwayMonths = 0;
      if (netBurnMonthly === 0) {
        runwayMonths = 999;
      } else {
        runwayMonths = Math.round((cash / netBurnMonthly) * 10) / 10;
      }

      let status = 'وضع آمن (أكثر من 6 أشهر)';
      if (runwayMonths < 2) status = '🚨 خطر إفلاس حرج (أقل من شهرين)';
      else if (runwayMonths < 4) status = '⚠️ إنذار مبكر (يلزم تسريع التحصيل)';

      return {
        runway: runwayMonths > 100 ? 'مستدام (الإيراد يغطي المصروف)' : (runwayMonths + ' شهور أمان نقدي'),
        monthlyDeficit: netBurnMonthly.toLocaleString() + ' ج/شهرياً (عجز شهري مستمر)',
        safetyAssessment: status,
        action: runwayMonths < 3 ? 'يجب إرسال كشف حساب فوري للسكان وبدء حملة مكثفة لتحصيل المتأخرات قبل العجز عن دفع راتب الحارس أو فصل كارت الكهرباء.' : 'الخزينة في وضع تشغيلي جيد يتيح الوفاء بالالتزامات.'
      };
    `,
    resultFields: [
      { label: 'فترة الأمان المالي المتبقية (Runway)', id: 'runway', isHighlight: true },
      { label: 'صافي العجز الشهري', id: 'monthlyDeficit', isHighlight: false },
      { label: 'تقييم وضع الصندوق', id: 'safetyAssessment', isHighlight: false }
    ],
    faqs: [
      { q: 'ما هو الحد الأدنى المقبول لرصيد الأمان في صندوق العمارة؟', a: 'يُوصى محاسبياً بألا يقل الرصيد الاحتياطي الحر عن مصاريف تشغيل 3 أشهر كاملة لمواجهة أي تعثر طارئ.' }
    ]
  },

  {
    slug: 'multi-entrance-cost-splitter',
    title: 'حاسبة تقسيم المصاريف للعمارات متعددة المداخل أو المجمعات السكنية',
    shortTitle: 'حاسبة تقسيم مصاريف المداخل المتعددة',
    desc: 'افصل مصاريف المدخل الخاص (أسانسير وسلم ونظافة المدخل) عن المصاريف العمومية المشتركة للعقار ككل (إنارة السور، الجراج، خزان المياه، حارس البوابة).',
    icon: '🏢',
    category: 'مالية وودائع',
    keywords: 'مدخل متعدد عمارة مدخلين مجمع سكني مصاريف مشتركة مصعد خاص نظافة مدخل تقسيم اشتراك',
    inputs: [
      { id: 'commonTotal', label: 'المصاريف العامة المشتركة لكل المداخل (حراسة، سور، خزانات) (ج)', type: 'number', default: '9000' },
      { id: 'totalFlatsAll', label: 'إجمالي عدد الشقق بجميع المداخل', type: 'number', default: '30' },
      { id: 'entrancePrivateCost', label: 'المصاريف الخاصة بالمدخل المستهدف فقط (مصعد، سلم) (ج)', type: 'number', default: '4500' },
      { id: 'entranceFlats', label: 'عدد الشقق في هذا المدخل فقط', type: 'number', default: '10' }
    ],
    calcLogic: `
      const common = parseFloat(inputs.commonTotal) || 0;
      const allFlats = parseInt(inputs.totalFlatsAll) || 1;
      const priv = parseFloat(inputs.entrancePrivateCost) || 0;
      const entFlats = parseInt(inputs.entranceFlats) || 1;

      const commonSharePerFlat = Math.round(common / allFlats);
      const privateSharePerFlat = Math.round(priv / entFlats);
      const grandTotalPerFlat = commonSharePerFlat + privateSharePerFlat;

      return {
        commonShare: commonSharePerFlat.toLocaleString() + ' ج (حصة الخدمات العامة للجميع)',
        privateShare: privateSharePerFlat.toLocaleString() + ' ج (حصة مصعد ونظافة هذا المدخل)',
        totalFlatSubscription: grandTotalPerFlat.toLocaleString() + ' ج/شهرياً (إجمالي اشتراك شقة هذا المدخل)',
        fairnessNote: 'هذا الفصل الدقيق يمنع اعتراض سكان المداخل الأخرى على صيانة مصعد لا يستخدمونه، ويحقق العدالة المحاسبية التامة.'
      };
    `,
    resultFields: [
      { label: 'حصة الشقة من الخدمات العامة', id: 'commonShare', isHighlight: false },
      { label: 'حصة الشقة من مدخلها الخاص', id: 'privateShare', isHighlight: false },
      { label: 'إجمالي الاشتراك الشهري للشقة', id: 'totalFlatSubscription', isHighlight: true }
    ],
    faqs: [
      { q: 'كيف تدار الحسابات في العقارات ذات المداخل المنفصلة؟', a: 'يُفضل فتح خزينة فرعية لكل مدخل مع دفتر إيرادات ومصروفات خاص بها، مع تحويل نسبة ثابتة شهرياً للصندوق العمومي المشترك.' }
    ]
  },

  {
    slug: 'capital-vs-operating-expense-classifier',
    title: 'أداة تصنيف المصروفات: رأسمالية تخص المالك أم تشغيلية تخص المستأجر',
    shortTitle: 'أداة تصنيف المصروفات (مالك أم مستأجر)',
    desc: 'حسم قانوني ومحاسبي فوري لأي بند مصروفات في العمارة: حدد هل يدفع الفاتورة مالك الشقة أم المستأجر المستفيد وفقاً لأحكام القانون المدني.',
    icon: '⚖️',
    category: 'مالية وودائع',
    keywords: 'مالك مستأجر صيانة دورية مصاريف راسمالية تشغيلية قانون مدني ايجار قديم ايجار جديد مسؤولية المالك',
    inputs: [
      { id: 'expenseItem', label: 'بند الصرف المطلوب تصنيفه', type: 'select', options: ['عمرة كاملة للأسانسير / تغيير ماكينة وحبال', 'صيانة شهرية دورية للمصعد وتغيير زيوت وشحم', 'ترميم شروخ الواجهة الخارجية وعزل السطح من المطر', 'مرتب حارس العقار وفواتير كهرباء السلم والمدخل', 'إصلاح كسر ماسورة صاعد مياه عمومي بالمنور', 'تغيير لمبات محروقة بالسلم وأدوات نظافة للمدخل'], default: 'عمرة كاملة للأسانسير / تغيير ماكينة وحبال' }
    ],
    calcLogic: `
      let resp = 'المـالـك (صاحب الملكية العقارية)';
      let ruleType = 'مصروف رأسمالي استثماري (Capital Expenditure - CapEx)';
      let reason = 'المادة 567 من القانون المدني تلزم المالك بإجراء الترميمات الضرورية لحفظ العين والمرافق المشتركة من الهلاك وبقائها صالحة للانتفاع.';

      const it = inputs.expenseItem;
      if (it.includes('شهرية دورية') || it.includes('مرتب حارس') || it.includes('تغيير لمبات')) {
        resp = 'المستـأجـر (الشاغل الفعلي للوحدة)';
        ruleType = 'مصروف تشغيلي دوري (Operating Expense - OpEx)';
        reason = 'المادة 568 من القانون المدني تلزم المستأجر بمصاريف الصيانة الاستهلاكية البسيطة التي يقتضيها الاستعمال اليومي العادي كالنظافة والإنارة والصيانة العادية للمرافق.';
      }

      return {
        responsibleParty: resp,
        accountingType: ruleType,
        legalGround: reason,
        summaryTip: resp.includes('المالك') ? 'تنبيه: لا يحق لأمين الصندوق مطالبة المستأجر بهذا البند، ويتم توجيه المطالبة مباشرة للمالك الأصلي أو خصمها من الإيجار بموافقة كتابية.' : 'هذا البند يقع على عاتق الشاغل الفعلي المقيم بالشقة سواء كان مستأجراً أو مالكاً.'
      };
    `,
    resultFields: [
      { label: 'المسؤول الملزم قانوناً بالدفع', id: 'responsibleParty', isHighlight: true },
      { label: 'التصنيف المحاسبي', id: 'accountingType', isHighlight: false }
    ],
    faqs: [
      { q: 'ماذا لو امتنع مالك الشقة المؤجرة عن دفع حصته في عمرة الأسانسير؟', a: 'يجوز للمستأجر بعد إعذار المالك كتابياً أن يدفع الحصة من ماله ويخصمها من القيمة الإيجارية الشهرية بموجب المادة 567 مدني.' }
    ]
  },

  {
    slug: 'compound-monthly-sinking-fund-calculator',
    title: 'حاسبة الصندوق الغارق الاستثماري لتجديد العقار كل 5 إلى 10 سنوات',
    shortTitle: 'حاسبة الصندوق الغارق الاستثماري',
    desc: 'احسب المبالغ الشهرية التي يجب تجنيبها في صندوق غارق استثماري (Sinking Fund) لإعادة دهان الواجهات وتجديد المصاعد ومواجهة هلاك المبنى.',
    icon: '🏦',
    category: 'مالية وودائع',
    keywords: 'صندوق غارق sinking fund تجديد عقار دهان واجهات استثمار اموال عمارة صيانة مستقبلية',
    inputs: [
      { id: 'targetOverhaulCost', label: 'المبلغ التقديري المطلوب توفيره بالمستقبل (ج)', type: 'number', default: '150000' },
      { id: 'yearsUntilGoal', label: 'المدة الزمنية حتى موعد التجديد (سنوات)', type: 'number', default: '5' },
      { id: 'expectedAnnualYield', label: 'عائد الاستثمار السنوي المتوقع بالبنك (%)', type: 'number', default: '16.0' },
      { id: 'flatsTotal', label: 'عدد الشقق المشاركة', type: 'number', default: '10' }
    ],
    calcLogic: `
      const target = parseFloat(inputs.targetOverhaulCost) || 100000;
      const yrs = Math.max(1, parseFloat(inputs.yearsUntilGoal) || 5);
      const r = (parseFloat(inputs.expectedAnnualYield) || 10) / 100 / 12; // عائد شهري
      const flats = parseInt(inputs.flatsTotal) || 1;
      const n = yrs * 12; // عدد الشهور

      // معادلة الصندوق الغارق: A = Target * r / ((1+r)^n - 1)
      const monthlyPaymentTotal = Math.round(target * r / (Math.pow(1 + r, n) - 1));
      const perFlatMonthly = Math.round(monthlyPaymentTotal / flats);
      const totalDirectDeposits = monthlyPaymentTotal * n;
      const earnedInterest = target - totalDirectDeposits;

      return {
        requiredMonthlyDeposit: monthlyPaymentTotal.toLocaleString() + ' ج/شهرياً (إجمالي العقار)',
        sharePerFlat: perFlatMonthly.toLocaleString() + ' ج/شهر لكل شقة',
        interestFreeEarned: Math.max(0, earnedInterest).toLocaleString() + ' ج (أرباح وفوائد بنكية تسدد من الهدف)',
        summary: 'بفضل الفائدة المركبة، سيسدد السكان فعلياً ' + totalDirectDeposits.toLocaleString() + ' ج فقط، والبنك سيتكفل بالباقي (' + Math.max(0, earnedInterest).toLocaleString() + ' ج) لتغطية الهدف بالكامل!'
      };
    `,
    resultFields: [
      { label: 'القسط الشهري للصندوق الغارق', id: 'requiredMonthlyDeposit', isHighlight: true },
      { label: 'حصة كل شقة شهرياً', id: 'sharePerFlat', isHighlight: true },
      { label: 'أرباح البنك المساهمة في التكلفة', id: 'interestFreeEarned', isHighlight: false }
    ],
    faqs: [
      { q: 'ما هو الصندوق الغارق (Sinking Fund) في إدارة العقارات؟', a: 'هو حساب ادخاري استثماري مخصص لمصروفات الصيانة الرأسمالية المستقبلية المجدولة، لضمان عدم مطالبة السكان بدفع مبالغ طائلة دفعة واحدة.' }
    ]
  },

  {
    slug: 'bank-yield-vs-inflation-calculator',
    title: 'حاسبة أفضل خيار لوديعة العمارة: شهادات استثمار أم حساب جاري يوم بيوم',
    shortTitle: 'مقارنة أوعية ادخار وديعة العمارة',
    desc: 'قارن بين ربط أموال العمارة في شهادات استثمار بنكية مغلقة بعائد مرتفع، أو حسابات يوم بيوم / صناديق نقدية تتيح السحب السريع للطوارئ.',
    icon: '📊',
    category: 'مالية وودائع',
    keywords: 'شهادات استثمار حساب يوم بيوم وديعة عمارة فائدة بنكية صناديق نقدية مرونة سحب طوارئ',
    inputs: [
      { id: 'reserveAmount', label: 'مبلغ الوديعة المتاح للاستثمار (ج)', type: 'number', default: '180000' },
      { id: 'cdRate', label: 'عائد الشهادة السنوية المغلقة (%)', type: 'number', default: '21.5' },
      { id: 'dailyAccountRate', label: 'عائد الحساب اليومي / صندوق النقد المرن (%)', type: 'number', default: '16.0' }
    ],
    calcLogic: `
      const amount = parseFloat(inputs.reserveAmount) || 100000;
      const cdR = (parseFloat(inputs.cdRate) || 20) / 100;
      const dailyR = (parseFloat(inputs.dailyAccountRate) || 15) / 100;

      const cdAnnualIncome = Math.round(amount * cdR);
      const cdMonthlyIncome = Math.round(cdAnnualIncome / 12);

      const dailyAnnualIncome = Math.round(amount * dailyR);
      const dailyMonthlyIncome = Math.round(dailyAnnualIncome / 12);

      const diffMonthly = cdMonthlyIncome - dailyMonthlyIncome;

      // التوصية الذكية: تقسيم المبلغ (Barbell Strategy)
      const lockAmount = Math.round(amount * 0.7);
      const liquidAmount = Math.round(amount * 0.3);

      return {
        cdGain: cdMonthlyIncome.toLocaleString() + ' ج/شهرياً (' + cdAnnualIncome.toLocaleString() + ' ج/سنة)',
        dailyGain: dailyMonthlyIncome.toLocaleString() + ' ج/شهرياً (' + dailyAnnualIncome.toLocaleString() + ' ج/سنة)',
        diffGain: diffMonthly.toLocaleString() + ' ج/شهر فرق لصالح الشهادة',
        smartSplitRecommendation: 'الحل الذهبي المتوازن: ربط 70% (' + lockAmount.toLocaleString() + ' ج) في شهادة مغلقة لأعلى عائد، وترك 30% (' + liquidAmount.toLocaleString() + ' ج) في حساب جاري يوم بيوم للسحب الفوري عند أعطال المصعد والمواتير.'
      };
    `,
    resultFields: [
      { label: 'عائد الشهادة البنكية الثابتة', id: 'cdGain', isHighlight: false },
      { label: 'عائد الحساب اليومي المرن', id: 'dailyGain', isHighlight: false },
      { label: 'فرق الربح الشهري', id: 'diffGain', isHighlight: true }
    ],
    faqs: [
      { q: 'ما العيب الأكبر لربط كامل رصيد العمارة في شهادة بنكية لمدة 3 سنوات؟', a: 'عدم القدرة على كسر الشهادة أو السحب منها في حال وقوع عطل طارئ بالمصعد أو طفح رئيسي بالصرف إلا بخسارة غرامة كسر الشهادة كاملة.' }
    ]
  },

  // ==========================================
  // GROUP 6: أدوات الاتصال وإدارة مجتمع السكان والأمن (8 أدوات: 63 - 70)
  // ==========================================
  {
    slug: 'whatsapp-broadcast-template-generator',
    title: 'مولد رسائل واتساب الاحترافية الجاهزة لإعلانات ومطالبات العمارة',
    shortTitle: 'مولد رسائل واتساب لإعلانات العمارة',
    desc: 'ولّد رسائل واتساب رسمية ومهذبة بضغطة زر لنشرها بقروب العمارة: تذكير بالاشتراك، موعد الصيانة الدورية، غلق البوابة، ومراعاة الهدوء.',
    icon: '💬',
    category: 'أمن وتواصل',
    keywords: 'رسائل واتساب قروب عمارة تذكير اشتراك اعلان صيانة رسالة تنبيه بواب شات سكان',
    isGenerator: true,
    inputs: [
      { id: 'bName', label: 'اسم العقار', type: 'text', default: 'عمارة النخيل (12 شارع دمشق)' },
      { id: 'messageCategory', label: 'نوع الإعلان المطلوب', type: 'select', options: ['تذكير مهذب بسداد اشتراك الشهر الجديد', 'إشعار صيانة دورية للمصعد وتوقف الخدمة مؤقتاً', 'تنبيه بشأن غلق بوابة العمارة ليلاً للأمان', 'تنويه بالالتزام بمواعيد الهدوء وعدم الإزعاج'], default: 'تذكير مهذب بسداد اشتراك الشهر الجديد' },
      { id: 'detailsInfo', label: 'تفاصيل إضافية (أرقام الدفع / مواعيد)', type: 'text', default: 'الاشتراك 350 ج | التحصيل متاح كاش مع البواب أو عبر إنستاباي على حساب 01012345678' }
    ],
    calcLogic: `
      const b = inputs.bName;
      const cat = inputs.messageCategory;
      const det = inputs.detailsInfo;
      
      let msg = '';
      if (cat.includes('سداد')) {
        msg = 'السادة جيراننا الأعزاء وسكان ' + b + ' الكرام 🌸\\n\\n' +
              'تحية طيبة ومباركة،،\\n' +
              'نود تذكيركم بموعد سداد اشتراك الصيانة الشهري، ليتسنى لإدارة الصندوق سداد راتب الحارس وفواتير الكهرباء وصيانة المصعد دون تأخير.\\n\\n' +
              '📌 التفاصيل: ' + det + '\\n\\n' +
              'شاكرين ومقدرين دوام تعاونكم وحرصكم على بقاء بيتنا المشترك في أفضل صورة. دمتم بخير 🌿';
      } else if (cat.includes('المصعد')) {
        msg = '⚠️ إشعار هام - صيانة مصعد ' + b + ' 🛗\\n\\n' +
              'نحيطكم علماً بأنه ستبدأ أعمال الصيانة الدورية للمصعد اليوم بين الساعة (...) حتى الساعة (...)، وسيتوقف المصعد مؤقتاً خلال هذه الفترة لسلامتكم.\\n\\n' +
              '📌 الملاحظات: ' + det + '\\n\\n' +
              'نعتذر عن أي إزعاج مؤقت، ونعمل دائماً لأجل سلامتكم وراحة أسركم.';
      } else if (cat.includes('بوابة')) {
        msg = '🔐 تنبيه أمني - بخصوص الباب الرئيسي لـ ' + b + ' 🚪\\n\\n' +
              'حرصاً على أمن وسلامة العقار وكافة الأسر والأطفال، يُرجى من حضراتكم التأكد دائماً من غلق البوابة الرئيسية بإحكام عند الدخول أو الخروج وعدم تركها مفتوحة.\\n\\n' +
              '📌 ' + det + '\\n\\n' +
              'أمن العمارة مسؤوليتنا جميعاً.. شكراً لحرصكم وتعاونكم الدائم 🤝';
      } else {
        msg = '🕊️ ميثاق الجيرة الطيبة والهدوء المشترك - ' + b + ' 🌿\\n\\n' +
              'جيراننا الكرام، نحرص جميعاً على راحة وخصوصية بعضنا البعض، ونذكر أنفسنا وإياكم بمراعاة أوقات الراحة بعد العاشرة مساءً، وخفض الأصوات وعدم القيام بأعمال صاخبة في أوقات متأخرة.\\n\\n' +
              '📌 ' + det + '\\n\\n' +
              'جزاكم الله خيراً على حسن الجوار والتفهم الراقي المعهود.';
      }

      return {
        outputText: msg,
        stat1: cat,
        stat2: b,
        stat3: 'جاهز للنسخ والإرسال بواتساب'
      };
    `,
    resultFields: [
      { label: 'نوع الإعلان', id: 'stat1', isHighlight: false },
      { label: 'حالة الرسالة', id: 'stat3', isHighlight: true }
    ],
    faqs: [
      { q: 'كيف نمنع الشجار والمشادات في قروب واتساب العمارة؟', a: 'يُنصح بقفل خاصية إرسال الرسائل للأعضاء وجعلها للمشرفين فقط (Broadcast Announcements) لمنع الجدال والتحول لقروب نقاشي صاخب.' }
    ]
  },

  {
    slug: 'resident-satisfaction-survey-generator',
    title: 'مولد استبيان رضا السكان واستطلاع الآراء حول الصيانة والنظافة',
    shortTitle: 'مولد استبيان رضا سكان العمارة',
    desc: 'نموذج تقييم دوري احترافي لاستطلاع آراء الشاغلين حول مستوى نظافة السلالم، كفاءة حارس العقار، سرعة حل الأعطال، واقتراحات التطوير.',
    icon: '📋',
    category: 'أمن وتواصل',
    keywords: 'استبيان سكان استطلاع راي رضا الجيران تقييم بواب خدمات عمارة جودة صيانة نموذج تقييم',
    isGenerator: true,
    inputs: [
      { id: 'bName', label: 'اسم العقار', type: 'text', default: 'برج الياسمين' },
      { id: 'surveyPeriod', label: 'فترة التقييم', type: 'text', default: 'نصف سنوي (يناير - يونيو 2026)' },
      { id: 'customTopics', label: 'مواضيع إضافية مراد استطلاع الرأي عنها', type: 'text', default: 'تركيب إنتركم مرئي، استبدال لمبات السلم بحساسات، تشجير المدخل' }
    ],
    calcLogic: `
      let doc = 'استبيان استطلاع رأي ورضا شاغلي ' + inputs.bName + '\\n';
      doc += 'الفترة: ' + inputs.surveyPeriod + ' | يرجى وضع تقييم من (1 إلى 5 نجوم) لكل بند:\\n\\n';
      doc += '1. نظافة مدخل العقار والسلالم والمصعد:\\n   [ ] ممتاز  [ ] جيد جداً  [ ] متوسط  [ ] ضعيف\\n\\n';
      doc += '2. التزام وسلوك وأمانة حارس العقار (البواب):\\n   [ ] ممتاز  [ ] جيد جداً  [ ] متوسط  [ ] ضعيف\\n\\n';
      doc += '3. كفاءة وسرعة إصلاح أعطال المصعد والمواتير:\\n   [ ] ممتاز  [ ] جيد جداً  [ ] متوسط  [ ] ضعيف\\n\\n';
      doc += '4. الشفافية المالية ودقة التقارير وسندات القبض:\\n   [ ] ممتاز  [ ] جيد جداً  [ ] متوسط  [ ] ضعيف\\n\\n';
      doc += '5. مدى تأييدكم للمشاريع التحسينية التالية:\\n   - ' + inputs.customTopics + '\\n   [ ] موافق ومستعد للمساهمة  [ ] أتحفظ حالياً\\n\\n';
      doc += 'مقترحات أو شكاوى إضافية تودون مشاركتها مع مجلس الإدارة:\\n....................................................................................\\n\\n';
      doc += 'رقم الشقة (اختياري لسرية التقييم): ..........';

      return {
        outputText: doc,
        stat1: inputs.bName,
        stat2: inputs.surveyPeriod,
        stat3: 'جاهز للتوزيع أو الطباعة'
      };
    `,
    resultFields: [
      { label: 'العقار', id: 'stat1', isHighlight: false },
      { label: 'فترة الاستبيان', id: 'stat2', isHighlight: false },
      { label: 'حالة الاستبيان', id: 'stat3', isHighlight: true }
    ],
    faqs: [
      { q: 'لماذا يُفضل جعل خانة رقم الشقة اختيارية في استبيان السكان؟', a: 'لأن إتاحة إبداء الرأي مجهول الهوية يشجع السكان على تقديم ملاحظات صريحة وصادقة حول أداء الحارس أو مجلس الإدارة دون حرج.' }
    ]
  },

  {
    slug: 'package-delivery-log-generator',
    title: 'مولد سجل ودفتر استلام الطرود والشحنات مع الحارس لمنع الضياع',
    shortTitle: 'مولد سجل استلام الطرود والشحنات',
    desc: 'دفتر رسمي منظم يسجل فيه البواب الطرود ومشتريات الأونلاين المسلمة للشقق: اسم المشتري، شركة الشحن، كود الطرد، وتوقيع الاستلام.',
    icon: '📦',
    category: 'أمن وتواصل',
    keywords: 'دفتر طرود استلام شحنات ديلفري مشتريات اونلاين حارس بواب امانات عمارة توقيع استلام',
    isGenerator: true,
    inputs: [
      { id: 'bName', label: 'اسم العمارة', type: 'text', default: 'عمارة 24 - المعادي' },
      { id: 'guardName', label: 'اسم الحارس المسؤول عن الاستلام', type: 'text', default: 'عم شعبان' }
    ],
    calcLogic: `
      let doc = 'سجل ودفتر أمانات واستلام طرود الشحن البريدي - ' + inputs.bName + '\\n';
      doc += 'مسؤول الدفتر: ' + inputs.guardName + ' | تنبيه: يمنع تسليم أي طرد إلا لصاحب الشقة بالتوقيع.\\n\\n';
      doc += '| م | التاريخ | رقم الشقة | اسم الساكن | شركة الشحن / المندوب | كود/وصف الطرد | توقيع الساكن بالاستلام |\\n';
      doc += '|:---:|:---:|:---:|:---:|:---:|:---:|:---|\\n';
      for(let i=1; i<=15; i++) {
        doc += '| ' + i + ' | .../... | شقة ..... | .................... | أمان / أمازون / نون | .................... | .................... |\\n';
      }

      return {
        outputText: doc,
        stat1: inputs.bName,
        stat2: inputs.guardName,
        stat3: 'جاهز للطباعة والتجليد'
      };
    `,
    resultFields: [
      { label: 'العقار', id: 'stat1', isHighlight: false },
      { label: 'حارس الاستلام', id: 'stat2', isHighlight: false },
      { label: 'حالة الدفتر', id: 'stat3', isHighlight: true }
    ],
    faqs: [
      { q: 'هل الحارس مسؤول قانوناً عن الطرد إذا ضاع وهو في عهدته؟', a: 'إذا تسلم الحارس الطرد ووقع لمندوب الشحن، يعتبر مؤتمناً عليه ويتحمل مسؤوليته، لذا فإن توثيق كل حركة في دفتر يمنع الخلافات.' }
    ]
  },

  {
    slug: 'visitor-parking-pass-generator',
    title: 'مولد تصاريح ركن مؤقتة لسيارات الزوار والضيوف في جراج العمارة',
    shortTitle: 'مولد تصريح ركن سيارات الزوار بالجراج',
    desc: 'ولّد كروت تصريح ركن مرقمة ومؤقتة توضع على تابلوه سيارات الضيوف في الجراج لمنع التكدس وتجنب احتلال بايكات السكان الخاصة.',
    icon: '🎫',
    category: 'أمن وتواصل',
    keywords: 'تصريح ركن زوار ضيوف جراج سيارات بايكة مؤقتة تنظيم جراج كارت زائر عمارة',
    isGenerator: true,
    inputs: [
      { id: 'bName', label: 'اسم العقار', type: 'text', default: 'كمبوند ديار 5' },
      { id: 'flatNo', label: 'الشقة المستضيفة للزائر', type: 'text', default: 'شقة رقم 15 - الدور الرابع' },
      { id: 'carPlate', label: 'رقم لوحة سيارة الضيف', type: 'text', default: 'س ف ر 1284' },
      { id: 'validUntil', label: 'مدة صلاحية الركن المصرح بها', type: 'text', default: 'حتى الساعة 11:30 مساء اليوم فقط' }
    ],
    calcLogic: `
      let doc = '-----------------------------------------------------------\\n';
      doc += '🅿️ تصريح ركن مؤقت لسيارة زائر - ' + inputs.bName + '\\n';
      doc += '-----------------------------------------------------------\\n';
      doc += 'الجهة المستضيفة: ' + inputs.flatNo + '\\n';
      doc += 'رقم لوحة السيارة: [ ' + inputs.carPlate + ' ]\\n';
      doc += 'الصلاحية المعتمدة: ' + inputs.validUntil + '\\n\\n';
      doc += 'تعليمات هامة لصاحب المركبة:\\n';
      doc += '1. يرجى وضع هذا التصريح بشكل واضح وبارز على تابلوه السيارة.\\n';
      doc += '2. الركن مسموح فقط في الأماكن المخصصة للزوار (Visitor Bays) دون إغلاق بايكات الملاك.\\n';
      doc += '3. يمنع المبيت بالجراج دون إذن كتابي مسبق من إدارة العقار.\\n';
      doc += '-----------------------------------------------------------\\n';
      doc += 'اعتماد أمن الجراج / مأمور الاتحاد: ....................';

      return {
        outputText: doc,
        stat1: inputs.carPlate,
        stat2: inputs.validUntil,
        stat3: 'جاهز للطباعة والوضع على التابلوه'
      };
    `,
    resultFields: [
      { label: 'سيارة الضيف', id: 'stat1', isHighlight: false },
      { label: 'المهلة المصرحة', id: 'stat2', isHighlight: true },
      { label: 'حالة التصريح', id: 'stat3', isHighlight: false }
    ],
    faqs: [
      { q: 'ما الإجراء إذا ركن زائر في بايكة أحد السكان واختفى؟', a: 'يمنح تصريح الزائر رقم تليفون الشقة المستضيفة المباشر ليتصل به الأمن فوراً لنقل السيارة دون نشوب مشاجرات بين الجيران.' }
    ]
  },

  {
    slug: 'lost-and-found-notice-generator',
    title: 'مولد إشعار المفقودات والمقتنيات بالأجزاء المشتركة (لوحة الإعلانات/واتساب)',
    shortTitle: 'مولد إشعار المفقودات والأمانات بالعمارة',
    desc: 'ولّد إعلاناً احترافياً رسمياً عند العثور على أمانات، مفاتيح، أو مقتنيات مفقودة في المصعد أو المدخل لنشره بالمدخل أو قروب الواتساب.',
    icon: '🔍',
    category: 'أمن وتواصل',
    keywords: 'مفقودات عمارة مفاتيح امانات مصعد اعلان عثور على شيء مفقود لوحة اعلانات واتساب',
    isGenerator: true,
    inputs: [
      { id: 'foundItem', label: 'المقتنى أو الشيء الذي تم العثور عليه', type: 'text', default: 'ميدالية مفاتيح سيارة وريموت جراج' },
      { id: 'foundLocation', label: 'مكان وتاريخ العثور عليه', type: 'text', default: 'داخل أرضية كابينة المصعد - صباح اليوم' },
      { id: 'custodyWith', label: 'الأمانة مودعة طرف مين؟', type: 'text', default: 'حارس العقار (عم مسعود) / أمين الصندوق شقة 6' }
    ],
    calcLogic: `
      let doc = '🔔 إشعار عثور على مفقودات وأمانات بالعمارة 🔔\\n\\n';
      doc += 'تم بحمد الله العثور على: (' + inputs.foundItem + ').\\n';
      doc += '📍 المكان والتاريخ: ' + inputs.foundLocation + '.\\n\\n';
      doc += 'على من يتعرف على مقتنياته ومواصفاتها الخاصة، يرجى التكرم بالتواصل لاستلامها من:\\n';
      doc += '👤 ' + inputs.custodyWith + '.\\n\\n';
      doc += 'شاكرين أمانة من سلمها، ونسأل الله أن يعيد الأمانات لأصحابها 🌿';

      return {
        outputText: doc,
        stat1: inputs.foundItem,
        stat2: inputs.custodyWith,
        stat3: 'جاهز للنشر فوراً'
      };
    `,
    resultFields: [
      { label: 'الشيء المفقود', id: 'stat1', isHighlight: false },
      { label: 'المودع لديه', id: 'stat2', isHighlight: true }
    ],
    faqs: [
      { q: 'لماذا يُفضل عدم ذكر تفاصيل العلامات الدقيقة في إشعار المفقودات؟', a: 'ليقوم من يدعي ملكيته للشيء بذكر العلامات المميزة بنفسه لإثبات حيازته الصحيحة وتفادي تسليم الأمانة لغير صاحبها.' }
    ]
  },

  {
    slug: 'renovation-work-permit-generator',
    title: 'مولد تصريح تشطيبات داخلية وضوابط مواعيد التكسير ونقل الردش',
    shortTitle: 'مولد تصريح تشطيبات وضوابط التكسير',
    desc: 'وثيقة تصريح تشطيب رسمي تلزم مقاول الشقة بمواعيد التكسير المحددة، حماية المصعد بالتجليد، سداد تأمين النظافة، ونقل مخلفات الهدم (الردش) يومياً.',
    icon: '🔨',
    category: 'أمن وتواصل',
    keywords: 'تصريح تشطيب تكسير شقة ردش مخلفات هدم مواعيد ازعاج تشطيبات تجليد مصعد تامين نظافة',
    isGenerator: true,
    inputs: [
      { id: 'apartmentNo', label: 'رقم الشقة ومكان العمل', type: 'text', default: 'شقة 9 - الدور الرابع' },
      { id: 'contractorInfo', label: 'اسم المقاول المسؤول ورقم هاتفه', type: 'text', default: 'م. سامي نبيل - 01223456789' },
      { id: 'securityDeposit', label: 'مبلغ تأمين نظافة وسلامة المرافق (ج)', type: 'number', default: '3000' },
      { id: 'workHours', label: 'ساعات العمل والتكسير المصرح بها', type: 'text', default: 'من 9:00 صباحاً حتى 5:00 مساءً فقط (ويحظر الجمعة تماماً)' }
    ],
    calcLogic: `
      let doc = 'تصريح أعمال تشطيبات داخلية والتزام المقاول والشاغل\\n\\n';
      doc += 'الوحدة محل التشطيب: ' + inputs.apartmentNo + '\\n';
      doc += 'المقاول المنفذ: ' + inputs.contractorInfo + '\\n';
      doc += 'مبلغ التأمين المودع طرف الخزينة: (' + inputs.securityDeposit + ' جنيه).\\n\\n';
      doc += 'الشروط والضوابط الإلزامية:\\n';
      doc += '1. مواعيد التكسير والإزعاج: ' + inputs.workHours + '. يمنع منعاً باتاً التكسير خارج هذه الساعات.\\n';
      doc += '2. حماية المصعد: يحظر استخدام المصعد لنقل مواد البناء (الأسمنت، الرمل، السيراميك) إلا بعد تجليد الكابينة بالكامل بالكرتون والأبلكاش وبحمل لا يتجاوز 300 كجم.\\n';
      doc += '3. تشوين ونقل الردش: يحظر تكويم أكياس الردش ومخلفات الهدم أمام مدخل العمارة أو في المناور، ويلتزم المقاول بتحميلها بسيارة نقل فوراً.\\n';
      doc += '4. استرداد التأمين: يُرد مبلغ التأمين فور انتهاء الأعمال ومعاينة سلامة السلالم وبلاط المدخل ونظافة المناور.\\n\\n';
      doc += 'توقيع المقاول بالالتزام: ....................\\n';
      doc += 'توقيع مالك الشقة: ....................\\n';
      doc += 'اعتماد مأمور الاتحاد: ....................';

      return {
        outputText: doc,
        stat1: inputs.apartmentNo,
        stat2: inputs.securityDeposit + ' ج تأمين',
        stat3: 'جاهز للاعتماد والتوقيع'
      };
    `,
    resultFields: [
      { label: 'الشقة محل العمل', id: 'stat1', isHighlight: false },
      { label: 'مبلغ تأمين المرافق', id: 'stat2', isHighlight: true },
      { label: 'حالة التصريح', id: 'stat3', isHighlight: false }
    ],
    faqs: [
      { q: 'هل يحق لاتحاد الشاغلين تحصيل مبلغ تأمين مسترد قبل بدء تشطيب أي شقة؟', a: 'نعم، طبقاً للائحة العقار لحماية المصعد والسلالم والمدخل من أي كسور أو أتربة يتركها عمال التشطيب، ويُرد المبلغ بالكامل فور معاينة النظافة.' }
    ]
  },

  {
    slug: 'building-fire-drill-checklist-generator',
    title: 'مولد قائمة فحص خراطيم ومحابس وطفايات الحريق وخطة الإخلاء',
    shortTitle: 'مولد قائمة فحص طفايات وأنظمة الحريق',
    desc: 'جدول تدقيق وتفتيش ربع سنوي لمعدات الإطفاء بالعمارة: فحص ضغط مؤشر طفايات البودرة، سلامة خراطيم مياه الدفاع المدني، وصلاحية جرس الإنذار.',
    icon: '🚒',
    category: 'أمن وتواصل',
    keywords: 'طفايات حريق فحص طفاية خراطيم حريق دفاع مدني خطة اخلاء حريق عمارة جرس انذار سلامة مدنية',
    isGenerator: true,
    inputs: [
      { id: 'bName', label: 'اسم العقار', type: 'text', default: 'برج السلام' },
      { id: 'floorsCount', label: 'عدد الأدوار السكنية', type: 'number', default: '8' },
      { id: 'extinguishersCount', label: 'عدد طفايات الحريق الموزعة بالعقار', type: 'number', default: '10' }
    ],
    calcLogic: `
      let doc = 'قائمة الفحص والتفتيش الدوري لمعدات مكافحة الحرائق - ' + inputs.bName + '\\n';
      doc += 'تاريخ التفتيش: ' + (new Date().toISOString().slice(0,10)) + ' | إجمالي الطفايات: ' + inputs.extinguishersCount + ' طفاية\\n\\n';
      doc += '| رقم الطفاية | المكان / الدور | نوع الطفاية | مؤشر الضغط (الأخضر) | خرطوم الإطلاق | تاريخ انتهاء الصلاحية | حالة الفحص |\\n';
      doc += '|:---:|:---:|:---:|:---:|:---:|:---:|:---|\\n';
      const count = parseInt(inputs.extinguishersCount) || 5;
      for(let i=1; i<=count; i++) {
        doc += '| F-0' + i + ' | دور ' + (i%8 + 1) + ' | بودرة كيميائية 6 كجم | [ ] في الأخضر | [ ] سليم ولا تشقق | .../.../2027 | [ ] صالح [ ] يحتاج تعبئة |\\n';
      }
      doc += '\\nفحص خط خراطيم الحريق ومضخة الطوارئ:\\n';
      doc += '- [ ] صندوق الخرطوم بالمدخل نظيف والزجاج غير مكسور.\\n';
      doc += '- [ ] محبس المياه العمومي يفتح ويغلق بسلاسة دون صلبخ أو صدأ.\\n';
      doc += '- [ ] مسارات السلالم خالية تماماً من الكراكيب أو الجزامات لتسهيل الهروب.\\n\\n';
      doc += 'توقيع مسؤول السلامة / أمين الاتحاد: ....................';

      return {
        outputText: doc,
        stat1: count + ' طفايات حريق',
        stat2: 'فحص دوري معتمد',
        stat3: 'جاهز للاستخدام'
      };
    `,
    resultFields: [
      { label: 'عدد طفايات العقار', id: 'stat1', isHighlight: false },
      { label: 'حالة القائمة', id: 'stat3', isHighlight: true }
    ],
    faqs: [
      { q: 'متى يجب إعادة تعبئة طفاية الحريق الكيميائية في العمارة؟', a: 'يجب تعبئتها سنوياً أو فور هبوط مؤشر الضغط (المانوميتر) إلى المنطقة الحمراء، أو بمجرد استخدامها ولو لبضع ثوانٍ.' }
    ]
  },

  {
    slug: 'contractor-incident-report-generator',
    title: 'مولد تقرير واقعة أو تلف في ممتلكات العمارة مع إثبات الحالة والشهود',
    shortTitle: 'مولد تقرير إثبات واقعة تلف ممتلكات',
    desc: 'نموذج إثبات حالة رسمي وتوثيق أضرار وتلفيات المرافق المشتركة (كسر زجاج المدخل، تجريح كابينة المصعد، كسر ماسورة) مع تحديد المتسبب والتعويض.',
    icon: '📑',
    category: 'أمن وتواصل',
    keywords: 'اثبات حالة تلف ممتلكات كسر اسانسير تجريح مدخل تقرير واقعة تعويض اضرار عمارة شهود',
    isGenerator: true,
    inputs: [
      { id: 'incidentDate', label: 'تاريخ وتوقيت الواقعة', type: 'text', default: 'اليوم الساعة 3:30 عصراً' },
      { id: 'damagedPart', label: 'المرفق أو الجزء المتضرر', type: 'text', default: 'مرآة كابينة المصعد وزجاج باب المدخل السيكوريت' },
      { id: 'causeAndPerson', label: 'المتسبب بالواقعة وظروف حدوثها', type: 'text', default: 'عمال نقل عفش وأثاث تابعين للشقة رقم 11 أثناء الصعود بدولاب خشب كبير' },
      { id: 'estimatedLoss', label: 'القيمة التقديرية لإصلاح التلفيات (ج)', type: 'number', default: '4500' }
    ],
    calcLogic: `
      let doc = 'محضر إثبات واقعة وتلفيات بالأجزاء المشتركة للعقار\\n\\n';
      doc += 'إنه في يوم: .................... الموافق: ' + inputs.incidentDate + '\\n';
      doc += 'اجتمعت لجنة إدارة العقار بحضور الشهود لإثبات الأضرار التالية:\\n';
      doc += 'المرفق المتضرر: ' + inputs.damagedPart + '\\n\\n';
      doc += 'ملابسات الواقعة والمتسبب:\\n' + inputs.causeAndPerson + '\\n\\n';
      doc += 'المعاينة الفنية وقيمة الضرر:\\n';
      doc += 'تبين بالفحص وجود تلف مباشر يستوجب استبدال وإعادة الشيء لأصله، وقُدرت تكلفة الإصلاح المبدئية بمبلغ: (' + inputs.estimatedLoss + ' جنيهاً مصرياً).\\n\\n';
      doc += 'المسؤولية القانونية والالتزام:\\n';
      doc += 'يتحمل الشاغل والطرف المتسبب المسؤولية المدنية الكاملة عن تعويض الأضرار خلال مهلة 48 ساعة، وإلا يحق لاتحاد الشاغلين خصم المبلغ من التأمين أو المطالبة القضائية بالتعويض.\\n\\n';
      doc += 'توقيع المتسبب / الساكن المستفيد: ....................\\n';
      doc += 'توقيع حارس العقار والشاهد: ....................\\n';
      doc += 'اعتماد مأمور الاتحاد: ....................';

      return {
        outputText: doc,
        stat1: inputs.damagedPart,
        stat2: inputs.estimatedLoss + ' ج تعويض مقدر',
        stat3: 'جاهز للاعتماد'
      };
    `,
    resultFields: [
      { label: 'المرفق المتلف', id: 'stat1', isHighlight: false },
      { label: 'التعويض المقدر', id: 'stat2', isHighlight: true },
      { label: 'حالة التقرير', id: 'stat3', isHighlight: false }
    ],
    faqs: [
      { q: 'هل ساكن الشقة مسؤول عن التلفيات التي يحدثها عمال التوصيل أو نقل العفش؟', a: 'نعم طبقاً لقواعد المسؤولية عن التابع في القانون المدني، يسأل المستأجر أو المالك عن الأضرار التي يلحقها ضيوفه أو عماله بالأجزاء المشتركة للعقار.' }
    ]
  }
];
