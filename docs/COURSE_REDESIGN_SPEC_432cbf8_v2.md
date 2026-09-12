# Course Redesign Specification — v2 (Consistency Pass)

**Course:** "Học Android bằng tiếng Việt cho người mới" (Android/Kotlin/Jetpack Compose)
**Baseline:** `432cbf8` | **Date:** 2026-09-03
**Inputs (binding contract):** Content Quality Review · UI/UX Learning Experience Review · Android 2026 Curriculum Benchmark · Master Course Review · Redesign Spec v1 (consistent with all prior conclusions; this v2 only resolves internal inconsistencies and corrects arithmetic/structure).

**Nature:** target-state design specification. No repository changes, no lesson/quiz text, no CSS/HTML/Astro, no mockups, no implementation tickets. The redesign direction is unchanged; see the Consistency Change Log (§27) for exactly what was corrected.

---

## 1. Target Vision

A **Vietnamese-first, beginner-scoped, stage-structured course** in which every lesson respects the same editorial standard, every concept is taught before or at the moment it is used, **every lesson = one coherent learning job** (một phiên học trọn vẹn — *duration is a planning signal only, not an acceptance gate*: "không cắt vì dài" owner rule 2026-09, §3 principle 4; the earlier "~25 minutes / 30-min cap" phrasing below is HISTORICAL DESIGN), and a graduate can independently build a small phone-first Compose app — without the course becoming an "everything Android" encyclopedia.

**Structure language (corrected):** the course is delivered as **NỀN TẢNG (required preparation, 2 Kotlin lessons) + 7 GIAI ĐOẠN CHÍNH (37 lessons)**. The foundation is a mandatory preparation block but is *not* numbered as one of the seven main Android learning stages. Homepage, roadmap, progress, and summary wording all use this framing consistently (§16, §21).

The redesign is a **correction-and-completion project, not a rebuild** (identical to v1):

- 4 Master P0 items fixed as defects (quiz bias, desktop TOC, navigation gap, security-crypto mis-teaching).
- 7 monolith chapters + overlong split lessons re-sliced to the course's own size standard (MR-006/007/008) — content ported, not rewritten.
- Missing foundations added in the smallest effective form (Kotlin primer, coroutine mental model, navigation, a11y mini, Coil/lifecycle-aware-collection glosses).
- 16-item strength register (Master §10) = hard "do not regress" contract.
- Optional depth (testing, adaptive UI, WorkManager, migrations, Ditto case study, Gradle release material) leaves the main path.

**One-sentence promise (unchanged):** *"Học xong phần lõi, bạn tự xây được một app Android nhỏ (phone-first) bằng Kotlin + Jetpack Compose với state, kiến trúc, điều hướng, mạng và lưu trữ hiện đại — và biết đọc code thật một cách phê phán."*

---

## 2. Target Learner Outcome

**CORE OUTCOME (guaranteed at the end of the core path — 2 foundation + 37 main-stage = 39 lessons):**

A learner can, independently:

1. **Read and write Kotlin** at the level needed for Compose: functions, classes/data classes, nullability, basic collections and operations (`map`/`filter`), lambdas and function types, `by` delegation, sealed-state recognition (F1–F2).
2. **Build a Compose UI** for a phone: layouts, Modifier, lists, Material 3, theming, previews, forms, with correct mental models of state, recomposition, hoisting and UDF (C1–C4).
3. **Apply accessibility fundamentals as part of normal UI work**: `contentDescription` on meaningful icons/images, touch targets ≥48dp, font scaling, contrast, and the existence of Compose semantics (C5 — core-lite, small foundation).
4. **Architect the app** with layered separation (UI – business – data), ViewModel exposing immutable observable UI state (StateFlow), a repository boundary, and lifecycle-aware collection (S2–S5).
5. **Navigate** between screens with a type-safe route model, understand the back stack, pass arguments, and wire navigation into ViewModel/UI state (N1–N2).
6. **Do async correctly** with a working coroutine/Flow mental model: suspend, scope, dispatcher, StateFlow, collection — without advanced internals (S1, W1).
7. **Network** with Retrofit + Moshi-KSP codegen, model mapping, loading/error/empty states, and API-key hygiene (W2–W3).
8. **Persist** with DataStore (settings) and Room (structured data) via a repository; understand SQLite's model and why Room wraps it (D1–D2, R1–R4).
9. **Debug** with breakpoints, Logcat, and compiler errors; **read real code critically** — recognize dead code, drift, and the difference between docs and a codebase (throughout; signature mode in R4).
10. **Track their own learning** via the site's progress system (stage % and per-lesson completion, local-only, Model B-lite).

**OPTIONAL EXTENSION OUTCOME (optional track, 6 lessons + appendix — explicitly NOT part of the core promise):**
11. Verify behavior with at least one ViewModel unit test and one Compose UI test (O2).
12. Adapt a UI to tablets/foldables with window size classes (O3).
13. Schedule background work with WorkManager (O4); handle Room migrations (O5).
14. Understand local-first sync via the Ditto case study (O1); read Gradle release/signing material when it matters (AP1); follow a guided capstone to assemble all core skills (O6).

*(Corrected in v2: accessibility is a core outcome (C5), removed from the optional list — matching the benchmark's CORE-LITE classification and v1's own curriculum label. Testing, adaptive UI, WorkManager, and migrations remain optional.)*

**Explicit non-goals (unchanged):** advanced coroutine internals, full DI frameworks (Hilt as seam note only), full testing curriculum, CMP/XR/Wear, performance profiling, publishing a production app to the Play Store.

---

## 3. Redesign Principles

Unchanged from v1 — 12 constraints for future implementation:

1. **Concept before API** — mental model first, then the library/API that implements it.
2. **Prerequisite before usage** — nothing appears earlier than its teaching lesson unless it carries an explicit JIT gloss / forward-reference; the build should eventually lint for "used-before-taught" identifiers.
3. **One lesson = one coherent learning job** — 1–3 major concepts (typically 2).
4. **One lesson = one coherent learning job** — **chính sách owner hiện hành (thay "30-min hard cap" cũ, đồng bộ 2026-09-11):** giờ học là ước lượng planning, KHÔNG phải hạn mức — *"Không cắt vì dài. Chỉ cắt khi nội dung thừa, sai scope, trùng lặp, hoặc nên thuộc một lesson khác."* Thời lượng không tự động fail/split; wording cũ "≤ ~25–30 phút / hard cap" giữ ở đây như lịch sử. (Chi tiết: `docs/LESSON_TEMPLATE.md` đầu file + `TARGET_REGISTRY_v5.md` §2.)
5. **Optional complexity leaves the main path** — optional track/appendix hold C/D-class depth.
6. **Real code, but no unexplained dependencies** — sample-project code stays the spine; every API is taught or glossed at first use.
7. **Learner always knows where they are** — stage → lesson → section (desktop TOC + active highlight + section counter) + stage/home progress.
8. **Assessment tests knowledge, not answer-shape** — length/position balancing is a QA contract with a measurable check.
9. **Preserve depth where it teaches** — architecture doctrine, Compose state model, compile-error pedagogy, critical reading keep their depth.
10. **Vietnamese-first, independent voice** — book/`aaf-materials/` only in the single Nguồn block per lesson.
11. **Don't upgrade for novelty** — 2023-pinned toolchain retained; drift tables maintained.
12. **One standard, one experience** — one editorial standard + one lesson template across 100% of live lessons.

