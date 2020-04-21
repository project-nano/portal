import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { restoreInstanceSnapshot } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Revert Snapshot',
    content: 'Are you sure to revert snapshot ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '恢复云主机快照',
    content: '是否恢复云主机快照 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function RevertSnapshotDialog(props){
  const { lang, instanceID, snapshotName, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content + snapshotName;
  const onRevertFail = (msg) =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const closeDialog = ()=>{
    setPrompt('');
    onCancel();
  }

  const onRevertSuccess = () =>{
    setOperatable(true);
    setPrompt('');
    onSuccess(snapshotName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    restoreInstanceSnapshot(instanceID, snapshotName, onRevertSuccess, onRevertFail);
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
