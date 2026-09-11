# REVIEW_GATE_WORKSTREAM_H

Verdict: **GATE PASS** (WORKSTREAM_H_ADVERSARIAL_PASS — 0 BLOCKER / 0 MAJOR)
Date: 2026-09-10 · Reviewer: ZCode (long workstream execution) · HEAD at last content
repair: `1d76707` · gate-close docs commit: `65830df` (this report was written at
`1d76707` and then committed as its own chore commit — reconciled 2026-09-11).

## Scope / commits

Workstream H = final major UI phase: IMP-080 (Homepage Roadmap v2), owner-task
sidebar lesson identity redesign, IMP-081 (search final + lesson header wayfinding),
IMP-082 (count truth-check), browser/functional validation, independent adversarial
review + repair loop. Curriculum content, quizzes, Model B-lite semantics, SPLIT_MAP,
schema: **untouched** (verified below).

Commits on `main` this workstream (base `3f2b0a4`):

| commit | content |
|---|---|
| `f847559` | feat(home): implement roadmap v2 (IMP-080) |
| `bd18131` | feat(nav): redesign sidebar lesson identity (owner task) |
| `2a7dc1d` | feat(search): finalize search context + lesson header stage wayfinding (IMP-081) |
| `a87db9b` | feat(counts): IMP-082 truth-check script (scripts/check_counts.mjs) |
| `1d76707` | fix(home): terminal state at 39/39 core — optional never resumes as next step (adversarial repair) |

## Starting state

- HEAD `3f2b0a4` (Workstream G gate pass), branch `main`, working tree clean.
- 48 live units (39 core / 6 optional / 3 appendix), 45 quizzes, SCHEMA_VERSION 13,
  SPLIT_MAP 14, redirects 8, astro baseline 0 errors / 0 warnings / 67 hints, not pushed.
- Known G-minor carried in: homepage mod-group structure grouped optional into old
  Section II denominator.

## UI baseline problems

