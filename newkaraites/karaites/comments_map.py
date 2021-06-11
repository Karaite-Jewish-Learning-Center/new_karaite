import re
from bs4 import BeautifulSoup


def map_docx_to_karaites_html(html, foot_notes_list, stats=False):
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
    translate = {"""<p class="MsoNormal" style="margin-left:.5in;text-align:justify">""":
                     """<p class="paragraph">""",
                 """<p class="MsoNormal" style="margin-left: .5in; text-align: justify;">""":
                     """<p class="paragraph">""",
                 """<p class="MsoNormal" style="text-align: justify; line-height: normal; margin: 0in 0in 7.9pt .5in;">""":
                     """<p class="paragraph">""",

                 """<p class="MsoNormal" style="margin-top:0in;margin-right:0in;margin-bottom:7.9pt; margin-left:.5in;text-align:justify;line-height:normal">""":
                     """<p class="paragraph-normal">""",
                 """<p class="MsoNormal" style="margin-bottom:7.9pt;text-align:justify;text-indent: .5in;line-height:normal">""":
                     """<p class="paragraph-indent">""",
                 """<p class="MsoNormal" style="margin-bottom:7.9pt;text-align:justify;line-height: normal">""":
                     """<p class="paragraph-normal">""",

                 """<span style=\'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif; color:red\'>""":
                     """<span class="comment-start">""",
                 """<span style=\'font-size:12.0pt;font-family:"Times New Roman",serif; mso-fareast-font-family:"Times New Roman";color:red\'>""":
                     """<span class="comment-start">""",
                 """<span style=\'font-size:12.0pt;font-family: "Times New Roman",serif;mso-fareast-font-family:"Times New Roman";color:red\'>""":
                     """<span class="comment-start">""",

                 """<span style=\'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif; mso-fareast-font-family:"Times New Roman";color:black\'>""":
                     """<span class="comment-text">""",
                 """</span><span style=\'font-size:12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family: "Times New Roman";color:black\'>""":
                     """<span class="comment-text">""",
                 """<span style=\'font-size:12.0pt;font-family:"Times New Roman",serif; mso-fareast-font-family:"Times New Roman";color:black\'""":
                     """<span class="comment-text">""",
                 """<span style="font-size: 12.0pt; line-height: 107%; font-family:"Times New Roman",serif;">""":
                     """<span class="comment-text">""",

                 """<span style=\'font-size:12.0pt; line-height:107%;font-family:"Times New Roman",serif\'>""":
                     """<span class="dash">""",

                 """<span style="color:#00B050;"> </span>""":
                     """""",

                 """<span style="color: #FFC000">""":
                     """<span class="citation">""",

                 """<span style="color:#FFC000">""":
                     """<span class="citation">""",

                 """<span style="color: #ffc000;">""":
                     """<span class="citation">""",

                 """<span style="color: black; mso-themecolor: text1;">""":
                     """<span class="text-color">""",

                 """<span style="color:black; mso-themecolor:text1">""":
                     """<span class="text-color">""",
                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif;">""":
                     """<span class="text-color">""",

                 """<span style='font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif'>""":
                     """<span class="text-font">""",

                 """<!-- [if !supportFootnotes]-->""":
                     """""",

                 """<!--[endif]-->""":
                     """""",

                 """<span style='font-size:12.0pt;line-height:107%; font-family:"Times New Roman",serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font: minor-latin;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language: HE'>""":
                     """<span class="footnote-char">""",
                 """<span style="mso-special-character: footnote;">""":
                     """<span class="footnote-char">""",
                 """<span class="MsoFootnoteReference">""":
                     """<span class="foot-note-ref">""",
                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; mso-fareast-font-family: Calibri; mso-fareast-theme-font: minor-latin; mso-ansi-language: EN-US; mso-fareast-language: EN-US; mso-bidi-language: HE;">""":
                     """<span class="foot-note">""",

                 """<o:p>""":
                     """<p>""",

                 """</o:p>""":
                     """</p>""",

                 """<span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif; mso-fareast-font-family:&quot;Times New Roman&quot;;color:#0070C0">""":
                     """<span class="biblical-link">""",

                 """<span style="color: #0070c0;">""":
                     """<span class="biblical-link">""",
                 """<span style="color:#0070C0">""":
                     """<span class="biblical-link">""",
                 """<span style="color: #0070C0">""":
                     """<span class="biblical-link">""",
                 """<span style=\"font-size:12.0pt; line-height:107%;font-family:\"Times New Roman\",serif;mso-fareast-font-family:\"Times New Roman\";color:#0070C0\">""":
                     """<span class="biblical-link">""",
                 """<span style=\"font-size:12.0pt;font-family:\"Times New Roman\",serif; mso-fareast-font-family:\"Times New Roman\";color:#0070C0\">""":
                     """<span class="biblical-link">""",
                 """<span style="font-size:12.0pt; line-height:107%;font-family:"Times New Roman",serif;mso-fareast-font-family: "Times New Roman";color:#0070C0">""":
                     """<span class="biblical-link">""",
                 """<span style="font-size:12.0pt;font-family:"Times New Roman",serif; mso-fareast-font-family:"Times New Roman";color:#0070C0">""":
                     """<span class="biblical-link">""",
                 """<span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #0070c0;">(Song of Songs 5:6)</span>&lt;<span class="black">.</span><span class="foot-note" data-tip="[9] TESTE"><sup>[9]</sup></span>&lt;</p><p class="paragraph">&lt;<span class="black">It seems that the beginning of this </span><em><span class="yellow">instruction</span></em>&lt;<span class="black">is from the chapter beginning with the words: </span><em><span class="yellow">Now, Israel, listen to the statutes and to the ordinances</span></em>&lt;<span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #0070c0;">""":
                     """<span class="biblical-link">""",
                 """<span style="font-size:12.0pt; font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;; color:#0070C0">""":
                     """<span class="biblical-link">""",
                 """</span><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #0070c0;">""":
                     """<span class="biblical-link">""",

                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; color: #ffc000;">""":
                     """<span class="person-name">""",

                 """<span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif; mso-fareast-font-family:&quot;Times New Roman&quot;;color:#FFC000">""":
                     """<span class="yellow">""",

                 """<span style="font-size:12.0pt;line-height:107%; font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman"; color:#FFC000">""":
                     """<span class="yellow">""",
                 """<span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #ffc000;">""":
                     """<span class="yellow">""",

                 """<span style="font-size: 12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;; color:red">""":
                     """<span class="red">""",
                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; color: red;">""":
                     """<span class="red">""",
                 """<span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;color:red">""":
                     """<span class="red">""",
                 """<span style="color: red;">""":
                     """<span class="red">""",
                 """<span style="font-size: 12.0pt;font-family:"Times New Roman",serif;mso-fareast-font-family:"Times New Roman"; color:red">""":
                     """<span class="red">""",

                 """<span style="font-size: 12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;; color:red">""":
                     """<span class="red">""",
                 """<span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: red;">""":
                     """<span class="red">""",
                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; color: red;">""":
                    """<span class="red">""",
                 """<span style="font-size:12.0pt; font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;; color:black">—Similar to </span>""":
                     """<span class="black">""",

                 """<span style="font-size: 12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;; color:black">""":
                     """<span class="black">""",
                 """<span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;color:black">""":
                     """<span class="black">""",
                 """<span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif">""":
                     """<span class="black">""",

                 """<span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;">""":
                     """<span class="black">""",
                 """span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;">""":
                     """<span class="black">""",
                 """<span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman';">""":
                     """<span class="black">""",
                 """<span style=\'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif; color:black;mso-themecolor:text1\'>""":
                     """<span class="Consequently">""",
                 """<span style=\'font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif;color:black;mso-themecolor:text1\'>""":
                     """<span class="Consequently">""",
                 """<span style=\'font-size: 12.0pt;line-height:107%;font-family:"Times New Roman",serif\'>""":
                     """<span class="divine">""",
                 """<span style=\"font-size: 12.0pt;line-height:107%;font-family:"Times New Roman",serif\">""":
                     """<span class="divine">""",

                 """<span style="color: #00b050;">""":
                     """<span class="green">""",

                 }

    new_html = html.replace('\n', '').replace('\r', '')
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
    foot_note = 0
    for child in html_tree.find_all('a'):
        if hasattr(child, 'find'):
            note_ref = re.match('\\[[0-9]*.\\]', foot_notes_list[foot_note]).group()
            child.replace_with(BeautifulSoup(
                f'<span class="foot-note" data-tip="{foot_notes_list[foot_note]}"><sup>{note_ref}</sup></span>',
                'html5lib'))
            foot_note += 1

    html_has_string = remove_tag_simple(str(html_tree).replace('\n', ' '))

    if stats:
        print(html)
        print("-" * 90)
        print(html_has_string)
        print(f"html as string len:{len(html)}, new_html len:{len(html_has_string)}")

    return html_has_string
