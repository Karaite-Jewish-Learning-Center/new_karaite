// liturgy
export interface BookDetails {
    'book_id': number,
    'book_first_level': number,
    'book_language': string,
    'book_classification': string,
    'book_title': string,
}

// books halakhah
// export interface BooksHalakhah {
//     readonly [index: string]: {
//         'book_id': string,
//         'HebrewName': string,
//         'Author': string,
//         'Date Written': string,
//         'Location': string,
//         'Edition': string,
//     }
// }

// books in Tanakh, liturgy
export interface BooksObj {
    readonly [index: string]: string
}

export interface BooksMenu {
    readonly [index: string]: BooksObj
}

export type BookType = 'bible' | 'karaites'

export interface BibleReference {
    refBook: string,
    refChapter: number,
    refVerse: number,
    refHighlight: number[]
}

export type ClosePanes = (paneNumber: number) => void

export type RefClick = (item: any, kind: BookType, paneNumber: number, e: Event) => void

export type PaneNumber = (paneNumber: number) => void

export type  MessageReason = 'error' | 'warning' | 'info' | 'success' | 'search'

export type CallBack = (() => void) | ((n: number) => void)
