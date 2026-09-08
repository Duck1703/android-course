# REVIEW_GATE_STAGE5

**Batch:** Stage 5 / Networking — Ch08 monolith → W1 / W2 / W3 (registry §7 entry 6)
**Baseline:** `59b2173` (Stage 4 gate PASS) · **Close:** commit `chore: close stage5 content review gate` (bản báo cáo này) · **Branch:** `main`, working tree clean, **not pushed**

---

## Scope / commits

| Commit | Nội dung |
|---|---|
| (batch này) | content(networking): W1+W2+W3 lesson+quiz (tách monolith theo mốc W1/W2/W3 START/END), wiring lessons.ts/chapters.ts/lessonStats pins, SPLIT_MAP replace + SCHEMA_VERSION 10, redirect ch08→W1, xoá Ch08Networking.astro + Ch08Quiz.astro, cập nhật QUIZ_MIGRATION_STATUS + AP3 pointer, sửa 1 câu hẹn-operator ở S1 |

ĐÃ DỪNG đúng ranh giới: **không** đụng Ch09 (D-track), Ch11 (X1/X2 giữ nguyên trạng thái một-route), O-track, appendix, homepage, không đổi quiz các stage trước (ngoại trừ ghi nhận retirement của Ch08Quiz trong docs). Ch07/S5/N1/N2 chỉ **đọc** để verify cross-ref, 0 dòng sửa — ngoại trừ 1 câu ở S1 (xem Deviations).

## Starting state

HEAD `59b2173`, tree clean · 36 live lessons · state stage 5 · SCHEMA_VERSION 9 · SPLIT_MAP 10 · redirects 4 · hints 65 · build PASS. Khớp expected checkpoint của brief.

## Final curriculum

### W1
- **slug:** `ch08-coroutines-va-flow` (registry §3, đúng từng ký tự)
- **component:** `Ch08CoroutinesVaFlow.astro` · **quiz:** `Ch08CoroutinesVaFlowQuiz.astro`
- **nội dung:** mục 1–7 (7 h2 số + cam-bay/tóm-tắt/nguồn = 10 h2) — bản đồ dispatcher (IO 64/Default theo core), đọc source `viewModelScope`, `SupervisorJob` ở mức nhận diện, `CoroutineContext` `+`, tuần-tự-theo-mặc-định, main-safe qua Retrofit suspend, đọc RecipeViewModel 6 StateFlow, hai collect hai launch, phê phán `queryRecipe` (suspend+launch dư, `Dispatchers.Default`), launch-then-pop.
- **IOU từ S1:** SupervisorJob (9 mention) · conflation (4) · collect-không-kết-thúc (mục 6 + quiz) · `CoroutineContext` `+` · async/Deferred (4 mention, đúng mức "biết tên") — **đã trả đủ các IOU thuộc phạm vi đọc code mạng**; catalogue toán tử Flow cố ý KHÔNG thuộc W1 (contract comment L10–11) — câu hẹn lệch ở S1 đã sửa (xem Deviations).

### W2
- **slug:** `ch08-retrofit-moshi-json`
- **component:** `Ch08RetrofitMoshiJson.astro` · **quiz:** `Ch08RetrofitMoshiJsonQuiz.astro`
- **nội dung:** mục 8–15 (8 h2 số + 3 = 11 h2) — mô hình HTTP tối thiểu, interface Retrofit là bản mô tả API (@GET/@Query/@Path), Moshi đổi JSON ↔ data class, `RetrofitInstance` object+lazy, codegen KSP thay reflection (bảng reflection ↔ codegen), toàn mạch mười bước, lần đầu gặp Coil (gloss — chi tiết Coil 3 nằm AP3).

