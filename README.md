# krewire.github.io

Built site for **https://krewire.github.io/** — deployed from [`krewire/krewire`](https://github.com/krewire/krewire) (source).

- **Source repo:** `krewire/krewire` `main` — file-based `.kiw` (`pages/`, `components/`, `layouts/`, `content/`) + `krewire.yaml` (kind `site`)
- **Build:** `krewire build` (from `krewire/krewire`) → `site/` (no `go.mod` needed)
- **Deploy artifact:** `krewire/krewire` `gh-deploy` branch (built site at root, `.nojekyll`) → triggers workflow → this repo `gh-pages` → `https://krewire.github.io/` (org pages, `base:"/"`)
- **Live branch:** `gh-pages` in this repo (GitHub Pages source: `gh-pages` / root)
- **Version:** `v0.1.0` — all Krewire repos start at `v0.1.0`
- **Spec:** [`krewire/krewire/docs/specs/KRW-SITE-X7K9Q-landing-site.md`](https://github.com/krewire/krewire/blob/main/docs/specs/KRW-SITE-X7K9Q-landing-site.md)

> **Do not edit files directly here** — they are generated. Edit source in `krewire/krewire` and push built site to its `gh-deploy` branch.

## Quick verify

```bash
# from krewire/krewire
kiw build && ls site
# site/index.html, site/docs/*.html, site/assets/*.css
```

Deployed via `.github/workflows/deploy.yml` in `krewire/krewire` (trigger on `gh-deploy`).
