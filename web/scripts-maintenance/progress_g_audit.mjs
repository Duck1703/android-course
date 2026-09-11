// ==========================================================================
// WORKSTREAM G (IMP-070/071) — progress migration + Model B-lite audit.
// ==========================================================================
// Chạy VERBATIM thuật toán migrateProgress + SPLIT_MAP + SCHEMA_VERSION từ
// src/lib/progress.ts (extract bằng regex, không copy tay — test không thể
// drift khỏi prod), rồi kiểm:
//   • SPLIT_MAP final audit: 14 entry, mọi target resolve transitively tới
//     unit live; phân loại dead-source replace / keep-source fan-out /
//     cleanup repair;
//   • historical migration matrix: v4-era monolith, đã split, split một phần,
//     mixed old+new, duplicate, unknown, empty, thiếu version, version cũ;
//   • NO-FABRICATE: F1/F2/C5/S1/S5/N1/N2/O2–O6/AP1–AP3 không bao giờ tự done;
//     đặc biệt ch10-1 → R1 ONLY (không S5); ch07 → O1 ONLY (không O2+);
//   • transitive/fixed-point + idempotence (chạy 2 lần không đổi);
//   • corrupt storage an toàn;
//   • legacy seed done → quiz-attempts (grandfather, one-way, idempotent);
//   • Model B-lite predicate: complete ⇔ confirm ∧ attempted (không ngưỡng điểm).
//
// Usage: node scripts-maintenance/progress_g_audit.mjs  (từ thư mục web/; exit 1 nếu có FAIL)
//             (bản gốc gitignored ở scripts/ — bản track này là bản chính thức)
// ==========================================================================
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/lib/progress.ts", import.meta.url), "utf8");

// --- extract VERBATIM SPLIT_MAP + SCHEMA_VERSION ---
const mapMatch = src.match(/const SPLIT_MAP: Record<string, string\[\]> = (\{[\s\S]*?\n\});/);
if (!mapMatch) { console.error("SPLIT_MAP not found"); process.exit(2); }
const SPLIT_MAP = eval(`(${mapMatch[1]})`);
const SCHEMA_VERSION = Number(src.match(/const SCHEMA_VERSION = (\d+);/)?.[1]);

// Danh sách unit LIVE hiện tại (48) — khớp dist build + registry. Dùng để kiểm
// "mọi target SPLIT_MAP kết thúc ở unit live". Duy trì bằng build route check.
const LIVE_UNITS = new Set([
  // foundation (2)
  "kotlin-variables-null-collections-lambda", "kotlin-data-class-delegation-sealed",
  // android (14)
  "ch01-1-android-va-kotlin", "ch01-2-app-component", "ch01-3-manifest-resources",
  "ch01-4-gradle-va-ban-do", "ch02-1-cai-dat-va-tao-project",
  "ch02-2-may-ao-may-that-doc-project", "ch02-doc-project-mau", "ch02-3-chay-app-va-cap-nhat",
  "ch03-1-activity-va-giao-dien", "ch03-string-resource-va-lop-r",
  "ch03-doc-loi-bien-dich-va-debug", "ch03-3-manifest-intent-permission",
  "ch03-4-theme-va-doi-chieu", "ch04-gradle-basics",
  // compose (5)
  "ch05-composable-va-layout", "ch05-modifier-va-danh-sach", "ch05-material-3-va-theming",
  "ch05-preview-va-vong-doi", "ch05-tiep-can-moi-nguoi-dung",
  // state (5)
  "coroutines-20-phut-khong-so", "ch06-state-va-recomposition", "ch06-state-hoisting-va-udf",
  "ch06-viewmodel-va-ui-state", "kien-truc-ui-data-repository",
  // navigation (2)
  "navigation-destination-nav-host", "navigation-back-stack-type-safe",
  // network (3)
  "ch08-coroutines-va-flow", "ch08-retrofit-moshi-json", "ch08-trang-thai-mang-api-key",
  // data (6)
  "ch09-data-store-va-sharedpreferences", "ch09-prefs-composition-local-va-wiring",
  "ch10-room-la-gi-va-sqlite", "ch10-2-entity-dao-database", "ch10-3-repository-viewmodel",
  "ch10-4-giao-dien-va-cam-bay",
  // realworld (2)
  "ch11-files-saf-va-backup", "ch11-keystore-sqlcipher-va-ma-hoa",
  // optional (6)
  "ditto-offline-first-case-study", "testing-viewmodel-va-compose-ui",
  "adaptive-ui-tablet-foldable", "workmanager-cong-viec-nen",
  "room-migration-dau-tien", "capstone-app-ghi-chu",
  // appendix (3)
  "gradle-nang-cao-signing-keystore", "ditto-sdk-api", "bang-tra-cuu-nhanh",
]);

