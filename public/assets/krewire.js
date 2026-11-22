(function () {
'use strict';
try {
var stored = localStorage.getItem('krewire-theme') || 'auto';
var mode = stored === 'auto'
? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
: stored;
document.documentElement.dataset.theme = mode;
document.documentElement.classList.toggle('dark', mode === 'dark');
} catch (e) {}
window.krewireTheme = {
get: function () {
return document.documentElement.dataset.theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
},
set: function (mode) {
document.documentElement.dataset.theme = mode;
document.documentElement.classList.toggle('dark', mode === 'dark');
try {
localStorage.setItem('krewire-theme', mode);
} catch (e) {}
},
toggle: function () {
var cur = window.krewireTheme.get();
var nxt = cur === 'dark' ? 'light' : 'dark';
window.krewireTheme.set(nxt);
}
};
})();
function copyCmd(btn, text) {
  if (!btn) return;
  if (!text) {
    var term = btn.closest('.terminal');
    var code = term ? term.querySelector('.terminal-code, code') : null;
    text = (code ? code.innerText : '').trim();
  }
  if (!text) return;
  var orig = btn.innerText;
  function showCopied() {
    btn.innerText = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.innerText = orig;
      btn.classList.remove('copied');
    }, 2000);
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
window.copyTerminal = copyCmd;
(function () {
'use strict';
function getDrawerElements(id) {
if (!id) return { drawer: null, backdrop: null, togglers: [] };
var drawer = document.getElementById(id) || document.querySelector('.' + id) || document.querySelector('[data-drawer="' + id + '"]');
var backdrop = document.getElementById(id + '-backdrop') || document.querySelector('[data-drawer-backdrop="' + id + '"]') || document.querySelector('.drawer-backdrop');
var togglers = document.querySelectorAll('[data-drawer-toggle="' + id + '"], [aria-controls="' + id + '"], #' + id + '-toggle');
return { drawer: drawer, backdrop: backdrop, togglers: togglers };
}
var drawerCtrl = {
open: function (id) {
var els = getDrawerElements(id);
if (!els.drawer) return;
els.drawer.classList.add('drawer-open');
els.drawer.classList.add('is-open');
els.drawer.setAttribute('aria-hidden', 'false');
if (els.backdrop) els.backdrop.classList.add('backdrop-open');
els.togglers.forEach(function (btn) {
btn.setAttribute('aria-expanded', 'true');
btn.classList.add('is-active');
});
document.body.classList.add('drawer-active');
},
close: function (id) {
var els = getDrawerElements(id);
if (!els.drawer) return;
els.drawer.classList.remove('drawer-open');
els.drawer.classList.remove('is-open');
els.drawer.setAttribute('aria-hidden', 'true');
if (els.backdrop) els.backdrop.classList.remove('backdrop-open');
els.togglers.forEach(function (btn) {
btn.setAttribute('aria-expanded', 'false');
btn.classList.remove('is-active');
});
document.body.classList.remove('drawer-active');
},
toggle: function (id) {
var els = getDrawerElements(id);
if (!els.drawer) return;
if (els.drawer.classList.contains('drawer-open') || els.drawer.classList.contains('is-open')) {
this.close(id);
} else {
this.open(id);
}
}
};
window.uiDrawer = drawerCtrl;
window.uiToggleDrawer = function (btn, id) {
if (!id && btn) {
id = btn.getAttribute('data-drawer-toggle') || btn.getAttribute('aria-controls');
}
if (id) {
window.uiDrawer.toggle(id);
}
};
window.uiCloseDrawer = function (id) {
if (id) {
window.uiDrawer.close(id);
}
};
function bindDrawerEvents() {
document.addEventListener('click', function (e) {
var toggleBtn = e.target.closest('[data-drawer-toggle], .nav-toggler, [aria-controls]');
if (toggleBtn) {
var id = toggleBtn.getAttribute('data-drawer-toggle') || toggleBtn.getAttribute('aria-controls');
if (id && (document.getElementById(id) || document.querySelector('.' + id))) {
e.preventDefault();
window.uiDrawer.toggle(id);
return;
}
}
var closeBtn = e.target.closest('[data-drawer-close]');
if (closeBtn) {
var id = closeBtn.getAttribute('data-drawer-close');
if (id) {
e.preventDefault();
window.uiDrawer.close(id);
return;
}
}
var backdrop = e.target.closest('[data-drawer-backdrop]');
if (backdrop) {
var id = backdrop.getAttribute('data-drawer-backdrop');
if (id) {
e.preventDefault();
window.uiDrawer.close(id);
return;
}
}
var drawerLink = e.target.closest('.drawer a');
if (drawerLink) {
var drawer = drawerLink.closest('.drawer');
if (drawer && drawer.id) {
window.uiDrawer.close(drawer.id);
}
}
});
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape') {
document.querySelectorAll('.drawer.drawer-open').forEach(function (d) {
window.uiDrawer.close(d.id);
});
}
});
if (!window._krewireThemeBound) {
window._krewireThemeBound = true;
document.addEventListener('click', function (e) {
var btn = e.target && e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
if (btn && window.krewireTheme && window.krewireTheme.toggle) {
e.preventDefault();
window.krewireTheme.toggle();
}
});
}
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', bindDrawerEvents);
} else {
bindDrawerEvents();
}
})();
(function () {
'use strict';
var translations = {
  "en": {
    "nav": {
      "badge": "Community",
      "privileges": "Why Contribute",
      "pathways": "Pathways & Repos",
      "guide": "Contributor Guide",
      "standards": "Quality Gates",
      "sponsorship": "Support",
      "boost": "AI Boost",
      "discussions": "Discussions ↗",
      "github_org": "GitHub Organization",
      "start": "Start Here"
    },
    "hero": {
      "eyebrow": "◈ OPEN-SOURCE COLLECTIVE · BORN IN INDONESIA · FOR THE WORLD",
      "title_html": "Build with Krewire. Contribute Code.<br>Empower Indonesian Engineers.",
      "lead": "Krewire is an open-source movement engineered in Indonesia to turn builders from software consumers into world-class creators. Its modular Go libraries are MIT-licensed and free to use, and community support helps sustain long-term maintenance.",
      "cta_contribute": "Start Contributing",
      "cta_sponsor": "Support Krewire",
      "meta": "100% Open Source Core (MIT) · Community-Owned · Independent Infrastructure · AI-Assisted Synergy",
      "cta_start": "Get Started →"
    },
    "trust": {
      "label": "Community & Stewardship Baseline",
      "indonesia_html": "<b>Indonesian</b> Collective",
      "meritocracy_html": "<b>Open</b> Contribution",
      "opencore_html": "<b>Open Core</b> Sustainability",
      "free_html": "<b>100%</b> Free Core (MIT)",
      "cost": "Near-Zero Cloud Cost"
    },
    "privileges": {
      "badge": "Why Contribute",
      "title": "Why Contribute to Krewire",
      "subtitle": "Contributions land in an MIT-licensed open-source core that anyone can use. There is no paid perk or license program attached to contributing today.",
      "p1_badge": "Open Core",
      "p1_title": "Your Work Ships in the Open",
      "p1_desc": "Merged changes become part of the MIT-licensed core that anyone can use, study, and build on.",
      "p2_badge": "Review",
      "p2_title": "Learn Through Code Review",
      "p2_desc": "Every pull request is reviewed before merge and checked against the quality gates in CONTRIBUTING.md.",
      "p3_badge": "Credit",
      "p3_title": "Public, Lasting Credit",
      "p3_desc": "Your commits stay attributed to you in the project's public Git history.",
      "policy_title": "About perks and privileges:",
      "policy_text": "Earlier versions of this page described lifetime commercial licenses and a four-tier privilege ladder. Those programs are not approved or operational and have been withdrawn. If maintainers introduce a recognition program, it will be documented here with its actual terms."
    },
    "pathways": {
      "badge": "Codebase Matrix",
      "title": "Public Repositories & Contribution Matrix",
      "subtitle": "Match your skills and passions to the right repository, bootstrap your local environment, and dive straight into active issues.",
      "one_line_title": "One-Command Contributor Bootstrap",
      "one_line_badge": "Recommended",
      "one_line_desc_html": "Clone the core repository and run its test suite. Before opening a pull request, run the full quality gates listed in <code>CONTRIBUTING.md</code>:",
      "copy_btn": "Copy",
      "copied_btn": "Copied!",
      "meta_prereq": "Prerequisites: Go 1.27.1+ and Git",
      "meta_zero": "No extra configuration needed",
      "filter_label": "Filter by Track:",
      "filter_all": "All Repositories",
      "filter_core": "Core Monorepo & Platform",
      "filter_web": "Portals & Sites",
      "track_krewire": "Core Monorepo & Libraries",
      "track_workspace": "Krewire Dash — Virtual Workspace & Automation Hub",
      "track_krewire_com": "Official Product & Docs Site",
      "track_github_io": "Community & Support Portal",
      "match_krewire": "If you enjoy: Modular Go libraries (pkg/*), CLI devtool (krew), fullstack runtimes, background queues, and AI agent templates (templates/boost).",
      "match_workspace": "If you enjoy: AI-native virtual workspaces, autonomous agent integration, sandboxed cloud runtimes, container sandboxes, and web terminal streaming.",
      "match_krewire_com": "If you enjoy: High-fidelity web design, interactive documentation, component-driven layouts, and dogfooding the .kiw DSL in production.",
      "match_github_io": "If you enjoy: Community engagement, contributor onboarding, localization (i18n), and accessible UI components.",
      "pkg_label": "Key Packages & Paths:",
      "action_issues": "Good First Issues →",
      "action_repo": "GitHub Repo ↗",
      "track_ui": "UI Components & Design System",
      "match_ui": "If you enjoy: Zero-dependency .kiw components, layout primitives, design tokens, dark mode, and accessible HTML.",
      "private_note_html": "Other Krewire repositories (<code>cloud</code>, <code>auth</code>, <code>dash</code>, <code>panel</code>, and <code>internal</code>) are private. Their code and issue trackers are not publicly accessible, so the repositories above are where external contributions happen."
    },
    "guide": {
      "badge": "Onboarding Fast-Track",
      "title": "Start Contributing in 5 Steps",
      "subtitle": "From zero to your first merged pull request. Here is how to get your development environment running in minutes.",
      "s1_title": "1. Fork & Clone Repositories",
      "s1_desc": "Fork any Krewire repository to your personal GitHub account, then clone it locally to begin.",
      "s2_title": "2. Build the krew CLI from Source",
      "s2_desc": "Inside your clone of the core repository (Go 1.27.1+), build the CLI you are changing:",
      "s3_title": "3. Pick an Open Issue",
      "s3_desc_html": "Browse our curated issues list tagged with <span class=\"tag-issue\">good first issue</span> or <span class=\"tag-issue\">help wanted</span>. Comment to let maintainers know you are working on it.",
      "s3_btn": "View Good First Issues →",
      "s4_title": "4. Implement & Verify Locally",
      "s4_desc": "Write clean, idiomatic Go code and tests. Run the quality gates from CONTRIBUTING.md before opening a pull request:",
      "s5_title": "5. Submit PR with Conventional Commits",
      "s5_desc": "Open a PR following Conventional Commits (feat, fix, docs, refactor, test). Maintainers and AI Boost will review and guide you to merge."
    },
    "standards": {
      "badge": "Quality Assurance",
      "title": "The Krewire Way: 3 Quality Gates",
      "subtitle": "To keep the codebase reliable, predictable, and production-ready, every pull request must pass three gates. The canonical list lives in the core repository's CONTRIBUTING.md.",
      "gate1_title": "Gate 1: Format & Lint",
      "gate1_desc": "Zero lint errors and idiomatic Go formatting. Code must adhere strictly to Go standard conventions.",
      "gate1_req": "Required: gofmt -l . (clean), go vet ./... (clean)",
      "gate2_title": "Gate 2: Tests",
      "gate2_desc": "Every change must pass the module's unit and integration tests, and krew compat must report ok after version.go changes.",
      "gate2_req": "Required: go test ./... passes, krew compat prints ok",
      "gate3_title": "Gate 3: Spec & Commits",
      "gate3_desc": "Changes must link to a valid Spec or Issue, following Conventional Commits format.",
      "gate3_req": "Required: Semantic commit format & spec traceability"
    },
    "sponsorship": {
      "badge": "Support Krewire",
      "title": "Supporting Krewire's Long-Term Maintenance",
      "subtitle": "Krewire measures success by what developers build with it, not by money raised. Support, financial or not, is how the project stays maintained: it pays for maintainer time and infrastructure so that the open-source core keeps working for everyone.",
      "status_title": "Current Status: No Active Funding Channel",
      "status_desc": "Krewire does not accept donations or sponsorships yet. The core repository's FUNDING.yml names a GitHub Sponsors account, but that profile is not active, so there is nothing to link to. A funding channel will appear here only after it is live and verified. There are no sponsorship tiers, perks, or published financial figures.",
      "impact_title": "What Support Makes Possible",
      "i1_title": "Maintenance",
      "i1_desc": "Reviewing issues and pull requests, and keeping the Go packages and the krew CLI working across releases.",
      "i2_title": "Documentation",
      "i2_desc": "Keeping the guides on krewire.com accurate and in step with the code, in English and Indonesian.",
      "i3_title": "Security",
      "i3_desc": "Triaging vulnerability reports and keeping dependencies and secure defaults up to date.",
      "i4_title": "Community",
      "i4_desc": "Onboarding new contributors and answering questions from people building with Krewire.",
      "help_badge": "Available Today",
      "help_title": "How to Help Right Now",
      "help1": "Use Krewire and report what breaks ↗",
      "help2": "Point out unclear or outdated documentation ↗",
      "help3": "Contribute code, tests, or translations",
      "help4": "Answer questions and share what you built ↗",
      "org_badge": "Organizations",
      "org_title": "Supporting Krewire as an Organization",
      "org_desc": "If your organization wants to support Krewire with funding, infrastructure, or engineering time, start a conversation in GitHub Discussions, or use the contact listed on the Krewire GitHub organization profile.",
      "org_cta1": "Start a Discussion ↗",
      "org_cta2": "Organization Profile ↗",
      "review_html": "Last reviewed: November 2026. Funding configuration source: <a href=\"https://github.com/krewire/krewire/blob/main/.github/FUNDING.yml\" target=\"_blank\" rel=\"noopener\">.github/FUNDING.yml in krewire/krewire</a>."
    },
    "boost": {
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
      "lead": "Whether you are building your first project, writing your first Go pull request, or helping others get started, you are laying the foundation for open-source self-reliance.",
      "github": "Explore Open Issues on GitHub →",
      "sponsor": "Ways to Support",
      "meta": "Proudly open source · MIT Licensed · Engineered with passion in Indonesia"
    },
    "footer": {
      "brand_title": "Krewire Community",
      "desc_html": "Community front door for the Krewire ecosystem.<br>Technical documentation lives on krewire.com.",
      "col_contrib": "Contribution",
      "col_community": "Community & Support",
      "where_start": "Public Repositories",
      "getting_started": "5-Step Contributor Guide",
      "standards": "3 Quality Gates",
      "gh_org": "GitHub Organization ↗",
      "discussions": "GitHub Discussions ↗",
      "good_first": "Good First Issues ↗",
      "bottom_rights_html": "© 2026 Krewire Contributors — An open-source collective based in Indonesia. Built 100% with Krewire <code>site</code> workload.",
      "col_start": "Get Started",
      "start": "Start Here",
      "docs": "Documentation ↗",
      "install": "Installation ↗",
      "releases": "Release Tags ↗",
      "contributing": "CONTRIBUTING.md ↗",
      "channels": "Support Channels",
      "support": "Supporting Krewire"
    },
    "start": {
      "badge": "Start Here",
      "title": "From Discovery to Your First Krewire Project",
      "subtitle": "This portal is the community front door. It does not host technical documentation: installation, the quickstart, and reference guides live on krewire.com and are maintained alongside the core repository. Follow these four steps in order.",
      "s1_title": "Understand Krewire",
      "s1_desc": "Read the overview to learn what Krewire is, its design principles, and which workload kinds it supports.",
      "s1_link": "Read the overview on krewire.com ↗",
      "s2_title": "Install the krew CLI",
      "s2_desc": "Follow the canonical installation guide. It covers the shell installer, go install, and how to verify the install.",
      "s2_link": "Installation guide ↗",
      "s3_title": "Build Your First Project",
      "s3_desc": "Work through the hands-on quickstart: scaffold a project, run the dev server, make a change, and build it.",
      "s3_link": "5-minute quickstart ↗",
      "s4_title": "Choose Your Next Step",
      "s4_desc": "Once your first project builds, pick the workload guide that matches what you want to ship next. Ask questions or share what you built in GitHub Discussions.",
      "s4_link": "Workload guides ↗",
      "dest_title": "Where Things Live",
      "d1_label": "Discovery & Community",
      "d1_desc": "This portal: how to get started, how to contribute, and how to support the project.",
      "d1_link": "You are here",
      "d2_label": "Documentation",
      "d2_desc": "The canonical source for installation, quickstart, guides, and CLI reference, in English and Indonesian.",
      "d3_label": "Source & Releases",
      "d3_desc": "The core repository holds the Go packages and the krew CLI. Versions are published as Git tags.",
      "d3_link": "Release tags ↗",
      "d4_label": "Contribution",
      "d4_desc": "Workflow, commit conventions, and quality gates are defined in the core repository's CONTRIBUTING.md.",
      "d4_link": "CONTRIBUTING.md ↗",
      "d5_label": "Questions & Bugs",
      "d5_desc": "Ask questions in GitHub Discussions. Report bugs in the issue tracker of the repository they affect.",
      "d5_link": "GitHub Discussions ↗"
    },
    "community": {
      "badge": "Community & Support Channels",
      "title": "Where to Ask, Report, and Share",
      "subtitle": "Use the public GitHub channels below. They are the places maintainers read today.",
      "c1_title": "GitHub Discussions",
      "c1_desc": "Questions, ideas, and sharing what you built with Krewire.",
      "c2_title": "Core Issue Tracker",
      "c2_desc": "Bug reports and feature requests for the Go packages and the krew CLI.",
      "c3_title": "Portal Issues",
      "c3_desc": "Broken links, outdated information, or translation problems on this site.",
      "note": "Chat servers, meetups, and events are listed here only once they are confirmed to be active."
    },
    "site_title": "Krewire Community — Get Started, Contribute & Support",
    "site_description": "The community front door for the Krewire open-source ecosystem: a canonical path to your first project, contributor guidance, and transparent support information.",
    "portal": {
      "welcome": "Welcome to Krewire Community Portal"
    }
  },
  "id": {
    "nav": {
      "badge": "Komunitas",
      "privileges": "Mengapa Berkontribusi",
      "pathways": "Jalur & Repositori",
      "guide": "Panduan Kontributor",
      "standards": "Standar Mutu",
      "sponsorship": "Dukungan",
      "boost": "AI Boost",
      "discussions": "Diskusi ↗",
      "github_org": "Organisasi GitHub",
      "start": "Mulai di Sini"
    },
    "hero": {
      "eyebrow": "◈ KOLEKTIF SUMBER TERBUKA · LAHIR DI INDONESIA · UNTUK DUNIA",
      "title_html": "Bangun dengan Krewire. Berkontribusi Kode.<br>Berdayakan Rekayasawan Indonesia.",
      "lead": "Krewire adalah gerakan sumber terbuka yang direkayasa di Indonesia untuk mengubah para pengembang dari konsumen perangkat lunak menjadi pencipta kelas dunia. Pustaka Go modularnya berlisensi MIT dan bebas digunakan, dan dukungan komunitas membantu menjaga pemeliharaan jangka panjang.",
      "cta_contribute": "Mulai Berkontribusi",
      "cta_sponsor": "Dukung Krewire",
      "meta": "100% Inti Sumber Terbuka (MIT) · Milik Komunitas · Infrastruktur Mandiri · Sinergi AI Boost",
      "cta_start": "Mulai →"
    },
    "trust": {
      "label": "Fondasi Komunitas & Tata Kelola",
      "indonesia_html": "Kolektif <b>Indonesia</b>",
      "meritocracy_html": "<b>Kontribusi</b> Terbuka",
      "opencore_html": "Keberlanjutan <b>Open Core</b>",
      "free_html": "Inti <b>100%</b> Gratis (MIT)",
      "cost": "Biaya Cloud Mendekati Nol"
    },
    "privileges": {
      "badge": "Mengapa Berkontribusi",
      "title": "Mengapa Berkontribusi ke Krewire",
      "subtitle": "Kontribusi masuk ke inti sumber terbuka berlisensi MIT yang dapat digunakan siapa saja. Saat ini tidak ada program keuntungan atau lisensi berbayar yang terkait dengan kontribusi.",
      "p1_badge": "Inti Terbuka",
      "p1_title": "Karya Anda Dirilis secara Terbuka",
      "p1_desc": "Perubahan yang digabungkan menjadi bagian dari inti berlisensi MIT yang dapat digunakan, dipelajari, dan dikembangkan oleh siapa saja.",
      "p2_badge": "Tinjauan",
      "p2_title": "Belajar Melalui Code Review",
      "p2_desc": "Setiap pull request ditinjau sebelum digabungkan dan diperiksa terhadap quality gate di CONTRIBUTING.md.",
      "p3_badge": "Kredit",
      "p3_title": "Kredit Publik yang Bertahan",
      "p3_desc": "Commit Anda tetap tercatat atas nama Anda di riwayat Git publik proyek.",
      "policy_title": "Tentang keuntungan dan hak istimewa:",
      "policy_text": "Versi sebelumnya dari halaman ini menyebutkan lisensi komersial seumur hidup dan jenjang hak istimewa empat tingkat. Program tersebut belum disetujui maupun berjalan, sehingga telah ditarik. Jika pengelola memperkenalkan program penghargaan, ketentuan sebenarnya akan didokumentasikan di sini."
    },
    "pathways": {
      "badge": "Matriks Basis Kode",
      "title": "Repositori Publik & Matriks Kontribusi",
      "subtitle": "Cocokkan keahlian dan minat Anda dengan repositori yang tepat, siapkan lingkungan lokal, dan langsung tangani isu aktif.",
      "one_line_title": "Bootstrap Kontributor Satu Perintah",
      "one_line_badge": "Disarankan",
      "one_line_desc_html": "Klon repositori inti dan jalankan pengujiannya. Sebelum membuka pull request, jalankan seluruh quality gate yang tercantum di <code>CONTRIBUTING.md</code>:",
      "copy_btn": "Salin",
      "copied_btn": "Tersalin!",
      "meta_prereq": "Prasyarat: Go 1.27.1+ dan Git",
      "meta_zero": "Tanpa konfigurasi tambahan",
      "filter_label": "Filter Berdasarkan Jalur:",
      "filter_all": "Semua Repositori",
      "filter_core": "Monorepo Inti & Platform",
      "filter_web": "Portal & Situs Web",
      "track_krewire": "Monorepo Inti & Pustaka",
      "track_workspace": "Krewire Dash — Ruang Kerja Virtual & Otomasi",
      "track_krewire_com": "Situs Produk & Dokumen Resmi",
      "track_github_io": "Portal Komunitas & Dukungan",
      "match_krewire": "Jika Anda menyukai: Pustaka Go modular (pkg/*), CLI devtool (krew), runtime fullstack, antrean latar belakang, dan template agen AI (templates/boost).",
      "match_workspace": "Jika Anda menyukai: Ruang kerja virtual AI, integrasi agen otonom, sandbox runtime cloud, integrasi IDE, dan terminal streaming.",
      "match_krewire_com": "Jika Anda menyukai: Desain web presisi tinggi, dokumentasi interaktif, tata letak berbasis komponen, dan dogfooding DSL .kiw di produksi.",
      "match_github_io": "Jika Anda menyukai: Keterlibatan komunitas, orientasi kontributor, pelokalan (i18n), dan komponen antarmuka yang aksesibel.",
      "pkg_label": "Paket & Jalur Utama:",
      "action_issues": "Good First Issues →",
      "action_repo": "Repositori GitHub ↗",
      "track_ui": "Komponen UI & Sistem Desain",
      "match_ui": "Jika Anda menyukai: Komponen .kiw tanpa dependensi, primitif tata letak, token desain, mode gelap, dan HTML yang aksesibel.",
      "private_note_html": "Repositori Krewire lainnya (<code>cloud</code>, <code>auth</code>, <code>dash</code>, <code>panel</code>, dan <code>internal</code>) bersifat privat. Kode dan issue tracker-nya tidak dapat diakses publik, sehingga kontribusi eksternal dilakukan di repositori di atas."
    },
    "guide": {
      "badge": "Jalur Cepat Kontributor",
      "title": "Mulai Berkontribusi dalam 5 Langkah",
      "subtitle": "Dari nol hingga pull request pertama Anda digabungkan. Berikut cara menyiapkan lingkungan pengembangan Anda dalam hitungan menit.",
      "s1_title": "1. Fork & Klon Repositori",
      "s1_desc": "Fork repositori Krewire ke akun GitHub pribadi Anda, lalu klon secara lokal untuk memulai.",
      "s2_title": "2. Build CLI krew dari Kode Sumber",
      "s2_desc": "Di dalam klon repositori inti Anda (Go 1.27.1+), build CLI yang sedang Anda ubah:",
      "s3_title": "3. Pilih Isu Terbuka",
      "s3_desc_html": "Jelajahi daftar isu pilihan bertanda <span class=\"tag-issue\">good first issue</span> atau <span class=\"tag-issue\">help wanted</span>. Berikan komentar agar pengelola mengetahui Anda sedang mengerjakannya.",
      "s3_btn": "Lihat Good First Issues →",
      "s4_title": "4. Implementasi & Uji Lokal",
      "s4_desc": "Tulis kode Go yang bersih, idiomatis, dan sertakan pengujian. Jalankan quality gate dari CONTRIBUTING.md sebelum membuka pull request:",
      "s5_title": "5. Kirim PR dengan Conventional Commits",
      "s5_desc": "Buka PR dengan format Conventional Commits (feat, fix, docs, refactor, test). Pengelola dan AI Boost akan meninjau dan memandu proses merge."
    },
    "standards": {
      "badge": "Jaminan Kualitas",
      "title": "Cara Krewire: 3 Quality Gate",
      "subtitle": "Agar basis kode tetap andal, dapat diprediksi, dan siap produksi, setiap pull request wajib melewati tiga gerbang. Daftar resminya ada di CONTRIBUTING.md repositori inti.",
      "gate1_title": "Gerbang 1: Format & Lint",
      "gate1_desc": "Nol kesalahan linting dan format Go idiomatis. Kode wajib mematuhi konvensi standar Go secara ketat.",
      "gate1_req": "Wajib: gofmt -l . (bersih), go vet ./... (bersih)",
      "gate2_title": "Gerbang 2: Pengujian",
      "gate2_desc": "Setiap perubahan wajib lolos pengujian unit dan integrasi modul, dan krew compat wajib melaporkan ok setelah perubahan version.go.",
      "gate2_req": "Wajib: go test ./... lolos, krew compat mencetak ok",
      "gate3_title": "Gerbang 3: Spesifikasi & Commit",
      "gate3_desc": "Perubahan harus tertaut ke Spesifikasi atau Isu yang sah, mengikuti format Conventional Commits.",
      "gate3_req": "Wajib: Format commit semantik & keterlacakan spesifikasi"
    },
    "sponsorship": {
      "badge": "Dukung Krewire",
      "title": "Mendukung Pemeliharaan Jangka Panjang Krewire",
      "subtitle": "Krewire mengukur keberhasilan dari apa yang dibangun pengembang dengannya, bukan dari dana yang terkumpul. Dukungan, baik finansial maupun tidak, adalah cara proyek ini tetap terpelihara: dukungan membiayai waktu pengelola dan infrastruktur agar inti sumber terbuka tetap berfungsi untuk semua orang.",
      "status_title": "Status Saat Ini: Belum Ada Kanal Pendanaan Aktif",
      "status_desc": "Krewire belum menerima donasi maupun sponsor. FUNDING.yml di repositori inti mencantumkan akun GitHub Sponsors, tetapi profil tersebut belum aktif sehingga belum ada yang bisa ditautkan. Kanal pendanaan baru akan dicantumkan di sini setelah aktif dan terverifikasi. Tidak ada tingkatan sponsor, keuntungan, maupun angka keuangan yang dipublikasikan.",
      "impact_title": "Apa yang Dimungkinkan oleh Dukungan",
      "i1_title": "Pemeliharaan",
      "i1_desc": "Meninjau isu dan pull request, serta menjaga paket Go dan CLI krew tetap berfungsi di setiap rilis.",
      "i2_title": "Dokumentasi",
      "i2_desc": "Menjaga panduan di krewire.com tetap akurat dan selaras dengan kode, dalam bahasa Inggris dan Indonesia.",
      "i3_title": "Keamanan",
      "i3_desc": "Menangani laporan kerentanan serta menjaga dependensi dan pengaturan aman bawaan tetap mutakhir.",
      "i4_title": "Komunitas",
      "i4_desc": "Membimbing kontributor baru dan menjawab pertanyaan dari orang-orang yang membangun dengan Krewire.",
      "help_badge": "Tersedia Sekarang",
      "help_title": "Cara Membantu Saat Ini",
      "help1": "Gunakan Krewire dan laporkan apa yang rusak ↗",
      "help2": "Tunjukkan dokumentasi yang kurang jelas atau usang ↗",
      "help3": "Kontribusikan kode, pengujian, atau terjemahan",
      "help4": "Jawab pertanyaan dan bagikan hasil karya Anda ↗",
      "org_badge": "Organisasi",
      "org_title": "Mendukung Krewire sebagai Organisasi",
      "org_desc": "Jika organisasi Anda ingin mendukung Krewire melalui pendanaan, infrastruktur, atau waktu rekayasa, mulailah percakapan di GitHub Discussions, atau gunakan kontak yang tercantum di profil organisasi GitHub Krewire.",
      "org_cta1": "Mulai Diskusi ↗",
      "org_cta2": "Profil Organisasi ↗",
      "review_html": "Terakhir ditinjau: November 2026. Sumber konfigurasi pendanaan: <a href=\"https://github.com/krewire/krewire/blob/main/.github/FUNDING.yml\" target=\"_blank\" rel=\"noopener\">.github/FUNDING.yml di krewire/krewire</a>."
    },
    "boost": {
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
      "lead": "Baik Anda sedang membangun proyek pertama, menulis pull request Go pertama, atau membantu orang lain memulai, Anda sedang meletakkan fondasi kemandirian teknologi sumber terbuka.",
      "github": "Jelajahi Isu Terbuka di GitHub →",
      "sponsor": "Cara Mendukung",
      "meta": "Bangga sumber terbuka · Berlisensi MIT · Direkayasa dengan dedikasi di Indonesia"
    },
    "footer": {
      "brand_title": "Komunitas Krewire",
      "desc_html": "Pintu masuk komunitas ekosistem Krewire.<br>Dokumentasi teknis tersedia di krewire.com.",
      "col_contrib": "Kontribusi",
      "col_community": "Komunitas & Dukungan",
      "where_start": "Repositori Publik",
      "getting_started": "Panduan Kontributor 5 Langkah",
      "standards": "3 Quality Gate",
      "gh_org": "Organisasi GitHub ↗",
      "discussions": "GitHub Discussions ↗",
      "good_first": "Good First Issues ↗",
      "bottom_rights_html": "© 2026 Kontributor Krewire — Kolektif sumber terbuka berbasis di Indonesia. Dibangun 100% dengan workload <code>site</code> Krewire.",
      "col_start": "Mulai",
      "start": "Mulai di Sini",
      "docs": "Dokumentasi ↗",
      "install": "Instalasi ↗",
      "releases": "Tag Rilis ↗",
      "contributing": "CONTRIBUTING.md ↗",
      "channels": "Kanal Dukungan",
      "support": "Mendukung Krewire"
    },
    "start": {
      "badge": "Mulai di Sini",
      "title": "Dari Mengenal Krewire hingga Proyek Pertama Anda",
      "subtitle": "Portal ini adalah pintu masuk komunitas. Portal ini tidak memuat dokumentasi teknis: instalasi, quickstart, dan panduan referensi ada di krewire.com dan dipelihara bersama repositori inti. Ikuti empat langkah berikut secara berurutan.",
      "s1_title": "Pahami Krewire",
      "s1_desc": "Baca ikhtisar untuk memahami apa itu Krewire, prinsip desainnya, dan jenis workload yang didukung.",
      "s1_link": "Baca ikhtisar di krewire.com ↗",
      "s2_title": "Pasang CLI krew",
      "s2_desc": "Ikuti panduan instalasi resmi. Panduan ini mencakup installer shell, go install, dan cara memverifikasi instalasi.",
      "s2_link": "Panduan instalasi ↗",
      "s3_title": "Bangun Proyek Pertama Anda",
      "s3_desc": "Ikuti quickstart praktis: buat kerangka proyek, jalankan server pengembangan, ubah sesuatu, lalu build.",
      "s3_link": "Quickstart 5 menit ↗",
      "s4_title": "Pilih Langkah Berikutnya",
      "s4_desc": "Setelah proyek pertama berhasil di-build, pilih panduan workload yang sesuai dengan apa yang ingin Anda rilis berikutnya. Ajukan pertanyaan atau bagikan hasil karya Anda di GitHub Discussions.",
      "s4_link": "Panduan workload ↗",
      "dest_title": "Ke Mana Harus Pergi",
      "d1_label": "Pengenalan & Komunitas",
      "d1_desc": "Portal ini: cara memulai, cara berkontribusi, dan cara mendukung proyek.",
      "d1_link": "Anda di sini",
      "d2_label": "Dokumentasi",
      "d2_desc": "Sumber resmi untuk instalasi, quickstart, panduan, dan referensi CLI, dalam bahasa Inggris dan Indonesia.",
      "d3_label": "Kode Sumber & Rilis",
      "d3_desc": "Repositori inti berisi paket Go dan CLI krew. Versi diterbitkan sebagai tag Git.",
      "d3_link": "Tag rilis ↗",
      "d4_label": "Kontribusi",
      "d4_desc": "Alur kerja, konvensi commit, dan quality gate ditetapkan di CONTRIBUTING.md repositori inti.",
      "d4_link": "CONTRIBUTING.md ↗",
      "d5_label": "Pertanyaan & Bug",
      "d5_desc": "Ajukan pertanyaan di GitHub Discussions. Laporkan bug di issue tracker repositori yang terdampak.",
      "d5_link": "GitHub Discussions ↗"
    },
    "community": {
      "badge": "Kanal Komunitas & Dukungan",
      "title": "Tempat Bertanya, Melapor, dan Berbagi",
      "subtitle": "Gunakan kanal GitHub publik di bawah ini. Kanal inilah yang saat ini dibaca oleh para pengelola.",
      "c1_title": "GitHub Discussions",
      "c1_desc": "Pertanyaan, ide, dan berbagi apa yang Anda bangun dengan Krewire.",
      "c2_title": "Issue Tracker Inti",
      "c2_desc": "Laporan bug dan permintaan fitur untuk paket Go dan CLI krew.",
      "c3_title": "Isu Portal",
      "c3_desc": "Tautan rusak, informasi usang, atau masalah terjemahan di situs ini.",
      "note": "Server chat, meetup, dan acara baru dicantumkan di sini setelah dipastikan aktif."
    },
    "site_title": "Komunitas Krewire — Mulai, Berkontribusi & Dukung",
    "site_description": "Pintu masuk komunitas ekosistem sumber terbuka Krewire: jalur resmi menuju proyek pertama Anda, panduan kontributor, dan informasi dukungan yang transparan.",
    "portal": {
      "welcome": "Selamat Datang di Portal Komunitas Krewire"
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
function isDocsRoute(pathname) {
var p = pathname || (typeof window !== 'undefined' && window.location ? window.location.pathname : '');
return p.indexOf('/docs') !== -1 || p.startsWith('/en/docs') || p.startsWith('/id/docs');
}
function initI18n() {
var path = window.location.pathname;
var inDocs = isDocsRoute(path) || !!document.querySelector('.docs-reader, .chapter, #sidebar-toc');
var currentLang = 'en';
try {
if (inDocs) {
if (path.startsWith('/id/') || path === '/id') {
currentLang = 'id';
} else {
currentLang = 'en';
}
} else {
var saved = localStorage.getItem('krewire-lang');
if (saved === 'id' || saved === 'en') {
currentLang = saved;
} else if (navigator.language && navigator.language.toLowerCase().startsWith('id')) {
currentLang = 'id';
}
}
} catch (e) {}
function applyLanguage(lang) {
currentLang = (lang === 'id') ? 'id' : 'en';
document.documentElement.lang = currentLang;
try {
localStorage.setItem('krewire-lang', currentLang);
} catch (e) {}
document.querySelectorAll('.lang-switch .lang-code, [data-lang-toggle] .lang-code').forEach(function (el) {
el.textContent = currentLang.toUpperCase();
});
document.querySelectorAll('[data-i18n]').forEach(function (el) {
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
document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
var key = el.getAttribute('data-i18n-html');
var val = getNestedValue(translations[currentLang], key) || getNestedValue(translations.en, key);
if (val) {
el.innerHTML = val;
}
});
try {
window.dispatchEvent(new CustomEvent('krewire:langchange', { detail: { lang: currentLang } }));
} catch (e) {}
}
window.krewireI18n = {
getLocale: function () { return currentLang; },
setLocale: function (l) { applyLanguage(l); },
toggle: function () {
applyLanguage(currentLang === 'en' ? 'id' : 'en');
},
t: function (key) {
return getNestedValue(translations[currentLang], key) || getNestedValue(translations.en, key) || '';
}
};
applyLanguage(currentLang);
if (!window._krewireLangBound) {
window._krewireLangBound = true;
document.addEventListener('click', function (e) {
var btn = e.target && e.target.closest ? e.target.closest('[data-lang-toggle], .lang-switch') : null;
if (btn) {
e.preventDefault();
var p = window.location.pathname;
var isDocs = isDocsRoute(p) || !!document.querySelector('.docs-reader, .chapter, #sidebar-toc');

if (isDocs) {
// Mechanism 2: Docs URL Path-based routing for markdown content
var isIdDocs = p.startsWith('/id/') || p === '/id';
var nextLang = isIdDocs ? 'en' : 'id';
try {
localStorage.setItem('krewire-lang', nextLang);
} catch (_) {}

var target;
if (nextLang === 'id') {
var clean = p.replace(/^\/en(\/|$)/, '/');
target = '/id' + (clean.startsWith('/') ? clean : '/' + clean);
} else {
target = p.replace(/^\/id(\/|$)/, '/') || '/docs';
}
var searchAndHash = (window.location.search || '') + (window.location.hash || '');
window.location.href = target + searchAndHash;
return;
}

// Mechanism 1: Landing / Site shell in-place DOM translation (<locale>.json)
var next = currentLang === 'en' ? 'id' : 'en';
applyLanguage(next);
}
});
}
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initI18n);
} else {
initI18n();
}
})();
;
(function () {
'use strict';
function getCopyText() {
if (window.krewireI18n && window.krewireI18n.t) {
return window.krewireI18n.t('docs_reader.copy_button') || 'Copy';
}
return 'Copy';
}
function getCopiedText() {
if (window.krewireI18n && window.krewireI18n.t) {
return window.krewireI18n.t('docs_reader.copied_button') || '✓ Copied!';
}
return '✓ Copied!';
}
function initCodeBlocks() {
document.querySelectorAll('.chapter pre, article pre, .docs-main pre').forEach(function (pre) {
if (pre.closest('.terminal') || pre.closest('.code-window') || pre.closest('.code-block-wrapper')) return;
if (pre.querySelector('.code-copy-btn')) return;

var wrapper = document.createElement('div');
wrapper.className = 'code-block-wrapper';
pre.parentNode.insertBefore(wrapper, pre);
wrapper.appendChild(pre);

var btn = document.createElement('button');
btn.className = 'code-copy-btn';
btn.setAttribute('type', 'button');
btn.setAttribute('aria-label', 'Copy code to clipboard');
btn.innerHTML = '<span class="copy-txt">' + getCopyText() + '</span>';
btn.addEventListener('click', function () {
var code = pre.querySelector('code');
var text = (code ? code.innerText : pre.innerText).replace(/\n$/, '');
function markCopied() {
btn.innerHTML = '<span class="copy-txt copied">' + getCopiedText() + '</span>';
setTimeout(function () {
btn.innerHTML = '<span class="copy-txt">' + getCopyText() + '</span>';
}, 2000);
}
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text).then(markCopied);
} else {
try {
var ta = document.createElement('textarea');
ta.value = text;
ta.style.position = 'fixed';
ta.style.opacity = '0';
document.body.appendChild(ta);
ta.select();
document.execCommand('copy');
document.body.removeChild(ta);
markCopied();
} catch (e) {}
}
});
wrapper.appendChild(btn);
});
}
function initHeadingAnchors() {
document.querySelectorAll('.chapter h2, .chapter h3').forEach(function (h) {
if (!h.id || h.querySelector('.anchor-link')) return;
var a = document.createElement('a');
a.className = 'anchor-link';
a.href = '#' + h.id;
a.innerHTML = '#';
a.setAttribute('aria-label', 'Permalink to ' + h.innerText);
a.style.marginLeft = '0.4rem';
a.style.color = 'var(--primary)';
a.style.textDecoration = 'none';
a.style.opacity = '0.35';
a.style.fontSize = '0.85em';
a.style.transition = 'opacity 0.15s ease';
h.addEventListener('mouseenter', function () { a.style.opacity = '1'; });
h.addEventListener('mouseleave', function () { a.style.opacity = '0.35'; });
h.appendChild(a);
});
}
function initKeyboardNav() {
document.addEventListener('keydown', function (e) {
var tag = (e.target && e.target.tagName) || '';
if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
if (e.key === 'ArrowLeft') {
var prev = document.querySelector('nav.pager a.prev');
if (prev && prev.href) window.location.href = prev.href;
} else if (e.key === 'ArrowRight') {
var next = document.querySelector('nav.pager a.next');
if (next && next.href) window.location.href = next.href;
}
});
}
function initDocsLangSwitch() {
var path = window.location.pathname;
var isDocs = (typeof isDocsRoute === 'function' ? isDocsRoute(path) : path.indexOf('/docs') !== -1) || !!document.querySelector('.docs-reader, .chapter, #sidebar-toc');
if (!isDocs) {
return;
}

var isIndonesian = path.startsWith('/id/') || path === '/id';
var curLang = isIndonesian ? 'id' : 'en';

document.querySelectorAll('.lang-switch .lang-code, [data-lang-toggle] .lang-code').forEach(function (el) {
el.textContent = curLang.toUpperCase();
});

if (isIndonesian) {
document.querySelectorAll('.topbar nav .nav-links a, .sidebar-mobile-nav a').forEach(function (a) {
var href = a.getAttribute('href');
if (href && href.startsWith('/docs') && !href.startsWith('/id/')) {
a.setAttribute('href', '/id' + href);
}
});
}

var nav = document.querySelector('.topbar nav');
if (!nav || nav.querySelector('[data-lang-toggle], .lang-switch')) return;

var btn = document.createElement('button');
btn.type = 'button';
btn.className = 'lang-switch';
btn.setAttribute('data-lang-toggle', '');
btn.setAttribute('aria-label', 'Toggle language');
btn.setAttribute('title', 'Switch language (EN/ID)');
btn.innerHTML = '<span class="lang-icon" aria-hidden="true">🌐</span><span class="lang-code">' + curLang.toUpperCase() + '</span>';

var themeToggle = nav.querySelector('[data-theme-toggle]');
if (themeToggle && themeToggle.parentNode) {
themeToggle.parentNode.insertBefore(btn, themeToggle);
} else {
var actions = nav.querySelector('.topbar-actions');
if (actions) {
actions.appendChild(btn);
} else {
nav.appendChild(btn);
}
}
}
function initDocsReaderI18n() {
var title = document.querySelector('.sidebar-title');
if (title && !title.getAttribute('data-i18n')) {
title.setAttribute('data-i18n', 'docs_reader.toc_title');
}
var searchInput = document.getElementById('toc-search');
if (searchInput && !searchInput.getAttribute('data-i18n')) {
searchInput.setAttribute('data-i18n', 'docs_reader.search_placeholder');
}
if (window.krewireI18n && window.krewireI18n.setLocale) {
window.krewireI18n.setLocale(window.krewireI18n.getLocale());
}
window.addEventListener('krewire:langchange', function () {
document.querySelectorAll('.code-copy-btn .copy-txt:not(.copied)').forEach(function (span) {
span.textContent = getCopyText();
});
});
}
function initDocsSidebarDrawer() {
var sidebar = document.getElementById('sidebar');
var toggle = document.getElementById('sidebar-toggle');
var close = document.getElementById('sidebar-close');
var overlay = document.getElementById('sidebar-overlay');
function setOpen(open) {
document.documentElement.classList.toggle('sidebar-open', open);
if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
if (sidebar) sidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
}
if (toggle && !toggle._docsDrawerBound) {
toggle._docsDrawerBound = true;
toggle.addEventListener('click', function (e) {
e.preventDefault();
setOpen(!document.documentElement.classList.contains('sidebar-open'));
});
}
if (close && !close._docsDrawerBound) {
close._docsDrawerBound = true;
close.addEventListener('click', function (e) {
e.preventDefault();
setOpen(false);
});
}
if (overlay && !overlay._docsDrawerBound) {
overlay._docsDrawerBound = true;
overlay.addEventListener('click', function (e) {
e.preventDefault();
setOpen(false);
});
}
if (!window._docsEscBound) {
window._docsEscBound = true;
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape') setOpen(false);
});
}
if (sidebar && !sidebar._docsLinksBound) {
sidebar._docsLinksBound = true;
sidebar.querySelectorAll('a.toc-link, a.toc-sub').forEach(function (link) {
link.addEventListener('click', function () {
if (window.innerWidth < 1024) {
setOpen(false);
}
});
});
}
document.querySelectorAll('[data-group] .toc-toggle').forEach(function (btn) {
if (btn._docsGroupBound) return;
btn._docsGroupBound = true;
btn.addEventListener('click', function (e) {
e.preventDefault();
e.stopPropagation();
var g = btn.closest('[data-group]');
if (!g) return;
var open = g.classList.toggle('open');
btn.setAttribute('aria-expanded', open ? 'true' : 'false');
var link = g.querySelector('.toc-link');
if (link) {
try {
localStorage.setItem('krewire-toc-' + link.getAttribute('href'), open ? '1' : '0');
} catch (_) {}
}
});
});
var toggleAll = document.getElementById('toc-toggle-all');
if (toggleAll && !toggleAll._docsGroupBound) {
toggleAll._docsGroupBound = true;
toggleAll.addEventListener('click', function (e) {
e.preventDefault();
var groups = document.querySelectorAll('[data-group]');
var anyClosed = Array.from(groups).some(function (g) { return !g.classList.contains('open'); });
groups.forEach(function (g) {
g.classList.toggle('open', anyClosed);
var b = g.querySelector('.toc-toggle');
if (b) b.setAttribute('aria-expanded', anyClosed ? 'true' : 'false');
var link = g.querySelector('.toc-link');
if (link) {
try {
localStorage.setItem('krewire-toc-' + link.getAttribute('href'), anyClosed ? '1' : '0');
} catch (_) {}
}
});
});
}
var searchInput = document.getElementById('toc-search');
var searchClear = document.getElementById('toc-search-clear');
var searchKbd = document.getElementById('toc-search-kbd');
var noResults = document.getElementById('toc-no-results');
if (searchInput) {
searchInput.addEventListener('input', function () {
var q = searchInput.value.trim().toLowerCase();
if (searchClear) searchClear.style.display = q ? 'inline-flex' : 'none';
if (searchKbd) searchKbd.style.display = q ? 'none' : '';
var matchCount = 0;
document.querySelectorAll('#sidebar-toc > *').forEach(function (el) {
if (!q) {
el.style.display = '';
if (el.hasAttribute('data-group')) {
el.querySelectorAll('.toc-sub').forEach(function (s) { s.style.display = ''; });
var l = el.querySelector('.toc-link');
var href = l ? l.getAttribute('href') : '';
var v = href ? localStorage.getItem('krewire-toc-' + href) : null;
var hasActive = el.querySelector('.active');
var open = hasActive || v === '1' || (v !== '0' && el.classList.contains('open'));
el.classList.toggle('open', !!open);
var b = el.querySelector('.toc-toggle');
if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
}
return;
}
if (el.hasAttribute('data-group')) {
var parentMatch = (el.querySelector('.toc-link') ? el.querySelector('.toc-link').textContent || '' : '').toLowerCase().indexOf(q) !== -1;
var subMatches = 0;
el.querySelectorAll('.toc-sub').forEach(function (s) {
var m = (s.textContent || '').toLowerCase().indexOf(q) !== -1;
s.style.display = (m || parentMatch) ? '' : 'none';
if (m) subMatches++;
});
if (parentMatch || subMatches > 0) {
el.style.display = '';
el.classList.add('open');
var b = el.querySelector('.toc-toggle');
if (b) b.setAttribute('aria-expanded', 'true');
matchCount += (parentMatch ? 1 : 0) + subMatches;
} else {
el.style.display = 'none';
}
} else {
var match = (el.textContent || '').toLowerCase().indexOf(q) !== -1;
el.style.display = match ? '' : 'none';
if (match) matchCount++;
}
});
if (noResults) {
noResults.style.display = (q && matchCount === 0) ? 'block' : 'none';
}
});
if (searchClear) {
searchClear.addEventListener('click', function () {
searchInput.value = '';
searchInput.dispatchEvent(new Event('input'));
searchInput.focus();
});
}
document.addEventListener('keydown', function (e) {
var tag = (e.target && e.target.tagName) || '';
if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
e.preventDefault();
searchInput.focus();
searchInput.select();
}
});
searchInput.addEventListener('keydown', function (e) {
if (e.key === 'Escape') {
if (searchInput.value) {
searchInput.value = '';
searchInput.dispatchEvent(new Event('input'));
} else {
searchInput.blur();
}
}
});
}
}

function initNavDropdowns() {
  document.addEventListener('click', function(e) {
    var isInsideDropdown = e.target.closest('.dropdown-container');
    var isDropdownLink = e.target.closest('.dropdown-menu a');
    document.querySelectorAll('details.dropdown-container[open]').forEach(function(detail) {
      if (!isInsideDropdown || isDropdownLink) {
        detail.removeAttribute('open');
      }
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('details.dropdown-container[open]').forEach(function(detail) {
        detail.removeAttribute('open');
      });
    }
  });

  window.toggleNavDropdown = function(el) {
    var container = el.closest('.dropdown-container');
    if (!container) return;
    if (container.tagName.toLowerCase() === 'details') {
      container.open = !container.open;
    } else {
      container.classList.toggle('is-open');
    }
  };
}

function initAll() {
initCodeBlocks();
initHeadingAnchors();
initKeyboardNav();
initDocsLangSwitch();
initDocsReaderI18n();
initDocsSidebarDrawer();
initNavDropdowns();
}
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', initAll);
} else {
initAll();
}
})();