"""
Convert Crimean Karaites/crimea.html to site/data/texts/crimean-karaites.json.

Linear English monograph with inline figures. Renders in the standard reader.

Layout:
  sections.intro       Frontmatter + Acknowledgments + Introduction
  sections.text        Chapter 1 + Chapter 2 + Chapter 3 + Conclusion
  sections.appendices  List of Abbreviations + Bibliography
  toc                  Auto-generated from h1/h2/h3 with stable section_id anchors

Images: all figures in site/assets/crimea/*.jpg at max 1600px q85 via macOS `sips`.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from html.parser import HTMLParser


REPO = os.path.dirname(os.path.abspath(__file__))
SRC_HTML = os.path.join(REPO, "Crimean Karaites", "crimea.html")
SRC_DIR = os.path.join(REPO, "Crimean Karaites")
OUT_JSON = os.path.join(REPO, "site", "data", "texts", "crimean-karaites.json")
ASSETS_DIR = os.path.join(REPO, "site", "assets", "crimea")
ASSETS_URL_PREFIX = "assets/crimea"

# Source images we deliberately drop from the rendered book (branding/imprint
# assets that don't belong in the reader).
SKIP_IMAGE_BASENAMES = {"ariel-university.jpeg"}

TEXT_ID = "crimean-karaites"
TITLE_EN = "Crimean Karaites"
CATEGORY = "General"


# ------------------------------------------------------------------ tokenizer

class Tokenizer(HTMLParser):
    VOID = {"img", "br", "hr", "meta", "link", "input"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.events: list[tuple] = []

    def handle_starttag(self, tag, attrs):
        d = {k: v for k, v in attrs}
        if tag in self.VOID:
            self.events.append(("void", tag, d))
        else:
            self.events.append(("open", tag, d))

    def handle_startendtag(self, tag, attrs):
        d = {k: v for k, v in attrs}
        self.events.append(("void", tag, d))

    def handle_endtag(self, tag):
        self.events.append(("close", tag))

    def handle_data(self, data):
        if data:
            self.events.append(("text", data))


def tokenize(src: str) -> list[tuple]:
    t = Tokenizer()
    t.feed(src)
    return t.events


def find_matching_close(events, start):
    tag = events[start][1]
    depth = 1
    i = start + 1
    while i < len(events):
        ev = events[i]
        if ev[0] == "open" and ev[1] == tag:
            depth += 1
        elif ev[0] == "close" and ev[1] == tag:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError(f"Unmatched <{tag}> at {start}")


# --------------------------------------------------------------- inline text

def render_inline(events, start):
    """events[start] is 'open'. Return (rendered_text, index_of_matching_close)."""
    assert events[start][0] == "open"
    root_tag = events[start][1]
    depth = 1
    i = start + 1
    out = []
    while i < len(events) and depth > 0:
        ev = events[i]
        kind = ev[0]
        if kind == "open":
            tag = ev[1]
            attrs = ev[2]
            cls = (attrs.get("class") or "").strip()
            # Footnote reference: <sup class="fnref"><a href="#fnN">DISPLAY </a></sup>
            if tag == "sup" and cls == "fnref":
                display, end = _consume_fnref(events, i)
                if display:
                    out.append(f"{{{{fn:{display}}}}}")
                i = end + 1
                continue
            # Index anchors: <a class="idx" id="idxN"></a> — always empty, drop it
            if tag == "a" and cls == "idx":
                end = find_matching_close(events, i)
                i = end + 1
                continue
            # Footnote back-link: <a class="fnback" href="#fnrefN">↩</a>
            if tag == "a" and cls == "fnback":
                end = find_matching_close(events, i)
                i = end + 1
                continue
            depth += 1
            # <em>/<i>
            if tag in ("em", "i"):
                inner, end = render_inline(events, i)
                inner = re.sub(r"\{\{em:([^}]*)\}\}", r"\1", inner)  # flatten
                lead = " " if inner and inner[0].isspace() else ""
                trail = " " if inner and inner[-1].isspace() else ""
                inner = inner.strip()
                if inner:
                    out.append(f"{lead}{{{{em:{inner}}}}}{trail}")
                depth -= 1
                i = end + 1
                continue
            # <span class="sc"> — small caps
            if tag == "span" and cls == "sc":
                inner, end = render_inline(events, i)
                inner = inner.strip()
                if inner:
                    out.append("{{sc:" + inner + "}}")
                depth -= 1
                i = end + 1
                continue
            # <span dir="rtl"> — Hebrew snippet
            if tag == "span" and attrs.get("dir") == "rtl":
                inner, end = render_inline(events, i)
                inner = inner.strip()
                if inner:
                    out.append("{{he:" + inner + "}}")
                depth -= 1
                i = end + 1
                continue
            # <s>strike</s>, <sub>, <sup> non-fnref, <span> other — just take inner text
            if tag in ("s", "sub", "sup", "span", "small", "b", "strong"):
                inner, end = render_inline(events, i)
                if tag in ("strong", "b"):
                    inner = inner.strip()
                    if inner:
                        out.append("**" + inner + "**")
                elif tag == "span" and not cls and not attrs.get("dir"):
                    # Bare <span> often used as an inline delimiter/abbreviation
                    # in list items (`<span>HC</span>Harkavy Collection`).
                    # Always add a trailing space; postprocess collapses runs.
                    inner_r = inner.rstrip()
                    out.append(inner_r + " " if inner_r else inner)
                else:
                    out.append(inner)
                depth -= 1
                i = end + 1
                continue
            # Plain anchor: preserve inner text
            if tag == "a":
                inner, end = render_inline(events, i)
                out.append(inner)
                depth -= 1
                i = end + 1
                continue
            # Unknown inline: keep inner
            inner, end = render_inline(events, i)
            out.append(inner)
            depth -= 1
            i = end + 1
            continue
        if kind == "close":
            if ev[1] == root_tag:
                depth -= 1
                if depth == 0:
                    return _postprocess_inline("".join(out)), i
            i += 1
            continue
        if kind == "void":
            if ev[1] == "br":
                out.append("\n")
            i += 1
            continue
        if kind == "text":
            out.append(ev[1])
            i += 1
            continue
        i += 1
    return _postprocess_inline("".join(out)), i - 1


def _consume_fnref(events, start):
    """Given events[start] is <sup class="fnref">, find the DISPLAY number of the
    enclosed <a href="#fnN">DISPLAY </a> and return (display_str, index_of_</sup>)."""
    end = find_matching_close(events, start)
    display = ""
    i = start + 1
    while i < end:
        ev = events[i]
        if ev[0] == "open" and ev[1] == "a":
            a_end = find_matching_close(events, i)
            j = i + 1
            parts = []
            while j < a_end:
                if events[j][0] == "text":
                    parts.append(events[j][1])
                j += 1
            display = "".join(parts).strip()
            break
        i += 1
    # Display sometimes has a trailing space; strip whitespace
    display = display.strip()
    return display, end


def _postprocess_inline(text):
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        line = re.sub(r"[ \t\r]+", " ", line).strip()
        cleaned.append(line)
    text = "\n".join(cleaned).strip()
    # Strip stray LaTeX spacing artifacts (`to15pt`, `to12pt`, etc.) that the
    # source ebook left in the body copy. They abut real text, so replace with
    # a single space and collapse any doubled spaces.
    text = re.sub(r"\s*to\d+pt\s*", " ", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    # If a trailing whitespace inside <i>...</i> got trimmed away, restore a
    # single space between an em wrapper and the character that follows it.
    text = re.sub(r"(\}\})([A-Za-z0-9(\[])", r"\1 \2", text)
    return text


# ------------------------------------------------------------------ footnotes

def parse_footnotes(events):
    """Return { "DISPLAY": "note text" }. Source uses fn2..fn359 for display 1..N.
    We first collect { source_id: text }, then build display map by walking body sups."""
    src_notes = {}
    for i, ev in enumerate(events):
        if ev[0] == "open" and ev[1] == "section" and (ev[2].get("class") or "").strip() == "footnotes":
            end = find_matching_close(events, i)
            j = i + 1
            while j < end:
                ev2 = events[j]
                if ev2[0] == "open" and ev2[1] == "li":
                    fid = (ev2[2].get("id") or "").strip()
                    m = re.match(r"fn(\d+)$", fid)
                    if m:
                        source_id = m.group(1)
                        text, li_end = render_inline(events, j)
                        text = text.replace("\u21a9", "").strip()
                        src_notes[source_id] = text
                        j = li_end + 1
                        continue
                j += 1
            break

    # Build display map by scanning body sups
    display_map = {}  # display_num -> note_text
    for i, ev in enumerate(events):
        if ev[0] == "open" and ev[1] == "sup" and (ev[2].get("class") or "").strip() == "fnref":
            display, _ = _consume_fnref(events, i)
            # Find href of enclosed <a>
            end = find_matching_close(events, i)
            j = i + 1
            while j < end:
                aa = events[j]
                if aa[0] == "open" and aa[1] == "a":
                    href = (aa[2].get("href") or "")
                    m = re.match(r"#fn(\d+)", href)
                    if m and display:
                        source_id = m.group(1)
                        if source_id in src_notes:
                            display_map[display] = src_notes[source_id]
                    break
                j += 1
    return display_map


# ------------------------------------------------------------------ body walk


def parse_body(events):
    """Walk <body> and emit a flat list of block dicts."""
    body_start = body_end = None
    for i, ev in enumerate(events):
        if ev[0] == "open" and ev[1] == "body":
            body_start = i
        elif ev[0] == "close" and ev[1] == "body":
            body_end = i
            break
    if body_start is None:
        raise ValueError("No <body>")

    blocks = []
    i = body_start + 1
    while i < (body_end or len(events)):
        ev = events[i]
        if ev[0] == "open":
            tag = ev[1]
            attrs = ev[2]
            cls = (attrs.get("class") or "").strip()

            # Skip TOC and footnotes section
            if tag == "nav" and cls == "toc":
                i = find_matching_close(events, i) + 1
                continue
            if tag == "section" and cls == "footnotes":
                i = find_matching_close(events, i) + 1
                continue

            if tag in ("h1", "h2", "h3", "h4"):
                text, end = render_inline(events, i)
                blocks.append({
                    "kind": "h",
                    "level": int(tag[1]),
                    "text": text,
                    "id": attrs.get("id", ""),
                })
                i = end + 1
                continue

            if tag == "p":
                end = find_matching_close(events, i)
                # Extract any embedded <img> tags first; they get emitted as
                # separate img blocks. Then render the remaining inline text.
                embedded_imgs = []
                j = i + 1
                while j < end:
                    ev2 = events[j]
                    if ev2[0] == "void" and ev2[1] == "img":
                        src = (ev2[2].get("src") or "").strip()
                        if src and os.path.basename(src).lower() not in SKIP_IMAGE_BASENAMES:
                            embedded_imgs.append(src)
                    j += 1
                text, _ = render_inline(events, i)
                for src in embedded_imgs:
                    blocks.append({"kind": "img", "src": src})
                if text:
                    if cls == "frontmatter":
                        blocks.append({"kind": "frontmatter", "text": text})
                    elif cls == "signature":
                        blocks.append({"kind": "signature", "text": text})
                    else:
                        blocks.append({"kind": "p", "text": text})
                i = end + 1
                continue

            if tag == "blockquote":
                inner, end = render_inline(events, i)
                blocks.append({"kind": "blockquote", "text": inner})
                i = end + 1
                continue

            if tag in ("ul", "ol"):
                items, end = _parse_list(events, i)
                blocks.append({"kind": tag, "items": items})
                i = end + 1
                continue

            # Skip other containers: recurse into by advancing
            i += 1
            continue

        if ev[0] == "void":
            if ev[1] == "img":
                src = (ev[2].get("src") or "").strip()
                if src:
                    blocks.append({"kind": "img", "src": src})
            i += 1
            continue

        i += 1
    return blocks


def _paragraph_image_only(events, start, end):
    """Return the img src if this <p> contains exactly one <img> and no meaningful text."""
    img_src = None
    j = start + 1
    while j < end:
        ev = events[j]
        if ev[0] == "void" and ev[1] == "img":
            if img_src is not None:
                return None
            img_src = (ev[2].get("src") or "").strip()
        elif ev[0] == "text":
            if ev[1].strip():
                return None
        elif ev[0] == "open":
            # nested open tags — probably not image-only unless empty children
            # allow class=idx empty spans through
            pass
        j += 1
    return img_src


def _parse_list(events, start):
    """Parse <ul>/<ol> into a flat list of item text strings. Returns (items, close_index)."""
    end = find_matching_close(events, start)
    items = []
    j = start + 1
    while j < end:
        ev = events[j]
        if ev[0] == "open" and ev[1] == "li":
            text, li_end = render_inline(events, j)
            if text:
                items.append(text)
            j = li_end + 1
            continue
        j += 1
    return items, end


# ---------------------------------------------------- section classification

# The book's structure:
#   XXX1  Acknowledgments        -> intro
#   XXX2  Introduction           -> intro
#   XXX3  Chapter 1              -> text
#   XXX11 Chapter 2              -> text
#   XXX27 Chapter 3              -> text
#   XXX35 Conclusion             -> text
#   XXX36 List of Abbreviations  -> appendices
#   XXX37 Bibliography           -> appendices
#
# Anything before XXX1 (title-page frontmatter) also goes to intro.

INTRO_STARTS = {"XXX1", "XXX2"}
TEXT_STARTS = {"XXX3", "XXX11", "XXX27", "XXX35"}
APPENDIX_STARTS = {"XXX36", "XXX37"}


def classify(blocks):
    intro_blocks, text_blocks, apx_blocks = [], [], []
    current = "intro"  # everything before first anchored h1 is frontmatter -> intro
    for b in blocks:
        if b["kind"] == "h":
            hid = b.get("id", "")
            if hid in INTRO_STARTS:
                current = "intro"
            elif hid in TEXT_STARTS:
                current = "text"
            elif hid in APPENDIX_STARTS:
                current = "appendix"
        if current == "intro":
            intro_blocks.append(b)
        elif current == "text":
            text_blocks.append(b)
        else:
            apx_blocks.append(b)
    return intro_blocks, text_blocks, apx_blocks


# ---------------------------------------------------------------- rendering

def slugify_heading(text, hid):
    """Return a stable section_id. Prefer the source XXX-id if any."""
    if hid:
        return hid.lower().replace("_", "-")
    # Fallback: strip markers and slug the text
    s = re.sub(r"\{\{[^}]*\}\}", "", text)
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "sec"


IMG_EXT_RE = re.compile(r"\.(png|jpg|jpeg|webp)$", re.IGNORECASE)


def image_target(src):
    """Return the on-disk target URL under assets/crimea/, always .jpg."""
    base = os.path.basename(src)
    base_noext = IMG_EXT_RE.sub("", base)
    return f"{ASSETS_URL_PREFIX}/{base_noext}.jpg"


def blocks_to_entries(blocks, notes, running_caption_next=False):
    """Convert flat block list into the site's paragraph entry shape.
    Returns list of dicts suitable for sections.<section>.content.

    Post-processing rules:
      - Image blocks -> figure entries with caption merged from the next frontmatter <p>
        that immediately follows (courtesy captions).
      - Consecutive frontmatter <p>s inside intro stay as separate frontmatter entries.
      - Blockquote -> single paragraph with {{quote:...}} wrapper.
      - Heading -> paragraph with {{header:...}} (level 1) or {{h2:...}}/{{h3:...}} (levels 2-3);
        section_id set on the entry.
      - Attach any {{fn:N}} present in a paragraph to a `comments` field of the SAME entry.
    """
    entries = []
    i = 0
    n = len(blocks)
    while i < n:
        b = blocks[i]
        kind = b["kind"]

        if kind == "h":
            level = b["level"]
            text = b["text"].strip()
            # If the whole heading is wrapped in {{sc:...}}, unwrap it. The
            # heading marker owns its own font styling; nesting braces breaks
            # formatText's non-greedy regex.
            m_sc = re.match(r"^\{\{sc:(.+)\}\}$", text, re.DOTALL)
            if m_sc:
                text = m_sc.group(1).strip()
            sec_id = slugify_heading(text, b.get("id", ""))
            if level <= 1:
                marker = f"{{{{header:{text}}}}}"
            else:
                marker = f"{{{{h{level}:{text}}}}}"
            entry = _english_only_entry(marker, notes, section_id=sec_id)
            entries.append(entry)
            i += 1
            continue

        if kind == "img":
            src = b["src"]
            fname = os.path.basename(src).lower()
            image_url = f"{ASSETS_URL_PREFIX}/{IMG_EXT_RE.sub('', os.path.basename(src))}.jpg"
            caption = ""
            # Never merge captions for frontmatter branding images (title page,
            # publisher/sponsor logo). Their neighbors are real body text.
            is_branding = fname in ("titre.png", "ariel-university.jpeg")
            # Real figures typically have a short <p> or <p class="frontmatter"> right
            # after them containing the caption. Merge if the next block is short.
            if not is_branding and i + 1 < n and blocks[i + 1]["kind"] in ("p", "frontmatter"):
                nxt_text = blocks[i + 1]["text"].strip()
                if _looks_like_caption(nxt_text):
                    caption = nxt_text
                    i += 1
                    # Some captions run across two frontmatter <p> siblings
                    # (courtesy note follows the descriptive line). Merge one more.
                    if i + 1 < n and blocks[i + 1]["kind"] == "frontmatter":
                        nxt2 = blocks[i + 1]["text"].strip()
                        if nxt2.startswith("(") and len(nxt2) < 200:
                            caption += " " + nxt2
                            i += 1
            entries.append({
                "hebrew": "",
                "transliteration": "",
                "english": "",
                "english_only": True,
                "figure": True,
                "image": image_url,
                "caption": caption,
            })
            i += 1
            continue

        if kind == "frontmatter":
            text = b["text"].strip()
            if text:
                entries.append(_english_only_entry(f"{{{{frontmatter:{text}}}}}", notes))
            i += 1
            continue

        if kind == "signature":
            text = b["text"].strip()
            entries.append(_english_only_entry(f"{{{{center:{text}}}}}", notes))
            i += 1
            continue

        if kind == "blockquote":
            text = b["text"].strip()
            entry = _english_only_entry(text, notes)
            entry["blockquote"] = True
            entries.append(entry)
            i += 1
            continue

        if kind == "p":
            text = b["text"].strip()
            if text:
                entries.append(_english_only_entry(text, notes))
            i += 1
            continue

        if kind in ("ul", "ol"):
            # Emit as one paragraph per list item, marked with bullet
            for item in b.get("items", []):
                prefix = "• " if kind == "ul" else ""
                entries.append(_english_only_entry(prefix + item, notes))
            i += 1
            continue

        i += 1
    return entries


def _looks_like_caption(text):
    """A caption is a short line that describes an image. Reject long body text."""
    if not text:
        return False
    lower = text.lower()
    if any(k in lower for k in ("isbn", "all rights reserved", "book was published",
                                 "cover picture", "design & layout", "the karaite press")):
        return False
    return len(text) <= 300


def _english_only_entry(text, notes, section_id=None):
    """Build an entry with english_only:true, attaching any referenced footnotes as comments."""
    entry = {
        "hebrew": "",
        "transliteration": "",
        "english": text,
        "english_only": True,
    }
    if section_id:
        entry["section_id"] = section_id
    refs = sorted({m.group(1) for m in re.finditer(r"\{\{fn:(\d+)\}\}", text)},
                  key=int)
    if refs:
        parts = []
        for r in refs:
            if r in notes:
                parts.append(f"[{r}] {notes[r]}")
        if parts:
            entry["comments"] = " | ".join(parts)
    return entry


HEADING_RE = re.compile(r"^\{\{(header|h2|h3|h4):(.+)\}\}$", re.DOTALL)


def build_toc(text_entries, intro_entries=None, appendix_entries=None):
    """TOC entries are exactly the paragraphs whose english is a single heading marker."""
    toc = []

    def add_from(entries, section_name):
        for e in entries or []:
            eng = (e.get("english") or "").strip()
            m = HEADING_RE.match(eng)
            if not m:
                continue
            marker = m.group(1)
            label = m.group(2).strip()
            level = 1 if marker == "header" else int(marker[1])
            # Unwrap common inline markers used inside headings
            label = re.sub(r"\{\{sc:([^}]*)\}\}", r"\1", label)
            label = re.sub(r"\{\{em:([^}]*)\}\}", r"\1", label)
            toc.append({
                "label": label,
                "level": level,
                "section_id": e.get("section_id", ""),
                "section": section_name,
            })

    add_from(intro_entries, "intro")
    add_from(text_entries, "text")
    add_from(appendix_entries, "appendices")
    return toc


# --------------------------------------------------------- image conversion

def convert_images(src_dir, out_dir, max_dim=1600, quality=85, skip=False):
    if skip:
        print("skipping image conversion (--skip-images)")
        return
    os.makedirs(out_dir, exist_ok=True)
    exts = (".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG")
    converted = 0
    for fname in sorted(os.listdir(src_dir)):
        if not fname.endswith(exts):
            continue
        if fname.lower() in SKIP_IMAGE_BASENAMES:
            continue
        src = os.path.join(src_dir, fname)
        base_noext = IMG_EXT_RE.sub("", fname)
        dst = os.path.join(out_dir, base_noext + ".jpg")
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            continue
        subprocess.run([
            "sips",
            "-s", "format", "jpeg",
            "-s", "formatOptions", str(quality),
            "-Z", str(max_dim),
            src, "--out", dst,
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        converted += 1
    print(f"images: converted {converted} file(s) into {out_dir}")


# ------------------------------------------------------------------- driver

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-images", action="store_true")
    args = ap.parse_args()

    with open(SRC_HTML, encoding="utf-8") as f:
        src = f.read()
    print(f"read {SRC_HTML} ({len(src)} bytes)")

    events = tokenize(src)
    print(f"tokenized: {len(events)} events")

    notes = parse_footnotes(events)
    print(f"footnotes: {len(notes)} entries")

    blocks = parse_body(events)
    print(f"body blocks: {len(blocks)}")

    intro_b, text_b, apx_b = classify(blocks)
    print(f"  intro:      {len(intro_b)} blocks")
    print(f"  text:       {len(text_b)} blocks")
    print(f"  appendices: {len(apx_b)} blocks")

    intro_entries = blocks_to_entries(intro_b, notes)
    text_entries = blocks_to_entries(text_b, notes)
    apx_entries = blocks_to_entries(apx_b, notes)
    print(f"  intro:      {len(intro_entries)} entries")
    print(f"  text:       {len(text_entries)} entries")
    print(f"  appendices: {len(apx_entries)} entries")

    toc = build_toc(text_entries, intro_entries, apx_entries)
    print(f"toc: {len(toc)} entries")

    data = {
        "id": TEXT_ID,
        "title_en": TITLE_EN,
        "category": CATEGORY,
        "source": "Crimean Karaites/crimea.html",
        "no_column_toggles": True,
        "sections": {
            "intro": {"title_en": "Introduction", "content": intro_entries},
            "text": {"title_en": "Text", "content": text_entries},
            "appendices": {"title_en": "Appendices", "content": apx_entries},
        },
        "toc": toc,
    }

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"wrote {OUT_JSON}")

    convert_images(SRC_DIR, ASSETS_DIR, skip=args.skip_images)


if __name__ == "__main__":
    main()
