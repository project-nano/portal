import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { resizeInstanceDisk } from 'nano_api.js';
import { bytesToString } from 'utils.js';

const i18n = {
  'en':{
    title: 'Extend Disk Size',
    current: 'Current Disk Size',
    new: 'New Disk Size (GB)',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '扩展磁盘容量',
    current: '当前磁盘容量',
    new: '新磁盘容量(GB)',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDiskDialog(props){
  const defaultValues = {
    size: '',
  };
  const { lang, open, instanceID, current, index, onSuccess, onCancel } = props;
  const currentDisk = current ? current.disks[index] : 0;
  const currentLabel = bytesToString(currentDisk);
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

  const onModifySuccess = (diskIndex, newDisk) =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(diskIndex, newDisk, instanceID);
  }

  const handleConfirm = () =>{
    if(!request.size){
      onModifyFail('must specify new disk size');
      return;
    }

    const sizeInGB = Number.parseInt(request.size);
    if(Number.isNaN(sizeInGB)){
      onModifyFail('invalid disk size: ' + request.size);
      return;
    }

    const newDisk = sizeInGB * (1 << 30);
    if(currentDisk === newDisk){
      onModifyFail('no need to modify');
      return;
    }
    setPrompt('');
    setOperatable(false);
    resizeInstanceDisk(instanceID, index, newDisk, onModifySuccess, onModifyFail);
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
      onChange: handleRequestPropsChanged('size'),
      value: request.size,
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
