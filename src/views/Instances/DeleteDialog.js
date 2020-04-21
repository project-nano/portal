import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { deleteInstance } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete Instance',
    content: 'Are you sure to delete instance ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除云主机',
    content: '是否删除云主机 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function DeleteDialog(props){
  const { lang, instanceID, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content + instanceID;
  const onDeleteFail = (msg) =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const closeDialog = ()=>{
    setPrompt('');
    onCancel();
  }

  const onDeleteSuccess = () =>{
    setOperatable(true);
    setPrompt('');
    onSuccess(instanceID);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    deleteInstance(instanceID, onDeleteSuccess, onDeleteFail);
  }

  const buttons = [
    {
      color: 'transparent',
      label: texts.cancel,
      onClick: closeDialog,
    },
    {
      color: 'info',
      label:  texts.confirm,
      onClick: handleConfirm,
    },
  ];

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
