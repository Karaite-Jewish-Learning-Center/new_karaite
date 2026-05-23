#!/usr/bin/env python3
"""
Convert HTML files to XLSX format for review/cleanup.
Creates one XLSX per HTML with columns matching the existing XLSX structure.
"""

import re
from pathlib import Path
from bs4 import BeautifulSoup
from openpyxl import Workbook

# Paths
HTML_DIR = Path("/Users/shawn/knowledge-chatbot/documents/new_karaite/data_karaites/HTML")
XLSX_DIRS = [
    Path("/Users/shawn/knowledge-chatbot/documents/new_karaite/data_karaites/Out_xls"),
    Path("/Users/shawn/knowledge-chatbot/documents/new_karaite/data_karaites/HTML"),
    Path("/Users/shawn/knowledge-chatbot/documents/new_karaite/data_karaites/Word Documents"),
]
OUTPUT_DIR = Path("/Users/shawn/karaite-texts/xlsx_from_html")

# Standard columns (matching existing XLSX structure)
COLUMNS = [
    "File Name", "Occasion", "Hebrew Name", "English Name", "Display", 
    "Divisions", "Censored", "Reciter", "Hebrew Line #", "Hebrew Text",
    "English Transliteration", "English Translation", "Comments",
    "Musical Display Notes", "Time Starting", "Time Ending"
]

def has_hebrew(text):
    """Check if text contains Hebrew characters."""
    return bool(re.search(r'[\u0590-\u05FF]', text)) if text else False

def extract_footnotes(soup):
    """Extract footnotes from HTML (Word-style _ftn1, _ftn2, etc.)."""
    footnotes = {}
    
    # Find all footnote anchors (the actual footnote text at bottom of doc)
    for a in soup.find_all('a', href=True):
        href = a.get('href', '')
        name = a.get('name', '')
        
        # Match footnote definitions like name="_ftn1"
        if name and name.startswith('_ftn'):
            ftn_num = name.replace('_ftn', '')
            
            # Get the parent element and extract text after the [1] marker
            parent = a.find_parent(['p', 'div'])
            if parent:
                text = clean_text(parent.get_text())
                # Remove the [1] marker from the start
                text = re.sub(r'^\s*\[\d+\]\s*', '', text)
                if text:
                    footnotes[ftn_num] = text
    
    return footnotes

def find_footnote_refs_in_text(text):
    """Find footnote reference markers like [1], [2] in text."""
    return re.findall(r'\[(\d+)\]', text)

def clean_text(text):
    """Clean whitespace from text."""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def extract_table_rows(soup):
    """Extract content rows from HTML tables."""
    rows = []
    
    for table in soup.find_all('table'):
        tr_elements = table.find_all('tr')
        
        i = 0
        while i < len(tr_elements):
            tr = tr_elements[i]
            cells = tr.find_all('td')
            
            # Skip colspan rows (English translations) - we'll grab them with the Hebrew row
            if len(cells) == 1 or (cells and cells[0].get('colspan')):
                i += 1
                continue
            
            if len(cells) >= 2:
                hebrew = ""
                translit = ""
                english = ""
                
                # Extract text from each cell's paragraphs
                for cell in cells:
                    paragraphs = cell.find_all('p')
                    if paragraphs:
                        texts = [clean_text(p.get_text()) for p in paragraphs if clean_text(p.get_text())]
                        cell_text = ' / '.join(texts)
                    else:
                        cell_text = clean_text(cell.get_text())
                    
                    if not cell_text:
                        continue
                    
                    # Determine if Hebrew or transliteration
                    if has_hebrew(cell_text):
                        hebrew = cell_text
                    else:
                        translit = cell_text
                
                # Look for English in next row
                if i + 1 < len(tr_elements):
                    next_tr = tr_elements[i + 1]
                    next_cells = next_tr.find_all('td')
                    if next_cells and (next_cells[0].get('colspan') or len(next_cells) == 1):
                        paragraphs = next_tr.find_all('p')
                        if paragraphs:
                            texts = [clean_text(p.get_text()) for p in paragraphs if clean_text(p.get_text())]
                            english = ' / '.join(texts)
                        else:
                            english = clean_text(next_tr.get_text())
                        i += 1
                
                if hebrew or translit:
                    rows.append({
                        "hebrew": hebrew,
                        "transliteration": translit,
                        "english": english
                    })
            
            i += 1
    
    return rows

