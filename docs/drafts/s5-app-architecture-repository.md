# S5 — Kiến trúc app: tầng UI, tầng dữ liệu, và repository

> **TRẠNG THÁI: DRAFT NỘI BỘ CHO BÀI HỌC TƯƠNG LAI.** File này KHÔNG phải trang site.
> Khi dựng bài chính thức (task IMP-046 trong `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`),
> nội dung học là phần "Bài học" phía dưới. Bốn mục cuối file — "Editorial migration notes",
> "Editorial open questions", "Final readability-test inventory", "Sources for future Nguồn block" —
> là **nội dung biên tập nội bộ, KHÔNG đưa cho người học** và không được để lọt vào trang bài học.
>
> **Vị trí trong khoá:** Giai đoạn 3 (State & kiến trúc), bài **5/5** — ngay sau S4 (ViewModel & UI state),
> **trước** N1–N2 (điều hướng), **trước** giai đoạn Mạng (W1–W3) và giai đoạn Dữ liệu cục bộ (D1–D2, R1–R4).
> Phân loại **Lõi**. Thời lượng tham khảo ~25 phút — con số này chỉ để tham khảo, không phải hạn mức cắt nội dung.
>
> **Đánh số mục:** draft dùng `Phần 1…19`; khi dựng trang, `Phần k` → `mục k`, bắt đầu lại từ 1.
> ⚠ **Drift đã phát hiện:** S1 draft ghi "batch tách Ch06 → S2–S4 tiếp nối từ **mục 14**", nhưng bản Ch06 đã
> restructure (commit `5d28f85`) thực tế đánh số **1–19** trong một trang gộp. Quy ước đang chạy thật là
> **mỗi bài đánh số lại từ 1**; S5 theo quy ước đó. Xem "Editorial open questions" #1.
>
> **Phạm vi:** bài này dạy **mô hình kiến trúc** (tầng UI / tầng dữ liệu) và **repository như một biên giới**.
> Cố tình **không** dạy: Room (R1–R4), Retrofit/JSON (W2), DataStore (D1–D2), Hilt/Dagger/Koin (D2 lo phần
> wiring thật), toán tử Flow · cold/hot · `SharedFlow` (W1), kiến trúc loading/error của tầng mạng (W3),
> offline-first và Ditto (O1/AP2), test và fake sâu (O2), use-case/domain layer sâu, SOLID, dependency
> inversion, Clean Architecture. Bài này cũng **không** dạy lại `StateFlow`/`stateIn`/`collectAsStateWithLifecycle`
> — S4 đã dạy, ở đây chỉ dùng lại.
>
> **Ngân sách nhấn mạnh:** **4 callout** (Phần 2 mô hình trực quan · Phần 5 ghi chú chính xác · Phần 6 ghi chú
> chính xác · Phần 13 đọc cú pháp) và **6 checkpoint** — đúng hạn mức ≤4 callout của template.
> Toàn bộ code trong bài là **ví dụ tối giản do khoá dựng**, không trích `aaf-materials/`: app mẫu chưa có
> repository ở giai đoạn này, và mọi repository thật trong project mẫu đều dính Room/Ditto (chưa được dạy).

---

# Bài học

## Mục tiêu — sau bài này bạn sẽ

- Chỉ ra được **hai vùng trách nhiệm** của một app: tầng UI (giao diện + state của màn hình) và tầng dữ liệu
  (dữ liệu của app + cách lấy nó) — và nói được vùng nào được biết về vùng nào.
- Trả lời được câu hỏi S4 cố tình để lại: **ViewModel lấy dữ liệu từ đâu**, và vì sao nó *không nên* biết dữ
  liệu ấy đến từ bộ nhớ, từ file, từ database hay từ mạng.
- Giải thích được **repository tồn tại để làm gì**: một biên giới mà phần trên của app đi qua để hỏi dữ liệu —
  không phải "một class database", không tự động là "nguồn đáng tin duy nhất".
- Nói được ranh giới trách nhiệm: **repository cung cấp DỮ LIỆU, ViewModel biến dữ liệu thành UI STATE** — và
  vì sao trộn hai việc đó là lỗi kiến trúc, không phải chuyện thẩm mỹ.
- Đọc được một đoạn code có repository + ViewModel và chỉ ra từng mảnh: hợp đồng, bản cài đặt, dependency được
  đưa vào từ ngoài, `suspend` và `viewModelScope` (S1), `StateFlow`/UiState (S4).
- Bác bỏ được bốn niềm tin sai hay gặp: "app Android phải có đúng năm lớp" · "repository = database" ·
  "repository luôn là nguồn đáng tin" · "càng nhiều lớp và interface thì kiến trúc càng tốt".

**Tại sao điều này quan trọng khi làm Android.** Hai giai đoạn sắp tới đều là *cùng một việc*: đưa dữ liệu thật
vào màn hình bạn đã biết dựng. W2 lấy dữ liệu từ mạng, R3 lấy dữ liệu từ database trên máy. Nếu biên giới trong
bài này được đặt đúng từ bây giờ, cả hai giai đoạn đó chỉ là "thay một bản cài đặt ở tầng dưới"; nếu không, mỗi
lần đổi nguồn dữ liệu bạn phải sửa lại chính màn hình đang chạy tốt.

**Cần biết trước:**

- **S4** — ViewModel, `data class ChatUiState`, cặp `MutableStateFlow`/`StateFlow`, `collectAsStateWithLifecycle()`,
  `stateIn`. Bài này *dùng lại* chúng như công cụ, không dạy lại.
- **S1** — `suspend`, `viewModelScope`, `launch`, `Flow` là gì. Đặc biệt cần nhớ: `suspend` **không** có nghĩa
  "chạy ở thread nền".
- **F2** — `data class`, đọc kiểu `Hộp<Loại-bên-trong>` (`List<Message>`), `class X(val y: Y)`.
- **F1** — hàm và tham số, `listOf`, `map` trên một danh sách.

**Chưa cần biết:** Room (bài **R1–R4**), Retrofit/JSON (bài **W2**), DataStore (bài **D1–D2**), Hilt/Dagger/Koin
(chỉ được nêu tên ở Phần 14; cách nối dây thật ở bài **D2**), toán tử Flow (bài **W1**), kiến trúc trạng thái
mạng (bài **W3**), offline-first (bài **O1**), viết test (bài **O2**). Ở đây chúng chỉ xuất hiện dưới dạng *tên*,
luôn kèm nhãn "sẽ học ở bài nào".

---

## Phần 1 — Câu hỏi mà S4 cố tình để lại

### Vấn đề trước cú pháp

Hết S4, bạn đã dựng được một màn hình đàng hoàng: ViewModel giữ state của màn hình, phơi ra một
`StateFlow<ChatUiState>`, giao diện đọc state đó bằng `collectAsStateWithLifecycle()` và tự vẽ lại khi state đổi.
Chiều sự kiện cũng rõ: người dùng chạm → composable gọi một hàm của ViewModel → ViewModel đổi state.

Nhưng có một chỗ trong bức tranh đó bị để trống, và S4 nói thẳng là để trống có chủ ý: **dữ liệu đến từ đâu?**
Mọi ví dụ ở S4 đều lấy dữ liệu từ một hàm giả hoặc một danh sách mẫu. Đây là bài trả lời câu đó.

Cách trả lời *sai* — và là cách người mới hay làm — là để ViewModel tự lo hết:

```kotlin
// Ví dụ CỐ TÌNH viết sai kiến trúc, chỉ để đọc. Đây không phải khuôn để dùng.
class ChatViewModel : ViewModel() {

  private val _uiState = MutableStateFlow(ChatUiState())
  val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

  fun refresh() {
    viewModelScope.launch {
      val fromMemory = memoryCache.loadMessages()    // dữ liệu đang giữ trong bộ nhớ
      val fromDisk = localStore.loadMessages()       // dữ liệu đã lưu trên máy
      val fromNetwork = httpClient.loadMessages()    // dữ liệu lấy qua mạng
      // ...rồi ViewModel tự quyết: dùng cái nào? trộn thế nào? cái nào được ưu tiên?
    }
  }
}
```

(`memoryCache`, `localStore`, `httpClient` là tên bịa để minh hoạ — không phải thư viện thật.)

Đoạn code trên *chạy được*. Vấn đề không nằm ở chỗ nó chạy hay không, mà ở chỗ nó **gộp hai việc chẳng liên quan
gì nhau vào cùng một file**: một là "màn hình chat trông thế nào", hai là "dữ liệu của app được lấy ra bằng cách
nào". Hệ quả rất cụ thể:

> **Mỗi lần *cách lấy dữ liệu* thay đổi, bạn phải mở đúng cái file đang giữ *logic của màn hình* ra sửa.**

Thêm một lớp cache, đổi từ mạng sang máy, ghép hai nguồn lại — việc nào cũng buộc bạn chạm vào `ChatViewModel`,
tức là chạm vào chỗ đang chịu trách nhiệm cho những thứ hoàn toàn khác: state nào hiện lên, sự kiện nào đổi state
nào. Sửa một chuyện, rủi ro làm hỏng chuyện kia.

Cái chúng ta muốn là một **biên giới**: một chỗ cắt ngang, để phía trên chỉ cần *hỏi dữ liệu*, còn *chuyện lấy dữ
liệu bằng cách nào* nằm hết ở phía dưới. Biên giới đó có tên: **repository**.

---

## Phần 2 — Hai vùng trách nhiệm, không phải "năm lớp bắt buộc"

Trước khi nói repository, phải dựng đúng bức tranh lớn — vì hầu hết nhầm lẫn về kiến trúc Android đến từ việc
người học nhớ *số lớp* thay vì nhớ *ai chịu trách nhiệm gì*.

Một app Android được khuyến nghị chia thành **hai vùng trách nhiệm**:

| Vùng | Chịu trách nhiệm | Ví dụ trong app chat của khoá |
|---|---|---|
| **Tầng UI** | Hiển thị dữ liệu ra màn hình; nhận sự kiện của người dùng; giữ state của màn hình | các composable · `ChatViewModel` · `ChatUiState` |
| **Tầng dữ liệu** | Dữ liệu của app đến từ đâu, được lấy/ghi bằng cách nào, và các quy tắc nghiệp vụ quanh nó | `MessageRepository` · `MessageDataSource` |

Có một vùng thứ ba **không bắt buộc**: **tầng domain**, đặt giữa hai tầng trên, dùng khi một đoạn logic nghiệp vụ
phức tạp hoặc bị nhiều ViewModel dùng lại. Bài này chỉ cần bạn *nhận ra tên nó tồn tại* — tài liệu chính thức nói
rõ tầng này là tuỳ chọn và chỉ nên thêm khi thật cần. Chúng ta không dùng nó.

Đường đi cụ thể của một lời hỏi dữ liệu, từ trên xuống:

```
Composable  →  ChatViewModel  →  MessageRepository  →  MessageDataSource
   (UI)          (UI)                (dữ liệu)              (dữ liệu)
```

> **Mô hình trực quan — hai vùng, không phải năm tầng**
>
> Hình dung một cửa hàng. **Tầng UI** là mặt tiền: cách trưng bày, bảng giá, khách hỏi gì thì trả lời thế nào.
> **Tầng dữ liệu** là kho phía sau: hàng nằm ở kệ nào, hết thì nhập từ đâu, hàng nào là hàng mới nhất.
> **Repository** là cái quầy giữa hai bên: mặt tiền đặt yêu cầu ở quầy và nhận hàng ở quầy.
>
> Điều đáng nhớ nhất của ẩn dụ này: mặt tiền **không cần biết** món hàng vừa lấy từ kệ trong kho hay vừa nhập về sáng
> nay. Và kho **không cần biết** hôm nay mặt tiền đang trưng bày theo kiểu gì. Đổi nhà cung cấp thì mặt tiền không phải
> đổi gì; đổi cách trưng bày thì kho không phải đổi gì.

### "Đúng năm lớp" không phải một luật

Bạn sẽ gặp rất nhiều tài liệu (kể cả các phần sau của khoá này) liệt kê kiến trúc thành một danh sách 4–5 mục:
*persistence → model → abstraction → business logic → UI*. Danh sách đó **hữu ích như một cách chia trách nhiệm**,
nhưng nó **không phải** một quy định kiểu "mọi app Android phải có đúng năm lớp, thiếu một lớp là sai".

Nói cho chính xác:

- Hướng dẫn kiến trúc chính thức của Android yêu cầu **tối thiểu hai tầng** — UI và dữ liệu. Tầng domain là
  *tuỳ chọn*.
- Trên đường từ composable xuống nguồn dữ liệu **có thể** có nhiều class: một ViewModel, một repository, một hay
  vài data source, có thể thêm một class dịch dữ liệu. Con số đó phụ thuộc app, không phụ thuộc một con số thánh.
- Cái *bất biến* không phải số lớp, mà là **chiều phụ thuộc** và **ai được biết về ai** (Phần 8).

Một hệ quả thực dụng đi kèm: **đừng dựng app theo từng lớp một.** Cách nghe hợp lý nhất với người mới — viết xong
*hết* tầng dữ liệu, rồi *hết* repository, rồi *hết* ViewModel, cuối cùng mới làm UI — cũng là cách khiến bạn viết
hàng chục hàm mà không chạy thử được gì; đến lúc nối lại mới phát hiện sai và không biết sai ở đâu. Cách làm được
khuyên: chọn **một tính năng** ("hiện danh sách tin nhắn"), làm xuyên qua đủ các vùng cho riêng nó, chạy thử, rồi
mới sang tính năng sau.

> **Tự kiểm tra 1.** Trong bốn thứ dưới đây, cái nào *không* thuộc tầng UI?
>
> 1. `ChatUiState` với field `isSending`
> 2. Quyết định "khi chưa có tin nhắn nào thì hiện dòng chữ 'Chưa có tin nhắn'"
> 3. Quyết định "nếu bộ nhớ đã có dữ liệu thì không đi lấy lại"
> 4. Hàm `onMessageSent(text)` của ViewModel
>
> *(Đáp án: 3. Đó là một quyết định về **cách lấy dữ liệu**, nên nó thuộc tầng dữ liệu — cụ thể là thuộc
> repository. Ba cái còn lại đều là chuyện của màn hình: 1 và 4 nằm trong ViewModel/UiState, 2 là một lựa chọn
> trình bày dựa trên state.)*

