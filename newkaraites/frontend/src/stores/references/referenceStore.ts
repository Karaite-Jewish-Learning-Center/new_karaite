import {makeAutoObservable, observable} from "mobx"
import {fetchData} from '../../components/api/dataFetch';
import {getLevels} from '../../constants/constants';

const BREAK_ON =2


interface Levels {
    english: string ,
    hebrew: string,
    breakOnClassification: boolean,
    url: string
}

interface LevelsObject {
    [key: string]: Levels[]
}

class ReferenceStore {

    levels_all: LevelsObject = {}
    levels_no_tanakh: LevelsObject = {}
    // references: any[] = []

    constructor() {
        makeAutoObservable(this, {
            levels_all: observable,
            levels_no_tanakh: observable,
            // references: observable,
        })

        // get levels this is Law, Liturgy, Poetry, etc
        fetchData(getLevels)
            .then(data => {
                this.levels_all = data
                delete data['Tanakh']
                this.levels_no_tanakh = data

            })
            .catch((e) => console.log(e))
    }

    getLevelsAll = () => {
        return this.levels_all
    }

    getLevelsNoTanakh = () => {
        return this.levels_no_tanakh
    }

    getBreakOnClassification = (level: string) => {
        try {
            return this.levels_no_tanakh[level][BREAK_ON]
        }catch (_) {
            return false
        }
    }

}

const referenceStore = () => new ReferenceStore()

export default referenceStore
