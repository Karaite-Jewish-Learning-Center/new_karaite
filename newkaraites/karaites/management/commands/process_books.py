import sys
import re
import shutil
from django.core.files import File
from html import escape
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...constants import BIBLE_BOOKS_NAMES
from .command_utils.utils import mark_bible_refs
from .command_utils.read_write_data import (read_data,
                                            write_data)

from .addtional_css import additional_css
from .constants import (SOURCE_PATH,
                        OUT_PATH,
                        CSS_SOURCE,
                        CSS_OUT,
                        REMOVE_CSS_CLASS)

from .command_utils.parser_ref import (parse_reference,
                                       ABBREVIATIONS)
from .command_utils.utils import RE_BIBLE_REF
from .command_utils.argments import arguments
from .process_arguments import process_arguments
from ftlangdetect import detect

style_classes_by_book = {}
ms_classes = []
tags = {}


def fix_iframe(path, book_name):
    book_data = read_data(path, book_name, SOURCE_PATH)
    remove = """<p class=MsoNormal><b><span style='mso-bidi-language:HE'>Recording: </span></b><span
style='mso-bidi-language:HE'>&lt;iframe width=&quot;560&quot;
height=&quot;315&quot; <span class=SpellE>src</span>=&quot;https://www.youtube.com/embed/WZOwo9qW3iM&quot;
title=&quot;YouTube video player&quot; frameborder=&quot;0&quot;
allow=&quot;accelerometer; <span class=SpellE>autoplay</span>; clipboard-write;
encrypted-media; gyroscope; picture-in-picture&quot; <span class=SpellE>allowfullscreen</span>&gt;&lt;/iframe&gt;<o:p></o:p></span></p>"""

    book_data = book_data.replace(remove,
                                  """<iframe width="560" height="315" src="https://www.youtube.com/embed/WZOwo9qW3iM"></iframe>""")
    write_data(path, book_name, book_data, SOURCE_PATH)


def removing_no_breaking_spaces(html_tree):
    spans = html_tree.find_all('span', class_='span-49')
    for child in spans:
        child.decompose()
    return html_tree


def update_bible_references_en(html_tree):
    names = BIBLE_BOOKS_NAMES.values()
    for klass in ['span-39', 'span-43', 'span-48', 'span-52', 'span-63']:
        spans = html_tree.find_all('span', class_=klass)
        for child in spans:
            bible_ref = child.text
            for name in names:
                if bible_ref.replace('(', '').replace(')', '').strip().startswith(name):
                    child.attrs['lang'] = "EN"
                    child.attrs['class'] = "en-biblical-ref"

    # remove &nbs;
    spans = html_tree.find_all('span', class_='span-49')
    for child in spans:
        child.decompose()

    return html_tree


def update_bible_references_he(html_tree, language="HE"):
    """ some books ( liturgy) have bible in English, even if the text is in Hebrew"""
    language_lower = language.lower()
    names = BIBLE_BOOKS_NAMES.keys()
    for c in ['span-06', 'span-08', 'span-56']:
        spans = html_tree.find_all('span', class_=c)
        for child in spans:
            bible_ref = child.text
            for name in names:
                if bible_ref.replace('(', '').replace(')', '').strip().startswith(name):
                    child.attrs['lang'] = language
                    child.attrs['class'] = f"{language_lower}-biblical-ref"

    return html_tree


REF = re.compile(RE_BIBLE_REF[0])
CLEAN_HTML = re.compile('<.*?>')


def update_bible_re(html_tree):
    """ some books ( liturgy) have bible in English, even if the text is in Hebrew """

    html_str = str(html_tree)

    # expand abbreviations
    for abbr, full_name in ABBREVIATIONS:
        html_str = html_str.replace(abbr, full_name)

    map_ref = {}
    i = 0
    for ref in re.findall(REF, html_str):
        # ref = ref.replace('<span class="span-99">\xa0 </span>', '').replace('<span class="span-136">\xa0 </span>', '')
        # only text
        clean_ref = re.sub(CLEAN_HTML, '', ref.replace('\n', ' ').replace('\r', ' '))
        # print('clean_ref', clean_ref)
        valid_ref, language = parse_reference(clean_ref)
        # print('valid_ref, language', valid_ref, language)
        if valid_ref != '':
            i += 1
            map_ref[i] = clean_ref
            #  print('ref', f'"{ref}"')
            tag_ref = f'<span class="{language}-biblical-ref" lang="{language}">show-{i:04}</span>'
            # tag = ref.replace(ref, tag_ref)
            # print('tag', f'"{tag}"')
            new_html = html_str.replace(ref, tag_ref)
            # print('changed ', new_html != html_str)
            html_str = new_html

    for k, v in map_ref.items():
        html_str = html_str.replace(f'show-{k:04}', v)

    return BeautifulSoup(html_str, 'html5lib')


