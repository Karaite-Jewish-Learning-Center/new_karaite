import { makeObservable, observable } from "mobx"


class BibleStore {
    BibleChapter = ''

    constructor(chapter) {
        makeObservable(this, {
            BibleChapter: observable,
        })
        this.BibleChapter = chapter
    }
    updateChapter(chapter) {
        this.BibleChapter = chapter
        console.log('current chapter:',this.BibleChapter)
    }
    currentChapter() {
        console.log('get current chapter:', this.BibleChapter)
        return this.BibleChapter

    }
}
const store = new BibleStore()

export default store