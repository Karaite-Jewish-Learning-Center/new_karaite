# Karaite Texts

A minimal, forkable static site for exploring Karaite Jewish literature.

## Features

- **Simple data format**: All texts stored as JSON files
- **No build step**: Just HTML, CSS, and vanilla JavaScript
- **Works offline**: Open `index.html` directly in your browser
- **Easy to fork**: Add your own texts by creating JSON files
- **Responsive**: Works on mobile and desktop
- **Dark mode**: Automatically adapts to system preference

## Structure

```
karaite-texts/
├── index.html          # Single page app entry point
├── css/
│   └── style.css       # All styles in one file
├── js/
│   └── app.js          # All JavaScript in one file
├── data/
│   ├── catalog.json    # Index of all texts
│   └── texts/          # Individual text JSON files
├── audio/              # MP3 files for songs (optional)
└── README.md
```

## Text JSON Format

Each text is a JSON file with this structure:

```json
{
  "id": "essa-bechos-yesha",
  "title_en": "Essa Bechos Yesha'",
  "title_he": "אשא בכוס ישע",
  "category": "Liturgy",
  "subcategory": "Havdala Songs",
  "introduction": "This poem for Havdala begins with...",
  "about_author": "Zeraḥ ben Natan was a Karaite scholar...",
  "metadata": {
    "composer": "Zeraḥ ben Natan",
    "location": "Troki, Lithuania",
    "date": "1586-1640"
  },
  "content": [
    {
      "hebrew": "אֶשָּׂא בְּכוֹס יֶשַׁע",
      "transliteration": "Essa bechos yesha'",
      "english": "I shall raise the cup of deliverance"
    }
  ],
  "audio": "essa-bechos-yesha.mp3"
}
```

## Adding a New Text

1. Create a JSON file in `data/texts/` following the format above
2. Add an entry to `data/catalog.json`:
   ```json
   {
     "id": "your-text-id",
     "title_en": "Your Text Title",
     "title_he": "כותרת",
     "category": "Liturgy",
     "subcategory": "Your Subcategory"
   }
   ```
3. That's it! The text will appear in the navigation.

## Running Locally

Option 1: Just open `index.html` in your browser (may have CORS issues with some browsers)

Option 2: Run a local server:
```bash
# Python 3
python -m http.server 8080

# Then open http://localhost:8080
```

## Customizing

- **Styles**: Edit `css/style.css` - uses CSS custom properties for easy theming
- **Fonts**: Change the Google Fonts link in `index.html`
- **Logo/Title**: Edit the header in `index.html`

## License

Content: Various (see individual text sources)
Code: MIT

## Credits

Texts digitized by the Karaite Jews of America.
Based on the KJLC project at kjlc.karaites.org.