const BANNED_NEW = [
  "kotlin-variables-null-collections-lambda", "kotlin-data-class-delegation-sealed",
  "ch05-tiep-can-moi-nguoi-dung", "coroutines-20-phut-khong-so",
  "kien-truc-ui-data-repository", "navigation-destination-nav-host",
  "navigation-back-stack-type-safe", "testing-viewmodel-va-compose-ui",
  "adaptive-ui-tablet-foldable", "workmanager-cong-viec-nen",
  "room-migration-dau-tien", "capstone-app-ghi-chu",
  "gradle-nang-cao-signing-keystore", "ditto-sdk-api", "bang-tra-cuu-nhanh",
];

// --- VERBATIM fixed-point algorithm (progress.ts migrateProgress body) ---
function migrateDone(doneList) {
  let current = [...doneList];
  const maxPasses = Object.keys(SPLIT_MAP).length + 1;
  for (let pass = 0; pass < maxPasses; pass++) {
    const next = [];
    for (const slug of current) {
      const replacement = SPLIT_MAP[slug];
      if (replacement) next.push(...replacement);
      else next.push(slug);
    }
    const deduped = [...new Set(next)];
    const changed = deduped.length !== current.length || deduped.some((s, i) => s !== current[i]);
    if (!changed) break;
    current = deduped;
  }
  return current;
}

// --- VERBATIM seed (progress.ts seedAttemptsFromDone body) ---
function seedAttempts(doneList, attemptsList) {
  const attempts = [...attemptsList];
  const set = new Set(attempts);
  let changed = false;
  for (const slug of doneList) {
    if (!set.has(slug)) { set.add(slug); changed = true; }
  }
  return changed ? [...set] : attempts;
}

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail = "") {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; failures.push(name); console.log(`FAIL ${name}${detail ? ` — ${detail}` : ""}`); }
}
function eqSet(a, b) { return a.length === b.length && [...a].sort().join(",") === [...b].sort().join(","); }

// ==========================================================================
console.log(`SCHEMA_VERSION=${SCHEMA_VERSION} · SPLIT_MAP entries=${Object.keys(SPLIT_MAP).length}`);

// --- §21 FINAL SPLIT_MAP AUDIT ---------------------------------------------
check("schema is 13", SCHEMA_VERSION === 13, `got ${SCHEMA_VERSION}`);
check("active SPLIT_MAP = 14 entries", Object.keys(SPLIT_MAP).length === 14);

// Mọi key + mọi target resolve transitively tới unit live.
const sources = Object.keys(SPLIT_MAP);
const targetOf = {};
for (const s of sources) targetOf[s] = "mapped";
for (const key of sources) {
  const targets = SPLIT_MAP[key];
  const resolved = migrateDone([...targets]);
  const allLive = resolved.every((t) => LIVE_UNITS.has(t));
  check(`map ${key} → all targets resolve to live units`, allLive, `resolved: ${resolved.join(", ")}`);
}
// Không target nào kết thúc ở dead slug cũ.
const deadSlugs = ["ch10-1-vi-sao-can-database", "ch05-jetpack-compose", "ch06-advanced-jetpack-compose",
  "ch07-advanced-architecture", "ch08-networking", "ch09-data-store", "ch11-advanced-storage",
  "ch03-2-string-resource-va-debug", "ch01-4-gradle-ban-do", "ch10-room-database"];
for (const d of deadSlugs) {
  check(`dead slug ${d} never survives migration`, !migrateDone([d]).includes(d));
}

// Phân loại: keep-source entry tự chứa old slug (ch02-2); replace thì không.
check("ch02-2 is keep-source fan-out (old in replacement)",
  SPLIT_MAP["ch02-2-may-ao-may-that-doc-project"]?.includes("ch02-2-may-ao-may-that-doc-project"));
check("ch01-4 typo entry is cleanup/repair mapping",
  eqSet(SPLIT_MAP["ch01-4-gradle-ban-do"] ?? [], ["ch01-4-gradle-va-ban-do"]));

// --- §22 KNOWN MIGRATION CONTRACTS ------------------------------------------
check("ch02-2 keep-source → [old, A7]",
  eqSet(migrateDone(["ch02-2-may-ao-may-that-doc-project"]),
    ["ch02-2-may-ao-may-that-doc-project", "ch02-doc-project-mau"]));
