// Danh sach chuong cua khoa hoc, dung chung cho sidebar + trang chu + trang chapter.
// Noi dung tom tat lay tu docs/LEARNING_MAP.md (khong copy nguyen van sach).
//
// MOT CHUONG LON CO THE TACH THANH NHIEU CHUONG NHO (10.1, 10.2...). Khi do:
//   - moi chuong nho la MOT phan tu trong danh sach nay (van phang, van la 1 URL),
//   - cac chuong nho cua cung mot chuong lon dung chung `number`,
//   - `subNumber` phan biet chung, `parentTitle` la ten chuong lon de gom nhom
//     hien thi o sidebar / trang chu.
// Chuong chua tach thi khong co `subNumber` — moi thu chay y nhu truoc.
export interface ChapterInfo {
  number: number; // so chuong lon (10 cho ca 10.1 -> 10.4); 0 = bài Nền tảng (F1/F2 — không thuộc chương sách)
  subNumber?: number; // 1 | 2 | 3... khi chuong da bi tach; undefined = chuong nguyen khoi
  slug: string; // don vi routable duy nhat, khop ten file trong content/book/ khi chua tach
  title: string; // tieu de hien thi cua dung chuong (nho) nay
  parentTitle?: string; // ten chuong lon, chi co khi da tach
  label?: string; // nhan hien thi ghi de (`chapterLabel`): "2.2a"/"3.2b"/"F1" — khi tach
  //   chen bai moi GIUA cac muc da co reference web ("Chương 3.3"…) hoac khi bai
  //   khong thuoc chuong sach nao (Nền tảng). Khong co label thi suy tu number/subNumber.
  summaryVi: string; // tom tat 1 dong bang tieng Viet
  aafFolder: string; // thu muc tuong ung trong aaf-materials/ (cac chuong nho dung chung); "" khi khong co project mau
  hasProject: boolean; // chapter 1 khong co project Android that
  stageId: StageId; // giai doan dich theo spec v2 §5 (IMP-010) — phan loai theo NOI SO HUU DICH,
  //   khong theo Section Anh cu. Ch07 van la route song giua ch06/ch08 nhung stage dich
  //   la `optional` (O1/AP2) — metadata nay chuan bi cho lan migrate sau, khong doi route.
}

// ---------------------------------------------------------------------------
// Stage metadata (IMP-010) — tu vung giai doan dich cua khoa hoc, theo
// docs/COURSE_REDESIGN_SPEC_432cbf8_v2.md §5 + plan §4b.2.
// Day la du lieu CHUAN BI: chua co sidebar/homepage nao doc STAGES (IMP-011 lam),
// va chua co route moi nao duoc tao. Ba stage (foundation/navigation/appendix)
// chua co bai live — van phai dai dien duoc trong type.
//
// 10 gia tri day du, cam enum rut gon (plan §4b.2):
export type StageId =
  | "foundation" // F1–F2 — Nền tảng Kotlin (required prep, khong danh so giai doan)
  | "android" // GĐ 1 — A1–A14, Android cơ bản
  | "compose" // GĐ 2 — C1–C5, Jetpack Compose
  | "state" // GĐ 3 — S1–S5, State & kiến trúc
  | "navigation" // GĐ 4 — N1–N2, Điều hướng
  | "network" // GĐ 5 — W1–W3, Mạng
  | "data" // GĐ 6 — D1–D2 + R1–R4, Dữ liệu cục bộ
  | "realworld" // GĐ 7 — X1–X2, Real-world / nâng cao
  | "optional" // O1–O6 — track "Mở rộng"
  | "appendix"; // AP1–AP3 — tham khảo

export type StageKind = "core" | "optional" | "appendix";

export interface StageInfo {
  id: StageId;
  /** Nhan hien thi cho nguoi hoc (tieng Viet, theo spec §5/§16). */
  label: string;
  /** Thu tu hoc: 1 = Nền tảng, 2..8 = 7 giai đoạn chính, 9 = Mở rộng, 10 = Phụ lục. */
  order: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /** Phan loai track: core (bat buoc), optional ("Mở rộng"), appendix ("Phụ lục"). */
  kind: StageKind;
}

