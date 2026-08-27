# SOURCE MAP — Kết quả khảo sát EPUB & Android project

> Tài liệu tĩnh, ghi lại kết quả audit (session 2026-08-26). Chỉ sửa khi phát hiện thông tin sai hoặc audit lại. Trạng thái *đang làm gì* → xem `docs/PROJECT_PLAN.md`, không xem file này.

## 1. EPUB — `Android_Fundamentals_by_Tutorials_v1.0.0.epub`

- **Định dạng:** EPUB 3.0 (có `nav`/`toc.xhtml` chuẩn EPUB3).
- **Metadata** (từ `OEBPS/html/publish.opf`): tiêu đề *"Android Fundamentals by Tutorials"*; tác giả Ricardo Costeira, Fuad Kamal, Kevin David Moore; NXB Kodeco Inc; ngôn ngữ `en`; `dcterms:modified` 2024-01-15.
- **Cấu trúc thư mục trong file:** `META-INF/container.xml` trỏ tới rootfile `OEBPS/html/publish.opf`. Nội dung nằm ở `OEBPS/html/seg1.xhtml` … `seg25.xhtml` (+ front/back matter), ảnh ở `OEBPS/html/graphics/`, CSS ở `publish.css`.
- **Mục lục (đọc từ `OEBPS/html/toc.xhtml`), khớp 1-1 với 11 thư mục trong `aaf-materials/`:**

| Section | Chapter | Thư mục `aaf-materials/` tương ứng |
|---|---|---|
| I. Introduction to Android Development | 1. Welcome to Android & Kotlin | `01-welcome-to-android-and-kotlin` |
| | 2. Getting Started With Android Studio | `02-getting-started-with-android-studio` |
| | 3. Android Fundamentals | `03-android-fundamentals` |
| | 4. Gradle Basics: A Look Behind the Curtain | `04-gradle-basics-a-look-behind-the-curtain` |
| II. Building a Robust Android App | 5. Jetpack Compose | `05-jetpack-compose` |
| | 6. Advanced Jetpack Compose | `06-advanced-jetpack-compose` |
| | 7. Advanced Architecture | `07-advanced-architecture` |
| | 8. Networking | `08-networking` |
| III. Data Management | 9. Data Store | `09-data-store` |
| | 10. Room Database | `10-room-db` |
| | 11. Advanced Storage | `11-advanced-storage` |

Ngoài 11 chapter còn có: Book License, Before You Begin, What You Need, Book Source Code & Forums, Dedications, About the Team, Introduction, Conclusion.

- **Cấu trúc nội dung mỗi chapter (đã kiểm tra mẫu Chapter 5):** heading `<h1 class="segment-chapter">`/`<h2>`/`<h3>`; code nằm trong `<pre class="code-block">` với span highlight kiểu `hljs-*`; ảnh có class `image-NN` (% chiều rộng). Mọi chapter đều kết thúc bằng mục **"Key Points"** và **"Where to Go From Here?"** — thuận lợi để tự động tách phần "tóm tắt" cho lesson.
- **Kích thước nội dung (byte của file xhtml, ước lượng độ dài):** Chapter 5 (Jetpack Compose) lớn nhất (~63KB), Chapter 1 (~16KB) và Chapter 8 (~1KB, đây là heading section không phải chapter — kiểm tra lại số liệu seg khi làm Task 2/3).
- **Giấy phép (đọc trực tiếp từ trang "Book License" trong sách):**
  - Code nguồn **in trong sách** (đoạn code hiển thị trong text sách): được phép dùng/sửa trong app tuỳ ý, **không cần ghi công**.
  - Ảnh/artwork: được phép dùng/sửa nhưng **phải ghi chú**: "Artwork/images/designs: from Android Fundamentals by Tutorials, available at www.kodeco.com".
  - Văn bản sách: **chỉ dùng cá nhân**, không được sao chép/phát tán nguyên văn từng phần lớn.
  - ⚠️ **Lưu ý quan trọng — "Book License" này CHỈ áp dụng cho code in trong sách, KHÔNG áp dụng cho repo `aaf-materials/`** (xem mục 2.5 bên dưới — `aaf-materials/` có file `LICENSE` riêng, ĐANG XUNG ĐỘT với cách dùng của dự án này).
- **Cách trích xuất đã chốt:** Python stdlib `zipfile` (mở epub như zip) + `xml.etree.ElementTree` (parse XHTML như XML, vì nội dung là XHTML hợp lệ) — xem `docs/PROJECT_PLAN.md` mục Quyết định #2.

