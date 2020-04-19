import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import InnerBackdrop from '@material-ui/core/Backdrop';

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function Backdrop(props){
  const classes = useStyles();
  const {children, ...rest} = props;
  return (
    <InnerBackdrop className={classes.backdrop} {...rest}>
      {children}
    </InnerBackdrop>
  )
}
