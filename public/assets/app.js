/**
 * Krewire Contributors Portal — Client Interactions
 * - Theme Switcher (light/dark with localStorage persistence)
 * - Responsive Navbar Toggler & Mobile Drawer Menu
 * - Viewport Fade-In Animations (IntersectionObserver)
 */

(function () {
  'use strict';

  // Helper: Copy Command for Terminal components
  function copyCmd(btn, text) {
    if (!btn) return;
    var orig = btn.innerText;
    function showCopied() {
      btn.innerText = '✓ Copied!';
      setTimeout(function () { btn.innerText = orig; }, 2000);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(showCopied).catch(function () {
        fallbackCopy(text, showCopied);
      });
    } else {
      fallbackCopy(text, showCopied);
    }
  }

  function fallbackCopy(text, cb) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (cb) cb();
    } catch (err) {}
  }

  window.copyCmd = copyCmd;

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
          var lang = (window.krewireI18n && window.krewireI18n.getLocale()) || 'en';
          var copiedMsg = (translations[lang] && (translations[lang].pathways || translations[lang].navigator) && translations[lang].navigator.copied_btn) || 'Copied!';
          copyText.textContent = copiedMsg;
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
    "en": {
        "nav": {
            "badge": "Community & Sponsors",
            "privileges": "Why Contribute",
            "pathways": "Pathways & Repos",
            "guide": "Contributor Guide",
            "standards": "Quality Gates",
            "sponsorship": "Sponsorship",
            "boost": "AI Boost",
            "discussions": "Discussions ↗",
            "github_org": "GitHub Organization"
        },
        "hero": {
            "eyebrow": "◈ OPEN-SOURCE COLLECTIVE · BORN IN INDONESIA · FOR THE WORLD",
            "title_html": "Contribute Code. Sponsor Open Source.<br>Empower Indonesian Engineers.",
            "lead": "Krewire is an open-source movement engineered in Indonesia to turn builders from software consumers into world-class creators. With our modular Go libraries, active contributors earn lifetime commercial product licenses, while sponsors sustain independent infrastructure and maintainers.",
            "cta_contribute": "Start Contributing →",
            "cta_sponsor": "Sponsor Collective 💖",
            "cta_issues": "Good First Issues ↗",
            "meta": "100% Open Source Core (MIT) · Community-Owned · Independent Infrastructure · AI-Assisted Synergy"
        },
        "trust": {
            "label": "Community & Stewardship Baseline",
            "indonesia_html": "<b>Indonesian</b> Collective",
            "meritocracy_html": "<b>Meritocracy</b> Perks",
            "opencore_html": "<b>Open Core</b> Sustainability",
            "free_html": "<b>100%</b> Free Core (MIT)",
            "cost": "Near-Zero Cloud Cost"
        },
        "privileges": {
            "badge": "Contributor Privileges",
            "title": "Lifetime Access to Krewire's Paid Ecosystem",
            "subtitle": "True builders deserve shared ownership. By joining and actively contributing to the Krewire open-source collective, you earn lifetime access to our upcoming commercial sub-products and premium ecosystem tools.",
            "p1_badge": "Core Privilege",
            "p1_title": "Commercial Sub-Products Lifetime Access",
            "p1_desc": "Receive free lifetime licenses for upcoming commercial Krewire products — including managed cloud orchestration tools, enterprise modules, and premium services.",
            "p1_i1": "Free lifetime access to all paid Krewire commercial sub-products",
            "p1_i2": "Priority early-access releases and exclusive roadmap previews",
            "p1_i3": "Direct private collaboration channels with core maintainers",
            "p2_badge": "Strict Requirement",
            "p2_title": "Active Contributions Required",
            "p2_desc": "This privilege is a two-way commitment. Your access remains active as long as you regularly contribute and help nurture the ecosystem's growth.",
            "p2_i1": "Submit PRs for new features, bugfixes, or kernel optimizations",
            "p2_i2": "Review open PRs and stress-test high-concurrency scenarios",
            "p2_i3": "Author KWF architecture specifications or comprehensive docs",
            "p3_badge": "Revocation Policy",
            "p3_title": "Revocable if Inactive or Dormant",
            "p3_desc": "To protect community fairness and true meritocracy, commercial access licenses may be revoked if a contributor becomes inactive or dormant over an extended period.",
            "p3_i1": "Contributor activity and commits are periodically audited",
            "p3_i2": "Prolonged inactivity or dormancy leads to license deactivation",
            "p3_i3": "Access privileges can be promptly reinstated upon resumed contribution",
            "policy_title": "Krewire Meritocracy Policy:",
            "policy_text": "We believe those who lay the foundation should share in its fruits. Commercial access is free for all active contributors, provided ongoing dedication to the collective is consistently maintained."
        },
        "pathways": {
            "badge": "Codebase Matrix",
            "title": "4 Public Repositories & Where to Start",
            "subtitle": "Match your skills and passions to the right repository, bootstrap your local environment, and dive straight into active issues.",
            "one_line_title": "One-Command Contributor Bootstrap",
            "one_line_badge": "Recommended",
            "one_line_desc_html": "Clone the core repository, run the test suites, and verify all 3 automated quality gates:",
            "copy_btn": "Copy",
            "copied_btn": "Copied!",
            "meta_prereq": "Prerequisites: Go 1.27.1+ and Git",
            "meta_zero": "Zero manual configuration required",
            "filter_label": "Filter by Track:",
            "filter_all": "All Repositories",
            "filter_core": "Core Monorepo & Books",
            "filter_web": "Portals & Sites",
            "track_krewire": "Core Monorepo & Libraries",
            "track_mdbind": "Static Books & Documentation",
            "track_krewire_com": "Official Product & Docs Site",
            "track_github_io": "Community & Sponsorship Portal",
            "match_krewire": "If you enjoy: Modular Go libraries (packages/*), CLI devtool (tools/kiw), fullstack runtimes, background queues, and AI agent templates (templates/boost).",
            "match_mdbind": "If you enjoy: Lightning-fast static documentation builders, Markdown AST transformations, instant live reload, search indexing, and syntax highlighters.",
            "match_krewire_com": "If you enjoy: High-fidelity web design, interactive documentation, component-driven layouts, and dogfooding the .kiw DSL in production.",
            "match_github_io": "If you enjoy: Community engagement, sponsorship platforms, localization (i18n), accessible UI components, and contributor onboarding portals.",
            "pkg_label": "Key Packages & Paths:",
            "action_issues": "Good First Issues →",
            "action_repo": "GitHub Repo ↗"
        },
        "guide": {
            "badge": "Onboarding Fast-Track",
            "title": "Start Contributing in 5 Steps",
            "subtitle": "From zero to your first merged pull request. Here is how to get your development environment running in minutes.",
            "s1_title": "1. Fork & Clone Repositories",
            "s1_desc": "Fork any Krewire repository to your personal GitHub account, then clone it locally to begin.",
            "s2_title": "2. Initialize Workspace (go.work)",
            "s2_desc": "If working across multiple repos, synchronize your local Go workspace seamlessly with Go 1.27.1+.",
            "s3_title": "3. Pick an Open Issue",
            "s3_desc_html": "Browse our curated issues list tagged with <span class=\"tag-issue\">good-first-issue</span> or <span class=\"tag-issue\">help-wanted</span>. Comment to let maintainers know you are working on it.",
            "s3_btn": "View Good First Issues →",
            "s4_title": "4. Implement & Verify Locally",
            "s4_desc": "Write clean, idiomatic Go code and tests. Verify that all 3 Quality Gates pass with zero failures.",
            "s5_title": "5. Submit PR with Conventional Commits",
            "s5_desc": "Open a PR following Conventional Commits (feat, fix, docs, refactor, test). Maintainers and AI Boost will review and guide you to merge."
        },
        "standards": {
            "badge": "Quality Assurance",
            "title": "The Krewire Way: 3 Quality Gates",
            "subtitle": "To keep the codebase reliable, predictable, and production-ready, every pull request passes through three automated gates.",
            "gate1_title": "Gate 1: Format & Lint",
            "gate1_desc": "Zero lint errors and idiomatic Go formatting. Code must adhere strictly to Go standard conventions.",
            "gate1_req": "Required: gofmt -l . (clean), go vet ./... (clean)",
            "gate2_title": "Gate 2: Race & Tests",
            "gate2_desc": "Every commit is verified with race condition detection and comprehensive unit & integration tests.",
            "gate2_req": "Required: 100% test pass, 0 data races",
            "gate3_title": "Gate 3: Spec & Commits",
            "gate3_desc": "Changes must link to a valid Spec or Issue, following Conventional Commits format.",
            "gate3_req": "Required: Semantic commit format & spec traceability"
        },
        "sponsorship": {
            "badge": "Community Support",
            "title": "Sponsoring Krewire",
            "subtitle": "Krewire is an independent open-source collective born in Indonesia. Sponsorship sustains full-time engineering, independent infrastructure, security signing, and community education — keeping the ecosystem 100% open and community-owned.",
            "channel1_badge": "Individual & Community Backers",
            "channel1_title": "GitHub Sponsors",
            "channel1_desc": "Support Krewire with recurring monthly backing or one-time contributions. Every contribution directly funds developer infrastructure, domain upkeep, test runners, and open-source tooling.",
            "channel1_p1": "Backer badge & recognition in Krewire README & official sites",
            "channel1_p2": "Direct updates from maintainers on roadmap & releases",
            "channel1_p3": "Join private community discussions and early preview channels",
            "channel1_p4": "Zero platform fee — 100% goes directly to ecosystem sustainability",
            "channel1_cta": "Back on GitHub Sponsors 💖 →",
            "channel2_badge": "Companies & Organizations",
            "channel2_title": "Corporate & Strategic Sponsorship",
            "channel2_desc": "For engineering organizations, tech startups, and enterprises building upon Krewire or investing in Indonesia's open-source technology sovereignty.",
            "channel2_p1": "Prominent logo placement on krewire.com, docs, and event materials",
            "channel2_p2": "Direct priority issue advisory & architectural guidance with core team",
            "channel2_p3": "Custom invoicing, tax receipting, or B2B community partnership agreements",
            "channel2_p4": "Showcase your organization's engineering culture and job openings to Krewire builders",
            "channel2_cta": "Inquire for Corporate Sponsorship →",
            "trust_title": "100% Open Source, Always",
            "trust_desc": "Sponsorship is purely an investment into public goods. No paid paywalls, no proprietary gates in core packages — all code remains free and open under the MIT license.",
            "trust_btn": "Become a Sponsor →"
        },
        "guild": {
            "badge": "Human + AI Synergy",
            "title": "Collaborating with AI Boost",
            "lead": "Krewire pioneers the collaboration between human maintainers and autonomous AI agents. Our AI Boost framework operates with strict verification standards:",
            "item1_html": "<b>Automated Architecture Audits:</b> AI agents check PRs against <code>KWF-*</code> specifications.",
            "item2_html": "<b>Continuous Regression Hunting:</b> Agents synthesize edge cases and race condition checks.",
            "item3_html": "<b>Transparent Pair Programming:</b> AI agents explain architectural decisions openly in discussions and PR comments.",
            "item4_html": "<b>Human Governance:</b> Ultimate merging authority always remains in the hands of human collective maintainers.",
            "cta_repo": "Explore AI Boost in Krewire →",
            "cta_disc": "Join Discussions",
            "triad_title": "AI Boost Agent Triad",
            "planner_title": "Requirements & SDD",
            "planner_desc": "Translates feature ideas into formal specs and architectural blueprints.",
            "builder_title": "Implementation & Refactoring",
            "builder_desc": "Generates clean Go implementations adhering to idiomatic patterns.",
            "auditor_title": "Verification & Quality Gates",
            "auditor_desc": "Validates concurrency, zero data races, and performance benchmarks."
        },
        "cta": {
            "badge": "Join the Collective",
            "title": "Ready to Shape the Future of Indonesian Tech?",
            "lead": "Whether you are writing your first Go pull request or sponsoring our developer community, you are laying the foundation for open-source self-reliance.",
            "github": "Explore Open Issues on GitHub →",
            "sponsor": "Sponsor on GitHub 💖",
            "meta": "Proudly open source · MIT Licensed · Engineered with passion in Indonesia"
        },
        "footer": {
            "brand_title": "Krewire Community & Sponsors",
            "desc_html": "Official Contributor Hub & Sponsorship Platform.<br>An open-source collective based in Indonesia, building an autonomous, sustainable, and scalable Go ecosystem.",
            "col_repos": "Repositories",
            "col_contrib": "Contribution",
            "col_community": "Community & Sponsors",
            "perks": "Contributor Perks & Access",
            "where_start": "4 Public Repositories Matrix",
            "getting_started": "5-Step Contributor Guide",
            "pathways": "Contribution Pathways",
            "standards": "3 Quality Gates",
            "guild": "AI Boost Synergy",
            "kwf_specs": "KWF Specifications",
            "gh_org": "GitHub Organization",
            "discussions": "Community Discussions",
            "good_first": "Good First Issues",
            "coc": "Code of Conduct",
            "bottom_rights_html": "© 2026 Krewire Contributors — An open-source collective based in Indonesia. Built 100% with Krewire <code>site</code> workload."
        }
    },
    "id": {
        "nav": {
            "badge": "Komunitas & Sponsor",
            "privileges": "Mengapa Berkontribusi",
            "pathways": "Jalur & Repositori",
            "guide": "Panduan Kontributor",
            "standards": "Standar Mutu",
            "sponsorship": "Sponsor",
            "boost": "AI Boost",
            "discussions": "Diskusi ↗",
            "github_org": "Organisasi GitHub"
        },
        "hero": {
            "eyebrow": "◈ KOLEKTIF SUMBER TERBUKA · LAHIR DI INDONESIA · UNTUK DUNIA",
            "title_html": "Berkontribusi Kode. Sponsori Sumber Terbuka.<br>Berdayakan Rekayasawan Indonesia.",
            "lead": "Krewire adalah gerakan sumber terbuka yang direkayasa di Indonesia untuk mengubah para pengembang dari konsumen perangkat lunak menjadi pencipta kelas dunia. Melalui pustaka Go modular, kontributor aktif mendapatkan lisensi komersial seumur hidup, sementara para sponsor mendukung infrastruktur mandiri dan para pengelola.",
            "cta_contribute": "Mulai Berkontribusi →",
            "cta_sponsor": "Sponsori Kolektif 💖",
            "cta_issues": "Good First Issues ↗",
            "meta": "100% Inti Sumber Terbuka (MIT) · Milik Komunitas · Infrastruktur Mandiri · Sinergi AI Boost"
        },
        "trust": {
            "label": "Fondasi Komunitas & Tata Kelola",
            "indonesia_html": "Kolektif <b>Indonesia</b>",
            "meritocracy_html": "Apresiasi <b>Meritokrasi</b>",
            "opencore_html": "Keberlanjutan <b>Open Core</b>",
            "free_html": "Inti <b>100%</b> Gratis (MIT)",
            "cost": "Biaya Cloud Mendekati Nol"
        },
        "privileges": {
            "badge": "Hak Istimewa Kontributor",
            "title": "Akses Seumur Hidup ke Ekosistem Komersial Krewire",
            "subtitle": "Pembangun sejati layak mendapatkan kepemilikan bersama. Dengan bergabung dan berkontribusi secara aktif dalam kolektif sumber terbuka Krewire, Anda memperoleh akses seumur hidup gratis ke produk-produk komersial dan perangkat premium kami di masa depan.",
            "p1_badge": "Hak Utama",
            "p1_title": "Akses Seumur Hidup Produk Komersial",
            "p1_desc": "Dapatkan lisensi seumur hidup gratis untuk produk komersial Krewire mendatang — termasuk perkakas orkestrasi cloud terkelola, modul enterprise, dan layanan premium.",
            "p1_i1": "Akses seumur hidup gratis ke seluruh produk komersial Krewire berbayar",
            "p1_i2": "Akses awal prioritas dan pratinjau peta jalan eksklusif",
            "p1_i3": "Kanal kolaborasi privat langsung bersama pengelola inti",
            "p2_badge": "Komitmen Bersama",
            "p2_title": "Wajib Berkontribusi Aktif",
            "p2_desc": "Hak istimewa ini adalah komitmen dua arah. Akses Anda tetap aktif selama Anda berkontribusi secara rutin dan membantu menumbuhkan ekosistem.",
            "p2_i1": "Kirim PR untuk fitur baru, perbaikan bug, atau optimasi kernel",
            "p2_i2": "Tinjau PR terbuka dan uji stres skenario konkurensi tinggi",
            "p2_i3": "Tulis spesifikasi arsitektur KWF atau dokumentasi komprehensif",
            "p3_badge": "Kebijakan Pencabutan",
            "p3_title": "Dapat Dicabut jika Tidak Aktif / Dorman",
            "p3_desc": "Untuk melindungi keadilan komunitas dan meritokrasi murni, lisensi komersial dapat dicabut jika kontributor tidak aktif dalam jangka waktu lama.",
            "p3_i1": "Aktivitas dan commit kontributor diaudit secara berkala",
            "p3_i2": "Ketidakaktifan berkepanjangan menyebabkan penonaktifan lisensi",
            "p3_i3": "Hak akses dapat segera dipulihkan saat kontribusi dilanjutkan",
            "policy_title": "Kebijakan Meritokrasi Krewire:",
            "policy_text": "Kami percaya mereka yang membangun fondasi layak menikmati hasilnya. Akses komersial gratis bagi seluruh kontributor aktif, selama dedikasi berkelanjutan terhadap kolektif tetap terjaga."
        },
        "pathways": {
            "badge": "Matriks Basis Kode",
            "title": "4 Repositori Publik & Tempat Memulai",
            "subtitle": "Cocokkan keahlian dan minat Anda dengan repositori yang tepat, siapkan lingkungan lokal, dan langsung tangani isu aktif.",
            "one_line_title": "Bootstrap Kontributor Satu Perintah",
            "one_line_badge": "Disarankan",
            "one_line_desc_html": "Klon repositori inti, jalankan pengujian, dan verifikasi seluruh 3 Quality Gate otomatis:",
            "copy_btn": "Salin",
            "copied_btn": "Tersalin!",
            "meta_prereq": "Prasyarat: Go 1.27.1+ dan Git",
            "meta_zero": "Tanpa konfigurasi manual yang rumit",
            "filter_label": "Filter Berdasarkan Jalur:",
            "filter_all": "Semua Repositori",
            "filter_core": "Monorepo Inti & Buku",
            "filter_web": "Portal & Situs Web",
            "track_krewire": "Monorepo Inti & Pustaka",
            "track_mdbind": "Buku Statis & Dokumentasi",
            "track_krewire_com": "Situs Produk & Dokumen Resmi",
            "track_github_io": "Portal Komunitas & Sponsor",
            "match_krewire": "Jika Anda menyukai: Pustaka Go modular (packages/*), CLI devtool (tools/kiw), runtime fullstack, antrean latar belakang, dan template agen AI (templates/boost).",
            "match_mdbind": "Jika Anda menyukai: Pembangun dokumentasi statis super cepat, transformasi AST Markdown, live reload instan, pengindeksan pencarian, dan penyorot sintaksis.",
            "match_krewire_com": "Jika Anda menyukai: Desain web presisi tinggi, dokumentasi interaktif, tata letak berbasis komponen, dan dogfooding DSL .kiw di produksi.",
            "match_github_io": "Jika Anda menyukai: Keterlibatan komunitas, platform sponsorship, pelokalan (i18n), komponen antarmuka aksesibel, dan portal orientasi kontributor.",
            "pkg_label": "Paket & Jalur Utama:",
            "action_issues": "Good First Issues →",
            "action_repo": "Repositori GitHub ↗"
        },
        "guide": {
            "badge": "Jalur Cepat Kontributor",
            "title": "Mulai Berkontribusi dalam 5 Langkah",
            "subtitle": "Dari nol hingga pull request pertama Anda digabungkan. Berikut cara menyiapkan lingkungan pengembangan Anda dalam hitungan menit.",
            "s1_title": "1. Fork & Klon Repositori",
            "s1_desc": "Fork repositori Krewire ke akun GitHub pribadi Anda, lalu klon secara lokal untuk memulai.",
            "s2_title": "2. Inisialisasi Workspace (go.work)",
            "s2_desc": "Jika bekerja lintas repositori, sinkronkan workspace Go lokal Anda secara mulus dengan Go 1.27.1+.",
            "s3_title": "3. Pilih Isu Terbuka",
            "s3_desc_html": "Jelajahi daftar isu pilihan bertanda <span class=\"tag-issue\">good-first-issue</span> atau <span class=\"tag-issue\">help-wanted</span>. Berikan komentar agar pengelola mengetahui Anda sedang mengerjakannya.",
            "s3_btn": "Lihat Good First Issues →",
            "s4_title": "4. Implementasi & Uji Lokal",
            "s4_desc": "Tulis kode Go yang bersih, idiomatis, dan sertakan pengujian. Pastikan seluruh 3 Quality Gate lolos tanpa kegagalan.",
            "s5_title": "5. Kirim PR dengan Conventional Commits",
            "s5_desc": "Buka PR dengan format Conventional Commits (feat, fix, docs, refactor, test). Pengelola dan AI Boost akan meninjau dan memandu proses merge."
        },
        "standards": {
            "badge": "Jaminan Kualitas",
            "title": "Cara Krewire: 3 Quality Gate",
            "subtitle": "Agar basis kode tetap handal, dapat diprediksi, dan siap produksi, setiap pull request wajib melewati tiga gerbang otomatis.",
            "gate1_title": "Gerbang 1: Format & Lint",
            "gate1_desc": "Nol kesalahan linting dan format Go idiomatis. Kode wajib mematuhi konvensi standar Go secara ketat.",
            "gate1_req": "Wajib: gofmt -l . (bersih), go vet ./... (bersih)",
            "gate2_title": "Gerbang 2: Race & Pengujian",
            "gate2_desc": "Setiap commit diverifikasi dengan deteksi kondisi balapan (race detector) dan pengujian unit/integrasi menyeluruh.",
            "gate2_req": "Wajib: 100% tes lolos, 0 data race",
            "gate3_title": "Gerbang 3: Spesifikasi & Commit",
            "gate3_desc": "Perubahan harus tertaut ke Spesifikasi atau Isu yang sah, mengikuti format Conventional Commits.",
            "gate3_req": "Wajib: Format commit semantik & keterlacakan spesifikasi"
        },
        "sponsorship": {
            "badge": "Dukungan Komunitas",
            "title": "Sponsori Krewire",
            "subtitle": "Krewire adalah kolektif sumber terbuka independen yang berbasis di Indonesia. Dukungan sponsor menopang rekayasa penuh waktu, infrastruktur mandiri, sertifikasi keamanan, dan edukasi komunitas — menjaga ekosistem 100% terbuka dan milik komunitas.",
            "channel1_badge": "Individu & Pendukung Komunitas",
            "channel1_title": "GitHub Sponsors",
            "channel1_desc": "Dukung Krewire secara bulanan atau donasi satu kali. Setiap kontribusi langsung mendanai infrastruktur pengembang, domain, test runner CI, dan devtools sumber terbuka.",
            "channel1_p1": "Lencana donatur & pencantuman nama di README Krewire serta situs resmi",
            "channel1_p2": "Pembaruan langsung dari maintainer terkait roadmap & rilis ekosistem",
            "channel1_p3": "Akses ke kanal diskusi komunitas privat dan pengujian fitur awal",
            "channel1_p4": "Bebas biaya platform — 100% dana dialokasikan untuk keberlanjutan ekosistem",
            "channel1_cta": "Dukung via GitHub Sponsors 💖 →",
            "channel2_badge": "Perusahaan & Organisasi",
            "channel2_title": "Sponsorship Korporat & Kemitraan Strategis",
            "channel2_desc": "Bagi organisasi rekayasa perangkat lunak, startup, dan korporasi yang membangun produk di atas Krewire atau berinvestasi pada kedaulatan teknologi Indonesia.",
            "channel2_p1": "Penempatan logo resmi di portal krewire.com, dokumentasi, dan materi rilis",
            "channel2_p2": "Konsultasi arsitektur langsung & prioritas penanganan isu dari tim inti",
            "channel2_p3": "Faktur resmi, dokumen perpajakan, atau perjanjian kemitraan B2B",
            "channel2_p4": "Promosikan kultur rekayasa dan lowongan kerja teknologi Anda kepada para pembangun Krewire",
            "channel2_cta": "Hubungi untuk Kemitraan Korporat →",
            "trust_title": "100% Sumber Terbuka, Selamanya",
            "trust_desc": "Sponsorship murni merupakan investasi untuk barang publik (public goods). Tidak ada paywall berbayar atau fitur terkunci pada paket inti — seluruh kode tetap bebas dan terbuka di bawah lisensi MIT.",
            "trust_btn": "Menjadi Sponsor →"
        },
        "guild": {
            "badge": "Sinergi Manusia + AI",
            "title": "Berkolaborasi dengan AI Boost",
            "lead": "Krewire memelopori kolaborasi antara pengelola manusia dan agen AI otonom. Kerangka kerja AI Boost kami beroperasi dengan standar verifikasi yang ketat:",
            "item1_html": "<b>Audit Arsitektur Otomatis:</b> Agen AI memeriksa PR terhadap spesifikasi <code>KWF-*</code>.",
            "item2_html": "<b>Pemberantasan Regresi Berkelanjutan:</b> Agen mensintesis uji kasus ekstrem dan deteksi kondisi balapan.",
            "item3_html": "<b>Pair Programming Transparan:</b> Agen AI menjelaskan keputusan arsitektur secara terbuka dalam diskusi dan komentar PR.",
            "item4_html": "<b>Tata Kelola Manusia:</b> Otoritas penggabungan (merge) mutlak tetap berada di tangan pengelola kolektif manusia.",
            "cta_repo": "Jelajahi AI Boost di Krewire →",
            "cta_disc": "Gabung Diskusi",
            "triad_title": "Triad Agen AI Boost",
            "planner_title": "Kebutuhan & SDD",
            "planner_desc": "Menerjemahkan ide fitur menjadi spesifikasi formal dan cetak biru arsitektur.",
            "builder_title": "Implementasi & Refaktorisasi",
            "builder_desc": "Menghasilkan implementasi Go yang bersih dan mematuhi pola idiomatis.",
            "auditor_title": "Verifikasi & Quality Gate",
            "auditor_desc": "Memvalidasi konkurensi, nol data race, dan tolok ukur performa."
        },
        "cta": {
            "badge": "Bergabung dengan Kolektif",
            "title": "Siap Membentuk Masa Depan Teknologi Indonesia?",
            "lead": "Baik Anda menulis pull request Go pertama Anda atau mensponsori komunitas pengembang kami, Anda sedang meletakkan fondasi kemandirian teknologi sumber terbuka.",
            "github": "Jelajahi Isu Terbuka di GitHub →",
            "sponsor": "Sponsori di GitHub 💖",
            "meta": "Bangga sumber terbuka · Berlisensi MIT · Direkayasa dengan dedikasi di Indonesia"
        },
        "footer": {
            "brand_title": "Komunitas & Sponsor Krewire",
            "desc_html": "Pusat Kontributor & Platform Sponsorship Resmi.<br>Kolektif sumber terbuka berbasis di Indonesia, membangun ekosistem Go yang mandiri, berkelanjutan, dan berskala.",
            "col_repos": "Repositori",
            "col_contrib": "Kontribusi",
            "col_community": "Komunitas & Sponsor",
            "perks": "Hak Istimewa Kontributor",
            "where_start": "Matriks 4 Repositori Publik",
            "getting_started": "Panduan Kontributor 5 Langkah",
            "pathways": "Jalur Kontribusi",
            "standards": "3 Quality Gate",
            "guild": "Sinergi AI Boost",
            "kwf_specs": "Spesifikasi KWF",
            "gh_org": "Organisasi GitHub",
            "discussions": "Diskusi Komunitas",
            "good_first": "Good First Issues",
            "coc": "Kode Etik",
            "bottom_rights_html": "© 2026 Kontributor Krewire — Kolektif sumber terbuka berbasis di Indonesia. Dibangun 100% dengan workload <code>site</code> Krewire."
        }
    }
  };

  function getNestedValue(obj, keyPath) {
    if (!obj || !keyPath) return null;
    var parts = keyPath.split(".");
    var curr = obj;
    for (var i = 0; i < parts.length; i++) {
      if (curr && typeof curr === "object" && parts[i] in curr) {
        curr = curr[parts[i]];
      } else {
        return null;
      }
    }
    return curr;
  }

  function initI18n() {
    var currentLang = "en";
    try {
      var saved = localStorage.getItem("krewire-lang");
      if (saved === "id" || saved === "en") {
        currentLang = saved;
      } else if (navigator.language && navigator.language.toLowerCase().startsWith("id")) {
        currentLang = "id";
      }
    } catch (e) {}

    function applyLanguage(lang) {
      currentLang = (lang === "id") ? "id" : "en";
      document.documentElement.lang = currentLang;
      try {
        localStorage.setItem("krewire-lang", currentLang);
      } catch (e) {}

      document.querySelectorAll(".lang-toggle .lang-code").forEach(function(el) {
        el.textContent = currentLang.toUpperCase();
      });

      document.querySelectorAll("[data-i18n]").forEach(function(el) {
        var key = el.getAttribute("data-i18n");
        var val = getNestedValue(translations[currentLang], key) || getNestedValue(translations.en, key);
        if (val) {
          if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.setAttribute("placeholder", val);
          } else {
            el.textContent = val;
          }
        }
      });

      document.querySelectorAll("[data-i18n-html]").forEach(function(el) {
        var key = el.getAttribute("data-i18n-html");
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
        applyLanguage(currentLang === "en" ? "id" : "en");
      }
    };

    applyLanguage(currentLang);
  }

  // Initialize theme immediately to prevent flash
  initTheme();

  // Initialize interactive components when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
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
