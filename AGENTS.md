# Agent / contributor notes

Notes for AI assistants and humans editing this repo so we don't have to relearn things the hard way.

## UX conventions that look "redundant" but aren't

### The click-to-play toggle (`click-to-play-btn`) in the audio toolbar

There is a small musical-note button on the audio toolbar of every reader that has audio (Piyyutim and Tanakh). It toggles `clickToPlayMode` between off and on:

- **Off (default):** the per-verse `♪` icons are hidden, and clicking the verse text does **nothing audio-related**. This is intentional so users can select / highlight / copy verse text without the audio jumping around.
- **On:** the per-verse `♪` icons appear next to each verse with timing data. Clicking a `♪` seeks the audio to that verse and plays. Clicking the verse text itself still does nothing.

The top play / pause button on the toolbar is a *separate* control for sequential playback with verse highlighting. It works regardless of `clickToPlayMode`.

**Do NOT remove the click-to-play toggle button**, do **NOT** wire `onclick="seekToVerse(...)"` onto the whole `.verse` / `.tanakh-verse` div, and do **NOT** make `♪` icons visible by default. All three of these have been tried and rolled back; the toggle exists precisely so users can read text without accidental playback. If you think the toggle is redundant, you are about to repeat a mistake — leave it alone.

The toggle lives in two places in `site/js/app.js` (one inside the piyyut audio toolbar in `renderText`, one inside the Tanakh audio toolbar in `renderTanakhChapter`); both must stay in sync.

## Local dev: use `range_server.py`, not `python -m http.server`

Audio seeking (the click-to-play feature, the progress-bar scrubber, etc.) requires HTTP `Range` requests / `206 Partial Content` responses. Python's stdlib `http.server` returns plain `200 OK` for range requests, which silently breaks `audio.currentTime = X` — the value gets clobbered back to 0 and playback restarts from the top.

Run the site locally with the in-repo server instead:

```bash
cd site
python3 range_server.py
```

The script is at `site/range_server.py` and hard-codes port 8080.

If audio seeking suddenly stops working in dev, the first thing to check is whether you are accidentally serving via `http.server` again.

## Torah audio sync data flow

- Source of truth: `Torah Audio Recording Markers.xlsx` at the repo root, plus the MP3s in `Combined Parashiot by Aliya Folder/`.
- Converter: `convert_torah_markers.py` reads the xlsx, copies matched MP3s into `site/audio/torah/` with slugified names (`01-bereshit-1-cohen.mp3` etc.), converts SMPTE `HH:MM:SS:FF` (30 fps non-drop) to seconds, and merges per-verse `audio` + `timing` + `aliyah` + `parasha` plus per-chapter `audioSegments` into `site/data/tanakh/<book>.json`.
- Auditor: `audit_torah_markers.py` flags rows whose `Time Ends` exceeds the actual MP3 duration or whose start regresses below the previous row's end. Run after editing the xlsx.
- Auditor for the text-only Torah sheets (Exodus / Leviticus / Numbers / Deuteronomy): `audit_text_sheets.py`.
- Other Torah books are stubbed in the xlsx; once their `File name` / `Time Starts` / `Time Ends` columns are populated, re-running `convert_torah_markers.py` is the only step needed.

Filename normalization in the converter is by `(parasha-number, aliyah-number)` because the xlsx and disk disagree on transliteration (`Noah` vs `Noach`, `Lehc` vs `Lech`, `Yisre'eli` vs `Yisre_eli`) and on whether `.mp3` is included.

## Drive → GitHub auto-sync

`.github/workflows/sync-torah-audio.yml` pulls MP3s from Google Drive via a
service account, runs the converter + audit, and opens a PR. One-time setup
is documented at `.github/workflows/SETUP-sync-torah-audio.md` (requires two
GitHub secrets: `GDRIVE_SA_KEY` and `GDRIVE_FOLDER_ID`). Trigger manually
from the Actions tab; runs in ~5–15 min; never pushes directly to a branch
— always opens a PR for human review.

