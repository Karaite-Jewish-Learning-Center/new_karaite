#!/usr/bin/env python3
"""
Convert Ma'aravi XML files to JSON format for the karaite-texts website.
Creates three JSON files:
1. maaravi.json - Main text (Hebrew + English translation with footnotes as comments)
2. maaravi-intro.json - Introduction and editor notes
3. maaravi-appendices.json - Appendices
"""

import json
import re
from xml.etree import ElementTree as ET
from html import unescape

def clean_text(text):
    """Clean and normalize text content."""
    if not text:
        return ""
    # Unescape HTML entities
    text = unescape(text)
    # Convert ^^^^XXXX Unicode escape sequences to actual characters
    def replace_unicode_escape(match):
        code_point = int(match.group(1), 16)
        return chr(code_point)
    text = re.sub(r'\^\^\^\^([0-9a-fA-F]{4})', replace_unicode_escape, text)
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    # Strip whitespace
    text = text.strip()
    return text

def extract_paragraph_text(p_element):
    """Extract text from a paragraph element, handling nested tags."""
    def get_text_recursive(element):
        text_parts = []
        if element.text:
            text_parts.append(element.text)
        for child in element:
            # Skip footnote markers
            if child.tag in ('deb', 'fin', 'supnum', 'pin'):
                pass
            elif child.tag == 'green':
                # Biblical quote
                text_parts.append(get_text_recursive(child))
            elif child.tag == 'sup':
                # Citation reference
                text_parts.append(f" ({get_text_recursive(child)})")
            elif child.tag == 'i':
                # Italics
                text_parts.append(get_text_recursive(child))
            elif child.tag in ('ref', 'hebrew'):
                pass  # Skip reference markers
            elif child.tag == 'anchor':
                pass  # Skip anchor markers
            elif child.tag == 'quotation':
                text_parts.append(get_text_recursive(child))
            elif child.tag in ('h1', 'h2', 'h3', 'p', 'center'):
                text_parts.append(get_text_recursive(child))
            elif child.tag in ('label', 'mbox'):
                text_parts.append(get_text_recursive(child))
            elif child.tag == 'tc':
                pass  # Skip table of contents
            elif child.tag == 'tcline':
                pass  # Skip TOC lines
            else:
                text_parts.append(get_text_recursive(child))
            if child.tail:
                text_parts.append(child.tail)
        return ''.join(text_parts)
    
    return clean_text(get_text_recursive(p_element))

def extract_footnote_numbers(p_element):
    """Extract footnote numbers from a paragraph."""
    footnotes = []
    for supnum in p_element.iter('supnum'):
        if supnum.text:
            footnotes.append(supnum.text.strip())
    return footnotes

