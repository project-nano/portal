import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { removeGuestSecurityRule } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Remove Security Policy Rule',
    content: 'Are you sure to remove ',
    content2: 'th rule',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除安全规则',
    content: '是否删除第 ',
    content2: '个安全规则',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function RemoveDialog(props){
  const { lang, open, guestID, index, onSuccess, onCancel } = props;
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
    onSuccess(guestID, index);
  }

  const handleRemove = () =>{
    setOperatable(false);
    removeGuestSecurityRule(guestID, index, onRemoveSuccess, onRemoveFail);
  }

  const content = texts.content + index + texts.content2;
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