def update_bible_adderet(html_tree):
    return BeautifulSoup(mark_bible_refs(str(html_tree)), 'html5lib')


def fix_chapter_verse(html_tree):
    span = str(html_tree).replace("""<span class="span-50">:30
This </span>""", '<span class="span-50">11:30 This </span>')
    span = span.replace('<span class="span-58">31</span>',
                        '<span class="span-58">31:26 Beside the ark of God’s covenant </span>')
    span = span.replace('<span class="span-58">34</span>',
                        '<span>34:1 From [<i>et</i>]<i> </i>Gilead</span>')
    return BeautifulSoup(span, 'html5lib')


BOOKS = [1, 2]


def replace_path(html_tree, old_path, new_path):
    for child in html_tree.find_all('img'):
        image_path = child.attrs.get('src', None)
        if image_path is not None:
            child.attrs['src'] = image_path.replace(old_path, new_path)
            # child.attrs['src'] = child.attrs['src'].replace('/', '\\')
    return html_tree


def fix_image_pats(path, book_name):
    # specific to
    html_tree = BeautifulSoup(read_data(path, f'{book_name}', SOURCE_PATH), 'html5lib')
    old_path = "Patshegen%20Ketav%20Haddat%20Images.fld/"
    new_path = "/static-django/images/Patshegen%20Ketav%20Hadat/"
    html_tree = replace_path(html_tree, old_path, new_path)
    write_data(path, f'{book_name}', str(html_tree), SOURCE_PATH)


def fix_image_gan(path, book_name):
    # specific for Gan Eden
    html_tree = BeautifulSoup(read_data(path, f'{book_name}', SOURCE_PATH), 'html5lib')
    old_path = "Gan%20Eden%20Hebrew%20Text.fld/image001.jpg"
    new_path = "/static-django/images/Gan Eden/image001.jpg"
    html_tree = replace_path(html_tree, old_path, new_path)
    write_data(path, f'{book_name}', str(html_tree), SOURCE_PATH)


def fix_image_source(path, book_name):
    # this is specific to Halakha Adderet
    # old_path = 'Adderet%20Eliyahu%20Critical%20Edition.fld/'
    # replace for the above if book changes
    old_path = '/static-django/images/Adderet_Eliyahu_R_Elijah_Bashyatchi/'
    book_name = book_name.replace('.html', '')
    html_tree = BeautifulSoup(read_data(path, f'{book_name}.html', SOURCE_PATH), 'html5lib')
    new_path = '/static-django/images/adderet_eliyahu_r_elijah_bashyatchi/'
    html_tree = replace_path(html_tree, old_path, new_path)
    write_data(path, f'{book_name}.html', str(html_tree), SOURCE_PATH)


HTML = """
<html>
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    </head>
    <body lang="EN-US">
    <div class="WordSection1">    
        {}
        {}
    </div>
    <div style="mso-element:footnote-list">
        {}
        {}
    </div>
    </body>
</html>
"""

BASIC_STYLE = """
    <style>
        .en-biblical-ref {
        color: red;
    }
    
    .he-biblical-ref {
        color: green;
    }
    
    .en-foot-note {
        color: green;
    }
    
    .he-foot-note {
        color: green;
    }
""" + additional_css + """    
</style>
"""

BASIC_HTML = """
<html>
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
        {}
    </head>
    <body lang="EN-US">
        {}
    </div>
    </body>
</html>
"""


def remove_tag(div_str, tag):
    div_str = div_str.replace(tag, '', 1)
    div_str = div_str[::-1]
    div_str = div_str.replace('</div>'[::-1], '', 1)
    div_str = div_str[::-1]
    return div_str


