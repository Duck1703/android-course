# LEARNING MAP — Chapter → Concept → Code → Exercise/Quiz

> Tài liệu tĩnh, tạo ở Task 4 (2026-08-26). Đây là bảng mapping chi tiết dùng làm khung sườn khi viết lesson cho website (Phase 2). Nội dung "Concept" tóm tắt/diễn giải lại theo `content/book/`, không copy nguyên văn. Cột "File Android" chỉ **trỏ đường dẫn** trong `aaf-materials/` để tham chiếu — xem lưu ý bản quyền ở cuối file trước khi dán code thật vào bất kỳ lesson nào.
>
> Nguồn: `content/book/ch*.md` (mục "Key Points" mỗi chapter) + `docs/SOURCE_MAP.md` (bảng kiến trúc) + đọc trực tiếp vài file `.kt` tiêu biểu để xác nhận.

## Chapter 1 — Welcome to Android & Kotlin

- **Concept:** Kotlin vs Java trên Android; các loại app component (Activity, Service, Content Provider, Broadcast Receiver); file Manifest khai báo component/permission/hardware; resource (ảnh, âm thanh, màu...); Gradle dùng để build app.
- **File Android:** *Không có project thật* — `aaf-materials/01-welcome-to-android-and-kotlin/projects/{starter,final,challenge}` chỉ chứa file `.keep` rỗng. Chapter này là phần tổng quan; code block duy nhất trong EPUB là trích đoạn XML Manifest tại `content/book/ch01-welcome-to-android-kotlin.md` dòng 55–76, không phải code Kotlin.
- **Composable/Class minh hoạ:** Không có; ví dụ duy nhất khai báo `MainActivity` trong XML Manifest.
- **Gợi ý Exercise/Quiz:** Quiz trắc nghiệm khái niệm (Activity là gì / Manifest dùng để làm gì / Gradle dùng để làm gì). Bài tập đọc Manifest: tìm `<application>`, `.MainActivity`, `MAIN` và `LAUNCHER`, không tạo ví dụ Kotlin ngoài nội dung chapter.

## Chapter 2 — Getting Started With Android Studio

- **Concept:** Cài đặt Android Studio; tạo project mới; Android Virtual Device (AVD) và chạy app trên máy ảo/thiết bị thật; sửa giao diện "Hello World"; cập nhật Android Studio/SDK.
- **File Android:** `aaf-materials/02-getting-started-with-android-studio/projects/final/app/src/main/java/com/kodeco/chat/MainActivity.kt` (template mặc định của Android Studio khi tạo project Compose mới).
- **Composable/Class minh hoạ:** `MainActivity : ComponentActivity()`, `setContent { }`.
- **Gợi ý Exercise/Quiz:** Bài tập thực hành cài đặt (không kiểm tra được qua web) → thay bằng quiz: "Bước nào tạo AVD?", "File nào là điểm khởi đầu của app?". Có thể thêm mini quiz đố vui "tìm lỗi" trên 1 đoạn `MainActivity.kt` giả lập.

## Chapter 3 — Android Fundamentals

- **Concept:** Activity là gì; vòng đời qua `onCreate()`; vai trò của Manifest và Intent; tách chuỗi văn bản ra `strings.xml` (resource); debug cơ bản (breakpoint, Logcat).
- **File Android:** `aaf-materials/03-android-fundamentals/projects/final/app/src/main/java/com/kodeco/chat/MainActivity.kt` — app chat đơn giản dùng `remember { mutableStateOf(...) }` + `stringResource`/`context.getString()`.
- **Composable/Class minh hoạ:** `MainActivity.onCreate()`, `Column`, `OutlinedTextField`, `Button`, `Text` (Compose UI cơ bản, chưa có ViewModel).
- **Gợi ý Exercise/Quiz:** Quiz về vòng đời Activity (`onCreate` chạy khi nào). Exercise nhỏ: đổi 1 chuỗi text cứng trong code thành resource `strings.xml` (thao tác refactor đơn giản, dễ chấm bằng mắt).

## Chapter 4 — Gradle Basics: A Look Behind the Curtain

- **Concept:** Gradle là hệ thống build; build type (debug/release); Version Catalog (`libs.versions.toml`) quản lý dependency tập trung; ký app (signing) trước khi release; giữ an toàn thông tin signing.
- **File Android:** `aaf-materials/04-gradle-basics-a-look-behind-the-curtain/projects/final/build.gradle.kts`, `.../projects/final/gradle/libs.versions.toml`.
- **Composable/Class minh hoạ:** Không có Composable — đây là chapter về build config (`build.gradle.kts`, `libs.versions.toml`), không phải code UI.
- **Gợi ý Exercise/Quiz:** Quiz phân biệt debug vs release build type. Exercise: đọc 1 đoạn `libs.versions.toml` mẫu và tìm ra version của 1 thư viện cụ thể.

