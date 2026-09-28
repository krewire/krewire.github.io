/**
 * Krewire Contributors Portal — Client Interactions
 * - Theme Switcher (light/dark with localStorage persistence)
 * - Responsive Navbar Toggler & Mobile Drawer Menu
 * - Viewport Fade-In Animations (IntersectionObserver)
 */

(function () {
  'use strict';

  // 1. THEME SWITCHER
  function initTheme() {
    try {
      var saved = localStorage.getItem('krewire-theme') || 'auto';
      var mode = saved === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : saved;
      document.documentElement.dataset.theme = mode;
    } catch (e) {}

    window.krewireTheme = {
      toggle: function () {
        var cur = document.documentElement.dataset.theme;
        var nxt = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nxt;
        try {
          localStorage.setItem('krewire-theme', nxt);
        } catch (e) {}
      }
    };
  }

  // 2. MOBILE NAVBAR TOGGLER
  function initNav() {
    var toggler = document.querySelector('.nav-toggler');
    var mobileMenu = document.querySelector('.nav-mobile-menu');
    var nav = document.getElementById('main-nav') || document.querySelector('.nav');

    if (!toggler || !mobileMenu) return;

    function toggleNav(open) {
      var isOpen = typeof open === 'boolean' ? open : !mobileMenu.classList.contains('is-open');
      toggler.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      mobileMenu.classList.toggle('is-open', isOpen);
      toggler.classList.toggle('is-active', isOpen);
    }

    toggler.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleNav();
    });

    // Close when tapping navigation link
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleNav(false);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        toggleNav(false);
      }
    });

    // Close when clicking outside navbar
    document.addEventListener('click', function (e) {
      if (mobileMenu.classList.contains('is-open') && nav && !nav.contains(e.target)) {
        toggleNav(false);
      }
    });
  }

  // 3. VIEWPORT FADE-IN ANIMATION (INTERSECTION OBSERVER)
  function initAnimations() {
    var selectors = [
      '.pillar-card',
      '.benefit-card',
      '.repo-card',
      '.pathway-card',
      '.gate-card',
      '.flow-step',
      '.guild-card',
      '.cta-card',
      '.hero-copy',
      '.hero-art',
      '.section-head',
      '.window',
      '.fast-setup-box',
      '.nav-map-card'
    ].join(', ');

    var elements = document.querySelectorAll(selectors);
    if (!elements || elements.length === 0) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -30px 0px'
        }
      );

      elements.forEach(function (el, idx) {
        el.classList.add('reveal');
        // Gentle stagger delay for adjacent cards
        var delay = (idx % 3) * 60;
        if (delay > 0) {
          el.style.transitionDelay = delay + 'ms';
        }
        observer.observe(el);
      });
    } else {
      // Fallback: make elements immediately visible if IntersectionObserver unsupported
      elements.forEach(function (el) {
        el.classList.add('reveal', 'is-visible');
      });
    }
  }

  // 4. CONTRIBUTOR NAVIGATION MAP & COPY ACTION
  function initNavMap() {
    var copyBtn = document.querySelector('[data-copy-cmd]');
    var cmdEl = document.getElementById('setup-cmd');
    if (copyBtn && cmdEl) {
      copyBtn.addEventListener('click', function () {
        var text = cmdEl.innerText || cmdEl.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(onCopied);
        } else {
          var input = document.createElement('textarea');
          input.value = text;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          onCopied();
        }
      });
      function onCopied() {
        var copyText = copyBtn.querySelector('.copy-text');
        if (copyText) {
          var old = copyText.textContent;
          copyText.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(function () {
            copyText.textContent = old;
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      }
    }

    var filterBtns = document.querySelectorAll('[data-nav-filter]');
    var cards = document.querySelectorAll('.repo-card');
    if (filterBtns.length > 0 && cards.length > 0) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-nav-filter');
          filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');

          cards.forEach(function (card) {
            var cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    }
  }

  // 5. I18N SYSTEM (English & Indonesian)
  var translations = {
    en: {
      nav: {
        perks: "Perks & Access",
        start: "Where to Start",
        repositories: "Repositories",
        pathways: "Pathways",
        standards: "Standards",
        guild: "AI Guild",
        github: "GitHub"
      },
      hero: {
        eyebrow: "◈ OPEN SOURCE COLLECTIVE · AUTONOMOUS GO ECOSYSTEM",
        title_html: "Build the Future of Go.<br>Together, Autonomously.",
        lead: "The home for contributors, architects, and AI agent guilds engineering an autonomous, sustainable digital ecosystem in Go. From unified workloads and zero-cost IaC to AI agent orchestration — engineered in Indonesia for engineers worldwide.",
        cta_start: "Start Contributing →",
        cta_repos: "Explore Repositories",
        meta: "Go 1.22+ · Spec-Driven Development (KWF) · Strict Quality Gates · Human & AI Synergy"
      },
      trust: {
        label: "Collective Ecosystem",
        repos_html: "<b>6</b> Active Repositories",
        workloads_html: "<b>8</b> Unified Workloads",
        native_html: "<b>100%</b> Native Go",
        gates_html: "<b>3</b> Strict Quality Gates",
        cost: "Near-Zero Cloud Cost"
      },
      benefits: {
        badge: "Contributor Privilege",
        title: "Lifetime Access to Krewire's Paid Ecosystem",
        subtitle: "Genuine appreciation for true builders. By joining and actively contributing to the Krewire open source collective, you earn lifetime access to our upcoming commercial sub-products and premium ecosystem tools.",
        b1_title: "Commercial Sub-Products Lifetime Access",
        b1_desc: "Receive free lifetime licenses for upcoming commercial Krewire products — including managed cloud orchestration tools, enterprise modules, and premium services.",
        b2_title: "Active Contributions Required",
        b2_desc: "This privilege is a two-way commitment. Your access remains active as long as you regularly contribute and help nurture the ecosystem's growth.",
        b3_title: "Revocable if Inactive or Dormant",
        b3_desc: "To protect community fairness and true meritocracy, commercial access licenses may be revoked at any time if a contributor becomes inactive or dormant over an extended period."
      },
      navigator: {
        badge: "Codebase Matrix & Navigator",
        title: "Core Repositories & Where to Start",
        subtitle: "Match your skills and background to the right codebase, bootstrap your local environment in 30 seconds, and dive straight into active issues.",
        one_line_title: "One-Command Contributor Bootstrap",
        one_line_desc: "Automatically clones all ecosystem repositories, creates your go.work workspace, builds the kiw devtool, and validates compatibility contracts:",
        filter_label: "Filter by Track:",
        filter_all: "All Tracks",
        filter_core: "Go Core & Libs",
        filter_web: "Web & Runtime",
        filter_devops: "DevOps & Infra",
        filter_dx: "CLI & Tooling",
        filter_ai: "AI Guild"
      },
      standards: {
        badge: "Quality Assurance",
        title: "The Krewire Way: 3 Quality Gates",
        subtitle: "To keep the codebase reliable, predictable, and production-ready, every pull request passes through three automated gates."
      },
      guild: {
        badge: "Human + AI Synergy",
        title: "Collaborating with the AI Guild",
        lead: "Krewire pioneers the collaboration between human maintainers and autonomous AI agents. Our AI Guild operates with strict verification standards:"
      }
    },
    id: {
      nav: {
        perks: "Hak & Akses",
        start: "Mulai Dari Mana",
        repositories: "Repositori",
        pathways: "Jalur Kontribusi",
        standards: "Standar",
        guild: "AI Guild",
        github: "GitHub"
      },
      hero: {
        eyebrow: "◈ KOLEKTIF SUMBER TERBUKA · EKOSISTEM GO OTONOM",
        title_html: "Bangun Masa Depan Go.<br>Bersama, Secara Otonom.",
        lead: "Rumah bagi kontributor, arsitek perangkat lunak, dan guild agen AI yang merekayasa ekosistem digital otonom dan berkelanjutan dalam Go. Dari workload terpadu dan IaC hemat biaya hingga orkestrasi agen AI — direkayasa di Indonesia untuk engineer di seluruh dunia.",
        cta_start: "Mulai Berkontribusi →",
        cta_repos: "Jelajahi Repositori",
        meta: "Go 1.22+ · Spec-Driven Development (KWF) · Quality Gate Ketat · Sinergi Manusia & AI"
      },
      trust: {
        label: "Ekosistem Kolektif",
        repos_html: "<b>6</b> Repositori Aktif",
        workloads_html: "<b>8</b> Workload Terpadu",
        native_html: "<b>100%</b> Go Asli",
        gates_html: "<b>3</b> Quality Gate Ketat",
        cost: "Biaya Cloud Mendekati Nol"
      },
      benefits: {
        badge: "Hak Istimewa Kontributor",
        title: "Akses Seumur Hidup ke Ekosistem Berbayar Krewire",
        subtitle: "Apresiasi tulus untuk para perintis sejati. Dengan bergabung dan berkontribusi aktif pada kolektif sumber terbuka Krewire, Anda mendapatkan akses seumur hidup ke sub-produk komersial dan fitur premium kami.",
        b1_title: "Akses Seumur Hidup Sub-Produk Komersial",
        b1_desc: "Dapatkan lisensi seumur hidup gratis untuk produk komersial Krewire mendatang — termasuk perkakas orkestrasi cloud terkelola, modul enterprise, dan layanan premium.",
        b2_title: "Wajib Berkontribusi Aktif",
        b2_desc: "Hak istimewa ini adalah komitmen dua arah. Akses Anda tetap aktif selama Anda berkontribusi secara berkala dan merawat pertumbuhan ekosistem.",
        b3_title: "Dapat Dicabut Jika Tidak Aktif / Dormant",
        b3_desc: "Untuk menjaga keadilan komunitas dan meritokrasi sejati, lisensi akses komersial dapat dicabut kapan saja apabila seorang kontributor tidak aktif dalam jangka waktu lama."
      },
      navigator: {
        badge: "Matriks Basis Kode & Navigator",
        title: "Repositori Inti & Mulai Dari Mana",
        subtitle: "Sesuaikan keahlian dan minat Anda dengan basis kode yang tepat, pasang lingkungan lokal dalam 30 detik, dan langsung mulai berkontribusi pada isu aktif.",
        one_line_title: "Bootstrap Kontributor Sekali Perintah",
        one_line_desc: "Otomatis melakukan kloning seluruh repositori ekosistem, menyiapkan workspace go.work, mengompilasi devtool kiw, dan memvalidasi kontrak kompatibilitas:",
        filter_label: "Filter menurut Jalur:",
        filter_all: "Semua Jalur",
        filter_core: "Go Core & Libs",
        filter_web: "Web & Runtime",
        filter_devops: "DevOps & Infra",
        filter_dx: "CLI & Tooling",
        filter_ai: "AI Guild"
      },
      standards: {
        badge: "Jaminan Kualitas",
        title: "The Krewire Way: 3 Quality Gate",
        subtitle: "Demi menjaga basis kode tetap andal, terprediksi, dan siap produksi, setiap pull request wajib melewati tiga gerbang kendali otomatis."
      },
      guild: {
        badge: "Sinergi Manusia + AI",
        title: "Berkolaborasi dengan AI Guild",
        lead: "Krewire mempelopori kolaborasi antara maintainer manusia dan agen AI otonom. AI Guild kami beroperasi dengan standar verifikasi ketat:"
      }
    }
  };

  function getNestedValue(obj, keyPath) {
    if (!obj || !keyPath) return null;
    var parts = keyPath.split('.');
    var curr = obj;
    for (var i = 0; i < parts.length; i++) {
      if (curr && typeof curr === 'object' && parts[i] in curr) {
        curr = curr[parts[i]];
      } else {
        return null;
      }
    }
    return curr;
  }

  function initI18n() {
    var currentLang = 'en';
    try {
      var saved = localStorage.getItem('krewire-lang');
      if (saved === 'id' || saved === 'en') {
        currentLang = saved;
      } else if (navigator.language && navigator.language.toLowerCase().startsWith('id')) {
        currentLang = 'id';
      }
    } catch (e) {}

    function applyLanguage(lang) {
      currentLang = (lang === 'id') ? 'id' : 'en';
      document.documentElement.lang = currentLang;
      try {
        localStorage.setItem('krewire-lang', currentLang);
      } catch (e) {}

      // Update toggle buttons
      document.querySelectorAll('.lang-toggle .lang-code').forEach(function(el) {
        el.textContent = currentLang.toUpperCase();
      });

      // Update all translatable elements
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        var val = getNestedValue(translations[currentLang], key) || getNestedValue(translations.en, key);
        if (val) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.setAttribute('placeholder', val);
          } else {
            el.textContent = val;
          }
        }
      });

      // Handle elements with HTML data-i18n-html
      document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-html');
        var val = getNestedValue(translations[currentLang], key) || getNestedValue(translations.en, key);
        if (val) {
          el.innerHTML = val;
        }
      });
    }

    window.krewireI18n = {
      getLocale: function() { return currentLang; },
      setLocale: function(l) { applyLanguage(l); },
      toggle: function() {
        applyLanguage(currentLang === 'en' ? 'id' : 'en');
      }
    };

    applyLanguage(currentLang);
  }

  // Initialize theme immediately to prevent flash
  initTheme();

  // Initialize interactive features when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNav();
      initAnimations();
      initNavMap();
      initI18n();
    });
  } else {
    initNav();
    initAnimations();
    initNavMap();
    initI18n();
  }
})();
