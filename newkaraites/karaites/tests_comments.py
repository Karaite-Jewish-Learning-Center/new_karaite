from bs4 import BeautifulSoup
from .html_utils import get_chapter_verse_he


class TestCommentsParagraph:

    @staticmethod
    def test_comment_1_3():
        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:326.0pt 460.7pt"><span dir="RTL"></span><span lang="HE" style="font-size:
12.0pt;font-family:&quot;Times New Roman&quot;,serif;color:red;position:relative;
top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>1:3</span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:relative;
top:-2.0pt;mso-text-raise:2.0pt"><span style="mso-spacerun:yes">&nbsp;</span><span style="color:red">דבר משה אל בני ישראל ככל אשר צוה ה' אותו אליהם</span></span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
color:red;position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span><span style="mso-spacerun:yes">&nbsp;</span></span><span dir="RTL"></span><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:relative;
top:-2.0pt;mso-text-raise:2.0pt"><span dir="RTL"></span>- הם עניני המצות. <o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)
        color = str(html).find("color:red") > 0

        assert chapter == 1
        assert verse == [3]
        assert color

        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:326.0pt 460.7pt"><span lang="HE" style="font-size:12.0pt;font-family:
&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;mso-text-raise:2.0pt">הואיל
והאדם תכליתו להשלים חלקי הרכבתו במה שהיתה התכלית למציאותו, והשם ית' שמו בראותו
כי האדם מהשלמת טבעו לא יזכה, להשיג תכליתו השרה נבואתו במין האדם והזהירו פן יפן
אל אָוֶן (ע״פ איוב לו:כא), והאדם באולתו סלף דרכו וגורש מגן עדן בהמשך אחרי
תאותיו. ועור<span style="color:red"> </span>עיני השכל להבין המושכלות ונשאר לְהִמָּשֵׁךְ
אחרי המורגש בידיעת המדומים. וזה הכשלון הביא וכחשו לאל ממעל, כאשר ראו כי העולם
כמנהגו נוהג והויתו והפסדו נמשכים אחרי תנועות הפלכיות, לא עבר שׂכלם למעלה מן
הגלגל. וכשרצה השם לתת תקנה במין האדם מזה הכשלון, כאשר זרח אור הגנוז אברהם אבינו
ע"ה והופיע מציאותו ית', בחר לזרעו אחריו. </span><span dir="LTR"></span><span lang="HE" dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;
position:relative;top:-2.0pt;mso-text-raise:2.0pt"><span dir="LTR"></span><span style="mso-spacerun:yes">&nbsp;</span></span><span dir="LTR" style="font-size:12.0pt;
font-family:&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;mso-text-raise:
2.0pt"><o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)
        color = str(html).find("color:red") > 0

        assert chapter is None
        assert verse is None
        assert color

        html = BeautifulSoup("""<p class="MsoNormal" dir="RTL" style="text-align:justify;line-height:normal;
tab-stops:326.0pt 460.7pt"><span lang="HE" style="font-size:12.0pt;font-family:
&quot;Times New Roman&quot;,serif;position:relative;top:-2.0pt;mso-text-raise:2.0pt">על
כן בחר הש"י אומה מיוחדת הם זרע אברהם עבדו בני יעקב בחיריו (ע״פ תהלים קה:ו)
הנקראים בשמו ככתוב <span style="color:#FFC000">כל הנקרא בשמי ולכבודי בראתיו</span><span style="color:#0070C0"> (ישעיה מג:ז)</span>. והוציאם מארץ מצרים על ידי אותות
ונפלאות לתת להם ארץ חמדה, נחלת צבי צבאות גוים (ע״פ ירמיהו ג:יט), מפני המרי
העצום שֶׁמָּרוּ ונתחיבו כליה, לקחת מוסר השכל פן יקרה להם למי שמרה והפליג בְּעָוֶל.
והנחילם בסיני תורתו במעמד הנורא, ונתן להם מצות, וחקים, ומשפטים צדיקים לתקן
ישובם ולהתמיד קיומם, ונהל דעותיהם ביחוד מקום השכינה וקדוש זמנים בענינים מעשיים
להתמיד ידיעת הנפלאות, שהם מצורפים בהשגחה המופתית לקיום ידיעתו ית'. </span><span dir="LTR" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif;position:
relative;top:-2.0pt;mso-text-raise:2.0pt"><o:p></o:p></span></p>""", 'html5lib')

        chapter, verse = get_chapter_verse_he(html)
        color = str(html).find("color:red") > 0

        assert chapter is None
        assert verse is None
        assert not color

    @staticmethod
    def test_center_titles():
        html = BeautifulSoup("""<p class="MsoNormal" align="center" dir="RTL" style="text-align:center;line-height:
normal"><span lang="HE" style="font-size:12.0pt;font-family:&quot;Times New Roman&quot;,serif">___________________<o:p></o:p></span></p>""",
                             'html5lib')

        child = html.find_all("p", class_="MsoNormal")

        assert child[0].attrs.get('align', None) == "center"