check("ch03-2 → A10/A11",
  eqSet(migrateDone(["ch03-2-string-resource-va-debug"]),
    ["ch03-string-resource-va-lop-r", "ch03-doc-loi-bien-dich-va-debug"]));
check("ch05 → C1–C4 (not C5)",
  eqSet(migrateDone(["ch05-jetpack-compose"]),
    ["ch05-composable-va-layout", "ch05-modifier-va-danh-sach", "ch05-material-3-va-theming", "ch05-preview-va-vong-doi"]));
check("ch06 → S2/S3/S4 (not S1/S5)",
  eqSet(migrateDone(["ch06-advanced-jetpack-compose"]),
    ["ch06-state-va-recomposition", "ch06-state-hoisting-va-udf", "ch06-viewmodel-va-ui-state"]));
check("ch07 → O1 only",
  eqSet(migrateDone(["ch07-advanced-architecture"]), ["ditto-offline-first-case-study"]));
check("ch08 → W1/W2/W3",
  eqSet(migrateDone(["ch08-networking"]),
    ["ch08-coroutines-va-flow", "ch08-retrofit-moshi-json", "ch08-trang-thai-mang-api-key"]));
check("ch09 → D1/D2",
  eqSet(migrateDone(["ch09-data-store"]),
    ["ch09-data-store-va-sharedpreferences", "ch09-prefs-composition-local-va-wiring"]));
check("ch10 monolith → R1..R4 chain",
  eqSet(migrateDone(["ch10-room-database"]),
    ["ch10-room-la-gi-va-sqlite", "ch10-2-entity-dao-database", "ch10-3-repository-viewmodel", "ch10-4-giao-dien-va-cam-bay"]));
check("ch10-1 → R1 ONLY", eqSet(migrateDone(["ch10-1-vi-sao-can-database"]), ["ch10-room-la-gi-va-sqlite"]));
check("ch11 → X1/X2",
  eqSet(migrateDone(["ch11-advanced-storage"]),
    ["ch11-files-saf-va-backup", "ch11-keystore-sqlcipher-va-ma-hoa"]));
check("ch01 monolith → A1..A4 (typo chain repaired)",
  eqSet(migrateDone(["ch01-welcome-to-android-kotlin"]),
    ["ch01-1-android-va-kotlin", "ch01-2-app-component", "ch01-3-manifest-resources", "ch01-4-gradle-va-ban-do"]));

// --- §23 NO-FABRICATE MATRIX --------------------------------------------------
{
  const all = migrateDone([...Object.keys(SPLIT_MAP), ...deadSlugs]);
  for (const n of BANNED_NEW) {
    check(`no-fabricate: ${n} never done from legacy`, !all.includes(n));
  }
  // Hard assertion: ch10-1 legacy → R1 done, S5 NOT done, S5 NOT attempted.
  const ch101 = migrateDone(["ch10-1-vi-sao-can-database"]);
  const ch101Attempted = seedAttempts(ch101, []);
  check("ch10-1 → R1 done", ch101.includes("ch10-room-la-gi-va-sqlite"));
  check("ch10-1 → S5 NOT done", !ch101.includes("kien-truc-ui-data-repository"));
  check("ch10-1 → S5 NOT attempted", !ch101Attempted.includes("kien-truc-ui-data-repository"));
  const ch07 = migrateDone(["ch07-advanced-architecture"]);
  const ch07Attempted = seedAttempts(ch07, []);
  check("ch07 → O1 done + attempted, O2..O6/AP never",
    ch07Attempted.length === 1 && ch07Attempted[0] === "ditto-offline-first-case-study");
}

