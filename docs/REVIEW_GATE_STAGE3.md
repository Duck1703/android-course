# REVIEW_GATE_STAGE3

**Batch:** Stage 3 / State & kiến trúc — IMP-042 (S1) + IMP-035 (Ch06 → S2–S4) + IMP-043 (S5)
**Baseline:** `bd597f8` (Stage 2 gate PASS) · **Close:** commit `chore: close stage3 content review gate` (bản báo cáo này) · **Branch:** `main`, working tree clean, **not pushed**

---

## Scope / commits

| Commit | Nội dung |
|---|---|
| `70744cc` | content(state): S1 lesson+quiz (từ draft đã chấp nhận), split Ch06 → S2/S3/S4 theo mốc START/END của chính monolith, S5 lesson+quiz (từ draft đã chấp nhận) |
| `48a0f89` | feat(state): ATOMIC wiring — lessons.ts/chapters.ts +5 entry, SCHEMA_VERSION 8→9, SPLIT_MAP +1, redirect ch06, lessonStats pins |
| `d5cc919` | chore(state): retire 6 file Ch06 (monolith + quiz + 4 dormant), S5↔R3 cross-ref, Ch03_1Quiz stale refs, AP3 draft update |
| `1c9dd5f` | fix(content+quiz): adversarial repairs — 4 MAJOR (quiz answer-cue/pattern), 2 MINOR (stale paths, header numbering) |

ĐÃ DỪNG đúng ranh giới: **không** bắt đầu N1/N2, Stage 4 Navigation, Ch08/W1–W3, Stage 5+, Model B-lite, optional track. Ch07 không đụng (trừ 0 dòng — chỉ đọc).

## Final curriculum

| ID | Slug | Component | Quiz | Mục | Quiz câu |
|---|---|---|---|---|---|
| S1 | `coroutines-20-phut-khong-so` | Coroutines20PhutKhongSo.astro | Coroutines20PhutKhongSoQuiz.astro | 1–13 | 10 |
| S2 | `ch06-state-va-recomposition` | Ch06StateVaRecomposition.astro | Ch06StateVaRecompositionQuiz.astro | 1–4 | 10 |
| S3 | `ch06-state-hoisting-va-udf` | Ch06StateHoistingVaUdf.astro | Ch06StateHoistingVaUdfQuiz.astro | 5–8 | 10 |
| S4 | `ch06-viewmodel-va-ui-state` | Ch06ViewModelVaUiState.astro | Ch06ViewModelVaUiStateQuiz.astro | 9–19 | 10 |
| S5 | `kien-truc-ui-data-repository` | KienTrucUiDataRepository.astro | KienTrucUiDataRepositoryQuiz.astro | 1–19 | 10 |

Slug/component/quiz lấy đúng từng ký tự từ `TARGET_REGISTRY_v5.md` §3 (không suy từ lessonId). S2/S3/S4 giữ đánh số mục của monolith (contract "Đánh số mục KHÔNG cần đổi khi tách" do chính monolith ghi); S1 và S5 là bài NEW, tự đánh số từ 1.

## Stage order / dependencies

Sidebar/dist: `coroutines-20-phut-khong-so → ch06-state-va-recomposition → ch06-state-hoisting-va-udf → ch06-viewmodel-va-ui-state → kien-truc-ui-data-repository` — verify bằng script trên dist HTML. Chuỗi prev/next xuyên ranh giới giai đoạn: ch05-tiep-can-moi-nguoi-dung → S1 → … → S5 → ch07. S1 được dựng/review TRƯỚC khi S2–S4 chốt (thứ tự Wave B→D); S5 dùng lại ViewModel/UiState/StateFlow của S4 và suspend/scope/Flow của S1 mà không dạy lại (các mục "trả nợ" ghi rõ nguồn bài).

## S1 coroutine boundary

