# N2 — Back stack & truyền dữ liệu type-safe

> **TRẠNG THÁI: DRAFT NỘI BỘ CHO BÀI HỌC TƯƠNG LAI.** File này KHÔNG phải trang site.
> Khi dựng bài chính thức (task IMP-049 trong `docs/COURSE_REDESIGN_IMPLEMENTATION_PLAN.md`),
> nội dung học là phần "Bài học" phía dưới. Bốn mục cuối file — "Editorial migration notes",
> "Editorial open questions", "Final readability-test inventory", "Sources for future Nguồn block" —
> là **nội dung biên tập nội bộ, KHÔNG đưa cho người học** và không được để lọt vào trang bài học.
>
> **Vị trí trong khoá:** Giai đoạn 4 (Điều hướng), bài **2/2** — ngay sau **N1** (destination, route,
> `NavHost`, `navigate`, bức tranh đầu tiên về back stack), trước giai đoạn Mạng (W1–W3). Phân loại
> **Lõi**. Thời lượng tham khảo ~25 phút — chỉ để tham khảo, không phải hạn mức cắt nội dung.
>
> **Đánh số mục:** draft dùng `Phần 1…16`; khi dựng trang, `Phần k` → `mục k`, bắt đầu lại từ 1
> (cùng quy ước với N1 và S5 — xem "Editorial open questions" #1).
>
> **Phạm vi:** bài này dạy **máy móc của back stack** (`navigate` thêm mục · Back/popBackStack bỏ mục
> trên cùng · vì sao Back ≠ `navigate("home")`), **cách truyền dữ liệu giữa destination** và **mô hình
> route type-safe** của Navigation Compose (`@Serializable` route · `composable<T>()` ·
> `navigate(routeValue)` · `toRoute<T>()`), cùng kỹ năng **đọc code route-dạng-chuỗi năm 2023** của
> project mẫu (`"details/{recipeId}"` · `navArgument` · `NavType` · `backStackEntry.arguments`).
> Cố tình **không** dạy: `popUpTo` · `launchSingleTop` · `saveState`/`restoreState` · nhiều back stack ·
> đồ thị lồng nhau · deep link · truyền kết quả ngược giữa destination · custom `NavType` ·
> Parcelable làm phương tiện mang dữ liệu · API Navigation 3 (`NavDisplay`, `NavKey`, …) ·
> kotlinx.serialization như một chủ đề riêng · ViewModel factory/DI wiring (D2/S4) · networking (W1–W3).
>
> **Ngân sách nhấn mạnh:** **4 callout** (Phần 3 mô hình trực quan · Phần 9 ghi chú phiên bản —
> chứa ghi chú Navigation 3 duy nhất của bài · Phần 10 cảnh báo · Phần 16 ghi chú Up/Back) và
> **7 checkpoint** — đúng hạn mức ≤4 callout của template. Một ghi chú 🔭 nhỏ (Phần 13 —
> `SavedStateHandle`) dùng khuôn forward-reference chuẩn của standard §9 và không tính vào hạn mức
> hộp nhấn mạnh.
>
> **Sự thật phiên bản (đã verify từ tài liệu chính thức ngày 2026-09-06):** route type-safe là API có
> **từ Navigation 2.8.0**; bản ổn định hiện tại là **2.10.0** (26/08/2026). Project mẫu của khoá dùng
> **2.7.2** (2023) — **không** có API type-safe. Nghĩa là ví dụ type-safe trong bài *không compile được
> trên project mẫu* — bài nói thẳng điều đó, và Phần 9 là ghi chú phiên bản duy nhất của bài.
> **Navigation 3 đã ổn định** (1.0.0 ngày 19/11/2025; bản ổn định mới nhất 1.1.4) — bài chỉ có đúng
> **một** ghi chú về nó, đúng khuôn của spec §9.

---

# Bài học

## Mục tiêu — sau bài này bạn sẽ

- Vẽ được back stack sau một chuỗi `navigate(...)` và sau mỗi lần Back, và nói được **câu nào đúng**:
  Back là *đi lui trên lịch sử có sẵn*, còn `navigate(...)` là *ghi thêm vào lịch sử*.
- Tự viết được một **nút Back tường minh** bằng `popBackStack()` qua callback — mà không đưa
  `NavController` vào màn hình con.
- Giải thích được vì sao gọi `navigate("home")` để "quay về Home" là **sai mô hình** — và chuyện gì
  thật sự xảy ra với stack khi gọi như vậy.
- Định nghĩa được một **route type-safe**: `@Serializable object` cho destination không tham số,
  `@Serializable data class` cho destination có tham số — rồi điều hướng tới nó bằng
  `navigate(GiáTriRoute(...))` và đọc tham số ra bằng `toRoute<T>()`.
- Phát biểu và **áp dụng được** quy tắc quan trọng nhất của truyền dữ liệu: **truyền một định danh nhỏ
  (ID), không truyền cả object** — và nối ID đó tới ViewModel/repository (S4/S5) để lấy dữ liệu hiện có.
- Đọc được code route-dạng-chuỗi 2023 của project mẫu — `"details/{recipeId}"`, `navArgument`,
  `NavType`, `backStackEntry.arguments?.getInt(...)` — và **map từng mảnh** sang mô hình type-safe.

**Tại sao điều này quan trọng khi làm Android.** N1 dạy bạn đọc được bộ khung điều hướng trong
`MainActivity.kt` của project mẫu — nhưng cố tình chừa lại ba mảnh cho bài này: route có chỗ trống
`{recipeId}`, một `navArgument`, và một `backStackEntry`. Ở giai đoạn Mạng ngay sau đây, bạn chạm vào
một thẻ công thức và app mở trang chi tiết *của đúng món đó* — chính là ba mảnh đó đang chạy. Ngoài ra,
"Back làm gì" nghe hiển nhiên, nhưng viết **Back bằng `navigate`** là một trong những lỗi mô hình phổ
biến nhất của người mới: app vẫn chạy, không crash, chỉ là lịch sử phình ra và Back trở nên khó đoán.
Bài này dựng đúng mô hình ngay từ đầu.

**Cần biết trước:**

- **N1** — destination · route · đồ thị · `NavController` vs `NavHost` · `startDestination` ·
  `composable("route")` · `navigate(route)` · bức tranh đầu tiên về back stack (`navigate` thường thêm
  mục, Back thường bỏ mục trên cùng). Bài này **dựng lại trên nền đó**; mọi khái niệm N1 được dùng lại,
  không dạy lại.
- **S2** — `remember`, recomposition.
- **S3** — state hoisting, callback `() -> Unit`, luồng dữ liệu một chiều. Ranh giới "màn hình phát ra
  sự kiện, controller thực hiện" của N1 là **cùng khuôn này**.
- **S4** — ViewModel sở hữu UI state; `StateFlow`; đã **nghe tên** `SavedStateHandle` (chỉ nhận diện).
- **S5** — tầng UI / tầng dữ liệu; **repository như biên giới**; ViewModel biến dữ liệu thành UI state.
  Quy tắc "truyền ID" của bài này kết thúc đúng ở biên giới đó.
- **F1/F2** — hàm, lambda đuôi, string template, nullability (`?.`, `?:`), data class với thuộc tính
  `val`, generics ở mức **nhận diện** (`List<T>`).

**Chưa cần biết:** `popUpTo` · `launchSingleTop` · `saveState`/`restoreState` · nhiều back stack ·
đồ thị lồng nhau · deep link · truyền kết quả ngược giữa hai destination · custom `NavType` ·
kotlinx.serialization như một thư viện có cú pháp riêng · API Navigation 3 · ViewModel factory và
dependency injection · Retrofit/mạng (bài **W1–W3**) · `CompositionLocal` ở mức dùng được (bài **D2**).

---

## Phần 1 — Nhắc lại: chồng lịch sử mà controller đang giữ

N1 kết thúc bằng bức tranh này: người dùng đi Home → Details → Settings, và controller giữ lịch sử:

```
TRÊN CÙNG    Settings     ← destination đang hiện
             Details
DƯỚI CÙNG    Home         ← startDestination
```

Bài này xoay quanh **hai hành động** lên chồng lịch sử đó, nên phải nói cho thật chuẩn ngay từ đầu.

**Đi tới.** Mặc định, mỗi lời gọi:

```kotlin
navController.navigate(...)
```

**thêm một mục lên đỉnh** của lịch sử. Settings được mở sau Details, nên nó nằm *trên* Details — và
destination đang hiện luôn là mục trên cùng.

**Đi lui.** Người dùng bấm Back: mục **trên cùng** bị bỏ đi, và mục ngay dưới nó trở thành destination
đang hiện. Từ Settings bấm Back → về Details; bấm nữa → về Home. Khi lịch sử chỉ còn một mục, bấm Back
thường đưa người dùng ra khỏi app — đúng như họ mong đợi.

Hai chữ "mặc định" và "thường" ở trên **có thật, không phải chào đón lỏng**: tồn tại những biến thể của
`navigate`/`popBackStack` vừa đi vừa *dọn* lịch sử — chúng thuộc phần tra cứu, không thuộc bài này. Với
mọi thứ bạn viết ở giai đoạn này, hai câu trên là mô hình đủ và đúng.

Và một câu N1 đã nói mà bây giờ mới tới lúc dùng: **chồng lịch sử này do controller giữ, không nằm
trong một biến nào của bạn.** Bạn không tự thêm, không tự bớt — bạn *ra lệnh*, và lệnh bạn có chỉ có
hai loại: đi tới, và đi lui.

---

## Phần 2 — Hai nơi rời khỏi màn hình: nút Back của hệ thống và nút Back của app

Trong một app thật, "quay lại" đến từ hai nơi:

**1. Nút Back của hệ thống** — nút cảm ứng/cử chỉ của điện thoại. Bạn **không phải viết dòng nào**:
controller giữ lịch sử, và hệ thống điều hướng đã nối nút Back với việc bỏ mục trên cùng. Đây là việc
bạn được miễn tự làm nhờ dùng thư viện điều hướng — nhớ lại bảng "cách dùng biến `screen`" ở N1 Phần 1,
xử lý Back là một trong những thứ nó không có.

**2. Nút Back của chính app** — ví dụ mũi tên quay lại trên thanh đầu trang (app bar). Nút này là
**một nút của UI**, không có phép màu nào gắn sẵn với Back của hệ thống. Nó cần được viết tường minh,
và cách viết đúng là đúng khuôn S3: màn hình phát ra **sự kiện**, chỗ giữ controller thực hiện:

```kotlin
DetailsScreen(
  onBack = {
    navController.popBackStack()
  }
)
```

Đọc dòng thứ hai: **`popBackStack()` = yêu cầu controller bỏ destination đang hiện khỏi lịch sử** —
đúng động tác của nút Back hệ thống, chỉ khác chỗ *bạn* gọi nó, tại chỗ callback được nối vào nút của
app. Controller thực hiện xong, mục dưới đỉnh trở thành destination hiện hành, và `NavHost` vẽ lại.

Hai điểm chính xác, để không nhân rộng thành superstitious code:

- **Đừng đưa `NavController` vào màn hình lá** chỉ để nút Back gọi được `popBackStack()`. N1 Phần 10 đã
  dựng toàn bộ lập trình này với `navigate`; `popBackStack` không phải ngoại lệ — màn hình nhận
  `onBack: () -> Unit`, lệnh `popBackStack()` nằm ở chỗ khai đồ thị. (Project mẫu làm ngược lại —
  `TitleRow` nhận thẳng `navController: NavHostController`, `ui/RecipeDetails.kt` dòng 155. Bạn sẽ đọc
  nó ở Phần 15.)
- **`popBackStack()` trả về một giá trị Boolean** — "có pop được hay không". Có một trường hợp nó trả về
  `false`: khi lịch sử gần như rỗng (ví dụ bạn đã tự pop mất `startDestination`). Tài liệu chính thức ghi
  rõ hành vi đó. Với nhu cầu của giai đoạn này — nút Back trên một destination bình thường — bạn **gọi
  và thôi**; đừng bọc thêm `if` quanh giá trị trả về. Chi tiết này ở mức "biết là có", không hơn.

---

## Phần 3 — Cạm bẫy trung tâm: Back không phải `navigate("home")`

Đây là phần quan trọng nhất của bài, nên đi chậm.

Vấn đề đặt ra rất đời thường: đang ở Details, muốn *quay về* Home. Cách viết đầu tiên người mới nghĩ ra:

```kotlin
// ❌ Ý định: "quay về Home"
Button(onClick = { navController.navigate("home") }) {
  Text("Về trang chính")
}
```

Chạy được, không crash, không báo lỗi. Vậy mà nó **sai mô hình**. Chuyện gì thật sự xảy ra — vẽ stack:

```
bắt đầu ở Home:
TRÊN CÙNG    Home

mở Details — navigate("details") thêm mục:
TRÊN CÙNG    Details
             Home

bấm nút "Về trang chính" — navigate("home") THÊM MỤC MỚI:
TRÊN CÙNG    Home        ← bản sao MỚI, không phải Home cũ được "tìm lại"
             Details
             Home        ← Home cũ vẫn nằm đó
```

`navigate(...)` **không tra xem Home đã có trong lịch sử hay chưa** — mặc định, nó ghi *thêm* một mục
mới lên đỉnh, như mọi lần. Giờ lịch sử là `Home · Details · Home`: người dùng thấy Home, nhưng nếu họ
bấm Back, họ không ra khỏi app — họ về **Details** lần nữa. Bấm Back thêm lần nữa mới hết chuỗi. Với
app thật, cứ vài lần "quay về" kiểu này là lịch sử thành một chồng giấy mà không ai đoán nổi bấm Back
sẽ tới đâu.

Bước ngược lại một nhịp để thấy mô hình nào đang bị vi phạm:

> **Mô hình trực quan — đi tới là đặt thẻ, đi lui là bỏ thẻ**
>
> Nhớ lại ẩn dụ chồng thẻ của N1:
>
> - **`navigate(x)`** = **đặt thêm một tấm thẻ lên đỉnh** — luôn là *đi tới*, luôn *ghi thêm lịch sử*,
>   kể cả khi "đích" tên giống một chỗ bạn đã đi qua.
> - **Back / `popBackStack()`** = **bỏ tấm thẻ trên đỉnh** — đi *lui* trên **lịch sử đã có sẵn**, không
>   tạo gì mới.
>
> Câu mô tả ngắn nhất, và là câu mang ra khỏi cả bài:
>
> **`navigate` = di chuyển tới trước và ghi lịch sử. `popBackStack` = di chuyển ngược trên lịch sử đã
> ghi.**
>
> Muốn "quay lại Home", câu trả lời đúng là **không gọi gì cả** — bấm Back. Muốn có *nút* quay về, nút
> đó gọi `popBackStack()`. Chỉ khi bạn muốn *tới một nơi mới* — một luồng mới, một destination mà lịch
> sử chưa có — thì mới dùng `navigate`.

> **Tự kiểm tra 1.** Lịch sử đang là `Home · Details`. Người dùng bấm một nút viết
> `navigate("details")`, rồi bấm Back một lần. Lịch sử sau mỗi bước, từ dưới lên?
>
> *(Đáp án: sau nút — `Home · Details · Details`; navigate mặc định ghi thêm một mục mới lên đỉnh, kể cả
> khi tên trùng mục đang có — vì vậy đỉnh là một bản Details **khác** mục dưới nó. Sau Back — `Home ·
> Details`; mục đỉnh bị bỏ đi, lộ ra Details ban đầu vẫn còn nguyên dưới đó. Đây là hai lý do để không
> "quay lại" bằng `navigate`: nó không tái sử dụng mục cũ, và nó để lại rác trong lịch sử.)*

---

## Phần 4 — `popBackStack()`: phát biểu chính xác về một lời gọi

Giờ chụp cận động tác mà Phần 2 và 3 đang dùng. Tài liệu chính thức mô tả `popBackStack()` như sau,
được diễn lại đúng ý: nó **cố gắng bỏ destination hiện hành khỏi back stack và về destination trước
đó** — tức là đi lui đúng một bước trên lịch sử. Trả về Boolean cho biết pop có thành công không.

Truy vết một cú bấm nút Back của app, từng bước — cùng khuôn truy vết của N1 Phần 9:

```
người dùng chạm mũi tên quay lại trên Details
  → Compose gọi lambda onClick / callback được nối
    → lambda đó gọi onBack()                          (callback của S3)
      → onBack gọi navController.popBackStack()
        → controller bỏ mục Details khỏi đỉnh lịch sử
        → mục ngay dưới (Home) trở thành destination hiện hành
      → NavHost tháo nội dung Details, dựng nội dung Home
  → HomeScreen được vẽ lại
```

Ba điểm chính xác cho ngắn gọn:

- **Nó "cố gắng" pop — vì có thể không có gì để pop.** Đó chính là nguồn của Boolean ở Phần 2. Ở mức
  bài này, giữ đúng câu: nếu lịch sử còn gì đó phía dưới thì pop thành công; nếu bạn đã tự pop đến mức
  rỗng thì nó trả `false`. Không cần code xử lý `false` trong app của giai đoạn này.
- **Nó không "vẽ" gì cả.** `popBackStack()` chỉ đổi *đỉnh của lịch sử*. Việc vẽ destination mới vẫn là
  việc của `NavHost` — đúng vai tách hai bên như N1 Phần 6.
- **Có các biến thể `popBackStack(...)` nhận tham số đích** (pop về một destination chỉ định, kèm tuỳ
  chọn pop luôn đích đó). Project mẫu **không dùng** biến thể nào, bài này **không dạy** chúng — chỉ cần
  nhận ra rằng chúng tồn tại trong tài liệu để đỡ ngỡ ngàng. (Mục "Chưa cần biết" đã liệt kê.)

Một quy tắc nhỏ nối với S2, nguyên bản N1 Phần 9 nhưng giờ áp cho cả hai chiều: gọi `popBackStack()`
**bên trong callback**, không gọi thẳng trong thân composable — thân composable chạy lại mỗi lần vẽ lại
(recomposition), còn nút Back chỉ được bấm khi có sự kiện thật.

> **Tự kiểm tra 2.** Hai dòng dưới đây khác nhau ở chỗ nào — và khác nhau *về mô hình* chứ không chỉ về
> chữ?
>
> ```kotlin
> navController.navigate("home")
> navController.popBackStack()
> ```
>
> *(Đáp án: dòng một **ghi thêm** một mục Home mới lên đỉnh lịch sử — đi tới, tạo lịch sử. Dòng hai
> **bỏ** mục đỉnh hiện tại — đi lui, tiêu thụ lịch sử đã có. Cùng một "hệ quả thấy được" là màn hình
> Home hiện ra, nhưng mô hình lịch sử hoàn toàn khác nhau — chính là cái bẫy Phần 3.)*

---

## Phần 5 — Destination cần dữ liệu: "mở chi tiết của món nào?"

Từ Phần 1 đến 4, mọi destination đều "tự đủ" — Details không cần biết gì thêm để vẽ. App thật không
vậy, và project mẫu của chính khoá là bằng chứng gần nhất: ở giai đoạn Mạng, danh sách công thức mở ra
trang chi tiết **của một món cụ thể**. Destination chi tiết buộc phải trả lời được câu hỏi:

> **"Mở chi tiết của món nào?"**

Cái cần truyền rất nhỏ — một mã số. Nhưng câu hỏi kỹ thuật thật là: **mang nó qua đâu?**

Cách cũ — cách project mẫu viết năm 2023 — là nhét thẳng vào route:

```
"details/123"
```

trong đó route thực sự được khai báo là một **mẫu có chỗ trống** `"details/{recipeId}"` (bạn đã thấy dòng
này trong N1 Phần 14, được dán nhãn "thuộc N2" — hôm nay giải phẫu nó). Đọc kỹ cái ý tưởng trước, rồi
mới nói cái giá:

- Về **ý niệm**, nó đúng và nó hoạt động: route vừa định danh destination, vừa mang theo `recipeId`.
- Về **cách biểu diễn**, nó gộp hai thứ khác bản chất vào **một chuỗi**: cái *tên* của destination và
  cái *dữ liệu* destination cần. Chuỗi thì trình biên dịch chỉ thấy là… một chuỗi. Cái giá cụ thể:

| Rủi ro khi route là chuỗi tự ghép | Chuyện gì xảy ra |
|---|---|
| **Typo** | `navigate("detials/$id")` — biên dịch bình thường; lỗi chỉ nổ ra **lúc chạy**, đúng lúc người dùng bấm nút |
| **Sai tên khóa** | Mẫu khai `{recipeId}` nhưng code đọc `"recipId"` — đọc ra `null`/`0` tuỳ cách đọc, và nơi nhận phải bọc giá trị lấp để sống sót (project mẫu làm đúng thế — Phần 14) |
| **Sai kiểu** | Khai `IntType` rồi truyền `"details/abc"` — lỗi lúc chạy, không phải lúc biên dịch |
| **Ghép chuỗi bằng tay** | Mỗi lời gọi navigate là một phép nội suy `"…/$id"` tự viết — sai một chỗ là mất một chỗ, và không máy nào kiểm giúp |
| **Phát hiện muộn** | Cả bốn lỗi trên đều là **lỗi lúc chạy** — loại lỗi đắt nhất, vì nó chỉ gặp khi có người dùng bấm đúng chỗ |

Cần nói ngay cho công bằng — và đây là tư duy phê phán mà khoá luyện suốt: **không gọi cách viết này là
"dở".** Project mẫu dùng Navigation **2.7.2** (2023) — chuỗi với chỗ trống là cách biểu diễn route
*thông thường của thời điểm đó*, và code của nó làm việc đúng. Thư viện đã đi tiếp từ đó, và phần còn
lại của bài dạy mô hình mà khoá này khuyên dùng khi viết code **mới** — trong khi vẫn giữ cho bạn đọc
thạo code cũ (Phần 14), vì bạn sẽ gặp nó trong project mẫu và trong rất nhiều code ngoài thực tế.

> **Tự kiểm tra 3.** `navigate("detials/$id")` (thừa chữ *t*) biên dịch được không? Lỗi lộ ra khi nào?
>
> *(Đáp án: biên dịch được — với trình biên dịch, đó chỉ là một chuỗi hợp lệ; nó không biết đồ thị có
> destination tên `detials` hay không. Lỗi lộ ra lúc chạy, đúng lúc người dùng chạm vào cái nút gọi nó.
> Đây là cái giá cốt lõi của route-dạng-chuỗi, đã được N1 Phần 9 nhắc như một dự báo — giờ có toàn bài
> sau để giải quyết.)*

---

## Phần 6 — Mô hình route type-safe: destination là một kiểu Kotlin

Ý tưởng của mô hình mới, gói gọn một câu: **thay vì gọi tên destination bằng chuỗi, hãy định nghĩa
destination bằng một kiểu Kotlin.** Cái tên, tham số, kiểu tham số — tất cả nằm trong khai báo kiểu;
trình biên dịch đọc được hết.

Hai kiểu route của ví dụ xuyên bài — Home (không mang gì) và chi tiết công thức (mang một mã số):

```kotlin
@Serializable
object HomeRoute

@Serializable
data class RecipeDetailsRoute(
  val recipeId: Int
)
```

Đọc từng mảnh — có hai thứ Kotlin mới trong đó, giải thích đúng đủ rồi quay lại mạch chính:

| Mảnh | Thuộc về | Nghĩa |
|---|---|---|
| `@Serializable` | **Annotation** — như `@Composable` của N1 Phần 8: một *chú thích* gắn trước khai báo, dành cho trình biên dịch, không phải code chạy | Cho hệ thống điều hướng biết: giá trị route này **có thể được mã hoá và giải mã lại** khi đi vào và đọc ra khỏi lịch sử. Bạn không viết code mã hoá nào cả — thư viện lo |
| `object HomeRoute` | **Kotlin** — khai báo kiểu mới ở đây | Một khai báo `object` tạo ra **một kiểu mà cả app chỉ có đúng một giá trị**. Hợp lý cho Home: "đi tới Home" không cần mang thông tin gì thêm, nên route của nó chỉ cần *tồn tại* |
| `data class RecipeDetailsRoute(val recipeId: Int)` | **Kotlin** — đúng khuôn data class của F2 | Route có tham số là **một data class với thuộc tính `val`**: tên tham số (`recipeId`) và kiểu (`Int`) đều là *phần khai báo chính thức* — không phải chuỗi tự ghép |

Điều đáng chú ý nhất so với Phần 5: **route giờ là một giá trị Kotlin có kiểu.** `HomeRoute` là một giá
trị (của kiểu `object`); `RecipeDetailsRoute(recipeId = 42)` là một giá trị data class. Bạn tạo nó,
truyền nó, và nếu bạn gõ sai tên thuộc tính hay truyền sai kiểu — **trình biên dịch từ chối ngay**,
trước cả khi app chạy.

Ba ranh giới cần vạch ngay, để không suy diễn quá xa:

- **Đây không phải bài học về kotlinx.serialization.** Annotation `@Serializable` đến từ một plugin
  Kotlin, nhưng ở đây bạn chỉ cần đúng một vai của nó: *phép điều hướng dùng để đóng gói/giải đóng giá
  trị route*. Không định dạng dữ liệu, không cú pháp serializer nào khác xuất hiện trong khoá này.
- **Chữ `object` ở đây có nghĩa mới so với F1/F2.** Ở F1/F2, "object" chỉ là *một object cụ thể* — một
  bản sao tạo ra từ khuôn. Khai báo `object HomeRoute` thì khác: nó **khai báo một kiểu** mà *tự thân
  vừa là kiểu, vừa là giá trị duy nhất của chính nó* — không cần gọi tên kiểu như gọi hàm để tạo bản
  sao. Hình dung: `HomeRoute` là một "con dấu" — ai cầm con dấu đó nghĩa là người đó nói "tới Home".
- **Route class nên nhỏ.** Một vài thuộc tính định danh là đủ — phần sau của bài (Phần 10) sẽ biến điều
  này thành quy tắc cứng.

> **Tự kiểm tra 4.** Hai khai báo dưới đây khác nhau ở *vai* gì?
>
> ```kotlin
> @Serializable
> object SettingsRoute
>
> @Serializable
> data class RecipeDetailsRoute(val recipeId: Int)
> ```
>
> *(Đáp án: `SettingsRoute` là route **không tham số** — toàn bộ thông tin "đi tới Settings" gói gọn
> trong sự tồn tại của giá trị; một kiểu - một giá trị. `RecipeDetailsRoute` là route **có tham số** —
> mỗi lần mở chi tiết là một giá trị data class khác nhau, theo `recipeId` khác nhau. Chọn `object` khi
> destination không cần biết thêm gì; chọn data class khi cần mang dữ liệu.)*

---

## Phần 7 — Dựng đồ thị với route kiểu Kotlin

Toàn bộ đồ thị ba destination — đúng khuôn `NavHost` của N1 Phần 6, chỉ đổi cách *gọi tên*:

```kotlin
@Composable
fun AppNavigation() {
  val navController = rememberNavController()

  NavHost(
    navController = navController,
    startDestination = HomeRoute
  ) {
    composable<HomeRoute> {
      HomeScreen(
        onOpenRecipe = { recipeId ->
          navController.navigate(
            RecipeDetailsRoute(recipeId)
          )
        }
      )
    }

    composable<RecipeDetailsRoute> { backStackEntry ->
      // … Phần 8 sẽ điền nội dung
    }
  }
}
```

Đọc từng dòng — chỉ ghi lại cái *đổi*, vì phần còn lại là y nguyên N1:

| Dòng | Đổi gì so với N1 |
|---|---|
| `startDestination = HomeRoute` | Trước: một chuỗi `"home"`. Nay: **giá trị route** — controller so khớp bằng kiểu, không bằng chữ |
| `composable<HomeRoute> { … }` | Trước: `composable("home") { … }` — tên destination truyền như tham số chuỗi. Nay: **tên kiểu nằm trong dấu `< >`** — cùng khuôn nhận diện generics của F2 (`List<T>`): bạn đọc là "đăng ký destination của kiểu `HomeRoute`" |
| `navController.navigate(RecipeDetailsRoute(recipeId))` | Trước: `navigate("details/$id")` — tự ghép chuỗi. Nay: **tạo giá trị route** và truyền nó. Tên thuộc tính sai → không biên dịch. Kiểu sai → không biên dịch |
| `{ backStackEntry -> … }` | Y như N1 đã dán nhãn: lambda nhận **mục lịch sử** của destination đang vẽ — Phần 8 dùng nó để lấy dữ liệu ra |

Và điều đáng để dừng lại một nhịp: **ranh giới của S3 không hề xê dịch.** `HomeScreen` vẫn chỉ nhận một
callback; nó không biết `NavController`, không biết `RecipeDetailsRoute`, không biết "mở chi tiết" nghĩa
là đi đâu. Route type-safe đổi cách *chỗ khai đồ thị thực hiện* điều hướng — không đổi ai được phát sự
kiện. `navController.navigate(RecipeDetailsRoute(recipeId))` nằm đúng chỗ đó: trong lambda callback,
ngay cạnh khai báo destination.

So với N1 Phần 9, có một lời hứa mới được lấp đầy: N1 nói *route sai chỉ lộ lúc chạy*. Với route kiểu
Kotlin, phần lớn lỗi "đi tới destination không tồn tại" được bắt **lúc biên dịch** — vì destination và
lệnh đi tới cùng tham chiếu một kiểu. Nói cho an toàn: **không phải mọi lỗi điều hướng đều biến mất** —
những lỗi về *luồng* (đi tới sai destination *đúng kiểu*, back stack cấu trúc sai ý) vẫn là lỗi thiết kế
mà trình biên dịch không đoán hộ được. Type-safe nghĩa là *phần sai sót về tên và kiểu* được chuyển từ
lúc-chạy sang lúc-biên-dịch — chính là phần đắt đỏ nhất của Phần 5.

> **Tự kiểm tra 5.** Bốn dòng nào dưới đây biên dịch lỗi? Vì sao?
>
> ```kotlin
> navController.navigate(RecipeDetailsRoute("42"))       // (a)
> navController.navigate(RecipeDetailsRoute(recipeId))   // (b)
> navController.navigate(RecipeDetialsRoute(recipeId))   // (c)
> navController.navigate("RecipeDetailsRoute")           // (d)
> ```
>
> *(Đáp án: (a) — truyền chuỗi `"42"` cho thuộc tính `Int` — bị từ chối lúc biên dịch. (c) — gõ sai tên
> kiểu — không tồn tại kiểu đó, biên dịch lỗi. (b) biên dịch được: `recipeId` là `Int`. (d) cũng biên
> dịch được — đó là một chuỗi, trình biên dịch không biết nó phải trỏ tới destination nào; lỗi (nếu có)
> lộ lúc chạy. (d) chính là cách project mẫu phải sống chung — Phần 14.)*

---

## Phần 8 — Lấy dữ liệu ra: `toRoute<T>()`

Trong `composable<RecipeDetailsRoute> { backStackEntry -> … }`, giá trị route mà người dùng đã đi tới
được **giải mã lại** từ mục lịch sử. API chính thức của bước đó:

```kotlin
composable<RecipeDetailsRoute> { backStackEntry ->
  val route = backStackEntry.toRoute<RecipeDetailsRoute>()
  RecipeDetailsScreen(
    recipeId = route.recipeId,
    onBack = { navController.popBackStack() }
  )
}
```

Đọc từng dòng:

| Dòng | Nó làm gì |
|---|---|
| `backStackEntry` | **Mục lịch sử** của destination đang được vẽ — cùng đối tượng mà N1 Phần 14 đã dán nhãn "thuộc N2". Đối tượng này giữ cả tham số đã đi kèm lần navigate đó |
| `.toRoute<RecipeDetailsRoute>()` | **Hàm mở rộng** (extension function — Kotlin) của thư viện điều hướng: giải mã tham số của mục lịch sử **về đúng giá trị route gốc**. Tên kiểu đặt trong `< >` ở đây là *bạn nói cho nó biết* nên dựng lại kiểu gì — cùng khuôn đọc generics của F2 |
| `val route = …` | Giá trị trả về là một `RecipeDetailsRoute` **thật sự** — có thuộc tính, có kiểu, trình biên dịch biết hết |
| `route.recipeId` | Đọc tham số như đọc một thuộc tính data class bình thường — F2. Không chuỗi, không khoá tra cứu, không `?: 0` |
| `onBack = { navController.popBackStack() }` | Nút Back của app, đúng khuôn Phần 2 — callback ở biên màn hình |

Cần biết cho chính xác, đúng một dòng: hàm này cần một import —

```kotlin
import androidx.navigation.toRoute
```

— và các import của `NavHost`/`composable`/`rememberNavController` vẫn là của `androidx.navigation.compose`
như N1. `import kotlinx.serialization.Serializable` đi kèm chỗ khai route (Phần 6). Chừng đó là đủ để
ví dụ của bài compile được — **trừ một điều kiện phiên bản**, nói ngay ở phần sau.

Một so sánh để nhớ vai của dòng `.toRoute(...)` so với code cũ sẽ đọc ở Phần 14: đây là chỗ mà code 2023
viết `backStackEntry.arguments?.getInt("recipeId") ?: 0` — tra tham số **bằng tên-chuỗi** trên một bộ
tham số **nullable** (`arguments` có thể không có gì), và nếu tên gõ sai thì `getInt` **âm thầm trả `0`**
— không lỗi, không cảnh báo. `toRoute` thay cả hai tầng rủi ro đó: tra bằng **kiểu**, nhận lại **giá trị
route hoàn chỉnh**. Đó là sự khác nhau giữa "hỏi bằng chữ, tự chịu rủi ro chữ sai" và "hỏi bằng kiểu,
sai kiểu thì biên dịch đã kêu".

---

## Phần 9 — Để ví dụ này compile: một ghi chú phiên bản, không hơn

> **Ghi chú phiên bản — code mẫu 2023, API trong bài 2024+, hôm nay 2026**
>
> - **Project mẫu của khoá** dùng `androidx.navigation:navigation-compose` **2.7.2** (`gradle/libs.versions.toml`
>   dòng 17). Bản này **chưa có** route type-safe — nên các ví dụ `@Serializable`/`composable<T>()`/
>   `toRoute<T>()` của bài **không compile được trên project mẫu, và không được dán vào đó**. Điều này
>   không làm giảm giá trị bài học: bạn đang học *cách đọc code cũ* và *cách viết code mới* song song —
>   đúng mô hình của cả khoá.
> - **Route type-safe có từ Navigation 2.8.0.** Muốn ví dụ của bài chạy thật, cần nâng phiên bản điều
>   hướng lên **2.8.0 trở lên** (bản ổn định hiện tại: **2.10.0**, 26/08/2026) và thêm **plugin Kotlin
>   serialization** (`org.jetbrains.kotlin.plugin.serialization`) cùng thư viện
>   `org.jetbrains.kotlinx:kotlinx-serialization-json` vào Gradle. Việc nâng phiên bản là một thao tác
>   Gradle riêng — phần trao đổi chi tiết về các con số nằm ở phần tra cứu phiên bản của khoá, không ở đây.
> - **Về Navigation 3:** một thư viện điều hướng thế hệ sau cho Compose **đã ổn định** trong hệ sinh thái
>   Android hiện tại. Khoá này vẫn dạy mô hình route type-safe của Navigation 2 ở đây, vì đó là lộ trình
>   nâng cấp rõ ràng nhất từ code Navigation 2 của project mẫu; API Navigation 3 không thuộc bài này.

Đó là toàn bộ nội dung "phiên bản" của bài. Tại sao nó phải nằm đây mà không chui vào Phần 14: vì nếu
không, người học có quyền ngỡ rằng ví dụ type-safe **nên** dán vào project mẫu 2.7.2 — và không compile
được mà không hiểu vì sao. Một ghi chú, đúng chỗ, hết vấn đề.

> **Tự kiểm tra 6.** Bạn dán khối `@Serializable object HomeRoute` vào project mẫu và biên dịch. Kết quả?
>
> *(Đáp án: lỗi biên dịch — project mẫu dùng Navigation 2.7.2, chưa có API route type-safe (2.8.0 trở
> lên). Lỗi đó không phải bạn gõ sai; đó là ranh giới phiên bản. Đúng động tác: giữ project mẫu nguyên
> vẹn để đọc, viết code type-safe trong project mới/học tập đã nâng phiên bản.)*

---

## Phần 10 — Quy tắc số một: truyền ID, đừng truyền cả object

Đã biết *cách* truyền dữ liệu — giờ là phần quan trọng nhất về *truyền cái gì*.

Vì route type-safe chấp nhận mọi thuộc tính `@Serializable`, người mới gặp một cám dỗ rất tự nhiên:
chiều Details cần dữ liệu công thức, list đang có sẵn object `Recipe` — vậy nhét luôn cả object vào
route cho rồi:

```kotlin
// ❌ Hình dạng sai — đừng viết
RecipeDetailsRoute(
  recipe = wholeRecipeObject
)

// ✅ Hình dạng đúng
RecipeDetailsRoute(
  recipeId = recipe.id
)
```

Bản thứ hai **không hề thiệt thòi** — nó không phải "cách viết tiết kiệm" mà là cách đúng kiến trúc, và
mạch dữ liệu sau đó đã có sẵn từ S4/S5:

```
route mang recipeId
  → destination đọc ra (toRoute)
    → ViewModel dùng recipeId để tải dữ liệu          (S4: ViewModel sở hữu UI state)
      → repository trả về dữ liệu hiện có của ID đó   (S5: biên giới dữ liệu)
        → ViewModel biến dữ liệu thành UI state
          → màn hình vẽ theo UI state
```

Năm lý do — cả năm đều đã có nền từ các bài trước:

1. **Object có thể lớn.** Route được mang theo trong **lịch sử điều hướng** — mỗi mục lịch sử lôi theo
   nó. Mở mười trang chi tiết là mười bản sao object trong lịch sử. Một `Int` thì không bao giờ là vấn đề.
2. **Object có thể cũ.** Bạn chụp object ở *thời điểm bấm nút*. Nếu dữ liệu đổi (repo vừa cập nhật, ảnh
   mới được tải), trang chi tiết vẫn cầm **bản cũ** — vì bạn đã chốt dữ liệu vào route. Với ID, bạn hỏi
   **dữ liệu hiện có** lúc tới nơi — đúng nguyên tắc *nguồn đáng tin* của S5.
3. **Destination nên tự lấy dữ liệu hiện hành.** Cùng một destination ("chi tiết của món X") phải hiển
   thị đúng ở cả hai lối vào — từ list, từ bookmark — project mẫu làm đúng việc này: hai route khác nhau
   (`details/{recipeId}` và `bookmarks/{recipeId}`) cùng đổ về một ID rồi một màn hình. ID là thứ hợp
   lệ cho *cả hai lối vào*; một object chụp từ list thì không.
4. **Back stack là lịch sử điều hướng, không phải kho dữ liệu.** Nhét object vào route nghĩa là dùng
   lịch sử làm bộ nhớ tạm — và rò rỉ dữ liệu vào một cơ chế không được thiết kế cho việc đó. Route chỉ
   nên chứa **thông tin định danh** đủ để destination tự biết phải đi hỏi ai, hỏi gì.
5. **Lưu/khôi phục trở nên dễ dàng.** Hệ thống có thể dựng lại lịch sử điều hướng (xoay máy, thu hồi tiến
   trình). Khôi phục một `Int` ổn định là chuyện nhỏ; khôi phục cả object là chuyện lớn — và có thể là
   chuyện **không làm được** nếu object không được thiết kế để phục hồi. Định danh nhỏ, ổn định — thì
   bên nhận tự dựng lại được dữ liệu.

Đây là **callout cảnh báo duy nhất của bài**, và là một trong hai điều cần mang ra khỏi cả bài:

> **Cảnh báo — không cất object vào back stack**
>
> Route type-safe cho phép bạn truyền *gì cũng được* — đó là quyền, không phải lời mời. Một route nên
> chứa **thông tin định danh nhỏ** (ID, vài tham số lựa chọn), không chứa object dữ liệu, UI state,
> ViewModel, hay bất kỳ cơ chế nào của app. Quy tắc của Phần 11 nói cụ thể những gì nên/không nên; lý do
> nằm ở năm dòng trên. Khi phân vân, hỏi: *"đây là thông tin để **định danh** một lần mở destination,
> hay là **dữ liệu** mà destination nên tự lấy?"*

> **Tự kiểm tra 7.** Một đồng nghiệp viết
> `RecipeDetailsRoute(recipe = recipe)` để "đỡ phải query lại". Điểm sai *kiến trúc* nào ở đây — không
> phải điểm hiệu năng?
>
> *(Đáp án: nó lấy **dữ liệu chụp tại một thời điểm** thay thế cho **quyền hỏi dữ liệu hiện có** — trang
> chi tiết không còn đi qua biên giới dữ liệu của S5, nên không thể phản ánh thay đổi; và nó biến lịch sử
> điều hướng thành kho lưu object — thứ nó không phải là. Hiệu năng chỉ là lớp ngoài; sai lầm nằm ở chỗ
> dữ liệu bị chốt vào một cơ chế thuộc về điều hướng.)*

---

## Phần 11 — Nên truyền gì, không nên truyền gì

Quy tắc ra quyết định của người mới — không tuyệt đối hoá, nhưng đủ để chấm dứt phân vân:

**Thường nên truyền qua route:**

- **ID** — `recipeId`, `userId`, `orderId` — cái điển hình và đúng nhất.
- **Một giá trị nhỏ định danh biến thể** — enum/tuỳ chọn nhỏ: `"detail"` vs `"summary"`, tab nào, chế độ
  xem nào.
- **Một lựa chọn lọc/sắp xếp đơn giản** — chuỗi tìm kiếm người dùng vừa gõ, một cờ boolean.
- Tóm một câu: *thông tin tối thiểu để destination biết phải tự dựng lại trạng thái nào.*

**Không nên truyền qua route:**

| Không nên | Vì sao |
|---|---|
| **Object dữ liệu lớn** (`Recipe` cả, danh sách cả) | Lý do 1–3 của Phần 10 — lớn, có thể cũ, nên lấy lại qua ID |
| **UI state** (`UiState`, loading/error) | UI state là *kết quả* mà destination tự dựng — Phần 12 |
| **ViewModel** | Sở hữu state của màn hình; không phải hành lý của route (S4) |
| **Repository** | Là biên giới dữ liệu của *cả app*; mọi destination dùng chung một biên giới, không mang nó theo từng lần navigate (S5) |
| **`Context`, resource manager** | Thứ thuộc nền tảng/môi trường; route là dữ liệu thuần của điều hướng |
| **`NavController`** | Controller thuộc chỗ khai đồ thị — N1 Phần 10 đã dựng toàn bộ lý do |
| **Đối tượng database/mạng** | Thứ nằm *dưới* biên giới dữ liệu; lộ qua route là phá tầng (S5) |

Chữ "không nên" là chính xác — đừng biến nó thành giáo điều "chỉ bao giờ được truyền ID". Có những route
hợp lệ mang vài tham số (`RecipeDetailsRoute(recipeId, fromWhere)`). Thước đo luôn là câu hỏi cuối
Phần 10: **định danh, hay dữ liệu?** Định danh thì nhỏ, ổn định, số lượng ít — hợp lệ. Dữ liệu thì để
destination tự lấy qua biên giới S5.

---

## Phần 12 — Dữ liệu route ≠ UI state

Sau S2–S4, bạn đã có khái niệm UI state — và nguy hiểm của bài này là trộn nó với dữ liệu route. Tách
hai cái, và mỗi thứ trả lời một câu hỏi khác nhau:

| | **Dữ liệu route** (tham số điều hướng) | **UI state** (S2–S4) |
|---|---|---|
| Trả lời câu hỏi | *"Đây là **lần mở** destination nào?"* | *"Destination đó **hiện đang hiển thị** gì?"* |
| Ví dụ | `recipeId = 42` — định danh lần mở trang chi tiết của món 42 | `loading` → `recipe` → `error` — trạng thái hiển thị của trang đó |
| Ai giữ | Controller — trong mục lịch sử | ViewModel của màn hình |
| Có đổi theo thời gian không | Không — một mục lịch sử được sinh ra với một ID rồi **không đổi** | Có — dữ liệu tải xong, lỗi xảy ra, người dùng tương tác |

Điểm phân biệt thực dụng nhất nằm ở hàng cuối: **route là "hồ sơ sinh" của một lần mở destination —
sinh ra thì không sửa**; còn UI state thì sống và đổi suốt đời màn hình. `recipeId = 42` của mục lịch
sử không bao giờ thành `43` — nếu người dùng muốn xem món 43, đó là *một lần navigate khác*, một mục
lịch sử mới. Muốn trang 42 đổi từ loading sang có-dữ-liệu, đó là việc của UI state trong ViewModel —
không phải của route.

Hệ quả đúng như bảng ở Phần 11: **đừng nhét `UiState` vào route** — route nói "mở món nào", không nói
"màn hình đang trông thế nào". (N1 Phần 12 đã tách *trạng thái điều hướng* khỏi *UI state* ở tầm nhìn
bức tranh lớn; bài này tinh chỉnh thêm một mặt của cùng ranh giới đó.)

---

## Phần 13 — Nối lại toàn mạch: từ RecipeCard đến repository

Bài này khép lại Giai đoạn 4 — nên khép bằng mạch dữ liệu hoàn chỉnh, từng mắt xích một. Tất cả đều là
thứ bạn đã học, chỉ giờ mới đứng cùng nhau:

```kotlin
// Trong danh sách — RecipeCard nhận một callback (S3)
RecipeCard(
  onClick = {
    onOpenRecipe(recipe.id)                          // ① màn hình phát sự kiện kèm ID
  }
)
```

```kotlin
// Ở chỗ khai đồ thị — sự kiện thành lệnh điều hướng (N1 + bài này)
composable<HomeRoute> {
  HomeScreen(
    onOpenRecipe = { recipeId ->
      navController.navigate(                        // ② tạo giá trị route từ ID
        RecipeDetailsRoute(recipeId)
      )
    }
  )
}
```

```kotlin
// Trong destination đích — route thành dữ liệu cho ViewModel
composable<RecipeDetailsRoute> { backStackEntry ->
  val route = backStackEntry.toRoute<RecipeDetailsRoute>()   // ③ giải mã route
  RecipeDetailsScreen(
    recipeId = route.recipeId,                        // ④ ID đi vào màn hình
    onBack = { navController.popBackStack() }
  )
}
```

Đọc ①→④ ngược lại, theo chiều dữ liệu: một **ID nhỏ** là thứ duy nhất đi qua ranh giới điều hướng; tới
nơi thì nó trở thành **tham số để hỏi dữ liệu** — ViewModel dùng nó gọi xuống biên giới dữ liệu
(repository của S5), nhận dữ liệu hiện có, biến thành UI state, và màn hình vẽ. Không có object nào bị
nhét vào lịch sử; không có ViewModel nào biết `NavController` tồn tại (N1 Phần 13).

> 🔭 *Bước ③ có một biến thể "nâng cao hơn": thay vì destination đọc route rồi truyền xuống, ViewModel
> của destination có thể tự đọc route qua `SavedStateHandle.toRoute<RecipeDetailsRoute>()` — bạn đã nghe
> tên `SavedStateHandle` ở S4 ở mức "biết là nó tồn tại". Ở đây chỉ cần nhận ra **hình dạng**: cùng một
> lời gọi `toRoute<T>()`, khác chỗ nó đứng. Cách nối ViewModel với route đầy đủ thuộc phần kiến trúc sau
> này — bài này dừng ở bước ④.*

Chú ý một điều nữa về ②: `recipe.id` nằm trong **callback** — đúng quy tắc "navigate trong callback, không
trong thân composable" của N1 Phần 9. Cả mạch ①→④ không có một dòng nào chạy lúc vẽ; tất cả chạy khi có
sự kiện.

---

## Phần 14 — Đọc code thật: project mẫu 2023 làm việc đó thế nào

Toàn bộ phần trước dạy cách *viết mới*. Đây là phần dạy cách *đọc cũ* — và "cũ" nghĩa là code thật,
nguyên văn, trong project mẫu của giai đoạn Mạng. Mở lại đúng file mà N1 đã định vị:
`aaf-materials/08-networking/projects/final/app/src/main/java/com/kodeco/recipefinder/MainActivity.kt`,
dòng **86–95** — khối mà N1 Phần 14 dán ba nhãn "thuộc N2", giờ giải phẫu:

```kotlin
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
```

Đọc từng mảnh, theo đúng thứ tự mà một lần navigate đi qua:

| Mảnh | Vai | Mô hình type-safe tương ứng |
|---|---|---|
| `"details/{recipeId}"` | **Route mẫu có chỗ trống**: tên destination (`details`) + ô dữ liệu tên `recipeId` | `@Serializable data class RecipeDetailsRoute(val recipeId: Int)` — ô trống thành **thuộc tính** |
| `navArgument("recipeId") { … }` | Khai báo **metadata của tham số** "recipeId" — gắn cho destination, theo *tên chuỗi* | Không cần gì tương ứng — tên và kiểu đã nằm trong thuộc tính của route class |
| `type = NavType.IntType` | **Kiểu** của tham số: số nguyên | `val recipeId: Int` — kiểu của thuộc tính |
| `backStackEntry.arguments` | **Bộ tham số của mục lịch sử** — tra giá trị theo *tên chuỗi* | `backStackEntry.toRoute<RecipeDetailsRoute>()` — tra theo *kiểu* |
| `?.getInt("recipeId") ?: 0` | Đọc một `Int` từ bộ tham số **có thể `null`** (`arguments`), nên phải bọc `?.` và lấp `?: 0`; và tra sai tên thì `getInt` âm thầm trả `0` | `route.recipeId` — không nullable, không cần giá trị lấp |
| (phía gọi — `ui/recipes/ShowRecipeList.kt` dòng 114) | `navController.navigate("details/${item.id}")` — **tự ghép chuỗi** trong callback | `navController.navigate(RecipeDetailsRoute(item.id))` |

Hai điều nên nhận ra trong code thật, vì chúng là "vết" của mô hình chuỗi mà Phần 5 đã dự báo:

- **`?: 0` không phải phong cách — nó là lá chắn phải có.** `arguments` là bộ tham số **nullable**, nên
  code phải bọc `?.` và lấp `?: 0` cho trường hợp bộ tham số rỗng. Còn tra **sai tên key** thì `getInt`
  không báo lỗi — nó âm thầm trả `0`. Hai đường lỗi khác nhau, cùng một kết quả: destination cầm một con
  số không có thật.
- **`recipeId = 0` là một món "không tồn tại"** chui vào luồng dữ liệu như một ID hợp lệ — không crash,
  không cảnh báo, chỉ là trang chi tiết không có nội dung đúng. Đó là cái giá của giá-trị-lấp; nó minh
  hoạ vì sao "đọc bằng chuỗi, lỗi muộn" đắt.

Còn một khối nữa cùng khuôn — `composable("bookmarks/{recipeId}", …)` ngay dưới (dòng 96–105): cùng
mẫu, cùng kiểu, chỉ khác chỗ tham số được **đổ vào một tham số khác** của cùng một màn hình
(`databaseRecipeId = …`). Nó là bằng chứng sống cho Phần 2 của N1 (3 destination — 2 hàm màn hình) và
cho Phần 10 của bài này: **hai lối vào khác nhau, cùng một thứ định danh — một ID — cùng trỏ về một
destination.**

Phía gọi (lấy nguyên văn, `ui/recipes/ShowRecipeList.kt` dòng 112–117):

```kotlin
RecipeCard(
  modifier = Modifier.clickable {
    navController.navigate("details/${item.id}")
  },
  item
)
```

Đọc đúng chỗ: `navigate` nằm trong `clickable` — callback, đúng quy tắc; `item.id` là ID của object
`Recipe` đang được vẽ (F2: data class có thuộc tính `id: Int`) — **cái được truyền là ID, không phải cả
object**. Code cũ này **đúng nguyên tắc truyền-dữ-liệu** của Phần 10 một cách trọn vẹn — sai ở *cách
biểu diễn route*, không sai ở *cái được truyền*. Đọc phê phán nghĩa là phân biệt được hai tầng đó.

Sau Phần này, sáu dòng mà task bài học yêu cầu bạn "đọc mà không thấy thần kỳ" — `"details/{recipeId}"`,
`navArgument("recipeId")`, `NavType.IntType`, `backStackEntry.arguments?.getInt("recipeId") ?: 0`,
`navigate("details/$recipeId")`, `popBackStack()` — đều đã có tên và vai.

---

## Phần 15 — Hai lời gọi `popBackStack()` thật trong `RecipeDetails`

Project mẫu có đúng **hai** lời gọi `popBackStack()` — cả hai nằm trong
`ui/RecipeDetails.kt`, và mỗi cái dạy một tình huống rời khỏi màn hình.

**Lời gọi thứ nhất — dòng 167: nút Back của app.**

```kotlin
IconButton(onClick = { navController.popBackStack() }) {
  Icon(
    imageVector = Icons.Default.ArrowBack,
    tint = Color.Black,
    contentDescription = "Go back"
  )
}
```

Truy vết đúng khuôn Phần 2 và 4: người dùng chạm mũi tên → `onClick` chạy → `popBackStack()` → mục
chi tiết bị bỏ khỏi đỉnh lịch sử → mục dưới (danh sách) hiện lại. Một điểm mà N1 đã chỉ rõ: nút này
không tự gọi `popBackStack()` — nó nằm trong `TitleRow`, mà `TitleRow` **được truyền thẳng
`navController`** (dòng 155). Khuôn đúng của bài này là `onBack: () -> Unit` — nói lại để bạn nhớ rằng
code thật làm *khác* khuôn khoá, và N1 Phần 10 đã có toàn bộ lập trình; không lặp lại ở đây.

**Lời gọi thứ hai — dòng 190: rời màn hình khi một việc vừa làm.**

```kotlin
IconButton(onClick = {
  scope.launch {
    if (isBookmark) {
      viewModel.deleteBookmark()
    } else {
      viewModel.bookmarkRecipe()
    }
  }
  navController.popBackStack()                          // dòng 190
})
```

Đây là một **tình huống khác nút Back**: nút bookmark có nhiệm vụ *ghi/xoá* một dữ liệu, và **app quyết
định rời màn hình** — đúng khuôn "xong việc thì tự đóng trang" mà N1 Phần 12 nhắc là tồn tại. Lời gọi
`popBackStack()` ở đây không thay cho Back của người dùng; nó là phần **hành vi của app** sau một hành
động: "đã xử lý yêu cầu bookmark, màn hình này không còn việc gì nữa — đưa người dùng về trước đó."

Và một quan sát cẩn trọng, **chỉ ở mức nhận diện**: dòng `scope.launch { … }` là coroutine — bạn biết từ
S1 rằng `launch` **khởi động** công việc và *không chờ* nó chạy xong; rồi dòng 190 chạy ngay sau đó. Câu
hỏi "việc bookmark có kịp hoàn thành trước khi màn hình bị pop, và việc pop ảnh hưởng ra sao tới coroutine
đang chạy" đòi hỏi cơ chế vòng đời của scope gắn với composable và cơ chế huỷ coroutine — **không thuộc
bài này**. Nói một cách an toàn: hai dòng trên *nào là khởi động việc, nào là rời màn hình* — đó là toàn
bộ điều bài này đòi bạn đọc được; phân tích sâu hơn được ghi lại cho **W1**, nơi coroutine đầy đủ được
dạy. Đừng tự kết luận sớm từ nửa bài học — đó chính là kỹ năng đọc phê phán mà khoá luyện: biết *khi nào
mình chưa đủ công cụ để kết luận*.

Ngoài hai chỗ đó, trong cả project không còn lời gọi pop nào khác (đã kiểm), và **không có** biến thể
`popBackStack(route, inclusive)`, `popUpTo`, `launchSingleTop`, `saveState`/`restoreState` — "không có"
trong project nghĩa là Phần 14 không cần chúng để đọc; còn học thì thuộc phần tra cứu, như đã ghi ở đầu
bài.

---

## Phần 16 — Up và Back: một câu, không hơn

Mở đúng một khái niệm nhỏ cho đủ, rồi đóng lại.

- **Back** = *điều hướng lịch sử*: đưa bạn về nơi bạn **thực sự vừa đi qua** — đỉnh stack bị bỏ đi.
- **Up** = *khái niệm điều hướng theo thứ bậc*: đưa bạn về "cha" của màn hình hiện tại trong cây phân cấp
  của app — kể cả khi bạn không đến từ đó (mở app thẳng vào trang chi tiết từ một thông báo, chẳng hạn).

Với đồ thị đơn giản của giai đoạn này — không deep link, không luồng lạ — hai thứ trùng nhau: nút mũi
tên trên app bar gọi `popBackStack()` là đủ đúng. Bài này **không** dạy `navigateUp()` hay các trường hợp
Up và Back tách nhau — khi app của bạn bắt đầu có lối vào không phải điều hướng, đó là lúc tra lại tài
liệu. Ghi lại ranh giới là kỹ năng; nhồi hết mọi trường hợp là nguyên nhân các bài dài lê thê.

> **Ghi chú quan trọng — Up/Back trong project mẫu**
>
> Mũi tên trên trang chi tiết của project mẫu (`RecipeDetails`) thực chất đang làm vai **Up** một cách
> hình thức (nó là mũi tên "lên/trở về" của app bar) nhưng dùng `popBackStack()` — và trong đồ thị đơn
> giản của project, hành vi đó là đúng. Đừng sửa nó; chỉ đừng lẫn rằng "mũi tên app bar = luôn là Up
> nghiêm ngặt". Trong giai đoạn này, callback trên app bar gọi `popBackStack()` là đủ.

Đến đây trọn bộ nội dung học của bài đã xong. Còn lại: cạm bẫy, tóm tắt, và một bài luyện tập tổng hợp.

---

## Cạm bẫy

> *Khi dựng trang: đây là khối `<h2 id="cam-bay">` duy nhất của bài. Ba nhóm dưới đây gom theo **niềm
> tin sai của người học** — mỗi nhóm sửa một quyết định, đúng giới hạn "tối đa 3 cạm bẫy / bài" của
> template; bảy cạm bẫy cụ thể của bài được phân vào ba nhóm này.*

**(a) "Quay lại chỉ là một lệnh đi tới."** Niềm tin đứng sau lỗi mô hình phổ biến nhất của bài:

- **Viết Back bằng `navigate(previousRoute)`.** `navigate` mặc định **ghi thêm** mục mới; "quay về Home"
  bằng `navigate("home")` cho ra lịch sử `Home · Details · Home` — Home *mới* đè lên Details cũ, Back
  lúc này không ra khỏi app mà đi ngược qua đống lịch sử phình ra (Phần 3). Back đúng nghĩa là
  `popBackStack()` — bỏ đỉnh, không tạo gì (Phần 2, 4).
- **Ngỡ navigate sẽ "tìm lại" destination đã có.** Không — theo mặc định nó không tra lịch sử. Chồng thẻ
  chỉ được *bỏ thẻ* từ trên xuống; không có động tác "nhảy về tấm thẻ cũ ở giữa" trong bài này (các biến
  thể đó tồn tại nhưng thuộc phần tra cứu — Phần 4).

**(b) "Route là chỗ chứa dữ liệu tiện tay."** Niềm tin đứng sau việc lạm dụng tham số điều hướng:

- **Truyền cả object** (`RecipeDetailsRoute(recipe = wholeRecipe)`) — dữ liệu bị chốt theo thời điểm
  bấm nút, lịch sử thành kho object, khôi phục sau khi app bị dựng lại trở nên nặng nề. Truyền **ID**, để
  destination tự hỏi dữ liệu hiện có qua ViewModel/repository (Phần 10).
- **Nhét UI state, ViewModel, repository, `Context`, `NavController`, đối tượng database/mạng vào
  tham số route** — mỗi thứ vi phạm một ranh giới đã dựng ở S3/S4/S5 và N1 (Phần 11). Câu hỏi chốt luôn
  là: *định danh, hay dữ liệu?* (Phần 10, 11).
- **Coi route là chỗ lưu lâu dài.** Tham số của một mục lịch sử sinh ra là không đổi; dữ liệu *hiện tại*
  của destination nằm ở ViewModel/UI state, không nằm trong route (Phần 12).

**(c) "Chuỗi thô và kiểu Kotlin chỉ là hai cách viết."** Niềm tin đứng sau cả hai chiều sai:

- **Tự ghép route chuỗi trong code mới.** `"details/${item.id}"` là cách biểu diễn của thế hệ Navigation
  2023 — project mẫu viết vậy là đúng thời của nó; code mới của bạn có mô hình type-safe, dùng nó
  (Phần 6, 9). Ghép chuỗi thủ công mang lại đúng cái giá Phần 5 liệt kê: typo, sai khoá, sai kiểu — tất
  cả chỉ nổ lúc chạy.
- **Typo lệch giữa chỗ khai và chỗ đọc trong code cũ.** Mẫu khai `{recipeId}` mà chỗ đọc gõ lệch tên key
  thì không có báo lỗi nào: `getString("recipId")` nhận `null`, `getInt("recipId")` âm thầm nhận `0` —
  và code phải sống sót bằng giá trị lấp. Khi đọc code 2023, đây là chỗ đầu tiên nên soi (Phần 14).
- **Ngỡ type-safe là vô địch.** Route kiểu Kotlin bắt được *lỗi tên và kiểu* lúc biên dịch — không bắt
  được *lỗi luồng*: đi tới đúng destination nhưng sai lúc, back stack dựng sai ý, vẫn là lỗi thiết kế.
  Không có công cụ nào thay được việc vẽ stack ra giấy trước khi viết (Phần 7).

Câu để nhớ, và là câu nên mang ra khỏi cả bài:

> **`navigate` ghi lịch sử; Back tiêu lịch sử; route chỉ mang định danh.** Ba nửa câu đó giữ được thì cả
> bài này chỉ còn là chi tiết.

---

## Tóm tắt

Năm điều cần giữ lại — nếu chỉ nhớ được năm dòng, hãy là năm dòng này:

1. **Back thường pop lịch sử hiện có; đừng dùng `navigate` để giả Back.** `navigate` = đi tới + ghi thêm
   mục; `popBackStack()` = bỏ mục đỉnh và lộ mục dưới. Nút Back của app nên là callback `onBack` →
   `popBackStack()` ở chỗ khai đồ thị.
2. **Tham số route nên chứa thông tin định danh tối thiểu.** ID, một giá trị nhỏ, một lựa chọn lọc —
   đủ để destination biết phải tự dựng lại trạng thái nào. Không tuyệt đối hoá "chỉ ID", nhưng object
   lớn thì gần như luôn là dấu hiệu sai.
3. **Truyền ID, đừng truyền cả object.** ID nhỏ, ổn định, dễ khôi phục; object thì lớn, có thể cũ, và
   khoá dữ liệu vào thời điểm bấm nút. Destination lấy dữ liệu hiện có qua ViewModel/repository — đúng
   biên giới của S5.
4. **Route type-safe biểu diễn destination/tham số bằng kiểu Kotlin.** `@Serializable object` cho
   destination không tham số; `@Serializable data class` cho destination có tham số; điều hướng bằng
   `navigate(GiáTriRoute(...))`; đọc lại bằng `backStackEntry.toRoute<T>()`. Phần lớn lỗi tên/kiểu được
   bắt lúc biên dịch — không phải mọi lỗi điều hướng đều biến mất.
5. **Đọc code mẫu 2023 thành thạo, nhưng đừng chép sang code mới.** `"details/{recipeId}"` +
   `navArgument` + `NavType` + `backStackEntry.arguments` + `navigate("details/$id")` là khuôn chuỗi của
   Navigation 2.7.2; đọc được từng mảnh, map được sang mô hình type-safe — và biết vì sao nó vẫn "đúng
   thời của nó".

---

## Luyện tập — đọc một app hai màn hình và truy vết từng cú chạm

Đây là toàn bộ phần điều hướng của một app hai màn hình, viết theo mô hình route type-safe của bài
(mỗi dòng có số đánh dấu để trả lời). Đọc rồi trả lời sáu câu bên dưới.

```kotlin
@Serializable
object HomeRoute                                              // ①

@Serializable
data class RecipeDetailsRoute(
  val recipeId: Int                                           // ②
)

@Composable
fun HomeScreen(onOpenRecipe: (Int) -> Unit) {
  Column {
    Text("Danh sách công thức")
    Button(onClick = { onOpenRecipe(42) }) {                  // ③
      Text("Mở chi tiết")
    }
  }
}

@Composable
fun RecipeDetailsScreen(
  recipeId: Int,
  onBack: () -> Unit                                          // ④
) {
  Column {
    Text("Chi tiết công thức #$recipeId")
    Button(onClick = onBack) {                                // ⑤
      Text("Quay lại")
    }
  }
}

@Composable
fun AppNavigation() {
  val navController = rememberNavController()                 // ⑥

  NavHost(
    navController = navController,
    startDestination = HomeRoute                              // ⑦
  ) {
    composable<HomeRoute> {                                   // ⑧
      HomeScreen(
        onOpenRecipe = { id ->
          navController.navigate(RecipeDetailsRoute(id))      // ⑨
        }
      )
    }
    composable<RecipeDetailsRoute> { backStackEntry ->        // ⑩
      val route = backStackEntry.toRoute<RecipeDetailsRoute>()  // ⑪
      RecipeDetailsScreen(
        recipeId = route.recipeId,
        onBack = { navController.popBackStack() }             // ⑫
      )
    }
  }
}
```

1. Lịch sử điều hướng **ban đầu** (ngay khi app mở) gồm những gì? Mảnh nào quyết định điều đó?
2. Người dùng bấm ③. Giá trị nào được tạo ra ở ⑨, và nó thuộc kiểu nào? Lịch sử bây giờ?
3. Ở ⑪, dữ liệu đi vào `route` từ đâu? `route.recipeId` bằng mấy, và ai "nhớ" giá trị đó giữa lần
   navigate và lần đọc?
4. Ở ⑫, `onBack` **không** là `navigate(HomeRoute)`. Vì sao cách viết tại ⑫ đúng hơn cho nút này?
5. Người dùng bấm ⑤. Lịch sử sau đó? Màn hình nào đang hiện?
6. Nếu ai đó sửa ⑨ thành `navController.navigate("RecipeDetailsRoute")` (nhét cả kiểu vào trong chuỗi),
   chuyện gì xảy ra — và ở *giai đoạn nào*: biên dịch hay chạy?

<details>
<summary>Xem lời giải</summary>

1. **Chỉ một mục: `HomeRoute`.** Mảnh quyết định là ⑦ — `startDestination = HomeRoute`, chỗ vào bình
   thường của đồ thị (N1 Phần 7). Nói cho đúng: destination khởi đầu *bình thường*, không phải lời hứa
   vĩnh viễn.
2. ⑨ tạo **một giá trị data class** `RecipeDetailsRoute(recipeId = 42)` — thuộc kiểu ②. `navigate` mặc
   định ghi thêm nó lên đỉnh lịch sử: `HomeRoute · RecipeDetailsRoute` (RecipeDetailsRoute ở trên cùng,
   đang hiện). Lưu ý cái được truyền từ ③ là **số 42** — một ID, không phải object nào cả (Phần 10).
3. Từ **mục lịch sử** của destination — chính là `backStackEntry` ở ⑩. `toRoute<RecipeDetailsRoute>()`
   giải mã tham số đã đi kèm lần navigate về đúng giá trị route gốc; `route.recipeId = 42`. Giá trị được
   **controller giữ trong mục lịch sử** — không phải trong một biến của bạn (Phần 8, 12).
4. `navigate(HomeRoute)` sẽ **thêm một mục Home mới** lên đỉnh — lịch sử thành `HomeRoute ·
   RecipeDetailsRoute · HomeRoute`: Back sau đó không ra khỏi app mà rơi lại chi tiết lần nữa (cái bẫy
   Phần 3). `popBackStack()` **bỏ mục đỉnh** và lộ đúng Home đã có từ trước — lịch sử sạch, đúng mô hình
   "Back tiêu lịch sử" (Phần 2, 4).
5. Sau ⑤: mục `RecipeDetailsRoute` bị pop — lịch sử còn **`HomeRoute`**; Home hiện lại. Bấm Back hệ
   thống lúc này thường kết thúc app, vì lịch sử chỉ còn một mục (Phần 1).
6. **Biên dịch không báo lỗi** — nó chỉ là một chuỗi hợp lệ; trình biên dịch không có cơ chế nào biết chuỗi đó
   có trỏ tới destination nào không. Lỗi lộ ra **lúc chạy**, đúng lúc người dùng bấm ③. Đây chính là
   cái giá của route-dạng-chuỗi mà Phần 5 dự báo và là toàn bộ động cơ của mô hình type-safe — và cũng
   là lý do code mẫu 2023 (Phần 14) buộc phải sống chung với lỗi-loại-này.

</details>

---

## Editorial migration notes

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

### A. Nguồn code thật đã thu hoạch (đã kiểm trực tiếp trong phiên này)

Gốc: `aaf-materials/08-networking/projects/final/app/src/main/java/com/kodeco/recipefinder/`.
**`starter` và `final` giống nhau từng byte** ở `MainActivity.kt` và `ui/RecipeDetails.kt` (kiểm bằng
`diff` trong phiên này — khẳng định lại của N1). Mọi số dòng dùng được cho cả hai.

| Nội dung | Vị trí | Dùng ở đâu trong N2 |
|---|---|---|
| `navigation="2.7.2"` | `gradle/libs.versions.toml` dòng 17 | Phần 9, 14 |
| Khối `composable("details/{recipeId}", arguments = listOf(navArgument("recipeId") { type = NavType.IntType })) { backStackEntry -> RecipeDetails(recipeId = backStackEntry.arguments?.getInt("recipeId") ?: 0) }` | `MainActivity.kt` dòng 86–95 | Phần 14 — trích **nguyên văn** |
| Khối `composable("bookmarks/{recipeId}", …)` cùng khuôn, đổ vào `databaseRecipeId` | `MainActivity.kt` dòng 96–105 | Phần 14 (một đoạn nhắc) |
| `NavHost(navController = navController, startDestination = "main")` + `composable("main")` | `MainActivity.kt` dòng 84–85 | (N1 sở hữu; N2 không trích lại) |
| `navController.navigate("details/${item.id}")` trong `Modifier.clickable` | `ui/recipes/ShowRecipeList.kt` dòng 112–117 (lời gọi ở dòng 114) | Phần 13 (khuôn type-safe tương ứng), Phần 14 — trích nguyên văn |
| `navController.navigate("bookmarks/${recipe.id}")` ×2 | `ui/widgets/BookmarkCard.kt` dòng 75 và 108 | Chỉ liệt kê — cùng khuôn 114, không trích |
| `fun RecipeDetails(recipeId: Int? = null, databaseRecipeId: Int? = null)` | `ui/RecipeDetails.kt` dòng 84 | Phần 14 (hai lối vào — một ID) |
| `val navController = LocalNavigatorProvider.current` | `ui/RecipeDetails.kt` dòng 92 | (N1 sở hữu — CompositionLocal, D2 sở hữu doctrine) |
| `TitleRow(…, navController: NavHostController, …)` — truyền controller xuống composable con | `ui/RecipeDetails.kt` dòng 152–159 | Phần 15 (chỉ trỏ về lập trình N1 Phần 10) |
| `IconButton(onClick = { navController.popBackStack() })` + `Icons.Default.ArrowBack` | `ui/RecipeDetails.kt` dòng 167 (icon ở 169) | Phần 15 — trích nguyên văn |
| `scope.launch { deleteBookmark()/bookmarkRecipe() }` rồi `navController.popBackStack()` | `ui/RecipeDetails.kt` dòng 180–191 (pop ở dòng 190) | Phần 15 — nhận diện + ghi W1 |
| `Icons.Default.ArrowBack` | `ui/RecipeDetails.kt` dòng 169 | (AP3 — N1 đã ghi; N2 không dạy icon) |
| `suspend fun queryRecipe(id)` → gọi service theo ID | `viewmodels/RecipeViewModel.kt` dòng 117–122 | Phần 10, 13 (mạch ID → ViewModel → nguồn dữ liệu; không trích code — W2 sở hữu phần mạng) |

**Kiểm tra bổ sung trong phiên này (zero match trong toàn bộ source của project 08):**
`popUpTo` · `launchSingleTop` · `saveState` · `restoreState` · `navigateUp` · `@Serializable` · `toRoute` ·
khai báo `kotlinx-serialization` ở `build.gradle.kts`/`libs.versions.toml` — **không có mục nào tồn tại**.
Nghĩa là: (a) Phần 14 không cần dạy bất kỳ biến thể nào để đọc project; (b) project mẫu **không thể**
chạy code type-safe — Phần 9 nói thẳng; (c) hai lời gọi `popBackStack()` là toàn bộ "phần Back" của code
thật. **Phiên bản navigation của các project khác:** 09 = 2.7.2, 10 = 2.7.2, 11 = **2.7.4**
(`libs.versions.toml` dòng 17 của mỗi project — 08–10 cùng một dòng 17).

**Lưu ý lệch với bản nháp task:** đề bài đưa ví dụ minh hoạ `NavType.StringType` /
`backStackEntry.arguments?.getString("recipeId")` / route `"details/123"` — **code thật dùng
`NavType.IntType` + `getInt("recipeId")`** (và `Recipe.id: Int`). Bài này dạy theo **code thật**
(nguyên tắc "PRIMARY REAL-CODE SOURCE" của task), và route type-safe tương ứng dùng
`val recipeId: Int` — map cũ→new một-một. Đề bài cũng ghi `recipeId: String` trong mô hình type-safe
mong muốn; chọn `Int` để (a) khớp code thật, (b) tránh nhu cầu nói chuyện chuyển kiểu chuỗi↔số.

### B. Phân loại nội dung điều hướng đang có trong khoá (source harvest)

Mã: **A** = TEACH → N2 · **B** = OLD-STYLE example (đọc, không bắt chước) · **C** = N1 đã sở hữu ·
**D** = W1/W2/W3 · **E** = AP3/version drift · **F** = trùng lặp/giọng thuật lại nguồn.

| Nguồn | Nội dung | Mã | Ghi chú |
|---|---|---|---|
| `MainActivity.kt` 86–105 | route mẫu + `navArgument` + `NavType` + `backStackEntry.arguments` | **A + B** | Giải phẫu ở Phần 14; giữ nguyên văn; là ví dụ cũ-đúng-thời-của-nó |
| `ShowRecipeList.kt` 114, `BookmarkCard.kt` 75/108 | `navigate("…/${id}")` | **A + B** | Đúng nguyên tắc truyền-ID; sai cách biểu diễn — đúng tầng cần tách ở Phần 14 |
| `RecipeDetails.kt` 167 | `popBackStack()` nút Back | **A** | Phần 15 — truy vết chuẩn |
| `RecipeDetails.kt` 180–191 | `scope.launch { … }` rồi `popBackStack()` | **A (nhận diện) + D (phân tích)** | Chỉ dạy "launch khởi động việc; pop rời màn hình" ở mức nhận diện; phân tích vòng-lifecycle/huỷ → **W1** (ghi ở mục F) |
| `RecipeDetails.kt` 152–159 (TitleRow nhận `navController`) | Controller đi xuống composable con | **C** | N1 Phần 10/15 đã sở hữu toàn bộ lập trình; N2 chỉ trỏ lại |
| `RecipeDetails.kt` 92, `ShowRecipeList.kt` 73 | `LocalNavigatorProvider.current` | **C** | N1 Phần 14.3 nhận diện; doctrine → D2 |
| `Ch08Networking.astro` (LIVE) dòng 1673–1687, 1800–1815 | "Điểm lệch #8" — hai preview không render (vì `LocalNavigatorProvider`) | **C** | Ở lại W-batch; khi N1/N2 live → rút gọn + cross-ref (đã ghi trong N1 migration notes D.1) |
| `Ch08Networking.astro` mục 21 (~1830–1900) | Bảng "Ghi chú phiên bản" — **không có hàng nào cho `navigation-compose`** | **E** | Khi W-batch dựng lại: thêm hàng `navigation-compose` trỏ AP3; hàng dành cho người học về type-safe nằm ở N2 Phần 9 |
| `Ch08_4CodegenVaDocLai.astro` dòng 327–337, 460–465 (file mồ côi, không trong `lessons.ts`) | Bản sao khối "Điểm lệch #8" | **F** | Trùng nội dung với bản live; không hành động |
| `content/book/*.md` — toàn bộ giáo trình gốc | **0 match** cho `NavHost`, `popBackStack`, `Navigation Compose`, `rememberNavController` (kiểm lại trong phiên này) | — | N2 **không có provenance giáo trình gốc** — như N1; không được bịa provenance |

### C. API type-safe đã verify từ tài liệu chính thức (ngày 2026-09-06)

| Khẳng định trong bài | Nguồn chính thức | Trạng thái |
|---|---|---|
| Route type-safe có từ **Navigation 2.8.0** | `/guide/navigation/design/type-safety` — "available as of Navigation 2.8.0" | ✅ |
| Bản ổn định hiện tại **2.10.0** (26/08/2026); 2.9.x trước đó; 2.8.0 ổn định 04/09/2024 | `/jetpack/androidx/releases/navigation` | ✅ |
| `@Serializable object Home` / `@Serializable data class Profile(val id: String)` | `/guide/navigation/design/type-safety` | ✅ (bài đổi tên thành `HomeRoute`/`RecipeDetailsRoute`) |
| `NavHost(navController, startDestination = Home)` — startDestination nhận giá trị route | trang type-safety, ví dụ graph | ✅ |
| `composable<T>()` — tên kiểu trong tham số generic | trang type-safety | ✅ |
| `navController.navigate(Profile(id = 123))` — truyền giá trị route | trang type-safety | ✅ |
| `backStackEntry.toRoute()` — giải mã từ `NavBackStackEntry` | trang type-safety | ✅ |
| `import androidx.navigation.toRoute` — extension trên `NavBackStackEntry` **và** `SavedStateHandle`, ký hiệu `<reified T : Any>` | API reference `androidx.navigation` package | ✅ |
| `SavedStateHandle.toRoute<T>()` trong ViewModel | trang type-safety (ví dụ `ProfileViewModel`) | ✅ — chỉ ở mức nhận diện trong N2 (Phần 13) |
| Setup: plugin `org.jetbrains.kotlin.plugin.serialization` + `kotlinx-serialization-json` (ví dụ docs dùng 1.7.3) | `/guide/navigation/type-safe-destinations` (Prerequisites) + releases page | ✅ |
| `popBackStack()` = "cố gắng bỏ destination hiện hành, về destination trước đó"; trả Boolean; `false` khi pop đến rỗng | `/guide/navigation/backstack` | ✅ |
| `navigate()` mặc định push lên đỉnh; Back/Up pop đỉnh; back stack là LIFO | `/guide/navigation/backstack` | ✅ |
| `popBackStack(id/route, inclusive)` và `popUpTo` (+`saveState`/`restoreState`) tồn tại | `/guide/navigation/backstack` | ✅ — chỉ nêu "tồn tại, thuộc tra cứu", không dạy |
| **Navigation 3 ổn định**: 1.0.0 ngày 19/11/2025; bản ổn định mới nhất **1.1.4** (01/07/2026); thư viện riêng `androidx.navigation3` | `/jetpack/androidx/releases/navigation3` | ✅ — một ghi chú duy nhất ở Phần 9 |

Điểm cần giữ khi review: **không** nâng khẳng định type-safe thành "xoá mọi lỗi runtime" — tài liệu
migration guide nói nó "eliminate runtime crashes caused by typos or incorrect argument types" (tức đúng
phạm vi tên/kiểu); bài giữ wording "phần lớn lỗi tên/kiểu chuyển sang lúc biên dịch; lỗi luồng vẫn là lỗi
thiết kế" (Phần 7, cạm bẫy c).

### D. Old → typed route: bảng map khái niệm (dùng lại khi dựng trang nếu cần)

| Cũ (2.7.2, project mẫu) | Mới (2.8.0+, khoá khuyên dùng) |
|---|---|
| Route = chuỗi, có chỗ trống: `"details/{recipeId}"` | Route = kiểu Kotlin: `@Serializable data class RecipeDetailsRoute(val recipeId: Int)` |
| Tham số khai riêng theo tên: `navArgument("recipeId") { type = NavType.IntType }` | Không cần khai riêng — tên + kiểu là thuộc tính của route class |
| Đi tới bằng nội suy chuỗi: `navigate("details/${item.id}")` | Đi tới bằng giá trị: `navigate(RecipeDetailsRoute(item.id))` |
| Đọc bằng tên-chuỗi, nhận nullable: `backStackEntry.arguments?.getInt("recipeId") ?: 0` | Đọc bằng kiểu, nhận giá trị route: `backStackEntry.toRoute<RecipeDetailsRoute>()` |
| Typo/sai kiểu lộ lúc chạy | Lỗi tên/kiểu phần lớn bị bắt lúc biên dịch (không phải mọi lỗi) |

### E. Ứng viên drift → AP3 (`docs/drafts/ap3-version-drift.md`)

| Điểm | Bằng chứng | Ghi chú |
|---|---|---|
| `navigation-compose` **2.7.2** (08, 09, 10) và **2.7.4** (11) vs bản ổn định hiện tại **2.10.0** | `gradle/libs.versions.toml` dòng 17 mỗi project | Hàng AP3: "2.7.x = trước route type-safe; 2.8.0+ mới hỗ trợ" — chi tiết cho người học đã nằm N2 Phần 9 |
| Route type-safe: có từ 2.8.0; cần plugin serialization + json dependency | docs type-safety + type-safe-destinations | Cùng hàng trên |
| Navigation 3 — ổn định 1.0.0 (19/11/2025), ổn định mới nhất 1.1.4 | `/jetpack/androidx/releases/navigation3` | Hàng AP3 riêng; N2 giữ đúng một ghi chú (Phần 9) |
| `Icons.Default.ArrowBack` | `ui/RecipeDetails.kt` dòng 169 | Đã ghi trong N1 (F) — N2 không thêm gì |
| `scope.launch { … }` rồi `popBackStack()` ngay sau | `ui/RecipeDetails.kt` 180–191 | **Không phải drift phiên bản** — là vấn đề thứ tự/vòng đời; đích: **W1** (mục F) |

### F. Ghi lại cho W1 (advanced note — không dạy ở N2)

Cặp dòng `RecipeDetails.kt` 180–191: `scope.launch { viewModel.bookmarkRecipe() }` khởi động coroutine
rồi `navController.popBackStack()` chạy ngay sau, không chờ. Câu hỏi thật: việc ghi có hoàn thành trước
khi màn hình rời composition hay không; `rememberCoroutineScope` gắn với composable, pop destination thì
scope ra sao; coroutine đang chạy bị huỷ thế nào. Đó là **cơ chế vòng đời + huỷ coroutine** — thuộc W1
(coroutine/Flow đầy đủ). N2 dừng ở mức: "launch khởi động việc, không chờ; pop rời màn hình; phân tích
kết hợp chưa có công cụ" — không dạy nửa vời, không kết luận sớm về hành vi lúc chạy.

### G. Sau khi N2 live, chỗ nào thay được bằng cross-ref

1. **W-batch (Ch08 → W1–W3):** mọi chỗ code thật hiển thị `composable("details/{recipeId}")`,
   `navArgument`, `backStackEntry.arguments`, `navigate("details/${item.id}")`, `popBackStack()` không
   cần giải thích lại — cross-ref N1 (bộ khung) + N2 (tham số + pop). Nhiệm vụ "trỏ `NavHost` → N1/N2"
   của IMP-040 có nội dung cụ thể ở đây.
2. **Bảng "Ghi chú phiên bản" của Ch08 (mục 21):** thêm một hàng `navigation-compose` (2.7.2 → hiện tại;
   type-safe từ 2.8.0) trỏ AP3; hàng người-học về type-safe không lặp lại — cross-ref N2 Phần 9.
3. **N1:** hai mảnh N1 đang "dán nhãn N2" (bảng Phần 14.2; câu 7 luyện tập về typo-lúc-chạy) giờ có đích
   đích thực — khi dựng trang N2, cross-ref hai chiều N1↔N2.
4. **A4 roadmap:** trỏ Giai đoạn 4 → 2 bài N1/N2 (nhiệm vụ tường minh của IMP-049).
5. **O6 capstone:** đã có đủ để dựng đồ thị nhiều màn hình **mang dữ liệu** — phần "điều hướng có tham
   số" của capstone trỏ N2 thay vì tự dạy lại.

### H. Việc còn lại của IMP-049 mà draft này KHÔNG làm (đúng phạm vi task)

- Dựng trang `.astro` theo template kit (callout family, `<Code>`, "Mục x/y", đúng một
  `<h2 id="cam-bay">` + một `<h2 id="nguon">`; 4 block sơ đồ chữ → `<pre class="tree">`).
- Slug mới + đăng ký `lessons.ts`/`chapters.ts` + nhóm stage điều hướng.
- **Quiz ≥ 8 câu** theo chuẩn §10: trục hỏi sẵn — 6 checkpoint · 3 nhóm cạm bẫy · 6 câu luyện tập ·
  bảng old→new Phần 14 (tốt cho câu "mảnh này thuộc mô hình nào").
- Legacy-credit: bài NEW → không tự done (plan §12.2 case D).
- Cập nhật `PROJECT_PLAN.md` khi batch Giai đoạn 4 đóng.

### I. Ghim cho "Cần biết trước" của các bài sau

- **W2:** đọc `MainActivity.kt` không cần giải thích gì về điều hướng — cả route-mẫu lẫn tham số; chỉ
  cần cross-ref N1/N2.
- **W1:** nhận ghi "launch-then-pop" ở RecipeDetails 180–191 (mục F) làm một ứng viên đọc-phê-phán khi
  dạy huỷ coroutine/vòng đời scope.
- **D2:** kế thừa nhận diện `CompositionLocal` từ N1 (không đổi).
- **R3:** khi ViewModel/Room cần tham số "lấy theo ID", khuôn "route mang ID → ViewModel hỏi repository"
  của N2 Phần 13 dùng lại nguyên vẹn.
- **O6:** capstone điều hướng có tham số + Back chuẩn → khuôn Phần 13/Luyện tập.

---

## Editorial open questions

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

1. **Đánh số mục:** theo quy ước N1/S5 (`Phần k` → `mục k` khi dựng trang, bắt đầu từ 1). Câu hỏi mở
   xuyên-khoá đã ghi ở S5 #1; không mở lại.
2. **`recipeId: Int` thay cho `String` của đề bài** — đã giải thích ở cuối mục A migration notes (code
   thật là `IntType`; map cũ→new một-một). Nếu review muốn `String` cho nhất quán với đề, toàn bộ Phần
   6–14 phải đổi kiểu theo, và điểm "không cần `?: 0`" ở Phần 14 mất một nửa sức nặng — **không khuyến
   nghị**.
3. **Sổ ẩn dụ:** N2 dùng lại **chồng thẻ** của N1 cho back stack (cùng khái niệm — dùng lại có chủ đích,
   không dạy lại) và thêm **một** ẩn dụ mới: "route type-safe = mẫu khai có ô in sẵn so với viết tay ra
   giấy trắng" (Phần 6, được nhắc lại ở Phần 11). Đã tránh: nhà hàng (Room), cửa hàng/quầy/kho (S5),
   sân khấu (bộ khung điều hướng — N1). Ẩn dụ "mẫu khai" chưa quét toàn bộ lesson file để chắc không
   trùng — việc rẻ, làm khi dựng trang.
4. **`popBackStack()` trả `false`:** bài giữ ở mức "biết là có, đừng bọc `if`" (Phần 2, 4). Nếu review
   muốn sâu hơn (kịch bản pop `startDestination`), đó là mở rộng phạm vi — hiện đang ở ranh giới của
   task §16 "không biến Boolean thành khái niệm lớn".
5. **Chưa chạy thử thật trong phiên này (đều đã hedge đúng mức):** (a) demo `navigate("home")` nhân bản
   stack — hành vi "navigate mặc định push lên đỉnh, không tra lịch sử" là phát biểu chính thức của tài
   liệu backstack, nhưng demo-stack-4-mục chưa được chạy trên emulator; (b) chữ "thường ra khỏi app"
   khi Back ở stack 1 mục (kế thừa N1 open question #4b). Cả hai nên chạy một lần trước publish; nếu
   chạy, chụp hành vi thật thay vì đoán.
6. **Bảng "bốn chỗ code mẫu làm khác" của N1 (Phần 15) cố tình KHÔNG lặp lại ở N2** — đúng đề xuất N1
   open question #7: N2 chỉ có bảng old→new khái niệm (Phần 14 + migration notes D) và ghi chú phiên bản
   (Phần 9). Nếu review thấy cần bảng tổng hợp N1+N2, dồn vào AP3 thay vì nhân bản trong bài.
7. **Navigation 3 — đã verify trong phiên này** (khác N1 open question #3): ổn định 1.0.0 ngày
   19/11/2025, ổn định mới nhất 1.1.4 (01/07/2026). Ghi chú duy nhất của bài (Phần 9) dùng wording
   "đã ổn định trong hệ sinh thái hiện tại" + lý do khoá vẫn dạy Nav-2 type-safe (lộ trình nâng cấp từ
   code mẫu Nav 2). Nếu Nav 3 có thay đổi trạng thái trước khi dựng trang, kiểm lại nguồn trước khi
   giữ nguyên chữ.
8. **Hai khối trích nguyên văn** (Phần 14: MainActivity 86–95; ShowRecipeList 112–117) và Phần 15
   (RecipeDetails 167–173, 180–191) — dòng code không sửa so với project; số dòng đã kiểm bằng đọc file
   trong phiên này. Khi dựng trang, dùng đúng header "file + dòng x–y" của kit.

---

## Final readability-test inventory

> **Nội dung biên tập nội bộ — KHÔNG đưa vào bài học cho người học.**

**API/cú pháp mới của bài, tất cả đều gloss tại điểm dùng đầu tiên:**

| Mới | Gloss ở đâu | Cách xử lý |
|---|---|---|
| `popBackStack()` | Phần 2 (khuôn dùng) → Phần 4 (phát biểu chính xác + Boolean + `false`) | Nói rõ "cố gắng bỏ đỉnh, lộ mục dưới"; Boolean ở mức "biết là có" |
| `@Serializable` | Phần 6 — bảng đọc mảnh | Annotation = chú thích cho trình biên dịch (nối `@Composable` của N1); vai: cho Navigation mã hoá/giải mã giá trị route |
| `object` declaration (route không tham số) | Phần 6 — bảng + chú "con dấu" | Kiểu có đúng một giá trị; phân biệt với `object` trong class (không xuất hiện) |
| `composable<T>()` | Phần 7 — bảng đọc dòng | Tên kiểu trong `< >`; nối khuôn generics-recognition của F2 |
| `startDestination = HomeRoute` (giá trị route) | Phần 7 | "controller so khớp bằng kiểu, không bằng chữ" |
| `navigate(GiáTriRoute(...))` | Phần 7 | Tạo giá trị route; sai tên/kiểu → lỗi biên dịch |
| `toRoute<T>()` + `import androidx.navigation.toRoute` | Phần 8 — bảng + đoạn import | Extension function (Kotlin); tra bằng kiểu, nhận giá trị route; `<T>` = nói kiểu cần dựng lại |
| `backStackEntry` (lambda của `composable<T>`) | Phần 8 | Nối nhãn N1 Phần 14.2 "thuộc N2" → giờ giải phẫu |
| `navArgument` · `NavType.IntType` · `backStackEntry.arguments?.getInt(...) ?: 0` · route mẫu `{…}` · `"…/${id}"` | Phần 14 — bảng mảnh→vai→mô-hình-tương-ứng | Chỉ **đọc** (old-style), không dạy như cách viết khuyên dùng; string template của F1; `?:` của F1 |
| `(Int) -> Unit` (callback mang ID) | Luyện tập + Phần 13 | F1 đã dạy function type — không gloss lại, chỉ dùng |
| `Icons.Default.ArrowBack` | Phần 15 — trong nguyên văn | Không dạy icon; là trích nguyên văn; AP3 ghi nhận |
| `scope.launch { … }` | Phần 15 — nhận diện | Chỉ "launch = khởi động việc, không chờ" (S1); phân tích sâu → W1 |

**Khái niệm dùng lại, không dạy lại:** destination · route · đồ thị · `NavController`/`NavHost` ·
`startDestination` · `composable("route")` · `navigate` trong callback (**N1**) · `remember`/
recomposition (**S2**) · hoisting/callback/UDF (**S3**) · ViewModel/UI state (**S4**) · tầng dữ liệu/
repository/nguồn đáng tin (**S5**) · data class · lambda đuôi · function type · string template ·
nullability (**F1/F2**).

**Danh sách loại trừ đã xác minh (vùng "Bài học"):**

- **Không xuất hiện ở bất kỳ đâu trong vùng bài học:** `popUpTo` · `launchSingleTop` · `saveState` ·
  `restoreState` · nhiều back stack · đồ thị lồng nhau · deep link (`navDeepLink`/`deepLinks`) ·
  truyền kết quả ngược giữa destination · custom `NavType` · Parcelable làm phương tiện mang dữ liệu ·
  API Navigation 3 (`NavDisplay` · `EntryProvider` · `NavKey`) · Retrofit/mạng · Room/DataStore ·
  ViewModel factory/DI wiring.
- **Chỉ xuất hiện ở mức nhận diện, kèm nhãn đích:** `popBackStack(route, inclusive)` + các biến thể
  pop/popUpTo (Phần 4 — "tồn tại, thuộc tra cứu") · `SavedStateHandle.toRoute<T>()` (Phần 13 — 🔭, nối
  S4) · Navigation 3 (Phần 9 — một ghi chú duy nhất) · `scope.launch`-then-pop phân tích sâu (Phần 15 →
  W1) · kotlinx.serialization như thư viện (Phần 6 — tường minh "không phải bài học về nó").
- **Không có dòng code nào bị sửa so với project mẫu.** Bốn khối trích nguyên văn có số dòng: Phần 14
  (MainActivity 86–95 · ShowRecipeList 112–117) và Phần 15 (RecipeDetails 167–173 · 180–191). Tất cả
  code ví dụ khác của bài là **do khoá dựng** (khuôn N1: ví dụ Home/Details/Settings không lấy từ
  project mẫu).

**Kiểm cấu trúc:** 16 `Phần` + `Cạm bẫy` + `Tóm tắt` + `Luyện tập` · 4 callout (Phần 3 mô hình trực
quan · Phần 9 ghi chú phiên bản, chứa ghi chú Nav 3 duy nhất · Phần 10 cảnh báo · Phần 16 ghi chú
Up/Back) · 1 ghi chú 🔭 nhỏ (Phần 13 — khuôn standard §9, không tính hạn mức) · 7 checkpoint đánh số
liên tục 1–7 ·
4 block sơ đồ chữ (stack Phần 1/3, truy vết Phần 4, mạch dữ liệu Phần 10/13 → `<pre class="tree">` khi
dựng trang) · 1 `<details>` lời giải · 3 nhóm cạm bẫy phủ đủ 7 cạm bẫy của task §21 · Luyện tập ~45 dòng
code, đủ 10 yếu tố bắt buộc của task §23 (`@Serializable` Home · `@Serializable` Details + ID ·
`rememberNavController` · `NavHost` · `composable<T>()` · callback · `navigate(route)` · `toRoute<T>()` ·
`onBack` · `popBackStack()`), 6 câu truy vết đúng khung task (stack đầu · chạm · giá trị route · giải mã ·
Back · stack sau).

---

## Sources for future Nguồn block

> Tài liệu tham khảo cho khối "Nguồn tham khảo" khi dựng trang. Chỉ liệt kê nguồn **đã đọc trực tiếp**
> khi viết draft này (đã fetch trong phiên 2026-09-06); không kèm số dòng cho tài liệu web; không chế
> provenance.

**Trước hết, một dữ kiện phải ghi rõ: N2 KHÔNG có provenance từ giáo trình gốc** — như N1. Đã grep lại
toàn bộ `content/book/*.md` cho `NavHost`, `popBackStack`, `Navigation Compose`, `rememberNavController`
→ **0 match**. Giáo trình gốc không dạy điều hướng; project mẫu chỉ *dùng* nó. Khối Nguồn của N2 không
trích giáo trình gốc; bài là bài NEW đúng nghĩa (spec §9).

**Tài liệu chính thức Android (developer.android.com) — thẩm quyền kỹ thuật của cả bài:**

*Type safety in Kotlin DSL and Navigation Compose* (`/guide/navigation/design/type-safety`, bản `?hl=en`)
— nguồn chính của Phần 6–8:

- "Type-safe APIs are available as of Navigation 2.8.0."
- Quy tắc chọn kiểu route: object cho route không tham số; class/data class cho route có tham số; "In all
  cases the object or class must be serializable."
- Ví dụ `@Serializable object Home` / `@Serializable data class Profile(val id: String)`; graph ví dụ
  `NavHost(navController, startDestination = Home)` + `composable<Home>` + `composable<Profile>
  { backStackEntry -> val profile: Profile = backStackEntry.toRoute() }`.
- "Because the parameters of the data class are typed, when you pass an instance of that class to
  navigate(), the arguments are necessarily type safe."
- `SavedStateHandle.toRoute<T>()` — ví dụ `ProfileViewModel` lấy route từ `savedStateHandle` rồi đi hỏi
  repository theo `profile.id`.

*Migrating to Type-Safe Navigation* (`/guide/navigation/type-safe-destinations`, bản `?hl=en`, trang cập
nhật 2026-02-26) — nguồn của ghi chú phiên bản/dependency (Phần 9) và khuôn bảng old→new (Phần 14):

- Prerequisites: "Navigation version: Update to Jetpack Navigation 2.8.0 or higher"; khai plugin
  `kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }`
  và `kotlinx-serialization-json` trong version catalog; `import kotlinx.serialization.Serializable`.
- Bảng before/after `profile/{userId}` → `@Serializable data class Profile(val userId: String)`;
  `backStackEntry.arguments?.getString("userId")` → `backStackEntry.toRoute()`;
  `navigate("profile/user123")` → `navigate(Profile(userId = "user123"))`.
- Mục đích tuyên bố: "replacing string-based routes with serializable Kotlin types to achieve
  compile-time safety and eliminate runtime crashes caused by typos or incorrect argument types."

*Navigation and the back stack* (`/guide/navigation/backstack`, bản `?hl=en`) — nguồn của Phần 1–4:

- "The NavController holds a 'back stack' that contains the destinations the user has visited."
- "Each call NavController.navigate() pushes the given destination to the top of the stack."
- "Tapping Up or Back calls the NavController.navigateUp() and NavController.popBackStack() methods,
  respectively. They pop the top destination off the stack."
- LIFO: "the back stack is a 'last in, first out' data structure."
- `popBackStack()`: "attempts to pop the current destination off the back stack and navigate to the
  previous destination… It returns a boolean indicating whether it successfully popped back to the
  destination"; các trường hợp trả `false`; ví dụ `if (!navController.popBackStack()) { finish() }`.
- Các overload `popBackStack(id/route, inclusive)` và `popUpTo` (+ `saveState`/`restoreState`) — chỉ dùng
  để khẳng định "chúng tồn tại", không dạy trong bài.

*Navigation releases* (`/jetpack/androidx/releases/navigation`) — số liệu phiên bản (Phần 9):

- Bản ổn định hiện tại: `androidx.navigation:navigation-*:2.10.0` (26/08/2026); 2.9.8 (22/04/2026);
  2.8.0 (04/09/2024). Dependency ví dụ: `androidx.navigation:navigation-compose:$nav_version` +
  `org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3`.

*Navigation 3 releases* (`/jetpack/androidx/releases/navigation3`) — dữ kiện duy nhất của ghi chú Nav 3
(Phần 9): Navigation 3 **ổn định** (1.0.0 ngày 19/11/2025); bản ổn định mới nhất **1.1.4** (01/07/2026);
thư viện riêng `androidx.navigation3` (`navigation3-runtime`, `navigation3-ui`).

*Navigate to a destination* (`/guide/navigation/use-graph/navigate`) — kế thừa từ N1: quy tắc callback
`() -> Unit` ở biên composable (Phần 2, 7 dùng lại, không dạy lại).

**Code thật đã đối chiếu trực tiếp (nguyên văn, kèm số dòng — bảng đầy đủ ở migration notes mục A):**
`aaf-materials/08-networking/projects/final/app/src/main/java/com/kodeco/recipefinder/MainActivity.kt`
(dòng 84–106) · `ui/recipes/ShowRecipeList.kt` (dòng 73, 112–117) · `ui/widgets/BookmarkCard.kt`
(dòng 68, 75, 108) · `ui/RecipeDetails.kt` (dòng 84, 92, 152–159, 167–173, 180–191) ·
`viewmodels/RecipeViewModel.kt` (dòng 117–122) · `gradle/libs.versions.toml` (dòng 17, 54). Đã kiểm
`starter` ≡ `final` (`MainActivity.kt`, `ui/RecipeDetails.kt`) bằng `diff`. Phiên bản navigation các
project: 08 = 2.7.2 · 09 = 2.7.2 · 10 = 2.7.2 · 11 = 2.7.4.

**Nội dung của chính khoá học (nguồn ngữ cảnh/payoff, không phải nguồn khái niệm):**
`docs/drafts/n1-navigation-foundation.md` (bộ khung + ranh giới N1/N2 + hai mảnh đã dán nhãn N2) ·
`web/src/components/lessons/Ch06AdvancedJetpackCompose.astro` (S2/S3/S4; `SavedStateHandle` nhận diện ở
dòng 1452) · `docs/drafts/s5-app-architecture-repository.md` (biên giới dữ liệu, nguồn đáng tin) ·
`web/src/components/lessons/Ch08Networking.astro` dòng 1673–1687/1800–1815/1830–1900 (bằng chứng
"Ch08 không dạy điều hướng; không có hàng navigation trong bảng phiên bản") ·
`web/src/components/lessons/Ch08_4CodegenVaDocLai.astro` dòng 327–337, 460–465 (trùng lặp, mồ côi).

**Ví dụ tối giản do khoá dựng:** toàn bộ code `HomeRoute`/`RecipeDetailsRoute`/`AppNavigation`/
`HomeScreen`/`RecipeDetailsScreen` trong bài và Luyện tập — không trích `aaf-materials/`, chỉ *map* sang
code thật ở Phần 14.
