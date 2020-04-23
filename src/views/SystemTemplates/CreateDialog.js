import React from "react";
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { createSystemTemplate } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create System Template',
    name: "Name",
    admin: "Admin Name",
    operatingSystem: "Operating System",
    disk: "Disk Driver",
    network: "Network Interface Model",
    display: "Display Driver",
    control: "Remote Control Protocol",
    usb: "USB Model",
    tablet: "Tablet Mode",
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建系统模板',
    name: "模板名",
    admin: "管理员名称",
    operatingSystem: "操作系统",
    disk: "磁盘驱动",
    network: "网卡型号",
    display: "显卡类型",
    control: "远程管理协议",
    usb: "USB接口",
    tablet: "触摸屏接口",
    cancel: '取消',
    confirm: '确定',
  },
}

const osOptions = [
  "linux",
  "windows",
];

const diskOptions = [
  "scsi",
  "sata",
  "ide",
];

const networkOptions = [
  "virtio",
  "e1000",
  "rtl8139",
];

const displayOptions = [
  "vga",
  "cirrus",
];

const controlOptions = [
  "vnc",
  "spice",
];

const usbOptions = [
  "",
  "nec-xhci",
];

const tabletOptions = [
  "",
  "usb",
];

export default function CreateDialog(props){
  const defaultValues = {
    name: "",
    admin: "",
    operating_system: "",
    disk: "",
    network: "",
    display: "",
    control: "",
    usb: "",
    tablet: "",
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
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
    if(!request.name){
      onCreateFail('must specify template name');
      return;
    }
    if(!request.admin){
      onCreateFail('must specify admin name');
      return;
    }

    setPrompt('');
    setOperatable(false);
    const { name, admin, operating_system, disk, network, display, control,
      usb, tablet } = request;

    createSystemTemplate(name, admin, operating_system, disk, network, display, control,
      usb, tablet, onCreateSuccess, onCreateFail);
  }

  const onPropertyChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const listToOptions = list => {
    return list.map(value => {
      return {
        value: value,
        label: value? value: "none",
      };
    })
  }

  //begin render
  const inputs = [
    {
      type: "text",
      label: texts.name,
      onChange: onPropertyChanged('name'),
      value: request.name,
      required: true,
      oneRow: true,
      xs: 10,
    },
    {
      type: "text",
      label: texts.admin,
      onChange: onPropertyChanged('admin'),
      value: request.admin,
      required: true,
      oneRow: true,
      xs: 8,
      sm: 6,
    },
    {
      type: "select",
      label: texts.operatingSystem,
      onChange: onPropertyChanged('operating_system'),
      value: request.operating_system,
      required: true,
      oneRow: true,
      options: listToOptions(osOptions),
      xs: 12,
      sm: 5,
    },
    {
      type: "select",
      label: texts.disk,
      onChange: onPropertyChanged('disk'),
      value: request.disk,
      required: true,
      oneRow: true,
      options: listToOptions(diskOptions),
      xs: 6,
      sm: 4,
    },
    {
      type: "select",
      label: texts.network,
      onChange: onPropertyChanged('network'),
      value: request.network,
      required: true,
      oneRow: true,
      options: listToOptions(networkOptions),
      xs: 12,
      sm: 5,
    },
    {
      type: "select",
      label: texts.display,
      onChange: onPropertyChanged('display'),
      value: request.display,
      required: true,
      oneRow: true,
      options: listToOptions(displayOptions),
      xs: 6,
      sm: 4,
    },
    {
      type: "select",
      label: texts.control,
      onChange: onPropertyChanged('control'),
      value: request.control,
      required: true,
      oneRow: true,
      options: listToOptions(controlOptions),
      xs: 6,
      sm: 4,
    },
    {
      type: "select",
      label: texts.usb,
      onChange: onPropertyChanged('usb'),
      value: request.usb,
      required: true,
      oneRow: true,
      options: listToOptions(usbOptions),
      xs: 8,
      sm: 4,
    },
    {
      type: "select",
      label: texts.tablet,
      onChange: onPropertyChanged('tablet'),
      value: request.tablet,
      required: true,
      oneRow: true,
      options: listToOptions(tabletOptions),
      xs: 8,
      sm: 4,
    },
  ];

  const content = <InputList inputs={inputs}/>

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

  return <CustomDialog size='xs' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
