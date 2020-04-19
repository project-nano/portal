import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { addAddressRange } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Add Address Range',
    type: 'Range Type',
    internal: 'Internal Address',
    external: 'External Address',
    start: 'Start Address',
    end: 'End Address',
    netmask: 'Netmask',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '添加地址段',
    type: '类型',
    internal: '内部地址段',
    external: '外部地址段',
    start: '起始地址',
    end: '结束地址',
    netmask: '子网掩码',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function AddDialog(props){
  const defaultValues = {
    type: "internal",
    start: '',
    end: '',
    netmask: '',
  };
  const { lang, poolName, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const texts = i18n[lang];
  const title = texts.title;

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

  const onAddSuccess = () =>{
    setOperatable(true);
    resetDialog();
    onSuccess(request.type, request.start);
  }

  const handleAdd = () =>{
    setOperatable(false);
    const ipv4Pattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

    if(!request.start){
      onAddFail('must specify start address');
      return;
    }else if (!ipv4Pattern.test(request.start)){
      onAddFail('invalid start start format');
      return;
    }

    if(!request.end){
      onAddFail('must specify end address');
      return;
    }else if (!ipv4Pattern.test(request.end)){
      onAddFail('invalid end address format');
      return;
    }

    if(!request.netmask){
      onAddFail('must specify netmask');
      return;
    }else if (!ipv4Pattern.test(request.netmask)){
      onAddFail('invalid netmask format');
      return;
    }

    addAddressRange(poolName, request.type, request.start, request.end, request.netmask, onAddSuccess, onAddFail);
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
      label: texts.type,
      onChange: handleRequestPropsChanged('type'),
      value: request.type,
      options: [{
        label: texts.internal,
        value: "internal",
      }],
      required: true,
      oneRow: true,
      xs: 12,
    },
    {
      type: "text",
      label: texts.start,
      onChange: handleRequestPropsChanged('start'),
      value: request.start,
      required: true,
      oneRow: true,
      xs: 12,
      sm: 8,
      md: 6,
    },
    {
      type: "text",
      label: texts.end,
      onChange: handleRequestPropsChanged('end'),
      value: request.end,
      required: true,
      oneRow: true,
      xs: 12,
      sm: 8,
      md: 6,
    },
    {
      type: "text",
      label: texts.netmask,
      onChange: handleRequestPropsChanged('netmask'),
      value: request.netmask,
      oneRow: true,
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
      onClick: handleAdd,
    },
  ];

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
