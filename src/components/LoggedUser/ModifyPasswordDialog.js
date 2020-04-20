import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { changeUserPassword, writeLog } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Password',
    current: 'Current Password',
    new: 'New Password',
    confirmNew: 'Confirm New Password',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改密码',
    current: '当前密码',
    new: '新密码',
    confirmNew: '确认新密码',
    cancel: '取消',
    confirm: '确认',
  }
};

export default function ModifyPasswordDialog(props){
  const defaultValues = {
    old: '',
    new: '',
    new2: '',
  }
  const { lang, user, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ mounted, setMounted ] = React.useState(false);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const title = texts.title;

  const resetDialog = () =>{
    setPrompt('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifyFail = msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }

  const onModifySuccess = () =>{
    writeLog('change password of ' + user);
    if(!mounted){
      return;
    }
    resetDialog();
    setOperatable(true);
    onSuccess();
  }

  const handleConfirm = () =>{
    setOperatable(false);
    if ('' === request.old){
      onModifyFail('previous password required');
      return;
    }
    if ('' === request.new){
      onModifyFail('new password required');
      return;
    }
    if (request.new2 !== request.new){
      onModifyFail('confirm password mismatched');
      return;
    }
    changeUserPassword(user, request.old, request.new, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    setMounted(true);
    return () => {
      setMounted(false);
    }
  }, []);

  const inputs = [
    {
      type: "password",
      label: texts.current,
      onChange: handleRequestPropsChanged('old'),
      value: request.old,
      required: true,
      xs: 12,
    },
    {
      type: "password",
      label: texts.new,
      onChange: handleRequestPropsChanged('new'),
      value: request.new,
      required: true,
      xs: 12,
    },
    {
      type: "password",
      label: texts.confirmNew,
      onChange: handleRequestPropsChanged('new2'),
      value: request.new2,
      required: true,
      xs: 12,
    },
  ];
  const content = <InputList inputs={inputs}/>

  const buttons = [
    {
      color: 'transparent',
      label: texts.cancel,
      onClick: closeDialog,
    },
    {
      color: 'info',
      label: texts.confirm,
      onClick: handleConfirm,
    },
  ];

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
}
