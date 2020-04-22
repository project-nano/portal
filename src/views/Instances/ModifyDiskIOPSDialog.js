import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyInstanceDiskIOPS, getInstanceConfig } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Disk IOPS',
    label: 'IOPS',
    noLimit: 'No Limit',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改磁盘读写限制',
    label: '磁盘读写限制',
    noLimit: '无限制',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDiskIOPSDialog(props){
  const defaultValues = {
    iops: 0,
  };
  const { lang, open, instanceID, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ initialed, setInitialed ] = React.useState(false);
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
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = iops =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(iops, instanceID);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    modifyInstanceDiskIOPS(instanceID, request.iops, onModifySuccess, onModifyFail);
  }

  const handleSliderValueChanged = name => (e, value) =>{
    if(!mounted){
      return;
    }
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    if (!open || !instanceID){
      return;
    }
    setMounted(true);
    const onGetSuccess = data =>{
      if(!mounted){
        return;
      }
      var iops = 0;
      if (data.qos ){
        iops = data.qos.write_iops;
      }
      setRequest({
        iops: iops,
      })
      setInitialed(true);
    }
    getInstanceConfig(instanceID, onGetSuccess, onModifyFail);

    return ()=> setMounted(false);
  }, [open, instanceID, mounted, onModifyFail]);

  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    const marks = [
      {value: 0, label: texts.noLimit},
      {value: 2000, label: 2000}
    ];

    const inputs = [
      {
        type: "slider",
        label: texts.label,
        onChange: handleSliderValueChanged('iops'),
        value: request.iops,
        marks: marks,
        step: 10,
        maxStep: 2000,
        minStep: 0,
        required: true,
        xs: 12,
      },
    ];

    content = <InputList inputs={inputs}/>
    buttons.push(
      {
        color: 'info',
        label: texts.confirm,
        onClick: handleConfirm,
      }
    );

  }  

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
