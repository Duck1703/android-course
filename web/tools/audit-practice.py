#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit-practice.py — kiem chat luong cac khoi luyen tap da chen (115 bai tap).

Cau truc THAT cua mot bai tap (khong phai <details>, khong co dap an an):
    <div class="chal">
      <h3>N. Tieu de viec can lam</h3>
      <p>...lam gi...</p>
      <p><strong>Ban phai thay</strong> ...ket qua quan sat duoc...</p>
      <p><em>Bai hoc di kem:</em> ...chot lai kien thuc...</p>
    </div>

Vi vay kiem 4 dieu:
  A. Moi bai co khoi luyen tap khong (check-lesson-structure lo viec nay, nhac lai cho day du)
  B. Moi <div class="chal"> co <h3> danh so + du 3 phan (lam gi / phai thay / bai hoc)
  C. Tham chieu 'muc N' / 'muc N.M' trong khoi phai tro toi heading CO THAT
     (xet ca <h2> lan <h3> — so hieu tieu de con cung tinh)
  D. So thu tu <h3> trong khoi phai lien tuc 1,2,3...

Chay tu web/:  python tools/audit-practice.py
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
LESSONS = os.path.join(WEB, "src", "components", "lessons")
LESSONS_TS = os.path.join(WEB, "src", "data", "lessons.ts")

H2_ANY = re.compile(r"<h2\s+id=\"([^\"]+)\"")
PRACTICE_START = re.compile(r'<h2\s+id="(luyen-tap|thu-thach|bai-tap)[^"]*"')
CHAL_RE = re.compile(r'<div class="chal">(.*?)</div>', re.S)
H3_RE = re.compile(r"<h3[^>]*>(.*?)</h3>", re.S)
HEADING_NUM_RE = re.compile(r"^\s*(\d+(?:\.\d+)?)[.\s]")
MUC_RE = re.compile(r"mục\s+(\d+(?:\.\d+)?)")
STRONG_RE = re.compile(r"<strong>\s*Bạn phải", re.I)
TAKEAWAY_RE = re.compile(r"<em>\s*Bài học đi kèm", re.I)


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s)


def is_lesson(name):
    """Bo file quiz va template — chung khong phai bai hoc."""
    return name.endswith(".astro") and not name.endswith("Quiz.astro") and not name.startswith("_")


def live_lessons():
    """Doc src/data/lessons.ts -> set ten file .astro cua 48 bai THAT.

    Thu muc lessons/ co nhieu file hon so bai live (bai con, component dung
    chung, file da nghi). Chi kiem bai co trong registry — cung cach
    check-lesson-structure.mjs lam (readLiveRoutes).
    """
    src = open(LESSONS_TS, encoding="utf-8").read()
    names = re.findall(r'"[a-z0-9-]+"\s*:\s*\{\s*Lesson:\s*([A-Za-z0-9_]+)', src)
    return set(n + ".astro" for n in names)


def heading_numbers(html):
    """So hieu cua MOI tieu de (h2 + h3) trong bai -> set chuoi so."""
    nums = set()
    for m in re.finditer(r"<(h2|h3)[^>]*>(.*?)</\1>", html, re.S):
        mm = HEADING_NUM_RE.match(strip_tags(m.group(2)).strip())
        if mm:
            nums.add(mm.group(1))
    return nums


def extract_practice(html):
    m = PRACTICE_START.search(html)
    if not m:
        return False, ""
    nxt = H2_ANY.search(html, m.end())
    end = nxt.start() if nxt else len(html)
    return True, html[m.start():end]


def main():
    live = live_lessons()
    files = sorted(f for f in os.listdir(LESSONS) if is_lesson(f) and f in live)
    print("audit-practice: %d bai live (registry co %d)\n" % (len(files), len(live)))

    no_block, no_chal, incomplete, bad_order, bad_muc = [], [], [], [], []
    total_tasks = 0
    total_refs = 0

    for name in files:
        html = open(os.path.join(LESSONS, name), encoding="utf-8").read()
        has, block = extract_practice(html)
        if not has:
            no_block.append(name)
            continue

        chals = CHAL_RE.findall(block)
        if not chals:
            no_chal.append(name)
            continue
        total_tasks += len(chals)

        nums = heading_numbers(html)
        order = []
        for i, body in enumerate(chals, 1):
            h3 = H3_RE.search(body)
            if not h3:
                incomplete.append((name, i, "thieu <h3>"))
                continue
            mm = HEADING_NUM_RE.match(strip_tags(h3.group(1)).strip())
            if not mm:
                incomplete.append((name, i, "tieu de khong danh so"))
            else:
                order.append(mm.group(1))
            if not STRONG_RE.search(body):
                incomplete.append((name, i, "thieu 'Ban phai thay'"))
            if not TAKEAWAY_RE.search(body):
                incomplete.append((name, i, "thieu 'Bai hoc di kem'"))

        # thu tu 1..n lien tuc
        expect = [str(x) for x in range(1, len(chals) + 1)]
        if order and order != expect:
            bad_order.append((name, ",".join(order), ",".join(expect)))

        for ref in sorted(set(MUC_RE.findall(block))):
            total_refs += 1
            if ref not in nums:
                bad_muc.append((name, ref))

    def dump(title, items, fmt=lambda x: "   - %s" % (x,)):
        print("%s: %d" % (title, len(items)))
        for it in items:
            print(fmt(it))

    # --- LOI CUNG: phai sua, exit 1 -------------------------------------
    print("-" * 62)
    print("LOI CUNG (phai sua)")
    print("-" * 62)
    dump("Bai khong co khoi luyen tap", no_block)
    dump("Thu tu <h3> khong lien tuc", bad_order,
         lambda x: "   - %s: co [%s], mong doi [%s]" % x)
    print("Tham chieu 'muc N' kiem tra  : %d" % total_refs)
    dump("Tham chieu 'muc N' sai dich", bad_muc,
         lambda x: "   - %s: 'muc %s' khong co tieu de tuong ung" % x)
    hard = len(no_block) + len(bad_order) + len(bad_muc)

    # --- KHAC VAN PHONG: chi de biet, khong fail ------------------------
    # 'Ban phai thay' / 'Bai hoc di kem' la khuon cua dot bo sung 2026-09.
    # Cac bai cu viet khac dien dat (vd 'Ban phai thay ...' khong in dam,
    # 'Day chinh la bai hoc di kem:') nhung noi dung VAN DU. Vi vay day la
    # tin hieu VAN PHONG, khong phai loi — khong duoc fail CI vi no.
    print()
    print("-" * 62)
    print("KHAC VAN PHONG (khong fail)")
    print("-" * 62)
    dump("Bai co khoi nhung khong dung .chal", no_chal)
    dump("Bai tap khong theo khuon 3 phan", incomplete,
         lambda x: "   - %s bai %d: %s" % x)
    print("Tong so bai tap (.chal)      : %d" % total_tasks)

    print("=" * 62)
    if hard:
        print("CO %d LOI CUNG" % hard)
        return 1
    print("SACH — khong co loi cung")
    return 0


if __name__ == "__main__":
    sys.exit(main())
