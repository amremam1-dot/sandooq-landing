document.addEventListener("DOMContentLoaded", () => {
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
    dashboard: "assets/showcase-dashboard.png",
    units: "assets/showcase-units.png",
    payments: "assets/showcase-payments.png"
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
    });
  });

  // 5. Scroll Reveal Observer
  const reveals = document.querySelectorAll(".reveal");
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
});
