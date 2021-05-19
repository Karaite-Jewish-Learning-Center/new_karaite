from bs4 import BeautifulSoup
from .html_utils import (get_chapter_verse,
                         get_foot_note_index)

from .html_sources import html_1_1


class TestGetChapterVerse:

    def test_chapter_1_verse_1(self):
        # most verses are like the first one in Deuteronomy comments

        chapter, verse = get_chapter_verse(html_1_1)

        assert chapter == 1
        assert verse == [1]

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

        assert chapter == 1
        assert verse == [3]

    def test_chapter_1_verse_15(self):
        # 1:15-1:16
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-top:0in;margin-right:0in;margin-bottom:7.9pt;
margin-left:.5in;text-align:justify;line-height:normal"><span style="font-size:
12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
color:red">1:15–1:16 Captains of thousands</span><span style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
color:black">—The intent is clear that it does not mean that for every thousand
there is a captain. Rather, there are many different types of legal matters—capital
crimes, personal injuries, offenses punishable by lashes, financial cases—and
depending on the severity of the case, judges would be appointed to adjudicate </span><i><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:
&quot;Times New Roman&quot;;color:#FFC000">between man and brother and stranger</span></i><i><span style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:
&quot;Times New Roman&quot;;color:black">.</span></i><span style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:&quot;Times New Roman&quot;;
color:black"><o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == 1
        assert verse == [15, 16]

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

        assert chapter == 1
        assert verse == [6]

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

        assert chapter == 1
        assert verse == [16]

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

        assert chapter == 6
        assert verse == [9]

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

        assert chapter == 7
        assert verse == [1]

    def test_chapter_18_verse_12(self):
        """ 18:12-3"""

        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
color:red">18:12–3 And because of these abominations—</span><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif">the
people of the land were punished. Consequently, he juxtaposes, <i><span style="color:#FFC000">You shall be at peace with Adonai your God.<span lang="HE" dir="RTL"><o:p></o:p></span></span></i></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse(html)

        assert chapter == 18
        assert verse == list(range(3, 13))


class TestFootNoteIndex:
    """ Foot note index should be an integer bigger then zero. """

    def test_index_one(self):
        html = BeautifulSoup("""<div style="mso-element:footnote" id="ftn1">
<p class="MsoFootnoteText"><a style="mso-footnote-id:ftn1" href="#_ftnref1" name="_ftn1" title=""><span class="MsoFootnoteReference"><span style="font-family:
&quot;Times New Roman&quot;,serif"><span style="mso-special-character:footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:10.0pt;line-height:107%;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font:
minor-latin;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:
HE">[1]</span></span><!--[endif]--></span></span></span></a><span style="font-family:
&quot;Times New Roman&quot;,serif"> Some material is added from two manuscripts, without
which it is very difficult to read this introductory passage.<o:p></o:p></span></p>
</div>""", 'html5lib')

        foot_index = get_foot_note_index(html)

        assert foot_index == 1

    def test_index_25(self):
        html = BeautifulSoup("""<div style="mso-element:footnote" id="ftn25">
<p class="MsoCommentText"><a style="mso-footnote-id:ftn25" href="#_ftnref25" name="_ftn25" title=""><span class="MsoFootnoteReference"><span style="font-family:
&quot;Times New Roman&quot;,serif"><span style="mso-special-character:footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:10.0pt;line-height:107%;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font:
minor-latin;mso-ansi-language:EN-US;mso-fareast-language:EN-US;mso-bidi-language:
HE">[25]</span></span><!--[endif]--></span></span></span></a><span style="font-family:&quot;Times New Roman&quot;,serif"> It is true that Radak maintained
that the final <i>yod </i>of <i>bilti </i>is part of the root, which would
distinguish it from <i>zulat/i </i>since it sometimes appears without a <i>yod</i>.<i>
</i>However, this is not how Aaron usually expresses that a letter is not part
of the root. Perhaps the reading <i>shezé</i> in a few manuscripts is correct
(with a <i>zayin</i> instead of a <i>vav</i>): “It is not like <i>bilti</i>,
for this is [<i>shez</i></span><i><span lang="X-NONE" style="font-family:&quot;Times New Roman&quot;,serif;
mso-ansi-language:X-NONE">é</span></i><span lang="X-NONE" style="font-family:
&quot;Times New Roman&quot;,serif;mso-ansi-language:X-NONE">]</span><span style="font-family:&quot;Times New Roman&quot;,serif"> with or with a <i>yod</i>.”
Meaning, <i>bilti</i> never appears without a <i>yod</i> (when there is no
pronominal suffix), whereas <i>zulati</i> also appears as <i>zulat</i>—it
appears with and without a <i>yod</i>. <o:p></o:p></span></p>
</div>""", 'html5lib')

        foot_index = get_foot_note_index(html)
        print(foot_index)
        assert foot_index == 25

    def test_index_112(self):
        html = BeautifulSoup("""<div style="mso-element:footnote" id="ftn112">
<p class="MsoFootnoteText"><a style="mso-footnote-id:ftn112" href="#_ftnref112" name="_ftn112" title=""><span class="MsoFootnoteReference"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="mso-special-character:
footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:10.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-ansi-language:
EN-US;mso-fareast-language:EN-US;mso-bidi-language:HE">[112]</span></span><!--[endif]--></span></span></span></a><span style="font-family:&quot;Times New Roman&quot;,serif"> See Aaron’s commentary at length
at the beginning of Exodus 32. <o:p></o:p></span></p>
</div>""", 'html5lib')

        foot_index = get_foot_note_index(html)

        assert foot_index == 112
