import {makeAutoObservable, observable} from "mobx"
import {CallBack} from '../types/commonTypes';


class AudioBook {

    audio: any = null
    title: string = ''
    ready: boolean = false
    callback: CallBack = () => {
    }
    loading: boolean = false

    constructor() {
        makeAutoObservable(this, {
            audio: observable,
            title: observable,
            ready: observable,
        })

        this.audio = new Audio()

        this.audio.ontimeupdate = () => {
            this.callback(this.audio.currentTime)
        }

        this.audio.onended = () => {
            this.cancel()
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
    play = (start: number = 0, callback = () => {
    }): void => {
        this.callback = callback
        this.audio.currentTime = start
        this.audio.play()
    }

    pause = (): void => {
        this.audio.pause()
    }

    stop = (): void => {
        this.callback = () => {
        }
        this.audio.pause()
        this.ready = false
        this.audio.currentTime = 0
    }

    cancel = (): void => {
        this.stop()
    }

}

export const audioBookStore = () => {
    return new AudioBook()
}