#
#
# html = """<p class="MsoNormal" style="text-align: justify; line-height: normal; margin: 0in 0in 7.9pt .5in;"><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: red;">1:5 Moses began [<em>ho&rsquo;il</em>]<em> </em>to elucidate [<em>be&rsquo;er</em>]<em> </em>this divine instruction [<em>tora</em>]</span><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;">&mdash;Similar to </span><em><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #ffc000;">he left [</span></em><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #ffc000;">ḥamaḳ<em>], went away [</em>&lsquo;avar<em>]</em> </span><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #0070c0;">(Song of Songs 5:6)</span><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;">.</span><a style="mso-footnote-id: ftn9;" title="" href="#_ftn9" name="_ftnref9"><span class="MsoFootnoteReference"><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black; mso-themecolor: text1;"><span style="mso-special-character: footnote;"><!-- [if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size: 12.0pt; line-height: 107%; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black; mso-themecolor: text1; mso-ansi-language: EN-US; mso-fareast-language: EN-US; mso-bidi-language: HE;">[9]</span></span><!--[endif]--></span></span></span></a><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;"> </span></p>
# <p class="MsoNormal" style="text-align: justify; line-height: normal; margin: 0in 0in 7.9pt .5in;"><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;">It seems that the beginning of this </span><em><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #ffc000;">instruction</span></em><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #ffc000;"> </span><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;">is from the chapter beginning with the words: </span><em><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #ffc000;">Now, Israel, listen to the statutes and to the ordinances</span></em><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: black;"> </span><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman'; color: #0070c0;">(Deuteronomy 4:1)</span><span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman';">.</span></p>"""
# map_docx_to_karaites_html(html, foot_notes_list=['[9] TESTE'], stats=True)
