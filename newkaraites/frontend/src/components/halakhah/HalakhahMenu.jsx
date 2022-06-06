import React, {useState, useEffect, useContext} from 'react'
import {karaitesBookToc} from '../../constants/constants'
import {Typography} from '@material-ui/core'
import {unslug} from '../../utils/utils'
import {Link} from 'react-router-dom'
import {storeContext} from "../../stores/context";
import {messageContext} from "../../stores/messages/messageContext";
import Colors from "../../constants/colors";
import {makeStyles} from "@material-ui/core/styles";
import {fetchData} from "../api/dataFetch";


const HalakhahMenu = ({book}) => {
    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const [toc, setToc] = useState([])
    const classes = useStyles()

    const TableOfContents = () => {
        return toc.map(index =>
            <tr key={index}>
                <td className={classes.left}>
                    <Link to={`/Halakhah/${book}/${index[2]}/`}>
                        <Typography className={classes.he}>{index[1]}</Typography>
                    </Link>
                </td>

                <td className={classes.right}>
                    <Link to={`/Halakhah/${book}/${index[2]}/`}>
                        <Typography className={classes.he}>{index[0]}</Typography>
                    </Link>
                </td>
            </tr>
        )
    }
    useEffect(() => {

        fetchData(`${karaitesBookToc}${book}/`)
            .then((data) => setToc((data)))
            .catch((e) => message.setMessage(e.message))

    }, [book, store])
    window.scrollTo(0, 0)
    return (

        <div className={classes.container}>
            <table>
                <thead>
                <tr>
                    <th>
                        <Typography className={classes.titleHalakhah} variant="h6" component="h2">{unslug(book)}</Typography>
                    </th>
                </tr>
                <tr>
                    <th className={classes.backlink}>
                        <Link className={classes.link} to='/Halakhah/'>To book list</Link>
                    </th>
                </tr>
                <tr>
                    <th colSpan="2" className={classes.ruler}>
                        <hr/>
                    </th>
                </tr>
                </thead>
                <tbody>
                <TableOfContents/>
                </tbody>
            </table>
        </div>
    )
}

const useStyles = makeStyles({
    container: {
        display: "flex",
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        marginTop: 80,
    },

    backlink: {
        paddingBottom: 10,
    },
    title: {
        marginBottom: 20,
        color: 'gray',
    },
    titleHalakhah: {
        display: 'flex',
        marginBottom: 20,
        color: 'gray',
        justifyContent: 'start'
    },
    link: {
        display: 'flex',
        justifyContent: 'start'
    },
    ruler: {
        width: '100%',
        marginBottom: 10,
        borderColor: Colors.rulerColor,
    },
    he: {
        direction: 'RTL',
        fontFamily: 'SBL Hebrew',
        fontSize: 18,
        color: Colors.gray,
    },
    left: {
        minWidth: 300,

    },
    right: {
        minWidth: 100,
    },
    filler: {
        marginTop: 70,
    },
})


export default HalakhahMenu