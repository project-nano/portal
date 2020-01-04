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
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { searchDiskImages, resetSystem, getInstanceConfig } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Reset Instance System',
    name: 'Target System',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '重置云主机系统',
    name: '目标系统',
    cancel: '取消',
    confirm: '确认',
  },
}


export default function ResetSystemDialog(props){
  const checkInterval = 1000;
  const defaultValues = {
    image: '',
  };
  const { lang, instanceID, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ creating, setCreating ] = React.useState(false);
  const [ progress, setProgress ] = React.useState(0);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    images: [],
  });

  const texts = i18n[lang];
  const onResetFail = (msg) =>{
    setError(msg);
  }

  const resetDialog = () => {
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onResetSuccess = result =>{
    resetDialog();
    onSuccess(result.id);
  }

  const onResetAccept = (instanceID) =>{
    setCreating(true);
    setProgress(0);
    setTimeout(() => {
      checkCreatingProgress(instanceID)
    }, checkInterval);
  }

  const checkCreatingProgress = (instanceID) =>{
    const onCreating = (progress) =>{
      setProgress(progress);
      setTimeout(() => {
        checkCreatingProgress(instanceID)
      }, checkInterval);
    }
    getInstanceConfig(instanceID, onResetSuccess, onResetFail, onCreating);
  }

  const confirmReset = () =>{
    const imageID = request.image;
    if ('' === imageID){
      onResetFail('select a target system');
      return;
    }
    resetSystem(instanceID, imageID, onResetAccept, onResetFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    if (!open || initialed){
      return;
    }

    const onQueryTargetSuccess = (dataList) => {
      var imageList = [];
      dataList.forEach(image =>{
        imageList.push({
          value: image.id,
          label: image.name,
        })
      });
      setOptions({
        images: imageList,
      });
      setInitialed(true);
    };

    searchDiskImages(onQueryTargetSuccess, onResetFail);
  }, [initialed, open]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else if (creating){
    content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12}>
            <LinearProgress variant="determinate" value={progress} />
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12}>
            <Typography align="center">
              {progress.toFixed(2) + '%'}
            </Typography>
          </GridItem>
        </SingleRow>
      </Grid>
    )
  }else{
    content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12} sm={10}>
            <Box m={0} pt={2}>
              <InputLabel htmlFor="image">{texts.name}</InputLabel>
              <Select
                value={request.image}
                onChange={handleRequestPropsChanged('image')}
                inputProps={{
                  name: 'image',
                  id: 'image',
                }}
                fullWidth
              >
                {
                  options.images.map((option) =>(
                    <MenuItem value={option.value} key={option.value}>{option.label}</MenuItem>
                  ))
                }
              </Select>
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
      maxWidth="xs"
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
        <Button onClick={confirmReset} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
