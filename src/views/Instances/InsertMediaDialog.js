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

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { searchMediaImages, insertMedia } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Insert Media Into Instance',
    name: 'Media Name',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '向云主机插入光盘镜像',
    name: '镜像名称',
    cancel: '取消',
    confirm: '确认',
  },
}


export default function InsertWithMediaDialog(props){
  const defaultValues = {
    image: '',
  };
  const { lang, instanceID, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    images: [],
  });

  const texts = i18n[lang];
  const onInsertFail = (msg) =>{
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

  const onInsertSuccess = (instanceID) =>{
    resetDialog();
    onSuccess(instanceID);
  }

  const confirmInsert = () =>{
    const imageID = request.image;
    if ('' === imageID){
      onInsertFail('select a media image');
      return;
    }
    insertMedia(instanceID, imageID, onInsertSuccess, onInsertFail);
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

    const onQueryMediaSuccess = (dataList) => {
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

    searchMediaImages(onQueryMediaSuccess, onInsertFail);
  }, [initialed, open]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
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
        <Button onClick={confirmInsert} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