## Footnote Placeholder Convention (`{{fn:N}}`)

Footnote markers in text JSON use a placeholder syntax that gets converted to HTML at render time:

```json
{
  "hebrew": "מילה {{fn:1}} מילה אחרת",
  "english": "word {{fn:1}} another word"
}
```

The `formatText()` function in `app.js` converts `{{fn:N}}` to `<sup class="fn-marker" data-fn="N">N</sup>`.

**Why not store raw `<sup>` in JSON?** Because the JSON gets HTML-escaped when rendered, causing the tags to appear as literal text. The placeholder system ensures clean JSON data that gets processed at render time.

**Always use `{{fn:N}}` for footnote markers in text content.**

## Push to `feature/may-2026-updates`, NOT `main`

Netlify is configured to watch `feature/may-2026-updates` for auto-deploy. Pushing to `main` will NOT trigger a deploy.

```bash
# CORRECT:
git push origin HEAD:feature/may-2026-updates

# WRONG (won't deploy):
git push origin main
```

## Diglot-image layout (al-Kalim et al.)

Some HTML-sourced books (starting with `al-kalim`) ship with facsimile page scans instead of a Hebrew original, and render as image-left / translation-right. To opt in, the text JSON sets two flags at the top level:

```json
{
  "layout": "diglot-image",
  "no_column_toggles": true,
  "sections": {
    "text": { "articles": [ /* article objects, not `content` */ ] }
  }
}
```

Under this layout the Text tab is rendered by `renderDiglotArticle()` in `site/js/app.js` (grid rows: cover-left/caption-right, then scan-left/paragraphs-right per scan). The Hebrew/Transliteration/English toggle buttons are hidden when `no_column_toggles` is true; only the Notes toggle remains if any paragraph has `comments`. The Introduction tab still uses the standard verse-list renderer.

Article objects live under `sections.text.articles`, each with `section_id`, `issue_banner`, `cover_image`, `cover_caption`, `title`, `byline`, and one or more `scans: [{ image, paragraphs: [{ english, comments? }, ...] }]`.

## Placeholder markers for HTML-sourced text

`formatText()` in `site/js/app.js` recognizes a growing family of `{{name:...}}` placeholders that survive HTML-escape and get rewritten at render time. This is deliberate: the JSON stays escape-safe, and the converter can emit intent without embedding raw HTML that would be shown literally.

- `{{fn:N}}` → `<sup class="fn-marker" data-fn="N">N</sup>` (footnote reference)
- `{{em:text}}` → `<em>text</em>` (converters flatten nested `<em>`)
- `{{center:text}}` → `<div class="fmt-center">text</div>`
- `{{frontmatter:text}}` → `<div class="fmt-frontmatter">text</div>` (preserves `\n` via `white-space: pre-line`)
- `{{hN:text}}` → `<div class="fmt-heading fmt-heading-hN">text</div>`

Use these instead of raw HTML when writing new converters. If you need a new marker, add it to both `formatText()` and the appropriate `.fmt-*` CSS class.

## Categories & top-nav

Catalog categories live at the top level of `site/data/catalog.json`. The current set is `Commentary`, `Exhortatory`, `Halakhah`, `Liturgy`, `Polemics`, and `General`. The navbar links in `site/index.html` mirror this, and `categoryOrder` in `site/js/app.js` controls the order on the "All Texts" page.

`General` used to be called `Other`. If you find leftover references to the old name in new converters or fallback strings, rename them: the string appears as a category value in each text JSON's `category` field.

## Don'ts

- Don't auto-modify the xlsx or the source MP3 folder. Treat them as user-owned input.
- Don't ship debug `console.log` calls in `site/js/app.js`. The two pre-existing ones (search-index ready, track switching) predate everything else and can stay; new ones added during debugging must be removed.
- Don't use `python -m http.server` for local development. Use `range_server.py` instead (see above).
