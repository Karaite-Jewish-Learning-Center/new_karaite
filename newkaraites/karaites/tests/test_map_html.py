from ..comments_map import map_docx_to_karaites_html
from newkaraites.karaites.tests.html_sources import (html_1_1,
                                                     html_1_1_simplified,
                                                     foot_note_1_1,
                                                     html_1_1_2,
                                                     html_1_1_2_simplified,
                                                     foot_note_1_1_2
                                                     )


class TestMapHtml:

    def test_comments_html_rewrite_1_1(self):
        result = map_docx_to_karaites_html(html_1_1, foot_notes_list=foot_note_1_1, stats=True)

        assert result == html_1_1_simplified

    def test_comments_html_rewrite_1_1_2(self):
        result = map_docx_to_karaites_html(html_1_1_2, foot_notes_list=foot_note_1_1_2, stats=True)

        assert result == html_1_1_2_simplified
