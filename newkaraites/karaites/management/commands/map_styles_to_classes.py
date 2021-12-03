import sys
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand

style_classes = {}
ms_classes = []
tags = {}

#
# class Command(BaseCommand):
#     help = 'Populate Database with Karaites books as array at this point is only for the books bellow'
new_html = []


def recurse(element):
    if hasattr(element, 'children'):
        for child in element.children:
            if hasattr(child, 'attrs'):
                style = child.attrs.get('style', None)
                tag = child.name
                class_name = None
                if tag not in tags:
                    tags[tag] = 0

                if style is not None:
                    # print()
                    # print(style)
                    # add a style style_classes
                    style = style.strip().replace(' ', '').replace('\n', '').replace('\r', '')
                    if style not in style_classes:
                        class_name = f'{child.name}-{tags[tag]}'
                        style_classes.update({style: class_name})
                        child.attrs.pop('style')
                        tags[tag] += 1

                    if child.attrs.get('class', None) is not None:
                        ms_class = child.attrs['class']
                        if ms_class not in ms_classes:
                            ms_classes.append(ms_class)
                        if class_name is not None:
                            child.attrs['class'].append(class_name)
                    else:
                        if class_name is not None:
                            child.attrs['class'] = [class_name]
            recurse(child)
    new_html.append(element)
    return element


def handle():
    """ Karaites books as array """
    # new_html = BeautifulSoup('<div id="start"></div>', 'html5lib')
    for volume in [1]:  # , 2]:
        # source = (f'../newkaraites/data_karaites/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/'
        source = (f'/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/data_karaites/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/'
                  f'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume {volume}.html')

        out = (f'/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/karaites/management/tmp/'
               f'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume {volume}.html')

        css = f'/Users/sandro/anaconda3/envs/kjoa/new_karaite/newkaraites/karaites/management/tmp/tmp-{volume}.css'
        ms_css = f'../newkaraites/tmp/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/ms-tmp.css'

        handle_source = open(source, 'r')
        html_tree = BeautifulSoup(handle_source.read(), 'html5lib')
        handle_source.close()
        divs = html_tree.find_all('div', class_="WordSection1", recursive=True)
        children = divs[0].find_all(recursive=True)

        i = 1
        for child in children:
            recurse(child)
            new_html.reverse()
            print(new_html)

            # print('After ' + '-' * 90)
            # print(child)
            # input('>>')
            # i += 1
            # if i > 2:
            break
            sys.stdout.write(f"\33[K Processing volume {volume} line: {i}\r")
        sys.stdout.write(f"\33[K Writing files\r")
        handle_out = open(out, 'w')
        handle_out.write(str(children))
        handle_out.close()

        handle_css = open(css, 'w')

        for style, class_name in style_classes.items():
            # line_breaks = style.replace(";", ";\n   ")
            handle_css.write(f'.{class_name} {{\n   {style}\n}}\n')
        handle_css.close()

        # handle_ms_css = open(ms_css, 'w')
        # for class_name in ms_class:
        #     line_breaks = style.repla
        #     handle_ms_css.write(f'.{class_name} {{\n   {line_breaks}\n}}\n')
        # handle_ms_css.close()


handle()