## 2. Android project — `aaf-materials/`

- **Nguồn gốc:** repo git con, remote `https://github.com/kodecocodes/aaf-materials.git`, nhánh `editions/1.0` (bản đi kèm sách edition 1.0, phát hành 2024-01-17). Đây là repo public chính chủ Kodeco — không phải tài liệu tự soạn.
- **Cấu trúc:** mỗi chapter (`01-...` → `11-...`) có `projects/starter` và `projects/final` (một số thêm `challenge`) — **mỗi thư mục là 1 Android Studio/Gradle project độc lập hoàn toàn** (không phải multi-module của cùng 1 app). Chapter 1 không có project thật (chỉ `.keep` rỗng) vì chapter đó học Kotlin thuần trên Playground.
- **Version công cụ (giữ nguyên xuyên suốt sách):** Android Gradle Plugin `8.2.0`, Kotlin `1.9.10`. Từ ~Chapter 5 trở đi dùng Gradle Version Catalog (`gradle/libs.versions.toml`); trước đó khai version thẳng trong `build.gradle.kts`.
- **2 mạch ứng dụng chính** (mỗi mạch build tăng dần qua nhiều chapter, KHÔNG phải 1 app xuyên suốt cả 11 chương):

### Mạch "Kodeco Chat" — package `com.kodeco.chat` — Chapter 5 → 6 → 7

| Ch | Công nghệ thêm vào | File Kotlin chính | Class/Composable chính |
|---|---|---|---|
| 5 | Compose UI thuần, chưa có ViewModel, dữ liệu giả (`FakeData`) | `05-jetpack-compose/projects/final/app/src/main/java/com/kodeco/chat/MainActivity.kt`, `.../conversation/Conversation.kt`, `.../conversation/UserInput.kt`, `.../data/FakeData.kt` | `@Composable ConversationContent`, `SimpleUserInput`, `Messages`, `AuthorAndTextMessage`, `ChatItemBubble` |
| 6 | `ViewModel` + `StateFlow`, hỗ trợ nhiều phòng chat (`ChatRoom`) | `06-advanced-jetpack-compose/.../viewmodel/MainViewModel.kt`, `.../data/model/ChatRoom.kt`, `.../conversation/JumpToBottom.kt` | `class MainViewModel : ViewModel()` (StateFlow `messages`, `currentRoom`). Có comment trong code trỏ trước tới Chapter 8 — xác nhận sách có kế hoạch liên chương. |
| 7 | Repository pattern + **Ditto SDK** (`live.ditto:ditto:4.5.0`, DB đồng bộ local-first, thay backend) | `07-advanced-architecture/.../data/repository/Repository.kt` (interface), `RepositoryImpl.kt`, `DittoHandler.kt` | Interface `Repository`; `MainActivity.setupDitto()`. Đây là chapter cuối cùng của mạch chat app. |

### Mạch "Recipe Finder" — package `com.kodeco.recipefinder` — Chapter 8 → 9 → 10 → 11

| Ch | Công nghệ thêm vào | File Kotlin chính | Class/Composable chính |
|---|---|---|---|
| 8 | Retrofit 2.9.0 + Moshi (KSP), Coil, Navigation-Compose | `08-networking/.../network/SpoonacularService.kt`, `.../viewmodels/RecipeViewModel.kt`, `.../ui/MainScreen.kt`, `.../RecipeApp.kt` | `class RecipeViewModel`/`GroceryListViewModel`; `MainScreen`, `RecipeDetails`. `MainActivity` có sẵn TODO chuẩn bị Repository/Prefs Provider cho ch09/ch10. |
| 9 | DataStore/SharedPreferences wrapper | `09-data-store/.../data/Prefs.kt` | `class Prefs`, provider `LocalPrefsProvider` |
| 10 | Room DB (`androidx.room 2.5.2`, KSP) + Repository hoàn chỉnh | `10-room-db/.../data/database/RecipeDao.kt`, `RecipeDatabase.kt`, `.../data/RecipeRepository.kt` | `class RecipeRepository`; DAO `RecipeDao`/`IngredientDao` |
| 11 | Room mã hoá bằng **SQLCipher** (`net.zetetic:android-database-sqlcipher 4.4.0`) + **EncryptedSharedPreferences** (`androidx.security-crypto 1.0.0`) | `11-advanced-storage/.../data/SecurePrefs.kt`, `.../data/database/RecipeDatabase.kt` | `class SecurePrefs`; `RecipeApp.onCreate()` sinh passcode, mở Room DB đã mã hoá — bài học đóng của sách. |

