import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { addAddressRange } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Add Address Range',
    type: 'Range Type',
    internal: 'Internal Address',
    external: 'External Address',
    start: 'Start Address',
    end: 'End Address',
    netmask: 'Netmask',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '添加地址段',
    type: '类型',
    internal: '内部地址段',
    external: '外部地址段',
    start: '起始地址',
    end: '结束地址',
    netmask: '子网掩码',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function AddDialog(props){
  const TypeInternal = 'internal';
  const TypeExternal = 'external';
  const defaultValues = {
    type: TypeInternal,
    start: '',
    end: '',
    netmask: '',
  };
  const { lang, poolName, open, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const onAddFail = (msg) =>{
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

  const onAddSuccess = () =>{
    resetDialog();
    onSuccess(poolName, request.type, request.start);
  }

  const confirmAdd = () =>{
    const ipv4Pattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

    if(!request.start){
      onAddFail('must specify start address');
      return;
    }else if (!ipv4Pattern.test(request.start)){
      onAddFail('invalid start start format');
      return;
    }

    if(!request.end){
      onAddFail('must specify end address');
      return;
    }else if (!ipv4Pattern.test(request.end)){
      onAddFail('invalid end address format');
      return;
    }

    if(!request.netmask){
      onAddFail('must specify netmask');
      return;
    }else if (!ipv4Pattern.test(request.netmask)){
      onAddFail('invalid netmask format');
      return;
    }

    addAddressRange(poolName, request.type, request.start, request.end, request.netmask, onAddSuccess, onAddFail);
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
          <GridItem xs={12}>
            <Box m={0} pt={2}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">{texts.type}</FormLabel>
                <RadioGroup name="type" value={request.type} onChange={handleRequestPropsChanged('type')} row>
                  <Box display='flex' alignItems='center'>
                    <Box>
                      <FormControlLabel value={TypeInternal} control={<Radio />} label={texts.internal}/>
                    </Box>
                    <Box>
                      <FormControlLabel value={TypeExternal} control={<Radio disabled/>} label={texts.external}/>
                    </Box>
                  </Box>
                </RadioGroup>
              </FormControl>
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={8} md={6}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.start}
                onChange={handleRequestPropsChanged('start')}
                value={request.start}
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
              <TextField
                label={texts.end}
                onChange={handleRequestPropsChanged('end')}
                value={request.end}
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
              <TextField
                label={texts.netmask}
                onChange={handleRequestPropsChanged('netmask')}
                value={request.netmask}
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
        <Button onClick={confirmAdd} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