---

## Phần 3 — Tầng UI: bạn đã dựng xong nó ở S2–S4

Phần này không dạy gì mới, chỉ đặt lại tên cho những thứ bạn đã làm — vì từ bài này trở đi chúng sẽ được gọi là
"tầng UI".

Tầng UI chịu trách nhiệm bốn việc:

1. **Hiển thị state** — composable đọc `ChatUiState` và vẽ ra màn hình (S2).
2. **Nhận sự kiện** — người dùng chạm, gõ, quẹt; composable gọi hàm được truyền xuống (S3).
3. **Giữ state của màn hình** — `ChatViewModel` sở hữu state, sống qua thay đổi cấu hình (S4).
4. **Biến dữ liệu thành thứ hiển thị được** — từ dữ liệu thô ra `ChatUiState` mà giao diện dùng trực tiếp (Phần 10).

Và nó **không** chịu trách nhiệm biết dữ liệu được lấy ra bằng cách nào: không biết có mạng hay không, không biết
có database hay không, không biết dữ liệu có được lưu lại hay không.

Câu đó nghe như khẩu hiệu, nhưng có một cách **kiểm được bằng mắt**, và bạn nên dùng nó cả về sau: mở file
ViewModel, đọc danh sách `import` ở đầu file. Nếu trong đó xuất hiện tên của một công cụ lưu trữ hay một thư viện
mạng cụ thể, biên giới đã bị phá. ViewModel chỉ nên import: các model dữ liệu, hợp đồng repository, và những thứ
thuộc chính nó. Cùng cách đó theo chiều ngược lại: mở file ở tầng dữ liệu, nếu thấy import một composable, một
`Modifier`, hay một màu — biên giới cũng đã bị phá.

---

## Phần 4 — Tầng dữ liệu: "dữ liệu của app đến từ đâu?"

Tầng dữ liệu trả lời đúng một câu hỏi: **dữ liệu của app đến từ đâu, và được truy cập bằng cách nào?**

Trong tầng này có hai loại vai:

- **Data source** — một chỗ dữ liệu thực sự nằm, và cách nói chuyện với chỗ đó. Về mặt khái niệm, một app có thể
  lấy dữ liệu từ: **bộ nhớ** (giữ tạm trong lúc app đang chạy) · **file** trên máy · **database** trên máy ·
  **mạng**. Nguyên tắc đi kèm: mỗi data source chỉ nên lo **một** chỗ — một class vừa đọc mạng vừa đọc database
  là một class đã trộn hai việc.
- **Repository** — biên giới mà phần còn lại của app đi qua để hỏi tầng dữ liệu. Đây là nội dung chính của bài,
  từ Phần 5.

Tầng dữ liệu cũng là chỗ đặt **quy tắc nghiệp vụ** (business logic) của app — kiểu "tin nhắn cũ hơn 30 ngày thì
không tải nữa", "chưa đăng nhập thì danh sách trống". Bài này không đi sâu vào chủ đề đó; chỉ cần biết những quy
tắc như vậy *không* thuộc composable.

> **Bài này cố tình không dạy:** Room (thư viện database — bài **R1–R4**), Retrofit (thư viện gọi mạng — bài
> **W2**), DataStore (lưu thiết lập nhỏ — bài **D1–D2**). Đó là những **bản cài đặt cụ thể** của data source. Học
> chúng trước khi hiểu biên giới là học ngược: bạn sẽ nhớ cú pháp của một thư viện mà không biết nó nên nằm ở đâu
> trong app. Ở đây mọi data source đều là class Kotlin thường do khoá dựng, giữ dữ liệu trong bộ nhớ.

Một điểm chính xác cần chốt ngay, vì nó là gốc của rất nhiều nhầm lẫn về sau: **data source và repository là class
Kotlin bình thường**, không phải thành phần của Android. Không có `import android...` nào cho chúng, không có
annotation nào bắt buộc, hệ điều hành không biết chúng tồn tại. Đây là **cách tổ chức code**, không phải một API
bạn phải gọi cho đúng.

---

## Phần 5 — Repository: khái niệm trung tâm của bài này

### Vấn đề trước cú pháp

Phần 1 để lại một yêu cầu: phía trên chỉ được *hỏi dữ liệu*, không được biết dữ liệu lấy bằng cách nào. Muốn vậy
thì phải có một chỗ **nhận câu hỏi** và **giữ toàn bộ chi tiết ở phía sau nó**.

Đó là repository:

> **Repository là biên giới — một tập hợp hàm có tên rõ ràng — mà phần còn lại của app đi qua để hỏi tầng dữ liệu.**
> Phía trên gọi hàm theo *nhu cầu* ("cho tôi danh sách tin nhắn"). Việc nhu cầu đó được đáp ứng *bằng cách nào* là
> chuyện bên trong repository.

Một repository **có thể** làm những việc sau — và đây là danh sách nên nhớ, vì nó chính là lý do nó tồn tại:

| Việc | Nghĩa là gì trong thực tế |
|---|---|
| **Che nguồn dữ liệu** | Phía trên không biết dữ liệu đến từ bộ nhớ, file, database hay mạng |
| **Điều phối nhiều nguồn** | Một hàm có thể đọc hai nguồn, so sánh, chọn cái mới hơn, xử lý khi hai nguồn không khớp |
| **Phơi dữ liệu ở dạng hữu ích cho người gọi** | Người gọi nhận một `List<Message>` gọn gàng, không phải dữ liệu thô của một nguồn cụ thể |
| **Gom các quyết định về dữ liệu vào một chỗ** | "Khi nào tải lại", "có dùng cache không", "ghi rồi có tải lại không" — nằm ở đây, không rải khắp các màn hình |
| **Gói nhiều bước thành một** | "Xoá một tin nhắn" trong thực tế có thể là 2–3 bước; phía trên chỉ gọi một hàm |

Hai dòng cuối bảng là chỗ người mới hay bỏ qua, nên nói kỹ hơn một chút. Khi mới đọc code thật, bạn sẽ thấy **rất
nhiều hàm repository chỉ có một dòng**: `loadMessages()` chỉ gọi xuống một hàm của data source rồi trả về. Thắc mắc
tự nhiên là: *vậy thêm lớp này để làm gì, sao không gọi thẳng?*

Câu trả lời không nằm ở nội dung hàm, mà nằm ở **ai được nhìn thấy cái gì**. Một hàm một dòng vẫn đang làm ba việc:

1. Nó giữ cho ViewModel **không** phải import bất cứ thứ gì thuộc nguồn dữ liệu.
2. Nó tạo ra **chỗ để thay đổi sau này** — ngày mai hàm đó đọc hai nguồn thay vì một, phía trên không hay biết.
3. Nó cho phép phía trên nói *ý muốn* ("xoá tin nhắn này") thay vì phải tự biết ý muốn đó gồm mấy bước.

> **Ghi chú quan trọng — repository KHÔNG phải là gì**
>
> Đây là chỗ dễ hiểu sai nhất của cả bài, nên nói thẳng cả năm điều:
>
> - Repository **không phải** "một class database". Nó có thể chẳng liên quan gì tới database.
> - Repository **không phải** "một class gọi mạng".
> - Repository **không phải** "một lớp bọc mỏng quanh một API lưu trữ" — bọc mỏng chỉ là *hình dạng thường thấy*,
>   không phải *định nghĩa*.
> - Repository **không tự động** là "nguồn đáng tin duy nhất" của dữ liệu (Phần 6 nói riêng về chuyện này).
> - Repository **không phải** một thành phần của Android. Không annotation, không vòng đời, không đăng ký ở đâu.
>   Nó là một class Kotlin thường, tồn tại vì *bạn* quyết định đặt biên giới ở đó.
>
> Cách nhớ theo trách nhiệm: **repository là một biên giới trong code của bạn, không phải một món đồ của
> framework.**

> **Tự kiểm tra 2.** Một app chỉ có duy nhất một nguồn dữ liệu là bộ nhớ, và chắc chắn sẽ không bao giờ đổi. Câu nào
> đúng?
>
> 1. Không cần repository, vì repository chỉ có ý nghĩa khi có nhiều nguồn.
> 2. Bắt buộc phải có repository, vì kiến trúc Android yêu cầu.
> 3. Repository vẫn có thể có ích, nhưng lý do phải là một lý do thật — ví dụ để ViewModel không dính vào chi tiết
>    nguồn dữ liệu, hoặc để gom các quyết định về dữ liệu lại một chỗ.
>
> *(Đáp án: 3. Câu 1 sai vì "che nguồn" và "gom quyết định" vẫn có giá trị với một nguồn duy nhất. Câu 2 sai vì
> không có yêu cầu bắt buộc nào như thế — thêm một class chỉ để "đúng kiến trúc" là cạm bẫy (c) ở cuối bài.)*

---

## Phần 6 — "Nguồn đáng tin" (source of truth): nói cho đúng

Bạn sẽ gặp câu này rất nhiều: *"repository là single source of truth của app"*. Câu đó nghe gọn, dễ nhớ, và **không
chính xác** — nhớ sai ở đây dẫn tới một loạt quyết định sai về sau, nên phần này đi chậm.

Ý tưởng đúng gồm hai mảnh, và phải giữ cả hai:

**Mảnh 1 — mỗi loại dữ liệu nên có một nguồn đáng tin rõ ràng.** Khi app có một loại dữ liệu (tin nhắn, danh sách
bạn bè, thiết lập), phải trả lời được: *bản nào là bản đúng?* Nếu cùng một tin nhắn tồn tại ở ba chỗ và không chỗ
nào được coi là bản chuẩn, app sẽ có bug kiểu "màn hình A hiện cái này, màn hình B hiện cái khác" — loại bug rất khó
tìm.

**Mảnh 2 — repository thường là chỗ *kiểm soát đường vào* nguồn đáng tin đó, chứ không tự động *là* nguồn đó.**
Repository là nơi quyết định "lấy bản nào là bản đúng" và, khi có nhiều nguồn, là nơi xử lý lúc chúng không khớp.
Nhưng bản dữ liệu đúng có thể nằm ở một data source, hoặc ở một chỗ giữ tạm trong bộ nhớ mà repository đang cầm.

Nói theo hướng dẫn kiến trúc chính thức: **mỗi repository xác định một nguồn đáng tin** cho loại dữ liệu nó phụ
trách; nguồn đó **có thể là một data source — ví dụ database — hoặc một bộ nhớ tạm bên trong repository**; và **hai
repository khác nhau trong cùng một app có thể có nguồn đáng tin khác nhau**.

> **Ghi chú quan trọng — ba câu nói sai và bản sửa**
>
> | Nói sai | Nói đúng |
> |---|---|
> | "Repository là nguồn đáng tin duy nhất." | "Repository *xác định* nguồn đáng tin cho loại dữ liệu nó phụ trách, và kiểm soát đường vào nguồn đó." |
> | "Nguồn đáng tin luôn là database." | "Nguồn đáng tin *có thể* là database, có thể là bộ nhớ tạm, có thể là nguồn trên mạng — tuỳ loại dữ liệu." |
> | "Có repository nghĩa là dữ liệu đã được lưu lại." | "Repository không nói gì về việc dữ liệu có được lưu bền hay không. `repository` ≠ `chỗ lưu trữ`." |
>
> Dòng cuối là điều quan trọng nhất cần mang ra khỏi phần này: **repository ≠ storage**. Một repository giữ dữ liệu
> trong bộ nhớ là một repository hoàn toàn hợp lệ — và đó chính là repository bạn sẽ đọc ở Phần 7.

Còn một trường hợp bạn sẽ nghe tên và nên biết trước, để khi gặp không hiểu sai: trong thiết kế **offline-first**
(app dùng được cả khi mất mạng), người ta thường chọn **database trên máy làm nguồn đáng tin**, còn repository làm
việc điều phối: lấy dữ liệu từ mạng về, ghi xuống database, và mọi màn hình đọc từ database. Chú ý điều đó *không*
biến repository thành database — repository vẫn là biên giới, database là nguồn. Thiết kế offline-first có ràng buộc
riêng và không thuộc bài này; nó là nội dung bài **O1**.

> **Tự kiểm tra 3.** App của bạn có `SettingsRepository` giữ thiết lập trong bộ nhớ (chưa lưu bền), và
> `MessageRepository` đọc tin nhắn từ mạng. Câu nào đúng?
>
> 1. Sai kiến trúc: mọi repository trong một app phải dùng cùng một loại nguồn đáng tin.
> 2. Hợp lệ: hai repository phụ trách hai loại dữ liệu khác nhau, nên nguồn đáng tin của chúng có thể khác nhau.
> 3. Hợp lệ, nhưng `SettingsRepository` không được gọi là repository vì nó chưa lưu dữ liệu xuống máy.
>
> *(Đáp án: 2. Câu 3 mắc đúng cái bẫy `repository = storage`: "repository" nói về **biên giới**, không nói về **chỗ
> lưu**.)*

---

## Phần 7 — Ví dụ tối giản: Kotlin thường, không thư viện nào

Đủ lý thuyết. Đây là toàn bộ tầng dữ liệu của một app chat ở dạng nhỏ nhất còn có nghĩa. Không Room, không Retrofit,
không thư viện nào — chỉ Kotlin.

**Bước 1 — model dữ liệu.** Một `data class` (F2) mô tả một tin nhắn ở dạng tầng dữ liệu làm việc với nó:

```kotlin
data class Message(
  val id: String,
  val text: String,
  val senderId: String
)
```

**Bước 2 — repository.** Một class thường, giữ dữ liệu trong bộ nhớ, phơi ra đúng một hàm:

