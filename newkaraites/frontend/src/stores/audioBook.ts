import {makeAutoObservable, observable} from "mobx"
import {audioBooksUrl} from "../constants/constants";

class AudioBook {

    audio: any = null
    title: string = ''
    ready: boolean = false
    callback : Function = () => {}

    constructor() {
        makeAutoObservable(this, {
            audio: observable,
            title: observable,
            ready: observable,
        })

        this.audio = new Audio()

        this.audio.ontimeupdate = () => this.callback(this.audio.currentTime)

        this.audio.onended = () => {
            this.cancel()
        }
        this.audio.loadeddata = () => {
            if (this.audio.readyState === 4) this.ready = true
        }
    }

    load = (url: string): void => {
        this.title = url
        this.audio.src = `${audioBooksUrl}${url}.mp3`
        this.audio.preload = 'auto'
    }

    play = (start: number, callback:Function): void => {
        this.callback = callback
        this.audio.currentTime = start
        this.audio.play()
    }

    pause = (): void => {
        this.audio.pause()
    }

    stop = (): void => {
        this.callback = () => {}
        this.audio.pause()
        this.ready = false
        this.audio.currentTime = 0
    }

    forward = (time: number): void => {
        this.audio.currentTime = time
    }

    cancel = (): void => {
        this.stop()
    }
}

const audioBookStore = () => {
    return new AudioBook()
}

export default audioBookStore
