import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { createSecurityPolicyGroup } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create New Security Policy',
    name: 'Name',
    description: 'Description',
    enable: 'Enable',
    enabled: 'Enabled',
    disabled: 'Disabled',
    global: 'Global',
    yes: 'Yes',
    no: 'No',
    defaultAction: 'Default Action',
    accept: 'Accept',
    reject: 'Reject',
    format: "only letter/digit/'_' allowed",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建新安全策略',
    name: "名称",
    description: '描述',
    enable: '是否启用',
    enabled: '已启用',
    disabled: '已禁用',
    global: '全局可见',
    yes: '是',
    no: '否',
    defaultAction: '默认处理',
    accept: '接受',
    reject: '拒绝',
    format: "仅允许字母数字与下划线_",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function CreatePolicyDialog(props){
  const defaultValues = {
    name: '',
    description: '',
    action: 'accept',
    enabled: true,
    global: false,
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const texts = i18n[lang];
  const title = texts.title;
  const actionOptions = [
    {
      label: texts.accept,
      value: 'accept',
    },
    {
      label: texts.reject,
      value: 'reject',
    },
  ];
  const onCreateFail = msg =>{
    setOperatable(true);
    setPrompt(msg);
  }
  const resetDialog = () =>{
    setPrompt('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onCreateSuccess = id =>{
    setOperatable(true);
    resetDialog();
    onSuccess(id);
  }

  const handleCreate = () =>{
    setOperatable(false);

    if(!request.action){
      onCreateFail('must specify action');
      return;
    }

    const namePattern = new RegExp('[^\\w]');
    if(!request.name){
      onCreateFail('must specify policy name');
      return;
    }if (namePattern.test(request.name)){
      onCreateFail(texts.format);
      return;
    }

    createSecurityPolicyGroup(request.name, request.description, request.enabled,
      request.global, request.action, onCreateSuccess, onCreateFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRequestSwitchChanged = name => e =>{
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  //begin render
  const inputs = [
    {
      type: "text",
      label: texts.name,
      onChange: handleRequestPropsChanged('name'),
      value: request.name,
      required: true,
      oneRow: true,
      xs: 8,
      sm: 6,
      md: 4,
    },
    {
      type: "radio",
      label: texts.defaultAction,
      onChange: handleRequestPropsChanged('action'),
      value: request.action,
      options: actionOptions,
      disabled: true,
      oneRow: true,
      xs: 10,
      sm: 8,
      md: 6,
    },
    {
      type: "switch",
      label: texts.enable,
      onChange: handleRequestSwitchChanged('enabled'),
      value: request.enabled,
      on: texts.enabled,
      off: texts.disabled,
      oneRow: true,
      xs: 6,
    },
    {
      type: "switch",
      label: texts.global,
      onChange: handleRequestSwitchChanged('global'),
      value: request.global,
      on: texts.yes,
      off: texts.no,
      oneRow: true,
      xs: 6,
    },
    {
      type: "textarea",
      label: texts.description,
      onChange: handleRequestPropsChanged('description'),
      value: request.description,
      oneRow: true,
      rows: 3,
      xs: 10,
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
      onClick: handleCreate,
    },
  ];

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