```kotlin
class MessageRepository {

  private val messages = listOf(
    Message(id = "1", text = "Chào cả nhà", senderId = "u1"),
    Message(id = "2", text = "Chào bạn", senderId = "u2")
  )

  suspend fun loadMessages(): List<Message> {
    return messages
  }
}
```

Đọc từng mảnh:

| Mảnh | Nghĩa là gì |
|---|---|
| `class MessageRepository` | Tên nói **nó phụ trách dữ liệu gì** (`Message`), không nói nó lấy dữ liệu bằng cách nào. Cách đặt tên này là cố ý — xem đoạn ngay dưới bảng. |
| `private val messages` | `private` (mới, chưa gặp ở F1/F2) nghĩa là **chỉ code bên trong class này đọc được** thuộc tính đó. Bên ngoài không thấy `messages`, chỉ thấy `loadMessages()`. |
| `suspend fun loadMessages()` | Hàm có thể tạm dừng rồi tiếp tục (S1). Ở đây nó trả về ngay — và như S1 đã nói, `suspend` **không** có nghĩa "hàm này chậm" hay "hàm này chạy ở thread nền". Phần 15 nói riêng về lựa chọn này. |
| `List<Message>` | Đọc theo khuôn `Hộp<Loại-bên-trong>` của F2: một danh sách các `Message`. |

Về cái tên: class này đang giữ dữ liệu trong bộ nhớ, nhưng tên nó **không** chứa chữ "InMemory". Đó là chủ ý — tên
của một biên giới nên nói *nó phụ trách gì*, không nói *nó làm bằng cách nào*, vì "làm bằng cách nào" là thứ được
phép đổi. (Phần 13 sẽ tách cái tên này ra khỏi bản cài đặt một cách gọn gàng.)

**Bước 3 — ViewModel dùng repository.** Đây là chỗ hai tầng gặp nhau:

```kotlin
class ChatViewModel(
  private val repository: MessageRepository
) : ViewModel() {

  private val _uiState = MutableStateFlow(ChatUiState())
  val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

  fun refresh() {
    viewModelScope.launch {
      val messages = repository.loadMessages()              // dữ liệu
      _uiState.value = _uiState.value.copy(
        messages = toUiModels(messages)                     // → UI state (Phần 12)
      )
    }
  }
}
```

Ba dòng đầu là điểm quan trọng nhất của cả bài:

> **`ChatViewModel` phụ thuộc vào *thứ nó cần* (một chỗ để hỏi tin nhắn), không phụ thuộc vào *cách dữ liệu được
> lấy*.** Trong cả file `ChatViewModel`, không có một dòng nào nói dữ liệu đến từ bộ nhớ.

Còn lại đều là những thứ bạn đã học:

| Mảnh | Đã học ở đâu |
|---|---|
| `private val repository: MessageRepository` trong constructor | `class X(val y: Y)` là F2; `private` vừa gloss ở trên; *ai truyền `repository` vào* là Phần 14 |
| `: ViewModel()` | S1 đã gloss dấu `:` ở đây ("class này **là một** ViewModel"); ViewModel là gì: S4 |
| cặp `_uiState` / `uiState`, `copy(...)` | S4 — ai được ghi, ai chỉ được đọc |
| `viewModelScope.launch { }` | S1 — công việc này thuộc ViewModel, ViewModel bị dọn thì nó bị huỷ |
| `repository.loadMessages()` gọi được vì đang ở trong `launch` | S1 — hàm `suspend` phải được gọi từ trong một coroutine |
| `toUiModels(messages)` | **chưa học** — một hàm dịch dữ liệu sang dạng giao diện cần; Phần 12 |

Chú ý một chuyện nhỏ nhưng có ý nghĩa: bên trong `refresh()` **không có** `withContext(Dispatchers.IO)`. Đó không
phải thiếu sót — Phần 15 giải thích vì sao.

---

## Phần 8 — Chiều phụ thuộc: ai được biết về ai

Đây là phần *bất biến* của kiến trúc — thứ bạn phải giữ, bất kể app có bao nhiêu class.

```
   Composable            ← tầng UI
        │
        ▼  phụ thuộc
   ChatViewModel         ← tầng UI
        │
        ▼  phụ thuộc
   MessageRepository     ← tầng dữ liệu (biên giới)
        │
        ▼  phụ thuộc
   MessageDataSource     ← tầng dữ liệu (chỗ dữ liệu thật nằm)
```

Mũi tên trong sơ đồ trên có nghĩa **"phụ thuộc vào"**: composable phụ thuộc ViewModel, ViewModel phụ thuộc
repository, repository phụ thuộc data source. Và quy tắc chỉ có một dòng:

> **Tầng dưới không bao giờ với tay lên tầng trên.** Repository không được biết ViewModel nào đang gọi nó, cũng
> không được biết màn hình nào đang mở. Data source không được biết có repository nào đang dùng nó.

Bảng để kiểm nhanh khi đọc code thật:

| Thành phần | Được phép biết về | Không được biết về |
|---|---|---|
| Composable | UiState và các hàm được truyền vào | repository · data source · chi tiết lưu trữ hay mạng |
| ViewModel | hợp đồng repository · model dữ liệu | composable · `Modifier` · màu · resource của màn hình |
| Repository | data source · model dữ liệu | ViewModel · UI |
| Data source | chỗ dữ liệu nằm (bộ nhớ/file/database/mạng) | repository · ViewModel · UI |

### Một chỗ dễ lẫn với S3: "xuống" và "lên" là hai trục khác nhau

S3 dạy *"giá trị đi xuống, sự kiện đi lên"* — đó là nói về **cây composable**: composable cha giữ state nên state
đi xuống con, sự kiện đi lên cha. Bài này lại vẽ tầng dữ liệu ở **dưới** tầng UI, nên dữ liệu đi **lên** phía màn
hình. Hai cách nói không mâu thuẫn, chỉ là hai cách vẽ hình. Điều bất biến, phát biểu cho khỏi lẫn:

- **State/dữ liệu đi từ chỗ sở hữu nó ra phía màn hình.**
- **Sự kiện đi ngược lại, về phía chỗ sở hữu.**

Từ "xuống" hay "lên" phụ thuộc bạn vẽ hình thế nào; hai câu trên thì không.

Cuối cùng, một lời rào đúng lúc: quanh chủ đề "chiều phụ thuộc" có một rừng lý thuyết với những cái tên nghe nặng —
dependency inversion, use case/interactor, SOLID, Clean Architecture. Bạn **không cần** chúng để viết đúng app trong
khoá này, và bài này cố tình không mở chúng ra. Bốn dòng của cái bảng trên là đủ để đi hết khoá.

---

## Phần 9 — Vì sao không gọi thẳng nguồn dữ liệu từ ViewModel

Đến đây bạn đã biết repository *là gì*. Phần này chứng minh nó *đáng giá* — bằng một tình huống thay đổi yêu cầu,
loại tình huống xảy ra trong mọi project thật.

Kịch bản: cùng một màn hình chat, ba mốc thời gian.

**Mốc 1 — hôm nay.** Tin nhắn lấy từ bộ nhớ (dữ liệu mẫu), đúng như Phần 7.

**Mốc 2 — một tháng sau.** Có server thật, tin nhắn phải lấy qua mạng.

**Mốc 3 — ba tháng sau.** Mạng chậm, cần giữ lại bản vừa tải để mở màn hình lần sau hiện ra ngay.

Bây giờ so hai cách tổ chức. **Cách A**: `ChatViewModel` tự gọi nguồn dữ liệu, như đoạn code sai ở Phần 1.
**Cách B**: có `MessageRepository` ở giữa, như Phần 7.

| Yêu cầu mới | Cách A — ViewModel tự lo | Cách B — có repository |
|---|---|---|
| Mốc 2: đổi bộ nhớ → mạng | Sửa `ChatViewModel` — file đang giữ state của màn hình | Sửa bên trong `MessageRepository`. `ChatViewModel` không đổi một dòng |
| Mốc 3: thêm bản giữ tạm | Thêm logic "có bản cũ chưa / bản cũ còn dùng được không" vào `ChatViewModel`, chen giữa logic màn hình | Thêm vào `MessageRepository`. `ChatViewModel` vẫn không đổi |
| Sửa bug "đôi lúc hiện dữ liệu cũ" | Đọc file `ChatViewModel` đang trộn hai chủ đề để tìm | Đọc `MessageRepository` — file chỉ nói về dữ liệu |

Ở Cách B, tầng dữ liệu tiến hoá như sau. Mốc 2 — repository nhận vào một data source thay vì tự giữ danh sách:

```kotlin
class MessageRepository(
  private val remote: RemoteMessageDataSource
) {

  suspend fun loadMessages(): List<Message> {
    return remote.fetchMessages()
  }
}
```

Mốc 3 — thêm chỗ giữ tạm, và quyết định "dùng bản nào" nằm hẳn trong repository:

```kotlin
class MessageRepository(
  private val remote: RemoteMessageDataSource,
  private val cache: InMemoryMessageCache
) {

  suspend fun loadMessages(): List<Message> {
    val cached = cache.read()
    if (cached.isNotEmpty()) {
      return cached
    }
    val fresh = remote.fetchMessages()
    cache.write(fresh)
    return fresh
  }
}
```

Đoạn trên là bản phác thảo cố tình đơn giản: quyết định "khi nào bản giữ tạm hết hạn", "tải lại lúc nào" còn nhiều
câu hỏi nữa, và chúng thuộc bài **W3** (trạng thái tầng mạng) và **O1** (offline-first). Điều duy nhất cần thấy ở
đây là **những quyết định đó nằm ở đâu**: bên trong tầng dữ liệu.

Và đây là phần đáng giá nhất của cả kịch bản — file `ChatViewModel` qua cả ba mốc:

```kotlin
// Không đổi một dòng nào qua mốc 1 → 2 → 3.
fun refresh() {
  viewModelScope.launch {
    val messages = repository.loadMessages()
    _uiState.value = _uiState.value.copy(messages = toUiModels(messages))
  }
}
```

Nói cho chính xác, để bạn không kỳ vọng quá: hợp đồng giữa ViewModel và repository **vẫn có thể phải đổi** — ví dụ
khi màn hình cần biết "đang tải" để hiện vòng xoay, hoặc cần phân trang. Nhưng khi đó nó đổi vì **nhu cầu của màn
hình đổi**, chứ không phải vì **cơ chế lấy dữ liệu đổi**. Đó chính là thứ repository mua cho bạn: hai loại thay đổi
đó không còn kéo nhau.

> **Tự kiểm tra 4.** Yêu cầu mới: "khi mở lại app, hiện danh sách tin nhắn đã tải lần trước". Theo kiến trúc của
> bài này, quyết định *lấy bản đã lưu hay tải lại từ mạng* nên nằm ở đâu?
>
> 1. Trong composable, vì nó biết màn hình vừa mở.
> 2. Trong `ChatViewModel`, vì nó sở hữu state của màn hình.
> 3. Trong `MessageRepository`, vì đó là một quyết định về *cách lấy dữ liệu*.
>
> *(Đáp án: 3. Câu 2 là bẫy phổ biến nhất: ViewModel **kích hoạt** việc lấy dữ liệu (gọi `refresh()`), nhưng nó
> không nên là nơi chứa **chiến lược** lấy dữ liệu. Kích hoạt và chiến lược là hai chuyện khác nhau.)*

---

## Phần 10 — Nối lại S4: dữ liệu và UI state là hai thứ khác nhau

Giờ ghép đủ chuỗi, từ cú chạm của người dùng tới lúc màn hình đổi. Bốn bước giữa là nội dung mới của bài này; các
bước còn lại bạn đã có từ S3–S4:

```
người dùng chạm nút "Tải lại"          (UI — S3)
  → composable gọi viewModel.refresh()  (UI — S3)
    → ViewModel gọi repository.loadMessages()      ← mới
      → repository lấy dữ liệu từ data source      ← mới
      → dữ liệu quay về dưới dạng List<Message>    ← mới
    → ViewModel dựng ChatUiState mới               ← mới
  → StateFlow phát state mới             (S4)
→ collectAsStateWithLifecycle() nhận     (S4)
→ composable vẽ lại                      (S2)
```

Phần cần nói rõ, vì nó là một trong hai thông điệp chính của bài:

> **Repository cung cấp DỮ LIỆU. ViewModel biến dữ liệu đó thành UI STATE.**

Hai thứ đó không phải một, và bảng dưới đây cho thấy khác chỗ nào:

| | `MessageRepository` | `ChatViewModel` |
|---|---|---|
| Tạo ra cái gì | `List<Message>` — dữ liệu của app | `ChatUiState` — ảnh chụp của **một màn hình** |
| Biết về | các nguồn dữ liệu | màn hình: đang gửi dở gì, ai là người dùng hiện tại |
| **Không** biết về | có màn hình nào đang mở không | dữ liệu đến từ đâu |

Nhìn vào `ChatUiState` của S4 sẽ thấy ngay: ngoài `messages`, nó còn `currentUserId` và `isSending`. `isSending`
**không** phải dữ liệu do nguồn nào trả về — nó là một quyết định về màn hình ("đang gửi thì vô hiệu hoá nút gửi").
Hai field nằm cạnh nhau trong cùng một `data class`, nhưng đến từ hai nơi hoàn toàn khác nhau: một từ tầng dữ liệu,
một do ViewModel tự quyết. Đó là công việc riêng của ViewModel, và là lý do nó tồn tại.

Cơ chế `StateFlow` → `collectAsStateWithLifecycle()` không nhắc lại ở đây; S4 đã dạy đủ.

> **Tự kiểm tra 5.** Màn hình cần hiện dòng "Chưa có tin nhắn nào" khi danh sách rỗng. Ai chịu trách nhiệm cho câu
> chữ đó?
>
> 1. Repository — vì nó biết danh sách rỗng.
> 2. ViewModel/UI — repository chỉ trả về một danh sách rỗng, việc "danh sách rỗng thì hiện chữ gì" là chuyện của
>    màn hình.
> 3. Data source — vì nó là chỗ dữ liệu nằm.
>
> *(Đáp án: 2. Repository trả về "không có tin nhắn nào" ở dạng dữ liệu (một `List` rỗng). Biến sự thật đó thành
> chữ, thành hình, thành màu là việc của tầng UI. Nếu repository bắt đầu trả về chuỗi `"Chưa có tin nhắn nào"`, nó
> đã lấn sang tầng UI — Phần 11.)*

