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
- [Ch08 — Networking: Retrofit, Moshi/KSP & Coil](#ch08--networking-retrofit-moshiksp--coil)

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

- Chưa gom bảng lệch phiên bản của các chương còn lại (Ch03.4, Ch04, Ch09–Ch11) — mỗi chương thêm một
  mục `## Ch<NN>` riêng khi batch tương ứng chạy.
- Chưa có bảng glossary và bảng lệnh (spec §6 mô tả AP3 gồm *versions, commands, glossary*).
- Chưa có phần "số chương của giáo trình gốc" mà spec §16 muốn chuyển vào phụ lục.
- Chưa wire vào registry/route — AP3 chỉ thành trang ở task IMP-058.

---

## Ch08 — Networking: Retrofit, Moshi/KSP & Coil

**Nguồn:** `aaf-materials/08-networking/projects/{starter,final}/` ·
`content/book/ch08-networking.md`
**Số liệu chốt:** 2026-09-06 (verify trực tiếp trong phiên dựng lại trang Ch08; bản của giáo trình = 2023).
**Bài lõi trỏ về đây:** trang Ch08 hiện tại (ba đơn vị W1/W2/W3), khối `#cam-bay` → mục "Cạm bẫy &
tài liệu lỗi thời"; các con số dưới đây không lặp lại trong thân bài.

### 1. Kiến thức bền vs cú pháp dễ đổi

Nhóm khái niệm của chương này — coroutine/suspend/scope, Flow/StateFlow, mô tả API bằng interface
Retrofit, JSON ↔ data class, codegen vs reflection, phân trang theo offset — **không lỗi thời theo
phiên bản**. Đổi chỉ là *số phiên bản*, *tên artifact* (Coil 3) và *chính sách dịch vụ* (Spoonacular
free tier); liệt kê dưới đây.

### 2. Bảng lệch phiên bản (2023 → hôm nay)

| Thứ trong giáo trình gốc / code mẫu | Hiện tại | Nên theo cái nào |
|---|---|---|
| `kotlinx-coroutines` **1.7.2** (`libs.versions.toml` dòng 19) | **1.11.x** (08/2026) | Không bắt buộc. Mọi API chương này dùng (`launch`, `suspend`, `Dispatchers`, `MutableStateFlow`, `asStateFlow`) không đổi |
| `retrofit` **2.9.0** (dòng 20) | Nhánh 2.x kết ở **2.12.0**; bản ổn định mới là **3.0.0** (05/2025) — **không đổi API** (vẫn package `retrofit2`, tương thích binary 2.x); thay đổi đáng kể duy nhất: kéo OkHttp lên 4.12 | Nên lên 2.12.0 nếu tiện. `@GET`/`@Query`/`@Path` và `suspend` giữ nguyên ở cả hai nhánh |
| `moshi` + `moshi-kotlin-codegen` **1.15.0** (dòng 22) | **1.15.2** (12/2024) — bản sửa lỗi | Nên đổi. `@Json`, `@JsonClass(generateAdapter = true)` không đổi |
| `coil-compose` **2.4.0** (dòng 15) | Nhánh **Coil 3** (`io.coil-kt.coil3`, bản ổn định **3.6.x**, 2026): đổi namespace, tách artifact mạng (`coil-network-okhttp`), hỗ trợ Compose Multiplatform | `AsyncImage` dùng như nhau ở mức bài học (URL vô, ảnh ra). Project mới nên theo Coil 3; không cần nâng khi đang học chương này |
| `timber` **5.0.1** | **5.0.1** — vẫn là bản mới nhất (08/2021) | Không. Ổn định nhiều năm |
| `kotlin` **1.9.10** | **2.4.x**. Từ Kotlin 2.0, Compose compiler đi kèm plugin `org.jetbrains.kotlin.plugin.compose` thay vì khối `composeOptions` | Project mới: dùng plugin compose. Đã dạy ở phần Gradle của khoá |
| `agp` **8.2.0** | Dòng 8.x đi tiếp; AGP phải tương thích Android Studio đang dùng | Để Studio tự nâng qua AGP Upgrade Assistant khi báo |
| (không phải thư viện) Ảnh chụp màn hình đăng ký Spoonacular + hạn mức free tier | Chính sách free tier thay đổi thường xuyên hơn thư viện | Đăng ký theo *ý nghĩa* từng bước (tài khoản → console/profile → API key), không theo hình |

### 3. "8 điểm lệch" giáo trình ↔ project — bản đồ đích sau khi dựng lại trang

Bản Ch08 trước đây giữ một bảng tổng hợp 8 điểm "sách nói X, code làm Y". Sau khi dựng lại thành ba
đơn vị, mỗi điểm đã sống ở đúng vị trí sư phạm của nó; bảng dưới chỉ còn là bản đồ tra nhanh —
**nội dung đầy đủ của từng điểm nằm ở mục được trỏ, không lặp lại ở đây**:

| # | Điểm | Nội dung ở mức một câu | Nơi dạy bây giờ |
|---|---|---|---|
| 1 | "Flows thay thế LiveData" (Key Points của giáo trình) | LiveData chưa deprecate; code mới chọn StateFlow vì sinh từ coroutine + không phụ thuộc Android | W1 mục 5 (tóm tắt một câu) — lịch sử câu nói gốc nằm ở dòng 592 `{BOOK}` |
| 2 | `moshi-kotlin` (reflection) rồi bị bỏ | Giáo trình thêm bản reflection ở giữa chừng rồi chuyển codegen; `starter`/`final` chỉ lưu trạng thái cuối | W2 mục 13 (bảng reflection ↔ codegen) — trạng thái trung gian của giáo trình là dữ liệu lịch sử, giữ ở đây |
| 3 | API key nằm trong code committed | Placeholder nên không rò rỉ, nhưng cấu trúc mời bạn dán key thật rồi commit | W3 mục 21 (khuôn keys.properties → BuildConfig + ranh giới bảo mật) |
| 4 | Plugin KSP không được hướng dẫn khai | Đã có sẵn trong `starter`, project mới phải tự thêm `alias(libs.plugins.devtoolsKsp)` | W2 mục 13 |
| 5 | `Ingredient` bị annotate nhưng không qua JSON | Làm máy móc theo chữ "các file còn lại"; model thật của Chương 10.2 | W2 mục 13 |
| 6 | `suspend fun queryRecipe` + `viewModelScope.launch` cùng lúc | Lớp dư — hàm trả về ngay, suspend không giúp chờ | W1 mục 7 |
| 7 | `launch(Dispatchers.Default)` cho lời gọi mạng | Chạy đúng (Retrofit tự main-safe) nhưng dựng thói quen sai | W1 mục 1, 7 |
| 8 | Hai `@Preview` không render được (`LocalNavigatorProvider` mặc định ném lỗi) | Đọc code mẫu thấy preview đỏ là bình thường | **N1** sở hữu (Phần 15 #2 của draft N1); trang W1/W2 không dạy lại, chỉ cross-ref |

### 4. Tham chiếu phiên bản Navigation (thuộc N1/N2)

Project 08 khai `navigation-compose` **2.7.2** (`libs.versions.toml` dòng 17) — toàn bộ dữ kiện
phiên bản về Navigation (2.8.0 = ngưỡng route type-safe; bản ổn định hiện tại; Navigation 3) đã được
verify và ghi trong **`docs/drafts/n2-navigation-backstack-typesafe.md`** (mục "Editorial migration
notes / C"). Khi N1/N2 được dựng thành trang, phần riêng của Navigation sẽ thêm vào file này —
không nhân đôi ở đây.
