import re
import sys
from bs4 import BeautifulSoup

REPLACE_TAGS = {
    """<!-- [if !supportFootnotes]-->""":
        """""",
    """<!--[endif]-->""":
        """""",
    """<o:p>""":
        """<p>""",
    """</o:p>""":
        """</p>""",
}

MAP_P_STYLE_TO_CLASSES = {
    'margin-left:.5in;text-align:justify':
        ['MsoNormal', 'paragraph'],
    'margin-left: .5in; text-align: justify;':
        ['MsoNormal', 'paragraph'],
    'text-align: justify; line-height: normal; margin: 0in 0in 7.9pt .5in;':
        ['MsoNormal', 'paragraph'],
    'font-size:12.0pt;line-height:107%;font-family:\'Times New Roman\',serif;mso-fareast-font-family:\'Times New Roman\';color:black;mso-themecolor:text1;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:HE;':
        ['MsoNormal', 'paragraph'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-bottom:7.9pt;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-bottom:7.9pt;text-align:justify;text-indent:.5in;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify;line-height:normal;tab-stops:405.0pt':
        ['MsoNormal', 'paragraph'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify;line-height:normal;tab-stops:5.0in':
        ['MsoNormal', 'paragraph'],
    'margin-left:.5in;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-left:.5in;text-align:justify;text-indent:3.0pt;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'text-align:justify;text-indent:.5in':
        ['MsoNormal', 'paragraph'],
    'text-align:justify':
        ['MsoNormal', 'paragraph'],
    'text-align:justify;text-indent:.5in;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-left:35.45pt;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-top:0in;margin-right:0in;margin-bottom:7.9pt;margin-left:.5in;text-align:justify':
        ['MsoNormal', 'paragraph'],
    'margin-left:.5in':
        ['MsoNormal', 'paragraph'],
    'margin-left:.5in;text-align:justify;line-height:normal;tab-stops:.5in':
        ['MsoNormal', 'paragraph'],
    'margin-left:24.0pt;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-left:.5in;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-left:.5in;text-align:justify;line-height:normal;tab-stops:3.0in':
        ['MsoNormal', 'paragraph'],

    # Hebrew
    'text-align: justify; line-height: normal; tab-stops: 460.7pt;':
        ['MsoNormal', 'paragraph'],
    'text-align:justify;line-height:normal;tab-stops:460.7pt':
        ['MsoNormal', 'paragraph'],
    'text-align:justify;line-height:normal;tab-stops:326.0pt 460.7pt':
        ['MsoNormal', 'paragraph'],
    'text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'margin-left:11.35pt;text-align:justify;line-height:normal;tab-stops:460.7pt':
        ['MsoNormal', 'paragraph'],
    'margin-top:0in;margin-right:0in;margin-bottom:0in;margin-left:11.35pt;text-align:justify;line-height:normal;tab-stops:460.7pt':
        ['MsoNormal', 'paragraph'],
    'margin-bottom:8.0pt;text-align:justify;line-height:107%':
        ['MsoNormal', 'paragraph'],
    'margin-bottom:0in;text-align:justify;line-height:normal':
        ['MsoNormal', 'paragraph'],
    'text-align:justify;line-height:normal;tab-stops:165.2pt':
        ['MsoNormal', 'paragraph'],
    'text-align:justify;line-height:normal;tab-stops:165.2pt 188.55pt':
        ['MsoNormal', 'paragraph'],

}
MAP_SPAN_STYLE_TO_CLASSES = {
    "font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; color: red;":
        ['red'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:red':
        ['red'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: red;':
        ['red'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:red':
        ['red'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:red':
        ['red'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:red':
        ['red'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red;":
        ['red'],
    'color:red':
        ['red'],

    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black':
        ['black'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: black;':
        ['black'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: black;':
        ['black'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black':
        ['black'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:HE':
        ['black'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black;mso-themecolor:text1':
        ['black'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:black;mso-themecolor:text1':
        ['black'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman"':
        ['black'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:black;mso-themecolor:text1':
        ['black'],
    "font-size: 12.0pt; font-family: 'Times New Roman',serif;":
        ['black'],
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
        ['black-text-serif'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif':
        ['black-text-serif'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\';':
        ['black-text-serif'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman"':
        ['black-text-serif'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; color: black; mso-themecolor: text1;':
        ['black-text-serif'],
    'font-size:12.0pt;font-family:"Times New Roman",serif':
        ['black-text-serif'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:black;mso-themecolor:text1':
        ['black-text-theme'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: black; mso-themecolor: text1;':
        ['black-text-theme'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-ascii-theme-font:major-bidi;mso-fareast-font-family:"Times New Roman";mso-hansi-theme-font:major-bidi;mso-bidi-theme-font:major-bidi;color:black;mso-themecolor:text1':
        ['black-text-theme'],
    'color:black;mso-themecolor:text1;':
        ['black-text-theme'],
    'color:black;mso-themecolor:text1':
        ['black-text-theme'],

    "font-size: 12.0pt; font-family:'Times New Roman',serif; mso-fareast-font-family:'Times New Roman';color:#ffc000;":
        ['orange'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:#FFC000':
        ['orange'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:#FFC000':
        ['orange'],
    'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:#FFC000':
        ['orange'],
    'font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000':
        ['orange'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; color: #ffc000;':
        ['orange'],
    'font-size: 12.0pt; line-height: 107%; font-family:"Times New Roman",serif; color: #ffc000;':
        ['orange'],
    'font-size: 12.0pt; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: #ffc000;':
        ['orange'],
    'font-size: 12.0pt; line-height: 107%; font-family: \'Times New Roman\',serif; mso-fareast-font-family: \'Times New Roman\'; color: #ffc000;':
        ['orange'],
    'font-size:12.0pt;line-height:107%;mso-ascii-font-family:"Times New Roman";mso-hansi-font-family:"Times New Roman";mso-bidi-font-family:"Times New Roman";color:#FFC000':
        ['orange'],
    'color:#FFC000':
        ['orange'],
    'color:#ffc000':
        ['orange'],
    'color: #ffc000;':
        ['orange'],

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
        ['foot-note-char'],

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

}


def map_docx_to_karaites_html(html, foot_notes_list, language="en", stats=False):
    """
        Map docx generated html to a lighter and css class oriented html
    """

    # BS4 adds html, head and body to html tree if missing
    def remove_tag_simple(html_str):
        remove_tags = ['<html>', '</html>', '<head>', '</head>', '<body>', '</body>']
        for tag in remove_tags:
            html_str = html_str.replace(tag, '')

        return html_str

    html_tree = BeautifulSoup(html, 'html5lib')

    # replace complicate <a></a>
    if len(foot_notes_list) > 0:
        foot_note = 0
        for child in html_tree.find_all('a'):
            if hasattr(child, 'find'):
                try:
                    note_ref = re.match('\\[[0-9]*.\\]', foot_notes_list[foot_note]).group()
                    child.replace_with(BeautifulSoup(
                        f"""<span class="{language}-foot-note" 
                        data-for='{language}' 
                        data-tip='{foot_notes_list[foot_note]}'>
                        <sup class="{language}-foot-index">{note_ref}</sup></span>""",
                        'html5lib'))
                    foot_note += 1
                except IndexError:
                    print(foot_note, len(foot_notes_list), foot_notes_list)
                    sys.exit()

    # first remove all empty tags
    for child in html_tree.find_all():
        if len(child.get_text(strip=True)) == 0:
            child.extract()

    # style to classes
    for child in html_tree.find_all('p', class_="MsoNormal"):
        style = child.attrs.get('style', '').replace('\n', '').replace('\r', '')
        classes = MAP_P_STYLE_TO_CLASSES.get(style, None)
        if classes is not None:
            child.attrs.pop('style')
            if child.attrs['class'] == [classes[0]]:
                child.attrs['class'] = [f'{language}-{classes[1]}']
        else:
            if style is not None and style != '':
                print("<p>", "-" * 60)
                print(style)
                print("-" * 60)
                sys.exit()

        for span_child in child.find_all('span'):
            style = span_child.attrs.get('style', '').replace('\r', '').replace('\n', '')
            classes = MAP_SPAN_STYLE_TO_CLASSES.get(style, None)
            if classes is not None:
                span_child.attrs.pop('style')
                span_child.attrs['class'] = [f'{language}-{classes[0]}']
            else:
                if style is not None and style != '':
                    print("<span>", "-" * 60)
                    print(style)
                    print("-" * 60)
                    sys.exit()

    new_html = remove_tag_simple(str(html_tree).replace('\n', ' '))
    for k in REPLACE_TAGS.keys():
        new_html = new_html.replace(k, REPLACE_TAGS[k])

    if stats:
        print(html)
        print("-" * 90)
        print(new_html)
        print(f"html as string len:{len(html)}, new_html len:{len(new_html)}")
        input('> enter to carry on.')
    return new_html


# to test and debug uncomment this
# html = """<p class="MsoNormal" dir="RTL" style="text-align: justify; line-height: normal; tab-stops: 460.7pt;"><span dir="LTR" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">1:1</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">אלה הדברים</span><span dir="LTR" lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">- כאשר היו ישראל עתידים לעבור את הירדן</span><span dir="LTR" lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">להחלק איש בנחלתו, והיו צריכים התראה ואזהרה לשמור התורה, כאשר בזמן נסוע מסיני להכנס בארץ &lt;התרה בהם&gt;, וכאשר אירעו להם ענינים ונמנעו מלהכנס, אז כון עתה לסדר גם אותם {הענינים} &lt;עניני המניעות שמסבתם נשנו עתה עניני האזהרות וההתראות&gt;.<a style="mso-footnote-id: ftn1;" title="" href="#_ftn1" name="_ftnref1"><span class="MsoFootnoteReference"><span dir="LTR" style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size: 12.0pt; line-height: 115%; font-family: 'Times New Roman',serif; mso-fareast-font-family: Calibri; mso-fareast-theme-font: minor-latin; position: relative; top: -2.0pt; mso-text-raise: 2.0pt; mso-ansi-language: EN-US; mso-fareast-language: EN-US; mso-bidi-language: HE;">[1]</span></span><!--[endif]--></span></span></a><span style="mso-spacerun: yes;">&nbsp;</span>על כן החל במלת <span style="color: #ffc000;">דברים</span>, לכלול עניני המצות ודברי תוכחה. ויהיה טעם <span style="color: #ffc000;">אלה הדברים אשר דבר משה אל כל ישראל בעבר הירדן</span> מה שאירע להם <span style="color: #ffc000;">במדבר בערבה מול סוף </span>,כלל מה שעבר עליהם בנסעם מסיני עד בואם לקדש ברנע:</span></p>
# <p class="MsoNormal" dir="RTL" style="text-align: justify; line-height: normal; tab-stops: 460.7pt;"><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: black; mso-themecolor: text1; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">ו</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: #ffc000; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">לבן</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: black; mso-themecolor: text1; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">ו</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: #ffc000; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">תפל</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: red; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;"><span style="mso-spacerun: yes;">&nbsp;</span></span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: black; mso-themecolor: text1; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">ו</span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; color: #ffc000; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">די זהב </span><span lang="HE" style="font-size: 12.0pt; font-family: 'Times New Roman',serif; position: relative; top: -2.0pt; mso-text-raise: 2.0pt;">לא נזכרו במסעים גם לא נזכרו במקום אחר, ואולם אחר שאומר <span style="color: #ffc000;">בין ובין </span>אין הטעם שעברו באותם המקומות עצמם שנזכרו בשמות אלו. </span></p>"""
# map_docx_to_karaites_html(html, foot_notes_list=['[9] TEST'], language="he", stats=True)
