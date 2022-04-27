import sys
import re
import shutil
from html import escape
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from ...constants import (BIBLE_BOOKS_NAMES)
from .command_utils.utils import mark_bible_refs
from .command_utils.read_write_data import (read_data,
                                            write_data)

from .addtional_css import additional_css
from .constants import (SOURCE_PATH,
                        OUT_PATH,
                        CSS_SOURCE,
                        CSS_OUT,
                        REMOVE_CSS_CLASS)
from .command_utils.parser_ref import (parse_reference,
                                       ABBREVIATIONS)
from .command_utils.utils import RE_BIBLE_REF
from .command_utils.argments import arguments
from .command_utils.process_arguments import process_arguments

style_classes_by_book = {}
ms_classes = []
tags = {}


def fix_iframe(path, book_name):
    book_data = read_data(path, book_name, SOURCE_PATH)
    remove = """<p class=MsoNormal><b><span style='mso-bidi-language:HE'>Recording: </span></b><span
style='mso-bidi-language:HE'>&lt;iframe width=&quot;560&quot;
height=&quot;315&quot; <span class=SpellE>src</span>=&quot;https://www.youtube.com/embed/WZOwo9qW3iM&quot;
title=&quot;YouTube video player&quot; frameborder=&quot;0&quot;
allow=&quot;accelerometer; <span class=SpellE>autoplay</span>; clipboard-write;
encrypted-media; gyroscope; picture-in-picture&quot; <span class=SpellE>allowfullscreen</span>&gt;&lt;/iframe&gt;<o:p></o:p></span></p>"""

    book_data = book_data.replace(remove,
                                  """<iframe width="560" height="315" src="https://www.youtube.com/embed/WZOwo9qW3iM"></iframe>""")
    write_data(path, book_name, book_data, SOURCE_PATH)


def removing_no_breaking_spaces(html_tree):
    spans = html_tree.find_all('span', class_='span-49')
    for child in spans:
        child.decompose()
    return html_tree


def update_bible_references_en(html_tree):
    names = BIBLE_BOOKS_NAMES.values()
    for klass in ['span-39', 'span-43', 'span-48', 'span-52', 'span-63']:
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


def update_bible_references_he(html_tree, language="HE"):
    """ some books ( liturgy) have bible in English, even if the text is in Hebrew"""
    language_lower = language.lower()
    names = BIBLE_BOOKS_NAMES.keys()
    for c in ['span-06', 'span-08', 'span-56']:
        spans = html_tree.find_all('span', class_=c)
        for child in spans:
            bible_ref = child.text
            for name in names:
                if bible_ref.replace('(', '').replace(')', '').strip().startswith(name):
                    child.attrs['lang'] = language
                    child.attrs['class'] = f"{language_lower}-biblical-ref"

    return html_tree


REF = re.compile(RE_BIBLE_REF[0])
CLEAN_HTML = re.compile('<.*?>')


def update_bible_re(html_tree):
    """ some books ( liturgy) have bible in English, even if the text is in Hebrew """

    html_str = str(html_tree)

    # expand abbreviations
    for abbr, full_name in ABBREVIATIONS:
        html_str = html_str.replace(abbr, full_name)

    map_ref = {}
    i = 0
    for ref in re.findall(REF, html_str):
        # ref = ref.replace('<span class="span-99">\xa0 </span>', '').replace('<span class="span-136">\xa0 </span>', '')
        # only text
        clean_ref = re.sub(CLEAN_HTML, '', ref.replace('\n', ' ').replace('\r', ' '))

        valid_ref, language = parse_reference(clean_ref)

        if valid_ref != '':
            i += 1
            map_ref[i] = clean_ref
            # print('ref', f'"{ref}"')
            tag_ref = f'<span class="{language}-biblical-ref" lang="{language}">show-{i:04}</span>'
            # tag = ref.replace(ref, tag_ref)
            # print('tag', f'"{tag}"')
            new_html = html_str.replace(ref, tag_ref)
            # print('changed ', new_html != html_str)
            html_str = new_html

    for k, v in map_ref.items():
        html_str = html_str.replace(f'show-{k:04}', v)

    return BeautifulSoup(html_str, 'html5lib')


def update_bible_adderet(html_tree):
    return BeautifulSoup(mark_bible_refs(str(html_tree)), 'html5lib')


def fix_chapter_verse(html_tree):
    span = str(html_tree).replace("""<span class="span-50">:30
This </span>""", '<span class="span-50">11:30 This </span>')
    span = span.replace('<span class="span-58">31</span>',
                        '<span class="span-58">31:26 Beside the ark of God’s covenant </span>')
    span = span.replace('<span class="span-58">34</span>',
                        '<span>34:1 From [<i>et</i>]<i> </i>Gilead</span>')
    return BeautifulSoup(span, 'html5lib')


BOOKS = [1, 2]

