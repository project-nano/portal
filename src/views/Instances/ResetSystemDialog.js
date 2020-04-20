import React from "react";
import Grid from "@material-ui/core/Grid";
import Skeleton from '@material-ui/lab/Skeleton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
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
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    images: [],
  });

  const texts = i18n[lang];
  const title = texts.title;
  const onResetFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () => {
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onResetSuccess = result =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(result.id);
  }

  const onResetAccept = (instanceID) =>{
    if(!mounted){
      return;
    }
    setCreating(true);
    setProgress(0);
    setTimeout(() => {
      checkCreatingProgress(instanceID)
    }, checkInterval);
  }

  const checkCreatingProgress = (instanceID) =>{
    if(!mounted){
      return;
    }
    const onCreating = (progress) =>{
      if(!mounted){
        return;
      }
      setProgress(progress);
      setTimeout(() => {
        checkCreatingProgress(instanceID)
      }, checkInterval);
    }
    getInstanceConfig(instanceID, onResetSuccess, onResetFail, onCreating);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    const imageID = request.image;
    if ('' === imageID){
      onResetFail('select a target system');
      return;
    }
    resetSystem(instanceID, imageID, onResetAccept, onResetFail);
  }

  const handleRequestPropsChanged = name => e =>{
    if(!mounted){
      return;
    }
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    if (!open){
      return;
    }

    setMounted(true);
    const onQueryTargetSuccess = (dataList) => {
      if(!mounted){
        return;
      }
      var imageOptions = [];
      dataList.forEach(({id, name}) =>{
        imageOptions.push({
          value: id,
          label: name,
        })
      });
      setOptions({
        images: imageOptions,
      });
      setInitialed(true);
    };

    searchDiskImages(onQueryTargetSuccess, onResetFail);
    return () => {
      setMounted(false);
    }
  }, [open, mounted, onResetFail]);

  //begin render
  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else if (creating){
    content = (
      <Grid container>
        <Grid item xs={12}>
          <LinearProgress variant="determinate" value={progress} />
        </Grid>
        <Grid item xs={12}>
          <Typography align="center">
            {progress.toFixed(2) + '%'}
          </Typography>
        </Grid>
      </Grid>
    )
  }else{
    const inputs = [
      {
        type: "select",
        label: texts.name,
        onChange: handleRequestPropsChanged('image'),
        value: request.image,
        options: options.images,
        required: true,
        oneRow: true,
        xs: 12,
        sm: 10,
      },
    ];
    content = <InputList inputs={inputs}/>

    buttons.push(
      {
        color: 'info',
        label: texts.confirm,
        onClick: handleConfirm,
      }
    );
  }

  return <CustomDialog size='xs' open={open} prompt={prompt} hideBackdrop
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
