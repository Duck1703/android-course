#!/usr/bin/env python3
"""
Trich xuat noi dung sach EPUB "Android Fundamentals by Tutorials" ra Markdown.

CHI dung thu vien chuan cua Python (zipfile, xml.etree.ElementTree) -- khong
can cai them gi (khong bs4/lxml/ebooklib). Xem docs/PROJECT_PLAN.md, quyet
dinh #2.

EPUB goc CHI duoc MO O CHE DO DOC (zipfile.ZipFile mode "r") -- script nay
khong bao gio ghi/sua vao file .epub.

Cach dung:
    python scripts/extract_epub.py --list
        Liet ke toan bo muc luc (segment id, tieu de) doc duoc tu EPUB.

    python scripts/extract_epub.py --chapters 1,5
        Trich 2 chapter (1 va 5) ra content/book/ de kiem thu.

    python scripts/extract_epub.py --all
        Trich toan bo chapter + front/back matter (dung o Task 3).
"""
from __future__ import annotations

import argparse
import re
import sys
import zipfile
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
EPUB_PATH = ROOT / "Android_Fundamentals_by_Tutorials_v1.0.0.epub"
OUTPUT_DIR = ROOT / "content" / "book"

XHTML_NS = "http://www.w3.org/1999/xhtml"
OPF_HTML_DIR = "OEBPS/html/"  # noi chua toc.xhtml + seg*.xhtml trong EPUB nay


@dataclass
class TocEntry:
    order: int
    segment: str  # vi du "seg17.xhtml"
    title: str
    section: str  # section sach hien hanh, vi du "Section II: ..."
    chapter_num: int | None  # None neu khong phai 1 chapter (front/back matter)


def local_tag(el: ET.Element) -> str:
    """Bo namespace XHTML khoi ten tag, vi du '{...}h1' -> 'h1'."""
    t = el.tag
    return t.split("}", 1)[1] if t.startswith("{") else t


def parse_toc(zf: zipfile.ZipFile) -> list[TocEntry]:
    """Doc OEBPS/html/toc.xhtml, tra ve danh sach muc luc theo dung thu tu sach."""
    with zf.open(OPF_HTML_DIR + "toc.xhtml") as f:
        tree = ET.parse(f)
    root = tree.getroot()

    entries: list[TocEntry] = []
    current_section = ""
    chapter_re = re.compile(r"^Chapter\s+(\d+):\s*(.+)$")

    for i, li in enumerate(root.iter(f"{{{XHTML_NS}}}li")):
        a = li.find(f"{{{XHTML_NS}}}a")
        if a is None:
            continue
        href = a.get("href", "")
        title = "".join(a.itertext()).strip()
        segment = href.split("#")[0]

        m = chapter_re.match(title)
        if title.startswith("Section"):
            current_section = title
            chapter_num = None
        elif m:
            chapter_num = int(m.group(1))
        else:
            chapter_num = None

        entries.append(TocEntry(i, segment, title, current_section, chapter_num))

    return entries


EMPHASIS_WRAP = {"em": "*", "i": "*", "strong": "**", "b": "**"}


def render_inline(el: ET.Element) -> str:
    """Chuyen noi dung ben trong 1 element (p, li, ...) thanh text Markdown,
    giu dinh dang in dam/nghieng/code, bo link nhung giu text cua link.

    Sach nguon hay chia 1 cum tu thanh nhieu the <em> lien tiep sat nhau
    (vi du <em>MainActivity</em><em>.</em><em>kt</em> de in nghieng ten file).
    Neu wrap tung the mot se ra "*MainActivity**.**kt*" (dau "**" gay
    nham voi in dam). Vi vay cac the em/strong lien tiep, khong co text xen
    giua (tail rong), duoc gop lai thanh 1 cum in nghieng/dam duy nhat.
    """
    parts: list[str] = []
    if el.text:
        parts.append(el.text)

    children = list(el)
    i = 0
    while i < len(children):
        child = children[i]
        tag = local_tag(child)
        if tag in EMPHASIS_WRAP:
            wrap = EMPHASIS_WRAP[tag]
            group = [render_inline(child)]
            j = i
            while (
                not children[j].tail
                and j + 1 < len(children)
                and local_tag(children[j + 1]) == tag
            ):
                j += 1
                group.append(render_inline(children[j]))
            parts.append(f"{wrap}{''.join(group)}{wrap}")
            if children[j].tail:
                parts.append(children[j].tail)
            i = j + 1
            continue

        inner = render_inline(child)
        if tag == "code":
            parts.append(f"`{inner}`")
        elif tag == "br":
            parts.append("\n")
        else:  # a, span, ... -> giu nguyen text, bo thuoc tinh (href, class...)
            parts.append(inner)
        if child.tail:
            parts.append(child.tail)
        i += 1

    return "".join(parts)


def render_note(div: ET.Element, lines: list[str]) -> None:
    """div class="note" -> blockquote Markdown."""
    for child in div:
        if local_tag(child) == "p":
            txt = render_inline(child).strip()
            if txt:
                lines.append(f"> {txt}")
    lines.append("")


