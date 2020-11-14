import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifySecurityPolicyRule } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Security Policy Rule',
    action: 'Action',
    accept: 'Accept',
    reject: 'Reject',
    protocol: 'Protocol',
    sourceModifyress: 'Source Address',
    targetPort: 'Target Port',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改安全规则',
    action: '处理',
    accept: '接受',
    reject: '拒绝',
    protocol: '协议',
    sourceModifyress: '来源地址',
    targetPort: '目标端口',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyRuleDialog(props){
  const { lang, policyID, rule, open, onSuccess, onCancel } = props;
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
    action: rule.action,
    protocol: rule.protocol,
    port: rule.to_port,
  };
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ initialed, setInitialed ] = React.useState(false);
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

  const onModifySuccess = id =>{
    setOperatable(true);
    resetDialog();
    onSuccess(id);
  }

  const handleModify = () =>{
    setOperatable(false);

    if(!request.action){
      onModifyFail('must specify action');
      return;
    }
    if(!request.protocol){
      onModifyFail('must specify protocol');
      return;
    }
    if(!request.port){
      onModifyFail('must specify target port');
      return;
    }
    var targetPort = Number.parseInt(request.port);
    if(Number.isNaN(targetPort)){
      onModifyFail('invalid target port: ' + request.port);
      return;
    }

    modifySecurityPolicyRule(policyID, rule.index, request.action, request.protocol, targetPort, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };


    React.useEffect(()=>{
      if (!policyID || !rule ){
        return;
      }

      setMounted(true);
      setRequest({
        action: rule.action,
        protocol: rule.protocol,
        port: rule.to_port,
      })
      setInitialed(true);
      return () => {
        setMounted(false);
      }
    }, [mounted, open, policyID, rule, onModifyFail]);


  //begin render
  var buttons = [{
    color: 'transparent',
    label: texts.cancel,
    onClick: closeDialog,
  }];
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
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

    content = <InputList inputs={inputs}/>
    buttons.push({
        color: 'info',
        label: texts.confirm,
        onClick: handleModify,
      });
  }

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
