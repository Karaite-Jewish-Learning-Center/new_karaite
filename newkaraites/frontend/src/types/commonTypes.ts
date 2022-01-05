
// books halakhah
export interface booksHalakhah {
    readonly [index:string]: {
        'book_id':string,
        'HebrewName':string,
        'Author':string,
        'Date Written':string,
        'Location': string,
        'Edition': string,
        'introduction':string,
    }
}

export interface booksMenuHalakhah {
    readonly [index:string]:booksHalakhah
}

// books in Tanakh, liturgy
export interface booksObj {
    readonly [index:string]:string
}

export interface booksMenu {
    readonly [index:string]:booksObj
}

