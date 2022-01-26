def read_data(path, book_name, source_path):
    handle = open(f'{source_path}{path}{book_name}', 'r')
    book = handle.read()
    handle.close()
    return book


def write_data(path, book_name, book, source_path):
    handle = open(f'{source_path}{path}{book_name}', 'w')
    handle.write(book)
    handle.close()