---

## Phần 11 — Repository không phải chỗ giữ state của giao diện

Đây là cạm bẫy đối xứng với cạm bẫy ở Phần 1. Ở Phần 1, ViewModel lấn xuống tầng dữ liệu. Ở đây, tầng dữ liệu lấn
lên tầng UI — và nó xảy ra rất tự nhiên, thường bắt đầu bằng một câu hợp lý: *"tiện thì để luôn ở repository cho các
màn hình dùng chung"*.

Bảng phân loại nhanh:

| Thứ này | Thuộc về | Vì sao |
|---|---|---|
| Danh sách tin nhắn | tầng dữ liệu | Là dữ liệu của app; nhiều màn hình có thể cần |
| Tin nhắn đang gửi dở đã gửi xong chưa | tầng dữ liệu | Là kết quả của một thao tác trên dữ liệu |
| Mục nào đang được mở rộng | tầng UI | Chỉ có nghĩa với một màn hình đang hiển thị |
| Tab nào đang được chọn | tầng UI | Như trên |
| Có đang hiện vòng xoay không | tầng UI | Vòng xoay là một cách *trình bày*, không phải dữ liệu |
| Chữ trong thanh thông báo (snackbar) | tầng UI | Câu chữ hiển thị cho người dùng |
| Đang ở màn hình nào | tầng UI | Điều hướng — bài **N1–N2** |

Cách phát biểu ranh giới cho khỏi cứng nhắc: repository **được phép** báo về trạng thái của *dữ liệu* — "đã có dữ
liệu", "chưa có gì", "lấy dữ liệu thất bại". Nhưng **ViewModel quyết định** những sự thật đó biến thành gì trên màn
hình: một vòng xoay, một dòng chữ xám, một nút "Thử lại", hay không hiện gì cả. Cùng một sự thật về dữ liệu, hai màn
hình khác nhau có thể trình bày hai kiểu — và đó chính là lý do quyết định trình bày không nên nằm chung một chỗ với
dữ liệu.

Dấu hiệu nhận biết khi đọc code: nếu trong file repository xuất hiện chuỗi văn bản dành cho người dùng, tên màu, tên
icon, hay một kiểu dữ liệu của Compose — nó đã lấn tầng.

---

## Phần 12 — Cùng một thứ, hai hình dạng (chỉ ở mức nhận diện)

Ở Phần 7 có một hàm chưa giải thích: `toUiModels(messages)`. Giờ trả nợ.

Nguyên tắc, phát biểu một câu:

> **Hai biên giới khác nhau có thể cần hai cách biểu diễn khác nhau cho cùng một thứ.**

Cụ thể trong ví dụ của bài: tầng dữ liệu làm việc với `Message`, còn giao diện — như S4 đã định nghĩa — hiển thị
`MessageUiModel` bên trong `ChatUiState`. Hai class cho "một tin nhắn", và đó không phải sự trùng lặp vô ích:

```kotlin
// Tầng dữ liệu: hình dạng do nguồn dữ liệu quyết định.
data class Message(
  val id: String,
  val text: String,
  val senderId: String
)

// Tầng UI: hình dạng do màn hình cần gì quyết định.
data class MessageUiModel(
  val text: String,
  val isFromMe: Boolean
)
```

Và hàm dịch, nằm trong `ChatViewModel`:

```kotlin
private fun toUiModels(messages: List<Message>): List<MessageUiModel> {
  val myUserId = _uiState.value.currentUserId
  return messages.map { message ->
    MessageUiModel(
      text = message.text,
      isFromMe = message.senderId == myUserId
    )
  }
}
```

Đọc kỹ chỗ này, vì nó là lý do cả Phần 12 tồn tại: **giao diện không cần `senderId`**. Cái nó cần là *"tin nhắn này
có phải của tôi không"* — để vẽ bong bóng chat lệch phải hay lệch trái. Và để trả lời câu đó thì phải biết "tôi" là
ai, tức là phải biết **bối cảnh của màn hình**. Repository không biết chuyện đó, cũng không nên biết. Vì vậy bước
dịch này thuộc tầng UI, và cụ thể là việc của ViewModel.

Đó là toàn bộ nguyên tắc bạn cần ở bài này. Phần sâu hơn được để dành, có chủ ý:

- Model của **tầng mạng** — hình dạng do server quyết định, bạn không được đổi: bài **W2**.
- Model của **tầng database** — hình dạng do bảng dữ liệu quyết định: bài **R2–R3**.
- Trường hợp đủ **ba** họ model cùng tồn tại trong một app (mạng · database · UI), với một file riêng chỉ để dịch
  qua lại, cùng những cái bẫy đi kèm: bài **R3**.

Một lời rào để bạn không suy diễn quá xa: nguyên tắc trên **không** phải "mỗi tầng luôn bắt buộc có model riêng".
Nếu hình dạng dữ liệu ở hai tầng thật sự giống nhau và không có lý do nào để chúng khác nhau, dùng chung một class
là hợp lý. Tách model là để *xử lý sự khác nhau có thật*, không phải để cho đủ tầng.

---

## Phần 13 — Hợp đồng và bản cài đặt

Ở Phần 7, `MessageRepository` là một class cụ thể. Biên giới đã có ngay từ lúc đó: `ChatViewModel` chỉ biết
`MessageRepository`, không biết dữ liệu nằm ở đâu. Phần này làm một bước nữa — biến biên giới đó thành một **hợp
đồng có tên riêng**.

```kotlin
interface MessageRepository {
  suspend fun loadMessages(): List<Message>
}

class InMemoryMessageRepository : MessageRepository {
  override suspend fun loadMessages(): List<Message> {
    return listOf(
      Message(id = "1", text = "Chào cả nhà", senderId = "u1"),
      Message(id = "2", text = "Chào bạn", senderId = "u2")
    )
  }
}
```

> **Đọc cú pháp — `interface`, `:` và `override`**
>
> Ba từ khoá mới, mỗi từ một câu, đủ để đọc đoạn code trên (Kotlin sâu hơn về chúng không thuộc khoá này):
>
> - **`interface`** — khai một **hợp đồng**: danh sách hàm mà ai nhận hợp đồng cũng phải có, nhưng ở đây *chưa* nói
>   làm bằng cách nào (chú ý trong `interface`, hàm không có thân hàm).
> - **`class A : B`** — "class `A` nhận hợp đồng `B`". Bạn đã gặp đúng dấu `:` này ở S1 với
>   `class ChatViewModel : ViewModel()`.
> - **`override`** — "đây là bản cài đặt cho một hàm mà hợp đồng đã khai". Từ khoá này bắt buộc trong Kotlin, và nó
>   có ích: quên nó thì trình biên dịch báo lỗi ngay thay vì để bạn tưởng đã cài đặt xong.
>
> Mô hình để nhớ: **`interface` = hợp đồng, class = một cách hoàn thành hợp đồng đó.** Một hợp đồng có thể có nhiều
> cách hoàn thành.

Cái tên cũng vừa đổi chỗ, và đây là chi tiết đáng để ý: `MessageRepository` — cái tên nói *phụ trách gì* — giờ thuộc
về **hợp đồng**. Bản cài đặt phải tự nhận một cái tên mô tả **cách nó làm**: `InMemoryMessageRepository`. Khi có bản
cài đặt thứ hai — chẳng hạn một bản giả để thử màn hình, `FakeMessageRepository` — nó cũng tự nhận tên riêng, còn hợp
đồng vẫn nguyên tên cũ. (Trong nhiều project, bản cài đặt "mặc định, dùng thật" được đặt tên
`DefaultMessageRepository` — gặp tên đó thì hiểu là quy ước này.)

Phần thưởng: **`ChatViewModel` không phải sửa một dòng nào.** Nó vẫn khai đúng như ở Phần 7:

```kotlin
class ChatViewModel(
  private val repository: MessageRepository   // giờ đây là tên của hợp đồng
) : ViewModel() { /* ... */ }
```

Ba lợi ích của việc tách hợp đồng ra, ở mức bạn dùng được ngay:

1. **Người gọi phụ thuộc vào một thứ ổn định.** `ChatViewModel` phụ thuộc vào một danh sách hàm, không phụ thuộc vào
   một cách làm cụ thể.
2. **Bản cài đặt được phép đổi**, kể cả đổi hoàn toàn, miễn giữ đúng hợp đồng.
3. **Có thể có một bản cài đặt "giả" (fake)** để thử màn hình khi chưa có server hay database thật — và về sau là để
   viết test (bài **O2**).

Và mặt còn lại, nói thẳng để bạn không cargo-cult: **một `interface` chỉ có duy nhất một bản cài đặt, và không có
bản thứ hai nào trong tầm nhìn, thì nó đang thêm một file và một lớp gián tiếp mà chưa mua được gì.** Biên giới thật
đã tồn tại từ Phần 7 rồi — nó đến từ việc *ai phụ thuộc vào ai*, không đến từ từ khoá `interface`. Quy tắc thực dụng:
tách hợp đồng khi bạn *thật sự* thấy có bản cài đặt thứ hai (một bản giả để thử, một nguồn dữ liệu khác đang tới), và
đừng tách chỉ vì "kiến trúc nói thế".

> **Tự kiểm tra 6.** `ChatViewModel` khai `private val repository: MessageRepository`, và `MessageRepository` là một
> `interface`. Lúc app chạy thật, `repository` là cái gì?
>
> 1. Chính `interface` đó — `interface` cũng chạy được.
> 2. Một object của một class nào đó nhận hợp đồng `MessageRepository`; ở phiên bản hiện tại là
>    `InMemoryMessageRepository`.
> 3. Không xác định được, tuỳ Android chọn.
>
> *(Đáp án: 2. `interface` không tạo được object; luôn phải có một class cài đặt nó. Câu 3 sai vì Android không dính
> gì tới việc này — **code của bạn** chọn, và Phần 14 nói chỗ chọn nằm ở đâu.)*

---

## Phần 14 — "Dependency được đưa từ ngoài vào"

Quay lại đúng một dòng, dòng đã xuất hiện ba lần trong bài:

```kotlin
class ChatViewModel(
  private val repository: MessageRepository
) : ViewModel()
```

Cách đọc dòng đó: **`ChatViewModel` không tự tạo repository của nó; repository được đưa vào từ bên ngoài.** Ở mức
bài này, hiểu được câu đó là đủ.

Vì sao khác biệt này quan trọng, so hai bản:

```kotlin
// ❌ ViewModel tự tạo bản cài đặt — biên giới gần như mất tác dụng
class ChatViewModel : ViewModel() {
  private val repository = InMemoryMessageRepository()
}

// ✅ Được đưa vào từ ngoài — ViewModel chỉ biết hợp đồng
class ChatViewModel(
  private val repository: MessageRepository
) : ViewModel()
```

Bản ❌ có vẻ tiện hơn, nhưng nó gọi tên một class cụ thể ngay trong file ViewModel: muốn đổi sang bản đọc từ mạng thì
lại phải sửa ViewModel — đúng thứ chúng ta bỏ cả bài này để tránh. Nó cũng khoá luôn khả năng đưa vào một bản giả để
thử màn hình.

Ý tưởng chung "một class nhận thứ nó cần từ bên ngoài thay vì tự tạo" có một cái tên bạn sẽ gặp nhiều:
**dependency injection**. Bài này chỉ giới thiệu đúng cái tên đó, không đi xa hơn.

Còn hai câu hỏi rất tự nhiên mà bài này *không* trả lời, và trả lời ở đâu:

- **Ai tạo `ChatViewModel` và truyền repository vào?** Trong Android, ViewModel có tham số trong constructor cần thêm
  một bước để tạo. Cách nối dây thật cho cả app — tạo repository ở đâu, ở đâu là "một lần cho cả app" — là nội dung
  bài **D2**.
- **Có thư viện nào làm việc nối dây đó tự động không?** Có (Hilt, Dagger, Koin). Bài **D2** có một ghi chú ngắn về
  chỗ chúng khớp vào; khoá này không dạy chúng, vì hiểu được biên giới quan trọng hơn nhiều so với biết cú pháp một
  thư viện DI.

---

## Phần 15 — `suspend` ở biên giới tầng dữ liệu

Hợp đồng của repository trong bài này là:

```kotlin
suspend fun loadMessages(): List<Message>
```

Theo đúng mô hình của S1: `suspend` ở đây nói **"việc này *có thể* phải tạm dừng chờ, rồi tiếp tục"**. Hết. Nó là
lời khai chính xác cho một biên giới dữ liệu, vì "chờ" là chuyện thường xuyên xảy ra ở tầng dữ liệu — chờ mạng, chờ
đọc từ máy.

Ba điều **không** được suy ra từ từ khoá đó, cả ba đều là nhầm lẫn phổ biến:

| Nhầm | Đúng |
|---|---|
| "`suspend` nghĩa là hàm này chạy ở thread nền." | Không. `suspend` **không chọn thread và không chọn dispatcher** (S1). Hàm chạy trong ngữ cảnh coroutine mà nó được gọi từ đó, trừ khi chính nó đổi ngữ cảnh. |
| "Repository tự lo chuyện chuyển việc sang thread nền." | Không tự động. Chỉ khi **bản cài đặt cụ thể** làm việc thật sự chặn thread thì chính nó mới có trách nhiệm chuyển đi. |
| "`suspend` nghĩa là hàm này chậm." | Không. Một hàm `suspend` có thể trả về ngay — như `InMemoryMessageRepository` ở Phần 13. |

