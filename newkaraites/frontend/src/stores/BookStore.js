import { makeObservable, observable } from "mobx"


class BookStore {
    bookName = ''
    chapter = []
    verse = 0

    constructor(chapter) {
        makeObservable(this, {
            BookName: observable,
            chapter: observable,
            verse: observable
        })
        this.BibleChapter = chapter
    }
    updateChapter(chapter) {
        this.chapter = chapter
        console.log('current chapter:', this.chapter)
    }
    updateVerse(verse) {
        this.verse = verse
        console.log('current verse:', this.verser)
    }
    currentChapter() {
        console.log('get current chapter:', this.chapter)
        return this.chapter

    }
}
const store = new BookStore()

export default store