### W3
- **slug:** `ch08-trang-thai-mang-api-key`
- **component:** `Ch08TrangThaiMangApiKey.astro` · **quiz:** `Ch08TrangThaiMangApiKeyQuiz.astro`
- **nội dung:** mục 16–23 (8 h2 số + 3 = 11 h2) — bốn tình huống loading/content/empty/error (rỗng ≠ lỗi), UiState trung thực có ô chứa lỗi, log ≠ thông báo, try/catch không nuốt huỷ (CancellationException đi tiếp), keys.properties→BuildConfig + ranh giới bảo mật, phân trang offset (PAGING_OFFSET=6), ba mức đọc code.

Monolith `Ch08Networking.astro` + `Ch08Quiz.astro`: **ĐÃ XOÁ** (route chết đúng như registry §6 row 5). Số mục liên tục 1–23 trên ba bài, khớp mốc W1/W2/W3 START/END của monolith.

## Registry identities & wiring

- `ALL_CHAPTERS` == `LESSONS` == `lessonStats` == live dist lesson routes == **38** (36 − 1 monolith + 3 W). Không duplicate, không placeholder.
- Ba entry chapters.ts: `number: 8`, `subNumber: 1/2/3`, `parentTitle: "Networking"`, `stageId: "network"`, `aafFolder: "08-networking"`, `hasProject: true`. Sidebar tự sinh nhóm Giai đoạn 5 đúng thứ tự W1→W2→W3 (verify trên dist homepage).
- **FILE_KEY_PIN:** `"ch08-coroutines-va-flow": "08_1"`, `"ch08-retrofit-moshi-json": "08_2"`, `"ch08-trang-thai-mang-api-key": "08_3"` — file live không mang số đơn vị (regex "Ch(\\d{2})" cho key "08") nên phải ghim, tránh file ngủ đông Ch08_1CoroutineVaFlow/Ch08_2RetrofitVaMoshi/Ch08_3LoiGoiMangDauTien thắng bucket (bug-class Stage 1/3). **Chưa gặp:** build + astro check sạch, stats pairing đúng → pins hoạt động.
- **Stats pairing verify trên dist:** W1 → W1 (30 phút, TOC đúng 7 mục), W2 → W2 (30 phút, mục 8–15), W3 → W3 (20 phút, mục 16–23). Homepage progress widget: **0/38 phần**. Không cross-swap.

## Progress migration

- schema before 9 → after **10** (bump đúng 1 — dead-source split, đúng contract §G)
- map before 10 → after **11**; entry mới: `"ch08-networking": [W1, W2, W3]` — replace (old chết), comment ghi rõ KHÔNG có bài NEW trong batch (không có no-fabricate case nào cho batch này — cả ba bài kế nhiệm trực tiếp).
- migration regression: **11/11 PASS** (script tạm `migration_matrix_s5.mjs`, đã xoá; thuật toán migrateProgress trích verbatim từ progress.ts): ch08 monolith → đúng bộ ba W · old slug dies · mixed-state preserved · combined ch05/ch06/ch08 monoliths resolve đủ cây · không fabricate cho S1/S5/Ch09 · dedupe/idempotent/unknown-passthrough/keep-source ch02-2/dead ch01-4 cleanup/old ch10-1→R1-only giữ nguyên hành vi từ các stage trước.
- SCHEMA_VERSION history comment cập nhật (9 = Stage 3 …; 10 = Stage 5).

## Redirect

- before 4 → after **5**: thêm `"chapters/ch08-networking": "/chapters/ch08-coroutines-va-flow/"` — đúng cột redirectTarget registry §6 row 5. Dist artifact verify: meta-refresh HTML đúng vị trí `/chapters/ch08-networking/index.html`, cùng cơ chế với 4 redirect trước.
- Tổng dist: **38 live + 5 redirect = 43** chapter dirs (crawl xác nhận).

## Quizzes

| Quiz | Câu | Keys | Max key share | Length-rank (audit) |
|---|---|---|---|---|
| W1 | 10 | d a b c b d a c b a | 3/10 = 30% | 1/1/4/4 → max 40% |
| W2 | 10 | c b a d b c a d c b | 3/10 = 30% | 0/3/4/3 → max 40% |
| W3 | 10 | b d c a b d c b a c | 3/10 = 30% | 3/4/3/0 → max 40% |

