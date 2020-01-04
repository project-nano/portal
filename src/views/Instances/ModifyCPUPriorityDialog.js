import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
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
import { modifyInstancePriority } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify CPU Priority',
    label: 'CPU Priority',
    cpuPriorityHigh: 'High',
    cpuPriorityMedium: 'Medium',
    cpuPriorityLow: 'Low',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改CPU优先级',
    label: 'CPU优先级',
    cpuPriorityHigh: '高',
    cpuPriorityMedium: '中',
    cpuPriorityLow: '低',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyCPUPriorityDialog(props){
  // const defaultValues = {
  //   priority: '',
  // };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentValue = current&&current.qos ? current.qos.cpu_priority : 'medium';

  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState({
    priority: currentValue,
  });

  const texts = i18n[lang];
  const onModifyFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    // setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = priority =>{
    resetDialog();
    onSuccess(priority, instanceID);
  }

  const confirmModify = () =>{
    if(!request.priority){
      onModifyFail('invalid priority value');
      return;
    }

    modifyInstancePriority(instanceID, request.priority, onModifySuccess, onModifyFail);
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
              <FormLabel component="legend">{texts.label}</FormLabel>
              <RadioGroup aria-label={texts.label} defaultValue={currentValue} onChange={handleRequestPropsChanged('priority')} row>
                <FormControlLabel value='high' control={<Radio />} label={texts.cpuPriorityHigh} key='high'/>
                <FormControlLabel value='medium' control={<Radio />} label={texts.cpuPriorityMedium} key='medium'/>
                <FormControlLabel value='low' control={<Radio />} label={texts.cpuPriorityLow} key='low'/>
              </RadioGroup>
            </FormControl>
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