LANGUAGES = {'en': "English",
             'he': "Hebrew",
             'ja': 'Judeo_Arabic',
             # this means a formatted table with hebrew and english
             'he-en': 'Hebrew-English',
             # technical "in" , "toc" are not a language,
             # we use to process introduction files and table of contents files
             "in": "Introduction", 'toc': "TOC"}


def replace_path(html_tree, old_path, new_path):
    for child in html_tree.find_all('img'):
        image_path = child.attrs.get('src', None)
        if image_path is not None:
            child.attrs['src'] = image_path.replace(old_path, new_path)
            # child.attrs['src'] = child.attrs['src'].replace('/', '\\')
    return html_tree


def fix_image_pats(path, book_name):
    # specific to
    html_tree = BeautifulSoup(read_data(path, f'{book_name}', SOURCE_PATH), 'html5lib')
    old_path = "Patshegen%20Ketav%20Haddat%20Images.fld/"
    new_path = "/static-django/images/Patshegen%20Ketav%20Hadat/"
    html_tree = replace_path(html_tree, old_path, new_path)
    write_data(path, f'{book_name}', str(html_tree), SOURCE_PATH)


def fix_image_gan(path, book_name):
    # specific for Gan Eden
    html_tree = BeautifulSoup(read_data(path, f'{book_name}', SOURCE_PATH), 'html5lib')
    old_path = "Gan%20Eden%20Hebrew%20Text.fld/image001.jpg"
    new_path = "/static-django/images/Gan Eden/image001.jpg"
    html_tree = replace_path(html_tree, old_path, new_path)
    write_data(path, f'{book_name}', str(html_tree), SOURCE_PATH)


def fix_image_source(path, book_name):
    # this is specific to Halakha Adderet
    # old_path = 'Adderet%20Eliyahu%20Critical%20Edition.fld/'
    # replace for the above if book changes
    old_path = '/static-django/images/Adderet_Eliyahu_R_Elijah_Bashyatchi/'
    book_name = book_name.replace('.html', '')
    html_tree = BeautifulSoup(read_data(path, f'{book_name}.html', SOURCE_PATH), 'html5lib')
    new_path = '/static-django/images/adderet_eliyahu_r_elijah_bashyatchi/'
    html_tree = replace_path(html_tree, old_path, new_path)
    write_data(path, f'{book_name}.html', str(html_tree), SOURCE_PATH)


HTML = """
<html>
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    </head>
    <body lang="EN-US">
    <div class="WordSection1">    
        {}
        {}
    </div>
    <div style="mso-element:footnote-list">
        {}
        {}
    </div>
    </body>
</html>
"""

BASIC_STYLE = """
    <style>
        .en-biblical-ref {
        color: red;
    }
    
    .he-biblical-ref {
        color: green;
    }
    
    .en-foot-note {
        color: green;
    }
    
    .he-foot-note {
        color: green;
    }
""" + additional_css + """    
</style>
"""

BASIC_HTML = """
<html>
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
        {}
    </head>
    <body lang="EN-US">
        {}
    </div>
    </body>
</html>
"""


def remove_tag(div_str, tag):
    div_str = div_str.replace(tag, '', 1)
    div_str = div_str[::-1]
    div_str = div_str.replace('</div>'[::-1], '', 1)
    div_str = div_str[::-1]
    return div_str


def update_index(div_str, i, index):
    """ Update index for notes on the second book, both start foot-notes
        at 1
    """
    div_str = div_str.replace('\n', '').replace('\t', '').replace('\r', '')

    div_str = div_str.replace(f'<div id="ftn{i}" style="mso-element:footnote">',
                              f'<div id="ftn{index}" style="mso-element:footnote">')

    div_str = div_str.replace(f'<a href="#_ftn{i}" ',
                              f'<a href="#_ftn{index}" ', 1)

    div_str = div_str.replace(f'<a href="#_ftn{index}" name="_ftnref{i}"',
                              f'<a href="#_ftn{index}" name="_ftnref{index}"', 1)

    div_str = div_str.replace(f'<a href="#_ftn{index}" name="_ftnref{i}"',
                              f'<a href="#_ftn{index}" name="_ftnref{index}"', 1)

    div_str = div_str.replace(f'style="mso-footnote-id:ftn{i}"',
                              f'style="mso-footnote-id:ftn{index}"', 1)

    div_str = div_str.replace(f'>[{i}]</span>',
                              f'>[{index}]</span>', 1)

    return div_str


