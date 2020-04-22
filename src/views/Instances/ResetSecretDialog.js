import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { resetMonitorSecret } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Reset Monitor Secret',
    content: 'Are you sure to reset monitor secret of instance ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '重置监控密码',
    content: '是否重置云主机监控密码 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ResetMonitorSecretDialog(props){
  const { lang, guestID, guestName, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content + guestName;
  const onDeleteFail = msg =>{
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
    onSuccess(guestID);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    resetMonitorSecret(guestID, onDeleteSuccess, onDeleteFail);
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
