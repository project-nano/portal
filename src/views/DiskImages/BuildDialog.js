import React from "react";
import Grid from "@material-ui/core/Grid";
import Skeleton from '@material-ui/lab/Skeleton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { createDiskImage, deleteDiskImage, getDiskImage, searchInstances, getAllComputePools } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Build New Image',
    name: 'Image Name',
    description: 'Description',
    tags: 'Tags',
    pool: 'Compute Pool',
    guest: 'Source Instance',
    cancel: 'Cancel',
    confirm: 'Build',
  },
  'cn':{
    title: '构建新镜像',
    name: '镜像名称',
    description: '描述',
    tags: '标签',
    pool: '资源池',
    guest: '源云主机',
    cancel: '取消',
    confirm: '构建',
  },
}

export default function BuildDialog(props){
  const checkInterval = 1000;
  const defaultValues = {
    name: '',
    description: '',
    tags: new Map(),
    pool: '',
    guest: '',
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ creating, setCreating ] = React.useState(false);
  const [ progress, setProgress ] = React.useState(0);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    tags: [],
    pools: [],
    guests: [],
  });

  const texts = i18n[lang];
  const title = texts.title;
  const onBuildFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const onFailAfterCreated = imageID => msg => {
    deleteDiskImage(imageID);
    onBuildFail(msg);
  }

  const resetDialog = () => {
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
    setCreating(false);
    setProgress(0);
  }

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onBuildSuccess = imageID =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(imageID);
  }

  const onBuildAccept = imageName => imageID =>{
    if(!mounted){
      return;
    }
    setCreating(true);
    setTimeout(() =>{
      getDiskImage(imageID, onBuildProgress(imageID, imageName), onFailAfterCreated(imageID));
    }, checkInterval);
  }

  const onBuildProgress = (imageID, imageName) => status => {
    if(!mounted){
      return;
    }
    if (status.created){
      onBuildSuccess(imageID);
      return;
    }
    setProgress(status.progress);
    setTimeout(() =>{
      getDiskImage(imageID, onBuildProgress(imageID, imageName), onFailAfterCreated(imageID));
    }, checkInterval);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
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

    if (!request.guest){
      onBuildFail('must specify source guest');
      return;
    }

    const imageName = request.name;
    createDiskImage(imageName, request.guest, request.description, tags, onBuildAccept(imageName), onBuildFail);
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

  const handleTagsChanged = name => e =>{
    if(!mounted){
      return;
    }
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      tags: previous.tags.set(name, value),
    }));
  };

  const handlePoolChanged = e =>{
    if(!mounted){
      return;
    }
    var poolName = e.target.value;
    const onQuerySuccess = dataList =>{
      var guests = [];
      dataList.forEach(guest =>{
        guests.push({
          value: guest.id,
          label: guest.name,
        })
      })
      setOptions(previous =>({
        ...previous,
        guests: guests,
      }))
      setRequest(previous =>({
        ...previous,
        pool: poolName,
        guest: '',
      }))
    }
    searchInstances(poolName, null, onQuerySuccess, onBuildFail);
  };

  React.useEffect(()=>{
    if (!open){
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

    setMounted(true);
    const onQueryPoolSuccess = dataList =>{
      if(!mounted){
        return;
      }
      var poolOptions = [];
      dataList.forEach(({name}) =>{
        poolOptions.push({
          label: name,
          value: name,
        });
      })
      var tagOptions = [];
      imageTags.forEach(tag =>{
        tagOptions.push({
          label: tag[1],
          value: tag[0],
        });
      });
      setOptions({
          tags: tagOptions,
          pools: poolOptions,
          guests: [],
        });
      setRequest(previous =>({
        ...previous,
        pool: '',
        guest: '',
      }));
      setInitialed(true);
    }

    getAllComputePools(onQueryPoolSuccess, onBuildFail);
    return () => {
      setMounted(false);
    }
  }, [mounted, open, onBuildFail]);

  //begin render
  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else if(creating){
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
        type: "text",
        label: texts.name,
        value: request.name,
        onChange: handleRequestPropsChanged('name'),
        required: true,
        oneRow: true,
        xs: 8,
      },
      {
        type: "textarea",
        label: texts.description,
        value: request.description,
        onChange: handleRequestPropsChanged('description'),
        required: true,
        oneRow: true,
        rows: 4,
        xs: 12,
      },
      {
        type: "checkbox",
        label: texts.tags,
        onChange: handleTagsChanged,
        value: request.tags,
        options: options.tags,
        required: true,
        oneRow: true,
        xs: 10,
      },
      {
        type: "select",
        label: texts.pool,
        onChange: handlePoolChanged,
        value: request.pool,
        options: options.pools,
        required: true,
        oneRow: true,
        xs: 10,
        sm: 8,
        md: 6,
      },
      {
        type: "select",
        label: texts.guest,
        onChange: handleRequestPropsChanged('guest'),
        value: request.guest,
        options: options.guests,
        required: true,
        oneRow: true,
        xs: 10,
        sm: 8,
        md: 6,
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

  return <CustomDialog size='sm' open={open} prompt={prompt} hideBackdrop
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
