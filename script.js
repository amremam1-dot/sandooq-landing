document.documentElement.classList.add("js-ready");

if (typeof window !== "undefined" && (window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/index'))) {
  window.history.replaceState(null, '', window.location.origin + '/' + window.location.search + window.location.hash);
}

// --- WebMCP (Model Context Protocol for Browser & AI Agents) ---
(function initWebMcp() {
  function registerTools() {
    const ctx = (typeof document !== "undefined" && document.modelContext)
      || (typeof navigator !== "undefined" && navigator.modelContext);

    if (ctx && typeof ctx.registerTool === "function") {
      if (window.__webmcp_registered) return;
      window.__webmcp_registered = true;

      const ac = typeof AbortController !== "undefined" ? new AbortController() : null;
      const opts = ac ? { signal: ac.signal } : {};

      try {
        ctx.registerTool({
          name: "calculate_building_fee",
          description: "Calculate monthly dues per apartment given total common expenses and number of units in Sandooq El-Amara.",
          inputSchema: {
            type: "object",
            properties: {
              units_count: {
                type: "number",
                description: "Total number of units or apartments in the building"
              },
              expenses_total: {
                type: "number",
                description: "Total estimated monthly expenses in EGP"
              }
            },
            required: ["units_count", "expenses_total"]
          },
          execute: async ({ units_count, expenses_total }) => {
            const units = Math.max(1, Number(units_count) || 1);
            const total = Number(expenses_total) || 0;
            return {
              fee_per_unit: Math.ceil(total / units),
              units: units,
              total_expenses: total,
              currency: "EGP"
            };
          }
        }, opts);

        ctx.registerTool({
          name: "get_sandooq_info",
          description: "Retrieve official features, download links, and pricing for Sandooq El-Amara residential property fund manager.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Optional query or feature topic"
              }
            }
          },
          execute: async () => {
            return {
              name: "صندوق العمارة (Sandooq El-Amara)",
              download_url: "https://sandoqalemara.com/download.html",
              billing_url: "https://sandoqalemara.com/billing.html",
              website: "https://sandoqalemara.com",
              features: [
                "الإدخال الصوتي الذكي مع عم أمين بالعامية المصرية",
                "استيراد وتصدير إكسيل متطور بالذكاء الاصطناعي مع درع التراجع الفوري",
                "توليد إيصالات ومطالبات واتساب فورية",
                "سداد المديونيات السابقة المقطوعة مع مسار مالي مستقل",
                "إدارة المشاريع الخاصة وصناديق الصيانة وعمرة المصعد",
                "ضبط عهدة البواب النقدية وصندوق المسجد المستقل",
                "إرفاق صور الفواتير السحابية والمحلية ومشاركتها",
                "يعمل أوفلاين بدون إنترنت مع مزامنة سحابية مشفرة"
              ]
            };
          }
        }, opts);
      } catch (err) {
        console.debug("WebMCP registration note:", err);
      }
    }
  }

  registerTools();

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", registerTools);
    }
    window.addEventListener("load", registerTools);
  }

  try {
    let _ctx = (typeof document !== "undefined") ? document.modelContext : null;
    if (typeof document !== "undefined" && !document.modelContext) {
      Object.defineProperty(document, "modelContext", {
        configurable: true,
        enumerable: true,
        get: () => _ctx,
        set: (val) => {
          _ctx = val;
          registerTools();
        }
      });
    }
  } catch (e) {}
})();

