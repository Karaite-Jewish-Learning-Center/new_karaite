#!/usr/bin/env python3
"""
Build bidirectional citations index from all texts to Tanakh and back.
Scans all text JSON files for biblical references and creates:
1. text_citations: textId -> list of {book, chapter, verse, verse_index}
2. verse_refs: "book:chapter:verse" -> list of {text_id, text_title, verse_index}
"""
import json
import re
import os
from pathlib import Path

# Book name mappings (English and Hebrew to canonical ID)
BOOK_MAPPINGS = {
    # Torah
    'genesis': 'genesis', 'gen': 'genesis', 'gen.': 'genesis', 'gn': 'genesis',
    'בראשית': 'genesis', 'בר': 'genesis',
    'exodus': 'exodus', 'exod': 'exodus', 'exod.': 'exodus', 'ex': 'exodus', 'ex.': 'exodus',
    'שמות': 'exodus', 'שמ': 'exodus',
    'leviticus': 'leviticus', 'lev': 'leviticus', 'lev.': 'leviticus', 'lv': 'leviticus',
    'ויקרא': 'leviticus', 'וי': 'leviticus',
    'numbers': 'numbers', 'num': 'numbers', 'num.': 'numbers', 'nm': 'numbers',
    'במדבר': 'numbers', 'במ': 'numbers',
    'deuteronomy': 'deuteronomy', 'deut': 'deuteronomy', 'deut.': 'deuteronomy', 'dt': 'deuteronomy',
    'דברים': 'deuteronomy', 'דב': 'deuteronomy',
    
    # Prophets
    'joshua': 'joshua', 'josh': 'joshua', 'josh.': 'joshua',
    'יהושע': 'joshua',
    'judges': 'judges', 'judg': 'judges', 'judg.': 'judges', 'jdg': 'judges',
    'שופטים': 'judges',
    'i samuel': 'i-samuel', '1 samuel': 'i-samuel', '1 sam': 'i-samuel', '1sam': 'i-samuel',
    'i sam': 'i-samuel', 'i sam.': 'i-samuel', '1 sam.': 'i-samuel', 'sam.': 'i-samuel',
    'שמואל א': 'i-samuel', 'שמ״א': 'i-samuel', 'שמא': 'i-samuel',
    'ii samuel': 'ii-samuel', '2 samuel': 'ii-samuel', '2 sam': 'ii-samuel', '2sam': 'ii-samuel',
    'ii sam': 'ii-samuel', 'ii sam.': 'ii-samuel', '2 sam.': 'ii-samuel',
    'שמואל ב': 'ii-samuel', 'שמ״ב': 'ii-samuel', 'שמב': 'ii-samuel',
    'i kings': 'i-kings', '1 kings': 'i-kings', '1 kgs': 'i-kings', '1kgs': 'i-kings',
    'i kgs': 'i-kings', 'i kgs.': 'i-kings', '1 kgs.': 'i-kings',
    'מלכים א': 'i-kings', 'מל״א': 'i-kings', 'מלא': 'i-kings',
    'ii kings': 'ii-kings', '2 kings': 'ii-kings', '2 kgs': 'ii-kings', '2kgs': 'ii-kings',
    'ii kgs': 'ii-kings', 'ii kgs.': 'ii-kings', '2 kgs.': 'ii-kings',
    'מלכים ב': 'ii-kings', 'מל״ב': 'ii-kings', 'מלב': 'ii-kings',
    'isaiah': 'isaiah', 'isa': 'isaiah', 'isa.': 'isaiah', 'is': 'isaiah',
    'ישעיהו': 'isaiah', 'ישע': 'isaiah', 'יש': 'isaiah',
    'jeremiah': 'jeremiah', 'jer': 'jeremiah', 'jer.': 'jeremiah',
    'ירמיהו': 'jeremiah', 'ירמ': 'jeremiah',
    'ezekiel': 'ezekiel', 'ezek': 'ezekiel', 'ezek.': 'ezekiel', 'ez': 'ezekiel',
    'יחזקאל': 'ezekiel', 'יחז': 'ezekiel',
    'hosea': 'hosea', 'hos': 'hosea', 'hos.': 'hosea',
    'הושע': 'hosea',
    'joel': 'joel', 'jl': 'joel',
    'יואל': 'joel',
    'amos': 'amos', 'am': 'amos',
    'עמוס': 'amos',
    'obadiah': 'obadiah', 'obad': 'obadiah', 'obad.': 'obadiah', 'ob': 'obadiah',
    'עובדיה': 'obadiah',
    'jonah': 'jonah', 'jon': 'jonah', 'jon.': 'jonah',
    'יונה': 'jonah',
    'micah': 'micah', 'mic': 'micah', 'mic.': 'micah',
    'מיכה': 'micah',
    'nahum': 'nahum', 'nah': 'nahum', 'nah.': 'nahum', 'na': 'nahum',
    'נחום': 'nahum',
    'habakkuk': 'habakkuk', 'hab': 'habakkuk', 'hab.': 'habakkuk',
    'חבקוק': 'habakkuk',
    'zephaniah': 'zephaniah', 'zeph': 'zephaniah', 'zeph.': 'zephaniah',
    'צפניה': 'zephaniah',
    'haggai': 'haggai', 'hag': 'haggai', 'hag.': 'haggai',
    'חגי': 'haggai',
    'zechariah': 'zechariah', 'zech': 'zechariah', 'zech.': 'zechariah',
    'זכריה': 'zechariah',
    'malachi': 'malachi', 'mal': 'malachi', 'mal.': 'malachi',
    'מלאכי': 'malachi',
    
    # Writings
    'psalms': 'psalms', 'psalm': 'psalms', 'ps': 'psalms', 'ps.': 'psalms', 'pss': 'psalms',
    'תהלים': 'psalms', 'תהל': 'psalms', 'תה': 'psalms',
    'proverbs': 'proverbs', 'prov': 'proverbs', 'prov.': 'proverbs', 'pr': 'proverbs',
    'משלי': 'proverbs',
    'job': 'job', 'jb': 'job',
    'איוב': 'job',
    'song of songs': 'song-of-songs', 'song': 'song-of-songs', 'songs': 'song-of-songs',
    'song of solomon': 'song-of-songs', 'cant': 'song-of-songs', 'cant.': 'song-of-songs',
    'שיר השירים': 'song-of-songs', 'שה״ש': 'song-of-songs', 'שהש': 'song-of-songs',
    'ruth': 'ruth', 'ru': 'ruth',
    'רות': 'ruth',
    'lamentations': 'lamentations', 'lam': 'lamentations', 'lam.': 'lamentations',
    'איכה': 'lamentations',
    'ecclesiastes': 'ecclesiastes', 'eccl': 'ecclesiastes', 'eccl.': 'ecclesiastes', 'eccles': 'ecclesiastes',
    'qoh': 'ecclesiastes', 'qoheleth': 'ecclesiastes', 'kohelet': 'ecclesiastes',
    'קהלת': 'ecclesiastes',
    'esther': 'esther', 'est': 'esther', 'est.': 'esther', 'esth': 'esther',
    'אסתר': 'esther',
    'daniel': 'daniel', 'dan': 'daniel', 'dan.': 'daniel', 'dn': 'daniel',
    'דניאל': 'daniel',
    'ezra': 'ezra', 'ezr': 'ezra',
    'עזרא': 'ezra',
    'nehemiah': 'nehemiah', 'neh': 'nehemiah', 'neh.': 'nehemiah',
    'נחמיה': 'nehemiah',
    'i chronicles': 'i-chronicles', '1 chronicles': 'i-chronicles', '1 chr': 'i-chronicles',
    'i chr': 'i-chronicles', 'i chr.': 'i-chronicles', '1 chr.': 'i-chronicles',
    'דברי הימים א': 'i-chronicles', 'דה״א': 'i-chronicles', 'דהא': 'i-chronicles',
    'ii chronicles': 'ii-chronicles', '2 chronicles': 'ii-chronicles', '2 chr': 'ii-chronicles',
    'ii chr': 'ii-chronicles', 'ii chr.': 'ii-chronicles', '2 chr.': 'ii-chronicles',
    'דברי הימים ב': 'ii-chronicles', 'דה״ב': 'ii-chronicles', 'דהב': 'ii-chronicles',
}

