import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyInstanceName } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Instance Name',
    current: 'Current Name',
    new: 'New Name',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改云主机名称',
    current: '当前云主机名',
    new: '新主机名',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyNameDialog(props){
  const defaultValues = {
    name: '',
  };
  const { lang, open, instanceID, current, onSuccess, onCancel } = props;
  const currentName = current ? current.name.slice(current.group.length + 1) : '';
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

  const onModifySuccess = instanceName =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(instanceName, instanceID);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    if(!request.name){
      onModifyFail('must specify new instance name');
      return;
    }
    const newName = [current.group, request.name].join('.');

    if(currentName === newName){
      onModifyFail('no need to modify');
      return;
    }

    modifyInstanceName(instanceID, newName, onModifySuccess, onModifyFail);
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
      value: currentName,
      disabled: true,
      oneRow: true,
      xs: 12,
      sm: 6,
      md: 4,
    },
    {
      type: "text",
      label: texts.new,
      onChange: handleRequestPropsChanged('name'),
      value: request.name,
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
