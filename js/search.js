/**
 * ============================================================================
 * Sandooq El-Amara — Instant Live Search Engine & Command Palette (R2)
 * Engine: 100% Native Vanilla JavaScript (Zero Dependencies)
 * Performance: Sub-millisecond client-side fuzzy search with Arabic normalization
 * ============================================================================
 */

(function () {
  'use strict';

  // 1. Arabic Normalization Primitives
  function normalizeArabicText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel / diacritics
      .replace(/\u0640/g, '')                // Remove tatweel / kashida
      .replace(/[إأآٱ]/g, 'ا')               // Normalize alif variants
      .replace(/ة/g, 'ه')                    // Normalize taa marbuta
      .replace(/[ىيئ]/g, 'ي')                // Normalize yaa variants
      .replace(/ؤ/g, 'و')                    // Normalize waw with hamza
      .replace(/[٠-٩]/g, function (d) {      // Eastern Arabic to Western numerals
        return '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString();
      })
      .toLowerCase()
      .trim();
  }

  // 2. Safe HTML & Regex Escaping (XSS & Regex Injection Immunity)
  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegExp(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // 3. Dynamic Flexible Arabic Regex for Safe <mark> Highlighting
  function buildArabicHighlightRegex(token) {
    if (!token) return null;
    var tashkeel = '[\\u064B-\\u065F\\u0670\\u0640]*';
    var pattern = '';
    for (var i = 0; i < token.length; i++) {
      var ch = token[i];
      if (/[إأآٱا]/.test(ch)) pattern += '[إأآٱا]';
      else if (/[ةه]/.test(ch)) pattern += '[ةه]';
      else if (/[ىيئ]/.test(ch)) pattern += '[ىيئ]';
      else if (/[وؤ]/.test(ch)) pattern += '[وؤ]';
      else pattern += escapeRegExp(ch);

      if (i < token.length - 1) {
        pattern += tashkeel;
      }
    }
    try {
      return new RegExp('(' + pattern + ')', 'gi');
    } catch (e) {
      return null;
    }
  }

  function highlightMatch(rawText, query) {
    if (!rawText) return '';
    var safeText = escapeHtml(rawText);
    if (!query || typeof query !== 'string') return safeText;

    var normQ = normalizeArabicText(query);
    if (!normQ) return safeText;

    var tokens = normQ.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return safeText;

    var result = safeText;
    for (var i = 0; i < tokens.length; i++) {
      var regex = buildArabicHighlightRegex(tokens[i]);
      if (regex) {
        result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
      }
    }
    return result;
  }

  // 4. Base Path Discovery
  function getBasePath() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('js/search.js') !== -1) {
        var base = src.substring(0, src.indexOf('js/search.js'));
        return base ? base.replace(/\/$/, '') : '.';
      }
    }
    var depth = (window.location.pathname.match(/\//g) || []).length;
    return depth > 1 ? '..' : '.';
  }

  // 5. In-Memory Search Index Store
  var searchIndex = null;
  var isFetchingIndex = false;
  var indexCallbacks = [];

  function loadSearchIndex(callback) {
    if (searchIndex !== null) {
      if (callback) callback(searchIndex);
      return;
    }
    if (callback) indexCallbacks.push(callback);
    if (isFetchingIndex) return;

    isFetchingIndex = true;
    var basePath = getBasePath();
    var indexUrl = isEn ? (basePath + '/data/search_index_en.json') : (basePath + '/data/search_index.json');

    fetch(indexUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        // Pre-normalize fields for rocket speed
        searchIndex = data.map(function (item) {
          return {
            title: item[0],
            slug: item[1],
            excerpt: item[2],
            type: item[3], // 0: guide, 1: tool, 2: solution
            icon: item[4],
            keywords: item[5] || '',
            _normTitle: normalizeArabicText(item[0]),
            _normDesc: normalizeArabicText(item[2]),
            _normKeys: normalizeArabicText(item[5] || '')
          };
        });
        isFetchingIndex = false;
        while (indexCallbacks.length) {
          var cb = indexCallbacks.shift();
          cb(searchIndex);
        }
      })
      .catch(function (err) {
        console.warn('Search index load error:', err);
        isFetchingIndex = false;
      });
  }

  // 6. Sub-millisecond Linear Search Matching Algorithm
  var isEn = typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'en';
  var TYPE_MAP = {
    0: { name: isEn ? 'Guides' : 'أدلة إرشادية', label: isEn ? 'Guide' : 'دليل', badgeClass: 'badge-guide' },
    1: { name: isEn ? 'Calculators & Tools' : 'حاسبات وأدوات', label: isEn ? 'Tool' : 'حاسبة', badgeClass: 'badge-tool' },
    2: { name: isEn ? 'Solutions & Features' : 'حلول وميزات', label: isEn ? 'Solution' : 'حل', badgeClass: 'badge-solution' }
  };

  function executeSearch(query, categoryFilter) {
    if (!searchIndex) return [];
    var q = normalizeArabicText(query);
    if (!q) return [];

    var tokens = q.split(/\s+/).filter(Boolean);
    var results = [];

    for (var i = 0; i < searchIndex.length; i++) {
      var item = searchIndex[i];

      // Category filter check: all | guides | tools | solutions
      if (categoryFilter && categoryFilter !== 'all') {
        if (categoryFilter === 'guides' && item.type !== 0) continue;
        if (categoryFilter === 'tools' && item.type !== 1) continue;
        if (categoryFilter === 'solutions' && item.type !== 2) continue;
      }

      var score = 0;
      var title = item._normTitle;
      var desc = item._normDesc;
      var keys = item._normKeys;

      // Exact phrase match
      if (title.indexOf(q) !== -1) score += 100;
      else if (keys.indexOf(q) !== -1) score += 45;
      else if (desc.indexOf(q) !== -1) score += 35;

      // Token matches
      var matchedCount = 0;
      for (var t = 0; t < tokens.length; t++) {
        var token = tokens[t];
        if (title.indexOf(token) !== -1) {
          score += 25;
          matchedCount++;
        } else if (keys.indexOf(token) !== -1) {
          score += 15;
          matchedCount++;
        } else if (desc.indexOf(token) !== -1) {
          score += 10;
          matchedCount++;
        }
      }

      if (score > 0 && (tokens.length === 1 || matchedCount === tokens.length || score >= 40)) {
        results.push({ item: item, score: score });
      }
    }

    results.sort(function (a, b) {
      return b.score - a.score;
    });

    return results.slice(0, 10).map(function (r) {
      return r.item;
    });
  }

  // 7. Render Result Items
  function renderResultsHtml(items, query, basePath) {
    if (!items || items.length === 0) {
      return (
        '<div class="search-empty-state no-results" role="status">' +
        '  <span class="search-empty-icon">🔍</span>' +
        '  <h4 class="search-empty-title">' + (isEn ? 'No matching results found' : 'لا توجد نتائج مطابقة لبحثك') + '</h4>' +
        '  <p class="search-empty-desc">' + (isEn ? 'Try keywords like: elevator, water bills, InstaPay, or gatekeeper.' : 'لم نعثر على محتوى مطابق. جرّب كلمات أخرى مثل: أسانسير، فواتير، إنستاباي، أو بواب.') + '</p>' +
        '</div>'
      );
    }

    var html = '<ul class="search-results-list" role="listbox">';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var meta = TYPE_MAP[item.type] || TYPE_MAP[0];
      var href = basePath + '/' + item.slug + '.html';
      var highlightedTitle = highlightMatch(item.title, query);
      var highlightedDesc = highlightMatch(item.excerpt, query);

      html +=
        '<li class="search-result-item" role="option" data-url="' + href + '" tabindex="0">' +
        '  <a href="' + href + '" class="search-result-link">' +
        '    <div class="search-result-icon">' + item.icon + '</div>' +
        '    <div class="search-result-content">' +
        '      <div class="search-result-header">' +
        '        <span class="search-result-title">' + highlightedTitle + '</span>' +
        '        <span class="search-result-badge ' + meta.badgeClass + '">' + meta.label + '</span>' +
        '      </div>' +
        '      <p class="search-result-excerpt">' + highlightedDesc + '</p>' +
        '    </div>' +
        '    <span class="search-result-arrow" aria-hidden="true">←</span>' +
        '  </a>' +
        '</li>';
    }
    html += '</ul>';
    return html;
  }

  // 8. Command Palette Modal Controller
  function initSearchModal() {
    var modal = document.getElementById('search-modal');
    if (!modal) return;

    var input = document.getElementById('search-modal-input');
    var closeBtn = document.getElementById('search-modal-close');
    var resultsBox = document.getElementById('search-modal-results');
    var filterTabs = modal.querySelectorAll('.search-filter-tab');
    var currentFilter = 'all';
    var selectedIndex = -1;
    var lastActiveElement = null;

    function openModal() {
      lastActiveElement = document.activeElement;
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('search-modal-open');
      loadSearchIndex(function () {
        if (input) {
          input.focus();
          if (input.value.trim()) {
            performModalSearch();
          }
        }
      });
    }

    function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('search-modal-open');
      selectedIndex = -1;
      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    }

    function performModalSearch() {
      if (!input || !resultsBox) return;
      var query = input.value.trim();
      if (!query) {
        if (isEn) {
          resultsBox.innerHTML =
            '<div class="search-modal-welcome">' +
            '  <p class="search-welcome-text">Type a keyword for instant access to guides, calculators, and building solutions</p>' +
            '  <div class="search-popular-tags">' +
            '    <span>Popular:</span>' +
            '    <button type="button" class="search-tag-chip" data-query="Elevator">Elevator</button>' +
            '    <button type="button" class="search-tag-chip" data-query="Water bill">Water bill</button>' +
            '    <button type="button" class="search-tag-chip" data-query="InstaPay">InstaPay</button>' +
            '    <button type="button" class="search-tag-chip" data-query="Petty cash">Petty cash</button>' +
            '    <button type="button" class="search-tag-chip" data-query="Arrears">Arrears</button>' +
            '  </div>' +
            '</div>';
        } else {
          resultsBox.innerHTML =
            '<div class="search-modal-welcome">' +
            '  <p class="search-welcome-text">اكتب كلمة البحث للوصول الفوري إلى كافة الأدلة والحاسبات وحلول العمارة</p>' +
            '  <div class="search-popular-tags">' +
            '    <span>الأكثر بحثاً:</span>' +
            '    <button type="button" class="search-tag-chip" data-query="أسانسير">أسانسير</button>' +
            '    <button type="button" class="search-tag-chip" data-query="فاتورة مياه">فاتورة مياه</button>' +
            '    <button type="button" class="search-tag-chip" data-query="إنستاباي">إنستاباي</button>' +
            '    <button type="button" class="search-tag-chip" data-query="عهدة بواب">عهدة بواب</button>' +
            '    <button type="button" class="search-tag-chip" data-query="عزل سطح">عزل سطح</button>' +
            '  </div>' +
            '</div>';
        }
        bindWelcomeChips();
        return;
      }

      var items = executeSearch(query, currentFilter);
      var basePath = getBasePath();
      resultsBox.innerHTML = renderResultsHtml(items, query, basePath);
      selectedIndex = -1;
    }

    function bindWelcomeChips() {
      var chips = resultsBox.querySelectorAll('.search-tag-chip');
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var q = this.getAttribute('data-query');
          if (input) {
            input.value = q;
            performModalSearch();
            input.focus();
          }
        });
      });
    }

    // Filter Category Tabs
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter') || 'all';
        performModalSearch();
      });
    });

    // Input listener
    if (input) {
      input.addEventListener('input', function () {
        performModalSearch();
      });
    }

    // Close button & backdrop click
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Keyboard navigation (Ctrl+K, Esc, Arrows, Enter)
    window.addEventListener('keydown', function (e) {
      // Global open shortcut: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        if (modal.style.display === 'none' || !modal.style.display) {
          openModal();
        } else {
          closeModal();
        }
        return;
      }

      // If modal is open
      if (modal.style.display !== 'none' && modal.style.display) {
        // Escape closes modal
        if (e.key === 'Escape' || e.keyCode === 27) {
          e.preventDefault();
          closeModal();
          return;
        }

        var resultItems = resultsBox.querySelectorAll('.search-result-item');
        if (resultItems.length > 0) {
          if (e.key === 'ArrowDown' || e.keyCode === 40) {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % resultItems.length;
            updateSelection(resultItems);
          } else if (e.key === 'ArrowUp' || e.keyCode === 38) {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + resultItems.length) % resultItems.length;
            updateSelection(resultItems);
          } else if (e.key === 'Enter' || e.keyCode === 13) {
            if (selectedIndex >= 0 && selectedIndex < resultItems.length) {
              e.preventDefault();
              var url = resultItems[selectedIndex].getAttribute('data-url');
              if (url) window.location.href = url;
            }
          }
        }
      }
    });

    function updateSelection(items) {
      items.forEach(function (it, idx) {
        if (idx === selectedIndex) {
          it.classList.add('selected');
          it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          it.classList.remove('selected');
        }
      });
    }

    // Global triggers (e.g. #search-trigger-btn in header)
    var triggers = document.querySelectorAll('.search-trigger-btn, [data-action="open-search"]');
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    // Populate initial welcome state
    performModalSearch();
  }

  // 9. Hero Search Hub Controller (for index.html)
  function initHeroSearchHub() {
    var hub = document.getElementById('hero-search-hub');
    if (!hub) return;

    var input = hub.querySelector('.hero-search-input');
    var resultsBox = hub.querySelector('.hero-search-results');
    var filterTabs = hub.querySelectorAll('.hero-search-tab');
    var tagChips = hub.querySelectorAll('.hero-search-tag');
    var currentFilter = 'all';

    function performHeroSearch() {
      if (!input || !resultsBox) return;
      var query = input.value.trim();
      if (!query) {
        resultsBox.style.display = 'none';
        resultsBox.innerHTML = '';
        return;
      }

      loadSearchIndex(function () {
        var items = executeSearch(query, currentFilter);
        var basePath = getBasePath();
        resultsBox.innerHTML = renderResultsHtml(items, query, basePath);
        resultsBox.style.display = 'block';
      });
    }

    if (input) {
      input.addEventListener('focus', function () {
        loadSearchIndex();
      });
      input.addEventListener('input', function () {
        performHeroSearch();
      });
    }

    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter') || 'all';
        performHeroSearch();
      });
    });

    tagChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var q = this.getAttribute('data-query') || this.textContent.trim();
        if (input) {
          input.value = q;
          performHeroSearch();
          input.focus();
        }
      });
    });

    // Click outside hides results
    document.addEventListener('click', function (e) {
      if (resultsBox && !hub.contains(e.target)) {
        resultsBox.style.display = 'none';
      }
    });
  }

  // 10. Bootstrap Engine on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initSearchModal();
      initHeroSearchHub();
    });
  } else {
    initSearchModal();
    initHeroSearchHub();
  }

  // Export for testing in Node / CommonJS environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      normalizeArabicText: normalizeArabicText,
      escapeHtml: escapeHtml,
      escapeRegExp: escapeRegExp,
      buildArabicHighlightRegex: buildArabicHighlightRegex,
      highlightMatch: highlightMatch,
      executeSearch: executeSearch
    };
  }
})();
