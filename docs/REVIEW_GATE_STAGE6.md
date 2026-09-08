# REVIEW_GATE_STAGE6

**Batch:** Stage 6 / Local Data — Ch09 monolith → D1 / D2 (registry §7 entry 7)
**Baseline:** `49c6152` (Stage 5 gate PASS) · **Close:** commit `chore: close stage6 content review gate` (bản báo cáo này) · **Branch:** `main`, working tree clean, **not pushed**

---

## Scope / commits

| Commit | Nội dung |
|---|---|
| `2930196` | feat(data): D1+D2 lesson+quiz (tách monolith theo mốc D1/D2 START/END), wiring lessons.ts/chapters.ts/lessonStats FILE_KEY_PIN, SPLIT_MAP replace + SCHEMA_VERSION 11, redirect ch09→D1, xoá Ch09DataStore.astro + Ch09Quiz.astro |
| `1a3cb7c` | chore(data): QUIZ_MIGRATION_STATUS (Ch09Quiz → retired Stage 6) + AP3 pointer (bài lõi trỏ về hai slug tường minh) |
| `1833691` | fix(data): repairs từ adversarial reviews — rememberSaveable/process-death (MAJOR freshness), một-instance + "5 kiểu" hedge (MINOR freshness), fence S2/C4 (MINOR final), D2 q9 explanation đồng bộ |
| `bf163bc` | fix(data): hoàn tất casing pin lessonStats — FILE_NAME_PIN trong resolver (BLOCKER final review; commit `1833691` chỉ sửa nửa bảng — xem Deviations) |

ĐÃ DỪNG đúng ranh giới: **không** đụng Ch11 (X1/X2 giữ nguyên trạng thái một-route), O-track, appendix, homepage, Model B-lite, không đổi quiz các stage trước (ngoại trừ ghi nhận retirement của Ch09Quiz trong docs), không thực hiện Sidebar Lesson Identity Redesign (dành cho WS H). W-batch, S-batch, R-batch chỉ **đọc** để verify cross-ref; 0 dòng sửa.

## Starting state

HEAD `49c6152`, tree clean · 38 live lessons · data stage 4 (R1–R4) · SCHEMA_VERSION 10 · SPLIT_MAP 11 · redirects 5 · hints 65 · build PASS. Khớp expected checkpoint của brief.

## Final curriculum

### D1 — "DataStore & SharedPreferences: lưu key/value đúng cách"
- **slug:** `ch09-data-store-va-sharedpreferences` (registry §3, đúng từng ký tự) · **component:** `Ch09DataStoreVaSharedPreferences.astro` · **quiz:** `Ch09DataStoreVaSharedPreferencesQuiz.astro`
- **nội dung:** mục 1–10 (10 h2 số + 5 = 15 h2) — chọn công cụ theo **hình dạng dữ liệu** (mental model "nhìn hình dạng, không nhìn kích thước"), SharedPreferences ở mức ĐỌC code cũ với trạng thái chính xác (không @Deprecated; Google khuyến nghị DataStore cho code mới), vì sao DataStore tồn tại (suspend-first, Flow, ghi nguyên khối; KHÔNG phải database / KHÔNG tự lưu object), thêm thư viện qua version catalog (A14), khai store `by preferencesDataStore` (trả nợ F2 Phần 9; bảng hai vị trí member/top-level; một-instance), key có kiểu, đọc `data.first()` vs collect, ghi `edit { }` (KHÔNG bọc Dispatchers.IO), null = key-chưa-có ≠ mặc định, class `Prefs` như data source 43 dòng.
- **KHÔNG dạy** (contract comment frontmatter): Room (R1–R4) · map/trên Flow (W1) · IOException handling · Proto DataStore (2 câu tên) · wiring app (D2).

### D2 — "Prefs trong app: CompositionLocal & ViewModel wiring"
- **slug:** `ch09-prefs-composition-local-va-wiring` · **component:** `Ch09PrefsCompositionLocalVaWiring.astro` · **quiz:** `Ch09PrefsCompositionLocalVaWiringQuiz.astro`
- **nội dung:** mục 11–21 (11 h2 số + 2 = 13 h2) — bài toán nối dây (4 vấn đề của "mỗi màn hình tự dựng"), Application là chủ sở hữu hợp lý (DI ở mức nguyên lý; Hilt = seam note 1–2 câu: "Trong app lớn hơn, một DI framework như Hilt có thể đảm nhiệm việc tạo/cung cấp dependency này." — không @HiltAndroidApp/@Inject), CompositionLocal 3 bước declare→provide→consume + ranh giới (không tạo object, không persistence, phạm vi cây con, không service-locator theo quy tắc S3), viewModelFactory + closure (đọc `.current` trước lambda), Trace 1 từ khoá (joinToString → bug dấu phẩy mục 17 — reading phê phán expected→trace→actual), Trace 2 tab (LaunchedEffect vs rememberCoroutineScope; bảng bốn cơ chế remember/rememberSaveable/DataStore), bài toán @Preview, bảng trách nhiệm 5 actor.
- "Tắt app" ở bảng bốn cơ chế đã được đóng đúng sau freshness review (xem Freshness adversarial review).

