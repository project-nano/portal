import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { resizeInstanceDisk } from 'nano_api.js';
import { bytesToString } from 'utils.js';

const i18n = {
  'en':{
    title: 'Extend Disk Size',
    current: 'Current Disk Size',
    new: 'New Disk Size (GB)',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '扩展磁盘容量',
    current: '当前磁盘容量',
    new: '新磁盘容量(GB)',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDiskDialog(props){
  const defaultValues = {
    size: '',
  };
  const { lang, open, instanceID, current, index, onSuccess, onCancel } = props;
  const currentDisk = current ? current.disks[index] : 0;
  const currentLabel = bytesToString(currentDisk);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const onModifyFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = (diskIndex, newDisk) =>{
    resetDialog();
    onSuccess(diskIndex, newDisk, instanceID);
  }

  const confirmModify = () =>{
    if(!request.size){
      onModifyFail('must specify new disk size');
      return;
    }

    const sizeInGB = Number.parseInt(request.size);
    if(Number.isNaN(sizeInGB)){
      onModifyFail('invalid disk size: ' + request.size);
      return;
    }

    const newDisk = sizeInGB * (1 << 30);
    if(currentDisk === newDisk){
      onModifyFail('no need to modify');
      return;
    }

    resizeInstanceDisk(instanceID, index, newDisk, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  //begin render
  const content = (
    <Grid container>
      <SingleRow>
        <GridItem xs={12} sm={6} md={4}>
          <Box m={0} pt={2}>
            <TextField
              label={texts.current}
              value={currentLabel}
              margin="normal"
              disabled
              fullWidth
            />
          </Box>
        </GridItem>
      </SingleRow>
      <SingleRow>
        <GridItem xs={12} sm={10} md={8}>
          <Box m={0} pt={2}>
            <TextField
              label={texts.new}
              onChange={handleRequestPropsChanged('size')}
              value={request.size}
              margin="normal"
              required
              fullWidth
            />
          </Box>
        </GridItem>
      </SingleRow>
    </Grid>
  );


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
            {content}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmModify} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
