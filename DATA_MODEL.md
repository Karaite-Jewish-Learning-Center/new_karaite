# Karaite Texts Library - Data Model

## Overview

This document describes the data structures used in the Karaite Texts Library, with particular attention to how texts relate to the weekly Torah portions (parashot).

## Important Distinction: Torah vs. Liturgy

The library contains three fundamentally different types of content related to the weekly Torah reading cycle:

| Type | Description | Example | Location |
|------|-------------|---------|----------|
| **Tanakh (Scripture)** | The actual biblical text | Genesis 1:1-6:8 (Parashat Bereshit) | `site/data/tanakh/`, `tanakh_data/` |
| **Torah Portion Piyyut** | A liturgical poem composed FOR a specific parasha | "Piyyut: Bereshit" by Aaron ben Joseph | `site/data/texts/01-bereshit.json` |
| **Text recited on a parasha** | A separate text traditionally recited DURING the week of a parasha | "Vehahochma" recited on Parashat Bereshit | `site/data/texts/vehahochma.json` |

**Key Point**: "Piyyut: Bereshit" is NOT the Torah portion Bereshit (Genesis 1:1-6:8). It is a medieval liturgical poem that accompanies the reading of that Torah portion during Shabbat morning services.

---

## Tanakh (Hebrew Scripture)

The actual biblical text, including the Torah (Five Books of Moses), Nevi'im (Prophets), and Ketuvim (Writings).

- **Location**: `site/data/tanakh/` and `tanakh_data/`
- **Display**: Accessible via "Tanakh" in the navigation
- **Structure**: Organized by book and chapter

### Torah audio sync fields (Genesis only at present)

`convert_torah_markers.py` reads `Torah Audio Recording Markers.xlsx` and merges per-verse audio data into `site/data/tanakh/<book>.json`. Verses that have markers gain:

```json
{
  "verse": 1,
  "hebrew": "...",
  "english": "...",
  "audio": "audio/torah/01-bereshit-1-cohen.mp3",
  "timing": { "start": 0.0, "end": 8.0 },
  "aliyah": "1. Cohen",
  "parasha": "Bereshit"
}
```

Each chapter object that has any audio also gets:

```json
{
  "chapter": 2,
  "audioSegments": [
    { "label": "Bereshit · 1. Cohen", "url": "audio/torah/01-bereshit-1-cohen.mp3" },
    { "label": "Bereshit · 2. Levi",  "url": "audio/torah/01-bereshit-2-levi.mp3" }
  ],
  "verses": [ ... ]
}
```

The Tanakh viewer renders the standard audio toolbar (play/pause, progress, click-to-play `♪` icons) when `audioSegments` is present. Each verse div carries `data-audio` plus `data-start`/`data-end` (seconds). Clicking a verse's `♪` swaps the player to that verse's MP3 if needed and seeks to the marker. Highlight-while-playing only applies to verses whose `audio` matches the active source.

To add new books: populate the corresponding sheet in the xlsx (`File name`, `Torah Portion`, `Traditional Shabbat Aliyah`, `Chapter`, `Verse`, `Time Starts`, `Time Ends` in SMPTE `HH:MM:SS:FF` at 30 fps), drop the MP3s into `Combined Parashiot by Aliya Folder/`, and re-run `venv/bin/python convert_torah_markers.py`.

The Torah is divided into 54 weekly portions (parashot) read throughout the year:

| Parasha | Torah Text | Book |
|---------|-----------|------|
| Bereshit | Genesis 1:1 - 6:8 | Genesis |
| Noach | Genesis 6:9 - 11:32 | Genesis |
| Lech Lecha | Genesis 12:1 - 17:27 | Genesis |
| ... | ... | ... |

**This is the actual Scripture** - distinct from the liturgical poems (piyyutim) that accompany the reading.

---

## Liturgical Text Categories

### 1. Torah Portion Piyyutim

Liturgical poems composed for specific weekly Torah portions. Multiple authors have composed piyyutim for the same parasha.

#### Primary Piyyutim (Aaron ben Joseph)

The standard set of 54 piyyutim by Aaron ben Joseph (c. 1250-1320), one for each parasha. These are the default poems used in Karaite services.

