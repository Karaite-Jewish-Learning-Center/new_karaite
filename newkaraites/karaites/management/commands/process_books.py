import sys
import re
from bs4 import BeautifulSoup
import sys
from django.core.management.base import BaseCommand

style_classes = {}
ms_classes = []
tags = {}
source_path = '../newkaraites/data_karaites/'
out_path = '../newkaraites/karaites/management/tmp/'

LIST_OF_BOOKS = [
    ['Shelomo_Afeida_HaKohen_Yeriot_Shelomo/', 'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume 1.html'],
    ['Shelomo_Afeida_HaKohen_Yeriot_Shelomo/', 'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume 2.html'],
    ['Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi/', 'Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi.html'],
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
                        foot_note_id = style.split(':')[1]
                    if style.startswith("mso-element:footnote"):
                        foot_note_id = child.attrs['id']

                    if foot_note_id is None:
                        continue

                    note_ref = re.match('\\[[0-9]*.\\]', child.text)
                    # if note_ref is None:
                    #     # volume 2
                    #     note_ref = re.match('[0-9]*.', foot_notes_list[foot_note])

                    node = html_tree.find('div', id=foot_note_id)

                    if note_ref and node is not None:
                        ref = note_ref.group()
                        child.replace_with(BeautifulSoup(
                            f"""<span class="{language}-foot-note"
                            data-for='{language}'
                            data-tip="{node.text.strip()}">
                            <sup class="{language}-foot-index">{ref}</sup></span>""",
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
        handle_css = open(f'{out_path}karaites.css', 'w')
        for style, class_name in style_classes.items():
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

                if css.startswith('padding'):
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
        handle_css.close()

    @staticmethod
    def remove_tags(html_str):
        remove_tags = ['<html>', '</html>', '<head>',
                       '</head>', '<body>', '</body>', '<o:p></o:p>',
                       r'<o:p>', r'</o:p>', r'<!--[if !supportFootnotes]-->',
                       '<!--[endif]-->', '<!--[if !supportLineBreakNewLine]-->',
                       '<!--[ if !vml]-->'
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
        new_path = 'static-django/images/Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi'

        for child in html_tree.find_all('img'):
            path = child.attrs.get('src', None)
            if path is not None:
                child.attrs['src'] = path.replace(old_path, new_path)

        return html_tree

    @staticmethod
    def handle_ms_css():
        pass
        # handle_ms_css = open(f'{out_path}ms.css', 'w')
        # for class_name in ms_classes:
        #     line_breaks = style.replace
        #     handle_ms_css.write(f'.{class_name} {{\n   {line_breaks}\n}}\n')
        # handle_ms_css.close()

    def handle(self, *args, **kwargs):
        """
            Books are processes and writen to tmp directory
            tags are rewritten and styles mapped to classes
            a css file is generate
        """
        sys.stdout.write(f"\33[K Loading book's data\r")
        for path, book in LIST_OF_BOOKS[:1]:
            handle_source = open(f'{source_path}{path}{book}', 'r')
            html = handle_source.read()
            handle_source.close()

            html_tree = BeautifulSoup(html, 'html5lib')

            # sys.stdout.write(f"\33[K Processing foot-notes for book {book}\r")
            # html_tree = self.replace_a_foot_notes(html_tree, 'he')
            # sys.stdout.write(f"\33[K Removing empty tags for book {book}\r")
            html_str = self.remove_tags(str(html_tree))
            # sys.stdout.write(f"\33[K Removing comments for book {book}\r")
            # html_str = self.replace_from_open_to_close(html_str)
            #
            html_tree = BeautifulSoup(html_str, 'html5lib')
            # sys.stdout.write(f"\33[K Fix images path book {book}\r")
            # html_tree = self.fix_image_source(html_tree)

            sys.stdout.write(f"\33[K Collecting css for book {book}\r")
            divs = html_tree.find('div', class_="WordSection1", recursive=True)
            i = 1
            print()
            for tag in divs.findAll(True, recursive=True):

                for attr in [attr for attr in tag.attrs]:
                    print(attr, attr == 'style', tag.name)
                    input('>>')
                    # remove this attrs keep all other's
                    # if attr in ['dir', 'lang', 'class']:
                    #     del tag[attr]
                    #     continue

                    # remove local style , replace by a class
                    if attr == 'style':
                        class_name = None
                        style = tag.attrs['style']
                        if tag.name not in tags:
                            tags[tag.name] = 0

                        style = style.strip().replace(' ', '').replace('\n', '').replace('\r', '')
                        if style not in style_classes:
                            class_name = f'{tag.name}-{tags[tag.name]}'
                            style_classes.update({style: class_name})
                            tags[tag.name] += 1

                        del tag[attr]

                        if tag.attrs.get('class', None) is not None:
                            ms_class = tag.attrs['class']
                            if ms_class not in ms_classes:
                                ms_classes.append(ms_class)
                            if class_name is not None:
                                tag.attrs['class'].append(class_name)
                        else:
                            if class_name is not None:
                                tag.attrs['class'] = [class_name]
                    i += 1
            sys.stdout.write('\r\n')
            sys.stdout.write(f"\33[K Processed book {book} \n")
            sys.stdout.write(f"\33[K Writing files for {book} \n")
            sys.stdout.write('\n')

            handle_out = open(f'{out_path}{book}', 'w')
            handle_out.write(str(divs))
            handle_out.close()

        self.parse_and_save_css()
        self.handle_ms_css()