- `node scripts/quiz_audit.mjs` (char-length rank): **3/3 PASS** · 4 options/1 correct · explanations 100% · shared harness `initQuiz` + `#quiz-retry`.
- Quiz W3 cross-ref "W1 mục 6/W2 mục 14(1)", W2 "W1 mục 7"… — mọi mục được trỏ tồn tại thật (verify h2 numbering).
- Monolith Ch08Quiz retirement ghi vào `docs/QUIZ_MIGRATION_STATUS.md` (row **retired (Stage 5)**, thay bằng 3 quiz harness).

## Cross-references & docs

- **AP3** (`docs/drafts/ap3-version-drift.md` §Ch08): "Bài lõi trỏ về đây" đổi từ "trang Ch08 hiện tại" → ba slug W tường minh; bảng "8 điểm lệch" giữ nguyên đích W1/W2/W3/N1 (vẫn đúng sau split).
- **S1** (`Coroutines20PhutKhongSo.astro`): các hẹn "thuộc W1" đối chiếu với W1 — Job/`SupervisorJob` cơ chế, conflation, cold/hot-ở-mức-nhận-diện, collect-never-returns ĐÃ trả; **1 câu hẹn "Họ toán tử là nội dung W1" LỆCH với contract W1 (KHÔNG catalogue toán tử) → đã sửa** thành phát biểu đúng: operators nằm ngoài phạm vi giai đoạn Mạng, W1 dạy những gì cần để đọc code mạng thật.
- **S5** (kien-truc-ui-data-repository): các trỏ "W2/W3/W1" — verify đúng chủ đề từng bài sau split (W2 = model tầng mạng, W3 = trạng thái tầng mạng, W1 = toán tử Flow ở mức dùng).
- **N1/N2:** "W1–W3" = phần mạng — vẫn đúng; N2 L594 ghi "phân tích sâu ghi lại cho W1" — W1 có đúng nội dung launch/cancellation ở mức phê phán.
- Ch02/Ch03 quiz "Chương 8" (INTERNET permission, v.v.): trỏ theo SỐ chương, không trỏ cấu trúc trang — **không cần sửa**.

## Voice / prerequisites / provenance

- Voice: 0 leak ("sách nói/chapter này/tác giả/giáo trình nói" — 0 match vùng learner-facing của cả 3 bài).
- Prerequisites: mỗi fence "Cần biết trước" của W-batch trỏ đúng bài đã dạy; W3 mở đầu tóm tắt đúng những gì W1/W2 cho; không giả định gì ngoài đó.
- Provenance: đúng 1 `#cam-bay` + 1 `#nguon` mỗi bài (3/3 verify); nguồn trích project mẫu ghim file+dòng (RecipeViewModel.kt L73–83/L95–111, SpoonacularService.kt L47/L49–59/L61–79, RecipeList.kt L55/L57–93, ShowRecipeList.kt L76–93, RecipeDetails.kt L94–117, RecipeCard.kt AsyncImage, manifest INTERNET) — các số dòng này đã kiểm lại 2026-09-08 trong phiên viết bài (memory version-facts), khớp aaf-materials.

## Freshness (checked 2026-09-08)

Retrofit 3.0.0 (15/05/2025) / nhánh 2.x kết ở 2.12.0 · Moshi 1.15.2 · Coil 3.6.2 (io.coil3) · kotlinx-coroutines 1.10.2 — toàn bộ số phiên bản nằm ở **AP3** (bảng lệch phiên bản Ch08, authority), thân bài KHÔNG ghim số vào khái niệm phải nhớ; W2/W3 #cam-bay trỏ về AP3 đúng contract.

## Build / Astro

