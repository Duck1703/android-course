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
  number: number; // so chuong lon (10 cho ca 10.1 -> 10.4)
  subNumber?: number; // 1 | 2 | 3... khi chuong da bi tach; undefined = chuong nguyen khoi
  slug: string; // don vi routable duy nhat, khop ten file trong content/book/ khi chua tach
  title: string; // tieu de hien thi cua dung chuong (nho) nay
  parentTitle?: string; // ten chuong lon, chi co khi da tach
  summaryVi: string; // tom tat 1 dong bang tieng Viet
  aafFolder: string; // thu muc tuong ung trong aaf-materials/ (cac chuong nho dung chung)
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

/** Khoa gom file .astro cho mot chuong: "10" (nguyen khoi) hoac "10_2" (chuong nho). */
export function chapterFileKey(ch: Pick<ChapterInfo, "number" | "subNumber">): string {
  const nn = String(ch.number).padStart(2, "0");
  return ch.subNumber ? `${nn}_${ch.subNumber}` : nn;
}

/** Nhan hien thi: "10.2" khi da tach, "9" khi con nguyen khoi. */
export function chapterLabel(ch: Pick<ChapterInfo, "number" | "subNumber">): string {
  return ch.subNumber ? `${ch.number}.${ch.subNumber}` : String(ch.number);
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
        summaryVi: "Gradle biến code thành app cài được, bốn file build, bốn con số phiên bản, lộ trình 11 chương.",
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
        title: "Máy ảo, máy thật, và đọc toàn bộ project vừa sinh ra",
        parentTitle: "Getting Started With Android Studio",
        summaryVi: "Tạo AVD, bật USB Debugging trên máy thật, rồi đọc từng file project mới sinh ra.",
        aafFolder: "02-getting-started-with-android-studio",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 2,
        subNumber: 3,
        slug: "ch02-3-chay-app-va-cap-nhat",
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
        slug: "ch03-2-string-resource-va-debug",
        title: "String resource, lớp R, lỗi biên dịch và debug",
        parentTitle: "Android Fundamentals",
        summaryVi: "Vì sao chuỗi phải vào strings.xml, lớp R sinh ra từ đâu, đọc lỗi biên dịch đầu tiên và đặt breakpoint.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 3,
        subNumber: 3,
        slug: "ch03-3-manifest-intent-permission",
        title: "Manifest, Intent, Permission và Service",
        parentTitle: "Android Fundamentals",
        summaryVi: "AndroidManifest.xml khai gì với hệ điều hành, intent-filter mở app, và cái bẫy permission vs uses-permission.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
        stageId: "android",
      },
      {
        number: 3,
        subNumber: 4,
        slug: "ch03-4-theme-va-doi-chieu",
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
        title: "Gradle Basics: A Look Behind the Curtain",
        summaryVi: "Hệ thống build Gradle, build type, Version Catalog, ký app.",
        aafFolder: "04-gradle-basics-a-look-behind-the-curtain",
        hasProject: true,
        stageId: "android",
      },
    ],
  },
  {
    title: "Section II: Building a Robust Android App",
    chapters: [
      {
        number: 5,
        slug: "ch05-jetpack-compose",
        title: "Jetpack Compose",
        summaryVi: "Composable function, Layout Group, Modifier, Preview, Theme.",
        aafFolder: "05-jetpack-compose",
        hasProject: true,
        stageId: "compose",
      },
      {
        number: 6,
        slug: "ch06-advanced-jetpack-compose",
        title: "Advanced Jetpack Compose",
        summaryVi: "State, ViewModel, luồng dữ liệu một chiều (MVI).",
        aafFolder: "06-advanced-jetpack-compose",
        hasProject: true,
        stageId: "state",
      },
      {
        number: 7,
        slug: "ch07-advanced-architecture",
        title: "Advanced Architecture",
        summaryVi: "Repository pattern, đồng bộ dữ liệu P2P bằng Ditto SDK.",
        aafFolder: "07-advanced-architecture",
        hasProject: true,
        // Stage DICH là optional (nội dung O1/AP2) dù route đang sống giữa ch06/ch08.
        stageId: "optional",
      },
      {
        number: 8,
        slug: "ch08-networking",
        title: "Networking",
        summaryVi: "Coroutine, Flow, gọi API bằng Retrofit, parse JSON bằng Moshi.",
        aafFolder: "08-networking",
        hasProject: true,
        stageId: "network",
      },
    ],
  },
  {
    title: "Section III: Data Management",
    chapters: [
      {
        number: 9,
        slug: "ch09-data-store",
        title: "Data Store",
        summaryVi: "Lưu dữ liệu đơn giản bằng SharedPreferences.",
        aafFolder: "09-data-store",
        hasProject: true,
        stageId: "data",
      },
      {
        number: 10,
        subNumber: 1,
        slug: "ch10-1-vi-sao-can-database",
        title: "Vì sao cần database & đưa Room vào project",
        parentTitle: "Room Database",
        summaryVi: "SQLite, ranh giới DataStore vs database, kiến trúc 5 lớp, thêm Room + KSP.",
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
      {
        number: 11,
        slug: "ch11-advanced-storage",
        title: "Advanced Storage",
        summaryVi: "Mã hoá dữ liệu bằng SQLCipher và Encrypted Preferences.",
        aafFolder: "11-advanced-storage",
        hasProject: true,
        stageId: "realworld",
      },
    ],
  },
];

export const ALL_CHAPTERS: ChapterInfo[] = SECTIONS.flatMap((s) => s.chapters);
