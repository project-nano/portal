import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { createInstanceSnapshot } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create Snapshot',
    name: "Name",
    description: 'Description',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建云主机快照',
    name: "名称",
    description: '描述',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function CreateSnapshotDialog(props){
  const defaultValues = {
    name: '',
    description: '',
  };
  const { lang, open, instanceID, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const texts = i18n[lang];
  const title = texts.title;

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

  const onCreateSuccess = snapshotName =>{
    setOperatable(true);
    resetDialog();
    onSuccess(snapshotName);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    if(!request.name){
      onCreateFail('must specify snapshot name');
      return;
    }
    if(!request.description){
      onCreateFail('must specify description');
      return;
    }

    createInstanceSnapshot(instanceID, request.name, request.description, onCreateSuccess, onCreateFail);
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
      type: "text",
      label: texts.description,
      onChange: handleRequestPropsChanged('description'),
      value: request.description,
      required: true,
      oneRow: true,
      xs: 12,
      sm: 10,
      md: 8,
    },
  ]

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
      onClick: handleConfirm,
    },
  ];

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
