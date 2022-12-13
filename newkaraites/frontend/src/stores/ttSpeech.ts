import {makeAutoObservable, observable} from "mobx"

const ENGLISH = 0
const HEBREW = 1

class TextToSpeech {

    synthesise: any = null
    paused = false
    resumed = false
    error = 0
    started = false
    ended = false
    voice = [-1, -1]
    language = "en"
    // should call callback
    canceled = false
    errorReported = false

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

        // check if browser supports speech synthesis
        if ('speechSynthesis' in window) {
            // in future make voices configurable
            new Promise(resolve => window.speechSynthesis.onvoiceschanged = resolve)
                .then(() => {
                    let voices = window.speechSynthesis.getVoices()
                    this.setVoice([
                        voices.findIndex(v => v.name === 'Daniel'),
                        voices.findIndex(v => v.name === 'Cagrmit')
                    ])

                    if (this.voice[HEBREW] === -1) {
                        this.error += 1
                    }
                    if (this.voice[ENGLISH] === -1) {
                        this.error += 2
                    }
                    // error = 3 no Hebrew or English voices
                })
                .catch((e) => {
                    console.log(e.message)
                })
        } else {
            // Speech Synthesis Not Supported 😣
            this.error = 1
        }
    }

    getErrorStatus = () => this.error

    setLanguage = (language: string) => {
        this.language = language
    }

    setVoice = (voice: any[]) => {
        this.voice = voice
    }

    getVoice = () => this.voice[this.getIndex()]

    getLanguage = () => this.language

    getIndex = (): number => (this.language === 'en' ? 0 : 1)

    play = (data: Array<any>, callback: Function) => {
        this.synthesise = new SpeechSynthesisUtterance(data[this.getIndex()])
        this.synthesise.voice = window.speechSynthesis.getVoices()[this.getVoice()]
        this.synthesise.volume = 10
        this.synthesise.pitch = 1
        this.synthesise.rate = 0.7

        this.synthesise.onend = () => {
            this.started = false
            this.error = 0
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

        this.synthesise.onerror = () => this.error = 1

        this.synthesise.onstart = () => {
            this.started = true
            this.error = 0
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
    errorAlreadyReported = () => this.errorReported

    setErrorReported = (errorReported: boolean) => {
        this.errorReported = errorReported
    }

}

const ttSpeechStore = () => new TextToSpeech()

export default ttSpeechStore;