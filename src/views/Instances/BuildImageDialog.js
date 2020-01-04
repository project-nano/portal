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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { createDiskImage, deleteDiskImage, getDiskImage } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Build New Image',
    name: 'Image Name',
    description: 'Description',
    tags: 'Tags',
    cancel: 'Cancel',
    confirm: 'Build',
  },
  'cn':{
    title: '构建新镜像',
    name: '镜像名称',
    description: '描述',
    tags: '标签',
    cancel: '取消',
    confirm: '上传',
  },
}

export default function BuildDialog(props){
  const checkInterval = 1000;
  const defaultValues = {
    name: '',
    description: '',
    tags: new Map(),
  };
  const { lang, instanceID, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ creating, setCreating ] = React.useState(false);
  const [ progress, setProgress ] = React.useState(0);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    tags: [],
  });

  const texts = i18n[lang];
  const onBuildFail = (msg) =>{
    setError(msg);
  }

  const onFailAfterCreated = imageID => msg => {
    deleteDiskImage(imageID);
    onBuildFail(msg);
  }

  const resetDialog = () => {
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
    setCreating(false);
    setProgress(0);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onBuildSuccess = (imageName) =>{
    resetDialog();
    onSuccess(imageName);
  }

  const onBuildAccept = (imageName) => (imageID) =>{
    setCreating(true);
    setTimeout(() =>{
      getDiskImage(imageID, onBuildProgress(imageID, imageName), onFailAfterCreated(imageID));
    }, checkInterval);
  }

  const onBuildProgress = (imageID, imageName) => status => {
    if (status.created){
      onBuildSuccess(imageName);
      return;
    }
    setProgress(status.progress);
    setTimeout(() =>{
      getDiskImage(imageID, onBuildProgress(imageID, imageName), onFailAfterCreated(imageID));
    }, checkInterval);
  }

  const confirmBuild = () =>{
    setError('');
    if (!request.name){
      onBuildFail('must specify image name');
      return;
    }
    if (!request.description){
      onBuildFail('desciption required');
      return;
    }

    if (!request.tags){
      onBuildFail('image tags required');
      return;
    }
    var tags = [];
    request.tags.forEach((value, key) =>{
      if (value){
        //checked
        tags.push(key);
      }
    });
    if (0 === tags.length){
      onBuildFail('image tags required');
      return;
    }

    const imageName = request.name;
    createDiskImage(imageName, instanceID, request.description, tags, onBuildAccept(imageName), onBuildFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleTagsChanged = name => e =>{
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      tags: previous.tags.set(name, value),
    }));
  };

  React.useEffect(()=>{
    if (!open || initialed){
      return;
    }
    const imageTags = [
      ['linux', 'Linux'],
      ['windows', 'Windows'],
      ['centos', 'Centos'],
      ['ubuntu', 'Ubuntu'],
      ['64bit', '64Bit'],
      ['32bit', '32Bit']
    ];

    setOptions(previous =>({
      ...previous,
      tags: imageTags,
    }));

    setInitialed(true);

  }, [initialed, open]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else if(creating){
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
          <GridItem xs={8}>
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
          <GridItem xs={12}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.description}
                onChange={handleRequestPropsChanged('description')}
                value={request.description}
                margin="normal"
                rowsMax="4"
                required
                fullWidth
                multiline
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12}>
            <Box m={0} pt={2}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">{texts.tags}</FormLabel>
                <FormGroup>
                  <Grid container>
                    {
                        options.tags.map(tag => {
                          const tagValue = tag[0];
                          const tagLabel = tag[1];
                          let checked;
                          if (request.tags.has(tagValue)){
                            checked = request.tags.get(tagValue);
                          }else{
                            checked = false;
                          }
                          return (
                            <GridItem xs={6} sm={3} key={tagValue}>
                              <FormControlLabel
                                control={<Checkbox checked={checked} onChange={handleTagsChanged(tagValue)} value={tagValue}/>}
                                label={tagLabel}
                              />
                            </GridItem>
                          )
                        })
                    }
                  </Grid>
                </FormGroup>
              </FormControl>
            </Box>
          </GridItem>
        </SingleRow>
      </Grid>
    );
  }

  let title;
  if (!error || '' === error){
    title = texts.title;
  }else{
    title = (
      <GridItem xs={12}>
        {texts.title}
        <SnackbarContent message={error} color="danger"/>
      </GridItem>
    );
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={texts.title}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {content}
          </GridItem>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmBuild} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