- **5 mental model bắt buộc của brief đều có:** coroutine = công việc có thể tạm dừng rồi tiếp tục (mục 1–2); suspend = được phép tạm dừng, KHÔNG tự chọn thread/dispatcher, KHÔNG có nghĩa chậm (mục 3, mô hình hai nửa của đợt sửa S1B); scope = chủ sở hữu (mục 6: viewModelScope/rememberCoroutineScope/LaunchedEffect); dispatcher = chạy ở đâu (mục 7: Main/IO/Default + chọn theo bản chất việc); Flow/StateFlow ở mức nhận biết (mục 10–11).
- **1 launch + 1 withContext** ở mức tối giản (mục 5, mục 8) — đúng brief.
- **W1 deferrals tường minh (verify bằng grep):** async/await/Deferred → W1 (mục 5); SupervisorJob/CoroutineContext → W1 (mục 7); toán tử Flow/cold-hot → W1 (mục 10); MutableStateFlow/SharedFlow/stateIn → S4/W1 (mục 11). 0 khái niệm W1 bị dạy sâu.
- **Kỹ thuật:** "viewModelScope không phải thread nền" chặn trước (mục 6); quy tắc main-safety hai câu (mục 9); collect-xong-khi-nào đúng tinh chỉnh S1B (Flow có thể kết thúc; dòng trạng thái không có điểm kết thúc tự nhiên — Tự kiểm tra 7, Cạm bẫy 8). Technical auditor: PASS 0 BLOCKER/0 MAJOR; 4 MINOR (scoping "luôn thấy collect", 3 distractor straw-man/mini-clone checkpoint) — đã sửa hết trong Wave F.

## Ch06 ownership audit

Monolith `Ch06AdvancedJetpackCompose.astro` (2359 dòng @ `bd597f8`, đã xoá — khôi phục được từ Git) tách theo đúng mốc `S2/S3/S4 START/END` do chính nó ghi:

- **S2** = mục 1–4 + cạm bẫy nhóm (a) + #nguon Đơn vị 1 · **S3** = mục 5–8 + (b) · **S4** = mục 9–19 + (c) + mục "Tài liệu lỗi thời — nơi tra".
- **Preservation (adversarial verify, độc lập):** 38/38 code const byte-identical giữa monolith@bd597f8 và 3 file mới; 5/4/29 khối `<Code>` khớp 5/4/29; normalized text diff của từng vùng START/END + khối cam-bay/nguon: **0 run ≥12 từ chỉ tồn tại ở bản cũ**; 130/130 `<li>` của monolith khớp 1:1 trong hợp của 3 file (khác biệt duy nhất = đổi nhãn "Đơn vị k" → "bài này/bài sau/bài ViewModel & UI state").
- **Sử dụng tiếng "MVI" của quiz cũ:** không sao chép — 30 câu S2–S4 viết mới theo ownership (state/recomposition · hoisting/UDF · ViewModel/StateFlow). Cảnh báo "Intent trong MVI ≠ android.content.Intent" giữ tại AP3 (draft §6) đúng chỉ định.
- **Mất-mót:** 0 có giá trị. Mục lục đích drift-table → AP3 giữ nguyên; `LaunchedEffect` depth nằm ở C4/R4 đúng ranh giới.

### AP3 destination

Bảng lệch phiên bản Ch06 (6 hàng), lệch giáo trình↔project (4.1/4.2), bảng so starter↔final — đã nằm trong `docs/drafts/ap3-version-drift.md` mục Ch06 từ trước; batch cập nhật bảng ownership §6 với cột trạng thái "đã thực thi Stage 3" + đổi dòng "Bài lõi trỏ về đây" sang S4. AP3 vẫn NOT LIVE.

## S2 state model

`giao diện = f(state)` · mutableStateOf = ô nhớ Compose quan sát được (đọc → ghi nhận, đổi → xếp lịch) · remember = cái ngăn gắn với vị trí, 3 điều không làm (đĩa/config-change/tắt app) · bảng 4 mức vòng đời (biến thường → remember → rememberSaveable → ViewModel → lưu lâu dài) · recomposition = chạy lại phần đã đọc state, bảng 5 cách hiểu sai, không đoán được số lần → việc phụ có chỗ riêng. Auditor xác nhận đúng ranh giới: không ViewModel, không hoisting/UDF trong S2.

