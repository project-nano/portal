import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { createNetworkPool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create Network Pool',
    name: "Name",
    provider: 'Provider',
    interface: 'Interface Mode',
    internal: 'Internal',
    external: 'External',
    both: 'Both',
    gateway: "Gateway",
    dns1: "DNS1",
    dns2: "DNS2",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建地址资源池',
    name: "名称",
    provider: '分配模式',
    interface: '接口类型',
    internal: '内部',
    external: '外部',
    both: '内外部',
    gateway: "网关地址",
    dns1: "主DNS",
    dns2: "副DNS",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function CreateDialog(props){
  const defaultValues = {
    name: '',
    gateway: '',
    provider: 'dhcp',
    mode: 'internal',
    dns1: '',
    dns2: '',
  };
  const providerOptions = [
    {
      label: 'DHCP',
      value: 'dhcp',
    },
    {
      label: 'Cloud-Init',
      value: 'cloudinit',
    },
  ];
  const { lang, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const texts = i18n[lang];
  const title = texts.title;
  const modeOptions = [
    {
      label: texts.internal,
      value: 'internal',
    },
    {
      label: texts.external,
      value: 'external',
    },
    {
      label: texts.both,
      value: 'both',
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

  const onCreateSuccess = poolName =>{
    setOperatable(true);
    resetDialog();
    onSuccess(poolName);
  }

  const handleCreate = () =>{
    setOperatable(false);
    const ipv4Pattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

    if(!request.name){
      onCreateFail('must specify pool name');
      return;
    }
    if(!request.gateway){
      onCreateFail('must specify gateway');
      return;
    }else if (!ipv4Pattern.test(request.gateway)){
      onCreateFail('invalid gateway format');
      return;
    }

    if(!request.dns1){
      onCreateFail('must specify primary DNS');
      return;
    }else if (!ipv4Pattern.test(request.dns1)){
      onCreateFail('invalid primary DNS format');
      return;
    }

    var dnsList = [request.dns1];
    if(request.dns2){
      if (!ipv4Pattern.test(request.dns2)){
        onCreateFail('invalid secondary DNS format');
        return;
      }
      dnsList.push(request.dns2);
    }

    createNetworkPool(request.name, request.gateway, request.provider, dnsList, onCreateSuccess, onCreateFail);
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
      type: "text",
      label: texts.name,
      onChange: handleRequestPropsChanged('name'),
      value: request.name,
      required: true,
      oneRow: true,
      xs: 12,
      sm: 6,
      md: 4,
    },
    {
      type: "radio",
      label: texts.provider,
      onChange: handleRequestPropsChanged('provider'),
      value: request.provider,
      oneRow: true,
      disabled: true,
      options: providerOptions,
      xs: 12,
      sm: 8,
      md: 6,
    },
    {
      type: "text",
      label: texts.gateway,
      onChange: handleRequestPropsChanged('gateway'),
      value: request.gateway,
      required: true,
      oneRow: true,
      xs: 12,
      sm: 10,
      md: 8,
    },
    {
      type: "text",
      label: texts.dns1,
      onChange: handleRequestPropsChanged('dns1'),
      value: request.dns1,
      required: true,
      oneRow: true,
      xs: 12,
      sm: 10,
      md: 8,
    },
    {
      type: "text",
      label: texts.dns2,
      onChange: handleRequestPropsChanged('dns2'),
      value: request.dns2,
      oneRow: true,
      xs: 12,
      sm: 10,
      md: 8,
    },
    {
      type: "radio",
      label: texts.interface,
      onChange: handleRequestPropsChanged('mode'),
      value: request.mode,
      oneRow: true,
      disabled: true,
      options: modeOptions,
      xs: 12,
      sm: 8,
      md: 6,
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
