import re
import sys
from bs4 import BeautifulSoup
from html import escape

REPLACE_TAGS = {
    """<o:p>""":
        """<p>""",
    """</o:p>""":
        """</p>""",
}

REPLACE_FROM_TO = [
    ["""<!-- [if !supportFootnotes]-->""", """<!--[endif]-->"""],
    # Halakha Adderet
    ["""<!--[if gte vml 1]>""", """<![if !vml]>"""],
]

MAP_P_STYLE_TO_CLASSES = {
    'margin-left:.5in;text-align:justify':
        ['MsoNormal', 'paragraph'],
    'margin-left: .5in; text-align: justify;':
        ['MsoNormal', 'paragraph-0'],
    'text-align: justify; line-height: normal; margin: 0in 0in 7.9pt .5in;':
        ['MsoNormal', 'paragraph-1'],
    'font-size:12.0pt;line-height:107%;font-family:\'Times New Roman\',serif;mso-fareast-font-family:\'Times New Roman\';color:black;mso-themecolor:text1;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:HE;':
        ['MsoNormal', 'paragraph-2'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph-3'],
    'margin-bottom:7.9pt;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph-4'],
    'margin-bottom:7.9pt;text-align:justify;text-indent:.5in;line-height:normal':
        ['MsoNormal', 'paragraph-5'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;line-height:normal':
        ['MsoNormal', 'paragraph-6'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify;line-height:normal;tab-stops:405.0pt':
        ['MsoNormal', 'paragraph-7'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify;line-height:normal;tab-stops:5.0in':
        ['MsoNormal', 'paragraph-8'],
    'margin-left:.5in;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph-9'],
    'margin-left:.5in;text-align:justify;text-indent:3.0pt;line-height:normal':
        ['MsoNormal', 'paragraph-10'],
    'text-align:justify;text-indent:.5in':
        ['MsoNormal', 'paragraph-11'],
    'text-align:justify':
        ['MsoNormal', 'paragraph-12'],
    'text-align:justify;text-indent:.5in;line-height:normal':
        ['MsoNormal', 'paragraph-13'],
    'margin-left:35.45pt;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph-14'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify':
        ['MsoNormal', 'paragraph-15'],
    'margin-left:.5in':
        ['MsoNormal', 'paragraph-16'],
    'margin-left:.5in;text-align:justify;line-height:normal;tab-stops:.5in':
        ['MsoNormal', 'paragraph-17'],
    'margin-left:24.0pt;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph-18'],
    'margin-left:.5in;line-height:normal':
        ['MsoNormal', 'paragraph-19'],
    'margin-left:.5in;text-align:justify;line-height:normal;tab-stops:3.0in':
        ['MsoNormal', 'paragraph-20'],

    # Hebrew
    'text-align: justify; line-height: normal; tab-stops: 460.7pt;':
        ['MsoNormal', 'paragraph-he-1'],
    'text-align:justify;line-height:normal;tab-stops:460.7pt':
        ['MsoNormal', 'paragraph-he-2'],
    'text-align:justify;line-height:normal;tab-stops:326.0pt 460.7pt':
        ['MsoNormal', 'paragraph-he-3'],
    'text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph-he-4'],
    'margin-left:11.35pt;text-align:justify;line-height:normal;tab-stops:460.7pt':
        ['MsoNormal', 'paragraph-he-5'],
    'margin-top:0in;margin-right:0in;margin-bottom:0in;margin-left:11.35pt;text-align:justify;line-height:normal;tab-stops:460.7pt':
        ['MsoNormal', 'paragraph-he-6'],
    'margin-bottom:8.0pt;text-align:justify;line-height:107%':
        ['MsoNormal', 'paragraph-he-7'],
    'margin-bottom:0in;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph-he-8'],
    'text-align:justify;line-height:normal;tab-stops:165.2pt':
        ['MsoNormal', 'paragraph-he-9'],
    'text-align:justify;line-height:normal;tab-stops:165.2pt 188.55pt':
        ['MsoNormal', 'paragraph-he-10'],

    # karaite book Yeriot_Shelomo
    'text-align:justify;line-height:150%':
        ['MsoNormal', 'paragraph-he-11'],
    'text-align:center;line-height:150%':
        ['MsoNormal', 'paragraph-he-12'],
    'line-height:150%':
        ['MsoNormal', 'page'],
    'margin-top:0in;margin-right:71.7pt;margin-bottom:0in;margin-left:71.7pt;margin-bottom:.0001pt;text-align:justify;line-height:150%':
        ['MsoNormal', 'page-a'],
    'text-align:left;line-height:  150%':
        ['MsoNormal', 'toc-dest'],
    'text-align:center;line-height:  150%':
        ['MsoNormal', 'toc-end-salute'],
    'margin-top:0in;margin-right:65.2pt;margin-bottom:0in;margin-left:65.2pt;margin-bottom:.0001pt;text-align:justify;text-indent:-65.2pt;line-height:150%;tab-stops:53.6pt':
        ['MsoNormal', 'detail-book'],
    'text-align:justify;line-height:150%;tab-stops:53.6pt':
        ['MsoNormal', 'can-find'],
    'margin-right:.5in;text-align:center;line-height:150%':
        ['MsoNormal', 'text-a'],
    'margin-bottom:6.0pt;text-align:justify;line-height:150%':
        ['MsoNormal', 'text-b'],

    # karaite book Yeriot_Shelomo volume 2
    'text-align:center':
        ['text-center'],
    'text-align:center;line-height:200%':
        ['header-toc'],
    'text-align:left':
        ['page-number'],
    'margin-right:22.0pt;text-align:center;line-height:150%':
        ['sheet'],

    # Halakha Adderet
    'text-align:right;direction:rtl;unicode-bidi:embed':
        ['MsoNormal', 'text'],

}

