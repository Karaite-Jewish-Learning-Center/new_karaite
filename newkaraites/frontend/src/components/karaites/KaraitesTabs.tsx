import React, {useContext, FC,MouseEventHandler} from "react"
import {makeStyles} from '@material-ui/core/styles'
import TabPanel from "../general/TabPanel"
import {makeRandomKey} from '../../utils/utils';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {storeContext} from "../../stores/context";
import KaraitesBooks from './karaitesBooks'

interface KaraitesTabsProps {
    paneNumber: number,
    refClick:MouseEventHandler,
    paragraphs:Array<any>,
    type:string,
    onClosePane: MouseEventHandler,
}

const KaraitesTabs: FC<KaraitesTabsProps> = ({paneNumber,refClick,paragraphs,type,onClosePane}) => {
    const store = useContext(storeContext);
    const karaitesBookData: Array<any> = [
        paragraphs,
        store.getBookDetails(paneNumber),
        store.getBookTOC(paneNumber)
    ]

    const labels: Array<string> = ['title', 'Introduction', 'Table of Contents']
    const ariaLabels: Array<string> = ['Karaites book text', 'Karaites book introduction', 'Karaites book Table of Contents']
    const components: Array<any> = [
        <KaraitesBooks
            paneNumber={paneNumber}
            refClick={refClick}
            paragraphs={paragraphs}
            type={type}
            onClosePane={onClosePane}
        />,
        <p>Intro</p>,
        <p>TOC</p>
    ]

    const onTabChange = () => {
        console.log('onTabChange')
    }

    // const classes = useStyles();

    const createTabs = () => {
        let comp: Array<any> = []
        karaitesBookData.map((data, index) => {
             if (karaitesBookData[index].length > 0) {
                comp.push(<Tab label={labels[index]}
                               onChange={onTabChange}
                               key={makeRandomKey()}
                               value={index.toString()}
                               aria-label={ariaLabels[index]}/>)
            }
        })
        return comp
    }

    const createTabPanels = () => {
        let comp: Array<any> = []
        karaitesBookData.map((data, index) => {
            if (karaitesBookData[index].length > 0) {
                comp.push(<TabPanel key={makeRandomKey()}
                                    value={index}
                                    index={index}>
                    {components[index]}
                </TabPanel>)
            }

        })
        return comp
    }
    return (
        <React.Fragment key={makeRandomKey()}>
            <Tabs>
                {createTabs()}
            </Tabs>

            <div>
                {createTabPanels()}
            </div>
        </React.Fragment>
    )

}

const useStyles = makeStyles(() => ({
    root: {
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)',
        padding: '10px',
        margin: '10px',
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
}))

export default KaraitesTabs

