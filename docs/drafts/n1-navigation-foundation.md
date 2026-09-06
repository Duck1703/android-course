# N1 — Điều hướng: nhiều màn hình trong một app

> **TRẠNG THÁI: DRAFT NỘI BỘ CHO BÀI HỌC TƯƠNG LAI.** File này KHÔNG phải trang site.
> Khi dựng bài chính thức (task IMP-048 trong `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`),
> nội dung học là phần "Bài học" phía dưới. Ba mục cuối file — "Editorial migration notes",
> "Editorial open questions", "Final readability-test inventory" — cùng "Sources for future Nguồn block"
> là **nội dung biên tập nội bộ, KHÔNG đưa cho người học** và không được để lọt vào trang bài học.
>
> **Vị trí trong khoá:** Giai đoạn 4 (Điều hướng), bài **1/2** — ngay sau S5 (kiến trúc & repository),
> **trước** N2 (back stack & truyền dữ liệu type-safe) và **trước** giai đoạn Mạng (W1–W3), nơi người học
> gặp `NavHost` thật của project mẫu. Phân loại **Lõi**. Thời lượng tham khảo ~25 phút — chỉ để tham khảo,
> không phải hạn mức cắt nội dung.
>
> **Đánh số mục:** draft dùng `Phần 1…15`; khi dựng trang, `Phần k` → `mục k`, bắt đầu lại từ 1 (cùng quy ước
> với S5 — xem "Editorial open questions" #1 của `docs/drafts/s5-app-architecture-repository.md`).
>
> **Phạm vi:** bài này dạy **bộ khung điều hướng**: destination · route · đồ thị · `NavController` · `NavHost` ·
> `startDestination` · `composable(...)` · `navigate(...)` · bức tranh đầu tiên về back stack.
> Cố tình **không** dạy: truyền dữ liệu giữa destination · route type-safe · `popBackStack` · Up-vs-Back ·
> `popUpTo` · `launchSingleTop` · lưu/khôi phục trạng thái điều hướng · deep link · đồ thị lồng nhau ·
> nhiều back stack · Navigation 3 (tất cả thuộc bài **N2** hoặc phần tra cứu) · networking (W1–W3) ·
> doctrine `CompositionLocal` (bài **D2** — ở đây chỉ nhận diện).
>
> **Ngân sách nhấn mạnh:** **4 callout** (Phần 4 mô hình trực quan · Phần 6 ghi chú chính xác ·
> Phần 8 đọc cú pháp · Phần 11 mô hình trực quan) và **6 checkpoint** — đúng hạn mức ≤4 callout của template.
>
> **Một dữ kiện quan trọng về nguồn code thật:** trong project mẫu của phần Mạng
> (`aaf-materials/08-networking/`), toàn bộ code điều hướng **đã có sẵn trong `starter`** —
> `MainActivity.kt` của `starter` và `final` **giống nhau từng byte** (đã kiểm bằng `diff`). Nghĩa là chương
> nguồn *dùng* điều hướng mà không *dạy* điều hướng. Đó chính là lỗ hổng mà N1 lấp.

---

# Bài học

## Mục tiêu — sau bài này bạn sẽ

- Giải thích được vì sao một app Compose cần một **cơ chế điều hướng** thay vì tự thay màn hình bằng một
  chuỗi `if`/`when` — và cũng nói được khi nào một `when` đơn giản vẫn là lựa chọn đúng.
- Phân biệt được **destination** (một chỗ đến), **route** (cái tên định danh chỗ đến đó) và **composable**
  (nội dung được vẽ ra khi tới đó) — ba thứ hay bị gộp thành một.
- Nói rõ được khác biệt giữa **`NavController`** và **`NavHost`**, không đổi lẫn hai cái.
- Đọc được một `NavHost` nhỏ và chỉ ra: controller · `startDestination` · từng destination được đăng ký ·
  chỗ `navigate(...)` được gọi.
- Vẽ được **back stack** sau một chuỗi `navigate(...)`, và nói được nút Back thường làm gì.
- Chỉ ra được ranh giới: composable con **phát ra sự kiện điều hướng**, `NavHost`/controller **thực hiện**
  điều hướng; ViewModel thường không cần biết `NavController` tồn tại.

**Tại sao điều này quan trọng khi làm Android.** Ở giai đoạn Mạng ngay sau đây, file `MainActivity.kt` của
project mẫu mở ra là một `NavHost` với ba destination, một `startDestination`, và những lời gọi
`navigate("details/…")` rải trong các composable con. Không có bài này, đoạn đó là **phép thuật của framework**:
người học chỉ biết "đừng sửa gì trong đó". Có bài này, người học đọc được bộ khung điều hướng và bỏ qua phần
mạng — đúng thứ tự cần thiết để học từng thứ một.

**Cần biết trước:**

- **C1–C3** — composable là gì, `Column`/`Row`/`Box`, `Modifier`, `Button`, `Text`, `Scaffold`, Material 3.
- **C4** — `@Preview` và vì sao một composable render được độc lập là điều tốt.
- **S2** — `remember` giữ giá trị qua các lần vẽ lại; state là gì.
- **S3** — state hoisting, callback `() -> Unit`, và **luồng dữ liệu một chiều**: giá trị đi xuống, sự kiện đi
  lên. Đây là nền quan trọng nhất của bài này.
- **S4** — ViewModel sở hữu state của màn hình (dùng ở Phần 13).
- **S5** — ý niệm **biên giới trách nhiệm** giữa các phần của app (dùng ở Phần 10, 12, 13).
- **F1** — hàm, tham số, **lambda đuôi** (trailing lambda). Cả bài này đọc được hay không phụ thuộc mảnh này.

**Chưa cần biết:** truyền dữ liệu giữa các màn hình · route type-safe · `popBackStack` · `popUpTo` ·
`launchSingleTop` · deep link · đồ thị lồng nhau · Navigation 3 (tất cả là bài **N2**) · Retrofit và mọi thứ
thuộc phần mạng (bài **W1–W3**) · `CompositionLocal` ở mức dùng được (bài **D2**). Ở đây chúng chỉ xuất hiện
dưới dạng *tên*, luôn kèm nhãn "sẽ học ở bài nào".

---

## Phần 1 — Vấn đề: một app, nhiều màn hình

### Vấn đề trước cú pháp

Cho tới hết Giai đoạn 3, mọi thứ bạn dựng đều nằm trên **một** màn hình. App thật thì không: một app nhỏ nhất
cũng đã có vài chỗ để đi tới. Lấy một app ba màn hình làm ví dụ xuyên suốt bài này:

```
Home  →  Details        (xem chi tiết một mục)
Home  →  Settings       (thiết lập)
```

Với những gì đã học, cách làm tự nhiên nhất là giữ một biến "đang ở màn hình nào" rồi phân nhánh:

```kotlin
@Composable
fun App() {
  var screen by remember { mutableStateOf("home") }

  if (screen == "home") {
    HomeScreen(onOpenDetails = { screen = "details" })
  } else if (screen == "details") {
    DetailsScreen()
  } else {
    SettingsScreen()
  }
}
```

**Đoạn code này chạy được, và nó không "sai".** Nói rõ điều đó ngay từ đầu, vì bài học này không nhằm dán nhãn
xấu lên một cách viết. Nó chỉ **không phải một mô hình điều hướng mở rộng được**. Năm chỗ dưới đây là chỗ nó bắt
đầu tốn kém, và đọc kỹ năm chỗ này chính là hiểu được thư viện điều hướng tồn tại để làm gì:

| Khi app lớn dần | Chuyện gì xảy ra với cách trên |
|---|---|
| **Thêm/đổi màn hình** | Mỗi màn hình mới lại phải sửa đúng cái hàm `App()`; chuỗi `if` dài dần và mọi thứ dồn vào một chỗ |
| **Nút Back của hệ thống** | Hệ điều hành không biết gì về biến `screen`. Đang ở Details bấm Back → app **thoát**, không quay về Home, trừ khi bạn tự viết thêm code xử lý Back |
| **Lịch sử màn hình** | "Quay lại chỗ vừa rồi" đòi phải nhớ *thứ tự* đã đi qua, không chỉ nhớ *đang ở đâu*. Một biến không đủ; bạn phải tự dựng một danh sách lịch sử |
| **Dữ liệu kèm theo** | "Mở Details của mục số 715538" — một chuỗi `"details"` không mang theo dữ liệu, nên bạn thêm biến thứ hai, rồi thứ ba |
| **Mở app từ bên ngoài** | Một thông báo hoặc một link muốn mở thẳng Details. Không có chỗ nào trong app *khai* rằng "Details tồn tại và mở tới được" |
| **App bị dựng lại** | Xoay máy hay hệ thống thu hồi tiến trình: bạn phải tự lo lưu và khôi phục cả lịch sử màn hình |

Điều hướng của Compose (thư viện **Navigation Compose**) tồn tại để nhận lấy đúng những việc đó. Nó cho bạn một
chỗ để **khai báo** app có những chỗ đến nào, và một đối tượng để **ra lệnh** di chuyển — thay vì bạn tự quản lý
bằng biến.

Một lời rào cần thiết, để bạn không suy diễn quá xa: một `when` phân nhánh **vẫn là lựa chọn đúng** cho việc đổi
nội dung *bên trong một màn hình* — ví dụ hai tab trong cùng một trang. Project mẫu của phần Mạng làm **cả hai**
cùng lúc: `NavHost` cho việc mở trang chi tiết, và một `when` theo chỉ số cho hai tab dưới đáy. Phần 15 sẽ xem
đúng đoạn code đó.

---

## Phần 2 — Destination: một chỗ có thể đi tới

Từ đầu tiên cần đặt cho đúng.

> **Destination = một chỗ trong app mà người dùng có thể được đưa tới.**

Ví dụ trong app ba màn hình ở trên: Home là một destination, Details là một destination, Settings là một
destination.

Điểm chính xác quan trọng, và cũng là cạm bẫy số một của cả bài: **destination là một khái niệm của điều hướng.**
Nó **không** đồng nghĩa với:

- **một Activity** — cả app trong project mẫu chỉ có **một** Activity duy nhất, mà vẫn có ba destination;
- **một file** — hai destination có thể dùng lại cùng một file (project mẫu làm đúng vậy: hai route khác nhau
  cùng vẽ ra `RecipeDetails`);
- **một hàm composable** — một destination *thường* vẽ ra một composable, nhưng "chỗ đến" và "hàm vẽ nội dung"
  là hai vai khác nhau.

Cách giữ hai ý đó tách rời trong đầu: destination là **một ô trong bản đồ**; composable là **thứ được vẽ ra khi
bạn tới ô đó**. Cùng một thứ được vẽ ra có thể nằm ở hai ô khác nhau của bản đồ.

---

## Phần 3 — Route: cái tên để chỉ một destination

Hệ thống điều hướng cần một cách **gọi tên** chỗ đến. Cách gọi tên đó là route.

> **Route = định danh mà hệ thống điều hướng dùng để chỉ tới một destination.**

Trong ví dụ của bài này, route là ba chuỗi:

```kotlin
"home"
"details"
"settings"
```

Đọc thẳng: khi code nói `navigate("details")`, nó đang nói *"đưa người dùng tới chỗ đến có tên `details`"*. Không
có gì huyền bí — route là một cái nhãn, và ở đây nhãn đó tình cờ là một chuỗi.

Hai điều cần nói cho chính xác, để bạn không nhớ sai:

- **Chuỗi không phải cách duy nhất, cũng không phải cách "hiện đại nhất", để biểu diễn route.** Nó là cách mà
  **project mẫu của khoá này** dùng, và là cách phổ biến trong tài liệu viết quanh năm 2023. Bài này dùng chuỗi
  vì mục tiêu số một là bạn đọc được code thật của project mẫu.
- **Route không chỉ định danh chỗ đến, nó còn là chỗ mang dữ liệu mà chỗ đến cần.** Ví dụ "mở Details của mục số
  715538" — thông tin `715538` phải đi đâu đó. Đó là lúc chuỗi thô bắt đầu chật, và là lý do có bài tiếp theo.

> 🔭 *Bài này chỉ dùng route dạng chuỗi đơn giản, không mang dữ liệu. **N2** sẽ dạy mô hình route **type-safe** —
> cách khoá này khuyên dùng khi destination cần mang dữ liệu theo — và giải thích cả cách project mẫu làm việc đó
> bằng chuỗi có chỗ trống. Ở đây bạn chỉ cần hiểu vai trò của route: một cái tên để chỉ chỗ đến.*

---

## Phần 4 — Đồ thị điều hướng: bản đồ các chỗ đến

Có ba chỗ đến và ba cái tên rồi, còn thiếu một thứ: **một chỗ khai báo tất cả**.

> **Đồ thị điều hướng (navigation graph) = bản đồ những destination mà app biết cách đi tới.**

Đồ thị định nghĩa ba thứ:

1. **Có những destination nào** — và mỗi cái mang route gì.
2. **Bắt đầu ở đâu** — destination đầu tiên khi đồ thị này được dựng lên (Phần 7).
3. **Nội dung của từng destination** — khi tới đó thì vẽ gì (Phần 8).

Với Compose, đồ thị này được khai ngay trong code Kotlin, bên trong `NavHost` (Phần 6). Nếu bạn tra tài liệu và
thấy người ta dựng đồ thị bằng một **file XML**, đó là cách làm của điều hướng cho Fragment/View — cùng thư viện
Navigation, nhưng khác cách khai báo. Khoá này chỉ dùng Navigation **Compose**, và không có file XML nào.

Trước khi vào code, gom cả năm khái niệm vào một bức tranh:

> **Mô hình trực quan — một sân khấu và một người điều khiển**
>
> Hình dung một buổi diễn có nhiều cảnh:
>
> - **Destination** = **một cảnh** — "cảnh phòng khách", "cảnh sân vườn".
> - **Route** = **tên cảnh ghi trong kịch bản** — cách gọi cảnh đó ra.
> - **Đồ thị điều hướng** = **kịch bản** — danh sách các cảnh và cảnh nào diễn đầu tiên.
> - **`NavHost`** = **sân khấu** — chỗ cảnh được dựng lên. Mỗi lúc trên sân khấu chỉ có **một** cảnh; đổi cảnh
>   nghĩa là tháo cảnh cũ và dựng cảnh mới lên đúng chỗ đó.
> - **`NavController`** = **người điều khiển** — biết đang diễn cảnh nào, đã đi qua những cảnh nào, và nhận lệnh
>   "sang cảnh `details`".
>
> Hai điều đáng nhớ từ ẩn dụ này: sân khấu và người điều khiển là **hai vai khác nhau** (Phần 6), và diễn viên
> trên sân khấu **không tự đổi cảnh** — họ ra hiệu, người điều khiển đổi (Phần 10).

> **Tự kiểm tra 1.** Trong app mẫu của phần Mạng, hai route khác nhau (`details/…` và `bookmarks/…`) cùng vẽ ra
> một hàm composable duy nhất tên `RecipeDetails`. Vậy app đó có bao nhiêu destination liên quan tới hàm này?
>
> 1. Một — vì chỉ có một hàm composable.
> 2. Hai — vì có hai chỗ đến trong đồ thị, dù nội dung được vẽ ra bởi cùng một hàm.
>
> *(Đáp án: 2. Destination đếm theo **bản đồ**, không đếm theo **hàm**. Đây chính là lý do Phần 2 tách hai ý đó
> ra: gộp chúng lại là cạm bẫy đầu tiên của điều hướng.)*

---

## Phần 5 — `NavController`: cái biết đang ở đâu và nhận lệnh đi

### Vấn đề trước cú pháp

Trước khi gõ một dòng nào, hỏi: để điều hướng hoạt động, phải có **ai đó** giữ những thông tin gì?

- **Đang ở destination nào** — không có cái này thì không biết vẽ gì.
- **Đã đi qua những destination nào** — không có cái này thì nút Back không có gì để quay về.
- **Nhận lệnh di chuyển** — phải có một chỗ để code nói "sang `details`".

Ba việc đó thuộc một đối tượng: **`NavController`**.

> **`NavController` = đối tượng điều phối điều hướng.** Nó theo dõi người dùng đã tới những chỗ nào, và nó cung
> cấp các hàm để di chuyển giữa các chỗ đến.

Bắt đầu dựng ví dụ. **Bước 1 — hai màn hình.** Chưa có gì mới ở đây; đúng khuôn hoisting của S3, màn hình nhận một
callback thay vì tự xử lý:

```kotlin
@Composable
fun HomeScreen(onOpenDetails: () -> Unit) {
  Column {
    Text("Trang chính")
    Button(onClick = onOpenDetails) {
      Text("Xem chi tiết")
    }
  }
}

@Composable
fun DetailsScreen() {
  Text("Trang chi tiết")
}
```

**Bước 2 — tạo controller.** Đúng một dòng:

```kotlin
val navController = rememberNavController()
```

Tách ba tầng cho rõ, vì dòng này trộn cả ba:

| Mảnh | Thuộc về | Nghĩa |
|---|---|---|
| `val navController = …` | **Kotlin** | Khai một biến chỉ đọc (F1) |
| `rememberNavController()` | **Navigation Compose** | Một hàm của *thư viện điều hướng*, không phải của Compose lõi |
| kết quả | Navigation Compose | Một `NavController` dùng được cho cả đồ thị |

Một điểm chính xác dễ đọc trượt: **`rememberNavController()` không phải `remember` của S2.** Tên nó có chữ
"remember" vì nó cũng giữ giá trị qua các lần vẽ lại, nhưng nó là một hàm riêng của thư viện điều hướng và nó tạo
sẵn controller theo đúng cách mà điều hướng cần. Bạn không tự `remember { NavController(...) }`. Chi tiết bên
trong không thuộc bài này — điều cần nhớ là: **muốn có controller trong Compose thì gọi `rememberNavController()`.**

Đặt dòng đó ở đâu? Tài liệu chính thức khuyên: **tạo `NavController` ở chỗ cao trong cây composable**, cao đủ để
mọi composable cần tham chiếu tới nó đều với tới được. Trong thực tế của bài này, "cao" nghĩa là: **ngay cạnh
`NavHost`**, trong cùng một composable. Phần 10 sẽ nói vì sao *không* nên rót nó xuống sâu hơn.

---

## Phần 6 — `NavHost`: chỗ đồ thị được dựng lên

**Bước 3 và 4 — dựng `NavHost` và đăng ký hai destination.**

```kotlin
@Composable
fun AppNavigation() {
  val navController = rememberNavController()

  NavHost(
    navController = navController,
    startDestination = "home"
  ) {
    composable("home") {
      HomeScreen(
        onOpenDetails = { navController.navigate("details") }
      )
    }

    composable("details") {
      DetailsScreen()
    }
  }
}
```

Đọc từng dòng:

| Dòng | Nó làm gì |
|---|---|
| `NavHost(` | Bản thân `NavHost` **là một composable**. Nó chiếm một chỗ trong layout của bạn, và destination đang hiện hành được vẽ ra **ở đúng chỗ đó** |
| `navController = navController` | Nối `NavHost` này với controller vừa tạo. Từ đây, lệnh gửi cho controller sẽ đổi nội dung của `NavHost` này |
| `startDestination = "home"` | Route của destination được dựng đầu tiên (Phần 7) |
| `{ … }` — lambda đuôi (F1) | **Toàn bộ đồ thị nằm trong khối này.** Đây là chỗ khai báo app có những chỗ đến nào |
| `composable("home") { … }` | Đăng ký một destination: route `"home"`, và nội dung của nó (Phần 8) |
| `onOpenDetails = { navController.navigate("details") }` | Callback được truyền xuống `HomeScreen`: khi màn hình đó báo "người dùng muốn mở chi tiết", *chỗ này* ra lệnh cho controller (Phần 9, 10) |

> **Ghi chú quan trọng — `NavController` và `NavHost` không phải một thứ**
>
> Đây là chỗ lẫn phổ biến nhất khi mới học điều hướng, và nếu lẫn thì mọi thứ sau đó đều mờ. Nói thẳng cả hai vai:
>
> | | `NavController` | `NavHost` |
> |---|---|---|
> | **Nó là gì** | Một **đối tượng** điều phối | Một **composable** |
> | **Giữ gì** | Đang ở đâu · đã đi qua đâu | Không giữ lịch sử; nó *vẽ* destination hiện hành |
> | **Bạn làm gì với nó** | Ra lệnh: `navigate(...)` | Khai báo: đồ thị và nội dung từng destination |
> | **Ẩn dụ Phần 4** | Người điều khiển | Sân khấu |
>
> Cách nhớ ngắn: **`NavController` là *hành động và trạng thái*; `NavHost` là *bản khai báo và chỗ hiển thị*.**
> Bạn không gọi `navigate()` trên `NavHost`, và bạn không khai destination trên `NavController`.
>
> Thêm một chi tiết đúng và hữu ích: **mỗi `NavHost` có `NavController` riêng của nó.** Đó là lý do dòng
> `navController = navController` phải có — nó là chỗ hai vai được nối lại với nhau.

---

## Phần 7 — `startDestination`: chỗ đồ thị bắt đầu

Câu hỏi mà `startDestination` trả lời, phát biểu chính xác:

> **Khi `NavHost` này được dựng lên và lịch sử điều hướng còn trống, destination nào được đặt vào đầu tiên?**

Trong ví dụ trên, câu trả lời là `"home"`.

Hai điều cần nói cho đúng:

- **Nó là destination khởi đầu *bình thường* của *đồ thị này*** — không phải một lời hứa vĩnh viễn rằng "app luôn
  mở ra ở đây". Sau này app có thể mở thẳng vào một chỗ khác: một thông báo dẫn tới trang chi tiết, một màn hình
  đăng nhập chen vào trước, hoặc hệ thống khôi phục lại đúng chỗ người dùng đang dừng. Những trường hợp đó có cơ
  chế riêng và không thuộc bài này.
- **Route bạn viết ở đây phải trùng với một route đã được đăng ký** trong khối bên dưới. Gõ lệch một chữ
  (`"hom"`) thì lỗi lộ ra ngay lúc đồ thị được dựng, chứ không phải một màn hình trắng lặng lẽ. Đó là hành vi tốt:
  sai thì sai to và sai ngay.

Với N1, chừng đó là đủ. `startDestination` = **chỗ vào bình thường của đồ thị**.

---

## Phần 8 — `composable(...)`: đăng ký một destination

Nhìn lại đúng một khối:

```kotlin
composable("details") {
  DetailsScreen()
}
```

Cách đọc, thành một câu:

> **"Khi route hiện hành là `details`, khối này cung cấp nội dung giao diện cho destination đó."**

Ba mảnh trong đó:

- `composable(...)` là **một hàm**, thuộc thư viện điều hướng. Gọi nó nghĩa là *đăng ký* một destination vào đồ
  thị đang được khai trong `NavHost`.
- `"details"` là route — cái tên để chỉ destination này.
- `{ DetailsScreen() }` là **lambda đuôi** (F1): tham số cuối là một lambda nên viết được ra ngoài cặp ngoặc. Nội
  dung bên trong chính là code Compose bình thường — bạn gọi các hàm `@Composable` như mọi khi.

Và đây là chỗ cần một hộp riêng, vì hai cái tên gần như trùng nhau:

> **Đọc cú pháp — `@Composable` và `composable(...)` là hai thứ khác nhau**
>
> | | `@Composable` | `composable(...)` |
> |---|---|---|
> | Nó là gì | Một **annotation** (chú thích) gắn lên một hàm | Một **hàm** của thư viện điều hướng |
> | Viết ở đâu | Ngay trước `fun` | Bên trong khối `{ … }` của `NavHost` |
> | Ai đọc nó | Trình biên dịch Compose | Thư viện điều hướng, lúc dựng đồ thị |
> | Nó làm gì | Cho phép hàm đó tham gia vẽ giao diện | Đăng ký một destination vào đồ thị |
>
> Khác nhau chỉ ở dấu `@` và một chữ hoa — nên đây là bẫy thật, không phải bẫy tưởng tượng.
>
> Nhưng hai thứ đó **có gặp nhau**, và hiểu chỗ gặp mới hết mờ: `composable("details")` đăng ký một chỗ đến, còn
> *nội dung* của chỗ đến ấy được viết bằng các hàm `@Composable`. Một cái là **mục trong bản đồ**, một cái là
> **cách vẽ**.

> **Tự kiểm tra 2.** Đoạn nào dưới đây khai một destination, đoạn nào khai một hàm vẽ giao diện?
>
> ```kotlin
> // (a)
> @Composable
> fun SettingsScreen() { /* … */ }
>
> // (b)
> composable("settings") { SettingsScreen() }
> ```
>
> *(Đáp án: (a) là hàm vẽ giao diện — annotation `@Composable`. (b) là destination — lời gọi hàm
> `composable(...)` của thư viện điều hướng, đăng ký route `"settings"` và nói nội dung của nó là gì. Bỏ (b) đi thì
> `SettingsScreen` vẫn tồn tại, chỉ là không có đường điều hướng nào tới nó.)*

---

## Phần 9 — `navigate(...)`: một cú chạm đi tới đâu

**Bước 5 — nối sự kiện với lệnh điều hướng.** Đây là dòng đã xuất hiện ở Phần 6:

```kotlin
composable("home") {
  HomeScreen(
    onOpenDetails = { navController.navigate("details") }
  )
}
```

Truy lại đường đi của một cú chạm, từng bước:

```
người dùng chạm nút "Xem chi tiết"
  → Compose gọi lambda onClick của Button
    → lambda đó gọi onOpenDetails()          (callback của S3)
      → onOpenDetails gọi navController.navigate("details")
        → controller nhận lệnh, tra route "details" trong đồ thị
        → controller ghi thêm một mục vào lịch sử điều hướng      (Phần 11)
      → destination hiện hành đổi thành "details"
    → NavHost tháo nội dung cũ, dựng nội dung của route "details"
  → DetailsScreen() được vẽ ra
```

Điểm chính xác quan trọng nhất của phần này, và là một trong bảy cạm bẫy ở cuối bài:

> **`navigate("details")` không phải một lời gọi hàm tới màn hình kế tiếp.**
> Bạn **không** gọi `DetailsScreen()`. Bạn gửi cho controller một **lệnh** kèm một **cái tên**. Controller tra bản
> đồ, đổi destination hiện hành, và `NavHost` mới là chỗ gọi hàm vẽ.

Hai hệ quả cụ thể của sự thật đó, cả hai đều thực dụng:

- **Route sai thì lỗi lộ ra lúc chạy, không phải lúc biên dịch.** `navController.navigate("detials")` biên dịch
  bình thường — vì với trình biên dịch nó chỉ là một chuỗi — rồi app dừng khi bạn bấm nút. Đây chính là cái giá của
  route dạng chuỗi mà Phần 3 đã nhắc, và là một trong những lý do có mô hình route type-safe (bài **N2**).
- **`navigate` làm nhiều hơn "hiện màn hình khác": nó ghi vào lịch sử.** Gọi một hàm thì không. Phần 11 nói riêng
  về chuyện này.

Nối lại với S3: **sự kiện vẫn đi theo chiều cũ.** `HomeScreen` không tự quyết định đi đâu; nó chỉ *báo ra* rằng
"người dùng muốn mở chi tiết". Việc *quyết định điều đó nghĩa là gì* nằm ở chỗ cao hơn — nơi đang giữ controller.
Điều hướng, nhìn theo S3, chỉ là **một hành động của app được một sự kiện kích hoạt**.

**Một quy tắc nhỏ nhưng quan trọng, nối với S2:** chỉ gọi `navigate(...)` **bên trong một callback**, không gọi nó
thẳng trong thân composable. Lý do rất cụ thể: thân một composable có thể chạy lại nhiều lần (recomposition — S2),
nên `navigate(...)` viết ở đó sẽ bị gọi lại mỗi lần vẽ lại. Đặt nó trong `onClick`/callback thì nó chỉ chạy khi có
sự kiện thật.

> **Tự kiểm tra 3.** Đoạn nào dưới đây có vấn đề?
>
> ```kotlin
> // (a)
> composable("home") {
>   Button(onClick = { navController.navigate("details") }) { Text("Đi") }
> }
>
> // (b)
> composable("home") {
>   navController.navigate("details")
>   Button(onClick = { }) { Text("Đi") }
> }
> ```
>
> *(Đáp án: (b). `navigate` nằm thẳng trong thân composable, nên nó chạy ngay lúc destination `home` được vẽ — và
> chạy lại mỗi lần vẽ lại. Kết quả là app tự nhảy sang `details` mà không ai bấm gì. (a) đúng: lệnh nằm trong
> callback.)*

---

## Phần 10 — Đừng rót `NavController` xuống mọi composable

Đây là chỗ S3 trả cổ tức, nên nói kỹ.

Khi một màn hình cần mở màn hình khác, có hai cách viết. Chúng chỉ khác nhau ở **tham số**:

```kotlin
// ❌ Màn hình nhận cả controller
@Composable
fun HomeScreen(navController: NavHostController) {
  Button(onClick = { navController.navigate("details") }) {
    Text("Xem chi tiết")
  }
}

// ✅ Màn hình chỉ nhận một sự kiện
@Composable
fun HomeScreen(onOpenDetails: () -> Unit) {
  Button(onClick = onOpenDetails) {
    Text("Xem chi tiết")
  }
}
```

(`NavHostController` là tên kiểu cụ thể mà `rememberNavController()` trả về. Gặp tên đó thì đọc là "cái controller
điều hướng".)

Với bản ✅, lời gọi `navigate` chuyển lên chỗ khai đồ thị — đúng nơi controller đang sống:

```kotlin
NavHost(navController = navController, startDestination = "home") {
  composable("home") {
    HomeScreen(
      onOpenDetails = { navController.navigate("details") }
    )
  }
  composable("details") {
    DetailsScreen()
  }
}
```

Bốn lý do, tất cả đều kiểm được:

| Lý do | Cụ thể là gì |
|---|---|
| **Dùng lại được** | `HomeScreen` không dính gì tới điều hướng, nên đặt được ở chỗ khác: một layout hai cột, một trang khác, hay một app khác |
| **Preview được** | `@Preview` chỉ cần truyền `onOpenDetails = { }`. Bản ❌ thì preview phải dựng cả bộ máy điều hướng mới render nổi (C4) |
| **Màn hình không cần biết máy móc điều hướng** | Nó chỉ biết "người dùng muốn xem chi tiết"; *xem chi tiết nghĩa là đi đâu* là chuyện của tầng trên |
| **Giữ đúng ranh giới của S3** | Giá trị đi vào qua tham số, sự kiện đi ra qua callback. Điều hướng không phải ngoại lệ |

Đây cũng là điều tài liệu chính thức khuyên, và họ nói bằng đúng từ vựng của S3: composable **không nên** được
truyền một tham chiếu `NavController` để tự gọi `navigate()`; theo nguyên tắc luồng dữ liệu một chiều, composable
nên **phát ra một sự kiện** để controller xử lý — cụ thể là **một tham số kiểu `() -> Unit`**.

**Không phải một điều cấm tuyệt đối.** Một số composable *đúng vai* là phần khung điều hướng — cái bọc ngoài đang
giữ `NavHost`, một thanh trên có nút quay lại, một thanh dưới chuyển tab theo route. Những composable đó cần
controller, và đưa nó vào là hợp lý. Quy tắc ở đây nhắm vào **màn hình và các composable lá**: chúng chỉ nên báo ra
sự kiện.

Cần biết trước khi đọc code thật ở Phần 14: **project mẫu của khoá này không dùng cách nào trong hai cách trên.**
Nó chọn cách thứ ba, và Phần 15 sẽ mổ đúng cách đó cùng cái giá của nó.

---

## Phần 11 — Back stack: bức tranh đầu tiên

**Bước 6 — vẽ ra lịch sử.** Phần 9 nói `navigate` *ghi thêm một mục vào lịch sử điều hướng*. Đây là chỗ nhìn thấy
cái lịch sử đó.

Giả sử người dùng làm ba việc:

```
mở app                    →  đang ở Home
chạm "Xem chi tiết"       →  navigate("details")
chạm "Thiết lập"          →  navigate("settings")
```

Lịch sử điều hướng lúc này:

```
TRÊN CÙNG    Settings     ← destination đang hiện
             Details
DƯỚI CÙNG    Home         ← startDestination, vào trước nhất
```

Hai câu là đủ cho N1:

- **`navigate(route)` thường *thêm* một mục lên trên cùng.** Mục đang hiện trước đó không mất đi, nó nằm xuống dưới.
- **Bấm Back thường *bỏ* mục trên cùng và hiện lại mục ngay dưới nó.** Từ Settings bấm Back → về Details; bấm nữa →
  về Home. Khi chỉ còn một mục, bấm Back thường đưa người dùng **ra khỏi app** — đúng như họ mong đợi.

So lại với Phần 1: đây chính là việc mà cách dùng một biến `screen` không làm được. Bạn không viết một dòng nào để
xử lý Back; thư viện điều hướng giữ lịch sử, nên nút Back của hệ thống có sẵn thứ để quay về.

> **Mô hình trực quan — chồng thẻ, và ba chỗ ẩn dụ này hụt**
>
> Hình dung mỗi lần `navigate` là **đặt thêm một tấm thẻ lên trên chồng thẻ**, và mỗi lần Back là **bỏ tấm trên
> cùng đi**. Đó là lý do người ta gọi nó là *stack* (chồng/ngăn xếp), và cái tên "back stack" đọc thẳng ra là
> "chồng thẻ để đi lui".
>
> Nhưng ẩn dụ nào cũng hụt ở đâu đó, nên nói luôn ba chỗ để bạn khỏi hiểu sai:
>
> 1. **Không có nhiều màn hình cùng được vẽ.** Mỗi lúc `NavHost` chỉ hiển thị **một** destination. Các mục bên dưới
>    là *lịch sử được ghi nhớ*, không phải mấy màn hình đang nằm đó vẽ sẵn.
> 2. **Chữ "thường" trong hai câu trên là có thật.** Có những lệnh điều hướng nói "đi tới đó **và** dọn bớt lịch
>    sử" — dùng nhiều khi làm đăng nhập hoặc tab. Chúng thuộc bài **N2**.
> 3. **Chồng thẻ này không nằm trong một biến của bạn.** Nó do controller giữ, và nó sống sót qua những thứ như
>    xoay máy — đó là một trong những việc bạn được miễn tự làm.

**Bài này cố tình không dạy:** `popBackStack()` · `popUpTo` và `inclusive` · phân biệt Up với Back ·
`launchSingleTop` · lưu/khôi phục trạng thái của từng nhánh (`saveState`/`restoreState`) · đồ thị lồng nhau ·
nhiều back stack song song. Đó là **toàn bộ nội dung của bài N2**, và cố nhồi vào đây chỉ làm mờ bức tranh vừa
dựng được.

> **Tự kiểm tra 4.** Từ trạng thái ba mục ở trên (Home · Details · Settings), người dùng bấm Back **một** lần rồi
> chạm một nút gọi `navigate("settings")`. Lịch sử lúc này gồm những gì, từ dưới lên?
>
> *(Đáp án: Home · Details · Settings. Back bỏ Settings đi, còn Home · Details; rồi `navigate("settings")` thêm
> Settings lên trên cùng lần nữa. Chú ý mục Settings mới **không** phải mục cũ được lấy lại — nó là một mục mới được
> ghi vào lịch sử.)*

---

## Phần 12 — Điều hướng không phải state của màn hình

Sau S2–S4, từ "state" đã nằm sẵn trong đầu bạn. Bài này thêm một loại thứ hai, và trộn hai loại là một lỗi thiết
kế tốn kém về sau.

| Thuộc **UI state** (S2–S4) | Thuộc **trạng thái điều hướng** |
|---|---|
| Chữ người dùng đang gõ | Destination nào đang hiện |
| Đang tải hay đã xong | Lịch sử điều hướng (back stack) |
| Bộ lọc/tab đang chọn *trong một màn hình* | |
| Mục nào đang mở rộng | |

Khác nhau ở chỗ: UI state trả lời *"màn hình này đang trông thế nào"*, còn trạng thái điều hướng trả lời *"người
dùng đang ở đâu trong app, và đã đi qua đâu"*. Cái thứ hai do controller giữ (Phần 5, 11), không phải do `UiState`
của bạn giữ.

Hai điều **đừng** làm mặc định:

- **Đừng nhét mọi quyết định điều hướng vào `UiState`** chỉ vì `UiState` là chỗ bạn quen đặt state.
- **Đừng nhớ thành "điều hướng thuộc ViewModel"** — Phần 13 nói riêng về chuyện này.

Một quy tắc an toàn, đủ dùng cho cả khoá:

> **Sự kiện của giao diện *yêu cầu* điều hướng; `NavHost`/controller *thực hiện* điều hướng.**

Có những tình huống phức tạp hơn — "lưu xong thì tự đóng trang", "đăng nhập thành công thì sang trang chính" — cần
một cách để ViewModel *báo ra* rằng có việc vừa xảy ra. Cách tổ chức những tín hiệu một-lần đó là một chủ đề thiết
kế riêng, không thuộc bài này.

---

## Phần 13 — Ranh giới ViewModel

Câu hỏi sẽ đến rất nhanh khi bạn viết app thật: *"Cho `NavController` vào ViewModel luôn có được không, để ViewModel
tự điều hướng?"*

Câu trả lời mặc định của khoá này: **không.** ViewModel thường nên **không biết** các class của Compose Navigation
tồn tại.

Ba lý do, và cả ba đã quen từ S5:

1. **Tách khỏi framework.** `NavController` là một mảnh của thư viện giao diện. Đưa nó vào ViewModel là kéo giao
   diện vào chỗ đang giữ state và logic của màn hình — đúng loại lẫn tầng mà S5 dạy cách tránh.
2. **Kiểm thử được.** Một ViewModel chỉ nhận dữ liệu và phơi ra state thì thử được không cần dựng giao diện. Một
   ViewModel cầm `NavController` thì không.
3. **ViewModel sở hữu state của màn hình, không sở hữu API điều hướng.** Nó biết "việc lưu đã xong"; nó không cần
   biết "xong thì đi đâu" — vì cùng một ViewModel có thể được dùng ở hai chỗ đi tới hai nơi khác nhau.

Khi một việc thành công trong ViewModel *nên* dẫn tới điều hướng, hình dạng chung là:

```
ViewModel đổi state (hoặc phát ra một tín hiệu)
  → giao diện quan sát thấy
    → phần giao diện/điều hướng gọi navigate(...)
```

Chú ý ai gọi `navigate(...)` trong chuỗi đó: **tầng giao diện**, không phải ViewModel. Đây đúng là mô hình của Phần
10, chỉ khác chỗ sự kiện xuất phát: ở Phần 10 nó đến từ một cú chạm, ở đây nó đến từ một việc vừa xong.

Chỉ cần nhận ra hình dạng đó là đủ cho N1. Cách hiện thực chi tiết cho những tín hiệu một-lần không thuộc bài này.

> **Tự kiểm tra 5.** Câu nào *đúng*?
>
> 1. `NavController` nên được truyền vào constructor của ViewModel để ViewModel điều hướng được.
> 2. ViewModel đổi state; tầng giao diện thấy state đó rồi gọi `navigate(...)`.
> 3. Destination đang hiện nên được lưu trong `UiState` để ViewModel biết người dùng đang ở đâu.
>
> *(Đáp án: 2. Câu 1 phá ranh giới của Phần 13. Câu 3 trộn hai loại state của Phần 12 — controller đã giữ thông tin
> đó, `UiState` giữ thêm một bản là tự tạo hai nguồn có thể lệch nhau.)*

---

## Phần 14 — Đọc code điều hướng thật trong project mẫu

Giờ tới phần bài này tồn tại vì nó. Project mẫu của giai đoạn Mạng có một `NavHost` thật, và bạn sắp mở nó ra.

Định vị: `aaf-materials/08-networking/projects/final/app/src/main/java/com/kodeco/recipefinder/MainActivity.kt`
— cả file 121 dòng, và toàn bộ phần điều hướng nằm trong đó.

Hai dữ kiện nên biết trước khi đọc:

- **Code điều hướng đã có sẵn trong `starter`.** File `MainActivity.kt` của `starter` và `final` giống nhau từng
  byte. Nghĩa là chương nguồn *dùng* điều hướng chứ không *dạy* điều hướng — bạn không phải gõ nó, bạn phải **đọc
  được** nó.
- **Đây là chỗ điều hướng xuất hiện lần đầu trong cả bộ project mẫu.** Các chương trước không có dòng nào:
  không `NavHost`, không `rememberNavController`, và cũng không khai thư viện điều hướng.

### 14.1 Bộ khung: bốn dòng

Bỏ hết chi tiết đi thì bộ khung đúng bằng những gì bạn vừa học:

```kotlin
val navController = rememberNavController()                                  // dòng 78

NavHost(navController = navController, startDestination = "main") {           // dòng 84
  composable("main") { MainScreen() }                                        // dòng 85
  composable("details/{recipeId}",   /* … */) { /* … */ }                    // dòng 86–95
  composable("bookmarks/{recipeId}", /* … */) { /* … */ }                    // dòng 96–105
}
```

Đọc được ngay: một controller, một host, `startDestination = "main"`, và **ba** destination.

### 14.2 Nguyên văn, và chỗ nào thuộc bài sau

Đây là toàn bộ khối `NavHost` như nó thật sự được viết, dòng 84–106:

```kotlin
NavHost(navController = navController, startDestination = "main") {
  composable("main") { MainScreen() }
  composable(
    "details/{recipeId}",
    arguments = listOf(navArgument("recipeId") {
      type = NavType.IntType
    })
  ) { backStackEntry ->
    RecipeDetails(
      recipeId = backStackEntry.arguments?.getInt("recipeId") ?: 0
    )
  }
  composable(
    "bookmarks/{recipeId}",
    arguments = listOf(navArgument("recipeId") {
      type = NavType.IntType
    })
  ) { backStackEntry ->
    RecipeDetails(
      databaseRecipeId = backStackEntry.arguments?.getInt("recipeId") ?: 0
    )
  }
}
```

Trông rối hơn ví dụ của bài này, nhưng phần rối thêm chỉ làm **một** việc: mang một con số theo cùng route. Bảng
dưới tách rõ chỗ nào bạn đã học và chỗ nào để bài sau:

| Dòng | Code | Thuộc đâu |
|---|---|---|
| 78 | `val navController = rememberNavController()` | **N1** — Phần 5 |
| 84 | `NavHost(navController = …, startDestination = "main")` | **N1** — Phần 6 và 7 |
| 85 | `composable("main") { MainScreen() }` | **N1** — Phần 8, đúng khuôn bạn vừa đọc |
| 87 · 97 | route có chỗ trống: `"details/{recipeId}"` | **N2** — route mang dữ liệu |
| 88–90 · 98–100 | `arguments = listOf(navArgument("recipeId") { type = NavType.IntType })` | **N2** — khai kiểu của dữ liệu đi kèm |
| 91 · 101 | `{ backStackEntry -> … }` | **N2** — lấy dữ liệu ra từ mục lịch sử |
| 92–93 · 102–103 | `RecipeDetails(recipeId = backStackEntry.arguments?.getInt("recipeId") ?: 0)` | **N2** |

Nói cách khác: **bỏ ba mảnh N2 ra thì đoạn code trên chính là ví dụ của Phần 6.** Đó là toàn bộ mục tiêu của bài
này — nhận ra bộ khung dưới lớp chi tiết.

### 14.3 Lệnh `navigate` được gọi ở đâu

Có đúng **ba** lời gọi `navigate` trong cả app, và không cái nào nằm trong `MainActivity.kt`:

| Chỗ gọi | Lệnh |
|---|---|
| `ui/recipes/ShowRecipeList.kt` dòng 114 | `navController.navigate("details/${item.id}")` — chạm vào một thẻ công thức |
| `ui/widgets/BookmarkCard.kt` dòng 75 | `navController.navigate("bookmarks/${recipe.id}")` — chạm vào thân thẻ đã lưu |
| `ui/widgets/BookmarkCard.kt` dòng 108 | `navController.navigate("bookmarks/${recipe.id}")` — chạm vào nút mũi tên của cùng thẻ đó |

Cả ba đều nằm trong một callback (`Modifier.clickable { … }` hoặc `onClick = { … }`) — đúng quy tắc ở Phần 9.

Nhưng câu hỏi thú vị hơn là: **`ShowRecipeList` lấy `navController` ở đâu ra?** Nó không nhận controller qua tham
số, và nó không nhận callback. Nó tự lấy:

```kotlin
@Composable
fun ColumnScope.ShowRecipeList(
  recipes: MutableState<List<Recipe>>,
  viewModel: RecipeViewModel
) {
  val navController = LocalNavigatorProvider.current      // dòng 73
```

*(Hai chi tiết cú pháp trong dòng khai hàm, chỉ cần đọc qua rồi bỏ: `ColumnScope.` nghĩa là hàm này được viết để gọi
bên trong một `Column`; `MutableState<List<Recipe>>` là chính cái kiểu mà `mutableStateOf(...)` của S2 trả về, ở đây
được truyền xuống làm tham số. Cả hai không liên quan tới điều hướng.)*

`LocalNavigatorProvider` được khai ở `MainActivity.kt` dòng 59–60 và được "rót" vào ở dòng 81–83, ngay trước
`NavHost`. Đây là **cơ chế thứ ba** để đưa một giá trị xuống cây composable: không truyền qua tham số, không truyền
qua callback, mà đặt sẵn ở trên rồi mọi composable bên dưới lấy ra bằng `.current`.

> 🔭 *Cơ chế đó tên là `CompositionLocal`. Bài này chỉ cần bạn **nhận ra** nó khi đọc code: `.current` nghĩa là "lấy
> giá trị đã được rót từ trên xuống". Cách dùng nó cho tử tế, và khi nào nên dùng, là nội dung bài **D2**. Phần 15
> nói về cái giá của việc dùng nó cho `NavController`.*

Ba chỗ đọc `.current` trong app: `ui/RecipeDetails.kt` dòng 92 · `ui/recipes/ShowRecipeList.kt` dòng 73 ·
`ui/widgets/BookmarkCard.kt` dòng 68.

### 14.4 Ba route, hai màn hình

| Route | Vẽ ra gì | Ở đâu |
|---|---|---|
| `"main"` | `fun MainScreen()` — không tham số | `ui/MainScreen.kt` dòng 57–58 |
| `"details/{recipeId}"` | `fun RecipeDetails(recipeId: Int? = null, databaseRecipeId: Int? = null)` | `ui/RecipeDetails.kt` dòng 83–84 |
| `"bookmarks/{recipeId}"` | **cùng hàm `RecipeDetails`**, chỉ điền tham số khác | như trên |

Đây là bằng chứng sống cho Phần 2: **ba destination, hai hàm composable.** Nếu bạn đếm destination theo số hàm, bạn
sẽ đếm sai app này.

Thư viện được khai ở đâu: `gradle/libs.versions.toml` dòng 17 (`navigation="2.7.2"`) và dòng 54 (trỏ tới
`androidx.navigation:navigation-compose`), rồi `app/build.gradle.kts` dòng 69 (`implementation(libs.navigation)`).

### 14.5 Điều bạn vừa mở khoá được

Đáng dừng một nhịp để thấy rõ mình vừa được gì.

Trước bài này, mở `MainActivity.kt` của project mẫu ra là gặp một khối mười mấy dòng với `NavHost`, `composable`,
`navArgument`, `NavType`, `backStackEntry`, `CompositionLocalProvider` — tất cả cùng lúc, không cái nào từng được
giới thiệu. Cách xử lý duy nhất là "đừng sửa gì trong đó".

Sau bài này bạn đọc được bộ khung, biết ba mảnh nào để dành cho N2, và biết chắc một điều nữa: **trong cả file
`MainActivity.kt` không có một dòng nào thuộc phần mạng.** Retrofit, JSON, ảnh tải về — chúng nằm ở file khác và là
nội dung của **W1–W3**. Bộ khung điều hướng đứng độc lập, đọc được mà không cần biết gì về mạng. Đó chính là tiêu
chí thành công của bài này.

---

## Phần 15 — Bốn chỗ code mẫu làm khác cách khoá này khuyên

Bài này dạy một cách, project mẫu làm một cách khác. Cả hai đều chạy. Việc của bạn không phải chọn bên, mà là
**đọc được code mẫu** và **biết mình sẽ viết theo cách nào**.

| # | Code mẫu làm gì | Khoá này khuyên gì | Nên theo cái nào |
|---|---|---|---|
| 1 | Route là **chuỗi thô**, kèm chỗ trống `{recipeId}` | N2 dạy mô hình route **type-safe** cho destination mang dữ liệu | Đọc code mẫu bằng chuỗi (không đổi gì); viết code mới theo mô hình N2 |
| 2 | Controller được **rót xuống cả cây** bằng `LocalNavigatorProvider`, composable lá tự lấy bằng `.current` | Màn hình nhận **callback `() -> Unit`**, lệnh `navigate` nằm ở chỗ khai đồ thị (Phần 10) | Callback ở biên màn hình — xem cái giá cụ thể ngay dưới |
| 3 | **Hai cơ chế đổi màn hình cùng tồn tại**: `NavHost` cho trang chi tiết, `when` theo chỉ số cho hai tab | Dùng đúng cơ chế cho đúng việc | Cả hai đều hợp lý — nhưng phải biết chúng khác nhau |
| 4 | Đã dùng `popBackStack()` ở hai chỗ | N1 chưa dạy; **N2** dạy | Gặp thì biết đó là "đi lui một mục trong lịch sử", chờ N2 |

Ba chỗ đáng nói thêm.

**Về #1 — không gọi chuỗi thô là "sai".** Thư viện điều hướng trong project mẫu là bản **2.7.2** (năm 2023), và
chuỗi là cách biểu diễn route bình thường của thời điểm đó. Thư viện đã đi tiếp từ đó; bài **N2** mang ghi chú phiên
bản cập nhật cùng mô hình route mà khoá này khuyên dùng. Điều duy nhất cần rút ra ở đây: chuỗi thô có một cái giá đã
nói ở Phần 9 — gõ sai thì lỗi chỉ lộ ra lúc chạy.

**Về #2 — cái giá của cách rót controller xuống cả cây, kiểm được bằng mắt.** `LocalNavigatorProvider` được khai với
giá trị mặc định là **ném lỗi** (`error("No navigation provided")`, `MainActivity.kt` dòng 59–60). Nó chỉ có giá trị
thật khi composable nằm bên dưới chỗ rót (dòng 81–83). Nhưng `ShowRecipeList` đọc `.current` ngay dòng đầu thân hàm
(dòng 73). Hệ quả: **composable đó không render được ở bất cứ đâu không nằm dưới chỗ rót — kể cả trong một
`@Preview`.** Đúng hai hàm preview có sẵn trong project chạm phải chuyện này:
`ui/recipes/ShowRecipeList.kt` dòng 124–135 và `ui/recipes/RecipeList.kt` dòng 95–101 (gọi gián tiếp) — chúng báo
lỗi "No navigation provided" thay vì vẽ giao diện.

So lại với bản ✅ ở Phần 10: một `HomeScreen(onOpenDetails: () -> Unit)` thì preview chỉ cần
`onOpenDetails = { }`. Đó là ý nghĩa cụ thể của chữ "preview được" trong bảng bốn lý do — không phải một lời khen
trừu tượng.

**Về #3 — hai cơ chế, và một hệ quả kiểm được.** Ở `ui/MainScreen.kt`, hai tab dưới đáy được đổi bằng một biến chỉ
số và một `when`:

```kotlin
// ui/MainScreen.kt — dòng 59–61 khai biến, dòng 89–92 phân nhánh
val selectedIndex = remember { mutableIntStateOf(0) }
// …
when (selectedIndex.intValue) {
  0 -> RecipeList()
  1 -> GroceryList()
}
```

*(Hai mảnh cú pháp đọc qua là đủ: `when (x) { 0 -> … 1 -> … }` là cách viết gọn của một chuỗi "nếu x bằng 0 thì… ,
nếu bằng 1 thì…"; và `mutableIntStateOf` là biến thể dành cho số nguyên của `mutableStateOf` mà bạn đã dùng ở S2 —
cùng ý nghĩa, đọc giá trị bằng `.intValue` thay vì `.value`.)*

Đây chính là cách viết mà Phần 1 nói "chạy được và không sai" — và ở đây nó **đúng chỗ**: hai tab là hai cách trình
bày *bên trong một destination*, không phải hai chỗ đến. Nhưng hệ quả phải nhìn thấy: **vì tab không nằm trong back
stack, đang ở tab Groceries bấm Back sẽ không đưa bạn về tab Recipes.** Đó là sự khác nhau giữa "đổi nội dung trong
một màn hình" và "đi tới một destination khác" — và là cách phân biệt thực dụng nhất khi bạn tự thiết kế app.

> **Tự kiểm tra 6.** App của bạn có một trang danh sách và một trang chi tiết, người dùng cần bấm Back để quay từ
> chi tiết về danh sách. Dùng cơ chế nào?
>
> 1. Một biến `selectedIndex` và `when`, như hai tab của project mẫu.
> 2. Hai destination trong `NavHost`, chuyển bằng `navigate(...)`.
>
> *(Đáp án: 2 — vì yêu cầu có chữ "bấm Back". Muốn Back hoạt động thì phải có lịch sử điều hướng, và lịch sử đó do
> controller giữ. Với cách 1 bạn sẽ phải tự viết lại toàn bộ phần xử lý Back.)*

---

## Cạm bẫy

> *Khi dựng trang: đây là khối `<h2 id="cam-bay">` duy nhất của bài. Ba cạm bẫy dưới đây được gom theo **niềm tin
> sai của người học** — mỗi cạm bẫy sửa một quyết định, không phải một API — đúng giới hạn "tối đa 3 cạm bẫy / bài"
> của template. Bảy cạm bẫy cụ thể của điều hướng được xử lý trong ba nhóm này.*

**(a) "Tên nghe giống nhau thì là cùng một thứ."** Điều hướng có ba cặp tên gần nhau, và lẫn cặp nào cũng làm mờ
phần còn lại.

- **Destination ≠ hàm composable.** Destination là *một ô trong bản đồ*; composable là *thứ được vẽ khi tới ô đó*.
  Project mẫu có **ba** destination nhưng chỉ **hai** hàm màn hình — đếm theo hàm là đếm sai (Phần 2, 14.4).
- **`@Composable` ≠ `composable(...)`.** Một cái là annotation cho trình biên dịch Compose, một cái là hàm của thư
  viện điều hướng để đăng ký destination. Khác nhau đúng một dấu `@` và một chữ hoa (Phần 8).
- **`NavController` ≠ `NavHost`.** Controller là *đối tượng* giữ trạng thái và nhận lệnh; host là *composable* khai
  đồ thị và hiển thị destination hiện hành. Bạn không gọi `navigate()` trên host, và không khai destination trên
  controller (Phần 6).

**(b) "Đổi màn hình chỉ là thay nội dung đang vẽ."** Đây là niềm tin đứng sau hai lỗi khác nhau.

- **`navigate("details")` không phải một lời gọi hàm tới `DetailsScreen()`.** Nó là một *lệnh* kèm một *cái tên*:
  controller tra bản đồ, ghi thêm một mục vào lịch sử, rồi host mới vẽ. Hai hệ quả bạn sẽ gặp thật: route sai chỉ
  lộ lỗi lúc chạy, và `navigate` còn làm một việc mà lời gọi hàm không làm — ghi lịch sử (Phần 9).
- **Tự thay màn hình bằng biến, mãi mãi.** Một `when` là đủ để đổi nội dung *trong* một màn hình — project mẫu làm
  đúng vậy cho hai tab. Nhưng dùng nó thay cho điều hướng thì bạn phải tự viết lại lịch sử, tự xử lý Back, tự lo
  khôi phục sau khi app bị dựng lại. Câu hỏi phân biệt gọn nhất: *"người dùng có cần bấm Back để quay lại chỗ vừa
  rồi không?"* Có → đó là hai destination (Phần 1, 15).

**(c) "Chỗ nào cần điều hướng thì chỗ đó phải có controller."** Nghe hợp lý, và dẫn tới hai chỗ rò rỉ.

- **Rót `NavController` xuống mọi composable lá.** Màn hình chỉ cần *báo ra* một sự kiện `() -> Unit`; lệnh
  `navigate` thuộc chỗ khai đồ thị. Cái giá của việc làm ngược thì kiểm được bằng mắt: composable dính vào máy móc
  điều hướng sẽ không preview được, và không dùng lại được ở chỗ khác (Phần 10, 15).
- **Đưa `NavController` vào ViewModel.** ViewModel giữ state và logic của màn hình, không giữ API giao diện. Hình
  dạng đúng: ViewModel đổi state → giao diện quan sát thấy → tầng giao diện gọi `navigate(...)` (Phần 13).

Câu để nhớ, và là câu nên mang ra khỏi cả bài:

> **Điều hướng là một *hành động của app*, không phải một *cách gọi hàm*.** Màn hình phát ra sự kiện; controller
> giữ lịch sử và ra quyết định; host hiển thị. Ba vai đó tách nhau là lý do điều hướng mở rộng được.

---

## Tóm tắt

Năm điều cần giữ lại — nếu chỉ nhớ được năm dòng, hãy là năm dòng này:

1. **Destination là một chỗ có thể đi tới; route là cái tên định danh chỗ đó.** Cả hai là khái niệm của điều hướng,
   không phải của Compose — một destination *thường* vẽ ra một composable, nhưng chúng không phải một thứ.
2. **`NavController` điều phối điều hướng và giữ lịch sử.** Tạo nó bằng `rememberNavController()`, đặt ở chỗ cao,
   ngay cạnh `NavHost`.
3. **`NavHost` khai đồ thị và là chỗ destination hiện hành được hiển thị.** Bên trong nó, mỗi
   `composable("route") { … }` đăng ký một destination cùng nội dung của nó; `startDestination` là chỗ vào bình
   thường của đồ thị.
4. **`navigate(route)` là một *lệnh*, và nó thường ghi thêm một mục vào lịch sử.** Nhờ lịch sử đó mà nút Back của hệ
   thống có chỗ để quay về — bạn không phải tự viết.
5. **Ở biên màn hình, dùng callback thay vì rót `NavController` đi khắp nơi.** Màn hình phát ra sự kiện, chỗ khai đồ
   thị gọi `navigate(...)`. Đây là chính khuôn luồng một chiều của S3, áp vào điều hướng.

---

## Luyện tập — đọc một app ba màn hình và chỉ ra từng mảnh

Đây là toàn bộ phần điều hướng của một app ba màn hình, không có gì khác. Đọc rồi trả lời bảy câu bên dưới.

```kotlin
@Composable
fun HomeScreen(                                                    // ①
  onOpenDetails: () -> Unit,
  onOpenSettings: () -> Unit
) {
  Column {
    Text("Trang chính")
    Button(onClick = onOpenDetails) { Text("Xem chi tiết") }
    Button(onClick = onOpenSettings) { Text("Thiết lập") }
  }
}

@Composable
fun DetailsScreen() { Text("Trang chi tiết") }

@Composable
fun SettingsScreen() { Text("Thiết lập") }

@Composable
fun AppNavigation() {
  val navController = rememberNavController()                      // ②

  NavHost(                                                         // ③
    navController = navController,
    startDestination = "home"                                      // ④
  ) {
    composable("home") {                                           // ⑤
      HomeScreen(
        onOpenDetails = { navController.navigate("details") },      // ⑥
        onOpenSettings = { navController.navigate("settings") }
      )
    }
    composable("details") { DetailsScreen() }                       // ⑦
    composable("settings") { SettingsScreen() }
  }
}
```

1. Controller được tạo ở đâu, và vì sao nó nằm ở đúng chỗ đó?
2. Host là mảnh nào? Nó khác controller ở chỗ nào?
3. Destination nào được dựng đầu tiên khi app mở?
4. App này có bao nhiêu destination, và bao nhiêu hàm màn hình?
5. `HomeScreen` có biết `NavController` tồn tại không? Nó biết những gì?
6. Người dùng mở app → chạm "Thiết lập" → chạm Back. Vẽ lịch sử điều hướng sau mỗi bước.
7. Nếu ai đó sửa ⑦ thành `composable("detail")` mà giữ ⑥ nguyên, chuyện gì xảy ra và **khi nào**?

<details>
<summary>Xem lời giải</summary>

1. **②**, dòng `val navController = rememberNavController()`. Nó nằm trong `AppNavigation` — cùng chỗ với `NavHost`
   và cao hơn mọi màn hình. Đó là chỗ đúng vì `navigate(...)` được gọi ở đây (⑥), còn các màn hình không cần
   controller (Phần 5, 10).
2. **③** — `NavHost` là host: một **composable**, khai đồ thị trong khối `{ … }` và hiển thị destination hiện hành.
   Controller (②) là một **đối tượng**: giữ đang-ở-đâu và lịch sử, nhận lệnh `navigate(...)`. Dòng
   `navController = navController` là chỗ nối hai vai lại (Phần 6).
3. `"home"`, vì **④** `startDestination = "home"`. Nói cho đúng: đó là chỗ vào *bình thường* của đồ thị này, không
   phải một lời hứa vĩnh viễn (Phần 7).
4. **Ba destination** (`home` ⑤, `details` ⑦, `settings`) và **ba hàm màn hình**. Ở app này hai con số tình cờ bằng
   nhau — trong project mẫu của phần Mạng thì không (3 destination, 2 hàm). Đừng lấy con số này làm quy tắc (Phần 2,
   14.4).
5. **Không.** `HomeScreen` (①) chỉ nhận hai tham số `() -> Unit`. Nó biết "có hai việc người dùng có thể muốn làm",
   và không biết mỗi việc dẫn tới đâu. Đây là khuôn của Phần 10 và là lý do nó preview được chỉ với
   `onOpenDetails = { }`.
6. Mở app: `home`. Chạm "Thiết lập" → ⑥ gọi `navigate("settings")` → lịch sử thành `home` · `settings` (settings ở
   trên cùng, đang hiện). Chạm Back → bỏ mục trên cùng → còn `home`, và Home hiện lại. Bấm Back lần nữa thì thường
   ra khỏi app, vì chỉ còn một mục (Phần 11).
7. App **vẫn biên dịch bình thường** — với trình biên dịch, `"details"` ở ⑥ chỉ là một chuỗi, nó không kiểm tra xem
   route đó có tồn tại trong đồ thị hay không. Lỗi lộ ra **lúc chạy**, đúng lúc người dùng chạm "Xem chi tiết". Đây
   chính là cái giá của route dạng chuỗi mà Phần 3, 9 và 15 nói tới, và là một trong những lý do có mô hình route
   type-safe ở bài **N2**.

</details>

---

## Editorial migration notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

### A. Nguồn code thật đã thu hoạch (đã kiểm từng dòng)

Gốc: `aaf-materials/08-networking/projects/final/app/src/main/java/com/kodeco/recipefinder/`.
**`starter` và `final` giống nhau từng byte** ở `MainActivity.kt` và `ui/RecipeDetails.kt` (kiểm bằng `diff`), nên
mọi số dòng dưới đây dùng được cho cả hai.

| Nội dung | Vị trí | Dùng ở đâu trong N1 |
|---|---|---|
| Khai `navigation="2.7.2"` | `gradle/libs.versions.toml` dòng 17 | Phần 14.4, Phần 15 (#1) |
| Trỏ tới `androidx.navigation:navigation-compose` | `gradle/libs.versions.toml` dòng 54 (starter: dòng 51) | Phần 14.4 |
| `implementation(libs.navigation)` | `app/build.gradle.kts` dòng 69 | Phần 14.4 |
| `val LocalNavigatorProvider = compositionLocalOf<NavHostController> { error("No navigation provided") }` | `MainActivity.kt` dòng 59–60 | Phần 14.3, 15 (#2) |
| `val navController = rememberNavController()` | `MainActivity.kt` dòng 78 | Phần 14.1, 14.2 |
| `CompositionLocalProvider(LocalNavigatorProvider provides navController)` | `MainActivity.kt` dòng 81–83 | Phần 14.3 |
| Khối `NavHost` đầy đủ, `startDestination = "main"`, 3 `composable(...)` | `MainActivity.kt` dòng 84–106 | Phần 14.1, 14.2 (trích nguyên văn) |
| `navController.navigate("details/${item.id}")` | `ui/recipes/ShowRecipeList.kt` dòng 114 | Phần 14.3 |
| `val navController = LocalNavigatorProvider.current` | `ui/recipes/ShowRecipeList.kt` dòng 73 | Phần 14.3, 15 (#2) |
| `navController.navigate("bookmarks/${recipe.id}")` ×2 | `ui/widgets/BookmarkCard.kt` dòng 75 và 108 | Phần 14.3 |
| `.current` (hai chỗ đọc còn lại) | `ui/widgets/BookmarkCard.kt` dòng 68 · `ui/RecipeDetails.kt` dòng 92 | Phần 14.3 |
| `fun MainScreen()` — destination `"main"` | `ui/MainScreen.kt` dòng 57–58 | Phần 14.4 |
| `fun RecipeDetails(recipeId: Int? = null, databaseRecipeId: Int? = null)` — hai route dùng chung | `ui/RecipeDetails.kt` dòng 83–84 | Phần 2, 14.4 |
| Tab đổi bằng chỉ số: `mutableIntStateOf(0)` và `when (selectedIndex.intValue)` | `ui/MainScreen.kt` dòng 59–61 và 89–92 | Phần 1, 15 (#3) |
| `popBackStack()` ×2 | `ui/RecipeDetails.kt` dòng 167 và 190 | Phần 15 (#4) — chỉ nêu tên |
| `navController: NavHostController` truyền vào một composable con | `ui/RecipeDetails.kt` dòng 152–159 (gọi ở 138–144, truyền theo vị trí) | Phần 15 (#2) — bằng chứng cho cạm bẫy (c) |
| Hai `@Preview` không render được | `ui/recipes/ShowRecipeList.kt` dòng 124–135 · `ui/recipes/RecipeList.kt` dòng 95–101 | Phần 15 (#2) |

**Không tồn tại trong project (đã kiểm, zero match) — nên không bài nào được viện dẫn project mẫu cho chúng:**
`Screen` sealed class/object/enum hay bất kỳ file hằng số route nào · `popUpTo` · `launchSingleTop` ·
`saveState`/`restoreState` · deep link (`navDeepLink`/`deepLinks =`; `AndroidManifest.xml` chỉ có `MAIN`/`LAUNCHER`) ·
đồ thị lồng nhau `navigation(...)` · `NavigationBar`/`NavigationBarItem` (Material 3) ·
`currentBackStackEntry`/`currentBackStackEntryAsState` · route type-safe với `@Serializable` (bản 2.7.2 có trước API
đó) · test liên quan điều hướng.

**Điều hướng xuất hiện lần đầu ở chương 08 trong toàn bộ `aaf-materials/`.** Chương 01–07: 0 match cho `NavHost` và
`rememberNavController`, và không chương nào khai thư viện điều hướng. Chương 07 là app khác hẳn
(`com.kodeco.chat`, một màn hình), nên không có tính liên tục nào với đồ thị của RecipeFinder.

### B. Phân loại nội dung liên quan điều hướng đang có trong khoá

Mã: **A** = PORT/TEACH → N1 · **B** = DEFER → N2 · **C** = KEEP → W1/W2/W3 · **D** = VERSION/DRIFT → AP3 ·
**E** = DUPLICATE / giọng thuật lại nguồn.

| Nguồn | Nội dung | Mã | Ghi chú |
|---|---|---|---|
| `Ch08Networking.astro` (LIVE) — toàn bài | **Không dạy điều hướng ở bất kỳ đâu.** Chỉ 3 dòng có nhắc tên: 1675, 1685, 1813 | — | Đây chính là lỗ hổng N1 lấp. Không có gì để "chuyển" vì chưa từng có nội dung |
| `Ch08Networking.astro` dòng 1673–1687 | "Điểm lệch #8 — hai hàm `@Preview` không render được", giải thích `LocalNavigatorProvider` mặc định ném lỗi | **A** + **C** | Lập luận → N1 Phần 15 (#2). Dữ kiện dòng/file ở lại W-batch như một mục đọc code phê phán; sau khi N1 live thì rút gọn + cross-ref N1 |
| `Ch08Networking.astro` dòng 1800–1815 | Hàng #8 của bảng "8 điểm lệch" | **C** | Bảng thuộc W-batch. Hàng #8 đổi thành cross-ref N1 |
| `Ch08Networking.astro` mục 21 (từ dòng ~1826) | "Ghi chú phiên bản — nguồn viết 2023, hôm nay 2026" | **D** | → AP3; thêm hàng cho `navigation-compose` (mục F dưới) |
| `Ch08Networking.astro` phần còn lại | Retrofit · Moshi · Flow · phân trang · API key | **C** | W1–W3, không liên quan N1 |
| `Ch08_4CodegenVaDocLai.astro` dòng 327–337, 460–465 (file **mồ côi**, không có trong `lessons.ts`) | Bản sao của cùng khối "Điểm lệch #8" | **E** | Không hành động; nếu file được hồi sinh thì đây là chỗ trùng |
| `Ch03_3ManifestIntentPermission.astro` (LIVE) dòng 26, 370–373, 580–583, 666–667 | Nhắc tên `NavHost`/`rememberNavController` kèm số dòng đã kiểm, dùng làm bằng chứng "các chương sau không dùng Intent để chuyển màn hình" | **A** *(đích cross-ref)* | Chỉ nhắc **tên**, không dùng API → hợp lệ. Sau khi N1 có slug: thêm nhãn "sẽ học ở bài **N1**" đúng khuôn forward-reference (standard §9) |
| `Ch03_4ThemeVaDoiChieu.astro` dòng 655 · `Ch03_3Quiz.astro` dòng 702 | Dùng dữ kiện điều hướng làm bằng chứng đối chiếu | — | Giữ nguyên |
| `Ch09DataStore.astro` (LIVE) dòng 163–177, 200, 1142–1173 | Hiển thị `rememberNavController()`, `NavHost(...)`, `LocalNavigatorProvider` **trong code block** khi dạy `CompositionLocal` | **C** *(→ D2)* | Doctrine `CompositionLocal` thuộc **D2**. Thứ tự mới đã giải quyết used-before-taught: N1 (Giai đoạn 4) đứng trước D2 (Giai đoạn 6). Khi dựng D2: cross-ref N1 cho phần nav |
| `Ch10_3RepositoryViewModel.astro` (LIVE) dòng 184–197 | Cùng đoạn `compositionLocalOf<NavHostController>` + `NavHost(...)` trong code block | **C** *(→ R3/D2)* | Như trên; N1 đứng trước R3 nên tự giải quyết |
| `content/book/*.md` — **toàn bộ giáo trình gốc** | **0 match** cho `NavHost`, `rememberNavController`, `navigate(`, `startDestination`, "Navigation Compose" | — | Xem mục "Sources": N1 **không có** provenance giáo trình gốc, và không được bịa ra |

### C. Ranh giới N1 / N2 (chốt cứng)

| Chủ đề | N1 | N2 |
|---|---|---|
| destination · route · đồ thị | **dạy** | — |
| `rememberNavController` · `NavHost` · `startDestination` · `composable(...)` | **dạy** | — |
| `navigate(route)` không mang dữ liệu | **dạy** | — |
| back stack | **chỉ bức tranh đầu tiên**: `navigate` thêm mục, Back bỏ mục trên cùng | cơ chế đầy đủ |
| callback ở biên màn hình | **dạy** (Phần 10) | dùng lại |
| `popBackStack()` | chỉ **nêu tên** ở Phần 15 (#4) vì code mẫu có dùng | **dạy** |
| phân biệt Up với Back | không nhắc | **dạy** |
| truyền dữ liệu giữa destination | không dạy; nói rõ "route còn mang dữ liệu" và để dành | **dạy** |
| route type-safe / model route serializable | chỉ một forward note (Phần 3, 15) | **dạy** |
| `navArgument` · `NavType` · `backStackEntry.arguments` | **chỉ dán nhãn "thuộc N2"** trong bảng ở Phần 14.2 | **dạy** |
| `popUpTo` · `inclusive` · `launchSingleTop` | không nhắc | **dạy** |
| lưu/khôi phục trạng thái điều hướng · nhiều back stack · đồ thị lồng nhau | không nhắc | **dạy** |
| deep link | chỉ nhắc như *một lý do điều hướng tồn tại* trong bảng ở Phần 1 | **dạy** |
| Navigation 3 | **không nhắc một chữ** | 1 forward note trong bảng drift (spec §9) |
| `CompositionLocal` | chỉ nhận diện `.current` khi đọc code mẫu | — (doctrine thuộc **D2**) |
| networking | 0 | 0 |

### D. Sau khi N1 live, chỗ nào thay được bằng cross-ref

1. **W-batch (Ch08 → W1–W3):** phần "Điểm lệch #8" rút xuống 2–3 câu + cross-ref N1 Phần 15; hàng #8 của bảng đổi
   thành cross-ref. W2 vốn đã có nhiệm vụ "trỏ `NavHost` → N1/N2" (plan IMP-040) — mục này là nội dung cụ thể của
   nhiệm vụ đó.
2. **A-batch (Ch03 → A10/A11…):** bốn chỗ nhắc `NavHost` trong `Ch03_3ManifestIntentPermission.astro` thêm nhãn
   forward-reference chuẩn trỏ **N1** (hiện chỉ nói chung "phần Mạng").
3. **D2 (Ch09 → D1/D2):** khi dạy `CompositionLocal`, dùng lại đúng ví dụ `LocalNavigatorProvider` và cross-ref N1
   Phần 14.3 thay vì giải thích lại `NavHost`.
4. **R3 (Ch10.3):** đoạn `compositionLocalOf<NavHostController>` + `NavHost(...)` chỉ cần cross-ref N1 + D2.
5. **N2:** nhận toàn bộ bảng ranh giới ở mục C, và nhận sẵn hai chỗ neo: bảng N1/N2 ở Phần 14.2 (ba mảnh đã dán nhãn
   N2) và câu 7 của bài luyện tập (route sai chỉ lộ lúc chạy → động cơ cho route type-safe).

### E. Used-before-taught về điều hướng — trạng thái hiện tại và sau khi N1 live

| Chỗ | Hiện tại (khoá đang chạy) | Sau khi xếp lại theo thứ tự mới |
|---|---|---|
| Ch08 (LIVE) | Code `NavHost` xuất hiện trong project mà bài không giải thích → **used-before-taught thật** | Giải quyết: N1 (Giai đoạn 4) đứng trước W-batch (Giai đoạn 5) |
| Ch09 (LIVE) dòng 163–177 | `rememberNavController()` + `NavHost(...)` in trong code block, không giải thích | Giải quyết: N1 trước D1–D2 (Giai đoạn 6) |
| Ch10.3 (LIVE) dòng 184–197 | Như trên | Giải quyết: N1 trước R1–R4 |
| Ch03_3 (LIVE) | Nhắc **tên** `NavHost` ở Giai đoạn 1, tức **trước** N1 | Chấp nhận được — chỉ là tên + bằng chứng, không dùng API. Cần thêm nhãn forward-reference (mục D.2) |

Kết luận: N1 không chỉ là bài mới, nó **đóng một lỗ used-before-taught đang tồn tại ở ba bài live**.

### F. Ứng viên drift → AP3 (`docs/drafts/ap3-version-drift.md`)

| Điểm | Bằng chứng | Ghi chú |
|---|---|---|
| `navigation-compose` **2.7.2** (2023) trong cả 4 project 08–11 | `gradle/libs.versions.toml` dòng 17 | Thư viện đã đi tiếp; route type-safe (model serializable) là API **có sau** bản này. AP3 thêm một hàng; **N2** sở hữu ghi chú phiên bản dành cho người học |
| Navigation 3 | Spec §9 ghi "Nav 3 note (stable 2026)" | ⚠ Draft này **không** verify lại trạng thái đó và **không** nhắc tên trong bài (đúng yêu cầu "không dạy Nav 3 ở N1"). Việc verify + một forward note thuộc **N2/AP3** |
| `BottomNavigation`/`BottomNavigationItem` của **Material 2** dùng lẫn với `MaterialTheme.colorScheme` của **Material 3** | `ui/widgets/Bottombar.kt` dòng 37–38 và 52–59 | Phát hiện phụ khi thu hoạch. Không thuộc N1 (thanh dưới của project **không** dính điều hướng — nó chỉ đổi chỉ số). Ứng viên cho C-era/AP3 |
| `Icons.Default.ArrowBack` | `ui/RecipeDetails.kt` dòng 169 | Phát hiện phụ; icon đã có bản thay thế mới hơn. Ứng viên AP3 |
| `popBackStack()` gọi **ngoài** `scope.launch` nên chạy đua với việc suspend bên trong | `ui/RecipeDetails.kt` dòng 180–191 | Không phải drift phiên bản mà là **lỗi thứ tự thật**. Ứng viên đọc-code-phê-phán cho **N2** (nó cần `popBackStack` + coroutine, cả hai đều ngoài N1) |

### G. Việc còn lại của IMP-048 mà draft này KHÔNG làm (đúng phạm vi task)

- **Dựng trang** `.astro` theo template kit: `<section class="lesson">`, họ callout (`callout goals` · `callout` ·
  `callout mental` · `callout note` · `notice` · `hint` · `table class="api"` · `ol class="chain"`), `<Code>` của
  `astro:components` với `lang="kotlin"`, "Mục x/y", đúng một `<h2 id="cam-bay">` và một `<h2 id="nguon">`.
  Bốn block sơ đồ chữ trong bài (Phần 1 hai màn hình · Phần 9 chuỗi truy vết · Phần 11 back stack · Phần 14.1 bộ
  khung) khi dựng trang thành `<pre class="tree">`, đúng khuôn Ch10.1 đã dùng.
- **Slug mới** + đăng ký ở `web/src/data/lessons.ts` và `web/src/data/chapters.ts`; `stageId` nhóm điều hướng.
- **Quiz ≥ 8 câu** theo chuẩn §10 của `docs/COURSE_CONTENT_STANDARD.md`. Trục hỏi đã sẵn: 6 checkpoint · 3 nhóm cạm
  bẫy · 7 câu của bài luyện tập · bảng N1/N2 ở Phần 14.2 (rất tốt cho câu "dòng này thuộc bài nào").
- **Legacy-credit:** N1 là bài NEW → không tự done từ progress cũ (plan §12.2 case D; test IMP-071/072).
- **Cross-ref hai chiều N1 ↔ N2** — chỉ làm được khi N2 đã có slug.
- **Cập nhật `docs/PROJECT_PLAN.md`** khi batch Giai đoạn 4 đóng.

### H. Ghim cho "Cần biết trước" của các bài sau

- **N2:** đã có destination/route/đồ thị/controller/host/`startDestination`/`navigate`/bức tranh back stack; đã biết
  route dạng chuỗi có cái giá gì; đã thấy `navArgument`/`NavType`/`backStackEntry` được dán nhãn "thuộc N2"; đã biết
  `popBackStack` tồn tại trong code mẫu.
- **W2:** đọc được `MainActivity.kt` của project mẫu mà không cần ai giải thích `NavHost`; W2 chỉ cần cross-ref.
- **D2:** đã **nhận diện** `.current` và biết `LocalNavigatorProvider` là ví dụ thật; D2 dạy cơ chế cho tử tế.
- **R3:** như D2.
- **O2 (test):** đã có lý do "callback ở biên màn hình" — điều kiện để test/preview một màn hình độc lập.
- **O6 (capstone):** đã đủ để dựng đồ thị nhiều màn hình; phần mang dữ liệu chờ N2.

---

## Editorial open questions

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

1. **N1 dạy một khuôn mà project mẫu KHÔNG dùng — đã quyết, nhưng cần review biết.** Bài này dạy "callback ở biên màn
   hình" (Phần 10), còn project mẫu rót `NavController` xuống cả cây bằng `CompositionLocal`. Ba lý do chọn như vậy:
   (a) tài liệu chính thức có **cảnh báo tường minh** không truyền `NavController` vào composable, kèm khuyến nghị
   dùng tham số `() -> Unit`; (b) khoá này đã dựng đúng khuôn đó ở S3, nên N1 là chỗ trả cổ tức, không phải chỗ dạy
   mới; (c) cái giá của cách project mẫu làm **kiểm được bằng mắt** (hai `@Preview` không render nổi), nên bài không
   phải viện lý thuyết. Phần 15 nói thẳng cả hai cách và không gọi cách của project mẫu là "sai". Nếu review muốn đảo
   thứ tự (dạy cách của project mẫu trước), đó là đổi **cấu trúc bài**, không phải đổi chữ.
2. **Ví dụ xuyên bài (Home/Details/Settings) do khoá dựng, không lấy từ project mẫu.** Bắt buộc phải vậy: 2 trong 3
   destination của project mẫu chứa máy móc truyền dữ liệu thuộc N2, nên không dùng làm ví dụ đầu tiên được. Bù lại,
   Phần 14 trích **nguyên văn** khối `NavHost` thật và mổ từng dòng, nên bài vẫn "bám code thật". Ghi lại để review
   không hiểu là bài xa rời project mẫu.
3. **Navigation 3 — chưa verify trong phiên này.** Spec §9 ghi "Nav 3 note (stable 2026)". Draft này **không nhắc một
   chữ nào** về Nav 3 trong bài (đúng yêu cầu của task), và **không** xác nhận lại trạng thái đó. Việc verify + đúng
   một forward note thuộc **N2**; hàng phiên bản thuộc **AP3**.
4. **Hai khẳng định về hành vi lúc chạy chưa được chạy thử trong phiên này** — cả hai đều đã hedge bằng chữ
   "thường"/"lỗi lộ ra", nhưng nên chạy một lần trước khi publish: (a) Phần 7 — `startDestination` trỏ tới route
   không tồn tại thì lỗi lộ ra lúc đồ thị được dựng; (b) Phần 11 — bấm Back khi lịch sử chỉ còn một mục thì ra khỏi
   app. Nếu muốn hiển thị thông báo lỗi thật ở Phần 7 thì phải chạy để lấy nguyên văn, **không** được đoán chuỗi lỗi.
5. **Sổ ẩn dụ (cùng câu hỏi mở với S5 #6).** N1 dùng **sân khấu / cảnh / người điều khiển** cho bộ khung và **chồng
   thẻ** cho back stack. Đã tránh: nhà hàng (Ch10.1 dùng cho Room), cửa hàng/kho/quầy (S5). Chưa quét hết 30+ file
   lesson để chắc chắn không trùng — việc rẻ, nên làm khi dựng trang.
6. **Đánh số mục:** N1 dùng `Phần 1…15` và bắt đầu lại từ 1, cùng quy ước với S5. Câu hỏi mở về quy ước đánh số xuyên
   giai đoạn đã ghi ở S5 open question #1; N1 không mở lại, chỉ đi theo.
7. **Bảng "bốn chỗ code mẫu làm khác" (Phần 15) có nguy cơ phình ở N2.** N2 cũng sẽ cần một bảng tương tự cho
   `popBackStack`/arguments. Đề xuất: N2 **không** lặp bảng, chỉ thêm hàng vào cách hiểu đã dựng ở đây, hoặc dồn cả
   hai vào AP3 nếu review thấy trùng.

---

## Final readability-test inventory

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

**API và cú pháp mới của bài, tất cả đều được gloss tại điểm dùng đầu tiên:**

| Mới | Gloss ở đâu | Cách xử lý |
|---|---|---|
| `rememberNavController()` | Phần 5 — bảng ba tầng | Nói rõ **không phải** `remember` của S2; chỉ cần biết "muốn có controller thì gọi hàm này" |
| `NavHost(...)` | Phần 6 — bảng đọc từng dòng | Kèm callout phân biệt với `NavController` |
| `composable("route") { … }` | Phần 8 — callout riêng | Phân biệt tường minh với annotation `@Composable`; nối lambda đuôi về F1 |
| `startDestination` | Phần 7 | Phát biểu là "chỗ vào bình thường của đồ thị này", không phải điểm mở app vĩnh viễn |
| `navigate(route)` | Phần 9 | Kèm truy vết 8 bước và phủ định "không phải lời gọi hàm" |
| `NavHostController` (tên kiểu) | Phần 10 — một câu trong ngoặc | "cái controller điều hướng" |
| `.current` / `CompositionLocal` | Phần 14.3 — callout 🔭 | **Chỉ nhận diện**; doctrine thuộc D2 |
| `when (x) { 0 -> … }` · `mutableIntStateOf` | Phần 15 — một câu trong ngoặc | `when` không được dạy ở F1/F2 nên phải gloss; `mutableIntStateOf` nối về `mutableStateOf` của S2 |
| `ColumnScope.` · `MutableState<…>` làm tham số | Phần 14.3 — một câu trong ngoặc | Xuất hiện vì trích nguyên văn code thật; nói rõ "không liên quan điều hướng" |
| `navArgument` · `NavType` · `backStackEntry.arguments` · route có `{…}` | Phần 14.2 — bảng N1/N2 | **Cố tình không giải thích**, chỉ dán nhãn "thuộc N2". Đây là cách duy nhất vừa trích nguyên văn code thật vừa không lấn học phần của N2 |
| `popBackStack()` | Phần 15 (#4) | Chỉ nêu tên + nhãn N2 |

**Khái niệm dùng lại, không dạy lại:** composable · `Column` · `Button` · `Text` (**C1–C3**) · `@Preview` (**C4**) ·
`remember` · `mutableStateOf` · recomposition (**S2**) · state hoisting · callback `() -> Unit` · luồng dữ liệu một
chiều (**S3**) · ViewModel (**S4**) · biên giới trách nhiệm giữa các tầng (**S5**) · hàm/tham số/lambda đuôi (**F1**).

**Danh sách loại trừ đã xác minh (vùng "Bài học"):**

- **Không xuất hiện ở bất kỳ đâu:** Navigation 3 · `popUpTo` · `inclusive` · `launchSingleTop` · `saveState` ·
  `restoreState` · `currentBackStackEntry` · `navDeepLink` · `NavGraphBuilder.navigation(...)` (đồ thị lồng nhau) ·
  `@Serializable` · Retrofit · Moshi · JSON · Coil · `AsyncImage` · Room · DataStore · Ditto · Hilt.
- **Chỉ xuất hiện dưới dạng *tên* kèm nhãn bài sẽ dạy:** `popBackStack` (Phần 15 #4 → N2) · truyền dữ liệu / route
  type-safe (Phần 3, 9, 15 → N2) · deep link (bảng Phần 1, như *lý do* điều hướng tồn tại → N2) · `navArgument`,
  `NavType`, `backStackEntry` (Phần 14.2, dán nhãn N2) · `CompositionLocal` (Phần 14.3 → D2) · Retrofit/mạng
  (Phần 14.5 → W1–W3).
- **Không có dòng code nào bị sửa so với project mẫu.** Khối `NavHost` ở Phần 14.2 và hai đoạn ở Phần 14.3 / 15 là
  trích nguyên văn, kèm số dòng.

**Kiểm cấu trúc:** 15 `Phần` + `Cạm bẫy` + `Tóm tắt` + `Luyện tập` · 4 callout (Phần 4 · 6 · 8 · 11) · 1 callout
forward-reference 🔭 nhỏ ở Phần 3 và một ở Phần 14.3 (dạng khuôn chuẩn của standard §9, không tính vào hạn mức hộp
nhấn mạnh) · 6 checkpoint đánh số liên tục 1–6 · 4 block sơ đồ chữ (→ `<pre class="tree">` khi dựng trang) ·
1 `<details>` cho lời giải · 3 nhóm cạm bẫy phủ đủ 7 cạm bẫy của yêu cầu.

---

## Sources for future Nguồn block

> Tài liệu tham khảo cho khối "Nguồn tham khảo" khi dựng trang. Chỉ liệt kê nguồn **đã đọc trực tiếp** khi viết draft
> này; không kèm số dòng cho tài liệu web, không chế provenance.

**Trước hết, một dữ kiện phải ghi rõ: N1 KHÔNG có provenance từ giáo trình gốc.** Đã grep toàn bộ
`content/book/*.md` cho `NavHost`, `rememberNavController`, `navigate(`, `startDestination` và "Navigation Compose" →
**0 match**. Giáo trình gốc không dạy điều hướng ở bất kỳ chương nào; nó chỉ *dùng* một `NavHost` đã viết sẵn trong
project mẫu. Vì vậy khối "Nguồn tham khảo" của N1 **không được** trích giáo trình gốc, và bài này là bài NEW theo
đúng nghĩa. Đây cũng chính là lỗ hổng mà spec §9 nhắm tới khi thêm Giai đoạn 4.

**Tài liệu chính thức Android (developer.android.com) — thẩm quyền kỹ thuật của cả bài.**

*Navigation overview* (`/guide/navigation`, đọc bản `?hl=en`) — bảng "Key concepts":

- Controller: "The central coordinator for managing navigation between destinations. The controller offers methods for
  navigating between destinations, handling deep links, managing the back stack, and more."
- Host: "A UI element that contains the current navigation destination. That is, when a user navigates through an app,
  the app essentially swaps destinations in and out of the navigation host."
- Graph: "A data structure that defines all the navigation destinations within the app and how they connect together."
- Destination: "A node in the navigation graph. When the user navigates to this node, the host displays its content."
- Route: "Uniquely identifies a destination and any data required by it. You can navigate using routes. Routes take you
  to destinations." — kiểu: "Any serializable data type." (chỗ tựa cho ghi chú "chuỗi không phải cách duy nhất" ở
  Phần 3, và cho việc để dành route type-safe cho N2.)

*Create a navigation controller* (`/guide/navigation/navcontroller`, bản `?hl=en`):

- "It holds the navigation graph and exposes methods that allow your app to move between the destinations in the
  graph."
- "NavController is the central navigation API. It tracks which destinations the user has visited, and allows the user
  to move between destinations." — chỗ tựa cho định nghĩa ở Phần 5.
- Note: "Each NavHost you create has its own corresponding NavController. The NavController provides access to the
  NavHost's graph." — chỗ tựa cho đoạn cuối callout Phần 6.
- "To create a NavController when using Jetpack Compose, call rememberNavController():"
- "You should create the NavController high in your composable hierarchy. It needs to be high enough that all the
  composables that need to reference it can do so." — chỗ tựa cho câu "đặt ngay cạnh `NavHost`" ở Phần 5.

*Navigate to a destination* (`/guide/navigation/use-graph/navigate`, bản `?hl=en`) — mục "Expose events from your
composables". Đây là thẩm quyền cho cả Phần 10:

- "When a composable function needs to navigate to a new screen, you shouldn't pass it a reference to the NavController
  so that it can call navigate() directly. According to Unidirectional Data Flow (UDF) principles, the composable
  should instead expose an event that the NavController handles."
- "More directly put, your composable should have a parameter of type () -> Unit."
- "Warning: Don't pass your NavController to your composables. Expose an event as described here."
- "Warning: You should only call navigate() as part of a callback and not as part of your composable itself. This
  avoids calling navigate() on every recomposition." — chỗ tựa cho quy tắc cuối Phần 9 và checkpoint 3.
- "This approach keeps your composables reusable and testable, as they don't depend directly on the Fragment's
  NavController." — chỗ tựa cho hai dòng đầu bảng bốn lý do ở Phần 10.

**Code thật đã đối chiếu trực tiếp (nguyên văn, kèm số dòng — xem bảng đầy đủ ở "Editorial migration notes" mục A):**
`aaf-materials/08-networking/projects/final/app/src/main/java/com/kodeco/recipefinder/MainActivity.kt` (dòng 59–60,
78, 81–83, **84–106**) · `ui/recipes/ShowRecipeList.kt` (dòng 68–73, 114, 124–135) · `ui/widgets/BookmarkCard.kt`
(dòng 68, 75, 108) · `ui/RecipeDetails.kt` (dòng 83–84, 92, 152–159, 167, 190) · `ui/MainScreen.kt` (dòng 57–58,
59–61, 89–92) · `ui/recipes/RecipeList.kt` (dòng 95–101) · `gradle/libs.versions.toml` (dòng 17, 54) ·
`app/build.gradle.kts` (dòng 69). Đã kiểm `starter` và `final` giống nhau từng byte ở `MainActivity.kt` và
`ui/RecipeDetails.kt`.

**Nội dung của chính khoá học (nguồn ngữ cảnh/payoff, không phải nguồn khái niệm):**
`web/src/components/lessons/Ch06AdvancedJetpackCompose.astro` — S2 (`remember`, recomposition), S3 (state hoisting,
callback, luồng dữ liệu một chiều), S4 (ViewModel) · `docs/drafts/s5-app-architecture-repository.md` (lập luận về
biên giới trách nhiệm, dùng ở Phần 12–13) · `web/src/components/lessons/Ch08Networking.astro` dòng 1673–1687 và
1800–1815 (dữ kiện đã kiểm về hai `@Preview` không render được, dùng ở Phần 15 #2).

**Ví dụ tối giản do khoá dựng:** toàn bộ code Home/Details/Settings trong bài (`HomeScreen` · `DetailsScreen` ·
`SettingsScreen` · `AppNavigation`) — không trích `aaf-materials/`.

















