from bs4 import BeautifulSoup
from newkaraites.karaites.management.commands.command_utils import (get_chapter_verse_en,
                                                                    get_chapter_verse_he,
                                                                    get_foot_note_index)
from newkaraites.karaites.tests.html_sources import html_1_1


class TestGetChapterVerse:

    def test_chapter_1_verse_1_en(self):
        # most verses are like the first one in Deuteronomy comments

        chapter, verse = get_chapter_verse_en(BeautifulSoup(html_1_1, 'html5lib'))

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

        chapter, verse = get_chapter_verse_en(html)

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

        chapter, verse = get_chapter_verse_en(html)

        assert chapter is None
        assert verse is None

    def test_chapter_1_verse_3_en(self):
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

        chapter, verse = get_chapter_verse_en(html)

        assert chapter == 1
        assert verse == [3]

    def test_chapter_1_verse_15_en(self):
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

        chapter, verse = get_chapter_verse_en(html)

        assert chapter == 1
        assert verse == [15, 16]

    def test_chapter_1_verse_6_en(self):
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

        chapter, verse = get_chapter_verse_en(html)

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

        chapter, verse = get_chapter_verse_en(html)

        assert chapter == 1
        assert verse == [16]

    def test_chapter_6_verse_9_en(self):
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

        chapter, verse = get_chapter_verse_en(html)

        assert chapter == 6
        assert verse == [9]

    def test_chapter_7_verse_1_en(self):
        # 7:1:
        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;;color:red">7:1: When… brings you—</span><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:&quot;Times New Roman&quot;">He intended to remove impediments
and obstacles from [following] the path of the commandments. Just as he benefited
them by exhorting them, via gradual correction, to keep the commandments in
order to preserve the knowledge that comprises the flourishing of the soul, so
he guides them via warnings against destructive things that can cause the
removal of His knowledge [from them]. <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_en(html)

        assert chapter == 7
        assert verse == [1]

    def test_chapter_18_verse_12_en(self):
        """ 18:12-3"""

        html = BeautifulSoup("""<p class="MsoNormal" style="margin-left:.5in;text-align:justify"><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif;
color:red">18:12–3 And because of these abominations—</span><span style="font-size:12.0pt;line-height:107%;font-family:&quot;Times New Roman&quot;,serif">the
people of the land were punished. Consequently, he juxtaposes, <i><span style="color:#FFC000">You shall be at peace with Adonai your God.<span lang="HE" dir="RTL"><o:p></o:p></span></span></i></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse_en(html)

        assert chapter == 18
        assert verse == list(range(3, 13))

    def test_chapter_1_verse_1_he(self):
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:460.7pt"><span dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt">1:1</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;
position:relative;top:-2.0pt;mso-text-raise:2.0pt">אלה הדברים</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span><span style="mso-spacerun:yes">&nbsp;</span></span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:relative;
top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>- כאשר היו ישראל עתידים
לעבור את הירדן</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:relative;
top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span><span style="mso-spacerun:yes">&nbsp;</span></span><span lang="HE" style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;mso-text-raise:
2.0pt">להחלק איש בנחלתו, והיו צריכים התראה ואזהרה לשמור התורה, כאשר בזמן נסוע
מסיני להכנס בארץ &lt;התרה בהם&gt;, וכאשר אירעו להם ענינים ונמנעו מלהכנס, אז כון
עתה לסדר גם אותם {הענינים} &lt;עניני המניעות שמסבתם נשנו עתה עניני האזהרות
וההתראות&gt;.<a style="mso-footnote-id:ftn1" href="#_ftn1" name="_ftnref1" title=""><span class="MsoFootnoteReference"><span dir="LTR" style="mso-special-character:
footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:12.0pt;line-height:115%;font-family:&quot;Times New Roman&quot;,serif;
mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;position:
relative;top:-2.0pt;mso-text-raise:2.0pt;mso-ansi-language:EN-US;mso-fareast-language:
EN-US;mso-bidi-language:HE">[1]</span></span><!--[endif]--></span></span></a><span style="mso-spacerun:yes">&nbsp;</span>על כן החל במלת <span style="color:#FFC000">דברים</span>,
לכלול עניני המצות ודברי תוכחה. ויהיה טעם <span style="color:#FFC000">אלה הדברים
אשר דבר משה אל כל ישראל בעבר הירדן</span> מה שאירע להם <span style="color:#FFC000">במדבר
בערבה מול סוף </span>,כלל מה שעבר עליהם בנסעם מסיני עד בואם לקדש ברנע:<o:p></o:p></span></p>""",
                             'html5lib')
        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 1
        assert verse == [1]

        # still 1:1
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:460.7pt"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt">1:1 במדבר בערבה </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:
relative;top:-2.0pt;mso-text-raise:2.0pt">- כנזכר <span style="color:#FFC000">בארץ
ערבה וְ</span></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:#FFC000;position:relative;top:-2.0pt;mso-text-raise:2.0pt;mso-ansi-language:
X-NONE">שׁ</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:#FFC000;position:relative;top:-2.0pt;mso-text-raise:2.0pt">וּחָה </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:#0070C0;
position:relative;top:-2.0pt;mso-text-raise:2.0pt">(ירמיהו ב:ו)</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:black;
mso-themecolor:text1;position:relative;top:-2.0pt;mso-text-raise:2.0pt">: <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 1
        assert verse == [1]

    html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:460.7pt"><span lang="HE" style='font-size:12.0pt;font-family:"Times New Roman",serif;
