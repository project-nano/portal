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
import { modifyInstanceName } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Instance Name',
    current: 'Current Name',
    new: 'New Name',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改云主机名称',
    current: '当前云主机名',
    new: '新主机名',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyNameDialog(props){
  const defaultValues = {
    name: '',
  };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentName = current ? current.name.slice(current.group.length + 1) : '';
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

  const onModifySuccess = instanceName =>{
    resetDialog();
    onSuccess(instanceName, instanceID);
  }

  const confirmModify = () =>{
    if(!request.name){
      onModifyFail('must specify new instance name');
      return;
    }
    const newName = [current.group, request.name].join('.');

    if(currentName === newName){
      onModifyFail('no need to modify');
      return;
    }

    modifyInstanceName(instanceID, newName, onModifySuccess, onModifyFail);
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
              value={currentName}
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
              onChange={handleRequestPropsChanged('name')}
              value={request.name}
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
