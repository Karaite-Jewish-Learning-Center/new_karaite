import {makeAutoObservable, runInAction, computed, observable} from "mobx"
import {isABibleBook} from "../utils/utils";
import {autocompleteUrl} from "../constants/constants";
import {AUDIO, END_AUDIO_BOOK} from "../constants/constants";


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

    setRefsChapterVerse = (chapter: number, verse: number, paneNumber: number): void => {
        this.panes[paneNumber].refsChapterVerse = [chapter, verse]
    }

    getBookChapterVerse = (i: number) => `(${this.panes[i].book} ${this.panes[i].refsChapterVerse[0]}:${this.panes[i].refsChapterVerse[1]})`

    getAudioBookStarAndStop = (i: number) => {
        if (this.panes[i].bookData === undefined || this.panes[i].bookData.length === 0) {
            return [0, 0]
        }
        return JSON.parse(this.panes[i].bookData[this.getCurrentItem(i)][AUDIO])
    }

    isAudioBook = (i: number) => this.getAudioBookStarAndStop(i)[END_AUDIO_BOOK] !== 0

    getBook = (i: number): string => this.panes[i].book


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

    // right pane bible references
    setRightPaneState = (state: boolean, i: number): void => {
        this.panes[i].rightPaneState = state
    }

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


    closePane = (i: number): void => {
        runInAction(() => {
            this.panes.splice(i, 1)
        })
    }

    resetPanes = (): void => {
        this.panes = []
    }
    // loading

    setLoading = (loading: boolean): void => {
        runInAction(() => {
            this.loading = loading
        })

    }
    getLoading = (): boolean => this.loading

    // karaites books
    setParagraphs = (paragraphs: Array<any>, i: number): void => {
        // this.panes[i].paragraphs = [...this.panes[i].paragraphs, ...paragraphs]
        this.panes[i].paragraphs = paragraphs
    }

    getParagraphs = (i: number): Array<any> => this.panes[i].paragraphs


    setBookDetails = (details: object, i: number): void => {
        runInAction(() => {
            this.panes[i].book_details = details
        })
    }
    getBookDetails = (i: number): object => {
        return this.panes[i].book_details
    }

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