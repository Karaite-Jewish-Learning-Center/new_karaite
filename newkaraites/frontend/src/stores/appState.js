import {makeAutoObservable, runInAction} from "mobx"


class AppState {
    // mains panes bible book , comment, karaites books etc
    panes = []
    // only true when last pane is closed
    isLastPane = false
    // messages
    message = ''
    // search
    search = ''
    searchResultData = []
    moreResults = true

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

    // book , chapter , verse
    setBook = (book, i) => {
        this.panes[i].book = book
    }
    getBook = (i) => this.panes[i].book

    setChapter = (chapter, i) => {
        this.panes[i].chapter = parseInt(chapter)
    }
    getChapter = (i) => this.panes[i].chapter

    setVerse = (verse, i) => {
        runInAction(() => {
            this.panes[i].verse = verse
        })
    }
    getVerse = (i) => this.panes[i].verse

    getVerses = (i) => this.panes[i].verses

    setVerseData = (data, i) => {
        runInAction(() => {
            this.panes[i].verseData = data
        })
    }

    getVerseData = (i) => this.panes[i].verseData

    setBookData = (data, i) => {
        this.panes[i].bookData = [...this.panes[i].bookData, ...data]
    }
    getBookData = (i) => this.panes[i].bookData

    setDistance = (distance, i) => {
        this.panes[i].distance = distance
    }
    getDistance = (i) => this.panes[i].distance

    setCurrentItem = (item, i) => {
        runInAction(() => {
            this.panes[i].currentItem = item
        })
    }

    getCurrentItem = (i) => this.panes[i].currentItem

    // right pane
    // comments
    setRightPaneState = (state, i) => {
        this.panes[i].rightPaneState = state
    }
    getRightPaneState = (i) => this.panes[i].rightPaneState || [1]


    // panes
    setPanes = (pane) => {
        this.panes = [...this.panes, pane]
    }

    getPanes = () => this.panes

    getPaneNumber = (book) => {
        return this.panes.findIndex(pane =>
            pane.book === book
        )
    }
    getPaneByNumber = (i) => this.panes[i]

    setIsLastPane = (state) => {
        runInAction(() => {
            this.isLastPane = state
        })
    }
    getIsLastPane = () => this.isLastPane

    isPaneOpen = (book) => this.getPanes().some((pane) => pane.book === book)

    closePane = (i) => {
        this.panes.splice(i, 1)
        this.setIsLastPane(this.panes.length === 0)
    }

    resetPanes = () => {
        this.panes = []
    }

    // karaites books
    setParagraphs = (paragraphs, i) => {
        this.panes[i].paragraphs = [...this.panes[i].paragraphs, ...paragraphs]
    }

    getParagraphs = (i) => this.panes[i].paragraphs

    getKaraitesChapter = (i) => (this.panes[i].paragraphs.length === 0 ? this.panes[i].chapter : this.panes[i].paragraphs.length)

    setBookDetails = (details, i) => {
        this.panes[i].book_details = details
    }
    getBookDetails = (i) => this.panes[i].book_details


    // messages
    setMessage = (message) => {
        this.message = message
    }
    getMessage = () => this.message

    // header chapters
    setHeaderChapter = (chapter, i) => {
        runInAction(() => {
            this.panes[i].headerChapter = chapter
        })
    }
    getHeaderChapter = (i) => this.panes[i].headerChapter

    // search arg
    setSearch = (searchArg) => {
        debugger
        this.search = searchArg
        this.searchResultData = []
        this.moreResults = true
    }

    getSearch = () => this.search

    // search result
    setSearchResultData = (result) => this.searchResultData = [...this.searchResultData, ...result]
    getSearchResultData = () => this.searchResultData

    // search page
    // autocomplete communicates with searchResult
    setMoreResults = (more) => {
        this.moreResults = more
    }
    getMoreResults = () => this.moreResults

    // language
    setLanguage = (language, i) => this.panes[i].languages = language
    getLanguage = (i) => this.panes[i].languages[0]

    nextLanguage = (i) => {
        return this.panes[i].languages.push(this.panes[i].languages.shift())
    }

}

const appStore = () => {
    return new AppState()
}


export default appStore