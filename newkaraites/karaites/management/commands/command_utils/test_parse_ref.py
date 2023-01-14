from .parser_ref import parse_reference


class TestReferences:

    @staticmethod
    def test_references():
        assert parse_reference("""(שופטים י"ט, י"ב)""") == ('(Judges 19:12)', 'he')

        # a strange char \n in the ref
        assert parse_reference("""(שופטים
י"ט, י"ב)""") == ('(Judges 19:12)', 'he')

        # a strange char \n in the ref
        assert parse_reference("""(ויקרא כ"ב,
        כ"ד)""") == ('(Leviticus 22:24)', 'he')

        assert parse_reference("""(ויקרא י"ח, י"ז)""") == ('(Leviticus 18:17)', 'he')

        assert parse_reference("""(ויקרא י"ח, י')""") == ('(Leviticus 18:10)', 'he')

        assert parse_reference(r"""(תהילים קיט, ו)""") == ('(Psalms 119:6)', 'he')

        assert parse_reference(r"""(תהילים קיט, צד)""") == ('(Psalms 119:94)', 'he')

        assert parse_reference(r"""(תהילים קיט, פ)""") == ('(Psalms 119:80)', 'he')

        assert parse_reference(r"""(תהילים קיט, מז)""") == ('(Psalms 119:47)', 'he')

        assert parse_reference(r"""(תהילים כה, ד)""") == ('(Psalms 25:4)', 'he')

        assert parse_reference(r"""(דברים ל, כ)""") == ('(Deuteronomy 30:20)', 'he')

        assert parse_reference(r"""(ויקרא יא, מג)""") == ('(Leviticus 11:43)', 'he')

        assert parse_reference(r"""(תהליםקט"ז, י"ז)""") == ('(Psalms 7:17)', 'he')

        assert parse_reference(r"""(תהליםל"ז, ל"ו)""") == ('(Psalms 7:36)', 'he')

        # check the hebrew !
        # assert parse_reference(r"""(ישעיהוס"ב, ה')""") == ('(Isaiah 5:5)', 'he')

        # check the hebrew !
        assert parse_reference(r"""(שמות טו:כו)""") == ('(Exodus 15:26)', 'he')

        # check the hebrew !
        # assert parse_reference(r"""(דברי הימים א כא:כו-כז)""") == ('(I Chronicles 1:21)', 'he')

        # assert parse_reference(r"""(משליכ"ז, א')""") == '(Proverbs 17:1)'

        assert parse_reference("""(שיר השירים ג', י"א)""") == ('(Song of Songs 3:11)', 'he')

        # not recognized as bible reference
        assert parse_reference("""שמות כ, יא; שמות לא, יז""") == ('', '')

        # english refs
        assert parse_reference('(Leviticus 18:17)') == ('(Leviticus 18:17)', 'en')

        assert parse_reference('(Deuteronomy 30:20)') == ('(Deuteronomy 30:20)', 'en')

        # extra words in ref may be ignored
        # remove see -> ראה
        assert parse_reference('(ראה תהילים ז, י)') == ('(Psalms 7:10)','he')

        # abbreviations
        assert parse_reference('(Is. 5:5)') == ('(Isaiah 5:5)','en')

        assert parse_reference('(Ps. 17:6)') == ('(Psalms 17:6)','en')

        assert parse_reference('(Ex. 10: 26)') == ('(Exodus 10:26)','en')

        assert parse_reference('(Lev. 11:43)') == ('(Leviticus 11:43)','en')