- `npm run build`: **PASS** — 39 pages (38 lesson + homepage), 5 redirect artifacts
- `npx astro check`: **0 errors · 0 warnings · 65 hints** (= baseline 65).
  - Trace: sau wiring thô = 68 (+3 từ W-batch: `AAF_START` unused ×2 ở W1/W3, `initQuiz` unused ở script đuôi W1 lesson); đã dọn: xoá `AAF_START` không dùng ở W1/W3, xoá script đuôi thừa ở W1 (quiz script sống trong file Quiz như mọi bài khác) → **65 đúng baseline**.
- Homepage sidebar: 3 href ch08-W xuất hiện đúng; 0 href ch08-networking sống (chỉ redirect artifact).

## Deviations

- **S1 1 câu sửa** (`Coroutines20PhutKhongSo.astro` ~L486): hẹn "Họ toán tử là nội dung W1" mâu thuẫn contract W1 (comment L10–11: KHÔNG catalogue toán tử Flow). Sửa thành phát biểu trung thực: operators ngoài phạm vi giai đoạn Mạng; W1 dạy đủ để đọc code mạng. Ngoài câu này, S1 không đụng.
- **Minutes W3:** registry ước lượng 25 phút; engine stats tính 20 phút (200 từ/ph + 0.5/code-block, làm tròn 5). Engine là nguồn hiển thị như mọi bài — không phải lệch wiring; ghi nhận ở đây.
- Không có deviation nào khác về schema/SPLIT_MAP/redirect/astro.config.mjs — tất cả đúng contract registry §6 row 5 + §7 entry 6.

## Freshness adversarial review

**Reviewer scope:** AGENT FRESH-5 độc lập, KHÔNG đọc-kết-luận-sẵn; tự fetch nguồn chính thức (developer.android.com, kotlinlang.org, square.github.io/retrofit, github.com/square/moshi, coil-kt.github.io/coil, Maven Central, GitHub releases, decompile AAR lifecycle-viewmodel 2.10.0) đối chiếu từng claim trong thân bài W1/W2/W3 + AP3 §Ch08. Ngày review: 2026-09-09.

**Sources independently checked (8 claim areas):**

| # | Claim | Verdict | Evidence độc lập |
|---|---|---|---|
| 1 | suspend ≠ background thread | AGREE | kotlinlang/Android coroutines guide: withContext mới chuyển chỗ chạy, dispatcher quyết định thread |
| 2 | Retrofit suspend main-safe | AGREE | Android data-layer docs nguyên văn "main-thread-safe APIs… Retrofit"; cơ chế OkHttp pool khớp Retrofit CHANGELOG 2.6.0 (suspend support, 2019-06-05 — "từ bản 2.6.0, 2019" trong W1 đúng lịch sử) |
| 3 | Moshi ≠ KSP | AGREE | Moshi README: codegen là Kotlin SymbolProcessor, sinh adapter lúc compile-time; reflection kéo kotlin-reflect 2.5 MiB; "prefer codegen" |
| 4 | Coil độc lập Retrofit | AGREE | coil-kt.github.io: "image loading library", AsyncImage, io.coil3 3.6.2 hiện hành; W2 gloss đúng mức, drift Coil 3 ở AP3 đúng contract |
| 5 | APK không giữ được secret | AGREE | Android security-tips + Google Cloud API-keys docs ("bypass straightforward"); bảng ranh giới W3 khớp nguyên tắc chính thức |
| 6 | empty ≠ error | AGREE | Android ui-layer guidance dạy ô lỗi riêng trong UiState từ catch — không mâu thuẫn mô hình bốn trạng thái |
| 7 | Version claim thân bài | AGREE (0 stale) | Grep 3 bài: chỉ có con số trong khối TOML trích nguyên văn project (đúng) + "2.6.0, 2019" (sự kiện lịch sử đúng). AP3 đối chiếu: Retrofit 3.0.0/2.12.0 ✓, Moshi 1.15.2 ✓, Coil 3.6.2 ✓, Kotlin 2.4.20 ✓, Timber 5.0.1 ✓ |
| 8 | Coroutine concepts (IO 64 · Default = cores min 2 · viewModelScope SupervisorJob+Main.immediate · conflation · collect-never-returns) | AGREE toàn bộ | kotlinx source (Tasks.kt CORE_POOL_SIZE, IO_POOL_SIZE 64), lifecycle 2.10.0 decompile (SupervisorJob + Main.immediate, single creation, auto-cancel), kotlinlang StateFlow docs nguyên văn |

