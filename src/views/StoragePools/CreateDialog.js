import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { createStoragePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create Storage Pool',
    name: "Name",
    type: "Type",
    host: "Host",
    target: "Target",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建存储资源池',
    name: "名称",
    type: "类型",
    host: "主机",
    target: "目标",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function CreateDialog(props){
  const defaultType = 'nfs';
  const defaultValues = {
    name: '',
    type: defaultType,
    host: '',
    target: '',
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const options = {
    type: [{
      value: defaultType,
      label: 'NFS',
    }]
  }

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
    if(!request.name){
      onCreateFail('must specify storage name');
      return;
    }
    if(!request.type){
      onCreateFail('must specify storage type');
      return;
    }
    if(!request.host){
      onCreateFail('must specify storage host');
      return;
    }
    if(!request.target){
      onCreateFail('must specify storage target');
      return;
    }
    const hostPattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)+([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$');
    const pathPattern = new RegExp('^(/[^/ ]*)+/?$');

    if (!hostPattern.test(request.host)){
      onCreateFail('invalid host format');
      return;
    }
    if (!pathPattern.test(request.target)){
      onCreateFail('invalid target format');
      return;
    }

    createStoragePool(request.name, request.type, request.host, request.target, onCreateSuccess, onCreateFail);
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
          <GridItem xs={12} sm={8} md={6}>
            <Box m={0} pt={2}>
              <InputLabel htmlFor="type">{texts.type}</InputLabel>
              <Select
                value={request.type}
                onChange={handleRequestPropsChanged('type')}
                inputProps={{
                  name: 'type',
                  id: 'type',
                }}
                fullWidth
              >
                {
                  options.type.map((option) =>(
                    <MenuItem value={option.value} key={option.value}>{option.label}</MenuItem>
                  ))
                }
              </Select>
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={10} md={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.host}
                onChange={handleRequestPropsChanged('host')}
                value={request.host}
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
              label={texts.target}
              onChange={handleRequestPropsChanged('target')}
              value={request.target}
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
        <Button onClick={confirmCreate} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
