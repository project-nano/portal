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
import { modifyInstanceBandwidth } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Network Bandwidth',
    outbound: 'Outband Bandwidth',
    inbound: 'Inbound Bandwidth',
    noLimit: 'No Limit',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改网络带宽限制',
    outbound: '上行带宽',
    inbound: '下行带宽',
    noLimit: '无限制',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyNetworkBandwidthDialog(props){
  const Mbit = 1 << (20 - 3);
  const defaultValues = {
    inbound: 0,
    outbound: 0,
  };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentInbound = current&&current.qos&&current.qos.receive_speed ? current.qos.receive_speed / Mbit : 0;
  const currentOutbound = current&&current.qos&&current.qos.send_speed ? current.qos.send_speed /Mbit : 0;
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState({
    inbound: currentInbound,
    outbound: currentOutbound,
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

  const onModifySuccess = (inbound, outbound) =>{
    resetDialog();
    onSuccess(inbound, outbound, instanceID);
  }

  const confirmModify = () =>{

    modifyInstanceBandwidth(instanceID, request.inbound * Mbit, request.outbound * Mbit, onModifySuccess, onModifyFail);
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
            <FormLabel component="legend">{texts.inbound}</FormLabel>
            <Slider
              color="secondary"
              defaultValue={currentInbound}
              max={20}
              min={0}
              step={2}
              valueLabelDisplay="auto"
              marks={[{value: 0, label: texts.noLimit}, {value: 20, label: '20 Mbit/s'}]}
              onChange={handleSliderValueChanged('inbound')}
            />
          </Box>
        </GridItem>
      </SingleRow>
      <SingleRow>
        <GridItem xs={12}>
          <Box m={0} pt={2}>
            <FormLabel component="legend">{texts.outbound}</FormLabel>
            <Slider
              color="secondary"
              defaultValue={currentOutbound}
              max={20}
              min={0}
              step={2}
              valueLabelDisplay="auto"
              marks={[{value: 0, label: texts.noLimit}, {value: 20, label: '20 Mbit/s'}]}
              onChange={handleSliderValueChanged('outbound')}
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