Monolith `Ch09DataStore.astro` + `Ch09Quiz.astro`: **ĐÃ XOÁ** (route chết đúng như registry §6 row 6). Số mục liên tục 1–21 trên hai bài, khớp mốc D1 START/END (mục 1–10) và D2 START/END (mục 11–21) của monolith. Checkpoint (c) vốn hỏng text trong monolith đã được sửa trong cả hai bài kế nhiệm.

## Registry identities & wiring

- `ALL_CHAPTERS` == `LESSONS` == `lessonStats` == live dist lesson routes == **39** (38 − 1 monolith + 2 D). Không duplicate, không placeholder.
- Hai entry chapters.ts: `number: 9`, `subNumber: 1/2`, `parentTitle: "Data Store"`, `stageId: "data"`, `aafFolder: "09-data-store"`, `hasProject: true`. Sidebar tự sinh nhóm "Giai đoạn 6 — Dữ liệu cục bộ" đúng thứ tự **D1 → D2 → R1 → R2 → R3 → R4** (verify trên dist homepage + trang live: prev của D1 = N2, next của D2 = R1).
- **FILE_KEY_PIN:** `"ch09-data-store-va-sharedpreferences": "09_1"`, `"ch09-prefs-composition-local-va-wiring": "09_2"` — cần ghim vì 4 file ngủ đông Ch09_1ViSaoDataStore/Ch09_2VietClassPrefs/Ch09_3PhatPrefsXuongApp/Ch09_4BugDauPhayVaLuuTab (IMP-064 giữ lại) trùng tiền tố key 09_1..09_4 (bug-class Stage 1/3/5). **Lưu ý đặc biệt D1:** `pascalOf(slug)` cho ra "Ch09DataStoreVa**S**haredpreferences" (thường p) trong khi tên file thật giữ casing API "Ch09DataStoreVa**S**haredPreferences" (registry §9) — ca lệch đã ghim ở **FILE_NAME_PIN** trong `resolveLiveFileNames` cùng `FILE_NAME_CASE` ở bảng slug→base (ca thứ hai sau ch06-viewmodel; chi tiết BLOCKER-1 ở Final adversarial review).
- **Stats pairing verify trên dist:** D1 → **15 mục / 12 khối code / 10 câu hỏi / 30 phút**; D2 → **13 mục / 22 khối code / 10 câu hỏi / 40 phút** (khớp file thật của từng bài — không cross-swap; R1 đối chiếu 8/8/8/30). Homepage progress widget: **0/39 phần**. Homepage href: D1 ×22, D2 ×20, **0 href `ch09-data-store` sống**.

## Progress migration

- schema before 10 → after **11** (bump đúng 1 — dead-source split, đúng contract §G); history comment cập nhật (10 = Stage 5 …; 11 = Stage 6).
- map before 11 → after **12**; entry mới: `"ch09-data-store": [D1, D2]` — replace (old chết), fan-out hợp lệ vì cả hai bài kế nhiệm trực tiếp; comment ghi rõ KHÔNG có bài NEW trong batch. KHÔNG map ch09 vào R1–R4/X1/X2 (verify: mapping old→R duy nhất vẫn là ch10-1→R1 từ pilot, không đổi).
- migration regression: **17/17 PASS** (script tạm `scripts/migration_matrix_s6.mjs`, thuật toán migrateProgress trích verbatim từ progress.ts + localStorage stub): ch09 → đúng cặp D · dedupe · ch08 → W-triple · ch06 → S2-4 · ch05 → C1-4 · ch10 monolith → R1-4 · ch10-1 → R1-only · keep-source ch02-2 · ch03-2 → A10/A11 · A4 typo chain · **combined 8-monolith history** resolve đủ cây · idempotent · corrupt storage → [] · unknown-passthrough · no-fabricate (F1/F2/C5/S1/S5/N1/N2 không bao giờ xuất hiện) · SPLIT_MAP self-audit. Script tạm **đã xoá trước final gate** (file nằm trong `web/scripts/` — bị .gitignore, chưa bao giờ vào git).