# Hebrew numerals to Arabic
HEBREW_NUMERALS = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'יא': 11, 'יב': 12, 'יג': 13, 'יד': 14, 'טו': 15, 'טז': 16,
    'יז': 17, 'יח': 18, 'יט': 19, 'כ': 20, 'כא': 21, 'כב': 22, 'כג': 23,
    'כד': 24, 'כה': 25, 'כו': 26, 'כז': 27, 'כח': 28, 'כט': 29, 'ל': 30,
    'לא': 31, 'לב': 32, 'לג': 33, 'לד': 34, 'לה': 35, 'לו': 36, 'לז': 37,
    'לח': 38, 'לט': 39, 'מ': 40, 'מא': 41, 'מב': 42, 'מג': 43, 'מד': 44,
    'מה': 45, 'מו': 46, 'מז': 47, 'מח': 48, 'מט': 49, 'נ': 50,
    'נא': 51, 'נב': 52, 'נג': 53, 'נד': 54, 'נה': 55, 'נו': 56, 'נז': 57,
    'נח': 58, 'נט': 59, 'ס': 60, 'סא': 61, 'סב': 62, 'סג': 63, 'סד': 64,
    'סה': 65, 'סו': 66, 'ע': 70, 'עא': 71, 'עב': 72, 'עג': 73, 'עד': 74,
    'עה': 75, 'עו': 76, 'עז': 77, 'עח': 78, 'עט': 79, 'פ': 80, 'פא': 81,
    'פב': 82, 'פג': 83, 'פד': 84, 'פה': 85, 'פו': 86, 'פז': 87, 'פח': 88,
    'פט': 89, 'צ': 90, 'צא': 91, 'צב': 92, 'צג': 93, 'צד': 94, 'צה': 95,
    'צו': 96, 'צז': 97, 'צח': 98, 'צט': 99, 'ק': 100,
    'קא': 101, 'קב': 102, 'קג': 103, 'קד': 104, 'קה': 105, 'קו': 106,
    'קז': 107, 'קח': 108, 'קט': 109, 'קי': 110, 'קיא': 111, 'קיב': 112,
    'קיג': 113, 'קיד': 114, 'קטו': 115, 'קטז': 116, 'קיז': 117, 'קיח': 118,
    'קיט': 119, 'קכ': 120, 'קכא': 121, 'קכב': 122, 'קכג': 123, 'קכד': 124,
    'קכה': 125, 'קכו': 126, 'קכז': 127, 'קכח': 128, 'קכט': 129, 'קל': 130,
    'קלא': 131, 'קלב': 132, 'קלג': 133, 'קלד': 134, 'קלה': 135, 'קלו': 136,
    'קלז': 137, 'קלח': 138, 'קלט': 139, 'קמ': 140, 'קמא': 141, 'קמב': 142,
    'קמג': 143, 'קמד': 144, 'קמה': 145, 'קמו': 146, 'קמז': 147, 'קמח': 148,
    'קמט': 149, 'קנ': 150,
}

