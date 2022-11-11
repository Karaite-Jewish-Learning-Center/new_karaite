import {makeAutoObservable, observable} from "mobx"


class AudioBook {

    audio: any = null
    title: string = ''
    ready: boolean = false
    callback: Function = () => {
    }
    loading: boolean = false

    constructor() {
        makeAutoObservable(this, {
            audio: observable,
            title: observable,
            ready: observable,

        })

        this.audio = new Audio()

        this.audio.ontimeupdate = (e:Event) => {
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

    play = (start: number = 0, callback: Function = () => {}): void => {
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

    forward = (time: number): void => {
        this.audio.currentTime = time
    }

    cancel = (): void => {
        this.stop()
    }

    reset = (): void => {
        this.stop()
        this.audio.currentTime = 0
    }

    resume = (): void => {
        this.audio.play()
    }
}

const audioBookStore = () => {
    return new AudioBook()
}

export default audioBookStore