## Chapter 5 — Jetpack Compose

- **Concept:** Composable function là gì; lồng composable để tạo layout phức tạp từ khối nhỏ; Layout Group (`Column`/`Row`/`Box`); xem trước UI bằng `@Preview` (không cần build/chạy app); `Modifier` để chỉnh cách render; custom Theme + font tải về.
- **File Android:** `05-jetpack-compose/projects/final/app/src/main/java/com/kodeco/chat/MainActivity.kt`, `.../conversation/Conversation.kt`, `.../conversation/UserInput.kt`, `.../data/FakeData.kt`.
- **Composable/Class minh hoạ:** `ConversationContent`, `SimpleUserInput`, `Messages`, `AuthorAndTextMessage`, `ChatItemBubble`. Đây là app chat "Kodeco Chat" (package `com.kodeco.chat`), dùng UI Compose thuần, chưa có ViewModel, dữ liệu giả từ `FakeData`.
- **Gợi ý Exercise/Quiz:** Quiz: "Composable function bắt đầu bằng annotation nào?", "`@Preview` dùng để làm gì?". Exercise: đổi `Modifier.padding()` để thay đổi khoảng cách 1 bubble chat, quan sát kết quả qua Preview.
- **Ghi chú:** Đề xuất **chọn chapter này làm vertical slice đầu tiên (Task 7)** — theo Quyết định #6 trong `docs/PROJECT_PLAN.md` (chapter đầu tiên có code Android thật + dễ minh hoạ, ch1-4 chỉ là nền tảng).

## Chapter 6 — Advanced Jetpack Compose

- **Concept:** State trong Compose; composable "stateful" (tự giữ state) vs "stateless" (nhận state từ ngoài qua tham số); tách UI/data/logic bằng `ViewModel`; luồng dữ liệu một chiều (unidirectional data flow) dùng `Flow` + mẫu kiến trúc MVI.
- **File Android:** `06-advanced-jetpack-compose/projects/final/app/src/main/java/com/kodeco/chat/viewmodel/MainViewModel.kt`, `.../data/model/ChatRoom.kt`, `.../conversation/JumpToBottom.kt`.
- **Composable/Class minh hoạ:** `class MainViewModel : ViewModel()` với `StateFlow` cho `messages` và `currentRoom` — hỗ trợ nhiều phòng chat (`ChatRoom`).
- **Gợi ý Exercise/Quiz:** Quiz phân biệt stateful vs stateless composable. Exercise: vẽ sơ đồ (hoặc chọn trắc nghiệm) luồng dữ liệu MVI: User action → ViewModel → State → UI.

## Chapter 7 — Advanced Architecture

- **Concept:** Repository pattern (tách app logic khỏi nguồn dữ liệu cụ thể); Ditto SDK — database đồng bộ local-first kiểu P2P (không cần backend cloud truyền thống), thay thế backend cho app chat.
- **File Android:** `07-advanced-architecture/projects/final/app/src/main/java/com/kodeco/chat/data/repository/Repository.kt` (interface), `RepositoryImpl.kt`, `DittoHandler.kt`.
- **Composable/Class minh hoạ:** `interface Repository`; `MainActivity.setupDitto()`. Đây là chapter cuối cùng của mạch "Kodeco Chat" (ch5→6→7).
- **Gợi ý Exercise/Quiz:** Quiz: "Repository pattern giải quyết vấn đề gì?". Exercise (thử thách mở, gợi ý từ chính sách): thử tưởng tượng thêm 1 phòng chat thứ hai — không cần code thật, chỉ mô tả các bước cần làm.

## Chapter 8 — Networking

- **Concept:** Coroutine chạy code nền không chặn UI; `StateFlow` thay thế `LiveData` để báo sự kiện cho UI, và `collect` để lắng nghe trong giao diện; Retrofit khai báo API bằng interface + annotation; Moshi parse JSON response; `RetrofitInstance` (singleton `by lazy`) gộp Retrofit + Moshi thành 1 instance dùng chung.
- **File Android:** `08-networking/projects/final/app/src/main/java/com/kodeco/recipefinder/network/SpoonacularService.kt` (interface + `RetrofitInstance`), `.../viewmodels/RecipeViewModel.kt` (`queryRecipes`, `queryRecipe`, StateFlow field), `.../ui/recipes/RecipeList.kt` (ví dụ `collect` Flow trong Composable).
- **Composable/Class minh hoạ:** `class RecipeViewModel`, `interface SpoonacularService`, `object RetrofitInstance`; composable `RecipeList` (nơi `collect` Flow). Bắt đầu mạch app thứ 2 "Recipe Finder" (package `com.kodeco.recipefinder`). Ghi chú: `ui/MainScreen.kt` chỉ là phần điều hướng tab (bottom bar RecipeList/GroceryList), sách không đề cập tới trong chapter này nên lesson không dùng file này.
- **Gợi ý Exercise/Quiz:** Quiz: "Vì sao gọi API cần chạy trong coroutine thay vì main thread?", `StateFlow` dùng để làm gì, `@GET` dùng để làm gì. Exercise: đọc interface `SpoonacularService` thật, xác định endpoint + kiểu dữ liệu trả về của `queryRecipe`.