color:black;mso-themecolor:text1;position:relative;top:-2.0pt;mso-text-raise:
2.0pt'>ו</span><span lang="HE" style='font-size:12.0pt;font-family:"Times New Roman",serif;
color:#FFC000;position:relative;top:-2.0pt;mso-text-raise:2.0pt'>לבן</span><span lang="HE" style='font-size:12.0pt;font-family:"Times New Roman",serif;color:red;
position:relative;top:-2.0pt;mso-text-raise:2.0pt'><span style="mso-spacerun:yes"> </span></span><span lang="HE" style='font-size:12.0pt;
font-family:"Times New Roman",serif;color:black;mso-themecolor:text1;
position:relative;top:-2.0pt;mso-text-raise:2.0pt'>ו</span><span lang="HE" style='font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000;
position:relative;top:-2.0pt;mso-text-raise:2.0pt'>תפל</span><span lang="HE" style='font-size:12.0pt;font-family:"Times New Roman",serif;color:red;
position:relative;top:-2.0pt;mso-text-raise:2.0pt'><span style="mso-spacerun:yes"> </span></span><span lang="HE" style='font-size:12.0pt;
font-family:"Times New Roman",serif;color:black;mso-themecolor:text1;
position:relative;top:-2.0pt;mso-text-raise:2.0pt'>ו</span><span lang="HE" style='font-size:12.0pt;font-family:"Times New Roman",serif;color:#FFC000;
position:relative;top:-2.0pt;mso-text-raise:2.0pt'>די זהב </span><span lang="HE" style='font-size:12.0pt;font-family:"Times New Roman",serif;position:relative;
top:-2.0pt;mso-text-raise:2.0pt'>לא נזכרו במסעים גם לא נזכרו במקום אחר, ואולם
אחר שאומר <span style="color:#FFC000">בין ובין </span>אין הטעם שעברו באותם
המקומות עצמם שנזכרו בשמות אלו. <o:p></o:p></span></p>""", 'html5lib')

    chapter, verse = get_chapter_verse_he(html)

    assert chapter is None
    assert verse is None

    def test_chapter_1_verse_3_he(self):
        # 1:3
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:460.7pt"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
position:relative;top:-2.0pt;mso-text-raise:2.0pt">1:3 <span style="color:red">ויהי
בארבעים שנה </span>- מדרך סברא אמרו חכמינו ע"ה כי בכלל חדש שבט נאמר הספר,
ובראש חדש אדר מת משה, כאשר מת אהרן בראש חדש אב. ועל דרך דוחק יִשְּׁבוּ <span style="color:#FFC000">ימי בכי אבל משה </span><span style="color:#0070C0">(דברים
לד:ח)</span><span style="color:#FFC000"> </span>עד שעלו מן הירדן בעשור לחדש, עם
הימים הנאמרים ביהושע. ודעת בעלי הקבלה שבשבעה באדר מת משה, אם בדרך סברא על פי עיון
הכתוב יקשה הענין.<o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 1
        assert verse == [3]

    def test_chapter_1_verse_15_he(self):
        # 1:15-16
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:326.0pt 460.7pt"><span dir="LTR"></span><span dir="LTR" style="font-size:
12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;position:relative;
top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span>-16</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;
position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>1:15 שרי
אלפים </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
position:relative;top:-2.0pt;mso-text-raise:2.0pt">- נתבאר בו הרצון, שאין הטעם
בכל אלף שר. אמנם בעבור שעניני הדין למינים רבים, מהם דיני נפשות, ומהם דיני מומים,
ומהם דיני מלקות, ומהם דיני ממונות, כפי חמר הדין היו מתמנים שופטים בדין, <span style="color:#FFC000">בין איש ובין אחיו ובין גרו</span>:<o:p></o:p></span></p>
""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 1
        assert verse == [15, 16]

    def test_chapter_1_verse_6_he(self):
        # 1:6
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:326.0pt 460.7pt"><span lang="HE" style="font-size:12.0pt;font-family:
&quot;Times New Roman&quot;,serif;color:red;position:relative;top:-2.0pt;mso-text-raise:
2.0pt">1:6 ה' אלהינו דבר אלינו בחורב - </span><span lang="HE" style="font-size:
12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;
mso-text-raise:2.0pt">החל לבאר הסבה אשר היו מצטרכים מצוה ואזהרה בעבור הכנסם
לארץ, ומה גרם להם לתקן שרי אלפים ושרי מאות, ומפני איזה ענין נמנעו ונמשך הזמן עד
שנת הארבעים עד שהצרכו בבאור התורה, בעבור הגזרה שנגזרה למשה ע"ה כאשר נרמז
בפרשת ואתחנן:<o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 1
        assert verse == [6]

    def test_chapter_1_verse_29_he(self):
        # 1:29-31
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:326.0pt 460.7pt"><span dir="LTR"></span><span dir="LTR" style="font-size:
12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;position:relative;
top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span>1</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;
position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>1:29-3 ואומר
אליכם לא תערצון ולא תיראון מהם, ה' אלהיכם ההולך לפניכם </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:relative;
top:-2.0pt;mso-text-raise:2.0pt">- הטעם כאשר על דרך פלא עשה מה שעשה במצרים והספיק
לך במדבר <span style="color:#FFC000">עד בואכם עד המקום הזה</span>, כן יש לו כח
להלחם עם שבעה עממים:</span><span dir="LTR" style="font-size:12.0pt;font-family:
&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;mso-text-raise:2.0pt"><o:p></o:p></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 1
        assert verse == [29, 30, 31]

    def test_chapter_3_verse_4_he(self):
        # 3:4-5
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:460.7pt"><span dir="LTR"></span><span dir="LTR" style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;color:red;position:relative;top:-2.0pt;
mso-text-raise:2.0pt"><span dir="LTR"></span>-5</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;
position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>3:4 ששים
עיר חבל ארגוב</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span style="mso-spacerun:yes">&nbsp;</span>- יש מפרשים הטעם גורל, מלשון <span style="color:#FFC000;mso-themecolor:accent4">חבלים</span> <span style="color:#0070C0">(תהלים טז:ו)</span>, וארגוב שם איש שישב המקום. </span><span dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:
relative;top:-2.0pt;mso-text-raise:2.0pt"><o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 3
        assert verse == [4, 5]

    def test_chapter_3_verse_10_he(self):
        # 3:10
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
    tab-stops:460.7pt"><span dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
    color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt">:10</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
    color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>3</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
    color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span><span style="mso-spacerun:yes">&nbsp;</span></span><span lang="HE" style="font-size:12.0pt;
    font-family:&quot;Times New Roman&quot;,serif;color:red;position:relative;top:-2.0pt;
    mso-text-raise:2.0pt">כל ערי המישור</span><span lang="HE" style="font-size:12.0pt;
    font-family:&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;mso-text-raise:
    2.0pt"><span style="mso-spacerun:yes">&nbsp;</span>- נקשר למאמר <span style="color:#FFC000">ונקח בעת ההיא </span><span style="color:#0070C0">(דברים
    ג:ח)</span>: <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 3
        assert verse == [10]

    def test_chapter_3_verse_22_he(self):
        # 3:22
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
        tab-stops:460.7pt"><span dir="LTR"></span><span dir="LTR" style="font-size:12.0pt;
        font-family:&quot;Times New Roman&quot;,serif;color:red;position:relative;top:-2.0pt;
        mso-text-raise:2.0pt"><span dir="LTR"></span>:22</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;
        position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>3 כי ה'
        אלהיכם</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
        position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span style="mso-spacerun:yes">&nbsp;</span>- כאשר נצח אלו המלכים, כן ינצח למלכי כנען:<o:p></o:p></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 3
        assert verse == [22]

    def test_chapter_3_verse_23_24_he(self):
        # 3:23-24
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><span dir="LTR"></span><span dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red"><span dir="LTR"></span>:23-24</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red"><span dir="RTL"></span>3</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red"><span dir="LTR"></span> </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red">בעת ההיא</span><span lang="HE" style="font-size:12.0pt;font-family:
&quot;Times New Roman&quot;,serif"> - אחרי שנלחם עם סיחון ועוג ונסע מקדש, ונאמר לו: <span style="color:#FFC000">עלה אל הר העברים</span> <span style="color:#0070C0">(דברים
לב:מט)</span>. וזהו טעם</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red"><span dir="LTR"></span> </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:#FFC000">ה' אלהים אתה החלות</span><span lang="HE" style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif">, כאשר נאמר לו <span style="color:#FFC000;
mso-themecolor:accent4">אחל תת פחדך ויראתך </span><span style="color:#0070C0">(דברים
ב:כה)</span>: <o:p></o:p></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 3
        assert verse == [23, 24]

    def test_chapter_4_verse_4_he(self):
        # 4:4
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red">4:4
</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">והעיר
בענין בעל פעור</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif"><span dir="LTR"></span>
</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:#FFC000">ואתם הדבקים<b> </b></span><span lang="HE" style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif">כי ע״ז אמצעית ביניכם לבין השם, ועל כן <span style="color:#FFC000">ואתם הדבקים בה׳ אלהיכם חיים כלכם היום,</span> הפך <span style="color:#FFC000">כי כל האיש אשר הלך אחרי בעל פעור השמידו ה'</span>:<o:p></o:p></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 4
        assert verse == [4]

    def test_chapter_5_verse_19_5_23_he(self):
        # 4:4
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red">5:19-5:23
ותקרבון</span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;color:red"><span dir="LTR"></span> </span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red"><span dir="RTL"></span>{ותעמדון על כן נאמר}&lt;... ותאמרו&gt;<a style="mso-footnote-id:ftn22" href="#_ftn22" name="_ftnref22" title=""><span class="MsoFootnoteReference"><span dir="LTR" style="mso-special-character:footnote"><!--[if !supportFootnotes]--><span class="MsoFootnoteReference"><span style="font-size:12.0pt;line-height:115%;
font-family:&quot;Times New Roman&quot;,serif;mso-fareast-font-family:Calibri;mso-fareast-theme-font:
minor-latin;color:red;mso-ansi-language:EN-US;mso-fareast-language:EN-US;
mso-bidi-language:HE">[22]</span></span><!--[endif]--></span></span></a> הן הראנו
ה' אלהינו את כבודו ואת גדלו ואת קולו שמענו מתוך האש... ועתה למה נמות </span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">- כי קודם
לכן אמרו <span style="color:#FFC000">דבר עתה עמנו ונשמעה</span> <span style="color:#0070C0">(שמות כ:יט)</span>,<span style="color:#0070C0"> </span>ועשה
כן, הוא הנאמר <span style="color:#FFC000">אנכי עומד בין ה' וביניכם</span> <span style="color:#0070C0">(דברים ה:ה)</span>, וכאשר שמעו את הקול וקצרה רוחם ומעטה
נשמתם, ולא עצרו כח מן המעמד וקולות המחרידות, אמרו עוד <span style="color:#FFC000">ועתה
למה נמות כי תאכלנו האש הגדולה הזאת</span>. על כן אמרו <span style="color:#FFC000">קרב
אתה ושמע</span>, כי מעתה סר הספק בהשפעת הנבואה, כאמרם <span style="color:#FFC000">היום
הזה ראינו כי ידבר אלהים את האדם וחי: <o:p></o:p></span></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 5
        assert verse == [19, 20, 21, 22, 23]

    def test_chapter_24_verse_3_he(self):
        # 24:3
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red">24:3
ונתן</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">
<span style="color:red">בידה</span> - הטעם ברשותה. <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 24
        assert verse == [3]

        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">והנה האיש
מגרש ברצונו והאשה מגורשת בעל כרחה, ואולם יש גרושין שהדבר בהפך כאשר נתבאר בספר
מצות: <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter is None
        assert verse is None

    def test_chapter_24_verse_2_4_he(self):
        # 24:2-4
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red">4</span><span dir="LTR"></span><span dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red"><span dir="LTR"></span>-</span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red"><span dir="RTL"></span>24:2 והלכה והיתה לאיש אחר</span><span lang="HE" style="font-size:
12.0pt;font-family:&quot;Times New Roman&quot;,serif"> - כולל את המאורשה, הואיל ולשון
היות כולל את האירושין כאשר נאמר<span style="color:#FFC000"> ושנאה האיש האחרון</span><span style="color:red"> </span><span style="color:#FFC000">וכתב לה ספר כריתות.</span>
ואם אמר <span style="color:#FFC000">אחרי אשר הוטמאה</span>, הוא בעבור שבאה
ברשות אחר: <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 24
        assert verse == [2, 3, 4]

    def test_chapter_24_verse_24_he(self):
        # 24:24
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal"><b><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;mso-ascii-theme-font:
major-bidi;mso-hansi-theme-font:major-bidi">24:24 לֹֽא־יוּכַ֣ל בַּעְלָ֣הּ
הָֽרִאשׁ֣וֹן אֲשֶֽׁר־שִׁ֠לְּחָהּ לָשׁ֨וּב לְקַחְתָּ֜הּ לִֽהְי֧וֹת ל֣וֹ
לְאִשָּׁ֗ה אַֽחֲרֵי֙ אֲשֶׁ֣ר הֻטַּמָּ֔אָה כִּֽי־תוֹעֵבָ֥ה הִ֖וא לִפְנֵ֣י
יְהוָ֑ה וְלֹ֤א תַֽחֲטִיא֙ אֶת־הָאָ֔רֶץ אֲשֶׁר֙ יְהוָ֣ה אֱלֹהֶ֔יךָ נֹתֵ֥ן לְךָ֖
נַֽחֲלָֽה׃ </span></b><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif"><o:p></o:p></span></p>""",
                             'html5lib')

        chapter, verse = get_chapter_verse_he(html)

        assert chapter == 24
        assert verse == [24]


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