/** Dinh nghia stage duy nhat cua khoa hoc — sidebar/registry sau nay doc tu day. */
export const STAGES: readonly StageInfo[] = [
  { id: "foundation", label: "Nền tảng", order: 1, kind: "core" },
  { id: "android", label: "Giai đoạn 1 — Android cơ bản", order: 2, kind: "core" },
  { id: "compose", label: "Giai đoạn 2 — Jetpack Compose", order: 3, kind: "core" },
  { id: "state", label: "Giai đoạn 3 — State & kiến trúc", order: 4, kind: "core" },
  { id: "navigation", label: "Giai đoạn 4 — Điều hướng", order: 5, kind: "core" },
  { id: "network", label: "Giai đoạn 5 — Mạng", order: 6, kind: "core" },
  { id: "data", label: "Giai đoạn 6 — Dữ liệu cục bộ", order: 7, kind: "core" },
  { id: "realworld", label: "Giai đoạn 7 — Real-world", order: 8, kind: "core" },
  { id: "optional", label: "Mở rộng (không bắt buộc)", order: 9, kind: "optional" },
  { id: "appendix", label: "Phụ lục", order: 10, kind: "appendix" },
];

/**
 * Gom danh sach chuong flat thanh cac nhom THEO STAGE (IMP-011), giu thu tu
 * xuat hien ban dau ben trong moi stage. Chi tra ve cac stage co it nhat 1
 * chuong — stage trong (foundation/navigation/appendix hien nay) tu dong an,
 * khong can code rieng; khi bai moi voi stageId tuong ung duoc them vao
 * ALL_CHAPTERS, nhom se tu xuat hien dung vi tri.
 */
export interface StageGroup {
  stage: StageInfo;
  /** Cac chuong thuoc stage, theo dung thu tu trong SECTIONS/ALL_CHAPTERS. */
  chapters: ChapterInfo[];
}

export function groupChaptersByStage(chapters: ChapterInfo[]): StageGroup[] {
  const byId = new Map<StageId, ChapterInfo[]>();
  for (const ch of chapters) {
    const list = byId.get(ch.stageId);
    if (list) list.push(ch);
    else byId.set(ch.stageId, [ch]);
  }
  return STAGES.filter((st) => byId.has(st.id)).map((st) => ({
    stage: st,
    chapters: byId.get(st.id)!,
  }));
}

/** Khoa gom file .astro cho mot chuong: "10" (nguyen khoi) hoac "10_2" (chuong nho). */
export function chapterFileKey(ch: Pick<ChapterInfo, "number" | "subNumber">): string {
  const nn = String(ch.number).padStart(2, "0");
  return ch.subNumber ? `${nn}_${ch.subNumber}` : nn;
}

/** Nhan hien thi: "10.2" khi da tach, "9" khi con nguyen khoi; `label` ghi de
 * khi tach chen bai moi giua cac muc da co reference web ("Chương 3.3"…") hoac
 * khi bai khong thuoc chuong sach nao (Nền tảng F1/F2). */
export function chapterLabel(ch: Pick<ChapterInfo, "number" | "subNumber" | "label">): string {
  return ch.label ?? (ch.subNumber ? `${ch.number}.${ch.subNumber}` : String(ch.number));
}

/**
 * Gom danh sach chuong (phang) thanh cay 1 cap de hien thi:
 * chuong nguyen khoi ra mot dong, cac chuong nho cung `number` gom duoi mot
 * tieu de nhom (`parentTitle`). Thu tu giu nguyen thu tu trong SECTIONS.
 */
export interface ChapterNode {
  /** Ten nhom, chi co khi day la nhom chuong nho. */
  groupTitle?: string;
  /** So chuong lon, dung lam nhan cua nhom ("10"). */
  groupNumber?: number;
  /** Chuong don le, hoac cac chuong nho trong nhom. */
  items: ChapterInfo[];
}

export function groupChapters(chapters: ChapterInfo[]): ChapterNode[] {
  const out: ChapterNode[] = [];
  for (const ch of chapters) {
    if (ch.subNumber === undefined) {
      out.push({ items: [ch] });
      continue;
    }
    const last = out[out.length - 1];
    if (last?.groupNumber === ch.number) last.items.push(ch);
    else
      out.push({
        groupTitle: ch.parentTitle ?? ch.title,
        groupNumber: ch.number,
        items: [ch],
      });
  }
  return out;
}

export interface SectionInfo {
  title: string;
  chapters: ChapterInfo[];
}