def parse_notes_file(notes_path):
    """Parse the notes XML file and return a dictionary of note_id -> note_text."""
    notes = {}
    try:
        with open(notes_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse each note
        root = ET.fromstring(content)
        for p in root.findall('.//p'):
            p_type = p.get('type', '')
            p_id = p.get('id', '')
            if p_type == 'note' and p_id:
                text = extract_paragraph_text(p)
                # Remove the leading supnum number from the text
                text = re.sub(r'^\d+\s*', '', text)
                notes[p_id] = text.strip()
    except Exception as e:
        print(f"Error parsing notes: {e}")
    return notes

def parse_hebrew_file(hebrew_path):
    """Parse the Hebrew XML file and return structured content."""
    paragraphs = []
    with open(hebrew_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    root = ET.fromstring(content)
    
    for p in root.findall('.//p'):
        p_id = p.get('id', '')
        p_type = p.get('type', '')
        align = p.get('align', '')
        
        text = extract_paragraph_text(p)
        footnote_nums = extract_footnote_numbers(p)
        
        paragraphs.append({
            'id': p_id,
            'type': p_type,
            'align': align,
            'text': text,
            'footnotes': footnote_nums
        })
    
    return paragraphs

def parse_english_file(english_path):
    """Parse the English XML file and return structured content."""
    paragraphs = []
    with open(english_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    root = ET.fromstring(content)
    
    for p in root.findall('.//p'):
        p_id = p.get('id', '')
        p_type = p.get('type', '')
        
        text = extract_paragraph_text(p)
        
        # Extract ref notes for comments
        ref_notes = []
        for ref in p.findall('.//ref'):
            ref_id = ref.get('id', '')
            if ref_id:
                ref_notes.append(ref_id)
        
        paragraphs.append({
            'id': p_id,
            'type': p_type,
            'text': text,
            'ref_notes': ref_notes
        })
    
    return paragraphs

def parse_intro_appendices_file(intro_path, notes):
    """Parse the intro/appendices XML file."""
    sections = {
        'intro': [],
        'appendices': []
    }
    
    with open(intro_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    root = ET.fromstring(content)
    
    current_section = 'intro'
    in_appendix = False
    
    for elem in root:
        if elem.tag == 'tc':
            continue  # Skip table of contents
        
        text = extract_paragraph_text(elem)
        
        # Check if we've hit appendices
        if 'Appendix' in text or in_appendix:
            in_appendix = True
            current_section = 'appendices'
        
        if text:
            # Extract anchor note references
            anchor_refs = []
            for anchor in elem.iter('anchor'):
                anchor_type = anchor.get('type', '')
                anchor_id = anchor.get('id', '')
                if anchor_type == 'note' and anchor_id:
                    anchor_refs.append(anchor_id)
            
            sections[current_section].append({
                'type': elem.tag,
                'text': text,
                'anchor_refs': anchor_refs
            })
    
    return sections

def create_main_text_json(hebrew_paragraphs, english_paragraphs, notes):
    """Create the main text JSON combining Hebrew and English with footnotes.
    
    The Hebrew and English XML files have different paragraph counts and IDs don't match.
    Strategy: Match by sequential index, consolidating English continuation paragraphs.
    """
    content = []
    
    # Consolidate English: merge continuation paragraphs (non-titre following non-titre)
    # into their predecessor
    # Special cases:
    # - "The Regulations of Slaughter by our master" should start a new entry
    # - "What Must Be Removed from the Meat" / "After Slaughtering" are ADDED titles 
    #   (not in Hebrew) - should be merged with following content, not treated as standalone
    consolidated_english = []
    pending_added_title = None  # Buffer for added titles to merge with next content
    
    for i, eng_p in enumerate(english_paragraphs):
        p_type = eng_p.get('type', '')
        text = eng_p['text']
        refs = eng_p.get('ref_notes', [])
        
        # Skip empty paragraphs and ID-less transitional elements
        if not text:
            continue
        if not eng_p.get('id') and p_type == 'trad':
            continue
        
        # Special case: "The Regulations of Slaughter by our master" starts a new section
        if 'The Regulations of Slaughter by our master' in text:
            consolidated_english.append({
                'text': text,
                'type': 'trad',
                'ref_notes': refs
            })
            continue
        
        # Special case: Added titles that don't exist in Hebrew - buffer them
        # These will be combined into one entry with blank Hebrew
        if p_type == 'titre' and ('What Must Be Removed from the Meat' in text or 'After Slaughtering' in text):
            if pending_added_title:
                pending_added_title['text'] += "\n\n" + text
                pending_added_title['ref_notes'].extend(refs)
            else:
                pending_added_title = {'text': text, 'ref_notes': refs.copy()}
            continue
        
        if p_type == 'titre':
            # Title - always new entry
            consolidated_english.append({
                'text': text,
                'type': 'titre',
                'ref_notes': refs
            })
        else:
            # Content paragraph - check if it's a continuation
            # (previous was also non-titre content)
            
            # First, flush any buffered added title as its own entry with blank Hebrew
            if pending_added_title:
                consolidated_english.append({
                    'text': pending_added_title['text'],
                    'type': 'added_titre',  # Mark as added by translators (no Hebrew equivalent)
                    'ref_notes': pending_added_title['ref_notes']
                })
                pending_added_title = None
                # After flushing added title, this content should be a NEW entry (not continuation)
                consolidated_english.append({
                    'text': text,
                    'type': 'trad',
                    'ref_notes': refs
                })
            elif (consolidated_english and 
                consolidated_english[-1]['type'] != 'titre'):
                # Continuation - merge with previous
                consolidated_english[-1]['text'] += "\n\n" + text
                consolidated_english[-1]['ref_notes'].extend(refs)
            else:
                # New content entry
                consolidated_english.append({
                    'text': text,
                    'type': 'trad',
                    'ref_notes': refs
                })
    
    # Similarly consolidate Hebrew: merge non-titre paragraphs following non-titre
    # Special cases for the transition between Six Tenets and Slaughter Regulations:
    # 1. "בְּשֵׁם יְהֹוָה אֵל עוֹלָם" (id=22) is marked as titre but should be merged with previous
    # 2. "שרוט אלד̇באחה̈" (id=23) is marked as text but should start a new entry
    consolidated_hebrew = []
    
    for i, heb_p in enumerate(hebrew_paragraphs):
        heb_type = heb_p.get('type', '')
        text = heb_p['text']
        
        if not text:
            continue
        
        # Special case 1: This "titre" is actually a closing formula, merge with previous
        if 'בְּשֵׁ֥ם יְהֹוָ֖ה אֵ֥ל עוֹלָֽם' in text or 'בְּשֵׁם יְהֹוָה אֵל עוֹלָם' in text:
            if consolidated_hebrew:
                consolidated_hebrew[-1]['text'] += "\n\n" + text
            continue
        
        # Special case 2: "שרוט אלד̇באחה̈" starts a new section (the slaughter regulations intro)
        if 'שרוט אלד̇באחה̈ לְמָרֵינוּ' in text or text.startswith('שרוט אלד̇באחה̈'):
            consolidated_hebrew.append({
                'text': text,
                'type': 'text'  # Force new entry
            })
            continue
        
        # Special case 3: "ויג̇ב אן נד̇כר מא הוא מתעלק באללחם" starts the section about 
        # three forbidden things (blood, fat, sciatic nerve) - must be its own entry
        if 'ויג̇ב אן נד̇כר מא הוא מתעלק באללחם' in text or text.startswith('ויג̇ב אן נד̇כר'):
            consolidated_hebrew.append({
                'text': text,
                'type': 'text'  # Force new entry
            })
            continue
        
        if heb_type == 'titre':
            consolidated_hebrew.append({
                'text': text,
                'type': 'titre'
            })
        else:
            # Check if continuation
            if (consolidated_hebrew and 
                consolidated_hebrew[-1]['type'] != 'titre'):
                # Continuation - merge
                consolidated_hebrew[-1]['text'] += "\n\n" + text
            else:
                # New content entry
                consolidated_hebrew.append({
                    'text': text,
                    'type': 'text'
                })
    
    # Now match consolidated Hebrew to consolidated English
    # Handle 'added_titre' entries in English which have no Hebrew equivalent
    heb_idx = 0
    eng_idx = 0
    
    while heb_idx < len(consolidated_hebrew) or eng_idx < len(consolidated_english):
        # Check if current English entry is an added title (no Hebrew equivalent)
        if eng_idx < len(consolidated_english) and consolidated_english[eng_idx].get('type') == 'added_titre':
            eng_entry = consolidated_english[eng_idx]
            ref_notes = eng_entry.get('ref_notes', [])
            
            # Build comments from ref notes
            comments = []
            for ref_id in ref_notes:
                if ref_id in notes:
                    comments.append(f"[{ref_id}] {notes[ref_id]}")
            
            entry = {
                "hebrew": "",  # Blank Hebrew - title added by translators
                "transliteration": "",
                "english": eng_entry['text'],
                "english_only": True  # Flag for rendering - display on right side
            }
            
            if comments:
                entry["comments"] = "\n\n".join(comments)
            
            content.append(entry)
            eng_idx += 1
            continue
        
        # Normal case: pair Hebrew and English by index
        hebrew_text = ""
        if heb_idx < len(consolidated_hebrew):
            hebrew_text = consolidated_hebrew[heb_idx]['text']
        
        english_text = ""
        ref_notes = []
        if eng_idx < len(consolidated_english):
            english_text = consolidated_english[eng_idx]['text']
            ref_notes = consolidated_english[eng_idx].get('ref_notes', [])
        
        # Build comments from ref notes
        comments = []
        for ref_id in ref_notes:
            if ref_id in notes:
                comments.append(f"[{ref_id}] {notes[ref_id]}")
        
        entry = {
            "hebrew": hebrew_text,
            "transliteration": "",
            "english": english_text
        }
        
        # Add section IDs for navigation
        section_id = get_section_id(english_text)
        if section_id:
            entry["section_id"] = section_id
        
        if comments:
            entry["comments"] = "\n\n".join(comments)
        
        content.append(entry)
        heb_idx += 1
        eng_idx += 1
    
    return content

def get_section_id(english_text):
    """Generate a section ID for TOC navigation based on English text."""
    if not english_text:
        return None
    
    text = english_text.strip()
    first_line = text.split('\n')[0].strip()
    
    # Tenet titles (exact match on first line)
    if first_line == "The First Tenet":
        return "first-tenet"
    if first_line == "The Second Tenet":
        return "second-tenet"
    if first_line == "The Third Tenet":
        return "third-tenet"
    if first_line == "The Fourth Tenet":
        return "fourth-tenet"
    if first_line == "The Fifth Tenet":
        return "fifth-tenet"
    if first_line == "The Sixth Tenet":
        return "sixth-tenet"
    
    # Belief sections (content after tenet titles)
    if first_line == "Belief in Divinity":
        return "belief-divinity"
    if first_line == "Belief in Messengership":
        return "belief-messengership"
    if first_line.startswith("Belief in the Prophets"):
        return "belief-prophets"
    if first_line == "Belief in the Message":
        return "belief-message"
    if first_line.startswith("Belief in the [Holy] Site"):
        return "belief-qibla"
    if first_line == "Belief in the Day of Judgment":
        return "belief-judgment"
    
    # Regulations of Slaughter
    if first_line.startswith("The Regulations of Slaughter by our master"):
        return "regulations-slaughter"
    if first_line == "Discourse on Slaughter":
        return "discourse-slaughter"
    
    # Chapters (exact match)
    if first_line == "Chapter I":
        return "chapter-1"
    if first_line == "Chapter II":
        return "chapter-2"
    if first_line == "Chapter III":
        return "chapter-3"
    if first_line == "Chapter IV":
        return "chapter-4"
    if first_line == "Chapter V":
        return "chapter-5"
    if first_line == "Chapter VI":
        return "chapter-6"
    if first_line == "Chapter VII":
        return "chapter-7"
    if first_line == "Chapter VIII":
        return "chapter-8"
    if first_line == "Chapter IX":
        return "chapter-9"
    if first_line == "Chapter X":
        return "chapter-10"
    
    # Other sections
    if first_line == "On What Must Be Done After Slaughter":
        return "after-slaughter"
    if first_line == "A Discourse on Factors That Invalidate Slaughter":
        return "invalidate-slaughter"
    if first_line.startswith("A Chapter on the Principles of Judgment"):
        return "principles-judgment"
    if first_line.startswith("What Must Be Removed from the Meat"):
        return "removed-from-meat"
    
    return None

def get_intro_section_id(text):
    """Generate a section ID for intro TOC navigation."""
    if not text:
        return None
    
    text_lower = text.lower().strip()
    
    if text_lower.startswith("acknowledgments by the karaite press"):
        return "intro-acknowledgments"
    if text_lower.startswith("about the editor"):
        return "intro-about-editor"
    if text_lower.startswith("editor's acknowledgments"):
        return "intro-editor-acknowledgments"
    if text_lower.startswith("editor's introduction") and "six principles" not in text_lower and "treatise" not in text_lower:
        return "intro-editor-introduction"
    if "about israel b. samuel" in text_lower:
        return "intro-about-author"
    if text_lower.startswith("about the present volume"):
        return "intro-about-volume"
    if "linguistic and cultural context" in text_lower:
        return "intro-linguistic-context"
    if "editor's introduction to the six principles" in text_lower:
        return "intro-six-principles"
    if "editor's introduction to al-maghrib" in text_lower and "treatise" in text_lower:
        return "intro-treatise-slaughter"
    if "about the judaeo-arabic" in text_lower:
        return "intro-about-edition"
    if "introduction to appendices" in text_lower:
        return "intro-appendices"
    
    return None

def create_intro_content(intro_sections, notes):
    """Create the introduction content."""
    content = []
    
    for item in intro_sections:
        text = item['text']
        if not text:
            continue
        
        # Build comments from anchor references
        comments = []
        for ref_id in item.get('anchor_refs', []):
            if ref_id in notes:
                comments.append(f"[{ref_id}] {notes[ref_id]}")
        
        entry = {
            "hebrew": "",
            "transliteration": "",
            "english": text
        }
        
        # Add section ID for navigation
        section_id = get_intro_section_id(text)
        if section_id:
            entry["section_id"] = section_id
        
        if comments:
            entry["comments"] = "\n\n".join(comments)
        
        content.append(entry)
    
    return content

def build_toc(intro_content, main_content, appendices_content):
    """Build a Table of Contents from content with section_ids."""
    toc = []
    
    # Intro TOC items
    intro_toc = {
        "title": "Introduction",
        "section": "intro",
        "items": []
    }
    for i, entry in enumerate(intro_content):
        if entry.get('section_id'):
            # Extract title from English text (first line or first 60 chars)
            eng = entry.get('english', '')
            title = eng.split('\n')[0][:80].strip()
            intro_toc["items"].append({
                "title": title,
                "section_id": entry['section_id'],
                "index": i
            })
    if intro_toc["items"]:
        toc.append(intro_toc)
    
    # Main text TOC items
    text_toc = {
        "title": "The Principles of Faith of Karaite Jews",
        "section": "text",
        "items": []
    }
    slaughter_toc = {
        "title": "The Regulations of Slaughter",
        "section": "text",
        "items": []
    }
    
    in_slaughter_section = False
    for i, entry in enumerate(main_content):
        if entry.get('section_id'):
            eng = entry.get('english', '')
            title = eng.split('\n')[0][:80].strip()
            
            # Determine which TOC section
            sid = entry['section_id']
            if sid in ['regulations-slaughter', 'discourse-slaughter'] or sid.startswith('chapter-'):
                in_slaughter_section = True
            if sid in ['after-slaughter', 'invalidate-slaughter', 'principles-judgment', 'removed-from-meat']:
                in_slaughter_section = True
            
            item = {
                "title": title,
                "section_id": sid,
                "index": i
            }
            
            if in_slaughter_section or sid.startswith('chapter-') or sid in ['regulations-slaughter', 'discourse-slaughter', 'after-slaughter', 'invalidate-slaughter', 'principles-judgment', 'removed-from-meat']:
                slaughter_toc["items"].append(item)
            else:
                text_toc["items"].append(item)
    
    if text_toc["items"]:
        toc.append(text_toc)
    if slaughter_toc["items"]:
        toc.append(slaughter_toc)
    
    # Appendices TOC
    appendices_toc = {
        "title": "Appendices",
        "section": "appendices",
        "items": []
    }
    for i, entry in enumerate(appendices_content):
        if entry.get('section_id'):
            eng = entry.get('english', '')
            title = eng.split('\n')[0][:80].strip()
            appendices_toc["items"].append({
                "title": title,
                "section_id": entry['section_id'],
                "index": i
            })
    if appendices_toc["items"]:
        toc.append(appendices_toc)
    
    return toc

def create_appendices_content(appendix_sections, notes):
    """Create the appendices content."""
    content = []
    
    for item in appendix_sections:
        text = item['text']
        if not text:
            continue
        
        # Build comments from anchor references
        comments = []
        for ref_id in item.get('anchor_refs', []):
            if ref_id in notes:
                comments.append(f"[{ref_id}] {notes[ref_id]}")
        
        entry = {
            "hebrew": "",
            "transliteration": "",
            "english": text
        }
        
        if comments:
            entry["comments"] = "\n\n".join(comments)
        
        content.append(entry)
    
    return content

def main():
    import os
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # File paths
    hebrew_path = os.path.join(base_dir, 'maaravi-hebrew.xml')
    english_path = os.path.join(base_dir, 'maaravi-english.xml')
    intro_path = os.path.join(base_dir, 'maaravi-intro-appendices.xml')
    notes_path = os.path.join(base_dir, 'maaravi-notes.xml')
    
    output_dir = os.path.join(base_dir, 'site', 'data', 'texts')
    
    print("Parsing notes file...")
    notes = parse_notes_file(notes_path)
    print(f"  Found {len(notes)} notes")
    
    print("Parsing Hebrew file...")
    hebrew_paragraphs = parse_hebrew_file(hebrew_path)
    print(f"  Found {len(hebrew_paragraphs)} paragraphs")
    
    print("Parsing English file...")
    english_paragraphs = parse_english_file(english_path)
    print(f"  Found {len(english_paragraphs)} paragraphs")
    
    print("Parsing intro/appendices file...")
    sections = parse_intro_appendices_file(intro_path, notes)
    print(f"  Found {len(sections['intro'])} intro items, {len(sections['appendices'])} appendix items")
    
    print("\nCreating combined JSON with sections...")
    
    # Create content for each section
    main_content = create_main_text_json(hebrew_paragraphs, english_paragraphs, notes)
    intro_content = create_intro_content(sections['intro'], notes)
    appendices_content = create_appendices_content(sections['appendices'], notes)
    
    # Build TOC from content with section_ids
    toc = build_toc(intro_content, main_content, appendices_content)
    
    # Combined JSON with sections
    combined_json = {
        "id": "maaravi",
        "title_en": "The Six Principles of Faith and Laws of Slaughter",
        "title_he": "העקאיד אלסתה ושרוט אלדבאחה",
        "category": "Halakhah",
        "source": "Al-Ma'aravi (al-Maghribi) XML files",
        "toc": toc,
        "sections": {
            "intro": {
                "title_en": "Introduction",
                "title_he": "הקדמה",
                "content": intro_content
            },
            "text": {
                "title_en": "Main Text",
                "title_he": "הטקסט",
                "content": main_content
            },
            "appendices": {
                "title_en": "Appendices",
                "title_he": "נספחים",
                "content": appendices_content
            }
        },
        "content": main_content  # Keep for backward compatibility
    }
    
    main_path = os.path.join(output_dir, 'maaravi.json')
    with open(main_path, 'w', encoding='utf-8') as f:
        json.dump(combined_json, f, ensure_ascii=False, indent=2)
    print(f"  Wrote {main_path}")
    
    print("\nDone!")

if __name__ == '__main__':
    main()
