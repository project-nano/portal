import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyStoragePool, getStoragePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Storage Pool',
    name: "Name",
    type: "Type",
    host: "Host",
    target: "Target",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改存储资源池',
    name: "名称",
    type: "类型",
    host: "主机",
    target: "目标",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDialog(props){
  const defaultType = 'nfs';
  const defaultValues = {
    name: '',
    type: '',
    host: '',
    target: '',
  };
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const options = {
    type: [{
      value: defaultType,
      label: 'NFS',
    }]
  }

  const texts = i18n[lang];
  const onModifyFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () =>{
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = poolName =>{
    if(!mounted){
      return;
    }
    resetDialog();
    setOperatable(true);
    onSuccess(poolName);
  }

  const handleModify = () =>{
    setOperatable(false);
    if(!request.type){
      onModifyFail('must specify storage type');
      return;
    }
    if(!request.host){
      onModifyFail('must specify storage host');
      return;
    }
    if(!request.target){
      onModifyFail('must specify storage target');
      return;
    }
    const hostPattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)+([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$');
    const pathPattern = new RegExp('^(/[^/ ]*)+/?$');

    if (!hostPattern.test(request.host)){
      onModifyFail('invalid host format');
      return;
    }
    if (!pathPattern.test(request.target)){
      onModifyFail('invalid target format');
      return;
    }
    modifyStoragePool(pool, request.type, request.host, request.target, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };


  React.useEffect(()=>{
    if (!pool || !open ){
      return;
    }

    setMounted(true);
    const onGetStorageSuccess = storage =>{
      if(!mounted){
        return;
      }
      setRequest({
        type: storage.type,
        host: storage.host,
        target: storage.target,
      })
      setInitialed(true);
    };

    getStoragePool(pool, onGetStorageSuccess, onModifyFail);
    return () => {
      setMounted(false);
    }
  }, [initialed, open, pool, mounted, onModifyFail]);

  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    const inputs = [
      {
        type: "text",
        label: texts.name,
        value: pool,
        disabled: true,
        oneRow: true,
        xs: 12,
        sm: 6,
        md: 4,
      },
      {
        type: "select",
        label: texts.type,
        onChange: handleRequestPropsChanged('type'),
        value: request.type,
        options: options.type,
        required: true,
        oneRow: true,
        xs: 12,
        sm: 8,
        md: 6,
      },
      {
        type: "text",
        label: texts.host,
        onChange: handleRequestPropsChanged('host'),
        value: request.host,
        required: true,
        oneRow: true,
        xs: 12,
        sm: 10,
        md: 8,
      },
      {
        type: "text",
        label: texts.target,
        onChange: handleRequestPropsChanged('target'),
        value: request.target,
        required: true,
        oneRow: true,
        xs: 12,
        sm: 10,
        md: 8,
      },
    ];

    content = <InputList inputs={inputs}/>
  }

  const buttons = [
    {
      color: 'transparent',
      label: texts.cancel,
      onClick: closeDialog,
    },
    {
      color: 'info',
      label: texts.confirm,
      onClick: handleModify,
    },
  ];

  const title = texts.title + ' ' + pool;
  return <CustomDialog size='sm' open={open} prompt={prompt}
      title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
