
// books in Tanakh, halakhah, liturgy
export interface booksObj {
    readonly [index:string]:string
}

export interface booksMenu {
    readonly [index:string]:booksObj
}

