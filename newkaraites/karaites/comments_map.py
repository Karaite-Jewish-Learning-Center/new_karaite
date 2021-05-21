from bs4 import BeautifulSoup


def map_docx_to_karaites_html(html, stats=False):
    """
        Map docx generated html to a lighter and css class oriented html
    """

    # BS4 adds html, head and body to html tree if missing
    def remove_tag_simple(html_str):
        remove_tags = ['<html>', '</html>', '<head>', '</head>', '<body>', '</body>']
        for tag in remove_tags:
            html_str = html_str.replace(tag, '')

        return html_str

    # find key replace by value
    translate = {"""<p class="MsoNormal" style="margin-left: .5in; text-align: justify;">""":
                     """<p class="paragraph">""",

                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; color: red;">""":
                     """<span class="comment-start">""",

                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;">&mdash;</span><span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif;">""":
                     """<span class="comment-text">""",

                 """<span style="color:#00B050;"> </span>""":
                     """""",
                 """<span style="color: #ffc000;">""":
                     """<span class="citation">""",

                 """<span style="color: black; mso-themecolor: text1;">""":
                     """<span class="text-color">""",

                 """<span style='font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif'>""":
                     """<span class="text-font">""",

                 """<!-- [if !supportFootnotes]-->""":
                     """""",

                 """<!--[endif]-->""":
                     """""",

                 """<span style='font-size:12.0pt;line-height:107%; font-family:"Times New Roman",serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font: minor-latin;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language: HE'>""":
                     """<span class="footnote-char">""",

                 """<o:p>""":
                     """<p>""",

                 """</o:p>""":
                     """</p>""",

                 """<span style="color: #0070c0;">""":
                     """<span class="biblical-link">""",

                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; color: #ffc000;">""":
                     """<span class="person-name">""",
                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif;">""":
                     """<span class="comment-text">""",

                 """<span style="color: red;">""":
                     """<span class="red">""",

                 }

    new_html = html.replace('\n', ' ')
    for k in translate.keys():
        if callable(translate[k]):
            new_html = translate[k](new_html, k)
        else:
            new_html = new_html.replace(k, translate[k])

    html_tree = BeautifulSoup(new_html, 'html5lib')

    # first remove all empty tags
    for child in html_tree.find_all():
        if len(child.get_text(strip=True)) == 0:
            child.extract()

    # replace complicate <a></a> tag with <span class="footnote-char">[foot note number]</span>
    foot_note = 1
    for child in html_tree.find_all('a'):
        if hasattr(child, 'find'):
            child.replace_with(BeautifulSoup(f'<span class="foot-note"><sup>[{foot_note}]</sup></span>', 'html5lib'))
            foot_note += 1

    for child in html_tree.find_all('span', class_="biblical-link"):
        if hasattr(child, 'find'):
            link = child.get_text()
            child.replace_with(BeautifulSoup(f'<a class="biblical-link" href="/get-biblical-text/{link}/">{link}</a>', 'html5lib'))

    html_has_string = remove_tag_simple(str(html_tree).replace('\n', ' '))

    if stats:
        print(html)
        print("-" * 90)
        print(html_has_string)
        print(f"html as string len:{len(html)}, new_html len:{len(html_has_string)}")

    return html_has_string
#
# from html_sources import (html_1_1_2,html_1_1_2_simplified)
#
# a=map_docx_to_karaites_html(html_1_1_2)
# print(len(a), len(html_1_1_2_simplified))
# print(a)
# print(html_1_1_2_simplified)