## S3 hoisting / UDF model

Một sự thật một chủ · khuôn `value: T` + `onValueChange: (T) -> Unit` (một cặp thứ hai Boolean trong cùng composable — code thật) · hoist tới **tổ tiên chung thấp nhất** với bảng "không thấp hơn/không cao hơn" + bảng 3 state ví dụ · UDF ≠ Flow (đoạn phân định giữ nguyên văn từ monolith) · callback tham gia UDF chỉ khi quyền sở hữu đúng ("sau khi callback chạy, ai đổi state?").

## S4 ViewModel / StateFlow

- Lập luận 4 bước vì sao chủ ngoài UI · ViewModel = cái tủ ngoài phòng · bảng sống-qua-cái-gì (recomposition/config-change/ở lại nền/còn — process death/tắt app MẤT) · `SavedStateHandle` chỉ nhận biết.
- `collectAsStateWithLifecycle()` = cây cầu biết vòng đời, bảng 4 tầng; **StateFlow KHÔNG biết vòng đời** (callout SAI + cạm bẫy) · `collectAsState()` = nhận-khi-đọc-code-cũ.
- `stateIn` 3 tham số + lý do cửa sổ 5 giây (xoay máy) + cảnh báo không sao chép con số; bảng stateIn-vs-MutableStateFlow.
- Process-death boundary đúng; chuỗi 7 bước cú chạm→pixel (mục 17); đọc state chết 4 bước (mục 18); Jump-to-bottom luyện tập (mục 19).
- **S4 không dạy S5:** ví dụ `stateIn` ghi chú nguồn "là nội dung bài S5"; notice kết bài trỏ S5; data source chỉ là hàm giả có nhãn.

## S5 architecture

- Hai vùng trách nhiệm (UI/dữ liệu) + domain **optional** chỉ nhận biết; mục ""Đúng năm lớp" không phải một luật" với sửa-đúng 3 câu; "đừng dựng app theo từng lớp một".
- Repository = biên giới; bảng 5 việc CÓ THỂ làm; callout "KHÔNG phải là gì" 5 điều (không phải class database/mạng, không tự động SSOT, không phải thành phần Android); mục 6 sửa "repository = SSOT" bằng bảng sai→đúng + repository ≠ storage.
- Interface policy: 3 lợi ích thật + mặt còn lại nói thẳng (1 interface 1 cài đặt chưa mua được gì); SOLID/Clean chỉ rào 1 câu ở mục 8.
- Dependency direction: bảng được-phép-biết; phân định với S3 ("xuống/lên" hai trục khác nhau — h3 riêng).
- Đường đọc/ghi: 2 khối `<pre class="tree">` + mục 17 hai chiều; không ép cùng một refresh strategy.
- **Nguồn:** thu hoạch doctrine từ Ch10.1/Ch10.3 (đã chấp nhận), **zero Ditto/Ch07** (grep xác nhận); `suspend` ở biên giới (mục 15) đúng mô hình S1 — code của bài không có `withContext(IO)` nào.
- Cross-ref R3: S5 mục 16 + notice trỏ R3 ("cài đặt biên giới trên Room"); R3 mục 13.1 nối S1/S5 cho bước `withContext` — minimal learner-facing touch, không đụng quiz R3.

## Quizzes