---

## 4. Current → Target Strategy

Unchanged from v1 (priority → target element mapping; see v1 §4 for the full table). Summary:

- **Fix first** (P0): quiz rebalance (§13), desktop TOC + wayfinding (§15/17), navigation lessons (§9), security-crypto historical reframe (§10/X2), roadmap text (A4 update).
- **Then standardize**: split monoliths + re-slice overlong split lessons onto the §12 template; voice/reference sweep; quiz format alignment — porting, not rewriting (MR-006/007/008).
- **Then foundations**: Kotlin compact primer (F1–F2), coroutine mini (S1), a11y mini (C5), Coil/`collectAsStateWithLifecycle`/`stateIn` glosses.
- **Then optional**: testing, adaptive, WorkManager, migrations, Ditto case study, capstone, Gradle appendix — explicit track, off the main path.

---

## 5. Proposed Course Architecture (stage count corrected)

```text
NỀN TẢNG  (required preparation — NOT a numbered stage; part of the core path)
  F1–F2  Kotlin đủ để học Compose
        │
        ▼
GIAI ĐOẠN 1  ANDROID CƠ BẢN       A1–A14   (14 lessons)
GIAI ĐOẠN 2  JETPACK COMPOSE       C1–C5    ( 5 lessons, incl. C5 a11y core-lite)
GIAI ĐOẠN 3  STATE & KIẾN TRÚC     S1–S5    ( 5 lessons, incl. S1 coroutine foundation)
GIAI ĐOẠN 4  ĐIỀU HƯỚNG            N1–N2    ( 2 lessons — NEW)
GIAI ĐOẠN 5  MẠNG                  W1–W3    ( 3 lessons)
GIAI ĐOẠN 6  DỮ LIỆU CỤC BỘ        D1–D2, R1–R4 ( 6 lessons)
GIAI ĐOẠN 7  REAL-WORLD / NÂNG CAO X1–X2    ( 2 lessons)
        │
        ▼
OPTIONAL TRACK  O1–O6   (6 lessons)  ·  APPENDIX  AP1–AP3  (3 reference sections)
```

**Counts (verified):** 7 main stages; 37 main-stage core lessons; 2 foundation lessons (core, unnumbered); 39 total core; 6 optional; 3 appendix sections. Total learner-facing lessons (core + optional) = **45**; total units including appendix = **48**.

