import re
from bs4 import BeautifulSoup


def range_verse(pattern):
    # print(pattern.group(), pattern.start(), 'first')
    parts = pattern.group().strip().split(':')

    chapter = int(parts[0])
    start = int(parts[1][:parts[1].find("–")])
    end = int(parts[2])
    verse = list(range(start, end + 1))

    return chapter, verse


def possible_range(pattern=None, group=None):
    if pattern is not None:
        chapter, possible = pattern.group().strip().split(":")
    else:
        chapter, possible = group.strip().split(":")

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
    chapter, verse = pattern.strip().split(":")
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

        # 11:9-11 -> 11:9 , 11:10, 11:11, 1:29-31
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
        pattern = re.search('>[0-9]+<', text)
        if pattern is not None:
            second_pattern = re.search('>:[0-9]+<', text)
            if second_pattern is not None:
                return simple_range((pattern.group() + second_pattern.group()).replace('>', '').replace('<', ''))

    return chapter, verse

#
# html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
# tab-stops:460.7pt"><span dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
# color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt">:10</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
# color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>3</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
# color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span><span style="mso-spacerun:yes">&nbsp;</span></span><span lang="HE" style="font-size:12.0pt;
# font-family:&quot;Times New Roman&quot;,serif;color:red;position:relative;top:-2.0pt;
# mso-text-raise:2.0pt">כל ערי המישור</span><span lang="HE" style="font-size:12.0pt;
# font-family:&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;mso-text-raise:
# 2.0pt"><span style="mso-spacerun:yes">&nbsp;</span>- נקשר למאמר <span style="color:#FFC000">ונקח בעת ההיא </span><span style="color:#0070C0">(דברים
# ג:ח)</span>: <o:p></o:p></span></p>""",
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
