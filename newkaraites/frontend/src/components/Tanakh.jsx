import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Colors from '../constants/colors'


const torah = {
    'Genesis': 'Creation, the beginning of mankind, and stories of the patriarchs and matriarchs.',
    'Exodus': 'The Israelites’ enslavement in Egypt, miraculous redemption, the giving of the Torah, and building of the Mishkan (Tabernacle).',
    'Leviticus': 'Laws of sacrificial worship in the Mishkan (Tabernacle), ritual purity, and other topics like agriculture, ethics, and holidays.',
    'Numbers': 'Wanderings of the Israelites in the desert, census, rebellion, spies and war, interspersed with laws.',
    'Deuteronomy': 'Moses’ final speeches, recalling events of the desert, reviewing old laws, introducing new ones, and calling for faithfulness to God.'
}

const prophets = {
    'Joshua': 'The Israelites enter, conquer, and settle Israel under the leadership of Joshua.',
    'Judges': ' Cycles of sin, foreign oppression, repentance, and redemption through leaders appointed by God.',
    'I Samuel': 'The prophet Samuel, the advent of monarchy with the reign of Saul, and the rise of a young David.',
    'II Samuel': 'King David’s triumphs and challenges as he establishes a united kingdom with Jerusalem as its capital.',
    'I kings': 'Solomon’s kingship, construction of the Temple, a schism in the kingdom, and Elijah the Prophet.',
    'II kings': 'Stories and miracles of the prophet Elisha, the decline of Israel’s kingdoms, and the Temple’s destruction.',
    'Isaiah': 'Criticism of religious corruption, calls for change, and descriptions of a utopian future',
    'Jeremiah': 'Warnings of Jerusalem’s destruction and demands for repentance, largely rejected by the people, some of whom torture and persecute him.',
    'Ezekiel': 'Dramatic symbolism conveying rebuke or hope, and visions of a future Temple.',
    'Hosea': 'Rebuke of Israel for abandoning God, comparing their relationship to that of unfaithful lovers',
    'Joel': 'A locust plague, a call to repent, and a promise of judgement for Israel’s oppressors.',
    'Amos': 'Condemnation of oppression and arrogance in the nations and Israel, and a call for reform.',
    'Obadiah': 'The shortest book in Tanakh, at just 21 verses, predicting the downfall of the kingdom of Edom.',
    'Jonah': 'A great fish swallows Jonah when he tries to escape his mission of prophecy, and Jonah repents.',
    'Micah': 'Berating of Israel and its leadership for insincere ritual worship, and calls for justice and kindness.',
    'Nahum': 'A celebratory prophecy about the downfall of the Assyrian empire, an oppressor of Israel',
    'Habakkuk': 'Charging God to explain the unjust success of the Babylonians, God’s response, and a prayer.',
    'Zephaniah': 'Warnings of the destruction God will wreck on the unfaithful and calls for justice and humility.',
    'Haggai': 'Urgent calls to build the Second Temple and descriptions of its future glory.',
    'Zechariah': 'Warnings of the destruction God will wreck on the unfaithful and calls for justice and humility.',
    'Malachi': 'Criticism of disingenuous ritual worship and descriptions of God’s future blessings.',
}

const writings = {
    'Psalms': 'Poems of despair, hope, gratitude, and supplication to God, attributed to David and others',
    'Proverbs': 'Guidance for living a wise, moral, and righteous life, in the form of poems and short statements.',
    'Job': 'Satan convinces God to strike a righteous man with tragedy, spurring conversations about suffering.',
    'Song of Songs': 'Poetic conversations of two lovers, traditionally read as a metaphor for God and Israel.',
    'Ruth': 'A Moabite widow remains loyal to her mother-in-law and to Israel, embarking on a new beginning.',
    'Lamentations': 'Laments of Jerusalem’s destruction, grappling with theological explanations.',
    'Ecclesiastes': 'An exploration of the meaning of life, reckoning with death, futility, and purpose.',
    'Esther': 'Esther becomes queen of Persia and foils a plot to destroy the Jews, establishing the Purim holiday.',
    'Daniel': 'A Jewish advisor to Babylonian kings interprets dreams and miraculously escapes danger.',
    'Ezra': 'Rebuilding the Temple after decades of exile and religious revival led by Ezra the scribe.',
    'Nehemiah': 'Rebuilding Jerusalem’s walls and the nation’s commitment to observe the commandments.',
    'I Chronicles': 'Recounts of events in the Torah and early Prophets, focusing on King David.',
    'II Chronicles': 'Recounts of events in the Prophets, from Solomon through the First Temple’s destruction.',
}

const books = { 'TORAH': torah, 'PROPHETS': prophets, 'WRITINGS': writings }

const Tanakh = () => {
    const classes = container()

    const populate = (obj) => {
        return Object.keys(obj).map(key =>
            <Grid item xs={6}>
                <div className={classes.card}>
                    <Link to={'/' + key + '/'}>
                        <Typography variant="h6" component="h2">{key}</Typography>
                    </Link>
                    <p></p>
                    <Typography variant="body3" component="p">{obj[key]}</Typography>
                </div>
                <hr className={classes.ruler} />
            </Grid>)
    }
    const makeMenu = () => {
        return Object.keys(books).map(key =>
            <div className={classes.container}>
                <Typography className={classes.title} variant="h6" component="h2">{key}</Typography>
                <hr className={classes.ruler}></hr>
                <Grid container spacing={1}
                    direction="row"
                    justifyContent="space-around"
                    alignItems="center">
                    {populate(books[key])}
                </Grid>
            </div>)
    }

    return (
        <div>
            <div className={classes.filler}>&nbsp;</div>
            {makeMenu()}
        </div>
    )

}


const container = makeStyles((theme) => ({
    container: {
        width: '50%',
        marginLeft: 'auto',
        marginRight: 'auto',
        height: 'auto',
        marginTop: 50,
    },
    card: {
        maxWidth: 350,
        height: 100,
    },
    title: {
        marginBottom: 50,
        color: 'gray',
    },
    ruler: {
        borderColor: Colors.rulerColor,
    },
    filler: {
        marginTop: 70,
    }
}));
export default Tanakh