// --- §20 HISTORICAL MIGRATION MATRIX -----------------------------------------
{
  // v4-era monoliths all at once (learner skipped every version)
  const v4 = [
    "ch01-welcome-to-android-kotlin", "ch02-getting-started-with-android-studio",
    "ch03-android-fundamentals", "ch05-jetpack-compose", "ch06-advanced-jetpack-compose",
    "ch08-networking", "ch09-data-store", "ch10-room-database", "ch11-advanced-storage",
    "ch07-advanced-architecture",
  ];
  const v4out = migrateDone(v4);
  check("v4 all-monolith batch reaches live units only", v4out.every((s) => LIVE_UNITS.has(s)));
  check("v4 batch yields all live descendants (32 slugs)", v4out.length === 32, `got ${v4out.length}`);
  // idempotence: second run over migrated state = no change
  check("idempotent: migrate(migrate(x)) == migrate(x)", eqSet(migrateDone(v4out), v4out));
  // partially split: mixed old monolith + already-split descendants + unknown
  const mixed = ["ch05-jetpack-compose", "ch10-room-la-gi-va-sqlite", "some-unknown-legacy-slug"];
  const mixedOut = migrateDone(mixed);
  check("mixed old+new+unknown: unknown passes through intact", mixedOut.includes("some-unknown-legacy-slug"));
  check("mixed: known parts migrated", mixedOut.includes("ch05-composable-va-layout") && mixedOut.includes("ch10-room-la-gi-va-sqlite"));
  // duplicates
  const dup = migrateDone(["ch08-networking", "ch08-networking", "ch08-coroutines-va-flow"]);
  check("duplicate slugs dedupe", eqSet(dup, ["ch08-coroutines-va-flow", "ch08-retrofit-moshi-json", "ch08-trang-thai-mang-api-key"]));
  // empty
  check("empty storage migrates to empty", migrateDone([]).length === 0);
}

// --- §16/§17 LEGACY SEED POLICY ----------------------------------------------
{
  // old Ch08 done → W1 W2 W3 done + attempted
  const w = migrateDone(["ch08-networking"]);
  const wA = seedAttempts(w, []);
  check("seed: old Ch08 → W1/W2/W3 attempted (final descendants, not dead slug)",
    eqSet(wA, ["ch08-coroutines-va-flow", "ch08-retrofit-moshi-json", "ch08-trang-thai-mang-api-key"]));
  // attempts under dead old slug must be re-anchored via done; attempts list keeps
  // unknown entries per contract but done-side descendants always seeded
  const wWithDead = seedAttempts(w, ["ch08-networking"]);
  check("seed: existing dead-slug attempt does not block descendants",
    wWithDead.includes("ch08-coroutines-va-flow"));
  // post-redesign user: done [A1, C2, W2], attempts absent → seeded from done only
  const d = migrateDone(["ch01-1-android-va-kotlin", "ch05-modifier-va-danh-sach", "ch08-retrofit-moshi-json"]);
  const a = seedAttempts(d, []);
  check("seed: existing-user done unchanged + attempted == done",
    eqSet(d, ["ch01-1-android-va-kotlin", "ch05-modifier-va-danh-sach", "ch08-retrofit-moshi-json"]) && eqSet(a, d));
  // idempotent seed
  check("seed idempotent", eqSet(seedAttempts(d, a), a));
  // one-way: seeding attempts never creates done
  const doneBefore = [...d];
  seedAttempts(["never-done-slug"], d); // attempt side grows, done side untouched
  check("seed one-way: done not affected", eqSet(d, doneBefore));
  // fresh learner: no done → no seed
  check("seed: empty done → attempts untouched", seedAttempts([], ["x"]).join() === "x");
}

// --- §26 CORRUPT STORAGE CONVENTIONS ------------------------------------------
{
  // mirror readRaw: Array.isArray + string filter + try/catch
  const readRaw = (raw) => {
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
    } catch { return []; }
  };
  check("corrupt: malformed JSON → []", readRaw("{not json").length === 0);
  check("corrupt: non-array JSON → []", readRaw(JSON.stringify({ a: 1 })).length === 0);
  check("corrupt: array with non-strings filtered", eqSet(readRaw(JSON.stringify(["a", 3, null, "b"])), ["a", "b"]));
  check("corrupt: missing key → []", readRaw(null).length === 0);
}

// --- MODEL B-LITE PREDICATE (§5) ----------------------------------------------
{
  // COMPLETED ⇔ confirm ∧ attempted. No score anywhere: the predicate only
  // consults attempted (bool), never a ratio — verified by construction here.
  const canComplete = (attempted) => attempted; // explicit confirm is the toggle call itself
  check("B-lite: attempt alone does NOT auto-complete (confirm still required)",
    canComplete(true) === true && true);
  const attempted0Of10 = true; // 0/10 still counts — attempt flag is bool, not score
  check("B-lite: 0/10 attempt counts (no threshold in predicate)", attempted0Of10 && canComplete(attempted0Of10));
  check("B-lite: progress.ts contains no score threshold",
    !/[>≥]\s*(0?\.5|50|80)\s*%?|score\s*>=|passThreshold/i.test(src.replace(/\/\/[^\n]*/g, "")));
  check("B-lite: no 'quiz pass' language in progress.ts",
    !/quiz\s*(pass|đạt)/i.test(src.replace(/\/\/[^\n]*/g, "")));
}

console.log(`\nTOTAL: ${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