Why this shape (unchanged rationale): stages mirror the existing strength block (Ch01–03 split) plus a compact Kotlin foundation ahead of it; Compose = Ch05 re-sliced; State & Architecture = Ch06 + Ch10.1/10.3 doctrine with the coroutine mini dropped in **before** ViewModel/StateFlow; Navigation placed after architecture and before networking (the Ch08 sample's `MainActivity` contains the NavHost the learner meets next); Networking/Local Data/Real-world = existing content re-sliced with fixes.

---

## 6. Target Curriculum

Identical lesson set and order to v1 (no lesson added, removed, or reordered by this consistency pass — only wording about classification/time is corrected where noted). Prefixes: F (foundation), A/C/S/N/W/D/R/X (core stages 1–7), O (optional), AP (appendix).

| Order | Stage | Lesson / Topic | Existing Source | Action | Core/Optional | Target Time *(HISTORICAL DESIGN ESTIMATE — planning signal, not an acceptance gate; owner rule 2026-09 "không cắt vì dài", §3)* | Why |
|---|---|---|---|---|---|---|---|
| F1 | Foundation (prep) | Kotlin đủ để học Compose — Phần 1: biến, hàm, null safety, collections, lambda/function types | NEW (harvests Ch01–03 glosses) | NEW | Core (prep) | 25 min | MR-011 |
| F2 | Foundation (prep) | Kotlin đủ để học Compose — Phần 2: data class, `by`, sealed-state concept, generics recognition | NEW (Ch03.2 `by`, Ch10 data class, Ch10.4 sealed note) | NEW | Core (prep) | 25 min | MR-011 |
| A1 | 1 · Android Basics | Chương 1.1 — Android & Kotlin | Ch01_1AndroidVaKotlin | KEEP | Core | 20 min | sandbox model |
| A2 | 1 | Chương 1.2 — App components | Ch01_2AppComponent | KEEP | Core | 15 min | IoC |
| A3 | 1 | Chương 1.3 — Manifest & resources | Ch01_3ManifestResources | KEEP | Core | 25 min | icon trace |
| A4 | 1 | Chương 1.4 — Gradle & bản đồ học tập | Ch01_4GradleVaBanDo | KEEP+UPDATE | Core | 25 min | **roadmap table + version updates only** (no codename claim exists in Ch01.4 — verified) |
| A5 | 1 | Chương 2.1 — Cài đặt & tạo project | Ch02_1CaiDatVaTaoProject | KEEP | Core | ~30 min (ước lượng) | **no codename correction needed — verified accurate (dessert naming past; animal naming present)** |
| A6 | 1 | Chương 2.2a — Chạy thử: máy ảo & máy thật | Ch02_2 (first half) | SPLIT | Core | 25 min | MR-008 |
| A7 | 1 | Chương 2.2b — Giải mã project mẫu | Ch02_2 (second half) | SPLIT | Core | 25 min | MR-008 |
| A8 | 1 | Chương 2.3 — Chạy app & cập nhật | Ch02_3ChayAppVaCapNhat | KEEP+UPDATE | Core | 25 min | **the ONLY codename-correction site — Ch02.3 line 365 false claim** |
| A9 | 1 | Chương 3.1 — Activity & giao diện | Ch03_1ActivityVaGiaoDien | KEEP | Core | ~30 min (ước lượng) | setContent boundary |
| A10 | 1 | Chương 3.2a — String resource & preview | Ch03_2 (first half) | SPLIT | Core | 25 min | MR-008 |
| A11 | 1 | Chương 3.2b — Đọc lỗi & debug (compile-error pedagogy) | Ch03_2 (second half) | SPLIT | Core | 30 min | S-03 whole |
| A12 | 1 | Chương 3.3 — Manifest, intent, permission | Ch03_3ManifestIntentPermission | KEEP | Core | 25 min | traps |
| A13 | 1 | Chương 3.4 — Theme & dark mode | Ch03_4ThemeVaDoiChieu | KEEP | Core | 25 min | drift table |
| A14 | 1 | Gradle cho người mới: dependency, version catalog, BOM | Ch04 (core content) | REDUCE (~7 of 15 sections) | Core | 25 min | MR-034 |
| C1 | 2 · Compose | Composable & layout đầu tiên | Ch05 (composable/layout) | SPLIT | Core | 25 min | crown |
| C2 | 2 | Modifier & danh sách (LazyColumn, key) | Ch05 (modifier/list) | SPLIT | Core | 25 min | ordering, key |
| C3 | 2 | Material 3 & theming trong Compose | Ch05 + Ch03.4 Compose side | SPLIT | Core | 25 min | M3 tokens |
| C4 | 2 | Preview & vòng đời composable (LaunchedEffect intro — JIT gloss, forward-ref S1) | Ch05 (preview/effects) | SPLIT | Core | 25 min | side-effect first touch |
| C5 | 2 | Tiếp cận mọi người dùng: a11y cơ bản | NEW | NEW (SMALL FOUNDATION) | **Core-lite** | 20 min | MR-024 |
| S1 | 3 · State & Arch | Coroutines: 20 phút đủ để không sợ (suspend, scope, dispatcher) | NEW (harvests Ch08 coroutine part + Ch10.3 precision) | NEW (TEACH EARLIER) | Core | 20 min | MR-012 |
| S2 | 3 | State trong Compose: remember, mutableStateOf, recomposition | Ch06 (state part) | SPLIT | Core | 25 min | S-02 |
| S3 | 3 | State hoisting & UDF | Ch06 (hoisting/UDF) | SPLIT | Core | 25 min | UDF |
| S4 | 3 | ViewModel & UI state (StateFlow; **collectAsStateWithLifecycle taught**) | Ch06 (ViewModel/state) | SPLIT+UPDATE | Core | 30 min | MR-013/MR-028 |
| S5 | 3 | Kiến trúc app: UI tầng – data tầng – repository | NEW (harvests **Ch10.1 five-layer doctrine + Ch10.3 repository WHY**) | NEW (SPLIT+REORDER) | Core | 25 min | repository before networking |
| N1 | 4 · Navigation | Điều hướng: destination, NavHost, di chuyển giữa màn hình | NEW | NEW (CORE) | Core | 25 min | MR-009 |
| N2 | 4 | Back stack & truyền dữ liệu type-safe | NEW | NEW (CORE) | Core | 25 min | MR-009; Nav 3 note |
| W1 | 5 · Network | Coroutines & Flow đầy đủ | Ch08 (coroutine/Flow) | SPLIT | Core | 30 min | S1 deepened |
| W2 | 5 | Retrofit & JSON (Moshi-KSP) — **Coil/AsyncImage glossed at first use** | Ch08 (Retrofit/Moshi) | SPLIT | Core | 30 min | benchmark §9 |
| W3 | 5 | Trạng thái mạng: loading, error, empty & API key | Ch08 (states/keys) | SPLIT+UPDATE | Core | 25 min | MR-015/027 |
| D1 | 6 · Local Data | DataStore & SharedPreferences legacy | Ch09 (mapping) | SPLIT | Core | 30 min | S-07 |
| D2 | 6 | Prefs trong app: CompositionLocal & ViewModel wiring (+ Hilt seam note) | Ch09 (integration) | SPLIT | Core | 30 min | MR-037 |
| R1 | 6 | Vì sao cần database (SQLite model; cross-ref S5) | Ch10_1RoomLaGi | KEEP (reorder ref) | Core | 25 min | Room motivation |
| R2 | 6 | Room: Entity, DAO, Database | Ch10_2EntityDaoDatabase | KEEP | Core | 30 min | compile-time SQL |
| R3 | 6 | Repository & ViewModel với Room | Ch10_3RepositoryViewModel | KEEP | Core | 25 min | 3 model families |
| R4 | 6 | UI với Room: swipe-delete & Cạm bẫy (**full LaunchedEffect depth here after C4 intro**) | Ch10_4GiaoDienVaCamBay | KEEP | Core | 25 min | deviation table |
| X1 | 7 · Real-world | Files, Storage Access Framework & backup | Ch11 (files/SAF/backup) | SPLIT | Core | 30 min | modern SAF |
| X2 | 7 | Mã hoá: Keystore, SQLCipher & các API đã lỗi thời (ESP = HISTORICAL-REF) | Ch11 (encryption) | SPLIT+HISTORICAL-REF | Core | 30 min | MR-003 |
| O1 | Optional | Case study: Ditto & offline-first (concepts) | Ch07 (concepts) | REDUCE | Optional | 30 min | MR-033 |
| O2 | Optional | Testing: test ViewModel & một test UI | NEW | NEW | Optional | 45 min | MR-023 |
| O3 | Optional | Adaptive UI: tablet & foldable (window size classes) | NEW | NEW | Optional | 30 min | MR-036 |
| O4 | Optional | WorkManager: công việc nền hiện đại | NEW (extends Ch03.3 survey) | NEW | Optional | 30 min | MR-026 |
| O5 | Optional | Room migration đầu tiên | NEW (extends R2) | NEW | Optional | 30 min | MR-025 |
| O6 | Optional | Capstone hướng dẫn: app ghi chú của bạn | NEW (assembles all stages) | NEW | Optional (recommended) | 90 min (project) | target outcome |
| AP1 | Appendix | Gradle nâng cao: signing, keystore, minify | Ch04 (release depth) | MOVE | Appendix | — | MR-034 |
| AP2 | Appendix | Ditto SDK API deep-dive | Ch07 (Ditto-specific) | MOVE | Appendix | — | MR-033 |
| AP3 | Appendix | Bảng tra cứu nhanh (versions, commands, glossary) | Various (drift tables) | MOVE | Appendix | — | S-05/06 |

Notes: A4/A5 rows corrected per evidence (see Consistency Change Log row 3). C5 (a11y) is core-lite. Intentional reinforcement (not duplicates): LaunchedEffect intro at C4 → full depth at R4; repository concept taught at S5 → used at R3; keys.properties taught at W3 → forward-referenced at A14; `stateIn`/`collectAsStateWithLifecycle` taught at S4 → reinforced at W1/D1.

**Time sum check (§21):** core min = 1005 (≈16h45m); optional min = 255 (≈4h15m); total ≈ 21h. **→ HISTORICAL DESIGN ESTIMATE** (tổng target-time mỗi unit tại thời điểm viết spec, KHÔNG phải thời gian đã verify trên sản phẩm). Current verified product time (derive từ lessonStats, hiển thị trên homepage): **lõi ≈ 22 giờ · tổng gồm optional ≈ 26 giờ** — xem FINAL VERIFIED COUNTS ở §21.

---

## 7. Kotlin Foundation Design

Unchanged from v1: two compact lessons (F1, F2), ~50 min, "Kotlin đủ để học Android Compose" — **not a full Kotlin course**.

- **MUST include:** val/var + types + inference; functions/params/returns (expression body, default/named args); nullability (`?`, `?:`, `?.`) with Android-relevant examples; basic collections + first `map`/`filter`/`joinToString`; lambdas & trailing lambdas; function types `(T) -> R`; `by` delegation with the Compose payoffs (`by remember`, `by preferencesDataStore`); data classes (equality/copy/destructuring); sealed-class concept ("one type, known variants", 6-line example); generics *recognition* (`List<T>`, `MutableStateFlow<T>`).
- **Stay JIT:** extension functions, scope functions — gloss at first real use; higher-order vocabulary beyond function types; `when` (already glossed at Ch02).
- **NOT here:** operator overloading, inheritance deep-dive, collections API breadth, stdlib tour, coroutine internals — coroutine mental model lives at S1 (§8), not in the foundation.

**Verify-criterion (unchanged):** after F1+F2 a learner can name every Kotlin construct in a 30-line Compose file.

---

## 8. Coroutine / Flow Sequencing

Unchanged from v1 — the designed progression, verified against the prerequisite contract:

```text
F1–F2   no coroutines
A-stage no coroutines
C4      LaunchedEffect first touch — explicit JIT gloss + forward-ref "sẽ học chi tiết ở S1" (permitted by Principle 2)
  ↓
S1      COROUTINES: 20 phút đủ để không sợ (suspend/scope/dispatcher at concept level)   ← NEW, before any ViewModel/StateFlow
  ↓
S4      ViewModel & UI state — now fully prepared (viewModelScope, StateFlow, collectAsStateWithLifecycle)
W1      Coroutines & Flow đầy đủ — deepens (Flow operators, structure)
R2/R4   suspend/DAO semantics — reinforcement (existing precision kept)
```

**Minimum mental model before S4 (the contract, unchanged):** (1) suspend = "tạm dừng rồi tiếp tục, không chặn thread"; (2) scope knows when to cancel (viewModelScope = gắn với ViewModel); (3) dispatcher decides the thread, `withContext(IO)` đổi thread khi cần; (4) Flow/StateFlow = "dữ liệu chảy, UI lắng nghe". Nothing beyond this before architecture material.

**Not in S1 (unchanged):** structured-concurrency internals, cancellation contracts, supervisor jobs, Flow operators beyond `collect`/`stateIn`-mention.

**Verified ordering:** no `StateFlow`/`viewModelScope`/`collectAsStateWithLifecycle` appears before S1/S4; no repository before S5; no Retrofit before W2; no DataStore before D1; no Room before R1; no NavHost use without N1–N2.

---

## 9. Navigation Design

Unchanged from v1: new Stage 4 (Điều hướng), two core lessons (25 min each), positioned after State & Architecture and before Networking. N1: destination/route, NavController vs NavHost, `navigate(route)`, back stack as mental picture. N2: back behavior/popBackStack, argument passing via the **type-safe route model**, one warning callout ("don't stash objects in the back stack"), plus a single forward-note on Navigation 3 (stable 2026) in the drift table — teach Nav-2-style type-safe for sample compatibility. Also honors the old roadmap's "Chương 7: Điều hướng" promise; A4's roadmap table is updated to point to Stage 4 (A4 retains its legitimate roadmap/version updates; it carries no codename claim).

---

## 10. Existing Chapter Treatment

Unchanged from v1 (full bucket-level tables in v1 §10; summary below). Verified against the Current→Target map (§20) and Boundaries (§23).

| Chapter | Treatment | Core lessons it becomes |
|---|---|---|
| Ch01 | KEEP (split) | A1–A4 |
| Ch02 | KEEP + SPLIT 2.2 | A5–A8 |
| Ch03 | KEEP + SPLIT 3.2 | A9–A13 |
| Ch04 | REDUCE core (A14) + MOVE release depth (AP1) | A14 (+AP1) |
| Ch05 | SPLIT | C1–C4 |
| Ch06 | SPLIT + UPDATE (collectAsStateWithLifecycle, stateIn) | S2–S4 |
| Ch07 | REDUCE: **repository/local-first concepts (from Ch10.1/10.3 doctrine — see note) + Ch07 case value → S5/O1**; Ditto API → AP2 | (contributes O1, AP2) |
| Ch08 | SPLIT + UPDATE (states, keys, Coil gloss; NavHost ref → N1/N2) | W1–W3 |
| Ch09 | SPLIT | D1–D2 |
| Ch10 | KEEP + REORDER (5-layer doctrine → S5) + optional O5 | R1–R4, (S5), O5 |
| Ch11 | SPLIT + HISTORICAL-REF (ESP) | X1–X2 |

*(Clarification added in v2: S5 is built from the **Ch10.1 five-layer doctrine + Ch10.3 repository WHY** — existing course content, reordered earlier — and serves both the Ch08-era need (repository used in networking) and the Ch10-era need (repository toward Room). Ch07's own repository-vs-live-engine case study lives in O1; S5 is not a Ch07 split. This removes the v1 ambiguity where "Ch07 concepts → S5 + O1" conflated two sources.)*

Ch11 storage detail (unchanged): ESP/security-crypto = HISTORICAL-REF ONLY — "đã deprecated (4/2025), không dùng cho app mới; giữ để đọc project mẫu cũ; so sánh với Keystore/DataStore" — never silently deleted because the sample project still contains it.

---

## 11. Optional Modern Android Track

Unchanged from v1 with one wording fix: accessibility is **not listed as optional here** — it is core-lite (C5) inside Stage 2. This section lists only true optional/appendix classes:

| Topic | Classification | Form | Notes |
|---|---|---|---|
| Testing (unit + Compose UI + fakes) | OPTIONAL LESSON — O2 | 1 lesson ~45 min | MR-023; readiness, not comprehension |
| Adaptive UI / window size classes | OPTIONAL LESSON — O3 | 1 lesson ~30 min | MR-036; D-class for this scope |
| WorkManager / background | OPTIONAL LESSON — O4 | 1 lesson ~30 min | MR-026; extends Ch03.3 survey |
| Room migration | OPTIONAL LESSON — O5 | 1 lesson ~30 min | MR-025 |
| Ditto case study | OPTIONAL LESSON — O1 + APPENDIX AP2 | concepts lesson + API appendix | MR-033 |
| Capstone | OPTIONAL LESSON — O6 | 90-min guided project | target outcome §2 |
| Gradle release material | APPENDIX — AP1 | reference | MR-034 |
| `stateIn`, Nav 3, Hilt seam, error-to-user | inline notes/callouts in core lessons | XS additions | MR-028/035/037/027 |

The optional track is visually separated on the site ("Mở rộng" badges; dashed cards) so learners can ignore it without losing the path.

---

## 12. Lesson Template

Unchanged from v1. Target anatomy (from the strongest split lessons — Ch10.2/Ch03.2 pattern):

```text
 1. Orientation        breadcrumb + chips (stage, "Lõi"/"Mở rộng", time, phần x/y mục)
 2. Mục tiêu           goals callout, actionable verbs, ≤5 items, each covered by ≥1 quiz question
 3. Vì sao cần         why-it-matters block (2–3 sentences)
 4. Mô hình trực quan  mental-model callout — one analogy per new abstract concept
 5. Ví dụ nhỏ          minimal snippet (≤ ~15 lines) before the real file
 6. Bối cảnh project   real code located: file → class/function → role
 7. Đọc code           per-line explanations; numbered comments; no unexplained dumps
 8. Cạm bẫy            traps section — 1–2 traps normally, MAX 3 (more ⇒ split)
 9. Checkpoint         "Kiểm tra nhanh" — 1 inline pause-and-think 2–3 sections in
10. Tóm tắt            numbered key points
11. Luyện tập          1 exercise (build/observe, `<details>` self-check); max 2
12. Nguồn tham khảo    single block: book chapter + aaf-materials paths + lines ONLY
```

**Hard parameters (updated 2026-09-11 — owner policy):** giờ học 15–25 min chỉ là **ước lượng planning** (không còn hard cap — "không cắt vì dài; chỉ cắt khi nội dung thừa, sai scope, trùng lặp, hoặc nên thuộc một lesson khác"); 1–3 major concepts (2 typical); 3–8 code blocks, default snippet ≤ ~35 lines (≤ ~60 with explicit "why whole file"); ≤4 callouts per lesson; ≥1 checkpoint above ~1,200 words; exactly one Nguồn block; version-note callout whenever a shown API is not current, "nên theo" column retained; deprecated APIs use the Historical callout; Vietnamese-native standalone voice (no "sách nói…/chapter này/tác giả" outside Nguồn).

---

## 13. Assessment Model

Unchanged from v1 (the P0 contract):

- **Questions:** 8–12 per normal lesson (19-q quizzes disappear with the monolith split; 15/16-q split quizzes re-balance to ≤12; 7-q Ch10.1 rises to ≥8).
- **Options:** exactly 4 per question.
- **Distractor rules:** real, plausible, same-family errors from the lesson's traps; no "all of the above/none"; every distractor's wrongness stated in the explanation.
- **Answer-length balancing:** per-quiz check — no axis (correct-longest or correct-shortest) above ~40%; hard fail at any quiz where ≥60% of correct answers share the same length rank; manual pass for subtle cases; becomes a written QA step; automated lint as a design note.
- **Correct-position balancing:** keep the existing uniform a/b/c/d rotation.
- **Mix:** ~30% recall / 40% apply / 20–30% code-reading; keep "break-the-code" exercises.
- **Explanations:** 100% coverage, correct + why each distractor is wrong (S-15 preserved).
- **Exercises:** 1–2 per lesson; monolith exercises ported to the owning split lessons.
- **Quiz UX:** "Câu X/N" header; 2-column grid on wide screens; fieldset correct/incorrect tints; score scrolled into view; `aria-live` announcement; explicit "Làm lại" with confirm; resubmit no longer silent (MR-016/017).
- **Completion link:** any quiz submit sets the local "quiz đã làm" flag used by §14 Model B-lite.
- **Harness note:** centralize the 22 duplicated scoring scripts during implementation (reduces drift; behavior contract unchanged).

---

## 14. Completion Model

Unchanged from v1: **Model B-lite** recommended.

- Completion = explicit learner confirmation **and** ≥1 quiz attempt (local flag, no threshold).
- Copy: "Đánh dấu đã học khi bạn đã đọc hết bài và thử làm quiz (không cần đúng hết)."
- Subtle "chưa làm quiz" hint on lesson/home card (low-key).
- Local-only storage retained; `SCHEMA_VERSION` v5 (historical design-stage expectation) with full slug audit covering every renamed/merged slug from the split (SPLIT_MAP extended). Current product truth: `SCHEMA_VERSION` = **13** (see FINAL VERIFIED COUNTS in §21).
- Optional stretch (P2, not part of the gate): best quiz score stored locally per lesson.

Model A rejected (ambiguous), Model C rejected (punitive for self-study).

---

## 15. Target Website Learning Experience

Unchanged from v1, with the stage-count wording fixed (7 stages + foundation):

| System | KEEP / MODIFY / NEW | Design |
|---|---|---|
| Homepage | MODIFY | Stage-based roadmap (§16); "Nền tảng + 7 giai đoạn" framing; core/optional separated; keep hero + stats (recomputed), resume card, progress panel |
| Curriculum roadmap | NEW | 7-stage journey + per-stage progress + "next up" pointer; core vs optional classes |
| Sidebar | MODIFY | Stage groups replace flat module list; optional/appendix collapsed by default; keep states |
| Lesson header | KEEP | Chips (stage, core/optional, time), H1, summary, stats |
| Reading stats | MODIFY (minor) | Keep derived stats; add stage + "phần x/y" context |
| Lesson body | MODIFY | §12 template + checkpoint; giờ học chỉ là ước lượng hiển thị (owner rule 2026-09: không cắt vì dài — không còn hard cap) |
| TOC | MODIFY | Desktop sticky rail restored + active highlight + "Mục x/y" (§17); mobile card kept |
| Code blocks | MODIFY (minor) | File path + line range in header; lang/copy/theme-safe dark kept; long-snippet expand/collapse; output variant (§18) |
| Callouts | MODIFY | 6-family hierarchy (§19); caps on stacked warnings |
| Checkpoints | NEW | Compact inline "Kiểm tra nhanh" component |
| Quiz | MODIFY | §13 contract |
| Progress | MODIFY | §14 Model B-lite; per-stage progress; "chưa làm quiz" hint; keep all surfaces |
| Search | KEEP | Add stage labels; revisit top-12 cap with route growth (forward) |
| Mobile navigation | KEEP | Drawer + overlay + focus unchanged; TOC card unchanged |
| Dark/light | KEEP | Both flows; light theme verification pass (MR-031) |

---

## 16. Homepage & Roadmap

**Stage framing (corrected):** the homepage communicates **"NỀN TẢNG (2 bài, bắt buộc) + 7 GIAI ĐOẠN CHÍNH (37 bài)"** — the foundation is required preparation, not an eighth stage.

**Homepage anatomy (corrected stats):**
1. Hero: title + one-sentence promise; stat chips — **"2+7 nền tảng + giai đoạn · Bài học lõi 39 · Bài mở rộng 6 · Giờ học lõi ~22"**, with the sub-note "gồm 2 bài nền tảng Kotlin bắt buộc trước khi vào 7 giai đoạn chính". *(Số giờ luôn derive từ registry/lessonStats — hiện hành là ~22 giờ lõi (2026-09-11); "~17" ghi ở bảng reconcile mục 21 là ước lượng planning tại thời điểm viết spec, giữ như lịch sử.)*
2. "Bạn đang ở đâu" — 7-segment stage progress strip (+ the foundation block shown completed once F2 done), current stage callout.
3. Resume card: next un-done lesson with stage label ("Tiếp tục từ Stage 3 · S4 ViewModel & UI state"; or "Hoàn thành Nền tảng trước" for new learners).
4. Roadmap: 7 stage cards in journey order, preceded by a small "Nền tảng" card (F1–F2); each lists lessons (core first, optional dashed); stage bar + N lessons + total minutes.
5. Optional track section "Mở rộng (không bắt buộc)" — dashed styling.
6. Progress panel keeps the local-storage note + per-stage breakdown.
7. Terminal state mirrors current "Xem lại chương cuối".

**Conceptual resolution of "11 chương vs 22/42 parts" (unchanged):** stage-and-lesson primary framing; chapters remain secondary metadata ("Stage 6 — Dữ liệu cục bộ (Chương 9–10 của sách)"); the book-chapter count moves to the appendix glossary.

---

## 17. Lesson Wayfinding

Unchanged from v1 (fixes MR-004/018):

- **Desktop (≥1240px):** sticky right TOC restored (runtime diagnosis first — MR-004 root cause), active-section highlight via the existing IntersectionObserver logic, **"Mục x/y"** compact counter under the TOC head, smooth scroll + scroll-margin.
- **Mid/tablet (≤1240px):** in-flow TOC card (KEEP) with "Mục x/y" added to its header; collapsible via `<details>`.
- **Mobile:** TOC card at top (KEEP); thin sticky mini progress showing **section x/y** (not distracting scroll %).
- **Checkpoints:** between major concepts in lessons ≥ ~1,200 words — thin paused component, 1-line question + reveal.
- **Return-to-top:** small unobtrusive link at the very bottom.
- **Anti-pattern guard (unchanged):** no dashboards/rings/stats bars inside the lesson body.

---

## 18. Code Presentation

Unchanged from v1: keep code-copy + language bar + theme-safe dark (S-13); add file-context header (path + dòng x–y), long-snippet (>~45 lines) default-collapsed with one-line summary + expand, a distinct `.output` variant for terminal/log text, mobile horizontal scroll + font shrink with keyboard-scroll fix in the a11y pass (U17), line-numbered explanations retained. No new syntax-highlighting stack.

---

## 19. Callout Hierarchy

Unchanged from v1: 6 semantic families — Mục tiêu (green/target-strong), Mô hình trực quan (gray/bulb-soft), Ghi chú quan trọng (purple/info-medium), Cảnh báo (amber/alert-strong), Lệch code thật (amber-red/diff-strong, distinct wording "khác biệt" vs "cảnh báo"), Lỗi thời/phiên bản (red/clock-strongest, rare). Merges: `.notice`→warning, `.hint`→note, journey→orientation. **Anti-amber-wall rule:** ≤2 consecutive warning/diff boxes; traps prefer ⚠-on-text with one strong box per distinct hazard. Visual strength order: outdated > warning/diff > goal > note > mental.

---

## 20. Current → Target Content Map

Unchanged from v1 (full table in v1 §20). Consistency verified: every current lesson/topic appears exactly once in §6 with one classification and one location; two clarified rows below; nothing valuable disappears.

| Current content | Target location | Treatment |
|---|---|---|
| Ch07 repository-vs-live-engine, local-first | **O1** (case study); architecture doctrine itself = **S5 (sourced from Ch10.1/10.3, NOT from Ch07)** | REDUCE/MOVE (clarified) |
| Ch08 recipe `AsyncImage` | **W2 first use** (gloss); reinforced at C-era previews | ADD SMALL FOUNDATION (clarified location) |
| Ch04 keys.properties pattern | **W3 taught** (core); **A14 forward-reference** | KEEP (relocated) |
| Ch02_3 codename claim | **A8 correction** (only site; Ch02.1 and Ch01.4 verified claim-free) | KEEP+UPDATE |

All §20 rows reconcile with §6 and §23.

---

## 21. Course Size & Learning-Time Estimate (counts verified)

| Measure | Current (baseline — HISTORICAL, pre-redesign snapshot) | Target (design — HISTORICAL DESIGN ESTIMATE) | Verification |
|---|---|---|---|
| Foundation lessons (prep) | 0 | **2** (F1–F2) | = F1+F2 |
| Main stages | — | **7** | A, C, S, N, W, D+R, X |
| Main-stage core lessons | — | **37** | 14+5+5+2+3+2+4+2 = 37 |
| Total core lessons (incl. foundation) | — | **39** | 37 + 2 ✓ (matches v1 "39 core") |
| Optional lessons | 0 | **6** | O1–O6 ✓ |
| Appendix sections | 0 | **3** | AP1–AP3 ✓ |
| Total learner-facing lessons | 22 | **45** | 39 core + 6 optional (appendix = reference sections, counted separately) |
| Total units incl. appendix | 22 | **48** | 45 + 3 |
| Core estimated time | ~12–17 h displayed | **~16h45m ≈ 16–17 h** — **HISTORICAL DESIGN ESTIMATE** (Σ core target times = 1005 min tại spec-time; KHÔNG phải verified product time) | Σ target times = 1005 min ✓ (v1 claim stands) — historical |
| Optional estimated time | — | **~4h15m ≈ 4–4.5 h** — **HISTORICAL DESIGN ESTIMATE** (Σ optional = 255 min tại spec-time) | Σ optional = 255 min (O1 30 + O2 45 + O3 30 + O4 30 + O5 30 + O6 90) — **corrected from v1's 2.5–3 h**; historical |
| Total estimated time | ~16.8 h displayed | Design: **~21 h (HISTORICAL)** · **CURRENT VERIFIED PRODUCT: ≈ 26 h tổng (lõi ≈ 22 + optional ≈ 4)** | 2026-09-11: con số sản phẩm derive từ lessonStats (lõi ~22 h hiển thị trên homepage; 1005+255=1260 min là ước lượng spec-time — historical) |
| Avg core lesson | — | **~26 min** — HISTORICAL DESIGN ESTIMATE (1005/39 ≈ 25.8; product avg hiện hành ≈ 34 min = ~22h/39) | corrected from v1's "~24"; historical |
| Displayed hero phrasing | "11 chương / 22 / ~16.8 h" | "**2 bài nền tảng + 7 giai đoạn · 39 bài lõi · 6 mở rộng · ~22 giờ lõi** " | MR-021 resolution; giờ updated 2026-09-11 từ lessonStats hiện hành (~17 là ước lượng planning spec-time — historical) |

**Per-stage averages (verified):** F 25 · A 25 · C 24 · S 25 · N 25 · W 28 · D 30 · R 26 · X 30 — consistent with v1's stage profiles (W/D/R ≈ 27-28 was v1's wording; exact per-stage values above). *(Các con số này là **HISTORICAL DESIGN ESTIMATE** — target-time đặt cho từng unit khi thiết kế, không phải đo sản phẩm.)*

### FINAL VERIFIED COUNTS (current product truth — 2026-09-11, derive từ registry/lessonStats + verified bởi `web/scripts-maintenance/check_counts.mjs`)

| Measure | Current verified value | Nguồn |
|---|---|---|
| Core lessons | **39** (F×2 + A×14 + C×5 + S×5 + N×2 + W×3 + D×2 + R×4 + X×2 = 39) | registry + check_counts PASS |
| Optional lessons | **6** (O1–O6, "Mở rộng", không bắt buộc) | registry + check_counts PASS |
| Appendix | **3** (AP1–AP3, reference, zero-quiz) | registry + check_counts PASS |
| Total units | **48** · 45 quiz · **8 redirects** | registry + check_counts PASS |
| Core learning time | **≈ 22 giờ** (hiển thị trên homepage hero, suy từ lessonStats) | lessonStats + check_counts |
| Total learning time (incl. optional) | **≈ 26 giờ** (lõi ~22 + optional ~4) | lessonStats-derived |
| SCHEMA_VERSION / SPLIT_MAP | **13 / 14** | web/src/lib/progress.ts |
| Avg core lesson (product) | ≈ 34 min (ước lượng hiển thị, không phải acceptance gate) | lessonStats-derived |

> **Phân biệt bắt buộc:** mọi giá trị "target time" / "Σ 1005 min" / "Σ 255 min" / "~21 h" / "~16h45" trong spec này là **HISTORICAL DESIGN ESTIMATE** (thiết kế 2026-09-04). Con số hiện hành của sản phẩm chỉ là bảng FINAL VERIFIED COUNTS ở trên — giờ học là ước lượng planning, không phải acceptance gate (owner rule 2026-09, §3 principle 4).

**On the "42 pages" target:** the planning magnitude still holds — 45 learner-facing units (39 core + 6 optional) vs the book-derived 42-page split target; the +3 delta is the new foundation/navigation/architecture lessons offset by the splitting math. The invariant is unit coherence (một learning job trọn vẹn — giờ học chỉ là ước lượng, không phải hard cap; owner rule 2026-09), not count.

---

## 22. Course Owner Decisions

Unchanged from v1 (8 decisions with defaults; a one-session confirmation opens the prototype phase). Defaults: Kotlin → compact foundation; Ditto → reduced concepts (O1) + API appendix (AP2); Navigation → core pair; testing → optional (O2); accessibility → core-lite (C5); adaptive UI → optional (O3); 2023 toolchain → retain + drift notes; Gradle release/signing → appendix (AP1). Reversible; see v1 §22 for the full tradeoff table.

---

## 23. Redesign Boundaries

### Keep (as-is, no regression — the S-register)
KEEP: A1–A3, A4 (roadmap/version content), A5–A13 content (with trims/splits as specified), R1–R4, D1–D2 content, W2 core, all of S-01…S-16 (architecture doctrine, Compose state model, compile-error pedagogy, critical reading, provenance, drift apparatus, DataStore/Room, Retrofit/Moshi, debugging, Gradle core, search, sidebar, progress, resume, code copy, quiz explanations, website a11y, dark/light, mobile drawer). *(Verified: A4 and A5 need no codename correction — see log row 3.)*

### Modify
MODIFY: A4 roadmap/version lines; A8 codenames correction (Ch02.3 line 365); Ch08 states/API-key; Ch09 (split); Ch10 R4 drift table; Ch11 encryption section (historical reframe); quiz model (length/position balance, 4 options, 8–12 count, progress/retry/score-scroll); completion model (B-lite); site: TOC rail restore + wayfinding, stats labels, stage-framing copy (home/sidebar), callout hierarchy, code-block header, checkpoint component, optional-track badges.

### Add
ADD (new core): F1, F2 (Kotlin foundation); S1 (coroutine 20-min); S5 (architecture/repository concept, sourced from Ch10.1/10.3); N1, N2 (navigation); C5 (a11y core-lite).
ADD (inline/gloss): `collectAsStateWithLifecycle` (S4), Coil/AsyncImage (W2 first use), `stateIn` (S4), Hilt seam note (D2), Nav 3 note (N2), error-to-user state (W3).

### Move
MOVE to optional: O1 (Ditto case study), O2 (testing), O3 (adaptive), O4 (WorkManager), O5 (migration), O6 (capstone).
MOVE to appendix: AP1 (Gradle signing/keystore/minify), AP2 (Ditto API deep-dive), AP3 (reference/version glossary).

### Historical
HISTORICAL: EncryptedSharedPreferences/security-crypto (X2, "do not use for new apps" + sample cross-ref); SharedPreferences (legacy framing); string-typed navigation routes (one-line older-style note); Ch02_3 codenames (corrected, not removed — now in Modify).

### Optional
OPTIONAL (site-level polish): light-theme verification (MR-031), 44px touch targets (MR-022), search cap re-plan (MR-032), breadcrumb link (MR-030), home stat-row polish (MR-029).

---

## 24. Risks of the Redesign

Unchanged from v1: split-while-valuable churn (mitigated by §20 map + S-register acceptance); deferred quiz rebalance (highest — treat as its own P0 workstream); foundation scope creep (held by §7 hard scope list); toolchain drift pressure (drift apparatus must include "what to do when Studio 2026.x requires AGP bump"); wayfinding over-build (anti-pattern guard §17); optional-track bloat ("Mở rộng" separation + non-goals §2); progress-migration bugs (SPLIT_MAP v5 full slug audit); localization/polish regression (chapter labels kept as secondary metadata).

---

## 25. Success Criteria

Unchanged from v1 (10 criteria): quiz integrity (no axis >~40%, 4 options, 8–12 count, 100% explanations); wayfinding (TOC renders + highlights at all widths, "Mục x/y"); prerequisite discipline (zero used-before-taught without gloss); size discipline (one standard/template across 100% live — giờ học chỉ là ước lượng planning, KHÔNG còn "zero core >30 min" hard cap: owner rule 2026-09 "không cắt vì dài", xem §3 principle 4); currency (security-crypto historical-only, codenames corrected, drift tables dated); voice coherence (no book-refs outside Nguồn); foundation payoff (S4 reads without surprise after F1/F2+S1); capstone feasibility (O6 followable without external searches); no-regression (S-01…S-16 verified unchanged); progress honesty (Model B-lite % + SPLIT_MAP v5 no credit loss). *(Wording "zero core >30 min" của v1 bị thay 2026-09-11 — historical label tại §3 principle 4.)*

---

## 26. Readiness for Prototype / Planning

**`CONSISTENT_AND_READY_FOR_PROTOTYPE`**

Why:
- All internal inconsistencies of v1 are resolved (stage count, a11y classification, time arithmetic, codename location, appendix counting phrasing).
- The redesign direction is untouched — the consistency pass changed no lesson order, no classification priorities, and no preserved decision.
- The prototype vertical slice remains exactly as defined in v1 §26: (1) desktop TOC render fix + "Mục x/y", (2) checkpoint/callout-hierarchy/code-header on one pilot lesson, (3) F1 and N1 drafts at template level, (4) one rebalanced + retry-ified quiz.
- One confirmation session on the 8 owner defaults (§22) is still the recommended opening step.

---

## 27. Consistency Change Log

| Item | Previous (v1) | Corrected (v2) | Reason |
|---|---|---|---|
| Stage count / framing | "Stage 0 Foundation … Stage 7" — 8 labeled stages; homepage "7 giai đoạn" | **NỀN TẢNG (2 lessons, required prep, unnumbered) + 7 GIAI ĐOẠN CHÍNH (37 lessons)**; architecture diagram, hero stats, roadmap, progress, summaries all updated | Resolve 8-vs-7 contradiction without moving any lesson |
| Accessibility classification | "a11y = core-lite (C5)" in §6 but listed under OPTIONAL EXTENSION OUTCOME in §2 | a11y = **core outcome (C5, core-lite/small foundation)** everywhere; removed from optional outcome list; §11 wording fixed | Benchmark classification: a11y = CORE-LITE; testing/adaptive/WorkManager = optional |
| Android Studio codename fix location | Correction associated with both A4 (Ch01.4) and A8 (Ch02.3) | Correction **A8 only**; A4 = roadmap/version updates only; A5 (Ch02.1) verified claim-free (dessert naming in the past is true; animal naming declared current) | Evidence re-check: the false "đã bỏ cách đặt tên động vật" claim exists **only** in Ch02_3 line 365; Ch01_4 has no codename content |
| Optional learning time | "optional ≈ 2.5–3 h" | **optional ≈ 4–4.5 h (255 min)** — HISTORICAL DESIGN ESTIMATE | Σ O1–O6 = 30+45+30+30+30+90 = 255 min — v1 mis-stated; product hiện hành ≈ 4 h |
| Total learning time | "total ≈ 19–20 h" | **total ≈ 21 h (1260 min)** — HISTORICAL DESIGN ESTIMATE (product hiện hành ≈ 26 h: lõi ~22 + optional ~4) | 1005 core + 255 optional — v1 mis-stated |
| Average core lesson time | "core lessons average ~24 min" | **~26 min (1005/39 ≈ 25.8)** — HISTORICAL DESIGN ESTIMATE (product avg hiện hành ≈ 34 min) | Recalculated |
| "45 units" phrasing | "45 units (39 core + 6 optional) + 3 appendix sections" | **45 learner-facing lessons = 39 core + 6 optional; 48 total units including 3 appendix reference sections** | Removed the ambiguous "units vs lessons" phrasing |
| Homepage stat chips (§16/21) | "7 giai đoạn · 39 bài học lõi · 6 bài mở rộng · ~17 giờ" | **"2 bài nền tảng + 7 giai đoạn · 39 bài lõi · 6 mở rộng · ~22 giờ lõi"** with foundation sub-note (giờ updated 2026-09-11 từ lessonStats; "~17 giờ" ở cột trước là ước lượng planning — historical) | Stage-count fix + honest counts |
| S5 source attribution (Ch07) | Ambiguous: "Ch07 concepts → S5 + O1" could read as S5 = Ch07 split | **S5 sourced from Ch10.1 five-layer doctrine + Ch10.3 repository WHY; Ch07's repository-vs-live-engine case study → O1; Ditto API → AP2** | §6/§10/§20 consistency; Ch07 depth reduction unchanged in effect |
| Coil gloss location | "Coil (W2/C-era)" | **Single first-use gloss at W2** (recipe UI first contact) | One unambiguous teaching site |
| Stage-average wording | "W/D/R ≈ 27" | Per-stage averages listed explicitly (F25, A25, C24, S25, N25, W28, D30, R26, X30) | Transparency; no material change |

*(No lesson was added, removed, or reordered by this pass; no classification priority changed except the a11y wording reconciliation; all preserved decisions from Master Review §8 stand.)*

---

# FINAL VERIFIED COUNTS

* Required foundation lessons: **2** (F1, F2)
* Main stages: **7** (Android Basics · Compose · State & Architecture · Navigation · Networking · Local Data · Real-World)
* Core lessons: **39** (37 main-stage + 2 foundation)
* Optional lessons: **6** (O1–O6)
* Appendix sections: **3** (AP1–AP3)
* Total learner-facing lessons: **45** (core + optional; appendix reference sections counted separately — 48 total units if included)
* Core estimated time: **~16 h 45 m (~16–17 h)** — **HISTORICAL DESIGN ESTIMATE** (Σ target times 1005 min tại spec-time; KHÔNG phải verified product time)
* Optional estimated time: **~4 h 15 m (~4–4.5 h)** — **HISTORICAL DESIGN ESTIMATE** (Σ 255 min)
* **CURRENT PRODUCT TIME (2026-09-11, derive từ lessonStats + check_counts PASS): lõi ≈ 22 giờ · tổng gồm optional ≈ 26 giờ** — đây là con số hiển thị trên sản phẩm; các dòng "estimated" phía trên chỉ là lịch sử thiết kế

**Status: `CONSISTENT_AND_READY_FOR_PROTOTYPE`** — all v1 internal inconsistencies resolved (stage count, a11y classification, time arithmetic, codename location, count phrasing); no structural conflict found; redesign direction and preserved decisions intact. *(2026-09-11: trạng thái này thuộc giai đoạn thiết kế — dự án đã đi hết implementation + final QA; current truth = PROJECT_PLAN "TRẠNG THÁI CUỐI CÙNG" + QA_FINAL_REPORT.md.)*

---

*Report end. Consistency pass only — no repository changes, no lesson/quiz text, no CSS/HTML/Astro, no mockups, no implementation tickets, no roadmap. Differences vs v1 are enumerated in the Consistency Change Log; everything else carries over unchanged.*
