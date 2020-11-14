import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { addSecurityPolicyRule } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Add Security Policy Rule',
    action: 'Action',
    accept: 'Accept',
    reject: 'Reject',
    protocol: 'Protocol',
    sourceAddress: 'Source Address',
    targetPort: 'Target Port',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '添加安全规则',
    action: '处理',
    accept: '接受',
    reject: '拒绝',
    protocol: '协议',
    sourceAddress: '来源地址',
    targetPort: '目标端口',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function AddRuleDialog(props){

  const protocolOptions = [
    {
      label: 'TCP',
      value: 'tcp',
    },
    {
      label: 'UDP',
      value: 'udp',
    }];
  const defaultValues = {
    action: 'accept',
    protocol: '',
    port: '',
  };
  const { lang, policyID, open, onSuccess, onCancel } = props;
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
  const onAddFail = msg =>{
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

  const onAddSuccess = id =>{
    setOperatable(true);
    resetDialog();
    onSuccess(id);
  }

  const handleAdd = () =>{
    setOperatable(false);

    if(!request.action){
      onAddFail('must specify action');
      return;
    }
    if(!request.protocol){
      onAddFail('must specify protocol');
      return;
    }
    if(!request.port){
      onAddFail('must specify target port');
      return;
    }
    var targetPort = Number.parseInt(request.port);
    if(Number.isNaN(targetPort)){
      onAddFail('invalid target port: ' + request.port);
      return;
    }

    addSecurityPolicyRule(policyID, request.action, request.protocol, targetPort, onAddSuccess, onAddFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };


  //begin render
  const inputs = [
    {
      type: "radio",
      label: texts.action,
      onChange: handleRequestPropsChanged('action'),
      value: request.action,
      options: actionOptions,
      required: true,
      oneRow: true,
      xs: 10,
      sm: 8,
      md: 6,
    },
    {
      type: "select",
      label: texts.protocol,
      onChange: handleRequestPropsChanged('protocol'),
      value: request.protocol,
      options: protocolOptions,
      required: true,
      oneRow: true,
      xs: 8,
      sm: 6,
      md: 4,
    },
    {
      type: "text",
      label: texts.targetPort,
      onChange: handleRequestPropsChanged('port'),
      value: request.port,
      required: true,
      oneRow: true,
      xs: 8,
      sm: 6,
      md: 4,
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
      onClick: handleAdd,
    },
  ];

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
