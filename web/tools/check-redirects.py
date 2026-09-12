#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kiem 8 trang redirect (URL cu cua sach) co tro toi trang CON THAT khong.

Trang redirect song chi de nguoi da luu bookmark cu khong bi 404. Neu dich cua
no bi doi ten ma khong ai cap nhat, redirect tro vao hu khong — va khong co
checker nao bat duoc, vi do la <meta refresh>, khong phai <a href>.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
DIST = os.path.join(WEB, "dist")

META = re.compile(r'http-equiv="refresh"\s+content="[^;]*;\s*url=([^"\s]+)"', re.I)


def page_key(path):
    rel = os.path.relpath(path, DIST).replace("\\", "/")
    return "/" if rel == "index.html" else "/" + rel[:-len("index.html")]


pages = set()
files = []
for root, _d, fs in os.walk(DIST):
    for f in fs:
        if f.endswith(".html"):
            p = os.path.join(root, f)
            files.append(p)
            pages.add(page_key(p))

found = 0
bad = []
for p in files:
    html = open(p, encoding="utf-8").read()
    for target in META.findall(html):
        found += 1
        if target not in pages:
            bad.append((page_key(p), target))

print("Trang redirect tim duoc : %d" % found)
print("Redirect tro sai dich   : %d" % len(bad))
for src, t in bad:
    print("   %-46s -> %s  (khong ton tai)" % (src, t))

if not bad and found:
    print("\nTAT CA REDIRECT DEU TRO TOI TRANG CO THAT")
