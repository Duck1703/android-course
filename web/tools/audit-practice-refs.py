#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kiem bai tap co tham chieu ma KHONG he xuat hien trong bai khong.

Y tuong: bai tap viet theo khuon "mo file X, sua ham Y, ban phai thay Z". Neu Y
hay Z khong xuat hien o dau trong bai hoc, nguoi hoc se di tim mot thu khong co
— hoac bai tap lech voi noi dung bai.

CANH BAO VE DO TIN CAY: day la tin hieu DE XEM XET, khong phai ket luan.
Bai tap CO Y gioi thieu ten moi (vd 'viet ham ChaoBanDoc()') thi viec ten do
khong co trong bai la DUNG. Vi vay script chi in ra de nguoi doc tu phan doan,
khong tu ket luan dung/sai, va khong dung lam cong CI.

Chay tu web/:  python tools/audit-practice-refs.py
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
LESSONS = os.path.join(WEB, "src", "components", "lessons")
LESSONS_TS = os.path.join(WEB, "src", "data", "lessons.ts")

START = re.compile(r'<h2\s+id="(luyen-tap|thu-thach|bai-tap)[^"]*"')
NEXT_H2 = re.compile(r'<h2\s+id="')
CHAL = re.compile(r'<div class="chal">([\s\S]*?)</div>')
H3 = re.compile(r"<h3[^>]*>([\s\S]*?)</h3>")
CODE = re.compile(r"<code>([\s\S]*?)</code>")


def live():
    src = open(LESSONS_TS, encoding="utf-8").read()
    names = re.findall(r'"[a-z0-9-]+"\s*:\s*\{\s*Lesson:\s*([A-Za-z0-9_]+)', src)
    return sorted(set(n + ".astro" for n in names))


def clean(s):
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("&#123;", "{").replace("&#125;", "}").replace("&lt;", "<").replace("&gt;", ">")
    s = s.replace("&amp;", "&").replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", s).strip()


# token dang "ma": bat dau bang chu, co it nhat 4 ky tu, khong phai tu tieng Viet thuong
IDENT = re.compile(r"[A-Za-z_][A-Za-z0-9_]{3,}")
# tu tieng Viet / tu tieng Anh pho thong hay xuat hien trong <code> ma khong phai dinh danh
STOP = set("""
file code app project ham class function view state data text button image layout xml
android compose kotlin gradle build debug release emulator device settings storage
true false null return val var fun class object import package private public
""".split())

rows = []
for name in live():
    path = os.path.join(LESSONS, name)
    if not os.path.exists(path):
        continue
    html = open(path, encoding="utf-8").read()
    m = START.search(html)
    if not m:
        continue
    nxt = NEXT_H2.search(html, m.end())
    end = nxt.start() if nxt else len(html)
    block = html[m.start():end]
    lesson_wo_block = html[: m.start()] + html[end:]

    chals = CHAL.findall(block)
    for i, body in enumerate(chals, 1):
        h3 = H3.search(body)
        title = clean(h3.group(1)) if h3 else "(khong co tieu de)"
        toks = set()
        for c in CODE.findall(body):
            for t in IDENT.findall(clean(c)):
                if t.lower() not in STOP and not t.isupper():
                    toks.add(t)
        if not toks:
            continue
        missing = sorted(t for t in toks if t not in lesson_wo_block)
        if missing and len(missing) >= max(1, len(toks) // 2):
            rows.append((len(missing), len(toks), name, i, title, missing))

rows.sort(reverse=True)
print("Bai tap co >= 1/2 so dinh danh KHONG xuat hien o phan con lai cua bai: %d\n" % len(rows))
for n_miss, n_tok, name, i, title, missing in rows:
    print("-" * 72)
    print("%s  bai %d" % (name, i))
    print("  tieu de : %s" % title[:88])
    print("  thieu   : %d/%d dinh danh -> %s" % (n_miss, n_tok, ", ".join(missing[:10])))
print()
print("(Tin hieu de xem xet, KHONG phai ket luan — bai tap co y gioi thieu ten moi la binh thuong.)")
