import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { syncDiskImages } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Sync Local Disk Images',
    content: 'Are you sure to synchronize local disk images',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '同步本地磁盘镜像',
    content: '是否同步本地磁盘镜像文件',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function SyncDialog(props){
  const { lang, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content;
  const onSyncFail = msg =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const closeDialog = ()=>{
    setPrompt('');
    onCancel();
  }

  const onSyncSuccess = () =>{
    setOperatable(true);
    setPrompt('');
    onSuccess();
  }

  const handleConfirm = () =>{
    setOperatable(false);
    syncDiskImages(onSyncSuccess, onSyncFail);
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
