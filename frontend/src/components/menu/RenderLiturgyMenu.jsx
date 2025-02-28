import Grid from "@material-ui/core/Grid";
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import { useState } from 'react';
import { capitalize, makeRandomKey } from "../../utils/utils";
import Filler from "../general/Filler.tsx";
import { ToText } from "../general/ToText";
import ArrowButton from "./ArrowButton";
import liturgyMenuItems from "./LiturgyItems";


export const RenderLiturgyMenu = ({books, path, columns = 6, header = true}) => {
    const [open, setOpen] = useState(Array.from({length: books.length}, i => i = false));
    const [expandedSections, setExpandedSections] = useState({});
    const classes = useStyles()

    const onClickArrow = key => {
        //  change hide show class for element  id=key
        setOpen({...open, [key]: !open[key]})
    }

    const toggleSection = (sectionIndex) => {
        setExpandedSections({
            ...expandedSections,
            [sectionIndex]: !expandedSections[sectionIndex]
        });
    };

    const classification = (obj) => {
        const keys = Object.keys(obj)
        let separator = ''
        let comp = []

        keys.forEach(key => {
            if (obj[key].book_classification !== separator) {

                if (header) {
                    separator = obj[key].book_classification;
                } else {
                    separator = ''
                }


                if (obj[key].book_classification === 'Shabbat Morning Services') {
                    // Create groups based on kedushot_expanded
                    const shabbatItems = keys.filter(itemKey => 
                        obj[itemKey].book_classification === 'Shabbat Morning Services'
                    ).sort((a, b) => obj[a].order - obj[b].order); // Sort by order if available

                    // Find indices where kedushot_expanded is true
                    const groupBoundaries = [];
                    shabbatItems.forEach((itemKey, index) => {
                        if (obj[itemKey].kedushot_expanded === true) {
                            groupBoundaries.push(index);
                        }
                    });

                    // If no boundaries found, treat all items as one group
                    if (groupBoundaries.length === 0) {
                        groupBoundaries.push(0);
                    } else if (groupBoundaries[0] !== 0) {
                        // Ensure the first group starts at index 0
                        groupBoundaries.unshift(0);
                    }

                    // Create groups based on boundaries
                    const kedushotGroups = [];
                    for (let i = 0; i < groupBoundaries.length; i++) {
                        const startIdx = groupBoundaries[i];
                        const endIdx = (i === groupBoundaries.length - 1) 
                            ? shabbatItems.length 
                            : groupBoundaries[i + 1];

                        if (startIdx < endIdx) {
                            const groupItems = shabbatItems.slice(startIdx, endIdx);
                            // Use the first item in the group for title and subtitle
                            const firstItemKey = groupItems[0];
                            kedushotGroups.push({
                                title: obj[firstItemKey].kedushot_title || '',
                                subtitle: obj[firstItemKey].kedushot_sub_title || '',
                                mainTitle: obj[firstItemKey].kedushot_main_title || '',
                                items: groupItems
                            });
                        }
                    }

                    // Create a component for the main Shabbat Morning Services section
                    comp.push(
                        <Grid item xs={12} key={makeRandomKey()}>
                            <ArrowButton direction={open[key]} onClick={() => onClickArrow(key)} saying={capitalize(separator)} style={classes.title} />
                            <div className={(open[key] ? classes.show : classes.hide)}>
                                {/* Render each kedushot group */}
                                {kedushotGroups.map((group, groupIndex) => {
                                    // Default to collapsed (false) if not explicitly set
                                    const isExpanded = expandedSections[groupIndex] === true;

                                    return (
                                        <div key={makeRandomKey()} className={classes.kedushotContainer}>
                                            {group.mainTitle && (
                                                <Typography className={classes.kedushotMainTitle}>
                                                    {group.mainTitle}
                                                </Typography>
                                            )}
                                            <div 
                                                onClick={() => toggleSection(groupIndex)}
                                                className={classes.kedushotHeaderContainer}
                                            >
                                                <Typography className={classes.kedushotHeader}>
                                                    <span className={classes.kedushotTitle}>{group.title}</span>
                                                    {group.subtitle && <span className={classes.kedushotSubtitle}>{group.subtitle}</span>}
                                                    {isExpanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                                                </Typography>
                                            </div>

                                            {/* Render the items for this group */}
                                            <div className={isExpanded ? classes.show : classes.hide}>
                                                {liturgyMenuItems(
                                                    // Create a filtered object with only this group's items
                                                    group.items.reduce((acc, itemKey) => {
                                                        acc[itemKey] = obj[itemKey];
                                                        return acc;
                                                    }, {}),
                                                    classes,
                                                    path,
                                                    separator
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <hr className={classes.hr} />
                        </Grid>
                    );

                } else {
                    comp.push(
                        <Grid item xs={12} key={makeRandomKey()}>
                            <ArrowButton direction={open[key]} onClick={() => onClickArrow(key)} saying={capitalize(separator)} style={classes.title} />
                            <div className={(open[key] ? classes.show : classes.hide)}>
                                {liturgyMenuItems(obj, classes, path, separator)}
                            </div>
                            <hr className={classes.hr} />
                        </Grid>
                    )
                }
            }
        })
        return comp
    }

    const closeAll = () => {
        setOpen(Array.from({length: books.length}, i => i = false));
        // Also collapse all kedushot sections
        const allSectionsClosed = {};
        // Set all section keys to false (collapsed)
        Object.keys(expandedSections).forEach(key => {
            allSectionsClosed[key] = false;
        });
        setExpandedSections(allSectionsClosed);
    }

    const openAll = () => {
        setOpen(Array.from({length: books.length}, i => i = true));
        // Also expand all kedushot sections
        const kedushotCount = getKedushotGroupsCount(books);
        const allSectionsOpen = {};
        // Create an object with all section indices set to true (expanded)
        for (let i = 0; i < kedushotCount; i++) {
            allSectionsOpen[i] = true;
        }
        setExpandedSections(allSectionsOpen);
    }

    // Helper function to count kedushot groups
    const getKedushotGroupsCount = (obj) => {
        const keys = Object.keys(obj);
        const shabbatItems = keys.filter(itemKey => 
            obj[itemKey].book_classification === 'Shabbat Morning Services'
        );

        // Count expanded items to determine group boundaries
        let groupCount = 0;
        let hasGroups = false;

        shabbatItems.forEach(itemKey => {
            if (obj[itemKey].kedushot_expanded === true) {
                groupCount++;
                hasGroups = true;
            }
        });

        // If no groups found, treat all as one group
        return hasGroups ? groupCount : (shabbatItems.length > 0 ? 1 : 0);
    }

    const CloseOpenALl = () => {
        // Check if all values in the open array are true or false
        const allOpen = Object.values(open).every(value => value === true);
        const allClosed = Object.values(open).every(value => value === false);

        return (
            <div className={classes.closeOpenAll}>
                <IconButton  
                    aria-label="open all" 
                    onClick={openAll}
                    disabled={allOpen}
                    className={allOpen ? classes.disabledButton : ''}
                >
                    <ArrowDropDownIcon/>
                </IconButton>
                <IconButton  
                    aria-label="close all" 
                    onClick={closeAll}
                    disabled={allClosed}
                    className={allClosed ? classes.disabledButton : ''}
                >
                    <ArrowDropUpIcon/>
                </IconButton>
            </div>
        )
    }

    const LiturgyMenu = () => {
        return (
            <Grid item xs={6} sm={columns}>
                <Grid item>
                    <Typography className={classes.title} variant="h6" component="h2">{capitalize(path)}</Typography>
                    <Grid item>
                        <ToText/>
                        <CloseOpenALl/>
                    </Grid>
                    <hr className={classes.hr}/>
                </Grid>

                <Grid container spacing={2}>
                    {classification(books)}
                </Grid>
            </Grid>)
    }

    return (
        <div>
            <div className={classes.container}>
                <Grid container
                      spacing={2}
                      direction="column"
                      justifyContent="space-evenly"
                      alignItems="center"
                >
                    <Filler xs={12}/>
                    <LiturgyMenu/>
                </Grid>
            </div>

        </div>
    )

}

const useStyles = makeStyles((theme) => ({
    container: {
        margin: 'auto',

        height: '100%',
        fontSize: 18,
        fontFamily: 'SBL Hebrew',
    },
    title: {
        minHeight: 50,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        '& h6': {
            width: '100%',
        },
    },
    bookTitle: {
        marginLeft: 30,
        fontSize: 18,
    },
    hide: {
        display: 'none',
    },
    show: {
        display: 'block',
    },
    hr: {
        padding: 0,
        width: 'auto',
    },
    hr2: {      
        padding: 0,
        marginBottom: 20,
        width: 'auto',
    },
    bodyText: {
        fontSize: '14pt',
    },
    subtitle: {
        minWidth: 600,
        marginTop: 20,
        marginBottom: 20,
    },
    bookTitleEn: {
        textAlign: 'left',
    },
    bookTitleHe: {
        textAlign: 'right',
    },
    left: {
        width: '50%',
        paddingLeft: 20,
        margin: 5,
        justifyItems: 'right',
    },
    right: {
        width: '50%',
        paddingRight: 20,
        margin: 5,
        justifyItems: 'left',
    },
    item: {
        width: '100%',
        display: 'flex',
    },
    note: {
        marginLeft: 20,
        marginRight: 20,
        minWidth: 20,
    },
    closeOpenAll: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    disabledButton: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    kedushotContainer: {
        marginTop: 20,
        marginBottom: 20,
        padding: '0 16px',
        position: 'relative',
    },
    kedushotHeaderContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            transform: 'translateX(4px)',
        },
    },
    kedushotHeader: {
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        gap: '16px',
        '& svg': {
            marginLeft: '8px',
        },
    },
    kedushotItem: {
        marginBottom: 8,
        paddingLeft: 10,
    },
    kedushotTitle: {
        textAlign: 'left',
        flex: 1,
    },
    kedushotSubtitle: {
        fontSize: '0.9em',
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'right',
        marginLeft: '16px',
    },
    kedushotSeparator: {
        borderLeft: '1px solid #ccc',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        margin: '0 15px',
    },
    kedushotMainTitle: {
        fontSize: '1.2em',
        marginBottom: 10,
        textAlign: 'center',
    },
    kedushotLeft: {
        fontSize: '0.9em',
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.85)',
    },
}));
