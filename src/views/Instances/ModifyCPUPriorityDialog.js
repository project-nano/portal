import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyInstancePriority, getInstanceConfig } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify CPU Priority',
    label: 'CPU Priority',
    cpuPriorityHigh: 'High',
    cpuPriorityMedium: 'Medium',
    cpuPriorityLow: 'Low',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改CPU优先级',
    label: 'CPU优先级',
    cpuPriorityHigh: '高',
    cpuPriorityMedium: '中',
    cpuPriorityLow: '低',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyCPUPriorityDialog(props){
  const { lang, open, instanceID, onSuccess, onCancel } = props;
  const defaultValues = {
    priority: "medium",
  };
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

  const onModifySuccess = priority =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(priority, instanceID);
  }

  const handleConfirm = () =>{
    if(!request.priority){
      onModifyFail('invalid priority value');
      return;
    }

    setPrompt('');
    setOperatable(false);
    modifyInstancePriority(instanceID, request.priority, onModifySuccess, onModifyFail);
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
    if (!open || !instanceID){
      return;
    }
    setMounted(true);
    const onGetSuccess = data =>{
      if(!mounted){
        return;
      }
      var priority = "medium";
      if (data.qos ){
        priority = data.qos.cpu_priority;
      }
      setRequest({
        priority: priority,
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
    const options = [
      {
        label: texts.cpuPriorityHigh,
        value: "high",
      },
      {
        label: texts.cpuPriorityMedium,
        value: "medium",
      },
      {
        label: texts.cpuPriorityLow,
        value: "low",
      },
    ]

    const inputs = [
      {
        type: "radio",
        label: texts.label,
        onChange: handleRequestPropsChanged('priority'),
        value: request.priority,
        options: options,
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
