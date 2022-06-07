import {makeAutoObservable, runInAction, computed, observable} from "mobx"
import {isABibleBook} from "../utils/utils";
import {autocompleteUrl} from "../constants/constants";


class AppState {
    // mains panes bible book , comment, karaites books etc
    panes: Array<any> = []
    // loading state
    loading = false
    // search
    search: string = ''
    searchResultData: Array<string> = []
    moreResults: boolean = true

    // autocomplete
    options: Array<any> = []

    constructor() {
        makeAutoObservable(this, {
            panes: observable,
            loading: observable,
            search: observable,
            searchResultData: observable,
            moreResults: observable,
            options: observable,
            isLastPane: computed,
        })

    }

    setIsRightPaneOpen = (state: boolean, paneNumber: number): void => {
        this.panes[paneNumber].isRightPaneOpen = state
    }

    getIsRightPaneOpen = (paneNumber: number): boolean => {
        return this.panes[paneNumber].isRightPaneOpen
    }

    // comment Tab
    setCommentTab = (tab: string, paneNumber: number): void => {
        this.panes[paneNumber].commentTab = tab
    }
    getCommentTab = (paneNumber: number): string => this.panes[paneNumber].commentTab

    setComments = (comments: Array<string>, paneNumber: number): void => {
        this.panes[paneNumber].comments = comments
    }

    getComments = (paneNumber: number): Array<any> => this.panes[paneNumber].comments

    setCommentsChapter = (chapter: number, paneNumber: number): void => {
        this.panes[paneNumber].commentsChapter = chapter
    }
    getCommentsChapter = (paneNumber: number): void => this.panes[paneNumber].commentsChapter

    setCommentsVerse = (verse: number, paneNumber: number): void => {
        this.panes[paneNumber].commentsVerse = verse
    }
    getCommentsVerse = (paneNumber: number): void => this.panes[paneNumber].commentsVerse

    getBook = (i: number): string => this.panes[i].book

    setChapter = (chapter: string, i: number): void => {
        this.panes[i].chapter = parseInt(chapter)
    }

    setVerse = (verse: number, i: number): void => {
        runInAction(() => {
            this.panes[i].verse = verse
        })
    }
    getVerse = (i: number): number => this.panes[i].verse

    getVerses = (i: number): Array<string> => this.panes[i].verses

    setVerseData = (data: Array<any>, i: number): void => {
        runInAction(() => {
            this.panes[i].verseData = data
        })
    }

    getVerseData = (i: number): Array<any> => this.panes[i].verseData

    setBookData = (data: Array<any>, i: number): void => {
        this.panes[i].bookData = [...this.panes[i].bookData, ...data]
    }

    getBookData = (i: number): Array<any> => this.panes[i].bookData

    setDistance = (distance: number, i: number): void => {
        this.panes[i].distance = distance
    }
    getDistance = (i: number): number => this.panes[i].distance

    setCurrentItem = (item: number, i: number): number => {
        runInAction(() => {
            this.panes[i].currentItem = item
        })
        return item
    }

    getCurrentItem = (i: number): number => this.panes[i].currentItem

    // right pane
    // comments
    setRightPaneState = (state: boolean, i: number): void => {
        this.panes[i].rightPaneState = state
    }
    getRightPaneState = (i: number): Array<number> => this.panes[i].rightPaneState || [1]

    // panes
    setPanes = (pane: number): void => {
        runInAction(() => {
            this.panes = [...this.panes, pane]
        })
    }

    getPanes = (): Array<any> => this.panes

    get isLastPane() {
        return this.panes.length === 0
    }

    isPaneOpen = (book: string, chapter: number, verse: number): boolean =>
        this.getPanes().some((pane) => pane.book === book && pane.chapter === chapter - 1 && pane.verse === verse)

    isBookOpen = (book: string): boolean =>
        this.getPanes().some((pane) => pane.book === book)

    closePane = (i: number): void => {
        console.log('Panes length before', this.panes.length)
        runInAction(() => {
            this.panes.splice(i, 1)
        })
        console.log('Panes length after', this.panes.length)
    }

    resetPanes = (): void => {
        this.panes = []
    }
    // loading

    setLoading = (loading: boolean): void => {
        this.loading = loading
    }
    getLoading = (): boolean => this.loading

    // karaites books
    setParagraphs = (paragraphs: Array<any>, i: number): void => {
        console.log('setParagraphs', paragraphs)
        this.panes[i].paragraphs = [...this.panes[i].paragraphs, ...paragraphs]
    }

    getParagraphs = (i: number): Array<any> => this.panes[i].paragraphs

    getKaraitesChapter = (i: number): number =>
        (this.panes[i].paragraphs.length === 0 ? this.panes[i].chapter : this.panes[i].paragraphs.length)

    setBookDetails = (details: object, i: number): void => {
        console.log('setBookDetails', details)
        runInAction(() => {
            this.panes[i].book_details = details
        })
    }
    getBookDetails = (i: number): object => {
        console.log('getBookDetails', this.panes[i].book_details)
        return this.panes[i].book_details
    }

    setBookTOC = (toc: string, i: number): void => {
        this.panes[i].TOC = toc
    }
    getBookTOC = (i: number): Array<any> => this.panes[i].TOC

    // header chapters
    setHeaderChapter = (chapter: number, i: number): void => {
        runInAction(() => {
            this.panes[i].headerChapter = chapter
        })
    }
    // getHeaderChapter = (i: number): string => this.panes[i].headerChapter

    // search arg
    setSearch = (searchArg: string): void => {
        this.search = searchArg
        this.searchResultData = []
        this.moreResults = true
    }

    getSearch = (): string => this.search

    // search result
    setSearchResultData = (result: Array<string>): Array<string> =>
        this.searchResultData = [...this.searchResultData, ...result]

    getSearchResultData = (): Array<string> => this.searchResultData

    // search page
    // autocomplete communicates with searchResult
    setMoreResults = (more: boolean): void => {
        this.moreResults = more
    }
    getMoreResults = (): boolean => this.moreResults


    // autocomplete
    setOptions = (options: Array<string>): void => {
        this.options = options
    }

    getOptions = (): Array<string> => this.options

    getAutoComplete = async (search: string) => {
        if (search.length < 2) return []
        if (isABibleBook(search)) return []
        const response = await fetch(`${autocompleteUrl}${search}/`)
        this.setOptions(await response.json())
    }


    // language
    setLanguage = (language: string, i: number): void => {
        this.panes[i].languages = language
    }
    getLanguage = (i: number): string => this.panes[i].languages[0]

    nextLanguage = (i: number): Array<string> => this.panes[i].languages.push(this.panes[i].languages.shift())

}

const appStore = () => {
    return new AppState()
}


export default appStore