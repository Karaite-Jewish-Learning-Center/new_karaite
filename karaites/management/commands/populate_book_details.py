from django.contrib.auth.models import User
from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.files import File
from ...constants import (LANGUAGES_DICT,
                          BOOK_CLASSIFICATION_DICT,
                          FIRST_LEVEL_DICT,
                          FIRST_LEVEL_HE_DICT
                          )

from .constants import SOURCE_PATH

from ...models import (FirstLevel,
                       Classification,
                       KaraitesBookDetails,
                       Author,
                       Songs,
                       Method)

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
        ['update_bible_re'],
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
        'en',
        [],
        ['update_bible_re', 'removing_no_breaking_spaces', 'fix_chapter_verse'],
        {'name': r"Deuteronomy Keter Torah Aaron ben Elijah English, ",
         'first_level': 8,
         'book_classification': '80',
         'author': 'Aaron ben Elijah,',
         'css_class': ''},
        True
    ],
    [

        'HTML/Deuteronomy_Keter_Torah_Aaron_ben_Elijah/',
        'Deuteronomy_Keter Torah_Aaron ben Elijah-{}.html',
        'he',
        [],
        ['update_bible_re', 'removing_no_breaking_spaces', 'fix_chapter_verse'],
        {'name': r"Deuteronomy Keter Torah Aaron ben Elijah Hebrew, ",
         'first_level': 8,
         'book_classification': '80',
         'author': 'Aaron ben Elijah,',
         'css_class': ''},
        True
    ],
]
EXHORTATORY = [
    [
        'HTML/Exhortatory Literature/Qumisis_Epistle_To_Dispersion/',
        'Qumisis Epistle to the Dispersion-{}.html',
        'he,in',
        [],
        [],
        {'name': r"Qumisi's Epistle to Dispersion, ",
         'first_level': 11,
         'book_classification': '65',
         'author': 'Daniel al-Qumisi,',
         'css_class': '',
         'buy_link': 'https://thekaraitepress.com/products/the-chief-cornerstone'},
        True
    ],
    [

        'HTML/Exhortatory Literature/The Sayings of Moshe/',
        'The Sayings of Moshe-{}.html',
        'he-en,in,toc',
        [],
        [],
        {'name': r"The Sayings of Moshe, ",
         'first_level': 11,
         'book_classification': '65',
         'author': 'Unknown,',
         'table_book': True,
         'columns': 2,
         'columns_order': '0,1,2',
         'toc_columns': '0',
         'direction': 'ltr',
         'lang_index': False,
         },
        True
    ],

]