- 5/5 quiz live đúng cặp registry; harness chung `initQuiz` (IMP-001) cả 5; 10 câu/quiz (trong khung 8–12), 4 đáp án/1 đúng, giải thích 100%.
- **Mechanical audit (script, chạy lần cuối sau repairs):** S1 10/4opt/100%explain/harness · S2 idem · S3 idem · S4 idem · S5 idem — ALL PASS; dist fieldsets = 10 cho từng trang S.
- **Position distribution** (sau re-key): S1 `cbdabcdbac` 3/3/2/2 · S2 `adcabcdbac` 3/2/3/2 · S3 `cbdacdbbac` 2/3/3/2 · S4 `acdbadbacc` 3/2/3/2 · S5 `cadbcdbacb` 2/3/3/2 — max share 30%, mọi vị trí ≥2 lần.
- **Answer-length rank** (1 = dài nhất, sau repairs `1c9dd5f`): S1 longest 20%/shortest 30% · S2 20%/0% · S3 40%/10% · S4 30%/10% · S5 30%/10% — mọi quiz ≤40% cả hai chiều; không còn cue "chọn luôn dài nhất" (trước repair: S4 100%, S5 90%, S2 80% — adversarial MAJOR).
- **Không còn pattern liên quiz:** S2≡S4 `cadbcadbca` và S3 period-4 trước repair → sau repair 5 chuỗi keys khác nhau, không chu kỳ 4.
- Myth hygiene: 0 option đúng của các myth brief liệt kê (suspend=IO, viewModelScope=nền, remember=persistence, recomposition=Activity restart, hoisting=đẩy hết lên root, UDF=Flow, StateFlow lifecycle-aware, ViewModel sống qua tất cả, repository luôn SSOT, interface luôn nên có, 5 lớp bắt buộc) — các myth chỉ xuất hiện ở vị trí distractor và bị đánh đổ trong giải thích.

## Progress

- `SCHEMA_VERSION` 8 → **9** (đúng 1 lần, trong commit atomic `48a0f89`). Lịch sử 6/7/8/9 ghi đủ §G.
- `SPLIT_MAP` 9 → **10** entry: thêm `ch06-advanced-jetpack-compose → [S2, S3, S4]` (replace). 9 entry cũ nguyên vẹn (ch01/ch02/ch03/ch10 monolith, ch10-1→R1, ch01-4-repair, ch02-2 keep-source, ch03-2, ch05).
- **Migration matrix 20/20 PASS** (script tạm `_stage3_migration_matrix.mjs`, đã xoá sau khi chạy): old-Ch06→S2–S4; old-Ch06+1 con → dedupe; S1/S5 absent-stays-absent; old-Ch05→C1–C4; C5 không fabricated; chuỗi cũ ch01/ch02/ch03/ch10 còn chạy; ch10-1→R1 ONLY (không S5); repair slug A4; keep-source ch02-2; combined 6 monolith → 24 descendants all-live; dedupe; idempotent; corrupt storage; unknown slug; SPLIT_MAP self-audit (mọi target live hoặc intermediate); 19/20: không mapping chứa S1; 20/20: không mapping chứa S5.
- **S1 không legacy credit** — không nằm trong mapping nào. **S5 không legacy credit** — idem; ch10-1 vẫn → R1 duy nhất.

## Redirect

- Thêm đúng 1: `chapters/ch06-advanced-jetpack-compose` → `/chapters/ch06-state-va-recomposition/` (registry §6 row 3, verified không gõ từ trí nhớ). Tổng active = **4** (ch10-1, ch03-2, ch05, ch06). Dist artifact meta-refresh verified (`url=` đúng).
- Không redirect cho S1, không redirect cho S5. 3 redirect cũ không đổi.

## Registry / stats

- Live lessons **34** = 30 cũ + 2 net (Ch06 1→3) + S1 + S5. Stage counts: foundation 2 · android 14 · compose 5 · **state 5** · network 1 · data 5 · realworld 1 · optional 1 = 34 (ch07 Mở rộng; navigation/appendix 0) — verify script.
- Slug-set equality: registry(34) == ALL_CHAPTERS == LESSONS == 34 dist lesson dirs (38 dist dirs − 4 redirect artifacts) — script-verified.
- **Stats pairing (bug-class Stage 1):** `FILE_KEY_PIN` +5 (S2→06_2, S3→06_3, S4→06_4, S1/S5 theo foundation-key convention vì file không mang ChNN); **`FILE_NAME_CASE`** ghim `Ch06ViewModelVaUiState` — pascalOf("ch06-viewmodel-va-ui-state") ra "Viewmodel" lệch tên file thật, nếu không ghim thì file live rơi vào key "06" (không thuộc registry) và **file ngủ đông Ch06_4JumpToBottom thắng bucket 06_4** — bug này thực sự xảy ra trong quá trình build (TOC của S4 từng hiển thị TOC của file ngủ đông, quiz 0 câu) và được sửa trong `48a0f89`. Dist verify từng bài: S1 17 mục/10 câu, S2 6/10, S3 6/10, S4 13/10, S5 23/10 — TOC khớp đúng h2 của chính bài, không swap chéo.

