# REVIEW_GATE_PROGRESS

Workstream G — IMP-070 Model B-lite + IMP-071 Final SPLIT_MAP / legacy-credit audit.

## Scope / commits

| Commit | Nội dung |
|---|---|
| `eb391c4` | Starting HEAD (Workstream F = GATE PASS, tree clean) |
| `b39a53a` | `feat(progress): IMP-070 Model B-lite quiz attempts + completion gating` — attempt storage, harness integration, completion gate, legacy seed, progressStages helpers, IMP-071 audit script |
| `0020358` | `fix(progress): seed attempts on every progress read + X2 quiz submit-inside-form repair` — runtime-test findings |
| `ddac572` | `fix(progress): adversarial repairs — toggleDone storage-guard + dedupe stale comment` |

Không push. Nhánh `main`.

## Starting state

- HEAD `eb391c4`, working tree clean, không có work dở dang cần cứu.
- 48 live unit routes (39 core + 6 optional + 3 AP zero-quiz), 8 redirects, 45 quiz instructional, SCHEMA_VERSION 13, SPLIT_MAP 14, hint baseline 67 — tất cả khớp expectation của brief trước khi chỉnh.

## Previous progress model

Trước Workstream G (Task 9 → IMP-059):

- localStorage `hoc-android-tv:progress` = mảng slug đã học; `hoc-android-tv:progress-migrated` = version đã migrate (13).
- Hoàn thành = bấm "Đánh dấu đã học" — không có điều kiện gì khác; không khái niệm quiz-attempt.
- Migration: fixed-point theo SPLIT_MAP, chạy trong `migrateProgress()` khi đọc.
- Progress UI: homepage hero/pcard + header rail = CORE ONLY (IMP-059, filter `data-track`); sidebar module đếm theo member riêng; resume = card chưa `.done` đầu tiên theo thứ tự registry.

## Model B-lite contract

- INSTRUCTIONAL (có quiz, 45 bài core/optional): **COMPLETED ⇔ người học tự xác nhận (bấm toggle) ∧ đã nộp quiz ≥ 1 lần**.
- KHÔNG có ngưỡng điểm: nộp 0/N vẫn là một attempt. Không có pass/fail; copy không dùng "đạt/trượt".
- Attempt không tự động hoàn thành; retry không xoá attempt; unmark không xoá attempt; mark lại không cần nộp lại.
- Reference (AP1–AP3): không thuộc completion gating theo quiz (xem policy bên dưới).

## Storage keys

- `hoc-android-tv:progress` — mảng slug done (không đổi, SCHEMA_VERSION 13, không bump).
- `hoc-android-tv:quiz-attempts` — mảng slug đã nộp quiz (key mới, tách khỏi migration done).
- `hoc-android-tv:progress-migrated` — version gate (13).
- Resilience dùng chung qua `readRaw(key)`: thiếu key → `[]`; JSON hỏng / không phải array / phần tử không phải string → lọc/an toàn, không crash; dedupe bằng Set; slug lạ đi qua nguyên vẹn (unknown-slug contract giữ nguyên như done).
- Không bump SCHEMA_VERSION cho attempt key (đúng §27): nó tách khỏi migration cấu trúc slug.

## Quiz-attempt integration

- Harness (`web/src/scripts/quiz.ts`) là điểm tích hợp duy nhất: trong listener `submit` của `form#quiz-form`, sau `preventDefault`, gọi `recordQuizAttempt(lessonSlug())` + dispatch `CustomEvent("quiz-attempted")`. **45 quiz không bị sửa** (diff chỉ sửa 1 file X2 vì defect có sẵn — xem Deviations).
- Attempt = submit thật. Không tính: mở bài, chọn radio (đã kiểm runtime: chọn radio không ghi), cuộn tới quiz, bấm retry (chỉ reset DOM), điểm số còn hiển thị trong DOM.
- Slug identity: `main[data-page-slug]` do `BaseLayout` (prop `slug`) đăng ký từ `chapter.slug` — slug registry, không parse text hiển thị/đánh số/badge. Homepage không có `data-page-slug`, không có quiz form.
- Retry: handler `#quiz-retry` chỉ đụng DOM; storage attempts nguyên vẹn (runtime-verified).
- Event sync: `quiz-attempted` (mới) + `progress-changed` (có sẵn) — ProgressToggle nghe `quiz-attempted` để gỡ hint "chưa làm quiz" không cần reload. Vanilla CustomEvent, không polling, không framework.

## Completion gating

