import re
from .parser_ref import parse_reference

IGNORE = ['(#default#VML)',
          '(Web)',
          ]
RE_BIBLE_REF = r'\([^()]*\)'

HTML = r"""
<p class="MsoNormal h1-00" dir="RTL"><span class="span-155" dir="LTR" lang="EN"> </span></p>

<p class="MsoNormal h1-00" dir="RTL"><span class="span-156" lang="AR-SA">א</span><span class="span-155" lang="AR-SA">ז לא אבוש
בהביטי אל כל מצותיך: (</span><span class="span-157" lang="AR-SA">תהילים
קיט, ו</span><span dir="LTR"></span><span class="span-155" dir="LTR" lang="EN"><span dir="LTR"></span>(</span></p>

<p class="MsoNormal h1-00" dir="RTL"><span class="span-156" lang="AR-SA">ל</span><span class="span-155" lang="AR-SA">ך אני
הושיעני כי פקודיך דרשתי: (</span><span class="span-157" lang="AR-SA">תהילים
קיט, צד)</span><span class="span-155" dir="LTR" lang="EN"></span></p>

<p class="MsoNormal h1-00" dir="RTL"><span class="span-156" lang="AR-SA">י</span><span class="span-155" lang="AR-SA">הי לבי תמים
בחקיך למען לא אבוש: (</span><span class="span-157" lang="AR-SA">תהילים
קיט, פ</span><span dir="LTR"></span><span class="span-155" dir="LTR" lang="EN"><span dir="LTR"></span>(</span></p>

<p class="MsoNormal h1-00" dir="RTL"><span class="span-156" lang="AR-SA">ה</span><span class="span-155" lang="AR-SA">עבר עיני
מראות שוא בדרכיך חייני: (</span><span class="span-157" lang="AR-SA">תהילים
קיט, לז)</span><span class="span-155" dir="LTR" lang="EN"></span></p>

<p class="MsoNormal h1-00" dir="RTL"><span class="span-156" lang="AR-SA">ו</span><span class="span-155" lang="AR-SA">אשתעשע
במצותיך אשר אהבתי: (</span><span class="span-157" lang="AR-SA">תהילים קיט, מז)</span><span class="span-155" dir="LTR" lang="EN"></span></p>

"""


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


def mark_bible_refs(html_str, regular_expression=RE_BIBLE_REF):

    for bible_ref in re.findall(regular_expression, html_str):

        # (</span><span class="span-157" lang="AR-SA">תהילים\nקיט, צד)
        ref = re.sub('<.*?>', '', bible_ref)
        # '(משלי יד, לג)'

        ref = ref.replace('\n', ' ').replace('\r', ' ')

        parsed_ref = parse_reference(ref)
        if parsed_ref == '':
            continue

        # Psalms 119:94 in english not hebrew
        if ignore_ref(parsed_ref):
            continue

        lose_parentis = ref.replace('(', '').replace(')', '')
        # print(lose_parentis)
        #
        striped_bible_ref = bible_ref.replace(')', '')
        striped_bible_ref = striped_bible_ref.replace(lose_parentis, '')

        if striped_bible_ref.startswith('(</span><span class="span-157" lang="AR-SA">'):
            if ref.endswith(')'):
                html_str = html_str.replace(bible_ref, f'</span><span lang="HE" class="he-biblical-ref">{ref}', 1)
                continue

            if bible_ref.endswith('</span><span class="span-155" lang="AR-SA">)'):
                html_str = html_str.replace(bible_ref,
                                    f'</span><span lang="HE" class="he-biblical-ref">{ref}</span><span class="span-155" lang="AR-SA">',
                                    1)
                continue

            if bible_ref.endswith('<span class="span-155" dir="LTR" lang="EN"><span dir="LTR"></span>(</span>'):
                html_str = html_str.replace(bible_ref, f'</span><span lang="HE" class="he-biblical-ref">{ref}</span>', 1)
                continue

    return html_str


