import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyNetworkPool, getNetworkPool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Address Pool',
    name: "Name",
    gateway: "Gateway",
    dns1: "DNS1",
    dns2: "DNS2",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改地址资源池',
    name: "名称",
    gateway: "网关地址",
    dns1: "主DNS",
    dns2: "副DNS",
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyDialog(props){
  const defaultValues = {
    name: '',
    gateway: '',
    dns1: '',
    dns2: '',
  };
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const texts = i18n[lang];
  const title = texts.title + ' ' + pool;

  const onModifyFail = (msg) =>{
    setOperatable(true);
    setPrompt(msg);
  }
  const resetDialog = () =>{
    setPrompt('');
    setRequest(defaultValues);
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = poolName =>{
    setOperatable(true);
    resetDialog();
    onSuccess(poolName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    const ipv4Pattern = new RegExp('^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

    if(!request.gateway){
      onModifyFail('must specify gateway');
      return;
    }else if (!ipv4Pattern.test(request.gateway)){
      onModifyFail('invalid gateway format');
      return;
    }

    if(!request.dns1){
      onModifyFail('must specify primary DNS');
      return;
    }else if (!ipv4Pattern.test(request.dns1)){
      onModifyFail('invalid primary DNS format');
      return;
    }

    var dnsList = [request.dns1];
    if(request.dns2){
      if (!ipv4Pattern.test(request.dns2)){
        onModifyFail('invalid secondary DNS format');
        return;
      }
      dnsList.push(request.dns2);
    }
    modifyNetworkPool(pool, request.gateway, dnsList, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };


  React.useEffect(()=>{
    if (!pool || !open ){
      return;
    }

    setMounted(true);
    const onGetPoolSuccess = pool =>{
      if(!mounted){
        return;
      }
      let primary, secondary;
      if (0 === pool.dns.length){
        onModifyFail('no DNS available for pool ' + pool);
        return
      }else if (1 === pool.dns.length){
        primary = pool.dns[0];
        secondary = "";
      }else if (2 === pool.dns.length){
        primary = pool.dns[0];
        secondary = pool.dns[1];
      }
      setRequest({
        name: pool.name,
        gateway: pool.gateway,
        dns1: primary,
        dns2: secondary,
      })
      setInitialed(true);
    };

    getNetworkPool(pool, onGetPoolSuccess, onModifyFail);
    return () => {
      setMounted(false);
    }
  }, [mounted, open, pool]);

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
        type: "text",
        label: texts.name,
        value: pool,
        disabled: true,
        oneRow: true,
        xs: 12,
        sm: 6,
        md: 4,
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
