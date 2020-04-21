import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { deleteInstanceSnapshot } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete Snapshot',
    content: 'Are you sure to delete snapshot ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除云主机快照',
    content: '是否删除云主机快照 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function DeleteSnapshotDialog(props){
  const { lang, instanceID, snapshotName, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content + snapshotName;
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
    onSuccess(snapshotName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    deleteInstanceSnapshot(instanceID, snapshotName, onDeleteSuccess, onDeleteFail);
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