## Redirect

- before 5 → after **6**: thêm `"chapters/ch09-data-store": "/chapters/ch09-data-store-va-sharedpreferences/"` — đúng cột redirectTarget registry §6 row 6. Dist artifact verify: meta-refresh HTML tại `/chapters/ch09-data-store/index.html` trỏ đúng D1; HTTP verify qua `astro preview` — cả 6 redirect serve đúng target.
- Tổng dist: **39 live + 6 redirect = 45** chapter dirs.

## Quizzes

| Quiz | Câu | Keys | Max key share | Display-pos | Length-rank (audit) |
|---|---|---|---|---|---|
| D1 | 10 | b d c a c d b d a c | 3/10 = 30% | 2/3/3/2 | 3/2/1/4 → max 40% |
| D2 | 10 | c b a d c a b d a c | 3/10 = 30% | 2/1/4/3 | 0/3/3/4 → max 40% |

- `node scripts/quiz_audit.mjs` (char-length rank): **2/2 PASS** · 4 options/1 correct · explanations 100% · shared harness `initQuiz` + `#quiz-retry` (import từ `../../scripts/quiz.ts` như mọi quiz harness).
- **Semantic-key audit:** 20/20 key trỏ đúng đáp án đúng NGỮ NGHĨA, giải thích mô tả đúng option được key (review độc lập xác nhận từng câu). Giải thích không trỏ chữ cái, chỉ trỏ mục.
- **Cross-ref trong quiz:** mọi mục được trỏ (D1 mục 2/3/5/6/7/9, D2 mục 13/15/16/17/18/20) tồn tại thật trên bài kế nhiệm.
- **Chiều mép D2:** display-pos 3 = đúng 40% và rank 4 = đúng 40% — nằm TRONG ngưỡng ≤40% của audit (không vượt).
- Monolith Ch09Quiz retirement ghi vào `docs/QUIZ_MIGRATION_STATUS.md` (row **retired (Stage 6)**, thay bằng 2 quiz harness).

## Cross-references & docs

- **AP3** (`docs/drafts/ap3-version-drift.md` §Ch09): "Bài lõi trỏ về đây" đổi từ con trỏ chung → hai slug tường minh D1/D2; bảng lệch phiên bản Ch09 (7 điểm + preview) giữ nguyên — vẫn đúng sau split.
- **R1** (`Ch10_1RoomLaGi.astro`): các trỏ "Chương 9 (mục 1)" / "mục 17" theo SỐ chương — giữ hợp lệ sau split vì D1 giữ mục 1, D2 giữ mục 17; **không cần sửa** (quy ước đã có từ Stage 4/5).
- D1 ↔ D2: mọi trỏ chéo "bài D2 mục N" / "D1 mục N" verify tồn tại thật (D1:251→D2 mục 16; D1:480→D2 mục 19 + AP3; D2 mục 11→D1 mục 5; D2 mục 21→D1 mục 10; quiz hai chiều).

## Voice / prerequisites / provenance

- Voice: 0 leak trong vùng learner-facing ("sách nói/chapter này/tác giả" — match duy nhất là comment frontmatter GIỌI VĂN của D1, không phải thân bài). Việc NAMED giáo trình chỉ xuất hiện ở #nguon + callout doctrine "deprecated" — đúng chỗ được phép, luôn kèm đính chính.
- Prerequisites: fence "Cần biết trước" D1 = F1/F2/S1/S4/A14/Ch1 (+ C4 note-only sau adversarial); D2 = D1/S4/S3/**S2**/C3/C4 (S2 thêm sau adversarial — bảng bốn cơ chế ở mục 18 xây trên nền đó). W1 chỉ forward-referenced; Chương 10 forward-referenced đúng kiểu "sắp tới".
- Provenance: đúng 1 `#cam-bay` + 1 `#nguon` mỗi bài (2/2 verify). Nguồn trích project mẫu ghim file+dòng, đã kiểm trực tiếp trên `aaf-materials/09-data-store/projects/final/`: Prefs.kt 12–43 · RecipeApp.kt 9–21 · manifest 12 · MainActivity.kt 25–31/44–48/80–86 · RecipeViewModel.kt 32–35/57–65/85–90/122–133 · ComposeUtils.kt 44–47 · RecipeDetails.kt 53–55 · RecipeList.kt 26–28 · ImageRow.kt 36–43 · SearchRow.kt 105–119 · MainScreen.kt 22–58 · GroceryList.kt 19–21 · ChipRow.kt 65–73 · libs.versions.toml 22/75 · build.gradle.kts 80/82.

