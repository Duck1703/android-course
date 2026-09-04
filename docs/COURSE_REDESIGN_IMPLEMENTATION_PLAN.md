# Course Redesign Implementation Plan

**Course:** "Học Android bằng tiếng Việt cho người mới" (Android/Kotlin/Jetpack Compose)
**Plan date:** 2026-09-04 · **Baseline commit:** `957dffa` (branch `main`) · **Design contract:** `docs/COURSE_REDESIGN_SPEC_432cbf8_v2.md`
**Prototype reference:** `prototype/learning-experience-v1` @ `3ae75d1` (baseline `432cbf8`) — **evidence only, KHÔNG merge/cherry-pick**
**Correction pass:** STEP 11B (2026-09-04) — tách `lessonId`/`slug`/`stageId`, sync số liệu đã verify với prototype `3ae75d1`, quiz harness blast radius, dependency audit, chính sách legacy-credit S5, QA fixes. **STEP 11C (2026-09-04) — final integrity pass:** đếm lại URL (**14/22 giữ nguyên URL · 8 old slug chết**), REDIRECT_MAP 8 source × 1 đích (`redirectTarget` §12.5), thiết kế keep-source fan-out cho `ch02-2` (§12.3), chốt credit Ch07→O1 (kế nhiệm trực tiếp — §12.2 case B), schema version đơn điệu theo thứ tự thực thi (expected v5→v13 — §12.4), tách task Stage 1 theo từng chương + renumber task ID thuần số. Toàn bộ thay đổi liệt kê ở **PLAN CORRECTION LOG** cuối file (#18–24).

> Bản chất kế hoạch này: **correction-and-completion, không rebuild** (spec v2 §1). Toàn bộ work được chia thành 63 task IMP nhỏ (renumber STEP 11C), mỗi task là 1 commit boundary, có gate review rõ ràng. Không có batch nào đụng > 1 chương nội dung cùng lúc.

---

## 1. Implementation Objective

Chuyển redesign spec v2 thành các batch triển khai được, theo đúng 9 mục tiêu của spec:

1. **P0 fixes như defect:** quiz bias (cân độ dài/vị trí đáp án), desktop TOC + wayfinding ("Mục x/y"), 2 bài điều hướng mới (N1–N2), security-crypto chuyển thành HISTORICAL-REF (X2), A8 sửa codename.
2. **Chuẩn hoá:** 7 chương monolith + các bài tách quá dài được re-slice về đúng template §12 (port nội dung, không viết lại từ đầu).
3. **Bổ sung nền tảng:** F1–F2 (Kotlin vừa đủ), S1 (coroutine 20'), S5 (kiến trúc/repository từ Ch10.1/10.3), C5 (a11y core-lite), các gloss (`collectAsStateWithLifecycle`, `stateIn`, Coil, Hilt seam, Nav 3, error-to-user).
4. **Optional tách khỏi lõi:** O1–O6 + AP1–AP3, không lẫn vào core path.
5. **Quiz migration toàn khoá:** 8–12 câu / 4 options / cân rank độ dài & vị trí / 100% giải thích — chạy **liên tục theo từng batch**, không dồn về cuối.
6. **Progress không mất:** giữ nguyên slug cũ mọi nơi content identity không đổi; SPLIT_MAP chỉ cho slug thật sự đổi (9 entry mới — 8 old slug chết cần redirect 1 đích, ch02-2 vẫn sống với tư cách A6 theo cơ chế keep-source fan-out §12.3); Model B-lite + migration từng batch — giảm thiểu redirect và progress migration.
7. **Trang chủ/điều hướng trung thực:** "Nền tảng + 7 giai đoạn", stage progress, core/optional phân tách, số liệu tính từ registry.
8. **QA đo được:** build/astro check/link/quiz-audit/voice/prereq/time-cap/dark-light-mobile đều có gate số.
9. **Không thoái hoá:** 16-item strength register (S-register) được verify ở gate cuối.

---

## 2. Authoritative Inputs

| Input | Vai trò |
|---|---|
| `docs/COURSE_REDESIGN_SPEC_432cbf8_v2.md` | **Hợp đồng thiết kế** — đích đến, đếm số, biên giới (§23), tiêu chí thành công (§25). Mâu thuẫn nào giữa plan và spec → spec thắng. |
| `docs/COURSE_CONTENT_STANDARD.md` | Chuẩn biên tập/sư phạm khi chạm từng bài (voice, cấu trúc, quiz, drift, checklist tự review). |
| `docs/CHAPTER_SPLIT_MAP.md` | Bản đồ tách đã có (Ch01–03, Ch10 đã tách; Ch04–09/11 đã có bảng slug kế hoạch cũ — **chỉ dùng làm nguồn tham khảo**; slug đích theo chính sách lessonId/slug ở §4b — phần lớn slug cũ được giữ nguyên). |
| `docs/PROJECT_PLAN.md` | Trạng thái Task 46–48 (UI redesign xong; Task 48 tạm dừng ở Ch01–03 đã chuẩn hoá; Ch04 trở đi **chưa** chạy chuẩn Phase 7). |
| Prototype `3ae75d1` | Bằng chứng đã validate: TOC "Mục x/y" + active highlight (desktop/tablet/mobile), checkpoint, code metadata header, callout families, quiz 16→12 + retry/submit UX — đã verify build 23 trang, astro check 0 lỗi, screenshot 14+ light/dark/desktop/mobile. |
| `aaf-materials/` + `content/book/` | Nguồn code thật (file + dòng) và sách gốc cho mọi lesson — attribution chỉ trong khối Nguồn. |

---

## 3. Repository Starting State

Đã verify lúc lập plan (2026-09-04):

| Kiểm tra | Kết quả |
|---|---|
| Branch / HEAD / working tree | `main` @ `957dffa`, **clean** ✅ |
| Redesign spec | tồn tại, đọc được (509 dòng) ✅ |
| Prototype | `prototype/learning-experience-v1` @ `3ae75d1`, merge-base với main = `432cbf8` ✅ |
| Site | Astro 7 tĩnh (`web/`), 22 route live (`ALL_CHAPTERS`), Node ≥ 22.12, không test framework, không CI |

**Kiến trúc hiện tại (các điểm planning cần biết):**

- **Registry:** `web/src/data/chapters.ts` — `SECTIONS` (3 Section Anh, 22 entry `ChapterInfo`), `groupChapters()` gom chương nhỏ, `chapterFileKey()`/`chapterLabel()`. `lessons.ts` — map slug → `{Lesson, Quiz}` component. `lessonStats.ts` — glob **toàn bộ** `components/lessons/*.astro` lúc build để đếm heading/từ/quiz/minutes + extract TOC.
- **Progress:** `web/src/lib/progress.ts` — localStorage, `SCHEMA_VERSION = 4`, `SPLIT_MAP` 4 entry (ch01→4, ch02→3, ch03→4, ch10→4), `migrateProgress()` chạy 1 lần/version với **replace semantics** (`SPLIT_MAP[slug]` thay old slug bằng các con — progress.ts:64-68; hành vi này được inspect và test ở IMP-013 cho entry keep-source §12.3). **Chưa có** flag "quiz đã làm", chưa có stage progress.
- **Quiz:** 26 file `ChXX*Quiz.astro` = **22 LIVE** (khớp 22 route trong `lessons.ts`) + **4 ORPHAN** (`Ch01Quiz`, `Ch02Quiz`, `Ch03Quiz`, `Ch04_1Quiz` — không route nào tham chiếu). Mỗi file 1 script scoring inline riêng (22 bản LIVE copy gần giống nhau — spec §13 yêu cầu centralize). Mọi script audit phải **phân loại LIVE vs ORPHAN**. Số câu hiện tại: monolith Ch01=19, Ch03=19, Ch04=19, Ch05=10, Ch06=19, Ch07=19, Ch08=19, Ch09=19, Ch11=19; tách: Ch01_1..4 = 9/10/11/10, Ch02_1..3 = 9/12/9, Ch03_1..4 = 11/**15**/11/10, Ch10_1..4 = **7**/16/10/8.
- **Nội dung:** Ch01–03 + Ch10 đã tách & chuẩn hoá (chuẩn mẫu Ch10, Task 47). **7 chương monolith còn nguyên khối:** Ch04, 05, 06, 07, 08, 09, 11.
- **28 file lesson draft "ngủ đông" trên đĩa** (Ch04_1..Ch11_5 — gồm **2 biến thể Ch04_3 trùng số**, chưa từng được route, predate spec v2): là bản draft tách cũ — coi là **nguồn tham khảo thô**, không phải work đã xong; batch nào đụng chương đó phải tự verify lại theo chuẩn + spec.
- **Monolith shell chưa route còn tồn đọng** (`Ch01WelcomeToAndroidKotlin`, `Ch02GettingStartedAndroidStudio`, `Ch03AndroidFundamentals`) + 4 quiz ORPHAN ở trên — không ai tham chiếu, vẫn bị `lessonStats` glob vào nhầm: dọn theo từng batch.
- **Scratch:** `web/scripts/` ~200 script audit tạm (build-time only) + vài file txt untracked ở `web/` root — cần rule `.gitignore`, không xoá.
- **Trang chủ:** hero đếm "11 chương" theo `Set(number)` — sẽ sai khi vào stage framing, sửa ở Workstream H.
- **Search:** index render sẵn JSON từ `ALL_CHAPTERS` (tên chapter + h2), có debounce/dedup ѕẵn — chỉ cần thêm stage label + optional/appendix.

---

## 4. Dependency Strategy

### 4.1 Thứ tự mặc định đề xuất ban đầu

> shared infra → registry/schema → pilot → migration batches → new lessons → optional → progress → homepage → QA.

### 4.2 Thứ tự thực thi của plan này (và lý do lệch)

```
Phase 0  Baseline & guardrails
Phase 1  WS A — Shared learning-experience foundation   (kèm quiz harness + lint)
Phase 2  WS B — Registry/stage metadata + migration cơ chế + template kit
Phase 3  PILOT — Chương 10: R1 đổi slug, R2–R4 giữ nguyên URL (+SPLIT_MAP expected v5 + redirect 1 đích)  [GATE_PILOT]
Phase 4  WS C — Migration batch theo stage (Stage 1: Ch01 → Ch02 → Ch03 → Ch04 + roadmap; 2 → 3 → 4 → 5 → 6-D → 7)
         WS D — New-core xen theo stage (F1/F2 → C5 → S1 → S5 → N1/N2)   [GATE_NEW_CORE]
Phase 5  WS E — Quiz sweep editorial còn lại (data-only) + decommission ORPHAN
Phase 6  WS F — Optional + Appendix (O1..O6, AP1..AP3, treatment "Mở rộng") — Ch07/O1 mang expected v13
Phase 7  WS G — Model B-lite + audit SPLIT_MAP toàn khoá                [GATE_PROGRESS]
Phase 8  WS H — Homepage/roadmap/search finalization
Phase 9  WS I — Full QA + S-register                                    [GATE_FINAL]
```

**Bốn lệch có chủ đích so với thứ tự mặc định:**

1. **Quiz harness centralize đưa vào Phase 1, nhưng với blast radius hẹp (2 quiz LIVE đại diện).** Bằng chứng: 26 quiz file × 1 script inline riêng (drift thật). Không cho 1 task đụng cả 26 file: harness được chứng minh trên 2 quiz LIVE (Ch10_2 + Ch05), rồi các quiz LIVE chuyển dần theo batch WS C; sweep cuối chỉ chỉnh data; quiz ORPHAN không đụng tới khi cleanup. Kết quả: mỗi quiz chỉ bị đụng 1 lần trong suốt dự án.
2. **Migration slug/progress (một phần WS G) bị kéo sớm lên PILOT.** Mỗi batch đổi slug mà không kèm SPLIT_MAP + bump version tại đúng commit đó thì tiến độ người học mất ngay giữa chừng. Nên: *cơ chế* SPLIT_MAP + redirect nằm ở pilot (chỉ 1 slug đổi — pilot đủ nhẹ để chứng minh); WS G giữ phần **ngữ nghĩa** (Model B-lite, audit tổng 9 entry, seed legacy).
3. **New-core (WS D) xen vào batch stage tương ứng, không dồn thành 1 phase riêng.** Lý do: (a) đúng thứ tự tiên quyết — S1 phải trước S2–S4, S5 trước R3/W2, N1/N2 trước W2 (NavHost ref); (b) mỗi stage đóng batch là **hoàn chỉnh** trước `REVIEW_GATE_CONTENT_BATCH`, tránh vòng quay sửa link chéo 2 lần; (c) F1/F2 viết ngay sau batch Stage 1 để "harvest" các gloss Kotlin của Ch01–03 còn mới.
4. **Sidebar stage grouping lên sớm (Phase 2), homepage stage UI để cuối (Phase 8).** Bằng chứng: 22 bài hiện có đều đã xác định `stageId` đích (Ch01–04→`android`, Ch05→`compose`, Ch06→`state`, Ch08→`network`, Ch09+10→`data`, Ch11→`realworld`, Ch07→`optional`) nên grouping sidebar không phụ thuộc nội dung mới; còn trang chủ đòi count/minutes trung thực → chỉ làm khi registry đã final.

**Nguyên tắc phụ thuộc cứng (không đổi theo phase):**

- Không rename slug trước khi có SPLIT_MAP entry (đúng mode — §12.3) + bump `SCHEMA_VERSION` (+1 đơn điệu — §12.4) + redirect **1 đích** (§12.5) trong **cùng** batch commit — và chỉ rename khi chính sách §4b.3 thực sự yêu cầu (14/22 slug giữ nguyên URL).
- Không viết lesson mới trước khi tiền quyết của nó đã merge — điều kiện tiên quyết đầy đủ liệt kê trong từng task ở §7: F1+F2 trước Ch05; S1 trước S2–S4 và S5; S5 trước W-batch; N1→N2 trước W-batch; capstone-set (A*, C*, S*, N*, W*, D*, R*) trước O6.
- Không đụng `progress.ts` semantics (B-lite) trước khi slug structure ổn định (sau batch Stage 7).
- Không đụng homepage trước khi registry final.

---

## 4b. Lesson ID vs Slug vs Stage ID — Chính sách định danh (chốt từ correction pass)

> **Nguyên tắc gốc:** `A1`, `R2`, `N1`… là **lesson/order IDs** (định danh logic dùng trong spec, registry, discussion, QA) — **KHÔNG phải URL slug**. URL slug là tài sản public có tiến độ người học gắn vào; lesson ID không bao giờ xuất hiện trong URL nếu không có lý do.

### 4b.1 Ba định danh phân biệt

| Trường | Vai trò | Ổn định? | Ví dụ |
|---|---|---|---|
| `lessonId` | Định danh logic thứ tự/nội dung trong spec §6 và TARGET_REGISTRY (F1, A1…A14, C1–C5, S1–S5, N1–N2, W1–W3, D1–D2, R1–R4, X1–X2, O1–O6, AP1–AP3) | Chỉ đổi khi spec đổi cấu trúc | `A6` |
| `slug` | URL route thật (`/chapters/<slug>/`) — thứ tiến độ người học và bookmark gắn vào | **Ổn định tối đa** — giữ nguyên khi content identity không đổi | `ch02-2-may-ao-may-that-doc-project` |
| `stageId` | Nhóm giai đoạn (sidebar, progress per-stage, homepage) | Ổn định theo spec §5 | `foundation`, `android`, `compose`, `state`, `navigation`, `network`, `data`, `realworld`, `optional`, `appendix` |

### 4b.2 Stage ID enum đầy đủ (bắt buộc)

Type `StageId` dùng **đúng 10 giá trị ổn định sau** — cấm enum viết tắt kiểu `f/a/c/s/n/w/x/opt/ap` (thiếu giá trị, mơ hồ, không extend được):

```ts
type StageId =
  | "foundation"   // F1–F2 — Nền tảng Kotlin (required prep, không đánh số giai đoạn)
  | "android"      // GĐ 1 — A1–A14, Android cơ bản
  | "compose"      // GĐ 2 — C1–C5, Jetpack Compose
  | "state"        // GĐ 3 — S1–S5, State & kiến trúc
  | "navigation"   // GĐ 4 — N1–N2, Điều hướng
  | "network"      // GĐ 5 — W1–W3, Mạng
  | "data"         // GĐ 6 — D1–D2 + R1–R4, Dữ liệu cục bộ
  | "realworld"    // GĐ 7 — X1–X2, Real-world / nâng cao
  | "optional"     // O1–O6 — track "Mở rộng"
  | "appendix";    // AP1–AP3 — tham khảo
```

Lesson IDs **giữ nguyên dạng F1/A1/R1…** — chỉ stage mới nhận `stageId`.

### 4b.3 Chính sách slug (default policy)

1. **Giữ nguyên slug cũ khi content identity về cơ bản giữ nguyên** (KEEP / KEEP+UPDATE / REDUCE không đổi ranh giới bài; kể cả khi bài được đổi `lessonId` hay đổi stage). Đổi slug chỉ vì "cho khớp lesson ID" là **cấm**.
2. **Slug mới chỉ cho lesson thật sự mới** (NEW: F1, F2, S1, S5, C5, N1, N2, O1 (REDUCE kế nhiệm — slug đổi vì bài chuyển track), O2–O6, AP1–AP3) hoặc **con của một SPLIT thật** (A7 từ ch02-2 — A6 giữ old slug; A10/A11 từ ch03-2; C1–C4 từ ch05; S2–S4 từ ch06; W1–W3 từ ch08; D1–D2 từ ch09; X1–X2 từ ch11 — chi tiết bảng §12.1).
3. **Không rename route chỉ để khớp lesson ID.** Hệ quả: 14/22 route hiện tại **giữ nguyên URL** — 13 slug hoàn toàn không đụng (giữ nguyên URL, không mapping) + `ch02-2` sống tiếp với tư cách A6 (có mapping keep-source nhưng không mất URL — xem bảng §10.1); SPLIT_MAP chỉ còn **9 entry mới** (bảng §12.1: ch02-2 keep-source + ch03-2 + ch05 + ch06 + ch07 + ch08 + ch09 + ch10-1 + ch11) thay vì 21; redirect chỉ cần cho các old slug thật sự biến mất (**8 slug — 9 entry trừ `ch02-2` vẫn sống**).
4. Một slug khi đã gán vào một `lessonId` thì **không tái sử dụng** cho lesson khác (ngăn progress/quiz-attempt gắn nhầm nội dung).
5. File-name convention (kebab→Pascal từ slug) vẫn áp cho file **mới**; file cũ giữ tên khi slug giữ nguyên.

### 4b.4 Hệ quả tổng

- **Redirect:** chỉ 8 old slug chết thay vì 21 (mọi KEEP/REDUCE 1:1 giữ URL) → ít chết bookmark hơn hẳn.
- **Progress migration:** chỉ 9 SPLIT_MAP entry mới (6 replace + 1 REDUCE ch07 + 1 keep-source ch02-2 + 1 REDUCE ch10-1) + chuỗi v4 sẵn có; người học của 14 bài giữ URL không mất tiến độ — 13 bài **không bị migrate gì**, riêng `ch02-2` được fan-out thêm A7 mà không mất credit (§12.3).
- **Cross-ref "Chương N.x":** đổi theo lessonId/stage framing ở **văn bản hiển thị**, không đòi URL đổi.
- Registry `TARGET_REGISTRY_v5.md` là **bảng trung tâm duy nhất** map `lessonId ↔ slug ↔ stageId ↔ file ↔ quiz file ↔ kind(core/optional/appendix) ↔ minutes`; mọi script (stats, audit, QA page-count, truth-check) đọc từ đây, không hardcode.

---

## 5. Workstreams

| WS | Tên | Phạm vi | Phase | Task |
|---|---|---|---|---|
| **A** | Shared learning-experience foundation | TOC "Mục x/y", checkpoint, code header, callout hierarchy, quiz harness (2 quiz LIVE đại diện) + lint LIVE/ORPHAN, responsive/a11y harness | 1 | IMP-001…008 |
| **B** | Course structure / data model | Stage metadata (`stageId` 10 giá trị), sidebar grouping, target registry + chính sách định danh §4b, migration cơ chế, template kit, lessonStats refactor, redirects | 2 | IMP-010…017 |
| **C** | Existing-content migration | 10 batch nội dung (Ch01, Ch02, Ch03, Ch04, 05, 06, 08, 09, 10-pilot, 11 — **mỗi batch đúng 1 chương**) + Stage 4 thuần NEW; theo mapping Current→Target của spec §6/§20 — **giữ nguyên slug theo chính sách §4b.3** | 3–4 | IMP-020…022 (pilot), IMP-030…042 (Stage 1–7) |
| **D** | New core content | F1, F2, C5, S1, S5, N1, N2 — đúng prerequisite order (deps ở từng task §7; C5/S5/N-pair có row "thực thi qua" trong WS C để stage batch đóng trọn) | 4 | IMP-043…049 |
| **E** | Quiz migration | Audit baseline LIVE/ORPHAN + sweep theo batch + decommission | 1/5 | IMP-062…065 |
| **F** | Optional + appendix track | O1–O6, AP1–AP3, treatment "Mở rộng", Ch07 REDUCE | 6 | IMP-050…060 |
| **G** | Progress migration | Model B-lite, quiz-attempt flag, SPLIT_MAP tổng audit, seed legacy, chính sách legacy-credit | 7 | IMP-070…072 |
| **H** | Homepage / navigation migration | Hero + roadmap stage cards + resume + progress panel + search final | 8 | IMP-080…082 |
| **I** | Final QA | Toàn bộ gate đo được + S-register + sync tài liệu | 9 | IMP-090…092 |

---

## 6. Phase / Batch Order

| Phase | Nội dung | Gate sau khi xong |
|---|---|---|
| 0 | Baseline guardrails: ghi nhận build/check xanh, `.gitignore` cho scratch | — |
| 1 | WS A foundation (chưa đụng nội dung bài học) | `REVIEW_GATE_UI_FOUNDATION` |
| 2 | WS B registry/stage metadata + cơ chế migration + template kit | `REVIEW_GATE_REGISTRY` |
| 3 | Pilot Ch10: R1 đổi slug, R2–R4 giữ nguyên URL + S5 policy demo (ch10-1 credit chỉ sang R1; ch07→O1 demo ở batch optional) | `REVIEW_GATE_PILOT` |
| 4 | Batches theo stage: Stage 1 (Ch01 → Ch02 → Ch03 → Ch04 — **mỗi chương 1 batch riêng** — rồi roadmap A4; sau đó F1/F2) → Stage 2 (Ch05 + C5; **đòi cả F1 và F2**) → Stage 3 (Ch06 + S1, S5) → Stage 4 (N1/N2, thuần NEW) → Stage 5 (Ch08; đòi S5+N1+N2) → Stage 6-D (Ch09) → Stage 7 (Ch11) | `REVIEW_GATE_CONTENT_BATCH` sau **mỗi** batch |
| 5 | WS E quiz sweep toàn khoá + dọn quiz monolith/thừa (gate task IMP-065) | `gate quiz sweep` (IMP-065) |
| 6 | WS F optional + appendix + Ch07 REDUCE (gate task IMP-060) | `REVIEW_GATE_CONTENT_BATCH` (batch optional) |
| 7 | WS G Model B-lite + progress audit tổng | `REVIEW_GATE_PROGRESS` |
| 8 | WS H homepage/roadmap/search | — |
| 9 | WS I full QA + S-register + docs sync | `REVIEW_GATE_FINAL` |

Quy tắc: **không batch nào mở trước khi gate trước đóng.** Mỗi batch = 1 stage hoàn chỉnh (migration + quiz + lesson mới thuộc stage đó).

---

## 7. Detailed Task Registry

Quy ước chung cho mọi task nội dung: verification chuẩn = `cd web && npm run build && npx astro check` + `node web/scripts/quiz-audit.mjs` (từ IMP-002) + voice/prereq checklist (COURSE_CONTENT_STANDARD). Cột Commit = 1 commit/task trừ khi ghi khác.

### Workstream A — Shared foundation

| ID | Objective | Files / areas | Deps | Actions | Acceptance criteria | Verification | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|---|---|
| IMP-001 | Centralize quiz scoring script (spec §13 harness note) — **blast radius có kiểm soát** | mới `web/src/scripts/quiz.ts` (hoặc inline module dùng chung); KHÔNG đụng sẵn 26 file trong task này | — | Trích logic chung (tính điểm, submit, scroll kết quả, aria-live, retry ẩn/hiện/ẩn) thành 1 script init đọc data-attr trên form quiz. **Chỉ áp lên 2 quiz LIVE đại diện** (1 bài tách: `Ch10_2Quiz`; 1 monolith: `Ch05Quiz`) để chứng minh hành vi không đổi. Các quiz còn lại chuyển sang harness **từng batch theo WS C** khi batch đó đụng bài học; quiz ORPHAN không chuyển. | 2 quiz đại diện chạy harness: build xanh; hành vi không đổi (submit, chấm, scroll, aria-live, retry); diff nội dung câu hỏi = 0; plan chuyển-dần ghi trong `QUIZ_MIGRATION_STATUS.md` | build + astro check + test tay 2 quiz đại diện trước/sau + đối chiếu text quiz với baseline | Medium | M | `refactor(quiz): centralize scoring harness (2-quiz proof)` |
| IMP-002 | Quiz audit script (lint đo được) — **phân loại LIVE vs ORPHAN** | mới `web/scripts/quiz-audit.mjs` (stdlib only) | IMP-001 | Parse từng `*Quiz.astro` (regex DOM-lite): số câu, số option/câu, vị trí đúng, rank độ dài option đúng, có explanation, trùng câu. **Đầu vào lấy từ `lessons.ts`** để xác định file LIVE (có route tham chiếu) vs ORPHAN (không) — xuất 2 phần riêng; ORPHAN chỉ ghi nhận tồn tại (batch cleanup xử lý), không fail gate. Xuất JSON + bảng pass/fail theo ngưỡng quiz contract (spec §13, tóm tắt ở plan §11) cho quiz LIVE | Report chạy được trên 26 file; phân loại đúng 22 LIVE / 4 ORPHAN (đối chiếu `lessons.ts`); đúng số câu khớp đếm tay (Ch01=19, Ch03_2=15, Ch10_1=7, Ch10_2=16…) | `node web/scripts/quiz-audit.mjs` | Low | M | `feat(quiz): add quiz audit script with live/orphan split` |
| IMP-003 | TOC "Mục x/y" + toc-head + mobile emphasis (port prototype) — **mốc 1024px** | `web/src/pages/chapters/[slug].astro`, `web/src/styles/lesson.css` | — | Port sạch phần prototype `3ae75d1`: `.toc-head` + counter `Mục 1/y` tĩnh (init `setCounter(null)` → **không bao giờ `Mục 0/y`**) → IO cập nhật; `li.cur` mobile; **breakpoint TOC = 1024px** (cùng mốc shell rail→drawer): `>1024px` sticky right rail, `<=1024px` in-flow card; inactive TOC dùng `--text-2` (token text đậm hơn đã verify ở prototype, không `--text-3`) cho contrast dark-mode | Desktop `>1024px` sticky rail hiện counter + active; `<=1024px` card hiện counter; không "Mục 0/y"; inactive dark-mode contrast đạt như screenshot prototype 21/33 | build + `astro dev --background` + screenshot 1440/1200/1024/390 light+dark (đối chiếu prototype screenshots 20–33) | Low | S | `feat(toc): muc x/y counter + active emphasis (1024px breakpoint)` |
| IMP-004 | Checkpoint component "Kiểm tra nhanh" | `lesson.css`, mới `web/src/components/Checkpoint.astro` (hoặc class convention) + hướng dẫn dùng trong template kit | IMP-003 | Port `.checkpoint` từ prototype (details-based, 1 câu hỏi + reveal, không score/persist); style cả light/dark | Component render đúng cả 2 theme; không đếm vào quiz stats | build + screenshot desktop/mobile light+dark | Low | S | `feat(lesson): checkpoint component` |
| IMP-005 | Code metadata header (file + dòng) | `web/src/components/CodeEnhance.astro`, `lesson.css` | — | Port `data-file`/`data-lines` → header "RecipeDb.kt · dòng 43–67"; optional per-block; block cũ không có attr = không đổi gì | Block có attr hiện header đúng; block không attr nguyên trạng; light/dark ổn | build + screenshot 1 trang có attr + 1 trang không | Low | S | `feat(code): file context header` |
| IMP-006 | Callout hierarchy 6 family + anti-amber rules | `lesson.css` (hoặc callout.css mới), docs template kit | IMP-004 | Port family class (goal/mental/note/warn/diff/outdated) từ prototype; rule ≤2 warning/diff liên tiếp ghi vào template kit; map `.notice`→warn, `.hint`→note | Cả 6 family có style light+dark; Ch10.2 (đang demo) render đúng; không vỡ callout cũ chưa chuyển family (fallback style giữ) | build + screenshot Ch10.2 | Medium | M | `feat(lesson): callout family hierarchy` |
| IMP-007 | Responsive / light-dark / a11y verification harness | mới `docs/UI_VERIFICATION_CHECKLIST.md`; (tuỳ chọn) script screenshot CDP tái dùng | IMP-003…006 | Checklist 4 viewport (1440/1200/1024/390) × 2 theme × các state (TOC, quiz trước/sau submit, checkpoint, code header, focus ring); ghi cách chụp bằng astro dev + CDP như prototype đã làm | Checklist tồn tại + chạy được 1 lượt trên Ch10.2, phát hiện 0 lỗi contrast mới (đối chiếu screenshot prototype) | chạy checklist | Low | S | `docs(ui): verification checklist harness` |
| IMP-008 | GATE: UI foundation regression proof | — | IMP-001…007 | Đối chiếu đầu-ra main vs prototype `3ae75d1` cho cùng Ch10.2; chạy đủ checklist | **REVIEW_GATE_UI_FOUNDATION**: build + astro check xanh; TOC/checkpoint/code-header/callout đúng như prototype (breakpoint 1024px, không Mục 0/y, retry ẩn→hiện→ẩn); quiz harness giữ hành vi trên 2 quiz đại diện; screenshot light/dark × desktop/mobile đạt | checklist + so screenshot | — | S | `chore: gate ui foundation` (tag) |

### Workstream B — Registry / data model

| ID | Objective | Files / areas | Deps | Actions | Acceptance criteria | Verification | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|---|---|
| IMP-010 | Thêm stage metadata vào registry (additive) | `web/src/data/chapters.ts` | — | Thêm `stage?: StageId` + type `StageId` = **10 giá trị đầy đủ** (`foundation`/`android`/`compose`/`state`/`navigation`/`network`/`data`/`realworld`/`optional`/`appendix` — §4b.2; **cấm enum rút gọn**) + `STAGES` const (tên tiếng Việt + đếm đích); **giữ nguyên 22 slug + SECTIONS rendering**; map `stageId` cho 22 bài theo spec §5 | Build xanh; sidebar/home render y nguyên; `ALL_CHAPTERS` mỗi entry có `stageId` đúng; enum có đủ 10 giá trị được astro check xác nhận | build + astro check + diff render (content-baseline trick) | Low | M | `feat(registry): stage metadata additive (10 stage ids)` |
| IMP-011 | Sidebar grouping theo "Nền tảng + 7 giai đoạn" | `BaseLayout.astro` (sidebar), `chapters.ts` (group renderer) | IMP-010 | Renderer sidebar: nhóm theo `stageId` thay 3 Section; nhóm rút gọn từ `STAGES`; "Nền tảng" chỉ hiện khi có bài `foundation`; optional/appendix group "Mở rộng" collapsed (điền vào khi WS F); giữ search/progress/active states | 22 bài phân đúng stage hiện có; trang chủ chưa đụng; không mất state sidebar hiện có | build + click-through sidebar + screenshot | Medium | M | `feat(sidebar): stage grouping` |
| IMP-012 | Target registry + chính sách định danh (tài liệu thi hành) | mới `docs/TARGET_REGISTRY_v5.md` | IMP-010 | Chốt bảng 48 unit theo schema §4b.1: **`lessonId` · `slug` · `stageId` · tên file component · quiz file · kind(core/optional/appendix) · minutes đích · nguồn** (spec §6); áp chính sách slug §4b.3 (**14/22 slug giữ nguyên URL** — 13 KEEP + `ch02-2` sống tiếp với tư cách A6; quyết định từng dòng ở bảng §10.1/§12.1); chỉ lesson slug-đổi mới có entry redirect + SPLIT_MAP; SPLIT_MAP draft = bảng §12.1 (**9 entry mới**: 6 replace + 1 REDUCE ch07 + 1 keep-source ch02-2 + 1 REDUCE ch10-1 — mode ghi ở §12.3); **REDIRECT_MAP = đúng 8 old slug chết × 1 `redirectTarget` mỗi source** (§12.5); quy ước file-name từ slug (kebab→Pascal) cho file mới; **chốt chính sách credit: ch10-1 → R1 only; ch07 → O1 (kế nhiệm trực tiếp — §12.2)** | Mọi 48 unit có đủ 8 trường; tổng core = 39 bài/1005', optional 6/255' khớp spec §21; đếm slug khớp §4b.4 (14 giữ URL · 8 chết); cột `stageId` dùng đúng 10 giá trị; 8 dòng REDIRECT_MAP mỗi dòng 1 đích | đối chiếu ngược spec §6/§21 + đối chiếu slugs hiện tại trong `lessons.ts` | Low | M | `docs(registry): target registry v5 (lessonId/slug/stageId) + id policy` |
| IMP-013 | Progress migration cơ chế + policy version — **gồm mode `fan-out-keep-source` cho ch02-2 (§12.3)** | `web/src/lib/progress.ts` | IMP-012 | **Inspect `migrateProgress()` hiện tại trước**: hàm dùng replace semantics — `SPLIT_MAP[slug]` thay old slug bằng các con (progress.ts:64-68), nên nếu map `ch02-2 → [ch02-2, a7]` kiểu thường thì sau migrate old slug **vẫn còn** (replace 1 lượt qua mảng, không xoá gì) — nhưng phải chứng minh bằng test, không giả định. Ghi policy vào code/docs: **mỗi batch đổi slug → thêm SPLIT_MAP entry + tăng `SCHEMA_VERSION` (+1 đơn điệu theo thứ tự thực thi — §12.4) + redirect 1 đích** trong cùng commit; entry `ch02-2` dùng mode `fan-out-keep-source` (keep source + add `a7-…`, không redirect); **test bắt buộc (acceptance criterion): storage cũ có `[ch02-2-…]` → sau migrate done chứa `ch02-2-…` (A6) VÀ `a7-…` (A7)** — chứng minh không xoá source sống; **chính sách legacy-credit §12.2** (4 case, gồm ch07→O1) ghi thành văn bản: bài vật chất mới không bao giờ tự done. Test thiết kế ngay trong task này (chạy bằng script Node polyfill localStorage); test tổng hợp toàn mapping ở IMP-072 | Policy nằm trong progress.ts header; test Node pass: `[ch02-2-…]` → `["ch02-2-…", "a7-…"]` (giữ source + thêm con); mô phỏng tay: storage cũ v4 + entry mới → migrate đúng | node script nhỏ polyfill localStorage chạy migrate + assert | Medium | M | `feat(progress): migration policy v5+ (slug-preserve + keep-source fan-out + legacy-credit rule)` |
| IMP-014 | Redirect strategy old→new — **8 old slug chết × 1 `redirectTarget` mỗi source (§12.5)** | `web/astro.config.mjs` (hoặc trang meta-refresh sinh từ registry) | IMP-012 | Chọn cơ chế Astro `redirects` config; thêm redirect **chỉ cho 8 old slug chết** (bảng §12.5) theo từng batch khi rename — **mỗi old slug đúng 1 đích** (mặc định = kế nhiệm logic đầu tiên; fan-out nhiều con chỉ diễn ra ở tầng progress, không ở tầng URL); **`ch02-2` KHÔNG redirect** (sống tiếp với tư cách A6 — §12.3); verify build ra redirect đúng | Redirect hoạt động ở build tĩnh (302/HTML); REDIRECT_MAP 8 source khớp bảng §12.5; thêm vào checklist batch; 0 redirect cho slug giữ nguyên | build + curl trang redirect | Low | S | `feat(routes): redirect map for 8 dead slugs (1 target each)` |
| IMP-015 | Lesson template kit | mới `docs/LESSON_TEMPLATE.md` + `web/src/components/lessons/_TEMPLATE.astro` (không route) | IMP-004…006 | Cố định anatomy §12 spec (12 khối) + hard parameters + checklist standard + chỗ gắn checkpoint/callout family/code header | Template build-safe (không bị lessonStats glob nhầm — đặt tiền tố `_`) | build | Low | S | `docs(content): lesson template kit` |
| IMP-016 | lessonStats refactor registry-driven | `web/src/data/lessonStats.ts` | IMP-010, IMP-012 | Đổi glob mù → resolve file từ registry (`slug → file name` quy ước); loại bucket "mồ côi" (ORPHAN quiz/shell không còn bị glob); hỗ trợ unit không quiz (appendix) và `stageId`/`phần x/y` metadata | Stats đúng cho 22 bài hiện tại (đối chiếu số cũ); không glob file `_TEMPLATE`/draft/orphan | build + so số cũ/mới | Medium | M | `refactor(stats): registry-driven lesson stats` |
| IMP-017 | GATE: registry + sidebar + migration cơ chế | — | IMP-010…016 | — | **REVIEW_GATE_REGISTRY**: build/check xanh; 22 route y nguyên (slug 100% chưa đổi ở điểm này); sidebar stage grouping đúng với 10 `stageId`; TARGET_REGISTRY_v5 khớp spec §6/§21 + schema §4b; đếm slug đúng **14 giữ URL / 8 old slug chết**; REDIRECT_MAP 8 source mỗi source 1 `redirectTarget` (§12.5); policy migration (SPLIT_MAP + bump version đơn điệu + redirect 1 đích) + **legacy-credit §12.2 (4 case)** + **keep-source fan-out §12.3** trong progress.ts/docs | build + checklist | — | S | `chore: gate registry` (tag) |

### Workstream C — Migration batches (pilot + stage batches)

> **Mỗi batch = đúng MỘT chương nội dung** — không task nào sửa > 1 chương cùng lúc (STEP 11C, log #23; Stage 4 thuần NEW là ngoại lệ vì không có gì migrate). Mỗi batch gồm đủ: (1) nội dung port/split theo mapping — **giữ nguyên slug mọi nơi chính sách §4b.3 không đòi đổi**; (2) quiz rebalance + audit; (3) nếu batch có rename: SPLIT_MAP entry (đúng mode — keep-source dùng `fan-out-keep-source` §12.3) + bump `SCHEMA_VERSION` + redirect **1 đích** trong cùng commit; (4) dọn file monolith/thừa của đúng chương đó; (5) build + gate checklist. File "ngủ đông" chỉ là nguồn thô — phải verify theo chuẩn trước khi dùng. **Quiz của batch chuyển sang harness chung (IMP-001) đúng trong batch đó** — không dồn về cuối.

| ID | Batch | Objective | Deps | Actions (tóm tắt) | Acceptance criteria | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|---|
| IMP-020 | **PILOT Ch10 → R1–R4** | Đổi slug `ch10-1-vi-sao-can-database` → `r1-...`; **giữ nguyên** `ch10-2-entity-dao-database`, `ch10-3-repository-viewmodel`, `ch10-4-giao-dien-va-cam-bay` (content identity 1:1 — chính sách §4b.3); áp đủ foundation A (checkpoint, callout family, code header, Mục x/y) lên 4 bài; port phần tốt từ prototype Ch10.2 | IMP-011…016 | Rename đúng 1 slug: file+registry+lessons.ts; SPLIT_MAP chỉ `ch10-1→[r1]` (legacy-credit **không** tự done S5 — §12.2); **bump version** (expected v5 — §12.4); redirect 1 đích `ch10-1-* → r1-*`; dọn tham chiếu chéo "Chương 10.x" | 4 bài live với 3 URL không đổi, 1 redirect `ch10-1-* → r1-*`; tiến độ giả lập ch10-2/3/4 cũ **không cần migrate** (slug giữ nguyên); ch10-1 cũ → r1 đúng; template đạt checklist | Medium | M | 1–2 commit |
| IMP-021 | PILOT quiz R1–R4 + demo harness roll-out | Rebalance theo §11: Ch10_1 7→≥8; Ch10_2 16→≤12 (dùng kết quả prototype làm cơ sở, port sạch); Ch10_3 10 ok; Ch10_4 8→≥8; 4 quiz này chuyển sang harness chung (tiếp nối 2 quiz chứng minh ở IMP-001) | IMP-001, IMP-002, IMP-020 | Áp harness chung; cân rank độ dài (≤40% mỗi rank, không >=60% cùng rank) + vị trí a/b/c/d đều; 100% giải thích distractor | quiz-audit PASS 4/4 (LIVE); screenshot trước/sau submit + retry ẩn→hiện→ẩn | Medium | M | 1 commit |
| IMP-022 | GATE pilot | — | IMP-020…021 | — | **REVIEW_GATE_PILOT**: toàn bộ cơ chế rename/migrate/redirect chạy thật lần đầu (với đúng 1 rename); 3 slug giữ nguyên không bị đụng progress; screenshot light/dark × desktop/mobile; build/check xanh | — | — | tag |
| IMP-030 | Stage 1a: Ch01 → A1–A4 | **KEEP ×4 — slug giữ nguyên toàn bộ, KHÔNG SPLIT_MAP, KHÔNG bump version**; đổi hiển thị lessonId A1–A4 + touch template (checkpoint/callout nơi hợp lý); giữ nguyên độ sâu | IMP-022 | Chỉ Ch01: registry lessonId + template; dọn shell `Ch01WelcomeToAndroidKotlin` + quiz monolith Ch01 (ORPHAN); sửa chỗ "chapter" trộn tiếng Anh nếu thuộc Ch01 | 4 bài A1–A4 có lessonId đúng trong registry; URL 0 đổi; audit PASS; voice scan 0 lỗi; build xanh | Low | S | 1–2 commit |
| IMP-031 | Stage 1b: Ch02 → A5–A8 (split 2.2) | KEEP (A5, A8) + **SPLIT 2.2 → A6 giữ old slug + A7 slug mới** + UPDATE A8 codename; **SPLIT_MAP entry mode `fan-out-keep-source` (§12.3) + bump version (expected v6)** trong cùng commit | IMP-030 | Ch02: `ch02-2` KHÔNG redirect (sống tiếp với tư cách A6); **không tạo entry SPLIT_MAP kiểu replace thường** — mode keep-source fan-out: done cũ `[ch02-2-…]` → giữ `ch02-2-…` (A6) + thêm `a7-…` (A7); dọn shell `Ch02GettingStartedAndroidStudio` + quiz monolith Ch02 (ORPHAN); test IMP-013 cho case này pass ngay trong batch | A6 vẫn sống tại URL cũ; A7 slug mới live; test `[ch02-2-…] → ["ch02-2-…", "a7-…"]` pass; A8 codename sửa đúng; voice scan 0 lỗi; build xanh | Medium | M | 2 commit |
| IMP-032 | Stage 1c: Ch03 → A9–A13 (split 3.2) | KEEP (A9, A12, A13) + **SPLIT 3.2 → A10/A11 (cả 2 slug mới)**; **SPLIT_MAP entry replace thường + bump version (expected v7) + redirect 1 đích `ch03-2-* → a10-*`** trong cùng commit | IMP-031 | Ch03: old slug `ch03-2` chết → redirectTarget = a10 (kế nhiệm logic đầu tiên — §12.5); dọn shell `Ch03AndroidFundamentals` + quiz monolith Ch03 (ORPHAN); sửa 2 chỗ "chapter" trộn tiếng Anh (còn tồn Task 47) | 5 bài A9–A13 có lessonId đúng; URL đổi đúng 1 (ch03-2 chết); redirect hoạt động; audit PASS; voice scan 0 lỗi; build xanh | Low | M | 2 commit |
| IMP-033 | Stage 1d: Ch04 → A14 (+AP1 draft) | REDUCE 15 mục → ~7 mục core "Gradle cho người mới" (25'); **giữ slug `ch04-gradle-basics-a-look-behind-the-curtain`** (REDUCE không đổi identity); phần release/signing/minify sâu **tách ra draft `docs/drafts/ap1-gradle-release.md`** (AP1 dựng ở WS F); forward-ref keys.properties → W3; **không SPLIT_MAP, không bump version** (1:1 REDUCE, credit giữ trọn) | IMP-032 | Viết a14 từ nội dung Ch04 (dùng draft ngủ đông Ch04_1/4_2/4_3 làm nguyên liệu, verify chuẩn); tạo draft AP1; dọn monolith Ch04 + 2 file Ch04_3 trùng + quiz ORPHAN Ch04_1 sau khi xác nhận git khôi phục được | a14 ≤30' tại URL cũ; AP1 draft chứa đủ phần release; keys.properties forward-ref đúng khuôn §9 standard | Medium | M | 2 commit |
| IMP-034 | Stage 1e: A4 roadmap update | UPDATE A4: bảng roadmap "lộ trình 11 chương" → Nền tảng + 7 giai đoạn; version lines | IMP-033 | Sửa phần roadmap trong a4 (URL không đổi); cập nhật text stage | Roadmap khớp spec §16; không đụng phần Gradle | Low | S | 1 commit |
| IMP-035 | Stage 2: Ch05 → C1–C4 (**đòi cả F1 và F2**) | SPLIT monolith Compose → C1 composable/layout, C2 Modifier/list (LazyColumn+key), C3 Material3/theming (gộp mảng Compose của ch03-4), C4 preview/vòng đời (LaunchedEffect intro + forward-ref S1); 4 slug mới | **IMP-043 (F1) VÀ IMP-044 (F2) — cả hai**, IMP-034, IMP-022 | Port từ monolith + draft ngủ đông 5.x; rename `ch05-jetpack-compose → [c1,c2,c3,c4]` + SPLIT_MAP replace + **bump version (expected v8)** + redirect 1 đích `ch05-* → c1-*`; quiz 10 câu monolith → 4 quiz 8–10 câu cân, chuyển harness; C3 kéo phần Compose-theme từ ch03-4 (cross-ref 2 chiều) | 4 bài ≤30', mỗi bài 1–3 khái niệm; C4 có gloss JIT chuẩn; learner vào C1 đã có đủ Kotlin (F1+F2 done-gate ở checklist batch); audit PASS ×4 | High | XL | 3–4 commit |
| IMP-036 | Stage 2 thêm: C5 a11y (thực thi qua WS D task **IMP-047**; chốt ở đây để stage batch đóng trọn) | NEW core-lite | IMP-035 (C4) | Thực thi qua IMP-047 (template, slug mới, quiz ≥8) | C5 live trong nhóm `compose`; Stage 2 hoàn chỉnh | Low | S | (thuộc IMP-047) |
| IMP-037 | Stage 3 (phần migrate): Ch06 → S2–S4 | SPLIT → S2 state/recomposition, S3 hoisting/UDF, S4 ViewModel/StateFlow **UPDATE: dạy `collectAsStateWithLifecycle` + `stateIn`**; 6.4 (jump-to-bottom, đọc lại) phân bổ: drift table → AP3 draft, dead-code reading → S4 cạm bẫy, jump-to-bottom → exercise S4; 3 slug mới | **IMP-045 (S1) đứng trước**, IMP-036, IMP-022 | Port + rename `ch06-advanced-jetpack-compose → [s2,s3,s4]`; SPLIT_MAP replace + **bump version (expected v9)** + redirect 1 đích `ch06-* → s2-*`; quiz 19 → 3×(8–12) cân, harness; tạo `docs/drafts/ap3-*` gom bảng drift | S4 dạy lifecycle-aware collection; audit PASS ×3; không mất nội dung dead-code | High | L | 3 commit |
| IMP-038 | Stage 3 thêm: S5 (thực thi qua WS D task **IMP-046**; chốt ở đây để stage batch đóng trọn) | NEW: S5 kiến trúc — thứ tự trong stage: S1 (IMP-045) → S2–S4 migrate → S5 | **IMP-045 (S1) done**, IMP-037 (S2–S4 live để giữ thứ tự registry) | Thực thi qua IMP-046 (S5: template, slug mới, quiz ≥8, legacy-credit §12.2) | S5 không tự done từ progress cũ (test ở IMP-072); Stage 3 hoàn chỉnh | Medium | S | (thuộc IMP-046) |
| IMP-039 | Stage 4: N1 → N2 (= WS D tasks IMP-048/049, chốt ở đây để stage batch đóng trọn) | NEW pair điều hướng (không migrate — batch chỉ gồm bài NEW) | IMP-046 (S5) | Thực thi qua IMP-048/049; A4 roadmap trỏ Stage 4 | N2 có warning callout back stack; audit PASS; Stage 4 hoàn chỉnh | Medium | M | (thuộc IMP-048/049) |
| IMP-040 | Stage 5: Ch08 → W1–W3 (**đòi S5 + N1 + N2**) | SPLIT → W1 coroutine/Flow đầy đủ, W2 Retrofit/Moshi-KSP (+ **Coil/AsyncImage gloss lần đầu**, trỏ NavHost → N1/N2), W3 trạng thái mạng + API key (+ error-to-user state); phân trang (8.3) → nén thành 1 mục đọc thêm trong W2 (mặc định; flag nếu review muốn khác); 3 slug mới | **IMP-046 (S5), IMP-048 (N1), IMP-049 (N2) — cả ba**, IMP-039, IMP-022 | Port + rename `ch08-networking → [w1,w2,w3]`; SPLIT_MAP replace + **bump version (expected v10)** + redirect 1 đích `ch08-* → w1-*`; keys.properties taught ở W3 + A14 đã forward-ref; quiz 19 → 3×(8–12), harness | W2 gloss Coil đúng khuôn; W3 có error-to-user; cross-ref N hợp lệ (N1/N2 đã live); audit PASS | High | L | 3 commit |
| IMP-041 | Stage 6-D: Ch09 → D1–D2 | SPLIT → D1 DataStore & SharedPreferences legacy, D2 Prefs trong app (CompositionLocal + wiring, + **Hilt seam note**); 2 slug mới | IMP-022 | Port + rename `ch09-data-store → [d1,d2]`; SPLIT_MAP replace + **bump version (expected v11)** + redirect 1 đích `ch09-* → d1-*`; quiz 19 → 2×(8–12), harness; draft ngủ đông 9.x verify | D2 có Hilt seam note 1–2 câu; audit PASS | Medium | M | 2 commit |
| IMP-042 | Stage 7: Ch11 → X1–X2 | SPLIT → X1 files/SAF/backup, X2 mã hoá: Keystore/SQLCipher + **ESP/security-crypto = HISTORICAL-REF** ("deprecated 4/2025, không dùng app mới"); bảng tổng hợp/drift Ch11_5 → AP3 draft; 2 slug mới | IMP-046 (S5 live trước X2), IMP-022 | Port + rename `ch11-advanced-storage → [x1,x2]`; SPLIT_MAP replace + **bump version (expected v12)** + redirect 1 đích `ch11-* → x1-*`; ESP chuyển khối "Lỗi thời/phiên bản" đúng family; quiz 19 → 2×(8–12), harness | X2 ESP framing historical đúng spec §10/§23; 0 mất nội dung valuable (đối chiếu §20); audit PASS | Medium | L | 2–3 commit |

### Workstream D — New core content (xen theo stage)

> Mỗi task: viết bài theo template kit + quiz 8–12 cân + stage wiring + audit. Nguồn: spec §7 (F), §8 (S1), §6 (còn lại), standard về voice/forward-ref. **Không viết trước khi tiền quyết của nó đã merge** — deps ghi đầy đủ ở cột Deps (audit correction pass: Ch05 đòi cả F1 và F2, S5 đòi S1, N1 đòi S5 — xem nguyên tắc phụ thuộc §4.2). Mọi lesson NEW có **slug mới** (§4b.3). Mọi bài NEW **không tự done từ progress cũ** (§12.2 case D — test ở IMP-071/072).

| ID | Lesson | Nguồn chính | Deps | Acceptance criteria | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|
| IMP-043 | **F1** Kotlin đủ để học Compose — P1 (biến, hàm, null safety, collections, lambda/function types) | Harvest gloss Ch01–03 + spec §7 MUST-list | **IMP-033** (Stage 1a–e xong — Ch04 là batch nội dung cuối Stage 1) | 25'; learner đọc xong F1+F2 gọi tên được mọi construct trong file Compose 30 dòng (verify-criterion); quiz ≥8 cân | Medium | L | 1–2 commit |
| IMP-044 | **F2** — P2 (data class, `by`, sealed-state, generics recognition) | ch03.2 `by`, Ch10 data class, Ch10.4 sealed note | IMP-043 | như trên; F2 có quiz riêng ≥8 | Medium | M | 1–2 commit |
| IMP-045 | **S1** Coroutine 20 phút đủ để không sợ (suspend/scope/dispatcher) | Ch08 phần coroutine (harvest) + Ch10.3 precision | IMP-044 | 20'; 4 mental-model tối thiểu spec §8 có mặt; KHÔNG có internals (cancellation/supervisor); quiz ≥8; đứng **trước** S2 trong registry | Medium | M | 1–2 commit |
| IMP-046 | **S5** Kiến trúc: UI tầng – data tầng – repository | **Ch10.1 five-layer doctrine + Ch10.3 repository WHY** (không phải Ch07) | **IMP-045 (S1)** | 25'; repository dạy trước networking (W2 dùng); cross-ref R3 2 chiều; quiz ≥8; **legacy-credit: KHÔNG tự done từ progress cũ** (§12.2 case C) | Medium | M | 1–2 commit |
| IMP-047 | **C5** Tiếp cận mọi người dùng: a11y cơ bản (core-lite) | spec MR-024; ví dụ từ project mẫu | IMP-035 (C4) | 20'; contentDescription, 48dp, font scaling, contrast, semantics tồn tại; quiz ≥8; badge "Lõi" | Medium | M | 1–2 commit |
| IMP-048 | **N1** Điều hướng: destination, NavHost, navigate() | NEW (spec §9); đối chiếu MainActivity ch08 có NavHost thật | **IMP-046 (S5)** | 25'; mental model back stack; không dùng route type-safe sâu (để N2); quiz ≥8 | Medium | M | 1–2 commit |
| IMP-049 | **N2** Back stack & truyền dữ liệu type-safe | NEW; Nav-3 note 1 dòng trong drift | IMP-048 | 25'; 1 warning callout "không cất object vào back stack"; quiz ≥8; A4 roadmap trỏ đúng Stage 4 | Medium | M | 1–2 commit |

### Workstream E — Quiz migration (liên tục)

> **Blast radius rule (correction pass):** KHÔNG có task nào đòi sửa cả 26 quiz file cùng lúc. Harness được chứng minh trên 2 quiz LIVE (IMP-001); quiz LIVE chuyển sang harness **từng batch theo WS C/D** đúng lúc batch đụng bài đó; sweep cuối (IMP-063) chỉ chỉnh **data** các quiz còn sót; quiz ORPHAN không bao giờ bị đụng ngoài batch cleanup (IMP-064).

| ID | Objective | Deps | Actions | Acceptance criteria | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|
| IMP-062 | Audit baseline toàn khoá (LIVE vs ORPHAN) | IMP-002 | Chạy audit trên 26 file; **phân loại 22 LIVE / 4 ORPHAN** (đối chiếu `lessons.ts`); xuất backlog (câu quá nhiều, thiếu explanation, lệch rank) vào `docs/QUIZ_MIGRATION_STATUS.md` — bảng có cột LIVE/ORPHAN + cột "đã sang harness chưa" | Bảng trạng thái từng file: LIVE (đã/chưa migrate) + ORPHAN (đợi batch cleanup); khớp số đếm tay | Low | S | 1 commit |
| IMP-063 | Sweep editorial quiz còn lại | IMP-062, IMP-030…042 | Quiz LIVE giữ nguyên cấu trúc (a*, r*, d*) chỉ cần cân rank/vị trí + đủ 4 options + explanation — sửa **data**, không viết lại đề, không đụng script (harness đã có). Mục tiêu 0 quiz LIVE nằm ngoài harness khi task này đóng | audit PASS 100% quiz LIVE; 100% quiz LIVE chạy harness chung; "always-longest/shortest" ≤40% mọi quiz | Medium | M | 1–2 commit |
| IMP-064 | Decommission quiz/file thừa (chỉ ORPHAN) | IMP-030…042 | Xoá đúng **4 quiz ORPHAN** + file lesson mồ côi còn lại (3 shell Ch01/02/03, draft Ch04_3 trùng…); quét import không dùng; xác nhận git khôi phục được | `lessons.ts` không còn entry chết; lessonStats không glob nhầm; audit report không còn mục ORPHAN; build xanh | Low | S | 1 commit |
| IMP-065 | GATE: quiz sweep đóng | — | IMP-062…064 | — | 100% quiz LIVE trong harness + PASS audit; 0 file ORPHAN còn trên đĩa; build/check xanh | build + audit report | — | S | `chore: gate quiz-sweep` (tag) |

### Workstream F — Optional + appendix

| ID | Objective | Deps | Actions | Acceptance criteria | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|
| IMP-050 | Ch07 REDUCE → **O1** case study Ditto & offline-first + **AP2** draft | IMP-012 (registry), IMP-046 (S5 — để cross-ref "kiến trúc đã học ở S5" hợp lệ), IMP-039 (Stage 4 đóng — O1 xếp sau core theo phase) | O1 = REDUCE **kế nhiệm trực tiếp** concepts (repository-vs-live-engine, local-first) 30' từ Ch07; **credit: old `ch07` done → O1 done** (§12.2 case B — O1 kế nhiệm trực tiếp nội dung REDUCE 1:1, bản chất giống A14/ch04; O1 optional nên không làm phình core progress); API Ditto sâu → `docs/drafts/ap2-ditto-api.md`; retire slug `ch07-advanced-architecture → [o1]` SPLIT_MAP + redirect 1 đích + **bump version (expected v13 — §12.4)**; badge "Mở rộng" | O1 không lẫn core path (registry `stageId=optional`); test migrate: `ch07-…` cũ → O1 done; AP2 draft đủ; audit PASS O1 | Medium | M | 2 commit |
| IMP-051 | **O2** Testing: test ViewModel + 1 test UI | IMP-049 | 45'; readiness-oriented; fake repository; quiz ≥8 | Trong optional track; không đòi hỏi ở core; **không tự done từ progress cũ (§12.2 case D)** | Medium | L | 1–2 commit |
| IMP-052 | **O3** Adaptive UI (window size classes) | IMP-049 | 30'; quiz ≥8 | như trên | Low | M | 1 commit |
| IMP-053 | **O4** WorkManager (mở rộng từ khảo sát ch03-3) | IMP-032 | 30'; quiz ≥8 | như trên | Low | M | 1 commit |
| IMP-054 | **O5** Room migration đầu tiên (mở rộng R2) | IMP-020 | 30'; quiz ≥8 | như trên | Low | M | 1 commit |
| IMP-055 | **O6** Capstone hướng dẫn app ghi chú | **IMP-040 (W1–W3), IMP-041 (D1–D2), IMP-042 (X2), IMP-051 (O2 fake-repo pattern tuỳ chọn)** — capstone đòi đủ mọi core capability nó assembly: A14 (build), C2/C3 (UI/list), S4 (ViewModel/StateFlow), N1/N2 (điều hướng), W2/W3 (mạng + error state), D1 (DataStore), R2/R3 (Room + repository) | 90' project; assemble đủ stage; followable không cần search ngoài; mọi prereq đã live trước khi viết | Đủ mọi bước có kiểm chứng; badge recommended; checklist capstone trỏ đúng bài đã dạy từng kỹ năng | Medium | L | 1–2 commit |
| IMP-056 | **AP1** từ draft (signing/keystore/minify) | IMP-033 | Dựng trang reference từ `docs/drafts/ap1-*`; không quiz (kind=reference) | Route `ap1-…` live trong group Mở rộng | Low | S | 1 commit |
| IMP-057 | **AP2** từ draft (Ditto API deep-dive) | IMP-050 | như AP1 | như trên | Low | S | 1 commit |
| IMP-058 | **AP3** Bảng tra cứu (versions, commands, glossary) | IMP-037/042 drafts | Gom drift tables + glossary; số chương sách cũ chuyển vào đây (spec §16) | Mọi bảng drift tổng nằm 1 chỗ; core bài không còn bảng trùng | Medium | M | 1 commit |
| IMP-059 | Treatment "Mở rộng" trên site | IMP-011 | Dashed card + badge cho optional; appendix vào group riêng; sidebar collapsed; core path không bị nhiễm | Nhìn vào sidebar/roadmap thấy rõ lõi vs mở rộng; progress core không đếm optional | Low | M | 1 commit |
| IMP-060 | GATE: optional track đóng | — | IMP-050…059 | — | **REVIEW_GATE_CONTENT_BATCH** (batch optional): O1–O6 + AP1–AP3 live đúng treatment; credit ch07→O1 migrate đúng (test IMP-072 case (d) — §12.2 case B); 0 optional nhiễm core path | build + checklist + test migrate | — | S | `chore: gate optional-track` (tag) |

### Workstream G — Progress migration (ngữ nghĩa cuối)

| ID | Objective | Deps | Actions | Acceptance criteria | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|
| IMP-070 | Model B-lite | IMP-060, IMP-059 | Completion = confirm **và** ≥1 quiz attempt (flag local, không threshold); quiz submit set flag (event từ harness IMP-001); copy "Đánh dấu đã học khi bạn đã đọc hết bài và thử làm quiz…"; hint nhẹ "chưa làm quiz" trên lesson/home card; per-stage progress helpers (group theo `stageId`); attempts lưu key riêng `:quiz-attempts` (không đụng version) | Flag set khi submit; completion gate đúng copy; hint không gây nhiễu; test simulate qua script | Medium | M | 1–2 commit |
| IMP-071 | Seed legacy + không-fabricate test toàn khoá | IMP-070 | **Seed: completion cũ → quizAttempted = done** (tránh hint giả hàng loạt — seed chỉ đặt flag *attempt*, không tạo completion mới); **test assert không-fabricate: mọi bài NEW (F1/F2/S1/S5/C5/N1/N2/O2–O6/AP1–AP3) không tự done từ bất kỳ storage cũ nào**; test storage v4 mọi biến thể (monolith, đã tách, hỗn hợp, rỗng, JSON hỏng) qua chuỗi version | Script test pass: seed đúng 1 chiều; 0 bài NEW/O2–O6/AP tự done; không crash với JSON hỏng | High | M | 1 commit |
| IMP-072 | SPLIT_MAP tổng audit + migration test toàn khoá (9 case) | IMP-071, IMP-050 (entry ch07 đã chốt) | Toàn bộ mapping v5+ (bảng §12.1 — **9 entry**: 6 replace thường + 1 REDUCE ch07 + 1 `fan-out-keep-source` ch02-2 + 1 REDUCE ch10-1) vào 1 bảng review; test script simulate storage v4 (mọi biến thể: monolith, đã tách, hỗn hợp, rỗng, JSON hỏng) → migrate **từng version theo đúng thứ tự §12.4 (v5→v13)** → assert: (a) không mất credit; (b) **case ch02-2: done cũ chứa old slug → sau migrate chứa old slug (A6) VÀ a7 (A7)** — không xoá source sống; (c) `ch10-1` cũ → chỉ R1 done, S5 KHÔNG done; (d) `ch07` cũ → O1 done; (e) 0 bài NEW tự done; (f) version bump đơn điệu theo thứ tự thực thi | 0 slug hợp lệ bị rơi; 0 credit mất; **ch02-2 keep-source fan-out đúng (A6 + A7)**; **ch07 → O1 đúng**; 0 bài NEW tự done; test script pass; tài liệu hoá quyết định seed + `ch10-1→[r1]` + `ch07→[o1]` | High | M | 1 commit |

### Workstream H — Homepage / navigation

| ID | Objective | Deps | Actions | Acceptance criteria | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|
| IMP-080 | Homepage roadmap v2 | IMP-072 | Hero: "2 bài nền tảng + 7 giai đoạn · 39 bài lõi · 6 mở rộng · ~17 giờ lõi" + sub-note; **số liệu tính từ registry/stats, không hardcode**; "Bạn đang ở đâu" 7-segment + foundation block; resume card có stage label; 7 stage card + Nền tảng card (core trước, optional dashed); section "Mở rộng (không bắt buộc)"; progress panel per-stage; terminal state | Mỗi con số trên hero truy vết được từ registry; đúng khuôn spec §16; light/dark + 390px đạt | Medium | L | 2 commit |
| IMP-081 | Search + reading stats final | IMP-080 | Search thêm stage label, bao optional/appendix; đánh lại top-12 cap nếu route tăng (ghi decision); lesson header/stats thêm context stage + "phần x/y" | Search trả kết quả đúng cho từ khoá cũ + mới; stats hiển thị stage | Low | M | 1 commit |
| IMP-082 | Truth-check counts | IMP-080 | Script/compare: count lessons/minutes registry vs số hiển thị hero/roadmap/progress | 0 lệch số; phụ thuộc vào QA gate | Low | S | 1 commit |

### Workstream I — Final QA

| ID | Objective | Deps | Actions | Acceptance criteria | Risk | Size | Commit |
|---|---|---|---|---|---|---|---|
| IMP-090 | Full QA suite | IMP-082 | Chạy tất cả: build, astro check, integrity route/import (script: mọi slug registry có entry lessons.ts & ngược lại), link integrity (crawl dist, stdlib), **page-count check từ registry** (số route live trong `dist/` == số entry có quiz/routeable trong TARGET_REGISTRY — không so với con số hardcode), 0 lesson/quiz thiếu, time caps (lessonStats ≤30' core), template checklist 100%, quiz-audit 100% LIVE, voice scan (loại trừ code/source/reference block), **used-before-taught trên TOÀN BỘ 39 bài core** (F1–F2, A1–A14, C1–C5, S1–S5, N1–N2, W1–W3, D1–D2, R1–R4, X1–X2 theo thứ tự lessonId trong TARGET_REGISTRY — không spot-check), light/dark/mobile checklist, progress test | Toàn bộ gate số xanh; kết quả ghi `docs/QA_FINAL_REPORT.md` | Medium | L | 1 commit |
| IMP-091 | S-register no-regression verify | IMP-090 | Checklist 16 mục Master §10 (đặc sản: cạm bẫy, drift "nên theo", code thật + dòng, quiz giải thích distractor, mental model, đánh số mục, voice độc lập…) đối chiếu từng nhóm bài | 16/16 giữ nguyên hoặc mạnh hơn; sai nào sửa trước gate | Medium | M | 1 commit |
| IMP-092 | Docs sync + đóng project | IMP-091 | Cập nhật `PROJECT_PLAN.md` (đóng Phase redesign), `README`, đánh dấu `CHAPTER_SPLIT_MAP.md` = superseded bởi TARGET_REGISTRY_v5; lesson template kit làm chuẩn duy nhất | Tài liệu phản ánh đúng trạng thái; không còn chỉ dẫn chết | Low | S | 1 commit |

---

## 8. Review Gates

> Gates là **điểm dừng bắt buộc** do owner chỉ định ở STEP 11 — vượt qua review owner (hoặc agent review được uỷ quyền) trước khi batch tiếp theo mở. Điều này có chủ đích khác quy tắc "không dừng xin confirm" trong `CLAUDE.md`: redesign là dự án nhiều phase, gate là hợp đồng review, không phải câu hỏi lịch sự.

**`REVIEW_GATE_UI_FOUNDATION`** (sau IMP-008)
- build + `astro check` xanh trên main.
- TOC (desktop rail + counter + active khi `>1024px`; card + counter khi `<=1024px` — **breakpoint 1024px, không phải 1240px**), checkpoint, code header, callout families hoạt động ở ≥1 bài thật (Ch10.2) — đối chiếu screenshot prototype `3ae75d1`, không thoái lui.
- Counter khởi tạo `Mục 1/y`, không bao giờ `Mục 0/y`; inactive dark-mode dùng token text đậm hơn (contrast đạt như screenshot prototype 21/33).
- Quiz harness chung giữ nguyên hành vi trên 2 quiz đại diện (submit/score/scroll/aria-live/**retry ẩn trước submit → hiện sau submit → ẩn lại sau reset**).
- Checklist `UI_VERIFICATION_CHECKLIST.md` chạy qua: 4 viewport × 2 theme, 0 lỗi contrast mới.
- **Chưa** đụng nội dung bài học nào ngoài demo Ch10.2.

**`REVIEW_GATE_REGISTRY`** (sau IMP-017)
- Registry có `stageId` metadata (10 giá trị §4b.2) + sidebar grouping "Nền tảng + 7 giai đoạn" đúng cho 22 bài hiện có.
- `TARGET_REGISTRY_v5.md` khớp spec §6/§21 (39 core / 6 optional / 3 AP; 1005' / 255') + schema §4b (8 trường/unit); cột slug cho thấy đúng **14 giữ nguyên URL / 8 old slug chết**; REDIRECT_MAP 8 source × 1 `redirectTarget` (§12.5).
- Policy migration (SPLIT_MAP đúng mode + bump version đơn điệu §12.4 + redirect 1 đích) + **legacy-credit 4 case (§12.2, gồm ch07→O1)** + **keep-source fan-out (§12.3)** viết thành văn bản trong progress.ts/docs.
- 22 route hiện tại không đổi; build xanh; render trang chủ/bài không khác trước (đối chiếu baseline text).

**`REVIEW_GATE_PILOT`** (sau IMP-022) — *gate quan trọng nhất: cơ chế đổi slug chạy thật lần đầu*
- 4 bài R1–R4 live với **đúng 1 URL mới** (`r1-…`), 3 URL giữ nguyên; `ch10-1-*` redirect 1 đích; SPLIT_MAP entry `ch10-1→[r1]` + `SCHEMA_VERSION` bump (expected v5 — §12.4) trong cùng commit.
- Simulate: localStorage có `ch10-1..4` (và biến thể monolith cũ) → mở site → `ch10-2/3/4` progress giữ nguyên (không migrate), `ch10-1` → r1; **S5 không xuất hiện trong done**.
- 4 bài đạt template checklist; quiz audit PASS ×4; screenshot light/dark × desktop/mobile.
- Owner duyệt **cơ chế** trước khi nhân rộng — sau gate này, các batch còn lại là lặp cơ chế đã chứng minh.

**`REVIEW_GATE_CONTENT_BATCH`** (standing — sau MỖI batch Stage, gồm cả batch optional)
- Batch đóng trọn stage: migration + quiz + lesson mới thuộc stage; **điều kiện tiên quyết của batch đã merge đầy đủ** (Stage 2/Ch05 đòi cả F1 và F2 — IMP-043 + IMP-044; Stage 3 đòi S1 (IMP-045) trước S2–S4 và S5 (IMP-046); Stage 4 đòi S5 trước N1; Stage 5/Ch08 đòi S5 + N1 + N2 — IMP-046/048/049) — kiểm tra trước khi mở batch.
- **Mỗi batch đúng 1 chương nội dung** (log #23): task Stage 1 tách Ch01/Ch02/Ch03/Ch04 riêng — review tuần tự Ch01 → Ch02 → Ch03 → Ch04 → F1/F2.
- Template compliance 100% bài trong batch (1 `cam-bay`, 1 `nguon`, đánh số mục liên tục, callout caps, checkpoint nếu >1.200 từ, ≤30' core).
- quiz-audit PASS mọi quiz LIVE trong batch; mọi quiz của batch đã chuyển harness; build + check xanh; link chéo trong batch không gãy (link ra stage chưa làm → dùng text không link hoặc placeholder ghi rõ).
- Voice scan (loại trừ code/Nguồn): 0 "sách/chapter/tác giả" ngoài Nguồn; prereq scan: 0 used-before-taught mới không gloss.
- Dọn dẹp batch: monolith + file ngủ đông tương ứng đã xử lý; `lessonStats` không còn glob mồ côi; **slug policy tuân thủ §10.1** (0 rename ngoài danh sách).
- Batch có rename: SPLIT_MAP đúng mode (keep-source fan-out cho ch02-2 — §12.3) + bump version đơn điệu + redirect **1 đích** trong cùng commit.

**`REVIEW_GATE_NEW_CORE`** (sau IMP-049, trùng gate batch Stage 4)
- 7 bài mới (F1, F2, C5, S1, S5, N1, N2) đủ tiêu chí riêng của từng task + quiz ≥8 cân; tất cả đều **không tự done từ progress cũ** (§12.2 case D).
- Prereq audit spec §8: không StateFlow/viewModelScope trước S1/S4; không repository trước S5; không NavHost dùng trước N1; verify-criterion F (file Compose 30 dòng) kiểm thử được.
- A4 roadmap trỏ đúng Stage 4; core path đếm đúng 39 khi cộng dồn registry.

**`REVIEW_GATE_PROGRESS`** (sau IMP-072)
- B-lite hoạt động: submit quiz → flag; completion gate mới; hint "chưa làm quiz" đúng chỗ.
- Test matrix progress: v4 storage {monolith-only, split-only, hỗn hợp, rỗng, JSON hỏng} → migrate qua mọi version (thứ tự §12.4) → assert đúng, không mất credit, không crash, **không fabricated credit cho bài NEW (§12.2 case D)**.
- **Case keep-source fan-out (§12.3): done cũ `[ch02-2-…]` → sau migrate chứa `ch02-2-…` (A6) VÀ `a7-…` (A7)** — chứng minh bằng test, không phải giả định hành vi replace của `migrateProgress()`.
- **Case ch07→O1 (§12.2 case B): done cũ `[ch07-…]` → O1 done** (kế nhiệm trực tiếp); đồng thời assert O1 không làm tăng core progress.
- Seed legacy documented; SPLIT_MAP tổng = bảng §12.1 của plan (**9 entry** — 6 replace + 1 REDUCE ch07 + 1 keep-source ch02-2 + 1 REDUCE ch10-1 — không thiếu, không thừa); version bump đơn điệu theo thứ tự thực thi (expected v5→v13).

**`REVIEW_GATE_FINAL`** (sau IMP-092)
- Mọi gate số trong `QA_FINAL_REPORT.md` xanh (danh sách đầy đủ ở §13).
- S-register 16/16; spec §25 success criteria 10/10 checklist.
- Homepage trung thực (truth-check script); optional không nhiễm core path.
- Working tree clean, mọi commit đã message chuẩn, tag gate đã đặt.

---

## 9. Prototype Promotion Strategy

Prototype `3ae75d1` = bằng chứng validate, **không merge**. Xử lý từng thay đổi:

| Prototype change | Quyết định | Cách đưa vào main |
|---|---|---|
| TOC counter "Mục x/y" + `.toc-head` + `li.cur` mobile + IO wiring + **breakpoint 1024px** + inactive `--text-2` (fa63a8e + 3ae75d1) | **PROMOTE (port sạch)** | IMP-003 — tái viết trên markup hiện tại của main, dùng diff prototype làm spec hành vi (init "Mục 1/y", không 0/y; `>1024px` sticky rail / `<=1024px` card; one-breakpoint model cùng mốc shell) |
| Quiz UX: Câu x/N, **retry ẩn trước submit → hiện sau submit → ẩn lại sau reset**, confirm khi làm lại, score scrollIntoView, aria-live | **PROMOTE (vào harness)** | IMP-001 — trở thành hành vi mặc định của harness chung, mọi quiz hưởng |
| `.checkpoint` component + CSS | **PROMOTE (port sạch)** | IMP-004 — nâng thành component có guideline (khi nào đặt, caps) |
| Code metadata header (`data-file`/`data-lines` → CodeEnhance) | **PROMOTE (port sạch)** | IMP-005 — giữ optional attr, block cũ không đổi |
| Callout families CSS (goals/mental/note/warn/diff/journey) | **PROMOTE (port sạch, mở rộng)** | IMP-006 — thêm family "outdated" (spec §19 có 6 family, prototype demo 7 class gồm journey); fallback cho callout cũ |
| Ch10_2 lesson edit (23 dòng) + quiz 16→12 (238 dòng) | **KHÔNG cherry-pick** | IMP-020/021 — batch Ch10 làm lại theo đúng pipeline; kết quả prototype (12 câu; rank R1=2/R2=4/R3=3/R4=3; vị trí 3/3/3/3) là **đích chất lượng**, port bằng tay trong batch |
| `lesson.css` +200 dòng / `quiz.css` +48 dòng từng phần | **Port có chọn lọc** | Đi kèm IMP-003…006; trước khi port, kiểm trùng selector với CSS đã redesign ở Task 46 |
| `web/screenshots/*` PNG | **KHÔNG promote** | Giữ nguyên trong prototype branch làm bằng chứng đối chiếu |

Nguyên tắc: **mọi port đều re-verify trên main** (build, 2 theme, 4 viewport) — không có "paste mù từ prototype".

---

## 10. Content Migration Strategy

### 10.1 Phân loại theo batch (từ mapping Current→Target spec §6/§10/§20)

| Batch | Chương | Phân loại chính | Slug policy (§4b.3) |
|---|---|---|---|
| Stage 1 | Ch01 | **KEEP ×4 + đổi lessonId A1–A4** | 4 slug giữ nguyên |
| Stage 1 | Ch02 | **KEEP (A5, A8) + SPLIT (2.2→A6/A7) + UPDATE (A8 codename)** | ch02-1, ch02-3 giữ nguyên; 2.2 split → A6 giữ `ch02-2-…`, A7 slug mới |
| Stage 1 | Ch03 | **KEEP (A9, A12, A13) + SPLIT (3.2→A10/A11) + UPDATE** | ch03-1/3/4 giữ nguyên; 3.2 split → 2 slug mới (A10/A11) |
| Stage 1 | Ch04 | **REDUCE (15→~7 mục = A14) + MOVE (release depth → AP1)** | slug `ch04-…` giữ nguyên (REDUCE 1:1, credit trọn) |
| Stage 2 | Ch05 | **SPLIT (→C1–C4)** | monolith đổi URL → 4 slug mới |
| Stage 3 | Ch06 | **SPLIT + UPDATE (→S2–S4)** | monolith đổi URL → 3 slug mới |
| Stage 4 | — | (toàn bộ NEW — WS D) | slug mới: N1, N2 |
| Stage 5 | Ch08 | **SPLIT + UPDATE (→W1–W3)** | monolith đổi URL → 3 slug mới |
| Stage 6 | Ch09 | **SPLIT (→D1–D2)** | monolith đổi URL → 2 slug mới |
| Stage 6 | Ch10 | **KEEP + REORDER (→R1–R4; 10.1/10.3 doctrine → S5)** | ch10-2/3/4 giữ nguyên; chỉ ch10-1 đổi slug (R1 mới) |
| Stage 7 | Ch11 | **SPLIT + HISTORICAL (→X1–X2)** | monolith đổi URL → 2 slug mới |
| Optional | Ch07 | **REDUCE (→O1) + MOVE (API → AP2)** | slug đổi (`ch07-…` → O1 mới) vì chuyển track; **credit old ch07 → O1** (§12.2 case B — kế nhiệm trực tiếp) |
| — | Drift tables rải rác | **MOVE → AP3** | (appendix, slug mới) |

**Tổng URL thật sự đổi: 8 old slug chết** (ch10-1, ch05, ch06, ch07, ch08, ch09, ch11 + ch03-2; bảng §12.1) — `ch02-2` tiếp tục sống với tư cách A6. **14/22 URL hiện tại giữ nguyên** (13 KEEP hoàn toàn + `ch02-2` sống tiếp với tư cách A6).

### 10.2 Quy tắc port (áp mọi batch)

1. **Port, không viết lại** — nội dung Giữ được giữ nguyên ý; chỉ thay voice/template/family callout nơi chuẩn đòi hỏi.
2. **Không xoá nội dung valuable** — mỗi mục bị REDUCE/phân bổ lại phải có đích (bài khác / AP draft / exercise); checklist đối chiếu §20 trong gate batch.
3. **Cross-ref "Chương N"** đổi theo lessonId/stage framing mới; link chéo chỉ trỏ stage đã live; URL không đổi thì cross-ref URL cũng không đổi.
4. **Draft ngủ đông (Ch04–11)** = nguyên liệu thô; verify chuẩn + spec trước khi dùng, không coi là xong sẵn.
5. **Xoá file monolith** sau khi (a) bản mới là superset, (b) `lessons.ts` không còn tham chiếu, (c) commit riêng để dễ revert (tiền lệ Task 47 với monolith Ch10).
6. **Voice/attribution** theo standard §6: mọi "sách…" ra khỏi thân bài; Nguồn block duy nhất giữ book chapter + `aaf-materials/` + dòng.
7. **Không đổi slug ngoài đúng danh sách §10.1** — batch nào thấy cần thêm rename phải flag lên review trước, không rename sẵn.

---

## 11. Quiz Migration Strategy

**Contract (spec §13, đo được):** 8–12 câu · đúng 4 options · cân rank độ dài (không rank nào chiếm quá ~40%, fail cứng nếu ≥60% đáp án đúng cùng một rank) · vị trí đúng đều a/b/c/d · 100% giải thích (đúng + vì sao từng distractor sai) · distractor cùng họ lỗi thật · mix ~30/40–50/20–30 (recall/apply/code-reading) · UX: Câu x/N, 2 cột rộng màn, fieldset tint, scroll điểm, aria-live, "Làm lại" có confirm · submit đặt flag "quiz đã làm".

**Đích chất lượng đã verify trên prototype `3ae75d1` (Ch10.2 final, 12 câu):**
- **Phân bố rank độ dài đáp án đúng (R1 = ngắn nhất … R4 = dài nhất):** R1 = 2 · R2 = 4 · R3 = 3 · R4 = 3 (đo theo **số từ**; max rank = 4/12 ≈ 33%, dưới ngưỡng 40%; bản kế hoạch cũ mô tả "axis 0/12" — không phải con số đo được, đã bỏ).
- **Phân bố vị trí đúng:** a/b/c/d = 3/3/3/3.
- **UX retry (đã verify):** nút "Làm lại" **ẩn trước submit → hiện sau submit → ẩn lại sau reset** (confirm trước khi xoá; không reload).

**Chiến lược bốn bước (blast radius có kiểm soát):**

1. **Harness trước, phạm vi hẹp (IMP-001):** build shared harness + chứng minh trên **2 quiz LIVE đại diện** (Ch10_2 tách + Ch05 monolith). KHÔNG đụng 24 file còn lại trong task này.
2. **Lint đo được, phân loại LIVE/ORPHAN (IMP-002):** `quiz-audit.mjs` đọc `lessons.ts` để phân loại; gate chỉ áp cho LIVE; ORPHAN chỉ inventory.
3. **Migrate theo batch:** mỗi batch C/D rebalance quiz của bài nó đụng **và** chuyển chúng sang harness (mục tiêu: monolith 19 → các quiz 8–12 của bài con; 7-câu ch10.1 → ≥8; 15-câu ch03.2 → ≤12 sau split; 16-câu ch10.2 → ≤12 — đích chất lượng như trên). Sau mỗi batch: mọi quiz của batch nằm trong harness.
4. **Sweep cuối (IMP-063):** chỉ audit + chỉnh data cho quiz LIVE còn sót; ORPHAN xử lý riêng ở IMP-064.

**Đích số:** sau IMP-064: 100% quiz LIVE PASS audit; 0 quiz LIVE ngoài harness; 0 quiz >12 câu; 0 quiz <8 câu; 0 file ORPHAN còn trên đĩa.

---

## 12. Progress Migration Strategy

**Nguyên tắc:** tiến độ người học là dữ liệu production — **không slug nào biến mất không có mapping**, không schema change nào thiếu đường migrate; **và** bài học mới không bao giờ được "tự hoàn thành" từ progress cũ (dưới đây gọi là **nguyên tắc không-fabricate**).

### 12.1 Mapping SPLIT_MAP v5 (old → new) — chốt ở IMP-012, áp chính sách slug §4b.3

> **9 entry mới** (6 replace thường + 1 REDUCE `ch07` + 1 `fan-out-keep-source` ch02-2 + 1 REDUCE `ch10-1`). Mọi slug không liệt kê ở đây **giữ nguyên URL và progress không bị đụng tới**.

| # | Old slug | New slugs | Mode | Ghi chú |
|---|---|---|---|---|
| 1 | ch02-2-may-ao-may-that-doc-project | `[ch02-2-… (A6, giữ), a7-… (mới)]` | **fan-out-keep-source** (§12.3) | SPLIT — A6 **giữ nguyên old slug (URL không chết, không redirect)**, A7 slug mới (chốt IMP-012) |
| 2 | ch03-2-string-resource-va-debug | `[a10-… (mới), a11-… (mới)]` | replace | SPLIT — cả 2 con slug mới (old chết); **redirectTarget = a10** (kế nhiệm logic đầu tiên — §12.5) |
| 3 | ch05-jetpack-compose | `[c1, c2, c3, c4]` | replace | SPLIT monolith → 4 slug mới; redirectTarget = c1 |
| 4 | ch06-advanced-jetpack-compose | `[s2, s3, s4]` | replace | SPLIT monolith → 3 slug mới; redirectTarget = s2 |
| 5 | ch07-advanced-architecture | `[o1]` | replace (REDUCE) | O1 = kế nhiệm trực tiếp của Ch07 → **credit chuyển sang O1** (§12.2 case B); redirectTarget = o1 |
| 6 | ch08-networking | `[w1, w2, w3]` | replace | SPLIT monolith → 3 slug mới; redirectTarget = w1 |
| 7 | ch09-data-store | `[d1, d2]` | replace | SPLIT monolith → 2 slug mới; redirectTarget = d1 |
| 8 | ch10-1-vi-sao-can-database | `[r1]` | replace | doctrine 5 lớp của ch10.1 dựng **S5 như bài NEW** → credit chỉ sang R1 (§12.2 case C); redirectTarget = r1 |
| 9 | ch11-advanced-storage | `[x1, x2]` | replace | SPLIT monolith → 2 slug mới; redirectTarget = x1 |

**Giữ nguyên URL (không mapping, không redirect):** ch01-1…4 → A1–A4; ch02-1 → A5; ch02-3 → A8; ch03-1 → A9; ch03-3 → A12; ch03-4 → A13; ch04-… → A14; ch10-2 → R2; ch10-3 → R3; ch10-4 → R4 — **13 slug hoàn toàn không đụng**; cộng `ch02-2` (sống tiếp với tư cách A6 qua entry #1 — có mapping nhưng không mất URL) = **14/22 URL giữ nguyên**.

Không có old slug tương ứng (NEW thật — không bao giờ tự done): F1, F2, C5, S1, S5, N1, N2, O2–O6, AP1–AP3.

### 12.2 Legacy-credit policy — nguyên tắc không-fabricate (chốt STEP 11C)

> **Nguyên tắc chung cho mọi mapping hiện tại và tương lai:** completion cũ chỉ chuyển tiếp cho bài kế nhiệm **trực tiếp cùng nội dung** (direct successor). Bài được tạo ra từ việc trích doctrine/concept của bài cũ, hay bài hoàn toàn mới, đều là **nội dung vật chất mới** đối với người học: **không tự động đánh done**. Phân loại 4 case:

| Case | Ví dụ | Quyết định |
|---|---|---|
| **A — REDUCE kế nhiệm trực tiếp (giữ track)** | `ch04` → A14; `ch10-1` → R1 | ✅ credit chuyển sang bài kế nhiệm (nội dung 1:1, cùng track) |
| **B — REDUCE kế nhiệm trực tiếp (đổi track optional)** | `ch07` → **O1** | ✅ credit chuyển sang O1 — O1 là **successor REDUCE/trực tiếp** của old Ch07 (concepts repository-vs-live-engine, local-first giữ 1:1); O1 là optional nên việc này **không làm phình core progress** (progress core không đếm `stageId=optional`) |
| **C — bài tách-ra-là-mới (trích doctrine)** | S5 từ ch10-1/10-3 | ❌ không tự done — người học cũ chưa đọc bài kiến trúc viết lại với vị trí mới (trước networking) |
| **D — bài hoàn toàn mới / lesson mới vật chất** | F1/F2/S1/C5/N1/N2, O2–O6, AP1–AP3 | ❌ không tự done |

Áp cụ thể:

- `ch10-1-vi-sao-can-database` → **chỉ R1** (case A). **S5 KHÔNG tự done** dù S5 dùng doctrine 5 lớp của ch10.1 làm nguồn (case C).
- `ch07-advanced-architecture` → **O1 done** (case B): old Ch07 completion **ĐƯỢC migrate sang O1**. Đây là bài REDUCE kế nhiệm trực tiếp — không phải nội dung vật chất mới — khác với S5 (case C). Nguyên tắc **no-fabricate áp cho bài vật chất mới: F1/F2/C5/S1/S5/N1/N2, O2–O6, AP1–AP3** — không áp cho O1.
- Chuỗi migrate hiện tại của v4 (ch10 monolith → ch10-1..4) chạy **trước** entry v5 (ch10-1 → r1) — thứ tự xử lý trong `migrateProgress` giữ như hiện tại.
- Quyết định ch10-1→[r1] chốt tại IMP-012 (bỏ phương án `[r1, s5]` trước đó); quyết định ch07→[o1] chốt tại STEP 11C (bỏ mâu thuẫn "O1 không tự done" ở bản trước). Cả hai test verify ở IMP-072.

*(Áp dụng tương tự mọi mapping tương lai: nếu một old slug nứt thành 2 bài mà 1 con mới chỉ là trích-đổi-vị-trí, old credit vẫn chỉ đi vào con giữ nội dung 1:1; con kia là bài NEW.)*

### 12.3 Case `ch02-2` — thiết kế migration `fan-out-keep-source` (STEP 11C)

> **Vấn đề:** entry SPLIT_MAP thường có semantics *replace*: `migrateProgress()` đọc từng slug trong done và thay nó bằng danh sách con (progress.ts:64-68). Nếu map `ch02-2 → [ch02-2, a7]` như entry thường thì hành vi "còn nguồn + thêm con" **phụ thuộc implementation hiện tại** (replace 1 lượt qua mảng, không xoá gì) — nhưng đây là giả định, không phải hợp đồng: bất kỳ refactor nào (dedup, viết lại migrate theo map mới) có thể âm thầm xoá source. Source slug còn sống tiếp với tư cách A6, nên mất nó = mất tiến độ người học tại URL cũ.

**Chính sách:** cấm đặt mapping "source sống" vào cấu trúc replace thường. Bảng map v5 tách mode rõ ràng:

```ts
type MigrationMode =
  | "replace"                 // old chết → thay bằng các con (entry #2–#9 của §12.1, gồm cả 2 REDUCE ch07/ch10-1)
  | "fan-out-keep-source";    // old SỐNG tiếp (với tư cách lesson mới) → giữ old + thêm các con slug mới
```

**Thiết kế (yêu cầu đặt cho IMP-013, không implement trong plan pass này):**

1. `SPLIT_MAP` giữ dạng entry thường cho mode `replace`; thêm bảng riêng (hoặc trường `mode` trên entry) cho `fan-out-keep-source`: entry `{ source: "ch02-2-…", keep: true, add: ["a7-…"] }`.
2. `migrateProgress()` xử lý keep-source entry bằng **union, không phải replace**: `next = union(current, add)` — old slug không bao giờ bị loại khỏi mảng; new slug chỉ được **thêm** khi old có mặt.
3. **Idempotent:** chạy 2 lần → kết quả giống chạy 1 lần (union + dedup đảm bảo sẵn).
4. **Acceptance criterion bắt buộc (test tại IMP-013, verify tổng tại IMP-072):** storage cũ chứa `done = ["ch02-2-may-ao-may-that-doc-project"]` → sau migrate: done chứa **cả** `ch02-2-…` (A6, source sống) **lẫn** `a7-…` (A7, con mới). Test assert cả 2 presence — không chỉ assert không mất source.
5. **Un-toggle semantics:** người học un-done A6 (xoá old slug khỏi done) thì A7 **không** tự xoá (2 lessonId độc lập sau migrate) — chấp nhận có tài liệu; flag lên review nếu muốn gắn cặp.
6. Không redirect cho source sống (§12.5) — entry này chỉ ở tầng progress.

### 12.4 Version & seed policy — thứ tự đơn điệu theo thứ tự thực thi (STEP 11C)

- **Chính sách bump:** `next migration batch = current SCHEMA_VERSION + 1`. Schema version **tăng 1 tại mỗi batch có mapping mới, đơn điệu theo thứ tự thực thi thật** — batch thực thi sau không bao giờ nhận version thấp hơn batch thực thi trước. Không gán cứng version theo nhãn stage.
- **Thứ tự thực thi hiện tại của plan** (Phase 3 pilot → Phase 4 stage batches tuần tự → Phase 6 optional cuối cùng) cho dãy version **expected** sau — số tuyệt đối là *kỳ vọng*, **không phải bất biến**, chốt lại theo batch thực tế trong `TARGET_REGISTRY_v5`:

| Expected version | Batch | Mapping |
|---|---|---|
| **v5** | Pilot Ch10 (Phase 3) | ch10-1 → [r1] |
| **v6** | Stage 1b — Ch02 split (Phase 4) | ch02-2 → keep-source + a7 |
| **v7** | Stage 1c — Ch03 split (Phase 4) | ch03-2 → [a10, a11] |
| **v8** | Stage 2 — Ch05 (Phase 4) | ch05 → [c1..c4] |
| **v9** | Stage 3 — Ch06 (Phase 4) | ch06 → [s2..s4] |
| **v10** | Stage 5 — Ch08 (Phase 4) | ch08 → [w1..w3] |
| **v11** | Stage 6-D — Ch09 (Phase 4) | ch09 → [d1, d2] |
| **v12** | Stage 7 — Ch11 (Phase 4) | ch11 → [x1, x2] |
| **v13** | Ch07/O1 (Phase 6 — sau core) | ch07 → [o1] |

> **Lý do Ch07/O1 = v13:** với phase order hiện tại (Ch07/O1 nằm ở Phase 6, sau tất cả core batches ở Phase 4), nó thực thi **sau** Ch11 — nên nhận version cao hơn v12. Nếu execution order đổi (ví dụ Ch07/O1 chạy sớm hơn), version của nó phải đổi theo đúng nguyên tắc bump đơn điệu +1; các version sau đó dồn theo.

- Stage 1a (Ch01), 1d (Ch04) và 1e (roadmap A4) **không bump** (0 mapping).
- `migrateProgress()` idempotent, migrate qua từng version theo mốc `MIGRATION_KEY >= target` — chi phí 1 lần đọc; chuỗi nhiều bước v4→v13 xử lý được vì entry chạy nối tiếp theo version.
- **Model B-lite (IMP-070)**: flag attempt lưu key riêng `hoc-android-tv:quiz-attempts` — không nằm trong mảng done → không cần version bump riêng.
- **Seed legacy (IMP-071)**: khi B-lite bật, completion cũ → seed `attempted = done` để không bắn hint "chưa làm quiz" giả cho người đã học. Ghi rõ là quyết định một chiều có tài liệu. (Lưu ý: seed chỉ đặt flag *attempt*, **không** tạo completion mới — nhất quán với §12.2.)
- Lưu ý kế thừa: SPLIT_MAP **đã có sẵn 4 entry v4** (ch01/ch02/ch03/ch10 monolith→con) — giữ nguyên, nối tiếp thành chuỗi migrate nhiều bước (v4 entry chạy trước, entry v5+ chạy sau).

### 12.5 REDIRECT_MAP — 8 old slug chết × 1 `redirectTarget` mỗi source (STEP 11C)

> **Nguyên tắc:** một old URL **không thể redirect tới nhiều bài cùng lúc** — HTTP redirect chỉ có 1 đích. Fan-out nhiều con chỉ diễn ra ở **tầng progress** (migrate credit sang mọi bài kế nhiệm); ở **tầng URL** mỗi old slug chết có đúng **một** `redirectTarget`, quyết định deterministic trong TARGET_REGISTRY: mặc định = **kế nhiệm logic đầu tiên** (first logical successor), trừ khi pedagogy đòi đích khác (flag lên review).

| Old slug (chết) | `redirectTarget` | Batch tạo redirect | Expected version |
|---|---|---|---|
| ch10-1-vi-sao-can-database | `r1-…` | IMP-020 (pilot) | v5 |
| ch03-2-string-resource-va-debug | `a10-…` | IMP-032 | v7 |
| ch05-jetpack-compose | `c1-…` | IMP-035 | v8 |
| ch06-advanced-jetpack-compose | `s2-…` | IMP-037 | v9 |
| ch08-networking | `w1-…` | IMP-040 | v10 |
| ch09-data-store | `d1-…` | IMP-041 | v11 |
| ch11-advanced-storage | `x1-…` | IMP-042 | v12 |
| ch07-advanced-architecture | `o1-…` | IMP-050 | v13 |

- **`ch02-2` KHÔNG có dòng redirect** — old slug sống tiếp với tư cách A6 (§12.3); bookmark cũ vẫn tới đúng bài.
- Splits có nhiều con (ch05→4, ch06→3, ch08→3, ch09→2, ch11→2, ch03-2→2): redirect trỏ con đầu; các con còn lại người học tự tới qua sidebar/TOC.
- Thêm redirect theo từng batch, cùng commit với rename + SPLIT_MAP + bump version; 14 slug còn lại không cần redirect.

---

## 13. QA Strategy

| # | Gate đo được | Công cụ / lệnh | Chuẩn đạt |
|---|---|---|---|
| 1 | Build | `cd web && npm run build` | exit 0; **số trang `dist/` khớp số entry routeable trong TARGET_REGISTRY (tính script từ registry + redirects, không hardcode con số kỳ vọng)** |
| 2 | Types | `npx astro check` | 0 error / 0 warning mới |
| 3 | Route/import integrity | script node: mọi slug registry có entry `LESSONS`; mọi entry `LESSONS` có slug; mọi component import tồn tại | 0 lệch |
| 4 | Broken links | crawl `dist/**.html` (script stdlib, anchor nội bộ + route) | 0 link gãy |
| 5 | Lesson time caps | `lessonStats` minutes | 100% core ≤30'; guideline 12–22' ghi nhận lệch |
| 6 | Template compliance | checklist script + tay: 1×`cam-bay`, 1×`nguon`, đánh số liên tục, callout caps, Nguồn duy nhất | 100% live lesson |
| 7 | Quiz integrity | `quiz-audit.mjs` — **chỉ gate quiz LIVE; ORPHAN chỉ inventory** | 100% LIVE PASS (§11) |
| 8 | Voice audit | grep "sách/chapter/tác giả/tôi" — **bỏ qua nội dung bên trong code block / block Nguồn / khối trích dẫn nguồn (fence ```, CodeEnhance output, Nguồn section)** để không false-positive | 0 hit ngoài vùng được loại trừ |
| 9 | Used-before-taught | script theo danh sách định danh spec §8 chạy **trên TOÀN BỘ 39 bài core** (F1–F2, A1–A14, C1–C5, S1–S5, N1–N2, W1–W3, D1–D2, R1–R4, X1–X2 — theo thứ tự lessonId trong TARGET_REGISTRY, không spot-check) | 0 vi phạm không gloss |
| 10 | Light/dark/mobile | checklist IMP-007 × các trang đại diện + trang mới (TOC đích 1024px) | 0 lỗi contrast/layout |
| 11 | Progress migration | test script IMP-072 (simulate v4 → latest, 9 case §12.1 theo thứ tự version §12.4) + seed test IMP-071 + **assert không-fabricate §12.2** | không mất credit, không crash, ch02-2 keep-source đúng (A6+A7), ch07→O1 đúng, 0 bài NEW tự done, version đơn điệu |
| 12 | Truthful counts | script IMP-082 | hero/roadmap/progress == registry |
| 13 | No-regression | S-register checklist IMP-091 | 16/16 |
| 14 | Optional separation | registry check: core path không chứa `stageId=optional/appendix`; progress core không đếm optional | 0 nhiễm |

Kết quả tổng hợp vào `docs/QA_FINAL_REPORT.md` trước `REVIEW_GATE_FINAL`.

---

## 14. Git / Commit Strategy

- **Nhánh:** làm tiếp trên `main` (thông lệ repo), **1 task IMP = 1 commit** (task L/XL cho phép 2–4 commit theo ranh giới content/wiring/cleanup ghi trong bảng). Không branch mới, không merge prototype.
- **Message convention** theo tiền tố đã dùng trong repo: `feat(...)`, `content(...)`, `fix(...)`, `refactor(...)`, `docs(...)`, `chore(...)`. Ví dụ: `content(ch10): split into r1-r4 + apply template`, `feat(progress): split map v5 for stage 6`.
- **Ranh giới cứng mỗi commit:** không trộn (a) nội dung bài + (b) infra CSS/JS + (c) progress schema trong 1 commit; SPLIT_MAP + bump version + redirect **phải** cùng 1 commit với rename slug tương ứng.
- **Tag gate:** tag lightweight tại mỗi gate (`gate/ui-foundation`, `gate/registry`, `gate/pilot`, `gate/optional-track`, `gate/quiz-sweep`, `gate/progress`, `gate/final`) để rollback theo mốc.
- **Prototype branch:** bất động sản — chỉ `git diff/show` để đối chiếu.
- **Không upgrade dependency** (`package.json` giữ nguyên; mọi script QA viết bằng stdlib Node).
- **Scratch hygiene:** Phase 0 (baseline guardrails) thêm rule `.gitignore` cho output script tạm; không xoá file nào ngoài scope batch (xoá file monolith/draft chỉ trong batch tương ứng, commit riêng).

---

## 15. Risks & Rollback Strategy

| Risk | Mức | Giảm thiểu | Rollback |
|---|---|---|---|
| Quiz harness refactor phá hành vi 22 quiz LIVE | Cao | IMP-001 chứng minh trên 2 quiz LIVE đại diện trước khi lan; không đổi data câu hỏi trong cùng commit | revert 1 commit (không đụng content) |
| Batch tự ý rename slug ngoài danh sách §10.1 làm mất tiến độ | Cao | chính sách §4b.3 + checklist gate batch ("0 rename ngoài danh sách") + redirect/SPLIT_MAP/version cùng commit khi rename hợp lệ | revert commit batch; migrate idempotent theo `>=` nên version nhảy tới lui được |
| Split Ch05/Ch06 làm hỏng "crown jewel" | Cao | port từng khối, giữ code + dòng nguồn; đối chiếu §20; gate batch chặn | revert batch; monolith cũ còn trong git |
| Bỏ sót dependency giữa các workstream xen kẽ (WS C/D) | Trung bình | bảng điều kiện tiên quyết §7 (Ch05 đòi cả F1+F2; Ch08 đòi S5+N1+N2; S5 đòi S1; O6 đòi capstone-set); gate batch kiểm tra deps trước khi mở | tạm dừng batch, mở batch thiếu trước |
| Migration keep-source ch02-2 refactor âm thầm xoá source sống | Cao | §12.3 cấm nhét entry keep-source vào replace thường; mode `fan-out-keep-source` union; test IMP-013 + IMP-072 assert cả A6 lẫn A7 presence | revert commit; progress storage chỉ bị migrate khi `MIGRATION_KEY < SCHEMA_VERSION` — test polyfill phát hiện trước khi ship |
| Mất credit old Ch07 khi chuyển sang O1 optional | Thấp | §12.2 case B chốt migrate; test IMP-072 case (d); registry `stageId=optional` tách core count | revert commit IMP-050 |
| Scope creep F1/F2 (thành khoá Kotlin) | Trung bình | MUST/NOT-here list spec §7 chốt trong task; gate NEW_CORE | cắt phần vượt (tách vào optional) |
| Wayfinding over-build (dashboard hoá lesson) | Trung bình | anti-pattern guard §17 trong template kit + gate UI | remove |
| Số lessonStats sai khi file đổi tên sau split/rename | Cao | IMP-016 refactor registry-driven trước pilot (không còn glob mù) | revert; stats tạm lệch không blocker |
| Nhiệm màu optional vào core | Trung bình | registry `kind` + gate separation (QA #14) + IMP-059 + gate optional IMP-060 | tách route |
| Draft ngủ đông sai chuẩn bị dùng bừa | Trung bình | quy tắc §10.2(4): verify trước khi dùng | — |
| Astro 7 redirect config hành vi khác kỳ vọng | Thấp | IMP-014 verify bằng build + curl ở pilot trước khi nhân rộng | fallback trang meta-refresh sinh từ registry |
| EditApplied/rewrite trôi dẫn đến mất trích dòng nguồn | Thấp | chuẩn Nguồn + QA #6 | đối chiếu aaf-materials |

Nguyên tắc rollback chung: **mọi batch độc lập revert được theo commit/tag** vì (a) mỗi batch tự chứa migration + redirect của nó, (b) không batch nào sửa file của batch khác ngoài cross-ref một chiều (revert cross-ref trước, revert batch sau).

---

## 16. Definition of Done

1. Registry v5 live: **Nền tảng F1–F2 + 7 giai đoạn (37 bài lõi) = 39 core**, 6 optional, 3 appendix — đúng đếm/minutes spec §21, hiển thị trung thực trên hero/roadmap/progress; mọi unit có đủ `lessonId`/`slug`/`stageId` theo §4b.
2. 45 lesson live đạt **một chuẩn template** (spec §12 + COURSE_CONTENT_STANDARD), 100% core ≤30'; **14/22 URL cũ giữ nguyên URL** (13 KEEP + ch02-2 sống tiếp với tư cách A6), chỉ 9 entry SPLIT_MAP mới (8 old slug chết cần redirect — mỗi source 1 `redirectTarget`, bảng §12.5).
3. Quiz 100% LIVE PASS audit (8–12 câu, 4 options, cân rank/vị trí, 100% giải thích, UX retry ẩn→hiện→ẩn đúng); 0 quiz LIVE ngoài harness; 0 quiz/shell ORPHAN còn trên đĩa.
4. Wayfinding: TOC desktop + "Mục x/y" + active highlight mọi width (breakpoint 1024px như prototype); checkpoint; callout hierarchy; code header.
5. Progress: Model B-lite, SPLIT_MAP đầy đủ theo bảng §12.1 (9 entry — 6 replace + 1 keep-source fan-out + 1 REDUCE ch07 + 1 REDUCE ch10-1), simulate test xanh, không mất credit, **không-fabricate (F1/F2/S1/S5/C5/N1/N2, O2–O6, AP1–AP3 không tự done; O1 nhận credit kế nhiệm trực tiếp từ ch07)**, ch02-2 keep-source giữ cả A6+A7, redirect đủ cho 8 slug chết (1 đích mỗi source), schema version đơn điệu theo thứ tự thực thi.
6. X2 = historical-ref đúng; A8 codename sửa đúng chỗ; prereq audit 0 vi phạm (39 bài core); voice audit 0 vi phạm (đã loại trừ code/Nguồn).
7. `QA_FINAL_REPORT.md` đủ 14 gate xanh; S-register 16/16; spec §25 10/10.
8. Git: main sạch, tag gate đủ 7 (§14), prototype branch nguyên vẹn, không dependency mới.

---

# PLAN CORRECTION LOG

| # | Issue | Previous | Corrected | Reason |
|---|---|---|---|---|
| 1 | Lesson ID vs URL slug bị trộn | Plan cũ đặt kế hoạch rename **21/22 slug** cho khớp lesson ID (a1–a4, a5–a8, …); coi `A1`, `R2`, `N1` như slug URL | Thêm **§4b — Chính sách định danh**: tách 3 trường `lessonId` / `slug` / `stageId`; giữ nguyên slug khi content identity không đổi; slug mới chỉ cho bài NEW/split con. Kết quả (đếm chốt STEP 11C): **14/22 URL giữ nguyên URL** (13 KEEP + ch02-2 sống tiếp với tư cách A6), 8 old slug chết cần redirect 1 đích, 9 SPLIT_MAP entry mới thay vì 21. Cập nhật IMP-012/013/014, WS C toàn bộ batch, §10.1, §12.1, DoD 2 | Giảm tối đa redirect + progress migration; URL là tài sản public gắn tiến độ người học |
| 2 | Stage enum không đầy đủ | `StageId = f/a/c/s/n/w/x/opt/ap` (9 giá trị viết tắt, thiếu appendix/gộp nhầm) | **§4b.2**: enum 10 giá trị đầy đủ `foundation / android / compose / state / navigation / network / data / realworld / optional / appendix`; lesson IDs giữ dạng F1/A1/R1; IMP-010 astro check xác nhận | Enum rút gọn mơ hồ, không extend được, sai số đếm stage |
| 3 | TOC breakpoint sai so với prototype đã khóa | "Desktop ≥1240 sticky rail; tablet ≤1240 card" | **1024px** (cùng mốc shell rail→drawer): `>1024px` sticky right rail, `<=1024px` in-flow card; inactive TOC dùng `--text-2` (đậm hơn) cho dark mode; init `Mục 1/y` — không bao giờ `Mục 0/y` (IMP-003, gate UI foundation, §9 promotion) | Prototype `3ae75d1` đã validate mốc 1024px + token `--text-2` (diff `lesson.css` fa63a8e→3ae75d1; screenshot 20–33) |
| 4 | "axis 0/12" — số liệu quiz prototype sai/đã cũ | "kết quả prototype (12 câu, 3/3/3/3, axis 0/12)" | Thay bằng phân bố đã đo lại từ file `3ae75d1`: **rank độ dài R1=2 · R2=4 · R3=3 · R4=3** (theo số từ; max 33% < ngưỡng 40%) và **vị trí a/b/c/d = 3/3/3/3** (§11) | Đo trực tiếp từ Ch10_2Quiz.astro @ 3ae75d1; "axis 0" là cách mô tả sai, bỏ khái niệm |
| 5 | Retry cycle chưa mô tả trọn | "retry ẩn trước submit + confirm khi làm lại" | Ghi trọn chu kỳ đã verify: **ẩn trước submit → hiện sau submit → ẩn lại sau reset** (IMP-001, IMP-021, gate UI, §9) | Hành vi `3ae75d1`: retryBtn chỉ unhide sau submit đầu; reset set `hidden` lại |
| 6 | Stage ID rò rỉ vào bảng cũ (Ch01–04→"S1", Ch05→"S2"…) | Các nhãn stage cũ dạng S1–S7 gây trùng với lesson ID S1–S5 | Toàn bộ plan dùng `stageId` mới (§4b.2); mapping 22 bài hiện có ghi ở §4.2 lệch 4 | Trùng ký hiệu giữa stage-đích và lesson ID gây lỗi nhặt nhánh khi triển khai |
| 7 | Dependency bỏ sót: Ch05 chỉ ghi "IMP-040 (F1/F2 đứng trước)" gộp chung | Ch05 có thể mở khi mới xong F1 (F2 chưa xong) | **IMP-035 (Ch05) đòi cả IMP-043 (F1) VÀ IMP-044 (F2)** (ID sau STEP 11C renumber); gate CONTENT_BATCH kiểm tra cặp deps trước khi mở batch | F2 dạy data class/`by`/sealed — tiền quyết trực tiếp của nội dung Compose |
| 8 | Dependency bỏ sót khác (audit toàn plan) | S5 không ghi đòi S1 rõ; N1 không ghi đòi S5; W-batch không liệt kê đủ S5+N1+N2; O6 chỉ ghi N2+D2; F1 đòi IMP-034 (đã thành row C5) | S5=IMP-046 đòi **IMP-045 (S1)**; N1=IMP-048 đòi **IMP-046 (S5)**; IMP-040 (Ch08) đòi **S5 + N1 + N2 cả ba**; **IMP-055 (O6)** đòi đủ capstone-set (A14, C2/C3, S4, N1/N2, W2/W3, D1, R2/R3 — mọi capability capstone assembly); F1=IMP-043 đòi **IMP-033** (batch cuối Stage 1); O1=IMP-050 đòi IMP-046; Ch11=IMP-042 đòi IMP-046; nguyên tắc phụ thuộc §4.2 tổng hợp | Audit hệ thống từng cột Deps sau correction; tránh batch mở thiếu bài tiền quyết |
| 9 | S5 legacy progress mơ hồ | `ch10-1 → [r1, s5]` với phương án "credit cả hai" | Chốt **`ch10-1 → [r1]`**; **§12.2 nguyên tắc không-fabricate**: completion cũ chỉ kế nhiệm trực tiếp cùng nội dung; S5/F1/F2/S1/C5/N1/N2 (bài NEW) không bao giờ tự done; test assert ở IMP-072 + gate PILOT simulate "S5 không xuất hiện trong done" | Không fabricated credit cho nội dung vật chất mới; người học cũ phải hoàn thành bài kiến trúc viết lại |
| 10 | Quiz harness blast radius quá lớn | IMP-001 "26 quiz gọi init giữ nguyên markup" — 1 task đụng cả 26 file | **Blast radius rule**: IMP-001 build harness + chứng minh trên **2 quiz LIVE đại diện** (Ch10_2 + Ch05); quiz LIVE chuyển harness **từng batch theo WS C**; IMP-063 sweep chỉ sửa data; ORPHAN không đụng ngoài IMP-064 (§11 bốn bước, §4.2 lệch 1, WS E) | Refactor 1 lần 26 file = rủi ro hành vi hàng loạt; mỗi quiz chỉ đụng đúng 1 lần trong dự án |
| 11 | Audit script không phân loại LIVE/ORPHAN | IMP-002/062 quét cả 26 file như nhau, gate áp cho toàn bộ | IMP-002/062 đọc `lessons.ts` để **phân loại 22 LIVE / 4 ORPHAN** (`Ch01Quiz`, `Ch02Quiz`, `Ch03Quiz`, `Ch04_1Quiz` — verify: 0 import); gate chỉ áp cho LIVE; ORPHAN chỉ inventory chờ cleanup | Đo thực tế: 22 key lessons.ts / 22 import quiz; orphan tồn tại nhưng không route — không thể "PASS audit" và không nên fail gate |
| 12 | Page-count QA hardcode | "đúng số trang (kỳ vọng cuối: 48 route + redirects)" | QA #1: số trang `dist/` **tính script từ TARGET_REGISTRY** (entry routeable + redirects) — không hardcode con số; cộng dồn slug giữ-đổi | Registry mới thêm/xoá unit → số route thay đổi; hardcode 48 sẽ false-fail/false-pass |
| 13 | Used-before-taught chỉ spot-check | "used-before-taught spot-check" (IMP-090) | QA #9 + IMP-090: script chạy **trên toàn bộ 39 bài core** theo thứ tự lessonId trong registry, không spot-check | Prereq violation có thể nằm ở bất kỳ bài nào; spot-check không đảm bảo spec §25 "zero used-before-taught" |
| 14 | Voice audit false-positive | grep "sách/chapter/tác giả/tôi" 0 hit tuyệt đối | QA #8: loại trừ vùng **code block (fence/CodeEnhance), khối Nguồn, khối trích dẫn nguồn** trước khi grep | Từ khoá xuất hiện hợp lệ trong code/comment nguồn và block Nguồn — grep mù sinh false-positive khiến gate không qua được |
| 15 | Trùng lặp task C5/S5/N1–N2 giữa WS C và WS D | C5 có 2 row (IMP-034 + IMP-044), S5 có 2 row (IMP-036 + IMP-043), N1/N2 có 2 row (IMP-037 + IMP-045/046) | Canonical task ở WS D (sau renumber STEP 11C: IMP-047/046/048/049); row WS C (IMP-036/038/039) thành row "thực thi qua" để stage batch vẫn đóng trọn | 2 row cùng bài = 2 lần viết/không rõ ai ownership |
| 16 | Số liệu trạng thái repo sai nhỏ | "20 file ngủ đông"; không đếm biến thể Ch04_3; quiz monolith "không ai tham chiếu" chung chung | **28 file ngủ đông** (gồm 2 biến thể Ch04_3 trùng số); tách bạch 3 shell chưa route + 4 quiz ORPHAN; IMP-064 xoá đúng 4 quiz ORPHAN | Đếm trực tiếp trên đĩa `web/src/components/lessons/` (55 file lesson) |
| 17 | Số version bump theo stage sai tên | "Stage 6-D = 10; Stage 6-Ch07 = 11" theo nhãn stage cũ | §12.4 liệt kê theo batch thật theo **thứ tự thực thi**: pilot=5, Ch02 split=6, Ch03 split=7, Ch05=8, Ch06=9, Ch08=10, Ch09=11, Ch11=12, Ch07/O1=13 — **expected, không bất biến** (STEP 11C sửa lại: bản 11B gán Ch07/O1=9 thấp hơn batch thực thi sau) | Nhãn stage cũ đã bị thay bằng stageId; version phải đơn điệu theo execution order |
| 18 | Đếm URL sai: "15/22 giữ nguyên" | Nhiều mục ghi 15/22 slug giữ nguyên URL, trong khi chính plan cũng liệt kê đúng 8 old slug chết | **14/22 giữ nguyên URL** = 13 KEEP hoàn toàn (ch01-1…4, ch02-1, ch02-3, ch03-1/3/4, ch04, ch10-2/3/4) + `ch02-2` sống tiếp với tư cách A6; **8 old slug chết** (ch03-2, ch05, ch06, ch07, ch08, ch09, ch10-1, ch11). Sửa ở §4.2, §4b.3/4b.4, IMP-012, IMP-017, gate REGISTRY, §12.1, §12.5, DoD 2, log #1 | 22 − 8 = 14; 14 + 8 = 22 — đếm cũ tự mâu thuẫn với danh sách 8 slug chết |
| 19 | Redirect count sai + target đa đích | IMP-014 ghi "7 slug đổi"; splits cũ cho phép old URL trỏ nhiều con | **8 redirect source** (ch02-2 không redirect — old slug sống với tư cách A6); TARGET_REGISTRY bắt buộc `redirectTarget` **duy nhất** cho từng old slug chết — mặc định = kế nhiệm logic đầu tiên (§12.5); fan-out nhiều con chỉ ở tầng progress | HTTP redirect 1 đích; URL và progress là 2 tầng độc lập |
| 20 | ch02-2 migration chưa có thiết kế | Chỉ liệt kê `ch02-2 → [ch02-2, a7]` như entry thường, dựa hành vi replace hiện tại của `migrateProgress()` không xoá source — giả định không có hợp đồng | **§12.3 mode `fan-out-keep-source`** (cấm nhét vào replace thường): union không replace; IMP-013 inspect `migrateProgress()` hiện tại (progress.ts:64-68) + **test bắt buộc `done=["ch02-2-…"] → chứa cả ch02-2-… (A6) lẫn a7-… (A7)`**; idempotent; un-toggle độc lập có tài liệu; verify tổng ở IMP-072 + gate PROGRESS | Source slug còn sống với tư cách A6 — mất nó = mất tiến độ tại URL cũ |
| 21 | Ch07→O1 credit tự mâu thuẫn | §12.2 cũ xếp O1 vào nhóm "không tự done" (kể O1 là nội dung vật chất mới) trong khi §12.1 mapping `[o1]` ngầm chuyển credit; IMP-050 không ghi chính sách | **Chốt: O1 là successor REDUCE/trực tiếp của old Ch07 → credit old Ch07 migrate sang O1** (§12.2 case B); O1 optional nên không làm phình core progress; **no-fabricate áp cho bài vật chất mới: F1/F2/C5/S1/S5/N1/N2, O2–O6, AP1–AP3** (case D). Sửa §12.2, IMP-050, IMP-072, gate REGISTRY/PROGRESS, DoD 5 | REDUCE 1:1 kế nhiệm trực tiếp — bản chất giống ch04→A14; khác S5 (trích doctrine → bài mới) |
| 22 | Schema version không đơn điệu theo execution order | Ch07/O1 = v9 thấp hơn Ch08 = v10…Ch11 = v12, dù với phase order hiện tại Ch07/O1 (Phase 6) thực thi **sau** các batch core (Phase 4) | **Chính sách: `next migration batch = current SCHEMA_VERSION + 1`, đơn điệu theo thứ tự thực thi thật**; dãy expected: v5 pilot, v6 Ch02, v7 Ch03, v8 Ch05, v9 Ch06, v10 Ch08, v11 Ch09, v12 Ch11, **v13 Ch07/O1**; số tuyệt đối là **expected, không bất biến**, chốt theo batch thực tế (§12.4); sửa log #17 | Batch thực thi sau không được mang version thấp hơn batch thực thi trước |
| 23 | Task Stage 1 đụng 3 chương + task ID có hậu bối cã | IMP-030 cũ (Ch01–03 cùng lúc) vi phạm nguyên tắc "1 batch ≤ 1 chương"; ID `IMP-039a`/`IMP-039b` không thuần số | **Tách Stage 1 thành 4 task theo chương**: IMP-030 (Ch01), IMP-031 (Ch02), IMP-032 (Ch03), IMP-033 (Ch04), IMP-034 (roadmap A4); WS C kéo dài sang IMP-042; **renumber toàn bộ task thuần số**: WS D = IMP-043…049 (F1=043, F2=044, S1=045, S5=046, C5=047, N1=048, N2=049), WS E = IMP-062…065 (thêm gate quiz IMP-065), WS F = IMP-050…060 (thêm gate optional IMP-060), WS G = IMP-070…072 (071 seed, 072 tổng-audit); **audit lại toàn bộ deps** sau renumber (cột Deps từng task + gates + QA #11) | 1 task 1 chương = review tuần tự Ch01→Ch02→Ch03→Ch04→F1/F2, blast radius có kiểm soát; ID thuần số tránh sort/parse lỗi |
| 24 | Còn sót reference chéo sau renumber | Log #7/#8/#9/#10/#15/#16 giữ ID cũ; IMP-080 dep IMP-071; QA #11 test IMP-071 | Cập nhật mọi reference theo ID mới (log #7–10, #15–16 ghi chú renumber; IMP-080 đòi IMP-072; QA #11 = IMP-072 + IMP-071); re-check cuối file | Tránh kế thừa ID chết khi thực thi |

**Re-check nội bộ sau STEP 11C:** đếm URL nhất quán ở §1(6), §4b.3/4b.4, IMP-012/017, §10.1, §12.1/§12.5, DoD 2 (**14 giữ nguyên URL · 8 old slug chết · 9 entry SPLIT_MAP · 8 redirect source × 1 đích**); 9 case migration gồm ch02-2 keep-source fan-out (§12.3) + ch07→O1 (§12.2 case B); schema version đơn điệu expected v5→v13 (§12.4); task ID thuần số, deps audit lại sau renumber (log #23–24); prototype `3ae75d1` số liệu giữ nguyên (rank R1=2·R2=4·R3=3·R4=3; vị trí 3/3/3/3; breakpoint 1024px); phân bố quiz prototype khớp đo thực tế @ `3ae75d1`; mọi cross-ref §x.y đã trỏ đúng mục sau khi renumber (QA #7→§11, không-fabricate→§12.2, SPLIT_MAP→§12.1, redirect→§12.5, version→§12.4); workstream/gate architecture giữ nguyên — chỉ nội dung task trong gate thay đổi theo correction.

---

# PLAN STATUS

`READY_FOR_PLAN_COMMIT`
