import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
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
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    images: [],
  });

  const texts = i18n[lang];
  const title = texts.title;
  const onInsertFail = React.useCallback(msg =>{
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

  const onInsertSuccess = (instanceID) =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(instanceID);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    const imageID = request.image;
    if ('' === imageID){
      onInsertFail('select a media image');
      return;
    }
    insertMedia(instanceID, imageID, onInsertSuccess, onInsertFail);
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

    const onQueryMediaSuccess = (dataList) => {
      if(!mounted){
        return;
      }
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
    return ()=> setMounted(false);
  }, [mounted, open, onInsertFail]);

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

  return <CustomDialog size='xs' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
