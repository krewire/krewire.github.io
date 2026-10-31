# Krewire Community Portal — Developer & Contributor Documentation

Welcome to the internal contributor documentation for **`krewire.github.io`**, the official community and contributor portal for the Krewire ecosystem.

The portal is published at **https://open.krewire.com/** (GitHub Pages hosting via the `gh-pages` branch) and serves as the open-source hub for community guides, contributor onboarding, meritocracy privileges, ecosystem directory, and sponsorship tiers.

---

## Repository Overview

- **Workload Kind**: `site` (declared in `krewire.yaml`).
- **Build Engine**: `kiw build` (powered by `pkg/kiw` and `pkg/web/ssg`).
- **Target Platform**: GitHub Pages (`gh-pages` branch).
- **Go Module Requirement**: None (`go.mod` is not needed for `site` workloads).

---

## Directory Layout

```
krewire.github.io/
├── krewire.yaml           # Devtool configuration (kind, nav, theme tokens, i18n)
├── pages/                 # File-based routes (index.kiw → /)
├── layouts/               # SSG layouts (Base.kiw shell, Landing.kiw)
├── lang/                  # Bilingual localization dictionaries
│   ├── en/                # English translations
│   └── id/                # Indonesian translations
├── public/                # Static assets (favicons, manifest, client assets)
├── docs/                  # Contributor and developer guides (this folder)
└── AGENTS.md              # AI agent guidelines for this repository
```

---

## Documentation Navigation

- [Getting Started](./getting-started.md) — Local setup, previewing with `kiw serve`, and building with `kiw build`.
- [Architecture](./architecture.md) — SSG rendering pipeline, layout model, i18n architecture, and GitHub Pages hosting.
- [Contributing](./contributing.md) — Guidelines for updating contributor pathways, community guides, and sponsorship tiers.
