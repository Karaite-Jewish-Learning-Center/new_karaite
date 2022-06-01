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
            canceled:observable
        })

        new Promise(resolve => window.speechSynthesis.onvoiceschanged = resolve)
            .then(() => {
                // this is really stupid
                let voices = window.speechSynthesis.getVoices()
                let voice: string = 'Daniel'
                if (this.language === 'he') {
                    voice = 'Carmit'
                }
                for (let i = 0; i < voices.length; i++) {
                    if (voices[i].name === voice) {
                        // must be the index otherwise it does not
                        // work
                        this.setVoice(i)
                    }
                }
            })
            .catch((e) => console.log(e.message))

    }

    setVoice = (voice: any): any => this.voice = voice
    getVoice = (): any => this.voice

    play = (text: string, callback: Function): void => {
        this.synthesise = new SpeechSynthesisUtterance(text);
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
            console.log('Value of canceled onend', this.canceled)
            if (!this.canceled) {
                console.log('callback called')
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
        console.log('before canceled', this.canceled)
        this.canceled = true
        console.log('After canceled', this.canceled)
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
