#!/usr/bin/env python3
"""
Download the complete Tanakh from Sefaria API
Hebrew + English translation, verse by verse
"""

import json
import time
import urllib.request
from pathlib import Path

# Tanakh structure
TANAKH = {
    "Torah": [
        ("Genesis", "בראשית", 50),
        ("Exodus", "שמות", 40),
        ("Leviticus", "ויקרא", 27),
        ("Numbers", "במדבר", 36),
        ("Deuteronomy", "דברים", 34),
    ],
    "Prophets": [
        ("Joshua", "יהושע", 24),
        ("Judges", "שופטים", 21),
        ("I Samuel", "שמואל א", 31),
        ("II Samuel", "שמואל ב", 24),
        ("I Kings", "מלכים א", 22),
        ("II Kings", "מלכים ב", 25),
        ("Isaiah", "ישעיהו", 66),
        ("Jeremiah", "ירמיהו", 52),
        ("Ezekiel", "יחזקאל", 48),
        ("Hosea", "הושע", 14),
        ("Joel", "יואל", 4),
        ("Amos", "עמוס", 9),
        ("Obadiah", "עובדיה", 1),
        ("Jonah", "יונה", 4),
        ("Micah", "מיכה", 7),
        ("Nahum", "נחום", 3),
        ("Habakkuk", "חבקוק", 3),
        ("Zephaniah", "צפניה", 3),
        ("Haggai", "חגי", 2),
        ("Zechariah", "זכריה", 14),
        ("Malachi", "מלאכי", 3),
    ],
    "Writings": [
        ("Psalms", "תהלים", 150),
        ("Proverbs", "משלי", 31),
        ("Job", "איוב", 42),
        ("Song of Songs", "שיר השירים", 8),
        ("Ruth", "רות", 4),
        ("Lamentations", "איכה", 5),
        ("Ecclesiastes", "קהלת", 12),
        ("Esther", "אסתר", 10),
        ("Daniel", "דניאל", 12),
        ("Ezra", "עזרא", 10),
        ("Nehemiah", "נחמיה", 13),
        ("I Chronicles", "דברי הימים א", 29),
        ("II Chronicles", "דברי הימים ב", 36),
    ],
}

def clean_text(text):
    """Remove HTML tags and footnotes"""
    import re
    # Remove footnote markers and content
    text = re.sub(r'<sup[^>]*>.*?</sup>', '', text)
    text = re.sub(r'<i class="footnote">.*?</i>', '', text)
    # Remove other HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Clean up whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def fetch_chapter(book_en, chapter):
    """Fetch a chapter from Sefaria API"""
    # URL encode book name
    book_url = book_en.replace(" ", "%20")
    url = f"https://www.sefaria.org/api/v3/texts/{book_url}.{chapter}?version=english|all&version=hebrew|all"
    
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        return data
    except Exception as e:
        print(f"  Error fetching {book_en} {chapter}: {e}")
        return None

def process_tanakh():
    output_dir = Path("tanakh_data")
    output_dir.mkdir(exist_ok=True)
    
    all_books = []
    
    for section, books in TANAKH.items():
        print(f"\n{'='*60}")
        print(f"SECTION: {section}")
        print('='*60)
        
        for book_en, book_he, num_chapters in books:
            print(f"\n{book_en} ({book_he}) - {num_chapters} chapters")
            
            book_data = {
                "id": book_en.lower().replace(" ", "-"),
                "title_en": book_en,
                "title_he": book_he,
                "section": section,
                "chapters": []
            }
            
            for ch in range(1, num_chapters + 1):
                print(f"  Chapter {ch}...", end=" ", flush=True)
                
                data = fetch_chapter(book_en, ch)
                if not data:
                    print("FAILED")
                    continue
                
                # Extract Hebrew and English
                hebrew_text = None
                english_text = None
                
                for version in data.get("versions", []):
                    if version.get("language") == "he":
                        hebrew_text = version.get("text", [])
                    elif version.get("language") == "en":
                        english_text = version.get("text", [])
                
                if not hebrew_text or not english_text:
                    print("NO TEXT")
                    continue
                
                chapter_data = {
                    "chapter": ch,
                    "verses": []
                }
                
                for v, (he, en) in enumerate(zip(hebrew_text, english_text), 1):
                    chapter_data["verses"].append({
                        "verse": v,
                        "hebrew": clean_text(he) if isinstance(he, str) else he,
                        "english": clean_text(en) if isinstance(en, str) else en,
                    })
                
                book_data["chapters"].append(chapter_data)
                print(f"{len(chapter_data['verses'])} verses")
                
                # Rate limiting
                time.sleep(0.3)
            
            # Save book
            book_file = output_dir / f"{book_data['id']}.json"
            with open(book_file, 'w', encoding='utf-8') as f:
                json.dump(book_data, f, ensure_ascii=False, indent=2)
            
            all_books.append({
                "id": book_data["id"],
                "title_en": book_en,
                "title_he": book_he,
                "section": section,
                "chapters": num_chapters
            })
            
            print(f"  Saved: {book_file}")
    
    # Save index
    index_file = output_dir / "index.json"
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump({"books": all_books}, f, ensure_ascii=False, indent=2)
    
    print(f"\n\nDone! Saved {len(all_books)} books to {output_dir}/")

if __name__ == "__main__":
    process_tanakh()
