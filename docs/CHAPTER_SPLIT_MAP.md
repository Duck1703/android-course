# CHAPTER_SPLIT_MAP.md — bản đồ tách chương (Task 48)

> **⚠️ SUPERSEDED (2026-09-11):** hợp đồng đặt tên/slug hiện hành là `docs/TARGET_REGISTRY_v5.md`
> (48 unit, slug công khai đã khoá, SPLIT_MAP thật nằm trong `web/src/lib/progress.ts`).
> Bảng dưới đây là **bản kế hoạch tách giai đoạn Task 48** — chỉ dùng để truy ngược lịch sử,
> KHÔNG dùng làm chuẩn khi thêm/sửa bài học.

Bản đồ này chốt **trước khi viết** nội dung, vì tham chiếu chéo giữa các chương
(`Chương 8, mục 4` → `Chương 8.1, mục 4`) chỉ viết đúng được khi đã biết mọi số
chương nhỏ. Nguồn sự thật cho tiến độ vẫn là `docs/PROJECT_PLAN.md`; file này chỉ
là hợp đồng đặt tên + phân bổ mục.

Chuẩn mẫu (lịch sử): Chương 10 (Task 47, 2026-08-30) — file Ch10_* era đó đã kế nhiệm thành các bài R1–R4 hiện hành (`Ch10_1RoomLaGi.astro`…).

## Quy ước (áp cho mọi chương nhỏ)

| Thứ | Quy ước |
|---|---|
| Slug | `ch<NN>-<sub>-<mo-ta-khong-dau>` — ví dụ `ch03-2-string-resource-va-debug` |
| File lesson | `Ch<NN>_<sub><TenPascal>.astro` — khớp regex `^Ch(\d{2})(?:_(\d+))?(.*)\.astro$` của `lessonStats.ts` |
| File quiz | `Ch<NN>_<sub>Quiz.astro` — hậu tố phải **đúng** chữ `Quiz`, nếu không sẽ bị tính là lesson |
| Số mục | **chạy liên tục** trong cả chương lớn, không reset về 1 ở mỗi chương nhỏ |
| Tham chiếu chéo | `Chương 10.2, mục 9` — luôn "Chương", không bao giờ "Bài" |
| Cạm bẫy | mỗi file có `<h2 id="cam-bay">Cạm bẫy &amp; tài liệu lỗi thời</h2>`, **không** đánh số, đặt sau mục cuối |
| Nguồn | mỗi file có **đúng một** `<h2 id="nguon">Nguồn tham khảo</h2>` ở cuối |
| `chapters.ts` | mỗi chương nhỏ là 1 phần tử, cùng `number`, khác `subNumber`, cùng `parentTitle` + `aafFolder` |
| `progress.ts` | mỗi lần tách phải thêm `SPLIT_MAP[slug cũ]` và tăng `SCHEMA_VERSION` |

