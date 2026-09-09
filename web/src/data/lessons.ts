// Task 10 — registry lesson
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import KotlinVariablesNullCollectionsLambda from "../components/lessons/KotlinVariablesNullCollectionsLambda.astro";
import KotlinVariablesNullCollectionsLambdaQuiz from "../components/lessons/KotlinVariablesNullCollectionsLambdaQuiz.astro";
import KotlinDataClassDelegationSealed from "../components/lessons/KotlinDataClassDelegationSealed.astro";
import KotlinDataClassDelegationSealedQuiz from "../components/lessons/KotlinDataClassDelegationSealedQuiz.astro";
import Ch01_1AndroidVaKotlin from "../components/lessons/Ch01_1AndroidVaKotlin.astro";
import Ch01_1Quiz from "../components/lessons/Ch01_1Quiz.astro";
import Ch01_2AppComponent from "../components/lessons/Ch01_2AppComponent.astro";
import Ch01_2Quiz from "../components/lessons/Ch01_2Quiz.astro";
import Ch01_3ManifestResources from "../components/lessons/Ch01_3ManifestResources.astro";
import Ch01_3Quiz from "../components/lessons/Ch01_3Quiz.astro";
import Ch01_4GradleVaBanDo from "../components/lessons/Ch01_4GradleVaBanDo.astro";
import Ch01_4Quiz from "../components/lessons/Ch01_4Quiz.astro";
import Ch02_1CaiDatVaTaoProject from "../components/lessons/Ch02_1CaiDatVaTaoProject.astro";
import Ch02_1Quiz from "../components/lessons/Ch02_1Quiz.astro";
import Ch02_2MayAoMayThatDocProject from "../components/lessons/Ch02_2MayAoMayThatDocProject.astro";
import Ch02_2Quiz from "../components/lessons/Ch02_2Quiz.astro";
import Ch02DocProjectMau from "../components/lessons/Ch02DocProjectMau.astro";
import Ch02DocProjectMauQuiz from "../components/lessons/Ch02DocProjectMauQuiz.astro";
import Ch02_3ChayAppVaCapNhat from "../components/lessons/Ch02_3ChayAppVaCapNhat.astro";
import Ch02_3Quiz from "../components/lessons/Ch02_3Quiz.astro";
import Ch03_1ActivityVaGiaoDien from "../components/lessons/Ch03_1ActivityVaGiaoDien.astro";
import Ch03_1Quiz from "../components/lessons/Ch03_1Quiz.astro";
import Ch03StringResourceVaLopR from "../components/lessons/Ch03StringResourceVaLopR.astro";
import Ch03StringResourceVaLopRQuiz from "../components/lessons/Ch03StringResourceVaLopRQuiz.astro";
import Ch03DocLoiBienDichVaDebug from "../components/lessons/Ch03DocLoiBienDichVaDebug.astro";
import Ch03DocLoiBienDichVaDebugQuiz from "../components/lessons/Ch03DocLoiBienDichVaDebugQuiz.astro";
import Ch03_3ManifestIntentPermission from "../components/lessons/Ch03_3ManifestIntentPermission.astro";
import Ch03_3Quiz from "../components/lessons/Ch03_3Quiz.astro";
import Ch03_4ThemeVaDoiChieu from "../components/lessons/Ch03_4ThemeVaDoiChieu.astro";
import Ch03_4Quiz from "../components/lessons/Ch03_4Quiz.astro";
import Ch04GradleBasics from "../components/lessons/Ch04GradleBasics.astro";
import Ch04Quiz from "../components/lessons/Ch04Quiz.astro";
import Ch05ComposableVaLayout from "../components/lessons/Ch05ComposableVaLayout.astro";
import Ch05ComposableVaLayoutQuiz from "../components/lessons/Ch05ComposableVaLayoutQuiz.astro";
import Ch05ModifierVaDanhSach from "../components/lessons/Ch05ModifierVaDanhSach.astro";
import Ch05ModifierVaDanhSachQuiz from "../components/lessons/Ch05ModifierVaDanhSachQuiz.astro";
import Ch05Material3VaTheming from "../components/lessons/Ch05Material3VaTheming.astro";
import Ch05Material3VaThemingQuiz from "../components/lessons/Ch05Material3VaThemingQuiz.astro";
import Ch05PreviewVaVongDoi from "../components/lessons/Ch05PreviewVaVongDoi.astro";
import Ch05PreviewVaVongDoiQuiz from "../components/lessons/Ch05PreviewVaVongDoiQuiz.astro";
import Ch05TiepCanMoiNguoiDung from "../components/lessons/Ch05TiepCanMoiNguoiDung.astro";
import Ch05TiepCanMoiNguoiDungQuiz from "../components/lessons/Ch05TiepCanMoiNguoiDungQuiz.astro";
import Ch06StateVaRecomposition from "../components/lessons/Ch06StateVaRecomposition.astro";
import Ch06StateVaRecompositionQuiz from "../components/lessons/Ch06StateVaRecompositionQuiz.astro";
import Ch06StateHoistingVaUdf from "../components/lessons/Ch06StateHoistingVaUdf.astro";
import Ch06StateHoistingVaUdfQuiz from "../components/lessons/Ch06StateHoistingVaUdfQuiz.astro";
import Ch06ViewModelVaUiState from "../components/lessons/Ch06ViewModelVaUiState.astro";
import Ch06ViewModelVaUiStateQuiz from "../components/lessons/Ch06ViewModelVaUiStateQuiz.astro";
import Coroutines20PhutKhongSo from "../components/lessons/Coroutines20PhutKhongSo.astro";
import Coroutines20PhutKhongSoQuiz from "../components/lessons/Coroutines20PhutKhongSoQuiz.astro";
import KienTrucUiDataRepository from "../components/lessons/KienTrucUiDataRepository.astro";
import KienTrucUiDataRepositoryQuiz from "../components/lessons/KienTrucUiDataRepositoryQuiz.astro";
import NavigationDestinationNavHost from "../components/lessons/NavigationDestinationNavHost.astro";
import NavigationDestinationNavHostQuiz from "../components/lessons/NavigationDestinationNavHostQuiz.astro";
import NavigationBackStackTypeSafe from "../components/lessons/NavigationBackStackTypeSafe.astro";
import NavigationBackStackTypeSafeQuiz from "../components/lessons/NavigationBackStackTypeSafeQuiz.astro";
import DittoOfflineFirstCaseStudy from "../components/lessons/DittoOfflineFirstCaseStudy.astro";
import DittoOfflineFirstCaseStudyQuiz from "../components/lessons/DittoOfflineFirstCaseStudyQuiz.astro";
// Workstream F (IMP-051…055): O2–O6 — bài OPTIONAL hoàn toàn mới (no-fabricate, không
// legacy credit). Mỗi bài có quiz riêng theo chuẩn 8–12 câu.
import TestingViewModelVaComposeUi from "../components/lessons/TestingViewModelVaComposeUi.astro";
import TestingViewModelVaComposeUiQuiz from "../components/lessons/TestingViewModelVaComposeUiQuiz.astro";
import AdaptiveUiTabletFoldable from "../components/lessons/AdaptiveUiTabletFoldable.astro";
import AdaptiveUiTabletFoldableQuiz from "../components/lessons/AdaptiveUiTabletFoldableQuiz.astro";
import WorkManagerCongViecNen from "../components/lessons/WorkManagerCongViecNen.astro";
import WorkManagerCongViecNenQuiz from "../components/lessons/WorkManagerCongViecNenQuiz.astro";
import RoomMigrationDauTien from "../components/lessons/RoomMigrationDauTien.astro";
import RoomMigrationDauTienQuiz from "../components/lessons/RoomMigrationDauTienQuiz.astro";
import CapstoneAppGhiChu from "../components/lessons/CapstoneAppGhiChu.astro";
import CapstoneAppGhiChuQuiz from "../components/lessons/CapstoneAppGhiChuQuiz.astro";
// Workstream F (IMP-056…058): AP1–AP3 — PHỤ LỤC tham khảo, KHÔNG quiz (registry cột
// quiz = "—"). Renderer [slug].astro chấp nhận entry không có Quiz → không fake quiz.
import GradleNangCaoSigningKeystore from "../components/lessons/GradleNangCaoSigningKeystore.astro";
import DittoSdkApi from "../components/lessons/DittoSdkApi.astro";
import BangTraCuuNhanh from "../components/lessons/BangTraCuuNhanh.astro";
import Ch08CoroutinesVaFlow from "../components/lessons/Ch08CoroutinesVaFlow.astro";
import Ch08CoroutinesVaFlowQuiz from "../components/lessons/Ch08CoroutinesVaFlowQuiz.astro";
import Ch08RetrofitMoshiJson from "../components/lessons/Ch08RetrofitMoshiJson.astro";
import Ch08RetrofitMoshiJsonQuiz from "../components/lessons/Ch08RetrofitMoshiJsonQuiz.astro";
import Ch08TrangThaiMangApiKey from "../components/lessons/Ch08TrangThaiMangApiKey.astro";
import Ch08TrangThaiMangApiKeyQuiz from "../components/lessons/Ch08TrangThaiMangApiKeyQuiz.astro";
import Ch09DataStoreVaSharedPreferences from "../components/lessons/Ch09DataStoreVaSharedPreferences.astro";
import Ch09DataStoreVaSharedPreferencesQuiz from "../components/lessons/Ch09DataStoreVaSharedPreferencesQuiz.astro";
import Ch09PrefsCompositionLocalVaWiring from "../components/lessons/Ch09PrefsCompositionLocalVaWiring.astro";
import Ch09PrefsCompositionLocalVaWiringQuiz from "../components/lessons/Ch09PrefsCompositionLocalVaWiringQuiz.astro";
import Ch10_1RoomLaGi from "../components/lessons/Ch10_1RoomLaGi.astro";
import Ch10_1Quiz from "../components/lessons/Ch10_1Quiz.astro";
import Ch10_2EntityDaoDatabase from "../components/lessons/Ch10_2EntityDaoDatabase.astro";
import Ch10_2Quiz from "../components/lessons/Ch10_2Quiz.astro";
import Ch10_3RepositoryViewModel from "../components/lessons/Ch10_3RepositoryViewModel.astro";
import Ch10_3Quiz from "../components/lessons/Ch10_3Quiz.astro";
import Ch10_4GiaoDienVaCamBay from "../components/lessons/Ch10_4GiaoDienVaCamBay.astro";
import Ch10_4Quiz from "../components/lessons/Ch10_4Quiz.astro";
// Stage 7: Ch11 monolith tách thành X1–X2 theo mốc X1/X2 START/END — hai bài realworld.
import Ch11FilesSafVaBackup from "../components/lessons/Ch11FilesSafVaBackup.astro";
import Ch11FilesSafVaBackupQuiz from "../components/lessons/Ch11FilesSafVaBackupQuiz.astro";
import Ch11KeystoreSqlcipherVaMaHoa from "../components/lessons/Ch11KeystoreSqlcipherVaMaHoa.astro";
import Ch11KeystoreSqlcipherVaMaHoaQuiz from "../components/lessons/Ch11KeystoreSqlcipherVaMaHoaQuiz.astro";

