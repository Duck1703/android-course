#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
link-xref.py — Boc the <a> quanh cac tham chieu "muc N" trong bai hoc.

KHONG sua mot chu van nao: chi boc <a href="..."> quanh phan chu da co.

Ba nhom duoc xu ly:
  1. "muc N" tro muc trong CUNG bai          -> <a href="#anchor">
  2. "muc N" tro bai khac CUNG chuong        -> <a href="/chapters/<route>/#anchor">
  3. (tuy chon) "bai X.Y, muc N"             -> can ban do bai -> route

Ba nhom BI BO QUA:
  - Tham chieu nam trong <pre>, <code>, <script>, <style>, hoac da nam trong <a>.
  - Tham chieu co ma tai lieu noi bo canh no (X1, O1, AP2, N2, S1...).
  - So muc khong ton tai trong bai lan trong chuong -> BAO CAO, khong doan bua.

Chay:
  python tools/link-xref.py                 # dry-run, in bang
  python tools/link-xref.py --apply         # ghi file
  python tools/link-xref.py --limit 20      # gioi han so dong in ra
"""
import re
import os
import sys
import json
import argparse

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
LESSONS_DIR = os.path.join(WEB, "src", "components", "lessons")
LESSONS_TS = os.path.join(WEB, "src", "data", "lessons.ts")

FM_RE = re.compile(r"^---[\s\S]*?---", re.M)
PROTECT_RE = re.compile(
    r"<pre[\s\S]*?</pre>|<code[\s\S]*?</code>|<script[\s\S]*?</script>"
    r"|<style[\s\S]*?</style>|<a\s[\s\S]*?</a>",
    re.I,
)
H2_RE = re.compile(r'<h2\s+id="([^"]+)"[^>]*>([\s\S]*?)</h2>', re.I)
H3_RE = re.compile(r'<h3\s+id="([^"]+)"[^>]*>([\s\S]*?)</h3>', re.I)
REF_RE = re.compile(r"mục\s+(\d+)(?:\s*\.\s*(\d+))?")

# Ma tai lieu noi bo: X1/X2 (thu thach), O1.. (offline), AP1.. (appendix),
# N1.. , S1.. (stage), F/H (workstream). KHONG phai so muc trong bai.
DOC_CODE_RE = re.compile(r"\b(?:X|O|AP|N|S|F|H)\d{1,2}\b")


def strip_tags(s):
    s = re.sub(r"<[^>]+>", " ", s)
    s = (s.replace("&nbsp;", " ").replace("&amp;", "&")
          .replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"'))
    return re.sub(r"\s+", " ", s).strip()


def chapter_of(route):
    m = re.match(
        r"(ch\d+|capstone|adaptive|bang-tra-cuu|coroutines|ditto|kotlin|kien-truc"
        r"|navigation|testing|workmanager|room-migration|gradle-nang-cao)",
        route,
    )
    return m.group(1) if m else route


def read_live():
    """Tra ve [(route, LessonName)] theo thu tu khai bao trong lessons.ts."""
    src = open(LESSONS_TS, encoding="utf-8").read()
    return re.findall(r'"([a-z0-9-]+)"\s*:\s*\{\s*Lesson:\s*([A-Za-z0-9_]+)', src)


def parse_anchors(raw):
    """Bo frontmatter, tra ve (h2_anchors, h3_anchors) kem so muc."""
    body = FM_RE.sub(" ", raw, count=1)
    h2, h3 = {}, {}
    for m in H2_RE.finditer(body):
        txt = strip_tags(m.group(2))
        mm = re.match(r"(\d+)\s*\.", txt)
        if mm:
            h2[int(mm.group(1))] = m.group(1)
    for m in H3_RE.finditer(body):
        txt = strip_tags(m.group(2))
        mm = re.match(r"(\d+)\s*\.\s*(\d+)", txt)
        if mm:
            h3[(int(mm.group(1)), int(mm.group(2)))] = m.group(1)
    return h2, h3


def protected_ranges(body):
    """Cac doan KHONG duoc boc link (da co the, la code, hoac la <a> san)."""
    out = []
    for m in PROTECT_RE.finditer(body):
        out.append((m.start(), m.end()))
    return out


def inside(pos, ranges):
    for a, b in ranges:
        if a <= pos < b:
            return True
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="ghi file (mac dinh dry-run)")
    ap.add_argument("--limit", type=int, default=40, help="so dong vi du in ra")
    args = ap.parse_args()

    live = read_live()
    # --- ban do so muc theo bai va theo chuong ---
    per_lesson = {}          # route -> (h2map, h3map)
    chap_map = {}            # chapter -> {so: [(route, anchor)]}
    for route, name in live:
        p = os.path.join(LESSONS_DIR, name + ".astro")
        if not os.path.exists(p):
            continue
        h2, h3 = parse_anchors(open(p, encoding="utf-8").read())
        per_lesson[route] = (h2, h3)
        ch = chap_map.setdefault(chapter_of(route), {})
        for n, a in h2.items():
            ch.setdefault(n, []).append((route, a))

    stats = {"same_lesson": 0, "same_chapter": 0, "skip_doc_code": 0,
             "skip_linked": 0, "skip_notfound": 0}
    changes = []      # (route, name, before_snippet, after_snippet)
    notfound = []     # (route, name, "muc N", ngu canh)
    written = []

    for route, name in live:
        p = os.path.join(LESSONS_DIR, name + ".astro")
        if not os.path.exists(p):
            continue
        raw = open(p, encoding="utf-8").read()
        fm = FM_RE.search(raw)
        cut = fm.end() if fm else 0
        head, body = raw[:cut], raw[cut:]
        h2, h3 = per_lesson[route]
        ch = chap_map[chapter_of(route)]
        prot = protected_ranges(body)

        edits = []   # (start, end, replacement)
        for m in REF_RE.finditer(body):
            if inside(m.start(), prot):
                stats["skip_linked"] += 1
                continue
            n = int(m.group(1))
            sub = int(m.group(2)) if m.group(2) else None
            ctx = body[max(0, m.start() - 100):m.end() + 50]
            plain_ctx = strip_tags(ctx)

            # (a) tro tai lieu noi bo -> bo qua
            if DOC_CODE_RE.search(plain_ctx):
                stats["skip_doc_code"] += 1
                continue

            href = None
            # (b) trong cung bai?
            if sub is not None:
                if (n, sub) in h3:
                    href = "#" + h3[(n, sub)]
            elif n in h2:
                href = "#" + h2[n]

            # (c) bai khac cung chuong (chi khi so muc khong mo ho)?
            if href is None:
                cands = ch.get(n, [])
                others = [c for c in cands if c[0] != route]
                if len(others) == 1 and len(cands) == 1:
                    href = "/chapters/%s/#%s" % (others[0][0], others[0][1])
                    kind = "same_chapter"
                else:
                    href = None
            else:
                kind = "same_lesson"

            if href is None:
                stats["skip_notfound"] += 1
                notfound.append((route, "mục %d%s" % (n, ".%d" % sub if sub else ""),
                                 plain_ctx[-90:]))
                continue

            stats[kind] += 1
            label = m.group(0)
            edits.append((m.start(), m.end(), '<a href="%s">%s</a>' % (href, label)))

        if not edits:
            continue

        # ap dung tu cuoi ve dau de khong lech chi so
        new_body = body
        for s, e, rep in sorted(edits, key=lambda x: -x[0]):
            new_body = new_body[:s] + rep + new_body[e:]

        if len(changes) < args.limit:
            i = 0
            for s, e, rep in sorted(edits, key=lambda x: x[0])[:3]:
                before = strip_tags(body[max(0, s - 45):e + 35])
                after = strip_tags(new_body[max(0, s - 45):e + 35 + len(rep) - (e - s)])
                changes.append((route, before, after))
                i += 1
                if i >= 2:
                    break

        if args.apply:
            open(p, "w", encoding="utf-8").write(head + new_body)
            written.append((name, len(edits)))

    # --- bao cao ---
    total_link = stats["same_lesson"] + stats["same_chapter"]
    print("link-xref: %s" % ("DA GHI" if args.apply else "DRY-RUN (them --apply de ghi)"))
    print("  Link se them : %d" % total_link)
    print("      trong cung bai      : %d" % stats["same_lesson"])
    print("      bai khac cung chuong: %d" % stats["same_chapter"])
    print("  Bo qua:")
    print("      da nam trong <a>/code/pre : %d" % stats["skip_linked"])
    print("      tro tai lieu noi bo       : %d" % stats["skip_doc_code"])
    print("      so muc khong ton tai      : %d" % stats["skip_notfound"])

    if changes:
        print("\n--- VI DU (truoc -> sau) ---")
        for route, b, a in changes[:args.limit]:
            print("  [%s]" % route)
            print("    truoc: ...%s..." % b)
            print("    sau  : ...%s..." % a)

    if notfound:
        print("\n--- SO MUC KHONG TON TAI (%d) ---" % len(notfound))
        for route, ref, ctx in notfound[:args.limit]:
            print("  %-44s %-9s | %s" % (route, ref, ctx))

    if args.apply and written:
        print("\n--- FILE DA GHI ---")
        for name, n in written:
            print("  %-46s +%d link" % (name, n))

    json.dump({"stats": stats, "link_total": total_link,
               "notfound": notfound[:400]},
              open(os.path.join(os.path.dirname(WEB), "link-xref-report.json"), "w",
                   encoding="utf-8"), ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
