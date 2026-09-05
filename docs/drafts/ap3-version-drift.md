# AP3 — Bảng tra cứu: lệch phiên bản, lệch giáo trình ↔ project mẫu

> **TRẠNG THÁI: DRAFT NỘI BỘ.** File này KHÔNG phải trang site và **chưa** được wire vào
> `web/src/data/lessons.ts` hay registry nào. Nó là đích chứa của AP3 (Phụ lục — bảng tra cứu nhanh)
> theo `docs/COURSE_REDESIGN_SPEC_432cbf8_v2.md` §6 và task IMP-058 trong
> `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`.
>
> **Mục đích:** giữ lại nguyên vẹn các bảng *lệch phiên bản* và *lệch giáo trình ↔ project mẫu* được
> chuyển ra khỏi các bài lõi, để bài lõi không biến thành trang đính chính (COURSE_CONTENT_STANDARD
> §11) mà nội dung vẫn không mất.
>
> **Quy ước của file này:**
> - Mỗi chương nguồn có một mục `## Ch<NN> — …` riêng. **Chỉ thêm mục mới, không sửa mục của chương
>   khác.**
> - Mỗi mục ghi rõ *ngày chốt số liệu* và *bài lõi nào đã trỏ về đây*.
> - Đây là **tài liệu tra cứu**, không phải bài học: không có mục tiêu học, không có quiz, không có
>   giọng dẫn dắt. Nhưng cũng **không** chứa văn bản kiểu audit-log ("đã grep thấy…", "so file cho
>   thấy…") — nếu cần bằng chứng thì ghi đường dẫn + số dòng, hết.

---

## Mục lục

- [Ch06 — State, ViewModel & StateFlow](#ch06--state-viewmodel--stateflow)

---

## Ch06 — State, ViewModel & StateFlow

**Nguồn:** `aaf-materials/06-advanced-jetpack-compose/projects/{starter,final}/` ·
`content/book/ch06-advanced-jetpack-compose.md`
**Số liệu chốt:** 2026-08-28 (giữ nguyên mốc của bảng gốc trong bài Ch06).
**Bài lõi trỏ về đây:** trang Ch06 hiện tại (ba đơn vị S2/S3/S4), khối `#cam-bay` → mục "Tài liệu lỗi
thời — nơi tra".

### 1. Kiến thức bền vs cú pháp dễ đổi

Nhóm khái niệm của chương này — state, state hoisting, luồng dữ liệu một chiều, ViewModel,
Flow/StateFlow — **không lỗi thời theo phiên bản**. Những gì đổi chỉ là *tên gọi* và *số phiên bản*,
liệt kê dưới đây.

### 2. Bảng lệch phiên bản (2023 → hôm nay)

| Thứ trong giáo trình gốc / code mẫu | Hiện tại | Nên theo cái nào |
|---|---|---|
| Tên gọi *"Android Architecture Components"* cho nhóm ViewModel + Flow | Đã gộp vào **Jetpack**; tài liệu là *"Guide to app architecture"* với ba tầng UI / Domain / Data | Kỹ thuật không đổi — chỉ **tra theo tên mới**; cụm cũ không còn trên developer.android.com |
| `composeOptions { kotlinCompilerExtensionVersion = "1.5.3" }` trong `app/build.gradle.kts` (dòng 76–78) | Từ Kotlin 2.0, Compose compiler đi kèm Kotlin và được bật bằng plugin `org.jetbrains.kotlin.plugin.compose` | **Plugin mới.** Project mới không còn khối `composeOptions` (đã nói ở phần Gradle của khoá) |
| Tham số `autoCorrect` trong `KeyboardOptions` (`UserInput.kt` dòng 442) | Deprecated, đổi tên thành `autoCorrectEnabled` | Code cũ **vẫn build**, chỉ bị gạch ngang trong IDE — không phải lỗi copy sai |
| `lifecycle-runtime-compose` phiên bản `2.6.2` (`libs.versions.toml` dòng 14) | Vẫn phải tự thêm artifact này, nhưng dòng phiên bản đã sang **2.9.x** | Chỉ nâng số trong `[versions]`; **tên artifact không đổi** |
| `collectAsStateWithLifecycle()` | Vẫn là API được khuyến nghị cho Compose trên Android | Không cần làm gì |
| `kotlinx.datetime.Instant` | Từ kotlinx-datetime 0.7, `Instant` chuyển sang `kotlin.time.Instant` của thư viện chuẩn | Nếu nâng thư viện thì **sửa import**; logic không đổi |

Khối Gradle bị ảnh hưởng, giữ nguyên văn để đối chiếu:

```kotlin
composeOptions {
  kotlinCompilerExtensionVersion = "1.5.3"
}
```

*Nguồn: `aaf-materials/06-advanced-jetpack-compose/projects/final/app/build.gradle.kts` (dòng 76–78) —
khối này vẫn còn trong project của chương 6.*

### 3. Một khuôn xuất hiện sau khi giáo trình được viết

Google hiện khuyến nghị dùng **một lớp UI state holder** và cho ViewModel phơi ra **một**
`StateFlow<UiState>` duy nhất, thay vì nhiều flow rời rạc (ở project mẫu là `messages` và
`currentUserId` tách nhau). Lợi ích: giao diện không bao giờ thấy trạng thái nửa vời — ví dụ danh sách
tin nhắn đã mới mà danh tính người gửi vẫn cũ.

Đây là **bước tiến tự nhiên** từ chính mô hình mà chương 6 dạy, không phải phủ định nó. Trang Ch06 hiện
tại đã dạy khuôn này ở mục 11–13 (`ChatUiState` + cặp `MutableStateFlow`/`StateFlow` + `copy`), nên mục
này chỉ giữ lại phần ghi chú lịch sử.

### 4. Lệch giáo trình gốc ↔ project mẫu

Bốn điểm dưới đây **không** phải lệch phiên bản: chúng là chỗ văn bản hướng dẫn và code mẫu của chính
chương 6 không khớp nhau. Điểm 4.1 là điểm duy nhất khiến người học **không compile được**, nên trang
Ch06 giữ một câu nhắc trong khối `#cam-bay` và trỏ về đây.

#### 4.1 Hai file chỉ có trong `final` mà phần hướng dẫn không nói tới

Phần hướng dẫn dùng `currentRoom.value.id` và `createMessageForRoom(message, currentRoom.value)` —
tham chiếu tới một property `currentRoom` kiểu `ChatRoom`. Nhưng **không có đoạn nào hướng dẫn tạo
`currentRoom`, cũng không có đoạn nào tạo class `ChatRoom`**. Trong `final` thì cả hai đều tồn tại:

```kotlin
@Immutable
data class ChatRoom(
  val id: String,
  val name: String,
  val createdOn: Instant,
  val messagesCollectionId: String,
  val isPrivate: Boolean,
  val collectionID: String,
  val createdBy: String
)
```

*Nguồn: `.../final/.../data/model/ChatRoom.kt` (dòng 41–50) — file **không tồn tại** trong `starter`.*

```kotlin
const val DEFAULT_PUBLIC_ROOM_MESSAGES_COLLECTION_ID =
  "<hash 64 ký tự>"
```

*Nguồn: `.../final/.../data/Constants.kt` (dòng 37–41) — file **không tồn tại** trong `starter`.*

Và phần tạo `currentRoom` trong ViewModel: `.../final/.../viewmodel/MainViewModel.kt` (dòng 81–92) —
một `emptyChatRoom` + cặp `_currentChatRoom` private / `currentRoom` public.

**Thứ tự việc cần làm để code trong giáo trình compile được:**

1. Tạo `data/model/ChatRoom.kt` (hoặc copy từ `final`).
2. Tạo `data/Constants.kt` chứa `DEFAULT_PUBLIC_ROOM_MESSAGES_COLLECTION_ID`.
3. Thêm `emptyChatRoom`, `_currentChatRoom`, `currentRoom` vào ViewModel.

**Cách tối giản nếu không muốn tạo hai file mới:** ở chương 6 `chatRoom` hầu như không dùng vào việc gì
— nó chỉ đóng góp `currentRoom.value.id` làm `roomId` của `Message`, và `Message` đã có giá trị mặc
định `roomId = "public"`. Bỏ tham số phòng chat, dùng thẳng `"public"`, code vẫn chạy đúng. Tới giai
đoạn Mạng thì quay lại thêm.

**Vì sao có chỗ vênh này:** `messagesCollectionId` là một chuỗi hash 64 ký tự trông đúng như ID
collection trên backend, và `isPrivate`/`collectionID` chỉ có nghĩa khi có nhiều phòng chat thật. Nghĩa
là `ChatRoom` được thiết kế cho **giai đoạn Mạng**, nhưng bản `final` của chương 6 đã được lấy từ một
bản code về sau.

#### 4.2 Ba điểm lệch còn lại

| # | Lệch ở đâu | Nội dung | Hậu quả nếu làm theo văn bản |
|---|---|---|---|
| 1 | Comment trong `MainViewModel.kt` | Comment ghi *"see chapter 8 … Data Store"*, còn văn bản giáo trình hẹn ở **chapter 9 "Data Store"** (chapter 8 là Networking) | Đi tìm lộn chương. **Văn bản đúng, comment sai.** |
| 2 | Tên theme | Project dùng `KodecochatTheme` (chữ `c` nhỏ ở giữa — `MainActivity.kt` dòng 50, 70); chương 2 đặt tên `KodecoChatTheme` | Android Studio báo không tìm thấy hàm. **Copy đúng tên trong project của bạn.** |
| 3 | Truyền danh tính người gửi | Văn bản in `authorId = content.user.id` ở lời gọi composable một dòng tin nhắn (dòng 382); code `final` viết `authorId = authorId` (dòng 187) | **Nghiêm trọng nhất.** `content.user.id` là *người gửi của tin đang vẽ*, còn `authorId` là *người đang dùng máy*. Làm theo văn bản thì `authorId == userId` luôn đúng → **mọi** tin nhắn hiện như của bạn. **Bản đúng là bản trong project.** |

Hai chỗ nữa project làm mà văn bản không yêu cầu (không gây lỗi, nhưng gây bối rối khi so file):

- `exampleUiState` trong `data/FakeData.kt` được **comment lại** thay vì xoá. Kết quả tương đương, nhưng
  nếu bạn xoá thật rồi so với `final` thì thấy khác và tưởng mình sai.
- Khối `LaunchedEffect(key1 = uiState.messages)` trong `conversation/Conversation.kt` — thứ làm màn hình
  tự cuộn tới tin nhắn mới — **không được văn bản đề cập**. Trang Ch06 dạy nó ở mục 17.

### 5. Bảng so từng file: `starter` ↔ `final`

Bảng này có ích khi bạn tự code theo hướng dẫn rồi muốn biết mình còn thiếu gì. Kết quả so từng file
giữa hai project, không phải suy đoán từ mục lục.

| File | Trạng thái | Có được hướng dẫn? |
|---|---|---|
| `viewmodel/MainViewModel.kt` | **Mới hoàn toàn** (130 dòng) | Có — nhưng thiếu phần `currentRoom` (mục 4.1) |
| `data/model/ChatRoom.kt` | **Chỉ có trong `final`** | **Không** — thiếu là không compile được |
| `data/Constants.kt` | **Chỉ có trong `final`** | **Không** — thiếu là không compile được |
| `conversation/JumpToBottom.kt` | **Chỉ có trong `final`** (105 dòng) | Có — hướng dẫn bảo copy nguyên file |
| `MainActivity.kt` | Sửa: thêm `by viewModels()`, `collectAsStateWithLifecycle()`, truyền ViewModel vào UI state | Có, đầy đủ |
| `conversation/ConversationUiState.kt` | Sửa: thêm `viewModel`, `authorId`; `addMessage()` gọi ViewModel | Có, đầy đủ |
| `conversation/Conversation.kt` | Sửa nhiều nhất: `authorId` xuyên 3 tầng, `reverseLayout`, `derivedStateOf`, `JumpToBottom()`, `JumpToBottomThreshold`, `LaunchedEffect`, `nestedScroll` bỏ comment | Có — trừ `LaunchedEffect`, và lệch một dòng ở mục 4.2 #3 |
| `data/FakeData.kt` | Sửa: bỏ `private`, comment `exampleUiState`, **đảo thứ tự 3 tin nhắn** (`[0,1,2]` → `[2,1,0]`) | Có — **trừ việc đảo thứ tự** |
| `res/values/strings.xml` | Thêm đúng 1 dòng `jumpBottom` (dòng 46) | Có |
| `gradle/libs.versions.toml` + `app/build.gradle.kts` | Thêm 3 dòng cho `lifecycle-runtime-compose` (1 dòng `[versions]`, 1 dòng `[libraries]`, 1 dòng `implementation`) | Có |
| `conversation/UserInput.kt` | Sửa: thêm 6 import (`Image`, `OutlinedTextField`, `LocalContext`, `coil.*`…) — **phần lớn không được dùng**; còn lại chỉ đổi thụt lề | **Không** — liên quan tính năng ảnh bị bỏ dở (trang Ch06 mục 18.1) |
| `data/model/DateExtensions.kt`, `data/model/MessageUiModel.kt`, `utilities/Extensions.kt` | Khác biệt duy nhất: thêm ký tự xuống dòng ở cuối file | Không cần — không ảnh hưởng gì |
| 3 file trong `res/drawable/`, `styles.xml`, `themes.xml` | Khác biệt định dạng / xuống dòng, không đổi hành vi | Không cần |

**Ghi chú về `projects/challenge`:** chương 6 **không có phần challenge** — thư mục chỉ chứa một file
`.keep` rỗng. Các câu tự kiểm tra ở trang Ch06 là do khoá học tự thiết kế.

### 6. Đối chiếu quyền sở hữu — nội dung Ch06 đi đâu

Ghi lại để đợt tách Ch06 → S2/S3/S4 (IMP-037) và các batch sau không dựng lại nội dung đã có chỗ.

| Nội dung gốc của Ch06 | Đích |
|---|---|
| State · `mutableStateOf` · `remember` · `rememberSaveable` · recomposition | **S2** (trang Ch06, mục 1–4) |
| Stateful ↔ stateless · state hoisting · UDF ở mức UI · callback là sự kiện | **S3** (mục 5–8) |
| ViewModel · UiState · `MutableStateFlow`/`StateFlow` · `collectAsStateWithLifecycle` · `stateIn` · chuỗi cú chạm→UI · đọc state chết · Jump to bottom | **S4** (mục 9–19) |
| Kiến trúc tầng UI/data · repository · nguồn dữ liệu thật · Dependency Injection / Hilt | **S5** (repository, tầng dữ liệu) và các bài sau — trang Ch06 chỉ trỏ tới, không dạy |
| Chiều sâu Flow: toán tử, cold ↔ hot, cancellation, `SharedFlow`, cơ chế chia sẻ của `stateIn` | **W1** |
| Bảng lệch phiên bản · bảng so `starter` ↔ `final` · lệch giáo trình ↔ project | **AP3 — file này** |
| MVI như một pattern kiến trúc đầy đủ (bảng Model/View/Intent, thuật ngữ) | **Bỏ khỏi bài lõi.** Người học chỉ cần luồng một chiều ở mức UI (S3) + chuỗi ViewModel→UI (S4). Riêng cảnh báo *"Intent trong MVI không phải `android.content.Intent`"* được giữ ở đây vì nó vẫn hữu ích khi đọc tài liệu ngoài. |

**Cảnh báo tên gọi cần giữ:** chữ *"Intent"* trong MVI **không phải** `android.content.Intent` — thứ
dùng để mở Activity khác ở Chương 3. Trùng tên hoàn toàn ngẫu nhiên; trong MVI, "intent" nghĩa là *ý
định của người dùng*. Đây là một trong những chỗ gây nhầm nhiều nhất khi đọc tài liệu về MVI trên
Android.

### 7. Việc còn lại của IMP-058 mà file này chưa làm

- Chưa gom bảng lệch phiên bản của các chương khác (Ch03.4, Ch04, Ch08–Ch11) — mỗi chương thêm một mục
  `## Ch<NN>` riêng khi batch tương ứng chạy.
- Chưa có bảng glossary và bảng lệnh (spec §6 mô tả AP3 gồm *versions, commands, glossary*).
- Chưa có phần "số chương của giáo trình gốc" mà spec §16 muốn chuyển vào phụ lục.
- Chưa wire vào registry/route — AP3 chỉ thành trang ở task IMP-058.
