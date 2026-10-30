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
