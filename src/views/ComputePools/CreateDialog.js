import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { getAllStoragePools, getAllNetworkPools, createComputePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create Pool',
    localStorage: 'Use local storage',
    noAddressPool: "Don't use address pool",
    name: 'Pool Name',
    storage: 'Backend Storage',
    network: 'Address Pool',
    failover: 'Failover',
    off: 'Off',
    on: 'On',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建资源池',
    localStorage: '使用本地存储',
    noAddressPool: "不使用地址池",
    name: '资源池名称',
    storage: '后端存储',
    network: '地址池',
    failover: '故障切换',
    off: '关闭',
    on: '开启',
    cancel: '取消',
    confirm: '确定',
  },
}

const CreateDialog = (props) =>{
  const defaultOption = '__default';
  const defaultValues = {
    name: '',
    storage: defaultOption,
    network: defaultOption,
    failover: false,
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ initialed, setInitialed ] = React.useState(false);
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    storage: [],
    network: [],
  });

  const texts = i18n[lang];
  const title = texts.title;

  const onCreateFail = msg =>{
    setOperatable(true);
    setPrompt(msg);
  }

  const resetDialog = () =>{
    setPrompt('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onCreateSuccess = poolName =>{
    setOperatable(true);
    resetDialog();
    onSuccess(poolName);
  }

  const handleConfirm = () =>{
    setOperatable(false);
    const poolName = request.name;
    if ('' === poolName){
      onCreateFail('must specify pool name');
      return;
    }
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
    createComputePool(poolName, storage, address, request.failover, onCreateSuccess, onCreateFail);
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
    if (!open || initialed){
      return;
    }
    var storageList = [{
      label: texts.localStorage,
      value: defaultOption,
    }];
    var addressList = [{
      label: texts.noAddressPool,
      value: defaultOption,
    }];

    const onQueryNetworkSuccess = (dataList) =>{
      dataList.forEach((address)=>{
        var item = {
          label: address.name + ' (' + address.allocated + '/' + address.addresses + ' allocated via gateway ' + address.gateway + ')',
          value: address.name,
        }
        addressList.push(item);
      })
      setOptions({
        storage: storageList,
        network: addressList,
      });
      setInitialed(true);
    };
    const onQueryStorageSuccess = (dataList) =>{
        dataList.forEach((storage)=>{
          var item = {
            label: storage.name + ' (' + storage.type + ':' + storage.host + ')',
            value: storage.name,
          }
          storageList.push(item);
        })
        getAllNetworkPools(onQueryNetworkSuccess, onCreateFail);
    };

    getAllStoragePools(onQueryStorageSuccess, onCreateFail);

  }, [initialed, open, texts.localStorage, texts.noAddressPool]);

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
        onChange: handleRequestPropsChanged('name'),
        value: request.name,
        required: true,
        oneRow: true,
        xs: 6,
      },
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

export default CreateDialog;
