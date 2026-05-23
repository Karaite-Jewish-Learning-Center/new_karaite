#!/usr/bin/env python3
"""
Convert Ali ibn Suleiman Commentary on Genesis Excel to JSON format.
"""

import pandas as pd
import json
import os
import re
from bs4 import BeautifulSoup

def clean_text(text):
    """Clean and normalize text."""
    if pd.isna(text) or text is None:
        return ""
    text = str(text).strip()
    text = re.sub(r'\s+', ' ', text)
    return text

def extract_html_content(html_path):
    """Extract text content from HTML file."""
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Get the body content
    body = soup.find('body')
    if body:
        return str(body)
    return ""

def parse_chapter_sheet(df, chapter_name):
    """Parse a single chapter sheet into content entries."""
    content = []
    
    for i, row in df.iterrows():
        hebrew = clean_text(row.get('Hebrew Text', ''))
        english = clean_text(row.get('English', ''))
        footnotes = clean_text(row.get('Footnotes', ''))
        verse = clean_text(row.get('Verse', ''))
        is_bold = str(row.get('Bold?', '')).strip().lower() == 'bold'
        
        # Skip empty rows
        if not hebrew and not english:
            continue
        
        entry = {
            "hebrew": hebrew,
            "transliteration": "",
            "english": english
        }
        
        if footnotes:
            entry["comments"] = footnotes
        
        if verse:
            entry["verse_ref"] = verse
        
        # Mark headers (verse references like "Gen 1:1")
        if is_bold and re.match(r'^Gen \d+:\d+$', hebrew):
            entry["is_header"] = True
            entry["section_id"] = hebrew.lower().replace(' ', '-').replace(':', '-')
        
        content.append(entry)
    
    return content

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, 'data', 'ali_genesis.xlsx')
    output_file = os.path.join(base_dir, 'site', 'data', 'texts', 'ali-ibn-suleiman-genesis.json')
    
    print(f"Reading {input_file}...")
    xl = pd.ExcelFile(input_file)
    
    print(f"Found {len(xl.sheet_names)} sheets:")
    for name in xl.sheet_names:
        print(f"  - {name}")
    
    # Build sections structure
    sections = {}
    toc = []
    
    # Process Introduction from HTML
    intro_path = os.path.join(base_dir, 'data', 'introduction.html')
    if os.path.exists(intro_path):
        print("\nProcessing Introduction from HTML...")
        intro_html = extract_html_content(intro_path)
        sections["intro"] = {
            "title_en": "Introduction",
            "title_he": "הקדמה",
            "content_html": intro_html
        }
        toc.append({
            "title": "Introduction",
            "section": "intro"
        })
    
    # Process Glossary from HTML
    glossary_path = os.path.join(base_dir, 'data', 'glossary.html')
    if os.path.exists(glossary_path):
        print("Processing Glossary from HTML...")
        glossary_html = extract_html_content(glossary_path)
        sections["glossary"] = {
            "title_en": "Glossary",
            "title_he": "מילון",
            "content_html": glossary_html
        }
        toc.append({
            "title": "Glossary",
            "section": "glossary"
        })
    
    # Process chapter sheets
    chapter_sheets = [name for name in xl.sheet_names if name.startswith('Genesis')]
    chapter_sheets.sort(key=lambda x: int(re.search(r'\d+', x).group()))
    
    all_content = []
    chapter_toc_items = []
    
    for sheet_name in chapter_sheets:
        print(f"\nProcessing {sheet_name}...")
        df = pd.read_excel(input_file, sheet_name=sheet_name)
        content = parse_chapter_sheet(df, sheet_name)
        print(f"  Found {len(content)} entries")
        
        # Extract chapter number
        chapter_num = re.search(r'\d+', sheet_name).group()
        chapter_id = f"chapter-{chapter_num}"
        
        # Mark first entry with chapter section_id
        if content:
            content[0]["section_id"] = chapter_id
            chapter_toc_items.append({
                "title": f"Chapter {chapter_num}",
                "section_id": chapter_id,
                "index": len(all_content)
            })
        
        all_content.extend(content)
    
    sections["commentary"] = {
        "title_en": "Commentary",
        "title_he": "פירוש",
        "content": all_content
    }
    
    toc.append({
        "title": "Commentary",
        "section": "commentary",
        "items": chapter_toc_items
    })
    
    # Build final JSON
    output_json = {
        "id": "ali-ibn-suleiman-genesis",
        "title_en": "Commentary on Genesis",
        "title_he": "פירוש על בראשית",
        "author_en": "Ali ibn Suleiman",
        "author_he": "עלי אבן סלימאן",
        "category": "Comments",
        "source": "ali_genesis.xlsx",
        "toc": toc,
        "sections": sections,
        "content": all_content  # For backward compatibility
    }
    
    # Write output
    print(f"\nWriting {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)
    
    print(f"\nDone!")
    print(f"  Total commentary entries: {len(all_content)}")
    print(f"  Chapters: {len(chapter_sheets)}")

if __name__ == '__main__':
    main()
