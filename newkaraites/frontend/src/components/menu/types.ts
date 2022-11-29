export type songs = {
    'song_title': string,
    'song_file': string,
}

export type bookDetails = {
    'book_id': number,
    'book_first_level': string,
    'book_language': string,
    'book_classification': string,
    'author': string,
    'book_title_en': string,
    'book_title_he': string,
    'table_book': boolean,
    'columns': string,
    'columns_order': string,
    'toc_columns': string,
    'toc': string[],
    'intro': string,
    'direction': 'rtl' | 'ltr',
    'remove_class': string,
    'remove_tags': string,
    'multi_tables': boolean,
    'songs_list': songs[],
    'buy_link': string,
    'index_lag': boolean,
}