export const SECTIONS: SectionInfo[] = [
  {
    // Nền tảng (F1–F2) — không thuộc chương sách nào: number = 0, subNumber tuỳ
    // ý nội bộ (chỉ để nhóm hiển thị), label = F1/F2. `aafFolder` rỗng vì hai
    // bài này dạy Kotlin thuần bằng code tự viết, không có project mẫu.
    title: "Nền tảng",
    chapters: [
      {
        number: 0,
        subNumber: 1,
        slug: "kotlin-variables-null-collections-lambda",
        label: "F1",
        title: "Kotlin đủ để học Compose — Phần 1: biến, hàm, null safety, collections, lambda",
        parentTitle: "Nền tảng Kotlin",
        summaryVi: "val/var, kiểu + suy luận, hàm, null safety ?./?:, List + map/filter, lambda + it + trailing lambda, function type.",
        aafFolder: "",
        hasProject: false,
        stageId: "foundation",
      },
      {
        number: 0,
        subNumber: 2,
        slug: "kotlin-data-class-delegation-sealed",
        label: "F2",
        title: "Kotlin đủ để học Compose — Phần 2: data class, `by`, sealed state, generics",
        parentTitle: "Nền tảng Kotlin",
        summaryVi: "Class, data class (==/copy/destructuring), đọc được List<T>, `by` uỷ quyền (tách Kotlin vs Compose), sealed state.",
        aafFolder: "",
        hasProject: false,
        stageId: "foundation",
      },
    ],
  },
  {
    title: "Section I: Introduction to Android Development",
    chapters: [
      {
        number: 1,
        subNumber: 1,
        slug: "ch01-1-android-va-kotlin",
        title: "Android là gì, chọn Kotlin, và security sandbox",
        parentTitle: "Welcome to Android & Kotlin",
        summaryVi: "Vì sao Android trông khổng lồ, chọn Kotlin thay vì Java/đa nền tảng, sandbox 2 chiều.",
        aafFolder: "01-welcome-to-android-and-kotlin",
        hasProject: false,
        stageId: "android",
      },
      {
        number: 1,
        subNumber: 2,
        slug: "ch01-2-app-component",
        title: "Bốn app component và cách chúng gọi nhau",
        parentTitle: "Welcome to Android & Kotlin",
        summaryVi: "Activity, Service, Content Provider, Broadcast Receiver; entry point, Intent, Content Resolver.",
        aafFolder: "01-welcome-to-android-and-kotlin",
        hasProject: false,
        stageId: "android",
      },
      {
        number: 1,
        subNumber: 3,
        slug: "ch01-3-manifest-resources",
        title: "App Manifest và App Resources",
        parentTitle: "Welcome to Android & Kotlin",
        summaryVi: "Manifest khai báo gì cho hệ thống, resource hoạt động thế nào, chuỗi tham chiếu 3 tầng.",
        aafFolder: "01-welcome-to-android-and-kotlin",
        hasProject: false,
        stageId: "android",
      },
      {
        number: 1,
        subNumber: 4,
        slug: "ch01-4-gradle-va-ban-do",
        title: "Gradle, bốn con số, và bản đồ khoá học",
        parentTitle: "Welcome to Android & Kotlin",
        summaryVi: "Gradle biến code thành app cài được, bốn file build, bốn con số phiên bản, bản đồ Nền tảng + 7 giai đoạn.",
        aafFolder: "01-welcome-to-android-and-kotlin",
        hasProject: false,
        stageId: "android",
      },
      {
        number: 2,
        subNumber: 1,
        slug: "ch02-1-cai-dat-va-tao-project",
        title: "Cài Android Studio và tạo project đầu tiên",
        parentTitle: "Getting Started With Android Studio",
        summaryVi: "Tải bản nào, cấu hình sau khi cài, 6 thông tin khi tạo project và hệ quả của từng cái.",
        aafFolder: "02-getting-started-with-android-studio",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 2,
        subNumber: 2,
        slug: "ch02-2-may-ao-may-that-doc-project",
        label: "2.2a",
        title: "Chạy thử app: máy ảo (AVD) & máy thật",
        parentTitle: "Getting Started With Android Studio",
        summaryVi: "Tạo AVD với wizard ba bước, và biến máy Android thật thành thiết bị lập trình qua USB Debugging.",
        aafFolder: "02-getting-started-with-android-studio",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 2,
        subNumber: 3,
        slug: "ch02-doc-project-mau",
        label: "2.2b",
        title: "Giải mã project mẫu: đọc toàn bộ project vừa sinh ra",
        parentTitle: "Getting Started With Android Studio",
        summaryVi: "Mở từng file Android Studio vừa tự sinh ra: MainActivity, Manifest, ba file theme, ba file Gradle, strings.xml.",
        aafFolder: "02-getting-started-with-android-studio",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 2,
        subNumber: 4,
        slug: "ch02-3-chay-app-va-cap-nhat",
        label: "2.3",
        title: "Chạy app, cập nhật công cụ, và những gì đã lỗi thời",
        parentTitle: "Getting Started With Android Studio",
        summaryVi: "Bấm Run, sửa chữ thấy đổi ngay với Live Edit, cập nhật IDE/SDK, và đối chiếu bản ghim 2023.",
        aafFolder: "02-getting-started-with-android-studio",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 3,
        subNumber: 1,
        slug: "ch03-1-activity-va-giao-dien",
        title: "Activity, onCreate() và giao diện đầu tiên",
        parentTitle: "Android Fundamentals",
        summaryVi: "Activity là gì, onCreate() chạy khi nào, và thay toàn bộ MainActivity.kt để dựng app chat đầu tiên.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 3,
        subNumber: 2,
        slug: "ch03-string-resource-va-lop-r",
        label: "3.2a",
        title: "String resource và lớp R",
        parentTitle: "Android Fundamentals",
        summaryVi: "Vì sao chuỗi phải vào strings.xml, qualifier đổi ngôn ngữ không sửa code, và lớp R — bảng tra sinh lúc build.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 3,
        subNumber: 3,
        slug: "ch03-doc-loi-bien-dich-va-debug",
        label: "3.2b",
        title: "Đọc lỗi biên dịch và debug",
        parentTitle: "Android Fundamentals",
        summaryVi: "Lỗi biên dịch đầu tiên — vì sao stringResource không gọi được trong remember — và breakpoint, Logcat để soi lỗi lúc chạy.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 3,
        subNumber: 4,
        slug: "ch03-3-manifest-intent-permission",
        label: "3.3",
        title: "Manifest, Intent, Permission và Service",
        parentTitle: "Android Fundamentals",
        summaryVi: "AndroidManifest.xml khai gì với hệ điều hành, intent-filter mở app, và cái bẫy permission vs uses-permission.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 3,
        subNumber: 5,
        slug: "ch03-4-theme-va-doi-chieu",
        label: "3.4",
        title: "Theme, chuỗi việc khi bấm Send, và đối chiếu code thật",
        parentTitle: "Android Fundamentals",
        summaryVi: "Hai hệ theme song song, một hàm theme không ai gọi, và tám chỗ code mẫu đáng đọc bằng đầu phê phán.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 4,
        slug: "ch04-gradle-basics-a-look-behind-the-curtain",
        title: "Gradle cho người mới: dependency, version catalog, BOM",
        summaryVi: "Ai làm gì trong project, bản đồ file build, ba con số SDK, dependencies, BOM và Version Catalog.",
        aafFolder: "04-gradle-basics-a-look-behind-the-curtain",
        hasProject: true,
        stageId: "android",
      },
    ],
  },
  {
    title: "Section II: Building a Robust Android App",
    chapters: [
      // Chương 5 đã tách thành 5 chương nhỏ (5.1–5.5) — IMP-033 (C1–C4, port monolith)
      // + IMP-044 (C5, bài accessibility hoàn toàn mới). Mỗi chương nhỏ có quiz riêng.
      // Old slug ch05-jetpack-compose chết tại batch này → redirect 1 đích sang C1
      // (astro.config.mjs) + SPLIT_MAP replace (progress.ts).
      {
        number: 5,
        subNumber: 1,
        slug: "ch05-composable-va-layout",
        title: "Composable & layout đầu tiên",
        parentTitle: "Jetpack Compose",
        summaryVi: "Composable là gì, @Composable + setContent, dựng bộ khung bằng Column/Row/Box/Surface, tách composable nhỏ, dữ liệu vào–sự kiện ra, slot API.",
        aafFolder: "05-jetpack-compose",
        hasProject: true,
        stageId: "compose",
      },
      {
        number: 5,
        subNumber: 2,
        slug: "ch05-modifier-va-danh-sach",
        title: "Modifier & danh sách",
        parentTitle: "Jetpack Compose",
        summaryVi: "Modifier là giá trị, thứ tự nối chuỗi quyết định kết quả, bộ modifier thiết yếu, weight, LazyColumn và key ổn định.",
        aafFolder: "05-jetpack-compose",
        hasProject: true,
        stageId: "compose",
      },
      {
        number: 5,
        subNumber: 3,
        slug: "ch05-material-3-va-theming",
        title: "Material 3 & theming trong Compose",
        parentTitle: "Jetpack Compose",
        summaryVi: "MaterialTheme cấp colorScheme/typography/shapes theo vai trò, đường đi theme thật của project, hai hệ theme XML vs Compose, kỹ thuật truy dấu code chết.",
        aafFolder: "05-jetpack-compose",
        hasProject: true,
        stageId: "compose",
      },
      {
        number: 5,
        subNumber: 4,
        slug: "ch05-preview-va-vong-doi",
        title: "Preview & vòng đời composable",
        parentTitle: "Jetpack Compose",
        summaryVi: "@Preview và ba việc nó không chứng minh được, dữ liệu mẫu, vào/vẽ lại/rời composition, LaunchedEffect lần chạm đầu.",
        aafFolder: "05-jetpack-compose",
        hasProject: true,
        stageId: "compose",
      },
      {
        number: 5,
        subNumber: 5,
        slug: "ch05-tiep-can-moi-nguoi-dung",
        title: "Tiếp cận mọi người dùng: a11y cơ bản",
        parentTitle: "Jetpack Compose",
        summaryVi: "Hai bản mô tả (vẽ + semantics), contentDescription chữ/null, vùng chạm 48dp, sp/dp và cỡ chữ 200%, vai trò màu và tương phản, tự kiểm bằng TalkBack.",
        aafFolder: "05-jetpack-compose",
        hasProject: true,
        stageId: "compose",
      },
      // Chương 6 đã tách thành 5 chương nhỏ (S1–S5) — batch Stage 3 (IMP-035, IMP-042, IMP-043):
      // S1 (6.1) bài NEW mở giai đoạn; S2–S4 (6.2–6.4) tách từ monolith; S5 (6.5) bài NEW.
      // Old slug ch06-advanced-jetpack-compose chết tại batch này → redirect 1 đích sang S2
      // (astro.config.mjs) + SPLIT_MAP replace (progress.ts). S1/S5 không nhận legacy credit.
      {
        number: 6,
        subNumber: 1,
        slug: "coroutines-20-phut-khong-so",
        label: "6.1",
        title: "Coroutines: 20 phút đủ để không sợ",
        parentTitle: "State & kiến trúc UI trong Compose",
        summaryVi: "Coroutine ≠ thread, suspend = được phép tạm dừng, scope = người chủ, dispatcher = chạy ở đâu, Flow/StateFlow ở mức đọc được — nền để đọc S4.",
        aafFolder: "06-advanced-jetpack-compose",
        hasProject: true,
        stageId: "state",
      },
      {
        number: 6,
        subNumber: 2,
        slug: "ch06-state-va-recomposition",
        label: "6.2",
        title: "State trong Compose: mutableStateOf, remember, recomposition",
        parentTitle: "State & kiến trúc UI trong Compose",
        summaryVi: "State là gì, vì sao biến Kotlin thường không đủ, remember giữ gì qua cái gì, recomposition chạy lại phần liên quan.",
        aafFolder: "06-advanced-jetpack-compose",
        hasProject: true,
        stageId: "state",
      },
      {
        number: 6,
        subNumber: 3,
        slug: "ch06-state-hoisting-va-udf",
        label: "6.3",
        title: "State hoisting & luồng dữ liệu một chiều",
        parentTitle: "State & kiến trúc UI trong Compose",
        summaryVi: "Stateful ↔ stateless, khuôn value + onValueChange, hoist tới tổ tiên chung thấp nhất, UDF ≠ Flow.",
        aafFolder: "06-advanced-jetpack-compose",
        hasProject: true,
        stageId: "state",
      },
      {
        number: 6,
        subNumber: 4,
        slug: "ch06-viewmodel-va-ui-state",
        label: "6.4",
        title: "ViewModel & UI state",
        parentTitle: "State & kiến trúc UI trong Compose",
        summaryVi: "Vì sao state màn hình cần chủ ngoài UI, UiState một ảnh chụp, cặp MutableStateFlow/StateFlow, collectAsStateWithLifecycle, stateIn, chuỗi cú chạm tới giao diện.",
        aafFolder: "06-advanced-jetpack-compose",
        hasProject: true,
        stageId: "state",
      },
      {
        number: 6,
        subNumber: 5,
        slug: "kien-truc-ui-data-repository",
        label: "6.5",
        title: "Kiến trúc app: tầng UI, tầng dữ liệu, và repository",
        parentTitle: "State & kiến trúc UI trong Compose",
        summaryVi: "Hai vùng trách nhiệm, repository là biên giới, chiều phụ thuộc, đường đọc/đường ghi — kiến trúc để giảm dính chặt, không phải để tăng số lớp.",
        aafFolder: "06-advanced-jetpack-compose",
        hasProject: true,
        stageId: "state",
      },
      {
        // Workstream F (IMP-050): old Ch07 monolith retired → O1 (kế nhiệm REDUCE trực tiếp).
        // Old slug ch07-advanced-architecture chết → redirect 1 đích sang O1 (astro.config.mjs)
        // + SPLIT_MAP replace (progress.ts). stageId = optional theo registry §3/§11.
        number: 0,
        label: "O1",
        slug: "ditto-offline-first-case-study",
        title: "Case study: Ditto & offline-first (concepts)",
        parentTitle: "Mở rộng",
        summaryVi: "Offline-first mental model: nguồn cục bộ, nguồn từ xa, khâu đồng bộ; subscription vs live query; đọc project cũ có phê phán; khi nào kiến trúc này cần, khi nào là phức tạp thừa.",
        aafFolder: "07-advanced-architecture",
        hasProject: true,
        stageId: "optional",
      },
      {
        // Workstream F (IMP-051…055): O2–O6 — bài NEW track Mở rộng (number=0, label O*).
        // KHÔNG nằm trong SPLIT_MAP/redirect nào — no-fabricate (progress.ts §D).
        number: 0,
        label: "O2",
        slug: "testing-viewmodel-va-compose-ui",
        title: "Testing: test ViewModel & một test UI",
        parentTitle: "Mở rộng",
        summaryVi: "Hai tầng test, fake repository, Arrange-Act-Assert, MainDispatcherRule/runTest, một test UI Compose, và những thứ không nên test.",
        aafFolder: "",
        hasProject: false,
        stageId: "optional",
      },
      {
        number: 0,
        label: "O3",
        slug: "adaptive-ui-tablet-foldable",
        title: "Adaptive UI: tablet & foldable",
        parentTitle: "Mở rộng",
        summaryVi: "Window size class (tính một lần ở Activity), list/detail, state ownership, weight vs dp, giới hạn nội dung, posture máy gập, a11y.",
        aafFolder: "",
        hasProject: false,
        stageId: "optional",
      },
      {
        number: 0,
        label: "O4",
        slug: "workmanager-cong-viec-nen",
        title: "WorkManager: công việc nền hiện đại",
        parentTitle: "Mở rộng",
        summaryVi: "Deferred guaranteed work, CoroutineWorker với success/retry/failure, constraints, unique work, backoff, định kỳ 15 phút, bốn điều WorkManager không làm.",
        aafFolder: "",
        hasProject: false,
        stageId: "optional",
      },
      {
        number: 0,
        label: "O5",
        slug: "room-migration-dau-tien",
        title: "Room migration đầu tiên",
        parentTitle: "Mở rộng",
        summaryVi: "Version + Migration(1,2) + ALTER TABLE, fallbackToDestructive là nút xoá dữ liệu, MigrationTestHelper, auto-migration, Room 2.x vs 3 ở mức nhận diện.",
        aafFolder: "",
        hasProject: false,
        stageId: "optional",
      },
      {
        number: 0,
        label: "O6",
        slug: "capstone-app-ghi-chu",
        title: "Capstone: app ghi chú của bạn",
        parentTitle: "Mở rộng",
        summaryVi: "Dựng 10 bước một app ghi chú offline hoàn chỉnh bằng mọi mảnh đã học; phạm vi chốt trước; checkpoint theo bước; fake-repository tuỳ chọn.",
        aafFolder: "",
        hasProject: false,
        stageId: "optional",
      },
      // Giai đoạn 5 (Mạng) — batch Stage 5: Ch08 monolith tách thành 3 bài (W1–W3) theo
      // mốc W1/W2/W3 START/END của monolith (mục 1–7 · 8–15 · 16–23). Mỗi bài có quiz riêng.
      // Old slug ch08-networking chết trong batch này → redirect 1 đích sang W1
      // (astro.config.mjs) + SPLIT_MAP replace (progress.ts). W1–W3 là tách nội dung
      // kế nhiệm trực tiếp — credit chia theo đúng mapping (registry §7 entry 6).
      {
        number: 8,
        subNumber: 1,
        slug: "ch08-coroutines-va-flow",
        title: "Coroutines & Flow trong code thật",
        parentTitle: "Networking",
        summaryVi: "Bản đồ dispatcher (IO 64/Default theo core), đọc source viewModelScope, tuần-tự-theo-mặc-định, Retrofit suspend main-safe, Flow ↔ StateFlow khi đọc code, hai collect hai launch, và hai điểm phê phán trong code mẫu.",
        aafFolder: "08-networking",
        hasProject: true,
        stageId: "network",
      },
      {
        number: 8,
        subNumber: 2,
        slug: "ch08-retrofit-moshi-json",
        title: "Retrofit, JSON/Moshi-KSP & Coil",
        parentTitle: "Networking",
        summaryVi: "Mô hình HTTP tối thiểu, interface Retrofit là bản mô tả API (@GET/@Query/@Path), Moshi đổi JSON ↔ data class, RetrofitInstance object+lazy, codegen KSP thay reflection, toàn mạch mười bước, và lần đầu gặp Coil.",
        aafFolder: "08-networking",
        hasProject: true,
        stageId: "network",
      },
      {
        number: 8,
        subNumber: 3,
        slug: "ch08-trang-thai-mang-api-key",
        title: "Trạng thái mạng, lỗi, API key & phân trang",
        parentTitle: "Networking",
        summaryVi: "Bốn tình huống loading/content/empty/error (rỗng ≠ lỗi), UiState trung thực có ô chứa lỗi, log ≠ thông báo, try/catch không nuốt huỷ, keys.properties→BuildConfig và ranh giới bảo mật của nó, phân trang offset.",
        aafFolder: "08-networking",
        hasProject: true,
        stageId: "network",
      },
      // Giai đoạn 4 (Điều hướng) — batch Stage 4: N1/N2 là hai bài NEW, không thuộc
      // chương sách nào (number = 0, label = N1/N2, như F1/F2). aafFolder rỗng vì
      // code điều hướng của project mẫu chỉ được ĐỌC trong bài (trích nguyên văn),
      // còn toàn bộ code ví dụ do khoá dựng. Old slug không tồn tại → không redirect,
      // không SPLIT_MAP, không legacy credit (no-fabricate).
      {
        number: 0,
        subNumber: 1,
        slug: "navigation-destination-nav-host",
        label: "N1",
        title: "Điều hướng: nhiều màn hình trong một app",
        parentTitle: "Điều hướng",
        summaryVi: "Vì sao cần thư viện điều hướng, destination · route · đồ thị, NavController vs NavHost, startDestination, composable(...), navigate(...) trong callback, và bức tranh đầu tiên về back stack.",
        aafFolder: "",
        hasProject: false,
        stageId: "navigation",
      },
      {
        number: 0,
        subNumber: 2,
        slug: "navigation-back-stack-type-safe",
        label: "N2",
        title: "Back stack & truyền dữ liệu type-safe",
        parentTitle: "Điều hướng",
        summaryVi: "Back/popBackStack ≠ navigate, nút Back của app qua callback, route type-safe (@Serializable + composable<T> + toRoute<T>), truyền ID đừng truyền object, và đọc code route-dạng-chuỗi 2023 của project mẫu.",
        aafFolder: "",
        hasProject: false,
        stageId: "navigation",
      },
    ],
  },
  {
    title: "Section III: Data Management",
    chapters: [
      // Giai đoạn 6 (Dữ liệu cục bộ) — batch Stage 6: Ch09 monolith tách thành 2 bài (D1–D2) theo
      // mốc D1/D2 START/END của monolith (mục 1–10 · 11–21). Mỗi bài có quiz riêng.
      // Old slug ch09-data-store chết trong batch này → redirect 1 đích sang D1
      // (astro.config.mjs) + SPLIT_MAP replace (progress.ts). D1/D2 là tách nội dung
      // kế nhiệm trực tiếp — credit chia đủ hai theo mapping (registry §7 entry 7).
      {
        number: 9,
        subNumber: 1,
        slug: "ch09-data-store-va-sharedpreferences",
        title: "DataStore & SharedPreferences: lưu key/value đúng cách",
        parentTitle: "Data Store",
        summaryVi: "Chọn công cụ theo hình dạng dữ liệu, SharedPreferences ở mức đọc code cũ (không @Deprecated), vì sao DataStore (suspend/Flow/edit nguyên khối), by preferencesDataStore và một-instance, key có kiểu, data.first(), edit {}, null = key chưa có, và class Prefs.",
        aafFolder: "09-data-store",
        hasProject: true,
        stageId: "data",
      },
      {
        number: 9,
        subNumber: 2,
        slug: "ch09-prefs-composition-local-va-wiring",
        title: "Prefs trong app: CompositionLocal & ViewModel wiring",
        parentTitle: "Data Store",
        summaryVi: "Bài toán nối dây dependency, Application làm chủ sở hữu, DI tay ở mức nguyên lý (Hilt chỉ seam note), cơ chế CompositionLocal (declare/provides/current) và ranh giới của nó, viewModelFactory + closure, hai trace từ khoá & tab, bug dấu phẩy (escaping), bảng trách nhiệm.",
        aafFolder: "09-data-store",
        hasProject: true,
        stageId: "data",
      },
      {
        number: 10,
        subNumber: 1,
        slug: "ch10-room-la-gi-va-sqlite",
        title: "Vì sao cần database & đưa Room vào project",
        parentTitle: "Room Database",
        summaryVi: "Vì sao dữ liệu có cấu trúc cần database, SQLite là gì, ranh giới DataStore vs database, và Room — lớp bọc compile-time-checked trên SQLite.",
        aafFolder: "10-room-db",
        hasProject: true,
        stageId: "data",
      },
      {
        number: 10,
        subNumber: 2,
        slug: "ch10-2-entity-dao-database",
        title: "Ba class Room: Entity, DAO, Database",
        parentTitle: "Room Database",
        summaryVi: "@Entity, @Dao, @Database, truy vấn SQL được kiểm ngay lúc biên dịch.",
        aafFolder: "10-room-db",
        hasProject: true,
        stageId: "data",
      },
      {
        number: 10,
        subNumber: 3,
        slug: "ch10-3-repository-viewmodel",
        title: "Repository, Conversions và ViewModel",
        parentTitle: "Room Database",
        summaryVi: "Nối database vào app: Repository, ba họ model, ViewModel và luồng IO.",
        aafFolder: "10-room-db",
        hasProject: true,
        stageId: "data",
      },
      {
        number: 10,
        subNumber: 4,
        slug: "ch10-4-giao-dien-va-cam-bay",
        title: "Nối Room vào giao diện & đọc lại bằng đầu phê phán",
        parentTitle: "Room Database",
        summaryVi: "Bookmark, swipe để xoá, hai nguồn dữ liệu, cạm bẫy và kiến thức lỗi thời.",
        aafFolder: "10-room-db",
        hasProject: true,
        stageId: "data",
      },
      // Giai đoạn 7 (Real-world) — batch Stage 7: Ch11 monolith tách thành 2 bài (X1–X2) theo
      // mốc X1/X2 START/END của monolith (mục 1–8.5 · 9–21). Mỗi bài có quiz riêng.
      // Old slug ch11-advanced-storage chết trong batch này → redirect 1 đích sang X1
      // (astro.config.mjs) + SPLIT_MAP replace (progress.ts). X1/X2 là tách nội dung
      // kế nhiệm trực tiếp — credit chia đủ hai theo mapping (registry §7 entry 8).
      {
        number: 11,
        subNumber: 1,
        slug: "ch11-files-saf-va-backup",
        title: "Files, SAF & Backup: chọn chỗ lưu, nhờ người dùng chỉ",
        parentTitle: "Advanced Storage",
        summaryVi: "Khung ba câu hỏi độc lập (vị trí ≠ mã hoá ≠ backup), bản đồ chỗ lưu file, filesDir/cacheDir + use/IO-thread, Device Explorer, hợp đồng cache, external storage, SAF (Uri ≠ đường dẫn, OpenDocumentTree, takePersistableUriPermission), và hai thế hệ backup rule đọc từ manifest thật.",
        aafFolder: "11-advanced-storage",
        hasProject: true,
        stageId: "realworld",
      },
      {
        number: 11,
        subNumber: 2,
        slug: "ch11-keystore-sqlcipher-va-ma-hoa",
        title: "Mã hoá: Keystore, SQLCipher & các API lịch sử",
        parentTitle: "Advanced Storage",
        summaryVi: "Bài toán \"key để đâu\", Android Keystore (non-exportable, hardware-backed không mặc định, StrongBox), SecurePrefs = đọc code lịch sử (envelope encryption, hai scheme SIV/GCM), đổi Prefs→SecurePrefs, SQLCipher seam 1 dòng + giới hạn, cái bẫy backup + key lifecycle, ghi chú phiên bản, bảng 15 chỗ lệch và nhìn lại lộ trình.",
        aafFolder: "11-advanced-storage",
        hasProject: true,
        stageId: "realworld",
      },
      {
        // Workstream F (IMP-056…058): AP1–AP3 — PHỤ LỤC tham khảo (number=0, label AP*).
        // KHÔNG quiz (lessons.ts entry không có Quiz). Không thuộc core progress.
        number: 0,
        label: "AP1",
        slug: "gradle-nang-cao-signing-keystore",
        title: "Gradle nâng cao: signing, keystore, minify",
        parentTitle: "Phụ lục",
        summaryVi: "Signing mental model, signingConfigs + keys.properties, APK vs AAB, R8/minify rules, bẫy bảo mật đã kiểm, phân biệt keystore-ký-app vs Android Keystore.",
        aafFolder: "04-gradle-basics-a-look-behind-the-curtain",
        hasProject: false,
        stageId: "appendix",
      },
      {
        number: 0,
        label: "AP2",
        slug: "ditto-sdk-api",
        title: "Ditto SDK API deep-dive",
        parentTitle: "Phụ lục",
        summaryVi: "Tham chiếu API Ditto: khởi tạo 4.x↔5.x, identity, permission helper, query builder → DQL, troubleshooting 'app không sync', drift nền tảng.",
        aafFolder: "07-advanced-architecture",
        hasProject: false,
        stageId: "appendix",
      },
      {
        number: 0,
        label: "AP3",
        slug: "bang-tra-cuu-nhanh",
        title: "Bảng tra cứu nhanh",
        parentTitle: "Phụ lục",
        summaryVi: "Bảng drift phiên bản từng chương (Ch06/07/08/09/11), lệnh thường gặp, glossary — nơi tập trung của mọi bảng lệch giáo trình ↔ hiện hành.",
        aafFolder: "",
        hasProject: false,
        stageId: "appendix",
      },
    ],
  },
];

export const ALL_CHAPTERS: ChapterInfo[] = SECTIONS.flatMap((s) => s.chapters);
