import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { deleteDiskImage } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete Disk Image',
    content: 'Are you sure to delete disk image ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除磁盘镜像',
    content: '是否删除磁盘镜像 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function DeleteDialog(props){
  const { lang, imageID, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content + imageID;
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
    onSuccess(imageID);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    deleteDiskImage(imageID, onDeleteSuccess, onDeleteFail);
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

  return <CustomDialog size='xs' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
