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
          var lang = (window.krewireI18n && window.krewireI18n.getLocale()) || 'en';
          var copiedMsg = (translations[lang] && translations[lang].navigator && translations[lang].navigator.copied_btn) || 'Copied!';
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
      "badge": "Contributors",
      "perks": "Perks & Access",
      "start": "Where to Start",
      "repositories": "Repositories",
      "pathways": "Pathways",
      "standards": "Standards",
      "guild": "AI Guild",
      "github": "GitHub"
    },
    "hero": {
      "eyebrow": "◈ OPEN SOURCE COLLECTIVE · AUTONOMOUS GO ECOSYSTEM",
      "title_html": "Build the Future of Go.<br>Together, Autonomously.",
      "lead": "The home for contributors, architects, and AI agent guilds engineering an autonomous, sustainable digital ecosystem in Go. From unified workloads and zero-cost IaC to AI agent orchestration — engineered in Indonesia for engineers worldwide.",
      "cta_start": "Start Contributing →",
      "cta_repos": "Explore Repositories",
      "meta": "Go 1.22+ · Spec-Driven Development (KWF) · Strict Quality Gates · Human & AI Synergy"
    },
    "trust": {
      "label": "Collective Ecosystem",
      "repos_html": "<b>7</b> Active Repositories",
      "workloads_html": "<b>8</b> Unified Workloads",
      "native_html": "<b>100%</b> Native Go",
      "gates_html": "<b>3</b> Strict Quality Gates",
      "cost": "Near-Zero Cloud Cost"
    },
    "pillars": {
      "badge": "Philosophy",
      "title": "Engineered for Autonomy, Built for Longevity",
      "subtitle": "Krewire is not just another web framework. It is an open architectural collective solving software fragmentation, ballooning cloud costs, and developer fatigue.",
      "p1_title": "Autonomous by Design",
      "p1_desc": "Built from ground up to support self-healing, self-building pipelines, and native orchestration by autonomous AI agents (Guild).",
      "p2_title": "Spec-Driven Development (SDD)",
      "p2_desc": "Zero hand-waving. Every architectural boundary begins with formal specifications (KWF-*) and clear contract interfaces before implementation.",
      "p3_title": "Near-Zero Cloud Cost",
      "p3_desc": "Radical resource efficiency. Go standard-library minimalism designed to operate smoothly on $5 VPS nodes up to hyperscale infrastructure.",
      "p4_title": "Human-AI Synergy",
      "p4_desc": "Specialized AI agent guilds act as first-class team members — auditing security, catching regressions, and helping contributors iterate faster."
    },
    "benefits": {
      "badge": "Contributor Privilege",
      "title": "Lifetime Access to Krewire's Paid Ecosystem",
      "subtitle": "Genuine appreciation for true builders. By joining and actively contributing to the Krewire open source collective, you earn lifetime access to our upcoming commercial sub-products and premium ecosystem tools.",
      "b1_badge": "Core Privilege",
      "b1_title": "Commercial Sub-Products Lifetime Access",
      "b1_desc": "Receive free lifetime licenses for upcoming commercial Krewire products — including managed cloud orchestration tools, enterprise modules, and premium services.",
      "b1_i1": "Free lifetime access to all paid Krewire commercial sub-products",
      "b1_i2": "Priority early-access releases and exclusive roadmap previews",
      "b1_i3": "Direct private collaboration channels with core maintainers",
      "b2_badge": "Strict Requirement",
      "b2_title": "Active Contributions Required",
      "b2_desc": "This privilege is a two-way commitment. Your access remains active as long as you regularly contribute and help nurture the ecosystem's growth.",
      "b2_i1": "Submit PRs for new features, bugfixes, or kernel optimizations",
      "b2_i2": "Review open PRs and stress-test high-concurrency scenarios",
      "b2_i3": "Author KWF architecture specifications or comprehensive docs",
      "b3_badge": "Revocation Policy",
      "b3_title": "Revocable if Inactive or Dormant",
      "b3_desc": "To protect community fairness and true meritocracy, commercial access licenses may be revoked at any time if a contributor becomes inactive or dormant over an extended period.",
      "b3_i1": "Contributor activity and commits are periodically audited",
      "b3_i2": "Prolonged inactivity or dormancy leads to license deactivation",
      "b3_i3": "Access privileges can be promptly reinstated upon resumed contribution",
      "policy_title": "Krewire Meritocracy Policy:",
      "policy_text": "We believe those who lay the foundation should share in its fruits. Commercial access is free for all active contributors, provided ongoing dedication to the collective is consistently maintained."
    },
    "navigator": {
      "badge": "Codebase Matrix & Navigator",
      "title": "Core Repositories & Where to Start",
      "subtitle": "Match your skills and background to the right codebase, bootstrap your local environment in 30 seconds, and dive straight into active issues.",
      "one_line_title": "One-Command Contributor Bootstrap",
      "one_line_badge": "Recommended",
      "one_line_desc_html": "Automatically clones all ecosystem repositories, creates your <code>go.work</code> workspace, builds the <code>kiw</code> devtool, and validates compatibility contracts:",
      "copy_btn": "Copy",
      "copied_btn": "Copied!",
      "meta_prereq": "Prerequisites: Go 1.22+ and Git",
      "meta_zero": "Zero manual configuration required",
      "filter_label": "Filter by Track:",
      "filter_all": "All Tracks",
      "filter_core": "Go Core & Libs",
      "filter_web": "Web & Runtime",
      "filter_devops": "DevOps & Infra",
      "filter_dx": "CLI & Tooling",
      "filter_ai": "AI Guild",
      "curve_gentle": "Gentle Onboarding",
      "curve_intermediate": "Intermediate",
      "curve_specialized": "Specialized",
      "curve_innovative": "Innovative",
      "track_framework": "Web Engine & Fullstack",
      "track_libs": "Go Core & Primitives",
      "track_kiw": "CLI & Developer Experience",
      "track_hub": "Plugins & Integrations",
      "track_ship": "Deployment & Cloud Infra",
      "track_guild": "AI Guild & Agent Triads",
      "track_mdbind": "Static Books & Documentation",
      "pkg_label": "Key Packages:",
      "action_issues": "Good First Issues →",
      "action_repo": "GitHub Repo ↗",
      "match_framework": "If you enjoy: High-performance HTTP routers, context pipelines, reactive SSR/VDOM, static-site compilers, background worker queues, and typed DI containers.",
      "match_libs": "If you enjoy: Pure Go standard library, domain modeling, zero-dependency validation, crypto/security, and rock-solid memory/virtual filesystems.",
      "match_kiw": "If you enjoy: Fast terminal feedback, delightful CLI ergonomics, code scaffolding, file watchers, release automations, and workspace commands.",
      "match_hub": "If you enjoy: Tailwind CSS integrations, package resolver chains (npm & Go modules), and building third-party developer tool extensions.",
      "match_ship": "If you enjoy: Zero-downtime releases, SSH runners, containerless raw VM automation, automated TLS provisioning, and systemd service generation.",
      "match_guild": "If you enjoy: Autonomous agent swarms, prompt engineering, OpenCode skill definitions, verification subagents (auditor/reviewer), and Model Context Protocol (MCP).",
      "match_mdbind": "If you enjoy: Lightning-fast static documentation builders, Markdown AST transformations, instant live reload, search indexing, and syntax highlighters."
    },
    "pathways": {
      "badge": "Choose Your Track",
      "title": "Contribution Pathways",
      "subtitle": "Whether you are a Go systems programmer, an architect, a documentation writer, or an AI prompt engineer — there is a high-impact seat for you.",
      "p1_title": "Core Go Engineering",
      "p1_desc": "Work on the foundational engine: HTTP routing, concurrent runner coordination, worker queues, and memory allocations.",
      "p2_title": "Architecture & SDD",
      "p2_desc": "Draft Spec-Driven Development proposals (KWF-*), formalize module contracts, design clean interfaces, and review architectural integrity.",
      "p3_title": "AI Agent Engineering",
      "p3_desc": "Develop autonomous skills for the Guild, build MCP tools, and optimize subagent triads that autonomously test and refactor code.",
      "p4_title": "Developer Experience & CLI",
      "p4_desc": "Make kiw lightning fast and delightfully intuitive. Improve terminal UX, scaffolding generators, and developer productivity.",
      "p5_title": "Testing & Quality Assurance",
      "p5_desc": "Hunt race conditions, write fuzz tests, build chaos experiments for concurrent workers, and ensure 100% test reliability.",
      "p6_title": "Technical Writing & Docs",
      "p6_desc": "Create architectural deep dives, tutorials, quickstart guides, and help translate Krewire documentation for global and Indonesian engineers."
    },
    "standards": {
      "badge": "Quality Assurance",
      "title": "The Krewire Way: 3 Quality Gates",
      "subtitle": "To keep the codebase reliable, predictable, and production-ready, every pull request passes through three automated gates.",
      "gate1_title": "Gate 1: Format & Lint",
      "gate1_desc": "Zero lint errors and idiomatic Go formatting. Code must adhere strictly to Go standard conventions.",
      "gate1_req": "Required: Clean exit, 0 warnings",
      "gate2_title": "Gate 2: Race & Tests",
      "gate2_desc": "Every commit is verified with race condition detection and comprehensive unit & integration tests.",
      "gate2_req": "Required: 100% test pass, 0 data races",
      "gate3_title": "Gate 3: Spec & Commits",
      "gate3_desc": "Changes must link to a valid Spec or Issue, following Conventional Commits format.",
      "gate3_req": "Required: Semantic versioning compliance"
    },
    "onboarding": {
      "badge": "Getting Started",
      "title": "Start Contributing in 5 Steps",
      "subtitle": "From zero to your first merged pull request. Here is how to get your development environment running in minutes.",
      "s1_title": "Fork & Clone the Repositories",
      "s1_desc": "Fork any Krewire repository to your personal GitHub account, then clone it locally:",
      "s2_title": "Initialize Multi-Module Workspace",
      "s2_desc": "If you're working across multiple Krewire repos, sync your local Go workspace seamlessly:",
      "s3_title": "Pick an Open Issue",
      "s3_desc_html": "Browse our curated issues list tagged with <span class=\"tag-issue\">good-first-issue</span> or <span class=\"tag-issue\">help-wanted</span>. Comment on the issue to let the community know you're working on it.",
      "s3_btn": "View Good First Issues →",
      "s4_title": "Implement & Verify Locally",
      "s4_desc": "Write clean code and corresponding tests. Verify that all 3 Quality Gates pass with zero failures:",
      "s5_title": "Submit Pull Request & Collaborate",
      "s5_desc": "Open a Pull Request with Conventional Commits. The maintainers and the AI Guild will review, provide fast feedback, and guide you to merge."
    },
    "guild": {
      "badge": "Human + AI Synergy",
      "title": "Collaborating with the AI Guild",
      "lead": "Krewire pioneers the collaboration between human maintainers and autonomous AI agents. Our AI Guild operates with strict verification standards:",
      "item1_html": "<b>Automated Architecture Audits:</b> AI agents check PRs against <code>KWF-*</code> specifications.",
      "item2_html": "<b>Continuous Regression Hunting:</b> Agents synthesize edge cases and race condition checks.",
      "item3_html": "<b>Transparent Pair Programming:</b> AI agents explain architectural decisions openly in discussions and PR comments.",
      "item4_html": "<b>Human Governance:</b> Ultimate merging authority always remains in the hands of human collective maintainers.",
      "cta_repo": "Explore AI Guild Repo →",
      "cta_disc": "Join Discussions",
      "triad_title": "AI Guild Agent Triad",
      "planner_title": "Requirements & SDD",
      "planner_desc": "Translates feature ideas into formal specs and architectural blueprints.",
      "builder_title": "Implementation & Refactoring",
      "builder_desc": "Generates clean Go implementations adhering to idiomatic patterns.",
      "auditor_title": "Verification & Quality Gates",
      "auditor_desc": "Validates concurrency, zero data races, and performance benchmarks."
    },
    "cta": {
      "badge": "Join the Collective",
      "title": "Ready to shape the future of Go?",
      "lead": "Become part of an open source community building fast, sustainable, and autonomous Go software. Every contribution, idea, and PR makes a difference.",
      "github": "Join on GitHub →",
      "quickstart": "Read Quickstart",
      "meta": "Proudly open source · MIT Licensed · Engineered with passion in Indonesia"
    },
    "footer": {
      "brand_title": "Krewire Contributors",
      "desc_html": "Home of the Open Source Collective.<br>Crafting an autonomous, sustainable, and scalable Go ecosystem at near-zero cost.",
      "col_repos": "Repositories",
      "col_contrib": "Contribution",
      "col_community": "Community",
      "perks": "Contributor Perks & Access",
      "where_start": "Where to Start (Nav Map)",
      "getting_started": "Getting Started",
      "pathways": "Contribution Pathways",
      "standards": "The Krewire Way (Gates)",
      "guild": "AI Guild Collaboration",
      "kwf_specs": "KWF Specs",
      "gh_org": "GitHub Organization",
      "discussions": "Discussions",
      "good_first": "Good First Issues",
      "coc": "Code of Conduct",
      "bottom_rights_html": "© 2026 Krewire Contributors — Built 100% with Krewire <code>site</code> workload (Dogfooding)."
    }
  },
  "id": {
    "nav": {
      "badge": "Kontributor",
      "perks": "Hak & Akses",
      "start": "Mulai Dari Mana",
      "repositories": "Repositori",
      "pathways": "Jalur Kontribusi",
      "standards": "Standar Mutu",
      "guild": "AI Guild",
      "github": "GitHub"
    },
    "hero": {
      "eyebrow": "◈ KOLEKTIF SUMBER TERBUKA · EKOSISTEM GO OTONOM",
      "title_html": "Bangun Masa Depan Go.<br>Bersama, Secara Otonom.",
      "lead": "Rumah bagi kontributor, arsitek perangkat lunak, dan guild agen AI yang merekayasa ekosistem digital Go otonom dan berkelanjutan. Dari workload terpadu dan IaC hemat biaya hingga orkestrasi agen AI — direkayasa di Indonesia untuk engineer di seluruh dunia.",
      "cta_start": "Mulai Berkontribusi →",
      "cta_repos": "Jelajahi Repositori",
      "meta": "Go 1.22+ · Spec-Driven Development (KWF) · Quality Gate Ketat · Sinergi Manusia & AI"
    },
    "trust": {
      "label": "Ekosistem Kolektif",
      "repos_html": "<b>7</b> Repositori Aktif",
      "workloads_html": "<b>8</b> Workload Terpadu",
      "native_html": "<b>100%</b> Go Asli",
      "gates_html": "<b>3</b> Quality Gate Ketat",
      "cost": "Biaya Cloud Mendekati Nol"
    },
    "pillars": {
      "badge": "Filosofi",
      "title": "Direkayasa untuk Otonomi, Dibangun untuk Keberlanjutan",
      "subtitle": "Krewire bukan sekadar framework web biasa. Ini adalah kolektif arsitektur terbuka yang memecahkan fragmentasi perangkat lunak, ledakan biaya cloud, dan kelelahan developer.",
      "p1_title": "Otonom Sejak Fondasi",
      "p1_desc": "Dirancang dari nol untuk mendukung pipeline swa-pulih, kompilasi mandiri, dan orkestrasi asli oleh agen AI otonom (Guild).",
      "p2_title": "Pengembangan Berbasis Spesifikasi (SDD)",
      "p2_desc": "Tanpa asumsi sepihak. Setiap batas arsitektur diawali spesifikasi formal (KWF-*) dan kontrak antarmuka yang presisi sebelum implementasi.",
      "p3_title": "Biaya Cloud Mendekati Nol",
      "p3_desc": "Efisiensi sumber daya radikal. Minimalisme pustaka standar Go yang dirancang beroperasi mulus di VPS $5 hingga infrastruktur skala besar.",
      "p4_title": "Sinergi Manusia & AI",
      "p4_desc": "Guild agen AI spesialis bertindak sebagai rekan tim kelas satu — mengaudit keamanan, mencegah regresi, dan membantu kontributor beriterasi lebih cepat."
    },
    "benefits": {
      "badge": "Hak Istimewa Kontributor",
      "title": "Akses Seumur Hidup ke Ekosistem Berbayar Krewire",
      "subtitle": "Apresiasi tulus bagi para perintis sejati. Dengan bergabung dan berkontribusi aktif dalam kolektif sumber terbuka Krewire, Anda mendapatkan akses seumur hidup ke sub-produk komersial dan perkakas premium kami.",
      "b1_badge": "Hak Istimewa Utama",
      "b1_title": "Akses Seumur Hidup Sub-Produk Komersial",
      "b1_desc": "Dapatkan lisensi seumur hidup gratis untuk produk komersial Krewire mendatang — termasuk perkakas orkestrasi cloud terkelola, modul enterprise, dan layanan premium.",
      "b1_i1": "Akses gratis seumur hidup ke seluruh sub-produk komersial berbayar Krewire",
      "b1_i2": "Prioritas rilis awal dan tinjauan peta jalan pengembangan eksklusif",
      "b1_i3": "Kanal kolaborasi privat langsung bersama para maintainer inti",
      "b2_badge": "Syarat Wajib",
      "b2_title": "Wajib Berkontribusi Aktif",
      "b2_desc": "Hak istimewa ini merupakan komitmen dua arah. Akses Anda tetap aktif selama Anda rutin berkontribusi dan merawat pertumbuhan ekosistem.",
      "b2_i1": "Kirimkan PR fitur baru, perbaikan bug, atau optimasi kernel",
      "b2_i2": "Tinjau PR terbuka dan lakukan uji stres skenario konkurensi tinggi",
      "b2_i3": "Tulis spesifikasi arsitektur KWF atau dokumentasi komprehensif",
      "b3_badge": "Kebijakan Pencabutan",
      "b3_title": "Dapat Dicabut Jika Tidak Aktif / Dormant",
      "b3_desc": "Demi menjaga keadilan komunitas dan meritokrasi sejati, lisensi akses komersial dapat dicabut kapan saja apabila kontributor pasif dalam waktu lama.",
      "b3_i1": "Aktivitas dan commit kontributor diaudit secara berkala",
      "b3_i2": "Ketiadaan kontribusi yang berkepanjangan memicu penonaktifan lisensi",
      "b3_i3": "Hak akses dapat segera dipulihkan kembali saat kontribusi aktif berlanjut",
      "policy_title": "Prinsip Meritokrasi Krewire:",
      "policy_text": "Kami meyakini siapa pun yang membangun fondasi berhak menikmati hasilnya. Akses komersial gratis bagi seluruh kontributor aktif selama dedikasi nyata terus dipertahankan."
    },
    "navigator": {
      "badge": "Matriks Basis Kode & Navigator",
      "title": "Repositori Inti & Mulai Dari Mana",
      "subtitle": "Sesuaikan keahlian dan latar belakang Anda dengan basis kode yang tepat, pasang lingkungan lokal dalam 30 detik, dan langsung mulai berkontribusi.",
      "one_line_title": "Bootstrap Kontributor Sekali Perintah",
      "one_line_badge": "Direkomendasikan",
      "one_line_desc_html": "Otomatis mengkloning seluruh repositori ekosistem, menyiapkan workspace <code>go.work</code>, mengompilasi devtool <code>kiw</code>, dan memvalidasi kontrak kompatibilitas:",
      "copy_btn": "Salin",
      "copied_btn": "Tersalin!",
      "meta_prereq": "Prasyarat: Go 1.22+ dan Git",
      "meta_zero": "Tanpa konfigurasi manual yang rumit",
      "filter_label": "Filter menurut Jalur:",
      "filter_all": "Semua Jalur",
      "filter_core": "Go Core & Libs",
      "filter_web": "Web & Runtime",
      "filter_devops": "DevOps & Infra",
      "filter_dx": "CLI & Perkakas",
      "filter_ai": "AI Guild",
      "curve_gentle": "Onboarding Ramah",
      "curve_intermediate": "Menengah",
      "curve_specialized": "Spesialis",
      "curve_innovative": "Inovatif",
      "track_framework": "Mesin Web & Fullstack",
      "track_libs": "Go Core & Primitif",
      "track_kiw": "CLI & Pengalaman Developer",
      "track_hub": "Plugin & Integrasi",
      "track_ship": "Deployment & Infra Cloud",
      "track_guild": "AI Guild & Triad Agen",
      "track_mdbind": "Dokumentasi & Buku Statis",
      "pkg_label": "Paket Kunci:",
      "action_issues": "Isu Pertama Mudah →",
      "action_repo": "Repositori GitHub ↗",
      "match_framework": "Jika Anda menyukai: Router HTTP berkinerja tinggi, pipeline context, SSR/VDOM reaktif, compiler SSG, antrean worker, dan DI container berorientasi tipe.",
      "match_libs": "Jika Anda menyukai: Pustaka standar Go murni, pemodelan domain, validasi tanpa dependensi luar, kripto/keamanan, dan sistem berkas virtual yang kokoh.",
      "match_kiw": "Jika Anda menyukai: Respons terminal cepat, ergonomi CLI yang nyaman, generator kode, pemantau berkas otomatis, dan otomatisasi rilis.",
      "match_hub": "Jika Anda menyukai: Integrasi Tailwind CSS, rantai resolver paket (npm & modul Go), dan membangun ekstensi perkakas developer pihak ketiga.",
      "match_ship": "Jika Anda menyukai: Rilis tanpa downtime, runner SSH, otomasi VM tanpa kontainer, penyediaan otomatis TLS/SSL, dan pembuatan service systemd.",
      "match_guild": "Jika Anda menyukai: Kawanan agen otonom, prompt engineering, definisi skill OpenCode, subagen verifikasi (auditor/reviewer), dan Model Context Protocol (MCP).",
      "match_mdbind": "Jika Anda menyukai: Pembangun dokumentasi statis kilat, transformasi AST Markdown, live reload instan, pengindeks pencarian, dan syntax highlighter."
    },
    "pathways": {
      "badge": "Pilih Jalur Anda",
      "title": "Jalur Kontribusi",
      "subtitle": "Apakah Anda programmer sistem Go, arsitek perangkat lunak, penulis dokumentasi, atau perekayasa prompt AI — selalu ada peran berdampak tinggi untuk Anda.",
      "p1_title": "Rekayasa Inti Go",
      "p1_desc": "Kembangkan mesin fondasi: routing HTTP, koordinasi runner konkurensi, antrean worker, dan manajemen alokasi memori.",
      "p2_title": "Arsitektur & SDD",
      "p2_desc": "Susun proposal Spec-Driven Development (KWF-*), resmikan kontrak modul, rancang antarmuka bersih, dan tinjau integritas arsitektur.",
      "p3_title": "Rekayasa Agen AI",
      "p3_desc": "Kembangkan skill otonom untuk Guild, buat perkakas MCP, dan optimalkan triad subagen yang secara otonom menguji dan merefaktor kode.",
      "p4_title": "Pengalaman Developer & CLI",
      "p4_desc": "Jadikan kiw secepat kilat dan intuitif. Tingkatkan UX terminal, generator scaffolding, dan produktivitas developer.",
      "p5_title": "Pengujian & Jaminan Mutu",
      "p5_desc": "Cari kondisi balapan (race condition), tulis fuzz testing, rancang eksperimen chaos untuk worker konkuren, dan pastikan keandalan tes 100%.",
      "p6_title": "Penulisan Teknis & Dokumentasi",
      "p6_desc": "Tulis bedah arsitektur mendalam, tutorial, panduan cepat, dan bantu terjemahan dokumentasi Krewire bagi developer global dan Indonesia."
    },
    "standards": {
      "badge": "Jaminan Kualitas",
      "title": "The Krewire Way: 3 Quality Gate",
      "subtitle": "Demi menjaga basis kode tetap andal, terprediksi, dan siap produksi, setiap pull request wajib melewati tiga gerbang kendali otomatis.",
      "gate1_title": "Gerbang 1: Format & Lint",
      "gate1_desc": "Bebas error lint dan pemformatan Go yang idiomatik. Kode wajib mematuhi standar konvensi Go.",
      "gate1_req": "Wajib: Selesai bersih, 0 peringatan",
      "gate2_title": "Gerbang 2: Race & Pengujian",
      "gate2_desc": "Setiap commit diverifikasi dengan pendeteksi data race serta uji unit dan integrasi menyeluruh.",
      "gate2_req": "Wajib: 100% tes lolos, 0 data race",
      "gate3_title": "Gerbang 3: Spesifikasi & Commit",
      "gate3_desc": "Setiap perubahan wajib merujuk ke Spesifikasi atau Isu aktif, mengikuti format Conventional Commits.",
      "gate3_req": "Wajib: Kepatuhan versi semantik"
    },
    "onboarding": {
      "badge": "Langkah Awal",
      "title": "Mulai Berkontribusi dalam 5 Langkah",
      "subtitle": "Dari langkah awal hingga pull request pertama yang berhasil digabungkan. Berikut cara menyiapkan lingkungan lokal dalam hitungan menit.",
      "s1_title": "Fork & Kloning Repositori",
      "s1_desc": "Lakukan fork salah satu repositori Krewire ke akun GitHub Anda, lalu lakukan clone secara lokal:",
      "s2_title": "Inisialisasi Workspace Multi-Modul",
      "s2_desc": "Jika Anda bekerja di lintas repositori Krewire, sinkronkan workspace lokal Go Anda dengan mudah:",
      "s3_title": "Pilih Isu yang Tersedia",
      "s3_desc_html": "Jelajahi daftar isu pilihan kami yang bertanda <span class=\"tag-issue\">good-first-issue</span> atau <span class=\"tag-issue\">help-wanted</span>. Beri komentar pada isu untuk memberi tahu komunitas bahwa Anda sedang mengerjakannya.",
      "s3_btn": "Lihat Isu Pertama Mudah →",
      "s4_title": "Implementasikan & Uji Lokal",
      "s4_desc": "Tulis kode yang rapi serta pengujian terkait. Pastikan seluruh 3 Quality Gate lolos tanpa kegagalan:",
      "s5_title": "Kirimkan Pull Request & Berkolaborasi",
      "s5_desc": "Buka Pull Request dengan pesan Conventional Commits. Para maintainer dan AI Guild akan meninjau, memberikan masukan cepat, dan memandu hingga merge."
    },
    "guild": {
      "badge": "Sinergi Manusia + AI",
      "title": "Berkolaborasi dengan AI Guild",
      "lead": "Krewire mempelopori kolaborasi antara maintainer manusia dan agen AI otonom. AI Guild kami beroperasi dengan standar verifikasi ketat:",
      "item1_html": "<b>Audit Arsitektur Otomatis:</b> Agen AI memeriksa PR terhadap spesifikasi <code>KWF-*</code>.",
      "item2_html": "<b>Pencegahan Regresi Berkelanjutan:</b> Agen menyintesis skenario kasus batas (edge case) dan deteksi race condition.",
      "item3_html": "<b>Pair Programming Transparan:</b> Agen AI menjelaskan alasan arsitektural secara terbuka di diskusi dan komentar PR.",
      "item4_html": "<b>Kedaulatan Manusia:</b> Otoritas penggabungan akhir selalu berada di tangan para maintainer manusia.",
      "cta_repo": "Jelajahi Repositori AI Guild →",
      "cta_disc": "Gabung Diskusi Komunitas",
      "triad_title": "Triad Agen AI Guild",
      "planner_title": "Kebutuhan & SDD",
      "planner_desc": "Menerjemahkan ide fitur menjadi spesifikasi formal dan cetak biru arsitektur.",
      "builder_title": "Implementasi & Refactoring",
      "builder_desc": "Menghasilkan implementasi kode Go yang bersih dan sesuai pola idiomatik.",
      "auditor_title": "Verifikasi & Quality Gate",
      "auditor_desc": "Memvalidasi aspek konkurensi, nol data race, dan tolak ukur performa."
    },
    "cta": {
      "badge": "Gabung Kolektif",
      "title": "Siap membentuk masa depan Go?",
      "lead": "Jadilah bagian dari komunitas sumber terbuka yang membangun perangkat lunak Go yang cepat, berkelanjutan, dan otonom. Setiap kontribusi, gagasan, dan PR memberi dampak nyata.",
      "github": "Gabung di GitHub →",
      "quickstart": "Baca Panduan Cepat",
      "meta": "Bangga bersumber terbuka · Lisensi MIT · Direkayasa dengan dedikasi di Indonesia"
    },
    "footer": {
      "brand_title": "Kontributor Krewire",
      "desc_html": "Rumah bagi Kolektif Sumber Terbuka.<br>Merancang ekosistem Go yang otonom, berkelanjutan, dan terukur dengan biaya mendekati nol.",
      "col_repos": "Repositori",
      "col_contrib": "Kontribusi",
      "col_community": "Komunitas",
      "perks": "Hak Istimewa & Akses Kontributor",
      "where_start": "Mulai Dari Mana (Peta Navigasi)",
      "getting_started": "Langkah Memulai",
      "pathways": "Jalur Kontribusi",
      "standards": "Standar Mutu Krewire (Gerbang)",
      "guild": "Kolaborasi AI Guild",
      "kwf_specs": "Spesifikasi KWF",
      "gh_org": "Organisasi GitHub",
      "discussions": "Diskusi Komunitas",
      "good_first": "Isu Pertama Mudah",
      "coc": "Kode Etik",
      "bottom_rights_html": "© 2026 Kontributor Krewire — Dibangun 100% dengan workload <code>site</code> Krewire (Dogfooding)."
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
