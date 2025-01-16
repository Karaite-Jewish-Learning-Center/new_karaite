import {makeAutoObservable, observable} from "mobx"

class MessageStore {
    // give user feed back on the app
    message = ''
    level = 'error'
    duration = 4000

    constructor() {
        makeAutoObservable(this, {
            message: observable,
            level: observable,
            duration: observable
        })
    }

    setMessage = (message: string, level: string = "error", duration: number = 4000) => {
        this.message = message
        this.level = level
        this.duration = duration
    }
    getMessage = () => ({message: this.message, level: this.level, duration: this.duration})

    resetMessage = () => this.message = ''

}

const messageStore = () => new MessageStore()

export default messageStore
