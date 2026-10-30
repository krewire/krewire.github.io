# Architecture of Krewire Community Portal

This document outlines the architectural components, build mechanics, and publishing model of the **`krewire.github.io`** repository.

---

## High-Level Architecture

The community portal is a static site (`site` workload) designed for speed, zero server maintenance, and seamless hosting on GitHub Pages.

```
                      +-----------------------------+
                      |   Source Files              |
                      |  - pages/index.kiw          |
                      |  - layouts/Base.kiw         |
                      |  - layouts/Landing.kiw      |
                      |  - lang/{en,id}/*.json      |
                      |  - public/ assets           |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |          kiw build          |
                      |  - pkg/kiw (template parser)|
                      |  - pkg/web/ssg (generator)  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     .krewire/build/         |
                      |  index.html, assets, JSON   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     GitHub Pages Engine     |
                      |  Published to gh-pages      |
                      +-----------------------------+
```

---

## Architectural Principles

### 1. Minimalistic & Framework-Free
The portal avoids heavy frontend frameworks (React, Vue, or Webpack/Vite). All DOM templating and scoping happen at build time inside `kiw`, resulting in raw HTML/CSS/vanilla JS with instant load times and small transfer sizes.

### 2. Layout & Shell Separation
- **`layouts/Base.kiw`**: Outer HTML shell with `<head>`, meta tags, theme-color metadata, favicons, navbar, and sidebar scaffolding.
- **`layouts/Landing.kiw`**: Layout customized for landing pages with hero areas, section anchors, and structured footer.
- **`pages/index.kiw`**: Declarative sections for community content and interactive widgets.

### 3. Internationalization (i18n) Engine
- Client-side language switcher dynamically swaps dictionary strings without page reloads.
- Default locale and fallback locale are managed via `krewire.yaml` (`default_locale: "en"`).

---

## Deployment & Hosting Model

- Production build output is published to GitHub Pages.
- Clean routing with base URL `/` configured in `krewire.yaml`.
- Fast CDN delivery via GitHub's edge network with automatic TLS/SSL certificate provisioning.