- **Location**: `site/data/texts/` with numeric prefixes (e.g., `01-bereshit.json`, `02-noah.json`)
- **Naming Convention**: `Piyyut: <Parasha Name>` (e.g., "Piyyut: Bereshit")
- **Display**: Shown as the main entry for each parasha in "Poems for the Weekly Torah Portion"

Example:
```json
{
  "id": "01-bereshit",
  "title_en": "Piyyut: Bereshit",
  "title_he": "בראשית",
  "parasha": "bereshit",
  "has_intro": false,
  "hasAudio": true,
  "author_en": "Aaron ben Joseph"
}
```

#### Alternative Piyyutim (Other Authors)

Other poets have also composed piyyutim for the weekly Torah portions. These are supplemental/alternative versions.

- **Naming Convention**: `Piyyut: <Parasha Name> (by <Author Name>)` 
- **Required Fields**: 
  - `parasha`: Links to the Torah portion (e.g., "bereshit", "vayyetze")
  - `author_en`: The author's name
- **Display**: Shown as supplemental entries under the same parasha

Example:
```json
{
  "id": "07b-vayyetze-by-abraham-ben-judah",
  "title_en": "Piyyut: Vayyetze (by Abraham ben Judah)",
  "title_he": "ויצא (אברהם בן יהודה)",
  "parasha": "vayyetze",
  "has_intro": false,
  "author_en": "Abraham ben Judah"
}
```

#### Parasha Field Values

The `parasha` field uses lowercase identifiers matching the Torah portions:

| # | Parasha ID | English Name | Book |
|---|------------|--------------|------|
| 1 | `bereshit` | Bereshit | Genesis |
| 2 | `noach` | Noach | Genesis |
| 3 | `lech-lekha` | Lech Lecha | Genesis |
| 4 | `vayyera` | Vayyera | Genesis |
| 5 | `chayyei-sarah` | Chayyei Sarah | Genesis |
| 6 | `toldot` | Toldot | Genesis |
| 7 | `vayyetze` | Vayyetze | Genesis |
| ... | ... | ... | ... |

(Full list of 54 parashot available in standard Torah portion references)

### 2. Texts Recited on Specific Parashot

Some texts are traditionally recited during the week of particular Torah portions but are **not** the designated piyyut for those parashot. These are separate compositions associated with one or more parashot.

- **Examples**: 
  - "Vehahochma" recited on Parashat Bereshit
  - "Vehoshia" recited on multiple specific parashot throughout the year
- **Data Model**: Use the `recited_on_parashot` field (array) to link the text to its associated parashot

#### Single Parasha

```json
{
  "id": "vehahochma",
  "title_en": "Vehahochma",
  "category": "Liturgy",
  "recited_on_parashot": ["bereshit"],
  "content": [...]
}
```

#### Multiple Parashot

```json
{
  "id": "vehoshia",
  "title_en": "Vehoshia",
  "category": "Liturgy",
  "recited_on_parashot": ["vayyetze", "beshalach", "bamidbar"],
  "content": [...]
}
```

This supports:
- Texts recited on a single parasha
- Texts recited on multiple specific parashot
- Multiple texts recited on the same parasha

### 3. Weekly Kedushot

The five Kedushot (sanctification prayers) used in rotating order throughout the year during Shabbat morning services:

1. **Atta Qadosh** (אַתָּה קָדוֹשׁ) - First Qedusha: Ve'atta Qadosh
2. **Essa Lamerahoq** (אֶשָּׂא לְמֵרָחוֹק) - Second Qedusha: Go'alenu  
3. **El Mistatter** (אֵל מִסְתַּתֵּר) - Third Qedusha: Qadosh Qadosh
4. **Addir Venora** (אַדִּיר וְנוֹרָא) - Fourth Qedusha: Barukh Kevod
5. **Eḥad Elohenu** (אֶחָד אֱלֹהֵֽינוּ) - Fifth Qedusha: Shema' Yisrael

- **Location**: `site/data/texts/` with letter prefixes (e.g., `a-atta-qadosh.json`)
- **Display**: Shown in "Shabbat Morning Services" under "Kedushot for Standard Shabbat Services"

## Key Distinction