def add_book_parts(path, book_name, books=BOOKS):
    """added books together in a single file"""

    # number of foot-notes in the first book
    magical_number = 682
    book_name = book_name.replace('.html', '')

    for part in books:
        book_data = read_data(path, f'{book_name}-{part}.html', SOURCE_PATH)

        if part == 1:
            div1_str = str(BeautifulSoup(book_data, 'html5lib').find('div', class_="WordSection1"))
            foot_notes1 = str(BeautifulSoup(book_data, 'html5lib').find('div',
                                                                        attrs={'style': "mso-element:footnote-list"}))

        if part == 2:
            # second book we have to update all foot-notes numbers and references.
            div2_str = str(BeautifulSoup(book_data, 'html5lib').find('div', class_="WordSection1"))

            foot_notes2 = str(BeautifulSoup(book_data, 'html5lib').find('div',
                                                                        attrs={'style': "mso-element:footnote-list"}))
            # process body foot-notes
            for i in range(1, 613):
                index = i + magical_number
                div2_str = update_index(div2_str, i, index)
                foot_notes2 = update_index(foot_notes2, i, index)

            div1_str = remove_tag(div1_str, '<div class="WordSection1">')
            foot_notes1 = remove_tag(foot_notes1, '<div style="mso-element:footnote-list">')
            div2_str = remove_tag(div2_str, '<div class="WordSection1">')
            foot_notes2 = remove_tag(foot_notes2, '<div style="mso-element:footnote-list">')
            html = HTML.format(div1_str, div2_str, foot_notes1, foot_notes2)

    write_data(path, f'{book_name}.html', html, SOURCE_PATH)


