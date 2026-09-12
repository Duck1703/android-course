#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tim cac <p> qua dai trong 48 bai live, va cho biet cau truc cau ben trong.

Y tuong: neu doan dai nhung da co san cac "moc" ro rang (Vi sao / Cach chua /
Nghia la / Vi du...), thi chi can tach thanh nhieu <p> — KHONG doi mot chu nao.
Do la sua trinh bay, khong phai sua van phong.
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
LESSONS = os.path.join(WEB, "src", "components", "lessons")
LESSONS_TS = os.path.join(WEB, "src", "data", "lessons.ts")

LIMIT = 180  # tu

# moc mo dau cau thuong gap trong bai nay
MARKERS = [
    "Vì sao", "Vì thế", "Cách chữa", "Nghĩa là", "Điều này", "Đây là",
    "Nhưng", "Còn ", "Nếu ", "Khi ", "Sau đó", "Rồi ", "Bởi ", "Thực ra",
    "Điểm mấu chốt", "Hệ quả", "Lưu ý", "Tóm lại", "Vậy ",
]


def live():
    src = open(LESSONS_TS, encoding="utf-8").read()
    names = re.findall(r'"[a-z0-9-]+"\s*:\s*\{\s*Lesson:\s*([A-Za-z0-9_]+)', src)
    return set(n + ".astro" for n in names)


def text_of(p):
    t = re.sub(r"<[^>]+>", " ", p)
    t = t.replace("&amp;", "&").replace("&nbsp;", " ").replace("&#123;", "{").replace("&#125;", "}")
    return re.sub(r"\s+", " ", t).strip()


found = []
for name in sorted(live()):
    path = os.path.join(LESSONS, name)
    if not os.path.exists(path):
        continue
    html = open(path, encoding="utf-8").read()
    # bo frontmatter + style/script
    html = re.sub(r"^---[\s\S]*?---", "", html, count=1)
    html = re.sub(r"<style[\s\S]*?</style>", "", html)
    html = re.sub(r"<script[\s\S]*?</script>", "", html)
    for m in re.finditer(r"<p(?![a-z])[^>]*>([\s\S]*?)</p>", html):
        body = m.group(1)
        if "<" in body and re.search(r"<(div|p|table|ul|ol)\b", body):
            continue
        t = text_of(body)
        n = len(t.split())
        if n >= LIMIT:
            line = html[: m.start()].count("\n") + 1
            # dem so cau va cac moc xuat hien
            sents = [s for s in re.split(r"(?<=[.!?])\s+", t) if s.strip()]
            hits = [k for k in MARKERS if (" " + k) in t or t.startswith(k)]
            found.append((n, name, line, len(sents), hits, t))

found.sort(reverse=True)
print("Doan <p> >= %d tu trong 48 bai live: %d\n" % (LIMIT, len(found)))
for n, name, line, ns, hits, t in found:
    print("-" * 72)
    print("%s  dong %d" % (name, line))
    print("  %d tu / %d cau  |  moc: %s" % (n, ns, ", ".join(hits) if hits else "(khong)"))
    print("  mo dau: %s" % t[:150])
    print("  ket   : %s" % t[-120:])