Từ đó suy ra được câu trả lời cho chi tiết đã treo ở Phần 7: **vì sao `refresh()` không có
`withContext(Dispatchers.IO)`?** Vì bản cài đặt hiện tại đọc một danh sách có sẵn trong bộ nhớ — nó không chặn
thread, nên không có gì để chuyển đi. Thêm `Dispatchers.IO` vào đó là thêm một dòng không mua được gì, và tệ hơn: nó
dạy sai cho chính bạn rằng "gọi repository thì phải bọc IO".

Quy tắc trách nhiệm, đúng theo S1:

- Nếu **bản cài đặt** của bạn làm một việc thật sự chặn thread bên trong một hàm `suspend`, thì **chính bản cài đặt
  đó** dùng `withContext(...)` để chuyển việc đi — để người gọi không phải biết và không phải nhớ.
- Nếu bạn đang gọi một hàm `suspend` **của thư viện** và tài liệu của nó nói gọi được an toàn từ main thread, thì
  **đừng bọc thêm `IO`**.

Vì sao chốt điều này ngay bây giờ: khi tới bài **W2** và **R3**, bạn sẽ gặp code có `withContext(Dispatchers.IO)`
quanh những lời gọi tầng dữ liệu. Có chỗ cần, có chỗ là tàn dư của thói quen cũ. Người đã nắm quy tắc trên phân biệt
được hai loại đó; người học theo kiểu "thấy repository là bọc IO" thì không.

---

## Phần 16 — Hình dạng thứ hai: repository phát ra một dòng dữ liệu

Đến đây repository của chúng ta chỉ có một kiểu hàm: hỏi một lần, trả lời một lần. Còn một hình dạng nữa cần **nhận
ra** (chưa cần dùng):

```kotlin
interface MessageRepository {
  suspend fun loadMessages(): List<Message>        // hỏi một lần, trả về một lần
  fun observeMessages(): Flow<List<Message>>       // dòng dữ liệu: đổi thì phát tiếp
}
```

`Flow` bạn đã gặp ở S1: một dòng giá trị đến lần lượt theo thời gian. Repository dùng được cả hai hình dạng, và cách
chọn khá thẳng:

- Việc **một lần** (tải lại danh sách, gửi một tin nhắn) → hàm `suspend`.
- Muốn **được thông báo mỗi khi dữ liệu đổi** → trả về một `Flow`.

Chú ý `observeMessages()` **không** có `suspend`: gọi nó chỉ là "cho tôi cái dòng đó", chưa phải chờ gì cả. Việc chờ
xảy ra lúc có ai đó thu (`collect`) — và như S1 đã nói, `collect` mới là hàm `suspend`.

Và đây là chỗ trả nợ S4: trong ví dụ `stateIn` của S4 có một dòng nguồn tên `messageSource` với ghi chú "chỗ dữ liệu
đến từ đâu là bài S5". **`messageSource` chính là một hàm như `observeMessages()` của repository.** Ghép lại, chuỗi
đầy đủ là: repository phát ra `Flow<List<Message>>` → ViewModel biến nó thành `StateFlow<ChatUiState>` bằng `stateIn`
→ giao diện đọc bằng `collectAsStateWithLifecycle()`.

Toàn bộ chiều sâu của `Flow` — các toán tử, cold/hot, `SharedFlow`, ghép nhiều dòng, thử lại khi lỗi — là nội dung
bài **W1**. Ở đây chỉ cần đọc được hình dạng của hàm.

---

## Phần 17 — Hai chiều: đường đọc và đường ghi

Cả bài đến giờ nói về **đọc** dữ liệu. Đường **ghi** đi ngược lại, và cùng đi qua đúng một biên giới đó:

```
ĐỌC:   data source  →  repository  →  ViewModel  →  UiState  →  UI
GHI:   UI (sự kiện)  →  ViewModel   →  repository  →  data source
```

Hợp đồng có thêm một hàm:

```kotlin
interface MessageRepository {
  suspend fun loadMessages(): List<Message>
  suspend fun sendMessage(text: String)
}
```

Và trong ViewModel, một sự kiện của người dùng đi hết cả hai chiều:

```kotlin
fun onSendClick(text: String) {
  viewModelScope.launch {
    _uiState.value = _uiState.value.copy(isSending = true)     // quyết định của màn hình

    repository.sendMessage(text)                               // đường GHI
    val messages = repository.loadMessages()                   // đường ĐỌC

    _uiState.value = _uiState.value.copy(
      messages = toUiModels(messages),
      isSending = false
    )
  }
}
```

Ba điều đáng nhận ra trong đoạn trên:

1. **`isSending` do ViewModel tự đặt**, không do repository trả về — nó là quyết định về màn hình (Phần 10–11).
2. **Sau khi ghi, dữ liệu mới quay về qua đường đọc.** Ở đây là gọi `loadMessages()` lần nữa.
3. Nếu repository dùng hình dạng `Flow` của Phần 16 thì bước 2 **tự xảy ra**: nguồn phát ra danh sách mới, ViewModel
   nhận được, state đổi, màn hình vẽ lại — không cần gọi lại tay. Chọn hình dạng nào tuỳ nguồn dữ liệu, và bạn sẽ
   thấy cả hai kiểu ở bài **W2** (mạng) và bài **R3** (database).

Hai chiều này là thứ chuẩn bị trực tiếp cho hai giai đoạn sắp tới: gọi mạng cũng là đọc-ghi qua repository, lưu xuống
máy cũng vậy.

---

## Phần 18 — Khi có lỗi: ai chịu trách nhiệm gì

Phần này cố tình ngắn, vì kiến trúc đầy đủ cho chuyện "đang tải / lỗi / rỗng" ở tầng mạng là nội dung bài **W3**. Ở
đây chỉ cần chốt **ranh giới trách nhiệm**, đúng một lần:

- **Tầng dữ liệu có thể báo thất bại.** Mạng đứt, không đọc được, dữ liệu trả về sai định dạng — đó là thất bại của
  *việc lấy dữ liệu*.
- **ViewModel quyết định thất bại đó biến thành gì trên màn hình.**

Cùng một thất bại, ba màn hình có thể xử lý ba kiểu khác nhau:

| Tầng dữ liệu báo | ViewModel có thể biến thành |
|---|---|
| Không lấy được danh sách tin nhắn | `errorMessage = "Không tải được dữ liệu"` + một nút "Thử lại" |
| Không lấy được danh sách tin nhắn (màn hình khác, ít quan trọng hơn) | Không hiện lỗi gì, chỉ giữ danh sách cũ |
| Gửi tin nhắn thất bại | Giữ lại nội dung người dùng vừa gõ + hiện thanh thông báo |

Cùng một sự thật ở tầng dữ liệu, ba quyết định khác nhau ở tầng UI — và đó chính là lý do quyết định ấy không nên nằm
trong repository.

Về mặt code, việc đó rơi vào một dòng đã quen từ S4: ViewModel gán state mới.

```kotlin
_uiState.update { current ->
  current.copy(errorMessage = "Không tải được dữ liệu", isSending = false)
}
```

Còn *hình dạng* mà tầng dữ liệu dùng để báo thất bại — ném lỗi, hay trả về một giá trị mô tả thất bại — và bắt lỗi ở
đâu, là quyết định thiết kế có nhiều lựa chọn. Bài **W3** làm việc đó với một nguồn dữ liệu thật.

---

## Phần 19 — Bảy câu bạn phải trả lời được

Đây là bài kiểm tra tự chấm cho cả bài. Đọc câu hỏi, tự trả lời trong đầu, rồi đối chiếu.

| Câu hỏi | Trả lời |
|---|---|
| Giao diện Compose lấy dữ liệu từ đâu? | Từ UiState mà ViewModel phơi ra — **không** trực tiếp từ chỗ lưu trữ hay từ mạng |
| ViewModel hỏi dữ liệu của app ở đâu? | Ở repository |
| Repository che đi cái gì? | Việc dữ liệu được lấy ở đâu, bằng cách nào, và được điều phối ra sao |
| Repository có luôn là nguồn đáng tin không? | **Không.** Nó *xác định* và *kiểm soát đường vào* nguồn đáng tin; nguồn đó có thể là một data source hoặc một bộ nhớ tạm |
| Mọi project có cần đúng năm lớp không? | **Không.** Tối thiểu là hai vùng trách nhiệm: UI và dữ liệu. Tầng domain là tuỳ chọn |
| ViewModel có nên gọi thẳng thư viện database/mạng không? | Kiến trúc của khoá này nói **không** — cơ chế lấy dữ liệu nằm sau biên giới của tầng dữ liệu |
| Repository có phải một thành phần của Android không? | **Không.** Nó là một cách tổ chức code, một class Kotlin thường |

Nếu có câu nào bạn trả lời khác, quay lại phần tương ứng: câu 1–2 → Phần 2–3 · câu 3 → Phần 5 · câu 4 → Phần 6 ·
câu 5 → Phần 2 · câu 6 → Phần 9 · câu 7 → Phần 4–5.

---

## Cạm bẫy

> *Khi dựng trang: đây là khối `<h2 id="cam-bay">` duy nhất của bài. Ba cạm bẫy dưới đây được gom theo **niềm tin sai
> của người học** — mỗi cạm bẫy sửa một quyết định, không phải một API — đúng giới hạn "tối đa 3 cạm bẫy / bài" của
> template. Bài này không có mục "tài liệu lỗi thời" riêng: kiến trúc không có version drift theo nghĩa API, nhưng có
> **doctrine drift** — tài liệu cũ hay phát biểu quá tuyệt đối, và (a)+(b) xử lý đúng chuyện đó.*

**(a) "Repository là chỗ lưu dữ liệu."** Đây là nhầm lẫn tốn kém nhất, và nó có hai biến thể.

- *"Repository = database"* — sinh ra vì hầu hết ví dụ đầu tiên người ta gặp đều là repository bọc quanh một
  database. Đó là *một trường hợp*, không phải *định nghĩa*. Repository trong bài này giữ dữ liệu trong bộ nhớ và vẫn
  là repository đúng nghĩa. Hệ quả của nhầm lẫn: gặp app không có database thì kết luận "app này không cần
  repository", rồi cho ViewModel gọi thẳng mạng.
- *"Repository luôn là nguồn đáng tin duy nhất"* — nghe rất giống một nguyên tắc chuẩn, nhưng nói sai địa chỉ.
  Repository *xác định* nguồn đáng tin cho loại dữ liệu nó phụ trách và kiểm soát đường vào nguồn đó; bản dữ liệu
  đúng có thể nằm ở một data source hoặc ở một bộ nhớ tạm. Hai repository trong cùng một app có thể có hai nguồn đáng
  tin khác nhau. Hệ quả của nhầm lẫn: người học tưởng "cứ có repository là dữ liệu đã an toàn và đã đồng bộ", rồi
  không đặt câu hỏi *bản nào là bản đúng* — đúng câu hỏi phải trả lời (Phần 6).

**(b) Ranh giới đặt sai chỗ.** Cũng hai biến thể, đối xứng nhau.

- *ViewModel nói chuyện trực tiếp với mọi API dữ liệu.* Bắt đầu bằng "chỉ một lời gọi thôi mà", kết thúc bằng một
  file ViewModel vừa giữ state màn hình vừa chứa chiến lược lấy dữ liệu. Dấu hiệu sớm nhất: danh sách `import` của
  ViewModel bắt đầu có tên thư viện lưu trữ hoặc thư viện mạng (Phần 3).
- *Repository giữ state của giao diện.* Bắt đầu bằng "để ở repository cho các màn hình dùng chung", kết thúc bằng một
  repository biết tab nào đang mở và câu chữ nào đang hiện. Dấu hiệu sớm nhất: trong file repository xuất hiện chuỗi
  văn bản dành cho người dùng, tên màu, hay một kiểu dữ liệu của Compose (Phần 11).

**(c) "Càng nhiều lớp thì càng đúng kiến trúc."** Phản ứng rất thường gặp sau khi học xong một bài như bài này: thêm
lớp ở khắp nơi.

- *Repository rỗng.* Một class repository chỉ chuyển tiếp lời gọi, trong khi ViewModel vẫn nắm mọi quyết định về dữ
  liệu và vẫn biết dữ liệu đến từ đâu. Nó có hình dạng của một biên giới mà không có biên giới nào — thêm một file,
  không mua được gì. Câu hỏi kiểm: *nếu mai đổi nguồn dữ liệu, ViewModel có phải sửa không?* Nếu có, biên giới chưa
  tồn tại.
- *`interface` ở khắp nơi.* Một hợp đồng chỉ có một bản cài đặt và không có bản thứ hai nào trong tầm nhìn thì chưa
  mua được gì (Phần 13). Tách hợp đồng khi có lý do thật: một bản giả để thử, một nguồn dữ liệu khác đang tới.

Câu để nhớ, và là câu nên mang ra khỏi cả bài này:

> **Kiến trúc tồn tại để quản lý *thay đổi* và *trách nhiệm*, không phải để tăng số lượng class.** Trước khi thêm một
> class hay một `interface`, hãy trả lời được: *nó nhận trách nhiệm nào, và nó làm thay đổi nào trở nên rẻ hơn?*
> Không trả lời được thì chưa thêm.

---

## Tóm tắt

Năm điều cần giữ lại — nếu chỉ nhớ được năm dòng, hãy là năm dòng này:

1. **Tầng UI lo trình bày, state của màn hình và sự kiện của người dùng.** Nó không biết dữ liệu được lấy bằng cách
   nào.
2. **Tầng dữ liệu lo dữ liệu của app**: dữ liệu ở đâu, lấy/ghi thế nào, và các quy tắc quanh nó.
3. **Repository là biên giới mà tầng trên đi qua để hỏi dữ liệu.** Phía trên gọi theo nhu cầu; "bằng cách nào" nằm
   hết ở phía sau biên giới đó.
4. **Repository che và điều phối các nguồn; nó không tự động là chỗ lưu trữ, cũng không tự động là nguồn đáng tin.**
   Nó *xác định* nguồn đáng tin cho loại dữ liệu nó phụ trách.
