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
      "badge": "v0.1.0 GA",
      "releases": "v0.1.0 Highlights",
      "features": "What's New",
      "workloads": "8 Workloads",
      "quickstart": "Quickstart",
      "repositories": "Repositories",
      "roadmap": "Roadmap",
      "standards": "Standards",
      "guild": "AI Boost",
      "perks": "Perks & Access",
      "releases_gh": "Releases \u2197",
      "github": "GitHub"
    },
    "hero": {
      "eyebrow": "\u25c8 ECOSYSTEM VERSION RELEASE \u00b7 v0.1.0 GENERAL AVAILABILITY",
      "title_html": "Krewire v0.1.0 is Here.<br>The Modular Go Ecosystem for 8 Workloads.",
      "lead": "The official release launchpad for the Krewire open-source ecosystem. A unified, modular Go foundation engineered with single monorepo architecture, one declarative config (krewire.yaml), and one developer CLI (kiw) \u2014 crafted in Indonesia for software engineers and autonomous AI agents worldwide.",
      "cta_release": "Explore v0.1.0 Highlights \u2192",
      "cta_quickstart": "Install CLI (kiw)",
      "cta_releases_gh": "GitHub Releases \u2197",
      "meta": "Go 1.27.1+ \u00b7 Single Monorepo \u00b7 8 Unified Workloads \u00b7 Spec-Driven Testing"
    },
    "trust": {
      "label": "v0.1.0 Release Baseline",
      "version_html": "<b>v0.1.0</b> Stable GA",
      "repos_html": "<b>5</b> Official Repositories",
      "workloads_html": "<b>8</b> Unified Workloads",
      "native_html": "<b>100%</b> Native Go",
      "cost": "Near-Zero Cloud Cost"
    },
    "releases": {
      "badge": "Ecosystem Release",
      "title": "Krewire Ecosystem v0.1.0 Launch",
      "subtitle": "The foundational milestone release delivering single monorepo architecture, the kiw devtool, strictly typed manifests, and 8 unified workload shapes.",
      "f1_title": "Single Monorepo Architecture",
      "f1_desc": "Consolidated under github.com/krewire/krewire. Eliminates cross-module dependency fragmentation, guarantees atomic Git commits, and powers seamless Go workspaces (go.work).",
      "f2_title": "Unified 'kiw' Devtool CLI",
      "f2_desc": "A single binary driving the software lifecycle: kiw new, kiw dev, kiw build, kiw serve, kiw worker, kiw deploy, and kiw boost.",
      "f3_title": "One Config: krewire.yaml",
      "f3_desc": "Strictly typed, declarative project manifests eliminating arbitrary configuration drift across all 8 supported workloads.",
      "f4_title": "Modular Domain Libraries",
      "f4_desc": "Single-purpose packages under packages/* (kern, web, ui, cli, db, config, validation, fs, worker). Compose only what you need without inheriting a monolithic framework.",
      "f5_title": "AI Boost & Agent Triad Native",
      "f5_desc": "First-class integration for autonomous AI developer agents (templates/boost) with formal KWF-* specifications, automated audits, and regression tests.",
      "f6_title": "Independent Docs Engine (mdbind)",
      "f6_desc": "Standalone Markdown book & docs compiler powering the book kind with AST transformations, live reloads, and offline assets embedding."
    },
    "workloads": {
      "badge": "Unified Architecture",
      "title": "8 Workload Kinds Behind One Engine",
      "subtitle": "Krewire adapts to your project shape. An explicit project.kind in krewire.yaml determines the build, runtime, and deployment lifecycle.",
      "w_app_title": "app",
      "w_app_desc": "Fullstack web applications with reactive server rendering, context pipelines, and DI containers.",
      "w_cli_title": "cli",
      "w_cli_desc": "Ergonomic terminal tools, subcommands, and flags powered by the lightweight TUI library.",
      "w_site_title": "site",
      "w_site_desc": "High-speed static websites, marketing portals, and blogs with scoped CSS and the .kiw DSL.",
      "w_book_title": "book",
      "w_book_desc": "Technical documentation and digital books compiled with the standalone mdbind engine.",
      "w_worker_title": "worker",
      "w_worker_desc": "Background task processors, concurrent runners, async queues, and scheduled cron jobs.",
      "w_service_title": "service",
      "w_service_desc": "High-throughput microservices, headless daemons, and low-latency JSON/gRPC APIs.",
      "w_infra_title": "infra",
      "w_infra_desc": "Zero-downtime raw VM runners, SSH automation, automated TLS provisioning, and systemd manifests.",
      "w_runtime_title": "runtime",
      "w_runtime_desc": "Compile Go into WebAssembly with virtual DOM diffing, reactive interactive islands, and partial client hydration."
    },
    "quickstart": {
      "badge": "Quick Installation",
      "title": "Get Started in Seconds",
      "subtitle": "Install the kiw developer tool, scaffold an application, or bootstrap the entire 5-repository workspace.",
      "step1_title": "1. Install kiw CLI",
      "step1_desc": "Install the unified developer toolchain globally via Go:",
      "step2_title": "2. Scaffold a Project",
      "step2_desc": "Generate a fullstack application or any of the 8 workloads:",
      "step3_title": "3. Run Locally",
      "step3_desc": "Start hot-reloading dev server with instant feedback:"
    },
    "navigator": {
      "badge": "Codebase Matrix",
      "title": "5 Core Repositories & Where to Start",
      "subtitle": "Match your skills and background to the right repository, bootstrap your local environment, and dive straight into active issues.",
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
      "curve_gentle": "Gentle Onboarding",
      "curve_intermediate": "Intermediate",
      "curve_specialized": "Specialized",
      "curve_innovative": "Innovative",
      "track_krewire": "Core Monorepo & Libraries",
      "track_mdbind": "Static Books & Documentation",
      "track_krewire_com": "Official Product & Docs Site",
      "track_github_io": "Release Launchpad & Community",
      "track_internal": "Architecture ADRs & Governance",
      "pkg_label": "Key Packages & Paths:",
      "action_issues": "Good First Issues \u2192",
      "action_repo": "GitHub Repo \u2197",
      "match_krewire": "If you enjoy: Modular Go libraries (packages/*), CLI devtool (tools/kiw), fullstack runtimes, background queues, and AI agent templates (templates/boost).",
      "match_mdbind": "If you enjoy: Lightning-fast static documentation builders, Markdown AST transformations, instant live reload, search indexing, and syntax highlighters.",
      "match_krewire_com": "If you enjoy: High-fidelity web design, interactive documentation, component-driven layouts, and dogfooding the .kiw DSL in production.",
      "match_github_io": "If you enjoy: Community engagement, release showcases, localization (i18n), accessible UI components, and contributor onboarding portals.",
      "match_internal": "If you enjoy: Architectural Decision Records (ADRs), Spec-Driven Development (KWF-*), long-term roadmaps, and ecosystem governance."
    },
    "roadmap": {
      "badge": "Version Roadmap",
      "title": "Ecosystem Evolution & Release Ladder",
      "subtitle": "Our progressive open core release roadmap across the four-rung ladder: free \u2192 pro \u2192 team \u2192 enterprise.",
      "v1_badge": "Current GA Baseline",
      "v1_title": "v0.1.0 \u2014 Stable Baseline",
      "v1_desc": "Single monorepo, 8 workload kinds, unified kiw CLI, mdbind compiler, and Spec-Driven Testing contracts.",
      "v2_badge": "Next Milestone",
      "v2_title": "v0.2.0 \u2014 Enterprise Modules",
      "v2_desc": "Advanced worker distributed schedulers, enterprise RBAC/Auth wrappers, multi-cloud infra targets, and telemetry hooks.",
      "v3_badge": "Future Horizon",
      "v3_title": "v0.3.0 \u2014 Autonomous Swarm Mesh",
      "v3_desc": "WASM client-side hydration, automatic canary deployments, and autonomous agent self-healing workflows."
    },
    "pillars": {
      "badge": "Philosophy",
      "title": "Engineered for Autonomy, Built for Longevity",
      "subtitle": "Krewire is not just another web framework. It is an open architectural collective solving software fragmentation, ballooning cloud costs, and developer fatigue.",
      "p1_title": "Autonomous by Design",
      "p1_desc": "Built from ground up to support self-healing, self-building pipelines, and native orchestration by autonomous AI agents (Boost).",
      "p2_title": "Spec-Driven Development (SDD)",
      "p2_desc": "Zero hand-waving. Every architectural boundary begins with formal specifications (KWF-*) and clear contract interfaces before implementation.",
      "p3_title": "Near-Zero Cloud Cost",
      "p3_desc": "Radical resource efficiency. Go standard-library minimalism designed to operate smoothly on $5 VPS nodes up to hyperscale infrastructure.",
      "p4_title": "Human-AI Synergy",
      "p4_desc": "Specialized AI agents (Boost) act as first-class team members \u2014 auditing security, catching regressions, and helping contributors iterate faster."
    },
    "benefits": {
      "badge": "Contributor Privilege",
      "title": "Lifetime Access to Krewire's Paid Ecosystem",
      "subtitle": "Genuine appreciation for true builders. By joining and actively contributing to the Krewire open source collective, you earn lifetime access to our upcoming commercial sub-products and premium ecosystem tools.",
      "b1_badge": "Core Privilege",
      "b1_title": "Commercial Sub-Products Lifetime Access",
      "b1_desc": "Receive free lifetime licenses for upcoming commercial Krewire products \u2014 including managed cloud orchestration tools, enterprise modules, and premium services.",
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
      "s3_btn": "View Good First Issues \u2192",
      "s4_title": "Implement & Verify Locally",
      "s4_desc": "Write clean code and corresponding tests. Verify that all 3 Quality Gates pass with zero failures:",
      "s5_title": "Submit Pull Request & Collaborate",
      "s5_desc": "Open a Pull Request with Conventional Commits. The maintainers and AI Boost will review, provide fast feedback, and guide you to merge."
    },
    "guild": {
      "badge": "Human + AI Synergy",
      "title": "Collaborating with AI Boost",
      "lead": "Krewire pioneers the collaboration between human maintainers and autonomous AI agents. Our AI Boost framework operates with strict verification standards:",
      "item1_html": "<b>Automated Architecture Audits:</b> AI agents check PRs against <code>KWF-*</code> specifications.",
      "item2_html": "<b>Continuous Regression Hunting:</b> Agents synthesize edge cases and race condition checks.",
      "item3_html": "<b>Transparent Pair Programming:</b> AI agents explain architectural decisions openly in discussions and PR comments.",
      "item4_html": "<b>Human Governance:</b> Ultimate merging authority always remains in the hands of human collective maintainers.",
      "cta_repo": "Explore AI Boost in Krewire \u2192",
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
      "badge": "Release Launchpad",
      "title": "Ready to build on Krewire v0.1.0?",
      "lead": "Join an open-source collective delivering modular, fast, and sustainable Go software. Explore the source on GitHub or start a new project with kiw.",
      "github": "View GitHub Releases \u2192",
      "quickstart": "Read Documentation",
      "meta": "Proudly open source \u00b7 MIT Licensed \u00b7 Engineered with passion in Indonesia"
    },
    "footer": {
      "brand_title": "Krewire Release Launchpad",
      "desc_html": "Official Version Release Launchpad & Community Hub.<br>Engineering an autonomous, sustainable, and scalable Go ecosystem at near-zero cost.",
      "col_repos": "Repositories",
      "col_contrib": "Releases & Docs",
      "col_community": "Community",
      "perks": "Contributor Perks & Access",
      "where_start": "Codebase Matrix",
      "getting_started": "Quickstart (kiw)",
      "pathways": "Workload Matrix",
      "standards": "Quality Gates",
      "guild": "AI Boost Synergy",
      "kwf_specs": "KWF Specifications",
      "gh_org": "GitHub Organization",
      "discussions": "Community Discussions",
      "good_first": "Good First Issues",
      "coc": "Code of Conduct",
      "bottom_rights_html": "\u00a9 2026 Krewire Contributors \u2014 Built 100% with Krewire <code>site</code> workload (Dogfooding)."
    }
  },
  "id": {
    "nav": {
      "badge": "v0.1.0 GA",
      "releases": "Sorotan v0.1.0",
      "features": "Fitur Baru",
      "workloads": "8 Workload",
      "quickstart": "Panduan Cepat",
      "repositories": "Repositori",
      "roadmap": "Peta Jalan",
      "standards": "Standar Mutu",
      "guild": "AI Boost",
      "perks": "Hak & Akses",
      "releases_gh": "Rilis \u2197",
      "github": "GitHub"
    },
    "hero": {
      "eyebrow": "\u25c8 PELUNCURAN RILIS EKOSISTEM \u00b7 v0.1.0 GENERAL AVAILABILITY",
      "title_html": "Krewire v0.1.0 Resmi Hadir.<br>Ekosistem Modular Go untuk 8 Workload.",
      "lead": "Pusat peluncuran rilis resmi untuk ekosistem sumber terbuka Krewire. Fondasi modular Go terpadu dengan arsitektur monorepo tunggal, konfigurasi deklaratif (krewire.yaml), dan devtool CLI (kiw) \u2014 direkayasa di Indonesia untuk rekayasawan perangkat lunak dan agen AI otonom di seluruh dunia.",
      "cta_release": "Jelajahi Sorotan v0.1.0 \u2192",
      "cta_quickstart": "Pasang CLI (kiw)",
      "cta_releases_gh": "Rilis GitHub \u2197",
      "meta": "Go 1.27.1+ \u00b7 Monorepo Tunggal \u00b7 8 Workload Terpadu \u00b7 Pengujian Berbasis Spesifikasi"
    },
    "trust": {
      "label": "Baseline Rilis v0.1.0",
      "version_html": "<b>v0.1.0</b> Stable GA",
      "repos_html": "<b>5</b> Repositori Resmi",
      "workloads_html": "<b>8</b> Workload Terpadu",
      "native_html": "<b>100%</b> Go Asli",
      "cost": "Biaya Cloud Mendekati Nol"
    },
    "releases": {
      "badge": "Rilis Ekosistem",
      "title": "Peluncuran Ekosistem Krewire v0.1.0",
      "subtitle": "Rilis tonggak fondasi yang menghadirkan arsitektur monorepo tunggal, devtool kiw, manifes bertipe ketat, dan 8 bentuk workload terpadu.",
      "f1_title": "Arsitektur Monorepo Tunggal",
      "f1_desc": "Dikonsolidasikan dalam github.com/krewire/krewire. Menghilangkan fragmentasi dependensi lintas modul, menjamin commit Git atomik, dan mendukung Go workspaces (go.work) secara mulus.",
      "f2_title": "Devtool CLI Terpadu 'kiw'",
      "f2_desc": "Satu berkas biner tunggal yang mengendalikan seluruh siklus hidup: kiw new, kiw dev, kiw build, kiw serve, kiw worker, kiw deploy, dan kiw boost.",
      "f3_title": "Satu Konfigurasi: krewire.yaml",
      "f3_desc": "Manifes proyek deklaratif bertipe ketat yang mengeliminasi perbedaan konfigurasi di seluruh 8 workload yang didukung.",
      "f4_title": "Pustaka Domain Modular",
      "f4_desc": "Paket mandiri dalam packages/* (kern, web, ui, cli, db, config, validation, fs, worker). Gunakan hanya apa yang Anda butuhkan tanpa mewarisi beban framework monolitik.",
      "f5_title": "Dukungan Asli AI Boost & Triad Agen",
      "f5_desc": "Integrasi kelas satu untuk agen developer AI otonom (templates/boost) dengan spesifikasi formal KWF-*, audit arsitektur otomatis, dan pengujian regresi berkelanjutan.",
      "f6_title": "Mesin Dokumentasi Mandiri (mdbind)",
      "f6_desc": "Compiler buku Markdown dan portal dokumentasi mandiri yang menggerakkan workload book dengan transformasi AST, live reload, dan aset bawaan."
    },
    "workloads": {
      "badge": "Arsitektur Terpadu",
      "title": "8 Bentuk Workload dalam Satu Mesin",
      "subtitle": "Krewire beradaptasi dengan bentuk arsitektur proyek Anda. Deklarasi project.kind eksplisit dalam krewire.yaml menentukan pipeline kompilasi dan runtime.",
      "w_app_title": "app",
      "w_app_desc": "Aplikasi web fullstack dengan render server reaktif, pipeline konteks, dan wadah dependency injection.",
      "w_cli_title": "cli",
      "w_cli_desc": "Perkakas terminal ergonomis, sub-perintah, dan opsi flag berbasis pustaka TUI berbobot ringan.",
      "w_site_title": "site",
      "w_site_desc": "Situs web statis berkecepatan tinggi, portal peluncuran, dan blog dengan scoped CSS dan DSL .kiw.",
      "w_book_title": "book",
      "w_book_desc": "Dokumentasi teknis dan buku digital yang dikompilasi dengan mesin mdbind mandiri.",
      "w_worker_title": "worker",
      "w_worker_desc": "Pemroses tugas latar belakang, runner konkuren, antrean asinkron, dan tugas cron terjadwal.",
      "w_service_title": "service",
      "w_service_desc": "Layanan mikro berkinerja tinggi, daemon tanpa antarmuka, dan API JSON/gRPC latensi rendah.",
      "w_infra_title": "infra",
      "w_infra_desc": "Otomasi rilis tanpa downtime pada VM mentah, eksekutor SSH, penyediaan otomatis TLS, dan unit systemd.",
      "w_runtime_title": "runtime",
      "w_runtime_desc": "Kompilasi Go ke WebAssembly dengan diffing virtual DOM, reactive interactive islands, dan hidrasi klien parsial."
    },
    "quickstart": {
      "badge": "Instalasi Cepat",
      "title": "Mulai dalam Hitungan Detik",
      "subtitle": "Pasang perkakas developer kiw, inisialisasi aplikasi, atau bootstrap seluruh 5 repositori ekosistem.",
      "step1_title": "1. Pasang CLI kiw",
      "step1_desc": "Pasang toolchain developer terpadu secara global melalui Go:",
      "step2_title": "2. Inisialisasi Proyek",
      "step2_desc": "Hasilkan aplikasi fullstack atau bentuk workload apa pun dari 8 jenis yang tersedia:",
      "step3_title": "3. Jalankan Lokal",
      "step3_desc": "Mulai server pengembangan lokal dengan live feedback instan:"
    },
    "navigator": {
      "badge": "Matriks Basis Kode",
      "title": "5 Repositori Inti & Mulai Dari Mana",
      "subtitle": "Sesuaikan keahlian dan latar belakang Anda dengan repositori yang tepat, pasang lingkungan lokal, dan langsung mulai berkontribusi.",
      "one_line_title": "Bootstrap Kontributor Sekali Perintah",
      "one_line_badge": "Direkomendasikan",
      "one_line_desc_html": "Otomatis mengkloning seluruh repositori ekosistem, menyiapkan workspace <code>go.work</code>, mengompilasi devtool <code>kiw</code>, dan memvalidasi kontrak kompatibilitas:",
      "copy_btn": "Salin",
      "copied_btn": "Tersalin!",
      "meta_prereq": "Prasyarat: Go 1.27.1+ dan Git",
      "meta_zero": "Tanpa konfigurasi manual yang rumit",
      "filter_label": "Filter menurut Jalur:",
      "filter_all": "Semua Repositori",
      "filter_core": "Monorepo Inti & Buku",
      "filter_web": "Portal & Situs",
      "filter_docs": "Dokumentasi & Spesifikasi",
      "curve_gentle": "Onboarding Ramah",
      "curve_intermediate": "Menengah",
      "curve_specialized": "Spesialis",
      "curve_innovative": "Inovatif",
      "track_krewire": "Monorepo Inti & Pustaka Modular",
      "track_mdbind": "Dokumentasi & Buku Statis",
      "track_krewire_com": "Situs Produk & Portal Dokumentasi Resmi",
      "track_github_io": "Pusat Rilis & Komunitas",
      "track_internal": "ADR Arsitektur & Tata Kelola",
      "pkg_label": "Paket & Jalur Kunci:",
      "action_issues": "Isu Pertama Mudah \u2192",
      "action_repo": "Repositori GitHub \u2197",
      "match_krewire": "Jika Anda menyukai: Pustaka modular Go (packages/*), devtool CLI (tools/kiw), runtime fullstack, antrean worker, dan template agen AI (templates/boost).",
      "match_mdbind": "Jika Anda menyukai: Pembangun dokumentasi statis kilat, transformasi AST Markdown, live reload instan, pengindeks pencarian, dan syntax highlighter.",
      "match_krewire_com": "Jika Anda menyukai: Desain web presisi tinggi, dokumentasi interaktif, tata letak berbasis komponen, dan dogfooding DSL .kiw di produksi.",
      "match_github_io": "Jika Anda menyukai: Interaksi komunitas, showcase peluncuran rilis, lokalisasi (i18n), komponen UI aksesibel, dan portal orientasi kontributor.",
      "match_internal": "Jika Anda menyukai: Architectural Decision Records (ADR), Pengembangan Berbasis Spesifikasi (KWF-*), peta jalan jangka panjang, dan tata kelola ekosistem."
    },
    "roadmap": {
      "badge": "Peta Jalan Versi",
      "title": "Evolusi Ekosistem & Tangga Rilis",
      "subtitle": "Peta jalan rilis model open core berjenjang empat tingkatan: free \u2192 pro \u2192 team \u2192 enterprise.",
      "v1_badge": "Baseline GA Aktif",
      "v1_title": "v0.1.0 \u2014 Fondasi Stabil",
      "v1_desc": "Monorepo tunggal, 8 jenis workload, CLI kiw terpadu, compiler mdbind, dan kontrak pengujian berbasis spesifikasi (SDD).",
      "v2_badge": "Tonggak Berikutnya",
      "v2_title": "v0.2.0 \u2014 Modul Enterprise",
      "v2_desc": "Penjadwal worker terdistribusi tingkat lanjut, abstraksi Auth/RBAC korporat, target multi-cloud infra, dan integrasi telemetri.",
      "v3_badge": "Horison Masa Depan",
      "v3_title": "v0.3.0 \u2014 Mesh Kawanan Otonom",
      "v3_desc": "Hidrasi sisi klien dengan WASM, deployment canary otomatis, dan orkestrasi perbaikan mandiri agen AI."
    },
    "pillars": {
      "badge": "Filosofi",
      "title": "Direkayasa untuk Otonomi, Dibangun untuk Keberlanjutan",
      "subtitle": "Krewire bukan sekadar framework web biasa. Ini adalah kolektif arsitektur terbuka yang memecahkan fragmentasi perangkat lunak, ledakan biaya cloud, dan kelelahan developer.",
      "p1_title": "Otonom Sejak Fondasi",
      "p1_desc": "Dibangun dari dasar untuk mendukung perbaikan mandiri, pipeline self-building, dan orkestrasi bawaan oleh agen AI otonom (Boost).",
      "p2_title": "Pengembangan Berbasis Spesifikasi (SDD)",
      "p2_desc": "Tanpa asumsi sepihak. Setiap batas arsitektur diawali spesifikasi formal (KWF-*) dan kontrak antarmuka yang presisi sebelum implementasi.",
      "p3_title": "Biaya Cloud Mendekati Nol",
      "p3_desc": "Efisiensi sumber daya radikal. Minimalisme pustaka standar Go yang dirancang beroperasi mulus di VPS $5 hingga infrastruktur skala besar.",
      "p4_title": "Sinergi Manusia & AI",
      "p4_desc": "Agen AI terspesialisasi (Boost) berperan sebagai anggota tim kelas satu \u2014 mengaudit keamanan, mencegah regresi, dan membantu kontributor bekerja lebih cepat."
    },
    "benefits": {
      "badge": "Hak Istimewa Kontributor",
      "title": "Akses Seumur Hidup ke Ekosistem Berbayar Krewire",
      "subtitle": "Apresiasi tulus bagi para perintis sejati. Dengan bergabung dan berkontribusi aktif dalam kolektif sumber terbuka Krewire, Anda mendapatkan akses seumur hidup ke sub-produk komersial dan perkakas premium kami.",
      "b1_badge": "Hak Istimewa Utama",
      "b1_title": "Akses Seumur Hidup Sub-Produk Komersial",
      "b1_desc": "Dapatkan lisensi seumur hidup gratis untuk produk komersial Krewire mendatang \u2014 termasuk perkakas orkestrasi cloud terkelola, modul enterprise, dan layanan premium.",
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
      "s3_btn": "Lihat Isu Pertama Mudah \u2192",
      "s4_title": "Implementasikan & Uji Lokal",
      "s4_desc": "Tulis kode yang rapi serta pengujian terkait. Pastikan seluruh 3 Quality Gate lolos tanpa kegagalan:",
      "s5_title": "Kirimkan Pull Request & Berkolaborasi",
      "s5_desc": "Buka Pull Request dengan Conventional Commits. Tim maintainer dan AI Boost akan meninjau, memberi umpan balik cepat, dan memandu penggabungan kode."
    },
    "guild": {
      "badge": "Sinergi Manusia + AI",
      "title": "Berkolaborasi dengan AI Boost",
      "lead": "Krewire mempelopori kolaborasi antara maintainer manusia dan agen AI otonom. Kerangka kerja AI Boost kami beroperasi dengan standar verifikasi ketat:",
      "item1_html": "<b>Audit Arsitektur Otomatis:</b> Agen AI memeriksa PR terhadap spesifikasi <code>KWF-*</code>.",
      "item2_html": "<b>Pencegahan Regresi Berkelanjutan:</b> Agen menyintesis skenario kasus batas (edge case) dan deteksi race condition.",
      "item3_html": "<b>Pair Programming Transparan:</b> Agen AI menjelaskan alasan arsitektural secara terbuka di diskusi dan komentar PR.",
      "item4_html": "<b>Kedaulatan Manusia:</b> Otoritas penggabungan akhir selalu berada di tangan para maintainer manusia.",
      "cta_repo": "Jelajahi AI Boost di Krewire \u2192",
      "cta_disc": "Gabung Diskusi Komunitas",
      "triad_title": "Triad Agen AI Boost",
      "planner_title": "Kebutuhan & SDD",
      "planner_desc": "Menerjemahkan ide fitur menjadi spesifikasi formal dan cetak biru arsitektur.",
      "builder_title": "Implementasi & Refactoring",
      "builder_desc": "Menghasilkan implementasi kode Go yang bersih dan sesuai pola idiomatik.",
      "auditor_title": "Verifikasi & Quality Gate",
      "auditor_desc": "Memvalidasi aspek konkurensi, nol data race, dan tolak ukur performa."
    },
    "cta": {
      "badge": "Launchpad Rilis",
      "title": "Siap Membangun dengan Krewire v0.1.0?",
      "lead": "Bergabunglah dengan komunitas sumber terbuka yang menghadirkan perangkat lunak Go yang modular, cepat, dan berkelanjutan. Jelajahi kode sumber di GitHub atau buat proyek baru dengan kiw.",
      "github": "Lihat Rilis GitHub \u2192",
      "quickstart": "Baca Dokumentasi Lengkap",
      "meta": "Bangga bersumber terbuka \u00b7 Lisensi MIT \u00b7 Direkayasa dengan dedikasi di Indonesia"
    },
    "footer": {
      "brand_title": "Krewire Release Launchpad",
      "desc_html": "Pusat Peluncuran Rilis Resmi & Komunitas Krewire.<br>Merancang ekosistem Go yang otonom, berkelanjutan, dan terukur dengan biaya mendekati nol.",
      "col_repos": "Repositori",
      "col_contrib": "Rilis & Dok",
      "col_community": "Komunitas",
      "perks": "Hak Istimewa & Akses Kontributor",
      "where_start": "Matriks Basis Kode",
      "getting_started": "Panduan Cepat (kiw)",
      "pathways": "Matriks Workload",
      "standards": "Standar Mutu (3 Gerbang)",
      "guild": "Sinergi AI Boost",
      "kwf_specs": "Spesifikasi KWF",
      "gh_org": "Organisasi GitHub",
      "discussions": "Diskusi Komunitas",
      "good_first": "Isu Pertama Mudah",
      "coc": "Kode Etik",
      "bottom_rights_html": "\u00a9 2026 Kontributor Krewire \u2014 Dibangun 100% dengan workload <code>site</code> Krewire (Dogfooding)."
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