Cột **mục** dưới đây ghi `id` của các `<h2>` trong file gốc. Cột **từ** là số từ
văn xuôi đo được **trước** khi viết lại (viết lại luôn làm tăng, không giảm — xem
nguyên tắc #2 Phase 7).

## Chương 1 — Welcome to Android & Kotlin (10.029 từ → 4 chương nhỏ) ✅ ĐÃ TÁCH

Quiz mỗi chương nhỏ: 1.1 = 9 câu · 1.2 = 10 · 1.3 = 11 · 1.4 = 10.

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 1.1 | `ch01-1-android-va-kotlin` | `Ch01_1AndroidVaKotlin` | Android là gì, chọn Kotlin, và security sandbox | intro, `android-khong-lo`, `chon-kotlin`, `security-sandbox` | 2.748 |
| 1.2 | `ch01-2-app-component` | `Ch01_2AppComponent` | Bốn app component và cách chúng gọi nhau | `bon-component`, `entry-point-intent` | 2.165 |
| 1.3 | `ch01-3-manifest-resources` | `Ch01_3ManifestResources` | App Manifest và App Resources | `manifest`, `resources` | 2.375 |
| 1.4 | `ch01-4-gradle-va-ban-do` | `Ch01_4GradleVaBanDo` | Gradle, bốn con số, và bản đồ khoá học | `gradle`, `bon-so`, `whats-in-book`, `key-points`, `di-tiep` | 2.741 |

## Chương 2 — Getting Started With Android Studio (7.062 từ → 3 chương nhỏ) ✅ ĐÃ TÁCH

Quiz mỗi chương nhỏ: 2.1 = 9 câu · 2.2 = 12 · 2.3 = 9.

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 2.1 | `ch02-1-cai-dat-va-tao-project` | `Ch02_1CaiDatVaTaoProject` | Cài Android Studio và tạo project đầu tiên | intro, `android-studio-la-gi`, `cau-hinh`, `tao-project`, `giao-dien-studio` | 2.353 |
| 2.2 | `ch02-2-may-ao-may-that-doc-project` | `Ch02_2MayAoMayThatDocProject` | Máy ảo, máy thật, và đọc toàn bộ project vừa sinh ra | `may-ao`, `may-that`, `doc-project` | 2.908 |
| 2.3 | `ch02-3-chay-app-va-cap-nhat` | `Ch02_3ChayAppVaCapNhat` | Chạy app, cập nhật công cụ, và những gì đã lỗi thời | `chay-app`, `cap-nhat`, `version`, `key-points` | 1.801 |

## Chương 3 — Android Fundamentals (12.703 từ → 4 chương nhỏ) ✅ ĐÃ TÁCH (2026-08-31)

Quiz mỗi chương nhỏ: 3.1 = 11 câu · 3.2 = 15 · 3.3 = 11 · 3.4 = 10. Sau khi tách,
prose lesson tăng lên ≈ 39k từ (monolith cũ 13.7k). Factcheck số dòng/tên file:
3.2 và 3.3 do workflow verify + sửa; 3.4 tự đối chiếu tay (0 lỗi); **3.1 chưa được
reader độc lập factcheck** (cả 2 agent phân cho nó đều chết).

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 3.1 | `ch03-1-activity-va-giao-dien` | `Ch03_1ActivityVaGiaoDien` | Activity, onCreate() và giao diện đầu tiên | intro, `ban-do`, `activity-la-gi`, `doc-starter`, `lifecycle`, `thay-code`, `giai-thich-ui`, `qua-khu` | 3.759 |
| 3.2 | `ch03-2-string-resource-va-debug` | `Ch03_2StringResourceVaDebug` | String resource, lớp R, lỗi biên dịch và debug | `tai-sao-strings`, `strings-xml`, `lop-r`, `loi-bien-dich`, `hai-cach-lay-chuoi`, `debug` | 2.794 |
| 3.3 | `ch03-3-manifest-intent-permission` | `Ch03_3ManifestIntentPermission` | Manifest, Intent, Permission và Service | `resources`, `manifest`, `activity-tag`, `intent`, `permission`, `service` | 2.910 |
| 3.4 | `ch03-4-theme-va-doi-chieu` | `Ch03_4ThemeVaDoiChieu` | Theme, chuỗi việc khi bấm Send, và đối chiếu code thật | `theme`, `hai-he-theme`, `theme-mo-cua`, `bam-send`, `tong-hop-lech`, `phien-ban`, `key-points`, `tiep-theo` | 3.240 |

## Chương 4 — Gradle Basics (9.727 từ → 3 chương nhỏ)

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 4.1 | `ch04-1-gradle-va-cac-file-cau-hinh` | `Ch04_1GradleVaCacFileCauHinh` | Gradle làm gì, và bản đồ các file cấu hình | intro, `gradle-la-gi`, `ban-do-file`, `hai-file-sach-bo-qua`, `top-level`, `settings`, `module-plugins` | 3.119 |
| 4.2 | `ch04-2-android-block-va-dependencies` | `Ch04_2AndroidBlockVaDependencies` | Khối android, build type và dependencies | `android-block`, `build-types`, `dependencies` | 2.949 |
| 4.3 | `ch04-3-version-catalog-signing-secrets` | `Ch04_3VersionCatalogSigningSecrets` | Version Catalog, ký app và giữ secret an toàn | `version-catalog`, `signing`, `secrets`, `starter-vs-final`, `ghi-chu-phien-ban`, `key-points` | 3.659 |

## Chương 5 — Jetpack Compose (8.362 từ → 3 chương nhỏ)

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 5.1 | `ch05-1-composable-function` | `Ch05_1ComposableFunction` | Composable function — khối xây dựng của Compose | intro, `tai-sao-compose`, `composable`, `tach-composable`, `ux-placeholder` | 2.606 |
| 5.2 | `ch05-2-layout-modifier-list` | `Ch05_2LayoutModifierList` | Layout Group, Modifier, Preview và danh sách lazy | `layout-group`, `appbar`, `preview`, `modifier`, `lazycolumn` | 2.717 |
| 5.3 | `ch05-3-dung-ui-tin-nhan` | `Ch05_3DungUiTinNhan` | Dựng UI tin nhắn, theme và font | `message-ui`, `theme-font`, `userinput`, `version`, `key-points` | 3.039 |

## Chương 6 — Advanced Jetpack Compose (10.676 từ → 4 chương nhỏ)

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 6.1 | `ch06-1-state-va-recomposition` | `Ch06_1StateVaRecomposition` | State, recomposition, remember và state hoisting | intro, `diem-khoi-dau`, `state-la-gi`, `recomposition`, `stateful-remember`, `state-hoisting`, `unidirectional-data-flow` | 3.097 |
| 6.2 | `ch06-2-viewmodel-va-mvi` | `Ch06_2ViewModelVaMvi` | ViewModel, MVI và StateFlow | `viewmodel-vi-sao`, `tao-viewmodel`, `chatroom-thieu`, `ham-gui-tin`, `mvi-flow` | 2.932 |
| 6.3 | `ch06-3-noi-day-viewmodel-vao-ui` | `Ch06_3NoiDayViewModelVaoUi` | Nối ViewModel vào giao diện | `noi-day`, `gradle-dependency`, `sua-authorid` | 1.965 |
| 6.4 | `ch06-4-jump-to-bottom-va-doc-lai` | `Ch06_4JumpToBottomVaDocLai` | Jump to bottom, và đọc lại project bằng đầu phê phán | `jump-to-bottom`, `starter-vs-final`, `code-chet`, `ghi-chu-phien-ban`, `key-points`, `tu-kiem-tra` | 2.682 |

## Chương 7 — Advanced Architecture (12.839 từ → 4 chương nhỏ)

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 7.1 | `ch07-1-ditto-sdk-va-khoi-tao` | `Ch07_1DittoSdkVaKhoiTao` | Ditto SDK: cài, xin quyền, giấu App ID, khởi tạo | intro, `vi-sao`, `ditto-la-gi`, `cai-sdk`, `quyen`, `keys-properties`, `ditto-handler`, `setup-ditto`, `thu-tu-goi` | 3.646 |
| 7.2 | `ch07-2-repository-pattern` | `Ch07_2RepositoryPattern` | Repository pattern: interface, singleton, state holder | `repository-pattern`, `repository-interface`, `singleton`, `state-holders`, `live-query`, `init-chain` | 2.734 |
| 7.3 | `ch07-3-ghi-du-lieu-va-viewmodel` | `Ch07_3GhiDuLieuVaViewModel` | Đường ghi dữ liệu, model mapping và ViewModel | `ghi-du-lieu`, `doc-mapping`, `constants`, `viewmodel`, `asreversed` | 2.873 |
| 7.4 | `ch07-4-doc-lai-kien-truc` | `Ch07_4DocLaiKienTruc` | Toàn bộ đường dây, code chết và những chỗ đã lỗi thời | `xoa-fakedata`, `duong-day`, `date-extensions`, `dead-code`, `bang-khac-biet`, `phien-ban`, `sai-lam`, `key-points`, `thu-thach`, `tiep-theo` | 3.586 |

## Chương 8 — Networking (12.795 từ → 4 chương nhỏ)

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 8.1 | `ch08-1-coroutine-va-flow` | `Ch08_1CoroutineVaFlow` | Bất đồng bộ: thread, coroutine, suspend và Flow | intro, `muc-tieu`, `getting-started`, `bat-dong-bo`, `coroutine`, `flows` | 3.575 |
| 8.2 | `ch08-2-retrofit-va-moshi` | `Ch08_2RetrofitVaMoshi` | Retrofit, Moshi và khai báo API bằng interface | `network-requests`, `response-parsing`, `signup`, `response-model`, `api-key`, `retrofit-instance` | 3.018 |
| 8.3 | `ch08-3-loi-goi-mang-dau-tien` | `Ch08_3LoiGoiMangDauTien` | Lời gọi mạng đầu tiên và phân trang | `viewmodel`, `query-recipes`, `ai-goi`, `run-app`, `ben-duoi`, `paging` | 2.387 |
| 8.4 | `ch08-4-codegen-va-doc-lai` | `Ch08_4CodegenVaDocLai` | Moshi codegen, màn hình chi tiết, và đọc lại project | `codegen`, `details-screen`, `tong-hop-lech`, `phien-ban`, `key-points`, `di-tiep` | 3.815 |

## Chương 9 — Data Store (9.372 từ → 4 chương nhỏ)

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 9.1 | `ch09-1-vi-sao-datastore` | `Ch09_1ViSaoDataStore` | Ba cách lưu dữ liệu, SharedPreferences và DataStore | intro, `luu-du-lieu`, `vi-sao-du-lieu-nho`, `sharedpreferences`, `datastore-library` | 2.934 |
| 9.2 | `ch09-2-viet-class-prefs` | `Ch09_2VietClassPrefs` | Thêm thư viện và viết class Prefs | `them-thu-vien`, `prefs-class`, `delegate-vi-tri`, `application-instance` | 2.141 |
| 9.3 | `ch09-3-phat-prefs-xuong-app` | `Ch09_3PhatPrefsXuongApp` | CompositionLocal, viewModelFactory và lưu từ khoá đã tìm | `compositionlocal`, `viewmodel-factory`, `save-previous-searches`, `bai-tap-sach` | 2.093 |
| 9.4 | `ch09-4-bug-dau-phay-va-luu-tab` | `Ch09_4BugDauPhayVaLuuTab` | Cái bẫy dấu phẩy, đọc lại lúc khởi động, và lưu tab | `bug-dau-phay`, `doc-lai-init`, `luu-tab`, `diem-lech-tong-hop`, `key-points`, `di-tiep` | 2.204 |

## Chương 11 — Advanced Storage (11.565 từ → 5 chương nhỏ)

| # | Slug | File | Tiêu đề | Mục | Từ |
|---|---|---|---|---|---|
| 11.1 | `ch11-1-cac-cho-luu-file` | `Ch11_1CacChoLuuFile` | Android có bao nhiêu chỗ để lưu file | intro, `vi-sao`, `ban-do-luu-tru`, `filesdir`, `device-explorer`, `cache-files`, `external` | 2.471 |
| 11.2 | `ch11-2-saf-va-keystore` | `Ch11_2SafVaKeystore` | Storage Access Framework và Android Keystore | `saf`, `database-explorer`, `keystore` | 2.055 |
| 11.3 | `ch11-3-secureprefs-va-sqlcipher` | `Ch11_3SecurePrefsVaSqlCipher` | SecurePrefs và mã hoá Room bằng SQLCipher | `them-library`, `secureprefs`, `doi-kieu`, `sqlcipher` | 2.594 |
| 11.4 | `ch11-4-noi-day-backup-phien-ban` | `Ch11_4NoiDayBackupPhienBan` | Nối dây, cái bẫy backup, và những gì đã lỗi thời | `wiring`, `backup`, `ghi-chu-phien-ban` | 2.141 |
| 11.5 | `ch11-5-nhin-lai-ca-khoa-hoc` | `Ch11_5NhinLaiCaKhoaHoc` | Bảng tổng hợp, lỗi thường gặp, và nhìn lại cả khoá học | `bang-lech`, `loi-thuong-gap`, `key-points`, `thu-thach`, `ket` | 2.304 |

## Tổng cộng

11 chương lớn → **42 trang chương** (mục tiêu cuối), tức 42 file lesson + 42 file quiz.

**Đã tách (2026-08-31):** Chương 1 (4) · Chương 2 (3) · Chương 3 (4) · Chương 10 (4,
Task 47) = **15 trang chương của phần đã tách**. Cộng 7 chương còn nguyên khối
(Ch04–Ch09, Ch11) = **22 route thật hiện có** (khớp `dist/chapters/` sau build).
Còn lại trong Task 48: Ch04, Ch05, Ch06, Ch07, Ch08, Ch09, Ch11.

`progress.ts`: `SPLIT_MAP` hiện có 4 dòng (ch01/ch02/ch03/ch10 → các slug nhỏ),
`SCHEMA_VERSION` hiện = **4**. Mỗi lần tách thêm một chương lớn: thêm 1 dòng
`SPLIT_MAP` + tăng `SCHEMA_VERSION` thêm 1.