def render_image(img: ET.Element, lines: list[str]) -> None:
    src = img.get("src", "")
    alt = img.get("alt") or "Hinh minh hoa"
    lines.append(f"![{alt}]({src})")
    lines.append(
        "<!-- Anh goc nam trong EPUB (OEBPS/html/graphics/), chua duoc copy "
        "sang project o buoc trich xuat nay. -->"
    )
    lines.append("")


def render_block(el: ET.Element, lines: list[str]) -> None:
    tag = local_tag(el)
    css_class = el.get("class", "")

    if tag in ("h1", "h2", "h3", "h4"):
        level = int(tag[1])
        text = render_inline(el).strip()
        if text:
            lines.append(f"{'#' * level} {text}")
            lines.append("")
    elif tag == "p":
        text = render_inline(el).strip()
        if text:
            lines.append(text)
            lines.append("")
    elif tag == "pre" and "code-block" in css_class:
        code = "".join(el.itertext()).rstrip("\n")
        lines.append("```")
        lines.append(code)
        lines.append("```")
        lines.append("")
    elif tag in ("ul", "ol"):
        ordered = tag == "ol"
        n = 1
        for li in el:
            if local_tag(li) != "li":
                continue
            text = render_inline(li).strip()
            prefix = f"{n}. " if ordered else "- "
            lines.append(f"{prefix}{text}")
            if ordered:
                n += 1
        lines.append("")
    elif tag == "img":
        render_image(el, lines)
    elif tag == "div" and "note" in css_class.split():
        render_note(el, lines)
    elif tag in ("div", "section", "header", "body", "html"):
        for child in el:
            render_block(child, lines)
    else:
        # The khac chua gap trong sach (kiem tra Muc 2 cua PROJECT_PLAN/SOURCE_MAP
        # neu thay canh bao nay xuat hien khi chay --all).
        text = render_inline(el).strip()
        if text:
            print(f"  [canh bao] the la '<{tag}>' chua duoc xu ly rieng, "
                  f"dang xuat nhu doan van thuong.", file=sys.stderr)
            lines.append(text)
            lines.append("")


def extract_segment_markdown(zf: zipfile.ZipFile, segment: str) -> str:
    with zf.open(OPF_HTML_DIR + segment) as f:
        tree = ET.parse(f)
    body = tree.getroot().find(f"{{{XHTML_NS}}}body")
    if body is None:
        raise ValueError(f"{segment}: khong tim thay the <body>")

    lines: list[str] = []
    render_block(body, lines)

    # Gop cac dong trong, bo dong trong lien tiep thua
    out: list[str] = []
    for line in lines:
        if line == "" and out and out[-1] == "":
            continue
        out.append(line)
    return "\n".join(out).strip() + "\n"


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def write_entry(zf: zipfile.ZipFile, entry: TocEntry) -> Path:
    body_md = extract_segment_markdown(zf, entry.segment)

    if entry.chapter_num is not None:
        fname = f"ch{entry.chapter_num:02d}-{slugify(entry.title.split(':', 1)[-1])}.md"
    else:
        fname = f"{entry.order:02d}-{slugify(entry.title)}.md"

    frontmatter = [
        "---",
        f'title: "{entry.title}"',
    ]
    if entry.chapter_num is not None:
        frontmatter.append(f"chapter: {entry.chapter_num}")
    if entry.section:
        frontmatter.append(f'section: "{entry.section}"')
    frontmatter += [
        f'source_segment: "OEBPS/html/{entry.segment}"',
        f'source_file: "Android_Fundamentals_by_Tutorials_v1.0.0.epub"',
        f'extracted_at: "{date.today().isoformat()}"',
        "---",
        "",
    ]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / fname
    out_path.write_text("\n".join(frontmatter) + body_md, encoding="utf-8")
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--list", action="store_true", help="Liet ke muc luc, khong ghi file")
    group.add_argument("--chapters", help="Danh sach so chapter, vi du: 1,5")
    group.add_argument("--all", action="store_true", help="Trich toan bo (chapter + front/back matter)")
    args = parser.parse_args()

    if not EPUB_PATH.exists():
        print(f"Khong tim thay EPUB o: {EPUB_PATH}", file=sys.stderr)
        sys.exit(1)

    with zipfile.ZipFile(EPUB_PATH, "r") as zf:
        toc = parse_toc(zf)

        if args.list:
            for e in toc:
                label = f"Chapter {e.chapter_num}" if e.chapter_num else "-"
                print(f"{e.order:2d}  {e.segment:12s}  [{label:11s}]  {e.title}")
            return

        if args.chapters:
            wanted = {int(x) for x in args.chapters.split(",") if x.strip()}
            targets = [e for e in toc if e.chapter_num in wanted]
            missing = wanted - {e.chapter_num for e in targets}
            if missing:
                print(f"Khong tim thay chapter: {sorted(missing)}", file=sys.stderr)
        else:  # --all
            targets = toc

        for entry in targets:
            out_path = write_entry(zf, entry)
            print(f"Da ghi: {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
