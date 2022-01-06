from .utils import mark_bible_refs


class TestMarkBibleRes:

    @staticmethod
    def test_refs():
        before = """(</span><span class="span-157" lang="AR-SA">תהילים\nקיט, צדz)"""
        after = """</span><span lang="HE" class="he-biblical-ref">(תהילים\nקיט, צדz)"""

        assert mark_bible_refs(before) == after
        # before = """(</span><span class="span-157" lang="AR-SA">תהילים קיט, מז)"""
        # after = """</span><span lang="HE" class="he-biblical-ref">(תהילים קיט, מז)"""
        # assert mark_bible_refs(before) == after
        #
        # before = """'(שמזכירם הרב בפתיחת המצות)'"""
        # assert mark_bible_refs(before) == before
        #
        # before = """(</span><span class="span-157" lang="AR-SA">תהילים קיט, מז)"""
        # after = """</span><span lang="HE" class="he-biblical-ref">(תהילים קיט, מז)"""
        # assert mark_bible_refs(before) == after
        #
        # before = """(</span><span class="span-157" lang="AR-SA">תהילים יט, ח</span><span class="span-123" lang="AR-SA">)"""
        # after = """</span><span lang="HE" class="he-biblical-ref">(תהילים יט, ח)</span><span class="span-123" lang="AR-SA">"""
        # assert mark_bible_refs(before) == after
        #
        # before = """(ויקרא יא, מג)"""
        # after = """(ויקרא יא, מג)"""
        # assert mark_bible_refs(before) == after
