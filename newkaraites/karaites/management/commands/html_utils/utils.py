import re
from .parser_ref import parse_reference

IGNORE = ['(#default#VML)',
          '(Web)',
          ]
RE_BIBLE_REF = r'\([^()]*\)'

HTML = r"""
<h1 dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:embed"><span lang="AR-SA" style='font-family:"SBL Hebrew";color:#4BACC6;mso-themecolor:accent5'>שירי
המחבר</span><span dir="LTR" lang="EN" style='font-family:"SBL Hebrew";color:#4BACC6;
mso-themecolor:accent5'><o:p></o:p></span></h1>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span dir="LTR" lang="EN" style='font-size:12.0pt;line-height:115%;
font-family:"SBL Hebrew"'><o:p> </o:p></span></p>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:
"SBL Hebrew";mso-ansi-font-weight:bold'>א</span><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"'>ז לא אבוש
בהביטי אל כל מצותיך: (</span><span lang="AR-SA" style='font-size:12.0pt;
line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:David'>תהילים
קיט, ו</span><span dir="LTR"></span><span dir="LTR" lang="EN" style='font-size:12.0pt;
line-height:115%;font-family:"SBL Hebrew"'><span dir="LTR"></span>(<o:p></o:p></span></p>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:
"SBL Hebrew";mso-ansi-font-weight:bold'>ל</span><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"'>ך אני
הושיעני כי פקודיך דרשתי: (</span><span lang="AR-SA" style='font-size:12.0pt;
line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:David'>תהילים
קיט, צד)</span><span dir="LTR" lang="EN" style='font-size:12.0pt;line-height:115%;
font-family:"SBL Hebrew"'><o:p></o:p></span></p>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:
"SBL Hebrew";mso-ansi-font-weight:bold'>י</span><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"'>הי לבי תמים
בחקיך למען לא אבוש: (</span><span lang="AR-SA" style='font-size:12.0pt;
line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:David'>תהילים
קיט, פ</span><span dir="LTR"></span><span dir="LTR" lang="EN" style='font-size:12.0pt;
line-height:115%;font-family:"SBL Hebrew"'><span dir="LTR"></span>(<o:p></o:p></span></p>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:
"SBL Hebrew";mso-ansi-font-weight:bold'>ה</span><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"'>עבר עיני
מראות שוא בדרכיך חייני: (</span><span lang="AR-SA" style='font-size:12.0pt;
line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:David'>תהילים
קיט, לז)</span><span dir="LTR" lang="EN" style='font-size:12.0pt;line-height:115%;
font-family:"SBL Hebrew"'><o:p></o:p></span></p>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:
"SBL Hebrew";mso-ansi-font-weight:bold'>ו</span><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"'>אשתעשע
במצותיך אשר אהבתי: (</span><span lang="AR-SA" style='font-size:12.0pt;line-height:
115%;font-family:"SBL Hebrew";mso-fareast-font-family:David'>תהילים קיט, מז)</span><span dir="LTR" lang="EN" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"'><o:p></o:p></span></p>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span dir="LTR" lang="EN" style='font-size:12.0pt;line-height:115%;
font-family:"SBL Hebrew"'><o:p> </o:p></span></p>

<p class="MsoNormal" dir="RTL" style="text-align:right;direction:rtl;unicode-bidi:
embed"><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:
"SBL Hebrew"'>דרכיך יי' הודיעני - ארחותיך למדני: (</span><span lang="AR-SA" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:
David'>תהילים כה, ד</span><span dir="LTR"></span><span dir="LTR" lang="EN" style='font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"'><span dir="LTR"></span>(<o:p></o:p></span></p>
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


def mark_bible_refs(html=HTML, regular_expression=RE_BIBLE_REF):

    for bible_ref in re.findall(regular_expression, html):

        # (</span><span class="span-157" lang="AR-SA">תהילים\nקיט, צד)
        ref = re.sub('<.*?>', '', bible_ref)
        # '(משלי יד, לג)'

        ref = ref.replace('\n', '').replace('\r', '')

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

        # print()
        # print('parsed ref', parsed_ref)
        # print('striped', striped_bible_ref)
        # print('bible_ref', bible_ref)
        # print('ref', ref)
        # input('>>')

        # if bible_ref.startswith('(') and bible_ref.endswith(')'):
        #     html = html.replace(bible_ref, f'<span lang="HE" class="he-biblical-ref">{ref}</span>', 1)
        #     continue

        if striped_bible_ref.startswith('(</span><span class="span-157" lang="AR-SA">'):
            if striped_bible_ref.endswith(')'):
                html = html.replace(bible_ref, f'</span><span lang="HE" class="he-biblical-ref">{ref}', 1)
                continue

            if bible_ref.endswith('</span><span class="span-155" lang="AR-SA">)'):
                html = html.replace(bible_ref,
                                    f'</span><span lang="HE" class="he-biblical-ref">{ref}</span><span class="span-155" lang="AR-SA">',
                                    1)
                continue

            if bible_ref.endswith('<span class="span-155" dir="LTR" lang="EN"><span dir="LTR"></span>(</span>'):
                html = html.replace(bible_ref, f'</span><span lang="HE" class="he-biblical-ref">{ref}</span>', 1)
                continue

    return html
"""
<p class="MsoNormal h1-00" dir="RTL"><span class="span-156" lang="AR-SA">א</span><span class="span-155" lang="AR-SA">ז לא אבוש
בהביטי אל כל מצותיך: (</span><span class="span-157" lang="AR-SA">תהילים
קיט, ו</span><span dir="LTR"></span><span class="span-155" dir="LTR" lang="EN"><span dir="LTR"></span>(</span></p>
"""

mark_bible_refs()
