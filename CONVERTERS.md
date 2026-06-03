# Conversion Scripts Documentation

> Python scripts that convert source data (Excel, XML, etc.) into the site's JSON format.

---

## Overview

| Script | Input | Output | Purpose |
|--------|-------|--------|---------|
| `convert_torah_markers.py` | `Torah Audio Recording Markers.xlsx` + MP3s | `site/data/tanakh/*.json` + `site/audio/torah/*.mp3` | Torah audio sync data |
| `convert_gan_eden.py` | `gan-eden-v1.1.xlsx` | `site/data/texts/gan-eden.json` | Gan Eden text with glossary/footnotes |
| `build_citations.py` | `site/data/texts/*.json` + `site/data/tanakh/*.json` | `site/data/citations.json` | Bidirectional citation index |
| `audit_torah_markers.py` | `site/data/tanakh/*.json` + MP3s | Console report | Validates audio timing |
| `audit_text_sheets.py` | Text JSON files | Console report | Validates text-only Torah sheets |

---

## `convert_torah_markers.py`

**Purpose**: Reads Torah audio timing markers from Excel and merges them into Tanakh JSON.

### Input

- **`Torah Audio Recording Markers.xlsx`** (repo root)
  - Sheets: `Genesis`, `Exodus`, `Leviticus`, `Numbers`, `Deuteronomy`
  - Columns: `File name`, `Torah Portion`, `Traditional Shabbat Aliyah`, `Chapter`, `Verse`, `Time Starts`, `Time Ends`
  - Time format: SMPTE `HH:MM:SS:FF` at 30 fps non-drop
- **`Combined Parashiot by Aliya Folder/`** (repo root)
  - MP3 files named by parasha and aliyah

### Output

- Copies MP3s to `site/audio/torah/` with slugified names:
  - `01-bereshit-1-cohen.mp3`
  - `02-noach-2-levi.mp3`
  - `03-lech-lecha-3-yisreeli.mp3`
- Merges per-verse timing into `site/data/tanakh/<book>.json`:
  ```json
  {
    "audio": "audio/torah/01-bereshit-1-cohen.mp3",
    "timing": { "start": 0.0, "end": 8.0 },
    "aliyah": "1. Cohen",
    "parasha": "Bereshit"
  }
  ```
- Adds per-chapter `audioSegments`:
  ```json
  {
    "audioSegments": [
      { "label": "Bereshit · 1. Cohen", "url": "audio/torah/01-bereshit-1-cohen.mp3" }
    ]
  }
  ```

### Filename Normalization

The Excel and disk disagree on transliteration. The script normalizes by `(parasha-number, aliyah-number)`:

| Disk | Excel | Normalized |
|------|-------|------------|
| `Noach` | `Noah` | `noach` |
| `Lech` | `Lehc` | `lech` |
| `Yisreeli` | `Yisre'eli` | `yisreeli` |

### Running

```bash
cd /Users/shawn/karaite-texts
venv/bin/python convert_torah_markers.py
```

### Adding New Books

1. Populate the corresponding sheet in the xlsx with `File name`, `Torah Portion`, `Traditional Shabbat Aliyah`, `Chapter`, `Verse`, `Time Starts`, `Time Ends`
2. Drop MP3s into `Combined Parashiot by Aliya Folder/`
3. Re-run the script

---

## `convert_gan_eden.py`

**Purpose**: Converts the multi-sheet Gan Eden Excel workbook into site JSON.

### Input

- **`gan-eden-v1.1.xlsx`** (repo root)
  - 5 sheets: `Home`, `Intro`, `Glossary`, `Text Content`, `Footnotes`

### Output

- `site/data/texts/gan-eden.json`

### Processing Details

1. **Home sheet**: Extracts metadata (title, author, category)
2. **Intro sheet**: Reads introduction text (paragraphs)
3. **Glossary sheet**: Extracts 101 terms with Hebrew, transliteration, and definition
4. **Text Content sheet**: Reads 1117 paragraphs (Hebrew/English pairs)
   - Detects and strips leading quotes from Hebrew (apostrophe remnants from Excel)
   - Identifies footnote markers (e.g., "word¹") and converts to `{{fn:N}}` placeholders
5. **Footnotes sheet**: Reads 126 footnotes, formats as `1 word — definition 2 word — definition`
   - Stores as `comments` string on each verse

### Footnote Placeholder System

Footnote markers in the text use `{{fn:N}}` syntax:

```json
{
  "hebrew": "מילה {{fn:1}} מילה אחרת",
  "english": "word {{fn:1}} another word"
}
```

The `formatText()` function in `app.js` converts `{{fn:N}}` to `<sup class="fn-marker" data-fn="N">N</sup>` at render time.

**Why placeholders?** Storing raw `<sup>` tags in JSON caused HTML escaping issues. The placeholder system ensures clean JSON data that gets processed at render time.

### Running

```bash
cd /Users/shawn/karaite-texts
venv/bin/python convert_gan_eden.py
```

---

## `build_citations.py`

**Purpose**: Scans all text files and Tanakh books to build a bidirectional citation index.

### Input

- `site/data/texts/*.json` (134 files)
- `site/data/tanakh/*.json` (24 books)

### Output

- `site/data/citations.json`

### Citation Patterns Detected

The script scans for these patterns in `hebrew` and `english` fields:

1. **Hebrew parenthetical**: `(בראשית א, א)` or `(שמות טו, ב)`
2. **English references**: `Genesis 1:1`, `Exodus 15:2`

### Index Structure

```json
{
  "text_citations": {
    "gan-eden": [
      { "verse_ref": "genesis:1:1", "verse_index": 42 }
    ]
  },
  "verse_refs": {
    "genesis:1:1": [
      { "text_id": "gan-eden", "verse_index": 42, "text_title": "Gan Eden" }
    ]
  }
}
```

- `text_citations`: For each text, list of Tanakh verses it cites (with paragraph index)
- `verse_refs`: For each Tanakh verse, list of texts that cite it (with paragraph index)

### Running

```bash
cd /Users/shawn/karaite-texts
venv/bin/python build_citations.py
```

**Note**: This file is ~7MB. Large pushes may fail due to SSL timeout. Push commits one at a time if needed.

---

## `audit_torah_markers.py`

**Purpose**: Validates that audio timing markers don't exceed MP3 durations or regress.

### Checks

1. `Time Ends` for each row does not exceed the actual MP3 file duration
2. Start time for each row is >= the previous row's end time (no overlap/regression)

### Running

```bash
cd /Users/shawn/karaite-texts
venv/bin/python audit_torah_markers.py
```

### Output

Console report with any flagged rows.

---

## `audit_text_sheets.py`

**Purpose**: Validates text-only Torah sheets (Exodus, Leviticus, Numbers, Deuteronomy) for data quality.

### Running

```bash
cd /Users/shawn/karaite-texts
venv/bin/python audit_text_sheets.py
```

---

## General Conventions

### Virtual Environment

All scripts use the project's virtual environment:

```bash
cd /Users/shawn/karaite-texts
source venv/bin/activate
# or
venv/bin/python <script>.py
```

### Source Data Is Immutable

Excel files, MP3 folders, and other source data are **user-owned input**. Scripts read from them but never modify them. If a script needs to update something, it writes to `site/` (the deployable output).

### Reproducibility

Scripts are designed to be idempotent — running them multiple times produces the same output (given the same input). Always re-run the converter after updating source data.

---

*Last updated: 2026-06-02*
