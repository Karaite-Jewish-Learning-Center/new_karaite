import { makeAutoObservable, runInAction } from "mobx"

class AppState {
    // mains panes bible book , comment, karaites books etc
    panes = []
    // only true when last pane is closed
    isLastPane = false
    // messages
    message = ''

    constructor() {
        makeAutoObservable(this)
    }

    setIsRightPaneOpen = (state, paneNumber) => {
        this.panes[paneNumber].isRightPaneOpen = state
    }

    getIsRightPaneOpen = (paneNumber) => {
        return this.panes[paneNumber].isRightPaneOpen
    }


    // comment Tab
    setCommentTab = (tab, paneNumber) => {
        this.panes[paneNumber].commentTab = tab
    }
    getCommentTab = (paneNumber) => this.panes[paneNumber].commentTab

    setComments = (comments, paneNumber) => {
        this.panes[paneNumber].comments = comments
    }
    getComments = (paneNumber) => this.panes[paneNumber].comments

    hasNoComments = (paneNumber) => this.panes[paneNumber].comments.length === 0

    setCommentsChapter = (chapter, paneNumber) => {
        this.panes[paneNumber].commentsChapter = chapter
    }
    getCommentsChapter = (paneNumber) => this.panes[paneNumber].commentsChapter

    setCommentsVerse = (verse, paneNumber) => {
        this.panes[paneNumber].commentsVerse = verse
    }
    getCommentsVerse = (paneNumber) => this.panes[paneNumber].commentsVerse

    needUpdateComment = (chapter, verse, paneNumber) => {
        return this.getCommentsChapter(paneNumber) !== chapter || this.getCommentsVerse(paneNumber) !== verse
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
        runInAction(() => { this.panes[i].verse = verse })
    }
    getVerse = (i) => this.panes[i].verse

    getVerses = (i) => this.panes[i].verses

    setVerseData = (data, i) => {
        runInAction(() => { this.panes[i].verseData = data })
    }

    getVerseData = (i) => this.panes[i].verseData

    setDistance = (distance, i) => {
        this.panes[i].distance = distance
    }
    getDistance = (i) => this.panes[i].distance

    setCurrentItem = (item, i) => {
        console.log("setting current item", item)
        runInAction(() => { this.panes[i].currentItem = item })
    }

    getCurrentItem = (i) => this.panes[i].currentItem

    // right pane
    // comments
    setRightPaneState = (state, i) => {
        this.panes[i].rightPaneState = state
    }
    getRightPaneState = (i) => this.panes[i].rightPaneState


    // panes

    setPanes = (pane) => {
        this.panes = [...this.panes, pane]
    }

    getPanes = () => this.panes

    getPaneNumber = (book, chapter) => {
        return this.panes.findIndex(pane =>
            pane.book === book && pane.chapter === chapter
        )
    }
    getPaneByNumber = (i) => this.panes[i]

    setIsLastPane = (state) => {
        runInAction(() => { this.isLastPane = state })
    }
    getIsLastPane = () => this.isLastPane

    closePane = (i) => {
        this.panes.splice(i, 1)
        this.setIsLastPane(this.panes.length === 0)
    }

    // karaites books

    setParagraphs = (paragraphs, i) => {

        this.panes[i].paragraphs = [...this.panes[i].paragraphs, ...paragraphs]
        debugger
    }

    setBookDetails = (details, i) => {
        this.panes[i].book_details = details
    }
    getBookDetails = (i) => this.panes[i].book_details


    // messages
    setMessage = (message) => {
        this.message = message
    }
    getMessage = () => this.message

}



const store = new AppState()

export default store