#!/usr/bin/env python3
"""
Convert Gan Eden Excel file to JSON format for the KJLC site.
"""
import pandas as pd
import json
import re

def clean_text(text):
    """Clean text, handling NaN and whitespace."""
    if pd.isna(text):
        return ""
    return str(text).strip()

def convert_footnote_markers(text):
    """Convert [{1}], [{2}], etc. to {{fn:N}} placeholders for JS to render."""
    if not text:
        return text
    
    def replace_marker(match):
        num = int(match.group(1))
        return f'{{{{fn:{num}}}}}'
    
    # Replace [{n}] format
    text = re.sub(r'\[\{(\d+)\}\]', replace_marker, text)
    # Also handle {n} format without brackets
    text = re.sub(r'\{(\d+)\}', replace_marker, text)
    # Also handle [n] format (but not if followed by letters like biblical refs)
    text = re.sub(r'\[(\d+)\](?!\s*[a-zA-Z])', replace_marker, text)
    return text

def process_footnote_markers(english_text, footnotes_by_para, para_num):
    """Replace footnote markers like {1} with actual footnote content."""
    if para_num not in footnotes_by_para:
        return english_text
    
    result = english_text
    for fn in footnotes_by_para[para_num]:
        marker = fn.get('marker', '')
        footnote_text = fn.get('english_footnote', '')
        if marker and footnote_text:
            # Replace {N} with [N: footnote text]
            marker_pattern = re.escape(marker)
            result = re.sub(marker_pattern, f'[{footnote_text}]', result)
    
    return result

def main():
    # Read the Excel file
    xl = pd.ExcelFile('gan-eden-v1.1 2.xlsx')
    
    # Read introduction
    intro_df = pd.read_excel(xl, sheet_name='Intro')
    intro_text = '\n\n'.join([
        clean_text(row) for row in intro_df['Unnamed: 1'].dropna()
    ])
    
    # Read glossary
    glossary_df = pd.read_excel(xl, sheet_name='Glossary')
    glossary = []
    for i, row in glossary_df.iterrows():
        if i < 4:  # Skip header rows
            continue
        hebrew = clean_text(row.get('Unnamed: 1', ''))
        translit = clean_text(row.get('Unnamed: 2', ''))
        gloss = clean_text(row.get('Unnamed: 3', ''))
        if hebrew and gloss:
            glossary.append({
                "hebrew": hebrew,
                "transliteration": translit,
                "definition": gloss
            })
    
    # Read text content
    text_df = pd.read_excel(xl, sheet_name='Text Content')
    
    # Read footnotes
    fn_df = pd.read_excel(xl, sheet_name='Footnotes')
    
    # Build footnotes lookup by paragraph number
    footnotes_by_para = {}
    for _, row in fn_df.iterrows():
        para_num = row['Paragraph #']
        if pd.notna(para_num):
            para_num = int(para_num)
            if para_num not in footnotes_by_para:
                footnotes_by_para[para_num] = []
            footnotes_by_para[para_num].append({
                'marker': clean_text(row.get('Marker', '')),
                'footnoted_words': clean_text(row.get('Footnoted Word(s)', '')),
                'english_footnote': clean_text(row.get('English Footnote', ''))
            })
    
    # Process content
    content = []
    for _, row in text_df.iterrows():
        hebrew = clean_text(row.get('Hebrew Text', ''))
        english = clean_text(row.get('Unnamed: 9', ''))
        para_num = row.get('Paragraph #')
        
        if not hebrew and not english:
            continue
        
        # Convert inline footnote markers to superscripts
        hebrew = convert_footnote_markers(hebrew)
        english = convert_footnote_markers(english)
        
        # Check if this paragraph has footnotes - format as comments string
        comments = ""
        if pd.notna(para_num):
            para_num = int(para_num)
            if para_num in footnotes_by_para:
                footnote_parts = []
                for fn in footnotes_by_para[para_num]:
                    if fn['english_footnote']:
                        # Extract the footnote number from the marker (e.g., "[{30}]" -> 30)
                        marker = fn['marker']
                        fn_num_match = re.search(r'\d+', marker)
                        fn_num = int(fn_num_match.group()) if fn_num_match else 0
                        
                        # Clean the footnoted word - remove leading " if it's a quote remnant
                        # (but keep " inside the word for Hebrew abbreviations like ז"ל)
                        footnoted_word = fn['footnoted_words']
                        if footnoted_word.startswith('"'):
                            footnoted_word = footnoted_word[1:]
                        
                        # Use regular number (will be styled by CSS in comments section)
                        if footnoted_word:
                            footnote_parts.append(f"{fn_num} {footnoted_word} — {fn['english_footnote']}")
                        else:
                            footnote_parts.append(f"{fn_num} {fn['english_footnote']}")
                if footnote_parts:
                    comments = " ".join(footnote_parts)
        
        entry = {
            "hebrew": hebrew,
            "english": english,
            "transliteration": ""
        }
        
        if comments:
            entry["comments"] = comments
        
        content.append(entry)
    
    # Create the JSON structure
    data = {
        "id": "gan-eden",
        "title_en": "Gan Eden",
        "title_he": "ספר גן עדן",
        "author": "Aaron ben Elijah of Nicomedia",
        "category": "Halakhah",
        "source": "gan-eden-v1.1 2.xlsx",
        "introduction": intro_text,
        "glossary": glossary,
        "content": content
    }
    
    # Write output
    output_path = 'site/data/texts/gan-eden.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Converted {len(content)} entries")
    print(f"Found {len(footnotes_by_para)} paragraphs with footnotes")
    print(f"Added {len(glossary)} glossary terms")
    print(f"Output written to {output_path}")

if __name__ == '__main__':
    main()
