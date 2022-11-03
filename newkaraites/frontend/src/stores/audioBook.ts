import {makeAutoObservable, observable} from "mobx"
import {audioBooksUrl} from "../constants/constants";

class AudioBook {

    audio: any = null
    title: string = ''
    ready: boolean = false

    constructor() {
        makeAutoObservable(this, {
            audio: observable,
            title: observable,
            ready: observable,


        })

        this.audio = new Audio()

        // this.audio.ontimeupdate = (e: any) => {
        //     console.log('time update', this.audio.currentTime, e)
        // }
        // this.audio.onended = (e: any) => {
        //     console.log('ended', this.audio.currentTime, e)
        // }
        // this.audio.loadeddata = () => {
        //     if (this.audio.readyState === 4) this.ready = true
        // }
    }

    load = (url: string): void => {
        this.title = url
        this.audio.src = `${audioBooksUrl}${url}.mp3`
        this.audio.preload = 'auto'
        this.audio.play()
    }

    play = (start: number): void => {
        this.audio.currentTime = start
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
        this.audio.currentTime = time
    }

    click = (start: number = 0) => {
        if (this.audio.paused) {
            this.play(start)
        } else {
            this.pause()
        }
    }

    isPlaying = (): boolean => this.audio.paused

}

const audioBookStore = () => {
    return new AudioBook()
}

export default audioBookStore