## Build / Astro

- `npm run build`: **PASS** — 40 pages (39 lesson + homepage), 6 redirect artifacts.
- `npx astro check`: **0 errors · 0 warnings · 65 hints** (= baseline 65, không hint mới).
- Homepage sidebar: nhóm "Giai đoạn 6 — Dữ liệu cục bộ" xuất hiện với D1/D2/R1–R4; 0 href ch09-data-store sống (chỉ redirect artifact).

## UX / runtime verification

- **Desktop (browser thật, astro preview :4321):** D1 load đúng (title, TOC 15 h2, prev N2 / next 9.2), toggle "Đánh dấu đã học" dispatch OK; quiz D1: chọn đáp án → "Kiểm tra đáp án" → **"Kết quả: 1/10 câu đúng."** + giải thích hiện; "Làm lại" → confirm dialog → form reset sạch (0 selection, score biến mất). D2 load đúng (TOC 13 h2, prev 9.1 / next 10.1); quiz D2 submit → **"Kết quả: 0/10 câu đúng."** + giải thích; "Làm lại" + confirm OK. Sau repairs: D1 load lại page ĐÃ SỬA (đúng nội dung thật — TOC mục 1–10, quiz 10 câu hiện diện) và lặp submit/retry thành công.
- **HTTP:** D1/D2/home = 200; R1/R4 = 200; 6 redirect meta-refresh đúng target; bundle quiz harness serve được (`import{t as e}from"./quiz.*.js";e();`).
- **Static dist:** fieldset `data-answer` histogram khớp audit (D1 a2/b2/c3/d3; D2 a3/b2/c3/d2); `#quiz-score` + retry hiện diện cả hai bài.

## Deviations

- **Ca lệch casing D1 phải ghim 2 chỗ.** Commit `1833691` chỉ thêm `"ch09-data-store-va-sharedpreferences"` vào `FILE_NAME_CASE` (bảng slug→base dùng lúc dựng pinByFile). Build sau đó fail-loud ĐÚNG THIẾT KẾ: `resolveLiveFileNames` so tên file chuẩn bằng `FILE_NAME_PIN` **riêng** (bảng nội bộ hàm) — vẫn ra "…Sharedpreferences" → "nhiều ứng viên Lesson cho key 09_1 và không file nào khớp tên chuẩn". Đã ghim đủ ở `bf163bc` (FILE_NAME_PIN + cập nhật comment). Kết quả: build xanh, D1 render đúng 15 mục/12 code/10 quiz; file ngủ đông Ch09_1ViSaoDataStore không còn thắng bucket nào. Bài học ghi lại: ca lệch tên file phải ghim ở bảng trong `resolveLiveFileNames`, không chỉ ở bảng dựng pin.
- **D2 display-pos/rank chạm đúng biên 40%** (không vượt) — audit PASS; ghi nhận để lần sau nếu sửa quiz D2 cần giữ dưới ngưỡng.
- **Đáp án key q5 D1 đổi option text** (thêm Set&lt;String&gt;/hedge) — value `c` và vị trí hiển thị giữ nguyên; histogram tính lại: rank 1..4 chuyển 3/2/2/3 → **3/2/1/4** (frontmatter đã đồng bộ). D2 q9 explanation đồng bộ với table mới.
- Không có deviation nào khác về schema/SPLIT_MAP/redirect/astro.config.mjs — tất cả đúng contract registry §6 row 6 + §7 entry 7.

## Freshness adversarial review

**Reviewer scope:** AGENT FRESH-6 độc lập, tự fetch nguồn chính thức (developer.android.com SharedPreferences reference + training, DataStore topic page + androidx-main source, maven.google.com metadata, androidx releases, Compose state docs) đối chiếu 11 claim area trong thân bài D1/D2 + AP3 §Ch09. Ngày review: 2026-09-09.

**Verdicts: 8 AGREE · 2 MINOR · 1 MAJOR · 0 BLOCKER.**

