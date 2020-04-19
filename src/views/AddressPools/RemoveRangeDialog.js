import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { removeAddressRange } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Remove Address Range',
    content: 'Are you sure to remove address range ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除地址段',
    content: '是否删除地址段 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function RemoveDialog(props){
  const { lang, open, poolName, rangeType, startAddress, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const texts = i18n[lang];
  const title = texts.title;
  const onRemoveFail = msg =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const closeDialog = ()=>{
    setPrompt('');
    onCancel();
  }

  const onRemoveSuccess = () =>{
    setOperatable(true);
    setPrompt('');
    onSuccess(rangeType, startAddress);
  }

  const handleRemove = () =>{
    setOperatable(false);
    removeAddressRange(poolName, rangeType, startAddress, onRemoveSuccess, onRemoveFail);
  }

  const content = texts.content + startAddress;
  const buttons = [
    {
      color: 'transparent',
      label: texts.cancel,
      onClick: closeDialog,
    },
    {
      color: 'info',
      label:  texts.confirm,
      onClick: handleRemove,
    },
  ];

  return <CustomDialog size='xs' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
