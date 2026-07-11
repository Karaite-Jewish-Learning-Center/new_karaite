# Al-Kalim integration notes

Notes on what was built to get the al-Kalim magazine anthology live on the
site, and where to look if you need to change any of it.

## What went live

`Al-Kalim: Selections from a Karaite Magazine of Cairo (1945-1956)` is a new
30-article anthology under the top-level `General` category. Each article
renders as a facing-page layout: the magazine facsimile scan on the left,
the English translation on the right, with the issue cover image at the
top of each article. There are also 30 magazine covers and 36 article page
scans (66 images total, ~32 MB after conversion).

## Source material

Everything came from `alkalim-export/`:

- `alkalim-export.html` — a single self-contained HTML file with the
  editor's introduction, 30 article translations, and a footnotes section
  at the bottom. No paragraph markers, no Hebrew original text.
- 66 PNG files — one magazine cover per issue plus 1-2 facsimile page
  scans per article. Original size ~120 MB.
- `titre.png` — title page, currently ignored by the converter.

## Pipeline

`convert_alkalim.py` (stdlib only, no dependencies) does the following:

1. Tokenizes the HTML with `html.parser`.
2. Parses `<section class="footnotes"><ol>` at the bottom into an
   `id -> text` dict.
3. Walks the body top-to-bottom, skipping `<style>`, `<nav class="toc">`,
   the trailing footnotes section, and `titre.png`.
4. Splits on `<h1>` for issue banners and on a second `<h2>` within an
   issue for the "two articles in one issue" case (Issue 82).
5. Collects for each article: cover image + caption, `<h2>` title,
   `<h3>` byline, then one scan block per facsimile image with all
   subsequent paragraphs flowing into it.
6. Rewrites inline markup:
   - `<sup class="fnref"><a href="#fnN">N</a></sup>` -> `{{fn:N}}`
   - `<em>foo</em>` -> `{{em:foo}}` (flattens nesting)
   - `<div class="center">Name</div>` -> `{{center:Name}}`
   - `<p class="frontmatter">multi-line</p>` -> `{{frontmatter:...}}`
   - `<span class="label"></span>` stripped
7. For every paragraph that contains a `{{fn:N}}` marker, attaches the
   matching footnote text into that paragraph's `comments` field.
8. For multi-scan articles, distributes paragraphs across scans using
   `alkalim-splits.json` (hand-tuned indices). Out-of-range hints get
   clamped; missing entries fall back to an even split.
9. Converts each referenced PNG to a JPEG at max 1600px, quality 85,
   via `sips` (macOS native), writing to `site/assets/alkalim/`.
10. Emits `site/data/texts/al-kalim.json`.

Run:

```bash
python3 convert_alkalim.py               # full run (JSON + images)
python3 convert_alkalim.py --skip-images # regenerate JSON only
```

The converter caches images by mtime, so re-runs skip already-converted
files.

## Data shape

`site/data/texts/al-kalim.json` uses a new opt-in layout flag:

```json
{
  "id": "al-kalim",
  "layout": "diglot-image",
  "no_column_toggles": true,
  "category": "General",
  "toc": [ { "title": "Introduction", ... }, { "title": "Selections", ... } ],
  "sections": {
    "intro": { "content": [ /* standard english_only verse entries */ ] },
    "text":  { "articles": [ /* array of article objects */ ] }
  }
}
```

Each article object:

```json
{
  "section_id": "chap-1",
  "chapter_num": 1,
  "issue_banner": "{{em:Al-Kalim}}, Issue 1 (February 16, 1945)",
  "cover_image":  "assets/alkalim/01-cover.jpg",
  "cover_caption": "On the cover: ...",
  "title": "Pilgrimage to Jerusalem and Visit to the Holy Land",
  "byline": "February 16, 1945; issue 1, p. 6",
  "scans": [
    { "image": "assets/alkalim/01-text.jpg",
      "paragraphs": [
        { "english": "The trip everyone's waiting for...", "english_only": true, "hebrew": "", "transliteration": "" },
        { "english": "...{{fn:3}}", "english_only": true, "comments": "[3] The administrative office ..." }
      ] }
  ]
}
```

## Reader changes

`site/js/app.js`:

- New `renderDiglotArticle(article)` helper that emits the article HTML
  as a series of grid rows.