# book path
# book name
# language
# post process list of function
# pre-process list of function
# collect css
# table_book
COMMENTS = [
    [

        'HTML/Comments/Ali ben Suleiman/',
        'ali_ben_suleiman_commentary_on_genesis-{}.html',
        'ja,in',
        [],
        [update_bible_re],
        {'name': r"Ali ibn Suleiman’s Commentary on Genesis,",
         'first_level': 8,
         'book_classification': '80',
         'author': 'Ali ibn Suleiman,',
         'css_class': ''},
        True
    ],
    [

        'HTML/Deuteronomy_Keter_Torah_Aaron_ben_Elijah/',
        'Deuteronomy_Keter Torah_Aaron ben Elijah-{}.html',
        'en,he',
        [],
        [update_bible_re, removing_no_breaking_spaces, fix_chapter_verse],
        {'name': r"Deuteronomy Keter Torah Aaron ben Elijah, ",
         'first_level': 8,
         'book_classification': '80',
         'author': 'Aaron ben Elijah,',
         'css_class': ''},
        True
    ],

]
HALAKHAH = [
    [
        'HTML/Halakhah/aaron_ben_josephs_essay_on_the _obligation_of_prayer/',
        'aaron_ben_Josephs_Essay_on_the_obligation_of_prayer-{}.html',
        'en,in',
        [],
        [],
        {'name': r"Aaron ben Joseph's Essay on the Obligation of Prayer,הצעה בחיוב התפלה ",
         'first_level': 3,
         'book_classification': '80',
         'author': ',',
         'css_class': '',
         'remove_class': 'MsoTableGrid',
         'remove_tags': '<o:p>&nbsp;</o:p>'},
        True
    ],
    [
        'HTML/Halakhah/Gan Eden/', 'Gan Eden-{}.html',
        'he,in,toc',
        [fix_image_gan],
        [update_bible_re],
        {'name': r"Gan Eden,גן עדן",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Aaron ben Elijah (“Aaron the Younger”) of Nicomedia,',
         'css_class': '',
         'direction': 'rtl'},
        True
    ],
    [
        'HTML/Halakhah/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/',
        'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume 1.html',
        'he',
        [],
        [update_bible_re],
        {'name': r"Yeriot Shelomo Volume 1, יריעות שלמה",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Yeriot Shelomo‘,',
         'css_class': ''},
        True
    ],
    [
        'HTML/Halakhah/Shelomo_Afeida_HaKohen_Yeriot_Shelomo/',
        'Shelomo Afeida HaKohen_Yeriot Shelomo_Volume 2.html',
        'he',
        [],
        [update_bible_re],
        {'name': r"Yeriot Shelomo Volume 2, יריעות שלמה",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Yeriot Shelomo‘,',
         'css_class': ''},
        False
    ],
    [
        'HTML/Halakhah/Adderet_Eliyahu_R_Elijah_Bashyatchi/',
        'Adderet Eliyahu-{}.html',
        'he,in,toc',
        [fix_image_source],
        [update_bible_re],
        {'name': r"Adderet Eliyahu, Adderet Eliyahu",
         'first_level': 3,
         'book_classification': '80',
         'author': 'R. Elijah ben Moshe Bashyatchi’sAdderet Eliyahu,',
         'css_class': '',
         },
        False
    ],
    [
        'HTML/Halakhah/Kitab al-Anwar/',
        'Kitab al-Anwar-{}.html',
        'he-en,in,toc',
        [],
        [update_bible_re],
        {'name': r"The Book of Lights and Watchtowers, Kitāb Al-Anwār Wal-Marāqib",
         'first_level': 3,
         'book_classification': '80',
         'author': ',',
         'css_class': '',
         'table_book': True,
         'columns': 2,
         'columns_order': '0,1,2',
         'toc_columns': '2,1,2',
         'lang_index': False,
         },
        False
    ],
    [
        'HTML/Halakhah/Patshegen Ketav Haddat/',
        'Patshegen Ketav Haddat-{}.html',
        'he,in,toc',
        [fix_image_pats],
        [update_bible_re],
        {'name': r"Patshegen Ketav Haddat, פתשגן כתב הדת",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Caleb Afendopolo,',
         'css_class': ''},
        False
    ],
    [
        'HTML/Halakhah/Ritual Slaughter/',
        'Shehita-{}.html',
        'he-en,in,toc',
        [],
        [update_bible_re],
        {'name': "Ritual Slaughter,ענין השחיטה",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Zahava Yod,',
         'css_class': '',
         'table_book': True,
         'columns': 2,
         'columns_order': '0,1,2',
         'toc_columns': '1,0',
         'direction': 'ltr',
         'lang_index': False,
         },
        False
    ],
    [
        'HTML/Halakhah/The Palanquin/',
        'Palanquin-{}.html',
        'he-en,in,toc',
        [],
        [update_bible_re],
        {'name': "The Palanquin,אפריון עשה לו",
         'first_level': 3,
         'book_classification': '80',
         'author': ' Hakham Solomon ben Aaron,',
         'css_class': '',
         'table_book': True,
         'columns': 2,
         'columns_order': '2,1,0',
         # position 0 = key
         'toc_columns': '0,2,1',
         'direction': 'ltr',
         'lang_index': False,
         },
        False
    ],
    [
        'HTML/Halakhah/The Remnant and the Relic/',
        'Remnant Relic-{}.html',
        'he-en,in,toc',
        [],
        [update_bible_re],
        {'name': r"The Remnant and the Relic , השריד והפליט",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Zahava Yod,',
         'css_class': '',
         'table_book': True,
         'columns': 2,
         'columns_order': '2,1,0',
         'toc_columns': '0,1',
         'direction': 'ltr',
         'lang_index': False,
         },
        False
    ],

]
HAVDALA = [
    [
        'HTML/Liturgy/Havdala Songs/', 'Essa Bechos Yesha‘.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Essa Bechos Yesha‘, אשא בכוס ישע",
         'first_level': 4,
         'book_classification': '10',
         'author': 'Essa Bechos Yesha‘,',
         'css_class': 'simple'},
        False
    ],
    [
        'HTML/Liturgy/Havdala Songs/', 'Et Kos Yeshu‘ot.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Et Kos Yeshu‘ot‘,את כוס ישועות",
         'first_level': 4,
         'book_classification': '10',
         'author': 'Yosef ben Shemu’el Rodi,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Havdala Songs/', 'Malé ‘Olam Kevod Yofi.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': "Malé ‘Olam Kevod Yofi,מלא עולם כבוד יופי",
         'first_level': 4,
         'book_classification': '10',
         'author': 'Mordochai ben Ya‘aḳov ben Shemu’el Politi,',
         'css_class': 'simple'},
        False
    ],
]
PASSOVER_SONGS = [
    [
        'HTML/Liturgy/Passover Songs/Azkir Tehillot/',
        'Azkir Tehillot-{}.html',
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Azkir Tehillot,אזכיר תהלות",
         'first_level': 4,
         'book_classification': '15',
         'author': 'Yosef bar Yitshak,',
         'css_class': '',
         # search index in hebrew, english and transliteration
         'index_lang': 'True',
         },
        False
    ],
    [
        "HTML/Liturgy/Passover Songs/Hodu_Le_el_De_ot/",
        "Hodu_Le_el_Deot-{}.html",
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Hodu Le’el De‘ot, הודו לאל דעות",
         'first_level': 4,
         'book_classification': '15',
         'author': 'Perhaps Hillel Bashyači,',
         'css_class': '',
         },
        False
    ],
    [

        "HTML/Liturgy/Passover Songs/Odecha_El_Al Ki_Noraot/",
        "Odecha_El_Ki_Noraot-{}.html",
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Odecha El ‘Al Ki Nora’ot, אודך אל על כי נוראות",
         'first_level': 4,
         'book_classification': '15',
         'author': 'Simha ben Shelomo,',
         'css_class': '',
         },
        False
    ],
    [
        "HTML/Liturgy/Passover Songs/Yahid_Be_Olamo/",
        "Yahid_Be_olamo-{}.html",
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Yaḥid Be‘olamo, יחיד בעולמו",
         'first_level': 4,
         'book_classification': '15',
         'author': 'Yitsḥaḳ ben Shelomo,',
         'css_class': '',
         },
        False
    ],
    [
        "HTML/Liturgy/Passover Songs/Yonat_Elim/",
        "Yonat_Elem-{}.html",
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Yonat Elem, יונת אלם",
         'first_level': 4,
         'book_classification': '15',
         'author': 'Yosef Cohen,',
         'css_class': '',
         },
        False
    ],
]
PRAYERS = [
    [
        'HTML/Liturgy/Prayers/', 'En Kelohenu.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"En Kelohenu, אין כאלהינו",
         'first_level': 4,
         'book_classification': '20',
         'author': 'En Kelohenu,',
         'css_class': 'simple'},
        False
    ],
    [
        'HTML/Liturgy/Prayers/', 'Lutski Prayer for a Time of Plague.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Lutski Prayer for a Time of Plague,בקשה לאמרו בזמן המגפה",
         'first_level': 4,
         'book_classification': '20',
         'author': 'N/A,',
         'css_class': 'simple'},
        False
    ],
]
PURIM_SONGS = [
    [
        "HTML/Liturgy/Purim Songs/Adon_Yeshu_ot/",
        "Adon_Yeshu_ot-{}.html",
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Adon Yeshu‘ot , אדון ישועות",
         'first_level': 4,
         'book_classification': '18',
         'author': ' Attributed to Anan,',
         'css_class': '',
         },
        False
    ],
    [
        "HTML/Liturgy/Purim Songs/Shiru_Am_Zakkai/",
        "Shiru_Am_Zakkai-{}.html",
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Shiru ‘Am Zakka , שירו עם זכאי",
         'first_level': 4,
         'book_classification': '18',
         'author': 'Shemu’el Levi,',
         'css_class': '',
         },
        False
    ],
    [
        "HTML/Liturgy/Purim Songs/Simhu Bene El Ne_eman/",
        "Simhu Bene El Ne_eman-{}.html",
        'he,in',
        [],
        [update_bible_re],
        {'name': r"Simhu Benē El Ne’eman , שירו עם זכאי",
         'first_level': 4,
         'book_classification': '18',
         'author': 'Simḥa ben Shelomo,',
         'css_class': '',
         },
        False
    ],
]
SHABBAT_SONGS = [
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ashir Beshir Ḥadash.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ashir Beshir Ḥadash, אשיר בשיר חדש",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yosef ben Nisan Poziemski,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ashir Beshira El Nora Tehillot.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ashir Beshira El Nora Tehillo, אשיר בשירה אל נורא תהלות",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Avraham ben Yoshiyahu Ha-rofé,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ashir Le’el ‘Elyon.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ashir Le’el ‘Elyon,אשיר לאל עליון",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Ashir Le’el ‘Elyon,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ekkon Lemmul Shabbat.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ekkon Lemul Shabbat, אכון למול שבת",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yosef ben Yitsḥaḳ Itson,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Esmaḥ Beshir Ḥadash.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Esmaḥ Beshir Ḥadash,אשמח בשיר חדש",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Ezra ben Nisan Ha-rofé,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ezkor Lemitsvat Melech.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ezkor Lemitsvat Melech, אזכור למצות מלך",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Shelomo ben Aharon,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Eḳra Le’el ‘Elyon.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Eḳra Le’el ‘Elyon,אקרא לאל עליון",
         'first_level': 4,
         'book_classification': '30',
         'author': 'R. Abraham ben Mordochai,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/',
        'Mitsvat Yesod Shabbat-{}.html',
        'he,in',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Mitsvat Yesod Shabbat,מצות יסוד שבת",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Moshe Beghi,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Mizmor Leyom Shabbat.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Mizmor Leyom Shabbat,מזמור ליום שבת",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Shelomo ben Aharon,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Odé Le’el Maḥsi.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Odé Le’el Maḥsi, אודה לאל מחסי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Odé Le’el Maḥsi,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ori Yeḥidati.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ori Yeḥidati,אורי יחידתי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Mordochai Sultansky,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Shabbat Menuḥa.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Shabbat Menuḥa, שבת מנוחה",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Shabbat Menuḥa,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Yah Zimrati.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yah Zimrati,יה זמרתי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yah Zimrati,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Yatsar Ha’el.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yatsar Ha’el, יצר האל",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Ya‘aḳov (otherwise unknown),',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Yerivai Ve’oyevai.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yerivai Ve’oyevai, יריבי ואויבי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yisra’el ben Shemu’el Ha-ma‘aravi Ha-dayyan,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Yeter Peletat ‘Am.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yeter Peletat ‘Am, יתר פליטת עם",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yeter Peletat ‘Am,',
         'css_class': 'simple-3-4'},
        False
    ],
]
SUPPLEMENTAL = [
    [
        'HTML/Liturgy/Supplemental/', 'Anochi Anochi.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Anochi Anochi, אנכי אנכי",
         'first_level': 4,
         'book_classification': '40',
         'author': 'N/A (Biblical Verses)',
         'css_class': 'special'},
        False
    ],
    [
        'HTML/Liturgy/Supplemental/', 'Atsili Qum Qera.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Poems, Author
        {'name': r"Atsili ḳum ḳera, אצילי קום קרא",
         'first_level': 4,
         'book_classification': '40',
         'author': 'Abraham',
         'css_class': 'simple'},
        False
    ],
    [
        'HTML/Liturgy/Supplemental/', 'Evyon Asher.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Poems, Author
        {'name': r"Evyon Asher, אביון אשר",
         'first_level': 4,
         'book_classification': '40',
         'author': 'Anatoli (ben Joseph?)',
         'css_class': 'simple'},
        False
    ],
    [
        'HTML/Liturgy/Supplemental/', 'Vehahochma.html',
        'he',
        [fix_iframe],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Vehaḥochma Me’ayin Timmatsē, והחכמה מאין תמצא",
         'first_level': 4,
         'book_classification': '40',
         'author': 'N/A (Biblical Verses)',
         'css_class': 'simple'},
        False
    ],

    [
        'HTML/Liturgy/Supplemental/', 'Vehoshia.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Vehoshiya‘, והושיע",
         'first_level': 4,
         'book_classification': '40',
         'author': 'N/A (Biblical Verses)',
         'css_class': 'special-1'},
        False
    ],
]
WEDDING_SONGS = [
    [
        'HTML/Liturgy/Wedding Songs/', 'Amen Yehi Ratson.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Amen Yehi Ratson,  אמן יהי רצון",
         'first_level': 4,
         'book_classification': '50',
         'author': 'Amen Yehi Ratson,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Wedding Songs/', 'Laḥatani Mivḥar Banai.html',
        'he',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Laḥatani Mivḥar Banai,לחתני מבחר בני",
         'first_level': 4,
         'book_classification': '50',
         'author': 'Laḥatani Mivḥar Banai,',
         'css_class': 'simple-3-4'},
        False
    ],
    [
        'HTML/Liturgy/Wedding Songs/Matsa_Ish_sha_Matsa_Tov/',
        'Matsa_Ish_sha_Matsa_Tov-{}.html',
        'he-en,in',
        [],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"Matsa Ish sha Matsa Tov,מצא אשה מצא טוב",
         'first_level': 4,
         'book_classification': '50',
         'author': 'Laḥatani Mivḥar Banai,',
         'css_class': 'simple-3-4',
         'song': True},
        False
    ],
]