## Chapter 9 — Data Store

- **Concept:** 3 cách lưu dữ liệu phổ biến: file, shared preferences (SharedPreferences), database SQLite; SharedPreferences hợp cho dữ liệu đơn giản dạng key-value (string/number/boolean); ví dụ dùng: nhớ tab người dùng đang xem.
- **File Android:** `09-data-store/projects/final/app/src/main/java/com/kodeco/recipefinder/data/Prefs.kt`.
- **Composable/Class minh hoạ:** `class Prefs`, provider `LocalPrefsProvider` (CompositionLocal để phát `Prefs` xuống cây Compose — cách DI thủ công của sách).
- **Gợi ý Exercise/Quiz:** Quiz: "Khi nào nên dùng SharedPreferences thay vì Room database?". Exercise: liệt kê 2-3 loại dữ liệu trong 1 app ví dụ và phân loại nên lưu bằng cách nào (file/prefs/database).

## Chapter 10 — Room Database

- **Concept:** Room giúp tạo database và lưu dữ liệu có cấu trúc dễ dàng hơn SQLite thuần; định nghĩa bảng bằng `@Entity`, truy vấn bằng `@Dao`/`@Query`, thêm dữ liệu bằng `@Insert`.
- **File Android:** `10-room-db/projects/final/app/src/main/java/com/kodeco/recipefinder/data/database/RecipeDao.kt`, `RecipeDatabase.kt`, `.../data/RecipeRepository.kt`.
- **Composable/Class minh hoạ:** `class RecipeRepository`; DAO `RecipeDao`, `IngredientDao`; annotation `@Entity`/`@Dao`/`@Database`/`@Insert`/`@Query`/`@PrimaryKey`/`@Ignore`.
- **Gợi ý Exercise/Quiz:** Quiz: "`@Dao` dùng để làm gì?", "Room khác SharedPreferences ở điểm nào?". Exercise: đọc 1 method `@Query` mẫu và đoán nó trả về dữ liệu gì.

## Chapter 11 — Advanced Storage

- **Concept:** Mã hoá (encryption) quan trọng để bảo mật dữ liệu lưu trên máy; có thể mã hoá cả preferences lẫn database; thư viện Security cung cấp Encrypted Preferences; SQLCipher mã hoá database SQLite/Room.
- **File Android:** `11-advanced-storage/projects/final/app/src/main/java/com/kodeco/recipefinder/data/SecurePrefs.kt`, `.../data/database/RecipeDatabase.kt`.
- **Composable/Class minh hoạ:** `class SecurePrefs`; `RecipeApp.onCreate()` tự sinh passcode và mở Room database đã mã hoá — bài học đóng của sách.
- **Gợi ý Exercise/Quiz:** Quiz: "Vì sao cần mã hoá dữ liệu nhạy cảm ngay cả khi lưu trên máy người dùng?". Exercise: liệt kê loại dữ liệu nào trong 1 app nên mã hoá (mật khẩu, token...) vs không cần (cài đặt giao diện...).

## ⚠️ Lưu ý bản quyền khi dùng bảng này để viết lesson

Cột "File Android"/"Composable/Class minh hoạ" ở trên chỉ là **tham chiếu vị trí** (file path, tên class/hàm) — việc này an toàn (không phải sao chép code). File `LICENSE` gốc của repo `aaf-materials/` cấm dùng cho mục đích giảng dạy lập trình — về nguyên tắc xung đột với mục đích website này. **Đã có quyết định của user (Quyết định #7, 2026-08-26): vẫn dùng code thật từ `aaf-materials/` trong lesson**, vì đây là dự án cá nhân không public và user đã mua bản quyền sách/vật liệu, tự nhận rủi ro. Từ Task 7 trở đi lesson được phép trích code thật, miễn là **luôn ghi rõ nguồn file + dòng** và **không sửa file gốc** trong `aaf-materials/`. Chi tiết đầy đủ → `docs/SOURCE_MAP.md` mục 2.5 và `docs/PROJECT_PLAN.md` mục "Vấn đề/rủi ro" + Quyết định #7.
