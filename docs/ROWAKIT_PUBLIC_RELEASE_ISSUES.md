# RowaKit – Public Release Issues Pack (OSS + Donate)

> Mục tiêu: đưa **RowaKit** ra public theo chuẩn OSS (MIT), có **Donate** (GitHub Sponsors + Buy Me a Coffee/Ko-fi), repo “public-ready” để người lạ dùng được trong 2 phút.
>
> Nguyên tắc: **không đụng logic sản phẩm** (RowaKit Table Stage A đã DONE). Đây chỉ là **repo hygiene + docs + CI + release readiness**.

---

## 0) Scope Lock (Agent MUST follow)

### MUST
- Chỉ tạo/cập nhật các file: docs, .github, license, readme, metadata, workflow
- Giữ nguyên code logic RowaKit Table (không refactor component/table)
- Nếu cần chỉnh `package.json` thì chỉ chỉnh **metadata/scripts/build outputs** phục vụ publish, không đổi API.

### MUST NOT
- ❌ Không thêm feature vào table (filters/selection/virtualization/...)
- ❌ Không đổi API, không rename exports, không sửa logic fetcher/columns
- ❌ Không thêm dependencies không cần thiết
- ❌ Không thêm “platform”/website phức tạp

---

## 1) PR-PUB-01: OSS Foundation (License + Community + Funding)

**Goal:** Repo đạt chuẩn tối thiểu OSS và có donate.

### Changes
Create/Update files at repo root:

1. `LICENSE` (MIT)
2. `CONTRIBUTING.md`
3. `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)
4. `SECURITY.md` (simple reporting instructions)
5. `.github/FUNDING.yml`

### FUNDING.yml (template)
> IMPORTANT: Agent phải để placeholder rõ ràng, bạn sẽ thay username/link thật.
```yml
github: <YOUR_GITHUB_USERNAME_OR_ORG>
custom:
  - <YOUR_BUYMEACOFFEE_OR_KOFI_URL>
```

### Acceptance Criteria
- GitHub hiển thị license (MIT)
- GitHub UI hiển thị “Sponsor” (sau khi bạn bật Sponsors)
- CONTRIBUTING/SECURITY rõ và ngắn

### Out of scope
- Publishing npm
- Release automation

---

## 2) PR-PUB-02: GitHub Hygiene (Issue/PR templates)

**Goal:** Giảm issue rác, giữ triết lý “just-enough” không thành datagrid.

### Changes
Create:
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/question.yml`

### Required content
- Feature template MUST include a scope guard:
  - “Requests that turn RowaKit into a generic data-grid (virtualization, grouping, pivot, spreadsheet) will be rejected.”
- PR template MUST include:
  - checkbox: “No scope creep”
  - checkbox: “Tests updated”
  - checkbox: “Docs updated (if needed)”

### Acceptance Criteria
- New Issue UI shows forms
- PR template auto appears on new PR

---

## 3) PR-PUB-03: CI Workflow (lint/test/build)

**Goal:** Mọi PR đều chạy CI tối thiểu.

### Changes
Create `.github/workflows/ci.yml` with:
- Trigger: `pull_request`, `push` to `main`
- Steps:
  - checkout
  - setup node (LTS)
  - install (pnpm/npm/yarn based on repo)
  - lint
  - typecheck (if exists)
  - test
  - build

### Acceptance Criteria
- CI passes on main
- CI runs on PR

### Out of scope
- Release workflow
- Publishing to npm in CI

---

## 4) PR-PUB-04: Public README (2-minute onboarding)

**Goal:** Người lạ vào repo hiểu RowaKit, cài được, chạy example được.

### Changes
Update `README.md` to include:

1. Title + tagline
2. What it is / What it is not
3. Installation
4. Quickstart example for `@rowakit/table`
5. Links to docs:
   - Roadmap
   - Contributing
   - Security
6. Donate section (star/sponsor/coffee)

### Acceptance Criteria
- README không dài dòng, không overpromise
- Quickstart code compiles

### Out of scope
- Docs website

---

## 5) PR-PUB-05: Docs Pack (Scope lock + Roadmap + Release checklist)

**Goal:** Có tài liệu neo để sau này mở rộng đúng hướng.

### Changes
Create folder `docs/`:

- `docs/DECISIONS_SCOPE_LOCK.md`
  - Copy scope lock statement: not a datagrid, server-side first, core small + escape hatch
- `docs/ROADMAP.md`
  - Stage A Done
  - Stage B planned (badge/number/basic filters) – only if demand
- `docs/RELEASE_CHECKLIST.md`
  - Steps to publish npm (manual)
  - Versioning notes
  - Tag release steps

### Acceptance Criteria
- Docs rõ, ngắn, dùng được cho contributor mới

---

## 6) PR-PUB-06: Package Metadata & Publish Readiness (no publish yet)

**Goal:** `@rowakit/table` sẵn sàng publish (nhưng không publish trong PR này).

### Changes
In `packages/table/package.json` ensure:
- `name`, `version`, `license: MIT`
- `repository`, `homepage`, `bugs` point to repo
- `main/module/types` correct
- `files` include dist
- scripts:
  - `build`, `test`, `lint` (nếu repo dùng)
- Ensure build outputs to `dist/` and types emitted

Add root `CHANGELOG.md` (simple, keep-a-changelog style).

### Acceptance Criteria
- `pnpm -r build` (or equivalent) produces dist for table
- No breaking changes

### Out of scope
- npm publish
- semantic-release

---

## 7) Final Gate (Public Ready Checklist)

- [ ] LICENSE (MIT) present
- [ ] README public-ready (2 min onboarding)
- [ ] CI green on main
- [ ] Issue/PR templates in place
- [ ] FUNDING.yml configured (you will fill usernames/links)
- [ ] Docs pack present
- [ ] Package metadata ready for npm publish

---

## Notes for Maintainer (You, not Agent)

You MUST do manually:
1) Enable GitHub Sponsors (profile/org)
2) Create BuyMeACoffee/Ko-fi page
3) Replace placeholders in FUNDING.yml
4) Run first `npm publish` manually (token/2FA)