- **Trước attempt**: bấm "Đánh dấu đã học" → `toggleDone(slug, hasQuiz=true)` trả `{ok:false}` KHÔNG ghi storage; hint `role="status" aria-live="polite"` hiện copy: "Bạn chưa thử quiz. Hãy làm quiz ít nhất một lần trước khi đánh dấu bài đã học — không cần đúng hết."
- **Sau attempt**: bấm → ghi done bình thường; chip "Đã hoàn thành" + sidebar `.done` + header rail cập nhật qua `progress-changed`.
- **Unmark/re-mark**: unmark xoá done, GIỮ attempts; mark lại đi thẳng (attempt đã có). Runtime-verified chuỗi: blocked → submit → confirm → reload (survive) → unmark (attempt giữ) → re-mark (không cần nộp lại).

## Core / optional / appendix policy

- **Core = 39**: mọi bề mặt % (hero-pct, bb-pct, tp-label, ms-done/ms-left) filter `data-track="core"`. Hoàn thành O1–O6 không đổi core (runtime: O1 done → tp-label vẫn `1/39`).
- **Optional = 6**: B-lite áp dụng như instructional (O1 runtime-verified blocked→submit→done); sidebar module optional giữ denominator riêng (6); homepage không đếm optional vào % core.
- **Appendix AP1–AP3 = reference**: chính sách chốt — **không thuộc instructional completion gating**. ProgressToggle render `data-has-quiz="false"`; `toggleDone(slug, hasQuiz=false)` bỏ qua gate → toggle tự do như cũ, KHÔNG bịa yêu cầu quiz, KHÔNG bịa attempt (không fake form, không fake flag; `Quiz` undefined nên không render form). AP không bao giờ tính vào core 39.

## Per-stage helpers

`web/src/lib/progressStages.ts` (mới, thuần registry):

- `trackOf` / `stageUnits` đọc `STAGES[].kind` + `ALL_CHAPTERS[].stageId` — không suy từ số bài.
- `stageProgress(stageId)`, `allStageProgress()`, `coreUnits()` (=39), `optionalUnits()` (=6), `coreProgress()`, `nextLesson()`.
- Verified counts từ registry: foundation 2 · android 14 · compose 5 · state 5 · navigation 2 · network 3 · data 6 · realworld 2 → core 39; optional 6; appendix 3.
- `nextLesson()` cho Workstream H: core trước, optional sau; bài attempted-chưa-confirm vẫn là target vì attempt không thêm `.done`. Chưa build UI H.

## Legacy seed policy

- **Grandfather 1 chiều done → attempts**, tất định + idempotent, chạy trong `getDoneSlugs()` nên MỌI người đọc progress (trang chủ, sidebar, toggle) đều kích — bài done sau seed cũng bắt kịp ở lần đọc kế tiếp. (Sửa từ bản đầu: seed chỉ chạy khi có ai hỏi `hasQuizAttempted` — runtime test bắt được bài done short-circuit trước khi hỏi, attempts chưa được seed; đã chuyển seed vào `getDoneSlugs()`.)
- Seed là union một chiều: không bao giờ tạo done mới ⇒ no-fabricate §D không bị xâm phạm; slug lạ trong attempts được giữ nguyên.
- Seed ăn slug SAU migrate (descendant cuối), không để attempt đứng dưới slug chết: old Ch08 → W1/W2/W3 attempted (runtime + audit verified).

## SPLIT_MAP final audit

Audit bằng `web/scripts/progress_g_audit.mjs` extract VERBATIM SPLIT_MAP + thuật toán migrate từ `progress.ts` (test không thể drift khỏi prod). **14 entry active, mọi target resolve transitively tới unit live; không target kết thúc ở slug chết.**

| # | Source | Targets (final live) | Phân loại |
|---|---|---|---|
| 1 | `ch01-welcome-to-android-kotlin` | A1–A4 | dead-source replace (monolith) |
| 2 | `ch02-getting-started-with-android-studio` | 2.1, A6(2.2a), 2.3 | dead-source replace (monolith) |
| 3 | `ch03-android-fundamentals` | 3.1, A10, A11, 3.3, 3.4 | dead-source replace (monolith) |
| 4 | `ch10-room-database` | R1(qua chain), R2, R3, R4 | dead-source replace (monolith) |
| 5 | `ch10-1-vi-sao-can-database` | R1 | dead-source replace (pilot R1 rename) |
| 6 | `ch01-4-gradle-ban-do` | A4 | cleanup/repair (typo dead slug, v7) |
| 7 | `ch02-2-may-ao-may-that-doc-project` | old (A6) + A7 | **keep-source fan-out** (union) |
| 8 | `ch03-2-string-resource-va-debug` | A10, A11 | dead-source replace |
| 9 | `ch05-jetpack-compose` | C1–C4 | dead-source replace |
| 10 | `ch06-advanced-jetpack-compose` | S2–S4 | dead-source replace |
| 11 | `ch08-networking` | W1–W3 | dead-source replace |
| 12 | `ch09-data-store` | D1, D2 | dead-source replace |
| 13 | `ch11-advanced-storage` | X1, X2 | dead-source replace |
| 14 | `ch07-advanced-architecture` | O1 | dead-source replace (REDUCE 1:1) |

