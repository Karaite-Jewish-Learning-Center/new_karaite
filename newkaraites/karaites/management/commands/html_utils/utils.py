import re
from .parser_ref import parse_reference

IGNORE = ['(#default#VML)',
          '(Web)',
          ]
RE_BIBLE_REF = r'\([^()]*\)'


def get_html(source):
    """ Return html from source"""
    handle = open(source, 'r')
    html = f"""{handle.read()}"""
    handle.close()
    return html


def ignore_ref(bible_ref):
    if bible_ref == '':
        return True
    if len(bible_ref) > 30:
        return True

    if bible_ref in IGNORE:
        return True
    return False


def mark_bible_refs(html, regular_expression=RE_BIBLE_REF):
    for bible_ref in re.findall(regular_expression, html):

        # (</span><span class="span-125" lang="AR-SA">תהילים\nקיט, צד)
        ref = re.sub('<.*?>', '', bible_ref)
        # '(משלי יד, לג)'

        parsed_ref = parse_reference(ref)
        if parsed_ref == '':
            continue

        # Psalms 119:94 in english not hebrew
        if ignore_ref(parsed_ref):
            continue

        lose_parentis = ref.replace('(', '').replace(')', '')
        print(lose_parentis)
        #
        striped_bible_ref = bible_ref.replace(')', '')
        striped_bible_ref = striped_bible_ref.replace(lose_parentis, '')
        print('parsed ref', parsed_ref)
        print('striped', striped_bible_ref)
        print('html before', html)
        print('bible', bible_ref)

        if striped_bible_ref.startswith('(</span><span class="span-125" lang="AR-SA">'):
            if striped_bible_ref.endswith('</span><span class="span-123" lang="AR-SA">'):
                html = html.replace(bible_ref,
                                    (f'</span><span lang="HE" class="he-biblical-ref">{ref}'
                                     f'</span><span class="span-123" lang="AR-SA">'), 1)
            else:
                html = html.replace(bible_ref,
                                    f'</span><span lang="HE" class="he-biblical-ref">{ref}', 1)
        else:
            print(bible_ref)

    print('html', html)
    return html
