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
import { createDiskImage, deleteDiskImage, uploadDiskImage } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Upload New Image',
    name: 'Image Name',
    description: 'Description',
    tags: 'Tags',
    file: 'Image File',
    choose: 'Choose File',
    cancel: 'Cancel',
    confirm: 'Upload',
  },
  'cn':{
    title: '上传新镜像',
    name: '镜像名称',
    description: '描述',
    tags: '标签',
    file: '镜像文件',
    choose: '浏览文件',
    cancel: '取消',
    confirm: '上传',
  },
}

export default function UploadDialog(props){
  const defaultValues = {
    name: '',
    description: '',
    tags: new Map(),
    file: null,
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ uploading, setUploading ] = React.useState(false);
  const [ progress, setProgress ] = React.useState(0);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    tags: [],
  });

  const texts = i18n[lang];
  const onUploadFail = (msg) =>{
    setError(msg);
  }

  const resetDialog = () => {
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
    setUploading(false);
    setProgress(0);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onUploadSuccess = (imageID) =>{
    resetDialog();
    onSuccess(imageID);
  }

  const onUploadProgress = (progress) => {
    setProgress(progress);
  }

  const confirmUpload = () =>{
    const imageName = request.name;
    if ('' === imageName){
      onUploadFail('must specify image name');
      return;
    }
    const description = request.description;
    if ('' === description){
      onUploadFail('desciption required');
      return;
    }

    if (!request.tags){
      onUploadFail('image tags required');
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
      onUploadFail('image tags required');
      return;
    }

    if (!request.file){
      onUploadFail('must specify upload file');
      return;
    }

    const onCreateSuccess = (imageID) => {
      const onDeleteSuccess = () =>{
        onUploadFail('new image ' + imageName + ' deleted');
      }
      const onDeleteFail = (msg) =>{
        onUploadFail('delete new image ' + imageName + ' fail: ' + msg);
      }
      const onFailAfterCreated = () =>{
        deleteDiskImage(imageID, onDeleteSuccess, onDeleteFail);
      }
      setUploading(true);
      uploadDiskImage(imageID, request.file, onUploadProgress, onUploadSuccess, onFailAfterCreated);
    }

    createDiskImage(imageName, null, description, tags, onCreateSuccess, onUploadFail);
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

  const handleFileChanged = name => e =>{
    var file = e.target.files[0];
    setRequest(previous => ({
      ...previous,
      [name]: file,
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

    const onQueryTagSuccess = (dataList) => {
      setOptions({
        tags: dataList,
      });
      setInitialed(true);
    };

    //dummy query
    onQueryTagSuccess(imageTags);

  }, [initialed, open]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else if(uploading){
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
        <SingleRow>
          <GridItem xs={12}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.file}
                onChange={handleFileChanged('file')}
                margin="normal"
                type="file"
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
      maxWidth='sm'
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
        <Button onClick={confirmUpload} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
