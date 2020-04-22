import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { queryComputeCellStorages, changeComputeCellStorage } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Change Storage Path',
    current: "Current Storage Path",
    location: "New Storage Location",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改存储路径',
    current: "当前存储路径",
    location: "新存储路径",
    cancel: '取消',
    confirm: '确认',
  },
}

export default function ChangeStoragePathDialog(props){
  const defaultValues = {
    current: "",
    path: "",
  };
  const { lang, open, pool, cell, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const texts = i18n[lang];
  const title = texts.title;

  const onChangeFail = React.useCallback(msg =>{
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

  const onChangeSuccess = () =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(request.path, cell, pool);
  }

  const handleConfirm = () =>{
    const newLocation = request.path;
    if ('' === newLocation){
      onChangeFail('input a new location');
      return;
    }
    setPrompt('');
    setOperatable(false);
    changeComputeCellStorage(pool, cell, newLocation, onChangeSuccess, onChangeFail);
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
    if (!open || !pool || !cell){
      return;
    }
    setMounted(true);
    const onQueryPathsSuccess = payload => {
      if(!mounted){
        return;
      }
      if (!payload.system){
        onChangeFail('no system paths available');
        return;
      }
      if (0 === payload.system.length){
        onChangeFail('no system paths available');
        return;
      }
      var currentPath = payload.system[0];
      if (!currentPath){
        onChangeFail('no system paths available');
        return;
      }
      setRequest({
        current: currentPath,
        path: "",
      })
      setInitialed(true);
    };

    queryComputeCellStorages(pool, cell, onQueryPathsSuccess, onChangeFail);
    return () => {
      setMounted(false);
    }
  }, [mounted, open, pool, cell, onChangeFail]);

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
        label: texts.current,
        value: request.current,
        disabled: true,
        oneRow: true,
        xs: 12,
        sm: 8,
      },
      {
        type: "text",
        label: texts.location,
        onChange: handleRequestPropsChanged('path'),
        value: request.path,
        required: true,
        oneRow: true,
        xs: 12,
        sm: 8,
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
