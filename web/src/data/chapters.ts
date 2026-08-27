// Danh sach 11 chapter cua sach, dung chung cho sidebar + trang chu + trang chapter.
// Noi dung tom tat lay tu docs/LEARNING_MAP.md (khong copy nguyen van sach).
export interface ChapterInfo {
  number: number;
  slug: string; // khop voi ten file trong content/book/ (khong co phan mo rong .md)
  title: string; // giu nguyen tieng Anh, dung tu chinh sach
  summaryVi: string; // tom tat 1 dong bang tieng Viet
  aafFolder: string; // thu muc tuong ung trong aaf-materials/
  hasProject: boolean; // chapter 1 khong co project Android that
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
        slug: "ch01-welcome-to-android-kotlin",
        title: "Welcome to Android & Kotlin",
        summaryVi: "Tổng quan Android, Kotlin, các thành phần app (Activity, Service...).",
        aafFolder: "01-welcome-to-android-and-kotlin",
        hasProject: false,
      },
      {
        number: 2,
        slug: "ch02-getting-started-with-android-studio",
        title: "Getting Started With Android Studio",
        summaryVi: "Cài đặt Android Studio, tạo project đầu tiên, chạy trên máy ảo.",
        aafFolder: "02-getting-started-with-android-studio",
        hasProject: true,
      },
      {
        number: 3,
        slug: "ch03-android-fundamentals",
        title: "Android Fundamentals",
        summaryVi: "Activity, vòng đời onCreate(), Intent, resource, debug cơ bản.",
        aafFolder: "03-android-fundamentals",
        hasProject: true,
      },
      {
        number: 4,
        slug: "ch04-gradle-basics-a-look-behind-the-curtain",
        title: "Gradle Basics: A Look Behind the Curtain",
        summaryVi: "Hệ thống build Gradle, build type, Version Catalog, ký app.",
        aafFolder: "04-gradle-basics-a-look-behind-the-curtain",
        hasProject: true,
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
      },
      {
        number: 6,
        slug: "ch06-advanced-jetpack-compose",
        title: "Advanced Jetpack Compose",
        summaryVi: "State, ViewModel, luồng dữ liệu một chiều (MVI).",
        aafFolder: "06-advanced-jetpack-compose",
        hasProject: true,
      },
      {
        number: 7,
        slug: "ch07-advanced-architecture",
        title: "Advanced Architecture",
        summaryVi: "Repository pattern, đồng bộ dữ liệu P2P bằng Ditto SDK.",
        aafFolder: "07-advanced-architecture",
        hasProject: true,
      },
      {
        number: 8,
        slug: "ch08-networking",
        title: "Networking",
        summaryVi: "Coroutine, Flow, gọi API bằng Retrofit, parse JSON bằng Moshi.",
        aafFolder: "08-networking",
        hasProject: true,
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
      },
      {
        number: 10,
        slug: "ch10-room-database",
        title: "Room Database",
        summaryVi: "Lưu dữ liệu có cấu trúc bằng Room (Entity, Dao, Database).",
        aafFolder: "10-room-db",
        hasProject: true,
      },
      {
        number: 11,
        slug: "ch11-advanced-storage",
        title: "Advanced Storage",
        summaryVi: "Mã hoá dữ liệu bằng SQLCipher và Encrypted Preferences.",
        aafFolder: "11-advanced-storage",
        hasProject: true,
      },
    ],
  },
];

export const ALL_CHAPTERS: ChapterInfo[] = SECTIONS.flatMap((s) => s.chapters);
