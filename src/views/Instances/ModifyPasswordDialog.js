import React from "react";
import Skeleton from '@material-ui/lab/Skeleton';
import InputList from "components/CustomInput/InputList";
import CustomDialog from "components/Dialog/CustomDialog.js";
import { modifyInstanceAdminPassword, getInstanceAdminPassword } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Admin Password',
    name: 'Admin Name',
    new: 'New Password (generate a new one when blank)',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改管理员密码',
    name: '当前管理员',
    new: '新密码(留空则自动生成)',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyPasswordDialog(props){
  const defaultValues = {
    user: "",
    password: "",
  };
  const { lang, open, instanceID, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
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
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = user =>{
    if(!mounted){
      return;
    }
    setOperatable(true);
    resetDialog();
    onSuccess(user, instanceID);
  }

  const handleConfirm = () =>{
    setPrompt('');
    setOperatable(false);
    modifyInstanceAdminPassword(instanceID, request.user, request.password, onModifySuccess, onModifyFail);
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
    const onGetAdminSuccess = (user, password) =>{
      if(!mounted){
        return;
      }
      setRequest({
        user: user,
        password: password,
      });
      setInitialed(true);
    }

    getInstanceAdminPassword(instanceID,  onGetAdminSuccess, onModifyFail)

    return () => {
      setMounted(false);
    }
  }, [mounted, open, instanceID, onModifyFail]);

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
        value: request.user,
        disabled: true,
        oneRow: true,
        xs: 12,
        sm: 6,
        md: 4,
      },
      {
        type: "password",
        label: texts.new,
        value: request.password,
        onChange: handleRequestPropsChanged('password'),
        required: true,
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