def hebrew_to_arabic(heb_num):
    """Convert Hebrew numeral to Arabic number."""
    heb_num = heb_num.strip()
    if heb_num in HEBREW_NUMERALS:
        return HEBREW_NUMERALS[heb_num]
    # Try to parse compound numbers
    total = 0
    for char in heb_num:
        if char in HEBREW_NUMERALS:
            total += HEBREW_NUMERALS[char]
    return total if total > 0 else None

def parse_citation(text):
    """Extract biblical citations from text. Returns list of (book_id, chapter, verse, raw_text)."""
    citations = []
    
    # English patterns: "Gen. 1:2", "Genesis 1:2", "Ps 89:8", etc.
    english_pattern = r'\b(Gen(?:esis)?|Exod(?:us)?|Lev(?:iticus)?|Num(?:bers)?|Deut(?:eronomy)?|Josh(?:ua)?|Judg(?:es)?|Ruth|[12]?\s*Sam(?:uel)?|[12]?\s*K(?:in)?gs|[12]?\s*Chr(?:onicles)?|Ezra|Neh(?:emiah)?|Est(?:her)?|Job|Ps(?:alm)?s?|Prov(?:erbs)?|Eccl(?:es(?:iastes)?)?|Song(?:\s+of\s+(?:Songs|Solomon))?|Isa(?:iah)?|Jer(?:emiah)?|Lam(?:entations)?|Ezek(?:iel)?|Dan(?:iel)?|Hos(?:ea)?|Joel|Amos|Obad(?:iah)?|Jon(?:ah)?|Mic(?:ah)?|Nah(?:um)?|Hab(?:akkuk)?|Zeph(?:aniah)?|Hag(?:gai)?|Zech(?:ariah)?|Mal(?:achi)?)[.\s]+(\d+)[:.](\d+(?:[,-]\d+)?)'
    
    for match in re.finditer(english_pattern, text, re.IGNORECASE):
        book_raw = match.group(1).lower().strip().rstrip('.')
        chapter = int(match.group(2))
        verse_str = match.group(3)
        # Handle verse ranges like "1-3" or "1,2"
        verse = int(re.split(r'[,-]', verse_str)[0])
        
        book_id = BOOK_MAPPINGS.get(book_raw)
        if book_id:
            citations.append((book_id, chapter, verse, match.group(0)))
    
    # Hebrew patterns: "בראשית א:ב" or "בראשית א, ב" or "(תהלים קיט:א)"
    hebrew_pattern = r'(בראשית|שמות|ויקרא|במדבר|דברים|יהושע|שופטים|רות|שמואל [אב]|מלכים [אב]|ישעיהו?|ירמיהו?|יחזקאל|הושע|יואל|עמוס|עובדיה|יונה|מיכה|נחום|חבקוק|צפניה|חגי|זכריה|מלאכי|תהלים|משלי|איוב|שיר השירים|קהלת|איכה|אסתר|דניאל|עזרא|נחמיה|דברי הימים [אב])[\s,]+([א-ת]+)[\s,:]+([א-ת]+)'
    
    for match in re.finditer(hebrew_pattern, text):
        book_raw = match.group(1).strip()
        chapter_heb = match.group(2).strip()
        verse_heb = match.group(3).strip()
        
        book_id = BOOK_MAPPINGS.get(book_raw)
        chapter = hebrew_to_arabic(chapter_heb)
        verse = hebrew_to_arabic(verse_heb)
        
        if book_id and chapter and verse:
            citations.append((book_id, chapter, verse, match.group(0)))
    
    return citations