## Cross-links

- Sweep `ch06-advanced-jetpack-compose` toàn src: chỉ còn progress source, redirect source, comments/const provenance (`BOOK` path — nội dung giáo trình gốc, hợp lệ), docs. Learner-facing: Ch03_1Quiz 2 chỗ "Chương 6.1/6.2" cũ → cập nhật đúng bài mới (6.2 remember / 6.4 ViewModel). Ch02_1/Ch10_1 hit là dạng #nguon/đối chiếu nguồn, hợp lệ.
- "Chương 6"/"MVI"/"học ở Chương 8": MVI bỏ khỏi lõi đúng kế hoạch (AP3 giữ cảnh báo Intent); không có link learner-facing nào về "học ở Chương 8".
- S5↔R3 hai chiều như trên. Ch08 #nguon cập nhật tên file S4 mới.

## Cleanup

Xoá **chỉ** file Ch06-owned, khôi phục được từ Git: monolith `Ch06AdvancedJetpackCompose.astro`, `Ch06Quiz.astro`, 4 draft ngủ đông `Ch06_1StateVaRecomposition`/`Ch06_2ViewModelVaMvi`/`Ch06_3NoiDayViewModelVaoUi`/`Ch06_4JumpToBottomVaDocLai` (pre-spec-v2, chưa từng route; adversarial verify nội dung đặc thù của chúng — derivedStateOf, chuỗi 5 bước, jump-to-bottom — đã sống trong S4 live). Không import/glob còn trỏ tới (build xanh). File Ch07+ không đụng.

## Voice / prerequisites

- Voice scan (loại code/Nguồn/comments/frontmatter): **0 leak** "sách nói/tác giả/giáo trình/chapter này" trên 10 file S1–S5 (lesson+quiz) — script chạy 2 lần (sau Wave F và sau repairs).
- Prereq: S1 dùng đúng F1/F2/C4 (2 gloss có nhãn: dấu `:` "là một", giá trị khối cuối); S2 chỉ cần Ch05+F1/F2 (S1 touch-point ghi rõ); S3 cần S2; S4 cần S2/S3+S1+F2 (nêu tường minh); S5 cần S4+S1+F1/F2, `private`/`interface`/`override` gloss đủ. Repository không được dạy sớm ở bất kỳ bài nào trước S5. 0 used-before-taught không gloss.

## UX / visual verification

- Browser unavailable → dist + DOM/static checks (giới hạn ghi nhận ở đây, đúng fallback của brief). Verified: sidebar "Giai đoạn 3 — State & kiến trúc" đúng 5 bài đúng thứ tự, không còn Ch06 cũ; prev/next xuyên ranh giới đúng từng cặp; 4 redirect artifact hoạt động; homepage liệt kê đủ 5 slug mới, không còn slug cũ; toàn bộ `/chapters/...` href trong dist resolve tới live route hoặc redirect có chủ ý (0 dead link); quiz harness bundle nhúng đúng 5 trang.

## Astro

- `npm run build`: **PASS** — 35 trang (34 live + homepage) + 4 redirect artifacts (38 dist dirs); inspect dist trực tiếp, không tin headline.
- `npx astro check`: **0 errors / 0 warnings / 65 hints** (baseline trước batch 66; giảm 1 vì file ngủ đông Ch11_5-warning từng được nhìn qua glob scripts bị đếm — sau khi xoá 4 file Ch06_* scrub hints trở về đúng baseline 65 gồm scripts-ignored hints pre-existing). 0 hint mới từ bất kỳ file Stage-3 nào (verify bằng nhóm hint theo file: +2 hints tạm thời từ FINAL_ROOT/STARTER unused trong S2/S3 đã xoá trong cùng batch).

