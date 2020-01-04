import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';

export default function SingleRow(props){
  const { children, ...rest } = props;
  return (
    <Grid item xs={12}>
      <Box m={1} p={0}>
        <Grid container {...rest}>
          {children}
        </Grid>
      </Box>
    </Grid>
  );
}

SingleRow.propTypes = {
  children: PropTypes.node
};
