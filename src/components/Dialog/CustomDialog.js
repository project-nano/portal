import React from "react";
// @material-ui/core components
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from 'components/Backdrop/Backdrop';
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";

export default function CustomDialog(props){
  const { open, size, operatable, promptPosition, prompt, title, content, buttons} = props;
  let promptElement;
  if (prompt){
    promptElement = (
      <GridItem xs={12}>
        <SnackbarContent message={prompt} color="warning"/>
      </GridItem>
    );
  }else{
    promptElement = <GridItem xs={12}/>;
  }
  let contentElement;
  if ('top' === promptPosition){
    contentElement = (
        <Grid container>
          {promptElement}
          <GridItem xs={12}>
            {content}
          </GridItem>
        </Grid>
    );
  }else{
    contentElement = (
        <Grid container>
          <GridItem xs={12}>
            {content}
          </GridItem>
          {promptElement}
        </Grid>
    );
  }
  var operates = [];
  if (operatable){
    buttons.forEach((button, key) => {
      operates.push(
        <Button onClick={button.onClick} color={button.color} key={key}>
          {button.label}
        </Button>
      )
    });
  }
  return (
    <Dialog
      open={open}
      maxWidth={size}
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Backdrop open={!operatable}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {contentElement}
      </DialogContent>
      <DialogActions>
        <Box display="block" displayPrint="none">
          {operates}
        </Box>
      </DialogActions>
    </Dialog>
  )
};
