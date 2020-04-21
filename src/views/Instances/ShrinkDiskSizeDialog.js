import React from "react";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { shrinkInstanceDisk } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Shrink Disk Size',
    content1: 'Are you sure to shrink size of ',
    content2: ' ? it will take a long time, please be patient and ignore the timeout warning.',
    cancel: 'Cancel',
    confirm: 'Confirm',
    systemDisk: 'System Disk',
    dataDisk: 'Data Disk',
  },
  'cn':{
    title: '压缩磁盘容量',
    content1: '是否压缩 ',
    content2: ' 的磁盘空间，这会占用很长时间，请忽略超时提示并耐心等待',
    cancel: '取消',
    confirm: '确定',
    systemDisk: '系统磁盘',
    dataDisk: '数据磁盘',
  },
}

export default function ShrinkDiskSizeDialog(props){
  const { lang, instanceID, index, open, onSuccess, onCancel } = props;
  const [ operatable, setOperatable ] = React.useState(true);
  const [ prompt, setPrompt ] = React.useState('');
  const [ mounted, setMounted ] = React.useState(false);
  const texts = i18n[lang];
  const title = texts.title;

  const onShrinkFail = React.useCallback(msg =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt(msg);
  }, [mounted]);

  const closeDialog = () =>{
    setPrompt('');
    onCancel();
  }

  const onShrinkSuccess = diskIndex =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    setPrompt('');
    onSuccess(diskIndex, instanceID);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    shrinkInstanceDisk(instanceID, index, onShrinkSuccess, onShrinkFail);
  }

  React.useEffect(()=>{
    if (!open){
      return;
    }
    setMounted(true);
    return ()=> setMounted(false);
  }, [open]);

  let content;
  if (0 === index){
    content = texts.content1 + texts.systemDisk + texts.content2;
  }else{
    content = texts.content1 + texts.dataDisk + index.toString() + texts.content2;
  }
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
  return <CustomDialog size='sm' open={open} prompt={prompt}
    title={title}  buttons={buttons} content={content} operatable={operatable}/>;
};
