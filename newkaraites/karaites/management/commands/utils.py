import re

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
        # fix this !
    if bible_ref.find('8') > 0:
        return True
    if bible_ref in IGNORE:
        return True
    return False


def mark_bible_refs(html, regular_expression=RE_BIBLE_REF):
    for bible_ref in re.findall(regular_expression, html):
        if ignore_ref(bible_ref):
            continue

        html = html.replace(bible_ref, f'<span lang="HE" class="he-biblical-ref">{bible_ref}</span>')
    return html
