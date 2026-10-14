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
            "sponsorship": "Open Core & Sponsorship",
            "boost": "AI Boost",
            "discussions": "Discussions ↗",
            "github_org": "GitHub Organization"
        },
        "hero": {
            "eyebrow": "◈ OPEN-SOURCE COLLECTIVE · BORN IN INDONESIA · FOR THE WORLD",
            "title_html": "Contribute Code. Sponsor Open Source.<br>Empower Indonesian Engineers.",
            "lead": "Krewire is an open-source movement engineered in Indonesia to turn builders from software consumers into world-class creators. With our open-core modular Go libraries, active contributors earn lifetime commercial product licenses, while sponsors sustain independent infrastructure and maintainers.",
            "cta_contribute": "Start Contributing →",
            "cta_sponsor": "Sponsorship & Tiers 💖",
            "cta_issues": "Good First Issues ↗",
            "meta": "100% Open Source Core (MIT) · Free Forever · Four-Rung Tier Ladder · AI-Assisted Synergy"
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
            "title": "5 Repositories & Where to Start",
            "subtitle": "Match your skills and passions to the right repository, bootstrap your local environment, and dive straight into active issues.",
            "one_line_title": "One-Command Contributor Bootstrap",
            "one_line_badge": "Recommended",
            "one_line_desc_html": "Automatically clones all ecosystem repositories, creates your <code>go.work</code> workspace, builds the <code>kiw</code> devtool, and validates compatibility contracts:",
            "copy_btn": "Copy",
            "copied_btn": "Copied!",
            "meta_prereq": "Prerequisites: Go 1.27.1+ and Git",
            "meta_zero": "Zero manual configuration required",
            "filter_label": "Filter by Track:",
            "filter_all": "All Repositories",
            "filter_core": "Core Monorepo & Books",
            "filter_web": "Portals & Sites",
            "filter_docs": "Specs & Architecture",
            "track_krewire": "Core Monorepo & Libraries",
            "track_mdbind": "Static Books & Documentation",
            "track_krewire_com": "Official Product & Docs Site",
            "track_github_io": "Community & Sponsorship Portal",
            "track_internal": "Architecture ADRs & Governance",
            "match_krewire": "If you enjoy: Modular Go libraries (packages/*), CLI devtool (tools/kiw), fullstack runtimes, background queues, and AI agent templates (templates/boost).",
            "match_mdbind": "If you enjoy: Lightning-fast static documentation builders, Markdown AST transformations, instant live reload, search indexing, and syntax highlighters.",
            "match_krewire_com": "If you enjoy: High-fidelity web design, interactive documentation, component-driven layouts, and dogfooding the .kiw DSL in production.",
            "match_github_io": "If you enjoy: Community engagement, sponsorship platforms, localization (i18n), accessible UI components, and contributor onboarding portals.",
            "match_internal": "If you enjoy: Architectural Decision Records (ADRs), ecosystem specifications, long-term roadmaps, and ecosystem governance.",
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
            "badge": "Open Core Model",
            "title": "The Four-Rung Tier Ladder & Sponsorship",
            "subtitle": "Krewire operates on an open core model: every line of code inside krewire/krewire is 100% open source (MIT). The ecosystem starts on the free tier — free forever — and climbs a four-rung ladder of pro, team, and enterprise.",
            "tier1_badge": "Free Forever",
            "tier1_name": "free",
            "tier1_target": "Students, UMKM, hobbyists, evaluation",
            "tier1_desc": "The whole path from requirement to running product. A project built entirely on free modules builds, deploys, and operates with no license key, no seat count, no telemetry, and no expiry.",
            "tier1_f1": "100% Open source (MIT License)",
            "tier1_f2": "Self-serve, no account or license key needed",
            "tier1_f3": "All core modules (kern, web, ui, tui, runtime, i18n, assets, cloud, testing, hub)",
            "tier1_cta": "Get Started (Free) →",
            "tier2_badge": "Planned Tier",
            "tier2_name": "pro",
            "tier2_target": "Individual developers, freelancers, advanced products",
            "tier2_desc": "Self-serve production reliability: distinguishes production-grade operational commitments, hardened security, managed secrets, and commercial sponsorship entitlements.",
            "tier2_f1": "100% Open source (MIT License)",
            "tier2_f2": "Hardened security & signed release pipeline",
            "tier2_f3": "Managed secrets & KMS-backed credential rotation",
            "tier2_cta": "Sponsor on GitHub →",
            "tier3_badge": "Planned Tier",
            "tier3_name": "team",
            "tier3_target": "Growing teams and agencies (multi-contributor)",
            "tier3_desc": "Collaboration and fleet policy: shared configuration, team-wide policy, role separation across environments, and aggregate reporting.",
            "tier3_f1": "100% Open source (MIT License)",
            "tier3_f2": "Team-wide policy & role separation",
            "tier3_f3": "Fleet-level dashboards, cost & usage visibility",
            "tier3_cta": "Sponsor on GitHub →",
            "tier4_badge": "Custom B2B",
            "tier4_name": "enterprise",
            "tier4_target": "Organizations with procurement, compliance, or SLA needs",
            "tier4_desc": "Deliberately not a self-serve product. Negotiated contract with compliance guarantees, named support contacts, immutable audit logging, and private registry support.",
            "tier4_f1": "100% Open source core (MIT License)",
            "tier4_f2": "Immutable audit logs & data retention enforcement",
            "tier4_f3": "Defined availability SLA & named support contact",
            "tier4_cta": "Inquire for Enterprise B2B →",
            "sponsor_box_title": "Sponsoring the Krewire Collective",
            "sponsor_box_desc": "Sponsorship fuels independent infrastructure, code signing attestations, and sustained open-source development. Choose your preferred channel to support:",
            "sponsor_gh_btn": "Sponsor via GitHub Sponsors 💖",
            "sponsor_b2b_btn": "Contact for Enterprise B2B Inquiry →"
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
            "where_start": "5 Repositories Matrix",
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
            "sponsorship": "Open Core & Sponsorship",
            "boost": "AI Boost",
            "discussions": "Diskusi ↗",
            "github_org": "Organisasi GitHub"
        },
        "hero": {
            "eyebrow": "◈ KOLEKTIF SUMBER TERBUKA · LAHIR DI INDONESIA · UNTUK DUNIA",
            "title_html": "Berkontribusi Kode. Sponsori Sumber Terbuka.<br>Berdayakan Rekayasawan Indonesia.",
            "lead": "Krewire adalah gerakan sumber terbuka yang direkayasa di Indonesia untuk mengubah para pengembang dari konsumen perangkat lunak menjadi pencipta kelas dunia. Melalui pustaka Go modular berbasis open core, kontributor aktif mendapatkan lisensi komersial seumur hidup, sementara para sponsor mendukung infrastruktur mandiri dan para pengelola.",
            "cta_contribute": "Mulai Berkontribusi →",
            "cta_sponsor": "Sponsorship & Tingkatan 💖",
            "cta_issues": "Good First Issues ↗",
            "meta": "100% Inti Sumber Terbuka (MIT) · Gratis Selamanya · Jenjang Empat Tingkat · Sinergi AI Boost"
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
            "title": "5 Repositori & Tempat Memulai",
            "subtitle": "Cocokkan keahlian dan minat Anda dengan repositori yang tepat, siapkan lingkungan lokal, dan langsung tangani isu aktif.",
            "one_line_title": "Bootstrap Kontributor Satu Perintah",
            "one_line_badge": "Disarankan",
            "one_line_desc_html": "Secara otomatis mengklon seluruh repositori ekosistem, membuat workspace <code>go.work</code>, mengompilasi devtool <code>kiw</code>, dan memvalidasi kontrak kompatibilitas:",
            "copy_btn": "Salin",
            "copied_btn": "Tersalin!",
            "meta_prereq": "Prasyarat: Go 1.27.1+ dan Git",
            "meta_zero": "Tanpa konfigurasi manual yang rumit",
            "filter_label": "Filter Berdasarkan Jalur:",
            "filter_all": "Semua Repositori",
            "filter_core": "Monorepo Inti & Buku",
            "filter_web": "Portal & Situs Web",
            "filter_docs": "Spesifikasi & Arsitektur",
            "track_krewire": "Monorepo Inti & Pustaka",
            "track_mdbind": "Buku Statis & Dokumentasi",
            "track_krewire_com": "Situs Produk & Dokumen Resmi",
            "track_github_io": "Portal Komunitas & Sponsor",
            "track_internal": "ADR Arsitektur & Tata Kelola",
            "match_krewire": "Jika Anda menyukai: Pustaka Go modular (packages/*), CLI devtool (tools/kiw), runtime fullstack, antrean latar belakang, dan template agen AI (templates/boost).",
            "match_mdbind": "Jika Anda menyukai: Pembangun dokumentasi statis super cepat, transformasi AST Markdown, live reload instan, pengindeksan pencarian, dan penyorot sintaksis.",
            "match_krewire_com": "Jika Anda menyukai: Desain web presisi tinggi, dokumentasi interaktif, tata letak berbasis komponen, dan dogfooding DSL .kiw di produksi.",
            "match_github_io": "Jika Anda menyukai: Keterlibatan komunitas, platform sponsorship, pelokalan (i18n), komponen antarmuka aksesibel, dan portal orientasi kontributor.",
            "match_internal": "Jika Anda menyukai: Architectural Decision Records (ADR), spesifikasi ekosistem, peta jalan jangka panjang, dan tata kelola ekosistem.",
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
            "badge": "Model Open Core",
            "title": "Jenjang Empat Tingkat & Sponsorship",
            "subtitle": "Krewire beroperasi dengan model open core: setiap baris kode di krewire/krewire 100% sumber terbuka (MIT). Ekosistem dimulai dari tingkat free — gratis selamanya — dan bertumbuh secara progresif melalui pro, team, dan enterprise.",
            "tier1_badge": "Gratis Selamanya",
            "tier1_name": "free",
            "tier1_target": "Mahasiswa, UMKM, pehobi, evaluasi",
            "tier1_desc": "Jalur lengkap dari penulisan kebutuhan hingga produk berjalan. Proyek yang seluruhnya dibangun di atas modul free dapat dikompilasi, dijalankan, dan diserahkan tanpa lisensi atau telemetri.",
            "tier1_f1": "100% Sumber terbuka (Lisensi MIT)",
            "tier1_f2": "Mandiri, tanpa akun atau kunci lisensi",
            "tier1_f3": "Seluruh modul inti (kern, web, ui, tui, runtime, i18n, assets, cloud, testing, hub)",
            "tier1_cta": "Mulai Menggunakan (Gratis) →",
            "tier2_badge": "Tingkat Terencana",
            "tier2_name": "pro",
            "tier2_target": "Pengembang individu, pekerja lepas, produk mandiri",
            "tier2_desc": "Keandalan produksi mandiri: komitmen operasional tingkat produksi, keamanan tangguh, secrets vault berbasis KMS, dan hak sponsorship komersial.",
            "tier2_f1": "100% Sumber terbuka (Lisensi MIT)",
            "tier2_f2": "Keamanan tangguh & pipeline rilis bertanda tangan",
            "tier2_f3": "Secrets terkelola & rotasi kredensial berbasis KMS",
            "tier2_cta": "Sponsori di GitHub →",
            "tier3_badge": "Tingkat Terencana",
            "tier3_name": "team",
            "tier3_target": "Tim berkembang, agensi, proyek banyak kontributor",
            "tier3_desc": "Kebijakan kolaborasi dan armada: konfigurasi bersama, kebijakan seluruh tim, pemisahan peran lintas lingkungan, dan pelaporan agregat.",
            "tier3_f1": "100% Sumber terbuka (Lisensi MIT)",
            "tier3_f2": "Kebijakan tim & pemisahan peran lingkungan",
            "tier3_f3": "Dashboard armada, visibilitas biaya & penggunaan",
            "tier3_cta": "Sponsori di GitHub →",
            "tier4_badge": "Kemitraan Khusus B2B",
            "tier4_name": "enterprise",
            "tier4_target": "Organisasi dengan kebutuhan pengadaan, kepatuhan, atau SLA",
            "tier4_desc": "Bukan produk mandiri. Kontrak negosiasi langsung dengan jaminan kepatuhan, kontak dukungan khusus, log audit tak dapat diubah, dan registry privat.",
            "tier4_f1": "100% Inti sumber terbuka (Lisensi MIT)",
            "tier4_f2": "Log audit tak dapat diubah & penegakan retensi data",
            "tier4_f3": "Komitmen ketersediaan SLA & kontak dukungan terdedikasi",
            "tier4_cta": "Pertanyaan Kemitraan Enterprise →",
            "sponsor_box_title": "Sponsori Kolektif Krewire",
            "sponsor_box_desc": "Dukungan sponsorship menopang infrastruktur mandiri, atestasi penandatanganan kode, dan pengembangan sumber terbuka yang berkelanjutan. Pilih saluran dukungan Anda:",
            "sponsor_gh_btn": "Sponsori melalui GitHub Sponsors 💖",
            "sponsor_b2b_btn": "Kontak untuk Kemitraan Enterprise B2B →"
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
            "where_start": "Matriks 5 Repositori",
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

  function initI18n() {
    