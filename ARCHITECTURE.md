# Karaite Texts Library — Application Architecture

> For AI assistants and human contributors. Read this before modifying `app.js`, `style.css`, or the data pipeline.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Single-Page App Architecture](#single-page-app-architecture)
3. [State Management](#state-management)
4. [Rendering Pipeline](#rendering-pipeline)
5. [Data Formats](#data-formats)
6. [Audio System](#audio-system)
7. [Citation Cross-References](#citation-cross-references)
8. [Footnotes & Glossary](#footnotes--glossary)
9. [Search System](#search-system)
10. [CSS Architecture](#css-architecture)
11. [Deployment](#deployment)

---

## Project Structure

```
karaite-texts/
├── index.html                 # SPA entry point (60 lines, loads CSS/JS/fonts)
├── css/
│   └── style.css              # Single stylesheet (~2800 lines, CSS custom props)
├── js/
│   └── app.js                 # All application logic (~2800 lines, vanilla JS)
├── data/
│   ├── catalog.json           # Master index of all texts
│   ├── citations.json         # Bidirectional verse citation index
│   ├── shabbat-morning-services.json  # Structured liturgy menu
│   └── texts/                 # Individual text JSON files (~130 files)
│       ├── 01-bereshit.json
│       ├── gan-eden.json
│       └── ...
├── audio/                     # MP3 files (optional, for texts with recordings)
│   ├── essa-bechos-yesha.mp3
│   └── torah/
│       └── 01-bereshit-1-cohen.mp3
├── tanakh_data/               # Source Tanakh JSON (generated from Sefaria)
├── site/                      # Live site root (same as repo root, for Netlify)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── data/
├── convert_*.py               # Python conversion scripts (see CONVERTERS.md)
├── build_citations.py         # Citation index builder
├── AGENTS.md                  # UX conventions & gotchas
├── DATA_MODEL.md              # Data structures & relationships
└── DEPLOYMENT.md              # Deployment instructions
```

**Important**: The repo root IS the site root. `index.html`, `css/`, `js/`, `data/` are all at the top level. There is no `site/` subdirectory that gets deployed separately — the entire repo (minus non-site files) is what Netlify serves.

---

## Single-Page App Architecture

The app is a **vanilla JavaScript SPA** with no build step, no framework, and no dependencies.

### Navigation Model

All navigation is via **URL hash** (`#text/01-bereshit`, `#tanakh/genesis/1`, `#category/Liturgy`).

```javascript
// Hash → route mapping
"text/<id>"        → showText(id)
"category/<name>"  → showCategory(name)
"tanakh/<book>/<ch>" → showTanakhBook(book, chapter)
"tanakh"           → showTanakh()
""                 → showHome()
```

The `hashchange` event listener (in `DOMContentLoaded`) dispatches to the appropriate function.

### Key Principle: Everything Re-renders

There is no virtual DOM or incremental updates. Every navigation call **rebuilds the entire `#app` innerHTML** from scratch. This is intentional for simplicity — the app state is small enough that full re-renders are fast.

**Consequence**: Any DOM event handlers attached to elements inside `#app` are lost on navigation. All interactivity must use `onclick="functionName()"` attributes in the HTML strings, or event delegation on `document`.

---

## State Management

Global state lives in module-level `let` variables at the top of `app.js`:

| Variable | Type | Purpose |
|----------|------|---------|
| `catalog` | `Object` | Master catalog loaded from `data/catalog.json` |
| `currentText` | `Object` | Currently displayed text JSON |
| `currentBook` | `Object` | Currently displayed Tanakh book JSON |
| `currentChapter` | `Number` | Current Tanakh chapter |
| `showHebrew` | `Boolean` | Hebrew column visible |
| `showTransliteration` | `Boolean` | Transliteration column visible |
| `showEnglish` | `Boolean` | English column visible |
| `showComments` | `Boolean` | KJLC Notes visible |
| `commentsMode` | `String` | `'inline-english'`, `'inline-full'`, or `'panel'` |
| `currentTab` | `String` | `'text'`, `'intro'`, `'appendices'`, or `'toc'` |
| `audioPlayer` | `HTMLAudioElement` | Current audio element |
| `isPlaying` | `Boolean` | Audio playing state |
| `currentVerseIndex` | `Number` | Index of currently playing verse |
| `clickToPlayMode` | `Boolean` | Per-verse play icons visible |
| `searchIndex` | `Array` | Title-based search index |
| `fullTextIndex` | `Object` | Full-text search index (id → content) |
| `searchReady` | `Boolean` | Full-text index loaded |
| `citationsIndex` | `Object` | Citation index (loaded on demand) |
| `shabbatMorningData` | `Object` | Cached Shabbat morning services data |

**No state persistence except:**
- `commentsMode` and `theme` (dark/light) are saved to `localStorage`
- Audio playback state is ephemeral (lost on navigation)

---

## Rendering Pipeline

### High-Level Flow

```
Navigation Event
    → Load data (fetch JSON)
    → Set state variables
    → renderText() / renderTanakhChapter() / etc.
        → Build HTML string
        → Insert into #app
        → initAudioPlayer() (if audio present)
        → initStickyNotesTracking() (if panel mode)
```

### Text Rendering (`renderText()`)

```javascript
renderText() {
    // 1. Determine content based on currentTab
    //    - 'text' → currentText.content
    //    - 'intro' → currentText.sections.intro.content
    //    - 'appendices' → currentText.sections.appendices.content
    //    - 'toc' → currentText.toc (table of contents)

    // 2. For each verse, determine layout class:
    //    - isEnglishOnly → single column, left-aligned
    //    - isHebrewOnly → single column, right-aligned (RTL)
    //    - isMixedEnglish → English text stored in hebrew field
    //    - isHebrewFootnote → starts with [number]
    //    - isDuplicateContent → Hebrew === English (centered)
    //    - hasLineNumber → english field is just a number

    // 3. Format comments based on category
    //    - Liturgy/Commentary → highlight term before period/colon
    //    - Halakhah/Other → plain scholarly footnotes

    // 4. Build tabs HTML (Text, Introduction, Appendices, Contents)

    // 5. Build controls HTML (Hebrew/Transliteration/English/KJLC Notes toggles)

    // 6. Build audio toolbar HTML (if hasAudio && currentTab === 'text')

    // 7. Build verse HTML (two-column grid by default)

    // 8. For commentsMode === 'panel':
    //    - Re-render verses WITHOUT inline comments
    //    - Wrap in text-with-notes-panel grid (text | notes panel)

    // 9. Assemble full page HTML and inject into #app
}
```

### Tanakh Rendering (`renderTanakhChapter()`)

```javascript
renderTanakhChapter() {
    // 1. Load citations index (async, cached)

    // 2. Build chapter navigation (prev/next, chapter select dropdown)

    // 3. For each verse:
    //    - Check if verse has citations in citationsIndex
    //    - Add * indicator to verse number if cited
    //    - Layout: Hebrew (left) | verse number (center) | English (right)

    // 4. Wrap in tanakh-reader container with sticky header

    // 5. Inject into #app
}
```

### Home Page (`showHome()`)

- Hero section with Hebrew/English titles
- Stats (Tanakh books count, other texts count, categories count)
- Category grid cards
- No async loading (uses cached `catalog`)

---

## Data Formats

### catalog.json

```json
{
  "Category Name": {
    "Subcategory Name": [
      {
        "id": "text-id",
        "title_en": "English Title",
        "title_he": "כותרת עברית",
        "category": "Category Name",
        "subcategory": "Subcategory Name",
        "hasAudio": true,
        "author_en": "Author Name"
      }
    ]
  }
}
```

**Important**: The `id` field must match the filename (without `.json`). The `category` and `subcategory` fields must match the keys in `catalog.json` for lookup to work.

### Text JSON (Standard Format)

```json
{
  "id": "text-id",
  "title_en": "English Title",
  "title_he": "כותרת עברית",
  "category": "Liturgy",
  "subcategory": "Havdala Songs",
  "author_en": "Author Name",
  "introduction": "Plain text introduction...",
  "about_author": "Author biography...",
  "audio": "audio/file.mp3",
  "audioTracks": [
    { "url": "audio/file.mp3", "label": "Traditional" }
  ],
  "content": [
    {
      "hebrew": "אֶשָּׂא בְּכוֹס יֶשַׁע",
      "transliteration": "Essa bechos yesha'",
      "english": "I shall raise the cup of deliverance",
      "comments": "1 Cup — the wine cup... 2 Salvation — redemption...",
      "timing": { "start": 0.0, "end": 5.2 },
      "section_id": "section-name"
    }
  ]
}
```

### Multi-Section Format (Kitab al-Anwar, Ma'aravi)

```json
{
  "id": "kitab-al-anwar",
  "title_en": "Kitab al-Anwar",
  "title_he": "ספר המאורות",
  "category": "Commentary",
  "sections": {
    "intro": {
      "title_en": "Introduction",
      "content": [ ... ]
    },
    "text": {
      "title_en": "Text",
      "content": [ ... ]
    },
    "appendices": {
      "title_en": "Appendices",
      "content": [ ... ]
    }
  },
  "toc": [
    {
      "title": "Main Text",
      "items": [
        { "title": "Introduction", "tab": "intro" },
        { "title": "Chapter 1", "tab": "text", "index": 10 }
      ]
    }
  ]
}
```

**When using `sections`**: The top-level `content` field should NOT exist. The app checks `currentText.sections` first and routes to the appropriate section based on `currentTab`.

### Comments Format

Comments can be in two styles, determined by the text's category:

**Term Definition Style** (Liturgy, Commentary):
```
1 Cup — the wine cup used for Havdala
2 Salvation — redemption from Egypt
```
The term before the em-dash is highlighted. Used for `category === 'Liturgy' || 'Commentary'`.

**Scholarly Footnote Style** (Halakhah, Polemics, Exhortatory, Other):
```
[1] Charles XII (reigned 1697–1718).
[9] Babovich uses the Egyptian Arabic form...
```
Full explanatory sentences. No term highlighting.

**Footnote markers in text**: Use `{{fn:N}}` placeholder in the `hebrew` or `english` field. The `formatText()` function converts this to `<sup class="fn-marker" data-fn="N">N</sup>`. This avoids HTML escaping issues that occur when storing raw `<sup>` tags in JSON.

### Tanakh JSON Format

```json
{
  "id": "genesis",
  "title_en": "Genesis",
  "title_he": "בראשית",
  "chapters": [
    {
      "chapter": 1,
      "audioSegments": [
        { "label": "Bereshit · 1. Cohen", "url": "audio/torah/01-bereshit-1-cohen.mp3" }
      ],
      "verses": [
        {
          "verse": 1,
          "hebrew": "בְּרֵאשִׁית...",
          "english": "In the beginning...",
          "audio": "audio/torah/01-bereshit-1-cohen.mp3",
          "timing": { "start": 0.0, "end": 8.0 },
          "aliyah": "1. Cohen",
          "parasha": "Bereshit"
        }
      ]
    }
  ]
}
```

### Shabbat Morning Services JSON

```json
{
  "data": {
    "Poems for the Weekly Torah Portion": [
      {
        "menu_title_left": "Genesis",
        "menu_title_right": "Recited in Place of",
        "menu_items": [
          { "menu_item": "Piyyut: Bereshit", "complement": "Parashat Bereshit" },
          { "menu_item": "Piyyut: Noah", "complement": "Parashat Noah" }
        ]
      }
    ],
    "Poems for the Weekly Sabbath": [ ... ]
  }
}
```

**Important**: `menu_item` values must exactly match `title_en` in `catalog.json` (under `Liturgy > Supplemental Readings for specific Torah portions`). The lookup uses `findText()` which normalizes apostrophes for matching.

---

## Audio System

### Two Audio Systems

The app has **two completely separate audio implementations** that share no code:

1. **Text Audio** (`initAudioPlayer()`, `seekToVerse()`, etc.)
   - For liturgical texts with recordings
   - Single MP3 per text
   - Per-verse timing in `content[].timing`
   - Click-to-play toggle mode

2. **Tanakh Audio** (`initTanakhAudio()`, `tanakhSeekToVerse()`, etc.)
   - For Torah portion recordings
   - Multiple MP3s per chapter (one per aliyah)
   - Per-verse timing in `verses[].timing`
   - Track selector dropdown
   - Verse highlighting while playing

### Audio Data Flow (Torah)

```
Torah Audio Recording Markers.xlsx
    → convert_torah_markers.py
    → Copies MP3s to site/audio/torah/
    → Merges timing data into site/data/tanakh/<book>.json
    → Adds audioSegments to each chapter
```

### Important: Range Server Required

Audio seeking requires HTTP `Range` requests. Do NOT use `python -m http.server` — it returns `200 OK` for range requests, which silently breaks `audio.currentTime`. Always use:

```bash
cd site
python3 range_server.py   # Port 8080, supports 206 Partial Content
```

---

## Citation Cross-References

### Index Structure (`citations.json`)

Built by `build_citations.py` scanning all text files:

```json
{
  "text_citations": {
    "text-id": [
      { "verse_ref": "genesis:1:1", "verse_index": 5 }
    ]
  },
  "verse_refs": {
    "genesis:1:1": [
      { "text_id": "text-id", "verse_index": 5, "text_title": "Text Title" }
    ]
  }
}
```

- `text_citations`: Maps text ID → list of cited verses (for "Cited Verses" view)
- `verse_refs`: Maps verse reference → list of citing texts (for Tanakh cross-references)

### Citation Patterns Detected

The `formatText()` function detects and links these patterns:

| Pattern | Example | Links To |
|---------|---------|----------|
| Hebrew book ref | `(בראשית א, א)` | Tanakh book/chapter |
| English book ref | `Genesis 1:1` | Tanakh book/chapter |
| Hebrew book ref with prefix | `(שמות טו, ב)` | Tanakh book/chapter |

Clicking a citation opens a side panel showing the full chapter with the target verse highlighted. Clicking any verse in the panel navigates to that chapter in Tanakh.

### Adding Citations to New Texts

Citations are automatically detected in `hebrew` and `english` fields by `formatText()`. No manual markup needed. To rebuild the index:

```bash
python3 build_citations.py
```

---

## Footnotes & Glossary

### Footnote Display Modes

Three modes controlled by `commentsMode`:

1. **`'inline-english'`** (default): Comments appear below the English column
2. **`'inline-full'`**: Comments span full width below the verse
3. **`'panel'`**: Comments appear in a side panel on the right, positioned at the same Y-level as the footnote marker

### Side Panel Mode Architecture

```
text-with-notes-panel (CSS grid: 1fr 280px)
├── text-content (verses without inline comments)
└── sticky-notes-panel
    └── sticky-notes-inner (position: relative)
        └── positioned-note (position: absolute; top: <marker Y>)
            ├── note-toggle (▶ / ▼ + number + Hebrew incipit)
            └── note-content (collapsible)
```

The `initStickyNotesTracking()` function:
1. Finds all `.fn-marker[data-fn]` elements
2. Calculates `markerTop = marker.offsetTop + verse.offsetTop`
3. Creates a `positioned-note` at that Y position
4. Extracts the incipit (Hebrew word before em-dash) for the toggle header
5. Uses `Set` to prevent duplicate footnotes

### Glossary

Some texts include a `glossary` array:

```json
{
  "glossary": [
    {
      "term_he": "מלחמה",
      "transliteration": "Milḥama",
      "definition": "War, battle"
    }
  ]
}
```

The glossary is rendered as a separate tab ("Glossary") using the same tab system as Intro/Text/Appendices.

---

## Search System

### Two-Stage Search

1. **Title search** (instant): Searches `catalog.json` titles (Hebrew and English)
2. **Full-text search** (background): Loads all text files, indexes content

### Fuzzy Matching

The search uses `normalizeForSearch()` which strips diacritics, apostrophes, and normalizes vowels:

- `ḥ` → `h`, `ṭ` → `t`, `ṣ` → `s`, etc.
- `ā` → `a`, `ē` → `e`, etc.
- Removes all apostrophe-like characters
- Handles ending variants (`oth` → `ot`, `ah` → `a`)

### Search Result Snippets

Shows up to 2 lines of context around the match, with the matched term highlighted.

---

## CSS Architecture

### CSS Custom Properties (Design Tokens)

All styling uses CSS variables defined in `:root` and `[data-theme="dark"]`:

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--bg-primary` | `#faf9f7` | `#1a1a1a` | Page background |
| `--bg-secondary` | `#ffffff` | `#242424` | Card/panel background |
| `--bg-tertiary` | `#f5f3f0` | `#2a2a2a` | Subtle backgrounds |
| `--text-primary` | `#1a1a1a` | `#e8e6e3` | Main text |
| `--text-secondary` | `#4a4a4a` | `#b8b5b0` | Secondary text |
| `--text-muted` | `#7a7a7a` | `#888580` | Tertiary text |
| `--accent` | `#8b5a2b` | `#c49a6c` | Primary accent (brown/gold) |
| `--accent-light` | `#c49a6c` | `#d4b08c` | Lighter accent |
| `--accent-dark` | `#5c3d1e` | `#a07850` | Darker accent |
| `--border` | `#e5e2dd` | `#3a3a3a` | Borders |
| `--hebrew-color` | `#2c1810` | `#e8e4dc` | Hebrew text |
| `--font-hebrew` | `Taamey Frank CLM` | ... | Hebrew font stack |
| `--font-serif` | `Crimson Pro` | ... | English serif |
| `--font-sans` | `Inter` | ... | UI/sans-serif |

### Layout System

- **Home/Category**: CSS Grid with `auto-fit` cards
- **Text Reader**: CSS Grid `1fr 1fr` (Hebrew | English+Transliteration)
- **Tanakh**: CSS Grid `1fr auto 1fr` (Hebrew | Verse# | English)
- **Side Panel**: CSS Grid `1fr 280px` (Text | Notes)
- **Sticky Header**: `position: sticky; top: 0; z-index: 100`

### Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| `1200px` | Side panel collapses to full-width |
| `768px` | Single column layout, mobile nav |
| `600px` | Audio player wraps |
| `500px` | Side panel becomes full-screen |

---

## Deployment

### Current Setup: Netlify + GitHub

- **Repo**: `github.com/Karaite-Jewish-Learning-Center/new_karaite`
- **Branch**: `feature/may-2026-updates` (NOT `main`)
- **Build**: None (static site)
- **Publish directory**: Repo root (`.`)

**To check deploy status**: [netlify.com](https://netlify.com) → your site → **Deploys**

**To trigger manual deploy**: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Git Push → Deploy Flow

```
Local commit
    → git push origin HEAD:feature/may-2026-updates
    → Netlify auto-detects push
    → Netlify pulls from GitHub
    → Deploys (takes ~30 seconds)
    → Site live at https://kjlc.karaites.org
```

**Important**: Always push to `feature/may-2026-updates`, NOT `main`. Netlify is configured to watch `feature/may-2026-updates`.

### Large File Handling

The repo contains large files (MP3s, large JSONs). If `git push` fails with SSL errors:
1. Try from a different network (phone hotspot)
2. Push commits one at a time: `git push origin <commit-hash>:feature/may-2026-updates`
3. Increase buffer: `git config http.postBuffer 2147483648`

---

## Common Tasks for Contributors

### Adding a New Text

1. Create JSON in `site/data/texts/your-text.json`
2. Add entry to `site/data/catalog.json`
3. (Optional) Add to `shabbat-morning-services.json` if it's a Shabbat service text
4. Test locally with `python3 range_server.py`
5. Commit and push to `feature/may-2026-updates`

### Adding Audio to a Text

1. Add MP3 to `site/audio/your-text.mp3`
2. Add `"audio": "your-text.mp3"` to text JSON
3. Add per-verse timing:
   ```json
   {
     "timing": { "start": 0.0, "end": 5.2 }
   }
   ```
4. Test audio seeking with `range_server.py` (NOT `http.server`)

### Rebuilding Citations

```bash
cd /Users/shawn/karaite-texts
python3 build_citations.py
# This updates site/data/citations.json
```

### Converting Excel to JSON

See CONVERTERS.md for detailed instructions on each conversion script.

---

*Last updated: 2026-06-02*
