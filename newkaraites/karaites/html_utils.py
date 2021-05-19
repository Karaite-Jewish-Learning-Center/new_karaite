import re
from bs4 import BeautifulSoup


def get_chapter_verse(html):
    """ Parse chapter number and verse."""
    chapter = None
    verse = None
    if html is not None:
        if True:
            # replace(' ', '', 1) case that 1: 9
            text = html.text.replace(' ', '', 1).replace('\n', '').strip()

            # 11:9-11:10
            pattern = re.search('^[0-9]*:[0-9]*–[0-9]*:[0-9]*', text)
            if pattern is not None:
                # print(pattern.group(), pattern.start(), 'first')
                parts = pattern.group().strip().split(':')

                chapter = int(parts[0])
                start = int(parts[1][:parts[1].find("–")])
                end = int(parts[2])
                verse = list(range(start, end + 1))
                return chapter, verse

            # 11:9-11 -> 11:9 , 11:10, 11:11
            pattern = re.search('^[0-9]+:[0-9,–]+', text)
            if pattern is not None:
                # print(pattern.group(), pattern.start(), 'second')
                chapter, possible_range = pattern.group().strip().split(":")

                if possible_range.find('–') > 0:
                    # start main be bigger then end  18:12-3
                    start, end = sorted(list(map(int, possible_range.split('–'))))
                    verse = list(range(start, end + 1))
                else:
                    verse = [int(possible_range)]

                return int(chapter), verse

            # 11:9
            pattern = re.search('^[0-9,:,–]+', text)
            if pattern is not None:
                # print(pattern.group(), pattern.start(), 'third')

                chapter, verse = pattern.group().strip().split(":")
                return int(chapter), [int(verse)]

        # except (ValueError, IndexError):
        # pass
    return chapter, verse


#
# html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
# color:red">18:12–3 And because of these abominations—</span><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif">the
# people of the land were punished. Consequently, he juxtaposes, <i><span style="color:#FFC000">You shall be at peace with Adonai your God.<span lang="HE" dir="RTL"><o:p></o:p></span></span></i></span></p>""",
#                              'html5lib')
# get_chapter_verse(html)


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