**DISAGREE với gate report:** mục Freshness của report này (phiên trước) ghi "kotlinx-coroutines 1.10.2" — theo Maven/GitHub thì 1.11.0 stable từ 2026-05-08; con số trong AP3 (1.11.x) mới đúng. Câu "thân bài KHÔNG ghim số" overstated nhẹ vì "2.6.0, 2019" là số trong thân (đúng sự kiện lịch sử, không phải version pin).

**Repairs:** không cần cho freshness (0 BLOCKER/0 MAJOR).

**Minor (note-only):** (1) source viewModelScope W1 trích là snapshot AndroidX cũ (lifecycle ≥2.9 đổi sang getCloseable/addCloseable) — mọi kết luận cơ chế vẫn đúng; nếu trích lại sau nên thêm caveat "source as of lifecycle 2.x"; (2) nhãn ngày "(08/2026)" ở dòng kotlinx-coroutines của AP3 lệch với ngày phát hành thật 2026-05-08 (số phiên bản đúng; sửa trong batch AP3).

**Final count: 0 BLOCKER · 0 MAJOR.**

## Final adversarial review

**Reviewer scope:** AGENT FINAL-5 độc lập, tấn công 24 mặt lỗi trên FILE THẬT tại HEAD (không tin gate report; monolith soi từ `git show 59b2173:…`). Ngày review: 2026-09-09.

**Findings (lượt 1):** 21/24 PASS · **2 FAIL:**

1. **BLOCKER — W1 quiz miskey 4/10 câu** (`Ch08CoroutinesVaFlowQuiz.astro`): Q1 key d (đúng: a), Q7 key a (đúng: b), Q8 key c (đúng: b), Q9 key b (đúng: d) — mỗi câu key chỉ option SAI trong khi giải thích in kèm dưới nó lại mô tả đúng option kia; quiz không chấm đúng được. W2/W3 verify đúng 20/20.
2. **MAJOR — cue vị trí đầu:** đáp án đúng hiển thị ĐẦU tiên trong 9/10 câu W2 và 10/10 câu W3 (baseline monolith 6/19 ≈ 32%; quiz anh em 2–3/10). `quiz_audit.mjs` mù với lỗi này vì audit đọc `value` attribute trong khi thứ tự HIỂN THỊ label chưa từng được xáo — vi phạm chuẩn quiz §13 "vị trí đáp án đúng phân tán".

22 mặt còn lại PASS có bằng chứng riêng (content-loss map 1:1 cả 23 mục; W1 deepen không re-teach S1; không myth suspend=thread; UDF/StateFlow đúng; Retrofit/Moshi/KSP chính xác; Coil gloss trước khi dùng; nav 2023 giữ nguyên văn; repository không dạy lại; bốn trạng thái đúng; API-key trung thực; log ≠ thông báo; paging nguyên vẹn; migration shape + no-fabricate + redirect + stats pins đúng; voice sạch; không used-before-taught; không dead link; không cleanup loss). 3 minor kèm theo (xuống dưới).

**Repairs (commit `d40b12a`):**
- Sửa 4 key W1: Q1 d→a, Q7 a→b, Q8 c→b, Q9 b→d (giải thích giữ nguyên — chúng vốn mô tả đúng đáp án thật); cân đối lại length-rank (đáp án đúng đang rank-4 8/10) về **1..4 = 3/3/3/1**.
- Xáo thứ tự HIỂN THỊ label W2/W3 (giữ nguyên cặp value↔text, data-answer, giải thích; mọi tham chiếu "Đáp án x" trong giải thích là theo value nên không vỡ): W2 displayPos **{1:2, 2:3, 3:2, 4:3}**, W3 **{1:3, 2:4, 3:2, 4:1}** — hết pattern "đáp án luôn đứng đầu".
- Minor kèm theo: W1 fence "Cần biết trước" thêm chỉ dẫn chạy starter trước + trỏ W2 mục 14.1 (mất đoạn "chạy project mẫu trước khi sửa gì" của monolith — lượt 1 phát hiện); W2 #nguon sửa cite toml coil "dòng 15"→"dòng 16" (verify trực tiếp `aaf-materials/…/libs.versions.toml`).