### 2.5 ⚠️ Giấy phép của `aaf-materials/` — XUNG ĐỘT với mục đích dự án (phát hiện 2026-08-26)

**Đây là thông tin sai đã được sửa lại** — audit ban đầu (Task 0) kết luận nhầm rằng code trong `aaf-materials/` dùng chung giấy phép với "Book License" của sách (dùng/sửa tự do). Khi đọc kỹ file `aaf-materials/LICENSE` (gốc repo) và header comment lặp lại y hệt trong **404/495 file `.kt`** của repo, giấy phép thật của `aaf-materials/` là:

> "...you may not use, copy, modify, merge, publish, distribute, sublicense, create a derivative work, and/or sell copies of the Software in any work that is designed, intended, or marketed for **pedagogical or instructional purposes related to programming, coding, application development, or information technology**. Permission for such use... is expressly withheld."

Dịch: được phép dùng code này tự do (kiểu MIT) **NGOẠI TRỪ** trong bất kỳ sản phẩm nào **có mục đích giảng dạy/hướng dẫn lập trình** — mà **website đang xây chính là loại sản phẩm này**.

**Quyết định của user (2026-08-26):** vẫn tiếp tục dùng code thật từ `aaf-materials/` trong lesson — dự án cá nhân, không public, user đã mua bản quyền sách/vật liệu đi kèm nên tự nhận rủi ro. Xem Quyết định #7 trong `docs/PROJECT_PLAN.md`. Khi trích code vào lesson vẫn phải ghi rõ nguồn file + dòng, không sửa file gốc.

### Ghi chú kiến trúc chung (áp dụng cả 2 mạch, ch05-11)

- **Không dùng Hilt/Koin/Dagger** ở bất kỳ chapter nào (đã kiểm tra `build.gradle.kts`/`libs.versions.toml`). DI làm thủ công: `Application` subclass khởi tạo dependency trong `onCreate()`, phát xuống cây Compose qua `CompositionLocalProvider` (`LocalRepositoryProvider`, `LocalPrefsProvider`...).
- **Test:** chỉ có boilerplate mặc định của Android Studio (`ExampleUnitTest.kt`, `ExampleInstrumentedTest.kt`) — không có test thật cho ViewModel/Repository/Room/Compose ở các chapter đã khảo sát (05-11).
- Chapter 1-4 (Kotlin cơ bản, Android Studio, Android fundamentals, Gradle) là bài học nền tảng riêng biệt, không thuộc 2 mạch trên; project (nếu có) chỉ là template mặc định của Android Studio.

## 3. So sánh version với hiện tại (đã xác minh qua tìm kiếm web 2026-08-26)

| Thành phần | Sách dùng | Hiện tại (stable, 2026-08-26) | Nguồn |
|---|---|---|---|
| Kotlin | 1.9.10 | 2.4.x | kotlinlang.org |
| Android Gradle Plugin | 8.2.0 | 9.2.0 (từ AGP 9.0 đã tích hợp sẵn Kotlin, không cần plugin `org.jetbrains.kotlin.android` riêng) | developer.android.com |
| Room | 2.5.2 | 2.8.4 (có nhánh mới `androidx.room3` cho Kotlin Multiplatform, chưa liên quan) | developer.android.com |

Khái niệm dạy trong sách (Composable, State, Recomposition, ViewModel/StateFlow, Repository pattern, Room, DataStore) **về nguyên tắc vẫn đúng** — chênh lệch chủ yếu ở version công cụ/API chi tiết. Sẽ kiểm tra API cụ thể **theo từng lesson** khi viết nội dung, không kết luận hàng loạt.

## 4. Công cụ đã kiểm tra sẵn có trên máy (2026-08-26)

- Python 3.13.12 (chưa có `bs4`/`lxml`/`ebooklib` — không cần cài, xem Quyết định #2 trong PROJECT_PLAN).
- Node v22.14.0 / npm 10.9.2 — đủ cho Astro.
- Git 2.45.2.
- Skill Android sẵn có trên máy (không phải trong project): `android-architecture`, `android-data-layer`, `android-viewmodel` (hướng dẫn Clean Architecture/Hilt/Repository/StateFlow) — hữu ích khi cần đối chiếu best-practice hiện tại, không dùng để sửa `aaf-materials/`.
