import {makeAutoObservable, observable} from "mobx"


class TextToSpeech {

    synthesise: any = null
    paused = false
    resumed = false
    error = false
    started = false
    ended = false
    voice:any[] =[]
    language = "en"
    // should call callback
    canceled = false

    constructor() {
        makeAutoObservable(this, {
            synthesise: observable,
            paused: observable,
            resumed: observable,
            error: observable,
            started: observable,
            ended: observable,
            voice: observable,
            language: observable,
            canceled: observable
        })

        // in future make voices configurable
        new Promise(resolve => window.speechSynthesis.onvoiceschanged = resolve)
            .then(() => {
                let voices = window.speechSynthesis.getVoices()
                this.setVoice([
                    voices.findIndex(v => v.name === 'Daniel'),
                    voices.findIndex(v => v.name === 'Carmit')
                ])
            })
            .catch((e) => console.log(e.message))

    }

    setLanguage = (language: string) => {
        this.language = language
    }

    setVoice = (voice: any[]) => {
        this.voice = voice
    }

    getVoice = () => this.voice[this.getIndex()]

    getLanguage = () => this.language

    getIndex = (): number => (this.language === 'en' ? 0 : 1)

    // better this callback: Function
    play = (data: Array<any>, callback: Function) => {
        this.synthesise = new SpeechSynthesisUtterance(data[this.getIndex()])
        this.synthesise.voice = window.speechSynthesis.getVoices()[this.getVoice()]
        this.synthesise.volume = 10
        this.synthesise.pitch = 1
        this.synthesise.rate = 0.7

        this.synthesise.onend = () => {
            this.started = false
            this.error = false
            this.resumed = false
            this.paused = false
            this.ended = true
            if (!this.canceled) {
                callback()
            }
        }

        this.synthesise.onpause = () => {
        }

        this.synthesise.onresume = () => {
            this.resumed = true
            this.paused = false
        }

        this.synthesise.onerror = () => this.error = true

        this.synthesise.onstart = () => {
            this.started = true
            this.error = false
            this.resumed = false
            this.paused = this.synthesise.paused
            this.canceled = false
        }
        speechSynthesis.speak(this.synthesise)
    }

    pause = () => {
        this.resumed = false
        this.paused = true
        speechSynthesis.pause()
    }

    cancel = () => {
        this.canceled = true
        speechSynthesis.cancel()
    }

    // resume = () => {
    //     this.resumed = true
    //     this.paused = false
    //     speechSynthesis.resume()
    // }

    // getPlaying = () => window.speechSynthesis.speaking
    //
    // getPaused = () => this.paused
    //
    // getResumed = () => this.resumed
    //
    // getStarted = () => this.started
    //
    // getEnded = () => this.ended

}

const ttSpeechStore = () => new TextToSpeech()

export default ttSpeechStore;