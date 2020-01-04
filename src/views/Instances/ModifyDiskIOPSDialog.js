import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slider from '@material-ui/core/Slider';
import FormLabel from '@material-ui/core/FormLabel';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { modifyInstanceDiskIOPS } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Disk IOPS',
    label: 'IOPS',
    noLimit: 'No Limit',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改磁盘读写限制',
    label: '磁盘读写限制',
    noLimit: '无限制',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDiskIOPSDialog(props){
  const defaultValues = {
    iops: 0,
  };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentValue = current&&current.qos&&current.qos.write_iops ? current.qos.write_iops : 0;
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState({
    iops: currentValue,
  });

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

  const onModifySuccess = iops =>{
    resetDialog();
    onSuccess(iops, instanceID);
  }

  const confirmModify = () =>{
    modifyInstanceDiskIOPS(instanceID, request.iops, onModifySuccess, onModifyFail);
  }

  const handleSliderValueChanged = name => (e, value) =>{
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
            <FormLabel component="legend">{texts.label}</FormLabel>
            <Slider
              color="secondary"
              defaultValue={currentValue}
              max={2000}
              min={0}
              step={10}
              valueLabelDisplay="auto"
              marks={[{value: 0, label: texts.noLimit}, {value: 2000, label: 2000}]}
              onChange={handleSliderValueChanged('iops')}
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
