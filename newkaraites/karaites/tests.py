from .html_utils import get_chapter_verse
from bs4 import BeautifulSoup


class TestGetChapterVerse:

    def test_chapter_1_verse_1(self):
        # most verses are like the first one in Deuteronomy comments
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
color:red">1:1 These are the matters [<i>devarim</i>]</span><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;;color:black">—</span><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif">When
the Israelites were about to cross the Jordan in order to divide themselves up according
to their portions,<span style="color:#00B050"> </span><span style="color:black;
mso-themecolor:text1">they required warning </span>and admonishment to observe
the Torah, just as he exhorted them when they were traveling from Sinai to
enter the land. Since events occurred that prevented them from entering, he now
wishes also to articulate the impediments on account of which the warnings and admonishments
must be repeated [now].<a style="mso-footnote-id:ftn1" href="#_ftn1" name="_ftnref1" title=""><span class="MsoFootnoteReference"><span style="mso-special-character:footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:12.0pt;line-height:107%;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font:
minor-latin;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:
HE">[1]</span></span><!--[endif]--></span></span></a> Consequently, he begins with
the word <i><span style="color:#FFC000">matters [</span></i><span style="color:#FFC000">devarim<i>]</i></span>, to include the subject matter of
the commandments and words of rebuke. The meaning of the verse would be <i><span style="color:#FFC000">These are the matters which Moses spoke to all of Israel across
the Jordan</span></i>: what befell them <i><span style="color:#FFC000">in the
wilderness, in the wasteland, opposite Suph</span></i>, including what happened
to them when they traveled from Sinai until their arrival at Kadesh Barnea. <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == '1'
        assert verse == ['1']

        # still 1:1
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><i><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
color:#FFC000">Laban</span></i><span style="font-size:12.0pt;line-height:107%;
font-family:&quot;Times New Roman&quot;,serif;color:red">, </span><i><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
color:#FFC000">Tophel</span></i><span style="font-size:12.0pt;line-height:107%;
font-family:&quot;Times New Roman&quot;,serif;color:red">, and </span><i><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
color:#FFC000">Dizahab </span></i><span style="font-size:12.0pt;line-height:
107%;font-family:&quot;Times New Roman&quot;,serif">are neither mentioned in [the
chronicles of] their journeys nor elsewhere, and indeed since he uses the words
<i><span style="color:#FFC000">between</span></i><span style="color:#FFC000"> <i>[Paran]</i>
<i>and</i> <i>between</i></span> <i><span style="color:#FFC000">[Tophel]</span></i>,
it does not mean they passed through actual places that bear these names.<span style="color:red"> <span lang="HE" dir="RTL"><o:p></o:p></span></span></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter is None
        assert verse is None

        # still 1:1
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif">And
when he says, <i><span style="color:#FFC000">in the wilderness, in the wasteland</span></i>,
he does not mean that they were <i><span style="color:#FFC000">across the
Jordan</span></i>, because when they were across the Jordan this same message
is said differently, like when it says, <i><span style="color:#FFC000">These
are the testimonies, statutes, and ordinances that Moses spoke to Israel when
they came out of Egypt, across the Jordan, in the valley near Beth Peor, in the
land of Sihon, king of the Amorites</span></i> <span style="color:#0070C0">(Deuteronomy
4:45–46)</span>, and Laban, Paran, and Hazeroth are not across the Jordan.<o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter is None
        assert verse is None

    def test_chapter_1_verse_3(self):
        # 1:3
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
color:red">1:3 In the fortieth year</span><span style="font-size:12.0pt;
line-height:107%;font-family:&quot;Times New Roman&quot;,serif">—Our [Karaite] sages, may
they rest in peace, reasoned that this book was narrated during the month of
Shevat, and on the New Moon of Adar Moses died, just like Aaron died on the New
Moon of Av. And [the period of] <i><span style="color:#FFC000">the days of
weeping in mourning</span></i><span style="color:#FFC000"> </span><span style="color:#0070C0">(Deuteronomy 34:8) </span>for Moses until they arose from
the Jordan on the tenth of the month is reconciled with the timeline stated in
Joshua only with some difficulty. <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == '1'
        assert verse == ['3']

    def test_chapter_1_verse_6(self):
        # 1:6
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-top:0in;margin-right:0in;margin-bottom:7.9pt;
margin-left:.5in;text-align:justify;line-height:normal"><span style="font-size:
12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
color:red">1:6<sup>&nbsp;</sup>Adonai our God&nbsp;spoke to us in Horeb</span><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:
&quot;Times New Roman&quot;;color:black">—He begins explaining the reason that they
needed commandments and warnings: because they were to enter the land; what
caused them to appoint captains of thousands and of hundreds; and why they were
prevented from entering until the fortieth year, necessitating an elucidation
of the divine instruction—because of the decree against Moses, as is mentioned
in the Torah portion of <i>Va’et-ḥannan</i>.<o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == '1'
        assert verse == ['6']

        # 1:16
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-bottom:7.9pt;text-align:justify;line-height:
normal"><b><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;;color:black"><span style="mso-tab-count:
1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></b><span style="font-size:12.0pt;font-family:
&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;color:red">1:16
Hear [<i>shamoa‘</i>]</span><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;;color:black">—An infinitive [instead
of the expected imperative].<a style="mso-footnote-id:ftn15" href="#_ftn15" name="_ftnref15" title=""><span class="MsoFootnoteReference"><span style="mso-special-character:footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:12.0pt;line-height:107%;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
color:black;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:
HE">[15]</span></span><!--[endif]--></span></span></a><o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == '1'
        assert verse == ['16']

    def test_chapter_6_verse_9(self):
        # 6:9
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify;text-indent:3.0pt;
line-height:normal"><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;;color:red">6: 9 You shall write them
on the doorposts [<i>mezuzot</i>]</span><span style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
color:black">—Similar to </span><i><span style="font-size:12.0pt;font-family:
&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;color:#FFC000">Write
them on the tablet of your heart</span></i><span style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
color:#FFC000"> </span><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;;color:#0070C0">(Proverbs 7:3) </span><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:
&quot;Times New Roman&quot;;color:black;mso-themecolor:text1">[both are metaphorical
writing].<o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == '6'
        assert verse == ['9']

    def test_chapter_7_verse_1(self):
        # 7:1:
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;;color:red">7:1: When… brings you—</span><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;">He intended to remove impediments
and obstacles from [following] the path of the commandments. Just as he benefited
them by exhorting them, via gradual correction, to keep the commandments in
order to preserve the knowledge that comprises the flourishing of the soul, so
he guides them via warnings against destructive things that can cause the
removal of His knowledge [from them]. <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == '7'
        assert verse == ['1']

