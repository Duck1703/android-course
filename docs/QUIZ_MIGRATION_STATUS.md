# QUIZ_MIGRATION_STATUS — tiến độ chuyển quiz sang harness chung (IMP-001)

**Harness:** `web/src/scripts/quiz.ts` · **Tham chiếu hành vi:** prototype `learning-experience-v1` @ `3ae75d1` (chỉ đối chiếu hành vi, không merge code) · **Trạng thái cập nhật:** 2026-09-09 (IMP-060 refresh — Long Phase 5 quiz sweep)

## Cách một quiz tham gia harness

Trong `<script>` của file `*Quiz.astro` (hoặc component cha nhúng nó), thay toàn bộ script chấm bài inline bằng đúng một dòng gọi init:

```astro
<script>
	import { initQuiz } from "../../scripts/quiz.ts";

	initQuiz();
</script>
```

Yêu cầu markup (giữ nguyên contract `quiz.css` đã chốt):

- `form#quiz-form` bọc các `fieldset[data-answer]`, mỗi fieldset có `legend`, các `<label><input type="radio" name="qN" value="x" /></label>` và `<p class="explain" hidden>`.
- `<p id="quiz-score" role="status" aria-live="polite" hidden></p>` trong form.
- Nút `<button type="button" id="quiz-retry" hidden>Làm lại</button>` — bây giờ là YÊU CẦU cho mọi quiz LIVE (không còn là tuỳ chọn như thời IMP-001).

## Hành vi harness sở hữu (mọi quiz đã chuyển đều được)

1. Nhãn **"Câu x/N"** chèn vào đầu mỗi `legend` (`span.q-num`, `aria-hidden`).
2. **Submit/chấm:** so `:checked` với `data-answer`, tô `fieldset.correct/.incorrect`, hiện `.explain`.
3. **Kết quả:** `Kết quả: x/N câu đúng.` vào `#quiz-score` (`role="status"` + `aria-live="polite"`), `scrollIntoView` vào khung nhìn.
4. **Retry ẩn → hiện → ẩn:** `#quiz-retry` ẩn trước submit đầu; hiện sau submit; khi bấm có `window.confirm`; xác nhận thì bỏ chọn radio, ẩn lại `.explain`, bỏ `.correct/.incorrect`, xoá + ẩn điểm, và **ẩn lại nút** cho tới lần nộp kế tiếp. Không reload trang.

Widget **sắp thứ tự** (order-list, `data-correct` + `select`) nằm NGOÀI `form#quiz-form` nên harness không chấm — quiz có widget này giữ một khối script chấm riêng chạy sau `initQuiz()` trong cùng `<script>` (tiền lệ: Ch03_4Quiz từ Stage 1, Ch07Quiz). Đó không phải "script inline chấm quiz" theo định nghĩa của audit — chỉ áp dụng cho vòng đời form `#quiz-form`.

## Nhánh dữ liệu live Astro (lưu ý kỹ thuật)

Các component quiz LIVE được Astro nhúng qua tham chiếu tĩnh trong `lessons.ts`, nên quiz đã chuyển gọi thẳng `initQuiz()` từ `web/src/scripts/quiz.ts`. Module harness cũng xuất side-effect tự-init (`import "../../scripts/quiz.ts";` không gán tên) để các quiz render ngoài nhánh này dùng khi muốn — hai cách dẫn đến cùng một module, `initQuiz` tự chặn gắn đôi qua `data-quiz-bound`.

## Phân loại từ TRẠNG THÁI HIỆN TẠI của repo (IMP-060 refresh @ 8c43d42)

Đếm lại từ đĩa + `lessons.ts` ngày 2026-09-09:

