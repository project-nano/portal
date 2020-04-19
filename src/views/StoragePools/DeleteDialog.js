import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { deleteStoragePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete Storage Pool',
    content: 'Are you sure to delete storage pool ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除存储资源池',
    content: '是否删除存储资源池 ',
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

  const handleDelete = () =>{
    setOperatable(false);
    deleteStoragePool(pool, onDeleteSuccess, onDeleteFail);
  }

  const content = texts.content + pool;

  const buttons = [
    {
      color: 'transparent',
      label: texts.cancel,
      onClick: closeDialog,
    },
    {
      color: 'info',
      label:  texts.confirm,
      onClick: handleDelete,
    },
  ];

  return <CustomDialog size='xs' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};

export default DeleteDialog;