Không thêm entry nào chỉ vì bảng kế hoạch cũ có row 1:1 (rule §21).

## Legacy-credit matrix

- old `ch10-1` → **R1 done + attempted, S5 NOT done, S5 NOT attempted** (audit hard-assert + runtime).
- old `ch07` → **O1 done + attempted; O2–O6/AP1–AP3 không receiving** (audit: attempts sau seed đúng 1 phần tử = O1).
- No-fabricate list (audit, mỗi slug một check): F1, F2, C5, S1, S5, N1, N2, O2, O3, O4, O5, O6, AP1, AP2, AP3 — không slug nào được done từ legacy.
- old Ch08 → W1/W2/W3 done + attempted (không để attempt dưới slug chết).

## Historical migration tests

`node scripts/progress_g_audit.mjs` → **79/79 PASS**. Ma trận:

- v4-era: 10 monolith cùng lúc → 32 descendant đều live; idempotent (`migrate(migrate(x)) == migrate(x)`).
- Đã split / split một phần / mixed old+new+unknown: unknown pass-through nguyên vẹn.
- Duplicate slug → dedupe. Empty → empty. Version thiếu/cũ: MIGRATION_KEY gate re-run chuẩn (migrate idempotent nên an toàn).
- Corrupt: JSON hỏng / non-array / phần tử non-string / thiếu key → `[]` hoặc lọc, không crash (mirror `readRaw`).

## Corrupt/unknown storage tests

Runtime (browser thật): set `quiz-attempts = "{not json"` + `progress = ["slug", 42, null]` → bấm toggle không crash, trạng thái hợp lý, trang chạy tiếp. Unknown-slug contract: không purge âm thầm (pass-through + seed giữ nguyên entry lạ).

## Resume semantics

- Homepage resume = card đầu tiên chưa `.done` — attempt KHÔNG thêm `.done` ⇒ attempted-but-incomplete vẫn unfinished (runtime: attempts=[R1], done=[] → resume trỏ F1, không skip R1…; R1 vẫn là target khi tới lượt).
- AP (appendix) không thể là "bước lõi tiếp theo": `nextLesson()` core trước optional sau; homepage resume list cũng chỉ duyệt card theo thứ tự registry với core group trước.

## Runtime tests

Browser thật (IAB + Playwright evaluate, preview server trên dist build), ma trận §29:

1. Bài mới chưa attempt → confirm bị chặn, storage untouched ✔
2. Nộp quiz → attempted true, KHÔNG tự complete ✔ (score `0/8` vẫn tính attempt)
3. Confirm sau attempt → done ✔ (chip + sidebar + rail đồng bộ)
4. Reload → cả hai survive ✔
5. Unmark → done false, attempt giữ ✔
6. Re-mark → cho phép, không cần nộp lại ✔
7. Retry → confirm-dialog reset DOM, attempt giữ ✔
8. O1 optional → B-lite như thường; core label vẫn `1/39` sau khi O1 done ✔
9. AP1 → toggle được không cần quiz, không fake form; core không đổi ✔
10. Legacy v4 (Ch08 + ch10-1, chưa có attempts key) → migrate về W1/W2/W3/R1, seed đủ, KHÔNG có hint sai trên bài done ✔; S5 sạch ✔
11. Chọn radio không ghi attempt ✔
12. 8 quiz đại diện (A5/C3/S4/N2/W2/D1/X2/O6) nộp → score + attempt đúng slug từng bài ✔
13. Corrupt storage không crash ✔

## Accessibility / copy

- Hint: `<p id="quiz-hint" role="status" aria-live="polite">` — text, không phụ thuộc màu/icon; không modal.
- Copy: "Bạn chưa thử quiz. Hãy làm quiz ít nhất một lần trước khi đánh dấu bài đã học — không cần đúng hết." — không punitive, không ngụ ý điểm, không gamification; không expose schema/localStorage/migration/B-lite.