| # | Claim | Verdict |
|---|---|---|
| 1 | SharedPreferences KHÔNG @Deprecated; Google khuyến nghị DataStore | **AGREE** (reference không có Deprecated; trang training "strongly recommends against… use Jetpack DataStore") |
| 2 | `data` là Flow; edit/updateData suspend + transactional | **AGREE** (DataStore.kt KDoc "transactionally… atomic read-modify-write") |
| 3 | Một-instance + mô tả lỗi im lặng "chạy 10 đúng 9" | **MINOR** → đã sửa (docs hiện đặt cảnh báo ở "Use DataStore correctly", không phải nhãn "Important"; bản 1.1+ bật `IllegalStateException` — bài giữ cảnh giác cho project ghim 1.0.0) |
| 4 | Delegate top-level được khuyến nghị | **AGREE** |
| 5 | Không cần bọc Dispatchers.IO | **AGREE** (delegate tự đặt scope IO; KDoc "thread-safe, non-blocking") |
| 6 | Bài không dạy IOException→emptyPreferences | **AGREE** (docs hiện nay cũng không còn pattern đó; không mâu thuẫn) |
| 7 | Versions: 1.2.1 stable 03/2026, 1.3.0 alpha, project 1.0.0; Preferences vs Proto | **AGREE** (maven metadata + releases page) |
| 8 | CompositionLocal: provide/current, subtree scope, không tạo object, staticCompositionLocalOf | **AGREE** (compositionlocal docs) |
| 9 | viewModel() chỉ gọi được ctor rỗng | **AGREE** (viewmodel-factories docs) |
| 10 | "chỉ 5 kiểu nguyên thuỷ" | **MINOR** → đã sửa (SharedPreferences còn Set&lt;String&gt;; DataStore hiện có stringSet/doublePreferencesKey — hedge một dòng) |
| 11 | rememberSaveable "chết khi tắt app / hệ thống thu hồi process" | **MAJOR** → đã sửa (Compose state docs: rememberSaveable sống QUA cả system-initiated process death; chỉ chết khi USER tự tắt — swipe away/force stop/reboot; "không ghi đĩa" vẫn đúng) |

**Repairs freshness (commit `1833691`):** bảng mục 18 D2 + tóm tắt + cam-bay D1 + quiz q9 đổi sang cơ chế đúng ("chống lại: thay đổi cấu hình VÀ system-initiated process death / chết khi: người dùng tự tắt"); mục 5 D1 neo lại đúng docs hiện tại; "5 kiểu" hedge ở mục 2/tóm tắt/cam-bay/quiz q5/D2 mục 16; fence C4 (D1) + S2 (D2) kèm luôn trong cùng commit.

**Final count sau repairs: 0 BLOCKER · 0 MAJOR · 0 MINOR chưa xử lý.**

## Final adversarial review

**Reviewer scope:** AGENT FINAL-6 độc lập, tấn công 26 mặt lỗi trên FILE THẬT tại HEAD `1a3cb7c` (không tin gate report; monolith soi từ git history; tự chạy production build để verify). Ngày review: 2026-09-09.

**Findings (lượt 1): 23/26 PASS · 1 BLOCKER · 3 MINOR:**

1. **BLOCKER (surface 22 — stats cross-swap):** pin D1 bị đánh bại bởi casing tên file (`pascalOf` → "…Sharedpreferences" ≠ file thật "…SharedPreferences" — registry §9 giữ casing API). Hệ quả build thật: URL `/chapters/ch09-data-store-va-sharedpreferences/` render **file ngủ đông Ch09_1ViSaoDataStore** (4 heading draft, chip "4 mục / 7 khối code / 0 câu hỏi") và **quiz D1 vô hình**; D2 đúng nên lỗi bị che. Đã sửa `bf163bc` (ghim `FILE_NAME_PIN` trong resolver, mirror precedent ch06) — build lại: D1 render đúng 15 mục / 12 code / 10 quiz, 0 marker draft ngủ đông.
2. **MINOR-1 (surface 14):** D2 quiz q8 dùng `runBlocking` chưa được dạy trong thân D2 (tiền đề có từ S1/W1 + song song `commit()` D1 mục 2, giải thích dạy inline) → đã ghi provenance rõ trong frontmatter quiz (commit `1833691`).
3. **MINOR-2 (surface 1/26):** 4 Bài tập interactive của monolith quiz không có đích chuyển thẳng — đúng pattern split-quiz đã duyệt (Ch06/Ch08 đều 0 bài tập); tri thức cốt (saveDouble/doublePreferencesKey, trace, find-bugs) sống lại ở D1 mục 8–10 và D2 quiz q4/q8. Note-only.
4. **MINOR-3 (surface 25):** fence thiếu S2 (D2) và C4 (D1) → đã bổ sung (commit `1833691`).

