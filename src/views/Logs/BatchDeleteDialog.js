import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { deleteLog } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Batch Deleting Log',
    content1: 'Are you sure to delete ',
    content2: ' log(s)',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '批量删除日志',
    content1: '是否删除 ',
    content2: ' 条日志',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function BatchDeleteDialog(props){
  const { lang, targets, open, onSuccess, onCancel } = props;
  const count = targets.length;
  const [ error, setError ] = React.useState('');
  const texts = i18n[lang];
  const onDeleteFail = (msg) =>{
    setError(msg);
  }

  const closeDialog = ()=>{
    setError('');
    onCancel();
  }

  const onDeleteSuccess = () =>{
    setError('');
    onSuccess(count);
  }

  const confirmDelete = () =>{
    deleteLog(targets, onDeleteSuccess, onDeleteFail);
  }

  //begin render
  let prompt;
  if (!error || '' === error){
    prompt = <GridItem xs={12}/>;
  }else{
    prompt = (
      <GridItem xs={12}>
        <SnackbarContent message={error} color="danger"/>
      </GridItem>
    );
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={texts.title}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{texts.title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {texts.content1 + count.toString() + texts.content2}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmDelete} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