## Adversarial review

Agent độc lập tấn công 20 hướng (sau khi implementation tưởng như hoàn tất). Kết quả: **0 BLOCKER, 4 MAJOR, 3 MINOR** (1 trong 3 MINOR là note-only):

1. ~~MAJOR: S4 quiz correct-always-longest 100%~~ → sửa `1c9dd5f` (longest 30%).
2. ~~MAJOR: S5 quiz 90%~~ → sửa `1c9dd5f` (30%).
3. ~~MAJOR: S2 quiz 80%~~ → sửa `1c9dd5f` (20%).
4. ~~MAJOR: keys patterned (S2≡S4, S3 period-4)~~ → re-key 5 quiz (`1c9dd5f`).
5. ~~MINOR: 2 stale refs tới file vừa xoá~~ → sửa `1c9dd5f` (S5 #nguon, Ch08 #nguon).
6. ~~MINOR: header-comment numbering drift~~ → sửa `1c9dd5f` (5 comment lines).
7. MINOR note-only (không sửa, đúng quy tắc owner): `by activityViewModels()` (biến thể Fragment) nằm trong draft ngủ đông chưa từng accepted — không phải nội dung được chấp nhận nên không áp "không cắt vì dài"; nếu tương lai cần, nằm sẵn trong Git @ bd597f8 `Ch06_3NoiDayViewModelVaoUi.astro:324`.

Sau repair: re-run build/check/quiz-audit/dist-pairing — ALL PASS (không cần vòng adversarial thứ 2 vì mọi finding là quiz-surface/text-surface, được verify lại bằng chính metric mà reviewer dùng).

## Deviations

- astro check hints 65 ≠ baseline 66: −1 là hệ quả dọn dẹp hợp lệ — file `Ch06AdvancedJetpackCompose.astro` cũ vốn góp 1 hint (astro check nhìn thấy mọi file qua glob); sau khi xoá nó cùng các unused-const hints tạm thời của S2/S3, tổng rơi về 65 với 0 hint từ bất kỳ file Stage-3 nào. Không force về 66.
- S1/S5 không có SPLIT_MAP/redirect — đúng kế hoạch (bài NEW, no-fabricate), không phải deviation.
- Số câu quiz = 10 cho cả 5 (khung 8–12; ownership của S2/S3 không đủ 19 câu cũ chia để mỗi bài >10 không sao chép — viết mới theo trục mục tiêu).

## Findings

- **Blockers:** none.
- **Major:** none tại close (4 found & fixed: quiz rank cue ×3 + key pattern ×1 — một nguyên nhân gốc "correct option được viết đầy đủ hơn distractor" + re-key).
- **Minor (documented):** `by activityViewModels()` Fragment-variant loss (note-only, git-recoverable); astro-check hints 65 vs 66 (đã giải thích); S1/S5 dùng câu chữ draft-verbatim trừ 1 chỉnh S5 mục 16 (`messageSource` — đã duyệt trước trong chỉ định Wave G).

## Gate verdict

**GATE PASS** — toàn bộ PASS requirement của brief đáp ứng: S1–S5 live đúng thứ tự · Ch06 accounted-for không mất nội dung · S1 không gièm W1 · S2/S3/S4 model đúng · S4 không gièm S5 · S5 hiện đại hoá đúng (không 5-lớp-là-luật, không always-SSOT, không Ch07) · AP3 nhận đủ material · live 34 / state 5 · schema 9 / map 10 / redirect 4 · S1/S5 no-fabricate · ch10-1→R1 · chuỗi cũ còn chạy · stats pair đúng (kể cả sửa 1 bug pairing thật) · 5 quiz PASS (harness chung, 4 option, 100% giải thích, rank ≤40%, keys cân, không pattern) · voice 0 leak · build PASS · astro check 0/0/65 · adversarial 0 BLOCKER/0 MAJOR · working tree clean · **chưa push**.

Sẵn sàng cho owner review trước Stage 4 / Navigation.
