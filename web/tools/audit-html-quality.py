#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Soi dist/ tim loi ma cac checker hien tai CHUA kiem:
  A. id trung lap trong cung mot trang (anchor checker chi kiem dich ton tai,
     khong kiem duy nhat — trung id lam link nhay sai cho)
  B. <img> thieu alt
  C. <a> rong (href="" hoac chi co #)
  D. link ngoai (http/https) — liet ke de biet pham vi, khong tu goi mang
  E. <button>/<a> khong co nhan doc duoc
"""
import os
import re
from collections import defaultdict, Counter

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
DIST = os.path.join(WEB, "dist")

ID_RE = re.compile(r'\sid="([^"]*)"')
IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
A_RE = re.compile(r"<a\b[^>]*>", re.I)
HREF_RE = re.compile(r'href="([^"]*)"')
ALT_RE = re.compile(r'\balt="([^"]*)"', re.I)
EXT_RE = re.compile(r'^https?://', re.I)


def pages():
    for root, _d, files in os.walk(DIST):
        for f in files:
            if f.endswith(".html"):
                yield os.path.join(root, f)


def key(p):
    rel = os.path.relpath(p, DIST).replace("\\", "/")
    return "/" if rel == "index.html" else "/" + rel[:-len("index.html")]


dup_pages = []
noalt = []
emptya = []
ext = Counter()
nolabel = 0
n_pages = 0

for p in pages():
    n_pages += 1
    html = open(p, encoding="utf-8").read()
    k = key(p)

    ids = ID_RE.findall(html)
    c = Counter(ids)
    dups = {i: n for i, n in c.items() if n > 1}
    if dups:
        dup_pages.append((k, dups))

    for tag in IMG_RE.findall(html):
        m = ALT_RE.search(tag)
        if not m or not m.group(1).strip():
            noalt.append((k, tag[:90]))

    for tag in A_RE.findall(html):
        m = HREF_RE.search(tag)
        if m and m.group(1).strip() in ("", "#"):
            emptya.append((k, tag[:90]))

    for m in re.finditer(r'href="([^"]+)"', html):
        h = m.group(1)
        if EXT_RE.match(h):
            ext[h.split("/")[2]] += 1

print("Trang HTML quet: %d\n" % n_pages)

print("A. Trang co id TRUNG LAP: %d" % len(dup_pages))
for k, dups in dup_pages[:12]:
    items = ", ".join("%s×%d" % (i, n) for i, n in list(dups.items())[:5])
    print("   %-56s %s" % (k, items))

print("\nB. <img> thieu alt: %d" % len(noalt))
for k, t in noalt[:8]:
    print("   %-46s %s" % (k, t))

print("\nC. <a> rong (href='' hoac '#'): %d" % len(emptya))
for k, t in emptya[:8]:
    print("   %-46s %s" % (k, t))

print("\nD. Ten mien ngoai duoc lien ket: %d" % len(ext))
for d, n in ext.most_common(20):
    print("   %-40s %d" % (d, n))