interface LessonEntry {
  Lesson: AstroComponentFactory;
  // AP1–AP3 là reference zero-quiz — Quiz tuỳ chọn (registry §3 cột quiz = "—").
  // [slug].astro render Lesson-only; stats quizQuestions = 0 là hành vi hợp lệ.
  Quiz?: AstroComponentFactory;
}

export const LESSONS: Partial<Record<string, LessonEntry>> = {
  // Nền tảng (F1–F2) — bắt buộc trước giai đoạn 1. Bài hoàn toàn mới: KHÔNG có
  // entry SPLIT_MAP nào trỏ tới hai slug này (chính sách no-fabricate, progress.ts §D).
  "kotlin-variables-null-collections-lambda": {
    Lesson: KotlinVariablesNullCollectionsLambda,
    Quiz: KotlinVariablesNullCollectionsLambdaQuiz,
  },
  "kotlin-data-class-delegation-sealed": {
    Lesson: KotlinDataClassDelegationSealed,
    Quiz: KotlinDataClassDelegationSealedQuiz,
  },
  // Chương 1 đã tách thành 4 chương nhỏ — mỗi chương nhỏ có quiz riêng ngay sau nội dung.
  "ch01-1-android-va-kotlin": { Lesson: Ch01_1AndroidVaKotlin, Quiz: Ch01_1Quiz },
  "ch01-2-app-component": { Lesson: Ch01_2AppComponent, Quiz: Ch01_2Quiz },
  "ch01-3-manifest-resources": { Lesson: Ch01_3ManifestResources, Quiz: Ch01_3Quiz },
  "ch01-4-gradle-va-ban-do": { Lesson: Ch01_4GradleVaBanDo, Quiz: Ch01_4Quiz },
  // Chương 2 đã tách thành 4 chương nhỏ (2.1 · 2.2a máy ảo/máy thật · 2.2b giải mã
  // project mẫu · 2.3) — mỗi chương nhỏ có quiz riêng. 2.2a giữ nguyên URL cũ
  // (sống tiếp với tư cách A6); 2.2b là URL mới (A7).
  "ch02-1-cai-dat-va-tao-project": { Lesson: Ch02_1CaiDatVaTaoProject, Quiz: Ch02_1Quiz },
  "ch02-2-may-ao-may-that-doc-project": {
    Lesson: Ch02_2MayAoMayThatDocProject,
    Quiz: Ch02_2Quiz,
  },
  "ch02-doc-project-mau": { Lesson: Ch02DocProjectMau, Quiz: Ch02DocProjectMauQuiz },
  "ch02-3-chay-app-va-cap-nhat": { Lesson: Ch02_3ChayAppVaCapNhat, Quiz: Ch02_3Quiz },
  // Chương 3 đã tách thành 5 chương nhỏ (3.1 · 3.2a string resource/lớp R · 3.2b đọc
  // lỗi & debug · 3.3 · 3.4) — mỗi chương nhỏ có quiz riêng. Old ch03-2 chết trong
  // batch này → redirect 1 đích sang 3.2a (astro.config.mjs) + SPLIT_MAP (progress.ts).
  "ch03-1-activity-va-giao-dien": { Lesson: Ch03_1ActivityVaGiaoDien, Quiz: Ch03_1Quiz },
  "ch03-string-resource-va-lop-r": {
    Lesson: Ch03StringResourceVaLopR,
    Quiz: Ch03StringResourceVaLopRQuiz,
  },
  "ch03-doc-loi-bien-dich-va-debug": {
    Lesson: Ch03DocLoiBienDichVaDebug,
    Quiz: Ch03DocLoiBienDichVaDebugQuiz,
  },
  "ch03-3-manifest-intent-permission": {
    Lesson: Ch03_3ManifestIntentPermission,
    Quiz: Ch03_3Quiz,
  },
  "ch03-4-theme-va-doi-chieu": { Lesson: Ch03_4ThemeVaDoiChieu, Quiz: Ch03_4Quiz },
  "ch04-gradle-basics-a-look-behind-the-curtain": { Lesson: Ch04GradleBasics, Quiz: Ch04Quiz },
  // Chương 5 đã tách thành 5 chương nhỏ — mỗi chương nhỏ có quiz riêng ngay sau nội dung.
  // Old ch05-jetpack-compose chết trong batch này → redirect 1 đích sang C1
  // (astro.config.mjs) + SPLIT_MAP replace (progress.ts). C5 là bài hoàn toàn mới.
  "ch05-composable-va-layout": { Lesson: Ch05ComposableVaLayout, Quiz: Ch05ComposableVaLayoutQuiz },
  "ch05-modifier-va-danh-sach": { Lesson: Ch05ModifierVaDanhSach, Quiz: Ch05ModifierVaDanhSachQuiz },
  "ch05-material-3-va-theming": { Lesson: Ch05Material3VaTheming, Quiz: Ch05Material3VaThemingQuiz },
  "ch05-preview-va-vong-doi": { Lesson: Ch05PreviewVaVongDoi, Quiz: Ch05PreviewVaVongDoiQuiz },
  "ch05-tiep-can-moi-nguoi-dung": { Lesson: Ch05TiepCanMoiNguoiDung, Quiz: Ch05TiepCanMoiNguoiDungQuiz },
  // Chương 6 đã tách thành 5 chương nhỏ của Giai đoạn 3 (batch Stage 3): S1 là bài NEW
  // (coroutine foundation — bài đầu của giai đoạn, mở dãy số), rồi S2/S3/S4 tách từ monolith
  // theo mốc S2/S3/S4 START/END, S5 là bài NEW (kiến trúc UI/data + repository). Mỗi chương
  // nhỏ có quiz riêng. Old slug ch06-advanced-jetpack-compose chết trong batch này →
  // redirect 1 đích sang S2 (astro.config.mjs) + SPLIT_MAP replace (progress.ts).
  // S1 và S5 là bài HỌC MỚI — KHÔNG nằm trong mapping nào (no-fabricate).
  "coroutines-20-phut-khong-so": { Lesson: Coroutines20PhutKhongSo, Quiz: Coroutines20PhutKhongSoQuiz },
  "ch06-state-va-recomposition": { Lesson: Ch06StateVaRecomposition, Quiz: Ch06StateVaRecompositionQuiz },
  "ch06-state-hoisting-va-udf": { Lesson: Ch06StateHoistingVaUdf, Quiz: Ch06StateHoistingVaUdfQuiz },
  "ch06-viewmodel-va-ui-state": { Lesson: Ch06ViewModelVaUiState, Quiz: Ch06ViewModelVaUiStateQuiz },
  "kien-truc-ui-data-repository": { Lesson: KienTrucUiDataRepository, Quiz: KienTrucUiDataRepositoryQuiz },
  // Giai đoạn 4 (batch Stage 4): N1/N2 là hai bài NEW — KHÔNG nằm trong mapping nào
  // (no-fabricate, như F1/F2/S1/S5). Không redirect, không SPLIT_MAP, không legacy credit.
  "navigation-destination-nav-host": {
    Lesson: NavigationDestinationNavHost,
    Quiz: NavigationDestinationNavHostQuiz,
  },
  "navigation-back-stack-type-safe": {
    Lesson: NavigationBackStackTypeSafe,
    Quiz: NavigationBackStackTypeSafeQuiz,
  },
  // Workstream F (IMP-050): old Ch07 monolith retired — O1 là kế nhiệm REDUCE trực tiếp
  // (case study Ditto & offline-first ở mức concepts). Old slug "ch07-advanced-architecture"
  // chết → redirect 1 đích sang O1 (astro.config.mjs) + SPLIT_MAP replace (progress.ts).
  // AP2 (Ditto SDK API depth) là reference, không nằm trong LESSONS-quiz pairing.
  "ditto-offline-first-case-study": {
    Lesson: DittoOfflineFirstCaseStudy,
    Quiz: DittoOfflineFirstCaseStudyQuiz,
  },
  "testing-viewmodel-va-compose-ui": {
    Lesson: TestingViewModelVaComposeUi,
    Quiz: TestingViewModelVaComposeUiQuiz,
  },
  "adaptive-ui-tablet-foldable": {
    Lesson: AdaptiveUiTabletFoldable,
    Quiz: AdaptiveUiTabletFoldableQuiz,
  },
  "workmanager-cong-viec-nen": { Lesson: WorkManagerCongViecNen, Quiz: WorkManagerCongViecNenQuiz },
  "room-migration-dau-tien": { Lesson: RoomMigrationDauTien, Quiz: RoomMigrationDauTienQuiz },
  "capstone-app-ghi-chu": { Lesson: CapstoneAppGhiChu, Quiz: CapstoneAppGhiChuQuiz },
  // Phụ lục: Lesson có, Quiz CỐ Ý không có (reference zero-quiz — registry §3 cột quiz "—").
  "gradle-nang-cao-signing-keystore": { Lesson: GradleNangCaoSigningKeystore },
  "ditto-sdk-api": { Lesson: DittoSdkApi },
  "bang-tra-cuu-nhanh": { Lesson: BangTraCuuNhanh },
  // Giai đoạn 5 (batch Stage 5): Ch08 monolith tách thành W1–W3 theo mốc W1/W2/W3 START/END.
  // Old slug ch08-networking chết trong batch này → redirect 1 đích sang W1 (astro.config.mjs)
  // + SPLIT_MAP replace (progress.ts). Credit ch08 cũ chia cho cả ba bài kế nhiệm trực tiếp
  // (registry §7 entry 6). KHÔNG có bài NEW trong batch này.
  "ch08-coroutines-va-flow": { Lesson: Ch08CoroutinesVaFlow, Quiz: Ch08CoroutinesVaFlowQuiz },
  "ch08-retrofit-moshi-json": { Lesson: Ch08RetrofitMoshiJson, Quiz: Ch08RetrofitMoshiJsonQuiz },
  "ch08-trang-thai-mang-api-key": {
    Lesson: Ch08TrangThaiMangApiKey,
    Quiz: Ch08TrangThaiMangApiKeyQuiz,
  },
  // Giai đoạn 6 (batch Stage 6): Ch09 monolith tách thành D1–D2 theo mốc D1/D2 START/END
  // (mục 1–10 · 11–21). Old slug ch09-data-store chết trong batch này → redirect 1 đích sang
  // D1 (astro.config.mjs) + SPLIT_MAP replace (progress.ts). Credit ch09 cũ chia cho cả hai
  // bài kế nhiệm trực tiếp (registry §7 entry 7). KHÔNG có bài NEW trong batch này.
  "ch09-data-store-va-sharedpreferences": {
    Lesson: Ch09DataStoreVaSharedPreferences,
    Quiz: Ch09DataStoreVaSharedPreferencesQuiz,
  },
  "ch09-prefs-composition-local-va-wiring": {
    Lesson: Ch09PrefsCompositionLocalVaWiring,
    Quiz: Ch09PrefsCompositionLocalVaWiringQuiz,
  },
  // Chương 10 đã tách thành 4 chương nhỏ — mỗi chương nhỏ có quiz riêng ngay sau nội dung.
  "ch10-room-la-gi-va-sqlite": { Lesson: Ch10_1RoomLaGi, Quiz: Ch10_1Quiz },
  "ch10-2-entity-dao-database": { Lesson: Ch10_2EntityDaoDatabase, Quiz: Ch10_2Quiz },
  "ch10-3-repository-viewmodel": { Lesson: Ch10_3RepositoryViewModel, Quiz: Ch10_3Quiz },
  "ch10-4-giao-dien-va-cam-bay": { Lesson: Ch10_4GiaoDienVaCamBay, Quiz: Ch10_4Quiz },
  // Giai đoạn 7 (batch Stage 7): Ch11 monolith tách thành X1–X2 theo mốc X1/X2 START/END
  // (mục 1–8.5 · 9–21). Old slug ch11-advanced-storage chết trong batch này → redirect 1 đích
  // sang X1 (astro.config.mjs) + SPLIT_MAP replace (progress.ts). Credit ch11 cũ chia cho cả
  // hai bài kế nhiệm trực tiếp (registry §7 entry 8). KHÔNG có bài NEW trong batch này.
  "ch11-files-saf-va-backup": {
    Lesson: Ch11FilesSafVaBackup,
    Quiz: Ch11FilesSafVaBackupQuiz,
  },
  "ch11-keystore-sqlcipher-va-ma-hoa": {
    Lesson: Ch11KeystoreSqlcipherVaMaHoa,
    Quiz: Ch11KeystoreSqlcipherVaMaHoaQuiz,
  },
};
