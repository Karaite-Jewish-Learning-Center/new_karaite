import {makeAutoObservable, observable} from "mobx"

class TextToSpeech {

    voices: Array<any> = []
    synthesise: any = null
    playing: boolean = false
    paused: boolean = false
    resumed: boolean = false
    error: boolean = false
    started: boolean = false
    ended: boolean = false

    constructor() {
        makeAutoObservable(this, {
            synthesise: observable,
            playing: observable,
            paused: observable,
            resumed: observable,
            error: observable,
            started: observable,
            ended: observable,
        })

        this.voices = speechSynthesis.getVoices()
    }

    setVoice = (language: string): any => {
        let voice: string = 'Daniel'
        if (language === 'he') {
            voice = 'Carmit'
        }

        for (let i = 0; i < this.voices.length; i++) {
            if (this.voices[i].name === voice) {
                return this.voices[i]
            }
        }
    }


    play = (text: string): void => {
        this.synthesise = new SpeechSynthesisUtterance(text);
        this.synthesise.voice = this.setVoice("en");
        this.synthesise.volume = 10
        this.synthesise.pitch = 1
        this.synthesise.rate = 0.7

        this.synthesise.onend = () =>{
            this.started = false
            this.playing = false
            this.error = false
            this.resumed = false
            this.paused = false
        }

        this.synthesise.onpause = () => {}

        this.synthesise.onresume = () => {
            this.resumed = true
            this.paused = false
        }

        this.synthesise.onerror = () => this.error = true

        this.synthesise.onstart = () => {
            this.started = true
            this.playing = true
            this.error = false
            this.resumed = false
            this.paused = false
        }

        speechSynthesis.speak(this.synthesise)
    }
    getPlaying = (): boolean => this.playing

    getPaused = (): boolean => this.paused

    getResumed = (): boolean => this.resumed

    getStarted = (): boolean => this.started

    getEnded = (): boolean => this.ended

    pause = (): void => {
        this.paused = true
        this.playing = false
        speechSynthesis.pause()
    }

    resume = (): void => {
        this.resumed = true
        this.paused = false
        this.playing = true
        speechSynthesis.resume()
    }
}

const ttSpeechStore = () => {
    return new TextToSpeech()
}

export default ttSpeechStore
