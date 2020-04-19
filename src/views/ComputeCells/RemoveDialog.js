import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { removeComputeCell } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Remove Cell',
    content: 'Are you sure to remove compute cell ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '移除资源节点',
    content: '是否移除资源节点 ',
    cancel: '取消',
    confirm: '确定',
  },
}

const RemoveDialog = (props) =>{
  const { lang, pool, cell, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const content = texts.content + cell;
  const onRemoveFail = (msg) =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const closeDialog = ()=>{
    setPrompt('');
    onCancel();
  }

  const onRemoveSuccess = (poolName, cellName) =>{
    setOperatable(true);
    setPrompt('');
    onSuccess(cellName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    removeComputeCell(pool, cell, onRemoveSuccess, onRemoveFail);
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

export default RemoveDialog;
