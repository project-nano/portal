import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyInstanceMemory } from 'nano_api.js';
import { bytesToString } from 'utils.js';

const i18n = {
  'en':{
    title: 'Modify Memory of Instance',
    current: 'Current Memory Size',
    new: 'New Memory Size (MB)',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改内存大小',
    current: '当前内存容量',
    new: '新内存容量(MB)',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyMemoryDialog(props){
  const defaultValues = {
    memory: '',
  };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentMemory = current ? current.memory : 0;
  const currentLabel = bytesToString(currentMemory);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const title = texts.title;

  const onModifyFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const resetDialog = () =>{
    setPrompt('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = newMemory =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(newMemory, instanceID);
  }

  const handleConfirm = () =>{
    if(!request.memory){
      onModifyFail('must specify new memory size');
      return;
    }

    const memoryInMB = Number.parseInt(request.memory);
    if(Number.isNaN(memoryInMB)){
      onModifyFail('invalid memory size: ' + request.memory);
      return;
    }

    const newMemory = memoryInMB * (1 << 20);
    if(currentMemory === newMemory){
      onModifyFail('no need to modify');
      return;
    }

    setPrompt('');
    setOperatable(false);
    modifyInstanceMemory(instanceID, newMemory, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    if(!mounted){
      return;
    }
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };


  React.useEffect(()=>{
    if (!open){
      return;
    }
    setMounted(true);
    return ()=> setMounted(false);
  }, [open]);

  const inputs = [
    {
      type: "text",
      label: texts.current,
      value: currentLabel,
      disabled: true,
      oneRow: true,
      xs: 12,
      sm: 6,
      md: 4,
    },
    {
      type: "text",
      label: texts.new,
      onChange: handleRequestPropsChanged('memory'),
      value: request.memory,
      required: true,
      oneRow: true,
      xs: 12,
      sm: 10,
      md: 8,
    },
  ];

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

  const content = <InputList inputs={inputs}/>
  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