5. **Kiến trúc để giảm sự dính chặt và giảm giá của thay đổi**, không phải để tạo class cho có. Không có luật "phải
   đúng năm lớp"; tối thiểu là hai vùng trách nhiệm, và tầng domain là tuỳ chọn.

Một dòng phụ, dùng khi đọc code: **repository cung cấp dữ liệu, ViewModel biến dữ liệu thành UI state** — thấy hai
việc đó nằm chung một chỗ thì biết ranh giới đã lệch.

---

## Luyện tập — đọc một tầng dữ liệu và chỉ ra từng mảnh

Đoạn code dưới đây là toàn bộ những gì bài này dạy, gói lại. Với mỗi số khoanh tròn, tự trả lời hai câu: *mảnh này là
gì?* và *nó được dạy ở bài nào?*

```kotlin
interface MessageRepository {                                    // ①
  suspend fun loadMessages(): List<Message>                      // ②
}

class InMemoryMessageRepository : MessageRepository {             // ③
  override suspend fun loadMessages(): List<Message> {
    return listOf(
      Message(id = "1", text = "Chào cả nhà", senderId = "u1")
    )
  }
}

class ChatViewModel(
  private val repository: MessageRepository                      // ④
) : ViewModel() {                                                // ⑤

  private val _uiState = MutableStateFlow(ChatUiState())
  val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()   // ⑥

  fun refresh() {
    viewModelScope.launch {                                      // ⑦
      val messages = repository.loadMessages()
      _uiState.value = _uiState.value.copy(
        messages = toUiModels(messages)                          // ⑧
      )
    }
  }
}
```

Câu hỏi cuối, quan trọng nhất: **trong cả đoạn trên, chỗ nào cho biết dữ liệu đang được lấy từ bộ nhớ?**

<details>
<summary>Xem lời giải</summary>

- **①** `interface MessageRepository` — **hợp đồng**, tức biên giới của tầng dữ liệu. Đây là thứ duy nhất tầng UI được
  biết về tầng dữ liệu. (`interface`/`override` được chú giải ở Phần 13; Kotlin sâu hơn không thuộc khoá này.)
- **②** `suspend fun loadMessages(): List<Message>` — một hàm của hợp đồng. `suspend` (**S1**) nghĩa là việc này *có
  thể* tạm dừng chờ rồi tiếp tục; nó **không** nghĩa là "chạy ở thread nền" và **không** chọn dispatcher.
  `List<Message>` đọc theo khuôn `Hộp<Loại-bên-trong>` (**F2**).
- **③** `class InMemoryMessageRepository : MessageRepository` — **bản cài đặt**: một cách hoàn thành hợp đồng. Tên của
  nó nói *cách làm*, đúng quy ước ở Phần 13.
- **④** `private val repository: MessageRepository` — **dependency được đưa vào từ ngoài** (Phần 14). ViewModel chỉ
  biết hợp đồng ①, không biết ③ tồn tại.
- **⑤** `: ViewModel()` — "class này *là một* ViewModel" (dấu `:` đã gloss ở **S1**); ViewModel là gì và vì sao cần:
  **S4**.
- **⑥** cặp `_uiState` (ghi được, riêng tư) / `uiState` (chỉ đọc, công khai) — **S4**.
- **⑦** `viewModelScope.launch { }` — **S1**: công việc này thuộc ViewModel nên ViewModel bị dọn thì nó bị huỷ; và đây
  cũng là chỗ hợp lệ để gọi một hàm `suspend`.
- **⑧** `toUiModels(messages)` — **ranh giới giữa dữ liệu và UI state** (Phần 10, 12): repository trả về
  `List<Message>`, ViewModel dịch sang `List<MessageUiModel>` — thứ mà màn hình cần.

**Câu hỏi cuối:** chỉ ở **③** — trong tên class và trong thân hàm của nó. Cả `ChatViewModel` không có một dấu hiệu
nào. Đó chính là kết quả mà cả bài này hướng tới: đổi ③ sang một bản đọc từ mạng hoặc từ database, phần còn lại của
đoạn code không đổi một chữ.

</details>

---

## Editorial migration notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

Ký hiệu phân loại dùng trong hai bảng đầu:

| Mã | Nghĩa |
|---|---|
| **A** | MOVE/PORT → S5 (chuyển ý niệm sang S5, thường ở dạng đã viết lại cho trung tính công nghệ) |
| **B** | KEEP → R1 (giữ tại Ch10.1 / bài R1) |
| **C** | KEEP → R3 (giữ tại Ch10.3 / bài R3) |
| **D** | DUPLICATE (đã được dạy ở bài khác; S5 không lặp lại) |
| **E** | STALE / BOOK-NARRATION (phát biểu quá tuyệt đối, hoặc giọng thuật lại nguồn — cần sửa khi dựng R1/R3) |

### A. Thu hoạch từ `web/src/components/lessons/Ch10_1RoomLaGi.astro`

