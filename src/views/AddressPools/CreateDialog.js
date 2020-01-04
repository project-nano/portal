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
import { createNetworkPool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create Network Pool',
    name: "Name",
    gateway: "Gateway",
    dns1: "DNS1",
    dns2: "DNS2",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建地址资源池',
    name: "名称",
    gateway: "网关地址",
    dns1: "主DNS",
    dns2: "副DNS",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function CreateDialog(props){
  const defaultValues = {
    name: '',
    gateway: '',
    dns1: '',
    dns2: '',
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const onCreateFail = (msg) =>{
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

  const onCreateSuccess = (poolName) =>{
    resetDialog();
    onSuccess(poolName);
  }

  const confirmCreate = () =>{
    const ipv4Pattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

    if(!request.name){
      onCreateFail('must specify pool name');
      return;
    }
    if(!request.gateway){
      onCreateFail('must specify gateway');
      return;
    }else if (!ipv4Pattern.test(request.gateway)){
      onCreateFail('invalid gateway format');
      return;
    }

    if(!request.dns1){
      onCreateFail('must specify primary DNS');
      return;
    }else if (!ipv4Pattern.test(request.dns1)){
      onCreateFail('invalid primary DNS format');
      return;
    }

    var dnsList = [request.dns1];
    if(request.dns2){
      if (!ipv4Pattern.test(request.dns2)){
        onCreateFail('invalid secondary DNS format');
        return;
      }
      dnsList.push(request.dns2);
    }

    createNetworkPool(request.name, request.gateway, dnsList, onCreateSuccess, onCreateFail);
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
                label={texts.name}
                onChange={handleRequestPropsChanged('name')}
                value={request.name}
                margin="normal"
                required
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={10} md={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.gateway}
                onChange={handleRequestPropsChanged('gateway')}
                value={request.gateway}
                margin="normal"
                required
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={10} md={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.dns1}
                onChange={handleRequestPropsChanged('dns1')}
                value={request.dns1}
                margin="normal"
                required
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
        <GridItem xs={12} sm={10} md={8}>
          <Box m={0} pt={2}>
            <TextField
              label={texts.dns2}
              onChange={handleRequestPropsChanged('dns2')}
              value={request.dns2}
              margin="normal"
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
        <Button onClick={confirmCreate} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