- **40 quiz LIVE** = đúng 40 import `*Quiz` trong `lessons.ts` = 40 route bài học. **không còn file quiz ORPHAN nào trên đĩa.**
- 4 quiz ORPHAN thời baseline (`Ch01Quiz`, `Ch02Quiz`, `Ch03Quiz`, `Ch04_1Quiz`) đã bị xoá ở batch Stage 1 (commit `b43d81f`) cùng 3 shell monolith Ch01/02/03 + các file Ch04_1/4_2/4_3 — không phải việc của phase này.
- Ch08Quiz / Ch09Quiz / Ch11Quiz (monolith retired) đã chết cùng batch Stage 5/6/7.
- Kết quả chạy `node scripts/quiz_audit.mjs` trên cả 40 file (baseline trước sweep): **31 PASS / 9 FAIL** — FAIL gồm 5 quiz C1–C5 (bias rank/vị trí), Ch07 (19 câu ngoài harness), R1/R2/R4 (bias rank).

### Bảng 40 quiz LIVE

Quy ước: **harness** = gọi `initQuiz` + đủ markup contract (score/retry). **PASS** = quiz_audit + semantic-key + distribution đều sạch. LessonId theo registry v5.

| # | Lesson | Quiz file | Số câu | Harness | Baseline audit | Ghi chú |
|---|---|---|---|---|---|---|
| F1 | kotlin-variables-null-collections-lambda | KotlinVariablesNullCollectionsLambdaQuiz.astro | 12 | YES | PASS | — |
| F2 | kotlin-data-class-delegation-sealed | KotlinDataClassDelegationSealedQuiz.astro | 12 | YES | PASS | — |
| A1 | ch01-1-android-va-kotlin | Ch01_1Quiz.astro | 9 | YES | PASS | — |
| A2 | ch01-2-app-component | Ch01_2Quiz.astro | 10 | YES | PASS | — |
| A3 | ch01-3-manifest-resources | Ch01_3Quiz.astro | 11 | YES | PASS | — |
| A4 | ch01-4-gradle-va-ban-do | Ch01_4Quiz.astro | 10 | YES | PASS | — |
| A5 | ch02-1-cai-dat-va-tao-project | Ch02_1Quiz.astro | 9 | YES | PASS | — |
| A6 | ch02-2-may-ao-may-that-doc-project | Ch02_2Quiz.astro | 10 | YES | PASS | — |
| A7 | ch02-doc-project-mau | Ch02DocProjectMauQuiz.astro | 11 | YES | PASS | — |
| A8 | ch02-3-chay-app-va-cap-nhat | Ch02_3Quiz.astro | 9 | YES | PASS | — |
| A9 | ch03-1-activity-va-giao-dien | Ch03_1Quiz.astro | 11 | YES | PASS | — |
| A10 | ch03-string-resource-va-lop-r | Ch03StringResourceVaLopRQuiz.astro | 9 | YES | PASS | — |
| A11 | ch03-doc-loi-bien-dich-va-debug | Ch03DocLoiBienDichVaDebugQuiz.astro | 10 | YES | PASS | — |
| A12 | ch03-3-manifest-intent-permission | Ch03_3Quiz.astro | 11 | YES | PASS | — |
| A13 | ch03-4-theme-va-doi-chieu | Ch03_4Quiz.astro | 10 | YES | PASS | có widget sắp thứ tự ngoài form (script chấm riêng cho widget — hợp lệ) |
| A14 | ch04-gradle-basics-a-look-behind-the-curtain | Ch04Quiz.astro | 10 | YES | PASS | — |
| C1 | ch05-composable-va-layout | Ch05ComposableVaLayoutQuiz.astro | 10 | YES | FAIL | rank 3 = 5/10 — sửa ở sweep |
| C2 | ch05-modifier-va-danh-sach | Ch05ModifierVaDanhSachQuiz.astro | 11 | YES | FAIL | pos b = 5/11 — sửa ở sweep |
| C3 | ch05-material-3-va-theming | Ch05Material3VaThemingQuiz.astro | 10 | YES | FAIL | pos b 5/10 + rank 3 7/10 — sửa ở sweep |
| C4 | ch05-preview-va-vong-doi | Ch05PreviewVaVongDoiQuiz.astro | 12 | YES | FAIL | rank 3 = 8/12 — sửa ở sweep |
| C5 | ch05-tiep-can-moi-nguoi-dung | Ch05TiepCanMoiNguoiDungQuiz.astro | 12 | YES | FAIL | rank 3 = 7/12 — sửa ở sweep |
| S1 | coroutines-20-phut-khong-so | Coroutines20PhutKhongSoQuiz.astro | 10 | YES | PASS | — |
| S2 | ch06-state-va-recomposition | Ch06StateVaRecompositionQuiz.astro | 10 | YES | PASS | — |
| S3 | ch06-state-hoisting-va-udf | Ch06StateHoistingVaUdfQuiz.astro | 10 | YES | PASS | — |
| S4 | ch06-viewmodel-va-ui-state | Ch06ViewModelVaUiStateQuiz.astro | 10 | YES | PASS | — |
| S5 | kien-truc-ui-data-repository | KienTrucUiDataRepositoryQuiz.astro | 10 | YES | PASS | — |
| N1 | navigation-destination-nav-host | NavigationDestinationNavHostQuiz.astro | 10 | YES | PASS | — |
| N2 | navigation-back-stack-type-safe | NavigationBackStackTypeSafeQuiz.astro | 10 | YES | PASS | — |
| W1 | ch08-coroutines-va-flow | Ch08CoroutinesVaFlowQuiz.astro | 10 | YES | PASS | — |
| W2 | ch08-retrofit-moshi-json | Ch08RetrofitMoshiJsonQuiz.astro | 10 | YES | PASS | — |
| W3 | ch08-trang-thai-mang-api-key | Ch08TrangThaiMangApiKeyQuiz.astro | 10 | YES | PASS | — |
| D1 | ch09-data-store-va-sharedpreferences | Ch09DataStoreVaSharedPreferencesQuiz.astro | 10 | YES | PASS | — |
| D2 | ch09-prefs-composition-local-va-wiring | Ch09PrefsCompositionLocalVaWiringQuiz.astro | 10 | YES | PASS | — |
| R1 | ch10-room-la-gi-va-sqlite | Ch10_1Quiz.astro | 8 | YES | FAIL | rank 4 = 5/8 — sửa ở sweep |
| R2 | ch10-2-entity-dao-database | Ch10_2Quiz.astro | 12 | YES | FAIL | rank 3 = 6/12 — sửa ở sweep |
| R3 | ch10-3-repository-viewmodel | Ch10_3Quiz.astro | 10 | YES | PASS | — |
| R4 | ch10-4-giao-dien-va-cam-bay | Ch10_4Quiz.astro | 8 | YES | FAIL | rank 4 = 6/8 — sửa ở sweep |
| X1 | ch11-files-saf-va-backup | Ch11FilesSafVaBackupQuiz.astro | 10 | YES | PASS | — |
| X2 | ch11-keystore-sqlcipher-va-ma-hoa | Ch11KeystoreSqlcipherVaMaHoaQuiz.astro | 12 | YES | PASS | — |
| O-legacy | ch07-advanced-architecture (optional, sống tạm đến Workstream F) | Ch07Quiz.astro | 19 | **NO (legacy)** | FAIL | 19 câu (ngoài 8–12) + 1 câu 5 option + script inline + rank 4 = 19/19 — chuyển harness + giảm câu ở sweep; chính lesson thì KHÔNG đụng (Workstream F REDUCE thành O1) |

Tổng: **40 LIVE / 0 ORPHAN** · harness 39/40 · tổng câu hỏi 418 (trước sweep).

### File ngủ đông được GIỮ CHỦ ĐỊCH (không phải ORPHAN — quyết định Stage 5–7)

Các draft split ngủ đông Ch07_1..4, Ch08_1..4, Ch09_1..4, Ch11_1..5 và `_TEMPLATE.astro` vẫn ở trên đĩa; resolver `lessonStats` đã tự loại khỏi bucket (registry-driven, fail-loud) và không quiz nào của chúng tồn tại. Việc xoá thuộc một chính sách cleanup riêng, KHÔNG thuộc scope sweep này.

## Số liệu tổng (đóng bạng IMP-060)

40 LIVE / 0 ORPHAN trên đĩa · 39/40 harness (Ch07 còn legacy) · 418 câu · audit 31 PASS / 9 FAIL trước sweep. Mục tiêu sweep: 40/40 harness, 40/40 PASS, 0 ORPHAN, không đổi schema/SPLIT_MAP/redirect/route.
