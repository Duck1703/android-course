import { defineConfig } from "astro/config";

// ─── Redirect strategy (IMP-014) ────────────────────────────────────────────
// COURSE_REDIRECTS chứa các redirect old-slug → new-slug cho các URL bài học
// thật sự chết khi tách/đổi slug. Bản build là STATIC: Astro sinh trang HTML
// meta-refresh cho từng entry (không phải HTTP 301/302 từ server) — đủ để
// người học từ bookmark cũ đi tới bài mới.
//
// CONTRACT cho mỗi entry thật (đồng thời trong CÙNG batch migration):
//   1. slug cũ đã bị retired/đổi trong batch đó (route cũ không còn tồn tại);
//   2. SPLIT_MAP tương ứng được kích hoạt trong progress.ts;
//   3. SCHEMA_VERSION tăng đúng 1;
//   4. legacy credit được verify đúng như khai báo;
//   5. redirect target PHẢI khớp cột redirectTarget trong docs/TARGET_REGISTRY_v5.md.
// URL được GIỮ NGUYÊN (14/22, gồm ch02-2 sống tiếp với tư cách A6) KHÔNG có
// redirect. Danh sách 8 slug chết dự kiến nằm ở registry §6 — không khai báo
// tại đây trước khi batch tương ứng chạy.
//
// Hiện tại: 6 redirect thật (pilot R1 + Stage-1 ch03-2 + Stage-2 ch05 + Stage-3
// ch06 + Stage-5 ch08 + Stage-6 ch09). Source phải là URL công khai THẬT đã nghỉ —
// route bài học nằm dưới /chapters/<slug>/, nên source key cũng dùng cùng dạng
// "chapters/<slug>" (Astro sinh trang redirect đúng vị trí đó).
const COURSE_REDIRECTS = {
  // IMP-020 (pilot): old R1 slug chết tại batch này → redirect 1 đích sang R1.
  "chapters/ch10-1-vi-sao-can-database": "/chapters/ch10-room-la-gi-va-sqlite/",
  // IMP-032 (Stage 1c): old ch03-2 chết tại batch này → redirect 1 đích sang
  // A10 (kế nhiệm logic đầu tiên — registry §6 row 1). A11 (3.2b) đến được qua
  // sidebar/bài tiếp theo. ch02-2 KHÔNG redirect — URL sống tiếp với tư cách A6.
  "chapters/ch03-2-string-resource-va-debug": "/chapters/ch03-string-resource-va-lop-r/",
  // IMP-033 (Stage 2): old Ch05 monolith chết tại batch này → redirect 1 đích sang
  // C1 (registry §6 row 2: redirectTarget = ch05-composable-va-layout). C2–C4 đến
  // được qua sidebar/TOC; C5 là bài mới, không redirect.
  "chapters/ch05-jetpack-compose": "/chapters/ch05-composable-va-layout/",
  // IMP-035 (Stage 3): old Ch06 monolith chết tại batch này → redirect 1 đích sang
  // S2 (registry §6 row 3: redirectTarget = ch06-state-va-recomposition). S3/S4 đến
  // được qua sidebar/bài tiếp theo; S1 và S5 là bài mới, không redirect.
  "chapters/ch06-advanced-jetpack-compose": "/chapters/ch06-state-va-recomposition/",
  // Stage 5: old Ch08 monolith chết tại batch này → redirect 1 đích sang W1
  // (registry §6 row 5: redirectTarget = ch08-coroutines-va-flow). W2/W3 đến
  // được qua sidebar/bài tiếp theo. KHÔNG có bài NEW trong batch W.
  "chapters/ch08-networking": "/chapters/ch08-coroutines-va-flow/",
  // Stage 6: old Ch09 monolith chết tại batch này → redirect 1 đích sang D1
  // (registry §6 row 6: redirectTarget = ch09-data-store-va-sharedpreferences).
  // D2 đến được qua sidebar/bài tiếp theo. KHÔNG có bài NEW trong batch D.
  "chapters/ch09-data-store": "/chapters/ch09-data-store-va-sharedpreferences/",
};

export default defineConfig({
  redirects: COURSE_REDIRECTS,
});