def get_text_title(data):
    """Get display title for a text."""
    return data.get('title_en') or data.get('title_he') or data.get('id', 'Unknown')

def main():
    texts_dir = Path('site/data/texts')
    
    text_citations = {}  # text_id -> list of citations
    verse_refs = {}  # "book:chapter:verse" -> list of {text_id, text_title, verse_index}
    
    # Scan all text JSON files
    for json_file in texts_dir.glob('*.json'):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading {json_file}: {e}")
            continue
        
        text_id = data.get('id', json_file.stem)
        text_title = get_text_title(data)
        content = data.get('content', [])
        
        citations_for_text = []
        
        for verse_index, verse in enumerate(content):
            # Check all text fields for citations
            for field in ['hebrew', 'english', 'transliteration', 'comments']:
                text_content = verse.get(field, '')
                if not text_content:
                    continue
                
                citations = parse_citation(text_content)
                for book_id, chapter, verse_num, raw_text in citations:
                    # Add to text_citations
                    citations_for_text.append({
                        'book': book_id,
                        'chapter': chapter,
                        'verse': verse_num,
                        'raw': raw_text,
                        'verse_index': verse_index,
                        'field': field
                    })
                    
                    # Add to verse_refs (reverse index)
                    ref_key = f"{book_id}:{chapter}:{verse_num}"
                    if ref_key not in verse_refs:
                        verse_refs[ref_key] = []
                    
                    # Avoid duplicates
                    existing = [r for r in verse_refs[ref_key] 
                               if r['text_id'] == text_id and r['verse_index'] == verse_index]
                    if not existing:
                        verse_refs[ref_key].append({
                            'text_id': text_id,
                            'text_title': text_title,
                            'verse_index': verse_index
                        })
        
        if citations_for_text:
            text_citations[text_id] = citations_for_text
    
    # Write output
    output = {
        'text_citations': text_citations,
        'verse_refs': verse_refs
    }
    
    output_path = 'site/data/citations.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    # Stats
    total_citations = sum(len(c) for c in text_citations.values())
    total_verse_refs = sum(len(r) for r in verse_refs.values())
    
    print(f"Scanned {len(list(texts_dir.glob('*.json')))} text files")
    print(f"Found {total_citations} citations from {len(text_citations)} texts")
    print(f"Built {len(verse_refs)} unique verse reference keys")
    print(f"Total reverse references: {total_verse_refs}")
    print(f"Output written to {output_path}")

if __name__ == '__main__':
    main()
