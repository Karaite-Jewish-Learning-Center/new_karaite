import requests

TEST_URL = 'http://localhost:8000/api'


class TestApiGetComment:
    """Must run books first to populate comments table"""
    url = f"{TEST_URL}/get-comments/"

    def test_comments_with_no_parameters(self):
        response = requests.get(self.url)

        assert response.status_code == 400
        assert response.json()['message'] == "Need a book name."

    def test_comments_with_unknown_book_name(self):
        response = requests.get(f"{self.url}unknown/")

        assert response.status_code == 400
        assert response.json()['message'] == "Can't find book: unknown"

    def test_comments_with_a_book_name_no_chapter(self):
        response = requests.get(f"{self.url}Deuteronomy/")

        assert response.status_code == 200
        assert len(response.json()['comments']) == 899

    def test_comments_with_a_book_name_with_invalid_chapter(self):
        response = requests.get(f"{self.url}Deuteronomy/-1/")

        assert response.status_code == 400
        assert response.json()['message'] == "Invalid chapter for the book:Deuteronomy chapter must be between 1 and 34"

    def test_comments_with_a_book_name_with_invalid_chapter1(self):
        response = requests.get(f"{self.url}Deuteronomy/35/")

        assert response.status_code == 400
        assert response.json()['message'] == "Invalid chapter for the book:Deuteronomy chapter must be between 1 and 34"

    def test_comments_with_a_book_name_with_valid_chapter(self):
        response = requests.get(f"{self.url}Deuteronomy/1/")

        assert response.status_code == 200
        assert response.json()['comments'][0]['book_title_en'] == 'Deuteronomy'
        # There are 43 comments on Deuteronomy chapter 1
        assert len(response.json()['comments']) == 43

    def test_comments_with_a_book_name_with_valid_chapter_and_invalid_verse(self):
        response = requests.get(f"{self.url}Deuteronomy/1/-1/")

        assert response.status_code == 400
        message = "Invalid verse for the book:Deuteronomy chapter:1 must be between 1 and 46"
        assert response.json()['message'] == message

    def test_comments_with_a_book_name_with_valid_chapter_and_invalid_verse1(self):
        response = requests.get(f"{self.url}Deuteronomy/1/47/")

        assert response.status_code == 400
        message = "Invalid verse for the book:Deuteronomy chapter:1 must be between 1 and 46"
        assert response.json()['message'] == message

    def test_comments_with_a_book_name_with_valid_chapter_and_valid_verse(self):
        response = requests.get(f"{self.url}Deuteronomy/1/1/")

        assert response.status_code == 200
        assert response.json()['comments'][0]['book_title_en'] == 'Deuteronomy'
