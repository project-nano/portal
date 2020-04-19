import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { getMediaImage, modifyMediaImage } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Media Image',
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

export default function ModifyDialog(props){
  const defaultValues = {
    name: '',
    description: '',
    tags: new Map(),
  };
  const { lang, imageID, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    tags: [],
  });

  const texts = i18n[lang];
  const title = texts.title;
  const onModifyFail = React.useCallback(msg =>{
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

  const onModifySuccess = imageID =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(imageID);
  }

  const handleConfirm = () =>{
    setOperatable(false);
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
    modifyMediaImage(imageID, imageName, description, tags, onModifySuccess, onModifyFail);
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

    const onGetMediaSuccess = image => {
      if(!mounted){
        return;
      }
      var tagOptions = [];
      imageTags.forEach(tag =>{
        tagOptions.push({
          label: tag[1],
          value: tag[0],
        });
      });
      setOptions({
        tags: tagOptions,
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

    getMediaImage(imageID, onGetMediaSuccess, onModifyFail);
    return () => {
      setMounted(false);
    }
  }, [open, imageID, mounted, onModifyFail]);

  //begin render
  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
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
  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
