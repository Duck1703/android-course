// ==========================================================================
// check_counts.mjs — IMP-082 truth-check: so khớp số liệu HIỂN THỊ trên các
// trang built (dist/) với nguồn chuẩn (registry data/chapters.ts + lessonStats).
//
// Cách chạy:  node scripts-maintenance/check_counts.mjs    (từ thư mục web/, sau npm run build)
//             (bản gốc gitignored ở scripts/ — bản track này là bản chính thức)
//
// Nguyên tắc (brief Workstream H §50):
//   • assert cấu trúc: core 39 · optional 6 · appendix 3 · units 48 ·
//     instructional 45 · stage counts theo STAGES;
//   • assert rendered: homepage hero + stage cards + sidebar header suy đúng
//     số từ registry — so từng data-count với số đếm lại từ index (không
//     hardcode "39" hai lần: EXPECT lấy từ chính registry qua cách đếm độc lập
//     regex, rồi so với DOM built);
//   • 0 lệch → exit 0; bất kỳ lệch nào → in chi tiết + exit 1.
// ==========================================================================
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, KHONG dung URL.pathname: pathname tra ve chuoi da ma hoa
// phan tram, nen thu muc co dau cach (vd "WorkBuddy AI") thanh "WorkBuddy%20AI"
// va moi readFileSync sau do deu ENOENT. fileURLToPath giai ma dung, ke ca
// tren Windows co ky tu o dia.
const WEB = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(WEB, "dist");

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) {
    failures++;
    console.log(`FAIL ${name}: rendered=${actual} expected=${expected}`);
  } else {
    console.log(`PASS ${name} = ${actual}`);
  }
}

// --- Nguon: doc registry TRUC TIEP tu source (doc lap, khong qua Astro) ------
const chaptersSrc = readFileSync(join(WEB, "src/data/chapters.ts"), "utf8");
const stageCounts = {};
for (const m of chaptersSrc.matchAll(/stageId:\s*"(\w+)"/g)) {
  stageCounts[m[1]] = (stageCounts[m[1]] ?? 0) + 1;
}
const CORE_IDS = ["foundation", "android", "compose", "state", "navigation", "network", "data", "realworld"];
const coreTotal = CORE_IDS.reduce((n, id) => n + (stageCounts[id] ?? 0), 0);

check("registry: foundation", stageCounts.foundation, 2);
check("registry: android", stageCounts.android, 14);
check("registry: compose", stageCounts.compose, 5);
check("registry: state", stageCounts.state, 5);
check("registry: navigation", stageCounts.navigation, 2);
check("registry: network", stageCounts.network, 3);
check("registry: data", stageCounts.data, 6);
check("registry: realworld", stageCounts.realworld, 2);
check("registry: optional", stageCounts.optional, 6);
check("registry: appendix", stageCounts.appendix, 3);
check("registry: core total", coreTotal, 39);
check("registry: units total", Object.values(stageCounts).reduce((a, b) => a + b, 0), 48);

