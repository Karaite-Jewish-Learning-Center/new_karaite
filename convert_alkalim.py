#!/usr/bin/env python3
"""
Convert alkalim-export/alkalim-export.html to site/data/texts/al-kalim.json.

Layout is "diglot-image": each article has a magazine cover (left) + caption (right),
then one or more scan+translation rows where the facsimile scan sits on the left and
the English translation flows on the right.

Uses only Python stdlib. Images are converted PNG -> JPEG (quality 85, max 1600px)
via macOS `sips` unless --skip-images is passed.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser


# --- Config ---------------------------------------------------------------

REPO = os.path.dirname(os.path.abspath(__file__))
SRC_HTML = os.path.join(REPO, "alkalim-export", "alkalim-export.html")
SRC_DIR = os.path.join(REPO, "alkalim-export")
OUT_JSON = os.path.join(REPO, "site", "data", "texts", "al-kalim.json")
ASSETS_DIR = os.path.join(REPO, "site", "assets", "alkalim")
SPLITS_JSON = os.path.join(REPO, "alkalim-splits.json")

ASSETS_URL_PREFIX = "assets/alkalim"


# --- HTML parsing ---------------------------------------------------------

# We tokenize the HTML into a flat list of events:
#   ("open", tag, attrs_dict)
#   ("close", tag)
#   ("text", text)
#   ("void", tag, attrs_dict)   e.g. <img>, <br>, <hr>


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


# --- Inline text extraction ----------------------------------------------


def render_inline(events: list[tuple], start: int) -> tuple[str, int]:
    """Render inline content starting at events[start] which is an 'open' event.
    Returns (text, index_of_matching_close).

    Preserves whitespace conservatively (collapses whitespace runs but keeps single
    spaces). Emits placeholder markers for tags formatText can pick up:
       {{em:...}}      for <em>, <i>
       {{fn:N}}        for <sup class="fnref"><a href="#fnN">N</a></sup>
    Ignores empty <span class="label"></span>.
    """
    assert events[start][0] == "open"
    root_tag = events[start][1]
    depth = 1
    i = start + 1
    out: list[str] = []
    while i < len(events) and depth > 0:
        ev = events[i]
        kind = ev[0]
        if kind == "open":
            tag = ev[1]
            attrs = ev[2]
            # Detect footnote-ref supattr and consume to matching close
            if tag == "sup" and attrs.get("class", "").strip() == "fnref":
                # Find the fn number from the enclosed <a href="#fnN">N</a>
                num, end = _consume_fnref(events, i)
                out.append(f"{{{{fn:{num}}}}}")
                i = end + 1
                continue
            depth += 1
            if tag in ("em", "i"):
                inner, end = render_inline(events, i)
                # Flatten nested em (drop inner markers)
                inner_flat = re.sub(r"\{\{em:([^}]*)\}\}", r"\1", inner)
                inner_flat = inner_flat.strip()
                if inner_flat:
                    out.append("{{em:" + inner_flat + "}}")
                depth -= 1
                i = end + 1
                continue
            if tag == "span" and attrs.get("class", "").strip() == "label":
                # empty label placeholder, skip its inner
                _, end = render_inline(events, i)
                depth -= 1
                i = end + 1
                continue
            if tag == "a":
                # Ignore anchor wrapping; keep inner text
                inner, end = render_inline(events, i)
                out.append(inner)
                depth -= 1
                i = end + 1
                continue
            # Fallback: unknown inline tag, pass through inner text
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
                # fall through
            i += 1
            continue
        if kind == "void":
            tag = ev[1]
            if tag == "br":
                out.append("\n")
            i += 1
            continue
        if kind == "text":
            out.append(ev[1])
            i += 1
            continue
        i += 1
    return _postprocess_inline("".join(out)), i - 1


def _consume_fnref(events: list[tuple], start: int) -> tuple[str, int]:
    """Given events[start] is <sup class="fnref">, find the <a href="#fnN">N</a>
    and return (N_as_str, index_of_matching_</sup>)."""
    num = ""
    i = start + 1
    depth = 1
    while i < len(events) and depth > 0:
        ev = events[i]
        if ev[0] == "open":
            depth += 1
            if ev[1] == "a":
                href = ev[2].get("href", "")
                m = re.match(r"#fn(\d+)", href)
                if m:
                    num = m.group(1)
        elif ev[0] == "close":
            depth -= 1
            if depth == 0:
                return num, i
        i += 1
    return num, i - 1


def _postprocess_inline(text: str) -> str:
    # Collapse whitespace but preserve manual newlines
    lines = text.split("\n")
    cleaned = []
    for line in lines:
        line = re.sub(r"[ \t\r]+", " ", line).strip()
        cleaned.append(line)
    result = "\n".join(cleaned).strip()
    return result


# --- Structural walk ------------------------------------------------------


def find_matching_close(events: list[tuple], start: int) -> int:
    """Given events[start] is an 'open' event, return the index of its matching 'close'."""
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
    raise ValueError(f"Unmatched <{tag}> at index {start}")


def parse_footnotes(events: list[tuple]) -> dict[str, str]:
    """Find <section class="footnotes"> ... <ol><li id="fnN">...</li>...</ol></section>
    and return { "N": "note text" }."""
    notes: dict[str, str] = {}
    for i, ev in enumerate(events):
        if ev[0] == "open" and ev[1] == "section" and ev[2].get("class", "").strip() == "footnotes":
            # Find the enclosed <ol>...</ol>
            j = i + 1
            end = find_matching_close(events, i)
            while j < end:
                ev2 = events[j]
                if ev2[0] == "open" and ev2[1] == "li":
                    fid = ev2[2].get("id", "")
                    m = re.match(r"fn(\d+)", fid)
                    if m:
                        num = m.group(1)
                        text, li_end = render_inline(events, j)
                        # Strip the trailing " ↩" back-link character if any
                        text = text.replace("\u21a9", "").strip()
                        notes[num] = text
                        j = li_end + 1
                        continue
                j += 1
            break
    return notes


# --- Article structure ----------------------------------------------------


def parse_body(events: list[tuple]) -> tuple[list, list]:
    """Return (intro_blocks, articles).
    intro_blocks = list of block dicts for the Introduction section.
    articles     = list of article dicts.
    A "block" is one of:
      { "kind": "p", "text": "..." }
      { "kind": "center", "text": "..." }
      { "kind": "frontmatter", "text": "..." }   (multi-line preserved)
      { "kind": "h", "level": 1|2|3, "text": "..." }
      { "kind": "img", "src": "..." }
    Article dict shape is emitted by build_articles below.
    """
    body_start = None
    body_end = None
    for i, ev in enumerate(events):
        if ev[0] == "open" and ev[1] == "body":
            body_start = i
        elif ev[0] == "close" and ev[1] == "body":
            body_end = i
            break
    if body_start is None:
        raise ValueError("No <body> element found")
    if body_end is None:
        body_end = len(events)

    blocks: list[dict] = []
    i = body_start + 1
    while i < body_end:
        ev = events[i]
        kind = ev[0]
        if kind == "open":
            tag = ev[1]
            attrs = ev[2]

            # Skip nav (TOC) and footnotes section entirely
            if tag == "nav":
                i = find_matching_close(events, i) + 1
                continue
            if tag == "section" and attrs.get("class", "").strip() == "footnotes":
                i = find_matching_close(events, i) + 1
                continue

            # Headings
            if tag in ("h1", "h2", "h3", "h4", "h5"):
                text, end = render_inline(events, i)
                blocks.append({
                    "kind": "h",
                    "level": int(tag[1]),
                    "text": text,
                    "id": attrs.get("id", ""),
                })
                i = end + 1
                continue

            # Paragraph
            if tag == "p":
                cls = attrs.get("class", "").strip()
                text, end = render_inline(events, i)
                # Check if it contains only an image
                img_src = _paragraph_image_only(events, i, end)
                if img_src is not None:
                    blocks.append({"kind": "img", "src": img_src})
                else:
                    if cls == "frontmatter":
                        blocks.append({"kind": "frontmatter", "text": text})
                    else:
                        blocks.append({"kind": "p", "text": text})
                i = end + 1
                continue

            # Centered div (signature blocks)
            if tag == "div" and attrs.get("class", "").strip() == "center":
                text, end = render_inline(events, i)
                blocks.append({"kind": "center", "text": text})
                i = end + 1
                continue

            # Unknown container: recurse into it by advancing one event; children handled next iter.
            i += 1
            continue

        if kind == "void":
            tag = ev[1]
            if tag == "img":
                src = ev[2].get("src", "")
                if src and src != "titre.png":
                    blocks.append({"kind": "img", "src": src})
            i += 1
            continue

        # text/close: skip
        i += 1

    return split_into_intro_and_articles(blocks)


def _paragraph_image_only(events, p_open, p_close) -> str | None:
    """If a <p>...</p> contains exactly one <img> and no significant text, return the src."""
    img_src = None
    for k in range(p_open + 1, p_close):
        ev = events[k]
        if ev[0] == "void" and ev[1] == "img":
            if img_src is not None:
                return None  # multiple images
            img_src = ev[2].get("src", "")
        elif ev[0] == "text":
            if ev[1].strip():
                return None  # has real text
        elif ev[0] == "open" and ev[1] not in ("br",):
            # nested tags disqualify (except br), but be lenient with empty spans
            continue
    return img_src


def split_into_intro_and_articles(blocks: list[dict]) -> tuple[list, list]:
    """The document starts with front matter + TOC + Introduction.
    Then each <h1><em>Al-Kalim</em>, Issue N ...</h1> starts a new article.
    """
    intro_blocks: list[dict] = []
    articles: list[dict] = []
    current_article: dict | None = None

    for b in blocks:
        if b["kind"] == "h" and b["level"] == 1:
            text = b["text"]
            if text.strip().lower().startswith("table of contents"):
                continue
            if text.strip().lower().startswith("introduction") or b.get("id") == "XXX2":
                # Introduction is a heading; skip inserting the heading itself
                # since the section title comes from `sections.intro.title_en`.
                # Discard any front-matter blocks (ISBN etc.) collected before intro.
                intro_blocks = []
                continue
            # Otherwise this is an article banner
            if current_article is not None:
                articles.append(current_article)
            current_article = {
                "issue_banner": text,
                "cover_image": None,
                "cover_caption": "",
                "title": "",
                "byline": "",
                "raw_scans": [],   # list of {image, blocks: [...]}
            }
            continue

        if current_article is None:
            intro_blocks.append(b)
        else:
            # Fill in fields based on the arriving block sequence
            if b["kind"] == "img" and current_article["cover_image"] is None:
                current_article["cover_image"] = b["src"]
            elif b["kind"] == "p" and current_article["cover_image"] and not current_article["cover_caption"]:
                current_article["cover_caption"] = b["text"]
            elif b["kind"] == "h" and b["level"] == 2:
                if not current_article["title"]:
                    current_article["title"] = b["text"]
                else:
                    # A second article inside the same issue: close current and
                    # start a fresh one that inherits the issue banner + cover.
                    articles.append(current_article)
                    current_article = {
                        "issue_banner": current_article["issue_banner"],
                        "cover_image": current_article["cover_image"],
                        "cover_caption": current_article["cover_caption"],
                        "title": b["text"],
                        "byline": "",
                        "raw_scans": [],
                    }
            elif b["kind"] == "h" and b["level"] == 3 and not current_article["byline"]:
                current_article["byline"] = b["text"]
            elif b["kind"] == "img":
                # Start a new scan block
                current_article["raw_scans"].append({"image": b["src"], "blocks": []})
            else:
                # Prose blocks go into the current scan (or create one if no scan yet)
                if not current_article["raw_scans"]:
                    current_article["raw_scans"].append({"image": None, "blocks": []})
                current_article["raw_scans"][-1]["blocks"].append(b)

    if current_article is not None:
        articles.append(current_article)

    return intro_blocks, articles


# --- Multi-scan merge/split -----------------------------------------------


def apply_splits(article: dict, split_hints: dict) -> list[dict]:
    """Given an article with raw_scans possibly containing back-to-back scans followed
    by all-paragraphs, produce a merged list of scans where paragraphs are distributed
    across scans. Uses split_hints[section_id] = [para_idx_where_scan_2_starts, ...]
    or falls back to even split.

    Returns a list of {image, paragraphs: [block, ...]}.
    """
    raw = article["raw_scans"]
    # Separate leading scans with no paragraphs from the trailing scan(s) that have paragraphs
    leading_images: list[str] = []
    paragraph_pool: list[dict] = []
    trailing_used = False
    for scan in raw:
        if not trailing_used and not scan["blocks"] and scan["image"]:
            leading_images.append(scan["image"])
        else:
            trailing_used = True
            if scan["image"] and scan["image"] not in leading_images:
                leading_images.append(scan["image"])
            paragraph_pool.extend(scan["blocks"])

    if not leading_images:
        # No image at all? just return paragraphs under a null image
        return [{"image": None, "paragraphs": paragraph_pool}]

    n = len(leading_images)
    if n == 1:
        return [{"image": leading_images[0], "paragraphs": paragraph_pool}]

    section_id = article.get("section_id", "")
    hints = split_hints.get(section_id)
    total = len(paragraph_pool)
    if not hints or len(hints) != n - 1:
        # Even split
        chunk = max(1, total // n)
        hints = [chunk * (k + 1) for k in range(n - 1)]
    else:
        # Clamp hints into range and preserve monotonicity
        cleaned = []
        last = 0
        for k, h in enumerate(hints):
            remaining = n - 1 - k
            h = max(last + 1, min(h, total - remaining))
            cleaned.append(h)
            last = h
        hints = cleaned

    result: list[dict] = []
    prev = 0
    for k in range(n):
        end = hints[k] if k < n - 1 else len(paragraph_pool)
        result.append({
            "image": leading_images[k],
            "paragraphs": paragraph_pool[prev:end],
        })
        prev = end
    return result


# --- Emit content entries --------------------------------------------------


def block_to_entry(block: dict, notes: dict) -> dict:
    kind = block["kind"]
    entry: dict = {"hebrew": "", "transliteration": "", "english": "", "english_only": True}
    if kind == "p":
        entry["english"] = block["text"]
    elif kind == "center":
        entry["english"] = "{{center:" + block["text"] + "}}"
    elif kind == "frontmatter":
        entry["english"] = "{{frontmatter:" + block["text"] + "}}"
    elif kind == "h":
        entry["english"] = "{{h" + str(block["level"]) + ":" + block["text"] + "}}"
    else:
        entry["english"] = block["text"]

    # Attach comments for any {{fn:N}} referenced
    comments: list[str] = []
    for m in re.finditer(r"\{\{fn:(\d+)\}\}", entry["english"]):
        n = m.group(1)
        if n in notes and not any(c.startswith(f"[{n}]") for c in comments):
            comments.append(f"[{n}] {notes[n]}")
    if comments:
        entry["comments"] = "\n\n".join(comments)
    return entry


def make_intro_content(intro_blocks: list[dict], notes: dict) -> list[dict]:
    out: list[dict] = []
    for b in intro_blocks:
        if b["kind"] == "img":
            out.append({
                "hebrew": "",
                "transliteration": "",
                "english": "",
                "image": image_url(b["src"]),
                "english_only": True,
            })
            continue
        out.append(block_to_entry(b, notes))
    return out


def image_url(src: str) -> str:
    # Convert filename.png -> assets/alkalim/filename.jpg
    base = os.path.basename(src)
    name, _ = os.path.splitext(base)
    return f"{ASSETS_URL_PREFIX}/{name}.jpg"


# --- Image processing -----------------------------------------------------


def convert_images(names: list[str]) -> None:
    os.makedirs(ASSETS_DIR, exist_ok=True)
    for name in names:
        src = os.path.join(SRC_DIR, name)
        if not os.path.exists(src):
            print(f"  MISSING: {src}", file=sys.stderr)
            continue
        base, _ = os.path.splitext(name)
        dst = os.path.join(ASSETS_DIR, base + ".jpg")
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            continue
        cmd = ["sips", "-Z", "1600", "-s", "format", "jpeg", "-s", "formatOptions", "85",
               src, "--out", dst]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  sips failed for {name}: {result.stderr.strip()}", file=sys.stderr)


# --- Main -----------------------------------------------------------------


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-images", action="store_true", help="Skip image conversion")
    args = ap.parse_args()

    with open(SRC_HTML, "r", encoding="utf-8") as f:
        src = f.read()

    print("Tokenizing HTML...")
    events = tokenize(src)
    print(f"  {len(events)} events")

    print("Parsing footnotes...")
    notes = parse_footnotes(events)
    print(f"  {len(notes)} notes ({sorted(notes.keys(), key=lambda s: int(s))})")

    print("Parsing body...")
    intro_blocks, articles = parse_body(events)
    print(f"  {len(intro_blocks)} intro blocks, {len(articles)} articles")

    # Assign section_ids and roman numerals to articles
    for idx, art in enumerate(articles, start=1):
        art["section_id"] = f"chap-{idx}"
        art["chapter_num"] = idx

    # Load split hints
    split_hints: dict[str, list[int]] = {}
    if os.path.exists(SPLITS_JSON):
        with open(SPLITS_JSON, "r", encoding="utf-8") as f:
            split_hints = json.load(f)
        print(f"  loaded {len(split_hints)} split hints")

    # Build final articles
    print("Building articles...")
    final_articles: list[dict] = []
    all_image_names: list[str] = []
    for art in articles:
        scans = apply_splits(art, split_hints)
        final_scans = []
        for scan in scans:
            if scan["image"]:
                all_image_names.append(scan["image"])
            paragraph_entries = [block_to_entry(b, notes) for b in scan["paragraphs"]]
            final_scans.append({
                "image": image_url(scan["image"]) if scan["image"] else None,
                "paragraphs": paragraph_entries,
            })
        art_out = {
            "section_id": art["section_id"],
            "chapter_num": art["chapter_num"],
            "issue_banner": art["issue_banner"],
            "cover_image": image_url(art["cover_image"]) if art["cover_image"] else None,
            "cover_caption": art["cover_caption"],
            "title": art["title"],
            "byline": art["byline"],
            "scans": final_scans,
        }
        if art["cover_image"]:
            all_image_names.append(art["cover_image"])
        final_articles.append(art_out)

    # Build TOC
    toc = [
        {
            "title": "Introduction",
            "section": "intro",
            "items": [],
        },
        {
            "title": "Selections",
            "section": "text",
            "items": [
                {
                    "title": art["title"] or art["issue_banner"],
                    "section_id": art["section_id"],
                    "index": i,
                }
                for i, art in enumerate(final_articles)
            ],
        },
    ]

    intro_content = make_intro_content(intro_blocks, notes)

    document = {
        "id": "al-kalim",
        "title_en": "Al-Kalim: Selections from a Karaite Magazine of Cairo (1945-1956)",
        "title_he": "",
        "category": "General",
        "source": "alkalim-export/alkalim-export.html",
        "layout": "diglot-image",
        "no_column_toggles": True,
        "toc": toc,
        "sections": {
            "intro": {
                "title_en": "Introduction",
                "title_he": "",
                "content": intro_content,
            },
            "text": {
                "title_en": "Selections",
                "title_he": "",
                "articles": final_articles,
            },
        },
    }

    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(document, f, ensure_ascii=False, indent=2)
    print(f"  wrote {OUT_JSON}")

    if not args.skip_images:
        print(f"Converting {len(set(all_image_names))} images -> jpg 1600px q85...")
        convert_images(sorted(set(all_image_names)))
        print(f"  images in {ASSETS_DIR}")
    else:
        print("Skipping image conversion (--skip-images)")

    print("Done.")


if __name__ == "__main__":
    main()