def update_index(div_str, i, index):
    """ Update index for notes on the second book, both start foot-notes
        at 1
    """
    div_str = div_str.replace('\n', '').replace('\t', '').replace('\r', '')

    div_str = div_str.replace(f'<div id="ftn{i}" style="mso-element:footnote">',
                              f'<div id="ftn{index}" style="mso-element:footnote">')

    div_str = div_str.replace(f'<a href="#_ftn{i}" ',
                              f'<a href="#_ftn{index}" ', 1)

    div_str = div_str.replace(f'<a href="#_ftn{index}" name="_ftnref{i}"',
                              f'<a href="#_ftn{index}" name="_ftnref{index}"', 1)

    div_str = div_str.replace(f'<a href="#_ftn{index}" name="_ftnref{i}"',
                              f'<a href="#_ftn{index}" name="_ftnref{index}"', 1)

    div_str = div_str.replace(f'style="mso-footnote-id:ftn{i}"',
                              f'style="mso-footnote-id:ftn{index}"', 1)

    div_str = div_str.replace(f'>[{i}]</span>',
                              f'>[{index}]</span>', 1)

    return div_str


def add_book_parts(path, book_name, books=BOOKS):
    """added books together in a single file"""

    # number of foot-notes in the first book
    magical_number = 682
    book_name = book_name.replace('.html', '')

    for part in books:
        book_data = read_data(path, f'{book_name}-{part}.html', SOURCE_PATH)

        if part == 1:
            div1_str = str(BeautifulSoup(book_data, 'html5lib').find('div', class_="WordSection1"))
            foot_notes1 = str(BeautifulSoup(book_data, 'html5lib').find('div',
                                                                        attrs={'style': "mso-element:footnote-list"}))

        if part == 2:
            # second book we have to update all foot-notes numbers and references.
            div2_str = str(BeautifulSoup(book_data, 'html5lib').find('div', class_="WordSection1"))

            foot_notes2 = str(BeautifulSoup(book_data, 'html5lib').find('div',
                                                                        attrs={'style': "mso-element:footnote-list"}))
            # process body foot-notes
            for i in range(1, 613):
                index = i + magical_number
                div2_str = update_index(div2_str, i, index)
                foot_notes2 = update_index(foot_notes2, i, index)

            div1_str = remove_tag(div1_str, '<div class="WordSection1">')
            foot_notes1 = remove_tag(foot_notes1, '<div style="mso-element:footnote-list">')
            div2_str = remove_tag(div2_str, '<div class="WordSection1">')
            foot_notes2 = remove_tag(foot_notes2, '<div style="mso-element:footnote-list">')
            html = HTML.format(div1_str, div2_str, foot_notes1, foot_notes2)

    write_data(path, f'{book_name}.html', html, SOURCE_PATH)


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    def add_arguments(self, parser):
        arguments(parser)

    @staticmethod
    def replace_class_name(str_html):
        return str_html.replace('class="MsoNormalTable', 'class="MsoTableGrid')

    @staticmethod
    def replace_a_foot_notes(html_tree):
        """ replace complicate <a></a> with a tooltip """
        i = 1
        foot_notes = html_tree.find_all('a')
        # only languages
        # qbar = tqdm(foot_notes, desc='Replacing foot-notes', unit='foot-notes', leave=False)
        for child in foot_notes:
            if hasattr(child, 'style'):
                try:
                    style = child.attrs['style']
                    foot_note_id = None
                    if style.startswith("mso-footnote-id:"):
                        foot_note_id = style.split(':')[1].strip()
                    if style.startswith("mso-element:footnote"):
                        foot_note_id = child.attrs['id'].strip()

                    if foot_note_id is None:
                        continue

                    note_ref = child.get_text(strip=False)
                    guess = detect(note_ref.replace('\n', ''), low_memory=False)
                    # todo: review the language
                    language = 'en'
                    if guess['lang'] == 'he':
                        language = 'he'

                    node = html_tree.find(id=foot_note_id)

                    if node is not None:
                        text = escape(node.text).replace('"', "'")
                        if note_ref.find('[') == -1:
                            text = text.replace(note_ref, f'[{note_ref}]', 1)
                            note_ref = f'[{note_ref}]'
                        html = f"""<span class="{language}-foot-note" data-for="{language}" data-tip="{text}">"""
                        html += f"""<sup class="{language}-foot-index">{note_ref}</sup></span>"""
                        child.replaceWith(BeautifulSoup(html, 'html.parser'))

                except KeyError:
                    # this seems a bug , hasattr, returns True for style, in fact no style attr
                    # these are mostly emtpy a tags so remove then
                    if len(child.text) == 0:
                        child.decompose()
                i += 1

        return html_tree

    @staticmethod
    def parse_and_save_css():
        # just one css file
        file_name = 'karaites.css'
        handle_css = open(f'{OUT_PATH}{file_name}', 'w')
        handle_css.write(f'\n/*  This file was generated by command process_books, should not be edit by hand.*/\n'
                         f'/*  All changes will be lost. You have been warned.                               */\n')

        for books in style_classes_by_book.keys():
            # add a comment book name to identify css by book
            handle_css.write(f'\n/*   {books}    */\n')

            styled_order = {k: v for k, v in sorted(style_classes_by_book[books].items(), key=lambda item: item[1])}

            for style, class_name in styled_order.items():

                # don't save this classes
                if class_name in REMOVE_CSS_CLASS:
                    continue

                # remove v:line class
                if class_name.find('v:line') >= 0:
                    continue
                css_elements = style.split(";")

                # remove duplicates
                rules = []
                values = []
                for css in css_elements:

                    if css.find(':') < 0:
                        continue

                    r, v = css.split(':')
                    rules.append(r)
                    values.append(v)

                    if len(rules) != len(set(rules)):
                        css_elements = []
                        unique_rules = set(rules)
                        for i, rule in enumerate(rules):
                            # keep rules order
                            if rule in unique_rules:
                                css_elements.append(f'{rule}:{values[i]}')
                                unique_rules.remove(rule)

                # clean up css
                cleaned = ''
                for css in css_elements:

                    #  remove invalid solidwindowtext
                    css = css.replace('solidwindowtext', '')

                    if css.startswith('mso'):
                        continue

                    if css.startswith('tab-stops'):
                        continue

                    if css.startswith('padding') or \
                            css.startswith('text-indent') or \
                            css.startswith('margin') or \
                            css.startswith('margin'):
                        # remove redundant measure unit
                        css = css.replace(':0pt', ':0').replace(':0in', ':0')

                        css, values = css.split(':')

                        # remove flot point part
                        values = re.sub(r'\.[0-9]', '', values)

                        # replace in by pt
                        values = values.replace('in', 'pt').replace('pt', 'pt ').strip()

                        css = f'{css}:{values}'

                    cleaned += f'\t {css};\n'

                if cleaned == '':
                    continue

                handle_css.write(f'.{class_name} {{\n   {cleaned}}}\n')

        handle_css.write(additional_css)
        handle_css.close()

        # copy karaites.css
        sys.stdout.write(f"\rCopy {file_name} to final destination.\r")
        shutil.copy(f'{CSS_SOURCE}{file_name}', f'{CSS_OUT}{file_name}')

    @staticmethod
    def remove_tags(html_str):
        remove_tags = ['<html>', '</html>', '<head>',
                       '</head>', '<body>', '</body>', r'<o:p></o:p>',
                       r'<o:p>', r'</o:p>', r'<!--[if !supportFootnotes]-->',
                       r'<!--[endif]-->', r'<!--[if !supportLineBreakNewLine]-->',
                       r'<!--[ if !vml]-->'
                       ]
        for tag in remove_tags:
            html_str = html_str.replace(tag, '')

        return html_str

    @staticmethod
    def replace_from_open_to_close(html):
        replace_from_to = [
            ["""<!--[if !supportFootnotes]-->""", """<!--[endif]-->"""],
            # Halakha Adderet
            ["""<!--[if gte vml 1]>""", """<![endif]-->"""],
        ]

        for open_tag, close_tag in replace_from_to:
            while True:
                start = html.find(open_tag)
                if start >= 0:
                    start += 1
                    end = html[start:].find(close_tag)
                    if end >= 0:
                        html = html[0:start] + html[start + end + len(close_tag) + 1:]
                else:
                    break

        return html

    @staticmethod
    def handle_ms_css():
        handle_ms_css = open(f'{OUT_PATH}ms.css', 'w')
        ms_classes.sort()
        for class_name in ms_classes:
            handle_ms_css.write(f'.{class_name} {{}}\n')
        handle_ms_css.close()

    @staticmethod
    def collect_style_map_to_class(html_tree, book, collect, lang, multi_table, css_class):
        style_classes = {}
        html = ''
        lang = lang.lower()[0:2]

        # book has more than one section
        for section in [1, 2, 3, 4]:
            nodes = html_tree.find('div', class_=f"WordSection{section}", recursive=True)
            if nodes is not None:
                html += str(nodes)
            if nodes is None and section == 1:
                break

        divs = BeautifulSoup(html, 'html.parser')

        book_name = book.replace('.html', '').lower()
        if book_name.find(' ') > 0:
            book_name = book_name.split(' ')[0]
            # remove any non-ascii character
            book_name = book_name.encode('ascii', errors='ignore').decode()

        # shorten book name
        book_name = book_name[0:10]

        for tag in divs.findAll(True, recursive=True):

            for attr in [attr for attr in tag.attrs]:

                # remove local style , replace by a class
                if attr == 'style':
                    # collect Ms classes  names
                    ms_class = tag.attrs.get('class', None)
                    if ms_class is not None:
                        ms_class = ms_class[0].split(' ')[0]
                        if ms_class not in ms_classes:
                            ms_classes.append(ms_class)

                    style = tag.attrs['style']
                    # make class independent of order of processing
                    class_name_by_tag = f'{book_name}-{tag.name}'
                    if class_name_by_tag not in tags:
                        tags[class_name_by_tag] = 0
                    else:
                        tags[class_name_by_tag] += 1

                    style = style.strip().replace(' ', '').replace('\n', '').replace('\r', '')

                    # multi_tables must have different class names even if style is the same
                    # also they share the css_class defined in details.
                    if tag.name == 'table' or multi_table:

                        if css_class is not None:
                            class_name = f'{lang}-{class_name_by_tag}-{tags[class_name_by_tag]:03} {css_class}'
                        else:
                            class_name = f'{lang}-{class_name_by_tag}-{tags[class_name_by_tag]:03}'
                        style_classes.update({style: class_name})

                    elif style not in style_classes:

                        class_name = f'{lang}-{class_name_by_tag}-{tags[class_name_by_tag]:03}'
                        style_classes.update({style: class_name})

                    else:
                        class_name = style_classes[style]

                    del tag[attr]

                    if tag.attrs.get('class', None) is not None:
                        tag.attrs['class'].append(class_name)
                    else:
                        tag.attrs['class'] = [class_name]

            if collect:
                style_classes_by_book[book] = style_classes

        return divs

    def remove_replace_css_name(self, html_tree):
        html_str = self.remove_tags(str(html_tree))
        html_str = self.replace_class_name(html_str)
        return BASIC_HTML.format(BASIC_STYLE, html_str)

    def process_html(self, query):
        """
            Process html file.
        """

        for book in query:
            for pre_process in book.method.filter(pre_process=True):
                # eval is not safe, but this is just to be used by the developer
                # and not by the user.
                # print('Pre process', pre_process.method_name)
                f = eval(pre_process.method_name)
                f(book.book_source_en, book.book_title_en)

        for book in query:

            html = book.book_source
            html_tree = BeautifulSoup(html, 'html5lib')
            html_tree = update_bible_re(html_tree)
            language = book.get_book_language_display()
            html_tree = self.replace_a_foot_notes(html_tree)
            html_str = self.replace_from_open_to_close(str(html_tree))
            html_tree = BeautifulSoup(html_str, 'html5lib')

            html_tree = self.collect_style_map_to_class(html_tree,
                                                        book.book_title_en,
                                                        True,
                                                        language,
                                                        book.multi_tables,
                                                        book.css_class)

            html_str = self.remove_replace_css_name(html_tree)

            open('/tmp/html.html', 'w', encoding='utf8').write(html_str)
            book.processed_book_source = File(open('/tmp/html.html', 'r', encoding='utf8'), book.book_title_en)
            book.save()

    def handle(self, *args, **options):
        """
            Books are pre-process and writen to karaitesBookDetails
            Books are post-processed and writen karaitesBookDetails
            tags are rewritten and styles mapped to a css
            class.
            A css file is generate that is not in use at this time.
        """

        query = process_arguments(options)

        if not query:
            return

        self.process_html(query)

