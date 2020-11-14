import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { deleteSecurityPolicyGroup } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete Security Policy',
    content: 'Are you sure to delete security policy ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除安全策略',
    content: '是否删除安全策略 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function DeletePolicyDialog(props){
  const { lang, policyID, open, onSuccess, onCancel } = props;
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

  const onDeleteSuccess = () =>{
    setOperatable(true);
    setPrompt('');
    onSuccess(policyID);
  }

  const handleDelete = () =>{
    setOperatable(false);
    deleteSecurityPolicyGroup(policyID, onDeleteSuccess, onDeleteFail);
  }

  const content = texts.content + policyID;
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
