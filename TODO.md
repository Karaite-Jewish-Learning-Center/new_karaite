# Karaite Texts Library - Open Items

## Data Issues

### Incomplete Texts (Missing Content)
- [x] **Gan Eden** (`gan-eden.json`) - COMPLETE: 1117 entries, 101 glossary terms, 126 footnotes
- [ ] **An Essay on the Obligation of Prayer** (`an-essay-on-the-obligation-of-prayer.json`) - Very few entries
- [ ] **Vehoshia** (`vehoshia.json`) - Very few entries

### Missing English Translations
- [ ] **Adderet Eliyahu** (`adderet-eliyahu.json`) - 3170/3209 entries missing English (99%)
- [ ] **Adderet Eliyahu Appendices** (`adderet-eliyahu-appendices.json`) - 99/103 entries missing English (96%)
- [ ] **Yeriot Shelomo Volume 2** (`shelomo-afeida-hakohen_yeriot-shelomo_volume-2.json`) - 25/25 missing English (100%)

### Data Quality / Alignment Issues
- [ ] Review all texts for Hebrew/English alignment issues
- [ ] Check for Hebrew text incorrectly parsed as transliteration
- [ ] Royal Attire - verify footnotes are displaying correctly

---

## Features

### Completed
- [x] **KJLC Notes Side Panel** - Positioned notes at footnote marker Y-level with collapsible headers showing Hebrew incipit
- [x] **Biblical Verse Linking** - Works across all texts via `formatText()` pattern detection
- [x] **Verse Citation Cross-References** - Full bidirectional index: 27K+ citations from 108 texts, 8.5K unique verse keys
- [x] **Deep Links to Citations** - Side panel shows full chapter context, click to navigate to verse in Tanakh
- [x] **Sticky Header** - Reader header/toolbar stays fixed while scrolling
- [x] **Piyyut Parasha Renaming** - Torah portion piyyutim display as "Piyyut Parasha: Name"

### Chatbot
- [x] RAG server implemented (`site/chatbot/rag_server.py`)
- [x] Chat widget integrated (`site/js/chat-widget.js`)
- [x] Embeddings index built (2454 chunks)
- [ ] Consider cloud deployment for public access (currently localhost only)

### Audio
- [x] Audio sync working for texts with timing markers
- [x] Torah audio sync in Tanakh viewer - Genesis chapters 1-17 (Bereshit, Noach, Lech Lecha) playable with verse-by-verse timing from `Torah Audio Recording Markers.xlsx`. Other Torah books are stubbed - drop their markers into the same xlsx and re-run `convert_torah_markers.py`.
- [ ] **Multiple recordings per song** - Some songs have multiple versions (e.g., traditional + alternative melodies)
  - Shabbat Menuha - needs traditional melody AND Hallelujah tune version
  - Matsa Ish-sha Matsa Tov - should have multiple recordings
  - Toggle between versions not working properly
- [ ] **Audio sync for more songs** - Many songs have recordings but no timing markers
  - Option: Use Whisper AI to auto-generate timing (cost consideration)
  - Option: Manual timing entry
- [ ] Fill in Exodus / Leviticus / Numbers / Deuteronomy markers in `Torah Audio Recording Markers.xlsx` and re-run `convert_torah_markers.py`
- [ ] Track down additional song versions and add to `/audio` directory

---

## UI/Display

### Completed
- [x] Line numbers display (Sefer Milhamot) - right-aligned
- [x] Footnote markers - accent color, smaller size
- [x] Hebrew footnotes - proper RTL formatting
- [x] Mixed English/Hebrew content detection
- [x] TOC navigation with section links
- [x] Kitab al-Anwar multi-section layout (Intro + 9 translation sections)
- [x] Ma'aravi multi-section layout (Intro + Text + Appendices)

### Potential Improvements
- [ ] Mobile responsive improvements
- [ ] Print stylesheet
- [ ] Dark mode refinements

### Tanakh
- [x] Full Tanakh with Hebrew and English translation
- [x] Books displayed right-to-left (Genesis/Bereshit on right)
- [x] Link verses to where they're cited in Karaite texts (cross-reference feature)
- [x] Torah audio sync: Genesis chapters 1-17 with verse-by-verse timing
- [ ] Torah audio sync: Exodus, Leviticus, Numbers, Deuteronomy (stubbed, needs markers)

---

## Documentation
- [x] **ARCHITECTURE.md** - Full app architecture, rendering pipeline, state management
- [x] **CONVERTERS.md** - All Python conversion scripts documented
- [x] **DEPLOYMENT.md** - Netlify deployment process (updated from DigitalOcean)
- [x] **AGENTS.md** - UX conventions, gotchas, footnote placeholder system
- [ ] Consider adding inline JSDoc comments to app.js key functions

## Technical Debt
- [ ] Consolidate conversion scripts (multiple Python scripts for different sources)
- [ ] Add automated tests for conversion scripts
- [ ] Document Excel/XML source format requirements

---

## Content Stats
- **Total texts in catalog**: 131
- **Total JSON files**: 133
- **Chatbot index**: 2454 searchable chunks

---

---

## Notes

- Session `374864e6-9a58-4ac4-8d84-c911c582ac1a` was for the **old Django-based KJLC system** (`/Users/shawn/knowledge-chatbot/documents/new_karaite/`), not this static site. Issues from that session (Hebrew title fixes, etc.) apply to the old system.

*Last updated: 2026-05-19*
