import sys
import re
import shutil
from html import escape
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.conf import settings
from ...constants import BIBLE_BOOKS_NAMES

# override some defaults without having to sweat on code
# maybe replace is a better strategy, to think about !
additional_css = """
p {
    display: block;
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    margin: 10px 5px 10px 5px;
}
h1, h2 {
    text-align: center;
}
.p-03 {
    margin-left:0;
}
"""

style_classes = {}
ms_classes = []
tags = {}
source_path = '../newkaraites/data_karaites/'
out_path = '../newkaraites/karaites/management/tmp/'
css_source = out_path
css_out = '../newkaraites/frontend/src/css/'

LIST_OF_BOOKS = [
    ['Deuteronomy_Keter_Torah_Aaron_ben_Elijah/', 'Hebrew Deuteronomy_Keter Torah_Aaron ben Elijah.html', 'he'],
    ['Deuteronomy_Keter_Torah_Aaron_ben_Elijah/', 'English Deuteronomy_Keter Torah_Aaron ben Elijah.html', 'en'],
    ['Shelomo_Afeida_HaKohen_Yeriot_Shelomo/', 'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume 1.html', 'he'],
    ['Shelomo_Afeida_HaKohen_Yeriot_Shelomo/', 'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume 2.html', 'he'],
    ['Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi/', 'Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi.html', 'he'],
]


def removing_no_breaking_spaces(html_tree):
    spans = html_tree.find_all('span', class_='span-49')
    for child in spans:
        child.decompose()
    return html_tree


def update_bible_references_en(html_tree):
    names = BIBLE_BOOKS_NAMES.values()
    for klass in ['span-08', 'span-42', 'span-46']:
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


def update_bible_references_he(html_tree):
    names = BIBLE_BOOKS_NAMES.keys()
    for c in ['span-06', 'span-08', 'span-56']:
        spans = html_tree.find_all('span', class_=c)
        for child in spans:
            bible_ref = child.text
            for name in names:
                if bible_ref.replace('(', '').replace(')', '').strip().startswith(name):
                    child.attrs['lang'] = "HE"
                    child.attrs['class'] = "he-biblical-ref"

    return html_tree


