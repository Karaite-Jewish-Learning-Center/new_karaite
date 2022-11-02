import {makeAutoObservable, observable} from "mobx"
import {apiUrlNoSlashMedia} from "../constants/constants";

class AudioBook {

    audio: any = null
    title: string = ''
    ready: boolean = false

    constructor() {
        makeAutoObservable(this, {
            audio: observable,
            title: observable,
            ready: observable
        })

        this.audio = new Audio()

        this.audio.ontimeupdate = (e: any) => {
            console.log('time update', this.audio.currentTime, e)
        }
        this.audio.onended = (e: any) => {
            console.log('ended', this.audio.currentTime, e)
        }
        this.audio.loadeddata = () => {
            if (this.audio.readyState === 4) this.ready = true
        }
    }

    load = (url: string): void => {
        this.title = url
        this.audio.src = `${apiUrlNoSlashMedia}${url}.mp3`
        this.audio.preload = 'auto'
    }

    audioTitle = (): string => this.title

    audioLoaded = (): boolean => this.ready

    play = (url: string, start: number): void => {

        if (start !== 0) {
            this.audio.currentTime = start
        }
        this.audio.play()
    }

    pause = (): void => {
        this.audio.pause()
    }
    stop = (): void => {
        this.audio.pause()
        this.audio.currentTime = 0
    }
    forward = (time: number): void => {
        this.audio.pause()
        this.audio.currentTime = time
        this.audio.play()
    }
    click = () => {
        if (this.audio.paused) {
            this.audio.play()
        } else {
            this.audio.pause()
        }
    }
    isPlaying = (): boolean => this.audio.paused

}

const audioBookStore = () => {
    return new AudioBook()
}

export default audioBookStore
