import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { createStoragePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create Storage Pool',
    name: "Name",
    type: "Type",
    host: "Host",
    target: "Target",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建存储资源池',
    name: "名称",
    type: "类型",
    host: "主机",
    target: "目标",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function CreateDialog(props){
  const defaultType = 'nfs';
  const defaultValues = {
    name: '',
    type: defaultType,
    host: '',
    target: '',
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const options = {
    type: [{
      value: defaultType,
      label: 'NFS',
    }]
  }

  const texts = i18n[lang];
  const onCreateFail = (msg) =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const resetDialog = () =>{
    setPrompt('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onCreateSuccess = (poolName) =>{
    resetDialog();
    setOperatable(true);
    onSuccess(poolName);
  }

  const handleCreate = () =>{
    setOperatable(false);
    if(!request.name){
      onCreateFail('must specify storage name');
      return;
    }
    if(!request.type){
      onCreateFail('must specify storage type');
      return;
    }
    if(!request.host){
      onCreateFail('must specify storage host');
      return;
    }
    if(!request.target){
      onCreateFail('must specify storage target');
      return;
    }
    const hostPattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)+([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$');
    const pathPattern = new RegExp('^(/[^/ ]*)+/?$');

    if (!hostPattern.test(request.host)){
      onCreateFail('invalid host format');
      return;
    }
    if (!pathPattern.test(request.target)){
      onCreateFail('invalid target format');
      return;
    }

    createStoragePool(request.name, request.type, request.host, request.target, onCreateSuccess, onCreateFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const inputs = [
    {
      type: "text",
      label: texts.name,
      onChange: handleRequestPropsChanged('name'),
      value: request.name,
      required: true,
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

  const content = <InputList inputs={inputs}/>

  const buttons = [
    {
      color: 'transparent',
      label: texts.cancel,
      onClick: closeDialog,
    },
    {
      color: 'info',
      label: texts.confirm,
      onClick: handleCreate,
    },
  ];

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={texts.title}  buttons={buttons} content={content} operatable={operatable}/>;
};