PROCESS = [
    [update_bible_references_he],
    [update_bible_references_en, removing_no_breaking_spaces],
    [],
    [],
    [],
]


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    @staticmethod
    def replace_a_foot_notes(html_tree, language):
        """ replace complicate <a></a> with a tooltip """

        for child in html_tree.find_all('a'):
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

                    note_ref = re.match('\\[[0-9]*.\\]', child.text)
                    # if note_ref is None:
                    #     # volume 2
                    #     note_ref = re.match('[0-9]*.', foot_notes_list[foot_note])

                    node = html_tree.find(id=foot_note_id)

                    if note_ref and node is not None:
                        text = escape(node.text.replace('\xa0', '').strip())
                        ref = note_ref.group()
                        child.replace_with(BeautifulSoup(
                            f"""<span class="{language}-foot-note" data-for="{language}" data-tip="{text}"><sup class="{language}-foot-index">{ref}</sup></span>""",
                            'html5lib'))

                except KeyError:
                    # this seams a bug , hasattr, returns True for style, in fact no style attr
                    # these are mostly emtpy a tags so remove then
                    if len(child.text) == 0:
                        child.decompose()

        return html_tree

    @staticmethod
    def parse_and_save_css():
        # just one css file
        file_name = 'karaites.css'
        handle_css = open(f'{out_path}{file_name}', 'w')
        styled_order = {k: v for k, v in sorted(style_classes.items(), key=lambda item: item[1])}
        for style, class_name in styled_order.items():
            css_elements = style.split(";")

            # remove duplicates
            rules = []
            values = []
            for css in css_elements:
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

                if css.startswith('mso'):
                    continue

                if css.startswith('tab-stops'):
                    continue

                if css.find('v:line') >= 0:
                    continue

                if css.startswith('padding') or \
                        css.startswith('text-indent') or \
                        css.startswith('margin') or \
                        css.startswith('margin'):
                    css, values = css.split(':')
                    # remove flot point part
                    values = re.sub(r'\.[0-9]', '', values)
                    # replace in by pt
                    values = values.replace('in', 'pt').replace('pt', 'pt ').strip()
                    # remove redundant measure unit
                    values = values.replace('0pt', '0')
                    css = f'{css}:{values}'

                if css.startswith('margin'):
                    css, values = css.split(':')
                    # remove redundant measure unit
                    if values.startswith('0'):
                        values = values.replace('0pt', '0').replace('0in', '0')
                    css = f'{css}:{values}'

                cleaned += f'\t {css};\n'

            if cleaned == '':
                continue

            handle_css.write(f'.{class_name} {{\n   {cleaned}}}\n')

        handle_css.write(additional_css)
        handle_css.close()

        # copy karaites.css
        sys.stdout.write(f"\33[K Copy {file_name} to final destination.\r")
        shutil.copy(f'{css_source}{file_name}', f'{css_out}{file_name}')

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
    def fix_image_source(html_tree):
        # this is specific to Halakha Adderet
        # fix this:
        old_path = 'Halakha_Adderet%20Eliyahu_R%20Elijah%20Bashyatchi.fld'
        new_path = f'{settings.IMAGE_HOST}static-django/images/Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi'

        for child in html_tree.find_all('img'):
            path = child.attrs.get('src', None)
            if path is not None:
                child.attrs['src'] = path.replace(old_path, new_path)

        return html_tree

    @staticmethod
    def handle_ms_css():
        handle_ms_css = open(f'{out_path}ms.css', 'w')
        ms_classes.sort()
        for class_name in ms_classes:
            handle_ms_css.write(f'.{class_name} {{}}\n')
        handle_ms_css.close()

    @staticmethod
    def collect_style_map_to_class(html_tree):

        divs = html_tree.find('div', class_="WordSection1", recursive=True)
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
                    if tag.name not in tags:
                        tags[tag.name] = 0

                    style = style.strip().replace(' ', '').replace('\n', '').replace('\r', '')
                    if style not in style_classes:
                        class_name = f'{tag.name}-{tags[tag.name]:02}'
                        style_classes.update({style: class_name})
                        tags[tag.name] += 1
                    else:
                        class_name = style_classes[style]

                    del tag[attr]

                    if tag.attrs.get('class', None) is not None:
                        tag.attrs['class'].append(class_name)
                    else:
                        tag.attrs['class'] = [class_name]
        return divs

    def handle(self, *args, **kwargs):
        """
            Books are processes and writen to tmp directory
            tags are rewritten and styles mapped to classes
            a css file is generate
        """
        sys.stdout.write(f"\33[K Loading book's data\r")
        i = 0
        for path, book, language in LIST_OF_BOOKS:
            handle_source = open(f'{source_path}{path}{book}', 'r')
            html = handle_source.read()
            handle_source.close()

            html_tree = BeautifulSoup(html, 'html5lib')

            sys.stdout.write(f"\33[K Processing foot-notes for book {book}\r")
            html_tree = self.replace_a_foot_notes(html_tree, language)

            sys.stdout.write(f"\33[K Removing empty tags for book {book}\r")
            html_str = self.remove_tags(str(html_tree))

            sys.stdout.write(f"\33[K Removing comments for book {book}\r")
            html_str = self.replace_from_open_to_close(html_str)

            html_tree = BeautifulSoup(html_str, 'html5lib')
            sys.stdout.write(f"\33[K Fix images path book {book}\r")
            html_tree = self.fix_image_source(html_tree)

            sys.stdout.write(f"\33[K Collecting css for book {book}\r")
            divs = self.collect_style_map_to_class(html_tree)

            for process in PROCESS[i]:
                sys.stdout.write(f"\33[K {process.__name__.replace('_', ' ').capitalize()} {book}\r")
                divs = process(divs)

            sys.stdout.write('\r\n')
            sys.stdout.write(f"\33[K Processed book {book} \n")
            sys.stdout.write(f"\33[K Writing files for {book} \n")
            sys.stdout.write('\n')

            handle_out = open(f'{out_path}{book}', 'w')
            handle_out.write(str(divs))
            handle_out.close()

            i += 1
        self.parse_and_save_css()
        self.handle_ms_css()
