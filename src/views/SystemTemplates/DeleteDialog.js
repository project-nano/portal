import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { deleteSystemTemplate } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete System Template',
    content: 'Are you sure to delete template ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除系统模板',
    content: '是否删除系统模板 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function DeleteDialog(props){
  const { lang, templateID, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const onDeleteFail = msg =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const closeDialog = ()=>{
    setPrompt('');
    onCancel();
  }

  const onDeleteSuccess = id =>{
    setOperatable(true);
    setPrompt('');
    onSuccess(templateID);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    deleteSystemTemplate(templateID, onDeleteSuccess, onDeleteFail);
  }

  const content = texts.content + templateID;

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

  return <CustomDialog size='xs' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
