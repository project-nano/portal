import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { getAllStoragePools, getAllNetworkPools, modifyComputePool, getComputePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Pool',
    localStorage: 'Use local storage',
    noAddressPool: "Don't use address pool",
    storage: 'Backend Storage',
    network: 'Address Pool',
    failover: 'Failover',
    off: 'Off',
    on: 'On',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改资源池',
    localStorage: '使用本地存储',
    noAddressPool: "不使用地址池",
    storage: '后端存储',
    network: '地址池',
    failover: '故障切换',
    off: '关闭',
    on: '开启',
    cancel: '取消',
    confirm: '确定',
  },
}

const ModifyDialog = (props) =>{
  const defaultOption = '__default';
  const defaultValues = {
    storage: defaultOption,
    network: defaultOption,
    failover: false,
  };
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    storage: [],
    network: [],
  });

  const texts = i18n[lang];
  const title = texts.title + ' ' + pool;

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

  const onModifySuccess = poolName =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(poolName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    let storage, address;
    if (defaultOption === request.storage){
      storage = '';
    }else{
      storage = request.storage;
    }
    if (defaultOption === request.network){
      address = '';
    }else{
      address = request.network;
    }
    modifyComputePool(pool, storage, address, request.failover, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRequestSwitchChanged = name => e =>{
    var value = e.target.checked
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
    var storageList = [{
      label: texts.localStorage,
      value: defaultOption,
    }];
    var addressList = [{
      label: texts.noAddressPool,
      value: defaultOption,
    }];

    const onGetCurrentConfigueSuccess = (config) =>{
      if(!mounted){
        return;
      }
      setOptions({
        storage: storageList,
        network: addressList,
      });
      setRequest({
        storage: config.storage ? config.storage : defaultOption,
        network: config.network ? config.network : defaultOption,
        failover: config.failover,
      });
      setInitialed(true);
    }

    const onQueryNetworkSuccess = (dataList) =>{
      if(!mounted){
        return;
      }
      dataList.forEach((address)=>{
        var item = {
          label: address.name + ' (' + address.allocated + '/' + address.addresses + ' allocated via gateway ' + address.gateway + ')',
          value: address.name,
        }
        addressList.push(item);
      })
      getComputePool(pool, onGetCurrentConfigueSuccess, onModifyFail)
    };
    const onQueryStorageSuccess = (dataList) =>{
      if(!mounted){
        return;
      }
      dataList.forEach((storage)=>{
        var item = {
          label: storage.name + ' (' + storage.type + ':' + storage.host + ')',
          value: storage.name,
        }
        storageList.push(item);
      })
      getAllNetworkPools(onQueryNetworkSuccess, onModifyFail);
    };
    getAllStoragePools(onQueryStorageSuccess, onModifyFail);
    return () => {
      setMounted(false);
    }
  }, [mounted, open, pool, texts.localStorage, texts.noAddressPool, onModifyFail]);

  //begin render
  let content, buttons;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
    buttons = [];
  }else{
    const inputs = [
      {
        type: "select",
        label: texts.storage,
        onChange: handleRequestPropsChanged('storage'),
        value: request.storage,
        options: options.storage,
        required: true,
        oneRow: true,
        xs: 8,
      },
      {
        type: "select",
        label: texts.network,
        onChange: handleRequestPropsChanged('network'),
        value: request.network,
        options: options.network,
        required: true,
        oneRow: true,
        xs: 10,
      },
      {
        type: "switch",
        label: texts.failover,
        onChange: handleRequestSwitchChanged('failover'),
        value: request.failover,
        on: texts.on,
        off: texts.off,
        oneRow: true,
        xs: 6,
      },
    ];

    content = <InputList inputs={inputs}/>

    buttons = [
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
  }

  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};

export default ModifyDialog;
