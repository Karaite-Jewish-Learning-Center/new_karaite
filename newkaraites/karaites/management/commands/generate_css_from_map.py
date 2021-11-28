from django.core.management.base import BaseCommand
from .map_ms_html import (MAP_P_STYLE_TO_CLASSES,
                          MAP_SPAN_STYLE_TO_CLASSES,
                          MAP_H1_TO_STYLES_TO_CLASSES)


class Command(BaseCommand):
    help = 'Create a css file from maps in map_ms_html'

    def handle(self, *args, **options):
        handle = open('../newkaraites/frontend/src/components/css/karaite.css', 'w')
        handle.write('/* this file is generated with command generate_css_from_map.py\n')
        handle.write('Not supposed to be manually edited.\n')
        handle.write('To refresh just run the generate_css_from_map at command prompt\n')
        handle.write('*/\n\n')

        for tag_map in [MAP_P_STYLE_TO_CLASSES, MAP_SPAN_STYLE_TO_CLASSES, MAP_H1_TO_STYLES_TO_CLASSES]:

            for style, class_names in tag_map.items():
                if len(class_names) > 1:
                    index = 1
                else:
                    index = 0

                line_breaks = style.replace(";", ";\n   ")
                handle.write(f'.{class_names[index]} {{\n   {line_breaks}\n}}\n')

        handle.write('')
        handle.close()