MAP_SPAN_STYLE_TO_CLASSES = {
    "font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; color: red;":
        ['red-1'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:red':
        ['red-2'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: red;':
        ['red-3'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:red':
        ['red-4'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:red':
        ['red-5'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:red':
        ['red-6'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red;":
        ['red-7'],
    'color:red':
        ['red-8'],

    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black':
        ['black-1'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: black;':
        ['black-2'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: black;':
        ['black-3'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black':
        ['black-4'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:HE':
        ['black-5'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black;mso-themecolor:text1':
        ['black-6'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black;mso-themecolor:text1':
        ['black-7'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman"':
        ['black-8'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:black;mso-themecolor:text1':
        ['black-9'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif;":
        ['black-10'],
    'color:black':
        ['black'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;color:black;mso-themecolor:text1;mso-bidi-font-style:italic':
        ['black-text-italic'],
    'mso-bidi-font-style:italic':
        ['black-text-italic'],
    'color:black;mso-themecolor:text1;mso-bidi-font-style:italic':
        ['black-text-italic'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;text-transform:uppercase':
        ['black-text-uppercase'],

    'mso-bidi-font-weight:bold':
        ['black-text-bold'],

    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif;':
        ['black-text-serif-1'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif':
        ['black-text-serif-2'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\';':
        ['black-text-serif-3'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman"':
        ['black-text-serif-4'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; color: black; mso-themecolor: text1;':
        ['black-text-serif-5'],
    'font-size:12.0pt;font-family:"Times New Roman",serif':
        ['black-text-serif-6'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:black;mso-themecolor:text1':
        ['black-text-theme-7'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: black; mso-themecolor: text1;':
        ['black-text-theme-8'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-ascii-theme-font:major-bidi;mso-fareast-font-family:"Times New Roman";mso-hansi-theme-font:major-bidi;mso-bidi-theme-font:major-bidi;color:black;mso-themecolor:text1':
        ['black-text-theme-9'],
    'color:black;mso-themecolor:text1;':
        ['black-text-theme-10'],
    'color:black;mso-themecolor:text1':
        ['black-text-theme-11'],

    "font-size: 12.0pt; font-family:'Times New Roman',serif; mso-fareast-font-family:'Times New Roman';color:#ffc000;":
        ['orange-1'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:#FFC000':
        ['orange-2'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:#FFC000':
        ['orange-3'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:#FFC000':
        ['orange-4'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000':
        ['orange-5'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; color: #ffc000;':
        ['orange-6'],
    'font-size: 12.0pt; line-height: 107%; font-family:"Times New Roman",serif; color: #ffc000;':
        ['orange-7'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: #ffc000;':
        ['orange-8'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: #ffc000;':
        ['orange-9'],
    'font-size:12.0pt;line-height:107%;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman";mso-bidi-font-family:"Times New Roman";color:#FFC000':
        ['orange-10'],
    'color:#FFC000':
        ['orange-11'],
    'color:#ffc000':
        ['orange-12'],
    'color: #ffc000;':
        ['orange-14'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:#0070C0':
        ['biblical-ref'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:#0070C0':
        ['biblical-ref'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: #0070c0;':
        ['biblical-ref'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: #0070c0;':
        ['biblical-ref'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#0070C0':
        ['biblical-ref'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:#0070C0':
        ['biblical-ref'],
    'color:#0070C0':
        ['biblical-ref'],
    'color: #0070c0;':
        ['biblical-ref'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#0070C0;mso-bidi-font-style:italic':
        ['biblical-ref-italic'],
    'color:#0070C0;mso-bidi-font-style:italic':
        ['biblical-ref-italic'],

    'mso-special-character:footnote':
        ['foot-note-char-1'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";mso-bidi-font-family:David;mso-ansi-language:EN-US;mso-fareast-language:HE;mso-bidi-language:HE':
        ['foot-note-char-2'],

    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:HE':
        ['foot-note'],

    'mso-ansi-font-size:12.0pt;mso-bidi-font-size:12.0pt':
        ['font-1'],
    'mso-bookmark:_Hlk532297566':
        ['book-mark'],

    # Hebrew

    'font-size:12.0pt;font-family:"Times New Roman",serif;color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt':
        ['red'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-ascii-theme-font:major-bidi;mso-hansi-theme-font:major-bidi;color:red':
        ['red'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;":
        ['red'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;position:relative;top:-2.0pt;mso-text-raise:2.0pt':
        ['text-color-black'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-ansi-language:X-NONE':
        ['text-color-black'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-ascii-theme-font:major-bidi;mso-hansi-theme-font:major-bidi':
        ['text-color-black'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;":
        ['text-color-black'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:black;mso-themecolor:text1;position:relative;top:-2.0pt;mso-text-raise:2.0pt':
        ['text-color-black-theme'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif; color: black; mso-themecolor: text1; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;":
        ['text-color-black-theme'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000;position:relative;top:-2.0pt;mso-text-raise:2.0pt;mso-ansi-language:X-NONE':
        ['orange'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000;position:relative;top:-2.0pt;mso-text-raise:2.0pt':
        ['orange'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000;mso-themecolor:accent4;position:relative;top:-2.0pt;mso-text-raise:2.0pt':
        ['orange'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000;mso-ansi-language:X-NONE':
        ['orange'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif; color: #ffc000; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;":
        ['orange'],

    'color:#FFC000;mso-themecolor:accent4':
        ['orange-accent4'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#0070C0;position:relative;top:-2.0pt;mso-text-raise:2.0pt':
        ['biblical-ref'],

    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-ascii-theme-font:major-bidi;mso-hansi-theme-font:major-bidi;mso-bidi-theme-font:major-bidi;color:#0070C0;position:relative;top:-2.0pt;mso-text-raise:2.0pt':
        ['biblical-ref'],

    # karaite book Yeriot_Shelomo volume 1
    'font-size:14.0pt;line-height:150%;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['text-color-black-bold'],
    'font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['text-color-black-bold'],
    'color:blue':
        ['text-blue'],
    'color:#2F5496':
        ['biblical-ref'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";mso-bidi-font-family:David;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:HE':
        ['foot-note-number'],
    'display:none;mso-hide:all':
        ['hide'],
    'line-height:150%':
        ['page-number'],
    'font-family:"David",sans-serif;mso-ascii-font-family:  "Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['toc-dest'],
    'font-size:10.0pt;line-height:150%;font-family:  "David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:  "Times New Roman"':
        ['toc-end-salute'],
    'font-size:16.0pt;line-height:150%;font-family:"David",sans-serif':
        ['some-text'],
    'font-size:16.0pt;line-height:150%;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['some-text-a'],
    'font-size:13.5pt;line-height:150%;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman";color:blue':
        ['marked-text-blue'],
    'font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman";color:blue':
        ['marked-text-blue'],
    'font-size:14.0pt;line-height:150%;font-family:"David",sans-serif;  mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['some-song'],
    'font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";  mso-hansi-font-family:"Times New Roman"':
        ['some-song'],
    'font-family:"David",sans-serif;  mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['some-song'],
    'font-size:14.0pt;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['part'],
    'font-size:18.0pt;line-height:200%;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['toc-item'],
    'font-size:13.0pt;line-height:150%;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['text'],
    'font-size:18.0pt;line-height:150%;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['foreword'],

    # Halakha Adderet
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-ansi-font-weight:bold':
        ['p-first-letter'],
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew"':
        ['he-text-1'],
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:David':
        ['he-text-1'],
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:Arial;mso-ansi-language:EN;mso-fareast-language:EN-US;mso-bidi-language:AR-SA':
        ['foot-note-number'],
    'mso-special-character: footnote':
        ['foot-note-special-char'],
    'font-family:"SBL Hebrew";color:#984806;mso-themecolor:accent6;mso-themeshade:128':
        ['annotated-toc-start'],
    'font-size:12.0pt;line-height:115%;font-family:"Cambria Math",serif;mso-bidi-font-family:"Cambria Math"':
        ['foot-note-number-math'],
    'font-size:12.0pt;line-height:115%;font-family:"Cambria",serif;mso-bidi-font-family:Cambria':
        ['he-ō'],
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-ansi-font-style:italic':
        ['he-italic'],
    'mso-ansi-font-weight:bold;mso-ansi-font-style:italic':
        ['he-italic'],
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-ansi-font-weight:bold;mso-ansi-font-style:italic':
        ['he-italic'],
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:David;mso-ansi-font-style:italic':
        ['he-italic'],
    'mso-ansi-font-weight:bold':
        ['he-bold'],
    'font-family:"SBL Hebrew"':
        ['font-family'],
    'color:#984806;mso-themecolor:accent6;mso-themeshade:128':
        ['annotated-toc-start-color'],
    'font-size:12.0pt;line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:David;mso-ansi-language:EN;mso-fareast-language:EN-US;mso-bidi-language:AR-SA':
        ['foot-note-en'],
    'font-family:"SBL Hebrew";color:#4BACC6;mso-themecolor:accent5':
        ['chapter-accented-blue'],
    'font-family:"SBL Hebrew"; color:#4BACC6;mso-themecolor:accent5;mso-ansi-font-weight:bold':
        ['chapter-bold-blue'],
    'font-family:"SBL Hebrew"; color:#0n0B050':
        ['chapter-green'],
    'font-family:"SBL Hebrew"; color:#00B050':
        ['chapter-green'],
    'font-family:"SBL Hebrew";color:#00B050':
        ['chapter-green'],
    'font-family:"SBL Hebrew"; color:red':
        ['chapter-red'],
    'font-family:"SBL Hebrew";color:red':
        ['chapter-red'],
    'font-size:20.0pt;font-family:"David",sans-serif; mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"; font-style:normal':
        ['chapter-1'],
    'font-size:20.0pt;font-family: "David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family: "Times New Roman";font-style:normal':
        ['chapter-1'],
    'font-size:20.0pt; line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:Arial; color:#00B050;mso-ansi-language:EN;mso-fareast-language:EN-US;mso-bidi-language: AR-SA':
        ['chapter-green'],
    'font-family:"SBL Hebrew"; color:#7030A0':
        ['chapter-purple'],
    'font-family:"David",sans-serif;mso-ascii-font-family: "Times New Roman";mso-hansi-font-family:"Times New Roman";font-style:normal':
        ['chapter-1'],
    'font-family:"David",sans-serif;mso-ascii-font-family: "Times New Roman";mso-hansi-font-family:"Times New Roman"':
        ['chapter-2'],
    'font-size:20.0pt;line-height:115%;font-family:"SBL Hebrew"; mso-fareast-font-family:Arial;color:red;mso-ansi-language:EN;mso-fareast-language: EN-US;mso-bidi-language:AR-SA':
        ['chapter-red-1'],
    'font-family:"David",sans-serif;font-style: normal':
        ['chapter-normal-1'],
    'font-family:"David",sans-serif; mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman"; font-style:normal':
        ['chapter-normal-2'],
    'font-size:20.0pt;font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman";font-style:normal':
        ['chapter-normal-3'],
    'font-family:"SBL Hebrew";color:#4BACC6;mso-themecolor:accent5;mso-ansi-font-weight:bold':
        ['sp-1'],
    'font-size:20.0pt;line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:Arial;color:#00B050;mso-ansi-language:EN;mso-fareast-language:EN-US;mso-bidi-language:AR-SA':
        ['sp-3'],
    'font-family:"David",sans-serif;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman";font-style:normal':
        ['sp-4'],
    'font-size:20.0pt;line-height:115%;font-family:"SBL Hebrew";mso-fareast-font-family:Arial;color:red;mso-ansi-language:EN;mso-fareast-language:EN-US;mso-bidi-language:AR-SA':
        ['sp-5'],
    'font-family:"David",sans-serif;font-style:normal':
        ['sp-6'],
    'font-family:"SBL Hebrew";color:#7030A0':
        ['sp-6'],
    'font-family:"SBL Hebrew";color:gray;mso-themecolor:background1;mso-themeshade:128':
        ['sp-7'],

}

# chapter's ?
MAP_H1_TO_STYLES_TO_CLASSES = {
    # Halakha Adderet
    'text-align:right;direction:rtl;unicode-bidi:embed':
        ['chapter'],

}


# BS4 adds html, head and body to html tree if missing
def remove_tag_simple(html_str):
    remove_tags = ['<html>', '</html>', '<head>', '</head>', '<body>', '</body>']
    for tag in remove_tags:
        html_str = html_str.replace(tag, '')

    return html_str


def remove_a_empty_tag(html_str):
    tree = BeautifulSoup(html_str, 'html5lib')
    for a in tree.find_all('a'):
        if a is not None:
            a.decompose()

    return str(tree)


def find_span(child_of):
    """ Map span  inline style to class """
    for span_child in child_of.find_all('span'):
        style = span_child.attrs.get('style', '').replace('\r', '').replace('\n', '')
        classes = MAP_SPAN_STYLE_TO_CLASSES.get(style, None)
        if classes is not None:
            span_child.attrs.pop('style')
            # span_child.attrs['class'] = [f'{language}-{classes[0]}']
            span_child.attrs['class'] = [f'{classes[0]}']
            # if classes[0] == 'biblical-ref' and language == 'he':
            #     print(child)
            #     print('-' * 80)
            #     input('>>')
        else:
            if style is not None and style != '':
                print("-" * 60)
                print(child_of)
                print("<span>", "-" * 60)
                print(style)
                print("-" * 60)
                sys.exit()


def map_tag_class_to_style(html_tree, tag, css_class=None, map_to={}):
    """ Map inline tag style to class"""

    if css_class is None:
        tree = html_tree.find_all(tag)
    else:
        tree = html_tree.find_all(tag, class_=css_class)

    for child_of in tree:
        style = child_of.attrs.get('style', '').replace('\n', '').replace('\r', '')
        classes = map_to.get(style, None)
        if classes is not None:
            child_of.attrs.pop('style')
            # if classes[1] == 'biblical-ref':
            #     print(child)
            #     print('*' * 80)
            #     input('>>')

            if css_class is None:
                child_of.attrs['class'] = [f'{classes[0]}']
            else:
                if child_of.attrs['class'] == [classes[0]]:
                    child_of.attrs['class'] = [f'{classes[1]}']

        else:
            if style is not None and style != '':
                print("-" * 60)
                print(child_of)
                print("<p>", "-" * 60)
                print(style)
                print("-" * 60)
                sys.exit()

        find_span(child_of)

    return html_tree


def replace_a_foot_notes(html_tree, foot_notes_list, language):
    # replace complicate <a></a>
    if len(foot_notes_list) > 0:
        foot_note = 0
        for child in html_tree.find_all('a'):
            if hasattr(child, 'find'):
                try:
                    note_ref = re.match('\\[[0-9]*.\\]', foot_notes_list[foot_note])
                    if note_ref is None:
                        # volume 2
                        note_ref = re.match('[0-9]*.', foot_notes_list[foot_note])

                    if note_ref is not None:
                        ref = note_ref.group()
                        child.replace_with(BeautifulSoup(
                            f"""<span class="{language}-foot-note"
                            data-for='{language}'
                            data-tip="{escape(foot_notes_list[foot_note])}">
                            <sup class="{language}-foot-index">{ref}</sup></span>""",
                            'html5lib'))
                        foot_note += 1
                    print(foot_notes_list)
                except IndexError:
                    print()
                    print('Error')
                    print(foot_notes_list)
                    print(foot_note, len(foot_notes_list), foot_notes_list)

    return html_tree


def remove_toc_tag(html_tree):
    for child in html_tree.find_all():
        text = child.get_text(strip=True)
        if len(text) == 0:
            child.decompose()
            continue
        if text.replace(' ', '').upper() in ['#TOC', '#ENDTOC']:
            child.decompose()
    return html_tree


def fix_image_source(html_tree, old_path, new_path):
    # this is specific to Halakha Adderet
    # fix this:
    old_path = 'Halakha_Adderet%20Eliyahu_R%20Elijah%20Bashyatchi.fld'
    new_path = 'static-django/images/Halakha_Adderet_Eliyahu_R_Elijah_Bashyatchi'

    for child in html_tree.find_all('img'):
        path = child.attrs.get('src', None)
        if path is not None:
            child.attrs['src'] = path.replace(old_path, new_path)

    return html_tree


def replace_tags(html):
    for k in REPLACE_TAGS.keys():
        html = html.replace(k, REPLACE_TAGS[k])
    return html


def replace_from_open_to_close(html):
    for open_tag, close_tag in REPLACE_FROM_TO:
        start = html.find(open_tag)
        if start >= 0:
            end = html[start:].find(close_tag)
            if end >= 0:
                html = html[0:start] + html[end:]
                print(html[start:end])
                input('>>')

    return html


def map_yeriot_shelomo_docx_to_karaites_html(html, foot_notes_list, language="en", stats=False):
    """
        Map  docx generated html to a lighter and css class oriented html
    """

    html_tree = BeautifulSoup(html, 'html5lib')

    html_tree = replace_a_foot_notes(html_tree, foot_notes_list, language)
    html_tree = replace_tags(str(html_tree))

    # # p tag inline style to classes
    # map_tag_class_to_style('p', "MsoNormal", MAP_P_STYLE_TO_CLASSES)
    # # span inline style to classes
    # map_tag_class_to_style('span', None, MAP_SPAN_STYLE_TO_CLASSES)
    # # h1
    # map_tag_class_to_style('h1', None, MAP_H1_TO_STYLES_TO_CLASSES)
    #
    # new_html = remove_tag_simple(str(html_tree).replace('\n', ' '))
    # new_html = remove_a_empty_tag(new_html)

    new_html = str(html_tree)
    if stats:
        print(html)
        print("-" * 90)
        print(f"html as string len:{len(html)}, new_html len:{len(new_html)}")
        input('> enter to carry on.')
    return new_html

# to test and debug uncomment this
# html = """<p class="MsoNormal" dir="RTL" style="text-align: justify; line-height: normal; tab-stops: 460.7pt;"><span dir="LTR" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">1:1</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">אלה הדברים</span><span dir="LTR" lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">- כאשר היו ישראל עתידים לעבור את הירדן</span><span dir="LTR" lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">להחלק איש בנחלתו, והיו צריכים התראה ואזהרה לשמור התורה, כאשר בזמן נסוע מסיני להכנס בארץ &lt;התרה בהם&gt;, וכאשר אירעו להם ענינים ונמנעו מלהכנס, אז כון עתה לסדר גם אותם {הענינים} &lt;עניני המניעות שמסבתם נשנו עתה עניני האזהרות וההתראות&gt;.<a style="mso-footnote-id: ftn1;" title="" href="#_ftn1" name="_ftnref1"><span class="MsoFootnoteReference"><span dir="LTR" style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif; mso-fareast-font-family: Calibri; mso-fareast-theme-font: minor-latin; position: relative; top: -2.0pt; mso-text-raise: 2.0pt; mso-ansi-language: EN-US; mso-fareast-language: EN-US; mso-bidi-language: HE;">[1]</span></span><!--[endif]--></span></span></a><span style="mso-spacerun: yes;">&nbsp;</span>על כן החל במלת <span style="color: #ffc000;">דברים</span>, לכלול עניני המצות ודברי תוכחה. ויהיה טעם <span style="color: #ffc000;">אלה הדברים אשר דבר משה אל כל ישראל בעבר הירדן</span> מה שאירע להם <span style="color: #ffc000;">במדבר בערבה מול סוף </span>,כלל מה שעבר עליהם בנסעם מסיני עד בואם לקדש ברנע:</span></p>
# <p class="MsoNormal" dir="RTL" style="text-align: justify; line-height: normal; tab-stops: 460.7pt;"><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: black; mso-themecolor: text1; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">ו</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: #ffc000; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">לבן</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: black; mso-themecolor: text1; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">ו</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: #ffc000; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">תפל</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: black; mso-themecolor: text1; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">ו</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: #ffc000; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">די זהב </span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">לא נזכרו במסעים גם לא נזכרו במקום אחר, ואולם אחר שאומר <span style="color: #ffc000;">בין ובין </span>אין הטעם שעברו באותם המקומות עצמם שנזכרו בשמות אלו. </span></p>"""
# map_docx_to_karaites_html(html, foot_notes_list=['[9] TEST'], language="he", stats=True)
