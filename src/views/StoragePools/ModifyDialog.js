import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { modifyStoragePool, getStoragePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Storage Pool',
    name: "Name",
    type: "Type",
    host: "Host",
    target: "Target",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改存储资源池',
    name: "名称",
    type: "类型",
    host: "主机",
    target: "目标",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDialog(props){
  const defaultType = 'nfs';
  const defaultValues = {
    name: '',
    type: '',
    host: '',
    target: '',
  };
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const options = {
    type: [{
      value: defaultType,
      label: 'NFS',
    }]
  }

  const texts = i18n[lang];
  const onModifyFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = (poolName) =>{
    resetDialog();
    onSuccess(poolName);
  }

  const confirmModify = () =>{
    if(!request.type){
      onModifyFail('must specify storage type');
      return;
    }
    if(!request.host){
      onModifyFail('must specify storage host');
      return;
    }
    if(!request.target){
      onModifyFail('must specify storage target');
      return;
    }
    const hostPattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)+([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$');
    const pathPattern = new RegExp('^(/[^/ ]*)+/?$');

    if (!hostPattern.test(request.host)){
      onModifyFail('invalid host format');
      return;
    }
    if (!pathPattern.test(request.target)){
      onModifyFail('invalid target format');
      return;
    }
    modifyStoragePool(pool, request.type, request.host, request.target, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };


  React.useEffect(()=>{
    if (!pool || !open || initialed ){
      return;
    }

    const onGetStorageSuccess = storage =>{
        setRequest({
          type: storage.type,
          host: storage.host,
          target: storage.target,
        })
        setInitialed(true);
    };

    getStoragePool(pool, onGetStorageSuccess, onModifyFail);

  }, [initialed, open, pool]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12} sm={6} md={4}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.name}
                value={pool}
                margin="normal"
                disabled
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
  }

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
      <DialogTitle>{texts.title + ' ' + pool}</DialogTitle>
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
