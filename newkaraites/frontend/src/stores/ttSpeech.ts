import {makeAutoObservable, observable} from "mobx"


class TextToSpeech {

    synthesise: any = null
    paused: boolean = false
    resumed: boolean = false
    error: boolean = false
    started: boolean = false
    ended: boolean = false
    voice: any[] = []
    language: string = "en"
    // should call callback
    canceled: boolean = false

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

    setLanguage = (language: string): void => {
        this.language = language
    }

    setVoice = (voice: any[]): void => {
        this.voice = voice
    }

    getVoice = (): number => this.voice[this.getIndex()]

    getLanguage = (): string => this.language

    getIndex = (): number => (this.language === 'en' ? 0 : 1)

    play = (data: Array<any>, callback: Function): void => {
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

    pause = (): void => {
        this.resumed = false
        this.paused = true
        speechSynthesis.pause()
    }

    cancel = (): void => {
        this.canceled = true
        speechSynthesis.cancel()
    }

    resume = (): void => {
        this.resumed = true
        this.paused = false
        speechSynthesis.resume()
    }

    getPlaying = (): boolean => window.speechSynthesis.speaking

    getPaused = (): boolean => this.paused

    getResumed = (): boolean => this.resumed

    getStarted = (): boolean => this.started

    getEnded = (): boolean => this.ended

}

const ttSpeechStore = () => {
    return new TextToSpeech()
}

export default ttSpeechStore
