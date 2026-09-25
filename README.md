# Krewire — GitHub Pages deployment

Standalone deployment repository for **https://krewire.github.io/** — the unified Krewire site (landing + docs). This repository is independent from the Krewire site source and has no automated cross-repository deployment.

- **Stack:** `krewire.yaml` (kind `site`, `base:"/"`) + `pages/*.kiw` + `components/*.kiw` + `layouts/*.kiw` + `content/docs/*.md` → `krewire build` → `site/` (no `go.mod` needed per `KWF-DF3PL`).
- **Design:** Inspired by `laravel.com` — sparse hero with code snippet, 8 workload cards, ecosystem strip, docs sidebar. Theme toggle (`auto`/`light`/`dark`) via `localStorage`, scoped CSS (`data-kiw-*`), `framework/ui` vars (`--color-primary` `#00c853`).
- **Version:** `v0.3.2` — single source `krewire.yaml` `version:`; injected as `.Version` into every page (badges/footer), never hardcoded in content.
- **Spec:** `docs/specs/KRW-SITE-X7K9Q-landing-site.md` (broad scope: landing + docs, not narrow).

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
layouts/              # Base (shell) + Docs (sidebar)
components/           # Hero, FeatureCard, CodeWindow, Ecosystem, Callout, DocNav (frontmatter-free)
content/docs/         # Markdown collections (getting-started, workloads, dsl)
public/               # favicon.svg, copied verbatim
```

## Ecosystem

Source lives across `krewire/*`: `framework`, `libs`, `mdbind`, `guild`, `kiw`. This site dogfoods `framework/web/ssg` + `framework/dsl` (`<markdown>`, `dict` helper, optional frontmatter) and validates the `site` path end-to-end.