// lessons.ts: số entry CÓ Quiz = instructional (45), AP1–AP3 không Quiz.
const lessonsSrc = readFileSync(join(WEB, "src/data/lessons.ts"), "utf8");
const entryCount = (lessonsSrc.match(/^\s{2}"[^"]+":\s*\{/gm) ?? []).length;
const quizCount = (lessonsSrc.match(/^\s{2}"[^"]+":\s*\{[\s\S]*?Quiz:/gm) ?? []).length;
check("registry: LESSONS entries", entryCount, 48);
check("registry: instructional (entry có Quiz)", quizCount, 45);

// --- Rendered: trang built ----------------------------------------------------
function readDist(rel) {
  return readFileSync(join(DIST, rel, "index.html"), "utf8");
}

// Route trong dist/chapters: 48 unit live + 8 old-slug redirect dirs.
// Redirect = trang index.html chỉ có meta-refresh (Astro static redirect).
let liveRoutes = 0;
let metaRefresh = 0;
function walkRoutes(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkRoutes(p);
    else if (name === "index.html") {
      const html = readFileSync(p, "utf8");
      if (/http-equiv="refresh"/i.test(html)) metaRefresh++;
      else liveRoutes++;
    }
  }
}
walkRoutes(join(DIST, "chapters"));
check("dist: live unit routes", liveRoutes, 48);
check("dist: meta-refresh redirects", metaRefresh, 8);

// Homepage: hero + stage cards
const home = readDist("");
// Hero: các .st-val (trừ #hero-pct) — đếm "2+7", core, optional, hours
const heroVals = [...home.matchAll(/<span class="st-val">([^<]+)<\/span>/g)].map((m) => m[1]);
// 4 số tĩnh (2+7, core, optional, giờ) + #hero-pct do script tô (không khớp regex)
check("home: hero có 4 số liệu tĩnh", heroVals.length, 4);
check("home: hero pct element", home.includes('id="hero-pct"'), true);
check(
  "home: hero foundation+stages",
  new RegExp(`^${stageCounts.foundation}[+]${CORE_IDS.length - 1}$`).test(heroVals[0] ?? ""),
  true
);
check("home: hero core lessons", heroVals[1], String(coreTotal));
check("home: hero optional", heroVals[2], String(stageCounts.optional));
check("home: hero hours prefix ~", heroVals[3].startsWith("~") && heroVals[3].endsWith("giờ"), true);

// Stage cards trên homepage: 8 core (foundation + 7) + 1 optional
const stageCards = [...home.matchAll(/class="stage-card(?: stage-card-optional)?"[^>]*data-stage="(\w+)"[^>]*data-total="(\d+)"/g)];
const cardTotals = Object.fromEntries(stageCards.map((m) => [m[1], Number(m[2])]));
for (const id of CORE_IDS) check(`home: stage card ${id} total`, cardTotals[id] ?? -1, stageCounts[id] ?? -1);
check("home: stage card optional total", cardTotals.optional ?? -1, stageCounts.optional);
check("home: stage card count (8 core + 1 optional)", stageCards.length, CORE_IDS.length + 1);

// Lesson rows trên homepage = 45 instructional (appendix dùng ref-row)
check("home: lesson-row count", (home.match(/class="lesson-row"/g) ?? []).length, 45);
check("home: ref-row count (appendix)", (home.match(/class="ref-row"/g) ?? []).length, stageCounts.appendix);

// Homepage KHÔNG còn cấu trúc cũ (Section II mod-group / .card[data-slug])
check("home: legacy .card[data-slug] removed", (home.match(/class="card"/g) ?? []).length, 0);
check("home: legacy mod-group removed", home.includes("mod-group"), false);

// Sidebar (lấy 1 trang lesson bất kỳ): stage headers + lesson rows
const lesson = readDist("chapters/ch05-composable-va-layout");
check("sidebar: stage groups", (lesson.match(/<details class="module/g) ?? []).length, 10); // 8 core + optional + appendix
// sidebar: không còn num badge "5.1"-style trong rail
const railHtml = /<aside class="rail"[\s\S]*?<\/aside>/.exec(lesson)?.[0] ?? "";
check("sidebar: không còn <span class=num>", railHtml.includes('class="num"'), false);
check("sidebar: aria-current đặt cho bài active", railHtml.includes('aria-current="page"'), true);

// Lesson header chips: "Bài x/y" suy từ lessonStats — so một vài trang đã biết
function lessonChip(rel) {
  const html = readDist(rel);
  return /<span class="chip chip-plain">Bài (\d+)\/(\d+)<\/span>/.exec(html)?.slice(1).map(Number) ?? null;
}
// stagePosition/stageTotal derive: ch05-material-3-va-theming là compose #3/5
check("lesson: C3 Bài 3/5", lessonChip("chapters/ch05-material-3-va-theming").join("/"), "3/5");
check("lesson: F1 Bài 1/2", lessonChip("chapters/kotlin-variables-null-collections-lambda").join("/"), "1/2");
check("lesson: O4 Bài 4/6", lessonChip("chapters/workmanager-cong-viec-nen").join("/"), "4/6");
// Appendix KHÔNG có chip Bài x/y
const ap3 = readDist("chapters/bang-tra-cuu-nhanh");
check("lesson: AP3 không có chip Bài x/y", /Bài \d+\/\d+/.test(ap3), false);

// Không còn stale counts ở các trang built
check("dist: không '22 chương'", /22 chương/.test(home), false);
check("dist: không '42 pages' hiển thị", home.includes("42 pages"), false);
check("dist: không 'Module 2 ·' cũ", home.includes("Module 2 ·"), false);

// stale Ch-numbering trên homepage hero/roadmap: 'Chương 5.1' không được là identity
check("home: không 'Chương 5'", /Chương 5/.test(home), false);

console.log(failures === 0 ? "\nTRUTH-CHECK PASS — 0 lệch" : `\nTRUTH-CHECK FAIL — ${failures} lệch`);
process.exit(failures === 0 ? 0 : 1);
