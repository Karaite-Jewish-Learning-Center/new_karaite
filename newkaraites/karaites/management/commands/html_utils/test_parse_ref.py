from .parser_ref import parse_reference


class TestReferences:

    @staticmethod
    def test_references():

        assert parse_reference("""(שופטים י"ט, י"ב)""") == '(Judges 19:12)'

        # a strange char \n in the ref
        assert parse_reference("""(שופטים
י"ט, י"ב)""") == '(Judges 19:12)'

        # a strange char \n in the ref
        assert parse_reference("""(ויקרא כ"ב,
כ"ד)""") == '(Leviticus 22:24)'

        assert parse_reference("""(שיר השירים ג', י"א)""") == '(Song of Songs 3:11)'

        assert parse_reference("""(ויקרא י"ח, י"ז)""") == '(Leviticus 18:17)'

        assert parse_reference("""(ויקרא י"ח, י')""") == '(Leviticus 18:10)'

        assert parse_reference(r"""(תהילים קיט, ו)""") == '(Psalms 119:6)'

        assert parse_reference(r"""(תהילים קיט, צד)""") == '(Psalms 119:94)'

        assert parse_reference(r"""(תהילים קיט, פ)""") == '(Psalms 119:80)'

        assert parse_reference(r"""(תהילים קיט, מז)""") == '(Psalms 119:47)'

        assert parse_reference(r"""(תהילים כה, ד)""") == '(Psalms 25:4)'

        assert parse_reference(r"""(דברים ל, כ)""") == '(Deuteronomy 30:20)'

        assert parse_reference(r"""(ויקרא יא, מג)""") == '(Leviticus 11:43)'

        # not recognized as bible reference
        assert parse_reference("""שמות כ, יא; שמות לא, יז""") == ''
