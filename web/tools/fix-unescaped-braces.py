#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix-unescaped-braces.py — Sua dau ngoac nhon rong trong <code> cua bai hoc.

VAN DE
------
Trong Astro, `{` trong template la bat dau mot bieu thuc JS. Neu viet
`<code>item { }</code>` nhu van ban thuong, Astro coi `{ }` la object rong va
render ra CHUOI RONG. Ket qua: trang hien `<code>item </code>` — mat dau ngoac,
nhung build van XANH nen khong ai phat hien.

HAI CACH VIET DUNG (da co trong khoa)
-------------------------------------
1. HTML entity : <code>item &#123; &#125;</code>
2. Bieu thuc Astro chua chuoi: <code>android {'{ }'}</code>   (dung o Ch04)

Script nay chuyen het cac cho viet sai sang cach 1, va BO QUA cac cho da dung.

Chay:
  python tools/fix-unescaped-braces.py            # dry-run
  python tools/fix-unescaped-braces.py --apply    # ghi file
"""
import re
import os
import sys
import argparse

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
LESSONS_DIR = os.path.join(WEB, "src", "components", "lessons")
LESSONS_TS = os.path.join(WEB, "src", "data", "lessons.ts")

FM_RE = re.compile(r"^---[\s\S]*?---", re.M)
INLINE_CODE_RE = re.compile(r"(<code>)([\s\S]*?)(</code>)", re.I)
# { } hoac {} — nhom 1 la khoang trang ben trong
EMPTY_BRACES_RE = re.compile(r"\{(\s*)\}")


def live_names():
    src = open(LESSONS_TS, encoding="utf-8").read()
    return re.findall(r'"[a-z0-9-]+"\s*:\s*\{\s*Lesson:\s*([A-Za-z0-9_]+)', src)


def fix_code_inner(inner):
    """Tra ve (noi_dung_moi, so_lan_sua). Khong dung toi cho da viet dung."""
    # da dung kieu bieu thuc Astro chua chuoi -> bo qua
    if re.search(r"['\"]\{", inner) or re.search(r"\}['\"]", inner):
        return inner, 0
    n = 0

    def repl(m):
        nonlocal n
        n += 1
        return "&#123;" + m.group(1) + "&#125;"

    return EMPTY_BRACES_RE.sub(repl, inner), n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    names = live_names()
    total = 0
    files = 0

    for name in names:
        path = os.path.join(LESSONS_DIR, name + ".astro")
        if not os.path.exists(path):
            continue
        raw = open(path, encoding="utf-8").read()
        fm = FM_RE.search(raw)
        cut = fm.end() if fm else 0
        head, body = raw[:cut], raw[cut:]

        hits = []

        def repl_code(m):
            new_inner, n = fix_code_inner(m.group(2))
            if n:
                line = head.count("\n") + body[:m.start()].count("\n") + 1
                hits.append((line, m.group(2).strip()[:60], new_inner.strip()[:60]))
            return m.group(1) + new_inner + m.group(3)

        new_body = INLINE_CODE_RE.sub(repl_code, body)

        if not hits:
            continue

        files += 1
        total += len(hits)
        print("%s.astro" % name)
        for line, before, after in hits:
            print("  d.%-5d %-42s -> %s" % (line, before, after))

        if args.apply:
            open(path, "w", encoding="utf-8").write(head + new_body)

    print("\n%d cho trong %d file %s" % (
        total, files, "DA SUA" if args.apply else "(dry-run, them --apply)"))


if __name__ == "__main__":
    main()
