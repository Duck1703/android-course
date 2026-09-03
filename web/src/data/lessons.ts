// Task 10 — registry lesson
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

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
import Ch02_3ChayAppVaCapNhat from "../components/lessons/Ch02_3ChayAppVaCapNhat.astro";
import Ch02_3Quiz from "../components/lessons/Ch02_3Quiz.astro";
import Ch03_1ActivityVaGiaoDien from "../components/lessons/Ch03_1ActivityVaGiaoDien.astro";
import Ch03_1Quiz from "../components/lessons/Ch03_1Quiz.astro";
import Ch03_2StringResourceVaDebug from "../components/lessons/Ch03_2StringResourceVaDebug.astro";
import Ch03_2Quiz from "../components/lessons/Ch03_2Quiz.astro";
import Ch03_3ManifestIntentPermission from "../components/lessons/Ch03_3ManifestIntentPermission.astro";
import Ch03_3Quiz from "../components/lessons/Ch03_3Quiz.astro";
import Ch03_4ThemeVaDoiChieu from "../components/lessons/Ch03_4ThemeVaDoiChieu.astro";
import Ch03_4Quiz from "../components/lessons/Ch03_4Quiz.astro";
import Ch04GradleBasics from "../components/lessons/Ch04GradleBasics.astro";
import Ch04Quiz from "../components/lessons/Ch04Quiz.astro";
import Ch05JetpackCompose from "../components/lessons/Ch05JetpackCompose.astro";
import Ch05Quiz from "../components/lessons/Ch05Quiz.astro";
import Ch06AdvancedJetpackCompose from "../components/lessons/Ch06AdvancedJetpackCompose.astro";
import Ch06Quiz from "../components/lessons/Ch06Quiz.astro";
import Ch07AdvancedArchitecture from "../components/lessons/Ch07AdvancedArchitecture.astro";
import Ch07Quiz from "../components/lessons/Ch07Quiz.astro";
import Ch08Networking from "../components/lessons/Ch08Networking.astro";
import Ch08Quiz from "../components/lessons/Ch08Quiz.astro";
import Ch09DataStore from "../components/lessons/Ch09DataStore.astro";
import Ch09Quiz from "../components/lessons/Ch09Quiz.astro";
import Ch10_1RoomLaGi from "../components/lessons/Ch10_1RoomLaGi.astro";
import Ch10_1Quiz from "../components/lessons/Ch10_1Quiz.astro";
import Ch10_2EntityDaoDatabase from "../components/lessons/Ch10_2EntityDaoDatabase.astro";
import Ch10_2Quiz from "../components/lessons/Ch10_2Quiz.astro";
import Ch10_3RepositoryViewModel from "../components/lessons/Ch10_3RepositoryViewModel.astro";
import Ch10_3Quiz from "../components/lessons/Ch10_3Quiz.astro";
import Ch10_4GiaoDienVaCamBay from "../components/lessons/Ch10_4GiaoDienVaCamBay.astro";
import Ch10_4Quiz from "../components/lessons/Ch10_4Quiz.astro";
import Ch11AdvancedStorage from "../components/lessons/Ch11AdvancedStorage.astro";
import Ch11Quiz from "../components/lessons/Ch11Quiz.astro";

interface LessonEntry {
  Lesson: AstroComponentFactory;
  Quiz: AstroComponentFactory;
}

export const LESSONS: Partial<Record<string, LessonEntry>> = {
  // Chương 1 đã tách thành 4 chương nhỏ — mỗi chương nhỏ có quiz riêng ngay sau nội dung.
  "ch01-1-android-va-kotlin": { Lesson: Ch01_1AndroidVaKotlin, Quiz: Ch01_1Quiz },
  "ch01-2-app-component": { Lesson: Ch01_2AppComponent, Quiz: Ch01_2Quiz },
  "ch01-3-manifest-resources": { Lesson: Ch01_3ManifestResources, Quiz: Ch01_3Quiz },
  "ch01-4-gradle-va-ban-do": { Lesson: Ch01_4GradleVaBanDo, Quiz: Ch01_4Quiz },
  // Chương 2 đã tách thành 3 chương nhỏ — mỗi chương nhỏ có quiz riêng.
  "ch02-1-cai-dat-va-tao-project": { Lesson: Ch02_1CaiDatVaTaoProject, Quiz: Ch02_1Quiz },
  "ch02-2-may-ao-may-that-doc-project": {
    Lesson: Ch02_2MayAoMayThatDocProject,
    Quiz: Ch02_2Quiz,
  },
  "ch02-3-chay-app-va-cap-nhat": { Lesson: Ch02_3ChayAppVaCapNhat, Quiz: Ch02_3Quiz },
  // Chương 3 đã tách thành 4 chương nhỏ — mỗi chương nhỏ có quiz riêng.
  "ch03-1-activity-va-giao-dien": { Lesson: Ch03_1ActivityVaGiaoDien, Quiz: Ch03_1Quiz },
  "ch03-2-string-resource-va-debug": {
    Lesson: Ch03_2StringResourceVaDebug,
    Quiz: Ch03_2Quiz,
  },
  "ch03-3-manifest-intent-permission": {
    Lesson: Ch03_3ManifestIntentPermission,
    Quiz: Ch03_3Quiz,
  },
  "ch03-4-theme-va-doi-chieu": { Lesson: Ch03_4ThemeVaDoiChieu, Quiz: Ch03_4Quiz },
  "ch04-gradle-basics-a-look-behind-the-curtain": { Lesson: Ch04GradleBasics, Quiz: Ch04Quiz },
  "ch05-jetpack-compose": { Lesson: Ch05JetpackCompose, Quiz: Ch05Quiz },
  "ch06-advanced-jetpack-compose": { Lesson: Ch06AdvancedJetpackCompose, Quiz: Ch06Quiz },
  "ch07-advanced-architecture": { Lesson: Ch07AdvancedArchitecture, Quiz: Ch07Quiz },
  "ch08-networking": { Lesson: Ch08Networking, Quiz: Ch08Quiz },
  "ch09-data-store": { Lesson: Ch09DataStore, Quiz: Ch09Quiz },
  // Chương 10 đã tách thành 4 chương nhỏ — mỗi chương nhỏ có quiz riêng ngay sau nội dung.
  "ch10-1-vi-sao-can-database": { Lesson: Ch10_1RoomLaGi, Quiz: Ch10_1Quiz },
  "ch10-2-entity-dao-database": { Lesson: Ch10_2EntityDaoDatabase, Quiz: Ch10_2Quiz },
  "ch10-3-repository-viewmodel": { Lesson: Ch10_3RepositoryViewModel, Quiz: Ch10_3Quiz },
  "ch10-4-giao-dien-va-cam-bay": { Lesson: Ch10_4GiaoDienVaCamBay, Quiz: Ch10_4Quiz },
  "ch11-advanced-storage": { Lesson: Ch11AdvancedStorage, Quiz: Ch11Quiz },
};
