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
import { modifyInstanceMemory } from 'nano_api.js';
import { bytesToString } from 'utils.js';

const i18n = {
  'en':{
    title: 'Modify Memory of Instance',
    current: 'Current Memory Size',
    new: 'New Memory Size (MB)',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改内存大小',
    current: '当前内存容量',
    new: '新内存容量(MB)',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyMemoryDialog(props){
  const defaultValues = {
    memory: '',
  };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentMemory = current ? current.memory : 0;
  const currentLabel = bytesToString(currentMemory);
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

  const onModifySuccess = newMemory =>{
    resetDialog();
    onSuccess(newMemory, instanceID);
  }

  const confirmModify = () =>{
    if(!request.memory){
      onModifyFail('must specify new memory size');
      return;
    }

    const memoryInMB = Number.parseInt(request.memory);
    if(Number.isNaN(memoryInMB)){
      onModifyFail('invalid memory size: ' + request.memory);
      return;
    }

    const newMemory = memoryInMB * (1 << 20);
    if(currentMemory === newMemory){
      onModifyFail('no need to modify');
      return;
    }

    modifyInstanceMemory(instanceID, newMemory, onModifySuccess, onModifyFail);
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
              onChange={handleRequestPropsChanged('memory')}
              value={request.memory}
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