**22 mặt còn lại PASS có bằng chứng riêng:** content-loss ledger 1:1 (mọi khối monolith có đích; checkpoint (c) hỏng được sửa), ownership D1-cơ-chế/D2-wiring không đảo, deprecated-doctrine chính xác 0 claim sai, shape-not-size, IOException 0 lần, IO cargo-cult 0, một-instance nhất quán, CompositionLocal 3 myths sạch, Hilt seam đúng 1–2 câu, ViewModel/persistence tách bạch, quiz keys 20/20 ngữ nghĩa + value/length/display phân bố (đều ≤40%), migration exact + previous stages byte-identical + redirect đúng hàng registry, 0 stale link/0 voice leak/0 used-before-taught, cleanup đúng IMP-064.

**Re-verification sau repairs:** build PASS 40 pages · astro check 0/0/65 · quiz_audit 2/2 PASS (D1 rank 3/2/1/4, D2 rank 0/3/3/4) · migration matrix 17/17 · dist D1 đúng nội dung thật + quiz 10 câu (browser submit/retry lại từ đầu) · live 39 / redirect 6 không đổi.

**Verdict: STAGE6_ADVERSARIAL_PASS — 0 BLOCKER · 0 MAJOR** (BLOCKER duy nhất đã sửa `bf163bc`; MINOR đã xử lý/note-only).

## Findings

- **Blockers:** none (lượt adversarial phát hiện 1 — stats casing cross-swap — đã sửa `bf163bc`, re-verify PASS).
- **Major:** none (lượt freshness phát hiện 1 — rememberSaveable/process-death — đã sửa `1833691`, re-verify PASS).
- **Minor (documented):** (1) 4 Bài tập interactive monolith không có đích — pattern split-quiz đã duyệt, note-only; (2) provenance runBlocking q8 — đã ghi vào frontmatter; (3) fence S2/C4 — đã bổ sung; (4) một-instance wording — đã neo docs hiện tại; (5) "5 kiểu" hedge — đã sửa; (6) 4 file ngủ đông Ch09_1..4 vẫn trên đĩa, không thuộc registry, bị loại khỏi bucket bởi pin (dọn theo batch IMP-064 như các file ngủ đông khác); (7) biên 40% D2 — note-only.

## Cleanup ownership

- Kiểm tra implementation plan: dọn file ngủ đông thuộc **IMP-064** (chưa chạy) → 4 file Ch09_1ViSaoDataStore/Ch09_2VietClassPrefs/Ch09_3PhatPrefsXuongApp/Ch09_4BugDauPhayVaLuuTab **GIỮ** trên đĩa, không tham chiếu; cách ly khỏi stats bằng FILE_KEY_PIN + FILE_NAME_PIN (đã verify: bucket 09_1/09_2 gắn đúng file live).
- Monolith + monolith quiz: xoá trong batch (`2930196`) đúng mốc registry. Script tạm migration matrix: xoá trước final gate (chưa từng vào git — `web/scripts/` bị ignore).
- Ch11: 0 byte đổi.

## Gate verdict

**GATE PASS** (sau adversarial closure `1833691` + `bf163bc`) — D1/D2 live đúng thứ tự và đúng số mục liên tục 1–21 theo mốc monolith · 2 quiz PASS (10 câu, 4 option, 1 đúng ngữ nghĩa, harness chung, key 30%, rank ≤40%, display-pos ≤40%) · schema 11 / map 12 / redirect 6 đúng contract · migration regression 17/17 · monolith + monolith quiz đã xoá, route chết có redirect 1 đích về D1 · live 39 / data stage 6 (D1 D2 R1 R2 R3 R4) · slug equality + stats pairing (FILE_KEY_PIN 09_1/09_2 + FILE_NAME_PIN casing) đúng · voice 0 leak · freshness adversarial **0 BLOCKER / 0 MAJOR** (sau repairs; 8/11 AGREE nguyên trạng, 2 MINOR + 1 MAJOR đã sửa) · final adversarial **STAGE6_ADVERSARIAL_PASS** (26 mặt, 1 BLOCKER + 3 MINOR phát hiện, đã sửa trong `1833691`/`bf163bc`) · build PASS 40 pages · astro check 0/0/65 (baseline giữ nguyên) · UX runtime quiz submit/retry verified trên cả hai bài · working tree clean · **chưa push**.

Sẵn sàng cho owner review trước Stage 7.