POETRY_NON_LITURGICAL = [
    [
        'HTML/Poetry (Non-Liturgical)/Ani Hayiti/',
        'Ani Hayiti-{}.html',
        'he,in',
        [],
        [update_bible_re],
        # name, Polemic , , Author
        {'name': r"Ani Hayiti, אני הייתי",
         'first_level': 9,
         'book_classification': '55',
         'author': "Moshe ben Shemu’el, משה בן שמואל"},
        False
    ],
    [
        'HTML/Poetry (Non-Liturgical)/Malki Becha/',
        'Malki Becha-{}.html',
        'he,in',
        [],
        [update_bible_re],
        # name, Polemic , , Author
        {'name': r"Malki Becha, מלכי בך",
         'first_level': 9,
         'book_classification': '55',
         'author': "Moshe ben Shemu’el, משה בן שמואל"},
        False
    ],
    [
        'HTML/Poetry (Non-Liturgical)/Oti Ashaq/',
        'Oti Ashaq-{}.html',
        'he,in',
        [],
        [update_bible_re],
        # name, Polemic , , Author
        {'name': r"Oti ‘Ashaḳ, אותי עשק",
         'first_level': 9,
         'book_classification': '55',
         'author': "Moshe ben Shemu’el, משה בן שמואל"},
        False
    ],
    [
        'HTML/Poetry (Non-Liturgical)/Paga Hammelech/',
        'Paga Hammelech-{}.html',
        'he,in',
        [],
        [update_bible_re],
        # name, Polemic , Author
        {'name': r"Paḡa‘ Hammelech , פגע המלך",
         'first_level': 9,
         'book_classification': '55',
         'author': "Moshe ben Shemu’el, משה בן שמואל"},
        False
    ],
]
POLEMIC = [
    [
        'HTML/Polemics/Sefer_Milhamot_Adonai/',
        'Sefer Milhamot-{}.html',
        'he,in,toc',
        [],
        [],
        # name, Polemic , Author
        # if multi_tables is True and css_class is not None then all tables will share css_class
        {'name': r"Sefer Milḥamot Adonai Sefer Milḥamot Hashem, ספר מלחמות ה'",
         'first_level': 5,
         'book_classification': '60',
         'author': "Salmon ben Yeruḥim, סלמון בן ירוחים",
         'css_class': 'sefer-extra',
         'remove_class': 'MsoTableGrid',
         'multi_tables': True,
         'table_book': True,
         'columns_order': '2,1,0',
         'toc_columns': '0,1',
         'direction': 'ltr',
         'lang_index': False,
         },
        False
    ],
    [
        '/HTML/Polemics/Hizzuk Emuna/', 'Hizzuk Emuna-{}.html',
        'he,in,toc',
        [],
        [update_bible_re],
        # name, Polemic , , Author
        {'name': r"Hizzuḳ Emuna,חזוק אמונה חיזוק אמונה",
         'first_level': 5,
         'book_classification': '60',
         'author': "Isaac ben Abraham"},
        False
    ],
]

