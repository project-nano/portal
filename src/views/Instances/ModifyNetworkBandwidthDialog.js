import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyInstanceBandwidth, getInstanceConfig } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Network Bandwidth',
    outbound: 'Outband Bandwidth',
    inbound: 'Inbound Bandwidth',
    noLimit: 'No Limit',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改网络带宽限制',
    outbound: '上行带宽',
    inbound: '下行带宽',
    noLimit: '无限制',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyNetworkBandwidthDialog(props){
  const Mbit = 1 << (20 - 3);
  const defaultValues = {
    inbound: 0,
    outbound: 0,
  };
  const { lang, open, instanceID, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ initialed, setInitialed ] = React.useState(false);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const title = texts.title;

  const onModifyFail =  React.useCallback(msg =>{
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

  const onModifySuccess = (inbound, outbound) =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(inbound, outbound, instanceID);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    modifyInstanceBandwidth(instanceID, request.inbound * Mbit, request.outbound * Mbit, onModifySuccess, onModifyFail);
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

      var current = defaultValues;
      if (data.qos&&data.qos.receive_speed ){
        current.inbound = data.qos.receive_speed / Mbit;
      }
      if (data.qos&&data.qos.send_speed ){
        current.outbound = data.qos.send_speed / Mbit;
      }
      setRequest(current)
      setInitialed(true);
    }
    getInstanceConfig(instanceID, onGetSuccess, onModifyFail);

    return ()=> setMounted(false);
  }, [open, instanceID, mounted, onModifyFail, Mbit, defaultValues]);


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
      {value: 20, label: '20 Mbit/s'}
    ];

    const inputs = [
      {
        type: "slider",
        label: texts.inbound,
        onChange: handleSliderValueChanged('inbound'),
        value: request.inbound,
        marks: marks,
        step: 2,
        maxStep: 20,
        minStep: 0,
        required: true,
        xs: 12,
      },
      {
        type: "slider",
        label: texts.outbound,
        onChange: handleSliderValueChanged('outbound'),
        value: request.outbound,
        marks: marks,
        step: 2,
        maxStep: 20,
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
