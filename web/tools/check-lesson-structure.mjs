#!/usr/bin/env node
/**
 * check-lesson-structure.mjs
 *
 * Assert cau truc bai hoc theo docs/COURSE_CONTENT_STANDARD.md.
 * Thoat ma 1 neu co loi CUNG (ERROR). Canh bao (WARN) khong lam fail.
 *
 * Chay: node tools/check-lesson-structure.mjs
 *       node tools/check-lesson-structure.mjs --quiet   (chi in loi)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = join(__dirname, "..");
const LESSONS_DIR = join(WEB, "src", "components", "lessons");
const LESSONS_TS = join(WEB, "src", "data", "lessons.ts");

const QUIET = process.argv.includes("--quiet");

// --- hang so quy tac ------------------------------------------------------
const REQUIRED = ["cam-bay", "nguon"]; // dung 1 moi loai, bat buoc
const RECAP = ["tom-tat", "key-points", "ket", "di-tiep", "tiep-theo", "mo-rong"];
const PRACTICE = (id) =>
  id.startsWith("luyen-tap") || id.startsWith("thu-thach") || id.startsWith("bai-tap");

/**
 * Muc BUOC PHAI khong danh so.
 * - cam-bay / nguon: khoi boilerplate, khong bao gio danh so.
 * - khoi luyen tap: KHONG danh so de viec chen vao giua chuong khong lam dich
 *   so muc cua cac bai sau (so muc danh lien tuc xuyen bai con cua chuong).
 * Muc tom tat (tom-tat/key-points/ket) DUOC PHEP danh so — khi do no la mot
 * muc noi dung cuoi chuong binh thuong.
 */
const mustBeUnnumbered = (id) => id === "cam-bay" || id === "nguon" || PRACTICE(id);

const FM_RE = /^---[\s\S]*?---/m;
const H2_RE = /<h2\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;

// --- helpers -------------------------------------------------------------
const stripTags = (s) =>
  s.replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const numOf = (text) => {
  const m = /^(\d+)\s*\./.exec(stripTags(text));
  return m ? Number(m[1]) : null;
};

function readLiveRoutes() {
  const src = readFileSync(LESSONS_TS, "utf8");
  const re = /"([a-z0-9-]+)"\s*:\s*\{\s*Lesson:\s*([A-Za-z0-9_]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) out.push({ route: m[1], name: m[2] });
  return out;
}

function parseHeadings(raw) {
  const body = raw.replace(FM_RE, " ");
  const out = [];
  let m;
  H2_RE.lastIndex = 0;
  while ((m = H2_RE.exec(body)) !== null) {
    out.push({ id: m[1], text: stripTags(m[2]), num: numOf(m[2]) });
  }
  return out;
}

const chapterOf = (route) => {
  const m = /^(ch\d+|capstone|adaptive|bang-tra-cuu|coroutines|ditto|kotlin|kien-truc|navigation|testing|workmanager|room-migration|gradle-nang-cao)/.exec(route);
  return m ? m[1] : route;
};

// --- main ----------------------------------------------------------------
const live = readLiveRoutes();
const errors = [];
const warns = [];
const missingPractice = [];
const chapterNumbers = new Map();

for (const { route, name } of live) {
  const file = join(LESSONS_DIR, `${name}.astro`);
  if (!existsSync(file)) {
    errors.push(`${route}: khong tim thay file ${name}.astro`);
    continue;
  }
  const hs = parseHeadings(readFileSync(file, "utf8"));
  const ids = hs.map((h) => h.id);
  const where = `${route} (${name}.astro)`;

  // 1. bat buoc: dung 1 cam-bay, dung 1 nguon
  for (const req of REQUIRED) {
    const n = ids.filter((i) => i === req).length;
    if (n !== 1) errors.push(`${where}: can dung 1 <h2 id="${req}">, dang co ${n}`);
  }

  // 2. nguon phai la h2 cuoi cung
  if (ids.length && ids[ids.length - 1] !== "nguon" && ids.includes("nguon")) {
    errors.push(`${where}: <h2 id="nguon"> phai la muc cuoi, dang ket thuc bang "${ids[ids.length - 1]}"`);
  }

  // 3. thu tu: luyen-tap -> cam-bay -> recap -> nguon
  const idx = (id) => ids.indexOf(id);
  const practice = ids.filter(PRACTICE);
  const firstPractice = practice.length ? Math.min(...practice.map(idx)) : -1;
  const iCam = idx("cam-bay");
  const iNg = idx("nguon");
  const recapIdx = RECAP.map(idx).filter((i) => i >= 0);
  const iRecap = recapIdx.length ? Math.min(...recapIdx) : -1;

  if (firstPractice >= 0 && iCam >= 0 && firstPractice > iCam) {
    errors.push(`${where}: khoi luyen tap phai dung TRUOC #cam-bay`);
  }
  if (iCam >= 0 && iRecap >= 0 && iCam > iRecap) {
    errors.push(`${where}: #cam-bay phai dung TRUOC muc tom tat`);
  }
  if (iRecap >= 0 && iNg >= 0 && iRecap > iNg) {
    errors.push(`${where}: muc tom tat phai dung TRUOC #nguon`);
  }

  // 4. muc buoc phai khong danh so
  for (const h of hs) {
    if (mustBeUnnumbered(h.id) && h.num !== null) {
      errors.push(`${where}: muc #${h.id} khong duoc danh so, dang la "${h.text.slice(0, 50)}"`);
    }
  }

  // 5. so muc noi dung phai tang dan trong bai
  const nums = hs.map((h) => h.num).filter((n) => n !== null);
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] <= nums[i - 1]) {
      errors.push(`${where}: so muc khong tang dan (${nums[i - 1]} roi xuong ${nums[i]})`);
      break;
    }
  }

  // 6. theo doi do phu luyen tap
  if (practice.length === 0) missingPractice.push(route);

  // 7. gom so muc theo chuong de kiem lien tuc
  const chap = chapterOf(route);
  if (!chapterNumbers.has(chap)) chapterNumbers.set(chap, []);
  chapterNumbers.get(chap).push(...nums);
}

// canh bao lien tuc so muc theo chuong (khong fail: mot so nhom danh so lai moi bai)
for (const [chap, nums] of chapterNumbers) {
  const expect = Array.from({ length: nums.length }, (_, i) => i + 1);
  if (nums.join(",") !== expect.join(",")) {
    warns.push(`chuong ${chap}: so muc khong lien tuc [${nums.join(",")}]`);
  }
}

// --- bao cao -------------------------------------------------------------
console.log(`check-lesson-structure: ${live.length} bai live`);
console.log(`  ERROR : ${errors.length}`);
console.log(`  WARN  : ${warns.length}`);
console.log(`  Bai thieu khoi luyen tap: ${missingPractice.length}/${live.length}`);

if (errors.length) {
  console.log("\n--- ERROR ---");
  for (const e of errors) console.log("  " + e);
}
if (!QUIET && warns.length) {
  console.log("\n--- WARN ---");
  for (const w of warns) console.log("  " + w);
}
if (!QUIET && missingPractice.length) {
  console.log("\n--- Thieu khoi luyen tap ---");
  for (const r of missingPractice) console.log("  " + r);
}

process.exit(errors.length ? 1 : 0);
