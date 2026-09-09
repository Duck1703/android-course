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
- [Ch09 — Data Store: Preferences DataStore & wiring](#ch09--data-store-preferences-datastore--wiring)
- [Ch11 — Advanced Storage: files/SAF/backup & encryption](#ch11--advanced-storage-filessafbackup--encryption)

---

## Ch06 — State, ViewModel & StateFlow

**Nguồn:** `aaf-materials/06-advanced-jetpack-compose/projects/{starter,final}/` ·
`content/book/ch06-advanced-jetpack-compose.md`
**Số liệu chốt:** 2026-08-28 (giữ nguyên mốc của bảng gốc trong bài Ch06).
**Bài lõi trỏ về đây:** S4 (`ch06-viewmodel-va-ui-state`, sau Stage-3 tách), khối `#cam-bay` → mục "Tài liệu lỗi
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

**Trạng thái sau Stage 3 (batch IMP-035/042/043, 2026-09-08):** bảng dưới đây đã thực thi
xong — S1 (bài NEW, `coroutines-20-phut-khong-so`) đứng trước S2–S4; monolith
`Ch06AdvancedJetpackCompose.astro` + `Ch06Quiz.astro` và 4 file ngủ đông `Ch06_1…Ch06_4`
đã xoá (khôi phục được từ Git). Từ khoá trỏ về AP3 của trang gộp cũ nằm trong S4
(`ch06-viewmodel-va-ui-state`, khối `#cam-bay` → mục "Tài liệu lỗi thời — nơi tra").

| Nội dung gốc của Ch06 | Đích | Trạng thái Stage 3 |
|---|---|---|
| State · `mutableStateOf` · `remember` · `rememberSaveable` · recomposition | **S2** (`ch06-state-va-recomposition`, mục 1–4) | ✅ live |
| Stateful ↔ stateless · state hoisting · UDF ở mức UI · callback là sự kiện | **S3** (`ch06-state-hoisting-va-udf`, mục 5–8) | ✅ live |
| ViewModel · UiState · `MutableStateFlow`/`StateFlow` · `collectAsStateWithLifecycle` · `stateIn` · chuỗi cú chạm→UI · đọc state chết · Jump to bottom | **S4** (`ch06-viewmodel-va-ui-state`, mục 9–19) | ✅ live |
| Kiến trúc tầng UI/data · repository · nguồn dữ liệu thật · Dependency Injection / Hilt | **S5** (`kien-truc-ui-data-repository`, bài NEW) và các bài sau — trang Ch06 chỉ trỏ tới, không dạy | ✅ live (S5); Hilt/DI sâu → D2 |
| Chiều sâu Flow: toán tử, cold ↔ hot, cancellation, `SharedFlow`, cơ chế chia sẻ của `stateIn` | **W1** | còn lại (W1 chưa dựng) |
| Bảng lệch phiên bản · bảng so `starter` ↔ `final` · lệch giáo trình ↔ project | **AP3 — file này** | ✅ mục 1–5 dưới đây |
| MVI như một pattern kiến trúc đầy đủ (bảng Model/View/Intent, thuật ngữ) | **Bỏ khỏi bài lõi.** Người học chỉ cần luồng một chiều ở mức UI (S3) + chuỗi ViewModel→UI (S4). Riêng cảnh báo *"Intent trong MVI không phải `android.content.Intent`"* được giữ ở đây vì nó vẫn hữu ích khi đọc tài liệu ngoài. | ✅ đã bỏ; quiz cũ Ch06 (MVI order-exercise, câu 9 Intent-vs-Intent) được viết lại theo ownership S2/S3/S4, không sao chép |

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
**Bài lõi trỏ về đây:** ba bài Ch08 hiện tại (W1 `ch08-coroutines-va-flow` · W2
`ch08-retrofit-moshi-json` · W3 `ch08-trang-thai-mang-api-key`, tách từ monolith
tại Stage 5), khối `#cam-bay` → mục "Cạm bẫy &
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

---

## Ch09 — Data Store: Preferences DataStore & wiring

**Nguồn:** `aaf-materials/09-data-store/projects/{starter,final}/` ·
`content/book/ch09-data-store.md`
**Số liệu chốt:** 2026-09-06 (verify trực tiếp trong phiên dựng lại trang Ch09; bản của giáo trình = 2023).
**Bài lõi trỏ về đây:** hai bài `ch09-data-store-va-sharedpreferences` (D1) và
`ch09-prefs-composition-local-va-wiring` (D2) — khối `#cam-bay` (đoạn mở "tra cứu
phiên bản của khoá — AP3") và cuối khối `#nguon`; riêng điểm "deprecated" được trỏ từ mục 2 của D1.
Các con số dưới đây không lặp lại trong thân bài.

### 1. Kiến thức bền vs cú pháp dễ đổi

Nhóm khái niệm của chương này — chọn công cụ lưu trữ theo hình dạng dữ liệu, key/value có kiểu, đọc-ghi
bất đồng bộ (suspend/Flow), ghi nguyên khối, một-instance-per-store, cấp dependency qua
CompositionLocal — **không lỗi thời theo phiên bản**. Đổi chỉ là *số phiên bản* của thư viện, liệt kê
bên dưới.

### 2. Bảng lệch phiên bản (2023 → hôm nay)

| Thứ trong giáo trình gốc / code mẫu | Hiện tại | Nên theo cái nào |
|---|---|---|
| `datastore-preferences` **1.0.0** (`libs.versions.toml` dòng 22, `prefsVersion`) | Nhánh 1.1.x (2025) rồi **1.2.x** — bản ổn định mới **1.2.1** (03/2026); nhánh 1.3.0 còn ở alpha | Nên lên 1.2.1 khi dựng project mới. Toàn bộ API chương dùng (`preferencesDataStore`, `stringPreferencesKey`/`intPreferencesKey`, `edit`, `data`) không đổi |
| (stack chung) kotlinx-coroutines 1.7.2, Kotlin/Compose compiler/AGP, timber | Đã đối chiếu đủ trong **mục Ch08** của file này | Xem bảng Ch08 — không nhân đôi ở đây |

### 3. Lệch giáo trình ↔ project — bản đồ sau khi dựng lại trang

Bản Ch09 trước đây giữ một bảng tổng hợp 7 điểm "văn bản nói X, code làm Y". Sau khi dựng lại thành
hai đơn vị D1/D2, mỗi điểm đã sống ở đúng vị trí sư phạm của nó; bảng dưới chỉ còn là bản đồ tra
nhanh — nội dung đầy đủ của từng điểm nằm ở mục được trỏ, **không lặp lại ở đây**:

| # | Điểm | Nội dung ở mức một câu | Nơi dạy bây giờ |
|---|---|---|---|
| 1 | "Thêm `implementation(libs.prefs)` *sau* dòng timber" | Trong `final`, `libs.prefs` (dòng 80) nằm **trước** `libs.timber` (dòng 82) | Không cần dạy: thứ tự khai dependency trong Gradle vô nghĩa — ghi lại để không hoang mang khi đối chiếu |
| 2 | `hasKey()` được hướng dẫn nhưng không ai gọi | `Prefs.kt:39–42` chỉ có định nghĩa, không có lời gọi nào; và luôn tạo key bằng `stringPreferencesKey` nên không tìm thấy key kiểu Int | D1 mục 10 (callout "code chết + hố nhỏ") |
| 3 | "Thêm `val prefs = remember { Prefs(context) }` vào `MainActivity`" | Dòng này **không tồn tại** trong `MainActivity.kt` (86 dòng, đã đọc hết); TODO tương ứng được điền bằng `LocalPrefsProvider provides (application as RecipeApp).prefs` | D2 mục 13 (cấp giá trị) và mục 19 (hai cách preview); dòng thừa nếu làm theo sẽ tạo instance DataStore thứ hai — đúng điều cảnh báo "Important" cấm |
| 4 | Preview: "dùng context để tạo một `Prefs` mới" | Cả 4 preview trong `final` đọc `LocalPrefsProvider.current`, và vẫn giữ `val context = LocalContext.current` khai rồi không dùng (ChipRow 68, SearchRow 137, ShowBookmarks 106, ShowRecipeList 95) — vết của một cách sửa khác | D2 mục 19 (hai cách + cái giá của mỗi cách); chi tiết "unused variable" nằm ở đây |
| 5 | Comment trong bộ khung ghi hàm thứ tư là `getInit` | Hàm thật tên `getInt` (`Prefs.kt:34`) | Lỗi chính tả trong giáo trình; không dạy, ghi lại ở đây |
| 6 | Chương mở đầu bằng chuyện bookmark | Mọi hàm bookmark trong `RecipeViewModel` còn thân rỗng + TODO (dòng 106–157) | Cross-ref Chương 10 (Room) ngay đầu trang; không có gì phải "sửa" |
| 7 | Cảnh báo "Important: một instance" vs delegate đặt **trong** class | `Prefs.kt:13` — mỗi `Prefs` mới tạo thêm một instance DataStore trỏ cùng file; project thoát được nhờ tạo đúng một `Prefs` trong `RecipeApp.onCreate()` | D1 mục 5 (bảng hai vị trí + "hoạt động, nhưng mong manh") |

Hai điểm nữa phát hiện khi dựng lại, không có trong bảng cũ:

- Tiêu đề phần cuối của giáo trình: *"In this section, you'll use **shared preferences** to save the
  current UI tab"* (dòng 350–351) — nhưng toàn bộ code phần đó là **DataStore**
  (`prefs.saveInt`/`prefs.getInt`). Văn bản dùng "shared preferences" như một cụm chung chỉ
  "thiết lập đã lưu", không phải tên API; khi đối chiếu code, cứ hiểu là DataStore.
- Số `// TODO: Add Prefs` trong `starter`: **13 lời gọi rải trong 11 file** (RecipeApp×2,
  MainActivity×1, MainScreen×1, GroceryList×1, RecipeDetails×2, RecipeList×1, ChipRow×1,
  SearchRow×1, ShowBookmarks×1, ShowRecipeList×1, RecipeViewModel×1 — trong đó
  `ShowBookmarks.kt:108` viết sai thành `// TODO: Add PRefs`), cộng thêm 3 TODO prefs khác trong
  `MainScreen.kt` (dòng 32, 43, 51). Đối chiếu từng file thì đừng ngạc nhiên nếu thấy chính tả
  comment lệch.

### 4. "SharedPreferences đã deprecated"? — ghi chú lịch sử

Giáo trình ghi ở dòng 40: *"The SharedPreferences method has been deprecated"*. Tài liệu chính thức
của Android hiện nay **không** đánh dấu class `SharedPreferences` là `@Deprecated` — nó vẫn thuộc
SDK, vẫn chạy, và vẫn được dùng trong vô số codebase hiện hữu. Điều Google làm là **khuyến nghị
DataStore cho code mới** (tài liệu DataStore mô tả nó: đọc-ghi bất đồng bộ qua coroutine/Flow, cập
nhất nhất quán và transactional). Trang lõi (D1, mục 2) dạy đúng tư thế này — SharedPreferences chỉ
cần *đọc được*, còn kiến trúc mới của khoá dựng trên DataStore. Mục này chỉ giữ mốc: *câu
"deprecated" là lời của giáo trình gốc (2023), không phải của tài liệu API hiện hành.*

---

## Ch11 — Advanced Storage: files/SAF/backup & encryption

**Nguồn:** `aaf-materials/11-advanced-storage/projects/{starter,final}/` ·
`content/book/ch11-advanced-storage.md`
**Số liệu chốt:** 2026-09-06 (verify trực tiếp khi dựng lại trang Ch11; bản của giáo trình = 2023).
**Bài lõi trỏ về đây:** hai bài X1/X2 sau khi tách route Stage 7 —
X1 `ch11-files-saf-va-backup` (Files, SAF & Backup, mục 1–8.5) và
X2 `ch11-keystore-sqlcipher-va-ma-hoa` (Mã hoá, mục 9–21). Khối `#cam-bay` và mục 16/17 của X2
trỏ về đây cho phần drift dài; X1 trỏ về đây từ mục 8.5 (bảng cú pháp hai thế hệ backup rule).
Các con số dưới đây không lặp lại đầy đủ trong thân bài.

### 1. Kiến thức bền vs cú pháp dễ đổi

Nhóm khái niệm của chương này — chọn chỗ lưu theo thuộc tính (riêng tư / bền / có quyền), hợp đồng
cache, SAF = "người dùng chỉ thay vì app xin quyền", Uri ≠ đường dẫn, envelope encryption (master key
trong Keystore mở data key), tráo lớp SQLite dưới Room qua `openHelperFactory`, backup ≠ vị trí ≠ mã
hoá — **không lỗi thời theo phiên bản**. Đổi là *tên artifact*, *trạng thái deprecation* và *cú pháp
backup rule*, liệt kê bên dưới.

### 2. Bảng lệch phiên bản (2023 → 09/2026)

| Thứ trong giáo trình gốc / code mẫu | Hiện tại | Nên theo cái nào |
|---|---|---|
| `androidx.security:security-crypto` **1.0.0** (`libs.versions.toml` dòng 24) | **1.1.0 stable (30/07/2025)** — *toàn bộ API deprecated ở chính bản stable này*; AndroidX: *"There won't be any subsequent releases of this library"*, hướng thay: *"existing platform APIs and direct usage of Android Keystore"*. Lộ trình: `MasterKeys` deprecated từ 1.1.0-alpha01 (10/06/2020) → `MasterKey.Builder` (1.1.0-alpha03) → nay cả `MasterKey` cũng deprecated → `KeyGenParameterSpec.Builder` + `javax.crypto.KeyGenerator` với AndroidKeyStore | **HISTORICAL.** Đọc được code cũ; không dùng cho code mới. Không có migration guide chính thức; DataStore **không phải** bản thay ESP về mã hoá |
| `MasterKeys.getOrCreate(AES256_GCM_SPEC)` | Deprecated trước cả khi sách ra; overload `create(fileName, alias, context, …)` còn bị javadoc cảnh báo không thread-safe khi key chưa tạo | Bản trung gian: `MasterKey.Builder` + `create(context, fileName, masterKey, …)`; hiện tại: Keystore trực tiếp |
| `net.zetetic:android-database-sqlcipher` **4.4.0** (dòng 25) | **EOL** — Zetetic khuyến nghị chuyển từ 31/08/2023; bản cuối nhánh cũ 4.5.4. Kế thừa: `net.zetetic:sqlcipher-android`, bản mới nhất **4.18.0** (18/08/2026) | Đọc được code cũ; project mới dùng `sqlcipher-android`: package `net.zetetic.database.sqlcipher`, `SupportOpenHelperFactory` thay `SupportFactory` (class cũ **không còn tồn tại**), **tự gọi `System.loadLibrary("sqlcipher")`** (bỏ `loadLibs` — quên là `UnsatisfiedLinkError`), `androidx.sqlite` 2.7.0, minSdk 23. `openOrCreateDatabase` đổi thứ tự tham số; `SQLiteDatabaseHook.preKey/postKey` nhận `SQLiteConnection` |
| Lý do đổi SQLCipher artifact | Yêu cầu 16KB page size của Google Play buộc build lại native library; `loadLibs` không tương thích `SplitInstallHelper.loadLibrary` | — |
| Room **2.5.2**-kỷ (project Ch10) / tích hợp mã hoá qua `openHelperFactory` | Room 2.x mới nhất **2.8.4** (19/11/2025) — `openHelperFactory` **vẫn dùng được**; Room 2.7.0 (09/04/2025) thêm `setDriver()` + KMP; 2.8.0 thêm `room-sqlite-wrapper`/`getSupportWrapper()`. Room 3 = artifact riêng `androidx.room3:room3-*`, bản **3.0.2** (26/08/2026): bỏ `SupportSQLite`/`Cursor`, **bắt buộc `SQLiteDriver`** (`setDriver()`), không còn `openHelperFactory` | Room 2.x: đổi tên class thành `SupportOpenHelperFactory` + `password.toByteArray(Charsets.UTF_8)` (hướng dẫn chính thức không còn dùng `SQLiteDatabase.getBytes()`). Room 3: dùng `SQLCipherDriver` qua `setDriver()` — sqlcipher-android hỗ trợ cả Room 2 lẫn Room 3 từ 4.18.0 |
| `android:fullBackupContent` (file `backup_rules.xml`) | Chỉ áp dụng **Android 11 (API 30) trở xuống**. Android 12+ (API 31+) đọc `android:dataExtractionRules` — format `<data-extraction-rules>` với section `<cloud-backup>` / `<device-transfer>` / (`<cross-platform-transfer>` từ Android 16). App target 31+ **vẫn phải** khai `fullBackupContent` cho máy cũ. Cú pháp hai thế hệ khác nhau; app này giữ **cả hai** attribute trong manifest (dòng 7–8) | Khai cả hai; mỗi section chỉ áp kênh của nó (thiếu `<device-transfer>` = chuyển máy trực tiếp vẫn copy); `<exclude>` thắng `<include>`; khai `<include>` là tắt mặc định "backup tất cả"; cache/code-cache/no-backup bị loại trừ cứng |
| `Environment.getExternalStoragePublicDirectory()` | Deprecated từ API 29 (Scoped Storage); đường dẫn trả về thường không ghi được trên máy thật | `getExternalFilesDir()` (riêng app, không quyền) / MediaStore (ảnh/video) / SAF (tài liệu người dùng) |
| `startActivityForResult` | Deprecated; Activity Result API (`registerForActivityResult` + `CreateDocument`/`OpenDocument`/`OpenDocumentTree`) là cách hiện tại | Activity Result API; đăng ký lúc Activity khởi tạo, `launch()` lúc bấm |
| `KeyInfo.isInsideSecureHardware()` | Đúng tên là `isInsideSecureHardware()` (sách in `isInsideSecurityHardware()` — **không compile**); deprecated ở **API 31** thay bằng `getSecurityLevel()` (`KeyProperties.SecurityLevelEnum`: `TRUSTED_ENVIRONMENT` / `STRONGBOX`). Trên API ≤ 28 vẫn phải dùng hàm cũ. StrongBox: Android 9+, tuỳ thiết bị, kiểm `FEATURE_STRONGBOX_KEYSTORE`, fallback `StrongBoxUnavailableException` | Theo mốc API; kiểm hardware-backed lúc chạy, không giả định |
| (không phải thư viện) `SpoonacularService.kt:47` placeholder key trong source | Không đổi trong project; khuôn đúng đã dạy ở W3 (`keys.properties`) | Theo W3 |

### 3. Lệch giáo trình ↔ project — bản đồ sau khi dựng lại trang

Bản Ch11 trước đây giữ một bảng tổng hợp 15 điểm "sách nói X, code làm Y". Sau khi dựng lại thành hai
nửa X1/X2, mỗi điểm đã sống ở đúng vị trí sư phạm của nó (kèm cột **Phân loại**: VALID / VALID
ALTERNATIVE / REDUNDANT / HISTORICAL/VERSION DRIFT / BUG/RISK); bảng dưới chỉ còn là bản đồ tra nhanh
— nội dung đầy đủ ở mục được trỏ:

| # | Điểm | Nơi dạy bây giờ |
|---|---|---|
| 1 | "getSystemService phải trên main thread" — đảo chiều | bài X1 (Files, SAF & Backup) mục 3.3 (BUG/RISK) |
| 2 | `context.cacheDir`/`context.filesDir` trong Activity — không compile | bài X1 mục 3 (BUG/RISK) |
| 3 | `getExternalStoragePublicDirectory()` như cách dùng được | bài X1 mục 6 (HISTORICAL/VERSION DRIFT) — chi tiết drift ở mục 2 bảng trên |
| 4 | `startActivityForResult` + Note không có code mới | bài X1 mục 7.3 (HISTORICAL/VERSION DRIFT) |
| 5 | `isInsideSecurityHardware()` + mốc API 28/29 | bài X2 (Mã hoá) mục 9.1 (BUG/RISK) — chi tiết ở mục 2 bảng trên |
| 6 | Nối dây đặt trong MainActivity | bài X2 mục 14 (VALID ALTERNATIVE — project đặt RecipeApp.onCreate đúng hơn) |
| 7 | `PASSCODE_KEY` trần | bài X2 mục 14 (BUG/RISK) |
| 8 | `prefs = SecurePrefs(this)` sau khi chính sách đổi tên `securePrefs` | bài X2 mục 12 (BUG/RISK — tự mâu thuẫn) |
| 9 | Đổi tên database `"Recipes"` → `"recipe_database"` âm thầm | bài X2 mục 13.3 (BUG/RISK — mất dữ liệu im lặng) |
| 10 | `getPassCode()` dùng `kotlin.random.Random`, chỉ a–z (~70 bit) | bài X2 mục 13.1 (BUG/RISK — SecureRandom + 62 ký tự ≈ 89 bit) |
| 11 | Passcode `String` rồi `toCharArray()` — lợi ích CharArray bị vô hiệu | bài X2 mục 13.1 (REDUNDANT) |
| 12 | `allowBackup="true"` + mọi backup rule bị comment → bẫy backup | bài X1 mục 8.5 + bài X2 mục 15 (BUG/RISK — javadoc ESP cảnh báo) |
| 13 | 5 version bump không liên quan trong toml | bài X2 mục 10 (VALID ALTERNATIVE — chỉ cần biết khi đối chiếu) |
| 14 | Import/file/dòng code chết (RecipeApp imports 38–39, Prefs.kt không ai gọi, ShowRecipeList import LocalContext, IngredientDao dòng trống, MainScreen null-check luôn đúng) | bài X2 mục 12.1 + bảng mục 17 (REDUNDANT; riêng null-check là thay đổi hành vi) |
| 15 | API key placeholder trong source | bảng mục 17 của bài X2 (BUG/RISK) — khuôn đúng là W3 |

### 4. Ghi chú lịch sử riêng

- **"SharedPreferences deprecated"**: tương tự ghi chú Ch09 — giáo trình nói chung chung; class
  `SharedPreferences` của SDK **không** bị đánh dấu `@Deprecated`. Cái bị deprecated toàn bộ là
  `security-crypto` (2025). Trong Ch11, việc quay về `SharedPreferences` là đánh đổi để có mã hoá
  (đã dạy trong bài X2 mục 12), không phải hệ quả của một lệnh deprecate.
- **Backup trap** (điểm 12) là phần khoá học tự bổ sung — không có trong giáo trình; nguồn hậu thuẫn
  là javadoc `EncryptedSharedPreferences` (mục WARNING) + tài liệu Auto Backup.

