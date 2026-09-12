#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check-anchors.py — kiem MOI lien ket noi bo trong dist/ co tro toi dich that khong.

Vi sao can: hang tram the <a href="#..."> duoc sinh tu dong (xem link-xref.py).
Neu anchor sai thi nguoi hoc bam vao khong co gi xay ra — ma build VAN XANH,
khong co gi bao. Day la lop loi im lang thu hai, sau lop dau ngoac { }.

Kiem ba loai:
  1. href="#x"                -> id="x" phai co trong CUNG trang
  2. href="/chapters/<r>/#x"  -> id="x" phai co trong dist/chapters/<r>/index.html
  3. href="/#x" / "/<r>/#x"   -> tuong tu, tinh tu goc dist/

Bo qua: href ngoai (http/https/mailto), href khong co phan #.

Chay (tu web/): python tools/check-anchors.py     [sau khi build]
"""
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(os.path.dirname(HERE), "dist")

ID_RE = re.compile(r'\sid="([^"]+)"')
HREF_RE = re.compile(r'href="([^"]+)"')


def page_key(path):
    """dist/chapters/x/index.html -> /chapters/x/ ; dist/index.html -> /"""
    rel = os.path.relpath(path, DIST).replace("\\", "/")
    if rel == "index.html":
        return "/"
    if rel.endswith("/index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


def iter_pages():
    for root, _dirs, files in os.walk(DIST):
        for f in files:
            if f.endswith(".html"):
                yield os.path.join(root, f)


def main():
    if not os.path.isdir(DIST):
        print("!! chua co dist/ — chay build truoc")
        return 2

    pages = {}
    for p in iter_pages():
        try:
            html = open(p, encoding="utf-8").read()
        except UnicodeDecodeError:
            continue
        pages[page_key(p)] = set(ID_RE.findall(html))

    print("check-anchors: %d trang HTML" % len(pages))

    broken = defaultdict(list)
    total = 0
    for p in iter_pages():
        try:
            html = open(p, encoding="utf-8").read()
        except UnicodeDecodeError:
            continue
        here = page_key(p)
        for href in HREF_RE.findall(html):
            if "#" not in href:
                continue
            if re.match(r"^[a-z]+:", href, re.I):   # http, mailto, tel...
                continue
            path, _, frag = href.partition("#")
            if not frag:
                continue
            total += 1
            target = here if path == "" else path
            if target not in pages:
                broken[here].append((href, "trang dich khong ton tai: %s" % target))
            elif frag not in pages[target]:
                broken[here].append((href, "khong co id='%s' trong %s" % (frag, target)))

    n_broken = sum(len(v) for v in broken.values())
    print("  lien ket noi bo : %d" % total)
    print("  anchor hong     : %d" % n_broken)

    if broken:
        print("\n--- ANCHOR HONG ---")
        for page in sorted(broken):
            print("\n%s" % page)
            seen = set()
            for href, why in broken[page]:
                if (href, why) in seen:
                    continue
                seen.add((href, why))
                print("   %-46s %s" % (href, why))
        return 1

    print("\nTAT CA ANCHOR DEU TON TAI")
    return 0


if __name__ == "__main__":
    sys.exit(main())
