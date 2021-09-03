import { makeAutoObservable } from "mobx"

class AppState {
    // right panel
    isRightPaneOpen = false

    // mains panes bible book , comment, karaites books etc
    panes = []

    constructor() {
        makeAutoObservable(this)
    }

    setRightPaneState = (state, i) => {
        this.rightPaneState = state
        console.log(this.rightPaneState)
    }
    getRightPaneState = () => {
        return this.rightPaneState
    }
    setIsRightPaneOpen = (state) => {
        this.isRightPaneOpen = state
        console.log("setting isRightPaneOPne", this.isRightPaneOpen)
    }
    getIsRightPaneOpen = () => {
        return this.isRightPaneOpen
    }

    // book , chapter , verse

    setBook = (book, i) => {
        this.panes[i].book = book
    }
    getBook = (i) => this.panes[i].book

    setChapter = (chapter, i) => {
        this.panes[i].chapter = parseInt(chapter)
    }
    getChapter = (i) => parseInt(this.panes[i].chapter)

    setVerse = (verse, i) => {
        this.panes[i].verse = verse
    }
    getVerse = (i) => this.panes[i].verse

    getVerses = (i) => this.panes[i].verses

    setVerseData = (data, i) => {
        this.panes[i].verseData = data
    }

    getVerseData = (i) => this.panes[i].verseData

    // panes

    isLastPane = () => this.panes.length === 0

    setPanes = (pane) => {
        this.panes = [...this.panes, pane]
    }

    getPanes = () => this.panes

    getPaneByNumber = (i) => this.panes[i]

    closePane = () => {
        this.panes.splice(this.currentPane, 1)
    }


}



const store = new AppState()

export default store