HALAKHAH = [
    [
        'HTML/Halakhah/aaron_ben_josephs_essay_on_the _obligation_of_prayer/',
        'aaron_ben_Josephs_Essay_on_the_obligation_of_prayer-{}.html',
        'he-en,in',
        [],
        [],
        {'name': r"Aaron ben Joseph's Essay on the Obligation of Prayer,הצעה בחיוב התפלה ",
         'first_level': 3,
         'book_classification': '80',
         'author': ',',
         'css_class': 'stacked',
         'remove_class': 'MsoTableGrid',
         'remove_tags': '<o:p>&nbsp;</o:p>',
         'table_book': True,
         'columns_order': '0,1,2'},
        True
    ],
    [
        'HTML/Halakhah/Gan Eden/', 'Gan Eden-{}.html',
        'he,in,toc',
        ['fix_image_gan'],
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['fix_image_source'],
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['fix_image_pats'],
        ['update_bible_re'],
        {'name': r"Patshegen Ketav Haddat, פתשגן כתב הדת",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Caleb Afendopolo,',
         'css_class': ''},
        False
    ],
    [
        'HTML/Halakhah/Royal Attire/',
        'Royal Attire-{}.html',
        'he-en,in,toc',
        [],
        ['update_bible_re'],
        {'name': r"Royal Attire,סֵֽפֶר לְבוּשׁ מַלְכוּת",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Hakham Mordecai ben Nisan,',
         'css_class': '',
         'table_book': True,
         'columns': 2,
         'columns_order': '0,1,2',
         'direction': 'rtl',
         'toc_columns': '2,1,0', },
        False
    ],
    [
        'HTML/Halakhah/Ritual Slaughter/',
        'Shehita-{}.html',
        'he-en,in,toc',
        [],
        ['update_bible_re'],
        {'name': "Ritual Slaughter,ענין השחיטה",
         'first_level': 3,
         'book_classification': '80',
         'author': 'Zahava Yod,',
         'css_class': 'stacked',
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Essa Bechos Yesha‘, אשא בכוס ישע",
         'first_level': 4,
         'book_classification': '10',
         'author': 'Essa Bechos Yesha‘,',
         'css_class': 'simple',
         'song': ['Essa Bechos Yesha.wav']},
        False
    ],
    [
        'HTML/Liturgy/Havdala Songs/', 'Et Kos Yeshu‘ot.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Et Kos Yeshu‘ot‘,את כוס ישועות",
         'first_level': 4,
         'book_classification': '10',
         'author': 'Yosef ben Shemu’el Rodi,',
         'css_class': 'simple-3-4',
         'song': ['Et Kos Yeshuot.wav']},
        False
    ],
    [
        'HTML/Liturgy/Havdala Songs/', 'Malé ‘Olam Kevod Yofi.html',
        'he',
        [],
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
        {'name': r"Hodu Le’el De‘ot, הודו לאל דעות",
         'first_level': 4,
         'book_classification': '15',
         'author': 'Perhaps Hillel Bashyači,',
         'css_class': '',
         },
        False
    ],
    [
        "HTML/Liturgy/Passover Songs/Odecha/",
        "Odecha-{}.html",
        'he,in',
        [],
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        'HTML/Liturgy/Shabbat Songs/',
        'Ahavatecha-{}.html',
        'he,in',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"‘Al ahavatecha, אהבתך על",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yehuda Ha-levy,',
         'css_class': '',
         'song': ['Al Ahavatecha (Complete Acapella).mp3',
                  'Al Ahavatecha (for Learning and Rhythm).mp3',
                  'Al Ahavatecha (with Acoustic Guitar).mp3',
                  ]},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ashir Beshir Ḥadash.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ashir Beshir Ḥadash, אשיר בשיר חדש",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yosef ben Nisan Poziemski,',
         'css_class': 'simple-3-4',
         'song': ['Ashir Beshir Ḥadash.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ashir Beshira El Nora Tehillot.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ashir Beshira El Nora Tehillo, אשיר בשירה אל נורא תהלות",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Avraham ben Yoshiyahu Ha-rofé,',
         'css_class': 'simple-3-4',
         'song': ['Ashir Beshira El Nora Tehillot.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ashir Le’el ‘Elyon.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ashir Le’el ‘Elyon,אשיר לאל עליון",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Ashir Le’el ‘Elyon,',
         'css_class': 'simple-3-4',
         'song': ['Ashir Lel Elyon.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ekkon Lemmul Shabbat.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ekkon Lemul Shabbat, אכון למול שבת",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yosef ben Yitsḥaḳ Itson,',
         'css_class': 'simple-3-4',
         'song': ['Ekkon Lemul Shabbat.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Esmaḥ Beshir Ḥadash.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Esmaḥ Beshir Ḥadash,אשמח בשיר חדש",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Ezra ben Nisan Ha-rofé,',
         'css_class': 'simple-3-4',
         'song': ['Esmaḥ Beshir Ḥadash.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ezkor Lemitsvat Melech.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ezkor Lemitsvat Melech, אזכור למצות מלך",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Shelomo ben Aharon,',
         'css_class': 'simple-3-4',
         'song': ['Ezkor Lemitsvat Melech.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Eḳra Le’el ‘Elyon.html',
        'he',
        [],
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Mizmor Leyom Shabbat,מזמור ליום שבת",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Shelomo ben Aharon,',
         'css_class': 'simple-3-4',
         'song': ['Mizmor Leyom Shabbat.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Odé Le’el Maḥsi.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Odé Le’el Maḥsi, אודה לאל מחסי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Odé Le’el Maḥsi,',
         'css_class': 'simple-3-4',
         'song': ['Od Lel Maḥsi.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Ori Yeḥidati.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Ori Yeḥidati,אורי יחידתי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Mordochai Sultansky,',
         'css_class': 'simple-3-4',
         'song': ['Ori Yeḥidati.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Shabbat Menuḥa.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Shabbat Menuḥa, שבת מנוחה",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Shabbat Menuḥa,',
         'css_class': 'simple-3-4',
         'song': ['']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Yah Zimrati.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yah Zimrati,יה זמרתי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yah Zimrati,',
         'css_class': 'simple-3-4',
         'song': ['']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Yatsar Ha’el.html',
        'he',
        [],
        ['update_bible_re'],
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
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yerivai Ve’oyevai, יריבי ואויבי",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yisra’el ben Shemu’el Ha-ma‘aravi Ha-dayyan,',
         'css_class': 'simple-3-4',
         'song': ['Yerivai Voyevai.wav']},
        False
    ],
    [
        'HTML/Liturgy/Shabbat Songs/', 'Yeter Peletat ‘Am.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yeter Peletat ‘Am, יתר פליטת עם",
         'first_level': 4,
         'book_classification': '30',
         'author': 'Yeter Peletat ‘Am,',
         'css_class': 'simple-3-4',
         'song': ['Yeter Peletat Am.wav']},
        False
    ],
]
SUPPLEMENTAL = [
    [
        'HTML/Liturgy/Supplemental/', 'Anochi Anochi.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Anochi Anochi, אנכי אנכי",
         'first_level': 4,
         'book_classification': '40',
         'author': 'N/A (Biblical Verses),',
         'css_class': 'special'},
        False
    ],
    [
        'HTML/Liturgy/Supplemental/', 'Atsili Qum Qera.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Poems, Author
        {'name': r"Atsili ḳum ḳera, אצילי קום קרא",
         'first_level': 4,
         'book_classification': '40',
         'author': 'Abraham,',
         'css_class': 'simple'},
        False
    ],
    [
        'HTML/Liturgy/Supplemental/', 'Evyon Asher.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Poems, Author
        {'name': r"Evyon Asher, אביון אשר",
         'first_level': 4,
         'book_classification': '40',
         'author': 'Anatoli (ben Joseph?),',
         'css_class': 'simple'},
        False
    ],
    [
        'HTML/Liturgy/Supplemental/', 'Vehahochma.html',
        'he',
        ['fix_iframe'],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Vehaḥochma Me’ayin Timmatsē, והחכמה מאין תמצא",
         'first_level': 4,
         'book_classification': '40',
         'author': 'N/A (Biblical Verses),',
         'css_class': 'simple'},
        False
    ],

    [
        'HTML/Liturgy/Supplemental/', 'Vehoshia.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Vehoshiya‘, והושיע",
         'first_level': 4,
         'book_classification': '40',
         'author': 'N/A (Biblical Verses),',
         'css_class': 'special-1'},
        False
    ],
]
TAMMUZ_AV_ECHA = [
    [
        '/HTML/Liturgy/Tammuz Av Echa/',
        'Afas Aron-{}.html',
        'he,in',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Afas Aron , אפס ארון",
         'first_level': 4,
         'book_classification': '45',
         'author': 'unknow,',
         'css_class': '',
         'song': ['Afas Aron.mp3']},
        False
    ],
    [
        '/HTML/Liturgy/Tammuz Av Echa/',
        'Yona Leedech Rei-{}.html',
        'he,in',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Yona Le’edech Re’i,יונה לאידך ראי",
         'first_level': 4,
         'book_classification': '45',
         'author': 'Yosef ben Moshe,',
         'css_class': 'simple-3-4',
         'song': []},
        False
    ],
]
WEDDING_SONGS = [
    [
        'HTML/Liturgy/Wedding Songs/',
        'Amen Yehi Ratson.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Amen Yehi Ratson,  אמן יהי רצון",
         'first_level': 4,
         'book_classification': '50',
         'author': 'Amen Yehi Ratson,',
         'css_class': 'simple-3-4',
         'song': ['Amen Yehi Ratson.wav']},
        False
    ],
    [
        'HTML/Liturgy/Wedding Songs/', 'Laḥatani Mivḥar Banai.html',
        'he',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Laḥatani Mivḥar Banai,לחתני מבחר בני",
         'first_level': 4,
         'book_classification': '50',
         'author': 'Laḥatani Mivḥar Banai,',
         'css_class': 'simple-3-4',
         'song': ['Laḥatani Mivḥar Banai.wav']},
        False
    ],
    [
        'HTML/Liturgy/Wedding Songs/Matsa_Ish_sha_Matsa_Tov/',
        'Matsa Ish sha Matsa Tov-{}.html',
        'he-en,in',
        [],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"Matsa Ish sha Matsa Tov,מצא אשה מצא טוב",
         'first_level': 4,
         'book_classification': '50',
         'author': 'Laḥatani Mivḥar Banai,',
         'css_class': 'simple-3-4',
         'song': ['Matsa Ish sha Matsa Tov.wav']},
        False
    ],
]