function initMainApp() {
  // Helper for GA4 Event Tracking
  function trackEvent(name, params) {
    if (typeof gtag === "function") {
      gtag("event", name, params || {});
    }
  }

  // 1. Theme Toggle
  const themeToggleBtn = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("sandooq_theme") || "dark";

  if (currentTheme === "light") {
    document.body.classList.add("light-theme");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      localStorage.setItem("sandooq_theme", isLight ? "light" : "dark");
      trackEvent("theme_toggle", { selected_theme: isLight ? "light" : "dark" });
    });
  }

  // 2. Mobile Menu Toggle (Robust, click outside, escape key, visual state)
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav");

  if (menuToggle && navMenu && !menuToggle.__menuInitialized) {
    menuToggle.__menuInitialized = true;

    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.classList.toggle("active", isOpen);
    });

    // Close menu when clicking links
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("active");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (navMenu.classList.contains("open") && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("active");
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.classList.remove("active");
      }
    });
  }

  // 3. Interactive Showcase Tabs
  const showcaseTabs = document.querySelectorAll(".showcase-tab");
  const showcaseImg = document.getElementById("showcase-img");
  const tabCaptions = document.querySelectorAll(".tab-caption");

  const showcaseImages = {
    dashboard: "assets/showcase-dashboard-720.webp",
    units: "assets/showcase-units-720.webp",
    payments: "assets/showcase-payments-720.webp",
    voice: "assets/showcase-voice.jpg",
    excel: "assets/showcase-reports.webp"
  };

  showcaseTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");

      // Update active tab
      showcaseTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Update screenshot
      if (showcaseImg && showcaseImages[target]) {
        showcaseImg.style.opacity = "0";
        setTimeout(() => {
          showcaseImg.src = showcaseImages[target];
          showcaseImg.style.opacity = "1";
        }, 150);
      }

      // Update caption
      tabCaptions.forEach(c => {
        c.classList.remove("active");
        if (c.id === `caption-${target}`) {
          c.classList.add("active");
        }
      });

      trackEvent("showcase_tab_click", { tab_name: target });
    });
  });

  // 4. FAQ Accordion
  const faqTriggers = document.querySelectorAll(".faq-trigger");
  faqTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const item = trigger.parentElement;
      const isActive = item.classList.contains("active");

      // Close all other FAQs
      document.querySelectorAll(".faq-item").forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });

      // Toggle current
      item.classList.toggle("active", !isActive);
      if (!isActive) {
        const questionText = trigger.querySelector("span")?.textContent.trim();
        trackEvent("faq_expand", { question: questionText });
      }
    });
  });

  // 5. Scroll Reveal Observer (Progressive Enhancement)
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    reveals.forEach(el => revealObserver.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("active"));
  }

  // 6. Conversion Analytics Tracking
  // Google Play CTA clicks
  document.querySelectorAll("a[href*='play.google.com']").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("google_play_click", {
        link_url: link.href,
        section: link.closest("section")?.id || "header_or_hero"
      });
    });
  });

  // Calculator visits
  document.querySelectorAll("a[href*='building-fee-calculator']").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("calculator_open", { from_page: window.location.pathname });
    });
  });

  // Receipt Generator visits
  document.querySelectorAll("a[href*='receipt-generator']").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("receipt_generator_open", { from_page: window.location.pathname });
    });
  });

  // Guides navigation
  document.querySelectorAll("a[href*='guides/']").forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("guide_open", { guide_path: link.getAttribute("href") });
    });
  });

  // Pricing buttons
  document.querySelectorAll(".pricing-card a").forEach(btn => {
    btn.addEventListener("click", () => {
      const planName = btn.closest(".pricing-card")?.querySelector(".pricing-title")?.textContent.trim() || "plan";
      trackEvent("pricing_click", { plan: planName });
    });
  });

  // Video Chapter navigation helper
  window.seekAppVideo = function(seconds) {
    const iframe = document.getElementById("mainWalkthroughVideo");
    if (iframe) {
      iframe.src = `https://www.youtube-nocookie.com/embed/0wJ3LRZAtq0?start=${seconds}&autoplay=1`;
      iframe.scrollIntoView({ behavior: "smooth", block: "center" });
      trackEvent("video_chapter_click", { timestamp: seconds });
    }
  };

  // 7. Lazy-load Thunderbolt AI Chat Widget (Eliminates initial Forced Reflow & saves 199 KiB JS)
  (function initChatbot() {
    function loadChatbot() {
      if (window.__chatbot_loaded) return;
      window.__chatbot_loaded = true;
      const script = document.createElement("script");
      script.src = "https://www.thunderbolt.com/gateway/api/v1/thunderbolt-ui/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => setTimeout(loadChatbot, 3500));
    } else {
      setTimeout(loadChatbot, 4000);
    }
    ['scroll', 'mousemove', 'touchstart', 'click'].forEach(evt => {
      window.addEventListener(evt, loadChatbot, { once: true, passive: true });
    });
  })();

  // 8. Reviews Full Details Modal
  const FULL_REVIEWS_DATA = {
    mostafa: {
      name: "Mostafa Hassan (مصطفى حسن)",
      role: "أمين صندوق عمارة — مستخدم نشط",
      badge: "✓ تجربة شاملة وموثقة",
      initials: "MH",
      avatarBg: "linear-gradient(135deg, #10b981, #059669)",
      fullText: [
        "احب اشرحلكم تجربتي مع البرنامج بدون اى نفاق او كذب.....",
        "<strong>اولا :</strong> البرنامج محترم جدا وشافى ووافى ولامم كل امور العمارة ويستحق عن جدارة احسن تطبيق لادارة اى عماره.",
        "<strong>ثانيا ودا الاهم :</strong> القائمين على البرنامج والله والله والله ناس فى قمه الزوق والادب والضمير؛ انا بعتلهم كميه اضافات وتعديلات على البرنامج كبيره جدا ودا باين من المنشورات اللى انا بعتها على الجروب، والناس بصراحه مزهقتش ولاملت منى ولاتجاهلونى ووصلوا لدرجه انهم كانوا بيكلمونى خاص واتس وماسنجر للتأكد من التعديلات والتغيرات اللى طلبتها وكل طلب تعديل اوتغير او تحديث طلبته بصراحه هما عملوه واحسن كمان ماكنت متخيل.",
        "وصلوا التطبيق انه يفسر اى شئ انت متخيله سواء للمستخدم او للساكن لو حب يستفسر عن اى شئ، واللى عجبنى فيهم سرعه العمل والتعديل والتحديث بعد ماببعتلهم التعديل فى نفس اليوم او يوم بالكتير كل التعديلات والتحديثات بتتعمل واحسن مابطلب بصراحة.....",
        "انت اكتر حاجه عجبانى فى التطبيق فريق العمل لسرعه فى الرد على المستخدمين ومتابعة التعديلات اللى طالبه المستحدم ومتابعته اكتر من التطبيق نفسه، بالرغم من التطبيق جامد جدا ولاغنى عنه، ولكن اللى حببنى فى البرنامج اكتر بصراحة فريق العمل القائم عليه..... اتمنى من القائمين عليه الاستمرار فى تقديم خدمه الدعم للتطبيق للمستحدمين وعدم التغافل عن البرنامج بعد فتره طويله وتجاهله مما يؤدى الى اسقاط او ضياع البرنامج."
      ]
    },
    mohamed: {
      name: "Mohamed Emam (محمد إمام)",
      role: "إدارة وتشغيل عقارات",
      badge: "✓ تجربة فعلية ومستمرة",
      initials: "ME",
      avatarBg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      fullText: [
        "بصراحة ومن خلال تجربة فعلية ومستمرّة للتطبيق، أستطيع القول إن التطبيق أكثر من رائع، وإمكانياته مميزة جدًا، ويجمع بين سهولة الاستخدام والدقة والتنظيم والشفافية بشكل واضح.",
        "وأرى أن الإمكانيات الموجودة حاليًا، مع التحديثات والتطوير المستمر، تجعله مشروعًا واعدًا جدًا وقادرًا على أن يكون رقم واحد في هذا المجال مستقبلًا بإذن الله.",
        "وأكثر ما يميزه أن التطوير لا يتوقف، فكل فترة نجد أفكارًا جديدة وتحسينات تضيف قيمة حقيقية وتجعله أكثر احترافية وسهولة في الاستخدام. وهذا يدل على أن القائمين عليه لديهم رؤية."
      ]
    }
  };

  window.openReviewModal = function(key) {
    const data = FULL_REVIEWS_DATA[key];
    if (!data) return;
    const modal = document.getElementById("reviewModal");
    if (!modal) return;

    document.getElementById("modalName").textContent = data.name;
    document.getElementById("modalRole").textContent = data.role;
    document.getElementById("modalAvatar").textContent = data.initials;
    document.getElementById("modalAvatar").style.background = data.avatarBg;
    document.getElementById("modalBadge").textContent = data.badge;

    const bodyEl = document.getElementById("modalBody");
    bodyEl.innerHTML = data.fullText.map(p => `<p>${p}</p>`).join("");

    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  window.closeReviewModal = function() {
    const modal = document.getElementById("reviewModal");
    if (!modal) return;
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeReviewModal();
  });

  const modalEl = document.getElementById("reviewModal");
  if (modalEl) {
    modalEl.addEventListener("click", (e) => {
      if (e.target.id === "reviewModal") window.closeReviewModal();
    });
  }

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMainApp);
} else {
  initMainApp();
}


