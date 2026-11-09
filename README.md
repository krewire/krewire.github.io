# Krewire Community Portal — krewire.github.io

Official community portal (published at **https://open.krewire.com/**) — the community front door for the Krewire ecosystem: a canonical start path, contributor guidance, community channels, and support information.

- **Stack:** `krewire.yaml` (kind `site`, `build.base: "/"`) + `pages/*.kiw` + `layouts/*.kiw` → `kiw build` → `.krewire/build` (no `go.mod` needed).
- **Design:** Contributor & sponsorship portal, theme toggle (`auto`/`light`/`dark`) via `localStorage`, bilingual i18n (`en`/`id`), scoped CSS (`data-kiw-*`), theme color tokens.
- **Version:** `v0.1.0` — single source `krewire.yaml` `project.version`.
- **Purpose:** Start-here path to a first project, contributor onboarding, why contribute (no perk programs), public repository matrix, quality gates, community channels, and transparent support information.

## Role in the ecosystem

| Destination | What lives there |
| :--- | :--- |
| **This portal** (`krewire.github.io`) | Discovery and community: where to start, how to contribute, how to get help, how to support the project. Links out; never duplicates technical docs. |
| **[krewire.com](https://krewire.com/docs)** (`krewire/krewire.com`) | Canonical documentation: installation, quickstart, guides, CLI reference (EN/ID). |
| **[krewire/krewire](https://github.com/krewire/krewire)** | Source code, the `kiw` CLI, release tags, and `CONTRIBUTING.md` (workflow and quality gates). |

If installation or quickstart steps change, update them on krewire.com, not here.

## Quick start

```bash
# from this repo (no go.mod needed)
kiw build        # → .krewire/build
kiw serve        # preview at http://localhost:8080

# file-based routing
pages/index.kiw          → /
```

## Deploy

- **Published artifact:** the build output mirrored to the `gh-pages` branch via the CI mirror step, served by GitHub Pages; the public entrypoint is **open.krewire.com**.
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

Public repositories: `krewire`, `krew`, `ui`, `krewire.com`, `krewire.github.io`. The remaining ecosystem repositories (`cloud`, `auth`, `dash`, `panel`, `internal`) are private. This site dogfoods `pkg/web/ssg` + `pkg/kiw` DSL (`<markdown>`, `dict` helper, optional frontmatter) and validates the `site` path end-to-end.
