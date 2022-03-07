import re
from .parser_ref import parse_reference

IGNORE = ['(#default#VML)',
          '(Web)',
          """(יַעַשׂ)""",
          """(השני)""",
          """((""",
          ]

RE_BIBLE_REF = [r'\([^()]*\)', r'\([^()]*\(']

HTML = """html to test"""


def get_html(source):
    """ Return html from source"""

    # old files
    if source.find('-{}') > 0:
        source = source.replace('-{}', '')
    handle = open(source, 'r')
    html = f"""{handle.read()}"""
    handle.close()
    return html


def mark_bible_refs(html_str, regular_expression=RE_BIBLE_REF):
    for expression in regular_expression:
        for bible_ref in re.findall(expression, html_str):

            # (</span><span class="halakha_ad-span-003" lang="AR-SA">תהילים\nקיט, צד)
            ref = re.sub('<.*?>', '', bible_ref)
            # (תהילים\nקיט, צד)
            ref = ref.replace('\n', ' ').replace('\r', ' ')
            #  '(משלי יד, לג('

            # Psalms 119:94 in english not hebrew
            parsed_ref = parse_reference(ref)
            if parsed_ref == '':
                continue

            lose_parentis = ref.replace('(', '').replace(')', '')

            striped_bible_ref = bible_ref.replace(')', '')
            striped_bible_ref = striped_bible_ref.replace(lose_parentis, '')

            if striped_bible_ref.startswith('(</span><span class="halakha_ad-span-003" lang="AR-SA">'):
                if ref.endswith(')'):
                    html_str = html_str.replace(bible_ref,
                                                f'</span><span lang="HE" class="he-biblical-ref" data-ref="{parsed_ref}">{ref}</span>',
                                                1)
                    continue
                if ref.endswith('('):
                    html_str = html_str.replace(bible_ref,
                                                f'</span><span lang="HE" class="he-biblical-ref" data-ref="{parsed_ref} >({lose_parentis})</span>',
                                                1)
                    continue

    return html_str
