#!/usr/bin/env python3
"""
Convert Qirqisani (Kitab al-Anwar) Excel to JSON format.
"""

import pandas as pd
import json
import os
import re

def clean_text(text):
    """Clean and normalize text."""
    if pd.isna(text) or text is None:
        return ""
    text = str(text).strip()
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    return text

def parse_sheet(df, sheet_name):
    """Parse a single sheet into content entries."""
    content = []
    
    # Determine which columns have Hebrew and English
    # Based on investigation: Hebrew is in 'Unnamed: 8' or 'Hebrew Text', English in 'Unnamed: 9' or 'English'
    hebrew_col = None
    english_col = None
    
    for col in df.columns:
        if 'Hebrew' in str(col):
            hebrew_col = col
        elif col == 'Unnamed: 8':
            hebrew_col = col
        elif 'English' in str(col):
            english_col = col
        elif col == 'Unnamed: 9':
            english_col = col
    
    if hebrew_col is None and english_col is None:
        print(f"  Warning: Could not find Hebrew/English columns in {sheet_name}")
        print(f"  Columns: {df.columns.tolist()}")
        return content
    
    for i, row in df.iterrows():
        hebrew = clean_text(row.get(hebrew_col, '')) if hebrew_col else ''
        english = clean_text(row.get(english_col, '')) if english_col else ''
        
        # Skip empty rows
        if not hebrew and not english:
            continue
        
        # Check if this is a bold/header row
        is_bold = str(row.get('Bold?', '')).strip().lower() == 'bold'
        
        entry = {
            "hebrew": hebrew,
            "transliteration": "",
            "english": english
        }
        
        # Mark headers
        if is_bold and (hebrew or english):
            entry["is_header"] = True
        
        content.append(entry)
    
    return content

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(base_dir, 'site', 'data', 'texts', 'FINAL QIRQISANI VERSION INTRO AND TRANSLATION.xlsx')
    output_file = os.path.join(base_dir, 'site', 'data', 'texts', 'kitab-al-anwar.json')
    
    print(f"Reading {input_file}...")
    xl = pd.ExcelFile(input_file)
    
    print(f"Found {len(xl.sheet_names)} sheets:")
    for name in xl.sheet_names:
        print(f"  - {name}")
    
    # Build sections structure
    sections = {}
    toc = []
    
    # Process Introduction
    print("\nProcessing Compiler's Introduction...")
    intro_df = pd.read_excel(input_file, sheet_name="Compiler's Introduction")
    intro_content = parse_sheet(intro_df, "Compiler's Introduction")
    print(f"  Found {len(intro_content)} entries")
    
    sections["intro"] = {
        "title_en": "Compiler's Introduction",
        "title_he": "הקדמת העורך",
        "content": intro_content
    }
    toc.append({
        "title": "Compiler's Introduction",
        "section": "intro",
        "items": []
    })
    
    # Process translation sheets
    translation_sheets = [name for name in xl.sheet_names if 'Translation' in name]
    
    # Main text section will hold all translations
    main_content = []
    main_toc_items = []
    
    for sheet_name in translation_sheets:
        print(f"\nProcessing {sheet_name}...")
        df = pd.read_excel(input_file, sheet_name=sheet_name)
        content = parse_sheet(df, sheet_name)
        print(f"  Found {len(content)} entries")
        
        # Extract section title from sheet name
        # e.g., "5 Translation - Shabbat" -> "Shabbat"
        match = re.search(r'Translation\s*[-–]\s*(.+)$', sheet_name)
        section_title = match.group(1).strip() if match else sheet_name
        
        # Add section header
        section_id = section_title.lower().replace(' ', '-').replace('_', '-')
        
        # Add a section marker entry
        if content:
            content[0]["section_id"] = section_id
            main_toc_items.append({
                "title": section_title,
                "section_id": section_id,
                "index": len(main_content)
            })
        
        main_content.extend(content)
    
    sections["text"] = {
        "title_en": "Kitāb al-Anwār Translation",
        "title_he": "ספר האורות - תרגום",
        "content": main_content
    }
    
    toc.append({
        "title": "Translation",
        "section": "text",
        "items": main_toc_items
    })
    
    # Build final JSON
    output_json = {
        "id": "kitab-al-anwar",
        "title_en": "Kitāb al-Anwār wa-l-Marāqib (The Book of Lights and Watchtowers)",
        "title_he": "ספר האורות והמגדלים",
        "author_en": "Yaʿqūb al-Qirqisānī",
        "author_he": "יעקב אלקרקסאני",
        "category": "Halakhah",
        "source": "FINAL QIRQISANI VERSION INTRO AND TRANSLATION.xlsx",
        "toc": toc,
        "sections": sections,
        "content": main_content  # For backward compatibility
    }
    
    # Write output
    print(f"\nWriting {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)
    
    print(f"\nDone!")
    print(f"  Total intro entries: {len(intro_content)}")
    print(f"  Total translation entries: {len(main_content)}")

if __name__ == '__main__':
    main()