| Khối (dòng) | Nội dung | Mã | Ghi chú |
|---|---|---|---|
| 38–63 | Khối mục tiêu + lộ trình 10.2–10.4 | **B** + **E** | Gạch đầu dòng 43 — *"Kiến trúc 5 lớp mà cả Chương 10 **bắt buộc tuân theo**"* — là **E**: biến một cách chia trách nhiệm thành một điều luật. Khi dựng R1: đổi thành cross-ref "kiến trúc đã học ở **S5**" |
| 64–112 | App của chương · hành trình starter→final · 16 file · bẫy CRLF `MainScreen.kt` | **B** | Thuần Ch10, không liên quan S5 |
| 113–143 | Mục 1 — SQLite là cách lưu thứ ba · callout "database và SQLite là gì" | **B** | R1 giữ nguyên: mô hình SQLite |
| 144–149 | *"Repository là một lớp trung gian đứng giữa nơi lưu dữ liệu và phần còn lại của app"* + "dùng Repository pattern một cách tổng quát, không dính chặt Room" | **A** | Hạt giống định nghĩa → S5 Phần 5. R1 chỉ cần một câu + cross-ref S5 |
| 150–163 | Callout "vì sao DataStore không làm được việc này" (ranh giới key-value vs truy vấn có điều kiện) | **B** | R1 giữ — đây là ranh giới chọn công cụ, không phải doctrine kiến trúc |
| 164–211 | Mục 2 — Room bọc SQLite · bảng `@Database`/`@Entity`/`@Dao` | **B** | R1/R2 giữ |
| 212–231 | Mental model "Room như một nhà hàng" (Entity = thực đơn · DAO = bồi bàn · Database = cả nhà hàng) | **B** | **Không port ẩn dụ.** Chỉ *lập luận* ở đoạn 226–230 ("đổi bếp, giữ nguyên bồi bàn") là **A**, và S5 diễn đạt lại bằng ẩn dụ **khác** (cửa hàng / kho / quầy — Phần 2) để tránh hai ẩn dụ nhà hàng gán cho hai thứ khác nhau trong cùng khoá |
| 232–268 | Mục 3 — Android Architecture Components · bảng 4 thành phần · "học đúng lúc cần" | **B** | R1 giữ. Riêng ô LiveData → xem cạm bẫy #1 dưới |
| **270–281** | **Mục 4 — danh sách 5 vùng trách nhiệm** (persistence · model · abstraction · business logic · UI) | **A** | → S5 Phần 2, **đã biến đổi**: giữ *cách chia trách nhiệm*, bỏ *"đúng năm lớp"*. Xem "Editorial open questions" #2 về provenance của con số 5 |
| **282–290** | **"Mục tiêu then chốt: giao tiếp chỉ chảy một chiều" + "loosely coupled"** | **A** | → S5 Phần 8 (chiều phụ thuộc) |
| **291–302** | **Bảng "Lớp / Được phép biết về / Không được biết về"** | **A** | → S5 Phần 8, rút từ 5 dòng xuống 4 dòng trung tính công nghệ (Composable · ViewModel · Repository · Data source) |
| 303–309 | "UI hoàn toàn độc lập trừ ViewModel" · "ViewModel không biết gì về UI" | **A** | → S5 Phần 3 và Phần 8 |
| 310–329 | Callout "Kiểm chứng ngay trên code Recipe Finder" (đọc `import` của ViewModel / của composable) | **A** *(kỹ thuật)* + **C** *(dữ kiện)* | S5 Phần 3 port **kỹ thuật đọc `import`** ở dạng trung tính; các dữ kiện cụ thể (`RecipeViewModel`, `ShowBookmarks`, `RecipeDao`) ở lại R1/R3 |
| 330–334 | "**không nhân nhượng** (won't compromise) trong việc tuân theo luồng một chiều" | **E** | Giọng doctrine tuyệt đối. S5 thay bằng phát biểu theo *trách nhiệm* + *giá của thay đổi* |
| 335–356 | Bảng 3 lợi ích (đổi chỗ lưu mà UI không đổi · đổi UI mà tầng dữ liệu không đổi · test được không cần emulator) | **A** | → S5 Phần 9 (kịch bản đổi yêu cầu) và Phần 13 (lợi ích #3 → dạng "có thể có bản giả", test sâu để bài **O2**) |
| 357–382 | Mục 5 — "cắt bánh theo miếng, không bóc theo lớp" | **A** | → S5 Phần 2, đoạn cuối. R1 giữ lại đúng một câu giải thích *cách chương đó được dạy*, kèm cross-ref S5 |
| 383–401 | Cây 4 thư mục · map thư mục ↔ 5 lớp | **B** | Gắn chặt package của project mẫu → R1 |
| 402–515 | Mục 6 — Gradle/Room/KSP/`@Parcelize` | **B** | R1 giữ |
| 486–509 | Tổng kết 10.1 | **B** (bullet 1,2,3,4,7) + **A** (bullet 5 "kiến trúc 5 lớp", bullet 6 "dựng theo miếng") | Hai bullet **A** → đổi thành cross-ref S5 |
| 516–544 | Cạm bẫy #1 LiveData-vs-StateFlow · #2 vị trí thật của Entity | **B** | R1 giữ (#1 cũng thuộc họ drift → đối chiếu `docs/drafts/ap3-version-drift.md`) |
| 545–561 | Nguồn tham khảo | **B** | Provenance Room ở lại R1 |

### B. Thu hoạch từ `web/src/components/lessons/Ch10_3RepositoryViewModel.astro`

| Khối (dòng) | Nội dung | Mã | Ghi chú |
|---|---|---|---|
| 201–224 | Khối mục tiêu + recap 10.2 | **C** | Gạch đầu dòng 204–205 (repository WHY) sau khi S5 live nên đổi thành "áp **S5** vào Room" |
| **226–231** | *"còn **một lớp trừu tượng nữa** phải thêm vào, nằm giữa Room và phần còn lại của code. Lý do: làm vậy giúp **đổi cách và đổi chỗ lưu dữ liệu** trở nên dễ dàng"* | **A** | Đây là **repository WHY** ở dạng nguyên chất → S5 Phần 5 + Phần 9 |
| **232–238** | *"Repository pattern là gì?"* + định nghĩa gọn: *"một kho dữ liệu tổng quát, có thể quản lý nhiều nguồn dữ liệu nhưng phơi ra một interface hợp nhất cho phần còn lại của app"* | **A** | → S5 Phần 5 (bảng 5 việc repository có thể làm). S5 **bỏ** chữ "kho" khi định nghĩa (nuôi đúng nhầm lẫn `repository = storage`) và thay bằng "biên giới" |
| 239–254 | `RecipeRepository` cụ thể · đặt trong `data/` chứ không `data/database/` · code 12 hàm · "năm điểm cần nắm" | **C** | Gắn chặt Room/DAO → R3 |
| **255–274** | Callout *"các hàm này mỏng một cách có chủ đích"* — ba giá trị: che DAO khỏi ViewModel · chỗ gộp nhiều nguồn · chỗ gộp nhiều thao tác | **A** | Khối WHY mạnh nhất của cả Ch10 → S5 Phần 5 (đoạn "một hàm một dòng vẫn đang làm ba việc"), viết lại trung tính (bỏ DAO/Room) |
| 275–289 | `deleteRecipeIngredients()` — hàm duy nhất *không* mỏng; "gói hai bước thành một hàm mà ViewModel gọi bằng một dòng" | **A** *(lập luận)* + **C** *(code)* | → S5 Phần 5 dòng cuối bảng ("gói nhiều bước thành một") và Phần 17 |
| 290–303 | Ba phát hiện khi tìm toàn project: hai hàm trùng thân · ba hàm không được gọi ở đâu · xoá luôn cần hai lời gọi | **C** | R3 giữ (đọc code phê phán). S5 chỉ *vọng lại* ở cạm bẫy (c) "repository rỗng", không nêu tên project |
| 305–340 | Mục 12 — ba họ model (`RecipeInformationResponse` / `RecipeDb` / `Recipe`) + bảng "vì sao phải tồn tại riêng" | **C** *(chiều sâu)* + **A** *(chỉ nguyên tắc)* | S5 Phần 12 chỉ lấy **một câu nguyên tắc**: "hai biên giới khác nhau có thể cần hai cách biểu diễn khác nhau". Đủ ba họ model + file dịch → **R3** (không lấy học phần của R3) |
| 341–380 | `Conversions.kt` 11 hàm · bẫy `@Delete` vs `@Update` | **C** | R3 |
| **382–394** | *"cả hai là **dependency được truyền vào từ ngoài**, không phải do ViewModel tự tạo"* + *"nhờ vậy test được ViewModel bằng một repository giả (fake)"* | **A** | → S5 Phần 14 (DI ở mức nhận diện) và Phần 13 (lợi ích #3). Wiring thật → **D2**; test → **O2** |
| **395–416** | 13.1 — "khuôn bốn bước": ① `withContext(Dispatchers.IO)` ② gọi repository ③ dịch sang model UI ④ gán vào state | **A** *(đã biến đổi)* + **E** *(bước ①)* | S5 port **ba** bước ②③④ (Phần 7, 10, 12). Bước ① bị **loại khỏi khuôn**: câu *"đảm bảo nó chạy ở background"* biến `withContext(IO)` thành nghi thức mặc định, trái mô hình chính xác của S1. Xem "open questions" #3 |
| **417–431** | Callout "vì sao bước 4 làm UI tự cập nhật" + *"database → repository → ViewModel state → UI là một dây chuyền một chiều"* | **A** *(chuỗi)* + **D** *(cơ chế StateFlow)* | Chuỗi đầu-cuối → S5 Phần 10. Cơ chế `MutableStateFlow`/`.value`/UI lắng nghe là **D** — S4 đã dạy, S5 không lặp |
| 432–439 | `getBookmark()` gọi repository hai lần, ghép từ hai bảng | **C** | R3 |
| 440–448 | 13.2 hàm ghi — "đọc thì ghép hai bảng, ghi thì tách hai bảng" | **A** *(tính đối xứng đọc/ghi)* + **C** *(code)* | → S5 Phần 17 (hai chiều), ở dạng không có bảng/DAO |
| 449–480 | 13.3 hai `deleteBookmark` overload | **C** | R3 |
| 481–489 | Notice "một hàm vừa `suspend` vừa tự `launch` là hai cách nghĩ đánh nhau", kèm câu *"`suspend` nghĩa là người gọi quyết định chạy ở đâu"* | **D** + **E** | **D**: S1 Phần 8 đã dạy. **E**: chính câu in nghiêng đó là bản *quá tuyệt đối* mà S1 đã loại bỏ ở đợt sửa S1B. Khi dựng R3: thay bằng mô hình hai nửa của S1 |
| 491–529 | Mục 14 — `RecipeApp` · `Application` · `lateinit var` · tên database `"Recipes"` | **C** | R3 giữ dữ kiện project; **doctrine "nối dây cho cả app" thuộc D2** |
| 531–576 | Mục 15 — `compositionLocalOf` / `CompositionLocalProvider` / prop drilling | **C** *(ca dùng)* | **Doctrine CompositionLocal thuộc D2** (spec §6 dòng D2). S5 **không** nhắc CompositionLocal — nó là một cách *nối dây*, không phải một phần của biên giới dữ liệu |
| 578–603 | Tổng kết 10.3 | **A** (bullet 1 phần "giá trị của lớp này") + **C** (còn lại) | |
| 605–631 | Cạm bẫy 10.3 (6 mục) | **C** | Trừ "trộn `suspend` với `launch`" = **D** (S1) |
| 633–644 | Nguồn tham khảo | **C** | |

### C. Sau khi S5 live, bài R1 (từ Ch10.1) phải sửa gì

Task IMP-046 **không** sửa Ch10 — mục này là danh sách việc cho batch dựng R1 (đã pilot ở IMP-020).

1. **Mục 4 (dòng 270–356) không còn là nơi dạy kiến trúc.** Rút xuống 3–5 câu recap + cross-ref "đã học ở **S5**".
   Cụ thể: **bỏ** bảng "Lớp / Được phép biết về / Không được biết về" (S5 Phần 8 sở hữu) và bảng 3 lợi ích (S5 Phần 9
   sở hữu); **giữ** phần map 4 thư mục ↔ vùng trách nhiệm (dòng 383–401) vì nó là bản đồ định vị file trong project
   mẫu, không phải doctrine.
2. **Bỏ giọng doctrine tuyệt đối** ở dòng 43 ("bắt buộc tuân theo") và 330–334 ("không nhân nhượng").
3. **Mục 5 "cắt bánh theo miếng" (357–382):** rút còn một câu giải thích *vì sao chính chương này lại được dạy theo
   lớp*, cross-ref S5 cho phần lập luận.
4. **Dòng 144–149:** trong khoá mới, R1 đứng **sau** S5 (Giai đoạn 6 vs Giai đoạn 3), nên câu giới thiệu repository ở
   đây phải đổi thời thái: từ "sẽ dựng ở 10.3" thành "biên giới bạn đã học ở **S5**, giờ áp vào Room".
5. **Đổi thời thái tương tự** cho mọi câu kiểu "trước khi tạo class Room đầu tiên, phải tổ chức lại app cho có kiến
   trúc" (dòng 271–274) — người học tới R1 đã có kiến trúc từ S5.
6. **Không được xoá:** mục 1 (SQLite), 2 (ba thành phần Room), 3 (Architecture Components), 6 (Gradle/KSP), cả hai cạm
   bẫy, và callout ranh giới DataStore-vs-database (150–163). Đó là learning job của R1.
7. **Legacy-credit:** `ch10-1` cũ chỉ credit sang **R1**, **không** tự done S5 (plan §12.2 case C, test IMP-072 case c).

### D. Sau khi S5 live, bài R3 (từ Ch10.3) giữ gì và phải sửa gì

**R3 giữ (learning job của nó, S5 không được lấn):** cài đặt repository cụ thể trên Room · lấy DAO từ database và nối
dây · đủ ba họ model + file dịch qua lại · tích hợp ViewModel với Room · các cạm bẫy riêng của Room (`@Delete` vs
`@Update`, xoá cần hai lời gọi, hai cách singleton).

**R3 phải sửa bốn chỗ:**

1. **Mở đầu mục 11 (226–238):** không dạy lại "repository pattern là gì". Đổi thành: "S5 đã dạy biên giới này; đây là
   một bản cài đặt của nó trên Room" + cross-ref S5 (spec yêu cầu **cross-ref hai chiều S5 ↔ R3**).
2. **Khuôn bốn bước (395–416):** sửa bước ①. Bỏ cách diễn đạt "chuyển sang luồng IO để **đảm bảo** nó chạy ở
   background" như một bước mặc định của mọi hàm; thay bằng quy tắc của S1 (chỉ chuyển khi bản cài đặt thật sự làm việc
   chặn thread, và trách nhiệm chuyển thuộc chính bản cài đặt đó). Khuôn còn lại ②③④ đã được S5 dạy trước.
3. **Notice 481–489:** thay câu *"`suspend` nghĩa là người gọi quyết định chạy ở đâu"* bằng mô hình hai nửa của S1
   (người gọi chọn ngữ cảnh mình gọi từ đó · hàm được gọi không tự nhảy thread nhưng *được phép* đổi ngữ cảnh khi việc
   của nó cần). Nhận xét về sự không đồng nhất trong project thì giữ.
4. **Callout 417–431:** bỏ phần giải thích lại `MutableStateFlow`/`.value`/"UI đang lắng nghe" (S4 đã dạy, S5 đã nối
   chuỗi), giữ phần dữ kiện về code thật, cross-ref S4 + S5.

### E. Ch07 — loại trừ tuyệt đối

**S5 không lấy một dòng doctrine nào từ Ch07.** Đã kiểm ở mức tiêu đề để xác định ranh giới, không đọc để thu hoạch:

- `Ch07AdvancedArchitecture.astro` (bài đang live, slug `ch07-advanced-architecture`) có mục
  `<h2 id="repository-pattern">Repository pattern: vấn đề trước, giải pháp sau</h2>` (dòng 984) và
  `<h3>Giải pháp và 5 trách nhiệm</h3>` (dòng 1013) — tức **có va chạm doctrine thật** với S5.
- `Ch07_2RepositoryPattern.astro` là **file mồ côi** (không có trong `web/src/data/lessons.ts`), giống họ `Ch06_*`.
  Cùng nội dung, cùng va chạm.
- Xử lý: khi Ch07 REDUCE → **O1** (task IMP-050), O1 **cross-ref S5** cho phần biên giới và giữ lại đúng phần *case
  study*: repository-vs-live-engine, local-first, và chỗ hợp đồng của Ch07 *chưa* độc lập khỏi Ditto (dòng 1118–1141 —
  một quan sát rất tốt, nhưng nó là *đánh giá một ca cụ thể*, không phải doctrine chung). API Ditto sâu → **AP2**.
- Lý do S5 không được sinh ra từ Ch07: Ditto là **SDK bên thứ ba** với mô hình local-first riêng; lấy nó làm nguồn
  doctrine sẽ dạy người mới một kiến trúc gắn với một sản phẩm. S5 phải trung tính công nghệ — **zero Ditto**.

### F. Quyền sở hữu nội dung về sau (để không bài nào dạy trùng)

| Bài | Sở hữu phần nào | S5 chỉ được làm gì |
|---|---|---|
| **W1** | Coroutine/Flow đầy đủ: toán tử, cold/hot, `SharedFlow`, huỷ, `combine`, `retry` | Nêu tên `Flow` ở mức hình dạng hàm (Phần 16) |
| **W2** | Retrofit/Moshi-KSP · model của tầng mạng · một data source mạng thật | Gọi "nguồn trên mạng" bằng tên bịa trung tính (`RemoteMessageDataSource`) |
| **W3** | Kiến trúc trạng thái mạng: đang tải / lỗi / rỗng · error-to-user state · API key | Chốt **ranh giới trách nhiệm** khi lỗi, một bảng, không thiết kế state (Phần 18) |
| **D1** | DataStore: lưu thiết lập nhỏ | Không nhắc DataStore |
| **D2** | **Nối dây cho cả app**: tạo repository ở đâu · manual DI · `CompositionLocal` · ghi chú chỗ Hilt khớp vào | Nêu đúng cái tên "dependency injection" một lần; nói rõ "ai tạo ViewModel" là D2 (Phần 14) |
| **R1** | Vì sao cần database · mô hình SQLite · ranh giới DataStore-vs-database · động lực và setup Room | Không nhắc Room/SQLite |
| **R2** | `@Entity` / `@Dao` / `@Database` | — |
| **R3** | Repository **trên Room** · nối DAO · đủ ba họ model + file dịch · tích hợp ViewModel–Room · cạm bẫy Room | Một câu nguyên tắc về mapping (Phần 12), không lấy ba họ model |
| **O1** | Case study Ditto/local-first · offline-first · repository-vs-live-engine | Nêu tên "offline-first" một lần kèm nhãn "bài O1" (Phần 6) |
| **AP2** | Chiều sâu API Ditto | Không nhắc Ditto |
| **O2** | Viết test · fake repository trong test | Nói "có thể có một bản giả", test sâu → O2 (Phần 13) |
| **N1–N2** | Điều hướng · back stack | Ghi "đang ở màn hình nào là chuyện của N1–N2" (Phần 11) |

### G. S5 cố tình KHÔNG dạy (đã kiểm từng dòng code trong bài)

| Không có trong bài | Vì sao | Ai dạy |
|---|---|---|
| Room, SQLite, `@Entity`, `@Dao`, DAO | Bản cài đặt cụ thể; học trước biên giới là học ngược | R1–R4 |
| Retrofit, Moshi, JSON, HTTP | Như trên | W2 |
| DataStore | Như trên | D1–D2 |
| Ditto, local-first, offline-first (sâu) | Là SDK/thiết kế riêng, không phải doctrine chung | O1, AP2 |
| Hilt, Dagger, Koin, container, scope/component/module | Chỉ cần hiểu "được đưa từ ngoài vào" | D2 |
| `viewModelFactory`, `AndroidViewModel`, `Application` | Là chuyện nối dây, không phải biên giới | D2 |
| `CompositionLocal` | Cách phát một object xuống cây UI — chuyện nối dây | D2 |
| Toán tử Flow · cold/hot · `SharedFlow` · `stateIn` (dạy lại) | S1 đã đặt nền; chiều sâu thuộc W1; `stateIn` đã dạy ở S4 | W1 (S4 cho `stateIn`) |
| `withContext(Dispatchers.IO)` **trong code của bài** | Bản cài đặt trong bài không chặn thread; thêm vào là dạy sai nghi thức | S1 (quy tắc), W2/R3 (ca thật) |
| Use case / interactor · domain layer sâu · SOLID · dependency inversion · Clean Architecture | Không cần để viết đúng app trong khoá | — (ngoài phạm vi khoá) |
| Testing, mock framework | Đã nêu lợi ích "có thể có bản giả" là đủ | O2 |
| `when`, `sealed` cho kết quả thành công/thất bại | `when` chưa được dạy ở F1/F2; Phần 18 dùng bảng thay vì code để khỏi phải gloss thêm | W3 |
| Bất kỳ dòng code nào từ `aaf-materials/` | Project mẫu chưa có repository ở mốc này; mọi repository thật trong nó đều dính Room/Ditto | R3, O1 |

### H. Việc còn lại của IMP-046 mà draft này KHÔNG làm (đúng phạm vi task)

- **Dựng trang** `.astro` theo template kit: `<section class="lesson">`, family callout (`callout goals` · `callout` ·
  `callout mental` · `callout note` · `notice` · `hint` · `table class="api"` · `ol class="chain"`), `<Code>` của
  `astro:components` với `lang="kotlin"`, "Mục x/y", đúng một `<h2 id="cam-bay">` và một `<h2 id="nguon">`.
- **Slug mới** + đăng ký ở `web/src/data/lessons.ts` và `web/src/data/chapters.ts` (bài NEW → slug mới, plan §4b.3).
- **Quiz ≥ 8 câu** theo chuẩn §10 của `docs/COURSE_CONTENT_STANDARD.md`: 4 phương án, cân rank độ dài + vị trí đáp án
  đúng, giải thích cả distractor, có câu đọc-code/áp dụng. Gợi ý trục hỏi đã có sẵn: bảy câu ở Phần 19, ba nhóm cạm
  bẫy, và bài luyện tập ①–⑧.
- **Legacy-credit:** S5 không tự done từ progress cũ (plan §12.2 case C/D; test IMP-071/072).
- **Cross-ref hai chiều S5 ↔ R3** (spec §6 dòng S5) — chỉ làm được khi R3 đã có slug ổn định.
- **Cập nhật `docs/PROJECT_PLAN.md`** khi batch Stage 3 đóng.

### I. Ghim cho "Cần biết trước" của các bài sau

- **N1** (bài kế tiếp, phụ thuộc S5): người học đã có mô hình hai vùng trách nhiệm; điều hướng nằm ở tầng UI.
- **W1/W2/W3:** đã biết repository là biên giới · đã biết hàm `suspend` và `Flow` ở biên giới tầng dữ liệu · đã biết
  "ViewModel biến dữ liệu thành UI state" · đã biết mapping model là *nguyên tắc* (W2 dạy model mạng cụ thể).
- **D2:** đã biết "dependency được đưa từ ngoài vào" và đã nghe tên "dependency injection"; chưa biết ai tạo ViewModel.
- **R1/R3:** đã có toàn bộ doctrine kiến trúc; R1 chỉ cần cross-ref, R3 chỉ cần "áp S5 vào Room".
- **O1:** đã biết repository trung tính công nghệ; O1 so sánh nó với một engine đồng bộ thật.
- **O2:** đã biết vì sao một hợp đồng cho phép có bản cài đặt giả.

---

## Editorial open questions

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

1. **Đánh số mục xuyên Giai đoạn 3 — cần chốt một lần.** S1 draft ghi: *"batch tách Ch06 → S2–S4 (IMP-037) tiếp nối từ
   **mục 14**; S5 (IMP-046) nối tiếp sau S4."* Nhưng bản Ch06 đã restructure (commit `5d28f85`) đánh số **1–19** trong
   một trang gộp, tức **mỗi bài đánh số lại từ 1**. Draft này theo quy ước đang chạy thật (S5 = mục 1–19 của riêng nó).
   Việc cần làm: batch Stage 3 chọn *một* quy ước rồi sửa cả S1 lẫn S2–S4 cho khớp. Đây là **việc sửa chữ**, không đụng
   nội dung.
2. **Provenance của con số "năm lớp" — đã kiểm, và nó không phải một điều luật.** Nguồn gốc
   (`content/book/ch10-room-database.md` dòng 55–61) nói *tách app thành các vùng trách nhiệm riêng biệt "along these
   lines"* rồi liệt kê năm mục — tức một cách chia, không phải một yêu cầu bắt buộc. Câu "bắt buộc tuân theo" ở
   `Ch10_1RoomLaGi.astro` dòng 43 là **do bài học của khoá thêm vào**, không có trong nguồn. S5 sửa lại; batch R1 nên
   xác nhận lần nữa khi dựng.
3. **`withContext(Dispatchers.IO)` quanh hàm `suspend` của thư viện — vẫn chưa giải quyết.** Đây là open question #1
   của S1, còn nguyên: hàm DAO `suspend` của Room có tự chuyển việc đi hay không, và bọc thêm `IO` là dư hay cần. S5
   **đi vòng** qua nó một cách hợp lệ (mọi bản cài đặt trong bài đều không chặn thread, nên không có `withContext` nào
   trong code của bài), nhưng câu hỏi vẫn thuộc **R3/W1** và phải được verify trước khi dựng hai bài đó.
4. **Kiểu của `messageSource` trong ví dụ `stateIn` ở S4 — cần một sửa nhỏ ở S4.** S4 ghi
   `// messageSource: Flow<List<MessageUiModel>>`, tức nguồn dữ liệu đã phát ra **model của UI**. S5 Phần 12 và Phần 16
   nói rõ tầng dữ liệu phát ra `Flow<List<Message>>` và ViewModel mới dịch sang `MessageUiModel`. Hai chỗ này lệch nhau.
   Đề xuất: khi S5 live, sửa **một dòng ghi chú** trong S4 thành `Flow<List<Message>>` (không cần sửa code mẫu, vì bước
   `.map { }` trong ví dụ đó vẫn đúng hình dạng). Nếu batch quyết giữ nguyên S4, thì S5 Phần 16 phải hạ giọng từ
   "chính là" xuống "cùng vai trò với".
5. **Hạn mức cạm bẫy của template.** C5 ghi hạn mức "tối đa 3 cạm bẫy / bài", nhưng S1 và F2 đều có 8 mục. S5 chọn cách
   của C5: **3 nhóm theo niềm tin sai**, mỗi nhóm chứa 2 cạm bẫy cụ thể (tổng 6 cạm bẫy được xử lý). Cần chốt hạn mức
   thật ở template kit để ba bài này nhất quán.
6. **Sổ ẩn dụ (chưa kiểm hết khoá).** S5 dùng **cửa hàng / kho / quầy**; Ch10.1 (→ R1) dùng **nhà hàng** cho ba thành
   phần Room (Entity/DAO/Database). Hai ẩn dụ tách biệt là cố ý — nhưng chưa quét toàn bộ 30+ file lesson để chắc chắn
   không bài nào khác đã dùng ẩn dụ cửa hàng/kho. Việc rẻ, nên làm khi dựng trang.
7. **Có nên nêu tên "tầng domain" ở S5 hay không — đã quyết là có (chỉ nhận diện, một đoạn).** Lý do: người học sẽ mở
   tài liệu chính thức và thấy ba tầng; không nêu tên thì họ tưởng khoá dạy thiếu. Rủi ro: thêm một cái tên không có
   chiều sâu. Nếu review thấy nặng, cắt đoạn đó xuống một câu trong bảng ở Phần 2.

---

## Final readability-test inventory

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

**Cú pháp Kotlin ngoài F1/F2/S1 xuất hiện trong bài — đúng bốn mục, gom vào hai chỗ gloss có nhãn:**

| Cú pháp | Gloss ở đâu | Ghi chú |
|---|---|---|
| `private` (mức nhìn thấy) | Phần 7, bảng "đọc từng mảnh" | F2 nói rõ visibility "không nằm trong bài này" → phải gloss |
| `interface` (độc lập, không phải `sealed interface`) | Phần 13, callout "Đọc cú pháp" | F2 chỉ gloss `interface` trong `sealed interface UiState` |
| `class A : B` nghĩa "nhận hợp đồng B" | Phần 13, cùng callout | S1 đã gloss chính dấu `:` này cho `class ChatViewModel : ViewModel()` |
| `override` | Phần 13, cùng callout | Không được dạy ở F1/F2/S1 |

**Ba mục đánh giá là tự hiển nhiên, không gloss — đánh dấu để review lại khi dựng trang:** `isNotEmpty()` (Phần 9;
F1 dạy `size`/`map`/`filter`/`joinToString`, không dạy hàm này) · `return` sớm trong `if` (Phần 9) · tham số gọi theo
tên `Message(id = "1", …)` (đã có tiền lệ ở code mẫu của S4: `ChatUiState(messages = list)`).

**Khái niệm dùng lại, không dạy lại:**

| Dùng trong bài | Đã dạy ở |
|---|---|
| `data class` · `List<T>` · khuôn `Hộp<Loại-bên-trong>` | **F2** |
| hàm/tham số · `listOf` · `map { }` với lambda | **F1** |
| `suspend` (mô hình hai nửa) · `viewModelScope.launch` · `Flow` · "`collect` là hàm `suspend`" | **S1** |
| ViewModel · `ChatUiState` · `MutableStateFlow`/`asStateFlow()` · `copy()` · `update { }` · `stateIn` · `collectAsStateWithLifecycle()` | **S4** |
| state hoisting · luồng dữ liệu một chiều trong cây composable | **S3** |

**Danh sách loại trừ đã xác minh (grep trên vùng "Bài học", dòng 32–1127):**

- **Không xuất hiện ở bất kỳ đâu:** SQLite · DAO · `@Entity` · `@Dao` · `@Database` · Moshi · OkHttp · Ditto ·
  LiveData · `viewModelFactory` · `AndroidViewModel` · `Application` · `compositionLocalOf` ·
  `CompositionLocalProvider` · `async` · `await` · `SharingStarted` · `flatMapLatest` · `when` · `sealed` · `try` ·
  `catch` · `Result<…>` · `@Inject` · use case · SOLID.
- **Chỉ xuất hiện trong văn xuôi, luôn kèm nhãn bài sẽ dạy, và KHÔNG có trong bất kỳ code block nào:** Room (3 lần) ·
  Retrofit (3) · DataStore (2) · JSON (1) · Hilt/Dagger/Koin (2 mỗi tên) · `SharedFlow` (1) ·
  `withContext(Dispatchers.IO)` (4 — Phần 7 và 15, dùng để dạy quy tắc *không* bọc nó bừa) · `stateIn` (3) ·
  `collectAsStateWithLifecycle` (5).
- **Không có dòng code nào trích từ `aaf-materials/`.** 19 code block, tất cả là ví dụ tối giản do khoá dựng.

**Kiểm cấu trúc:** 19 `Phần` + `Cạm bẫy` + `Tóm tắt` + `Luyện tập` · 11 bảng · 19 code block `kotlin` + 4 block sơ đồ
chữ (Phần 2 đường đi · Phần 8 chiều phụ thuộc · Phần 10 chuỗi đầu-cuối · Phần 17 đọc/ghi — khi dựng trang, bốn block
này thành `<pre class="tree">`, đúng khuôn Ch10.1 đã dùng cho cây thư mục) · 4 callout · 6 checkpoint đánh số liên tục
1–6 · 1 `<details>` cho lời giải bài luyện tập.

**Cỡ bài:** vùng "Bài học" ≈ **10.700 từ / 1.094 dòng**. Đối chiếu cùng thước đo: S1 ≈ 8.050 từ (khai ~20 phút),
C5 ≈ 8.080 từ (~20 phút), F1 ≈ 6.230, F2 ≈ 6.020. Tỉ lệ S5/S1 = 1,33 so với tỉ lệ thời lượng khai 25/20 = 1,25 —
tức **đúng họ**, không phình. Nếu review gate muốn kéo xuống, hai chỗ cắt được mà không mất learning job: Phần 19
(bảy câu — có thể chuyển hết sang quiz) và Phần 3 (rút xuống một bảng).

---

## Sources for future Nguồn block

> Tài liệu tham khảo cho khối "Nguồn tham khảo" khi dựng trang. Chỉ liệt kê nguồn **đã đọc trực tiếp** khi viết draft
> này; không kèm số dòng cho tài liệu web, không chế provenance.

**Tài liệu chính thức Android (developer.android.com) — thẩm quyền kỹ thuật cho phần doctrine.**

*Guide to app architecture* (đọc bản `?hl=en`, trang ghi cập nhật 2026-04-14):

- "Considering common architectural principles, design each application with at least two layers: **UI layer**:
  Displays application data on the screen — **Data layer**: Contains the business logic of your app and exposes
  application data"
- "The domain layer is an optional layer between the UI and data layers." · "The domain layer is optional because not
  all apps have these requirements. Use it only when needed"
- "Although the following recommendations aren't mandatory, in most cases following them makes your codebase more
  robust, testable, and maintainable." — câu này là chỗ tựa cho việc S5 bác bỏ doctrine "năm lớp bắt buộc".
- "When a new data type is defined in your app, assign a single source of truth (SSOT) to it. The SSOT is the owner of
  that data, and only the SSOT can modify or mutate it." · "In an offline-first application, the source of truth for
  application data is typically a database. In some other cases, the source of truth can be a ViewModel."
- "In UDF, state flows in only one direction, typically from parent component to child component. The events that
  modify the data flow in the opposite direction."

*Data layer* (đọc bản `?hl=en`, trang ghi cập nhật 2026-04-29):

- "The data layer is made of repositories that each can contain zero to many data sources. You should create a
  repository class for each different type of data you handle in your app."
- Trách nhiệm của repository: "Exposing data to the rest of the app. · Centralizing changes to the data. · Resolving
  conflicts between multiple data sources. · Abstracting sources of data from the rest of the app. · Containing
  business logic."
- "Each data source class should have the responsibility of working with only one source of data, which can be a file,
  a network source, or a local database."
- "It's important that each repository defines a single source of truth." · "The source of truth can be a data
  source—for example, the database—or even an in-memory cache that the repository might contain." · "Different
  repositories in your app might have different sources of truth." · "In order to provide offline-first support, a
  local data source—such as a database—is the recommended source of truth."
- "Other layers in the hierarchy should never access data sources directly; the entry points to the data layer are
  always the repository classes."
- "For one-shot operations, expose suspend functions." · "To be notified of data changes over time, expose flows." —
  chỗ tựa cho Phần 16.
- "Don't name the data source based on an implementation detail" — chỗ tựa cho quy ước đặt tên ở Phần 7 và 13.

**Giáo trình gốc (provenance đã đối chiếu trực tiếp, diễn giải lại — không trích nguyên văn):**
`content/book/ch10-room-database.md` — dòng 55–61 (tách app thành các vùng trách nhiệm "along these lines" rồi liệt kê
năm mục; mục tiêu then chốt là giao tiếp một chiều; kết quả là kiến trúc loosely coupled) · dòng 78 (ẩn dụ bánh nhiều
lớp: không ai ăn bánh theo từng lớp, dựng app theo từng miếng) · dòng 421 (repository là một lớp trừu tượng nữa giữa
Room và phần còn lại của app; nó quản lý được nhiều nguồn dữ liệu nhưng phơi ra một interface hợp nhất).

**Nội dung của chính khoá học (nguồn sư phạm và nguồn payoff, không phải nguồn khái niệm):**
`web/src/components/lessons/Ch10_1RoomLaGi.astro` mục 4–5 (dòng 270–401) ·
`web/src/components/lessons/Ch10_3RepositoryViewModel.astro` mục 11 và 13 (dòng 226–289, 382–431) ·
`docs/drafts/s1-coroutine-foundation.md` (mô hình chính xác của `suspend`, `viewModelScope`, `Flow`) ·
`web/src/components/lessons/Ch06AdvancedJetpackCompose.astro` (S2–S4: `ChatUiState`, `MessageUiModel`, cặp
`MutableStateFlow`/`StateFlow`, `stateIn`, và câu hỏi mở "dữ liệu đến từ đâu" ở dòng 1767–1771 và 2198–2203).

**Ví dụ tối giản do khoá dựng:** toàn bộ code trong bài (`Message` · `MessageUiModel` · `MessageRepository` ·
`InMemoryMessageRepository` · `RemoteMessageDataSource` · `InMemoryMessageCache` · `ChatViewModel`) — không trích
`aaf-materials/`.

























