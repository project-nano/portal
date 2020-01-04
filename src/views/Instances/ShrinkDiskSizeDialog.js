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
import { shrinkInstanceDisk } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Shrink Disk Size',
    content1: 'Are you sure to shrink size of ',
    content2: ' ? it will take a long time, please be patient and ignore the timeout warning.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    systemDisk: 'System Disk',
    dataDisk: 'Data Disk',
  },
  'cn':{
    title: '压缩磁盘容量',
    content1: '是否压缩 ',
    content2: ' 的磁盘空间，这会占用很长时间，请忽略超时提示并耐心等待',
    cancel: '取消',
    confirm: '确定',
    systemDisk: '系统磁盘',
    dataDisk: '数据磁盘',
  },
}

export default function ShrinkDiskSizeDialog(props){
  const { lang, instanceID, index, open, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const texts = i18n[lang];
  const onShrinkFail = (msg) =>{
    setError(msg);
  }

  const closeDialog = () =>{
    setError('');
    onCancel();
  }

  const onShrinkSuccess = diskIndex =>{
    setError('');
    onSuccess(diskIndex, instanceID);
  }

  const confirmShrink = () =>{
    shrinkInstanceDisk(instanceID, index, onShrinkSuccess, onShrinkFail);
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
  let content;
  if (0 === index){
    content = texts.content1 + texts.systemDisk + texts.content2;
  }else{
    content = texts.content1 + texts.dataDisk + index.toString() + texts.content2;
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
            {content}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmShrink} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
