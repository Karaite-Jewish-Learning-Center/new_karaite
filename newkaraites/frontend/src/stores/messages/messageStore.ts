import {makeAutoObservable, observable} from "mobx"

class MessageStore {
    // give user feed back on the app
    message: string = ''
    level: string = 'error'
    duration: number = 4000

    constructor() {
        makeAutoObservable(this, {
            message: observable,
            level: observable,
            duration: observable
        })
    }

    setMessage = (message: string, level: string = "error", duration: number = 4000): void => {
        this.message = message
        this.level = level
        this.duration = duration
    }
    getMessage = (): Object => ({message:this.message,level: this.level, duration: this.duration})

    resetMessage = (): string => this.message = ''

}

const messageStore =()=> {
    return new MessageStore()
}

export default messageStore