1. Homepage organized as 3 old "Section" cards with `mod-group` denominators —
   optional units were counted inside Section II (Workstream G review gate minor #3).
2. Sidebar showed learner-facing `5.1/5.2` numeric chips — book-chapter identity
   leaked into the product UI.
3. Lesson header used "Chương N" labels and book numbering as primary wayfinding.
4. Search results lacked stage context and missed some intent queries.

## Homepage roadmap v2

`web/src/pages/index.astro` rewritten (IMP-080):

- Hero: `2+7` formula (2 foundation lessons + 7 main stages), 39 bài lõi / 6 mở rộng /
  ~22 giờ, progress % element (`#hero-pct`), continue CTA.
- "Bạn đang ở đâu" stage strip: 8 steps (Nền tảng + GĐ1–7), `data-stage`/`data-slugs`
  driven from registry, states done/active/todo with sr-only text
  (live probe: `Nền tảng — đang học`).
- Nền tảng + 7 stage cards: each with kicker, name, `N bài học · khoảng H giờ ·
  x/N hoàn thành`, bar, and lesson rows (mark / title / `mục · câu · phút` meta / state).
- Separate dashed "Mở rộng — không bắt buộc" card (own 6-row denominator, Capstone row
  carries `Nên làm` badge); "Phụ lục" reference list with 3 rows (zero-quiz, no progress
  semantics).
- Old `.mod-group`/Section II architecture fully removed (truth-check asserts absence).
- Resume card = Model B-lite `nextLesson()`; terminal card = core 39/39.

## Hero / truth-derived counts

All numbers derived at build from registry/lessonStats — no hardcoded lesson counts:

- `2` / `7` from stage composition (foundation units, core stages).
- `39` / `6` from `coreUnits()`/`optionalUnits()` denominators (progressStages.ts).
- Hours = sum of per-lesson minutes from lessonStats → **~22 giờ** (1305 min core).
- Stage sub-lines "N bài học · x/N hoàn thành" read `data-slugs` rendered from
  registry; client only counts done slugs.
- Deviation note: brief/spec text said "~17 giờ" as a plan estimate; we display the
  honest lessonStats-derived ~22h per brief §34/§50 (never trim content to prettify).

## Stage roadmap

7 core stages + foundation rendered in STAGES order (foundation→android→compose→
state→navigation→network→data→realworld). Current-stage card gets `.current-stage`;
strip marks preceding stages done, stage containing resume = "đang học". Verified
in browser across scenarios A–G (counts and strip states recomputed correctly from
localStorage via getDoneSlugs()).

## Resume / terminal state

- Resume: `nextLesson()` = core first, optional after, appendix never. Attempt-but-
  unconfirmed stays unfinished (scenario D: 20 done + attempt on #21 → resume still
  shows "Tiếp cận mọi người dùng: a11y cơ bản", pct 51%).
- Terminal: **fixed during adversarial loop** (`1d76707`) — `allCoreDone` now checked
  BEFORE the next-lesson branch, so 39/39 core shows the terminal card
  "Bạn đã hoàn thành toàn bộ lộ trình lõi 🎉" and hides the resume card even though
  `nextLesson()` would return an optional unit. Mở rộng is never presented as a
  required next step. Scenarios E/F/G verified live: resume hidden, terminal visible,
  hero 100%, 39/41/45 done rows respectively.

## Optional / appendix homepage treatment

Optional = own dashed card, own x/6 progress line, "Nên làm" badge only on Capstone;
appendix = reference list only (no progress marks, no denominator). Appendix never
appears in resume/strip/hero denominators.

## Sidebar Lesson Identity Redesign

- old pattern: `5.1`-style numeric chips (`module-num`, `.num`, ch-group book labels).
- new hierarchy: `<details>` per stage with kicker (Nền tảng / Giai đoạn N / Mở rộng /
  Phụ lục), stage name (spec display name; foundation shows "Kotlin đủ để học Compose"),
  subtitle `N bài học · <mod-done>x/y</mod-done> hoàn thành`; topbar shows `n/39 bài`.
- completed/current/incomplete: done = accent circle + check icon; current =
  `aria-current="page"` + primary ring mark + inset 3px bar + font-weight 650;
  incomplete = neutral outline circle with small dot. All states have non-color cues.
- optional/reference: `module-optional` styling + ext-badge "Mở rộng" / "Tham khảo".
- internal numbering preserved only in data: `number`/`subNumber`/lessonId untouched
  in chapters.ts; UI no longer renders them.
- long-title handling: titles wrap (grid `22px 1fr` rows); verified in
  j-08-sidebar-expanded and j-23b-drawer-expanded captures.
- mobile: ≤1024px rail becomes drawer (fixed, translateX, visibility-managed so
  drawer links leave the Tab order when closed); Escape closes and returns focus to
  #menu-toggle; same IA as desktop. 390px captures pass.

## Search final

- index scope: all 48 units — core, optional (labeled), appendix (labeled); section
  headings also indexed.
- result context: `stageContext · stageName` labels (deduped), e.g. "Jetpack Compose ·
  Material 3 & theming", "Mở rộng · WorkManager", "Phụ lục · Gradle nâng cao".
- cap decision: top-12 retained — documented inline at the scoring code (IMP-081
  comment): ~500 index rows across 48 units; 12 gives depth for one intent without
  dumping 48 rows; broad queries ("compose", 12 cap-hit) still work by typing longer
  phrases; keyboard nav (ArrowUp/Down + Enter) and Esc intact; Ctrl/Cmd+K focuses.
- query regression (live, hit counts): Kotlin ✓, Gradle ✓ (signing 3), Compose 12,
  ViewModel ✓, Navigation 2 (was 0 pre-H — improved by adding slug tokens to keys),
  Retrofit ✓, DataStore ✓, Room ✓, Keystore ✓, Testing ✓, WorkManager 2, Ditto ✓,
  signing 3. Empty state "Không tìm thấy nội dung nào." verified with junk query.
- no dead Ch05/06/07/08/09/11 monolith routes: truth-check asserts dist has exactly
  48 live routes + 8 meta-refresh redirect dirs; ch07 legacy URL meta-refreshes to
  `ditto-offline-first-case-study` (verified by curl).

## Lesson header / reading stats

- Breadcrumb: Khoá học / stage-context / title.
- Chips (no book numbering): core = stage-name chip + `Bài x/y` (stagePosition/
  stageTotal from lessonStats; live probe "Jetpack Compose" + "Bài 3/5"); optional =
  "Mở rộng — không bắt buộc" + "Mở rộng" + Bài x/y; appendix = "Phụ lục — tham khảo" +
  "Tài liệu tra cứu", **no** Bài x/y chip.
- Prev/next and "Nên học xong <prev>" show titles only (no book numbers); the Kodeco
  book-chapter reference remains only in "Nguồn tham chiếu" (pedagogical citation).
- Within-lesson "Mục x/y" counters untouched (lesson template feature, verified in
  full-page captures 03/06).

## Model B-lite UI regression

- toggleDone storage-guard, quiz-attempts key, seed-done→attempts inside
  getDoneSlugs: untouched (progress.ts diff = none this workstream).
- core denominator 39 (hero % = coreProgress); optional does not alter core %
  (scenario F: +2 optional → still 100% core, terminal stays).
- appendix not required (never in nextLesson order).
- progress_g_audit: **79 pass / 0 fail**.
- UI regression check on lesson page: rapid-toggle ×6 with no quiz submit → done
  count stays 0 (gating intact), 0 page errors.

## Count truth-check

- registry: 48 entries parse-check (foundation 2 / android 14 / compose 5 / state 5 /
  navigation 2 / network 3 / data 6 / realworld 2 / optional 6 / appendix 3).
- rendered: dist walk = 48 live route dirs + 8 meta-refresh dirs; homepage
  9 stage-cards match registry totals per stage; 45 lesson-rows + 3 ref-rows.
- script result: `node scripts/check_counts.mjs` → **TRUTH-CHECK PASS — 0 lệch**
  (47 PASS lines; exit 0; also asserts sidebar has 10 module groups, no `.num`
  badges, aria-current present, Bài x/y spot-checks C3 3/5 · F1 1/2 · O4 4/6 ·
  AP3 none, and legacy strings "22 chương"/"42 pages"/"Module 2 ·"/"Chương 5" absent).

## Responsive

1440px desktop, 1180/1024 tablet breakpoints, 390px mobile, 340px stress —
`scrollWidth − clientWidth = 0` on every captured surface (programmatic probe plus
screenshots). Stage strip collapses 2-col → 1-col; stage-head wraps; lesson rows
keep 26px mark column on mobile; drawer covers content with overlay + shadow.

## Light / dark

Captured: home light/dark desktop, lesson light/dark, home 390 dark. Theme via
prefers-color-scheme + localStorage toggle; dark surfaces use token pairs
(--surface/--on-surface family), marks and chips remain visible in dark
(judged: 02-home-dark, 04-lesson-core-dark, 27-home-390-dark all PASS).

## Accessibility

- skip link, `lang="vi"`, single h1 per page (live-probed).
- status not color-only: strip states carry sr-only text ("đang học" etc.), marks
  use shape/icon (check/dot/ring), current lesson has aria-current="page" + inset bar.
- search: input aria-label, results `role="listbox" aria-label="Kết quả tìm kiếm"`,
  keyboard nav + Esc; drawer: aria-label "Chương trình học", menu button aria-label,
  visibility:hidden when closed (removed from tab order).
- `:focus-visible` rings in 10 style rules; theme toggle has dynamic aria-label.
- 10 `:focus-visible` rules verified by grep; no color-only status anywhere.

## Runtime states

Browser scenarios via Playwright (system Chrome), report `.h-shots/report.json`:
- A fresh: resume "Bắt đầu từ đây" F1, 0%, all strip todo (foundation active).
- B 2-done: 5%, resume A1 "Tiếp tục học", foundation done + android active.
- C 20-done: 51%, resume = 21st core, compose active.
- D +attempt on #21: identical resume (attempt ≠ done) ✓.
- E 39/39: 100%, terminal visible, resume hidden, 39 done rows, all strip done.
- F +2 optional: terminal stays, 41 rows.
- G all 45: terminal stays, 45 rows.
- Sidebar states: no completion (0/2), mixed, active incomplete/complete, optional
  active, appendix active, all core complete — all rendered from the same
  getDoneSlugs() pipeline; 0 console errors across the whole run (23 screenshots).

## Adversarial review

Independent judge review on rendered captures (PNG/JPEG under `.h-shots/`):
19/19 pages **PASS** — homepage full-page (9 stage cards, 45 lesson rows, 3 ref rows),
scenario B/C/D/E/F/G, search popover (12 hits "compose"), lesson core light/dark,
optional, appendix, sidebar expanded, drawer open/expanded/scrolled, home 390/340/
dark. 0 BLOCKER / 0 MAJOR; the only MINOR was an unexpanded-drawer capture framing,
immediately re-captured (j-23b) and re-judged PASS.

Programmatic adversarial probes (beyond visuals):
1. blocked localStorage (SecurityError proxy): 0 page errors, page renders, 0%,
   resume visible — graceful degradation ✓.
2. corrupt storage (non-JSON): 0 errors, 0% ✓ (progress.ts catch-all holds).
3. 200 ghost slugs + 2 real: pct = 2/39 = 5%, only 2 rows marked — no fabricated
   credit ✓ (no-fabricate §D respected at UI layer).
4. rapid toggle ×6 without quiz submit: done stays 0 (Model B-lite gating) ✓.
5. search empty-state, Arrow+Enter navigation (landed on
   /chapters/ch08-retrofit-moshi-json/), Ctrl+K focus ✓.
6. 404 hunt across all captured surfaces: the only 4xx was the probe script's own
   wrong slug (ch01-hello-android), fixed in the script; zero 404s from the site.

Repair loop: 1 fix committed (`1d76707`, terminal-state precedence), rebuilt,
truth-check re-run PASS, scenario E/F/G re-verified.

Result: **WORKSTREAM_H_ADVERSARIAL_PASS — 0 BLOCKER / 0 MAJOR.**

## Build / Astro / quiz/progress regression

- `npm run build`: PASS, 49 pages (48 live + 1 error-free build), 0 build errors.
- `npx astro check` (local, --no-install): **0 errors / 0 warnings / 67 hints**
  (hint delta = 0 vs baseline 67).
- quiz audit (45 files): **45 PASS** (char-rank balance intact).
- progress_g_audit: **79 pass / 0 fail**.
- check_counts: **PASS — 0 lệch**.
- 48 live units, SCHEMA_VERSION 13, SPLIT_MAP 14, redirects 8 (counted from source;
  ch07 redirect live-verified meta-refresh → O1).

## Deviations

1. **~22 giờ vs "~17 giờ"** in the brief text: displayed value is derived from
   lessonStats (1305 core minutes → 22h). Kept per brief §34 (display stats honestly,
   do not trim content) and §50 (counts must be derived). Documented as spec-estimate
   delta, not a content change.
2. "Navigation" search query previously returned 0 (Vietnamese prose "điều hướng");
   IMP-081 added slug tokens to lesson-row keys → 2 hits. Intentional improvement,
   documented in cap-decision comment.
3. Sidebar has 10 module groups (appendix included) — earlier drafts assumed 9;
   appendix pages exist and deserve navigation. check_counts asserts 10.

## Findings

- blocker: none.
- major: none.
- minor: (1) pre-review terminal-state precedence bug — found by scenario E probe,
  fixed in `1d76707`, re-verified; (2) judge-capture MINOR on drawer-expanded frame —
  re-captured, PASS. Both closed.

## Gate verdict

**GATE PASS** — all PASS REQUIREMENTS of brief §53 satisfied:

- Homepage: new architecture visible, 39/6/3 truth, foundation+7 stages, optional
  separate, terminal works, resume correct, old Section II removed ✓
- Sidebar: 5.1-style identity removed, stage hierarchy obvious, statuses distinct
  and not color-only, optional/reference distinct, long titles wrap, desktop/mobile
  consistent, internal numbering intact in data, no layout-shift regression ✓
- Search: full scope indexed, no dead routes, useful context labels, cap documented,
  old queries work ✓
- Stats: stage context + Bài x/y, Mục x/y preserved, no book-style primary identity ✓
- Counts: registry-derived, truth-check PASS, no stale global count ✓
- Progress: Model B-lite unchanged, denominator 39, optional outside core %,
  appendix not required ✓
- Visual: professional hierarchy, desktop/mobile, light/dark, 390 pass, no overflow,
  accessible states ✓
- Regression: 48 units / 45 quizzes / schema 13 / SPLIT_MAP 14 / redirects 8 /
  build PASS / astro 0-0 / hint delta 0 ✓
- Adversarial: WORKSTREAM_H_ADVERSARIAL_PASS, 0 BLOCKER / 0 MAJOR ✓
- Git: clean, **not pushed** ✓
