import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { deleteComputePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete Pool',
    content: 'Are you sure to delete compute pool ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除资源池',
    content: '是否删除计算资源池 ',
    cancel: '取消',
    confirm: '确定',
  },
}

const DeleteDialog = (props) =>{
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content + pool;
  const onDeleteFail = msg =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const closeDialog = ()=>{
    setPrompt('');
    onCancel();
  }

  const onDeleteSuccess = poolName =>{
    setOperatable(true);
    setPrompt('');
    onSuccess(poolName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    deleteComputePool(pool, onDeleteSuccess, onDeleteFail);
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

export default DeleteDialog;
