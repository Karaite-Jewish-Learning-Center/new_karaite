import requests

TEST_URL = 'http://localhost:8000/api'


class TestApiGetComment:
    url = f"{TEST_URL}/get-comments/"

    def test_comments_with_no_parameters(self):
        response = requests.get(self.url)

        assert response.status_code == 200
        assert response.json() == {"error": "Need a book name."}

    def test_comments_with_unknown_book_name(self):
        response = requests.get(f"{self.url}unknown/")

        assert response.status_code == 200
        assert response.json() == {"error": "Can't find book: unknown"}

    def test_comments_with_a_book_name_no_chapter(self):
        response = requests.get(f"{self.url}Deuteronomy/")

        assert response.status_code == 200
        assert response.json() == {"error": "Need a Chapter number"}

    def test_comments_with_a_book_name_with_invalid_chapter(self):
        response = requests.get(f"{self.url}Deuteronomy/-1/")

        assert response.status_code == 200
        assert response.json() == {"error": "Invalid chapter for the book:Deuteronomy chapter must be between 1 and 34"}

    def test_comments_with_a_book_name_with_invalid_chapter1(self):
        response = requests.get(f"{self.url}Deuteronomy/35/")

        assert response.status_code == 200
        assert response.json() == {"error": "Invalid chapter for the book:Deuteronomy chapter must be between 1 and 34"}

    def test_comments_with_a_book_name_with_valid_chapter(self):
        response = requests.get(f"{self.url}Deuteronomy/1/")

        assert response.status_code == 200
        # there is a better test for this !
        assert len(response.json()) >= 2

    def test_comments_with_a_book_name_with_valid_chapter_and_invalid_verse(self):
        response = requests.get(f"{self.url}Deuteronomy/1/-1/")

        assert response.status_code == 200
        result = {"error": "Invalid verse for the book:Deuteronomy chapter:1 must be between 1 and 46"}
        assert response.json() == result

    def test_comments_with_a_book_name_with_valid_chapter_and_invalid_verse1(self):
        response = requests.get(f"{self.url}Deuteronomy/1/47/")

        assert response.status_code == 200
        result = {"error": "Invalid verse for the book:Deuteronomy chapter:1 must be between 1 and 46"}
        assert response.json() == result

    def test_comments_with_a_book_name_with_valid_chapter_and_valid_verse(self):
        response = requests.get(f"{self.url}Deuteronomy/1/1/")

        assert response.status_code == 200
        result = response.json()['error']
        assert result == "no"

