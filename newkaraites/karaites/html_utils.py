import re
from bs4 import BeautifulSoup


def get_chapter_verse(html):
    """ Parse chapter number and verse."""
    chapter = None
    verse = None
    if html is not None:
        try:
            text = html.text.replace(' ', '', 1).replace('\n', '').strip()

            # 11:9-11:10
            pattern = re.search('^[0-9]*:[0-9]*–[0-9]*:[0-9]* ', text)
            if pattern is not None:
                print(pattern.group(), pattern.start(), 'first')
                parts = pattern.group().strip().split(':')

                chapter = parts[0]
                start = parts[1][:parts[1].find("–")]
                end = parts[2]
                verse = list(map(str, range(int(start), int(end) + 1)))
                print(chapter, verse, 'first')
                return chapter, verse

            # 11:9-11 -> 11:9 , 11:10, 11:11
            pattern = re.search('^[0-9]+:[0-9,–]+', text)
            if pattern is not None:
                print(pattern.group(), pattern.start(), 'second')
                chapter, possible_range = pattern.group().strip().split(":")

                if possible_range.find('–') > 0:
                    start, end = possible_range.split('–')
                    verse = list(map(str, range(int(start), int(end) + 1)))
                else:
                    verse = [possible_range]

                print(chapter, verse, 'second')
                return chapter, verse

            # 11:9
            pattern = re.search('^[0-9,:,–]+', text)
            if pattern is not None:
                print(pattern.group(), pattern.start(), 'third')

                chapter, verse = pattern.group().strip().split(":")
                print(chapter, verse, 'second')
                return chapter, [verse]

        except (ValueError, IndexError):
            pass
    return chapter, verse

#
# html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify;text-indent:3.0pt;
# line-height:normal"><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
# mso-fareast-font-family:&quot;Times New Roman&quot;;color:red">6: 9 You shall write them
# on the doorposts [<i>mezuzot</i>]</span><span style="font-size:12.0pt;
# font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
# color:black">—Similar to </span><i><span style="font-size:12.0pt;font-family:
# &quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;color:#FFC000">Write
# them on the tablet of your heart</span></i><span style="font-size:12.0pt;
# font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
# color:#FFC000"> </span><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
# mso-fareast-font-family:&quot;Times New Roman&quot;;color:#0070C0">(Proverbs 7:3) </span><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:
# &quot;Times New Roman&quot;;color:black;mso-themecolor:text1">[both are metaphorical
# writing].<o:p></o:p></span></p>""", 'html5lib')
#
# get_chapter_verse(html)
