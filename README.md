# Krewire Community Portal — krewire.github.io

Official community portal (published at **https://open.krewire.com/**) — the community front door for the Krewire digital SDLC ecosystem: a canonical start path, contributor guidance, community channels, and sponsorship information.

- **Stack:** `krewire.yaml` (kind `site`, `build.base: "/"`) + `pages/*.kiw` + `layouts/*.kiw` → `krew build` → `.krewire/build` (pure site mode, no `go.mod` needed).
- **Design:** Contributor & sponsorship portal, theme toggle (`auto`/`light`/`dark`) via `localStorage`, bilingual i18n (`en`/`id`), scoped CSS (`data-kiw-*`), theme color tokens.
- **Purpose:** Start-here path to a first project, contributor onboarding, public repository matrix, quality gates, and transparent support information.

## Role in the 11-Repository Ecosystem

| Destination | What lives there |
| :--- | :--- |
| **This portal** (`krewire.github.io`) | Discovery and community: where to start, how to contribute, community channels, and sponsorship tiers. |
| **[krewire.com](https://krewire.com/docs)** (`krewire/krewire.com`) | Canonical documentation: installation, quickstart, guides, CLI reference (EN/ID). |
| **[krewire/krewire](https://github.com/krewire/krewire)** | Foundational pure-Go core monorepo (37 domain modules without root `go.mod`). |
| **[krewire/hub](https://github.com/krewire/hub)** | Official Port & Adapter repository for third-party software and external database drivers. |

## License

[MIT License](LICENSE) © 2026 Krewire Contributors
