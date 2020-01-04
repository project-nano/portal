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

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { getDiskImage, modifyDiskImage } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Disk Image',
    name: 'Image Name',
    description: 'Description',
    tags: 'Tags',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改镜像信息',
    name: '镜像名称',
    description: '描述',
    tags: '标签',
    cancel: '取消',
    confirm: '确认',
  },
}

const SingleRow = (props) => (
  <GridItem xs={12}>
    <Box m={1} p={0}>
      <Grid container>
        {props.children}
      </Grid>
    </Box>
  </GridItem>
);

export default function ModifyDialog(props){
  const defaultValues = {
    name: '',
    description: '',
    tags: new Map(),
  };
  const { lang, imageID, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    tags: [],
  });

  const texts = i18n[lang];
  const onModifyFail = (msg) =>{
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

  const onModifySuccess = (imageID) =>{
    resetDialog();
    onSuccess(imageID);
  }

  const confirmModify = () =>{
    const imageName = request.name;
    if ('' === imageName){
      onModifyFail('must specify image name');
      return;
    }
    const description = request.description;
    if ('' === description){
      onModifyFail('desciption required');
      return;
    }

    if (!request.tags){
      onModifyFail('image tags required');
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
      onModifyFail('image tags required');
      return;
    }
    modifyDiskImage(imageID, imageName, description, tags, onModifySuccess, onModifyFail);
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

    const onGetDiskSuccess = (image) => {
      setOptions({
        tags: imageTags,
      });
      var currentTags = new Map();
      if (image.tags){
        image.tags.forEach(tag => {
          currentTags.set(tag, true);
        });
      }
      setRequest({
        name: image.name,
        description: image.description,
        tags: currentTags,
      })
      setInitialed(true);
    };

    getDiskImage(imageID, onGetDiskSuccess, onModifyFail);
  }, [initialed, open, imageID]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
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
        <Button onClick={confirmModify} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
