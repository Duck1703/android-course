#!/usr/bin/env node
/**
 * normalize-lesson-order.mjs
 *
 * Chuan hoa phan cuoi moi bai hoc ve DUNG MOT khuon:
 *
 *   ... noi dung ...
 *   <h2 id="luyen-tap">  (khong danh so)
 *   <h2 id="cam-bay">
 *   <h2 id="tom-tat"> | <h2 id="key-points"> | <h2 id="ket">
 *   <h2 id="nguon">
 *
 * Xu ly 3 viec:
 *   A. Bo so o tieu de khoi luyen tap (luyen-tap / thu-thach / bai-tap*).
 *      Khi bo so, cac muc danh so phia sau TRONG CUNG BAI duoc giam 1
 *      de khong sinh lo hong.
 *   B. Sap lai thu tu cac khoi dac biet o cuoi bai theo khuon tren.
 *      Thu tu tuong doi giua cac khoi cung nhom duoc giu nguyen.
 *   C. Khong dung toi phan noi dung phia truoc khoi dac biet dau tien.
 *
 * Chay:  node tools/normalize-lesson-order.mjs            (dry-run)
 *        node tools/normalize-lesson-order.mjs --apply    (ghi file)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = join(__dirname, "..");
const LESSONS_DIR = join(WEB, "src", "components", "lessons");
const LESSONS_TS = join(WEB, "src", "data", "lessons.ts");

const APPLY = process.argv.includes("--apply");

const FM_RE = /^---[\s\S]*?---/m;
const H2_RE = /<h2\s+id="([^"]+)"[^>]*>[\s\S]*?<\/h2>/gi;

const PRACTICE = (id) =>
  id.startsWith("luyen-tap") || id.startsWith("thu-thach") || id.startsWith("bai-tap");
/** Muc tom tat / chot lai cuoi bai. */
const RECAP = (id) => id === "tom-tat" || id === "key-points";
/** Muc "di tiep" / mo rong — dat sau phan tom tat, truoc Nguon. */
const OUTRO = (id) => id === "ket" || id === "di-tiep" || id === "tiep-theo" || id === "mo-rong";

/** Khoi thuoc phan "ket bai" duoc phep sap lai thu tu. */
const isTail = (id) =>
  PRACTICE(id) || RECAP(id) || OUTRO(id) || id === "cam-bay" || id === "nguon";

/** Hang uu tien trong khuon chuan. */
function rank(id) {
  if (PRACTICE(id)) return 0;
  if (id === "cam-bay") return 1;
  if (RECAP(id)) return 2;
  if (OUTRO(id)) return 3;
  if (id === "nguon") return 4;
  return -1;
}

function readLiveNames() {
  const src = readFileSync(LESSONS_TS, "utf8");
  const re = /"([a-z0-9-]+)"\s*:\s*\{\s*Lesson:\s*([A-Za-z0-9_]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[2]);
  return out;
}

const stripNum = (h) => h.replace(/(<h2[^>]*>)(\s*)\d+\s*\.\s*/, "$1$2");
const decNum = (h) =>
  h.replace(/(<h2[^>]*>)(\s*)(\d+)\s*\./, (_, a, ws, n) => `${a}${ws}${Number(n) - 1}.`);
const hasNum = (h) => /<h2[^>]*>\s*\d+\s*\./.test(h);

function processLesson(raw) {
  const fmMatch = FM_RE.exec(raw);
  const cut = fmMatch ? fmMatch.index + fmMatch[0].length : 0;
  const head = raw.slice(0, cut);
  const body = raw.slice(cut);

  // tach thanh cac khoi theo <h2>
  const marks = [];
  H2_RE.lastIndex = 0;
  let m;
  while ((m = H2_RE.exec(body)) !== null) {
    marks.push({ id: m[1], start: m.index });
  }
  if (marks.length === 0) return { out: raw, changes: [] };

  const blocks = marks.map((mk, i) => ({
    id: mk.id,
    text: body.slice(mk.start, i + 1 < marks.length ? marks[i + 1].start : body.length),
  }));
  const prefix = body.slice(0, marks[0].start);

  // --- A. bo so o khoi luyen tap + giam cac muc sau trong cung bai ---
  const changes = [];
  let shift = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (PRACTICE(b.id) && hasNum(b.text)) {
      b.text = stripNum(b.text);
      shift += 1;
      changes.push(`bo so khoi #${b.id}`);
      continue;
    }
    if (shift > 0 && hasNum(b.text)) {
      b.text = decNum(b.text);
      changes.push(`giam 1 so muc #${b.id}`);
    }
  }

  // --- B. tim duoi gom toan khoi dac biet roi sap lai ---
  let k = blocks.length;
  while (k > 0 && isTail(blocks[k - 1].id)) k--;
  const tail = blocks.slice(k);
  const before = blocks.slice(0, k);

  const ordered = tail
    .map((b, i) => ({ b, i }))
    .sort((x, y) => rank(x.b.id) - rank(y.b.id) || x.i - y.i)
    .map((x) => x.b);

  const beforeIds = tail.map((b) => b.id).join(",");
  const afterIds = ordered.map((b) => b.id).join(",");
  if (beforeIds !== afterIds) changes.push(`sap lai: [${beforeIds}] -> [${afterIds}]`);

  const out = head + prefix + [...before, ...ordered].map((b) => b.text).join("");
  return { out, changes };
}

// --- main ---
const names = readLiveNames();
let touched = 0;

for (const name of names) {
  const file = join(LESSONS_DIR, `${name}.astro`);
  if (!existsSync(file)) continue;
  const raw = readFileSync(file, "utf8");
  const { out, changes } = processLesson(raw);
  if (!changes.length) continue;

  touched++;
  console.log(`${name}.astro`);
  for (const c of changes) console.log(`    - ${c}`);

  if (APPLY) writeFileSync(file, out, "utf8");
}

console.log(`\n${touched} file ${APPLY ? "da sua" : "CAN sua"}${APPLY ? "" : " (dry-run, them --apply de ghi)"}`);
