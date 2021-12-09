import React from "react";
import {Grid} from "@material-ui/core";

const Filler = ({xs}) => {
    return (
        <Grid item xs={xs} key={-1}>
            <br/>
            <br/>
            <br/>
            <br/>
        </Grid>
    )
}

export default Filler