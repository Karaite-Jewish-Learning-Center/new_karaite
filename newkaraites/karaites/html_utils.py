import re
from bs4 import BeautifulSoup


def full_range_verse(pattern):
    # 5:19-5:23, must have same chapter
    parts = pattern.group().strip().split('-')
    start_chapter, verse = parts[0].split(':')
    start = int(verse)
    end_chapter, verse = parts[1].split(':')
    end = int(verse)
    verses = list(range(start, end + 1))
    return int(end_chapter), verses


def range_verse(pattern):
    parts = pattern.group().strip().split(':')

    chapter = int(parts[0])
    start = int(parts[1][:parts[1].find("–")])
    end = int(parts[2])
    verse = list(range(start, end + 1))

    return chapter, verse


def possible_range(pattern=None, group=None):
    if pattern is not None:
        chapter, possible = pattern.group().strip().replace('>', '').replace('<', '').split(":")
    else:
        chapter, possible = group.strip().replace('>', '').replace('<', '').split(":")

    char = None
    if possible.find('–') > 0:
        # english
        char = '–'
    elif possible.find('-') > 0:
        # hebrew
        char = '-'
    if char is not None:
        # start main be bigger then end  18:12-3
        start, end = sorted(list(map(int, possible.split(char))))
        verse = list(range(start, end + 1))
    else:
        verse = [int(possible)]

    return int(chapter), verse


def simple_range(pattern):
    chapter, verse = pattern.strip().replace('>', '').replace('<', '').split(":")
    return int(chapter), [int(verse)]


def get_chapter_verse_en(html):
    """ Parse chapter number and verse."""
    chapter = None
    verse = None
    if html is not None:

        # replace(' ', '', 1) case that 1: 9
        text = html.text.replace(' ', '', 1).replace('\n', '').strip()

        # 11:9-11:10
        pattern = re.search('^[0-9]*:[0-9]*–[0-9]*:[0-9]*', text)
        if pattern is not None:
            return range_verse(pattern)

        # 11:9-11 -> 11:9 , 11:10, 11:11
        pattern = re.search('^[0-9]+:[0-9,–]+', text)
        if pattern is not None:
            return possible_range(pattern=pattern)

        # 11:9
        pattern = re.search('^[0-9,:,–]+', text)
        if pattern is not None:
            return simple_range(pattern.group())

    return chapter, verse


def get_chapter_verse_he(html):
    """ Parse chapter number and verse  in Hebrew."""
    chapter = None
    verse = None
    if html is not None:
        text = str(html)
        # 11:9-11:10
        pattern = re.search('[0-9]*:[0-9]*–[0-9]*:[0-9]*', text)
        if pattern is not None:
            return range_verse(pattern)

        # 5:19-5:23
        pattern = re.search('[0-9]+:[0-9]+-[0-9]+:[0-9]+', text)
        if pattern is not None:
            return full_range_verse(pattern)

        # 11:9-11 -> 11:9 , 11:10, 11:11, 1:29-31]
        pattern = re.search('[0-9]+:[0-9,-]+', text)
        if pattern is not None:
            second_pattern = re.search('>-?[0-9]+<', text)
            if second_pattern is not None:
                second = second_pattern.group().replace('>', '').replace('<', '')
                first = pattern.group()
                if first.find('-') < 0:
                    if not second.startswith('-'):
                        second = "-" + second
                verse_range = pattern.group() + second
                return possible_range(pattern=None, group=verse_range)
            else:
                return possible_range(pattern=pattern)

        pattern = re.search('>[0-9]+', text)
        if pattern is not None:
            # :24-25
            second_pattern = re.search('>:[0-9]+-[0-9]+<', text)
            if second_pattern is not None:
                second = second_pattern.group()
                first = pattern.group()
                if second.find('-') > 0:
                    return possible_range(pattern=None, group=first + second)
                else:
                    return simple_range(first + second)
            else:
                # 3:10
                second_pattern = re.search('>:[0-9]+<', text)
                if second_pattern is not None:
                    first = pattern.group() + second_pattern.group()
                    return simple_range(first)
    return chapter, verse


# html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red">5:19-5:23
# ותקרבון</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;
# font-family:&quot;Times New Roman&quot;,serif;color:red"><span dir="LTR"></span> </span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
# color:red"><span dir="RTL"></span>{ותעמדון על כן נאמר}&lt;... ותאמרו&gt;<a style="mso-footnote-id:ftn22" href="#_ftn22" name="_ftnref22" title=""><span class="MsoFootnoteReference"><span dir="LTR" style="mso-special-character:footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:12.0pt;line-height:115%;
# font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font:
# minor-latin;color:red;mso-ansi-language:EN-US;mso-fareast-language:EN-US;
# mso-bidi-language:HE">[22]</span></span><!--[endif]--></span></span></a> הן הראנו
# ה' אלהינו את כבודו ואת גדלו ואת קולו שמענו מתוך האש... ועתה למה נמות </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">- כי קודם
# לכן אמרו <span style="color:#FFC000">דבר עתה עמנו ונשמעה</span> <span style="color:#0070C0">(שמות כ:יט)</span>,<span style="color:#0070C0"> </span>ועשה
# כן, הוא הנאמר <span style="color:#FFC000">אנכי עומד בין ה' וביניכם</span> <span style="color:#0070C0">(דברים ה:ה)</span>, וכאשר שמעו את הקול וקצרה רוחם ומעטה
# נשמתם, ולא עצרו כח מן המעמד וקולות המחרידות, אמרו עוד <span style="color:#FFC000">ועתה
# למה נמות כי תאכלנו האש הגדולה הזאת</span>. על כן אמרו <span style="color:#FFC000">קרב
# אתה ושמע</span>, כי מעתה סר הספק בהשפעת הנבואה, כאמרם <span style="color:#FFC000">היום
# הזה ראינו כי ידבר אלהים את האדם וחי: <o:p></o:p></span></span></p>""""",
#                      'html5lib')
#
# print(get_chapter_verse_he(html))

def get_foot_note_index(html):
    """ Parse foot note number
        typical foot note = '[2] Babylonian Talmud, Ḳiddushin\n38a.'
        should return 2
    """
    index = None
    match = re.search("\\d+", html.text)
    if match is not None:
        index = match.group()
        try:
            index = int(index)
        except ValueError:
            pass
    return index