| Type | Example | Author | Relationship to Parasha | Field |
|------|---------|--------|------------------------|-------|
| Tanakh | Genesis 1:1-6:8 | (Scripture) | IS the actual Torah portion Bereshit | N/A |
| Primary Piyyut | "Piyyut: Bereshit" | Aaron ben Joseph | Poem composed FOR Parashat Bereshit | `parasha` |
| Alternative Piyyut | "Piyyut: Vayyetze (by Abraham ben Judah)" | Abraham ben Judah | Alternative poem FOR Parashat Vayyetze | `parasha` |
| Text Recited on Parashot | "Vehoshia" | (various) | Recited DURING the week(s) of specific parashot | `recited_on_parashot` (array) |
| Weekly Kedusha | "Atta Qadosh" | (various) | Rotates weekly, not tied to specific parasha | N/A |

## Data Files

### catalog.json

Master index of all texts, organized by category and subcategory.

### shabbat-morning-services.json

Structured data for the Shabbat Morning Services display, containing:
- `Poems for the Weekly Torah Portion`: Organized by book (Genesis, Exodus, etc.) with each parasha's piyyut
- `Poems for the Weekly Sabbath`: General Shabbat poems

**Important**: Menu item names in this file must exactly match the `title_en` field in catalog.json (including the "Piyyut:" prefix).

## Adding New Texts

### Adding an Alternative Torah Portion Piyyut (by another author)

When adding a piyyut for a parasha by an author other than Aaron ben Joseph:

1. Create JSON file in `site/data/texts/` 
   - Use format: `<parasha-number><letter>-<parasha-name>-by-<author>.json`
   - Example: `07b-vayyetze-by-abraham-ben-judah.json`

2. Include required fields in the JSON:
   ```json
   {
     "id": "07b-vayyetze-by-abraham-ben-judah",
     "title_en": "Piyyut: Vayyetze (by Abraham ben Judah)",
     "title_he": "ויצא (אברהם בן יהודה)",
     "parasha": "vayyetze",
     "author_en": "Abraham ben Judah",
     "category": "Liturgy",
     "content": [...]
   }
   ```

3. Add entry to `catalog.json` under `Liturgy > Supplemental Readings for specific Torah portions`

4. Add entry to `shabbat-morning-services.json` under the appropriate book, with `menu_item` matching `title_en`

### Adding a Text Recited on Specific Parashot

For texts that are recited during the week of a parasha but are not piyyutim for that parasha:

1. Create JSON file in `site/data/texts/`

2. Include the `recited_on_parashot` field (always an array, even for single parasha):
   ```json
   {
     "id": "vehoshia",
     "title_en": "Vehoshia",
     "category": "Liturgy",
     "recited_on_parashot": ["vayyetze", "beshalach", "bamidbar"],
     "content": [...]
   }
   ```

3. Add entry to appropriate category in `catalog.json`

4. (Optional) The UI can display which parashot a text is associated with, and when viewing a parasha, show all texts recited on that week

---

## KJLC Notes Display Formatting

The `formatComments` function in `app.js` supports two display modes for KJLC Notes:

### Term Definition Style (Liturgy/Commentary)

Used when comments define specific words or phrases from the text.

**Pattern**: "Term. Definition." or "Term: Definition."

**Example**: "Jeshurun. The Israelites." or "Father of a multitude. Abraham."

**Display**: The term before the period/colon is bolded/highlighted.

**Applies to**: `category: "Liturgy"` or `category: "Commentary"`

### Scholarly Footnote Style (Books)

Used when comments are full explanatory notes, not term definitions.

**Pattern**: "[1] Full sentence explaining context..." or numbered footnotes with em-dashes.

**Example**: "[1] Charles XII (reigned 1697–1718)." or "[9] Babovich uses the Egyptian Arabic form..."

**Display**: Plain text, no term highlighting.

**Applies to**: `category: "Halakhah"`, `category: "Polemics"`, `category: "Exhortatory"`, `category: "Other"`

### Determining Style for New Texts

When adding a new text, scan the comments to determine which style applies:

1. **If comments consistently define individual words/phrases** (e.g., "Hofra'. Pharaoh." or "Mount Mor. Mount Sinai.") → Use Liturgy/Commentary category
2. **If comments are full explanatory sentences** (e.g., "[1] This refers to the historical context..." or scholarly footnotes) → Use Halakhah/Polemics/Other category

The `isLiturgyOrCommentary` flag is passed to `formatComments()` based on the text's category.

---

*Last updated: 2026-05-25*
