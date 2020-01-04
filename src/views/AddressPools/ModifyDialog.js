import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import TextField from '@material-ui/core/TextField';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { modifyNetworkPool, getNetworkPool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Address Pool',
    name: "Name",
    gateway: "Gateway",
    dns1: "DNS1",
    dns2: "DNS2",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改地址资源池',
    name: "名称",
    gateway: "网关地址",
    dns1: "主DNS",
    dns2: "副DNS",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDialog(props){
  const defaultValues = {
    name: '',
    gateway: '',
    dns1: '',
    dns2: '',
  };
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

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
    const ipv4Pattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

    if(!request.gateway){
      onModifyFail('must specify gateway');
      return;
    }else if (!ipv4Pattern.test(request.gateway)){
      onModifyFail('invalid gateway format');
      return;
    }

    if(!request.dns1){
      onModifyFail('must specify primary DNS');
      return;
    }else if (!ipv4Pattern.test(request.dns1)){
      onModifyFail('invalid primary DNS format');
      return;
    }

    var dnsList = [request.dns1];
    if(request.dns2){
      if (!ipv4Pattern.test(request.dns2)){
        onModifyFail('invalid secondary DNS format');
        return;
      }
      dnsList.push(request.dns2);
    }
    modifyNetworkPool(pool, request.gateway, dnsList, onModifySuccess, onModifyFail);
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

    const onGetPoolSuccess = pool =>{
      let primary, secondary;
      if (0 === pool.dns.length){
        onModifyFail('no DNS available for pool ' + pool);
        return
      }else if (1 === pool.dns.length){
        primary = pool.dns[0];
      }else if (2 === pool.dns.length){
        primary = pool.dns[0];
        secondary = pool.dns[1];
      }
      setRequest({
        name: pool.name,
        gateway: pool.gateway,
        dns1: primary,
        dns2: secondary,
      })
      setInitialed(true);
    };

    getNetworkPool(pool, onGetPoolSuccess, onModifyFail);

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
