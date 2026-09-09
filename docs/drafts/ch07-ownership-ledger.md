# Ch07 OWNERSHIP LEDGER (Workstream F / IMP-050)

Mục đích: before retiring `ch07-advanced-architecture` (monolith, 2454 dòng) every section/block
gets exactly one destination. No silent valuable content loss. Split rule (brief §8):
**O1 = WHY / mental model / trade-offs / kiến trúc; AP2 = HOW / Ditto API depth.**
Blocks explaining an idea useful beyond Ditto → O1. Blocks requiring exact Ditto SDK types,
methods, subscriptions, sync API, SDK mechanics → AP2.

Nguồn đối chiếu: `web/src/components/lessons/Ch07AdvancedArchitecture.astro` @ `690e268`
(2454 dòng, 30 khối `<h2>/<h3>`), `Ch07Quiz.astro` (12 câu MCQ + 1 widget sắp thứ tự + 4 bài tập).

| # | Khối Ch07 | Đích | Ghi chú / quyết định ranh giới |
|---|---|---|---|
| 1 | `#vi-sao` — hai bài học chồng nhau (kiến trúc vs SDK cụ thể) | **O1** (mở đầu) | Cấu trúc "tách hai bài học" là chính kết cấu của O1; viết lại giọng khoá học. Cảnh báo "project không build được ngay" (keys.properties) → thu gọn 1 câu, trỏ AP2. |
| 2 | `#ditto-la-gi` — client–server vs P2P local-first; mesh; eventual consistency; cloud tuỳ chọn; use-cases (kho, phi hành đoàn, POS) | **O1** `#mo-hinh-local-first` | Concept thuần — lõi case study. |
| 3 | `#dang-ky-ditto` — portal, App ID / Playground Token, bảng vai trò | **AP2** | SDK-specific (portal.ditto.live, identity). Cảnh báo "playground = không phân quyền" cũng sang AP2 (vẫn đúng tinh thần reference). |
| 4 | `#cai-sdk` — version catalog toml + `implementation(libs.ditto)`; giải thích toạ độ Maven/alias | **AP2** | HOW. Version catalog tổng quát đã dạy ở A14 → AP2 chỉ giữ phần Ditto-specific. |
| 5 | `#quyen` — DittoSyncPermissions, manifest merger, không có `onRequestPermissionsResult`/`refreshPermissions` | **AP2** | HOW (helper API của SDK). Concept "thư viện tự khai permission qua manifest merger" giữ 1 câu trong O1 như ví dụ "thư viện tự lo phần nền tảng". |
| 6 | `#keys-properties` — nạp properties → buildConfigField (3 bước, BuildConfig cả debug/release, `buildConfig = true` từ AGP 8) | **REMOVE-with-reason** (đã dạy) + **AP2** (1 mục ngắn) | Khuôn đã dạy ở **W3** (API key) và được keep-full ở **AP1** (signing). Ch07 chỉ tái dùng khuôn. AP2 giữ mục ngắn "biến trong project này" + cross-ref W3/AP1. Không mất nội dung (AP1 giữ bản đầy đủ). |
| 7 | `#ditto-handler` — `companion object` + `lateinit var` toàn cục; cái giá lateinit; DI tốt hơn | **O1** `#doc-code-cu-co-phe-phan` (concept: biến toàn cục/DI) | Kỹ thuật Kotlin ở mức "nhận diện"; bảng 3 thành phần (companion/lateinit/không-`?`) → AP2. |
| 8 | `#setup-ditto` — DefaultAndroidDittoDependencies, identity OnlinePlayground, startSync (giải thích từng dòng) | **AP2** | HOW thuần. Ý "startSync là dòng bật engine; trước đó chỉ là DB cục bộ" giữ bản concept trong O1 `#repository-va-sync-engine`. |
| 9 | `#thu-tu-goi` — onCreate: composition chạy trễ, `by viewModels()` lazy, cold `combine` → vì sao không crash; "đúng do may" | **O1** `#doc-code-cu-co-phe-phan` (thu gọn) | Concept (Compose init-order + cold flow) có giá trị ngoài Ditto; giữ ở mức khái niệm, bỏ số dòng. API-chi tiết bỏ. |
| 10 | `#repository-pattern` — 5 trách nhiệm + mental model "quầy lễ tân" | **REMOVE-with-reason** (S5 đã dạy) + **O1** cross-ref | S5 mục 5–13 dạy repository doctrine. O1 KHÔNG dạy lại từ đầu (brief §6); chỉ trỏ S5 và thêm phần *mới*: repository trước một **sync engine**. |
| 11 | `#repository-interface` — Flow vs suspend contract; tham số mặc định | **REMOVE-with-reason** (S5 mục 15–16 + W1) | Quy ước "đọc-liên-tục → Flow; ghi/đọc-một-lần → suspend" đã dạy ở S5. Không lặp. |
| 12 | `#repository-interface` (đoạn 3) — hợp đồng *rò rỉ* kiểu Ditto (`DittoAttachment` trong interface); cách sửa bằng type riêng của app | **O1** `#doc-code-cu-co-phe-phan` | Điểm phê phán kiến trúc hay: biên giới tầng dữ liệu phải dịch, không chuyền tay. Thuộc đúng job O1. |
| 13 | `#singleton` — double-checked locking, `@Volatile`, `also` vs `let`, `object` của Kotlin | **O1** (1 đoạn ngắn: vì sao "một instance duy nhất") | Lý do kiến trúc (một nguồn sự thật) là O1; cơ chế Kotlin chi tiết (DCL/@Volatile) **REMOVE-with-reason**: ngoài learning-job O1, không phải Ditto API (không có nhà khác). Ghi rõ ở đây để không bị coi là mất mát âm thầm. |
| 14 | `#state-holders` — MutableStateFlow trong/Flow ngoài; `by lazy`; 3 field phải giữ tham chiếu | **REMOVE-with-reason** (S5 mục 16) + **O1** (ý "phải giữ tham chiếu subscription") | Pattern "trong Mutable/ngoài read-only" đã dạy S5. Cái còn giá trị với O1: subscription/live query là *tài nguyên phải giữ* — sang O1 (concept) + AP2 (chữ ký API). |
| 15 | Subscription vs live query (đường ống vs cái chuông) | **O1** `#repository-va-sync-engine` (concept) + **AP2** (API) | Đây là mối quan hệ **local source / remote source / synchronization** mà brief §6 yêu cầu O1 giữ. |
| 16 | `#live-query` — `collection().findAll().subscribe()/observeLocal()` từng dòng; `findAll()` là mô-tả-truy-vấn | **AP2** | HOW. |
| 17 | `#init-chain` — init → initDatabase → postInitActions; KDoc sai; `GlobalScope` critique; race được cứu nhờ StateFlow | **O1** `#doc-code-cu-co-phe-phan` (thu gọn: GlobalScope + race concept) | Critical reading đúng job O1. Chi tiết số dòng/`this::postInitActions` bỏ. |
| 18 | Getter có tác dụng phụ (`getAllMessagesForRoom` đăng ký query mỗi lần gọi; nhiều phòng lẫn dữ liệu) | **O1** `#doc-code-cu-co-phe-phan` | Bài học "đọc code có phê phán" đúng brief §6 ("reading the old project critically"). |
| 19 | `#ghi-du-lieu` — UTC/ISO-8601 sort-key; map-of-doc; không ghi `_id`; `upsert` = update+insert **trả về ngay (local-first)** | **O1** (ý "ghi trả về ngay, không chờ mesh") + **AP2** (chi tiết map/_id/UTC) | Ý kiến trúc local-first là O1; chi tiết chuỗi/khoá là AP2. |
| 20 | `#doc-mapping` — secondary constructor `Message(document)`, `.stringValue`, fullName default trap | **AP2** | HOW (SDK + Kotlin chi tiết). |
| 21 | `#constants` — schemaless → Constants.kt chuyển lỗi runtime thành lỗi compile | **O1** `#mo-hinh-local-first` (so sánh schemaless vs schema Room) | Trade-off kiến trúc (document store không schema vs Room @Entity) — đúng brief "architecture trade-offs". Mẹo "đổi chuỗi thành symbol" đã dạy ngầm ở D1 (stringPreferencesKey) — O1 nhắc 1 câu. |
| 22 | `#viewmodel` — starter (giữ list trong RAM) vs final (ViewModel lắp flow); `combine` = JOIN reactive; init shadowing bug | **REMOVE-with-reason** (S4 + W1) + **O1** 1 câu cross-ref | ViewModel/StateFlow/combine đã dạy S4/W1. Shadowing bug là chi tiết Kotlin của project cũ → AP2 mục "đọc code cũ" (không mất: ghi vào AP2). |
| 23 | `#asreversed` — reverseLayout + asReversed view vs copy | **REMOVE-with-reason** (C2) | LazyColumn/reverseLayout là Compose UI — ngoài job O1/AP2. |
| 24 | `#xoa-fakedata` — Safe Delete | **REMOVE-with-reason** | Kỹ năng IDE tổng quát, không thuộc O1/AP2. |
| 25 | `#duong-day` — chuỗi ghi/đọc end-to-end; "không có nút refresh" (reactive) | **O1** `#duong-day` (concept, rút gọn) | Đúng brief: tổng hợp kiến trúc. Trỏ S4/W1/S5 cho từng mắt xích. |
| 26 | `#date-extensions` — overload resolution 6 nhóm, String.toInstant tự gọi mình, kotlinx-datetime 0.4→0.8 | **AP2** (mục "đọc code cũ: extension tự gọi chính nó") | Giữ vì là giá trị phê phán thật; nó là *Kotlin/library* depth chứ không phải Ditto, nhưng nhà duy nhất chứa được là AP2 (O1 không dạy Kotlin sâu). Ghi quyết định ranh giới: đây là borderline — chọn AP2 để O1 thuần kiến trúc. |
| 27 | `#dead-code` — addSubscriptionForRoom / addPrivateRoomSubscriptions / messagesDocs / authorImage | **O1** `#doc-code-cu-co-phe-phan` (1 đoạn: vết của app lớn hơn) + AP2 liệt kê | Concept "project sách = bản cắt của app lớn, để lại vết" đúng "đọc phê phán". |
| 28 | `#bang-khac-biet` — bảng 15 hàng "sách nói vs code thật" | **AP3** (mục `## Ch07`) | Đúng chính sách AP3: bảng drift/lệch tổng → phụ lục; core không biến thành trang đính chính. Chuyển nguyên dữ liệu, chuẩn hoá giọng trung tính + cột "nên theo cái nào". |
| 29 | `#phien-ban` — toạ độ đổi tên v4→v5; bảng DittoConfig/auth; DQL vs query builder + 3 cái bẫy; AGP/Kotlin/kotlinx-datetime drift | **AP2** (trọng tâm) | Đây là phần "Ditto API depth" lớn nhất. Framing HISTORICAL (4.5.0 trong project mẫu) / CURRENT (5.x) theo brief §20. |
| 30 | `#sai-lam` — bảng 12 triệu chứng/nguyên nhân | **AP2** | Troubleshooting SDK-specific. Hàng concept (subscription GC, singleton 2 instance) đã phủ ở O1. |
| 31 | `#key-points` — 13 bullet | Chia: bullet kiến trúc → **O1** `#tom-tat`; bullet SDK/Kotlin → **AP2** | 1:1 theo ranh giới O1/AP2. |
| 32 | `#thu-thach` — 3 thử thách (attachment, nhiều phòng, lưu userId) | **O1** (đổi khung: "mở rộng case study nếu bạn chạy được project") | Thử thách gắn project thật; giữ ở O1 dạng mời-gọi với cảnh báo API-depth trỏ AP2. `userId` qua DataStore → cross-ref D1. |
| 33 | `#tiep-theo` — journey callout sang Ch08 | **REMOVE-with-reason** | Điều hướng monolith; O1 nằm track Mở rộng, không có "chương tiếp theo" nối mạch core. |

