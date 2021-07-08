import * as React from 'react';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';


export default function BooksToolBar({children}) {
  return (
    <Box sx={{ flexGrow: 1 }} style={{marginTop:0,backgroundColor:'lightgray', position:'absolute'}}>

        <Toolbar >
          {children}
        </Toolbar>

    </Box>
  );
}
