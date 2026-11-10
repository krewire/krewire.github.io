# Contributing to Krewire Community Portal

We welcome contributions to help improve the onboarding experience, guides, and visibility for our community!

---

## Contribution Workflow

1. **Find or Open an Issue**: Check GitHub Issues under `krewire/krewire.github.io`.
2. **Branch**: Create a branch off `main` (e.g., `feat/add-event-banner` or `fix/sponsorship-link`).
3. **Edit**:
   - Update `pages/index.kiw`, layouts, or language files in `lang/`.
   - Maintain clean, semantic HTML and avoid unnecessary JavaScript dependencies.
4. **Verify Locally**:
   - Run `kiw build` inside `krewire.github.io` to ensure a clean build.
   - Run `kiw serve` and check responsive views on desktop and mobile viewports.
   - Verify both light and dark modes.
5. **Commit**: Use Conventional Commits (`feat(community): ...`, `fix(ui): ...`, `docs: ...`).
6. **Submit PR**: Submit a pull request to `main` with a clear explanation of changes.

---

## Content Standards

- **Inclusivity & Tone**: Friendly, encouraging, and clear. Krewire is an open-source community rooted in Indonesia with a global reach.
- **Bilingual Accuracy**: Keep English and Indonesian translations synchronized. Avoid machine-translated phrasing without human review.
- **Clean Styles**: Keep styles scoped inside `<style>` blocks in `.kiw` files to avoid style bleed. Use existing theme CSS variables (`--primary`, `--accent`, etc.).

---

## Content Ownership & Review

The portal links out instead of duplicating documentation, so most of its content stays correct with little upkeep. Owner for everything below: the maintainers of this repository.

- **Onboarding links (Start Here, footer):** Installation and quickstart live on krewire.com and are maintained with the core repository. Change the steps there, not here. Only update this portal if a docs URL moves.
- **Contributor instructions:** Commands in the contributor guide and quality gates must match the core repository's `README.md` and `CONTRIBUTING.md`. If they diverge, the core files win.
- **Community channels:** List a channel (chat server, meetup, form) only after confirming it is live. Do not add placeholder invites or event links.
- **Support information:** The source of truth for funding channels is `.github/FUNDING.yml` in `krewire/krewire`. Publish a funding link only after confirming it resolves to an active profile. Never publish tiers, perks, prices, or financial figures that maintainers have not approved and cannot deliver.
- **Review cadence:** Re-check every external link and the support status before each production release tag (`vX.Y.Z`) and whenever `FUNDING.yml` changes, then update the "Last reviewed" note in the support section. A quick check: `curl -sIL <url>` for each link, and confirm `https://github.com/sponsors/<account>` does not redirect to the org page before listing GitHub Sponsors.
