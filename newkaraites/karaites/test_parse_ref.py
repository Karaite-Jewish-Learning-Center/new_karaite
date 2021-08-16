from .parser_ref import parse_reference


class TestReferences():

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
