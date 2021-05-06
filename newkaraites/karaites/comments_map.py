from html_sources import html_1_1


def map_docx_to_karaites_html(html):
    """
        Map docx generated html to a lighter and css class oriented html
    """

    # BS4 adds html, head and body to html tree if missing

    def remove_tag_simple(html_str):
        remove_tags = ['<html>', '</html>', '<head>', '</head>', '<body>', '</body>']
        for tag in remove_tags:
            html_str = html_str.replace(tag, '')

        return html_str

    # comment on chapter 1 verse 1
    # find key replace by value
    translate = {"""<p class="MsoNormal" style="margin-left:.5in;text-align:justify">""":
                     """<p class="paragraph">""",

                 """<span style='font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif; color:red'>""":
                     """<span class="comment-start">""",

                 """<span style='font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif; mso-fareast-font-family:"Times New Roman";color:black'>""":
                     """<span class="comment-text">""",

                 """<span style="color:#00B050"> </span>""":
                     """""",

                 """<span style="color:black; mso-themecolor:text1">""":
                     """<span class="text-color">""",

                 """<span style='font-size:12.0pt;line-height:107%;font-family:"Times New Roman",serif'>""":
                     """<span class="text-font">""",

                 """<!--[if !supportFootnotes]-->""":
                     """""",

                 """<!--[endif]-->""":
                     """""",

                 """<span style='font-size:12.0pt;line-height:107%; font-family:"Times New Roman",serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font: minor-latin;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language: HE'>""":
                     """<span class="footnote-char">""",

                 # """<span style="mso-special-character:footnote">""":
                 #   ,

                 """<o:p>""":
                     """<p>""",

                 """</o:p>""":
                     """</p>"""
                 }

    css = """
        .paragraph {
            margin-left:.5in;
            text-align:justify
        }
        .comment-start {
            font-size:12.0pt;
            line-height:107%;
            font-family:'Times New Roman';,serif;
            color:red
        }
        .comment-text {
            font-size:12.0pt;
            line-height:107%;
            font-family:'Times New Roman';,serif;mso-fareast-font-family:'Times New Roman';
            color:black
        }
        .text-color {
           color:black;
        }   
        .text-font {
           font-size:12.0pt;
           line-height:107%;
           font-family:"Times New Roman",serif;
        }  
        .footnote-reference {
           font-size:12.0pt;
           line-height:107%;
           font-family:"Times New Roman",serif;
           mso-fareast-font-family:Calibri;
           mso-fareast-theme-font: minor-latin;
           mso-ansi-language:EN-US;
           mso-fareast-language:EN-US;
           mso-bidi-language: HE;
        }      
        .footnote-char {
           font-size:12.0pt;
           line-height:107%;
           font-family:"Times New Roman",serif;
           mso-fareast-font-family:Calibri;
           mso-fareast-theme-font: minor-latin;mso-ansi-language:EN-US;
           mso-fareast-language:EN-US;mso-bidi-language:HE;
        }
    """
    html_has_string = remove_tag_simple(str(html).replace('\n', ' '))
    new_html = html_has_string
    for k in translate.keys():
        if callable(translate[k]):
            new_html = translate[k](html, k)
        else:
            new_html = new_html.replace(k, translate[k])

    print(new_html)


map_docx_to_karaites_html(html_1_1)
