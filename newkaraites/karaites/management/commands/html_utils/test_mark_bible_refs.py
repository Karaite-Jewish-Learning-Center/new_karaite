from .utils import mark_bible_refs


class TestMarkBibleRes:

    @staticmethod
    def test_refs():
        after = """</span><span lang="HE" class="he-biblical-ref">(תהילים\nקיט, צדz)"""
        before = """(</span><span class="span-125" lang="AR-SA">תהילים\nקיט, צדz)"""
        assert mark_bible_refs(before) == after

        after = """</span><span lang="HE" class="he-biblical-ref">(תהילים קיט, מז)"""
        before = """(</span><span class="span-125" lang="AR-SA">תהילים קיט, מז)"""
        assert mark_bible_refs(before) == after

        before = """'(שמזכירם הרב בפתיחת המצות)'"""
        assert mark_bible_refs(before) == before

        after = """</span><span lang="HE" class="he-biblical-ref">(תהילים קיט, מז)"""
        before = """(</span><span class="span-125" lang="AR-SA">תהילים קיט, מז)"""
        assert mark_bible_refs(before) == after

        after = """</span><span lang="HE" class="he-biblical-ref">(תהילים יט, ח)</span><span class="span-123" lang="AR-SA">"""
        before = """(</span><span class="span-125" lang="AR-SA">תהילים יט, ח</span><span class="span-123" lang="AR-SA">)"""
        assert mark_bible_refs(before) == after

        after = """(ויקרא יא, מג)"""
        before = """(ויקרא יא, מג)"""
        assert mark_bible_refs(before) == 'after'
