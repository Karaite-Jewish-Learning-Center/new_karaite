import requests

base_url = 'http://localhost:8000/api/v1/'


def test_api():
    # Test GetFirstLevel view
    response = requests.get(base_url + 'get-first-level/')
    assert response.status_code == 200

    # Test GetBookAsArrayJson view
    response = requests.get(base_url + 'get-book-chapter/Genesis/1/0/')
    assert response.status_code == 200

    # Test AudioBook view
    response = requests.get(base_url + 'audio-book/Genesis/')
    assert response.status_code == 200

    # Test GetKaraitesBookAsArray view
    response = requests.get(base_url + 'get-karaites-book-chapter/Sefer%20HaKuzari/1/0/')
    assert response.status_code == 200

    # Test GetKaraitesAllBookDetails view
    response = requests.get(base_url + 'get-karaites-book-details/')
    assert response.status_code == 200

    # Test GetTOC view
    response = requests.get(base_url + 'get-karaites-book-toc/Sefer%20HaKuzari/')
    assert response.status_code == 200

    # Test GetByLevel view
    response = requests.get(base_url + 'get-karaites-books-by-level/1/')
    assert response.status_code == 200

    # Test GetByLevelAndByClassification view
    response = requests.get(base_url + 'get-karaites-books-by-level-and-classification/1/')
    assert response.status_code == 200

    # Test GetBiBleReferencesByLaw view
    response = requests.get(base_url + 'get-bible-references/Genesis%201/Orach%20Chaim/')
    assert response.status_code == 200

    # Test GetBiBleReferences view
    response = requests.get(base_url + 'get-bible-references/Genesis%201/')
    assert response.status_code == 200

    # Test GetHalakhah view
    response = requests.get(base_url + 'get-references/Sefer%20HaKuzari/1/1/')
    assert response.status_code == 200

    # A very simple test that shows the API is alive
    response = requests.get(base_url + 'test/')
    assert response.status_code == 200

    # Test AutoCompleteView view
    response = requests.get(base_url + 'autocomplete/test/')
    assert response.status_code == 200

    # Test Search view
    response = requests.get(base_url + 'search/test/')
    assert response.status_code == 200
    response = requests.get(base_url + 'search/test/1/')
    assert response.status_code == 200
