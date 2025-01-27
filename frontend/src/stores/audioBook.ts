import {makeAutoObservable, observable} from "mobx"
import {CallBack} from '../types/commonTypes';


class AudioBook {

    audio: any = null
    title: string = ''
    ready: boolean = false
    callback: CallBack = () => {}
    ended = () => {}
    loading: boolean = false
    playing: boolean = false

    constructor() {
        makeAutoObservable(this, {
            audio: observable,
            title: observable,
            ready: observable,
            playing: observable,
        })

        this.audio = new Audio()

        this.audio.ontimeupdate = () => {
            this.callback(this.audio.currentTime)
        }

        this.audio.onended = () => {
            this.ended()
            // console.log('Audio ended')
        }

        this.audio.loadeddata = () => {
            if (this.audio.readyState === 4) {
                this.ready = true
                this.loading = false
            }
        }
    }

    load = (url: string, title: string = ''): void => {
        this.title = (title === '' ? url : title)
        this.audio.src = url
        this.audio.preload = 'auto'
    }
    // better this Function=() => void
    play = (start: number = 0,
            onUpdate = () => {},
            ended =()=>{}): void => {
        this.callback = onUpdate
        this.ended = ended
        this.audio.currentTime = start
        this.audio.play()
        this.playing = true
    }

    pause = (): void => {
        this.audio.pause()
    }

    stop = (): void => {
        this.callback = () => {}
        this.audio.pause()
        this.ready = false
        this.audio.currentTime = 0
        this.playing = false
    }

    cancel = (): void => {
        this.stop()
    }
    getIsPlaying = (): boolean => this.playing
}

const audioBookStore = () => new AudioBook()

export default audioBookStore;
