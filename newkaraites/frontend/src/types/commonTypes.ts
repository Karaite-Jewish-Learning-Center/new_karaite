// liturgy
export interface bookDetails {
    'book_id': number,
    'book_first_level': number,
    'book_language': string,
    'book_classification': string,
    'book_title': string,
}


// books halakhah
export interface booksHalakhah {
    readonly [index: string]: {
        'book_id': string,
        'HebrewName': string,
        'Author': string,
        'Date Written': string,
        'Location': string,
        'Edition': string,
    }
}

// books in Tanakh, liturgy
export interface booksObj {
    readonly [index: string]: string
}

export interface booksMenu {
    readonly [index: string]: booksObj
}

export type BookType = 'bible' | 'karaites'

export interface BibleReference {
    refBook: string,
    refChapter: number,
    refVerse: number,
    refHighlight: number[]
}
