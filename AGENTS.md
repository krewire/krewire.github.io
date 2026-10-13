# AGENTS.md — krewire.github.io Community Portal

Agent guide for AI agents working inside the `krewire.github.io` repository
(`github.com/krewire/krewire.github.io`).

`krewire.github.io` is the community portal for contributors, guides, and sponsorships.
It is built using the `site` kind with `.kiw` DSL and deployed via GitHub Pages.

## Language

- **Write all stored artifacts in English** — pages, components, docs content, commit messages.
- If the human writes in Indonesian or another language, reply in the human's language in chat, but keep all repository files in English.

## Specs & Progress Tracking (GitHub Issues SSOT)

To keep progress tracking fully automated, resilient against markdown parsing drift, and deterministic for both AI agents and human developers:

1. **GitHub Issues as Single Source of Truth:**
   - Active specifications and their implementation progress are tracked as GitHub Issues under `krewire/krewire.github.io` with label `spec`.
   - Title format: `[Spec: KRW-<Code>] <Title>` (e.g. `[Spec: KRW-X7K9Q] Landing Site + Documentation`).
   - Every issue body contains the structured requirement checklist with `- [ ]` and `- [x]` checkboxes citing `ReqID` and priority.
   - `docs/specs/index.md` links directly to these GitHub Issues.

2. **Automated Agent & Developer Progress Workflow:**
   - **Discovering tasks:** Query active specs via CLI/API:
     ```bash
     gh issue list -R krewire/krewire.github.io --label spec --json number,title,url
     gh issue view <number> -R krewire/krewire.github.io --json title,body
     ```
   - **Verifying completion:** Build and inspect static output:
     ```bash
     kiw build
     kiw serve
     ```
   - **Updating status:** When a requirement is implemented and verified, check off the requirement box (`- [ ]` → `- [x]`) in the GitHub Issue body. Commits must reference the issue number and requirement ID (`feat(site): implement <ReqID> (ref #<IssueNumber>, req <ReqID>)`). Close the issue once all requirements are completed.

## Quality Gates

Before finishing any task, run:
```bash
kiw build
```
Verify that the output builds without errors.

## Commit Discipline

- **Conventional Commits**: `feat|fix|docs|style|refactor|chore(site): desc`.
- Atomic commits (≤~300 LOC).
- Run `git` inside `krewire.github.io/`.
