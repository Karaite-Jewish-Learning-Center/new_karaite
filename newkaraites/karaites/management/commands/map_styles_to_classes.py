import sys
import re
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand

style_classes = {}
ms_classes = []
tags = {}


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    def handle(self, *args, **options):
        """ Karaites books as array """
        # new_html = BeautifulSoup('<div id="start"></div>', 'html5lib')
        # source = (f'../newkaraites/data_karaites/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/'
        css = f'/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/karaites/management/tmp/karaites.css'
        ms_css = f'../newkaraites/tmp/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/ms-tmp.css'

        for volume in [1, 2]:
            source = (
                f'/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/data_karaites/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/'
                f'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume {volume}.html')

            out = (f'/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/karaites/management/tmp/'
                   f'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume {volume}.html')

            handle_source = open(source, 'r')
            html = handle_source.read()
            handle_source.close()

            html = html.replace('<o:p></o:p>', '').replace(r'<o:p>', '').replace(r'</o:p>', '')

            html_tree = BeautifulSoup(html, 'html5lib', )

            divs = html_tree.find('div', class_="WordSection1", recursive=True)

            i = 1
            for tag in divs.findAll(True):
                for attr in [attr for attr in tag.attrs]:

                    # remove this attrs keep all other's
                    if attr in ['dir', 'lang', 'class']:
                        del tag[attr]
                        continue

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
                sys.stdout.write(f"\33[K Processing volume {volume} line: {i}\r")

            sys.stdout.write(f"\33[K Writing files\r")

            handle_out = open(out, 'w')
            handle_out.write(str(divs))
            handle_out.close()

        # todo make this a module
        # just one css file
        handle_css = open(css, 'w')
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

        # handle_ms_css = open(ms_css, 'w')
        # for class_name in ms_class:
        #     line_breaks = style.replace
        #     handle_ms_css.write(f'.{class_name} {{\n   {line_breaks}\n}}\n')
        # handle_ms_css.close()