- `renderText()` now detects `currentText.layout === 'diglot-image'` and,
  on the Text tab, dispatches to `renderDiglotArticle` per article
  instead of the verse-list path. Intro tab still uses the normal
  verse-list renderer.
- `no_column_toggles` on the text object hides the
  Hebrew / Transliteration / English toggle buttons (al-Kalim has no
  Hebrew original), leaving only the Notes toggle if footnotes exist.
- `formatText()` learned four new placeholder rewrites:
  `{{em:...}}`, `{{center:...}}`, `{{frontmatter:...}}`, `{{hN:...}}`.
- `showText()` now resets `currentTab` to `'text'` when the previously
  active tab (e.g. `appendices` from a maaravi read) does not exist on
  the newly loaded book.

## CSS

`site/css/style.css` appended a block scoped by the `.diglot-image`
wrapper and the `.ak-*` class prefix. Grid template is `1fr 1fr` with a
sticky left column so the scan stays visible while you scroll the right
column. Below 900px the grid collapses to a single column.

## Navigation & catalog

- The catalog's top-level `Other` bucket was renamed to `General` in
  `site/data/catalog.json`.
- The rosh-pinna and al-kalim text JSONs had their `category` field
  changed from `Other` to `General`.
- `categoryOrder` in `app.js` and the fallback string in `build_site.py`
  were updated for consistency.
- `site/index.html` gained a `General` nav link between Commentary and
  All Texts.

## Changelog

`site/data/changelog.json` got a new 2026-07-11 entry at the top
covering both the al-Kalim addition and the General nav tab.

## Files created / modified

Created:

- `convert_alkalim.py` — the converter (~500 lines).
- `alkalim-splits.json` — manual paragraph split hints for 7 two-scan
  articles (chap-4, chap-7, chap-10, chap-15, chap-18, chap-23, chap-26).
- `site/data/texts/al-kalim.json` — generated, 30 articles + intro.
- `site/assets/alkalim/*.jpg` — 66 images.

Modified:

- `site/js/app.js` — diglot-image render branch, placeholder formatters,
  `currentTab` reset in `showText`, categoryOrder rename.
- `site/css/style.css` — appended `.ak-*` layout rules.
- `site/data/catalog.json` — al-Kalim entry under new `General` bucket
  (top-level `Other` -> `General`).
- `site/index.html` — added General nav link.
- `site/data/changelog.json` — 2026-07-11 entry.
- `site/data/texts/rosh-pinna.json` — category renamed `Other` ->
  `General`.
- `build_site.py` — fallback category renamed.

## Known caveats

- The source HTML's TOC uses `#chap-1` ... `#chap-30` anchors that do
  not exist in the body. The converter synthesizes clean sequential
  section_ids matching those links.
- The source's Roman-numeral TOC labels have a numbering hiccup (two
  `X.` and one `XI.` shifted by one). We use the raw article titles for
  our TOC rather than the source labels, so this is invisible in the
  rendered TOC.
- The footnotes list is numbered `fn1`-`fn19`, `fn21`, `fn22` — `fn20`
  is missing in the source. If any paragraph references `{{fn:20}}` its
  `comments` field will be empty. Currently no such ref exists.
- Multi-scan paragraph split points are hand-tuned estimates in
  `alkalim-splits.json`. If a scan-to-translation alignment looks off,
  edit that file and re-run the converter (JSON-only mode is fast).
- `sips` on macOS cannot emit webp; we ship JPEG at q85. If moving to
  Linux/CI, swap `sips` for `cwebp` or Pillow.

## Reusability for future books "with the same HTML"

You mentioned more books shaped like this. The converter is currently
hard-coded to al-Kalim paths at the top of the file
(`SRC_HTML`, `SRC_DIR`, `OUT_JSON`, `ASSETS_DIR`, `SPLITS_JSON`,
`ASSETS_URL_PREFIX`). When the next book arrives, either:

1. Copy `convert_alkalim.py` to `convert_<newbook>.py` and change those
   six constants plus the top-level id/title/category metadata in
   `main()`, or
2. Refactor those constants into CLI flags (a small change; the
   parser and image pipeline are already reusable).

The reader-side changes (`layout: "diglot-image"` + `no_column_toggles`)
are generic and don't need any further work per book.
