import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
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
import { createUser } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Create User',
    user: 'Username',
    password: 'Password',
    password2: 'Confirm Password',
    nick: 'Nickname',
    mail: 'Mail',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '创建用户',
    user: '用户名',
    password: '密码',
    password2: '确认密码',
    nick: '昵称',
    mail: '邮箱',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function CreateUserDialog(props){
  const defaultValues = {
    user: '',
    password: '',
    password2: '',
    nick: '',
    mail: '',
  };
  const { lang, open, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);

  const texts = i18n[lang];
  const onCreateFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    setRequest(defaultValues);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onCreateSuccess = username =>{
    resetDialog();
    onSuccess(username);
  }

  const confirmCreate = () =>{
    const namePattern = new RegExp('[^\\w-.]');

    if(!request.user){
      onCreateFail('must specify user name');
      return;
    }else if (namePattern.test(request.user)){
      onCreateFail("only letter/digit/'-'/'_'/'.' allowed in username");
      return;
    }

    if(!request.password){
      onCreateFail('please input password');
      return;
    }else if (request.password2 !== request.password){
      onCreateFail('password mismatch');
      return;
    }

    createUser(request.user, request.password, request.nick, request.mail, onCreateSuccess, onCreateFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  //begin render
  const content = (
      <Grid container>
        <SingleRow>
          <GridItem xs={12} sm={6} md={4}>
            <Box m={0} pt={2}>
              <TextField
                label={texts.user}
                onChange={handleRequestPropsChanged('user')}
                value={request.user}
                margin="normal"
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
                label={texts.password}
                onChange={handleRequestPropsChanged('password')}
                value={request.password}
                margin="normal"
                type='password'
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
                label={texts.password2}
                onChange={handleRequestPropsChanged('password2')}
                value={request.password2}
                margin="normal"
                type='password'
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
        <Button onClick={confirmCreate} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
