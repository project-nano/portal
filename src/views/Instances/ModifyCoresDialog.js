import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyInstanceCores } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Instance Cores',
    current: 'Current Cores',
    new: 'New Cores',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改核心数',
    current: '当前核心数',
    new: '新核心数',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyCoresDialog(props){
  const defaultValues = {
    cores: '',
  };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentCores = current ? current.cores : 0;
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

  const onModifySuccess = cores =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(cores, instanceID);
  }

  const handleConfirm = () =>{
    if(!request.cores){
      onModifyFail('must specify new instance cores');
      return;
    }
    const newCores = Number.parseInt(request.cores);
    if(Number.isNaN(newCores)){
      onModifyFail('invalid cores number: ' + request.cores);
      return;
    }

    if(currentCores === newCores){
      onModifyFail('no need to modify');
      return;
    }

    setPrompt('');
    setOperatable(false);
    modifyInstanceCores(instanceID, newCores, onModifySuccess, onModifyFail);
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
      value: currentCores.toString(),
      disabled: true,
      oneRow: true,
      xs: 12,
      sm: 6,
      md: 4,
    },
    {
      type: "text",
      label: texts.new,
      onChange: handleRequestPropsChanged('cores'),
      value: request.cores,
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
