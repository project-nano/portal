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
import { removeAddressRange } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Remove Address Range',
    content: 'Are you sure to remove address range ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除地址段',
    content: '是否删除地址段 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function RemoveDialog(props){
  const { lang, open, poolName, rangeType, startAddress, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const texts = i18n[lang];
  const onRemoveFail = (msg) =>{
    setError(msg);
  }

  const closeDialog = ()=>{
    setError('');
    onCancel();
  }

  const onRemoveSuccess = (poolName) =>{
    setError('');
    onSuccess(poolName, rangeType, startAddress);
  }

  const confirmRemove = () =>{
    removeAddressRange(poolName, rangeType, startAddress, onRemoveSuccess, onRemoveFail);
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
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{texts.title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {texts.content + startAddress}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmRemove} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