# should be last,
TEST_BOOKS = [
    [
        'Vehahochma-2/', 'Vehahochma-2.html',
        'he',
        [fix_iframe],
        [update_bible_re],
        # name, liturgy , Biblical verses, Author
        {'name': r"2 Vehaḥochma Me’ayin Timmatsē, והחכמה מאין תמצא",
         'first_level': 4,
         'book_classification': '70',
         'author': 'N/A (Biblical Verses)'},
        False
    ],
]

LIST_OF_BOOKS = (COMMENTS +
                 HALAKHAH +
                 HAVDALA +
                 PASSOVER_SONGS +
                 PURIM_SONGS +
                 PRAYERS +
                 SHABBAT_SONGS +
                 SUPPLEMENTAL +
                 WEDDING_SONGS +
                 POETRY_NON_LITURGICAL +
                 POLEMIC)


class Command(BaseCommand):
    help = 'Populate Database with Karaites books as array at this point is only for the books bellow'

    def add_arguments(self, parser):
        arguments(parser)

    @staticmethod
    def replace_class_name(str_html):
        return str_html.replace('class="MsoNormalTable', 'class="MsoTableGrid')

    @staticmethod
    def replace_a_foot_notes(html_tree, language):
        """ replace complicate <a></a> with a tooltip """
        print()
        i = 1
        foot_notes = html_tree.find_all('a')
        total_foot_notes = len(foot_notes)
        # only languages

        for child in foot_notes:
            sys.stdout.write(f'\rPopulating footnotes {i} of {total_foot_notes}')
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
                    node = html_tree.find(id=foot_note_id)

                    if note_ref and node is not None:
                        # text = escape(node.text.replace('\xa0', '').strip())
                        text = escape(node.text)

                        ref = note_ref.group()
                        child.replace_with(BeautifulSoup(
                            f"""<span class="{language}-foot-note" data-for="{language}" data-tip="{text}"><sup class="{language}-foot-index">{ref}</sup></span>""",
                            'html5lib'))

                except KeyError:
                    # this seems a bug , hasattr, returns True for style, in fact no style attr
                    # these are mostly emtpy a tags so remove then
                    if len(child.text) == 0:
                        child.decompose()
                i += 1

        return html_tree

    @staticmethod
    def parse_and_save_css():
        # just one css file
        file_name = 'karaites.css'
        handle_css = open(f'{OUT_PATH}{file_name}', 'w')
        handle_css.write(f'\n/*  This file was generated by command process_books, should not be edit by hand.*/\n'
                         f'/*  All changes will be lost. You have been warned.                               */\n')

        for books in style_classes_by_book.keys():
            # add a comment book name to identify css by book
            handle_css.write(f'\n/*   {books}    */\n')

            styled_order = {k: v for k, v in sorted(style_classes_by_book[books].items(), key=lambda item: item[1])}

            for style, class_name in styled_order.items():

                # don't save this classes
                if class_name in REMOVE_CSS_CLASS:
                    continue

                # remove v:line class
                if class_name.find('v:line') >= 0:
                    continue
                css_elements = style.split(";")

                # remove duplicates
                rules = []
                values = []
                for css in css_elements:

                    if css.find(':') < 0:
                        continue

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

                    #  remove invalid solidwindowtext
                    css = css.replace('solidwindowtext', '')

                    if css.startswith('mso'):
                        continue

                    if css.startswith('tab-stops'):
                        continue

                    if css.startswith('padding') or \
                            css.startswith('text-indent') or \
                            css.startswith('margin') or \
                            css.startswith('margin'):
                        # remove redundant measure unit
                        css = css.replace(':0pt', ':0').replace(':0in', ':0')

                        css, values = css.split(':')

                        # remove flot point part
                        values = re.sub(r'\.[0-9]', '', values)

                        # replace in by pt
                        values = values.replace('in', 'pt').replace('pt', 'pt ').strip()

                        css = f'{css}:{values}'

                    cleaned += f'\t {css};\n'

                if cleaned == '':
                    continue

                handle_css.write(f'.{class_name} {{\n   {cleaned}}}\n')

        handle_css.write(additional_css)
        handle_css.close()

        # copy karaites.css
        sys.stdout.write(f"\rCopy {file_name} to final destination.\r")
        shutil.copy(f'{CSS_SOURCE}{file_name}', f'{CSS_OUT}{file_name}')

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
    def handle_ms_css():
        handle_ms_css = open(f'{OUT_PATH}ms.css', 'w')
        ms_classes.sort()
        for class_name in ms_classes:
            handle_ms_css.write(f'.{class_name} {{}}\n')
        handle_ms_css.close()

    @staticmethod
    def collect_style_map_to_class(html_tree, book, collect, lang, multi_table, css_class):
        style_classes = {}
        html = ''
        # book has more than one section
        for section in [1, 2, 3, 4]:
            nodes = html_tree.find('div', class_=f"WordSection{section}", recursive=True)
            if nodes is not None:
                html += str(nodes)
            if nodes is None and section == 1:
                break

        divs = BeautifulSoup(html, 'html.parser')

        book_name = book.replace('.html', '').lower()
        if book_name.find(' ') > 0:
            book_name = book_name.split(' ')[0]
            # remove any non-ascii character
            book_name = book_name.encode('ascii', errors='ignore').decode()

        # shorten book name
        book_name = book_name[0:10]

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
                    # make class independent of order of processing
                    class_name_by_tag = f'{book_name}-{tag.name}'
                    if class_name_by_tag not in tags:
                        tags[class_name_by_tag] = 0
                    else:
                        tags[class_name_by_tag] += 1

                    style = style.strip().replace(' ', '').replace('\n', '').replace('\r', '')

                    # multi_tables must have different class names even if style is the same
                    # also they share the css_class defined in details.
                    if tag.name == 'table' and multi_table:

                        if css_class is not None:
                            class_name = f'{lang}-{class_name_by_tag}-{tags[class_name_by_tag]:03} {css_class}'
                        else:
                            class_name = f'{lang}-{class_name_by_tag}-{tags[class_name_by_tag]:03}'
                        style_classes.update({style: class_name})

                    elif style not in style_classes:

                        class_name = f'{lang}-{class_name_by_tag}-{tags[class_name_by_tag]:03}'
                        style_classes.update({style: class_name})

                    else:
                        class_name = style_classes[style]

                    del tag[attr]

                    if tag.attrs.get('class', None) is not None:
                        tag.attrs['class'].append(class_name)
                    else:
                        tag.attrs['class'] = [class_name]

            if collect:
                style_classes_by_book[book] = style_classes

        return divs

    def handle(self, *args, **options):
        """
            Books are pre-process and writen to original
            directory

            Books are post-processed and writen to tmp directory
            tags are rewritten and styles mapped to a css
            class.
            A css file is generate.
        """

        books_to_process = process_arguments(options,
                                             LIST_OF_BOOKS,
                                             COMMENTS,
                                             HALAKHAH,
                                             HAVDALA,
                                             PASSOVER_SONGS,
                                             PURIM_SONGS,
                                             PRAYERS,
                                             POLEMIC,
                                             SHABBAT_SONGS,
                                             WEDDING_SONGS,
                                             SUPPLEMENTAL,
                                             POETRY_NON_LITURGICAL)
        if not books_to_process:
            return

        for path, book, language, pre_processes, _, _, _ in books_to_process:
            for lang in language.split(','):
                book_name = book.replace('{}', LANGUAGES[lang])
                for pre_process in pre_processes:
                    sys.stdout.write(f"\nPre-processing book : {book_name}")
                    pre_process(path, book_name)

        i = 1
        for path, book, language, _, post_processes, details, collect in books_to_process:
            # Book,Introduction and Toc are process with same language
            # may be some exceptions
            book_language = language.replace(',in', '').replace(',toc', '')
            for lang in language.split(','):
                book_name = book.replace('{}', LANGUAGES[lang])
                sys.stdout.write(f"\nPre-processing book {lang}: {book_name}")
                html = read_data(path, book_name, SOURCE_PATH)

                if html is None:
                    sys.stdout.write(f"\nSkipping {book_name} no suitable codec found.")
                    continue

                html_tree = BeautifulSoup(html, 'html5lib')

                html_tree = self.replace_a_foot_notes(html_tree, book_language)

                sys.stdout.write(f"\nRemoving comments for book {book_name}")
                html_str = self.replace_from_open_to_close(str(html_tree))

                sys.stdout.write(f"\nCollecting css for book {book_name}")
                html_tree = BeautifulSoup(html_str, 'html5lib')

                html_tree = self.collect_style_map_to_class(html_tree,
                                                            book_name,
                                                            collect,
                                                            lang,
                                                            details.get('multi_tables', False),
                                                            details.get('css_class', None))

                for process in post_processes:
                    sys.stdout.write(f"\n{process.__name__.replace('_', ' ').capitalize()} {book_name}")
                    html_tree = process(html_tree)

                sys.stdout.write(f"\nRemoving empty tags for book {book_name}")
                html_str = self.remove_tags(str(html_tree))
                html_str = self.replace_class_name(html_str)
                sys.stdout.write('\r\n')
                sys.stdout.write(f"\nProcessed book {book_name}")
                sys.stdout.write(f"\nWriting files for {book_name}")
                sys.stdout.write('\n')

                handle_out = open(f'{OUT_PATH}{book_name}', 'w')
                handle_out.write(BASIC_HTML.format(BASIC_STYLE, html_str))
                handle_out.close()

                i += 1
        self.parse_and_save_css()
        self.handle_ms_css()
        sys.stdout.write('\n\nDone!')
