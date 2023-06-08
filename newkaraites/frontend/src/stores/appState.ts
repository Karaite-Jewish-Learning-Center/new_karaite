import {makeAutoObservable, runInAction, computed, observable} from "mobx"
import {
    AUDIO,
    END_AUDIO_BOOK,
    AUDIO_BOOK_ID,
    BETTER_START_AUDIO,
    BETTER_END_AUDIO,
    BETTER_AUDIO_BOOK_ID,
} from "../constants/constants";
import {VirtuosoProps} from 'react-virtuoso/dist/index.d';

class AppState {
    // mains panes bible book , comment, karaites books etc
    panes: Array<any> = []
    // loading state
    loading = false
    // search
    search = ''
    searchResultData: VirtuosoProps<any, any>[] = []
    moreResults = true

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

    setIsRightPaneOpen = (state: boolean, paneNumber: number) => {
        this.panes[paneNumber].isRightPaneOpen = state
    }

    getIsRightPaneOpen = (paneNumber: number): boolean => {
        return this.panes[paneNumber].isRightPaneOpen
    }

    setRefsChapterVerse = (chapter: number, verse: number, paneNumber: number) => {
        this.panes[paneNumber].refsChapterVerse = [chapter, verse]
    }

    getBookChapterVerse = (i: number) => `(${this.panes[i].book} ${this.panes[i].refsChapterVerse[0]}:${this.panes[i].refsChapterVerse[1]})`

    getAudioBookData = (i: number) => {
        const item = this.getCurrentItem(i)
        if (this.panes[i].bookData === undefined) return [0, 0, 0]
        if (this.panes[i].bookData[item] === undefined) return [0, 0, 0]
        if (this.panes[i].bookData[item].length < 12) return [0, 0, 0]
        return JSON.parse(this.panes[i].bookData[item][AUDIO])
    }
    setLastId = (id: number, i: number) => {
        this.panes[i].lastId = id
    }
    getLastId = (i: number): number => this.panes[i].lastId

    isAudioBook = (i: number) => this.getAudioBookData(i)[END_AUDIO_BOOK] !== 0

    getBook = (i: number): string => this.panes[i].book

    setVerseData = (data: Array<any>, i: number) => {
        runInAction(() => {
            this.panes[i].verseData = data
        })
    }

    getVerseData = (i: number): Array<any> => this.panes[i].verseData

    setBookData = (data: Array<any>, i: number) => {
        runInAction(() => {
            this.panes[i].bookData = [...this.panes[i].bookData, ...data]
        })

    }

    // better format in the long run replace all formats
    setBookBetter = (data: Array<any>, i: number) => {
        this.panes[i].paragraphs = data
    }

    getBookBetter = (i: number): Array<any> => this.panes[i].paragraphs

    setBookDetailsBetter = (data: Array<any>, i: number) => {
        runInAction(() => {
            this.panes[i].book_details = data
        })

    }
    getBookDetailsBetter = (i: number) => this.panes[i].book_details

    setSongsBetter = (data: Array<any>, i: number) => {
        // this is song_title, url, song_id
        runInAction(() => {
            this.panes[i].songs = data
        })
    }
    getSongsBetter = (i: number) => this.panes[i].songs[0]

    getBetterAudioData = (i: number) => {
        const item = this.getCurrentItem(i)
        const data = this.panes[i].paragraphs[item]
        const start = parseFloat(data[BETTER_START_AUDIO])
        const end = parseFloat(data[BETTER_END_AUDIO])
        const id:string = data[BETTER_AUDIO_BOOK_ID]
        debugger
        return [start, end, id]

    }
    getBetterAudioDataStart = (i: number) => this.getBetterAudioData(i)[0]

    getBookData = (i: number): Array<any> => this.panes[i].bookData

    setDistance = (distance: number, i: number) => {
        this.panes[i].distance = distance
    }

    getDistance = (i: number): number => this.panes[i].distance

    setCurrentItem = (item: number, i: number): number => {
        console.log('set current item', item)
        runInAction(() => {
            this.panes[i].currentItem = item
        })
        return item
    }

    setGridVisibleRange = (i: number, startIndex: number, endIndex: number) => {
        this.panes[i].range = [startIndex, endIndex]
    }

    getGridVisibleRangeStart = (i: number): Array<number> => this.panes[i].range[0]

    getCurrentItem = (i: number): number => this.panes[i].currentItem

    // right pane bible references
    setRightPaneState = (state: boolean, i: number) => {
        runInAction(() => {
            this.panes[i].rightPaneState = state
        })
    }

    // panes
    setPanes = (pane: object) => {
        runInAction(() => {
            this.panes = [...this.panes, pane]
        })
    }

    getPanes = (): Array<any> => this.panes

    // a getter in class style
    get isLastPane() {
        return this.panes.length === 0
    }

    isPaneOpen = (book: string, chapter: number, verse: number) =>
        this.getPanes().some((pane) => pane.book === book && pane.chapter === chapter - 1 && pane.verse === verse)

    closePane = (i: number) => {
        runInAction(() => {
            this.panes.splice(i, 1)
        })
    }

    resetPanes = () => {
        runInAction(() => {
            this.panes = []
        })
    }
    // loading
    setLoading = (loading: boolean) => {
        runInAction(() => {
            this.loading = loading
        })
    }

    getLoading = () => this.loading

    // karaites books
    setParagraphs = (paragraphs: Array<any>, i: number) => {
        // this.panes[i].paragraphs = [...this.panes[i].paragraphs, ...paragraphs]
        this.panes[i].paragraphs = paragraphs
    }

    getParagraphs = (i: number): Array<any> => this.panes[i].paragraphs

    setBookDetails = (details: object, i: number) => {
        runInAction(() => {
            this.panes[i].book_details = details
        })
    }

    getBookDetails = (i: number): object => {
        return this.panes[i].book_details
    }

    getBookAudioFile = (i: number): string => {
        if (this.panes[i].book_details === undefined || this.panes[i].book_details.length === 0) return ''
        const id = this.getAudioBookData(i)[AUDIO_BOOK_ID]
        if (id === 0) return ''
        return this.panes[i].book_details.audio_books[id]
    }

    // search arg
    setSearch = (searchArg: string) => {
        this.search = searchArg
        this.searchResultData = []
        this.moreResults = true
    }

    getSearch = () => this.search

    // search result
    setSearchResultData = (result: Array<any>) => {
        this.searchResultData = [...this.searchResultData, ...result]
    }

    getSearchResultData = () => this.searchResultData

    // search page
    // autocomplete communicates with searchResult
    setMoreResults = (more: boolean) => {
        this.moreResults = more
    }
    getMoreResults = () => this.moreResults

    // autocomplete
    // setOptions = (options: Array<string>) => {
    //     this.options = options
    // }

    // getOptions = (): Array<string> => this.options

    // getAutoComplete = async (search: string) => {
    //     if (search.length < 2) return []
    //     if (isABibleBook(search)) return []
    //     const response = await fetch(`${autocompleteUrl}${search}/`)
    //     this.setOptions(await response.json())
    // }

    // language
    setLanguage = (language: string, i: number) => {
        this.panes[i].languages = language
    }

    getLanguage = (i: number): string => this.panes[i].languages[0]

    nextLanguage = (i: number): Array<string> => this.panes[i].languages.push(this.panes[i].languages.shift())

}

const appStore = () => new AppState()

export default appStore