## Ch07Quiz (12 câu, harness) — kiểm kê trước khi retire

O1 quiz **không tái sử dụng mù** (brief §7). Kiểm từng câu:

| Câu Ch07 cũ | Nội dung | O1 quiz? |
|---|---|---|
| q1 | Repository giải quyết vấn đề gì | KHÔNG (S5 phạm trù; O1 không dạy lại repository từ đầu) |
| q2 | @Volatile/synchronized DCL | KHÔNG (ledger #13 — REMOVE) |
| q3 | local-first nghĩa là gì | **GIỮ ý → viết lại** (O1 q1/q2) |
| q4 | subscribe + observeLocal cần cả hai | **GIỮ ý → viết lại** concept (O1) |
| q5 | subscription thành biến cục bộ → GC im lặng | **GIỮ ý → viết lại** (O1) |
| q6 | Flow vs suspend trong interface | KHÔNG (S5) |
| q7 | asReversed/reverseLayout | KHÔNG (C2) |
| q8 | private MutableStateFlow | KHÔNG (S5) |
| q9 | getter side-effect (code đọc) | **GIỮ ý → viết lại** (O1 — đọc phê phán) |
| q10 | shadowing bug | KHÔNG (Kotlin depth) |
| q11 | Constants.kt / schemaless | **GIỮ ý → viết lại** (O1 — schemaless trade-off) |
| q12 | DQL chuyển đổi | KHÔNG (AP2 depth — Ditto API) |

→ O1 quiz 10 câu mới viết theo nội dung O1; câu Ditto-API-depth (DQL, lateinit, toạ độ) **không** xuất hiện trong O1 (thuộc AP2 nếu cần — AP2 là reference, không quiz).

## Phân loại A/B/C/D của O1 (nội bộ, không render)

A đã dạy: S5 (tầng UI/data/repository, nguồn đáng tin, Flow-vs-suspend, read-only bề mặt), S4 (StateFlow, collectAsStateWithLifecycle), S1/W1 (coroutine, cold/hot flow, combine), C2 (LazyColumn), W3 (trạng thái mạng + keys.properties), R1 (SQLite model), D1 (DataStore), A14 (version catalog).
B dạy ở đây: mô hình local-first/P2P, sync engine vs repository, eventual consistency, schemaless vs schema, đọc code cũ có phê phán, khi nào kiến trúc này cần.
C JIT: không có (O1 không dùng API mới).
D defer: chi tiết API Ditto → AP2; bảng drift Ch07 → AP3.
