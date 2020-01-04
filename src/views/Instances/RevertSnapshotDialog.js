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
import { restoreInstanceSnapshot } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Revert Snapshot',
    content: 'Are you sure to revert snapshot ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '恢复云主机快照',
    content: '是否恢复云主机快照 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function RevertSnapshotDialog(props){
  const { lang, instanceID, snapshotName, open, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const texts = i18n[lang];
  const onRevertFail = (msg) =>{
    setError(msg);
  }

  const closeDialog = ()=>{
    setError('');
    onCancel();
  }

  const onRevertSuccess = () =>{
    setError('');
    onSuccess(snapshotName);
  }

  const confirmRevert = () =>{
    restoreInstanceSnapshot(instanceID, snapshotName, onRevertSuccess, onRevertFail);
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
    >
      <DialogTitle>{texts.title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {texts.content + snapshotName}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmRevert} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
