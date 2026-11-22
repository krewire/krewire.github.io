# Safe & Transparent AI-Assisted Contribution Policy

> **Parent Initiative**: [AI-Native Engineering Ecosystem Initiative (internal#8)](https://github.com/krewire/internal/issues/8)  
> **Status**: Approved & Published  
> **Audience**: Community Contributors, Autonomous AI Agents, and Ecosystem Maintainers  

---

## 1. Objective & Purpose

The Krewire ecosystem welcomes responsible, disciplined use of Artificial Intelligence (AI) tools—including LLMs, coding agents, and assistive IDEs—to accelerate software development, issue triage, test generation, and documentation refinement.

The goal of this policy is to empower contributors to work productively with modern AI assistance while unswervingly preserving **code quality**, **intellectual property provenance**, **security standards**, **maintainer authority**, and the **Three Pillars (3S)**: **Secure (S1)**, **Sustainable (S2)**, and **Scalable (S3)**.

AI-generated or AI-assisted contributions are neither automatically accepted nor inherently second-class: they are judged strictly by the merit, correctness, and security of the submitted code.

---

## 2. Core Principles & Contributor Accountability

1. **Human Accountability**:
   - The human contributor who submits a pull request or issue retains 100% accountability for everything in that submission.
   - You must read, understand, test, and be prepared to explain and defend every line of code, documentation, or configuration you submit.
   - *"The AI generated it"* is never an acceptable justification for defective, unsafe, unformatted, or non-functional code.
2. **Deterministic Verification Precedes Trust**:
   - AI outputs must be independently verified against local tests and compilers before submission. Never open a pull request expecting CI to be your syntax checker or debugger.
3. **Maintainer Sovereignty**:
   - Maintainers retain sole and final authority over issue triage, priority assignment, review criteria, request for changes, and merge approvals.

---

## 3. Disclosure Guidelines

To facilitate effective peer review without imposing unnecessary bureaucratic friction:

- **Material AI Assistance (Disclosure Recommended)**:
  - If a pull request, substantial architecture change, new feature, complex algorithm, or major documentation section was materially drafted or heavily assisted by an AI model (e.g., Claude, Gemini, GPT-4o, Krew, or DeepSeek), contributors should include a brief disclosure in the pull request description.
  - *Example*: `Assisted by: Krewire Krew agent (Claude 3.7 Sonnet) for initial test case generation and refactoring.`
- **Routine / Assistive Use (No Disclosure Required)**:
  - Standard editor autocompletions (e.g. GitHub Copilot line completions), spelling/grammar correction tools, docstring formatting, or trivial code formatting do **not** require disclosure.
- **Fair Review**:
  - Pull requests disclosing AI assistance will not be penalized. Disclosing AI usage allows reviewers to focus their scrutiny where generative models frequently make mistakes (edge cases, race conditions, path sanitization, and hallucinated APIs).

---

## 4. Security, Privacy & Secret-Handling Restrictions

To protect the ecosystem and contributors alike, strict boundaries are enforced:

1. **Zero Committed Secrets**:
   - Never paste, prompt, or transmit API tokens, private cryptographic keys, passwords, certificates, or personal user data into any external AI service or model provider.
2. **Confidentiality & Privacy**:
   - Never supply proprietary, non-public customer data, or internal infrastructure IP addresses/credentials into unvetted model endpoints.
3. **No Hallucinated Dependencies**:
   - All external imports, third-party libraries, and dependencies introduced in a PR must be real, actively maintained, and verified with `go mod verify` and `govulncheck`. Introducing non-existent ("phantom") or suspicious packages will result in immediate PR rejection.
4. **Context Sanitization**:
   - When generating code with autonomous agents, ensure tools operate within bounded filesystems (`SafePath`) and redact environment variables containing secrets.

---

## 5. Licensing & Provenance Invariants

1. **License Compatibility**:
   - All contributions must be 100% compatible with the **MIT License** governing the Krewire open-source core repositories (`krewire`, `ui`, `krewire.com`, `krewire.github.io`).
2. **Clean Provenance**:
   - Contributors must ensure that code produced by AI does not reproduce copyrighted code from projects under incompatible or copyleft licenses (e.g., GPL, AGPL, proprietary sources) without explicit authorization.
3. **Developer Certificate of Origin (DCO)**:
   - By submitting a pull request, contributors certify that they possess the legal right to contribute the code under the project's open-source license.

---

## 6. Review & Quality Gates Invariant

Every AI-assisted contribution is subject to the identical, uncompromising quality gates enforced for manual human contributions. No exceptions are granted:

1. **Gate 1: Format & Static Analysis**:
   ```bash
   gofmt -l .        # Must return 0 lines
   go vet ./...      # Must exit with code 0
   ```
2. **Gate 2: Conformance & Testing**:
   ```bash
   go test -v ./...  # All unit and integration tests must pass
   krew compat       # Cross-module compatibility check must return OK
   ```
3. **Gate 3: Pure-Go Compilation**:
   ```bash
   CGO_ENABLED=0 go build ./... # Must compile cleanly without CGO
   ```
4. **Gate 4: Layering & Dependency Invariants**:
   - Code must respect the strict downward-only 6-layer pyramid architecture ([ADR-6CAB8C](https://github.com/krewire/krewire/blob/main/internal/docs/adr/ADR-6CAB8C-ecosystem-architecture-baseline.md)). No peer coupling or upward imports.

---

## 7. Agent-Friendly Guidelines for Autonomous Contributors

If you are using an autonomous agent (such as [`krew`](https://github.com/krewire/krew), Claude Code, or Antigravity) to prepare contributions, configure your agent to follow these repository standards:

- **Read Context First**: Agents must read [`AGENTS.md`](../AGENTS.md) at the repository root before making changes.
- **Conventional Commits**: Commit messages must adhere to Conventional Commits: `feat(<scope>): ...`, `fix(<scope>): ...`, `docs(<scope>): ...`, `test(<scope>): ...`.
- **Atomic Changes**: Keep individual commits granular and focused ($\le 300$ lines of code per commit).
- **Issue Traceability**: Always link the owning GitHub Issue in commit messages and PR descriptions (e.g. `(ref #13)`).
- **English for Code Artifacts**: All code comments, docstrings, commit messages, and PR descriptions must be written in English.

---

## 8. Automated Bots & Rate Limits

- **Unsolicited Automated PRs**: Completely autonomous bots opening unsolicited pull requests without human oversight or maintainer coordination are prohibited. Such PRs will be closed immediately and the bot account may be rate-limited or blocked.
- **Coordinated Automation**: Automated maintenance bots (e.g. dependency version bumps, benchmark bots, security scanners) must be explicitly authorized and configured by Krewire maintainers.

---

## 9. Reporting Concerns & Questions

If you suspect an AI-generated contribution violates copyright, introduces security backdoors, or violates this policy:
- For general concerns, comment directly on the relevant pull request or open an issue.
- For confidential security vulnerabilities, report responsibly to `security@krewire.com`.