POETRY_NON_LITURGICAL = [
    [
        'HTML/Poetry (Non-Liturgical)/Ani Hayiti/',
        'Ani Hayiti-{}.html',
        'he,in',
        [],
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
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
        ['update_bible_re'],
        # name, Polemic , , Author
        {'name': r"Hizzuḳ Emuna,חזוק אמונה חיזוק אמונה",
         'first_level': 5,
         'book_classification': '60',
         'author': "Isaac ben Abraham,"},
        False
    ],
]

# should be last,
TEST_BOOKS = [
    [
        'Vehahochma-2/', 'Vehahochma-2.html',
        'he',
        ['fix_iframe'],
        ['update_bible_re'],
        # name, liturgy , Biblical verses, Author
        {'name': r"2 Vehaḥochma Me’ayin Timmatsē, והחכמה מאין תמצא",
         'first_level': 4,
         'book_classification': '70',
         'author': 'N/A (Biblical Verses),'},
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
                 TAMMUZ_AV_ECHA +
                 WEDDING_SONGS +
                 POETRY_NON_LITURGICAL +
                 EXHORTATORY +
                 POLEMIC)

LITURGY = (HAVDALA +
           PASSOVER_SONGS +
           PRAYERS +
           PURIM_SONGS +
           SHABBAT_SONGS +
           SUPPLEMENTAL +
           TAMMUZ_AV_ECHA +
           WEDDING_SONGS)


class Command(BaseCommand):
    """ Populate book details. """

    def handle(self, *args, **options):
        lists_to_process = [
            'COMMENTS',
            'HALAKHAH',
            'HAVDALA',
            'PASSOVER_SONGS',
            'PURIM_SONGS',
            'PRAYERS',
            'POLEMIC',
            'SHABBAT_SONGS',
            'WEDDING_SONGS',
            'SUPPLEMENTAL',
            'TAMMUZ_AV_ECHA',
            'EXHORTATORY',
            'POETRY_NON_LITURGICAL',
        ]
        user, _ = User.objects.get_or_create(username='System',
                                             defaults={'is_superuser': True,
                                                       'is_staff': True,
                                                       'is_active': True,
                                                       'email': settings.ADMINS_EMAILS[0]})
        for process in lists_to_process:
            for book in globals()[process]:
                path, filename, lang, pre, pro, book_details, _ = book
                book_title_en, book_title_he = book_details['name'].split(',')
                intro = r''
                toc = r''
                lang_in = False
                lang_toc = False

                if 'in' in lang:
                    intro_filename = SOURCE_PATH + path + filename.replace('{}', 'Introduction')
                    intro = File(open(intro_filename, 'rb'), book_title_en)
                    lang_in = True

                # # liturgy (4) may have toc together with intro
                # if book_details.get('first_level') == 4 and 'in' not in lang:
                #     intro_filename = SOURCE_PATH + path + filename
                #     handle = open(intro_filename, 'rb')
                #     html = handle.read()
                #     handle.close()
                #     html_tree = BeautifulSoup(html, 'html.parser')
                #     table = html_tree.find('table')
                #     table.decompose()
                #     intro = File(io.StringIO(str(html_tree)), book_title_en)
                #     lang_in = True

                # should be mutually exclusive
                if 'toc' in lang:
                    toc_filename = SOURCE_PATH + path + filename.replace('{}', 'TOC')
                    toc = File(open(toc_filename, 'rb'), book_title_en)
                    lang_toc = True

                language = lang.replace(',in', '').replace(',toc', '')
                if language == 'en-he':
                    language = 'he-en'

                source = {'en': '', 'he': '', 'he-en': ''}
                for lang_code in language.split(','):
                    source_filename = SOURCE_PATH + path + filename.replace('{}', LANGUAGES_DICT[lang_code])
                    source = File(open(source_filename, 'rb'), book_title_en)

                first = FIRST_LEVEL_DICT[book_details['first_level']]

                first_level, _ = FirstLevel.objects.get_or_create(
                    first_level=first,
                    first_level_he=FIRST_LEVEL_HE_DICT[book_details['first_level']][0],
                    order=FIRST_LEVEL_HE_DICT[book_details['first_level']][1],
                )

                classification = BOOK_CLASSIFICATION_DICT[book_details['book_classification']]
                classify, _ = Classification.objects.get_or_create(
                    classification_name=classification
                )

                name, name_he = book_details['author'].split(',')
                author, _ = Author.objects.get_or_create(
                    name=name,
                    name_he=name_he,
                )

                # only delete if in populate list
                KaraitesBookDetails.objects.filter(book_title_en=book_title_en).delete()

                karaites_details, _ = KaraitesBookDetails.objects.get_or_create(
                    book_title_en=book_title_en,
                    defaults={
                        'first_level': first_level,
                        'book_classification': classify,
                        'book_language': language,
                        'intro': lang_in,
                        'toc': lang_toc,
                        'author': author,
                        'book_title_en': book_title_en,
                        'book_title_he': book_title_he,
                        'book_source': source,
                        'book_source_intro': intro,
                        'book_toc_source': toc,
                        'table_book': book_details.get('table_book', False),
                        'columns': book_details.get('columns', 0),
                        'columns_order': book_details.get('columns_order', ''),
                        'toc_columns': book_details.get('toc_columns', ''),
                        'direction': book_details.get('direction', 'ltr'),
                        'remove_class': book_details.get('remove_class', ''),
                        'css_class': book_details.get('css_class', ''),
                        'remove_tags': book_details.get('remove_tags', ''),
                        'multi_tables': book_details.get('multi_tables', False),
                        'buy_link': book_details.get('buy_link', ''),
                        'index_lang': book_details.get('index_lang', False),
                        'skip_process': book_details.get('skip_process', False),
                        'published': True,
                        'user': user,
                    }
                )
                # add pre/pro process Methods
                for pre in pre:
                    if Method.objects.filter(method_name=pre, pre_process=True).exists() or not pre:
                        continue
                    else:
                        method, _ = Method.objects.get_or_create(method_name=pre, pre_process=True, pro_process=False)
                        karaites_details.method.add(method.id)
                        karaites_details.save()

                for pro in pro:
                    if Method.objects.filter(method_name=pro, pro_process=True).exists() or not pro:
                        continue
                    else:
                        method, _ = Method.objects.get_or_create(method_name=pro, pro_process=True, pre_process=False)
                        karaites_details.method.add(method.id)
                        karaites_details.save()

                # get song details
                song_path = '../newkaraites/karaites/static/audio/'

                for song in book_details.get('song', []):
                    # remove extension
                    song_title = song.split('.')[0]
                    if song_title == '':
                        continue

                    if karaites_details.songs.filter(song_title=song_title).exists():
                        continue

                    song_filename = (song_path + song)
                    song_obj, _ = Songs.objects.get_or_create(
                        song_title=song_title,
                        defaults={
                            'song_file': File(open(song_filename, 'rb'), name=song)
                        }
                    )
                    karaites_details.songs.add(song_obj.id)
                    karaites_details.save()
