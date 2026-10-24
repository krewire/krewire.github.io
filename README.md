# Krewire Community Portal — krewire.github.io

Official community portal for **https://krewire.github.io/** — the hub for contributors, open-source collective guides, and sponsorship for the Krewire ecosystem.

- **Stack:** `krewire.yaml` (kind `site`, `base: "/contribute/"`) + `pages/*.kiw` + `layouts/*.kiw` → `kiw build` → `.krewire/build` (no `go.mod` needed).
- **Design:** Contributor & sponsorship portal, theme toggle (`auto`/`light`/`dark`) via `localStorage`, bilingual i18n (`en`/`id`), scoped CSS (`data-kiw-*`), theme color tokens.
- **Version:** `v0.1.0` — single source `krewire.yaml` `project.version`.
- **Purpose:** Contributor onboarding, meritocracy privileges, codebase matrix, 3 quality gates, and transparent sponsorship tiers for the Indonesian & global open-source community.

## Quick start

```bash
# from this repo (no go.mod needed)
kiw build        # → site/
kiw serve        # preview at http://localhost:8080

# file-based routing
pages/index.kiw          → /
pages/docs/index.kiw     → /docs
pages/docs/[slug].kiw    → /docs/:slug  (from content/docs/*.md)
```

## Deploy

- **Published artifact:** `gh-pages` branch, served from the repository root by GitHub Pages.
- **Source:** This repository is maintained independently; production deployment of the main Krewire site is managed elsewhere.

There is no workflow in this repository that builds from or publishes to another Krewire repository.

## Structure (not too scoped)

```
krewire.yaml          # kind: site, title, nav, footer, theme
pages/                # file-based routes
layouts/              # Base (shell) and portal layouts
lang/                 # Locale translation dictionaries (en, id)
public/               # Static assets (favicon, images, client JS/CSS)
```

## Ecosystem

Krewire consists of 7 repositories (`krewire`, `cloud`, `auth`, `mdbind`, `internal`, `krewire.com`, `krewire.github.io`). This site dogfoods `pkg/web/ssg` + `pkg/kiw` DSL (`<markdown>`, `dict` helper, optional frontmatter) and validates the `site` path end-to-end.
