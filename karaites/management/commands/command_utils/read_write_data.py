def read_data(path, book_name, source_path):
    # just try to open the file  with following codecs
    for codec in ['utf-8', 'utf-16', 'utf-32']:
        try:
            handle = open(f'{source_path}{path}{book_name}', 'r', encoding=codec)
            book = handle.read()
            handle.close()
            return book
        except UnicodeDecodeError:
            continue
    return None


def write_data(path, book_name, book, source_path):
    handle = open(f'{source_path}{path}{book_name}', 'w')
    handle.write(book)
    handle.close()
