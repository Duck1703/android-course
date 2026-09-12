#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kiem chung audit-practice.py biet bao loi cung that su, roi tra file ve nguyen trang.

Sua tam 1 tham chieu 'muc 15' -> 'muc 999' trong mot bai live, chay audit,
khang dinh exit=1 va co bao dung bai do, roi ghi lai noi dung goc.
"""
import subprocess
import sys
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)          # script nam trong web/tools/ -> web la cha
TARGET = os.path.join(WEB, "src", "components", "lessons", "Ch11KeystoreSqlcipherVaMaHoa.astro")
PY = sys.executable
AUDIT = os.path.join(WEB, "tools", "audit-practice.py")

orig = open(TARGET, encoding="utf-8").read()

# QUAN TRONG: phai sua ben TRONG khoi luyen tap. Lan dau toi sua ca file va
# trung mot dong comment o frontmatter (dong 11) -> audit khong thay gi, bao
# sai la audit hong. Gio khoanh dung khoi truoc khi sua.
m = re.search(r'<h2\s+id="(luyen-tap|thu-thach|bai-tap)[^"]*"', orig)
nxt = re.search(r'<h2\s+id="', orig[m.end():])
end = m.end() + nxt.start() if nxt else len(orig)
block = orig[m.start():end]

if "mục 15" not in block:
    print("!! 'mục 15' khong nam trong khoi luyen tap — chon muc khac")
    sys.exit(2)

broken = orig[:m.start()] + block.replace("mục 15", "mục 999") + orig[end:]
assert broken != orig
assert "mục 999" in broken

try:
    open(TARGET, "w", encoding="utf-8").write(broken)
    p = subprocess.run([PY, AUDIT], cwd=WEB, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    out = p.stdout
    ok_exit = p.returncode == 1
    ok_msg = "muc 999" in out and "Ch11KeystoreSqlcipherVaMaHoa" in out
    print("exit code        : %d (mong doi 1)  -> %s" % (p.returncode, "DUNG" if ok_exit else "SAI"))
    print("bao dung bai + so: %s" % ("DUNG" if ok_msg else "SAI"))
    for line in out.splitlines():
        if "999" in line:
            print("   " + line.strip())
finally:
    open(TARGET, "w", encoding="utf-8").write(orig)
    print("\nda tra file ve nguyen trang")

# chay lai cho chac
p2 = subprocess.run([PY, AUDIT], cwd=WEB, capture_output=True, text=True,
                    encoding="utf-8", errors="replace")
print("chay lai sau khi tra: exit=%d (mong doi 0)" % p2.returncode)
sys.exit(0 if (ok_exit and ok_msg and p2.returncode == 0) else 1)