def extract_titles(soup):
    """Extract Hebrew and English titles from HTML."""
    title_en = ""
    title_he = ""
    
    # Look for centered paragraphs
    for p in soup.find_all('p')[:15]:
        style = str(p.get('style', '')) or ''
        align = p.get('align', '')
        if 'center' in style or align == 'center':
            text = clean_text(p.get_text())
            if has_hebrew(text) and not title_he:
                title_he = text
            elif text and not title_en and len(text) < 100 and not has_hebrew(text):
                title_en = text
    
    return title_en, title_he

def convert_html_to_xlsx(html_path, output_path):
    """Convert a single HTML file to XLSX."""
    with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    # Extract data
    title_en, title_he = extract_titles(soup)
    rows = extract_table_rows(soup)
    footnotes = extract_footnotes(soup)
    
    if not rows:
        # No table content - might be intro/TOC only
        return False
    
    # Create workbook
    wb = Workbook()
    ws = wb.active
    
    # Header row
    ws.append(COLUMNS)
    
    # Data rows
    for i, row in enumerate(rows, 1):
        # Find footnote refs in this row's text and build comments
        all_text = f"{row['hebrew']} {row['transliteration']} {row['english']}"
        ftn_refs = find_footnote_refs_in_text(all_text)
        
        # Build comments from footnotes
        comments = []
        for ref in ftn_refs:
            if ref in footnotes:
                comments.append(f"[{ref}] {footnotes[ref]}")
        
        comment_text = " | ".join(comments) if comments else ""
        
        ws.append([
            html_path.stem,  # File Name
            "",              # Occasion
            title_he,        # Hebrew Name
            title_en,        # English Name
            "",              # Display
            "",              # Divisions
            "",              # Censored
            "",              # Reciter
            i,               # Hebrew Line #
            row["hebrew"],   # Hebrew Text
            row["transliteration"],  # English Transliteration
            row["english"],  # English Translation
            comment_text,    # Comments (footnotes)
            "",              # Musical Display Notes
            "",              # Time Starting
            ""               # Time Ending
        ])
    
    # Adjust column widths
    ws.column_dimensions['J'].width = 50  # Hebrew
    ws.column_dimensions['K'].width = 50  # Transliteration
    ws.column_dimensions['L'].width = 60  # English
    
    wb.save(output_path)
    return True

def main():
    """Convert all HTML files that don't have XLSX counterparts."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Get existing XLSX files from all directories
    existing_xlsx = set()
    for xlsx_dir in XLSX_DIRS:
        if xlsx_dir.exists():
            for f in xlsx_dir.rglob("*.xlsx"):
                if 'scratch' not in str(f).lower() and '_old' not in f.stem.lower():
                    # Normalize stem for comparison
                    stem = f.stem.lower().replace("'", "").replace("'", "")
                    existing_xlsx.add(stem)
    
    converted = 0
    skipped = 0
    no_content = 0
    
    print("Converting HTML files to XLSX...\n")
    
    for html_file in sorted(HTML_DIR.rglob("*.html")):
        # Skip scratch folder
        if 'scratch' in str(html_file).lower():
            continue
        
        # Skip if XLSX already exists (check normalized stem)
        stem = html_file.stem.lower().replace("'", "").replace("'", "")
        has_xlsx = any(stem in x or x in stem for x in existing_xlsx)
        if has_xlsx:
            skipped += 1
            continue
        
        # Determine output path (preserve folder structure)
        rel_path = html_file.relative_to(HTML_DIR)
        output_path = OUTPUT_DIR / rel_path.with_suffix('.xlsx')
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        print(f"  {html_file.stem}...", end=" ")
        
        try:
            if convert_html_to_xlsx(html_file, output_path):
                print("OK")
                converted += 1
            else:
                print("(no table content)")
                no_content += 1
        except Exception as e:
            print(f"ERROR: {e}")
    
    print(f"\nDone!")
    print(f"  Converted: {converted}")
    print(f"  Skipped (XLSX exists): {skipped}")
    print(f"  No table content: {no_content}")
    print(f"\nOutput directory: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