**Re-verification sau repairs:** `quiz_audit.mjs` **3/3 PASS** (W1 pos 3/4/1/2 · rank 3/3/3/1; W2 pos 2/3/3/2 · rank 0/3/4/3; W3 pos 2/3/3/2 · rank 3/4/3/0) + display-position check 3/3 phân tán (max 4/10 = 40%) + build PASS 39 pages + astro check 0/0/65 + migration sim 6/6 PASS (schema 10, map 11, ch08 fan-out, idempotent, không fabricate S1/S5/N1/N2) + live 38 / redirect 5 không đổi.

**Verdict lượt 2: STAGE5_ADVERSARIAL_PASS — 0 BLOCKER · 0 MAJOR.**

**Minor còn lại (note-only, không gating):** (1) đoạn intro chung không-numbered của monolith ("chạy starter trước") không mang hết sang W1 — đã xử lý bằng pointer trong repairs; (2) cite toml 15→16 — đã sửa trong repairs; (3) hai minor của freshness reviewer (viewModelScope source snapshot; nhãn tháng AP3).

## Findings

- **Blockers:** none (lượt adversarial 1 phát hiện 1 — W1 quiz miskey — đã sửa `d40b12a`, re-verify PASS).
- **Major:** none (lượt adversarial 1 phát hiện 1 — cue vị trí đầu W2/W3 — đã sửa `d40b12a`, re-verify PASS).
- **Minor (documented):** (1) câu hẹn operator ở S1 — đã sửa trong batch; (2) minutes W3 registry-vs-engine 25↔20 — note-only; (3) 3 file ngủ đông Ch08_1CoroutineVaFlow/Ch08_2RetrofitVaMoshi/Ch08_3LoiGoiMangDauTien vẫn trên đĩa (không thuộc registry, bị loại bởi filter key — đúng thiết kế; dọn theo batch cleanup IMP-064 như các file ngủ đông khác); (4) viewModelScope source snapshot + nhãn tháng AP3 (freshness reviewer) — note-only; (5) "2.6.0, 2019" trong thân W1 là sự kiện lịch sử đúng, không phải version pin — ghi nhận để nhất quán tiêu chuẩn.

## Gate verdict

**GATE PASS** (sau adversarial closure `d40b12a`) — W1/W2/W3 live đúng thứ tự và đúng số mục liên tục 1–23 theo mốc monolith · 3 quiz PASS (10 câu, 4 option, 1 đúng, harness chung, key 30%, rank ≤40%, **thêm sau adversarial: display-position phân tán, key verify đúng ngữ nghĩa 30/30**) · schema 10 / map 11 / redirect 5 đúng contract · migration regression 11/11 + 6/6 sau repairs · monolith + monolith quiz đã xoá, route chết có redirect 1 đích về W1 · live 38 / network stage 3 · slug equality + stats pairing (FILE_KEY_PIN 08_1/08_2/08_3) đúng · voice 0 leak · freshness adversarial **0 BLOCKER / 0 MAJOR** (8/8 AGREE, sources độc lập) · final adversarial **STAGE5_ADVERSARIAL_PASS** (24 mặt, 1 BLOCKER + 1 MAJOR phát hiện và sửa trong `d40b12a`) · build PASS · astro check 0/0/65 (baseline giữ nguyên) · S1 IOU audit xong, 1 câu lệch đã sửa · working tree clean · **chưa push**.

Sẵn sàng cho owner review trước Stage 6 / Data (Ch09 → D1/D2, Ch11 → X1/X2).
