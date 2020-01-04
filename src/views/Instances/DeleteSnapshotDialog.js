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
import { deleteInstanceSnapshot } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete Snapshot',
    content: 'Are you sure to delete snapshot ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除云主机快照',
    content: '是否删除云主机快照 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function DeleteSnapshotDialog(props){
  const { lang, instanceID, snapshotName, open, onSuccess, onCancel } = props;
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
    onSuccess(snapshotName);
  }

  const confirmDelete = () =>{
    deleteInstanceSnapshot(instanceID, snapshotName, onDeleteSuccess, onDeleteFail);
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
            {texts.content + snapshotName}
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
