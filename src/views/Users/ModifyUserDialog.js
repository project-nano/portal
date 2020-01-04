import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SingleRow from "components/Grid/SingleRow.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { getUser, modifyUser } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify User',
    user: 'Username',
    nick: 'Nickname',
    mail: 'Mail',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改用户',
    user: '用户名',
    nick: '昵称',
    mail: '邮箱',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function ModifyUserDialog(props){
  const defaultValues = {
    user: '',
    nick: '',
    mail: '',
  };
  const { lang, name, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const onModifyFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = username =>{
    resetDialog();
    onSuccess(username);
  }

  const confirmModify = () =>{
    modifyUser(request.user, request.nick, request.mail, onModifySuccess, onModifyFail);
  }

  React.useEffect(()=>{
    if (!name || !open || initialed ){
      return;
    }

    const onGetUserSuccess = user =>{
      setRequest({
        user: name,
        nick: user.nick ? user.nick : '',
        mail: user.mail ? user.mail : '',
      })
      setInitialed(true);
    };

    getUser(name, onGetUserSuccess, onModifyFail);

  }, [initialed, open, name]);

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12} sm={6} md={4}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.user}
                value={request.user}
                margin="normal"
                disabled
                required
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={10} md={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.nick}
                onChange={handleRequestPropsChanged('nick')}
                value={request.nick}
                margin="normal"
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
        <SingleRow>
          <GridItem xs={12} sm={10} md={8}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.mail}
                onChange={handleRequestPropsChanged('mail')}
                value={request.mail}
                margin="normal"
                fullWidth
              />
            </Box>
          </GridItem>
        </SingleRow>
      </Grid>
    );
  }

  let prompt;
  if (!error || '' === error){
    prompt = <GridItem xs={12}/>;
  }else{
    prompt = (
      <GridItem xs={12}>
        <SnackbarContent message={error} color="danger"/>
      </GridItem>
    );
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={texts.title}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{texts.title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {content}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmModify} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