## Adversarial review

Independent reviewer (subagent riêng, đọc code + chạy audit/check, không sửa code) — **32/32 attack PASS**.

- Verdict: `WORKSTREAM_G_ADVERSARIAL_PASS` — **0 BLOCKER / 0 MAJOR / 3 MINOR**.
- MINOR 1: `toggleDone` ghi storage không guard try/catch (pre-existing từ baseline; private-mode có thể throw) → **đã sửa** `ddac572`.
- MINOR 2: comment lịch sử "11 = Stage 6" bị lặp (copy-paste) → **đã xoá** `ddac572`.
- MINOR 3: homepage Section-level `mod-group` denominator gộp optional vào Section II (21) — cấu trúc SECTIONS có TRƯỚC Workstream G (không thuộc diff eb391c4..HEAD); core % mọi bề mặt vẫn đúng; để dành homepage rework Workstream H. Không sửa trong G (tránh chạm homepage redesign).
- Probes thêm: `toggleDone` chỉ có 1 caller (ProgressToggle, luôn truyền hasQuiz tường minh); 48/48 trang chapter có `data-page-slug` khớp thư mục, 8 redirect stub không có; homepage 0 form quiz; mỗi quiz page đúng 1 form (không leak event); AP thật sự 0 form.

## Build / Astro / quiz audit

- `npm run build` → 49 page (48 chapter + homepage), không error.
- `npx astro check` → 0 errors / 0 warnings / **67 hints** (đúng baseline, không tăng).
- `node scripts/quiz_audit.mjs <45 files>` → **45/45 PASS**.
- dist verification: 48 real chapter pages (grep -L data-page-slug chỉ trả về 8 redirect stub); 8 redirect target khớp astro.config.mjs; `data-has-quiz` = true×45 / false×3.

## Deviations

1. **X2 quiz markup repair**: `Ch11KeystoreSqlcipherVaMaHoaQuiz.astro` có nút submit/retry + score nằm NGOÀI `form#quiz-form` — defect có sẵn từ khi tạo (commit `02356ed`, Stage 7): click "Kiểm tra đáp án" thật không hề submit form ⇒ chấm bài, retry, điểm, (và giờ là attempt) không chạy trên trang này. quiz_audit không bắt vì không kiểm vị trí nút. Đây là "real progress integration defect" đúng ngoại lệ cho phép của brief §0 — sửa tối thiểu: đưa 3 control vào trong form, khớp sibling X1 + 44 quiz còn lại; runtime re-verified (click → score `0/12` + attempt ghi).
2. `toggleDone` đổi return từ `boolean` sang `{done, ok}` + tham số `hasQuiz` — cần cho gating; đúng 1 caller, đã cập nhật.
3. Thêm prop `slug` cho `BaseLayout` + `data-page-slug` trên `<main>` — identity contract tối thiểu, không phải redesign.
4. `progress_g_audit.mjs` giữ lại làm regression dài hạn (không scratch): chạy thuật toán VERBATIM từ source nên không thể drift; nằm ở `web/scripts/` theo quy ước repo (thư mục này gitignore — tài liệu hoá ở đây; nếu muốn gate tương lai chạy được từ CI, copy sang vị trí tracked là việc của Workstream H+, không bắt buộc theo brief).

## Findings

- **Blockers**: không.
- **Major**: không.
- **Minor**: 3 (đã xử lý 2; 1 pre-existing homepage structure — documented, Workstream H).

## Gate verdict

**GATE PASS**

- Model B-lite: confirm + ≥1 attempt, không ngưỡng điểm, attempt không tự complete, retry không xoá.
- Storage: key attempts riêng, persist, corrupt-safe; schema 13 / SPLIT_MAP 14 / redirects 8 giữ nguyên.
- Legacy: seed đúng descendant cuối, không mất completion, không fabricated credit, ch10-1→R1 only, ch07→O1 only.
- Tracks: core 39 / optional 6 / appendix reference — core % không đổi bởi O/AP.
- UI semantics: blocked có feedback a11y, attempted-chưa-confirm vẫn unfinished, hint tối thiểu, không redesign sidebar.
- Regression: 48 routes, 45 quiz, build/check/audit PASS, hints 67.
- Adversarial: WORKSTREAM_G_ADVERSARIAL_PASS (0B/0M).
- Git: clean, không push.
