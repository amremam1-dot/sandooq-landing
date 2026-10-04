document.documentElement.classList.add("js-ready");

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
              website: "https://sandoqalemara.com"
            };
          }
        }, opts);
      } catch (err) {
        console.error("WebMCP registration error:", err);
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

document.addEventListener("DOMContentLoaded", () => {
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

  // 2. Mobile Menu Toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
      const isOpen = navMenu.classList.contains("open");
      menuToggle.setAttribute("aria-expanded", isOpen);
    });

    // Close menu when clicking links
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Interactive Showcase Tabs
  const showcaseTabs = document.querySelectorAll(".showcase-tab");
  const showcaseImg = document.getElementById("showcase-img");
  const tabCaptions = document.querySelectorAll(".tab-caption");

  const showcaseImages = {
    dashboard: "assets/showcase-dashboard.webp",
    units: "assets/showcase-units.webp",
    payments: "assets/showcase-payments.webp"
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
});

